/**
 * Jambe A — convergence hors ligne (spec 006, R11/T014): rendu CODE ↔ crop de
 * l'aplat NATIF (measures/aplat-source.png), zéro écriture canevas, ~30s par
 * itération. Forme exacte de extract/figma/state-photo/run.ts : CLI à
 * sous-commandes, seuil IMPORTÉ de visual-parity/tolerance.ts (jamais
 * réinventé), diff/triptyque réutilisés depuis visual-parity/img.ts.
 *
 * `img.ts` ne rééchantillonne JAMAIS : le crop de référence est pris à la
 * résolution NATIVE de l'aplat (measures/aplat-source.json.largeurNative),
 * et le rendu code est pris au deviceScaleFactor égal au scaleFactor mesuré
 * (~1.4994) pour produire la MÊME densité de pixels — jamais l'inverse
 * (rééchantillonner la référence serait la faute nommée par R9).
 *
 *   npx tsx extract/figma/aplat-parity/run.ts probe \
 *     --region <x,y,w,h> --html <fichier.html> [--css <fichier.css>] \
 *     --label <nom> --out <dir>
 *
 * `region` est en pixels NATIFS de measures/aplat-source.png (pas les
 * coordonnées 1552-large du cadre dessiné). Sortie : <out>/<label>.json +
 * <out>/<label>.triptych.png (référence | rendu | diff), jamais silencieux.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { alignPair, diffPair, writeTriptych } from '../visual-parity/img.js';
import { THRESHOLD_PCT } from '../visual-parity/tolerance.js';
import { launchAplatBrowser, renderCardHtml } from './render.js';

const HERE = path.resolve(new URL('.', import.meta.url).pathname);
const APLAT_PNG = path.join(HERE, '..', '..', '..', 'specs', '006-google-reviews-block', 'measures', 'aplat-source.png');
const APLAT_JSON = path.join(HERE, '..', '..', '..', 'specs', '006-google-reviews-block', 'measures', 'aplat-source.json');

interface AplatSidecar {
  imageHash: string;
  sha256: string;
  largeurNative: number;
  hauteurNative: number;
  scaleFactor: number;
  nodeId: string;
  maquette: string;
  capturedAt: string;
}

function loadAplat(): { png: PNG; sidecar: AplatSidecar } {
  if (!existsSync(APLAT_PNG) || !existsSync(APLAT_JSON)) {
    throw new Error(
      `aplat-parity: measures/aplat-source.{png,json} introuvable — lancer T012 (bridge/aplat-source.js) d'abord.`,
    );
  }
  const png = PNG.sync.read(readFileSync(APLAT_PNG));
  const sidecar = JSON.parse(readFileSync(APLAT_JSON, 'utf8')) as AplatSidecar;
  if (png.width !== sidecar.largeurNative || png.height !== sidecar.hauteurNative) {
    throw new Error(
      `aplat-parity: aplat-source.png (${png.width}×${png.height}) != side-car largeurNative/hauteurNative ` +
        `(${sidecar.largeurNative}×${sidecar.hauteurNative}) — side-car périmé, re-générer T012.`,
    );
  }
  return { png, sidecar };
}

/** Crop a native-resolution rectangle out of the aplat PNG — no resampling. */
function cropAplat(png: PNG, x: number, y: number, w: number, h: number): PNG {
  if (x < 0 || y < 0 || x + w > png.width || y + h > png.height) {
    throw new Error(
      `aplat-parity: region {x:${x},y:${y},w:${w},h:${h}} déborde de l'aplat natif (${png.width}×${png.height})`,
    );
  }
  const out = new PNG({ width: w, height: h });
  for (let yy = 0; yy < h; yy++) {
    const srcStart = ((y + yy) * png.width + x) << 2;
    const dstStart = (yy * w) << 2;
    png.data.copy(out.data, dstStart, srcStart, srcStart + w * 4);
  }
  return out;
}

interface ProbeArgs {
  region: { x: number; y: number; w: number; h: number };
  htmlPath: string;
  cssPath: string | null;
  label: string;
  outDir: string;
}

function parseProbeArgs(argv: string[]): ProbeArgs {
  const flags = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      flags.set(argv[i].slice(2), argv[i + 1]);
      i++;
    }
  }
  const regionRaw = flags.get('region');
  const htmlPath = flags.get('html');
  const label = flags.get('label');
  const outDir = flags.get('out');
  if (!regionRaw || !htmlPath || !label || !outDir) {
    throw new Error('usage: probe --region <x,y,w,h> --html <fichier.html> [--css <fichier.css>] --label <nom> --out <dir>');
  }
  const parts = regionRaw.split(',').map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
    throw new Error(`--region invalide : "${regionRaw}" (attendu x,y,w,h numériques)`);
  }
  const [x, y, w, h] = parts;
  return { region: { x, y, w, h }, htmlPath, cssPath: flags.get('css') ?? null, label, outDir: outDir! };
}

async function probe(argv: string[]): Promise<void> {
  const args = parseProbeArgs(argv);
  const { png: aplatPng, sidecar } = loadAplat();
  const reference = cropAplat(aplatPng, args.region.x, args.region.y, args.region.w, args.region.h);

  const cssWidth = args.region.w / sidecar.scaleFactor;
  const cssHeight = args.region.h / sidecar.scaleFactor;
  const bodyHtml = readFileSync(args.htmlPath, 'utf8');
  const extraCss = args.cssPath ? readFileSync(args.cssPath, 'utf8') : '';

  const browser = await launchAplatBrowser();
  let renderedPng: PNG;
  try {
    const pngBuffer = await renderCardHtml(browser, bodyHtml, extraCss, cssWidth, cssHeight, sidecar.scaleFactor);
    renderedPng = PNG.sync.read(pngBuffer);
  } finally {
    await browser.close();
  }

  const aligned = alignPair(renderedPng, reference);
  const diff = diffPair(aligned, []); // no text-rect mask at probe stage — the RAW number is what T015 must publish
  const denom = args.region.w * args.region.h;
  const regionPct = (diff.diffCount / denom) * 100;

  mkdirSync(args.outDir, { recursive: true });
  const triptychPath = path.join(args.outDir, `${args.label}.triptych.png`);
  writeTriptych(triptychPath, aligned, diff.diff);
  const reportPath = path.join(args.outDir, `${args.label}.json`);
  const report = {
    label: args.label,
    region: args.region,
    cssWidth,
    cssHeight,
    deviceScaleFactor: sidecar.scaleFactor,
    renderedSize: { width: renderedPng.width, height: renderedPng.height },
    referenceSize: { width: reference.width, height: reference.height },
    diffCount: diff.diffCount,
    regionPct,
    thresholdPctImported: THRESHOLD_PCT, // visual-parity's 2% — a DIFFERENT instrument's number, printed for honesty (R3), NOT a pass/fail gate here
    diffBox: diff.diffBox,
    triptych: path.relative(process.cwd(), triptychPath),
  };
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`aplat-parity probe "${args.label}": ${regionPct.toFixed(3)}% of region (${denom} px) — diffCount ${diff.diffCount}`);
  console.log(`  (rappel: le ${THRESHOLD_PCT}% importé est le seuil d'un AUTRE instrument, visual-parity — pas un pass/fail ici, R3)`);
  console.log(`  triptyque → ${path.relative(process.cwd(), triptychPath)}`);
  console.log(`  rapport   → ${path.relative(process.cwd(), reportPath)}`);
}

async function main(): Promise<void> {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd === 'probe') {
    await probe(rest);
  } else {
    throw new Error(`usage: probe --region <x,y,w,h> --html <fichier.html> [--css <fichier.css>] --label <nom> --out <dir> (got "${cmd ?? ''}")`);
  }
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
