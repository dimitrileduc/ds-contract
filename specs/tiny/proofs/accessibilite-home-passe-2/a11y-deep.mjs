import { chromium } from '/Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/comet-yogurt/node_modules/playwright-core/index.mjs';
import { readdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
function exe(){const c=path.join(homedir(),'Library','Caches','ms-playwright');
 for(const m of readdirSync(c).filter(d=>/^chromium-\d+$/.test(d)).sort().reverse())
  for(const r of ['chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing','chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'])
   {const p=path.join(c,m,r); if(existsSync(p))return p;} throw new Error('no chromium');}

const browser = await chromium.launch({ executablePath: exe(), headless: true });
const W = Number(process.argv[2] || 1440);
const page = await browser.newPage({ viewport: { width: W, height: 1000 } });
const net = [];
page.on('response', r => { if (r.status() >= 400) net.push(r.status() + ' ' + r.url().slice(0, 90)); });
await page.goto('http://localhost:8087/', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);

// 1. footer / social links
const social = await page.evaluate(() => [...document.querySelectorAll('footer a, #bottom a')].map(a => ({
  href: a.getAttribute('href'), txt: a.innerText.trim().slice(0,40),
  aria: a.getAttribute('aria-label'), hasSvg: !!a.querySelector('svg,img'),
  cls: (a.className||'').toString().slice(0,50)
})));

// 2. contrast: sample visible text nodes
const contrast = await page.evaluate(() => {
  const lum = c => { const s = c.map(v => { v/=255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); });
    return 0.2126*s[0]+0.7152*s[1]+0.0722*s[2]; };
  const parse = s => { const m = s.match(/rgba?\(([^)]+)\)/); if(!m) return null;
    const p = m[1].split(',').map(Number); return { rgb: p.slice(0,3), a: p.length>3?p[3]:1 }; };
  const bgOf = el => { let n = el; while (n) { const b = parse(getComputedStyle(n).backgroundColor);
      if (b && b.a > 0.5) return b.rgb; n = n.parentElement; } return [255,255,255]; };
  const out = [];
  const seen = new Set();
  for (const el of document.querySelectorAll('p,span,a,h1,h2,h3,h4,li,div,button')) {
    const t = [...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join('');
    if (!t || t.length < 3) continue;
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    const s = getComputedStyle(el);
    if (s.visibility==='hidden'||s.display==='none'||Number(s.opacity)===0) continue;
    const fg = parse(s.color); if (!fg) continue;
    const bg = bgOf(el);
    const L1 = lum(fg.rgb), L2 = lum(bg);
    const ratio = (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
    const px = parseFloat(s.fontSize), bold = Number(s.fontWeight) >= 700;
    const large = px >= 24 || (px >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    const key = s.color + '|' + bg.join(',') + '|' + Math.round(px);
    if (ratio < need && !seen.has(key)) { seen.add(key);
      out.push({ txt: t.slice(0,40), color: s.color, bg: 'rgb('+bg.join(',')+')', px, bold, ratio: +ratio.toFixed(2), need }); }
  }
  return out;
});

// 3. keyboard: tab through and record focus + outline
const kb = await page.evaluate(() => {
  const els = [...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])')]
    .filter(e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
      return r.width>0 && r.height>0 && s.visibility!=='hidden' && s.display!=='none'; });
  return { count: els.length, first: els.slice(0,6).map(e => (e.getAttribute('aria-label')||e.innerText||e.tagName).trim().slice(0,30)) };
});

// focus ring check on a nav link + a button
const ring = await page.evaluate(() => {
  const probe = (sel) => { const el = document.querySelector(sel); if (!el) return null;
    el.focus(); const s = getComputedStyle(el);
    return { sel, outline: s.outlineStyle + ' ' + s.outlineWidth + ' ' + s.outlineColor, box: s.boxShadow.slice(0,60) }; };
  return ['a.o_skip_to_content','.header__nav a','.carousel-controls button','.button'].map(probe).filter(Boolean);
});

console.log(JSON.stringify({ W, social, contrast, kb, ring, net }, null, 1));
await browser.close();
