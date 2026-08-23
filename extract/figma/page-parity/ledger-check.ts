/**
 * Ledger validator — the blocking gate for `contracts/customization-ledger.md`
 * (FR-012). Run as `npm run pages:ledger:check` (tsx). Pure Node, no Figma/
 * network: it only reads the ledger JSON already written to disk by the
 * customization-detection step (`bridge/customizations.js`) and refuses
 * anything that doesn't satisfy the contract.
 *
 *   npm run pages:ledger:check                            # every *.json under
 *                                                          # specs/003-externalize-figma-components/ledger/
 *   npm run pages:ledger:check -- ledger/footer.json ...   # only these files
 *
 * WHY this is pedantic on purpose: the pixel-gate (`pages:compare`) only
 * catches a lost PIXEL. A customization silently overwritten by a
 * same-looking default value never moves a pixel — the ledger is the only
 * thing standing between an adoption and a quietly lost piece of intent
 * (data-model.md, invariant 4: "rien ne disparaît en silence"). So every
 * rule in the contract is enforced structurally here, not spot-checked —
 * an adoption is not "done" unless both this AND the pixel verdict pass.
 *
 * WHY `readdirSync` instead of a glob: the Glob tool is blocked project-wide
 * (CLAUDE.md hook); a plain `readdirSync` + `.json` filter needs no extra
 * dependency and is exactly as deterministic once sorted — run order never
 * depends on filesystem iteration order (this project treats a nondeterministic
 * pipeline step as a bug class of its own).
 *
 * WHY every file is checked even after an earlier one fails: this is meant
 * to run as a single commit-time gate over the whole `ledger/` directory, so
 * every problem across every file should surface in one pass — the same
 * reasoning `tsc`/`eslint` use. The exit code is a single verdict for the
 * whole run (any problem anywhere -> exit 1), but the report is never
 * short-circuited — nothing found is swallowed because an earlier file
 * already failed.
 *
 * WHY "signalement references the journal" is a named heuristic, not a
 * proof: the contract requires a non-portable customization's `signalement`
 * to point at `decisions.md`, but the field is free text — there is no
 * structured `refJournal` id to check here (unlike `Anomalie`). The closest
 * honest, checkable proxy is "mentions the word journal", matching the
 * contract's own worked example ("… voir journal 2026-07-30"). This cannot
 * prove the reference is *correct*, only that the author didn't forget to
 * point somewhere — named here so nobody mistakes it for stronger than it is.
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const LEDGER_DIR_REL = path.join('specs', '003-externalize-figma-components', 'ledger');

const TOP_LEVEL_FIELDS: ReadonlySet<string> = new Set(['bloc', 'date', 'masterNodeId', 'entrees', 'totaux']);
const ENTRY_FIELDS: ReadonlySet<string> = new Set([
  'maquette',
  'position',
  'type',
  'chemin',
  'valeur',
  'portePar',
  'statut',
  'signalement',
]);
const TOTAUX_FIELDS: ReadonlySet<string> = new Set(['reportees', 'nonPortables']);
const POSITION_FIELDS: ReadonlySet<string> = new Set(['x', 'y', 'w', 'h']);
const POSITION_AXES = ['x', 'y', 'w', 'h'] as const;

const VALID_TYPES: ReadonlySet<string> = new Set(['texte', 'image', 'icone', 'visibilite', 'autre']);
const VALID_STATUTS: ReadonlySet<string> = new Set(['reportee', 'non-portable-signalee']);

const DATE_FORMAT_RE = /^\d{4}-\d{2}-\d{2}$/;
/** Heuristic proxy for "references the decisions journal" — see header WHY. */
const REFERENCES_JOURNAL_RE = /journal/i;

// ---------------------------------------------------------------------------
// Runtime type guards — ledger JSON is untrusted external input (hand-authored
// or bridge-generated), never a value the compiler already checked, so every
// field is narrowed explicitly instead of cast.
// ---------------------------------------------------------------------------

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

const isNonNegativeInteger = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0;

const describe = (v: unknown): string => JSON.stringify(v);
const listOf = (s: ReadonlySet<string>): string => [...s].join(', ');
const errMessage = (err: unknown): string => (err instanceof Error ? err.message : String(err));

/** null = valid; otherwise the reason, ready to print. */
function describeDateError(v: unknown): string | null {
  if (typeof v !== 'string') {
    return `"date" must be a string in AAAA-MM-JJ format (got ${describe(v)})`;
  }
  if (!DATE_FORMAT_RE.test(v)) {
    return `"date" must match the AAAA-MM-JJ format, e.g. "2026-07-30" (got ${describe(v)})`;
  }
  const asUtc = new Date(`${v}T00:00:00Z`);
  if (Number.isNaN(asUtc.getTime()) || asUtc.toISOString().slice(0, 10) !== v) {
    return `"date" is not a valid calendar date (got ${describe(v)})`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Findings — one flat list per file, errors AND warnings, printed together;
// only errors flip the exit code (unknown fields warn, they never fail —
// per the task contract).
// ---------------------------------------------------------------------------

interface Finding {
  /** '' for a top-level field, 'entrees[i]' for an entry, 'totaux' for totals. */
  scope: string;
  /** Short rule id, e.g. "portePar", "signalement-journal". */
  rule: string;
  message: string;
  severity: 'error' | 'warning';
}

interface LedgerSummary {
  entreesCount: number;
  reportees: number;
  nonPortables: number;
}

function makeCollector(findings: Finding[]): {
  error: (scope: string, rule: string, message: string) => void;
  warn: (scope: string, rule: string, message: string) => void;
} {
  return {
    error: (scope, rule, message) => findings.push({ scope, rule, message, severity: 'error' }),
    warn: (scope, rule, message) => findings.push({ scope, rule, message, severity: 'warning' }),
  };
}

function checkUnknownFields(
  obj: Record<string, unknown>,
  known: ReadonlySet<string>,
  scope: string,
  warn: (scope: string, rule: string, message: string) => void,
): void {
  for (const key of Object.keys(obj)) {
    if (!known.has(key)) {
      warn(scope, 'unknown-field', `unexpected field "${key}" is not part of the ledger schema (ignored)`);
    }
  }
}

/**
 * Validate one already-parsed ledger document against
 * `contracts/customization-ledger.md`. Never throws — every problem becomes
 * a Finding, so the caller can report everything found in one pass.
 */
function validateLedger(raw: unknown): { findings: Finding[]; summary: LedgerSummary } {
  const findings: Finding[] = [];
  const { error, warn } = makeCollector(findings);
  const emptySummary: LedgerSummary = { entreesCount: 0, reportees: 0, nonPortables: 0 };

  if (!isPlainObject(raw)) {
    error('', 'root', 'top-level JSON must be an object with bloc/date/masterNodeId/entrees/totaux');
    return { findings, summary: emptySummary };
  }

  checkUnknownFields(raw, TOP_LEVEL_FIELDS, '', warn);

  if (!isNonEmptyString(raw.bloc)) {
    error('', 'bloc', '"bloc" must be a non-empty string');
  }

  const dateError = describeDateError(raw.date);
  if (dateError !== null) {
    error('', 'date', dateError);
  }

  if (!isNonEmptyString(raw.masterNodeId)) {
    error('', 'masterNodeId', '"masterNodeId" must be a non-empty string');
  }

  const entreesIsArray = Array.isArray(raw.entrees);
  if (!entreesIsArray) {
    error(
      '',
      'entrees',
      '"entrees" must be an array (use [] for an explicit-empty ledger — an adoption with no ' +
        'customizations is valid ONLY in that form, with totaux at 0/0)',
    );
  }

  let reporteesActual = 0;
  let nonPortablesActual = 0;

  if (Array.isArray(raw.entrees)) {
    raw.entrees.forEach((entryRaw: unknown, i: number) => {
      const scope = `entrees[${i}]`;
      if (!isPlainObject(entryRaw)) {
        error(scope, 'entry', 'entry must be an object');
        return;
      }
      checkUnknownFields(entryRaw, ENTRY_FIELDS, scope, warn);

      if (!isNonEmptyString(entryRaw.maquette)) {
        error(scope, 'maquette', '"maquette" must be a non-empty string');
      }

      if (!isPlainObject(entryRaw.position)) {
        error(scope, 'position', '"position" must be an object { x, y, w, h }');
      } else {
        checkUnknownFields(entryRaw.position, POSITION_FIELDS, `${scope}.position`, warn);
        for (const axis of POSITION_AXES) {
          if (!isFiniteNumber(entryRaw.position[axis])) {
            error(scope, `position.${axis}`, `"position.${axis}" must be a finite number`);
          }
        }
      }

      const typeOk = typeof entryRaw.type === 'string' && VALID_TYPES.has(entryRaw.type);
      if (!typeOk) {
        error(scope, 'type', `"type" must be one of ${listOf(VALID_TYPES)} (got ${describe(entryRaw.type)})`);
      }

      if (!isNonEmptyString(entryRaw.chemin)) {
        error(scope, 'chemin', '"chemin" must be a non-empty string');
      }

      if (entryRaw.valeur === undefined) {
        error(scope, 'valeur', '"valeur" must be present');
      }

      // type "autre" is never a mute catch-all: it must carry its own
      // description, on top of the generic "valeur present" rule above.
      if (typeOk && entryRaw.type === 'autre' && !isNonEmptyString(entryRaw.valeur)) {
        error(scope, 'valeur-autre', 'type "autre" requires a non-empty, descriptive "valeur" — never a mute catch-all');
      }

      const statutOk = typeof entryRaw.statut === 'string' && VALID_STATUTS.has(entryRaw.statut);
      if (!statutOk) {
        error(scope, 'statut', `"statut" must be one of ${listOf(VALID_STATUTS)} (got ${describe(entryRaw.statut)})`);
      } else if (entryRaw.statut === 'reportee') {
        reporteesActual++;
        if (!isNonEmptyString(entryRaw.portePar)) {
          error(
            scope,
            'portePar',
            'statut "reportee" requires a non-empty "portePar" (the master property/override that carries this customization)',
          );
        }
      } else if (entryRaw.statut === 'non-portable-signalee') {
        nonPortablesActual++;
        if (!isNonEmptyString(entryRaw.signalement)) {
          error(scope, 'signalement', 'statut "non-portable-signalee" requires a non-empty "signalement"');
        } else if (!REFERENCES_JOURNAL_RE.test(entryRaw.signalement)) {
          error(
            scope,
            'signalement-journal',
            '"signalement" must reference the decisions journal (mention "journal", per the contract\'s own ' +
              'example: "… voir journal <date>")',
          );
        }
      }
    });
  }

  if (!isPlainObject(raw.totaux)) {
    error('', 'totaux', '"totaux" must be an object { reportees, nonPortables }');
  } else {
    checkUnknownFields(raw.totaux, TOTAUX_FIELDS, 'totaux', warn);

    if (!isNonNegativeInteger(raw.totaux.reportees)) {
      error('totaux', 'reportees', '"totaux.reportees" must be a non-negative integer');
    } else if (entreesIsArray && raw.totaux.reportees !== reporteesActual) {
      error(
        'totaux',
        'reportees-mismatch',
        `"totaux.reportees" (${raw.totaux.reportees}) does not match the actual count of statut "reportee" entries (${reporteesActual})`,
      );
    }

    if (!isNonNegativeInteger(raw.totaux.nonPortables)) {
      error('totaux', 'nonPortables', '"totaux.nonPortables" must be a non-negative integer');
    } else if (entreesIsArray && raw.totaux.nonPortables !== nonPortablesActual) {
      error(
        'totaux',
        'nonPortables-mismatch',
        `"totaux.nonPortables" (${raw.totaux.nonPortables}) does not match the actual count of statut "non-portable-signalee" entries (${nonPortablesActual})`,
      );
    }
  }

  const summary: LedgerSummary = {
    entreesCount: Array.isArray(raw.entrees) ? raw.entrees.length : 0,
    reportees: reporteesActual,
    nonPortables: nonPortablesActual,
  };

  return { findings, summary };
}

// ---------------------------------------------------------------------------
// File / CLI layer
// ---------------------------------------------------------------------------

type ReadResult = { ok: true; value: unknown } | { ok: false; error: string };

function readAndParse(filePath: string): ReadResult {
  let text: string;
  try {
    text = readFileSync(filePath, 'utf8');
  } catch (err) {
    return { ok: false, error: `cannot read file: ${errMessage(err)}` };
  }
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch (err) {
    return { ok: false, error: `invalid JSON: ${errMessage(err)}` };
  }
}

const formatScope = (scope: string): string => (scope.length > 0 ? `${scope}: ` : '');

/** Validate one file; prints everything found; returns whether it passed. */
function checkFile(filePath: string): boolean {
  const display = path.relative(process.cwd(), filePath) || filePath;

  const parsed = readAndParse(filePath);
  if (!parsed.ok) {
    console.error(`ledger-check: ${display}: ${parsed.error}`);
    return false;
  }

  const { findings, summary } = validateLedger(parsed.value);
  for (const f of findings) {
    const tag = f.severity === 'warning' ? ' [warning, non-blocking]' : '';
    console.error(`ledger-check: ${display}: ${formatScope(f.scope)}${f.rule}: ${f.message}${tag}`);
  }

  if (findings.some((f) => f.severity === 'error')) {
    return false;
  }

  console.log(
    `✔ ledger-check ${display}: ${summary.entreesCount} entree(s) — ${summary.reportees} reportee(s), ${summary.nonPortables} non-portable(s)`,
  );
  return true;
}

/** *.json directly under the ledger dir, sorted for a deterministic run order. */
function discoverLedgerFiles(): string[] {
  const dir = path.resolve(process.cwd(), LEDGER_DIR_REL);
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch (err) {
    // A missing/unreadable directory is a harder failure than "legitimately
    // no ledgers yet" (that case is an empty *.json filter result below,
    // handled distinctly) — never conflate the two silently.
    console.error(`ledger-check: cannot read ledger directory ${dir}: ${errMessage(err)}`);
    process.exit(1);
  }
  return entries
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => path.join(dir, name));
}

function main(): void {
  const argv = process.argv.slice(2);
  const files = argv.length > 0 ? argv.map((a) => path.resolve(process.cwd(), a)) : discoverLedgerFiles();

  if (files.length === 0) {
    // Only reachable in no-args mode (argv.length > 0 guards the explicit-args
    // branch away from an empty list) — zero *.json files under ledger/ is a
    // legitimate, declared "nothing to do", never a silent no-op.
    console.log('aucun ledger - rien a valider');
    process.exit(0);
  }

  let allOk = true;
  for (const file of files) {
    if (!checkFile(file)) allOk = false;
  }
  process.exit(allOk ? 0 : 1);
}

// ---------------------------------------------------------------------------
// Spec 026 — SectionHeader migration visual allowance.  This is exported so
// tests and the post-mutation receipt share one refusal policy; it leaves the
// historical customization-ledger CLI above untouched.
// ---------------------------------------------------------------------------

export interface SectionHeaderMigrationCapture {
  sha256: string;
  width: number;
  height: number;
}

export interface SectionHeaderMigrationParityRow {
  usageId: string;
  role: string;
  destination: string;
  status: 'blocked' | 'preserve' | 'authorized-product-delta';
  before: SectionHeaderMigrationCapture;
  after?: SectionHeaderMigrationCapture;
  authorizedDelta?: string;
  approvalRef?: string;
}

/**
 * Return every refusal rather than stopping at the first row. `preserve` is
 * byte-and-dimension identical. The only permitted difference is an approved
 * Products row carrying the named interim CTA/title allowance.
 */
export function sectionHeaderMigrationParityFailures(
  rows: readonly SectionHeaderMigrationParityRow[],
  expectedUsageCount = 45,
): string[] {
  const failures: string[] = [];
  if (rows.length !== expectedUsageCount) failures.push(`expected ${expectedUsageCount} rows, got ${rows.length}`);
  const ids = new Set<string>();
  for (const row of rows) {
    if (!row.usageId) failures.push('row without usageId');
    else if (ids.has(row.usageId)) failures.push(`${row.usageId}: duplicate usageId`);
    else ids.add(row.usageId);
    if (row.status === 'preserve') {
      if (!row.after) failures.push(`${row.usageId}: preserve without after capture`);
      else if (row.after.sha256 !== row.before.sha256 || row.after.width !== row.before.width || row.after.height !== row.before.height) {
        failures.push(`${row.usageId}: unauthorised visual delta`);
      }
    }
    if (row.status === 'authorized-product-delta' &&
        (row.role !== 'produits-ecommerce' || row.destination !== 'produits-ecommerce' ||
          row.authorizedDelta !== 'product-intermediate-left-no-eyebrow-cta' || !row.approvalRef || !row.after)) {
      failures.push(`${row.usageId}: unapproved Products delta`);
    }
  }
  return failures;
}

if (process.argv[1]?.endsWith('/ledger-check.ts') || process.argv[1]?.endsWith('\\ledger-check.ts')) {
  try {
    main();
  } catch (err) {
    console.error(`ledger-check: unexpected error: ${errMessage(err)}`);
    process.exit(1);
  }
}
