import { FRAME_PADDING_TOKEN, type Subject } from '../subject.mts';

/**
 * Sujet de parité visuelle Odoo ↔ emit-html pour `ds.hero-video` (spec 025).
 *
 * Les deux côtés rendent le MÊME défaut contractuel : poster vide (`backgroundUrl`
 * au défaut ''), scrims gouvernés, titre 44/48 Regular, CTA `outlineBlanc`. La
 * comparaison est donc symétrique — aucun bitmap n'est prêté d'un côté ; l'absence
 * de poster est identique des deux côtés (le harness `s_pqr_hero_video` n'est pas
 * composé). Le clip est mesuré par `render-html.mts --measure`, qui refuse un clip
 * trop petit et imprime la boîte réelle — 1776 × 768 = 1728 + 2×24 de marge de
 * cadre en largeur, 720 + 2×24 en hauteur (hypothèse de départ, à confirmer).
 */
export const HERO_VIDEO_SUBJECT: Subject = {
  key: 'hero-video-default',
  contractId: 'ds.hero-video',
  odooPath: '/piqueray-harness/hero-video-visual',
  showcaseLabel: 'default',
  odooClipSelector: '.pqr-mesure',
  frameContentWidth: 1728,
  clip: { width: 1776, height: 768 },
};

export const SUBJECTS = [HERO_VIDEO_SUBJECT] as const;
export const CONDITIONS = {
  framePaddingToken: FRAME_PADDING_TOKEN,
  viewport: { width: 1856, height: 768, deviceScaleFactor: 2 },
  colorScheme: 'light',
  locale: 'fr-FR',
  state: 'default',
  content: 'HeroVideo au défaut contractuel : poster vide, 2 scrims, titre 44/48 Regular, CTA outlineBlanc — aucun bitmap transporté',
  fonts: 'Montserrat générée par le snapshot actif',
} as const;
