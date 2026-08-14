import { FRAME_PADDING_TOKEN, type Subject } from '../subject.mts';

/** FAQ au défaut contractuel : 3 questions fermées (2 du sample + la rangée 3),
 *  en-tête de section avec accroche visible, CTA outline. Boîte de référence
 *  1728×448 (border-box du master 2104:2914) + 24px de cadre de mesure. */
export const FAQ_SUBJECT: Subject = {
  key: 'faq-default',
  contractId: 'ds.faq',
  odooPath: '/piqueray-harness/faq-visual',
  showcaseLabel: 'default',
  odooClipSelector: '.pqr-mesure',
  clip: { width: 1776, height: 496 },
};

export const SUBJECTS = [FAQ_SUBJECT] as const;
export const CONDITIONS = {
  framePaddingToken: FRAME_PADDING_TOKEN,
  viewport: { width: 1856, height: 576, deviceScaleFactor: 2 },
  colorScheme: 'light',
  locale: 'fr-FR',
  state: 'default',
  content: 'composition FAQ → SectionHeader + 3 AccordionRow fermées + Button au défaut contractuel',
  fonts: 'Montserrat générée par le snapshot actif',
} as const;
