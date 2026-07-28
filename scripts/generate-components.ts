/**
 * Contract → code generator — the CLI SHELL. (v2 — composition)
 *
 * All contract→code string building lives in core/emit-react.ts (pure,
 * browser-importable); this script owns only the file system: read
 * contracts/ + tokens/ + assets/icons/, run the core emitters, format, and
 * write per component:
 *
 *   src/components/<Name>/<Name>.tsx           React component
 *   src/components/<Name>/<Name>.module.css    styles from anatomy token bindings
 *   src/components/<Name>/<Name>.stories.tsx   CSF3 stories (argTypes from contract)
 *   src/components/<Name>/index.ts             re-export
 *
 * Output is byte-guarded by evals/golden.json (the golden-generated-output
 * eval): refactors of the core must not change a single emitted byte.
 *
 * Generated files are never edited by hand. To change a component, change
 * its contract and re-run `npm run generate`.
 *
 * PARAMETERIZED (Phase 1, @ds-contracts/cli): every path is now an option —
 *   --contracts <dir>   contract documents        (default: <cwd>/contracts)
 *   --tokens <files>    comma-separated DTCG files (default: the repo's 4-file layout)
 *   --icons <dir>       SVG icon assets           (default: <cwd>/assets/icons)
 *   --out <dir>         output root               (default: <cwd>/src/components)
 * Defaults are the repo paths, so `npm run generate` is byte-identical to
 * the pre-parameterization script. The `ds-contracts generate` verb calls
 * the same exported generateComponents() — one code path, two shells.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ContractSchema, IconRegistrySchema, sortByDependencies, type Contract, type IconRegistry } from './contract-schema.js';
import { generateCss, generateStories, generateTsx, validateContract } from '../core/emit-react.js';
import { formatCss, formatTsx } from '../core/format.js';
import { tokenInventoryFromJson } from '../core/tokens.js';

export interface GenerateComponentsOptions {
  /** Directory of *.contract.json documents. */
  contractsDir?: string;
  /** Explicit contract document paths — when present, these are the set
   *  (contractsDir is not listed). The CLI's `generate <contracts..>` uses
   *  this; the npm script keeps directory discovery. */
  contractFiles?: string[];
  /** DTCG token files — the union is the token inventory. */
  tokenFiles?: string[];
  /** Directory of <name>.svg icon assets. */
  iconsDir?: string;
  /** Directory of arbitrary governed SVG vector assets (default: sibling vectors/). */
  vectorsDir?: string;
  /** Path to the icon registry document (default: <contractsDir>/icons.registry.json). Optional — absent means no governed icons yet. */
  iconRegistryPath?: string;
  /** Output root — one directory per component is written under it. */
  outDir?: string;
  /** Emit <Name>.stories.tsx per component (default true — the repo path). */
  stories?: boolean;
}

/** Named refusal — the caller prints `header` then one `  - line` per error
 *  and exits 1 (both shells keep the exact historical wording). */
export class ContractViolationError extends Error {
  constructor(
    public header: string,
    public violations: string[],
  ) {
    super(`${header}\n${violations.map((e) => `  - ${e}`).join('\n')}`);
  }
}

const defaultTokenFiles = (root: string) =>
  [
    path.join(root, 'tokens', 'primitives.tokens.json'),
    path.join(root, 'tokens', 'semantic.tokens.json'),
    path.join(root, 'tokens', 'modes', 'semantic.light.tokens.json'),
    // Mono-theme (Piqueray): the dark-mode file is optional — kept in the list
    // only when present, so a single-mode token set resolves without it.
    path.join(root, 'tokens', 'modes', 'semantic.dark.tokens.json'),
  ].filter((f) => existsSync(f));

/** Icon assets are SOURCE (like tokens): <iconsDir>/<name>.svg, inlined by
 *  the generator on the code side and rendered as vectors in Figma. */
function loadSvgAssets(dir: string): Map<string, string> {
  try {
    return new Map(
      readdirSync(dir)
        .filter((f) => f.endsWith('.svg'))
        .map((f) => [f.replace(/\.svg$/, ''), readFileSync(path.join(dir, f), 'utf8').trim()]),
    );
  } catch {
    return new Map();
  }
}

function loadTokenInventory(tokenFiles: string[]): Set<string> {
  return tokenInventoryFromJson(tokenFiles.map((file) => JSON.parse(readFileSync(file, 'utf8'))));
}

/** The icon registry (`contracts/icons.registry.json`) — OPTIONAL and
 *  additive (Principle VI): a repo with no governed icons yet builds fine
 *  without one. When present, its shape is validated by name — a broken
 *  registry document is refused exactly like a broken contract, never a
 *  silent parse failure. */
function loadIconRegistry(registryPath: string, errors: string[]): IconRegistry | null {
  if (!existsSync(registryPath)) return null;
  const raw = JSON.parse(readFileSync(registryPath, 'utf8'));
  const parsed = IconRegistrySchema.safeParse(raw);
  if (!parsed.success) {
    errors.push(
      `${path.basename(registryPath)}: ${parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ')}`,
    );
    return null;
  }
  return parsed.data;
}

/** Registry build validation (T022): every entry's asset must exist on
 *  disk (the per-part missing-asset refusal in emit-react.ts stays the
 *  last line of defense for anatomy references specifically); and any
 *  contract enum bound INSTANCE_SWAP that overlaps the registry's names
 *  at all must equal it EXACTLY — "ni plus ni moins" (FR-011) — so a
 *  one-sided edit (an icon added to the enum but not the registry, or
 *  vice versa) is refused BY NAME, not silently accepted as a subset. */
function validateIconRegistry(
  registry: IconRegistry,
  iconAssets: Map<string, string>,
  contracts: Contract[],
  errors: string[],
): void {
  const registryNames = new Set(registry.icons.map((i) => i.name));
  for (const icon of registry.icons) {
    if (!iconAssets.has(icon.asset)) {
      errors.push(`ds.icons: icon "${icon.name}" needs asset "assets/icons/${icon.asset}.svg" which does not exist`);
    }
  }
  for (const contract of contracts) {
    for (const prop of contract.props) {
      if (prop.bindings?.figma?.kind !== 'INSTANCE_SWAP') continue;
      if (typeof prop.type !== 'object' || !('enum' in prop.type)) continue;
      const values = prop.type.enum;
      if (!values.some((v) => registryNames.has(v))) continue; // not icon-registry-shaped
      const missing = [...registryNames].filter((n) => !values.includes(n));
      const extra = values.filter((v) => !registryNames.has(v));
      if (missing.length > 0 || extra.length > 0) {
        errors.push(
          `${contract.id}: prop "${prop.name}" (INSTANCE_SWAP over ds.icons) must equal the registry exactly` +
            `${missing.length > 0 ? ` — missing: ${missing.join(', ')}` : ''}` +
            `${extra.length > 0 ? ` — not in registry: ${extra.join(', ')}` : ''}`,
        );
      }
    }
  }
}

export async function generateComponents(
  options: GenerateComponentsOptions = {},
): Promise<{ generated: string[]; outDir: string }> {
  const root = process.cwd();
  const contractsDir = options.contractsDir ?? path.join(root, 'contracts');
  const outDir = options.outDir ?? path.join(root, 'src', 'components');
  const stories = options.stories ?? true;
  const tokenInventory = loadTokenInventory(options.tokenFiles ?? defaultTokenFiles(root));
  const iconsDir = options.iconsDir ?? path.join(root, 'assets', 'icons');
  const iconAssets = loadSvgAssets(iconsDir);
  // Vector assets deliberately have their own source directory: they reuse
  // the SVG runtime, never the icon registry's square/decorative semantics.
  const vectorAssets = loadSvgAssets(options.vectorsDir ?? path.join(path.dirname(iconsDir), 'vectors'));
  const svgAssets = new Map([...iconAssets, ...vectorAssets]);
  const contractFiles =
    options.contractFiles ??
    readdirSync(contractsDir)
      .filter((f) => f.endsWith('.contract.json'))
      .map((f) => path.join(contractsDir, f));
  const errors: string[] = [];
  const generated: string[] = [];

  const parsedContracts: Contract[] = [];
  for (const filePath of contractFiles) {
    const file = path.basename(filePath);
    const raw = JSON.parse(readFileSync(filePath, 'utf8'));
    const parsed = ContractSchema.safeParse(raw);
    if (!parsed.success) {
      errors.push(
        `${file}: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`,
      );
      continue;
    }
    parsedContracts.push(parsed.data);
  }

  // Identity gates: contract ids and names must be unique across the set —
  // a duplicate id silently forks identity in the dependency map; a
  // duplicate name silently clobbers the other contract's generated output.
  const seenIds = new Map<string, string>();
  const seenNames = new Map<string, string>();
  for (const c of parsedContracts) {
    if (seenIds.has(c.id)) {
      errors.push(`${c.id}: duplicate contract id (also declared by "${seenIds.get(c.id)}")`);
    }
    seenIds.set(c.id, c.name);
    if (seenNames.has(c.name)) {
      errors.push(`${c.id}: duplicate contract name "${c.name}" (also used by ${seenNames.get(c.name)}) — would overwrite src/components/${c.name}/`);
    }
    seenNames.set(c.name, c.id);
  }

  // Icon registry gate (T022, additive/optional — Principle VI): asset
  // completeness + enum-vs-registry exactness, named by icon/prop.
  const iconRegistry = loadIconRegistry(options.iconRegistryPath ?? path.join(contractsDir, 'icons.registry.json'), errors);
  if (iconRegistry) validateIconRegistry(iconRegistry, iconAssets, parsedContracts, errors);

  // Composition graph gate: cycles and unknown refs are refused.
  let ordered: Contract[] = parsedContracts;
  if (errors.length === 0) {
    try {
      ordered = sortByDependencies(parsedContracts);
    } catch (err) {
      errors.push(String(err instanceof Error ? err.message : err));
    }
  }
  const byId = new Map(parsedContracts.map((c) => [c.id, c]));

  // Fail fast on parse/identity/graph errors: a refused contract leaves
  // dangling refs in byId, and generating dependents against a broken map
  // crashes with an unnamed TypeError INSTEAD of the named refusal — the
  // exact opposite of C2. Name the violations and stop.
  if (errors.length > 0) {
    throw new ContractViolationError(`✘ Refused — ${errors.length} contract violation(s):`, errors);
  }

  for (const contract of ordered) {
    validateContract(contract, byId, errors, svgAssets);
    if (errors.length > 0 && errors.some((e) => e.startsWith(contract.id))) continue;

    const css = generateCss(contract, tokenInventory, errors);
    if (errors.some((e) => e.startsWith(contract.id))) continue;

    const dir = path.join(outDir, contract.name);
    mkdirSync(dir, { recursive: true });

    writeFileSync(path.join(dir, `${contract.name}.module.css`), await formatCss(css));
    writeFileSync(
      path.join(dir, `${contract.name}.tsx`),
      await formatTsx(generateTsx(contract, byId, svgAssets))
    );
    if (stories) {
      writeFileSync(
        path.join(dir, `${contract.name}.stories.tsx`),
        await formatTsx(generateStories(contract, byId)),
      );
    }
    writeFileSync(
      path.join(dir, 'index.ts'),
      `export { ${contract.name} } from './${contract.name}';\nexport type { ${contract.name}Props } from './${contract.name}';\n`,
    );
    generated.push(contract.name);
  }

  if (errors.length > 0) {
    throw new ContractViolationError('✖ Contract validation failed:\n', errors);
  }

  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    path.join(outDir, 'index.ts'),
    generated.length > 0
      ? generated
          .sort()
          .map((n) => `export * from './${n}';`)
          .join('\n') + '\n'
      : // Mono-theme foundation stage (Piqueray): no components yet — emit a
        // valid empty ES module so the src/index.ts barrel re-export compiles.
        'export {};\n',
  );

  return { generated, outDir };
}

/** Shared by both shells (this script and the ds-contracts CLI): run, print
 *  the historical success/refusal wording, exit non-zero on violations. */
export async function runGenerateComponents(options: GenerateComponentsOptions = {}): Promise<void> {
  try {
    const { generated } = await generateComponents(options);
    console.log(`✔ Generated ${generated.length} component(s) from contracts: ${generated.sort().join(', ')}`);
  } catch (err) {
    if (err instanceof ContractViolationError) {
      console.error(err.header);
      for (const e of err.violations) console.error(`  - ${e}`);
      process.exit(1);
    }
    throw err;
  }
}

/** Minimal flag parsing for the script shell — no CLI framework, repo culture. */
export function parseGenerateArgs(argv: string[]): GenerateComponentsOptions {
  const options: GenerateComponentsOptions = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`${arg} needs a value`);
      return v;
    };
    if (arg === '--contracts') options.contractsDir = next();
    else if (arg === '--tokens') options.tokenFiles = next().split(',').filter(Boolean);
    else if (arg === '--icons') options.iconsDir = next();
    else if (arg === '--out') options.outDir = next();
    else if (arg === '--no-stories') options.stories = false;
    else if (arg === '--stories') options.stories = true;
    else throw new Error(`Unknown argument "${arg}" — flags: --contracts <dir> --tokens <f,f,…> --icons <dir> --out <dir> [--no-stories]`);
  }
  return options;
}

// Direct-run shell: `tsx scripts/generate-components.ts [flags]` (npm run
// generate). Filename-matched (not import.meta.url-compared) so bundling this
// module into the ds-contracts CLI can never trigger it at import time.
if (process.argv[1] && /generate-components\.(m?[tj]s)$/.test(path.resolve(process.argv[1]))) {
  await runGenerateComponents(parseGenerateArgs(process.argv.slice(2)));
}
