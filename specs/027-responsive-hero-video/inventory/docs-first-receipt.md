# Docs-First receipt — HeroVideo responsive

**Feature:** `027-responsive-hero-video`  
**Recorded:** 2026-08-25T15:29:26Z  
**Scope:** Phase 1 foundations only; this receipt does not approve a composition or a Figma mutation.

## Retrieval status

The governing instruction calls for Auggie (`codebase-retrieval` / `information_request`). No Auggie MCP tool is exposed in this session, so no Auggie query can honestly be claimed. The owner explicitly waived Auggie for this read-only file-research pass on 2026-08-25 (“auggie raf pr le moment c du search file no stress”). The local, versioned sources below were therefore read directly. Their answers are recorded verbatim where they govern the Phase 1–2 tools; future authoring still requires a fresh live audit and the human gates H1–H4.

## Consulted sources and governing answers

| Source | Question | Governing answer used | Applicability |
| --- | --- | --- | --- |
| `docs/handoff/03-determinism.md` | What makes a new feature tool acceptable? | “The contract→surface pipeline MUST be pure functions” and a second run must be byte-identical. | Validators are deterministic local CLI tools and make no Figma or Page write. |
| `docs/handoff/06-tooling.md` | Which existing evidence routes may Phase 1 rely on? | `figma-console` is the read/capture transport; generated tooling and quality gates remain the source of executable proof. | The campaign records receipt destinations only; it does not replace the controlled bridge. |
| `docs/responsive-figma.md` | Which Figma mechanism is allowed for each type of change? | “Le composant garde le même design… Auto Layout”; changed values use modes; a real organisation change uses variants. | Fixtures and later decisions distinguish compact, desktop and wide without inventing a Tablet composition. |
| `docs/responsive-figma.md` | Can Design resize itself through the runtime breakpoints? | “le redimensionnement du frame ne change pas automatiquement … le mode … [ni] le variant responsive.” | Figma witnesses are explicit references, not a claim that resizing switches variants. |
| `docs/FIGMA-CAPABILITY-MATRIX.md` §1, §10 | Which responsive code facts can be projected faithfully? | `@media`, `@container`, and `@supports` are “CARRY-CODE-ONLY”; the canvas annotation is “Responsive behavior lives in code. This canvas shows the base layout only.” | The ledger must preserve the named limitation and never infer a Figma breakpoint. |
| `docs/FIGMA-CAPABILITY-MATRIX.md` §1, image-preservation addendum | How are layout, media, and protected imagery handled? | Auto Layout, Fill/Hug/Fixed and `ImagePaint` are expressible; a paint with nowhere to land must refuse before removal. | The campaign protects the historical master/key, nested Button, poster and Home override route. |
| `docs/figma-contrat-html-odoo.md` | What is the source-of-truth direction? | “Le contrat est la référence commune.” | Phase 1 creates no side-sync and Phase 2 validators keep the eventual contract/ledger evidence vocabulary. |
| `integrations/odoo/qa/run.mts` and `integrations/odoo/` QA material | What may qualify Odoo later? | The editor must be an `Editor and Designer`, never an administrator; public and editor evidence are distinct. | The ledger validator requires explicit Odoo qualification rather than accepting a generic browser result. |

## Settled implementation constraints

1. The three runtime compositions are exactly `compact`, `desktop`, and `wide`; Tablet 834 is a compact witness, never a fourth composition.
2. The browser profile is mobile-first: compact `<992`, desktop `992–1399`, wide `>=1400`; the witness widths remain 390, 834, 1200, and 1728.
3. The historical wide member (`2151:5552`, key `36011e51b8bc0b221a1ba6f9108709b5bd1c4490`) and Home instance (`2170:6351`) are protected facts, not replaceable names.
4. The Phase 1 campaign is single-writer, forbids direct Page writes, and exposes only one generated operation guarded by an approved H2 decision; its concrete approved changes are completed in T021.
5. Before any Figma-source mutation, the fresh captures and gate receipts—not this receipt or historical evidence—remain mandatory.
