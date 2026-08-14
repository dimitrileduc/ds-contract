import { FRAME_PADDING_TOKEN, type Subject } from '../subject.mts';

export const DEVIS_SUBJECT: Subject = {
  key: 'devis-default',
  contractId: 'ds.devis',
  odooPath: '/piqueray-harness/devis-visual',
  showcaseLabel: 'default',
  odooClipSelector: '.pqr-mesure',
  frameContentWidth: 1728,
  // Mesuré par `render-html.mts --measure` : boîte réelle 1776×426 — le
  // composant au défaut contractuel (padding 96/96, titre 2 lignes, gap 32,
  // CTA) plus 2×24 de cadre de mesure. Le clip est la boîte, pas un choix.
  clip: { width: 1776, height: 426 },
};

export const SUBJECTS = [DEVIS_SUBJECT] as const;
export const CONDITIONS = {
  framePaddingToken: FRAME_PADDING_TOKEN,
  viewport: { width: 1856, height: 560, deviceScaleFactor: 2 },
  colorScheme: 'light',
  locale: 'fr-FR',
  state: 'default',
  content: 'composition Devis → Button au défaut contractuel : fond figé (photo vide + voile sur plan noir), sans bitmap transporté',
  fonts: 'Montserrat générée par le snapshot actif',
} as const;
