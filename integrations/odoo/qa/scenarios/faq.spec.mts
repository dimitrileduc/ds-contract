/**
 * Qualification fonctionnelle FAQ — après le spike de mécanisme, jamais avant.
 *
 * Couvre ce que le spike ne couvre pas : inventaire STRICT des panneaux contre
 * la fixture (`faq-panel.json`), actions de racine déclarées, cardinalités 1 et
 * 0 puis renaissance par blueprint, sécurité du HTML sauvegardé (handlers
 * inline, URLs exécutables), et relecture de l'éditeur sans état parallèle.
 * Chaque geste de sélection est un VRAI clic Playwright.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Frame, Page } from 'playwright-core';
import { REPO, Recueil } from '../lib/receipt.mts';
import {
  EDITOR_TIMEOUT_MS,
  NAV_TIMEOUT_MS,
  baseUrl,
  dockerDisponible,
  ouvrirSessionEditeur,
  ouvrirSessionPublique,
  withInstance,
  type QaEnv,
} from '../run.mts';

const ROOT = '.s_pqr_faq';
const ROW = '[data-pqr-faq-row]';
const HARNESS_PATH = '/piqueray-harness/faq';
const VISUAL_PATH = '/piqueray-harness/faq-visual';
const fixture = JSON.parse(readFileSync(path.join(REPO, 'integrations/odoo/qa/fixtures/faq-panel.json'), 'utf8'));

async function enterEditor(page: Page, env: QaEnv): Promise<Frame | null> {
  await page.goto(`${baseUrl(env)}/odoo/action-website.website_preview?path=${encodeURIComponent(HARNESS_PATH)}&enable_editor=1`, {
    waitUntil: 'domcontentloaded', timeout: EDITOR_TIMEOUT_MS,
  });
  const deadline = Date.now() + EDITOR_TIMEOUT_MS;
  while (Date.now() < deadline) {
    for (const frame of page.frames()) {
      if (!frame.url().includes(HARNESS_PATH)) continue;
      if ((await page.locator('body.o_builder_open').count()) > 0 &&
        (await frame.locator('[contenteditable="true"]').count().catch(() => 0)) > 0) return frame;
    }
    await page.waitForTimeout(400);
  }
  return null;
}

async function insertFaq(page: Page): Promise<void> {
  const content = page.locator('.o_snippet_thumbnail')
    .filter({ has: page.locator('.o_snippet_thumbnail_title', { hasText: 'Content' }) }).first();
  await content.locator('button').click();
  const dialog = page.locator('.modal').last();
  await dialog.locator('input[type="search"]').fill('FAQ');
  await page.waitForTimeout(300);
  const chooser = await dialog.locator('iframe').contentFrame();
  if (!chooser) throw new Error('Iframe du catalogue Website absente.');
  await chooser.locator('[aria-label="Piqueray · FAQ"]').click();
  await page.waitForTimeout(400);
}

const rootPanel = (page: Page) => page.locator('.options-container:visible')
  .filter({ has: page.locator('[data-pqr-control="faq-collection"]') }).first();
const rowPanel = (page: Page) => page.locator('.options-container:visible')
  .filter({ has: page.locator('[data-pqr-control="faq-row-remove"]') }).first();

async function controls(panel: any): Promise<string[]> {
  return panel.locator('[data-pqr-control]').evaluateAll((nodes: Element[]) =>
    [...new Set(nodes.map((node) => node.getAttribute('data-pqr-control')).filter(Boolean))].sort(),
  );
}

async function selectRootGap(frame: Frame, root: any): Promise<void> {
  const box = await root.boundingBox();
  if (!box) throw new Error('Racine FAQ sans boîte sélectionnable.');
  const x = Math.min(Math.max(box.width / 4, 8), box.width - 8);
  await root.click({ position: { x, y: Math.min(8, Math.max(1, box.height - 1)) } });
  await frame.page().waitForTimeout(250);
}

/** L'inventaire public d'une racine FAQ, lu dans le DOM servi. */
const publicState = (page: Page) => page.locator(ROOT).evaluateAll((roots: Element[]) => roots.map((root) => ({
  rows: [...root.querySelectorAll('[data-pqr-faq-row]')].map((row) => ({
    marker: row.getAttribute('data-pqr-faq-marker'),
    titre: row.querySelector('[data-pqr-part="titre"]')?.textContent?.trim() ?? '',
    open: row.classList.contains('accordion-row--etat-ouvert'),
  })),
  eyebrow: root.querySelector('[data-pqr-part="section-header-eyebrow"]')?.textContent?.trim() ?? '',
  title: root.querySelector('[data-pqr-part="faq-title"]')?.textContent?.trim() ?? '',
  cta: root.querySelector('[data-pqr-part="button-label"]')?.textContent?.trim() ?? '',
})));

async function main() {
  const started = Date.now();
  const receipt = new Recueil('faq-functional', 'odoo-019-foundation', 'faq-panel.json');
  if (!dockerDisponible()) {
    receipt.saute('qualification FAQ sur Odoo', 'Docker indisponible', 'ODOO-LIMIT-NO-INSTANCE');
    receipt.ecrire('faq-functional.json', Date.now() - started);
    process.exit(1);
  }

  await withInstance(async ({ browser, env }) => {
    // ── Le QWeb canonique rend son sample sur la page de mesure publique.
    const probe = await ouvrirSessionPublique(browser);
    try {
      const page = await probe.context.newPage();
      const response = await page.goto(`${baseUrl(env)}${VISUAL_PATH}`, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
      await page.waitForTimeout(800);
      const initial = await publicState(page);
      receipt.constateSi('QWeb — le sample canonique rend 3 questions fermées, accroche et CTA',
        response?.status() === 200 && initial.length === 1 && initial[0].rows.length === 3 &&
          initial[0].rows.every((row) => !row.open && row.titre.length > 0) &&
          initial[0].eyebrow === 'FAQ' && initial[0].title === 'Questions fréquentes' && initial[0].cta === 'Contactez-nous',
        'HTTP 200 · 1 racine · 3 fermées · accroche FAQ · CTA Contactez-nous',
        JSON.stringify({ status: response?.status(), state: initial }));
    } finally {
      await probe.context.close();
    }

    // ── Éditeur : inventaires stricts, cardinalités, save.
    const editor = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await editor.context.newPage();
      const frame = await enterEditor(page, env);
      if (!frame) {
        receipt.saute('éditeur FAQ', 'iframe de page ou builder absent', 'ODOO-LIMIT-EDITOR-ENTRY');
        return;
      }
      await insertFaq(page);
      await insertFaq(page);
      const roots = frame.locator(ROOT);
      const first = roots.first();
      const second = roots.nth(1);
      receipt.constateSi('catalogue — deux FAQ indépendantes sont insérées',
        await roots.count() === 2 && await first.locator(ROW).count() === 3 && await second.locator(ROW).count() === 3,
        'A=3, B=3', `racines=${await roots.count()} · A=${await first.locator(ROW).count()} · B=${await second.locator(ROW).count()}`);

      await selectRootGap(frame, first);
      const rootControls = await controls(rootPanel(page));
      const rootActions = ((await first.getAttribute('data-pqr-root-actions')) ?? '').split(/\s+/).filter(Boolean).sort();
      receipt.constateSi('panneau racine — inventaire strict et actions déclarées',
        JSON.stringify(rootControls) === JSON.stringify([...fixture.rootControls].sort()) &&
          JSON.stringify(rootActions) === JSON.stringify([...fixture.rootActions].sort()),
        `${fixture.rootControls.join(', ')} · ${fixture.rootActions.join(', ')}`,
        `${rootControls.join(', ')} · ${rootActions.join(', ')}`);

      const firstRow = first.locator(ROW).first();
      await firstRow.click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(250);
      const rowControls = await controls(rowPanel(page));
      receipt.constateSi('panneau rangée — inventaire strict',
        JSON.stringify(rowControls) === JSON.stringify([...fixture.rowControls].sort()),
        fixture.rowControls.join(', '), rowControls.join(', '));

      // Édition réelle du titre (clic + frappe — l'insertion se fait au point
      // de clic, comportement contenteditable ; End ne navigue pas dans
      // l'éditeur Odoo, mesuré au spike) puis de la réponse (rangée ouverte).
      const titreAvant = ((await firstRow.locator('[data-pqr-part="titre"]').textContent()) ?? '').trim();
      await firstRow.locator('[data-pqr-part="titre"]').click({ timeout: 5000 });
      await frame.page().keyboard.type(' QA');
      await rowPanel(page).locator('[data-pqr-control="faq-row-etat"] input[type="checkbox"]').click();
      await page.waitForTimeout(250);
      await firstRow.locator('[data-pqr-part="contenu"]').fill('Réponse QA finale');
      const titreApres = ((await firstRow.locator('[data-pqr-part="titre"]').textContent()) ?? '').trim();
      receipt.constateSi('édition — titre par frappe réelle, réponse dans la rangée ouverte',
        titreApres.includes('QA') && titreApres.length > titreAvant.length &&
          ((await firstRow.locator('[data-pqr-part="contenu"]').textContent()) ?? '').trim() === 'Réponse QA finale',
        'frappe QA insérée dans le titre · contenu « Réponse QA finale »',
        `titre=« ${titreApres} » · contenu=« ${(await firstRow.locator('[data-pqr-part="contenu"]').textContent())?.trim()} »`);
      // La rangée éditée reste OUVERTE pour le save : l'état affiché est sauvegardé.

      // Cardinalités : 3→1→0, puis le blueprint recrée depuis zéro.
      for (let i = 0; i < 2; i++) {
        const lastRow = first.locator(ROW).last();
        await lastRow.click({ position: { x: 8, y: 8 } });
        await page.waitForTimeout(150);
        await rowPanel(page).getByRole('button', { name: 'Supprimer la question' }).click();
        await page.waitForTimeout(200);
      }
      receipt.constateSi('repeat — cardinalité 1 sans fuite',
        await first.locator(ROW).count() === 1 && await second.locator(ROW).count() === 3,
        'A=1, B=3', `A=${await first.locator(ROW).count()} · B=${await second.locator(ROW).count()}`);

      await first.locator(ROW).first().click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(150);
      await rowPanel(page).getByRole('button', { name: 'Supprimer la question' }).click();
      await page.waitForTimeout(200);
      receipt.constateSi('repeat — cardinalité 0 sans fuite',
        await first.locator(ROW).count() === 0 && await second.locator(ROW).count() === 3,
        'A=0, B=3', `A=${await first.locator(ROW).count()} · B=${await second.locator(ROW).count()}`);

      await selectRootGap(frame, first);
      await rootPanel(page).getByRole('button', { name: 'Ajouter une question' }).click();
      await page.waitForTimeout(200);
      receipt.constateSi('repeat — le blueprint recrée une question depuis zéro',
        await first.locator(ROW).count() === 1 && await second.locator(ROW).count() === 3,
        'A=1, B=3', `A=${await first.locator(ROW).count()} · B=${await second.locator(ROW).count()}`);

      // B1 : édition + ouverture pour le save (persistance de l'état ouvert).
      const b1 = second.locator(ROW).first();
      await b1.click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(200);
      await rowPanel(page).locator('[data-pqr-control="faq-row-etat"] input[type="checkbox"]').click();
      await page.waitForTimeout(200);
      await b1.locator('[data-pqr-part="contenu"]').fill('Réponse B1 sauvegardée ouverte');

      const save = page.locator('.o-snippets-top-actions button[data-action="save"]').first();
      const responsePromise = page.waitForResponse((response) => response.url().includes('/web/dataset/call_kw/ir.ui.view/save'), { timeout: 30_000 }).catch(() => null);
      await save.click();
      const response = await responsePromise;
      receipt.constateSi('save — Odoo persiste les deux FAQ', response !== null && response.ok(), 'RPC save 2xx', response ? `HTTP ${response.status()}` : 'aucun RPC');
    } finally {
      await editor.context.close();
    }

    // ── Public : DOM sauvegardé, bascule réelle, sécurité.
    const publicSession = await ouvrirSessionPublique(browser);
    try {
      const page = await publicSession.context.newPage();
      const response = await page.goto(`${baseUrl(env)}${HARNESS_PATH}`, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
      await page.waitForTimeout(1200);
      const saved = await publicState(page);
      receipt.constateSi('public — A=1 blueprint fermée, B=3 avec B1 sauvegardée ouverte',
        response?.status() === 200 && saved.length === 2 && saved[0].rows.length === 1 && !saved[0].rows[0].open &&
          saved[1].rows.length === 3 && saved[1].rows[0].open,
        'HTTP 200 · A=1 fermée · B=3, B1 ouverte',
        JSON.stringify(saved.map((root) => ({ rows: root.rows.map((r) => ({ open: r.open })) }))));

      const b1 = page.locator(ROOT).nth(1).locator(ROW).first();
      await b1.locator('[data-pqr-part="trigger"]').click();
      await page.waitForTimeout(200);
      const b1Closed = await b1.evaluate((el) => !el.classList.contains('accordion-row--etat-ouvert'));
      const safety = await page.evaluate(() => {
        const roots = [...document.querySelectorAll('.s_pqr_faq')];
        const handlers = roots.flatMap((root) => [...root.querySelectorAll('*')]
          .flatMap((el) => [...el.attributes].filter((attr) => /^on/i.test(attr.name)).map((attr) => `${el.tagName}[${attr.name}]`)));
        const executableUrls = roots.flatMap((root) => [...root.querySelectorAll('[href], [src]')]
          .map((el) => el.getAttribute('href') ?? el.getAttribute('src') ?? '')
          .filter((url) => /^\s*(javascript|data|vbscript):/i.test(url)));
        return { handlers, executableUrls };
      });
      receipt.constateSi('public — bascule réelle sur le HTML sauvegardé, zéro handler inline',
        b1Closed && safety.handlers.length === 0 && safety.executableUrls.length === 0,
        'B1 se referme au clic · 0 handler · 0 URL exécutable',
        `b1Fermée=${b1Closed} · ${JSON.stringify(safety)}`);

      const piquerayErrors = publicSession.journal.console.filter((line) => /piqueray|faq/i.test(line));
      receipt.constateSi('public — aucune erreur console imputable à piqueray_ds',
        piquerayErrors.length === 0, '0 erreur', piquerayErrors.join(' | ') || '0 erreur');
    } finally {
      await publicSession.context.close();
    }

    // ── Reopen : le DOM sauvegardé se relit sans état parallèle.
    const reopened = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await reopened.context.newPage();
      const frame = await enterEditor(page, env);
      const state = frame ? await frame.locator(ROOT).evaluateAll((roots: Element[]) => roots.map((root) => ({
        count: root.querySelectorAll('[data-pqr-faq-row]').length,
        b1open: root.querySelector('[data-pqr-faq-row]')?.classList.contains('accordion-row--etat-ouvert') ?? null,
        contenu: root.querySelector('[data-pqr-faq-row] [data-pqr-part="contenu"]')?.textContent?.trim() ?? '',
      }))) : [];
      receipt.constateSi('reopen — A=1, B=3 avec B1 ouverte et sa réponse, sans état parallèle',
        state.length === 2 && state[0].count === 1 && state[1].count === 3 && state[1].b1open === true &&
          state[1].contenu === 'Réponse B1 sauvegardée ouverte',
        'A=1 · B=3, B1 ouverte, réponse intacte', JSON.stringify(state));
    } finally {
      await reopened.context.close();
    }
  });

  const done = receipt.ecrire('faq-functional.json', Date.now() - started);
  process.exit(done.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => { console.error(`✖ ${error instanceof Error ? error.message : String(error)}`); process.exit(1); });
}
