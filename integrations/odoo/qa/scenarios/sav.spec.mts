/**
 * Qualification fonctionnelle + sécurité de la racine SAV. Spec 019, extension SAV.
 *
 * Ce que ce scénario prouve sur instance propre, et que le spike ne couvrait pas :
 *   · l'inventaire STRICT du panneau et l'absence des actions racine interdites ;
 *   · l'isolation A/B sous édition réelle (titres, texte, CTA, médias) ;
 *   · les DEUX plans média avec leurs DEUX alternatives, sources comparées ;
 *   · la charge hostile via insertHTML : `strong` et `br` déclarés survivent,
 *     `em`, lien `javascript:` et handlers sont neutralisés à la sortie ;
 *   · le public anonyme (contenu, same-origin, responsive 1728/1440) ;
 *   · la relecture éditeur sans état parallèle.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Frame, Page } from 'playwright-core';
import { PROOFS, REPO, Recueil } from '../lib/receipt.mts';
import {
  EDITOR_TIMEOUT_MS, NAV_TIMEOUT_MS, baseUrl, dockerDisponible,
  ouvrirSessionEditeur, ouvrirSessionPublique, withInstance, type QaEnv,
} from '../run.mts';

const ROOT = '.s_pqr_sav';
const HARNESS_PATH = '/piqueray-harness/sav';
const fixture = JSON.parse(readFileSync(path.join(REPO, 'integrations/odoo/qa/fixtures/sav-panel.json'), 'utf8'));
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

async function insertSav(page: Page): Promise<void> {
  const content = page.locator('.o_snippet_thumbnail')
    .filter({ has: page.locator('.o_snippet_thumbnail_title', { hasText: 'Content' }) }).first();
  await content.locator('button').click();
  const dialog = page.locator('.modal').last();
  await dialog.locator('input[type="search"]').fill('SAV');
  await page.waitForTimeout(300);
  const chooser = await dialog.locator('iframe').contentFrame();
  if (!chooser) throw new Error('Iframe du catalogue Website absente.');
  await chooser.locator('[aria-label="Piqueray · SAV"]').evaluate((node) => (node as HTMLElement).click());
  await page.waitForTimeout(400);
}

const panel = (page: Page) => page.locator('.options-container:visible')
  .filter({ has: page.locator('[data-pqr-control="sav-body"]') }).first();

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
    const texte = root.querySelector('[data-pqr-part="sav-text"]');
    const photoEl = root.querySelector('[data-pqr-part="sav-photo"]') as HTMLImageElement | null;
    const fondEl = root.querySelector('[data-pqr-part="sav-background"]') as HTMLImageElement | null;
    const photoRaw = photoEl?.getAttribute('src') ?? '';
    const photoPending = photoEl?.classList.contains('o_modified_image_to_save') ?? false;
    const fondRaw = fondEl?.getAttribute('src') ?? '';
    const fondPending = fondEl?.classList.contains('o_modified_image_to_save') ?? false;
    return {
      title: root.querySelector('[data-pqr-part="sav-title"]')?.textContent?.trim() ?? '',
      texte: texte?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
      br: texte ? texte.querySelectorAll('br').length : -1,
      strong: texte ? texte.querySelectorAll('strong, b').length : -1,
      forbidden: texte ? texte.querySelectorAll('em, i, a, script').length : -1,
      label: root.querySelector('[data-pqr-part="sav-cta"] [data-pqr-part="button-label"]')?.textContent?.trim() ?? '',
      photo: {
        source: photoPending && photoRaw.startsWith('data:image/') ? 'data:image/*;base64,…' : photoRaw,
        alt: photoEl?.getAttribute('alt') ?? '',
        pending: photoPending,
      },
      fond: {
        source: fondPending && fondRaw.startsWith('data:image/') ? 'data:image/*;base64,…' : fondRaw,
        alt: fondEl?.getAttribute('alt') ?? '',
        pending: fondPending,
      },
    };
  }));
}

async function responsive(page: Page) {
  const result = [];
  for (const width of [1728, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    result.push(await page.locator(ROOT).first().evaluate((root, viewportWidth) => {
      const host = root as HTMLElement;
      const section = host.querySelector<HTMLElement>('[data-pqr-part="sav-section"]');
      const fond = host.querySelector<HTMLElement>('[data-pqr-part="sav-background"]');
      const wrapper = host.querySelector<HTMLElement>('[data-pqr-part="sav-wrapper"]');
      const imgGroup = host.querySelector<HTMLElement>('[data-pqr-part="sav-img-group"]');
      const texte = host.querySelector<HTMLElement>('[data-pqr-part="sav-text"]');
      const cta = host.querySelector<HTMLElement>('[data-pqr-part="sav-cta"] [data-pqr-part="button-root"]');
      if (!section || !fond || !wrapper || !imgGroup || !texte || !cta) return { width: viewportWidth, missing: true };
      const rr = section.getBoundingClientRect();
      const fr = fond.getBoundingClientRect();
      const wr = wrapper.getBoundingClientRect();
      const ir = imgGroup.getBoundingClientRect();
      const tr = texte.getBoundingClientRect();
      const cr = cta.getBoundingClientRect();
      return {
        width: viewportWidth,
        sectionHeight: rr.height,
        overflow: host.scrollWidth - host.clientWidth,
        fondDelta: Math.max(Math.abs(fr.left - rr.left), Math.abs(fr.right - rr.right), Math.abs(fr.top - rr.top), Math.abs(fr.bottom - rr.bottom)),
        colonnesCoteACote: wr.right <= ir.left + 0.5 && Math.abs(wr.top - ir.top) <= 0.5,
        texteInside: tr.left >= rr.left - 0.5 && tr.right <= rr.right + 0.5,
        ctaInside: cr.left >= rr.left - 0.5 && cr.right <= rr.right + 0.5,
        texteWhiteSpace: getComputedStyle(texte).whiteSpace,
      };
    }, width));
  }
  return result;
}

async function main() {
  const started = Date.now();
  const receipt = new Recueil('sav-functional-security', 'odoo-019-foundation', 'sav-panel');
  if (!dockerDisponible()) {
    receipt.saute('qualification SAV sur Odoo', 'Docker indisponible', 'ODOO-LIMIT-NO-INSTANCE');
    receipt.ecrire('sav-functional.json', Date.now() - started);
    process.exit(1);
  }

  await withInstance(async ({ browser, env }) => {
    const editor = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await editor.context.newPage();
      const frame = await enterEditor(page, env);
      if (!frame) {
        receipt.saute('éditeur SAV', 'iframe de page ou builder absent', 'ODOO-LIMIT-EDITOR-ENTRY');
        return;
      }
      await insertSav(page);
      await insertSav(page);
      const roots = frame.locator(ROOT);
      const first = roots.first();
      const second = roots.nth(1);
      receipt.constateSi('catalogue — deux SAV indépendants sont insérés', await roots.count() === 2, '2 racines', `${await roots.count()} racine(s)`);

      await select(frame, first);
      await panel(page).getByRole('button', { name: 'Remplacer' }).first().waitFor({ state: 'visible', timeout: 10_000 });
      const controls = await panel(page).locator('[data-pqr-control]').evaluateAll((nodes: Element[]) =>
        [...new Set(nodes.map((node) => node.getAttribute('data-pqr-control')).filter(Boolean))].sort(),
      );
      receipt.constateSi('panneau — inventaire SAV strict', JSON.stringify(controls) === JSON.stringify([...fixture.rootControls].sort()), fixture.rootControls.join(', '), controls.join(', '));
      const rootActions = ((await first.getAttribute('data-pqr-root-actions')) ?? '').split(/\s+/).filter(Boolean).sort();
      receipt.constateSi('racine — seuls move, duplicate et remove sont déclarés', JSON.stringify(rootActions) === JSON.stringify([...fixture.rootActions].sort()), fixture.rootActions.join(', '), rootActions.join(', '));
      const forbiddenVisible = {
        'save-as-custom': await visibleCount(page, '.oe_snippet_save'),
        resize: await visibleCount(page, '.oe_overlay.oe_active .o_handle:not(.readonly):not(.d-none)'),
        anchor: await visibleCount(page, '.oe_snippet_anchor'),
        background: await panel(page).locator('button, input, select, textarea, [role="button"], [role="combobox"]').evaluateAll((nodes: Element[]) => nodes.filter((node) => /arrière-plan|\bfond de page\b|\bbackground\b/i.test(`${node.getAttribute('aria-label') ?? ''} ${node.getAttribute('title') ?? ''}`) && (node as HTMLElement).offsetParent !== null).length),
      };
      const leaked = fixture.forbiddenRootActions.filter((name: keyof typeof forbiddenVisible) => forbiddenVisible[name] > 0);
      receipt.constateSi('racine — actions Odoo interdites absentes', leaked.length === 0, 'save-as-custom, resize, background, anchor absents', leaked.length ? leaked.join(', ') : JSON.stringify(forbiddenVisible));

      await first.locator('[data-pqr-part="sav-title"]').fill('SAV instance A');
      await first.locator('[data-pqr-part="sav-cta"] [data-pqr-part="button-label"]').fill('CTA instance A');
      await select(frame, second);
      await second.locator('[data-pqr-part="sav-title"]').fill('SAV instance B');
      await second.locator('[data-pqr-part="sav-cta"] [data-pqr-part="button-label"]').fill('CTA instance B');

      // Plan 1/2 — la PHOTO de A, puis son alternative par le panneau.
      await select(frame, first);
      await panel(page).locator('[data-pqr-control="sav-photo-url"]').getByRole('button', { name: 'Remplacer' }).click();
      const dialoguePhoto = page.locator('.modal').filter({ has: page.locator('.o_select_media_dialog') }).last();
      await dialoguePhoto.waitFor({ state: 'visible', timeout: 10_000 });
      const tabs = (await dialoguePhoto.locator('.o_select_media_dialog .nav-link').allTextContents()).map((text) => text.trim());
      receipt.constateSi('média — dialogue Odoo limité aux images', tabs.length === 1 && tabs[0] === 'Images', 'Images seulement', tabs.join(', ') || '(aucun)');
      await dialoguePhoto.locator('input.o_file_input').setInputFiles(UPLOAD_IMAGE);
      await dialoguePhoto.waitFor({ state: 'hidden', timeout: 30_000 });
      await page.waitForTimeout(300);
      await select(frame, first);
      const altPhoto = panel(page).locator('[data-pqr-control="sav-photo-alt"] input').first();
      await altPhoto.fill('Technicien Piqueray en intervention');
      await altPhoto.press('Tab');
      await page.waitForTimeout(200);

      // Plan 2/2 — le FOND de A avec une image DIFFÉRENTE, puis son alternative.
      await select(frame, first);
      await panel(page).locator('[data-pqr-control="sav-background-url"]').getByRole('button', { name: 'Remplacer' }).click();
      const dialogueFond = page.locator('.modal').filter({ has: page.locator('.o_select_media_dialog') }).last();
      await dialogueFond.waitFor({ state: 'visible', timeout: 10_000 });
      await dialogueFond.locator('input.o_file_input').setInputFiles(SECOND_UPLOAD_IMAGE);
      await dialogueFond.waitFor({ state: 'hidden', timeout: 30_000 });
      await page.waitForTimeout(300);
      await select(frame, first);
      const altFond = panel(page).locator('[data-pqr-control="sav-background-alt"] input').first();
      await altFond.fill('Atelier Piqueray');
      await altFond.press('Tab');
      await page.waitForTimeout(200);

      const edited = await readState(frame);
      const mediaSafe = (plane: { source: string; pending: boolean }) =>
        /\/web\/(image|content)\//.test(plane.source) || (plane.pending && plane.source === 'data:image/*;base64,…');
      // En état pending natif, les deux sources sont masquées vers le MÊME
      // placeholder : l'inégalité ne se juge qu'une fois les URLs finalisées —
      // le constat public la prouve sur les vraies adresses /web/.
      const distinctsSiFinalises = edited[0].photo.pending || edited[0].fond.pending ||
        edited[0].photo.source !== edited[0].fond.source;
      receipt.constateSi(
        'édition et médias — deux plans remplis sur A, B totalement isolée',
        edited.length === 2 && edited[0].title === 'SAV instance A' && edited[1].title === 'SAV instance B' &&
          mediaSafe(edited[0].photo) && mediaSafe(edited[0].fond) && distinctsSiFinalises &&
          edited[0].photo.alt === 'Technicien Piqueray en intervention' && edited[0].fond.alt === 'Atelier Piqueray' &&
          !edited[1].photo.source && !edited[1].fond.source,
        'A : 2 médias remplis (Odoo publié ou pending natif) + 2 alts · B : aucun média',
        JSON.stringify(edited.map((r: any) => ({ title: r.title, photo: r.photo, fond: r.fond }))),
      );

      // Charge hostile par la voie d'insertion riche : `strong` et `br` sont
      // déclarés (data-pqr-marks="strong,line-break") et doivent survivre ;
      // `em`, le lien exécutable et le handler doivent être neutralisés au save.
      const rich = first.locator('[data-pqr-part="sav-text"]');
      await rich.evaluate((node) => {
        const target = node as HTMLElement; target.focus();
        const range = document.createRange(); range.selectNodeContents(target);
        const selection = window.getSelection(); selection?.removeAllRanges(); selection?.addRange(range);
        document.execCommand('insertHTML', false, '<strong>Texte sûr</strong><br><em>interdit</em><a href="javascript:alert(1)" onclick="alert(1)">hostile</a>');
      });
      await page.waitForTimeout(150);
      const save = page.locator('.o-snippets-top-actions button[data-action="save"]').first();
      const responsePromise = page.waitForResponse((response) => response.url().includes('/web/dataset/call_kw/ir.ui.view/save'), { timeout: 30_000 }).catch(() => null);
      await save.click();
      const response = await responsePromise;
      receipt.constateSi('save — Odoo persiste les deux SAV', response !== null && response.ok(), 'RPC save 2xx', response ? `HTTP ${response.status()}` : 'aucun RPC');
    } finally {
      await editor.context.close();
    }

    const publicSession = await ouvrirSessionPublique(browser);
    try {
      const page = await publicSession.context.newPage();
      const response = await page.goto(`${baseUrl(env)}${HARNESS_PATH}?qa=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
      const state = await readState(page);
      const safety = await page.locator(ROOT).first().evaluate((root) => ({
        handlers: [...root.querySelectorAll('*')].flatMap((node) => node.getAttributeNames().filter((name) => /^on/i.test(name))),
        executableUrls: [...root.querySelectorAll('[href], [src]')].map((node) => node.getAttribute('href') ?? node.getAttribute('src') ?? '').filter((value) => /^\s*(javascript|data|vbscript):/i.test(value)),
      }));
      const layout = await responsive(page);
      receipt.artefact(path.join(PROOFS, 'sav-functional.public.json'), Buffer.from(JSON.stringify({ status: response?.status(), state, safety, layout }, null, 2) + '\n'), 'json');
      receipt.constateSi(
        'public — contenu, deux médias same-origin distincts et isolation persistent',
        response?.status() === 200 && state.length === 2 && state[0].title === 'SAV instance A' &&
          /\/web\/(image|content)\//.test(state[0].photo.source) && /\/web\/(image|content)\//.test(state[0].fond.source) &&
          state[0].photo.source !== state[0].fond.source &&
          state[0].photo.alt === 'Technicien Piqueray en intervention' && state[0].fond.alt === 'Atelier Piqueray' &&
          state[1].title === 'SAV instance B' && !state[1].photo.source && !state[1].fond.source,
        'HTTP 200 · A : 2 médias /web/ distincts + alts · B sans média',
        JSON.stringify(state.map((r: any) => ({ title: r.title, photo: r.photo, fond: r.fond }))),
      );
      receipt.constateSi(
        'public — strong et br déclarés survivent, em/lien/handler neutralisés',
        state[0].strong === 1 && state[0].br === 1 && state[0].forbidden === 0 &&
          safety.handlers.length === 0 && safety.executableUrls.length === 0,
        '1 strong · 1 br · 0 em/a/script · 0 handler/URL hostile',
        JSON.stringify({ strong: state[0].strong, br: state[0].br, forbidden: state[0].forbidden, safety }),
      );
      receipt.constateSi(
        'responsive — hauteur contractuelle, fond couvrant et colonnes côte à côte à 1728/1440',
        layout.length === 2 && layout.every((item: any) => !item.missing && item.sectionHeight === 677 && item.overflow <= 0.5 && item.fondDelta <= 0.5 && item.colonnesCoteACote && item.texteInside && item.ctaInside && item.texteWhiteSpace === 'pre-line'),
        'hauteur 677 · 0 overflow · fond couvrant · 2 colonnes · pre-line',
        JSON.stringify(layout),
      );
    } finally {
      await publicSession.context.close();
    }

    const reopened = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await reopened.context.newPage();
      const frame = await enterEditor(page, env);
      const state = frame ? await readState(frame) : [];
      receipt.constateSi(
        'éditeur rouvert — DOM sauvegardé relu sans état parallèle',
        state.length === 2 && state[0].title === 'SAV instance A' && state[0].photo.alt === 'Technicien Piqueray en intervention' &&
          state[0].fond.alt === 'Atelier Piqueray' && state[0].br === 1 && state[1].title === 'SAV instance B',
        '2 SAV relus, médias et br de A conservés',
        JSON.stringify(state.map((r: any) => ({ title: r.title, br: r.br, photoAlt: r.photo.alt, fondAlt: r.fond.alt }))),
      );
    } finally {
      await reopened.context.close();
    }
  });

  const done = receipt.ecrire('sav-functional.json', Date.now() - started);
  process.exit(done.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => { console.error(`✖ ${error instanceof Error ? error.message : String(error)}`); process.exit(1); });
}
