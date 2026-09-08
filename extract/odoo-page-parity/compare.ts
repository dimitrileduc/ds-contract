/**
 * La COMPARAISON : deux images, alignées en haut, sur la hauteur commune. Spec 037, T050.
 *
 * ── La règle de cadrage, et pourquoi elle est écrite dans chaque rapport ─────
 * Les deux images n'ont presque jamais la même hauteur. Trois façons de s'en
 * sortir, une seule honnête :
 *   (a) compléter la plus courte en blanc — c'est ce que faisait la mesure
 *       manuelle du 2026-09-04 : le bas manquant compte alors comme une
 *       différence, et le score mélange « ça ne se dessine pas pareil » avec
 *       « ça ne fait pas la même hauteur » ;
 *   (b) redimensionner — rééchantillonne le texte, fabrique de la différence
 *       partout, et efface justement l'écart qu'on voulait voir ;
 *   (c) aligner EN HAUT et comparer sur la hauteur commune, puis rapporter Δh
 *       à côté du score, avec son propre verdict. C'est (c).
 *
 * Le score dit alors ce qu'il dit vraiment : « sur la partie que les deux
 * images ont en commun, tant de pixels diffèrent ». Et `ecartHauteurPx` dit le
 * reste. Aucun des deux ne peut cacher l'autre.
 *
 * La comparaison elle-même passe par `compareDecodedImages` d'`extract/image-parity`,
 * appelé par la porte BIBLIOTHÈQUE et jamais par son CLI : un instrument qui
 * lit le stdout d'un autre hérite de son formatage sans hériter de ses garanties.
 */
import { PNG } from 'pngjs';
import { compareDecodedImages } from '../image-parity/compare.js';
import type { Aligned } from '../figma/visual-parity/img.js';
import type { VerdictHauteur, VerdictPage, VerdictPixel } from './types.js';

/** Aplat alpha sur blanc + rognage à `hauteur` — les deux côtés, même geste. */
export function aplatirEtRogner(src: PNG, largeur: number, hauteur: number): PNG {
  const out = new PNG({ width: largeur, height: hauteur });
  for (let y = 0; y < hauteur; y++) {
    for (let x = 0; x < largeur; x++) {
      const di = (y * largeur + x) * 4;
      if (x >= src.width || y >= src.height) {
        out.data[di] = 255; out.data[di + 1] = 255; out.data[di + 2] = 255; out.data[di + 3] = 255;
        continue;
      }
      const si = (y * src.width + x) * 4;
      const a = src.data[si + 3] / 255;
      out.data[di] = Math.round(src.data[si] * a + 255 * (1 - a));
      out.data[di + 1] = Math.round(src.data[si + 1] * a + 255 * (1 - a));
      out.data[di + 2] = Math.round(src.data[si + 2] * a + 255 * (1 - a));
      out.data[di + 3] = 255;
    }
  }
  return out;
}

export interface Comparaison {
  readonly hauteurCommune: number;
  readonly ecartHauteurPx: number;
  readonly diffPixels: number;
  readonly scorePct: number;
  readonly verdictPixel: VerdictPixel;
  readonly verdictHauteur: VerdictHauteur;
  readonly verdictPage: VerdictPage;
  /** Le triptyque prêt à écrire : notre côté, la vue, le diff. */
  readonly aligned: Aligned;
  readonly diff: PNG;
}

export function comparer(
  odoo: PNG, figma: PNG, seuilPct: number, toleranceHauteurPx: number,
): Comparaison {
  const largeur = Math.min(odoo.width, figma.width);
  const hauteurCommune = Math.min(odoo.height, figma.height);
  const a = aplatirEtRogner(odoo, largeur, hauteurCommune);
  const b = aplatirEtRogner(figma, largeur, hauteurCommune);

  // Les deux images ont désormais EXACTEMENT la même taille, par construction :
  // `image-parity` refuse toute paire de tailles différentes (`dimension-mismatch`),
  // et c'est ce refus qui garantit qu'on ne lui a pas glissé un recadrage tacite.
  const r = compareDecodedImages(a, b);
  if (r.status !== 'identical' && r.status !== 'diff') {
    throw new Error(`comparaison impossible : ${r.status} — ${r.reason ?? 'sans raison'}`);
  }
  const diffPixels = r.diffCount;
  const scorePct = (diffPixels / (largeur * hauteurCommune)) * 100;
  const ecartHauteurPx = odoo.height - figma.height;

  const verdictPixel: VerdictPixel = scorePct <= seuilPct ? 'vert' : 'rouge';
  const verdictHauteur: VerdictHauteur = Math.abs(ecartHauteurPx) <= toleranceHauteurPx ? 'bruit' : 'rouge';
  const verdictPage: VerdictPage = verdictPixel === 'vert' && verdictHauteur === 'bruit' ? 'vert' : 'rouge';

  const aligned: Aligned = {
    a, b, width: largeur, height: hauteurCommune,
    aContent: { width: odoo.width, height: odoo.height },
    bContent: { width: figma.width, height: figma.height },
    aOffset: { x: 0, y: 0 },
    aTrimOrigin: { x: 0, y: 0 },
    comparisonSurface: 'light',
  };
  return {
    hauteurCommune, ecartHauteurPx, diffPixels, scorePct,
    verdictPixel, verdictHauteur, verdictPage,
    // Aucune différence : le troisième volet est BLANC, pas un rectangle de
    // zéros. Un PNG neuf est transparent-noir, et `writeTriptych` recopie les
    // octets tels quels : le triptyque d'une page parfaite se lirait comme un
    // panneau noir, c'est-à-dire comme une panne.
    aligned, diff: r.images?.diff ?? blanc(largeur, hauteurCommune),
  };
}

function blanc(width: number, height: number): PNG {
  const png = new PNG({ width, height });
  png.data.fill(255);
  return png;
}
