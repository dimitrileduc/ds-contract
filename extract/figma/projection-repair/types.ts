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
  | 'shared-child-facts'
  | 'set-identity'
  | 'member-ids-keys'
  | 'axis-names-values'
  | 'card-identity-key'
  | 'card-variant-cardinality'
  | 'layer-names-roles'
  | 'media-text-content'
  | 'usage-instance-links'
  | 'usage-overrides'
  | 'columns-enum-honesty';

export type VariantSelection = Record<string, string>;

export interface ResponsiveComponentMember {
  presentationValue: string;
  declaredName: string;
  sourcePresentationValue?: string;
  /** Exact multi-axis member selection. Legacy 028 declarations omit it and
   * continue to use `presentationValue` against `propertyName`. */
  variantSelection?: VariantSelection;
  /** Stable only when repairing an already-existing set. Additive transitions
   * deliberately omit it because Figma assigns the id at combine time. */
  nodeId?: string;
  /** Existing topology members protect both their node id and public key. */
  componentKey?: string;
  /** Representative authoring width on the component-set canvas. This is not
   * the runtime sizing contract: proof instances still use FILL. */
  authoringPreviewWidth: number;
}

export interface ResponsiveComponentSetTopology {
  propertyName: string;
  setName: string;
  setIdentityPolicy: 'additive' | 'existing';
  setNodeId?: string;
  setComponentKey?: string;
  defaultPresentationValue: string;
  /** Closed axis vocabulary for an existing multi-axis set. */
  variantProperties?: Record<string, string[]>;
  defaultVariantSelection?: VariantSelection;
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
    variantSelection?: VariantSelection;
  };
  /** Existing members other than the historical comparison baseline. They are
   * never reported as creates and retain node ids + keys. */
  preservedMembers?: ResponsiveComponentMember[];
  createdMembers: ResponsiveComponentMember[];
  expectedMemberNames: string[];
}

/** Canonical topology order used by validation, Bridge, facts and receipts. */
export function responsiveTopologyMembers(topology: ResponsiveComponentSetTopology): ResponsiveComponentMember[] {
  return [topology.historicalMember, ...(topology.preservedMembers ?? []), ...topology.createdMembers];
}

export function canonicalVariantSelection(selection: VariantSelection | undefined): string {
  return JSON.stringify(Object.fromEntries(Object.entries(selection ?? {}).sort(([left], [right]) => left.localeCompare(right))));
}

export function memberVariantSelection(
  topology: ResponsiveComponentSetTopology,
  member: Pick<ResponsiveComponentMember, 'presentationValue' | 'variantSelection'>,
): VariantSelection {
  return member.variantSelection ?? { [topology.propertyName]: member.presentationValue };
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
  /** Optional presentation-specific paths for existing variants whose internal
   * structures legitimately differ (for example Superpose vs Empile). */
  textValuesByPresentation?: Record<string, Record<string, string>>;
}

export interface PresentationScenario {
  scenarioId: string;
  presentationValue: string;
  variantSelection?: VariantSelection;
  width: number;
  height: number;
  fixtureId: string;
  expectedOverflow: false;
  /** Optional grid assertion for section-like components. Card-only targets do
   * not declare it because their direct children are internal layers. */
  expectedCardsPerRow?: number;
}

export interface PrimitiveBindingDeclaration {
  presentationValue: string;
  variantSelection?: VariantSelection;
  nodePath: string;
  property: 'itemSpacing' | 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'
    | 'counterAxisSpacing' | 'width' | 'height' | 'minWidth' | 'maxWidth' | 'minHeight' | 'maxHeight';
  variableId: string;
  variableName: string;
  resolvedValue: number;
}

export interface ResponsivePresentationLayout {
  presentationValue: string;
  variantSelection?: VariantSelection;
  nodePath: string;
  properties: Partial<{
    layoutMode: 'HORIZONTAL' | 'VERTICAL';
    layoutWrap: 'NO_WRAP' | 'WRAP';
    layoutSizingHorizontal: 'FILL' | 'HUG' | 'FIXED';
    layoutSizingVertical: 'FILL' | 'HUG' | 'FIXED';
    primaryAxisAlignItems: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
    counterAxisAlignItems: 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
    clipsContent: boolean;
    textAutoResize: 'NONE' | 'HEIGHT';
    /** Closed, removal-only capability: a responsive member may shed a
     * historical width floor, but this vocabulary cannot add one. */
    minWidth: number | null;
  }>;
}

export interface TemporaryTypographyOverride {
  presentationValue: string;
  variantSelection?: VariantSelection;
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

export interface ResponsiveUsageSurface {
  surfaceId: string;
  nodeId: string;
  positionPath: string;
  writePolicy: 'read-only';
}

export interface ExpectedPropagatedDelta {
  surfaceId: string;
  nodeId: string;
  sourceNodeId: string;
  fact: string;
  attribution: string;
}

export interface ResponsiveComponentCapability {
  componentSetTopology: ResponsiveComponentSetTopology;
  expectedCreates: ExpectedNodeCreate[];
  contentFixtures: ResponsiveContentFixture[];
  presentationScenarios: PresentationScenario[];
  presentationLayouts: ResponsivePresentationLayout[];
  primitiveBindings: PrimitiveBindingDeclaration[];
  typographyOverrides: TemporaryTypographyOverride[];
  /** Existing roots/members which the one generic operation may mutate. */
  authorizedTargetNodeIds?: string[];
  /** Read-only usage surfaces addressed by identity and position. */
  usageSurfaces?: ResponsiveUsageSurface[];
  /** Master propagation expected in captures/receipts; never direct writes. */
  expectedPropagatedDeltas?: ExpectedPropagatedDelta[];
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

export interface ComponentRepairArtifactRoots {
  audit: string;
  captures: { before: string; after: string; idempotence: string };
  receipts: string;
  verify: string;
  dryRun: string;
  bridgeScripts: { first: string; second: string };
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
    variantProperties?: Record<string, string[]>;
    memberNames: string[];
    memberIdentities?: Array<{ nodeId: string | null; componentKey: string | null; variantSelection: VariantSelection }>;
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
    usageSurfaceCount?: number;
    propagatedDeltaCount?: number;
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

/** Proof volume, never guarantees. `full` is the historical behaviour and stays
 *  the default: absence of the field means `full`. A run does not silently
 *  change mode — `capture-mode-mismatch` refuses the second spelling. */
/** The closed capture-mode list. Derived from ONE array so the type, the campaign
 *  validator and the CLI flag cannot go out of step — adding a mode is one edit. */
export const CAPTURE_MODES = ['full', 'light'] as const;

export type CaptureMode = (typeof CAPTURE_MODES)[number];

/** Dimensional locks a target surface inherits. Removal-only remains the closed
 *  capability (`ResponsivePresentationLayout.minWidth: null`); this vocabulary
 *  only ever DESCRIBES a lock so preflight can refuse it by name. */
export type InheritedLockProperty =
  | 'minWidth' | 'maxWidth' | 'minHeight' | 'maxHeight' | 'fixedWidth' | 'fixedHeight';

export interface InheritedSizeLock {
  surfaceId: string;
  nodeId: string;
  property: InheritedLockProperty;
  value: number;
  /** Node id the lock is carried by: the surface itself, or an ancestor. */
  inheritedFrom: string;
}

/** An owner-declared exemption. `decisionRef` is mandatory: a waiver without a
 *  decision behind it would be the runner deciding, which it never does. */
export interface InheritedLockWaiver {
  nodeId: string;
  property: InheritedLockProperty;
  value: number;
  reason: string;
  decisionRef: string;
}

export interface PreflightLockReport {
  schemaVersion: '1.0.0';
  campaignId: string;
  targetId: RepairTargetId;
  inspectedAt: string;
  locks: InheritedSizeLock[];
  waived: Array<{ lockRef: string; waiverRef: string }>;
  blocking: string[];
}

/** Provenance of a generated manifest. `nonDeductible` NAMES what the generator
 *  could not read from the relevé — the honesty convention, never an invention. */
export interface GeneratedCampaignProvenance {
  by: 'manifest-generator';
  sourceReleve: string;
  nonDeductible: string[];
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
  artifactRoots?: ComponentRepairArtifactRoots;
  writeBoundary?: ResponsiveWriteBoundary;
  /** Absent means `full`; written by the first capture action that names a mode. */
  captureMode?: CaptureMode;
  lockWaivers?: InheritedLockWaiver[];
  generated?: GeneratedCampaignProvenance;
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

/* ------------------------------------------------------------------------- *
 * 030 — outillage de la vague responsive.
 * Additive vocabulary only. No existing field changes meaning.
 * ------------------------------------------------------------------------- */

/** Why a rendered witness is not always enough: a fact can be STRUCTURAL —
 *  set topology, variant picker, axes, Text Styles — and a render cannot tell an
 *  internal wrap from a Presentation axis, the pixels are identical (029 E2).
 *  A structural fact is witnessed by a capture of the PICKER, never by a render. */
export type DesignFactNature = 'visuel' | 'structurel';

export interface DesignAcceptedFact {
  fact: string;
  nature: DesignFactNature;
  /** 1:1 render for `visuel`; before→after picker capture for `structurel`. */
  witnessRef: string;
}

/** The 029 decision schema, extended. The short `string[]` spelling of
 *  `acceptedFacts` is READ for history and never written from 030 onward. */
export interface DesignDecisionDocument {
  decisionId: string;
  targetId?: RepairTargetId;
  /** One French sentence naming the state of the variant picker after apply. */
  pickerConsequence: string;
  acceptedFacts: Array<DesignAcceptedFact | string>;
}

export const BOARD_ZONE_IDS = [
  'usage',
  'youWillSee',
  'youWillNotGet',
  'pickerBeforeAfter',
  'witnesses',
  'decisions',
  'footer',
] as const;

export type BoardZoneId = (typeof BOARD_ZONE_IDS)[number];

export interface BoardZone {
  zoneId: BoardZoneId;
  /** French heading shown on the canvas. */
  title: string;
  /** Ordered text lines of the zone. Empty only for image-only zones. */
  lines: string[];
  /** Image nodes the zone places, at true size — never a rescaled thumbnail. */
  images: Array<{ ref: string; label: string; width: number; height: number }>;
}

export interface BoardZonesManifest {
  schemaVersion: '1.0.0';
  boardName: string;
  targetId: RepairTargetId;
  zones: Record<BoardZoneId, BoardZone>;
  checks: {
    structuralFactsAllWitnessed: boolean;
    negativeStatementsInFrench: boolean;
    noScaledThumbnails: boolean;
    archiveRef: string;
  };
}
