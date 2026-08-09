import * as z from 'zod';
import { EVIDENCE_AVAILABILITY } from './evidence.js';
import { FINAL_VERDICTS, READINESS_SCHEMA_VERSION, READINESS_SECTION_IDS } from './scope.js';

const sectionId = z.enum(READINESS_SECTION_IDS);
const evidence = z.object({
  evidenceId: z.string().min(1),
  kind: z.enum(['visual', 'structure', 'contract', 'render', 'page', 'image', 'decision']),
  pathOrUri: z.string().min(1),
  sha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  capturedAt: z.string().datetime().optional(),
  availability: z.enum(EVIDENCE_AVAILABILITY),
  proves: z.array(z.string()),
  doesNotProve: z.array(z.string()),
  reason: z.string().optional(),
}).strict().superRefine((value, context) => {
  if (value.availability !== 'available' && !value.reason?.trim()) {
    context.addIssue({ code: 'custom', message: 'unavailable evidence must name its reason' });
  }
});

export const HistoricalStateSchema = z.object({
  stateId: z.string().min(1), observedAt: z.string().datetime(), figmaVersionId: z.string().optional(),
  evidence: z.array(evidence).min(1), completeness: z.enum(['complete', 'partial', 'unrecoverable']),
  contradictions: z.array(z.string()), knownChanges: z.array(z.string()).default([]),
}).strict().superRefine((value, context) => {
  const hasAvailableFigmaEvidence = value.evidence.some((item) =>
    item.availability === 'available' && ['visual', 'structure', 'page', 'image'].includes(item.kind),
  );
  if (hasAvailableFigmaEvidence && !value.figmaVersionId?.trim()) {
    context.addIssue({ code: 'custom', path: ['figmaVersionId'], message: 'available Figma evidence requires a pinned Figma version id' });
  }
  if (new Set(value.evidence.map((item) => item.evidenceId)).size !== value.evidence.length) {
    context.addIssue({ code: 'custom', path: ['evidence'], message: 'evidence ids must be unique within a historical state' });
  }
});
export const CandidateSchema = z.object({
  candidateId: z.string().min(1), historicalStateId: z.string().min(1), rank: z.number().int().min(1).max(3),
  recommendation: z.enum(['recommended', 'plausible', 'fallback']), rationale: z.string().min(1),
  supportingEvidenceIds: z.array(z.string()).default([]), missingEvidence: z.array(z.string()).default([]), contradictions: z.array(z.string()).default([]),
});
export const OwnerDecisionSchema = z.object({
  schemaVersion: z.literal(READINESS_SCHEMA_VERSION), decisionId: z.string().min(1), sectionId,
  gate: z.enum(['reference', 'post-repair']),
  decision: z.enum(['reference-validated', 'voluntary-evolution', 'accepted-defect', 'out-of-contract', 'more-evidence-required', 'no-reference-recoverable', 'repair-accepted', 'repair-refused']),
  subjectId: z.string().min(1), rationale: z.string().min(1), decidedBy: z.string().min(1), decidedAt: z.string().datetime(),
  reviewTiming: z.object({ startedAt: z.string().datetime(), completedAt: z.string().datetime(), activeSeconds: z.number().int().min(0), excludedExplorationSeconds: z.number().int().min(0) }),
  acceptedConsequences: z.array(z.string()), receiptRefs: z.array(z.string()),
}).strict();

export const SourceAuditSchema = z.object({
  sectionId, masterNodeId: z.string().min(1), usagePositions: z.array(z.string()).min(1),
  checkedDimensions: z.array(z.enum(['structure', 'constraints', 'properties', 'variable-bindings', 'sizes', 'descriptions'])),
  missingSources: z.array(z.string()), status: z.enum(['clean', 'dirty', 'blocked']), evidenceRefs: z.array(z.string()),
}).superRefine((value, context) => {
  for (const dimension of ['structure', 'constraints', 'properties', 'variable-bindings', 'sizes', 'descriptions']) {
    if (!value.checkedDimensions.includes(dimension as never)) context.addIssue({ code: 'custom', message: `source audit misses ${dimension}` });
  }
  if (/^name:/i.test(value.masterNodeId.trim()) || value.usagePositions.some((position) => /^name:/i.test(position.trim()))) {
    context.addIssue({ code: 'custom', message: 'source identities must use position/node ids, never layer names' });
  }
  if (new Set(value.usagePositions).size !== value.usagePositions.length) context.addIssue({ code: 'custom', message: 'usage positions must be unique' });
  if (value.evidenceRefs.length === 0) context.addIssue({ code: 'custom', message: 'source audit requires evidence receipts' });
  if (value.status === 'clean' && value.missingSources.length > 0) context.addIssue({ code: 'custom', message: 'a clean source audit cannot name missing sources' });
});

export const ReadinessDossierSchema = z.object({
  schemaVersion: z.literal(READINESS_SCHEMA_VERSION), sectionId, sourceAudit: SourceAuditSchema,
  currentPins: z.record(z.string(), z.unknown()).refine((value) => Object.keys(value).length >= 3, 'current pins must cover Figma, contract, and render'),
  timeline: z.object({ probableBreakStateId: z.string().nullable(), reasons: z.array(z.string()).min(1) }).strict(),
  historicalStates: z.array(HistoricalStateSchema), candidates: z.array(CandidateSchema).max(3), ownerDecisionRefs: z.array(z.string()),
  findings: z.array(z.unknown()), impactGraph: z.object({ nodes: z.array(z.unknown()), edges: z.array(z.unknown()), completeness: z.enum(['complete', 'partial']), missingSources: z.array(z.string()).default([]) }),
  status: z.enum(['inventory', 'source-audited', 'history-ready', 'blocked-history', 'awaiting-owner', 'diagnosed', 'awaiting-final-gate', 'closed']),
  finalVerdict: z.enum(FINAL_VERDICTS).optional(), destination: z.string().optional(), repairAssignment: z.unknown().optional(),
}).strict();

export const CampaignSchema = z.object({
  schemaVersion: z.literal(READINESS_SCHEMA_VERSION), campaignId: z.string().min(1), consultedDocs: z.array(z.string()),
  expectedSections: z.array(sectionId).length(11), sections: z.array(z.object({
    sectionId, displayName: z.string().min(1), contractPath: z.string().min(1), masterNodeId: z.string().min(1), usagePositions: z.array(z.string()).min(1),
    sourceAuditPath: z.string().min(1).optional(),
    current: z.object({ figmaVersionId: z.string().min(1), renderRef: z.string().min(1) }),
    historicalEvidence: z.array(HistoricalStateSchema).default([]),
  }).strict()).length(11),
  ownerDecisionRegistry: z.string().min(1), odoo019InputLock: z.string().min(1),
}).strict();

export const ConsolidatedReadinessSchema = z.object({
  schemaVersion: z.literal(READINESS_SCHEMA_VERSION), campaignId: z.string().min(1), expectedSections: z.array(sectionId).length(11), dossiers: z.array(z.string()).length(11),
  dependencySummary: z.array(z.unknown()), ownerDecisionSummary: z.array(z.unknown()), repairSpecs: z.array(z.string()), odoo019Repins: z.array(z.unknown()),
  qualityMetrics: z.object({ ownerPacketReviews: z.array(z.object({ sectionId, activeSeconds: z.number().int().min(0), excludedExplorationSeconds: z.number().int().min(0), withinTarget: z.boolean() })).length(11),
    firstPassRepairAcceptance: z.object({ acceptedFirstPass: z.number().int().min(0), presentedRepairs: z.number().int().min(0), rate: z.number().min(0).max(1).nullable(), status: z.enum(['passed', 'failed', 'not-applicable']) }), }),
}).strict();

export type HistoricalState = z.infer<typeof HistoricalStateSchema>;
export type ReferenceCandidate = z.infer<typeof CandidateSchema>;
export type OwnerDecision = z.infer<typeof OwnerDecisionSchema>;
export type SourceAudit = z.infer<typeof SourceAuditSchema>;
export type SectionReadinessDossier = z.infer<typeof ReadinessDossierSchema>;
export type ReadinessCampaign = z.infer<typeof CampaignSchema>;
