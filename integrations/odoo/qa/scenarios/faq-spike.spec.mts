/**
 * Spike de mécanisme FAQ — AVANT toute preuve, jamais après (guide canonique §3).
 *
 * Les mécanismes RISQUÉS de ds.faq, chacun jamais exercé dans cet addon :
 *   1. le DOM à deux plans d'état (fermé/ouvert sous `hidden`) rend fermé
 *      fidèlement et l'éditeur n'ouvre QUE le titre (le contenu caché n'est pas
 *      une zone de frappe fantôme) ;
 *   2. la bascule ÉDITEUR passe par le panneau (pqrToggleFaqRow), ciblée sur la
 *      rangée sélectionnée, sans fuite vers l'autre instance ;
 *   3. la collection add/move/remove reste ciblée (patron Équipe transposé) —
 *      la rangée 3 du contrat est un item ordinaire, ajout FERMÉ en fin ;
 *   4. le clic RÉEL sur le déclencheur en mode ÉDITION ne bascule PAS
 *      (l'interaction publique est remplacée par les variantes `.edit` du
 *      noyau — hypothèse lue dans website/__manifest__.py:235, mesurée ici) ;
 *   5. après save, le HTML SAUVEGARDÉ bascule au clic public réel,
 *      aria-expanded suit, et une rangée sauvegardée OUVERTE se rouvre ouverte ;
 *   6. zéro erreur console imputable à piqueray_ds sur le chemin public.
 *
 * Si un mécanisme ne tient pas : la limite s'écrit dans proofs/limits.json
 * AVANT tout claim, et le QWeb est révisé — jamais l'inverse.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Frame, Page } from 'playwright-core';
import { Recueil } from '../lib/receipt.mts';
import {
  EDITOR_TIMEOUT_MS,
  NAV_TIMEOUT_MS,
  baseUrl,
  dockerDisponible,
  ouvrirSessionEditeur,
  ouvrirSessionPublique,
  withInstance,
  type QaEnv,
} from '../run.mts';

const ROOT = '.s_pqr_faq';
const ROW = '[data-pqr-faq-row]';
const HARNESS_PATH = '/piqueray-harness/faq';

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

async function insertFaq(page: Page): Promise<void> {
  const content = page.locator('.o_snippet_thumbnail')
    .filter({ has: page.locator('.o_snippet_thumbnail_title', { hasText: 'Content' }) }).first();
  await content.locator('button').click();
  const dialog = page.locator('.modal').last();
  await dialog.locator('input[type="search"]').fill('FAQ');
  await page.waitForTimeout(300);
  const chooser = await dialog.locator('iframe').contentFrame();
  if (!chooser) throw new Error('Iframe du catalogue Website absente.');
  await chooser.locator('[aria-label="Piqueray · FAQ"]').click();
  await page.waitForTimeout(400);
}

const rootPanel = (page: Page) => page.locator('.options-container:visible')
  .filter({ has: page.locator('[data-pqr-control="faq-collection"]') }).first();
const rowPanel = (page: Page) => page.locator('.options-container:visible')
  .filter({ has: page.locator('[data-pqr-control="faq-row-remove"]') }).first();

async function selectRootGap(frame: Frame, root: any): Promise<void> {
  const box = await root.boundingBox();
  if (!box) throw new Error('Racine FAQ sans boîte sélectionnable.');
  const x = Math.min(Math.max(box.width / 4, 8), box.width - 8);
  await root.click({ position: { x, y: Math.min(8, Math.max(1, box.height - 1)) } });
  await frame.page().waitForTimeout(250);
}

/** L'état observable d'une rangée, côté frame ou page. */
const rowState = (row: any) => row.evaluate((el: Element) => ({
  open: el.classList.contains('accordion-row--etat-ouvert'),
  closed: el.classList.contains('accordion-row--etat-ferme'),
  contenuHidden: (el.querySelector('[data-pqr-part="contenu"]') as HTMLElement | null)?.hidden ?? null,
  contenuVisible: (() => {
    const c = el.querySelector('[data-pqr-part="contenu"]') as HTMLElement | null;
    return c ? c.getClientRects().length > 0 : null;
  })(),
  chevronDownHidden: (el.querySelector('[data-pqr-part="chevron-down"]') as HTMLElement | null)?.hidden ?? null,
  chevronUpHidden: (el.querySelector('[data-pqr-part="chevron-up"]') as HTMLElement | null)?.hidden ?? null,
  ariaExpanded: el.querySelector('[data-pqr-part="trigger"]')?.getAttribute('aria-expanded') ?? null,
}));

const estFermee = (s: Awaited<ReturnType<typeof rowState>>) =>
  !s.open && s.closed && s.contenuHidden === true && s.contenuVisible === false &&
  s.chevronDownHidden === false && s.chevronUpHidden === true && s.ariaExpanded === 'false';
const estOuverte = (s: Awaited<ReturnType<typeof rowState>>) =>
  s.open && !s.closed && s.contenuHidden === false && s.contenuVisible === true &&
  s.chevronDownHidden === true && s.chevronUpHidden === false && s.ariaExpanded === 'true';

async function main() {
  const started = Date.now();
  const receipt = new Recueil('faq-mechanism-spike', 'odoo-019-foundation', 'faq-contract-sample');
  if (!dockerDisponible()) {
    receipt.saute('spike FAQ sur Odoo', 'Docker indisponible', 'ODOO-LIMIT-NO-INSTANCE');
    receipt.ecrire('faq-mechanism-spike.json', Date.now() - started);
    process.exit(1);
  }

  await withInstance(async ({ browser, env }) => {
    // ── Phase ÉDITEUR : drop ×2, frontière, bascule panneau, collection, save.
    const editor = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await editor.context.newPage();
      const frame = await enterEditor(page, env);
      if (!frame) {
        receipt.saute('éditeur FAQ', 'iframe de page ou builder absent', 'ODOO-LIMIT-EDITOR-ENTRY');
        return;
      }
      await insertFaq(page);
      await insertFaq(page);
      const roots = frame.locator(ROOT);
      const first = roots.first();
      const second = roots.nth(1);
      receipt.constateSi('catalogue — deux FAQ rendent leurs 3 questions fermées',
        await roots.count() === 2 && await first.locator(ROW).count() === 3 && await second.locator(ROW).count() === 3,
        'racines=2, A=3, B=3',
        `racines=${await roots.count()} · A=${await first.locator(ROW).count()} · B=${await second.locator(ROW).count()}`);

      const firstRow = first.locator(ROW).first();
      await firstRow.click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(250);
      const boundary = await firstRow.evaluate((row) => ({
        rowEditable: (row as HTMLElement).isContentEditable,
        titreEditable: (row.querySelector('[data-pqr-part="titre"]') as HTMLElement | null)?.isContentEditable ?? null,
        contenuEditable: (row.querySelector('[data-pqr-part="contenu"]') as HTMLElement | null)?.isContentEditable ?? null,
        contenuVisible: ((row.querySelector('[data-pqr-part="contenu"]') as HTMLElement | null)?.getClientRects().length ?? 0) > 0,
        triggerEditable: (row.querySelector('[data-pqr-part="trigger"]') as HTMLElement | null)?.isContentEditable ?? null,
      }));
      receipt.constateSi('frontière — titre ouvert, rangée/déclencheur fermés, contenu caché',
        !boundary.rowEditable && boundary.titreEditable === true && boundary.triggerEditable === false && boundary.contenuVisible === false,
        'rangée=false, titre=true, déclencheur=false, contenu invisible',
        JSON.stringify(boundary));

      // Le déclencheur est un overlay absolu AU-DESSUS du titre : le geste qui
      // compte n'est pas « le titre est contentEditable » mais « un VRAI clic
      // de rédacteur atteint le titre ». Un échec ici = interception par
      // l'overlay, à résoudre côté bridge (pointer-events en édition) — jamais
      // en déplaçant le déclencheur, qui est la géométrie du contrat.
      let titreClicOk = true;
      let titreClicDetail = 'clic servi';
      try {
        // Clic dans la MOITIÉ HAUTE du titre — la zone que l'overlay du
        // déclencheur couvrait avant la règle pointer-events du bridge. Le
        // curseur est ensuite ramené en fin : l'insertion au point de clic est
        // le comportement contenteditable normal, pas le sujet du constat.
        const titre = firstRow.locator('[data-pqr-part="titre"]');
        const box = await titre.boundingBox();
        if (!box) throw new Error('titre sans boîte');
        const avant = (await titre.textContent())?.trim() ?? '';
        await titre.click({ position: { x: Math.min(24, box.width - 2), y: Math.max(2, box.height / 4) }, timeout: 3000 });
        await page.keyboard.type(' — éditée');
        await page.waitForTimeout(150);
        const titreTexte = (await titre.textContent())?.trim() ?? '';
        // La frappe s'insère AU POINT DE CLIC — le comportement contenteditable
        // que le rédacteur obtient réellement. Le constat mesure que le geste
        // atteint le titre, pas la navigation clavier de l'éditeur.
        titreClicOk = titreTexte.includes('— éditée') && titreTexte.length > avant.length;
        titreClicDetail = `texte après frappe : « ${titreTexte} »`;
      } catch (error) {
        titreClicOk = false;
        titreClicDetail = `clic intercepté : ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`;
      }
      receipt.constateSi('édition — un vrai clic sur le titre traverse l\'overlay du déclencheur',
        titreClicOk, 'clic servi puis frappe visible', titreClicDetail);

      // La bascule ÉDITEUR passe par le panneau de la rangée sélectionnée.
      await rowPanel(page).locator('[data-pqr-control="faq-row-etat"] input[type="checkbox"]').click();
      await page.waitForTimeout(250);
      const opened = await rowState(firstRow);
      const otherInstanceFirst = await rowState(second.locator(ROW).first());
      receipt.constateSi('bascule panneau — la rangée A1 s\'ouvre, B1 reste fermée',
        estOuverte(opened) && estFermee(otherInstanceFirst),
        'A1 ouverte (classe+hidden+aria), B1 fermée',
        `A1=${JSON.stringify(opened)} · B1=${JSON.stringify(otherInstanceFirst)}`);

      const contenuOuvert = await firstRow.evaluate((row) => ({
        editable: (row.querySelector('[data-pqr-part="contenu"]') as HTMLElement | null)?.isContentEditable ?? null,
      }));
      await firstRow.locator('[data-pqr-part="contenu"]').fill('Réponse spike A1');
      receipt.constateSi('édition — la réponse ouverte accepte une frappe réelle',
        contenuOuvert.editable === true && (await firstRow.locator('[data-pqr-part="contenu"]').textContent())?.trim() === 'Réponse spike A1',
        'contenu éditable, texte « Réponse spike A1 »',
        `éditable=${contenuOuvert.editable} · texte=« ${(await firstRow.locator('[data-pqr-part="contenu"]').textContent())?.trim()} »`);

      // Le clic RÉEL sur le déclencheur en ÉDITION ne doit PAS basculer.
      const secondRow = first.locator(ROW).nth(1);
      await secondRow.locator('[data-pqr-part="trigger"]').click({ force: true });
      await page.waitForTimeout(300);
      receipt.constateSi('édition — le clic déclencheur ne bascule pas (interaction publique absente)',
        estFermee(await rowState(secondRow)),
        'A2 reste fermée après clic trigger en édition',
        JSON.stringify(await rowState(secondRow)));

      // Collection : ajout FERMÉ en fin, réordre, suppression — ciblés sur A.
      await selectRootGap(frame, first);
      await rootPanel(page).getByRole('button', { name: 'Ajouter une question' }).click();
      await page.waitForTimeout(200);
      const addedState = await rowState(first.locator(ROW).last());
      receipt.constateSi('repeat — ajout ciblé, rangée neuve FERMÉE en fin',
        await first.locator(ROW).count() === 4 && await second.locator(ROW).count() === 3 && estFermee(addedState),
        'A=4 (dernière fermée), B=3',
        `A=${await first.locator(ROW).count()} · B=${await second.locator(ROW).count()} · dernière=${JSON.stringify(addedState)}`);

      const added = first.locator(ROW).last();
      const marker = await added.getAttribute('data-pqr-faq-marker');
      await added.click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(200);
      await rowPanel(page).getByRole('button', { name: 'Monter' }).click();
      await page.waitForTimeout(200);
      const markers = await first.locator(ROW).evaluateAll((rows: Element[]) => rows.map((row) => row.getAttribute('data-pqr-faq-marker')));
      receipt.constateSi('repeat — réordre ciblé', markers.at(-2) === marker && await second.locator(ROW).count() === 3,
        `${marker} en avant-dernière position de A`, markers.join(', '));

      const moved = first.locator(`${ROW}[data-pqr-faq-marker="${marker}"]`);
      await moved.click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(150);
      await rowPanel(page).getByRole('button', { name: 'Supprimer la question' }).click();
      await page.waitForTimeout(200);
      receipt.constateSi('repeat — suppression ciblée', await first.locator(ROW).count() === 3 && await second.locator(ROW).count() === 3,
        'A=3, B=3', `A=${await first.locator(ROW).count()} · B=${await second.locator(ROW).count()}`);

      // Save avec A1 laissée OUVERTE : l'état affiché est l'état sauvegardé.
      const save = page.locator('.o-snippets-top-actions button[data-action="save"]').first();
      const responsePromise = page.waitForResponse((response) => response.url().includes('/web/dataset/call_kw/ir.ui.view/save'), { timeout: 30_000 }).catch(() => null);
      await save.click();
      const response = await responsePromise;
      receipt.constateSi('save — le DOM FAQ est persisté (A1 ouverte au moment du save)',
        response !== null && response.ok(), 'RPC save 2xx', response ? `HTTP ${response.status()}` : 'aucun RPC');
    } finally {
      await editor.context.close();
    }

    // ── Phase PUBLIQUE : le HTML sauvegardé bascule au vrai clic.
    const publicSession = await ouvrirSessionPublique(browser);
    try {
      const page = await publicSession.context.newPage();
      await page.goto(`${baseUrl(env)}${HARNESS_PATH}`, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
      await page.waitForTimeout(1200);
      const roots = page.locator(ROOT);
      const first = roots.first();
      const a1 = first.locator(ROW).first();
      receipt.constateSi('public — 2 racines, A1 rouverte OUVERTE comme sauvegardée, réponse éditée servie',
        await roots.count() === 2 && estOuverte(await rowState(a1)) &&
          (await a1.locator('[data-pqr-part="contenu"]').textContent())?.trim() === 'Réponse spike A1',
        'racines=2, A1 ouverte, contenu « Réponse spike A1 »',
        `racines=${await roots.count()} · A1=${JSON.stringify(await rowState(a1))} · contenu=« ${(await a1.locator('[data-pqr-part="contenu"]').textContent())?.trim()} »`);

      // Bascule publique RÉELLE : fermer A1, ouvrir A2, re-fermer A2.
      await a1.locator('[data-pqr-part="trigger"]').click();
      await page.waitForTimeout(200);
      receipt.constateSi('public — clic déclencheur ferme A1', estFermee(await rowState(a1)), 'A1 fermée', JSON.stringify(await rowState(a1)));

      const a2 = first.locator(ROW).nth(1);
      await a2.locator('[data-pqr-part="trigger"]').click();
      await page.waitForTimeout(200);
      const a2Open = await rowState(a2);
      await a2.locator('[data-pqr-part="trigger"]').click();
      await page.waitForTimeout(200);
      receipt.constateSi('public — A2 s\'ouvre puis se referme au clic', estOuverte(a2Open) && estFermee(await rowState(a2)),
        'A2 ouverte après 1er clic, fermée après 2e', `après 1er clic=${JSON.stringify(a2Open)} · après 2e=${JSON.stringify(await rowState(a2))}`);

      // La 2e instance garde ses bascules indépendantes.
      const b1 = roots.nth(1).locator(ROW).first();
      await b1.locator('[data-pqr-part="trigger"]').click();
      await page.waitForTimeout(200);
      receipt.constateSi('public — bascule B1 indépendante, A1 inchangée',
        estOuverte(await rowState(b1)) && estFermee(await rowState(a1)),
        'B1 ouverte, A1 fermée', `B1=${JSON.stringify(await rowState(b1))} · A1=${JSON.stringify(await rowState(a1))}`);

      const piquerayErrors = publicSession.journal.console.filter((line) => /piqueray|faq/i.test(line));
      receipt.constateSi('public — aucune erreur console imputable à piqueray_ds',
        piquerayErrors.length === 0, '0 erreur', piquerayErrors.join(' | ') || '0 erreur');
    } finally {
      await publicSession.context.close();
    }
  });

  const done = receipt.ecrire('faq-mechanism-spike.json', Date.now() - started);
  process.exit(done.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => { console.error(`✖ ${error instanceof Error ? error.message : String(error)}`); process.exit(1); });
}
