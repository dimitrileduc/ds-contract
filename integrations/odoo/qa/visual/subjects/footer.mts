import { FRAME_PADDING_TOKEN, type Subject } from '../subject.mts';

// Le sujet visuel du FOOTER SHELL (spec 023, SC-001). Le footer est un composant à
// ENCRE CLAIRE (textes blancs, icônes blanches, logo blanc) sur fond sombre — même
// convention surface='dark' que le header (spec 022). La page de mesure est un banc
// QA dédié qui isole le footer_bar dans un cadre .pqr-mesure, sans le reste de la
// page — on ne peut PAS capturer le footer depuis '/' parce que viewportFor calcule
// la hauteur du viewport depuis le clip (504 + 200 = 704 px), et le footer est à
// y ≈ 5000 sur la page d'accueil.
export const FOOTER_SUBJECT: Subject = {
  key: 'footer-default',
  contractId: 'ds.footer',
  odooPath: '/piqueray-harness/footer-visual',
  showcaseLabel: 'default',
  odooClipSelector: '.pqr-mesure',
  frameContentWidth: 1728,
  surface: 'dark',
  clip: { width: 1776, height: 504 },
};

export const SUBJECTS = [FOOTER_SUBJECT] as const;

export const CONDITIONS = {
  framePaddingToken: FRAME_PADDING_TOKEN,
  viewport: { width: 1856, height: 704, deviceScaleFactor: 2 },
  colorScheme: 'light',
  surface: 'dark',
  locale: 'fr-FR',
  state: 'default',
  content:
    'ds.footer 1.1.0 mono-variante : logo blanc + CTA outlineBlanc, 3 colonnes (adresse/horaires/contact), icônes Facebook+Instagram, séparateur, copyright — sur fond sombre',
  fonts: 'Montserrat générée par le snapshot actif',
} as const;
