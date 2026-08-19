import { FRAME_PADDING_TOKEN, type Subject } from '../subject.mts';

// ODOO-022 (US2) — sujet visuel Réassurances. Clip ÉPINGLÉ par
// `render-html.mts --measure` (le refus donne la boîte). Largeur naturelle =
// racine 1550 ; le cadre ajoute FRAME_PADDING_TOKEN (24) de chaque côté → 1598.
export const REASSURANCES_SUBJECT: Subject = {
  key: 'reassurances-default',
  contractId: 'ds.reassurances',
  odooPath: '/piqueray-harness/reassurances-visual',
  showcaseLabel: 'default',
  odooClipSelector: '.pqr-mesure',
  frameContentWidth: 1550,
  clip: { width: 1598, height: 806 },
};

export const SUBJECTS = [REASSURANCES_SUBJECT] as const;
export const CONDITIONS = {
  framePaddingToken: FRAME_PADDING_TOKEN,
  viewport: { width: 1856, height: 900, deviceScaleFactor: 2 },
  colorScheme: 'light',
  locale: 'fr-FR',
  state: 'default',
  content: 'composition Réassurances → SectionHeader fixé + 4 cartes (image placeholder + titre + texte) + CTA, sans bitmap transporté',
  fonts: 'Montserrat générée par le snapshot actif',
} as const;
