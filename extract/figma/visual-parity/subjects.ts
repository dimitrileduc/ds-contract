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
  // both already master-height; only width needed the fix. (Select is a THIRD
  // such brick but is NOT a subject — a native <select> drops its option text
  // in headless Chromium; see its named-exclusion note just below.)
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
  // Select is DELIBERATELY NOT a pixel subject (004, named exclusion). At
  // renderWidth 280px its box/border/chevron match, BUT a native <select> does
  // NOT render its selected-option TEXT in headless Chromium (this harness's
  // renderer) — the "ours"/code side comes up empty while Figma shows
  // « Texte de saisie ». The code is correct (it emits <select><option>{value},
  // and the dashboard's real-browser render shows the text); only headless
  // drops the option display. The masked score hides the gap (text rects
  // excluded), so a Select triptych would read as a false failure. Input and
  // Textarea KEEP their pixel coverage — <input>/<textarea> DO render their text
  // headless (both 0.00%). The Select's text fidelity is covered by build +
  // eval + deterministic-roundtrip, its box/chevron by the figma-script canvas
  // render — not by pixels.
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
  {
    id: 'button-with-icons',
    label: 'Button with icons (Piqueray, both placements)',
    kind: 'contract',
    contractId: 'ds.button',
    fileKey: PIQUERAY,
    setNodeId: '6:122',
    instanceOverride: {
      nodeId: '237:1500',
      variantName: 'Property 1=Outilne noir',
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
  { id: 'member-picture', label: 'MemberPicture (Piqueray)', kind: 'contract', contractId: 'ds.member-picture', fileKey: PIQUERAY, setNodeId: '274:2389', renderWidth: 364 },
  { id: 'piqueray-logo', label: 'PiquerayLogo (Piqueray)', kind: 'contract', contractId: 'ds.piqueray-logo', fileKey: PIQUERAY, setNodeId: '4:14', renderWidth: 180 },
  { id: 'accordion-row', label: 'AccordionRow (Piqueray)', kind: 'contract', contractId: 'ds.accordion-row', fileKey: PIQUERAY, setNodeId: '2059:1417', renderWidth: 1550 },
  { id: 'avantage', label: 'Avantage (Piqueray)', kind: 'contract', contractId: 'ds.avantage', fileKey: PIQUERAY, setNodeId: '2088:2350' },
  { id: 'carousel-controls', label: 'CarouselControls (Piqueray)', kind: 'contract', contractId: 'ds.carousel-controls', fileKey: PIQUERAY, setNodeId: '2077:2191', renderWidth: 1604 },
  { id: 'carte', label: 'Carte (Piqueray)', kind: 'contract', contractId: 'ds.carte', fileKey: PIQUERAY, setNodeId: '2063:1622' },
  { id: 'copyright', label: 'Copyright (Piqueray)', kind: 'contract', contractId: 'ds.copyright', fileKey: PIQUERAY, setNodeId: '2086:2330' },
  { id: 'field', label: 'Field (Piqueray)', kind: 'contract', contractId: 'ds.field', fileKey: PIQUERAY, setNodeId: '2056:1278', renderWidth: 280 },
  { id: 'footer-column', label: 'FooterColumn (Piqueray)', kind: 'contract', contractId: 'ds.footer-column', fileKey: PIQUERAY, setNodeId: '2079:2246', renderWidth: 169 },
  { id: 'member-card', label: 'MemberCard (Piqueray)', kind: 'contract', contractId: 'ds.member-card', fileKey: PIQUERAY, setNodeId: '2074:2072' },
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
  { id: 'product-card', label: 'ProductCard (Piqueray)', kind: 'contract', contractId: 'ds.product-card', fileKey: PIQUERAY, setNodeId: '2068:1972' },
  { id: 'realisation', label: 'Realisation (Piqueray)', kind: 'contract', contractId: 'ds.realisation', fileKey: PIQUERAY, setNodeId: '2095:2484' },
  { id: 'section-header', label: 'SectionHeader (Piqueray)', kind: 'contract', contractId: 'ds.section-header', fileKey: PIQUERAY, setNodeId: '2090:2397' },
  { id: 'tab', label: 'Tab (Piqueray)', kind: 'contract', contractId: 'ds.tab', fileKey: PIQUERAY, setNodeId: '2061:1588', renderWidth: 86 },
];
