# Interface — The Single Master Update (operation contract)

**Feature**: 002-governed-icons-button | **Decision**: research D6/D7/D8 | **Entity**: E4

The ONE final Figma-side operation on the « Bouton » master (set `6:122`, key `e6fa6786…`,
file `d9FYAUcqdcNtsuaMgLefvJ`). Everything below is the operation's **contract**: its
preconditions, payload, postconditions, evidence, and rollback. Transport: one scripted
figma-console `figma_execute` operation (NOT the generated `02-button.js` interior redraw —
documented orphaning risk, see research D8).

## Preconditions (pre-flight — ALL required before any write)

| # | Precondition | Verified by |
|---|---|---|
| P1 | Step 0 closed: source cleaned, owner-validated (FR-004) | E8 report sign-off |
| P2 | Button v1.3 adopted + generated + gates green (code side ready first) | gate sweep |
| P3 | Positional before-scan committed: all instances, all 9 pages, by POSITION — 43 texts + 26 glyphs re-measured | E5 runner output |
| P4 | Before-photo of the 9 pages committed (fresh capture, `--refresh`) | E6 runner output |
| P5 | Restore points in place: owner's **named version** + local `.fig` | `figma_get_file_versions` shows the checkpoint; owner confirms the `.fig` |
| P6 | Target identity re-verified (set node id + key match anchors) | pre-flight check in the operation script |
| P7 | Live variable/property TYPES audited (the 001 nav-state lesson) | E8 masters audit |

## Payload (one operation, everything the master lacks — FR-014)

1. **« Libellé » TEXT property** — created on the set, bound to the label node in all 6
   variants, default = « Contactez-nous » → closes the 001 declared parity finding
   (`Contract prop "children" has no TEXT property on the Figma set`).
2. **Icon settings** — the two swap properties verified/completed (exact from-dump state
   decided in Step 0) and their `preferredValues` set to **exactly** the governed menu
   (registry mapping) on both placements.
3. **Nothing else.** No node deleted, no variant interior rebuilt; node ids, existing
   property ids, bindings and page instances untouched.

## Postconditions (the operation is DONE only when all hold)

| # | Postcondition | Evidence |
|---|---|---|
| Q1 | After-photo of the 9 pages identical to before within the existing tolerance; any residue explained + explicitly owner-accepted, else FAIL | E6 report (measured, never by eye — FR-015/SC-003) |
| Q2 | All 43 texts + 26 glyphs restored; every non-restorable one **named**, treatment owner-validated | E5 after-scan vs before-scan (SC-008) |
| Q3 | Re-dump taken; visual caches `--refresh`ed | new dump fixture + harness run |
| Q4 | `parity/snapshots/figma-components.json` re-pulled and committed (evals read the committed snapshot — pushing to Figma is necessary but NOT sufficient) | snapshot diff in the step commit |
| Q5 | `npm run parity` → **ZERO findings** (the 001 finding gone — SC-001) | parity report |
| Q6 | The 3 intentional reds green → suite fully green, live N/N quoted | `npm run eval` |
| Q7 | Operation report committed: checkpoint id, payload receipts, scan/photo refs | operation report file |

## Rollback (mid-operation failure at ANY point)

Restore the owner's named version (owner gesture — Figma has no create/restore API for
named versions), then verify full return with `figma_diff_versions` + a fresh E6 photo
against the before-photo. The file returns **integrally** to its prior state (FR-017);
the failed attempt is written up in the operation report (named, never silent). The
operation stays UNIQUE: a retry is a NEW full pre-flight, not a touch-up series.

## Explicitly out of the operation

- Any edit to the 9 pages' instances (they are only read/verified).
- Any icon-master edit (that was Step 0).
- Running `figma-sync/02-button.js` against the client file (named limitation: the canvas
  emitter still bakes glyph vectors; the contract→canvas byte-proof stays headless via
  deterministic-roundtrip + the faithful mock).
