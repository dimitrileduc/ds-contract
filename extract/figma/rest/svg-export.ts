/**
 * Deterministic SVG acquisition (research D3): Figma images API
 * `format=svg`, one body per governed icon master, written to
 * `assets/icons/<name>.svg` — the emitters' existing source of glyphs.
 * Never hand-drawn (FR-012); a decline is named, never silently skipped.
 *
 *   npx tsx extract/figma/rest/svg-export.ts <fileKey> <manifest.json> <outDir> [--token <token>]
 *
 * manifest.json: [{ "id": "<nodeId>", "name": "<asset-name>" }, …]
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fetchSvgs } from './fetch.js';

interface ManifestEntry {
  id: string;
  name: string;
}

/**
 * Figma's images API always bakes a LITERAL resolved color — never
 * `currentColor`. But the pipeline's OTHER end (core/emit-figma-script.ts)
 * does `svg.replaceAll('currentColor', hex)` when baking the canvas script —
 * it expects `currentColor` as the source placeholder. A source SVG that
 * skips this step silently locks every consumer onto one fixed color,
 * regardless of the actual bound variable — a real theming regression, not
 * just a byte difference. Every governed icon here binds a SINGLE fill to
 * one variable (color/noir-bleute, #26282C) — replacing that exact literal
 * is precise, not a guess at multi-color icons this registry doesn't have.
 */
const NOIR_BLEUTE_HEX = /#26282c/gi;
function bakeCurrentColor(svg: string): string {
  return svg.replace(NOIR_BLEUTE_HEX, 'currentColor');
}

function main(): Promise<void> {
  const args = process.argv.slice(2);
  const readFlag = (flag: string): string | undefined => {
    const i = args.indexOf(flag);
    return i >= 0 ? args.splice(i, 2)[1] : undefined;
  };
  const token = readFlag('--token') ?? process.env.FIGMA_TOKEN;
  const [fileKey, manifestPath, outDir] = args;
  if (!fileKey || !manifestPath || !outDir || !token) {
    console.error(
      'Usage: npx tsx extract/figma/rest/svg-export.ts <fileKey> <manifest.json> <outDir> [--token <token>]\n' +
        '  manifest.json: [{ "id": "<nodeId>", "name": "<asset-name>" }, …]\n' +
        '  Token: --token or the FIGMA_TOKEN env var.',
    );
    process.exit(2);
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as ManifestEntry[];
  return fetchSvgs(fileKey, manifest.map((m) => m.id), token).then((svgs) => {
    mkdirSync(outDir, { recursive: true });
    let written = 0;
    for (const { id, name } of manifest) {
      const svg = svgs[id];
      if (svg == null) {
        console.error(`degraded [svg-unavailable] ${id} (${name}): images API declined to render this node`);
        continue;
      }
      writeFileSync(path.join(outDir, `${name}.svg`), bakeCurrentColor(svg));
      written++;
    }
    console.log(`✔ ${written}/${manifest.length} SVG(s) → ${outDir}`);
    if (written < manifest.length) process.exit(1);
  });
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
