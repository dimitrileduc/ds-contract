import { isObject as object, sha256Of, stableJson, walkStructural as walk, type JsonRecord as Json } from './json.js';
import { canonicalVariantSelection, memberVariantSelection, responsiveTopologyMembers } from './types.js';
import type { ProtectedFact, ResponsiveComponentCapability, VariantSelection } from './types.js';

const digest = (value: unknown): string => sha256Of(stableJson(value));

function paints(entry: Json): Array<{ field: string; index: number; paint: Json }> {
  const rows: Array<{ field: string; index: number; paint: Json }> = [];
  for (const field of ['fills', 'backgrounds', 'strokes']) {
    const value = entry[field];
    if (!Array.isArray(value)) continue;
    value.forEach((paint, index) => { if (object(paint)) rows.push({ field, index, paint }); });
  }
  return rows;
}

export interface SurfaceFacts {
  schemaVersion: '1.0.0';
  root: { id: unknown; type: unknown; name: unknown; componentId: unknown };
  variants: Array<{ id: unknown; name: unknown }>;
  imagePaints: unknown[];
  videoPaints: unknown[];
  gradientPaints: unknown[];
  textContent: unknown[];
  textRanges: unknown[];
  textStyles: unknown[];
  instanceLinks: unknown[];
  instanceOverrides: unknown[];
  geometry: unknown[];
  responsiveOverflow: unknown[];
  componentSetTopology: unknown;
  componentMembers: Array<{ nodeId: unknown; name: unknown; componentKey: unknown }>;
  componentProperties: unknown[];
  primitiveBindings: unknown[];
  temporaryTypography: unknown[];
  sharedChildFacts: unknown[];
  setIdentity: unknown;
  memberIdsKeys: unknown[];
  axisNamesValues: unknown;
  layerNamesRoles: unknown[];
  columnsEnumHonesty: unknown;
  digests: Record<ProtectedFact, string>;
}

/** Extract the exact channels that Hero/HeroVideo showed can regress while a
 * broad "component amended" report remains green. */
export function collectSurfaceFacts(node: Json): SurfaceFacts {
  const imagePaints: unknown[] = [];
  const videoPaints: unknown[] = [];
  const gradientPaints: unknown[] = [];
  const textContent: unknown[] = [];
  const textRanges: unknown[] = [];
  const textStyles: unknown[] = [];
  const instanceLinks: unknown[] = [];
  const instanceOverrides: unknown[] = [];
  const geometry: unknown[] = [];
  const responsiveOverflow: unknown[] = [];
  const componentProperties: unknown[] = [];
  const primitiveBindings: unknown[] = [];
  const temporaryTypography: unknown[] = [];
  const sharedChildFacts: unknown[] = [];
  const layerNamesRoles: unknown[] = [];
  const rootBox = object(node.absoluteBoundingBox) ? node.absoluteBoundingBox : null;

  walk(node, (entry, structuralPath) => {
    layerNamesRoles.push({ structuralPath, type: entry.type ?? null, name: entry.name ?? null });
    for (const { field, index, paint } of paints(entry)) {
      const address = { structuralPath, field, index };
      if (paint.type === 'IMAGE') imagePaints.push({ ...address, paint });
      else if (paint.type === 'VIDEO') videoPaints.push({ ...address, paint });
      else if (typeof paint.type === 'string' && paint.type.startsWith('GRADIENT_')) gradientPaints.push({ ...address, paint });
    }
    if (entry.type === 'TEXT') {
      textContent.push({ structuralPath, characters: entry.characters ?? '' });
      textRanges.push({
        structuralPath,
        characterStyleOverrides: entry.characterStyleOverrides ?? [],
        styleOverrideTable: entry.styleOverrideTable ?? {},
      });
      const style = object(entry.style) ? entry.style : {};
      const styles = object(entry.styles) ? entry.styles : {};
      textStyles.push({
        structuralPath,
        textStyleId: styles.text ?? entry.textStyleId ?? null,
        fontFamily: style.fontFamily ?? null,
        fontPostScriptName: style.fontPostScriptName ?? null,
        fontWeight: style.fontWeight ?? null,
        fontSize: style.fontSize ?? null,
        lineHeightPx: style.lineHeightPx ?? null,
        letterSpacing: style.letterSpacing ?? null,
        textAlignHorizontal: style.textAlignHorizontal ?? null,
      });
      const pluginData = object(entry.sharedPluginData) ? entry.sharedPluginData : {};
      const namespace = object(pluginData.ds_contracts) ? pluginData.ds_contracts : {};
      const debtStatus = namespace.responsiveTypographyDebt ?? entry.responsiveTypographyDebt ??
        (typeof entry.getSharedPluginData === 'string' ? entry.getSharedPluginData : null);
      if (debtStatus) temporaryTypography.push({
        structuralPath,
        name: entry.name ?? null,
        textStyleId: entry.textStyleId ?? (object(entry.styles) ? entry.styles.text ?? null : null),
        fontFamily: entry.fontName && object(entry.fontName) ? entry.fontName.family ?? null : style.fontFamily ?? null,
        fontWeight: entry.fontWeight ?? style.fontWeight ?? null,
        fontSize: entry.fontSize ?? style.fontSize ?? null,
        lineHeight: entry.lineHeight ?? style.lineHeightPx ?? null,
        textAlignHorizontal: entry.textAlignHorizontal ?? style.textAlignHorizontal ?? null,
        characters: entry.characters ?? '',
        debtStatus,
      });
    }
    if (entry.type === 'INSTANCE') {
      // Descendant instance ids may be regenerated inside an amended master.
      // The stable semantic link is its structural address + main component;
      // the Page/root identity is protected separately.
      instanceLinks.push({ structuralPath, componentId: entry.componentId ?? null });
      instanceOverrides.push({
        structuralPath,
        componentProperties: entry.componentProperties ?? {},
        overrides: entry.overrides ?? [],
      });
      sharedChildFacts.push({
        structuralPath,
        componentId: entry.componentId ?? null,
        componentProperties: entry.componentProperties ?? {},
        overrides: entry.overrides ?? [],
      });
    }
    if (entry.componentPropertyDefinitions || entry.componentProperties || entry.componentPropertyReferences) {
      componentProperties.push({
        structuralPath,
        definitions: entry.componentPropertyDefinitions ?? {},
        values: entry.componentProperties ?? {},
        references: entry.componentPropertyReferences ?? {},
      });
    }
    if (object(entry.boundVariables)) {
      for (const [property, binding] of Object.entries(entry.boundVariables)) {
        const bindings = Array.isArray(binding) ? binding : [binding];
        primitiveBindings.push({
          structuralPath,
          property,
          variableIds: bindings.filter(object).map((value) => value.id ?? value.variableId ?? null),
          resolvedValue: entry[property] ?? (object(entry.style) ? (entry.style as Json)[property] ?? null : null),
        });
      }
    }
    const box = object(entry.absoluteBoundingBox) ? entry.absoluteBoundingBox : null;
    geometry.push({
      structuralPath,
      id: entry.id ?? null,
      type: entry.type ?? null,
      x: box?.x ?? null,
      y: box?.y ?? null,
      width: box?.width ?? null,
      height: box?.height ?? null,
      layoutMode: entry.layoutMode ?? null,
      layoutSizingHorizontal: entry.layoutSizingHorizontal ?? null,
      layoutSizingVertical: entry.layoutSizingVertical ?? null,
      clipsContent: entry.clipsContent ?? null,
    });
    if (rootBox && box && typeof rootBox.x === 'number' && typeof rootBox.y === 'number' && typeof rootBox.width === 'number' && typeof rootBox.height === 'number' &&
      typeof box.x === 'number' && typeof box.y === 'number' && typeof box.width === 'number' && typeof box.height === 'number') {
      const overflow = {
        left: box.x < rootBox.x,
        top: box.y < rootBox.y,
        right: box.x + box.width > rootBox.x + rootBox.width,
        bottom: box.y + box.height > rootBox.y + rootBox.height,
      };
      if (overflow.left || overflow.top || overflow.right || overflow.bottom) responsiveOverflow.push({ structuralPath, overflow });
    }
  });

  const variants = node.type === 'COMPONENT_SET' && Array.isArray(node.children)
    ? node.children.filter((child) => object(child) && child.type === 'COMPONENT').map((child) => ({ id: (child as Json).id ?? null, name: (child as Json).name ?? null }))
    : [];
  const componentMembers = node.type === 'COMPONENT_SET' && Array.isArray(node.children)
    ? node.children.filter((child) => object(child) && child.type === 'COMPONENT').map((child) => ({
      nodeId: (child as Json).id ?? null,
      name: (child as Json).name ?? null,
      componentKey: (child as Json).key ?? (child as Json).componentKey ?? null,
    }))
    : node.type === 'COMPONENT' ? [{ nodeId: node.id ?? null, name: node.name ?? null, componentKey: node.key ?? node.componentKey ?? null }] : [];
  const componentSetTopology = node.type === 'COMPONENT_SET' ? {
    nodeId: node.id ?? null,
    name: node.name ?? null,
    propertyDefinitions: node.componentPropertyDefinitions ?? {},
    memberNames: componentMembers.map((member) => member.name),
  } : null;
  const propertyDefinitions = node.type === 'COMPONENT_SET' && object(node.componentPropertyDefinitions)
    ? node.componentPropertyDefinitions : {};
  const axisNamesValues = Object.fromEntries(Object.entries(propertyDefinitions)
    .filter(([, definition]) => object(definition) && definition.type === 'VARIANT')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, definition]) => [name, {
      values: Array.isArray((definition as Json).variantOptions) ? (definition as Json).variantOptions : [],
      defaultValue: (definition as Json).defaultValue ?? null,
    }] as const));
  const setIdentity = node.type === 'COMPONENT_SET'
    ? { nodeId: node.id ?? null, componentKey: node.key ?? node.componentKey ?? null, name: node.name ?? null }
    : null;
  const memberIdsKeys = componentMembers.map(({ nodeId, componentKey }) => ({ nodeId, componentKey }));
  const columnsEnumHonesty = object(axisNamesValues.Colonnes) ? {
    values: (axisNamesValues.Colonnes as Json).values ?? [],
    defaultValue: (axisNamesValues.Colonnes as Json).defaultValue ?? null,
  } : null;
  // One identity value serves two fact names: each surface digests its own
  // root, so the master surface reads it as master identity and the page-host
  // surface as page-node identity. The names stay distinct because campaign
  // manifests protect them per surface kind; the value is deliberately shared.
  const rootIdentity = { id: node.id ?? null, type: node.type ?? null, componentId: node.componentId ?? null };
  const values: Record<ProtectedFact, unknown> = {
    'master-identity': rootIdentity,
    'variant-cardinality': variants.length,
    'variant-names': variants.map((variant) => variant.name),
    'image-paints': imagePaints,
    'video-paints': videoPaints,
    'gradient-paints': gradientPaints,
    'text-content': textContent,
    'text-ranges': textRanges,
    'text-styles': textStyles,
    'instance-links': instanceLinks,
    'instance-overrides': instanceOverrides,
    'page-node-identity': rootIdentity,
    geometry,
    'responsive-overflow': responsiveOverflow,
    'component-set-topology': componentSetTopology,
    'historical-member-identity': componentMembers,
    'component-properties': componentProperties,
    'primitive-bindings': primitiveBindings,
    'temporary-typography': temporaryTypography,
    'shared-child-facts': sharedChildFacts,
    'set-identity': setIdentity,
    'member-ids-keys': memberIdsKeys,
    'axis-names-values': axisNamesValues,
    'card-identity-key': rootIdentity,
    'card-variant-cardinality': componentMembers.length,
    'layer-names-roles': layerNamesRoles,
    'media-text-content': { imagePaints, videoPaints, gradientPaints, textContent },
    'usage-instance-links': instanceLinks,
    'usage-overrides': instanceOverrides,
    'columns-enum-honesty': columnsEnumHonesty,
  };
  const digests = Object.fromEntries(Object.entries(values).map(([fact, value]) => [fact, digest(value)])) as Record<ProtectedFact, string>;
  return {
    schemaVersion: '1.0.0',
    root: { id: node.id ?? null, type: node.type ?? null, name: node.name ?? null, componentId: node.componentId ?? null },
    variants,
    imagePaints,
    videoPaints,
    gradientPaints,
    textContent,
    textRanges,
    textStyles,
    instanceLinks,
    instanceOverrides,
    geometry,
    responsiveOverflow,
    componentSetTopology,
    componentMembers,
    componentProperties,
    primitiveBindings,
    temporaryTypography,
    sharedChildFacts,
    setIdentity,
    memberIdsKeys,
    axisNamesValues,
    layerNamesRoles,
    columnsEnumHonesty,
    digests,
  };
}

export interface ResponsiveFactValidation {
  ok: boolean;
  issues: string[];
}

/** Compare live/fixture facts to the exact declarations. Resolved values alone
 * never satisfy a binding, and typography accepts no field outside its local
 * owner-approved allowlist. */
export function validateResponsiveFacts(
  capability: ResponsiveComponentCapability,
  bindingFacts: readonly unknown[],
  typographyFacts: readonly unknown[],
): ResponsiveFactValidation {
  const issues: string[] = [];
  const rows = bindingFacts.filter(object);
  const multiAxis = capability.componentSetTopology.variantProperties !== undefined;
  for (const expected of capability.primitiveBindings) {
    const expectedSelection = multiAxis ? canonicalVariantSelection(expected.variantSelection ??
      memberVariantSelection(capability.componentSetTopology, responsiveTopologyMembers(capability.componentSetTopology)
        .find((member) => member.presentationValue === expected.presentationValue)!)) : '';
    const matches = rows.filter((row) => row.presentationValue === expected.presentationValue && row.nodePath === expected.nodePath && row.property === expected.property &&
      (multiAxis ? canonicalVariantSelection(row.variantSelection as VariantSelection | undefined) : '') === expectedSelection);
    if (matches.length !== 1 || matches[0].status !== 'attached' || matches[0].boundVariableId !== expected.variableId ||
      matches[0].variableId !== expected.variableId || matches[0].variableName !== expected.variableName || matches[0].resolvedValue !== expected.resolvedValue) {
      issues.push(`primitive-binding-detached:${expected.presentationValue}/${expected.nodePath}/${expected.property}`);
    }
  }
  if (rows.length !== capability.primitiveBindings.length) issues.push('primitive-binding-detached:cardinality');

  const typographyRows = typographyFacts.filter(object);
  for (const expected of capability.typographyOverrides) {
    const expectedSelection = multiAxis ? canonicalVariantSelection(expected.variantSelection ??
      memberVariantSelection(capability.componentSetTopology, responsiveTopologyMembers(capability.componentSetTopology)
        .find((member) => member.presentationValue === expected.presentationValue)!)) : '';
    const matches = typographyRows.filter((row) => row.presentationValue === expected.presentationValue && row.nodePath === expected.nodePath &&
      (multiAxis ? canonicalVariantSelection(row.variantSelection as VariantSelection | undefined) : '') === expectedSelection);
    const row = matches[0];
    const applied = row && object(row.appliedFields) ? row.appliedFields : {};
    const appliedKeys = Object.keys(applied);
    const valid = matches.length === 1 && row.status === 'allowlisted' && row.sourceRole === expected.sourceRole &&
      row.sourceTextStyleId === expected.sourceTextStyleId && row.family === expected.family && row.weight === expected.weight &&
      row.characters === expected.characters && row.debtStatus === expected.debtStatus &&
      appliedKeys.length === expected.allowedFields.length && appliedKeys.every((field) => expected.allowedFields.includes(field as never)) &&
      expected.allowedFields.every((field) => stableJson(applied[field]) === stableJson(expected.after[field]));
    if (!valid) issues.push(`typography-field-not-allowlisted:${expected.presentationValue}/${expected.nodePath}`);
  }
  if (typographyRows.length !== capability.typographyOverrides.length) issues.push('typography-field-not-allowlisted:cardinality');
  return { ok: issues.length === 0, issues: [...new Set(issues)] };
}

/** Normalize one responsive member's comparable facts (names/roles below the
 * root, media, texts, component properties and shared children) into a stable
 * string. Both the live-receipt gate and the closure gate diff members against
 * the historical baseline through this one address, so the two cannot silently
 * disagree on what counts as member drift. */
export function comparableResponsiveMemberFacts(entry: Record<string, unknown>): string {
  return stableJson({
    namesAndRoles: Array.isArray(entry.namesAndRoles) ? entry.namesAndRoles.filter((row) => object(row) && row.structuralPath !== '') : [],
    media: entry.media ?? [],
    texts: entry.texts ?? [],
    componentProperties: entry.componentProperties ?? [],
    sharedChildren: entry.sharedChildren ?? [],
  });
}

export interface ProtectedFactDifference {
  fact: ProtectedFact;
  before: string;
  after: string;
}

export function compareProtectedFacts(
  before: SurfaceFacts,
  after: SurfaceFacts,
  protectedFacts: readonly string[],
): ProtectedFactDifference[] {
  return protectedFacts.flatMap((fact) => {
    const typed = fact as ProtectedFact;
    const left = before.digests[typed];
    const right = after.digests[typed];
    return left === right ? [] : [{ fact: typed, before: left ?? '(missing)', after: right ?? '(missing)' }];
  });
}

const responsiveSemanticFacts = new Set<ProtectedFact>([
  'historical-member-identity',
  'component-properties',
  'instance-overrides',
  'shared-child-facts',
]);

const propertyToken = (value: string): string => /^.+#\d+:\d+$/.test(value) ? value.slice(0, value.lastIndexOf('#')) : value;

/** Native combineAsVariants regenerates component-property suffix ids and adds
 * the selected variant properties to existing instances. These two changes
 * are additive topology mechanics, not override loss. Normalize only those
 * mechanics; semantic values, links, override arrays and child identities stay
 * fully compared. */
function normalizeResponsiveSemanticValue(value: unknown, variantPropertyNames: ReadonlySet<string>): unknown {
  if (Array.isArray(value)) return value.map((entry) => normalizeResponsiveSemanticValue(entry, variantPropertyNames));
  if (!object(value)) return typeof value === 'string' ? propertyToken(value) : value;
  const rows = Object.entries(value)
    .filter(([key]) => !variantPropertyNames.has(propertyToken(key)))
    .map(([key, entry]) => [propertyToken(key), normalizeResponsiveSemanticValue(entry, variantPropertyNames)] as const)
    .sort(([left], [right]) => left.localeCompare(right));
  return Object.fromEntries(rows);
}

/** A standalone component owns its component-property definitions. Once Figma
 * moves that component into a component set, the set owns those definitions
 * and the member capture only retains the descendant property references. Drop
 * only root definitions that are still referenced by the captured member; an
 * unreferenced definition remains protected and therefore still fails closed. */
function normalizeResponsiveComponentProperties(value: unknown, variantPropertyNames: ReadonlySet<string>): unknown {
  if (!Array.isArray(value)) return normalizeResponsiveSemanticValue(value, variantPropertyNames);
  const referencedTokens = new Set(value.flatMap((row) => {
    if (!object(row) || !object(row.references)) return [];
    return Object.values(row.references)
      .filter((reference): reference is string => typeof reference === 'string')
      .map(propertyToken);
  }));
  const withoutLiftedDefinitions = value.map((row) => {
    if (!object(row) || row.structuralPath !== '' || !object(row.definitions)) return row;
    const definitions = Object.fromEntries(Object.entries(row.definitions)
      .filter(([key]) => !referencedTokens.has(propertyToken(key))));
    return { ...row, definitions };
  }).filter((row) => {
    if (!object(row) || row.structuralPath !== '') return true;
    return [row.definitions, row.values, row.references].some((entry) => object(entry) && Object.keys(entry).length > 0);
  });
  return normalizeResponsiveSemanticValue(withoutLiftedDefinitions, variantPropertyNames);
}

export function compareResponsiveTransitionProtectedFacts(
  before: SurfaceFacts,
  after: SurfaceFacts,
  protectedFacts: readonly string[],
  capability?: ResponsiveComponentCapability,
): ProtectedFactDifference[] {
  const variantPropertyNames = new Set(Object.keys(capability?.componentSetTopology.variantProperties ?? {
    [capability?.componentSetTopology.propertyName ?? 'Presentation']: [],
  }));
  return protectedFacts.flatMap((fact) => {
    const typed = fact as ProtectedFact;
    if (typed === 'component-set-topology' && capability?.componentSetTopology.setIdentityPolicy === 'existing') {
      const propertyName = capability.componentSetTopology.propertyName;
      const expectedDefault = capability.componentSetTopology.defaultPresentationValue;
      const normalizeDefault = (value: unknown): unknown => {
        if (!object(value) || !object(value.propertyDefinitions)) return value;
        const definitions = { ...value.propertyDefinitions };
        const definition = definitions[propertyName];
        if (object(definition)) {
          const { defaultValue: _defaultValue, ...stableDefinition } = definition;
          definitions[propertyName] = stableDefinition;
        }
        return { ...value, propertyDefinitions: definitions };
      };
      const afterDefinition = object(after.componentSetTopology) && object(after.componentSetTopology.propertyDefinitions)
        ? after.componentSetTopology.propertyDefinitions[propertyName]
        : null;
      if (object(afterDefinition) && afterDefinition.defaultValue === expectedDefault &&
        digest(normalizeDefault(before.componentSetTopology)) === digest(normalizeDefault(after.componentSetTopology))) {
        return [];
      }
    }
    if (!responsiveSemanticFacts.has(typed)) {
      const left = before.digests[typed];
      const right = after.digests[typed];
      return left === right ? [] : [{ fact: typed, before: left ?? '(missing)', after: right ?? '(missing)' }];
    }
    const rawBefore = typed === 'historical-member-identity'
      ? before.componentMembers.map(({ nodeId, componentKey }) => ({ nodeId, componentKey }))
      : typed === 'component-properties' ? before.componentProperties
        : typed === 'instance-overrides' ? before.instanceOverrides : before.sharedChildFacts;
    const rawAfter = typed === 'historical-member-identity'
      ? after.componentMembers.map(({ nodeId, componentKey }) => ({ nodeId, componentKey }))
      : typed === 'component-properties' ? after.componentProperties
        : typed === 'instance-overrides' ? after.instanceOverrides : after.sharedChildFacts;
    const normalize = typed === 'component-properties'
      ? (value: unknown) => normalizeResponsiveComponentProperties(value, variantPropertyNames)
      : (value: unknown) => normalizeResponsiveSemanticValue(value, variantPropertyNames);
    const left = digest(normalize(rawBefore));
    const right = digest(normalize(rawAfter));
    return left === right ? [] : [{ fact: typed, before: left, after: right }];
  });
}
