/**
 * Scénario QA Coordonnées (spec 022, US1, FR-015). Racine posable
 * `ds.coordonnees@2.2.0` : pose, rendu par défaut, w-auto 1728/1440, éditions
 * autorisées (dont le bloc Tél/Email en liens, Q-C1), liens réseaux sociaux au
 * panneau (Q-C2), tentatives interdites (geste de texte direct sur zones non
 * éditables + gestes natifs), isolation, persistance save/reopen/public.
 *
 * Le bloc Tél/Email est aussi couvert par le spike dédié
 * (`coordonnees-spike.spec.mts`) : ici il est exercé dans le parcours complet.
 */
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

const ROOT = '.s_pqr_coordonnees';
const HARNESS_PATH = '/piqueray-harness/coordonnees';
const fixture = JSON.parse(readFileSync(path.join(REPO, 'integrations/odoo/qa/fixtures/coordonnees-panel.json'), 'utf8'));

const enterEditor = (page: Page, env: QaEnv): Promise<Frame | null> => enterHarnessEditor(page, env, HARNESS_PATH);

async function insertCoordonnees(page: Page): Promise<void> {
  const content = page.locator('.o_snippet_thumbnail')
    .filter({ has: page.locator('.o_snippet_thumbnail_title', { hasText: 'Content' }) }).first();
  await content.locator('button').click();
  const dialog = page.locator('.modal').last();
  await dialog.locator('input[type="search"]').fill('Coordonnées');
  await page.waitForTimeout(300);
  const chooser = await dialog.locator('iframe').contentFrame();
  if (!chooser) throw new Error('Iframe du catalogue Website absente.');
  await chooser.locator('[aria-label="Piqueray · Coordonnées"]').evaluate((node) => (node as HTMLElement).click());
  await page.waitForTimeout(350);
}

const panel = (page: Page) => page.locator('.options-container:visible')
  .filter({ has: page.locator('[data-pqr-control="coordonnees-facebook-href"]') }).first();

const select = (frame: Frame, root: Locator) => sharedSelect(frame, root, 350);

async function readState(page: { locator: (selector: string) => any }): Promise<any[]> {
  return page.locator(ROOT).evaluateAll((roots: Element[]) => roots.map((root) => {
    const bloc = root.querySelector('[data-pqr-part="coordonnees-contact-block"]');
    return {
      eyebrow: root.querySelector('[data-pqr-part="section-header-eyebrow"]')?.textContent?.trim() ?? '',
      title: root.querySelector('[data-pqr-part="coordonnees-title"]')?.textContent?.trim() ?? '',
      addressLabel: root.querySelector('[data-pqr-part="coordonnees-address-label"]')?.textContent?.trim() ?? '',
      addressValue: root.querySelector('[data-pqr-part="coordonnees-address-value"]')?.textContent?.trim() ?? '',
      hoursValue: root.querySelector('[data-pqr-part="coordonnees-hours-value"]')?.textContent?.trim() ?? '',
      contactText: bloc?.textContent?.trim() ?? '',
      telHref: bloc?.querySelector('a[href^="tel:"]')?.getAttribute('href') ?? '',
      mailHref: bloc?.querySelector('a[href^="mailto:"]')?.getAttribute('href') ?? '',
      contactBreaks: bloc ? bloc.querySelectorAll('br').length : 0,
      contactWhiteSpace: bloc ? getComputedStyle(bloc as HTMLElement).whiteSpace : '',
      facebookHref: root.querySelector('[data-pqr-part="coordonnees-facebook-link"]')?.getAttribute('href') ?? '',
      instagramHref: root.querySelector('[data-pqr-part="coordonnees-instagram-link"]')?.getAttribute('href') ?? '',
    };
  }));
}

async function readResponsiveLayout(page: Page) {
  const widths = [1728, 1440] as const;
  const observations = [];
  for (const viewportWidth of widths) {
    await page.setViewportSize({ width: viewportWidth, height: 1000 });
    await page.waitForTimeout(150);
    const observed = await page.locator(ROOT).first().evaluate((root) => {
      const host = root as HTMLElement;
      const map = host.querySelector<HTMLElement>('[data-pqr-part="coordonnees-map"]');
      const wrapper = host.querySelector<HTMLElement>('[data-pqr-part="coordonnees-wrapper"]');
      if (!map || !wrapper) return null;
      const rootRect = host.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      const mapRect = map.getBoundingClientRect();
      return {
        rootWidth: Math.round(rootRect.width),
        rootOverflow: host.scrollWidth - host.clientWidth,
        wrapperWidth: Math.round(wrapperRect.width),
        mapWidth: Math.round(mapRect.width),
      };
    });
    observations.push({ viewportWidth, ...observed });
  }
  return observations;
}

async function main() {
  const started = Date.now();
  const receipt = new Recueil('coordonnees-functional', 'odoo-019-foundation', 'coordonnees-panel');
  if (!dockerDisponible()) {
    receipt.saute('qualification Coordonnées sur Odoo', 'Docker indisponible', 'ODOO-LIMIT-NO-INSTANCE');
    receipt.ecrire('coordonnees-functional.json', Date.now() - started);
    process.exit(1);
  }

  await withInstance(async ({ browser, env }) => {
    const editor = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await editor.context.newPage();
      const frame = await enterEditor(page, env);
      if (!frame) {
        receipt.saute('éditeur Coordonnées', 'iframe de page ou builder absent', 'ODOO-LIMIT-EDITOR-ENTRY');
        return;
      }
      await insertCoordonnees(page);
      await insertCoordonnees(page);
      const roots = frame.locator(ROOT);
      receipt.constateSi('catalogue — deux Coordonnées indépendantes sont insérées', await roots.count() === 2, '2 racines', `${await roots.count()} racine(s)`);

      const first = roots.first();
      const second = roots.nth(1);
      await select(frame, first);
      await panel(page).locator('[data-pqr-control="coordonnees-facebook-href"]').first().waitFor({ state: 'visible', timeout: 10_000 });
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
      };
      const leaked = Object.entries(visibleForbidden).filter(([, n]) => n > 0).map(([k]) => k);
      receipt.constateSi('racine — actions Odoo interdites absentes du chrome visible', leaked.length === 0, 'save-as-custom, resize, anchor absents', leaked.length ? leaked.join(', ') : JSON.stringify(visibleForbidden));

      // Rendu par défaut : le bloc Tél/Email porte 2 vrais liens + un saut de
      // ligne (pre-line), et le plan est un placeholder sans src.
      const defaults = (await readState(frame))[0];
      receipt.constateSi('défaut — bloc contact = liens tel:/mailto: + saut de ligne (pre-line)',
        /^tel:/.test(defaults.telHref) && /^mailto:/.test(defaults.mailHref) && /pre-line|pre-wrap/.test(defaults.contactWhiteSpace) && /Tél/.test(defaults.contactText) && /Email/.test(defaults.contactText),
        'tel: + mailto: + white-space pre-line',
        JSON.stringify({ tel: defaults.telHref, mail: defaults.mailHref, ws: defaults.contactWhiteSpace }));
      const mapSrc = await first.locator('[data-pqr-part="coordonnees-map"]').getAttribute('src');
      receipt.constateSi('défaut — plan Google en placeholder (aucun src)', !mapSrc, 'src absent (placeholder)', `src=${JSON.stringify(mapSrc)}`);

      // Éditions AUTORISÉES (clic humain) : accroche + titre + étiquette adresse.
      const eyebrow = first.locator('[data-pqr-part="section-header-eyebrow"]');
      const eyebrowAfter = await frapperAuClicHumain(eyebrow, 'Nous joindre — ');
      const title = first.locator('[data-pqr-part="coordonnees-title"]');
      const titleAfter = await frapperAuClicHumain(title, '★ ');
      const addr = first.locator('[data-pqr-part="coordonnees-address-label"]');
      const addrAfter = await frapperAuClicHumain(addr, 'Nos ');
      receipt.constateSi('éditions autorisées — accroche, titre et étiquette reçoivent la frappe',
        eyebrowAfter?.includes('Nous joindre') === true && titleAfter?.includes('★') === true && addrAfter?.includes('Nos') === true,
        'les trois zones acceptent la frappe au clic humain',
        JSON.stringify({ eyebrow: eyebrowAfter, title: titleAfter, addr: addrAfter }));

      // Tentative INTERDITE — geste de texte direct sur le plan (média, non
      // éditable) : la frappe ne doit rien insérer (edge « verrou contourné »).
      const map = first.locator('[data-pqr-part="coordonnees-map"]');
      const mapCE = await map.getAttribute('contenteditable');
      const wrapperCE = await first.locator('[data-pqr-part="coordonnees-wrapper"]').getAttribute('contenteditable');
      receipt.constateSi('tentative interdite — plan et wrapper structurel ne sont pas éditables',
        mapCE !== 'true' && wrapperCE !== 'true',
        'contenteditable ≠ true sur le plan et le wrapper',
        `map=${mapCE} wrapper=${wrapperCE}`);

      // Liens réseaux sociaux au panneau (Q-C2) — grammaire CTA-href.
      await select(frame, first);
      const champFb = panel(page).locator('[data-pqr-control="coordonnees-facebook-href"] input');
      const ancreFb = first.locator('[data-pqr-part="coordonnees-facebook-link"]');
      const fbReplie = await poserHref(champFb, ancreFb, `${baseUrl(env)}/promo`);
      const fbInjection = await poserHref(champFb, ancreFb, 'javascript:alert(1)');
      const fbFinal = await poserHref(champFb, ancreFb, 'https://facebook.com/piqueray');
      receipt.constateSi('lien Facebook — gouverné au panneau (origine repliée, javascript refusé, https accepté)',
        fbReplie === '/promo' && fbInjection === '/promo' && fbFinal === 'https://facebook.com/piqueray',
        'absolu même origine → /promo · javascript: ignoré · https accepté',
        `replié: ${fbReplie} · injection: ${fbInjection} · final: ${fbFinal}`);

      // Isolation : édition de la deuxième instance sans toucher la première.
      await select(frame, second);
      const eyebrowB = second.locator('[data-pqr-part="section-header-eyebrow"]');
      await frapperAuClicHumain(eyebrowB, 'Instance B — ');
      const edited = await readState(frame);
      receipt.constateSi('isolation — édition de B laisse A intacte',
        edited.length === 2 && edited[0].eyebrow.includes('Nous joindre') && edited[1].eyebrow.includes('Instance B') && !edited[1].eyebrow.includes('Nous joindre'),
        'A = « Nous joindre… » · B = « Instance B… »',
        JSON.stringify(edited.map((e) => e.eyebrow)));

      // Insertion hostile dans le bloc contact — la garde ne doit garder que
      // link + line-break à la sauvegarde.
      const bloc = first.locator('[data-pqr-part="coordonnees-contact-block"]');
      await bloc.evaluate((node) => {
        const target = node as HTMLElement;
        target.focus();
        const range = document.createRange(); range.selectNodeContents(target);
        const selection = window.getSelection(); selection?.removeAllRanges(); selection?.addRange(range);
        document.execCommand('insertHTML', false, 'Tél : <a href="tel:+3287463266">+32</a><br/>Email: <a href="mailto:x@y.be">x</a><em>italique</em><a href="javascript:alert(1)">hostile</a>');
      });
      await page.waitForTimeout(200);

      const save = page.locator('.o-snippets-top-actions button[data-action="save"]').first();
      const responsePromise = page.waitForResponse((r) => r.url().includes('/web/dataset/call_kw/ir.ui.view/save'), { timeout: 30_000 }).catch(() => null);
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
        contactLinks: root.querySelectorAll('[data-pqr-part="coordonnees-contact-block"] a').length,
        forbiddenTags: root.querySelectorAll('[data-pqr-part="coordonnees-contact-block"] em, [data-pqr-part="coordonnees-contact-block"] script').length,
        executableUrls: [...root.querySelectorAll('[href], [src]')].map((n) => n.getAttribute('href') ?? n.getAttribute('src') ?? '').filter((v) => /^\s*(javascript|data|vbscript):/i.test(v)),
      }));
      const responsive = await readResponsiveLayout(page);
      receipt.artefact(path.join(PROOFS, 'coordonnees-functional.public.json'), Buffer.from(JSON.stringify({ status: response?.status(), state, safety, responsive }, null, 2) + '\n'), 'json');
      receipt.constateSi('public — deux instances et éditions persistées', response?.status() === 200 && state.length === 2 && state[0].eyebrow.includes('Nous joindre') && state[1].eyebrow.includes('Instance B'), 'HTTP 200 · A et B distinctes', JSON.stringify(state.map((s) => s.eyebrow)));
      receipt.constateSi('public — bloc contact : liens conservés, italique et URL exécutable retirés', safety.contactLinks >= 2 && safety.forbiddenTags === 0 && safety.executableUrls.length === 0, '≥2 liens · 0 em/script · 0 URL exécutable', JSON.stringify(safety));
      receipt.constateSi('w-auto — zéro débordement à 1728 et 1440, wrapper 576 tenu, plan fléchit',
        responsive.length === 2 && responsive.every((o) => o.rootOverflow !== undefined && o.rootOverflow <= 0.5 && Math.abs((o.wrapperWidth ?? 0) - 576) <= 2) && (responsive[1].mapWidth ?? 9999) < (responsive[0].mapWidth ?? 0),
        '0 overflow · wrapper≈576 · mapWidth(1440) < mapWidth(1728)',
        JSON.stringify(responsive));
    } finally {
      await publicSession.context.close();
    }

    const reopened = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await reopened.context.newPage();
      const frame = await enterEditor(page, env);
      const state = frame ? await readState(frame) : [];
      receipt.constateSi('éditeur rouvert — DOM sauvegardé relu sans état parallèle', state.length === 2 && state[0].eyebrow.includes('Nous joindre') && state[1].eyebrow.includes('Instance B'), '2 instances persistées', JSON.stringify(state.map((s) => s.eyebrow)));
    } finally {
      await reopened.context.close();
    }
  });

  const done = receipt.ecrire('coordonnees-functional.json', Date.now() - started);
  process.exit(done.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => { console.error(`✖ ${error instanceof Error ? error.message : String(error)}`); process.exit(1); });
}
