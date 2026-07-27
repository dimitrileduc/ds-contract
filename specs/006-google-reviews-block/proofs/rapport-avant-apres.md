# Rapport avant/après — adoption du bloc « Avis Google » (US2, FR-014)

Une entrée par occurrence (8/8, T010) — image, écart mesuré (`regionPct`, la seule métrique
comparable entre maquettes puisque `diffCount` brut dépend de la taille de page), explication
de ce que l'écart contient, identification avant/après (checkpoint `versionId`). Assemblé
**après** le dernier geste canevas (T076/T076a), conformément au bracket US2 (Phase 3 → Phase 7).

Toutes les occurrences suivent le même écart *attendu et nommé d'avance* (R3 §4, avant
exécution) : police web (Montserrat non chargée dans Figma), rendu vectoriel de l'avatar-badge
(icône `check` vs bitmap), et le fill de l'avatar photo de la carte 5 (override hors contrat,
trou A5, T066). Seule la présence d'un **résidu supplémentaire** est signalée par occurrence.

| # | Maquette | Checkpoint `versionId` | `regionPct` | `outsideDiffCount` | Résidu hors bloc |
|---|---|---|---|---|---|
| 1 | Accueil | `2380497911740264333` | 7,708 % | 0 | — |
| 2 | Portes de garage | `2380488227635314062` | 7,767 % | 8 | Oui — nommé, investigué, acquitté owner (T050) |
| 3 | Portes de garage résidentielles | `2380488309250329332` | 7,791 % | 0 | — |
| 4 | Portes de garage industrielles | `2380479912615961439` | 7,791 % | 0 | — |
| 5 | Portes d'entrée | `2380479912611376139` | 7,791 % | 0 | — |
| 6 | Dépannage/SAV | **non capturé** (trou nommé, T054) | 7,708 % | 0 | — |
| 7 | À Propos | `2380513439123474372` | 7,708 % | 0 | — |
| 8 | Contactez-nous | `2380525700182315678` | 7,708 % | 0 | — |

**8/8 entrées — complétude vérifiée (T078)** : aucun échantillonnage, chaque occurrence de
`inventory/occurrences.json` (T010) a son entrée, sa capture avant, son `verdict.json` et son
crop triptyque committés dans `proofs/<maquette>/`.

## 1. Accueil

![Accueil](accueil/crops/Accueil.png)

`regionPct = 7,708 %` (39238 px de la région déclarée 1552×328, soit `region.json`).
`outsideDiffCount = 0` — `diffCount` (39238) égale exactement `regionDiffCount` : la totalité
de l'écart mesuré est **contenue dans le bloc**, rien en dehors. `Motorisation` (témoin)
`identical`. Contenu de l'écart : police (Montserrat non chargée par Figma → glyphes de
substitution), avatar-badge (icône `check` gouvernée vs pastille vectorielle Figma), fill photo
carte 5 (A5). Aucun résidu supplémentaire.

## 2. Portes de garage

![Portes de garage](portes-de-garage/crops/Portes%20de%20garage.png)

`regionPct = 7,767 %` (39539 px). **`outsideDiffCount = 8`** — investigué avant acceptation
(decisions.md T050) : deux foyers hors du bloc (`Presentation` ~y1246, `TexteSEO` ~y3417/3643),
confirmés non-bruit par calibration (2 captures indépendantes, sha256 identiques) et par test de
nudge. Cause retenue : 10 passes de convergence ont fait rejouer l'auto-layout du cadre entier,
re-rastérisant à un sous-pixel différent du texte **non modifié** de deux composants sans
rapport avec le bloc. **Acquitté par l'owner** — 8 px sur toute la page, sous tout seuil de
perception, coût de correction (geste + ré-exécution) jugé disproportionné.

## 3. Portes de garage résidentielles

![Portes de garage résidentielles](portes-de-garage-residentielles/crops/Portes%20de%20garage%20r%C3%A9sidentielles.png)

`regionPct = 7,791 %` (39663 px). `outsideDiffCount = 0` du premier coup — convergence en 4
passes (technique affinée après T050 : écrire `inst.x/y` immédiatement après `appendChild`),
les 8 frères du `GROUP` relus identiques bit pour bit à l'avant-mutation. Aucun résidu
supplémentaire.

## 4. Portes de garage industrielles

![Portes de garage industrielles](portes-de-garage-industrielles/crops/Portes%20de%20garage%20industrielles.png)

`regionPct = 7,791 %` (39663 px). `outsideDiffCount = 0`, 8 frères identiques bit pour bit.
Aucun résidu supplémentaire.

## 5. Portes d'entrée

![Portes d'entrée](portes-d-entree/crops/Portes%20d'entr%C3%A9e.png)

`regionPct = 7,791 %` (39663 px). `outsideDiffCount = 0`, 8 frères identiques bit pour bit.
Aucun résidu supplémentaire.

## 6. Dépannage/SAV

![Dépannage/SAV](depannage-sav/crops/D%C3%A9pannage_SAV.png)

`regionPct = 7,708 %` (39238 px, identique à Accueil : même contenu, même bloc).
`outsideDiffCount = 0` — `diffCount` égale exactement `regionDiffCount`. **Bug d'instrument
trouvé et corrigé pendant cette adoption** : `Dépannage/SAV` est la seule maquette dont le nom
réel contient un `/` ; `cli.ts` appariait la région sur le nom assaini (`Dépannage_SAV`) au lieu
du nom réel du manifeste, la région ne matchait jamais. Corrigé dans
`extract/figma/page-parity/cli.ts`, verdict régénéré **hors ligne** (zéro écriture canevas
supplémentaire). **Trou nommé** : le `versionId` du checkpoint `006/adoption/depannage-sav` n'a
pas été capturé dans un artefact committé au moment du geste (contrairement aux 7 autres) —
non récupérable après coup (`FIGMA_ACCESS_TOKEN`/API versions indisponible côté outillage local
à la clôture) ; consigné comme trou plutôt qu'inventé.

## 7. À Propos

![À Propos](a-propos/crops/%C3%80%20Propos.png)

`regionPct = 7,708 %` (39238 px). `outsideDiffCount = 0` (SC-003). Aucun résidu supplémentaire.

## 8. Contactez-nous

![Contactez-nous](contactez-nous/crops/Contactez-nous.png)

`regionPct = 7,708 %` (39238 px). `outsideDiffCount = 0` (SC-003). Aucun résidu supplémentaire.
Note (T072) : un diff exogène de 1 px sur le pied de page de cette maquette est apparu **après**
cette adoption, pendant la démo US4 — édition concurrente d'un autre écrivain, hors bloc,
disparue au moment du renommage T076. Sans rapport avec l'adoption elle-même.

## Synthèse des écarts (T079)

**Les 8 chiffres, dénominateur affiché à côté de celui du `GROUP`** — le dénominateur employé
pour `regionPct` est **la bbox de l'aplat** (`bboxAplat`, ex. Accueil 1552×328 = 509 056 px),
**pas** celle du `GROUP` avec effets (`bboxGroup`, ex. Accueil 1552×459 = 712 368 px, +40 % de
surface). Utiliser le `GROUP` diluerait artificiellement chaque pourcentage — FR-015.

| Maquette | `regionDiffCount` | dénominateur (aplat) | `regionPct` |
|---|---|---|---|
| Accueil | 39 238 | 509 056 | 7,708 % |
| Portes de garage | 39 539 | 509 056 | 7,767 % |
| Portes de garage résidentielles | 39 663 | 509 056 | 7,791 % |
| Portes de garage industrielles | 39 663 | 509 056 | 7,791 % |
| Portes d'entrée | 39 663 | 509 056 | 7,791 % |
| Dépannage/SAV | 39 238 | 509 056 | 7,708 % |
| À Propos | 39 238 | 509 056 | 7,708 % |
| Contactez-nous | 39 238 | 509 056 | 7,708 % |

**Fidélité structurelle vs fidélité raster** : les **8/8** occurrences sont **structurellement
exactes** — géométrie du `GROUP` reconstituée à < 0,0004 px (FR-012), contenu conforme par
propriétés (aucun calque dessiné). L'écart **raster** (7,7-7,8 %) n'est pas une divergence de
structure ; il se décompose en trois contributions constantes, toutes attendues *avant*
exécution (R3 §4) :
1. **Police** (la plus grosse part) — Montserrat non chargée par le moteur de rendu Figma au
   moment de la capture, glyphes de substitution.
2. **Avatar-badge** — icône `check` gouvernée (vectorielle, contrat) vs pastille bitmap
   d'origine.
3. **Fill photo de la carte 5** — override hors contrat (trou A5, T066), 1 des 5 cartes sur
   chaque occurrence.

**Contribution isolée des fills photo (override hors contrat)** : présents sur **8/8**
occurrences (une carte photo par bloc, T048/T057), jamais mesurés séparément — un seul
`regionDiffCount` agrège les trois contributions par construction de l'instrument (pixelmatch
sur la région entière). Nommé comme **limite de granularité de la preuve**, pas comme un écart
supplémentaire découvert ici.

**`outsideDiffCount` (T080, SC-003)** : **0 sur 7/8** occurrences et sur `Motorisation`
(témoin, `identical`/`diffCount 0` sur les **8** verdicts relus ci-dessus — jamais touché,
confirmant qu'aucune adoption n'a débordé de son cadre). La seule exception, **Portes de
garage** (`outsideDiffCount 8`), est investiguée et acquittée en entrée #2 — un résidu de texte
non modifié dans deux composants sans rapport, sous tout seuil de perception.
