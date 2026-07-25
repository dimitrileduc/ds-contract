# Phase 1 — Data Model

**Feature**: Icônes gouvernées + finalisation du Bouton (choix d'icône et mise à jour du master)
**Branch**: `002-governed-icons-button` | **Date**: 2026-07-23

Eight entities, lifted from the spec's *Key Entities* and grounded in the real on-disk
shapes. "Validation" = the executable rule that already enforces it (or the additive rule
this feature introduces — marked **new**). Value-bearing fields are **from-dump** /
**from-scan** (measured in Step 0/3, never invented) or **authored** (hand-written,
honesty-marked). Session counts (15 masters, 268 instances, 22 chevron uses, 43 texts,
26 glyphs, 9 pages) are 2026-07-23 measures — Step 0 re-measures and re-syncs them.

---

## E1 — Icon Registry (`contracts/icons.registry.json`) — the governed set

The single versioned document the designer menu and the code list both derive from (D1).

| Field | Type | Source | Validation / rule |
|---|---|---|---|
| `id` | `"ds.icons"` | authored | **new** `IconRegistrySchema` (Zod, additive) |
| `version` | semver, starts `1.0.0` | authored | widen set = minor, narrow = major (FR-006) |
| `source.fileKey` | `"d9FYAUcqdcNtsuaMgLefvJ"` | from-dump | present |
| `source.zoneNodeId` | `"6:111"` | from-dump | present (the owner-named icons zone) |
| `source.dumpedAt` | ISO-8601 | from-dump | photo-at-instant-T convention (as `anchors.figma.dumpedAt`) |
| `icons[]` | Entry[] — 15 at session count | from-dump (proposed → reviewed → adopted) | non-empty; names unique |
| `icons[].name` | kebab canonical id (`arrow-left`) | reviewed (mapping decided at adoption) | `[a-z][a-z0-9-]*`; the shared designer/developer identifier |
| `icons[].figma.componentName` | e.g. `cil:arrow-left` | from-dump | must exist in the canvas inventory (parity icons axis, **new**) |
| `icons[].figma.key` | library component key | from-dump | present; stable across renames |
| `icons[].figma.nodeId` | node id in file | from-dump | present |
| `icons[].asset` | filename stem under `assets/icons/` | derived = `name` | `assets/icons/<asset>.svg` exists (emit refusal, emit-react.ts:724–725 + **new** registry build check) |
| `icons[].size` | `20 \| 32` | from-dump | both sizes legal as designed — never harmonized (FR-005) |
| `icons[].description` | string | from-dump (after cleanup item c) | non-empty once Step 0 lands descriptions |

**Relationships.** Derives → E2 assets & the Figma menu; constrains → E3's enum values;
verified by the **parity icons axis** (D4) against code and canvas. **Invariants** —
registry = code list = designer menu, element by element (SC-004); zero third-party
dependency (FR-008/SC-007); any divergence is a named finding, never silent (FR-007).
**State.** proposed (extracted from cleaned source) → reviewed → adopted → verified
(parity clean). Adoption is blocked until Step 0 is owner-validated (FR-004).

---

## E2 — Icon (master + code asset)

One governed icon: the Figma master (born there — FR-008) and its extracted SVG body.

| Field | Type | Source | Validation / rule |
|---|---|---|---|
| Figma master | COMPONENT in zone 6:111 | exists in source | local (no remote library dependency — cleanup item d) |
| color binding | fill bound to a Piqueray variable | Figma (cleanup item a: mail icon) | audit reports any unbound fill; **variable TYPE checked** (nav-state lesson) |
| scale rules | constraints on the master | Figma (cleanup item b: the 4 lacking them) | audit reports absences |
| description | master description | Figma (cleanup item c: all 15) | audit reports absences |
| SVG body | `assets/icons/<name>.svg` | **extracted** (REST `format=svg`, D3 — new reusable step) | never hand-drawn (FR-012); pruned dir = registry exactly (D3) |
| size | 20 or 32 | from-dump | respected as designed (FR-005) |

**Relationships.** Listed by E1; rendered by the generated Button via the `ICONS` map
(enum expansion, emit-react.ts:2015–2024). **Invariant** — an icon born code-side without a
Figma master is refused (Figma-first, FR-008 edge case).

---

## E3 — Button v1.3 Contract (`contracts/button.contract.json`)

The v1.2 contract plus the icon-choice capability — extracted this time (D5), not authored.

| Field (delta from v1.2) | Type | Source | Validation / rule |
|---|---|---|---|
| `version` | `1.3.0` | authored bump | minor: strictly additive (FR-013, Principle VI) |
| `props.iconLeftGlyph` / `iconRightGlyph` (working names) | enum over E1 names | **from-dump** (D5 lowering) | values = registry names exactly, no more no less (FR-011) |
| — `bindings.figma` | `{ kind: "INSTANCE_SWAP", property: <from-dump>, values: { name → figma.componentName } }` | from-dump + E1 mapping | existing generic `values` map (contract-schema.ts:75–79) — no schema change |
| — `default` | `"arrow-left"` / `"arrow-right"` | from-dump (current glyphs) | v1.2 rendering preserved unchanged |
| `props.iconLeft` / `iconRight` (BOOLEAN) | unchanged | v1.2 | untouched — the proven 001 toggle mechanism |
| `props.children` | unchanged in contract | v1.2 | the *Figma side* gains the TEXT property in E4 — the contract already declares it |
| `anatomy.root.parts.iconLeft.icon` | `{ asset: "{iconLeftGlyph}", size: 20 }` | authored form, from-dump content | enum-expansion convention (existing machinery); asset files must exist |
| `anchors.figma.dumpedAt` | post-cleanup dump date | from-dump | refreshed (never review v1.3 against the stale 2026-07-23 dump) |

**Relationships.** Consumes E1 (enum values + mapping); generated surfaces re-emitted
(`src/components/Button/*`, `figma-sync/*.js` — golden re-pinned); compared by parity to the
re-pulled snapshot. **State.** proposed (extractor output over the cleaned dump) → reviewed
→ adopted → generated → proven (gates green). **Invariant** — nothing existing breaks:
v1.2-shaped usage renders identically (defaults), evals C1/C8 + golden prove it.

---

## E4 — The Single Master Update (operation on the « Bouton » set, node 6:122)

The one final Figma-side operation (D8) — an entity with a strict lifecycle, not a task list.

| Field | Type | Source | Validation / rule |
|---|---|---|---|
| target | set `6:122`, key `e6fa6786…`, file `d9FYAUcqdcNtsuaMgLefvJ` | anchors | identity re-verified before write |
| payload (a) | TEXT property « Libellé » bound to the label node, 6/6 variants | contract `children` | closes the declared finding `Button.Contactez-nous` (parity/report.json) |
| payload (b) | icon settings: swap properties verified/completed; `preferredValues` = E1 menu | from-dump state + E1 | exactly the governed menu (FR-011) |
| preserved | node ids, property ids, variant structure, **all page instances** | — | NOTHING deleted (001 gesture discipline) |
| transport | figma-console `figma_execute`, one scripted operation | D8 | UNIQUE — no series of touch-ups (FR-014) |

**State machine (each transition gated):**
`pre-flight` (E5 before-scan + E6 before-photo + E7 restore points in place)
→ `applied` (the one operation)
→ `re-measured` (re-dump + `--refresh`, E6 after-photo, E5 after-scan)
→ `verified` (E6 identical within tolerance; E5 restorations 43+26 complete or **named** →
owner validates — FR-016; snapshot re-pulled & committed; `npm run parity` = 0 findings)
→ `closed` (SC-001).
On mid-operation failure at any point: → `rolled-back` (E7 restore, verified by version
diff — full prior state, FR-017). Any residual pixel diff either **nil or explicitly
owner-accepted**, else the operation is a failure (SC-003).

---

## E5 — Mockup Customizations (the positional record)

What the 9 pages set on their Button instances — the thing the operation must not lose.

| Field | Type | Source | Validation / rule |
|---|---|---|---|
| `page` | page name + index | from-scan | all 9 pages covered |
| `position` | stable positional path (page → frame path → index) | from-scan | **by POSITION, never by name** (CLAUDE.md rule; 001 near-deletion receipt) |
| `nodeId` | instance node id | from-scan | recorded for re-find |
| `text?` | overridden label | from-scan | 43 at session count — re-measured |
| `glyph?` | swapped icon (component name/key) | from-scan | 26 at session count — re-measured; each maps into E1 (a residual non-governed glyph is detected and listed — edge case) |

**Producer**: the **new committed positional scan runner** (D6 — `figma_execute` walk →
`capture-receiver.mjs` sink → committed JSON). **Consumers**: Step 0 report (usage audit),
E4 pre-flight (before), E4 verification (after — every record restored or named).
**Invariant** — no customization lost or altered silently (SC-008: "l'omission silencieuse
est la faute la plus grave").

---

## E6 — State Photography (before/after, the 9 pages)

| Field | Type | Source | Validation / rule |
|---|---|---|---|
| subject | the 9 page frames (node ids) | from-scan | complete set, re-measured |
| capture | scale-2 PNG per page, cache keyed node + **file version** | `fetchNodePngs` (figma-api.ts:133) | `--refresh` after ANY Figma edit — never a stale photo (spec assumption) |
| comparison | pixelmatch before↔after + triptych on divergence | `img.ts` primitives | measured, never by eye (FR-015) |
| tolerance | the existing instrument's (`THRESHOLD_PCT = 2.0`) | visual-parity | **no new threshold** (spec assumption) |
| report | committed scores per page + named divergences | **new thin runner** (D7) | zero-or-explained: any residue explicitly owner-accepted or the operation fails (SC-003) |

**Runs**: before/after the chevron swap (Step 0, expected diff nil) and before/after the
master update (Step 3).

---

## E7 — Restore Points

| Field | Type | Source | Validation / rule |
|---|---|---|---|
| named version | Figma version history entry | **owner gesture** (no create API) | existence verified via `figma_get_file_versions` before any write |
| local `.fig` | owner's file download | owner gesture | checklist item (001 pre-flight, formalized) |
| checkpoint record | version id + timestamp committed in the operation report | tooling | rollback verified by `figma_diff_versions` |

**Invariant** — in place BEFORE the operation (FR-017); rollback = full return to prior
state, verified, on any mid-operation failure.

---

## E8 — Step-0 Audit Report & Change Proposals

The committed, plain-words record that gates everything downstream (FR-001→FR-004).

| Field | Type | Source | Validation / rule |
|---|---|---|---|
| masters audit | structure, constraints, variable bindings **+ types**, sizes, descriptions — 15 masters | lint (`figma_lint_design`) + dump | covers every master; sizes 20/32 respected (FR-005) |
| usage audit | all instances, all pages, **by position** | E5 scan runner | 268 at session count — re-measured; counts re-synced in docs |
| decided items | the 4 cleanup items (a–d) + application receipts | owner (already decided) | each applied in Figma, checkpointed, photographed where relevant |
| proposals | any anomaly beyond the 4 — named, with options | audit | **owner arbitrates BEFORE contracting** (FR-003); never silent, never modeled-around |
| validation | owner sign-off of the cleaned source | owner | blocks extraction until granted (FR-004, SC-006); recorded in the report + step commit |

**Relationships.** Gates E1/E3 adoption; feeds E4 pre-flight (counts, positions); its
proposals may amend E1's mapping (e.g. canonical-name decisions).
