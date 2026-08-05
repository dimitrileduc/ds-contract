# Reçu de réparation nommée — DW-015-001 (`resolvedBy: "tinyspec select-option-emit"`)

**Date** : 2026-08-05 · **Diagnostic d'origine** : `dw-015-001-emit-html-multiroot-box-sizing.json` (015, revue de Phase 7, 2026-08-05) · **Réparation** : tinyspec `specs/tiny/select-option-emit.md`, T2/T4.

## Ce que le diagnostic d'origine affirmait

`core/emit-html.ts` accrochait sa règle border-box au préfixe BEM partagé (`.<name>, .<name> *, …`) — qu'aucun élément ne porte sur un composite MULTI-ROOT, où chaque racine de premier niveau compile vers sa propre classe frère `.<name>__<root>`, descendante de rien. La surface html ne déclarait donc border-box pour **zéro nœud** sur un contrat multi-root. LATENT : 0 des 34 contrats Piqueray n'est multi-root — aucune surface livrée ne rendait de boîte fausse. `core/emit-react.ts` n'avait pas le défaut (T013 émet une règle PAR racine via `topRoots`).

## Le ROUGE constaté d'abord (Claims Rule)

`evals/fixtures/react-box-model-border-box.ts` durcie AVANT le fix — la limite nommée en sortie devient assertion (property 1, jambe html/multi-root ; property 3, comptes html 1/2) :

```
Error: html/fixture.box-model-multi: the border-box rule is missing the selector `.box-model-multi__root *` — […]
.box-model-multi, .box-model-multi *, .box-model-multi *::before, .box-model-multi *::after {
  box-sizing: border-box;
}
```

(La règle émise vise `.box-model-multi`, une classe qu'aucun nœud ne porte — l'asymétrie exacte que le premier passage de cette fixture avait trouvée.)

## La réparation effective

`core/emit-html.ts`, `componentCss()` : en `isMultiRoot`, la règle border-box est émise **par racine** via `topRoots(contract)` (`.<name>__<root>, … *, … *::before, … *::after`) — la boucle exacte d'emit-react. Le chemin single-root est inchangé **byte-identique** (même séquence de lignes émises).

## Preuve

- Fixture verte : property 1 exige les 4 sélecteurs par racine sur les DEUX surfaces et les DEUX formes ; property 3 exige 1 règle single-root / 2 règles two-root sur react ET html. Sweep `npm run eval` : **184/184**.
- Le verdict du reçu d'origine est re-testé par la fixture qui l'avait trouvé — `dw-015-001-emit-html-multiroot-box-sizing.json` mis à jour (champ `retest`, post-fix, `resolvedBy`).
- Single-root intact, prouvé : `npm run build` → diff `src/`/`figma-sync/`/`catalog/` vide ; golden 213 hashes re-dérivés → diff vide ; Polaris `--check` byte-stable. Seul re-pin réel : `figma-sync/plugin/engine.receipt.json`.

## Ce qui est explicitement écarté

Aucun contrat multi-root n'est créé pour « exercer » le fix en vrai : la fixture synthétique two-root est la preuve permanente, et le premier contrat Piqueray multi-root héritera de la règle sans travail supplémentaire. Rien n'est deviné pour un besoin non observé.

**`resolvedBy`**: `tinyspec select-option-emit` — `specs/014-mesure-juste-triage/proofs/registre/causes.json`, entrée deferredWork DW-015-001.
