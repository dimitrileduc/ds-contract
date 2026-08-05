# Reçu — reclassement `coordonnees/coordonnees-master-defaults` : `contract-geometry` → `instrument`

**Date** : 2026-08-04 · **Diagnostic d'origine** : `org-coordonnees-geometry.json` (014, 2026-08-03) · **Investigation** : T060 (Phase 6, 015).

## Ce que le diagnostic d'origine affirmait

`org-coordonnees-geometry.json` : « coordonnees diverges by contract-geometry — the two-column layout's visual order is reversed between contract ('row') and Figma ('row-reverse') ; a concrete, specific layout-direction mismatch, not cross-renderer noise. » Seul fait divergent cité : `coordonnees.structure.colonnes-ordre`, raison `contract-value-differs:root.visualColumnOrder:"row"!="row-reverse"`.

## Ce que le contrat dit déjà de lui-même

`contracts/coordonnees.contract.json`, description de la part `googleMap` (jamais modifiée par 015) : « **PREMIÈRE part du root : l'ordre du DOM est ici l'ordre VISUEL de Figma** (plan à GAUCHE en x=40, wrapper à DROITE en x=1192). Le root Figma est un GRID 3 colonnes à gouttière 0 dont les enfants sont positionnés MANUAL et rangés plan-puis-wrapper dans l'ordre visuel ; **l'ordre d'auteur du calque est un artefact sans portée, le contrat décrit le résultat**. »

C'est exactement le même choix, documenté dans les mêmes termes, que celui déjà acquitté sur `ds.footer` : « L'ordre visuel du master est l'INVERSE de son ordre document... il est porté ici par l'ordre des parts et non par `flex-direction: row-reverse`... **LIMITE NOMMÉE** : reconstruction flexbox d'une frame sans auto-layout. »

## Le fait

Le vérificateur de faits d'organism-audit (`extract/figma/organism-audit/facts.ts`) compare une CHAÎNE CSS littérale (`root.visualColumnOrder`, dérivée de `flex-direction`) à l'attente Figma (`row-reverse`, lue depuis le GRID sans auto-layout) — il ne peut PAS reconnaître qu'un ORDRE DE PARTS différent produit le MÊME résultat visuel. Ce n'est pas un défaut du CONTRAT (dont la description justifie déjà le choix, sans ambiguïté, depuis avant 015) : c'est une limite du VÉRIFICATEUR à reconnaître deux mécanismes CSS équivalents. Vocabulaire à 6 valeurs (`contracts/cause-vocabulary.md`) : `instrument` — une limite de l'outil de mesure, pas une géométrie fausse ou absente du contrat.

## Ce qui change

`specs/014-mesure-juste-triage/proofs/registre/causes.json`, `organismLines[]`, entrée `coordonnees/coordonnees-master-defaults` : `cause` reclassée `contract-geometry` → `instrument`, `receiptId` → `org-coordonnees-geometry-reclasse`. L'attribution correspondante dans `specs/015-geometrie-gouvernee/proofs/registre/attributions.json` corrige aussi une erreur antérieure (elle citait par erreur `box-model-unification.md` §3, qui explique un fait DIFFÉRENT — pourquoi le fix width/padding de `wrapper` est invisible à cet instrument — pas le fait qui pilote réellement ce `rawPct`).

## Ce qui N'est PAS fait

Aucun code, aucun contrat n'est modifié — `ds.coordonnees` gardait déjà, avant ce reçu, le bon comportement visuel. Seule la CLASSIFICATION de la ligne de mesure change, pour refléter honnêtement où vit la limite (l'instrument, pas le contrat).
