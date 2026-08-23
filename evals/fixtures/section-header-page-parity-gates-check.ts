/** Strict page/use gate: any non-product visual movement is a refusal. */
import { strictParityFailures, type PixelVerdict } from '../../extract/figma/page-parity/compare.js';
import { sectionHeaderMigrationParityFailures, type SectionHeaderMigrationParityRow } from '../../extract/figma/page-parity/ledger-check.js';

const verdict = (status: PixelVerdict['status']): PixelVerdict => ({
  maquette: 'Accueil', status, diffCount: status === 'diff' ? 1 : 0,
  diffBox: null, cropTriptyque: null, refus: status === 'identical' ? null : status,
});
const mustReject = (label: string, actual: string[], expected: string) => {
  if (!actual.some((value) => value.includes(expected))) throw new Error(`${label} must reject ${expected}, got ${actual.join(', ') || '(accepted)'}`);
};
if (strictParityFailures([verdict('identical')]).length) throw new Error('strict page parity rejected identical evidence');
for (const status of ['diff', 'capture-failed', 'dimension-mismatch'] as const) {
  mustReject(`strict page parity ${status}`, strictParityFailures([verdict(status)]), status);
}
mustReject('strict page parity empty input', strictParityFailures([]), 'no captures');

const digest = 'a'.repeat(64);
const row = (id: number): SectionHeaderMigrationParityRow => ({
  usageId: `use-${id}`, role: 'generic-standard', destination: 'section-header', status: 'blocked',
  before: { sha256: digest, width: 100, height: 40 },
});
const rows = Array.from({ length: 45 }, (_, index) => row(index + 1));
if (sectionHeaderMigrationParityFailures(rows).length) throw new Error('complete blocked pre-mutation ledger should be admissible');
const genericDelta = structuredClone(rows);
genericDelta[0] = { ...genericDelta[0], status: 'preserve', after: { sha256: 'b'.repeat(64), width: 100, height: 40 } };
mustReject('generic visual delta', sectionHeaderMigrationParityFailures(genericDelta), 'unauthorised visual delta');
const productDelta = structuredClone(rows);
productDelta[0] = {
  ...productDelta[0], role: 'produits-ecommerce', destination: 'produits-ecommerce', status: 'authorized-product-delta',
  after: { sha256: 'b'.repeat(64), width: 100, height: 40 },
  authorizedDelta: 'product-intermediate-left-no-eyebrow-cta', approvalRef: 'specs/026-simplify-section-header/proofs/owner-go.json',
};
if (sectionHeaderMigrationParityFailures(productDelta).length) throw new Error('the single named approved Products allowance should be admissible');
productDelta[0].approvalRef = '';
mustReject('unapproved Products delta', sectionHeaderMigrationParityFailures(productDelta), 'unapproved Products delta');

console.log('section-header-page-parity-gates ok: strict page/use parity rejects diff, capture and dimensions; only approved Products delta is allowed');
