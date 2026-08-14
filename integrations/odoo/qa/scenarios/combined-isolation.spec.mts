import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Frame, Page } from 'playwright-core';
import { PROOFS, Recueil } from '../lib/receipt.mts';
import { EDITOR_TIMEOUT_MS, NAV_TIMEOUT_MS, baseUrl, dockerDisponible, ouvrirSessionEditeur, ouvrirSessionPublique, withInstance, type QaEnv } from '../run.mts';

// Réutilise le banc vide déjà qualifié pour l'insertion catalogue. Le sujet du
// scénario est la coexistence 2×4, pas une route supplémentaire de production.
const PAGE_PATH = '/piqueray-harness/presentation';
async function insertSnippet(page: Page, search: string, label: string): Promise<void> {
  const content = page.locator('.o_snippet_thumbnail')
    .filter({ has: page.locator('.o_snippet_thumbnail_title', { hasText: 'Content' }) }).first();
  await content.locator('button').click();
  const dialog = page.locator('.modal').last();
  await dialog.locator('input[type="search"]').fill(search);
  await page.waitForTimeout(300);
  const chooser = await dialog.locator('iframe').contentFrame();
  if (!chooser) throw new Error('Iframe du catalogue Website absente.');
  await chooser.locator(`[aria-label="${label}"]`).click();
  await page.waitForTimeout(350);
}
async function enter(page: Page, env: QaEnv): Promise<Frame | null> {
  await page.goto(`${baseUrl(env)}/odoo/action-website.website_preview?path=${encodeURIComponent(PAGE_PATH)}&enable_editor=1`, { waitUntil: 'domcontentloaded', timeout: EDITOR_TIMEOUT_MS });
  const end = Date.now() + EDITOR_TIMEOUT_MS;
  while (Date.now() < end) {
    for (const frame of page.frames()) if (frame.url().includes(PAGE_PATH) && await page.locator('body.o_builder_open').count() && await frame.locator('[contenteditable="true"]').count().catch(() => 0) > 0) return frame;
    await page.waitForTimeout(400);
  }
  return null;
}
async function state(page: { locator: (s: string) => any }) {
  return {
    presentations: await page.locator('.s_pqr_presentation').evaluateAll((roots: Element[]) => roots.map((root) => ({ title: root.querySelector('[data-pqr-part="presentation-title"]')?.textContent?.trim(), cta: root.classList.contains('pqr-cta-on') }))),
    reviews: await page.locator('.s_pqr_google_reviews').evaluateAll((roots: Element[]) => roots.map((root) => ({ qualifier: root.querySelector('[data-pqr-part="qualificatif"]')?.textContent?.trim(), cards: root.querySelectorAll('[data-pqr-review-card]').length }))),
    heroes: await page.locator('.s_pqr_hero').evaluateAll((roots: Element[]) => roots.map((root) => ({ title: root.querySelector('[data-pqr-part="hero-title"]')?.textContent?.trim(), subtitle: root.querySelector('[data-pqr-part="hero-subtitle"]')?.textContent?.trim() }))),
    equipes: await page.locator('.s_pqr_equipe').evaluateAll((roots: Element[]) => roots.map((root) => ({ name: root.querySelector('[data-pqr-part="member-name"]')?.textContent?.trim(), members: root.querySelectorAll('[data-pqr-member-card]').length }))),
    devis: await page.locator('.s_pqr_devis').evaluateAll((roots: Element[]) => roots.map((root) => ({ title: root.querySelector('[data-pqr-part="devis-title"]')?.textContent?.trim(), fond: root.hasAttribute('data-fond') }))),
    sav: await page.locator('.s_pqr_sav').evaluateAll((roots: Element[]) => roots.map((root) => ({ title: root.querySelector('[data-pqr-part="sav-title"]')?.textContent?.trim(), br: root.querySelectorAll('[data-pqr-part="sav-text"] br').length }))),
  };
}
async function main() {
  const started = Date.now();
  const receipt = new Recueil('combined-isolation', 'odoo-019-foundation', 'two-by-four-sections');
  if (!dockerDisponible()) { receipt.saute('page combinée', 'Docker indisponible', 'ODOO-LIMIT-NO-INSTANCE'); receipt.ecrire('combined-isolation.json', Date.now() - started); process.exit(1); }
  await withInstance(async ({ browser, env }) => {
    const editor = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await editor.context.newPage();
      const frame = await enter(page, env);
      if (!frame) { receipt.saute('éditeur combiné', 'frame éditable absente', 'ODOO-LIMIT-EDITOR-ENTRY'); return; }
      if (await frame.locator('.s_pqr_presentation, .s_pqr_google_reviews, .s_pqr_hero, .s_pqr_equipe, .s_pqr_devis, .s_pqr_sav').count() === 0) {
        await insertSnippet(page, 'Présentation', 'Piqueray · Présentation');
        await insertSnippet(page, 'Google Reviews', 'Piqueray · Google Reviews');
        await insertSnippet(page, 'Équipe', 'Piqueray · Équipe');
        await insertSnippet(page, 'Équipe', 'Piqueray · Équipe');
        await insertSnippet(page, 'Hero', 'Piqueray · Hero');
        await insertSnippet(page, 'Hero', 'Piqueray · Hero');
        await insertSnippet(page, 'Présentation', 'Piqueray · Présentation');
        await insertSnippet(page, 'Google Reviews', 'Piqueray · Google Reviews');
        await insertSnippet(page, 'Devis', 'Piqueray · Devis');
        await insertSnippet(page, 'Devis', 'Piqueray · Devis');
        await insertSnippet(page, 'SAV', 'Piqueray · SAV');
        await insertSnippet(page, 'SAV', 'Piqueray · SAV');
      }
      const presentations = frame.locator('.s_pqr_presentation');
      const reviews = frame.locator('.s_pqr_google_reviews');
      const heroes = frame.locator('.s_pqr_hero');
      const equipes = frame.locator('.s_pqr_equipe');
      const devis = frame.locator('.s_pqr_devis');
      const sav = frame.locator('.s_pqr_sav');
      const counts = await Promise.all([presentations.count(), reviews.count(), heroes.count(), equipes.count(), devis.count(), sav.count()]);
      receipt.constateSi('page combinée — deux instances de chaque section', counts.every((count) => count === 2), '2 Presentation + 2 GoogleReviews + 2 Hero + 2 Équipe + 2 Devis + 2 SAV', counts.join(' + '));
      await presentations.nth(0).locator('[data-pqr-part="presentation-title"]').fill('Combiné Présentation A');
      await presentations.nth(1).locator('[data-pqr-part="presentation-title"]').fill('Combiné Présentation B');
      await presentations.nth(1).click({ position: { x: 8, y: 8 } }); await page.waitForTimeout(300);
      const pPanel = page.locator('.options-container:visible').filter({ has: page.locator('[data-pqr-control="show-cta"]') }).first();
      const toggle = pPanel.locator('[data-pqr-control="show-cta"] input');
      if (await toggle.isChecked()) await toggle.click();
      await reviews.nth(0).locator('[data-pqr-part="qualificatif"]').fill('Avis combinés A');
      await reviews.nth(1).locator('[data-pqr-part="qualificatif"]').fill('Avis combinés B');
      await heroes.nth(0).locator('[data-pqr-part="hero-title"]').fill('Combiné Hero A');
      await heroes.nth(1).locator('[data-pqr-part="hero-title"]').fill('Combiné Hero B');
      await equipes.nth(0).locator('[data-pqr-part="member-name"]').first().fill('Combiné Équipe A');
      await equipes.nth(1).locator('[data-pqr-part="member-name"]').first().fill('Combiné Équipe B');
      await devis.nth(0).locator('[data-pqr-part="devis-title"]').fill('Combiné Devis A');
      await devis.nth(1).locator('[data-pqr-part="devis-title"]').fill('Combiné Devis B');
      await sav.nth(0).locator('[data-pqr-part="sav-title"]').fill('Combiné SAV A');
      await sav.nth(1).locator('[data-pqr-part="sav-title"]').fill('Combiné SAV B');
      const edited = await state(frame);
      receipt.constateSi('édition — valeurs opposées sans fuite inter-section', edited.presentations[0].title === 'Combiné Présentation A' && edited.presentations[0].cta && edited.presentations[1].title === 'Combiné Présentation B' && !edited.presentations[1].cta && edited.reviews[0].qualifier === 'Avis combinés A' && edited.reviews[1].qualifier === 'Avis combinés B' && edited.reviews.every((item: any) => item.cards === 5) && edited.heroes[0].title === 'Combiné Hero A' && edited.heroes[1].title === 'Combiné Hero B' && edited.equipes[0].name === 'Combiné Équipe A' && edited.equipes[1].name === 'Combiné Équipe B' && edited.equipes.every((item: any) => item.members === 16) && edited.devis[0].title === 'Combiné Devis A' && edited.devis[1].title === 'Combiné Devis B' && edited.devis.every((item: any) => item.fond) && edited.sav[0].title === 'Combiné SAV A' && edited.sav[1].title === 'Combiné SAV B' && edited.sav.every((item: any) => item.br === 1), '12 valeurs distinctes, CTA opposés, collections et <br> intacts', JSON.stringify(edited));
      const save = page.locator('.o-snippets-top-actions button[data-action="save"]').first();
      const rpc = page.waitForResponse((response) => response.url().includes('/web/dataset/call_kw/ir.ui.view/save'), { timeout: 30_000 }).catch(() => null);
      await save.click(); const response = await rpc;
      receipt.constateSi('save combiné — vue persistée', Boolean(response?.ok()), 'RPC 2xx', response ? `HTTP ${response.status()}` : 'aucun RPC');
    } finally { await editor.context.close(); }
    const publicSession = await ouvrirSessionPublique(browser);
    try {
      const page = await publicSession.context.newPage(); const response = await page.goto(`${baseUrl(env)}${PAGE_PATH}?qa=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
      const observed = await state(page); receipt.artefact(path.join(PROOFS, 'combined-isolation.public.json'), Buffer.from(JSON.stringify({ status: response?.status(), observed }, null, 2) + '\n'), 'json');
      receipt.constateSi('public — huit instances persistées sans fuite', response?.status() === 200 && observed.presentations[0].title === 'Combiné Présentation A' && observed.presentations[1].title === 'Combiné Présentation B' && observed.reviews[0].qualifier === 'Avis combinés A' && observed.reviews[1].qualifier === 'Avis combinés B' && observed.heroes[0].title === 'Combiné Hero A' && observed.heroes[1].title === 'Combiné Hero B' && observed.equipes[0].name === 'Combiné Équipe A' && observed.equipes[1].name === 'Combiné Équipe B' && observed.devis[0].title === 'Combiné Devis A' && observed.devis[1].title === 'Combiné Devis B' && observed.sav[0].title === 'Combiné SAV A' && observed.sav[1].title === 'Combiné SAV B', 'HTTP 200 et valeurs A/B distinctes sur six sections', JSON.stringify(observed));
    } finally { await publicSession.context.close(); }
    const reopened = await ouvrirSessionEditeur(browser, env);
    try { const page = await reopened.context.newPage(); const frame = await enter(page, env); const observed = frame ? await state(frame) : null; receipt.constateSi('éditeur rouvert — état combiné relu', observed?.presentations[1]?.cta === false && observed?.reviews[1]?.qualifier === 'Avis combinés B' && observed?.heroes[1]?.title === 'Combiné Hero B' && observed?.equipes[1]?.name === 'Combiné Équipe B' && observed?.devis[1]?.title === 'Combiné Devis B' && observed?.sav[1]?.title === 'Combiné SAV B', 'CTA B masqué, avis B, Hero B, Équipe B, Devis B et SAV B distincts', JSON.stringify(observed)); } finally { await reopened.context.close(); }
  });
  const done = receipt.ecrire('combined-isolation.json', Date.now() - started); process.exit(done.status === 'pass' ? 0 : 1);
}
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main().catch((error) => { console.error(`✖ ${String(error)}`); process.exit(1); });
