/**
 * Jambe A render (spec 006, R11/R9) — arbitrary HTML → screenshot at a
 * device scale factor equal to the aplat's native/drawn ratio, so the
 * output PNG compares pixel-for-pixel against a NATIVE crop of
 * measures/aplat-source.png — never resampling the reference (img.ts's own
 * rule, contracts/measure-record.md §1).
 *
 * Reuses visual-parity/render.ts's browser plumbing verbatim — never
 * re-implemented (R11): `chromiumExecutable` (Chromium discovery) and
 * `embeddedFontFaces` (the real-Montserrat-as-base64 fix, 2026-07-23 — a
 * second harness re-deriving its own font loading could silently regress
 * into the system-font-fallback bug that fix replaced).
 */
import { chromium, type Browser } from 'playwright-core';
import { chromiumExecutable, embeddedFontFaces } from '../visual-parity/render.js';

export async function launchAplatBrowser(): Promise<Browser> {
  return chromium.launch({ executablePath: chromiumExecutable(), headless: true });
}

/**
 * Render one HTML fragment (a candidate card/block body) at `cssWidth` ×
 * `cssHeight` CSS px, with `deviceScaleFactor` applied so the screenshot's
 * device-px resolution matches a native aplat crop directly. White opaque
 * background (the aplat crop is itself opaque — no alpha to align on, see
 * run.ts), real Montserrat embedded so font-substitution honesty holds.
 */
export async function renderCardHtml(
  browser: Browser,
  bodyHtml: string,
  extraCss: string,
  cssWidth: number,
  cssHeight: number,
  deviceScaleFactor: number,
): Promise<Buffer> {
  const context = await browser.newContext({
    viewport: { width: Math.ceil(cssWidth), height: Math.ceil(cssHeight) },
    deviceScaleFactor,
    colorScheme: 'light',
  });
  try {
    const page = await context.newPage();
    const doc = [
      '<!doctype html>',
      '<html><head><meta charset="utf-8">',
      embeddedFontFaces(),
      `<style>
        html, body { margin: 0; padding: 0; background: #ffffff; }
        *, *::before, *::after { box-sizing: border-box; animation-play-state: paused !important; transition: none !important; }
      </style>`,
      `<style>${extraCss}</style>`,
      '</head><body>',
      bodyHtml,
      '</body></html>',
    ].join('\n');
    await page.setContent(doc, { waitUntil: 'load' });
    // Bounded font settle — same 5s cap as visual-parity/render.ts (a hung
    // document.fonts.ready must never stall the whole probe indefinitely).
    await page.evaluate('Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 5000))])');
    const png = await page.screenshot({ clip: { x: 0, y: 0, width: cssWidth, height: cssHeight } });
    return Buffer.from(png);
  } finally {
    await context.close();
  }
}
