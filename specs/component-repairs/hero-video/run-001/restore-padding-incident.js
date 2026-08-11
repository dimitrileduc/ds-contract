await figma.loadAllPagesAsync();

const master = await figma.getNodeByIdAsync('2151:5552');
const pageInstance = await figma.getNodeByIdAsync('2170:6351');
if (!master || master.type !== 'COMPONENT' || master.name !== 'HeroVideo') throw new Error('HeroVideo master identity drift');
if (!pageInstance || pageInstance.type !== 'INSTANCE') throw new Error('HeroVideo Page instance identity drift');
const pageMainComponent = await pageInstance.getMainComponentAsync();
if (pageMainComponent?.id !== master.id) throw new Error('HeroVideo Page instance link drift');
if (master.parent?.id !== '2448:4731' || master.parent.type !== 'FRAME' || master.parent.name !== 'Container · HeroVideo') {
  throw new Error('HeroVideo governed Container drift');
}

const expectedChildren = ['2439:4691', '2439:4692', '2439:4693', '2439:4694', '2439:4701'];
if (JSON.stringify(master.children.map((node) => node.id)) !== JSON.stringify(expectedChildren)) throw new Error('HeroVideo child identity/order drift');
const background = master.children[0];
const bottomVeil = master.children[1];
const navigationVeil = master.children[2];
if (background.type !== 'FRAME' || background.fills[0]?.type !== 'IMAGE') throw new Error('HeroVideo poster IMAGE drift');
if (bottomVeil.type !== 'FRAME' || !bottomVeil.fills.some((paint) => paint.type.startsWith('GRADIENT_'))) throw new Error('HeroVideo bottom gradient drift');
if (navigationVeil.type !== 'FRAME' || !navigationVeil.fills.some((paint) => paint.type.startsWith('GRADIENT_'))) throw new Error('HeroVideo navigation gradient drift');

const desired = { top: 48, right: 89, bottom: 48, left: 89 };
const current = { top: master.paddingTop, right: master.paddingRight, bottom: master.paddingBottom, left: master.paddingLeft };
const desiredNow = Object.keys(desired).every((key) => current[key] === desired[key]);
const brokenNow = Object.values(current).every((value) => value === 0);
if (!desiredNow && !brokenNow) throw new Error('HeroVideo padding has an unknown intermediate state: ' + JSON.stringify(current));

const exportPng = async (node, path) => ({
  path,
  base64: figma.base64Encode(await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } })),
});

const responsiveImages = [];
let status = 'no-op';
if (brokenNow) {
  responsiveImages.push(await exportPng(master, 'specs/component-repairs/hero-video/run-001/incident-padding-before-master.png'));
  responsiveImages.push(await exportPng(pageInstance, 'specs/component-repairs/hero-video/run-001/incident-padding-before-page.png'));
  master.paddingTop = desired.top;
  master.paddingRight = desired.right;
  master.paddingBottom = desired.bottom;
  master.paddingLeft = desired.left;
  status = 'applied';
  responsiveImages.push(await exportPng(master, 'specs/component-repairs/hero-video/run-001/incident-padding-after-master.png'));
  responsiveImages.push(await exportPng(pageInstance, 'specs/component-repairs/hero-video/run-001/incident-padding-after-page.png'));
} else {
  responsiveImages.push(await exportPng(master, 'specs/component-repairs/hero-video/run-001/incident-padding-idempotence-master.png'));
  responsiveImages.push(await exportPng(pageInstance, 'specs/component-repairs/hero-video/run-001/incident-padding-idempotence-page.png'));
}

return {
  run: desiredNow ? 'second' : 'first',
  scriptResults: [{
    operationId: 'restore-hero-video-padding',
    targetId: 'hero-video',
    nodeId: master.id,
    result: status === 'applied'
      ? { applied: true, createdNodeIds: [], changedNodeIds: [master.id] }
      : { skipped: true, reason: 'unchanged', createdNodeIds: [], changedNodeIds: [] },
  }],
  inspection: {
    pageWrites: [],
    master: { id: master.id, key: master.key, paddingTop: master.paddingTop, paddingRight: master.paddingRight, paddingBottom: master.paddingBottom, paddingLeft: master.paddingLeft },
    pageInstance: { id: pageInstance.id, componentId: pageMainComponent?.id },
  },
  responsiveImages,
};
