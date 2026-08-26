// Phase 3 / H2 instrument. Creates proposal-only work frames after H1 approval.
// Governed master, Container, Pages, Header, Button master and existing children
// are inspected but never mutated. All created nodes live in a marked Section on
// the DS · Organisms page and can be removed or archived after the H2 decision.

const INPUT = {
  schemaVersion: '1.0.0',
  featureId: '028-figma-responsive-hero-video',
  sourceVersionId: '2391670501431838845',
  h1DecisionRef: 'specs/028-figma-responsive-hero-video/decisions/H1-audit.json',
  h1ApprovedAt: '2026-08-25T20:57:52Z',
  evidenceRoot: 'specs/028-figma-responsive-hero-video/proofs/H2-options',
  ids: {
    master: '2151:5552',
    container: '2448:4731',
    home: '2170:6351',
    header: '210:473',
    buttonMaster: '6:135',
  },
  variables: {
    space24: { id: 'VariableID:2183:7969', name: 'space/24' },
    space32: { id: 'VariableID:2027:971', name: 'space/32' },
    space48: { id: 'VariableID:2183:7970', name: 'space/48' },
    minHeight597: { id: 'VariableID:2188:9590', name: 'space/597' },
    wideHeight720: { id: 'VariableID:2434:5919', name: 'size/hero-video/root' },
  },
  fixtures: {
    default: null,
    longTitle: 'Des portes de garage et d’entrée pensées pour votre maison, installées et entretenues par nos équipes',
    longCta: 'Toutes nos portes',
  },
};

await figma.loadAllPagesAsync();

const required = {};
for (const [role, id] of Object.entries(INPUT.ids)) {
  const node = await figma.getNodeByIdAsync(id);
  if (!node) throw new Error(`H2 work frames refused: missing ${role} ${id}`);
  required[role] = node;
}

const master = required.master;
const container = required.container;
const home = required.home;
const header = required.header;
const buttonMaster = required.buttonMaster;
if (master.type !== 'COMPONENT' || master.key !== '36011e51b8bc0b221a1ba6f9108709b5bd1c4490') {
  throw new Error('H2 work frames refused: historical HeroVideo identity drift');
}
if (container.type !== 'FRAME' || master.parent?.id !== container.id || container.children.length !== 1) {
  throw new Error('H2 work frames refused: governed Container topology drift');
}
if (home.type !== 'INSTANCE' || (await home.getMainComponentAsync())?.id !== master.id) {
  throw new Error('H2 work frames refused: Home instance link drift');
}
if (header.type !== 'INSTANCE' || buttonMaster.type !== 'COMPONENT') {
  throw new Error('H2 work frames refused: read-only context identity drift');
}

const pageOf = (node) => {
  let cursor = node;
  while (cursor && cursor.type !== 'PAGE') cursor = cursor.parent;
  return cursor;
};
const dsPage = pageOf(master);
if (!dsPage || dsPage.name !== 'DS · Organisms') {
  throw new Error(`H2 work frames refused: expected DS · Organisms, got ${dsPage?.name || '(none)'}`);
}

const MARK_NS = 'ds_contracts';
const WORK_KEY = 'heroVideoResponsiveWorkArea';
const existingWorkAreas = dsPage.children.filter((node) =>
  node.type === 'SECTION' && node.getSharedPluginData(MARK_NS, WORK_KEY) === INPUT.featureId);
if (existingWorkAreas.length > 0) {
  throw new Error(`H2 work frames refused: ${existingWorkAreas.length} existing marked work area(s); inspect before retrying`);
}

const variableByRole = {};
for (const [role, expected] of Object.entries(INPUT.variables)) {
  const variable = await figma.variables.getVariableByIdAsync(expected.id);
  if (!variable || variable.name !== expected.name || variable.resolvedType !== 'FLOAT') {
    throw new Error(`H2 work frames refused: variable drift for ${role}`);
  }
  variableByRole[role] = variable;
}

await figma.loadFontAsync({ family: 'Montserrat', style: 'Regular' });

const plain = (value) => {
  if (typeof value === 'symbol') return 'mixed';
  if (value === undefined) return null;
  return value;
};
const box = (node) => node.absoluteBoundingBox
  ? {
      x: node.absoluteBoundingBox.x,
      y: node.absoluteBoundingBox.y,
      width: node.absoluteBoundingBox.width,
      height: node.absoluteBoundingBox.height,
    }
  : null;
const paintFacts = (node) => {
  const rows = [];
  for (const field of ['fills', 'strokes']) {
    const value = node[field];
    if (!Array.isArray(value)) continue;
    value.forEach((paint, index) => {
      if (!paint || typeof paint !== 'object') return;
      if (paint.type === 'IMAGE') rows.push({ field, index, type: paint.type, imageHash: paint.imageHash || null, scaleMode: paint.scaleMode || null, imageTransform: paint.imageTransform || null });
      if (String(paint.type || '').startsWith('GRADIENT_')) rows.push({ field, index, type: paint.type, gradientStops: paint.gradientStops || [], gradientTransform: paint.gradientTransform || null });
    });
  }
  return rows;
};
const textFacts = (node) => node.type === 'TEXT'
  ? {
      characters: node.characters,
      fontName: plain(node.fontName),
      fontSize: plain(node.fontSize),
      lineHeight: plain(node.lineHeight),
      textAlignHorizontal: node.textAlignHorizontal,
      textStyleId: typeof node.textStyleId === 'string' ? node.textStyleId : null,
    }
  : null;
const protectedSnapshot = async () => {
  const homeMain = await home.getMainComponentAsync();
  const masterRows = [];
  const visit = async (node, path) => {
    let mainComponent = null;
    if (node.type === 'INSTANCE') {
      const main = await node.getMainComponentAsync();
      mainComponent = main ? { id: main.id, key: main.key || null } : null;
    }
    masterRows.push({
      path,
      id: node.id,
      name: node.name,
      type: node.type,
      visible: node.visible,
      bounds: box(node),
      layoutMode: plain(node.layoutMode),
      layoutSizingHorizontal: plain(node.layoutSizingHorizontal),
      layoutSizingVertical: plain(node.layoutSizingVertical),
      primaryAxisAlignItems: plain(node.primaryAxisAlignItems),
      counterAxisAlignItems: plain(node.counterAxisAlignItems),
      itemSpacing: plain(node.itemSpacing),
      paddingTop: plain(node.paddingTop),
      paddingRight: plain(node.paddingRight),
      paddingBottom: plain(node.paddingBottom),
      paddingLeft: plain(node.paddingLeft),
      boundVariables: plain(node.boundVariables),
      componentProperties: plain(node.componentProperties),
      mainComponent,
      paints: paintFacts(node),
      text: textFacts(node),
    });
    if ('children' in node) {
      for (let index = 0; index < node.children.length; index += 1) {
        await visit(node.children[index], path === '' ? String(index) : `${path}/${index}`);
      }
    }
  };
  await visit(master, '');
  return {
    master: { id: master.id, key: master.key, parentId: master.parent?.id || null, rows: masterRows },
    container: { id: container.id, name: container.name, childIds: container.children.map((node) => node.id) },
    home: { id: home.id, mainComponentId: homeMain?.id || null, componentProperties: home.componentProperties, bounds: box(home) },
    header: { id: header.id, bounds: box(header), componentProperties: header.componentProperties },
    buttonMaster: { id: buttonMaster.id, key: buttonMaster.key, name: buttonMaster.name },
  };
};

const beforeProtected = await protectedSnapshot();
const beforeProtectedJson = JSON.stringify(beforeProtected);

const originalPage = figma.currentPage;
await figma.setCurrentPageAsync(dsPage);

const allBounds = dsPage.children.map(box).filter(Boolean);
const furthestRight = allBounds.reduce((max, current) => Math.max(max, current.x + current.width), 0);
const workArea = figma.createSection();
workArea.name = '028 · HeroVideo responsive · Propositions H2';
workArea.x = furthestRight + 800;
workArea.y = 400;
workArea.resizeWithoutConstraints(5600, 7600);
workArea.setSharedPluginData(MARK_NS, WORK_KEY, INPUT.featureId);
workArea.setPluginData('authority', 'proposal-only-after-H1');
workArea.setPluginData('h1DecisionRef', INPUT.h1DecisionRef);
workArea.setPluginData('writeBoundary', 'new-work-frames-only; master/pages/existing-children-read-only');

const cases = [
  { caseId: 'control-320', width: 320, requestedHeight: 640, presentation: 'Compact', witness: false },
  { caseId: 'witness-390', width: 390, requestedHeight: 844, presentation: 'Compact', witness: true },
  { caseId: 'witness-834', width: 834, requestedHeight: 1112, presentation: 'Compact', witness: true },
  { caseId: 'witness-1200', width: 1200, requestedHeight: 800, presentation: 'Desktop', witness: true },
  { caseId: 'control-1440', width: 1440, requestedHeight: 720, presentation: 'Wide', witness: false },
  { caseId: 'witness-1728', width: 1728, requestedHeight: 720, presentation: 'Wide', witness: true },
  { caseId: 'control-short-landscape', width: 844, requestedHeight: 390, presentation: 'Compact', witness: false },
];
const fixtures = [
  { fixtureId: 'default', label: 'Default' },
  { fixtureId: 'long-title', label: 'Titre long' },
  { fixtureId: 'long-cta', label: 'CTA long' },
];
const options = {
  'option-a-balanced': {
    label: 'Option A · Équilibrée',
    description: 'Titre plus compact, gap 24; priorité à la lisibilité et au point focal du poster.',
    compact: { paddingRole: 'space24', gapRole: 'space24', fontSize: 32, lineHeight: 40 },
    desktop: { paddingRole: 'space48', gapRole: 'space24', fontSize: 40, lineHeight: 48 },
  },
  'option-b-expressive': {
    label: 'Option B · Plus expressive',
    description: 'Titre plus grand, gap 32; davantage d’impact mais plus de recouvrement média.',
    compact: { paddingRole: 'space24', gapRole: 'space32', fontSize: 40, lineHeight: 48 },
    desktop: { paddingRole: 'space48', gapRole: 'space32', fontSize: 44, lineHeight: 48 },
  },
};

const resolvePath = (root, path) => {
  let node = root;
  for (const part of String(path).split('/').filter(Boolean)) {
    if (!('children' in node)) throw new Error(`H2 work frame path drift at ${path}`);
    node = node.children[Number(part)];
    if (!node) throw new Error(`H2 work frame path drift at ${path}`);
  }
  return node;
};
const setBound = (node, field, variable) => {
  if (!('setBoundVariable' in node)) throw new Error(`H2 binding refused: ${node.name}.${field}`);
  node.setBoundVariable(field, variable);
};
const setButtonLabel = (button, label) => {
  if (button.type !== 'INSTANCE') throw new Error('H2 fixture refused: Button path is not an instance');
  const textProperty = Object.entries(button.componentProperties).find(([, value]) => value.type === 'TEXT');
  if (!textProperty) throw new Error('H2 fixture refused: Button exposes no TEXT property');
  button.setProperties({ [textProperty[0]]: label });
};
const overflowInspection = (root, requestedHeight) => {
  const rootBox = box(root);
  const issues = [];
  if (!rootBox) return { issues: [{ path: '', reason: 'missing-root-bounds' }], requestedHeight, actualHeight: null };
  const visit = (node, path, clippingAncestors) => {
    if (node.visible === false) return;
    const nodeBox = box(node);
    const nextClipping = node.clipsContent === true ? [...clippingAncestors, node.id] : clippingAncestors;
    if (nodeBox) {
      const horizontal = nodeBox.x < rootBox.x - 0.01 || nodeBox.x + nodeBox.width > rootBox.x + rootBox.width + 0.01;
      const vertical = nodeBox.y < rootBox.y - 0.01 || nodeBox.y + nodeBox.height > rootBox.y + rootBox.height + 0.01;
      if (horizontal || vertical) issues.push({ path, nodeId: node.id, name: node.name, horizontal, vertical, clippingAncestors });
    }
    if ('children' in node) node.children.forEach((child, index) => visit(child, path === '' ? String(index) : `${path}/${index}`, nextClipping));
  };
  visit(root, '', []);
  return {
    requestedHeight,
    actualHeight: rootBox.height,
    growsBeyondRequestedHeight: rootBox.height > requestedHeight + 0.01,
    horizontalOverflow: issues.some((issue) => issue.horizontal),
    verticalOverflowInsideRoot: issues.some((issue) => issue.vertical),
    issues,
  };
};

const createdNodeIds = [workArea.id];
const frameRecords = [];
let rowY = 160;

const makeFrame = async ({ optionId, option, testCase, fixture, x, y }) => {
  const instance = master.createInstance();
  const root = instance.detachInstance();
  workArea.appendChild(root);
  createdNodeIds.push(root.id);
  root.x = x;
  root.y = y;
  root.name = `028 H2 · ${option.label} · ${testCase.presentation} · ${testCase.caseId} · ${fixture.label}`;
  root.setSharedPluginData(MARK_NS, WORK_KEY, INPUT.featureId);
  root.setPluginData('optionId', optionId);
  root.setPluginData('presentation', testCase.presentation);
  root.setPluginData('fixtureId', fixture.fixtureId);
  root.setPluginData('requestedViewport', `${testCase.width}x${testCase.requestedHeight}`);
  root.setPluginData('authority', 'proposal-only');

  const background = resolvePath(root, '0');
  const scrimBottom = resolvePath(root, '1');
  const scrimNavigation = resolvePath(root, '2');
  const textGroup = resolvePath(root, '3');
  const title = resolvePath(root, '3/0');
  const button = resolvePath(root, '4');
  if (title.type !== 'TEXT' || textGroup.type !== 'FRAME' || button.type !== 'INSTANCE') {
    throw new Error(`H2 work frame refused: expected Text/Button structure in ${root.name}`);
  }

  const defaultTitle = title.characters;
  const defaultButtonLabel = Object.values(button.componentProperties).find((value) => value.type === 'TEXT')?.value || null;
  if (fixture.fixtureId === 'long-title') title.characters = INPUT.fixtures.longTitle;
  if (fixture.fixtureId === 'long-cta') setButtonLabel(button, INPUT.fixtures.longCta);

  const typography = testCase.presentation === 'Compact'
    ? option.compact
    : testCase.presentation === 'Desktop'
      ? option.desktop
      : null;
  const bindingRows = [];
  let typographyOverride = null;

  if (testCase.presentation === 'Wide') {
    root.resize(testCase.width, 720);
    root.primaryAxisSizingMode = 'FIXED';
    root.counterAxisSizingMode = 'FIXED';
    bindingRows.push({
      property: 'height',
      variableId: INPUT.variables.wideHeight720.id,
      variableName: INPUT.variables.wideHeight720.name,
      resolvedValue: 720,
      authority: 'historical-binding-preserved',
    });
  } else {
    root.layoutMode = 'VERTICAL';
    root.counterAxisSizingMode = 'FIXED';
    root.primaryAxisSizingMode = 'AUTO';
    root.primaryAxisAlignItems = 'CENTER';
    root.counterAxisAlignItems = 'CENTER';
    root.clipsContent = false;
    root.resize(testCase.width, 597);
    setBound(root, 'minHeight', variableByRole.minHeight597);
    bindingRows.push({ property: 'minHeight', variableId: INPUT.variables.minHeight597.id, variableName: INPUT.variables.minHeight597.name, resolvedValue: 597 });

    const paddingVariable = variableByRole[typography.paddingRole];
    const gapVariable = variableByRole[typography.gapRole];
    for (const property of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) {
      setBound(root, property, paddingVariable);
      bindingRows.push({ property, variableId: paddingVariable.id, variableName: paddingVariable.name, resolvedValue: root[property] });
    }
    setBound(root, 'itemSpacing', gapVariable);
    bindingRows.push({ property: 'itemSpacing', variableId: gapVariable.id, variableName: gapVariable.name, resolvedValue: root.itemSpacing });

    textGroup.layoutSizingHorizontal = 'FILL';
    textGroup.layoutSizingVertical = 'HUG';
    textGroup.counterAxisAlignItems = 'CENTER';
    textGroup.clipsContent = false;
    title.textAutoResize = 'HEIGHT';
    title.layoutSizingHorizontal = 'FILL';
    title.layoutSizingVertical = 'HUG';
    title.textAlignHorizontal = 'CENTER';
    title.fontSize = typography.fontSize;
    title.lineHeight = { unit: 'PIXELS', value: typography.lineHeight };
    button.layoutSizingHorizontal = 'HUG';
    button.layoutSizingVertical = 'HUG';
    typographyOverride = {
      role: 'Titre Hero vidéo',
      sourceTextStyleName: 'Titre Hero vidéo',
      fields: {
        fontSize: { before: 44, after: typography.fontSize },
        lineHeight: { before: 48, after: typography.lineHeight },
        textAlignHorizontal: { before: 'LEFT', after: 'CENTER' },
      },
      family: 'Montserrat',
      weight: 400,
      charactersChangedOnlyByFixture: fixture.fixtureId === 'long-title',
      debtStatus: 'pending-responsive-text-style',
    };
  }

  for (const overlay of [background, scrimBottom, scrimNavigation]) {
    if (!('resize' in overlay)) throw new Error(`H2 overlay cannot resize: ${overlay.name}`);
    overlay.layoutPositioning = 'ABSOLUTE';
    overlay.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
    overlay.x = 0;
    overlay.y = 0;
    overlay.resize(root.width, root.height);
  }

  const measured = overflowInspection(root, testCase.requestedHeight);
  const titleBox = box(title);
  const buttonBox = box(button);
  const rootBox = box(root);
  const posterBox = box(background);
  const contentPosterOverlap = rootBox && titleBox && buttonBox && posterBox
    ? {
        titleCenter: { x: titleBox.x + titleBox.width / 2, y: titleBox.y + titleBox.height / 2 },
        buttonCenter: { x: buttonBox.x + buttonBox.width / 2, y: buttonBox.y + buttonBox.height / 2 },
        posterCenter: { x: posterBox.x + posterBox.width / 2, y: posterBox.y + posterBox.height / 2 },
        namedLimit: testCase.presentation === 'Wide' ? null : 'Centered content can cover the poster focal area; no crop or asset change is proposed.',
      }
    : null;
  const imagePath = `${INPUT.evidenceRoot}/${optionId}/${testCase.caseId}-${fixture.fixtureId}.png`;
  const record = {
    optionId,
    optionLabel: option.label,
    frameId: root.id,
    frameName: root.name,
    presentation: testCase.presentation,
    explicitSelection: true,
    witness: testCase.witness && fixture.fixtureId === 'default',
    caseId: testCase.caseId,
    width: testCase.width,
    requestedHeight: testCase.requestedHeight,
    actualBounds: box(root),
    fixtureId: fixture.fixtureId,
    content: {
      title: title.characters,
      defaultTitle,
      buttonLabel: Object.values(button.componentProperties).find((value) => value.type === 'TEXT')?.value || null,
      defaultButtonLabel,
    },
    nodeRefs: { heroRootId: root.id, backgroundId: background.id, titleId: title.id, buttonId: button.id },
    bindingRows,
    typographyOverride,
    media: {
      posterPaints: paintFacts(background),
      bottomScrimPaints: paintFacts(scrimBottom),
      navigationScrimPaints: paintFacts(scrimNavigation),
      contentPosterOverlap,
    },
    responsiveCheck: {
      ...measured,
      contentAccessible: !measured.horizontalOverflow && !measured.verticalOverflowInsideRoot,
      ancestorClipping: [],
    },
    plannedCaptureRef: imagePath,
    authority: 'proposal-only-before-H2',
  };
  frameRecords.push(record);
  return record;
};

for (const testCase of cases) {
  let columnX = 160;
  for (const fixture of fixtures) {
    await makeFrame({ optionId: 'option-a-balanced', option: options['option-a-balanced'], testCase, fixture, x: columnX, y: rowY });
    columnX += testCase.width + 160;
  }
  const rowHeight = Math.max(...frameRecords.filter((record) => record.optionId === 'option-a-balanced' && record.caseId === testCase.caseId).map((record) => record.actualBounds.height));
  rowY += rowHeight + 200;
}

for (const testCase of cases.filter((entry) => ['witness-390', 'witness-1200'].includes(entry.caseId))) {
  await makeFrame({
    optionId: 'option-b-expressive',
    option: options['option-b-expressive'],
    testCase,
    fixture: fixtures[0],
    x: 160,
    y: rowY,
  });
  rowY += frameRecords[frameRecords.length - 1].actualBounds.height + 200;
}

workArea.resizeWithoutConstraints(5600, Math.max(7600, rowY + 160));
const afterProtected = await protectedSnapshot();
const afterProtectedJson = JSON.stringify(afterProtected);
if (afterProtectedJson !== beforeProtectedJson) {
  throw new Error('H2 work frames refused after creation: a protected existing fact changed');
}

if (originalPage.id !== dsPage.id) await figma.setCurrentPageAsync(originalPage);

return {
  schemaVersion: INPUT.schemaVersion,
  featureId: INPUT.featureId,
  run: 'h2-work-frames',
  fileKey: figma.fileKey,
  sourceVersionId: INPUT.sourceVersionId,
  h1DecisionRef: INPUT.h1DecisionRef,
  h1ApprovedAt: INPUT.h1ApprovedAt,
  executedAt: new Date().toISOString(),
  workArea: {
    nodeId: workArea.id,
    name: workArea.name,
    pageId: dsPage.id,
    pageName: dsPage.name,
    outsideGovernedContainer: workArea.parent?.id !== container.id,
    outsideProductPages: dsPage.name !== 'Pages',
    authority: 'proposal-only-before-H2',
  },
  options,
  frames: frameRecords,
  inspection: {
    protectedExistingFactsUnchanged: afterProtectedJson === beforeProtectedJson,
    beforeProtected,
    afterProtected,
    masterWrites: [],
    containerWrites: [],
    homeWrites: [],
    headerWrites: [],
    sharedDependencyWrites: [],
    existingChildWrites: [],
    pageWrites: [],
  },
  figmaWrites: {
    createdWorkAreaNodeId: workArea.id,
    createdWorkFrameNodeIds: frameRecords.map((record) => record.frameId),
    createdNodeIds,
    changedExistingNodeIds: [],
  },
  scriptResults: [
    {
      operationId: 'create-h2-proposal-work-frames-after-H1',
      result: {
        applied: true,
        createdNodeIds,
        changedNodeIds: [],
        protectedExistingFactsUnchanged: true,
      },
    },
  ],
};
