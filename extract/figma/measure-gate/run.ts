/**
 * `npm run measure:gate` — the thin CLI around `gate.ts`'s pure policy
 * (014, FR-007, FR-011; contracts/measure-gate.interface.md).
 *
 *   npx tsx extract/figma/measure-gate/run.ts             # human-readable
 *   npx tsx extract/figma/measure-gate/run.ts --json       # machine verdict
 *   npx tsx extract/figma/measure-gate/run.ts --explain    # refusals, verbose
 *
 * All the I/O lives here, none of it in gate.ts: read the artifacts the two
 * instruments and this feature's own registers already produced, flatten
 * them into gate.ts's `MeasureGateInput` shape, and apply the exit code.
 * Nothing here re-measures anything — no Chromium, no Figma request; a
 * stale `out/rows.json` is a reason to re-run `npm run extract:figma:visual`
 * first, not something this CLI does for you.
 *
 * Exit codes (contracts/measure-gate.interface.md §2):
 *   0 pass    — the four conditions are held.
 *   1 fail    — at least one is missing (gate.ts's own verdict).
 *   2 blocked — the artifacts themselves are unusable (missing file,
 *               invalid JSON) — decided HERE, before gate.ts is ever
 *               called: a pure function that touches no filesystem cannot
 *               itself observe "the filesystem is unusable".
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  evaluateMeasureGate,
  type DiscoveredDeferredWork,
  type MeasuredLine,
  type MeasureGateInput,
  type MeasureGateResult,
  type ReceiptRecord,
  type ReclassifiedDwEntry,
} from './gate.js';
import { CAUSE_LABELS, RETIRED_RULES, triageFor } from '../visual-parity/triage.js';
import { PARITY_SUBJECTS } from '../visual-parity/subjects.js';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const CONTRACTS_DIR = path.join(REPO, 'contracts');
const VISUAL_ROWS = path.join(REPO, 'extract/figma/visual-parity/out/rows.json');
const SPEC_014 = path.join(REPO, 'specs/014-mesure-juste-triage');
// --apres <path> (015, T003b): overrides ONLY the apres.json this CLI reads
// for measured-line SCORES — default unchanged (014, retro-compatible).
// causes.json and recus/ are NOT parameterized: they stay the porte de
// mesure's one live register (aggregateOf/resolvedBy — measure-gate-
// counting-v2.md §1) and the receipt corpus C4 reads, neither of which 015
// relocates ("Où vont les reçus", tasks.md § Conventions). Without --apres
// the gate would evaluate 014's frozen registre forever: footer/texte-seo/
// coordonnees would keep their pre-015 gaps no matter what 015 repairs, and
// contract-geometry could never drop below 3 — SC-005 would be unreachable.
const apresIdx = process.argv.indexOf('--apres');
const APRES_PATH =
  apresIdx !== -1 && apresIdx + 1 < process.argv.length
    ? path.resolve(process.argv[apresIdx + 1])
    : path.join(SPEC_014, 'proofs/registre/apres.json');
const CAUSES_PATH = path.join(SPEC_014, 'proofs/registre/causes.json');
const RECUS_DIR = path.join(SPEC_014, 'proofs/recus');
const CAMPAIGN_013 = path.join(REPO, 'specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json');

const JSON_MODE = process.argv.includes('--json');
const EXPLAIN = process.argv.includes('--explain');
const WRITE_CLOSURE_REPORT = process.argv.includes('--write-closure-report');
const CLOSURE_REPORT_PATH = path.join(SPEC_014, 'proofs/RAPPORT-CLOTURE.md');

const readJson = (p: string): any => JSON.parse(readFileSync(p, 'utf8'));

// ---------------------------------------------------------------------------
// "blocked" (exit 2) — decided here, before gate.ts runs at all. Fail-closed:
// an absent artifact is a refusal, never treated as "nothing to check".
// ---------------------------------------------------------------------------
interface BlockedReason {
  code: string;
  subject: string;
  message: string;
}

function blocked(reasons: BlockedReason[]): never {
  const result = {
    schemaVersion: 1,
    verdict: 'blocked' as const,
    exitCode: 2 as const,
    refusals: reasons,
  };
  if (JSON_MODE) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.error('✗ measure:gate BLOCKED — the entries themselves are unusable:');
    for (const r of reasons) console.error(`  · ${r.code}: ${r.subject} — ${r.message}`);
  }
  process.exit(2);
}

const REQUIRED_ARTIFACTS: Array<{ path: string; subject: string; hint: string }> = [
  { path: CONTRACTS_DIR, subject: 'contracts/', hint: 'the governed contract directory is missing entirely' },
  {
    path: VISUAL_ROWS,
    subject: 'extract/figma/visual-parity/out/rows.json',
    hint: 'run `npm run extract:figma:visual` first',
  },
  {
    path: APRES_PATH,
    // Live path, not a hardcoded 014 string (I-6.2: never anonymous) — with
    // --apres pointed elsewhere, a `blocked` refusal must name what it
    // actually tried to read, not what the default would have been.
    subject: path.relative(REPO, APRES_PATH),
    hint: 'run `npx tsx extract/figma/organism-audit/tools/build-registre.mts --phase apres [--out-dir <dir>]` first',
  },
  {
    path: CAUSES_PATH,
    subject: 'specs/014-mesure-juste-triage/proofs/registre/causes.json',
    hint: 'the causes register (US2/US5) has not been written',
  },
  { path: RECUS_DIR, subject: 'specs/014-mesure-juste-triage/proofs/recus/', hint: 'no receipts have been published' },
  {
    path: CAMPAIGN_013,
    subject: 'specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json',
    hint: '013\'s campaign manifest is missing',
  },
];

const missingArtifacts = REQUIRED_ARTIFACTS.filter((a) => !existsSync(a.path));
if (missingArtifacts.length > 0) {
  blocked(
    missingArtifacts.map((a) => ({ code: 'artifact-missing', subject: a.subject, message: a.hint })),
  );
}

let contractIds: string[];
let rows: any;
let apres: any;
let causes: any;
let campaign013: any;
const receipts: Record<string, ReceiptRecord> = {};

try {
  contractIds = readdirSync(CONTRACTS_DIR)
    .filter((f) => f.endsWith('.contract.json'))
    .map((f) => readJson(path.join(CONTRACTS_DIR, f)).id);
  rows = readJson(VISUAL_ROWS);
  apres = readJson(APRES_PATH);
  causes = readJson(CAUSES_PATH);
  campaign013 = readJson(CAMPAIGN_013);
  for (const file of readdirSync(RECUS_DIR).filter((f) => f.endsWith('.json'))) {
    const r = readJson(path.join(RECUS_DIR, file));
    if (!r?.id) continue;
    receipts[r.id] = { id: r.id, verdict: r.verdict ?? null, date: r.date ?? null, claim: r.claim ?? null };
  }
} catch (err) {
  blocked([
    {
      code: 'artifact-unreadable',
      subject: 'preflight',
      message: err instanceof Error ? err.message : String(err),
    },
  ]);
}

if (!Array.isArray(rows.rows)) blocked([{ code: 'schema-unknown', subject: 'rows.json', message: '"rows" is not an array' }]);
if (!Array.isArray(apres.lines)) blocked([{ code: 'schema-unknown', subject: 'apres.json', message: '"lines" is not an array' }]);
if (!Array.isArray(causes.organismLines) || !Array.isArray(causes.entries) || !Array.isArray(causes.deferredWork)) {
  blocked([{ code: 'schema-unknown', subject: 'causes.json', message: 'expected "organismLines", "entries" and "deferredWork" arrays' }]);
}

// ---------------------------------------------------------------------------
// contractId lookups — subject/subjectId -> ds.* contract id.
// ---------------------------------------------------------------------------
const parityContractBySubject = new Map<string, string>();
for (const s of PARITY_SUBJECTS) {
  if (s.kind === 'contract') parityContractBySubject.set(s.id, s.contractId);
}
const organismContractBySubject = new Map<string, string>();
for (const s of campaign013.subjects ?? []) {
  if (typeof s.contractId === 'string') organismContractBySubject.set(s.id, s.contractId);
}

// ---------------------------------------------------------------------------
// visual-parity lines — rows.json for the score/status (live, full
// precision); triageFor() recomputed here (not rows.json's own serialized
// `causeClass`/`cause` strings) because it is the ONLY source that also
// carries `receiptId` — rows.json's machine receipt never serialized it.
// Deterministic and side-effect-free, so recomputing costs nothing and
// cannot drift from what `npm run extract:figma:visual` itself computed.
// ---------------------------------------------------------------------------
const IMPEDED_STATUSES = new Set(['skipped', 'refused', 'figma-declined']);

const visualLines: MeasuredLine[] = (rows.rows as any[]).map((r): MeasuredLine => {
  const rule = triageFor(r.subject, r.variant);
  // Impeded rows carry no TRIAGE rule (TRIAGE explains SCORE divergence; an
  // impeded row has no score) — their receipt is named by convention
  // `<subject>-<status>` (button-with-icons-skipped, piqueray-logo-refused,
  // both established at T028/T029). Only assigned when it actually
  // resolves — gate.ts's C2 re-checks resolution independently regardless,
  // so a wrong guess here fails closed rather than passing silently.
  const impededReceiptId = IMPEDED_STATUSES.has(r.status) ? `${r.subject}-${r.status}` : null;
  return {
    instrument: 'visual-parity',
    key: r.key,
    contractId: parityContractBySubject.get(r.subject) ?? null,
    rawPct: r.rawPct,
    cause: rule?.class ?? null,
    causeText: rule?.cause ?? null,
    causeReceiptId: rule?.receiptId ?? impededReceiptId,
  };
});

// ---------------------------------------------------------------------------
// organism-audit lines — apres.json for BOTH the score and the
// referenceProvenance: it is the only place all nine organisms' provenance
// can be read without re-rendering the eight dossiers D10 forbids touching
// (contracts/measure-gate.interface.md §3). causes.json's `organismLines`
// supplies the cause + receipt, joined by key.
// ---------------------------------------------------------------------------
const organismCauseByKey = new Map<string, { cause: string; receiptId: string; aggregateOf?: string[] }>();
for (const o of causes.organismLines as any[]) {
  organismCauseByKey.set(o.key, { cause: o.cause, receiptId: o.receiptId, aggregateOf: o.aggregateOf });
}

const organismLines: MeasuredLine[] = (apres.lines as any[])
  .filter((l) => l.instrument === 'organism-audit')
  .map((l): MeasuredLine => {
    const subjectId = l.key.split('/')[0];
    const causeEntry = organismCauseByKey.get(l.key);
    return {
      instrument: 'organism-audit',
      key: l.key,
      contractId: organismContractBySubject.get(subjectId) ?? null,
      rawPct: l.after?.rawPct ?? null,
      cause: causeEntry?.cause ?? null,
      causeReceiptId: causeEntry?.receiptId ?? null,
      referenceProvenance: l.referenceProvenance ?? null,
      // 015 — measure-gate-counting-v2.md §2: organismLines[].aggregateOf →
      // MeasuredLine.aggregateOf (the footer/DW-001/004/005 shape).
      aggregateOf: causeEntry?.aggregateOf,
    };
  });

// ---------------------------------------------------------------------------
// The three organism-audit subjects `apres.json` never measures at all
// (equipe, formulaire, header — wave 3, a closed dependencyGate, zero
// cases; `build-registre.mts` only re-measures waves 1+2). Without an
// explicit line for them, C2 sees a true absence and refuses
// component-without-measurement — correctly, since they ARE otherwise
// invisible to both instruments. 013's own committed audit already declared
// them `blocked` with a receipt (T031's re-test, `organism-blockages-retest`,
// confirms the blockage still holds rather than being a stale-pin artifact
// alone) — I-1.3's "measured OR declared non-probative with receipt" is
// exactly this shape, so each becomes one impeded line (rawPct null, no
// cause — a blocked organism has nothing to attribute a SCORE to). Never a
// C3 subject either (see gate.ts): zero cases means zero reference to check.
// ---------------------------------------------------------------------------
const BLOCKED_RETEST_RECEIPT = 'organism-blockages-retest';
const blockedOrganismLines: MeasuredLine[] = (campaign013.subjects as any[])
  .filter((s) => {
    const resultPath = path.join(REPO, 'specs/013-auditer-fidelite-organismes/proofs/organisms', s.id, 'result.json');
    if (!existsSync(resultPath)) return false;
    return readJson(resultPath).verdict === 'blocked';
  })
  .map(
    (s): MeasuredLine => ({
      instrument: 'organism-audit',
      key: `${s.id}/blocked`,
      contractId: typeof s.contractId === 'string' ? s.contractId : null,
      rawPct: null,
      cause: null,
      causeReceiptId: receipts[BLOCKED_RETEST_RECEIPT] ? BLOCKED_RETEST_RECEIPT : null,
    }),
  );

// ---------------------------------------------------------------------------
// causes.json's two DW registers — never conflated (receipts.schema.md §4
// ter): `entries` is 013's register, re-classified; `deferredWork` is what
// 014 itself surfaced and did not fix.
// ---------------------------------------------------------------------------
const reclassifiedDwEntries: ReclassifiedDwEntry[] = (causes.entries as any[]).map((e) => ({
  id: e.dwId,
  cause: e.cause,
  receiptId: e.receiptId,
  dedupeKey: e.sameDefectAs?.kind === 'organismLine' ? e.sameDefectAs.key : null,
  // 015 — measure-gate-counting-v2.md §2: entries[].resolvedBy →
  // ReclassifiedDwEntry.resolvedBy (non-null ⇒ no longer a work item).
  resolvedBy: e.resolvedBy ?? null,
}));

const discoveredDeferredWork: DiscoveredDeferredWork[] = (causes.deferredWork as any[]).map((d) => ({
  id: d.id,
  cause: d.cause,
  receiptId: d.receiptId,
}));

const input: MeasureGateInput = {
  contractIds,
  lines: [...visualLines, ...organismLines, ...blockedOrganismLines],
  reclassifiedDwEntries,
  discoveredDeferredWork,
  causeLabels: CAUSE_LABELS,
  receipts,
  browser: { version: rows.browser?.version ?? null, executablePath: rows.browser?.executablePath ?? null },
};

const result = evaluateMeasureGate(input);

// ---------------------------------------------------------------------------
// T046 — RAPPORT-CLOTURE.md, RENDERED from the gate's own live result, never
// hand-typed (I-6.3: no count is ever fixed in prose — this is the exact
// discipline that caught SC-002 citing "63 lines" against a report that
// carried 39, research.md §0.9). `counts.byCause` IS FR-011's dimensioning
// output for 015 (contract-geometry) and 016 (figma-source).
// ---------------------------------------------------------------------------
// Mots pour mots la colonne « où la ligne part ensuite » de
// contracts/cause-vocabulary.md §1 — la même table, jamais reformulée.
const CAUSE_DESTINATION: Record<string, string> = {
  'contract-geometry': '**015** — géométrie gouvernée',
  'image-boundary': '**017** — limite nommée jusque-là',
  rendering: 'plancher assumé, jamais toléré au score',
  engine: 'défaut suivi, ouvert',
  instrument: 'corrigé **ici** (DW-006)',
  'figma-source': '**016** — canvas vrai',
};

function renderClosureReport(r: MeasureGateResult): string {
  const L: string[] = [];
  const push = (s = '') => L.push(s);

  push('# Rapport de clôture — Mesure juste et triage complet (014)');
  push();
  push(
    '> Rendu depuis la sortie EN DIRECT de `npm run measure:gate -- --json` — jamais un compte figé en prose (I-6.3). Voir [contracts/measure-gate.interface.md](../contracts/measure-gate.interface.md) et [proofs/registre/REGISTRE.md](./registre/REGISTRE.md).',
  );
  push();

  push('## Verdict');
  push();
  push(`**${r.verdict.toUpperCase()}** — code de sortie \`${r.exitCode}\` — navigateur \`${r.browser.version ?? 'inconnu'}\``);
  push();
  push(
    r.refusals.length === 0
      ? 'Les quatre conditions de FR-007 sont tenues : zéro ligne divergente sans cause, les 34 contrats portent une ligne de mesure, la référence de chaque ligne d\'organisme est le node du cas, et toute cause publiée porte un reçu re-testé.'
      : `${r.refusals.length} refus — la clôture n'est PAS atteinte (voir § Refus ci-dessous).`,
  );
  push();

  push('## Comptage (en direct, jamais figé)');
  push();
  push(`- contrats gouvernés : **${r.counts.contracts}**`);
  push(`- lignes mesurées (deux instruments) : **${r.counts.measuredLines}**`);
  push(`- dont divergentes (score brut > 0) : **${r.counts.divergentLines}**`);
  push(`- travaux découverts par 014, non réparés (§4 ter, distincts du registre DW re-classé) : **${r.counts.deferredWork}**`);
  push();

  push('## Sortie dimensionnante FR-011 — compte par cause');
  push();
  push('Agrégé sur les lignes des **deux** instruments et sur le registre des travaux reportés de 013 re-classé (dédupliqué par `sameDefectAs` — un fait épinglé et la ligne qui en résulte comptent pour un, jamais deux).');
  push();
  push('| cause | libellé publié | compte | destination |');
  push('|---|---|---:|---|');
  for (const [slug, label] of Object.entries(CAUSE_LABELS)) {
    const n = (r.counts.byCause as Record<string, number>)[slug] ?? 0;
    push(`| \`${slug}\` | ${label} | ${n} | ${CAUSE_DESTINATION[slug] ?? '—'} |`);
  }
  push();

  push('## Règles retirées (`RETIRED_RULES`) — une cause qui ne peut plus rien causer');
  push();
  push('Trois règles héritées visaient des contrats supprimés à la reconversion Piqueray. Elles ne comptent dans aucune cause ci-dessus (leur classe d\'origine n\'est plus une des six valeurs) — un constat publié, pas un ménage silencieux (cause-vocabulary.md §4.2) :');
  push();
  push('| sujet | classe d\'origine | motif |');
  push('|---|---|---|');
  for (const rule of RETIRED_RULES) {
    push(`| ${rule.subject} | \`${rule.originalClass}\` | ${rule.reason} |`);
  }
  push();

  if (r.refusals.length > 0) {
    push('## Refus');
    push();
    push('| code | sujet | message |');
    push('|---|---|---|');
    for (const refusal of r.refusals) {
      push(`| \`${refusal.code}\` | ${refusal.subject} | ${refusal.message.replace(/\|/g, '\\|')} |`);
    }
    push();
  }

  push('## Ce que ce rapport ne fait pas');
  push();
  push('- **Il ne répare rien** — un triage nomme, il ne corrige pas (FR-005).');
  push('- **Il ne fige aucun compte** — relancer `npm run measure:gate -- --json` est la seule autorité ; ce fichier n\'est qu\'un rendu daté de cette sortie.');
  push('- **Il ne lève aucun blocage** — les trois organismes bloqués (equipe, formulaire, header) restent bloqués ; leur re-test va à 016 (US5, T031).');
  push();

  return L.join('\n');
}

if (WRITE_CLOSURE_REPORT) {
  writeFileSync(CLOSURE_REPORT_PATH, `${renderClosureReport(result)}\n`);
  console.log(`Rapport de clôture rendu : ${path.relative(REPO, CLOSURE_REPORT_PATH)}`);
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------
if (JSON_MODE) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`measure:gate — verdict: ${result.verdict.toUpperCase()} (exit ${result.exitCode})`);
  console.log(
    `  contracts ${result.counts.contracts} · measured lines ${result.counts.measuredLines} · divergent ${result.counts.divergentLines} · deferred work ${result.counts.deferredWork}`,
  );
  console.log(
    `  by cause: ${Object.entries(result.counts.byCause)
      .map(([slug, n]) => `${slug}=${n}`)
      .join(' · ')}`,
  );
  console.log(`  browser: ${result.browser.version ?? 'unknown'}`);
  if (result.refusals.length === 0) {
    console.log('✓ all four conditions held — zero refusals');
  } else {
    console.error(`\n✗ ${result.refusals.length} refusal(s):`);
    for (const r of result.refusals) {
      console.error(EXPLAIN ? `  · [${r.code}] ${r.subject}\n      ${r.message}` : `  · [${r.code}] ${r.subject} — ${r.message}`);
    }
  }
}

process.exit(result.exitCode);
