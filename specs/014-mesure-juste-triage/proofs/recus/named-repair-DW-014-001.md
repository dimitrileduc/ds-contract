# Reçu de réparation nommée — DW-014-001 (`resolvedBy: "tinyspec select-option-emit"`)

**Date** : 2026-08-05 · **Diagnostic d'origine** : `select-exclusion.json` (014/T026, 2026-08-03) · **Réparation** : tinyspec `specs/tiny/select-option-emit.md`, T1/T3.

## Ce que le diagnostic d'origine affirmait

`select-exclusion.json` a REFUTÉ le mécanisme hérité de 004 (« un `<select>` natif ne rend pas son texte d'option en Chromium headless ») et identifié la vraie cause : `core/emit-html.ts` `renderPart()` résout `textEl = part.element ?? (parentEl === 'select' ? 'option' : 'span')` — le repli `<option>` ne couvre qu'une part ENFANT sans élément autorisé sous un parent select. La part `valeur` de `ds.select` déclare `element: "select"` (correct — elle EST la balise), donc la branche de contenu émettait le texte résolu en **enfant nu de `<select>`**, que le parseur HTML5 jette à la construction de l'arbre : capture vide, `maskCoveragePct` 0. Classé `engine`, porté au registre `deferredWork` pour qu'une spec l'ordonnance.

## Le ROUGE constaté d'abord (Claims Rule)

Fixture `evals/fixtures/emit-html-select-option-text.ts` écrite AVANT le fix — forme exacte de `ds.select` (wrapper div, part `element: "select"` + `content`), plus la branche `text` :

```
Error: content branch: <select> must contain exactly `<option>Texte de saisie</option>` — […]
Got inner content:
Texte de saisie
[…]
<select class="select-option-content__valeur" data-part="valeur">Texte de saisie</select>
```

## La réparation effective

`core/emit-html.ts`, `renderPart()` : un assistant `inOption()` enveloppe le texte dans `<option>…</option>` quand `textEl` vaut `select`, sur les DEUX branches porteuses de texte (`content` et `text`). Miroir strict de la surface React livrée (`core/emit-react.ts`, épinglée par l'eval `native-checkbox-and-select-render-correctly`) : `<option>` nue, le seul texte visible, **aucun attribut d'état** (`ds.select` : `states: []`).

## Preuve

- Fixture verte, câblée en eval permanente `emit-html-select-option-text` (C1) — sweep `npm run eval` : **184/184**.
- **Re-mesure** (`pv-select.json`, 2026-08-05) : brut **0,85 % → 0,17 %**, « Texte de saisie » peint (`out/select/select.ours.png`), diff localisé sur la même région texte ~179×20px que l'input — la signature exacte de l'input. Règle de triage re-classée `engine` → `rendering`.
- **Écart nommé, pas approximé** : le tinyspec attendait `maskCoveragePct > 0` ; observé **0,00 %**, pour la raison déjà documentée sur l'input (le widget natif peint sa valeur lui-même — pas un rect texte DOM masquable). La preuve que le texte peint est la capture elle-même et la chute du score.
- **La React livrée n'a pas bougé d'un octet** : `npm run build` → diff `src/` vide ; `evals/golden.json` re-dérivé sur les 213 hashes → diff vide (vérifié, jamais supposé). Seul re-pin réel : `figma-sync/plugin/engine.receipt.json` (le bundle `window.DSC` inclut le barrel core) ; Polaris `--check` : 76 fichiers byte-stables sans régénération.

**`resolvedBy`**: `tinyspec select-option-emit` — `specs/014-mesure-juste-triage/proofs/registre/causes.json`, entrée deferredWork DW-014-001 (le compte imprimé de `measure:gate` reflète la clôture — mécanisme measure-gate-counting-v2.md §2 étendu au roster `deferredWork`).
