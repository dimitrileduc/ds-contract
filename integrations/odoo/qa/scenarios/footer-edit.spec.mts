/**
 * Preuve SC-002 / SC-003 (spec 023) : le rédacteur modifie les textes autorisés
 * du footer (colonnes + copyright) via l'ORM, et le contenu est conservé sur la
 * page publique avec le design intact.
 *
 * MÉCANISME : les textes éditables du footer sont des champs `Text` du modèle
 * `website` (`x_pqr_footer_col1`, `x_pqr_footer_col2`, `x_pqr_footer_col3`,
 * `x_pqr_footer_copyright`), rendus par `t-field`. L'invariant est STRUCTUREL :
 * le gabarit ne fait que LIRE ces champs et re-rend le footer à chaque requête.
 *
 * Le scénario :
 *   1. Lit le footer public (baseline)
 *   2. Modifie les 4 champs via l'ORM
 *   3. Relit le footer public : contenu modifié conservé, design intact
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from '../../../../extract/figma/visual-parity/render.js';
import { REPO } from '../lib/receipt.mts';
import { baseUrl, odooShell, readQaEnv } from '../run.mts';

const SNAPSHOT = 'odoo-019-foundation';
const OUT = path.join(REPO, 'specs', '023-odoo-footer-shell', 'proofs', 'footer-edit.json');

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
  let nonce = 0;

  const readFooter = async (): Promise<{
    col1: string; col2: string; col3: string; copyright: string;
    hasLogo: boolean; hasCta: boolean; hasSocial: boolean; hasSeparator: boolean;
    shellAttr: boolean; contractAttr: boolean;
  }> => {
    const ctx = await browser.newContext({ viewport: { width: 1600, height: 5500 } });
    const page = await ctx.newPage();
    await page.goto(`${base}/?pqr=footer-edit-${++nonce}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.evaluate(`Promise.race([document.fonts.ready, new Promise(r=>setTimeout(r,2500))])`);
    const out = JSON.parse(await page.evaluate(`(function(){
      var f=document.querySelector('[data-pqr-shell="footer"]');
      if(!f) return JSON.stringify({col1:'',col2:'',col3:'',copyright:'',hasLogo:false,hasCta:false,hasSocial:false,hasSeparator:false,shellAttr:false,contractAttr:false});
      var cols=f.querySelectorAll('.footer-column__Texte');
      var cp=f.querySelector('.copyright__Texte');
      return JSON.stringify({
        col1:(cols[0]||{}).textContent||'',
        col2:(cols[1]||{}).textContent||'',
        col3:(cols[2]||{}).textContent||'',
        copyright:(cp||{}).textContent||'',
        hasLogo:!!f.querySelector('.piqueray-logo'),
        hasCta:!!f.querySelector('.button--variant-outlineBlanc'),
        hasSocial:!!f.querySelector('[data-pqr-part="reseaux-sociaux"]'),
        hasSeparator:!!f.querySelector('.footer__Separator'),
        shellAttr:f.getAttribute('data-pqr-shell')==='footer',
        contractAttr:f.getAttribute('data-ds-contract')==='ds.footer'
      });
    })()`));
    await ctx.close();
    return out;
  };

  try {
    // 1. Baseline
    const before = await readFooter();
    note('baseline — footer présent avec les champs semés', before.shellAttr && before.col1.length > 0,
      'shell=footer + col1 non vide', `shell=${before.shellAttr}, col1=${before.col1.length} chars`);
    note('baseline — design intact (logo + CTA + réseaux + séparateur)',
      before.hasLogo && before.hasCta && before.hasSocial && before.hasSeparator,
      'tous les éléments de design présents',
      `logo=${before.hasLogo} cta=${before.hasCta} social=${before.hasSocial} sep=${before.hasSeparator}`);

    // 2. Modifier les 4 champs via l'ORM
    const EDIT_COL1 = 'Adresse modifiée par QA';
    const EDIT_COL2 = 'Horaires QA\nLun-Ven 9h-18h';
    const EDIT_COL3 = 'Contact QA\ntest@example.com';
    const EDIT_COPYRIGHT = '© 2026 QA Test — Tous droits réservés';

    const py = [
      "site = env['website'].sudo().search([], limit=1)",
      `site.x_pqr_footer_col1 = ${JSON.stringify(EDIT_COL1)}`,
      `site.x_pqr_footer_col2 = ${JSON.stringify(EDIT_COL2)}`,
      `site.x_pqr_footer_col3 = ${JSON.stringify(EDIT_COL3)}`,
      `site.x_pqr_footer_copyright = ${JSON.stringify(EDIT_COPYRIGHT)}`,
      'env.cr.commit()',
      "print('EDIT_OK')",
      '',
    ].join('\n');
    const shellOut = odooShell(env, py);
    note('édition ORM — 4 champs modifiés', shellOut.includes('EDIT_OK'),
      'EDIT_OK', shellOut.includes('EDIT_OK') ? 'EDIT_OK' : shellOut.trim().split('\n').pop() ?? '(vide)');

    // 3. Relire et vérifier
    const after = await readFooter();
    note('SC-002 — col1 conservée après édition', after.col1.includes('Adresse modifiée'),
      EDIT_COL1, after.col1);
    note('SC-002 — col2 conservée après édition', after.col2.includes('Horaires QA'),
      'contient "Horaires QA"', after.col2.slice(0, 40));
    note('SC-002 — col3 conservée après édition', after.col3.includes('Contact QA'),
      'contient "Contact QA"', after.col3.slice(0, 40));
    note('SC-003 — copyright conservé après édition', after.copyright.includes('QA Test'),
      'contient "QA Test"', after.copyright);
    note('SC-002 — design intact après édition (logo + CTA + réseaux + séparateur)',
      after.hasLogo && after.hasCta && after.hasSocial && after.hasSeparator,
      'tous les éléments de design présents',
      `logo=${after.hasLogo} cta=${after.hasCta} social=${after.hasSocial} sep=${after.hasSeparator}`);
    note('SC-002 — attribut data-ds-contract intact', after.contractAttr,
      'data-ds-contract="ds.footer"', `${after.contractAttr}`);
  } finally {
    await browser.close();
  }

  const fail = constats.some((c) => c.statut === 'fail');
  const status = fail ? 'fail' : 'pass';
  const receipt = {
    receiptId: `footer-edit-${SNAPSHOT}`, scenarioId: 'footer-edit', snapshotId: SNAPSHOT, status,
    fixture: 'seeded-footer-fields',
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
