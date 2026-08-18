import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Frame, Page } from 'playwright-core';
import { PROOFS, REPO, Recueil } from '../lib/receipt.mts';
import {
  EDITOR_TIMEOUT_MS, NAV_TIMEOUT_MS, baseUrl, dockerDisponible,
  ouvrirSessionEditeur, ouvrirSessionPublique, withInstance, type QaEnv,
} from '../run.mts';

const ROOT = '.s_pqr_devis';
const HARNESS_PATH = '/piqueray-harness/devis';
const fixture = JSON.parse(readFileSync(path.join(REPO, 'integrations/odoo/qa/fixtures/devis-panel.json'), 'utf8'));
const UPLOAD_IMAGE = path.join(REPO, 'site/docs-shots/home-light.png');
const SECOND_UPLOAD_IMAGE = path.join(REPO, 'site/docs-shots/how-model-light.png');

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

async function insertDevis(page: Page): Promise<void> {
  const content = page.locator('.o_snippet_thumbnail')
    .filter({ has: page.locator('.o_snippet_thumbnail_title', { hasText: 'Content' }) }).first();
  await content.locator('button').click();
  const dialog = page.locator('.modal').last();
  await dialog.locator('input[type="search"]').fill('Devis');
  await page.waitForTimeout(300);
  const chooser = await dialog.locator('iframe').contentFrame();
  if (!chooser) throw new Error('Iframe du catalogue Website absente.');
  await chooser.locator('[aria-label="Piqueray · Devis"]').click();
  await page.waitForTimeout(400);
}

const panel = (page: Page) => page.locator('.options-container:visible')
  .filter({ has: page.locator('[data-pqr-control="devis-background-url"]') }).first();

async function select(frame: Frame, root: any): Promise<void> {
  await root.click({ position: { x: 8, y: 8 } });
  await frame.page().waitForTimeout(400);
}

async function visibleCount(page: Page, selector: string): Promise<number> {
  const nodes = page.locator(selector);
  let count = 0;
  for (let index = 0; index < await nodes.count(); index += 1) {
    if (await nodes.nth(index).isVisible().catch(() => false)) count += 1;
  }
  return count;
}

async function readState(page: { locator: (selector: string) => any }) {
  return page.locator(ROOT).evaluateAll((roots: Element[]) => roots.map((root) => {
    const image = root.querySelector('[data-pqr-part="devis-background"]') as HTMLImageElement | null;
    const rawSource = image?.getAttribute('src') ?? '';
    const pending = image?.classList.contains('o_modified_image_to_save') ?? false;
    return {
      title: root.querySelector('[data-pqr-part="devis-title"]')?.textContent?.trim() ?? '',
      label: root.querySelector('[data-pqr-part="devis-cta"] [data-pqr-part="button-label"]')?.textContent?.trim() ?? '',
      source: pending && rawSource.startsWith('data:image/') ? 'data:image/*;base64,…' : rawSource,
      alt: image?.getAttribute('alt') ?? '',
      pending,
      fond: root.hasAttribute('data-fond'),
      veil: Boolean(root.querySelector('[data-pqr-part="devis-veil"]')),
    };
  }));
}

async function responsive(page: Page) {
  const result = [];
  for (const width of [1728, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    result.push(await page.locator(ROOT).first().evaluate((root, viewportWidth) => {
      const host = root as HTMLElement;
      const background = host.querySelector<HTMLElement>('[data-pqr-part="devis-background"]');
      const veil = host.querySelector<HTMLElement>('[data-pqr-part="devis-veil"]');
      const container = host.querySelector<HTMLElement>('[data-pqr-part="devis-container"]');
      const title = host.querySelector<HTMLElement>('[data-pqr-part="devis-title"]');
      const button = host.querySelector<HTMLElement>('[data-pqr-part="button-root"]');
      if (!background || !veil || !container || !title || !button) return { width: viewportWidth, missing: true };
      const rr = host.getBoundingClientRect();
      // Pas de fonction nommée imbriquée ici : la sérialisation Playwright ne
      // transporte pas le helper `__name` que tsx/esbuild injecte (keepNames),
      // et le callback explose dans la page (`__name is not defined`).
      const br = background.getBoundingClientRect();
      const vr = veil.getBoundingClientRect();
      const tr = title.getBoundingClientRect();
      const cr = button.getBoundingClientRect();
      return {
        width: viewportWidth,
        rootWidth: rr.width,
        rootHeight: rr.height,
        overflow: host.scrollWidth - host.clientWidth,
        backgroundDelta: Math.max(Math.abs(br.left - rr.left), Math.abs(br.right - rr.right), Math.abs(br.top - rr.top), Math.abs(br.bottom - rr.bottom)),
        veilDelta: Math.max(Math.abs(vr.left - rr.left), Math.abs(vr.right - rr.right), Math.abs(vr.top - rr.top), Math.abs(vr.bottom - rr.bottom)),
        titleInside: tr.left >= rr.left - 0.5 && tr.right <= rr.right + 0.5,
        ctaInside: cr.left >= rr.left - 0.5 && cr.right <= rr.right + 0.5,
        ctaWhiteSpace: getComputedStyle(button).whiteSpace,
      };
    }, width));
  }
  return result;
}

async function main() {
  const started = Date.now();
  const receipt = new Recueil('devis-functional-security', 'odoo-019-foundation', 'devis-panel');
  if (!dockerDisponible()) {
    receipt.saute('qualification Devis sur Odoo', 'Docker indisponible', 'ODOO-LIMIT-NO-INSTANCE');
    receipt.ecrire('devis-functional.json', Date.now() - started);
    process.exit(1);
  }

  await withInstance(async ({ browser, env }) => {
    const editor = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await editor.context.newPage();
      const frame = await enterEditor(page, env);
      if (!frame) {
        receipt.saute('éditeur Devis', 'iframe de page ou builder absent', 'ODOO-LIMIT-EDITOR-ENTRY');
        return;
      }
      await insertDevis(page);
      await insertDevis(page);
      const roots = frame.locator(ROOT);
      const first = roots.first();
      const second = roots.nth(1);
      receipt.constateSi('catalogue — deux Devis indépendants sont insérés', await roots.count() === 2, '2 racines', `${await roots.count()} racine(s)`);

      await select(frame, first);
      await panel(page).getByRole('button', { name: 'Remplacer' }).waitFor({ state: 'visible', timeout: 10_000 });
      const controls = await panel(page).locator('[data-pqr-control]').evaluateAll((nodes: Element[]) =>
        [...new Set(nodes.map((node) => node.getAttribute('data-pqr-control')).filter(Boolean))].sort(),
      );
      receipt.constateSi('panneau — inventaire Devis strict', JSON.stringify(controls) === JSON.stringify([...fixture.expectedControls].sort()), fixture.expectedControls.join(', '), controls.join(', '));
      const rootActions = ((await first.getAttribute('data-pqr-root-actions')) ?? '').split(/\s+/).filter(Boolean).sort();
      receipt.constateSi('racine — seuls move, duplicate et remove sont déclarés', JSON.stringify(rootActions) === JSON.stringify([...fixture.rootActions].sort()), fixture.rootActions.join(', '), rootActions.join(', '));
      const forbiddenVisible = {
        'save-as-custom': await visibleCount(page, '.oe_snippet_save'),
        resize: await visibleCount(page, '.oe_overlay.oe_active .o_handle:not(.readonly):not(.d-none)'),
        anchor: await visibleCount(page, '.oe_snippet_anchor'),
        background: await panel(page).locator('button, input, select, textarea, [role="button"], [role="combobox"]').evaluateAll((nodes: Element[]) => nodes.filter((node) => /background|arrière-plan|fond/i.test(`${node.getAttribute('aria-label') ?? ''} ${node.getAttribute('title') ?? ''} ${(node as HTMLElement).innerText ?? ''}`) && (node as HTMLElement).offsetParent !== null).length),
      };
      const leaked = fixture.forbiddenRootActions.filter((name: keyof typeof forbiddenVisible) => forbiddenVisible[name] > 0);
      receipt.constateSi('racine — actions Odoo interdites absentes', leaked.length === 0, 'save-as-custom, resize, background, anchor absents', leaked.length ? leaked.join(', ') : JSON.stringify(forbiddenVisible));

      await first.locator('[data-pqr-part="devis-title"]').fill('Devis instance A');
      await first.locator('[data-pqr-part="devis-cta"] [data-pqr-part="button-label"]').fill('CTA instance A');
      await select(frame, second);
      await second.locator('[data-pqr-part="devis-title"]').fill('Devis instance B');
      await second.locator('[data-pqr-part="devis-cta"] [data-pqr-part="button-label"]').fill('CTA instance B');

      // Fermeture structurelle : le conteneur, le voile et le plan photo ne
      // sont pas éditables — seule la paire titre/CTA l'est.
      const editablesA = await first.locator('[contenteditable="true"]').evaluateAll((nodes: Element[]) =>
        nodes.map((node) => node.getAttribute('data-pqr-part') ?? node.className).sort(),
      );
      receipt.constateSi('fermeture — seuls le titre et le libellé CTA sont contenteditable', JSON.stringify(editablesA) === JSON.stringify(['button-label', 'devis-title']), 'devis-title + button-label', JSON.stringify(editablesA));

      // Chemin média nº 1 : upload. L'alt reste vide — alternative décorative
      // valide, déclarée par le contrat.
      await select(frame, first);
      await panel(page).getByRole('button', { name: 'Remplacer' }).click();
      const mediaDialog = page.locator('.modal').filter({ has: page.locator('.o_select_media_dialog') }).last();
      await mediaDialog.waitFor({ state: 'visible', timeout: 10_000 });
      const tabs = (await mediaDialog.locator('.o_select_media_dialog .nav-link').allTextContents()).map((text) => text.trim());
      receipt.constateSi('média — dialogue Odoo limité aux images', tabs.length === 1 && tabs[0] === 'Images', 'Images seulement', tabs.join(', ') || '(aucun)');
      await mediaDialog.locator('input.o_file_input').setInputFiles(UPLOAD_IMAGE);
      await mediaDialog.waitFor({ state: 'hidden', timeout: 30_000 });
      await page.waitForTimeout(300);
      const backgroundImage = first.locator('[data-pqr-part="devis-background"]');
      const firstUploadedSource = await backgroundImage.getAttribute('src');
      receipt.constateSi('média — upload appliqué avec alt décoratif vide', Boolean(firstUploadedSource) && (await readState(frame))[0].alt === '', 'source posée · alt=""', JSON.stringify((await readState(frame))[0]));

      // Chemin média nº 2 : un second upload, puis la PREMIÈRE image
      // resélectionnée comme pièce jointe EXISTANTE — deux chemins distincts,
      // sources réellement comparées (leçon Équipe, 2026-08-11).
      await select(frame, first);
      await panel(page).getByRole('button', { name: 'Remplacer' }).click();
      const secondDialog = page.locator('.modal').filter({ has: page.locator('.o_select_media_dialog') }).last();
      await secondDialog.waitFor({ state: 'visible', timeout: 10_000 });
      await secondDialog.locator('input.o_file_input').setInputFiles(SECOND_UPLOAD_IMAGE);
      await secondDialog.waitFor({ state: 'hidden', timeout: 30_000 });
      await page.waitForTimeout(300);
      const secondUploadedSource = await backgroundImage.getAttribute('src');

      await select(frame, first);
      await panel(page).getByRole('button', { name: 'Remplacer' }).click();
      const libraryDialog = page.locator('.modal').filter({ has: page.locator('.o_select_media_dialog') }).last();
      await libraryDialog.waitFor({ state: 'visible', timeout: 10_000 });
      const existingHome = libraryDialog.locator('.o_existing_attachment_cell.o_we_image.o_loaded button.o_button_area[aria-label="home-light.png"]').first();
      await existingHome.waitFor({ state: 'visible', timeout: 30_000 });
      await existingHome.click();
      await libraryDialog.waitFor({ state: 'hidden', timeout: 30_000 });
      await page.waitForTimeout(300);
      const existingSelectedSource = await backgroundImage.getAttribute('src');
      receipt.constateSi(
        'média — pièce jointe existante distincte du second upload',
        Boolean(secondUploadedSource && existingSelectedSource && existingSelectedSource !== secondUploadedSource && firstUploadedSource !== secondUploadedSource),
        'trois sources, deux chemins réellement exercés',
        JSON.stringify({ firstUploadedSource, secondUploadedSource, existingSelectedSource }),
      );

      await select(frame, first);
      const alt = panel(page).locator('[data-pqr-control="devis-background-alt"] input').first();
      await alt.fill('Fond du bloc Devis');
      await alt.press('Tab');
      await page.waitForTimeout(200);
      const edited = await readState(frame);
      const firstMediaSafe = /\/web\/(image|content)\//.test(edited[0].source) ||
        (edited[0].pending && edited[0].source === 'data:image/*;base64,…');
      receipt.constateSi('édition et média — A/B restent isolés', edited.length === 2 && edited[0].title === 'Devis instance A' && edited[1].title === 'Devis instance B' && firstMediaSafe && edited[0].alt === 'Fond du bloc Devis' && !edited[1].source, 'A édité avec média Odoo · B édité sans média', JSON.stringify(edited));

      // Clic sur la zone du bitmap : par contrat, le voile couvre la photo —
      // c'est LUI la surface de clic sur toute la zone image. Aucun conteneur
      // image natif ne doit s'ouvrir, ni par ce clic ni par la sélection.
      await first.click({ position: { x: 40, y: 130 } });
      await page.waitForTimeout(250);
      const canvasPanelText = (await page.locator('.options-container:visible').allInnerTexts())
        .join(' ')
        .replace(/\s+/g, ' ')
        .toLowerCase();
      const exposedNativeImageOptions = fixture.forbiddenNativeOptions.filter((label: string) =>
        canvasPanelText.includes(label.toLowerCase()),
      );
      receipt.constateSi(
        'canvas fond — aucun outil image natif au clic sur la zone du bitmap',
        exposedNativeImageOptions.length === 0,
        'replace/crop/filter/link/shape/format/style absents',
        exposedNativeImageOptions.length ? exposedNativeImageOptions.join(', ') : 'aucune option native',
      );

      // Zone texte SIMPLE : une charge riche/hostile injectée dans le titre doit
      // être dépliée au save par la garde (allowlist vide, data-pqr-marks="").
      const title = first.locator('[data-pqr-part="devis-title"]');
      await title.evaluate((node) => {
        const target = node as HTMLElement; target.focus();
        const range = document.createRange(); range.selectNodeContents(target);
        const selection = window.getSelection(); selection?.removeAllRanges(); selection?.addRange(range);
        document.execCommand('insertHTML', false, '<strong>Titre A gras interdit</strong><em>italique interdit</em><a href="javascript:alert(1)" onclick="alert(1)">hostile</a>');
      });
      await page.waitForTimeout(150);
      const save = page.locator('.o-snippets-top-actions button[data-action="save"]').first();
      const responsePromise = page.waitForResponse((response) => response.url().includes('/web/dataset/call_kw/ir.ui.view/save'), { timeout: 30_000 }).catch(() => null);
      await save.click();
      const response = await responsePromise;
      receipt.constateSi('save — Odoo persiste les deux Devis', response !== null && response.ok(), 'RPC save 2xx', response ? `HTTP ${response.status()}` : 'aucun RPC');
    } finally {
      await editor.context.close();
    }

    const publicSession = await ouvrirSessionPublique(browser);
    try {
      const page = await publicSession.context.newPage();
      const response = await page.goto(`${baseUrl(env)}${HARNESS_PATH}?qa=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
      const state = await readState(page);
      const safety = await page.locator(ROOT).first().evaluate((root) => ({
        titleMarks: root.querySelectorAll('[data-pqr-part="devis-title"] strong, [data-pqr-part="devis-title"] em, [data-pqr-part="devis-title"] a').length,
        scripts: root.querySelectorAll('script').length,
        handlers: [...root.querySelectorAll('*')].flatMap((node) => node.getAttributeNames().filter((name) => /^on/i.test(name))),
        executableUrls: [...root.querySelectorAll('[href], [src]')].map((node) => node.getAttribute('href') ?? node.getAttribute('src') ?? '').filter((value) => /^\s*(javascript|data|vbscript):/i.test(value)),
      }));
      const layout = await responsive(page);
      receipt.artefact(path.join(PROOFS, 'devis-functional.public.json'), Buffer.from(JSON.stringify({ status: response?.status(), state, safety, layout }, null, 2) + '\n'), 'json');
      receipt.constateSi('public — contenu, média same-origin et isolation persistent', response?.status() === 200 && state.length === 2 && state[0].title.includes('Titre A gras interdit') && /\/web\/(image|content)\//.test(state[0].source) && state[0].alt === 'Fond du bloc Devis' && state[1].title === 'Devis instance B' && !state[1].source && state.every((item: any) => item.fond && item.veil), 'HTTP 200 · A avec média · B sans média · data-fond et voile présents', JSON.stringify(state));
      receipt.constateSi('public — titre simple déplié, aucune charge exécutable', safety.titleMarks === 0 && safety.scripts === 0 && safety.handlers.length === 0 && safety.executableUrls.length === 0, '0 balise riche · 0 script/handler/URL hostile', JSON.stringify(safety));
      receipt.constateSi('responsive — plans de fond et contenu tiennent à 1728/1440', layout.length === 2 && layout.every((item: any) => !item.missing && item.overflow <= 0.5 && item.backgroundDelta <= 0.5 && item.veilDelta <= 0.5 && item.titleInside && item.ctaInside && item.ctaWhiteSpace === 'nowrap') && Math.abs((layout[0] as any).rootHeight - (layout[1] as any).rootHeight) <= 0.5, 'plans pleine boîte · contenu contenu · hauteur stable', JSON.stringify(layout));
    } finally {
      await publicSession.context.close();
    }

    const reopened = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await reopened.context.newPage();
      const frame = await enterEditor(page, env);
      const state = frame ? await readState(frame) : [];
      receipt.constateSi('éditeur rouvert — DOM sauvegardé relu sans état parallèle', state.length === 2 && state[0].title.includes('Titre A gras interdit') && state[0].alt === 'Fond du bloc Devis' && state[1].title === 'Devis instance B', '2 Devis et média A relus', JSON.stringify(state));
    } finally {
      await reopened.context.close();
    }
  });

  const done = receipt.ecrire('devis-functional.json', Date.now() - started);
  process.exit(done.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => { console.error(`✖ ${error instanceof Error ? error.message : String(error)}`); process.exit(1); });
}
