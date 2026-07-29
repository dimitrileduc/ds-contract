/**
 * FR-008 regression: a 2× reference export must be captured on an exact
 * device-pixel grid even when the component has a fractional CSS dimension.
 *
 * Chromium paints a 339.5px image on a deviceScaleFactor=2 page through a
 * 680px intermediate raster, then a 679px root crop drops one edge.  Figma's
 * pinned 2× export rasterizes that same source directly to 679px.  The
 * campaign capture uses a DPR=1 page with a comparison-context zoom of 2:
 * component CSS and source bytes stay untouched, while the final bitmap is
 * an exact 679px raster.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { chromium } from 'playwright-core';
import {
  CAMPAIGN_CAPTURE_SCALE,
  campaignCapturePageOptions,
  campaignCaptureScaleCss,
  chromiumExecutable,
} from '../../extract/figma/visual-parity/render.js';

const ROOT = path.resolve(import.meta.dirname, '../..');
const ASSET = path.join(
  ROOT,
  'extract/figma/visual-parity/fixture-assets/realisation--petit--9eaa15d5e6f2.jpg',
);
const CSS_SIZE = 339.5;
const TARGET_SIZE = CSS_SIZE * CAMPAIGN_CAPTURE_SCALE;

if (!Number.isSafeInteger(TARGET_SIZE) || TARGET_SIZE !== 679) {
  throw new Error(`fixture requires an exact 679px 2× target, got ${TARGET_SIZE}`);
}

const bytes = readFileSync(ASSET);
const dataUrl = `data:image/jpeg;base64,${bytes.toString('base64')}`;
const imageMarkup = `<img src="${dataUrl}" alt="">`;
const imageCss =
  `html,body{margin:0;background:transparent}` +
  `img{display:block;width:${CSS_SIZE}px;height:${CSS_SIZE}px;object-fit:cover}`;

const browser = await chromium.launch({
  executablePath: chromiumExecutable(),
  headless: true,
});

try {
  // Independent exact-size oracle: browser-decode the same immutable bytes,
  // then ask Canvas for the final 679×679 raster directly.
  const oraclePage = await browser.newPage({
    viewport: { width: TARGET_SIZE, height: TARGET_SIZE },
    deviceScaleFactor: 1,
  });
  await oraclePage.setContent(
    `<canvas width="${TARGET_SIZE}" height="${TARGET_SIZE}"></canvas>${imageMarkup}`,
    { waitUntil: 'load' },
  );
  await oraclePage.locator('img').evaluate(async (image: HTMLImageElement) => image.decode());
  await oraclePage.evaluate(
    ({ width }) => {
      const canvas = document.querySelector('canvas');
      const image = document.querySelector('img');
      if (!(canvas instanceof HTMLCanvasElement) || !(image instanceof HTMLImageElement)) {
        throw new Error('oracle elements missing');
      }
      const context = canvas.getContext('2d');
      if (!context) throw new Error('oracle 2d context missing');
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(image, 0, 0, width, width);
      image.remove();
    },
    { width: TARGET_SIZE },
  );
  const oracle = PNG.sync.read(
    Buffer.from(await oraclePage.locator('canvas').screenshot({ omitBackground: true })),
  );
  await oraclePage.close();

  // Regression witness: the old DPR=2 path has the right layout width but
  // samples the image through a 680px intermediate raster.
  const legacyPage = await browser.newPage({
    viewport: { width: 800, height: 800 },
    deviceScaleFactor: 2,
  });
  await legacyPage.setContent(`<style>${imageCss}</style>${imageMarkup}`, {
    waitUntil: 'load',
  });
  const legacyFull = PNG.sync.read(
    Buffer.from(await legacyPage.screenshot({ omitBackground: true })),
  );
  await legacyPage.close();
  const legacy = new PNG({ width: TARGET_SIZE, height: TARGET_SIZE });
  PNG.bitblt(legacyFull, legacy, 0, 0, TARGET_SIZE, TARGET_SIZE, 0, 0);

  const legacyDiff = pixelmatch(
    legacy.data,
    oracle.data,
    undefined,
    TARGET_SIZE,
    TARGET_SIZE,
    { threshold: 0.1 },
  );
  const legacyPct = (legacyDiff / (TARGET_SIZE * TARGET_SIZE)) * 100;
  if (legacyPct <= 2.5) {
    throw new Error(`regression witness is not sensitive: legacy DPR=2 diff is ${legacyPct}%`);
  }

  const captureOptions = campaignCapturePageOptions({ width: 800, height: 800 });
  if (
    captureOptions.viewport.width !== 1600 ||
    captureOptions.viewport.height !== 1600
  ) {
    throw new Error(
      `campaign viewport did not retain DPR=2 physical capacity: ${JSON.stringify(captureOptions.viewport)}`,
    );
  }
  const page = await browser.newPage(captureOptions);
  await page.setContent(
    `${campaignCaptureScaleCss()}<style>${imageCss}</style>${imageMarkup}`,
    { waitUntil: 'load' },
  );
  const rect = await page.locator('img').boundingBox();
  if (!rect || rect.width !== TARGET_SIZE || rect.height !== TARGET_SIZE) {
    throw new Error(`campaign capture did not preserve exact 679px geometry: ${JSON.stringify(rect)}`);
  }
  const actual = PNG.sync.read(
    Buffer.from(
      await page.screenshot({
        clip: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        omitBackground: true,
      }),
    ),
  );
  await page.close();

  const actualDiff = pixelmatch(
    actual.data,
    oracle.data,
    undefined,
    TARGET_SIZE,
    TARGET_SIZE,
    { threshold: 0.1 },
  );
  const actualPct = (actualDiff / (TARGET_SIZE * TARGET_SIZE)) * 100;
  if (actualPct > 2.5) {
    throw new Error(
      `exact-scale campaign capture still exceeds the 2.5% gate: ${actualPct}% ` +
        `(legacy witness ${legacyPct}%)`,
    );
  }

  console.log(
    `✔ campaign capture preserves fractional CSS geometry on an exact 2× pixel grid ` +
      `(legacy ${legacyPct.toFixed(3)}% → exact-scale ${actualPct.toFixed(3)}%)`,
  );
} finally {
  await browser.close();
}
