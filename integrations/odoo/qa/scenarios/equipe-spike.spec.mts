import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Frame, Page } from 'playwright-core';
import { Recueil } from '../lib/receipt.mts';
import {
  EDITOR_TIMEOUT_MS,
  baseUrl,
  dockerDisponible,
  ouvrirSessionEditeur,
  withInstance,
  type QaEnv,
} from '../run.mts';

const ROOT = '.s_pqr_equipe';
const CARD = '[data-pqr-member-card]';
const HARNESS_PATH = '/piqueray-harness/equipe';

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

async function insertEquipe(page: Page): Promise<void> {
  const content = page.locator('.o_snippet_thumbnail')
    .filter({ has: page.locator('.o_snippet_thumbnail_title', { hasText: 'Content' }) }).first();
  await content.locator('button').click();
  const dialog = page.locator('.modal').last();
  await dialog.locator('input[type="search"]').fill('Équipe');
  await page.waitForTimeout(300);
  const chooser = await dialog.locator('iframe').contentFrame();
  if (!chooser) throw new Error('Iframe du catalogue Website absente.');
  await chooser.locator('[aria-label="Piqueray · Équipe"]').click();
  await page.waitForTimeout(400);
}

const rootPanel = (page: Page) => page.locator('.options-container:visible')
  .filter({ has: page.locator('[data-pqr-control="member-collection"]') }).first();
const cardPanel = (page: Page) => page.locator('.options-container:visible')
  .filter({ has: page.locator('[data-pqr-control="member-remove"]') }).first();

async function selectRootGap(frame: Frame, root: any): Promise<void> {
  const box = await root.boundingBox();
  if (!box) throw new Error('Racine Équipe sans boîte sélectionnable.');
  const x = Math.min(Math.max(box.width / 4, 8), box.width - 8);
  await root.click({ position: { x, y: Math.min(8, Math.max(1, box.height - 1)) } });
  await frame.page().waitForTimeout(250);
}

async function main() {
  const started = Date.now();
  const receipt = new Recueil('equipe-mechanism-spike', 'odoo-019-foundation', 'equipe-contract-sample');
  if (!dockerDisponible()) {
    receipt.saute('spike Équipe sur Odoo', 'Docker indisponible', 'ODOO-LIMIT-NO-INSTANCE');
    receipt.ecrire('equipe-mechanism-spike.json', Date.now() - started);
    process.exit(1);
  }

  await withInstance(async ({ browser, env }) => {
    const editor = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await editor.context.newPage();
      const frame = await enterEditor(page, env);
      if (!frame) {
        receipt.saute('éditeur Équipe', 'iframe de page ou builder absent', 'ODOO-LIMIT-EDITOR-ENTRY');
        return;
      }
      await insertEquipe(page);
      await insertEquipe(page);
      const roots = frame.locator(ROOT);
      const first = roots.first();
      const second = roots.nth(1);
      receipt.constateSi('catalogue — deux Équipes rendent leur sample', await roots.count() === 2 && await first.locator(CARD).count() === 16 && await second.locator(CARD).count() === 16, 'A=16, B=16', `racines=${await roots.count()} · A=${await first.locator(CARD).count()} · B=${await second.locator(CARD).count()}`);

      const firstCard = first.locator(CARD).first();
      await firstCard.click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(250);
      const boundary = await firstCard.evaluate((card) => ({
        cardEditable: (card as HTMLElement).isContentEditable,
        pictureEditable: (card.querySelector('[data-pqr-part="member-picture-root"]') as HTMLElement | null)?.isContentEditable ?? null,
        nameEditable: (card.querySelector('[data-pqr-part="member-name"]') as HTMLElement | null)?.isContentEditable ?? null,
        roleEditable: (card.querySelector('[data-pqr-part="member-role"]') as HTMLElement | null)?.isContentEditable ?? null,
      }));
      receipt.constateSi('frontière — textes ouverts, carte et média fermés', !boundary.cardEditable && boundary.pictureEditable === false && boundary.nameEditable === true && boundary.roleEditable === true, 'carte=false, média=false, nom=true, poste=true', JSON.stringify(boundary));

      await firstCard.locator('[data-pqr-part="member-name"]').fill('Membre spike A');
      await firstCard.locator('[data-pqr-part="member-role"]').fill('Rôle spike A');
      receipt.constateSi('édition directe — les deux textes nommés acceptent une frappe réelle', (await firstCard.locator('[data-pqr-part="member-name"]').textContent())?.trim() === 'Membre spike A' && (await firstCard.locator('[data-pqr-part="member-role"]').textContent())?.trim() === 'Rôle spike A', 'Membre spike A / Rôle spike A', `${await firstCard.locator('[data-pqr-part="member-name"]').textContent()} / ${await firstCard.locator('[data-pqr-part="member-role"]').textContent()}`);

      await selectRootGap(frame, first);
      await rootPanel(page).getByRole('button', { name: 'Ajouter un membre' }).click();
      await page.waitForTimeout(200);
      receipt.constateSi('repeat — ajout ciblé sans fuite', await first.locator(CARD).count() === 17 && await second.locator(CARD).count() === 16, 'A=17, B=16', `A=${await first.locator(CARD).count()} · B=${await second.locator(CARD).count()}`);

      const added = first.locator(CARD).last();
      const marker = await added.getAttribute('data-pqr-member-marker');
      await added.click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(200);
      await cardPanel(page).getByRole('button', { name: 'Monter' }).click();
      await page.waitForTimeout(200);
      const markers = await first.locator(CARD).evaluateAll((cards: Element[]) => cards.map((card) => card.getAttribute('data-pqr-member-marker')));
      receipt.constateSi('repeat — réordre ciblé', markers.at(-2) === marker && await second.locator(CARD).count() === 16, `${marker} en avant-dernière position de A`, markers.join(', '));

      const moved = first.locator(`${CARD}[data-pqr-member-marker="${marker}"]`);
      await moved.click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(150);
      await cardPanel(page).getByRole('button', { name: 'Supprimer le membre' }).click();
      await page.waitForTimeout(200);
      receipt.constateSi('repeat — suppression ciblée', await first.locator(CARD).count() === 16 && await second.locator(CARD).count() === 16, 'A=16, B=16', `A=${await first.locator(CARD).count()} · B=${await second.locator(CARD).count()}`);

      const save = page.locator('.o-snippets-top-actions button[data-action="save"]').first();
      const responsePromise = page.waitForResponse((response) => response.url().includes('/web/dataset/call_kw/ir.ui.view/save'), { timeout: 30_000 }).catch(() => null);
      await save.click();
      const response = await responsePromise;
      receipt.constateSi('save — le DOM Équipe est persisté', response !== null && response.ok(), 'RPC save 2xx', response ? `HTTP ${response.status()}` : 'aucun RPC');
    } finally {
      await editor.context.close();
    }

    const reopened = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await reopened.context.newPage();
      const frame = await enterEditor(page, env);
      const state = frame ? await frame.locator(ROOT).evaluateAll((roots: Element[]) => roots.map((root) => ({
        count: root.querySelectorAll('[data-pqr-member-card]').length,
        name: root.querySelector('[data-pqr-part="member-name"]')?.textContent?.trim() ?? '',
        role: root.querySelector('[data-pqr-part="member-role"]')?.textContent?.trim() ?? '',
      }))) : [];
      receipt.constateSi('reopen — deux instances et les textes survivent sans état parallèle', state.length === 2 && state[0].count === 16 && state[0].name === 'Membre spike A' && state[0].role === 'Rôle spike A' && state[1].count === 16, 'A=16 éditée, B=16 intacte', JSON.stringify(state));
    } finally {
      await reopened.context.close();
    }
  });

  const done = receipt.ecrire('equipe-mechanism-spike.json', Date.now() - started);
  process.exit(done.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => { console.error(`✖ ${error instanceof Error ? error.message : String(error)}`); process.exit(1); });
}
