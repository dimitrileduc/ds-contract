import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');

const CHROMIUM = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  || '/Users/dlstudio/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const browser = await chromium.launch({ executablePath: CHROMIUM, headless: true });
const page = await browser.newPage({ viewport: { width: 1728, height: 1080 } });

await page.goto('http://localhost:8069/', { waitUntil: 'networkidle', timeout: 30000 });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1000);

const info = await page.evaluate(`(() => {
  const cs = function(el) {
    if (!el) return null;
    const s = getComputedStyle(el);
    return {
      display: s.display,
      height: s.height,
      boxSizing: s.boxSizing,
      borderTopWidth: s.borderTopWidth,
      borderColor: s.borderColor,
      color: s.color,
      visibility: s.visibility,
      opacity: s.opacity,
      innerHTML: el.innerHTML ? el.innerHTML.substring(0, 200) : '',
      offsetHeight: el.offsetHeight,
      offsetTop: el.offsetTop,
    };
  };

  const footer = document.querySelector('.footer[data-pqr-shell="footer"]');
  if (!footer) return { error: 'footer not found' };
  return {
    footerHeight: footer.offsetHeight,
    separator: cs(footer.querySelector('.footer__Separator')),
    spacer: cs(footer.querySelector('.footer__Spacer')),
    spacer2: cs(footer.querySelector('.footer__spacer2')),
    copyright: cs(footer.querySelector('.copyright')),
    copyrightText: cs(footer.querySelector('.copyright__Texte')),
    background: cs(footer.querySelector('.footer__Background')),
  };
})()`);

console.log(JSON.stringify(info, null, 2));
await browser.close();
