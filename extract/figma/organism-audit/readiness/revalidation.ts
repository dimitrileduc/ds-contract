import type { DependencyImpactGraph } from './impact.js';

export interface Repin019Decision { dependencyId: string; decisionId: string; affectedProofs: string[]; }

export function requireRevalidation(graph: DependencyImpactGraph, repins: readonly Repin019Decision[]): string[] {
  const issues: string[] = [];
  for (const node of graph.nodes) {
    if ((node.kind === 'section' || node.kind === 'odoo-qualification') && node.revalidationStatus === 'required') issues.push(`consumer-unrevalidated:${node.id}`);
    if (node.kind === 'odoo-qualification' && !repins.some((repin) => repin.dependencyId === node.id || repin.dependencyId === graph.nodes.find((item) => item.kind === 'dependency')?.id)) issues.push(`odoo-019-repin-missing:${node.id}`);
  }
  if (graph.completeness !== 'complete') issues.push(`impact-graph-${graph.completeness}`);
  return [...new Set(issues)].sort();
}
