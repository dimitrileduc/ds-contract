/**
 * Preuve SC-006 (spec 022) : l'apparence de la nav est GOUVERNÉE par le contrat —
 * régénérable par projection, jamais figée à la main — ET une régénération
 * complète ne touche PAS au menu du client (FR-016).
 *
 * Il n'existe pas d'« avant » en ligne au design 1.0.0 (research D14.4, deux temps
 * stricts) : le bump réel 1.0.0 → 2.0.0 est attesté par les reçus amont. Ce scénario
 * prouve les deux moitiés restantes :
 *   1. l'apparence est RÉGÉNÉRABLE — `npm run build` + `npm run odoo:assets --check`
 *      reproduisent la CSS du header À L'OCTET (déterministe) : elle vient du
 *      contrat, elle n'est pas figée à la main ;
 *   2. le menu du client (modifié par le scénario US2) est BYTE-IDENTIQUE avant et
 *      après une régénération complète `build → odoo:assets → update module`.
 *
 * ORDRE DE LA SUITE (limite 14 du rapport de clôture, constatée le 2026-08-22).
 * Ces scénarios réutilisent l'instance et se transmettent l'état du menu :
 *   header-visual → header-nav → header-menu → header-regen → sections-intact
 * `header-nav` exige le menu semé INTACT ; `header-regen` exige au contraire les
 * éditions posées par `header-menu`. Lancés dans un autre ordre, ils rougissent
 * en mesurant l'état du voisin. Une base fraîche remet le menu au semis.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from '../../../../extract/figma/visual-parity/render.js';
import { REPO, sha256 } from '../lib/receipt.mts';
import { COMPOSE, attendreOdoo, baseUrl, compose, odooShell, readQaEnv } from '../run.mts';

const SNAPSHOT = 'odoo-019-foundation';
const OUT = path.join(REPO, 'specs', '022-odoo-nav-shell', 'proofs', 'header-regen.json');
const DUMP = path.join(REPO, 'specs', '022-odoo-nav-shell', 'proofs', 'sc-006-regeneration.json');

function npm(args: string[]): { code: number; out: string } {
  const r = spawnSync('npm', ['run', '-s', ...args], { cwd: REPO, encoding: 'utf8', timeout: 600_000, env: { ...process.env } });
  return { code: r.status ?? -1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

/** Cliché CANONIQUE du menu — indépendant des ids : tuples triés
 *  (nom, url, parent, séquence, new_window). Byte-comparable avant/après. */
function menuSnapshot(env: ReturnType<typeof readQaEnv>): string {
  const py = [
    'import json',
    "site = env['website'].sudo().search([], limit=1)",
    "rows = []",
    "for m in env['website.menu'].sudo().search([('website_id','=',site.id)]):",
    "    if not m.parent_id: continue",
    "    rows.append([m.name or '', m.url or '', (m.parent_id.name or ''), m.sequence, bool(m.new_window)])",
    "rows.sort()",
    "print('SNAP:' + json.dumps(rows, ensure_ascii=False, sort_keys=True))",
    '',
  ].join('\n');
  const out = odooShell(env, py);
  const line = out.split('\n').find((l) => l.startsWith('SNAP:'));
  return line ? line.slice('SNAP:'.length) : '';
}

function updateModule(env: ReturnType<typeof readQaEnv>): number {
  const r = spawnSync('docker', ['compose', '-f', COMPOSE, 'run', '--rm', 'odoo', 'odoo', '-d', env.dbName, '-u', 'piqueray_ds', '--db_host=db', '--stop-after-init', '--log-level=warn'],
    { cwd: REPO, encoding: 'utf8', timeout: 300_000, env: { ...process.env } });
  compose(['restart', 'odoo']);
  return r.status ?? -1;
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

  // --- AVANT : cliché du menu client (modifié par US2) ---
  const before = menuSnapshot(env);
  note('menu client capturé (modifié par US2, non trivial)', before.length > 2 && before.includes('Notre histoire'), 'cliché non vide portant les éditions US2', `${before.length} octets`);

  // --- 1) apparence RÉGÉNÉRABLE : le contrat reproduit la CSS du header à l'octet ---
  const build = npm(['build']);
  note('régénération repo — npm run build vert', build.code === 0, 'exit 0', `exit ${build.code}`);
  const check = npm(['odoo:assets', '--', '--check']);
  note('apparence régénérable — la CSS du header est reproduite À L\'OCTET (déterministe, non figée)',
    check.code === 0 && /conformes/.test(check.out), 'odoo:assets --check propre', check.out.trim().split('\n').pop() ?? `exit ${check.code}`);

  // --- 2) update module (rebundle des assets régénérés) SANS toucher au menu ---
  const upCode = updateModule(env);
  note('update module — projection régénérée appliquée à l\'instance', upCode === 0, 'exit 0', `exit ${upCode}`);
  await attendreOdoo(env);

  // --- APRÈS : le menu client est byte-identique ---
  const after = menuSnapshot(env);
  note('SC-006 / FR-016 — website.menu byte-identique avant/après la régénération',
    after === before && after.length > 0, 'cliché identique', after === before ? 'identique' : `AVANT ${sha256(before).slice(0, 12)} ≠ APRÈS ${sha256(after).slice(0, 12)}`);

  // --- la barre en ligne rend encore l'apparence gouvernée ---
  const { browser } = await launchBrowser();
  try {
    const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${base}/?pqr=regen`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.evaluate(`Promise.race([document.fonts.ready, new Promise(r=>setTimeout(r,2500))])`);
    const bar = JSON.parse(await page.evaluate(`(function(){var h=document.querySelectorAll('.header')[0]; return JSON.stringify({logo:!!h.querySelector('.piqueray-logo'), cta:!!h.querySelector('.button--variant-blanc'), icons:!!h.querySelector('.header__iconsNav'), links:h.querySelectorAll('.header__nav .nav-item').length});})()`)) as any;
    note('la barre en ligne rend l\'apparence gouvernée après régénération', bar.logo && bar.cta && bar.icons && bar.links > 0,
      'logo + CTA + icônes + liens', JSON.stringify(bar));
    await ctx.close();
  } finally {
    await browser.close();
  }

  mkdirSync(path.dirname(DUMP), { recursive: true });
  writeFileSync(DUMP, JSON.stringify({ schemaVersion: 1, menuBefore: JSON.parse(before || '[]'), menuAfter: JSON.parse(after || '[]'), byteIdentical: after === before, assetsRegenerableCheck: check.code === 0 }, null, 2) + '\n');

  const fail = constats.some((c) => c.statut === 'fail');
  const status = fail ? 'fail' : 'pass';
  const receipt = {
    receiptId: `header-regen-${SNAPSHOT}`, scenarioId: 'header-regen', snapshotId: SNAPSHOT, status,
    fixture: 'seeded-menu-edited',
    observations: constats.map((c) => `[${c.statut}] ${c.quoi} — attendu « ${c.attendu} », observé « ${c.observe} »`),
    artifacts: [{ path: path.relative(REPO, DUMP), sha256: sha256(JSON.stringify({ before, after })), kind: 'report' }],
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
