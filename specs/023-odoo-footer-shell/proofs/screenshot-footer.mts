import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';

const CHROMIUM = '/Users/dlstudio/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const browser = await chromium.launch({ executablePath: CHROMIUM, headless: true });
const page = await browser.newPage({ viewport: { width: 1728, height: 1080 } });

await page.goto('http://localhost:8069/', { waitUntil: 'networkidle', timeout: 30000 });

await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1000);

const footer = await page.$('.footer[data-pqr-shell="footer"]');
const outPath = 'specs/023-odoo-footer-shell/proofs/footer-odoo-screenshot.png';
if (footer) {
  await footer.screenshot({ path: outPath });
  console.log('Footer screenshot saved:', outPath);
} else {
  console.log('Footer element not found, taking full page screenshot');
  await page.screenshot({ path: outPath, fullPage: true });
}

await browser.close();
