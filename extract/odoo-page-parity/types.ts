/**
 * Le vocabulaire de l'instrument de mesure de PAGE ENTIÈRE. Spec 037, US3.
 *
 * Il vit à côté d'`extract/image-parity` et d'`extract/figma/page-parity`, même
 * famille : agnostique du moteur, il compare deux images et rend un rapport
 * lisible. Ce qu'il mesure est neuf — une page Odoo LIVRÉE contre sa vue Figma
 * v2, aux quatre largeurs, en nommant l'écart de hauteur À CÔTÉ du score.
 *
 * ── Pourquoi deux verdicts et pas un seul ───────────────────────────────────
 * La mesure manuelle du 2026-09-04 complétait la plus courte des deux images en
 * blanc jusqu'à la hauteur de l'autre : le bas manquant comptait alors comme
 * une différence, et un score unique mélangeait « ça ne se dessine pas pareil »
 * et « ça ne fait pas la même hauteur ». Ici les deux images sont alignées EN
 * HAUT et comparées sur la hauteur COMMUNE — le score mesure le rendu — et
 * `ecartHauteurPx` est écrit à côté, avec son propre verdict. Aucun des deux
 * ne peut cacher l'autre (§XII).
 */

/** Les quatre largeurs de la campagne. Un rapport par largeur, jamais un résumé. */
export type Largeur = 390 | 834 | 1200 | 1728;
export const LARGEURS: readonly Largeur[] = [390, 834, 1200, 1728];

export interface VueFigma {
  readonly nodeId: string;
  /** Informatif : la hauteur VIVE, relue à chaque mesure, fait foi (D8). */
  readonly hauteurAuReleve: number;
  readonly releve: string;
}

export interface PageDuManifeste {
  readonly url: string;
  /** Section « 4 vues » ; `null` pour Home, dont les vues sont des frames. */
  readonly section: string | null;
  readonly vues: Readonly<Record<string, VueFigma>>;
}

export interface Manifeste {
  readonly fileKey: string;
  readonly seuilPct: number;
  readonly seuilRaison?: string;
  readonly toleranceHauteurPx: number;
  readonly toleranceHauteurRaison?: string;
  readonly largeurs: readonly number[];
  readonly pages: Readonly<Record<string, PageDuManifeste>>;
}

/** Une boîte d'enfant, côté Figma comme côté Odoo : un nom, un haut, une hauteur. */
export interface Boite {
  readonly nom: string;
  readonly y: number;
  readonly h: number;
}

/** Une section appariée PAR POSITION entre les deux côtés. */
export interface SectionAppariee {
  readonly nom: string;
  readonly figma: { y: number; h: number };
  readonly odoo: { y: number; h: number };
  readonly ecartH: number;
  readonly ecartYCumule: number;
}

export type Statut = 'mesurée' | 'impossible';
export type VerdictPixel = 'vert' | 'rouge';
export type VerdictHauteur = 'bruit' | 'rouge';
export type VerdictPage = 'vert' | 'rouge' | 'impossible';

/** Le rapport d'UNE page à UNE largeur (contracts/rapport-mesure.schema.json). */
export interface Rapport {
  readonly page: string;
  readonly url: string;
  readonly largeur: number;
  readonly instance: string;
  readonly date: string;
  readonly statut: Statut;
  /** Non nul si et seulement si `statut === 'impossible'` (FR-017, §V). */
  readonly raisonImpossible: string | null;
  readonly figma: { nodeId: string; hauteur: number; sha256: string } | null;
  readonly odoo: { hauteur: number; sha256: string } | null;
  readonly ecartHauteurPx: number | null;
  readonly regleCadrage: string;
  readonly hauteurCommune: number | null;
  readonly diffPixels: number | null;
  readonly scorePct: number | null;
  readonly seuilPct: number;
  readonly toleranceHauteurPx: number;
  readonly verdictPixel: VerdictPixel | null;
  readonly verdictHauteur: VerdictHauteur | null;
  readonly verdictPage: VerdictPage;
  readonly structure: string;
  readonly sections: readonly SectionAppariee[];
  readonly sectionOrigineDecalage: string | null;
  /** Écarts de COPIE nommés à la main après lecture (FR-018). */
  readonly ecartsContenu: readonly string[];
  /** Écrits à la main, jamais devinés. */
  readonly cause: string | null;
  readonly justification: string | null;
  readonly triptyque: { chemin: string; sha256: string } | null;
}

/** La phrase de cadrage, constante et recopiée dans chaque rapport. */
export const REGLE_CADRAGE =
  'alignées en haut, comparées sur la hauteur commune ; l’écart de hauteur est rapporté à côté du score, jamais fondu dedans';
