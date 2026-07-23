# Quickstart — Reconversion Piqueray on the Button

**Feature**: `001-piqueray-button` | **Date**: 2026-07-22

The reconversion runs as **five human-approved steps**, each ending in **one git commit** (the
step named in the message) — the git log *is* the auditable approval trail (FR-016, research
D10). Steps are ordered by dependency: **tokens-first**, then contract, then generation, then
proof. Do not start step N+1 until step N is committed and approved (US4).

> Prereqs: Node ≥ 20, `npm install`. Visual gate needs Chromium
> (`npx playwright install chromium` or set `PLAYWRIGHT_CHROMIUM_PATH`). Run on the main
> checkout, **not** a git worktree (evals symlink `node_modules`). Access to the Piqueray Figma
> source is required to produce the dump (Dependencies).

---

## Step 1 — Reconvert to Piqueray: remove the demo, lay the tokens (US1, P1)

**Do.**
1. Delete all 51 demo contracts (`contracts/*.contract.json`) — the 50 non-Button demos **and**
   the demo `button.contract.json` (replaced fresh in Step 2, not evolved — research D9).
2. Rewrite `tokens/` to the Piqueray mono-theme foundation (E1 / token-foundation.interface):
   12 colours + NavState + Opacity + 8 Montserrat styles, **values from the dump only**;
   remove `tokens/modes/brand.aurora.tokens.json` and `tokens/modes/semantic.dark.tokens.json`;
   make `scripts/build-tokens.mjs` single-mode (empty `dark`, parity check no-op).
3. Delete all 51 demo component dirs under `src/components/`, regenerate, and update golden:

```bash
npm run build            # tokens → schema → generate (glob-driven; auto-shrinks to Button)
npm run catalog          # clears + rewrites catalog shards (Button only)
npm run figma:plan       # regenerates figma-sync (Button only)
npm run golden:update    # re-pins evals/golden.json to the new, smaller output (D7)
```

**Verify (Independent Test US1).** An inventory shows only Piqueray artifacts — no demo
contract, surface, catalog entry, or golden ref remains; the token pipeline compiles the 14
variables + 8 styles in a single mode with **no component yet**:

```bash
ls contracts/*.contract.json          # → empty (no component yet; Button authored in Step 2)
npm run tokens                        # compiles clean, single :root
```

**Approve & commit.**
```bash
git commit -am "step(remove-demo+tokens): repo is Piqueray — 51 demo removed, mono-theme foundation laid"
```

---

## Step 2 — Extract & author the Button contract from the Figma dump (US2, P1)

**Do.**
1. Produce the dump (sub-step 1) and commit it as a fixture:
   `extract/figma/fixtures/piqueray-button.dump.json` (via `npm run extract:figma:mcp` /
   `:rest`).
2. Propose the contract, then **hand-review** the proposal and its `figma-proposals.md` notes:
```bash
npm run extract:figma -- extract/figma/fixtures/piqueray-button.dump.json
```
3. Add the two additive-optional schema fields (schema-additions.interface): `anchors.figma.
   dumpedAt` and the `provenance` marker; bump `docs/02-contract-spec.md`; `npm run schema`.
4. Author the a11y/semantics baseline **marked `provenance:"authored"`** (FR-017); fill
   `anchors.figma.dumpedAt` from the dump; adopt the reviewed proposal as
   `contracts/button.contract.json` (id `ds.button`, version `1.0.0` — D9).

**Verify (Independent Test US2).** The contract captures the 6 variants, records fileKey +
anchors + `dumpedAt`, binds **only** to Piqueray aliases, and generates a component + story
that build green:

```bash
npm run build                         # green; a dangling token ref would fail BY NAME (FR-004)
npx tsc --noEmit && tsc -p tsconfig.build.json
```

**Approve & commit.**
```bash
git commit -am "step(contract): Button contract extracted from Figma dump, reviewed, adopted (6 variants, authored a11y)"
```

---

## Step 3 — Generate the Button (US2 cont.) — determinism

Generation already ran in Step 2's build; this step **pins it as deterministic** (no AI in the
path):

```bash
node scripts/deterministic-roundtrip.mjs   # contract→surface byte-identical ×2; "ZERO AI"
```

**Approve & commit** (if you keep generation as its own checkpoint):
```bash
git commit -am "step(generate): Button surfaces generated deterministically (byte-identical ×2)"
```

---

## Step 4 — Turn the arsenal green: prove fidelity (US3, P1)

Run the four fidelity axes (E5). Axis (d) needs Chromium.

```bash
# (a) determinism — already green in Step 3
node scripts/deterministic-roundtrip.mjs

# (b) code ↔ contract — clean
npm run parity

# (c) contract ↔ Figma — concord, or drift listed in PLAIN LANGUAGE (never silent)
#     (surfaced by the differ against the committed dump; resolve upstream, not in generated files)
npm run parity

# (d) render ↔ Figma — masked-diff ≤ THRESHOLD_PCT 2.0% (existing tolerance; edit subjects.ts
#     to repoint `button` to the Piqueray file and drop demo subjects — research D8)
npm run extract:figma:visual -- button
```

Also keep the engine suite and the rest of the gates green, resolving the demo-coupled eval
cases by the **hybrid rule** (re-point to Button / remove-by-name / leave intact — research D6):

```bash
npm run eval            # engine suite (live N/N authoritative; count may change, stays green)
npm run plugin:check
node scripts/core-browser-check.mjs
```

**Verify (Independent Test US3 / SC-004 / SC-007).** All four axes green; every contract/code/
Figma gap is either resolved or listed in plain language (no drift in silence).

**Approve & commit.**
```bash
git commit -am "step(gates): arsenal green on Button — determinism, parity, contract↔Figma, visual ≤2%"
```

---

## Step 5 — See it in the dashboard & Storybook (US5, P3)

Both are **glob-driven** — no config edits; Button (and only Button) appears after Step 1–3.

```bash
npm run dashboard      # Contract Hub → http://localhost:5180  (Button only; no demo)
npm run storybook      # the story shows the 6 variants
```

**Verify (Independent Test US5 / SC-006).** The owner sees the Button and its 6 variants in
both surfaces.

---

## Definition of done (Success Criteria)

| Gate | Command | Criterion |
|---|---|---|
| Repo is Piqueray only | `ls contracts/*.contract.json` | SC-001 — only Button |
| Foundation complete | `npm run tokens` | SC-002 — 14 vars + 8 styles, one mode |
| Contract → component + story | `npm run build` | SC-003 — approved, generates |
| Four fidelity axes green | roundtrip + parity + `extract:figma:visual -- button` | SC-004 |
| Approval trail | `git log --oneline` | SC-005 — one commit per step |
| Visible | `npm run dashboard` / `storybook` | SC-006 — 6 variants |
| No silent drift | `npm run parity` | SC-007 — resolved or listed |

**Full gate sweep (must be green before merge):**
```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && node scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && tsc -p tsconfig.build.json \
  && npm run extract:figma:visual -- button        # + the visual fidelity axis (Chromium)
```
