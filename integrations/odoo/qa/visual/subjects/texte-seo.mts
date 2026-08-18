import { FRAME_PADDING_TOKEN, type Subject } from '../subject.mts';

export const TEXTE_SEO_SUBJECT: Subject = {
  key: 'texte-seo-default',
  contractId: 'ds.texte-seo',
  odooPath: '/piqueray-harness/texte-seo-visual',
  showcaseLabel: 'default',
  odooClipSelector: '.pqr-mesure',
  frameContentWidth: 1728,
  clip: { width: 1776, height: 431 },
};

export const SUBJECTS = [TEXTE_SEO_SUBJECT] as const;
export const CONDITIONS = {
  framePaddingToken: FRAME_PADDING_TOKEN,
  viewport: { width: 1856, height: 511, deviceScaleFactor: 2 },
  colorScheme: 'light',
  locale: 'fr-FR',
  state: 'default',
  content: 'composition Texte SEO → SectionHeader compact + paragraphe + sous-titre + 3 × AccordionRow petit (2e ouverte) au sample contractuel',
  fonts: 'Montserrat générée par le snapshot actif',
} as const;
