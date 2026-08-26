# Runner responsive — gates ciblés

**Exécuté le :** 2026-08-25  
**Portée :** capacité générique du runner uniquement; aucune mutation du fichier
Figma autoritatif et aucune écriture Page/enfant.

## Red observé avant implémentation

Les quatre fixtures ont été créées et exécutées contre la baseline du runner.
Les échecs observés correspondaient aux capacités absentes attendues : faits de
topologie/créations inconnus, fonction de sélection explicite absente, contrôle
bindings/typographie absent et campagne responsive refusée avant frontière/no-op.

Commandes :

```bash
npx tsx evals/fixtures/figma-responsive-component-set-check.ts
npx tsx evals/fixtures/figma-responsive-presentation-scenarios-check.ts
npx tsx evals/fixtures/figma-responsive-bindings-and-typography-check.ts
npx tsx evals/fixtures/figma-responsive-write-boundary-idempotence-check.ts
```

## Green ciblé après implémentation

Les mêmes commandes passent sans exception. La fixture component-set exécute le
vrai script Bridge émis sur une source Figma mock jetable, puis le rejoue : le
premier passage déclare set + deux membres, le second est intégralement no-op.

| Eval ID enregistré | Résultat | Couverture principale |
| --- | --- | --- |
| `figma-responsive-component-set-declared-creates` | PASS | set additif, créations exactes, id/key historique |
| `figma-responsive-presentation-scenarios-explicit` | PASS | sélection explicite et matrice largeur×fixture |
| `figma-responsive-bindings-typography-allowlisted` | PASS | variable attachée, typographie locale bornée |
| `figma-responsive-boundary-idempotence` | PASS | Page/enfants refusés, second passage no-op |

Contrôles complémentaires exécutés :

```bash
npx tsc --noEmit
npx tsc -p tsconfig.build.json
npx tsx evals/fixtures/figma-projection-repair/live-apply-receipt-check.ts
```

Résultat : PASS. Le gate historique des reçus continue de refuser Page writes,
drift de master/variants, overflow non documenté et mutation au second passage.

## Durcissement avant H3 — mutation du host

La revue du premier dry-run a révélé que `combineAsVariants` change aussi la
liste d'enfants du Container local. Un cas négatif a d'abord reproduit le défaut :
un `changedNodeIds` étranger ou un host omis était accepté. Après correction :

- le membre historique **et** son Container doivent être explicitement présents
  dans `allowedExistingNodeIds` ;
- le Bridge reporte les deux IDs au premier passage ;
- le reçu refuse une mutation existante étrangère ou un host sous-déclaré avec
  `responsive-operation-not-allowlisted` ;
- le second passage conserve `changedNodeIds=[]`.

Les quatre fixtures, les deux typechecks et le sweep complet ont ensuite été
rejoués. Résultat responsive : PASS ; résultat global inchangé : 229/234, avec
exactement les cinq dettes préexistantes consignées dans `runner-full-gates.md`.

## Durcissement observé sur le transport Figma live

Le passage live a ajouté des régressions ciblées pour les comportements natifs
qui ne sont pas simulés par une simple structure JSON :

- le Component Set reste un catalogue libre `NONE` en `FILL` dans son Container ;
- ses membres possèdent des largeurs d'aperçu `FIXED` explicites, séparées des
  instances de scénario en `FILL` ;
- un set existant peut être corrigé sans création, avec IDs de traversée et IDs
  réellement modifiés déclarés séparément ;
- la valeur par défaut de `Presentation` est protégée et le runner refuse toute
  valeur finale différente de celle déclarée ;
- le binding de hauteur Wide est restauré après `combineAsVariants` ;
- les getters interdits sous `dynamic-page` ne sont plus utilisés ;
- la largeur réellement mesurée doit être la largeur demandée, y compris
  `844×390` ;
- le déplacement natif des définitions de propriétés vers le set, la
  régénération de suffixe et l'ajout de `Presentation=Wide` sont normalisés sans
  masquer un écrasement de valeur ;
- l'ID de rapport qualifié par phase ne produit plus un faux drift de statut.

Après ces cas, les quatre fixtures, les deux typechecks et le second passage live
passent. Le run correctif final `run-005` est `no-op` au second passage, avec zéro
création/modification et zéro delta sur 17 artefacts, 20 empreintes IMAGE et 102
liens/overrides. Les aperçus finaux sont Compact 390, Desktop 1200 et Wide 1728.
