import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROOFS, Recueil } from '../lib/receipt.mts';
import {
  NAV_TIMEOUT_MS, attendreOdoo, baseUrl, compose, dockerDisponible,
  ouvrirSessionEditeur, ouvrirSessionPublique, withInstance,
} from '../run.mts';

const paths = ['/piqueray-harness/presentation-visual', '/piqueray-harness/google-reviews-visual', '/piqueray-harness/hero-visual', '/piqueray-harness/equipe-visual', '/piqueray-harness/devis-visual', '/piqueray-harness/sav-visual'];
const ROOTS = '.s_pqr_presentation, .s_pqr_google_reviews, .s_pqr_hero, .s_pqr_equipe, .s_pqr_devis, .s_pqr_sav';

async function snapshot(browser: any, env: any) {
  const session = await ouvrirSessionPublique(browser);
  try {
    const result = [];
    for (const pathname of paths) {
      const page = await session.context.newPage();
      const response = await page.goto(`${baseUrl(env)}${pathname}?update=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
      const root = page.locator(ROOTS).first();
      result.push({
        pathname,
        status: response?.status() ?? null,
        text: ((await root.textContent()) ?? '').replace(/\s+/g, ' ').trim(),
        metadata: await root.evaluate((node: HTMLElement) => ({
          contract: node.dataset.dsContract ?? null,
          contractVersion: node.dataset.dsContractVersion ?? null,
          authoringVersion: node.dataset.dsAuthoringVersion ?? null,
          graphDigest: node.dataset.dsGraphDigest ?? null,
          vcss: node.dataset.vcss ?? null, vxml: node.dataset.vxml ?? null, vjs: node.dataset.vjs ?? null,
        })),
        publicEditable: await root.locator('[contenteditable="true"]').count(),
      });
      await page.close();
    }
    return result;
  } finally { await session.context.close(); }
}

async function main() {
  const started = Date.now();
  const install = new Recueil('install-update', 'odoo-019-foundation', 'four-sections-saved');
  const authorization = new Recueil('authorization', 'odoo-019-foundation', 'anonymous-vs-designer');
  if (!dockerDisponible()) {
    install.saute('clean install/update', 'Docker indisponible', 'ODOO-LIMIT-NO-INSTANCE');
    authorization.saute('autorisations', 'Docker indisponible', 'ODOO-LIMIT-NO-INSTANCE');
    install.ecrire('install-update.json', Date.now() - started);
    authorization.ecrire('authorization.json', Date.now() - started);
    process.exit(1);
  }
  await withInstance(async ({ browser, env }) => {
    const before = await snapshot(browser, env);
    install.constateSi('clean install — chaque section publique répond', before.length === paths.length && before.every((item) => item.status === 200 && item.text.length > 0), `${paths.length} pages HTTP 200 remplies`, JSON.stringify(before.map((item) => ({ path: item.pathname, status: item.status, chars: item.text.length }))));
    install.constateSi('métadonnées — chaque racine porte versions et digest', before.every((item) => Object.values(item.metadata).every(Boolean)), '7 métadonnées présentes par racine', JSON.stringify(before.map((item) => item.metadata)));

    const updated = compose(['run', '--rm', 'odoo', 'odoo', '-d', env.dbName, '-u', 'piqueray_ds,piqueray_ds_qa', '--db_host=db', '--without-demo=True', '--stop-after-init', '--log-level=warn']);
    install.constateSi('update — odoo -u termine sans erreur', updated.status === 0, 'code 0', `code ${updated.status}`);
    compose(['restart', 'odoo']);
    if (!(await attendreOdoo(env))) throw new Error('Odoo ne répond plus après -u');
    const after = await snapshot(browser, env);
    install.artefact(path.join(PROOFS, 'install-update.before-after.json'), Buffer.from(JSON.stringify({ before, after }, null, 2) + '\n'), 'json');
    install.constateSi('update — contenu public intact', JSON.stringify(after.map((item) => item.text)) === JSON.stringify(before.map((item) => item.text)), 'textes identiques avant/après', JSON.stringify(after.map((item) => item.text.length)));
    install.constateSi('update — métadonnées intactes sans migration implicite', JSON.stringify(after.map((item) => item.metadata)) === JSON.stringify(before.map((item) => item.metadata)), 'métadonnées identiques avant/après', JSON.stringify(after.map((item) => item.metadata)));

    authorization.constateSi('public anonyme — aucune zone contenteditable', after.every((item) => item.publicEditable === 0), '0 contenteditable public', after.map((item) => `${item.pathname}:${item.publicEditable}`).join(' · '));
    const editor = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await editor.context.newPage();
      await page.goto(`${baseUrl(env)}/odoo/action-website.website_preview?path=${encodeURIComponent(paths[0])}&enable_editor=1`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
      const deadline = Date.now() + 120_000;
      let editable = 0;
      let builderOpen = 0;
      // Attendre LES DEUX conditions assérées, comme enterEditor : le chrome
      // builder (body.o_builder_open, document haut) peut arriver APRÈS les
      // zones éditables de l'iframe sur une compilation de bundles à froid —
      // course mesurée le 2026-08-12 (« 4 zone(s) · builder=0 »).
      while (Date.now() < deadline && (editable < 3 || builderOpen !== 1)) {
        builderOpen = await page.locator('body.o_builder_open').count();
        for (const frame of page.frames()) if (frame.url().includes(paths[0])) editable = await frame.locator('.s_pqr_presentation [contenteditable="true"], .s_pqr_google_reviews [contenteditable="true"]').count().catch(() => 0);
        if (editable < 3 || builderOpen !== 1) await page.waitForTimeout(400);
      }
      authorization.constateSi('rédacteur standard — édition disponible après update', editable >= 3 && builderOpen === 1, 'builder ouvert et ≥3 zones éditables', `${editable} zone(s) · builder=${builderOpen}`);
    } finally { await editor.context.close(); }
  });
  const a = install.ecrire('install-update.json', Date.now() - started);
  const b = authorization.ecrire('authorization.json', Date.now() - started);
  process.exit(a.status === 'pass' && b.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => { console.error(`✖ ${String(error)}`); process.exit(1); });
}
