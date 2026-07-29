/**
 * Adversarial coverage contract for Visual Campaign 011.
 *
 * This fixture exercises only pure campaign validation.  It does not read the
 * eventual campaign file, contact Figma, launch a browser, or create proof
 * artifacts: those operations must remain below the runner's preflight.
 */
import {
  REQUIRED_CAMPAIGN_SUBJECT_IDS,
  VISUAL_CAMPAIGN_SCHEMA_VERSION,
  validateExactCoverage,
  validateVisualCampaign,
  type CampaignValidationIssue,
} from '../../extract/figma/visual-parity/campaign.js';

const IMAGE_SHA = 'a'.repeat(64);
const CAMPAIGN_TARGET_IDS = [
  'carte',
  'field',
  'member-card',
  'nav-item',
  'product-card',
  'realisation',
  'tab',
] as const;

type CampaignTargetId = (typeof CAMPAIGN_TARGET_IDS)[number];

const TARGET_NODES: Record<CampaignTargetId, { set: string; case: string }> = {
  carte: { set: '2063:1622', case: '2063:1606' },
  field: { set: '2056:1278', case: '2056:1278' },
  'member-card': { set: '2074:2072', case: '2074:2072' },
  'nav-item': { set: '2152:5554', case: '2152:5554' },
  'product-card': { set: '2068:1972', case: '2068:1972' },
  realisation: { set: '2095:2484', case: '2095:2484' },
  tab: { set: '2061:1588', case: '2061:1588' },
};

const TARGET_FACTS: Record<CampaignTargetId, string> = {
  carte: 'carte.disposition.reassurance',
  field: 'field.etat.normal',
  'member-card': 'member-card.content.default',
  'nav-item': 'nav-item.active.false',
  'product-card': 'product-card.image.default',
  realisation: 'realisation.taille.grand',
  tab: 'tab.etat.default',
};

type FixtureAlias = {
  figmaNodeId?: string;
  factIds: string[];
  imageSha256: string;
  geometryFingerprint: string;
  semanticFingerprint?: string;
};

type FixtureCase = {
  id: string;
  figmaNodeId?: string;
  factIds: string[];
  fixtureAssetIds: string[];
  codeProps: Record<string, unknown>;
  equality?: {
    imageSha256: string;
    geometryFingerprint: string;
    semanticFingerprint: string;
  };
  aliases: FixtureAlias[];
};

type FixtureCampaign = {
  schemaVersion: number;
  id: string;
  reference: {
    fileKey: string;
    fileVersion: string;
    readOnly: true;
  };
  assetsManifest: string;
  subjects: Array<{
    id: string;
    contractId: string;
    contractVersion: string;
    figmaSetNodeId?: string;
    cases: FixtureCase[];
  }>;
};

const ASSET_MANIFEST = {
  assets: [{ id: 'carte-reassurance', sha256: IMAGE_SHA }],
};

const clone = <T>(value: T): T => structuredClone(value);

function sameMembers(actual: readonly string[], expected: readonly string[]): boolean {
  return actual.length === expected.length && actual.every((entry, index) => entry === expected[index]);
}

function assertExactTargetIds(): void {
  if (!sameMembers(REQUIRED_CAMPAIGN_SUBJECT_IDS, CAMPAIGN_TARGET_IDS)) {
    throw new Error(
      `campaign target ids drifted: expected ${CAMPAIGN_TARGET_IDS.join(', ')}, got ${REQUIRED_CAMPAIGN_SUBJECT_IDS.join(', ')}`,
    );
  }
}

function campaignSubject(id: CampaignTargetId): FixtureCampaign['subjects'][number] {
  const hasImage = id === 'carte';
  const factIds = [TARGET_FACTS[id]];
  return {
    id,
    contractId: `ds.${id}`,
    contractVersion: '1.0.0',
    figmaSetNodeId: TARGET_NODES[id].set,
    cases: [
      {
        id: `${id}-canonical`,
        figmaNodeId: TARGET_NODES[id].case,
        factIds,
        fixtureAssetIds: hasImage ? ['carte-reassurance'] : [],
        codeProps: hasImage ? { imageUrl: { $asset: 'carte-reassurance' } } : {},
        equality: hasImage
          ? {
              imageSha256: IMAGE_SHA,
              geometryFingerprint: 'carte.geometry.v1',
              semanticFingerprint: 'carte.semantics.v1',
            }
          : undefined,
        aliases: hasImage
          ? [
              {
                figmaNodeId: '2063:1607',
                factIds: [...factIds],
                imageSha256: IMAGE_SHA,
                geometryFingerprint: 'carte.geometry.v1',
                semanticFingerprint: 'carte.semantics.v1',
              },
            ]
          : [],
      },
    ],
  };
}

const validCampaign: FixtureCampaign = {
  schemaVersion: VISUAL_CAMPAIGN_SCHEMA_VERSION,
  id: '011-fix-molecule-convergence',
  reference: {
    fileKey: 'd9FYAUcqdcNtsuaMgLefvJ',
    fileVersion: '2381229993207753432',
    readOnly: true,
  },
  assetsManifest: 'extract/figma/visual-parity/fixture-assets/manifest.json',
  subjects: CAMPAIGN_TARGET_IDS.map(campaignSubject),
};

function issueCodes(issues: CampaignValidationIssue[]): string {
  return issues.map((issue) => `${issue.code}@${issue.path}`).join(', ');
}

function expectCampaignAccepted(candidate: unknown, label: string): void {
  const result = validateVisualCampaign(candidate, { assetManifest: ASSET_MANIFEST });
  if (!result.ok) throw new Error(`${label} must be accepted: ${issueCodes(result.issues)}`);
}

function expectCampaignRejected(
  candidate: unknown,
  expectedCode: CampaignValidationIssue['code'],
  label: string,
): void {
  const result = validateVisualCampaign(candidate, { assetManifest: ASSET_MANIFEST });
  if (result.ok || !result.issues.some((issue) => issue.code === expectedCode)) {
    throw new Error(`${label} must be rejected as ${expectedCode}; got ${result.ok ? 'accepted' : issueCodes(result.issues)}`);
  }
}

function observedFactUnion(candidate: FixtureCampaign): string[] {
  return [...new Set(candidate.subjects.flatMap((subject) => subject.cases.flatMap((campaignCase) => campaignCase.factIds)))].sort();
}

function expectCoverageAccepted(expected: readonly string[], observed: readonly string[], label: string): void {
  const result = validateExactCoverage(expected, observed);
  if (!result.ok) throw new Error(`${label} must have exact fact coverage: ${issueCodes(result.issues)}`);
}

function expectCoverageRejected(
  expected: readonly string[],
  observed: readonly string[],
  expectedCode: CampaignValidationIssue['code'],
  label: string,
): void {
  const result = validateExactCoverage(expected, observed);
  if (result.ok || !result.issues.some((issue) => issue.code === expectedCode)) {
    throw new Error(`${label} must be rejected as ${expectedCode}; got ${result.ok ? 'accepted' : issueCodes(result.issues)}`);
  }
}

assertExactTargetIds();
expectCampaignAccepted(validCampaign, 'complete 011 campaign fixture');

// Seven named molecules are the complete campaign scope: omission, duplication,
// or substitution cannot be hidden by an otherwise well-formed subject.
for (const mutate of [
  (campaign: FixtureCampaign) => campaign.subjects.pop(),
  (campaign: FixtureCampaign) => campaign.subjects.push(clone(campaign.subjects[0])),
  (campaign: FixtureCampaign) => {
    campaign.subjects[6].id = 'member-picture';
  },
]) {
  const malformed = clone(validCampaign);
  mutate(malformed);
  expectCampaignRejected(malformed, 'subject-id', 'non-exact 011 target set');
}

// Coverage is a fact union, not a count.  Both a dropped fact and an invented
// fact must keep the campaign out of a passing verdict.
const expectedFacts = CAMPAIGN_TARGET_IDS.map((id) => TARGET_FACTS[id]);
expectCoverageAccepted(expectedFacts, observedFactUnion(validCampaign), 'complete 011 fact union');
expectCoverageRejected(
  expectedFacts,
  observedFactUnion(validCampaign).filter((fact) => fact !== TARGET_FACTS.tab),
  'coverage-missing',
  'missing 011 fact',
);
expectCoverageRejected(
  expectedFacts,
  [...observedFactUnion(validCampaign), 'tab.uninventoried.fact'],
  'coverage-unexpected',
  'unexpected 011 fact',
);

// The campaign records Figma nodes as immutable evidence anchors.  Empty or
// omitted set, canonical, and alias node references are invalid before capture.
for (const [expectedCode, mutate] of [
  [
    'subject-set-node',
    (campaign: FixtureCampaign) => {
      delete campaign.subjects[0].figmaSetNodeId;
    },
  ],
  [
    'case-node',
    (campaign: FixtureCampaign) => {
      delete campaign.subjects[0].cases[0].figmaNodeId;
    },
  ],
  [
    'case-shape',
    (campaign: FixtureCampaign) => {
      delete campaign.subjects[0].cases[0].aliases[0].figmaNodeId;
    },
  ],
] as const) {
  const malformed = clone(validCampaign);
  mutate(malformed);
  expectCampaignRejected(malformed, expectedCode, `missing immutable Figma node (${expectedCode})`);
}

// `$asset` may only name a declared, manifest-resolved test asset.  The value
// is comparison input, never an arbitrary URL or a runtime contract default.
for (const mutate of [
  (campaign: FixtureCampaign) => {
    campaign.subjects[0].cases[0].codeProps.imageUrl = { $asset: 'missing-image' };
    campaign.subjects[0].cases[0].fixtureAssetIds = ['missing-image'];
  },
  (campaign: FixtureCampaign) => {
    campaign.subjects[0].cases[0].fixtureAssetIds = [];
  },
  (campaign: FixtureCampaign) => {
    campaign.subjects[0].cases[0].codeProps.imageUrl = {
      $asset: 'carte-reassurance',
      url: 'https://invalid.example/escape.jpg',
    };
  },
]) {
  const malformed = clone(validCampaign);
  mutate(malformed);
  expectCampaignRejected(malformed, 'asset-reference-invalid', 'invalid 011 $asset reference');
}

// Deduplication is allowed only when every alias repeats the canonical facts
// and all three equality fingerprints exactly.
for (const [expectedCode, mutate] of [
  [
    'alias-facts-not-equal',
    (campaign: FixtureCampaign) => {
      campaign.subjects[0].cases[0].aliases[0].factIds = ['carte.disposition.categorie'];
    },
  ],
  [
    'alias-image-hash-not-equal',
    (campaign: FixtureCampaign) => {
      campaign.subjects[0].cases[0].aliases[0].imageSha256 = 'b'.repeat(64);
    },
  ],
  [
    'alias-geometry-fingerprint-not-equal',
    (campaign: FixtureCampaign) => {
      campaign.subjects[0].cases[0].aliases[0].geometryFingerprint = 'carte.geometry.v2';
    },
  ],
  [
    'alias-semantic-fingerprint-not-equal',
    (campaign: FixtureCampaign) => {
      campaign.subjects[0].cases[0].aliases[0].semanticFingerprint = 'carte.semantics.v2';
    },
  ],
  [
    'alias-fingerprint-required',
    (campaign: FixtureCampaign) => {
      delete campaign.subjects[0].cases[0].aliases[0].semanticFingerprint;
    },
  ],
  [
    'alias-fingerprint-required',
    (campaign: FixtureCampaign) => {
      delete campaign.subjects[0].cases[0].equality;
    },
  ],
] as const) {
  const malformed = clone(validCampaign);
  mutate(malformed);
  expectCampaignRejected(malformed, expectedCode, `unequal 011 alias (${expectedCode})`);
}

console.log(
  '✔ 011 campaign coverage rejects non-exact targets, fact-union gaps, unsafe assets, missing Figma nodes, and unequal aliases',
);
