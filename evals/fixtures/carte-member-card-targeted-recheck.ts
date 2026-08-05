/**
 * Offline replay of the Carte/MemberCard occurrence shapes that exposed the
 * full-campaign failures. It uses the already pinned Figma PNGs and geometry
 * receipts, so it performs no network request and does not rewrite the
 * canonical 98-case proof directory.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { composeSubject } from '../../extract/figma/visual-parity/compose.js';
import { createGeometryReceipt } from '../../extract/figma/visual-parity/evidence.js';
import {
  alignPair,
  diffPair,
  readPng,
  scoreDeclaredRegions,
  type Aligned,
  type DeclaredRegion,
} from '../../extract/figma/visual-parity/img.js';
import { planVariant } from '../../extract/figma/visual-parity/match.js';
import {
  campaignCapturePageOptions,
  launchBrowser,
  renderVariant,
  renderCampaignVariant,
  resolveComparisonOnlyProps,
  type Rect,
} from '../../extract/figma/visual-parity/render.js';
import { PARITY_SUBJECTS } from '../../extract/figma/visual-parity/subjects.js';

const ROOT = path.resolve(import.meta.dirname, '../..');
const PROOFS = path.join(ROOT, 'specs/011-fix-molecule-convergence/proofs/visual/cases');
const CAMPAIGN = JSON.parse(readFileSync(
  path.join(ROOT, 'specs/011-fix-molecule-convergence/contracts/visual-campaign.json'),
  'utf8',
)) as any;
const ASSET_MANIFEST = JSON.parse(readFileSync(
  path.join(ROOT, 'extract/figma/visual-parity/fixture-assets/manifest.json'),
  'utf8',
));
const SOURCE_CENSUS = JSON.parse(readFileSync(
  path.join(ROOT, 'specs/011-fix-molecule-convergence/proofs/visual/source-census.json'),
  'utf8',
)) as any;
const TARGETS = new Set([
  'carte-occurrence-01-reassurance-d62d8bf3',
  'carte-occurrence-05-categorie-cae46967',
  'carte-occurrence-10-reassurance-531908a9',
  'carte-occurrence-12-categorie-3c54b9a6',
  'carte-occurrence-27-reassurance-d62d8bf3',
  'member-card-occurrence-02-23844d60',
  'member-card-occurrence-03-2b1776d2',
  'member-card-occurrence-09-73c9099f',
  'member-card-occurrence-10-05dd9925',
  'member-card-occurrence-15-7e26bd51',
]);
const ALL_FAMILY_CASES = process.env.CARTE_MEMBER_TARGETS === 'all';
const LEGACY_DPR2 = process.env.CARTE_MEMBER_CAPTURE === 'legacy-dpr2';
const REQUESTED_CASES = process.env.CARTE_MEMBER_TARGETS?.startsWith('ids:')
  ? new Set(process.env.CARTE_MEMBER_TARGETS.slice(4).split(',').filter(Boolean))
  : null;

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
  if (right <= x || bottom <= y) {
    throw new Error(`required region is outside the comparison canvas: ${JSON.stringify(rect)}`);
  }
  return { x, y, width: right - x, height: bottom - y };
};

const cases = CAMPAIGN.subjects.flatMap((subject: any) =>
  subject.cases
    .filter((campaignCase: any) =>
      ALL_FAMILY_CASES
        ? subject.id === 'carte' || subject.id === 'member-card'
        : REQUESTED_CASES
          ? REQUESTED_CASES.has(campaignCase.id)
        : TARGETS.has(campaignCase.id),
    )
    .map((campaignCase: any) => ({ subject, campaignCase })),
);
const expectedCaseCount = ALL_FAMILY_CASES ? 52 : REQUESTED_CASES?.size ?? TARGETS.size;
if (cases.length !== expectedCaseCount) {
  throw new Error(`target campaign cases are incomplete: found ${cases.map((entry: any) => entry.campaignCase.id).join(', ')}`);
}

const { browser } = await launchBrowser();
const failures: string[] = [];
const unscored: Array<{ id: string; reason: string }> = [];
const observations: Array<{
  id: string;
  rawPct: number;
  regions: Array<{ id: string; diffPct: number; failures: string[] }>;
  geometryVerdict: string;
  geometryMismatches: string[];
}> = [];
try {
  const page = await browser.newPage(
    LEGACY_DPR2
      ? { viewport: { width: 1800, height: 1400 }, deviceScaleFactor: 2 }
      : campaignCapturePageOptions({ width: 1800, height: 1400 }),
  );
  page.setDefaultTimeout(60_000);
  page.setDefaultNavigationTimeout(60_000);
  let replayIndex = 0;
  for (const { subject, campaignCase } of cases) {
    replayIndex += 1;
    if (ALL_FAMILY_CASES || REQUESTED_CASES) {
      console.log(`progress=${replayIndex}/${cases.length} id=${campaignCase.id}`);
    }
    const paritySubject = PARITY_SUBJECTS.find((candidate) => candidate.id === subject.id);
    if (!paritySubject) throw new Error(`no parity subject for ${subject.id}`);
    const pkg = composeSubject(paritySubject);
    const plan = planVariant(pkg.contract, campaignCase.figmaVariant ?? '');
    if (!plan.ok) throw new Error(`${campaignCase.id}: variant planning refused: ${plan.reason}`);
    const caseDirectory = path.join(PROOFS, campaignCase.id);
    const prior = JSON.parse(readFileSync(path.join(caseDirectory, 'metadata.json'), 'utf8')) as any;
    const censusInstance = SOURCE_CENSUS.census.targets
      .find((target: any) => target.subjectId === subject.id)
      ?.instances.find((instance: any) => instance.nodeId === campaignCase.figmaNodeId);
    if (!censusInstance) throw new Error(`${campaignCase.id}: missing source-census instance`);
    const priorRootFigma = prior.geometry?.rootFigma;
    const contextRootWidth = campaignCase.layoutContext?.rootWidth === 'figma-root'
      ? priorRootFigma
        ? priorRootFigma.width / 2
        : censusInstance.bounds.absoluteBoundingBox.width
      : undefined;
    const contextRootHeight = campaignCase.layoutContext?.rootHeight === 'figma-root'
      ? priorRootFigma
        ? priorRootFigma.height / 2
        : censusInstance.bounds.absoluteBoundingBox.height
      : undefined;
    const comparison = {
      codeProps: campaignCase.codeProps,
      fixtureAssetIds: campaignCase.fixtureAssetIds,
      assetManifest: ASSET_MANIFEST,
      semanticAssertions: campaignCase.semanticAssertions,
      comparisonSurface: campaignCase.comparisonSurface,
    };
    const rendered = LEGACY_DPR2
      ? (() => {
          const resolved = resolveComparisonOnlyProps(comparison);
          if (!resolved.ok) return Promise.resolve(resolved);
          return renderVariant(
            page,
            pkg,
            plan.subst,
            plan.bools,
            plan.interaction,
            [],
            resolved.value.props,
            contextRootWidth,
            undefined,
            undefined,
            contextRootHeight,
            1,
          );
        })()
      : renderCampaignVariant(
          page,
          pkg,
          plan.subst,
          plan.bools,
          plan.interaction,
          [],
          comparison,
          contextRootWidth,
          undefined,
          contextRootHeight,
        );
    const renderedResult = await rendered;
    if (!renderedResult.ok) throw new Error(`${campaignCase.id}: render refused: ${renderedResult.error}`);
    const figmaPath = path.join(caseDirectory, 'figma.png');
    if (!priorRootFigma || !existsSync(figmaPath)) {
      const expectedWidth = censusInstance.bounds.absoluteBoundingBox.width * 2;
      const expectedHeight = censusInstance.bounds.absoluteBoundingBox.height * 2;
      if (
        Math.abs(renderedResult.rootRect.width - expectedWidth) > 0.01 ||
        Math.abs(renderedResult.rootRect.height - expectedHeight) > 0.01
      ) {
        failures.push(
          `${campaignCase.id}: source-only root ${renderedResult.rootRect.width}x${renderedResult.rootRect.height} ` +
          `does not equal census ${expectedWidth}x${expectedHeight}`,
        );
      }
      unscored.push({ id: campaignCase.id, reason: 'no-pinned-figma-png-from-prior-render-refusal' });
      console.log(
        `${campaignCase.id}: source-only render=pass; ` +
        `root=${renderedResult.rootRect.width}x${renderedResult.rootRect.height}; pixels=unscored(no pinned figma.png)`,
      );
      continue;
    }

    const figma = readPng(figmaPath);
    const generated = readPng(renderedResult.png);
    const aligned = alignPair(
      generated,
      figma,
      renderedResult.rootRect,
      campaignCase.comparisonSurface ?? 'light',
    );
    const diff = diffPair(aligned, renderedResult.textRects);
    const regions: DeclaredRegion[] = campaignCase.requiredRegions.map((region: any) => {
      if (region.source === 'root') {
        return { ...region, rect: { x: 0, y: 0, width: aligned.width, height: aligned.height } };
      }
      const part = renderedResult.parts?.[region.partName];
      if (!part) throw new Error(`${campaignCase.id}: missing required part ${region.partName}`);
      return { ...region, rect: visible(aligned, alignedRect(aligned, part)) };
    });
    const regionScores = scoreDeclaredRegions(aligned, regions);
    const categoryTextMarkup = campaignCase.codeProps?.disposition === 'categorie'
      ? await page.locator('[data-part="TexteCategorie"]').evaluateAll((nodes) => ({
          html: nodes.map((node) => node.outerHTML).join(''),
          children: nodes.map((node) => ({
            tag: node.tagName,
            weight: getComputedStyle(node).fontWeight,
          })),
        }))
      : null;

    const figmaRoot = {
      x: renderedResult.rootRect.x,
      y: renderedResult.rootRect.y,
      width: prior.geometry.rootFigma.width,
      height: prior.geometry.rootFigma.height,
    };
    const figmaParts = Object.fromEntries(
      campaignCase.requiredParts
        .filter((partName: string) => partName !== 'root')
        .map((partName: string) => {
          const priorPartName = partName === 'categorieImage' || partName === 'reassuranceImage'
            ? 'img'
            : partName;
          const part = prior.geometry.parts[priorPartName];
          if (!part) throw new Error(`${campaignCase.id}: prior proof has no ${priorPartName} geometry`);
          return [partName, {
            x: figmaRoot.x + part.figma.x * figmaRoot.width,
            y: figmaRoot.y + part.figma.y * figmaRoot.height,
            width: part.figma.width * figmaRoot.width,
            height: part.figma.height * figmaRoot.height,
          }];
        }),
    );
    const geometry = createGeometryReceipt({
      rootFigma: figmaRoot,
      rootGenerated: renderedResult.rootRect,
      figmaParts,
      generatedParts: renderedResult.parts,
      requiredParts: campaignCase.requiredParts,
      contract: pkg.contract,
      contractJustification: campaignCase.geometryJustification?.contractPointer ?? null,
      reportExplanation: campaignCase.geometryJustification?.reportExplanation ?? null,
    });

    const scored = Object.values(regionScores);
    const canonicalScores = scored.filter((region) => !region.id.endsWith('-diagnostic'));
    const nonCtaFailures = canonicalScores.filter((region) => region.id !== 'cta' && region.failures.length > 0);
    const geometryFailures = geometry.verdict === 'justified'
      ? []
      : geometry.mismatches.filter((name) =>
          subject.id === 'carte' ? name !== 'part:Bouton' : true,
        );
    observations.push({
      id: campaignCase.id,
      rawPct: diff.unmaskedPct,
      regions: canonicalScores.map((region) => ({
        id: region.id,
        diffPct: region.diffPct,
        failures: region.failures,
      })),
      geometryVerdict: geometry.verdict,
      geometryMismatches: geometry.mismatches,
    });
    const line =
      `${campaignCase.id}: raw=${diff.unmaskedPct.toFixed(3)}%; ` +
      `regions=${scored.map((region) => `${region.id}=${region.diffPct.toFixed(3)}%`).join(', ')}; ` +
      `geometry=${geometry.verdict}${geometry.mismatches.length ? `(${geometry.mismatches.join(',')})` : ''}` +
      (geometry.mismatches.length
        ? ` ${JSON.stringify(Object.fromEntries(
            geometry.mismatches
              .filter((name) => name.startsWith('part:'))
              .map((name) => {
                const partName = name.slice('part:'.length);
                return [partName, geometry.parts[partName]];
              }),
          ))}`
        : '') +
      (categoryTextMarkup ? ` textMarkup=${JSON.stringify(categoryTextMarkup)}` : '');
    if (
      !ALL_FAMILY_CASES ||
      canonicalScores.some((region) => region.failures.length > 0) ||
      geometryFailures.length > 0
    ) {
      console.log(line);
    }
    if (nonCtaFailures.length > 0 || geometryFailures.length > 0) {
      failures.push(
        `${campaignCase.id}: ${JSON.stringify({
          nonCtaFailures: nonCtaFailures.map((region) => [region.id, region.diffPct, region.failures]),
          geometryFailures,
        })}`,
      );
    }
  }
} finally {
  await browser.close();
}

const maxGlobal = observations.reduce(
  (max, observation) => observation.rawPct > max.rawPct ? observation : max,
  observations[0],
);
const maxByRegion = Object.values(
  observations.flatMap((observation) =>
    observation.regions.map((region) => ({ ...region, caseId: observation.id })),
  ).reduce<Record<string, { id: string; diffPct: number; failures: string[]; caseId: string }>>(
    (maxima, region) => {
      if (!maxima[region.id] || region.diffPct > maxima[region.id].diffPct) maxima[region.id] = region;
      return maxima;
    },
    {},
  ),
);
const redCases = observations
  .filter((observation) =>
    observation.regions.some((region) => region.failures.length > 0) ||
    (observation.geometryVerdict !== 'pass' && observation.geometryVerdict !== 'justified'),
  )
  .map((observation) => ({
    id: observation.id,
    regions: observation.regions.filter((region) => region.failures.length > 0).map((region) => region.id),
    geometry: observation.geometryVerdict === 'fail' ? observation.geometryMismatches : [],
  }));
console.log(`summary=${JSON.stringify({
  cases: observations.length,
  replayed: observations.length + unscored.length,
  unscored,
  maxGlobal: { id: maxGlobal.id, diffPct: maxGlobal.rawPct },
  maxByRegion: maxByRegion.map((region) => ({
    id: region.id,
    caseId: region.caseId,
    diffPct: region.diffPct,
  })),
  redCases,
})}`);

if (failures.length > 0) {
  throw new Error(`Carte/MemberCard targeted receipts failed:\n${failures.join('\n')}`);
}
