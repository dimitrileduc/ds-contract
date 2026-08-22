# Relevé d'extraction — source nettoyée post-Gate B (T026)

**Date** : 2026-08-20 · **Fichier** : Piqueray (Copy) `d9FYAUcqdcNtsuaMgLefvJ`, page « Pages » 210:325
**Route** : pont figma-console (`figma_execute` + `loadAllPagesAsync`), port 9223, `portFallbackUsed:false`
**Nature** : lecture seule (aucune mutation canvas). Dump volumineux non committé, **reproductible**
depuis la source vivante par les sondes ci-dessous (précédent 007).

## Masters relevés (état post-Gate B)

| Master | nodeId | key | axes | note |
|---|---|---|---|---|
| CarteCategorie (molécule) | 2495:6770 | 0d1a03d07abf7225fb560b3d4163dd3575132c62 | Style {Superpose, Empile} | NOUVEAU set gouverné (US1b) |
| CategoriesPrincipales (section) | 2115:4277 | 94f64a369a5db615d68935bb353614eaaadbffc2 | Style {Superpose, Empile} × Colonnes {2,3} | axe « Disposition » supprimé ✅ |
| Carte (ancien) | 2063:1622 | — | Disposition {Reassurance, Categorie} | Categorie = 2407:4905 (743×3310, cassé, orphelin → retrait v3) |

## Molécule `CarteCategorie` — faits relevés

- **propDefs** : `Titre` (TEXT, défaut « Pour portes de garage »), `Texte` (TEXT, défaut « SupraMatic & ProMatic. … »), `Style` (VARIANT).
- **Empile** (743×622) : root blanc (`color/blanc`), gap `space/32`, largeur `size/carte/root-categorie` (743).
  - `categorieImage` FRAME IMAGE FILL, hauteur `size/carte/categorie-image` (418).
    > **Note du 2026-08-22 (ne corrige pas le relevé, le précise).** Ce « 418 » est la hauteur
    > **à la largeur du master (743)**, pas une hauteur figée : les variantes de section le
    > montrent à trois largeurs (744→418, 832→468, 533→300, rapport 1.78 constant). Le contrat
    > l'avait d'abord porté comme jeton `height` — faux à toute autre largeur. Il le porte
    > désormais comme `layout.aspectRatio`. Et « FILL » ici est **horizontal** : rendu par
    > `layout.width:"fill"`, jamais par `layout.grow` (dont la projection CSS est un
    > étirement d'axe principal, donc VERTICAL sous un root en colonne).
    > Voir [../proofs/amendement-2026-08-22.md](../proofs/amendement-2026-08-22.md).
  - `text` : `TitreCategorie` (→prop Titre, `color/noir-bleute`, 32px, Medium), `TexteCategorie` (→prop Texte, `color/noir-bleute`, 18px).
  - `Bouton` → `action` INSTANCE de `Bouton` : Style **Link**, Libellé « Contactez-nous », Glyphe gauche 230:585 (pdf), Glyphe droite 230:599 (download), radius `radius/32`, gap `space/10`.
- **Superpose** (744×418) : root IMAGE FILL, VERTICAL primary MAX (contenu en bas).
  > **Note du 2026-08-22.** Ce 744×418 n'avait **pas** été porté au contrat : le style
  > superposé n'avait aucune hauteur et rendait 743×**149** (écrasé sur son texte). Corrigé
  > en faisant du plan photo un enfant EN FLUX porteur du rapport, le voile passant en absolu. Bordure `border-width/1` **sans peinture visible** (pas de bord rendu).
  - `Décor` VECTOR 98×128 absolu, coin haut-droit (614,32), contour sans remplissage → **SVG extrait** en `assets/vectors/carte-categorie-decor.svg` (stroke currentColor).
  - `wrapper` (bas) : dégradé GRADIENT_LINEAR **rgba(0,0,0,0) 0% → rgba(0,0,0,0.75) 100%** (haut→bas), pad `space/32`, gap `space/8`.
    - `inner` HORIZONTAL align end gap `space/16` : `Item1Titre` (blanc, 40px, Regular, line-height **50**, textCase **UPPER**), `Item1Texte` (blanc, 18px, line-height 27) ; `ArrowRight` INSTANCE 35×35.
  - **Défaut de source relevé** : dans Superpose, les textes ne sont PAS liés aux propriétés Titre/Texte (hardcodés) — contrairement à Empile. Le contrat lie les deux styles aux props partagées (nettoyage porté au contrat ; l'axe/binding canvas est un suivi US3/sync).

## Section `CategoriesPrincipales` — faits relevés

- **propDefs** : `Style` (VARIANT, défaut Superpose), `Colonnes` (VARIANT, défaut 2).
- **4 variantes**, chacune un FRAME **HORIZONTAL** (pas GRID) gap **64**, cartes en FILL :
  - Superpose/2 (1728×468), Empile/2 (1728×699), Empile/3 (1728×531), Superpose/3 (1728×300).
  - 2 colonnes → cartes 832 ; 3 colonnes → cartes 533 (= largeur restante / n, gap 64).
- **Décision de modélisation** : le contrat porte une part **grid** (E1 `columns` 2→3), pas l'HORIZONTAL de la
  source. `npm run parity` ne compare QUE la surface d'API (props, instances imbriquées), pas le mode de layout
  (`parity/extract-figma.plugin.js` : `properties` + `nestedInstances` seuls) — le grid est donc invisible à la
  porte, et la parité visuelle rend à l'identique (2 colonnes égales + gap 64 ≡ 2 cartes FILL + gap 64).
- **Contenus réels** relevés (échantillon `repeat`) : « Pour portes de garage / SupraMatic & ProMatic… »,
  « Pour portails d'entrée / RotaMatic (Battant)… », « Pilotez à distance / Vérifiez si votre porte… »,
  « PORTES INDUSTRIELLES SUR MESURE », « PORTES AVEC PORTILLON INTÉGRÉ »…

## Jetons : réutilisation intégrale (zéro mint)

Tous les faits géométriques de la source sont déjà des jetons Piqueray : `color/blanc`, `color/noir-bleute`,
`size/carte/root-categorie` (743), `size/carte/categorie-image` (418), `space/{0,8,16,32,64}`, `radius/32`,
`border-width/1`, `font.size.{18,32,40}`, `font.weight.{regular,medium}`, `font.family.montserrat`. **Aucun mint**
(le build confirme : 234 → 234 custom properties). Un seul littéral géométrique nommé au registre :
le dégradé du voile superposé (`carte-categorie-scrim-named-literal`, doctrine ds.hero).
