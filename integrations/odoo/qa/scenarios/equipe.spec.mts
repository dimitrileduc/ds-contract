import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Frame, Page } from 'playwright-core';
import { PROOFS, Recueil, REPO } from '../lib/receipt.mts';
import {
  EDITOR_TIMEOUT_MS, NAV_TIMEOUT_MS, baseUrl, dockerDisponible,
  ouvrirSessionEditeur, ouvrirSessionPublique, withInstance, type QaEnv,
} from '../run.mts';

const ROOT = '.s_pqr_equipe';
const CARD = '[data-pqr-member-card]';
const HARNESS_PATH = '/piqueray-harness/equipe';
const VISUAL_PATH = '/piqueray-harness/equipe-visual';
const UPLOAD_IMAGE = path.join(REPO, 'site/docs-shots/home-light.png');
const SECOND_UPLOAD_IMAGE = path.join(REPO, 'site/docs-shots/how-model-light.png');
const fixture = JSON.parse(readFileSync(path.join(REPO, 'integrations/odoo/qa/fixtures/equipe-panel.json'), 'utf8'));

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
  const rootBox = await root.boundingBox();
  const firstBox = await root.locator(CARD).first().boundingBox();
  if (!rootBox || !firstBox) throw new Error('Racine Équipe sans grille sélectionnable.');
  const x = Math.min(firstBox.width + 16, rootBox.width - 8);
  await root.click({ position: { x, y: 8 } });
  await frame.page().waitForTimeout(250);
}

async function controls(panel: any): Promise<string[]> {
  return panel.locator('[data-pqr-control]').evaluateAll((nodes: Element[]) =>
    [...new Set(nodes.map((node) => node.getAttribute('data-pqr-control')).filter(Boolean))].sort(),
  );
}

async function state(page: { locator: (selector: string) => any }) {
  return page.locator(ROOT).evaluateAll((roots: Element[]) => roots.map((root) => ({
    instance: root.getAttribute('data-pqr-instance'),
    count: root.querySelectorAll('[data-pqr-member-card]').length,
    members: [...root.querySelectorAll('[data-pqr-member-card]')].map((card) => {
      const image = card.querySelector('[data-pqr-part="member-picture-normal"]') as HTMLImageElement | null;
      const imageRoot = card.querySelector('[data-pqr-part="member-picture-root"]') as HTMLElement | null;
      const source = image?.getAttribute('src')?.trim() ?? '';
      const alt = image?.getAttribute('alt')?.trim() ?? '';
      return {
        marker: card.getAttribute('data-pqr-member-marker'),
        name: card.querySelector('[data-pqr-part="member-name"]')?.textContent?.trim() ?? '',
        role: card.querySelector('[data-pqr-part="member-role"]')?.textContent?.trim() ?? '',
        image: Boolean(image && imageRoot && image.offsetParent !== null && imageRoot.offsetParent !== null && source),
        source: image?.classList.contains('o_modified_image_to_save') && source.startsWith('data:image/') ? 'data:image/*;base64,…' : source,
        alt,
      };
    }),
  })));
}

async function responsive(page: Page, rootIndex = 0) {
  const result = [];
  for (const width of [1728, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    result.push(await page.locator(ROOT).nth(rootIndex).evaluate((root, viewportWidth) => {
      const host = root as HTMLElement;
      const grid = host.querySelector<HTMLElement>('[data-pqr-member-list]');
      const cards = [...host.querySelectorAll<HTMLElement>('[data-pqr-member-card]')];
      if (!grid || cards.length < 5) return { width: viewportWidth, missing: true };
      const tops = cards.slice(0, 5).map((card) => Math.round(card.getBoundingClientRect().top));
      const firstPicture = cards[0].querySelector<HTMLElement>('[data-pqr-part="member-picture-root"]');
      const pictureRect = firstPicture?.getBoundingClientRect();
      return {
        width: viewportWidth,
        rootWidth: host.getBoundingClientRect().width,
        overflow: host.scrollWidth - host.clientWidth,
        columns: getComputedStyle(grid).gridTemplateColumns.split(/\s+/).filter(Boolean).length,
        firstRowAligned: new Set(tops.slice(0, 4)).size === 1,
        fifthOnNextRow: tops[4] > tops[0],
        pictureSquareDelta: pictureRect ? Math.abs(pictureRect.width - pictureRect.height) : null,
      };
    }, width));
  }
  return result;
}

async function main() {
  const started = Date.now();
  const receipt = new Recueil('equipe-functional-security', 'odoo-019-foundation', 'equipe-contract-sample');
  if (!dockerDisponible()) {
    receipt.saute('qualification Équipe sur Odoo', 'Docker indisponible', 'ODOO-LIMIT-NO-INSTANCE');
    receipt.ecrire('equipe-functional.json', Date.now() - started);
    process.exit(1);
  }

  await withInstance(async ({ browser, env }) => {
    const publicVisual = await ouvrirSessionPublique(browser);
    try {
      const page = await publicVisual.context.newPage();
      const response = await page.goto(`${baseUrl(env)}${VISUAL_PATH}`, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
      const initial = await state(page);
      receipt.constateSi('QWeb — le sample canonique rend 16 membres nommés', response?.status() === 200 && initial.length === 1 && initial[0].count === 16 && initial[0].members.every((member: any) => member.marker && member.name && member.role), 'HTTP 200 · 1 × 16 membres', JSON.stringify(initial.map((root: any) => ({ count: root.count, first: root.members[0], last: root.members.at(-1) }))));
    } finally {
      await publicVisual.context.close();
    }

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
      receipt.constateSi('catalogue — deux Équipes indépendantes sont insérées', await roots.count() === 2 && await first.locator(CARD).count() === 16 && await second.locator(CARD).count() === 16, 'A=16, B=16', `racines=${await roots.count()} · A=${await first.locator(CARD).count()} · B=${await second.locator(CARD).count()}`);

      await selectRootGap(frame, first);
      const rootControls = await controls(rootPanel(page));
      const rootActions = ((await first.getAttribute('data-pqr-root-actions')) ?? '').split(/\s+/).filter(Boolean).sort();
      receipt.constateSi('panneau racine — inventaire strict et actions déclarées', JSON.stringify(rootControls) === JSON.stringify([...fixture.rootControls].sort()) && JSON.stringify(rootActions) === JSON.stringify([...fixture.rootActions].sort()), `${fixture.rootControls.join(', ')} · ${fixture.rootActions.join(', ')}`, `${rootControls.join(', ')} · ${rootActions.join(', ')}`);

      const firstCard = first.locator(CARD).first();
      await firstCard.click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(250);
      const cardControls = await controls(cardPanel(page));
      const boundary = await firstCard.evaluate((card) => ({
        cardEditable: (card as HTMLElement).isContentEditable,
        pictureEditable: (card.querySelector('[data-pqr-part="member-picture-root"]') as HTMLElement | null)?.isContentEditable ?? null,
        nameEditable: (card.querySelector('[data-pqr-part="member-name"]') as HTMLElement | null)?.isContentEditable ?? null,
        roleEditable: (card.querySelector('[data-pqr-part="member-role"]') as HTMLElement | null)?.isContentEditable ?? null,
      }));
      receipt.constateSi('panneau carte et frontière — contrôle exhaustif, textes seuls ouverts', JSON.stringify(cardControls) === JSON.stringify([...fixture.cardControls].sort()) && !boundary.cardEditable && boundary.pictureEditable === false && boundary.nameEditable === true && boundary.roleEditable === true, fixture.cardControls.join(', '), `${cardControls.join(', ')} · ${JSON.stringify(boundary)}`);

      await firstCard.locator('[data-pqr-part="member-name"]').fill('Membre QA');
      await firstCard.locator('[data-pqr-part="member-role"]').fill('Responsable QA');

      await selectRootGap(frame, first);
      await rootPanel(page).getByRole('button', { name: 'Ajouter un membre' }).click();
      await page.waitForTimeout(180);
      const added = first.locator(CARD).last();
      const addedMarker = await added.getAttribute('data-pqr-member-marker');
      receipt.constateSi('repeat — ajout 16→17 ciblé sans fuite vers B', await first.locator(CARD).count() === 17 && await second.locator(CARD).count() === 16, 'A=17, B=16', `A=${await first.locator(CARD).count()} · B=${await second.locator(CARD).count()}`);
      await added.click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(120);
      await cardPanel(page).getByRole('button', { name: 'Monter' }).click();
      await page.waitForTimeout(150);
      const markers = await first.locator(CARD).evaluateAll((cards: Element[]) => cards.map((card) => card.getAttribute('data-pqr-member-marker')));
      receipt.constateSi('repeat — réordre ciblé', markers.at(-2) === addedMarker && await second.locator(CARD).count() === 16, `${addedMarker} avant-dernier`, markers.join(', '));
      const moved = first.locator(`${CARD}[data-pqr-member-marker="${addedMarker}"]`);
      await moved.click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(120);
      await cardPanel(page).getByRole('button', { name: 'Supprimer le membre' }).click();
      await page.waitForTimeout(150);

      while (await first.locator(CARD).count() > 1) {
        const last = first.locator(CARD).last();
        await last.click({ position: { x: 8, y: 8 } });
        await page.waitForTimeout(60);
        await cardPanel(page).getByRole('button', { name: 'Supprimer le membre' }).click();
        await page.waitForTimeout(60);
      }
      receipt.constateSi('repeat — cardinalité 1 sans fuite', await first.locator(CARD).count() === 1 && await second.locator(CARD).count() === 16, 'A=1, B=16', `A=${await first.locator(CARD).count()} · B=${await second.locator(CARD).count()}`);

      const sole = first.locator(CARD).first();
      await sole.click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(100);
      await cardPanel(page).getByRole('button', { name: 'Supprimer le membre' }).click();
      await page.waitForTimeout(150);
      receipt.constateSi('repeat — cardinalité 0 sans fuite', await first.locator(CARD).count() === 0 && await second.locator(CARD).count() === 16, 'A=0, B=16', `A=${await first.locator(CARD).count()} · B=${await second.locator(CARD).count()}`);

      const addFromZero = rootPanel(page).getByRole('button', { name: 'Ajouter un membre' });
      await addFromZero.waitFor({ state: 'visible', timeout: 5_000 });
      await addFromZero.click();
      await page.waitForTimeout(180);
      receipt.constateSi('repeat — le blueprint recrée le premier membre depuis zéro', await first.locator(CARD).count() === 1 && await second.locator(CARD).count() === 16, 'A=1, B=16', `A=${await first.locator(CARD).count()} · B=${await second.locator(CARD).count()}`);

      const current = first.locator(CARD).first();
      await current.locator('[data-pqr-part="member-name"]').fill('Membre QA final');
      await current.locator('[data-pqr-part="member-role"]').fill('Poste QA final');
      await current.click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(150);
      await cardPanel(page).getByRole('button', { name: 'Remplacer' }).click();
      const mediaDialog = page.locator('.modal').filter({ has: page.locator('.o_select_media_dialog') }).last();
      await mediaDialog.waitFor({ state: 'visible', timeout: 10_000 });
      const tabs = (await mediaDialog.locator('.o_select_media_dialog .nav-link').allTextContents()).map((text) => text.trim());
      receipt.constateSi('média — chrome visible limité aux images', tabs.length === 1 && tabs[0] === 'Images', 'Images seulement', tabs.join(', ') || '(aucun)');
      await mediaDialog.locator('input.o_file_input').setInputFiles(UPLOAD_IMAGE);
      await mediaDialog.waitFor({ state: 'hidden', timeout: 30_000 });
      await page.waitForTimeout(300);
      const portrait = current.locator('[data-pqr-part="member-picture-normal"]');
      const firstUploadedSource = await portrait.getAttribute('src');
      const uploadedWithoutAlt = await state(frame);
      receipt.constateSi(
        'média — upload visible immédiatement avec alt décoratif vide',
        Boolean(uploadedWithoutAlt[0]?.members[0]?.image && firstUploadedSource && uploadedWithoutAlt[0].members[0].alt === ''),
        'visible · source Odoo · alt=""',
        JSON.stringify(uploadedWithoutAlt[0]?.members[0]),
      );

      // Exerce le chemin que l'upload seul ne couvre pas : une deuxième image
      // est uploadée, puis la première est resélectionnée comme pièce jointe
      // EXISTANTE dans la médiathèque Odoo.
      await current.click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(150);
      await cardPanel(page).getByRole('button', { name: 'Remplacer' }).click();
      const secondDialog = page.locator('.modal').filter({ has: page.locator('.o_select_media_dialog') }).last();
      await secondDialog.waitFor({ state: 'visible', timeout: 10_000 });
      await secondDialog.locator('input.o_file_input').setInputFiles(SECOND_UPLOAD_IMAGE);
      await secondDialog.waitFor({ state: 'hidden', timeout: 30_000 });
      await page.waitForTimeout(300);
      const secondUploadedSource = await portrait.getAttribute('src');

      await current.click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(150);
      await cardPanel(page).getByRole('button', { name: 'Remplacer' }).click();
      const libraryDialog = page.locator('.modal').filter({ has: page.locator('.o_select_media_dialog') }).last();
      await libraryDialog.waitFor({ state: 'visible', timeout: 10_000 });
      const existingHome = libraryDialog.locator('.o_existing_attachment_cell.o_we_image.o_loaded button.o_button_area[aria-label="home-light.png"]').first();
      await existingHome.waitFor({ state: 'visible', timeout: 30_000 });
      await existingHome.click();
      await libraryDialog.waitFor({ state: 'hidden', timeout: 30_000 });
      await page.waitForTimeout(300);
      const existingSelectedSource = await portrait.getAttribute('src');
      const existingSelected = await state(frame);
      receipt.constateSi(
        'média — une pièce jointe existante remplace réellement le portrait',
        Boolean(existingSelected[0]?.members[0]?.image && secondUploadedSource && existingSelectedSource && existingSelectedSource !== secondUploadedSource),
        'source différente de l’upload B · portrait visible avant alt',
        JSON.stringify({ secondChanged: firstUploadedSource !== secondUploadedSource, existingChanged: existingSelectedSource !== secondUploadedSource, member: existingSelected[0]?.members[0] }),
      );

      await current.click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(150);
      const alt = cardPanel(page).locator('[data-pqr-control="member-image-alt"] input').first();
      await alt.fill('Portrait du membre QA');
      await alt.press('Tab');
      await page.waitForTimeout(200);
      const edited = await state(frame);
      const media = edited[0]?.members[0];
      const safeSource = /\/web\/(image|content)\//.test(media?.source ?? '') || media?.source === 'data:image/*;base64,…';
      receipt.constateSi('média — conteneur visible, source sûre et alt exploitable', Boolean(media?.image && safeSource && media.alt === 'Portrait du membre QA'), 'visible · source Odoo · alt non vide', JSON.stringify(media));

      // Le portrait reste un média contrôlé par le panneau du membre. Un clic
      // direct sur le bitmap ne doit jamais rouvrir les outils image natifs
      // (replace/crop/filter/link/shape/format/style, etc.).
      await current.locator('[data-pqr-part="member-picture-normal"]').click();
      await page.waitForTimeout(250);
      const canvasPanelText = (await page.locator('.options-container:visible').allInnerTexts())
        .join(' ')
        .replace(/\s+/g, ' ')
        .toLowerCase();
      const exposedNativeImageOptions = fixture.forbiddenNativeOptions.filter((label: string) =>
        canvasPanelText.includes(label.toLowerCase()),
      );
      receipt.constateSi(
        'canvas portrait — aucun remplacement direct ni style image natif',
        exposedNativeImageOptions.length === 0,
        'replace/crop/filter/link/shape/format/style absents',
        exposedNativeImageOptions.length ? exposedNativeImageOptions.join(', ') : 'aucune option native',
      );

      const save = page.locator('.o-snippets-top-actions button[data-action="save"]').first();
      const responsePromise = page.waitForResponse((response) => response.url().includes('/web/dataset/call_kw/ir.ui.view/save'), { timeout: 30_000 }).catch(() => null);
      await save.click();
      const response = await responsePromise;
      receipt.constateSi('save — Odoo persiste les deux Équipes', response !== null && response.ok(), 'RPC save 2xx', response ? `HTTP ${response.status()}` : 'aucun RPC');
    } finally {
      await editor.context.close();
    }

    const publicSession = await ouvrirSessionPublique(browser);
    try {
      const page = await publicSession.context.newPage();
      const response = await page.goto(`${baseUrl(env)}${HARNESS_PATH}?qa=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
      const saved = await state(page);
      const safety = await page.locator(ROOT).first().evaluate((root) => ({
        handlers: [...root.querySelectorAll('*')].flatMap((node) => node.getAttributeNames().filter((name) => /^on/i.test(name))),
        executableUrls: [...root.querySelectorAll('[href], [src]')].map((node) => node.getAttribute('href') ?? node.getAttribute('src') ?? '').filter((value) => /^\s*(javascript|data|vbscript):/i.test(value)),
      }));
      const layout = await responsive(page, 1);
      receipt.artefact(path.join(PROOFS, 'equipe-functional.public.json'), Buffer.from(JSON.stringify({ status: response?.status(), saved, safety, layout }, null, 2) + '\n'), 'json');
      receipt.constateSi('public — A=1 éditée avec portrait, B=16 intacte', response?.status() === 200 && saved.length === 2 && saved[0].count === 1 && saved[0].members[0]?.name === 'Membre QA final' && saved[0].members[0]?.role === 'Poste QA final' && saved[0].members[0]?.image && /\/web\/(image|content)\//.test(saved[0].members[0]?.source ?? '') && saved[1].count === 16, 'HTTP 200 · A=1 complète · B=16', JSON.stringify(saved.map((root: any) => ({ count: root.count, first: root.members[0] }))));
      receipt.constateSi('sécurité — aucun handler ni URL exécutable', safety.handlers.length === 0 && safety.executableUrls.length === 0, '0 handler, 0 URL exécutable', JSON.stringify(safety));
      receipt.constateSi('responsive — grille native 4 colonnes à 1728/1440 sans overflow', layout.length === 2 && layout.every((item: any) => !item.missing && item.overflow <= 0.5 && item.columns === 4 && item.firstRowAligned && item.fifthOnNextRow && item.pictureSquareDelta !== null && item.pictureSquareDelta <= 0.5), '4 colonnes · image carrée · 0 overflow', JSON.stringify(layout));
    } finally {
      await publicSession.context.close();
    }

    const reopened = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await reopened.context.newPage();
      const frame = await enterEditor(page, env);
      const saved = frame ? await state(frame) : [];
      receipt.constateSi('éditeur rouvert — DOM sauvegardé relu sans état parallèle', saved.length === 2 && saved[0].count === 1 && saved[0].members[0]?.name === 'Membre QA final' && saved[0].members[0]?.image && saved[1].count === 16, 'A=1 avec portrait · B=16', JSON.stringify(saved.map((root: any) => ({ count: root.count, first: root.members[0] }))));
    } finally {
      await reopened.context.close();
    }
  });

  const done = receipt.ecrire('equipe-functional.json', Date.now() - started);
  process.exit(done.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => { console.error(`✖ ${error instanceof Error ? error.message : String(error)}`); process.exit(1); });
}
