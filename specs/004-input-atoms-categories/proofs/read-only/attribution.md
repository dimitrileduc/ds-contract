# Read-only proof — version-history attribution (SC-004)

**Protocol** (read-only-proof.interface.md): a `GET /v1/files/:key/versions` baseline
was captured at T0 (before any Figma operation) and re-captured at closure (after the
last read). Every version created in between is attributed — an entry imputable to
**004** would be a guardrail failure.

- **Baseline HEAD** (`versions.before.json`, T009): `2379777882466444354` @ `2026-07-24T13:26:08Z`
- **Closure HEAD** (`versions.after.json`, T045): `2379819882953234742` @ `2026-07-24T16:23:22Z`
- **New versions in between: 25**

## Attribution — every new entry

| Count | Attributed to | Evidence |
|---|---|---|
| 24 | **003** (molecules/sections in progress) | labelled `003/<component>/<step>` — gallery-item, section-header, contact-info-row, copyright, footer-column, carousel-controls, member-card, product-card, carte (master + adoption steps) |
| 1 | **003** (editing auto-save) | the closure HEAD `2379819882953234742` @ 16:23:22 is unlabelled — a Figma auto-save during 003's active editing session (003 was on `DS · Molécules` throughout); not a named save |
| **0** | **004** | — |

## SC-004 — asserted

**Zero version entries are attributable to spec 004.** All 004 Figma operations were
**reads**, none of which version the file (Figma records only edits):

- REST dumps (`extract:figma:rest`) of the 4 atom masters + 3 icon masters + the
  checkbox vector node (`/nodes`) — external API, no session touch.
- REST SVG exports (`extract:figma:rest:svg`) of check/facebook/instagram/star.
- REST `/v1/files/:key/versions` (T0 baseline + this closure) and `/images` (visual
  gate renders).
- ONE read-only bridge inventory (`parity/extract-figma.plugin.js` via `figma_execute`)
  to refresh the parity snapshot — `loadAllPagesAsync` + `findAll` + property/variable
  reads only, zero mutation.

**No master of the 4 frozen atoms (FR-004) was edited** — their 25-version-window is
entirely 003's molecule/section work, the expected coexistence. The read-only guardrail
held for the whole iteration.
