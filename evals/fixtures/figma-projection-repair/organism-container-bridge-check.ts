import { emitBridgeApplyScript } from '../../../extract/figma/projection-repair/bridge-script.js';

let serial = 10;
const detach = (node: any): void => {
  if (!node.parent?.children) return;
  node.parent.children = node.parent.children.filter((child: any) => child !== node);
};
const attach = (parent: any, node: any, index = parent.children.length): void => {
  detach(node);
  parent.children.splice(index, 0, node);
  node.parent = parent;
};
const descendants = (node: any): any[] => (node.children ?? []).flatMap((child: any) => [child, ...descendants(child)]);

const page: any = { id: '1:1', type: 'PAGE', name: 'DS · Organisms', children: [], findAll: (test: (node: any) => boolean) => descendants(page).filter(test) };
const section: any = {
  id: '2170:6360', type: 'SECTION', name: 'Hero vidéo', parent: page, children: [],
  insertChild(index: number, node: any) { attach(this, node, index); },
};
page.children.push(section);
const master: any = {
  id: '2151:5552', type: 'COMPONENT', name: 'HeroVideo', key: 'historical-key', parent: section,
  x: 40, y: 1512, width: 1728, height: 720, layoutSizingHorizontal: 'FIXED', children: [],
};
section.children.push(master);
const pageInstance: any = { id: '8:1', type: 'INSTANCE', name: 'HeroVideo', parent: page, x: 0, y: 0, width: 1728, height: 720, children: [] };
page.children.push(pageInstance);

const figma: any = {
  root: { children: [page] },
  currentPage: page,
  async loadAllPagesAsync() {},
  async getNodeByIdAsync(id: string) { return descendants(page).find((node: any) => node.id === id) ?? null; },
  createFrame() {
    const data = new Map<string, string>();
    const frame: any = {
      id: `9:${serial++}`, type: 'FRAME', name: 'Frame', parent: page, children: [], x: 0, y: 0, width: 100, height: 100,
      layoutMode: 'NONE', layoutSizingHorizontal: 'FIXED', fills: [], clipsContent: true,
      resize(width: number, height: number) {
        this.width = width; this.height = height;
        for (const child of this.children) if (child.layoutSizingHorizontal === 'FILL') child.width = width;
      },
      async exportAsync() { return new Uint8Array([137, 80, 78, 71]); },
      appendChild(node: any) { attach(this, node); if (node.layoutSizingHorizontal === 'FILL') node.width = this.width; },
      setSharedPluginData(namespace: string, key: string, value: string) { data.set(`${namespace}/${key}`, value); },
      getSharedPluginData(namespace: string, key: string) { return data.get(`${namespace}/${key}`) ?? ''; },
    };
    page.children.push(frame);
    return frame;
  },
  base64Encode(bytes: Uint8Array) { return Buffer.from(bytes).toString('base64'); },
};

const campaign = {
  campaignId: 'repair-hero-video-calibration',
  filePin: { fileKey: 'file-key', versionId: 'version-id' },
  workflow: { evidenceRoot: 'proofs' },
  targets: [{ targetId: 'hero-video', masterNodeId: master.id, expectedMasterName: 'HeroVideo', expectedVariantNames: [], responsiveWidths: [1440] }],
} as never;
const plan = {
  operations: [{
    operationId: 'ensure-hero-video-container', targetId: 'hero-video', mechanism: 'ensure-organism-container', nodeId: master.id,
    preconditions: [{ field: 'parentNodeId', equals: section.id }, { field: 'parentType', equals: 'SECTION' }],
    changes: { containerName: 'Container · HeroVideo', layoutMode: 'HORIZONTAL', referenceWidth: 1728, referenceHeight: 720, layoutSizingHorizontal: 'FILL' },
  }],
} as never;

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (...args: string[]) => (...values: unknown[]) => Promise<any>;
const first = await new AsyncFunction('figma', emitBridgeApplyScript(campaign, plan, 'first'))(figma);
if (first.scriptResults[0].result.applied !== true || first.scriptResults[0].result.createdNodeIds.length !== 1) throw new Error('first Container apply did not create exactly one node');
if (master.id !== '2151:5552' || master.parent.name !== 'Container · HeroVideo' || master.layoutSizingHorizontal !== 'FILL') throw new Error('master identity/Container/FILL postcondition failed');
if (first.inspection.responsiveChecks[0].overflow !== false || master.width !== 1728) throw new Error('responsive check overflowed or did not restore reference width');
if (first.responsiveImages[0]?.path !== 'proofs/responsive-1440-first.png' || !first.responsiveImages[0]?.base64) throw new Error('responsive proof was not exported');

const second = await new AsyncFunction('figma', emitBridgeApplyScript(campaign, plan, 'second'))(figma);
const secondResult = second.scriptResults[0].result;
if (secondResult.skipped !== true || secondResult.reason !== 'unchanged' || secondResult.createdNodeIds.length !== 0 || secondResult.changedNodeIds.length !== 0) {
  throw new Error('second Container apply was not a strict no-op');
}
if (descendants(page).filter((node: any) => node.type === 'FRAME' && node.name === 'Container · HeroVideo').length !== 1) throw new Error('duplicate Container created');

console.log('✔ organism Container bridge preserves the master, creates one local Container, exercises component-specific width and is a strict second-run no-op');
