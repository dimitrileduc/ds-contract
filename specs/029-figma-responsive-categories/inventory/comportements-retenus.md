# Inventaire des comportements retenus (T056)

État final du set `CategoriesPrincipales` (2115:4277) : 12 membres,
`Presentation{Wide,Desktop,Mobile} × Style{Superpose,Empile} × Colonnes{2,3}`,
défaut `Presentation=Wide, Style=Superpose, Colonnes=2` (2115:4273, identité historique).

- **Grille responsive (run-001, via runner)** : wrap sur les 4 membres historiques, retrait du minimum 744, pleine largeur ; ligne orpheline 3 colonnes à 834 : la carte orpheline garde une largeur de piste (option A, H2). Bindings : primitives existantes uniquement — `inventory/H2-bindings.json`. Typo : aucun override responsive requis — `inventory/H2-typography.json`. Cas de grille : `inventory/H2-grid-cases.md`.
- **Axe Presentation (run-002, geste manuel)** : Wide = 4 membres historiques 1728 (renommés) ; Desktop = 4 clones à 1200 re-flowés par le wrap ; Mobile = 4 membres à 390, 1 carte/ligne, dont 2 jumeaux Colonnes=3. 12/12 combinaisons `setProperties` sans erreur. Reçu : `../../component-repairs/categories-principales/run-002/manual-gesture-receipt.json`.
- **Overrides `pending-responsive-text-style`** : aucun posé par 029 (voir H2-typography.json).
- **Protégés intacts** : cartes (hors périmètre carte exclusif), Button, Pages — reçus run-001 `pageWrites=[]`, `childWrites=[]` ; 7 usages liés aux mêmes membres, dimensions identiques.
- **Différés** : césure brute du titre carte à 390 (« RÉSIDENTIEL-LES ») ; unification Compact/Mobile avec 028 ; promotion contrat de l'axe Presentation (figma-ahead, acquitté dans `parity/baseline.json`).
