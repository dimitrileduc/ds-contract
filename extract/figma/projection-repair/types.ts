/**
 * Données versionnées des campagnes de réparation Figma.
 *
 * `1.0.0` reste le format historique fermé de la campagne 021. `2.0.0` est
 * l'enveloppe réutilisable mono-composant : chemins de preuves, fichier cible
 * et protections y sont déclarés par le manifeste plutôt que codés dans le
 * runner. Aucun accès Figma ne vit ici.
 */

export const REPAIR_CAMPAIGN_ID = '021-figma-projection-repair' as const;
export const REPAIR_SCHEMA_VERSION = '1.0.0' as const;
export const COMPONENT_REPAIR_SCHEMA_VERSION = '2.0.0' as const;
export const REPAIR_TARGET_IDS = [
  'hero',
  'sav',
  'categories-principales',
  'realisations',
  'produits-e-commerce',
  'coordonnees',
  'formulaire',
] as const;

export type LegacyRepairTargetId = (typeof REPAIR_TARGET_IDS)[number];
export type RepairTargetId = string;
export type CampaignState =
  | 'draft' | 'preflight-valid' | 'captured' | 'ready-to-apply' | 'applied' | 'verified'
  | 'owner-accepted' | 'owner-refused' | 'refused-before-mutation' | 'application-failed' | 'verification-failed';
export type ImpactStatus = 'pending' | 'unchanged' | 'revalidated' | 'refused' | 'not-applicable';
export type CapturePhase = 'before' | 'after' | 'idempotence';

export const REQUIRED_COMPONENT_PROTECTION_FACTS = [
  'master-identity',
  'variant-cardinality',
  'variant-names',
  'image-paints',
  'gradient-paints',
  'text-content',
  'text-ranges',
  'text-styles',
  'instance-links',
  'instance-overrides',
  'page-node-identity',
] as const;

export type ProtectedFact =
  | (typeof REQUIRED_COMPONENT_PROTECTION_FACTS)[number]
  | 'video-paints'
  | 'geometry'
  | 'responsive-overflow';

export interface SourceBaseline {
  gitHead: string;
  worktreeTree: string;
  backupRef: string;
  capturedAt: string;
}

export interface ComponentRepairWorkflow {
  mode: 'single-component';
  subjectKind: 'organism';
  evidenceRoot: string;
  ownerDecisionRoot: string;
  comparisonPath: string;
  applyReceiptPaths: { first: string; second: string };
  pageMutationPolicy: 'forbid-direct';
  directDependencies: string[];
  sharedDependencies: string[];
  directRepairRefs?: Record<string, string>;
}

export type ComponentAuditVerdict = 'green' | 'proposal' | 'blocked';
export type TextAuditClassification = 'named-exact' | 'rich-ranges' | 'historical-custom' | 'defect';

export interface ComponentAuditReport {
  schemaVersion: '1.0.0';
  campaignId: string;
  targetId: string;
  inspectedAt: string;
  fileVersionId: string;
  verdict: ComponentAuditVerdict;
  figmaWrites: [];
  container: {
    status: 'pass' | 'fail';
    masterNodeId: string;
    parentNodeId: string | null;
    parentName: string | null;
    parentType: string | null;
    parentLayoutMode: string | null;
    masterLayoutSizingHorizontal: string | null;
    referenceWidth: number | null;
    responsiveWidths: number[];
    issues: string[];
  };
  texts: Array<{
    nodeId: string;
    structuralPath: string;
    name: string;
    characters: string;
    classification: TextAuditClassification;
    textStyleId: string | null;
    textStyleName: string | null;
    reasons: string[];
  }>;
  dependencies: {
    declared: string[];
    observed: string[];
    undeclared: string[];
  };
  findings: Array<{ code: string; severity: 'proposal' | 'blocked'; message: string }>;
  proposedChanges: string[];
}

export interface ValidatedReference {
  referenceId: string;
  sourceKind: 'historical-version' | 'current-owner-approved' | 'contract-and-history';
  figmaVersionId?: string | null;
  subjectNodeId: string;
  visualFacts: string[];
  decisionRef: string;
  renderRef?: string;
}

export interface RepairTarget {
  targetId: RepairTargetId;
  kind: 'generated-master' | 'direct-canvas' | 'shared-control' | 'composed-properties';
  masterNodeId: string;
  variantNodeIds?: string[];
  reference: ValidatedReference;
  affectedSurfaceIds: string[];
  projectionDefectIds: string[];
  allowedFields: string[];
  protectedFacts: string[];
  /** Facts allowed to move intentionally; every other required fact is a hard
   *  before/after gate in schema v2. */
  allowedFactChanges?: ProtectedFact[];
  /** Display name is used only to refuse duplicate masters. Identity remains
   *  the pinned node id/key. */
  expectedMasterName?: string;
  expectedVariantNames?: string[];
  /** Reduced desktop widths exercised on an isolated instance after apply. */
  responsiveWidths?: number[];
  ownerDecision?: 'accepted' | 'refused' | null;
}

export interface AffectedSurface {
  surfaceId: string;
  targetId: RepairTargetId;
  role: 'master' | 'variant' | 'page-instance' | 'page-context' | 'preview-instance' | 'shared-consumer' | 'odoo-qualification';
  nodeId: string | null;
  pageComposition: string | null;
  structuralPath: string | null;
  contextForSurfaceId?: string | null;
  expectedSize: { width: number; height: number };
  impactStatus: ImpactStatus;
}

export interface EvidenceArtifact {
  artifactId: string;
  surfaceId: string;
  kind: 'png' | 'structure' | 'properties' | 'facts' | 'diff' | 'report';
  path: string;
  sha256: string;
  width: number | null;
  height: number | null;
  byteLength: number;
  status: 'valid' | 'missing' | 'empty' | 'wrong-size' | 'unreadable';
}

export interface ImageFingerprint {
  hostId: string;
  structuralPath: string;
  paintIndex: number;
  imageHash: string;
  scaleMode: 'FILL' | 'FIT' | 'CROP' | 'TILE' | 'STRETCH';
  imageTransformHash?: string | null;
}

export interface InstanceLink {
  instanceNodeId: string;
  masterNodeId: string;
  structuralPath: string;
  overrideDigest: string;
}

export interface CaptureSet {
  captureSetId: string;
  phase: CapturePhase;
  fileVersionId: string;
  artifacts: EvidenceArtifact[];
  imageFingerprints: ImageFingerprint[];
  instanceLinks: InstanceLink[];
  complete: boolean;
}

export interface ProjectionDefect {
  defectId: string;
  class: 'absolute-lowering' | 'composed-prop-forwarding' | 'icon-instance-swap' | 'direct-geometry';
  sourcePaths: string[];
  affectedTargetIds: RepairTargetId[];
  negativeFixture: string;
  registeredEvalId: string;
  resolutionStatus: 'open' | 'headless-fixed' | 'live-verified' | 'refused';
}

export interface ConsumerImpact {
  consumerId: string;
  dependencyId: string;
  usage: 'contract' | 'figma' | 'odoo';
  evidenceRefs: string[];
  status: Exclude<ImpactStatus, 'not-applicable'>;
  decisionRef?: string | null;
}

export interface RepairOperation {
  operationId: string;
  targetId: RepairTargetId;
  mechanism: 'generated-amend' | 'ensure-organism-container' | 'set-properties' | 'resize' | 'reposition' | 'property-reference';
  nodeId: string;
  structuralPath?: string | null;
  preconditions: Record<string, unknown>[];
  changes: Record<string, unknown>;
  expectedPostconditions: Record<string, unknown>[];
}

export interface RepairCampaign {
  schemaVersion: typeof REPAIR_SCHEMA_VERSION | typeof COMPONENT_REPAIR_SCHEMA_VERSION;
  campaignId: string;
  filePin: { fileKey: string; versionId: string; fileName?: string; capturedAt: string };
  authorityRefs: string[];
  targets: RepairTarget[];
  affectedSurfaces: AffectedSurface[];
  consumerImpacts: ConsumerImpact[];
  allowedOperations: RepairOperation[];
  captureSets: { before: CaptureSet; after?: CaptureSet; idempotence?: CaptureSet };
  state: CampaignState;
  createdAt: string;
  sourceBaseline?: SourceBaseline;
  workflow?: ComponentRepairWorkflow;
}

export interface DiffFinding {
  surfaceId: string;
  kind: 'expected' | 'unexpected' | 'none';
  description: string;
  diffCount: number;
  evidenceRef: string;
  diffBox?: { x: number; y: number; width: number; height: number } | null;
}

export interface RepairReceipt {
  schemaVersion: typeof REPAIR_SCHEMA_VERSION | typeof COMPONENT_REPAIR_SCHEMA_VERSION;
  receiptId: string;
  campaignId: string;
  targetId: RepairTargetId;
  referenceId: string;
  appliedOperationIds: string[];
  expectedDiffs: DiffFinding[];
  unexpectedDiffs: DiffFinding[];
  imagePreservation: 'pass' | 'fail' | 'not-applicable';
  instancePreservation: 'pass' | 'fail';
  consumerVerdicts: Array<ConsumerImpact & { status: 'unchanged' | 'revalidated' | 'refused' }>;
  idempotence: 'pass' | 'fail';
  ownerDecision: 'accepted' | 'refused';
  ownerRationale: string;
  evidenceRefs: string[];
  limits?: string[];
  decidedAt: string;
}
