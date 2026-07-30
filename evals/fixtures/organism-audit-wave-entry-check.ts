/**
 * Adversarial contract for the wave-entry rule of the organism audit (013).
 *
 * The three waves run in a known order, and the order is enforced by the TOOL
 * rather than by convention — a convention cannot refuse anything.  This
 * fixture is data-only and pins the one distinction the rule exists to make:
 *
 *   `previous-wave-classified` means every prior subject reached an HONEST
 *   FINAL verdict.  It does not mean the prior wave passed.
 *
 * Getting that backwards in either direction is a real failure mode.  Reading
 * it as "all green" would deadlock the campaign the moment an organism is
 * legitimately divergent — and since the expected 013 outcome has at least three
 * blocked organisms, waves 2 and 3 would never open at all.  Reading it as "the
 * files exist" would let an unclassified dossier count as done.
 *
 *   evaluateWaveEntry({ waveNumber, waves, priorSubjectStates })
 *
 * Reference: contracts/audit-campaign.interface.md (Wave), data-model.md §2,
 * quickstart.md §5, tasks.md T020/T048.
 */
import {
  evaluateWaveEntry,
  type AuditWaveDeclaration,
} from "../../extract/figma/organism-audit/campaign.js";

const WAVE_1 = ["coordonnees", "devis", "hero", "presentation", "sav", "texte-seo"];
const WAVE_2 = ["faq", "footer", "reassurances"];
const WAVE_3 = ["equipe", "formulaire", "header"];

const WAVES: AuditWaveDeclaration[] = [
  { number: 1, subjectIds: WAVE_1, startsAfter: null, entryRule: "previous-wave-classified" },
  { number: 2, subjectIds: WAVE_2, startsAfter: 1, entryRule: "previous-wave-classified" },
  { number: 3, subjectIds: WAVE_3, startsAfter: 2, entryRule: "dependencies-proved" },
];

type SubjectState = { id: string; classified: boolean; verdict: string | null };

const classifiedAs = (ids: string[], verdict: string): SubjectState[] =>
  ids.map((id) => ({ id, classified: true, verdict }));

/** A dossier that was never classified — the verdict field is empty, not merely negative. */
const unclassified = (ids: string[]): SubjectState[] =>
  ids.map((id) => ({ id, classified: false, verdict: null }));

function evaluate(waveNumber: 1 | 2 | 3, priorSubjectStates: SubjectState[]) {
  return evaluateWaveEntry({ waveNumber, waves: WAVES, priorSubjectStates });
}

function expectAllowed(
  label: string,
  waveNumber: 1 | 2 | 3,
  priorSubjectStates: SubjectState[],
): void {
  const result = evaluate(waveNumber, priorSubjectStates);
  if (!result.allowed) {
    throw new Error(
      `${label}: wave ${waveNumber} must be allowed to start; got refused (${result.reasons.join("; ") || "no reason"})`,
    );
  }
  if (result.exitCode !== 0) {
    throw new Error(`${label}: an allowed wave must report exit 0, got ${result.exitCode}`);
  }
}

function expectRefused(
  label: string,
  waveNumber: 1 | 2 | 3,
  priorSubjectStates: SubjectState[],
): void {
  const result = evaluate(waveNumber, priorSubjectStates);
  if (result.allowed) {
    throw new Error(`${label}: wave ${waveNumber} must be refused; got allowed`);
  }
  // The runner turns this straight into a process exit — the contract is exit 2.
  if (result.exitCode !== 2) {
    throw new Error(
      `${label}: a refused wave must exit 2 (invalid), got ${result.exitCode}`,
    );
  }
  if (result.reasons.length === 0) {
    throw new Error(`${label}: a refused wave must name why — a silent refusal is unactionable`);
  }
}

// Wave 1 has no predecessor: it opens against an empty prior state.
expectAllowed("the first wave", 1, []);

// ---------------------------------------------------------------------------
// THE decisive property: classified ≠ positive.
// ---------------------------------------------------------------------------
// At planning time the expected campaign result is exit 1 with at least three
// blocked organisms.  If "classified" were read as "passed", wave 2 could never
// open and the campaign could never reach an honest conclusion at all.  Each of
// these six wave-1 verdicts is NON-POSITIVE and every one of them is final.
for (const verdict of ["divergent", "limited", "not-proven", "blocked"]) {
  expectAllowed(
    `six wave-1 organisms honestly classified as ${verdict}`,
    2,
    classifiedAs(WAVE_1, verdict),
  );
}

// A mixed but fully classified wave is equally legitimate.
expectAllowed("a mixed but fully classified wave 1", 2, [
  { id: "coordonnees", classified: true, verdict: "divergent" },
  { id: "devis", classified: true, verdict: "proved" },
  { id: "hero", classified: true, verdict: "not-proven" },
  { id: "presentation", classified: true, verdict: "divergent" },
  { id: "sav", classified: true, verdict: "limited" },
  { id: "texte-seo", classified: true, verdict: "divergent" },
]);

// ---------------------------------------------------------------------------
// Absence never counts as completion.
// ---------------------------------------------------------------------------
expectRefused("a wholly unclassified wave 1", 2, unclassified(WAVE_1));

// One straggler is enough: five classified organisms plus one still running is
// not a classified wave.  This is the case a convention would wave through.
expectRefused("a single unclassified wave-1 subject", 2, [
  ...classifiedAs(WAVE_1.slice(0, 5), "divergent"),
  { id: "texte-seo", classified: false, verdict: null },
]);

// A missing dossier is not an implicit pass — it is a missing dossier.
expectRefused("a missing wave-1 dossier", 2, classifiedAs(WAVE_1.slice(0, 5), "proved"));
expectRefused("an entirely absent prior wave", 2, []);

// `classified: true` with no verdict is incoherent: a classification IS a
// verdict.  Accepting it would let an empty dossier open the next wave.
expectRefused("a subject claiming classification without a verdict", 2, [
  ...classifiedAs(WAVE_1.slice(0, 5), "proved"),
  { id: "texte-seo", classified: true, verdict: null },
]);

// A foreign subject cannot stand in for a required one, even when classified.
expectRefused("a wave-2 subject substituted into wave 1", 2, [
  ...classifiedAs(WAVE_1.slice(0, 5), "proved"),
  { id: "faq", classified: true, verdict: "proved" },
]);

// ---------------------------------------------------------------------------
// The order itself cannot be bypassed.
// ---------------------------------------------------------------------------
// Wave 3 depends on wave 2.  Supplying a perfect wave 1 does not open wave 3:
// skipping a wave would audit composed organisms before their prerequisites
// were ever classified.
expectRefused("wave 3 entered on wave-1 evidence alone", 3, classifiedAs(WAVE_1, "proved"));
expectRefused("wave 3 while wave 2 is unclassified", 3, [
  ...classifiedAs(WAVE_1, "proved"),
  ...unclassified(WAVE_2),
]);
expectAllowed("wave 3 after waves 1 and 2 are classified", 3, [
  ...classifiedAs(WAVE_1, "divergent"),
  ...classifiedAs(WAVE_2, "divergent"),
]);

console.log(
  "✔ wave entry is enforced by the tool: a fully classified but wholly non-positive prior wave opens the next one, " +
    "while a missing, unclassified, verdict-less or substituted dossier refuses it with exit 2 — and no wave order can be skipped",
);
