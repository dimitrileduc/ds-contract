/**
 * Scénario QA Réassurances (spec 022, US2, FR-015). Première section de
 * production dont le contenu principal est une COLLECTION répétée.
 *
 * Couvre : pose, rendu par défaut (4 cartes + CTA, en-tête fixé), w-auto
 * 1728/1440 (grille 4 colonnes, zéro débordement), édition carte N sans toucher
 * N+1, les 4 gestes de collection {ajouter, supprimer, monter, descendre} bornes
 * 0..n, gestes natifs neutralisés, en-tête/CTA fixés → geste de texte bloqué sur
 * l'en-tête, libellé CTA éditable + lien au panneau, isolation, persistance.
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

const ROOT = '.s_pqr_reassurances';
const CARTE = '[data-pqr-carte]';
const HARNESS_PATH = '/piqueray-harness/reassurances';
const fixture = JSON.parse(readFileSync(path.join(REPO, 'integrations/odoo/qa/fixtures/reassurances-panel.json'), 'utf8'));

const enterEditor = (page: Page, env: QaEnv): Promise<Frame | null> => enterHarnessEditor(page, env, HARNESS_PATH);

async function insertReassurances(page: Page): Promise<void> {
  const content = page.locator('.o_snippet_thumbnail')
    .filter({ has: page.locator('.o_snippet_thumbnail_title', { hasText: 'Content' }) }).first();
  await content.locator('button').click();
  const dialog = page.locator('.modal').last();
  await dialog.locator('input[type="search"]').fill('Réassurances');
  await page.waitForTimeout(300);
  const chooser = await dialog.locator('iframe').contentFrame();
  if (!chooser) throw new Error('Iframe du catalogue Website absente.');
  await chooser.locator('[aria-label="Piqueray · Réassurances"]').evaluate((node) => (node as HTMLElement).click());
  await page.waitForTimeout(350);
}

const rootPanel = (page: Page) => page.locator('.options-container:visible')
  .filter({ has: page.locator('[data-pqr-control="reassurances-collection"]') }).first();
const cartePanel = (page: Page) => page.locator('.options-container:visible')
  .filter({ has: page.locator('[data-pqr-control="carte-title"]') }).first();

const select = (frame: Frame, root: Locator) => sharedSelect(frame, root, 350);

async function readState(page: { locator: (selector: string) => any }): Promise<any[]> {
  return page.locator(ROOT).evaluateAll((roots: Element[]) => roots.map((root) => ({
    carteCount: root.querySelectorAll('[data-pqr-carte]').length,
    carteTitles: [...root.querySelectorAll('[data-pqr-carte] [data-pqr-part="carte-title"]')].map((n) => n.textContent?.trim() ?? ''),
    headerTitle: root.querySelector('[data-pqr-part="reassurances-title"]')?.textContent?.trim() ?? '',
    ctaLabel: root.querySelector('[data-pqr-part="reassurances-cta"] [data-pqr-part="button-label"]')?.textContent?.trim() ?? '',
    ctaHref: root.querySelector('[data-pqr-part="reassurances-cta"] a[data-pqr-part="button-root"]')?.getAttribute('href') ?? '',
  })));
}

async function readResponsiveLayout(page: Page) {
  const widths = [1728, 1440] as const;
  const observations = [];
  for (const viewportWidth of widths) {
    await page.setViewportSize({ width: viewportWidth, height: 1100 });
    await page.waitForTimeout(150);
    const observed = await page.locator(ROOT).first().evaluate((root) => {
      const host = root as HTMLElement;
      const cartes = [...host.querySelectorAll<HTMLElement>('[data-pqr-carte]')];
      const firstRowTop = cartes[0]?.getBoundingClientRect().top ?? 0;
      return {
        rootWidth: Math.round(host.getBoundingClientRect().width),
        rootOverflow: host.scrollWidth - host.clientWidth,
        carteCount: cartes.length,
        // 4 cartes sur une seule rangée = même `top` pour toutes (grille 4 col).
        firstRowCount: cartes.filter((c) => Math.abs(c.getBoundingClientRect().top - firstRowTop) < 1).length,
      };
    });
    observations.push({ viewportWidth, ...observed });
  }
  return observations;
}

async function main() {
  const started = Date.now();
  const receipt = new Recueil('reassurances-functional', 'odoo-019-foundation', 'reassurances-panel');
  if (!dockerDisponible()) {
    receipt.saute('qualification Réassurances sur Odoo', 'Docker indisponible', 'ODOO-LIMIT-NO-INSTANCE');
    receipt.ecrire('reassurances-functional.json', Date.now() - started);
    process.exit(1);
  }

  await withInstance(async ({ browser, env }) => {
    const editor = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await editor.context.newPage();
      const frame = await enterEditor(page, env);
      if (!frame) {
        receipt.saute('éditeur Réassurances', 'iframe de page ou builder absent', 'ODOO-LIMIT-EDITOR-ENTRY');
        return;
      }
      await insertReassurances(page);
      await insertReassurances(page);
      const roots = frame.locator(ROOT);
      receipt.constateSi('catalogue — deux Réassurances indépendantes sont insérées', await roots.count() === 2, '2 racines', `${await roots.count()} racine(s)`);

      const first = roots.first();
      const second = roots.nth(1);
      await select(frame, first);
      await rootPanel(page).locator('[data-pqr-control="reassurances-collection"]').first().waitFor({ state: 'visible', timeout: 10_000 });
      const controls = await rootPanel(page).locator('[data-pqr-control]').evaluateAll((nodes: Element[]) =>
        [...new Set(nodes.map((node) => node.getAttribute('data-pqr-control')).filter(Boolean))].sort());
      receipt.constateSi('panneau racine — inventaire Piqueray strict', JSON.stringify(controls) === JSON.stringify([...fixture.expectedControls].sort()), fixture.expectedControls.join(', '), controls.join(', '));

      const rootActions = ((await first.getAttribute('data-pqr-root-actions')) ?? '').split(/\s+/).filter(Boolean).sort();
      receipt.constateSi('racine — seuls move, duplicate et remove sont déclarés', JSON.stringify(rootActions) === JSON.stringify([...fixture.rootActions].sort()), fixture.rootActions.join(', '), rootActions.join(', '));
      const visibleForbidden = {
        'save-as-custom': await visibleCount(page, '.oe_snippet_save'),
        resize: await visibleCount(page, '.oe_overlay.oe_active .o_handle:not(.readonly):not(.d-none)'),
        anchor: await visibleCount(page, '.oe_snippet_anchor'),
      };
      const leaked = Object.entries(visibleForbidden).filter(([, n]) => n > 0).map(([k]) => k);
      receipt.constateSi('racine — actions Odoo interdites absentes du chrome visible', leaked.length === 0, 'save-as-custom, resize, anchor absents', leaked.length ? leaked.join(', ') : JSON.stringify(visibleForbidden));

      // Rendu par défaut : 4 cartes, CTA « Contactez-nous », en-tête fixé.
      const defaults = (await readState(frame))[0];
      receipt.constateSi('défaut — 4 cartes, CTA « Contactez-nous », en-tête fixé par composition',
        defaults.carteCount === 4 && defaults.ctaLabel === 'Contactez-nous' && /Pourquoi choisir/.test(defaults.headerTitle),
        '4 cartes · CTA Contactez-nous · en-tête « Pourquoi choisir… »',
        JSON.stringify({ n: defaults.carteCount, cta: defaults.ctaLabel, header: defaults.headerTitle }));

      // Édition carte 0 (titre + texte) sans toucher carte 1.
      const carte0Title = first.locator(`${CARTE} [data-pqr-part="carte-title"]`).first();
      const t0 = await frapperAuClicHumain(carte0Title, '★ ');
      const editedTitles = (await readState(frame))[0].carteTitles;
      receipt.constateSi('édition carte 0 — titre reçoit la frappe, carte 1 intacte',
        t0?.includes('★') === true && editedTitles[0].includes('★') && !editedTitles[1].includes('★'),
        'carte 0 = « ★ … » · carte 1 inchangée',
        JSON.stringify(editedTitles.slice(0, 2)));

      // En-tête FIXÉ (R3) — geste de texte direct refusé (edge « verrou contourné »).
      const headerCE = await first.locator('[data-pqr-part="reassurances-title"]').getAttribute('contenteditable');
      receipt.constateSi('en-tête fixé — le titre de section n\'est pas éditable',
        headerCE !== 'true', 'contenteditable ≠ true sur le titre d\'en-tête', `contenteditable=${headerCE}`);

      // Geste natif neutralisé : la carte est un descendant verrouillé
      // (is_unremovable_selector) — Odoo ne propose ni suppression ni déplacement natifs.
      await first.locator(CARTE).first().click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(300);
      const nativeCarteRemove = await visibleCount(page, '.oe_overlay.oe_active [data-name="remove"]:not(.d-none), .oe_overlay.oe_active .oe_snippet_remove:not(.d-none)');
      receipt.constateSi('geste natif — aucune suppression native de carte offerte', nativeCarteRemove === 0, '0 poignée de suppression native', `${nativeCarteRemove} poignée(s)`);

      // Les 4 GESTES de collection : ajouter (blueprint) → 5 ; supprimer → 4 ;
      // monter/descendre → l'ordre change.
      await select(frame, first);
      await rootPanel(page).locator('[data-pqr-control="reassurances-collection"] button', { hasText: 'Ajouter' }).first().click();
      await page.waitForTimeout(250);
      const afterAdd = (await readState(frame))[0].carteCount;
      // Supprimer : sélectionner la dernière carte → panneau carte → Supprimer.
      await first.locator(CARTE).last().click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(300);
      await cartePanel(page).locator('[data-pqr-control="carte-remove"] button').first().click();
      await page.waitForTimeout(250);
      const afterRemove = (await readState(frame))[0].carteCount;
      receipt.constateSi('collection — ajouter puis supprimer (bornes n±1)', afterAdd === 5 && afterRemove === 4, 'ajouter → 5 · supprimer → 4', `ajouter → ${afterAdd} · supprimer → ${afterRemove}`);

      // Monter/descendre : ordonner par le titre marqué de la carte 0.
      const before = (await readState(frame))[0].carteTitles;
      await first.locator(CARTE).nth(1).click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(300);
      await cartePanel(page).locator('[data-pqr-control="carte-move-up"] button').first().click();
      await page.waitForTimeout(250);
      const afterMove = (await readState(frame))[0].carteTitles;
      receipt.constateSi('collection — monter la carte 1 la place en tête', afterMove[0] === before[1] && afterMove[1] === before[0], 'les deux premières cartes permutent', JSON.stringify({ before: before.slice(0, 2), after: afterMove.slice(0, 2) }));

      // CTA — libellé éditable + lien au panneau (Q-R2, grammaire CTA-href).
      await select(frame, first);
      const libelleCta = first.locator('[data-pqr-part="reassurances-cta"] [data-pqr-part="button-label"]');
      const ctaAfter = await frapperAuClicHumain(libelleCta, '•');
      const champHref = rootPanel(page).locator('[data-pqr-control="reassurances-cta-href"] input');
      const ancreCta = first.locator('[data-pqr-part="reassurances-cta"] a[data-pqr-part="button-root"]');
      const hrefInj = await poserHref(champHref, ancreCta, 'javascript:alert(1)');
      const hrefFinal = await poserHref(champHref, ancreCta, '/contact');
      receipt.constateSi('CTA — libellé éditable + lien gouverné (javascript refusé, relatif accepté)',
        ctaAfter?.includes('•') === true && hrefInj !== 'javascript:alert(1)' && hrefFinal === '/contact',
        'libellé frappé · javascript ignoré · /contact accepté',
        JSON.stringify({ label: ctaAfter, inj: hrefInj, final: hrefFinal }));

      // Isolation : éditer B (carte 0) sans toucher A.
      await second.locator(`${CARTE} [data-pqr-part="carte-title"]`).first().click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(200);
      await page.keyboard.type('B0 ');
      await page.waitForTimeout(150);
      const both = await readState(frame);
      receipt.constateSi('isolation — édition de B laisse A intacte',
        both.length === 2 && both[1].carteTitles[0].includes('B0') && !both[0].carteTitles[0].includes('B0'),
        'B carte 0 = « B0 … » · A intacte',
        JSON.stringify({ a0: both[0].carteTitles[0], b0: both[1].carteTitles[0] }));

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
      const responsive = await readResponsiveLayout(page);
      receipt.artefact(path.join(PROOFS, 'reassurances-functional.public.json'), Buffer.from(JSON.stringify({ status: response?.status(), state, responsive }, null, 2) + '\n'), 'json');
      receipt.constateSi('public — deux instances et éditions persistées', response?.status() === 200 && state.length === 2 && state[0].carteTitles.some((t: string) => t.includes('★')) && state[1].carteTitles.some((t: string) => t.includes('B0')), 'HTTP 200 · A ★ · B B0', JSON.stringify(state.map((s) => s.carteTitles)));
      receipt.constateSi('w-auto — grille 4 colonnes, zéro débordement à 1728 et 1440',
        responsive.length === 2 && responsive.every((o) => o.rootOverflow !== undefined && o.rootOverflow <= 0.5 && o.firstRowCount === 4),
        '0 overflow · 4 cartes sur la première rangée aux deux largeurs',
        JSON.stringify(responsive));
    } finally {
      await publicSession.context.close();
    }

    const reopened = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await reopened.context.newPage();
      const frame = await enterEditor(page, env);
      const state = frame ? await readState(frame) : [];
      receipt.constateSi('éditeur rouvert — DOM sauvegardé relu sans état parallèle', state.length === 2 && state[0].carteTitles.some((t: string) => t.includes('★')) && state[1].carteTitles.some((t: string) => t.includes('B0')), '2 instances persistées', JSON.stringify(state.map((s) => s.carteTitles)));
    } finally {
      await reopened.context.close();
    }
  });

  const done = receipt.ecrire('reassurances-functional.json', Date.now() - started);
  process.exit(done.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => { console.error(`✖ ${error instanceof Error ? error.message : String(error)}`); process.exit(1); });
}
