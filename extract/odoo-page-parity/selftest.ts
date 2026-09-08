/**
 * `npm run odoo:pages:selftest` — la preuve que l'instrument VOIT. Spec 037, T045.
 *
 * Hors ligne, hors Docker, hors Figma : des PNG synthétiques et des boîtes
 * fabriquées. On prouve ici, AVANT toute mesure réelle (FR-015), que
 * l'instrument distingue les cinq choses qu'il prétend distinguer :
 *
 *   1. identique          → 0 %, verdict vert
 *   2. section décalée    → le PIXEL rougit
 *   3. +64 px de hauteur, contenu identique → la HAUTEUR rougit (même si le
 *      pixel passe), et la section d'origine du décalage est NOMMÉE
 *   4. deux passes        → mêmes chiffres, à l'octet
 *   5. entrée manquante   → `impossible` AVEC sa raison, jamais un 0 %
 *   6. appariement (F1)   → une vue de 10 enfants dont le premier est un Header
 *      et le dernier un Footer, face à un `#wrap` de 8 sections, donne
 *      `structure: "égale"` — c'est le cas qui, mal traité, ferait sortir un
 *      faux « 8 vs 10 » sur les NEUF pages à la fois.
 *
 * Un instrument qu'on n'a pas essayé de tromper n'a jamais été vérifié.
 */
import { PNG } from 'pngjs';
import { comparer } from './compare.js';
import { MesureImpossible } from './figma-views.js';
import { diagnostiquer, retirerEnteteEtPied } from './sections.js';
import { rapportImpossible, type EntreeRapport } from './report.js';
import type { Boite } from './types.js';

const SEUIL = 5;
const TOLERANCE = 10;

let echecs = 0;
function verifier(nom: string, condition: boolean, detail = ''): void {
  if (condition) { console.log(`  ✔ ${nom}`); return; }
  echecs++;
  console.log(`  ✖ ${nom}${detail ? ` — ${detail}` : ''}`);
}

/** Une page synthétique : bandes horizontales de couleurs distinctes. */
function pageSynthetique(largeur: number, bandes: readonly { h: number; gris: number }[]): PNG {
  const hauteur = bandes.reduce((s, b) => s + b.h, 0);
  const png = new PNG({ width: largeur, height: hauteur });
  let y = 0;
  for (const bande of bandes) {
    for (let dy = 0; dy < bande.h; dy++, y++) {
      for (let x = 0; x < largeur; x++) {
        const i = (y * largeur + x) * 4;
        png.data[i] = bande.gris; png.data[i + 1] = bande.gris; png.data[i + 2] = bande.gris; png.data[i + 3] = 255;
      }
    }
  }
  return png;
}

const boites = (noms: readonly string[], hauteurs: readonly number[]): Boite[] => {
  let y = 0;
  return noms.map((nom, i) => { const b = { nom, y, h: hauteurs[i] }; y += hauteurs[i]; return b; });
};

console.log('odoo-page-parity — self-test hors ligne');

// ---- 1. Identique → 0 %, vert.
const bandes = [{ h: 200, gris: 30 }, { h: 300, gris: 120 }, { h: 250, gris: 210 }];
const a = pageSynthetique(390, bandes);
const b = pageSynthetique(390, bandes);
const identique = comparer(a, b, SEUIL, TOLERANCE);
verifier('identique → 0,00 %', identique.scorePct === 0, `${identique.scorePct} %`);
verifier('identique → verdict de page vert', identique.verdictPage === 'vert');
verifier('identique → Δh nul', identique.ecartHauteurPx === 0);

// ---- 2. Une section décalée de 40 px : le PIXEL rougit, la hauteur ne bouge pas.
const decale = pageSynthetique(390, [{ h: 240, gris: 30 }, { h: 260, gris: 120 }, { h: 250, gris: 210 }]);
const cDecale = comparer(decale, b, SEUIL, TOLERANCE);
verifier('section décalée de 40 px → pixel rouge', cDecale.verdictPixel === 'rouge', `${cDecale.scorePct.toFixed(2)} %`);
verifier('section décalée → la hauteur reste du bruit', cDecale.verdictHauteur === 'bruit');
verifier('section décalée → verdict de page rouge', cDecale.verdictPage === 'rouge');

// ---- 3. +64 px de hauteur à contenu identique : la HAUTEUR rougit, même si le
//         pixel passe — et c'est tout l'intérêt d'avoir deux verdicts.
const plusHaut = pageSynthetique(390, [...bandes, { h: 64, gris: 210 }]);
const cHauteur = comparer(plusHaut, b, SEUIL, TOLERANCE);
verifier('+64 px → Δh = +64', cHauteur.ecartHauteurPx === 64, String(cHauteur.ecartHauteurPx));
verifier('+64 px → pixel VERT sur la hauteur commune', cHauteur.verdictPixel === 'vert', `${cHauteur.scorePct.toFixed(2)} %`);
verifier('+64 px → hauteur ROUGE', cHauteur.verdictHauteur === 'rouge');
verifier('+64 px → verdict de page rouge (la hauteur ne peut pas être cachée par le pixel)', cHauteur.verdictPage === 'rouge');

const dHauteur = diagnostiquer(
  boites(['Header', 'Hero', 'Devis', 'Footer'], [100, 200, 300, 250]),
  boites(['s_pqr_hero', 's_pqr_devis'], [264, 300]),
  TOLERANCE,
);
verifier('+64 px → la section d’origine du décalage est NOMMÉE', dHauteur.sectionOrigineDecalage === 's_pqr_hero', String(dHauteur.sectionOrigineDecalage));
verifier('+64 px → structure égale (Header et Footer retirés)', dHauteur.structure === 'égale', dHauteur.structure);

// ---- 4. Deux passes : mêmes chiffres, à l'octet.
const passe1 = comparer(decale, b, SEUIL, TOLERANCE);
const passe2 = comparer(decale, b, SEUIL, TOLERANCE);
verifier('deux passes → mêmes chiffres', passe1.scorePct === passe2.scorePct && passe1.diffPixels === passe2.diffPixels);
verifier('deux passes → même image de diff', Buffer.compare(PNG.sync.write(passe1.diff), PNG.sync.write(passe2.diff)) === 0);

// ---- 5. Entrée manquante → `impossible` AVEC sa raison, et zéro score.
const entree: EntreeRapport = {
  page: 'synthetique', url: '/synthetique', largeur: 390,
  instance: 'aucune', date: '1970-01-01T00:00:00.000Z', seuilPct: SEUIL, toleranceHauteurPx: TOLERANCE,
};
const impossible = rapportImpossible(entree, new MesureImpossible('vue introuvable — le nœud 0:0 n’existe plus').raison);
verifier('entrée manquante → statut impossible', impossible.statut === 'impossible');
verifier('entrée manquante → raison écrite', (impossible.raisonImpossible ?? '').includes('vue introuvable'));
verifier('entrée manquante → aucun score inventé', impossible.scorePct === null && impossible.diffPixels === null && impossible.ecartHauteurPx === null);
verifier('entrée manquante → verdict de page « impossible », ni vert ni rouge', impossible.verdictPage === 'impossible');

// ---- 6. L'appariement (F1) : Header en tête, Footer en queue, retirés du côté
//         Figma seulement — parce que le `#wrap` d'Odoo ne contient ni l'un ni
//         l'autre. Sans ce retrait, les neuf pages sortiraient un faux écart.
const vueDix = boites(
  ['Header', 'Hero', 'Categories', 'Presentation', 'SAV', 'Produits', 'Devis', 'Reassurances', 'AvisGoogle', 'Footer'],
  [100, 800, 700, 600, 500, 400, 300, 350, 450, 250],
);
const wrapHuit = boites(
  ['s_pqr_hero', 's_pqr_categories_principales', 's_pqr_presentation', 's_pqr_sav',
    's_pqr_produits_ecommerce', 's_pqr_devis', 's_pqr_reassurances', 's_pqr_google_reviews_section'],
  [800, 700, 600, 500, 400, 300, 350, 450],
);
const dAppariement = diagnostiquer(vueDix, wrapHuit, TOLERANCE);
verifier('10 enfants (Header+Footer) face à 8 sections → structure « égale »', dAppariement.structure === 'égale', dAppariement.structure);
verifier('appariement juste → aucune section d’origine du décalage', dAppariement.sectionOrigineDecalage === null, String(dAppariement.sectionOrigineDecalage));
verifier('appariement juste → 8 sections appariées', dAppariement.sections.length === 8, String(dAppariement.sections.length));

// Contre-épreuve : c'est bien le RETRAIT qui rend la structure égale — sans
// lui, les mêmes entrées donnent « 8 vs 10 ». Sans cette ligne, l'assertion
// ci-dessus pourrait passer sur un appariement qui ne retire rien du tout.
verifier('contre-épreuve : sans retrait, la structure serait « 8 vs 10 »',
  vueDix.length === 10 && retirerEnteteEtPied(vueDix).length === 8);
// Et le retrait ne mord QUE la tête et la queue : un enfant nommé « Footer » au
// milieu est une vraie section, pas une zone d'hôte. Le retirer masquerait un
// écart réel — l'erreur symétrique, et la plus difficile à voir.
const pieAuMilieu = boites(['Header', 'Hero', 'Footer', 'Devis', 'Footer'], [100, 200, 50, 300, 250]);
verifier('le retrait ne mord que la tête et la queue',
  retirerEnteteEtPied(pieAuMilieu).map((x) => x.nom).join(',') === 'Hero,Footer,Devis',
  retirerEnteteEtPied(pieAuMilieu).map((x) => x.nom).join(','));

// ---- Un écart de structure reste NOMMÉ, jamais silencieux.
const dStructure = diagnostiquer(
  boites(['Header', 'Hero', 'Devis', 'Footer'], [100, 200, 300, 250]),
  boites(['s_pqr_hero'], [200]),
  TOLERANCE,
);
verifier('écart de structure → nommé « 1 vs 2 sections »', dStructure.structure === '1 vs 2 sections', dStructure.structure);

console.log(echecs === 0 ? '\n✔ self-test vert' : `\n✖ ${echecs} écart(s)`);
process.exit(echecs === 0 ? 0 : 1);
