import { FRAME_PADDING_TOKEN, type Subject } from '../subject.mts';

export const SAV_SUBJECT: Subject = {
  key: 'sav-default',
  contractId: 'ds.sav',
  odooPath: '/piqueray-harness/sav-visual',
  showcaseLabel: 'default',
  odooClipSelector: '.pqr-mesure',
  // Largeur de référence owner du contrat v1.4.0 : master Fill à 1550, rangée
  // de 1288 px utiles sous 131 px de padding horizontal.
  frameContentWidth: 1550,
  // Mesuré par `render-html.mts --measure` : boîte réelle 1598×725 — la section
  // à hauteur contractuelle 677 (size.sav.section-h) plus 2×24 de cadre de
  // mesure. Le clip est la boîte, pas un choix.
  clip: { width: 1598, height: 725 },
};

export const SUBJECTS = [SAV_SUBJECT] as const;
export const CONDITIONS = {
  framePaddingToken: FRAME_PADDING_TOKEN,
  viewport: { width: 1678, height: 805, deviceScaleFactor: 2 },
  colorScheme: 'light',
  locale: 'fr-FR',
  state: 'default',
  content: 'composition SAV → SectionHeader + Button au défaut contractuel, deux plans image vides (limite A5, aucun bitmap transporté)',
  fonts: 'Montserrat générée par le snapshot actif',
} as const;
