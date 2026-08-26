# Frames de travail H2 — HeroVideo responsive

**État historique : proposition validée par l'owner, puis retirée du canvas après installation et vérification du Component Set final.**

## État actuel du canvas

- La zone H2 `2577:5984` et ses trois copies de présentation ont été retirées du
  canvas le 2026-08-26 après GO explicite de l'owner.
- La section existante `Hero vidéo` (`2170:6360`) contient désormais le
  `Container · HeroVideo` gouverné (`2448:4731`) avec un retrait de présentation
  de 40 px.
- Le Component Set, ses trois membres, le Header, Home et Button sont inchangés.
- Les décisions et preuves historiques H2 restent conservées dans ce dossier.

## Écrans Figma retenus

La zone Figma contient exactement trois écrans de la proposition acceptée :

| Écran | Présentation | Node ID | État |
| --- | --- | --- | --- |
| Mobile 390 | Compact | `2577:6069` | retained-accepted |
| Desktop 1200 | Desktop | `2577:6213` | retained-accepted |
| Large 1728 | Wide historique | `2577:6357` | retained-accepted |

Il n'y a plus d'option B ni de matrice de tests visible dans la zone de décision.

## Zone Figma historique

- Section : `VALIDÉ · HeroVideo · OPTION RETENUE · 3 ÉCRANS`
- Node ID : `2577:5984`
- Page : `DS · Organisms` (`2052:1146`)
- Mode : `approved-option-three-screens`
- Hors du Container gouverné : oui
- Hors des Pages produit : oui
- État final H2 avant installation : `retained-accepted`
- État live après installation : `retired`

## Nettoyage final H2

- Frames initiales : 23
- Frames acceptées conservées : 3
- Frames de test ou alternatives retirées du canvas : 20
- Preuves techniques historiques conservées dans le dossier 028 : oui
- Option B : rejetée et retirée du canvas

## Frontière d'écriture constatée

- Nœuds existants modifiés : 0
- Master HeroVideo modifié : non
- Container modifié : non
- Home, Header ou Button modifiés : non
- Page produit modifiée : non

Preuves :

- `specs/028-figma-responsive-hero-video/proofs/H2-work-frames.bridge.json`
- `specs/028-figma-responsive-hero-video/proofs/H2-simplify-owner-review.bridge.json`
- `specs/028-figma-responsive-hero-video/proofs/H2-finalize-approved-review.bridge.json`
- `specs/028-figma-responsive-hero-video/proofs/canvas-cleanup-before.bridge.json`
- `specs/028-figma-responsive-hero-video/proofs/canvas-cleanup-first.bridge.json`
- `specs/028-figma-responsive-hero-video/proofs/canvas-cleanup-after.bridge.json`
- `specs/028-figma-responsive-hero-video/proofs/canvas-cleanup-second.bridge.json`
