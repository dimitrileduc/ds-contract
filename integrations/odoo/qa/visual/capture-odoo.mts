/**
 * Côté ODOO de la comparaison d'image : capture les pages de mesure servies par
 * l'instance, avec EXACTEMENT le même viewport, le même `deviceScaleFactor` et le
 * même `clip` que `render-html.mts`. Spec 019, T004.
 *
 * ── Deux pièges obligatoires, tous deux réels et mesurés en 018 ──────────────
 * 1. CAPTURER LA PAGE PUBLIQUE, SANS SESSION. Connecté en `admin`, Odoo superpose
 *    sa barre de backoffice et son panneau latéral : la mise en page n'est plus
 *    celle que voit un visiteur. Chaque capture ouvre donc un contexte de
 *    navigateur NEUF, sans cookie, jamais réutilisé entre deux sujets.
 * 2. NE JAMAIS ATTENDRE SANS BORNE. Le client web d'Odoo garde une connexion
 *    longue ouverte, donc `waitUntil: 'networkidle'` peut ne jamais rendre la
 *    main. On attend `domcontentloaded`, puis on fait courir `document.fonts.ready`
 *    contre un délai — la règle qu'applique déjà la parité visuelle du dépôt.
 *
 * Usage :
 *   npx tsx integrations/odoo/qa/visual/capture-odoo.mts \
 *     --subjects <module> --base http://localhost:8069 --out <dir>
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import type { Browser } from 'playwright-core';
import { launchBrowser } from '../../../../extract/figma/visual-parity/render.js';
import {
  DEVICE_SCALE_FACTOR,
  FONT_SETTLE_MS,
  NAV_TIMEOUT_MS,
  arg,
  loadSubjects,
  runAsCli,
  viewportFor,
  type Subject,
} from './subject.mts';

export async function capturePage(browser: Browser, subject: Subject, url: string): Promise<Buffer> {
  // Contexte NEUF pour chaque sujet : aucun cookie, donc aucune session, donc la
  // page publique et pas l'éditeur.
  const context = await browser.newContext({
    viewport: viewportFor(subject),
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
    colorScheme: 'light',
  });
  try {
    const page = await context.newPage();
    const reponse = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
    // REFUSER une page d'erreur AVANT de la photographier. Une 404 d'Odoo est
    // une page valide de la bonne taille : capturée, elle serait comparée au
    // composant de référence et rendrait un pourcentage d'écart parfaitement
    // calculé sur un contenu qui n'est pas le sujet. Trouvé en revue le 2026-08-08.
    // Une URL `data:` n'a pas de statut HTTP : c'est le cas du self-test hors
    // ligne, qui compare les deux chemins de capture sur un document synthétique.
    // L'exclusion est NOMMÉE plutôt que déduite d'un `?.` permissif — sinon une
    // vraie page sans réponse passerait par le même trou.
    const surHttp = /^https?:/i.test(url);
    const statut = reponse?.status();
    if (surHttp && statut !== 200) {
      throw new Error(`${url} répond HTTP ${statut ?? '(aucune réponse)'} — refus de photographier une page d'erreur.`);
    }
    // Et le sujet doit être LÀ : une page 200 sans notre composant (module non
    // installé, gabarit renommé) produirait la même mesure trompeuse.
    const present = await page.evaluate(
      (sel: string) => document.querySelector(sel) !== null,
      `[data-ds-contract="${subject.contractId}"], .${subject.key}`,
    );
    if (surHttp && !present) {
      throw new Error(
        `${url} ne contient ni [data-ds-contract="${subject.contractId}"] ni .${subject.key} — la page est servie mais le sujet est absent.`,
      );
    }
    await page.evaluate(
      `Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, ${FONT_SETTLE_MS}))])`,
    );
    let origin = { x: 0, y: 0 };
    if (subject.odooClipSelector) {
      const box = await page.locator(subject.odooClipSelector).first().boundingBox();
      if (!box) {
        throw new Error(`${url} : origine de clip « ${subject.odooClipSelector} » absente ou invisible.`);
      }
      origin = { x: box.x, y: box.y };
    }
    const png = await page.screenshot({
      clip: { ...origin, width: subject.clip.width, height: subject.clip.height },
    });
    return Buffer.from(png);
  } finally {
    await context.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const subjectsArg = arg(args, '--subjects');
  const base = arg(args, '--base');
  const out = arg(args, '--out');
  if (!subjectsArg || !base || !out) {
    throw new Error('Usage : --subjects <module> --base <http://host:port> --out <dir>');
  }
  mkdirSync(out, { recursive: true });

  const subjects = await loadSubjects(subjectsArg);
  const { browser, version } = await launchBrowser();
  console.log(`Chromium ${version} · ${subjects.length} sujet(s) depuis ${subjectsArg}`);
  try {
    for (const s of subjects) {
      const url = `${base.replace(/\/$/, '')}${s.odooPath}`;
      const png = await capturePage(browser, s, url);
      writeFileSync(path.join(out, `${s.key}.png`), png);
      console.log(`✔ ${s.key.padEnd(16)} ${url} → ${path.join(out, `${s.key}.png`)}`);
    }
  } finally {
    await browser.close();
  }
}

runAsCli(import.meta.url, main);
