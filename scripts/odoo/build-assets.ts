/**
 * Le build d'assets : produit les sorties GÉNÉRÉES de l'addon. Spec 019, T012/T013.
 *
 * ── Mince par décision ──────────────────────────────────────────────────────
 * Ce script ne produit NI QWeb, NI options Odoo, NI migration. Il produit
 * exactement ce que le dépôt sait déjà dériver : les jetons, la CSS contractuelle
 * des fermetures déclarées, les fontes. Tout le reste est une source manuelle, comptée
 * comme telle par le rapport de dérivation.
 *
 * `core/emit-html.ts` n'est pas modifié : ajouter un préfixe Odoo à un émetteur
 * vendor-neutral polluerait le core pour une cible. Le préfixage se fait donc ici,
 * en aval, sur le texte CSS produit.
 *
 * ── Ce que « déterministe » exige, concrètement ─────────────────────────────
 *   · l'ordre des racines est TRIÉ, pas celui d'un objet ;
 *   · les blocs CSS identiques sont dédupliqués, donc deux fermetures qui
 *     partageraient une dépendance ne l'écriraient pas deux fois ;
 *   · aucune date, aucun chemin absolu n'entre dans une sortie.
 *
 * ── La sortie de 018 n'est PAS repointée ────────────────────────────────────
 * `scripts/build-tokens.mjs` écrit déjà une feuille préfixée `--pqr-` dans
 * `specs/018-…/module/`. La repointer casserait une preuve historique et son cas
 * d'eval. La sortie de production est additive et isolée : elle est dérivée ici,
 * depuis la même source (`src/styles/tokens.css`), sans toucher à l'autre.
 *
 * Usage :
 *   npx tsx scripts/odoo/build-assets.ts             # écrit
 *   npx tsx scripts/odoo/build-assets.ts --check     # compare sans écrire
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { emitHtml } from '../../core/index.js';
import { loadRepoData } from '../../extract/fidelity-matrix/scripts/lib.js';
import { generatedHeader, repoPath, repoRelative, sha256, sortedBy } from './lib/canonical.js';
import { ROOT_CONTRACT_IDS, closureOf, loadAllContracts } from './lib/repo-data.js';
import { FONT_SOURCES } from './check-inputs.js';
import { runAsCli } from './lib/cli.js';

export const ADDON = repoPath('integrations', 'odoo', 'addons', 'piqueray_ds');
export const GENERATED_CSS = path.join(ADDON, 'static', 'src', 'css', 'generated');
export const FONTS_DIR = path.join(ADDON, 'static', 'src', 'fonts');
export const IMG_DIR = path.join(ADDON, 'static', 'src', 'img');

/** Préfixe des propriétés personnalisées côté Odoo. Odoo sert ses propres
 *  variables CSS sur la même page ; sans préfixe, une collision de nom serait
 *  silencieuse et se lirait comme un défaut de nos composants. */
export const PREFIX = 'pqr-';

/** Le séparateur exact que `core/emit-html.ts` insère avant son habillage de
 *  showcase. C'est un point de coupe STABLE, pas une heuristique — mais s'il
 *  disparaissait, on emporterait le chrome dans la sortie de production sans le
 *  voir. D'où le refus explicite plus bas. */
const CHROME_MARKER = '\n\n/* showcase chrome */\n';

const REGEN = 'npm run odoo:assets';

/** Préfixe déclarations ET références. Les deux, sinon la feuille déclare
 *  `--pqr-x` et référence `var(--x)`, et tout tombe en valeur vide. */
export function prefixCustomProps(css: string): string {
  return css
    .replace(/(^|[\s;{])(--)([\w-]+)(\s*:)/g, (_m, pre: string, dashes: string, name: string, colon: string) =>
      `${pre}${dashes}${PREFIX}${name}${colon}`)
    .replace(/var\(\s*--([\w-]+)/g, (_m, name: string) => `var(--${PREFIX}${name}`);
}

/** Retire l'habillage de showcase de la CSS émise, et REFUSE si le marqueur a
 *  disparu — un émetteur qui change de format ne doit pas nous faire livrer sa
 *  feuille de démonstration en production. */
export function stripShowcaseChrome(css: string, contractId: string): string {
  const at = css.indexOf(CHROME_MARKER);
  if (at < 0) {
    throw new Error(
      `Le marqueur « ${CHROME_MARKER.trim()} » est absent de la CSS de ${contractId}.\n` +
        `  core/emit-html.ts a changé de format : adapter build-assets.ts plutôt que livrer le chrome de showcase.`,
    );
  }
  return css.slice(0, at);
}

export interface Artifact {
  /** Chemin relatif au dépôt. */
  readonly path: string;
  readonly bytes: Buffer;
}

/** Mémo de PROCESSUS, jumeau de celui de `loadAllContracts` (`lib/repo-data.ts`)
 *  — `buildArtifacts()` est appelé deux fois par invocation (la preuve de
 *  déterminisme reconstruit tout), et une troisième par le rapport de
 *  dérivation, chaque appel relisant jetons, icônes et contrats. Les sources ne
 *  bougent pas pendant l'exécution d'un script. */
let cacheRepo: ReturnType<typeof loadRepoData> | null = null;
const repoData = () => (cacheRepo ??= loadRepoData());

/** Construit TOUTES les sorties en mémoire. Aucun effet de bord : c'est ce qui
 *  permet à `--check` de comparer sans jamais écrire. */
export function buildArtifacts(): Artifact[] {
  const repo = repoData();
  const ctx = { tokens: repo.inventory, icons: repo.icons, contracts: repo.contracts };
  const sources = loadAllContracts();
  const roots = [...ROOT_CONTRACT_IDS].sort();

  // --- 1. Jetons : la même source que la surface HTML, préfixée. ------------
  const tokensCss =
    generatedHeader('css', REGEN) +
    `/* Dérivé de src/styles/tokens.css — chaque propriété est préfixée « --${PREFIX} ». */\n\n` +
    prefixCustomProps(repo.tokensCss).trimEnd() +
    '\n';

  // --- 2. CSS contractuelle, dependency-first, dédupliquée. -----------------
  const vus = new Set<string>();
  const blocs: string[] = [];
  for (const rootId of roots) {
    const contract = repo.contracts.get(rootId);
    if (!contract) throw new Error(`Racine « ${rootId} » absente du contexte d'émission.`);
    const brut = stripShowcaseChrome(emitHtml(contract, ctx).css, rootId);
    // `emitHtml` joint ses blocs par contrat avec '\n\n' : la coupe est donc
    // par contrat, ce qui rend la déduplication exacte plutôt qu'approchée.
    for (const bloc of brut.split('\n\n')) {
      const t = bloc.trim();
      if (t.length === 0) continue;
      const k = sha256(t);
      if (vus.has(k)) continue;
      vus.add(k);
      blocs.push(t);
    }
  }
  const fermetures = roots.map((r) => `${r} → ${closureOf([r], sources).join(', ')}`);
  const componentsCss =
    generatedHeader('css', REGEN) +
    `/* Fermetures émises :\n${fermetures.map((f) => ` *   ${f}`).join('\n')}\n */\n\n` +
    prefixCustomProps(blocs.join('\n\n')) +
    '\n';

  // --- 3. Fontes : la même famille des deux côtés de la comparaison. --------
  const fontFaces = sortedBy(FONT_SOURCES, (f) => f).map((rel) => {
    const poids = /montserrat-latin-(\d+)-normal/.exec(rel)?.[1];
    if (!poids) throw new Error(`Nom de fonte inattendu : ${rel}`);
    return [
      '@font-face {',
      "  font-family: 'Montserrat';",
      '  font-style: normal;',
      `  font-weight: ${poids};`,
      '  font-display: swap;',
      `  src: url('/piqueray_ds/static/src/fonts/${path.basename(rel)}') format('woff2');`,
      '}',
    ].join('\n');
  });
  const fontsCss = generatedHeader('css', REGEN) + '\n' + fontFaces.join('\n\n') + '\n';

  const artifacts: Artifact[] = [
    { path: repoRelative(path.join(GENERATED_CSS, 'tokens.pqr.css')), bytes: Buffer.from(tokensCss, 'utf8') },
    { path: repoRelative(path.join(GENERATED_CSS, 'components.pqr.css')), bytes: Buffer.from(componentsCss, 'utf8') },
    { path: repoRelative(path.join(GENERATED_CSS, 'fonts.pqr.css')), bytes: Buffer.from(fontsCss, 'utf8') },
  ];
  for (const rel of sortedBy(FONT_SOURCES, (f) => f)) {
    artifacts.push({
      path: repoRelative(path.join(FONTS_DIR, path.basename(rel))),
      bytes: readFileSync(repoPath(rel)),
    });
  }
  // `img/` est déclaré comme zone générée par le plan. Aucun contrat du périmètre
  // n'apporte d'image de build : les icônes sont des SVG INLINÉS par `emitHtml`,
  // et l'avatar d'un avis est un média Odoo choisi à l'exécution. Le répertoire
  // est donc créé vide et le DIT, plutôt que de laisser croire à un oubli.
  artifacts.push({
    path: repoRelative(path.join(IMG_DIR, 'README.md')),
    bytes: Buffer.from(
      '# `static/src/img/` — zone générée, vide par construction\n\n' +
        'Aucun contrat du périmètre 019 n\'apporte d\'image de build :\n\n' +
        '- les icônes gouvernées sont des SVG **inlinés** par `emitHtml` dans `components.pqr.css`\n' +
        '  et dans le QWeb — il n\'y a pas de fichier à copier ;\n' +
        '- l\'avatar d\'un avis est un média **Odoo**, choisi à l\'exécution par le rédacteur,\n' +
        '  jamais livré par l\'addon.\n\n' +
        'Ce fichier est produit par `' + REGEN + '`. Ne rien déposer ici à la main.\n',
      'utf8',
    ),
  });
  return sortedBy(artifacts, (a) => a.path);
}

export interface ArtifactState {
  readonly path: string;
  readonly status: 'clean' | 'tampered' | 'missing' | 'orphan';
  readonly expectedSha256: string;
  readonly actualSha256: string | null;
  readonly bytes: number;
}

/** Compare l'état du disque aux sorties attendues, sans rien écrire. */
export function inspect(artifacts: readonly Artifact[]): ArtifactState[] {
  const attendus = new Map(artifacts.map((a) => [a.path, a]));
  const etats: ArtifactState[] = [];
  for (const a of artifacts) {
    const abs = repoPath(a.path);
    const expected = sha256(a.bytes);
    if (!existsSync(abs)) {
      etats.push({ path: a.path, status: 'missing', expectedSha256: expected, actualSha256: null, bytes: a.bytes.length });
      continue;
    }
    const actual = sha256(readFileSync(abs));
    etats.push({
      path: a.path,
      status: actual === expected ? 'clean' : 'tampered',
      expectedSha256: expected,
      actualSha256: actual,
      bytes: a.bytes.length,
    });
  }
  // Un fichier présent dans une zone générée mais plus prédit est `orphan` : il
  // serait servi par l'addon sans que rien ne le produise.
  for (const dir of [GENERATED_CSS, FONTS_DIR, IMG_DIR]) {
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).sort()) {
      const rel = repoRelative(path.join(dir, f));
      if (attendus.has(rel)) continue;
      // Un orphelin n'a pas de hash ATTENDU, et personne ne lit le sien : le
      // calculer lisait intégralement un `.woff2` de 18 Ko pour jeter la chaîne.
      etats.push({ path: rel, status: 'orphan', expectedSha256: sha256(''), actualSha256: null, bytes: 0 });
    }
  }
  return sortedBy(etats, (e) => e.path);
}

function main() {
  const check = process.argv.includes('--check');
  const artifacts = buildArtifacts();

  // Déterminisme prouvé À CHAQUE EXÉCUTION, pas seulement dans un eval : une
  // deuxième construction en mémoire doit rendre les mêmes octets.
  const encore = buildArtifacts();
  for (let i = 0; i < artifacts.length; i++) {
    if (!artifacts[i].bytes.equals(encore[i].bytes) || artifacts[i].path !== encore[i].path) {
      throw new Error(`Non déterminisme détecté sur ${artifacts[i].path} : deux constructions diffèrent.`);
    }
  }

  if (check) {
    const etats = inspect(artifacts);
    const sales = etats.filter((e) => e.status !== 'clean');
    for (const e of etats) {
      const marque = e.status === 'clean' ? '✔' : '✖';
      console.log(`  ${marque} ${e.status.padEnd(8)} ${e.path}`);
    }
    if (sales.length > 0) {
      console.error(`\n✖ ${sales.length} sortie(s) générée(s) hors d'état \`clean\`.`);
      console.error(`  Une retouche à la main est indistinguable d'un drift — c'est pourquoi elle est refusée.`);
      console.error(`  Régénérer : ${REGEN}`);
      process.exit(1);
    }
    console.log(`\n✔ ${etats.length} sortie(s) générée(s) conformes, et deux constructions identiques à l'octet.`);
    return;
  }

  mkdirSync(GENERATED_CSS, { recursive: true });
  mkdirSync(FONTS_DIR, { recursive: true });
  mkdirSync(IMG_DIR, { recursive: true });
  // Les zones générées sont RÉÉCRITES intégralement : un fichier orphelin qui
  // survivrait serait servi par l'addon sans que rien ne le produise.
  const attendus = new Set(artifacts.map((a) => a.path));
  for (const dir of [GENERATED_CSS, FONTS_DIR, IMG_DIR]) {
    for (const f of readdirSync(dir).sort()) {
      const rel = repoRelative(path.join(dir, f));
      if (!attendus.has(rel)) {
        rmSync(repoPath(rel), { recursive: true, force: true });
        console.log(`  – orphelin retiré : ${rel}`);
      }
    }
  }
  for (const a of artifacts) {
    writeFileSync(repoPath(a.path), a.bytes);
    console.log(`  ✔ ${String(a.bytes.length).padStart(7)} o  ${a.path}`);
  }
  console.log(`\n${artifacts.length} sortie(s) écrite(s). Vérifier : ${REGEN} -- --check`);
}

runAsCli(import.meta.url, main);
