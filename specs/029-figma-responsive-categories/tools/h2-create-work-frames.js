// Phase 3 / H2 instrument. Creates proposal-only responsive work frames after
// explicit H1 approval. Governed sets, their members, all Page usages and every
// shared dependency are snapshotted before/after and never mutated.

const INPUT = {
  schemaVersion: '1.0.0',
  featureId: '029-figma-responsive-categories',
  sourceVersionId: '2391982289745917433',
  h1DecisionRef: 'specs/029-figma-responsive-categories/decisions/H1-audit.json',
  h1ApprovedAt: '2026-08-26T12:53:58Z',
  evidenceRoot: 'specs/029-figma-responsive-categories/proofs/H2-options',
  ids: {
    sectionSet: '2115:4277',
    sectionMembers: ['2115:4273', '2115:4274', '2115:4275', '2495:7122'],
    cardSet: '2495:6770',
    cardSuperpose: '2495:6762',
    cardEmpile: '2495:6763',
    usages: ['2115:4392', '2115:4278', '2115:4438', '2115:4297', '2115:4411', '2115:4324', '2115:4364'],
    protectedDependencies: ['6:104', '9:206', '230:585', '230:599'],
  },
  expectedKeys: {
    sectionSet: '94f64a369a5db615d68935bb353614eaaadbffc2',
    cardSet: '0d1a03d07abf7225fb560b3d4163dd3575132c62',
    cardSuperpose: '715ab63ed657ce8217be6b55bbcc5f3101912fbd',
    cardEmpile: 'a65093a506e9250af2afecbe142e1a368fea1256',
  },
  variables: {
    space8: { id: 'VariableID:2183:7967', name: 'space/8', value: 8 },
    space16: { id: 'VariableID:2027:970', name: 'space/16', value: 16 },
    space24: { id: 'VariableID:2183:7969', name: 'space/24', value: 24 },
    space32: { id: 'VariableID:2027:971', name: 'space/32', value: 32 },
    space64: { id: 'VariableID:2183:7971', name: 'space/64', value: 64 },
    space89: { id: 'VariableID:2183:7972', name: 'space/89', value: 89 },
    categoryImage418: { id: 'VariableID:2309:4426', name: 'size/carte/categorie-image', value: 418 },
  },
  fixtures: {
    longTitle: 'UNE CATÉGORIE AU TITRE VOLONTAIREMENT TRÈS LONG POUR VÉRIFIER LE RETOUR À LA LIGNE',
    longDescription: 'Cette description volontairement plus longue vérifie que tout le contenu reste accessible, que la carte grandit sans couper le texte et que les cartes voisines gardent une hauteur cohérente.',
  },
};

await figma.loadAllPagesAsync();

const getRequired = async (id, role) => {
  const node = await figma.getNodeByIdAsync(id);
  if (!node) throw new Error(`H2 refused: missing ${role} ${id}`);
  return node;
};
const sectionSet = await getRequired(INPUT.ids.sectionSet, 'section set');
const cardSet = await getRequired(INPUT.ids.cardSet, 'card set');
const cardSuperpose = await getRequired(INPUT.ids.cardSuperpose, 'Superpose card');
const cardEmpile = await getRequired(INPUT.ids.cardEmpile, 'Empile card');
if (sectionSet.type !== 'COMPONENT_SET' || sectionSet.key !== INPUT.expectedKeys.sectionSet) throw new Error('H2 refused: section identity drift');
if (cardSet.type !== 'COMPONENT_SET' || cardSet.key !== INPUT.expectedKeys.cardSet) throw new Error('H2 refused: card set identity drift');
if (cardSuperpose.type !== 'COMPONENT' || cardSuperpose.key !== INPUT.expectedKeys.cardSuperpose || cardSuperpose.parent?.id !== cardSet.id) throw new Error('H2 refused: Superpose card identity drift');
if (cardEmpile.type !== 'COMPONENT' || cardEmpile.key !== INPUT.expectedKeys.cardEmpile || cardEmpile.parent?.id !== cardSet.id) throw new Error('H2 refused: Empile card identity drift');

const sectionMembers = await Promise.all(INPUT.ids.sectionMembers.map((id) => getRequired(id, 'section member')));
if (sectionMembers.some((node) => node.type !== 'COMPONENT' || node.parent?.id !== sectionSet.id)) throw new Error('H2 refused: section member topology drift');
const usages = await Promise.all(INPUT.ids.usages.map((id) => getRequired(id, 'Page usage')));
const protectedDependencies = await Promise.all(INPUT.ids.protectedDependencies.map((id) => getRequired(id, 'protected dependency')));

const pageOf = (node) => {
  let cursor = node;
  while (cursor && cursor.type !== 'PAGE') cursor = cursor.parent;
  return cursor;
};
const dsPage = pageOf(sectionSet);
if (!dsPage || dsPage.name !== 'DS · Organisms') throw new Error(`H2 refused: expected DS · Organisms, got ${dsPage?.name || '(none)'}`);
if (usages.some((node) => pageOf(node)?.name !== 'Pages')) throw new Error('H2 refused: Page usage position drift');

const MARK_NS = 'ds_contracts';
const WORK_KEY = 'categoriesResponsiveWorkArea';
const existingWorkAreas = dsPage.children.filter((node) => node.type === 'SECTION' && node.getSharedPluginData(MARK_NS, WORK_KEY) === INPUT.featureId);
if (existingWorkAreas.length > 0) throw new Error(`H2 refused: ${existingWorkAreas.length} existing marked work area(s); inspect before retrying`);

const variableByRole = {};
for (const [role, expected] of Object.entries(INPUT.variables)) {
  const variable = await figma.variables.getVariableByIdAsync(expected.id);
  if (!variable || variable.name !== expected.name || variable.resolvedType !== 'FLOAT') throw new Error(`H2 refused: variable drift for ${role}`);
  const modeValues = Object.values(variable.valuesByMode || {});
  if (!modeValues.includes(expected.value)) throw new Error(`H2 refused: variable value drift for ${role}`);
  variableByRole[role] = variable;
}

await figma.loadFontAsync({ family: 'Montserrat', style: 'Regular' });

const plain = (value) => {
  if (typeof value === 'symbol') return 'mixed';
  if (value === undefined) return null;
  return value;
};
const box = (node) => node.absoluteBoundingBox ? {
  x: node.absoluteBoundingBox.x,
  y: node.absoluteBoundingBox.y,
  width: node.absoluteBoundingBox.width,
  height: node.absoluteBoundingBox.height,
} : null;
const pagePosition = (node) => {
  const rows = [];
  let cursor = node.parent;
  while (cursor) {
    rows.push({ id: cursor.id, name: cursor.name, type: cursor.type });
    if (cursor.type === 'PAGE') break;
    cursor = cursor.parent;
  }
  return rows;
};
const mainIdentity = async (node) => {
  if (node.type !== 'INSTANCE') return null;
  const main = await node.getMainComponentAsync();
  return main ? { id: main.id, key: main.key || null, parentSetId: main.parent?.type === 'COMPONENT_SET' ? main.parent.id : null } : null;
};
const nodeFact = async (node) => ({
  id: node.id,
  key: 'key' in node ? node.key || null : null,
  name: node.name,
  type: node.type,
  parentId: node.parent?.id || null,
  bounds: box(node),
  variantProperties: plain(node.variantProperties),
  componentProperties: plain(node.componentProperties),
  boundVariables: plain(node.boundVariables),
  mainComponent: await mainIdentity(node),
});
const protectedSnapshot = async () => ({
  sectionSet: await nodeFact(sectionSet),
  sectionMembers: await Promise.all(sectionMembers.map(nodeFact)),
  cardSet: await nodeFact(cardSet),
  cardMembers: await Promise.all([cardSuperpose, cardEmpile].map(nodeFact)),
  usages: await Promise.all(usages.map(async (node) => ({ ...(await nodeFact(node)), position: pagePosition(node) }))),
  protectedDependencies: await Promise.all(protectedDependencies.map(nodeFact)),
});

const beforeProtected = await protectedSnapshot();
const beforeProtectedJson = JSON.stringify(beforeProtected);
const originalPage = figma.currentPage;
await figma.setCurrentPageAsync(dsPage);

const createdRootIds = [];
const frameRecords = [];
const bindingFacts = [];
const typographyFacts = [];
const reviewFrames = [];
let workArea = null;

const setBound = (node, property, variableRole, behaviorId) => {
  const variable = variableByRole[variableRole];
  if (!variable || !('setBoundVariable' in node)) throw new Error(`H2 refused: cannot bind ${node.name}.${property}`);
  node.setBoundVariable(property, variable);
  bindingFacts.push({
    behaviorId,
    nodeIdOrPath: node.id,
    figmaProperty: property,
    variableId: variable.id,
    variableName: variable.name,
    resolvedValue: INPUT.variables[variableRole].value,
    sourceCollection: 'Primitives',
    evidenceRef: 'specs/029-figma-responsive-categories/proofs/H2-work-frames.bridge.json',
  });
};
const createAutoFrame = ({ name, width, direction = 'VERTICAL', fill = null }) => {
  const frame = figma.createFrame();
  frame.name = name;
  frame.resize(width, 100);
  frame.layoutMode = direction;
  frame.primaryAxisSizingMode = 'AUTO';
  frame.counterAxisSizingMode = 'FIXED';
  frame.primaryAxisAlignItems = 'MIN';
  frame.counterAxisAlignItems = 'MIN';
  frame.clipsContent = false;
  if (fill) frame.fills = [fill];
  return frame;
};
const addLabel = (parent, characters, fontSize = 16) => {
  const text = figma.createText();
  text.name = 'H2 annotation';
  text.fontName = { family: 'Montserrat', style: 'Regular' };
  text.fontSize = fontSize;
  text.lineHeight = { unit: 'AUTO' };
  text.characters = characters;
  text.textAutoResize = 'HEIGHT';
  parent.appendChild(text);
  if (parent.layoutMode !== 'NONE') {
    text.layoutSizingHorizontal = 'FILL';
    text.layoutSizingVertical = 'HUG';
  }
  return text;
};
const loadTextFonts = async (text) => {
  const fonts = text.getRangeAllFontNames(0, text.characters.length);
  const unique = new Map(fonts.map((font) => [`${font.family}::${font.style}`, font]));
  for (const font of unique.values()) await figma.loadFontAsync(font);
};
const findByName = (root, name) => root.findOne((node) => node.name === name);
const applyFixture = async (root, style, fixtureId, cardIndex) => {
  if (fixtureId !== 'long' || cardIndex !== 1) return;
  const title = findByName(root, style === 'Superpose' ? 'Item1Titre' : 'TitreCategorie');
  const description = findByName(root, style === 'Superpose' ? 'Item1Texte' : 'TexteCategorie');
  if (!title || title.type !== 'TEXT' || !description || description.type !== 'TEXT') throw new Error(`H2 refused: text role drift in ${style}`);
  await loadTextFonts(title);
  await loadTextFonts(description);
  title.characters = INPUT.fixtures.longTitle;
  description.characters = INPUT.fixtures.longDescription;
  title.textAutoResize = 'HEIGHT';
  description.textAutoResize = 'HEIGHT';
  title.layoutSizingHorizontal = 'FILL';
  description.layoutSizingHorizontal = 'FILL';
};
const overflowInspection = (root) => {
  const rootBox = box(root);
  const issues = [];
  if (!rootBox) return { horizontalOverflow: true, verticalOverflow: true, clippedBy: ['missing-root-bounds'], contentAccessible: false };
  const visit = (node, path, clipping) => {
    if (node.visible === false) return;
    const current = box(node);
    const nextClipping = node.clipsContent === true ? [...clipping, node.id] : clipping;
    if (current) {
      const horizontal = current.x < rootBox.x - 0.5 || current.x + current.width > rootBox.x + rootBox.width + 0.5;
      const vertical = current.y < rootBox.y - 0.5 || current.y + current.height > rootBox.y + rootBox.height + 0.5;
      if ((horizontal || vertical) && node.id !== root.id) issues.push({ path, nodeId: node.id, nodeName: node.name, horizontal, vertical, clippingAncestors: clipping });
    }
    if ('children' in node) node.children.forEach((child, index) => visit(child, path ? `${path}/${index}` : String(index), nextClipping));
  };
  visit(root, '', []);
  const clippedBy = [...new Set(issues.flatMap((issue) => issue.clippingAncestors))];
  return {
    horizontalOverflow: issues.some((issue) => issue.horizontal),
    verticalOverflow: issues.some((issue) => issue.vertical),
    clippedBy,
    contentAccessible: issues.length === 0 && clippedBy.length === 0,
    issues,
  };
};

const configureCard = async ({ row, style, width, fixtureId, cardIndex, behaviorId, mediaCase = 'normal' }) => {
  const member = style === 'Superpose' ? cardSuperpose : cardEmpile;
  const instance = member.createInstance();
  row.appendChild(instance);
  const root = instance.detachInstance();
  root.name = `H2 Card · ${style} · ${fixtureId} · ${cardIndex + 1}`;
  root.resize(width, root.height);
  root.counterAxisSizingMode = 'FIXED';
  root.primaryAxisSizingMode = 'AUTO';
  root.layoutSizingHorizontal = 'FIXED';
  root.layoutSizingVertical = 'HUG';
  root.clipsContent = false;
  await applyFixture(root, style, fixtureId, cardIndex);

  let mediaBehavior = null;
  if (style === 'Superpose') {
    const wrapper = findByName(root, 'wrapper');
    const inner = findByName(root, 'inner');
    const textBlock = findByName(root, 'Item1BlocTexte');
    const title = findByName(root, 'Item1Titre');
    const description = findByName(root, 'Item1Texte');
    const decor = findByName(root, 'Décor');
    if (!wrapper || wrapper.type !== 'FRAME' || !inner || inner.type !== 'FRAME' || !textBlock || textBlock.type !== 'FRAME' || !title || title.type !== 'TEXT' || !description || description.type !== 'TEXT') throw new Error('H2 refused: Superpose internal structure drift');
    root.primaryAxisAlignItems = 'MAX';
    setBound(root, 'minHeight', 'categoryImage418', behaviorId);
    const paddingRole = width <= 390 ? 'space24' : 'space32';
    for (const property of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) setBound(wrapper, property, paddingRole, behaviorId);
    setBound(inner, 'itemSpacing', 'space16', behaviorId);
    setBound(textBlock, 'itemSpacing', 'space8', behaviorId);
    wrapper.layoutSizingHorizontal = 'FILL';
    wrapper.layoutSizingVertical = 'HUG';
    inner.layoutSizingHorizontal = 'FILL';
    inner.layoutSizingVertical = 'HUG';
    textBlock.layoutSizingHorizontal = 'FILL';
    textBlock.layoutSizingVertical = 'HUG';
    title.textAutoResize = 'HEIGHT';
    description.textAutoResize = 'HEIGHT';
    title.layoutSizingHorizontal = 'FILL';
    description.layoutSizingHorizontal = 'FILL';
    if (decor && 'layoutPositioning' in decor) decor.layoutPositioning = 'ABSOLUTE';
    if (mediaCase === 'no-image') {
      root.fills = Array.isArray(root.fills) ? root.fills.filter((paint) => paint.type !== 'IMAGE') : [];
      mediaBehavior = 'unsupported-visible-failure: Superpose requires a media or an explicit fallback decision';
    } else {
      mediaBehavior = 'source image FILL and 75% bottom gradient preserved; mobile readability presented visually';
    }
  } else {
    const image = findByName(root, 'categorieImage');
    const text = findByName(root, 'text');
    const button = findByName(root, 'Bouton');
    const title = findByName(root, 'TitreCategorie');
    const description = findByName(root, 'TexteCategorie');
    if (!image || image.type !== 'FRAME' || !text || text.type !== 'FRAME' || !button || button.type !== 'FRAME' || !title || title.type !== 'TEXT' || !description || description.type !== 'TEXT') throw new Error('H2 refused: Empile internal structure drift');
    root.layoutSizingVertical = 'HUG';
    setBound(root, 'itemSpacing', 'space32', behaviorId);
    setBound(text, 'itemSpacing', 'space16', behaviorId);
    image.layoutSizingHorizontal = 'FILL';
    image.layoutSizingVertical = 'FIXED';
    if (mediaCase === 'no-image') {
      image.visible = false;
      mediaBehavior = 'image hidden; text and CTA remain accessible and card collapses without invented media';
    } else {
      const ratio = mediaCase === 'square' ? 1 : 418 / 743;
      image.resize(width, width * ratio);
      let targetAspectRatioApplied = false;
      if ('targetAspectRatio' in image) {
        try {
          image.targetAspectRatio = mediaCase === 'square' ? { x: 1, y: 1 } : { x: 743, y: 418 };
          targetAspectRatioApplied = true;
        } catch (error) {
          targetAspectRatioApplied = false;
        }
      }
      mediaBehavior = `${mediaCase === 'square' ? 'atypical square' : 'source 743:418'} ratio with IMAGE/FILL crop preserved; targetAspectRatio=${targetAspectRatioApplied}`;
    }
    text.layoutSizingHorizontal = 'FILL';
    text.layoutSizingVertical = 'HUG';
    button.layoutSizingHorizontal = 'FILL';
    button.layoutSizingVertical = 'HUG';
    title.textAutoResize = 'HEIGHT';
    description.textAutoResize = 'HEIGHT';
    title.layoutSizingHorizontal = 'FILL';
    description.layoutSizingHorizontal = 'FILL';
  }
  return { root, mediaBehavior };
};

const effectiveColumns = (width, configuredColumns) => {
  if (width <= 390) return 1;
  if (width === 834 && configuredColumns === 3) return 2;
  return configuredColumns;
};
const gapRoleForWidth = (width) => width <= 390 ? 'space24' : width <= 1200 ? 'space32' : 'space64';
const presentationForWidth = (width) => width <= 390 ? 'Mobile' : width <= 1200 ? 'Desktop' : 'Wide';
const makeStyleGrid = async ({ witness, style, width, configuredColumns, fixtureId, cardCount, orphanPolicy, behaviorId, mediaCases = [] }) => {
  const styleGroup = createAutoFrame({ name: `H2 ${style} grid`, width, direction: 'VERTICAL' });
  witness.appendChild(styleGroup);
  styleGroup.layoutSizingHorizontal = 'FILL';
  styleGroup.layoutSizingVertical = 'HUG';
  addLabel(styleGroup, `${style} · réglage desktop ${configuredColumns} colonnes`, 14);
  setBound(styleGroup, 'itemSpacing', 'space16', behaviorId);
  const rows = [];
  const cards = [];
  const columns = effectiveColumns(width, configuredColumns);
  const gapRole = gapRoleForWidth(width);
  const gap = INPUT.variables[gapRole].value;
  const standardWidth = (width - gap * (columns - 1)) / columns;
  for (let start = 0; start < cardCount; start += columns) {
    const rowCount = Math.min(columns, cardCount - start);
    const row = createAutoFrame({ name: `H2 row ${rows.length + 1}`, width, direction: 'HORIZONTAL' });
    styleGroup.appendChild(row);
    row.layoutSizingHorizontal = 'FILL';
    row.layoutSizingVertical = 'HUG';
    setBound(row, 'itemSpacing', gapRole, behaviorId);
    const rowCards = [];
    for (let offset = 0; offset < rowCount; offset += 1) {
      const cardIndex = start + offset;
      const cardWidth = rowCount === 1 && columns > 1 && orphanPolicy === 'stretch' ? width : standardWidth;
      const configured = await configureCard({
        row,
        style,
        width: cardWidth,
        fixtureId,
        cardIndex,
        behaviorId,
        mediaCase: mediaCases[cardIndex] || 'normal',
      });
      rowCards.push(configured.root);
      cards.push({ nodeId: configured.root.id, width: cardWidth, mediaBehavior: configured.mediaBehavior });
    }
    const maxHeight = Math.max(...rowCards.map((node) => node.height));
    for (const card of rowCards) {
      card.resize(card.width, maxHeight);
      card.primaryAxisSizingMode = 'FIXED';
      card.layoutSizingVertical = 'FIXED';
    }
    rows.push({
      rowNodeId: row.id,
      cardNodeIds: rowCards.map((node) => node.id),
      cardWidths: rowCards.map((node) => node.width),
      equalHeight: rowCards.every((node) => Math.abs(node.height - maxHeight) < 0.01),
      height: maxHeight,
    });
  }
  return { style, groupNodeId: styleGroup.id, configuredColumns, effectiveColumns: columns, cardsPerRow: rows.map((row) => row.cardNodeIds.length), rows, cards };
};

const reviewIds = new Set([
  'matrix-390-c3-normal',
  'matrix-834-c3-long',
  'matrix-1200-c3-long',
  'matrix-1728-c2-normal',
]);
const makeWitness = async ({ scenarioId, width, configuredColumns, fixtureId, cardCount = configuredColumns, orphanPolicy = 'preserve-track', mediaCasesByStyle = {} }) => {
  const behaviorId = `${presentationForWidth(width).toLowerCase()}-${configuredColumns}-columns-${fixtureId}`;
  const witness = createAutoFrame({ name: `029 H2 · ${width}px · ${configuredColumns} col desktop · ${fixtureId}`, width, direction: 'VERTICAL', fill: { type: 'SOLID', color: { r: 0.965, g: 0.965, b: 0.965 } } });
  workArea.appendChild(witness);
  witness.setSharedPluginData(MARK_NS, WORK_KEY, INPUT.featureId);
  witness.setPluginData('scenarioId', scenarioId);
  witness.setPluginData('presentation', presentationForWidth(width));
  witness.setPluginData('configuredColumns', String(configuredColumns));
  witness.setPluginData('fixtureId', fixtureId);
  witness.setPluginData('authority', 'proposal-only-before-H2');
  setBound(witness, 'itemSpacing', 'space24', behaviorId);
  setBound(witness, 'paddingTop', 'space24', behaviorId);
  setBound(witness, 'paddingBottom', 'space24', behaviorId);
  addLabel(witness, `${width}px · ${presentationForWidth(width)} · réglage desktop ${configuredColumns} · ${fixtureId}`, 16);
  const innerWidth = width;
  const styleGrids = [];
  for (const style of ['Superpose', 'Empile']) {
    styleGrids.push(await makeStyleGrid({
      witness,
      style,
      width: innerWidth,
      configuredColumns,
      fixtureId,
      cardCount,
      orphanPolicy,
      behaviorId,
      mediaCases: mediaCasesByStyle[style] || [],
    }));
  }
  const responsiveCheck = overflowInspection(witness);
  const record = {
    scenarioId,
    frameId: witness.id,
    frameName: witness.name,
    width,
    presentation: presentationForWidth(width),
    configuredColumns,
    columnsControlExposed: width > 390,
    mobileCardsPerRow: width <= 390 ? 1 : null,
    fixtureId,
    cardCount,
    orphanPolicy,
    styleGrids,
    responsiveCheck,
    bounds: box(witness),
    obtainedBy: 'internal card adaptation plus explicit presentation composition in proposal frames',
    authority: 'proposal-only-before-H2',
  };
  frameRecords.push(record);
  if (reviewIds.has(scenarioId)) reviewFrames.push(record);
  return record;
};

try {
  const allBounds = dsPage.children.map(box).filter(Boolean);
  const furthestRight = allBounds.reduce((max, current) => Math.max(max, current.x + current.width), 0);
  workArea = figma.createSection();
  workArea.name = '029 · Categories responsive · Propositions H2';
  workArea.x = furthestRight + 800;
  workArea.y = 400;
  workArea.resizeWithoutConstraints(4300, 12000);
  workArea.setSharedPluginData(MARK_NS, WORK_KEY, INPUT.featureId);
  workArea.setPluginData('authority', 'proposal-only-after-H1');
  workArea.setPluginData('h1DecisionRef', INPUT.h1DecisionRef);
  workArea.setPluginData('writeBoundary', 'new-work-frames-only; governed-sets/pages/shared-dependencies-read-only');
  createdRootIds.push(workArea.id);

  let y = 180;
  for (const width of [320, 390, 834, 1200, 1440, 1728]) {
    const recordsForWidth = [];
    for (const configuredColumns of [2, 3]) {
      for (const fixtureId of ['normal', 'long']) {
        const record = await makeWitness({
          scenarioId: `matrix-${width}-c${configuredColumns}-${fixtureId}`,
          width,
          configuredColumns,
          fixtureId,
          orphanPolicy: 'preserve-track',
        });
        recordsForWidth.push(record);
      }
    }
    const positions = [
      { x: 160, row: 0 },
      { x: 160 + width + 160, row: 0 },
      { x: 160, row: 1 },
      { x: 160 + width + 160, row: 1 },
    ];
    const firstRowHeight = Math.max(recordsForWidth[0].bounds.height, recordsForWidth[1].bounds.height);
    const recordsForWidthNodes = await Promise.all(recordsForWidth.map((record) => figma.getNodeByIdAsync(record.frameId)));
    recordsForWidthNodes.forEach((node, index) => {
      node.x = positions[index].x;
      node.y = y + (positions[index].row === 0 ? 0 : firstRowHeight + 160);
    });
    const secondRowHeight = Math.max(recordsForWidth[2].bounds.height, recordsForWidth[3].bounds.height);
    y += firstRowHeight + secondRowHeight + 420;
  }

  const makeDecisionFrame = async ({ scenarioId, label, orphanPolicy, cardCount = 3, configuredColumns = 3, mediaCasesByStyle = {} }) => {
    const record = await makeWitness({ scenarioId, width: 834, configuredColumns, fixtureId: 'normal', cardCount, orphanPolicy, mediaCasesByStyle });
    const node = await figma.getNodeByIdAsync(record.frameId);
    node.name = `029 H2 décision · ${label}`;
    node.x = scenarioId.endsWith('stretch') || scenarioId === 'media-edges' ? 1154 : 160;
    node.y = y;
    reviewFrames.push(record);
    return record;
  };
  await makeDecisionFrame({ scenarioId: 'orphan-preserve', label: '2+1 conserve la largeur de piste', orphanPolicy: 'preserve-track' });
  await makeDecisionFrame({ scenarioId: 'orphan-stretch', label: '2+1 étire la carte orpheline', orphanPolicy: 'stretch' });
  y += Math.max(frameRecords.at(-2).bounds.height, frameRecords.at(-1).bounds.height) + 240;
  await makeDecisionFrame({ scenarioId: 'odd-count-preserve', label: '3 cartes avec réglage 2 · piste conservée', orphanPolicy: 'preserve-track', cardCount: 3, configuredColumns: 2 });
  await makeDecisionFrame({
    scenarioId: 'media-edges',
    label: 'médias absents et ratio atypique',
    orphanPolicy: 'preserve-track',
    cardCount: 2,
    configuredColumns: 2,
    mediaCasesByStyle: { Superpose: ['no-image', 'normal'], Empile: ['no-image', 'square'] },
  });
  y += Math.max(frameRecords.at(-2).bounds.height, frameRecords.at(-1).bounds.height) + 240;
  workArea.resizeWithoutConstraints(4300, Math.max(12000, y + 160));

  const afterProtected = await protectedSnapshot();
  const afterProtectedJson = JSON.stringify(afterProtected);
  if (afterProtectedJson !== beforeProtectedJson) throw new Error('H2 refused after creation: a protected existing fact changed');

  const responsiveImages = [];
  const exportManifest = [];
  const uniqueReviewFrames = [...new Map(reviewFrames.map((record) => [record.scenarioId, record])).values()];
  for (const record of uniqueReviewFrames) {
    const node = await figma.getNodeByIdAsync(record.frameId);
    const path = `${INPUT.evidenceRoot}/${record.scenarioId}.png`;
    const bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
    responsiveImages.push({ path, base64: figma.base64Encode(bytes) });
    exportManifest.push({ scenarioId: record.scenarioId, frameId: record.frameId, path, bounds: box(node), byteLength: bytes.byteLength });
    record.captureRef = path;
  }

  if (originalPage.id !== dsPage.id) await figma.setCurrentPageAsync(originalPage);
  return {
    schemaVersion: INPUT.schemaVersion,
    featureId: INPUT.featureId,
    run: '029-h2-create-work-frames',
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
      outsideGovernedMasters: workArea.parent?.id !== sectionSet.id && workArea.parent?.id !== cardSet.id,
      outsideProductPages: dsPage.name !== 'Pages',
      authority: 'proposal-only-before-H2',
    },
    proposedModel: {
      sectionPresentationCandidates: ['Mobile', 'Desktop', 'Wide'],
      columnsSettingStatement: 'Colonnes remains enum 2|3 and desktop-only; Mobile renders one card per row with no exposed column control.',
      cardExtentCandidate: 'internal-adaptation-only; retain existing Style variants and add no card state',
      addedCardStates: [],
      typographyOverrideCandidate: 'none; existing family, weight, styles, sizes, line heights and alignment are preserved in the proposal',
      intermediateThreeColumnBehavior: 'at 834 px, effective 2+1 rows are shown; owner must choose preserve-track or stretch-orphan',
    },
    frames: frameRecords,
    edgeCases: {
      orphanAlternatives: ['orphan-preserve', 'orphan-stretch'],
      oddCount: 'odd-count-preserve',
      media: 'media-edges',
    },
    exportManifest,
    inspection: {
      protectedExistingFactsUnchanged: true,
      protectedBefore: beforeProtected,
      protectedAfter: afterProtected,
      scenarioChecks: uniqueReviewFrames.map((record) => ({ scenarioId: record.scenarioId, selectedPresentation: record.presentation, captureRef: record.captureRef })),
      bindingFacts,
      typographyFacts,
      memberFacts: [],
      masterWrites: [],
      pageWrites: [],
      childWrites: [],
      sharedDependencyWrites: [],
    },
    figmaWrites: {
      createdWorkAreaNodeId: workArea.id,
      createdWorkFrameNodeIds: frameRecords.map((record) => record.frameId),
      changedExistingNodeIds: [],
    },
    responsiveImages,
    scriptResults: [{
      operationId: 'create-h2-categories-proposal-work-frames-after-H1',
      status: 'applied',
      createdNodeIds: [workArea.id, ...frameRecords.map((record) => record.frameId)],
      changedNodeIds: [],
      protectedExistingFactsUnchanged: true,
    }],
  };
} catch (error) {
  if (workArea && !workArea.removed) workArea.remove();
  if (originalPage.id !== figma.currentPage.id) await figma.setCurrentPageAsync(originalPage);
  throw error;
}
