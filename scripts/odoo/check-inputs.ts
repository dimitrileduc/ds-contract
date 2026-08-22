/**
 * Le lock d'entrées : construit ou vérifie `integrations/odoo/config/inputs.lock.json`.
 * Spec 019, tâche T010.
 *
 * ── Pourquoi version ET hash, jamais l'un des deux ──────────────────────────
 * La version seule ne détecte pas une modification non bumpée — et c'est le cas
 * réel qui menace 019, puisque la spec 020 travaille en parallèle sur les mêmes
 * contrats. Le hash seul ne porte aucune sémantique : il dit « ça a changé » sans
 * dire si c'est un correctif ou une rupture. Les deux sont requis.
 *
 * ── Ce qu'un drift déclenche, et ce qu'il ne déclenche pas ──────────────────
 * Un drift fait ÉCHOUER la porte. Il ne met pas le lock à jour tout seul : un
 * repin est une action explicite (`--repin`) qui invalide les preuves affectées.
 * Un lock qui se répare seul ne serait pas un lock.
 *
 * Usage :
 *   npx tsx scripts/odoo/check-inputs.ts            # vérifie (défaut)
 *   npx tsx scripts/odoo/check-inputs.ts --repin    # réécrit le lock
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { canonicalJson, repoPath, repoRelative, sha256File } from './lib/canonical.js';
import { validateOrThrow } from './lib/schemas.js';
import {
  REGISTRY_SOURCES,
  ROOT_CONTRACT_IDS,
  SHELL_CONTRACT_IDS,
  TOKEN_SOURCES,
  closureOf,
  loadOdooRepoData,
  type ContractSource,
} from './lib/repo-data.js';
import { runAsCli } from './lib/cli.js';

export const LOCK_PATH = repoPath('integrations', 'odoo', 'config', 'inputs.lock.json');

/** Identité du snapshot. Stable tant que le périmètre des deux racines l'est. */
export const SNAPSHOT_ID = 'odoo-019-foundation';

/**
 * Images épinglées. Elles doivent rester identiques à
 * `integrations/odoo/qa/compose.yaml` et `.env.example` — `check-module.ts` (T015)
 * tient les trois ensemble.
 *
 * `sourceCommit` est le commit local d'Odoo 19 qui sert de référence de source aux
 * APIs du builder (research.md §3). Il documente CE QUI A ÉTÉ LU pour écrire les
 * adaptateurs ; il n'est pas exécuté.
 */
export const ODOO_PIN = {
  image: 'odoo:19.0-20260803',
  sourceCommit: 'ddcf4f8959ed7d185a4dc46195ac5d5a24e26891',
  postgresImage: 'postgres:15',
} as const;

/** Fontes copiées par le build d'assets — la même famille des deux côtés de la
 *  comparaison d'image, ce qui est la condition de toute mesure honnête. */
export const FONT_SOURCES = [400, 500, 600, 700].map(
  (w) => `node_modules/@fontsource/montserrat/files/montserrat-latin-${w}-normal.woff2`,
);

export interface InputSnapshot {
  schemaVersion: '1.0.0';
  snapshotId: string;
  odoo: { image: string; sourceCommit: string; postgresImage: string };
  contracts: Array<{ kind: 'contract'; id: string; version: string; path: string; sha256: string }>;
  tokens: Array<{ kind: string; id: string; path: string; sha256: string }>;
  registries: Array<{ kind: string; id: string; path: string; sha256: string }>;
  assets: Array<{ kind: string; id: string; path: string; sha256: string }>;
  graphDigest: string;
}

const pin = (rel: string, kind: string, id: string) => {
  const abs = repoPath(rel);
  if (!existsSync(abs)) throw new Error(`Entrée épinglée absente du dépôt : ${rel}`);
  return { kind, id, path: repoRelative(abs), sha256: sha256File(abs) };
};

/** Construit le snapshot depuis l'état COURANT du dépôt. */
export function buildSnapshot(): InputSnapshot {
  const data = loadOdooRepoData();
  // Le lock épingle la fermeture des posables ∪ celle du shell (spec 022) : le
  // header entre au lock par sa version + son sha256 par-entrée. Le `graphDigest`
  // reste en revanche celui des SEULES posables (`data.graphDigest`) — il signe
  // la structure du HTML sauvegardé, que le shell (rendu à chaque requête, jamais
  // sauvegardé) ne peut pas rendre périmé. Un changement d'un contrat du shell est
  // donc attrapé par la dérive `content` sur son entrée, pas par le digest.
  const shellClosure = closureOf(SHELL_CONTRACT_IDS, data.contracts);
  const closureIds = [...new Set([...data.closure, ...shellClosure])].sort();
  const contracts = closureIds.map((id) => {
    const src = data.contracts.get(id) as ContractSource;
    return { kind: 'contract' as const, id: src.id, version: src.version, path: src.path, sha256: src.sha256 };
  });
  if (contracts.length < ROOT_CONTRACT_IDS.length) {
    throw new Error(
      `La fermeture des racines ${ROOT_CONTRACT_IDS.join(' + ')} ne contient que ${contracts.length} contrat(s) :\n  ` +
        contracts.map((c) => `${c.id}@${c.version}`).join('\n  '),
    );
  }
  return {
    schemaVersion: '1.0.0',
    snapshotId: SNAPSHOT_ID,
    odoo: { ...ODOO_PIN },
    contracts,
    tokens: TOKEN_SOURCES.map((rel) => pin(rel, 'tokens', path.basename(rel, '.tokens.json'))),
    registries: REGISTRY_SOURCES.map((rel) => pin(rel, 'registry', path.basename(rel, '.registry.json'))),
    assets: FONT_SOURCES.map((rel) => pin(rel, 'font', path.basename(rel, '.woff2'))),
    graphDigest: data.graphDigest,
  };
}

export function readLock(): InputSnapshot {
  if (!existsSync(LOCK_PATH)) {
    throw new Error(
      `Lock absent : ${repoRelative(LOCK_PATH)}\n  Le créer avec : npm run odoo:inputs:check -- --repin`,
    );
  }
  const data = JSON.parse(readFileSync(LOCK_PATH, 'utf8')) as unknown;
  validateOrThrow('input-snapshot', data, repoRelative(LOCK_PATH));
  return data as InputSnapshot;
}

export interface Drift {
  readonly kind: 'added' | 'removed' | 'version' | 'content' | 'field';
  readonly what: string;
  readonly expected: string;
  readonly actual: string;
}

/** Compare le lock à l'état courant. Une liste vide = aucune dérive. */
export function diffSnapshots(lock: InputSnapshot, live: InputSnapshot): Drift[] {
  const drifts: Drift[] = [];
  const scalar = (what: string, expected: string, actual: string) => {
    if (expected !== actual) drifts.push({ kind: 'field', what, expected, actual });
  };
  scalar('snapshotId', lock.snapshotId, live.snapshotId);
  scalar('odoo.image', lock.odoo.image, live.odoo.image);
  scalar('odoo.sourceCommit', lock.odoo.sourceCommit, live.odoo.sourceCommit);
  scalar('odoo.postgresImage', lock.odoo.postgresImage, live.odoo.postgresImage);
  scalar('graphDigest', lock.graphDigest, live.graphDigest);

  const groups = ['contracts', 'tokens', 'registries', 'assets'] as const;
  for (const g of groups) {
    const byPath = new Map(lock[g].map((e) => [e.path, e as Record<string, string>]));
    for (const e of live[g] as Array<Record<string, string>>) {
      const was = byPath.get(e.path);
      if (!was) {
        drifts.push({ kind: 'added', what: `${g}:${e.path}`, expected: '(absent du lock)', actual: e.sha256 });
        continue;
      }
      byPath.delete(e.path);
      if (was.version !== undefined && was.version !== e.version) {
        drifts.push({ kind: 'version', what: `${g}:${e.path}`, expected: was.version, actual: e.version ?? '(aucune)' });
      }
      if (was.sha256 !== e.sha256) {
        drifts.push({ kind: 'content', what: `${g}:${e.path}`, expected: was.sha256, actual: e.sha256 });
      }
    }
    for (const [p, was] of byPath) {
      drifts.push({ kind: 'removed', what: `${g}:${p}`, expected: was.sha256, actual: '(absent du dépôt)' });
    }
  }
  return drifts;
}

function main() {
  const repin = process.argv.includes('--repin');
  const live = buildSnapshot();
  validateOrThrow('input-snapshot', live, 'le snapshot construit depuis le dépôt');

  if (repin) {
    mkdirSync(path.dirname(LOCK_PATH), { recursive: true });
    const avant = existsSync(LOCK_PATH) ? readFileSync(LOCK_PATH, 'utf8') : null;
    const apres = canonicalJson(live);
    writeFileSync(LOCK_PATH, apres);
    console.log(`${avant === null ? 'Lock CRÉÉ' : avant === apres ? 'Lock inchangé' : 'Lock REPINNÉ'} → ${repoRelative(LOCK_PATH)}`);
    console.log(`  ${live.contracts.length} contrats · ${live.tokens.length} source(s) de jetons · ${live.registries.length} registre(s) · ${live.assets.length} asset(s)`);
    console.log(`  graphDigest ${live.graphDigest}`);
    if (avant !== null && avant !== apres) {
      // Un repin n'est pas une formalité : il périme des preuves.
      console.log('\n⚠  Un repin invalide les reçus de qualification produits sous l\'ancien snapshot.');
      console.log('   Rejouer les scénarios affectés avant tout claim (T073).');
    }
    return;
  }

  const lock = readLock();
  const drifts = diffSnapshots(lock, live);
  if (drifts.length === 0) {
    console.log(`✔ Entrées conformes au lock — ${live.contracts.length} contrats, graphDigest ${live.graphDigest.slice(0, 12)}…`);
    for (const c of live.contracts) console.log(`    ${c.id}@${c.version}`);
    return;
  }
  console.error(`✖ ${drifts.length} dérive(s) entre le dépôt et ${repoRelative(LOCK_PATH)} :\n`);
  for (const d of drifts) {
    console.error(`  [${d.kind}] ${d.what}`);
    console.error(`      lock   : ${d.expected}`);
    console.error(`      dépôt  : ${d.actual}`);
  }
  console.error('\nUne dérive ne se répare pas toute seule. Décider, puis :');
  console.error('  npm run odoo:inputs:check -- --repin   (et rejouer les reçus affectés)');
  process.exit(1);
}

runAsCli(import.meta.url, main);
