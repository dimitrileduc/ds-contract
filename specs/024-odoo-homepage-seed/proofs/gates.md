# Proof — repo gates (024, T021)

**Date**: 2026-08-23 · worktree `incongruous-ski` (npm install + cached Chromium).

## FR-005 — no protected repo file modified

`git status --porcelain`, filtered for the protected areas:

```
$ git status --porcelain | grep -E ' (contracts|tokens|core|src|figma-sync|evals)/'
(no output)  →  ✓ none touched
```

Repo-code changes are exactly: `package.json` (two new script keys `odoo:save`,
`odoo:restore`) + `scripts/odoo/save-seed.sh` + `scripts/odoo/restore-seed.sh`.
Everything else added is spec artifacts (`specs/024-…/`) and the empty seed dir
(`integrations/odoo/qa/seed/.gitkeep`). `.specify/feature.json` was already modified
before this session (spec-kit metadata, not repo code).

## Gate sweep — all green

| Gate | Result |
|------|--------|
| `npm run build` | ✓ OK |
| `npx tsc --noEmit && npx tsc -p tsconfig.build.json` | ✓ OK |
| `npm run plugin:check` | ✓ OK |
| `node scripts/core-browser-check.mjs` | ✓ OK |
| `npx tsx scripts/deterministic-roundtrip.mjs` | ✓ OK |
| `npm run parity` | ✓ OK |
| `npm run eval` | ✓ **220/220 evals passed** |

The two deliverables are standalone bash scripts and two new `package.json` keys —
referenced by no TypeScript/build path — so the sweep is green exactly as before the
change, confirming the deliverables introduce no regression.
