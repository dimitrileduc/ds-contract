/**
 * Spike D9 (spec 022, US1) — le bloc Tél/Email de Coordonnées, AVANT tout claim.
 *
 * Le mécanisme RISQUÉ, exercé ici et nulle part avant (leçon 018 : « lu mais non
 * confirmé » = à exécuter) :
 *   · Q-C1 Option A — téléphone et email en vrais liens `tel:`/`mailto:` (marque
 *     `link`), le saut de ligne du contrat rendu par `white-space: pre-line`
 *     (marque `line-break`), le soulignement posé par le pont (neutralisation UA).
 *   · Survie de TOUT cela à travers pose → édition → save → reopen → public.
 *
 * Échec ⇒ retour au gate, jamais contourné.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Frame, Page } from 'playwright-core';
import { PROOFS, Recueil } from '../lib/receipt.mts';
import { enterEditor as enterHarnessEditor } from '../lib/editor.mts';
import {
  NAV_TIMEOUT_MS, baseUrl, dockerDisponible,
  ouvrirSessionEditeur, ouvrirSessionPublique, withInstance, type QaEnv,
} from '../run.mts';

const ROOT = '.s_pqr_coordonnees';
const HARNESS_PATH = '/piqueray-harness/coordonnees';
const BLOC = '[data-pqr-part="coordonnees-contact-block"]';

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

/** L'état observable du bloc Tél/Email — tout ce que le spike doit comparer. */
async function etatBloc(scope: { locator: (s: string) => any }): Promise<any> {
  return scope.locator(ROOT).first().evaluate((root: Element, sel: string) => {
    const bloc = root.querySelector(sel) as HTMLElement | null;
    if (!bloc) return null;
    const tel = bloc.querySelector('a[href^="tel:"]') as HTMLElement | null;
    const mail = bloc.querySelector('a[href^="mailto:"]') as HTMLElement | null;
    const decoration = tel ? getComputedStyle(tel).textDecorationLine : '';
    return {
      telHref: tel?.getAttribute('href') ?? '',
      mailHref: mail?.getAttribute('href') ?? '',
      links: bloc.querySelectorAll('a').length,
      br: bloc.querySelectorAll('br').length,
      whiteSpace: getComputedStyle(bloc).whiteSpace,
      // le saut de ligne du défaut est un `\n` (pre-line), pas un <br> : on le
      // lit dans le texte brut du nœud, avant toute frappe.
      rawNewlines: (bloc.textContent ?? '').split('\n').length - 1,
      underline: /underline/.test(decoration),
      text: (bloc.textContent ?? '').replace(/\s+/g, ' ').trim(),
    };
  }, BLOC);
}

async function main() {
  const started = Date.now();
  const receipt = new Recueil('coordonnees-contact-spike', 'odoo-019-foundation', 'coordonnees-contact-sample');
  if (!dockerDisponible()) {
    receipt.saute('spike Coordonnées sur Odoo', 'Docker indisponible', 'ODOO-LIMIT-NO-INSTANCE');
    receipt.ecrire('coordonnees-contact-spike.json', Date.now() - started);
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

      // 1. DÉFAUT — 2 liens, saut de ligne pre-line, soulignement présent.
      const avant = await etatBloc(frame);
      receipt.constateSi('défaut — tel:/mailto: + saut de ligne pre-line + soulignement',
        avant && /^tel:/.test(avant.telHref) && /^mailto:/.test(avant.mailHref) && avant.links === 2 && /pre-line|pre-wrap/.test(avant.whiteSpace) && avant.rawNewlines >= 1 && avant.underline === true,
        '2 liens · white-space pre-line · ≥1 saut brut · souligné',
        JSON.stringify(avant));

      // 2. ÉDITION réelle — Shift+Enter puis frappe d'une 3e ligne dans le bloc.
      const bloc = frame.locator(BLOC);
      await bloc.click();
      await page.keyboard.press('End');
      await page.keyboard.press('Shift+Enter');
      await page.keyboard.type('Fax : 087 00 00 00');
      await page.waitForTimeout(200);
      const apresEdition = await etatBloc(frame);
      receipt.constateSi('édition — Shift+Enter ajoute un saut (br), les 2 liens survivent',
        apresEdition && apresEdition.links === 2 && apresEdition.br >= 1 && /Fax/.test(apresEdition.text),
        '2 liens conservés · ≥1 <br> · « Fax » présent',
        JSON.stringify({ links: apresEdition?.links, br: apresEdition?.br, text: apresEdition?.text }));

      // 3. SAVE.
      const save = page.locator('.o-snippets-top-actions button[data-action="save"]').first();
      const responsePromise = page.waitForResponse((r) => r.url().includes('/web/dataset/call_kw/ir.ui.view/save'), { timeout: 30_000 }).catch(() => null);
      await save.click();
      const response = await responsePromise;
      receipt.constateSi('save — Odoo persiste le bloc édité', response !== null && response.ok(), 'RPC save 2xx', response ? `HTTP ${response.status()}` : 'aucun RPC');
    } finally {
      await editor.context.close();
    }

    // 4. REOPEN éditeur — le DOM sauvegardé porte encore liens + saut + « Fax ».
    const reopened = await ouvrirSessionEditeur(browser, env);
    try {
      const page = await reopened.context.newPage();
      const frame = await enterEditor(page, env);
      const apresReouverture = frame ? await etatBloc(frame) : null;
      receipt.constateSi('reopen — liens, saut et « Fax » relus du DOM sauvegardé',
        apresReouverture && apresReouverture.links === 2 && /^tel:/.test(apresReouverture.telHref) && /^mailto:/.test(apresReouverture.mailHref) && (apresReouverture.br >= 1 || apresReouverture.rawNewlines >= 1) && /Fax/.test(apresReouverture.text),
        '2 liens · tel:/mailto: · saut conservé · « Fax »',
        JSON.stringify(apresReouverture));
    } finally {
      await reopened.context.close();
    }

    // 5. PUBLIC — session anonyme : liens + soulignement + aucune URL exécutable.
    const publicSession = await ouvrirSessionPublique(browser);
    try {
      const page = await publicSession.context.newPage();
      const response = await page.goto(`${baseUrl(env)}${HARNESS_PATH}?qa=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
      const publicState = await etatBloc(page);
      const executable = await page.locator(ROOT).first().evaluate((root: Element, sel: string) => {
        const bloc = root.querySelector(sel);
        return bloc ? [...bloc.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') ?? '').filter((h) => /^\s*(javascript|data|vbscript):/i.test(h)).length : -1;
      }, BLOC);
      receipt.artefact(path.join(PROOFS, 'coordonnees-contact-spike.public.json'), Buffer.from(JSON.stringify({ status: response?.status(), publicState, executable }, null, 2) + '\n'), 'json');
      receipt.constateSi('public — liens tel:/mailto: soulignés, saut conservé, aucune URL exécutable',
        response?.status() === 200 && publicState && publicState.links === 2 && /^tel:/.test(publicState.telHref) && /^mailto:/.test(publicState.mailHref) && publicState.underline === true && (publicState.br >= 1 || publicState.rawNewlines >= 1) && executable === 0,
        'HTTP 200 · 2 liens soulignés · saut · 0 URL exécutable',
        JSON.stringify({ ...publicState, executable }));
    } finally {
      await publicSession.context.close();
    }
  });

  const done = receipt.ecrire('coordonnees-contact-spike.json', Date.now() - started);
  process.exit(done.status === 'pass' ? 0 : 1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => { console.error(`✖ ${error instanceof Error ? error.message : String(error)}`); process.exit(1); });
}
