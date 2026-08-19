import { FRAME_PADDING_TOKEN, type Subject } from '../subject.mts';

// ODOO-022 (US1) — sujet visuel Coordonnées. Le clip est ÉPINGLÉ par
// `render-html.mts --measure` (le refus d'un clip trop petit donne la boîte),
// jamais choisi. Largeur naturelle = plan 1152 + wrapper 576 = 1728 ; le cadre
// ajoute FRAME_PADDING_TOKEN (24) de chaque côté → 1776 de large.
export const COORDONNEES_SUBJECT: Subject = {
  key: 'coordonnees-default',
  contractId: 'ds.coordonnees',
  odooPath: '/piqueray-harness/coordonnees-visual',
  showcaseLabel: 'default',
  odooClipSelector: '.pqr-mesure',
  frameContentWidth: 1728,
  clip: { width: 1776, height: 660 },
};

export const SUBJECTS = [COORDONNEES_SUBJECT] as const;
export const CONDITIONS = {
  framePaddingToken: FRAME_PADDING_TOKEN,
  viewport: { width: 1856, height: 768, deviceScaleFactor: 2 },
  colorScheme: 'light',
  locale: 'fr-FR',
  state: 'default',
  content: 'composition Coordonnées → SectionHeader + plan placeholder + blocs Adresse/Horaires/Contact/Suivez-nous, sans bitmap transporté',
  fonts: 'Montserrat générée par le snapshot actif',
} as const;
