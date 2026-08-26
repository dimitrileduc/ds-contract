# Preuve de rangement du canvas HeroVideo

Date : 2026-08-26  
Fichier : `Piqueray (Copy)` (`d9FYAUcqdcNtsuaMgLefvJ`)  
Page : `DS · Organisms` (`2052:1146`)

## Autorisation

L'owner a explicitement validé le rangement après la proposition bornée :

- retirer uniquement l'ancienne zone H2 « OPTION RETENUE · 3 ÉCRANS » ;
- réutiliser la section vide `Hero vidéo` comme wrapper de présentation ;
- ne modifier ni les variantes, ni le Header, ni les instances produit.

## Résultat live

- supprimés : section H2 `2577:5984` et frames `2577:6069`, `2577:6213`,
  `2577:6357` ;
- réutilisée : section `Hero vidéo` `2170:6360` ;
- reparenté sans déplacement absolu : `Container · HeroVideo` `2448:4731` ;
- section finale : `1808 × 2090`, retrait de présentation `40 px` ;
- Container final : bounds absolus conservés à `1728 × 2010` ;
- créations : `0` ;
- Page produit, Header, Home, Button et enfants du Component Set modifiés : `0`.

Les faits protégés avant/après sont strictement identiques. Les aperçus de
catalogue restent `Wide=1728 FIXED`, `Compact=390 FIXED` et
`Desktop=1200 FIXED` ; le Component Set reste `FILL` dans son Container.

Le second passage est réellement no-op : zéro création, suppression,
modification, Page write ou child write.

## Reçus

- `canvas-cleanup-before.bridge.json`
- `canvas-cleanup-first.bridge.json`
- `canvas-cleanup-after.bridge.json`
- `canvas-cleanup-second.bridge.json`

La zone H2 supprimée reste récupérable via l'historique de versions Figma ; ses
preuves et décisions restent conservées dans Git.
