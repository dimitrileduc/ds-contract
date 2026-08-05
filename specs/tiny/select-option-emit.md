# TinySpec: select-option-emit — les deux défauts nommés de l'émetteur html

**Branch**: tiny/select-option-emit · **Date**: 2026-08-05 · **Status**: done · **Complexity**: small (décision owner 2026-08-05 ; ROADMAP.md:31 la classe « Petit »)

## What

Clore avec preuve mesurée les deux défauts moteur du registre des travaux reportés, tous deux dans `core/emit-html.ts` — la surface que l'instrument de parité visuelle rend ; la bibliothèque React livrée est correcte et ne doit pas bouger d'un octet :

- **DW-014-001** — le texte d'une part `element: "select"` est émis en enfant nu de `<select>` ; le parseur HTML5 le jette à la construction de l'arbre → capture du select vide, `maskCoveragePct` 0 (reçu `select-exclusion`, REPORT.md:89).
- **DW-015-001** — la règle border-box est accrochée au préfixe BEM partagé `.<name>`, qu'aucun nœud ne porte en multi-root → 0 nœud border-box (latent : 0/34 contrats multi-root aujourd'hui).

## Décisions d'ouverture (les 4 questions du brief, tranchées sur pièces)

1. **Re-mesure** — le select est DÉJÀ sujet de parité depuis 014 (T025, `subjects.ts:243`) : pas de ré-inscription ; re-run + refresh baseline/REPORT. Reste le commentaire périmé `subjects.ts:215-217` (« NOT a subject » + le mécanisme réfuté) à corriger.
2. **Sémantique de l'option** — miroir strict de la surface React (`emit-react.ts:2979-2986`, épinglée par `native-checkbox-and-select-render-correctly`) : `<option>` porte le seul texte visible, aucun attribut d'état (`ds.select` : `states: []`).
3. **Clôture au roster** — `gate.ts:389` compte `deferredWork.length` sans filtre de statut ; le mécanisme (patron `resolvedBy` des `entries`, `run.ts:281-284`, vs retrait) se tranche l'outil en main avec `measure-gate-counting-v2.md`. Exigence ferme : le compte imprimé reflète la clôture, jamais une note en prose seule.
4. **Nommage** — hors numérotation : l'identité « tinyspec select-option-emit » est déjà consignée deux fois (ROADMAP.md:31, `destination` de DW-014-001).

## Context

| Fichier | Rôle |
|---|---|
| `core/emit-html.ts` | Modifié — `renderPart` : quand `textEl` vaut `select` (branches `content` :975 et `text` :981), envelopper le texte dans `<option>` ; `componentCss` :141-143 : en `isMultiRoot`, une règle border-box PAR racine via `topRoots` (déjà importé :61), chemin single-root intact. ⚠ octet NUL légitime → `grep -a` ou Python |
| `evals/fixtures/react-box-model-border-box.ts` | Durci — le « NAMED LIMIT » nommé en sortie devient assertion : html multi-root = 2 règles, sélecteurs `.box-model-multi__{root,trailer}` (self + `*` + pseudo) |
| `evals/fixtures/emit-html-select-option-text.ts` (NOUVEAU) + `evals/run.ts` | Fixture synthétique forme `ds.select` (wrapper div, part `element:'select'` + `content`) ; cas C1 câblé comme `run.ts:5247`. ⚠ fixtures hors tsconfig : tsc vert ≠ eval vert |
| `extract/figma/visual-parity/{subjects.ts,triage.ts,baseline.json,REPORT.md}` | Re-mesure — commentaire périmé :215 ; règle triage `select` (:467, classe `engine`) retirée ou re-classée selon le chiffre observé ; baseline via run complet + `--write-baseline` (le run complet garde aussi les 33 autres sujets : toute régression vs baseline ÉCHOUE) |
| `specs/014-mesure-juste-triage/proofs/registre/causes.json` | D'abord : `destination` de DW-015-001 mise à jour vers cette tinyspec (jamais d'embarquement silencieux) ; puis clôture des deux entrées selon le mécanisme tranché |
| `specs/014-mesure-juste-triage/proofs/recus/` | Reçus `named-repair-DW-014-001` / `named-repair-DW-015-001` (patron `named-repair-DW-001`) + re-test du verdict de `dw-015-001-emit-html-multiroot-box-sizing.json` — chemin figé lu par la porte |
| Re-pins ×3 | `evals/golden.json` (`update-golden.mjs` — diff attendu ≈ vide côté `src/`, à VÉRIFIER sur les 213 hashes, jamais supposé, piège T045b) · `figma-sync/plugin/engine.receipt.json` (`build-plugin-zip.mjs --update-engine-receipt` + `plugin:check`) · Polaris (`generate.ts` + `--check`) |

## Requirements

1. Une part `element: "select"` à contenu texte émet `<select …><option>texte</option></select>` sur la surface html — miroir exact de la React, texte seul, aucun attribut d'état.
2. En multi-root, la feuille html déclare border-box pour chaque racine (self + descendants + pseudo-éléments) ; la sortie single-root des 34 contrats est inchangée (gardée par le run complet vs baseline + la sweep).
3. Les deux fixtures passent au ROUGE constaté d'abord — sortie consignée dans les reçus named-repair — puis au vert ; sweep constitution complète verte (le compte vif imprimé fait foi).
4. La capture re-mesurée du select n'est plus vide : « Texte de saisie » visible, `maskCoveragePct > 0`, chiffre publié ; triage/baseline/REPORT cohérents avec le chiffre.
5. DW-014-001 et DW-015-001 clos au registre avec reçus re-testés ; `npm run measure:gate` rend PASS et son compte « deferred work » reflète la clôture.
6. Zéro changement de la React livrée : `native-checkbox-and-select-render-correctly` vert, golden `src/` inchangé ; les 3 re-pins relus en diff.

## Plan

1. ROUGE d'abord : écrire la fixture select, durcir la fixture box-model ; exécuter les deux via `npx tsx evals/fixtures/…`, coller les deux rouges dans les futurs reçus.
2. Fix 1 (DW-014-001) : `renderPart` — texte dans `<option>` quand la part EST le `<select>` (les deux branches).
3. Fix 2 (DW-015-001) : `componentCss` — boucle `topRoots` par racine en multi-root, sinon chemin actuel intact.
4. VERT : fixtures directes, câblage du cas C1 dans `run.ts`, puis la sweep complète (un seul sweep à la fois — `evals/.scratch` est unique).
5. Re-pins ×3, chaque diff relu ; golden : lire le diff réel des 213 hashes.
6. Re-mesure : `npm run extract:figma:visual -- select` (reçu + triptyque), puis run complet + `--write-baseline` relu, REPORT rafraîchi, triage `select` et `subjects.ts:215` corrigés.
7. Clôture : mécanisme du roster tranché `gate.ts` + `measure-gate-counting-v2.md` en main ; reçus named-repair ; `measure:gate` PASS ; ROADMAP.md:31 et entrée datée MILESTONES.md.

## Tasks

- [x] T1 — Fixture `emit-html-select-option-text.ts` écrite, ROUGE constaté et consigné
- [x] T2 — `react-box-model-border-box.ts` durcie (assertion html multi-root), ROUGE constaté et consigné
- [x] T3 — Fix `renderPart` : `<option>` miroir React, branches `content` et `text`
- [x] T4 — Fix `componentCss` : border-box par racine en multi-root ; single-root intact
- [x] T5 — Fixtures vertes + cas C1 câblé dans `evals/run.ts` ; sweep constitution complète verte
- [x] T6 — Re-pins golden / engine.receipt / Polaris : 3 diffs relus, aucun supposé
- [x] T7 — Re-mesure select (chiffre publié), baseline + REPORT rafraîchis, triage `select` re-tranché, commentaire `subjects.ts:215` corrigé
- [x] T8 — Registre : destination DW-015-001 d'abord, puis clôture des deux entrées (mécanisme gate en main), reçus named-repair re-testés
- [x] T9 — `measure:gate` PASS reflétant la clôture ; ROADMAP.md:31 mis à jour ; entrée datée MILESTONES.md

## Done When

- [x] Toutes les tâches cochées ; les 7 gates de la constitution verts (worktree autosuffisant d'abord si la branche vit en worktree : `npm install` + `npx playwright install chromium`)
- [x] La capture du select montre le texte ; le chiffre remplace l'assertion
- [x] Les deux entrées moteur sont closes avec reçus re-testés ; `measure:gate` PASS
- [x] La bibliothèque React livrée n'a pas changé d'un octet

## Écart constaté à la clôture (2026-08-05 — nommé, pas approximé)

L'exigence 4 attendait `maskCoveragePct > 0` ; l'observé est **0,00 %**. Le texte peint bel et bien (capture `out/select/select.ours.png`, brut 0,85 % → 0,17 %, la signature exacte de l'input) mais le widget natif peint sa valeur lui-même — le nœud texte de l'`<option>` n'a pas de client rects tant que la liste est fermée, donc pas de rect texte DOM masquable. C'est le même « text-mask miss » déjà documenté sur l'input (REPORT.md, règle de triage input). Consigné dans `pv-select.json` (`maskCoverageNote`) plutôt que forcé au vert. Le reste de l'exigence (texte visible, chiffre publié, triage/baseline/REPORT cohérents) est tenu.

Décision d'exécution (mécanisme du roster, décision d'ouverture n°3, tranchée l'outil en main) : le patron `resolvedBy` des `entries` est **étendu au roster `deferredWork`** (fixture de politique au rouge d'abord, puis `gate.ts` + `run.ts`) — jamais de retrait : l'entrée reste au registre et sous C4, seul le compte imprimé la quitte. `measure:gate` : deferred work **4 → 2**.
