/**
 * Shared eval harness — the scratch workspace, the pipeline shells, and the
 * assertion helpers every case is written against.
 *
 * Split out of run.ts so that evals/legacy-cases.ts (the quarantine) can hold
 * its cases VERBATIM: the case bodies reference exactly the same identifiers
 * they always did, so re-enabling one is a move, never a rewrite.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
// COVERAGE ROUND pins (pure modules — no side effects at import):
import {
  customPropDefs,
  parseModuleCss,
  resolveToRef,
  type TokenLookup,
} from '../examples/polaris/scripts/lib-css.js';
import {
  ContractSchema,
  resolveTokens as schemaResolveTokens,
  type Contract as SchemaContract,
  type Part as SchemaPart,
} from '../scripts/contract-schema.js';
import { buildPlan as proposePrBuildPlan, contentsPutBody, summarize as proposePrSummarize } from '../packages/cli/src/commands/propose-pr.js';
import { emitReact as coreEmitReact, isMultiRoot as coreIsMultiRoot, validateContract as coreValidateContract } from '../core/emit-react.js';
import { createFigmaEngine } from '../core/emit-figma-script.js';
import { emitHtml as coreEmitHtml } from '../core/emit-html.js';
import { tokenInventoryFromJson } from '../core/tokens.js';
// DEPTH BUILD Stage A+B pins (pure — production capture/anatomy over committed
// receipts; the evals NEVER launch a browser).
import { loadConfig as loadCaptureConfig, propSpaceFor } from '../extract/computed/capture.js';
import {
  buildUnion as depthBuildUnion,
  buildMultiRootUnion,
  descendToRealRoots,
  nameUnion as depthNameUnion,
  promoteAnatomy as depthPromoteAnatomy,
  promoteMultiRootAnatomy,
} from '../extract/computed/anatomy.js';
import type { Capture as DepthCapture, CapturedNode as DepthNode } from '../extract/computed/lib.js';
import { kebab as depthKebab } from '../extract/types.js';

export const ROOT = process.cwd();
export const SCRATCH = path.join(ROOT, 'evals', '.scratch');
export const TSX = path.join(SCRATCH, 'node_modules', '.bin', 'tsx');

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------

export function resetScratch() {
  rmSync(SCRATCH, { recursive: true, force: true });
  mkdirSync(SCRATCH, { recursive: true });
  // playground rides along READ-ONLY: the canvas-box-parity receipt pins the
  // canvas renderer's border-box semantics against its source (the module is
  // vite-only at runtime — import.meta.glob — so the receipt reads, never runs).
  // workers rides along for the AI-fix guardrail eval (the worker test suite
  // runs in scratch via the root tsx — workers/assist has no own node_modules).
  // packages rides along because scripts/contract-schema.ts is a re-export
  // shim over packages/schema/src (the @ds-contracts/schema source) and the
  // CLI evals run packages/cli from scratch. Build artifacts (dist/) are
  // filtered out — the CLI evals rebuild in scratch, and copying ~24 MB of
  // bundles per case would dominate the reset.
  // figma-sync rides along for the plugin-engine evals: the engine entry,
  // ui.html (embedded dump script + engine slot), and the committed
  // engine.receipt.json the zip build drift-guards against.
  // The two GITIGNORED scratch roots under extract/ are skipped: PNG captures
  // and Figma dumps, tens of MB that grow with every audit run, re-copied for
  // every case because cpSync does not honour .gitignore. No eval reads them.
  // Listed explicitly rather than matched on a basename of "out" — extract/out,
  // extract/computed/out, extract/fidelity-matrix/out and extract/pilots/*/out
  // hold hundreds of TRACKED files the evals do read.
  const extractScratchRoots = new Set([
    path.join(ROOT, 'extract', 'figma', 'visual-parity', 'out'),
    path.join(ROOT, 'extract', 'figma', 'organism-audit', 'out'),
  ]);
  for (const dir of ['contracts', 'tokens', 'scripts', 'core', 'parity', 'src', 'catalog', 'context', 'assets', 'extract', 'playground', 'workers', 'packages', 'figma-sync']) {
    cpSync(path.join(ROOT, dir), path.join(SCRATCH, dir), {
      recursive: true,
      filter:
        dir === 'packages'
          ? (src) => path.basename(src) !== 'dist'
          : dir === 'extract'
            ? (src) => !extractScratchRoots.has(src)
            : undefined,
    });
  }
  cpSync(path.join(ROOT, 'evals', 'fixtures'), path.join(SCRATCH, 'evals', 'fixtures'), {
    recursive: true,
  });
  // examples/ is otherwise NOT copied (kept out of scratch — see astryx pins,
  // which stage what they need); plugin-engine-check reads the depth-composite
  // contract for its composite-plugin-path flow, so stage that one directory.
  cpSync(path.join(ROOT, 'examples', 'depth-composite'), path.join(SCRATCH, 'examples', 'depth-composite'), {
    recursive: true,
  });
  for (const file of ['package.json', 'tsconfig.json']) {
    cpSync(path.join(ROOT, file), path.join(SCRATCH, file));
  }
  cpSync(path.join(ROOT, 'evals', 'golden.json'), path.join(SCRATCH, 'evals', 'golden.json'));
  symlinkSync(path.join(ROOT, 'node_modules'), path.join(SCRATCH, 'node_modules'), 'dir');
}

export interface RunResult {
  status: number;
  out: string;
}
export function run(cmd: string, args: string[]): RunResult {
  const r = spawnSync(cmd, args, { cwd: SCRATCH, encoding: 'utf8' });
  return { status: r.status ?? -1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}
export const generate = () => run(TSX, ['scripts/generate-components.ts']);
export const buildTokens = () => run(process.execPath, ['scripts/build-tokens.mjs']);
export const parity = () => run(TSX, ['parity/diff.ts']);

export interface ReportFinding {
  surface: string;
  classification: string;
  subject: string;
  proposedPatch?: Record<string, unknown>;
}
export const readReport = (): ReportFinding[] =>
  JSON.parse(readFileSync(path.join(SCRATCH, 'parity', 'report.json'), 'utf8')).findings;

/** Per-component sync scripts are AMEND-CAPABLE since #60: they carry the
 *  shared sync runtime with `const COMPONENTS = [<data>]` (variants ride
 *  data.variants / data.stateVariants) instead of the old create-only
 *  VARIANTS/STATE_VARIANTS constants. */
export const parseSyncComponent = (script: string): any =>
  JSON.parse(script.match(/const COMPONENTS = (\[[\s\S]*?\n\]);/)![1])[0];

export function replaceInFile(rel: string, from: string | RegExp, to: string) {
  const p = path.join(SCRATCH, rel);
  const src = readFileSync(p, 'utf8');
  const next = src.replace(from, to);
  if (next === src) throw new Error(`Mutation did not apply in ${rel}: ${String(from)}`);
  writeFileSync(p, next);
}
export function editJson(rel: string, fn: (data: any) => void) {
  const p = path.join(SCRATCH, rel);
  const data = JSON.parse(readFileSync(p, 'utf8'));
  fn(data);
  writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
}

export function hashTree(rel: string): string {
  const hash = createHash('sha256');
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir).sort()) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else {
        hash.update(entry);
        hash.update(readFileSync(full));
      }
    }
  };
  walk(path.join(SCRATCH, rel));
  return hash.digest('hex');
}

export const expectFinding = (
  findings: ReportFinding[],
  surface: string,
  classification: string,
  subject: string,
) => {
  const f = findings.find(
    (x) => x.surface === surface && x.classification === classification && x.subject === subject,
  );
  if (!f) {
    throw new Error(
      `Expected [${surface} ${classification}] ${subject}; got: ${findings.map((x) => `[${x.surface} ${x.classification}] ${x.subject}`).join(', ') || '(none)'}`,
    );
  }
  return f;
};

// ---------------------------------------------------------------------------
// Cases
// ---------------------------------------------------------------------------

export interface Case {
  id: string;
  claim: 'C1-determinism' | 'C2-refusal' | 'C3-detection' | 'C4-convergence' | 'C5-extraction' | 'C6-theming' | 'C7-cli' | 'C8-journey';
  run: () => void; // throws on failure
}

export const BTN_TSX = 'src/components/Button/Button.tsx';
export const CONTRACT = 'contracts/button.contract.json';
/** The Piqueray Button's typed variant declaration in the generated TSX. */
export const VARIANT_DECL = "variant?: 'default' | 'orange' | 'blanc' | 'outlineBlanc' | 'link' | 'outilneNoir' | 'iconOnly';";
/** The drawn set's spelling on the canvas, and its one VARIANT property. */
export const FIGMA_SET = 'Bouton';
export const VARIANT_PROPERTY = 'Style';
export const FIGMA_COMPONENTS = 'parity/snapshots/figma-components.json';
export const FIGMA_TOKENS = 'parity/snapshots/figma-tokens.json';

export const MINIMAL_CONTRACT = (id: string, name: string, refId: string) => ({
  id,
  name,
  version: '1.0.0',
  description: 'Eval fixture.',
  semantics: { element: 'div' },
  props: [],
  anatomy: { root: { parts: { inner: { component: { id: refId } } } } },
  anchors: {
    figma: { fileKey: null, componentSetKey: null },
    code: { importPath: `src/components/${name}`, export: name },
  },
});

// Re-exported for the case bodies (run.ts + legacy-cases.ts import from here).
export {
  customPropDefs, parseModuleCss, resolveToRef,
  ContractSchema, schemaResolveTokens,
  proposePrBuildPlan, contentsPutBody, proposePrSummarize,
  coreEmitReact, coreIsMultiRoot, coreValidateContract,
  createFigmaEngine, coreEmitHtml, tokenInventoryFromJson,
  loadCaptureConfig, propSpaceFor,
  depthBuildUnion, buildMultiRootUnion, descendToRealRoots, depthNameUnion,
  depthPromoteAnatomy, promoteMultiRootAnatomy, depthKebab,
};
export type { TokenLookup, SchemaContract, SchemaPart, DepthCapture, DepthNode };
