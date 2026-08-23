/**
 * Preuve SC-006 (spec 023) : l'apparence du footer est GOUVERNÉE par le contrat —
 * régénérable par projection, jamais figée à la main.
 *
 * Le scénario :
 *   1. `npm run build && npm run odoo:assets --check` reproduit la CSS à l'octet
 *   2. Les textes du rédacteur survivent au cycle build → assets → update
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from '../../../../extract/figma/visual-parity/render.js';
import { REPO, sha256 } from '../lib/receipt.mts';
import { COMPOSE, attendreOdoo, baseUrl, compose, readQaEnv } from '../run.mts';

const SNAPSHOT = 'odoo-019-foundation';
const OUT = path.join(REPO, 'specs', '023-odoo-footer-shell', 'proofs', 'footer-regen.json');

function npm(args: string[]): { code: number; out: string } {
  const r = spawnSync('npm', ['run', '-s', ...args], { cwd: REPO, encoding: 'utf8', timeout: 600_000, env: { ...process.env } });
  return { code: r.status ?? -1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

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

  const readFooterTexts = async (): Promise<{ col1: string; copyright: string; hasLogo: boolean; hasCta: boolean }> => {
    const ctx = await browser.newContext({ viewport: { width: 1600, height: 5500 } });
    const page = await ctx.newPage();
    await page.goto(`${base}/?pqr=footer-regen-${++nonce}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.evaluate(`Promise.race([document.fonts.ready, new Promise(r=>setTimeout(r,2500))])`);
    const out = JSON.parse(await page.evaluate(`(function(){
      var f=document.querySelector('[data-pqr-shell="footer"]');
      if(!f) return JSON.stringify({col1:'',copyright:'',hasLogo:false,hasCta:false});
      var cols=f.querySelectorAll('.footer-column__Texte');
      var cp=f.querySelector('.copyright__Texte');
      return JSON.stringify({
        col1:(cols[0]||{}).textContent||'',
        copyright:(cp||{}).textContent||'',
        hasLogo:!!f.querySelector('.piqueray-logo'),
        hasCta:!!f.querySelector('.button--variant-outlineBlanc')
      });
    })()`));
    await ctx.close();
    return out;
  };

  try {
    // AVANT
    const before = await readFooterTexts();
    note('avant régénération — footer rend du contenu',
      before.col1.length > 0, 'col1 non vide', `${before.col1.length} chars`);

    // 1. La CSS est RÉGÉNÉRABLE
    const build = npm(['build']);
    note('régénération repo — npm run build vert', build.code === 0, 'exit 0', `exit ${build.code}`);
    const check = npm(['odoo:assets', '--', '--check']);
    note('SC-006 — CSS footer reproduite À L\'OCTET (déterministe, non figée)',
      check.code === 0 && /conformes/.test(check.out), 'odoo:assets --check propre',
      check.out.trim().split('\n').pop() ?? `exit ${check.code}`);

    // 2. Cycle update : les textes survivent
    compose(['stop', 'odoo']);
    const r = spawnSync('docker', [
      'compose', '-f', COMPOSE, 'run', '--rm', 'odoo', 'odoo',
      '-d', env.dbName, '-u', 'piqueray_ds', '--db_host=db',
      '--stop-after-init', '--log-level=warn',
    ], { cwd: REPO, encoding: 'utf8', timeout: 300_000 });
    note('update module après régénération', (r.status ?? -1) === 0, 'exit 0', `exit ${r.status ?? -1}`);
    compose(['start', 'odoo']);
    const up = await attendreOdoo(env);
    note('Odoo repart', up, 'healthcheck OK', up ? 'OK' : 'timeout');

    // APRÈS
    const after = await readFooterTexts();
    note('SC-006 — textes survivent à la régénération',
      after.col1 === before.col1 && after.copyright === before.copyright,
      'identique', after.col1 === before.col1 ? 'identique' : 'DIFFERENT');
    note('SC-006 — design intact après régénération',
      after.hasLogo && after.hasCta, 'logo + CTA', `logo=${after.hasLogo} cta=${after.hasCta}`);
  } finally {
    await browser.close();
  }

  const fail = constats.some((c) => c.statut === 'fail');
  const status = fail ? 'fail' : 'pass';
  const receipt = {
    receiptId: `footer-regen-${SNAPSHOT}`, scenarioId: 'footer-regen', snapshotId: SNAPSHOT, status,
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
