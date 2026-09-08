/**
 * Les NEUF pages du site Piqueray — l'identité partagée. Spec 037, tâche T005.
 *
 * ── Pourquoi une liste blanche écrite en dur, et pas un motif de nom ─────────
 * `integrations/odoo/authoring/pages/` contient aussi des descripteurs qui ne
 * sont PAS des pages du site : les bancs `*-test.json`, et — relevé du
 * 2026-09-08 — au moins un qui ne suit même pas ce motif (`hero-video-mesure.json`).
 * Dériver l'identité des pages d'un motif de nom de fichier ferait donc entrer
 * un banc dans le site le jour où quelqu'un l'appelle autrement, en silence.
 *
 * La liste ci-dessous est la seule source : le résolveur, le scénario de
 * navigation (`pages-navigation.spec.mts`) et l'instrument de mesure
 * (`extract/odoo-page-parity/`) la lisent tous les trois. Un descripteur de
 * `pages/` qui n'est ni dans cette liste ni un `*-test.json` est **refusé en
 * étant nommé** par `npm run odoo:pages:check` : un fichier de travail se
 * classe, il ne s'ignore pas (§V, data-model §1).
 */
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { repoPath } from './canonical.js';

/** Une page du site : son URL publique, son descripteur, son nom court. */
export interface SitePage {
  /** URL publique, `/` pour l'accueil. C'est l'identité côté site. */
  readonly url: string;
  /** Nom court = base du fichier `pages/<nom>.json` = clé de `views.json`. */
  readonly nom: string;
  /** Libellé humain, tel qu'il est écrit dans la spec et les rapports. */
  readonly libelle: string;
}

/**
 * Les 9 pages du site (ordre : accueil, puis l'ordre de l'arbre du menu, puis
 * les deux pages hors menu). Toute page ajoutée au site s'ajoute ICI d'abord.
 */
export const SITE_PAGES: readonly SitePage[] = [
  { url: '/', nom: 'home', libelle: 'Accueil' },
  { url: '/portes-de-garage', nom: 'portes-de-garage', libelle: 'Portes de garage' },
  { url: '/portes-residentielles', nom: 'portes-residentielles', libelle: 'Portes résidentielles' },
  { url: '/portes-industrielles', nom: 'portes-industrielles', libelle: 'Portes industrielles' },
  { url: '/portes-entree', nom: 'portes-entree', libelle: "Portes d’entrée" },
  { url: '/motorisation', nom: 'motorisation', libelle: 'Motorisation' },
  { url: '/depannage-sav', nom: 'depannage-sav', libelle: 'Dépannage/SAV' },
  { url: '/a-propos', nom: 'a-propos', libelle: 'À propos' },
  { url: '/contactez-nous', nom: 'contactez-nous', libelle: 'Contactez-nous' },
] as const;

/** Dossier des descripteurs de page. */
export const PAGES_DIR = repoPath('integrations', 'odoo', 'authoring', 'pages');
/** Dossier du contenu commun (D1) et de la liste fermée des externes (D3). */
export const COMMUN_DIR = repoPath('integrations', 'odoo', 'authoring', 'commun');

/** Chemin du descripteur d'une page du site. */
export const descripteurPath = (nom: string): string => path.join(PAGES_DIR, `${nom}.json`);

/** Recherche par nom court. `undefined` si ce n'est pas une page du site. */
export const pageParNom = (nom: string): SitePage | undefined =>
  SITE_PAGES.find((p) => p.nom === nom);

/** Recherche par URL. `undefined` si l'URL n'est pas celle d'une page du site. */
export const pageParUrl = (url: string): SitePage | undefined =>
  SITE_PAGES.find((p) => p.url === url);

/** L'ensemble des URL internes autorisées comme destination (D3, §5). */
export const URLS_DU_SITE: ReadonlySet<string> = new Set(SITE_PAGES.map((p) => p.url));

/**
 * Les descripteurs de `pages/` qui ne sont **ni** une page du site **ni** un
 * banc `*-test.json` — donc les fichiers NON CLASSÉS, que `--check` refuse en
 * les nommant. Rendue triée : le refus doit être le même à chaque exécution.
 */
export function descripteursNonClasses(dir: string = PAGES_DIR): string[] {
  const noms = new Set(SITE_PAGES.map((p) => p.nom));
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.slice(0, -'.json'.length))
    .filter((base) => !noms.has(base) && !base.endsWith('-test'))
    .sort();
}
