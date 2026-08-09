import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { sha256 } from './evidence.js';
import { requireDocsFirst, requireNodeIdentity, type ReadinessIssue } from './invariants.js';
import { CampaignSchema, type ReadinessCampaign } from './schema.js';
import { sameInventory } from './scope.js';

export interface LoadedCampaign { campaign: ReadinessCampaign; bytes: string; sha256: string; issues: ReadinessIssue[]; }

/** Loads only local, versioned input. It never invokes Figma or mutates a canvas. */
export function loadReadinessCampaign(campaignPath: string, root: string): LoadedCampaign {
  const absolute = path.resolve(root, campaignPath);
  if (!existsSync(absolute)) throw new Error(`campaign not found: ${campaignPath}`);
  const bytes = readFileSync(absolute, 'utf8');
  let raw: unknown;
  try { raw = JSON.parse(bytes) as unknown; } catch { throw new Error(`campaign is not valid JSON: ${campaignPath}`); }
  const parsed = CampaignSchema.safeParse(raw);
  if (!parsed.success) throw new Error(`invalid readiness campaign: ${parsed.error.issues.map((issue) => issue.message).join('; ')}`);
  const campaign = parsed.data;
  const issues: ReadinessIssue[] = [];
  if (!sameInventory(campaign.expectedSections)) issues.push({ code: 'campaign-scope', path: '$.expectedSections', message: 'campaign must enumerate exactly the fixed eleven-section inventory' });
  const observed = campaign.sections.map((section) => section.sectionId);
  if (!sameInventory(observed)) issues.push({ code: 'campaign-sections', path: '$.sections', message: 'sections must be the exact fixed eleven-section inventory without duplicates' });
  issues.push(...requireDocsFirst(campaign.consultedDocs));
  for (const section of campaign.sections) {
    issues.push(...requireNodeIdentity(section.sectionId, section.masterNodeId, section.usagePositions));
    if (!existsSync(path.resolve(root, section.contractPath))) issues.push({ code: 'contract-pin', path: `$.sections.${section.sectionId}.contractPath`, message: `contract is missing: ${section.contractPath}` });
  }
  return { campaign, bytes, sha256: sha256(bytes), issues };
}
