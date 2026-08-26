import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { PNG } from 'pngjs';

import { validateRepairCampaign } from '../../../extract/figma/projection-repair/campaign.js';
import { validateArtifacts } from '../../../specs/027-responsive-hero-video/tools/validate-artifacts.mjs';
import { validateDecision } from '../../../specs/027-responsive-hero-video/tools/validate-decision.js';
import { validateProofLedger } from '../../../specs/027-responsive-hero-video/tools/validate-proof-ledger.mjs';

const ROOT = process.cwd();
const DIGEST = {
  a: 'a'.repeat(64), b: 'b'.repeat(64), c: 'c'.repeat(64), d: 'd'.repeat(64),
  e: 'e'.repeat(64), f: 'f'.repeat(64), zero: '0'.repeat(64), one: '1'.repeat(64),
};
const clone = <T>(value: T): T => structuredClone(value);
const expectValid = (result: { valid: boolean; errors: unknown[] }, label: string): void => {
  if (!result.valid) throw new Error(`${label} was refused: ${JSON.stringify(result.errors)}`);
};
const expectInvalid = (result: { valid: boolean; errors: unknown[] }, label: string): void => {
  if (result.valid) throw new Error(`${label} was incorrectly accepted`);
};
const expectInvalidWith = (result: { valid: boolean; errors: unknown[] }, label: string, requiredMessages: string[]): void => {
  expectInvalid(result, label);
  const rendered = JSON.stringify(result.errors);
  for (const message of requiredMessages) {
    if (!rendered.includes(message)) throw new Error(`${label} did not report ${message}: ${rendered}`);
  }
};

const composition = {
  presentParts: ['Text', 'Bouton'],
  order: ['Text', 'Bouton'],
  axis: 'column',
  align: 'center',
  justify: 'center',
  titleAlign: 'center',
  heightStrategy: 'visible-viewport-min-content',
  textStyleTokenPath: '{typography.titre-hero-video}',
  ctaTreatment: { reuseCurrentButton: true, variant: 'Outline blanc', sizeDecision: 'unchanged', impactRefs: [] },
  mediaTreatment: { posterPolicy: 'preserve-owner-poster', fit: 'cover', cropDecision: 'preserve-current', secondAsset: 'none' },
  shortLandscapeFallback: 'grow-with-content',
  figmaStrategy: 'auto-layout',
};
const option = (optionId: string) => ({
  optionId,
  label: optionId,
  summary: 'Composition responsive gouvernée',
  compositions: { compact: clone(composition), desktop: clone(composition) },
  boundaryProbeRefs: ['991', '992', '993', '1399', '1400', '1401'],
  evidenceRefs: ['mobile-390', 'tablet-834', 'desktop-1200', 'wide-1728'],
  tradeoffs: ['Le mode compact privilégie la lisibilité.'],
  limits: ['Le mode Figma reste une représentation explicite.'],
});
const approvedDecision = {
  schemaVersion: '2.0.0',
  featureId: '027-responsive-hero-video',
  decisionId: 'H2-responsive',
  baselineRef: 'specs/027-responsive-hero-video/decisions/H1-baseline.json',
  status: 'approved',
  profile: { id: 'piqueray-odoo19-992-1400', basis: 'viewport-width', source: 'odoo-bootstrap-19-subset' },
  breakpoints: [
    { id: 'desktop-start', minWidthPx: 992, operator: 'min-width', probeEvidenceRefs: ['991', '992', '993'] },
    { id: 'wide-start', minWidthPx: 1400, operator: 'min-width', probeEvidenceRefs: ['1399', '1400', '1401'] },
  ],
  designWitnesses: [
    { witnessId: 'mobile-390', widthPx: 390, compositionId: 'compact' },
    { witnessId: 'tablet-834', widthPx: 834, compositionId: 'compact' },
    { witnessId: 'desktop-1200', widthPx: 1200, compositionId: 'desktop' },
    { witnessId: 'wide-1728', widthPx: 1728, compositionId: 'wide' },
  ],
  options: [option('option-a'), option('option-b')],
  selectedOptionId: 'option-a',
  approvedCompositions: { compact: clone(composition), desktop: clone(composition) },
  decision: {
    decisionMaker: 'owner',
    decidedAt: '2026-08-25T12:00:00.000Z',
    evidenceRefs: ['specs/027-responsive-hero-video/inventory/H2-option-packet.md'],
    acceptedTradeoffs: ['Le mode compact privilégie la lisibilité.'],
  },
  foundationDependency: {
    status: 'pending',
    requiredTopics: ['responsive-spacing', 'responsive-typography', 'responsive-child-components'],
  },
  authorizes: 'transverse-foundation-handoff',
  rejectedTopics: [],
  deferredTopics: [],
};

// H2 approval is represented by status=approved plus the schema-owned decision
// record. Requiring a second, forbidden `decision.decision` field makes H2 impossible.
expectValid(validateDecision(approvedDecision as never), 'schema-valid approved H2 decision');

const prematureSourceAuthorization = clone(approvedDecision);
prematureSourceAuthorization.authorizes = 'figma-source-adaptation';
expectInvalidWith(
  validateDecision(prematureSourceAuthorization as never),
  'layout-only H2 promoted before transverse foundations',
  ['$.foundationDependency.status', 'required property decisionRef'],
);

const scratch = mkdtempSync(path.join(tmpdir(), 'hero-video-foundation-'));
try {
  const makePng = (name: string, width: number, height: number) => {
    const file = path.join(scratch, `${name}.png`);
    const bytes = PNG.sync.write(new PNG({ width, height }));
    writeFileSync(file, bytes);
    return { file, bytes, sha256: createHash('sha256').update(bytes).digest('hex') };
  };

  const validPng = makePng('valid-mobile', 390, 844);
  const conditions = {
    fixtureId: 'default-poster', contentCase: 'default', mediaCase: 'poster',
    fontFamily: 'Montserrat', locale: 'fr-BE', conditionsDigest: DIGEST.a,
  };
  const strictManifest = {
    freshness: { capturedAfter: '2026-08-25T12:00:00.000Z', maxAgeHours: 24, sourcePin: 'figma-version-1' },
    conditions,
    artifacts: [{
      artifactId: 'mobile-figma', comparisonId: 'mobile-figma-reference', status: 'valid',
      path: validPng.file, sha256: validPng.sha256, byteLength: validPng.bytes.length,
      width: 390, height: 844, capturedAt: '2026-08-25T13:00:00.000Z',
      sourcePin: 'figma-version-1', fixtureId: 'default-poster', conditions,
    }],
    comparisons: [{
      comparisonId: 'mobile-figma-reference', fromSurface: 'figma', toSurface: 'reference-web',
      witnessId: 'mobile-390', fixtureId: 'default-poster', viewportWidth: 390, viewportHeight: 844,
      conditionsDigest: DIGEST.a,
    }],
  };
  expectValid(validateArtifacts(strictManifest as never, { rootDir: ROOT, now: new Date('2026-08-25T16:00:00.000Z') }), 'fresh matched artifact');

  const wrongPng = makePng('wrong-button-crop', 1776, 252);
  const adversarialManifest = {
    artifacts: [{
      artifactId: 'button-crop', comparisonId: 'mobile-figma-reference', status: 'valid',
      path: wrongPng.file, sha256: wrongPng.sha256, byteLength: wrongPng.bytes.length,
      width: 1776, height: 252, capturedAt: '2099-01-01T00:00:00.000Z', fixtureId: 'wrong-fixture',
    }],
    comparisons: [{
      comparisonId: 'mobile-figma-reference', fromSurface: 'figma', toSurface: 'reference-web',
      witnessId: 'mobile-390', fixtureId: 'default-poster', viewportWidth: 390, viewportHeight: 844,
      conditionsDigest: DIGEST.a,
    }],
  };
  expectInvalidWith(
    validateArtifacts(adversarialManifest as never, { rootDir: ROOT, now: new Date('2026-08-25T16:00:00.000Z') }),
    'future, wrong-viewport, wrong-fixture artifact',
    ['$.freshness', '$.conditions', 'comparison viewport width 390', 'cannot be in the future', 'comparison fixture'],
  );

  const boundaryCase = (width: number): string => ({
    991: 'desktop-start-1', 992: 'desktop-start', 993: 'desktop-start+1',
    1399: 'wide-start-1', 1400: 'wide-start', 1401: 'wide-start+1',
  } as Record<number, string>)[width] ?? 'none';
  const compositionAt = (width: number): string => width >= 1400 ? 'wide' : width >= 992 ? 'desktop' : 'compact';
  const heightAt = (width: number): number => width === 390 ? 844 : width === 834 ? 1112 : width === 1728 ? 720 : width === 320 ? 640 : 800;
  const fakeArtifact = (name: string, width: number, height: number, fixtureId: string, conditionsDigest: string) => ({
    artifactId: name, path: `missing/${name}.png`, sha256: DIGEST.zero, byteLength: 123, width, height,
    capturedAt: '2026-08-25T13:00:00.000Z', sourcePin: '2', fixtureId,
    contentCase: 'default', mediaCase: 'poster', fontFamily: 'Montserrat', locale: 'fr-BE', conditionsDigest, status: 'valid',
  });
  const realArtifact = (name: string, width: number, height: number, fixtureId: string, conditionsDigest: string) => {
    const png = makePng(name, width, height);
    return {
      artifactId: name, path: png.file, sha256: png.sha256, byteLength: png.bytes.length, width, height,
      capturedAt: '2026-08-25T13:00:00.000Z', sourcePin: '2', fixtureId,
      contentCase: 'default', mediaCase: 'poster', fontFamily: 'Montserrat', locale: 'fr-BE', conditionsDigest, status: 'valid',
    };
  };

  const buildLedger = (bad: boolean) => {
    const artifact = bad ? fakeArtifact : realArtifact;
    const baseWidths = [320, 390, 834, 991, 992, 993, 1024, 1200, 1399, 1400, 1401, 1440, 1728];
    const probeInputs = bad
      ? [...baseWidths.map((width) => ({ id: `probe-${width}`, width, height: heightAt(width) })), { id: 'duplicate-wide', width: 1728, height: 720 }]
      : [...baseWidths.map((width) => ({ id: `probe-${width}`, width, height: heightAt(width) })), { id: 'short-landscape-844x390', width: 844, height: 390 }];
    const probes = probeInputs.map(({ id, width, height }) => {
      const expected = compositionAt(width);
      return {
        probeId: id, surface: 'reference-web', width, height, rootWidth: width,
        boundaryCase: boundaryCase(width), expectedComposition: bad ? 'compact' : expected,
        activeComposition: bad ? 'wide' : expected, fixtureId: 'default-poster', contentCase: 'default', mediaCase: 'poster', conditionsDigest: DIGEST.a,
        rootBounds: { x: 0, y: 0, width, height }, visibleDescendantBounds: [{ x: 0, y: 0, width: Math.max(1, width - 1), height: Math.max(1, height - 1) }],
        horizontalOverflow: 0, unintendedCrop: false, overlap: false, contentAccessible: true,
        artifacts: [artifact(`probe-${id}`, width, height, 'default-poster', DIGEST.a)], status: 'pass',
      };
    });
    const profiles = [
      ['mobile-390', 390, 844, 'compact'], ['tablet-834', 834, 1112, 'compact'],
      ['desktop-1200', 1200, 800, 'desktop'], ['wide-1728', 1728, 720, 'wide'],
    ] as const;
    const comparisons = profiles.flatMap(([witnessId, width, height, compositionId]) => {
      const fixture = `${witnessId}-fixture`;
      const conditionsDigest = width === 390 ? DIGEST.a : width === 834 ? DIGEST.b : width === 1200 ? DIGEST.c : DIGEST.d;
      return [
        { comparisonId: `${witnessId}-figma-reference`, fromSurface: 'figma', toSurface: 'reference-web', witnessId, compositionId,
          fixtureId: fixture, viewportWidth: width, viewportHeight: height, conditionsDigest, thresholdPercent: 2, rawDeltaPercent: 0,
          excludedRegions: [], artifacts: [artifact(`${witnessId}-figma-reference`, width, height, fixture, conditionsDigest)], status: 'pass' },
        { comparisonId: `${witnessId}-reference-odoo`, fromSurface: 'reference-web', toSurface: 'odoo', witnessId, compositionId,
          fixtureId: bad ? `${fixture}-other` : fixture, viewportWidth: width, viewportHeight: height,
          conditionsDigest: bad ? DIGEST.f : conditionsDigest, thresholdPercent: 2, rawDeltaPercent: 0,
          excludedRegions: [], artifacts: [artifact(`${witnessId}-reference-odoo`, width, height, bad ? `${fixture}-other` : fixture, bad ? DIGEST.f : conditionsDigest)], status: 'pass' },
      ];
    });
    const fact = (factId: string, category: string, surface: string) => ({
      factId, category, surface, address: `node:${factId}`, beforeDigest: DIGEST.a,
      afterDigest: bad ? DIGEST.b : DIGEST.a, noOpDigest: bad ? DIGEST.c : DIGEST.a, status: 'preserved',
    });
    const run = (name: 'first' | 'second') => ({
      run: name,
      decisionDigest: name === 'second' && bad ? DIGEST.b : DIGEST.a,
      contractDigest: name === 'second' && bad ? DIGEST.c : DIGEST.b,
      schemaDigest: name === 'second' && bad ? DIGEST.d : DIGEST.c,
      generatedManifestDigest: name === 'second' && bad ? DIGEST.e : DIGEST.d,
      createdNodeIds: name === 'first' ? ['2151:6000'] : [], changedNodeIds: name === 'first' ? ['2151:5552'] : [],
      duplicateNodeIds: [], pageWrites: [], status: name === 'first' ? 'applied' : 'no-op',
      receiptRef: path.join(scratch, `${name}-receipt.json`),
    });
    return {
      schemaVersion: '2.1.0', featureId: '027-responsive-hero-video',
      sourcePins: {
        gitHead: 'a'.repeat(40), worktreeTree: 'b'.repeat(40), figmaFileKey: 'd9FYAUcqdcNtsuaMgLefvJ',
        figmaVersionBefore: '1', figmaVersionAfter: '2', masterNodeId: '2151:5552',
        historicalComponentKey: 'component-key', componentSetKey: 'set-key', homeInstanceNodeId: '2170:6351',
      },
      decisionRef: 'specs/027-responsive-hero-video/decisions/H2-responsive.json',
      breakpoints: [{ id: 'desktop-start', minWidthPx: 992 }, { id: 'wide-start', minWidthPx: 1400 }],
      designWitnesses: profiles.map(([witnessId, widthPx, , compositionId]) => ({ witnessId, widthPx, compositionId })),
      gates: ['H1', 'H2', 'H3', 'H4'].map((gateId, index) => ({
        gateId, decision: 'accepted', decisionMaker: 'owner', decidedAt: `2026-08-25T1${index}:00:00.000Z`,
        evidenceRefs: [`proof-${gateId}`], acceptedTradeoffs: [], rejectedTopics: [], deferredTopics: [],
        authorizes: ['responsive-options', 'figma-source', 'contract-promotion', 'closure'][index],
      })),
      protectedFacts: [
        fact('master-id', 'identity', 'figma-master'), fact('poster', 'media', 'figma-master'),
        fact('button', 'nested-instance', 'figma-home'), fact('overrides', 'override', 'figma-home'),
      ],
      probes, comparisons,
      wideContinuityCheck: {
        checkId: 'wide-1440-continuity', fromSurface: 'figma', toSurface: 'reference-web', compositionId: 'wide',
        fixtureId: 'wide-fixture', viewportWidth: 1440, viewportHeight: 800, conditionsDigest: DIGEST.e,
        thresholdPercent: 2, rawDeltaPercent: 0, excludedRegions: [], artifacts: [artifact('wide-continuity', 1440, 800, 'wide-fixture', DIGEST.e)], status: 'pass',
      },
      runs: [run('first'), run('second')],
      odooQualification: {
        database: 'qa', disposable: true, authoring: 'pass', saveReopen: 'pass', isolation: 'pass',
        publicResponsive: 'pass', editorResponsive: 'pass', updateOuterHtmlUnchanged: 'pass', status: 'pass', evidenceRefs: ['proof-odoo'],
      },
      capitalizationRef: 'specs/027-responsive-hero-video/proofs/capitalization.md', closureStatus: 'accepted',
    };
  };

  writeFileSync(path.join(scratch, 'first-receipt.json'), '{"status":"applied"}\n');
  writeFileSync(path.join(scratch, 'second-receipt.json'), '{"status":"no-op"}\n');
  const validateLedger = validateProofLedger as unknown as (value: unknown, options?: { rootDir?: string; now?: Date }) => { valid: boolean; errors: unknown[] };
  expectInvalidWith(
    validateLedger(buildLedger(true), { rootDir: ROOT, now: new Date('2026-08-25T16:00:00.000Z') }),
    'semantically false accepted proof ledger',
    ['identical before, after, and no-op digests', 'must expect and activate', 'named short-landscape-844x390',
      'must share fixtureId, conditionsDigest', 'must be identical between first and second runs', 'does not resolve'],
  );
  expectValid(validateLedger(buildLedger(false), { rootDir: ROOT, now: new Date('2026-08-25T16:00:00.000Z') }), 'complete matched proof ledger');

  const campaignPath = path.join(ROOT, 'specs/component-repairs/hero-video/run-002/campaign.json');
  const campaign = JSON.parse(readFileSync(campaignPath, 'utf8'));
  const campaignResult = validateRepairCampaign(campaign);
  if (!campaignResult.ok) throw new Error(`run-002 campaign is not consumable: ${JSON.stringify(campaignResult.issues)}`);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

console.log('✔ HeroVideo foundation validators refuse impossible H2 semantics, stale/mismatched artifacts, false ledgers, and invalid component campaign envelopes');
