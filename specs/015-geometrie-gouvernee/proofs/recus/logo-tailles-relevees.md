# Reçu — T048, vérification préalable from-dump des « deux tailles » du logo (D4)

**Date** : 2026-08-04 · **Méthode** : lecture Figma en direct (`figma_get_component_for_development`, REST, sans Desktop Bridge — lecture seule, FR-010) sur `ds.header` (nœud `84:285`) + dump commité (`extract/figma/visual-parity/out/_cache/nodes-…-2120_4785.json`) pour `ds.footer` (nœud `2120:4785`).

## Le relevé

| Usage | Nœud Figma | `absoluteBoundingBox` | Écart vs maître 180×34 |
|---|---|---|---|
| `ds.header`, variante Couleur=Default | `84:256` (instance de `4:13`) | **180 × 34** exact | 0 |
| `ds.header`, variante Couleur=Blanc | `84:287` (instance de `4:15`) | **180 × 34** exact | 0 |
| `ds.footer` | `2120:4783` | **180.0985565185547 × 34** | +0,0547 % en largeur, 0 en hauteur |

Les deux instances header ont été lues **en direct** (pas depuis un dump périmé) : `figma_get_component_for_development` retourne l'arbre complet du COMPONENT_SET `Header`, descend jusqu'aux enfants `PiquerayLogo` des deux variantes `Fond=Solid`/`Fond=Transparent`, avec leur `absoluteBoundingBox` propre. Les deux valent exactement 180×34 — aucune décimale, aucun écart.

L'instance footer (180.0985565185547×34) est un dump commité de 015 (Phase 2, T005/T006). L'écart de +0,0985px sur 180px (0,0547 %) porte les MÊMES décimales de position que celles déjà observées sur les enfants `vectorAsset` du maître (`34.329803466796875` pour la position du Wordmark, valeur identique dans header ET footer) — c'est la précision flottante native de l'export Figma, pas une intention de design. La description déjà écrite dans `contracts/footer.contract.json` (« Largeur relevée 180.0985565185547px… NON PORTÉE ») le disait déjà sans le nommer explicitement comme bruit.

## Le fait qui re-pose D4

**Il n'existe pas deux tailles.** Header (exact) et footer (bruit de 0,05 %) utilisent tous deux, à la précision de mesure près, **la même taille unique** — celle du maître, 180×34. La prémisse « un composant, deux tailles » de la User Story 4 / DW-001 ne tient pas à la vérification : DW-001 nomme un vrai défaut (le littéral `180px`/`34px` du root est invisible au différentiel, pas gouverné par un token), mais ce défaut n'a besoin d'aucune infrastructure « deux tailles » pour être réparé — une conversion littéral→token à une seule valeur suffit.

## Ce que cela change pour la suite de la Phase 5

Conformément à la clause de D4 elle-même (« si l'usage n'est pas proportionnel/distinct, la décision est re-posée avec le relevé en main ») — **cette décision est re-posée à l'owner avant d'écrire T049-T055**, qui présupposent tous une prop `taille` à plusieurs valeurs et le lift moteur `vectorAsset`-en-pourcentages associé. Options possibles, aucune engagée ici : (a) réparer DW-001 par la voie simple — un seul token `size.logo.width`/`size.logo.height`, zéro prop, zéro lift moteur, US4 se referme en une tâche ; (b) garder la prop `taille` par anticipation (016 pourrait introduire une vraie deuxième taille au master) mais avec une seule valeur nommée aujourd'hui, sans deviner la seconde ; (c) autre chose que l'owner voit et pas moi.

**Rien n'est supposé — le relevé est en main, la décision revient à l'owner.**
