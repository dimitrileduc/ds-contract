---
title: "Status — what does NOT work (failures, frontier, blind spots)"
doc_id: 08-status-what-doesnt-work
audience: "Another AI platform with ZERO prior knowledge of this project"
status: authoritative
last_updated: 2026-08-09
reading_order: 8
prerequisites: [07-status-what-works]
related: [10-history, 11-roadmap]
---

# What does NOT work (yet)

## Limites Odoo 019

- Aucun p95 de gestes Odoo n'est revendiqué : la performance est `non-measured` et reste une limite acceptée, pas un succès mesuré.
- La parité n'est pas pixel parfaite : Google Reviews diffère de 1.5961313885326982 % et Presentation de 2.6092857142857144 %. Les rapports attribuent le résidu d'anti-aliasing/métriques; ils ne le masquent pas par une tolérance choisie après mesure.
- Une structure sauvegardée dont le digest est ancien est signalée, jamais réécrite automatiquement par `-u`.

This is the most useful document for continuing the work. It is deliberately
blunt. Do not treat any of these as solved.

## 1. The composite Modal fails to render correctly on a live canvas — FRONTIER

The advanced exhibit `ds.composite-modal` passes every **headless** gate (anatomy
parity, both-journey round-trips), but when built **live** via the plugin on
2026-07-21 it had three real rendering defects. The mock validated the *anatomy*
but cannot *see* layout/text/props, so these passed 146 gates and only surfaced
live. Three distinct bugs:

1. **The dialog collapses to ~3px wide.** Multi-root auto-layout sizing: the
   dialog frame isn't establishing width, so it defaults to near-zero.
   Stretching the container reveals the content is all there — it's a sizing bug
   in the multi-root figma-script emit. **[open]**
2. **Repeated tag badges show the default "Badge", not the item text
   ("Shipping"/"Gift wrap"/"Priority").** The emitted `depProps` are *correct*
   (`{Label:"Shipping"}`) and `setInstanceProps` handles the `#`-suffixed
   property keys. The tell: the summary **Card is a single COMPONENT and its
   Title applied**; the **Badge is a COMPONENT_SET and its Label did not** — so
   the set-instance text-property wiring diverges from single-component wiring.
   **Pinning the exact break needs a live read of a tag instance's
   `componentProperties`** (requires the Desktop Bridge plugin open in the target
   file). **[open — needs live inspection]**
3. **Footer "Cancel"/"Save" render as bare, crammed text ("CancelSave"), no
   spacing.** Partly a *rough exhibit contract* (the composite authored native
   `<button>` elements with no gap token and no styling) and partly missing
   footer gap application. **[open — mix of contract-authoring + emitter]**

Owner's verdict (2026-07-21): the individual components are passes; **the
composite is a fail.**

## 2. The headless mock has blind spots — STRUCTURAL RISK

`scripts/plugin-engine-mock-figma.mjs` is faithful for structure but not for
rendering semantics. It let a real bug through (see #3 below) because it accepted
anything from `createNodeFromSvg`. It also cannot catch the composite's layout /
text-binding failures above, because it does not compute visual layout or reflect
component-property text on nodes. **Every time a bug is found live, the fix must
include teaching the mock to catch it headlessly** — otherwise the gates give
false confidence. This is a permanent discipline, not a one-off.

*The discipline has receipts beyond the demo era (update 2026-08-06, spec 016):
when the live canvas showed a height-0 separator landing at 2px, the mock was
taught Figma's INSIDE-stroke height clamp — at `resize` AND at weight pose —
and `evals/fixtures/zero-height-line-part-check.ts` now fails headlessly on
that class forever.*

## 3. A real emitter bug was found ONLY on the live canvas (now fixed, but note the pattern)

Stroke-based icons (`<svg fill="none" stroke="currentColor">`, e.g. the Button's
spinner, `close`) got a **second `fill` attribute injected on the `<svg>` tag**
— invalid XML that the real Figma `createNodeFromSvg` refuses ("Failed to convert
SVG file"). 146 headless gates missed it because the mock was lenient. **Fixed**
2026-07-21 (emitter skips fill-injection when the `<svg>` already has fill; mock
now validates SVG and rejects duplicate attributes). The pattern to remember:
**headless-green does not mean live-correct** for anything the mock renders
loosely.

## 4. Live delivery of the full emitter cannot be agent-driven — ARCHITECTURAL CONSTRAINT

You cannot get an AI agent to run the deterministic emitter on a live canvas. The
full build is ~288KB of interdependent scripts; `figma_execute` and `use_figma`
both cap at ~50KB per call and are stateless, and the agent cannot read/author
that payload (a ~22KB read cap compounds it). Sandbox `fetch` is blocked. This is
*why the plugin exists* — but it means the live path always requires the human to
run the plugin (or a stable Desktop Bridge for inspection). Do not burn time
trying to shuttle the emitter through an MCP; it is a dead end (proven
repeatedly).

*Partially expired (update 2026-08-06, spec 016): the **generated per-component
scripts** (`figma-sync/NN-*.js`) were delivered through the desktop bridge at
campaign scale, by serving them from a local HTTP server and evaluating them via
`figma_execute` — the async IIFE envelope must be reconstituted around the
served source (`specs/016-canvas-vrai/decisions.md` O-5;
`specs/016-canvas-vrai/tools/serve-scripts.mjs`; 21/22 masters regenerated and
bound through this route, then the last repaired — O-10, O-12). The per-call
size caps and statelessness stand, and the full ~288KB plugin build remains
human-run — what is dead is shuttling the emitter itself, not bridge delivery
of its generated output.*

## 5. The figma-console Desktop Bridge is unstable — ENVIRONMENTAL

It drops roughly every ~3 calls / on idle, and only connects to whichever file
has the Desktop Bridge plugin open. Live inspection of a specific file requires
the human to open that plugin there. Plan around it; don't rely on long live
sessions.

## 6. What happens to an image at regeneration? — ANSWERED, with one gap still open

*Added 2026-08-06 (spec 017). This package was **silent** on the subject that
carried the system's single worst measured gap: two occurrences of "photo" across
its twelve files, both narrative. Silence on a live risk is the defect, not the
question.*

**The short answer, in three lines.**

- A fact the contract **can** carry (a gap, a colour, a text) is **overwritten,
  deliberately** on regeneration — both amend paths rebuild variant interiors
  from the spec, and a manual interior edit is drift by definition.
- A designer's **real photo** is a fact the contract **cannot** carry (named gap
  A5: the contract carries the *route* — a runtime URL prop, default empty —
  **never the bytes**). It is **preserved by an explicit rescue pass, never by
  luck**: every `IMAGE` paint is harvested before the teardown and restored
  after, on the master **and on its page instances**.
- If an imprint has **nowhere to land** in the rebuilt contract, the rebuild
  **refuses before touching a single node**, naming `imageHash`, `hostId` and
  `cheminPosition`. It is not lost; the rebuild does not happen. The refusal
  lifts photo-by-photo through a written acknowledgement, never through
  tolerance.

**The full answer, and it is authoritative over any inference from the code**:
`docs/FIGMA-CAPABILITY-MATRIX.md`, section *(b)* addendum (why the image row sits
in a CARRY-CODE-ONLY table while row 91 verdicts `CARRY-BOTH`) and the two dated
regeneration addenda at the end of the document (2026-08-03, then 2026-08-06 —
the second supersedes the first's two named limits).

**What is closed, and what is not.**

| | state |
|---|---|
| photos lost on regeneration (master) | **closed** — harvest/restore, eval-guarded since 2026-07-26 |
| photos lost on regeneration (**page instances** — 255 of 349 live photos) | **closed 2026-08-06** — the 62-photo collapse behind a green report is what forced it |
| two same-sized photos swapping places | **closed** — pairing is positional, an order-preserving bijection |
| a photo with no accueil silently dropped | **closed** — refusal before mutation |
| **A5 itself — transporting the image content** | **OPEN, and named.** Row 91, Bindable column: `— (image content not bindable)`. The image will never ride the variable axis. 017 did **not** close this and does not claim to |

Guarded headlessly, without the client file open, by eval
`photos-instance-overrides-preserved` (claim `C2-refusal`) — the loss replay plus
three adversarial cases. The live receipt (`npm run photos:verify`) confirms it;
it does not replace it.

## 7. Open product-friction items (not bugs, but blockers to adoption)

- The plugin is a **dev-import** today; publishing to the Figma Community (a
  human-driven Figma flow) is prepared (`PUBLISHING.md`, icon) but not done.
- Generated sets are **not wrapped in a Section/frame** on canvas (a nice-to-have
  the owner requested; the plugin could drop each set in a named Section).
- The **web-components emitter** is built but **not published**.
- CI recipes exist but the fully-async "CI → plugin" channel is a named roadmap
  item, not v1.

## 8. Things proven headless but NOT yet validated live

- The composite Modal building correctly on a real canvas (fails — see #1).
- `canvas → contract` for advanced composition *on real Figma* (only mock-gated).
- `code → contract` at scale on real, foreign codebases beyond the tested set.
- The Button's governed **icon choice** rendered on a real canvas as swappable
  `INSTANCE_SWAP` instances — the emitter bakes glyph vectors headlessly (SVG
  paint is not bindable at import); live menu ↔ swap-property alignment is proven
  by the re-pulled parity `icons` snapshot (D8), not the byte-roundtrip. See
  `docs/02-contract-spec.md` (Icon Registry → named limitation).

## How to read this list

None of these invalidate the core thesis (see `07`): the deterministic pipeline
works and individual components build live. These are the *frontier* — advanced
composition rendering, mock fidelity, and adoption friction. The most valuable
next work is `08#1` (the composite) and `08#2` (mock fidelity). See `11-roadmap`.
