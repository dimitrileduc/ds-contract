import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Frame, Page } from 'playwright-core';
import { PROOFS, REPO, Recueil } from '../lib/receipt.mts';
import {
  EDITOR_TIMEOUT_MS, NAV_TIMEOUT_MS, baseUrl, dockerDisponible,
  ouvrirSessionEditeur, ouvrirSessionPublique, withInstance, type QaEnv,
} from '../run.mts';

const ROOT = '.s_pqr_hero';
const HARNESS_PATH = '/piqueray-harness/hero';
const fixture = JSON.parse(readFileSync(path.join(REPO, 'integrations/odoo/qa/fixtures/hero-panel.json'), 'utf8'));
const UPLOAD_IMAGE = path.join(REPO, 'site/docs-shots/home-light.png');

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

async function insertHero(page: Page): Promise<void> {
  const content = page.locator('.o_snippet_thumbnail')
    .filter({ has: page.locator('.o_snippet_thumbnail_title', { hasText: 'Content' }) }).first();
  await content.locator('button').click();
  const dialog = page.locator('.modal').last();
  await dialog.locator('input[type="search"]').fill('Hero');
  await page.waitForTimeout(300);
  const chooser = await dialog.locator('iframe').contentFrame();
  if (!chooser) throw new Error('Iframe du catalogue Website absente.');
  await chooser.locator('[aria-label="Piqueray · Hero"]').evaluate((node) => (node as HTMLElement).click());
  await page.waitForTimeout(400);
}

const panel = (page: Page) => page.locator('.options-container:visible')
  .filter({ has: page.locator('[data-pqr-control="hero-background-url"]') }).first();

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
    const image = root.querySelector('[data-pqr-part="hero-background"]') as HTMLImageElement | null;
    const rawSource = image?.getAttribute('src') ?? '';
    const pending = image?.classList.contains('o_modified_image_to_save') ?? false;
    return {
      title: root.querySelector('[data-pqr-part="hero-title"]')?.textContent?.trim() ?? '',
      subtitle: root.querySelector('[data-pqr-part="hero-subtitle"]')?.textContent?.trim() ?? '',
      label: root.querySelector('[data-pqr-part="hero-cta"] [data-pqr-part="button-label"]')?.textContent?.trim() ?? '',
      source: pending && rawSource.startsWith('data:image/') ? 'data:image/*;base64,…' : rawSource,
      alt: image?.getAttribute('alt') ?? '',
      pending,
    };
  }));
}

async function responsive(page: Page) {
  const result = [];
  for (const width of [1728, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    result.push(await page.locator(ROOT).first().evaluate((root, viewportWidth) => {
      const host = root as HTMLElement;
      const background = host.querySelector<HTMLElement>('[data-pqr-part="hero-background"]');
      const content = host.querySelector<HTMLElement>('[data-pqr-part="hero-content"]');
      const wrapper = host.querySelector<HTMLElement>('[data-pqr-part="hero-wrapper"]');
      const subtitle = host.querySelector<HTMLElement>('[data-pqr-part="hero-subtitle"]');
      const button = host.querySelector<HTMLElement>('[data-pqr-part="button-root"]');
      if (!background || !content || !wrapper || !subtitle || !button) return { width: viewportWidth, missing: true };
      const rr = host.getBoundingClientRect();
      const br = background.getBoundingClientRect();
      const sr = subtitle.getBoundingClientRect();
      const cr = button.getBoundingClientRect();
      return {
        width: viewportWidth,
        rootWidth: rr.width,
        rootHeight: rr.height,
        overflow: host.scrollWidth - host.clientWidth,
        backgroundDelta: Math.max(Math.abs(br.left - rr.left), Math.abs(br.right - rr.right), Math.abs(br.top - rr.top), Math.abs(br.bottom - rr.bottom)),
        contentWidth: content.getBoundingClientRect().width,
        wrapperWidth: wrapper.getBoundingClientRect().width,
        subtitleInside: sr.left >= rr.left - 0.5 && sr.right <= rr.right + 0.5,
        ctaInside: cr.left >= rr.left - 0.5 && cr.right <= rr.right + 0.5,
        ctaWhiteSpace: getComputedStyle(button).whiteSpace,
      };
    }, width));
  }
  return result;
}

async function main() {
  const started = Date.now();
  const receipt = new Recueil('hero-functional-security', 'odoo-019-foundation', 'hero-panel');
  if (!dockerDisponible()) {
    receipt.saute('qualification Hero sur Odoo', 'Docker indisponible', 'ODOO-LIMIT-NO-INSTANCE');
    receipt.ecrire('hero-functional.json', Date.now() - started);
    process.exit(1);
  }

  await withInstance(async ({ browser, env }) => {
    const editor = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await editor.context.newPage();
      const frame = await enterEditor(page, env);
      if (!frame) {
        receipt.saute('éditeur Hero', 'iframe de page ou builder absent', 'ODOO-LIMIT-EDITOR-ENTRY');
        return;
      }
      await insertHero(page);
      await insertHero(page);
      const roots = frame.locator(ROOT);
      const first = roots.first();
      const second = roots.nth(1);
      receipt.constateSi('catalogue — deux Hero indépendants sont insérés', await roots.count() === 2, '2 racines', `${await roots.count()} racine(s)`);

      await select(frame, first);
      await panel(page).getByRole('button', { name: 'Remplacer' }).waitFor({ state: 'visible', timeout: 10_000 });
      const controls = await panel(page).locator('[data-pqr-control]').evaluateAll((nodes: Element[]) =>
        [...new Set(nodes.map((node) => node.getAttribute('data-pqr-control')).filter(Boolean))].sort(),
      );
      receipt.constateSi('panneau — inventaire Hero strict', JSON.stringify(controls) === JSON.stringify([...fixture.expectedControls].sort()), fixture.expectedControls.join(', '), controls.join(', '));
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

      await first.locator('[data-pqr-part="hero-title"]').fill('Hero instance A');
      await first.locator('[data-pqr-part="hero-subtitle"]').fill('Sous-titre instance A');
      await first.locator('[data-pqr-part="hero-cta"] [data-pqr-part="button-label"]').fill('CTA instance A');
      await select(frame, second);
      await second.locator('[data-pqr-part="hero-title"]').fill('Hero instance B');
      await second.locator('[data-pqr-part="hero-subtitle"]').fill('Sous-titre instance B');
      await second.locator('[data-pqr-part="hero-cta"] [data-pqr-part="button-label"]').fill('CTA instance B');

      await select(frame, first);
      await panel(page).getByRole('button', { name: 'Remplacer' }).click();
      const mediaDialog = page.locator('.modal').filter({ has: page.locator('.o_select_media_dialog') }).last();
      await mediaDialog.waitFor({ state: 'visible', timeout: 10_000 });
      const tabs = (await mediaDialog.locator('.o_select_media_dialog .nav-link').allTextContents()).map((text) => text.trim());
      receipt.constateSi('média — dialogue Odoo limité aux images', tabs.length === 1 && tabs[0] === 'Images', 'Images seulement', tabs.join(', ') || '(aucun)');
      await mediaDialog.locator('input.o_file_input').setInputFiles(UPLOAD_IMAGE);
      await mediaDialog.waitFor({ state: 'hidden', timeout: 30_000 });
      await page.waitForTimeout(300);
      await select(frame, first);
      const alt = panel(page).locator('[data-pqr-control="hero-background-alt"] input').first();
      await alt.fill('Atelier industriel Piqueray');
      await alt.press('Tab');
      await page.waitForTimeout(200);
      const edited = await readState(frame);
      const firstMediaSafe = /\/web\/(image|content)\//.test(edited[0].source) ||
        (edited[0].pending && edited[0].source === 'data:image/*;base64,…');
      receipt.constateSi('édition et média — A/B restent isolés', edited.length === 2 && edited[0].title === 'Hero instance A' && edited[1].title === 'Hero instance B' && firstMediaSafe && edited[0].alt === 'Atelier industriel Piqueray' && !edited[1].source, 'A édité avec média Odoo publié ou pending natif · B édité sans média', JSON.stringify(edited));

      const rich = first.locator('[data-pqr-part="hero-subtitle"]');
      await rich.evaluate((node) => {
        const target = node as HTMLElement; target.focus();
        const range = document.createRange(); range.selectNodeContents(target);
        const selection = window.getSelection(); selection?.removeAllRanges(); selection?.addRange(range);
        document.execCommand('insertHTML', false, '<strong>Texte sûr</strong><em>interdit</em><a href="javascript:alert(1)" onclick="alert(1)">hostile</a>');
      });
      await page.waitForTimeout(150);
      const save = page.locator('.o-snippets-top-actions button[data-action="save"]').first();
      const responsePromise = page.waitForResponse((response) => response.url().includes('/web/dataset/call_kw/ir.ui.view/save'), { timeout: 30_000 }).catch(() => null);
      await save.click();
      const response = await responsePromise;
      receipt.constateSi('save — Odoo persiste les deux Hero', response !== null && response.ok(), 'RPC save 2xx', response ? `HTTP ${response.status()}` : 'aucun RPC');
    } finally {
      await editor.context.close();
    }

    const publicSession = await ouvrirSessionPublique(browser);
    try {
      const page = await publicSession.context.newPage();
      const response = await page.goto(`${baseUrl(env)}${HARNESS_PATH}?qa=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
      const state = await readState(page);
      const safety = await page.locator(ROOT).first().evaluate((root) => ({
        strong: root.querySelectorAll('[data-pqr-part="hero-subtitle"] strong').length,
        forbiddenTags: root.querySelectorAll('[data-pqr-part="hero-subtitle"] em, [data-pqr-part="hero-subtitle"] a, script').length,
        handlers: [...root.querySelectorAll('*')].flatMap((node) => node.getAttributeNames().filter((name) => /^on/i.test(name))),
        executableUrls: [...root.querySelectorAll('[href], [src]')].map((node) => node.getAttribute('href') ?? node.getAttribute('src') ?? '').filter((value) => /^\s*(javascript|data|vbscript):/i.test(value)),
      }));
      const layout = await responsive(page);
      receipt.artefact(path.join(PROOFS, 'hero-functional.public.json'), Buffer.from(JSON.stringify({ status: response?.status(), state, safety, layout }, null, 2) + '\n'), 'json');
      receipt.constateSi('public — contenu, média same-origin et isolation persistent', response?.status() === 200 && state.length === 2 && state[0].title === 'Hero instance A' && /\/web\/(image|content)\//.test(state[0].source) && state[0].alt === 'Atelier industriel Piqueray' && state[1].title === 'Hero instance B' && !state[1].source, 'HTTP 200 · A avec média · B sans média', JSON.stringify(state));
      receipt.constateSi('public — rich-text strong uniquement, aucune charge exécutable', safety.strong === 1 && safety.forbiddenTags === 0 && safety.handlers.length === 0 && safety.executableUrls.length === 0, '1 strong · 0 tag/handler/URL hostile', JSON.stringify(safety));
      receipt.constateSi('responsive — Fill/Hug et plan photo tiennent à 1728/1440', layout.length === 2 && layout.every((item: any) => !item.missing && item.rootHeight === 640 && item.overflow <= 0.5 && item.backgroundDelta <= 0.5 && item.subtitleInside && item.ctaInside && item.ctaWhiteSpace === 'nowrap'), 'hauteur 640 · 0 overflow · background full · contenu et CTA contenus', JSON.stringify(layout));
    } finally {
      await publicSession.context.close();
    }

    const reopened = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await reopened.context.newPage();
      const frame = await enterEditor(page, env);
      const state = frame ? await readState(frame) : [];
      receipt.constateSi('éditeur rouvert — DOM sauvegardé relu sans état parallèle', state.length === 2 && state[0].title === 'Hero instance A' && state[0].alt === 'Atelier industriel Piqueray' && state[1].title === 'Hero instance B', '2 Hero et média A relus', JSON.stringify(state));
    } finally {
      await reopened.context.close();
    }
  });

  const done = receipt.ecrire('hero-functional.json', Date.now() - started);
  process.exit(done.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => { console.error(`✖ ${error instanceof Error ? error.message : String(error)}`); process.exit(1); });
}
