/**
 * Preuve SC-004 / SC-005 (spec 022) : les déroulants du header s'ouvrent et
 * naviguent, et l'état ACTIF souligne le bon lien sur chaque page atteignable du
 * menu semé — cas « parent d'un enfant actif » inclus (spike S1b : sémantique
 * native `website.menu._is_active()`, récursive).
 *
 * scenarioId DISTINCT des rouges pré-existants (quickstart §7). Les pages cibles
 * sont des FIXTURES de scénario (jamais embarquées dans l'addon) : créées ici via
 * le shell Odoo, publiées, partageant une vue minimale. Reçu sous specs/022.
 *
 * Le scénario réutilise l'instance déjà installée (base URL depuis l'environnement
 * — PQR_ODOO_PORT) ; il ne réinstalle pas (la barre système + le menu semé sont
 * livrés par le post_init_hook à l'install).
 *
 * ORDRE DE LA SUITE (limite 14 du rapport de clôture, constatée le 2026-08-22).
 * Ces scénarios réutilisent l'instance et se transmettent l'état du menu :
 *   header-visual → header-nav → header-menu → header-regen → sections-intact
 * `header-nav` exige le menu semé INTACT ; `header-regen` exige au contraire les
 * éditions posées par `header-menu`. Lancés dans un autre ordre, ils rougissent
 * en mesurant l'état du voisin. Une base fraîche remet le menu au semis.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from '../../../../extract/figma/visual-parity/render.js';
import { REPO } from '../lib/receipt.mts';
import { baseUrl, odooShell, readQaEnv } from '../run.mts';

const SNAPSHOT = 'odoo-019-foundation';
const OUT = path.join(REPO, 'specs', '022-odoo-nav-shell', 'proofs', 'header-nav.json');

const DROPDOWNS = ['Portes de garage', 'Portes d’entrée'];
const REACHABLE = [
  { url: '/depannage-sav', active: 'Dépannage/SAV', kind: 'leaf' as const },
  { url: '/a-propos', active: 'À propos', kind: 'leaf' as const },
  { url: '/portes-residentielles', active: 'Portes de garage', kind: 'child' as const, dd: 'Portes résidentielles' },
  { url: '/portes-industrielles', active: 'Portes de garage', kind: 'child' as const, dd: 'Portes industrielles' },
  { url: '/motorisation', active: 'Portes d’entrée', kind: 'child' as const, dd: 'Motorisation' },
];
const FIXTURE_URLS = [
  '/portes-de-garage', '/portes-residentielles', '/portes-industrielles',
  '/portes-entree', '/motorisation', '/depannage-sav', '/a-propos', '/contactez-nous',
];

function creerFixtures(env: ReturnType<typeof readQaEnv>): boolean {
  const py = [
    "site = env['website'].sudo().search([], limit=1)",
    "view = env['ir.ui.view'].sudo().search([('key','=','piqueray_ds_qa.nav_fixture')], limit=1)",
    'if not view:',
    "    view = env['ir.ui.view'].sudo().create({'name':'PQR nav fixture','type':'qweb','key':'piqueray_ds_qa.nav_fixture','arch':'<t name=\"PQR nav fixture\"><t t-call=\"website.layout\"><div id=\"wrap\" class=\"oe_structure\"><section class=\"s_text_block\"><div class=\"container\"><h1>Fixture QA</h1></div></section></div></t></t>'})",
    `for u in ${JSON.stringify(FIXTURE_URLS)}:`,
    "    if not env['website.page'].sudo().search([('url','=',u),('website_id','=',site.id)], limit=1):",
    "        env['website.page'].sudo().create({'url':u,'view_id':view.id,'is_published':True,'website_id':site.id,'name':u.strip('/') or 'accueil'})",
    'env.cr.commit()',
    "print('FIXTURES_OK')",
    '',
  ].join('\n');
  return odooShell(env, py).includes('FIXTURES_OK');
}

interface Constat { quoi: string; statut: 'pass' | 'fail' | 'skipped'; attendu: string; observe: string }

async function main() {
  const env = readQaEnv();
  const base = baseUrl(env);
  const constats: Constat[] = [];
  const note = (quoi: string, ok: boolean, attendu: string, observe: string) => {
    constats.push({ quoi, statut: ok ? 'pass' : 'fail', attendu, observe });
    console.log(`  ${ok ? '✔' : '✖'} ${quoi} — attendu « ${attendu} », observé « ${observe} »`);
  };

  note('fixtures — pages cibles minimales créées (publiées, hors addon)', creerFixtures(env), `${FIXTURE_URLS.length} pages`, 'FIXTURES_OK ou échec');

  const { browser } = await launchBrowser();
  try {
    const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, colorScheme: 'light' });
    const page = await ctx.newPage();

    // --- SC-004 : chaque déroulant s'ouvre (Bootstrap) et porte ses enfants ---
    await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.evaluate(`Promise.race([document.fonts.ready, new Promise(r=>setTimeout(r,3000))])`);
    for (const label of DROPDOWNS) {
      // Clic via l'API DOM (Bootstrap data-api gère `click` et bascule `.show`) :
      // le clic synthétique de Playwright sur l'ancre `href="#"` ne se propageait
      // pas jusqu'au handler ; le clic DOM est fidèle au geste de l'utilisateur.
      // POLL : sur une install FRAÎCHE, Odoo compile les assets au 1er chargement —
      // le listener dropdown de Bootstrap peut s'attacher après notre clic. On
      // ré-essaie jusqu'à ouverture (borné), au lieu d'un clic unique fragile.
      const st = JSON.parse(await page.evaluate(`(async function(l){
        var h=document.querySelectorAll('.header')[0];
        var dds=[].slice.call(h.querySelectorAll('.header__navItemDropdown'));
        var dd=dds.find(function(d){var s=d.querySelector('.nav-item__libell'); return s && s.textContent===l;});
        if(!dd) return JSON.stringify({found:false});
        var t=dd.querySelector('.nav-item'); var m=dd.querySelector('.dropdown-menu');
        for(var i=0;i<40;i++){
          t.click();
          await new Promise(function(r){setTimeout(r,250);});
          if(m.classList.contains('show') && getComputedStyle(m).display!=='none') break;
          document.body.click();
          await new Promise(function(r){setTimeout(r,150);});
        }
        var hrefs=[].slice.call(m.querySelectorAll('.dropdown-item')).map(function(a){return a.getAttribute('href');});
        return JSON.stringify({found:true, shown:m.classList.contains('show')&&getComputedStyle(m).display!=='none', aria:t.getAttribute('aria-expanded'), hrefs:hrefs});
      })(${JSON.stringify(label)})`)) as { found: boolean; shown?: boolean; aria?: string; hrefs?: string[] };
      const navigable = !!st.hrefs && st.hrefs.length > 0 && st.hrefs.every((href) => typeof href === 'string' && href.startsWith('/'));
      note(`SC-004 — le déroulant « ${label} » s'ouvre et ses enfants sont navigables`,
        st.found && !!st.shown && st.aria === 'true' && navigable,
        'ouvert (show + aria-expanded), enfants à href interne',
        `ouvert ${st.shown}, aria ${st.aria}, hrefs ${JSON.stringify(st.hrefs)}`);
      // Referme avant le déroulant suivant.
      await page.evaluate(`document.body.click()`);
      await page.waitForTimeout(150);
    }

    // --- SC-005 : soulignement exact sur chaque page atteignable ---
    for (const r of REACHABLE) {
      await page.goto(`${base}${r.url}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await page.evaluate(`Promise.race([document.fonts.ready, new Promise(r=>setTimeout(r,2000))])`);
      const state = JSON.parse(await page.evaluate(`(function(){
        var h=document.querySelectorAll('.header')[0];
        var act=[].slice.call(h.querySelectorAll('.nav-item[data-actif]')).map(function(a){var s=a.querySelector('.nav-item__libell');return {label:s?s.textContent:'', aria:a.getAttribute('aria-current'), soul:!!a.querySelector('.nav-item__Soulignement')};});
        var ddActive=[].slice.call(h.querySelectorAll('.dropdown-menu .dropdown-item.active')).map(function(a){return a.textContent.trim();});
        return JSON.stringify({act:act, ddActive:ddActive});
      })()`)) as { act: Array<{ label: string; aria: string | null; soul: boolean }>; ddActive: string[] };
      const active = state.act.find((a) => a.label === r.active);
      const okActive = !!active && active.aria === 'page' && active.soul === true && state.act.length === 1;
      note(`SC-005 — ${r.url} → « ${r.active} » souligné (aria-current + Soulignement, unique)`,
        okActive, `1 actif « ${r.active} »`, JSON.stringify(state.act));
      if (r.kind === 'child') {
        note(`SC-005 — ${r.url} → entrée de sous-menu « ${r.dd} » active (style Odoo)`,
          state.ddActive.includes(r.dd!), `active « ${r.dd} »`, JSON.stringify(state.ddActive));
      }
    }
    await ctx.close();
  } finally {
    await browser.close();
  }

  const fail = constats.some((c) => c.statut === 'fail');
  const status = fail ? 'fail' : constats.length === 0 ? 'skipped' : 'pass';
  const receipt = {
    receiptId: `header-nav-${SNAPSHOT}`, scenarioId: 'header-nav', snapshotId: SNAPSHOT, status,
    fixture: 'seeded-menu',
    observations: constats.map((c) => `[${c.statut}] ${c.quoi} — attendu « ${c.attendu} », observé « ${c.observe} »`),
    artifacts: [], limitCodes: ['SC-004-SUBMENU-ODOO-DEFAULT-STYLE'],
  };
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(receipt, null, 2) + '\n');
  console.log(`\n→ ${path.relative(REPO, OUT)} · reçu « ${status} »`);
  process.exit(status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error(`✖ ${e instanceof Error ? e.message : String(e)}`); process.exit(1); });
}
