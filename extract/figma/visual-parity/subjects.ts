/**
 * Visual-parity subjects — one entry per component whose preview render is
 * diffed pixel-by-pixel against Figma's own render of the same node.
 *
 * Two kinds:
 *   · dump      — a committed design dump (extract/figma fixtures). The
 *                 contract is PROPOSED from the dump (proposeFromDump with
 *                 minting + the captured-variables layer), exactly the
 *                 playground import path.
 *   · contract  — a repo catalog contract whose anchors.figma point at the
 *                 generated set in the main POC file. The contract is the
 *                 shipping one; the canvas is the generator's output.
 *
 * `setNodeId` is the COMPONENT_SET node (the grid). The harness enumerates
 * the set's variant COMPONENT children via the REST nodes API (the dumps do
 * not carry per-variant node ids — only the set's) and fetches each variant's
 * PNG from the images API at scale=2.
 *
 * Adding a subject = adding one entry here.
 */
import type { ComparisonSurface } from './img.js';

export interface DumpSubject {
  id: string;
  label: string;
  kind: 'dump';
  /** Repo-relative path of the committed dump fixture. */
  dumpPath: string;
  /** Set name inside the dump — required when the dump carries several sets. */
  set?: string;
  /** SESSION SCOPE (dump v1.5 linking): sibling dumps proposed FIRST and
   *  registered (contract + minted tokens + key/name indexes) before this
   *  subject proposes — the parity mirror of "import Button-Brand Primary,
   *  then import Dialog": the Dialog's nested instances LINK to the sibling
   *  contract (componentSetKey first, name fallback) instead of stubbing. */
  scope?: Array<{ dumpPath: string; set?: string }>;
  fileKey: string;
  setNodeId: string;
  /** Neutral alpha-flattening context for transparent component ink.
   * `dark` is required for white-on-transparent subjects. This changes only
   * the inspection surface shared by BOTH PNGs, never component styling. */
  comparisonSurface?: ComparisonSurface;
  /** 017 — comparison-only props lent to OUR side. Same three fields, same
   *  semantics, as on `ContractSubject` below (documented there in full). No
   *  dump subject declares them today; the field is here so the live gate's
   *  resolution path is uniform across both kinds rather than kind-conditional. */
  comparisonProps?: Record<string, unknown>;
  comparisonPropsByVariant?: Record<string, Record<string, unknown>>;
  fixtureAssetIds?: string[];
}

export interface ContractSubject {
  id: string;
  label: string;
  kind: 'contract';
  /** Catalog contract id (contracts/<name>.contract.json `id`). */
  contractId: string;
  fileKey: string;
  setNodeId: string;
  /** Neutral alpha-flattening context for transparent component ink.
   * `dark` is required for white-on-transparent subjects. This changes only
   * the inspection surface shared by BOTH PNGs, never component styling. */
  comparisonSurface?: ComparisonSurface;
  /** The fixed px width to render the code side at, before screenshot + box
   *  measurement — matching a FIXED-width master frame (e.g. a content-width
   *  atom whose master is a 280px design-time frame). Omit for hug/
   *  content-width subjects, whose code side renders at its natural width
   *  (unchanged default — the master IS content-width too, so no container
   *  is needed for an honest size match). */
  renderWidth?: number;
  /** Compare against a REAL page instance instead of the set's default-
   *  variant render (002-governed-icons-button, D10/T048). A component
   *  SET's variant node always renders its component properties' DEFAULT
   *  values via the images API — there is no way to fetch "the master but
   *  with iconLeft=true", because that combination exists nowhere as a
   *  distinct node. An `instanceOverride` instead points at a real,
   *  already-customized page instance (found by the positional scan) whose
   *  OWN render becomes the "figma" side — the only honest way to get a
   *  pixel reference for a non-default property combination. */
  instanceOverride?: {
    /** The page-instance node id — its rendered PNG becomes the Figma side. */
    nodeId: string;
    /** Variant name driving axis substitution, same spelling as a set
     *  variant's own name (e.g. "Property 1=Link") — flows through the
     *  existing planVariant exactly like a real set variant would. */
    variantName: string;
    /** Boolean/enum prop values a variant NAME cannot carry (BOOLEAN
     *  visibility, INSTANCE_SWAP glyph choice — neither is a variant axis)
     *  — merged onto the variant-derived plan. Every value here must be the
     *  REAL, scanned state of `nodeId`, never invented. */
    propPreset: Record<string, string | boolean>;
  };
  /**
   * 017 (FR-006/FR-006a) — COMPARISON-ONLY props lent to OUR side so the two
   * pictures compare like for like. Same name and same semantics as
   * `CampaignCase.codeProps`: a `{ "$asset": "<id>" }` sentinel resolves through
   * the pinned fixture manifest (size + extension + bytes + SHA-256 re-verified
   * at render time) into a data URL that exists **only inside the comparison
   * document**. The injection CLONES the contract (`structuredClone`), so
   * `contracts/*.contract.json` is never touched — FR-006b held by construction,
   * not by discipline. No asset may carry `runtimeDefault: true`; no generated
   * component ever receives one.
   *
   * Why this exists: without it the live gate rendered `<img src="">` against a
   * real photo and scored the ABSENCE OF DATA, not a fidelity defect. The whole
   * chain already existed and was proven — only this loop never passed the 7th
   * argument (`render.ts:816` had the parameter; `run.ts` passed six).
   */
  comparisonProps?: Record<string, unknown>;
  /**
   * 017 — the same thing, PER VARIANT, keyed by the variant's own name
   * (`"Disposition=Reassurance"`). It is the port of `CampaignCase`'s
   * granularity: a campaign *case* IS a variant, so the campaign path never
   * needed this shape; a subject-level record cannot serve a master that paints
   * a DIFFERENT photo per variant.
   *
   * Measured 2026-08-06, and it is why this field exists rather than being
   * hypothetical: the `Carte` master paints `d62d8bf3…` on
   * `Disposition=Reassurance` and `3c54b9a6…` on `Disposition=Categorie` — two
   * distinct images — while the contract binds BOTH img parts to the single
   * `imageUrl` prop. A flat record would have made one of the two lines lie.
   *
   * Merged OVER `comparisonProps` when the variant name matches.
   */
  comparisonPropsByVariant?: Record<string, Record<string, unknown>>;
  /**
   * 017 — every fixture asset id this subject may reference, declared. Same name
   * and same semantics as `CampaignCase.fixtureAssetIds`: a `$asset` that is not
   * declared here, or not present in the manifest, is a NAMED REFUSAL
   * (`render.ts:386`, `:413`) — never a silent fallback to an empty image.
   */
  fixtureAssetIds?: string[];
}

export type ParitySubject = DumpSubject | ContractSubject;

const CBDS = 'WofZT8xaxXuc2Q6Je9S4XE';
/** Piqueray — the repo's own design system since the reconversion (was the
 *  51-component demo file `8nim1d0IPnehMxA7B7SYxC`, now deleted). */
const PIQUERAY = 'd9FYAUcqdcNtsuaMgLefvJ';

/**
 * LEGACY / QUARANTINED — NOT run by the live gate (kept for reference and easy
 * re-enable, never silently dropped — the honesty rule). These are brownfield-
 * pilot and foreign-kit subjects (CBDS, Shoelace, Eventz) anchored in EXTERNAL
 * Figma files this project neither owns nor ships — standing coverage from
 * before the Piqueray reconversion, none of it part of the Piqueray system.
 *
 * Why quarantined (002-governed-icons-button closure, 2026-07-24):
 *  1. Not Piqueray — the shipping system is the Button on the Piqueray file;
 *     these foreign kits are unrelated to any Piqueray spec.
 *  2. External files whose Figma image-render quota we do NOT control. The
 *     Eventz file (E7oXr98i91HYQGZxA2USOQ) is, as of this writing, in a REAL
 *     multi-day rate-limit penalty (Retry-After counts down 1:1 in real time,
 *     ~3.7 days) — one dead external file was blocking the WHOLE summary
 *     through no fault of the Piqueray conversion.
 *  3. The live gate's job for spec 002 is the Piqueray icon visual coverage
 *     (FR-021), proven by the two PARITY_SUBJECTS below on the healthy file.
 *
 * Re-enable one by moving its entry back into PARITY_SUBJECTS and re-running
 * `-- --write-baseline` once its external file is reachable again.
 */
export const LEGACY_SUBJECTS: ParitySubject[] = [
  // ---- CBDS fixtures (the owner's file) -----------------------------------
  {
    id: 'cbds-button-brand-primary',
    label: 'CBDS Button-Brand Primary',
    kind: 'dump',
    dumpPath: 'extract/figma/fixtures/cbds-plugin-button-brand-primary.dump.json',
    fileKey: CBDS,
    setNodeId: '258:1838',
  },
  {
    id: 'cbds-tooltip',
    label: 'CBDS Tooltip',
    kind: 'dump',
    dumpPath: 'extract/figma/fixtures/cbds-plugin-all-sets.v14.dump.json',
    set: 'Tooltip',
    fileKey: CBDS,
    setNodeId: '695:313',
  },
  {
    id: 'cbds-dialog',
    label: 'CBDS Dialog',
    kind: 'dump',
    dumpPath: 'extract/figma/fixtures/cbds-plugin-dialog.dump.json',
    // Session: the owner imported Button-Brand Primary before the Dialog —
    // the Dialog's ↪️action-1 button LINKS to ds.button-brand-primary
    // (name fallback: the plugin dialog dump predates v1.5 keys).
    scope: [{ dumpPath: 'extract/figma/fixtures/cbds-plugin-button-brand-primary.dump.json' }],
    fileKey: CBDS,
    setNodeId: '599:1333',
  },

  // ---- fidelity-matrix subjects with live anchors --------------------------
  {
    id: 'shoelace-tooltip',
    label: 'Shoelace Tooltip (kit redraw)',
    kind: 'dump',
    dumpPath: 'extract/fidelity-matrix/fixtures/shoelace-tooltip/dump.json',
    fileKey: 'nl9P0h3brratHTdncjzKIr',
    setNodeId: '37:142',
  },
  {
    id: 'shoelace-button-group',
    label: 'Shoelace Button Group (kit redraw)',
    kind: 'dump',
    dumpPath: 'extract/fidelity-matrix/fixtures/shoelace-button-group/dump.json',
    fileKey: 'nl9P0h3brratHTdncjzKIr',
    setNodeId: '376:3540',
  },
  {
    id: 'eventz-button',
    label: 'Eventz Button (client-style kit)',
    kind: 'dump',
    dumpPath: 'extract/fidelity-matrix/fixtures/eventz-button/dump.json',
    fileKey: 'E7oXr98i91HYQGZxA2USOQ',
    setNodeId: '2313:42',
  },
];

// ---- LIVE GATE — the Piqueray subjects (the ONLY ones the standing gate and
// the committed baseline.json cover). Everything above is quarantined in
// LEGACY_SUBJECTS (see the why-note there).
export const PARITY_SUBJECTS: ParitySubject[] = [
  // ---- catalog contracts anchored in the Piqueray file ---------------------
  // The four demo subjects (badge, checkbox, switch, heading) were REMOVED with
  // their contracts in US1 — the catalog holds the Button only. `button` keeps
  // its id but is repointed onto Piqueray: same `ds.button` contract id, an
  // entirely different canvas. Anchors mirror contracts/button.contract.json
  // `anchors.figma` (fileKey + nodeId of the « Bouton » COMPONENT_SET).
  { id: 'button', label: 'Button (Piqueray)', kind: 'contract', contractId: 'ds.button', fileKey: PIQUERAY, setNodeId: '6:122' },
  // Checkbox (004-input-atoms-categories) — a COMPONENT_SET (Coché=Non/Oui) at a
  // FIXED 20×20, so its preview render and the master render are the same size:
  // a meaningful pixel comparison (Coché=Non matches at 0.00%).
  { id: 'checkbox', label: 'Checkbox (Piqueray)', kind: 'contract', contractId: 'ds.checkbox', fileKey: PIQUERAY, setNodeId: '2053:1256' },
  // ReviewCard / GoogleReviews (006-google-reviews-block) — both standalone
  // COMPONENTs (isSet: false, no variant axis): figma-api.ts's
  // standalone-COMPONENT path (document.type !== 'COMPONENT_SET') treats the
  // node itself as its own one-entry variant list, and match.ts's
  // planVariant returns the zero-axis default-state plan for a plain-named
  // component ("a plain-named single COMPONENT has no axes — render the
  // all-defaults state") — exactly the Button/Checkbox default-variant path,
  // just without a set wrapper. Anchors mirror
  // contracts/review-card.contract.json / google-reviews.contract.json
  // anchors.figma (fileKey + nodeId written by anchors:writeback, T045,
  // after the first live push T043-T044). No `renderWidth`: both roots
  // already carry a FIXED width literal (299px / 1552px, T040/T042) matching
  // their master's own width exactly — unlike Input/Textarea's FILL-based
  // atoms below, there is no content-width mismatch to correct.
  { id: 'review-card', label: 'ReviewCard (Piqueray)', kind: 'contract', contractId: 'ds.review-card', fileKey: PIQUERAY, setNodeId: '2178:7349' },
  { id: 'google-reviews', label: 'GoogleReviews (Piqueray)', kind: 'contract', contractId: 'ds.google-reviews', fileKey: PIQUERAY, setNodeId: '2178:7381' },
  // Input / Textarea (004) — content-width bricks: the master is a FIXED-width
  // frame (280px) but real usage is layoutSizingHorizontal:FILL (the Field
  // molecule stretches them, audit 003), so a bare atom's NATURAL render is
  // narrower than the master — a pure-width mismatch img.ts (by design) never
  // resamples away, not a styling defect. `renderWidth: 280` renders the code
  // side inside a fixed-280px container (the width a FILL atom takes under a
  // Field), so the diff judges box styling (border/padding/color/font) at a
  // shared size instead of two different boxes. Both match at 0.00%. Height is
  // untouched — Input HUGs to 48px, Textarea carries a literal 128px height,
  // both already master-height; only width needed the fix. (Select is the
  // THIRD such brick and a subject since 014/T025 — the "headless Chromium
  // drops its option text" claim behind its 004 exclusion was REFUTED; the
  // empty capture came from emit-html emitting the text as a bare <select>
  // child, DW-014-001, repaired by tinyspec select-option-emit.)
  {
    id: 'input',
    label: 'Input (Piqueray)',
    kind: 'contract',
    contractId: 'ds.input',
    fileKey: PIQUERAY,
    setNodeId: '2053:1245',
    renderWidth: 280, // master absoluteBoundingBox 280×48 (REST nodes, read-only)
  },
  {
    id: 'textarea',
    label: 'Textarea (Piqueray)',
    kind: 'contract',
    contractId: 'ds.textarea',
    fileKey: PIQUERAY,
    setNodeId: '2053:1247',
    renderWidth: 280, // master absoluteBoundingBox 280×128 — height already literal-pinned
  },
  // Select REJOINS pixel coverage (014, US3/T025) — its 004 exclusion (a
  // comment, never code) claimed a native <select> does NOT render its
  // selected-option TEXT in headless Chromium, hiding the gap under the
  // masked score. Re-tested (proofs/recus/select-exclusion.json, T026): the
  // claim is REFUTED — headless Chromium DOES paint the option text, same as
  // Input/Textarea. No criterion is relaxed: same regions, thresholds and
  // proof bar as the other 33 subjects.
  {
    id: 'select',
    label: 'Select (Piqueray)',
    kind: 'contract',
    contractId: 'ds.select',
    fileKey: PIQUERAY,
    setNodeId: '2053:1249',
    renderWidth: 280, // same content-width brick as Input/Textarea (004) — master is a FIXED 280px design-time frame
  },
  // Icon visual coverage (002-governed-icons-button, D10/T048 — the proof
  // 001 deferred to v1.3, commit 38aee13). NOT one subject per icon: a bare
  // icon master has no contract of its own (D1 — the registry is the only
  // governed identity; icons are pure SVG asset injection, never anatomy),
  // so `proposeFromDump` over a standalone icon vector produces an empty
  // background-color <div>, not the drawn shape (verified live) — comparing
  // that against Figma's real render would be permanent, meaningless noise,
  // not honest coverage. Instead: ONE subject exercising the REAL code path
  // (Button's `ICONS[glyph]` SVG injection) against a REAL page instance
  // that already shows both placements — a component SET's variant node
  // only ever renders its properties' DEFAULTS via the images API, so a
  // real customized instance is the only honest Figma-side reference for a
  // non-default combination (instanceOverride, see subjects.ts doc).
  // Re-pointed (004): the original instance (230:573) was removed from the live
  // file by spec 003's work — a coexistence break, not a size issue. Re-scanned
  // live (read-only) for a current STANDALONE page instance showing both icons:
  // 237:1500 on the "Pages" page — variant « Outilne noir », « Motifs
  // disponibles », Glyphe gauche 230:585 = pdf, Glyphe droite 230:599 =
  // download (all read from the instance, never invented). pdf+download is the
  // same pairing every real "both icons shown" instance carries file-wide.
  // Re-pointed (016, B013-8): the live set's misspelled value was purged by
  // regeneration — the variant axis is now Style and the value reads
  // « Outline noir »; the subject follows the LIVE canvas, the old spelling
  // was the instrument lagging behind the repaired source (measure:gate's
  // two figma-source lines were THIS subject, not the file).
  {
    id: 'button-with-icons',
    label: 'Button with icons (Piqueray, both placements)',
    kind: 'contract',
    contractId: 'ds.button',
    fileKey: PIQUERAY,
    setNodeId: '6:122',
    instanceOverride: {
      nodeId: '237:1500',
      variantName: 'Style=Outline noir',
      // children matches the instance's OWN scanned text override — without
      // it the two sides render different widths for a reason that has
      // nothing to do with icon coverage (our default "Contactez-nous" vs
      // the instance's real label).
      propPreset: {
        children: 'Motifs disponibles',
        iconLeft: true,
        iconRight: true,
        iconLeftGlyph: 'pdf',
        iconRightGlyph: 'download',
      },
    },
  },
  // ---- spec 010: 27 new Piqueray components ----
  {
    id: 'member-picture', label: 'MemberPicture (Piqueray)', kind: 'contract', contractId: 'ds.member-picture',
    fileKey: PIQUERAY, setNodeId: '274:2389', renderWidth: 364,
    // 017 — the master paints c60f37ab… on `normal` and 508388d6… on `funIa`,
    // the SAME pair on both variants (REST read of 274:2389, 2026-08-06).
    // Its URL prop is `src`, NOT `imageUrl` — a preset copied from the other
    // subjects would not take.
    // NAMED, NOT HIDDEN: only `normal` is wired to a prop; `funIa` has
    // attrs:{alt:""} and no src (the second photo plane was left unwired in
    // spec 011). So `Etat=Defaut` (normal at opacity 1, covering funIa) becomes
    // a fair comparison, while `Etat=Survol` (normal at opacity 0, funIa
    // showing) stays a REAL residual — re-measured and re-classed, never
    // re-labelled as noise. See registre/defauts-decouverts.json,
    // D-017-MEMBER-PICTURE-SURVOL-2E-PLAN.
    // The photo lent is funIa's (508388d6…), NOT normal's — and the reason is a
    // MEASURED fact worth keeping: in the master, `funIa` sits at child index 1
    // and `normal` at index 0, and Figma orders children back-to-front, so
    // funIa is the plane a viewer actually SEES. The contract inverts that
    // order (funIa declared first, normal second and painting over it). Lending
    // normal's portrait made the gap WORSE (58.32% → 60.97%) because the two
    // sides then showed two DIFFERENT photos. See
    // registre/defauts-decouverts.json, D-017-MEMBER-PICTURE-ORDRE-DES-PLANS.
    comparisonProps: { src: { $asset: 'member-card-base-508388d68808' } },
    fixtureAssetIds: ['member-card-base-508388d68808'],
  },
  { id: 'piqueray-logo', label: 'PiquerayLogo (Piqueray)', kind: 'contract', contractId: 'ds.piqueray-logo', fileKey: PIQUERAY, setNodeId: '4:14', renderWidth: 180 },
  { id: 'accordion-row', label: 'AccordionRow (Piqueray)', kind: 'contract', contractId: 'ds.accordion-row', fileKey: PIQUERAY, setNodeId: '2059:1417', renderWidth: 1550 },
  { id: 'avantage', label: 'Avantage (Piqueray)', kind: 'contract', contractId: 'ds.avantage', fileKey: PIQUERAY, setNodeId: '2088:2350' },
  { id: 'carousel-controls', label: 'CarouselControls (Piqueray)', kind: 'contract', contractId: 'ds.carousel-controls', fileKey: PIQUERAY, setNodeId: '2077:2191', renderWidth: 1604 },
  {
    id: 'carte', label: 'Carte (Piqueray)', kind: 'contract', contractId: 'ds.carte',
    fileKey: PIQUERAY, setNodeId: '2063:1622',
    // 017 — TWO DISTINCT photos, one per variant (REST read of 2063:1622,
    // 2026-08-06): d62d8bf3… on reassuranceImage, 3c54b9a6… on categorieImage.
    // The contract binds both img parts to the single `imageUrl` prop, so a
    // subject-level record would have made one of the two lines lie. This is
    // the whole reason `comparisonPropsByVariant` exists.
    comparisonPropsByVariant: {
      'Disposition=Reassurance': { imageUrl: { $asset: 'carte-reassurance' } },
      'Disposition=Categorie': { imageUrl: { $asset: 'carte-categorie' } },
    },
    fixtureAssetIds: ['carte-reassurance', 'carte-categorie'],
  },
  {
    // 023 — molecule to a single Style axis {Superpose, Empile}, extracted from
    // the cleaned master (Gate A/B). `Empile` is the same stacked-photo visual
    // as ds.carte Disposition=Categorie, so lend the SAME categorieImage fixture
    // (3c54b9a6…, 017 pattern). `Superpose` is a full-bleed photo plane; no
    // fixture lent yet → its score is measured, and any image-frontier gap is
    // named at --write-baseline, never hidden.
    id: 'carte-categorie', label: 'CarteCategorie (Piqueray)', kind: 'contract', contractId: 'ds.carte-categorie',
    fileKey: PIQUERAY, setNodeId: '2495:6770',
    comparisonPropsByVariant: {
      'Style=Empile': { imageUrl: { $asset: 'carte-categorie' } },
    },
    fixtureAssetIds: ['carte-categorie'],
  },
  {
    // 023 — section composing a repeated ds.carte-categorie grid (Style ×
    // Colonnes {2,3}). Closes the blind spot where sections escaped visual
    // parity (FR-021). Score measured at --write-baseline; the repeated cards'
    // photo frontier is named there, not hidden.
    id: 'categories-principales', label: 'CategoriesPrincipales (Piqueray)', kind: 'contract', contractId: 'ds.categories-principales',
    fileKey: PIQUERAY, setNodeId: '2115:4277',
  },
  { id: 'copyright', label: 'Copyright (Piqueray)', kind: 'contract', contractId: 'ds.copyright', fileKey: PIQUERAY, setNodeId: '2086:2330' },
  { id: 'field', label: 'Field (Piqueray)', kind: 'contract', contractId: 'ds.field', fileKey: PIQUERAY, setNodeId: '2056:1278', renderWidth: 280 },
  { id: 'footer-column', label: 'FooterColumn (Piqueray)', kind: 'contract', contractId: 'ds.footer-column', fileKey: PIQUERAY, setNodeId: '2079:2246', renderWidth: 169 },
  {
    id: 'member-card', label: 'MemberCard (Piqueray)', kind: 'contract', contractId: 'ds.member-card',
    fileKey: PIQUERAY, setNodeId: '2074:2072',
    // 017 — the composed ds.member-picture instance paints c60f37ab… on `normal`
    // and 508388d6… on `funIa` (REST read of 2074:2072). ds.member-card has no
    // img part of its own; its `imageUrl` reaches the nested MemberPicture.
    // Same measured reason as ds.member-picture: funIa is the plane on top in
    // the master, so it is the one to compare against.
    comparisonProps: { imageUrl: { $asset: 'member-card-base-508388d68808' } },
    fixtureAssetIds: ['member-card-base-508388d68808'],
  },
  {
    id: 'nav-item',
    label: 'NavItem (Piqueray)',
    kind: 'contract',
    contractId: 'ds.nav-item',
    fileKey: PIQUERAY,
    setNodeId: '2152:5554',
    // The HUG master is 194×16 (REST receipt in the version-keyed node
    // cache), so no forced width is legitimate. Its white text/chevron are
    // transparent component ink intended for a dark Header/photo context.
    comparisonSurface: 'dark',
  },
  {
    id: 'product-card', label: 'ProductCard (Piqueray)', kind: 'contract', contractId: 'ds.product-card',
    fileKey: PIQUERAY, setNodeId: '2068:1972',
    // 017 — the master paints 1ba972fd… on its single `Image` part
    // (REST read of 2068:1972, 2026-08-06).
    comparisonProps: { imageUrl: { $asset: 'product-card-default' } },
    fixtureAssetIds: ['product-card-default'],
  },
  {
    id: 'realisation', label: 'Realisation (Piqueray)', kind: 'contract', contractId: 'ds.realisation',
    fileKey: PIQUERAY, setNodeId: '2095:2484',
    // 017 — NO comparisonProps HERE, AND THAT IS THE MEASURED ANSWER, not an
    // omission. REST read of 2095:2484 (2026-08-06): the master carries NO
    // IMAGE paint at all on either variant — root COMPONENT fills SOLID #dfdfdf,
    // one child `Image` (FRAME) fills SOLID #d9d9d9. Lending our side a photo
    // would CREATE a difference where Figma has none. The ~99% these two lines
    // score is a FLAT-FILL gap across the whole surface (the contract carries
    // neither colour), not an image frontier — the inherited triage cause said
    // otherwise for months. See registre/defauts-decouverts.json,
    // D-017-REALISATION-PAS-UNE-FRONTIERE-IMAGE.
  },
  { id: 'section-header', label: 'SectionHeader (Piqueray)', kind: 'contract', contractId: 'ds.section-header', fileKey: PIQUERAY, setNodeId: '2090:2397', renderWidth: 1550 }, // Phase 6 (015), named-repair: both dispositions declare layoutSizingHorizontal FIXED at 1550px on the isolated master (figma_get_component_for_development, read-only) — the contract's own align-self:stretch correctly fills every REAL consumer's own container (verified live: coordonnees' embedded instance measures 480px, its own wrapper's content width) and must NOT carry a width itself, or every stretch-context consumer regresses (confirmed: adding one broke coordonnees/sav/presentation, reverted). This is a harness-only pin, isolation-context width, same class as accordion-row's own 1550.
  { id: 'tab', label: 'Tab (Piqueray)', kind: 'contract', contractId: 'ds.tab', fileKey: PIQUERAY, setNodeId: '2061:1588', renderWidth: 86 },
];
