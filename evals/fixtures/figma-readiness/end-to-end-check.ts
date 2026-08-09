import { createHistoryDossier } from '../../../extract/figma/organism-audit/readiness/dossier.js';
import { pinCurrentInputs } from '../../../extract/figma/organism-audit/readiness/preflight.js';
import { rankCandidates } from '../../../extract/figma/organism-audit/readiness/candidates.js';
import { buildInitialDossier } from '../../../extract/figma/organism-audit/readiness/run.js';
import { audit, state } from './helpers.js';

const historical = [state('coherent', { observedAt: '2026-06-01T00:00:00.000Z' }), state('broken', { observedAt: '2026-07-01T00:00:00.000Z', contradictions: ['design change unverified'] })];
const dossier = createHistoryDossier({ sectionId: 'hero', sourceAudit: audit('hero'), currentPins: { figma: { versionId: 'v-current', nodeId: 'hero' }, contract: { path: 'contract', sha256: 'a'.repeat(64) }, render: { ref: 'render' }, odoo019: { path: '019-lock', sha256: 'b'.repeat(64) } }, historicalStates: historical });
if (dossier.status !== 'awaiting-owner' || dossier.candidates.length !== 1 || dossier.candidates[0].historicalStateId !== 'coherent') throw new Error('end-to-end history flow did not stop at owner gate with only coherent candidate');
if (rankCandidates(historical, 'v-current').some((candidate) => candidate.historicalStateId === 'broken')) throw new Error('contradictory state entered candidate set');
const cliDossier = buildInitialDossier({ sectionId: 'hero', displayName: 'Hero', contractPath: 'contracts/hero.contract.json', masterNodeId: 'node:hero', usagePositions: ['node:hero:usage'], current: { figmaVersionId: 'v-current', renderRef: 'render' }, historicalEvidence: historical }, { figma: { versionId: 'v-current', nodeId: 'node:hero' }, contract: { path: 'contract', sha256: 'a'.repeat(64) }, render: { ref: 'render' }, odoo019: { path: '019-lock', sha256: 'b'.repeat(64) } }, 'c'.repeat(64), audit('hero'));
if (cliDossier.status !== 'awaiting-owner' || cliDossier.candidates.length !== 1) throw new Error('CLI inventory path ignored clean source audit and historical evidence');
console.log('✔ end-to-end readiness flow produces a bounded coherent candidate set and stops before owner authority');
