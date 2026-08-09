import { buildImpactGraph } from '../../../extract/figma/organism-audit/readiness/impact.js';
import { requireRevalidation } from '../../../extract/figma/organism-audit/readiness/revalidation.js';

const graph = buildImpactGraph({ dependencyId: 'ds.shared-child', consumers: [{ id: 'hero', usage: 'contract', evidenceRefs: ['contract:hero'] }, { id: 'odoo-019:presentation', usage: 'odoo', isOdoo019: true }] });
if (graph.edges.length !== 2 || graph.nodes.filter((node) => node.revalidationStatus === 'required').length !== 2) throw new Error('all consumers were not included in impact graph');
const pending = requireRevalidation(graph, []);
if (!pending.includes('consumer-unrevalidated:hero') || !pending.some((issue) => issue.startsWith('odoo-019-repin-missing'))) throw new Error('unrevalidated consumer or 019 repin was not refused');
for (const node of graph.nodes) if (node.kind !== 'dependency') node.revalidationStatus = 'passed';
if (requireRevalidation(graph, [{ dependencyId: 'ds.shared-child', decisionId: 'repin-1', affectedProofs: ['019:visual'] }]).length !== 0) throw new Error('complete revalidation and explicit 019 repin remained blocked');
const localOnly = buildImpactGraph({ dependencyId: 'ds.local-child', consumers: [{ id: 'hero', usage: 'figma' }] });
if (localOnly.edges.length !== 1 || localOnly.edges[0].consumerId !== 'hero') throw new Error('local composition graph did not remain scoped to its sole consumer');
console.log('✔ impact graphs enumerate consumers and refuse shared changes until each revalidation and 019 repin is recorded');
