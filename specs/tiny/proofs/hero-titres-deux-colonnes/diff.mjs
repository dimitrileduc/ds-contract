/** Diff pixel avant/après des heros — reçu re-jouable : npx tsx specs/tiny/proofs/hero-titres-deux-colonnes/diff.mjs */
import fs from 'node:fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
const D = 'specs/tiny/proofs/hero-titres-deux-colonnes';
const noms = fs.readdirSync(`${D}/avant`).filter((f) => f.endsWith('.png')).map((f) => f.replace('.png', ''));
console.log('page'.padEnd(24) + 'diff %'.padStart(9) + '  pixels');
for (const n of noms) {
  const a = PNG.sync.read(fs.readFileSync(`${D}/avant/${n}.png`));
  const b = PNG.sync.read(fs.readFileSync(`${D}/apres/${n}.png`));
  if (a.width !== b.width || a.height !== b.height) { console.log(n.padEnd(24) + '  DIMENSIONS DIFFERENTES'); continue; }
  const out = new PNG({ width: a.width, height: a.height });
  const d = pixelmatch(a.data, b.data, out.data, a.width, a.height, { threshold: 0.1 });
  fs.writeFileSync(`${D}/diff/${n}.png`, PNG.sync.write(out));
  console.log(n.padEnd(24) + (100 * d / (a.width * a.height)).toFixed(4).padStart(8) + '%  ' + d);
}
