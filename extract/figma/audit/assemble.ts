/**
 * Assembles the positional-scan capture chunks (one per page, written by
 * capture-receiver.mjs from a walk-code.ts payload) into the committed E5
 * artifact. Classification (which instances are Button customizations,
 * which are icon-census entries) lives HERE, in versioned/diffable
 * TypeScript — not in the walk code re-typed into every figma_execute call.
 *
 * Usage: npx tsx extract/figma/audit/assemble.ts <captureDir> <outJson> [buttonSetId]
 *   captureDir   the capture-receiver.mjs outDir (one *.json chunk per page)
 *   outJson      where to write the committed E5 artifact
 *   buttonSetId  default "6:122" (« Bouton » COMPONENT_SET, Piqueray (Copy))
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

interface RawRecord {
  page: string;
  position: number[];
  nodeId: string;
  name: string;
  visible: boolean;
  mainComponentId: string | null;
  mainComponentKey: string | null;
  mainComponentName: string | null;
  /** Figma's own remote flag: true when the instance's main component lives
   *  in a DIFFERENT (library) file — the hard test for "is this really a
   *  third-party dependency", vs. a vendor-style local name (SC-007). */
  mainComponentRemote: boolean | null;
  setId: string | null;
  setKey: string | null;
  setName: string | null;
  mainComponentError: string | null;
  componentProperties: Record<string, { type: string; value: unknown }>;
  textChildren: Array<{ nodeId: string; characters: string }>;
}

interface Chunk {
  page: string;
  pageFrameId: string;
  count: number;
  records: RawRecord[];
}

interface DefaultsChunk {
  setId: string;
  setName: string;
  definitions: Record<string, { type: string; defaultValue: unknown }>;
}

const [, , captureDir, outJson, buttonSetIdArg] = process.argv;
if (!captureDir || !outJson) {
  console.error('usage: tsx assemble.ts <captureDir> <outJson> [buttonSetId=6:122]');
  process.exit(1);
}
const BUTTON_SET_ID = buttonSetIdArg ?? '6:122';

const files = readdirSync(captureDir).filter((f) => f.endsWith('.json'));
const pageChunkFiles = files.filter((f) => f !== 'defaults.json').sort();
if (pageChunkFiles.length === 0) throw new Error(`no per-page chunk files in ${captureDir} — run the walk (buildWalkCode) via figma_execute first`);
const chunks: Chunk[] = pageChunkFiles.map((f) => JSON.parse(readFileSync(path.join(captureDir, f), 'utf8')) as Chunk);
const allRecords = chunks.flatMap((c) => c.records);

// Defaults chunk (buildFetchSetDefaultsCode) is OPTIONAL but load-bearing for
// "is this an override" — without it we report raw current values only and
// say so honestly, never silently assuming "not overridden".
const defaultsPath = path.join(captureDir, 'defaults.json');
const defaultsAvailable = files.includes('defaults.json');
const defaults: DefaultsChunk | null = defaultsAvailable
  ? (JSON.parse(readFileSync(defaultsPath, 'utf8')) as DefaultsChunk)
  : null;
const defaultValueOf = (propPrefix: string): unknown => {
  if (!defaults) return undefined;
  const entry = Object.entries(defaults.definitions).find(([k]) => k.startsWith(propPrefix));
  return entry?.[1]?.defaultValue;
};

// -- Icon census: every instance whose main component's SET is NOT the
// Button set (standalone icon placements AND icons nested inside a Button
// instance both count — "268 icon instances" is a file-wide total). --
//
// KNOWN LIMITATION (smoke-tested 2026-07-23, real receipt): this is
// "everything that isn't a Button instance", not yet "only the governed
// icons" — a page can contain instances of OTHER component sets (e.g. a
// logo variant set was seen here) that this pass currently counts as icons
// too. Scoping to the true icon zone (6:111)'s master ids is T005's job
// (the masters audit) — until that list exists, treat iconCensus entries
// whose mainComponentId is NOT among the icon zone's masters as a false
// positive to filter out by hand, never as an invented true count.
const iconCounts = new Map<string, { name: string; key: string | null; remote: boolean | null; count: number }>();
for (const r of allRecords) {
  if (!r.mainComponentId || r.setId === BUTTON_SET_ID) continue;
  const entry = iconCounts.get(r.mainComponentId) ?? {
    name: r.mainComponentName ?? '(unnamed)',
    key: r.mainComponentKey,
    remote: r.mainComponentRemote,
    count: 0,
  };
  entry.count += 1;
  iconCounts.set(r.mainComponentId, entry);
}
// SC-007 check: any instance whose main component is REMOTE (defined in a
// different/library file) is a real third-party dependency — never a
// vendor-style local name mistaken for one, and never silently missed.
const remoteDependencies = [...iconCounts.entries()]
  .filter(([, v]) => v.remote === true)
  .map(([mainComponentId, v]) => ({ mainComponentId, ...v }));

// -- Button customizations: every instance of a variant belonging to the
// Button set — text + icon-swap/visibility overrides, by position. --
// DEFAULT_LABEL is the master's own default text (verified live 2026-07-23,
// all 6 variants): used only when the defaults chunk cannot carry it (there
// is no componentPropertyDefinitions entry for a plain TEXT child — the
// declared parity finding this whole feature closes). Re-verify at Step 0.
const DEFAULT_LABEL = 'Contactez-nous';
const buttonRecords = allRecords.filter((r) => r.setId === BUTTON_SET_ID);
const customizations = buttonRecords.map((r) => {
  const text = r.textChildren[0]?.characters ?? null;
  const propEntries = Object.entries(r.componentProperties);
  const findProp = (pred: (k: string) => boolean): unknown => propEntries.find(([k]) => pred(k))?.[1]?.value ?? null;
  const iconLeftGlyphKey = findProp((k) => k.startsWith('Glyphe gauche'));
  const iconRightGlyphKey = findProp((k) => k.startsWith('Glyphe droite'));
  const defaultLeft = defaultValueOf('Glyphe gauche');
  const defaultRight = defaultValueOf('Glyphe droite');
  return {
    page: r.page,
    position: r.position,
    nodeId: r.nodeId,
    variant: r.mainComponentName,
    text,
    // undefined (not false) when there's no defaults chunk to compare
    // against — an unknown must never render as "not overridden".
    textOverridden: text !== null ? text !== DEFAULT_LABEL : undefined,
    iconLeftShown: findProp((k) => k.startsWith('Icône gauche')),
    iconLeftGlyphKey,
    iconLeftGlyphOverridden: defaults ? iconLeftGlyphKey !== defaultLeft : undefined,
    iconRightShown: findProp((k) => k.startsWith('Icône droite')),
    iconRightGlyphKey,
    iconRightGlyphOverridden: defaults ? iconRightGlyphKey !== defaultRight : undefined,
  };
});

const missingMainComponent = allRecords.filter((r) => !r.mainComponentId);

const textOverrideCount = customizations.filter((c) => c.textOverridden === true).length;
const glyphOverrideCount = customizations.filter((c) => c.iconLeftGlyphOverridden === true || c.iconRightGlyphOverridden === true).length;

const out = {
  _provenance: {
    generatedBy: 'extract/figma/audit/assemble.ts',
    capturedChunks: files,
    generatedAt: new Date().toISOString(),
    buttonSetId: BUTTON_SET_ID,
    // Honesty: override counts are UNVERIFIABLE without the defaults chunk
    // (buildFetchSetDefaultsCode) — never silently reported as "0 overrides"
    // when it's actually "unknown".
    defaultsAvailable,
  },
  pages: [...new Set(allRecords.map((r) => r.page))],
  instanceCount: allRecords.length,
  iconCensus: [...iconCounts.entries()]
    .map(([mainComponentId, v]) => ({ mainComponentId, ...v }))
    .sort((a, b) => b.count - a.count),
  iconInstanceTotal: [...iconCounts.values()].reduce((a, v) => a + v.count, 0),
  remoteDependencies,
  buttonCustomizations: customizations,
  buttonInstanceTotal: buttonRecords.length,
  textOverrideCount: defaultsAvailable || buttonRecords.length > 0 ? textOverrideCount : null,
  glyphOverrideCount: defaultsAvailable ? glyphOverrideCount : null,
  // Honesty: instances whose main component could not be resolved
  // (getMainComponentAsync threw or returned null) are named, never
  // silently dropped from the count.
  unresolvedInstances: missingMainComponent.map((r) => ({ page: r.page, position: r.position, nodeId: r.nodeId, error: r.mainComponentError })),
};
writeFileSync(outJson, JSON.stringify(out, null, 1) + '\n');
console.log(
  `pages: ${out.pages.length} · instances seen: ${out.instanceCount} · icon instances: ${out.iconInstanceTotal} (${out.iconCensus.length} distinct) · Button instances: ${out.buttonInstanceTotal} · text overrides: ${out.textOverrideCount ?? 'unknown (no defaults chunk)'} · glyph overrides: ${out.glyphOverrideCount ?? 'unknown (no defaults chunk)'}${missingMainComponent.length > 0 ? ` · ${missingMainComponent.length} UNRESOLVED (named)` : ''}`,
);
if (!defaultsAvailable) {
  console.log('  NOTE: no "defaults.json" chunk found — run buildFetchSetDefaultsCode via figma_execute once per session for true override counts.');
}
if (remoteDependencies.length > 0) {
  console.log(`  SC-007: ${remoteDependencies.length} REMOTE (true third-party) component(s) in use: ${remoteDependencies.map((d) => `${d.name} ×${d.count}`).join(', ')}`);
} else {
  console.log('  SC-007: zero remote (third-party) components observed among scanned instances.');
}
console.log(`wrote ${outJson}`);
