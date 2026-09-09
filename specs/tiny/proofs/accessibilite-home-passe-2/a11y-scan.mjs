import { chromium } from '/Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/comet-yogurt/node_modules/playwright-core/index.mjs';
import { readdirSync, existsSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

function exe() {
  if (process.env.PLAYWRIGHT_CHROMIUM_PATH) return process.env.PLAYWRIGHT_CHROMIUM_PATH;
  const cache = path.join(homedir(), 'Library', 'Caches', 'ms-playwright');
  const revs = readdirSync(cache).map(d => /^chromium-(\d+)$/.exec(d)).filter(Boolean)
    .sort((a, b) => Number(b[1]) - Number(a[1]));
  for (const m of revs) for (const rel of [
    'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    'chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    'chrome-mac/Chromium.app/Contents/MacOS/Chromium']) {
    const p = path.join(cache, m[0], rel);
    if (existsSync(p)) return p;
  }
  throw new Error('chromium introuvable');
}

const URL_ = process.argv[2] || 'http://localhost:8087/';
const W = Number(process.argv[3] || 1440);
const browser = await chromium.launch({ executablePath: exe(), headless: true });
const page = await browser.newPage({ viewport: { width: W, height: 1000 } });
await page.goto(URL_, { waitUntil: 'networkidle', timeout: 60000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);

const dom = await page.evaluate(() => {
  const vis = el => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const sel = el => {
    const parts = [];
    let n = el;
    while (n && n.nodeType === 1 && parts.length < 4) {
      let p = n.tagName.toLowerCase();
      if (n.id) { parts.unshift('#' + n.id); break; }
      const cls = (n.className && typeof n.className === 'string')
        ? '.' + n.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
      parts.unshift(p + cls);
      n = n.parentElement;
    }
    return parts.join(' > ');
  };
  const out = {};
  out.lang = document.documentElement.lang;
  out.title = document.title;
  out.headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
    .filter(vis).map(h => ({ lvl: +h.tagName[1], txt: h.innerText.trim().slice(0, 70) }));
  out.landmarks = [...document.querySelectorAll('header,nav,main,footer,aside,section,form,[role]')]
    .filter(vis).map(e => ({
      tag: e.tagName.toLowerCase(), role: e.getAttribute('role'),
      label: e.getAttribute('aria-label') || e.getAttribute('aria-labelledby'), sel: sel(e)
    }));
  out.imgs = [...document.querySelectorAll('img')].map(i => ({
    src: (i.getAttribute('src') || '').slice(0, 80), alt: i.getAttribute('alt'),
    role: i.getAttribute('role'), vis: vis(i), sel: sel(i)
  }));
  out.svgs = [...document.querySelectorAll('svg')].filter(vis).map(s => ({
    role: s.getAttribute('role'), label: s.getAttribute('aria-label'),
    hidden: s.getAttribute('aria-hidden'), title: !!s.querySelector('title'), sel: sel(s)
  }));
  const accName = el => (el.getAttribute('aria-label') || el.innerText || '').trim()
    || (el.querySelector('img') && el.querySelector('img').alt) || '';
  out.links = [...document.querySelectorAll('a')].filter(vis).map(a => ({
    href: a.getAttribute('href'), name: accName(a).slice(0, 60),
    target: a.getAttribute('target'), sel: sel(a)
  }));
  out.buttons = [...document.querySelectorAll('button,[role="button"]')].filter(vis).map(b => ({
    tag: b.tagName.toLowerCase(), role: b.getAttribute('role'), type: b.getAttribute('type'),
    name: accName(b).slice(0, 60), expanded: b.getAttribute('aria-expanded'),
    controls: b.getAttribute('aria-controls'), sel: sel(b)
  }));
  out.fields = [...document.querySelectorAll('input,select,textarea')].map(f => {
    const id = f.id;
    const lab = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : f.closest('label');
    return {
      tag: f.tagName.toLowerCase(), type: f.type, name: f.name, id,
      label: lab ? lab.innerText.trim().slice(0, 50) : null,
      aria: f.getAttribute('aria-label'), ph: f.getAttribute('placeholder'),
      req: f.required || f.getAttribute('aria-required'), vis: vis(f), sel: sel(f)
    };
  });
  out.tabindex = [...document.querySelectorAll('[tabindex]')].map(e => ({ ti: e.getAttribute('tabindex'), sel: sel(e) }));
  out.skip = [...document.querySelectorAll('a[href^="#"]')].slice(0, 5).map(a => ({ href: a.getAttribute('href'), txt: a.innerText.trim().slice(0, 40) }));
  out.autoplay = [...document.querySelectorAll('video,audio')].map(v => ({
    tag: v.tagName.toLowerCase(), autoplay: v.autoplay, loop: v.loop, muted: v.muted,
    controls: v.controls, sel: sel(v)
  }));
  out.iframes = [...document.querySelectorAll('iframe')].map(f => ({ title: f.getAttribute('title'), src: (f.src||'').slice(0,60) }));
  return out;
});

const cdp = await page.context().newCDPSession(page);
await cdp.send('Accessibility.enable');
const { nodes } = await cdp.send('Accessibility.getFullAXTree');
const ax = nodes.filter(n => !n.ignored).map(n => ({
  role: n.role && n.role.value,
  name: n.name && String(n.name.value).slice(0, 80),
  props: (n.properties || []).filter(p => ['focusable','expanded','level','required','invalid','disabled','hidden'].includes(p.name)).map(p => p.name + '=' + p.value.value)
}));
writeFileSync(process.argv[4] || 'a11y-dom.json', JSON.stringify(dom, null, 1));
writeFileSync((process.argv[4] || 'a11y-dom.json').replace('dom', 'ax'), JSON.stringify(ax, null, 1));
console.log('OK', URL_, W, 'headings', dom.headings.length, 'links', dom.links.length);
await browser.close();
