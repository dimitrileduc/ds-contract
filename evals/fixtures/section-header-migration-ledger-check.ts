/**
 * Adversarial ledger boundary for Spec 026.  The production schema carries
 * the public data shape; this fixture proves the migration policy that JSON
 * Schema cannot express alone: unique complete records and no visual change
 * unless it is the one named, approved Products intermediate state.
 */
type Capture = { ref: string; sha256: string; width: number; height: number; capturedAt: string };
type Usage = {
  usageId: string;
  page: string;
  nodeId: string;
  structuralSignature: string;
  role: string;
  oldApi: { alignement: string; accroche2: boolean };
  destination: string;
  status: 'blocked' | 'preserve' | 'authorized-product-delta';
  before: Capture;
  after?: Capture;
  preservation: Record<string, string>;
  authorizedDelta?: string;
  approvalRef?: string;
};
type Ledger = { schemaVersion: string; expectedUsageCount: number; usages: Usage[] };

const DIGEST = 'a'.repeat(64);
const preservation = () => Object.fromEntries(
  ['content', 'richText', 'styles', 'media', 'geometry', 'instanceLink', 'pageContext'].map((key) => [key, DIGEST]),
);
const capture = (id: number, sha256 = DIGEST): Capture => ({
  ref: `proofs/before/uses/usage-${String(id).padStart(2, '0')}.png`,
  sha256,
  width: 400,
  height: 80,
  capturedAt: '2026-08-23T17:46:31.000Z',
});
const usage = (id: number): Usage => ({
  usageId: `section-header-v3-${String(id).padStart(2, '0')}`,
  page: 'Page source',
  nodeId: `2090:${id}`,
  structuralSignature: `main=${id}`,
  role: 'generic-standard',
  oldApi: { alignement: 'centre', accroche2: true },
  destination: 'section-header',
  status: 'blocked',
  before: capture(id),
  preservation: preservation(),
});
const baseline = (): Ledger => ({
  schemaVersion: '1.0.0',
  expectedUsageCount: 45,
  usages: Array.from({ length: 45 }, (_, index) => usage(index + 1)),
});
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const validate = (ledger: Ledger): string[] => {
  const errors: string[] = [];
  if (ledger.schemaVersion !== '1.0.0') errors.push('schemaVersion');
  if (ledger.expectedUsageCount !== 45 || ledger.usages.length !== 45) errors.push('expected-45-records');
  const ids = new Set<string>();
  for (const [index, row] of ledger.usages.entries()) {
    const prefix = `row ${index + 1}`;
    if (!row.usageId || !row.page || !row.nodeId || !row.structuralSignature || !row.role || !row.destination) errors.push(`${prefix}: incomplete-identity`);
    if (ids.has(row.usageId)) errors.push(`${prefix}: duplicate-usageId`);
    ids.add(row.usageId);
    if (!row.oldApi || typeof row.oldApi.accroche2 !== 'boolean' || !row.oldApi.alignement) errors.push(`${prefix}: incomplete-oldApi`);
    if (!row.before?.ref || !/^[a-f0-9]{64}$/.test(row.before.sha256) || row.before.width <= 0 || row.before.height <= 0) errors.push(`${prefix}: incomplete-before-capture`);
    const needed = ['content', 'richText', 'styles', 'media', 'geometry', 'instanceLink', 'pageContext'];
    if (needed.some((key) => !/^[a-f0-9]{64}$/.test(row.preservation?.[key] ?? ''))) errors.push(`${prefix}: incomplete-preservation`);
    if (row.status === 'preserve') {
      if (!row.after) errors.push(`${prefix}: preserve-without-after`);
      else if (row.after.sha256 !== row.before.sha256 || row.after.width !== row.before.width || row.after.height !== row.before.height) errors.push(`${prefix}: unauthorised-visual-delta`);
    }
    if (row.status === 'authorized-product-delta') {
      if (row.role !== 'produits-ecommerce' || row.destination !== 'produits-ecommerce' ||
          row.authorizedDelta !== 'product-intermediate-left-no-eyebrow-cta' || !row.approvalRef || !row.after) {
        errors.push(`${prefix}: unapproved-product-delta`);
      }
    }
  }
  return errors;
};

const mustAccept = (label: string, ledger: Ledger) => {
  const errors = validate(ledger);
  if (errors.length) throw new Error(`${label} should be accepted, got ${errors.join(', ')}`);
};
const mustReject = (label: string, ledger: Ledger, expected: string) => {
  const errors = validate(ledger);
  if (!errors.some((error) => error.includes(expected))) {
    throw new Error(`${label} should refuse ${expected}, got ${errors.join(', ') || '(accepted)'}`);
  }
};

mustAccept('a complete pre-mutation blocked ledger', baseline());
const incomplete = baseline();
delete (incomplete.usages[0] as Partial<Usage>).page;
mustReject('an incomplete row', incomplete, 'incomplete-identity');
const duplicate = baseline();
duplicate.usages[1].usageId = duplicate.usages[0].usageId;
mustReject('a duplicated ledger row', duplicate, 'duplicate-usageId');
const visualDelta = baseline();
visualDelta.usages[0].status = 'preserve';
visualDelta.usages[0].after = capture(1, 'b'.repeat(64));
mustReject('an unapproved generic visual delta', visualDelta, 'unauthorised-visual-delta');
const productDelta = baseline();
productDelta.usages[0] = {
  ...productDelta.usages[0],
  role: 'produits-ecommerce',
  destination: 'produits-ecommerce',
  status: 'authorized-product-delta',
  after: capture(1, 'b'.repeat(64)),
  authorizedDelta: 'product-intermediate-left-no-eyebrow-cta',
  approvalRef: 'specs/026-simplify-section-header/proofs/owner-go.json',
};
mustAccept('the single named approved Products delta', productDelta);
const unapprovedProduct = clone(productDelta);
delete unapprovedProduct.usages[0].approvalRef;
mustReject('a product delta without approval', unapprovedProduct, 'unapproved-product-delta');

// The real migration ledger must carry the deterministic v2-to-v3 mapping for
// every generic usage. A destination alone is not enough: it could conceal a
// fallback for a retired axis at live-reconciliation time.
const { readFileSync } = await import('node:fs');
const { resolve } = await import('node:path');
const realLedger = JSON.parse(readFileSync(resolve(process.cwd(), 'specs/026-simplify-section-header/inventory/migration-ledger.json'), 'utf8')) as Ledger & { usages: Array<Usage & { migration?: unknown }> };
const generic = realLedger.usages.filter((row) => row.role === 'generic-standard');
if (generic.length !== 24) throw new Error(`real ledger must contain exactly 24 generic records, got ${generic.length}`);
const expectedFieldMap = JSON.stringify({ titre: 'titre', accroche: 'accroche', afficherAccroche: 'accroche2', alignement: 'alignement' });
for (const row of generic) {
  const migration = row.migration as { target?: string; fieldMap?: unknown; removed?: unknown } | undefined;
  if (row.destination !== 'section-header' || migration?.target !== 'ds.section-header@3.0.0' ||
      JSON.stringify(migration?.fieldMap) !== expectedFieldMap || JSON.stringify(migration?.removed) !== JSON.stringify(['disposition', 'emphase'])) {
    throw new Error(`${row.usageId}: generic migration must map all four v3 fields and explicitly retire disposition/emphase`);
  }
}

console.log('section-header-migration-ledger ok: complete unique rows and only the named approved Products delta are admissible');
