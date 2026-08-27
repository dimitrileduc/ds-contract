/**
 * Campaign manifest generator — the inverse of `facts.ts`.
 *
 * 029 measured the hand-written manifest as the first source of lost hours: 25–30 KB
 * per section, every member id, key, axis pair and usage position typed by a human
 * from a relevé the runner had already produced. This module reads that relevé back.
 *
 * Two properties make it safe to trust:
 *
 *   - it is PURE. A relevé (and the documents that relevé references, handed in by the
 *     caller) goes in; a campaign object and a report come out. No filesystem, no
 *     network, no clock — `createdAt` and the file pin are read from the relevé, so two
 *     runs on the same input are byte-identical.
 *   - it NEVER invents. Every value it emits is either read from the relevé, or a
 *     conservative skeleton NAMED in `nonDeductible[]`. A field that is a design
 *     decision — the authoring gap, the witness widths, the owner reference, the proof
 *     fixtures — is emitted at its most conservative value and named, never guessed at
 *     a plausible number. That is the repository's honesty convention applied to
 *     generation: degradation is named, never silent.
 *
 * The generated manifest is then handed back to `validateRepairCampaign`. Generation
 * bypasses no existing refusal (FR-003): a generated manifest that does not validate is
 * refused by name, with the validation issues quoted verbatim.
 */
import { isObject } from './json.js';
import { isBoundedPath, SLUG_PATTERN, validateRepairCampaign } from './campaign.js';
import { COMPONENT_REPAIR_SCHEMA_VERSION, REQUIRED_COMPONENT_PROTECTION_FACTS } from './types.js';
import type {
  AffectedSurface, RepairCampaign, ResponsiveComponentMember, ResponsiveUsageSurface, VariantSelection,
} from './types.js';

type Json = Record<string, unknown>;
const record = isObject as (value: unknown) => value is Json;

export type ManifestRefusal =
  | 'releve-unreadable'
  | 'component-not-found-in-releve'
  | 'generated-campaign-invalid';

export interface ManifestGeneratorOptions {
  /** Bounded repository path of the relevé; recorded in `generated.sourceReleve`. */
  sourceReleve: string;
  /** Node id of the component set to generate for. Required only when the relevé
   *  carries more than one — the generator refuses to pick for you. */
  componentId?: string;
  /** Run directory. Defaults to the directory the relevé itself lives in. */
  evidenceRoot?: string;
}

export interface ManifestGeneratorReport {
  schemaVersion: '1.0.0';
  sourceReleve: string;
  targetId: string;
  setNodeId: string;
  memberCount: number;
  usageCount: number;
  /** What the generator could not read, named field by field. Never empty: a
   *  generator that claimed to deduce a whole campaign from a relevé would be lying. */
  nonDeductible: string[];
}

export type ManifestGeneratorResult =
  | { ok: true; campaign: RepairCampaign; report: ManifestGeneratorReport }
  | { ok: false; refusal: ManifestRefusal; message: string };

/** A linked reference: a bounded path — by the campaign validator's OWN predicate, so
 *  the generator cannot call bounded a path the gate then refuses — that names a JSON
 *  document. */
const boundedJsonPath = (value: unknown): value is string =>
  isBoundedPath(value) && value.endsWith('.json') && value.length > 5;

/**
 * The bounded documents a relevé points at, by their `*Ref` fields. The generator
 * NAMES them; the caller reads them. That split is what keeps this module pure while
 * still letting an audit report reach the usage inventory it references.
 */
export function linkedReferencesOf(releve: unknown): string[] {
  const found = new Set<string>();
  const visit = (value: unknown, depth: number): void => {
    if (depth > 3 || !record(value)) return;
    for (const [key, entry] of Object.entries(value)) {
      // A fragment (`file.json#/a/b`) still names one document.
      const candidate = typeof entry === 'string' ? entry.split('#')[0] : entry;
      if (key.endsWith('Ref') && boundedJsonPath(candidate)) found.add(candidate);
      else visit(entry, depth + 1);
    }
  };
  visit(releve, 0);
  return [...found].sort();
}

/** Every object worth reading a fact from: a document and one level inside it.
 *  Deterministic order — the caller passes documents in a sorted order. */
function carriersOf(...documents: unknown[]): Json[] {
  const carriers: Json[] = [];
  for (const document of documents) {
    if (!record(document)) continue;
    carriers.push(document);
    for (const entry of Object.values(document)) if (record(entry)) carriers.push(entry);
  }
  return carriers;
}

interface IdentityRecord {
  id: string;
  key: string;
  name: string;
  bounds: { width: number; height: number };
  axes: Record<string, { values: string[]; defaultValue: string | null }>;
  members: Array<{ id: string; key: string; name: string; selection: VariantSelection; width: number; height: number }>;
}

const positiveBounds = (value: unknown): { width: number; height: number } | null => {
  if (!record(value)) return null;
  const { width, height } = value;
  return typeof width === 'number' && width > 0 && typeof height === 'number' && height > 0 ? { width, height } : null;
};

function readIdentity(value: unknown): IdentityRecord | null {
  if (!record(value) || value.type !== 'COMPONENT_SET' || typeof value.id !== 'string' ||
    typeof value.key !== 'string' || typeof value.name !== 'string' || !Array.isArray(value.members)) return null;
  const bounds = positiveBounds(value.bounds);
  if (!bounds) return null;
  const definitions = record(value.componentPropertyDefinitions) ? value.componentPropertyDefinitions : {};
  const axes: IdentityRecord['axes'] = {};
  // Declaration order, not alphabetical: it is the order the picker shows and the
  // order 029's member names were written in.
  for (const [axis, definition] of Object.entries(definitions)) {
    if (!record(definition) || definition.type !== 'VARIANT' || !Array.isArray(definition.variantOptions)) continue;
    const values = definition.variantOptions.filter((option): option is string => typeof option === 'string');
    if (values.length === 0) continue;
    axes[axis] = { values, defaultValue: typeof definition.defaultValue === 'string' ? definition.defaultValue : null };
  }
  const members: IdentityRecord['members'] = [];
  for (const member of value.members) {
    if (!record(member) || typeof member.id !== 'string' || typeof member.key !== 'string' || typeof member.name !== 'string') return null;
    const memberBounds = positiveBounds(member.bounds);
    if (!memberBounds) return null;
    const selection: VariantSelection = {};
    const observed = record(member.variantProperties) ? member.variantProperties : {};
    for (const axis of Object.keys(axes)) {
      const selected = observed[axis];
      if (typeof selected !== 'string') return null;
      selection[axis] = selected;
    }
    members.push({ id: member.id, key: member.key, name: member.name, selection, width: memberBounds.width, height: memberBounds.height });
  }
  return members.length > 0 && Object.keys(axes).length > 0
    ? { id: value.id, key: value.key, name: value.name, bounds, axes, members }
    : null;
}

interface UsageRecord {
  instanceNodeId: string;
  positionPath: string;
  pageName: string | null;
  mainComponentId: string | null;
  bounds: { width: number; height: number };
  host: { id: string; bounds: { width: number; height: number } } | null;
}

function readUsage(value: unknown): UsageRecord | null {
  if (!record(value) || typeof value.instanceNodeId !== 'string' || !Array.isArray(value.position)) return null;
  const bounds = positiveBounds(value.bounds);
  if (!bounds) return null;
  const chain = value.position
    .map((entry) => (record(entry) && typeof entry.id === 'string' ? entry.id : null))
    .filter((id): id is string => id !== null);
  if (chain.length === 0) return null;
  // The relevé lists the position leaf-first; the address reads root-first, exactly
  // as 029's hand-written `positionPath` does.
  const positionPath = [...chain].reverse().join('/');
  const hostBounds = record(value.hostFrame) ? positiveBounds(value.hostFrame.bounds) : null;
  const host = record(value.hostFrame) && typeof value.hostFrame.id === 'string' && hostBounds
    ? { id: value.hostFrame.id, bounds: hostBounds } : null;
  return {
    instanceNodeId: value.instanceNodeId,
    positionPath: positionPath.endsWith(value.instanceNodeId) ? positionPath : `${positionPath}/${value.instanceNodeId}`,
    pageName: typeof value.pageName === 'string' ? value.pageName : null,
    mainComponentId: typeof value.mainComponentId === 'string' ? value.mainComponentId : null,
    bounds,
    host,
  };
}

const slug = SLUG_PATTERN;

/** Observed component-set name → target slug. A transform of what the relevé says,
 *  never a new name: `CategoriesPrincipales` → `categories-principales`. */
export function slugifyComponentName(name: string): string {
  return name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const surfaceSuffix = (nodeId: string): string => nodeId.replace(':', '-');
const posixJoin = (...parts: string[]): string => parts.filter(Boolean).join('/');

/** Every distinct value of `key` across the carriers, in first-seen order. Carriers
 *  arrive relevé-first, so `[0]` is what the document you pointed at says. */
function readStrings(carriers: readonly Json[], key: string, accept: (value: string) => boolean): string[] {
  const seen = new Set<string>();
  for (const carrier of carriers) {
    const value = carrier[key];
    if (typeof value === 'string' && accept(value)) seen.add(value);
  }
  return [...seen];
}

export function generateRepairCampaign(
  releve: unknown,
  options: ManifestGeneratorOptions,
  linked: Record<string, unknown> = {},
): ManifestGeneratorResult {
  if (!record(releve)) {
    return { ok: false, refusal: 'releve-unreadable', message: 'the relevé is not a JSON object' };
  }
  const ownCarriers = carriersOf(releve);
  const linkedCarriers = carriersOf(...Object.keys(linked).sort().map((key) => linked[key]));
  const carriers = [...ownCarriers, ...linkedCarriers];

  const identitiesIn = (scope: readonly Json[]): Map<string, IdentityRecord> => {
    const found = new Map<string, IdentityRecord>();
    for (const carrier of scope) {
      const candidates: unknown[] = [carrier.identity];
      if (record(carrier.identities)) candidates.push(...Object.keys(carrier.identities).sort().map((key) => (carrier.identities as Json)[key]));
      for (const candidate of candidates) {
        const identity = readIdentity(candidate);
        if (identity && !found.has(identity.id)) found.set(identity.id, identity);
      }
    }
    return found;
  };
  // The document you point at declares its own subject. A linked document only ever
  // supplies supporting facts — usages, dependencies — and never widens the choice of
  // component: 029's audit names one section, while the H1 dump it references carries
  // the section AND the card. Letting the second tier vote would make an unambiguous
  // relevé ambiguous.
  const own = identitiesIn(ownCarriers);
  const identities = own.size > 0 ? own : identitiesIn(linkedCarriers);
  if (identities.size === 0) {
    return { ok: false, refusal: 'releve-unreadable', message: 'the relevé carries no readable component-set identity (id, key, name, bounds, variant axes and members)' };
  }

  const available = [...identities.keys()].sort();
  let identity: IdentityRecord;
  if (options.componentId !== undefined) {
    const selected = identities.get(options.componentId);
    if (!selected) {
      return { ok: false, refusal: 'component-not-found-in-releve', message: `--component ${options.componentId} is absent from the relevé; it carries ${available.join(', ')}` };
    }
    identity = selected;
  } else if (identities.size > 1) {
    return { ok: false, refusal: 'component-not-found-in-releve', message: `the relevé carries ${identities.size} component sets (${available.join(', ')}); name one with --component rather than letting the generator choose` };
  } else {
    identity = identities.get(available[0])!;
  }

  // File identity must AGREE. Two documents naming two files is a defect to report,
  // never something to pick a winner from.
  const fileKeys = readStrings(carriers, 'fileKey', (value) => value.length >= 10);
  if (fileKeys.length !== 1) {
    return {
      ok: false,
      refusal: 'releve-unreadable',
      message: fileKeys.length === 0
        ? 'the relevé does not name a Figma file key'
        : `the relevé and the documents it references name ${fileKeys.length} different Figma files: ${fileKeys.join(', ')}`,
    };
  }
  const fileKey = fileKeys[0];

  const versionIds = readStrings(carriers, 'fileVersionId', (value) => /^\d+$/.test(value));
  const fallbackVersionIds = versionIds.length > 0 ? versionIds : readStrings(carriers, 'versionId', (value) => /^\d+$/.test(value));
  if (fallbackVersionIds.length === 0) {
    return { ok: false, refusal: 'releve-unreadable', message: 'the relevé does not name a numeric Figma version id' };
  }
  // Several inspections of the same file legitimately carry several versions; the
  // document you pointed at pins the run. The others are named, not swallowed.
  const versionId = fallbackVersionIds[0];

  const timestamps = readStrings(carriers, 'inspectedAt', (value) => !Number.isNaN(Date.parse(value)));
  if (timestamps.length === 0) {
    return { ok: false, refusal: 'releve-unreadable', message: 'the relevé carries no inspection timestamp; a generated manifest never invents its own clock' };
  }
  const inspectedAt = timestamps[0];

  const nonDeductible: string[] = [];
  const name = (field: string, why: string): void => { nonDeductible.push(`${field} — ${why}`); };
  if (fallbackVersionIds.length > 1) {
    name('filePin.versionId', `${fallbackVersionIds.length} versions relevées (${fallbackVersionIds.join(', ')}) ; celle du relevé pointé est retenue — l’apply live revalide de toute façon le pin exact`);
  }

  const declaredTargetId = typeof releve.targetId === 'string' && slug.test(releve.targetId) ? releve.targetId : null;
  const targetId = declaredTargetId ?? slugifyComponentName(identity.name);
  if (!declaredTargetId) name('targetId', `dérivé du nom observé « ${identity.name} » ; le relevé ne déclare pas de cible`);
  if (!slug.test(targetId)) {
    return { ok: false, refusal: 'releve-unreadable', message: `the observed component-set name ${JSON.stringify(identity.name)} does not reduce to a target slug` };
  }
  const campaignId = typeof releve.campaignId === 'string' && slug.test(releve.campaignId) ? releve.campaignId : `${targetId}-generated`;

  const evidenceRoot = options.evidenceRoot ?? options.sourceReleve.split('/').slice(0, -1).join('/');
  if (!evidenceRoot || evidenceRoot.startsWith('/')) {
    return { ok: false, refusal: 'releve-unreadable', message: `the relevé path ${options.sourceReleve} does not name a bounded run directory` };
  }

  /* ------------------------------------------------------------- topology */
  const axisNames = Object.keys(identity.axes);
  const presentationOf = (selection: VariantSelection): string => axisNames.map((axis) => selection[axis]).join('-');
  const defaultSelection: VariantSelection = {};
  for (const axis of axisNames) {
    const observed = identity.axes[axis].defaultValue;
    defaultSelection[axis] = observed ?? identity.axes[axis].values[0];
    if (observed === null) name(`componentSetTopology.defaultVariantSelection.${axis}`, 'aucune valeur par défaut relevée ; première valeur de l’axe retenue');
  }
  const historical = identity.members.find((member) =>
    axisNames.every((axis) => member.selection[axis] === defaultSelection[axis])) ?? identity.members[0];
  if (!identity.members.some((member) => member === historical &&
    axisNames.every((axis) => member.selection[axis] === defaultSelection[axis]))) {
    name('componentSetTopology.historicalMember', 'aucun membre ne porte exactement la sélection par défaut relevée ; premier membre retenu comme référence de comparaison');
  }
  // The default selection MUST be the historical member's own pair, or the runner
  // refuses `presentation-not-selected`. Where they diverge, the member wins and the
  // divergence is named rather than hidden.
  const historicalSelection: VariantSelection = { ...historical.selection };
  const asMember = (member: IdentityRecord['members'][number]): ResponsiveComponentMember => ({
    presentationValue: presentationOf(member.selection),
    variantSelection: { ...member.selection },
    nodeId: member.id,
    componentKey: member.key,
    declaredName: member.name,
    authoringPreviewWidth: member.width,
  });
  const preserved = identity.members.filter((member) => member.id !== historical.id).map(asMember);
  const historicalMember = asMember(historical);
  const orderedPresentations = [historicalMember.presentationValue, ...preserved.map((member) => member.presentationValue)];

  name('componentSetTopology.authoringLayout.gap', 'espacement d’authoring du catalogue : décision de mise en page, absente du relevé — émis à 0');
  name('componentSetTopology.authoringLayout.order', 'ordre du catalogue au-delà du membre par défaut : ordre du relevé retenu, à confirmer');

  /* --------------------------------------------------------------- usages */
  const memberIds = new Set([identity.id, ...identity.members.map((member) => member.id)]);
  const usages = new Map<string, UsageRecord>();
  for (const carrier of carriers) {
    if (!Array.isArray(carrier.usages)) continue;
    for (const entry of carrier.usages) {
      const usage = readUsage(entry);
      if (!usage) continue;
      // A relevé may inventory several components' usages at once.
      if (usage.mainComponentId !== null && !memberIds.has(usage.mainComponentId)) continue;
      if (!usages.has(usage.instanceNodeId)) usages.set(usage.instanceNodeId, usage);
    }
  }
  const usageRows = [...usages.values()].sort((left, right) => left.instanceNodeId.localeCompare(right.instanceNodeId));
  if (usageRows.length === 0) name('affectedSurfaces (usages Page)', 'aucun inventaire d’usages lisible dans le relevé ni dans les documents qu’il référence');
  const withoutHost = usageRows.filter((usage) => usage.host === null);
  if (withoutHost.length > 0) name('affectedSurfaces (page-context)', `${withoutHost.length} usage(s) sans frame hôte relevée ; leur contexte visuel reste à déclarer`);

  const usableUsages = usageRows.filter((usage) => usage.host !== null && usage.host.id !== usage.instanceNodeId);
  const usageSurfaces: ResponsiveUsageSurface[] = usableUsages.map((usage) => ({
    surfaceId: `${targetId}:usage:${surfaceSuffix(usage.instanceNodeId)}`,
    nodeId: usage.instanceNodeId,
    positionPath: usage.positionPath,
    writePolicy: 'read-only',
  }));

  /* ------------------------------------------------------------- surfaces */
  const affectedSurfaces: AffectedSurface[] = [
    {
      surfaceId: `${targetId}:master`, targetId, role: 'master', nodeId: identity.id,
      pageComposition: null, structuralPath: identity.name,
      expectedSize: { ...identity.bounds }, impactStatus: 'pending',
    },
    ...identity.members.map((member): AffectedSurface => ({
      surfaceId: `${targetId}:variant:${surfaceSuffix(member.id)}`, targetId, role: 'variant', nodeId: member.id,
      pageComposition: null, structuralPath: member.name,
      expectedSize: { width: member.width, height: member.height }, impactStatus: 'pending',
    })),
  ];
  for (const usage of usableUsages) {
    const instanceSurfaceId = `${targetId}:usage:${surfaceSuffix(usage.instanceNodeId)}`;
    affectedSurfaces.push({
      surfaceId: instanceSurfaceId, targetId, role: 'page-instance', nodeId: usage.instanceNodeId,
      pageComposition: usage.pageName, structuralPath: usage.positionPath,
      expectedSize: { ...usage.bounds }, impactStatus: 'pending',
    });
    affectedSurfaces.push({
      surfaceId: `${targetId}:context:${surfaceSuffix(usage.host!.id)}`, targetId, role: 'page-context', nodeId: usage.host!.id,
      pageComposition: usage.pageName, structuralPath: usage.positionPath,
      contextForSurfaceId: instanceSurfaceId,
      expectedSize: { ...usage.host!.bounds }, impactStatus: 'pending',
    });
  }

  /* ------------------------------------------------------- write boundary */
  const protectedDependencyNodeIds = new Set<string>();
  for (const carrier of carriers) {
    const sets = carrier.protectedDependencySets;
    if (!Array.isArray(sets)) continue;
    for (const entry of sets) {
      if (!record(entry)) continue;
      // BOTH addresses, not one. A dependency inventoried as a member of a set is
      // protected as that member AND as its set: collapsing the two to the set alone
      // would quietly shrink the protected surface, which is the wrong direction for
      // a boundary to be wrong in.
      for (const field of ['componentId', 'componentSetId'] as const) {
        const id = entry[field];
        if (typeof id === 'string' && !memberIds.has(id)) protectedDependencyNodeIds.add(id);
      }
    }
  }
  if (protectedDependencyNodeIds.size === 0) name('writeBoundary.protectedDependencyNodeIds', 'aucune dépendance protégée relevée ; à confirmer avant toute pose');
  name('writeBoundary.allowedExistingNodeIds', 'squelette : le set et ses membres — les hôtes de traversée supplémentaires (instances enfants) sont une décision de périmètre');
  name('writeBoundary.expectedChangedNodeIds', 'squelette : le set et ses membres — les mutations exactes du premier passage sont une décision de campagne');
  name('writeBoundary.protectedChildPaths', 'enfants partagés à protéger : décision de périmètre, absente du relevé');

  const allowedExistingNodeIds = [identity.id, ...identity.members.map((member) => member.id)];
  const operationId = `${targetId}-generated-responsive-set`;

  /* ---------------------------------------------------------- design gaps */
  name('reference.decisionRef', `par défaut le relevé lui-même (${options.sourceReleve}) ; la référence owner réelle est une décision`);
  name('responsiveWidths', 'largeurs témoins de la vague : décision owner (fiche D9), non relevable — largeur d’authoring observée émise seule');
  name('contentFixtures', 'charges de preuve : décision de scénario — une fixture vide est émise, jamais un texte inventé');
  name('presentationScenarios', 'largeurs/hauteurs de scénario : tailles d’authoring observées émises ; les largeurs de vague sont une décision');
  name('primitiveBindings', 'bindings de variables par présentation : à relever au preflight, hors périmètre du générateur');
  name('typographyOverrides', 'typographie locale : décision owner (dette pending-responsive-text-style)');
  name('target.allowedFields', 'liste des champs mutables : décision de périmètre');
  name('target.allowedFactChanges', 'faits autorisés à bouger : décision de périmètre — tous les faits requis sont protégés par défaut');
  name('target.kind', '« direct-canvas » retenu par défaut (régime d’image le plus strict) ; le relevé ne dit pas si le master est généré depuis un contrat');
  name('workflow.subjectKind', '« organism » retenu par défaut ; le relevé ne classe pas le composant');
  name('workflow.ownerDecisionRoot', `par défaut ${posixJoin(evidenceRoot, 'owner')} ; une vague partage un dossier de décisions`);
  name('workflow.directDependencies / sharedDependencies', 'inventaire de dépendances : relevé séparément par l’audit');

  const campaign = {
    schemaVersion: COMPONENT_REPAIR_SCHEMA_VERSION,
    campaignId,
    filePin: { fileKey, versionId, capturedAt: inspectedAt },
    authorityRefs: [options.sourceReleve],
    targets: [{
      targetId,
      kind: 'direct-canvas' as const,
      masterNodeId: identity.id,
      variantNodeIds: identity.members.map((member) => member.id),
      reference: {
        referenceId: `${targetId}-generated-reference`,
        sourceKind: 'historical-version' as const,
        figmaVersionId: versionId,
        subjectNodeId: identity.id,
        visualFacts: [
          `set existant « ${identity.name} » à ${identity.members.length} membre(s)`,
          `axes relevés : ${axisNames.map((axis) => `${axis}(${identity.axes[axis].values.join('|')})`).join(' × ')}`,
          `${usableUsages.length} usage(s) adressé(s) par position`,
        ],
        decisionRef: options.sourceReleve,
      },
      affectedSurfaceIds: affectedSurfaces.map((surface) => surface.surfaceId),
      projectionDefectIds: [],
      allowedFields: [],
      protectedFacts: [...REQUIRED_COMPONENT_PROTECTION_FACTS],
      allowedFactChanges: [],
      expectedMasterName: identity.name,
      expectedVariantNames: identity.members.map((member) => member.name),
      responsiveWidths: [identity.bounds.width],
      responsive: {
        componentSetTopology: {
          propertyName: axisNames[0],
          setName: identity.name,
          setIdentityPolicy: 'existing' as const,
          setNodeId: identity.id,
          setComponentKey: identity.key,
          defaultPresentationValue: historicalMember.presentationValue,
          variantProperties: Object.fromEntries(axisNames.map((axis) => [axis, [...identity.axes[axis].values]])),
          defaultVariantSelection: historicalSelection,
          authoringLayout: { direction: 'VERTICAL' as const, gap: 0, order: orderedPresentations },
          historicalMember: {
            presentationValue: historicalMember.presentationValue,
            variantSelection: historicalSelection,
            nodeId: historical.id,
            componentKey: historical.key,
            declaredName: historical.name,
            authoringPreviewWidth: historical.width,
          },
          preservedMembers: preserved,
          createdMembers: [],
          expectedMemberNames: identity.members.map((member) => member.name),
        },
        expectedCreates: [],
        contentFixtures: [{ fixtureId: 'releve', textValues: {} }],
        presentationScenarios: identity.members.map((member) => ({
          scenarioId: `${presentationOf(member.selection)}-authoring`,
          presentationValue: presentationOf(member.selection),
          variantSelection: { ...member.selection },
          width: member.width,
          height: member.height,
          fixtureId: 'releve',
          expectedOverflow: false as const,
        })),
        presentationLayouts: identity.members.map((member) => ({
          presentationValue: presentationOf(member.selection),
          variantSelection: { ...member.selection },
          nodePath: '',
          // Observed: every member root is FIXED at its authoring width, which is the
          // catalogue convention the runner already requires.
          properties: { layoutSizingHorizontal: 'FIXED' as const },
        })),
        primitiveBindings: [],
        typographyOverrides: [],
        authorizedTargetNodeIds: allowedExistingNodeIds,
        usageSurfaces,
      },
    }],
    affectedSurfaces,
    consumerImpacts: [],
    allowedOperations: [{
      operationId,
      targetId,
      mechanism: 'responsive-component-set' as const,
      nodeId: identity.id,
      structuralPath: '',
      preconditions: [{ field: 'nodeId', equals: identity.id }, { field: 'setComponentKey', equals: identity.key }],
      changes: { capability: 'responsive-component-set' },
      expectedPostconditions: [{ field: 'pageWrites', equals: [] }, { field: 'childWrites', equals: [] }],
    }],
    captureSets: {
      before: {
        captureSetId: `${campaignId}-before-${versionId}`,
        phase: 'before' as const,
        fileVersionId: versionId,
        artifacts: [], imageFingerprints: [], instanceLinks: [],
        complete: false,
      },
    },
    state: 'draft' as const,
    createdAt: inspectedAt,
    workflow: {
      mode: 'single-component' as const,
      subjectKind: 'organism' as const,
      evidenceRoot,
      ownerDecisionRoot: posixJoin(evidenceRoot, 'owner'),
      comparisonPath: posixJoin(evidenceRoot, 'verify', 'comparison.json'),
      applyReceiptPaths: {
        first: posixJoin(evidenceRoot, 'receipts', 'apply-first.json'),
        second: posixJoin(evidenceRoot, 'receipts', 'apply-second.json'),
      },
      pageMutationPolicy: 'forbid-direct' as const,
      directDependencies: [],
      sharedDependencies: [],
    },
    artifactRoots: {
      audit: posixJoin(evidenceRoot, 'audit.json'),
      captures: {
        before: posixJoin(evidenceRoot, 'captures', 'before'),
        after: posixJoin(evidenceRoot, 'captures', 'after'),
        idempotence: posixJoin(evidenceRoot, 'captures', 'idempotence'),
      },
      receipts: posixJoin(evidenceRoot, 'receipts'),
      verify: posixJoin(evidenceRoot, 'verify'),
      dryRun: posixJoin(evidenceRoot, 'receipts', 'dry-run.json'),
      bridgeScripts: {
        first: posixJoin(evidenceRoot, 'bridge-first.js'),
        second: posixJoin(evidenceRoot, 'bridge-second.js'),
      },
    },
    writeBoundary: {
      allowedExistingNodeIds,
      expectedChangedNodeIds: allowedExistingNodeIds,
      readOnlySurfaceNodeIds: [
        ...usableUsages.map((usage) => usage.instanceNodeId),
        ...usableUsages.map((usage) => usage.host!.id),
      ],
      protectedDependencyNodeIds: [...protectedDependencyNodeIds].sort(),
      protectedChildNodeIds: [],
      protectedChildPaths: [],
      allowedCreateRoles: [],
      pageWrites: [] as [],
      childWrites: [] as [],
    },
    generated: {
      by: 'manifest-generator' as const,
      sourceReleve: options.sourceReleve,
      nonDeductible,
    },
  };

  // FR-003. Nothing about being generated buys a manifest a pass.
  const validation = validateRepairCampaign(campaign);
  if (!validation.ok) {
    return {
      ok: false,
      refusal: 'generated-campaign-invalid',
      message: validation.issues.map((entry) => `${entry.code}@${entry.path}: ${entry.message}`).join(' | '),
    };
  }

  return {
    ok: true,
    campaign: validation.value,
    report: {
      schemaVersion: '1.0.0',
      sourceReleve: options.sourceReleve,
      targetId,
      setNodeId: identity.id,
      memberCount: identity.members.length,
      usageCount: usableUsages.length,
      nonDeductible,
    },
  };
}
