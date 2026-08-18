/**
 * Qualification hostile Google Reviews — T023/T024/T036.
 *
 * Le scénario passe par le catalogue Website et le rédacteur Website standard.
 * Il ne « prouve » donc pas le panneau ou la garde en lisant les fichiers : les
 * contrôles, l'upload, le save et la relecture publique sont observés sur une
 * base Odoo neuve.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Frame, Page } from 'playwright-core';
import { PROOFS, REPO, Recueil } from '../lib/receipt.mts';
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

const ROOT = '.s_pqr_google_reviews';
const CARD = '[data-pqr-review-card]';
const HARNESS_PATH = '/piqueray-harness/google-reviews';
const panelFixture = JSON.parse(readFileSync(path.join(REPO, 'integrations/odoo/qa/fixtures/google-reviews-panel.json'), 'utf8'));
const hostileFixture = JSON.parse(readFileSync(path.join(REPO, 'integrations/odoo/qa/fixtures/google-reviews-hostile.json'), 'utf8'));
const UPLOAD_IMAGE = path.join(REPO, 'site/docs-shots/home-light.png');

async function enterEditor(page: Page, env: QaEnv): Promise<Frame | null> {
  await page.goto(
    `${baseUrl(env)}/odoo/action-website.website_preview?path=${encodeURIComponent(HARNESS_PATH)}&enable_editor=1`,
    { waitUntil: 'domcontentloaded', timeout: EDITOR_TIMEOUT_MS },
  );
  const deadline = Date.now() + EDITOR_TIMEOUT_MS;
  while (Date.now() < deadline) {
    for (const frame of page.frames()) {
      // Le chrome contient des surfaces contenteditable et une copie de
      // catalogue : elles ne sont pas la page sauvegardable. Qualifier l'URL
      // de l'iframe évite de mesurer ce faux positif.
      if (!frame.url().includes(HARNESS_PATH)) continue;
      const editable = await frame.locator('[contenteditable="true"]').count().catch(() => 0);
      if ((await page.locator('body.o_builder_open').count()) > 0 && editable > 0) return frame;
    }
    await page.waitForTimeout(400);
  }
  return null;
}

async function selectInFrame(frame: Frame, selector: string): Promise<void> {
  await frame.locator(selector).first().click({ position: { x: 8, y: 8 } });
  await frame.page().waitForTimeout(500);
}

async function insertGoogleReviews(page: Page): Promise<void> {
  const contentGroup = page.locator('.o_snippet_thumbnail')
    .filter({ has: page.locator('.o_snippet_thumbnail_title', { hasText: 'Content' }) })
    .first();
  await contentGroup.locator('button').click();
  const dialog = page.locator('.modal').last();
  await dialog.locator('input[type="search"]').fill('Google');
  await page.waitForTimeout(300);
  const chooser = await dialog.locator('iframe').contentFrame();
  if (!chooser) throw new Error('Le catalogue Website ne contient pas le frame de choix.');
  await chooser.locator('[aria-label="Piqueray · Google Reviews"]')
    .evaluate((element) => (element as HTMLElement).click());
  await page.waitForTimeout(400);
}

// Odoo conserve les anciens conteneurs de panneau dans le chrome pendant une
// transition. La sonde doit lire celui qui est visible, pas le premier noeud
// historique portant le même template.
const rootPanel = (page: Page) => page.locator('.options-container:visible')
  .filter({ has: page.locator('[data-pqr-control="review-collection"]') })
  .first();
const cardPanel = (page: Page) => page.locator('.options-container:visible')
  .filter({ has: page.locator('[data-pqr-control="remove-review"]') })
  .first();

async function controlInventory(panel: any): Promise<string[]> {
  return panel.locator('[data-pqr-control]').evaluateAll((nodes: Element[]) =>
    [...new Set(nodes.map((node) => node.getAttribute('data-pqr-control')).filter(Boolean))].sort(),
  );
}

async function visibleCount(page: Page, selector: string): Promise<number> {
  const candidates = page.locator(selector);
  let count = 0;
  for (let index = 0; index < await candidates.count(); index += 1) {
    if (await candidates.nth(index).isVisible().catch(() => false)) count += 1;
  }
  return count;
}

async function avatarState(card: any) {
  return card.evaluate((node: Element) => {
    const initial = node.querySelector('[data-pqr-part="avatar-initiale"]') as HTMLElement | null;
    const photo = node.querySelector('[data-pqr-part="avatar-photo"]') as HTMLElement | null;
    const image = photo?.querySelector('img') as HTMLImageElement | null;
    const source = image?.getAttribute('src') ?? null;
    // Le cycle média natif laisse la data URL marquée jusqu'au before_save.
    // Elle est tronquée ici — comme le fait `hero.spec.mts` — pour qu'un reçu
    // commité ne transporte pas 138 ko de base64.
    const pending = image?.classList.contains('o_modified_image_to_save') ?? false;
    return {
      initial: Boolean(initial && !initial.hidden),
      photo: Boolean(photo && !photo.hidden),
      // 2.0.0 : `data-photo` n'a plus d'écrivain — le fait persisté est
      // `data-avatar`, dérivé par reconcileAvatar. Lire l'ancien attribut
      // rendait `null` et faisait échouer deux constats sur un état correct.
      avatarFlag: (node as HTMLElement).dataset.avatar ?? null,
      rawSource: pending && source?.startsWith('data:image/') ? 'data:image/*;base64,…' : source,
      pending,
      alt: image?.getAttribute('alt') ?? null,
    };
  });
}

async function main() {
  const started = Date.now();
  const receipt = new Recueil('google-reviews-security', 'odoo-019-foundation', 'google-reviews-panel-hostile');
  if (!dockerDisponible()) {
    receipt.saute('qualification hostile Google Reviews', 'Docker indisponible', 'ODOO-LIMIT-NO-INSTANCE');
    receipt.ecrire('google-reviews-security.json', Date.now() - started);
    process.exit(1);
  }

  await withInstance(async ({ browser, env }) => {
    const editor = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await editor.context.newPage();
      const frame = await enterEditor(page, env);
      if (!frame) {
        receipt.saute('panneau et gestes sous rôle Website Designer', 'éditeur Odoo non engagé', 'ODOO-LIMIT-EDITOR-ENTRY');
        return;
      }
      await insertGoogleReviews(page);
      const root = frame.locator(ROOT).first();
      const card = root.locator(CARD).first();
      receipt.constateSi(
        'rôle Website Designer — insertion native et carte sélectionnable',
        await root.count() === 1 && await card.count() === 1,
        '1 racine et 1 carte accessibles dans l’éditeur non administrateur',
        `${await root.count()} racine(s) · ${await card.count()} carte(s)`,
      );

      await selectInFrame(frame, ROOT);
      // L'action Add est la sonde vivante du panneau : elle attend le rendu du
      // panneau racine, au lieu de lire trop tôt un conteneur Odoo en transit.
      await rootPanel(page).getByRole('button', { name: 'Ajouter un avis' }).waitFor({ state: 'visible', timeout: 10_000 });
      const rootControls = await controlInventory(rootPanel(page));
      const expectedRoot = [...panelFixture.expectedRootControls].sort();
      receipt.constateSi(
        'panneau racine — inventaire strict des contrôles déclarés',
        JSON.stringify(rootControls) === JSON.stringify(expectedRoot),
        expectedRoot.join(', '),
        rootControls.join(', ') || '(aucun)',
      );
      const rootActions = ((await root.getAttribute('data-pqr-root-actions')) ?? '').split(/\s+/).filter(Boolean).sort();
      receipt.constateSi(
        'racine — seuls move, duplicate et remove sont déclarés',
        JSON.stringify(rootActions) === JSON.stringify([...panelFixture.rootActions].sort()),
        panelFixture.rootActions.join(', '),
        rootActions.join(', ') || '(aucune)',
      );
      const visibleRootActions = {
        'save-as-custom': await visibleCount(page, '.oe_snippet_save'),
        resize: await visibleCount(page, '.oe_overlay.oe_active .o_handle:not(.readonly):not(.d-none)'),
        anchor: await visibleCount(page, '.oe_snippet_anchor'),
        background: await rootPanel(page).locator(
          'button, input, select, textarea, [role="button"], [role="combobox"]',
        ).evaluateAll((nodes: Element[]) => nodes.filter((node) => {
          const text = `${node.getAttribute('aria-label') ?? ''} ${node.getAttribute('title') ?? ''} ${(node as HTMLElement).innerText ?? ''}`;
          return /background|arrière-plan|fond/i.test(text) && (node as HTMLElement).offsetParent !== null;
        }).length),
      };
      const exposedForbiddenRootActions = panelFixture.forbiddenRootActions.filter(
        (action: keyof typeof visibleRootActions) => visibleRootActions[action] > 0,
      );
      receipt.constateSi(
        'racine — les actions Odoo interdites sont réellement absentes du chrome visible',
        exposedForbiddenRootActions.length === 0,
        'save-as-custom, resize, background et anchor absents',
        exposedForbiddenRootActions.length
          ? `${exposedForbiddenRootActions.join(', ')} exposée(s) · ${JSON.stringify(visibleRootActions)}`
          : JSON.stringify(visibleRootActions),
      );

      await selectInFrame(frame, `${ROOT} ${CARD}`);
      const currentCardPanel = cardPanel(page);
      const cardControls = await controlInventory(currentCardPanel);
      const expectedCard = [...panelFixture.expectedCardControls].sort();
      const panelText = (await currentCardPanel.innerText()).replace(/\s+/g, ' ').toLowerCase();
      const forbiddenLabels = panelFixture.forbiddenNativeImageOptions.filter((option: string) =>
        panelText.includes(option.toLowerCase()),
      );
      receipt.constateSi(
        'panneau carte — contrôles texte, repeat et avatar exhaustifs',
        JSON.stringify(cardControls) === JSON.stringify(expectedCard),
        expectedCard.join(', '),
        cardControls.join(', ') || '(aucun)',
      );
      receipt.constateSi(
        'panneau avatar — aucune option image native interdite',
        forbiddenLabels.length === 0,
        'crop, filters, link, tooltip, dimensions, format absents',
        forbiddenLabels.length ? forbiddenLabels.join(', ') : 'aucune option interdite',
      );

      // Le vrai dialogue Odoo accepte le fichier, sauvegarde l'attachment et
      // rappelle l'action. En 2.0.0 la photo s'affiche AUSSITÔT : l'alternative
      // est dérivée de l'auteur, elle ne conditionne plus l'affichage.
      await currentCardPanel.getByRole('button', { name: 'Remplacer' }).click();
      const mediaDialog = page.locator('.modal')
        .filter({ has: page.locator('.o_select_media_dialog') })
        .last();
      await mediaDialog.waitFor({ state: 'visible', timeout: 10_000 });
      const tabs = (await mediaDialog.locator('.o_select_media_dialog .nav-link').allTextContents()).map((text) => text.trim());
      receipt.constateSi(
        'média — le dialogue Odoo n’expose que l’onglet Images',
        tabs.length === 1 && tabs[0] === 'Images',
        'Images seulement',
        tabs.join(', ') || '(aucun onglet)',
      );
      await mediaDialog.locator('input.o_file_input').setInputFiles(UPLOAD_IMAGE);
      await mediaDialog.waitFor({ state: 'hidden', timeout: 30_000 });
      await page.waitForTimeout(300);
      const uploadedWithoutAlt = await avatarState(card);
      // Mesuré le 2026-08-18 : au sortir du dialogue, la source est encore la
      // data URL native marquée — le before_save ne l'a pas encore publiée.
      // C'est l'exception assumée de `sourceEnAttenteNative`, pas un défaut ;
      // le Hero l'exprime déjà ainsi (« publié OU pending natif »).
      const sourceSaine = uploadedWithoutAlt.rawSource !== null && (
        /^(\/web\/(image|content)\/|https?:\/\/[^/]+\/web\/(image|content)\/)/.test(uploadedWithoutAlt.rawSource) ||
        (uploadedWithoutAlt.pending && uploadedWithoutAlt.rawSource === 'data:image/*;base64,…')
      );
      receipt.constateSi(
        'avatar sans alt — upload Odoo affiché, alternative dérivée',
        sourceSaine && uploadedWithoutAlt.photo === true && uploadedWithoutAlt.avatarFlag === 'Photo' &&
          Boolean(uploadedWithoutAlt.alt?.trim()),
        'source Odoo publiée ou pending natif, photo visible, data-avatar=Photo, alt dérivé non vide',
        JSON.stringify(uploadedWithoutAlt),
      );

      const altInput = () => cardPanel(page).locator('[data-pqr-control="avatar-alt"] input').first();
      await altInput().fill('Portrait QA');
      await altInput().press('Tab');
      await page.waitForTimeout(180);
      const both = await avatarState(card);
      // 2.0.0 (2026-08-18) : les deux booléens ont disparu. Il n'y a plus quatre
      // états indépendants — dont deux absurdes, aucun avatar et les deux à la
      // fois — mais DEUX états exclusifs, décidés par la présence d'une source
      // publiée et non par une bascule du rédacteur. Ce contrôle vérifie la
      // dérivation dans les deux sens, y compris le retour à l'initiale.
      const avecPhoto = both;
      await card.evaluate((node) => {
        const image = node.querySelector('[data-pqr-part="avatar-photo"] img') as HTMLImageElement | null;
        if (image) image.removeAttribute('src');
      });
      await altInput().fill('Portrait QA');
      await altInput().press('Tab');
      await page.waitForTimeout(200);
      const sansPhoto = await avatarState(card);
      const states = { avecPhoto, sansPhoto };
      receipt.artefact(
        path.join(PROOFS, 'google-reviews-security.avatar-states.json'),
        Buffer.from(JSON.stringify(states, null, 2) + '\n'),
        'json',
      );
      receipt.constateSi(
        'avatar — deux états exclusifs, dérivés de la présence d\'une photo publiée',
        avecPhoto.photo && !avecPhoto.initial && !sansPhoto.photo && sansPhoto.initial,
        'photo publiée → forme Photo seule ; source retirée → initiale seule',
        JSON.stringify(states),
      );

      // Chaque URL hostile est écrite dans le DOM éditable puis réconciliée par
      // l'action d'alt : la sortie doit retirer la source, pas seulement cacher
      // une balise dangereuse. Cela couvre aussi l'URL HTTPS volontairement
      // cassée de la fixture.
      const rejectedSources: Array<{ source: string; state: Awaited<ReturnType<typeof avatarState>> }> = [];
      for (const source of hostileFixture.media.invalidSources) {
        await card.evaluate((node, rawSource) => {
          const image = node.querySelector('[data-pqr-part="avatar-photo"] img') as HTMLImageElement | null;
          if (image) image.setAttribute('src', rawSource as string);
        }, source);
        await altInput().fill(`Alt hostile ${rejectedSources.length + 1}`);
        await altInput().press('Tab');
        await page.waitForTimeout(100);
        rejectedSources.push({ source, state: await avatarState(card) });
      }
      receipt.constateSi(
        'média hostile — sources exécutables, vides ou cassées retirées',
        rejectedSources.every(({ state }) => state.rawSource === null && state.photo === false && state.avatarFlag === 'Initiale'),
        `${hostileFixture.media.invalidSources.length} sources retirées et avatar replié`,
        JSON.stringify(rejectedSources),
      );

      const testimonial = card.locator('[data-pqr-part="temoignage"]');
      const inserted = await testimonial.evaluate((element, html) => {
        const target = element as HTMLElement;
        target.focus();
        const range = document.createRange();
        range.selectNodeContents(target);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        return document.execCommand('insertHTML', false, html as string);
      }, hostileFixture.richText.input);
      await page.waitForTimeout(250);
      receipt.constateSi(
        'charge hostile rich-text — une édition réellement dirty est insérée',
        inserted && (await frame.locator('.o_dirty').count()) > 0,
        'insertHTML accepté et au moins une racine dirty',
        `insert=${String(inserted)} · dirty=${await frame.locator('.o_dirty').count()}`,
      );

      const save = page.locator('.o-snippets-top-actions button[data-action="save"]').first();
      if (!(await save.isVisible().catch(() => false))) {
        receipt.saute('save des charges hostiles', 'bouton Save absent', 'ODOO-LIMIT-SAVE-BUTTON');
      } else {
        const responsePromise = page.waitForResponse(
          (response) => response.url().includes('/web/dataset/call_kw/ir.ui.view/save'),
          { timeout: 30_000 },
        ).catch(() => null);
        await save.click();
        const response = await responsePromise;
        receipt.constateSi(
          'save hostile — ir.ui.view/save répond 2xx',
          response !== null && response.ok(),
          'HTTP 2xx',
          response ? `HTTP ${response.status()}` : 'aucun RPC save',
        );
      }
    } finally {
      await editor.context.close();
    }

    const publicSession = await ouvrirSessionPublique(browser);
    try {
      const page = await publicSession.context.newPage();
      const response = await page.goto(`${baseUrl(env)}${HARNESS_PATH}?pqr_hostile=${Date.now()}`, {
        waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS,
      });
      const publicState = await page.locator(`${ROOT} ${CARD}`).first().evaluate((node, allowedText: string[]) => {
        const testimonial = node.querySelector('[data-pqr-part="temoignage"]') as HTMLElement | null;
        const avatar = node.querySelector('[data-pqr-part="avatar-photo"]') as HTMLElement | null;
        const image = avatar?.querySelector('img') as HTMLImageElement | null;
        const executableAttributes = [...node.querySelectorAll('*')].flatMap((element) =>
          element.getAttributeNames().filter((name) => /^on/i.test(name)).map((name) => `${element.tagName}.${name}`),
        );
        return {
          status: document.location.pathname,
          strong: testimonial?.querySelectorAll('strong, b').length ?? -1,
          forbiddenTags: testimonial?.querySelectorAll('em, i, a, script, style, span').length ?? -1,
          forbiddenAttributes: testimonial
            ? testimonial.getAttributeNames().filter((name) => /^(onclick|style|href)$/i.test(name))
            : ['testimonial-absent'],
          preserved: testimonial ? allowedText.every((text) => testimonial.textContent?.includes(text)) : false,
          executableAttributes,
          executableUrls: [...node.querySelectorAll('[href], [src]')]
            .map((element) => element.getAttribute('href') ?? element.getAttribute('src') ?? '')
            .filter((value) => /^\s*(javascript|data|vbscript):/i.test(value)),
          avatarSource: image?.getAttribute('src') ?? null,
          avatarHidden: avatar?.hidden ?? true,
        };
      }, hostileFixture.richText.allowedText);
      receipt.artefact(
        path.join(PROOFS, 'google-reviews-security.public.json'),
        Buffer.from(JSON.stringify({ httpStatus: response?.status(), publicState }, null, 2) + '\n'),
        'json',
      );
      receipt.constateSi(
        'public anonyme — rich-text conserve strong et retire tags/attributs hostiles',
        response?.status() === 200 && publicState.strong === 1 && publicState.forbiddenTags === 0 &&
          publicState.forbiddenAttributes.length === 0 && publicState.preserved,
        'HTTP 200 · 1 strong · 0 em/i/a/script/style/span · texte préservé',
        JSON.stringify(publicState),
      );
      receipt.constateSi(
        'public anonyme — aucun handler, URL exécutable ou avatar cassé ne survit',
        publicState.executableAttributes.length === 0 && publicState.executableUrls.length === 0 &&
          (publicState.avatarSource === null || publicState.avatarSource === '/html_editor/static/src/img/placeholder_thumbnail.png') &&
          publicState.avatarHidden === true,
        '0 handler · 0 URL exécutable · avatar sans source ou placeholder natif masqué',
        JSON.stringify(publicState),
      );
    } finally {
      await publicSession.context.close();
    }
  });

  const done = receipt.ecrire('google-reviews-security.json', Date.now() - started);
  process.exit(done.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(`✖ ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
}
