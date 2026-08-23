import { chromium } from 'playwright-core';

const CHROMIUM = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  || '/Users/dlstudio/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const browser = await chromium.launch({ executablePath: CHROMIUM, headless: true });
const page = await browser.newPage({ viewport: { width: 1728, height: 1080 } });

await page.goto('http://localhost:8069/', { waitUntil: 'networkidle', timeout: 30000 });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1000);

const info = await page.evaluate(() => {
  const footer = document.querySelector('.footer[data-pqr-shell="footer"]');
  if (!footer) return { error: 'footer not found' };
  const sep = footer.querySelector('.footer__Separator');
  const copyright = footer.querySelector('.copyright');
  const copyrightText = footer.querySelector('.copyright__Texte');
  const spacer = footer.querySelector('.footer__Spacer');
  const spacer2 = footer.querySelector('.footer__spacer2');
  const bg = footer.querySelector('.footer__Background');

  const cs = (el) => {
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
      overflow: s.overflow,
      opacity: s.opacity,
      position: s.position,
      innerHTML: el.innerHTML?.substring(0, 200),
      offsetHeight: el.offsetHeight,
      offsetTop: el.offsetTop,
      boundingRect: el.getBoundingClientRect(),
    };
  }

  return {
    footerRect: footer.getBoundingClientRect(),
    footerHeight: (footer as HTMLElement).offsetHeight,
    separator: cs(sep),
    spacer: cs(spacer),
    spacer2: cs(spacer2),
    copyright: cs(copyright),
    copyrightText: cs(copyrightText),
    background: cs(bg),
  };
});

console.log(JSON.stringify(info, null, 2));
await browser.close();
