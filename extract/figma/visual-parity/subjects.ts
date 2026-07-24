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
}

export interface ContractSubject {
  id: string;
  label: string;
  kind: 'contract';
  /** Catalog contract id (contracts/<name>.contract.json `id`). */
  contractId: string;
  fileKey: string;
  setNodeId: string;
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
  // Instance: "Portes de garage résidentielles" page, position [0,1,0,2],
  // scanned live in step-3-postflight-scan.json — pdf + download, the SAME
  // pairing on all 10 real "both icons shown" instances found file-wide.
  {
    id: 'button-with-icons',
    label: 'Button with icons (Piqueray, both placements)',
    kind: 'contract',
    contractId: 'ds.button',
    fileKey: PIQUERAY,
    setNodeId: '6:122',
    instanceOverride: {
      nodeId: '230:573',
      variantName: 'Property 1=Link',
      // children matches the instance's OWN scanned text override — without
      // it the two sides render different widths for a reason that has
      // nothing to do with icon coverage (our default "Contactez-nous" vs
      // the instance's real, longer label).
      propPreset: {
        children: 'Brochure portes sectionnelles',
        iconLeft: true,
        iconRight: true,
        iconLeftGlyph: 'pdf',
        iconRightGlyph: 'download',
      },
    },
  },
];
