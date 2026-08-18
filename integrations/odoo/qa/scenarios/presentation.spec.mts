import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Frame, Locator, Page } from 'playwright-core';
import { PROOFS, REPO, Recueil } from '../lib/receipt.mts';
import { enterEditor as enterHarnessEditor, frapperAuClicHumain, poserHref, select as sharedSelect, visibleCount } from '../lib/editor.mts';
import {
  NAV_TIMEOUT_MS, baseUrl, dockerDisponible,
  ouvrirSessionEditeur, ouvrirSessionPublique, withInstance, type QaEnv,
} from '../run.mts';

const ROOT = '.s_pqr_presentation';
const HARNESS_PATH = '/piqueray-harness/presentation';
const fixture = JSON.parse(readFileSync(path.join(REPO, 'integrations/odoo/qa/fixtures/presentation-panel.json'), 'utf8'));

const enterEditor = (page: Page, env: QaEnv): Promise<Frame | null> => enterHarnessEditor(page, env, HARNESS_PATH);

async function insertPresentation(page: Page): Promise<void> {
  const content = page.locator('.o_snippet_thumbnail')
    .filter({ has: page.locator('.o_snippet_thumbnail_title', { hasText: 'Content' }) }).first();
  await content.locator('button').click();
  const dialog = page.locator('.modal').last();
  await dialog.locator('input[type="search"]').fill('Présentation');
  await page.waitForTimeout(300);
  const chooser = await dialog.locator('iframe').contentFrame();
  if (!chooser) throw new Error('Iframe du catalogue Website absente.');
  await chooser.locator('[aria-label="Piqueray · Présentation"]').evaluate((node) => (node as HTMLElement).click());
  await page.waitForTimeout(350);
}

const panel = (page: Page) => page.locator('.options-container:visible')
  .filter({ has: page.locator('[data-pqr-control="show-cta"]') }).first();

/** Le délai de pose du panneau reste celui que ce scénario a toujours utilisé. */
const select = (frame: Frame, root: Locator) => sharedSelect(frame, root, 350);

async function readState(page: { locator: (selector: string) => any }) {
  return page.locator(ROOT).evaluateAll((roots: Element[]) => roots.map((root) => ({
    title: root.querySelector('[data-pqr-part="presentation-title"]')?.textContent?.trim() ?? '',
    body: root.querySelector('[data-pqr-part="presentation-text"]')?.textContent?.trim() ?? '',
    cta: root.classList.contains('pqr-cta-on'),
    label: root.querySelector('[data-pqr-part="button-label"]')?.textContent?.trim() ?? '',
  })));
}

async function readResponsiveLayout(page: Page) {
  const widths = [1728, 1440] as const;
  const observations = [];
  for (const viewportWidth of widths) {
    await page.setViewportSize({ width: viewportWidth, height: 900 });
    const observed = await page.locator(ROOT).first().evaluate((root) => {
      const host = root as HTMLElement;
      const column = host.querySelector<HTMLElement>('[data-pqr-part="left-column"]');
      const header = host.querySelector<HTMLElement>('[data-pqr-part="section-header-root"]');
      const title = host.querySelector<HTMLElement>('[data-pqr-part="presentation-title"]');
      const button = host.querySelector<HTMLElement>('[data-pqr-part="button-root"]');
      const label = host.querySelector<HTMLElement>('[data-pqr-part="button-label"]');
      if (!column || !header || !title || !button || !label) return null;
      const rootRect = host.getBoundingClientRect();
      const columnRect = column.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      const titleRect = title.getBoundingClientRect();
      const labelRect = label.getBoundingClientRect();
      const labelStyle = getComputedStyle(label);
      const lineHeight = Number.parseFloat(labelStyle.lineHeight);
      return {
        rootWidth: rootRect.width,
        rootOverflow: host.scrollWidth - host.clientWidth,
        columnWidth: columnRect.width,
        headerWidth: headerRect.width,
        headerDelta: Math.abs(headerRect.width - columnRect.width),
        titleInside: titleRect.left >= columnRect.left - 0.5 && titleRect.right <= columnRect.right + 0.5,
        buttonWhiteSpace: getComputedStyle(button).whiteSpace,
        buttonLines: Number.isFinite(lineHeight) && lineHeight > 0 ? Math.round(labelRect.height / lineHeight) : null,
      };
    });
    observations.push({ viewportWidth, ...observed });
  }
  return observations;
}

async function main() {
  const started = Date.now();
  const receipt = new Recueil('presentation-functional-security', 'odoo-019-foundation', 'presentation-panel');
  if (!dockerDisponible()) {
    receipt.saute('qualification Presentation sur Odoo', 'Docker indisponible', 'ODOO-LIMIT-NO-INSTANCE');
    receipt.ecrire('presentation-functional.json', Date.now() - started);
    process.exit(1);
  }

  await withInstance(async ({ browser, env }) => {
    const editor = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await editor.context.newPage();
      const frame = await enterEditor(page, env);
      if (!frame) {
        receipt.saute('éditeur Presentation', 'iframe de page ou builder absent', 'ODOO-LIMIT-EDITOR-ENTRY');
        return;
      }
      await insertPresentation(page);
      await insertPresentation(page);
      const roots = frame.locator(ROOT);
      receipt.constateSi('catalogue — deux Présentations indépendantes sont insérées', await roots.count() === 2, '2 racines', `${await roots.count()} racine(s)`);

      const first = roots.first();
      const second = roots.nth(1);
      await select(frame, first);
      await panel(page).locator('[data-pqr-control="show-cta"] input').waitFor({ state: 'visible', timeout: 10_000 });
      const controls = await panel(page).locator('[data-pqr-control]').evaluateAll((nodes: Element[]) =>
        [...new Set(nodes.map((node) => node.getAttribute('data-pqr-control')).filter(Boolean))].sort(),
      );
      receipt.constateSi('panneau — inventaire Piqueray strict', JSON.stringify(controls) === JSON.stringify([...fixture.expectedControls].sort()), fixture.expectedControls.join(', '), controls.join(', '));

      const rootActions = ((await first.getAttribute('data-pqr-root-actions')) ?? '').split(/\s+/).filter(Boolean).sort();
      receipt.constateSi('racine — seuls move, duplicate et remove sont déclarés', JSON.stringify(rootActions) === JSON.stringify([...fixture.rootActions].sort()), fixture.rootActions.join(', '), rootActions.join(', '));
      const visibleForbidden = {
        'save-as-custom': await visibleCount(page, '.oe_snippet_save'),
        resize: await visibleCount(page, '.oe_overlay.oe_active .o_handle:not(.readonly):not(.d-none)'),
        anchor: await visibleCount(page, '.oe_snippet_anchor'),
        background: await panel(page).locator('button, input, select, textarea, [role="button"], [role="combobox"]').evaluateAll((nodes: Element[]) => nodes.filter((node) => /background|arrière-plan|fond/i.test(`${node.getAttribute('aria-label') ?? ''} ${node.getAttribute('title') ?? ''} ${(node as HTMLElement).innerText ?? ''}`) && (node as HTMLElement).offsetParent !== null).length),
      };
      const leaked = fixture.forbiddenRootActions.filter((name: keyof typeof visibleForbidden) => visibleForbidden[name] > 0);
      receipt.constateSi('racine — actions Odoo interdites absentes du chrome visible', leaked.length === 0, 'save-as-custom, resize, background, anchor absents', leaked.length ? leaked.join(', ') : JSON.stringify(visibleForbidden));

      // Édition HUMAINE du libellé CTA (geste partagé — voir lib/editor.mts) :
      // même mécanique de vol de focus par un ancêtre focusable que le Hero,
      // mesurée le 2026-08-18.
      const libelleCta = first.locator('[data-pqr-part="presentation-cta"] [data-pqr-part="button-label"]');
      const texteCtaApresClic = await frapperAuClicHumain(libelleCta, '•');
      receipt.constateSi('CTA — libellé éditable au clic humain', texteCtaApresClic?.includes('•') === true, 'clic souris réel puis frappe insérée dans le libellé', texteCtaApresClic === null ? 'libellé non cliquable' : `texte observé : ${texteCtaApresClic}`);

      // Le LIEN du CTA est une ADAPTATION ODOO, pas une prop de contrat :
      // aucun contrat ne porte de notion de lien et `ds.button` reste un
      // <button> côté React. Gouverné au registre (ODOO-019-CTA-LIEN-BRIDGE),
      // grammaire vérifiée ici — même porte que le Hero.
      await select(frame, first);
      const champHref = panel(page).locator('[data-pqr-control="cta-href"] input');
      const ancreCta = first.locator('[data-pqr-part="presentation-cta"] a[data-pqr-part="button-root"]');
      const hrefReplie = await poserHref(champHref, ancreCta, `${baseUrl(env)}/promo`);
      const hrefApresInjection = await poserHref(champHref, ancreCta, 'javascript:alert(1)');
      const hrefFinal = await poserHref(champHref, ancreCta, '/contact');
      receipt.constateSi('CTA — lien gouverné au panneau (relatif, origine repliée, javascript refusé)',
        hrefReplie === '/promo' && hrefApresInjection === '/promo' && hrefFinal === '/contact',
        'absolu même origine → /promo · javascript: ignoré · /contact accepté',
        `replié: ${hrefReplie} · après injection: ${hrefApresInjection} · final: ${hrefFinal}`);

      await first.locator('[data-pqr-part="presentation-title"]').fill('Titre instance A');
      await first.locator('[data-pqr-part="presentation-text"]').fill('Texte instance A');
      await first.locator('[data-pqr-part="button-label"]').fill('CTA instance A');
      await select(frame, second);
      await second.locator('[data-pqr-part="presentation-title"]').fill('Titre instance B');
      await second.locator('[data-pqr-part="presentation-text"]').fill('Texte instance B');
      await second.locator('[data-pqr-part="button-label"]').fill('CTA instance B');
      const toggle = panel(page).locator('[data-pqr-control="show-cta"] input');
      if (await toggle.isChecked()) await toggle.click();
      await page.waitForTimeout(180);
      const edited = await readState(frame);
      receipt.constateSi('édition — contenus et CTA opposés restent isolés', edited.length === 2 && edited[0].title === 'Titre instance A' && edited[0].body === 'Texte instance A' && edited[0].label === 'CTA instance A' && edited[0].cta && edited[1].title === 'Titre instance B' && edited[1].body === 'Texte instance B' && !edited[1].cta, 'A éditée CTA visible · B éditée CTA masqué', JSON.stringify(edited));

      const rich = first.locator('[data-pqr-part="presentation-text"]');
      const inserted = await rich.evaluate((node) => {
        const target = node as HTMLElement;
        target.focus();
        const range = document.createRange(); range.selectNodeContents(target);
        const selection = window.getSelection(); selection?.removeAllRanges(); selection?.addRange(range);
        return document.execCommand('insertHTML', false, '<strong>Texte sûr</strong><em>italique interdit</em><a href="javascript:alert(1)" onclick="alert(1)">lien hostile</a>');
      });
      await page.waitForTimeout(200);
      receipt.constateSi('rich-text hostile — insertion dirty exercée', inserted && await frame.locator('.o_dirty').count() > 0, 'insertHTML + dirty', `insert=${String(inserted)} dirty=${await frame.locator('.o_dirty').count()}`);

      const save = page.locator('.o-snippets-top-actions button[data-action="save"]').first();
      const responsePromise = page.waitForResponse((response) => response.url().includes('/web/dataset/call_kw/ir.ui.view/save'), { timeout: 30_000 }).catch(() => null);
      await save.click();
      const response = await responsePromise;
      receipt.constateSi('save — Odoo persiste les deux instances', response !== null && response.ok(), 'RPC save 2xx', response ? `HTTP ${response.status()}` : 'aucun RPC');
    } finally {
      await editor.context.close();
    }

    const publicSession = await ouvrirSessionPublique(browser);
    try {
      const page = await publicSession.context.newPage();
      const response = await page.goto(`${baseUrl(env)}${HARNESS_PATH}?qa=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
      const state = await readState(page);
      const safety = await page.locator(ROOT).first().evaluate((root) => ({
        strong: root.querySelectorAll('[data-pqr-part="presentation-text"] strong').length,
        forbiddenTags: root.querySelectorAll('[data-pqr-part="presentation-text"] em, [data-pqr-part="presentation-text"] a, [data-pqr-part="presentation-text"] script').length,
        handlers: [...root.querySelectorAll('*')].flatMap((node) => node.getAttributeNames().filter((name) => /^on/i.test(name))),
        executableUrls: [...root.querySelectorAll('[href], [src]')].map((node) => node.getAttribute('href') ?? node.getAttribute('src') ?? '').filter((value) => /^\s*(javascript|data|vbscript):/i.test(value)),
      }));
      const responsive = await readResponsiveLayout(page);
      receipt.artefact(path.join(PROOFS, 'presentation-functional.public.json'), Buffer.from(JSON.stringify({ status: response?.status(), state, safety, responsive }, null, 2) + '\n'), 'json');
      receipt.constateSi('public — deux instances et états CTA persistés', response?.status() === 200 && state.length === 2 && state[0].title === 'Titre instance A' && state[0].cta && state[1].title === 'Titre instance B' && !state[1].cta, 'HTTP 200 · A visible · B masqué', JSON.stringify(state));
      receipt.constateSi('public — rich-text strong uniquement et aucune charge exécutable', safety.strong === 1 && safety.forbiddenTags === 0 && safety.handlers.length === 0 && safety.executableUrls.length === 0, '1 strong · 0 tag/handler/URL hostile', JSON.stringify(safety));
      receipt.constateSi(
        'responsive — SectionHeader Fill et Button Hug tiennent à 1728/1440',
        responsive.length === 2 && responsive.every((item) => item.headerDelta !== undefined && item.headerDelta <= 0.5 && item.rootOverflow !== undefined && item.rootOverflow <= 0.5 && item.titleInside === true && item.buttonWhiteSpace === 'nowrap' && item.buttonLines === 1),
        'header=largeur colonne · 0 overflow · titre contenu · CTA nowrap sur une ligne',
        JSON.stringify(responsive),
      );
    } finally {
      await publicSession.context.close();
    }

    const reopened = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await reopened.context.newPage();
      const frame = await enterEditor(page, env);
      const state = frame ? await readState(frame) : [];
      receipt.constateSi('éditeur rouvert — DOM sauvegardé relu sans état parallèle', state.length === 2 && state[0].title === 'Titre instance A' && state[1].title === 'Titre instance B' && !state[1].cta, '2 instances et CTA opposés', JSON.stringify(state));
    } finally {
      await reopened.context.close();
    }
  });

  const done = receipt.ecrire('presentation-functional.json', Date.now() - started);
  process.exit(done.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => { console.error(`✖ ${error instanceof Error ? error.message : String(error)}`); process.exit(1); });
}
