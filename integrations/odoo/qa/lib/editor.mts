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

/** Édition HUMAINE d'un îlot gouverné : vrai clic souris puis frappe — jamais
 * `fill()`, qui focalise par programme et masque un ancêtre focusable volant le
 * focus au libellé (mesuré le 2026-08-18 sur le CTA du Hero, sur `<button>`
 * PUIS sur `<a href>`). `locator.click()` EST ce geste réel : il attend
 * l'actionnabilité, défile jusqu'au nœud, puis clique en son centre — un
 * `boundingBox()` lu à l'avance perdrait ces deux garanties et cliquerait des
 * coordonnées périmées dès que la cible est sous la ligne de flottaison. Même
 * idiome que l'édition de titre de la FAQ (`faq.spec.mts`).
 *
 * Rend le texte observé après frappe, ou `null` si la cible n'est pas
 * cliquable — pour que l'appelant en fasse un constat plutôt qu'une exception. */
export async function frapperAuClicHumain(cible: Locator, texte: string, settleMs = 400): Promise<string | null> {
  const page = cible.page();
  try {
    await cible.click({ timeout: 5000 });
  } catch {
    return null;
  }
  await page.waitForTimeout(settleMs);
  await page.keyboard.type(texte);
  await page.waitForTimeout(200);
  return ((await cible.textContent()) ?? '').trim();
}

/** Pose une valeur dans un `BuilderUrlPicker` et rend le `href` réellement
 * obtenu sur l'ancre visée. Le picker ouvre un menu de suggestions qui CONSOMME
 * Enter : Échap le ferme, Tab committe la valeur tapée par le blur. Séquence
 * non évidente et porteuse — elle a donc un seul foyer, comme l'attente
 * d'`enterEditor` : une copie locale la fera dériver au prochain changement
 * Odoo du picker. */
export async function poserHref(champ: Locator, ancre: Locator, valeur: string, settleMs = 300): Promise<string | null> {
  const page = champ.page();
  await champ.click();
  await champ.fill(valeur);
  await page.keyboard.press('Escape');
  await champ.press('Tab');
  await page.waitForTimeout(settleMs);
  return ancre.getAttribute('href');
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
