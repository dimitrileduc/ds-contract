import { classifyRepair } from '../../../extract/figma/organism-audit/readiness/routing.js';
import { closeDossier } from '../../../extract/figma/organism-audit/readiness/close.js';
import { decision, dossier, expectThrows } from './helpers.js';

expectThrows(() => classifyRepair({ target: 'hero', reason: 'small local fix' }), 'local repair without owner/capture');
const shared = classifyRepair({ target: 'hero', reason: 'shared atom defect', affectsSharedDependency: true });
if (shared.scope !== 'sub-spec' || !shared.subSpecSlug) throw new Error('shared repair was kept in local 020 scope');
for (const input of [{ changesSchema: true }, { changesEngine: true }, { massRestore: true }, { crossImage: true }]) {
  if (classifyRepair({ target: 'hero', reason: 'broad repair', ...input }).scope !== 'sub-spec') throw new Error(`broad repair was kept local: ${JSON.stringify(input)}`);
}
const local = classifyRepair({ target: 'hero', reason: 'local reversible change', authorizedByDecisionId: 'owner-1', beforeCaptureManifest: 'proofs/before.json' });
if (local.scope !== 'local-020') throw new Error('authorized local repair was not classified local');
expectThrows(() => closeDossier({ dossier: dossier('hero'), verdict: 'repair-contract', decisions: [decision('hero')], impactGraph: { nodes: [], edges: [], completeness: 'complete', missingSources: [] }, repins: [] }), 'repair verdict without named assignment');
console.log('✔ routing refuses unauthorized local work and requires a named sub-spec for broad repair classes');
