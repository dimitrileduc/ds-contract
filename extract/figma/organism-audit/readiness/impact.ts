export type RevalidationStatus = 'not-required' | 'required' | 'passed' | 'failed' | 'blocked';
export interface ImpactNode { id: string; kind: 'section' | 'dependency' | 'odoo-qualification'; pin?: string; revalidationStatus: RevalidationStatus; }
export interface ImpactEdge { consumerId: string; dependencyId: string; usage: 'contract' | 'figma' | 'render' | 'odoo'; evidenceRefs: string[]; }
export interface DependencyImpactGraph { nodes: ImpactNode[]; edges: ImpactEdge[]; completeness: 'complete' | 'partial'; missingSources: string[]; }

export function buildImpactGraph(input: { dependencyId: string; consumers: readonly { id: string; usage: ImpactEdge['usage']; evidenceRefs?: string[]; isOdoo019?: boolean }[]; missingSources?: string[] }): DependencyImpactGraph {
  const nodes: ImpactNode[] = [{ id: input.dependencyId, kind: 'dependency', revalidationStatus: 'not-required' }];
  const edges: ImpactEdge[] = [];
  for (const consumer of [...input.consumers].sort((left, right) => left.id.localeCompare(right.id) || left.usage.localeCompare(right.usage))) {
    nodes.push({ id: consumer.id, kind: consumer.isOdoo019 ? 'odoo-qualification' : 'section', revalidationStatus: 'required' });
    edges.push({ consumerId: consumer.id, dependencyId: input.dependencyId, usage: consumer.usage, evidenceRefs: [...(consumer.evidenceRefs ?? [])].sort() });
  }
  const missingSources = [...(input.missingSources ?? [])].sort();
  return { nodes, edges, completeness: missingSources.length === 0 ? 'complete' : 'partial', missingSources };
}
