# Incident padding — HeroVideo

## Cause

La version Figma `2386499278103642498` avait supprimé les quatre paddings du
master `HeroVideo` (`2151:5552`). Le contenu était passé de `x=169/1500` à
`x=80/1589` et du bas `48` au bas `0`.

Le contrat, les sorties React/CSS et `figma-sync/28-herovideo.js` conservaient
toujours `top/bottom=48` et `left/right=89`. La dérive provenait donc du canvas
Figma, pas du chantier Odoo ni d'une régénération du dépôt. L'API Figma attribue
la version au compte partagé `dl studio` et ne permet pas d'identifier l'agent
à l'origine de l'écriture.

## Réparation

- master, key, Container, enfants, poster IMAGE et deux gradients vérifiés
  avant écriture ;
- restauration limitée à `48 / 89 / 48 / 89` ;
- aucune création de nœud ;
- aucune écriture de Page ;
- seconde exécution strictement `no-op`.

Après réparation, les digests du master, de l'instance Page et de son contexte
sont identiques à l'état vert sauvegardé, géométrie comprise. Les captures de
la réparation et les reçus bruts sont conservés dans `run-001/`.
