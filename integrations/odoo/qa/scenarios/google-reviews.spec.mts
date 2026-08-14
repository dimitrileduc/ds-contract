/**
 * Scénario fonctionnel Google Reviews — écrit avant les templates et les actions
 * (T022). Il refuse une page sans deux racines, le sample contractuel ou la
 * collection réelle; les interactions détaillées sont activées dès T029–T031.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Frame, Page } from 'playwright-core';
import { Recueil, PROOFS } from '../lib/receipt.mts';
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

export const SCENARIO_ID = 'google-reviews-functional';
export const SNAPSHOT_ID = 'odoo-019-foundation';
export const HARNESS_PATH = '/piqueray-harness/google-reviews';
export const VISUAL_HARNESS_PATH = '/piqueray-harness/google-reviews-visual';
export const ROOT = '.s_pqr_google_reviews';
export const CARD = '[data-pqr-review-card]';

export interface ReviewState {
  instance: string;
  count: number;
  cards: Array<{ marker: string | null; author: string; text: string; photo: boolean; initial: boolean }>;
}

export async function readReviewState(page: { locator: (selector: string) => any }): Promise<ReviewState[]> {
  const roots = page.locator(ROOT);
  const result: ReviewState[] = [];
  for (let index = 0; index < await roots.count(); index += 1) {
    const root = roots.nth(index);
    const cards = root.locator(CARD);
    const values: ReviewState['cards'] = [];
    for (let cardIndex = 0; cardIndex < await cards.count(); cardIndex += 1) {
      const card = cards.nth(cardIndex);
      values.push({
        marker: await card.getAttribute('data-pqr-review-marker'),
        author: ((await card.locator('[data-pqr-part="auteur"]').textContent()) ?? '').trim(),
        text: ((await card.locator('[data-pqr-part="temoignage"]').textContent()) ?? '').trim(),
        photo: await card.evaluate((node: Element) => {
          const photo = node.querySelector('[data-pqr-part="avatar-photo"]') as HTMLElement | null;
          const image = photo?.querySelector('img') as HTMLImageElement | null;
          const source = image?.getAttribute('src')?.trim() ?? '';
          const alt = image?.getAttribute('alt')?.trim() ?? '';
          return Boolean(photo && !photo.hidden && image && source && alt);
        }),
        initial: (await card.locator('[data-pqr-part="avatar-initiale"]').count()) === 1,
      });
    }
    result.push({
      instance: (await root.getAttribute('data-pqr-instance')) ?? `instance-${index + 1}`,
      count: values.length,
      cards: values,
    });
  }
  return result;
}

/** La page se trouve dans l'iframe de prévisualisation : le chrome n'est jamais
 * un substitut pour son DOM. Cette entrée est volontairement locale au scénario
 * afin que son sélecteur reste Google Reviews, plutôt que le banc Phase 2. */
async function enterEditor(page: Page, env: QaEnv): Promise<Frame | null> {
  await page.goto(
    `${baseUrl(env)}/odoo/action-website.website_preview?path=${encodeURIComponent(HARNESS_PATH)}&enable_editor=1`,
    { waitUntil: 'domcontentloaded', timeout: EDITOR_TIMEOUT_MS },
  );
  const deadline = Date.now() + EDITOR_TIMEOUT_MS;
  while (Date.now() < deadline) {
    for (const frame of page.frames()) {
      // Le chrome de l'éditeur contient aussi des contenteditables et le
      // catalogue de snippets. Seul l'iframe qui sert CETTE page porte le DOM
      // sauvegardable à qualifier.
      if (!frame.url().includes(HARNESS_PATH)) continue;
      const chromeOpen = await page.locator('body.o_builder_open').count();
      const editableCount = await frame.locator('[contenteditable="true"]').count().catch(() => 0);
      if (chromeOpen > 0 && editableCount > 0) {
        return frame;
      }
    }
    await page.waitForTimeout(500);
  }
  return null;
}

async function select(frame: Frame, selector: string): Promise<void> {
  // Odoo ne met à jour ses conteneurs d'options que sur un vrai geste pointeur;
  // HTMLElement.click() insère bien un événement mais ne passe pas ce chemin.
  await frame.locator(selector).first().click({ position: { x: 8, y: 8 } });
  await frame.page().waitForTimeout(150);
}

/** Insère la vraie entrée du catalogue Website, via son sélecteur natif et
 * non en clonant un DOM de fixture : c'est le chemin qui matérialise le QWeb
 * dans un #wrap que SavePlugin sait persister. */
async function insertGoogleReviews(page: Page): Promise<void> {
  const contentGroup = page.locator('.o_snippet_thumbnail')
    .filter({ has: page.locator('.o_snippet_thumbnail_title', { hasText: 'Content' }) })
    .first();
  await contentGroup.locator('button').click();
  const dialog = page.locator('.modal').last();
  await dialog.locator('input[type="search"]').fill('Google');
  await page.waitForTimeout(300);
  const chooser = await dialog.locator('iframe').contentFrame();
  if (!chooser) throw new Error('Le sélecteur natif de snippets ne contient pas son iframe de choix.');
  await chooser.locator('[aria-label="Piqueray · Google Reviews"]')
    .evaluate((element) => (element as HTMLElement).click());
  await page.waitForTimeout(350);
}

const rootPanel = (page: Page) => page.locator('.options-container')
  .filter({ has: page.locator('[data-pqr-control="review-collection"]') })
  .first();
const cardPanel = (page: Page) => page.locator('.options-container')
  .filter({ has: page.locator('[data-pqr-control="remove-review"]') })
  .first();

async function markers(root: any): Promise<string[]> {
  return root.locator(CARD).evaluateAll((cards: Element[]) => cards.map(
    (card) => card.getAttribute('data-pqr-review-marker') ?? '(sans marqueur)',
  ));
}

async function replaceText(target: any, value: string): Promise<void> {
  // `Locator.fill` gère explicitement les noeuds contenteditable. Les touches
  // Control+A sont ambiguës lorsque le navigateur est lancé sur macOS (elles
  // déplaçaient le curseur et concaténaient le texte de la blueprint) ; ici le
  // geste reste une vraie édition Odoo et émet l'évènement input qu'il sauve.
  await target.fill(value);
}

async function main() {
  const started = Date.now();
  const receipt = new Recueil(SCENARIO_ID, SNAPSHOT_ID, 'google_reviews_contract_sample');
  if (!dockerDisponible()) {
    receipt.saute('qualification Google Reviews sur Odoo', 'Docker indisponible', 'ODOO-LIMIT-NO-INSTANCE');
    receipt.ecrire('google-reviews-functional.json', Date.now() - started);
    process.exit(1);
  }

  await withInstance(async ({ browser, env }) => {
    const publicSession = await ouvrirSessionPublique(browser);
    try {
      const page = await publicSession.context.newPage();
      const response = await page.goto(`${baseUrl(env)}${HARNESS_PATH}`, {
        waitUntil: 'domcontentloaded',
        timeout: NAV_TIMEOUT_MS,
      });
      receipt.constate('la page de qualification Google Reviews est publique', 'HTTP 200', `HTTP ${response?.status() ?? '(aucune réponse)'}`);
      const states = await readReviewState(page);
      receipt.constateSi(
        'la page fonctionnelle démarre vide pour une insertion Website réelle',
        states.length === 0,
        '0 instance',
        `${states.length} instance(s)`,
      );
    } finally {
      await publicSession.context.close();
    }

    const publicVisual = await ouvrirSessionPublique(browser);
    try {
      const page = await publicVisual.context.newPage();
      const response = await page.goto(`${baseUrl(env)}${VISUAL_HARNESS_PATH}`, {
        waitUntil: 'domcontentloaded',
        timeout: NAV_TIMEOUT_MS,
      });
      const states = await readReviewState(page);
      receipt.constateSi(
        'le QWeb public rend le sample contractuel Google Reviews',
        response?.status() === 200 && states.length === 1 && states[0]?.count === 5 &&
          states[0].cards.every((card) => Boolean(card.marker) && Boolean(card.author) && Boolean(card.text)),
        'HTTP 200 · 1 × 5 cartes identifiées',
        states.flatMap((state) => state.cards).map((card) => `${card.marker ?? 'sans-id'}:${card.author || 'sans-auteur'}`).join(' · ') || 'aucune carte',
      );
    } finally {
      await publicVisual.context.close();
    }

    // La qualification ne s'arrête pas au sample : les gestes sont exercés dans
    // l'éditeur Odoo, sur l'instance A, pendant que B reste le témoin isolé.
    const editorSession = await ouvrirSessionEditeur(browser, env);
    try {
      const editorPage = await editorSession.context.newPage();
      const frame = await enterEditor(editorPage, env);
      if (!frame) {
        receipt.saute('gestes Google Reviews dans l’éditeur', 'frame de page ou chrome o_builder_open absent', 'ODOO-LIMIT-EDITOR-ENTRY');
        return;
      }
      const wrap = frame.locator('#wrap');
      receipt.constateSi(
        'la page de qualification expose un #wrap sauvegardable',
        await wrap.getAttribute('data-oe-model') === 'ir.ui.view' &&
          Boolean(await wrap.getAttribute('data-oe-id')) &&
          Boolean(await wrap.getAttribute('data-oe-xpath')),
        'data-oe-model/id/xpath sur #wrap',
        JSON.stringify({
          model: await wrap.getAttribute('data-oe-model'),
          id: await wrap.getAttribute('data-oe-id'),
          xpath: await wrap.getAttribute('data-oe-xpath'),
        }),
      );
      await insertGoogleReviews(editorPage);
      await insertGoogleReviews(editorPage);
      const roots = frame.locator(ROOT);
      const firstRoot = roots.first();
      const secondRoot = roots.nth(1);
      receipt.constateSi(
        'le catalogue Website insère deux instances Google Reviews indépendantes',
        await roots.count() === 2 && await firstRoot.locator(CARD).count() === 5 && await secondRoot.locator(CARD).count() === 5,
        'A=5 et B=5 cartes',
        `A=${await firstRoot.locator(CARD).count()} · B=${await secondRoot.locator(CARD).count()}`,
      );

      await select(frame, ROOT);
      const collectionPanel = rootPanel(editorPage);
      await collectionPanel.getByRole('button', { name: 'Ajouter un avis' }).click();
      await editorPage.waitForTimeout(150);
      receipt.constateSi(
        'ajout ciblé — A passe de 5 à 6 sans fuite vers B',
        await firstRoot.locator(CARD).count() === 6 && await secondRoot.locator(CARD).count() === 5,
        'A=6, B=5',
        `A=${await firstRoot.locator(CARD).count()} · B=${await secondRoot.locator(CARD).count()}`,
      );

      const addedMarker = (await markers(firstRoot)).at(-1) ?? '(absent)';
      // Les flèches owner-approved chevauchent volontairement 15 px du bord
      // des cartes extrêmes. Le geste QA cible l'intérieur de la carte, pas
      // la hitbox légitime du contrôle de carrousel.
      await firstRoot.locator(CARD).last().click({ position: { x: 40, y: 8 } });
      await editorPage.waitForTimeout(100);
      const currentCardPanel = cardPanel(editorPage);
      await currentCardPanel.getByRole('button', { name: 'Monter' }).click();
      await editorPage.waitForTimeout(150);
      const moved = await markers(firstRoot);
      receipt.constateSi(
        'réordre ciblé — la nouvelle carte remonte dans A seulement',
        moved.at(-2) === addedMarker && await secondRoot.locator(CARD).count() === 5,
        `marque ${addedMarker} en avant-dernière position de A; B=5`,
        `A=${moved.join(', ')} · B=${await secondRoot.locator(CARD).count()}`,
      );
      await currentCardPanel.getByRole('button', { name: 'Supprimer l’avis' }).click();
      await editorPage.waitForTimeout(150);
      receipt.constateSi(
        'suppression ciblée — A revient à 5 sans fuite vers B',
        await firstRoot.locator(CARD).count() === 5 && await secondRoot.locator(CARD).count() === 5,
        'A=5, B=5',
        `A=${await firstRoot.locator(CARD).count()} · B=${await secondRoot.locator(CARD).count()}`,
      );

      // La collection ne porte pas de cardinalité minimale : atteindre zéro
      // doit garder le panneau racine capable d'ajouter la première carte.
      while (await firstRoot.locator(CARD).count() > 0) {
        await firstRoot.locator(CARD).first().click({ position: { x: 40, y: 8 } });
        await editorPage.waitForTimeout(100);
        await cardPanel(editorPage).getByRole('button', { name: 'Supprimer l’avis' }).click();
        await editorPage.waitForTimeout(100);
      }
      receipt.constateSi(
        'collection vide — A accepte zéro carte sans toucher B',
        await firstRoot.locator(CARD).count() === 0 && await secondRoot.locator(CARD).count() === 5,
        'A=0, B=5',
        `A=${await firstRoot.locator(CARD).count()} · B=${await secondRoot.locator(CARD).count()}`,
      );
      await firstRoot.click({ position: { x: 8, y: 8 } });
      await editorPage.waitForTimeout(100);
      await rootPanel(editorPage).getByRole('button', { name: 'Ajouter un avis' }).click();
      await editorPage.waitForTimeout(150);
      receipt.constateSi(
        'collection vide — A recrée sa première carte',
        await firstRoot.locator(CARD).count() === 1 && await secondRoot.locator(CARD).count() === 5,
        'A=1, B=5',
        `A=${await firstRoot.locator(CARD).count()} · B=${await secondRoot.locator(CARD).count()}`,
      );

      const firstCard = firstRoot.locator(CARD).first();
      await replaceText(firstCard.locator('[data-pqr-part="auteur"]'), 'QA Alice');
      await replaceText(firstCard.locator('[data-pqr-part="temoignage"]'), 'Avis QA persistant');
      await firstCard.click({ position: { x: 40, y: 8 } });
      await editorPage.waitForTimeout(150);
      const activeCardPanel = cardPanel(editorPage);
      const initialToggle = activeCardPanel.locator('[data-action-param="initialeVisible"] input');
      const verifiedToggle = activeCardPanel.locator('[data-action-param="verifie"] input');
      const photoToggle = activeCardPanel.locator('[data-action-param="photo"] input');
      const initialWasVisible = await initialToggle.isChecked();
      const verifiedWasVisible = await verifiedToggle.isChecked();
      if (initialWasVisible) await initialToggle.click();
      if (verifiedWasVisible) await verifiedToggle.click();
      if (!(await photoToggle.isChecked())) await photoToggle.click();
      await editorPage.waitForTimeout(150);
      const incompleteAvatar = await firstCard.evaluate((card) => ({
        initiale: card.getAttribute('data-initiale-visible'),
        verifie: card.getAttribute('data-verifie'),
        photo: card.getAttribute('data-photo'),
        avatarHidden: (card.querySelector('[data-pqr-part="avatar-photo"]') as HTMLElement | null)?.hidden ?? true,
      }));
      receipt.constateSi(
        'booléens carte et photo incomplète restent locaux et sûrs',
        incompleteAvatar.initiale === 'false' && incompleteAvatar.verifie === 'false' &&
          incompleteAvatar.photo === 'false' && Boolean(incompleteAvatar.avatarHidden),
        'initiale=false, vérifié=false, photo incomplète repliée',
        JSON.stringify(incompleteAvatar),
      );

      // La surface média est réellement ouverte, mais limitée au seul onglet
      // Images : crop, filtre, lien, dimensions et format n'entrent pas ici.
      await activeCardPanel.getByRole('button', { name: 'Remplacer' }).click();
      await editorPage.waitForTimeout(250);
      const mediaDialog = editorPage.locator('.modal').last();
      const mediaTabs = await mediaDialog.locator('[role="tab"]').allTextContents();
      receipt.constateSi(
        'remplacement avatar — dialogue média limité aux images',
        await mediaDialog.count() === 1 && mediaTabs.length === 1 && mediaTabs[0]?.trim() === 'Images',
        'un dialogue, seul onglet Images',
        `${await mediaDialog.count()} dialogue · onglets=${mediaTabs.map((tab) => tab.trim()).join(', ') || '(aucun)'}`,
      );
      await mediaDialog.getByRole('button', { name: 'Discard' }).click().catch(async () => {
        await editorPage.keyboard.press('Escape');
      });

      const save = editorPage.locator('.o-snippets-top-actions button[data-action="save"]').first();
      if (!(await save.isVisible().catch(() => false))) {
        receipt.saute('sauvegarde Google Reviews', 'bouton Save absent du chrome engagé', 'ODOO-LIMIT-SAVE-BUTTON');
      } else {
        const saveResponse = editorPage.waitForResponse(
          (response) => response.url().includes('/web/dataset/call_kw/ir.ui.view/save'),
          { timeout: 30_000 },
        ).catch(() => null);
        await save.click();
        const response = await saveResponse;
        receipt.constateSi(
          'sauvegarde — Odoo persiste la vue Google Reviews',
          response !== null && response.ok(),
          'RPC ir.ui.view/save HTTP 2xx',
          response ? `HTTP ${response.status()}` : 'aucun RPC save observé',
        );
      }
    } finally {
      await editorSession.context.close();
    }

    const publicAfter = await ouvrirSessionPublique(browser);
    try {
      const page = await publicAfter.context.newPage();
      await page.goto(`${baseUrl(env)}${HARNESS_PATH}?pqr_qa=${Date.now()}`, {
        waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS,
      });
      const saved = await readReviewState(page);
      receipt.artefact(
        path.join(PROOFS, 'google-reviews-functional.dom-after-save.json'),
        Buffer.from(JSON.stringify(saved, null, 2) + '\n'),
        'json',
      );
      receipt.constateSi(
        'public anonyme — A sauvegarde la carte QA, B garde ses cinq samples',
        saved.length === 2 && saved[0]?.count === 1 && saved[0]?.cards[0]?.author === 'QA Alice' &&
          saved[0]?.cards[0]?.text === 'Avis QA persistant' && saved[1]?.count === 5,
        'A=1 avec contenu QA; B=5 samples',
        saved.map((state, index) => `#${index + 1}:${state.count}:${state.cards[0]?.author ?? '(vide)'}`).join(' · '),
      );
    } finally {
      await publicAfter.context.close();
    }

    const reopenSession = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await reopenSession.context.newPage();
      const frame = await enterEditor(page, env);
      const observed = frame ? await frame.locator(ROOT).first().evaluate((root) => ({
        cards: root.querySelectorAll('[data-pqr-review-card]').length,
        author: root.querySelector('[data-pqr-part="auteur"]')?.textContent?.trim() ?? null,
        text: root.querySelector('[data-pqr-part="temoignage"]')?.textContent?.trim() ?? null,
      })) : null;
      receipt.constateSi(
        'éditeur rouvert — A relit le DOM sauvegardé sans état parallèle',
        observed?.cards === 1 && observed.author === 'QA Alice' && observed.text === 'Avis QA persistant',
        '1 carte QA Alice / Avis QA persistant',
        observed ? JSON.stringify(observed) : 'frame absent',
      );
    } finally {
      await reopenSession.context.close();
    }
  });

  const done = receipt.ecrire('google-reviews-functional.json', Date.now() - started);
  process.exit(done.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(`✖ ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
}
