# H1 — fresh baseline, historical delta and pre-existing defects

Status: `ready-for-owner-review`  
Fresh inspection: `2026-08-26T12:46:42.174Z`  
Pinned Figma version: `2391982289745917433` (`d9FYAUcqdcNtsuaMgLefvJ`)

This comparison is read-only. It does not reclassify any historical defect as
fixed, and it does not authorize work-frame or governed-source writes.

## Fresh baseline

| Surface | Fresh identity | Fresh structure | Historical comparison |
|---|---|---|---|
| Section | `CategoriesPrincipales` set `2115:4277`, key `94f64a369a5db615d68935bb353614eaaadbffc2` | `Style {Superpose, Empile} × Colonnes {2, 3}`; members `2115:4273`, `2115:4274`, `2115:4275`, `2495:7122`, with their keys recorded in the bridge proof | Agrees with the post-Gate-B source named by 023 |
| Card | `CarteCategorie` set `2495:6770`, key `0d1a03d07abf7225fb560b3d4163dd3575132c62` | `Style {Superpose, Empile}`; members `2495:6762` and `2495:6763`, with their keys recorded in the bridge proof | Agrees with the post-Gate-B extraction source named by 023 |
| Page usages | Seven instances on `Pages` `210:325` | IDs `2115:4392`, `2115:4278`, `2115:4438`, `2115:4297`, `2115:4411`, `2115:4324`, `2115:4364`; 6× two columns, 1× three columns; 2× Superpose, 5× Empile; 15 propagated cards | Count, positions and configurations agree with the governed 023 baseline |
| Card composers | 25 card instances in the whole file | 10 source-composer instances under section set `2115:4277`, 15 Page-propagated instances under the seven section usages, 0 other composer | Exclusivity condition is satisfied; the card remains in scope |

The fresh tree proof also records every current text, media paint, variable
binding, component property and override. It inventories 199 local numeric
variables, of which 171 are compatible candidates for the future responsive
study. H1 approves none of those candidates and creates no variable.

## Historical contradictions — return to H1

1. `plan.md`, `research.md` and `data-model.md` in 029 still cite historical
   `Carte/Categorie` `2063:1611` as the card source. Fresh whole-file inspection
   shows that node still exists as a standalone component but has **0 instances**.
   The governed live card is the post-Gate-B set `2495:6770`. This mismatch is
   therefore returned to H1: owner acceptance must explicitly establish
   `2495:6770` as the 029 target and leave `2063:1611` read-only and out of scope.
2. The 021 evidence describes the pre-cleanup composition through
   `2063:1611`; it is valid history, not the current topology. The 023
   post-Gate-B extraction evidence supersedes that topology for this campaign.
   Treating 021 as current would target the wrong component, so the distinction
   is returned to H1.

No second current composer and no usage drift were found. The contradictions are
not silently normalized in the planning artifacts; they become non-blocking only
if the owner accepts the fresh target and scope at H1.

## Pre-existing defects — named, never auto-fixed

- The section audit reports the existing presentation/container condition: the
  set is directly under a Figma `SECTION`, without a local auto-layout `FRAME`
  named `Container`, and the master is not width-FILL in such a container. This
  is consistent with the 023 Gate-B decision that the 89 px presentation margin
  lives in Page-side containers which are not transposed to Odoo. H1 proposes to
  keep this condition read-only; it is not authority to edit Pages.
- The card audit reports three source typography debts: missing links for raw
  typography matching `Titre 2 majuscules` and `Lead`, plus
  `TitreCategorie` without a documented style/rich-range decision. The section
  audit repeats those inherited findings through its card instances. H1 proposes
  to keep them as bounded, pre-existing debt; responsive typography remains an
  H2 decision and may only use the fields allowlisted by the 029 contract.
- Section exports use rendered bounds, which may differ slightly from layout
  bounds (for example the `2115:4273` export is 1634×468 while the node layout is
  1728×467.588). Both dimensions are recorded. This is an evidence-format fact,
  not proof of source drift.

## Write-boundary result

- `figmaWrites=[]`
- `pageWrites=[]`
- `childWrites=[]`
- Protected shared children remain read-only: `ArrowRight` `6:104`, Button
  member `9:206`/set `6:122`, `Pdf` `230:585` and `Download` `230:599`.

H1 acceptance would authorize only separate H2 work frames outside the governed
masters and outside `Pages`. It would not authorize a snapshot for application,
a master mutation, a Page write, or a shared-child write.

## Evidence

- `specs/component-repairs/categories-principales/run-001/audit.json`
- `specs/component-repairs/carte-categorie/run-001/audit.json`
- `specs/029-figma-responsive-categories/proofs/H1-bridge-read-only.json`
- `specs/029-figma-responsive-categories/inventory/H1-card-exclusivity.json`
- `specs/029-figma-responsive-categories/inventory/H1-usages.json`
- `specs/029-figma-responsive-categories/inventory/H1-primitives.json`
- `specs/029-figma-responsive-categories/proofs/H1-surface-manifest.json`
- `specs/023-categories-gouvernees/audits/releve-extraction.md`
- `specs/023-categories-gouvernees/proofs/gate-b.md`

