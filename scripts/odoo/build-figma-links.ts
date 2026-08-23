/**
 * Projection Figma consommée par l'éditeur Odoo.
 *
 * Les panneaux savent quel contrat ils représentent, mais ne portent jamais une
 * URL : l'identité Figma est lue seulement depuis `anchors.figma` du contrat
 * canonique. Ce script est volontairement local, déterministe et sans réseau.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { generatedHeader } from './lib/canonical.js';
import {
  FIGMA_AUTHORING_SOURCE,
  FIGMA_LINKS_OUTPUT,
  FIGMA_PANELS_CENSUS,
  FIGMA_PANELS_MANIFEST,
  loadAllContracts,
} from './lib/repo-data.js';
import { materialize, resolvePath } from './check-authoring.js';
import { runAsCli } from './lib/cli.js';

type ContractRef = { id: string; version: string };
type ComponentSegment = { contract: ContractRef; viaPart?: string; repeat?: boolean };
export type PanelDescriptor = {
  panelId: string;
  kind: 'root' | 'child' | 'shell';
  optionClass: string;
  optionTemplate: string;
  selector: string;
  componentPath: ComponentSegment[];
};
type Manifest = { schemaVersion: string; panels: PanelDescriptor[] };
type CensusPanel = Pick<PanelDescriptor, 'optionClass' | 'optionTemplate' | 'selector'>;
type Census = { schemaVersion: string; panels: CensusPanel[] };
export type PanelFigmaEntry = {
  panelId: string;
  selector: string;
  contractId: string;
  contractVersion: string;
} & (
  | { status: 'available'; fileKey: string; nodeId: string }
  | { status: 'unavailable'; reason: 'missing-contract' | 'version-mismatch' | 'missing-anchor' | 'invalid-file-key' | 'invalid-node-id' | 'ambiguous-panel' }
);

const FILE_KEY = /^[A-Za-z0-9_-]+$/;
const NODE_ID = /^\d+:\d+$/;
const PANEL_ID = /^[a-z0-9][a-z0-9-]*$/;
const OPTION_CLASS = /^Piqueray[A-Za-z0-9]+Option$/;
const OPTION_TEMPLATE = /^piqueray_ds\.[A-Za-z0-9]+Option$/;
const VERSION = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/;

const parseJson = <T>(file: string): T => JSON.parse(readFileSync(file, 'utf8')) as T;
const uniqueProblems = (values: readonly string[], label: string): string[] => {
  const seen = new Set<string>();
  return values.flatMap((value) => seen.has(value) ? [`duplicate ${label}: ${value}`] : (seen.add(value), []));
};

function validateManifest(value: Manifest): string[] {
  const errors: string[] = [];
  if (value?.schemaVersion !== '1.0.0') errors.push('manifest schemaVersion must be 1.0.0');
  if (!Array.isArray(value?.panels) || value.panels.length === 0) return [...errors, 'manifest panels must be a non-empty array'];
  errors.push(...uniqueProblems(value.panels.map((panel) => panel.panelId), 'panelId'));
  errors.push(...uniqueProblems(value.panels.map((panel) => panel.optionClass), 'optionClass'));
  errors.push(...uniqueProblems(value.panels.map((panel) => panel.selector), 'selector'));
  for (const panel of value.panels) {
    const at = `panel ${JSON.stringify(panel?.panelId)}`;
    if (!PANEL_ID.test(panel?.panelId ?? '')) errors.push(`${at}: invalid panelId`);
    if (!['root', 'child', 'shell'].includes(panel?.kind)) errors.push(`${at}: invalid kind`);
    if (!OPTION_CLASS.test(panel?.optionClass ?? '')) errors.push(`${at}: invalid optionClass`);
    if (!OPTION_TEMPLATE.test(panel?.optionTemplate ?? '')) errors.push(`${at}: invalid optionTemplate`);
    if (typeof panel?.selector !== 'string' || !panel.selector.trim()) errors.push(`${at}: missing selector`);
    if (panel?.selector && !(/^\.s_pqr_/.test(panel.selector) || /^\.footer\[data-pqr-shell=/.test(panel.selector))) {
      errors.push(`${at}: native/third-party selector refused: ${panel.selector}`);
    }
    if (!Array.isArray(panel?.componentPath) || panel.componentPath.length === 0) {
      errors.push(`${at}: componentPath must be non-empty`);
      continue;
    }
    for (const [index, segment] of panel.componentPath.entries()) {
      if (!/^ds\.[a-z0-9][a-z0-9-]*$/.test(segment?.contract?.id ?? '')) errors.push(`${at}: segment ${index} invalid contract id`);
      if (!VERSION.test(segment?.contract?.version ?? '')) errors.push(`${at}: segment ${index} invalid contract version`);
      if (index === 0 && segment?.viaPart !== undefined) errors.push(`${at}: root segment must not have viaPart`);
      if (index > 0 && (!segment?.viaPart || !String(segment.viaPart).trim())) errors.push(`${at}: segment ${index} missing viaPart`);
      if (segment?.repeat !== undefined && typeof segment.repeat !== 'boolean') errors.push(`${at}: segment ${index} repeat must be boolean`);
    }
  }
  return errors;
}

function registeredPanels(): CensusPanel[] {
  const source = readFileSync(FIGMA_AUTHORING_SOURCE, 'utf8');
  const registered = /builder_options:\s*\[([^\]]+)\]/s.exec(source)?.[1]
    .split(',').map((name) => name.trim()).filter((name) => /^Piqueray[A-Za-z0-9]+Option$/.test(name))
    .filter((name) => name !== 'PiquerayRootPolicyOption' && name !== 'PiquerayFigmaLinkOption') ?? [];
  if (registered.length === 0) throw new Error('authoring registry has no Piqueray business options');
  const result: CensusPanel[] = [];
  for (const optionClass of registered) {
    const match = new RegExp(`export class ${optionClass} extends BaseOptionComponent \\{([\\s\\S]*?)\\n\\}`, 'm').exec(source);
    const template = match?.[1].match(/static template = (["'])(.*?)\1/)?.[2];
    const selector = match?.[1].match(/static selector = (["'])(.*?)\1/)?.[2];
    if (!template || !selector) throw new Error(`authoring registry option ${optionClass} is missing a literal template or selector`);
    result.push({ optionClass, optionTemplate: template, selector });
  }
  return result.sort((a, b) => a.optionClass.localeCompare(b.optionClass));
}

function assertCensus(manifest: Manifest, expected: Census): void {
  if (expected?.schemaVersion !== '1.0.0' || !Array.isArray(expected?.panels)) throw new Error('invalid figma panel census fixture');
  const key = (panel: CensusPanel) => `${panel.optionClass}\u0000${panel.optionTemplate}\u0000${panel.selector}`;
  const expectedKeys = new Set(expected.panels.map(key));
  const manifestKeys = new Set(manifest.panels.map(key));
  const registeredKeys = new Set(registeredPanels().map(key));
  const missing = [...expectedKeys].filter((entry) => !manifestKeys.has(entry));
  const orphaned = [...manifestKeys].filter((entry) => !expectedKeys.has(entry));
  const unregistered = [...manifestKeys].filter((entry) => !registeredKeys.has(entry));
  const uncensused = [...registeredKeys].filter((entry) => !expectedKeys.has(entry));
  const problems = [
    ...missing.map((entry) => `census missing mapping: ${entry.split('\u0000')[0]}`),
    ...orphaned.map((entry) => `census orphan mapping: ${entry.split('\u0000')[0]}`),
    ...unregistered.map((entry) => `census mapping not registered: ${entry.split('\u0000')[0]}`),
    ...uncensused.map((entry) => `census registered panel missing fixture: ${entry.split('\u0000')[0]}`),
  ];
  if (problems.length > 0) throw new Error(problems.join('\n'));
}

function resolvePanel(panel: PanelDescriptor): PanelFigmaEntry {
  const contracts = loadAllContracts();
  const terminal = panel.componentPath.at(-1)!.contract;
  const unknown = panel.componentPath.find((segment) => !contracts.has(segment.contract.id));
  if (unknown) return unavailable(panel, terminal, 'missing-contract');
  const mismatch = panel.componentPath.find((segment) => contracts.get(segment.contract.id)!.version !== segment.contract.version);
  if (mismatch) return unavailable(panel, terminal, 'version-mismatch');
  const root = panel.componentPath[0].contract;
  const resolved = resolvePath(panel.componentPath, materialize(root.id, contracts), contracts);
  if ('erreur' in resolved) {
    // Le chemin a été validé comme une adresse d'option ; après les contrôles
    // d'existence/version, un échec ne peut être qu'une ambiguïté ou une
    // adresse non atteignable. Les deux interdisent toute destination.
    return unavailable(panel, terminal, 'ambiguous-panel');
  }
  const anchor = (resolved.ok.contract as any).anchors?.figma as { fileKey?: unknown; nodeId?: unknown } | undefined;
  if (!anchor || anchor.fileKey === null || anchor.fileKey === undefined || anchor.nodeId === null || anchor.nodeId === undefined) {
    return unavailable(panel, terminal, 'missing-anchor');
  }
  if (typeof anchor.fileKey !== 'string' || !FILE_KEY.test(anchor.fileKey)) return unavailable(panel, terminal, 'invalid-file-key');
  if (typeof anchor.nodeId !== 'string' || !NODE_ID.test(anchor.nodeId)) return unavailable(panel, terminal, 'invalid-node-id');
  return {
    panelId: panel.panelId,
    selector: panel.selector,
    contractId: terminal.id,
    contractVersion: terminal.version,
    status: 'available',
    fileKey: anchor.fileKey,
    nodeId: anchor.nodeId,
  };
}

function unavailable(panel: PanelDescriptor, terminal: ContractRef, reason: Extract<PanelFigmaEntry, { status: 'unavailable' }>['reason']): PanelFigmaEntry {
  return { panelId: panel.panelId, selector: panel.selector, contractId: terminal.id, contractVersion: terminal.version, status: 'unavailable', reason };
}

function emit(entries: readonly PanelFigmaEntry[]): string {
  const lines = [generatedHeader('json', 'npm run odoo:figma-links').trimEnd(), '', '// ODOO-025-FIGMA-LINKS-GENERATED BEGIN', 'export const FIGMA_PANEL_LINKS = Object.freeze(['];
  for (const entry of entries) {
    const fields = Object.entries(entry).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join(', ');
    lines.push(`    Object.freeze({ ${fields} }),`);
  }
  lines.push(']);', '', '/** Rend une correspondance seulement pour la sélection exacte du panneau. */', 'export function findFigmaPanelLink(editingElement) {', '    const matches = FIGMA_PANEL_LINKS.filter((entry) => editingElement?.matches?.(entry.selector));', '    return matches.length === 1 ? matches[0] : null;', '}', '// ODOO-025-FIGMA-LINKS-GENERATED END', '');
  return lines.join('\n');
}

export function buildFigmaLinks(): { entries: PanelFigmaEntry[]; output: string } {
  const manifest = parseJson<Manifest>(FIGMA_PANELS_MANIFEST);
  const errors = validateManifest(manifest);
  if (errors.length > 0) throw new Error(errors.join('\n'));
  assertCensus(manifest, parseJson<Census>(FIGMA_PANELS_CENSUS));
  const entries = manifest.panels.map(resolvePanel).sort((a, b) => a.panelId.localeCompare(b.panelId));
  return { entries, output: emit(entries) };
}

export function main(): void {
  const check = process.argv.includes('--check');
  const { entries, output } = buildFigmaLinks();
  if (check) {
    if (!existsSync(FIGMA_LINKS_OUTPUT) || readFileSync(FIGMA_LINKS_OUTPUT, 'utf8') !== output) {
      throw new Error(`tampered: ${FIGMA_LINKS_OUTPUT} is not byte-current; run npm run odoo:figma-links`);
    }
    const unavailableEntries = entries.filter((entry) => entry.status === 'unavailable');
    if (unavailableEntries.length > 0) throw new Error(`unavailable: ${unavailableEntries.map((entry) => `${entry.panelId} (${entry.reason})`).join(', ')}`);
    console.log(`✔ Figma links current: ${entries.length} panels`);
    return;
  }
  mkdirSync(path.dirname(FIGMA_LINKS_OUTPUT), { recursive: true });
  writeFileSync(FIGMA_LINKS_OUTPUT, output);
  console.log(`✔ Figma links generated: ${entries.length} panels (${entries.filter((entry) => entry.status === 'unavailable').length} unavailable)`);
}

runAsCli(import.meta.url, main);
