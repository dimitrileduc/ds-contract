import { chromium } from '/Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/comet-yogurt/node_modules/playwright-core/index.mjs';
import { readdirSync, existsSync } from 'node:fs'; import { homedir } from 'node:os'; import path from 'node:path';
function exe(){const c=path.join(homedir(),'Library','Caches','ms-playwright');
 for(const m of readdirSync(c).filter(d=>/^chromium-\d+$/.test(d)).sort().reverse())
  for(const r of ['chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing','chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'])
   {const p=path.join(c,m,r); if(existsSync(p))return p;} throw 0;}
const b=await chromium.launch({executablePath:exe(),headless:true});
const p=await b.newPage({viewport:{width:390,height:844}});
await p.goto('http://localhost:8087/',{waitUntil:'networkidle'});
await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(600);
const before = await p.evaluate(()=>[...document.querySelectorAll('header button,header a[role=button],[data-bs-toggle]')]
  .map(e=>({tag:e.tagName,cls:String(e.className).slice(0,40),aria:e.getAttribute('aria-label'),
   exp:e.getAttribute('aria-expanded'),ctrl:e.getAttribute('aria-controls'),txt:e.innerText.trim().slice(0,20),
   vis:e.getBoundingClientRect().width>0})));
// desktop dropdown keyboard test at 1440
const p2=await b.newPage({viewport:{width:1440,height:900}});
await p2.goto('http://localhost:8087/',{waitUntil:'networkidle'});
await p2.evaluate(()=>document.fonts.ready); await p2.waitForTimeout(500);
const drop = p2.locator('.header__navItemDropdown > a').first();
await drop.focus();
const focused1 = await p2.evaluate(()=>document.activeElement.innerText.trim().slice(0,25));
await p2.keyboard.press('Enter');
await p2.waitForTimeout(400);
const afterEnter = await p2.evaluate(()=>{
  const d=document.querySelector('.header__navItemDropdown > a');
  const menu=document.querySelector('.sous-menu, .dropdown-menu, [class*="sousMenu"]');
  return {expanded:d.getAttribute('aria-expanded'),
   menuVisible: menu? getComputedStyle(menu).display!=='none' && menu.getBoundingClientRect().height>0 : null,
   menuCls: menu? String(menu.className).slice(0,50):null,
   active: document.activeElement.innerText.trim().slice(0,25)};
});
await p2.keyboard.press('Escape'); await p2.waitForTimeout(300);
const afterEsc = await p2.evaluate(()=>{const d=document.querySelector('.header__navItemDropdown > a');
  return {expanded:d.getAttribute('aria-expanded'), active:document.activeElement.innerText.trim().slice(0,25)};});
console.log(JSON.stringify({mobileControls:before, focused1, afterEnter, afterEsc},null,1));
await b.close();
