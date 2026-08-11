/** Deterministic, source-based inventory of every shared repair consumer. */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import type { ConsumerImpact } from './types.js';

type Json = Record<string, unknown>;
const object = (value: unknown): value is Json => typeof value === 'object' && value !== null && !Array.isArray(value);

function walk(value: unknown, visit: (entry: Json) => void): void {
  if (Array.isArray(value)) { value.forEach((entry) => walk(entry, visit)); return; }
  if (!object(value)) return;
  visit(value);
  Object.values(value).forEach((entry) => walk(entry, visit));
}

/**
 * Contract ids and structural paths are identity. Display/layer names are never
 * consulted to decide whether a consumer is affected.
 */
export function buildImpactInventory(root = process.cwd()): ConsumerImpact[] {
  const contractsDir = path.join(root, 'contracts');
  const rows: ConsumerImpact[] = [];
  for (const file of readdirSync(contractsDir).filter((name) => name.endsWith('.contract.json')).sort()) {
    const relative = `contracts/${file}`;
    const contract = JSON.parse(readFileSync(path.join(contractsDir, file), 'utf8')) as Json;
    const contractId = typeof contract.id === 'string' ? contract.id : relative;
    let usesButton = false;
    let usesSectionHeader = false;
    let usesAccordionRow = false;
    let usesAbsolute = false;
    walk(contract.anatomy, (entry) => {
      if (object(entry.component) && entry.component.id === 'ds.button') usesButton = true;
      if (object(entry.component) && entry.component.id === 'ds.section-header') usesSectionHeader = true;
      if (object(entry.component) && entry.component.id === 'ds.accordion-row') usesAccordionRow = true;
      if (object(entry.declared) && entry.declared.position === 'absolute') usesAbsolute = true;
    });
    for (const dependencyId of [
      ...(usesButton ? ['Button'] : []),
      ...(usesSectionHeader ? ['SectionHeader'] : []),
      ...(usesAccordionRow ? ['AccordionRow'] : []),
      ...(usesAbsolute ? ['absolute-lowering'] : []),
    ]) {
      rows.push({ consumerId: contractId, dependencyId, usage: 'contract', evidenceRefs: [relative], status: 'pending', decisionRef: null });
    }
  }

  // Odoo 019 is a qualification consumer, not a renamed Figma layer. It must
  // receive an explicit hold/revalidation decision before an owner receipt may
  // be accepted. The lock is the authority; missing input is named in preflight.
  const odooLock = 'integrations/odoo/config/inputs.lock.json';
  if (existsSync(path.join(root, odooLock))) {
    const lock = JSON.parse(readFileSync(path.join(root, odooLock), 'utf8')) as Json;
    const lockedContracts = new Set(Array.isArray(lock.contracts)
      ? lock.contracts.filter(object).map((entry) => String(entry.id ?? ''))
      : []);
    for (const dependencyId of [
      ...(lockedContracts.has('ds.button') ? ['Button'] : []),
      ...(lockedContracts.has('ds.section-header') ? ['SectionHeader'] : []),
      ...(lockedContracts.has('ds.accordion-row') ? ['AccordionRow'] : []),
      'absolute-lowering',
    ]) {
      rows.push({ consumerId: 'odoo-019-qualification', dependencyId, usage: 'odoo', evidenceRefs: [odooLock], status: 'pending', decisionRef: null });
    }
  }
  return rows.sort((left, right) => left.dependencyId.localeCompare(right.dependencyId) || left.consumerId.localeCompare(right.consumerId) || left.usage.localeCompare(right.usage));
}

export function impactInventoryIsComplete(impacts: readonly ConsumerImpact[]): boolean {
  return impacts.length > 0 && impacts.every((impact) => impact.consumerId.length > 0 && impact.dependencyId.length > 0 && impact.evidenceRefs.length > 0);
}

export interface ConsumerImpactIssue {
  code: 'consumer-missing' | 'consumer-pending' | 'consumer-decision-missing';
  consumerId: string;
  dependencyId: string;
  message: string;
}

const impactIdentity = (impact: Pick<ConsumerImpact, 'consumerId' | 'dependencyId' | 'usage'>): string =>
  `${impact.usage}:${impact.dependencyId}:${impact.consumerId}`;

/** Close the exact source-derived graph. An absent row, an open status, or an
 * Odoo revalidation without its explicit decision blocks the owner receipt. */
export function validateSharedConsumerImpacts(
  expected: readonly ConsumerImpact[],
  actual: readonly ConsumerImpact[],
): { ok: boolean; issues: ConsumerImpactIssue[] } {
  const actualById = new Map(actual.map((impact) => [impactIdentity(impact), impact]));
  const issues: ConsumerImpactIssue[] = [];
  for (const expectedImpact of expected) {
    const actualImpact = actualById.get(impactIdentity(expectedImpact));
    if (!actualImpact) {
      issues.push({
        code: 'consumer-missing',
        consumerId: expectedImpact.consumerId,
        dependencyId: expectedImpact.dependencyId,
        message: `Missing shared consumer ${impactIdentity(expectedImpact)}`,
      });
      continue;
    }
    if (actualImpact.status === 'pending') {
      issues.push({
        code: 'consumer-pending',
        consumerId: actualImpact.consumerId,
        dependencyId: actualImpact.dependencyId,
        message: `Shared consumer remains pending: ${impactIdentity(actualImpact)}`,
      });
    }
    if (
      actualImpact.usage === 'odoo' &&
      (actualImpact.status === 'revalidated' || actualImpact.status === 'refused') &&
      !actualImpact.decisionRef
    ) {
      issues.push({
        code: 'consumer-decision-missing',
        consumerId: actualImpact.consumerId,
        dependencyId: actualImpact.dependencyId,
        message: `Odoo consumer has no explicit decision: ${impactIdentity(actualImpact)}`,
      });
    }
  }
  return { ok: issues.length === 0, issues };
}
