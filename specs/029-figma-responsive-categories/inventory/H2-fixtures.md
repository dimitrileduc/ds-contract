# H2 — Matrice de fixtures responsive

## Résultat

Les 24 couples largeur × réglage de colonnes × contenu sont présents et uniques. Les 90 lignes de cartes sont égalisées à partir de la hauteur réelle du contenu et de l'Auto Layout existant, sans dimension responsive codée en dur.

| Largeur | Colonnes desktop | Fixture | Présentation | Cartes par ligne effectives | Contrôle | Node ID |
| ---: | ---: | --- | --- | --- | --- | --- |
| 320 | 2 | normal | Mobile | 1 | PASS | `2584:8639` |
| 320 | 2 | long | Mobile | 1 | PASS | `2584:8741` |
| 320 | 3 | normal | Mobile | 1 | PASS | `2584:8843` |
| 320 | 3 | long | Mobile | 1 | PASS | `2584:8993` |
| 390 | 2 | normal | Mobile | 1 | PASS | `2584:9143` |
| 390 | 2 | long | Mobile | 1 | PASS | `2584:9245` |
| 390 | 3 | normal | Mobile | 1 | PASS | `2584:9347` |
| 390 | 3 | long | Mobile | 1 | PASS | `2584:9497` |
| 834 | 2 | normal | Desktop | 2 | PASS | `2584:9647` |
| 834 | 2 | long | Desktop | 2 | PASS | `2584:9747` |
| 834 | 3 | normal | Desktop | 2+1 | PASS | `2584:9847` |
| 834 | 3 | long | Desktop | 2+1 | PASS | `2584:9995` |
| 1200 | 2 | normal | Desktop | 2 | PASS | `2584:10143` |
| 1200 | 2 | long | Desktop | 2 | PASS | `2584:10243` |
| 1200 | 3 | normal | Desktop | 3 | PASS | `2584:10343` |
| 1200 | 3 | long | Desktop | 3 | PASS | `2584:10489` |
| 1440 | 2 | normal | Wide | 2 | PASS | `2584:10635` |
| 1440 | 2 | long | Wide | 2 | PASS | `2584:10735` |
| 1440 | 3 | normal | Wide | 3 | PASS | `2584:10835` |
| 1440 | 3 | long | Wide | 3 | PASS | `2584:10981` |
| 1728 | 2 | normal | Wide | 2 | PASS | `2584:11127` |
| 1728 | 2 | long | Wide | 2 | PASS | `2584:11227` |
| 1728 | 3 | normal | Wide | 3 | PASS | `2584:11327` |
| 1728 | 3 | long | Wide | 3 | PASS | `2584:11473` |

## Démonstration « adaptation interne d'abord »

- La carte utilise Fill/Hug, wrap texte et croissance verticale interne; aucun nouvel axe ni variant responsive n'est nécessaire dans les témoins.
- 90 lignes normalisées : `allEqualHeight=true`, `allTextInsideCards=true`.
- Vérification finale : toutes les cartes restent dans leur ligne; tous les textes restent dans leur frame et leur carte; aucun ancêtre de clipping ne coupe le texte; les rôles métier obligatoires sont présents.
- Conclusion candidate H2 : `cardExtentDecision=internal-adaptation-only`; zéro état de carte ajouté.

Preuves : `proofs/H2-normalize-content-rows.bridge.json`, `proofs/H2-read-only-verify.bridge.json`.
