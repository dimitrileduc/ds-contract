# Step-0 Audit — Icon Source (masters + usage), Piqueray (Copy)

**Feature**: 002-governed-icons-button | **Date measured**: 2026-07-23
**File**: `d9FYAUcqdcNtsuaMgLefvJ` ("Piqueray (Copy)") | **Icons zone**: `6:111` ("Icônes" SECTION, frame `27:67` "Icones")
**Status**: measured, awaiting owner arbitration on named anomalies (T014) and owner sign-off (T015 — GATE). **No contract or registry file exists in git at this point.**

This report is produced by the tooling built in Phase 2 (`extract/figma/audit/` positional scan, `extract/figma/state-photo/` page photography), run live against the real file — not asserted, measured. Every count below is reproducible from the committed artifacts named in each section.

---

## 1. Masters audit (T005) — 15 icon masters in zone `6:111`

| # | id | name | size | constraints | description | fill binding | remote |
|---|---|---|---|---|---|---|---|
| 1 | `274:2934` | `icon:piqueray` | 32×32 | MIN/MIN | — | bound (`color/noir-bleute`) | false |
| 2 | `263:2125` | `iconoir:mail` | 32×32 | MIN/MIN | — | **UNBOUND** (`#000000` hardcoded, 2 nodes: `263:2126`, `263:2127`) | false |
| 3 | `263:2120` | `f7:phone` | 32×32 | MIN/MIN | — | bound (`color/noir-bleute`) | false |
| 4 | `230:599` | `tabler:download` | 32×32 | MIN/MIN | — | bound (`color/noir-bleute`) | false |
| 5 | `230:585` | `hugeicons:pdf-02` | 32×32 | MIN/MIN | — | bound (`color/noir-bleute`) | false |
| 6 | `95:252` | `iconamoon:search` | 32×32 | MIN/MIN | — | bound (`color/noir-bleute`) | false |
| 7 | `95:216` | `solar:user-broken` | 32×32 | MIN/MIN | — | bound (`color/noir-bleute`) | false |
| 8 | `27:86` | `lucide:chevron-right` | 32×32 | MIN/MIN | — | bound (`color/noir-bleute`) | false |
| 9 | `27:83` | `lucide:chevron-left` | 32×32 | MIN/MIN | — | bound (`color/noir-bleute`) | false |
| 10 | `226:373` | `lucide:chevron-down` | 32×32 | MIN/MIN | — | bound (`color/noir-bleute`) | false |
| 11 | `226:374` | `lucide:chevron-up` | 32×32 | MIN/MIN | — | bound (`color/noir-bleute`) | false |
| 12 | `27:70` | `mynaui:cart` | 32×32 | MIN/MIN | — | bound (`color/noir-bleute`) | false |
| 13 | `6:104` | `cil:arrow-right` | 20×20 | MIN/MIN | — | bound (`color/noir-bleute`) | false |
| 14 | `6:99` | `cil:arrow-left` | 20×20 | MIN/MIN | — | bound (`color/noir-bleute`) | false |
| 15 | `9:185` | `tabler:external-link` | 32×32 | MIN/MIN | — | bound (`color/noir-bleute`) | false |

**Sizes**: 13 masters at 32×32, 2 (the arrows) at 20×20 — both sizes are the design as documented (FR-005), never harmonized.

**Variable bindings + TYPES** (the 001 nav-state lesson: check the TYPE, not just presence): every bound fill resolves to `color/noir-bleute` in the `Primitives` collection, `resolvedType: "COLOR"` — no STRING-typed variable found bound where a color is expected. **Clean.**

**`figma_lint_design` findings** (39 nodes scanned, zone `6:111`):
- `hardcoded-color` ×2 — `263:2126`, `263:2127` (both `iconoir:mail`'s vectors, `#000000`) — **is cleanup item (a).**
- `default-name` ×7 — internal child nodes with generic Figma names (`Group`, `Group 2`, `Vector`) inside several masters. Not one of the 4 decided items; **named here as an anomaly** (§4).
- 0 critical, 0 accessibility findings.

### Discrepancies vs. the spec's assumptions (measured, not invented)

- **Constraints**: the spec's cleanup item (b) says "4 masters lacking scale rules." **Live measurement: all 15 already have `{horizontal: MIN, vertical: MIN}` constraints.** Either this was already fixed before this session, or "scale rules" refers to something more specific than base constraints (e.g. a resize-behavior setting not exposed by this check). **Flagged for owner arbitration — see §4.**
- **Descriptions**: **confirmed absent on all 15** — matches cleanup item (c) exactly. No discrepancy.

---

## 2. Usage audit by POSITION (T006) — all 9 pages, re-measured

**Tooling**: `extract/figma/audit/{walk-code.ts,assemble.ts}` (built + live-verified in Phase 2). Committed artifact: [`extract/figma/audit/step-0-usage-scan.json`](../../extract/figma/audit/step-0-usage-scan.json). Walked by POSITION (child-index path from each page frame), never by name — `nodeId` recorded as the stable cross-run identity.

| Page | node id | instances scanned |
|---|---|---|
| Accueil | `210:326` | 52 |
| À Propos | `258:1887` | 45 |
| Motorisation | `237:705` | 53 |
| Portes de garage industrielles | `387:720` | 38 |
| Portes de garage résidentielles | `230:376` | 37 |
| Portes de garage | `226:112` | 28 |
| Portes d'entrée | `237:969` | 40 |
| Dépannage/SAV | `249:1510` | 35 |
| Contactez-nous | `274:2464` | 34 |
| **Total** | | **362** |

### Re-measured session counts — **these are now authoritative** (FR-019)

| Metric | Prior documented count | Re-measured (this scan) |
|---|---|---|
| Pages | 9 | 9 (confirmed, same set) |
| Button instances | *(not previously counted directly)* | **77** |
| Text overrides (≠ "Contactez-nous") | 43 | **43 — exact match** |
| Glyph overrides (icon ≠ default arrow) | 26 | **29** (see breakdown below) |
| Icon-master instances (the 15 governed icons only) | 268 | **224** (see §2.1 — the "268" figure could not be reproduced; treat 224 as authoritative pending owner review) |
| Third-party (remote) components in use anywhere on the 9 pages | *(assumed: 1, "the external chevron")* | **0 — SC-007 already satisfied, see §4** |

**Glyph overrides, detail**: 29 Button instances carry a non-default icon on at least one side, drawing from **7 distinct governed icons**: `chevron-down` (226:373), `cart` (27:70), `chevron-left` (27:83), `chevron-right` (27:86), `phone` (263:2120), `pdf-02` (230:585), `download` (230:599). Every chosen glyph resolves inside the 15 known masters — no unknown/ungoverned icon chosen on any Button instance.

### 2.1 — Icon census (all instances of the 15 governed masters, file-wide)

| icon | key | count |
|---|---|---|
| `cil:arrow-right` | `192ed18b…` | 66 |
| `cil:arrow-left` | `8a405ce4…` | 51 |
| `lucide:chevron-down` | `260b884e…` | 26 |
| `mynaui:cart` | `4583f597…` | 17 |
| `lucide:chevron-up` | `621b6b36…` | 12 |
| `hugeicons:pdf-02` | `ccc8dd83…`* | 12 |
| `tabler:download` | `ff3fb6e1…` | 10 |
| `iconamoon:search` | — | 9 |
| `solar:user-broken` | — | 9 |
| `lucide:chevron-left` | `ccc8dd83…` | 4 |
| `icon:piqueray` | — | 4 |
| `lucide:chevron-right` | `57edb362…` | 2 |
| `f7:phone` | — | 2 |
| `iconoir:mail` | — | **0** |
| `tabler:external-link` | — | **0** |

*(key columns are best-effort cross-references from the Button set's `preferredValues`; the registry proposal at Step 1 will re-derive these from the icons zone directly.)*

**Sum: 224.** Two governed masters (`iconoir:mail`, `tabler:external-link`) have **zero live instances** anywhere on the 9 pages today — informational, not a defect (a governed icon does not need an existing usage to be valid).

### 2.2 — False positives filtered out of the raw scan (named, not silently dropped)

The raw walk records every INSTANCE, generically. Four component identities showed up in the raw pass that are **not** icons and are excluded from the count above — each verified by inspecting its actual parent context:

| id | raw label | what it actually is |
|---|---|---|
| `4:15` | "Property 1=Blanc" | `piqueray_logo` component set (`4:14`) — the site logo, white variant |
| `274:2388` | "Property 1=Default" | `member-picture` component set (`274:2389`) — team-photo placeholder, seen on "À Propos" |
| `84:286` | "Property 1=Transparent" | `Header nav` component set (`84:285`) — the site's navigation bar |
| `6:119` | "octicon:chevron-down-12" | a chevron nested **inside** the `Header nav` instance (site nav dropdown indicator) — a real icon, but not part of the Button's governed menu and not a member of zone `6:111` |

None of these affect the Button or the icons-zone registry; recorded here purely so the 224 vs. 285 (raw) figures are reconciled honestly rather than silently different.

---

## 3. Before-photo (T007)

Captured via `extract/figma/state-photo/run.ts capture step0-before-cleanup --refresh` — fresh, pristine, taken before any cleanup edit. Manifest: `extract/figma/state-photo/out/snapshots/step0-before-cleanup.json` (gitignored — regenerable; the committed proof is the future `step0-before-cleanup-vs-*` compare report once cleanup items are applied).

---

## 4. Anomalies beyond the 4 decided items — owner arbitration (FR-003)

Per the source-cleanliness rule: every anomaly beyond items (a)–(d) is named here and arbitrated by the owner before any extraction, never silently fixed or modeled around. **Owner decisions recorded 2026-07-23:**

1. **SC-007 (zero third-party dependency) already satisfied.** Live measurement across all 362 instances on all 9 pages found zero `remote` components. **Decision: cleanup item (d) is not applicable — no swap performed.** The 8 vendor-style name prefixes were a naming-only anomaly (see #2).
2. **Vendor-prefix naming.** **Decision: rename all 15 masters to clean canonical ids** (owner: "on renomme clean"). **Applied and verified** — see §4a.
3. **Constraints already present on all 15.** **Decision: item (b) not applicable — no action.**
4. **7 `default-name` internal-child nodes.** **Decision: no action** (cosmetic, doesn't affect the 15 master-level names the registry reads).
5. **`mail` and `external-link`: zero live usages on any of the 9 pages.** **Decision: exclude both from `ds.icons` v1.0.0** (owner: "on prend pas si pas d'usage") — the registry governs **13** icons at adoption, not 15. The mail icon's color-binding fix (item a) is still applied regardless (owner: Option A — "on corrige quand même", file hygiene independent of current registry scope). Both masters remain in the file, available to join the registry later if used.
6. **Icon count discrepancy**: 224 (measured) vs. 268 (prior documented figure). Per FR-019 the re-measured count is authoritative.

### 4a. Application receipts

| Item | Action | Verified |
|---|---|---|
| (a) mail color | `figma_set_fills` on `263:2126` + `263:2127` → bound to `VariableID:5:40` (`color/noir-bleute`) | Re-read confirms `boundVariables.color` on both nodes; screenshot of zone `6:111` shows no visible defect |
| (b) constraints | not applicable (already present) | — |
| (c) descriptions | `figma_set_description` ×15, one per master (see table below) | Re-read of all 15 confirms description text matches exactly |
| (d) chevron swap | not applicable (no remote dependency found) | — |
| naming cleanup | `figma_rename_node` ×15 (vendor-prefixed → clean canonical, e.g. `cil:arrow-left` → `arrow-left`) | Re-read confirms all 15 names updated; rename response echoed `oldName`/`newName` per node |

**Descriptions applied** (all 15, verified by re-read):

| id | name (after rename) | description |
|---|---|---|
| `274:2934` | `piqueray` | Piqueray brand mark, used as a decorative icon. |
| `263:2125` | `mail` | Envelope icon — email / contact actions. |
| `263:2120` | `phone` | Phone handset icon — call / contact actions. |
| `230:599` | `download` | Downward arrow into a tray — download actions. |
| `230:585` | `pdf` | Document icon marked PDF — file download / document links. |
| `95:252` | `search` | Magnifying glass — search actions. |
| `95:216` | `user` | Person silhouette — account / profile actions. |
| `27:86` | `chevron-right` | Chevron pointing right — forward navigation, expand. |
| `27:83` | `chevron-left` | Chevron pointing left — back navigation. |
| `226:373` | `chevron-down` | Chevron pointing down — expand / dropdown indicator. |
| `226:374` | `chevron-up` | Chevron pointing up — collapse indicator. |
| `27:70` | `cart` | Shopping cart — add-to-cart / e-commerce actions. |
| `6:104` | `arrow-right` | Arrow pointing right — the Button's trailing icon default. |
| `6:99` | `arrow-left` | Arrow pointing left — the Button's leading icon default. |
| `9:185` | `external-link` | Arrow exiting a box — external link / opens in a new tab. |

**After-photo, measured (SC-003 — never by eye)**: `extract/figma/state-photo/run.ts capture step0-after-icon-cleanup --refresh`, compared against `step0-before-cleanup` → [`extract/figma/state-photo/reports/step0-before-cleanup-vs-step0-after-icon-cleanup.md`](../../extract/figma/state-photo/reports/step0-before-cleanup-vs-step0-after-icon-cleanup.md). **Result: all 9 pages at exactly 0.000% — zero residue, nothing to name or accept.** Confirms the prediction: renaming is metadata-only and `mail` has zero live placements (§2.1), so neither change could have moved a pixel.

## 5. Owner sign-off (⛔ GATE — T015)

- [x] Cleanup item (a) — mail icon color bound — **applied 2026-07-23**
- [x] Cleanup item (b) — scale rules — **not applicable, already present**
- [x] Cleanup item (c) — descriptions — **applied 2026-07-23**, all 15
- [x] Cleanup item (d) — external chevron — **not applicable, no remote dependency found**
- [x] Naming cleanup (anomaly #2) — **applied 2026-07-23**, all 15 renamed
- [x] Anomalies in §4 — arbitrated (owner decisions recorded above, 2026-07-23)
- [x] **Cleaned source validated** — **owner sign-off recorded 2026-07-23** ("Oui, je valide") — extraction may now proceed (Step 1).

**This report reflects the fully-applied, owner-validated Step-0 state.** Next: T016 (re-dump + visual `--refresh`), T017 (commit `step(0-source)`).
