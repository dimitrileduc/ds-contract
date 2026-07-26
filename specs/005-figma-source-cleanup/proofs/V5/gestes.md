# Gestes — cycle V5 (Section-header, uniformiser les 2 variants)

## Geste 1 — T071 : resize sur le variant `Avec CTA` uniquement

```js
// Disposition=Standard (2090:2385) est DEJA a 1550 — non touche.
const avecCta = await figma.getNodeByIdAsync('2090:2388');
avecCta.resize(1550, avecCta.height); // 1552 -> 1550
```

**Vérifié sur le maître immédiatement après** : `Bouton` (ancré à droite par
`SPACE_BETWEEN`) recalcule `x` 1287→1285 (−2, suit le nouveau bord droit) ; `Titre`
(ancré à gauche) reste `x=0`. Geste **asymétrique**, contrairement à Devis/Réassurances
(centrage symétrique qui s'annule).

**Résultat mesuré : 7/9 `identical`, 2/9 `diff`** (Accueil, Motorisation — les 2 pages
qui portent le variant `Avec CTA`, via l'organisme `Produits e-commerce`).
`diffBox x=94,w=1546,h=54`, `diffCount=1751` **identique sur les deux pages** (même
composant, même décalage).

**Mécanisme complet (vérifié par inspection live d'une instance réelle, Accueil
`I2116:4595;2116:4467`, pas seulement déduit du maître)** : la prédiction initiale ne
comptait que le décalage interne SPACE_BETWEEN. La mesure réelle révèle un **effet
composé**, la MÊME cascade de centrage que V4 (Réassurances) : le parent direct de
l'instance (`Produits e-commerce`, `counterAxisAlignItems: CENTER`, largeur 1596)
recentre l'instance Section-header — `x` **22→23** ((1596−1552)/2=22 avant,
(1596−1550)/2=23 après). Effet net absolu :
- **Titre** : +0 (interne, SPACE_BETWEEN garde le 1er élément à gauche) +1 (recentrage
  de l'instance) = **+1px**
- **Bouton** : −2 (interne, suit le nouveau bord droit) +1 (recentrage de l'instance)
  = **−1px**

Ce calcul explique exactement pourquoi le crop montre le titre ET le bouton legèrement
affectés — pas seulement le bouton comme une lecture superficielle du seul maître
l'aurait suggéré. Crops vérifiés à l'œil (`crops/Accueil.png`, `crops/Motorisation.png`) :
texte et bouton identiques au contenu près, décalage d'1px cohérent, aucune perte.

**Portée générale** : 3 des 5 cycles géométriques de la Phase 6 (Devis, Réassurances,
partiellement Section-header) ont révélé la MÊME cause structurelle — une hiérarchie à
centrage en cascade qui absorbe ou atténue un rétrécissement symétrique de 2px. Les
corrections de source restent toutes correctes et nécessaires ; leur empreinte pixel
réelle est simplement plus petite (voire nulle) que l'hypothèse initiale du plan, qui
raisonnait par analogie avec Header nav (ancrage asymétrique, non centré).
