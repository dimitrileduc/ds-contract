# Page-parity — the zero-pixel page-proof instrument for spec 003

## 1. What this is

Proves — by measurement, not by inspection — that the 9 Piqueray maquette
frames (page `Pages`, node `210:325`) rendered identically before and after
an externalization increment: a raw copy replaced by a governed instance, a
token rename, a variable re-alias, a rollback. "Proof" is a narrow claim —
**zero pixels differ** — not "looks the same". Two halves: **capture**
(bridge, live-only, §4) and **comparison** (Node, deterministic,
self-contained, §3).

The comparison itself: no Figma, no network, no AI. `pixelmatch` at
**threshold 0.1** (a per-pixel color tolerance absorbing resampling/AA
noise — a classifier, not a fudge factor), its **anti-aliasing (AA) detector
ON**, over **strict** before/after dimensions — no normalization, no
resampling, no recropping.

Deliberately no `alignPair` (`img.ts`'s content-box crop + center-pad),
which exists to compare **two different renderers** — this repo's screenshot
vs Figma's REST export — that don't share a coordinate frame by
construction. Page-parity compares **the same renderer against itself**
(Figma `exportAsync`, same node, same frame) over time, so a before/after
size or position delta **is** the signal, not noise to align away (R2).
`compare.ts` and `report.ts` reuse only `readPng` and `writeTriptych` from
`img.ts` — never `alignPair`.

## 2. Layout

```text
extract/figma/page-parity/
├── README.md          this file
├── cli.ts              argv/env/fs layer (`pages:compare`)
├── compare.ts           the pixelmatch engine: one PixelVerdict per maquette
├── report.ts             verdict.json + verdict.md + diffBox crop-triptychs
├── selftest.ts            the 5 fixture cases (`pages:selftest`)
├── ledger-check.ts         ledger completeness validator (`pages:ledger:check`)
├── bridge/                 live-only, run via figma_execute — see §4
│   ├── scan.js
│   ├── capture.js
│   ├── checkpoint.js
│   └── customizations.js
└── fixtures/                committed PNG pairs + their generator — see §9
    └── generate.ts
```

Two gitignored scratch dirs sit outside this tree, never committed:
`extract/figma/page-parity/out/` (ad-hoc `--out` runs) and repo-root
`.page-parity/` (capture staging, e.g. `.page-parity/<bloc>/before/`). The
committed proof for a real increment lives under
`specs/003-externalize-figma-components/{proofs,ledger}/`.

## 3. Usage

```bash
npm run pages:selftest                                          # fixtures, no Figma
npm run pages:compare -- --before <dir> --after <dir> --out <dir>
npm run pages:ledger:check -- [ledger.json | ledger-dir]        # no arg = check all
```

`pages:compare` reads a `manifest.json` + PNG per maquette from `--before`/
`--after`, writes `verdict.json` (`PixelVerdict[9]` + a global status) and
`verdict.md` (a 9-row owner-readable table) to `--out`, plus a `diffBox`
crop-triptych (before | after | diff — never the full ~1728×8000 px page)
for every maquette that differs.

Its exit codes are load-bearing — read by scripts and by whoever gates a
commit on them, not just by a human skimming stdout:

| Exit | Meaning |
|---|---|
| `0` | 9/9 `identical` |
| `1` | ≥1 `diff` — a measured, localized discrepancy to bring to the owner |
| `2` | ≥1 `capture-failed` / `dimension-mismatch` / missing entry. **The proof did not happen.** This is a refusal, never a downgrade to "identical" (FR-016): an empty capture, a missing manifest, or a before/after size mismatch must never be read as "nothing changed." |

`pages:selftest` exits `0` when every fixture (§9) verifies, no Figma
involved. `pages:ledger:check` exits non-zero on any incomplete ledger entry
(§8) — a separate, blocking gate, independent of the pixel verdict.

## 4. Capture (bridge, live-only)

| Script | Role |
|---|---|
| `bridge/scan.js` | read-only inventory scan by **position + structural signature, never by name** (`contracts/inventory-scan.md`) |
| `bridge/capture.js` | `exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } })` on each maquette **frame** node, plus a `manifest.json` per capture |
| `bridge/checkpoint.js` | `saveVersionHistoryAsync("003/<increment>/<étape>")` before every mutating gesture |
| `bridge/customizations.js` | copy ↔ master structural diff **by position**, run BEFORE replacement, pre-fills the ledger |

All four run inside Figma **desktop** via the **figma-console** bridge
(`figma_execute`) against `Piqueray (Copy)` (fileKey
`d9FYAUcqdcNtsuaMgLefvJ`) — the only route: `figma.loadAllPagesAsync()` must
run first to reach the **local-only** `Pages` page (node `210:325`, the 9
maquettes), invisible to any server-side REST or MCP tool.

A maquette frame @1x runs several MB — past what a single tool result can
carry — so the byte transport is **probed in T0, never assumed**, in this
preference order (R3):

1. **(a)** an MCP nodal capture tool, if it proves node-level export at a
   deterministic @1x scale — a viewport zoom is not acceptable;
2. **(b)** `exportAsync` + chunked base64 over a global persisted across
   `figma_execute` calls (~1 MB chunks);
3. **(c)** `exportAsync` per temporary `SliceNode` band (1728×2000, exported,
   removed) — the only mutating transport, checkpoint-covered.

Whichever wins is recorded **with its proof**, never assumed silently, in
`specs/003-externalize-figma-components/proofs/T0-calibration/transport.md`.

## 5. Calibration

Before any real operation: capture the 9 maquettes twice with **nothing
happening in between**, then run `pages:compare` — it must return **9/9
`identical`**. If not, the instrument's own noise floor isn't zero and every
verdict downstream would be unreliable, so the program **stops** and returns
to the owner. Receipt committed to
`specs/003-externalize-figma-components/proofs/T0-calibration/`.

## 6. Freshness

No cache, no baseline file, no `--refresh` flag — **by design** (R4). Every
proof re-captures its full 18 PNGs (9 before + 9 after) within one session;
no manifest carries over from an earlier proof or file version.
`visual-parity` caches a baseline by file version and needs an explicit
`--refresh` after a Figma edit — spec 001 lost real time to exactly that
flag being forgotten. This instrument has nothing persistent to forget to
refresh.

## 7. Rollback (FR-017)

`bridge/checkpoint.js` calls `saveVersionHistoryAsync("003/<increment>/
<étape>")` before **every** mutating gesture — usually a bloc
(`003/<bloc>/master`, `003/<bloc>/adoption`), sometimes a phase name
(`003/tokens/<geste>`, `003/setup/pages-ds`) — systematically, listed in the
file's native version history.

**No programmatic restore API exists** (verified 2026-07-23). Restoration is
a **manual, guided** gesture through Figma's native version-history UI, never
a script:

1. Figma desktop → File menu → **Show version history**.
2. Restore the named checkpoint taken before the cancelled operation.
3. Verify with the instrument, not by eye: fresh capture of the 9 maquettes
   vs. the operation's `before/` captures → `pages:compare` must return 9/9
   `identical`.
4. Record the failure and the rollback in `decisions.md`.

## 8. Ledger completeness (blocking)

An adoption is "done" only when **both** hold: the pixel proof passed (§3)
**and** the ledger (`ledger/<bloc>.json` under
`specs/003-externalize-figma-components/`, schema in
`contracts/customization-ledger.md`) is complete — never either alone (FR-012). The
pixel gate catches **visual** loss (looks different); the ledger catches
**intent** loss (silently overwritten by a same-rendering value, invisible
to the pixel gate by construction).

`pages:ledger:check` is the blocking validator. It fails non-zero on: a
`reportee` entry missing `portePar`; a `non-portable-signalee` entry missing
`signalement`; a `type: autre` entry without a description. A
no-customization adoption still needs an explicit **empty** ledger
(`entrees: []`, `totaux` zeroed) — never an absent file.

## 9. Fixtures & selftest

`npm run pages:selftest` runs the 5 cases from `contracts/page-proof.md` §3,
committed as PNG pairs under `fixtures/`, regenerable via
`fixtures/generate.ts` — never hand-edited binary blobs:

1. **identical** pair → `identical`, `diffCount 0`, exit `0`.
2. **one pixel** changed beyond the threshold → `diff`, `diffCount ≥ 1`,
   `diffBox` localizes it, exit `1`.
3. **empty capture** (0×0 or fully transparent) → `capture-failed`, exit `2`.
4. **dimension mismatch** → `dimension-mismatch`, exit `2`.
5. **byte-determinism** — two runs over the same inputs → byte-identical
   `verdict.json`.

The "fixture" half of the claims rule's fixture → eval → claim order (R12)
— the instrument proves itself before any claim about it is made elsewhere.

## 10. Named limits

- **Capture is live-only**: the desktop figma-console bridge against an
  open Figma app — not headless, not CI-runnable. Only `compare.ts` /
  `report.ts` / `cli.ts` are self-contained, proven by `pages:selftest`.
- **Scope is the 9 rendered maquette frames, clipped to their bounds** —
  nothing else; off-canvas layers and other pages are out of scope.
- **Not wired into `evals/run.ts`** — the suite doesn't run inside a
  worktree, and capture needs a live canvas, not something to fake headless.
- **Per the claims rule (R12)**: no capability claim for this instrument
  beyond what `pages:selftest`'s fixtures (§9) prove — fixture → eval →
  claim, always.
