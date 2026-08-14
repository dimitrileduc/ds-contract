/**
 * La porte de couverture des décisions d'authoring. Spec 019, tâche T011.
 *
 * ── Le principe : AUCUN verdict par défaut ──────────────────────────────────
 * Chaque prop et chaque part atteignable depuis une racine doit porter un verdict
 * EXPLICITE. Une prop oubliée n'est pas « non éditable par défaut » : elle est un
 * trou, et un trou dans une politique d'édition se découvre en production, par un
 * rédacteur qui modifie ce qu'il ne devait pas.
 *
 * ── Occurrences, pas noms ───────────────────────────────────────────────────
 * `ds.button` apparaît DEUX FOIS sous `ds.presentation` : une fois directement
 * (`root.wrapper.Bouton`) et une fois à travers `ds.section-header`
 * (`root.Bouton`). Ce sont deux occurrences distinctes, gouvernables séparément —
 * le CTA de la présentation et celui de l'en-tête ne sont pas le même bouton.
 * Une table indexée par nom de prop les confondrait. L'adresse canonique est donc
 * le `componentPath` complet, jamais un nom court.
 *
 * ── Les cinq refus ──────────────────────────────────────────────────────────
 *   manquant   — une occurrence sans décision
 *   surnuméraire — une décision qui ne résout vers aucune occurrence
 *   doublon    — deux décisions sur la même adresse canonique
 *   ambigu     — un `viaPart` qui désigne plus d'une part
 *   incohérent — un `contentKind`/`mechanism` incompatible avec le contrat, ou un
 *                sélecteur non préfixé par la racine du snippet
 *
 * Usage :
 *   npx tsx scripts/odoo/check-authoring.ts
 *   npx tsx scripts/odoo/check-authoring.ts --config <fichier> [--config <fichier>]
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { repoPath, repoRelative } from './lib/canonical.js';
import { validateOrThrow } from './lib/schemas.js';
import { ROOT_CONTRACT_IDS, listAuthoringConfigs, loadAllContracts, walkLocalParts, type ContractSource } from './lib/repo-data.js';
import type { Contract, Part } from '../contract-schema.js';
import { runAsCli } from './lib/cli.js';


/** Préfixe de sélecteur imposé par racine. Un sélecteur non préfixé fuirait
 *  d'une instance à l'autre : deux Présentations sur la même page partageraient
 *  leurs contrôles. */
export const ROOT_SELECTOR: Record<string, string> = {
  'ds.presentation': '.s_pqr_presentation',
  'ds.google-reviews': '.s_pqr_google_reviews',
  'ds.hero': '.s_pqr_hero',
  'ds.equipe': '.s_pqr_equipe',
  'ds.sav': '.s_pqr_sav',
  'ds.devis': '.s_pqr_devis',
  'ds.texte-seo': '.s_pqr_texte_seo',
  'ds.faq': '.s_pqr_faq',
};

// ---------------------------------------------------------------------------
// Types du document (miroir du schéma, validé avant usage)
// ---------------------------------------------------------------------------

interface ContractRef { id: string; version: string }
interface ComponentSegment { contract: ContractRef; viaPart?: string; repeat?: boolean }
interface PropAddress { componentPath: ComponentSegment[]; prop: string }
interface PartAddress { componentPath: ComponentSegment[]; partPath: string[] }
interface ControlDecision {
  decisionId: string; address: PropAddress; verdict: string; mechanism: string;
  targetSelector?: string; label?: string; reasonCode?: string;
}
interface PartDecision {
  decisionId: string; address: PartAddress; verdict: string; contentKind: string;
  selector: string; allowedMarks: string[]; reasonCode?: string;
}
export interface AuthoringConfig {
  schemaVersion: string; configId: string; authoringVersion: string; snapshotId: string;
  rootContract: ContractRef;
  rootActions: Array<{ action: string; verdict: string; reasonCode?: string }>;
  controls: ControlDecision[];
  parts: PartDecision[];
}

// ---------------------------------------------------------------------------
// Matérialisation des occurrences
// ---------------------------------------------------------------------------

export interface Occurrence {
  /** Le chemin de composants, chaque segment portant le contrat et la part qui y mène. */
  readonly componentPath: ReadonlyArray<{ contract: ContractRef; viaPart?: string; repeat: boolean }>;
  readonly contract: Contract;
}

/** Clé canonique d'une occurrence — la seule identité qui compte. */
export const occurrenceKey = (p: Occurrence['componentPath']): string =>
  p.map((s, i) => (i === 0 ? s.contract.id : `${s.viaPart}→${s.contract.id}${s.repeat ? '[]' : ''}`)).join(' / ');

export const propKey = (p: Occurrence['componentPath'], prop: string): string => `${occurrenceKey(p)} :: prop ${prop}`;
export const partKey = (p: Occurrence['componentPath'], partPath: readonly string[]): string =>
  `${occurrenceKey(p)} :: part ${partPath.join('.')}`;

/**
 * Toutes les occurrences de composant atteignables depuis une racine.
 * REFUSE un cycle : un graphe cyclique produirait une matérialisation infinie.
 */
export function materialize(rootId: string, contracts: Map<string, ContractSource>): Occurrence[] {
  const out: Occurrence[] = [];
  const walk = (id: string, pathSoFar: Occurrence['componentPath'], seenIds: readonly string[]) => {
    const src = contracts.get(id);
    if (!src) throw new Error(`Contrat « ${id} » absent de contracts/.`);
    if (seenIds.includes(id)) {
      throw new Error(`Cycle de composition : ${[...seenIds, id].join(' → ')}`);
    }
    out.push({ componentPath: pathSoFar, contract: src.contract });
    for (const { partPath, part } of walkLocalParts(src.contract)) {
      const childId = part.component?.id;
      if (!childId) continue;
      const child = contracts.get(childId);
      if (!child) throw new Error(`Contrat « ${childId} » référencé par ${id}:${partPath.join('.')} mais absent.`);
      walk(
        childId,
        [...pathSoFar, { contract: { id: child.id, version: child.version }, viaPart: partPath[partPath.length - 1], repeat: Boolean(part.repeat) }],
        [...seenIds, id],
      );
    }
  };
  const root = contracts.get(rootId);
  if (!root) throw new Error(`Racine « ${rootId} » absente de contracts/.`);
  walk(rootId, [{ contract: { id: root.id, version: root.version }, repeat: false }], []);
  return out;
}

/** Résout le `componentPath` d'une décision vers UNE occurrence, ou dit pourquoi
 *  il n'y arrive pas. */
export function resolvePath(
  declared: ComponentSegment[],
  occurrences: readonly Occurrence[],
  contracts: Map<string, ContractSource>,
): { ok: Occurrence } | { erreur: string } {
  if (declared.length === 0) return { erreur: 'componentPath vide' };
  const candidats = occurrences.filter((o) => {
    if (o.componentPath.length !== declared.length) return false;
    return declared.every((seg, i) => {
      const real = o.componentPath[i];
      if (real.contract.id !== seg.contract.id) return false;
      if (real.contract.version !== seg.contract.version) return false;
      if (i > 0 && seg.viaPart !== undefined && real.viaPart !== seg.viaPart) return false;
      return true;
    });
  });
  if (candidats.length === 1) return { ok: candidats[0] };
  if (candidats.length === 0) {
    // Distinguer « version fausse » de « chemin faux » : le message doit orienter.
    const parVersion = declared.find((seg) => {
      const src = contracts.get(seg.contract.id);
      return src !== undefined && src.version !== seg.contract.version;
    });
    if (parVersion) {
      const src = contracts.get(parVersion.contract.id)!;
      return { erreur: `version épinglée ${parVersion.contract.id}@${parVersion.contract.version}, le dépôt porte @${src.version}` };
    }
    return { erreur: `chemin sans occurrence : ${declared.map((s) => (s.viaPart ? `${s.viaPart}→` : '') + s.contract.id).join(' / ')}` };
  }
  return {
    erreur: `chemin AMBIGU — ${candidats.length} occurrences correspondent : ${candidats.map((c) => occurrenceKey(c.componentPath)).join(' | ')}. Préciser \`viaPart\`.`,
  };
}

/** La part locale désignée par un `partPath`, ou `null`. Le joker `*` accepte
 *  n'importe quel segment (voir `partPathSegment` du schéma). */
export function findPart(contract: Contract, partPath: readonly string[]): Part | null {
  let level = contract.anatomy as Record<string, Part> | undefined;
  let part: Part | null = null;
  for (const seg of partPath) {
    if (!level) return null;
    const keys = seg === '*' ? Object.keys(level).sort() : [seg];
    if (keys.length !== 1 || level[keys[0]] === undefined) return null;
    part = level[keys[0]];
    level = part.parts as Record<string, Part> | undefined;
  }
  return part;
}

// ---------------------------------------------------------------------------
// Cohérence contenu ⟷ contrat
// ---------------------------------------------------------------------------

/**
 * Le type d'une prop, réduit à une clé. Le schéma de contrat porte soit une
 * chaîne (`text`, `rich-text`, `boolean`, `number`), soit un objet
 * (`{ enum: [...] }`, `{ arrayOf: {...} }`). Les cinq contrats du périmètre
 * exercent les cinq formes — vérifié par lecture, pas supposé.
 */
export function propTypeKey(type: unknown): string {
  if (typeof type === 'string') return type;
  if (type && typeof type === 'object') {
    if ('enum' in type) return 'enum';
    if ('arrayOf' in type) return 'arrayOf';
  }
  return 'inconnu';
}

/** Types de prop du contrat → mécanismes acceptables pour un verdict `controlled`. */
const MECANISMES_PAR_TYPE: Record<string, readonly string[]> = {
  text: ['plain-text', 'rich-text', 'computed-display'],
  'rich-text': ['rich-text'],
  boolean: ['boolean', 'computed-display'],
  number: ['number', 'ordered-repeat', 'computed-display'],
  enum: ['enum', 'computed-display'],
  // Une prop `arrayOf` EST la collection : le seul mécanisme qui la gouverne est
  // le repeat ordonné. `media` y était admis « parce que la collection d'avis
  // porte les avatars » — raisonnement faux, relevé en revue le 2026-08-08 :
  // l'avatar est une prop DE LA CARTE, adressée par son propre componentPath,
  // pas la collection. L'admettre ici aurait laissé passer un verdict `media`
  // sur la liste entière, c'est-à-dire une décision qui ne veut rien dire.
  arrayOf: ['ordered-repeat', 'computed-display'],
};

/** Le `contentKind` cohérent avec une part du contrat. */
function contentKindsFor(part: Part): string[] {
  if (part.repeat) return ['repeat'];
  if (part.component || part.slot) return ['component'];
  if (part.element === 'img' || part.vectorAsset || part.icon) return ['media', 'structural'];
  // Le contrat ne distingue PAS texte simple de texte riche : c'est une décision
  // d'authoring, pas un fait du contrat. Les trois valeurs restent donc
  // acceptables pour toute part non-composant. (Une version antérieure calculait
  // un `porteTexte` puis rendait les MÊMES trois valeurs dans un autre ordre —
  // une distinction affichée que le code ne faisait pas.)
  return ['plain-text', 'rich-text', 'structural'];
}

// ---------------------------------------------------------------------------
// Contrôle d'une config
// ---------------------------------------------------------------------------

export interface Rapport {
  readonly source: string;
  readonly rootId: string;
  readonly expectedProps: number;
  readonly decidedProps: number;
  readonly expectedParts: number;
  readonly decidedParts: number;
  readonly missing: string[];
  readonly extra: string[];
  readonly problemes: string[];
}

export function checkConfig(config: AuthoringConfig, source: string, contracts: Map<string, ContractSource>): Rapport {
  const rootId = config.rootContract.id;
  const prefix = ROOT_SELECTOR[rootId];
  const occurrences = materialize(rootId, contracts);

  // Attendu : toutes les props et parts de toutes les occurrences.
  const attenduProps = new Set<string>();
  const attenduParts = new Set<string>();
  for (const occ of occurrences) {
    for (const p of occ.contract.props ?? []) attenduProps.add(propKey(occ.componentPath, p.name));
    for (const { partPath } of walkLocalParts(occ.contract)) attenduParts.add(partKey(occ.componentPath, partPath));
  }

  const problemes: string[] = [];
  const vusProps = new Map<string, string>();
  const vusParts = new Map<string, string>();
  const decisionIds = new Set<string>();
  const extra: string[] = [];

  const noteId = (id: string, quoi: string) => {
    if (decisionIds.has(id)) problemes.push(`decisionId dupliqué « ${id} » (${quoi})`);
    decisionIds.add(id);
  };

  if (config.rootContract.version !== contracts.get(rootId)?.version) {
    problemes.push(
      `rootContract ${rootId}@${config.rootContract.version} ; le dépôt porte @${contracts.get(rootId)?.version ?? '(absent)'}`,
    );
  }
  if (!prefix) problemes.push(`racine « ${rootId} » hors des sections posables (${ROOT_CONTRACT_IDS.join(', ')})`);

  for (const d of config.controls) {
    noteId(d.decisionId, 'control');
    const res = resolvePath(d.address.componentPath, occurrences, contracts);
    if ('erreur' in res) {
      problemes.push(`control « ${d.decisionId} » : ${res.erreur}`);
      extra.push(d.decisionId);
      continue;
    }
    const prop = (res.ok.contract.props ?? []).find((p) => p.name === d.address.prop);
    if (!prop) {
      problemes.push(`control « ${d.decisionId} » : prop « ${d.address.prop} » inconnue de ${res.ok.contract.id}`);
      extra.push(d.decisionId);
      continue;
    }
    const key = propKey(res.ok.componentPath, prop.name);
    const segCtl = d.address.componentPath[d.address.componentPath.length - 1];
    const repeatReelCtl = res.ok.componentPath[res.ok.componentPath.length - 1]?.repeat ?? false;
    if (Boolean(segCtl?.repeat) !== repeatReelCtl) {
      problemes.push(
        `control « ${d.decisionId} » : \`repeat\` déclaré ${Boolean(segCtl?.repeat)} alors que le contrat porte ${repeatReelCtl} sur ${occurrenceKey(res.ok.componentPath)}`,
      );
    }
    if (vusProps.has(key)) problemes.push(`DOUBLON sur ${key} — « ${vusProps.get(key)} » et « ${d.decisionId} »`);
    vusProps.set(key, d.decisionId);
    if (!attenduProps.has(key)) extra.push(d.decisionId);

    if (d.verdict === 'controlled') {
      const typeKey = propTypeKey(prop.type);
      const autorises = MECANISMES_PAR_TYPE[typeKey] ?? [];
      if (autorises.length > 0 && !autorises.includes(d.mechanism)) {
        problemes.push(
          `control « ${d.decisionId} » : mécanisme « ${d.mechanism} » incohérent avec une prop de type « ${typeKey} » (attendu : ${autorises.join(', ')})`,
        );
      }
      if (d.targetSelector && prefix && !d.targetSelector.startsWith(prefix)) {
        problemes.push(
          `control « ${d.decisionId} » : sélecteur « ${d.targetSelector} » non préfixé par « ${prefix} » — il fuirait vers les autres instances`,
        );
      }
    }
  }

  for (const d of config.parts) {
    noteId(d.decisionId, 'part');
    const res = resolvePath(d.address.componentPath, occurrences, contracts);
    if ('erreur' in res) {
      problemes.push(`part « ${d.decisionId} » : ${res.erreur}`);
      extra.push(d.decisionId);
      continue;
    }
    const part = findPart(res.ok.contract, d.address.partPath);
    if (!part) {
      problemes.push(`part « ${d.decisionId} » : chemin « ${d.address.partPath.join('.')} » inconnu de ${res.ok.contract.id}`);
      extra.push(d.decisionId);
      continue;
    }
    const key = partKey(res.ok.componentPath, d.address.partPath);
    // Le `repeat` DÉCLARÉ dans l'adresse doit correspondre au contrat. Une
    // décision qui prétend viser toutes les cartes alors que la part n'est pas
    // répétée — ou l'inverse — gouverne autre chose que ce qu'elle annonce, et
    // rien ne l'aurait dit. Trouvé en revue le 2026-08-08.
    const dernierSegment = d.address.componentPath[d.address.componentPath.length - 1];
    const repeatDeclare = Boolean(dernierSegment?.repeat);
    const repeatReel = res.ok.componentPath[res.ok.componentPath.length - 1]?.repeat ?? false;
    if (repeatDeclare !== repeatReel) {
      problemes.push(
        `part « ${d.decisionId} » : \`repeat\` déclaré ${repeatDeclare} alors que le contrat porte ${repeatReel} sur ${occurrenceKey(res.ok.componentPath)}`,
      );
    }
    if (vusParts.has(key)) problemes.push(`DOUBLON sur ${key} — « ${vusParts.get(key)} » et « ${d.decisionId} »`);
    vusParts.set(key, d.decisionId);
    if (!attenduParts.has(key)) extra.push(d.decisionId);

    const kinds = contentKindsFor(part);
    if (!kinds.includes(d.contentKind)) {
      problemes.push(
        `part « ${d.decisionId} » : contentKind « ${d.contentKind} » incohérent avec la part du contrat (attendu : ${kinds.join(', ')})`,
      );
    }
    if (prefix && !d.selector.startsWith(prefix)) {
      problemes.push(`part « ${d.decisionId} » : sélecteur « ${d.selector} » non préfixé par « ${prefix} »`);
    }
  }

  const missing = [
    ...[...attenduProps].filter((k) => !vusProps.has(k)),
    ...[...attenduParts].filter((k) => !vusParts.has(k)),
  ].sort();

  return {
    source,
    rootId,
    expectedProps: attenduProps.size,
    decidedProps: vusProps.size,
    expectedParts: attenduParts.size,
    decidedParts: vusParts.size,
    missing,
    extra: [...new Set(extra)].sort(),
    problemes,
  };
}

export function checkConfigFile(abs: string, contracts: Map<string, ContractSource>): Rapport {
  const label = existsSync(abs) ? repoRelative(abs) : abs;
  const data = JSON.parse(readFileSync(abs, 'utf8')) as unknown;
  validateOrThrow('authoring-config', data, label);
  return checkConfig(data as AuthoringConfig, label, contracts);
}

function main() {
  const argv = process.argv.slice(2);
  const explicites: string[] = [];
  argv.forEach((a, i) => {
    if (a === '--config' && argv[i + 1]) explicites.push(path.resolve(argv[i + 1]));
  });
  // Par défaut : TOUTES les configs présentes, énumérées et non listées à la
  // main — sans quoi une troisième config déposée ici ne serait jamais lue.
  const cibles = explicites.length > 0 ? explicites : listAuthoringConfigs();

  const contracts = loadAllContracts();
  let rouge = 0;
  const absentes: string[] = [];
  const couvertes = new Set<string>();

  for (const abs of cibles) {
    if (!existsSync(abs)) {
      absentes.push(repoRelative(abs));
      continue;
    }
    const r = checkConfigFile(abs, contracts);
    couvertes.add(r.rootId);
    const dur = r.missing.length + r.extra.length + r.problemes.length;
    console.log(`\n${dur === 0 ? '✔' : '✖'} ${r.source}  (racine ${r.rootId})`);
    console.log(`    props ${r.decidedProps}/${r.expectedProps} · parts ${r.decidedParts}/${r.expectedParts}`);
    for (const p of r.problemes) console.log(`    ! ${p}`);
    for (const m of r.missing.slice(0, 25)) console.log(`    manquant : ${m}`);
    if (r.missing.length > 25) console.log(`    … et ${r.missing.length - 25} autre(s) verdict(s) manquant(s)`);
    for (const e of r.extra) console.log(`    surnuméraire : ${e}`);
    if (dur > 0) rouge++;
  }

  // L'autre sens du même contrôle. Énumérer le répertoire voit une config EN
  // TROP mais pas une config DISPARUE : sans cette boucle, supprimer
  // `presentation.authoring.json` viderait la liste des cibles et la porte
  // passerait au vert en n'ayant plus rien à vérifier. Les racines sont la
  // référence, pas le contenu du répertoire.
  if (explicites.length === 0) {
    const nonCouvertes = ROOT_CONTRACT_IDS.filter((id) => !couvertes.has(id));
    if (nonCouvertes.length > 0) {
      console.log(`\n✖ ${nonCouvertes.length} racine(s) posable(s) sans config d'authoring :`);
      for (const id of nonCouvertes) console.log(`    ${id}`);
      rouge += nonCouvertes.length;
    }
  }

  if (absentes.length > 0) {
    // Une config absente n'est PAS un succès. Elle est nommée, et rouge.
    console.log(`\n✖ ${absentes.length} config(s) d'authoring absente(s) :`);
    for (const a of absentes) console.log(`    ${a}`);
    console.log('    Elles sont écrites avec l\'owner par T026 (GoogleReviews) et T042 (Presentation).');
    rouge += absentes.length;
  }

  if (rouge > 0) {
    console.log(`\n${rouge} config(s) en défaut.`);
    process.exit(1);
  }
  console.log('\nToutes les configs couvrent leur graphe.');
}

runAsCli(import.meta.url, main);
