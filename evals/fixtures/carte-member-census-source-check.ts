/**
 * Source-only reconciliation guard for the two expanded occurrence families.
 * It proves that campaign props, image bindings, named Figma descendants, and
 * measured layout contexts still describe the pinned GET census exactly.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { decodeImageDimensions } from '../../extract/figma/visual-parity/fixture-assets/fetch.mjs';

const ROOT = path.resolve(import.meta.dirname, '../..');
const CAMPAIGN = JSON.parse(readFileSync(
  path.join(ROOT, 'specs/011-fix-molecule-convergence/contracts/visual-campaign.json'),
  'utf8',
)) as any;
const CENSUS = JSON.parse(readFileSync(
  path.join(ROOT, 'specs/011-fix-molecule-convergence/proofs/visual/source-census.json'),
  'utf8',
)) as any;
const MANIFEST = JSON.parse(readFileSync(
  path.join(ROOT, 'extract/figma/visual-parity/fixture-assets/manifest.json'),
  'utf8',
)) as any;

const failures: string[] = [];
const campaignSubject = (id: string) => CAMPAIGN.subjects.find((entry: any) => entry.id === id);
const censusSubject = (id: string) => CENSUS.census.targets.find((entry: any) => entry.subjectId === id);
const manifestById = new Map(MANIFEST.assets.map((asset: any) => [asset.id, asset]));
const usedAssetIds = new Set<string>();
const text = (instance: any, name: string) =>
  instance.texts.filter((entry: any) => entry.visible !== false && entry.name === name);
const image = (instance: any, name?: string) =>
  instance.imageRefs.filter((entry: any) =>
    entry.nodeVisible !== false &&
    entry.paintVisible !== false &&
    (name === undefined || entry.name === name),
  );
const flatRichText = (value: any) =>
  Array.isArray(value) ? value.map((segment) => segment?.text ?? '').join('') : null;
const STRONG_CARTE_CASES = new Set([
  'carte-occurrence-05-categorie-cae46967',
  'carte-occurrence-06-categorie-cc37fe3b',
  'carte-occurrence-07-categorie-a578caed',
  'carte-occurrence-12-categorie-3c54b9a6',
  'carte-occurrence-13-categorie-86d495b8',
  'carte-occurrence-15-categorie-031815a6',
  'carte-occurrence-21-categorie-f08d845e',
  'carte-occurrence-22-categorie-dc3a406f',
]);
const hash = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
const stable = (value: any): any =>
  Array.isArray(value)
    ? value.map(stable)
    : value && typeof value === 'object'
      ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]))
      : value;

const campaignHash = hash(`${JSON.stringify(stable(CAMPAIGN), null, 2)}\n`);
if (CENSUS.campaign.sha256 !== campaignHash) {
  failures.push('source census is stale for the current visual campaign');
}

const carteCampaign = campaignSubject('carte');
const carteCensus = censusSubject('carte');
if (carteCampaign?.cases?.length !== 36 || carteCensus?.instances?.length !== 36) {
  failures.push(`Carte must retain 36 campaign/census occurrences`);
} else {
  const widths = new Set<number>();
  for (const campaignCase of carteCampaign.cases) {
    const instance = carteCensus.instances.find((entry: any) => entry.nodeId === campaignCase.figmaNodeId);
    if (!instance) {
      failures.push(`${campaignCase.id}: missing pinned census instance`);
      continue;
    }
    const category = campaignCase.codeProps?.disposition === 'categorie';
    const imagePart = category ? 'categorieImage' : 'reassuranceImage';
    const titles = text(instance, 'Titre');
    const bodies = text(instance, 'Texte');
    const pictures = image(instance);
    const nested = instance.nestedInstances ?? [];
    const ctaLabel = category ? text(instance, 'Libellé')[0]?.characters : undefined;
    const leftGlyph = category
      ? nested.find((entry: any) => entry.visible !== false && entry.name === 'Pdf')
      : undefined;
    const rightGlyph = category
      ? nested.filter((entry: any) =>
          entry.visible !== false && (entry.name === 'ArrowRight' || entry.name === 'Download'),
        )
      : [];
    if (titles.length !== 1 || bodies.length !== 1 || pictures.length !== 1) {
      failures.push(`${campaignCase.id}: census title/body/image cardinality is not 1/1/1`);
      continue;
    }
    widths.add(instance.bounds.absoluteBoundingBox.width);
    const assetRef = campaignCase.codeProps?.imageUrl?.$asset;
    usedAssetIds.add(assetRef);
    const asset = manifestById.get(assetRef) as any;
    const declaredStrong = campaignCase.codeProps.texte.some((segment: any) => segment.strong === true);
    if (
      campaignCase.codeProps.titre !== titles[0].characters ||
      flatRichText(campaignCase.codeProps.texte) !== bodies[0].characters ||
      declaredStrong !== STRONG_CARTE_CASES.has(campaignCase.id) ||
      (category && (
        campaignCase.codeProps.ctaLabel !== ctaLabel ||
        campaignCase.codeProps.ctaIconLeftGlyph !== 'pdf' ||
        !leftGlyph ||
        rightGlyph.length !== 1 ||
        campaignCase.codeProps.ctaIconRightGlyph !==
          (rightGlyph[0].name === 'ArrowRight' ? 'arrow-right' : 'download')
      )) ||
      asset?.subject !== 'carte' ||
      asset?.imageRef !== pictures[0].imageRef ||
      campaignCase.fixtureAssetIds?.length !== 1 ||
      campaignCase.fixtureAssetIds[0] !== assetRef ||
      campaignCase.figmaPartNodeIds?.[imagePart] !== pictures[0].nodeId ||
      campaignCase.figmaPartNodeIds?.text !== `${instance.nodeId};${category ? '2063:1613' : '2063:1608'}` ||
      campaignCase.figmaPartNodeIds?.img !== undefined ||
      campaignCase.layoutContext?.rootWidth !== 'figma-root' ||
      campaignCase.layoutContext?.rootHeight !== 'figma-root' ||
      !campaignCase.requiredParts.includes(imagePart) ||
      !campaignCase.requiredRegions.some((region: any) => region.partName === imagePart)
    ) {
      failures.push(`${campaignCase.id}: props/asset/parts/layout diverge from census`);
    }
  }
  const observedWidths = [...widths].sort((left, right) => left - right);
  if (JSON.stringify(observedWidths) !== JSON.stringify([285, 364, 474, 743])) {
    failures.push(`Carte real widths must remain 285/364/474/743, got ${observedWidths.join('/')}`);
  }
}

const memberCampaign = campaignSubject('member-card');
const memberCensus = censusSubject('member-card');
if (memberCampaign?.cases?.length !== 16 || memberCensus?.instances?.length !== 16) {
  failures.push('MemberCard must retain 16 campaign/census occurrences');
} else {
  const hugWidths: number[] = [];
  for (const campaignCase of memberCampaign.cases) {
    const instance = memberCensus.instances.find((entry: any) => entry.nodeId === campaignCase.figmaNodeId);
    if (!instance) {
      failures.push(`${campaignCase.id}: missing pinned census instance`);
      continue;
    }
    const names = text(instance, 'Nom');
    const roles = text(instance, 'Poste');
    const portraits = image(instance, 'normal');
    if (names.length !== 1 || roles.length !== 1 || portraits.length !== 1) {
      failures.push(`${campaignCase.id}: census name/role/portrait cardinality is not 1/1/1`);
      continue;
    }
    hugWidths.push(Math.max(
      names[0].bounds.absoluteBoundingBox.width,
      roles[0].bounds.absoluteBoundingBox.width,
    ));
    const assetRef = campaignCase.codeProps?.imageUrl?.$asset;
    usedAssetIds.add(assetRef);
    const asset = manifestById.get(assetRef) as any;
    if (
      campaignCase.codeProps.nom !== names[0].characters ||
      campaignCase.codeProps.poste !== roles[0].characters ||
      asset?.subject !== 'member-card' ||
      asset?.imageRef !== portraits[0].imageRef ||
      campaignCase.fixtureAssetIds?.length !== 1 ||
      campaignCase.fixtureAssetIds[0] !== assetRef ||
      campaignCase.figmaPartNodeIds?.MemberPicture !== `${instance.nodeId};2074:2073` ||
      campaignCase.figmaPartNodeIds?.text !== `${instance.nodeId};2074:2076` ||
      campaignCase.geometryJustification?.contractPointer !== '/anatomy/root/geometryJustification'
    ) {
      failures.push(`${campaignCase.id}: props/asset/parts diverge from census`);
    }
  }
  if (Math.min(...hugWidths) !== 80 || Math.max(...hugWidths) !== 314) {
    failures.push(`MemberCard HUG widths must span 80..314px, got ${Math.min(...hugWidths)}..${Math.max(...hugWidths)}`);
  }
}

for (const assetId of usedAssetIds) {
  const asset = manifestById.get(assetId) as any;
  if (!asset) {
    failures.push(`missing manifest receipt ${assetId}`);
    continue;
  }
  const bytes = readFileSync(path.join(
    ROOT,
    'extract/figma/visual-parity/fixture-assets',
    asset.file,
  ));
  const dimensions = decodeImageDimensions(bytes, asset.mediaType);
  if (
    bytes.length !== asset.bytes ||
    hash(bytes) !== asset.sha256 ||
    dimensions.width !== asset.width ||
    dimensions.height !== asset.height
  ) {
    failures.push(`${assetId}: local bytes/hash/decoded dimensions diverge from manifest`);
  }
}
for (const assetId of ['carte-image-7bd2daf5061e', 'carte-image-7825ba2d393a']) {
  const asset = manifestById.get(assetId) as any;
  if (asset?.width !== 3024 || asset?.height !== 4032) {
    failures.push(`${assetId}: EXIF-oriented receipt must remain 3024x4032`);
  }
}

if (failures.length > 0) {
  throw new Error(`Carte/MemberCard census source check failed:\n- ${failures.join('\n- ')}`);
}

console.log('✔ Carte 36 and MemberCard 16 retain exact GET content, assets, parts, and real widths');
