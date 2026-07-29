#!/usr/bin/env node
/**
 * Project the four image-bearing 011 families from the immutable census.
 *
 * This deliberately creates one campaign case per real occurrence. It does
 * not emit aliases: the current runner validates declared alias strings but
 * does not recalculate equality fingerprints from both Figma occurrences.
 *
 * Only Carte, MemberCard, ProductCard, Realisation, their obsolete asset
 * blockers, and the fixture-evidence summary are replaced. Field, Nav and Tab
 * are retained byte-for-value from the campaign parsed immediately before the
 * atomic write. A concurrent campaign edit causes a refusal.
 */
import { createHash, randomUUID } from "node:crypto";
import {
  existsSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../..");
const CAMPAIGN_PATH = path.join(
  ROOT,
  "specs/011-fix-molecule-convergence/contracts/visual-campaign.json",
);
const CENSUS_PATH = path.join(
  ROOT,
  "specs/011-fix-molecule-convergence/proofs/visual/source-census.json",
);
const MANIFEST_PATH = path.join(
  ROOT,
  "extract/figma/visual-parity/fixture-assets/manifest.json",
);
const TARGETS = ["carte", "member-card", "product-card", "realisation"];
const OBSOLETE_BLOCKERS = new Set([
  "carte-census-image-content-inventory-unmaterialized",
  "member-card-census-portrait-content-inventory-unmaterialized",
  "product-card-census-image-inventory-unmaterialized",
  "realisation-census-image-inventory-unmaterialized",
  "carte-categorie-nested-cta-occurrence-properties-unbindable",
  "member-card-shared-base-image-unbindable",
]);

function fail(message) {
  throw new Error(`reconcile-census-campaign-011: ${message}`);
}

function readJsonSource(file, label) {
  const raw = readFileSync(file, "utf8");
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value))
      fail(`${label} must be a JSON object`);
    return { raw, value };
  } catch (error) {
    if (error instanceof SyntaxError)
      fail(`${label} is invalid JSON (${error.message})`);
    throw error;
  }
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stable(value[key])]),
    );
  }
  return value;
}

function stableJson(value) {
  return `${JSON.stringify(stable(value), null, 2)}\n`;
}

function shortHash(value) {
  return hash(JSON.stringify(value)).slice(0, 16);
}

function normalizedProperties(instance) {
  return Object.fromEntries(
    Object.entries(instance.componentProperties ?? {})
      .map(([key, property]) => [key.split("#", 1)[0], property?.value ?? null])
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

function text(instance, name) {
  const matches = (instance.texts ?? []).filter(
    (entry) => entry.visible !== false && entry.name === name,
  );
  if (matches.length !== 1 || typeof matches[0].characters !== "string")
    fail(`${instance.nodeId} must contain one visible ${name} text`);
  return matches[0];
}

function richTextSegments(textFact) {
  const characters = textFact.characters;
  const runs = Array.isArray(textFact.styleRuns) ? textFact.styleRuns : [];
  if (
    typeof characters !== "string" ||
    runs.length === 0 ||
    runs.map((run) => run?.text ?? "").join("") !== characters
  ) {
    return [{ text: characters }];
  }
  const segments = runs.map((run) => ({
    text: run.text,
    ...(Number(run?.style?.fontWeight) >= 700 ? { strong: true } : {}),
  }));
  return segments.reduce((merged, segment) => {
    const previous = merged.at(-1);
    if (previous && Boolean(previous.strong) === Boolean(segment.strong)) {
      previous.text += segment.text;
    } else {
      merged.push(segment);
    }
    return merged;
  }, []);
}

const CARTE_VISUAL_STRONG_PREFIX = new Map([
  ["I2115:4364;2115:4244", "Un problème persistant ?"],
  ["I2115:4411;2115:4177", "Thermo65, l'entrée de gamme en acier."],
  ["I2115:4411;2115:4178", "ThermoSafe, la référence en aluminium."],
  ["I2115:4324;2115:4204", "SupraMatic & ProMatic."],
  ["I2115:4324;2115:4205", "RotaMatic (Battant) & LineaMatic (Coulissant)."],
  ["I2115:4297;2115:4177", "Une fiabilité exceptionnelle et une grande longévité."],
  ["I2115:4438;2115:4177", "La référence confort."],
  ["I2115:4438;2115:4178", "Le classique intemporel."],
]);

function carteRichTextSegments(instance, textFact) {
  const prefix = CARTE_VISUAL_STRONG_PREFIX.get(instance.nodeId);
  if (!prefix) return richTextSegments(textFact);
  if (!textFact.characters.startsWith(prefix))
    fail(`${instance.nodeId} no longer starts with its pinned strong text`);
  return [
    { text: prefix, strong: true },
    ...(textFact.characters.length > prefix.length
      ? [{ text: textFact.characters.slice(prefix.length) }]
      : []),
  ];
}

function nestedInstance(instance, name) {
  const matches = (instance.nestedInstances ?? []).filter(
    (entry) => entry.visible !== false && entry.name === name,
  );
  if (matches.length !== 1)
    fail(`${instance.nodeId} must contain one visible nested ${name} instance`);
  return matches[0];
}

function image(instance, name = null) {
  const matches = (instance.imageRefs ?? []).filter(
    (entry) =>
      entry.nodeVisible !== false &&
      entry.paintVisible !== false &&
      (name === null || entry.name === name),
  );
  if (matches.length !== 1 || typeof matches[0].imageRef !== "string")
    fail(
      `${instance.nodeId} must contain one visible IMAGE${name ? ` named ${name}` : ""}`,
    );
  return matches[0];
}

function target(census, id) {
  const matches = (census.census?.targets ?? []).filter(
    (entry) => entry.subjectId === id,
  );
  if (matches.length !== 1 || !Array.isArray(matches[0].instances))
    fail(`source census must contain one ${id} target`);
  return matches[0];
}

function assetIndex(manifest) {
  const byKey = new Map();
  for (const asset of manifest.assets ?? []) {
    const key = `${asset.subject}\0${asset.imageRef}`;
    if (byKey.has(key)) fail(`duplicate manifest subject/image ref ${key}`);
    byKey.set(key, asset);
  }
  return byKey;
}

function assetFor(assets, subject, imageRef) {
  const asset = assets.get(`${subject}\0${imageRef}`);
  if (!asset) fail(`manifest has no ${subject} receipt for ${imageRef}`);
  const file = path.join(path.dirname(MANIFEST_PATH), asset.file);
  if (!existsSync(file)) fail(`fixture asset ${asset.id} is not materialized`);
  const bytes = readFileSync(file);
  if (
    bytes.length !== asset.bytes ||
    hash(bytes) !== String(asset.sha256).toLowerCase()
  )
    fail(`fixture asset ${asset.id} bytes do not match its receipt`);
  return asset;
}

function wholeRegion() {
  return {
    id: "whole",
    source: "root",
    kind: "whole",
    metric: "raw-pixel",
    maxDiffPct: 2.5,
    minSignalPixels: 1,
  };
}

function imageRegion(partName, id = "image") {
  return {
    id,
    source: "part",
    partName,
    kind: "image",
    metric: "raw-pixel",
    maxDiffPct: 2.5,
    minSignalPixels: 1,
  };
}

function textRegion(partName, id = "text") {
  return {
    id,
    source: "part",
    partName,
    kind: "text",
    metric: "signal-preserving-text",
    maxDiffPct: 2.5,
    minSignalPixels: 1,
  };
}

function occurrenceFact(subject, nodeId) {
  return `${subject}.occurrence.${hash(nodeId).slice(0, 16)}`;
}

function replaceSubject(current, cases) {
  return {
    ...current,
    coverage: {
      ...current.coverage,
      deriveFromFigmaProperties: true,
      deriveFromContract: true,
      requiredFactIds: [
        ...new Set(cases.flatMap((campaignCase) => campaignCase.factIds)),
      ].sort(),
    },
    requiredCaseIds: cases.map((campaignCase) => campaignCase.id),
    cases,
  };
}

function carteCases(censusTarget, assets, current) {
  const geometryJustification = current.cases?.find(
    (campaignCase) => campaignCase.figmaVariant === "Disposition=Categorie",
  )?.geometryJustification;
  return censusTarget.instances.map((instance, index) => {
    const properties = normalizedProperties(instance);
    const disposition = properties.Disposition;
    if (disposition !== "Reassurance" && disposition !== "Categorie")
      fail(`${instance.nodeId} has unsupported Carte disposition`);
    const title = text(instance, "Titre");
    const body = text(instance, "Texte");
    const bodySegments = carteRichTextSegments(instance, body);
    const picture = image(instance);
    const asset = assetFor(assets, "carte", picture.imageRef);
    const category = disposition === "Categorie";
    const imagePart = category ? "categorieImage" : "reassuranceImage";
    const cta = category ? text(instance, "Libellé").characters : null;
    const ctaLeftGlyph = category ? nestedInstance(instance, "Pdf") : null;
    const ctaRightGlyph = category
      ? ["ArrowRight", "Download"]
          .map((name) =>
            (instance.nestedInstances ?? []).find(
              (entry) => entry.visible !== false && entry.name === name,
            ),
          )
          .filter(Boolean)
      : [];
    if (category && ctaRightGlyph.length !== 1)
      fail(`${instance.nodeId} must contain one ArrowRight or Download CTA glyph`);
    const factIds = [
      `carte.disposition.${category ? "categorie" : "reassurance"}`,
      `carte.image.${picture.imageRef}`,
      `carte.content.${shortHash([title.characters, bodySegments, cta])}`,
      occurrenceFact("carte", instance.nodeId),
    ];
    return {
      id: `carte-occurrence-${String(index + 1).padStart(2, "0")}-${category ? "categorie" : "reassurance"}-${picture.imageRef.slice(0, 8)}`,
      figmaNodeId: instance.nodeId,
      figmaVariant: `Disposition=${disposition}`,
      observedProperties: properties,
      observedPropertyDefinitions: properties,
      observedTexts: {
        Titre: title.characters,
        Texte: body.characters,
        ...(category ? { "Bouton/Libellé": cta } : {}),
      },
      figmaPartNodeIds: {
        [imagePart]: picture.nodeId,
        text: `${instance.nodeId};${category ? "2063:1613" : "2063:1608"}`,
        ...(category ? { Bouton: `${instance.nodeId};2063:1616` } : {}),
      },
      codeProps: {
        disposition: category ? "categorie" : "reassurance",
        titre: title.characters,
        texte: bodySegments,
        ...(category
          ? {
              ctaLabel: cta,
              ctaIconLeftGlyph: ctaLeftGlyph.name.toLowerCase(),
              ctaIconRightGlyph:
                ctaRightGlyph[0].name === "ArrowRight"
                  ? "arrow-right"
                  : "download",
            }
          : {}),
        imageUrl: { $asset: asset.id },
        imageAlt: title.characters,
      },
      codePresetProvenance:
        "Disposition, Titre, Texte, nested CTA label/glyph instances and IMAGE ref are immutable source-census facts. Mixed strong ranges omitted by the REST instance style table are retained only where the pinned Figma PNG visibly proves them.",
      layoutContext: {
        rootWidth: "figma-root",
        rootHeight: "figma-root",
      },
      factIds,
      fixtureAssetIds: [asset.id],
      comparisonSurface: "light",
      requiredRegions: [
        wholeRegion(),
        imageRegion(imagePart),
        textRegion("text"),
        ...(category
          ? [
              {
                id: "cta",
                source: "part",
                partName: "Bouton",
                kind: "text",
                metric: "signal-preserving-text",
                maxDiffPct: 2.5,
                minSignalPixels: 1,
              },
            ]
          : []),
      ],
      requiredParts: [
        "root",
        imagePart,
        "text",
        ...(category ? ["Bouton"] : []),
      ],
      semanticAssertions: [],
      ...(category && geometryJustification ? { geometryJustification } : {}),
      aliases: [],
      // Nested CTA values are now projected through the contract's code-only
      // CTA label/glyph props from the pinned read-only occurrence census.
      // Category cases are therefore as source-pinned as Reassurance cases.
      status: "source-pinned",
    };
  });
}

function memberCases(censusTarget, assets) {
  return censusTarget.instances.map((instance, index) => {
    const properties = normalizedProperties(instance);
    const name = text(instance, "Nom");
    const role = text(instance, "Poste");
    const base = image(instance, "fun-ia");
    const portrait = image(instance, "normal");
    const baseAsset = assetFor(assets, "member-card", base.imageRef);
    const portraitAsset = assetFor(assets, "member-card", portrait.imageRef);
    const factIds = [
      `member-card.image.base.${base.imageRef}`,
      `member-card.image.portrait.${portrait.imageRef}`,
      `member-card.content.${shortHash([name.characters, role.characters])}`,
      occurrenceFact("member-card", instance.nodeId),
    ];
    return {
      id: `member-card-occurrence-${String(index + 1).padStart(2, "0")}-${portrait.imageRef.slice(0, 8)}`,
      figmaNodeId: instance.nodeId,
      figmaVariant: "MemberCard",
      observedProperties: properties,
      observedPropertyDefinitions: properties,
      observedImageLayers: {
        base: {
          assetId: baseAsset.id,
          imageRef: base.imageRef,
          paintNodeId: base.nodeId,
        },
        portrait: {
          assetId: portraitAsset.id,
          imageRef: portrait.imageRef,
          paintNodeId: portrait.nodeId,
        },
      },
      figmaPartNodeIds: {
        MemberPicture: `${instance.nodeId};2074:2073`,
        text: `${instance.nodeId};2074:2076`,
      },
      codeProps: {
        nom: name.characters,
        poste: role.characters,
        imageUrl: { $asset: portraitAsset.id },
        imageAlt: name.characters,
      },
      codePresetProvenance:
        "Nom, Poste, the shared fun-ia IMAGE ref and the occurrence portrait IMAGE ref are immutable source-census facts. MemberCard can bind only the normal portrait; the shared base receipt remains inventoried but cannot enter codeProps.",
      factIds,
      fixtureAssetIds: [portraitAsset.id],
      comparisonSurface: "light",
      requiredRegions: [
        wholeRegion(),
        imageRegion("MemberPicture", "portrait"),
        textRegion("text"),
      ],
      requiredParts: ["root", "MemberPicture", "text"],
      semanticAssertions: [],
      geometryJustification: {
        contractPointer: "/anatomy/root/geometryJustification",
        reportExplanation:
          "MemberCard text remains HUG content; only bounded Montserrat subpixel advance differences are admissible.",
      },
      aliases: [],
      status: "rendering-unproved",
      blockedReason: "coverage-incomplete",
    };
  });
}

function productCases(censusTarget, assets) {
  return censusTarget.instances.map((instance, index) => {
    const properties = normalizedProperties(instance);
    // The CTA was removed at the source on 2026-07-29: none of the twelve
    // immutable occurrences ever enabled it, so master and contract both
    // dropped it (contract major 2.0.0). Its reappearance would mean the
    // Figma master regained a property the contract no longer models.
    if ("Bouton" in properties)
      fail(`${instance.nodeId} unexpectedly declares a ProductCard Bouton property`);
    const title = text(instance, "Titre");
    const price = text(instance, "Prix");
    const picture = image(instance);
    const asset = assetFor(assets, "product-card", picture.imageRef);
    const factIds = [
      `product-card.image.${picture.imageRef}`,
      `product-card.content.${shortHash([title.characters, price.characters])}`,
      occurrenceFact("product-card", instance.nodeId),
    ];
    return {
      id: `product-card-occurrence-${String(index + 1).padStart(2, "0")}-${picture.imageRef.slice(0, 8)}`,
      figmaNodeId: instance.nodeId,
      figmaVariant: "ProductCard",
      observedProperties: properties,
      observedPropertyDefinitions: properties,
      figmaPartNodeIds: {
        Image: picture.nodeId,
        Titre: title.nodeId,
        Prix: price.nodeId,
      },
      codeProps: {
        titre: title.characters,
        prix: price.characters,
        imageUrl: { $asset: asset.id },
        imageAlt: title.characters,
      },
      codePresetProvenance:
        "Titre, Prix and IMAGE ref are immutable source-census facts. The CTA the master carried but no occurrence enabled was removed at the source on 2026-07-29, so no bouton fact remains to project. Duplicate page placements remain distinct cases because no alias fingerprint is merely asserted.",
      factIds,
      fixtureAssetIds: [asset.id],
      comparisonSurface: "light",
      requiredRegions: [
        wholeRegion(),
        imageRegion("Image"),
        {
          id: "title-price",
          source: "explicit-normalized-rect",
          rect: { x: 0, y: 0.82, width: 1, height: 0.18 },
          kind: "text",
          metric: "signal-preserving-text",
          maxDiffPct: 2.5,
          minSignalPixels: 1,
        },
      ],
      requiredParts: ["root", "Image", "Titre", "Prix"],
      semanticAssertions: [],
      aliases: [],
      status: "source-pinned",
    };
  });
}

function realisationCases(censusTarget, assets) {
  const perSize = { Grand: 0, Petit: 0 };
  return censusTarget.instances.map((instance) => {
    const properties = normalizedProperties(instance);
    const size = properties.Taille;
    if (size !== "Grand" && size !== "Petit")
      fail(`${instance.nodeId} has unsupported Realisation Taille`);
    perSize[size] += 1;
    const picture = image(instance);
    const asset = assetFor(assets, "realisation", picture.imageRef);
    const codeSize = size.toLowerCase();
    const factIds = [
      `realisation.taille.${codeSize}`,
      `realisation.image.${picture.imageRef}`,
      occurrenceFact("realisation", instance.nodeId),
    ];
    return {
      id: `realisation-${codeSize}-${String(perSize[size]).padStart(2, "0")}-${picture.imageRef.slice(0, 8)}`,
      figmaNodeId: instance.nodeId,
      figmaVariant: `Taille=${size}`,
      observedProperties: properties,
      observedPropertyDefinitions: properties,
      figmaPartNodeIds: { Image: instance.nodeId },
      codeProps: {
        taille: codeSize,
        imageUrl: { $asset: asset.id },
        imageAlt: "",
      },
      codePresetProvenance:
        "Taille and the root IMAGE ref are immutable source-census facts; Figma exposes no alt component property, so the comparison-only alt remains empty.",
      factIds,
      fixtureAssetIds: [asset.id],
      comparisonSurface: "light",
      requiredRegions: [wholeRegion(), imageRegion("Image")],
      requiredParts: ["root", "Image"],
      semanticAssertions: [],
      aliases: [],
      status: "source-pinned",
    };
  });
}

function namedBlockers(carte, member, manifest, carteCases, memberCases) {
  const baseRefs = [
    ...new Set(
      member.instances.map((instance) => image(instance, "fun-ia").imageRef),
    ),
  ];
  return [
    {
      id: "member-card-shared-base-image-unbindable",
      subjectId: "member-card",
      verdict: "blocked",
      reason: "coverage-incomplete",
      exitCode: 2,
      requiredCoverage:
        "The shared fun-ia IMAGE plane and the 16 occurrence-specific normal portraits retained by the census.",
      knownPinnedCoverage: memberCases.map((campaignCase) => campaignCase.id),
      evidence: {
        receipt:
          "specs/011-fix-molecule-convergence/proofs/visual/source-census.json",
        instanceCount: member.instances.length,
        imagePaintCount: member.instances.reduce(
          (sum, instance) => sum + instance.imageRefs.length,
          0,
        ),
        baseImageRefs: baseRefs,
        materializedReceiptIds: (manifest.assets ?? [])
          .filter(
            (asset) =>
              asset.subject === "member-card" &&
              baseRefs.includes(asset.imageRef),
          )
          .map((asset) => asset.id),
        finding:
          "All portrait bytes are bindable through MemberCard.imageUrl. The composed MemberPicture funIa plane has no source prop, so its materialized shared IMAGE receipt cannot be injected into the generated comparison.",
      },
      resolution:
        "Add a contract-bound, fixture-proven scalar for the MemberPicture base plane before claiming exact two-paint comparison coverage.",
    },
  ];
}

function main() {
  const campaignSource = readJsonSource(CAMPAIGN_PATH, "visual campaign");
  const census = readJsonSource(CENSUS_PATH, "source census").value;
  const manifest = readJsonSource(MANIFEST_PATH, "fixture manifest").value;
  const campaign = campaignSource.value;
  if (
    campaign.reference?.readOnly !== true ||
    census.campaign?.fileKey !== campaign.reference?.fileKey ||
    census.campaign?.fileVersion !== campaign.reference?.fileVersion
  )
    fail("campaign and source census must share one read-only Figma pin");
  if (census.campaign?.sha256 !== hash(stableJson(campaign)))
    fail(
      "source census is stale for the current campaign; refresh it through census-011.mjs first",
    );

  const assets = assetIndex(manifest);
  const currentById = new Map(
    campaign.subjects.map((subject) => [subject.id, subject]),
  );
  const censusById = Object.fromEntries(
    TARGETS.map((id) => [id, target(census, id)]),
  );
  const replacements = new Map();
  replacements.set(
    "carte",
    replaceSubject(
      currentById.get("carte"),
      carteCases(censusById.carte, assets, currentById.get("carte")),
    ),
  );
  replacements.set(
    "member-card",
    replaceSubject(
      currentById.get("member-card"),
      memberCases(censusById["member-card"], assets),
    ),
  );
  replacements.set(
    "product-card",
    replaceSubject(
      currentById.get("product-card"),
      productCases(censusById["product-card"], assets),
    ),
  );
  replacements.set(
    "realisation",
    replaceSubject(
      currentById.get("realisation"),
      realisationCases(censusById.realisation, assets),
    ),
  );

  const fixtureCounts = Object.fromEntries(
    TARGETS.map((id) => [
      id,
      new Set(
        (manifest.assets ?? [])
          .filter((asset) => asset.subject === id)
          .map((asset) => asset.imageRef),
      ).size,
    ]),
  );
  const next = {
    ...campaign,
    sourceEvidence: {
      ...campaign.sourceEvidence,
      fixtureAssetEvidence: {
        method: "GET",
        endpoints: [
          "/v1/files/:fileKey/images",
          "HTTPS CDN URL returned by the image index",
        ],
        tool: "extract/figma/visual-parity/fixture-assets/pin-census-011.mjs",
        readOnly: true,
        writeOperations: [],
        occurrenceCaseCounts: {
          carte: censusById.carte.instances.length,
          "member-card": censusById["member-card"].instances.length,
          "product-card": censusById["product-card"].instances.length,
          realisation: censusById.realisation.instances.length,
        },
        distinctImageRefCounts: fixtureCounts,
      },
    },
    blockedConditions: [
      ...(campaign.blockedConditions ?? []).filter(
        (condition) => !OBSOLETE_BLOCKERS.has(condition.id),
      ),
      ...namedBlockers(
        censusById.carte,
        censusById["member-card"],
        manifest,
        replacements.get("carte").cases,
        replacements.get("member-card").cases,
      ),
    ],
    subjects: campaign.subjects.map(
      (subject) => replacements.get(subject.id) ?? subject,
    ),
  };

  if (readFileSync(CAMPAIGN_PATH, "utf8") !== campaignSource.raw)
    fail("visual campaign changed concurrently; refusing to overwrite it");
  const temporary = path.join(
    path.dirname(CAMPAIGN_PATH),
    `.visual-campaign.json.${process.pid}.${randomUUID()}.tmp`,
  );
  try {
    writeFileSync(temporary, `${JSON.stringify(next, null, 2)}\n`, {
      flag: "wx",
      mode: 0o644,
    });
    renameSync(temporary, CAMPAIGN_PATH);
  } catch (error) {
    if (existsSync(temporary)) unlinkSync(temporary);
    throw error;
  }
  console.log(
    `reconcile-census-campaign-011: projected ${TARGETS.map((id) => `${id}=${replacements.get(id).cases.length}`).join(", ")} with zero aliases`,
  );
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 2;
}
