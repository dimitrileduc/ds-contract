/**
 * Chargement des sources du dépôt et parcours du graphe des deux racines.
 * Spec 019, tâche T008.
 *
 * ── Aucune copie, jamais ─────────────────────────────────────────────────────
 * Les contrats, jetons et registres sont LUS à leurs chemins canoniques. Ce
 * module ne les recopie pas sous `integrations/odoo/` : une deuxième copie
 * deviendrait une deuxième source de vérité, et c'est exactement ce que le lock
 * (`inputs.lock.json`) existe pour rendre impossible.
 *
 * ── Le graphe, et pourquoi il est calculé plutôt qu'écrit ────────────────────
 * La fermeture des deux racines est DÉRIVÉE de l'anatomie. L'écrire à la main
 * dans une constante donnerait une liste qui vieillit en silence : le jour où un
 * contrat gagne une référence, la liste manuelle continuerait de dire cinq.
 * Vérifié par exécution au 2026-08-08 : la fermeture rend exactement les cinq
 * contrats attendus, 30 props et 61 parts locales — les chiffres du plan. Seule
 * la fermeture est encore CALCULÉE ici ; les deux comptes étaient portés par un
 * champ que personne ne lisait, et un chiffre que rien ne consomme se périme
 * sans bruit — la vérification ci-dessus reste datée, pas continue.
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
// Le shim de re-export du dépôt, PAS le specifier de paquet `@ds-contracts/schema` :
// celui-ci résout vers `dist/index.js`, qui n'existe qu'après un build du
// workspace. Le shim pointe la seule source Zod vivante
// (`packages/schema/src/contract-schema.ts`) et fonctionne sous `tsx` sans build.
import { ContractSchema, type Contract, type Part } from '../../contract-schema.js';
import { repoPath, repoRelative, sortedBy, canonicalJson, sha256 } from './canonical.js';

/** Les deux seules sections posables. Tout le reste du graphe est interne. */
export const ROOT_CONTRACT_IDS = ['ds.presentation', 'ds.google-reviews'] as const;

/** Sources de jetons réellement lues par le build d'assets. Triées. */
export const TOKEN_SOURCES = [
  'tokens/primitives.tokens.json',
  'tokens/semantic.tokens.json',
  'tokens/modes/semantic.light.tokens.json',
] as const;

/** Registres gouvernés consommés par la fermeture. */
export const REGISTRY_SOURCES = [
  'contracts/icons.registry.json',
  'contracts/named-literals.registry.json',
] as const;

export interface ContractSource {
  readonly id: string;
  readonly version: string;
  /** Chemin relatif au dépôt, séparateurs POSIX. */
  readonly path: string;
  readonly sha256: string;
  readonly contract: Contract;
}

/**
 * Tous les contrats du dépôt, indexés par id, avec leur chemin et leur empreinte.
 *
 * On charge TOUT le répertoire, pas seulement les cinq : `emitHtml` exige un
 * contexte qui contienne chaque dépendance transitive, et une sélection
 * pré-filtrée transformerait une référence oubliée en « contrat absent » tardif
 * plutôt qu'en fermeture correcte.
 */
let cacheContrats: Map<string, ContractSource> | null = null;

export function loadAllContracts(): Map<string, ContractSource> {
  // Mémo de PROCESSUS. `build-assets.ts` appelait cette fonction deux fois (la
  // preuve de déterminisme reconstruit tout), soit 4 passes Zod sur les 34
  // contrats — mesuré à ~43 ms et 1,2 Mo de lecture jetés par invocation. Le
  // répertoire ne bouge pas pendant l'exécution d'un script.
  if (cacheContrats) return cacheContrats;
  const dir = repoPath('contracts');
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.contract.json'))
    .sort(); // `readdirSync` n'est pas trié partout — la reproductibilité l'exige.
  const out = new Map<string, ContractSource>();
  for (const f of files) {
    const abs = path.join(dir, f);
    // UNE lecture, pas deux : le SHA et le parse partagent les mêmes octets.
    // `sha256File(abs)` relisait le fichier juste après ce `readFileSync`.
    const brut = readFileSync(abs);
    const contract = ContractSchema.parse(JSON.parse(brut.toString('utf8')));
    if (out.has(contract.id)) {
      throw new Error(`Deux contrats portent l'id « ${contract.id} » : ${out.get(contract.id)!.path} et ${repoRelative(abs)}`);
    }
    out.set(contract.id, {
      id: contract.id,
      version: contract.version,
      path: repoRelative(abs),
      sha256: sha256(brut),
      contract,
    });
  }
  cacheContrats = out;
  return out;
}

/**
 * Les configs d'authoring PRÉSENTES sur le disque, triées, en absolu.
 *
 * Énumérées plutôt qu'écrites : une liste en dur ne voit pas un fichier ajouté,
 * et une config jamais regardée est une politique jamais vérifiée. La réciproque
 * — une racine dont la config a DISPARU — ne se lit pas ici : elle se lit en
 * comparant les racines couvertes à `ROOT_CONTRACT_IDS`, ce que fait
 * `check-authoring.ts`. Les deux sens sont nécessaires ; le répertoire seul n'en
 * donne qu'un.
 */
export function listAuthoringConfigs(): string[] {
  const dir = repoPath('integrations', 'odoo', 'config');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.authoring.json'))
    .sort()
    .map((f) => path.join(dir, f));
}

// ---------------------------------------------------------------------------
// Parcours de l'anatomie
// ---------------------------------------------------------------------------

export interface LocalPart {
  /** Chemin depuis la racine de l'anatomie, ex. `['root','entete','profil']`. */
  readonly partPath: readonly string[];
  readonly part: Part;
}

/** Toutes les parts locales d'un contrat, en profondeur, ordre déterministe
 *  (clés triées à chaque niveau) — l'ordre d'insertion d'un objet JSON ne l'est
 *  pas assez pour porter un digest. */
export function walkLocalParts(contract: Contract): LocalPart[] {
  const out: LocalPart[] = [];
  const walk = (parts: Record<string, Part> | undefined, prefix: readonly string[]) => {
    for (const key of Object.keys(parts ?? {}).sort()) {
      const part = (parts as Record<string, Part>)[key];
      const partPath = [...prefix, key];
      out.push({ partPath, part });
      walk(part.parts as Record<string, Part> | undefined, partPath);
    }
  };
  walk(contract.anatomy as Record<string, Part>, []);
  return out;
}

/** L'id du contrat référencé par une part, s'il y en a un. Couvre la référence
 *  simple ET la référence répétée (`repeat` + `component`). */
export const referencedContractId = (part: Part): string | null => part.component?.id ?? null;

/**
 * Fermeture de dépendances des racines : la liste TRIÉE des ids de contrat
 * atteignables. Refuse par nom une référence vers un contrat absent — un graphe
 * incomplet donnerait un digest qui a l'air valide.
 */
export function closureOf(rootIds: readonly string[], contracts: Map<string, ContractSource>): string[] {
  const seen = new Set<string>();
  const visit = (id: string, from: string) => {
    if (seen.has(id)) return;
    const src = contracts.get(id);
    if (!src) throw new Error(`Contrat « ${id} » référencé par ${from} mais absent de contracts/.`);
    seen.add(id);
    for (const { partPath, part } of walkLocalParts(src.contract)) {
      const ref = referencedContractId(part);
      if (ref) visit(ref, `${id}:${partPath.join('.')}`);
      for (const item of part.slot?.defaultContent ?? []) visit(item.id, `${id}:${partPath.join('.')} (slot)`);
    }
  };
  for (const id of rootIds) visit(id, '(racine)');
  return [...seen].sort();
}

// ---------------------------------------------------------------------------
// Digest du graphe
// ---------------------------------------------------------------------------

/**
 * Digest canonique de la fermeture : sensible au CONTENU, pas seulement aux
 * versions. Un contrat modifié sans bump de version change le digest — c'est
 * précisément la dérive qu'une comparaison de versions laisse passer.
 */
export function graphDigest(closure: readonly string[], contracts: Map<string, ContractSource>): string {
  const entries = sortedBy(
    closure.map((id) => {
      const src = contracts.get(id);
      if (!src) throw new Error(`Fermeture incohérente : ${id} absent.`);
      return { id: src.id, version: src.version, path: src.path, sha256: src.sha256 };
    }),
    (e) => e.id,
  );
  return sha256(canonicalJson({ schemaVersion: '1.0.0', closure: entries }));
}

// ---------------------------------------------------------------------------
// Vue d'ensemble consommée par les portes
// ---------------------------------------------------------------------------

export interface OdooRepoData {
  readonly contracts: Map<string, ContractSource>;
  /** Ids de la fermeture des deux racines, triés. */
  readonly closure: readonly string[];
  readonly graphDigest: string;
}

export function loadOdooRepoData(): OdooRepoData {
  const contracts = loadAllContracts();
  const closure = closureOf(ROOT_CONTRACT_IDS, contracts);
  return { contracts, closure, graphDigest: graphDigest(closure, contracts) };
}

