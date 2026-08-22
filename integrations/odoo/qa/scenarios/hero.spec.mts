import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Frame, Page } from 'playwright-core';
import { PROOFS, REPO, Recueil } from '../lib/receipt.mts';
import { enterEditor as enterHarnessEditor, frapperAuClicHumain, poserHref, select, visibleCount } from '../lib/editor.mts';
import {
  NAV_TIMEOUT_MS, baseUrl, dockerDisponible,
  ouvrirSessionEditeur, ouvrirSessionPublique, withInstance, type QaEnv,
} from '../run.mts';

const ROOT = '.s_pqr_hero';
const HARNESS_PATH = '/piqueray-harness/hero';
const fixture = JSON.parse(readFileSync(path.join(REPO, 'integrations/odoo/qa/fixtures/hero-panel.json'), 'utf8'));
const UPLOAD_IMAGE = path.join(REPO, 'site/docs-shots/home-light.png');

const enterEditor = (page: Page, env: QaEnv): Promise<Frame | null> => enterHarnessEditor(page, env, HARNESS_PATH);

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
      const colonneGauche = host.querySelector<HTMLElement>('[data-pqr-part="hero-left-column"]');
      const subtitle = host.querySelector<HTMLElement>('[data-pqr-part="hero-subtitle"]');
      const button = host.querySelector<HTMLElement>('[data-pqr-part="button-root"]');
      if (!background || !content || !colonneGauche || !subtitle || !button) return { width: viewportWidth, missing: true };
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
        colonneGaucheWidth: colonneGauche.getBoundingClientRect().width,
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

      // `sousTitre2` (contrat 1.6.0) : la bascule doit RETIRER le sous-titre du
      // flux, pas seulement le vider. Un texte vidé garde sa boîte de ligne —
      // 32 px en public, 96 px dans l'éditeur, mesurés le 2026-08-22 — et le bas
      // du titre ne rejoint jamais celui du CTA. C'est cet écart qu'on mesure,
      // pas la présence de la case.
      // Pas de fonction interne dans `evaluate` : tsx y injecte son helper
      // `__name`, absent du contexte de la page (ReferenceError au runtime).
      const mesureColonnes = async () => first.evaluate((root: Element) => {
        const sousTitre = root.querySelector('[data-pqr-part="hero-subtitle"]');
        const titre = root.querySelector('[data-pqr-part="hero-title"]');
        const cta = root.querySelector('[data-pqr-part="hero-cta"]');
        return {
          drapeau: root.classList.contains('pqr-soustitre-on'),
          hauteurSousTitre: sousTitre ? Math.round(sousTitre.getBoundingClientRect().height) : null,
          basTitre: titre ? Math.round(titre.getBoundingClientRect().bottom) : null,
          basCta: cta ? Math.round(cta.getBoundingClientRect().bottom) : null,
        };
      });
      const bascule = panel(page).locator('[data-pqr-control="hero-subtitle-visible"] input');
      const affiche = await mesureColonnes();
      await bascule.click();
      await page.waitForTimeout(250);
      const masque = await mesureColonnes();
      await bascule.click();
      await page.waitForTimeout(250);
      const restaure = await mesureColonnes();
      receipt.constateSi(
        'sous-titre — masqué, il quitte le flux et le bas du titre rejoint le CTA',
        affiche.drapeau && (affiche.hauteurSousTitre ?? 0) > 0 && affiche.basTitre !== affiche.basCta
          && !masque.drapeau && masque.hauteurSousTitre === 0 && masque.basTitre === masque.basCta
          && restaure.drapeau && (restaure.hauteurSousTitre ?? 0) > 0,
        'affiché : hauteur > 0 et bas différents · masqué : hauteur 0 et bas égaux · réversible',
        JSON.stringify({ affiche, masque, restaure }),
      );

      // Édition HUMAINE du libellé CTA (geste partagé — voir lib/editor.mts) :
      // ce constat échoue si le CTA redevient un contrôle qui avale la souris,
      // le bug mesuré le 2026-08-18 et corrigé en CTA-lien <a>.
      const libelleCta = first.locator('[data-pqr-part="hero-cta"] [data-pqr-part="button-label"]');
      const texteCtaApresClic = await frapperAuClicHumain(libelleCta, '•');
      receipt.constateSi('CTA — libellé éditable au clic humain', texteCtaApresClic?.includes('•') === true, 'clic souris réel puis frappe insérée dans le libellé', texteCtaApresClic === null ? 'libellé non cliquable' : `texte observé : ${texteCtaApresClic}`);

      // Le LIEN du CTA est une ADAPTATION ODOO, pas une prop de contrat : les
      // contrats ne portent aucune notion de lien et `ds.button` reste un
      // <button> sur la surface React. Sa gouvernance vit donc au registre
      // (ODOO-019-CTA-LIEN-BRIDGE), et sa grammaire est vérifiée ici : relatif
      // accepté, absolu même origine replié en relatif (l'hôte n'entre jamais
      // dans le HTML sauvegardé — patron noyau website.py:501), javascript:
      // refusé. Décidé par l'owner le 2026-08-18 (option « b »).
      await select(frame, first);
      const champHref = panel(page).locator('[data-pqr-control="hero-cta-href"] input');
      const ancreCta = first.locator('[data-pqr-part="hero-cta"] a[data-pqr-part="button-root"]');
      const hrefReplie = await poserHref(champHref, ancreCta, `${baseUrl(env)}/promo`);
      const hrefApresInjection = await poserHref(champHref, ancreCta, 'javascript:alert(1)');
      const hrefFinal = await poserHref(champHref, ancreCta, '/devis');
      receipt.constateSi('CTA — lien gouverné au panneau (relatif, origine repliée, javascript refusé)',
        hrefReplie === '/promo' && hrefApresInjection === '/promo' && hrefFinal === '/devis',
        'absolu même origine → /promo · javascript: ignoré · /devis accepté',
        `replié: ${hrefReplie} · après injection: ${hrefApresInjection} · final: ${hrefFinal}`);

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
