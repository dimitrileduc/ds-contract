/**
 * Owner decision board generator — the seven zones of constitution §XII plus the
 * corollary écart E2 asked for, computed instead of composed by hand.
 *
 * Why it exists at all. 029 spent 47 minutes on five successive redesigns of the
 * PRESENTATION of options whose design was already approved, and still shipped a board
 * that could not carry its one structural decision. The template is settled
 * (`RETRO-PROCESS.md` §4); what was missing was something that builds it the same way
 * every time.
 *
 * The split follows `emit-figma-script`: a small deterministic spec (`zones.json`, the
 * machine-checkable contract) and a transport script the bridge OR the mock executes.
 * 030 proves the shape headlessly; the live pass belongs to 031.
 *
 * What this module refuses, and why each refusal is the point:
 *
 *  - `structural-fact-unwitnessed` — a fact that changes the picker, the axes, the set
 *    topology or the Text Styles cannot be witnessed by a render: an internal wrap and
 *    a Presentation axis have the same pixels. That is écart E2, and it cost a day.
 *  - `witness-missing-for-width` — a width the board announces with no true-size
 *    witness behind it; a silently empty zone is worse than a missing board.
 *  - `negative-statements-missing` — the « ce que vous n'aurez pas » zone empty, or
 *    written outside the closed French negative grammar below.
 *  - `scaled-witness-refused` — a rescaled thumbnail offered as breakpoint evidence,
 *    which §XII forbids in as many words.
 */
import { BOARD_ZONE_IDS } from './types.js';
import type { BoardZone, BoardZoneId, BoardZonesManifest, DesignAcceptedFact, DesignDecisionDocument } from './types.js';
import { isObject } from './json.js';

type Json = Record<string, unknown>;
const record = isObject as (value: unknown) => value is Json;

export type BoardRefusal =
  | 'board-input-unreadable'
  | 'structural-fact-unwitnessed'
  | 'witness-missing-for-width'
  | 'negative-statements-missing'
  | 'scaled-witness-refused';

export interface BoardWitnessImage {
  ref: string;
  imageWidth: number;
  imageHeight: number;
  scale: number;
}

export interface BoardWitnesses {
  schemaVersion: '1.0.0';
  boardName: string;
  /** Only the widths where the output DIFFERS. §XII: identical ones are named below. */
  widths: Array<BoardWitnessImage & { width: number; label: string }>;
  /** The witness proper to a structural delta: the variant picker, before and after. */
  picker: { before: BoardWitnessImage; after: BoardWitnessImage };
  /** Widths whose output is identical across options — named, never duplicated. */
  identicalWidths?: number[];
  archive: { ref: string; nodeId: string; frameCount: number };
}

/** A decision document as the board reads it: the governed 029 shape plus the two
 *  owner-facing zones the board adds. Extending rather than restating keeps one
 *  declaration of what a decision IS. */
export interface BoardDecisionInput extends DesignDecisionDocument {
  youWillSee: string[];
  youWillNotGet: string[];
}

export interface BoardGeneratorInput {
  decisions: BoardDecisionInput[];
  witnesses: BoardWitnesses;
  /** The usage inventory, read in the shape the runner already produces. */
  usages: { observedCount?: number; usages?: Array<{ configuration?: Record<string, string> }> };
}

export type BoardGeneratorResult =
  | { ok: true; zones: BoardZonesManifest; script: string }
  | { ok: false; refusal: BoardRefusal; message: string };

/* ─────────────────────────────── the decision gate ─────────────────────────── */

export interface DecisionValidationIssue { code: string; path: string; message: string }
export type DecisionValidation =
  | { ok: true; issues: [] }
  | { ok: false; issues: DecisionValidationIssue[] };

/**
 * A closed French negative grammar.
 *
 * Named as the limit it is: this checks a bounded set of French negative openers, not
 * language identification. It is enough to catch the failure that actually happened —
 * a consequence sealed in abstract English — and it is verifiable by machine, which
 * free prose is not. Widening it is a one-line change with a fixture behind it.
 */
const FRENCH_NEGATIVE_OPENERS = [
  'vous n’aurez pas', "vous n'aurez pas",
  'vous ne verrez pas', "vous ne verrez pas",
  'aucun ', 'aucune ',
  'pas de ', 'pas d’', "pas d'",
  'ni ', 'le sélecteur ne ', 'rien ne ',
];

/** Enough French to tell the E2 sentence from its English twin, and no more. */
const FRENCH_MARKERS = [
  ' le ', ' la ', ' les ', ' des ', ' du ', ' un ', ' une ', ' est ', ' sera ', ' sont ', ' seront ',
  ' aucun', ' aucune', ' pas ', ' vous ', ' qui ', ' que ', ' dans ', ' avec ', ' sans ', ' reste ',
  ' montrera', ' gagnera', ' garde ', ' en ', ' sur ', ' et ',
];

const looksFrench = (sentence: string): boolean => {
  const padded = ` ${sentence.toLocaleLowerCase('fr')} `;
  return FRENCH_MARKERS.some((marker) => padded.includes(marker));
};

const isNegativeFrenchStatement = (line: string): boolean => {
  const lowered = line.trim().toLocaleLowerCase('fr');
  return FRENCH_NEGATIVE_OPENERS.some((opener) => lowered.startsWith(opener)) && looksFrench(line);
};

/** Facts that change something a render cannot show. */
const STRUCTURAL: DesignAcceptedFact['nature'] = 'structurel';

/**
 * The extended decision gate (FR-009). Lives beside `selectFinalOwnerDecisions` in
 * spirit — one decision vocabulary — but validates the DESIGN decision, which the
 * closure selector never touched.
 *
 * `allowLegacyShortFacts` exists for exactly one reason: the 029 files on disk carry
 * `acceptedFacts: string[]`, and history is read, not rewritten. Nothing from 030
 * onward writes that shape, so the default refuses it.
 */
export function validateDesignDecision(
  candidate: unknown,
  options: { allowLegacyShortFacts?: boolean } = {},
): DecisionValidation {
  const issues: DecisionValidationIssue[] = [];
  const add = (path: string, message: string): void => { issues.push({ code: 'design-decision', path, message }); };

  if (!record(candidate)) {
    add('$', 'design-decision-unreadable: a design decision must be an object');
    return { ok: false, issues };
  }

  const consequence = candidate.pickerConsequence;
  if (typeof consequence !== 'string' || consequence.trim().length === 0) {
    add('$.pickerConsequence', 'picker-consequence-missing: every design decision states, in one sentence, what the variant picker will show after apply');
  } else if (!looksFrench(consequence)) {
    add('$.pickerConsequence', `picker-consequence-not-in-french: the owner reads this sentence, and écart E2 is what an English one costs — ${JSON.stringify(consequence)}`);
  }

  const facts = candidate.acceptedFacts;
  if (!Array.isArray(facts) || facts.length === 0) {
    add('$.acceptedFacts', 'accepted-facts-missing: a decision with no accepted fact decides nothing');
    return issues.length === 0 ? { ok: true, issues: [] } : { ok: false, issues };
  }

  for (const [index, fact] of facts.entries()) {
    const factPath = `$.acceptedFacts[${index}]`;
    if (typeof fact === 'string') {
      if (!options.allowLegacyShortFacts) {
        add(factPath, 'accepted-fact-short-form: the 029 string form is read for history and never written from 030 onward — declare { fact, nature, witnessRef }');
      }
      continue;
    }
    if (!record(fact) || typeof fact.fact !== 'string' || fact.fact.trim().length === 0) {
      add(factPath, 'accepted-fact-unreadable: an accepted fact must carry its sentence');
      continue;
    }
    if (fact.nature !== 'visuel' && fact.nature !== STRUCTURAL) {
      add(`${factPath}.nature`, 'accepted-fact-nature-missing: every accepted fact is VISUEL (witnessed 1:1) or STRUCTUREL (witnessed by the picker)');
      continue;
    }
    if (typeof fact.witnessRef !== 'string' || fact.witnessRef.trim().length === 0) {
      add(`${factPath}.witnessRef`, fact.nature === STRUCTURAL
        ? `structural-fact-unwitnessed: ${JSON.stringify(fact.fact)} changes what the owner will see in the picker, and no render can show it`
        : 'witness-missing-for-fact: a visual fact is witnessed by a 1:1 render');
    }
  }

  return issues.length === 0 ? { ok: true, issues: [] } : { ok: false, issues };
}

/* ───────────────────────────────── the generator ───────────────────────────── */

function usageLines(usages: BoardGeneratorInput['usages']): string[] {
  const rows = Array.isArray(usages?.usages) ? usages.usages : [];
  const total = typeof usages?.observedCount === 'number' ? usages.observedCount : rows.length;
  const tally = new Map<string, number>();
  for (const row of rows) {
    const configuration = record(row) && record(row.configuration) ? row.configuration : {};
    const label = Object.keys(configuration).sort().map((axis) => `${axis}=${String(configuration[axis])}`).join(', ');
    if (!label) continue;
    tally.set(label, (tally.get(label) ?? 0) + 1);
  }
  // §XII: state the real distribution, dominant configuration first, and never centre
  // an exception over it.
  const distribution = [...tally].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
  const lines = [`${total} usage(s) relevé(s) sur Pages.`];
  for (const [label, count] of distribution) {
    lines.push(count === 1 && distribution.length > 1
      ? `${label} — ${count} usage sur ${total} (exception).`
      : `${label} — ${count} usage(s) sur ${total}.`);
  }
  return lines;
}

const zone = (zoneId: BoardZoneId, title: string, lines: string[], images: BoardZone['images'] = []): BoardZone =>
  ({ zoneId, title, lines, images });

export function generateDecisionBoard(input: BoardGeneratorInput): BoardGeneratorResult {
  if (!record(input) || !Array.isArray(input.decisions) || input.decisions.length === 0 || !record(input.witnesses)) {
    return { ok: false, refusal: 'board-input-unreadable', message: 'a board needs at least one decision and its witness manifest' };
  }
  const witnesses = input.witnesses;
  if (!Array.isArray(witnesses.widths) || !record(witnesses.picker) || !record(witnesses.archive)) {
    return { ok: false, refusal: 'board-input-unreadable', message: 'the witness manifest must declare its widths, its before→after picker capture and its technical archive' };
  }

  // §XII, machine-checked before anything is composed: a rescaled thumbnail is not
  // breakpoint evidence, and the board would rather not exist than say it is.
  const allImages: Array<BoardWitnessImage & { context: string }> = [
    ...witnesses.widths.map((entry) => ({ ...entry, context: `témoin ${entry.width} px` })),
    { ...witnesses.picker.before, context: 'picker avant' },
    { ...witnesses.picker.after, context: 'picker après' },
  ];
  for (const image of allImages) {
    if (typeof image.ref !== 'string' || image.ref.length === 0 ||
      typeof image.imageWidth !== 'number' || image.imageWidth <= 0 ||
      typeof image.imageHeight !== 'number' || image.imageHeight <= 0) {
      return { ok: false, refusal: 'board-input-unreadable', message: `${image.context} does not declare a reference and real dimensions` };
    }
    if (image.scale !== 1) {
      return { ok: false, refusal: 'scaled-witness-refused', message: `${image.context} is declared at scale ${image.scale}; constitution §XII refuses a rescaled thumbnail as breakpoint evidence` };
    }
  }
  for (const entry of witnesses.widths) {
    if (entry.imageWidth !== entry.width) {
      return { ok: false, refusal: 'scaled-witness-refused', message: `témoin ${entry.width} px is placed at ${entry.imageWidth} px; a witness is shown at its real target dimension or not at all` };
    }
  }

  const pickerRefs = new Set([witnesses.picker.before.ref, witnesses.picker.after.ref]);
  const widthRefs = new Map(witnesses.widths.map((entry) => [entry.ref, entry] as const));

  const youWillSee: string[] = [];
  const youWillNotGet: string[] = [];
  const decisionLines: string[] = [];

  for (const decision of input.decisions) {
    const validation = validateDesignDecision(decision);
    if (!validation.ok) {
      const structural = validation.issues.find((issue) => issue.message.startsWith('structural-fact-unwitnessed'));
      if (structural) return { ok: false, refusal: 'structural-fact-unwitnessed', message: structural.message };
      return { ok: false, refusal: 'board-input-unreadable', message: validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join(' | ') };
    }
    youWillSee.push(...(Array.isArray(decision.youWillSee) ? decision.youWillSee : []));
    youWillNotGet.push(...(Array.isArray(decision.youWillNotGet) ? decision.youWillNotGet : []));
    decisionLines.push(`${decision.decisionId} — ${decision.pickerConsequence}`);

    for (const fact of decision.acceptedFacts) {
      if (typeof fact === 'string') continue;
      if (fact.nature === STRUCTURAL && !pickerRefs.has(fact.witnessRef)) {
        // A structural fact pointing at a RENDER is the E2 shape wearing a witness.
        return {
          ok: false,
          refusal: 'structural-fact-unwitnessed',
          message: `structural-fact-unwitnessed: ${JSON.stringify(fact.fact)} is witnessed by ${JSON.stringify(fact.witnessRef)}, which is not a capture of the variant picker — an internal wrap and a Presentation axis produce identical pixels`,
        };
      }
      if (fact.nature === 'visuel' && !widthRefs.has(fact.witnessRef)) {
        return {
          ok: false,
          refusal: 'witness-missing-for-width',
          message: `witness-missing-for-width: ${JSON.stringify(fact.fact)} is witnessed by ${JSON.stringify(fact.witnessRef)}, which the board does not place at true size`,
        };
      }
      decisionLines.push(`  · ${fact.nature.toUpperCase()} — ${fact.fact} (témoin ${fact.witnessRef})`);
    }
  }

  if (youWillNotGet.length === 0 || !youWillNotGet.every(isNegativeFrenchStatement)) {
    return {
      ok: false,
      refusal: 'negative-statements-missing',
      message: youWillNotGet.length === 0
        ? 'negative-statements-missing: the « ce que vous n’aurez pas » zone is empty — it is the zone that would have prevented écart E2'
        : `negative-statements-missing: ${JSON.stringify(youWillNotGet.find((line) => !isNegativeFrenchStatement(line)))} is not a French negative statement the owner can read`,
    };
  }
  if (youWillSee.length === 0) {
    return { ok: false, refusal: 'board-input-unreadable', message: 'the « ce que vous verrez » zone is empty' };
  }

  const identical = Array.isArray(witnesses.identicalWidths) ? [...witnesses.identicalWidths].sort((left, right) => left - right) : [];
  const zones: Record<BoardZoneId, BoardZone> = {
    usage: zone('usage', 'Usage réel', usageLines(input.usages)),
    youWillSee: zone('youWillSee', 'Ce que vous verrez', [...youWillSee]),
    youWillNotGet: zone('youWillNotGet', 'Ce que vous n’aurez pas', [...youWillNotGet]),
    pickerBeforeAfter: zone('pickerBeforeAfter', 'Sélecteur de variantes — avant → après', [
      'Le témoin propre à un changement invisible au rendu.',
    ], [
      { ref: witnesses.picker.before.ref, label: 'avant', width: witnesses.picker.before.imageWidth, height: witnesses.picker.before.imageHeight },
      { ref: witnesses.picker.after.ref, label: 'après', width: witnesses.picker.after.imageWidth, height: witnesses.picker.after.imageHeight },
    ]),
    witnesses: zone('witnesses', 'Témoins 1:1 — seulement là où la sortie diffère',
      witnesses.widths.map((entry) => `${entry.label} — ${entry.width} px, 1:1.`),
      witnesses.widths.map((entry) => ({ ref: entry.ref, label: `${entry.label} · ${entry.width} px · 1:1`, width: entry.imageWidth, height: entry.imageHeight })),
    ),
    decisions: zone('decisions', 'Décisions', decisionLines),
    footer: zone('footer', 'Pied', [
      identical.length > 0
        ? `Identiques entre options : ${identical.map((width) => `${width} px`).join(', ')}.`
        : 'Identiques entre options : aucune largeur relevée comme identique.',
      `Archive technique masquée : ${witnesses.archive.nodeId}, ${witnesses.archive.frameCount} frames — ${witnesses.archive.ref}.`,
    ]),
  };

  const manifest: BoardZonesManifest = {
    schemaVersion: '1.0.0',
    boardName: witnesses.boardName,
    targetId: input.decisions[0].targetId ?? '',
    zones,
    checks: {
      structuralFactsAllWitnessed: true,
      negativeStatementsInFrench: true,
      noScaledThumbnails: true,
      archiveRef: witnesses.archive.ref,
    },
  };
  // The checks are `true` only on this path, which every refusal above exits before
  // reaching. A check is a receipt of a gate that ran, never an intention.
  return { ok: true, zones: manifest, script: emitBoardScript(manifest) };
}

/* ──────────────────────────────── the transport ────────────────────────────── */

const ZONE_ORDER: readonly BoardZoneId[] = BOARD_ZONE_IDS;

/**
 * The build script, in the shape of `figma-sync/*`: a small deterministic spec and a
 * shared runtime that walks it. It creates frames and TEXT nodes, and places each
 * witness as a rectangle AT ITS TRUE SIZE named by its reference — the bytes are laid
 * in by 031, on the live canvas, which is where §X applies. Nothing here mutates an
 * existing node.
 */
export function emitBoardScript(manifest: BoardZonesManifest): string {
  const spec = {
    boardName: manifest.boardName,
    zones: ZONE_ORDER.map((zoneId) => manifest.zones[zoneId]),
    checks: manifest.checks,
  };
  return `// Generated by extract/figma/projection-repair/board-generator.ts — do not hand-edit.
const SPEC = ${JSON.stringify(spec)};
await figma.loadAllPagesAsync();
const board = figma.createFrame();
board.name = SPEC.boardName;
board.layoutMode = 'VERTICAL';
board.itemSpacing = 64;
board.paddingTop = 64; board.paddingRight = 64; board.paddingBottom = 64; board.paddingLeft = 64;
figma.currentPage.appendChild(board);
const built = [];
for (const zone of SPEC.zones) {
  const frame = figma.createFrame();
  frame.name = zone.zoneId;
  frame.layoutMode = 'VERTICAL';
  frame.itemSpacing = 16;
  board.appendChild(frame);
  const heading = figma.createText();
  heading.name = zone.zoneId + '/titre';
  heading.characters = zone.title;
  frame.appendChild(heading);
  for (const line of zone.lines) {
    const text = figma.createText();
    text.name = zone.zoneId + '/ligne';
    text.characters = line;
    frame.appendChild(text);
  }
  for (const image of zone.images) {
    const slot = figma.createRectangle();
    slot.name = zone.zoneId + '/temoin/' + image.ref;
    // True size, always: a rescaled witness is refused before this script exists.
    slot.resize(image.width, image.height);
    frame.appendChild(slot);
  }
  built.push({ zoneId: zone.zoneId, lines: zone.lines.length, images: zone.images.length });
}
return { boardName: SPEC.boardName, zones: built, checks: SPEC.checks };
`;
}
