# Audit — Molécule Section-header (T063)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — repéré par `textCase: UPPER` (la vraie
propriété, pas les caractères tapés — leçon Tab appliquée dès la recherche),
confirmé par nom de layer `Title`.
**Inspiration structurelle (recherche legacy déléguée à un agent en arrière-plan)** :
`empty-state.contract.json` (titre+description optionnelle+slot actions
`accepts:["ds.button"]`) — proche pour la disposition avec CTA. **Zéro précédent
legacy pour l'accroche/eyebrow** — trou réel nommé par l'agent, non comblé par
l'archive. `button.contract.json` (le vrai, live) a déjà le mécanisme
`declared:{text-transform:uppercase}` pour ce genre de transformation d'affichage —
suggéré comme précédent réel plutôt que legacy.

## Usage — localisation (8 des 9 maquettes)

**21 occurrences, 8 maquettes** (absent de `Motorisation`... en fait présent, voir
disposition CTA) : layer `Title`, contenu variable, présent dans quasiment toutes
les sections d'introduction (Réassurances, Réalisations, FAQ, Avis Google) + 2
occurrences à structure différente (Produits e-commerce, avec un bouton CTA au lieu
d'une accroche).

**Trouvaille de complétude** : un premier passage de scan+adoption a raté
**1 occurrence sur 21** (`Nos avis Google vérifiés` sur `Contactez-nous`,
`280:3793`) — repéré en recomptant le ledger généré (20 au lieu de 21 attendus)
avant de le committer, pas après. Toujours revérifier le compte final contre le
compte de découverte initial avant de clore une molécule.

## 2 dispositions réelles

| | Standard (19 occurrences) | Avec CTA (2 occurrences) |
|---|---|---|
| Layout | `VERTICAL`, gap 8, centré | `HORIZONTAL`, `SPACE_BETWEEN` |
| Accroche | 20px Regular, `letterSpacing` **15%**, `textCase: UPPER`, centrée | absente |
| Titre | 40px Regular, centré | 32px Regular, aligné gauche |
| CTA | absent | Bouton existant (`Outilne noir`), instance réelle |

Les 2 occurrences CTA (« Découvrez nos produits disponibles en ligne » + bouton
« Voir  les produits » [double espace dans le libellé source, préservé]) sont sur
`Motorisation` et `Accueil`, juste avant le carrousel produits déjà gouverné
(Product-card/Carousel-controls).

## Piège majeur — incident GROUP résolu en direct (à documenter en détail)

Au pilote (`À Propos`), après adoption des 2 occurrences Standard, la page a
**presque doublé de hauteur** (5928→10168px) — signal immédiat d'un vrai problème,
pas une preuve pixel à ignorer. Cause : `Avis Google` est un `GROUP` (2 enfants :
`Title` + `trustindex-google-reviews-widget`, le screenshot aplati déjà noté au
Phase A). Une correction de position mal maîtrisée sur `Title` seul (sans traiter
le widget en même temps) a fait exploser l'écart entre les deux à ~4288px. Diagnostiqué
en comparant contre une page `Avis Google` intacte (gap réel : 48px), corrigé par
lecture-tout/écriture-tout sur les 2 enfants ensemble, vérifié par pixel-diff complet
après coup (résidu 567px, propre). **Pour la suite des 6 autres occurrences
`Avis Google` (GROUP), la technique complète a été appliquée PRÉVENTIVEMENT, sur les
2 enfants dès le départ** — 0 nouvel incident.

## Piège trouvé — hauteur figée sur les 3 occurrences « FAQ »

Les 3 titres `FAQ`/`Questions fréquentes` (Portes d'entrée, industrielles,
résidentielles) ont une **hauteur de cadre figée à 50px** dans la source, alors que
l'accroche+titre standard mesure 83px (25+8+50) — le titre déborde visuellement sous
le cadre (même mécanisme que le CTA débordant de Product-card), et les **siblings
d'un parent en auto-layout dépendent de cette hauteur nominale**, pas de ce qui est
visuellement rendu. Une première adoption "au hug naturel" (83px) a poussé les
accordéons FAQ de 33px vers le bas. Fix : `primaryAxisSizingMode: FIXED` + hauteur
50 explicite sur ces 3 instances seulement (le master reste en `AUTO` par défaut
pour les 16 autres occurrences, correctement 83px).

## Récapitulatif du master

| Élément | Détail |
|---|---|
| Nom | `Section-header` |
| Variants | `Disposition` (Standard / Avec CTA) |
| Propriétés | `Accroche` (TEXTE, Standard uniquement), `Titre` (TEXTE, partagé) |
| Dépendances | Bouton existant (`Outilne noir`, disposition Avec CTA seulement) |
| Page | `DS · Molécules` |
| nodeId | `2090:2397` |

**Preuve** : pixel-diff complet sur la maquette pilote (`À Propos`) — résidu final
567px/(1728×5928)=0,0055%, bruit habituel (après résolution de l'incident GROUP).
20 occurrences restantes : positions vérifiées convergées exactement (`maxErr: 0`
ou <0,05px), les 3 FAQ + 7 Avis Google (GROUP) vérifiées par récupération complète
des siblings, spot-check visuel complet sur `Portes d'entrée` (page cumulant FAQ +
Avis Google, le cas le plus à risque) — pas de preuve pixel avant/après formelle
sur ces 20, même limite documentée que les molécules précédentes.
