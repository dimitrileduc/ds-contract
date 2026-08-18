import { FRAME_PADDING_TOKEN, type Subject } from '../subject.mts';

export const HERO_SUBJECT: Subject = {
  key: 'hero-default',
  contractId: 'ds.hero',
  odooPath: '/piqueray-harness/hero-visual',
  showcaseLabel: 'default',
  odooClipSelector: '.pqr-mesure',
  frameContentWidth: 1728,
  clip: { width: 1776, height: 688 },
};

export const SUBJECTS = [HERO_SUBJECT] as const;
export const CONDITIONS = {
  framePaddingToken: FRAME_PADDING_TOKEN,
  viewport: { width: 1856, height: 768, deviceScaleFactor: 2 },
  colorScheme: 'light',
  locale: 'fr-FR',
  state: 'default',
  content: 'composition Hero → SectionHeader + Button au défaut contractuel, sans bitmap transporté',
  fonts: 'Montserrat générée par le snapshot actif',
} as const;
