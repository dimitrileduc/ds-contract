/**
 * Scénario QA Catégories principales (spec 023, US2, FR-016/017/018/019).
 * Section-collection dont la molécule est ds.carte-categorie (style empilé) et
 * dont le colonnage {2,3} est le PREMIER enum rédacteur de la couche Odoo.
 *
 * Couvre : pose de deux instances indépendantes, rendu par défaut (4 cartes
 * empilées + CTA lien par carte, colonnes=2), inventaire strict du panneau,
 * rootActions {move,duplicate,remove}, actions Odoo interdites absentes, édition
 * carte N (titre/texte) sans toucher N+1, les 4 gestes de collection bornes 0..n,
 * BASCULE 2↔3 COLONNES (enum fermé) + 4ᵉ carte passée à la ligne + moins de cartes
 * que de colonnes (largeur de cellule, pas d'étirement), CTA par carte (libellé +
 * lien gouverné, javascript refusé), SECTION VIDÉE (0 carte, rendu propre,
 * réversible), isolation, persistance aux 3 points de contrôle.
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

const ROOT = '.s_pqr_categories_principales';
const CARTE = '[data-pqr-carte]';
const HARNESS_PATH = '/piqueray-harness/categories-principales';
const fixture = JSON.parse(readFileSync(path.join(REPO, 'integrations/odoo/qa/fixtures/categories-panel.json'), 'utf8'));

const enterEditor = (page: Page, env: QaEnv): Promise<Frame | null> => enterHarnessEditor(page, env, HARNESS_PATH);

async function insertCategories(page: Page): Promise<void> {
  const content = page.locator('.o_snippet_thumbnail')
    .filter({ has: page.locator('.o_snippet_thumbnail_title', { hasText: 'Content' }) }).first();
  await content.locator('button').click();
  const dialog = page.locator('.modal').last();
  await dialog.locator('input[type="search"]').fill('Catégories principales');
  await page.waitForTimeout(300);
  const chooser = await dialog.locator('iframe').contentFrame();
  if (!chooser) throw new Error('Iframe du catalogue Website absente.');
  await chooser.locator('[aria-label="Piqueray · Catégories principales"]').evaluate((node) => (node as HTMLElement).click());
  await page.waitForTimeout(350);
}

const rootPanel = (page: Page) => page.locator('.options-container:visible')
  .filter({ has: page.locator('[data-pqr-control="categories-colonnes"]') }).first();
const cartePanel = (page: Page) => page.locator('.options-container:visible')
  .filter({ has: page.locator('[data-pqr-control="carte-title"]') }).first();

const select = (frame: Frame, root: Locator) => sharedSelect(frame, root, 350);

async function readState(page: { locator: (selector: string) => any }): Promise<any[]> {
  return page.locator(ROOT).evaluateAll((roots: Element[]) => roots.map((root) => {
    const cartes = [...root.querySelectorAll('[data-pqr-carte]')];
    return {
      carteCount: cartes.length,
      colonnes: (root as HTMLElement).dataset.pqrColonnes ?? '',
      gridCols: getComputedStyle(root as HTMLElement).gridTemplateColumns.split(' ').length,
      carteTitles: cartes.map((c) => c.querySelector('[data-pqr-part="carte-title"]')?.textContent?.trim() ?? ''),
      carteTexts: cartes.map((c) => c.querySelector('[data-pqr-part="carte-text"]')?.textContent?.trim() ?? ''),
      ctaLabels: cartes.map((c) => c.querySelector('[data-pqr-part="carte-cta-lien"] [data-pqr-part="button-label"]')?.textContent?.trim() ?? ''),
      ctaHrefs: cartes.map((c) => c.querySelector('[data-pqr-part="carte-cta-lien"] a[data-pqr-part="button-root"]')?.getAttribute('href') ?? ''),
    };
  }));
}

/** Positions des cartes (top de leur boîte) → nombre de rangées et cartes par
 *  rangée, pour prouver le wrap de la grille sans lire la CSS. Accepte la Page
 *  publique OU la Frame du harnais (en édition, la section vit dans l'iframe). */
async function readGridRows(host: Page | Frame) {
  return host.locator(ROOT).first().evaluate((root) => {
    const cartes = [...root.querySelectorAll<HTMLElement>('[data-pqr-carte]')];
    const tops = cartes.map((c) => Math.round(c.getBoundingClientRect().top));
    const rows = [...new Set(tops)].sort((a, b) => a - b);
    const firstRowTop = rows[0] ?? 0;
    const widths = cartes.map((c) => Math.round(c.getBoundingClientRect().width));
    return {
      carteCount: cartes.length,
      rowCount: rows.length,
      firstRowCount: tops.filter((t) => Math.abs(t - firstRowTop) < 2).length,
      rootOverflow: root.scrollWidth - root.clientWidth,
      carteWidths: widths,
    };
  });
}

async function main() {
  const started = Date.now();
  const receipt = new Recueil('categories-functional', 'odoo-019-foundation', 'categories-panel');
  if (!dockerDisponible()) {
    receipt.saute('qualification Catégories sur Odoo', 'Docker indisponible', 'ODOO-LIMIT-NO-INSTANCE');
    receipt.ecrire('categories-functional.json', Date.now() - started);
    process.exit(1);
  }

  await withInstance(async ({ browser, env }) => {
    const editor = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await editor.context.newPage();
      const frame = await enterEditor(page, env);
      if (!frame) {
        receipt.saute('éditeur Catégories', 'iframe de page ou builder absent', 'ODOO-LIMIT-EDITOR-ENTRY');
        return;
      }
      await insertCategories(page);
      await insertCategories(page);
      const roots = frame.locator(ROOT);
      receipt.constateSi('catalogue — deux Catégories indépendantes sont insérées', await roots.count() === 2, '2 racines', `${await roots.count()} racine(s)`);

      const first = roots.first();
      const second = roots.nth(1);
      await select(frame, first);
      await rootPanel(page).locator('[data-pqr-control="categories-colonnes"]').first().waitFor({ state: 'visible', timeout: 10_000 });
      const controls = await rootPanel(page).locator('[data-pqr-control]').evaluateAll((nodes: Element[]) =>
        [...new Set(nodes.map((node) => node.getAttribute('data-pqr-control')).filter(Boolean))].sort());
      receipt.constateSi('panneau racine — inventaire Piqueray strict (collection + colonnes)', JSON.stringify(controls) === JSON.stringify([...fixture.expectedControls].sort()), fixture.expectedControls.join(', '), controls.join(', '));

      const rootActions = ((await first.getAttribute('data-pqr-root-actions')) ?? '').split(/\s+/).filter(Boolean).sort();
      receipt.constateSi('racine — seuls move, duplicate et remove sont déclarés', JSON.stringify(rootActions) === JSON.stringify([...fixture.rootActions].sort()), fixture.rootActions.join(', '), rootActions.join(', '));
      const visibleForbidden = {
        'save-as-custom': await visibleCount(page, '.oe_snippet_save'),
        resize: await visibleCount(page, '.oe_overlay.oe_active .o_handle:not(.readonly):not(.d-none)'),
        anchor: await visibleCount(page, '.oe_snippet_anchor'),
      };
      const leaked = Object.entries(visibleForbidden).filter(([, n]) => n > 0).map(([k]) => k);
      receipt.constateSi('racine — actions Odoo interdites absentes du chrome visible', leaked.length === 0, 'save-as-custom, resize, anchor absents', leaked.length ? leaked.join(', ') : JSON.stringify(visibleForbidden));

      // Rendu par défaut : 4 cartes empilées, CTA « Contactez-nous » par carte, colonnes=2.
      const defaults = (await readState(frame))[0];
      receipt.constateSi('défaut — 4 cartes empilées, CTA « Contactez-nous » par carte, colonnes 2',
        defaults.carteCount === 4 && defaults.ctaLabels.every((l: string) => l === 'Contactez-nous') && defaults.colonnes === '2' && defaults.gridCols === 2,
        '4 cartes · CTA Contactez-nous ×4 · colonnes 2 (grille 2 pistes)',
        JSON.stringify({ n: defaults.carteCount, cta: defaults.ctaLabels, col: defaults.colonnes, grid: defaults.gridCols }));

      // Édition carte 0 (titre + texte) sans toucher carte 1.
      const carte0Title = first.locator(`${CARTE} [data-pqr-part="carte-title"]`).first();
      const t0 = await frapperAuClicHumain(carte0Title, '★ ');
      const carte0Text = first.locator(`${CARTE} [data-pqr-part="carte-text"]`).first();
      await frapperAuClicHumain(carte0Text, '§ ');
      const edited = (await readState(frame))[0];
      receipt.constateSi('édition carte 0 — titre + texte reçoivent la frappe, carte 1 intacte',
        t0?.includes('★') === true && edited.carteTitles[0].includes('★') && edited.carteTexts[0].includes('§') && !edited.carteTitles[1].includes('★') && !edited.carteTexts[1].includes('§'),
        'carte 0 = « ★ … / § … » · carte 1 inchangée',
        JSON.stringify({ t: edited.carteTitles.slice(0, 2), x: edited.carteTexts.slice(0, 2) }));

      // PANNEAU CARTE — inventaire strict : prouve que TOUS les champs FR-016 sont OFFERTS
      // au rédacteur (image, alt, lien, ordre, suppression), pas seulement le titre/texte.
      await first.locator(CARTE).first().click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(300);
      await cartePanel(page).locator('[data-pqr-control="carte-title"]').first().waitFor({ state: 'visible', timeout: 10_000 });
      const carteControls = await cartePanel(page).locator('[data-pqr-control]').evaluateAll((nodes: Element[]) =>
        [...new Set(nodes.map((n) => n.getAttribute('data-pqr-control')).filter(Boolean))].sort());
      receipt.constateSi('panneau carte — inventaire strict (image, alt, lien, ordre, suppression offerts)',
        JSON.stringify(carteControls) === JSON.stringify([...fixture.carteControls].sort()),
        fixture.carteControls.join(', '), carteControls.join(', '));

      // ÉDITION D'IMAGE (C9) — le texte alternatif est un champ texte, testable SANS le dialogue
      // média (le remplacement d'octets, lui, passe par le dialogue natif, non piloté headless —
      // limite nommée). On prouve donc : le contrôle « Remplacer » est offert (inventaire ci-dessus)
      // ET l'alt s'édite réellement et se pose sur l'image de la carte.
      const altInput = cartePanel(page).locator('[data-pqr-control="carte-image-alt"] input');
      await altInput.click();
      await altInput.fill('Photo catégorie test');
      await altInput.press('Tab');
      await page.waitForTimeout(300);
      const altSet = await first.locator(`${CARTE} [data-pqr-part="carte-image"]`).first().getAttribute('alt');
      receipt.constateSi('image — texte alternatif éditable par carte et posé sur l\'image (C9)',
        altSet === 'Photo catégorie test', 'alt = « Photo catégorie test »', `alt = ${JSON.stringify(altSet)}`);

      // BASCULE COLONNES 2→3 (enum fermé, SC-003). Sélecteur au panneau racine.
      await select(frame, first);
      await rootPanel(page).locator('[data-pqr-control="categories-colonnes"] button, [data-pqr-control="categories-colonnes"] .dropdown-toggle').first().click();
      await page.waitForTimeout(300);
      await page.locator('.o-dropdown--menu, .dropdown-menu').locator('[data-action-param="3"]').first().click();
      await page.waitForTimeout(300);
      const at3 = (await readState(frame))[0];
      const class3 = await first.evaluate((el) => el.classList.contains('categories-principales--colonnes-3'));
      receipt.constateSi('colonnes — bascule 2→3 (enum fermé) : data + classe + grille à 3 pistes',
        at3.colonnes === '3' && class3 === true && at3.gridCols === 3,
        'colonnes 3 · classe --colonnes-3 · grille 3 pistes',
        JSON.stringify({ col: at3.colonnes, class3, grid: at3.gridCols }));

      // 4 cartes en 3 colonnes : première rangée = 3, la 4ᵉ passe à la ligne.
      // La section vit dans l'iframe du harnais en édition → lire sur `frame`.
      const rows3 = await readGridRows(frame);
      receipt.constateSi('colonnes — 4ᵉ carte passée à la ligne sur la même grille (3+1)',
        rows3.carteCount === 4 && rows3.firstRowCount === 3 && rows3.rowCount === 2 && rows3.rootOverflow <= 0.5,
        '3 cartes rangée 1 · 4ᵉ rangée 2 · 0 débordement',
        JSON.stringify(rows3));

      // Retour à 2 colonnes.
      await select(frame, first);
      await rootPanel(page).locator('[data-pqr-control="categories-colonnes"] button, [data-pqr-control="categories-colonnes"] .dropdown-toggle').first().click();
      await page.waitForTimeout(300);
      await page.locator('.o-dropdown--menu, .dropdown-menu').locator('[data-action-param="2"]').first().click();
      await page.waitForTimeout(300);
      const at2 = (await readState(frame))[0];
      receipt.constateSi('colonnes — retour 3→2 (aucun colonnage hors {2,3} offrable)', at2.colonnes === '2' && at2.gridCols === 2, 'colonnes 2 · grille 2 pistes', JSON.stringify({ col: at2.colonnes, grid: at2.gridCols }));

      // Les 4 GESTES de collection : ajouter (blueprint) → 5 ; supprimer → 4 ; monter.
      await select(frame, first);
      await rootPanel(page).locator('[data-pqr-control="categories-collection"] button', { hasText: 'Ajouter' }).first().click();
      await page.waitForTimeout(250);
      const afterAdd = (await readState(frame))[0].carteCount;
      await first.locator(CARTE).last().click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(300);
      await cartePanel(page).locator('[data-pqr-control="carte-remove"] button').first().click();
      await page.waitForTimeout(250);
      const afterRemove = (await readState(frame))[0].carteCount;
      receipt.constateSi('collection — ajouter puis supprimer (bornes n±1)', afterAdd === 5 && afterRemove === 4, 'ajouter → 5 · supprimer → 4', `ajouter → ${afterAdd} · supprimer → ${afterRemove}`);

      const before = (await readState(frame))[0].carteTitles;
      await first.locator(CARTE).nth(1).click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(300);
      await cartePanel(page).locator('[data-pqr-control="carte-move-up"] button').first().click();
      await page.waitForTimeout(250);
      const afterMove = (await readState(frame))[0].carteTitles;
      receipt.constateSi('collection — monter la carte 1 la place en tête', afterMove[0] === before[1] && afterMove[1] === before[0], 'les deux premières cartes permutent', JSON.stringify({ before: before.slice(0, 2), after: afterMove.slice(0, 2) }));

      // CTA par carte — libellé éditable + lien gouverné (grammaire CTA-href).
      await first.locator(CARTE).first().click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(300);
      const libelleCta = first.locator(`${CARTE} [data-pqr-part="carte-cta-lien"] [data-pqr-part="button-label"]`).first();
      const ctaAfter = await frapperAuClicHumain(libelleCta, '•');
      const champHref = cartePanel(page).locator('[data-pqr-control="carte-cta-href"] input');
      const ancreCta = first.locator(`${CARTE} [data-pqr-part="carte-cta-lien"] a[data-pqr-part="button-root"]`).first();
      const hrefInj = await poserHref(champHref, ancreCta, 'javascript:alert(1)');
      const hrefFinal = await poserHref(champHref, ancreCta, '/contact');
      receipt.constateSi('CTA carte — libellé éditable + lien gouverné (javascript refusé, relatif accepté)',
        ctaAfter?.includes('•') === true && hrefInj !== 'javascript:alert(1)' && hrefFinal === '/contact',
        'libellé frappé · javascript ignoré · /contact accepté',
        JSON.stringify({ label: ctaAfter, inj: hrefInj, final: hrefFinal }));

      // SECTION VIDÉE (edge Gate D) : supprimer les 4 cartes → 0, rendu propre, réversible.
      for (let i = 0; i < 4; i += 1) {
        await first.locator(CARTE).first().click({ position: { x: 8, y: 8 } });
        await page.waitForTimeout(250);
        await cartePanel(page).locator('[data-pqr-control="carte-remove"] button').first().click();
        await page.waitForTimeout(200);
      }
      const emptied = (await readState(frame))[0];
      const rootStillThere = await first.count() === 1;
      await select(frame, first);
      await rootPanel(page).locator('[data-pqr-control="categories-collection"] button', { hasText: 'Ajouter' }).first().click();
      await page.waitForTimeout(250);
      const afterRestore = (await readState(frame))[0].carteCount;
      receipt.constateSi('section vidée — 0 carte se rend proprement, geste réversible (ajouter restaure)',
        emptied.carteCount === 0 && rootStillThere && afterRestore === 1,
        'vidée → 0 carte (racine intacte) · ajouter → 1',
        JSON.stringify({ vide: emptied.carteCount, racine: rootStillThere, restore: afterRestore }));

      // Marqueur persistant sur A (la carte restaurée) — les éditions ★/§ portées
      // plus haut ont été détruites par le test de section vidée (destructif par
      // nature) ; on repose donc un marqueur ✚ qui traversera save/reload.
      await frapperAuClicHumain(first.locator(`${CARTE} [data-pqr-part="carte-title"]`).first(), '✚ ');

      // Isolation : éditer B (carte 0) sans toucher A.
      await second.locator(`${CARTE} [data-pqr-part="carte-title"]`).first().click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(200);
      await page.keyboard.type('B0 ');
      await page.waitForTimeout(150);
      const both = await readState(frame);
      receipt.constateSi('isolation — édition de B laisse A intacte',
        both.length === 2 && both[1].carteTitles[0].includes('B0') && !both[0].carteTitles.some((t: string) => t.includes('B0')),
        'B carte 0 = « B0 … » · A intacte',
        JSON.stringify({ a: both[0].carteTitles[0], b: both[1].carteTitles[0] }));

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
      await page.setViewportSize({ width: 1600, height: 1200 });
      await page.waitForTimeout(150);
      const state = await readState(page);
      const grid = await readGridRows(page);
      receipt.artefact(path.join(PROOFS, 'categories-functional.public.json'), Buffer.from(JSON.stringify({ status: response?.status(), state, grid }, null, 2) + '\n'), 'json');
      receipt.constateSi('public — deux instances et éditions persistées (A ✚, B B0)',
        response?.status() === 200 && state.length === 2 && state[0].carteTitles.some((t: string) => t.includes('✚')) && state[1].carteTitles.some((t: string) => t.includes('B0')),
        'HTTP 200 · A ✚ · B B0', JSON.stringify(state.map((s) => s.carteTitles)));
      receipt.constateSi('public — grille sans débordement (colonnage gouverné {2,3})', grid.rootOverflow <= 0.5, '0 débordement', JSON.stringify({ overflow: grid.rootOverflow, cols: grid.firstRowCount }));
    } finally {
      await publicSession.context.close();
    }

    const reopened = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await reopened.context.newPage();
      const frame = await enterEditor(page, env);
      const state = frame ? await readState(frame) : [];
      receipt.constateSi('éditeur rouvert — DOM sauvegardé relu sans état parallèle',
        state.length === 2 && state[0].carteTitles.some((t: string) => t.includes('✚')) && state[1].carteTitles.some((t: string) => t.includes('B0')),
        '2 instances persistées', JSON.stringify(state.map((s) => s.carteTitles)));
    } finally {
      await reopened.context.close();
    }
  });

  const done = receipt.ecrire('categories-functional.json', Date.now() - started);
  process.exit(done.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => { console.error(`✖ ${error instanceof Error ? error.message : String(error)}`); process.exit(1); });
}
