import { validateOptionPacket } from '../../../specs/027-responsive-hero-video/tools/build-option-packet.js';

const clone = <T>(value: T): T => structuredClone(value);

const composition = {
  presentParts: ['Background', 'VoileBas', 'VoileNavigation', 'Text', 'Text.Accroche', 'Bouton'],
  absentParts: [],
  order: ['Background', 'VoileBas', 'VoileNavigation', 'Text', 'Bouton'],
  axis: 'column',
  align: 'center',
  justify: 'center',
  titleAlign: 'center',
  heightStrategy: 'visible-viewport-min-content',
  spacing: {
    paddingTop: '{space.24}',
    paddingRight: '{space.24}',
    paddingBottom: '{space.24}',
    paddingLeft: '{space.24}',
    gap: '{space.16}',
    contentMaxWidth: 'none',
  },
  textStyleTokenPath: '{typography.titre-hero-video}',
  ctaTreatment: {
    reuseCurrentButton: true,
    variant: 'Outline blanc',
    sizeDecision: 'unchanged',
    impactRefs: [],
  },
  mediaTreatment: {
    posterPolicy: 'preserve-owner-poster',
    fit: 'cover',
    cropDecision: 'preserve-current',
    secondAsset: 'none',
  },
  shortLandscapeFallback: 'grow-with-content',
  figmaStrategy: 'auto-layout',
};

const option = (optionId: string) => ({
  optionId,
  label: optionId,
  summary: 'Option comparable Mobile/Desktop sans écriture Figma.',
  compositions: {
    compact: clone(composition),
    desktop: clone(composition),
    wide: { baselineRef: 'specs/027-responsive-hero-video/decisions/H1-baseline.json' },
  },
  probeIds: [
    '320', '390', '834', '991', '992', '993', '1024', '1200',
    '1399', '1400', '1401', '1440', '1728', 'short-landscape-844x390',
  ],
  contentCases: ['default', 'long-title', 'long-cta'],
  mediaCases: ['poster', 'video-unavailable'],
  tradeoffs: ['Le centrage compact privilégie la lisibilité au-dessus de la continuité de la composition wide.'],
  limits: ['Figma présente explicitement la composition et ne bascule pas automatiquement au resize.'],
});

const validPacket = {
  schemaVersion: '1.0.0',
  featureId: '027-responsive-hero-video',
  authority: 'non-authoritative',
  decisionScope: {
    authoritativeFields: ['structure', 'breakpoint-profile', 'semantic-roles'],
    previewOnlyFields: ['spacing', 'typography-values'],
    sourceMutationAuthorized: false,
  },
  figmaWrites: [],
  options: [option('option-a'), option('option-b')],
};

function expectValid(value: unknown, label: string): void {
  const result = validateOptionPacket(value);
  if (!result.valid) throw new Error(`${label} was refused: ${JSON.stringify(result.errors)}`);
}

function expectInvalidWith(value: unknown, label: string, expectedMessage: string): void {
  const result = validateOptionPacket(value);
  if (result.valid) throw new Error(`${label} was incorrectly accepted`);
  const rendered = JSON.stringify(result.errors);
  if (!rendered.includes(expectedMessage)) {
    throw new Error(`${label} did not report ${expectedMessage}: ${rendered}`);
  }
}

expectValid(validPacket, 'complete comparable option packet');

const missingCompositionField = clone(validPacket);
delete (missingCompositionField.options[0].compositions.compact as Partial<typeof composition>).titleAlign;
expectInvalidWith(missingCompositionField, 'missing compact composition field', 'titleAlign');

const missingFixedProbe = clone(validPacket);
missingFixedProbe.options[0].probeIds = missingFixedProbe.options[0].probeIds.filter((probeId) => probeId !== '992');
expectInvalidWith(missingFixedProbe, 'missing exact 992 breakpoint probe', '992');

const missingLongContent = clone(validPacket);
missingLongContent.options[0].contentCases = ['default', 'long-cta'];
expectInvalidWith(missingLongContent, 'missing long-title case', 'long-title');

const missingTradeoff = clone(validPacket);
missingTradeoff.options[0].tradeoffs = [];
expectInvalidWith(missingTradeoff, 'missing explicit tradeoff', 'tradeoffs');

const tabletComposition = clone(validPacket);
(tabletComposition.options[0].compositions as Record<string, unknown>).tablet = clone(composition);
expectInvalidWith(tabletComposition, 'invented Tablet composition', 'tablet');

const figmaWrite = clone(validPacket);
figmaWrite.figmaWrites = ['2151:5552'];
expectInvalidWith(figmaWrite, 'non-authoritative packet with a Figma write', 'figmaWrites');

const previewPromoted = clone(validPacket);
previewPromoted.decisionScope.sourceMutationAuthorized = true;
expectInvalidWith(previewPromoted, 'layout preview promoted to source authority', 'layout-only H2');

const localTypography = clone(validPacket);
localTypography.options[0].compositions.compact.textStyleTokenPath = '{typography.titre-3}';
expectInvalidWith(localTypography, 'viewport-specific title substitution', 'Titre Hero vidéo');

const localButtonDelta = clone(validPacket);
localButtonDelta.options[0].compositions.compact.ctaTreatment.sizeDecision = 'owner-approved-delta';
expectInvalidWith(localButtonDelta, 'HeroVideo-owned Button size delta', 'intrinsic-width');

console.log('✔ HeroVideo option packet requires complete section layouts, fixed probes, long content, stable title/Button roles, three runtime states, and zero Figma write');
