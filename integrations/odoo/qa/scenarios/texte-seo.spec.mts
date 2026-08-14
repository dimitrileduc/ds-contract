/**
 * Qualification fonctionnelle Texte SEO — mêmes gestes que le spike de mécanisme (étape 3),
 * rejoués sous le scenarioId de release sur installation propre.
 *
 * Les mécanismes risqués exercés ici, sur instance réelle :
 *   · l'accordéon TOGGLABLE — la bascule partagée (faq_toggle.js) déclenchée
 *     par l'Interaction du noyau 19 chez le visiteur, et par le panneau
 *     (« Ouverte au chargement ») dans l'éditeur ;
 *   · l'état initial PAR LIGNE porté par le DOM sauvegardé (classes + hidden),
 *     survie au save/reopen, aucune fuite entre deux instances ;
 *   · la collection à blueprint (ajout FERMÉ, réordre, suppression ciblés) ;
 *   · la frontière d'éditabilité (textes ouverts, structure/chevrons fermés).
 *
 * L'ordre des gestes suit le spike FAQ prouvé : sélection de rangée AVANT toute
 * frappe (une frappe laisse la toolbar flottante au-dessus de la rangée voisine
 * et intercepte le clic suivant — constaté ici même au premier passage), case
 * d'état par le PANNEAU (fenêtre haute), `selectRootGap` avant la collection.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Frame, Page } from 'playwright-core';
import { Recueil } from '../lib/receipt.mts';
import {
  EDITOR_TIMEOUT_MS,
  baseUrl,
  dockerDisponible,
  ouvrirSessionEditeur,
  ouvrirSessionPublique,
  withInstance,
  type QaEnv,
} from '../run.mts';

const ROOT = '.s_pqr_texte_seo';
const ROW = '[data-pqr-accordion-row]';
const HARNESS_PATH = '/piqueray-harness/texte-seo';

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

async function insertTexteSeo(page: Page): Promise<void> {
  const content = page.locator('.o_snippet_thumbnail')
    .filter({ has: page.locator('.o_snippet_thumbnail_title', { hasText: 'Content' }) }).first();
  await content.locator('button').click();
  const dialog = page.locator('.modal').last();
  await dialog.locator('input[type="search"]').fill('Texte SEO');
  await page.waitForTimeout(300);
  const chooser = await dialog.locator('iframe').contentFrame();
  if (!chooser) throw new Error('Iframe du catalogue Website absente.');
  await chooser.locator('[aria-label="Piqueray · Texte SEO"]').click();
  await page.waitForTimeout(400);
}

const rootPanel = (page: Page) => page.locator('.options-container:visible')
  .filter({ has: page.locator('[data-pqr-control="accordion-collection"]') }).first();
const rowPanel = (page: Page) => page.locator('.options-container:visible')
  .filter({ has: page.locator('[data-pqr-control="row-remove"]') }).first();

async function selectRootGap(frame: Frame, root: any): Promise<void> {
  const box = await root.boundingBox();
  if (!box) throw new Error('Racine Texte SEO sans boîte sélectionnable.');
  const x = Math.min(Math.max(box.width / 4, 8), box.width - 8);
  await root.click({ position: { x, y: Math.min(8, Math.max(1, box.height - 1)) } });
  await frame.page().waitForTimeout(250);
}

/** Sélectionne une rangée par un clic dans sa partie VISIBLE. Le root
 *  d'accordion-row gèle `width: 1550px` (limite nommée du contrat) et
 *  l'accordéon centre ses rangées : dans l'iframe d'édition (~1300px utiles
 *  avec le panneau du builder), une rangée démarre à x négatif — un clic à
 *  (8,8) tombe HORS viewport et n'atteint aucun élément (mesuré par sonde
 *  elementsFromPoint : pile vide, bbox.x = -119). L'extrémité droite (zone
 *  chevron) est, elle, toujours visible. */
async function clickRow(row: any): Promise<void> {
  const box = await row.boundingBox();
  if (!box) throw new Error('Rangée sans boîte cliquable.');
  await row.click({ position: { x: Math.max(24, box.width - 24), y: 8 } });
}

/** État observable d'une rangée : classe, aria, visibilité réelle des plans. */
const rowState = (row: any) => row.evaluate((el: HTMLElement) => ({
  open: el.classList.contains('accordion-row--etat-ouvert'),
  ariaExpanded: el.querySelector('[data-pqr-part="trigger"]')?.getAttribute('aria-expanded') ?? null,
  contenuHidden: (el.querySelector('[data-pqr-part="contenu"]') as HTMLElement | null)?.hidden ?? null,
  chevronDownHidden: (el.querySelector('[data-pqr-part="chevron-down"]') as HTMLElement | null)?.hidden ?? null,
  chevronUpHidden: (el.querySelector('[data-pqr-part="chevron-up"]') as HTMLElement | null)?.hidden ?? null,
}));

async function main() {
  const started = Date.now();
  const receipt = new Recueil('texte-seo-functional', 'odoo-019-foundation', 'texte-seo-contract-sample');
  if (!dockerDisponible()) {
    receipt.saute('spike Texte SEO sur Odoo', 'Docker indisponible', 'ODOO-LIMIT-NO-INSTANCE');
    receipt.ecrire('texte-seo-functional.json', Date.now() - started);
    process.exit(1);
  }

  await withInstance(async ({ browser, env }) => {
    const editor = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await editor.context.newPage();
      const frame = await enterEditor(page, env);
      if (!frame) {
        receipt.saute('éditeur Texte SEO', 'iframe de page ou builder absent', 'ODOO-LIMIT-EDITOR-ENTRY');
        return;
      }
      await insertTexteSeo(page);
      await insertTexteSeo(page);
      const roots = frame.locator(ROOT);
      const first = roots.first();
      const second = roots.nth(1);
      receipt.constateSi('catalogue — deux Texte SEO rendent leur sample',
        await roots.count() === 2 && await first.locator(ROW).count() === 3 && await second.locator(ROW).count() === 3,
        'A=3 lignes, B=3 lignes',
        `racines=${await roots.count()} · A=${await first.locator(ROW).count()} · B=${await second.locator(ROW).count()}`);

      const sampleStates = [await rowState(first.locator(ROW).nth(0)), await rowState(first.locator(ROW).nth(1)), await rowState(first.locator(ROW).nth(2))];
      receipt.constateSi('sample — la 2e ligne se pose ouverte, les deux autres fermées (contrat)',
        !sampleStates[0].open && sampleStates[1].open && !sampleStates[2].open &&
        sampleStates[1].ariaExpanded === 'true' && sampleStates[1].contenuHidden === false &&
        sampleStates[0].ariaExpanded === 'false' && sampleStates[0].contenuHidden === true,
        'fermé / ouvert / fermé, aria et hidden cohérents',
        JSON.stringify(sampleStates));

      // Après la 2e insertion, B est sélectionnée et sa barre d'overlay flotte
      // au-dessus de son bord haut — c'est-à-dire SUR le bas de A, où vivent
      // les rangées (le Texte SEO se termine par l'accordéon, contrairement à
      // la FAQ qui a un CTA en dessous). Re-sélectionner A par son interstice
      // haut déplace l'overlay hors de la zone des rangées.
      await selectRootGap(frame, first);
      const rowA1 = first.locator(ROW).nth(0);
      await clickRow(rowA1);
      await page.waitForTimeout(250);
      const boundary = await first.evaluate((root) => ({
        rootEditable: (root as HTMLElement).isContentEditable,
        titleEditable: (root.querySelector('[data-pqr-part="texte-seo-title"]') as HTMLElement | null)?.isContentEditable ?? null,
        textEditable: (root.querySelector('[data-pqr-part="texte-seo-text"]') as HTMLElement | null)?.isContentEditable ?? null,
        subtitleEditable: (root.querySelector('[data-pqr-part="texte-seo-subtitle"]') as HTMLElement | null)?.isContentEditable ?? null,
        rowTitreEditable: (root.querySelector('[data-pqr-accordion-row] [data-pqr-part="titre"]') as HTMLElement | null)?.isContentEditable ?? null,
        openContenuEditable: (root.querySelectorAll('[data-pqr-accordion-row]')[1]?.querySelector('[data-pqr-part="contenu"]') as HTMLElement | null)?.isContentEditable ?? null,
        listEditable: (root.querySelector('[data-pqr-accordion-list]') as HTMLElement | null)?.isContentEditable ?? null,
        triggerEditable: (root.querySelector('[data-pqr-part="trigger"]') as HTMLElement | null)?.isContentEditable ?? null,
      }));
      receipt.constateSi('frontière — les cinq textes décidés ouverts, la structure fermée',
        !boundary.rootEditable && boundary.titleEditable === true && boundary.textEditable === true &&
        boundary.subtitleEditable === true && boundary.rowTitreEditable === true &&
        boundary.openContenuEditable === true && boundary.listEditable === false && boundary.triggerEditable === false,
        'racine=false, titre/texte/sous-titre/question/réponse=true, liste/trigger=false',
        JSON.stringify(boundary));

      // Un VRAI clic sur le titre doit traverser l'overlay du déclencheur
      // (le trigger du contrat est posé en absolu au-dessus de la rangée).
      await rowA1.locator('[data-pqr-part="titre"]').click({ timeout: 3000 });
      await rowA1.locator('[data-pqr-part="titre"]').fill('Question spike A1');
      receipt.constateSi('édition — un vrai clic sur la question traverse l\'overlay et accepte la frappe',
        (await rowA1.locator('[data-pqr-part="titre"]').textContent())?.trim() === 'Question spike A1',
        'Question spike A1',
        `${await rowA1.locator('[data-pqr-part="titre"]').textContent()}`);

      await rowPanel(page).locator('[data-pqr-control="row-etat"] input[type="checkbox"]').click();
      await page.waitForTimeout(250);
      const afterToggle = await rowState(rowA1);
      const b1Untouched = await rowState(second.locator(ROW).nth(0));
      receipt.constateSi('panneau — « Ouverte au chargement » ouvre la ligne ciblée sans fuite vers B',
        afterToggle.open && afterToggle.ariaExpanded === 'true' && afterToggle.contenuHidden === false &&
        afterToggle.chevronUpHidden === false && afterToggle.chevronDownHidden === true &&
        !b1Untouched.open,
        'A1 ouverte (classe, aria, hidden), B1 toujours fermée',
        JSON.stringify({ afterToggle, b1Untouched }));

      await rowA1.locator('[data-pqr-part="contenu"]').fill('Réponse spike A1');
      receipt.constateSi('édition — la réponse ouverte accepte une frappe réelle',
        (await rowA1.locator('[data-pqr-part="contenu"]').textContent())?.trim() === 'Réponse spike A1',
        'Réponse spike A1',
        `${await rowA1.locator('[data-pqr-part="contenu"]').textContent()}`);

      // En mode édition, l'interaction publique est absente : le déclencheur
      // ne doit PAS basculer la rangée (le panneau est le seul chemin).
      const rowB2 = second.locator(ROW).nth(1);
      const beforeInert = await rowState(rowB2);
      await rowB2.locator('[data-pqr-part="trigger"]').click({ force: true });
      await page.waitForTimeout(200);
      const afterInert = await rowState(rowB2);
      receipt.constateSi('édition — le déclencheur est inerte (interaction publique absente de l\'éditeur)',
        beforeInert.open === afterInert.open && afterInert.open === true,
        'B2 reste ouverte, aucune bascule sauvage',
        JSON.stringify({ beforeInert, afterInert }));

      await first.locator('[data-pqr-part="texte-seo-subtitle"]').click({ timeout: 3000 });
      await first.locator('[data-pqr-part="texte-seo-subtitle"]').fill('Sous-titre spike');
      receipt.constateSi('édition — le sous-titre accepte une frappe réelle',
        (await first.locator('[data-pqr-part="texte-seo-subtitle"]').textContent())?.trim() === 'Sous-titre spike',
        'Sous-titre spike',
        `${await first.locator('[data-pqr-part="texte-seo-subtitle"]').textContent()}`);

      await selectRootGap(frame, first);
      await rootPanel(page).getByRole('button', { name: 'Ajouter une question' }).click();
      await page.waitForTimeout(200);
      const added = first.locator(ROW).last();
      const addedState = await rowState(added);
      receipt.constateSi('repeat — ajout ciblé, ligne neuve FERMÉE, sans fuite',
        await first.locator(ROW).count() === 4 && await second.locator(ROW).count() === 3 && !addedState.open && addedState.ariaExpanded === 'false',
        'A=4 (nouvelle fermée), B=3',
        `A=${await first.locator(ROW).count()} · B=${await second.locator(ROW).count()} · ajoutée=${JSON.stringify(addedState)}`);

      const marker = await added.getAttribute('data-pqr-seo-marker');
      await clickRow(added);
      await page.waitForTimeout(200);
      await rowPanel(page).getByRole('button', { name: 'Monter' }).click();
      await page.waitForTimeout(200);
      const markers = await first.locator(ROW).evaluateAll((rows: Element[]) => rows.map((row) => row.getAttribute('data-pqr-seo-marker')));
      receipt.constateSi('repeat — réordre ciblé', markers.at(-2) === marker && await second.locator(ROW).count() === 3, `${marker} en avant-dernière position de A`, markers.join(', '));

      const moved = first.locator(`${ROW}[data-pqr-seo-marker="${marker}"]`);
      await clickRow(moved);
      await page.waitForTimeout(150);
      await rowPanel(page).getByRole('button', { name: 'Supprimer la question' }).click();
      await page.waitForTimeout(200);
      receipt.constateSi('repeat — suppression ciblée', await first.locator(ROW).count() === 3 && await second.locator(ROW).count() === 3, 'A=3, B=3', `A=${await first.locator(ROW).count()} · B=${await second.locator(ROW).count()}`);

      const save = page.locator('.o-snippets-top-actions button[data-action="save"]').first();
      const responsePromise = page.waitForResponse((response) => response.url().includes('/web/dataset/call_kw/ir.ui.view/save'), { timeout: 30_000 }).catch(() => null);
      await save.click();
      const response = await responsePromise;
      receipt.constateSi('save — le DOM Texte SEO est persisté (A1 ouverte au moment du save)', response !== null && response.ok(), 'RPC save 2xx', response ? `HTTP ${response.status()}` : 'aucun RPC');
    } finally {
      await editor.context.close();
    }

    const reopened = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await reopened.context.newPage();
      const frame = await enterEditor(page, env);
      const state = frame ? await frame.locator(ROOT).evaluateAll((roots: Element[]) => roots.map((root) => ({
        rows: root.querySelectorAll('[data-pqr-accordion-row]').length,
        opens: [...root.querySelectorAll('[data-pqr-accordion-row]')].map((row) => row.classList.contains('accordion-row--etat-ouvert')),
        subtitle: root.querySelector('[data-pqr-part="texte-seo-subtitle"]')?.textContent?.trim() ?? '',
        titre1: root.querySelector('[data-pqr-accordion-row] [data-pqr-part="titre"]')?.textContent?.trim() ?? '',
        contenu1: root.querySelector('[data-pqr-accordion-row] [data-pqr-part="contenu"]')?.textContent?.trim() ?? '',
      }))) : [];
      receipt.constateSi('reopen — états par ligne et textes survivent, B intacte',
        state.length === 2 && state[0].rows === 3 && JSON.stringify(state[0].opens) === JSON.stringify([true, true, false]) &&
        state[0].subtitle === 'Sous-titre spike' && state[0].titre1 === 'Question spike A1' && state[0].contenu1 === 'Réponse spike A1' &&
        state[1].rows === 3 && JSON.stringify(state[1].opens) === JSON.stringify([false, true, false]),
        'A=[ouverte, ouverte, fermée] éditée · B=[fermée, ouverte, fermée] intacte',
        JSON.stringify(state));
    } finally {
      await reopened.context.close();
    }

    const publique = await ouvrirSessionPublique(browser);
    try {
      const page = await publique.context.newPage();
      await page.goto(`${baseUrl(env)}${HARNESS_PATH}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      // Le geste ne part qu'une fois l'Interaction réellement démarrable : le
      // module doit être chargé ET la file du loader vide. Cliquer plus tôt
      // frappe un déclencheur sans handler — mesuré au run 4 : le clic « réussit »
      // et rien ne bascule, pendant qu'une sonde à +3 s bascule parfaitement.
      await page.waitForFunction(() => {
        const w = window as unknown as { odoo?: { loader?: { modules?: Map<string, unknown>; jobs?: Set<unknown> } } };
        return Boolean(w.odoo?.loader?.modules?.has('@piqueray_ds/js/texte_seo_interaction')) && (w.odoo?.loader?.jobs?.size ?? 1) === 0;
      }, undefined, { timeout: 30_000 });
      await page.waitForTimeout(400);
      const firstRoot = page.locator(ROOT).first();
      receipt.constateSi('public — aucune zone contenteditable',
        await page.locator(`${ROOT} [contenteditable="true"]`).count() === 0,
        '0 contenteditable', `${await page.locator(`${ROOT} [contenteditable="true"]`).count()}`);

      const a1 = firstRoot.locator(ROW).nth(0);
      const servedOpen = await rowState(a1);
      receipt.constateSi('public — A1 servie OUVERTE comme sauvegardée, réponse éditée servie',
        servedOpen.open && servedOpen.ariaExpanded === 'true' && servedOpen.contenuHidden === false &&
        ((await a1.locator('[data-pqr-part="contenu"]').textContent())?.trim() === 'Réponse spike A1'),
        'A1 ouverte au chargement avec la réponse éditée',
        JSON.stringify({ servedOpen, contenu: await a1.locator('[data-pqr-part="contenu"]').textContent() }));

      await a1.locator('[data-pqr-part="trigger"]').click();
      await page.waitForTimeout(200);
      const closed = await rowState(a1);
      await a1.locator('[data-pqr-part="trigger"]').click();
      await page.waitForTimeout(200);
      const reopenedRow = await rowState(a1);
      receipt.constateSi('public — le trigger replie puis redéplie la ligne (Interaction du noyau)',
        !closed.open && closed.ariaExpanded === 'false' && closed.contenuHidden === true &&
        reopenedRow.open && reopenedRow.ariaExpanded === 'true' && reopenedRow.contenuHidden === false,
        'ouverte → fermée → ouverte, aria et hidden suivent',
        JSON.stringify({ closed, reopenedRow }));

      const consoleErrors = publique.journal.console.filter((l) => l.startsWith('[error]'));
      receipt.constateSi('public — zéro erreur console pendant la bascule',
        consoleErrors.length === 0, '0 erreur', consoleErrors.slice(0, 3).join(' | ') || '0');
    } finally {
      await publique.context.close();
    }
  });

  const done = receipt.ecrire('texte-seo-functional.json', Date.now() - started);
  process.exit(done.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => { console.error(`✖ ${error instanceof Error ? error.message : String(error)}`); process.exit(1); });
}
