#!/usr/bin/env node
/**
 * Pin every IMAGE ref retained by the immutable 011 source census.
 *
 * The network surface is deliberately narrow: one Figma image-index GET and
 * one HTTPS CDN GET per previously unpinned image ref. Writes are restricted
 * to this fixture directory and its manifest. Figma is never mutated.
 */
import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { decodeImageDimensions } from "./fetch.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../..");
const CAMPAIGN_PATH = path.join(
  ROOT,
  "specs/011-fix-molecule-convergence/contracts/visual-campaign.json",
);
const CENSUS_PATH = path.join(
  ROOT,
  "specs/011-fix-molecule-convergence/proofs/visual/source-census.json",
);
const MANIFEST_PATH = path.join(HERE, "manifest.json");
const SUBJECTS = new Set([
  "carte",
  "member-card",
  "product-card",
  "realisation",
]);

function fail(message) {
  throw new Error(`pin-census-011: ${message}`);
}

function readJson(file, label) {
  try {
    const value = JSON.parse(readFileSync(file, "utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value))
      fail(`${label} must be a JSON object`);
    return value;
  } catch (error) {
    if (error instanceof SyntaxError)
      fail(`${label} is invalid JSON (${error.message})`);
    throw error;
  }
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

function figmaToken() {
  if (process.env.FIGMA_TOKEN) return process.env.FIGMA_TOKEN;
  const candidates = [path.join(ROOT, ".env.local")];
  try {
    const commonDir = execFileSync(
      "git",
      ["rev-parse", "--path-format=absolute", "--git-common-dir"],
      { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    if (commonDir)
      candidates.push(path.join(path.dirname(commonDir), ".env.local"));
  } catch {
    // The worktree-local candidate remains available.
  }
  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    const match = readFileSync(candidate, "utf8").match(
      /^FIGMA_TOKEN\s*=\s*"?([^"\n]+)"?\s*$/m,
    );
    if (match) return match[1].trim();
  }
  fail("FIGMA_TOKEN not found (environment or .env.local)");
}

function mediaType(bytes) {
  if (
    bytes.length >= 8 &&
    bytes
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return "image/png";
  if (
    bytes.length >= 4 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[bytes.length - 2] === 0xff &&
    bytes[bytes.length - 1] === 0xd9
  )
    return "image/jpeg";
  fail("downloaded IMAGE ref is neither PNG nor JPEG");
}

function flatDestination(file) {
  if (
    typeof file !== "string" ||
    path.basename(file) !== file ||
    !/^[a-z0-9][a-z0-9._-]*\.(?:png|jpe?g)$/i.test(file)
  )
    fail(`unsafe fixture filename ${JSON.stringify(file)}`);
  const destination = path.resolve(HERE, file);
  const relative = path.relative(HERE, destination);
  if (
    relative === "" ||
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  )
    fail(`fixture filename escapes ${HERE}`);
  if (existsSync(destination) && lstatSync(destination).isSymbolicLink())
    fail(`refusing to replace symlink ${destination}`);
  return destination;
}

function normalizedProperties(instance) {
  return Object.fromEntries(
    Object.entries(instance.componentProperties ?? {})
      .map(([key, property]) => [key.split("#", 1)[0], property?.value ?? null])
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

function censusRefs(census) {
  if (
    census?.campaign?.fileKey === undefined ||
    !Array.isArray(census?.census?.targets)
  )
    fail("source census has no pinned campaign/targets");
  const refs = [];
  for (const target of census.census.targets) {
    if (!SUBJECTS.has(target.subjectId)) continue;
    for (const instance of target.instances ?? []) {
      for (const image of instance.imageRefs ?? []) {
        if (
          image.nodeVisible === false ||
          image.paintVisible === false ||
          typeof image.imageRef !== "string" ||
          image.imageRef.length === 0
        )
          continue;
        refs.push({
          subject: target.subjectId,
          instanceNodeId: instance.nodeId,
          variantNodeId: instance.component?.nodeId,
          variant:
            instance.component?.name ?? instance.name ?? target.subjectId,
          paintNodeId: image.nodeId,
          paintName: image.name ?? null,
          imageRef: image.imageRef,
          scaleMode: image.scaleMode ?? "FILL",
          observedProperties: normalizedProperties(instance),
        });
      }
    }
  }
  const unique = new Map();
  for (const ref of refs) {
    const key = `${ref.subject}\0${ref.imageRef}`;
    if (!unique.has(key)) unique.set(key, ref);
  }
  return [...unique.values()].sort(
    (left, right) =>
      left.subject.localeCompare(right.subject) ||
      left.imageRef.localeCompare(right.imageRef),
  );
}

function assetStem(ref) {
  const subject = ref.subject.replace(/[^a-z0-9]+/g, "-");
  const role =
    ref.subject === "member-card"
      ? ref.paintName === "normal"
        ? "portrait"
        : "base"
      : ref.subject === "realisation"
        ? String(ref.observedProperties.Taille ?? "image").toLowerCase()
        : "image";
  return `${subject}--${role}--${ref.imageRef.slice(0, 12)}`;
}

async function get(url, options, label) {
  const response = await fetch(url, { ...options, method: "GET" });
  if (!response.ok) fail(`${label} GET failed with HTTP ${response.status}`);
  return response;
}

async function main() {
  const campaign = readJson(CAMPAIGN_PATH, "visual campaign");
  const census = readJson(CENSUS_PATH, "source census");
  const manifest = readJson(MANIFEST_PATH, "fixture manifest");
  if (campaign.reference?.readOnly !== true)
    fail("campaign reference.readOnly must be true");
  if (
    census.campaign?.fileKey !== campaign.reference?.fileKey ||
    census.campaign?.fileVersion !== campaign.reference?.fileVersion
  )
    fail("source census and campaign Figma pins differ");
  if (
    census.campaign?.sha256 !==
    createHash("sha256").update(stableJson(campaign)).digest("hex")
  )
    fail(
      "source census is stale for the current campaign; refresh it through census-011.mjs first",
    );
  if (
    manifest.figma?.fileKey !== campaign.reference.fileKey ||
    manifest.figma?.fileVersion !== campaign.reference.fileVersion
  )
    fail("fixture manifest and campaign Figma pins differ");

  const refs = censusRefs(census);
  const existing = new Map(
    (manifest.assets ?? []).map((asset) => [
      `${asset.subject}\0${asset.imageRef}`,
      asset,
    ]),
  );
  let repairedDimensionCount = 0;
  const existingAssets = (manifest.assets ?? []).map((asset) => {
    if (!SUBJECTS.has(asset.subject) || typeof asset.imageRef !== "string") {
      return asset;
    }
    const destination = flatDestination(asset.file);
    if (!existsSync(destination) || !lstatSync(destination).isFile()) {
      fail(`pinned fixture asset is absent or not a regular file: ${asset.file}`);
    }
    const bytes = readFileSync(destination);
    const type = mediaType(bytes);
    const dimensions = decodeImageDimensions(bytes, type);
    if (
      asset.mediaType === type &&
      asset.width === dimensions.width &&
      asset.height === dimensions.height
    ) {
      return asset;
    }
    repairedDimensionCount += 1;
    return {
      ...asset,
      mediaType: type,
      width: dimensions.width,
      height: dimensions.height,
    };
  });
  const missing = refs.filter(
    (ref) => !existing.has(`${ref.subject}\0${ref.imageRef}`),
  );
  if (missing.length === 0 && repairedDimensionCount === 0) {
    console.log(
      `pin-census-011: all ${refs.length} subject/image refs already pinned`,
    );
    return;
  }

  let index = null;
  if (missing.length > 0) {
    const token = figmaToken();
    const indexResponse = await get(
      `https://api.figma.com/v1/files/${encodeURIComponent(campaign.reference.fileKey)}/images`,
      { headers: { "X-Figma-Token": token } },
      "Figma image-index",
    );
    index = await indexResponse.json();
  }
  const staged = [];
  try {
    for (const ref of missing) {
      const url = index?.meta?.images?.[ref.imageRef];
      if (typeof url !== "string")
        fail(`imageRef ${ref.imageRef} absent from index`);
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") fail("Figma CDN URL must use HTTPS");
      const response = await get(parsed, undefined, `IMAGE ${ref.imageRef}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      const type = mediaType(bytes);
      const dimensions = decodeImageDimensions(bytes, type);
      const extension = type === "image/png" ? "png" : "jpg";
      const stem = assetStem(ref);
      const file = `${stem}.${extension}`;
      const destination = flatDestination(file);
      const temporary = path.join(
        HERE,
        `.${file}.${process.pid}.${randomUUID()}.tmp`,
      );
      writeFileSync(temporary, bytes, { flag: "wx", mode: 0o600 });
      staged.push({
        temporary,
        destination,
        asset: {
          id: stem.replaceAll("--", "-"),
          subject: ref.subject,
          variant: ref.variant,
          setNodeId: campaign.subjects.find(
            (subject) => subject.id === ref.subject,
          )?.figmaSetNodeId,
          variantNodeId: ref.variantNodeId,
          instanceNodeId: ref.instanceNodeId,
          paintNodeId: ref.paintNodeId,
          paintName: ref.paintName,
          imageRef: ref.imageRef,
          scaleMode: ref.scaleMode,
          file,
          mediaType: type,
          bytes: bytes.length,
          width: dimensions.width,
          height: dimensions.height,
          sha256: createHash("sha256").update(bytes).digest("hex"),
          runtimeDefault: false,
        },
      });
      console.log(
        `pin-census-011: staged ${ref.subject} ${ref.imageRef.slice(0, 12)} (${bytes.length} bytes)`,
      );
    }

    const assets = [
      ...existingAssets,
      ...staged.map(({ asset }) => asset),
    ].sort(
      (left, right) =>
        left.subject.localeCompare(right.subject) ||
        left.imageRef.localeCompare(right.imageRef) ||
        left.id.localeCompare(right.id),
    );
    const nextManifest = { ...manifest, assets };
    const manifestTemporary = path.join(
      HERE,
      `.manifest.json.${process.pid}.${randomUUID()}.tmp`,
    );
    writeFileSync(manifestTemporary, stableJson(nextManifest), {
      flag: "wx",
      mode: 0o600,
    });
    for (const item of staged) renameSync(item.temporary, item.destination);
    renameSync(manifestTemporary, MANIFEST_PATH);
    console.log(
      `pin-census-011: pinned ${staged.length} new assets, repaired ${repairedDimensionCount} decoded dimension receipts (${assets.length} total receipts)`,
    );
  } catch (error) {
    for (const item of staged) {
      if (existsSync(item.temporary)) unlinkSync(item.temporary);
    }
    throw error;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 2;
});
