/**
 * Headless render of ONE variant — the playground preview pipeline made
 * screenshotable. The contract is emitted by core/emit-html.ts with the
 * chosen prop values written in as defaults (the playground's
 * withOverridesAsDefaults trick), the showcase narrowed to its first item by
 * CSS, and the component element screenshotted on a TRANSPARENT body (so
 * content-box cropping is honest on both sides of the diff). Legacy captures
 * retain deviceScaleFactor 2; campaign captures paint at DPR 1 with a 2x CSS
 * zoom so fractional CSS dimensions rasterize directly onto Figma's export
 * pixel grid instead of passing through Chromium's rounded DPR backing size.
 *
 * Font honesty: the design-system font (Montserrat) is EMBEDDED as base64
 * @font-face (see embeddedFontFaces), so Chromium rasterizes the true face
 * instead of silently substituting a system font. This replaced a real bug
 * (2026-07-23): the harness trusted `document.fonts.check`, which reports a
 * registered family NAME as "available" even when no glyphs exist, so every
 * Montserrat score compared code-in-fallback against Figma-in-Montserrat.
 * `document.fonts.check` is still reported, but it is NOT trusted to gate.
 *
 * Browser: playwright-core over an already-installed Chromium (ms-playwright
 * cache, or PLAYWRIGHT_CHROMIUM_PATH, or system Chrome) — no download step.
 */
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type Page } from 'playwright-core';
import { PNG } from 'pngjs';
import { emitHtml, walkAnatomy, type Contract, type WalkedPart } from '../../../core/index.js';
import type { Interaction } from './match.js';
import type { RenderablePackage } from './compose.js';

// ---------------------------------------------------------------------------
// Embedded webfonts — the fix for the silent-fallback bug (2026-07-23).
//
// The harness renders via page.setContent (no server, no network) and used to
// rely on the font being installed on the machine. Montserrat is NOT a system
// font, so Chromium silently substituted sans-serif while `document.fonts.check`
// reported "available" (it validates the registered NAME, not that glyphs
// exist). Every Montserrat parity score was therefore code-in-a-fallback vs
// Figma-in-real-Montserrat — a false comparison that inflated width/raster
// deltas. We now EMBED the real faces as base64 @font-face so the render is
// deterministic and machine-independent. Fail loudly if the package is missing
// rather than fall back to the very bug this replaces.
// ---------------------------------------------------------------------------
const require = createRequire(import.meta.url);
/** Design-system Montserrat weights (tokens/primitives font/weight/*). */
// 700 is intentionally embedded as a real face, not browser-synthesized
// from semibold: immutable Carte masters carry a Montserrat Bold/700 range.
const MONTSERRAT_WEIGHTS = [400, 500, 600, 700] as const;

let embeddedFontFacesCache: string | null = null;
/** Exported for reuse by extract/figma/aplat-parity/render.ts (spec 006, R11
 *  jambe A) — the SAME embedded-Montserrat fix, never re-implemented, so a
 *  second harness cannot silently regress into the system-font-fallback bug
 *  this replaced (2026-07-23, see module header). */
export function embeddedFontFaces(): string {
  if (embeddedFontFacesCache !== null) return embeddedFontFacesCache;
  const faces: string[] = [];
  for (const w of MONTSERRAT_WEIGHTS) {
    const spec = `@fontsource/montserrat/files/montserrat-latin-${w}-normal.woff2`;
    let file: string;
    try {
      file = require.resolve(spec);
    } catch {
      throw new Error(
        `Visual-parity render needs the real Montserrat face "${spec}" but it is not installed. ` +
          `Run: npm install --save-dev @fontsource/montserrat  (the harness embeds the woff2 so the ` +
          `render never silently falls back to a system font again).`,
      );
    }
    const b64 = readFileSync(file).toString('base64');
    faces.push(
      `@font-face{font-family:"Montserrat";font-style:normal;font-weight:${w};font-display:block;` +
        `src:url(data:font/woff2;base64,${b64}) format("woff2");}`,
    );
  }
  embeddedFontFacesCache = `<style>${faces.join('')}</style>`;
  return embeddedFontFacesCache;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RenderedVariant {
  ok: true;
  /** PNG at 2x, clipped to the component's painted union box (+ margin). */
  png: Buffer;
  /** Text-node client rects, DEVICE px, relative to the clip origin. */
  textRects: Rect[];
  /** Root layout box, DEVICE px, relative to the clip origin. This is the
   * coordinate anchor when the Figma export has the exact same dimensions. */
  rootRect: Rect;
  /** font family → available in this browser/OS. */
  fontChecks: Record<string, boolean>;
  /** Explicitly named anatomy boxes, DEVICE px and clip-relative.  These are
   * measured only from emitted `[data-part]` attributes: class names and DOM
   * positions are never guessed to manufacture a part receipt. */
  parts?: Record<string, Rect>;
  /** Semantic snapshots selected by the campaign while its comparison page
   * was still live.  Absent on the legacy render path. */
  semantics?: DomSemanticReceipt[];
  /** Required fixture images as Chromium observed them.  `requiredImages`
   * remains as the T018 compatibility alias. */
  images?: RequiredImageReceipt[];
  /** Present for campaign renders with required fixture images. */
  requiredImages?: RequiredImageReceipt[];
  /** Non-empty/visible screenshot signal before the transparent PNG is
   * flattened for comparison.  Absent on the legacy render path. */
  visibleSignal?: VisibleSignalReceipt;
}
export interface RenderRefusal {
  ok: false;
  error: string;
}

/**
 * The campaign can name only receipts from this deliberately narrow fixture
 * boundary.  In particular, campaign JSON never supplies a URL or an
 * arbitrary filesystem path: renderer input is an id, then a pinned manifest
 * receipt, then bytes below this directory.  The resulting data URL exists
 * only in the comparison document; it is never written into the contract.
 */
const FIXTURE_ASSETS_DIR = fileURLToPath(new URL('./fixture-assets/', import.meta.url));
const SHA256 = /^[a-f0-9]{64}$/;
const FIXTURE_IMAGE_TYPES = new Set(['image/png', 'image/jpeg']);

export interface FixtureAssetReceipt {
  id: string;
  file: string;
  mediaType: 'image/png' | 'image/jpeg';
  bytes: number;
  width: number;
  height: number;
  sha256: string;
}

/** The renderer needs only the receipt inventory; Figma access stays out of
 * this module and is GET-only elsewhere. */
export interface FixtureAssetManifest {
  assets: FixtureAssetReceipt[];
}

export interface ResolvedComparisonAsset {
  id: string;
  mediaType: 'image/png' | 'image/jpeg';
  sha256: string;
  width: number;
  height: number;
  /** The verified fixture bytes, local to the generated comparison page. */
  dataUrl: string;
}

export interface ResolvedComparisonProps {
  /** Deep-cloned campaign props with every {$asset:id} replaced by a data URL. */
  props: Record<string, unknown>;
  /** Exactly the declared required image receipts used by the comparison. */
  assets: ResolvedComparisonAsset[];
}

export type ComparisonPropsResolution =
  | { ok: true; value: ResolvedComparisonProps }
  | RenderRefusal;

/** Campaign case input accepted by renderCampaignVariant.  The supplied
 * props are comparison-only: callers must not write them back to a contract
 * before calling this renderer. */
export interface CampaignComparisonInput {
  codeProps?: Record<string, unknown>;
  /**
   * GET-observed, comparison-only replacement for a declared restricted slot.
   * It is validated against the parent/child contracts and applied only to an
   * in-memory preview clone; no contract default or Figma node is changed.
   */
  slotOverrides?: unknown;
  fixtureAssetIds?: readonly string[];
  assetManifest: unknown;
  /** Assertions are evaluated by evidence.ts; the renderer only snapshots
   * their generated DOM targets while the comparison page is live. */
  semanticAssertions?: readonly CampaignSemanticAssertion[];
  /** The same neutral comparison surface used for the reference side. */
  comparisonSurface?: ComparisonSurface;
}

export type ComparisonSurface = 'light' | 'dark';

/** A declared DOM target whose actual semantics must be receipted.  `expected`
 * and `assertion` travel through untouched so the evidence layer can compare
 * the page observation to the campaign's contract-backed expectation. */
export interface CampaignSemanticAssertion {
  id: string;
  selector: string;
  assertion?: string;
  expected?: unknown;
}

export interface DomSemanticNodeReceipt {
  tagName: string;
  role: string | null;
  attributes: Record<string, string>;
  tabIndex: number;
  /** CSS-pixel layout boxes are semantic relationship facts, not image
   * geometry receipts (which remain clip-relative device pixels above). */
  box: Pick<Rect, 'width' | 'height'>;
  parent: {
    tagName: string | null;
    role: string | null;
    attributes: Record<string, string>;
    box: Pick<Rect, 'width' | 'height'> | null;
  };
  /** Useful for a tablist/roving-focus assertion without reaching back into a
   * stale page after rendering. */
  tabStops: Array<{
    role: string | null;
    tabIndex: number;
    ariaSelected: string | null;
    ariaControls: string | null;
  }>;
}

export interface DomSemanticReceipt {
  id: string;
  selector: string;
  assertion?: string;
  expected?: unknown;
  /** An invalid selector is evidence of a bad assertion, not a page crash. */
  selectorError?: string;
  matches: DomSemanticNodeReceipt[];
}

/** Screenshot signal before alpha flattening onto the shared comparison
 * surface.  Bounds are device pixels relative to the generated PNG. */
export interface VisibleSignalReceipt {
  surface: ComparisonSurface;
  alphaPixels: number;
  contrastPixels: number;
  paintedBounds: Rect | null;
}

/** Image evidence captured while the comparison page is still live. */
export interface RequiredImageReceipt {
  assetId: string;
  /** Number of preview <img> elements bound to this fixture data URL. */
  matches: number;
  complete: boolean;
  decodeOk: boolean;
  naturalWidth: number;
  naturalHeight: number;
  expectedWidth: number;
  expectedHeight: number;
  cssVisible: boolean;
  renderedWidth: number;
  renderedHeight: number;
  /** Non-transparent source pixels observed by browser canvas decoding. */
  visiblePixels: number;
}

type JsonRecord = Record<string, unknown>;
type CheckedFixtureAsset = ResolvedComparisonAsset & { file: string };

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const isPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

function fixturePath(file: unknown, id: string): string | RenderRefusal {
  if (!isNonEmptyString(file) || path.basename(file) !== file) {
    return { ok: false, error: `fixture asset "${id}" has an unsafe receipt file` };
  }
  const resolved = path.resolve(FIXTURE_ASSETS_DIR, file);
  const relative = path.relative(FIXTURE_ASSETS_DIR, resolved);
  if (
    relative === '' ||
    relative === '..' ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    return { ok: false, error: `fixture asset "${id}" resolves outside the fixture receipt directory` };
  }
  return resolved;
}

/** Validate and materialize one local receipt.  This repeats the immutable
 * receipt checks at the render boundary, so a missing/replaced file cannot be
 * mistaken for a campaign input just because the fetch step ran earlier. */
function materializeFixtureAsset(asset: unknown): CheckedFixtureAsset | RenderRefusal {
  if (!isRecord(asset) || !isNonEmptyString(asset.id)) {
    return { ok: false, error: 'fixture asset receipt must contain a non-empty id' };
  }
  const id = asset.id;
  const mediaType = typeof asset.mediaType === 'string' ? asset.mediaType : '';
  if (!FIXTURE_IMAGE_TYPES.has(mediaType)) {
    return { ok: false, error: `fixture asset "${id}" has an unsupported media type` };
  }
  if (!isPositiveInteger(asset.bytes) || !isPositiveInteger(asset.width) || !isPositiveInteger(asset.height)) {
    return { ok: false, error: `fixture asset "${id}" has an invalid size receipt` };
  }
  const sha256 = typeof asset.sha256 === 'string' ? asset.sha256 : '';
  if (!SHA256.test(sha256)) {
    return { ok: false, error: `fixture asset "${id}" has an invalid SHA-256 receipt` };
  }
  const file = fixturePath(asset.file, id);
  if (typeof file !== 'string') return file;
  const extension = path.extname(file).toLowerCase();
  if (
    (mediaType === 'image/png' && extension !== '.png') ||
    (mediaType === 'image/jpeg' && extension !== '.jpg' && extension !== '.jpeg')
  ) {
    return { ok: false, error: `fixture asset "${id}" file extension does not match its media-type receipt` };
  }

  let bytes: Buffer;
  try {
    const stat = lstatSync(file);
    if (!stat.isFile() || stat.isSymbolicLink()) {
      return { ok: false, error: `required fixture image "${id}" is not a regular receipt file` };
    }
    bytes = readFileSync(file);
  } catch {
    return { ok: false, error: `required fixture image "${id}" is absent (${path.basename(file)})` };
  }
  if (bytes.length !== asset.bytes) {
    return { ok: false, error: `fixture asset "${id}" byte length does not match its receipt` };
  }
  const actualSha256 = createHash('sha256').update(bytes).digest('hex');
  if (actualSha256 !== sha256) {
    return { ok: false, error: `fixture asset "${id}" SHA-256 does not match its receipt` };
  }

  return {
    id,
    file,
    mediaType: mediaType as CheckedFixtureAsset['mediaType'],
    sha256,
    width: asset.width,
    height: asset.height,
    dataUrl: `data:${mediaType};base64,${bytes.toString('base64')}`,
  };
}

function fixtureAssetsById(manifest: unknown): Map<string, unknown> | RenderRefusal {
  if (!isRecord(manifest) || !Array.isArray(manifest.assets)) {
    return { ok: false, error: 'fixture asset manifest must contain an assets array' };
  }
  const byId = new Map<string, unknown>();
  for (const asset of manifest.assets) {
    if (!isRecord(asset) || !isNonEmptyString(asset.id)) {
      return { ok: false, error: 'fixture asset manifest contains an asset without a non-empty id' };
    }
    if (byId.has(asset.id)) {
      return { ok: false, error: `fixture asset manifest contains duplicate id "${asset.id}"` };
    }
    byId.set(asset.id, asset);
  }
  return byId;
}

/**
 * Resolve campaign {$asset:id} sentinels without changing the campaign input
 * or its source contract.  Every referenced asset must be declared by the
 * case, every declared asset must be bound into a prop, and the receipt bytes
 * must still match before a data URL can enter the comparison document.
 */
export function resolveComparisonOnlyProps(input: CampaignComparisonInput): ComparisonPropsResolution {
  if (!isRecord(input.codeProps ?? {})) {
    return { ok: false, error: 'campaign codeProps must be an object' };
  }
  const declared = input.fixtureAssetIds ?? [];
  if (!Array.isArray(declared) || declared.some((id) => !isNonEmptyString(id)) || new Set(declared).size !== declared.length) {
    return { ok: false, error: 'campaign fixtureAssetIds must be a unique array of non-empty ids' };
  }
  const byId = fixtureAssetsById(input.assetManifest);
  if (!(byId instanceof Map)) return byId;

  const assets = new Map<string, CheckedFixtureAsset>();
  for (const id of declared) {
    const manifestAsset = byId.get(id);
    if (!manifestAsset) return { ok: false, error: `required fixture image "${id}" is absent from the manifest` };
    const materialized = materializeFixtureAsset(manifestAsset);
    if (!('dataUrl' in materialized)) return materialized;
    assets.set(id, materialized);
  }

  const used = new Set<string>();
  const resolveValue = (value: unknown): unknown | RenderRefusal => {
    if (Array.isArray(value)) {
      const out: unknown[] = [];
      for (const item of value) {
        const resolved = resolveValue(item);
        if (isRenderRefusal(resolved)) return resolved;
        out.push(resolved);
      }
      return out;
    }
    if (!isRecord(value)) return value;
    if (Object.hasOwn(value, '$asset')) {
      const keys = Object.keys(value);
      if (keys.length !== 1 || !isNonEmptyString(value.$asset)) {
        return { ok: false, error: 'campaign $asset value must contain exactly one non-empty asset id' };
      }
      const asset = assets.get(value.$asset);
      if (!asset) {
        return declared.includes(value.$asset)
          ? { ok: false, error: `required fixture image "${value.$asset}" could not be materialized` }
          : { ok: false, error: `campaign $asset "${value.$asset}" is not declared by fixtureAssetIds` };
      }
      used.add(asset.id);
      return asset.dataUrl;
    }
    const out: JsonRecord = {};
    for (const [key, nested] of Object.entries(value)) {
      const resolved = resolveValue(nested);
      if (isRenderRefusal(resolved)) return resolved;
      out[key] = resolved;
    }
    return out;
  };

  const props = resolveValue(input.codeProps ?? {});
  if (isRenderRefusal(props) || !isRecord(props)) {
    return isRenderRefusal(props) ? props : { ok: false, error: 'campaign codeProps could not be resolved' };
  }
  for (const id of declared) {
    if (!used.has(id)) {
      return { ok: false, error: `required fixture image "${id}" is not bound by a campaign $asset prop` };
    }
  }
  return {
    ok: true,
    value: {
      props,
      assets: declared.map((id) => assets.get(id)!),
    },
  };
}

function isRenderRefusal(value: unknown): value is RenderRefusal {
  return isRecord(value) && value.ok === false && typeof value.error === 'string';
}

const CLIP_MARGIN = 48; // px around the painted union box (shadows, outlines)

export function chromiumExecutable(): string {
  if (process.env.PLAYWRIGHT_CHROMIUM_PATH) return process.env.PLAYWRIGHT_CHROMIUM_PATH;
  // playwright's browser cache: macOS and Linux locations (Windows untested — use the env var).
  const caches = [
    path.join(homedir(), 'Library', 'Caches', 'ms-playwright'),
    process.env.XDG_CACHE_HOME
      ? path.join(process.env.XDG_CACHE_HOME, 'ms-playwright')
      : path.join(homedir(), '.cache', 'ms-playwright'),
  ];
  for (const cache of caches) {
    if (!existsSync(cache)) continue;
    const revs = readdirSync(cache)
      .map((d) => /^chromium-(\d+)$/.exec(d))
      .filter((m): m is RegExpExecArray => m !== null)
      .sort((a, b) => Number(b[1]) - Number(a[1]));
    for (const m of revs) {
      for (const rel of [
        'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
        'chrome-mac/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
        'chrome-mac/Chromium.app/Contents/MacOS/Chromium',
        'chrome-linux/chrome',
        'chrome-linux64/chrome',
      ]) {
        const p = path.join(cache, m[0], rel);
        if (existsSync(p)) return p;
      }
    }
  }
  for (const sys of [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ]) {
    if (existsSync(sys)) return sys;
  }
  throw new Error(
    'No Chromium found — set PLAYWRIGHT_CHROMIUM_PATH, or install one via `npx playwright install chromium`',
  );
}

export async function launchBrowser(): Promise<Browser> {
  return chromium.launch({ executablePath: chromiumExecutable(), headless: true });
}

/**
 * Campaign references are exported by Figma at 2×.  A Chromium page running
 * at DPR=2 rasterizes fractional CSS image dimensions through a rounded-up
 * intermediate bitmap (339.5px becomes 680px before the 679px root crop).
 * A DPR=1 page with a 2× comparison-context zoom preserves the component CSS
 * and source bytes while rasterizing directly onto the same final pixel grid
 * as Figma.  Legacy parity keeps its historical DPR=2 path.
 */
export const CAMPAIGN_CAPTURE_SCALE = 2;

export function campaignCapturePageOptions(
  viewport: { width: number; height: number },
  scale: number = CAMPAIGN_CAPTURE_SCALE,
): { viewport: { width: number; height: number }; deviceScaleFactor: 1 } {
  if (!Number.isFinite(scale) || scale <= 0) {
    throw new Error('campaign capture scale must be a finite positive number');
  }
  return {
    viewport: {
      width: Math.ceil(viewport.width * scale),
      height: Math.ceil(viewport.height * scale),
    },
    deviceScaleFactor: 1,
  };
}

export function campaignCaptureScaleCss(
  scale: number = CAMPAIGN_CAPTURE_SCALE,
): string {
  if (!Number.isFinite(scale) || scale <= 0) {
    throw new Error('campaign capture scale must be a finite positive number');
  }
  return `<style>body { zoom: ${scale}; }</style>`;
}

/** The playground's withOverridesAsDefaults: the chosen values become the
 *  clone's prop defaults, so the emitter's first showcase item IS the
 *  requested state. core/ stays untouched. */
function withOverridesAsDefaults(
  contract: Contract,
  subst: Record<string, string>,
  bools: Record<string, boolean>,
  comparisonProps: Record<string, unknown> = {},
): Contract {
  const clone = structuredClone(contract);
  for (const prop of clone.props) {
    if (prop.name in subst) prop.default = subst[prop.name];
    if (prop.name in bools) prop.default = bools[prop.name];
    if (Object.hasOwn(comparisonProps, prop.name)) {
      prop.default = structuredClone(comparisonProps[prop.name]) as typeof prop.default;
    }
  }
  return clone;
}

type CampaignSlotOverrideResult =
  | { ok: true; contract: Contract }
  | RenderRefusal;

const isScalarComparisonValue = (value: unknown): value is string | boolean =>
  typeof value === 'string' || typeof value === 'boolean';

/**
 * Apply immutable occurrence content to a restricted parent slot in the
 * campaign preview clone.  The runner deliberately refuses to render an
 * arbitrary child, an unknown child prop, or structured content: observed
 * composition remains bound to the existing contract relationship.
 */
export function applyCampaignSlotOverrides(
  contract: Contract,
  contracts: ReadonlyMap<string, Contract>,
  candidate: unknown,
): CampaignSlotOverrideResult {
  const clone = structuredClone(contract);
  if (candidate === undefined) return { ok: true, contract: clone };
  if (!isRecord(candidate)) {
    return { ok: false, error: 'campaign slotOverrides must be an object keyed by declared slot part' };
  }

  const slots = new Map<string, WalkedPart>();
  for (const walked of walkAnatomy(clone)) {
    if (!walked.part.slot) continue;
    if (slots.has(walked.name)) {
      return { ok: false, error: `campaign slot override is ambiguous: duplicate slot part "${walked.name}"` };
    }
    slots.set(walked.name, walked);
  }

  for (const [partName, rawOverride] of Object.entries(candidate)) {
    const walked = slots.get(partName);
    if (!walked) {
      return { ok: false, error: `campaign slot override names no declared slot part "${partName}"` };
    }
    const slot = walked.part.slot;
    if (!slot) {
      return { ok: false, error: `campaign slot override names no declared slot part "${partName}"` };
    }
    if (!isRecord(rawOverride)) {
      return { ok: false, error: `campaign slot override "${partName}" must be an object` };
    }
    const unknownKeys = Object.keys(rawOverride).filter((key) => key !== 'contractId' && key !== 'props');
    if (unknownKeys.length > 0) {
      return { ok: false, error: `campaign slot override "${partName}" has unsupported key(s): ${unknownKeys.sort().join(', ')}` };
    }
    const contractId = rawOverride.contractId;
    if (typeof contractId !== 'string' || contractId.trim().length === 0) {
      return { ok: false, error: `campaign slot override "${partName}" requires a non-empty contractId` };
    }
    const child = contracts.get(contractId);
    if (!child) {
      return { ok: false, error: `campaign slot override "${partName}" references unknown child contract "${contractId}"` };
    }
    if (!(slot.accepts ?? []).includes(contractId)) {
      return { ok: false, error: `campaign slot override "${partName}" child "${contractId}" is not accepted by the parent contract` };
    }
    const rawProps = rawOverride.props;
    if (rawProps !== undefined && !isRecord(rawProps)) {
      return { ok: false, error: `campaign slot override "${partName}" props must be an object of scalar values` };
    }
    const props: Record<string, string | boolean> = {};
    for (const [propName, value] of Object.entries(rawProps ?? {})) {
      if (!child.props.some((prop) => prop.name === propName)) {
        return { ok: false, error: `campaign slot override "${partName}" names unknown child prop "${propName}"` };
      }
      if (!isScalarComparisonValue(value)) {
        return { ok: false, error: `campaign slot override "${partName}" prop "${propName}" must be a string or boolean scalar` };
      }
      props[propName] = value;
    }
    // This walked part belongs to `clone`. The narrowed props match the
    // schema's defaultContent scalar domain exactly.
    slot.defaultContent = [
      { id: contractId, ...(Object.keys(props).length > 0 ? { props } : {}) },
    ];
  }
  return { ok: true, contract: clone };
}

/** Frame CSS: transparent body (content-box crop needs it), single-item
 *  showcase, animations frozen (a spinner must not smear the diff). */
const FRAME_CSS = `
  body { margin: 0; padding: 32px; background: transparent; color: #1a1a1a;
         font-family: var(--font-family-sans, system-ui, sans-serif); }
  .showcase > .showcase__item:nth-child(n + 2) { display: none; }
  .showcase__label { display: none; }
  *, *::before, *::after { animation-play-state: paused !important; transition: none !important; }
`;

const ROOT_SELECTOR = '.showcase > .showcase__item:first-child > :nth-child(2)';
const FIRST_ITEM_SELECTOR = '.showcase > .showcase__item:first-child';

/** subjects.ts ContractSubject.renderWidth and campaign root-size override,
 *  scoped to a CSS block. The showcase's first item gets a definite size
 *  (overriding its default
 *  flex-item shrink-to-fit — .showcase's `align-items: flex-start` — with an
 *  explicit size), and the component root fills it. `width: 100%` (not the
 *  raw px) plus `box-sizing: border-box` on the root matters for the native
 *  form controls (input/textarea are replaced elements — an 'auto' width
 *  does NOT stretch to a definite containing block, but an explicit
 *  percentage width DOES, per the CSS2.1 replaced-element width algorithm);
 *  a plain box (e.g. Select's wrapper <div>) would already fill from the
 *  container fix alone, so this is one rule that is correct for both DOM
 *  shapes rather than branching per subject. Campaign height is equally
 *  bounded: only a positive pinned GET root height can set it.
 */
export function renderContextSizeCss(
  renderWidth: number | undefined,
  renderHeight: number | undefined,
): string {
  const width = Number.isFinite(renderWidth) && (renderWidth ?? 0) > 0
    ? renderWidth
    : undefined;
  const height = Number.isFinite(renderHeight) && (renderHeight ?? 0) > 0
    ? renderHeight
    : undefined;
  if (!width && !height) return '';
  const itemDeclarations = [
    width ? `width: ${width}px` : null,
    height ? `height: ${height}px` : null,
  ].filter((value): value is string => value !== null);
  const rootDeclarations = [
    width ? 'width: 100%' : null,
    height ? 'height: 100%' : null,
    'box-sizing: border-box',
  ].filter((value): value is string => value !== null);
  return `<style>
    ${FIRST_ITEM_SELECTOR} { ${itemDeclarations.join('; ')}; }
    ${ROOT_SELECTOR} { ${rootDeclarations.join('; ')}; }
  </style>`;
}

/**
 * A campaign occurrence can sit inside a wider canvas while a named child
 * frame has its own measured width (for example Field's Saisie frame).  The
 * reusable contract remains fluid; this narrowly reconstructs that external
 * layout fact for the code-side comparison only.  Part names come from the
 * campaign validator's `figmaPartNodeIds` allow-list, and the actual numbers
 * come from the same pinned GET receipt used by geometry evidence.
 */
function renderPartWidthCss(
  partWidths: Readonly<Record<string, number>> | undefined,
): string {
  if (!partWidths) return '';
  const declarations = Object.entries(partWidths)
    .filter(([, width]) => Number.isFinite(width) && width > 0)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([partName, width]) => {
      const selectorValue = partName
        .replaceAll('\\', '\\\\')
        .replaceAll('"', '\\"')
        .replaceAll('\n', '\\a ')
        .replaceAll('\r', '\\d ');
      return `[data-part="${selectorValue}"] { width: ${width}px; }`;
    });
  return declarations.length > 0 ? `<style>${declarations.join('\n')}</style>` : '';
}

const escapeHtmlAttribute = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

/**
 * A Tab leaf never emits its own tablist or roving-focus controller.  When
 * the contract explicitly names that *external* boundary, the comparison
 * document supplies the smallest inspectable owner around the static
 * showcase.  The wrapper is preview-only (not emitted component anatomy),
 * receives its id solely from the declared code prop, and adds no visual CSS.
 * A missing runtime id leaves the context absent so the semantic receipt
 * fails honestly instead of minting a fallback identity.
 */
function externalTabContextPreview(contract: Contract): { open: string; close: string } | null {
  const context = contract.anatomy.root?.tabContext;
  if (!context) return null;
  const identity = contract.props.find((prop) => prop.name === context.idProp)?.default;
  if (typeof identity !== 'string' || identity.trim().length === 0) return null;
  return {
    open: `<div role="tablist" id="${escapeHtmlAttribute(identity)}" data-context-owner="external">`,
    close: '</div>',
  };
}

export function previewDoc(
  pkg: RenderablePackage,
  contract: Contract,
  figmaFontFamily: string | null,
  contextRootWidth?: number,
  contextPartWidths?: Readonly<Record<string, number>>,
  contextRootHeight?: number,
  captureScale = 1,
): string {
  const emitted = emitHtml(contract, { tokens: pkg.inventory, icons: pkg.icons, contracts: pkg.contracts });
  const context = externalTabContextPreview(contract);
  const emittedHtml = context ? `${context.open}\n${emitted.html}${context.close}` : emitted.html;
  const fontOverride = figmaFontFamily
    ? `<style>.showcase { font-family: "${figmaFontFamily}", var(--font-family-sans, system-ui, sans-serif); }</style>`
    : '';
  const sizeOverride = renderContextSizeCss(
    contextRootWidth ?? (pkg.subject.kind === 'contract' ? pkg.subject.renderWidth : undefined),
    contextRootHeight,
  );
  const partWidthOverride = renderPartWidthCss(contextPartWidths);
  return [
    '<!doctype html>',
    '<html><head><meta charset="utf-8">',
    // Embedded real Montserrat FIRST, so the design-system CSS below resolves
    // "Montserrat" to the true face instead of Chromium's silent fallback.
    embeddedFontFaces(),
    `<style>${pkg.tokensCss}</style>`,
    `<style>${FRAME_CSS}</style>`,
    `<style>${emitted.css}</style>`,
    captureScale === 1 ? '' : campaignCaptureScaleCss(captureScale),
    fontOverride,
    sizeOverride,
    partWidthOverride,
    '</head><body>',
    emittedHtml,
    '</body></html>',
  ]
    .filter(Boolean)
    .join('\n');
}

interface PageMeasurement {
  clip: Rect;
  rootRect: Rect;
  parts: Record<string, Rect>;
  textRects: Rect[];
  fontChecks: Record<string, boolean>;
  devicePixelRatio: number;
  found: boolean;
}

export async function renderVariant(
  page: Page,
  pkg: RenderablePackage,
  subst: Record<string, string>,
  bools: Record<string, boolean>,
  interaction: Interaction,
  figmaFonts: string[],
  comparisonProps: Record<string, unknown> = {},
  contextRootWidth?: number,
  slotOverrides?: unknown,
  contextPartWidths?: Readonly<Record<string, number>>,
  contextRootHeight?: number,
  captureScale = 1,
): Promise<RenderedVariant | RenderRefusal> {
  let doc: string;
  const propOverridden = withOverridesAsDefaults(
    pkg.contract,
    subst,
    bools,
    comparisonProps,
  );
  const slotted = applyCampaignSlotOverrides(propOverridden, pkg.contracts, slotOverrides);
  if (!slotted.ok) return slotted;
  const contract = slotted.contract;
  const family = figmaFonts[0] ?? null;
  try {
    doc = previewDoc(
      pkg,
      contract,
      family,
      contextRootWidth,
      contextPartWidths,
      contextRootHeight,
      captureScale,
    );
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
  // Campaign fixtures can embed verified source images larger than 20 MB as
  // data URLs. Waiting for the frame-wide `load` event made those honest
  // bytes hit Playwright's navigation timeout before Chromium exposed the
  // image decoder. Parse the DOM first, then settle non-empty images through
  // their explicit decode promises before measuring or screenshotting.
  await page.setContent(doc, { waitUntil: 'domcontentloaded', timeout: 180_000 });
  const imagesSettled = await page.evaluate(`Promise.race([
    Promise.all(Array.from(document.images)
      .filter((image) => image.getAttribute('src'))
      .map((image) => image.complete
        ? Promise.resolve()
        : image.decode().catch(() => undefined)))
      .then(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), 120000))
  ])`) as boolean;
  if (!imagesSettled) {
    return { ok: false, error: 'preview images did not settle within 120000ms' };
  }
  // NOTE: in-page callbacks are STRINGS, not closures — tsx/esbuild injects a
  // `__name` keep-names helper into serialized functions that does not exist
  // in the page context (ReferenceError on every evaluate).
  // BOUNDED font settle (heal-round harness fix): page.evaluate has NO
  // default timeout, and document.fonts.ready occasionally never resolves in
  // headless Chromium — the run hung INDEFINITELY mid-suite (observed three
  // times on the 1,106-render live replay, different subjects each time).
  // 5s covers every local-font settle; a hung ready-promise now proceeds
  // after the bound instead of stalling the whole harness. Pixels are
  // unchanged whenever fonts settle (they settle in milliseconds locally).
  await page.evaluate('Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 5000))])');

  // Neutralize residual pointer state: the page's virtual mouse KEEPS its
  // position across setContent, so a prior hover/active row leaves :hover
  // matching on the NEXT row's element (field failure: every CBDS/Eventz
  // focus row screenshotted the HOVER fill under the focus ring — 68-70%
  // masked — because the hover row ran just before on the same page).
  // (0,0) is inside the body's 32px padding, off every component.
  await page.mouse.move(0, 0);

  // Interaction BEFORE measuring (a hover style could move descendants).
  const root = page.locator(ROOT_SELECTOR);
  if ((await root.count()) === 0) return { ok: false, error: `preview markup has no ${ROOT_SELECTOR}` };
  if (interaction === 'hover') {
    // POINTER hover, not locator.hover: the locator's actionability check
    // refuses a zero-size target with a 30s timeout — a root projected off
    // its void/raw-text element (content-model honesty) can carry no
    // intrinsic box when its children's geometry lives in zero-mint stubs
    // (the 197dd02 limit; heal-round field case: Checkbox-icon/Toggle-icon
    // hover rows). CSS :hover matches every ancestor of the hovered point,
    // so moving the mouse to the box center (or just inside the origin when
    // the box is empty — flex children paint from there) applies the same
    // hover styling locator.hover would; bounded, never a 30s stall.
    const box = await root.boundingBox();
    if (!box) return { ok: false, error: 'hover target has no layout box' };
    await page.mouse.move(
      box.x + (box.width > 0 ? box.width / 2 : 2),
      box.y + (box.height > 0 ? box.height / 2 : 2),
    );
  }
  if (interaction === 'focus-visible') await page.keyboard.press('Tab');
  if (interaction === 'active') {
    const box = await root.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
    }
  }

  // String-bodied evaluate (see the __name note above).
  const MEASURE_JS = `(() => {
    const args = ${JSON.stringify({
      selector: ROOT_SELECTOR,
      margin: CLIP_MARGIN * captureScale,
      fonts: figmaFonts,
    })};
    const el = document.querySelector(args.selector);
    if (!el) return { found: false, clip: { x: 0, y: 0, width: 0, height: 0 }, rootRect: { x: 0, y: 0, width: 0, height: 0 }, parts: {}, textRects: [], fontChecks: {}, devicePixelRatio: window.devicePixelRatio };
    const rootBox = el.getBoundingClientRect();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const union = (r) => {
      if (r.width === 0 && r.height === 0) return;
      if (r.left < minX) minX = r.left;
      if (r.top < minY) minY = r.top;
      if (r.right > maxX) maxX = r.right;
      if (r.bottom > maxY) maxY = r.bottom;
    };
    union(el.getBoundingClientRect());
    for (const d of el.querySelectorAll('*')) union(d.getBoundingClientRect());
    const clip = {
      x: Math.max(0, minX - args.margin),
      y: Math.max(0, minY - args.margin),
      width: maxX - minX + 2 * args.margin,
      height: maxY - minY + 2 * args.margin,
    };
    const textRects = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent || n.textContent.trim().length === 0) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      for (const r of range.getClientRects()) {
        if (r.width === 0 || r.height === 0) continue;
        textRects.push({ x: r.left - clip.x, y: r.top - clip.y, width: r.width, height: r.height });
      }
    }
    const fontChecks = {};
    for (const f of args.fonts) fontChecks[f] = document.fonts.check('16px "' + f + '"');
    const rootRect = {
      x: rootBox.left - clip.x,
      y: rootBox.top - clip.y,
      width: rootBox.width,
      height: rootBox.height,
    };
    const parts = {};
    for (const part of el.querySelectorAll('[data-part]')) {
      const name = part.getAttribute('data-part');
      // No class-name fallback: a part is a receipt only when the generated
      // comparison DOM named it explicitly.  Contract anatomy names are
      // globally unique, so a duplicate would be invalid upstream; retaining
      // the first DOM-order box keeps this probe deterministic while the
      // duplicate remains observable in the page markup.
      if (!name || Object.hasOwn(parts, name)) continue;
      const box = part.getBoundingClientRect();
      parts[name] = {
        x: box.left - clip.x,
        y: box.top - clip.y,
        width: box.width,
        height: box.height,
      };
    }
    return { found: true, clip, rootRect, parts, textRects, fontChecks, devicePixelRatio: window.devicePixelRatio };
  })()`;
  const m = (await page.evaluate(MEASURE_JS)) as PageMeasurement;
  if (!m.found) return { ok: false, error: 'component root not found for measurement' };

  const png = await page.screenshot({ clip: m.clip, omitBackground: true });
  if (interaction === 'active') await page.mouse.up();

  const dpr = m.devicePixelRatio;
  return {
    ok: true,
    png: Buffer.from(png),
    textRects: m.textRects.map((r) => ({
      x: r.x * dpr,
      y: r.y * dpr,
      width: r.width * dpr,
      height: r.height * dpr,
    })),
    rootRect: {
      x: m.rootRect.x * dpr,
      y: m.rootRect.y * dpr,
      width: m.rootRect.width * dpr,
      height: m.rootRect.height * dpr,
    },
    parts: Object.fromEntries(
      Object.entries(m.parts).map(([name, rect]) => [
        name,
        {
          x: rect.x * dpr,
          y: rect.y * dpr,
          width: rect.width * dpr,
          height: rect.height * dpr,
        },
      ]),
    ),
    fontChecks: m.fontChecks,
  };
}

/** The generated screenshot is transparent by design.  Count both its raw
 * alpha footprint and the pixels that remain distinguishable after the same
 * neutral surface is applied to both sides of a comparison. */
function inspectVisibleSignal(pngBytes: Buffer, surface: ComparisonSurface): VisibleSignalReceipt {
  const png = PNG.sync.read(pngBytes);
  const background = surface === 'light' ? 255 : 32;
  let alphaPixels = 0;
  let contrastPixels = 0;
  let minX = png.width;
  let minY = png.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const index = (y * png.width + x) * 4;
      const alphaByte = png.data[index + 3];
      if (alphaByte === 0) continue;
      alphaPixels += 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);

      const alpha = alphaByte / 255;
      const red = Math.round(png.data[index] * alpha + background * (1 - alpha));
      const green = Math.round(png.data[index + 1] * alpha + background * (1 - alpha));
      const blue = Math.round(png.data[index + 2] * alpha + background * (1 - alpha));
      if (red !== background || green !== background || blue !== background) contrastPixels += 1;
    }
  }

  return {
    surface,
    alphaPixels,
    contrastPixels,
    paintedBounds:
      maxX < 0
        ? null
        : { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 },
  };
}

/** Capture just the declared semantic targets while the generated document is
 * alive.  Evidence owns the assertion verdict; the renderer merely reports
 * the DOM facts (including zero matches and malformed selectors) faithfully. */
export async function inspectDomSemantics(
  page: Page,
  assertions: readonly CampaignSemanticAssertion[] | undefined,
  captureScale = 1,
): Promise<DomSemanticReceipt[]> {
  if (!assertions || assertions.length === 0) return [];
  const SEMANTIC_PROBE_JS = `(() => {
    const args = ${JSON.stringify({ rootSelector: ROOT_SELECTOR, assertions, captureScale })};
    const root = document.querySelector(args.rootSelector);
    const attributes = (element) => Object.fromEntries(
      Array.from(element.attributes, (attribute) => [attribute.name, attribute.value])
        .sort(([a], [b]) => a.localeCompare(b)),
    );
    const box = (element) => {
      const rect = element.getBoundingClientRect();
      return {
        width: rect.width / args.captureScale,
        height: rect.height / args.captureScale,
      };
    };
    const node = (element) => {
      const parent = element.parentElement;
      return {
        tagName: element.tagName.toLowerCase(),
        role: element.getAttribute('role'),
        attributes: attributes(element),
        tabIndex: element.tabIndex,
        box: box(element),
        parent: parent
          ? {
              tagName: parent.tagName.toLowerCase(),
              role: parent.getAttribute('role'),
              attributes: attributes(parent),
              box: box(parent),
            }
          : { tagName: null, role: null, attributes: {}, box: null },
        tabStops: Array.from(element.querySelectorAll('[role="tab"]')).map((tab) => ({
          role: tab.getAttribute('role'),
          tabIndex: tab.tabIndex,
          ariaSelected: tab.getAttribute('aria-selected'),
          ariaControls: tab.getAttribute('aria-controls'),
        })),
      };
    };
    return args.assertions.map((assertion) => {
      const receipt = {
        id: assertion.id,
        selector: assertion.selector,
        ...(assertion.assertion === undefined ? {} : { assertion: assertion.assertion }),
        ...(assertion.expected === undefined ? {} : { expected: assertion.expected }),
        matches: [],
      };
      if (!root) return receipt;
      try {
        const matches = [];
        if (assertion.assertion === 'keyboard-context') {
          // A Tab declares its tablist as an external composition owner. Only
          // this assertion may inspect that explicit ancestor; every other
          // semantic assertion remains confined to the component root.
          const owner = root.closest(assertion.selector);
          if (owner) matches.push(owner);
        } else {
          if (root.matches(assertion.selector)) matches.push(root);
          for (const element of root.querySelectorAll(assertion.selector)) {
            if (element !== root) matches.push(element);
          }
        }
        receipt.matches = matches.map(node);
      } catch (error) {
        receipt.selectorError = error instanceof Error ? error.message : String(error);
      }
      return receipt;
    });
  })()`;
  return (await page.evaluate(SEMANTIC_PROBE_JS)) as DomSemanticReceipt[];
}

type ImageProbe = {
  assetId: string;
  matches: number;
  complete: boolean;
  naturalWidth: number;
  naturalHeight: number;
  expectedWidth: number;
  expectedHeight: number;
  decodeOk: boolean;
  cssVisible: boolean;
  renderedWidth: number;
  renderedHeight: number;
  visiblePixels: number;
};

/**
 * Browser-side image assertions, deliberately after setContent: Node can
 * verify the receipt bytes but only Chromium can prove that the emitted img
 * actually decoded and paints into a non-zero visible box.  A transparent PNG
 * is not sufficient evidence merely because it has natural dimensions.
 */
async function inspectRequiredImages(
  page: Page,
  assets: readonly ResolvedComparisonAsset[],
  captureScale = 1,
): Promise<RequiredImageReceipt[] | RenderRefusal> {
  if (assets.length === 0) return [];
  // String source, rather than a serialized closure: render.ts is executed
  // through tsx/esbuild and closures can acquire unavailable helpers.
  const IMAGE_PROBE_JS = `(async () => {
    const args = ${JSON.stringify({
      required: assets.map(({ id, dataUrl, width, height }) => ({ id, dataUrl, width, height })),
      captureScale,
    })};
    const required = args.required;
    const comparisonRoot = document.querySelector(${JSON.stringify(ROOT_SELECTOR)});
    if (!comparisonRoot) return required.map((asset) => ({
      assetId: asset.id,
      matches: 0,
      complete: false,
      naturalWidth: 0,
      naturalHeight: 0,
      expectedWidth: asset.width,
      expectedHeight: asset.height,
      decodeOk: false,
      cssVisible: false,
      renderedWidth: 0,
      renderedHeight: 0,
      visiblePixels: 0,
    }));
    const visibleByStyle = (image) => {
      const rect = image.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;
      for (let el = image; el; el = el.parentElement) {
        const style = getComputedStyle(el);
        if (style.display === 'none' || style.visibility !== 'visible' || style.contentVisibility === 'hidden') return false;
        if (Number.parseFloat(style.opacity || '1') === 0) return false;
      }
      return true;
    };
    const sourcePixels = (image) => {
      if (!image.naturalWidth || !image.naturalHeight) return 0;
      const largestSide = 256;
      const scale = Math.min(1, largestSide / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      try {
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) return 0;
        context.drawImage(image, 0, 0, width, height);
        const data = context.getImageData(0, 0, width, height).data;
        let visible = 0;
        for (let index = 3; index < data.length; index += 4) if (data[index] > 0) visible += 1;
        return visible;
      } catch {
        return 0;
      }
    };
    const probes = [];
    for (const asset of required) {
      const comparisonImages = [
        ...(comparisonRoot instanceof HTMLImageElement ? [comparisonRoot] : []),
        ...comparisonRoot.querySelectorAll('img'),
      ];
      const matches = comparisonImages.filter((image) =>
        image.getAttribute('src') === asset.dataUrl || image.currentSrc === asset.dataUrl || image.src === asset.dataUrl,
      );
      const candidates = [];
      for (const image of matches) {
        let decodeOk = false;
        try {
          if (typeof image.decode === 'function') await image.decode();
          decodeOk = true;
        } catch {
          decodeOk = false;
        }
        const visiblePixels = sourcePixels(image);
        const decodedInCanvas =
          image.naturalWidth > 0 &&
          image.naturalHeight > 0 &&
          visiblePixels > 0;
        const rect = image.getBoundingClientRect();
        candidates.push({
          // HTMLImageElement.decode() resolving is the browser's stronger
          // readiness signal for a data-URL fixture.  Chromium can otherwise
          // report complete false in this same task even though it has
          // decoded and painted the bytes below; treating that successful
          // decode as complete prevents a false asset-invalid receipt.
          complete: image.complete === true || decodeOk || decodedInCanvas,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
          // Canvas has just painted this same decoded HTML image.  Some
          // Chromium JPEG decoders reject decode() after that point despite
          // exposing complete pixels, so retain the stronger observed signal.
          decodeOk: decodeOk || decodedInCanvas,
          cssVisible: visibleByStyle(image),
          renderedWidth: rect.width / args.captureScale,
          renderedHeight: rect.height / args.captureScale,
          visiblePixels,
        });
      }
      const decoded = candidates.filter((candidate) =>
        candidate.complete && candidate.decodeOk && candidate.naturalWidth > 0 && candidate.naturalHeight > 0,
      );
      const visible = decoded.find((candidate) => candidate.cssVisible && candidate.visiblePixels > 0);
      const representative = visible ?? decoded[0] ?? candidates[0];
      probes.push({
        assetId: asset.id,
        matches: matches.length,
        complete: representative?.complete ?? false,
        naturalWidth: representative?.naturalWidth ?? 0,
        naturalHeight: representative?.naturalHeight ?? 0,
        expectedWidth: asset.width,
        expectedHeight: asset.height,
        decodeOk: representative?.decodeOk ?? false,
        cssVisible: representative?.cssVisible ?? false,
        renderedWidth: representative?.renderedWidth ?? 0,
        renderedHeight: representative?.renderedHeight ?? 0,
        visiblePixels: representative?.visiblePixels ?? 0,
      });
    }
    return probes;
  })()`;
  const probes = (await page.evaluate(IMAGE_PROBE_JS)) as ImageProbe[];
  const receipts: RequiredImageReceipt[] = [];
  for (const probe of probes) {
    if (probe.matches === 0) {
      return { ok: false, error: `required fixture image "${probe.assetId}" is absent from preview markup` };
    }
    if (!probe.complete || !probe.decodeOk || probe.naturalWidth <= 0 || probe.naturalHeight <= 0) {
      return { ok: false, error: `required fixture image "${probe.assetId}" is undecodable in Chromium` };
    }
    if (probe.naturalWidth !== probe.expectedWidth || probe.naturalHeight !== probe.expectedHeight) {
      return {
        ok: false,
        error: `required fixture image "${probe.assetId}" decoded ${probe.naturalWidth}x${probe.naturalHeight}, not its receipt ${probe.expectedWidth}x${probe.expectedHeight}`,
      };
    }
    if (!probe.cssVisible || probe.renderedWidth <= 0 || probe.renderedHeight <= 0 || probe.visiblePixels <= 0) {
      return { ok: false, error: `required fixture image "${probe.assetId}" has no visible pixels in preview` };
    }
    receipts.push({
      assetId: probe.assetId,
      matches: probe.matches,
      complete: probe.complete,
      decodeOk: probe.decodeOk,
      naturalWidth: probe.naturalWidth,
      naturalHeight: probe.naturalHeight,
      expectedWidth: probe.expectedWidth,
      expectedHeight: probe.expectedHeight,
      cssVisible: probe.cssVisible,
      renderedWidth: probe.renderedWidth,
      renderedHeight: probe.renderedHeight,
      visiblePixels: probe.visiblePixels,
    });
  }
  return receipts;
}

/**
 * Campaign-only companion to renderVariant.  It resolves fixture receipts
 * into an ephemeral data URL, overlays typed values only on the cloned preview
 * contract, and verifies each required image after Chromium has rendered it.
 * Structured defaults (notably rich-text segment arrays) stay structured
 * through validation instead of being flattened into an invalid scalar.
 * Legacy visual parity callers continue to use renderVariant and never see
 * fixture data.
 */
export async function renderCampaignVariant(
  page: Page,
  pkg: RenderablePackage,
  subst: Record<string, string>,
  bools: Record<string, boolean>,
  interaction: Interaction,
  figmaFonts: string[],
  comparison: CampaignComparisonInput,
  contextRootWidth?: number,
  contextPartWidths?: Readonly<Record<string, number>>,
  contextRootHeight?: number,
): Promise<RenderedVariant | RenderRefusal> {
  const resolved = resolveComparisonOnlyProps(comparison);
  if (!resolved.ok) return resolved;

  const rendered = await renderVariant(
    page,
    pkg,
    subst,
    bools,
    interaction,
    figmaFonts,
    resolved.value.props,
    contextRootWidth,
    comparison.slotOverrides,
    contextPartWidths,
    contextRootHeight,
    CAMPAIGN_CAPTURE_SCALE,
  );
  if (!rendered.ok) return rendered;
  const images = await inspectRequiredImages(
    page,
    resolved.value.assets,
    CAMPAIGN_CAPTURE_SCALE,
  );
  if (!Array.isArray(images)) return images;
  const semantics = await inspectDomSemantics(
    page,
    comparison.semanticAssertions,
    CAMPAIGN_CAPTURE_SCALE,
  );
  const surface = comparison.comparisonSurface === 'dark' ? 'dark' : 'light';
  return {
    ...rendered,
    semantics,
    images,
    // Keep T018's public field while exposing the general campaign receipt
    // name expected by evidence.ts.
    requiredImages: images,
    visibleSignal: inspectVisibleSignal(rendered.png, surface),
  };
}
