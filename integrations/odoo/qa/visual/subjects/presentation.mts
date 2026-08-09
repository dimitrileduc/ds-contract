import { FRAME_PADDING_TOKEN, type Subject } from '../subject.mts';

export const PRESENTATION_SUBJECT: Subject = {
  key: 'presentation-default',
  contractId: 'ds.presentation',
  odooPath: '/piqueray-harness/presentation-visual',
  showcaseLabel: 'default',
  odooClipSelector: '.pqr-mesure',
  clip: { width: 1400, height: 300 },
};

export const SUBJECTS = [PRESENTATION_SUBJECT] as const;
export const CONDITIONS = {
  framePaddingToken: FRAME_PADDING_TOKEN,
  viewport: { width: 1480, height: 380, deviceScaleFactor: 2 },
  colorScheme: 'light',
  locale: 'fr-FR',
  state: 'default',
  content: 'composition Presentation → SectionHeader + Button au défaut contractuel',
  fonts: 'Montserrat générée par le snapshot actif',
} as const;
