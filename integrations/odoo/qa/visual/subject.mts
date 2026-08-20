/**
 * Le CONTRAT d'un sujet de comparaison d'image, et la géométrie épinglée qui rend
 * deux captures comparables. Spec 019, tâche T004.
 *
 * ── Écart nommé par rapport à l'énoncé de T004 ───────────────────────────────
 * T004 énumère quatre fichiers : `render-html.mts`, `capture-odoo.mts`,
 * `compare.mts`, `selftest.mts`. Ce cinquième fichier existe parce que les trois
 * premiers ET les modules de sujets de T025/T041 ont besoin du MÊME type et des
 * MÊMES constantes. Le placer dans l'un des quatre forcerait `capture-odoo.mts` à
 * importer `render-html.mts` — donc `emitHtml` et `loadRepoData` — pour lire une
 * interface. L'écart est ici, écrit, plutôt que silencieux.
 *
 * ── Ce que ce fichier ne contient PAS, et c'est le point de T004 ─────────────
 * Aucune liste de sujets, aucun clip, aucun verdict. 018 fusionnait le type, les
 * constantes ET ses trois sujets dans un seul `subjects.mts` ; ses clips étaient
 * mesurés sur SES composants et ses `odooPath` pointaient vers SON banc d'essai.
 * Les reprendre ici serait recopier des verdicts. Les sujets de 019 sont écrits
 * par T025 (`subjects/google-reviews.mts`) et T041 (`subjects/presentation.mts`),
 * et chargés par `--subjects`.
 *
 * ── Pourquoi un clip ÉPINGLÉ plutôt que la boîte naturelle ───────────────────
 * `extract/image-parity` REFUSE deux images de tailles différentes
 * (`dimension-mismatch`) au lieu de les redimensionner — délibérément, parce que
 * redimensionner masquerait un changement visuel. Capturer chaque composant à sa
 * boîte naturelle donnerait deux tailles et AUCUN pourcentage. Le clip épinglé
 * rend les tailles égales par construction : un écart de géométrie se lit alors
 * en pixels de diff au lieu de disparaître dans un refus.
 *
 * Les clips ne se choisissent pas : `render-html.mts --measure` imprime la boîte
 * réelle et refuse un clip trop petit. C'est ce refus qui donne le nombre.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Géométrie épinglée — VALABLE DES DEUX CÔTÉS
//
// Chacune de ces constantes vaut pour la référence HTML *et* pour la capture
// Odoo. Une asymétrie ne produirait pas une mesure approximative : elle
// produirait un écart de rendu qui n'existe pas dans les composants.
// ---------------------------------------------------------------------------

/** Marge du cadre de mesure, des deux côtés, exprimée en numéro de jeton
 *  d'espacement. Côté HTML : `var(--space-N)`. Côté Odoo : `var(--pqr-space-N)`
 *  — le même jeton sous ses deux noms, le préfixe étant celui de la sortie
 *  générée (T012). `selftest.mts` tient les deux ensemble. */
export const FRAME_PADDING_TOKEN = 24;

/** Facteur d'échelle de capture, identique des deux côtés. */
export const DEVICE_SCALE_FACTOR = 2;

/** Plafond d'attente des polices, en ms. Même valeur que
 *  `extract/figma/visual-parity/render.ts`. Un `document.fonts.ready` qui pend ne
 *  doit jamais figer une sonde. */
export const FONT_SETTLE_MS = 5000;

/** Plafond de navigation. Odoo compile ses bundles au premier chargement et peut
 *  être lent ; il ne doit pas pour autant pouvoir figer la sonde. */
export const NAV_TIMEOUT_MS = 60_000;

export interface Subject {
  /** Clé de fichier et de ligne de rapport. Unique dans un module de sujets. */
  readonly key: string;
  /** Le contrat rendu par la référence HTML. */
  readonly contractId: string;
  /** Chemin de la page de mesure Odoo, relatif à la base de l'instance. */
  readonly odooPath: string;
  /** Étiquette de la vignette du showcase `emitHtml` que ce sujet compare.
   *  Le showcase varie UNE prop à la fois depuis les défauts du contrat ; la page
   *  de mesure Odoo doit rendre exactement la même combinaison. Comparer deux
   *  combinaisons différentes viderait la mesure de son sens. */
  readonly showcaseLabel: string;
  /** Élément qui définit l'origine du clip côté Odoo. Sans ce sélecteur, la
   * capture commence à l'origine de la page (utile au self-test synthétique). */
  readonly odooClipSelector?: string;
  /** Largeur de contenu imposée au cadre HTML pour les racines fluides. Le
   *  padding FRAME_PADDING_TOKEN reste ajouté autour et appartient au clip. */
  readonly frameContentWidth?: number;
  /** Fond du cadre de mesure, DES DEUX CÔTÉS (spec 022). Par défaut `light`
   *  (blanc) — la convention 019. `dark` (`--pqr-color-noir-bleute`) sert un
   *  composant à ENCRE CLAIRE comme le header Transparent : sur blanc, son wordmark
   *  blanc et ses liens blancs seraient invisibles, et la mesure comparerait deux
   *  vides. La page de mesure Odoo pose le même fond sombre sur son cadre. */
  readonly surface?: 'light' | 'dark';
  /** Clip épinglé en px CSS, identique des deux côtés. Origine (0,0) = coin
   *  haut-gauche de la page, marge du cadre incluse. */
  readonly clip: { readonly width: number; readonly height: number };
}

/** Le module de sujets attendu derrière `--subjects`. */
export interface SubjectModule {
  readonly SUBJECTS: readonly Subject[];
}

/** Viewport : au moins le clip, plus une garde, pour qu'aucun composant ne se
 *  replie à cause d'un conteneur trop étroit.
 *
 *  La garde de HAUTEUR est portée à 200 (spec 022). RAISON : `screenshot({clip})`
 *  ne capture que `clip ∩ viewport` (pas de scroll implicite). Depuis que le shell
 *  022 est actif, TOUTES les pages de mesure portent le header système (~86 px de
 *  haut), qui pousse la `.pqr-mesure` vers le bas d'autant — l'origine du clip suit
 *  (odooClipSelector), mais son bas dépassait l'ancienne garde de 80 px de 6 px, et
 *  la capture était tronquée. 200 couvre le header + une marge. Sans effet sur le
 *  contenu du clip (le header reste AU-DESSUS de la zone capturée) ni sur la
 *  référence (sa `.pqr-mesure` est à l'origine). */
export const viewportFor = (s: Subject) => ({
  width: s.clip.width + 80,
  height: s.clip.height + 200,
});

// ---------------------------------------------------------------------------
// Chargement des sujets — le point de généralisation de T004
// ---------------------------------------------------------------------------

/**
 * Charge un module de sujets par chemin de fichier et VALIDE sa forme.
 *
 * La validation n'est pas décorative : un module qui exporte `SUBJECTS = []` ou
 * deux sujets de même clé produirait un rapport vide ou des captures qui
 * s'écrasent, et les deux se liraient comme « tout va bien ».
 */
export async function loadSubjects(spec: string): Promise<readonly Subject[]> {
  const abs = path.isAbsolute(spec) ? spec : path.resolve(process.cwd(), spec);
  let mod: Partial<SubjectModule>;
  try {
    mod = (await import(`file://${abs}`)) as Partial<SubjectModule>;
  } catch (e) {
    throw new Error(`Module de sujets illisible : ${spec}\n  ${String(e)}`);
  }
  const subjects = mod.SUBJECTS;
  if (!Array.isArray(subjects)) {
    throw new Error(`${spec} n'exporte pas \`SUBJECTS\` (tableau attendu).`);
  }
  if (subjects.length === 0) {
    throw new Error(`${spec} exporte \`SUBJECTS\` vide — un rapport sans ligne se lirait comme un succès.`);
  }
  const cles = new Set<string>();
  const urls = new Set<string>();
  for (const s of subjects) {
    for (const champ of ['key', 'contractId', 'odooPath', 'showcaseLabel'] as const) {
      if (typeof s[champ] !== 'string' || s[champ].length === 0) {
        throw new Error(`${spec} : sujet sans \`${champ}\` exploitable (${JSON.stringify(s)}).`);
      }
    }
    if (s.odooClipSelector !== undefined &&
      (typeof s.odooClipSelector !== 'string' || s.odooClipSelector.length === 0)) {
      throw new Error(`${spec} : sujet « ${s.key} » avec \`odooClipSelector\` invalide.`);
    }
    if (!s.clip || !(s.clip.width > 0) || !(s.clip.height > 0)) {
      throw new Error(`${spec} : sujet « ${s.key} » sans clip positif.`);
    }
    if (s.frameContentWidth !== undefined && !(s.frameContentWidth > 0)) {
      throw new Error(`${spec} : sujet « ${s.key} » avec frameContentWidth non positif.`);
    }
    if (cles.has(s.key)) throw new Error(`${spec} : clé de sujet dupliquée « ${s.key} » — les captures s'écraseraient.`);
    if (urls.has(s.odooPath)) throw new Error(`${spec} : \`odooPath\` dupliqué « ${s.odooPath} ».`);
    cles.add(s.key);
    urls.add(s.odooPath);
  }
  return subjects;
}

// ---------------------------------------------------------------------------
// Préambule commun des CLI
// ---------------------------------------------------------------------------

/** Lit `--drapeau <valeur>` dans un argv. `null` si absent. */
export const arg = (argv: readonly string[], flag: string): string | null => {
  const i = argv.indexOf(flag);
  return i >= 0 ? (argv[i + 1] ?? null) : null;
};

/** N'exécute `main` que si CE module est le point d'entrée — un import reste
 *  silencieux, ce dont `selftest.mts` dépend pour importer les deux sondes. */
export const runAsCli = (moduleUrl: string, main: () => Promise<void>): void => {
  if (process.argv[1] && fileURLToPath(moduleUrl) === path.resolve(process.argv[1])) {
    main().catch((e) => {
      console.error(e);
      process.exit(1);
    });
  }
};
