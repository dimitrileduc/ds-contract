/**
 * The Chromium leg of the organism audit (013): build and photograph the
 * component this repository actually ships.
 *
 * D4 says the generated React library is the only authoritative surface, so
 * this harness bundles the real file under `src/components/**` with the real
 * Vite + React toolchain and renders it in a real browser.  Rendering the
 * contract through `core/emit-html` instead would compare the emitter to the
 * emitter; that string is never produced here.  (Importing the visual-parity
 * renderer does pull `core/emit-html` into the module graph as a transitive
 * dependency — it is loaded, never called.  Every pixel below comes from
 * React.)
 *
 * Nothing about the capture mechanics is new.  The DPR=1 + 2x-zoom model, the
 * embedded Montserrat faces, the browser resolution and the painted-union clip
 * are all imported from `extract/figma/visual-parity/render.ts` (spec 011), so
 * a second harness cannot silently regress into the bugs that one already
 * paid for — above all the silent system-font fallback of 2026-07-23, where
 * `document.fonts.check` reported a registered family NAME as available while
 * Chromium rasterized no Montserrat glyph at all.  Font checks are reported
 * here for the same reason they are reported there: as evidence, never as the
 * thing that makes the render honest.  The embedded faces do that.
 *
 * Reference: research.md D4; extract/figma/visual-parity/render.ts.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import react from '@vitejs/plugin-react';
import type { Page } from 'playwright-core';
import { build, type InlineConfig } from 'vite';
import {
  CAMPAIGN_CAPTURE_SCALE,
  campaignCapturePageOptions,
  campaignCaptureScaleCss,
  CLIP_MARGIN,
  embeddedFontFaces,
  launchBrowser,
} from '../visual-parity/render.js';

/**
 * FLOOR for the layout width, in CSS px (pre-zoom) — not a fixed viewport.
 *
 * The Piqueray organisms are full-page sections: most masters are 1728 px wide,
 * `sav` is 1550.  A fixed 1600 px viewport clipped every one of them, and the
 * harness (correctly) refused rather than photographing a truncated organism.
 * The effective width is therefore derived from the pinned Figma root plus the
 * clip margin on both sides, and only falls back to this floor when no
 * reference width is supplied.
 */
const VIEWPORT_CSS_WIDTH = 1600;
/** Starting viewport height in CSS px; grown, never silently truncated. */
const VIEWPORT_CSS_HEIGHT = 1200;
/** Ceiling on the grow-to-fit retry.  Beyond this the harness refuses. */
const MAX_VIEWPORT_CSS_HEIGHT = 8000;

/**
 * `HarnessElementReceipt.text` truncation, in characters.
 *
 * Generous on purpose, and paired with `textLength`.  A limit tight enough to
 * cut real design-system copy turns every text assertion over a long string
 * into a silent false FAIL — the receipt reports a difference the component
 * does not have.  Presentation's `texte` default is 314 characters and was
 * truncated by the original 300-char limit, which is exactly how an instrument
 * manufactures the divergence it was built to detect.  `textLength` is always
 * the untruncated length, so a caller can tell "different" from "clipped".
 */
const TEXT_LIMIT = 4000;

/** The design-system weights embedded by `embeddedFontFaces()`. */
const FONT_WEIGHTS = [400, 500, 600, 700] as const;
const FONT_QUERIES = FONT_WEIGHTS.map((weight) => `${weight} 16px "Montserrat"`);

/** Where `entry.jsx` mounts the subject. */
const HARNESS_MOUNT_SELECTOR = '#root';

/**
 * Bumped whenever the build recipe below changes shape, so a `configSha256`
 * captured before the change can never collide with one captured after.
 */
const HARNESS_RECIPE_VERSION = 1;

/** The scoped-class shape produced by `generateScopedName`, for the manifest. */
const SCOPED_NAME_RECIPE = '<ModuleBasename>__<localName>';

/** Every scratch path must resolve inside this, relative to the repo root. */
const SCRATCH_ROOT_RELATIVE = path.join('extract', 'figma', 'organism-audit', 'out');

/** Only the shipping library may be photographed (D4). */
const SHIPPING_ROOT_RELATIVE = path.join('src', 'components');

/**
 * Frame CSS for the harness page.
 *
 * Deliberately NOT a copy of visual-parity's FRAME_CSS: that one sets a body
 * `font-family` and `color` so a showcase reads pleasantly, which would mask
 * exactly the defects this audit exists to find.  A component that forgot to
 * bind its font-family or its text colour must fall back to the browser
 * default here and be visible as wrong, not inherit a plausible-looking one
 * from the harness.  The animation freeze IS carried over verbatim — a
 * mid-transition frame is a non-deterministic pixel.
 *
 * The 48px padding is the CSS-px room the 2x-zoomed CLIP_MARGIN needs on every
 * side; without it the clip origin clamps at 0 and the crop loses its margin.
 */
const HARNESS_FRAME_CSS = `
  body { margin: 0; padding: ${CLIP_MARGIN}px; background: transparent; }
  #root { display: block; }
  *, *::before, *::after { animation-play-state: paused !important; transition: none !important; }
`;

export interface HarnessBuildInput {
  /** Absolute path to the repository checkout. */
  repoRoot: string;
  /** Absolute path under `extract/figma/organism-audit/out/`. */
  scratchDir: string;
  /** Repo-relative, e.g. `src/components/Presentation`. */
  componentImportPath: string;
  /** The named export to render, e.g. `Presentation`. */
  exportName: string;
}

export interface HarnessBuildOutput {
  /** The build's dist directory. */
  outDir: string;
  /** Absolute path of the built, fully self-contained index.html. */
  indexHtml: string;
  /** sha256 over the build recipe: entry sources plus serialized Vite options. */
  configSha256: string;
}

export interface HarnessElementReceipt {
  tag: string;
  /** CSS-modules classes, readable and hash-free (see SCOPED_NAME_RECIPE). */
  classes: string[];
  /** `textContent`, trimmed, truncated to TEXT_LIMIT characters. */
  text: string;
  /** Untruncated length of the trimmed `textContent` — `text.length` when intact. */
  textLength: number;
  /** DEVICE px (post-zoom), origin at the screenshot clip's top-left corner. */
  rect: { x: number; y: number; width: number; height: number };
}

export interface HarnessRenderResult {
  /** PNG clipped to the painted union box plus CLIP_MARGIN, at `scale`. */
  png: Buffer;
  /** DEVICE px, origin at the clip corner — the anchor for a Figma overlay. */
  rootRect: { x: number; y: number; width: number; height: number };
  /** The component root followed by every descendant ELEMENT, in DOM order. */
  elements: HarnessElementReceipt[];
  rootText: string;
  /** Every font query answered true.  Reported, never trusted — see header. */
  fontsLoaded: boolean;
  fontChecks: Array<{ query: string; loaded: boolean }>;
  /** Page console errors and uncaught exceptions.  Empty in normal use. */
  consoleErrors: string[];
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

/** POSIX-normalized, for specifiers and manifest keys that must not vary by OS. */
const toPosix = (value: string): string => value.split(path.sep).join('/');

/** A relative import specifier Vite cannot mistake for a root-absolute path. */
function relativeSpecifier(fromDir: string, target: string): string {
  const relative = toPosix(path.relative(fromDir, target));
  return relative.startsWith('.') ? relative : `./${relative}`;
}

/**
 * Resolve the module file behind `componentImportPath`.
 *
 * Deliberately explicit rather than leaving it to the bundler's directory-index
 * lookup: the audit records which bytes it rendered, and "whatever the resolver
 * picked" is not a record.  A directory with no recognizable entry is refused
 * instead of resolved to something plausible.
 */
function resolveComponentEntry(absoluteTarget: string): string {
  if (existsSync(absoluteTarget) && statSync(absoluteTarget).isFile()) return absoluteTarget;
  for (const extension of ['.tsx', '.ts', '.jsx', '.js']) {
    const candidate = `${absoluteTarget}${extension}`;
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  if (existsSync(absoluteTarget) && statSync(absoluteTarget).isDirectory()) {
    const base = path.basename(absoluteTarget);
    for (const name of ['index.ts', 'index.tsx', `${base}.tsx`, `${base}.ts`]) {
      const candidate = path.join(absoluteTarget, name);
      if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
    }
  }
  throw new Error(
    `harness: no module file behind componentImportPath "${absoluteTarget}" ` +
      `(looked for the path itself, .tsx/.ts/.jsx/.js siblings, then index.ts/index.tsx inside it)`,
  );
}

/**
 * Readable, hash-free CSS-modules names.
 *
 * `Presentation.module.css` + `.Texte` becomes `Presentation__Texte`, so a DOM
 * receipt names the anatomy part a reader can look up in the contract instead
 * of an opaque `_Texte_1x2y3_4`.  Two component directories would have to hold
 * identically-named `.module.css` files to collide, which `src/components/**`
 * (one directory per component) cannot produce.
 */
function generateScopedName(name: string, filename: string): string {
  const owner = path
    .basename(filename)
    .replace(/\.module\.css$/, '')
    .replace(/[^A-Za-z0-9_-]/g, '-');
  return `${owner}__${name}`;
}

function harnessViteConfig(input: {
  repoRoot: string;
  indexHtml: string;
  outDir: string;
}): InlineConfig {
  return {
    // The repo's own vite.config.ts is a library build; picking it up would
    // externalize React and emit no HTML at all.
    configFile: false,
    root: input.repoRoot,
    // Relative asset URLs: the page is opened over file://, where Vite's
    // default root-absolute "/entry.js" resolves to the filesystem root.
    base: './',
    // Nothing from the repo's public tree belongs in an audit page.
    publicDir: false,
    // .env files would leak machine-local values into import.meta.env and make
    // two checkouts build different bytes.
    envDir: false,
    logLevel: 'warn',
    plugins: [react()],
    css: {
      transformer: 'postcss',
      devSourcemap: false,
      modules: { generateScopedName },
    },
    build: {
      outDir: input.outDir,
      emptyOutDir: true,
      // Readable bundles, and one less transform between the shipped source
      // and the pixels.
      minify: false,
      target: 'chrome120',
      sourcemap: false,
      // Every referenced asset becomes a data: URI — a file:// page cannot
      // fetch siblings (see inlineBuiltHtml).
      assetsInlineLimit: Number.MAX_SAFE_INTEGER,
      // A preload polyfill would add code that has nothing to do with the
      // component under audit.
      modulePreload: false,
      rollupOptions: {
        input: input.indexHtml,
        output: {
          entryFileNames: 'entry.js',
          chunkFileNames: 'chunk-[name].js',
          assetFileNames: 'asset-[name][extname]',
        },
      },
    },
  };
}

/**
 * A stable string for everything that can change the built bytes.
 *
 * Functions and plugin instances cannot be serialized, so they are recorded by
 * name — the recipe version above is what distinguishes two different function
 * bodies.  Absolute paths are folded to `<repo>` so two checkouts of the same
 * commit agree on the hash.
 */
function serializeViteConfig(config: InlineConfig, repoRoot: string): string {
  const json = JSON.stringify(config, (key, value: unknown) => {
    if (key === 'plugins' && Array.isArray(value)) {
      return value
        .flat(Infinity)
        .map((plugin) =>
          plugin && typeof plugin === 'object' && 'name' in plugin
            ? String((plugin as { name: unknown }).name)
            : '[anonymous plugin]',
        );
    }
    if (typeof value === 'function') return `[function ${value.name || 'anonymous'}]`;
    if (value === Number.MAX_SAFE_INTEGER) return '[Number.MAX_SAFE_INTEGER]';
    return value;
  });
  return json.split(toPosix(repoRoot)).join('<repo>').split(repoRoot).join('<repo>');
}

/**
 * Fold the built page into ONE self-contained file.
 *
 * Not a size optimization: Chromium refuses to fetch an ES module over
 * file:// ("blocked by CORS policy ... only supported for protocol schemes:
 * chrome, ..., data, http, https"), so a built page that still links its
 * entry chunk simply never executes, and the harness would photograph an empty
 * document. Inlining is what makes `page.goto('file://…')` viable at all.
 */
function inlineBuiltHtml(outDir: string, htmlPath: string): void {
  const entries = readdirSync(outDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
  const scripts = entries.filter((name) => name.endsWith('.js'));
  const styles = entries.filter((name) => name.endsWith('.css'));
  if (scripts.length !== 1) {
    throw new Error(
      `harness: expected exactly one built script to inline, found ${scripts.length} (${scripts.join(', ')}) — ` +
        `a code-split page cannot be loaded over file://`,
    );
  }
  if (styles.length > 1) {
    throw new Error(
      `harness: expected at most one built stylesheet to inline, found ${styles.length} (${styles.join(', ')})`,
    );
  }

  // `</script` inside a string literal would close the inline element early.
  const script = readFileSync(path.join(outDir, scripts[0]), 'utf8').split('</script').join('<\\/script');
  const style = styles.length === 1 ? readFileSync(path.join(outDir, styles[0]), 'utf8') : null;

  let html = readFileSync(htmlPath, 'utf8');
  const before = html;
  // Function replacements, never strings: a bundle contains `$&` and `$\`` and
  // String.replace would splice the matched tag back into the page.
  html = html.replace(/<script\b[^>]*\bsrc="[^"]*"[^>]*><\/script>/g, () => `<script type="module">${script}</script>`);
  if (style !== null) {
    html = html.replace(/<link\b[^>]*\brel="stylesheet"[^>]*>/g, () => `<style>${style}</style>`);
  }
  if (html === before) {
    throw new Error(`harness: built page ${htmlPath} referenced no script to inline`);
  }
  if (/<script\b[^>]*\bsrc=/.test(html) || /<link\b[^>]*\brel="stylesheet"/.test(html)) {
    throw new Error(`harness: built page ${htmlPath} still fetches a sibling file after inlining`);
  }
  writeFileSync(htmlPath, html);
}

/**
 * Build a single-page harness around one generated component.
 *
 * The page keeps `window.renderHarness` alive across calls, so one build serves
 * the default render and every prop probe the audit needs without rebuilding
 * (and without the risk of two builds disagreeing mid-organism).
 */
export async function buildHarness(input: HarnessBuildInput): Promise<HarnessBuildOutput> {
  const { exportName } = input;
  if (!path.isAbsolute(input.repoRoot)) {
    throw new Error(`harness: repoRoot must be absolute, got "${input.repoRoot}"`);
  }
  if (!path.isAbsolute(input.scratchDir)) {
    throw new Error(`harness: scratchDir must be absolute, got "${input.scratchDir}"`);
  }
  const repoRoot = path.resolve(input.repoRoot);
  const scratchDir = path.resolve(input.scratchDir);
  const scratchRoot = path.join(repoRoot, SCRATCH_ROOT_RELATIVE);
  // The harness writes; it must never write outside its own gitignored scratch.
  if (scratchDir !== scratchRoot && !scratchDir.startsWith(`${scratchRoot}${path.sep}`)) {
    throw new Error(`harness: scratchDir must live under ${scratchRoot}, got "${scratchDir}"`);
  }
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(exportName)) {
    throw new Error(`harness: exportName is not a JS identifier: ${JSON.stringify(exportName)}`);
  }
  if (path.isAbsolute(input.componentImportPath)) {
    throw new Error(`harness: componentImportPath must be repo-relative, got "${input.componentImportPath}"`);
  }
  const componentTarget = path.resolve(repoRoot, input.componentImportPath);
  const shippingRoot = path.join(repoRoot, SHIPPING_ROOT_RELATIVE);
  // D4 again, enforced rather than assumed: an audit that photographed
  // core/, figma-sync/ or a fixture would not be looking at the library a
  // consumer installs.
  if (!componentTarget.startsWith(`${shippingRoot}${path.sep}`)) {
    throw new Error(
      `harness: componentImportPath must resolve inside ${SHIPPING_ROOT_RELATIVE}/ (the shipping library), ` +
        `got "${input.componentImportPath}"`,
    );
  }
  const componentEntry = resolveComponentEntry(componentTarget);
  const tokensCss = path.join(repoRoot, 'src', 'styles', 'tokens.css');
  if (!existsSync(tokensCss)) {
    throw new Error(`harness: design-system custom properties missing at ${tokensCss}`);
  }

  mkdirSync(scratchDir, { recursive: true });
  const indexHtmlSource = path.join(scratchDir, 'index.html');
  const entrySource = path.join(scratchDir, 'entry.jsx');

  const indexHtmlContent = [
    '<!doctype html>',
    '<html lang="fr">',
    '<head>',
    '<meta charset="utf-8">',
    '<title>organism-audit harness</title>',
    `<style>${HARNESS_FRAME_CSS}</style>`,
    '</head>',
    '<body>',
    '<div id="root"></div>',
    '<script type="module" src="./entry.jsx"></script>',
    '</body>',
    '</html>',
    '',
  ].join('\n');

  // .jsx, never .tsx: tsconfig.json includes `extract`, and a scratch file has
  // no business entering the repository typecheck.
  const entryContent = `// GENERATED BY extract/figma/organism-audit/harness.ts — scratch, not source.
import ${JSON.stringify(relativeSpecifier(scratchDir, tokensCss))};
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { ${exportName} as HarnessSubject } from ${JSON.stringify(relativeSpecifier(scratchDir, componentEntry))};

const root = createRoot(document.getElementById('root'));
let renders = 0;

window.renderHarness = async (props) => {
  // Synchronous commit: React's concurrent scheduler may otherwise land the
  // tree after the frames we wait on below, and the harness would measure the
  // previous props.
  flushSync(() => {
    root.render(<HarnessSubject {...(props ?? {})} />);
  });
  // BOUNDED, for the reason visual-parity/render.ts bounds it: document.fonts
  // .ready occasionally never resolves in headless Chromium and hangs the run.
  // Local faces settle in milliseconds, so the bound changes no pixels.
  await Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 5000))]);
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  renders += 1;
  document.documentElement.dataset.harnessReady = String(renders);
  return renders;
};
`;

  writeFileSync(indexHtmlSource, indexHtmlContent);
  writeFileSync(entrySource, entryContent);

  const outDir = path.join(scratchDir, 'dist');
  const config = harnessViteConfig({ repoRoot, indexHtml: indexHtmlSource, outDir });
  const result = await build(config);
  const bundles = Array.isArray(result) ? result : [result];

  // The built HTML's name comes from the bundler, not from a guess about how
  // Vite maps an input path under `root` onto the output tree.
  const htmlNames = new Set<string>();
  for (const bundle of bundles) {
    if (!('output' in bundle)) continue;
    for (const chunk of bundle.output) {
      if (chunk.fileName.endsWith('.html')) htmlNames.add(chunk.fileName);
    }
  }
  if (htmlNames.size !== 1) {
    throw new Error(
      `harness: expected exactly one built HTML page, got ${htmlNames.size} (${[...htmlNames].join(', ')})`,
    );
  }
  const indexHtml = path.join(outDir, [...htmlNames][0]);
  if (!existsSync(indexHtml)) {
    throw new Error(`harness: bundler reported ${indexHtml} but it is not on disk`);
  }
  inlineBuiltHtml(outDir, indexHtml);

  const manifest = JSON.stringify({
    recipeVersion: HARNESS_RECIPE_VERSION,
    scopedNameRecipe: SCOPED_NAME_RECIPE,
    exportName,
    componentEntry: toPosix(path.relative(repoRoot, componentEntry)),
    tokensCss: toPosix(path.relative(repoRoot, tokensCss)),
    indexHtmlSource: indexHtmlContent,
    entrySource: entryContent,
    viteConfig: serializeViteConfig(config, repoRoot),
  });

  return {
    outDir,
    indexHtml,
    configSha256: createHash('sha256').update(manifest).digest('hex'),
  };
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

interface HarnessMeasurement {
  /** Children under the mount. Exactly 1 is the only valid state — the two
   *  readers below check that directly, so no separate `found` flag can
   *  disagree with it inside the string-serialized page script. */
  rootCount: number;
  clip: { x: number; y: number; width: number; height: number };
  rootRect: { x: number; y: number; width: number; height: number };
  elements: HarnessElementReceipt[];
  rootText: string;
  fontChecks: Array<{ query: string; loaded: boolean }>;
  viewport: { width: number; height: number };
  devicePixelRatio: number;
}

/**
 * One measuring pass over the live page.
 *
 * The body is zoomed, and Chromium reports `getBoundingClientRect` in the
 * ZOOMED viewport space — which is why the clip margin below is scaled too, and
 * why visual-parity divides by the same factor when it wants CSS px back.  With
 * `deviceScaleFactor: 1` those viewport px ARE the screenshot's px, so every
 * rect returned here is already in the receipt's device-px space.
 */
async function measureHarnessPage(page: Page, scale: number): Promise<HarnessMeasurement> {
  // String-bodied evaluate, not a closure: tsx/esbuild injects a `__name`
  // keep-names helper into serialized functions that does not exist in the
  // page, and every evaluate would throw ReferenceError.
  const MEASURE_JS = `(() => {
    const args = ${JSON.stringify({
      mount: HARNESS_MOUNT_SELECTOR,
      margin: CLIP_MARGIN * scale,
      fontQueries: FONT_QUERIES,
      textLimit: TEXT_LIMIT,
    })};
    const empty = { x: 0, y: 0, width: 0, height: 0 };
    const mount = document.querySelector(args.mount);
    const roots = mount ? Array.from(mount.children) : [];
    const fontChecks = args.fontQueries.map((query) => ({ query, loaded: document.fonts.check(query) }));
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    if (roots.length !== 1) {
      return { rootCount: roots.length, clip: empty, rootRect: empty, elements: [],
               rootText: '', fontChecks, viewport, devicePixelRatio: window.devicePixelRatio };
    }
    const el = roots[0];

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const union = (r) => {
      if (r.width === 0 && r.height === 0) return;
      if (r.left < minX) minX = r.left;
      if (r.top < minY) minY = r.top;
      if (r.right > maxX) maxX = r.right;
      if (r.bottom > maxY) maxY = r.bottom;
    };
    union(el.getBoundingClientRect());
    for (const descendant of el.querySelectorAll('*')) union(descendant.getBoundingClientRect());
    const painted = Number.isFinite(minX);
    const clip = painted
      ? {
          x: Math.max(0, minX - args.margin),
          y: Math.max(0, minY - args.margin),
          width: maxX - minX + 2 * args.margin,
          height: maxY - minY + 2 * args.margin,
        }
      : { x: 0, y: 0, width: 1, height: 1 };

    // Zero-size elements stay in the receipt even though they cannot widen the
    // clip: an organism part that collapsed to 0x0 is a finding, not noise.
    const receipt = (node) => {
      const box = node.getBoundingClientRect();
      const full = (node.textContent || '').trim();
      return {
        tag: node.tagName.toLowerCase(),
        classes: Array.from(node.classList),
        text: full.slice(0, args.textLimit),
        textLength: full.length,
        rect: { x: box.left - clip.x, y: box.top - clip.y, width: box.width, height: box.height },
      };
    };
    const elements = [receipt(el)];
    for (const descendant of el.querySelectorAll('*')) elements.push(receipt(descendant));

    const rootBox = el.getBoundingClientRect();
    return {
      rootCount: roots.length,
      clip,
      rootRect: { x: rootBox.left - clip.x, y: rootBox.top - clip.y, width: rootBox.width, height: rootBox.height },
      elements,
      rootText: el.innerText || '',
      fontChecks,
      viewport,
      devicePixelRatio: window.devicePixelRatio,
    };
  })()`;
  return (await page.evaluate(MEASURE_JS)) as HarnessMeasurement;
}

/**
 * Render ONE prop set of an already-built harness and photograph it.
 *
 * A fresh browser per case, deliberately: the audit's cases differ only by
 * props, and a page that had already rendered a different prop set carries its
 * pointer position, its scroll and its React tree into the next measurement.
 */
export async function renderHarnessCase(input: {
  indexHtml: string;
  props: Record<string, unknown>;
  scale?: number;
  /**
   * Layout width of the mount point, in CSS px, taken from the pinned Figma
   * root box (011's `layoutContext: { rootWidth: 'figma-root' }`).
   *
   * Measurement context, never component styling: an organism laid out as a
   * row with no intrinsic width fills whatever box it is given, so rendering it
   * in a 1600px viewport and comparing against a 1287px master measures the
   * harness, not the component.  The width therefore comes from the reference
   * geometry — never from a number chosen to make a score look better.
   */
  rootWidthCss?: number;
}): Promise<HarnessRenderResult> {
  const scale = input.scale ?? CAMPAIGN_CAPTURE_SCALE;
  if (!Number.isFinite(scale) || scale <= 0) {
    throw new Error(`harness: capture scale must be a finite positive number, got ${String(input.scale)}`);
  }
  if (!existsSync(input.indexHtml)) {
    throw new Error(`harness: built page missing at ${input.indexHtml} — run buildHarness first`);
  }
  // Throws here rather than in the page if a prop is not transferable.
  const propsJson = JSON.stringify(input.props ?? {});
  if (propsJson === undefined) {
    throw new Error('harness: props are not JSON-serializable');
  }

  const consoleErrors: string[] = [];
  const browser = await launchBrowser();
  try {
    // The organism must fit its own layout width plus the clip margin on both
    // sides, or the painted box overflows the viewport and the capture is
    // refused.  Derived from the reference, never from a convenient constant.
    const viewportCssWidth =
      input.rootWidthCss === undefined
        ? VIEWPORT_CSS_WIDTH
        : Math.max(VIEWPORT_CSS_WIDTH, Math.ceil(input.rootWidthCss) + CLIP_MARGIN * 2);
    const page = await browser.newPage(
      campaignCapturePageOptions({ width: viewportCssWidth, height: VIEWPORT_CSS_HEIGHT }, scale),
    );
    // Attached before navigation: an error thrown while the entry module
    // evaluates is exactly the one worth catching.
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(`console.error: ${message.text()}`);
    });
    page.on('pageerror', (error) => {
      consoleErrors.push(`pageerror: ${error instanceof Error ? error.message : String(error)}`);
    });

    await page.goto(pathToFileURL(input.indexHtml).href, { waitUntil: 'load', timeout: 180_000 });

    // The real Montserrat faces and the 2x comparison zoom, verbatim from 011.
    // `afterbegin` keeps them ahead of anything the bundle injected, matching
    // the order previewDoc uses.
    const layoutContextCss =
      input.rootWidthCss !== undefined
        ? `<style>#root{width:${input.rootWidthCss}px;}</style>`
        : '';
    const head = embeddedFontFaces() + campaignCaptureScaleCss(scale) + layoutContextCss;
    await page.evaluate(`document.head.insertAdjacentHTML('afterbegin', ${JSON.stringify(head)})`);

    // Force every embedded weight to load BEFORE the render.
    //
    // `document.fonts.check` answers "is this face loaded", and @font-face is
    // lazy: without this, the receipt reports whichever weights the component's
    // own text happened to trigger, so the same harness answered 400-only on
    // one case and 400+500 on the next. That is a content-dependent receipt
    // masquerading as a font-availability receipt. Loading all four first makes
    // the check mean what it claims — the embedded face for this weight exists
    // — and makes it identical for every organism. Bounded like the fonts.ready
    // wait, for the same headless-Chromium reason.
    await page.evaluate(`Promise.race([
      Promise.all(${JSON.stringify(FONT_QUERIES)}.map((query) => document.fonts.load(query).catch(() => undefined))),
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ])`);

    await page.waitForFunction('typeof window.renderHarness === "function"', undefined, { timeout: 60_000 });
    await page.evaluate(`window.renderHarness(${propsJson})`);
    // The virtual mouse keeps its position across navigations; parked off the
    // component so no descendant matches :hover.
    await page.mouse.move(0, 0);

    let measurement = await measureHarnessPage(page, scale);
    if (measurement.rootCount !== 1) {
      throw new Error(
        `harness: expected exactly one root element under ${HARNESS_MOUNT_SELECTOR}, found ${measurement.rootCount}`,
      );
    }

    // Grow to fit rather than crop: a screenshot clipped by the viewport is a
    // silently truncated organism, which is the failure mode this audit is
    // least allowed to have.
    const neededHeight = measurement.clip.y + measurement.clip.height;
    if (neededHeight > measurement.viewport.height) {
      const grownCssHeight = Math.ceil(neededHeight / scale) + CLIP_MARGIN;
      if (grownCssHeight > MAX_VIEWPORT_CSS_HEIGHT) {
        throw new Error(
          `harness: painted box needs ${grownCssHeight} CSS px of height, above the ${MAX_VIEWPORT_CSS_HEIGHT} ceiling`,
        );
      }
      await page.setViewportSize(
        campaignCapturePageOptions({ width: VIEWPORT_CSS_WIDTH, height: grownCssHeight }, scale).viewport,
      );
      // Re-render to settle layout at the new size before re-measuring.
      await page.evaluate(`window.renderHarness(${propsJson})`);
      measurement = await measureHarnessPage(page, scale);
      if (measurement.rootCount !== 1) {
        throw new Error(`harness: root element disappeared after the grow-to-fit resize`);
      }
    }

    const overflowX = measurement.clip.x + measurement.clip.width - measurement.viewport.width;
    const overflowY = measurement.clip.y + measurement.clip.height - measurement.viewport.height;
    // Sub-pixel overflow is the clip margin meeting the viewport edge exactly;
    // anything larger would silently cut the component.
    if (overflowX > 1 || overflowY > 1) {
      throw new Error(
        `harness: painted box exceeds the capture viewport by ${Math.max(0, overflowX)}x${Math.max(0, overflowY)} device px`,
      );
    }
    const clip = {
      x: measurement.clip.x,
      y: measurement.clip.y,
      width: Math.min(measurement.clip.width, measurement.viewport.width - measurement.clip.x),
      height: Math.min(measurement.clip.height, measurement.viewport.height - measurement.clip.y),
    };
    // Transparent background, like visual-parity: the component's own fills
    // paint, the harness page's do not, so the crop is honest on both sides of
    // a later diff and the caller chooses what to flatten onto.
    const png = await page.screenshot({ clip, omitBackground: true });

    // 1 under campaignCapturePageOptions; applied anyway so the receipt stays
    // correct in device px if a caller ever supplies a DPR>1 page.
    const dpr = measurement.devicePixelRatio;
    const scaleRect = (rect: { x: number; y: number; width: number; height: number }) => ({
      x: rect.x * dpr,
      y: rect.y * dpr,
      width: rect.width * dpr,
      height: rect.height * dpr,
    });

    return {
      png: Buffer.from(png),
      rootRect: scaleRect(measurement.rootRect),
      elements: measurement.elements.map((element) => ({ ...element, rect: scaleRect(element.rect) })),
      rootText: measurement.rootText,
      fontsLoaded: measurement.fontChecks.every((check) => check.loaded),
      fontChecks: measurement.fontChecks,
      consoleErrors,
    };
  } finally {
    await browser.close();
  }
}
