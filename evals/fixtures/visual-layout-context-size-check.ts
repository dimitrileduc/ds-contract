/**
 * A visual campaign may recreate the measured rectangle that contained one
 * concrete Figma occurrence without writing those dimensions into the
 * reusable component contract.  Both axes must be sourced from the pinned GET
 * root geometry, and the preview CSS must size the comparison wrapper and its
 * emitted root together.
 */
import {
  REQUIRED_CAMPAIGN_SUBJECT_IDS,
  VISUAL_CAMPAIGN_SCHEMA_VERSION,
  validateVisualCampaign,
} from '../../extract/figma/visual-parity/campaign.js';
import { renderContextSizeCss } from '../../extract/figma/visual-parity/render.js';

const campaign = {
  schemaVersion: VISUAL_CAMPAIGN_SCHEMA_VERSION,
  id: 'layout-context-size-fixture',
  reference: {
    fileKey: 'd9FYAUcqdcNtsuaMgLefvJ',
    fileVersion: '2381229993207753432',
    readOnly: true,
  },
  assetsManifest: 'extract/figma/visual-parity/fixture-assets/manifest.json',
  subjects: REQUIRED_CAMPAIGN_SUBJECT_IDS.map((id) => ({
    id,
    contractId: `ds.${id}`,
    contractVersion: '1.0.0',
    figmaSetNodeId: '2063:1622',
    auditRefs: ['specs/fixture/audit.md'],
    cases: [{
      id: `${id}-default`,
      figmaNodeId: '2063:1606',
      factIds: [`${id}.default`],
      fixtureAssetIds: [],
      codeProps: {},
      aliases: [],
      ...(id === 'carte'
        ? { layoutContext: { rootWidth: 'figma-root', rootHeight: 'figma-root' } }
        : {}),
    }],
  })),
};

const accepted = validateVisualCampaign(campaign, {
  assetManifest: { schemaVersion: 1, assets: [] },
});
if (!accepted.ok) {
  throw new Error(
    `measured root width/height context must be accepted: ${accepted.issues
      .map((issue) => `${issue.code}@${issue.path}`)
      .join(', ')}`,
  );
}

const malformed = structuredClone(campaign) as any;
malformed.subjects[0].cases[0].layoutContext.rootHeight = 'viewport';
const rejected = validateVisualCampaign(malformed, {
  assetManifest: { schemaVersion: 1, assets: [] },
});
if (rejected.ok || !rejected.issues.some((issue) => issue.code === 'case-shape')) {
  throw new Error('an unmeasured layoutContext.rootHeight must be rejected');
}

const css = renderContextSizeCss(474, 470);
for (const declaration of [
  'width: 474px',
  'height: 470px',
  'width: 100%',
  'height: 100%',
]) {
  if (!css.includes(declaration)) {
    throw new Error(`root context CSS is missing ${JSON.stringify(declaration)}`);
  }
}

console.log('✔ visual layout context reproduces the pinned root width and height');
