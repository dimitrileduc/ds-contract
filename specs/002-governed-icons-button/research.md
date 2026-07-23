# Phase 0 — Research & Decisions

**Feature**: Icônes gouvernées + finalisation du Bouton (choix d'icône et mise à jour du master)
**Branch**: `002-governed-icons-button` | **Date**: 2026-07-23

The spec arrived with its 2 deliberate gaps already clarified in session (governance form =
**single registry**; Button slots = **keep the 001 mechanism**, native Figma slot out of
scope). This document resolves the remaining *technical* unknowns by grounding each decision
in the repo's real mechanisms (verified against source this session — file:line refs below)
and in the owner's parked instructions from `checklists/requirements.md` (step-0 audit may
lean on figma-console `figma_lint_design`; **reuse repo tooling, zero throwaway scripts, zero
hand-written contract**; propose Figma changes BEFORE contracting). **Status: no NEEDS
CLARIFICATION remain.**

Non-derivable inputs are **measured, never invented** (001 discipline): the re-measured
counts (15 masters / 268 instances / 22 chevron uses / 43 texts / 26 chosen icons / 9 pages),
the live master's exact icon-swap property names and preferred-values state, and the
post-cleanup dump are all captured in Step 0 — plan placeholders for them are marked
**from-dump**.

---

## D1 — The governed registry: `contracts/icons.registry.json`, one versioned document

**Decision.** The governed icon set is **one versioned JSON document**,
`contracts/icons.registry.json`, Zod-validated by a **new additive schema export**
(`IconRegistrySchema` in `packages/schema/src/contract-schema.ts` — a new document type, no
existing field touched). Shape (see `contracts/icon-registry.interface.md`): registry
`id: "ds.icons"`, semver `version`, `source` anchors (fileKey `d9FYAUcqdcNtsuaMgLefvJ`, icons
zone node `6:111`, `dumpedAt`), and one entry per icon:
`{ name, figma: { componentName, key, nodeId }, asset, size, description }`. The canonical
`name` is the kebab identifier designer and developer share (`arrow-left`); `figma.*` records
the canvas identity (`cil:arrow-left`, key `8a405ce4…`); `asset` names the SVG file under
`assets/icons/`. The registry is **proposed by extraction from the cleaned source** (Step 0
dump of zone 6:111 + the REST component inventory), hand-reviewed, adopted — same
propose→review→adopt lifecycle as the 001 contract; never hand-invented. Evolution follows
the spec's rule: **widening the set = minor, narrowing = major** (FR-006).

**Rationale.** The clarification chose "registre unique" over per-icon contracts and over
riding the token pipeline. `contracts/` is the repo's home for source-of-truth documents; the
`.registry.json` suffix keeps it outside the `*.contract.json` glob every generator consumes,
so no downstream surface mis-parses it. A registry is exactly the missing bridge the
exploration exposed: today code names (`arrow-left`) and Figma names (`cil:arrow-left`)
**do not match and nothing reconciles them**, and five Figma icons (cart, download, pdf,
mail, phone) have **no code asset at all** — the registry carries the mapping both sides are
verified against (D4).

**Alternatives considered.** (a) *One contract per icon* — rejected by the clarification
(and by scale: 15 mechanical mini-contracts govern nothing the registry doesn't). (b) *Icons
at token rank* — rejected by the clarification; tokens carry values, not SVG bodies + canvas
identities. (c) *Registry under `assets/icons/registry.json`* — rejected: SSoT documents
live in `contracts/`; assets are the code-side *derivation*, not the truth.

---

## D2 — Button v1.3: two enum props bound INSTANCE_SWAP — no slot, no restructure

**Decision.** The two placements become steerable ("which icon") by **adding two enum
props** — working names `iconLeftGlyph` / `iconRightGlyph`, canonical values = the registry
names — each bound `{ kind: "INSTANCE_SWAP", property: <the master's real swap-property
name, from-dump>, values: { <canonical> → <Figma component name> } }`, alongside the
**unchanged** v1.2 BOOLEAN visibility props (`iconLeft`/`iconRight` ↔ « Icône gauche »/
« Icône droite »). Anatomy: the icon parts switch from a fixed asset to the **existing
enum-substitution convention** `icon: { asset: "{iconLeftGlyph}", size: 20 }`. Defaults stay
`arrow-left` / `arrow-right` — strictly additive, **v1.2.0 → v1.3.0 minor** (FR-013).

**Rationale — every piece already exists.**
- The binding schema already supports this **with zero schema change on props**:
  `bindings.figma = { kind: 'VARIANT'|'BOOLEAN'|'TEXT'|'INSTANCE_SWAP'|'NONE', property?,
  values? }` where `values` is the generic "canonical value → Figma value" map
  (contract-schema.ts:75–79). Mapping canonical icon names → Figma component names for an
  INSTANCE_SWAP property is that field used as declared, not repurposed.
- The React emitter already expands an enum-referenced asset: `asset: "{prop}"` pulls
  **every enum value** into the component's `ICONS` map and renders `ICONS[<propValue>]`
  (emit-react.ts:2015–2024, 2064–2076) — "which icon" in code needs **no emitter change**.
  The emitter's existing refusal (`needs icon asset assets/icons/<asset>.svg which does not
  exist`, emit-react.ts:724–725) makes the build itself enforce *menu ⊆ code assets*.
- The dump pipeline already captures the Figma side: REST `map.ts` records INSTANCE_SWAP
  `preferredValues` → `set.swapPreferredValues` and BOOLEAN → `set.boolDefaults`
  (map.ts:39–52, dump v1.5+). The generated typed union on `Button`'s props **is** the
  developer's list (US2), mechanically tied to the registry by D4's differ axis + the build
  refusal.

**This honours both clarifications**: the Figma mechanism stays the proven 001 pair (swap
menu + display toggle); Figma's native slot feature stays untouched; and the contract-side
`slot + accepts` model is **not** used, because `accepts` holds *contract IDs* resolved at
build (contract-schema.ts:600–623, 1092–1111) — using it would force per-icon contracts
(rejected, D1) or one `ds.icon` **variant-set** contract, which would require restructuring
15 standalone Figma masters into a component set: a heavy source mutation the spec forbids
(minimal cleanup, zero added risk on 268 instances, no "harmonisation").

**Alternatives considered.** (a) *`slot` + `accepts` + one `ds.icon` contract* — rejected
above (restructure risk; contradicts "registre unique, pas un contrat par glyphe"). The
schema's slot machinery stays for a future spec if the source ever reorganizes. (b) *Native
Figma slot* — explicitly out of scope (clarified 2026-07-23). (c) *Free-string icon prop* —
rejected: an unconstrained string breaks "the contract guarantees exactly the menu's
choices, no more, no less" (FR-011) and refuses nothing.

**From-dump placeholders (Step 0 re-measures, never invented).** The 001 record says the
masters' swap properties were born in Figma ("the just-born « Glyphe » swap properties",
001 tasks.md T037d) and the spec assumes the choice menus exist; but the committed parity
snapshot lists only the BOOLEANs + `Property 1` on the set. The Step-0 re-dump establishes
the live truth: exact swap-property names, whether `preferredValues` are configured, and on
which nodes. If swap properties are absent or unconfigured, completing them is part of the
**single master update** ("les réglages d'icônes", FR-014), proposed to the owner in the
Step-0 report — never silently assumed either way.

---

## D3 — Code-side icon set: deterministic SVG export into `assets/icons/`, pruned to the registry

**Decision.** Acquire the 15 governed SVG bodies **deterministically from Figma** via a new
reusable export step in the existing REST tooling (`extract/figma/rest/` — Figma images API
`format=svg` per master node), written to `assets/icons/<name>.svg` (the emitters' existing
source of glyphs), and **prune `assets/icons/` to exactly the governed set** (today 22–23
files including demo-era leftovers: `search`, `close`, `spinner`, `warning`, … — residue
from the 51-component demo, referenced by no contract). Result: `assets/icons/` **is** the
code-side derivation of the registry, byte-stable, acquired once per source change (like the
dump), consumed by the pure emit path.

**Rationale.** FR-012: any mockup button reproducible "sans aucun SVG bricolé à la main" —
so bodies must come from the source, through a tool, not from hand-drawing. FR-008:
Figma-first. The emit path stays pure (Principle I): acquisition is a source-refresh step
(like dumping), generation from `assets/` remains byte-identical. Pruning makes FR-006's
"une seule et même liste" literal on the code side — every leftover would otherwise be a
code-side icon the designer's menu doesn't have. `deterministic-roundtrip.mjs` and the
emitters read the directory dynamically, so pruning is safe exactly when no contract
references a pruned name — which the existing emit refusal proves at build.

**Alternatives considered.** (a) *Vector data lowered from the dump* — the dump (v1.6)
carries no vector geometry; extending it duplicates what the images API already guarantees.
(b) *Keep leftovers "just in case"* — rejected: silent inventory divergence is precisely the
bug class FR-007 exists to kill; removal is loud (git diff) and reversible.

---

## D4 — The mechanical guarantee: a new **icons axis** in the three-way differ

**Decision.** Extend `parity/diff.ts` with an **icons dimension**: registry
(`contracts/icons.registry.json`) ↔ code (`assets/icons/*.svg` inventory + the Button's
generated enum) ↔ canvas (the committed `parity/snapshots/figma-components.json`, which
already inventories every icon component with name + library key, plus the Button set's
swap-property `preferredValues` once re-pulled). Every divergence becomes a named finding
with the existing classifications (`ahead`/`behind`/`mismatch`) and the existing
acknowledgment mechanics (`parity/baseline.json`) — FR-006 "vérifié mécaniquement", FR-007
"jamais silencieuse". `npm run parity` remains the single verdict surface.

**Rationale.** The differ is the repo's home for cross-surface truth (Principle III), and
the owner rule forbids a side-car checker. The canvas-side raw material is already in the
snapshot (`cil:arrow-left` key `8a405c…`, `mynaui:cart`, `tabler:download`, …); the code
side is a directory listing plus the contract's enum; the registry is the pivot. What's
genuinely new is only the comparison, in the tool whose job is comparisons.

**Alternatives considered.** Standalone `icons:check` script — rejected (owner rule: add
capability to the common tool at the right place, never a script beside it).

---

## D5 — Extraction closes its own named gap: propose-figma lowers what 001 authored

**Decision.** Implement in `core/propose-figma.ts` the lowering pass its own v1.2 contract
description names as the known gap: set-level `boolDefaults` → boolean props,
`propRefs.visible` → `visibleWhen`, and `swapPreferredValues` (+ registry name resolution:
component key → canonical name, registry passed **as data**, core stays browser-pure) → the
INSTANCE_SWAP-bound enum props of D2. Button v1.3 is then **genuinely extracted** from the
post-cleanup dump and reviewed, not authored-against-the-dump as v1.2 had to be
(FR-011: born in Figma, then extracted and guaranteed).

**Rationale.** Honesty (V): v1.2 carries "Known extraction gap, named: propose-figma does
not yet lower the dump's boolDefaults/propRefs into props." 002 is the iteration that makes
the icon capability real; leaving the gap would mean hand-authoring v1.3 too and renewing
the debt. The REST mapper already stages the data (map.ts:50 "keys → slot accepts
downstream"); `Ctx` already declares `swapPreferredValues`/`boolDefaults`
(propose-figma.ts:811–814) and only the diff path reads them today. C5 eval coverage rides
the same fixture (D9).

---

## D6 — Step 0, the audit: lint + positional scan, committed report, owner arbitration

**Decision.** The step-0 audit is **tooled, twofold, and blocking**:
1. **Masters audit** (zone `6:111`): figma-console `figma_lint_design` (owner's parked
   instruction) + the post-cleanup re-dump, covering structure, constraints, **variable
   bindings and variable TYPES** (the 001 `nav-state` lesson: a STRING variable nearly
   crashed the first push), sizes (20 and 32 both **respected as designed**, FR-005),
   descriptions.
2. **Usage audit, by POSITION never by name** (the CLAUDE.md rule): a **new committed
   runner** that walks every instance on every page via `figma_execute` and streams records
   to the existing `capture-receiver.mjs` sink (the banked-capture pattern —
   `extract/figma/gauntlet/live/capture-receiver.mjs`), re-measuring the session counts
   (268 instances, 22 external-chevron uses, 43 texts, 26 chosen glyphs, 9 pages) and
   recording per-instance overrides `{page, position, nodeId, text?, glyph?}` — the same
   artifact Step 3 uses as its before/after customization photo (E5).

Output: a committed plain-words report. The **4 decided items** are then applied in Figma as
targeted figma-console edits (mail color → variable binding; scale rules on the 4; 15
descriptions; the external chevron replaced by a **local master reproducing the drawing**,
swapped on its 22 uses by position, expected pixel diff **nil** — any measured residue goes
to the owner explicitly). **Any further anomaly** (e.g. the `cil:`/`lucide:` vendor-prefix
names vs clean canonical names) is a **named proposal the owner arbitrates** — never a
silent fix, never modeled around (FR-003). No extraction happens before the owner validates
the cleaned source (FR-004); then re-dump + visual `--refresh` (the harness caches by file
version).

**Rationale.** Constitution-level rule (source-cleanliness, "the Button lesson") + the spec
makes it P2-but-sequentially-first. The positional discipline has receipts: 001's
*name-based* scan wrongly called `arrow-left` dead stock and invited a near-deletion.

**Alternatives considered.** Reusing `gauntlet/census.ts` — rejected: it's a structural
pattern census over committed dumps, not a per-instance override scan; the live capture
pattern is the right primitive.

---

## D7 — State photography of the 9 pages: a thin committed runner over existing primitives

**Decision.** Add a **page-state photography runner** to the visual tooling
(`extract/figma/state-photo/`, beside `visual-parity/`), composed entirely of existing
primitives: `fetchNodePngs` (fetches a scale-2 PNG for **any** node id, cache keyed by node
+ **file version** — figma-api.ts:6–12, 133) + `img.ts` `alignPair`/`diffPair`/
`writeTriptych`. It captures the 9 page frames, `--refresh`-aware (never compare against a
stale photo — spec assumption), diffs before/after within the **existing** instrument
tolerance (`THRESHOLD_PCT = 2.0`, no new threshold — spec assumption), and writes a
committed score report; divergent triptychs are kept as evidence. Runs at least: before
Step 0's chevron swap, after it, before and after Step 3's master update (FR-015).

**Rationale.** The instrument today only photographs component sets (code-render vs
Figma-render per variant); pages need canvas-vs-canvas over time. The primitives make this a
thin runner, and the owner rule requires it live in the repo's common tooling, not as an
ad-hoc session gesture (which is how 001 did it).

---

## D8 — The single master update: one targeted scripted operation — NOT the generated redraw

**Decision.** Step 3 applies **one** scripted operation to the « Bouton » master via
figma-console `figma_execute` (the transport 001's master gestures used and documented),
embarking everything the master lacks: **(a)** a TEXT component property for the label
(« Libellé »), bound to the label node in all 6 variants — closing the 001 declared parity
finding (`Contract prop "children" has no TEXT property on the Figma set`,
parity/report.json); **(b)** the icon settings — the swap properties verified/completed and
their `preferredValues` set to exactly the governed menu (from-dump state decides how much
of (b) is needed; owner sees it in the Step-0 report). **Nothing is deleted; node ids,
property ids and variant structure are preserved.** The generated `figma-sync/02-button.js`
is **not** run against the client file this iteration: it rebuilds variant interiors and
would orphan the born-in-Figma swap properties and strand the 26 swapped glyphs + 43 label
overrides — the exact risk 001 documented when it deliberately transferred the rebuild.

Protocol around the operation (E4's state machine): positional before-scan (D6 runner) +
before-photo (D7) → **restore points**: owner's named version save + local `.fig` download
(the 001 pre-flight items, formalized as a checklist in the operation's interface;
`figma_get_file_versions`/`figma_diff_versions` verify the checkpoint exists) → the one
operation → re-dump + `--refresh` → after-photo + after-scan → measured comparison
(identical within tolerance; every non-restored customization **named**, owner validates —
FR-016) → parity snapshot re-pull (`parity/snapshots/figma-components.json` re-committed —
the evals read the committed snapshot, so pushing to Figma is necessary but not sufficient)
→ `npm run parity` = **zero findings** (SC-001). Mid-operation failure → restore the named
version (owner gesture), verified by version diff — full return to prior state (FR-017).

**Named limitation (honesty).** The canvas emitter still bakes icon glyphs as vectors, not
as instances of the local icon masters; the contract→canvas byte-proof therefore stays
**headless** (deterministic-roundtrip + the faithful mock), and live alignment is proven by
the re-pulled parity snapshot. Documented where the capability is claimed. Teaching the
canvas emitter to emit icon **instances** is future work (it only becomes *necessary* the
day a generated rebuild must run against a live customized file — precisely what this spec
avoids).

**Alternatives considered.** (a) *Run the generated `02-button.js` rebuild* — rejected this
iteration: contradicts "UNIQUE et minimale, zéro risque ajouté sur les 26 icônes" and
carries the documented orphaning risk. (b) *Series of small edits* — rejected: FR-014
demands one operation, and 001's per-gesture-checkpoint pattern is subsumed into the single
protocol above.

---

## D9 — Eval strategy: turn the 3 reds green, add the new capabilities' checks, fix a stale attribution

**Decision.**
1. **The 3 intentional reds** (`baseline-parity-clean`, `baseline-acknowledges-without-failing`,
   `promotion-converges`, run.ts:53–106) share **one root cause today**: the missing label
   TEXT property (the token push is done — the live parity report confirms the token axis is
   clean). They go green when Step 3 lands **and** the re-pulled snapshot is committed. No
   case rewrite needed.
2. **Honesty fix (Principle V), discovered in exploration**: the reds' banner, the runner's
   closing message (run.ts:43–52, 3697–3699), README, `REMOVED-CASES.md` (which also still
   says "96 executed" against a live 97) and MILESTONES all still attribute the block to
   "pending the token-set push" — **stale**. 002 re-attributes to "pending the Button master
   rebuild" immediately (Step 1 hygiene), then deletes the block at closure.
3. **New capabilities, fixture → eval → claim** (Principle II) before any doc claims them:
   the registry three-way guarantee (C3: a seeded divergence on any side is detected and
   listed in clear language — FR-007), refusal (C2: an icon name outside the registry/enum
   fails **by name** at build), extraction lowering (C5: the D5 pass recovers bool +
   swap props from the fixture dump), and v1.3 generation riding the existing C1
   determinism + C8 journey + `golden-generated-output` (golden re-pinned via
   `npm run golden:update` in the reviewed change).
4. **Quarantine revivals** (move + re-point per `REMOVED-CASES.md` discipline, exact list
   decided at tasks): strongest candidates `preferred-values-accepts` (the Figma menu
   resolving into the governed list ≈ FR-006/FR-011), `detect-figma-accepts-drift` (menu
   drift ≈ FR-007), `detect-default-and-kind-drift` (BOOLEAN toggles), and
   `figma-script-referees-invalid-contracts` (recorded as re-homeable "immediately").
   Caveat honored: these were written against demo shapes — reviving means re-pointing
   fixtures to the Piqueray icon model, and cases whose assertions are inseparable from
   `slot.accepts` semantics stay quarantined with the reason updated.
5. **Counts**: new cases raise the total above 97 — FR-019 already rules "le compte vivant
   fait foi"; the closure sweep re-syncs every quoted count (README, CLAUDE.md,
   docs/handoff, MILESTONES, REMOVED-CASES.md, spec.md).

**Rationale.** Every item follows the claims rule; the stale-attribution fix is the
repo's own "silent omission is the highest-severity bug class" applied to its own docs.

---

## D10 — FR-021, visual coverage of the icon set: new subjects on the existing instrument

**Decision.** Register the governed icons as subjects in
`extract/figma/visual-parity/subjects.ts` (the instrument already accepts a standalone
COMPONENT subject), plus a **Button-with-icons** subject preset — which requires the small,
named instrument extension the repo's own SOUCIS notes: a per-subject **prop preset**
(e.g. `iconRight: true` + a chosen glyph), since defaults render text-only. Existing
`THRESHOLD_PCT = 2.0` and `baseline.json` regression gate; **no new threshold** (spec
assumption). `--write-baseline` records the restored coverage; icon proof was explicitly
"deferred to v1.3" by 001 (commit 38aee13) — this is that deferred proof landing.

**Alternatives considered.** A separate icon-only visual harness — rejected (owner rule;
the instrument exists and its subject list is the sanctioned extension point).

---

## D11 — Versioning, schema evolution, and housekeeping

**Decision.**
- `ds.button` **1.2.0 → 1.3.0** (minor: two additive enum props with defaults preserving
  v1.2 behaviour; BOOLEAN props unchanged) — FR-013, Principle VI.
- `contracts/icons.registry.json` starts its own line at **1.0.0**.
- Schema: **additive only** — the new `IconRegistrySchema` document export (+ its build-time
  validation and asset-existence check). The prop-binding side needs **no change**
  (`values` is already the generic canonical→Figma map, contract-schema.ts:75–79).
  `docs/02-contract-spec.md` bumped with the registry document and the INSTANCE_SWAP
  enum-binding convention (`asset: "{prop}"` + `values`).
- Housekeeping, named: `catalog/components/button.json` is **stale at v1.1.0** (pre-dates
  the v1.2 toggles — regenerate via `npm run catalog` in Step 2); `update-golden.mjs` walk
  globs reviewed if any new generated file lands outside `src/` + `figma-sync/*.js` (none
  planned: the registry is source, the SVGs are acquired assets).

**Rationale.** Strict semver on contracts is Principle VI; the schema path is the sanctioned
optional-additive route; both housekeeping items were surfaced by exploration and would
otherwise be silent drift.
