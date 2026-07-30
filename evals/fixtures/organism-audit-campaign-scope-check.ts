/**
 * Adversarial contract for the Organism Audit Campaign v1 manifest validator.
 *
 * The campaign document fixes the audited perimeter BEFORE anything is read,
 * captured or compared.  A campaign that can quietly shrink, reorder, or
 * reconcile a subject by its human label is a campaign that can present a
 * partial audit as a complete one — so every perimeter defect is refused here,
 * by name, with its own typed issue code.
 *
 * This fixture is data-only, exactly like `visual-campaign-schema-check.ts`:
 * `validateAuditCampaign` and `validateAuditOutputPath` must not fetch Figma,
 * launch Chromium, read the filesystem, or create a directory.
 */
import path from "node:path";
import {
  EXPECTED_SUBJECT_IDS,
  ORGANISM_AUDIT_SCHEMA_VERSION,
  validateAuditCampaign,
  validateAuditOutputPath,
  type AuditIssue,
  type AuditIssueCode,
} from "../../extract/figma/organism-audit/campaign.js";

const FILE_KEY = "d9FYAUcqdcNtsuaMgLefvJ";
const FILE_VERSION = "2381581871281042338";
const ASSETS_MANIFEST =
  "extract/figma/visual-parity/fixture-assets/manifest.json";
const ASSET_MANIFEST = { schemaVersion: 1, assets: [] as Array<{ id: string }> };
const CAMPAIGN_OUTPUT_ROOT = path.resolve(
  "specs/013-auditer-fidelite-organismes/proofs",
);
const RESULT_SHA = "b".repeat(64);

/** The twelve organisms in wave order, with their live contract anchors. */
const INVENTORY = [
  { id: "coordonnees", displayName: "Coordonnees", wave: 1, node: "2104:2904" },
  { id: "devis", displayName: "Devis", wave: 1, node: "2096:2524" },
  { id: "hero", displayName: "Hero", wave: 1, node: "2111:3382" },
  { id: "presentation", displayName: "Presentation", wave: 1, node: "2103:2824" },
  { id: "sav", displayName: "SAV", wave: 1, node: "2108:3105" },
  { id: "texte-seo", displayName: "TexteSEO", wave: 1, node: "2108:3123" },
  { id: "faq", displayName: "FAQ", wave: 2, node: "2104:2914" },
  { id: "footer", displayName: "Footer", wave: 2, node: "2120:4785" },
  { id: "reassurances", displayName: "Reassurances", wave: 2, node: "2114:3721" },
  { id: "equipe", displayName: "Equipe", wave: 3, node: "2115:3947" },
  { id: "formulaire", displayName: "Formulaire", wave: 3, node: "2096:2564" },
  { id: "header", displayName: "Header", wave: 3, node: "84:285" },
] as const;

const DEPENDENCY_BY_PARENT: Record<string, string> = {
  equipe: "ds.member-card",
  formulaire: "ds.field",
  header: "ds.nav-item",
};

type FixtureCampaign = Record<string, any>;

const clone = <T>(value: T): T => structuredClone(value);

function subject(entry: (typeof INVENTORY)[number]): Record<string, unknown> {
  return {
    id: entry.id,
    displayName: entry.displayName,
    wave: entry.wave,
    contractId: `ds.${entry.id}`,
    contractVersion: "1.0.0",
    contractPath: `contracts/${entry.id}.contract.json`,
    figmaSetNodeId: entry.node,
    auditRefs: ["specs/010-extract-molecules-organisms/audit-reuse-map.md"],
    knownLimits: [],
    dependencyId: DEPENDENCY_BY_PARENT[entry.id] ?? null,
    coverage: {
      deriveFromFigma: true,
      deriveFromContract: true,
      deriveFromGeneratedProjection: true,
      // Empty at manifest time on purpose: the census (--inventory) fills the
      // required facts per wave.  A validator that demanded a non-empty fact
      // set here could never accept the campaign document it is meant to gate.
      requiredFactIds: [],
    },
    cases: [],
  };
}

function dependencyGate(
  parentSubjectId: string,
  dependencyContractId: string,
  expectedContractVersion: string,
  resultPath: string,
): Record<string, unknown> {
  return {
    parentSubjectId,
    dependencyContractId,
    receiptSchema: "visual-campaign-v1",
    requiredVerdict: "proved",
    resultPath,
    resultSha256: RESULT_SHA,
    expectedContractVersion,
    expectedFigmaFileVersion: FILE_VERSION,
    requireProbative: true,
  };
}

const VISUAL_RESULT_PATH =
  "specs/011-fix-molecule-convergence/proofs/visual/result.json";

const validCampaign: FixtureCampaign = {
  schemaVersion: ORGANISM_AUDIT_SCHEMA_VERSION,
  id: "013-auditer-fidelite-organismes",
  reference: {
    fileKey: FILE_KEY,
    fileVersion: FILE_VERSION,
    readOnly: true,
    deviceScaleFactor: 2,
  },
  generatedSurface: {
    kind: "react-storybook",
    sourceRoot: "src/components",
    bundleReceipt:
      "specs/013-auditer-fidelite-organismes/proofs/baseline/react-bundle.json",
  },
  acceptance: {
    maxRawDiffPct: 2.5,
    maxRegionDiffPct: 2.5,
    baselineEpsilonPp: 0.1,
    requireExactCoverage: true,
    requireVisibleEvidence: true,
    requireGeometryPass: true,
    requireSemanticPass: true,
  },
  expectedSubjectIds: INVENTORY.map((entry) => entry.id),
  waves: [
    {
      number: 1,
      subjectIds: ["coordonnees", "devis", "hero", "presentation", "sav", "texte-seo"],
      startsAfter: null,
      entryRule: "previous-wave-classified",
    },
    {
      number: 2,
      subjectIds: ["faq", "footer", "reassurances"],
      startsAfter: 1,
      entryRule: "previous-wave-classified",
    },
    {
      number: 3,
      subjectIds: ["equipe", "formulaire", "header"],
      startsAfter: 2,
      entryRule: "dependencies-proved",
    },
  ],
  dependencyGates: [
    dependencyGate("equipe", "ds.member-card", "1.2.0", VISUAL_RESULT_PATH),
    dependencyGate("formulaire", "ds.field", "2.0.0", VISUAL_RESULT_PATH),
    dependencyGate("header", "ds.nav-item", "1.1.0", VISUAL_RESULT_PATH),
  ],
  assetsManifest: ASSETS_MANIFEST,
  deferredPolicy: {
    forbidHardcodedValueConversion: true,
    forbidTokenFoundationChanges: true,
    baselineReceipt:
      "specs/013-auditer-fidelite-organismes/proofs/baseline/hardcoded-values.json",
  },
  subjects: INVENTORY.map(subject),
};

function renderIssues(issues: readonly AuditIssue[]): string {
  return issues.map((entry) => `${entry.code}@${entry.path}`).join(", ");
}

function expectAccepted(candidate: unknown, label: string): void {
  const result = validateAuditCampaign(candidate, {
    assetManifest: ASSET_MANIFEST,
  });
  if (!result.ok) {
    throw new Error(`${label} must be accepted: ${renderIssues(result.issues)}`);
  }
}

function expectRejected(
  candidate: unknown,
  code: AuditIssueCode,
  label: string,
): void {
  const result = validateAuditCampaign(candidate, {
    assetManifest: ASSET_MANIFEST,
  });
  if (result.ok || !result.issues.some((entry) => entry.code === code)) {
    throw new Error(
      `${label} must be rejected as ${code}; got ${renderIssues(result.issues) || "accepted"}`,
    );
  }
}

/** Refused BY NAME: the issue message must carry the offending value. */
function expectRejectedNaming(
  candidate: unknown,
  code: AuditIssueCode,
  name: string,
  label: string,
): void {
  const result = validateAuditCampaign(candidate, {
    assetManifest: ASSET_MANIFEST,
  });
  if (result.ok) throw new Error(`${label} must be rejected as ${code}; got accepted`);
  const matching = result.issues.filter((entry) => entry.code === code);
  if (matching.length === 0) {
    throw new Error(
      `${label} must be rejected as ${code}; got ${renderIssues(result.issues)}`,
    );
  }
  if (!matching.some((entry) => entry.message.includes(name))) {
    throw new Error(
      `${label} must be refused BY NAME: no ${code} issue names "${name}" — got "${matching.map((entry) => entry.message).join('" | "')}"`,
    );
  }
}

function expectOutputAccepted(requestedOutput: string, label: string): void {
  const result = validateAuditOutputPath(requestedOutput, CAMPAIGN_OUTPUT_ROOT);
  if (!result.ok || result.outputPath !== path.resolve(requestedOutput)) {
    throw new Error(
      `${label} must be an owned output path: ${result.ok ? "resolved elsewhere" : renderIssues(result.issues)}`,
    );
  }
}

function expectOutputRejected(
  requestedOutput: string,
  code: AuditIssueCode,
  label: string,
): void {
  const result = validateAuditOutputPath(requestedOutput, CAMPAIGN_OUTPUT_ROOT);
  if (result.ok || !result.issues.some((entry) => entry.code === code)) {
    throw new Error(
      `${label} must be rejected as ${code}; got ${result.ok ? "accepted" : renderIssues(result.issues)}`,
    );
  }
}

// ---------------------------------------------------------------------------
// 0. The perimeter constant is itself part of the contract.
// ---------------------------------------------------------------------------
const declaredIds = INVENTORY.map((entry) => entry.id);
if (
  EXPECTED_SUBJECT_IDS.length !== declaredIds.length ||
  EXPECTED_SUBJECT_IDS.some((id, index) => id !== declaredIds[index])
) {
  throw new Error(
    `EXPECTED_SUBJECT_IDS must be the twelve organisms in wave order; got ${EXPECTED_SUBJECT_IDS.join(", ")}`,
  );
}
if (ORGANISM_AUDIT_SCHEMA_VERSION !== 1) {
  throw new Error(
    `organism audit campaign schema version must be 1; got ${String(ORGANISM_AUDIT_SCHEMA_VERSION)}`,
  );
}

expectAccepted(validCampaign, "the complete twelve-organism campaign manifest");
expectRejected(null, "campaign-shape", "a non-object campaign");
for (const schemaVersion of [undefined, 0, 2, "1"] as const) {
  const malformed = clone(validCampaign);
  malformed.schemaVersion = schemaVersion;
  expectRejected(malformed, "schema-version", `schemaVersion=${String(schemaVersion)}`);
}

// ---------------------------------------------------------------------------
// 1. Twelve exact, ordered subject ids.
// ---------------------------------------------------------------------------
for (const [label, mutate] of [
  ["a lost target", (campaign: FixtureCampaign) => campaign.expectedSubjectIds.pop()],
  [
    "a surnumerary target",
    (campaign: FixtureCampaign) => campaign.expectedSubjectIds.push("nav-item"),
  ],
  [
    "a reordered perimeter",
    (campaign: FixtureCampaign) => {
      [campaign.expectedSubjectIds[1], campaign.expectedSubjectIds[2]] = [
        campaign.expectedSubjectIds[2],
        campaign.expectedSubjectIds[1],
      ];
    },
  ],
  [
    "a duplicated target",
    (campaign: FixtureCampaign) => {
      campaign.expectedSubjectIds[4] = "hero";
    },
  ],
] as const) {
  const malformed = clone(validCampaign);
  mutate(malformed);
  expectRejected(malformed, "expected-subject-ids", label);
}

// `subjects` mirrors the perimeter 1:1 — an audited subject that no longer
// appears in the declared array cannot be reported as covered.
const orphanSubject = clone(validCampaign);
orphanSubject.subjects.pop();
expectRejected(orphanSubject, "subject-id", "a perimeter with an unaudited target");

// ---------------------------------------------------------------------------
// 2. The three waves partition the perimeter, losslessly and in order.
// ---------------------------------------------------------------------------
// Code assignment: `wave-partition` is the set-level defect (loss/duplicate),
// `wave-order` the sequencing defect (reordered ids, reordered waves, wrong
// `startsAfter`), `wave-entry-rule` the entry-rule enum.
const waveLoss = clone(validCampaign);
waveLoss.waves[2].subjectIds = ["equipe", "formulaire"];
expectRejected(waveLoss, "wave-partition", "a wave dropping a declared target");

const waveDuplicate = clone(validCampaign);
waveDuplicate.waves[1].subjectIds.push("hero");
expectRejected(
  waveDuplicate,
  "wave-partition",
  "a target claimed by two waves",
);

const waveTruncated = clone(validCampaign);
waveTruncated.waves = waveTruncated.waves.slice(0, 2);
expectRejected(waveTruncated, "wave-partition", "a campaign missing its third wave");

const waveInternalReorder = clone(validCampaign);
[waveInternalReorder.waves[0].subjectIds[0], waveInternalReorder.waves[0].subjectIds[1]] =
  [waveInternalReorder.waves[0].subjectIds[1], waveInternalReorder.waves[0].subjectIds[0]];
expectRejected(
  waveInternalReorder,
  "wave-order",
  "a wave whose ids do not follow the declared perimeter order",
);

const waveArrayReorder = clone(validCampaign);
waveArrayReorder.waves = [
  waveArrayReorder.waves[2],
  waveArrayReorder.waves[0],
  waveArrayReorder.waves[1],
];
expectRejected(waveArrayReorder, "wave-order", "waves declared out of sequence");

for (const startsAfter of [null, 2, 3] as const) {
  const malformed = clone(validCampaign);
  malformed.waves[1].startsAfter = startsAfter;
  expectRejected(
    malformed,
    "wave-order",
    `wave 2 with startsAfter=${String(startsAfter)}`,
  );
}

for (const entryRule of ["whenever", "", null, "dependencies-probable"] as const) {
  const malformed = clone(validCampaign);
  malformed.waves[0].entryRule = entryRule;
  expectRejected(
    malformed,
    "wave-entry-rule",
    `wave 1 with entryRule=${String(entryRule)}`,
  );
}

// ---------------------------------------------------------------------------
// 3. The Figma reference is pinned and read-only.
// ---------------------------------------------------------------------------
for (const readOnly of [false, undefined, "true", 1] as const) {
  const malformed = clone(validCampaign);
  if (readOnly === undefined) delete malformed.reference.readOnly;
  else malformed.reference.readOnly = readOnly;
  expectRejected(
    malformed,
    "reference-read-only",
    `reference.readOnly=${String(readOnly)}`,
  );
}

// ---------------------------------------------------------------------------
// 4. Absolute acceptance thresholds stay inside [0, 2.5].
// ---------------------------------------------------------------------------
for (const key of ["maxRawDiffPct", "maxRegionDiffPct"] as const) {
  for (const threshold of [-0.1, 2.6, 100, Number.NaN, "2.5", null] as const) {
    const malformed = clone(validCampaign);
    malformed.acceptance[key] = threshold;
    expectRejected(
      malformed,
      "acceptance-threshold",
      `acceptance.${key}=${String(threshold)}`,
    );
  }
}
const boundaryThresholds = clone(validCampaign);
boundaryThresholds.acceptance.maxRawDiffPct = 0;
boundaryThresholds.acceptance.maxRegionDiffPct = 2.5;
expectAccepted(boundaryThresholds, "acceptance thresholds at both bounds");

// ---------------------------------------------------------------------------
// 5. An unknown receipt schema is refused BY NAME.
// ---------------------------------------------------------------------------
// The runner derives a 013 verdict from a receipt it knows how to read.  An
// unrecognised format silently read as v1 would turn an unparsed field into a
// pass, so the refusal must print the offending value rather than a generic
// "invalid dependency".
for (const receiptSchema of [
  "visual-campaign-v2",
  "organism-audit-v2",
  "visual-campaign",
  "011",
]) {
  const malformed = clone(validCampaign);
  malformed.dependencyGates[0].receiptSchema = receiptSchema;
  expectRejectedNaming(
    malformed,
    "dependency-receipt-schema",
    receiptSchema,
    `dependency gate declaring receiptSchema=${receiptSchema}`,
  );
}
const reprovedDependency = clone(validCampaign);
reprovedDependency.dependencyGates[0].receiptSchema = "organism-audit-v1";
expectAccepted(
  reprovedDependency,
  "a dependency re-proved in the 013 receipt format",
);

// ---------------------------------------------------------------------------
// 6. Output paths stay inside the campaign's own proof root.
// ---------------------------------------------------------------------------
expectOutputAccepted(CAMPAIGN_OUTPUT_ROOT, "the exact campaign proof root");
expectOutputAccepted(
  path.join(CAMPAIGN_OUTPUT_ROOT, "wave-1", "hero"),
  "a nested wave directory",
);
expectOutputRejected(
  path.resolve(CAMPAIGN_OUTPUT_ROOT, ".."),
  "output-path-outside-campaign-root",
  "the campaign spec folder above proofs/",
);
expectOutputRejected(
  path.resolve(CAMPAIGN_OUTPUT_ROOT, "..", "..", "011-fix-molecule-convergence", "proofs"),
  "output-path-outside-campaign-root",
  "another spec's proof root",
);
expectOutputRejected(
  path.resolve("."),
  "output-path-outside-campaign-root",
  "the repository root",
);
expectOutputRejected(
  "specs/013-auditer-fidelite-organismes/proofs/wave-1",
  "output-path-invalid",
  "a relative output path",
);
expectOutputRejected(
  "../proofs",
  "output-path-invalid",
  "a relative output path escaping upward",
);
// A `..` segment is refused even when it normalises back inside the root: an
// owned proof path is declared, not computed, and relying on normalisation
// makes the bound depend on a resolver detail.
expectOutputRejected(
  `${CAMPAIGN_OUTPUT_ROOT}${path.sep}wave-1${path.sep}..${path.sep}wave-2`,
  "output-path-invalid",
  "an absolute output path containing a `..` segment",
);
expectOutputRejected(
  `${CAMPAIGN_OUTPUT_ROOT}${path.sep}..${path.sep}escape`,
  "output-path-invalid",
  "an absolute output path stepping out through `..`",
);

// Declared manifest paths are bounded by the same rule.
for (const assetsManifest of ["../../etc/passwd", "/etc/passwd", "a/../../b.json"]) {
  const malformed = clone(validCampaign);
  malformed.assetsManifest = assetsManifest;
  expectRejected(
    malformed,
    "assets-manifest",
    `assetsManifest=${assetsManifest}`,
  );
}

// ---------------------------------------------------------------------------
// 7. Reconciliation is by id/contract key only — never by display name (D2).
// ---------------------------------------------------------------------------
// Visible labels have historically drifted (`SAV`, `TexteSEO`, `Accroche2`);
// ids and contract keys have not.  Matching on a label would let a renamed
// master silently satisfy another organism's slot.
const optedIntoNameMatching = clone(validCampaign);
optedIntoNameMatching.matchBy = "displayName";
expectRejected(
  optedIntoNameMatching,
  "display-name-matching",
  "a campaign opting into display-name reconciliation",
);

const gateByDisplayName = clone(validCampaign);
gateByDisplayName.dependencyGates[0].parentSubjectId = "Equipe";
expectRejected(
  gateByDisplayName,
  "display-name-matching",
  "a dependency gate naming its parent by display name",
);

const subjectMatchedByDisplayName = clone(validCampaign);
subjectMatchedByDisplayName.subjects[5].matchBy = "displayName";
expectRejected(
  subjectMatchedByDisplayName,
  "display-name-matching",
  "a subject reconciled by display name",
);

console.log(
  "✔ organism audit campaign v1 requires the twelve ordered subject ids, a lossless ordered wave partition, a read-only pinned Figma reference, thresholds within [0, 2.5], a known receipt schema named on refusal, output paths bounded by proofs/ without `..`, and id-only reconciliation",
);
