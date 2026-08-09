import type { OwnerDecision } from './schema.js';
import { OwnerDecisionSchema } from './schema.js';

export function validateOwnerDecision(value: unknown): OwnerDecision {
  return OwnerDecisionSchema.parse(value);
}

/** Appending rejects replacement by id; the registry is an immutable receipt log. */
export function appendDecision(existing: readonly OwnerDecision[], decision: OwnerDecision): OwnerDecision[] {
  if (existing.some((item) => item.decisionId === decision.decisionId)) throw new Error(`owner decision is immutable and already exists: ${decision.decisionId}`);
  return [...existing, decision].sort((left, right) => left.decidedAt.localeCompare(right.decidedAt) || left.decisionId.localeCompare(right.decisionId));
}

export function decisionsFor(existing: readonly OwnerDecision[], sectionId: string, gate: OwnerDecision['gate']): OwnerDecision[] {
  return existing.filter((decision) => decision.sectionId === sectionId && decision.gate === gate);
}
