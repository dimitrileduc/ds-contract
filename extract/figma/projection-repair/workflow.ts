import path from 'node:path';
import type { RepairCampaign } from './types.js';

export interface RepairWorkflowPaths {
  evidenceRoot: string;
  auditPath: string;
  bridgeScriptPaths: { first: string; second: string };
  beforeRoot: string;
  afterRoot: string;
  idempotenceRoot: string;
  dryRunPath: string;
  comparisonPath: string;
  firstApplyReceiptPath: string;
  secondApplyReceiptPath: string;
  ownerDecisionRoot: string;
  finalReceiptRoot: string;
  closurePath: string;
}

const relativeJoin = (...parts: string[]): string => path.posix.join(...parts.map((part) => part.replaceAll('\\', '/')));

/**
 * Central path router. The legacy campaign keeps its committed evidence tree;
 * every v2 component run owns one configurable root and cannot spill into 021.
 */
export function workflowPaths(campaign: RepairCampaign): RepairWorkflowPaths {
  if (campaign.schemaVersion === '2.0.0') {
    if (!campaign.workflow) throw new Error('component repair v2 requires workflow configuration');
    const root = campaign.workflow.evidenceRoot;
    return {
      evidenceRoot: root,
      auditPath: relativeJoin(root, 'audit.json'),
      bridgeScriptPaths: { first: relativeJoin(root, 'bridge-first.js'), second: relativeJoin(root, 'bridge-second.js') },
      beforeRoot: relativeJoin(root, 'before'),
      afterRoot: relativeJoin(root, 'after'),
      idempotenceRoot: relativeJoin(root, 'idempotence'),
      dryRunPath: relativeJoin(root, 'dry-run.json'),
      comparisonPath: campaign.workflow.comparisonPath,
      firstApplyReceiptPath: campaign.workflow.applyReceiptPaths.first,
      secondApplyReceiptPath: campaign.workflow.applyReceiptPaths.second,
      ownerDecisionRoot: campaign.workflow.ownerDecisionRoot,
      finalReceiptRoot: relativeJoin(root, 'receipts'),
      closurePath: relativeJoin(root, 'closure.md'),
    };
  }
  const root = 'specs/021-figma-projection-repair/proofs';
  return {
    evidenceRoot: root,
    auditPath: relativeJoin(root, 'audit.json'),
    bridgeScriptPaths: { first: relativeJoin(root, 'bridge-first.js'), second: relativeJoin(root, 'bridge-second.js') },
    beforeRoot: relativeJoin(root, 'before'),
    afterRoot: relativeJoin(root, 'after'),
    idempotenceRoot: relativeJoin(root, 'idempotence'),
    dryRunPath: relativeJoin(root, 'us1/dry-run.json'),
    comparisonPath: relativeJoin(root, 'us4/comparison.json'),
    firstApplyReceiptPath: relativeJoin(root, 'us3/live-rebuilds.json'),
    secondApplyReceiptPath: relativeJoin(root, 'us3/live-rebuilds.json'),
    ownerDecisionRoot: 'specs/021-figma-projection-repair/campaign/owner-decisions',
    finalReceiptRoot: relativeJoin(root, 'us4/receipts'),
    closurePath: relativeJoin(root, 'closure.md'),
  };
}

export function captureRoot(campaign: RepairCampaign, phase: 'before' | 'after' | 'idempotence'): string {
  const paths = workflowPaths(campaign);
  if (phase === 'before') return paths.beforeRoot;
  if (phase === 'after') return paths.afterRoot;
  return paths.idempotenceRoot;
}
