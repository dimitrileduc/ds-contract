/**
 * 030 US1 — the campaign manifest is GENERATED from an existing relevé instead of
 * being hand-written (25–30 KB per section in 029, the first source of lost hours).
 *
 * The adversarial claim this fixture pins: the generator INVERTS a relevé, it never
 * invents. So it asserts three things a plausible-but-wrong generator would fail:
 *   1. every identity it emits (set id/key/name, member ids/keys/names, axes, usage
 *      node ids and position paths) is byte-equal to the hand-written 029 manifest —
 *      the one written by a human from the same source;
 *   2. everything it could NOT read is NAMED in `nonDeductible[]`, and the fields the
 *      retro measured as design choices (authoring gap, witness widths, owner
 *      reference, proof fixtures) are each named there;
 *   3. two runs on the same relevé are byte-identical.
 * Plus the three named refusals of the CLI contract.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  generateRepairCampaign,
  linkedReferencesOf,
} from '../../../extract/figma/projection-repair/manifest-generator.js';
import { validateRepairCampaign } from '../../../extract/figma/projection-repair/campaign.js';

const ROOT = process.cwd();
const RELEVE = 'specs/component-repairs/categories-principales/run-001/audit.json';
const HANDWRITTEN = 'specs/component-repairs/categories-principales/run-001/campaign.json';

const readJson = (relative: string): unknown =>
  JSON.parse(readFileSync(path.resolve(ROOT, relative), 'utf8'));

const releve = readJson(RELEVE);

// The generator names the bounded documents its relevé references; the CALLER reads
// them. That is what keeps the generator a pure function with no filesystem of its own.
const references = linkedReferencesOf(releve);
if (!references.includes('specs/029-figma-responsive-categories/inventory/H1-usages.json')) {
  throw new Error(`linkedReferencesOf did not name the usage inventory: ${references.join(', ')}`);
}
const linked: Record<string, unknown> = {};
for (const reference of references) {
  try { linked[reference] = readJson(reference); } catch { /* a reference that is not on disk is simply not linked */ }
}

const generated = generateRepairCampaign(releve, { sourceReleve: RELEVE }, linked);
if (!generated.ok) throw new Error(`generator refused a valid relevé: ${generated.refusal} — ${generated.message}`);

// ---------------------------------------------------------------- FR-003
// The generated manifest goes back through the EXISTING validation. Generation
// bypasses no refusal.
const validation = validateRepairCampaign(generated.campaign);
if (!validation.ok) {
  throw new Error(`generated campaign refused by validateRepairCampaign: ${validation.issues.map((entry) => `${entry.code}@${entry.path}`).join(', ')}`);
}

// ---------------------------------------------------------------- determinism
const second = generateRepairCampaign(readJson(RELEVE), { sourceReleve: RELEVE }, linked);
if (!second.ok) throw new Error('second generation refused a relevé the first accepted');
if (JSON.stringify(generated.campaign) !== JSON.stringify(second.campaign) ||
  JSON.stringify(generated.report) !== JSON.stringify(second.report)) {
  throw new Error('two generations on the same relevé are not byte-identical');
}

// ---------------------------------------------------------------- provenance
const provenance = generated.campaign.generated;
if (!provenance || provenance.by !== 'manifest-generator' || provenance.sourceReleve !== RELEVE) {
  throw new Error('generated campaign does not carry its provenance');
}
if (provenance.nonDeductible.length === 0) {
  throw new Error('a generator that claims to deduce EVERYTHING from a relevé is lying: nonDeductible is empty');
}
if (JSON.stringify(provenance.nonDeductible) !== JSON.stringify(generated.report.nonDeductible)) {
  throw new Error('the manifest and its report disagree about what could not be deduced');
}
// The four classes the 029 retro measured as design choices, not relevé facts.
for (const named of ['componentSetTopology.authoringLayout.gap', 'contentFixtures', 'reference.decisionRef', 'responsiveWidths']) {
  if (!provenance.nonDeductible.some((entry) => entry.startsWith(named))) {
    throw new Error(`non-deducible field ${named} was silently invented instead of being named`);
  }
}

// ---------------------------------------------------------------- zero invention
// Every identity below was read by a HUMAN from the same relevé in 029. The generator
// must land on exactly the same values, or it is guessing.
const hand = readJson(HANDWRITTEN) as {
  targets: Array<{
    targetId: string; masterNodeId: string; expectedMasterName: string; expectedVariantNames: string[];
    responsive: {
      componentSetTopology: Record<string, unknown> & {
        historicalMember: Record<string, unknown>;
        preservedMembers?: Array<Record<string, unknown>>;
      };
      usageSurfaces: Array<{ surfaceId: string; nodeId: string; positionPath: string; writePolicy: string }>;
    };
  }>;
  filePin: { fileKey: string; versionId: string };
};
const handTarget = hand.targets[0];
const madeTarget = generated.campaign.targets[0];
const handTopology = handTarget.responsive.componentSetTopology;
const madeTopology = madeTarget.responsive!.componentSetTopology;

const same = (label: string, left: unknown, right: unknown): void => {
  if (JSON.stringify(left) !== JSON.stringify(right)) {
    throw new Error(`invention on ${label}: generated ${JSON.stringify(right)} vs hand-written ${JSON.stringify(left)}`);
  }
};

same('filePin.fileKey', hand.filePin.fileKey, generated.campaign.filePin.fileKey);
same('targetId', handTarget.targetId, madeTarget.targetId);
same('masterNodeId', handTarget.masterNodeId, madeTarget.masterNodeId);
same('expectedMasterName', handTarget.expectedMasterName, madeTarget.expectedMasterName);
same('expectedVariantNames', [...handTarget.expectedVariantNames].sort(), [...(madeTarget.expectedVariantNames ?? [])].sort());
same('topology.setNodeId', handTopology.setNodeId, madeTopology.setNodeId);
same('topology.setComponentKey', handTopology.setComponentKey, madeTopology.setComponentKey);
same('topology.setName', handTopology.setName, madeTopology.setName);
same('topology.setIdentityPolicy', handTopology.setIdentityPolicy, madeTopology.setIdentityPolicy);
same('topology.variantProperties', handTopology.variantProperties, madeTopology.variantProperties);
same('topology.defaultVariantSelection', handTopology.defaultVariantSelection, madeTopology.defaultVariantSelection);
same('topology.expectedMemberNames', [...(handTopology.expectedMemberNames as string[])].sort(), [...madeTopology.expectedMemberNames].sort());
same('topology.createdMembers', handTopology.createdMembers, madeTopology.createdMembers);

const identityOf = (member: Record<string, unknown>) => ({
  nodeId: member.nodeId, componentKey: member.componentKey, declaredName: member.declaredName,
  variantSelection: member.variantSelection,
});
same('topology.historicalMember identity', identityOf(handTopology.historicalMember), identityOf(madeTopology.historicalMember as unknown as Record<string, unknown>));
const handPreserved = (handTopology.preservedMembers ?? []).map(identityOf)
  .sort((left, right) => String(left.nodeId).localeCompare(String(right.nodeId)));
const madePreserved = (madeTopology.preservedMembers ?? []).map((member) => identityOf(member as unknown as Record<string, unknown>))
  .sort((left, right) => String(left.nodeId).localeCompare(String(right.nodeId)));
same('topology.preservedMembers identities', handPreserved, madePreserved);

const usageKey = (surface: { nodeId: string; positionPath: string }) => `${surface.nodeId}@${surface.positionPath}`;
same(
  'usageSurfaces (node id + position path)',
  handTarget.responsive.usageSurfaces.map(usageKey).sort(),
  (madeTarget.responsive!.usageSurfaces ?? []).map(usageKey).sort(),
);
if ((madeTarget.responsive!.usageSurfaces ?? []).some((surface) => surface.writePolicy !== 'read-only')) {
  throw new Error('a generated usage surface is not read-only');
}

// ---------------------------------------------------------------- named refusals
const refuses = (
  label: string, refusal: string, releveValue: unknown,
  options: { componentId?: string } = {},
  scope: Record<string, unknown> = linked,
): void => {
  const result = generateRepairCampaign(releveValue, { sourceReleve: RELEVE, ...options }, scope);
  if (result.ok) throw new Error(`${label}: ${refusal} was not refused`);
  if (result.refusal !== refusal) throw new Error(`${label}: expected ${refusal}, got ${result.refusal} — ${result.message}`);
};

refuses('relevé that is not an object', 'releve-unreadable', 'not a relevé');
refuses('relevé with no component-set identity anywhere', 'releve-unreadable', { schemaVersion: '1.0.0' }, {}, {});
refuses('unknown --component', 'component-not-found-in-releve', releve, { componentId: '9999:9999' });

// A relevé carrying SEVERAL component sets is ambiguous, and the generator refuses by
// name rather than picking the biggest one. 029's H1 dump is exactly that shape.
const DUMP = 'specs/029-figma-responsive-categories/proofs/H1-bridge-read-only.json';
const ambiguous = linked[DUMP];
if (ambiguous === undefined) throw new Error('fixture setup: the H1 read-only dump was not linked');

refuses('several component sets without --component', 'component-not-found-in-releve', ambiguous);

// A NAMED LIMIT, and the fixture pins it rather than papering over it: a bridge
// read-only dump inventories nodes but pins no file VERSION, so it cannot be the sole
// relevé of a campaign. The generator says so instead of inventing a pin.
const dumpAlone = generateRepairCampaign(ambiguous, { sourceReleve: DUMP, componentId: madeTarget.masterNodeId }, {});
if (dumpAlone.ok) throw new Error('a dump that pins no Figma version produced a campaign anyway');
if (dumpAlone.refusal !== 'releve-unreadable' || !/version/.test(dumpAlone.message)) {
  throw new Error(`the missing version pin was not named: ${dumpAlone.refusal} — ${dumpAlone.message}`);
}

// Paired with a document that does pin one, the same dump generates the same set —
// which is the real claim: the topology comes from the relevé, not from the file it
// happens to be stored in.
const disambiguated = generateRepairCampaign(
  ambiguous,
  { sourceReleve: DUMP, componentId: madeTarget.masterNodeId, evidenceRoot: 'specs/component-repairs/categories-principales/run-001' },
  { ...linked, [RELEVE]: releve },
);
if (!disambiguated.ok) throw new Error(`--component did not disambiguate a multi-set relevé: ${disambiguated.refusal} — ${disambiguated.message}`);
same('the same set generated from the dump and from the audit', madeTopology.setComponentKey, disambiguated.campaign.targets[0].responsive!.componentSetTopology.setComponentKey);
same('the same members generated from the dump and from the audit', [...madeTopology.expectedMemberNames].sort(), [...disambiguated.campaign.targets[0].responsive!.componentSetTopology.expectedMemberNames].sort());

// Two members carrying the SAME axis pair is perfectly readable and completely
// invalid: the picker cannot address either. The generator does not quietly emit a
// half-manifest — it hands the EXISTING validation's issues back, verbatim, under its
// own named refusal. That is FR-003: generation buys no exemption.
const brokenIdentity = structuredClone(releve) as Record<string, unknown>;
const evidence = Object.values(brokenIdentity).find((value): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && 'identity' in (value as Record<string, unknown>));
if (!evidence) throw new Error('fixture setup: the relevé carrier was not found');
const identity = evidence.identity as { members: Array<Record<string, unknown>> };
identity.members.push({
  ...structuredClone(identity.members[0]),
  id: '9999:1', key: 'z'.repeat(40), name: 'Style=Superpose, Colonnes=2 (doublon)',
});
const invalid = generateRepairCampaign(brokenIdentity, { sourceReleve: RELEVE }, linked);
if (invalid.ok) throw new Error('a set with two members on the same axis pair produced a campaign anyway');
if (invalid.refusal !== 'generated-campaign-invalid') throw new Error(`expected generated-campaign-invalid, got ${invalid.refusal} — ${invalid.message}`);
if (!/target-shape|operation-allowlist/.test(invalid.message)) {
  throw new Error(`generated-campaign-invalid did not quote the validation issues verbatim: ${invalid.message}`);
}

// And a relevé whose members lost their public keys stops being a readable relevé at
// all — a different, earlier refusal, not a silently degraded manifest.
const keyless = structuredClone(releve) as Record<string, unknown>;
const keylessEvidence = Object.values(keyless).find((value): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && 'identity' in (value as Record<string, unknown>))!;
for (const member of (keylessEvidence.identity as { members: Array<Record<string, unknown>> }).members) delete member.key;
const keylessResult = generateRepairCampaign(keyless, { sourceReleve: RELEVE }, {});
if (keylessResult.ok) throw new Error('members with no public key produced a campaign anyway');
if (keylessResult.refusal !== 'releve-unreadable') throw new Error(`expected releve-unreadable, got ${keylessResult.refusal}`);

console.log(`✔ manifest generator: 029 relevé inverted into a campaign the existing validation accepts, byte-identical twice, ${provenance.nonDeductible.length} non-deducible field(s) NAMED, every identity (set, ${madeTopology.expectedMemberNames.length} members, axes, ${(madeTarget.responsive!.usageSurfaces ?? []).length} usages by position) byte-equal to the hand-written 029 manifest, and releve-unreadable / component-not-found-in-releve / generated-campaign-invalid refused by name`);
