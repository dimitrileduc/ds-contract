await figma.loadAllPagesAsync();

if (figma.fileKey !== 'd9FYAUcqdcNtsuaMgLefvJ') {
  throw new Error('Wrong Figma file: ' + figma.fileKey);
}

const master = await figma.getNodeByIdAsync('2108:3105');
const pageInstance = await figma.getNodeByIdAsync('2108:3135');
if (!master || master.type !== 'COMPONENT') throw new Error('Pinned SAV master absent');
if (!pageInstance || pageInstance.type !== 'INSTANCE') throw new Error('Pinned SAV Page instance absent');

const value = (node, key) => key in node ? node[key] : null;
const box = (node) => ({ x: node.x, y: node.y, width: node.width, height: node.height });
const fills = (node) => !('fills' in node) || !Array.isArray(node.fills)
  ? []
  : node.fills.map((paint) => ({
      type: paint.type,
      imageHash: paint.type === 'IMAGE' ? paint.imageHash ?? null : null,
      scaleMode: paint.type === 'IMAGE' ? paint.scaleMode ?? null : null,
    }));
const tree = (node) => ({
  id: node.id,
  name: node.name,
  type: node.type,
  box: box(node),
  layoutMode: value(node, 'layoutMode'),
  layoutPositioning: value(node, 'layoutPositioning'),
  horizontal: value(node, 'layoutSizingHorizontal'),
  vertical: value(node, 'layoutSizingVertical'),
  paddingTop: value(node, 'paddingTop'),
  paddingRight: value(node, 'paddingRight'),
  paddingBottom: value(node, 'paddingBottom'),
  paddingLeft: value(node, 'paddingLeft'),
  constraints: value(node, 'constraints'),
  fills: fills(node),
  children: 'children' in node ? node.children.map(tree) : [],
});

const bytes = await master.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
return {
  run: 'audit-owner-current',
  scriptResults: [],
  responsiveImages: [{
    path: 'specs/component-repairs/sav/run-001/owner-current/sav-master.png',
    base64: figma.base64Encode(bytes),
  }],
  file: { key: figma.fileKey, name: figma.root.name },
  master: tree(master),
  masterParent: master.parent ? tree(master.parent) : null,
  pageInstance: tree(pageInstance),
  pageWrites: [],
};
