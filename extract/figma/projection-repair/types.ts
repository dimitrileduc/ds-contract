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

/** Open by design: a v2 component run names its own targets, so this is not
 *  narrowed to `REPAIR_TARGET_IDS` (which covers the legacy 021 campaign only). */
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
  | 'responsive-overflow'
  | 'component-set-topology'
  | 'historical-member-identity'
  | 'component-properties'
  | 'primitive-bindings'
  | 'temporary-typography'
  | 'shared-child-facts';

export interface ResponsiveComponentMember {
  presentationValue: string;
  declaredName: string;
  sourcePresentationValue: string;
  /** Stable only when repairing an already-existing set. Additive transitions
   * deliberately omit it because Figma assigns the id at combine time. */
  nodeId?: string;
  /** Representative authoring width on the component-set canvas. This is not
   * the runtime sizing contract: proof instances still use FILL. */
  authoringPreviewWidth: number;
}

export interface ResponsiveComponentSetTopology {
  propertyName: string;
  setName: string;
  setIdentityPolicy: 'additive' | 'existing';
  setNodeId?: string;
  defaultPresentationValue: string;
  authoringLayout: {
    direction: 'VERTICAL';
    gap: number;
    order: string[];
  };
  historicalMember: {
    presentationValue: string;
    nodeId: string;
    componentKey: string;
    declaredName: string;
    authoringPreviewWidth: number;
  };
  createdMembers: ResponsiveComponentMember[];
  expectedMemberNames: string[];
}

export interface ExpectedNodeCreate {
  role: string;
  operationId: string;
  count: 1;
  declaredName: string;
  presentationValue?: string;
}

export interface ResponsiveContentFixture {
  fixtureId: string;
  /** Structural TEXT path → proof-only characters. Never applied to a Page. */
  textValues: Record<string, string>;
}

export interface PresentationScenario {
  scenarioId: string;
  presentationValue: string;
  width: number;
  height: number;
  fixtureId: string;
  expectedOverflow: false;
}

export interface PrimitiveBindingDeclaration {
  presentationValue: string;
  nodePath: string;
  property: 'itemSpacing' | 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'
    | 'width' | 'height' | 'minWidth' | 'maxWidth' | 'minHeight' | 'maxHeight';
  variableId: string;
  variableName: string;
  resolvedValue: number;
}

export interface ResponsivePresentationLayout {
  presentationValue: string;
  nodePath: string;
  properties: Partial<{
    layoutMode: 'HORIZONTAL' | 'VERTICAL';
    layoutSizingHorizontal: 'FILL' | 'HUG' | 'FIXED';
    layoutSizingVertical: 'FILL' | 'HUG' | 'FIXED';
    primaryAxisAlignItems: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
    counterAxisAlignItems: 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
    clipsContent: boolean;
    textAutoResize: 'NONE' | 'HEIGHT';
  }>;
}

export interface TemporaryTypographyOverride {
  presentationValue: string;
  nodePath: string;
  sourceRole: string;
  sourceTextStyleId: string;
  allowedFields: Array<'fontSize' | 'lineHeight' | 'textAlignHorizontal'>;
  before: Partial<Record<'fontSize' | 'lineHeight' | 'textAlignHorizontal', number | string>>;
  after: Partial<Record<'fontSize' | 'lineHeight' | 'textAlignHorizontal', number | string>>;
  family: string;
  weight: number;
  characters: string;
  debtStatus: 'pending-responsive-text-style';
  ownerDecisionRef: string;
}

export interface ResponsiveComponentCapability {
  componentSetTopology: ResponsiveComponentSetTopology;
  expectedCreates: ExpectedNodeCreate[];
  contentFixtures: ResponsiveContentFixture[];
  presentationScenarios: PresentationScenario[];
  presentationLayouts: ResponsivePresentationLayout[];
  primitiveBindings: PrimitiveBindingDeclaration[];
  typographyOverrides: TemporaryTypographyOverride[];
}

export interface ResponsiveWriteBoundary {
  allowedExistingNodeIds: string[];
  /** Exact first-run mutations. Kept distinct from allowedExistingNodeIds,
   * which may also contain an unchanged host required for safe traversal. */
  expectedChangedNodeIds?: string[];
  readOnlySurfaceNodeIds: string[];
  protectedDependencyNodeIds: string[];
  protectedChildNodeIds: string[];
  protectedChildPaths: string[];
  allowedCreateRoles: string[];
  pageWrites: [];
  childWrites: [];
}

export interface SourceBaseline {
  gitHead: string;
  worktreeTree: string;
  backupRef: string;
  capturedAt: string;
}

export interface ComponentRepairWorkflow {
  mode: 'single-component';
  subjectKind: 'organism' | 'shared-component';
  evidenceRoot: string;
  ownerDecisionRoot: string;
  comparisonPath: string;
  applyReceiptPaths: { first: string; second: string };
  pageMutationPolicy: 'forbid-direct';
  directDependencies: string[];
  sharedDependencies: string[];
  directRepairRefs?: Record<string, string>;
  historicalTextDecisions?: Record<string, string>;
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
    status: 'pass' | 'fail' | 'not-applicable';
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
  responsive?: {
    status: 'not-declared' | 'standalone-before-transition' | 'component-set-observed';
    propertyName: string | null;
    memberNames: string[];
    historicalMemberNodeId: string | null;
    historicalMemberKey: string | null;
    expectedDefaultPresentationValue: string | null;
    observedDefaultPresentationValue: string | null;
    authoringPreviews: Array<{
      presentationValue: string;
      nodeId: string | null;
      expectedWidth: number;
      observedWidth: number | null;
      layoutSizingHorizontal: string | null;
    }>;
    scenarioCount: number;
    primitiveBindingCount: number;
    typographyOverrideCount: number;
    boundaryViolations: string[];
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
  /** Generic standalone→component-set capability. Absence keeps all earlier
   *  v2 campaigns byte-compatible and on their existing execution path. */
  responsive?: ResponsiveComponentCapability;
  ownerDecision?: 'accepted' | 'refused' | null;
}

export interface AffectedSurface {
  surfaceId: string;
  targetId: RepairTargetId;
  role: 'master' | 'variant' | 'page-instance' | 'page-context' | 'preview-instance' | 'hidden-instance' | 'shared-consumer' | 'odoo-qualification';
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
  mechanism: 'generated-amend' | 'ensure-organism-container' | 'set-properties' | 'reorder-children' | 'resize' | 'reposition' | 'property-reference' | 'responsive-component-set';
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
  writeBoundary?: ResponsiveWriteBoundary;
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
