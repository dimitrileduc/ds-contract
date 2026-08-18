/**
 * Spike de mécanisme SAV — AVANT le polish, sur instance propre (guide canonique, étape 3).
 *
 * Les mécanismes RISQUÉS de cette racine, exercés ici et nulle part avant :
 *   1. `line-break` — première zone du module à le déclarer (`data-pqr-marks="strong,line-break"`).
 *      Le contenu par défaut porte un <br> dur ; le guard déplie tout ce qui n'est pas déclaré
 *      à la sauvegarde. Gestes réels : Shift+Enter dans la zone, puis save/reopen.
 *   2. DEUX plans média sur la même racine (fond pleine largeur + photo) — un remplacement
 *      ne doit jamais toucher l'autre plan, ni fuiter vers la seconde instance.
 *   3. Plans absolus superposés (WrapperBackground / ImgGroupBackground) — la frontière
 *      d'éditabilité doit tenir malgré la superposition, et le clic bitmap direct ne doit
 *      rouvrir aucun conteneur natif d'image (leçon Équipe, 2026-08-11).
 */
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Frame, Page } from 'playwright-core';
import { Recueil, REPO } from '../lib/receipt.mts';
import {
  EDITOR_TIMEOUT_MS,
  baseUrl,
  dockerDisponible,
  ouvrirSessionEditeur,
  withInstance,
  type QaEnv,
} from '../run.mts';

const ROOT = '.s_pqr_sav';
const HARNESS_PATH = '/piqueray-harness/sav';
const UPLOAD_IMAGE = path.join(REPO, 'site/docs-shots/home-light.png');
const SECOND_UPLOAD_IMAGE = path.join(REPO, 'site/docs-shots/how-model-light.png');
const fixture = JSON.parse(readFileSync(path.join(REPO, 'integrations/odoo/qa/fixtures/sav-panel.json'), 'utf8'));

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
  await chooser.locator('[aria-label="Piqueray · SAV"]').click();
  await page.waitForTimeout(400);
}

const rootPanel = (page: Page) => page.locator('.options-container:visible')
  .filter({ has: page.locator('[data-pqr-control="sav-body"]') }).first();

/** L'état observable d'une racine SAV — tout ce que le spike doit comparer. */
async function etat(frame: Frame) {
  return frame.locator(ROOT).evaluateAll((roots: Element[]) => roots.map((root) => {
    const texte = root.querySelector('[data-pqr-part="sav-text"]');
    return {
      titre: root.querySelector('[data-pqr-part="sav-title"]')?.textContent?.trim() ?? '',
      br: texte ? texte.querySelectorAll('br').length : -1,
      strong: texte ? texte.querySelectorAll('strong, b').length : -1,
      em: texte ? texte.querySelectorAll('em, i').length : -1,
      texte: texte?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
      cta: root.querySelector('[data-pqr-part="sav-cta"] [data-pqr-part="button-label"]')?.textContent?.trim() ?? '',
      photoSrc: root.querySelector('[data-pqr-part="sav-photo"]')?.getAttribute('src') ?? null,
      fondSrc: root.querySelector('[data-pqr-part="sav-background"]')?.getAttribute('src') ?? null,
    };
  }));
}

async function main() {
  const started = Date.now();
  const receipt = new Recueil('sav-mechanism-spike', 'odoo-019-foundation', 'sav-contract-sample');
  if (!dockerDisponible()) {
    receipt.saute('spike SAV sur Odoo', 'Docker indisponible', 'ODOO-LIMIT-NO-INSTANCE');
    receipt.ecrire('sav-mechanism-spike.json', Date.now() - started);
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
      const initial = await etat(frame);
      receipt.constateSi(
        'catalogue — deux SAV rendent le défaut du contrat (1 <br> dur, 3 plages fortes)',
        initial.length === 2 && initial.every((r) => r.br === 1 && r.strong === 3 && r.em === 0 && r.titre === 'Dépannage / SAV'),
        '2 racines · br=1 · strong=3 · em=0 · titre par défaut',
        JSON.stringify(initial.map((r) => ({ titre: r.titre, br: r.br, strong: r.strong, em: r.em }))),
      );

      const texteA = first.locator('[data-pqr-part="sav-text"]');
      await texteA.click();
      await page.waitForTimeout(250);
      const frontiere = await first.evaluate((root) => ({
        racine: (root as HTMLElement).isContentEditable,
        titre: (root.querySelector('[data-pqr-part="sav-title"]') as HTMLElement | null)?.isContentEditable ?? null,
        texte: (root.querySelector('[data-pqr-part="sav-text"]') as HTMLElement | null)?.isContentEditable ?? null,
        cta: (root.querySelector('[data-pqr-part="sav-cta"] [data-pqr-part="button-label"]') as HTMLElement | null)?.isContentEditable ?? null,
        section: (root.querySelector('[data-pqr-part="sav-section"]') as HTMLElement | null)?.isContentEditable ?? null,
        planBlanc: (root.querySelector('[data-pqr-part="sav-wrapper-background"]') as HTMLElement | null)?.isContentEditable ?? null,
        planBleu: (root.querySelector('[data-pqr-part="sav-img-group-background"]') as HTMLElement | null)?.isContentEditable ?? null,
        fond: (root.querySelector('[data-pqr-part="sav-background"]') as HTMLElement | null)?.isContentEditable ?? null,
        photo: (root.querySelector('[data-pqr-part="sav-photo"]') as HTMLElement | null)?.isContentEditable ?? null,
      }));
      receipt.constateSi(
        'frontière — 3 textes ouverts, structure et plans superposés fermés',
        frontiere.racine === false && frontiere.titre === true && frontiere.texte === true && frontiere.cta === true &&
          frontiere.section === false && frontiere.planBlanc === false && frontiere.planBleu === false &&
          frontiere.fond === false && frontiere.photo === false,
        'titre/texte/CTA=true, racine/section/plans/médias=false',
        JSON.stringify(frontiere),
      );

      // Gestes réels : frappe, Shift+Enter (LE mécanisme sous test), puis une
      // marque non déclarée injectée que le guard doit déplier au save.
      await page.keyboard.press('End');
      await page.keyboard.type(' Ajout spike.');
      await page.keyboard.press('Shift+Enter');
      await page.keyboard.type('Ligne spike.');
      await texteA.evaluate((zone) => {
        const em = document.createElement('em');
        em.textContent = 'italique spike';
        zone.append(' ', em);
      });
      await first.locator('[data-pqr-part="sav-title"]').fill('Titre spike A');
      await first.locator('[data-pqr-part="sav-cta"] [data-pqr-part="button-label"]').fill('CTA spike A');
      const apresGestes = (await etat(frame))[0];
      receipt.constateSi(
        'édition directe — frappe réelle, Shift+Enter produit un saut de ligne, marque hostile en place',
        apresGestes.br >= 2 && apresGestes.em === 1 && apresGestes.titre === 'Titre spike A' && apresGestes.cta === 'CTA spike A' &&
          apresGestes.texte.includes('Ajout spike.') && apresGestes.texte.includes('Ligne spike.'),
        'br≥2 · em=1 (avant save) · titre et CTA saisis',
        JSON.stringify({ br: apresGestes.br, em: apresGestes.em, titre: apresGestes.titre, cta: apresGestes.cta }),
      );

      // Clic bitmap direct sur la photo : aucun conteneur natif d'image ne doit
      // rouvrir (leçon Équipe — la preuve sur le parent ne détecte pas ce trou).
      await first.locator('[data-pqr-part="sav-photo"]').click();
      await page.waitForTimeout(250);
      const chromeVisible = (await page.locator('.options-container:visible').allInnerTexts())
        .join(' ').replace(/\s+/g, ' ').toLowerCase();
      const natifsExposes = fixture.forbiddenNativeOptions.filter((label: string) => chromeVisible.includes(label.toLowerCase()));
      receipt.constateSi(
        'canvas photo — aucun conteneur natif image au clic bitmap direct',
        natifsExposes.length === 0,
        'replace/crop/filter/link/shape/format/style absents',
        natifsExposes.length ? natifsExposes.join(', ') : 'aucune option native',
      );

      const controles = [...new Set(await rootPanel(page).locator('[data-pqr-control]')
        .evaluateAll((nodes: Element[]) => nodes.map((n) => n.getAttribute('data-pqr-control') ?? '')))].sort();
      receipt.constateSi(
        'panneau — inventaire strict des contrôles SAV déclarés',
        JSON.stringify(controles) === JSON.stringify([...fixture.rootControls].sort()),
        [...fixture.rootControls].sort().join(', '),
        controles.join(', ') || '(aucun)',
      );

      // Plan 1/2 : la PHOTO. Le remplacement ne doit toucher ni le fond de A ni la racine B.
      await rootPanel(page).locator('[data-pqr-control="sav-photo-url"]').getByRole('button', { name: 'Remplacer' }).click();
      const dialoguePhoto = page.locator('.modal').filter({ has: page.locator('.o_select_media_dialog') }).last();
      await dialoguePhoto.waitFor({ state: 'visible', timeout: 10_000 });
      const onglets = (await dialoguePhoto.locator('.o_select_media_dialog .nav-link').allTextContents()).map((t) => t.trim());
      await dialoguePhoto.locator('input.o_file_input').setInputFiles(UPLOAD_IMAGE);
      await dialoguePhoto.waitFor({ state: 'hidden', timeout: 30_000 });
      await page.waitForTimeout(300);
      const apresPhoto = await etat(frame);
      receipt.constateSi(
        'média photo — remplacée sans toucher le fond de A ni la seconde instance',
        onglets.length === 1 && onglets[0] === 'Images' && Boolean(apresPhoto[0].photoSrc) &&
          !apresPhoto[0].fondSrc && !apresPhoto[1].photoSrc && !apresPhoto[1].fondSrc,
        'Images seulement · A.photo remplie · A.fond vide · B intacte',
        JSON.stringify({ onglets, A: { photo: Boolean(apresPhoto[0].photoSrc), fond: apresPhoto[0].fondSrc }, B: { photo: apresPhoto[1].photoSrc, fond: apresPhoto[1].fondSrc } }),
      );

      // Plan 2/2 : le FOND, avec une image DIFFÉRENTE — deux src réellement comparés.
      await first.locator('[data-pqr-part="sav-photo"]').click();
      await page.waitForTimeout(200);
      await rootPanel(page).locator('[data-pqr-control="sav-background-url"]').getByRole('button', { name: 'Remplacer' }).click();
      const dialogueFond = page.locator('.modal').filter({ has: page.locator('.o_select_media_dialog') }).last();
      await dialogueFond.waitFor({ state: 'visible', timeout: 10_000 });
      await dialogueFond.locator('input.o_file_input').setInputFiles(SECOND_UPLOAD_IMAGE);
      await dialogueFond.waitFor({ state: 'hidden', timeout: 30_000 });
      await page.waitForTimeout(300);
      const apresFond = await etat(frame);
      receipt.constateSi(
        'média fond — rempli avec une source distincte de la photo, B toujours intacte',
        Boolean(apresFond[0].fondSrc) && Boolean(apresFond[0].photoSrc) && apresFond[0].fondSrc !== apresFond[0].photoSrc &&
          !apresFond[1].photoSrc && !apresFond[1].fondSrc,
        'A.fond ≠ A.photo, tous deux remplis · B vide',
        JSON.stringify({ A: { photo: apresFond[0].photoSrc, fond: apresFond[0].fondSrc }, B: { photo: apresFond[1].photoSrc, fond: apresFond[1].fondSrc } }),
      );

      const save = page.locator('.o-snippets-top-actions button[data-action="save"]').first();
      const responsePromise = page.waitForResponse((response) => response.url().includes('/web/dataset/call_kw/ir.ui.view/save'), { timeout: 30_000 }).catch(() => null);
      await save.click();
      const response = await responsePromise;
      receipt.constateSi('save — le DOM SAV est persisté', response !== null && response.ok(), 'RPC save 2xx', response ? `HTTP ${response.status()}` : 'aucun RPC');
    } finally {
      await editor.context.close();
    }

    const reopened = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await reopened.context.newPage();
      const frame = await enterEditor(page, env);
      const saved = frame ? await etat(frame) : [];
      const a = saved[0];
      receipt.constateSi(
        'reopen — les <br> survivent au guard, l’<em> hostile est déplié texte gardé, les médias persistent',
        saved.length === 2 && a.br >= 2 && a.em === 0 && a.strong === 3 &&
          a.texte.includes('Ajout spike.') && a.texte.includes('Ligne spike.') && a.texte.includes('italique spike') &&
          a.titre === 'Titre spike A' && a.cta === 'CTA spike A' &&
          /\/web\/(image|content)\//.test(a.photoSrc ?? '') && /\/web\/(image|content)\//.test(a.fondSrc ?? '') &&
          a.photoSrc !== a.fondSrc &&
          saved[1].br === 1 && saved[1].strong === 3 && saved[1].titre === 'Dépannage / SAV' && !saved[1].photoSrc,
        'A : br≥2, em=0, strong=3, textes gardés, 2 médias /web/ distincts · B : défaut intact',
        JSON.stringify(saved.map((r) => ({ titre: r.titre, br: r.br, em: r.em, strong: r.strong, photo: r.photoSrc, fond: r.fondSrc }))),
      );
    } finally {
      await reopened.context.close();
    }
  });

  const done = receipt.ecrire('sav-mechanism-spike.json', Date.now() - started);
  process.exit(done.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => { console.error(`✖ ${error instanceof Error ? error.message : String(error)}`); process.exit(1); });
}
