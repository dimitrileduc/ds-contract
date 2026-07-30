/**
 * Adversarial contract for the ADDITIVE `scope` field of Visual Campaign v1.
 *
 * 013 audits twelve organisms with the mature 011 comparison machinery, but a
 * pinned proof cannot be rewritten after the fact: adding the organisms to the
 * `REQUIRED_CAMPAIGN_SUBJECT_IDS` enum would retroactively change what an
 * already-retained 011 result claimed.  The evolution is therefore additive
 * (constitution §VI): an optional `scope` declares the exact subject set and
 * its explicit contract mapping.
 *
 *   scope ABSENT  -> 011 behaviour is strictly unchanged: the seven historical
 *                    molecules, exactly.
 *   scope PRESENT -> the declared set is required, in the declared order, with
 *                    an explicit contract id per subject.  A missing,
 *                    surnumerary, reordered or duplicated subject is refused
 *                    BY NAME — the issue message names the offending id, so a
 *                    scope error is never an anonymous "subjects mismatch".
 *
 * Data-only: no Chromium, no Figma fetch, no filesystem write.
 */
import {
  REQUIRED_CAMPAIGN_SUBJECT_IDS,
  VISUAL_CAMPAIGN_SCHEMA_VERSION,
  validateVisualCampaign,
  type CampaignValidationIssue,
} from "../../extract/figma/visual-parity/campaign.js";

/** The seven molecules 011 proved.  This list is a receipt, not a variable. */
const HISTORICAL_SUBJECT_IDS = [
  "carte",
  "field",
  "member-card",
  "nav-item",
  "product-card",
  "realisation",
  "tab",
] as const;

/** The twelve organisms 013 audits, in wave order (data-model §3). */
const ORGANISM_SUBJECT_IDS = [
  "coordonnees",
  "devis",
  "hero",
  "presentation",
  "sav",
  "texte-seo",
  "faq",
  "footer",
  "reassurances",
  "equipe",
  "formulaire",
  "header",
] as const;

/** Live `anchors.figma.nodeId` of each organism contract (data-model §3). */
const ORGANISM_SET_NODE_IDS: Record<string, string> = {
  coordonnees: "2104:2904",
  devis: "2096:2524",
  hero: "2111:3382",
  presentation: "2103:2824",
  sav: "2108:3105",
  "texte-seo": "2108:3123",
  faq: "2104:2914",
  footer: "2120:4785",
  reassurances: "2114:3721",
  equipe: "2115:3947",
  formulaire: "2096:2564",
  header: "84:285",
};

const FILE_KEY = "d9FYAUcqdcNtsuaMgLefvJ";
const FILE_VERSION_011 = "2381229993207753432";
const FILE_VERSION_013 = "2381581871281042338";
const ASSETS_MANIFEST =
  "extract/figma/visual-parity/fixture-assets/manifest.json";
const ASSET_MANIFEST = { schemaVersion: 1, assets: [] as Array<{ id: string }> };

type FixtureCase = { id: string; figmaNodeId: string; factIds: string[] };

type FixtureSubject = {
  id: string;
  contractId: string;
  contractVersion: string;
  figmaSetNodeId: string;
  auditRefs: string[];
  cases: FixtureCase[];
};

type FixtureScope = {
  expectedSubjectIds: string[];
  contractIdsBySubject: Record<string, string>;
};

type FixtureCampaign = {
  schemaVersion: unknown;
  id: string;
  reference: { fileKey: string; fileVersion: string; readOnly?: boolean };
  assetsManifest: string;
  scope?: FixtureScope;
  subjects: FixtureSubject[];
};

const clone = <T>(value: T): T => structuredClone(value);

function subjectEntry(
  id: string,
  contractId: string,
  figmaSetNodeId: string,
): FixtureSubject {
  return {
    id,
    contractId,
    contractVersion: "1.0.0",
    figmaSetNodeId,
    auditRefs: ["specs/fixture/audit.md"],
    cases: [
      { id: `${id}-default`, figmaNodeId: figmaSetNodeId, factIds: [`${id}.default`] },
    ],
  };
}

function renderIssues(issues: CampaignValidationIssue[]): string {
  return issues.map((entry) => `${entry.code}@${entry.path}`).join(", ");
}

function expectAccepted(candidate: unknown, label: string): void {
  const result = validateVisualCampaign(candidate, {
    assetManifest: ASSET_MANIFEST,
  });
  if (!result.ok) {
    throw new Error(`${label} must be accepted: ${renderIssues(result.issues)}`);
  }
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

/**
 * A scope violation must be refused BY NAME.  `names` holds the acceptable
 * ways to name the offence: a single id where only one subject can be at
 * fault, and both sides of a swap where an order violation may legitimately be
 * reported from the expected or the observed side.
 */
function expectRejectedNaming(
  candidate: unknown,
  code: CampaignValidationIssue["code"],
  names: readonly string[],
  label: string,
): void {
  const result = validateVisualCampaign(candidate, {
    assetManifest: ASSET_MANIFEST,
  });
  if (result.ok) throw new Error(`${label} must be rejected as ${code}; got accepted`);
  const matching = result.issues.filter((entry) => entry.code === code);
  if (matching.length === 0) {
    throw new Error(
      `${label} must be rejected as ${code}; got ${renderIssues(result.issues)}`,
    );
  }
  const named = matching.some((entry) =>
    names.some((name) => entry.message.includes(name)),
  );
  if (!named) {
    throw new Error(
      `${label} must be refused BY NAME: no ${code} issue names ${names.join(" or ")} — got "${matching.map((entry) => entry.message).join('" | "')}"`,
    );
  }
}

// ---------------------------------------------------------------------------
// 1. The 011 enum is itself a pinned proof surface.
// ---------------------------------------------------------------------------
// Adding the organisms here (instead of declaring them through `scope`) would
// silently widen every historical 011 receipt.  The enum must still be the
// seven molecules, in their historical order.
if (
  REQUIRED_CAMPAIGN_SUBJECT_IDS.length !== HISTORICAL_SUBJECT_IDS.length ||
  REQUIRED_CAMPAIGN_SUBJECT_IDS.some((id, index) => id !== HISTORICAL_SUBJECT_IDS[index])
) {
  throw new Error(
    `REQUIRED_CAMPAIGN_SUBJECT_IDS must stay the seven historical molecules in order; got ${REQUIRED_CAMPAIGN_SUBJECT_IDS.join(", ")}`,
  );
}
if (VISUAL_CAMPAIGN_SCHEMA_VERSION !== 1) {
  throw new Error(
    `an additive scope field must not bump the campaign schema version; got ${String(VISUAL_CAMPAIGN_SCHEMA_VERSION)}`,
  );
}

// ---------------------------------------------------------------------------
// 2. scope ABSENT — 011 keeps its exact meaning.
// ---------------------------------------------------------------------------
const legacyCampaign: FixtureCampaign = {
  schemaVersion: VISUAL_CAMPAIGN_SCHEMA_VERSION,
  id: "011-fix-molecule-convergence",
  reference: {
    fileKey: FILE_KEY,
    fileVersion: FILE_VERSION_011,
    readOnly: true,
  },
  assetsManifest: ASSETS_MANIFEST,
  subjects: HISTORICAL_SUBJECT_IDS.map((id) =>
    subjectEntry(id, `ds.${id}`, "2063:1622"),
  ),
};

expectAccepted(legacyCampaign, "the historical seven-subject 011 campaign");

// The seven remain closed without a scope: no organism may enter by the back
// door, and none of the seven may drop out.
for (const mutate of [
  (campaign: FixtureCampaign) => campaign.subjects.pop(),
  (campaign: FixtureCampaign) =>
    campaign.subjects.push(subjectEntry("hero", "ds.hero", ORGANISM_SET_NODE_IDS.hero)),
  (campaign: FixtureCampaign) => {
    campaign.subjects[3] = subjectEntry("header", "ds.header", ORGANISM_SET_NODE_IDS.header);
  },
  (campaign: FixtureCampaign) => {
    campaign.subjects[1] = clone(campaign.subjects[0]);
    campaign.subjects[1].cases[0].id = "carte-duplicate";
  },
]) {
  const malformed = clone(legacyCampaign);
  mutate(malformed);
  expectRejected(
    malformed,
    "subject-id",
    "a scope-less campaign that is not exactly the seven molecules",
  );
}

// ---------------------------------------------------------------------------
// 3. scope PRESENT — the declared set is the requirement.
// ---------------------------------------------------------------------------
const scopedOrganismCampaign: FixtureCampaign = {
  schemaVersion: VISUAL_CAMPAIGN_SCHEMA_VERSION,
  id: "013-auditer-fidelite-organismes",
  reference: {
    fileKey: FILE_KEY,
    fileVersion: FILE_VERSION_013,
    readOnly: true,
  },
  assetsManifest: ASSETS_MANIFEST,
  scope: {
    expectedSubjectIds: [...ORGANISM_SUBJECT_IDS],
    contractIdsBySubject: Object.fromEntries(
      ORGANISM_SUBJECT_IDS.map((id) => [id, `ds.${id}`]),
    ),
  },
  subjects: ORGANISM_SUBJECT_IDS.map((id) =>
    subjectEntry(id, `ds.${id}`, ORGANISM_SET_NODE_IDS[id]),
  ),
};

expectAccepted(
  scopedOrganismCampaign,
  "a scoped campaign declaring the twelve organisms",
);

// An identity scope must be a no-op: declaring the seven historical molecules
// explicitly cannot change what the 011 campaign means.
const identityScoped = clone(legacyCampaign);
identityScoped.scope = {
  expectedSubjectIds: [...HISTORICAL_SUBJECT_IDS],
  contractIdsBySubject: Object.fromEntries(
    HISTORICAL_SUBJECT_IDS.map((id) => [id, `ds.${id}`]),
  ),
};
expectAccepted(identityScoped, "an identity scope over the seven molecules");

// A missing target is not a smaller campaign, it is an incomplete one.
const missingSubject = clone(scopedOrganismCampaign);
missingSubject.subjects = missingSubject.subjects.filter(
  (subject) => subject.id !== "header",
);
expectRejectedNaming(
  missingSubject,
  "subject-id",
  ["header"],
  "a scoped campaign missing a declared subject",
);

// A surnumerary target cannot slip into the aggregate verdict.
const extraSubject = clone(scopedOrganismCampaign);
extraSubject.subjects.push(subjectEntry("nav-item", "ds.nav-item", "2152:5554"));
expectRejectedNaming(
  extraSubject,
  "subject-id",
  ["nav-item"],
  "a scoped campaign declaring an undeclared subject",
);

// Order is part of the declaration: waves and reports read this array
// positionally, so a reorder is a scope error, not a cosmetic difference.
const reorderedSubjects = clone(scopedOrganismCampaign);
[reorderedSubjects.subjects[1], reorderedSubjects.subjects[2]] = [
  reorderedSubjects.subjects[2],
  reorderedSubjects.subjects[1],
];
expectRejectedNaming(
  reorderedSubjects,
  "subject-id",
  ["devis", "hero"],
  "a scoped campaign whose subjects are reordered",
);

// A duplicate is never a substitute for the target it displaces.
const duplicatedSubject = clone(scopedOrganismCampaign);
const duplicate = clone(duplicatedSubject.subjects[2]);
duplicate.cases[0].id = "hero-duplicate";
duplicatedSubject.subjects[4] = duplicate;
expectRejectedNaming(
  duplicatedSubject,
  "subject-id",
  ["hero", "sav"],
  "a scoped campaign duplicating a subject over another",
);

// ---------------------------------------------------------------------------
// 4. scope PRESENT — the contract mapping is explicit, never derived.
// ---------------------------------------------------------------------------
// Without a scope, 011 derives `ds.<id>`.  A scope supersedes that derivation
// with a declared mapping, which is what lets an audit name subjects whose id
// is not the tail of their contract id.
const explicitMapping: FixtureCampaign = {
  schemaVersion: VISUAL_CAMPAIGN_SCHEMA_VERSION,
  id: "013-explicit-mapping",
  reference: {
    fileKey: FILE_KEY,
    fileVersion: FILE_VERSION_013,
    readOnly: true,
  },
  assetsManifest: ASSETS_MANIFEST,
  scope: {
    expectedSubjectIds: ["entete", "pied"],
    contractIdsBySubject: { entete: "ds.header", pied: "ds.footer" },
  },
  subjects: [
    subjectEntry("entete", "ds.header", ORGANISM_SET_NODE_IDS.header),
    subjectEntry("pied", "ds.footer", ORGANISM_SET_NODE_IDS.footer),
  ],
};
expectAccepted(
  explicitMapping,
  "a scoped campaign whose contract ids are not derivable from its subject ids",
);

// The declared mapping is binding: a subject cannot claim another contract.
const mappingMismatch = clone(explicitMapping);
mappingMismatch.subjects[0].contractId = "ds.entete";
expectRejected(
  mappingMismatch,
  "subject-contract",
  "a scoped subject contradicting its declared contract mapping",
);

// Every declared subject needs its mapping; an implicit `ds.<id>` fallback
// would reintroduce the derivation the scope exists to replace.
const mappingIncomplete = clone(explicitMapping);
delete mappingIncomplete.scope!.contractIdsBySubject.pied;
expectRejected(
  mappingIncomplete,
  "subject-contract",
  "a scope leaving a declared subject unmapped",
);

console.log(
  "✔ visual campaign v1 keeps its exact seven-molecule meaning without `scope`, and with `scope` requires the declared subject set in order with an explicit contract mapping — missing, surnumerary, reordered and duplicated subjects refused by name",
);
