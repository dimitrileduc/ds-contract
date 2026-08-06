/**
 * Les 3 sujets de la comparaison d'image, et la GÉOMÉTRIE ÉPINGLÉE qui les rend
 * comparables. Spec 018, US3. Protocole : ../contracts/visual-comparison.md.
 *
 * ── Pourquoi un clip épinglé, et pas la boîte naturelle de chaque composant ──
 * `npm run images:compare` REFUSE deux images de tailles différentes
 * (`dimension-mismatch`, code 2) plutôt que de les redimensionner — délibérément,
 * « because it would otherwise hide a visual change ». Capturer chaque composant
 * à sa boîte naturelle donnerait donc deux tailles et AUCUN pourcentage.
 *
 * Le clip épinglé rend les tailles égales PAR CONSTRUCTION : la comparaison
 * stricte s'applique telle quelle, et une différence de géométrie se lit en
 * pixels de diff au lieu de disparaître dans un refus.
 *
 * ── Les nombres ci-dessous sont MESURÉS, pas choisis ─────────────────────────
 * `render-html.mts --measure` rend chaque sujet et imprime la boîte englobante
 * réelle du composant. Les clips sont ces boîtes arrondies à l'entier supérieur,
 * plus la marge du cadre. Reçu : ../proofs/clip-mesure.txt.
 * Ils sont volontairement SERRÉS : un clip large diluerait le pourcentage de
 * pixels différents dans du blanc identique des deux côtés, et rendrait tout
 * écart artificiellement petit.
 */

/** Marge du cadre de mesure, des DEUX côtés. Côté Odoo, `views/harness.xml`
 *  applique `padding: var(--pqr-space-24)` ; côté HTML, `render-html.mts`
 *  applique `var(--space-24)` — le MÊME jeton, sous ses deux noms. */
export const FRAME_PADDING_TOKEN = 24;

/** Épinglé des deux côtés (invariant §3.2 du protocole). */
export const DEVICE_SCALE_FACTOR = 2;

export interface Subject {
  /** Clé de fichier et de ligne de rapport. */
  readonly key: string;
  /** Le contrat rendu. */
  readonly contractId: string;
  /** Chemin de la page de mesure Odoo, relatif à la base. */
  readonly odooPath: string;
  /** L'étiquette de la vignette du showcase `emitHtml` que ce sujet compare.
   *  Le showcase varie UNE prop à la fois depuis les défauts du contrat ; la
   *  page de mesure Odoo rend exactement la même combinaison. Comparer deux
   *  combinaisons différentes viderait la mesure de son sens — c'est le piège
   *  qui a été trouvé au premier relevé, et corrigé plutôt que contourné. */
  readonly showcaseLabel: string;
  /** Clip épinglé, en px CSS, identique des deux côtés. Origine (0,0) = coin
   *  haut-gauche de la page, la marge du cadre étant incluse dedans. */
  readonly clip: { readonly width: number; readonly height: number };
}

export const SUBJECTS: readonly Subject[] = [
  {
    key: 'button',
    contractId: 'ds.button',
    odooPath: '/piqueray-mesure/button',
    showcaseLabel: 'default',
    clip: { width: 292, height: 126 },   // boîte mesurée 267×102 + garde 24
  },
  {
    key: 'section-header',
    contractId: 'ds.section-header',
    odooPath: '/piqueray-mesure/section-header',
    showcaseLabel: 'disposition=avecCta',
    clip: { width: 1622, height: 126 }, // boîte mesurée 1598×102 + garde 24
  },
  {
    key: 'presentation',
    contractId: 'ds.presentation',
    odooPath: '/piqueray-mesure/presentation',
    showcaseLabel: 'default',
    clip: { width: 1360, height: 168 }, // boîte mesurée 1335×144 + garde 24
  },
];

/** Viewport : au moins le clip, plus une marge de sécurité, pour qu'aucun
 *  composant ne se replie à cause d'un conteneur trop étroit. */
export const viewportFor = (s: Subject) => ({
  width: s.clip.width + 80,
  height: s.clip.height + 80,
});

export const subjectByKey = (key: string): Subject => {
  const s = SUBJECTS.find((x) => x.key === key);
  if (!s) throw new Error(`Sujet inconnu : « ${key} ». Connus : ${SUBJECTS.map((x) => x.key).join(', ')}`);
  return s;
};
