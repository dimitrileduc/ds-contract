import { emitBridgeApplyScript } from '../../../extract/figma/projection-repair/bridge-script.js';

const descendants = (node: any): any[] => (node.children ?? []).flatMap((child: any) => [child, ...descendants(child)]);
const detach = (node: any): void => {
  if (node.parent?.children) node.parent.children = node.parent.children.filter((child: any) => child !== node);
  node.parent = null;
};
const attach = (parent: any, node: any): void => {
  detach(node);
  parent.children.push(node);
  node.parent = parent;
};

const page: any = { id: '1:1', type: 'PAGE', name: 'DS · Molécules', children: [] };
page.findAll = (test: (node: any) => boolean) => descendants(page).filter(test);
const set: any = { id: '2:1', type: 'COMPONENT_SET', name: 'SectionHeader', key: 'set-key', parent: page, children: [] };
const variant: any = {
  id: '2:2', type: 'COMPONENT', name: 'Disposition=Standard', key: 'variant-key', parent: set, children: [],
  x: 0, y: 0, width: 1550, height: 123, layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'FIXED',
  findAll(test: (node: any) => boolean) { return descendants(this).filter(test); },
  createInstance() {
    const instance: any = {
      id: '9:2', type: 'INSTANCE', name: this.name, parent: null, children: [], x: 0, y: 0,
      width: this.width, height: 83, layoutSizingHorizontal: 'FIXED', layoutSizingVertical: 'HUG',
      findAll(test: (node: any) => boolean) { return descendants(this).filter(test); },
      get absoluteBoundingBox() {
        const box = this.parent?.absoluteBoundingBox ?? { x: 0, y: 0 };
        return { x: box.x + this.x, y: box.y + this.y, width: this.width, height: this.height };
      },
    };
    return instance;
  },
};
set.children.push(variant);
page.children.push(set);

let serial = 10;
const figma: any = {
  fileKey: 'file-key',
  root: { children: [page] },
  currentPage: page,
  async loadAllPagesAsync() {},
  async getNodeByIdAsync(id: string) { return descendants(page).find((node: any) => node.id === id) ?? null; },
  createFrame() {
    const frame: any = {
      id: `9:${serial++}`, type: 'FRAME', name: 'Frame', parent: null, children: [], x: 0, y: 0,
      width: 100, height: 100, layoutMode: 'NONE', layoutSizingHorizontal: 'FIXED', fills: [], clipsContent: true,
      get absoluteBoundingBox() { return { x: this.x, y: this.y, width: this.width, height: this.height }; },
      resize(width: number, height: number) {
        this.width = width; this.height = height;
        for (const child of this.children) if (child.layoutSizingHorizontal === 'FILL') child.width = width;
      },
      appendChild(node: any) { attach(this, node); if (node.layoutSizingHorizontal === 'FILL') node.width = this.width; },
      async exportAsync() { return new Uint8Array([137, 80, 78, 71]); },
      remove() { detach(this); },
      getSharedPluginData() { return ''; },
    };
    attach(page, frame);
    return frame;
  },
  base64Encode(bytes: Uint8Array) { return Buffer.from(bytes).toString('base64'); },
};

const campaign = {
  campaignId: 'repair-section-header', filePin: { fileKey: 'file-key', versionId: 'version-id' },
  workflow: { evidenceRoot: 'proofs', subjectKind: 'shared-component' },
  targets: [{ targetId: 'section-header', masterNodeId: set.id, expectedMasterName: set.name, expectedVariantNames: [variant.name], responsiveWidths: [1440, 768] }],
} as never;
const plan = { operations: [{
  operationId: 'hug-shared-height', targetId: 'section-header', mechanism: 'set-properties', nodeId: set.id, structuralPath: '0',
  preconditions: [{ field: 'resolvedNodeId', equals: variant.id }], changes: { layout: { layoutSizingVertical: 'HUG' } },
}]} as never;

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (...args: string[]) => (...values: unknown[]) => Promise<any>;
const first = await new AsyncFunction('figma', emitBridgeApplyScript(campaign, plan, 'first'))(figma);
if (variant.layoutSizingVertical !== 'HUG' || first.scriptResults[0].result.applied !== true) throw new Error('shared component layout repair did not apply');
if (first.inspection.responsiveChecks.length !== 2 || first.inspection.responsiveChecks.some((entry: any) => entry.overflow !== false)) throw new Error('shared responsive proof failed');
if (page.children.some((node: any) => String(node.name).startsWith('Component repair responsive proof'))) throw new Error('transient responsive frame survived first run');

const second = await new AsyncFunction('figma', emitBridgeApplyScript(campaign, plan, 'second'))(figma);
if (second.scriptResults[0].result.reason !== 'unchanged' || second.scriptResults[0].result.changedNodeIds.length !== 0) throw new Error('shared second run was not a no-op');
if (page.children.some((node: any) => String(node.name).startsWith('Component repair responsive proof'))) throw new Error('transient responsive frame survived second run');

console.log('✔ shared component bridge repairs in place, tests two widths through a transient instance, removes it and is a strict second-run no-op');
