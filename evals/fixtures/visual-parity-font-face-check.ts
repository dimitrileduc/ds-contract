/** The visual renderer must embed every observed Montserrat face explicitly.
 * In particular Bold/700 must never be synthesized from the semibold file:
 * synthetic glyph contours defeat an otherwise exact Figma pixel comparison. */
import { embeddedFontFaces } from '../../extract/figma/visual-parity/render.js';

const faces = embeddedFontFaces();
for (const weight of [400, 500, 600, 700]) {
  const rule = new RegExp(`@font-face\\{[^}]*font-weight:${weight};[^}]*data:font/woff2;base64,`, 'g');
  if (!rule.test(faces)) throw new Error(`Montserrat ${weight} face is absent; fallback/synthesis would be possible`);
}
if ((faces.match(/@font-face\{/g) ?? []).length !== 4) {
  throw new Error(`expected exactly four explicit Montserrat faces, got ${faces.match(/@font-face\{/g)?.length ?? 0}`);
}

console.log('✔ visual parity embeds a real Montserrat 700 face (no synthetic bold)');
