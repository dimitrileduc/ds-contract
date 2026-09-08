/**
 * Le diagnostic SECTION PAR SECTION. Spec 037, T051.
 *
 * ── Le retrait qui décide de tout : Header ET Footer, du côté Figma ──────────
 * Côté Odoo, `#wrap > section` ne contient NI l'en-tête NI le pied : l'en-tête
 * est au-dessus du `#wrap`, et le pied est la zone `//div[@id='footer']` de
 * `website.layout` (`views/footer.xml` l. 8). Les vues v2, elles, les portent
 * comme enfants — chaque ordre du relevé R1 se termine par « › Footer », et la
 * home ajoute « (+Header) ».
 *
 * Vérifié le 2026-09-08 : `home.json` porte 8 sections là où sa vue en liste
 * 9 + Header. Sans ce retrait, CHAQUE page sortirait un faux « 8 vs 10 sections »
 * et une fausse section d'origine du décalage — un diagnostic faux à toutes les
 * lignes, sur des pages parfaitement saines.
 *
 * Le retrait est fait par NOM (`Header` / `Footer`), en tête et en queue
 * seulement : retirer un enfant nommé « Footer » trouvé au milieu masquerait une
 * vraie section.
 */
import type { Boite, SectionAppariee } from './types.js';

const EST_ENTETE = (nom: string): boolean => /^header\b/i.test(nom.trim());
const EST_PIED = (nom: string): boolean => /^footer\b/i.test(nom.trim());

/**
 * Retire l'en-tête en TÊTE et le pied en QUEUE de la liste des enfants d'une
 * vue Figma. Rien d'autre n'est retiré, et rien au milieu.
 */
export function retirerEnteteEtPied(enfants: readonly Boite[]): Boite[] {
  let debut = 0;
  let fin = enfants.length;
  while (debut < fin && EST_ENTETE(enfants[debut].nom)) debut++;
  while (fin > debut && (EST_PIED(enfants[fin - 1].nom) || EST_ENTETE(enfants[fin - 1].nom))) fin--;
  return enfants.slice(debut, fin);
}

export interface Diagnostic {
  readonly sections: readonly SectionAppariee[];
  /** `« égale »` ou `« <n> vs <m> sections »` — jamais un silence. */
  readonly structure: string;
  /** Première section dont le décalage cumulé dépasse la tolérance. */
  readonly sectionOrigineDecalage: string | null;
}

/**
 * Apparie PAR POSITION (le i-ème enfant restant de la vue ↔ la i-ème `section`
 * du `#wrap`) et nomme la première section dont le décalage CUMULÉ dépasse la
 * tolérance : c'est celle qui pousse tout ce qui suit vers le bas.
 *
 * Un nombre de sections différent APRÈS retrait est un écart de STRUCTURE, écrit
 * en clair. On apparie quand même ce qui peut l'être : un écart de structure ne
 * doit pas faire disparaître le peu de diagnostic encore possible.
 */
export function diagnostiquer(
  enfantsFigma: readonly Boite[], sectionsOdoo: readonly Boite[], tolerancePx: number,
): Diagnostic {
  const figma = retirerEnteteEtPied(enfantsFigma);
  const n = Math.min(figma.length, sectionsOdoo.length);
  const sections: SectionAppariee[] = [];
  let cumul = 0;
  let origine: string | null = null;
  for (let i = 0; i < n; i++) {
    const f = figma[i];
    const o = sectionsOdoo[i];
    const ecartH = o.h - f.h;
    // Le décalage CUMULÉ, c'est la somme des écarts de hauteur des sections
    // AU-DESSUS : une section trop haute pousse toutes les suivantes.
    if (origine === null && Math.abs(cumul + ecartH) > tolerancePx) origine = o.nom;
    cumul += ecartH;
    sections.push({
      nom: o.nom,
      figma: { y: f.y, h: f.h },
      odoo: { y: o.y, h: o.h },
      ecartH,
      ecartYCumule: cumul,
    });
  }
  const structure = figma.length === sectionsOdoo.length
    ? 'égale'
    : `${sectionsOdoo.length} vs ${figma.length} sections`;
  return { sections, structure, sectionOrigineDecalage: origine };
}
