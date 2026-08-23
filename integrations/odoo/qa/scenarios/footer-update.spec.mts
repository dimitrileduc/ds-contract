/**
 * Preuve SC-004 / FR-014 (spec 023) : une mise à jour du module (`-u piqueray_ds`)
 * ne détruit PAS le contenu du rédacteur. Les textes du footer (t-field sur le
 * modèle `website`) survivent à un cycle complet update + restart.
 *
 * Le scénario :
 *   1. Vérifie que les champs portent les éditions du scénario `footer-edit`
 *   2. Arrête Odoo, lance `-u piqueray_ds`, redémarre
 *   3. Relit le footer public : contenu identique, design intact
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from '../../../../extract/figma/visual-parity/render.js';
import { REPO, sha256 } from '../lib/receipt.mts';
import { COMPOSE, attendreOdoo, baseUrl, compose, readQaEnv } from '../run.mts';

const SNAPSHOT = 'odoo-019-foundation';
const OUT = path.join(REPO, 'specs', '023-odoo-footer-shell', 'proofs', 'footer-update.json');

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

  const readFooterTexts = async (): Promise<{ col1: string; col2: string; col3: string; copyright: string; hasLogo: boolean; hasCta: boolean }> => {
    const ctx = await browser.newContext({ viewport: { width: 1600, height: 5500 } });
    const page = await ctx.newPage();
    await page.goto(`${base}/?pqr=footer-update-${++nonce}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.evaluate(`Promise.race([document.fonts.ready, new Promise(r=>setTimeout(r,2500))])`);
    const out = JSON.parse(await page.evaluate(`(function(){
      var f=document.querySelector('[data-pqr-shell="footer"]');
      if(!f) return JSON.stringify({col1:'',col2:'',col3:'',copyright:'',hasLogo:false,hasCta:false});
      var cols=f.querySelectorAll('.footer-column__Texte');
      var cp=f.querySelector('.copyright__Texte');
      return JSON.stringify({
        col1:(cols[0]||{}).textContent||'',
        col2:(cols[1]||{}).textContent||'',
        col3:(cols[2]||{}).textContent||'',
        copyright:(cp||{}).textContent||'',
        hasLogo:!!f.querySelector('.piqueray-logo'),
        hasCta:!!f.querySelector('.button--variant-outlineBlanc')
      });
    })()`));
    await ctx.close();
    return out;
  };

  try {
    // 1. AVANT update — lire le contenu actuel (éditions de footer-edit)
    const before = await readFooterTexts();
    const beforeDigest = sha256(JSON.stringify(before));
    note('avant update — footer rend les éditions du rédacteur',
      before.col1.length > 0 && before.copyright.length > 0,
      'col1 et copyright non vides',
      `col1=${before.col1.length} chars, copyright=${before.copyright.length} chars`);

    // 2. Update du module
    compose(['stop', 'odoo']);
    const r = spawnSync('docker', [
      'compose', '-f', COMPOSE, 'run', '--rm', 'odoo', 'odoo',
      '-d', env.dbName, '-u', 'piqueray_ds', '--db_host=db',
      '--stop-after-init', '--log-level=warn',
    ], { cwd: REPO, encoding: 'utf8', timeout: 300_000 });
    note('update module — exit 0', (r.status ?? -1) === 0, 'exit 0', `exit ${r.status ?? -1}`);
    compose(['start', 'odoo']);
    const up = await attendreOdoo(env);
    note('Odoo repart après update', up, 'healthcheck OK', up ? 'OK' : 'timeout');

    // 3. APRÈS update — contenu byte-identique
    const after = await readFooterTexts();
    const afterDigest = sha256(JSON.stringify(after));
    note('SC-004 — col1 identique avant/après update',
      after.col1 === before.col1, before.col1.slice(0, 30), after.col1.slice(0, 30));
    note('SC-004 — col2 identique avant/après update',
      after.col2 === before.col2, 'identique', after.col2 === before.col2 ? 'identique' : 'DIFFERENT');
    note('SC-004 — col3 identique avant/après update',
      after.col3 === before.col3, 'identique', after.col3 === before.col3 ? 'identique' : 'DIFFERENT');
    note('SC-004 — copyright identique avant/après update',
      after.copyright === before.copyright, before.copyright.slice(0, 30), after.copyright.slice(0, 30));
    note('SC-004 — design intact après update',
      after.hasLogo && after.hasCta, 'logo + CTA', `logo=${after.hasLogo} cta=${after.hasCta}`);
    note('SC-004 — digest global identique',
      afterDigest === beforeDigest, beforeDigest.slice(0, 12), afterDigest.slice(0, 12));
  } finally {
    await browser.close();
  }

  const fail = constats.some((c) => c.statut === 'fail');
  const status = fail ? 'fail' : 'pass';
  const receipt = {
    receiptId: `footer-update-${SNAPSHOT}`, scenarioId: 'footer-update', snapshotId: SNAPSHOT, status,
    fixture: 'edited-footer-fields',
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
