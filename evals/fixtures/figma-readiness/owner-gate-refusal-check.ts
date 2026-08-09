import { referenceGate, postRepairGate } from '../../../extract/figma/organism-audit/readiness/gates.js';
import { closeDossier } from '../../../extract/figma/organism-audit/readiness/close.js';
import { decision, dossier, expectThrows } from './helpers.js';

const open = dossier('hero');
if (referenceGate(open, []).allowed || postRepairGate(open, []).allowed) throw new Error('repair/ready was allowed without reference decision');
if (referenceGate(open, [decision('hero', 'reference', 'more-evidence-required')]).allowed) throw new Error('more-evidence-required was treated as approval');
expectThrows(() => closeDossier({ dossier: open, verdict: 'ready', decisions: [], impactGraph: { nodes: [], edges: [], completeness: 'complete', missingSources: [] }, repins: [] }), 'ready without owner decision');
console.log('✔ repair and ready are refused without the appropriate immutable owner decisions');
