# Interface — comptage v2 de la porte de mesure (`aggregateOf`, unité « travail à faire »)

**Fichiers touchés** : `extract/figma/measure-gate/gate.ts` (+ champs, + règle de comptage), `extract/figma/measure-gate/run.ts` (mapping `causes.json` → entrée typée), `specs/014-mesure-juste-triage/proofs/registre/causes.json` (registre VIVANT de la porte — la donnée, pas le code), fixture `evals/fixtures/measure-gate-policy-check.ts` (étendue EN PREMIER — Claims Rule). Le doc d'interface de 014 (`specs/014-…/contracts/measure-gate.interface.md`) reste daté et n'est pas réécrit ; la sémantique v2 vit ici.

## 1. Ce qui ne change pas

Les quatre conditions C1–C4, le vocabulaire fermé des six causes, les codes de refus, `blocked` (exit 2) côté CLI, le dédoublonnage `dedupeKey` (§4 bis : le FAIT s'efface quand sa LIGNE partenaire compte — 1:1), la séparation `entries` (registre 013 re-classé) / `deferredWork` (découvertes 014, jamais dans `byCause`).

## 2. Ce qui s'ajoute (additif — aucun champ réinterprété)

```ts
interface MeasuredLine {
  aggregateOf?: string[];       // dwIds. La ligne est la CONSÉQUENCE de N faits du registre :
                                // elle contribue 0 à byCause ; ses N faits comptent chacun 1.
}
interface ReclassifiedDwEntry {
  resolvedBy?: string | null;   // déjà présent dans causes.json, désormais LU :
                                // non nul ⇒ plus un travail à faire ⇒ hors byCause.
}                               // L'entrée reste au registre et sous C4 (reçu re-testé exigé).
```

Mapping run.ts : `organismLines[].aggregateOf` → `MeasuredLine.aggregateOf` ; `entries[].resolvedBy` → `ReclassifiedDwEntry.resolvedBy`.

## 3. La règle de comptage v2 (FR-006 — l'unité publiée est le travail à faire)

```
byCause[c] =   | lignes divergentes de cause c dont aggregateOf est absent/vide |
             + | entrées DW de cause c, resolvedBy nul, non dédupliquées par dedupeKey |
```

- **1:N** (`aggregateOf`) : la ligne footer, conséquence de DW-001 + DW-004 + DW-005, compte pour CES 3 travaux — jamais 4 (1 ligne + 3 faits = 3 travaux, la décision de clarification).
- **1:1** (`dedupeKey`, inchangé) : un fait dont la ligne partenaire compte s'efface.
- Les deux directions ne s'appliquent jamais à la même paire (une ligne avec `aggregateOf` ne peut pas être en même temps le `dedupeKey` d'un de ses propres faits — refus de cohérence dans gate.ts si le cas se présente).
- **Cohérence C1 conservée** : une ligne avec `aggregateOf` reste divergente et doit toujours porter cause + reçu (C1/C4 la voient) ; seul le COMPTAGE la délègue à ses faits.

## 4. Donnée : `causes.json` (édition 015 du registre vivant)

- Ouverture : `organismLines["footer/footer-master-defaults"].aggregateOf = ["DW-001", "DW-004", "DW-005"]`.
- Clôture : `entries[DW-001].resolvedBy = "015"`, idem DW-004, DW-005 (chacun avec son reçu de réparation re-testé).
- DW-014-001 (§ `deferredWork`) : `destination` mise à jour vers la tinyspec nommée `select-option-emit` (ordonnancée immédiatement après la clôture de 015, avant ou en parallèle de 016) — plus jamais « sans spec assignée ».

## 5. Relevés (jamais recopiés)

- **Ouverture re-lue après modélisation** : `npm run measure:gate` — attendu `contract-geometry: 6` (3 faits footer + texte-seo + coordonnees + `section-header :: Avec CTA`) et `instrument: 0` (DW-006 resolvedBy 014) ; **le compte vif imprimé fait foi si l'attendu me contredit** (le 7 du relevé du 2026-08-03 était compté sous la sémantique v1).
- **Clôture** (SC-005, FR-013) : `contract-geometry: 0`, verdict `pass`, exit 0 — relu en direct dans la sweep de clôture, cité nulle part en dur.

## 6. Ordre Claims Rule

1. `measure-gate-policy-check.ts` : cas `aggregateOf` (1 ligne + 3 faits → 3), cas `resolvedBy` (entrée résolue → 0), cas mixte dedupeKey/aggregateOf, cas de refus de cohérence — la fixture passe au ROUGE d'abord contre gate.ts v1.
2. gate.ts + run.ts v2 — la fixture passe au vert.
3. `causes.json` reçoit `aggregateOf` ; le relevé d'ouverture est publié dans `specs/015-…/proofs/`.
