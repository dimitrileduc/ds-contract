await figma.loadAllPagesAsync();
const root = await figma.getNodeByIdAsync('2178:7381');
if (!root || root.type !== 'COMPONENT') throw new Error('Avis Google master absent');
const cartes = root.children[1];
const left = cartes.children[0];
const grid = cartes.children[1];
const right = cartes.children[2];
return {
  run: 'probe',
  scriptResults: [],
  responsiveImages: [],
  geometry: {
    root: { id: root.id, name: root.name, width: root.width, height: root.height, sizing: root.layoutSizingHorizontal },
    cartes: { id: cartes.id, x: cartes.x, y: cartes.y, width: cartes.width, height: cartes.height, clipsContent: cartes.clipsContent },
    left: { id: left.id, x: left.x, y: left.y, width: left.width, height: left.height, positioning: left.layoutPositioning, constraints: left.constraints, boundVariables: left.boundVariables },
    grid: { id: grid.id, x: grid.x, y: grid.y, width: grid.width, height: grid.height, mode: grid.layoutMode, columns: grid.gridColumnCount, cardWidths: grid.children.map((card) => card.width) },
    right: { id: right.id, x: right.x, y: right.y, width: right.width, height: right.height, positioning: right.layoutPositioning, constraints: right.constraints, boundVariables: right.boundVariables },
  },
};
