/**
 * Gestes d'éditeur partagés par les scénarios de sections (hero, presentation, …).
 *
 * `enterEditor` encode la course de disponibilité diagnostiquée le 2026-08-12 :
 * attendre LES DEUX conditions — le builder ouvert (`body.o_builder_open`) ET un
 * contenu éditable rendu dans l'iframe du harnais — jamais une seule. Ce module
 * est le foyer de cette attente ; une copie locale qui n'attend qu'une condition
 * ré-introduit la course.
 *
 * NOTE (2026-08-12) : dix scénarios plus anciens portent encore leur copie
 * locale de ces gestes ; `google-reviews.spec.mts` garde la sienne PAR DÉCISION
 * (docstring sur place — son entrée reste sélectionnée côté Google Reviews).
 */
import type { Frame, Locator, Page } from 'playwright-core';
import { EDITOR_TIMEOUT_MS, baseUrl, type QaEnv } from '../run.mts';

/** Ouvre l'éditeur Website sur `harnessPath` et rend l'iframe du harnais une
 * fois les deux conditions de disponibilité réunies ; `null` au délai. */
export async function enterEditor(page: Page, env: QaEnv, harnessPath: string): Promise<Frame | null> {
  await page.goto(`${baseUrl(env)}/odoo/action-website.website_preview?path=${encodeURIComponent(harnessPath)}&enable_editor=1`, {
    waitUntil: 'domcontentloaded', timeout: EDITOR_TIMEOUT_MS,
  });
  const deadline = Date.now() + EDITOR_TIMEOUT_MS;
  while (Date.now() < deadline) {
    for (const frame of page.frames()) {
      if (!frame.url().includes(harnessPath)) continue;
      if ((await page.locator('body.o_builder_open').count()) > 0 &&
        (await frame.locator('[contenteditable="true"]').count().catch(() => 0)) > 0) return frame;
    }
    await page.waitForTimeout(400);
  }
  return null;
}

/** Sélectionne une racine de section (coin haut-gauche) puis laisse le panneau
 * d'options se poser. Le délai reste celui du scénario appelant. */
export async function select(frame: Frame, root: Locator, settleMs = 400): Promise<void> {
  await root.click({ position: { x: 8, y: 8 } });
  await frame.page().waitForTimeout(settleMs);
}

/** Compte les nœuds réellement VISIBLES — `count()` seul compterait les
 * poignées natives présentes mais masquées. */
export async function visibleCount(page: Page, selector: string): Promise<number> {
  const nodes = page.locator(selector);
  let count = 0;
  for (let index = 0; index < await nodes.count(); index += 1) {
    if (await nodes.nth(index).isVisible().catch(() => false)) count += 1;
  }
  return count;
}
