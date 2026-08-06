/**
 * TRIAGE — the committed named-cause table for visual-parity rows.
 *
 * Every diffed row with a strictly positive authoritative raw score must
 * match a rule here or the report prints it as **UNTRIAGED** (loud, ranked
 * first in the distribution section) — a standing queue entry, never a
 * silent residue. A row exactly at 0% is not divergent at all (D8) and needs
 * no rule. Rules are CLASSED so the distribution can say what kind of delta
 * remains — six values, closed, bijective with the labels published in
 * CAUSE_LABELS (014, FR-004; contracts/cause-vocabulary.md is the contract
 * this table implements):
 *
 *   · contract-geometry — the contract carries a false geometry, or none at
 *                    all (a literal that should be a token, a layout axis
 *                    the contract doesn't bind, a shared instance sized
 *                    wrong). Entry for 015 (governed geometry).
 *   · image-boundary — Figma paints a real bitmap (photo, background image,
 *                    IMAGE fill) that the contract's transport declares out
 *                    of scope (capability matrix A5) — the placeholder wash
 *                    or an unpainted plane stands in for it. A declared
 *                    limit, not a defect being chased.
 *   · rendering    — Chromium and Figma disagree about rendering the SAME
 *                    fact (font/glyph rasterization, text-hug metrics, icon
 *                    vector antialiasing, shadow blur kernels, curved-edge
 *                    antialiasing). Named in the report header; not
 *                    tolerated away — the score still counts it.
 *   · engine       — our emitters render the contract wrong. FIX IT; a rule
 *                    of this class is an open defect being tracked, and the
 *                    report says so.
 *   · instrument   — the measurement itself is in question: a dump that
 *                    cannot carry the channel (VECTOR glyph geometry #42,
 *                    text lineHeight, child internals behind an
 *                    out-of-scope contract), or the ALPHA_TRIM
 *                    content-box crop compounding a small real delta on
 *                    rows whose ink is mostly transparent.
 *   · figma-source — the FIGMA side draws something else than it should
 *                    (state previews the generated file has not re-synced;
 *                    an instance override that contradicts its own set).
 *                    Entry for 016 (canvas source cleanup).
 *
 * A rule names its evidence (receipt / commit / dump note) in one line.
 * Adding a rule is a reviewed act: the cause must be verifiable, not a
 * shrug. Deleting the row's cause (by fixing it) is the goal.
 *
 * History (014, decision D1): five classes (engine, capture-gap, renderer,
 * harness, design) became six. `engine` is unchanged. `renderer` renamed to
 * `rendering`. `design` — declared since day one, never employed by a single
 * rule — is now `figma-source`. `capture-gap` split in two along its own
 * fault line (contracts/cause-vocabulary.md §3): the A5 image-frontier half
 * became `image-boundary`, the capture-channel-limit half joined `harness`
 * under `instrument`. `contract-geometry` is new — no prior class said "the
 * contract's own geometry is the problem."
 */

export type CauseSlug =
  | 'contract-geometry'
  | 'image-boundary'
  | 'rendering'
  | 'engine'
  | 'instrument'
  | 'figma-source';

/**
 * The table of publication IS the FR-004 contract: a bijection slug ↔
 * French label, verified value-for-value by evals/fixtures/triage-vocabulary-check.ts.
 * Slugs stay English (visual-parity/ is commented in English end to end,
 * decision D1's rejected alternative); the published label is where French
 * lives, because that's the surface FR-004 makes verifiable.
 */
export const CAUSE_LABELS: Record<CauseSlug, string> = {
  'contract-geometry': 'géométrie du contrat',
  'image-boundary': 'frontière image (limite A5)',
  rendering: 'rendu/rastérisation',
  engine: 'défaut moteur',
  instrument: 'défaut d\'instrument',
  'figma-source': 'défaut de source Figma',
};

export interface TriageRule {
  subject: string;
  /** Matched against the variant name; omit = every variant of the subject. */
  variant?: RegExp;
  class: CauseSlug;
  /** One line, evidence named. */
  cause: string;
  /** specs/014-…/proofs/recus/<id>.json — required for a rule ADDED by 014
   *  (FR-012); rules re-classified from a pre-014 cause carry their receipt
   *  from Phase 6 (US5, T030) instead, once re-tested. */
  receiptId?: string;
}

/**
 * Rules moved OUT of TRIAGE (014, cause-vocabulary.md §4.2): `heading`,
 * `switch` and `badge` name contracts removed at the Piqueray reconversion —
 * none exists in `contracts/`, none is a parity subject (live or
 * LEGACY_SUBJECTS quarantine), so none can ever fire again. Leaving them in
 * TRIAGE without a valid slug would fail the vocabulary fixture's property 3;
 * inventing one would count them in the FR-011 dimensioning output where
 * they have no business; deleting them outright would violate the repo's
 * honesty convention (a degradation is named, never silently dropped). A
 * cause that can no longer cause anything is a datum, not garbage.
 */
export interface RetiredRule {
  subject: string;
  /** The class this rule carried before it was retired — historical record,
   *  intentionally NOT re-classified into the six-value vocabulary (it will
   *  never be counted again). */
  originalClass: 'engine' | 'capture-gap' | 'renderer' | 'harness' | 'design';
  /** Why it can never fire again. */
  reason: string;
  /** specs/014-…/proofs/recus/<id>.json — the re-test that confirmed "can
   *  never fire again" (014, T030): no contract, no parity subject (live or
   *  LEGACY_SUBJECTS quarantine), no catalog entry. */
  receiptId?: string;
}

export const RETIRED_RULES: RetiredRule[] = [
  {
    subject: 'heading',
    originalClass: 'renderer',
    reason:
      'ds.heading was removed at the Piqueray reconversion (the 51-component demo system archived, 001-piqueray-button); no contract, no parity subject, live or quarantined.',
    receiptId: 'retired-heading',
  },
  {
    subject: 'switch',
    originalClass: 'renderer',
    reason:
      'ds.switch was removed at the Piqueray reconversion; no contract, no parity subject, live or quarantined.',
    receiptId: 'retired-switch',
  },
  {
    subject: 'badge',
    originalClass: 'renderer',
    reason:
      'ds.badge was removed at the Piqueray reconversion; no contract, no parity subject, live or quarantined.',
    receiptId: 'retired-badge',
  },
];

export const TRIAGE: TriageRule[] = [
  // ---- Piqueray molecule extraction pilot ----------------------------------
  {
    subject: 'member-card',
    class: 'rendering',
    cause:
      're-measured 2026-08-06 (017/US2, FR-008 — the inherited A5 cause is RETIRED, not reconducted): with the mockup sample lent to our side the row fell 47.88% → 1.76%, UNDER the 2% line. So the old cause ("Figma paints the real portrait while we render the #D9D9D9 placeholder") was measuring the ABSENCE OF DATA on our side, not a fidelity defect. What remains is a diffuse raster/anti-aliasing delta over the shared portrait — the ordinary renderer floor.',
    receiptId: 'pv-member-card',
  },
  {
    subject: 'product-card',
    class: 'rendering',
    cause:
      're-measured 2026-08-06 (017/US2, FR-008): 15.64% → 0.41% once the mockup sample was lent to our side, UNDER the 2% line. The inherited A5 cause is RETIRED: the empty image plane was an instrument condition, not a component defect. Residual is the renderer floor over the shared photo.',
    receiptId: 'pv-product-card',
  },
  {
    subject: 'realisation',
    class: 'engine',
    cause:
      're-measured 2026-08-06 (017/US2, FR-008 — and the inherited cause was FALSE, not merely imprecise). REST read of set 2095:2484: the master carries NO IMAGE PAINT AT ALL on either variant — root COMPONENT fills SOLID #dfdfdf, one child `Image` (FRAME) fills SOLID #d9d9d9. So no photo can be "lent" to make this fair: Figma has none either, and giving our side one would CREATE a gap. The ~99% is a FLAT-FILL gap over the whole surface, and its dominant driver is an ENGINE divergence between our own two surfaces: the figma emitter paints the #D9D9D9 reservation wash for an `img` part (spec.imgPlaceholder → lits.fillColor) while emit-html — the surface this instrument renders — paints nothing. A second, smaller fact rides along and is named rather than folded in: the contract carries neither the master root\'s #dfdfdf nor the image plane\'s #d9d9d9. Both are recorded in specs/017-photos-honnetes/registre/defauts-decouverts.json (D-017-REALISATION-PAS-UNE-FRONTIERE-IMAGE); neither is repaired here — one touches an emitter, the other a contract anatomy, and 017 forbids itself both. Note the collision with DW-014-002: the instrument renders emit-html, never the delivered React surface.',
    receiptId: 'pv-realisation',
  },
  {
    subject: 'carte',
    class: 'rendering',
    cause:
      're-measured 2026-08-06 (017/US2, FR-008 — the inherited cause is RETIRED, not reconducted). With each variant lent ITS OWN mockup sample, Reassurance fell 64.05% → 3.43% and Categorie 56.34% → 0.64% (UNDER the 2% line). So the dominant driver was the absence of data on our side, exactly as suspected but never proven until the equal-arms pass. Two facts came out of it and are named rather than folded in: (1) the master paints TWO DISTINCT photos, d62d8bf3… on Disposition=Reassurance and 3c54b9a6… on Disposition=Categorie, while the contract binds BOTH img parts to the single `imageUrl` prop — which is why this subject needs comparisonPropsByVariant and a flat record would have made one line lie; (2) the 3.43% residual on Reassurance is a diffuse delta over the shared photo, not an image frontier. D-016-CARTE-BOUTON (ds.carte renders one `action` part where the master carries three children) was expected to surface from under the old 56.56%: at 0.64% on Categorie it is NOT the dominant residual — it stays open in specs/tiny/carte-bouton-glyphes.md, re-measured rather than re-asserted.',
    receiptId: 'pv-carte',
  },
  {
    subject: 'field',
    class: 'engine',
    cause:
      'open composition defect: re-tested 014/T030 — the red-border/aria-invalid half of the prior claim no longer measures (both are now correctly wired: Field.tsx sets aria-invalid from `etat`, and the triptych shows the SAME red border + red "Message d\'erreur" on both sides for Etat=Erreur) and is dropped here rather than reconducted. What remains, confirmed: the OUTER Field box matches Figma exactly (560×162 / 560×212, Δ0) while the SLOTTED Input still keeps its intrinsic width inside that identically-sized box — visible in the triptych as Figma\'s input/label rules extending further right than ours.',
    receiptId: 'pv-field',
  },
  {
    subject: 'tab',
    class: 'rendering',
    cause:
      'geometry is exact at 172×82 device px; residual is the master text plane rendering uppercase glyph ink while the bound Figma TEXT property reports default « Onglet », plus cross-renderer glyph rasterization.',
    receiptId: 'pv-tab',
  },
  // ---- button (Piqueray ds.button vs the owner file's « Bouton » set) ------
  // (Two demo-era rules removed 2026-07-23: State=Disabled / State=Focus
  //  Visible matched variants of the DELETED demo Button — the Piqueray axis
  //  is `Property 1=…`, so they could never fire again. The old catch-all
  //  cause described the demo's Inter label (19.36px) — wrong file, wrong
  //  font; replaced by the measured Piqueray causes below.)
  {
    subject: 'button',
    // Re-tested 014/T030: this regex read `/Property 1=Link/` and had gone
    // DEAD — the button's Figma variant axis was renamed "Property 1" →
    // "Style" (contracts/button.contract.json binds `bindings.figma.property:
    // "Style"`) some time after this rule was written (2026-07-23), and the
    // live report now names the row "Style=Link". A dead regex doesn't drop
    // the row (D8 would flag that loudly as UNTRIAGED); it silently falls
    // through to the catch-all below instead, which cites "436 vs 440" width
    // kerning that does not apply to this 307×24 all-text row. Fixed to match
    // current reality — pv-button-link.json is the re-test receipt.
    variant: /Style=Link/,
    class: 'rendering',
    cause:
      'all-text row since the 2026-07-23 icon toggles (« Icône gauche/droite » BOOLEAN default off): neither side draws an icon at defaults, the DOM-derived text mask covers everything → masked score null BY CONSTRUCTION; ranks by its unmasked glyph-raster delta, proportionally large on a ~370×24 canvas (same class as Default/Orange, smaller denominator). NAMED COVERAGE GAP: icon rendering is no longer exercised by this gate — needs a subject prop-preset (iconRight=true vs a property-set Figma render) to come back under pixel proof.',
    receiptId: 'pv-button-link',
  },
  {
    subject: 'button',
    class: 'rendering',
    cause:
      'Montserrat kerning: Chromium kerns, Figma does not — the label runs ~4 device px narrower (436 vs 440) and the delta rings glyph edges after center-padding; on bordered variants the inset-border ring rides the same shifted edges (Outilne noir), while white-on-transparent ink stays under-counted (Outline blanc, noted in the header)',
    receiptId: 'pv-button',
  },

  // ---- checkbox (catalog contract) ------------------------------------------
  {
    subject: 'checkbox',
    class: 'rendering',
    cause:
      'label advance-width hug (ours Δ-7 device px) shifts the center-padded pair; residual masked ink is the control-box edge ring + Figma label pixels escaping the DOM-derived text mask',
    receiptId: 'pv-checkbox',
  },

  // ---- shoelace-button-group (kit redraw; child Button is a STUB) -----------
  {
    subject: 'shoelace-button-group',
    variant: /type=default/,
    class: 'instrument',
    cause:
      'capture-channel limit (ex-capture-gap, cause-vocabulary.md §3): child Button is a STUB (observed box + fill only — the Shoelace kit\'s real Button set is not in the dump): the default button\'s gray border ring and label chrome have no witness, so ours paints an unbordered box (stroke inconsistent across observed variants — named stub note)',
    receiptId: 'legacy-shoelace-button-group-default',
  },
  {
    subject: 'shoelace-button-group',
    variant: /type=primary/,
    class: 'instrument',
    cause:
      'capture-channel limit (ex-capture-gap): child Button is a STUB: primary fill carries (observed paint), but the stub\'s internal label inset/weight and pill radius are child internals with no witness — residual is stub-internal chrome + label raster',
    receiptId: 'legacy-shoelace-button-group-primary',
  },

  // ---- shoelace-tooltip (arrows are VECTOR nodes) ----------------------------
  {
    subject: 'shoelace-tooltip',
    class: 'instrument',
    cause:
      'capture-channel limit (ex-capture-gap): arrow VECTOR geometry is not in the dump (#42 — receipted vector-geometry-unsupported ×8 / rotation-unsupported ×6): Figma renders the arrow (Δ12 device px on the arrow axis), ours renders the box only; per-placement layout itself differs correctly (layoutByProp)',
    receiptId: 'legacy-shoelace-tooltip',
  },

  // ---- eventz-button (client kit; icons are child stubs; secondary/bare washed)
  {
    subject: 'eventz-button',
    variant: /variant=bare, state=(default|active)/,
    class: 'instrument',
    cause:
      'capture-channel limit (ex-capture-gap): Figma renders the bare variant\'s design-time slot instances (icon + spacing, 149px wide) that the dump carries only as slot defaultContent stubs — ours renders the 66px text-only truth of the contract\'s empty-slot state (named proposal note)',
    receiptId: 'legacy-eventz-button-bare',
  },
  {
    subject: 'eventz-button',
    variant: /state=focus/,
    class: 'rendering',
    cause:
      'real-browser focus ring vs Figma\'s drawn ring: ring corner geometry and blur differ per renderer (Δ-6 device px width is the icon-stub inset below), residual is ring-edge ink',
    receiptId: 'legacy-eventz-button-focus',
  },
  {
    subject: 'eventz-button',
    variant: /variant=secondary, state=default, isDisabled=true/,
    class: 'instrument',
    cause:
      'transparent-ink row (ALPHA_TRIM alignment sensitivity, ex-harness): the 5%-black fill × 0.4 disabled opacity trims below the alpha threshold on Figma\'s side (content box collapses 218→149px) while ours keeps edge ink — the crop pair misaligns and the mismatch compounds; no shared coordinate frame exists to anchor the two crops (screenshot clip vs node render), documented in the header',
    receiptId: 'legacy-eventz-button-disabled-secondary',
  },
  {
    subject: 'eventz-button',
    class: 'instrument',
    cause:
      'capture-channel limit (ex-capture-gap): startIcon/endIcon render as child STUBS (observed geometry, no glyph ink — ds.play/ds.pause VECTOR internals are #42, receipted): Figma paints the glyphs, ours paints the reserved boxes; text lineHeight rides the receipted text-channel-unsupported limit',
    receiptId: 'legacy-eventz-button',
  },

  // ---- cbds-tooltip (owner file; pointer POLYGON) ----------------------------
  {
    subject: 'cbds-tooltip',
    variant: /pointer=true/,
    class: 'instrument',
    cause:
      'capture-channel limit (ex-capture-gap): pointer POLYGON geometry is not in the plugin dump (vector-geometry class #42; the REST fixture carries it, the plugin channel does not): Figma renders the arrow per placement (Δ up to 19 device px on the pointer axis), ours renders the box; height Δ8 is the receipted text-lineHeight limit + text-hug metrics',
    receiptId: 'legacy-cbds-tooltip-pointer',
  },
  {
    subject: 'cbds-tooltip',
    class: 'rendering',
    cause:
      'text-hug metrics + receipted text-lineHeight capture limit: ours hugs the two text lines 4 CSS px taller than Figma (Δ8 device px), width Δ-4 is advance-width hug; shadow blur kernels differ at the edge',
    receiptId: 'legacy-cbds-tooltip',
  },

  // ---- cbds-dialog (owner file; session-scoped child imports) ----------------
  {
    subject: 'cbds-dialog',
    variant: /size=small-vertical/,
    class: 'instrument',
    cause:
      'capture-channel limit (ex-capture-gap): vertical-actions layout renders child buttons the session scope does not carry full-width/stacked (Action 2 + close glyph are child internals behind instance-level overrides — the receipted instance-level FILL/override vocabulary limit); size delta follows from the missing children',
    receiptId: 'legacy-cbds-dialog-small-vertical',
  },
  {
    subject: 'cbds-dialog',
    class: 'rendering',
    cause:
      'height Δ8 device px is text-hug metrics across title/body lines (receipted text-lineHeight limit rides the same rows); width matches exactly (border-box minting)',
    receiptId: 'legacy-cbds-dialog',
  },

  // ---- cbds-button-brand-primary ---------------------------------------------
  {
    subject: 'cbds-button-brand-primary',
    variant: /state=focus/,
    class: 'rendering',
    cause:
      'focus-ring corner arcs: CSS outline and Figma\'s drawn ring round their corners with different geometry/antialiasing — residual ink is the four corner arcs (~370 device px)',
    receiptId: 'legacy-cbds-button-brand-primary-focus',
  },
  {
    subject: 'cbds-button-brand-primary',
    class: 'rendering',
    cause: 'label glyph rasterization (masked ≤0.01%); size Δ2 device px is advance-width hug',
    receiptId: 'legacy-cbds-button-brand-primary',
  },

  // ==== 014 — the four ex-UNTRIAGED rows (FR-004; the 3% dispense that hid
  //      the other twelve below is gone, D8/FR-015) ==========================
  {
    subject: 'member-picture',
    variant: /Etat=Defaut/,
    class: 'rendering',
    cause:
      're-measured 2026-08-06 (017/US2, FR-008): 58.32% → 0.00% — PIXEL-IDENTICAL — once the right mockup sample was lent to our side. The inherited A5 cause is RETIRED. Getting there uncovered a real fact, kept because it is measured: the master paints `funIa` at child index 1 and `normal` at index 0, and Figma orders children BACK-TO-FRONT, so funIa is the plane a viewer sees — while the contract declares funIa first and normal second, i.e. normal paints over it. Lending normal\'s portrait made the row WORSE (60.97%); lending funIa\'s made it exact. Recorded as D-017-MEMBER-PICTURE-ORDRE-DES-PLANS, not repaired here.',
    receiptId: 'pv-member-picture-defaut',
  },
  {
    subject: 'member-picture',
    variant: /Etat=Survol/,
    class: 'image-boundary',
    cause:
      're-measured 2026-08-06 (017/US2, FR-008 — the class is CONFIRMED here, and the old wording CORRECTED). It is not "a dimmed real portrait against our placeholder": both Figma variants average #6d6d6c because BOTH show the same `funIa` plane on top. The row is unchanged at 58.31% while Etat=Defaut went to 0.00%, and the reason is structural: ds.member-picture carries TWO img parts but ONE URL prop, wired to `normal` only — `funIa` has attrs:{alt:""} and no src (the second photo plane was left unwired in spec 011). In Survol, normal drops to opacity 0 and funIa shows; no route exists to paint it, so our side keeps the #D9D9D9 wash. This IS an A5 image boundary — a photo that cannot be given because no route carries it — and it is the honest residual of the equal-arms pass, not noise. Recorded as D-017-MEMBER-PICTURE-SURVOL-2E-PLAN; the fix (wiring a second URL prop) touches a contract\'s props and is out of 017\'s scope.',
    receiptId: 'pv-member-picture-survol',
  },
  {
    subject: 'section-header',
    variant: /Avec CTA/,
    class: 'rendering',
    cause:
      'RE-CLASSIFIED 2026-08-04 (Phase 6/015, named-repair — see subjects.ts\'s section-header entry). The width mismatch this rule used to describe (2174×108 vs figma 3093×108) is now fixed: `renderWidth: 1550` pins the isolated test to the same width Figma\'s own master declares (layoutSizingHorizontal FIXED at 1550px, live-verified). A contract-level width was tried first and reverted — it broke align-self:stretch for every real consumer (coordonnees, sav, presentation all regressed) because "Avec CTA" is not composed by any current contract; only the isolated instrument needed the pin. Sizes are now IDENTICAL both sides (3100×108); masked score 0.99% (mask coverage 41.10%) — text raster explains the residual, same class as section-header\'s own Standard disposition and google-reviews.',
    receiptId: 'pv-section-header-avec-cta',
  },
  {
    subject: 'google-reviews',
    class: 'rendering',
    cause:
      'sizes are IDENTICAL (3104×656 both sides); diagnosis reads "text raster/family delta dominates" — geometry is exact, the residual is cross-renderer glyph rasterization on the review text, the same known floor already named in the report header.',
    receiptId: 'pv-google-reviews',
  },

  // ==== 014 — the twelve rows the 3% dispense hid at "—" (D8/FR-015; every
  //      one below has masked=0.00% or a triptych-confirmed antialiasing
  //      signature — the residual fully explained by cross-renderer text or
  //      icon rasterization, none by a size or content gap) ==================
  {
    subject: 'review-card',
    class: 'rendering',
    cause:
      'sizes IDENTICAL (598×478); masked score is 0.00% — the text mask alone absorbs the entire 1.68% raw residual, i.e. cross-renderer glyph rasterization, nothing else.',
    receiptId: 'pv-review-card',
  },
  {
    subject: 'section-header',
    variant: /Standard/,
    class: 'rendering',
    cause:
      'sizes near-identical (1082×158 vs 1081×156, Δ1/Δ2 device px); masked score is 0.00% — text raster fully explains the 1.91% raw residual.',
    receiptId: 'pv-section-header-standard',
  },
  {
    subject: 'avantage',
    class: 'rendering',
    cause:
      'sizes IDENTICAL (1518×150); masked score is 0.00% — text raster fully explains the 1.81% raw residual.',
    receiptId: 'pv-avantage',
  },
  {
    subject: 'footer-column',
    class: 'rendering',
    cause:
      'renderWidth:169 (subjects.ts) is exactly figma\'s declared width at 2x (338 device px); ours crops to 322 (Δ-16, height Δ1) with "text raster/family delta dominates" — a content-box text-hug delta on the imposed width, the same class as the report\'s documented ±1–2 CSS px hug-sizing note, just a wider label pushing it further.',
    receiptId: 'pv-footer-column',
  },
  {
    subject: 'nav-item',
    class: 'rendering',
    cause:
      'HUG master (194×16 CSS, subjects.ts — no forced width), dark surface (white-on-transparent ink, a documented under-counted case). Sizes near-identical (378×24 vs 380×24, Δ2/Δ0); the triptych diff is almost entirely YELLOW (pixelmatch\'s antialiasing classifier, not a hard red mismatch) over the identical "PORTES DE GARAGE ⌄" label and chevron on both sides — cross-renderer antialiasing on white text/icon over a dark fill.',
    receiptId: 'pv-nav-item',
  },
  {
    subject: 'carousel-controls',
    class: 'rendering',
    cause:
      'both nav buttons are ds.button variant=iconOnly (chevron-left/chevron-right, no distinguishing props between them — carousel-controls.contract.json); sizes IDENTICAL (3208×104); 0% mask coverage (iconOnly carries no text to mask) and the diff localizes to one ~72×104px icon-sized region — cross-renderer SVG chevron rasterization/antialiasing, not a missing or misconfigured button.',
    receiptId: 'pv-carousel-controls',
  },
  {
    subject: 'input',
    class: 'rendering',
    cause:
      'renderWidth:280 (subjects.ts) matches the master exactly; sizes IDENTICAL (560×96); the triptych shows the shared "Texte de saisie" placeholder in ORANGE on the diff panel (antialiasing-classified) at the same localized 179×20px region also seen on textarea — cross-renderer text rasterization on the placeholder glyphs; the 0% reported mask coverage is a text-mask miss (placeholder is not a masked DOM text rect), not evidence the residual is non-textual.',
    receiptId: 'pv-input',
  },
  {
    subject: 'textarea',
    class: 'rendering',
    cause:
      'renderWidth:280 (subjects.ts) matches the master exactly; sizes IDENTICAL (560×256); masked score is 0.00% at the same localized top-left 179×20px region as input\'s unmasked placeholder text — cross-renderer text rasterization.',
    receiptId: 'pv-textarea',
  },
  {
    subject: 'accordion-row',
    variant: /Taille=Grand, Etat=Ferme/,
    class: 'rendering',
    cause:
      'renderWidth:1550 (subjects.ts); sizes IDENTICAL (3100×128); masked score is 0.00% — the entire 0.13% raw residual is text raster, localized middle-left (182×39px, the row\'s label).',
    receiptId: 'pv-accordion-row-grand-ferme',
  },
  {
    subject: 'accordion-row',
    variant: /Taille=Grand, Etat=Ouvert/,
    class: 'rendering',
    cause:
      'renderWidth:1550; sizes IDENTICAL (3100×240); masked score is 0.00% — the 0.08% raw residual is text raster, same localized label region as the Ferme state (182×144px, the taller box includes the opened panel text).',
    receiptId: 'pv-accordion-row-grand-ouvert',
  },
  {
    subject: 'accordion-row',
    variant: /Taille=Petit, Etat=Ouvert/,
    class: 'rendering',
    cause:
      'renderWidth:1550; sizes IDENTICAL (3100×160); diagnosis "near-identical"; masked score is 0.00% — the 0.02% raw residual is text raster.',
    receiptId: 'pv-accordion-row-petit-ouvert',
  },
  {
    subject: 'accordion-row',
    variant: /Taille=Petit, Etat=Ferme/,
    class: 'rendering',
    cause:
      'renderWidth:1550; sizes IDENTICAL (3100×80); diagnosis "near-identical"; masked score is 0.00% — the 0.0048% raw residual (displays as 0.00% at two decimals, D8) is text raster, same as the other three accordion-row rows.',
    receiptId: 'pv-accordion-row-petit-ferme',
  },

  // ==== 014 — select rejoins pixel coverage (US3/T025-T027): its 004
  //      exclusion (a comment, never code) is REFUTED by
  //      proofs/recus/select-exclusion.json, and the retest surfaced a real
  //      emit-html defect (DW-014-001, class `engine` until its repair).
  {
    subject: 'select',
    // Re-classed `engine` → `rendering` (tinyspec select-option-emit,
    // 2026-08-05): the `engine` fault this rule carried — renderPart()
    // emitting the "valeur" part's text as a BARE child of <select>, dropped
    // by the HTML5 parser, hence the empty capture and maskCoveragePct 0 —
    // is repaired (the text now rides a bare <option>, the shipped React
    // surface's shape, standing eval emit-html-select-option-text). The
    // re-measured residual is input's exact class: text raster.
    class: 'rendering',
    cause:
      'renderWidth:280 (subjects.ts) matches the master exactly; sizes IDENTICAL (560×96); re-measured 2026-08-05 after tinyspec select-option-emit repaired DW-014-001: the capture is no longer empty — « Texte de saisie » paints, the raw score fell 0.85% → 0.17%, and the diff localizes to the same ~179×20px text region as input with input\'s exact score signature — cross-renderer text rasterization on the option glyphs. maskCoveragePct stays 0.00% for input\'s documented reason (the native widget paints its visible value itself, so it is not a masked DOM text rect — a text-mask miss, not evidence the residual is non-textual).',
    receiptId: 'pv-select',
  },
];

export function triageFor(subject: string, variant: string): TriageRule | null {
  for (const rule of TRIAGE) {
    if (rule.subject !== subject) continue;
    if (rule.variant && !rule.variant.test(variant)) continue;
    return rule;
  }
  return null;
}
