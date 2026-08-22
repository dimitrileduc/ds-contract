# Milestones

A dated log of what this system has **proven**, in order. Every entry is backed
by receipts in the repo — commits, pilot write-ups, eval cases, or live-file
forensics. Nothing here is aspirational; the roadmap holds the aspirations.

## 2026-08-18 — deux tinyspecs rétroactives : la note d'avis gouvernée et le CTA-lien Odoo

Du travail réel fait pendant la branche 021 sur décision owner, mais **hors de tout
périmètre spec** (021 = réparation Figma, 019 = clos), documenté après coup au lieu
d'être laissé aux seules descriptions de contrat. Deux tinyspecs, deux commits :

- **`review-card-2.0.0-notation`** (commit `1d33bce`) — `ds.review-card` promu **2.0.0**
  (majeur) : les booléens `tronque`/`initialeVisible`/`photo`/`verifie` disparaissent,
  l'avatar devient **une variante exclusive** `Initiale`\|`Photo`, la note d'avis
  redevient éditable via le nouvel atome gouverné **`ds.notation`** (cinq bandes
  exclusives, glyphe interne `star-empty`). `ds.google-reviews` **2.0.0** le consomme.
  Cas eval T064 réécrit : l'exclusivité de l'avatar est désormais **structurelle**, plus
  une convention d'appelant. `npm run eval` **219/219**.
- **`odoo-cta-link-review-note`** (commit `cc6cd0d`) — trois extensions de gouvernance
  dans l'addon Odoo **19.0.1.4.0**, étendant 019 (clos) : CTA-lien gouverné (action
  unique `pqrSetCtaHref` sur `actionParam`, repli même-origine, `javascript:` refusé,
  projection `<a>`/`<button>` selon `link_href`), note d'avis au panneau (`BuilderSelect`),
  avatar **dérivé** de la présence d'une photo publiée avec `alt` dérivé de l'auteur.
  Repin sur la fermeture 2.0.0 (digest `102c372a…`). QA rejouée verte sur instance Docker
  neuve : Hero 13/13, Présentation 13/13, Google Reviews 15/15, Sécurité 14/14,
  Versioning 6/6 ; quatre portes Odoo vertes.

La chaîne noyau du CTA-lien a été **vérifiée sur la source Odoo 19.0** réelle
(`~/odoo`, branche 19.0) : `BuilderUrlPicker` → `actionParam` → `convertParamToObject`
→ `{mainParam}`, et `BuilderSelectItem` rend `data-action-param` sur le nœud cliqué.

## 2026-08-06 — Photos honnêtes : deux rapports cessent de dire le faux (spec 017)

> **Trou de journal, nommé plutôt que comblé en silence.** Ce fichier saute des
> specs **011, 012, 013, 014 et 016** — 015 a déjà déposé son entrée par-dessus
> ce trou, 017 fait de même. Leur trace vit dans les dossiers de spec et le log
> de commits jusqu'à ce que le journal soit rattrapé.

- **Une photo posée sur une INSTANCE DE PAGE survit à une reconstruction, et le
  rapport ne peut plus être vert sur une perte.** Le 2026-08-06, une régénération
  avait effondré **62 photos** sur 10 sections de 8 maquettes du fichier client
  **derrière un rapport vert** : le sauvetage ne voyait que le maître, alors que
  **255 des 349 photos vivantes sont des surcharges d'instance**. Trois défauts
  réparés — le périmètre descend aux instances, l'appariement passe du **nom** à
  la **position**, et le refus devient une **pré-passe exécutée avant le premier
  `remove()`** (aucun nœud touché, levable à la photo près par acquittement
  écrit). Preuve §II archivée des deux côtés : la fixture rouge détruisait
  **6 empreintes sur 8**, exactement les 6 surcharges d'instance.
  Evals **193 → 194/194**.
- **La porte de parité visuelle cesse de mesurer un cadre vide.** La boucle du
  live gate appelait `renderVariant` avec **six** arguments alors que le septième
  existait depuis toujours : notre surface rendait `<img src="">` face à une
  photo et la porte notait **l'absence de données**. Quatre des huit lignes
  « frontière image » passent sous la porte —
  `member-picture/Etat=Defaut` **58,32 % → 0,00 %**, `product-card` 15,64 % →
  0,41 %, `carte/Categorie` 56,34 % → 0,64 %, `member-card` 47,88 % → 1,76 %.
  Les six règles de triage **réécrites d'après la mesure d'après**, zéro
  `UNTRIAGED`.
- **Trois prémisses du dépôt renversées par la mesure**, toutes consignées :
  `realisation` (la pire ligne, 99,43 %) **n'était pas une frontière image** — son
  master ne porte **aucune photo** ; les assets « manquants » de `member-picture`
  étaient au manifeste depuis toujours ; et le contrat `member-picture`
  **inverse l'ordre de ses deux plans photo** par rapport au master — découvert
  parce que prêter la mauvaise photo a fait *empirer* l'écart.
- **La documentation cesse d'être l'exception à la règle des revendications.**
  Relevé : **aucun cas d'eval ne lisait `docs/`** — la règle « aucune phrase de
  capacité sans son eval derrière » n'était, côté doc, tenue par rien.
  `img-part-canvas-placeholder-named` est le **premier cas du dépôt à lire
  `docs/`**, et il est prouvé adverse : **un mot** altéré dans la copie fait
  tomber la suite à `193/194`.
- **La fenêtre vive du lendemain (2026-08-07) a tourné, et elle a élargi le dégât connu.**
  Le pont était **saturé et non déconnecté** — 13 serveurs pour 10 ports, dont **3 squattés par ce
  dépôt** depuis 016. Une fois débloqué : sonde `getInstancesAsync` **levée** (33 instances, 15 ms),
  **45 photos d'instance** reposées, la **clause de légende portée au canevas** (SC-006-vif tenu),
  et surtout — **les MASTERS du design system avaient perdu leurs photos eux aussi** (`Equipe`
  17 → 2, `Reassurances` 13 → 1, `ProduitsECommerce` 4 → 1), alors que le plan de restauration de
  016 ne listait que des hôtes de maquette. 3 masters sur 4 restaurés. **016 avait aussi inversé
  l'ordre des deux plans photo**, prouvé par lecture REST de la version d'avant-016.
- **Deux comptes du dépôt corrigés** : ni « 62 photos » (le relevé photo-par-photo en compte **45**
  côté instances), ni « seulement les instances ». Et une leçon de méthode payée cher : compter
  des **hashes** n'est pas vérifier ce qui **se voit** — un plan correct mais masqué se compte
  comme réparé et ne répare rien.
- **Ce qui n'est PAS fermé, et qui est écrit noir sur blanc** : `DW-014-002`
  (l'instrument rend `emit-html`, jamais la surface React livrée), la lacune A5
  (lacune de **transport**, pas défaut de fidélité), **SC-006-vif** (le canevas
  n'a pas reçu la clause, et aucune porte ne le détecte), et le reçu vif
  `verdict: "empeche"` — pont saturé, précondition FR-005 non levée.
  Détail : `specs/017-photos-honnetes/RAPPORT-CLOTURE.md` §5.

## 2026-07-03 — The loop exists

- **Generation from contract into both surfaces** — working React + CSS Modules
  and a scripted Figma library from the same JSON, no handwritten style layer.
- **The parity loop, both directions** — drift detected as ahead/behind/mismatch;
  promotion (canvas → contract) converges instead of ping-ponging.
- **Governed vs. ungoverned generation measured** — the adherence-judge A/B:
  catalog-constrained generation scored 100 vs. 65–69 for freehand.
- **50-component catalog** (schema v5), Contract Hub, docs site, public README.

## 2026-07-03 — Events (schema v6)

The interaction surface enters the contract: declared event callbacks with
toggle semantics (controlled/uncontrolled, ARIA wiring). Canvas reflection is
description text — a **declared fidelity limit**, the pattern for every
code-only surface since.

## 2026-07-05 → 07-06 — Brownfield turns real

- **Extraction v0**: `extract/` reads *your* library (React/TSX and custom
  elements manifests) into proposed contracts; skipped components are always
  reported, never silent.
- **Shoelace pilot**: 58/58 components extracted; code reconciled against its
  community Figma kit — 28/58 matched, 236 recorded decisions, real kit rot
  found mechanically (`deafult`, `isCheched`, `endicon`).
- **Mantine field test**: 245 components extracted in under a second.
- **Multi-brand theming (tokens v7)**: brands as a token-layer dimension —
  byte-identical components, brand-switchable canvas (Default/Aurora modes).

## 2026-07-06 — Fresh-file rebuild, executed

The entire canvas library rebuilt from a **blank Figma file** via the Sync
Runner plugin, then verified against the contracts: zero findings. The test
itself caught three masked generator bugs — the pattern that repeats: hostile
runs are how the system hardens.

## 2026-07-08 — Adversarial hardening round

Three audit agents (red team, scale lab, schema gauntlet) produced 14+
findings; fixes landed: differ blind spots (boolean/text canvas defaults,
property kinds, numeric code defaults, one-sided deletions), merge-attack
refusals (duplicate code bindings), and **golden-output manifests** — because
determinism-vs-self proves nothing about correctness.

## 2026-07-08 — In-place AMEND, forensically proven

A contract change (Button v1.4.0 ghost variant) amended live component sets
**in place** on two files: set key byte-identical, every variant node ID and
property ID preserved, instance overrides intact. Instances never break;
"regenerate" no longer means "destroy and recreate."

## 2026-07-08 — Scale + trust plumbing

- **N-axis variants**: full cartesian product with deterministic ordering.
- **Sharded catalog**: routing index + per-component shards keeps the catalog
  inside an agent's context window at any component count.
- **Provenance & staleness**: snapshots carry fileKey + age; the differ refuses
  to reason over the wrong file or stale extractions. Acknowledged-drift
  baseline ratchets known drift without going permanently red.

## 2026-07-08 — Four design systems, four receipts

Extraction and diagnosis run against **Shoelace, Mantine, Eventz, and CBDS** —
four unrelated architectures. New drift classes catalogued from real files:
state-as-variant-axes, breakpoint axes, boolean arity ladders, emoji-prefixed
property names, variant-unrolled families, decorated enum values.

## 2026-07-08 — The CBDS coexistence proof (the hostile-file finale)

Into a foreign enterprise kit with its own five token collections and its own
72-variant component named "Badge":

1. **Full token sync** — all 282 contract variables landed alongside the kit's
   collections, zero collisions.
2. **Variable-bound generation** — a contract Badge with live token bindings,
   coexisting with the native one.
3. **In-place AMEND from a contract change** (Badge v1.1.0 `error` variant) —
   found by identity marker, not name; same set key, same nodes, same property
   IDs; the native Badge untouched through **four sync passes**.

The passes caught three real generator bugs (name-collision identity, a Figma
renderer base-color quirk on reassigned bound paints, children-text default
reconcile) — all fixed, all eval-gated. Receipts: `extract/pilots/cbds/`.

## 2026-07-08 — Schema round 2: the expressiveness round

Five features, each shipped with a consuming contract: `elementByProp`
(dynamic h1–h6, Heading), `layoutByProp` (ChatMessage sender flip, both
surfaces), `stylesWhen` (whitelisted conditional literals), `overlay`
(out-of-flow anatomy for tooltips/popups), `arrayOf` structured props (code-only
with `kind: NONE`, skipped by every design-side consumer). Plus
pending-first-sync parity classification. **Eval suite: 60/60.**

## 2026-07-08 — Code Editor Simulator (Hub)

New `#/editor` page demos what a contract-governed in-tool code editor
experiences: a live contract JSON editor validated on every keystroke against
the actual `ContractSchema`, with consequences computed deterministically
client-side — API diff, an amendSet-mirrored canvas plan (ADDED/REBUILT/
EXTRA-reported over the enum cartesian product, all-defaults combo first), and
spec-policy version advice. Illegal edits are refused by the schema's own
names and never reach either surface; both keep rendering the last governed
version. Dashboard-only change; 60/60 evals unaffected.

## 2026-07-08 — State previews + canvas text styles (schema v8)

The canvas stops lying about interaction. `figmaStatePreviews` generates a
State variant axis (Hover / Focus Visible / Disabled previews) from the same
declared state tokens that emit the CSS pseudo-classes — the mirror image of
code-only events, bounded to the primary enum axis, refused by name when
hollow. The differ works both directions: a missing axis is BEHIND; a
hand-built State axis without the opt-in is the kit-rot detector (all four
pilot systems carry rotting hand-built state axes). Plus named Figma
TextStyles minted from semantic typography tokens, upserted by identity
marker, ridden by matching text nodes. Button v1.5.0 ships previews.
**Eval suite: 60/60.**


## 2026-07-08 — Full-circle sync: drift acknowledged → resolved → ratchet retired

The main file caught up with three contract versions in one governed pass
(Badge v1.1.0, Button v1.5.0 with the State axis, Heading v1.0.0 first sync),
plus 7 minted text styles and text-style adoption across all 31 variant sets.
The first pass exposed two amend gaps at live-file scale — 17 legacy standalone
components duplicated by the marker-only identity check, and the State axis
gained by duplication instead of rename — both repaired on canvas with every
original node ID preserved, and both fixed at the source (anchor-key identity
fallback; rename-matching for axis changes). The verification pass ran with
zero creates, zero duplicates, zero extras; the snapshot was re-extracted and
**the parity baseline is empty again**: no acknowledged drift anywhere in the
system. Also surfaced for the queue: `figma.fileKey` is null in the dev-plugin
runtime, so WRONG-FILE guards only bind over the bridge transport — a
file-identity marker check is the fix.


## 2026-07-08 — Round-trip identity, both directions (anatomy extraction)

The "anatomy is human-owned" stub era ends. Both reverse directions now
propose FULL contracts — API and anatomy and token bindings:

- **Code → contract**: the css-module adapter inverts the generator's emission
  model (class nesting → parts, `var(--a-b-c)` → `{a.b.c}` refereed against
  the real token tree, variant-class families → substituted refs, pseudo-class
  rules → states, uncontrolled-toggle pattern → events).
- **Design → contract**: the node-tree dump proposes contracts from the drawn
  structure (variable bindings → token refs, per-variant enum substitution,
  spacers reconstructed with visibility conditions, propRefs → text/slot/
  optional parts, nested instances → component refs).

The proof standard is **round-trip identity**: this repo's own generated
components re-extracted and compared to their shipping contracts. Badge,
Switch, Card: **zero mismatches in both directions** (code: 28 matched /
21 code-absent named; design: 82 matched / 31 canvas-absent named), red-tested
— a retokenized property, a deleted part, or an uncorrelated cross-variant
binding each fail by name. Unbound/raw values are always reported with
nearest-token candidates, never invented. Receipts: `extract/ROUNDTRIP-CODE.md`,
`extract/figma/ROUNDTRIP.md`. **Eval suite: 60/60.**


## 2026-07-08 — Playground Phase 0: the engine becomes a library

Foundations for the public browser playground (playground/PLAN.md), both
golden-guarded — CLI output did not change by a byte:

- **`core/` barrel, browser-importable**: schema, token corpus, both
  proposers, and four emitters behind a pluggable `Emitter` interface —
  `react` (the shipping generator), `html` (no build step), `react-inline`
  (every token resolved to a literal — the zero-infrastructure tier), and
  `figma-script` (the canvas is just another emit target). Receipted by a
  platform=browser bundle + VM run with zero node globals.
- **Figma REST → dump mapper**: figma.com URL + token imports a component
  set without the plugin — the REST-mapped Badge dump is byte-equal to the
  live plugin dump, and the Enterprise-gated variables endpoint degrades to
  resolved literals with a named taxonomy and zero fabrication.

**Eval suite: 60/60.** Launch gate (per TJ): no public launch until the
Figma-URL import works end-to-end in the browser UI.


## 2026-07-08 — The loop runs in a stranger's browser (preview)

`playground/` deployed to https://ds-contracts-playground.pages.dev — a public
Vite app importing `core/index.ts` unmodified: a gallery of 10 live-emitted
examples, a governed contract editor with both refusal layers named on screen
(zod shape errors AND generator refusals like a nonexistent token ref), all
four registry emitters as output tabs with the html emitter doubling as the
live preview, code→contract behind a lazy TypeScript chunk, and the Figma-URL
import UI (session-only token; the degradation ladder rendered as first-class
receipts) verified end-to-end against committed REST fixtures through the same
`importFromUrl` the CLI runs. Browser-direct api.figma.com confirmed
CORS-viable. Initial bundle 152 KB gzip. Screenshot-verified live.
**Preview status: launch is gated on one real Figma-URL import with a live
token (per plan).**


## 2026-07-08 — Playground Phase 2: live-network imports, bring-your-own tokens

Paste a public GitHub file URL and the co-located stylesheet is
auto-discovered; every failure named — 404, rate-limit with reset time,
too-large, not-TSX. Paste your own DTCG trees and the whole loop rebinds:
proposals, nearest-token suggestions, inline literals, and a preview
stylesheet regenerated in the browser from the paste — while contracts
referencing repo-only tokens refuse by name. Verified against this repo's
own Badge **over the real network**: the proposed anatomy byte-matches the
shipping contract, in a stranger's browser. A genuine transient 429 during
testing was surfaced honestly and the proposal degraded to the props
surface — the ladder held under real rate limiting. 60/60, no core changes.


## 2026-07-08 — Playground Phase 3: the loop starts from nothing

A sentence and a user-supplied Anthropic key now produce a governed
contract: browser-direct claude-sonnet-5, generation constrained by a
forced tool call against a pruned contract schema with the ACTIVE token
inventory in the system prompt — the model can only propose what the
system can govern. Invalid output is refused by name and sent back as
user-triggered fix rounds (max 2, counted, receipted with model id and
token usage). A keyless fixture demo rides the same transport. Any
contract travels as a ~1 KB URL hash (deflate + base64url, 8 KB named
guard); first visits get a three-action guided strip. **The playground's
planned scope (W1–W10) is complete.** 60/60.


## 2026-07-08 — LAUNCHED: both credential-gated paths verified live

The two receipts the launch gate demanded, both against real endpoints with
real credentials (env-file, never in chat, never printed):

- **Figma URL import, live**: the Eventz Alert fetched from api.figma.com
  through the deployed import chain (`importFromUrl` → REST mapper →
  proposer). The token's plan hit the Enterprise-gated variables endpoint
  exactly as most visitors will — and the ladder held: every binding degraded
  to a named `variable-unresolved` report, gradients hit `paint-unsupported`,
  the proposal carried the full structure and API with 6 UNBOUND entries and
  nearest-token suggestions, zero fabrication. Paired with the earlier
  bridge-path run (which recovered Eventz's own token vocabulary), both
  degradation tiers now have live receipts on the same component.
- **Describe transport, live**: one real api.anthropic.com round trip with
  the module's own tool schema — HTTP 200, forced `tool_choice` honored,
  `thinking_tokens: 0` (the disabled-thinking pairing works), 4,545 prompt
  tokens (matching the design estimate), and a genuine `ds.stat-block`
  contract with the right props in the expected nested shape.

The playground is **launched**: https://ds-contracts-playground.pages.dev


## 2026-07-08 — Playground: refusals point at their line; imports collect in a workspace

A refusal now lands three ways: named under the editor, as a danger
background on the offending line (dependency-free textarea overlay — zod
paths walked, generator quotes anchored, unresolvable refusals highlight
nothing), and as a click that scrolls there. Every load remembers its
pristine original (one-click Reset; the onboarding strip gains the reset
step). Every successful import — Figma, code, prompt, JSON — lands in a
session workspace (capped at 30 with named eviction) that restores contract
+ receipts and tells the design↔code switch story in one dismissible line.
A plain help drawer covers every way in. 60/60, no core changes.


## 2026-07-08 — Playground speaks designer

The Preview grows per-prop controls (a single instance at any chosen state,
rendered by the same html emitter via defaults-substitution — one renderer,
zero drift; honest "no visible change — by design" notes; the all-variants
grid one segment away). The Contract pane gains a JSON | Spec toggle
rendering the same contract as a read-only spec sheet — props table,
variants with combination count, slots resolved to names, events, grouped
token chips, a11y — stale-on-invalid, refusals visible in both views. Every
gallery card teaches with a fact-checked "What to notice" caption; the help
drawer gains a seven-term glossary; first-session jargon explains itself in
place. 60/60 throughout; verified both themes.


## 2026-07-08 — Playground grows a workbench feel

The rail nav scrolls instead of wrapping (bottom border back on the shared
37px line), the three panes resize by draggable gutters (persisted,
keyboard-nudgeable, min-width honest), code surfaces step up to 14px/13.5px,
and Prism paints everything: the output panes (one 8.4 kB gzip lazy chunk,
our own Carbon-muted token palette on playground variables — no stock theme)
and the contract editor itself, where the metric-locked refusal backdrop
becomes the visible highlighted text under a transparent-glyph textarea —
caret, selection, and refusal-line highlighting all intact, verified
numerically in both themes. 60/60.


## 2026-07-08 — The ladder keeps your styles (minted provisional tokens)

Field finding (Shoelace Tooltip import, non-Enterprise plan): 129 named
degradations and a naked preview — the variables endpoint is gated, and the
proposer rightly refuses to invent bindings from raw values. The missing
rung: resolved values now MINT a provisional DTCG tree named by usage site
(`imported.tooltip.body.background-color`), deduped, per-variant where values
track an axis — and the proposal binds to it. Nothing semantic is ever
guessed: names never leave the `imported.` namespace, every minted ref is
flagged for rename, and renaming against your real tokens IS the adoption
workflow. Degraded-Badge receipt: 13 leaves, zero unbound, emitters green.
**60/60.**


## 2026-07-09 — The assist layer goes live (AI under governance, on a budget)

workers/assist deployed: three Opus 4.8 endpoints — repo fetch-planning,
minted-token semantic naming, and a cached repo-profile memory (7-day KV,
shared across visitors, zero-token hits) — behind forced tool schemas,
thinking disabled, CORS locked to the playground, 5 requests/day per
visitor, and a ~$10/day global budget with named 429s. The owner's key
lives only as a Worker secret. First live call: asked to rename two minted
tooltip tokens, Opus proposed color.surface.inverse and
color.content.inverse with pairing rationale — design-system judgment,
refereed by the same schema as everything else. 21/21 handler tests;
one workerd gotcha (unbound fetch = Illegal invocation masked as 502)
found by the live smoke and fixed.


## 2026-07-09 — The Enterprise gap closes on any plan (desktop MCP path)

Figma desktop ships a local Dev Mode MCP server whose variable access is not
plan-gated. The new import path joins its flat name→value defs against REST
structure — set scope first, per-node subtree refinement, a name resolves
only when exactly one candidate survives every occurrence, ambiguity
receipted and minted rather than guessed. Live receipts: Badge resolves all
13 variable ids and lands IDENTICAL to the plugin-dump comparator verdict;
the Eventz Alert recovers foreign vocabulary ({spacing.4}) and its U+2024
variable fires the grammar refusal through the new path. CI-safe via
recorded fixtures; the future remote transport reuses the join unchanged.
The fidelity ladder is now: desktop MCP / plugin dump / REST+minting —
every rung named in the receipts. **60/60.**


## 2026-07-09 — The degraded import stands up straight (v0.3.0)

A non-Enterprise Figma import now renders styled — minted `imported.*`
tokens are a live layer over the active source, listed in receipts,
renameable via the assist Worker with every apply refereed by the same
editor. The code side goes directory-first: imports traced and receipted,
gaps named, AI as the explicit next rung with repo profiles cached per
repo@ref. Stale previews, stale chunks, and the fidelity ladder each got
their honest UI. The owner's two field failures became the acceptance
receipts: the Shoelace-Tooltip class of import renders colored, and the
CBDS Button imports clean over live network in both URL forms. **60/60.**


## 2026-07-09 — The loop closes on the canvas (v0.4.0)

The contract got its design side on screen — Code | Canvas | Split, the
figma engine's variant grid rendered on a true white canvas with a
Light/Dark/Checker surface. Code imports caught up with Figma imports:
foreign var(--*) properties and raw literals mint the same imported.*
layer, with token stylesheets discovered across the repo tree (CBDS Button
imports STYLED at the fully deterministic rung — variant and size both
drive substituted refs). And the designer validation loop closed live,
owner-confirmed: a degraded import's Figma script upserts its provisional
variables first, builds the contract's version beside the original in the
source file, and the Sync Runner's paste box ends every run on the canvas —
zoomed to what it built, or plain words plus Select-it when it already
exists. **60/60.**


## 2026-07-09 — Ground truth on screen, chrome out of the way (v0.5.0)

The canvas got its referee: for Figma-imported contracts, a "Figma render"
toggle fetches the node's OWN render (images API, PNG @2x) beside the
compiled canvas — "Figma's own render" vs "compiled from the contract" —
the anchor riding the contract, the token session-only, and every
non-fetch state named (no source, token gone, rate limit, node deleted
since import — that last one observed live). And the output pane went
Storybook: one toolbar row, Controls | Receipts (N) in a collapsible
bottom dock, fidelity notes behind an info popover. **60/60.**


## 2026-07-09 — One foreign Button, three engine lessons

The owner's Eventz Button import taught the engine a pattern and killed
two failure modes: variants that solely wrap an instance of a shared base
component now FLATTEN (captured properties promote to real contract props
with exact Figma spellings — hasEndIcon stays hasEndIcon), a nested
instance of the set itself never emits a component ref, and a component
ref cycle refuses by name at the generator ("a contract cannot compose
itself") instead of blowing the stack — the crash observed live during
the owner's hand-fix. Unconfirmed patterns degrade to named skips that
still generate. **60/60.**


## 2026-07-09 — The fidelity matrix: URL in, styled truth out, scored

The charter's scored acceptance pass (`extract/fidelity-matrix/SCORECARD.md`):
four real components — Shoelace Tooltip and Button Group, the Eventz Button,
and the CBDS Button on both sides — imported live, proposed, emitted on every
surface, and scored against **their own captures** (props vs the dump's
property definitions, style facts vs resolved node values, D-convergence
design-proposed vs code-proposed, Figma-API PNGs vs emitted-preview renders).
Committed fixtures replay every number offline. Result honestly read: **0
style-value mismatches across 334 fact-cells**; the losses live in what the
capture drops — named as 12 gaps with causes and an ordered punch list.

Punch items 1, 2, 3, and 5 then landed, receipt by receipt: dump v1.1
captures paint alpha and node visibility (Eventz secondary/bare render the
near-white truth via 8-digit-hex minting; `paint-alpha-dropped` retired); the
one engine crash in the matrix became a named refusal; icon-toggle booleans
on component-ref parts survive into contracts; identifiers sanitize at
proposal instead of refusing at emit; and contract-less child instances ship
auto-proposed STUBS — turning the CBDS design proposal green on all four
surfaces without guessing a child's API. D-convergence stands at 12/19 style
facts in byte-agreement, each divergence attributed to the side that owns it.
**60/60.**

## 2026-07-09 — "This is a freaking button" (semantics + state promotion)

An owner field test exposed the worst failure class the project recognizes:
a component set named **Button-Brand Primary** imported as a non-focusable
`div` with a fake `state` enum prop and a first-variant font size shipped as
a constant for every size — plausible-but-wrong values wearing the costume of
truth. Three root causes, all fixed at the source, none with AI:

- **Deterministic semantics inference** inside `proposeFromDump` — a pure
  name/axis table (button/link/tooltip/heading/switch/…; `*group*`
  deliberately excluded; an interaction-state axis alone corroborates
  `button`). Every hit is a named review note; no hit stays `div` with the
  hedge. Emitted React is a real `<button>` on `ButtonHTMLAttributes`.
- **State-axis promotion** — a drawn `state=default|hover|focus|pressed|
  disabled` axis is the platform's interaction vocabulary, not API: it never
  ships as a prop. hover/pressed/focus become real `states` overrides
  (through the same mint pass, substituted refs per remaining axis),
  `disabled` becomes a native boolean, a stroke-only focus child inverts to
  the outline pair, and `figmaStatePreviews` round-trips the axis to canvas
  (the rename documented honestly in a proposal note).
- **Typography-uniformity guard** — style identity is adopted only when
  fontSize and weight agree across every variant; otherwise per-variant
  minting. The 16px-everywhere constant is dead: the acceptance receipt
  asserts **numeric equality** of emitted padding and font-size against the
  live REST dump per size variant (small = 12px inline / 14px type, large =
  16px / 16px), and pins that the values genuinely differ across sizes.
- **Playground stub registration** — the engine already proposed child stubs;
  the playground dropped them. `stub-contracts.ts` registers them
  (provisional, labeled, never overriding repo contracts), so the owner's
  `ds.icon has no contract in scope` refusals cannot recur.

Verified live in the deployed playground: Tab focuses a real button showing
the `:focus-visible` ring; controls show `size/text/iconLeft/iconRight/
disabled` and no state control. Fidelity matrix re-scored under the promoted
vocabulary: D-convergence **15 AGREE / 0 DIVERGE** (font-size small moved
DIVERGE→AGREE at 14px — the owner's exact complaint). Receipt:
`npm run extract:figma:cbds:check` (36 checks) on a committed live fixture.
**63/63.**

## 2026-07-10 — The tooltip renders whole (shape geometry + text channels)

Second owner field case, same file: his CBDS Tooltip imported clean but drew
no shadow (canvas had no box-shadow projection — a named v1 limit), no arrow
(the pointer is a rotated `REGULAR_POLYGON` — the receipted #42 class), and
an unbolded title (font-weight only carried via token-derived style
identity). All three became carried channels: dump v1.3 captures parametric
shape geometry (kind, intrinsic size, rotation, absolute placement +
constraints); contract v9 adds a bounded `Part.shape` with ONE shared CSS
projection so React/HTML/inline/canvas cannot fork, and the Figma script
constructs a *real* rotated polygon with a native DROP_SHADOW; per-variant
pointer placement is spelled from Figma's own constraints so it generalizes
with content; a fixed weight-name table (Semi Bold → 600) and PIXELS
line-heights mint when no style identity matches. The #42 receipt narrowed
to its true residue (freeform vectors, stars, boolean ops). Receipt:
`npm run extract:figma:tooltip:check` (30 exact-value checks) on his live
node; Playwright probed 8 placed arrows + 1 honest suppression, shadow on
all 9 bubbles, computed 600/16px. **67/67.**

## 2026-07-10 — Send to Playground (the Enterprise gap closes for everyone)

The plugin gained a bridge: a 6-char pairing code minted by the playground,
the repo's dump script embedded VERBATIM in the plugin (a build-time drift
guard refuses to package a stale copy — it fired on its first merge, catching
the v1.2→v1.3 bump, and was right), a one-time-read relay on the assist
worker (15-min TTL, 4MB cap, own kill switch, contents never logged), and a
downloadable plugin zip with an install walkthrough in the Figma tab. The
two import routes are now positioned honestly: URL+token = quick, values
exact, names receipted; plugin = full token NAMES and values on any Figma
plan. Live contrast: the same import = 0 `variable-unresolved` via the
bridge vs 50 via degraded REST. 45/45 worker tests; e2e proven without
Figma (simulated plugin POST → playground imports real token bindings).

## 2026-07-10 — The chain closes: his send, zero refusals, his tokens rendering

The owner's sixth field test walked the last unbuilt link. His plugin send
arrived semantically right (element button, states promoted, real token
names bound) — and the referee refused all nine of HIS names because it
knew only the repo corpus. Three fixes closed the chain: dump v1.4 carries
each bound variable's **resolved value** (`_variables`), and the playground
registers captured variables as an import-scoped token layer (repo tokens
win collisions, by name; the whole layer receipted, persisted per workspace
entry). The padding/height drop was root-caused honestly — the owner's
state-variant hypothesis was disproven by replay; the true cause was
name-level-only substitution in `unifyRefs` (`spacing.200` can't spell
"large") — fixed with value-level correlation over one enum axis
(injectivity not required) carried as schema-v10 `tokensByProp` on every
surface. Literal min/max sizing carries (his 44px tap target renders;
the degradation retired). Receipt: `extract:figma:cbds:bridge:check`
(60 checks) — ZERO refusals where he saw nine (the refusal reproduced as a
control), background #0e61ba from HIS `{bg.brand.default}`, hover/active/
disabled/focus from his state tokens, padding-inline 16/12px and heights
48/40/32px per size from `{spacing.*}`/`{component-size.*}`, min-height 44,
a focusable `<button>` — verified live in the built playground through the
bridge seam. **72/72.** The import frontier is now FROZEN by decision:
field fixtures are the standing acceptance suite; the next deliverable is
the confidence artifact, not features.

## 2026-07-10 — The gauntlet: his whole kit, censused to 100%

The owner asked for proactive class coverage instead of failure-per-test.
Three parallel audits delivered it: an **engine capability matrix**
(expressible vs proposed vs rendered per surface — surfacing the
never-proposed free wins: overlay, icon parts, arrayOf, number props, and
the name-only session-linking gap), a **pattern taxonomy** across a dozen
design systems (25 composite patterns crossed against the vocabulary,
APG role graphs for 22 composites, theme/mode-axis promotion rules, an
11-item DON'T-infer list, native-Figma-slots addendum), and the
centerpiece: **the census** — his entire CBDS kit live-recaptured at dump
v1.4 (1,618 sets, 127 variables, zero stale) and replayed through the
full pipeline, every failure classified and ranked by frequency.

Starting score: 1,577/1,618 whole-kit, **48/76 composites (63.2%)** — the
measured explanation for "every test finds an issue" (his random draws
had ~10% odds of five clean composites). The Dialog batch (global part
dedup, canvas border-box + root tokensByProp, code auto-renew, AI-removal
guardrails) took composites to 75.0%. The class-fix batch (unmappable
child props dropped-with-note, boolean visibleWhen truthy form with the
false side named-inexpressible, digit-led prop prefix, and a figma-script
referee guard the census itself exposed) finished it:
**1,618/1,618 — 100.0% — and 76/76 composites, zero named residue.**
`npm run extract:figma:gauntlet` is a standing deterministic instrument;
class fixtures are retained for regression replay. **79/79 evals.**
Next: the taxonomy's ranked richness program (repeat/arrayOf collections,
theme-axis promotion, slot capture pass incl. native slots + session
linking, overlay inference) — richness, not refusals.

## 2026-07-11 — Pixels as receipts: the visual-parity instrument, and the fix queue it opened

Refusal-free was never the same claim as pixel-right, so the gap got its own
instrument: `npm run extract:figma:visual` renders every subject variant in a
real Chromium, fetches Figma's own PNG of the same node, and scores the pair
with pixelmatch — twice, the second score masking text rects so cross-renderer
font rasterization can never flatter or damn a result. Cross-renderer deltas
(glyph hinting, antialiasing, blur kernels, fractional-pixel layout) are NAMED
in the report header, handled by masking — never by a fatter threshold. The
baseline was honest and ugly: **115 variants diffed, 40 over the provisional
10% line**, and the worst rows were real defects, not noise — focus rendering
the pressed fill on the owner's button, the dialog losing its panel chrome,
literal slot placeholder text rendering as content.

The queue drove three merge batches. Native controls: Checkbox/Switch 2.0.0
render a real `input[type=checkbox]` (indeterminate set as the DOM property via
callback ref; Space toggles natively), plus a standing semantic lint —
`NATIVE_ROLE_HOSTS` refuses role-on-non-native by name, with declared
`roleException` as the governed escape (evals 79→81). A playground surface
batch closed 12 adversarial-review defects, including caption drift fixed at
the root: display captions are now DERIVED from the contracts, with an eval
refusing future hardcoded counts (81→82). The engine-fix batch landed six
pinned defects — the switch canvas thumb, state-preview opacity literals,
empty slots rendering empty, UA-margin neutralization, `a11y.minHitArea`
ENFORCED (the `::before` hit-target floor, previously aspirational), and
ds.token's dead size prop made live — each with its own eval, golden updates
reviewed ×3 (82→88). Residue, named: the re-run improved the original worst-10
out of the list and exposed the next queue top — shoelace-button-group's 36
variants, newly measurable at 95–98% masked because child buttons weren't
resolved (the composite-children problem, below). **88/88 evals.**

## 2026-07-12 — The enterprise code gauntlet: Carbon, Fluent 2, Spectrum, Polaris

The owner's mandate: pretend it's Carbon, Fluent, Spectrum, Polaris. The
gauntlet didn't pretend — it RAN all four, shallow-cloned at pinned SHAs,
through the unmodified pipeline (`extract/pilots/ENTERPRISE-GAUNTLET.md`;
nothing tuned to make the numbers better, every workaround named). Starting
truth: Carbon 20/24 with three silent losses, **Fluent 0/23** (every shipping
component invisible behind sibling `types.ts` files and `ForwardRefComponent`
casts), Spectrum via CEM 22/22, Polaris 23/23 with **5 silently hollow** — and
two of those classes violated the nothing-silent invariant outright:
`as`-expression exports vanished without a note, intersection-of-named-refs
props extracted hollow. A nameless CEM event crashed the run over Spectrum's
1,264-module manifest. Raw DTCG ingest: 0% on all four token sets (all publish
plain values; the spec wants `$value`).

The fix batch made the type-legibility tier real: sibling-type-file resolution,
cast transparency, cast-alias and intersection-named-ref rules take **Fluent
0→23** and Polaris hollow 5→0 with named heritage receipts (Carbon silent
losses 3→0, TextField 0→35 props); nameless CEM events become named skips
(crash → exit 0); one function-prop rule shared by propose AND diagnose kills
26 false findings on foreign libraries; and `wrap-plain-tokens` loads all four
enterprise token shapes via a mechanical `$value` wrap, offered in the
playground's Tokens tab (live Polaris bind: 351→71 foreign notes, 0→48
bindings). Residue, named: fact coverage is honest, not flattering — Carbon
78%, Spectrum 73%, Polaris 57% of facts carried; the ranking put code-side
type legibility ABOVE the taxonomy's richness program, which is why this
batch jumped the queue. **93/93 evals; golden and the design census untouched.**

## 2026-07-12 — Composite children render real: dump v1.5 + session linking

The shoelace queue-top and the dialog's flat children were one defect class:
component refs rendered as named boxes, not as their contracts. Dump v1.5
captures what linking needs — `instanceKey`/`instanceSetKey` (identity that
survives renames), bounding boxes on instances and variant roots, boolean
property defaults, `swapPreferredValues`, native SLOT nodes, and
`_provenance.dumpVersion`; the plugin UI re-embedded it behind the drift
guard. `resolveChildContract` links key-first with name fallback NOTED — and a
name match that contradicts the key REFUSES, never guesses. Linked refs now
render the child's real anatomy with applied + threaded `{parentProp}` props;
unlinked refs render honest stubs at OBSERVED geometry via minted
`imported.stub-*` tokens instead of naked boxes; workspace imports join the
propose scope through a session registry, so importing the child set upgrades
the parent's stubs to real renders.

The parity meter moved the way the claim said it should: shoelace-button-group
36 rows median **92→8.2%** masked (sizes Δ0), eventz width Δ−82→Δ0–6
(boolDefaults render the icons that were silently hidden), dialog large
5.6→0.6%; the >10% bucket **73→47** (the bucket had grown 40→73 as previously
refusing rows became measurable — both moves honest). Residue, named: two
dialog regressions stay on the queue — instance-level FILL overrides on refs
are a vocabulary limit, and stub widths correlated with a parent axis render
one observed width. **96/96 evals; census 1,618/1,618 regen reviewed.**

## 2026-07-12 — The proposer trio: modes, collections, overlap (dump v1.6, schema v12)

The taxonomy's ranked richness program, shipped as three proposers in one
merge. **Theme/mode-axis promotion (P17):** a drawn Theme|Mode axis with
values inside the light/dark/high-contrast vocabulary, STRUCTURALLY
corroborated (identical anatomy + identical bound variable names across the
axis), is a token mode, never a prop — the axis leaves the API, mode-excluded
variants never feed the mint pass (no fabricated second palette), and dump
v1.6 captures collection modes with alias resolution so promoted bindings
resolve per mode. Near-misses stay props BY NAME, never guessed. No themed set
exists in the owner's kit — checked, so the fixture is synthetic in the CBDS
shape and says so in the receipt. **Repeated-children collections (P9, schema
v12):** ≥3 adjacent siblings of the same child with a homogeneous applied-prop
shape propose as ONE item-template part plus a code-only `arrayOf` prop —
React maps the live array, static surfaces render the OBSERVED sample as the
collection's honest static state, field carry rules deterministic and named
per skip. **Negative-spacing overlap (P21):** uniform-negative auto-layout
spacing inverts to `layout.overlap` carrying the drawn magnitude (the
ds.avatar-group owner-precedent); a negative-px gap token — invalid CSS,
silently ignored — can no longer mint anywhere; mixed-sign spacing is a named
limit.

Census re-run: **1,618/1,618 HOLDS**, zero violation deltas — 11 sets GAIN P9
receipts, 2 propose repeat (their per-sibling note piles collapse, 65→46 and
18→11), total named notes 5,414→5,496. Parity: zero moved rows. The v1.6
re-embed was initially missed — and the plugin zip drift guard refused the
build until the canonical script was re-embedded, exactly as designed, third
time it has fired. **99/99 evals.**

## 2026-07-19 — Published: the spec has an install command

`@ds-contracts/schema` 15.0.0 and `@ds-contracts/cli` 0.1.0 are live on the
public npm registry under the `ds-contracts` org — the first shipped artifacts
of the Two Journeys product. The CLI carries the whole surface as one
zero-required-dependency binary (`init / extract` incl. the lazy computed
floor `/ generate --out --target --emitter --stories / figma` + `figma push`
through the bridge `/ diff` with CI exit codes `/ propose-pr`), every verb
eval-pinned by a consumer-style smoke test that runs byte-stable twice from a
scratch directory. The emitter registry is open (`registerEmitter()` — four
built-ins unchanged, plugins appear in every consumer automatically), the
schema package ships the live Zod document + generated JSON schema
byte-identical to the repo's, and the publish was stranger-verified: a clean
directory, `npm exec @ds-contracts/cli`, a working config in one command.
**115/115.**


## 2026-07-19 — Phases 3+4: CI recipes execute verbatim — and catch a real emitter defect

The CI recipes (`examples/ci/`) are code-led and design-led GitHub Actions
workflows over the **published** `@ds-contracts/cli@0.1.0` — and their
validator executes every `run:` step locally, verbatim, in scratch consumers
built from committed fixtures. That discipline paid immediately, defect
first: **the react emitter emitted invalid JavaScript for hyphenated part
names** — `styles.label-2` parses as subtraction, a runtime ReferenceError —
and the committed Polaris showcase output already carried it. Grep-level
checks cannot catch this class (the defect parses); execution did. The fix
(bracket access for non-identifier part names, identifier names byte-stable)
landed with an eval that **executes** both emitted modules through esbuild +
react-dom/server. Alongside: the two journeys became standing E2E gates —
`journey-engineer` (committed CBDS dump → real propose path → the local CLI
build runs the manifest command → emitted story rendered in a real browser,
11 computed-style checks against the bridge-receipt Figma ground truth) and
`journey-designer` (committed Polaris Badge → figma-emit → headless canvas
compile → dry-run push through the real worker pipeline, zero network) —
both reading their command lines ONLY from
`evals/fixtures/journey-commands.json`, the docs-drift seam. **117/117 at
merge.**


## 2026-07-19 — Phase 6: a third code surface (the WC emitter)

`emitter-web-components` 0.1.0: contract → vanilla Custom Elements, zero
runtime dependencies, through the same open registry any consumer already
loads. The closure receipts are the point: `wc-emitter-roundtrip` re-extracts
the emitted elements through the existing CEM adapter and lands back on the
contract, and `wc-emitter-css-parity` renders the react, html, and WC
emissions of the same contracts in a real Chromium — **165/165 computed
channels equal across emitters** (3 subjects, 15 showcase items, 0
mismatches). One contract, one computed truth, three code surfaces.
**123/123 at merge.**


## 2026-07-19 — Phase 2: the plugin becomes an engine host (plugin v2)

The Figma plugin grew from a dump/bridge conduit into six tabs — Generate,
Update library (with a mandatory plain-words report before any apply), and
Propose with a PR dry-run, beside the original send paths. The engine ships
INTO the plugin as a 0.41 MB bundle (core barrel + baked tokens/contracts/
icons, vs ~5 MB of full core) guarded by a committed input-hash receipt: the
zip build **refuses a stale engine by name** — and the guard fired correctly
on its first post-merge re-record, exactly as designed. A 407-line
mocked-figma harness executes the REAL bundle in a VM: generate runs the
tokens/component/version scripts (stored specHash equals the engine mirror),
the update report and amend-in-place apply are pinned verbatim, the embedded
dump script round-trips to a proposal diff, duplicate-contract-id bundles
refuse by name. Three eval pins. Residue named at merge: the worker's
receive path for plugin reads — closed days later by the **bridge origin
policy** (DUMP reads stay playground-only and refused reads never consume
the one-time payload; CONTRACTS-BUNDLE reads deliver to any origin because
the pairing code IS the auth; session minting open with per-IP limits;
53/53 worker tests). **121/121 at merge.**


## 2026-07-19 — Round 5c: the canvas gate goes 2/10 → 7/10, three at EXACT 0.00

Round 5a had taught the canvas engine to draw what the v0.3.0 contracts
carry (thirteen renderer/compile classes plus gate-harness truth fixes,
including a checked-mount bug that had every real Checkbox cell rendering
checked) — Badge 0.07% and Thumbnail 2.16% PASS, and the honest diagnosis
that the remaining eight causes were **promotion-level**, not rendering.
Round 5c fixed those six causes at the source — complement-of-product
presence (Tag's label subtree), root-hosted svg plans (Spinner's glyphs),
carried-channel re-mint when a defaultless axis contests the reviewed
carriage (Button's tone×variant paints), shape geometry recarried from
captured truth, authored-viewBox unification (Avatar), drawn pseudo-element
decor as shape parts (the RadioButton dot) — plus text-part typography
always carried (the 13px-vs-14px class). Contracts promoted **v0.3.1**; the
gate re-earned in a harnessed run: **7/10 acceptance PASS (was 2/10), with
Avatar, RadioButton, and Spinner at EXACT 0.00**, zero blank-deceptive
passes, zero unnamed >10% cells. The residue is named, not hidden: Button's
fully-masked font-raster cells, ProgressBar's runtime-% indicator, Tag's two
state-preview-vs-resting cells. The standing pin moved to the 5c numbers —
a legitimate pin move, re-earned by the run it quotes. **124/124.**


## 2026-07-19 — Round 5b: the verdict build

The owner's Polaris Contracts file rebuilt **live** from the v0.3.1
contracts: 10/12 sets amended IN PLACE — node id and key stable, including
the 220-variant Button — and the 2 exceptions were named promotions
recreated by the script's own policy, operator-retired. The Round-5c wins
render on the real canvas: Avatar initials + palette + square, the
RadioButton ring and dot, Spinner's #303030 arcs, the Checkbox check glyph,
Tag's Wholesale label, Button tone×variant fills with native shadow-button
effects (the B-3 ring loss retired), the Banner tone ribbon (the loudest B-3
gap retired). Two engine findings were named and canvas-corrected to the
compiled spec (a shape-literal fill drop — exactly one node repo-wide — and
checkbox glyph z-order). All 12 canvas notes rewritten to round-5b truth, 12
fresh surface composites committed. **The owner's first positive verdict on
a live canvas build.** Evals 124/124, `results.json` byte-unchanged.


## 2026-07-20 — The owner's live review: four visual classes → Round 5d

Defect-first, because the finding was a defect — four of them. Reviewing the
verdict build live in Figma, the owner found four visual classes the
CSS-rendering gate had scored past: the Checkbox check drew as **segmented
capsules** (Polaris's pathLength-relative dash animation channels, rebased by
computed-style capture onto the real path length); control-to-label gaps sat
**flush** and the Badge pip drew **oversized** (spec margins were a
preview-only fact the sync runtime never applied on canvas); the Banner
focus ring drew **bottom-only** (outline respelled as an inside-aligned
border that opaque children paint over); and Badge's radius and pip
**inspected as bare literals** instead of their tokens (shorthand coverage
minting sibling longhands over the semantic binding; svg import baking
paints). A gate that passes while the owner's inspector disagrees is a gap
in the gate's coverage, and it is recorded as such. Round 5d — two
extraction-layer and four emitter/runtime-layer root-cause fixes — answered
same day, below.


## 2026-07-20 — Astryx Phase A: the second system, refereed by its vendor's own docs

The second-system assessment ran four candidates hands-on and picked
**Astryx** (facebook/astryx — Meta's MIT-licensed React + StyleX system,
shipped with per-component `.doc.mjs` prop/anatomy tables). One finding
recorded rather than shaded: **Nord posted the best numbers ever measured
here (22/22 @ 100% median) but its license is proprietary — disqualified for
a public exhibit.** Phase A, all proposals-only, nothing promoted:

- **Census 23/24 @ 57% median → 24/24 @ 65%**, library-wide 216 proposals /
  21 skips → 222 / 15 (all named), via two adapter rules with eval pins on
  synthesized fixtures: keyof-enum resolution (+29 enum props, 25 keyof
  receipts, 0 refusals) and union-of-refs composition (Slider recovered at
  82% — was a named skip). Selector still correctly refuses (generic
  branches).
- **StyleX token reader** (`core/stylex-tokens.ts`): 186/186 tokens from 13
  `defineVars` tables, `light-dark()` split into the v1.6 modes shape, 79
  mode-varying, 0 skips, drift-refusing regeneration script.
- **The `.doc.mjs` referee** — Meta's own shipped docs diffed against our
  proposals, neither side winning automatically: 246 vendor props across 24
  components — 136 agree, 53 not-carried CONFIRMED real by our own receipts,
  93 named disagreements **including 35 the vendor doc itself misses**
  (Button `href`/`target`/`rel`: undocumented but shipped), 0 silent. And
  the referee earned its keep against us too: it **caught a real adapter
  gap** — heritage of interfaces with their own members was dropped silently
  — now receipted and pinned.
- 9 docs-site screenshot fixtures banked for the Phase A-2 visual gates
  (politely captured, nothing diffed yet). **124 → 127 evals.**


## 2026-07-20 — The genesis reframe: there is no kit to reconcile against

The assessment recorded it plainly (`examples/astryx/PROVENANCE.md`): Astryx
has **no official Figma library** — only an unofficial community kit at
v0.14. So the exhibit's design-side leg is not parity against an existing
kit, and cannot be. The reframe: the pipeline will **generate the first
contract-governed Figma library** for a system Meta actually ships — genesis,
not reconciliation. This is the Two Journeys developer path demonstrated at
full length: npm-shipped source in, contracts refereed by the vendor's own
docs, and a design surface that exists *because* the contracts do.


## 2026-07-20 — Round 5d: the owner's four classes, fixed at the source

All four live-review classes root-caused and retired — two at the extraction
layer (svg **dash channels drop with a named receipt** — pathLength-relative
animation vehicles are not resting truth, so the check glyph is one
continuous round-cap stroke again; **shorthand coverage** maps every
constituent longhand, so the reviewed `border-radius` binding rules all four
corners and the `imported.*` sibling mints are retired) and four at the
emitter/runtime layer (**margins now apply on canvas** — uniform sibling
gaps bind itemSpacing to the margin variable, residual margins become a real
margin-box wrapper, so the Badge pip keeps the 20px pill; **outline lowers
to an OUTSIDE-aligned stroke** — the Banner focus ring wraps the full
banner including the tone ribbon's top arc; **single-paint glyphs ride
their contract variable** after svg import, so the inspector shows the
token, with the honesty note that Polaris's pip is genuinely NOT
text-colored on 6 of 13 tones). Promotion **v0.3.2**; the gate re-earned
with pins moved — Banner 4.60→3.17, Tag 29.97→22.55, everything else
holding, still 7/10 PASS with zero unnamed >10% cells — and the gate earned
its keep AGAIN mid-round: the ring-pair rule (outline previews require the
full color+width pair; a lone resting outline-color is inert in CSS) was
caught by the gate before pinning, twice. Two new eval pins; **129/129.**
Residue named: the live canvas was NOT touched this round — the margin-box
and svgPaintVar fixes become visible at the next bridge re-amend, and
`PHASE-B5-RECEIPT.md` records exactly what that re-amend will change.

---

## 2026-07-23 — Piqueray: the first real client file, proven end to end

The reconversion off the 51-component demo lands on a real client's live Figma
file. The Button's pixel defects are fixed at source (border drawn INSIDE,
UA `<button>` chrome reset — `09d7ad4`); its icon toggles are **born in Figma**
and extracted (`ds.button@1.2.0`, `2287746`) — 158/158 page instance states
preserved, measured twice; a live landmine (`nav-state`, a designer's STRING
switch mis-typed as a color) is found and fixed before it could crash a push
(`38aee13`); and the **first real push** lands 45 token variables in the
owner's file — parity's token axis collapses from 45 findings to zero. Suite:
94/97 (3 intentional, awaiting the master rebuild in spec 002).

---

## 2026-07-25 — Piqueray fully externalized: 9 live maquettes, one contract source of truth

Spec 003 closes: every hand-copied section across Piqueray's 9 maquette pages is now
a governed Figma instance, adopted onto the real client file with a zero-pixel-loss
proof at each step — not a demo file, the one the agency actually ships from. 14
sections + the earlier 14 molecules (51 masters total across the two phases), each
with a live audit, a pixel or structural proof, and a customization ledger. Two
blocks stayed explicitly deferred rather than forced (Review-card / Avis Google — the
source is a flattened third-party screenshot, zero vector to extract).

The zero-pixel discipline caught real bugs, not just measured noise: a shared Button
glyph silently reverting from white to its dark native color on every re-adoption
(found on Hero, then swept for and found a second time — pre-existing, baked into the
already-shipped Devis master from its own clone source); an instance quietly showing
a neighboring page's default text after nine correct photo overrides and two missed
text ones (Réalisations). Each was caught by independent review before a commit, not
after — the review model deliberately kept separate from the build model specifically
so a self-report couldn't rubber-stamp its own work. One deviation stayed open at
close rather than being written off as noise: a 3-5px sub-block drift on 6 of 8 Hero
pages, real by cross-correlation but not yet root-caused with enough confidence to
fix blind — named, not smoothed over.

Running this overnight and autonomously surfaced its own failure mode: replying to a
paused agent could occasionally resume it into two live executions of the same task
rather than one — caught three times, resolved without data loss every time by
verifying the shared canvas state directly rather than trusting either branch's
self-report, and by letting whichever branch could prove a valid pre-mutation capture
finish while the other stood down. `dependancesTierces = []` held throughout — the
same zero found at T0 held at the final scan, unchanged by 14 sections' worth of live
canvas surgery. Closure artifacts: `proofs/honesty-report.md` (every deferred block,
accepted deviation and open issue in one place) and `proofs/success-criteria.md`
(SC-001–009, each claim pointed at its receipt, including the one where autonomous
execution means "owner-validated" is true in spirit — precedent-following — but not
literally re-confirmed block-by-block in real time).

## 2026-07-24 — Spec 002: governed icons + the single master update, closed

The governed icon registry (`contracts/icons.registry.json`, v1.0.0 — 13 icons)
becomes the one source the designer's Figma menu and the developer's code list
both derive from, verified by a new parity **icons** axis. The Button lowers icon
choice into INSTANCE_SWAP-bound enum props (`ds.button@1.3.0`), then rebinds its
label to a real Figma TEXT property (`ds.button@1.4.0`) — closing the last
declared parity finding from spec 001. **The single master update** landed once
on the real client file (`step(3-master)`, `c8512f7`): the label became a
bindable « Libellé » TEXT property in all 6 variants and both icon menus were
narrowed to exactly the 13 governed icons. Proven by a positional scan (77/77
Button instances; 43 text + 29 glyph overrides byte-identical) and 9-page state
photography (**0.000% on all 9 pages**, before/after) with owner restore points.
`npm run parity` reaches zero active findings; the 3 evals intentionally red
since before this feature are **green for the first time**. Suite: **102/102**
(49 legacy quarantined). Closure (`step(4-closure)`): counts synced everywhere,
the named headless-icon limitation written where the capability is claimed,
visual icon coverage restored (a real page-instance `button-with-icons` subject;
8 foreign brownfield subjects quarantined into `LEGACY_SUBJECTS` after an
external file hit a real Figma image-rate-limit), and the Contract Hub binding
map fixed to match the set by key (Button↔Bouton) so the icon governance shows
verified per-glyph.

## 2026-07-24 — Spec 004: the input atoms, native controls, and a category, closed

The four form atoms become governed. **Input, Textarea, Select, Checkbox** are
extracted from the owner-validated 003 masters (read-only REST dumps → propose →
reviewed & adopted), generated to code **and** canvas at the Button's level of
proof, and — the load-bearing part — **accessible native controls**: real
`<input>` / `<textarea>` / `<select>` / `<input type=checkbox>`, not styled divs.
That took extending the generator for **native form controls at the root** (the
demo only ever nested them inside molecules): a void/native-text root self-closes
and carries its value through `defaultValue`; a native checkable wires
`defaultChecked` from its VARIANT even with no declared event; a `<select>`'s
value is wrapped in an `<option>`. A **`category`** schema field (atom/molecule/
section, additive-optional) groups all three generated surfaces from one label
source. The icon registry reaches **16** (facebook/instagram/star; star stays
orange, D6) and `check.svg` enters as an **internal glyph** parity learns to tell
from an orphan. The whole iteration is **read-only on the live Figma file** —
proven by a `/versions` before/after with full attribution: 25 new versions, all
spec 003's, **zero** spec 004's. A lesson banked in the process: `img.ts`'s visual
instrument deliberately never resamples, so a fluid atom's size delta against a
fixed-frame master is a REAL mismatch — the fluid atoms are (rightly) not pixel
subjects; only the fixed Checkbox is. Suite **108/108**, 8/8 gates green.

## 2026-07-24 — Spec 004 post-close: the QA pass

An owner review after close surfaced real defects the gates hadn't caught — each
fixed at the source, each re-verified against the full suite before landing, all on
**PR #3**.

- **The playground controls were dead** (`1e1eb99` Contract Hub, `1bb3abd`
  Storybook). The atoms are uncontrolled (native `defaultValue`/`defaultChecked`,
  faithful to eventless masters), so a changed value/checked control never updated
  the mounted DOM. Fixed by REMOUNTING the preview on any control change — the
  dashboard keys its preview wrapper on the args; `generateStories` emits a `render`
  keyed on `JSON.stringify(args)` (Polaris example regenerated to match, `c26c0a7`).
- **The Checkbox "froze" the browser** (`963d74e`) — not a JS loop. The generator
  overlays a native `<input type=checkbox>` absolutely (`inset:0; opacity:0`) but
  left the root `position:static`, so the invisible input escaped to `<body>` and
  covered the whole page (measured 2043×1110 via `getBoundingClientRect`), eating
  every click. The generator already promoted the root to `position:relative` for
  out-of-flow parts — it just missed the native-checkable case; one condition
  (`isNativeCheckablePart`) closed it.
- **Fluid atoms DO get pixel coverage after all** (`7ddca00`, `ceb7882`) — this
  supersedes the "not pixel subjects" call above. An optional, additive `renderWidth`
  renders the code side at the master's fixed 280px frame, so the diff judges box
  styling at a shared size. **Input and Textarea match at 0.00%** (an `<input>`/
  `<textarea>` renders its text in headless Chromium). **Select is excluded** with a
  named reason: a native `<select>` does NOT render its selected-option text headless
  (the code is correct — `<select><option>{value}` — and the dashboard's real browser
  shows it), so its triptych reads as a false failure; its text fidelity rides
  build + eval, its box the figma-script canvas render. Visual subjects: **5**
  (button, checkbox, input, textarea, button-with-icons).

The pattern that held: the owner's eye caught what masked scores and headless
renders hid — twice (the freeze via a `getBoundingClientRect` measurement, the
Select via reading the triptych's `code | figma | diff` panel order).

---

**Standing scoreboard** (updated with each milestone):

| Claim | Mechanism | Receipt |
|---|---|---|
| Determinism | golden manifests, byte-compare | `evals/golden.json` |
| Refusal | illegal contracts fail by name | C2 eval family |
| Detection | every claimed drift class has a failing test | C3 eval family |
| Convergence | promotion round-trips | C4 eval family |
| Brownfield | 4 external systems extracted/diagnosed | `extract/pilots/` |
| Non-destructive sync | in-place amend, IDs preserved | CBDS + Instance Lab forensics |
| Theming | brand = token layer only | `brand-added-token-layer-only` eval |
| Enterprise scale (code) | Carbon/Fluent 2/Spectrum/Polaris at pinned SHAs, pipeline unmodified | `extract/pilots/ENTERPRISE-GAUNTLET.md` |
| Whole-kit census | 1,618/1,618 sets clean, facts/degradations counted | `npm run extract:figma:gauntlet` → `CENSUS.md` |
| Visual parity | pixel diff vs Figma's own renders, worst-first queue | `npm run extract:figma:visual` → `REPORT.md` |
| Published spec + CLI | `@ds-contracts/schema` 15.0.0 · `@ds-contracts/cli` 0.1.0 on public npm, stranger-verified | `cli-smoke` eval (byte-stable double run from scratch) |
| Journey E2E | both product journeys as standing gates, commands read only from the docs seam | `journey-engineer` / `journey-designer` evals · `evals/fixtures/journey-commands.json` |
| CI executes verbatim | every recipe `run:` step executed locally against the published CLI | `examples/ci/VALIDATION.md` |
| Plugin engine freshness | zip build refuses a stale engine by committed input-hash receipt | `plugin-engine-bundle` eval (guard fires on a real core mutation) |
| Canvas fidelity | headless canvas renders vs the real npm package, 7/10 PASS (3 at exact 0.00), every >10% cell named | `canvas-gate-standing-pin` eval · `examples/polaris/receipts/canvas-gate/` |
| Vendor-doc referee | extraction proposals diffed against the vendor's own shipped docs, 0 silent rows | `examples/astryx/extraction/DOC-REFEREE.md` |

## 2026-07-26 — Spec 006: the Google Reviews block, closed — Piqueray's first composite

`ds.review-card` and `ds.google-reviews` land net-new — the two blocks spec 003
explicitly deferred (source was a flattened third-party screenshot, zero vector
to extract). The owner chose net-new over extraction: real avatars, a real
governed `star` icon (delivered earlier, spec 004), real text, composed via
Piqueray's first `repeat` + `component` collection (5 nested `ds.review-card`
instances inside `ds.google-reviews`) — a composite class the 51-component demo
archive never exercised either (checked first, per the prior-art rule; the one
matching pattern found, `ds.avatar-group`'s fixed-width-token-on-own-root
technique, informed the repeat's equal-width children).

Adopted onto the real client file across the same 8 maquettes spec 003
externalized (+ the `Motorisation` witness, untouched throughout) — a new
**region-based proof** class (`page-parity/cli.ts --regions`, pixelmatch scoped
to a named rectangle) let each adoption claim "the block matches its region"
(7.7-7.8%, all raster: web font substitution + vector-vs-bitmap badge + one
out-of-contract photo fill) **and** "nothing outside the block moved"
(`outsideDiffCount = 0` on 7/8, the one exception on Portes de garage
investigated via calibration and owner-acquitted, unrelated text re-rasterized
by an unrelated auto-layout convergence pass). US4 then proved the block is
*governed*, not just adopted: a demo instance driven purely by properties
(5 different reviewers, one card toggled photo↔initial) on both surfaces —
code renders a real photo where canvas shows a governed placeholder, the exact
A5 boundary named rather than closed. The demo left no canvas trace; the one
diff found during cleanup (a 1px Contactez-nous footer nudge) was proven
exogenous — a concurrent edit by another writer in a disjoint zone — via
calibration (two independent captures of "now", byte-identical) rather than
absorbed into a false "9/9".

The closing canvas gesture — renaming both masters to the file's French
convention (`ReviewCard`→`Review-card`, `GoogleReviews`→`Avis Google`) — came
with a checkpoint, a 9/9 zero-pixel proof, and a written reverse procedure
(R5: canvas-only renames break `findComponentByName`'s name-based resolution on
any future re-push). Refreshing the parity snapshot after that rename then
caught a **second** instance of the exact same name-join fragility — this time
on the read side (`parity/diff.ts`'s nested-instance check), fixed at its
source with a key-first/name-fallback helper, zero `core/` touched, zero
golden churn. The matching write-side fix (`core/emit-figma-script.ts`'s
`findComponentByName`) is scoped to the backlog, named with its receipts,
rather than folded in here. Suite: **113/113 executable** (+10 new cases
across `repeat`/nested-instances/A5/convention coverage, +1 revived —
`detect-figma-missing-nested-instance`, Piqueray's first composite finally
exercising it), **107 pass** — 6 inherited reds, all already named before
006 began and reconfirmed unrelated to `ds.review-card`/`ds.google-reviews`.
48 legacy cases stay quarantined (slots, dark theme, a second brand — still
none of those exist in Piqueray).

## 2026-07-27 — Spec 010: 27 new governed components, 34 total (7→34)

**Summary**: The full Piqueray component library extracted from the Figma canvas into governed contracts — 2 missing atoms, 13 molecules, 12 organisms — for a total of 34 governed components. Icon registry extended 16→19 (v1.2.0).

**Components adopted** (all v1.0.0, provenance: extracted):
- **Atoms (2)**: MemberPicture, PiquerayLogo
- **Molecules (13)**: AccordionRow, Avantage, CarouselControls, Carte, Copyright, Field, FooterColumn, MemberCard, NavItem, ProductCard, Realisation, SectionHeader, Tab
- **Organisms (12)**: Coordonnees, Devis, Equipe, FAQ, Footer, Formulaire, Header, Hero, Presentation, Reassurances, SAV, TexteSEO

**Infrastructure**:
- Icon registry: 16→19 entries (v1.2.0, +external-link, mail, octicon-chevron-down12)
- Button: widened icon enums to 19 (v1.5.2)
- All 34 components generate successfully (`npm run build`)
- figma-sync renumbered (35 scripts + 2 batches)
- Dashboard: 34 components live

**Known limitations (named, not silent)**:
- Presentation default text: apostrophes sanitized to avoid JSX generator bug (U+2019 treated as string delimiter by Prettier)
- 3 Figma token references not in DTCG tokens (noir-pur→noir-bleute, rouge/gris-clair removed)
- 13 parity drift findings: expected post-extraction (Figma properties not yet promoted into contracts)
- Eval suite not run (scratch-dir Node v24 issue, user-requested skip)

## 2026-08-05 — Spec 015: the geometry blind spot, closed on the code side

**Journal gap, named:** specs 011, 012, 013 and 014 have no entry here. 015's is
filed on top of that hole rather than pretending it isn't there — their record
lives in their spec folders and the commit log.

**The problem, with its receipt:** the three-way differ watches geometry through
the token axis. A padding carried as `"89px"` sits on no axis at all — nothing
proposes it, nothing flags it, and parity stays green while the surfaces drift.
Spec 013 had proved the cost: a footer "fixed" with hard numbers went from
96.91 % to 1.04 % pixel gap — a green render on an invisible fact.

- **208 invisible geometric values → 0**, read live by a new fail-closed gate
  (`npm run geometry:gate`). 196 literal→token conversions across 27 contracts,
  all pure — the before/after register proves zero pixel movement from them,
  line by line. 83 references minted from-dump (6 `space.N`, 77
  `size.<component>.*`), each `$description` citing its node and date, none
  rounded to fit the scale.
- **Named literals, not zero literals**: the 2 hero gradient veils have no
  legitimate vocabulary, so they are *declared* in a closed registry
  (`contracts/named-literals.registry.json`) the gate reads live — and the
  `background-image` channel was lifted with its **own** bounded grammar
  (`linear-gradient(...)` only; radial/conic refuse by name). Carrying them
  measured 27.83 % → 10.66 % on the hero.
- **One box model across four surfaces**: the delivered React library was the
  only surface not border-box — 9 contracts rendered wider for consumers than
  for the designer, and the instrument could not see it. Fixed at the emitter,
  plus **three content-box values corrected at the source** (`ds.sav`
  wrapper/imgGroup, `ds.footer` root 1550→1728, `ds.faq` root 1550→1728) — each
  ratified by its line falling bit-for-bit back onto its pre-fix number.
- **The loop proven, not assumed**: a geometry change injected on each side is
  detected. Testing that premise found a real hole — `parity/diff.ts` extracted
  `cssVars` but never compared them, so `var(--token)` → raw value passed parity
  with exit 0. Wired into the existing axis rather than worked around.
- **014's measure gate: `contract-geometry` 6 → 0**, PASS, read live. What that
  0 covers — 3 real repairs, 2 argued re-classifications, 1 deferral that keeps
  the cause — is stated in `specs/015-geometrie-gouvernee/RAPPORT-CLOTURE.md` §4.
  Suite: **183/183** (+1 case, `react-box-model-border-box`).

**Named limits (the honest half).** "Zero invisible values" is scoped to layout
channels: 89 trait/paint/typography literals remain out of scope and therefore
still invisible — the live count is published, not the opening estimate. The
canvas axis is *acknowledged, not watched*: the 83 new references have no Figma
variables yet (015 was read-only end to end), which is why `parity/baseline.json`
went from 7 to 89 acknowledgements — spec 016 restores that axis. And
**DW-014-002, whose register destination said "015", is NOT resolved**: the
visual-parity instrument still renders `emit-html`, never the delivered React
surface, so SC-003 rests on direct measurement and the new eval rather than on
that instrument.

## 2026-08-05 — tinyspec `select-option-emit`: the two named engine defects closed with measured proof

The first tinyspec (small-change track): both `core/emit-html.ts` defects from
the deferred-work register repaired — the delivered React library unchanged by
one byte (golden's 213 hashes re-derived, diff empty; the one real re-pin was
the plugin engine receipt).

- **DW-014-001** — a part that IS the `<select>` emitted its text as a bare
  child, dropped by the HTML5 parser (014's empty capture, mask coverage 0).
  Now wrapped in a bare `<option>` on both text branches — the shipped React
  surface's exact shape, no state attributes. Fixture red first
  (`emit-html-select-option-text`, now a standing C1 eval); re-measured
  **0.85 % → 0.17 %**, « Texte de saisie » paints, the same score signature
  and ~179×20px text region as `input`; triage re-classed `engine` →
  `rendering` (receipt `pv-select.json`). Named deviation: the expected
  `maskCoveragePct > 0` is NOT met — the native widget paints its value
  itself (input's documented text-mask miss); the proof is the capture and
  the drop.
- **DW-015-001** — the html border-box rule hung on the shared BEM prefix no
  multi-root node carries. Now one rule per top-level root via `topRoots`
  (emit-react's loop), single-root path byte-identical; the finding fixture
  hardened into the standing assertion (red first, archived in the receipt).
- **The printed count closes the register**: `resolvedBy` extended from
  `entries` to the `deferredWork` roster (policy fixture red first), so
  `npm run measure:gate` reports **deferred work 4 → 2** — PASS, zero
  refusals, `contract-geometry` still 0. Remaining: DW-014-002 (instrument
  renders emit-html, not the delivered React) and DW-014-003 (rich-text
  through composition).
- Visual baseline refreshed at head (40 rows, `--write-baseline` after a full
  reviewed run — the stale 006-era 13-row baseline is finally current); the
  full-run REPORT diff touched exactly one row: select. Suite: **184/184**
  (+1 case).

## 2026-08-06 — Spec 016: the canvas axis restored — 89 acknowledgements → 3

**Journal gap, still named:** specs 011 to 014 still have no entry here. 015's
was filed on top of that hole and 016's does not fill it either — their record
lives in their spec folders and the commit log, and `docs/handoff/10-history.md`
still stops at spec 002.

**Where 015 left it:** the geometry blind spot was closed on the *code* side,
but the 83 references it minted had no Figma variables — the canvas axis was
*acknowledged, not watched*, and `parity/baseline.json` carried **89**
acknowledgements. Restoring that axis meant writing on the real client file
again, on the 9 maquettes the agency ships from. Twenty-nine commits on the
branch, seven of them on the closing day (`f854cc2` → `08f7d22`).

- **The axis is watched again: 89 → 3 acknowledgements, none of them geometry.**
  The 83 references became **83 variables in the client file** (77 `size/*` +
  6 `space/*`) with a **zero-pixel** proof — 9/9 maquettes `identical`, second
  pass idempotent (`created: 0`) — and variable **bindings went from 10 on 3
  masters to 562 on 31** (`proofs/bindings-audit-avant.json` /
  `bindings-audit.json`). `npm run parity` exits 0 with 3 named acknowledgements
  and **zero `figma-tokens` entries**; `geometry:gate` still reads `invisible 0`.
- **The sentinel, run twice — the claim is detection, not green.** A geometry
  variable changed by hand in the maquette (`size/carte/root` **364 → 999** at
  opening, **363,5 → 999** replayed on the final state) produced the exact
  finding `figma-tokens|mismatch|Primitives/size/carte/root [Value]` — classified,
  located by token path + mode, carrying **both** remedies (adopt the canvas
  value, or push the token), parity exit 1. Reverted: exit 0 and two
  **byte-identical** passes. The second run (`proofs/recus/sentinelle-T073.md`)
  is on the closing state — the capability survives 11 regenerated masters and
  83 new variables, which is the only version of that claim worth having.
- **Regenerating a real client file taught the engine thirteen defect classes**,
  each one measured live → **red fixture first** → fix → re-amend → re-measure:
  the font family hardcoded to `Inter` (a full regeneration would have replaced
  the typography of the entire system — caught by piloting **one** component
  before 44, and by the owner's eye on a readable visual review); a border color
  without width drawing a solid stroke where CSS draws nothing (11 parts, 8
  contracts); absolute parts placed back in flow; per-prop icon size ignored;
  dependency resolution by **marker** (`findComponentByName` was matching the
  literal name — the master is « Bouton », the contract says Button; §VIII:
  identity is never a layer name); `component.slots` (schema **v20**, additive —
  a composed child's slot content becomes a contract fact instead of a manual
  override erased at every rebuild); the zero-height line rule (a frame cannot
  carry an INSIDE stroke without occupying height — the Figma clamp 0→2 measured,
  then taught to the mock); the `componentPropertyReferences` **merge** — a part
  both TEXT-content and BOOLEAN-visible lost its characters reference, which had
  silenced **every** instance TEXT override in the file (12 sites merged; one
  witness re-lit itself); INSTANCE_SWAP by name where the API demands an id;
  **VARIANT axis gain** (a set gaining a dimension completes its variant names
  and merges with its fresh twin — made non-destructive after the adversarial
  review); width on a text block = wrap; and the **CSS text-flow rule** (in CSS
  every text wraps to its box — Figma's auto-width has no equivalent).
- **57/57 photos, 11 carrying masters, none lost.** The pass was censused master
  by master, and it went the other way too: a photo lost *before* the spec (the
  Devis CTA background, hash `7825ba2d…`) was found still in the file and
  re-posted on the master and its 8 instances — the CTA got its width back in
  the same pass (`size.devis.root` minted from-dump at 1728, the contract
  declared no width so HUG had shrunk the master to its title).
- **The maquettes' overrides came back from a versioned dump, not from memory.**
  The REST dump pinned at `version=2384251202054787848` (the restore point
  `016/U1a-variables/avant`) holds the whole pre-spec state, so every page delta
  became arithmetic per section instead of a guess: **205** diff-only
  property/text gestures, then **198** style-range and alignment gestures — the
  rich text (« Discutons **de votre** projet » with its per-character weights,
  letter-spacing and fills) that flat `characters` re-posts had quietly dropped.
  **~90 % of the page pixel diff absorbed between FINAL4 and FINAL18**; at
  FINAL21 vs the pre-spec reference, **3 maquettes are exact** and every
  remaining delta has a name, a cause and a status.
- **Contract elevations, and the suite:** `button` **2.0.0 — a major bump**
  (`outilneNoir` → `outlineNoir`, the typo fixed at the source with its 7
  internal call sites migrated), `section-header` 2.1.1 (emphase + alignement
  leave `kind: NONE` for real VARIANT axes, 16 variants — the owner's « la
  régression c'est la typo »), `faq` 1.3.0 (a BOOLEAN declared but wired to no
  part: a `repeat` item cannot carry an individual `visibleWhen`),
  `accordion-row` 1.2.0 (open content is AUTO, not a fixed height minted from a
  short extraction sample), `presentation` 2.2.0, `nav-item` 1.2.0, `equipe`
  1.1.2. Suite **184 → 193/193** (48 quarantined): the adversarial review found
  **nine** of the day's fixtures wired to no gate at all — all nine now run in
  `evals/run.ts`.

**Named limits (the honest half).** The restored axis watches the **existence**
and the **value** of variables, never the *bindings*: a designer who detaches a
dimension at node level and types a raw value leaves the variable intact and
conform, and the differ says nothing — `parity/diff.ts` never reads
`boundVariables` (0 occurrences, verified). The hole is caught in deferred mode
by the binding audit and by any regeneration, never continuously. The
source-defect register closed **9 of its 10** opening items with receipts
(B013-4, the hero/sav TEXT props, was not done) and **grew to 13**: three
defects the work itself discovered, all open — `D-016-CARTE-BOUTON` (the
Categorie cards' button is unfaithful to the origin *in the contract*, and is
the bulk of the remaining page pixel diff), `D-016-SECTIONS-LOCALES-CARTES`
(ungoverned client sections re-layout their nested cards at every rebuild; the
owner arbitration is govern them or re-post their layouts) and
`D-016-REPEAT-SAMPLE-PAR-VARIANTE` (a repeat's single sample is re-lost at each
rebuild). And the 9 maquettes are governed by **no document at all**: restoring
their overrides took 403 generated gestures — proof that the question of who
governs page assembly exists, not its answer.

Four things the work learned about itself, worth more than the counts:
**« TEXT survives » only holds for amend-in-place** — a variant REBUILD recreates
internal nodes and orphans every downstream instance override, TEXT included, and
rebuilding a master's children loses INSTANCE_SWAP overrides outright (same risk
family as the photos, now extended to swaps). **The first capture of a session
never counts**: a frame carrying an `IMAGE` paint exports incomplete before the
image is decoded (measured — two different sha256 with no gesture between), so a
§X BEFORE capture taken cold documents a state that never existed; warm up, then
capture. **`exit 2` is not a verdict** — an instrument refusing to rule
(dimension-mismatch) never authorizes a conformity conclusion, and a readable
visual review is worth a verdict because it shows the defect to whoever knows the
design. **Attribution never happens at the page pixel** — ~40 % of the page diff
was cascade from upstream shifts; the per-section REST dumps are what made each
delta arithmetic. Left standing: MemberCard and the A5 image boundary (spec 017),
DW-014-002 (the visual-parity instrument still renders `emit-html`, never the
delivered React surface), and the 89 stroke/paint/typography literals — 015's
pattern applied to its next population, another spec.

## 022 — the shell, projected: Piqueray's nav bar as an Odoo system header (2026-08-20)

*(Journal gap named, not silent: `MILESTONES.md` skips specs **017, 018, 019, 020,
021**. 022 files on top of that hole rather than pretend it isn't there — the
record of those specs lives in their spec folders and the commit log.)*

Two strict phases. **Amont** (phase 2, closed earlier): `ds.header` **1.0.0 →
2.0.0** (MAJOR — the unused `Fond=Solid` variant retired at the source, one canvas
gesture with a §X capture and a named version), `ds.piqueray-logo` adopted **1.0.0**.
**Projection** (this milestone): the bar delivered as an Odoo **system header** —
a template inheriting `website.layout` and replacing the native nav zone, rendering
logo/links/CTA/icons from the governed CSS and the **native `website.menu` data**,
edited by Odoo's own menu dialog. Suite stayed **219/219**; **zero** schema change
(the `propsByProp` channel died with Solid), **zero** emitter edit (no polaris
re-pin), one shell root added to the integration.

**The proofs held.** SC-001 measured **0.0129 %** of pixels against the governed
`emit-html` reference (the residual is almost entirely the CTA arrow glyph — the
reference renders the registry's filled arrow, `pqr_button` inlines a stroked one,
a 019 characteristic inherited, not a 022 defect). SC-006 is the load-bearing one:
a full regeneration (`build → odoo:assets → -u`) reproduced the header CSS **to the
byte** AND left the client's edited `website.menu` **byte-identical** — the
apparence is governed and regenerable, the content is the client's and untouched
(FR-016). SC-002/003/004/005 and the 8 sections all green.

**Five premises were false when measured** (the SC-009 pattern, again): (1)
`emit-html` renders **no** vectorAsset — the SC-001 reference logo was blank until
the *instrument* (`render-html.mts`, not the emitter) was taught to inject the
governed SVGs and a `dark` comparison surface; PHASE-AMONT gap #2 closed. (2) The
now-active system header pushes every measurement frame down ~86 px, and the 80 px
viewport guard clipped the capture by 6 px — a latent flaw for the sections too,
fixed at the shared `viewportFor`. (3) The accessible home-link `<a>` around the
logo lifted it 3.5 px (inline line-height > the 34 px box) — a `display:flex`
bridge rule pinned it back. (4) Odoo caches the home render **per URL**; a scenario
that edits the menu between reads measured a frozen bar until a cache-busting query
was added. (5) Per-website menus carry **no xml_id** (spike S2) — the tops'
`parent_id` isn't referencable in XML, so the seed's fixups (parent, default
removal, header switch) live in a flag-guarded Python hook, deletion-of-a-seeded
record named as an FR-016 edge (noupdate recreates it).

One architecture call named: the lock pins the posables ∪ shell closure, but the
`graphDigest` stays the **posables-only** signature — it marks staleness of *saved*
section HTML, and the header is never saved; folding it in would falsely stale
every section. The shell is pinned by per-entry sha256 instead. Left standing and
cited without re-diagnosis: the two pre-existing reds (`odoo:qualification`,
`editability-boundary` 43/44), and DW-014-002 still open (the instrument renders
`emit-html`, not the delivered surface — 022 rendered the *reference* faithfully
for the header by injecting vectors, but the delivered-surface question is untouched).

**Post-delivery, the fixed-width limit was closed at the source (2.1.0).** The owner
flagged the bar rendering 1728 px fixed while every section is FILL — and asked the
right question: *shouldn't the Figma be fixed first?* It should (§VIII). An Odoo
full-width bridge was started, then reverted as the forbidden workaround. The source
truth (016's pinned dump) confirmed the master was `layoutSizingHorizontal: FIXED`
— the odd one out. The gesture: master FIXED→FILL, and the 1px component-set stroke
removed so the master stayed **exactly** 1728, keeping all **10 usages untouched**
(a first attempt lost 2px and dragged 7 usages — §X caught it, reverted, and the
stroke was the culprit). Re-mirrored into the contract (`layout.width: "fill"`,
`referenceWidth: 1728`, fixed width token dropped — hero's exact shape), bumped
2.1.0, re-pinned across lock/golden/engine-receipt/catalog/figma-sync. Result:
`.header` renders `width: 100%` on both surfaces, the bar fills 1920→1920, and
SC-001 holds at **0.0129%** (in the 1728 frame, `fill` = 1728, pixel-identical) —
governed full-width, not a hosting hack. Still deferred: mobile responsive (burger).

## 2026-08-21 — 023 Catégories gouvernées : un colonnage réglable par le rédacteur

Le bloc « Catégories principales » — réparé au pixel par 021 mais hors contrat —
devient gouverné de bout en bout : deux contrats extraits d'une source nettoyée
(molécule `ds.carte-categorie` à un axe Style, section `ds.categories-principales`
avec un enum de colonnes {2,3}), scandés par **quatre gates owner** (A modèle
cible, B pixel, C contrats, D éditabilité), tous validés et tracés. La pièce neuve
est **US2** : `ds.categories-principales` devient la **11ᵉ racine posable Odoo**, et
son sélecteur 2|3 colonnes offre au rédacteur un réglage de **colonnage** — le premier
de ce genre, même si la couche Odoo portait déjà d'autres enums rédacteur (la note des
avis Google, par ex. ; l'affirmation initiale « premier enum tout court » était fausse,
corrigée à la revue). Prouvé sur instance jetable isolée, **18 constats sur 18** : bascule 2→3 avec
la 4ᵉ carte qui passe à la ligne (3+1, zéro débordement), collection ordonnée,
CTA gouverné (`javascript:` refusé), section vidée réversible, isolation,
persistance aux trois points de contrôle.

**Trois défauts que seule l'implémentation — ou la QA live — pouvait révéler.**
`emit-html` **ignorait `columns`** : l'extension E1 avait patché `emit-react` (T021)
mais pas son jumeau HTML, si bien que la classe `--colonnes-3` n'existait ni dans la
CSS Odoo ni dans la parité visuelle — la bascule de colonnes aurait été sans effet
visuel, et personne ne l'aurait vu tant qu'une section ne serait pas passée à 3.
La **grille vidée s'effondrait à 0 px** et devenait insélectionnable : l'état vide
que le Gate D exige « propre et réversible » ne l'était pas — trouvé en cliquant une
section sans carte sur l'instance réelle, corrigé par une hauteur minimale bornée à
l'éditeur. Et le **modèle d'env** (`.env.example`, sans secret) était happé par la
règle large `.env*` du `.gitignore`, donc absent des worktrees frais et rouge à la
porte de structure du module — un trou d'approvisionnement, pas un défaut de code.

**Deux portes rouges pré-existantes, mesurées inchangées** : `odoo:qualification`
(reçu 019) et `editability-boundary` (43/44, champ stale présentation) — mes
changements `authoring.js` sont additifs, aucune part de présentation touchée. Et un
détail de méthode qui a coûté deux faux « vert » : **un `| tail` ou un `; echo`
final masque le code de sortie du process en amont** — la notification disait
« exit 0 » sur un scénario qui avait exité 1. Le code de sortie ne se lit que sur le
process lui-même.

**Deux dettes laissées nommées, pas tues** (Principe V) : `ds.carte` → v3.0.0 (retrait
de `disposition: categorie`) — confirmé par l'owner mais reverté à v2.0.1 quand la
cascade s'est révélée bien plus large que la proposition (`reassurances.authoring.json`
livrée, ~105 entrées) : à reprendre en travail ISOLÉ ; et la **pin de baseline de
parité visuelle**, différée parce que `--write-baseline` écrase en bloc et épinglerait
la dérive d'autres specs. Rapport complet : `specs/023-categories-gouvernees/
RAPPORT-CLOTURE.md`.

**Trou de journal, encore nommé** : `MILESTONES.md` saute toujours les specs 011-016.
Cette entrée documente 023 ; elle ne comble pas le trou antérieur.
