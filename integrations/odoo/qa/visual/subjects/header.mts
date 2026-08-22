import { FRAME_PADDING_TOKEN, type Subject } from '../subject.mts';

// Le sujet visuel du SHELL (spec 022, SC-001). Le header est un composant à ENCRE
// CLAIRE (wordmark blanc, liens blancs, icônes blanches) sur Transparent : la
// surface de comparaison est donc `dark` (`--pqr-color-noir-bleute`) DES DEUX
// CÔTÉS — la vitrine de référence et la page de mesure Odoo posent le même fond.
//
// Largeur du cadre = size.header.root (1728px, fixe — responsive différé nommé) +
// 2 × FRAME_PADDING_TOKEN. La hauteur du clip est IMPRIMÉE par
// `render-html.mts --measure` (le refus d'un clip trop petit donne le nombre) —
// jamais choisie à la main.
export const HEADER_SUBJECT: Subject = {
  key: 'header-default',
  contractId: 'ds.header',
  odooPath: '/piqueray-harness/header-visual',
  showcaseLabel: 'default',
  odooClipSelector: '.pqr-mesure',
  frameContentWidth: 1728,
  surface: 'dark',
  clip: { width: 1776, height: 134 },
};

export const SUBJECTS = [HEADER_SUBJECT] as const;

export const CONDITIONS = {
  framePaddingToken: FRAME_PADDING_TOKEN,
  viewport: { width: 1856, height: 768, deviceScaleFactor: 2 },
  colorScheme: 'light',
  surface: 'dark',
  locale: 'fr-FR',
  state: 'default',
  content:
    'ds.header 2.0.0 mono-variante Transparent : marque orange + wordmark blanc, 4 liens (2 à chevron), CTA blanc + flèche, 3 icônes 24px blanches, aucun fond — sur --pqr-color-noir-bleute',
  fonts: 'Montserrat générée par le snapshot actif',
} as const;
