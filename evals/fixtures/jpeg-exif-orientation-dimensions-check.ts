/**
 * Chromium applies JPEG EXIF orientation before exposing naturalWidth and
 * naturalHeight. Fixture receipts must pin those decoded dimensions rather
 * than the un-oriented SOF frame, otherwise a valid portrait is refused at
 * the browser evidence boundary.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodeImageDimensions } from '../../extract/figma/visual-parity/fixture-assets/fetch.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = path.resolve(
  here,
  '../../extract/figma/visual-parity/fixture-assets/realisation--petit--6219813c26c8.jpg',
);
const dimensions = decodeImageDimensions(readFileSync(fixture), 'image/jpeg');

if (dimensions.width !== 627 || dimensions.height !== 836) {
  throw new Error(
    `EXIF-oriented JPEG receipt must be 627x836 like Chromium, got ${dimensions.width}x${dimensions.height}`,
  );
}

console.log('✔ JPEG EXIF orientation is reflected in pinned decoded dimensions');
