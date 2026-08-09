/** Fixed perimeter and routing policy for readiness campaign 020. */
export const READINESS_SCHEMA_VERSION = '1.0.0' as const;

export const READINESS_SECTION_IDS = [
  'coordonnees', 'devis', 'equipe', 'faq', 'formulaire', 'header', 'hero',
  'footer', 'reassurances', 'sav', 'texte-seo',
] as const;

export type SectionId = (typeof READINESS_SECTION_IDS)[number];
export type FinalVerdict =
  | 'ready'
  | 'ready-with-exception'
  | 'repair-figma'
  | 'repair-contract'
  | 'repair-renderer'
  | 'accepted-defect'
  | 'out-of-contract'
  | 'blocked-history';
export type Destination = 'wave-a' | 'wave-b' | 'shell-workstream' | `repair-spec:${string}`;

export const FINAL_VERDICTS: readonly FinalVerdict[] = [
  'ready', 'ready-with-exception', 'repair-figma', 'repair-contract',
  'repair-renderer', 'accepted-defect', 'out-of-contract', 'blocked-history',
] as const;

export function isSectionId(value: string): value is SectionId {
  return (READINESS_SECTION_IDS as readonly string[]).includes(value);
}

/** FR-026. Header and Footer are deliberately routed before their verdict is considered. */
export function destinationFor(sectionId: SectionId, verdict: FinalVerdict, repairSpec?: string): Destination {
  if (sectionId === 'header' || sectionId === 'footer') return 'shell-workstream';
  if (verdict === 'ready') return 'wave-a';
  if (verdict === 'ready-with-exception' || verdict === 'accepted-defect' || verdict === 'out-of-contract') {
    return 'wave-b';
  }
  if (!repairSpec || !/^[a-z0-9-]+$/.test(repairSpec)) {
    throw new Error(`verdict ${verdict} for ${sectionId} requires a named lower-case repair spec`);
  }
  return `repair-spec:${repairSpec}`;
}

export function sameInventory(ids: readonly string[]): boolean {
  return ids.length === READINESS_SECTION_IDS.length
    && new Set(ids).size === READINESS_SECTION_IDS.length
    && READINESS_SECTION_IDS.every((id) => ids.includes(id));
}
