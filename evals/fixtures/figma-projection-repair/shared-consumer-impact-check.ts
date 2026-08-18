/** 021 / US2 — every shared Button/SectionHeader/Odoo consumer must be present and closed. */
import { mergeConsumerImpacts, validateSharedConsumerImpacts } from '../../../extract/figma/projection-repair/impact.js';

const expected = [
  { consumerId: 'ds.carousel-controls', dependencyId: 'Button', usage: 'contract', evidenceRefs: ['contracts/carousel-controls.contract.json'], status: 'pending', decisionRef: null },
  { consumerId: 'ds.coordonnees', dependencyId: 'SectionHeader', usage: 'contract', evidenceRefs: ['contracts/coordonnees.contract.json'], status: 'pending', decisionRef: null },
  { consumerId: 'odoo-019-qualification', dependencyId: 'Button', usage: 'odoo', evidenceRefs: ['integrations/odoo/config/inputs.lock.json'], status: 'pending', decisionRef: null },
] as const;
const closed = [
  { ...expected[0], status: 'revalidated' as const },
  { ...expected[1], status: 'unchanged' as const },
  { ...expected[2], status: 'revalidated' as const, decisionRef: 'specs/021-figma-projection-repair/proofs/us2/consumer-verdicts.json' },
];

const green = validateSharedConsumerImpacts(expected, closed);
if (!green.ok) throw new Error(`complete closed impact graph was refused: ${green.issues.map((issue) => issue.code).join(', ')}`);

const missing = validateSharedConsumerImpacts(expected, closed.slice(1));
if (missing.ok || !missing.issues.some((issue) => issue.code === 'consumer-missing')) {
  throw new Error('an absent Button consumer was not refused');
}

const pending = structuredClone(closed);
pending[1].status = 'pending' as never;
const pendingResult = validateSharedConsumerImpacts(expected, pending);
if (pendingResult.ok || !pendingResult.issues.some((issue) => issue.code === 'consumer-pending')) {
  throw new Error('a pending SectionHeader consumer was not refused');
}

const odooWithoutDecision = structuredClone(closed);
odooWithoutDecision[2].decisionRef = null as never;
const odooResult = validateSharedConsumerImpacts(expected, odooWithoutDecision);
if (odooResult.ok || !odooResult.issues.some((issue) => issue.code === 'consumer-decision-missing')) {
  throw new Error('an Odoo revalidation without an explicit decision was not refused');
}

const explicitRoot = {
  consumerId: 'odoo-google-reviews', dependencyId: 'ds.google-reviews', usage: 'odoo' as const,
  evidenceRefs: ['integrations/odoo/config/inputs.lock.json'], status: 'pending' as const, decisionRef: null,
};
const merged = mergeConsumerImpacts(expected, [explicitRoot]);
if (merged.length !== expected.length + 1 || !merged.some((impact) => impact.dependencyId === 'ds.google-reviews')) {
  throw new Error('an explicitly declared production-root consumer was dropped by preflight impact merging');
}

console.log('✔ shared consumer impacts: absent, pending and decision-less Odoo consumers are refused');
