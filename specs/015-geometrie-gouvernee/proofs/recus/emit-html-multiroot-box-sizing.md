# Reçu — défaut latent trouvé par une fixture : `emit-html` ne déclare border-box pour rien en multi-root

**Date** : 2026-08-05 · **Découvert pendant** : revue de la Phase 7, à la première exécution de la fixture `react-box-model-border-box.ts` (écrite pour combler l'absence de fixture derrière T013) · **Registre** : `DW-015-001` · **Statut** : **nommé, non réparé** (latent — aucun contrat vivant n'est concerné).

## Le fait

`core/emit-html.ts` (l.131-143) accroche sa règle de modèle de boîte au préfixe BEM partagé du composant :

```css
.<name>, .<name> *, .<name> *::before, .<name> *::after { box-sizing: border-box }
```

Ce sélecteur suppose qu'un élément porte la classe `.<name>` et que tout le reste en descend. C'est vrai en **single-root**. Ce ne l'est pas en **multi-root** : le commentaire du fichier le dit lui-même quelques lignes plus bas —

> « MULTI-ROOT composite (advanced composition): no single `.${k}` root box — each top-level root and descendant compiles to its OWN BEM part class (`.${k}__dialog`, `.${k}__backdrop` …), rendered as siblings. »

Aucun élément ne porte `.<name>`, et `.<name>__dialog` n'est le descendant de rien : **la règle ne s'applique à aucun nœud**. La feuille HTML d'un composite multi-root ne déclare donc le modèle de boîte pour rien.

`core/emit-react.ts` n'a pas ce défaut : T013 (015, Phase 3) émet une règle **par racine de premier niveau** (`for (const [name] of topRoots(contract))`), précisément parce que les CSS Modules n'offrent aucun préfixe partagé sur lequel accrocher une règle unique. L'émetteur corrigé en dernier est celui qui a la bonne forme.

## Pourquoi c'est latent et non vivant

**Zéro des 34 contrats Piqueray n'est multi-root** (relevé du 2026-08-05 : `len(anatomy) > 1` sur les 34 fichiers → 0). Les composites multi-root de l'ère demo-51 (dialog + backdrop) sont archivés, et les cas d'eval correspondants sont en quarantaine (`evals/REMOVED-CASES.md` : « Piqueray ships a flat Button »). Aucune surface livrée aujourd'hui ne rend une boîte fausse à cause de ce défaut.

## Pourquoi ce n'est pas réparé ici

1. **Hors périmètre de 015.** US2/FR-004 vise la surface **livrée** (React), nommément : « la bibliothèque livrée mesure les mêmes boîtes que la maquette et les trois autres surfaces ». `emit-html` était déjà du bon côté pour tous les contrats existants.
2. **Une édition d'émetteur en clôture coûte trois re-pins** (golden, reçu du moteur du plugin, vitrine Polaris) pour corriger un défaut qui n'affecte aucun contrat — le rapport risque/valeur est mauvais en fin de spec.
3. **La correction est connue et tient en deux lignes** : la même boucle `topRoots(contract)` que `emit-react.ts` utilise déjà, émettant une règle par classe de racine. Elle appartient à la spec qui rendra Piqueray multi-root, ou à une passe moteur dédiée.

## Ce que la découverte prouve au passage

La fixture a été écrite pour donner un eval à une capacité livrée sans (T013). Sa **première exécution a échoué** — non pas sur la propriété visée, mais sur une différence réelle entre les deux émetteurs (html 1 déclaration, react 2 sur un contrat à deux racines). C'est le rendement ordinaire de la Claims Rule : une capacité sans fixture cache autre chose que son propre risque. La fixture retenue teste la propriété vraie (les deux surfaces s'accordent sur la forme single-root que Piqueray livre) et **nomme** l'écart multi-root au lieu de l'effacer par une assertion complaisante.
