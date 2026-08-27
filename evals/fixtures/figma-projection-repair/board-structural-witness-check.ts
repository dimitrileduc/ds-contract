/**
 * 030 US3 — the owner decision board, generated instead of composed by hand, and the
 * gate that closes écart E2.
 *
 * E2, in one sentence: « no new responsive card state or variant is added » was a
 * STRUCTURAL fact — it changed the variant picker — sealed in abstract English inside
 * `acceptedFacts`, validated by a "go" that was looking at something else, and
 * discovered by the owner at 20:45. A render cannot witness it: an internal wrap and a
 * Presentation axis produce identical pixels.
 *
 * Constitution §XII covers PRESENTATION fidelity — 1:1, no rescaled thumbnails,
 * identical breakpoints named rather than duplicated. It does NOT cover this, and its
 * first sentence ("only the alternatives that produce a visible difference") could even
 * be read as licensing the omission. So the parade lives here, in the schema and in the
 * machine checks: a structural fact is witnessed by a capture of the PICKER, and a
 * decision carries one French sentence saying what the picker will show.
 *
 * The board's 47 minutes of hand-churn in 029 is the other half: seven zones, generated.
 */
import {
  generateDecisionBoard,
  validateDesignDecision,
} from '../../../extract/figma/projection-repair/board-generator.js';
import { BOARD_ZONE_IDS } from '../../../extract/figma/projection-repair/types.js';

const clone = <T>(value: T): T => structuredClone(value);

/* ------------------------------------------------------------------- inputs */
// The witnesses of a real section review: the widths where the output DIFFERS, each at
// true size, plus the before→after picker capture that is the only witness a structural
// fact can have.
const witnesses = {
  schemaVersion: '1.0.0' as const,
  boardName: '030 · CategoriesPrincipales · VALIDATION',
  widths: [
    { width: 390, label: 'Mobile', ref: 'proofs/temoin-390.png', imageWidth: 390, imageHeight: 1800, scale: 1 },
    { width: 834, label: 'Tablette', ref: 'proofs/temoin-834.png', imageWidth: 834, imageHeight: 1200, scale: 1 },
  ],
  picker: {
    before: { ref: 'proofs/picker-avant.png', imageWidth: 320, imageHeight: 240, scale: 1 },
    after: { ref: 'proofs/picker-apres.png', imageWidth: 320, imageHeight: 300, scale: 1 },
  },
  identicalWidths: [1200, 1440, 1728],
  archive: { ref: 'proofs/H2-option-manifest.json', nodeId: '9:900', frameCount: 28 },
};

// The 029 usage inventory shape, read as it stands: seven usages, six in two columns.
const usages = {
  observedCount: 7,
  usages: [
    ...Array.from({ length: 6 }, (_unused, index) => ({ instanceNodeId: `2:${index}`, configuration: { Colonnes: '2' } })),
    { instanceNodeId: '2:6', configuration: { Colonnes: '3' } },
  ],
};

const decisions = [{
  decisionId: 'H2-design',
  targetId: 'categories-principales',
  pickerConsequence: 'Le sélecteur de variantes montrera Presentation{Wide, Desktop, Mobile} × Style × Colonnes ; en Mobile, Colonnes reste affiché mais sans effet.',
  acceptedFacts: [
    {
      fact: 'Le sélecteur gagne un axe Presentation ; aucun Text Style n’est créé.',
      nature: 'structurel' as const,
      witnessRef: 'proofs/picker-avant.png',
    },
    {
      fact: 'À 834 px en 3 colonnes, la carte orpheline garde une largeur de piste.',
      nature: 'visuel' as const,
      witnessRef: 'proofs/temoin-834.png',
    },
  ],
  youWillSee: [
    'En mobile, une carte pleine largeur par ligne.',
    'À 834 px, la dernière carte garde la largeur de sa piste.',
  ],
  youWillNotGet: [
    'Vous n’aurez pas de nouveau Text Style : la typo mobile reste locale.',
    'Aucun contrôle de colonnes ne sera exposé en mobile.',
  ],
}];

/* ---------------------------------------------------------- the decision gate */
const accepted = validateDesignDecision(decisions[0]);
if (!accepted.ok) throw new Error(`a complete design decision was refused: ${accepted.issues.map((issue) => issue.message).join(', ')}`);

const noPickerSentence = clone(decisions[0]) as Record<string, unknown>;
delete noPickerSentence.pickerConsequence;
const noPickerResult = validateDesignDecision(noPickerSentence);
if (noPickerResult.ok || !noPickerResult.issues.some((issue) => issue.message.includes('picker-consequence-missing'))) {
  throw new Error('a design decision with no pickerConsequence was accepted');
}

const englishPicker = clone(decisions[0]);
englishPicker.pickerConsequence = 'The variant picker will gain a Presentation axis.';
const englishResult = validateDesignDecision(englishPicker);
if (englishResult.ok || !englishResult.issues.some((issue) => issue.message.includes('picker-consequence-not-in-french'))) {
  throw new Error('the E2 shape — a picker consequence sealed in English — was accepted');
}

const unwitnessed = clone(decisions[0]);
unwitnessed.acceptedFacts[0] = { ...unwitnessed.acceptedFacts[0], witnessRef: '' } as never;
const unwitnessedResult = validateDesignDecision(unwitnessed);
if (unwitnessedResult.ok || !unwitnessedResult.issues.some((issue) => issue.message.includes('structural-fact-unwitnessed'))) {
  throw new Error('a STRUCTURAL accepted fact with no witness was accepted — that is écart E2 exactly');
}

// The 029 short form is READ for history and never written from 030 onward.
const shortForm = clone(decisions[0]) as Record<string, unknown>;
shortForm.acceptedFacts = ['no new responsive card state or variant is added'];
const shortFormResult = validateDesignDecision(shortForm, { allowLegacyShortFacts: true });
if (!shortFormResult.ok) throw new Error('the historical 029 short form stopped being readable');
const shortFormWritten = validateDesignDecision(shortForm);
if (shortFormWritten.ok || !shortFormWritten.issues.some((issue) => issue.message.includes('accepted-fact-short-form'))) {
  throw new Error('the 029 short form was accepted for a NEW decision instead of being refused');
}

/* -------------------------------------------------------------- the board */
const board = generateDecisionBoard({ decisions, witnesses, usages });
if (!board.ok) throw new Error(`the board was refused on complete inputs: ${board.refusal} — ${board.message}`);

const zones = board.zones.zones;
for (const zoneId of BOARD_ZONE_IDS) {
  if (!zones[zoneId]) throw new Error(`the board is missing zone ${zoneId}`);
  if (!zones[zoneId].title || zones[zoneId].title.trim().length === 0) throw new Error(`zone ${zoneId} has no French heading`);
}
if (Object.keys(zones).length !== 7) throw new Error(`the board carries ${Object.keys(zones).length} zones, the template has 7`);

// Zone 1 states the real usage distribution and does not centre the exception (§XII).
if (!zones.usage.lines.some((line) => line.includes('7') && line.includes('6'))) {
  throw new Error(`the usage banner does not state the real distribution: ${zones.usage.lines.join(' | ')}`);
}
// Zone 3 is the one that would have prevented E2.
if (zones.youWillNotGet.lines.length !== decisions[0].youWillNotGet.length) {
  throw new Error('the negative statements were dropped or invented');
}
// Zone 4 carries the picker before AND after — the witness proper to a structural delta.
if (zones.pickerBeforeAfter.images.length !== 2) {
  throw new Error(`the picker zone carries ${zones.pickerBeforeAfter.images.length} captures, it needs before and after`);
}
// Zone 6 carries every decision's one-line French picker consequence.
if (!zones.decisions.lines.some((line) => line.includes(decisions[0].pickerConsequence))) {
  throw new Error('the decisions zone does not carry the picker consequence in the owner’s language');
}
// Zone 7 references the archive without spreading it (VALIDATION a-bis: do not
// over-correct §XII by putting the 28 technical frames back under the owner's eyes).
if (!zones.footer.lines.some((line) => line.includes('28') && line.includes('9:900'))) {
  throw new Error('the footer does not reference the hidden technical archive');
}
if (zones.footer.images.length !== 0) throw new Error('the footer spread the technical archive onto the decision surface');
if (!zones.footer.lines.some((line) => line.includes('1200'))) {
  throw new Error('§XII: breakpoints identical across options must be NAMED as identical, not silently dropped');
}
// §XII, machine-checked: every image is placed at its true size.
if (!board.zones.checks.noScaledThumbnails) throw new Error('the board declares a rescaled thumbnail');
if (!board.zones.checks.structuralFactsAllWitnessed) throw new Error('the board does not vouch for its structural facts');
if (!board.zones.checks.negativeStatementsInFrench) throw new Error('the board does not vouch for its negative statements');
if (board.zones.checks.archiveRef !== witnesses.archive.ref) throw new Error('the archive reference was lost');

/* ------------------------------------------------------------ determinism */
const again = generateDecisionBoard({ decisions, witnesses, usages });
if (!again.ok) throw new Error('the second generation refused inputs the first accepted');
if (again.script !== board.script || JSON.stringify(again.zones) !== JSON.stringify(board.zones)) {
  throw new Error('two generations on the same inputs are not byte-identical');
}

/* -------------------------------------------------------- the script runs */
// Executed on a mock, exactly as `figma-sync/*` scripts are: 030 proves the SHAPE
// headlessly, and the live pass belongs to 031.
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (...args: string[]) => (...values: unknown[]) => Promise<any>;
const created: any[] = [];
let serial = 0;
const node = (type: string) => {
  const made: any = {
    id: `mock:${serial += 1}`, type, name: '', children: [], parent: null,
    characters: '', x: 0, y: 0, width: 100, height: 100,
    appendChild(child: any) { child.parent = made; made.children.push(child); },
    resize(width: number, height: number) { made.width = width; made.height = height; },
  };
  created.push(made);
  return made;
};
const figma: any = {
  root: { children: [] as any[] },
  currentPage: { children: [] as any[], appendChild(child: any) { figma.currentPage.children.push(child); } },
  async loadAllPagesAsync() {},
  async loadFontAsync() {},
  createFrame: () => node('FRAME'),
  createText: () => node('TEXT'),
  createRectangle: () => node('RECTANGLE'),
  createSection: () => node('SECTION'),
};
const result = await new AsyncFunction('figma', board.script)(figma);
if (!result || result.boardName !== witnesses.boardName) throw new Error('the board script did not report the board it built');
if (result.zones.length !== 7) throw new Error(`the script built ${result.zones.length} zones on the mock`);
for (const zoneId of BOARD_ZONE_IDS) {
  if (!result.zones.some((zone: any) => zone.zoneId === zoneId)) throw new Error(`the script did not build zone ${zoneId}`);
}
const placed = created.filter((entry) => entry.type === 'RECTANGLE');
if (placed.length !== 4) throw new Error(`the script placed ${placed.length} witness frames, expected 2 witnesses + 2 picker captures`);
for (const frame of placed) {
  const declared = [...witnesses.widths.map((entry) => entry.imageWidth), witnesses.picker.before.imageWidth, witnesses.picker.after.imageWidth];
  if (!declared.includes(frame.width)) throw new Error(`a witness frame was placed at ${frame.width} px, which is not its true size`);
}

/* --------------------------------------------------------- named refusals */
const refuses = (label: string, refusal: string, mutate: (input: any) => void): void => {
  const input = { decisions: clone(decisions), witnesses: clone(witnesses), usages: clone(usages) };
  mutate(input);
  const attempt = generateDecisionBoard(input);
  if (attempt.ok) throw new Error(`${label}: ${refusal} was not refused`);
  if (attempt.refusal !== refusal) throw new Error(`${label}: expected ${refusal}, got ${attempt.refusal} — ${attempt.message}`);
};

refuses('a structural fact with no picker witness', 'structural-fact-unwitnessed', (input) => {
  input.decisions[0].acceptedFacts[0].witnessRef = 'proofs/temoin-834.png';
});
refuses('an announced width with no witness', 'witness-missing-for-width', (input) => {
  input.witnesses.widths = input.witnesses.widths.filter((entry: any) => entry.width !== 834);
});
refuses('no negative statements at all', 'negative-statements-missing', (input) => {
  input.decisions[0].youWillNotGet = [];
});
refuses('negative statements written in English', 'negative-statements-missing', (input) => {
  input.decisions[0].youWillNotGet = ['No new Text Style is created.'];
});
refuses('a witness placed at anything but true size', 'scaled-witness-refused', (input) => {
  input.witnesses.widths[0].imageWidth = 195;
  input.witnesses.widths[0].scale = 0.5;
});

console.log(`✔ owner decision board: the 7 §XII zones generated deterministically from ${decisions.length} decision(s), ${witnesses.widths.length} true-size witnesses and the before→after picker capture, built on the mock, archive referenced not spread — and structural-fact-unwitnessed / witness-missing-for-width / negative-statements-missing / scaled-witness-refused refused by name, with pickerConsequence mandatory and in French`);
