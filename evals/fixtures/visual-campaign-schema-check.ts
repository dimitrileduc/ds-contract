/**
 * Adversarial contract for the versioned visual-campaign validator.
 *
 * This fixture is intentionally data-only: a malformed campaign must be
 * rejected before the visual runner opens Chromium, calls Figma, or creates an
 * artifact.  It names the small pure API that the runner consumes:
 *
 *   validateVisualCampaign(parsedCampaign, { assetManifest })
 *   validateCampaignOutputPath(absoluteOut, absoluteCampaignOutputRoot)
 */
import path from "node:path";
import {
  REQUIRED_CAMPAIGN_SUBJECT_IDS,
  VISUAL_CAMPAIGN_SCHEMA_VERSION,
  validateCampaignOutputPath,
  validateVisualCampaign,
  type CampaignValidationIssue,
} from "../../extract/figma/visual-parity/campaign.js";

const IMAGE_SHA = "a".repeat(64);
const ASSET_MANIFEST = {
  schemaVersion: 1,
  assets: [{ id: "carte-reassurance", sha256: IMAGE_SHA }],
};

type FixtureAlias = {
  figmaNodeId: string;
  factIds: string[];
  imageSha256: string;
  geometryFingerprint: string;
  semanticFingerprint?: string;
};

type FixtureCase = {
  id: string;
  figmaNodeId: string;
  factIds: string[];
  fixtureAssetIds: string[];
  codeProps: { imageUrl?: unknown };
  equality?: {
    imageSha256: string;
    geometryFingerprint: string;
    semanticFingerprint: string;
  };
  aliases: FixtureAlias[];
};

type FixtureCampaign = {
  schemaVersion: unknown;
  id: string;
  reference: {
    fileKey: string;
    fileVersion: string;
    readOnly?: boolean;
  };
  assetsManifest: string;
  subjects: Array<{
    id: string;
    contractId: string;
    contractVersion: string;
    figmaSetNodeId: string;
    auditRefs: string[];
    cases: FixtureCase[];
  }>;
};

const clone = <T>(value: T): T => structuredClone(value);

function campaignCase(subjectId: string): FixtureCase {
  const hasImage = subjectId === "carte";
  return {
    id: `${subjectId}-default`,
    figmaNodeId: "2063:1606",
    factIds: [`${subjectId}.default`],
    fixtureAssetIds: hasImage ? ["carte-reassurance"] : [],
    codeProps: hasImage ? { imageUrl: { $asset: "carte-reassurance" } } : {},
    equality: hasImage
      ? {
          imageSha256: IMAGE_SHA,
          geometryFingerprint: `${subjectId}:geometry:v1`,
          semanticFingerprint: `${subjectId}:semantics:v1`,
        }
      : undefined,
    aliases: hasImage
      ? [
          {
            figmaNodeId: "2063:1607",
            factIds: [`${subjectId}.default`],
            imageSha256: IMAGE_SHA,
            geometryFingerprint: `${subjectId}:geometry:v1`,
            semanticFingerprint: `${subjectId}:semantics:v1`,
          },
        ]
      : [],
  };
}

const validCampaign: FixtureCampaign = {
  schemaVersion: VISUAL_CAMPAIGN_SCHEMA_VERSION,
  id: "011-fixture",
  reference: {
    fileKey: "d9FYAUcqdcNtsuaMgLefvJ",
    fileVersion: "2381229993207753432",
    readOnly: true,
  },
  assetsManifest: "extract/figma/visual-parity/fixture-assets/manifest.json",
  subjects: REQUIRED_CAMPAIGN_SUBJECT_IDS.map((id) => ({
    id,
    contractId: `ds.${id}`,
    contractVersion: "1.0.0",
    figmaSetNodeId: "2063:1622",
    auditRefs: ["specs/fixture/audit.md"],
    cases: [campaignCase(id)],
  })),
};

function renderIssues(issues: CampaignValidationIssue[]): string {
  return issues.map((entry) => `${entry.code}@${entry.path}`).join(", ");
}

function expectAccepted(candidate: unknown, label: string): void {
  const result = validateVisualCampaign(candidate, {
    assetManifest: ASSET_MANIFEST,
  });
  if (!result.ok)
    throw new Error(
      `${label} must be accepted: ${renderIssues(result.issues)}`,
    );
}

function expectRejected(
  candidate: unknown,
  code: CampaignValidationIssue["code"],
  label: string,
): void {
  const result = validateVisualCampaign(candidate, {
    assetManifest: ASSET_MANIFEST,
  });
  if (result.ok || !result.issues.some((entry) => entry.code === code)) {
    throw new Error(
      `${label} must be rejected as ${code}; got ${renderIssues(result.issues) || "accepted"}`,
    );
  }
}

function expectOutputAccepted(
  requestedOutput: string,
  root: string,
  label: string,
): void {
  const result = validateCampaignOutputPath(requestedOutput, root);
  if (!result.ok || result.outputPath !== path.resolve(requestedOutput)) {
    throw new Error(
      `${label} must be an owned output path: ${renderIssues(result.issues)}`,
    );
  }
}

function expectOutputRejected(
  requestedOutput: string,
  root: string,
  label: string,
): void {
  const result = validateCampaignOutputPath(requestedOutput, root);
  if (
    result.ok ||
    !result.issues.some(
      (entry) =>
        entry.code === "output-path-outside-campaign-root" ||
        entry.code === "output-path-invalid",
    )
  ) {
    throw new Error(
      `${label} must be rejected as an unbounded output path: ${renderIssues(result.issues) || "accepted"}`,
    );
  }
}

expectAccepted(validCampaign, "the complete pinned campaign fixture");

// A comparison may reconstruct an occurrence's containing layout from the
// same pinned GET child geometry used by the geometry receipt.  It cannot
// name arbitrary selectors or numbers: every requested part must already be
// pinned by a Figma descendant id.
const measuredLayoutContext = clone(validCampaign) as any;
const measuredField = measuredLayoutContext.subjects.find((subject: any) => subject.id === "field").cases[0];
measuredField.figmaPartNodeIds = { Saisie: "I2056:1265;2056:1269" };
measuredField.layoutContext = { rootWidth: "figma-root", partWidths: ["Saisie"] };
expectAccepted(measuredLayoutContext, "pinned Figma part-width comparison context");

const unpinnedPartWidth = clone(measuredLayoutContext) as any;
unpinnedPartWidth.subjects.find((subject: any) => subject.id === "field").cases[0].layoutContext.partWidths = ["not-a-pinned-part"];
expectRejected(unpinnedPartWidth, "case-shape", "part-width context without a pinned Figma descendant");

// Versioning must be explicit and strict: accepting an unknown version risks
// silently changing a validation meaning when the schema evolves.
for (const schemaVersion of [undefined, 0, 2, "1"] as const) {
  const malformed = clone(validCampaign);
  malformed.schemaVersion = schemaVersion;
  expectRejected(
    malformed,
    "schema-version",
    `schemaVersion=${String(schemaVersion)}`,
  );
}
expectRejected(null, "campaign-shape", "non-object campaign");

// The target list is closed.  A duplicate is not a substitute for an omitted
// molecule, and an eighth target cannot sneak into the verdict aggregate.
for (const mutate of [
  (campaign: FixtureCampaign) => campaign.subjects.pop(),
  (campaign: FixtureCampaign) =>
    campaign.subjects.push(clone(campaign.subjects[0])),
  (campaign: FixtureCampaign) => {
    campaign.subjects[6].id = "member-picture";
  },
  (campaign: FixtureCampaign) => {
    campaign.subjects[1].id = "carte";
  },
]) {
  const malformed = clone(validCampaign);
  mutate(malformed);
  expectRejected(malformed, "subject-id", "non-exact seven-subject campaign");
}

// Figma references cannot float.  A false/missing readOnly declaration, an
// unpinned version, or an empty key all turn evidence into an unsafe source.
for (const mutate of [
  (campaign: FixtureCampaign) => {
    campaign.reference.readOnly = false;
  },
  (campaign: FixtureCampaign) => {
    delete (campaign.reference as Partial<typeof campaign.reference>).readOnly;
  },
  (campaign: FixtureCampaign) => {
    campaign.reference.fileVersion = "latest";
  },
  (campaign: FixtureCampaign) => {
    campaign.reference.fileVersion = "";
  },
  (campaign: FixtureCampaign) => {
    campaign.reference.fileKey = "";
  },
]) {
  const malformed = clone(validCampaign);
  mutate(malformed);
  const result = validateVisualCampaign(malformed, {
    assetManifest: ASSET_MANIFEST,
  });
  const pinIssue = result.issues.find((entry) =>
    [
      "reference-read-only",
      "reference-file-version",
      "reference-file-key",
    ].includes(entry.code),
  );
  if (result.ok || !pinIssue) {
    throw new Error(
      `mutable/unpinned Figma reference was accepted: ${renderIssues(result.issues) || "accepted"}`,
    );
  }
}

const campaignOutputRoot = path.resolve(
  "specs/011-fix-molecule-convergence/proofs/visual",
);
expectOutputAccepted(
  campaignOutputRoot,
  campaignOutputRoot,
  "the exact campaign proof root",
);
expectOutputAccepted(
  path.join(campaignOutputRoot, "retry"),
  campaignOutputRoot,
  "a nested campaign scratch directory",
);
expectOutputRejected(path.resolve("."), campaignOutputRoot, "repository root");
expectOutputRejected(
  path.resolve(campaignOutputRoot, ".."),
  campaignOutputRoot,
  "campaign proof parent",
);
expectOutputRejected(
  path.resolve(campaignOutputRoot, "..", "visual-other"),
  campaignOutputRoot,
  "sibling campaign directory",
);
expectOutputRejected("../proofs/visual", campaignOutputRoot, "relative output");

// Aliases reduce duplicate proof work only if all of their observable facts
// are identical.  A missing, altered, or merely claimed fingerprint requires
// a distinct canonical case instead of a quiet deduplication.
for (const [code, mutate] of [
  [
    "alias-facts-not-equal",
    (campaign: FixtureCampaign) => {
      campaign.subjects[0].cases[0].aliases[0].factIds = ["carte.other"];
    },
  ],
  [
    "alias-image-hash-not-equal",
    (campaign: FixtureCampaign) => {
      campaign.subjects[0].cases[0].aliases[0].imageSha256 = "b".repeat(64);
    },
  ],
  [
    "alias-geometry-fingerprint-not-equal",
    (campaign: FixtureCampaign) => {
      campaign.subjects[0].cases[0].aliases[0].geometryFingerprint =
        "different-geometry";
    },
  ],
  [
    "alias-semantic-fingerprint-not-equal",
    (campaign: FixtureCampaign) => {
      campaign.subjects[0].cases[0].aliases[0].semanticFingerprint =
        "different-semantics";
    },
  ],
  [
    "alias-fingerprint-required",
    (campaign: FixtureCampaign) => {
      delete campaign.subjects[0].cases[0].aliases[0].semanticFingerprint;
    },
  ],
  [
    "alias-fingerprint-required",
    (campaign: FixtureCampaign) => {
      delete campaign.subjects[0].cases[0].equality;
    },
  ],
] as const) {
  const malformed = clone(validCampaign);
  mutate(malformed);
  expectRejected(malformed, code, `alias equality mutation (${code})`);
}

// `$asset` is comparison-only input.  It must resolve through the supplied
// manifest and be declared by the case; it is never an arbitrary URL/default.
for (const mutate of [
  (campaign: FixtureCampaign) => {
    campaign.subjects[0].cases[0].codeProps.imageUrl = {
      $asset: "missing-image",
    };
  },
  (campaign: FixtureCampaign) => {
    campaign.subjects[0].cases[0].fixtureAssetIds = ["missing-image"];
  },
  (campaign: FixtureCampaign) => {
    campaign.subjects[0].cases[0].codeProps.imageUrl = {
      $asset: "carte-reassurance",
      url: "/escape.jpg",
    };
  },
  (campaign: FixtureCampaign) => {
    campaign.subjects[0].cases[0].fixtureAssetIds = [];
  },
]) {
  const malformed = clone(validCampaign);
  mutate(malformed);
  expectRejected(
    malformed,
    "asset-reference-invalid",
    "invalid $asset reference",
  );
}

console.log(
  "✔ visual campaign schema rejects malformed versions, target coverage, mutable Figma pins, unsafe output paths, unequal aliases, and invalid $asset references",
);
