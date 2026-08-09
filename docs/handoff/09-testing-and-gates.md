---
title: "Testing and gates — how everything is verified"
doc_id: 09-testing-and-gates
audience: "Another AI platform with ZERO prior knowledge of this project"
status: authoritative
last_updated: 2026-08-09
reading_order: 9
prerequisites: [05-architecture, 07-status-what-works]
related: [08-status-what-doesnt-work, 12-reference]
---

# Testing and gates

## Portes Odoo 019

Le quickstart exécutable est `specs/019-odoo-production-foundation/quickstart.md`. Les portes spécifiques sont `odoo:inputs:check`, `odoo:authoring:check`, `odoo:assets -- --check`, `odoo:module:check`, `odoo:derivation:check`, les scénarios QA Docker et `odoo:qualification -- --require-qualified`. Le sweep final du 2026-08-09 a produit 199/199 evals; le nombre imprimé par le prochain run reste l'autorité.

## The philosophy

**No claim without an executable check.** Every capability in `07` maps to a
gate. The eval suite is the spine; additional standing gates guard determinism,
byte-stability, and the plugin engine.

## The eval suite — `npm run eval` (`evals/run.ts`)

**This count moved (2026-07-22/23, the Piqueray reconversion's "hybrid rule"):**
demo-Button-wired cases were re-pointed onto the real Piqueray Button; cases
with no Button equivalent (Card slots, Table multi-slot, native-control
components, brand/dark-theme cases…) were removed, each named by id in the
commit body; content-agnostic engine cases (schema refusals, token validation,
extraction) were left intact. 49 cases are quarantined, not deleted — restored
when Piqueray grows the features they exercise (slots, composites, dark theme,
a second brand). See `evals/REMOVED-CASES.md`. **Always trust the live
`npm run eval` output over any number quoted in prose** — it prints `N/N` and
this doc can lag it.

Each eval declares a `claim`. Live counts by `claim:` (computed from
`evals/results.json`, 2026-07-24):

| Claim | Count | Meaning |
|-------|-------|---------|
| `C1-determinism` | 17 | byte-reproducibility, golden, determinism, plugin engine |
| `C2-refusal` | 11 | invalid inputs refuse *by name* |
| `C3-detection` | 28 | drift detection (code/design ahead/behind/mismatch, tokens) |
| `C4-convergence` | 1 | iterative fix / convergence |
| `C5-extraction` | 38 | code→contract and figma→contract extraction |
| `C6-theming` | 0 | brand/token theming — quarantined (Piqueray has one brand, one theme) |
| `C7-cli` | 3 | CLI smoke + emitter-plugin-loads + wc round-trip |
| `C8-journey` | 4 | end-to-end journey pins (re-pointed onto the Piqueray Button) |

The runner copies a scratch workspace, regenerates outputs, and byte-compares
against the golden manifest. It writes `evals/results.json`. Exit 0 = all pass
— the 3 that were intentional failures went green once spec 002 pushed the master update to Figma.

**Note for a fresh AI:** the eval runner symlinks the checkout's own
`node_modules` into its scratch dir. Feature specs run in git worktrees: run
`npm install` (+ `npx playwright install chromium`) INSIDE the worktree first,
and the full suite runs there (constitution: Worktree Gates, F1).

## The standing gates you must keep green

| Gate | Command | Guards |
|------|---------|--------|
| eval suite | `npm run eval` | everything above (prints the live `N/N`) |
| golden byte-hash | inside eval (`golden-generated-output`) | `src/` + `figma-sync/` are byte-stable; `npm run golden:update` on reviewed changes only |
| plugin engine | `npm run plugin:check` | `window.DSC` builds correct anatomy from a bundle; specHash mirror; drift refusal |
| determinism | `npx tsx scripts/deterministic-roundtrip.mjs` | contract→canvas byte-identical across two runs; loop closes (needs tsx — imports core/*.ts via .js specifiers) |
| census | `extract:figma:gauntlet` | 1,618 sets propose with zero skips |
| browser purity | `node scripts/core-browser-check.mjs` | core barrel bundles for browser; 4 emitters run in a no-node VM |
| emitters | `npm run emitters:check` | registry invariants |
| typecheck | `npx tsc --noEmit` + `npx tsc -p tsconfig.build.json` | types |
| plugin drift | `node scripts/build-plugin-zip.mjs` | engine bundle matches `engine.receipt.json` (refuses stale by name) |

## Key gates by name (for continuation)

- `deterministic-roundtrip` — the determinism proof (C1).
- `plugin-engine-bundle`, `plugin-update-report`, `plugin-propose-dry-run` — run
  `plugin-engine-check.mjs`, which internally covers `composite-plugin-path`
  (contract→canvas) and `composite-reverse-journey` (canvas→contract).
- `depth-composite-child-collection` — the composite emits on all 4 surfaces +
  anatomy parity (runs `examples/depth-composite/emit-composite-receipt.ts`).
- `single-root-golden-invariant` — multi-root generalization is additive; single-
  root output unchanged.
- `emitter-multi-root-modal` — the captured Modal emits on all surfaces.

## How a brand-new AI verifies the project from a clean clone

```bash
git clone github.com/southleft/ds-contracts-poc && cd ds-contracts-poc
npm install
npm run eval            # expect: all evals passed — the printed N/N is the count
npm run plugin:check    # expect: plugin-engine-check: all flows green
npx tsx scripts/deterministic-roundtrip.mjs   # expect: THE FULL LOOP RAN WITH ZERO AI
npx tsc --noEmit        # expect: clean
```

If all pass, the deterministic pipeline is intact. Then read `08` — the passing
gates do **not** cover the composite's live rendering failures. Green here means
"the checks pass," not "everything renders."

## The mock-fidelity discipline (repeat after me)

When you find a bug that only appears on a live canvas, the fix has **two parts**:
(1) fix the emitter, (2) teach the mock to catch the class headlessly. Example
committed 2026-07-21: the SVG duplicate-`fill` bug — the mock's `createNodeFromSvg`
now validates and rejects duplicate attributes, so the class fails in Node
forever. Do this every time. It is how the gates earn trust.

Continue to `10-history.md`.
