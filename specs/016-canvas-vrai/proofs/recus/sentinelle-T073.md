# Reçu — Test de sentinelle rejoué sur l'état FINAL (T073)

**Date** : 2026-08-06 · **État** : HEAD `08f7d22` (après la passe photos, la règle
CSS text-flow et le branchement des 9 fixtures) · **Fichier** : `d9FYAUcqdcNtsuaMgLefvJ`

## Méthode

La sentinelle prouve que l'axe `canvas variables ⟷ tokens/` DÉTECTE une dérive
introduite côté maquette — pas qu'il est vert. Trois phases, chacune relevée au vif :

1. **Dérèglement** : `size/carte/root` passée de **363,5 → 999** par
   `variable.setValueForMode`, relecture immédiate confirmant `999`.
2. **Détection** : cliché de l'axe tokens ré-extrait par `parity/extract-figma.plugin.js`
   (la valeur vive relevée est bien 999 ; seule cette variable diffère du cliché
   commité — les 139 autres feuilles sont inchangées, méthode consignée ici).
   `npm run parity` sort en **exit 1** avec le finding EXACT :

   ```
   [figma-tokens MISMATCH] Primitives/size/carte/root [Value]
     tokens/ says 363.5, Figma says 999
     proposed patch: {"tokenPath":"size.carte.root","mode":"Value","adoptFigmaValue":999}
     → Adopt into tokens/ (promotion) then npm run tokens
       — or push tokens/ to Figma via figma_import_tokens
   ```

   Le finding est **classé** (`figma-tokens MISMATCH`), **localisé** (chemin de token +
   mode) et porte **les deux remèdes** (adopter la valeur canvas ou pousser le token) :
   c'est exactement ce que FR-002/SC-002 exigent.
3. **Annulation exacte** : `999 → 363,5`, relecture `363.5` (`exact: true`), cliché
   restauré, `npm run parity` **exit 0** — 3 acquittements nommés, aucun résidu.

## Verdict

**La surveillance fonctionne sur l'état final.** Une valeur modifiée à la main dans la
maquette est vue, nommée et chiffrée par la porte ; son annulation ramène l'axe au vert
sans trace. C'est la deuxième exécution de ce test (la première, lot `U1a-sentinelle`
du 2026-08-05, portait sur l'état d'ouverture) : la capacité survit aux 7 commits,
aux 11 masters régénérés et aux 83 variables créées entre-temps.

## Re-vérification

```bash
# 1. dérégler (pont figma-console) : variable size/carte/root → 999
# 2. ré-extraire le cliché tokens, puis :
npm run parity            # attendu : exit 1 + le finding ci-dessus
# 3. restaurer 363,5, ré-extraire, puis :
npm run parity            # attendu : exit 0
```
