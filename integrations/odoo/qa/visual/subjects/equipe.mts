import { FRAME_PADDING_TOKEN, type Subject } from '../subject.mts';

export const EQUIPE_SUBJECT: Subject = {
  key: 'equipe-default',
  contractId: 'ds.equipe',
  odooPath: '/piqueray-harness/equipe-visual',
  showcaseLabel: 'default',
  odooClipSelector: '.pqr-mesure',
  frameContentWidth: 1728,
  clip: { width: 1776, height: 2117 },
};

export const SUBJECTS = [EQUIPE_SUBJECT] as const;
export const CONDITIONS = {
  framePaddingToken: FRAME_PADDING_TOKEN,
  viewport: { width: 1856, height: 2197, deviceScaleFactor: 2 },
  colorScheme: 'light',
  locale: 'fr-FR',
  state: 'default',
  content: 'composition Équipe → 16 × MemberCard → MemberPicture au sample contractuel',
  fonts: 'Montserrat générée par le snapshot actif',
} as const;
