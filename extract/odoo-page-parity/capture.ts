/**
 * La CAPTURE d'une page Odoo livrée, pleine page, aux quatre largeurs. Spec 037, T049.
 *
 * ── Ce qui est refusé AVANT la photo, et pourquoi c'est là que ça se joue ────
 * Une capture vide, une 404 ou un débordement horizontal photographiés donnent
 * un score. Un score sur une page absente est pire qu'une absence de score : il
 * se range dans un tableau et se lit comme un résultat. Quatre refus, tous
 * NOMMÉS et tous avant le déclenchement :
 *   · HTTP ≠ 200                    (la page n'existe pas / n'est pas publiée)
 *   · `#wrap.o_pqr_page` absent     (ce n'est pas une page composée par nous)
 *   · hauteur < 10 px               (une page « blanche » qui se mesurerait à 0 %)
 *   · largeur du document ≠ viewport (débordement horizontal — leçon home
 *     2026-09-04, où la colonne de contenu tombait à 212 px sur un écran de 390)
 *
 * ── Pourquoi DPR 1, et pourquoi ce défilement ───────────────────────────────
 * DPR 1 parce que la vue Figma est exportée à `scale=1` : mesurer à 2× puis
 * réduire rééchantillonnerait le texte et fabriquerait de la différence.
 * Le défilement complet puis le retour en haut : le carrousel, les images
 * paresseuses et le fond vidéo doivent s'être posés — sinon la photo montre un
 * état de chargement, pas la page.
 */
import { createHash } from 'node:crypto';
import { PNG } from 'pngjs';
import type { Browser } from 'playwright-core';
import { MesureImpossible } from './figma-views.js';
import type { Boite } from './types.js';

export interface CapturePage {
  readonly png: PNG;
  readonly octets: Buffer;
  readonly largeur: number;
  readonly hauteur: number;
  /** Empreinte des PIXELS, pas des octets du PNG — voir `empreintePixels`. */
  readonly sha256: string;
  /** Les `#wrap > section` de la page : `data-snippet`, haut, hauteur. */
  readonly sections: readonly Boite[];
}

/**
 * L'empreinte d'une capture, prise sur les PIXELS DÉCODÉS et jamais sur les
 * octets du PNG.
 *
 * MESURÉ le 2026-09-08 : deux captures de la même page, au même instant, ont des
 * pixels RIGOUREUSEMENT identiques (`image-parity` : `identical`, 0 pixel) et des
 * fichiers PNG DIFFÉRENTS — 1 123 307 contre 1 124 418 octets. L'encodeur de
 * Chromium ne rend pas le même flux d'un appel à l'autre. Hacher les octets
 * ferait donc échouer le déterminisme (SC-005) sur une variation qui n'existe
 * pas à l'écran, et pire : ferait douter d'une page parfaitement stable.
 * L'empreinte porte donc sur ce que la mesure regarde — la largeur, la hauteur,
 * et les octets RGBA.
 */
export const empreintePixels = (png: PNG): string =>
  createHash('sha256')
    .update(`${png.width}x${png.height}:`)
    .update(png.data)
    .digest('hex');

/** Hauteur minimale sous laquelle une capture n'est pas une page (§V). */
export const HAUTEUR_MINIMALE_PX = 10;
/** Borne du chargement des polices — bornée, jamais infinie. */
const POLICES_TIMEOUT_MS = 5_000;
/** Après le défilement : le temps que le paresseux se pose. */
const REPOS_MS = 1_200;

export async function capturerPage(
  browser: Browser, baseUrl: string, url: string, largeur: number,
): Promise<CapturePage> {
  // Un contexte NEUF par largeur : un `setViewportSize` sur un contexte déjà
  // rendu garde des mesures calculées à l'ancienne largeur (media queries
  // évaluées une fois, images `sizes` déjà choisies).
  const context = await browser.newContext({
    viewport: { width: largeur, height: 1200 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    locale: 'fr-FR',
  });
  try {
    const page = await context.newPage();
    // Une clé de cache par mesure : Odoo sert ses pages depuis un cache par URL,
    // et une page recomposée peut revenir telle qu'elle était (leçon `header-menu.spec`).
    const cible = `${baseUrl}${url}${url.includes('?') ? '&' : '?'}pqr=${Date.now()}`;
    const reponse = await page.goto(cible, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    const statut = reponse?.status() ?? 0;
    if (statut !== 200) throw new MesureImpossible(`page absente — HTTP ${statut} sur ${url}`);

    await page.evaluate(
      (ms) => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, ms))]),
      POLICES_TIMEOUT_MS,
    );
    await page.evaluate(async () => {
      const pas = window.innerHeight;
      for (let y = 0; y < document.body.scrollHeight; y += pas) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(REPOS_MS);

    const releve = await page.evaluate(() => {
      const wrap = document.querySelector('#wrap.o_pqr_page');
      if (!wrap) return null;
      const sections = [...wrap.querySelectorAll(':scope > section')].map((el) => {
        const r = el.getBoundingClientRect();
        return {
          nom: el.getAttribute('data-snippet') ?? el.className.split(' ')[0] ?? '(sans nom)',
          y: Math.round(r.top + window.scrollY),
          h: Math.round(r.height),
        };
      });
      return {
        sections,
        largeurDocument: Math.round(document.documentElement.scrollWidth),
        hauteurDocument: Math.round(document.documentElement.scrollHeight),
      };
    });
    if (!releve) {
      throw new MesureImpossible(`sujet absent — \`#wrap.o_pqr_page\` introuvable sur ${url} (page non composée par nous)`);
    }
    if (releve.largeurDocument > largeur) {
      throw new MesureImpossible(
        `débordement horizontal — le document mesure ${releve.largeurDocument} px pour un écran de ${largeur} : c'est un défaut de page, pas une mesure`,
      );
    }
    if (releve.hauteurDocument < HAUTEUR_MINIMALE_PX) {
      throw new MesureImpossible(`capture vide — ${releve.hauteurDocument} px de haut (< ${HAUTEUR_MINIMALE_PX})`);
    }

    const octets = await page.screenshot({ fullPage: true, type: 'png' });
    const png = PNG.sync.read(octets);
    if (png.height < HAUTEUR_MINIMALE_PX) {
      throw new MesureImpossible(`capture vide — le PNG fait ${png.height} px de haut`);
    }
    return {
      png, octets, largeur: png.width, hauteur: png.height,
      sha256: empreintePixels(png),
      sections: releve.sections as Boite[],
    };
  } finally {
    await context.close();
  }
}
