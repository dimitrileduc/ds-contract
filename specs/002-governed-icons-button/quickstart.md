# Quickstart — Governed Icons + Button v1.3 + the Single Master Update

**Feature**: `002-governed-icons-button` | **Date**: 2026-07-23

Five human-approved steps, each ending in **one git commit** (the step named in the message)
— the git log is the auditable approval trail (001 precedent). Order is dictated by the
spec's own sequence rule: **Step 0 first and blocking** (never contract a dirty source),
then registry, then Button v1.3, then the one master update, then closure. Do not start
step N+1 until step N is committed and approved.

> Prereqs: Node ≥ 20, `npm install`, main checkout (evals symlink `node_modules` — no git
> worktree). Visual + photography need Chromium (`npx playwright install chromium`) and
> `FIGMA_TOKEN` (`.env.local`). Figma-side gestures need the figma-console MCP connected to
> the open « Piqueray (Copy) » file (`d9FYAUcqdcNtsuaMgLefvJ`). The 3 intentionally-red
> evals stay red until Step 3 — expected, named in every gate sweep until then.

---

## Step 0 — Audit + clean the icon source, owner-validated (US3, P2 — sequentially FIRST)

**Do.**
1. Build the two committed runners this step needs (permanent tooling —
   `schema-additions.interface.md` §6): the **positional instance scan** and the
   **page-state photography** runner.
2. **Audit** (report = E8): `figma_lint_design` + dump of zone `6:111` for the 15 masters
   (structure, constraints, variable bindings **and types** — the nav-state lesson, sizes
   20/32 respected, descriptions); positional scan of **all** instances on **all** pages
   (re-measure: 268 instances / 22 chevron uses / 43 texts / 26 glyphs / 9 pages — the
   re-measured numbers become authoritative, docs re-synced).
3. Take the **before-photo** of the 9 pages (fresh, `--refresh`).
4. Apply the **4 decided items** in Figma (targeted figma-console edits, checkpoint each):
   (a) mail icon color → variable binding; (b) scale rules on the 4 lacking them;
   (c) descriptions on all 15 masters; (d) replace the external chevron with a **local
   master reproducing the drawing**, swap its 22 uses **by position**.
5. After-photo → chevron-swap diff **nil or explicitly owner-accepted** (SC-003 discipline).
6. Every anomaly beyond the 4 (e.g. vendor-prefix naming `cil:`/`lucide:`) → **named
   proposal**, owner arbitrates NOW (FR-003).
7. **Owner validates the cleaned source** — recorded in the report. Only then: re-dump
   (fixtures refreshed, `dumpedAt` new) + visual `--refresh`.

**Verify (Independent Test US3).** The committed report covers masters AND usage by
position; the 4 items are applied; proposals are arbitrated; **nothing was extracted before
validation** (no new contract/registry file exists yet in git).

```bash
git commit -am "step(0-source): icon source audited + cleaned (4 items), owner-validated — counts re-measured, nothing extracted before the gate"
```

---

## Step 1 — The governed registry + code-side icon set (US2 part 1, P1)

**Do.**
1. Add `IconRegistrySchema` (additive) + registry build validation; bump
   `docs/02-contract-spec.md`.
2. Acquire the 15 SVG bodies via the new REST `format=svg` export step →
   `assets/icons/<name>.svg`; **prune** demo leftovers (dir = registry, exactly).
3. Propose the registry from the cleaned dump → review the mapping (canonical name ↔
   `figma.componentName`/key ↔ asset ↔ size) → adopt `contracts/icons.registry.json` v1.0.0.
4. Implement the **parity icons axis** (registry ↔ code ↔ canvas, incl. `preferredValues`
   in the snapshot pull).
5. Evals first, claims second: registry three-way sync (C3), refusal of an out-of-registry
   icon (C2), + the **stale-attribution honesty fix** ("pending token push" → "pending the
   Button master rebuild") in run.ts banner/closing message + REMOVED-CASES.md.

**Verify (Independent Test US2, first half).**
```bash
npm run build         # registry validated; assets complete; refusals by name
npm run parity        # icons axis live: registry = code list = canvas masters (menu axis pending Step 3)
npm run eval          # new cases green; 3 reds still red (named, expected until Step 3)
```

```bash
git commit -am "step(1-registry): ds.icons v1.0.0 adopted — one governed list, code assets extracted+pruned, parity icons axis + evals prove it"
```

---

## Step 2 — Button v1.3, extracted (US2 part 2, P1)

**Do.**
1. Implement the D5 lowering in `core/propose-figma.ts` (boolDefaults → bool props;
   propRefs.visible → visibleWhen; swapPreferredValues + registry → INSTANCE_SWAP enum
   props) + its C5 eval on the committed fixture.
2. Propose v1.3 from the post-cleanup dump → review against
   `button-v1.3.interface.md` → adopt (1.3.0, minor; description's "known gap" paragraph
   replaced — the gap is closed).
3. Regenerate + re-pin: `npm run build && npm run catalog && npm run figma:plan &&
   npm run golden:update` (catalog also fixes the stale v1.1.0 shard — named housekeeping).
4. Storybook story + dashboard sample show a button with icons in **both** placements
   (FR-020); revive the re-pointable quarantined cases (D9 list) with fixtures on the
   Piqueray model.

**Verify (Independent Test US2, second half).** A mockup button is reproduced in code by
**naming its icon** — no hand-made SVG; the typed enum in `Button.tsx` = the registry list.
```bash
npm run build && npm run eval && npm run plugin:check \
  && node scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && tsc -p tsconfig.build.json
```

```bash
git commit -am "step(2-button-v1.3): icon choice extracted into ds.button@1.3.0 — lowering closes the named gap; golden re-pinned; stories+dashboard show icons"
```

---

## Step 3 — The single master update (US1, P1 — the maximal-risk step)

**Do — follow `master-update-operation.interface.md` to the letter.**
1. Pre-flight P1–P7: v1.3 green first; fresh positional before-scan + before-photo;
   **restore points** (owner's named version — verified via `figma_get_file_versions` —
   + local `.fig`); target identity + live property types re-verified.
2. The **one** figma_execute operation: « Libellé » TEXT property bound in 6/6 variants +
   icon settings (`preferredValues` = the governed menu). Nothing deleted.
3. Re-dump + `--refresh`; after-photo + after-scan; compare: pages identical within the
   existing tolerance, 43 texts + 26 glyphs restored — any residue/non-restorable item
   **named**, owner validates explicitly (FR-016/SC-003/SC-008).
4. Re-pull + commit `parity/snapshots/figma-components.json` (evals read the committed
   snapshot). On any mid-operation failure: rollback per the interface (named version),
   verify with `figma_diff_versions` + photo, write up, full re-pre-flight before retry.

**Verify (Independent Test US1).**
```bash
npm run parity        # ZERO findings — the 001 declared finding is gone (SC-001)
npm run eval          # the 3 intentional reds are green
```

```bash
git commit -am "step(3-master): the single master update — label settable in Figma, icon menus governed; 9 pages photo-identical, 43+26 customizations restored; parity zero"
```

---

## Step 4 — Closure: proofs the owner can see (US4, P2)

**Do.**
1. FR-021: icon subjects + Button-with-icons preset in the visual instrument;
   `--write-baseline` in the reviewed change; run the standing `--summary` gate.
2. Count-sync + honesty sweep: live `N/N` into README / CLAUDE.md / docs/handoff /
   MILESTONES / REMOVED-CASES.md; delete the reds' "FAILING ON PURPOSE" block (they pass);
   document the named limitation (canvas emitter bakes glyph vectors — byte-proof headless).
3. Full gate sweep + dashboard: zero-écart comparison visible, button with icons visible
   (FR-020); MILESTONES entry dated.

**Verify (Independent Test US4).** The owner opens the dashboard (zero écart, icons
visible), opens Storybook (icons example), runs the suite (fully green, live count).
```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && node scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && tsc -p tsconfig.build.json \
  && npm run extract:figma:visual:summary
```

```bash
git commit -am "step(4-closure): spec 002 closes — suite fully green (live N/N), zero parity findings, icon coverage restored, counts synced"
```
