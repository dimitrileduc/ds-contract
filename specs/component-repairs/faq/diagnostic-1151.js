await figma.loadAllPagesAsync();

const master = await figma.getNodeByIdAsync('2104:2914');
const container = await figma.getNodeByIdAsync('2455:4733');
if (!master || master.type !== 'COMPONENT') throw new Error('FAQ master missing');
if (!container || container.type !== 'FRAME') throw new Error('FAQ Container missing');
if (master.parent?.id !== container.id) throw new Error('FAQ master is no longer owned by the governed Container');

const describe = (node) => ({
  id: node.id,
  name: node.name,
  type: node.type,
  width: node.width,
  height: node.height,
  x: node.x,
  y: node.y,
  layoutMode: 'layoutMode' in node ? node.layoutMode : null,
  layoutSizingHorizontal: 'layoutSizingHorizontal' in node ? node.layoutSizingHorizontal : null,
  layoutSizingVertical: 'layoutSizingVertical' in node ? node.layoutSizingVertical : null,
  clipsContent: 'clipsContent' in node ? node.clipsContent : null,
});

const original = { width: container.width, height: container.height };
let bytes;
let geometry;
try {
  container.resize(1151, container.height);
  geometry = {
    container: describe(container),
    master: describe(master),
    sectionHeader: describe(master.children[0]),
    accordionList: describe(master.children[1]),
    accordionRows: master.children[1].type === 'FRAME'
      ? master.children[1].children.map(describe)
      : [],
    button: describe(master.children[2]),
  };
  bytes = await container.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
} finally {
  container.resize(original.width, container.height);
}

return {
  run: 'diagnostic-1151',
  geometry,
  restored: { container: describe(container), master: describe(master) },
  responsiveImages: [{
    path: 'specs/component-repairs/faq/diagnostic-1151.png',
    base64: figma.base64Encode(bytes),
  }],
};
