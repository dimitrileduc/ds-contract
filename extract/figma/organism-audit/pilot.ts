/**
 * The per-organism audit pilot (013).
 *
 * Walks one organism end to end and emits its dossier:
 *
 *   pinned Figma fact → contract id/version/JSON Pointer → generated React fact
 *   → probative evidence → derived verdict
 *
 * Two rules shape every choice here.  The proved surface is the React the
 * repository actually ships (D4) — never `core/emit-html`, which would only
 * prove the emitter agrees with itself.  And a screenshot cannot see a prop
 * that is exposed but never projected, so every property fact is driven by a
 * NON-DEFAULT probe through the same built harness (D6): the component renders
 * its hard-coded literal and looks perfect until you ask it for something else.
 *
 * The measurement engine is 011's, reused unchanged — `alignPair`, `diffPair`,
 * `scoreDeclaredRegions`, `writeTriptych`.  013 supplies its own thresholds and
 * never widens the comparator's.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { PNG } from 'pngjs';

import {
  alignPair,
  diffPair,
  readPng,
  rootInReferenceRenderBounds,
  scoreDeclaredRegions,
  writeTriptych,
  type DeclaredRegion,
} from '../visual-parity/img.js';
import { resolveComparisonOnlyProps, type Rect } from '../visual-parity/render.js';
import { fetchNodePngs, fetchSetInfos } from '../visual-parity/figma-api.js';

import { buildHarness, renderHarnessCase, type HarnessRenderResult } from './harness.js';
import { checkReferenceProvenance, resolveCaseReference, type ReferenceProvenance } from './reference.js';
import { resolveGeneratedComponent } from './render-react.js';
import {
  assertContractPinFresh,
  buildTokenResolver,
  compareFigmaExpectation,
  computeCoverageDelta,
  evaluatePropProjection,
  resolveContractPointer,
} from './facts.js';
import {
  aggregateOrganismVerdict,
  deriveFactOutcome,
  evaluatePixelRule,
  evaluateProbative,
  type FactOutcome,
  type LocalizedSource,
} from './verdict.js';
import {
  renderOrganismReportMd,
  type ArtifactReceipt,
  type AuditedFactResult,
  type CaseAuditResult,
  type FactLegResult,
  type OrganismAuditResult,
} from './report.js';

const sha256 = (bytes: Buffer | string): string => createHash('sha256').update(bytes).digest('hex');

interface FactDeclaration {
  id: string;
  kind: string;
  required: boolean;
  representability: 'carry-both' | 'carry-with-named-limit' | 'carry-code-only';
  figmaReference: Record<string, unknown>;
  contractReference: { jsonPointer: string; [key: string]: unknown };
  generatedReference: { componentFile: string; export: string; selector: string };
  projectionProbe?: { kind: string; prop: string; value: unknown };
  /**
   * A value the PINNED Figma source carries at this fact's site.
   *
   * Declaring it turns "the contract pointer does not resolve" from an absence
   * into an established, localized divergence: Figma states the fact, the
   * contract is silent, so the defect is IN THE CONTRACT.  Without this the
   * same observation could only be reported as `not-proven`, which reads as
   * "we failed to look" rather than "we looked and it is missing".
   */
  figmaExpectation?: { channel: string; value: unknown };
}

interface SubjectDeclaration {
  id: string;
  displayName: string;
  wave: 1 | 2 | 3;
  contractId: string;
  contractVersion: string;
  contractPath: string;
  figmaSetNodeId: string;
  auditRefs: string[];
  knownLimits: Array<{ id: string; statement: string; expectedVerdictImpact: string }>;
  coverage: { requiredFactIds: string[] };
  facts: FactDeclaration[];
  cases: Array<{
    id: string;
    figmaNodeId: string;
    observedProperties: Record<string, unknown>;
    reactProps: Record<string, unknown>;
    /** Comparison-only fixture images this case binds through `{$asset:id}`.
     *  Declared AND bound, both ways — 011's resolver refuses a declared asset
     *  no prop uses and a `$asset` no declaration covers. */
    fixtureAssetIds?: string[];
    factIds: string[];
    requiredParts: string[];
    requiredRegions: Array<{
      id: string;
      source: string;
      kind: string;
      metric: 'raw-pixel' | 'signal-preserving-text';
      maxDiffPct: number;
      minSignalPixels: number;
    }>;
    semanticAssertions: Array<{
      id: string;
      selector: string;
      contractPointer: string;
      expect: { tag?: string; textEquals?: string };
    }>;
  }>;
}

const leg = (
  reference: string | null,
  observedValue: unknown,
  sourceHash: string | null,
  available: boolean,
  notes: string[] = [],
): FactLegResult => ({ reference, observedValue, sourceHash, available, notes });

/** Match a harness element by a `[class*="Foo__bar"]` selector, without a DOM. */
function selectElements(
  elements: HarnessRenderResult['elements'],
  selector: string,
): HarnessRenderResult['elements'] {
  const match = /\[class\*="([^"]+)"\]/.exec(selector);
  if (match === null) return [];
  return elements.filter((element) => element.classes.some((c) => c.includes(match[1])));
}

export interface AuditOrganismInput {
  repoRoot: string;
  outRoot: string;
  scratchDir: string;
  campaign: {
    reference: { fileKey: string; fileVersion: string; deviceScaleFactor?: number };
    acceptance: { maxRawDiffPct: number; maxRegionDiffPct: number };
    generatedSurface: { sourceRoot: string };
  };
  subject: SubjectDeclaration;
  refresh: boolean;
}

export async function auditOrganism(input: AuditOrganismInput): Promise<{
  result: OrganismAuditResult;
  markdown: string;
  writtenPaths: string[];
}> {
  const { repoRoot, outRoot, scratchDir, campaign, subject } = input;
  const writtenPaths: string[] = [];

  const contractBytes = readFileSync(path.join(repoRoot, subject.contractPath));
  const contract = JSON.parse(contractBytes.toString('utf8')) as Record<string, unknown>;
  const contractSha = sha256(contractBytes);

  // The dossier is signed with the MANIFEST's version while every pointer below
  // resolves against THIS parsed file.  Let the two drift and the receipt names
  // a version it never read — a silent mislabel, not an absence.  The CLI
  // refuses it in `verifyAgainstDisk`; the capture tools come straight here, so
  // the same refusal has to stand at the point the bytes are read.
  const pin = assertContractPinFresh({ subject, contract });
  if (!pin.ok) throw new Error(`${subject.id}: ${pin.reasons.join('; ')}`);

  // ---- the DTCG source, so `{font.size.24}` can be read as 24px ----------
  // A contract that BINDS a token was counted divergent from a Figma
  // expectation of "24px" as long as the comparison was a raw string equality
  // — the instrument penalised the governed path.  The trees are read here (the
  // pilot owns the filesystem) and handed to the pure resolver as data.
  const tokensDir = path.join(repoRoot, 'tokens');
  const tokenTrees = [
    path.join(tokensDir, 'primitives.tokens.json'),
    path.join(tokensDir, 'semantic.tokens.json'),
    // Modes participate too: a mode file can redefine a semantic alias, and a
    // resolver that ignored them would resolve to a value nothing renders.
    ...(existsSync(path.join(tokensDir, 'modes'))
      ? readdirSync(path.join(tokensDir, 'modes'))
          .filter((file) => file.endsWith('.tokens.json'))
          .sort()
          .map((file) => path.join(tokensDir, 'modes', file))
      : []),
  ]
    .filter((file) => existsSync(file))
    .map((file) => JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>);
  const resolveToken = buildTokenResolver(tokenTrees);

  // ---- the generated React surface (D4) --------------------------------
  const resolved = resolveGeneratedComponent({
    contractId: subject.contractId,
    sourceRoot: path.join(repoRoot, campaign.generatedSurface.sourceRoot),
  });
  if (!resolved.ok) throw new Error(`${subject.id}: ${resolved.reasons.join('; ')}`);
  const componentRef = resolved.ref;

  // ---- the pinned Figma reference (GET only) ---------------------------
  const cacheDir = path.join(repoRoot, 'extract/figma/visual-parity/out/_cache');

  // The FILE VERSION check reads the SET — a property of the file, not of
  // the measurement (data-model.md §3, DW-006): every subject in the
  // manifest already pins a set, and the version a nodes-API call returns is
  // file-wide, whichever node was requested.
  const setInfos = await fetchSetInfos(
    cacheDir,
    campaign.reference.fileKey,
    [subject.figmaSetNodeId],
    input.refresh,
  );
  const setInfo = setInfos.get(subject.figmaSetNodeId)!;
  if (setInfo.version !== campaign.reference.fileVersion) {
    throw new Error(
      `${subject.id}: Figma file version moved (${campaign.reference.fileVersion} → ${setInfo.version}) — re-pin the manifest before capturing`,
    );
  }

  const caseDecl = subject.cases[0];
  // DW-006 (FR-001/FR-002): every derivation below cites the CASE node,
  // never the set that contains it — `resolveCaseReference` is the single
  // place that decides it, so nothing downstream can quietly fall back to
  // the set. For the eight organisms whose set and case already coincide
  // (research §0.2) this changes nothing; `reassurances` is the one where it
  // does (set `2114:3721`, case `2114:3619`).
  const caseReference = resolveCaseReference(subject, caseDecl);
  const caseNodeId = caseReference.caseNodeId;
  // An explicit, checkable receipt of an invariant that would otherwise be
  // implicit in "read the same variable five times": FR-002's verification
  // reads exactly this shape, re-asserted here so a future edit reverting
  // one derivation back to the set trips immediately, not only in the eval
  // fixture (`organism-audit-case-reference-check.ts`).
  const referenceProvenance: ReferenceProvenance = {
    caseNodeId,
    setNodeId: caseReference.setNodeId,
    derivations: {
      capture: caseNodeId,
      nodeValues: caseNodeId,
      imposedWidth: caseNodeId,
      alignmentFrame: caseNodeId,
      receiptCitation: caseNodeId,
    },
  };
  const provenanceCheck = checkReferenceProvenance(referenceProvenance);
  if (!provenanceCheck.ok)
    throw new Error(`${subject.id}: ${provenanceCheck.reasons.map((r) => r.message).join('; ')}`);

  const caseInfos = await fetchSetInfos(cacheDir, campaign.reference.fileKey, [caseNodeId], input.refresh);
  const caseInfo = caseInfos.get(caseNodeId)!;
  // The pin check above reads the SET while the dossier publishes the CASE's
  // version — sound only because a nodes-API version is file-wide, whichever
  // node was asked for. That was an assumption; here it is a check. Otherwise
  // the value VERIFIED and the value PUBLISHED would come from two different
  // reads, and nothing would say so.
  //
  // It cannot fire today, and that is a reading rather than a hope:
  // `reassurances` is the ONLY subject whose case and set ids differ (all
  // eight others resolve both to the same node, so the two reads are the same
  // read), and its two cached dumps — 2114:3619 and 2114:3721 — both carry
  // 2381581871281042338.
  if (caseInfo.version !== setInfo.version) {
    throw new Error(
      `${subject.id}: the case node's file version (${caseInfo.version}) differs from the set's (${setInfo.version}) — the version checked against the manifest and the version published in the dossier cannot come from two different reads`,
    );
  }
  const rawNode = JSON.parse(
    readFileSync(
      path.join(cacheDir, `nodes-${campaign.reference.fileKey}-${caseNodeId.replace(/:/g, '_')}.json`),
      'utf8',
    ),
  ) as { document: Record<string, any> };
  const document = rawNode.document;

  const pngs = await fetchNodePngs(cacheDir, campaign.reference.fileKey, caseNodeId, caseInfo.version, [caseNodeId]);
  const referencePngPath = pngs.get(caseNodeId);
  if (!referencePngPath) throw new Error(`${subject.id}: Figma declined the PNG export`);
  const referenceBytes = readFileSync(referencePngPath);
  const referencePng = readPng(referenceBytes);
  // Hashed ONCE: the receipt below cites it per fact, and hero's 3.9 MB
  // reference × 37 declared facts is 145 MB of redundant hashing per organism.
  const referenceSha = sha256(referenceBytes);

  // ---- build the harness once, render many times -----------------------
  const built = await buildHarness({
    repoRoot,
    scratchDir: path.join(scratchDir, subject.id),
    componentImportPath: path.dirname(componentRef.componentFile),
    exportName: componentRef.export,
  });

  // ---- comparison fixtures: {$asset:id} → verified data URL ---------------
  // A master paints photos through IMAGE fills that expose no component
  // property, so the pixels can never be a contract default (D10) — the case
  // supplies them as comparison-only fixtures. Resolution is 011's
  // `resolveComparisonOnlyProps`, reused rather than re-derived: it deep-walks
  // arrays (the four `ds.carte` images of `reassurances` ride inside `items`,
  // where a top-level-only scan renders `src="[object Object]"`), checks the
  // bytes against the manifest SHA before admitting them, and yields data URLs
  // the inlined harness document can actually fetch — a `file://` URL cannot.
  //
  // It runs HERE, inside `auditOrganism`, so every entry point gets it. As a
  // helper each runner had to remember to call, one that forgot measured a
  // render with no photos and reported a fabricated regression (devis: 0.14 %
  // → 72 % on the omission alone).
  const fixtures = resolveComparisonOnlyProps({
    codeProps: caseDecl.reactProps,
    fixtureAssetIds: caseDecl.fixtureAssetIds ?? [],
    assetManifest: JSON.parse(
      readFileSync(
        path.join(repoRoot, 'extract/figma/visual-parity/fixture-assets/manifest.json'),
        'utf8',
      ),
    ),
  });
  if (!fixtures.ok) throw new Error(`${subject.id}: ${fixtures.error}`);
  const caseProps = fixtures.value.props;

  // The comparison context is reconstructed from the PINNED Figma root box, so
  // both sides are laid out at the same width.  Without it an organism with no
  // intrinsic width fills the viewport and the resulting delta measures the
  // harness rather than the component (Presentation: 1504 CSS px against a
  // 1287 px master, an 11 % score that says nothing about fidelity).
  const rootWidthCss: number | undefined =
    typeof document.absoluteBoundingBox?.width === 'number'
      ? document.absoluteBoundingBox.width
      : undefined;
  const defaults = await renderHarnessCase({
    indexHtml: built.indexHtml,
    props: caseProps,
    rootWidthCss,
  });

  // ---- align + diff, on 011's engine, at 013's thresholds ---------------
  const referenceRoot = rootInReferenceRenderBounds(
    document.absoluteBoundingBox,
    document.absoluteRenderBounds ?? document.absoluteBoundingBox,
    referencePng,
  );
  const generatedPng = readPng(defaults.png);
  const aligned = alignPair(generatedPng, referencePng, defaults.rootRect, 'light', referenceRoot ?? undefined);

  // The text mask is DIAGNOSTIC ONLY — its score never enters the pixel rule.
  const textRects: Rect[] = defaults.elements
    .filter((element) => element.text.length > 0 && element.rect.width > 0)
    .map((element) => element.rect);
  const diff = diffPair(aligned, textRects);

  const regions: DeclaredRegion[] = caseDecl.requiredRegions.map((region) => ({
    id: region.id,
    // A `whole` region is the entire aligned canvas; anything narrower must be
    // declared with an explicit rect BEFORE the diff, never inferred from it.
    rect: { x: 0, y: 0, width: aligned.width, height: aligned.height },
    metric: region.metric,
    maxDiffPct: region.maxDiffPct,
    minSignalPixels: region.minSignalPixels,
  }));
  const regionScores = scoreDeclaredRegions(aligned, regions);

  const pixelRule = evaluatePixelRule({
    rawPct: diff.unmaskedPct,
    thresholdPct: campaign.acceptance.maxRawDiffPct,
    regions: Object.values(regionScores).map((score) => ({
      id: score.id,
      score: score.diffPct,
      maxDiffPct: score.maxDiffPct,
      signalPixels: Math.min(score.referenceSignalPixels, score.generatedSignalPixels),
    })),
    maskedDiagnosticPct: diff.maskedPct ?? undefined,
  });

  const wholeScore = Object.values(regionScores)[0];
  const probative = evaluateProbative({
    figmaSignalPixels: wholeScore?.referenceSignalPixels ?? 0,
    generatedSignalPixels: wholeScore?.generatedSignalPixels ?? 0,
    contrastOk: (wholeScore?.referenceSignalPixels ?? 0) > 0 && (wholeScore?.generatedSignalPixels ?? 0) > 0,
    equivalentInputs: true,
    imagesDecoded: true,
    emptyRegions: Object.values(regionScores)
      .filter((s) => s.referenceSignalPixels === 0 || s.generatedSignalPixels === 0)
      .map((s) => s.id),
    usedEmitHtmlFallback: false,
  });

  // ---- non-default prop probes (D6) ------------------------------------
  const domProbes: CaseAuditResult['domProbes'] = [];
  const probeOutcomes = new Map<string, { outcome: FactOutcome; localizedSource: LocalizedSource | null; reasons: string[]; observed: string | null }>();

  for (const fact of subject.facts) {
    const probe = fact.projectionProbe;
    if (probe === undefined) continue;
    const rendered = await renderHarnessCase({
      indexHtml: built.indexHtml,
      props: { ...caseProps, [probe.prop]: probe.value },
      rootWidthCss,
    });
    const matched = selectElements(rendered.elements, fact.generatedReference.selector);

    if (typeof probe.value === 'boolean') {
      // A boolean probe materialises (or fails to materialise) a subtree.
      const appeared = matched.length > 0;
      probeOutcomes.set(fact.id, {
        outcome: appeared ? 'proved' : 'divergent',
        localizedSource: appeared ? null : 'generated',
        reasons: appeared ? [] : ['boolean-prop-did-not-materialise-its-subtree'],
        observed: appeared ? `${matched.length} element(s)` : null,
      });
      domProbes.push({
        factId: fact.id,
        prop: probe.prop,
        probeValue: probe.value,
        observedDomValue: appeared ? `${matched.length} element(s)` : null,
        projected: appeared,
      });
      continue;
    }

    const observed = matched.length > 0 ? matched[0].text : null;
    // A rich-text probe injects SEGMENTS; the DOM renders their concatenation.
    // String([...]) would stringify to "[object Object]" and fabricate a
    // not-projected verdict out of the instrument itself.
    const expectedText = Array.isArray(probe.value)
      ? probe.value.map((segment) => String((segment as { text?: unknown })?.text ?? '')).join('')
      : String(probe.value);
    const projection = evaluatePropProjection({
      probeValue: expectedText,
      observedDomValue: observed,
      interfaceExposesProp: true,
    });
    probeOutcomes.set(fact.id, { ...projection, observed });
    domProbes.push({
      factId: fact.id,
      prop: probe.prop,
      probeValue: probe.value,
      observedDomValue: observed,
      projected: projection.outcome === 'proved',
    });
  }

  // ---- semantic assertions ---------------------------------------------
  const semantics: CaseAuditResult['semantics'] = caseDecl.semanticAssertions.map((assertion) => {
    const matched = selectElements(defaults.elements, assertion.selector);
    const element = matched[0];
    const pointer = resolveContractPointer(contract, assertion.contractPointer);
    const tagOk = assertion.expect.tag === undefined || element?.tag === assertion.expect.tag;
    const textOk =
      assertion.expect.textEquals === undefined || element?.text === assertion.expect.textEquals;
    return {
      id: assertion.id,
      selector: assertion.selector,
      contractPointer: assertion.contractPointer,
      expected: assertion.expect,
      observed: element === undefined ? null : { tag: element.tag, text: element.text },
      verdict: element !== undefined && tagOk && textOk && pointer.ok ? 'pass' : 'fail',
    };
  });

  // ---- derive every fact -----------------------------------------------
  const facts: AuditedFactResult[] = subject.facts.map((declaration) => {
    const pointer = resolveContractPointer(contract, declaration.contractReference.jsonPointer);
    const matched = selectElements(defaults.elements, declaration.generatedReference.selector);
    const probeResult = probeOutcomes.get(declaration.id);

    const figmaLeg = leg(
      JSON.stringify(declaration.figmaReference),
      declaration.figmaReference,
      referenceSha,
      true,
    );
    const contractLeg = leg(
      `${subject.contractId}@${subject.contractVersion}#${declaration.contractReference.jsonPointer}`,
      pointer.ok ? pointer.value : null,
      contractSha,
      pointer.ok,
      pointer.ok ? [] : [pointer.reason],
    );
    const generatedLeg = leg(
      `${declaration.generatedReference.componentFile}#${declaration.generatedReference.selector}`,
      matched[0]?.text ?? null,
      componentRef.bundleSha256,
      matched.length > 0,
      matched.length === 0 ? ['selector-matched-no-element'] : [],
    );

    // A probe result IS the fact's outcome: it is the only observation that can
    // tell a projected prop from a hard-coded literal.
    if (probeResult !== undefined) {
      return {
        id: declaration.id,
        subjectId: subject.id,
        caseId: caseDecl.id,
        kind: declaration.kind,
        required: declaration.required,
        representability: declaration.representability,
        figma: figmaLeg,
        contract: contractLeg,
        generated: leg(
          generatedLeg.reference,
          probeResult.observed,
          componentRef.bundleSha256,
          probeResult.observed !== null,
          [],
        ),
        evidenceIds: [caseDecl.id],
        outcome: probeResult.outcome,
        localizedSource: probeResult.localizedSource,
        reasons: probeResult.reasons,
        deferredWorkId: null,
      };
    }

    // Figma states the fact; does the contract carry it?  A pinned expectation
    // with an unresolvable contract pointer is a divergence localized to the
    // contract — not a hole in the evidence.
    if (declaration.figmaExpectation !== undefined) {
      const carried = pointer.ok && pointer.value !== undefined && pointer.value !== null;
      // Inside a `tokens` map the two legs are compared on RESOLVED values, so
      // a governed binding is not penalised for being governed.  Fail-closed:
      // a reference that resolves to nothing is a divergence naming the token,
      // never a pass and never a silent fall-back to the raw text.
      const comparison = compareFigmaExpectation({
        channel: declaration.figmaExpectation.channel,
        jsonPointer: declaration.contractReference.jsonPointer,
        carried,
        contractValue: pointer.ok ? pointer.value : undefined,
        expectedValue: declaration.figmaExpectation.value,
        resolve: resolveToken,
      });
      const agrees = comparison.agrees;
      return {
        id: declaration.id,
        subjectId: subject.id,
        caseId: caseDecl.id,
        kind: declaration.kind,
        required: declaration.required,
        representability: declaration.representability,
        figma: leg(
          `${caseNodeId}#${declaration.figmaExpectation.channel}`,
          declaration.figmaExpectation.value,
          referenceSha,
          true,
        ),
        // A pass obtained THROUGH a token carries its receipt: the dossier says
        // which reference resolved to which literal, so nobody has to trust
        // that "{font.size.24}" and "24px" were the same thing.
        contract: { ...contractLeg, notes: [...contractLeg.notes, ...comparison.notes] },
        generated: generatedLeg,
        evidenceIds: [caseDecl.id],
        outcome: agrees ? 'proved' : 'divergent',
        localizedSource: agrees ? null : 'contract',
        reasons: comparison.reasons,
        deferredWorkId: null,
      };
    }

    // A visual fact rides the case's pixel evidence.
    if (declaration.kind === 'visual') {
      const outcome: FactOutcome = !probative.probative
        ? 'not-proven'
        : pixelRule.pixelPass
          ? 'proved'
          : 'divergent';
      return {
        id: declaration.id,
        subjectId: subject.id,
        caseId: caseDecl.id,
        kind: declaration.kind,
        required: declaration.required,
        representability: declaration.representability,
        figma: figmaLeg,
        contract: contractLeg,
        generated: generatedLeg,
        evidenceIds: [caseDecl.id],
        outcome,
        localizedSource: outcome === 'divergent' ? 'comparison' : null,
        reasons:
          outcome === 'proved'
            ? []
            : [...probative.reasons, ...pixelRule.reasons],
        deferredWorkId: null,
      };
    }

    const derived = deriveFactOutcome({
      legs: { figma: figmaLeg.available, contract: contractLeg.available, generated: generatedLeg.available },
      agreement: generatedLeg.available && contractLeg.available ? 'agree' : 'unknown',
      evidenceProbative: probative.probative,
      representability: declaration.representability,
      localizedSource: null,
      deferredWorkId: null,
    });
    return {
      id: declaration.id,
      subjectId: subject.id,
      caseId: caseDecl.id,
      kind: declaration.kind,
      required: declaration.required,
      representability: declaration.representability,
      figma: figmaLeg,
      contract: contractLeg,
      generated: generatedLeg,
      evidenceIds: [caseDecl.id],
      outcome: derived.outcome,
      localizedSource: null,
      reasons: derived.reasons,
      deferredWorkId: null,
    };
  });

  // ---- write the five artefacts per case --------------------------------
  const caseDir = path.join(outRoot, 'organisms', subject.id, 'cases', caseDecl.id);
  mkdirSync(caseDir, { recursive: true });

  const receipt = (id: string, kind: ArtifactReceipt['kind'], file: string, png?: PNG): ArtifactReceipt => {
    const bytes = readFileSync(file);
    return {
      id,
      kind,
      path: path.relative(repoRoot, file),
      sha256: sha256(bytes),
      mediaType: file.endsWith('.png') ? 'image/png' : 'application/json',
      width: png?.width ?? null,
      height: png?.height ?? null,
      bytes: bytes.length,
    };
  };

  const figmaOut = path.join(caseDir, 'figma.png');
  writeFileSync(figmaOut, PNG.sync.write(aligned.b));
  const generatedOut = path.join(caseDir, 'generated.png');
  writeFileSync(generatedOut, PNG.sync.write(aligned.a));
  const diffOut = path.join(caseDir, 'diff.png');
  writeFileSync(diffOut, PNG.sync.write(diff.diff));
  const triptychOut = path.join(caseDir, 'triptych.png');
  writeTriptych(triptychOut, aligned, diff.diff);

  const caseVerdict: 'pass' | 'fail' | 'blocked' =
    pixelRule.pixelPass && probative.probative ? 'pass' : 'fail';

  const caseResult: CaseAuditResult = {
    id: caseDecl.id,
    subjectId: subject.id,
    verdict: caseVerdict,
    probative: probative.probative,
    reasons: [...probative.reasons, ...pixelRule.reasons],
    figma: {
      nodeId: caseReference.caseNodeId,
      setNodeId: caseReference.setNodeId,
      fileVersion: caseInfo.version,
      observedProperties: caseDecl.observedProperties,
      pngSha256: referenceSha,
      width: referencePng.width,
      height: referencePng.height,
    },
    referenceProvenance,
    contract: {
      id: subject.contractId,
      version: subject.contractVersion,
      factIds: caseDecl.factIds,
      reactProps: caseProps,
    },
    generated: {
      componentFile: componentRef.componentFile,
      export: componentRef.export,
      bundleSha256: componentRef.bundleSha256,
      harnessConfigSha256: built.configSha256,
      fontsLoaded: defaults.fontsLoaded,
    },
    visibility: {
      figma: {
        signalPixels: wholeScore?.referenceSignalPixels ?? 0,
        width: referencePng.width,
        height: referencePng.height,
      },
      generated: {
        signalPixels: wholeScore?.generatedSignalPixels ?? 0,
        width: generatedPng.width,
        height: generatedPng.height,
      },
      contrastOk: probative.probative,
    },
    geometry: {
      figmaRoot: { width: referencePng.width, height: referencePng.height },
      generatedRoot: {
        width: Math.round(defaults.rootRect.width),
        height: Math.round(defaults.rootRect.height),
      },
      deltaPx: {
        width: Math.round(defaults.rootRect.width) - referencePng.width,
        height: Math.round(defaults.rootRect.height) - referencePng.height,
      },
      verdict:
        Math.abs(Math.round(defaults.rootRect.width) - referencePng.width) <= 2 &&
        Math.abs(Math.round(defaults.rootRect.height) - referencePng.height) <= 2
          ? 'pass'
          : 'fail',
    },
    pixels: {
      rawPct: diff.unmaskedPct,
      maskedDiagnosticPct: diff.maskedPct,
      thresholdPct: campaign.acceptance.maxRawDiffPct,
      regions: Object.values(regionScores).map((score) => ({
        id: score.id,
        score: score.diffPct,
        maxDiffPct: score.maxDiffPct,
        signalPixels: Math.min(score.referenceSignalPixels, score.generatedSignalPixels),
      })),
      verdict: pixelRule.pixelPass ? 'pass' : 'fail',
    },
    semantics,
    domProbes,
    artifacts: [],
    browserRevision: defaults.browserRevision,
  };

  const metadataOut = path.join(caseDir, 'metadata.json');
  writeFileSync(metadataOut, `${JSON.stringify(caseResult, null, 2)}\n`);

  caseResult.artifacts = [
    receipt(`${caseDecl.id}.figma`, 'figma', figmaOut, aligned.b),
    receipt(`${caseDecl.id}.generated`, 'generated', generatedOut, aligned.a),
    receipt(`${caseDecl.id}.diff`, 'diff', diffOut, diff.diff),
    receipt(`${caseDecl.id}.triptych`, 'triptych', triptychOut),
    receipt(`${caseDecl.id}.metadata`, 'metadata', metadataOut),
  ];
  writtenPaths.push(...caseResult.artifacts.map((a) => a.path));

  // ---- aggregate --------------------------------------------------------
  const coverage = computeCoverageDelta(
    subject.coverage.requiredFactIds,
    facts.map((fact) => fact.id),
  );
  const aggregate = aggregateOrganismVerdict({
    dependencyOpen: null,
    factOutcomes: facts.filter((fact) => fact.required).map((fact) => fact.outcome),
    caseVerdicts: [caseResult.verdict],
    caseProbative: [caseResult.probative],
    coverageExact: coverage.missing.length === 0 && coverage.unexpected.length === 0,
  });

  const result: OrganismAuditResult = {
    id: subject.id,
    displayName: subject.displayName,
    wave: subject.wave,
    contract: { id: subject.contractId, version: subject.contractVersion, path: subject.contractPath },
    figmaSetNodeId: subject.figmaSetNodeId,
    coverage,
    dependency: null,
    facts,
    cases: [caseResult],
    artifacts: caseResult.artifacts,
    verdict: aggregate.verdict,
    reasons: aggregate.reasons,
  };

  const markdown = renderOrganismReportMd(result, {
    reference: { fileKey: campaign.reference.fileKey, fileVersion: setInfo.version },
    auditRefs: subject.auditRefs,
    knownLimits: subject.knownLimits,
    deferredWork: [],
    remediation: null,
  });

  const organismDir = path.join(outRoot, 'organisms', subject.id);
  const resultOut = path.join(organismDir, 'result.json');
  writeFileSync(resultOut, `${JSON.stringify(result, null, 2)}\n`);
  const reportOut = path.join(organismDir, 'REPORT.md');
  writeFileSync(reportOut, markdown);
  writtenPaths.push(path.relative(repoRoot, resultOut), path.relative(repoRoot, reportOut));

  return { result, markdown, writtenPaths };
}
