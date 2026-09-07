# CategoriesPrincipales, style Empilé — proposition v2 (2026-09-07)

Suite de `carte-categorie-empile.md` (la carte est faite, option A, rangée dans le set 2692:19667).
La section, elle, a **perdu son canal `style`** en 2.0.0 : elle ne sait plus dire à ses cartes d'être empilées.

## Proposition sur le canevas

Version nommée avant : « 031 — avant proposition CategoriesPrincipales style Empilé (2026-09-07) ».
Section **2772:24903**, page 031. **Le set `CategoriesPrincipales` 2693:20242 n'est PAS modifié** : les 4 vues
sont des cadres détachés, clonés des variantes superposées, cartes remplacées par des instances empilées.

Contenu : celui de la page « Portes de garage résidentielles » (Porte sectionnelle / Porte basculante, avec la
première phrase en gras et les deux photos de la page).

### Ce que la proposition garde du style superposé (rien d'inventé)
Une colonne sous 992, deux au-dessus. Gouttières `space.24 / 48 / 56 / 89`. Écarts `space.16` en mobile,
`space.64` ailleurs. Seules les cartes changent, et la hauteur de la section suit le contenu au lieu d'être figée.

| | Mobile 390 | Tablette 834 | Desktop 1200 | Wide 1728 |
|---|---|---|---|---|
| colonnes | 1 | 1 | 2 | 2 |
| carte | 342×399 | 738×609 | 512×509 | 743×622 |
| section | **815** | **1282** | **509** | **622** |

**Wide 622 = la page d'aujourd'hui, au pixel.**

### La seule question de mise en page ouverte
En **tablette**, deux cartes empilées font **1282 px** de haut, contre 640 en superposé. Faut-il passer la
tablette à deux colonnes pour ce style, ou garder une colonne comme le superposé ? Décision owner.

### Conséquence sur le sélecteur
La section passerait de `Presentation` seule à **`Presentation × Style = Superposé | Empilé`**, soit 8 membres.
**Pas de réglage « colonnes »** : le colonnage reste décidé par l'écran (règle owner du 2026-09-07 : le colonnage
appartient à la section, et deux colonnes suffisent tant qu'aucun autre cas n'est vu).

## Reste à faire après la décision
1. Poser l'axe `Style` sur le set 2693:20242 (les 4 variantes existantes deviennent `Style=Superpose`, 4 nouvelles
   `Style=Empile`), instances comptées avant et après.
2. Contrat `ds.categories-principales` : la prop `style` revient (additif → MINEUR), `cartes[].texte` suit le
   passage en texte riche de la carte (→ MAJEUR si la carte passe en 3.0.0).
3. Odoo : la boucle du bloc choisit le gabarit selon le style (les DEUX gabarits existent déjà), `data-pqr-style`
   vient de la composition, et le sélecteur « Type de carte » du panneau est aligné sur le verdict
   (`fixed-by-composition`) — incohérence relevée en fin de vague 031 et jamais corrigée.
