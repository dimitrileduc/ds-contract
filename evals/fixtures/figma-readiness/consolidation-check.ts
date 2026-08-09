import { closeDossier } from '../../../extract/figma/organism-audit/readiness/close.js';
import { consolidateReadiness } from '../../../extract/figma/organism-audit/readiness/consolidate.js';
import { READINESS_SECTION_IDS } from '../../../extract/figma/organism-audit/readiness/scope.js';
import { destinationFor } from '../../../extract/figma/organism-audit/readiness/scope.js';
import { decision, dossier, expectThrows } from './helpers.js';

const decisions = READINESS_SECTION_IDS.map((sectionId) => decision(sectionId));
const closed = READINESS_SECTION_IDS.map((sectionId) => closeDossier({ dossier: dossier(sectionId), verdict: 'ready', decisions, impactGraph: { nodes: [], edges: [], completeness: 'complete', missingSources: [] }, repins: [] }));
const result = consolidateReadiness({ campaignId: 'fixture', dossiers: closed, ownerDecisions: decisions }) as { qualityMetrics: { firstPassRepairAcceptance: { status: string } }; expectedSections: string[] };
if (result.expectedSections.length !== 11 || result.qualityMetrics.firstPassRepairAcceptance.status !== 'not-applicable') throw new Error('consolidation lost a section or treated zero repairs as a pass');
if (closed.find((entry) => entry.sectionId === 'header')?.destination !== 'shell-workstream' || closed.find((entry) => entry.sectionId === 'footer')?.destination !== 'shell-workstream') throw new Error('header/footer shell routing was not enforced');
for (const [verdict, destination] of [
  ['ready', 'wave-a'], ['ready-with-exception', 'wave-b'], ['accepted-defect', 'wave-b'], ['out-of-contract', 'wave-b'],
  ['repair-figma', 'repair-spec:repair-hero'], ['repair-contract', 'repair-spec:repair-hero'], ['repair-renderer', 'repair-spec:repair-hero'], ['blocked-history', 'repair-spec:repair-hero'],
] as const) {
  if (destinationFor('hero', verdict, 'repair-hero') !== destination) throw new Error(`FR-026 route mismatch for ${verdict}`);
}
expectThrows(() => consolidateReadiness({ campaignId: 'fixture', dossiers: closed.slice(1), ownerDecisions: decisions }), 'short consolidation roster');
console.log('✔ consolidation covers every FR-026 route, requires 11 closed dossiers, routes header/footer to shell, and preserves zero-repair not-applicable metrics');
