/** Conditions contractuelles de la comparaison Google Reviews — T025. */
import { FRAME_PADDING_TOKEN, type Subject } from '../subject.mts';

export const GOOGLE_REVIEWS_SUBJECT: Subject = {
  key: 'google-reviews-default',
  contractId: 'ds.google-reviews',
  odooPath: '/piqueray-harness/google-reviews-visual',
  showcaseLabel: 'default',
  odooClipSelector: '.pqr-mesure',
  // 1552×328 est la mesure du contrat; le cadre ajoute le même jeton des deux côtés.
  clip: { width: 1648, height: 424 },
};

export const SUBJECTS = [GOOGLE_REVIEWS_SUBJECT] as const;

export const CONDITIONS = {
  framePaddingToken: FRAME_PADDING_TOKEN,
  viewport: { width: 1728, height: 504, deviceScaleFactor: 2 },
  colorScheme: 'light',
  locale: 'fr-FR',
  state: 'default',
  content: 'le sample contractuel à cinq avis, sans chrome de showcase ni état d’éditeur',
  fonts: 'Montserrat générée par le snapshot actif',
} as const;
