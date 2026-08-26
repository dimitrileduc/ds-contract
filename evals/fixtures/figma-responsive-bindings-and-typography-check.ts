import { collectSurfaceFacts, compareResponsiveTransitionProtectedFacts, validateResponsiveFacts } from '../../extract/figma/projection-repair/facts.js';
import { expectedBindingFacts, expectedTypographyFacts, responsiveCampaign } from './figma-responsive-fixture.js';

const target = responsiveCampaign.targets[0];
const valid = validateResponsiveFacts(target.responsive, expectedBindingFacts, expectedTypographyFacts);
if (!valid.ok) throw new Error(`valid bindings/typography refused: ${valid.issues.join(', ')}`);

const detached = structuredClone(expectedBindingFacts);
detached[0].boundVariableId = null as never;
const detachedResult = validateResponsiveFacts(target.responsive, detached, expectedTypographyFacts);
if (detachedResult.ok || !detachedResult.issues.some((issue) => issue.includes('primitive-binding-detached'))) {
  throw new Error('primitive-binding-detached was not reported');
}

const foreignField = structuredClone(expectedTypographyFacts) as any[];
foreignField[0].appliedFields.fontFamily = 'Inter';
const foreignResult = validateResponsiveFacts(target.responsive, expectedBindingFacts, foreignField);
if (foreignResult.ok || !foreignResult.issues.some((issue) => issue.includes('typography-field-not-allowlisted'))) {
  throw new Error('typography-field-not-allowlisted was not reported');
}

const factSource = {
  id: '9:10', type: 'COMPONENT_SET', name: 'Card', componentPropertyDefinitions: { Presentation: { type: 'VARIANT', variantOptions: ['Compact', 'Desktop', 'Wide'] } },
  children: [{
    id: '1:1', type: 'COMPONENT', name: 'Presentation=Wide', key: 'historical-key', boundVariables: { height: { id: 'VariableID:1:12' } },
    children: [{
      id: '1:2', type: 'TEXT', name: 'Title', characters: 'Default title', textStyleId: 'S:title',
      fontName: { family: 'Montserrat', style: 'Regular' }, fontSize: 44, lineHeight: { unit: 'PIXELS', value: 48 }, textAlignHorizontal: 'LEFT',
      getSharedPluginData: 'pending-responsive-text-style',
    }],
  }],
} as any;
const facts = collectSurfaceFacts(factSource);
if (facts.componentMembers.length !== 1 || facts.componentMembers[0].componentKey !== 'historical-key' || facts.primitiveBindings.length !== 1) {
  throw new Error('component member identity or boundVariables were not extracted');
}

const semanticBefore = collectSurfaceFacts({
  id: '2:1', type: 'INSTANCE', name: 'Card', componentId: '1:1',
  componentProperties: { 'Title#1:4': { type: 'TEXT', value: 'Home title' } },
  overrides: [{ id: '2:1;1:4', overriddenFields: ['characters'] }], children: [],
} as any);
const semanticAfter = collectSurfaceFacts({
  id: '2:1', type: 'INSTANCE', name: 'Card', componentId: '1:1',
  componentProperties: {
    'Title#9:44': { type: 'TEXT', value: 'Home title' },
    Presentation: { type: 'VARIANT', value: 'Wide', boundVariables: {} },
  },
  overrides: [{ id: '2:1;1:4', overriddenFields: ['characters'] }], children: [],
} as any);
const additiveDiff = compareResponsiveTransitionProtectedFacts(semanticBefore, semanticAfter, [
  'component-properties', 'instance-overrides', 'shared-child-facts',
]);
if (additiveDiff.length !== 0) throw new Error('native property-id regeneration or additive Presentation was treated as override loss');
const clobberedAfter = structuredClone(semanticAfter);
clobberedAfter.componentProperties = structuredClone(semanticAfter.componentProperties) as any;
(clobberedAfter.componentProperties[0] as any).values['Title#9:44'].value = 'Clobbered';
const clobberedDiff = compareResponsiveTransitionProtectedFacts(semanticBefore, clobberedAfter, ['component-properties']);
if (clobberedDiff.length !== 1) throw new Error('semantic component-property clobber was hidden by responsive normalization');

const standaloneMaster = collectSurfaceFacts({
  id: '1:1', type: 'COMPONENT', name: 'Card',
  componentPropertyDefinitions: { 'Title#1:4': { type: 'TEXT', defaultValue: 'Home title' } },
  children: [{
    id: '1:2', type: 'TEXT', name: 'Title', characters: 'Home title',
    componentPropertyReferences: { characters: 'Title#1:4' }, children: [],
  }],
} as any);
const variantMember = collectSurfaceFacts({
  id: '1:1', type: 'COMPONENT', name: 'Presentation=Wide', children: [{
    id: '1:2', type: 'TEXT', name: 'Title', characters: 'Home title',
    componentPropertyReferences: { characters: 'Title#9:44' }, children: [],
  }],
} as any);
const liftedDefinitionDiff = compareResponsiveTransitionProtectedFacts(standaloneMaster, variantMember, ['component-properties']);
if (liftedDefinitionDiff.length !== 0) throw new Error('component-set-owned property definition was treated as property loss');
const missingReferenceMember = collectSurfaceFacts({
  id: '1:1', type: 'COMPONENT', name: 'Presentation=Wide', children: [],
} as any);
const missingReferenceDiff = compareResponsiveTransitionProtectedFacts(standaloneMaster, missingReferenceMember, ['component-properties']);
if (missingReferenceDiff.length !== 1) throw new Error('unreferenced component property definition was hidden by responsive normalization');

console.log('✔ primitive bindings remain attached and temporary typography is restricted to owner-approved local fields');
