/**
 * Le RAPPORT : un JSON par largeur, un triptyque 1:1 hors dépôt. Spec 037, T052.
 *
 * ── Ce qui est écrit, et ce qui ne l'est jamais ─────────────────────────────
 * `cause`, `justification` et `ecartsContenu` naissent VIDES et se remplissent
 * à la main, après lecture du triptyque. Une cause devinée par l'instrument
 * serait une cause qui a l'air vérifiée sans l'être.
 *
 * `impossible` porte TOUJOURS sa raison, et tous ses scores sont nuls : un
 * rapport impossible n'est ni réussi ni échoué — il dit qu'il n'a pas pu
 * mesurer, et pourquoi (FR-017, §V).
 *
 * Le triptyque est à TAILLE RÉELLE (1:1), une largeur par rapport, jamais une
 * vignette (§XII) — d'où son poids, d'où sa vie hors du dépôt sous
 * `.page-parity/037/` (gitignoré) avec son `sha256` écrit DANS le JSON : la
 * preuve reste vérifiable même si l'image ne voyage pas.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeTriptych } from '../figma/visual-parity/img.js';
import type { Comparaison } from './compare.js';
import type { Diagnostic } from './sections.js';
import { REGLE_CADRAGE, type Rapport } from './types.js';

const sha256 = (b: Buffer | string): string => createHash('sha256').update(b).digest('hex');

/** Racine du dépôt, déduite de l'emplacement de CE fichier — jamais de
 *  `process.cwd()` : un rapport doit être identique quel que soit le répertoire
 *  d'appel, et comparable d'un poste à l'autre. */
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const relatifAuDepot = (abs: string): string => path.relative(REPO, abs).split(path.sep).join('/');

/** JSON canonique : clés triées, deux espaces, saut final — deux mesures sans
 *  changement doivent rendre le MÊME octet (SC-005). */
function canonique(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(canonique);
  if (v && typeof v === 'object') {
    const src = v as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(src).sort()) out[k] = canonique(src[k]);
    return out;
  }
  return v;
}

export const ecrireRapport = (abs: string, r: Rapport): void => {
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(canonique(r), null, 2)}\n`);
};

/**
 * Relit un rapport déjà écrit pour en CONSERVER les champs remplis à la main.
 * Re-mesurer ne doit pas effacer une cause écrite hier : l'instrument possède
 * les chiffres, l'humain possède les raisons.
 */
export function reprendreAnnotations(abs: string): Pick<Rapport, 'ecartsContenu' | 'cause' | 'justification'> {
  try {
    const ancien = JSON.parse(readFileSync(abs, 'utf8')) as Partial<Rapport>;
    return {
      ecartsContenu: ancien.ecartsContenu ?? [],
      cause: ancien.cause ?? null,
      justification: ancien.justification ?? null,
    };
  } catch {
    return { ecartsContenu: [], cause: null, justification: null };
  }
}

export interface EntreeRapport {
  readonly page: string;
  readonly url: string;
  readonly largeur: number;
  readonly instance: string;
  readonly date: string;
  readonly seuilPct: number;
  readonly toleranceHauteurPx: number;
}

/** Le rapport d'une mesure qui n'a PAS pu avoir lieu. Jamais un score de 0. */
export function rapportImpossible(e: EntreeRapport, raison: string): Rapport {
  return {
    page: e.page, url: e.url, largeur: e.largeur, instance: e.instance, date: e.date,
    statut: 'impossible', raisonImpossible: raison,
    figma: null, odoo: null, ecartHauteurPx: null,
    regleCadrage: REGLE_CADRAGE, hauteurCommune: null,
    diffPixels: null, scorePct: null,
    seuilPct: e.seuilPct, toleranceHauteurPx: e.toleranceHauteurPx,
    verdictPixel: null, verdictHauteur: null, verdictPage: 'impossible',
    structure: 'non mesurée', sections: [], sectionOrigineDecalage: null,
    ecartsContenu: [], cause: null, justification: null, triptyque: null,
  };
}

export interface Mesure {
  readonly entree: EntreeRapport;
  readonly nodeId: string;
  readonly hauteurFigma: number;
  readonly sha256Figma: string;
  readonly hauteurOdoo: number;
  readonly sha256Odoo: string;
  readonly comparaison: Comparaison;
  readonly diagnostic: Diagnostic;
  /** Dossier des triptyques — hors dépôt (`.page-parity/037/<page>/`). */
  readonly dossierTriptyques: string;
  readonly annotations: Pick<Rapport, 'ecartsContenu' | 'cause' | 'justification'>;
}

export function rapportMesure(m: Mesure): Rapport {
  const { entree: e, comparaison: c } = m;
  mkdirSync(m.dossierTriptyques, { recursive: true });
  const chemin = path.join(m.dossierTriptyques, `${e.largeur}.png`);
  writeTriptych(chemin, c.aligned, c.diff);
  return {
    page: e.page, url: e.url, largeur: e.largeur, instance: e.instance, date: e.date,
    statut: 'mesurée', raisonImpossible: null,
    figma: { nodeId: m.nodeId, hauteur: m.hauteurFigma, sha256: m.sha256Figma },
    odoo: { hauteur: m.hauteurOdoo, sha256: m.sha256Odoo },
    ecartHauteurPx: c.ecartHauteurPx,
    regleCadrage: REGLE_CADRAGE,
    hauteurCommune: c.hauteurCommune,
    diffPixels: c.diffPixels,
    // Deux décimales : au-delà, le dernier chiffre bouge avec le rendu du texte
    // et ferait échouer le déterminisme sur du bruit.
    scorePct: Math.round(c.scorePct * 100) / 100,
    seuilPct: e.seuilPct, toleranceHauteurPx: e.toleranceHauteurPx,
    verdictPixel: c.verdictPixel, verdictHauteur: c.verdictHauteur, verdictPage: c.verdictPage,
    structure: m.diagnostic.structure,
    sections: m.diagnostic.sections,
    sectionOrigineDecalage: m.diagnostic.sectionOrigineDecalage,
    ...m.annotations,
    triptyque: { chemin: relatifAuDepot(chemin), sha256: sha256(readFileSync(chemin)) },
  };
}
