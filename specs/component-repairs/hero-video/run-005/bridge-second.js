const INPUT = {"schemaVersion":"1.0.0","campaignId":"figma-responsive-hero-video-run-005","fileKey":"d9FYAUcqdcNtsuaMgLefvJ","fileVersionId":"2391949441294093693","run":"second","evidenceRoot":"specs/component-repairs/hero-video/run-005","operations":[{"operationId":"restore-wide-default-authoring-order","targetId":"hero-video","mechanism":"responsive-component-set","nodeId":"2151:5552","structuralPath":"0","changes":{"capability":"responsive-component-set"},"preconditions":[{"field":"nodeId","equals":"2151:5552"}],"postconditions":[{"field":"set.layoutMode","equals":"NONE"},{"field":"Presentation.defaultValue","equals":"Wide"},{"field":"Compact.authoringPreviewWidth","equals":390},{"field":"Desktop.authoringPreviewWidth","equals":1200},{"field":"Wide.authoringPreviewWidth","equals":1728},{"field":"pageWrites","equals":[]},{"field":"childWrites","equals":[]}],"source":"campaign.allowlist"}],"targets":[{"targetId":"hero-video","masterNodeId":"2151:5552","expectedMasterName":"HeroVideo","expectedVariantNames":[],"responsiveWidths":[320,390,834,1200,1440,1728],"subjectKind":"organism","responsive":{"componentSetTopology":{"propertyName":"Presentation","setName":"HeroVideo","setIdentityPolicy":"existing","historicalMember":{"presentationValue":"Wide","nodeId":"2151:5552","componentKey":"36011e51b8bc0b221a1ba6f9108709b5bd1c4490","declaredName":"Presentation=Wide","authoringPreviewWidth":1728},"createdMembers":[{"presentationValue":"Compact","declaredName":"Presentation=Compact","sourcePresentationValue":"Wide","nodeId":"2580:7378","authoringPreviewWidth":390},{"presentationValue":"Desktop","declaredName":"Presentation=Desktop","sourcePresentationValue":"Wide","nodeId":"2580:7385","authoringPreviewWidth":1200}],"expectedMemberNames":["Presentation=Compact","Presentation=Desktop","Presentation=Wide"],"setNodeId":"2580:7392","authoringLayout":{"direction":"VERTICAL","gap":48,"order":["Wide","Compact","Desktop"]},"defaultPresentationValue":"Wide"},"expectedCreates":[],"contentFixtures":[{"fixtureId":"default","textValues":{}},{"fixtureId":"long-title","textValues":{"3/0":"Des portes de garage et d’entrée pensées pour votre maison, installées et entretenues par nos équipes"}},{"fixtureId":"long-cta","textValues":{"4/1":"Toutes nos portes"}},{"fixtureId":"short-landscape","textValues":{}}],"presentationScenarios":[{"scenarioId":"320-compact-default","presentationValue":"Compact","width":320,"height":640,"fixtureId":"default","expectedOverflow":false},{"scenarioId":"320-compact-long-title","presentationValue":"Compact","width":320,"height":640,"fixtureId":"long-title","expectedOverflow":false},{"scenarioId":"320-compact-long-cta","presentationValue":"Compact","width":320,"height":640,"fixtureId":"long-cta","expectedOverflow":false},{"scenarioId":"390-compact-default","presentationValue":"Compact","width":390,"height":844,"fixtureId":"default","expectedOverflow":false},{"scenarioId":"390-compact-long-title","presentationValue":"Compact","width":390,"height":844,"fixtureId":"long-title","expectedOverflow":false},{"scenarioId":"390-compact-long-cta","presentationValue":"Compact","width":390,"height":844,"fixtureId":"long-cta","expectedOverflow":false},{"scenarioId":"834-compact-default","presentationValue":"Compact","width":834,"height":1112,"fixtureId":"default","expectedOverflow":false},{"scenarioId":"834-compact-long-title","presentationValue":"Compact","width":834,"height":1112,"fixtureId":"long-title","expectedOverflow":false},{"scenarioId":"834-compact-long-cta","presentationValue":"Compact","width":834,"height":1112,"fixtureId":"long-cta","expectedOverflow":false},{"scenarioId":"1200-desktop-default","presentationValue":"Desktop","width":1200,"height":800,"fixtureId":"default","expectedOverflow":false},{"scenarioId":"1200-desktop-long-title","presentationValue":"Desktop","width":1200,"height":800,"fixtureId":"long-title","expectedOverflow":false},{"scenarioId":"1200-desktop-long-cta","presentationValue":"Desktop","width":1200,"height":800,"fixtureId":"long-cta","expectedOverflow":false},{"scenarioId":"1440-wide-default","presentationValue":"Wide","width":1440,"height":720,"fixtureId":"default","expectedOverflow":false},{"scenarioId":"1440-wide-long-title","presentationValue":"Wide","width":1440,"height":720,"fixtureId":"long-title","expectedOverflow":false},{"scenarioId":"1440-wide-long-cta","presentationValue":"Wide","width":1440,"height":720,"fixtureId":"long-cta","expectedOverflow":false},{"scenarioId":"1728-wide-default","presentationValue":"Wide","width":1728,"height":720,"fixtureId":"default","expectedOverflow":false},{"scenarioId":"1728-wide-long-title","presentationValue":"Wide","width":1728,"height":720,"fixtureId":"long-title","expectedOverflow":false},{"scenarioId":"1728-wide-long-cta","presentationValue":"Wide","width":1728,"height":720,"fixtureId":"long-cta","expectedOverflow":false},{"scenarioId":"844x390-compact-short-landscape","presentationValue":"Compact","width":844,"height":390,"fixtureId":"short-landscape","expectedOverflow":false}],"presentationLayouts":[{"presentationValue":"Compact","nodePath":"","properties":{"layoutMode":"VERTICAL","layoutSizingHorizontal":"FIXED","layoutSizingVertical":"HUG","primaryAxisAlignItems":"CENTER","counterAxisAlignItems":"CENTER","clipsContent":false}},{"presentationValue":"Compact","nodePath":"3","properties":{"layoutSizingHorizontal":"FILL","layoutSizingVertical":"HUG","counterAxisAlignItems":"CENTER","clipsContent":false}},{"presentationValue":"Compact","nodePath":"3/0","properties":{"layoutSizingHorizontal":"FILL","layoutSizingVertical":"HUG","textAutoResize":"HEIGHT"}},{"presentationValue":"Compact","nodePath":"4","properties":{"layoutSizingHorizontal":"HUG","layoutSizingVertical":"HUG"}},{"presentationValue":"Desktop","nodePath":"","properties":{"layoutMode":"VERTICAL","layoutSizingHorizontal":"FIXED","layoutSizingVertical":"HUG","primaryAxisAlignItems":"CENTER","counterAxisAlignItems":"CENTER","clipsContent":false}},{"presentationValue":"Desktop","nodePath":"3","properties":{"layoutSizingHorizontal":"FILL","layoutSizingVertical":"HUG","counterAxisAlignItems":"CENTER","clipsContent":false}},{"presentationValue":"Desktop","nodePath":"3/0","properties":{"layoutSizingHorizontal":"FILL","layoutSizingVertical":"HUG","textAutoResize":"HEIGHT"}},{"presentationValue":"Desktop","nodePath":"4","properties":{"layoutSizingHorizontal":"HUG","layoutSizingVertical":"HUG"}},{"presentationValue":"Wide","nodePath":"","properties":{"layoutMode":"HORIZONTAL","layoutSizingHorizontal":"FIXED","layoutSizingVertical":"FIXED","counterAxisAlignItems":"MAX","clipsContent":false}}],"primitiveBindings":[{"presentationValue":"Compact","nodePath":"","property":"minHeight","variableId":"VariableID:2188:9590","variableName":"space/597","resolvedValue":597},{"presentationValue":"Compact","nodePath":"","property":"paddingTop","variableId":"VariableID:2183:7969","variableName":"space/24","resolvedValue":24},{"presentationValue":"Compact","nodePath":"","property":"paddingRight","variableId":"VariableID:2183:7969","variableName":"space/24","resolvedValue":24},{"presentationValue":"Compact","nodePath":"","property":"paddingBottom","variableId":"VariableID:2183:7969","variableName":"space/24","resolvedValue":24},{"presentationValue":"Compact","nodePath":"","property":"paddingLeft","variableId":"VariableID:2183:7969","variableName":"space/24","resolvedValue":24},{"presentationValue":"Compact","nodePath":"","property":"itemSpacing","variableId":"VariableID:2183:7969","variableName":"space/24","resolvedValue":24},{"presentationValue":"Desktop","nodePath":"","property":"minHeight","variableId":"VariableID:2188:9590","variableName":"space/597","resolvedValue":597},{"presentationValue":"Desktop","nodePath":"","property":"paddingTop","variableId":"VariableID:2183:7970","variableName":"space/48","resolvedValue":48},{"presentationValue":"Desktop","nodePath":"","property":"paddingRight","variableId":"VariableID:2183:7970","variableName":"space/48","resolvedValue":48},{"presentationValue":"Desktop","nodePath":"","property":"paddingBottom","variableId":"VariableID:2183:7970","variableName":"space/48","resolvedValue":48},{"presentationValue":"Desktop","nodePath":"","property":"paddingLeft","variableId":"VariableID:2183:7970","variableName":"space/48","resolvedValue":48},{"presentationValue":"Desktop","nodePath":"","property":"itemSpacing","variableId":"VariableID:2183:7969","variableName":"space/24","resolvedValue":24},{"presentationValue":"Wide","nodePath":"","property":"height","variableId":"VariableID:2434:5919","variableName":"size/hero-video/root","resolvedValue":720}],"typographyOverrides":[{"presentationValue":"Compact","nodePath":"3/0","sourceRole":"Titre Hero vidéo","sourceTextStyleId":"S:4d9e45c66ab28d215c049c57e17d71aa93272912,","allowedFields":["fontSize","lineHeight","textAlignHorizontal"],"before":{"fontSize":44,"lineHeight":48,"textAlignHorizontal":"LEFT"},"after":{"fontSize":32,"lineHeight":40,"textAlignHorizontal":"CENTER"},"family":"Montserrat","weight":400,"characters":"Le numéro 1 des portes HÖRMANN en Province de Liège !","debtStatus":"pending-responsive-text-style","ownerDecisionRef":"specs/028-figma-responsive-hero-video/decisions/H2-design.json"},{"presentationValue":"Desktop","nodePath":"3/0","sourceRole":"Titre Hero vidéo","sourceTextStyleId":"S:4d9e45c66ab28d215c049c57e17d71aa93272912,","allowedFields":["fontSize","lineHeight","textAlignHorizontal"],"before":{"fontSize":44,"lineHeight":48,"textAlignHorizontal":"LEFT"},"after":{"fontSize":40,"lineHeight":48,"textAlignHorizontal":"CENTER"},"family":"Montserrat","weight":400,"characters":"Le numéro 1 des portes HÖRMANN en Province de Liège !","debtStatus":"pending-responsive-text-style","ownerDecisionRef":"specs/028-figma-responsive-hero-video/decisions/H2-design.json"}]}}],"writeBoundary":{"allowedExistingNodeIds":["2448:4731","2580:7392","2580:7378","2580:7385","2151:5552"],"expectedChangedNodeIds":["2580:7392","2580:7378","2580:7385","2151:5552"],"readOnlySurfaceNodeIds":["2170:6351","210:326","210:473"],"protectedDependencyNodeIds":["6:135","6:99","6:104"],"protectedChildNodeIds":["2563:5956","2563:5957","2563:5958","2563:5960","2563:5966","I2170:6351;2563:5966","I2170:6351;2563:5966;2410:6133"],"protectedChildPaths":["0","1","2","3","3/0","4","4/0","4/1","4/2"],"allowedCreateRoles":[],"pageWrites":[],"childWrites":[]}};
const GENERATED_RUNNERS = {};
await figma.loadAllPagesAsync();
if (figma.fileKey !== INPUT.fileKey) throw new Error('Wrong Figma file: expected ' + INPUT.fileKey + ', got ' + figma.fileKey);
const MARK_NS = 'ds_contracts';
const MARK_KEY = 'organismContainerFor';
const TEXT_STYLE_MARK = 'textStyleToken';
const all = [];
for (const page of figma.root.children) for (const node of page.findAll(() => true)) all.push(node);
const pageOf = (node) => { let cursor = node; while (cursor && cursor.type !== 'PAGE') cursor = cursor.parent; return cursor; };
const componentLike = (node) => node && (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET' || node.type === 'INSTANCE');
const masterLike = (node) => node && (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET');
// One pass over the script-start snapshot builds both lookups. Operations keep
// resolving against pre-mutation state exactly as the per-operation filters
// over `all` did — a container created mid-run was never visible to either.
const mastersByName = new Map();
const markedContainersByTarget = new Map();
for (const node of all) {
  if (masterLike(node)) {
    const bucket = mastersByName.get(node.name);
    if (bucket) bucket.push(node); else mastersByName.set(node.name, [node]);
  } else if (node.type === 'FRAME') {
    const mark = node.getSharedPluginData(MARK_NS, MARK_KEY);
    if (mark) {
      const bucket = markedContainersByTarget.get(mark);
      if (bucket) bucket.push(node); else markedContainersByTarget.set(mark, [node]);
    }
  }
}
const sameNamedMasters = (name) => mastersByName.get(name) ?? [];
const markedContainers = (targetId) => markedContainersByTarget.get(targetId) ?? [];
const resolvePath = (root, structuralPath) => {
  let node = root;
  for (const raw of String(structuralPath || '').split('/').filter(Boolean)) {
    const index = Number(raw);
    if (!Number.isInteger(index) || !node || !('children' in node) || !node.children[index]) throw new Error('Structural path drift: ' + structuralPath);
    node = node.children[index];
  }
  return node;
};
const readPrecondition = (node, root, operation, field) => {
  if (field === 'nodeId' || field === 'masterNodeId') return root.id;
  if (field === 'resolvedNodeId') return node.id;
  if (field === 'nodeType') return node.type;
  if (field === 'structuralPath') return operation.structuralPath;
  if (field === 'characters') return node.type === 'TEXT' ? node.characters : undefined;
  if (field === 'layoutSizingHorizontal') return 'layoutSizingHorizontal' in node ? node.layoutSizingHorizontal : undefined;
  if (field === 'layoutSizingVertical') return 'layoutSizingVertical' in node ? node.layoutSizingVertical : undefined;
  if (field === 'primaryAxisAlignItems') return 'primaryAxisAlignItems' in node ? node.primaryAxisAlignItems : undefined;
  if (field === 'nodeName') return node.name;
  if (field === 'childOrder') return 'children' in node ? node.children.map((child) => child.id).join(',') : undefined;
  if (field === 'width') return node.width;
  if (field === 'height') return node.height;
  if (['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].includes(field)) return field in node ? node[field] : undefined;
  if (field === 'textStyleId') return node.type === 'TEXT' && typeof node.textStyleId === 'string' ? node.textStyleId : null;
  if (field === 'textAlignHorizontal') return node.type === 'TEXT' ? node.textAlignHorizontal : undefined;
  throw new Error('Unsupported set-properties precondition: ' + field);
};
const assertOperationPreconditions = (node, root, operation) => {
  for (const precondition of operation.preconditions) {
    const actual = readPrecondition(node, root, operation, precondition.field);
    if (actual !== precondition.equals) throw new Error('Precondition drift ' + operation.operationId + '/' + precondition.field + ': expected ' + JSON.stringify(precondition.equals) + ', got ' + JSON.stringify(actual));
  }
};
const loadTextFonts = async (node) => {
  if (node.characters.length === 0) return;
  for (const font of node.getRangeAllFontNames(0, node.characters.length)) await figma.loadFontAsync(font);
};
let governedStyleByToken = null;
const governedTextStyle = async (tokenPath, expectedName) => {
  if (!governedStyleByToken) {
    governedStyleByToken = new Map();
    for (const style of await figma.getLocalTextStylesAsync()) {
      const token = style.getSharedPluginData(MARK_NS, TEXT_STYLE_MARK);
      if (!token) continue;
      if (governedStyleByToken.has(token)) throw new Error('Duplicate governed Text Style token: ' + token);
      governedStyleByToken.set(token, style);
    }
  }
  const style = governedStyleByToken.get(tokenPath);
  if (!style || style.name !== expectedName) throw new Error('Governed Text Style missing or renamed: ' + tokenPath + '/' + expectedName);
  return style;
};
const fontKey = (font) => font.family + '|' + font.style;
const richTextMatches = (node, rich) => {
  const expected = Array(node.characters.length).fill(fontKey(rich.baseFont));
  for (const range of rich.ranges) {
    if (range.start < 0 || range.end > node.characters.length || range.end <= range.start) throw new Error('Rich range outside text bounds: ' + range.start + '..' + range.end);
    expected.fill(fontKey(range.font), range.start, range.end);
  }
  const actual = Array(node.characters.length).fill('');
  for (const segment of node.getStyledTextSegments(['fontName'])) actual.fill(fontKey(segment.fontName), segment.start, segment.end);
  return expected.every((value, index) => actual[index] === value);
};
const applySetProperties = async (operation) => {
  const root = await figma.getNodeByIdAsync(operation.nodeId);
  if (!root || !masterLike(root)) throw new Error('Pinned set-properties master absent: ' + operation.nodeId);
  if (pageOf(root)?.name === 'Pages') throw new Error('Refused Page master write: ' + root.id);
  const node = resolvePath(root, operation.structuralPath);
  const changes = operation.changes;
  // A bounded text-align operation is already a valid second-run no-op once
  // its native postcondition holds. Its first-run precondition intentionally
  // describes the *old* value, so asserting it again would make an otherwise
  // idempotent repair fail before it can report no-op.
  const textAlignAlreadyApplied = INPUT.run === 'second' && changes.textAlign &&
    node.type === 'TEXT' && node.textAlignHorizontal === changes.textAlign.value;
  if (!textAlignAlreadyApplied) assertOperationPreconditions(node, root, operation);
  let changed = false;
  if (Object.prototype.hasOwnProperty.call(changes, 'layoutSizingHorizontal')) {
    if (!('layoutSizingHorizontal' in node)) throw new Error('Layout sizing unsupported at ' + operation.structuralPath);
    if (node.layoutSizingHorizontal !== changes.layoutSizingHorizontal) { node.layoutSizingHorizontal = changes.layoutSizingHorizontal; changed = true; }
  } else if (changes.layout) {
    const layout = changes.layout;
    for (const field of ['layoutMode', 'primaryAxisAlignItems']) {
      if (Object.prototype.hasOwnProperty.call(layout, field)) {
        if (!(field in node)) throw new Error('Auto-layout property unsupported at ' + operation.structuralPath + '/' + field);
        if (node[field] !== layout[field]) { node[field] = layout[field]; changed = true; }
      }
    }
    for (const field of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) {
      if (Object.prototype.hasOwnProperty.call(layout, field)) {
        if (!(field in node)) throw new Error('Layout padding unsupported at ' + operation.structuralPath + '/' + field);
        if (node[field] !== layout[field]) { node[field] = layout[field]; changed = true; }
      }
    }
    if (Object.prototype.hasOwnProperty.call(layout, 'width')) {
      if (layout.width !== 'parent' || !node.parent || !('width' in node.parent) || !('resize' in node)) throw new Error('Parent-owned width unsupported at ' + operation.structuralPath);
      if (Math.abs(node.width - node.parent.width) > 0.01) { node.resize(node.parent.width, node.height); changed = true; }
    }
    if (Object.prototype.hasOwnProperty.call(layout, 'horizontalConstraint') || Object.prototype.hasOwnProperty.call(layout, 'verticalConstraint')) {
      if (!('constraints' in node)) throw new Error('Constraints unsupported at ' + operation.structuralPath);
      const next = { ...node.constraints,
        ...(Object.prototype.hasOwnProperty.call(layout, 'horizontalConstraint') ? { horizontal: layout.horizontalConstraint } : {}),
        ...(Object.prototype.hasOwnProperty.call(layout, 'verticalConstraint') ? { vertical: layout.verticalConstraint } : {}) };
      if (node.constraints?.horizontal !== next.horizontal || node.constraints?.vertical !== next.vertical) { node.constraints = next; changed = true; }
    }
    if (Object.prototype.hasOwnProperty.call(layout, 'layoutPositioning')) {
      if (!('layoutPositioning' in node)) throw new Error('Layout positioning unsupported at ' + operation.structuralPath);
      if (node.layoutPositioning !== layout.layoutPositioning) { node.layoutPositioning = layout.layoutPositioning; changed = true; }
    }
    for (const field of ['x', 'y']) if (Object.prototype.hasOwnProperty.call(layout, field) && node[field] !== layout[field]) { node[field] = layout[field]; changed = true; }
    for (const field of ['layoutSizingHorizontal', 'layoutSizingVertical']) {
      if (Object.prototype.hasOwnProperty.call(layout, field)) {
        if (!(field in node)) throw new Error('Layout sizing unsupported at ' + operation.structuralPath + '/' + field);
        if (node[field] !== layout[field]) { node[field] = layout[field]; changed = true; }
      }
    }
  } else if (changes.textStyle) {
    if (node.type !== 'TEXT') throw new Error('Text Style target is not TEXT at ' + operation.structuralPath);
    const style = await governedTextStyle(changes.textStyle.tokenPath, changes.textStyle.name);
    if (node.textStyleId !== style.id) {
      await loadTextFonts(node);
      await node.setTextStyleIdAsync(style.id);
      changed = true;
    }
  } else if (changes.textAlign) {
    // L'enum est refusé à l'ÉMISSION (validateBridgeOperation, appelé sur
    // chaque opération par emitBridgeApplyScript) : le re-tester ici ferait une
    // deuxième allowlist, et c'est la copie non testée qui dériverait. Les
    // familles voisines (layoutSizingHorizontal, layout) ne re-testent pas les
    // leurs, pour exactement cette raison.
    if (node.type !== 'TEXT') throw new Error('Text-align target is not TEXT at ' + operation.structuralPath);
    if (node.textAlignHorizontal !== changes.textAlign.value) {
      await loadTextFonts(node);
      node.textAlignHorizontal = changes.textAlign.value;
      changed = true;
    }
  } else if (changes.richText) {
    if (node.type !== 'TEXT') throw new Error('Rich-range target is not TEXT at ' + operation.structuralPath);
    if (typeof node.textStyleId === 'string' && node.textStyleId) throw new Error('Rich-range target unexpectedly owns a whole-node Text Style: ' + node.id);
    const rich = changes.richText;
    if (!richTextMatches(node, rich)) {
      await loadTextFonts(node);
      await figma.loadFontAsync(rich.baseFont);
      for (const range of rich.ranges) await figma.loadFontAsync(range.font);
      node.setRangeFontName(0, node.characters.length, rich.baseFont);
      for (const range of rich.ranges) node.setRangeFontName(range.start, range.end, range.font);
      changed = true;
    }
  } else throw new Error('Unsupported set-properties change: ' + operation.operationId);
  if (Object.prototype.hasOwnProperty.call(changes, 'layoutSizingHorizontal') && node.layoutSizingHorizontal !== changes.layoutSizingHorizontal) throw new Error('Layout postcondition failed: ' + operation.operationId);
  if (changes.layout) {
    for (const field of ['layoutMode', 'primaryAxisAlignItems', 'layoutPositioning', 'layoutSizingHorizontal', 'layoutSizingVertical', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'x', 'y']) {
      if (Object.prototype.hasOwnProperty.call(changes.layout, field) && node[field] !== changes.layout[field]) throw new Error('Layout postcondition failed: ' + operation.operationId + '/' + field);
    }
    if (changes.layout.width === 'parent' && Math.abs(node.width - node.parent.width) > 0.01) throw new Error('Layout postcondition failed: ' + operation.operationId + '/width');
    if (Object.prototype.hasOwnProperty.call(changes.layout, 'horizontalConstraint') && node.constraints?.horizontal !== changes.layout.horizontalConstraint) throw new Error('Layout postcondition failed: ' + operation.operationId + '/horizontalConstraint');
    if (Object.prototype.hasOwnProperty.call(changes.layout, 'verticalConstraint') && node.constraints?.vertical !== changes.layout.verticalConstraint) throw new Error('Layout postcondition failed: ' + operation.operationId + '/verticalConstraint');
  }
  if (changes.textStyle) {
    const expected = await governedTextStyle(changes.textStyle.tokenPath, changes.textStyle.name);
    if (node.textStyleId !== expected.id) throw new Error('Text Style postcondition failed: ' + operation.operationId);
  }
  if (changes.textAlign && node.textAlignHorizontal !== changes.textAlign.value) throw new Error('Text-align postcondition failed: ' + operation.operationId);
  if (changes.richText && !richTextMatches(node, changes.richText)) throw new Error('Rich-range postcondition failed: ' + operation.operationId);
  return { node, changed };
};
const boundsOutside = (inner, outer) => !inner || !outer || inner.x < outer.x - 0.01 || inner.y < outer.y - 0.01 || inner.x + inner.width > outer.x + outer.width + 0.01 || inner.y + inner.height > outer.y + outer.height + 0.01;
const effectivelyVisible = (node, stop) => {
  for (let cursor = node; cursor && cursor !== stop; cursor = cursor.parent) if (cursor.visible === false) return false;
  return true;
};
const descendantOverflow = (master, container) => {
  const issues = [];
  const nodes = [master, ...master.findAll(() => true)].filter((node) => effectivelyVisible(node, container));
  for (const node of nodes) {
    const box = node.absoluteBoundingBox;
    if (boundsOutside(box, container.absoluteBoundingBox)) { issues.push({ nodeId: node.id, reason: 'container' }); continue; }
    for (let ancestor = node.parent; ancestor && ancestor !== container; ancestor = ancestor.parent) {
      if (ancestor.clipsContent === true && boundsOutside(box, ancestor.absoluteBoundingBox)) {
        issues.push({ nodeId: node.id, reason: 'clipped-by:' + ancestor.id });
        break;
      }
    }
  }
  return issues;
};
const valueAt = (value) => value && typeof value === 'object' && 'value' in value ? value.value : value;
const boundVariableId = (node, field) => {
  const direct = node.boundVariables && node.boundVariables[field];
  const dimension = node.boundVariables && node.boundVariables.size &&
    (field === 'width' ? node.boundVariables.size.x : field === 'height' ? node.boundVariables.size.y : null);
  const binding = direct || dimension;
  if (!binding) return null;
  if (Array.isArray(binding)) return binding[0] && (binding[0].id || binding[0].variableId) || null;
  return binding.id || binding.variableId || null;
};
const sameValue = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const applyPresentationLayout = (member, layout) => {
  const node = resolvePath(member, layout.nodePath);
  let changed = false;
  for (const [field, value] of Object.entries(layout.properties)) {
    if (!(field in node)) throw new Error('Responsive layout field unsupported: ' + layout.presentationValue + '/' + layout.nodePath + '/' + field);
    if (!sameValue(node[field], value)) { node[field] = value; changed = true; }
  }
  return changed;
};
const applyPrimitiveBinding = async (member, binding, historicalPresentation) => {
  const node = resolvePath(member, binding.nodePath);
  const currentBindingId = boundVariableId(node, binding.property);
  if (binding.presentationValue === historicalPresentation) {
    if (currentBindingId === binding.variableId && Math.abs(Number(valueAt(node[binding.property])) - binding.resolvedValue) <= 0.01) return false;
    // combineAsVariants may natively detach a dimension binding and switch the
    // preserved member to FILL while forming the set. The first run restores the
    // explicitly declared historical binding; the second run must never repair.
    if (INPUT.run === 'second') throw new Error('Historical primitive binding drift on second pass: ' + binding.presentationValue + '/' + binding.nodePath + '/' + binding.property);
    if (!(binding.property in node) || typeof node.setBoundVariable !== 'function') throw new Error('Historical primitive binding field unsupported: ' + binding.property);
    const variable = await figma.variables.getVariableByIdAsync(binding.variableId);
    if (!variable || variable.name !== binding.variableName) throw new Error('Historical primitive variable missing or renamed: ' + binding.variableId + '/' + binding.variableName);
    if (binding.property === 'height' && 'layoutSizingVertical' in node && node.layoutSizingVertical !== 'FIXED') node.layoutSizingVertical = 'FIXED';
    if (binding.property === 'width' && 'layoutSizingHorizontal' in node && node.layoutSizingHorizontal !== 'FIXED') node.layoutSizingHorizontal = 'FIXED';
    if ((binding.property === 'height' || binding.property === 'width') && typeof node.resize === 'function') {
      node.resize(binding.property === 'width' ? binding.resolvedValue : node.width, binding.property === 'height' ? binding.resolvedValue : node.height);
    } else node[binding.property] = binding.resolvedValue;
    node.setBoundVariable(binding.property, variable);
    if (boundVariableId(node, binding.property) !== binding.variableId || Math.abs(Number(valueAt(node[binding.property])) - binding.resolvedValue) > 0.01) {
      throw new Error('Historical primitive binding restoration failed: ' + binding.property);
    }
    return true;
  }
  if (!(binding.property in node) || typeof node.setBoundVariable !== 'function') throw new Error('Primitive binding field unsupported: ' + binding.property);
  if (currentBindingId === binding.variableId && Math.abs(Number(valueAt(node[binding.property])) - binding.resolvedValue) <= 0.01) return false;
  const variable = await figma.variables.getVariableByIdAsync(binding.variableId);
  if (!variable || variable.name !== binding.variableName) throw new Error('Primitive variable missing or renamed: ' + binding.variableId + '/' + binding.variableName);
  if ((binding.property === 'height' || binding.property === 'width') && typeof node.resize === 'function') {
    node.resize(binding.property === 'width' ? binding.resolvedValue : node.width, binding.property === 'height' ? binding.resolvedValue : node.height);
  } else node[binding.property] = binding.resolvedValue;
  node.setBoundVariable(binding.property, variable);
  if (boundVariableId(node, binding.property) !== binding.variableId) throw new Error('Primitive binding postcondition failed: ' + binding.property);
  return true;
};
const textMetric = (node, field) => {
  if (field === 'lineHeight') return valueAt(node.lineHeight);
  return valueAt(node[field]);
};
const applyTypographyOverride = async (member, override) => {
  const node = resolvePath(member, override.nodePath);
  if (node.type !== 'TEXT') throw new Error('Responsive typography target is not TEXT: ' + override.nodePath);
  const family = node.fontName && node.fontName.family;
  const weight = typeof node.fontWeight === 'number' ? node.fontWeight : override.weight;
  if (family !== override.family || weight !== override.weight || node.characters !== override.characters ||
    (typeof node.textStyleId === 'string' && node.textStyleId && node.textStyleId !== override.sourceTextStyleId)) {
    throw new Error('Responsive typography protected fact drift: ' + override.presentationValue + '/' + override.nodePath);
  }
  await loadTextFonts(node);
  let changed = false;
  for (const field of override.allowedFields) {
    const expected = override.after[field];
    if (expected === undefined || sameValue(textMetric(node, field), expected)) continue;
    if (field === 'lineHeight') node.lineHeight = { unit: 'PIXELS', value: expected };
    else node[field] = expected;
    changed = true;
  }
  const debt = node.getSharedPluginData(MARK_NS, 'responsiveTypographyDebt');
  if (debt !== override.debtStatus) { node.setSharedPluginData(MARK_NS, 'responsiveTypographyDebt', override.debtStatus); changed = true; }
  return changed;
};
const memberByPresentation = (set, responsive, presentation) => {
  const topology = responsive.componentSetTopology;
  const expectedName = presentation === topology.historicalMember.presentationValue
    ? topology.historicalMember.declaredName
    : topology.createdMembers.find((member) => member.presentationValue === presentation)?.declaredName;
  if (!expectedName) throw new Error('Unknown responsive presentation: ' + presentation);
  const members = set.children.filter((node) => node.type === 'COMPONENT' && node.name === expectedName);
  if (members.length !== 1) throw new Error('Responsive member cardinality drift: ' + expectedName + '/' + members.length);
  return members[0];
};
const walkMember = (root, visit, structuralPath = '') => {
  visit(root, structuralPath);
  if (!('children' in root)) return;
  root.children.forEach((child, index) => walkMember(child, visit, structuralPath ? structuralPath + '/' + index : String(index)));
};
const comparableMemberFacts = (member, presentationValue) => {
  const namesAndRoles = [];
  const media = [];
  const texts = [];
  const componentProperties = [];
  const sharedChildren = [];
  walkMember(member, (node, structuralPath) => {
    namesAndRoles.push({ structuralPath, type: node.type, name: node.name });
    for (const field of ['fills', 'backgrounds']) if (Array.isArray(node[field])) node[field].forEach((paint, index) => {
      if (paint && (paint.type === 'IMAGE' || paint.type === 'VIDEO' || String(paint.type).startsWith('GRADIENT_'))) {
        media.push({ structuralPath, field, index, paint });
      }
    });
    if (node.type === 'TEXT') texts.push({ structuralPath, name: node.name, characters: node.characters });
    // Figma throws when componentPropertyDefinitions is read from a variant
    // member. Only standalone components and component sets own definitions;
    // instances may expose values/references.
    const mayOwnDefinitions = node.type === 'COMPONENT_SET' || (node.type === 'COMPONENT' && node.parent?.type !== 'COMPONENT_SET');
    const definitions = mayOwnDefinitions ? node.componentPropertyDefinitions : undefined;
    const values = node.type === 'INSTANCE' ? node.componentProperties : undefined;
    const references = node.type === 'INSTANCE' ? node.componentPropertyReferences : undefined;
    if (definitions || values || references) {
      const withoutPresentation = (value) => Object.fromEntries(Object.entries(value || {}).filter(([key]) => !key.startsWith('Presentation')));
      componentProperties.push({
        structuralPath,
        definitions: withoutPresentation(definitions),
        values: withoutPresentation(values),
        references: withoutPresentation(references),
      });
    }
    // mainComponent is sync-forbidden with documentAccess=dynamic-page. REST
    // capture owns the authoritative async instance-link proof; this live fact
    // uses componentId when the runtime exposes it and otherwise stays null.
    if (node.type === 'INSTANCE') sharedChildren.push({ structuralPath, componentId: typeof node.componentId === 'string' ? node.componentId : null, componentProperties: node.componentProperties || {} });
  });
  return {
    presentationValue,
    authoringPreview: {
      width: member.width,
      layoutSizingHorizontal: 'layoutSizingHorizontal' in member ? member.layoutSizingHorizontal : null,
    },
    namesAndRoles,
    media,
    texts,
    componentProperties,
    sharedChildren,
  };
};
const arrangeResponsiveComponentSet = (set, responsive, host) => {
  // A component set is an authoring catalogue, not a breakpoint container.
  // Variant roots therefore keep explicit representative widths while proof
  // instances exercise FILL inside their own breakpoint frames.
  const topology = responsive.componentSetTopology;
  const changedNodeIds = new Set();
  const assignSet = (field, value) => {
    if (!(field in set)) throw new Error('Responsive component-set layout field unsupported: ' + field);
    if (!sameValue(set[field], value)) { set[field] = value; changedNodeIds.add(set.id); }
  };
  const setWasAutoLayout = set.layoutMode !== 'NONE';
  assignSet('layoutMode', 'NONE');
  if (setWasAutoLayout) for (const member of set.children.filter((node) => node.type === 'COMPONENT')) changedNodeIds.add(member.id);
  if ('layoutSizingVertical' in set) assignSet('layoutSizingVertical', 'FIXED');

  const declarations = new Map([
    [topology.historicalMember.presentationValue, topology.historicalMember],
    ...topology.createdMembers.map((member) => [member.presentationValue, member]),
  ]);
  let y = 0;
  let maxWidth = 0;
  let memberPositionChanged = false;
  for (const presentationValue of topology.authoringLayout.order) {
    const declaration = declarations.get(presentationValue);
    const member = memberByPresentation(set, responsive, presentationValue);
    if (!declaration) throw new Error('Responsive authoring declaration absent: ' + presentationValue);
    if (topology.setIdentityPolicy === 'existing' && declaration.nodeId && member.id !== declaration.nodeId) {
      throw new Error('Responsive presentation member id drift: ' + presentationValue);
    }
    if ('layoutSizingHorizontal' in member && member.layoutSizingHorizontal !== 'FIXED') {
      member.layoutSizingHorizontal = 'FIXED';
      changedNodeIds.add(member.id);
    }
    if (Math.abs(member.width - declaration.authoringPreviewWidth) > 0.01) {
      member.resize(declaration.authoringPreviewWidth, member.height);
      changedNodeIds.add(member.id);
    }
    if (member.x !== 0) { member.x = 0; changedNodeIds.add(member.id); memberPositionChanged = true; }
    if (member.y !== y) { member.y = y; changedNodeIds.add(member.id); memberPositionChanged = true; }
    maxWidth = Math.max(maxWidth, declaration.authoringPreviewWidth);
    y += member.height + topology.authoringLayout.gap;
  }
  const totalHeight = y - topology.authoringLayout.gap;
  // Figma derives a variant property's default from the top-left member. A
  // member move therefore also changes the set's component-property metadata.
  if (memberPositionChanged) changedNodeIds.add(set.id);
  if (Math.abs(set.width - maxWidth) > 0.01 || Math.abs(set.height - totalHeight) > 0.01) {
    set.resize(maxWidth, totalHeight);
    changedNodeIds.add(set.id);
    changedNodeIds.add(host.id);
  }
  if (host.layoutMode && host.layoutMode !== 'NONE' && 'layoutSizingHorizontal' in set) assignSet('layoutSizingHorizontal', 'FILL');
  return changedNodeIds;
};
const applyResponsiveComponentSet = async (operation, target) => {
  const responsive = target.responsive;
  const topology = responsive && responsive.componentSetTopology;
  const boundary = INPUT.writeBoundary;
  if (!responsive || !topology || !boundary) throw new Error('responsive-operation-not-allowlisted: missing responsive target/boundary payload');
  const denied = new Set([...boundary.readOnlySurfaceNodeIds, ...boundary.protectedDependencyNodeIds, ...boundary.protectedChildNodeIds]);
  if (!boundary.allowedExistingNodeIds.includes(operation.nodeId) || denied.has(operation.nodeId)) throw new Error('page-write-forbidden/shared-child-write-forbidden: ' + operation.nodeId);
  const historical = await figma.getNodeByIdAsync(operation.nodeId);
  if (!historical || historical.type !== 'COMPONENT') throw new Error('Pinned historical component absent: ' + operation.nodeId);
  if (historical.key !== topology.historicalMember.componentKey) throw new Error('Historical component key drift: ' + historical.id);
  if (pageOf(historical)?.name === 'Pages') throw new Error('page-write-forbidden: ' + historical.id);
  let set = historical.parent && historical.parent.type === 'COMPONENT_SET' ? historical.parent : null;
  const host = set ? set.parent : historical.parent;
  if (!host || host.type === 'PAGE' || !boundary.allowedExistingNodeIds.includes(host.id)) {
    throw new Error('responsive-operation-not-allowlisted: component-set host ' + (host && host.id || 'absent'));
  }
  let createdNodes = [];
  const changedNodeIds = new Set();
  if (topology.setIdentityPolicy === 'existing' && (!set || set.id !== topology.setNodeId)) {
    throw new Error('Pinned responsive component set absent or replaced: ' + String(topology.setNodeId || 'absent'));
  }
  if (!set) {
    if (topology.setIdentityPolicy !== 'additive') throw new Error('Existing responsive topology cannot create a component set');
    if (INPUT.run === 'second') throw new Error('second-pass-not-noop: responsive set is absent');
    const createdMembers = [];
    for (const declaration of topology.createdMembers) {
      const clone = historical.clone();
      clone.name = declaration.declaredName;
      createdMembers.push(clone);
    }
    historical.name = topology.historicalMember.declaredName;
    set = figma.combineAsVariants([...createdMembers, historical], host);
    set.name = topology.setName;
    const nodesByName = new Map([[topology.setName, set], ...createdMembers.map((node) => [node.name, node])]);
    createdNodes = responsive.expectedCreates.map((expected) => {
      const node = nodesByName.get(expected.declaredName);
      if (!node) throw new Error('Declared create has no created node: ' + expected.role + '/' + expected.declaredName);
      return { nodeId: node.id, role: expected.role, declaredName: expected.declaredName, ...(expected.presentationValue ? { presentationValue: expected.presentationValue } : {}) };
    });
    changedNodeIds.add(historical.id);
    changedNodeIds.add(host.id);
  }
  const names = set.children.filter((node) => node.type === 'COMPONENT').map((node) => node.name).sort();
  const expectedNames = [...topology.expectedMemberNames].sort();
  const propertyDefinition = set.componentPropertyDefinitions && set.componentPropertyDefinitions[topology.propertyName];
  const expectedOptions = [topology.historicalMember.presentationValue, ...topology.createdMembers.map((member) => member.presentationValue)].sort();
  const observedOptions = propertyDefinition && Array.isArray(propertyDefinition.variantOptions) ? [...propertyDefinition.variantOptions].sort() : [];
  if (!sameValue(names, expectedNames) || set.name !== topology.setName || historical.name !== topology.historicalMember.declaredName) {
    throw new Error('Responsive component-set topology drift');
  }
  if (!propertyDefinition || propertyDefinition.type !== 'VARIANT' || !sameValue(observedOptions, expectedOptions)) {
    throw new Error('Responsive Presentation property drift: ' + topology.propertyName);
  }
  for (const binding of responsive.primitiveBindings) {
    const member = memberByPresentation(set, responsive, binding.presentationValue);
    if (await applyPrimitiveBinding(member, binding, topology.historicalMember.presentationValue)) changedNodeIds.add(member.id);
  }
  // Bind dimensions first: native resize/setBoundVariable can reset a member's
  // layout sizing to FIXED. Declared presentation layout is the final authority.
  for (const layout of responsive.presentationLayouts) {
    const member = memberByPresentation(set, responsive, layout.presentationValue);
    if (applyPresentationLayout(member, layout)) changedNodeIds.add(member.id);
  }
  for (const override of responsive.typographyOverrides) {
    const member = memberByPresentation(set, responsive, override.presentationValue);
    if (await applyTypographyOverride(member, override)) changedNodeIds.add(member.id);
  }
  for (const nodeId of arrangeResponsiveComponentSet(set, responsive, host)) changedNodeIds.add(nodeId);
  const createdNodeIds = createdNodes.map((entry) => entry.nodeId);
  const existingChangedNodeIds = [...changedNodeIds].filter((nodeId) => !createdNodeIds.includes(nodeId));
  return {
    set,
    historical,
    result: createdNodeIds.length === 0 && existingChangedNodeIds.length === 0
      ? { skipped: true, reason: 'unchanged', createdNodeIds: [], createdNodes: [], changedNodeIds: [] }
      : { applied: true, createdNodeIds, createdNodes, changedNodeIds: existingChangedNodeIds },
  };
};
const scriptResults = [];
const containerByTarget = new Map();
for (const operation of INPUT.operations) {
  const target = INPUT.targets.find((entry) => entry.targetId === operation.targetId);
  if (!target) throw new Error('Missing target for ' + operation.operationId);
  if (operation.mechanism === 'responsive-component-set') {
    const applied = await applyResponsiveComponentSet(operation, target);
    if (applied.set.parent && applied.set.parent.type === 'FRAME') containerByTarget.set(operation.targetId, applied.set.parent);
    scriptResults.push({ operationId: operation.operationId, targetId: operation.targetId, nodeId: operation.nodeId, result: applied.result });
    continue;
  }
  if (operation.mechanism === 'generated-amend') {
    const root = await figma.getNodeByIdAsync(operation.nodeId);
    if (!root || !masterLike(root)) throw new Error('Pinned generated-amend master absent: ' + operation.nodeId);
    if (pageOf(root)?.name === 'Pages') throw new Error('Refused Page master write: ' + root.id);
    const sameNamed = sameNamedMasters(target.expectedMasterName);
    if (sameNamed.length !== 1 || sameNamed[0].id !== root.id) throw new Error('Master cardinality drift: ' + target.expectedMasterName);
    const generatedRunner = GENERATED_RUNNERS[operation.operationId];
    if (typeof generatedRunner !== 'function') throw new Error('Missing generated runner: ' + operation.operationId);
    const generated = await generatedRunner();
    const entry = Array.isArray(generated?.results) ? generated.results.find((result) => result && result.nodeId === operation.nodeId) : null;
    if (!entry) throw new Error('Generated amend did not report pinned master: ' + operation.nodeId);
    const noOp = entry.skipped === true && entry.reason === 'unchanged';
    if (entry.skipped === true && !noOp) throw new Error('Generated amend refused: ' + String(entry.reason || 'unknown'));
    scriptResults.push({
      operationId: operation.operationId, targetId: operation.targetId, nodeId: operation.nodeId,
      result: noOp
        ? { skipped: true, reason: 'unchanged', createdNodeIds: [], changedNodeIds: [] }
        : { applied: true, amended: entry.amended === true, createdNodeIds: [], changedNodeIds: [operation.nodeId] },
    });
    continue;
  }
  if (operation.mechanism === 'set-properties') {
    const result = await applySetProperties(operation);
    scriptResults.push({
      operationId: operation.operationId, targetId: operation.targetId, nodeId: operation.nodeId,
      result: result.changed
        ? { applied: true, createdNodeIds: [], changedNodeIds: [result.node.id] }
        : { skipped: true, reason: 'unchanged', createdNodeIds: [], changedNodeIds: [] },
    });
    continue;
  }
  if (operation.mechanism === 'reorder-children') {
    const master = await figma.getNodeByIdAsync(operation.nodeId);
    if (!master || !masterLike(master)) throw new Error('Pinned reorder-children master absent: ' + operation.nodeId);
    if (pageOf(master)?.name === 'Pages') throw new Error('Refused Page master write: ' + master.id);
    const sameNamed = sameNamedMasters(target.expectedMasterName);
    if (sameNamed.length !== 1 || sameNamed[0].id !== master.id) throw new Error('Master cardinality drift: ' + target.expectedMasterName);
    assertOperationPreconditions(master, master, operation);
    const expectedOrder = operation.changes.childOrder;
    const actualOrder = master.children.map((child) => child.id);
    const sameMembers = actualOrder.length === expectedOrder.length && actualOrder.every((nodeId) => expectedOrder.includes(nodeId));
    if (!sameMembers) throw new Error('Pinned child set drift: expected ' + expectedOrder.join(',') + ', got ' + actualOrder.join(','));
    const changed = actualOrder.some((nodeId, index) => nodeId !== expectedOrder[index]);
    if (changed) for (let index = 0; index < expectedOrder.length; index++) {
      const child = master.children.find((candidate) => candidate.id === expectedOrder[index]);
      if (!child) throw new Error('Pinned child disappeared during reorder: ' + expectedOrder[index]);
      master.insertChild(index, child);
    }
    const postOrder = master.children.map((child) => child.id);
    if (postOrder.some((nodeId, index) => nodeId !== expectedOrder[index])) throw new Error('Child-order postcondition failed: ' + operation.operationId);
    scriptResults.push({
      operationId: operation.operationId, targetId: operation.targetId, nodeId: operation.nodeId,
      result: changed
        ? { applied: true, createdNodeIds: [], changedNodeIds: [master.id] }
        : { skipped: true, reason: 'unchanged', createdNodeIds: [], changedNodeIds: [] },
    });
    continue;
  }
  const master = await figma.getNodeByIdAsync(operation.nodeId);
  if (!master || !masterLike(master)) throw new Error('Pinned master absent: ' + operation.nodeId);
  if (pageOf(master)?.name === 'Pages') throw new Error('Refused Page master write: ' + master.id);
  const sameNamed = sameNamedMasters(target.expectedMasterName);
  if (sameNamed.length !== 1 || sameNamed[0].id !== master.id) throw new Error('Master cardinality drift: ' + target.expectedMasterName);
  const changes = operation.changes;
  const expectedParentId = operation.preconditions.find((entry) => entry.field === 'parentNodeId')?.equals;
  const expectedParentType = operation.preconditions.find((entry) => entry.field === 'parentType')?.equals;
  const marked = markedContainers(operation.targetId);
  if (marked.length > 1) throw new Error('Duplicate governed organism Containers: ' + operation.targetId);
  let container = marked[0] || null;
  const createdNodeIds = [];
  const changedNodeIds = [];
  if (!container) {
    if (master.parent?.type === 'FRAME') throw new Error('Refused unmarked Container adoption: ' + master.parent.id);
    if (!master.parent || master.parent.id !== expectedParentId || master.parent.type !== expectedParentType) throw new Error('Master parent precondition drift: ' + master.id);
    const host = master.parent;
    const index = host.children.indexOf(master);
    const origin = { x: master.x, y: master.y, width: master.width, height: master.height };
    container = figma.createFrame();
    container.name = String(changes.containerName);
    container.layoutMode = String(changes.layoutMode);
    container.primaryAxisSizingMode = 'FIXED';
    container.counterAxisSizingMode = 'FIXED';
    container.paddingTop = 0; container.paddingRight = 0; container.paddingBottom = 0; container.paddingLeft = 0;
    container.itemSpacing = 0;
    container.fills = [];
    container.clipsContent = false;
    container.resize(Number(changes.referenceWidth), Number(changes.referenceHeight));
    container.x = origin.x; container.y = origin.y;
    container.setSharedPluginData(MARK_NS, MARK_KEY, operation.targetId);
    host.insertChild(index, container);
    container.appendChild(master);
    master.x = 0; master.y = 0;
    master.layoutSizingHorizontal = 'FILL';
    container.counterAxisSizingMode = 'AUTO';
    createdNodeIds.push(container.id);
    changedNodeIds.push(master.id, container.id);
  } else {
    if (master.parent?.id !== container.id) throw new Error('Governed Container does not own pinned master: ' + container.id);
    const siblings = container.children.filter(componentLike);
    if (siblings.length !== 1 || siblings[0].id !== master.id) throw new Error('Governed Container contains another organism presentation');
    let changed = false;
    if (container.name !== changes.containerName) { container.name = String(changes.containerName); changed = true; }
    if (container.layoutMode !== changes.layoutMode) { container.layoutMode = String(changes.layoutMode); changed = true; }
    if (container.width !== Number(changes.referenceWidth)) { container.resize(Number(changes.referenceWidth), container.height); changed = true; }
    if (container.counterAxisSizingMode !== 'AUTO') { container.counterAxisSizingMode = 'AUTO'; changed = true; }
    if (master.layoutSizingHorizontal !== 'FILL') { master.layoutSizingHorizontal = 'FILL'; changed = true; }
    if (changed) changedNodeIds.push(master.id, container.id);
  }
  containerByTarget.set(operation.targetId, container);
  const noOp = createdNodeIds.length === 0 && changedNodeIds.length === 0;
  scriptResults.push({
    operationId: operation.operationId, targetId: operation.targetId, nodeId: operation.nodeId,
    result: noOp
      ? { skipped: true, reason: 'unchanged', createdNodeIds: [], changedNodeIds: [] }
      : { applied: true, createdNodeIds, changedNodeIds },
  });
}
const masters = [];
const responsiveChecks = [];
const scenarioChecks = [];
const bindingFacts = [];
const typographyFacts = [];
const memberFacts = [];
const responsiveImages = [];
for (const target of INPUT.targets) {
  const master = await figma.getNodeByIdAsync(target.masterNodeId);
  if (!master) throw new Error('Post-apply master absent: ' + target.masterNodeId);
  const responsive = target.responsive;
  const responsiveSet = responsive && master.parent && master.parent.type === 'COMPONENT_SET' ? master.parent : null;
  const sameNamed = responsive ? [master] : sameNamedMasters(target.expectedMasterName);
  const variantRoot = responsiveSet || master;
  const variantNames = variantRoot.type === 'COMPONENT_SET' ? variantRoot.children.filter((node) => node.type === 'COMPONENT').map((node) => node.name).sort() : [];
  masters.push({
    targetId: target.targetId,
    nodeId: master.id,
    componentKey: master.key,
    masterCount: sameNamed.length,
    variantNames,
    ...(responsiveSet ? {
      setNodeId: responsiveSet.id,
      setName: responsiveSet.name,
      propertyName: responsive.componentSetTopology.propertyName,
      defaultPresentationValue: responsiveSet.componentPropertyDefinitions && responsiveSet.componentPropertyDefinitions[responsive.componentSetTopology.propertyName]
        ? responsiveSet.componentPropertyDefinitions[responsive.componentSetTopology.propertyName].defaultValue
        : null,
    } : {}),
  });
  if (responsive) {
    if (!responsiveSet) throw new Error('Responsive set absent during scenario inspection: ' + target.targetId);
    const topology = responsive.componentSetTopology;
    for (const presentationValue of [topology.historicalMember.presentationValue, ...topology.createdMembers.map((entry) => entry.presentationValue)]) {
      memberFacts.push({ targetId: target.targetId, ...comparableMemberFacts(memberByPresentation(responsiveSet, responsive, presentationValue), presentationValue) });
    }
    for (const binding of responsive.primitiveBindings) {
      const member = memberByPresentation(responsiveSet, responsive, binding.presentationValue);
      const node = resolvePath(member, binding.nodePath);
      const observed = boundVariableId(node, binding.property);
      bindingFacts.push({ ...binding, boundVariableId: observed, status: observed === binding.variableId ? 'attached' : 'detached' });
    }
    for (const override of responsive.typographyOverrides) {
      const member = memberByPresentation(responsiveSet, responsive, override.presentationValue);
      const node = resolvePath(member, override.nodePath);
      const appliedFields = Object.fromEntries(override.allowedFields.map((field) => [field, textMetric(node, field)]));
      typographyFacts.push({
        presentationValue: override.presentationValue,
        nodePath: override.nodePath,
        sourceRole: override.sourceRole,
        sourceTextStyleId: override.sourceTextStyleId,
        appliedFields,
        family: node.fontName && node.fontName.family,
        weight: typeof node.fontWeight === 'number' ? node.fontWeight : override.weight,
        characters: node.characters,
        debtStatus: node.getSharedPluginData(MARK_NS, 'responsiveTypographyDebt'),
        status: override.allowedFields.every((field) => sameValue(appliedFields[field], override.after[field])) ? 'allowlisted' : 'drifted',
      });
    }
    for (const scenario of responsive.presentationScenarios) {
      const member = memberByPresentation(responsiveSet, responsive, scenario.presentationValue);
      const fixture = responsive.contentFixtures.find((entry) => entry.fixtureId === scenario.fixtureId);
      if (!fixture) throw new Error('Responsive fixture absent: ' + scenario.fixtureId);
      const proof = figma.createFrame();
      try {
      proof.name = 'Component repair scenario · ' + scenario.scenarioId;
      proof.layoutMode = 'VERTICAL';
      proof.primaryAxisSizingMode = 'FIXED';
      proof.counterAxisSizingMode = 'FIXED';
      proof.paddingTop = 0; proof.paddingRight = 0; proof.paddingBottom = 0; proof.paddingLeft = 0;
      proof.itemSpacing = 0; proof.fills = []; proof.clipsContent = false;
      proof.resize(scenario.width, scenario.height);
      proof.minHeight = scenario.height;
      const instance = member.createInstance();
      proof.appendChild(instance);
      instance.x = 0; instance.y = 0;
      if ('layoutSizingHorizontal' in instance) instance.layoutSizingHorizontal = 'FILL';
      if ('layoutSizingVertical' in instance) instance.layoutSizingVertical = 'HUG';
      // Keep the proof deterministic in both native Figma and the strict mock:
      // FILL is the semantic authority, and the transient instance is resized
      // to its breakpoint parent before content fixtures are applied.
      if (Math.abs(instance.width - proof.width) > 0.01) instance.resize(proof.width, instance.height);
      for (const [nodePath, characters] of Object.entries(fixture.textValues)) {
        const text = resolvePath(instance, nodePath);
        if (text.type !== 'TEXT') throw new Error('Fixture path is not TEXT: ' + scenario.scenarioId + '/' + nodePath);
        await loadTextFonts(text);
        text.characters = characters;
      }
      if (proof.height < instance.height) proof.resize(scenario.width, instance.height);
      const screenshotRef = INPUT.evidenceRoot + '/scenario-' + scenario.scenarioId + '-' + INPUT.run + '.png';
      const overflowIssues = descendantOverflow(instance, proof);
      const descendants = [instance, ...instance.findAll(() => true)].filter((node) => effectivelyVisible(node, proof));
      const clippedBy = [...new Set(overflowIssues.filter((issue) => issue.reason.startsWith('clipped-by:')).map((issue) => issue.reason.slice('clipped-by:'.length)))];
      const hasCoverPoster = descendants.some((node) => ['fills', 'backgrounds'].some((field) => Array.isArray(node[field]) && node[field].some((paint) => paint && paint.type === 'IMAGE' && paint.scaleMode === 'FILL')));
      const bytes = await proof.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
      scenarioChecks.push({
        targetId: target.targetId,
        scenarioId: scenario.scenarioId,
        selectedPresentation: scenario.presentationValue,
        width: scenario.width,
        height: scenario.height,
        fixtureId: scenario.fixtureId,
        rootBounds: instance.absoluteBoundingBox,
        descendantBounds: descendants.map((node) => ({ nodeId: node.id, ...(node.absoluteBoundingBox || {}) })),
        overflow: overflowIssues.length > 0,
        clippedBy,
        contentAccessible: overflowIssues.length === 0,
        posterCoverage: hasCoverPoster ? 'cover' : 'missing',
        captureRef: screenshotRef,
      });
      responsiveImages.push({ path: screenshotRef, base64: figma.base64Encode(bytes) });
      } finally {
        if (proof.parent) proof.remove();
      }
    }
    continue;
  }
  let container = containerByTarget.get(target.targetId) || markedContainers(target.targetId)[0] || null;
  let responsiveRoot = master;
  let transientContainer = null;
  if (target.subjectKind === 'shared-component') {
    const source = master.type === 'COMPONENT_SET' ? master.children.find((node) => node.type === 'COMPONENT') : master;
    if (!source || source.type !== 'COMPONENT') throw new Error('Shared responsive source missing: ' + target.targetId);
    transientContainer = figma.createFrame();
    transientContainer.name = 'Component repair responsive proof · ' + target.targetId;
    transientContainer.layoutMode = 'VERTICAL';
    transientContainer.primaryAxisSizingMode = 'AUTO';
    transientContainer.counterAxisSizingMode = 'FIXED';
    transientContainer.paddingTop = 0; transientContainer.paddingRight = 0; transientContainer.paddingBottom = 0; transientContainer.paddingLeft = 0;
    transientContainer.itemSpacing = 0; transientContainer.fills = []; transientContainer.clipsContent = false;
    transientContainer.resize(source.width, source.height);
    responsiveRoot = source.createInstance();
    transientContainer.appendChild(responsiveRoot);
    responsiveRoot.layoutSizingHorizontal = 'FILL';
    container = transientContainer;
  }
  if (!container) throw new Error('Responsive Container missing: ' + target.targetId);
  const originalWidth = container.width;
  try {
    for (const width of target.responsiveWidths) {
      const screenshotRef = INPUT.evidenceRoot + '/responsive-' + width + '-' + INPUT.run + '.png';
      container.resize(width, container.height);
      const overflowIssues = descendantOverflow(responsiveRoot, container);
      const bytes = await container.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
      responsiveChecks.push({ targetId: target.targetId, width, overflow: overflowIssues.length > 0, overflowNodeIds: overflowIssues.map((issue) => issue.nodeId), overflowIssues, screenshotRef });
      responsiveImages.push({ path: screenshotRef, base64: figma.base64Encode(bytes) });
    }
  } finally {
    if (transientContainer) transientContainer.remove();
    else container.resize(originalWidth, container.height);
  }
}
return {
  schemaVersion: INPUT.schemaVersion,
  campaignId: INPUT.campaignId,
  fileKey: INPUT.fileKey,
  fileVersionId: INPUT.fileVersionId,
  run: INPUT.run,
  scriptResults,
  inspection: { masters, pageWrites: [], childWrites: [], responsiveChecks, scenarioChecks, bindingFacts, typographyFacts, memberFacts },
  responsiveImages,
};
