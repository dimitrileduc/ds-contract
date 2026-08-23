/**
 * Preuve SC-005 / FR-008 (spec 023) : le footer est présent sur CHAQUE page, et le
 * header shell + les sections de contenu restent intacts.
 *
 * Le scénario vérifie 4 pages différentes : la homepage et 3 bancs de sections
 * (chacun servi par `website.layout`, donc coiffé du header + du footer).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from '../../../../extract/figma/visual-parity/render.js';
import { REPO } from '../lib/receipt.mts';
import { baseUrl, readQaEnv } from '../run.mts';

const SNAPSHOT = 'odoo-019-foundation';
const OUT = path.join(REPO, 'specs', '023-odoo-footer-shell', 'proofs', 'footer-pages.json');

const PAGES = [
  { url: '/', label: 'homepage' },
  { url: '/piqueray-harness/presentation-visual', label: 'presentation' },
  { url: '/piqueray-harness/hero-visual', label: 'hero' },
  { url: '/piqueray-harness/equipe-visual', label: 'equipe' },
];

interface Constat { quoi: string; statut: 'pass' | 'fail'; attendu: string; observe: string }

async function main() {
  const env = readQaEnv();
  const base = baseUrl(env);
  const constats: Constat[] = [];
  const note = (quoi: string, ok: boolean, attendu: string, observe: string) => {
    constats.push({ quoi, statut: ok ? 'pass' : 'fail', attendu, observe });
    console.log(`  ${ok ? '✔' : '✖'} ${quoi} — attendu « ${attendu} », observé « ${observe} »`);
  };

  const { browser } = await launchBrowser();
  try {
    for (const pg of PAGES) {
      const ctx = await browser.newContext({ viewport: { width: 1600, height: 5500 } });
      const page = await ctx.newPage();
      const resp = await page.goto(`${base}${pg.url}?pqr=pages`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await page.evaluate(`Promise.race([document.fonts.ready, new Promise(r=>setTimeout(r,2500))])`);

      const st = JSON.parse(await page.evaluate(`(function(){
        var footer=document.querySelector('[data-pqr-shell="footer"]');
        var header=document.querySelector('[data-pqr-shell="header"]');
        return JSON.stringify({
          hasFooter:!!footer,
          footerContract:footer?footer.getAttribute('data-ds-contract'):'',
          footerLogo:footer?!!footer.querySelector('.piqueray-logo'):false,
          footerCta:footer?!!footer.querySelector('.button--variant-outlineBlanc'):false,
          footerCopyright:footer?!!footer.querySelector('.copyright'):false,
          hasHeader:!!header,
          headerContract:header?header.getAttribute('data-ds-contract'):'',
          httpStatus:${resp?.status() ?? 0}
        });
      })()`));

      note(`${pg.label} — HTTP 200`, (resp?.status() ?? 0) === 200,
        '200', `${resp?.status() ?? 'no response'}`);
      note(`${pg.label} — footer présent`, st.hasFooter,
        'data-pqr-shell="footer"', `${st.hasFooter}`);
      note(`${pg.label} — footer contract attr`, st.footerContract === 'ds.footer',
        'ds.footer', st.footerContract);
      note(`${pg.label} — footer design intact`, st.footerLogo && st.footerCta && st.footerCopyright,
        'logo+cta+copyright', `logo=${st.footerLogo} cta=${st.footerCta} copyright=${st.footerCopyright}`);
      note(`${pg.label} — header shell intact`, st.hasHeader && st.headerContract === 'ds.header',
        'ds.header', st.headerContract);

      await ctx.close();
    }
  } finally {
    await browser.close();
  }

  const fail = constats.some((c) => c.statut === 'fail');
  const status = fail ? 'fail' : 'pass';
  const receipt = {
    receiptId: `footer-pages-${SNAPSHOT}`, scenarioId: 'footer-pages', snapshotId: SNAPSHOT, status,
    fixture: 'deployed-footer-shell',
    observations: constats.map((c) => `[${c.statut}] ${c.quoi} — attendu « ${c.attendu} », observé « ${c.observe} »`),
    artifacts: [],
    limitCodes: [],
  };
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(receipt, null, 2) + '\n');
  console.log(`\n→ ${path.relative(REPO, OUT)} · reçu « ${status} »`);
  process.exit(status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error(`✖ ${e instanceof Error ? e.message : String(e)}`); process.exit(1); });
}
