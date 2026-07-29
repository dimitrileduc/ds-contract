/**
 * Replays all six source-pinned Nav/Tab cases against their
 * immutable Figma PNGs. It uses the same campaign renderer, pixel receipt,
 * geometry receipt, and semantic probe as the runner, without rewriting the
 * canonical campaign proof directory.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { composeSubject } from '../../extract/figma/visual-parity/compose.js';
import { createGeometryReceipt, createPixelReceipt, createProbativeEvidenceReceipt, createSemanticReceipt, createVisibilityReceipt } from '../../extract/figma/visual-parity/evidence.js';
import { evaluateAuthoritativeGate } from '../../extract/figma/visual-parity/gate.js';
import { alignPair, diffPair, readPng, scoreDeclaredRegions, type Aligned, type DeclaredRegion } from '../../extract/figma/visual-parity/img.js';
import { planVariant } from '../../extract/figma/visual-parity/match.js';
import {
  campaignCapturePageOptions,
  launchBrowser,
  renderCampaignVariant,
  type Rect,
} from '../../extract/figma/visual-parity/render.js';
import { PARITY_SUBJECTS } from '../../extract/figma/visual-parity/subjects.js';

const ROOT = path.resolve(import.meta.dirname, '../..');
const PROOFS = path.join(ROOT, 'specs/011-fix-molecule-convergence/proofs/visual/cases');
const CAMPAIGN = JSON.parse(readFileSync(path.join(ROOT, 'specs/011-fix-molecule-convergence/contracts/visual-campaign.json'), 'utf8')) as any;
const TARGETS = new Set([
  'nav-item-chevron-false-actif-false',
  'nav-item-chevron-true-actif-false',
  'nav-item-chevron-false-actif-true',
  'nav-item-chevron-true-actif-true',
  'tab-etat-defaut',
  'tab-etat-selectionne',
]);

const alignedRect = (aligned: Aligned, rect: Rect): Rect => ({
  x: rect.x - aligned.aTrimOrigin.x + aligned.aOffset.x,
  y: rect.y - aligned.aTrimOrigin.y + aligned.aOffset.y,
  width: rect.width,
  height: rect.height,
});

const visible = (aligned: Aligned, rect: Rect): Rect => {
  const x = Math.max(0, rect.x);
  const y = Math.max(0, rect.y);
  const right = Math.min(aligned.width, rect.x + rect.width);
  const bottom = Math.min(aligned.height, rect.y + rect.height);
  if (right <= x || bottom <= y) throw new Error(`required region is outside the comparison canvas: ${JSON.stringify(rect)}`);
  return { x, y, width: right - x, height: bottom - y };
};

const actualSemantic = (assertion: any, probe: any): unknown => {
  if (!probe || probe.selectorError || probe.matches.length !== 1) return undefined;
  const node = probe.matches[0];
  if (assertion.assertion === 'element') return node.tagName;
  if (assertion.assertion === 'attribute') {
    return Object.fromEntries(Object.keys(assertion.expected).sort().map((name) => [
      name,
      name === 'tabIndex' ? String(node.tabIndex) : (node.attributes[name] ?? null),
    ]));
  }
  if (assertion.assertion === 'keyboard-context') {
    const selected = node.tabStops.filter((tab: any) => tab.ariaSelected === 'true').length;
    const focusable = node.tabStops.filter((tab: any) => tab.tabIndex === 0).length;
    return { id: node.attributes.id ?? null, rovingFocus: node.tabStops.length > 0 && selected === 1 && focusable === 1 };
  }
  return undefined;
};

const cases = CAMPAIGN.subjects.flatMap((subject: any) =>
  subject.cases.filter((campaignCase: any) => TARGETS.has(campaignCase.id)).map((campaignCase: any) => ({ subject, campaignCase })),
);
if (cases.length !== TARGETS.size) throw new Error(`target campaign cases are incomplete: found ${cases.map((entry: any) => entry.campaignCase.id).join(', ')}`);

const browser = await launchBrowser();
const failures: string[] = [];
try {
  const page = await browser.newPage(
    campaignCapturePageOptions({ width: 1600, height: 1200 }),
  );
  for (const { subject, campaignCase } of cases) {
    const paritySubject = PARITY_SUBJECTS.find((candidate) => candidate.id === subject.id);
    if (!paritySubject) throw new Error(`no parity subject for ${subject.id}`);
    const pkg = composeSubject(paritySubject);
    const plan = planVariant(pkg.contract, campaignCase.figmaVariant ?? '');
    if (!plan.ok) throw new Error(`${campaignCase.id}: variant planning refused: ${plan.reason}`);
    const prior = JSON.parse(readFileSync(path.join(PROOFS, campaignCase.id, 'metadata.json'), 'utf8')) as any;
    const contextRootWidth = campaignCase.layoutContext?.rootWidth === 'figma-root'
      ? prior.geometry.rootFigma.width / 2
      : undefined;
    const rendered = await renderCampaignVariant(
      page, pkg, plan.subst, plan.bools, plan.interaction, [],
      { codeProps: campaignCase.codeProps, fixtureAssetIds: campaignCase.fixtureAssetIds, assetManifest: { assets: [] }, semanticAssertions: campaignCase.semanticAssertions, comparisonSurface: campaignCase.comparisonSurface },
      contextRootWidth,
    );
    if (!rendered.ok) throw new Error(`${campaignCase.id}: render refused: ${rendered.error}`);

    const figma = readPng(path.join(PROOFS, campaignCase.id, 'figma.png'));
    const generated = readPng(rendered.png);
    const surface = campaignCase.comparisonSurface ?? 'light';
    const aligned = alignPair(generated, figma, rendered.rootRect, surface);
    const diff = diffPair(aligned, rendered.textRects);
    const regions: DeclaredRegion[] = (campaignCase.requiredRegions ?? []).map((region: any) => {
      if (region.source === 'root') return { ...region, rect: { x: 0, y: 0, width: aligned.width, height: aligned.height } };
      const part = rendered.parts[region.partName];
      if (!part) throw new Error(`${campaignCase.id}: missing required part ${region.partName}`);
      return { ...region, rect: visible(aligned, alignedRect(aligned, part)) };
    });
    const pixels = createPixelReceipt({
      diff,
      regions: scoreDeclaredRegions(aligned, regions),
      requiredRegionIds: regions.map((region) => region.id),
      thresholdPct: 2.5,
    });
    const figmaRoot = { x: rendered.rootRect.x, y: rendered.rootRect.y, width: prior.geometry.rootFigma.width, height: prior.geometry.rootFigma.height };
    const figmaParts = Object.fromEntries(Object.entries(prior.geometry.parts)
      .filter(([name]) => name !== 'root')
      .map(([name, part]: [string, any]) => [name, {
        x: figmaRoot.x + part.figma.x * figmaRoot.width,
        y: figmaRoot.y + part.figma.y * figmaRoot.height,
        width: part.figma.width * figmaRoot.width,
        height: part.figma.height * figmaRoot.height,
      }]));
    const geometry = createGeometryReceipt({
      rootFigma: figmaRoot,
      rootGenerated: rendered.rootRect,
      figmaParts,
      generatedParts: rendered.parts,
      requiredParts: campaignCase.requiredParts,
      contract: pkg.contract,
      contractJustification: campaignCase.geometryJustification?.contractPointer ?? null,
      reportExplanation: campaignCase.geometryJustification?.reportExplanation ?? null,
    });
    const semantics = campaignCase.semanticAssertions.map((assertion: any) =>
      createSemanticReceipt(assertion, actualSemantic(assertion, rendered.semantics?.find((probe) => probe.id === assertion.id)), pkg.contract),
    );
    const visibility = createProbativeEvidenceReceipt(
      createVisibilityReceipt({ side: 'figma', image: figma, surface }),
      createVisibilityReceipt({ side: 'generated', image: generated, surface }),
    );
    const gate = evaluateAuthoritativeGate({ pixels, visibility, geometry, requiredSemanticAssertionIds: campaignCase.semanticAssertions.map((assertion: any) => assertion.id), semantics });
    console.log(`${campaignCase.id} ok: raw ${pixels.rawPct.toFixed(3)}%; regions ${Object.values(pixels.regions).map((region) => `${region.id}=${region.diffPct.toFixed(3)}%(r${region.referenceSignalPixels}/g${region.generatedSignalPixels})`).join(', ')}; align ${aligned.aContent.width}×${aligned.aContent.height}/${aligned.bContent.width}×${aligned.bContent.height} at a${aligned.aOffset.y},b${Math.floor((aligned.height - aligned.bContent.height) / 2)}; geometry ${geometry.verdict}; semantics pass`);
    if (!gate.passed) failures.push(`${campaignCase.id}: ${JSON.stringify({ pixels, geometry, semantics, gate })}`);
  }
} finally {
  await browser.close();
}
if (failures.length > 0) throw new Error(`targeted receipts failed:\n${failures.join('\n')}`);
