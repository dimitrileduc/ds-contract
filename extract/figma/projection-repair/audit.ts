import type { TokenCorpus } from '../../../core/token-corpus.js';
import { loadRepoData } from '../../fidelity-matrix/scripts/lib.js';
import { inspectFigmaCampaign, figmaToken } from './capture.js';
import { isObject, walkStructural as walk } from './json.js';
import type { ComponentAuditReport, RepairCampaign, TextAuditClassification } from './types.js';

/** `any` here is deliberate: the audit visitors read Figma dump fields loosely. */
type Json = Record<string, any>;
const object = isObject as (value: unknown) => value is Json;

function metricMatches(node: Json, expected: TokenCorpus['textStyles'][number]): boolean {
  const style = object(node.style) ? node.style : {};
  return style.fontFamily === expected.fontFamily &&
    style.fontSize === expected.fontSize &&
    style.fontWeight === expected.fontWeight &&
    (expected.lineHeight === undefined || style.lineHeightPx === expected.lineHeight) &&
    (style.textCase ?? 'ORIGINAL') === expected.textCase;
}

function styleName(file: Json, styleId: string | null): string | null {
  if (!styleId || !object(file.styles)) return null;
  const candidates = [styleId, styleId.replace(/^S:/, '')];
  for (const candidate of candidates) {
    const metadata = file.styles[candidate];
    if (object(metadata) && typeof metadata.name === 'string') return metadata.name;
  }
  return null;
}

function classifyText(node: Json, file: Json, styles: TokenCorpus): {
  classification: TextAuditClassification;
  textStyleId: string | null;
  textStyleName: string | null;
  reasons: string[];
} {
  const rawStyleId = object(node.styles) ? node.styles.text : node.textStyleId;
  const textStyleId = typeof rawStyleId === 'string' && rawStyleId.length > 0 ? rawStyleId : null;
  const name = styleName(file, textStyleId);
  const overrides = Array.isArray(node.characterStyleOverrides) ? node.characterStyleOverrides : [];
  const overrideTable = object(node.styleOverrideTable) ? node.styleOverrideTable : {};
  const rich = overrides.some((value) => value !== 0) || Object.keys(overrideTable).length > 0;

  if (rich) {
    return {
      classification: 'rich-ranges', textStyleId, textStyleName: name,
      reasons: ['native character ranges are present; no whole-node Text Style is required'],
    };
  }
  if (textStyleId && name) {
    const expected = styles.textStyleByName.get(name);
    if (expected && metricMatches(node, expected)) {
      return { classification: 'named-exact', textStyleId, textStyleName: name, reasons: ['governed Text Style name and metrics match exactly'] };
    }
    return {
      classification: 'defect', textStyleId, textStyleName: name,
      reasons: [expected ? 'Text Style metrics differ from the governed recipe' : 'linked Text Style is not governed by the token corpus'],
    };
  }
  const exact = styles.textStyles.filter((candidate) => metricMatches(node, candidate));
  return {
    classification: 'defect', textStyleId: null, textStyleName: null,
    reasons: [exact.length === 1
      ? `raw typography exactly matches ${exact[0].name} but the Text Style link is missing`
      : 'raw typography has no documented rich ranges or historical-custom decision'],
  };
}

function directDependencies(master: Json, nodes: Map<string, Json>, parents: Map<string, Json>, contractIds: Map<string, string>): string[] {
  const names = new Set<string>();
  const visit = (node: Json): void => {
    for (const child of Array.isArray(node.children) ? node.children : []) {
      if (!object(child)) continue;
      if (child.type === 'INSTANCE') {
        const dependency = typeof child.componentId === 'string' ? nodes.get(child.componentId) : null;
        const componentSet = dependency?.type === 'COMPONENT' && typeof dependency.id === 'string' && parents.get(dependency.id)?.type === 'COMPONENT_SET'
          ? parents.get(dependency.id)! : null;
        const identityNode = componentSet ?? dependency;
        const contractId = typeof identityNode?.id === 'string' ? contractIds.get(identityNode.id) : null;
        names.add(contractId ?? (typeof identityNode?.name === 'string' ? identityNode.name : String(child.name ?? child.componentId ?? '(unknown)')));
        continue;
      }
      visit(child);
    }
  };
  visit(master);
  return [...names].sort();
}

export function organismContainerIssues(master: Json, parent: Json | null): string[] {
  const componentChildren = Array.isArray(parent?.children)
    ? parent.children.filter((child: unknown) => object(child) && ['COMPONENT', 'COMPONENT_SET', 'INSTANCE'].includes(String(child.type)))
    : [];
  const issues: string[] = [];
  if (!parent || parent.type !== 'FRAME') issues.push('master is not directly presented by a local FRAME Container');
  if (parent && (parent.layoutMode === undefined || parent.layoutMode === 'NONE')) issues.push('local Container is not auto-layout');
  if (parent && !String(parent.name ?? '').toLowerCase().startsWith('container')) issues.push('local presentation parent is not named Container');
  if (master.layoutSizingHorizontal !== 'FILL') issues.push('organism master is not width FILL inside its local Container');
  if (parent && (componentChildren.length !== 1 || componentChildren[0]?.id !== master.id)) {
    issues.push('local Container must present exactly this one organism master');
  }
  return issues;
}

export async function auditComponentCampaign(campaign: RepairCampaign): Promise<ComponentAuditReport> {
  if (campaign.schemaVersion !== '2.0.0' || !campaign.workflow || campaign.targets.length !== 1) {
    throw new Error('component audit requires one schema v2 target');
  }
  const inspection = await inspectFigmaCampaign(campaign, figmaToken(), {
    enforceVersionPin: false,
    enforceTopology: false,
  });
  const target = campaign.targets[0];
  const master = inspection.nodes.get(target.masterNodeId);
  if (!master) throw new Error(`audit: master ${target.masterNodeId} is absent from the current file`);

  // The inspection already walked the whole document once to build its
  // id-indexed map; the parent relation falls out of that map without a
  // second full-tree traversal.
  const parents = new Map<string, Json>();
  for (const node of inspection.nodes.values()) {
    for (const child of Array.isArray(node.children) ? node.children : []) {
      if (object(child) && typeof child.id === 'string') parents.set(child.id, node);
    }
  }
  const parent = parents.get(target.masterNodeId) ?? null;
  const containerApplicable = campaign.workflow.subjectKind === 'organism';
  const containerIssues = containerApplicable ? organismContainerIssues(master, parent) : [];

  // The shared loader parses contracts through the schema, so a malformed
  // contract refuses the audit by name instead of shaping a wrong report.
  const repo = loadRepoData();
  const styles = repo.corpus;
  const contractIds = new Map<string, string>(
    [...repo.contracts.values()].flatMap((contract) =>
      typeof contract.anchors.figma.nodeId === 'string' ? [[contract.anchors.figma.nodeId, contract.id] as const] : []),
  );
  const texts: ComponentAuditReport['texts'] = [];
  walk(master, (node, structuralPath) => {
    if (node.type !== 'TEXT' || typeof node.id !== 'string') return;
    const historicalDecision = campaign.workflow?.historicalTextDecisions?.[node.id];
    const classified = historicalDecision
      ? {
          classification: 'historical-custom' as const,
          textStyleId: null,
          textStyleName: null,
          reasons: [`pixel-fidelity exception is documented by ${historicalDecision}`],
        }
      : classifyText(node, inspection.file, styles);
    texts.push({
      nodeId: node.id,
      structuralPath,
      name: String(node.name ?? ''),
      characters: String(node.characters ?? ''),
      ...classified,
    });
  });

  const observedDependencies = directDependencies(master, inspection.nodes, parents, contractIds);
  const declaredDependencies = [...campaign.workflow.directDependencies].sort();
  const declaredNormalized = new Set(declaredDependencies.map((name) => name.toLowerCase()));
  const undeclaredDependencies = observedDependencies.filter((name) => !declaredNormalized.has(name.toLowerCase()));
  const findings: ComponentAuditReport['findings'] = [];
  if (containerIssues.length > 0) findings.push({ code: 'organism-container', severity: 'proposal', message: containerIssues.join('; ') });
  if (undeclaredDependencies.length > 0) findings.push({ code: 'dependency-inventory', severity: 'proposal', message: `undeclared direct dependencies: ${undeclaredDependencies.join(', ')}` });
  for (const text of texts.filter((entry) => entry.classification === 'defect')) {
    findings.push({ code: 'text-style', severity: 'proposal', message: `${text.name} (${text.nodeId}): ${text.reasons.join('; ')}` });
  }

  const proposedChanges = [
    ...(containerIssues.length > 0 ? ['present the existing master in one local auto-layout Container and set its horizontal sizing to FILL'] : []),
    ...(undeclaredDependencies.length > 0 ? [`declare direct dependencies: ${undeclaredDependencies.join(', ')}`] : []),
    ...texts.filter((entry) => entry.classification === 'defect').map((entry) => `repair Text Style classification for ${entry.name} (${entry.nodeId})`),
  ];
  const masterBox = object(master.absoluteBoundingBox) ? master.absoluteBoundingBox : null;

  return {
    schemaVersion: '1.0.0',
    campaignId: campaign.campaignId,
    targetId: target.targetId,
    inspectedAt: new Date().toISOString(),
    fileVersionId: inspection.versionId,
    verdict: findings.length === 0 ? 'green' : 'proposal',
    figmaWrites: [],
    container: {
      status: !containerApplicable ? 'not-applicable' : containerIssues.length === 0 ? 'pass' : 'fail',
      masterNodeId: target.masterNodeId,
      parentNodeId: typeof parent?.id === 'string' ? parent.id : null,
      parentName: typeof parent?.name === 'string' ? parent.name : null,
      parentType: typeof parent?.type === 'string' ? parent.type : null,
      parentLayoutMode: typeof parent?.layoutMode === 'string' ? parent.layoutMode : null,
      masterLayoutSizingHorizontal: typeof master.layoutSizingHorizontal === 'string' ? master.layoutSizingHorizontal : null,
      referenceWidth: typeof masterBox?.width === 'number' ? masterBox.width : null,
      responsiveWidths: [...(target.responsiveWidths ?? [])],
      issues: containerIssues,
    },
    texts,
    dependencies: { declared: declaredDependencies, observed: observedDependencies, undeclared: undeclaredDependencies },
    findings,
    proposedChanges,
  };
}
