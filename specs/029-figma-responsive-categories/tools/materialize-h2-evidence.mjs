import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('specs/029-figma-responsive-categories');
const read = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const writeJson = (relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`);
const writeText = (relative, value) => fs.writeFileSync(path.join(root, relative), `${value.trim()}\n`);

const work = read('proofs/H2-work-frames.bridge.json');
const normalized = read('proofs/H2-normalize-content-rows.bridge.json');
const verify = read('proofs/H2-read-only-verify.bridge.json');
const final = read('proofs/H2-finalize-approved-option-a.bridge.json');
const bindings = read('inventory/H2-bindings.json');
const typography = read('inventory/H2-typography.json');

const matrixFrames = work.frames.filter((frame) => frame.scenarioId.startsWith('matrix-'));
if (matrixFrames.length !== 24 || work.frames.length !== 28) throw new Error('H2 materialization refused: technical frame count drift');
if (!Object.values(verify.checks).every(Boolean)) throw new Error('H2 materialization refused: final read-only checks are not all green');
if (!final.inspection.approvedWitnessIsTrueSize || final.approvedBoard.acceptedFrameWidth !== 834 || final.approvedBoard.reviewScale !== 1) {
  throw new Error('H2 materialization refused: approved witness is not 834 px at 1:1');
}
if (bindings.missingPrimitiveIds.length || bindings.bindingCount !== bindings.bindings.length) throw new Error('H2 materialization refused: binding evidence drift');
if (typography.typographyOverrides.length || typography.pendingResponsiveTextStyle.length) throw new Error('H2 materialization refused: unexpected responsive typography override');

const technicalRows = work.frames.map((frame) => `| \`${frame.scenarioId}\` | \`${frame.frameId}\` | ${frame.width} | ${frame.presentation} | ${frame.configuredColumns} | ${frame.fixtureId} |`).join('\n');

writeText('inventory/H2-work-frames.md', `
# H2 — État final des frames de travail Figma

Statut : H2 approuvé et nettoyé.

## Surface owner visible

La section \`${final.workArea.nodeId}\`, « ${final.workArea.name} », contient un seul board visible :

- board approuvé : \`${final.approvedBoard.nodeId}\` — « ${final.approvedBoard.name} » ;
- témoin approuvé : \`${final.approvedBoard.acceptedFrameNodeId}\` ;
- largeur réelle : **${final.approvedBoard.acceptedFrameWidth} px** ;
- échelle : **1:1** ;
- composition actuelle concernée : 3 colonnes, style Empilé, 1 usage sur 7 ;
- choix : Option 1 / A, la carte orpheline conserve la largeur d'une piste.

Les anciennes planches de miniatures \`${final.figmaWrites.removedPriorReviewRootIds.join('`, `')}\` ont été supprimées. Elles étaient des copies de revue jetables; leurs sources exactes restent récupérables dans l'archive technique.

Les 6 usages en 2 colonnes ne diffèrent pas entre les options et ne sont donc pas dupliqués sur la surface de décision.

## Option rejetée

L'option B n'est plus visible. Sa source \`${final.rejectedOptionDisposition.sourceFrameNodeId}\` / \`${final.rejectedOptionDisposition.sourceScenarioId}\` reste dans l'archive masquée pour traçabilité.

## Archive technique

La section \`${final.technicalArchive.nodeId}\`, « ${final.technicalArchive.name} », est masquée et conserve les ${final.technicalArchive.frameCount} témoins 1:1 :

| Scénario | Node ID | Largeur | Présentation | Colonnes desktop | Fixture |
| --- | --- | ---: | --- | ---: | --- |
${technicalRows}

## Frontières

- masters gouvernés : inchangés ;
- sept usages Page : inchangés ;
- enfants et dépendances partagés : inchangés ;
- Page writes : aucun ;
- thumbnails responsive visibles : aucun.

Preuves : \`proofs/H2-finalize-approved-option-a.bridge.json\`, \`proofs/H2-read-only-verify.bridge.json\`, \`proofs/H2-owner-approved/option-a-834-real-size.png\`.
`);

writeText('inventory/H2-grid-cases.md', `
# H2 — Décisions finales de grille et médias

## Ligne orpheline 3 colonnes à 834 px

Décision owner : **Option 1 / A — preserve-track**. La troisième carte conserve la largeur d'une piste et reste alignée à gauche. L'option B, qui étirait cette carte, est rejetée et archivée.

Le seul usage actuel 3 colonnes est Empilé. Les 6 autres usages sont en 2 colonnes et ne changent pas entre A et B.

## Étendue de la carte

Décision owner : **adaptation interne uniquement**. Les ${normalized.rows.length} lignes démontrent que Fill/Hug, wrap et croissance verticale suffisent : hauteurs de ligne égales, texte entièrement contenu, aucun nouvel état ni variant responsive.

## Nombre de cartes et médias

- Nombre de cartes différent des colonnes : la dernière carte conserve une largeur de piste, cohérente avec l'option A.
- Empilé sans image : l'image est masquée; contenu et CTA restent accessibles.
- Rapport média atypique : crop \`IMAGE/FILL\` conservé.
- Superposé : un média est requis; sans média, l'auteur choisit Empilé. Aucun fallback silencieux n'est inventé.

Preuves : \`proofs/H2-options/odd-count-preserve.png\`, \`proofs/H2-options/media-edges.png\`, \`proofs/H2-normalize-content-rows.bridge.json\`.
`);

const technicalCaptures = work.exportManifest.map((capture) => ({
  scenarioId: capture.scenarioId,
  frameId: capture.frameId,
  path: capture.path,
  byteLength: capture.byteLength,
}));
writeJson('proofs/H2-option-manifest.json', {
  schemaVersion: '1.0.0',
  featureId: work.featureId,
  status: 'approved',
  decidedAt: final.executedAt,
  decisionSurface: {
    workAreaNodeId: final.workArea.nodeId,
    approvedBoardNodeId: final.approvedBoard.nodeId,
    approvedWitnessNodeId: final.approvedBoard.acceptedFrameNodeId,
    optionId: 'option-a-preserve-track',
    label: 'Option 1 retenue',
    viewportWidth: 834,
    actualFrameWidth: final.approvedBoard.acceptedFrameWidth,
    reviewScale: final.approvedBoard.reviewScale,
    captureRef: final.approvedBoard.captureRef,
    visibleScaledBreakpointThumbnails: 0,
  },
  usageDistribution: final.usageDistribution,
  rejectedOption: final.rejectedOptionDisposition,
  technicalArchive: final.technicalArchive,
  technicalCaptures,
  checks: verify.checks,
  protectedExistingFactsUnchanged: true,
  masterWrites: [],
  pageWrites: [],
  childWrites: [],
  evidenceRefs: [
    'specs/029-figma-responsive-categories/proofs/H2-work-frames.bridge.json',
    'specs/029-figma-responsive-categories/proofs/H2-normalize-content-rows.bridge.json',
    'specs/029-figma-responsive-categories/proofs/H2-finalize-approved-option-a.bridge.json',
    'specs/029-figma-responsive-categories/proofs/H2-read-only-verify.bridge.json',
  ],
});

writeJson('decisions/H2-design.json', {
  schemaVersion: '1.0.0',
  featureId: work.featureId,
  gateId: 'H2',
  decisionId: 'H2-design-v1',
  status: 'approved',
  decision: 'accepted',
  decisionMaker: 'owner',
  decidedAt: final.executedAt,
  baselineRef: 'specs/029-figma-responsive-categories/decisions/H1-audit.json',
  historicalRefs: ['specs/021-categories-principales-repair/', 'specs/023-categories-gouvernees/'],
  evidenceRefs: [
    'specs/029-figma-responsive-categories/inventory/H2-work-frames.md',
    'specs/029-figma-responsive-categories/inventory/H2-fixtures.md',
    'specs/029-figma-responsive-categories/inventory/H2-grid-cases.md',
    'specs/029-figma-responsive-categories/inventory/H2-bindings.json',
    'specs/029-figma-responsive-categories/inventory/H2-typography.json',
    'specs/029-figma-responsive-categories/proofs/H2-option-manifest.json',
    'specs/029-figma-responsive-categories/proofs/H2-finalize-approved-option-a.bridge.json',
    'specs/029-figma-responsive-categories/proofs/H2-read-only-verify.bridge.json',
  ],
  acceptedFacts: [
    'Option 1 / A is selected: at 834 px in the intermediate three-column composition, the orphan card preserves one track width.',
    'The card extent is internal adaptation only; no new responsive card state or variant is added.',
    'Mobile renders one card per line with no exposed column control.',
    'Desktop and wide retain the Colonnes enum 2|3.',
    'Six of seven current Page usages are two columns and are identical across the rejected and accepted orphan options.',
    'The only current three-column usage is Empile and is the decision witness shown at 834 px, 1:1.',
    'All proposed bindings resolve to existing primitives and no responsive typography override is required.',
    'The owner surface contains no scaled breakpoint thumbnail; exhaustive coverage stays in a hidden technical archive.',
  ],
  behaviors: {
    mobile: { widths: [320, 390], cardsPerLine: 1, exposedColumnsControl: false },
    desktop: { widths: [834, 1200], configuredColumns: [2, 3], intermediateThreeColumnLayout: '2+1 with orphan preserving one track width' },
    wide: { widths: [1440, 1728], configuredColumns: [2, 3] },
  },
  witnesses: {
    widths: [320, 390, 834, 1200, 1440, 1728],
    configuredColumns: [2, 3],
    matrixFrameCount: matrixFrames.length,
    technicalFrameCount: work.frames.length,
    approvedDecisionWitness: { nodeId: final.approvedBoard.acceptedFrameNodeId, viewportWidth: 834, actualWidth: 834, scale: 1 },
  },
  fixtures: {
    content: ['normal', 'long'],
    edgeCases: ['card-count-differs-from-columns', 'no-image', 'atypical-square-media', 'mobile-superposed-text-readability'],
  },
  orphanRowDecision: {
    status: 'approved',
    selectedOption: 'A',
    value: 'preserve-track',
    label: 'La dernière carte garde sa largeur',
    selectedBy: 'owner',
  },
  cardExtentDecision: {
    status: 'approved',
    value: 'internal-adaptation-only',
    selectedBy: 'owner',
    evidence: { normalizedRows: normalized.rows.length, allEqualHeight: normalized.checks.allEqualHeight, allTextInsideCards: normalized.checks.allTextInsideCards },
    explicitStatesNeeded: [],
  },
  addedStatesJustification: [],
  desktopPreservation: {
    status: 'approved',
    statement: 'Existing desktop Style×Colonnes combinations and typography are preserved; only the approved responsive composition is prepared for later source application.',
  },
  primitiveBindings: { ref: 'specs/029-figma-responsive-categories/inventory/H2-bindings.json', count: bindings.bindingCount, missingPrimitiveIds: [] },
  typographyOverrides: [],
  pendingResponsiveTextStyle: [],
  columnsSettingStatement: 'Colonnes remains enum 2|3 and is labelled desktop-only; Mobile renders one card per line with no exposed column control.',
  childDecisions: [
    'Shared children outside CarteCategorie remain unchanged and read-only.',
    'Superpose requires media; an author without media selects Empile. No silent media fallback is introduced.',
  ],
  workFrameRefs: [
    { optionId: 'A', status: 'approved-visible', nodeId: final.approvedBoard.acceptedFrameNodeId, captureRef: final.approvedBoard.captureRef, viewportWidth: 834, scale: 1 },
    { optionId: 'B', status: 'rejected-archived', nodeId: final.rejectedOptionDisposition.sourceFrameNodeId, archiveNodeId: final.technicalArchive.nodeId },
  ],
  tradeoffs: [
    'The accepted orphan row preserves regular card proportions and leaves intentional empty space to the right.',
    'Figma witnesses describe explicit compositions; they do not claim automatic breakpoints.',
  ],
  rejectedOptions: [
    { optionId: 'B', value: 'stretch-orphan', disposition: 'hidden technical archive', sourceScenarioId: 'orphan-stretch' },
    { optionId: 'scaled-breakpoint-galleries', reason: 'They obscure true viewport geometry and duplicate identical outputs.', disposition: 'removed' },
  ],
  deferredTopics: [
    'Any governed-source application, which requires runner/mechanism proof and H3.',
  ],
  authorizes: [
    'Prepare generic runner capability, mechanism spike and the exact H3 mutation plan from this approved design.',
  ],
  forbids: [
    'Master or variant mutation before H3.',
    'Page write.',
    'Shared-child or protected-dependency mutation.',
    'Claim that work frames are already applied to governed source.',
  ],
  figmaWrites: [],
  pageWrites: [],
  childWrites: [],
  supersedes: null,
  conversationEvidence: "Owner wrote 'ok je vois . option 1' to select Option 1 / A. When the remaining internal-only card extent decision was presented, the owner replied 'go'. The owner then rejected scaled breakpoint galleries and required only the true difference at real size; the final 834 px 1:1 witness was produced and verified before this approval was recorded.",
});

console.log(JSON.stringify({
  generated: ['inventory/H2-work-frames.md', 'inventory/H2-grid-cases.md', 'proofs/H2-option-manifest.json', 'decisions/H2-design.json'],
  gateStatus: 'approved',
  selectedOption: 'A',
  approvedWitness: { width: final.approvedBoard.acceptedFrameWidth, scale: final.approvedBoard.reviewScale },
  allChecksGreen: Object.values(verify.checks).every(Boolean),
}, null, 2));
