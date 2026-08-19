# T033 — Sweep complet dans le worktree

**Date** : 2026-08-19 · **Worktree** :
`.superset/worktrees/a768cf04-…/2-others` (autonome, F1 : `npm install` +
`npx playwright install chromium`).

## Portes Odoo de la vague

| Porte | Verdict |
|---|---|
| `odoo:inputs:check` | ✅ 18 contrats, digest `8b31b022…` |
| `odoo:authoring:check` | ✅ 2 configs couvrent leur graphe |
| `odoo:assets -- --check` | ✅ 8 sorties clean, ×2 identiques |
| `odoo:derivation:check` | ✅ 57 blocs |
| `odoo:module:check` | ✅ **18/18** (10 racines) |
| `odoo:typecheck` | ✅ |
| `odoo:visual:selftest --strict --subjects {coordonnees,reassurances}.mts` | ✅ 9/9 chacun |

## Sweep constitution du dépôt

| Gate | Verdict |
|---|---|
| `npm run build` | ✅ |
| `npm run parity` | ✅ exit 0 (findings pré-existants informatifs) |
| `npm run eval` | ✅ **219/219** — N/N réel (`evals/results.json`), jamais codé en dur |
| `npm run plugin:check` | ✅ (3 flows composites SKIPPED, nommés, pré-existants) |
| `npx tsx scripts/deterministic-roundtrip.mjs` | ✅ byte-identique ×2 |
| `node scripts/core-browser-check.mjs` | ✅ |
| `npx tsc --noEmit` | ✅ |
| `npx tsc -p tsconfig.build.json` | ✅ |

## eval — le seul changement causé par 022

Une seule ligne de l'eval a bougé du fait de 022 : la fixture
`evals/fixtures/odoo-production/version-drift/cases.json`, re-pinée au nouveau digest
`8b31b022…` + version module `19.0.1.5.0` (le repin faisait classer le bloc « current »
en structure-stale). Commit `fd984314`. Les 218 autres cas sont inchangés — 022 ne
touche NI contrats, NI tokens, NI `core/`, NI `src/` (re-pin surface amont = **zéro**,
vérifié `git diff main..HEAD`).

## Écarts nommés (exit ≠ 0, pré-existants, hors 022)

- `odoo:qualification` : incohérence de reçu 019 pré-existante (voir
  `qualification-report.md` §5.1).
- `editability-boundary` : 43/44, sonde de champ stale depuis `cc6cd0d4` (§5.2).

Tout le reste est vert.
