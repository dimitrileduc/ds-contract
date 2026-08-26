# Interface Contract — Figma Proof Ledger

Le ledger assemble les preuves H1–H4 et rend toute claim de clôture traçable.

## Gate records

Chaque gate contient: `gateId`, `status`, `decisionMaker`, `decidedAt`,
`evidenceRefs`, `acceptedFacts`, `rejectedOptions`, `deferredTopics` et
`authorizes`.

- H1 autorise uniquement les frames de travail.
- H2 fige le design exact, sans autoriser le master.
- H3 autorise l'unique plan de mutation présenté.
- H4 accepte la source finale et le handoff.

## Capture sets

Les phases `before`, `after` et `idempotence` contiennent pour chaque surface:

- PNG;
- `structure.json`;
- `properties.json`;
- `facts.json`;
- largeur, hauteur, digest et version Figma.

Surfaces minimales: master/set, membre Wide, instance Home et contexte Home+Header.
Les frames de travail/proposition ont leurs propres captures H2.

## Responsive matrix

| Case | Expected presentation |
| --- | --- |
| 320 | Compact |
| 390 | Compact |
| 834 | Compact |
| 1200 | Desktop |
| 1440 | Wide |
| 1728 | Wide |
| short landscape | Compact selon le profil historique, sélection explicite |

Chaque cas existe pour contenu normal, titre long et CTA long. Chaque résultat
enregistre la composition effectivement sélectionnée, les bounds du root et de tous
les descendants visibles, le clipping ancêtre, l'accessibilité du contenu, la
couverture du poster et la capture fraîche.

Critères universels: `overflow=false`, `clippedBy=[]`, contenu lisible et accessible.

## Binding and typography evidence

- Tous les gaps, paddings et dimensions modifiés ont leur variable id/nom, valeur
  résolue et `boundVariables` before/after/idempotence.
- Toute typographie locale a son rôle, ses seuls champs autorisés, la décision H2 et
  `pending-responsive-text-style`.
- Wide conserve son Text Style et ses métriques exacts.

## Apply receipts

Avant le premier reçu live, le ledger référence les fixtures négatives, les ids
d'eval enregistrés, le résultat ciblé et la suite complète verte de la capacité
runner. La preuve doit couvrir topologie set+membre Wide, créations déclarées,
sélection de composition, bindings, typographie locale, refus Page/enfant et no-op.

Premier passage: opérations, créations et modifications exactement égales au dry-run;
master/key et variants inspectés; `pageWrites=[]`.

Second passage: mêmes operation ids, tous `no-op`, `createdNodeIds=[]`,
`changedNodeIds=[]`, `pageWrites=[]`.

## Closure statement

Le ledger doit terminer par:

```text
figmaStatus: accepted | blocked
nonConvergenceStatus: figma-ahead/pending-home-responsive-promotion
contractClaim: false
codeClaim: false
odooClaim: false
automaticBreakpointClaim: false
regenerationGuard: active
```

Une preuve manquante ou périmée empêche `figmaStatus=accepted`.
