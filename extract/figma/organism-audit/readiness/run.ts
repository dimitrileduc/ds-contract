/** CLI for the governed, read-only readiness campaign. */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { loadReadinessCampaign } from './campaign.js';
import { stableJson } from './evidence.js';
import { createHistoryDossier, unavailableHistoryDossier } from './dossier.js';
import { renderOwnerPacket } from './owner-packet.js';
import { pinCurrentInputs, type CurrentPins } from './preflight.js';
import { OwnerDecisionSchema, SourceAuditSchema, type OwnerDecision, type ReadinessCampaign, type SourceAudit } from './schema.js';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..', '..');

type Cli = { campaign: string | null; check: boolean; writeInventory: boolean };
function parseArgs(argv: readonly string[]): Cli {
  const cli: Cli = { campaign: null, check: false, writeInventory: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--campaign') cli.campaign = argv[++index] ?? null;
    else if (arg === '--check') cli.check = true;
    else if (arg === '--write-inventory') cli.writeInventory = true;
    else throw new Error(`unknown readiness option: ${arg}`);
  }
  if (!cli.campaign) throw new Error('--campaign <path> is required');
  if (cli.check && cli.writeInventory) throw new Error('--check never writes; remove --write-inventory');
  return cli;
}

function readDecisions(registryPath: string): OwnerDecision[] {
  if (!existsSync(registryPath)) return [];
  let raw: unknown;
  try { raw = JSON.parse(readFileSync(registryPath, 'utf8')) as unknown; } catch { throw new Error(`owner decision registry is not valid JSON: ${registryPath}`); }
  const decisions = (raw as { decisions?: unknown }).decisions;
  if (!Array.isArray(decisions)) throw new Error(`owner decision registry has no decisions array: ${registryPath}`);
  return decisions.map((decision, index) => {
    const parsed = OwnerDecisionSchema.safeParse(decision);
    if (!parsed.success) throw new Error(`invalid owner decision at index ${index}: ${parsed.error.issues.map((issue) => issue.message).join('; ')}`);
    return parsed.data;
  });
}

function readSourceAudit(section: ReadinessCampaign['sections'][number]): SourceAudit | null {
  if (!section.sourceAuditPath) return null;
  const sourceAuditPath = path.resolve(ROOT, section.sourceAuditPath);
  if (!existsSync(sourceAuditPath)) throw new Error(`source audit is missing for ${section.sectionId}: ${section.sourceAuditPath}`);
  let raw: unknown;
  try { raw = JSON.parse(readFileSync(sourceAuditPath, 'utf8')) as unknown; } catch { throw new Error(`source audit is not valid JSON for ${section.sectionId}: ${section.sourceAuditPath}`); }
  const parsed = SourceAuditSchema.safeParse(raw);
  if (!parsed.success) throw new Error(`invalid source audit for ${section.sectionId}: ${parsed.error.issues.map((issue) => issue.message).join('; ')}`);
  if (parsed.data.sectionId !== section.sectionId) throw new Error(`source audit belongs to ${parsed.data.sectionId}, expected ${section.sectionId}`);
  return parsed.data;
}

export function buildInitialDossier(
  section: ReadinessCampaign['sections'][number],
  currentPins: CurrentPins,
  campaignSha256: string,
  sourceAudit: SourceAudit | null,
) {
  return sourceAudit === null
    ? unavailableHistoryDossier({
      sectionId: section.sectionId,
      sourceAudit: { sectionId: section.sectionId, masterNodeId: section.masterNodeId, usagePositions: section.usagePositions, checkedDimensions: ['structure', 'constraints', 'properties', 'variable-bindings', 'sizes', 'descriptions'], missingSources: ['live-figma-master-and-usage-scan-not-yet-captured'], status: 'blocked', evidenceRefs: [`campaign:${campaignSha256}`] },
      currentPins,
      reason: 'live Figma history has not been captured; this initial dossier is intentionally non-authoritative',
    })
    : createHistoryDossier({
      sectionId: section.sectionId,
      sourceAudit,
      currentPins,
      historicalStates: section.historicalEvidence,
    });
}

function writeInitialDossiers(campaignPath: string): string[] {
  const loaded = loadReadinessCampaign(campaignPath, ROOT);
  if (loaded.issues.length > 0) throw new Error(loaded.issues.map((issue) => `${issue.code}: ${issue.message}`).join('; '));
  const pins = pinCurrentInputs(loaded.campaign, ROOT);
  const written: string[] = [];
  for (const section of loaded.campaign.sections) {
    const sourceAudit = readSourceAudit(section);
    const dossier = buildInitialDossier(section, pins[section.sectionId], loaded.sha256, sourceAudit);
    const target = path.resolve(path.dirname(path.resolve(ROOT, campaignPath)), '..', 'dossiers', section.sectionId, 'dossier.json');
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, stableJson(dossier));
    written.push(path.relative(ROOT, target));
    const ownerPacket = path.join(path.dirname(target), 'owner', 'packet.json');
    mkdirSync(path.dirname(ownerPacket), { recursive: true });
    writeFileSync(ownerPacket, stableJson(renderOwnerPacket(dossier)));
    written.push(path.relative(ROOT, ownerPacket));
  }
  return written.sort();
}

export function runReadinessCli(argv = process.argv.slice(2)): never {
  try {
    const cli = parseArgs(argv);
    const loaded = loadReadinessCampaign(cli.campaign!, ROOT);
    const pins = loaded.issues.length === 0 ? pinCurrentInputs(loaded.campaign, ROOT) : null;
    const decisions = readDecisions(path.resolve(ROOT, loaded.campaign.ownerDecisionRegistry));
    const sourceAudits = Object.fromEntries(loaded.campaign.sections.map((section) => [section.sectionId, readSourceAudit(section)]));
    const written = cli.writeInventory && loaded.issues.length === 0 ? writeInitialDossiers(cli.campaign!) : [];
    const report = {
      schemaVersion: '1.0.0', campaignId: loaded.campaign.campaignId, mode: { check: cli.check, writeInventory: cli.writeInventory },
      campaignSha256: loaded.sha256, sectionCount: loaded.campaign.sections.length, inputPins: pins,
      ownerDecisionCount: decisions.length,
      readiness: loaded.campaign.sections.map((section) => {
        const sourceAudit = sourceAudits[section.sectionId];
        const hasReferenceDecision = decisions.some((decision) => decision.sectionId === section.sectionId && decision.gate === 'reference');
        const namedSkips = [
          ...(sourceAudit === null ? ['live-figma-source-cleanliness-receipt-missing'] : sourceAudit.status !== 'clean' ? [`live-figma-source-${sourceAudit.status}`] : []),
          ...(section.historicalEvidence.length === 0 ? ['historical-evidence-not-yet-captured'] : []),
          ...(!hasReferenceDecision ? ['owner-reference-decision-missing'] : []),
        ];
        const state = sourceAudit === null || sourceAudit.status !== 'clean'
          ? 'awaiting-live-source-audit'
          : section.historicalEvidence.length === 0
            ? 'blocked-history'
            : hasReferenceDecision ? 'owner-reference-recorded' : 'awaiting-owner';
        return { sectionId: section.sectionId, state, namedSkips };
      }),
      validation: { ok: loaded.issues.length === 0, issues: loaded.issues }, written,
    };
    process.stdout.write(stableJson(report));
    process.exit(loaded.issues.length === 0 ? 0 : 2);
  } catch (error) {
    process.stderr.write(`REFUSED — ${(error as Error).message}\n`);
    process.exit(2);
  }
}

if (process.argv[1]?.endsWith('/readiness/run.ts') || process.argv[1]?.endsWith('readiness/run.ts')) runReadinessCli();
