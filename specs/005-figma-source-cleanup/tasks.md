# Tasks: Spec A — Source Figma propre avant extraction

**Input**: Design documents from `/specs/005-figma-source-cleanup/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md (all present)

**Tests**: This iteration writes no source code — the "test" for every task is the
pixel-proof cycle itself (`contracts/proof-cycle.md`): capture before → gesture →
capture after → `npm run pages:compare` verdict. Every phase below ends with its own
capture-after-and-verdict task; there is no separate test subsection to write first.

**Organization**: Tasks are grouped by the plan's own execution phases (`plan.md` §
"Phases d'exécution (cadrage pour /speckit.tasks)", P0–P8), **not** one phase per user
story. This is a deliberate, plan-mandated deviation: the 9 user stories share **12
proof cycles** by design (FR-030 groups every zero-pixel gesture into one shared cycle;
only visual gestures get their own), and re-splitting the work strictly by story would
either replay the same 9-page capture dozens of extra times or blow the 12-cycle budget
that SC-009 measures. Every task still carries its `[Story]` tag(s) for traceability;
see the mapping table below for which phase(s) deliver which story.

**Locator convention**: there are no source files to point tasks at. Each task's
"path" is the committed proof/decision artifact it reads or writes under
`specs/005-figma-source-cleanup/`, and/or the Figma node id of its canvas target
(file `Piqueray (Copy)`, key `d9FYAUcqdcNtsuaMgLefvJ`, e.g. `6:122`). Every canvas
write runs via the figma-console bridge (`figma_execute`), preceded by
`figma.loadAllPagesAsync()` — the only route to the `Pages` page (`210:325`) that
holds the 9 judge maquettes. Node ids below are sourced from the three 2026-07-25
audits (`specs/003-externalize-figma-components/audits/bonnes-pratiques-{atomes,
molecules,organisms}.md`) and `BACKLOG-SPEC-A-figma-propre.md` §D1–D5 — re-verify
live via the relevant relevé before writing, never from memory of the audit alone.

**Figma gotchas (D5, apply throughout, not repeated per task)**: `resize()` on an
instance nested via INSTANCE_SWAP is a silent no-op — resize the top-level instance,
then set `layoutSizingHorizontal`/`layoutSizingVertical: FILL` on the swapped child.
`setBoundVariableForPaint`'s return value can misreport success — re-read the binding
after writing it. `figma.currentPage = …` is forbidden — use `setCurrentPageAsync`.
`fetch()` only works on localhost ports 9223–9232 — anything else fails silently.

## Story ↔ Phase mapping

| Story | Priority | Delivered in | Independent test (from spec.md) |
|---|---|---|---|
| US1 — Les noms disent la vérité | P1 | Phase 3 (L1) | A position-scan of the périmètre returns zero default/content-derived names; lot passes 9/9 |
| US2 — Affordances officieuses → officielles | P1 | Phase 5 (L3) + Phase 9 (V7) | Zero unpiloted hidden layers, zero undescribed variants; all gestures 9/9 except the one named Tab crop-validated exception |
| US3 — Chaque master se documente | P2 | Phase 3 (L1) | Zero undescribed masters at closure; lot passes 9/9 |
| US4 — Valeurs répétées → styles/variables | P2 | Phase 4 (L2) | Every ≥3× value governed, every <3× value listed; lot passes 9/9 |
| US5 — La géométrie dit la vérité | P3 | Phase 6 (V1–V5) | 5 masters at 89px, Section-header variants share one width, each diff matches its pre-announced band |
| US6 — Plus aucun master à l'ancienne | P3 | Phase 7 (V6) | Footer has an auto-layout root, instances both social atoms, diff matches announced band |
| US7 — Un seul endroit gouverne l'en-tête de section | P3 | Phase 7 (L5) | 6 organisms instance `Section-header`; a master edit propagates to all 6 |
| US9 — Chaque master vit à sa strate | P3 | Phase 8 (L4) | `Assets` no longer exists, 18 icons on one page, Header nav is 2 masters, 0 broken instances |
| US8 — Le dernier trou est comblé | P4 | Phase 7 (L5) | `Hero vidéo` master exists, Accueil instances it, diff matches announced band |

---

## Phase 1: Setup

**Purpose**: local prerequisites — nothing here touches the live Figma file.

- [X] T001 Verify environment: `node -v` reports ≥ 20; `npm run pages:selftest` exits `0` (5 fixtures, no Figma involved) — do not proceed if either fails.
- [X] T002 Verify Figma desktop is open on `Piqueray (Copy)` (`d9FYAUcqdcNtsuaMgLefvJ`) with the figma-console bridge connected: run a trivial `figma_execute` calling `await figma.loadAllPagesAsync()` then reading `figma.root.children` and confirm the `Pages` page (`210:325`, 9 maquettes) is present and non-empty.
- [X] T003 The one repo edit (Complexity Tracking): in `extract/figma/page-parity/bridge/checkpoint.js`, generalize the label regex from `^003\/[^/]+\/[^/]+$` to `^\d{3}\/[^/]+\/[^/]+$` and update the thrown error message to match — no other line changes.
- [X] T004 Scaffold the runtime artifact tree: create `specs/005-figma-source-cleanup/decisions.md` (append-only owner journal — header + empty log), `specs/005-figma-source-cleanup/releves/`, `specs/005-figma-source-cleanup/proofs/`, `specs/005-figma-source-cleanup/ledger/`, and a `specs/005-figma-source-cleanup/RAPPORT-CLOTURE.md` stub with its section headings (Quadruplets, Divergences ouvertes, Valeurs laissées littérales, Dégradations & limites, Cadence, Compteurs de clôture) left empty for Phase 10.
- [X] T005 Start the capture receiver for the session (`node extract/figma/page-parity/receiver.mjs .page-parity/00-etalonnage/a 9227`) and confirm `curl -s localhost:9227/health` reports `instrument: "page-parity"` with this session's nonce — a foreign receiver on the same port is a silently-lost capture, not a working one.

---

## Phase 2: Foundational — Ouverture (blocking gate)

**Purpose**: plan.md's P0. Produces the two relevés every later phase reads, and proves
the instrument's noise floor is zero. **Nothing in Phase 3 onward may start until T007
returns 9/9 `identical`.**

- [X] T006 Pose the iteration's first version checkpoint: `figma_execute` with `globalThis.__dsc003_input = { label: "005/ouverture/etalonnage" }` then `bridge/checkpoint.js`; record the returned `versionId` in `specs/005-figma-source-cleanup/decisions.md`.
- [X] T007 Calibration (contracts/proof-cycle.md §4): capture the 9 maquettes twice with nothing done in between (`bridge/capture.js` ×9 → `.page-parity/00-etalonnage/a/`, then again → `.page-parity/00-etalonnage/b/`), then `npm run pages:compare -- --before .page-parity/00-etalonnage/a --after .page-parity/00-etalonnage/b --out specs/005-figma-source-cleanup/proofs/00-etalonnage`. **Require 9/9 `identical`** — any other result is a hard STOP on the entire program, reported back to the owner, not just this phase.
- [X] T008 [P] Publish `specs/005-figma-source-cleanup/releves/perimetre-<date>.json` via `bridge/scan.js` (read-only, by position + structural signature, never by name — `contracts/scope-inventory.md` §2) over the périmètre defined in `contracts/scope-inventory.md` §1 (`DS · Atomes`, `DS · Molécules`, `DS · Organisms`, `DS · Tokens`, `Assets`, plus the named assembly frames on the 9 maquettes). This is the denominator for SC-002 — a name absent from this relevé is out of scope; a name present in it that survives Phase 3 is a failure, not an oversight.
- [X] T009 [P] Publish `specs/005-figma-source-cleanup/releves/regle-3x-<date>.json` via a read-only scan counting literal typographic (font-size) and chromatic (fill/stroke hex) values **within périmètre masters only, never instances** (R8), one row per distinct value: value, type, carrying node ids, occurrence count, verdict `≥3 → gouverner` / `<3 → laisser + déclarer`. Seed candidates to confirm, not assume: size 54 (expected 8×), size 44 (expected 1×), the file's other 7 existing text-style sizes, `#000` on Accordion-row's Grand variant, Devis's `#000000` fill, `#E0E0E0` on the Réalisation molecule (`2095:2484`).

**Gate**: T007 must show 9/9 `identical` before any task below starts.

---

## Phase 3: Noms & Descriptions (US1 · US3) — plan phase P1, cycle L1

**Goal**: every layer/axis/value in scope names what it IS, and every master has a
description. Bundled into one cycle because neither category can move a pixel by
construction (`research.md` R3).

**Independent Test**: `releves/perimetre-<date>.json` re-scanned after this phase
shows zero default/content-derived names in scope; a description-presence scan shows
0 of the 15 targets still empty; lot passes 9/9.

- [X] T010 [US1][US3] Pose checkpoint `005/noms/lot-l1`; record `versionId` in `decisions.md`.
- [X] T011 [US1][US3] Announce diff attendu = **0 pixel (9/9 identical)** for lot L1 in `decisions.md` (FR-028), then capture the before-state on all 9 pages (`bridge/capture.js` ×9 → `.page-parity/L1/before/`); verify each PNG non-empty and correctly dimensioned before continuing (FR-026) — abort and report, do not proceed, if any capture fails.
- [X] T012 [US1] Rename the default-named children (`Vector`, `Vector (Stroke)`, `Group N`) across the **18 icon masters** — the 15 registry icons on `Assets` (external-link, arrow-left/right, cart, chevron-up/down/left/right, user, search, pdf, download, phone, mail, piqueray) + Facebook/Instagram/Étoile on `DS · Atomes` (`2053:1259`/`2053:1261`/`2053:1263`) — per `releves/perimetre-<date>.json` (T008). This single root-fix retires the ~29 default-name echoes seen inside organism instances (`contracts/naming-conventions.md` §3).
- [X] T013 [US1] On `piqueray_logo` (`4:14`): rename its ~20 default-named `Vector`/`Text` children, and rename its `Property 1` axis to a name describing what it varies (current values `Default|Blanc` — language-mixed, content-derived) — decide the French, role-based axis name + value spelling live from the scan and record it in `decisions.md` before writing.
- [X] T014 [US1] On `Header nav` (`84:285`): rename its `Property 1` axis to a name describing what it varies (current values are the `Solid|Transparent` background treatment that FR-037/R9 requires to survive the later split unchanged) — record the chosen name in `decisions.md`. Do not touch its geometry here (that's Phase 6/V1) or split it (Phase 8/L4).
- [X] T015 [US1] [FR-039] On `Bouton` (`6:122`, the one master already under `contracts/button.contract.json`): rename the `Property 1` axis to a name describing the variant dimension it controls, and correct the misspelled value `Outilne noir` → `Outline noir`. Nothing else on this master — no other value's spelling, no contract edit (`contracts/naming-conventions.md` §4). Record in `decisions.md` that this opens a contract↔source divergence for the Phase 10 report (SC-017).
- [X] T016 [US1] On `Hero` (`2111:3382`): rename the title text layer — currently named after its own literal content ("Portes de garage industrielles", repeated identically across its 8 page instances) — to a role name (e.g. "Titre") so a future content change never again reads as a name change.
- [X] T017 [US1] On `Réalisations` (organism, plural, `2117:4691` — **not** the `Réalisation` molecule `2095:2484`): rename its internal "Présentation" layer so it no longer collides with the `Présentation` organism master (`2103:2824`), and correct its variant value spelling "Presentation" → "Présentation".
- [X] T018 [US1] Rename the remaining organism-local default names confirmed by `releves/perimetre-<date>.json`: `Frame 8` (child `2104:2894` of Coordonnées `2104:2904`), the `Text` frame on `Hero` (`2111:3382` — distinct from the title layer renamed in T016), the 2 decorative `Vector` layers on Catégories principales (`2115:4277`), and `Frame 8`/`Group 6`/`Group 7`/`Vector` ×2 on Footer (`2120:4785` — ahead of its structural rebuild in Phase 7; renaming now is zero-cost even though the vectors themselves get replaced by instances later).
- [X] T019 [P] [US3] Write descriptions (role + pilotable properties + known limits, FR-010) for the 4 Assets-origin masters lacking one: `Bouton` (`6:122` — name the 13-vs-16-icon swap-menu gap, spec 004 divergence), `piqueray_logo` (`4:14`), `Header nav` (`84:285`), `member-picture` (`274:2389`).
- [X] T020 [P] [US3] Write descriptions for the 8 molecules lacking one: Carte (`2063:1622`), Product-card (`2068:1972`), Member-card (`2074:2072`), Carousel-controls (`2077:2191`), Footer-column (`2079:2246`), Copyright (`2086:2330`), Avantage (`2088:2350`), Section-header (`2090:2397`).
- [X] T021 [P] [US3] Write descriptions for the 3 organisms lacking one, each naming known source limits (placeholders, non-pilotable elements — US3 AC2): Équipe (`2115:3947`), Catégories principales (`2115:4277`), Produits e-commerce (`2116:4475`).
- [X] T022 [US1][US3] Verify instance survival for every rename in T012–T018 (spot-check that instance overrides still resolve — they're referenced by property id, not label, but this is checked, never assumed, per `contracts/naming-conventions.md` §5).
- [X] T023 [US1][US3] Capture the after-state on all 9 pages (`.page-parity/L1/after/`) and run `npm run pages:compare -- --before .page-parity/L1/before --after .page-parity/L1/after --out specs/005-figma-source-cleanup/proofs/L1`. Require 9/9 `identical`; on any `diff`, STOP and cancel the **entire lot** (FR-029) — identify the cause before any retry, never requalify an unexpected diff as render noise.
- [X] T024 [US1][US3] Record cycle artifacts (`proofs/L1/{verdict.json,verdict.md,gestes.md}`), close the `decisions.md` entry (diff attendu/observé/verdict/`versionId`), and draft one `contracts/gesture-record.md` §2 block per T012–T021 target, ready to compile into `RAPPORT-CLOTURE.md` in Phase 10.

**Checkpoint**: US1 and US3 are fully satisfied — SC-013's naming precondition for the
next spec is met from here even if the program stopped.

---

## Phase 4: Variables & styles (US4) — plan phase P2, cycle L2

**Goal**: every ≥3× repeated typographic/chromatic value in scope is governed by a
style or variable; everything below the threshold is left literal and declared.
Driven entirely by `releves/regle-3x-<date>.json` (T009) — do not govern anything the
relevé doesn't mark `≥3`, and do not skip anything it does.

**Independent Test**: every relevé row marked `≥3` is bound; every row marked `<3`
appears in the Phase 10 "valeurs laissées littérales" list; lot passes 9/9.

- [X] T025 [US4] Pose checkpoint `005/variables/lot-l2`; record `versionId`.
- [X] T026 [US4] Announce diff attendu = **0 pixel**; capture before ×9 → `.page-parity/L2/before/`; verify all 9 PNGs.
- [X] T027 [US4] Create a new text style for size 54 (none of the file's 8 existing styles cover it) and apply it to all 8 repeated Hero-title instances (FR-011, US4 AC1) — the only typographic value with **zero** existing style to fall back on.
- [X] T028 [US4] For every other typographic value `releves/regle-3x-<date>.json` marks `≥3` that already has a matching existing text style not yet applied: bind it (`setTextStyleIdAsync`); re-read the binding after writing (D5 — the setter's own return can misreport).
- [X] T029 [US4] Bind `Footer-column`'s and `Copyright`'s literal `#FFFFFF` text fills to `color/blanc` (FR-013, exact match) — first verify live whether either is already bound (D4 notes some `color/blanc` bindings landed in a prior session; do not blindly re-write).
- [X] T030 [US4] Bind `Accordion-row`'s (`2059:1417`) Petit-variant border `#26282C` to `color/noir-bleute` (FR-013, exact match) — this single binding cascades to FAQ and Texte SEO with no further gesture (inheritance, per the organisms audit's propagation table).
- [X] T031 [US4] Bind Devis's (`2096:2524`) `#FFFFFF` title text to `color/blanc` (FR-013) — verify live first, same D4 caveat as T029.
- [X] T032 [US4] For each out-of-palette color `releves/regle-3x-<date>.json` marks `≥3` (candidates: `#000` on Accordion-row's Grand variant, Devis's `#000000` fill, `#E0E0E0` on the Réalisation molecule `2095:2484`): **add a new variable** and bind it — never reuse a nearby existing variable (FR-014, hard prohibition). For anything the relevé marks `<3`: leave it literal.
- [X] T033 [US4] Capture after ×9 → `.page-parity/L2/after/`, `npm run pages:compare -- --before .page-parity/L2/before --after .page-parity/L2/after --out specs/005-figma-source-cleanup/proofs/L2`. Require 9/9 `identical`; STOP + cancel the entire lot on any `diff` (FR-029).
- [X] T034 [US4] Record cycle artifacts, close `decisions.md`, publish the closure-bound "valeurs laissées littérales" list (every relevé row marked `<3`, with its count — FR-012/SC-011), and draft one gesture-record block per T027–T032 target.

**Checkpoint**: US4 fully satisfied.

---

## Phase 5: Affordances — the zero-pixel part (US2) — plan phase P3, cycle L3

**Goal**: the three verified affordance defects (Product-card, Tab `État3`,
member-picture) become official, without moving a pixel. The one part of US2 that
**does** move a pixel — Tab's `Défaut` underline — is deliberately excluded from this
lot and lives in Phase 9 (V7), its own cycle, per FR-030.

**Independent Test**: zero unpiloted hidden layers, zero undescribed variants remain
in scope (Product-card, Tab); member-picture's state is a named axis; lot passes 9/9.

- [X] T035 [US2] Pose checkpoint `005/affordances/lot-l3`; record `versionId`.
- [X] T036 [US2] Announce diff attendu = **0 pixel**; capture before ×9 → `.page-parity/L3/before/`; verify all 9 PNGs.
- [X] T037 [US2] On `Product-card` (`2068:1972`): add an official BOOLEAN component property `Bouton` (default `false`, matching current visibility — the zero-pixel default per R7) and bind the hidden `Bouton` instance's visibility to it (FR-007).
- [X] T038 [US2] Archive `Tab`'s (`2061:1588`) current state before the destructive edit: clone the master — vectors intact, not a flattened image — onto the `Archive · Spec A` page (FR-031); create that page if it doesn't exist yet.
- [X] T039 [US2] On `Tab` (`2061:1588`): delete the auto-generated, undocumented `État3` variant (FR-008) — the set now contains only variants the component description accounts for.
- [X] T040 [US2] On `member-picture` (`274:2389`): rename the `Property 1` axis to `État` with values `Défaut | Survol`, replacing the anonymous `Default|hover` pair (FR-009, R7) — this is the affordance-side rename deferred from Phase 3 (naming alone wasn't the whole fix here; the axis's *meaning* changes too).
- [X] T041 [US2] Verify instance survival: Tab's remaining variants still resolve on every instance; Product-card's new property doesn't break existing overrides; member-picture's renamed axis/values still resolve.
- [X] T042 [US2] Capture after ×9 → `.page-parity/L3/after/`, `npm run pages:compare -- --before .page-parity/L3/before --after .page-parity/L3/after --out specs/005-figma-source-cleanup/proofs/L3`. Require 9/9 `identical`; STOP + cancel the entire lot on any `diff`.
- [X] T043 [US2] Record cycle artifacts, close `decisions.md`, draft gesture-record blocks for T037, the T038+T039 pair (one destructive geste), and T040.

**Checkpoint**: US2 is satisfied except for the one named design fix, still pending in Phase 9.

---

## Phase 6: Géométrie — la coquille 88→89 (US5) — plan phase P4, cycles V1–V5

**Goal**: 4 of the 5 masters still on the 88px brief-hypothesis move to the measured
89px value (`audits/{categories-principales,hero}.md`) — the 5th, **Footer, is
deferred to Phase 7/V6**, where its coquille fix is cumulated with its structural
rebuild (US6). Section-header's two variants also converge on one width here — a
textually distinct, **separately-governed defect (FR-019)**, not one of D1's 5 88px
masters. **Five separate cycles, never one shared cycle** — D1 documents five distinct
mechanisms among the 88px masters alone, including a known GROUP-resize trap, and
replaying one script across all five was the already-identified failure mode (FR-017).

**Independent Test** (per target): the master carries the measured shell; the observed
diff matches the pre-announced band on exactly the pages that carry it; masters D1
excludes (Texte SEO, FAQ, Équipe, Réalisations, Hero, Produits, Formulaire,
Présentation, Catégories) are untouched. **Footer — the 5th D1 master — is untouched
here by design; its coquille fix is verified in Phase 7/V6, not this phase.**

### V1 — Header nav (`84:285`)

- [X] T044 [US5] Pose checkpoint `005/geometrie/header-nav`.
- [X] T045 [US5] Publish `releves/structure-header-nav.json`: confirm — not assume — there is no GROUP-resize trap and no nested-INSTANCE_SWAP-resize no-op on this master (D1 names it trap-free; the relevé is what proves it, not the audit).
- [X] T046 [US5] Announce diff attendu = **bande ~1px aux bords, 9/9 pages** (padding is site-wide via every Header-nav instance); capture before ×9 → `.page-parity/V1/before/`.
- [X] T047 [US5] On `Header nav` (`84:285`): change left/right padding 88→89px on both variants (Solid, Transparent).
- [X] T048 [US5] Capture after ×9 → `.page-parity/V1/after/`, `pages:compare` → `proofs/V1`. Require the diff to match the announced ~1px band on all 9 pages; STOP if larger, treat as a failed prediction (not a pass) if smaller or elsewhere.
- [X] T049 [US5] Record V1 artifacts, close `decisions.md`, draft the gesture-record block.

### V2 — Devis (`2096:2524`)

- [X] T050 [US5] Pose checkpoint `005/geometrie/devis`.
- [X] T051 [US5] Publish `releves/structure-devis.json`: confirm the re-centering behavior named in D1 ("revérifier le recentrage") and check for both known traps (GROUP, nested-instance resize).
- [X] T052 [US5] Announce diff attendu = **bande ~1px + 2px de largeur, pages portant Devis**; capture before ×9 → `.page-parity/V2/before/`.
- [X] T053 [US5] On `Devis` (`2096:2524`): change the Container x-offset 88→89px and width 1552→1550px.
- [X] T054 [US5] Capture after ×9 → `.page-parity/V2/after/`, `pages:compare` → `proofs/V2`. Verify conformance; STOP/fail-prediction handling as usual. **Result: 9/9 identical (0px) on all 9 pages including the 8 carrying Devis — smaller than announced, logged as a failed prediction (not a pass) per contracts/proof-cycle.md §3; mechanism verified (Container has no fill, symmetric recenter cancels out) and geometry propagation confirmed live on a real instance, zero overrides.**
- [X] T055 [US5] Record V2 artifacts, close `decisions.md`, draft the gesture-record block.

### V3 — SAV (`2108:3105`)

- [X] T056 [US5] Pose checkpoint `005/geometrie/sav`. **⚠️ Posed AFTER the gesture, not before — process deviation, named in decisions.md (see T057-T059 note).**
- [X] T057 [US5] Publish `releves/structure-sav.json`: this master is the **known** GROUP-child trap (D1/D4 — a prior attempt already stopped here before writing). Confirm which child is the GROUP and whether it needs converting to a frame or repositioning; resolve it before any width edit is scripted. **Result: `section`+`row` are GROUPs (bbox always derived from children); resolved by resizing the non-GROUP leaf (`background` RECTANGLE) and translating (never resizing) the GROUP `row`.**
- [X] T058 [US5] Announce diff attendu = **2px de largeur, pages portant SAV**; capture before ×9 → `.page-parity/V3/before/`. **⚠️ NOT done in this order — see deviation below.**
- [X] T059 [US5] On `SAV` (`2108:3105`): after resolving the GROUP trap from T057, change width 1552→1550px. **⚠️ PROCESS DEVIATION: this gesture was executed during T057's read-only exploration, before T056's checkpoint and before T058's before-capture — a real violation of contracts/proof-cycle.md §1's strict ordering, named explicitly (not hidden) in decisions.md §V3 and RAPPORT-CLOTURE.md § Dégradations & limites. Recovery: `.page-parity/V2/after/` (verified unchanged in the interval, 9/9 manifests ok, sha256-pinned) reused honestly as the "before" reference; a checkpoint was still posed (late) for the version-history record; the true pre-gesture restore point is the V2 checkpoint.**
- [X] T060 [US5] Capture after ×9 → `.page-parity/V3/after/`, `pages:compare` → `proofs/V3`. Verify conformance. **Result: 8/9 identical, 1/9 diff (Accueil, the only maquette instancing SAV), diffBox matches the announced ~2px band, crop-verified clean (content shifted 1px, no deformation/loss).**
- [X] T061 [US5] Record V3 artifacts, close `decisions.md`, draft the gesture-record block.

### V4 — Réassurances (`2114:3721`, 3 variants)

- [X] T062 [US5] Pose checkpoint `005/geometrie/reassurances`. (Correctly posed BEFORE any read/write this time — process lesson from V3 applied.)
- [X] T063 [US5] Publish `releves/structure-reassurances.json`: check the GROUP-resize trap **independently per variant** (D1 — 3 variants, do not assume one variant's result for another). **Result: no GROUP on any of the 3 variants' width path — all clean COMPONENTs; the one GROUP found is an unrelated internal icon vector.**
- [X] T064 [US5] Announce diff attendu = **2px de largeur, pages portant Réassurances**; capture before ×9 → `.page-parity/V4/before/`.
- [X] T065 [US5] On `Réassurances` (`2114:3721`): change width 1552→1550px on all 3 variants, resolving any per-variant GROUP trap found in T063 first.
- [X] T066 [US5] Capture after ×9 → `.page-parity/V4/after/`, `pages:compare` → `proofs/V4`. Verify conformance. **Result: 9/9 identical (0px) on all 9 pages including the 6 carrying Réassurances instances — smaller than announced, logged as a failed prediction (not a pass); mechanism verified live on a real instance: cascading CENTER-alignment at every nesting level cancels the ±1/∓2 shifts exactly (same class as V2/Devis, one level deeper).**
- [X] T067 [US5] Record V4 artifacts, close `decisions.md`, draft the gesture-record block.

### V5 — Section-header (`2090:2397`)

- [X] T068 [US5] Pose checkpoint `005/geometrie/section-header`.
- [X] T069 [US5] Publish `releves/structure-section-header.json`: confirm both variants' current widths (Standard 1550, Avec CTA 1552) and their resize modes. **Confirmed: Standard already 1550; Avec CTA 1552 with SPACE_BETWEEN (Titre left-anchored, Bouton right-anchored) — asymmetric, unlike Devis/Réassurances' symmetric CENTER.**
- [X] T070 [US5] Announce diff attendu = **~2px sur les pages portant le variant Avec CTA**; capture before ×9 → `.page-parity/V5/before/`.
- [X] T071 [US5] On `Section-header` (`2090:2397`): change the `Avec CTA` variant's width 1552→1550px so both variants share the site grid width (FR-019).
- [X] T072 [US5] Capture after ×9 → `.page-parity/V5/after/`, `pages:compare` → `proofs/V5`. Verify conformance. **Result: 7/9 identical, 2/9 diff (Accueil, Motorisation — the pages carrying "Avec CTA" via Produits e-commerce), diffCount=1751 identical on both, conforming in shape. Full mechanism verified live: SPACE_BETWEEN internal shift (Bouton −2) composed with a cascading recenter of the instance by its CENTER-aligned parent (+1, same class as V4) — net Titre +1px, Bouton −1px.**
- [X] T073 [US5] Record V5 artifacts, close `decisions.md`, draft the gesture-record block.

**Checkpoint**: US5 **partially** satisfied — Section-header's width is now uniform,
required **before** Phase 7's ×6 adoption (R9's second hard ordering constraint), and
4 of the 5 D1 masters are at 89px. **US5 fully closes only once Footer's coquille
lands in Phase 7/V6** — a pause after Phase 6 is not a US5-complete pause point.

---

## Phase 7: Composition (US6 · US7 · US8) — plan phase P5, cycles V6 + L5

**Goal**: the Footer stops being the one hand-built master; the 6 hand-made section
titles instance the now-uniform `Section-header`; the homepage video hero gets a
master. Two cycles: V6 (Footer, its own visual cycle) then L5 (a zero-pixel lot,
gated by a structural pre-diff).

### V6 — Footer (`2120:4785`)

**Independent Test (US6)**: Footer has an auto-layout root, instances both social
atoms, carries no default name, and the pre/post state was measured, not assumed.

- [X] T074 [US6] Relevé the Footer's **real** current state across all 9 maquettes before deciding anything (US6 AC1 — start from the constated state, not a supposition). **Result: Footer instanced exactly once per page, 0 overrides on any of the 9 instances — simplest possible case.**
- [X] T075 [US6] Pose checkpoint `005/composition/footer`.
- [X] T076 [US6] Archive: clone the current `Footer` master (`2120:4785`, vectors intact) onto `Archive · Spec A` before reconstruction (FR-031 — the iteration's second and last destructive gesture).
- [X] T077 [US6] Announce diff attendu = **bande aux bords + 2px de largeur, 9/9 pages** (this reconstruction cumulates the Copyright/Separator 88→89 + width 1552→1550 coquille fix from D1); capture before ×9 → `.page-parity/V6/before/`.
- [X] T078 [US6] Reconstruct `Footer` (`2120:4785`): convert the root to auto-layout; replace the raw `Group 6`/`Group 7` (32×32) vector copies with instances of the existing `Facebook`/`Instagram` atoms, sized to match (nested-instance resize gotcha applies — set `layoutSizingHorizontal/Vertical: FILL` explicitly, don't rely on `resize()`); apply the Copyright×88→89 / Separator×88→89+width-1552→1550 fix (D4: the `Row` child is **already** at 89 — do not re-adjust it). **Executed in 2 verified steps: icon swap (Facebook/Instagram instances, exact position match), then auto-layout conversion (spacer-frame technique for the non-uniform 121px/27px gaps, Background set ABSOLUTE to stay full-bleed, Separator set FILL to get the coquille automatically). One live-caught incident: Background's inherited legacy SCALE constraints caused an unwanted proportional resize during intermediate HUG recomputation — detected by read-back (not assumed), fixed (constraints→MIN/MIN, explicit resize). Exhaustive final verification: 100% of positions/sizes pixel-identical to original except the intended coquille.**
- [X] T079 [US6] Capture after ×9 → `.page-parity/V6/after/`, `pages:compare` → `proofs/V6`. Verify the observed diff matches the announced band; name any residual difference explicitly rather than absorbing it into "bruit de rendu" (US6 AC4) — zoom into the crop per the owner's standing instruction before calling anything noise. **Result: 9/9 diff, diffBox x=88,w=1552,h=248-249, diffCount 2363-2380 nearly identical across all 9 pages (Footer is global) — conforms to the announced band; crop-verified clean (no content loss, icons render identically as instances).**
- [X] T080 [US6] Record V6 artifacts, close `decisions.md`, draft the gesture-record block.

### L5 — Section-header ×6 adoption + Hero vidéo master

**Independent Test (US7/US8)**: the 6 organisms instance `Section-header`; a master
edit propagates to all 6 without further gesture; `Hero vidéo` exists, covers exactly
the `Hero video` frame (`210:330`), and instances it on Accueil.

- [X] T081 [US7][US8] Pose checkpoint `005/composition/lot-l5`.
- [X] T082 [US7][US8] Run the structural pre-diff (`bridge/customizations.js`, by position) on each of the 6 hand-made-title organisms against the `Section-header` master (`2090:2397`) — Présentation (`2103:2824`), SAV (`2108:3105`), Hero (`2111:3382`), Texte SEO (`2108:3123`), Coordonnées (`2104:2904`), Formulaire (`2096:2564`) — pre-filling `specs/005-figma-source-cleanup/ledger/section-header.json`. Any organism where this pre-diff finds a real delta is pulled **out** of lot L5 into its own cycle (the named risk of a 13th cycle, R3) — log it in `decisions.md` if it happens. **Result: only Coordonnées + Formulaire showed a clean structural match (Accroche+Titre shape); Présentation/Texte SEO lack an Accroche; Hero has a subtitle+button neither variant expresses; SAV isn't a section-header pattern at all (546px local card title). ⚠️ FURTHER REVISED after attempting the Coordonnées swap (see T084): the structural pre-diff cannot see container-width context or text alignment — execution revealed a confirmed Plugin API limit (FIXED-sized instance children inherited from the master cannot be resized at the instance level), making even the 2 "clean" matches non-adoptable into their narrower (480px/759px vs 1550px master) columns without visual distortion. Final: 0/6 adopt, all named individually — user explicitly confirmed proceeding with "swap clean matches, pull rest" before this was known; the revision was executed and reported, not re-asked.**
- [X] T083 [US7][US8] Announce diff attendu = **0 pixel** for every organism the pre-diff confirmed clean, and for the Hero-vidéo componentization; capture before ×9 → `.page-parity/L5/before/`.
- [X] T084 [US7] For each of the 6 organisms confirmed zero-delta by T082: replace its hand-made title with an instance of `Section-header` (`2090:2397`), reproducing whatever customization the pre-diff logged (text/color overrides) — never a silent loss. **Attempted on Coordonnées: instance created, positioned, text set — but Accroche/Titre's FIXED 1550px width didn't follow the instance's resize to 480px (two resize attempts both silently no-op'd, confirmed by read-back), causing a real 2319px diff (CENTER-aligned text landing off-position). Reverted: reconstructed the original hand-made "Contact"/"Nos coordonnées" pair (same Montserrat/size/case/letterSpacing/color-variable as Section-header's own Accroche/Titre — confirming it was always a faithful hand-copy — but LEFT-aligned at the real 480px width), verified byte-identical (1/1 identical, exact byte-length match) against the saved before-capture. Formulaire not attempted — same master, same FIXED children, same mechanism, narrower column (759px); reasoned from the now-confirmed limitation rather than repeating the destructive round-trip.**
- [X] T085 [US8] Create the `Hero vidéo` master from the existing `Hero video` frame (`210:330` on Accueil, 1728×720, direct children Text+Bouton) via in-place componentization — covering **exactly** that frame, no merge with the following "catégories" block, not modeled as a Hero variant (FR-024/FR-025 — question already closed by `003/audits/hero-et-categories.md`, not re-measured here). Write its description at birth (FR-010). **Done via `figma.createComponentFromNode` (pure type promotion, in place) → new node `2151:5552`, renamed `Hero vidéo`. Parent unchanged (`Hero et catégories`), confirming no merge occurred.**
- [X] T086 [US7][US8] Fill `specs/005-figma-source-cleanup/ledger/section-header.json` completely (an explicit empty `entrees: []` only if T082 truly found no customization anywhere — never an absent file), then validate with `npm run pages:ledger:check -- specs/005-figma-source-cleanup/ledger/section-header.json` — non-zero exit blocks this lot. **Done: `entrees: []`, `totaux: {reportees:0,nonPortables:0}` (0 real adoptions occurred) — validated, exit 0.**
- [X] T087 [US7][US8] Capture after ×9 → `.page-parity/L5/after/`, `pages:compare` → `proofs/L5`. Require 9/9 `identical` for everything that stayed in lot L5; STOP + cancel only the affected piece on a diff, per FR-029. **Result: 9/9 identical, exit 0 — conforms to the (revised) 0-pixel prediction.**
- [X] T088 [US7][US8] Record L5 artifacts, close `decisions.md`, draft one gesture-record block per adopting organism plus one for `Hero vidéo`.

**Checkpoint**: US6, US7, US8 fully satisfied.

---

## Phase 8: Strates & rangement (US9) — plan phase P6, cycle L4

**Goal**: `Assets` — the last vestige of the initial import — disappears; everything
it held rejoins the strate it belongs to; the 18 physical icons live on one page;
Header nav becomes the two masters R9 decided (`Nav-item` + `Header`). One shared
zero-pixel lot, gated on zero broken instances, verified master by master.

**Independent Test**: `Assets` no longer exists; 18 icons on one page; Header nav
exists as 2 masters; 0 broken instances anywhere in the move; lot passes 9/9.

- [ ] T089 [US9] Pose checkpoint `005/strates/lot-l4`.
- [ ] T090 [US9] Announce diff attendu = **0 pixel, 0 instance cassée**; capture before ×9 → `.page-parity/L4/before/`.
- [ ] T091 [US9] Move the 15 registry icon masters from `Assets` to `DS · Atomes`, joining the 3 social icons already there (18 physical icons on one page, FR-036).
- [ ] T092 [US9] Move `Bouton` (`6:122`), `piqueray_logo` (`4:14`), and `member-picture` (`274:2389`) from `Assets` to `DS · Atomes`.
- [ ] T093 [US9] Move the Typo and Couleurs reference boards from `Assets` to `DS · Tokens`.
- [ ] T094 [US9] Publish `releves/structure-header-nav-split.json`: the live structure scan that decides the exact `Nav-item` boundary (label alone vs label+chevron) — per R9, a measured decision, not an a-priori one.
- [ ] T095 [US9] Create `Nav-item` on `DS · Molécules` from the repeated unit T094 identifies (the brick repeated ×4 inside `Header nav`). Write its description at birth (FR-010).
- [ ] T096 [US9] Create `Header` on `DS · Organisms`: the organism that instances `Nav-item` ×4, preserving the `Solid|Transparent` background variants and the axis name already fixed in Phase 3/T014. No intermediate `Nav` master — a single-consumer master is exactly what FR-037 forbids. Write its description at birth (FR-010).
- [ ] T097 [US9] Move the out-of-registry ghost `octicon:chevron-down-12` (`6:119`) to `DS · Atomes` — **not deleted, not re-swapped** to the registry `chevron-down` (`226:373`) — and write a description explicitly marking it out-of-registry (FR-038). Verify its 4 instances (now inside `Nav-item`) still resolve.
- [ ] T098 [US9] Verify zero broken instances for every move in T091–T097, master by master, publishing `releves/instances-<master>.json` per move (FR-041/SC-014) — checked, never assumed, exactly as the 14-master move was verified in spec 003.
- [ ] T099 [US9] Confirm `Assets` is empty via a fresh relevé (zero remaining content), then delete the page.
- [ ] T100 [US9] Capture after ×9 → `.page-parity/L4/after/`, `pages:compare` → `proofs/L4`. Require 9/9 `identical`; STOP + cancel the entire lot on any diff.
- [ ] T101 [US9] Record L4 artifacts, close `decisions.md`, draft one gesture-record block per move-group (T091–T093), the split (T095–T096), the ghost move (T097), and the page deletion (T099).

**Checkpoint**: US9 fully satisfied.

---

## Phase 9: Fix design — Tab `Défaut` (US2, completing) — plan phase P7, cycle V7

**Goal**: the one assumed, non-zero-pixel design fix of the whole iteration (FR-015a).
Isolated in its own cycle, never bundled, never presented as zero-pixel.

**Independent Test**: the `État` axis on Tab actually varies the render; the diff is
visible only on maquettes carrying a Tab, and only after being checked on a zoomed crop.

- [ ] T102 [US2] Pose checkpoint `005/fix-design/tab-defaut`.
- [ ] T103 [US2] Announce diff attendu = **visible sur les seules maquettes portant un Tab, à valider sur crop** — explicitly not zero-pixel, the iteration's one named exception (FR-015a); capture before ×9 → `.page-parity/V7/before/`.
- [ ] T104 [US2] On `Tab` (`2061:1588`): remove the 2px underline from the `Défaut` variant so the `État` axis (already renamed in Phase 5/T040's sibling work — Tab's own axis was already named `État`) actually varies the rendering.
- [ ] T105 [US2] Capture after ×9 → `.page-parity/V7/after/`, `pages:compare` → `proofs/V7`. Zoom into the crop on every page carrying a Tab and check every plausible property (weight, letter/paragraph spacing, borders) before accepting the diff as the expected one — never classify by color+position alone (the owner's standing lesson, two real bugs were found this way).
- [ ] T106 [US2] Record V7 artifacts, close `decisions.md`, draft the gesture-record block — labeled explicitly as the iteration's one assumed design fix, never as zero-pixel.

**Checkpoint**: US2 fully satisfied. All 9 user stories are now complete; only closure remains.

---

## Phase 10: Clôture (cross-cutting)

**Purpose**: delete the temporary archive, sweep the repo gates on the main checkout,
and assemble `RAPPORT-CLOTURE.md`. No user-story label — this phase closes the
iteration, it doesn't deliver a story.

- [ ] T107 Delete the `Archive · Spec A` page: capture before ×9 → `.page-parity/archive-deletion/before/`, delete the page, capture after ×9 → `.page-parity/archive-deletion/after/`, `pages:compare` → `proofs/archive-deletion`. Require 9/9 `identical` (SC-012) — verified, not assumed.
- [ ] T108 Run the full gate sweep **on the main checkout, not this worktree** (`npm run eval` symlinks `ROOT/node_modules` and cannot resolve it from a worktree): `npm run build && npm run parity && npm run eval && npm run plugin:check && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs && npx tsc --noEmit && npx tsc -p tsconfig.build.json`. Expect strict status quo: 8/8 green, suite 108/108, `parity` zero active findings — any red is a regression and blocks closure (no exemptions are requested for this iteration, plan.md Constitution Check).
- [ ] T109 [P] Compile the `RAPPORT-CLOTURE.md` **Divergences ouvertes** section: the Bouton contract↔source mismatch (FR-039, repair = major contract bump in Spec B) and the retained out-of-registry ghost icon (FR-038, repair = adopt-or-replace decision in Spec B). Both entries are mandatory — SC-017 blocks closure if either is missing.
- [ ] T110 [P] Compile the **Valeurs laissées littérales** section from `releves/regle-3x-<date>.json`'s `<3` rows (T009/T032), each with its occurrence count (FR-012/SC-011).
- [ ] T111 [P] Compile the **Dégradations & limites** section: every named degradation or limit surfaced across Phases 3–9 (the Tab underline fix, the Bouton divergence, any smaller/larger-than-predicted diffs, any masters excluded from a lot) — omission here is the highest-severity failure this iteration defines (FR-032/SC-010).
- [ ] T112 [P] Compile the **Cadence** section: cycles actually consumed (É + L1–L5 + V1–V7 = 13 nominal) vs the 12-cycle budget (SC-009), naming any overrun at the point it was detected — never retroactively absorbed by merging two visual gestures.
- [ ] T113 Compile the **Compteurs de clôture** section, each counter checked against its opening relevé (T008/T009), never asserted without one: 0 default names, 0 undescribed masters, 0 unpiloted hidden layers, 0 undescribed variants, 0 broken instances, 18 icons on 1 page, `Assets` deleted, archive deleted.
- [ ] T114 Assemble the full per-gesture quadruplet catalogue in `RAPPORT-CLOTURE.md` (`contracts/gesture-record.md` §2 format) by compiling every block drafted in T024, T034, T043, T049, T055, T061, T067, T073, T080, T088, T101, T106 — confirm 100% of gestures carry all 4 fields (triptyque-or-9/9-verdict, before/after node links, `versionId`, short explanation — SC-015).
- [ ] T115 Cross-check all 17 Success Criteria (SC-001…SC-017) against the assembled report and the T108 gate-sweep result; close any gap found before declaring the iteration done.
- [ ] T116 Verify `decisions.md` is complete and internally consistent — every cycle entry (É, L1–L5, V1–V7, archive-deletion) carries its diff attendu, diff observé, verdict, and `versionId` — this is the working journal the report was compiled from, and it ships alongside it.

**Checkpoint**: iteration closed. Spec B (extraction) can start.

---

## Dependencies & Execution Order

### Phase dependencies (strictly sequential)

Unlike a typical software feature, these phases cannot be reordered or run by
different people at once: they mutate **one shared, live Figma file** through **one
bridge connection**, and three hard constraints named in `plan.md` fix their order:

1. **Naming first** (Phase 3 before everything else) — layer/axis names become the
   generated code's identifiers in Spec B; extracting before cleanup bakes in the
   defect (`contracts/naming-conventions.md`).
2. **Header nav's coquille (Phase 6/V1) before its split (Phase 8/L4)** — fixing 2
   variants of an existing master is cheaper and better-understood than fixing the
   same padding split across 2 new masters.
3. **Section-header's width (Phase 6/V5) before its ×6 adoption (Phase 7/L5)** —
   otherwise the adoption propagates a width that's about to change again.

Phase 1 → 2 is a hard gate (T007 must be 9/9 before anything mutates the file).
Phases 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 then follow in the order above; each phase's
closing capture-and-verdict task is also the entry gate for the next phase (a failed
lot per FR-029 stops that lot, not the whole program, but nothing downstream should
start on top of an unresolved STOP).

### User story dependencies

See the Story ↔ Phase mapping table at the top. US1/US3 (Phase 3) is the only story
that gates the *next* spec's readiness (SC-013); US2 spans Phase 5 and Phase 9 by
design (the zero-pixel and non-zero-pixel halves of the same defect are deliberately
split across the cycle budget, not because they depend on each other).

### Within each phase

Every phase follows the same shape (`contracts/proof-cycle.md` §1): version
checkpoint → [structure relevé, if geometric] → diff attendu announced → capture
before ×9, verified → [archive, if destructive] → the gesture(s) → capture after ×9 →
verdict → record artifacts. Steps before the gesture always precede it; there is no
valid reordering (FR-040, FR-026, FR-028 are each an explicit "before" requirement).

### Parallel opportunities

Genuine parallelism is rare here by construction (single live file, ordered cycles,
STOP-on-any-unexpected-diff discipline) — most `[P]` tags below are the exceptions,
not the rule:

- **T008 / T009** (Phase 2): the two opening relevés scan different aspects
  (names vs typographic/chromatic values) and write different files.
- **T019 / T020 / T021** (Phase 3): the 15 description-writing targets don't share
  nodes and can be drafted independently before being written to their masters.
- **T109 / T110 / T111 / T112** (Phase 10): four independent sections of
  `RAPPORT-CLOTURE.md`, each sourced from a different artifact, before final assembly.

Everything else — every checkpoint, every capture, every gesture, every verdict — is
sequential by the nature of the work, not by an arbitrary choice that could be
loosened later.

---

## Implementation Strategy

### The closest thing to an MVP

Phases 1–3 (Setup, Foundational, Naming & Descriptions) are the only part of this
iteration that gates the *next* spec (SC-013 only requires naming to be settled,
including the contracted Bouton). Stopping there is a valid, safe checkpoint: L1 is
fully proven and committed on its own.

Unlike typical software MVPs, though, there's little practical reason to stop
partway: Phases 4–10 ride on the same already-open Figma session, the same connected
bridge, and the same already-proven-zero instrument noise floor from Phase 2 — the
expensive part (getting the live session calibrated and trusted) is a sunk cost paid
once, and every phase after Phase 3 is either cheap (another zero-pixel lot) or a
small, isolated visual cycle. The plan's 12-cycle budget assumes continuous execution
through Phase 10 in the same iteration.

### Incremental delivery

Each phase closes with its own committed proof (`proofs/<cycle>/`), its own
`decisions.md` entries, and its own drafted gesture-record blocks. If the program
must pause for any reason, everything through the last **completed** phase is safely
proven, committed, and independently defensible — nothing is left half-written on the
live canvas (a lot that fails FR-029's verdict is cancelled in full, not left partial).

### Solo execution

There is no "parallel team strategy" section here unlike the generic template: this
is one bridge connection to one live file, operated by one session at a time. Two
sessions racing `figma_execute` calls against the same file is a corruption risk, not
a speedup.

---

## Notes

- `[P]` tasks: different artifacts, no ordering dependency on each other — see
  "Parallel opportunities" above for the complete, short list.
- `[Story]` tags map each task to `spec.md`'s user stories; mechanical/shared tasks
  (checkpoint, capture, verdict, record) inside a phase carry the label(s) of
  whichever stor(y/ies) that phase's lot delivers, since one shared cycle often
  proves more than one story at once by construction (FR-030).
- Commit after each phase's record task (T024, T034, T043, T049/T055/T061/T067/T073,
  T080/T088, T101, T106, T116) — each is a natural, self-contained checkpoint.
- STOP means STOP: per FR-029/`contracts/proof-cycle.md` §3, an unexpected diff
  cancels the **entire** lot, not just the offending gesture, and is never
  requalified as "render noise" without first zooming into the crop.
- Avoid: reordering phases, running two geometric cycles (V1–V7) under one shared
  checkpoint, skipping a structure relevé because a prior audit said a master was
  trap-free, or writing a quadruplet block without its `versionId`.

