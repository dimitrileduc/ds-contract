import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  compositionAt,
  fourWitnessFixtures,
  heroVideoFixtures,
  shortLandscapeFixture,
  thirteenWidthFixtures,
} from './responsive-fixtures.js';

type ValidationIssue = { path: string; message: string };
export type OptionPacketValidation = { valid: boolean; errors: ValidationIssue[] };

type RecordValue = Record<string, unknown>;

const FEATURE_ID = '027-responsive-hero-video';
const BASELINE_REF = 'specs/027-responsive-hero-video/decisions/H1-baseline.json';
const PACKET_PATH = fileURLToPath(new URL('../inventory/H2-option-packet.md', import.meta.url));
const HARNESS_PATH = fileURLToPath(new URL('../inventory/H2-option-harness.html', import.meta.url));
const DECISION_PATH = fileURLToPath(new URL('../decisions/H2-responsive.json', import.meta.url));

const PARTS = ['Background', 'VoileBas', 'VoileNavigation', 'Text', 'Text.Accroche', 'Bouton'] as const;
const ORDER = ['Background', 'VoileBas', 'VoileNavigation', 'Text', 'Bouton'] as const;
const REQUIRED_PROBES = [...thirteenWidthFixtures.map(({ viewportId }) => viewportId), shortLandscapeFixture.viewportId] as const;
const REQUIRED_CONTENT_CASES = ['default', 'long-title', 'long-cta'] as const;
const REQUIRED_MEDIA_CASES = ['poster', 'video-unavailable'] as const;
const REQUIRED_COMPOSITION_FIELDS = [
  'presentParts',
  'absentParts',
  'order',
  'axis',
  'align',
  'justify',
  'titleAlign',
  'heightStrategy',
  'spacing',
  'textStyleTokenPath',
  'ctaTreatment',
  'mediaTreatment',
  'shortLandscapeFallback',
  'figmaStrategy',
] as const;

const isRecord = (value: unknown): value is RecordValue => typeof value === 'object' && value !== null && !Array.isArray(value);
const nonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const stringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(nonEmptyString);

function issue(errors: ValidationIssue[], path: string, message: string): void {
  errors.push({ path, message });
}

function requireMembers(errors: ValidationIssue[], path: string, value: unknown, expected: readonly string[]): void {
  if (!stringArray(value)) {
    issue(errors, path, 'must be an array of non-empty strings');
    return;
  }
  expected.forEach((member) => {
    if (!value.includes(member)) issue(errors, path, `must include ${member}`);
  });
}

function validateComposition(errors: ValidationIssue[], path: string, value: unknown): void {
  if (!isRecord(value)) {
    issue(errors, path, 'must be a composition object');
    return;
  }
  REQUIRED_COMPOSITION_FIELDS.forEach((field) => {
    if (!(field in value)) issue(errors, `${path}.${field}`, `${field} is required`);
  });
  requireMembers(errors, `${path}.presentParts`, value.presentParts, PARTS);
  requireMembers(errors, `${path}.order`, value.order, ORDER);
  if (!Array.isArray(value.absentParts)) issue(errors, `${path}.absentParts`, 'must be an array');

  const spacing = value.spacing;
  if (!isRecord(spacing)) issue(errors, `${path}.spacing`, 'must be an object');
  else ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'gap'].forEach((field) => {
    if (!nonEmptyString(spacing[field])) issue(errors, `${path}.spacing.${field}`, `${field} is required`);
  });

  const cta = value.ctaTreatment;
  if (!isRecord(cta) || cta.reuseCurrentButton !== true || cta.variant !== 'Outline blanc' || cta.sizeDecision !== 'unchanged' || !Array.isArray(cta.impactRefs) || cta.impactRefs.length !== 0) {
    issue(errors, `${path}.ctaTreatment`, 'must preserve the current intrinsic-width Outline blanc Button without a local size delta');
  }
  if (value.textStyleTokenPath !== '{typography.titre-hero-video}') issue(errors, `${path}.textStyleTokenPath`, 'must preserve the semantic Titre Hero vidéo role; responsive values are deferred');
  const media = value.mediaTreatment;
  if (!isRecord(media) || media.posterPolicy !== 'preserve-owner-poster' || media.fit !== 'cover' || !nonEmptyString(media.cropDecision) || !nonEmptyString(media.secondAsset)) {
    issue(errors, `${path}.mediaTreatment`, 'must preserve the owner poster using cover and explicit crop/asset decisions');
  }
}

export function validateOptionPacket(value: unknown): OptionPacketValidation {
  const errors: ValidationIssue[] = [];
  if (!isRecord(value)) return { valid: false, errors: [{ path: '$', message: 'option packet must be an object' }] };

  if (value.schemaVersion !== '1.0.0') issue(errors, '$.schemaVersion', 'must be 1.0.0');
  if (value.featureId !== FEATURE_ID) issue(errors, '$.featureId', `must be ${FEATURE_ID}`);
  if (value.authority !== 'non-authoritative') issue(errors, '$.authority', 'must be non-authoritative');
  if (!Array.isArray(value.figmaWrites) || value.figmaWrites.length !== 0) issue(errors, '$.figmaWrites', 'must remain empty');
  const decisionScope = value.decisionScope;
  if (!isRecord(decisionScope) || decisionScope.sourceMutationAuthorized !== false) issue(errors, '$.decisionScope.sourceMutationAuthorized', 'must be false for layout-only H2');
  else {
    requireMembers(errors, '$.decisionScope.authoritativeFields', decisionScope.authoritativeFields, ['structure', 'breakpoint-profile', 'semantic-roles']);
    requireMembers(errors, '$.decisionScope.previewOnlyFields', decisionScope.previewOnlyFields, ['spacing', 'typography-values']);
  }

  const options = value.options;
  if (!Array.isArray(options) || options.length < 2 || options.length > 3) {
    issue(errors, '$.options', 'must contain two or three comparable options');
  } else {
    const ids = new Set<string>();
    options.forEach((candidate, index) => {
      const path = `$.options.${index}`;
      if (!isRecord(candidate)) {
        issue(errors, path, 'must be an option object');
        return;
      }
      if (!nonEmptyString(candidate.optionId)) issue(errors, `${path}.optionId`, 'optionId is required');
      else if (ids.has(candidate.optionId)) issue(errors, `${path}.optionId`, 'optionId must be unique');
      else ids.add(candidate.optionId);
      ['label', 'summary'].forEach((field) => {
        if (!nonEmptyString(candidate[field])) issue(errors, `${path}.${field}`, `${field} is required`);
      });

      const compositions = candidate.compositions;
      if (!isRecord(compositions)) issue(errors, `${path}.compositions`, 'must be an object');
      else {
        if ('tablet' in compositions) issue(errors, `${path}.compositions.tablet`, 'tablet is forbidden; 834 uses compact');
        validateComposition(errors, `${path}.compositions.compact`, compositions.compact);
        validateComposition(errors, `${path}.compositions.desktop`, compositions.desktop);
        const wide = compositions.wide;
        if (!isRecord(wide) || wide.baselineRef !== BASELINE_REF) issue(errors, `${path}.compositions.wide`, 'must reference the accepted H1 wide baseline');
      }

      requireMembers(errors, `${path}.probeIds`, candidate.probeIds, REQUIRED_PROBES);
      requireMembers(errors, `${path}.contentCases`, candidate.contentCases, REQUIRED_CONTENT_CASES);
      requireMembers(errors, `${path}.mediaCases`, candidate.mediaCases, REQUIRED_MEDIA_CASES);
      if (!stringArray(candidate.tradeoffs) || candidate.tradeoffs.length === 0) issue(errors, `${path}.tradeoffs`, 'tradeoffs must contain at least one explicit entry');
      if (!stringArray(candidate.limits) || candidate.limits.length === 0) issue(errors, `${path}.limits`, 'limits must contain at least one explicit entry');
    });
  }
  return { valid: errors.length === 0, errors };
}

const mediaTreatment = {
  posterPolicy: 'preserve-owner-poster',
  fit: 'cover',
  cropDecision: 'preserve-current',
  secondAsset: 'none',
} as const;

const ctaTreatment = {
  reuseCurrentButton: true,
  variant: 'Outline blanc',
  sizeDecision: 'unchanged',
  impactRefs: [],
} as const;

function composition(values: {
  axis: 'row' | 'column';
  align: 'start' | 'center' | 'end';
  justify: 'start' | 'center' | 'end';
  titleAlign: 'left' | 'center';
  padding: '{space.24}' | '{space.32}' | '{space.48}' | '{space.64}';
  gap: '{space.16}' | '{space.24}' | '{space.32}';
  textStyleTokenPath: '{typography.titre-hero-video}';
  figmaStrategy: 'modes' | 'variant';
  notes: string[];
}) {
  return {
    presentParts: [...PARTS],
    absentParts: [] as string[],
    order: [...ORDER],
    axis: values.axis,
    align: values.align,
    justify: values.justify,
    titleAlign: values.titleAlign,
    heightStrategy: 'visible-viewport-min-content',
    spacing: {
      paddingTop: values.padding,
      paddingRight: values.padding,
      paddingBottom: values.padding,
      paddingLeft: values.padding,
      gap: values.gap,
      contentMaxWidth: 'none',
    },
    textStyleTokenPath: values.textStyleTokenPath,
    ctaTreatment: { ...ctaTreatment, impactRefs: [...ctaTreatment.impactRefs] },
    mediaTreatment: { ...mediaTreatment },
    shortLandscapeFallback: 'grow-with-content',
    figmaStrategy: values.figmaStrategy,
    notes: values.notes,
  } as const;
}

function optionBase(optionId: string, label: string, summary: string, compact: ReturnType<typeof composition>, desktop: ReturnType<typeof composition>, tradeoffs: string[], limits: string[]) {
  return {
    optionId,
    label,
    summary,
    compositions: {
      compact,
      desktop,
      wide: { baselineRef: BASELINE_REF },
    },
    probeIds: [...REQUIRED_PROBES],
    contentCases: [...REQUIRED_CONTENT_CASES],
    mediaCases: [...REQUIRED_MEDIA_CASES],
    tradeoffs,
    limits,
  };
}

export function buildOptionPacket() {
  const options = [
    optionBase(
      'continuite-wide',
      'Continuité avec le wide',
      'Compact centré pour la lisibilité ; Desktop conserve la ligne basse du Hero XL avec des valeurs resserrées.',
      composition({
        axis: 'column', align: 'center', justify: 'center', titleAlign: 'center', padding: '{space.24}', gap: '{space.16}',
        textStyleTokenPath: '{typography.titre-hero-video}', figmaStrategy: 'variant',
        notes: ['Le CTA suit le titre dans le flux compact.', 'Le contenu grandit au-delà de la hauteur visible si nécessaire.'],
      }),
      composition({
        axis: 'row', align: 'end', justify: 'start', titleAlign: 'left', padding: '{space.48}', gap: '{space.24}',
        textStyleTokenPath: '{typography.titre-hero-video}', figmaStrategy: 'modes',
        notes: ['La relation titre à gauche / CTA à droite reste proche du baseline 1728.', 'Le titre long peut prendre plusieurs lignes.'],
      }),
      ['La continuité XL est maximale, mais le Desktop 1200 reste plus dense avec le CTA sur la même ligne.'],
      ['Le titre ou CTA exceptionnellement long peut augmenter la hauteur à 1200 ; aucun contenu n’est masqué.'],
    ),
    optionBase(
      'pile-editoriale',
      'Pile éditoriale en bas',
      'Titre et CTA restent groupés en bas à gauche en compact et Desktop pour absorber les contenus longs.',
      composition({
        axis: 'column', align: 'start', justify: 'end', titleAlign: 'left', padding: '{space.24}', gap: '{space.16}',
        textStyleTokenPath: '{typography.titre-hero-video}', figmaStrategy: 'variant',
        notes: ['Le groupe reste ancré en bas à gauche.', 'Le CTA passe sous le titre et ne concurrence jamais sa largeur.'],
      }),
      composition({
        axis: 'column', align: 'start', justify: 'end', titleAlign: 'left', padding: '{space.48}', gap: '{space.24}',
        textStyleTokenPath: '{typography.titre-hero-video}', figmaStrategy: 'variant',
        notes: ['Le Desktop reprend la même lecture éditoriale que compact.', 'Le passage wide restaure le baseline horizontal historique.'],
      }),
      ['La robustesse aux contenus longs est maximale, au prix d’un changement de composition visible à 1400px.'],
      ['La pile occupe davantage de hauteur du poster et demande une revue attentive du contraste sur la zone basse.'],
    ),
    optionBase(
      'centre-immersif',
      'Centrage immersif',
      'Titre et CTA forment un groupe centré sur le poster jusqu’à 1399px ; le wide historique reste inchangé.',
      composition({
        axis: 'column', align: 'center', justify: 'center', titleAlign: 'center', padding: '{space.24}', gap: '{space.24}',
        textStyleTokenPath: '{typography.titre-hero-video}', figmaStrategy: 'variant',
        notes: ['Le groupe est centré horizontalement et verticalement.', 'Le paysage court grandit avec le contenu au lieu de scroller.'],
      }),
      composition({
        axis: 'column', align: 'center', justify: 'center', titleAlign: 'center', padding: '{space.48}', gap: '{space.24}',
        textStyleTokenPath: '{typography.titre-hero-video}', figmaStrategy: 'variant',
        notes: ['La composition conserve le même geste entre Mobile et Desktop.', 'Le wide rétablit le contenu horizontal en bas.'],
      }),
      ['La lecture est très claire et homogène, mais s’éloigne le plus de l’ancrage bas du Hero actuel.'],
      ['Le centrage peut recouvrir le point d’intérêt du poster ; aucun recadrage ou second asset n’est autorisé sans nouveau choix owner.'],
    ),
  ];

  return {
    schemaVersion: '1.0.0',
    featureId: FEATURE_ID,
    authority: 'non-authoritative',
    baselineRef: BASELINE_REF,
    profile: { id: 'piqueray-odoo19-992-1400', compact: '<992', desktop: '992-1399', wide: '>=1400' },
    decisionScope: {
      authoritativeFields: ['structure', 'breakpoint-profile', 'semantic-roles'],
      previewOnlyFields: ['spacing', 'typography-values'],
      sourceMutationAuthorized: false,
    },
    figmaWrites: [] as string[],
    fixtures: heroVideoFixtures.map(({ fixtureId, contentCase, mediaCase }) => ({ fixtureId, contentCase, mediaCase })),
    witnesses: fourWitnessFixtures,
    options,
  };
}

function renderComposition(value: ReturnType<typeof composition>): string {
  return `${value.axis}; ${value.align}/${value.justify}; titre ${value.titleAlign}; padding preview ${value.spacing.paddingTop}; gap preview ${value.spacing.gap}`;
}

export function renderOptionPacketMarkdown(packet: ReturnType<typeof buildOptionPacket>): string {
  const lines = [
    '# H2 — Directions de layout responsive HeroVideo',
    '',
    '**Autorité :** aide locale non autoritative · **Figma/Page writes :** 0 · **Baseline wide :** H1 accepté',
    '',
    'Le profil est fixe : compact `<992`, Desktop `992–1399`, wide `>=1400`. Tablet 834 est un témoin compact, jamais une quatrième composition. Le poster façade, les deux voiles et le Button actuel sont conservés dans toutes les options.',
    '',
    'Le [harness visuel local](H2-option-harness.html) permet de changer d’option, de fixture et de largeur. Les aperçus ci-dessous sont des aides à la décision structurelle : leurs tailles de texte, paddings et gaps sont des previews modifiables, jamais une mutation Figma ni une future référence de production.',
    '',
    '## Direction owner enregistrée',
    '',
    '**Option 3 — Centrage immersif** est retenue pour le layout uniquement : groupe titre–CTA en colonne, centré horizontalement et verticalement en compact et Desktop, puis baseline wide historique. Cette sélection autorise seulement le handoff vers la future spec transverse de fondation et aucune écriture source.',
    '',
    '## Règle CTA commune',
    '',
    'Le composant Button reste strictement inchangé : variante `Outline blanc`, typographie, padding, icônes et largeur intrinsèque ajustée au texte. HeroVideo décide seulement de son placement et de son alignement. Un éventuel besoin de pleine largeur ou de retour à la ligne est relevé par le cas long, puis différé à la passe transverse du Button.',
    '',
    '## Règle typographique commune',
    '',
    'Le titre conserve le rôle sémantique `{typography.titre-hero-video}`. Le harness utilise 44/48 comme preview initiale, mais l’agent peut la modifier pour éprouver le layout. Aucune taille simulée n’entre dans H2 ou Figma source ; la future échelle typographique responsive sera décidée globalement, sans substitution locale par `Titre2` ou `Titre3`.',
    '',
    '## Règle de spacing commune',
    '',
    'Les paddings et gaps affichés servent uniquement à rendre et stress-tester les options. Ils ne sont pas validés dans H2, ne seront pas écrits dans Figma et peuvent varier tant que la direction de layout reste robuste. La future spec transverse décidera entre primitives stables et rôles sémantiques multi-modes à partir de plusieurs composants.',
    '',
    '## Comparaison rapide',
    '',
    '| Option | Compact | Desktop | Wide | Arbitrage principal |',
    '|---|---|---|---|---|',
    ...packet.options.map((option) => `| **${option.label}** | ${renderComposition(option.compositions.compact)} | ${renderComposition(option.compositions.desktop)} | Baseline H1 inchangé | ${option.tradeoffs[0]} |`),
    '',
  ];

  packet.options.forEach((option, index) => {
    lines.push(
      `## ${index + 1}. ${option.label} \`${option.optionId}\``,
      '',
      option.summary,
      '',
      `<p><img src="../proofs/H2-option-visuals/${option.optionId}-390-default.png" alt="${option.label} à 390 px" width="390"> <img src="../proofs/H2-option-visuals/${option.optionId}-1200-default.png" alt="${option.label} à 1200 px" width="600"></p>`,
      '',
      '| Champ | Compact | Desktop | Wide |',
      '|---|---|---|---|',
      `| Axe | ${option.compositions.compact.axis} | ${option.compositions.desktop.axis} | row historique |`,
      `| Alignement | ${option.compositions.compact.align} / ${option.compositions.compact.justify} | ${option.compositions.desktop.align} / ${option.compositions.desktop.justify} | end / start historique |`,
      `| Titre | ${option.compositions.compact.titleAlign}, ${option.compositions.compact.textStyleTokenPath} | ${option.compositions.desktop.titleAlign}, ${option.compositions.desktop.textStyleTokenPath} | Titre Hero vidéo 44/48 |`,
      `| Preview spacing — non validé | padding ${option.compositions.compact.spacing.paddingTop}, gap ${option.compositions.compact.spacing.gap} | padding ${option.compositions.desktop.spacing.paddingTop}, gap ${option.compositions.desktop.spacing.gap} | baseline 48/89, gap 10 |`,
      `| Faible hauteur | ${option.compositions.compact.shortLandscapeFallback} | ${option.compositions.desktop.shortLandscapeFallback} | baseline |`,
      `| Figma explicite | ${option.compositions.compact.figmaStrategy} | ${option.compositions.desktop.figmaStrategy} | membre historique |`,
      '',
      '**Arbitrage :**',
      '',
      ...option.tradeoffs.map((item) => `- ${item}`),
      '',
      '**Limite :**',
      '',
      ...option.limits.map((item) => `- ${item}`),
      '',
    );
  });

  lines.push(
    '## Probes communes',
    '',
    '| Probe | Viewport | Composition attendue | Témoin/frontière |',
    '|---|---:|---|---|',
    ...[...thirteenWidthFixtures, shortLandscapeFixture].map((probe) => {
      const marker = 'witnessId' in probe && probe.witnessId ? probe.witnessId : ('boundaryId' in probe && probe.boundaryId ? probe.boundaryId : 'contrôle');
      return `| ${probe.viewportId} | ${probe.width}×${probe.height} | ${compositionAt(probe.width)} | ${marker} |`;
    }),
    '',
    'Cas joués pour chaque option : `default`, `long-title`, `long-cta`, `poster`, `video-unavailable` et `short-landscape-844x390`. Un échec du CTA long signale un besoin pour la future passe Button ; il n’autorise aucun correctif local. Aucun scroll interne, contenu masqué, asset mobile, changement Button ou crop spécifique n’est inclus.',
    '',
    '## Gate H2 attendu',
    '',
    'La direction option 3 est enregistrée pour le layout uniquement. H2 autorise maintenant la préparation de la spec transverse spacing/typographie/atoms. La campagne Figma, le contrat, le web et Odoo restent interdits tant que cette dépendance n’est pas approuvée et liée.',
    '',
  );
  return `${lines.join('\n')}\n`;
}

function serializeForInlineScript(value: unknown): string {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

export function renderOptionHarnessHtml(packet: ReturnType<typeof buildOptionPacket>): string {
  const defaultFixture = heroVideoFixtures.find(({ fixtureId }) => fixtureId === 'default-poster') ?? heroVideoFixtures[0];
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>H2 HeroVideo — harness non autoritatif</title>
  <style>
    @font-face { font-family: Montserrat; src: url('/node_modules/@fontsource/montserrat/files/montserrat-latin-400-normal.woff2') format('woff2'); font-weight: 400; font-display: swap; }
    @font-face { font-family: Montserrat; src: url('/node_modules/@fontsource/montserrat/files/montserrat-latin-500-normal.woff2') format('woff2'); font-weight: 500; font-display: swap; }
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; min-width: 0; background: #101820; color: #fff; font-family: Montserrat, Arial, sans-serif; }
    .hero { position: relative; display: flex; width: 100%; min-width: 0; overflow: hidden; background: #27343e; }
    .hero__poster, .hero__scrim-bottom, .hero__scrim-top { position: absolute; inset: 0; width: 100%; height: 100%; }
    .hero__poster { z-index: 0; object-fit: cover; }
    .hero__scrim-bottom { z-index: 1; pointer-events: none; background: linear-gradient(to bottom, rgba(0,0,0,0) 55%, rgba(0,0,0,.72) 100%); }
    .hero__scrim-top { z-index: 1; pointer-events: none; background: linear-gradient(to top, rgba(0,0,0,0) 75%, rgba(0,0,0,.5) 100%); }
    .hero__text { position: relative; z-index: 2; min-width: 0; }
    .hero__title { display: block; width: 100%; margin: 0; color: #fff; overflow-wrap: anywhere; }
    .hero__cta { position: relative; z-index: 2; display: inline-flex; flex: 0 0 auto; align-items: center; justify-content: center; border: 0; box-shadow: inset 0 0 0 2px #fff; background: transparent; color: #fff; padding: 16px 32px; font: 500 16px/22px Montserrat, Arial, sans-serif; text-transform: uppercase; text-align: center; white-space: nowrap; }
    .evidence { position: fixed; z-index: 20; left: 12px; top: 12px; max-width: calc(100vw - 24px); padding: 7px 10px; border: 1px solid rgba(255,255,255,.35); border-radius: 4px; background: rgba(10,18,25,.78); color: #fff; font: 500 11px/15px Montserrat, Arial, sans-serif; backdrop-filter: blur(6px); }
    .controls { position: fixed; z-index: 21; right: 12px; top: 12px; display: grid; gap: 8px; width: min(340px, calc(100vw - 24px)); padding: 12px; border: 1px solid rgba(255,255,255,.25); background: rgba(10,18,25,.9); }
    .controls strong { font-size: 13px; }
    .controls label { display: grid; grid-template-columns: 78px 1fr; align-items: center; gap: 8px; font-size: 11px; }
    .controls select { width: 100%; padding: 6px; border: 1px solid #80909d; background: #fff; color: #101820; font: 12px Montserrat, Arial, sans-serif; }
    body[data-clean='true'] .controls { display: none; }
    @media (max-width: 640px) { body:not([data-clean='true']) .evidence { top: auto; bottom: 12px; } }
  </style>
</head>
<body>
  <main>
    <section id="hero" class="hero" aria-label="Aperçu HeroVideo non autoritatif">
      <img id="poster" class="hero__poster" data-part="Background" alt="" src="/${defaultFixture.poster}">
      <div class="hero__scrim-bottom" data-part="VoileBas"></div>
      <div class="hero__scrim-top" data-part="VoileNavigation"></div>
      <div class="hero__text" data-part="Text"><h1 id="title" class="hero__title" data-part="Text.Accroche">${defaultFixture.title}</h1></div>
      <button id="cta" class="hero__cta" data-part="Bouton" type="button">${defaultFixture.ctaLabel}</button>
    </section>
  </main>
  <div id="evidence" class="evidence"></div>
  <form class="controls" aria-label="Contrôles du harness">
    <strong>H2 — aide locale, 0 write</strong>
    <label>Option <select id="option"></select></label>
    <label>Fixture <select id="fixture"></select></label>
  </form>
  <script>
    const packet = ${serializeForInlineScript(packet)};
    const fixtures = ${serializeForInlineScript(heroVideoFixtures)};
    const baseline = {
      axis: 'row', align: 'end', justify: 'start', titleAlign: 'left',
      spacing: { paddingTop: '48px', paddingRight: '89px', paddingBottom: '48px', paddingLeft: '89px', gap: '10px' },
      textStyleTokenPath: '{typography.titre-hero-video}', heightStrategy: 'fixed', shortLandscapeFallback: 'baseline'
    };
    const params = new URLSearchParams(location.search);
    const optionSelect = document.querySelector('#option');
    const fixtureSelect = document.querySelector('#fixture');
    const hero = document.querySelector('#hero');
    const title = document.querySelector('#title');
    const cta = document.querySelector('#cta');
    const poster = document.querySelector('#poster');
    const evidence = document.querySelector('#evidence');
    const compositionAt = (width) => width >= 1400 ? 'wide' : width >= 992 ? 'desktop' : 'compact';
    const tokenPx = (value) => Number(String(value).match(/(\\d+)/)?.[1] ?? 0);
    const flex = (value) => value === 'start' ? 'flex-start' : value === 'end' ? 'flex-end' : value;
    const setOptions = (select, values, selected, label) => {
      select.innerHTML = values.map((value) => '<option value="' + value.id + '"' + (value.id === selected ? ' selected' : '') + '>' + label(value) + '</option>').join('');
    };
    const chosenOptionId = params.get('option') || 'centre-immersif';
    const chosenFixtureId = params.get('fixture') || 'default-poster';
    setOptions(optionSelect, packet.options.map((value) => ({ id: value.optionId, value })), chosenOptionId, ({ value }) => value.label);
    setOptions(fixtureSelect, fixtures.map((value) => ({ id: value.fixtureId, value })), chosenFixtureId, ({ value }) => value.fixtureId);
    document.body.dataset.clean = String(params.get('clean') === '1');

    function apply() {
      const option = packet.options.find(({ optionId }) => optionId === optionSelect.value) || packet.options[0];
      const fixture = fixtures.find(({ fixtureId }) => fixtureId === fixtureSelect.value) || fixtures[0];
      const compositionId = compositionAt(innerWidth);
      const composition = compositionId === 'wide' ? baseline : option.compositions[compositionId];
      const row = composition.axis === 'row';
      hero.dataset.option = option.optionId;
      hero.dataset.fixture = fixture.fixtureId;
      hero.dataset.composition = compositionId;
      hero.style.flexDirection = composition.axis;
      hero.style.alignItems = flex(composition.align);
      hero.style.justifyContent = flex(composition.justify);
      hero.style.gap = tokenPx(composition.spacing.gap) + 'px';
      hero.style.paddingTop = tokenPx(composition.spacing.paddingTop) + 'px';
      hero.style.paddingRight = tokenPx(composition.spacing.paddingRight) + 'px';
      hero.style.paddingBottom = tokenPx(composition.spacing.paddingBottom) + 'px';
      hero.style.paddingLeft = tokenPx(composition.spacing.paddingLeft) + 'px';
      hero.style.height = compositionId === 'wide' ? '720px' : 'auto';
      hero.style.minHeight = compositionId === 'wide' ? '720px' : '100svh';
      title.style.textAlign = composition.titleAlign;
      title.style.fontSize = '44px';
      title.style.lineHeight = '48px';
      title.style.fontWeight = '400';
      document.querySelector('.hero__text').style.flex = row ? (compositionId === 'wide' ? '1 1 auto' : '1 1 0%') : '0 1 auto';
      document.querySelector('.hero__text').style.width = row ? '100%' : '100%';
      title.textContent = fixture.title;
      cta.textContent = fixture.ctaLabel;
      poster.src = '/' + fixture.poster;
      evidence.textContent = option.label + ' · ' + innerWidth + '×' + innerHeight + ' · ' + compositionId + ' · ' + fixture.fixtureId + ' · non autoritatif';
      document.title = option.label + ' — ' + innerWidth + 'px — ' + fixture.fixtureId;
    }

    function intersects(a, b) {
      return !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
    }

    function textBounds(element) {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getBoundingClientRect();
    }

    function contained(inner, outer, tolerance = 2) {
      return inner.left >= outer.left - tolerance && inner.right <= outer.right + tolerance && inner.top >= outer.top - tolerance && inner.bottom <= outer.bottom + tolerance;
    }

    window.__H2_HARNESS__ = {
      apply,
      getState() {
        const titleRect = title.getBoundingClientRect();
        const ctaRect = cta.getBoundingClientRect();
        const heroRect = hero.getBoundingClientRect();
        const posterRect = poster.getBoundingClientRect();
        const titleContentRect = textBounds(title);
        const ctaContentRect = textBounds(cta);
        return {
          optionId: hero.dataset.option,
          fixtureId: hero.dataset.fixture,
          compositionId: hero.dataset.composition,
          viewport: { width: innerWidth, height: innerHeight },
          hero: { width: heroRect.width, height: heroRect.height },
          horizontalOverflowPx: Math.max(0, document.documentElement.scrollWidth - innerWidth),
          titleComplete: contained(titleContentRect, heroRect),
          ctaComplete: contained(ctaContentRect, ctaRect),
          titleCtaOverlap: intersects(titleRect, ctaRect),
          contentWithinHero: [titleRect, ctaRect].every((rect) => rect.left >= heroRect.left - 1 && rect.right <= heroRect.right + 1 && rect.top >= heroRect.top - 1 && rect.bottom <= heroRect.bottom + 1),
          mediaCoversHero: Math.abs(posterRect.width - heroRect.width) <= 1 && Math.abs(posterRect.height - heroRect.height) <= 1,
          posterLoaded: poster.complete && poster.naturalWidth > 0,
          fontLoaded: document.fonts.status === 'loaded',
          partCount: hero.querySelectorAll('[data-part]').length,
          figmaWrites: packet.figmaWrites,
        };
      },
    };
    optionSelect.addEventListener('change', () => { params.set('option', optionSelect.value); history.replaceState(null, '', '?' + params); apply(); });
    fixtureSelect.addEventListener('change', () => { params.set('fixture', fixtureSelect.value); history.replaceState(null, '', '?' + params); apply(); });
    addEventListener('resize', apply);
    document.fonts.ready.then(apply);
    apply();
  </script>
</body>
</html>`;
}

function decisionComposition(value: ReturnType<typeof composition>) {
  const { absentParts: _absentParts, spacing: _previewSpacing, ...decisionValue } = value;
  return decisionValue;
}

export function buildOwnerLayoutDecision(packet: ReturnType<typeof buildOptionPacket>) {
  const evidenceRefs = [
    'specs/027-responsive-hero-video/inventory/H2-option-harness.html',
    'specs/027-responsive-hero-video/proofs/H2-option-harness.json',
    'specs/027-responsive-hero-video/inventory/H2-option-packet.md#probes-communes',
    'specs/027-responsive-hero-video/inventory/H2-option-packet.md#1-continuite-avec-le-wide-continuite-wide',
    'specs/027-responsive-hero-video/inventory/H2-option-packet.md#2-pile-editoriale-en-bas-pile-editoriale',
    'specs/027-responsive-hero-video/inventory/H2-option-packet.md#3-centrage-immersif-centre-immersif',
  ];
  const selectedOption = packet.options.find(({ optionId }) => optionId === 'centre-immersif');
  if (!selectedOption) throw new Error('Owner-selected centre-immersif option is missing');
  const selectedCompositions = {
    compact: decisionComposition(selectedOption.compositions.compact),
    desktop: decisionComposition(selectedOption.compositions.desktop),
  };
  return {
    schemaVersion: '2.0.0',
    featureId: FEATURE_ID,
    decisionId: 'H2-responsive-v1',
    baselineRef: BASELINE_REF,
    status: 'approved',
    profile: { id: 'piqueray-odoo19-992-1400', basis: 'viewport-width', source: 'odoo-bootstrap-19-subset' },
    breakpoints: [
      { id: 'desktop-start', minWidthPx: 992, operator: 'min-width', probeEvidenceRefs: ['991', '992', '993'] },
      { id: 'wide-start', minWidthPx: 1400, operator: 'min-width', probeEvidenceRefs: ['1399', '1400', '1401'] },
    ],
    designWitnesses: [
      { witnessId: 'mobile-390', widthPx: 390, compositionId: 'compact' },
      { witnessId: 'tablet-834', widthPx: 834, compositionId: 'compact' },
      { witnessId: 'desktop-1200', widthPx: 1200, compositionId: 'desktop' },
      { witnessId: 'wide-1728', widthPx: 1728, compositionId: 'wide' },
    ],
    options: packet.options.map((option) => ({
      optionId: option.optionId,
      label: option.label,
      summary: option.summary,
      compositions: {
        compact: decisionComposition(option.compositions.compact),
        desktop: decisionComposition(option.compositions.desktop),
      },
      boundaryProbeRefs: ['991', '992', '993', '1399', '1400', '1401'],
      evidenceRefs,
      tradeoffs: option.tradeoffs,
      limits: option.limits,
    })),
    selectedOptionId: selectedOption.optionId,
    approvedCompositions: selectedCompositions,
    decision: {
      decisionMaker: 'owner',
      decidedAt: '2026-08-25T18:33:17Z',
      evidenceRefs: [
        'specs/027-responsive-hero-video/inventory/H2-option-packet.md#direction-owner-enregistree',
        'specs/027-responsive-hero-video/inventory/H2-option-harness.html',
      ],
      acceptedTradeoffs: [
        'Option 3 is accepted for structure only; preview spacing and typography remain non-authoritative and no source mutation is authorized.',
      ],
    },
    foundationDependency: {
      status: 'pending',
      requiredTopics: [
        'responsive-spacing',
        'responsive-typography',
        'responsive-child-components',
      ],
    },
    authorizes: 'transverse-foundation-handoff',
    rejectedTopics: [
      'A fourth Tablet composition; 834 remains a compact witness.',
      'A consumer-controlled viewport or responsive prop.',
      'Treating any preview spacing or typography value as an approved HeroVideo source value.',
      'A second mobile poster, crop change or local Button size/variant/wrapping/full-width delta.',
    ],
    deferredTopics: [
      'Restore the Home CTA Text Style link at T020A under distinct Page authorization before any responsive Figma write.',
      'Define responsive values for the semantic Titre Hero vidéo role during the transverse typography pass; H2 preserves the role only.',
      'Assess long-label wrapping or full-width behavior during the transverse Button pass; H2 preserves the current intrinsic-width Button.',
      'Define responsive section spacing from multi-component evidence; the H2 padding and gap values are preview-only.',
    ],
  };
}

export function main(): void {
  const packet = buildOptionPacket();
  const validation = validateOptionPacket(packet);
  if (!validation.valid) {
    console.error(JSON.stringify(validation.errors, null, 2));
    process.exitCode = 1;
    return;
  }
  writeFileSync(PACKET_PATH, renderOptionPacketMarkdown(packet));
  writeFileSync(HARNESS_PATH, renderOptionHarnessHtml(packet));
  writeFileSync(DECISION_PATH, `${JSON.stringify(buildOwnerLayoutDecision(packet), null, 2)}\n`);
  console.log(`HeroVideo H2 packet generated: ${packet.options.length} options, ${REQUIRED_PROBES.length} probes, visual harness, figmaWrites=0`);
  console.log(PACKET_PATH);
  console.log(HARNESS_PATH);
  console.log(DECISION_PATH);
}

if (fileURLToPath(import.meta.url) === process.argv[1]) main();
