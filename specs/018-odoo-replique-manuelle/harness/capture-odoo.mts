/**
 * Côté « après » de la comparaison d'image (US3) : capture les 3 pages de mesure
 * servies par l'instance Odoo, avec EXACTEMENT le même viewport, le même
 * `deviceScaleFactor` et le même `clip` que `render-html.mts`.
 *
 * ── Deux pièges obligatoires, tous deux réels ────────────────────────────────
 * 1. CAPTURER LA PAGE PUBLIQUE, SANS SESSION. Connecté en `admin`, Odoo
 *    superpose sa barre de backoffice et son panneau latéral : la mise en page
 *    n'est plus celle que voit un visiteur. Chaque capture ouvre donc un
 *    contexte de navigateur NEUF, sans cookie — c'est ce que garantit
 *    `browser.newContext()` ici, jamais réutilisé entre deux sujets.
 * 2. NE JAMAIS ATTENDRE SANS BORNE. Le client web d'Odoo garde une connexion
 *    longue ouverte, donc `waitUntil: 'networkidle'` peut ne jamais rendre la
 *    main. On attend `domcontentloaded`, puis on fait courir `document.fonts.ready`
 *    contre un délai — la règle que le harnais de parité visuelle applique déjà.
 *
 * Usage :
 *   npx tsx specs/018-…/harness/capture-odoo.mts --base http://localhost:8069 --out <dir>
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Browser } from 'playwright-core';
import { SUBJECTS, DEVICE_SCALE_FACTOR, viewportFor, type Subject } from './subjects.mts';
import { launchBrowser } from './render-html.mts';

/** Le plafond d'attente des polices, en ms. Même valeur que le côté HTML et que
 *  `visual-parity/render.ts` — une asymétrie ici fabriquerait un écart de rendu
 *  qui n'existe pas dans les composants. */
export const FONT_SETTLE_MS = 5000;
/** Plafond de navigation. Odoo peut mettre du temps à compiler ses bundles au
 *  premier chargement ; il ne doit pas pour autant pouvoir figer la sonde. */
export const NAV_TIMEOUT_MS = 60_000;

export async function capturePage(browser: Browser, subject: Subject, url: string): Promise<Buffer> {
  // Contexte NEUF pour chaque sujet : aucun cookie, donc aucune session admin,
  // donc la page publique et pas l'éditeur.
  const context = await browser.newContext({
    viewport: viewportFor(subject),
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
    colorScheme: 'light',
  });
  try {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
    await page.evaluate(
      `Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, ${FONT_SETTLE_MS}))])`,
    );
    const png = await page.screenshot({
      clip: { x: 0, y: 0, width: subject.clip.width, height: subject.clip.height },
    });
    return Buffer.from(png);
  } finally {
    await context.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const read = (flag: string) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : null;
  };
  const base = read('--base');
  const out = read('--out');
  if (!base || !out) throw new Error('Usage : --base <http://host:port> --out <dir>');
  mkdirSync(out, { recursive: true });

  const browser = await launchBrowser();
  try {
    for (const s of SUBJECTS) {
      const url = `${base.replace(/\/$/, '')}${s.odooPath}`;
      const png = await capturePage(browser, s, url);
      writeFileSync(path.join(out, `${s.key}.png`), png);
      console.log(`✔ ${s.key.padEnd(16)} ${url} → ${path.join(out, `${s.key}.png`)}`);
    }
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
