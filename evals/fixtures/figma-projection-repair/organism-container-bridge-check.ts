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
  findAll(test: (node: any) => boolean) { return descendants(this).filter(test); },
  get absoluteBoundingBox() {
    const parentBox = this.parent?.absoluteBoundingBox;
    return { x: (parentBox?.x ?? 0) + this.x, y: (parentBox?.y ?? 0) + this.y, width: this.width, height: this.height };
  },
};
const responsiveChild: any = {
  id: '2151:5553', type: 'FRAME', name: 'Responsive child', parent: master,
  x: 0, y: 0, width: 1728, height: 720, layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'FIXED',
  paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, constraints: { horizontal: 'MIN', vertical: 'MIN' }, children: [],
  getSharedPluginData() { return ''; },
  resize(width: number, height: number) { this.width = width; this.height = height; },
  get absoluteBoundingBox() {
    const parentBox = this.parent.absoluteBoundingBox;
    return { x: parentBox.x + this.x, y: parentBox.y + this.y, width: this.width, height: this.height };
  },
};
master.children.push(responsiveChild);
section.children.push(master);
const pageInstance: any = { id: '8:1', type: 'INSTANCE', name: 'HeroVideo', parent: page, x: 0, y: 0, width: 1728, height: 720, children: [] };
page.children.push(pageInstance);

const figma: any = {
  fileKey: 'file-key',
  root: { children: [page] },
  currentPage: page,
  async loadAllPagesAsync() {},
  async getNodeByIdAsync(id: string) { return descendants(page).find((node: any) => node.id === id) ?? null; },
  createFrame() {
    const data = new Map<string, string>();
    const frame: any = {
      id: `9:${serial++}`, type: 'FRAME', name: 'Frame', parent: page, children: [], x: 0, y: 0, width: 100, height: 100,
      layoutMode: 'NONE', layoutSizingHorizontal: 'FIXED', fills: [], clipsContent: true,
      get absoluteBoundingBox() {
        const parentBox = this.parent?.absoluteBoundingBox;
        return { x: (parentBox?.x ?? 0) + this.x, y: (parentBox?.y ?? 0) + this.y, width: this.width, height: this.height };
      },
      resize(width: number, height: number) {
        this.width = width; this.height = height;
        const propagate = (parent: any) => {
          for (const child of parent.children ?? []) {
            if (child.layoutSizingHorizontal === 'FILL') child.width = parent.width;
            propagate(child);
          }
        };
        propagate(this);
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
    operationId: 'amend-hero-video', targetId: 'hero-video', mechanism: 'generated-amend', nodeId: master.id,
    preconditions: [{ field: 'nodeId', equals: master.id }],
    changes: { generatedScriptRef: 'evals/fixtures/figma-projection-repair/generated-amend-fixture.js' },
  }, {
    operationId: 'ensure-hero-video-container', targetId: 'hero-video', mechanism: 'ensure-organism-container', nodeId: master.id,
    preconditions: [{ field: 'parentNodeId', equals: section.id }, { field: 'parentType', equals: 'SECTION' }],
    changes: { containerName: 'Container · HeroVideo', layoutMode: 'HORIZONTAL', referenceWidth: 1728, referenceHeight: 720, layoutSizingHorizontal: 'FILL' },
  }, {
    operationId: 'make-child-responsive', targetId: 'hero-video', mechanism: 'set-properties', nodeId: master.id, structuralPath: '0',
    preconditions: [{ field: 'nodeName', equals: 'Responsive child' }],
    changes: { layout: { layoutSizingHorizontal: 'FILL', paddingLeft: 131, paddingRight: 131 } },
  }],
} as never;

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (...args: string[]) => (...values: unknown[]) => Promise<any>;
const first = await new AsyncFunction('figma', emitBridgeApplyScript(campaign, plan, 'first'))(figma);
if (first.scriptResults[0].result.amended !== true || first.scriptResults[0].result.changedNodeIds[0] !== master.id) throw new Error('generated amend was not executed through its official artifact');
if (first.scriptResults[1].result.applied !== true || first.scriptResults[1].result.createdNodeIds.length !== 1) throw new Error('first Container apply did not create exactly one node');
if (first.scriptResults[2].result.applied !== true || responsiveChild.layoutSizingHorizontal !== 'FILL' || responsiveChild.paddingLeft !== 131 || responsiveChild.paddingRight !== 131) {
  throw new Error('bounded layout operation did not apply Fill and padding');
}
if (master.id !== '2151:5552' || master.parent.name !== 'Container · HeroVideo' || master.layoutSizingHorizontal !== 'FILL') throw new Error('master identity/Container/FILL postcondition failed');
if (first.inspection.responsiveChecks[0].overflow !== false || master.width !== 1728) throw new Error('responsive check overflowed or did not restore reference width');
if (first.responsiveImages[0]?.path !== 'proofs/responsive-1440-first.png' || !first.responsiveImages[0]?.base64) throw new Error('responsive proof was not exported');

const second = await new AsyncFunction('figma', emitBridgeApplyScript(campaign, plan, 'second'))(figma);
for (const secondResult of second.scriptResults.map((entry: any) => entry.result)) {
  if (secondResult.skipped !== true || secondResult.reason !== 'unchanged' || secondResult.createdNodeIds.length !== 0 || secondResult.changedNodeIds.length !== 0) {
    throw new Error('second generated amend/Container apply was not a strict no-op');
  }
}
if (descendants(page).filter((node: any) => node.type === 'FRAME' && node.name === 'Container · HeroVideo').length !== 1) throw new Error('duplicate Container created');

console.log('✔ bridge executes the bounded generated amend, preserves the master, creates one local Container, exercises component-specific width and is a strict second-run no-op');
