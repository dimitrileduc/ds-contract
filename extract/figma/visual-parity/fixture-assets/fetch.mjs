import { createHash, randomUUID } from "node:crypto";
import { lstat, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..", "..", "..");
const MANIFEST_PATH = path.join(HERE, "manifest.json");
const CAMPAIGN_PATH = path.join(
  ROOT,
  "specs",
  "011-fix-molecule-convergence",
  "contracts",
  "visual-campaign.json",
);
const SHA256 = /^[a-f0-9]{64}$/;
const IMAGE_MEDIA_TYPES = new Set(["image/png", "image/jpeg"]);
const JPEG_SOF_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

/** A deterministic, machine-readable failure for invalid fixture evidence. */
export class FixtureAssetError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "FixtureAssetError";
    this.code = code;
  }
}

function fail(code, message) {
  throw new FixtureAssetError(code, message);
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value, label) {
  if (typeof value !== "string" || value.trim() === "")
    fail("invalid-receipt", `${label} must be a non-empty string`);
  return value;
}

function requiredPositiveInteger(value, label) {
  if (!Number.isSafeInteger(value) || value <= 0)
    fail("invalid-receipt", `${label} must be a positive safe integer`);
  return value;
}

async function readJson(jsonPath, label) {
  let source;
  try {
    source = await readFile(jsonPath, "utf8");
  } catch (error) {
    fail("input-read-failed", `${label} cannot be read: ${error.message}`);
  }

  try {
    return JSON.parse(source);
  } catch (error) {
    fail("input-json-invalid", `${label} is not valid JSON: ${error.message}`);
  }
}

function resolveRepositoryPath(relativePath, label) {
  const value = requiredString(relativePath, label);
  if (path.isAbsolute(value))
    fail("output-path-invalid", `${label} must be repository-relative`);
  const resolved = path.resolve(ROOT, value);
  const relative = path.relative(ROOT, resolved);
  if (
    relative === "" ||
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    fail("output-path-invalid", `${label} resolves outside the repository`);
  }
  return resolved;
}

/**
 * A receipt filename is deliberately flat: the fetcher never creates a
 * directory and never follows a manifest-provided path outside HERE.
 */
export function resolveBoundedAssetPath(file) {
  const value = requiredString(file, "asset.file");
  if (
    path.basename(value) !== value ||
    !/^[A-Za-z0-9][A-Za-z0-9._-]*\.(?:png|jpe?g)$/i.test(value)
  ) {
    fail(
      "output-path-invalid",
      `asset.file ${JSON.stringify(value)} must be a flat PNG or JPEG filename`,
    );
  }
  const resolved = path.resolve(HERE, value);
  const relative = path.relative(HERE, resolved);
  if (
    relative === "" ||
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    fail(
      "output-path-invalid",
      `asset.file ${JSON.stringify(value)} resolves outside ${HERE}`,
    );
  }
  return resolved;
}

function assetReferencesIn(value, references) {
  if (Array.isArray(value)) {
    for (const item of value) assetReferencesIn(item, references);
    return;
  }
  if (!isRecord(value)) return;
  if (Object.hasOwn(value, "$asset")) {
    const keys = Object.keys(value);
    if (
      keys.length !== 1 ||
      typeof value.$asset !== "string" ||
      value.$asset.trim() === ""
    ) {
      fail(
        "campaign-asset-invalid",
        "$asset values must contain exactly one non-empty asset id",
      );
    }
    references.add(value.$asset);
    return;
  }
  for (const nested of Object.values(value))
    assetReferencesIn(nested, references);
}

/**
 * Select exactly the asset IDs declared by the current campaign.  A manifest
 * can retain receipts for another campaign, but this fetcher never downloads
 * or writes them.
 */
export function selectCampaignAssets(campaign, manifest) {
  if (!isRecord(campaign))
    fail("campaign-invalid", "visual campaign must be an object");
  if (!isRecord(campaign.reference))
    fail("campaign-invalid", "visual campaign reference must be an object");
  if (campaign.reference.readOnly !== true)
    fail(
      "campaign-not-read-only",
      "visual campaign reference.readOnly must be true",
    );
  const fileKey = requiredString(
    campaign.reference.fileKey,
    "campaign.reference.fileKey",
  );
  const fileVersion = requiredString(
    campaign.reference.fileVersion,
    "campaign.reference.fileVersion",
  );
  if (!/^\d+$/.test(fileVersion))
    fail(
      "campaign-invalid",
      "campaign.reference.fileVersion must be a pinned numeric version",
    );

  if (
    !isRecord(manifest) ||
    !isRecord(manifest.figma) ||
    !Array.isArray(manifest.assets)
  ) {
    fail(
      "manifest-invalid",
      "fixture manifest must contain figma and assets records",
    );
  }
  if (
    requiredString(manifest.figma.fileKey, "manifest.figma.fileKey") !== fileKey
  ) {
    fail(
      "figma-reference-mismatch",
      "fixture manifest fileKey must equal the current campaign fileKey",
    );
  }
  if (
    requiredString(manifest.figma.fileVersion, "manifest.figma.fileVersion") !==
    fileVersion
  ) {
    fail(
      "figma-reference-mismatch",
      "fixture manifest fileVersion must equal the current campaign fileVersion",
    );
  }

  if (!Array.isArray(campaign.subjects))
    fail("campaign-invalid", "visual campaign subjects must be an array");
  const campaignAssetIds = new Set();
  for (const subject of campaign.subjects) {
    if (!isRecord(subject) || !Array.isArray(subject.cases))
      fail("campaign-invalid", "each campaign subject must contain cases");
    for (const campaignCase of subject.cases) {
      if (!isRecord(campaignCase))
        fail("campaign-invalid", "each campaign case must be an object");
      const declared = campaignCase.fixtureAssetIds ?? [];
      if (
        !Array.isArray(declared) ||
        declared.some(
          (assetId) => typeof assetId !== "string" || assetId.trim() === "",
        )
      ) {
        fail(
          "campaign-asset-invalid",
          "fixtureAssetIds must be an array of non-empty asset ids",
        );
      }
      const declaredIds = new Set(declared);
      if (declaredIds.size !== declared.length)
        fail(
          "campaign-asset-invalid",
          "fixtureAssetIds must not contain duplicates",
        );
      for (const assetId of declaredIds) campaignAssetIds.add(assetId);

      const referenced = new Set();
      assetReferencesIn(campaignCase.codeProps, referenced);
      for (const assetId of referenced) {
        if (!declaredIds.has(assetId)) {
          fail(
            "campaign-asset-invalid",
            `campaign $asset ${assetId} must also be declared in fixtureAssetIds`,
          );
        }
      }
    }
  }

  const byId = new Map();
  for (const asset of manifest.assets) {
    if (!isRecord(asset))
      fail(
        "manifest-invalid",
        "every fixture manifest asset must be an object",
      );
    const id = requiredString(asset.id, "manifest asset.id");
    if (byId.has(id))
      fail("manifest-invalid", `fixture manifest asset id ${id} is duplicated`);
    byId.set(id, asset);
  }

  const selected = [];
  for (const assetId of campaignAssetIds) {
    const asset = byId.get(assetId);
    if (!asset)
      fail(
        "campaign-asset-missing",
        `campaign fixture asset ${assetId} is absent from the manifest`,
      );
    selected.push(asset);
  }
  return selected;
}

function validateAssetReceipt(asset) {
  if (!isRecord(asset))
    fail("invalid-receipt", "fixture asset receipt must be an object");
  const id = requiredString(asset.id, "asset.id");
  const file = requiredString(asset.file, `${id}.file`);
  const imageRef = requiredString(asset.imageRef, `${id}.imageRef`);
  const mediaType = requiredString(
    asset.mediaType,
    `${id}.mediaType`,
  ).toLowerCase();
  if (!IMAGE_MEDIA_TYPES.has(mediaType))
    fail("invalid-receipt", `${id}.mediaType must be image/png or image/jpeg`);
  const bytes = requiredPositiveInteger(asset.bytes, `${id}.bytes`);
  const width = requiredPositiveInteger(asset.width, `${id}.width`);
  const height = requiredPositiveInteger(asset.height, `${id}.height`);
  const sha256 = requiredString(asset.sha256, `${id}.sha256`).toLowerCase();
  if (!SHA256.test(sha256))
    fail(
      "invalid-receipt",
      `${id}.sha256 must be lowercase hexadecimal SHA-256`,
    );

  const destination = resolveBoundedAssetPath(file);
  const extension = path.extname(destination).toLowerCase();
  if (
    (mediaType === "image/png" && extension !== ".png") ||
    (mediaType === "image/jpeg" &&
      extension !== ".jpg" &&
      extension !== ".jpeg")
  ) {
    fail("invalid-receipt", `${id}.file extension must match ${mediaType}`);
  }
  return {
    id,
    imageRef,
    file,
    mediaType,
    bytes,
    width,
    height,
    sha256,
    destination,
  };
}

function detectMediaType(bytes) {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  )
    return "image/png";
  if (
    bytes.length >= 4 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[bytes.length - 2] === 0xff &&
    bytes[bytes.length - 1] === 0xd9
  ) {
    return "image/jpeg";
  }
  return null;
}

/**
 * Read only the TIFF IFD0 orientation tag from a bounded JPEG APP1 segment.
 * Unknown or malformed metadata is ignored; the SOF frame remains the
 * authoritative fallback. Orientations 5–8 swap the decoded axes exactly as
 * browsers do before exposing naturalWidth/naturalHeight.
 */
function jpegExifOrientation(bytes, start, end) {
  if (
    end - start < 14 ||
    bytes.toString("ascii", start, start + 6) !== "Exif\0\0"
  ) {
    return null;
  }
  const tiff = start + 6;
  const byteOrder = bytes.toString("ascii", tiff, tiff + 2);
  const littleEndian = byteOrder === "II";
  if (!littleEndian && byteOrder !== "MM") return null;
  const read16 = (offset) =>
    littleEndian ? bytes.readUInt16LE(offset) : bytes.readUInt16BE(offset);
  const read32 = (offset) =>
    littleEndian ? bytes.readUInt32LE(offset) : bytes.readUInt32BE(offset);
  if (tiff + 8 > end || read16(tiff + 2) !== 42) return null;
  const ifdOffset = read32(tiff + 4);
  const ifd = tiff + ifdOffset;
  if (ifd < tiff + 8 || ifd + 2 > end) return null;
  const entries = read16(ifd);
  if (entries > Math.floor((end - (ifd + 2)) / 12)) return null;
  for (let index = 0; index < entries; index += 1) {
    const entry = ifd + 2 + index * 12;
    if (read16(entry) !== 0x0112) continue;
    if (read16(entry + 2) !== 3 || read32(entry + 4) !== 1) return null;
    const orientation = read16(entry + 8);
    return orientation >= 1 && orientation <= 8 ? orientation : null;
  }
  return null;
}

function decodeJpegDimensions(bytes) {
  if (detectMediaType(bytes) !== "image/jpeg")
    fail("image-undecodable", "JPEG receipt is missing SOI/EOI markers");
  let offset = 2;
  let dimensions = null;
  let orientation = null;
  while (offset < bytes.length - 2) {
    while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
    if (offset >= bytes.length) break;
    const marker = bytes[offset++];
    if (marker === 0xd9) break;
    if (
      marker === 0x00 ||
      marker === 0x01 ||
      (marker >= 0xd0 && marker <= 0xd7)
    )
      continue;
    if (offset + 2 > bytes.length)
      fail("image-undecodable", "JPEG marker segment is truncated");
    const length = bytes.readUInt16BE(offset);
    offset += 2;
    if (length < 2 || offset + length - 2 > bytes.length)
      fail("image-undecodable", "JPEG marker segment has an invalid length");
    const end = offset + length - 2;
    if (marker === 0xe1 && orientation === null) {
      orientation = jpegExifOrientation(bytes, offset, end);
    }
    if (JPEG_SOF_MARKERS.has(marker)) {
      if (length < 8)
        fail("image-undecodable", "JPEG frame header is truncated");
      const height = bytes.readUInt16BE(offset + 1);
      const width = bytes.readUInt16BE(offset + 3);
      const components = bytes[offset + 5];
      if (
        width === 0 ||
        height === 0 ||
        components === 0 ||
        length !== 8 + 3 * components
      ) {
        fail(
          "image-undecodable",
          "JPEG frame header has invalid dimensions or components",
        );
      }
      dimensions = { width, height };
    }
    // Entropy-coded scan data is not a sequence of marker segments. The SOF
    // above is the JPEG decoder's authoritative dimension record.
    if (marker === 0xda) break;
    offset = end;
  }
  if (!dimensions)
    fail("image-undecodable", "JPEG receipt does not contain a frame header");
  return orientation !== null && orientation >= 5
    ? { width: dimensions.height, height: dimensions.width }
    : dimensions;
}

/** Decode the downloaded bytes, rather than trusting the CDN Content-Type. */
export function decodeImageDimensions(bytes, mediaType) {
  if (!Buffer.isBuffer(bytes))
    fail("image-undecodable", "fixture receipt must be a Buffer");
  const detected = detectMediaType(bytes);
  if (detected !== mediaType)
    fail(
      "media-type-mismatch",
      `binary media type ${detected ?? "unknown"} != pinned ${mediaType}`,
    );
  if (mediaType === "image/png") {
    try {
      const png = PNG.sync.read(bytes);
      if (
        !Number.isSafeInteger(png.width) ||
        png.width <= 0 ||
        !Number.isSafeInteger(png.height) ||
        png.height <= 0
      ) {
        fail("image-undecodable", "PNG receipt has invalid decoded dimensions");
      }
      return { width: png.width, height: png.height };
    } catch (error) {
      if (error instanceof FixtureAssetError) throw error;
      fail(
        "image-undecodable",
        `PNG receipt cannot be decoded: ${error.message}`,
      );
    }
  }
  return decodeJpegDimensions(bytes);
}

function responseMediaType(response) {
  const contentType = response.headers.get("content-type");
  if (!contentType)
    fail("media-type-mismatch", "CDN response is missing Content-Type");
  return contentType.split(";", 1)[0].trim().toLowerCase();
}

function verifyContentLength(response, bytes, asset) {
  const header = response.headers.get("content-length");
  if (header === null) return;
  if (!/^\d+$/.test(header) || Number(header) !== bytes.length) {
    fail(
      "content-length-mismatch",
      `${asset.file}: CDN Content-Length ${JSON.stringify(header)} != received ${bytes.length}`,
    );
  }
}

async function get(url, options, label) {
  try {
    return await fetch(url, { ...options, method: "GET" });
  } catch (error) {
    fail("get-failed", `${label} GET failed: ${error.message}`);
  }
}

async function fetchImageIndex(fileKey, token) {
  const indexUrl = `https://api.figma.com/v1/files/${encodeURIComponent(fileKey)}/images`;
  const response = await get(
    indexUrl,
    { headers: { "X-Figma-Token": token } },
    "Figma image-index",
  );
  if (!response.ok)
    fail(
      "figma-index-failed",
      `Figma read-only image-index GET failed: HTTP ${response.status}`,
    );
  try {
    return await response.json();
  } catch (error) {
    fail(
      "figma-index-invalid",
      `Figma image-index response is not JSON: ${error.message}`,
    );
  }
}

async function materializeReceipt(asset, index) {
  const url = index?.meta?.images?.[asset.imageRef];
  if (typeof url !== "string")
    fail(
      "image-ref-absent",
      `${asset.file}: imageRef ${asset.imageRef} is absent from the Figma image index`,
    );
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    fail(
      "cdn-url-invalid",
      `${asset.file}: Figma image index did not return a valid URL`,
    );
  }
  if (parsedUrl.protocol !== "https:")
    fail("cdn-url-invalid", `${asset.file}: Figma image URL must use HTTPS`);

  const response = await get(parsedUrl, undefined, `${asset.file} CDN`);
  if (!response.ok)
    fail(
      "cdn-get-failed",
      `${asset.file}: Figma CDN GET failed: HTTP ${response.status}`,
    );
  let bytes;
  try {
    bytes = Buffer.from(await response.arrayBuffer());
  } catch (error) {
    fail(
      "cdn-receipt-invalid",
      `${asset.file}: CDN response body cannot be read: ${error.message}`,
    );
  }
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const mediaType = responseMediaType(response);
  verifyContentLength(response, bytes, asset);

  if (bytes.length !== asset.bytes)
    fail(
      "byte-length-mismatch",
      `${asset.file}: byte length ${bytes.length} != pinned ${asset.bytes}`,
    );
  if (sha256 !== asset.sha256)
    fail(
      "sha256-mismatch",
      `${asset.file}: sha256 ${sha256} != pinned ${asset.sha256}`,
    );
  if (mediaType !== asset.mediaType)
    fail(
      "media-type-mismatch",
      `${asset.file}: CDN media type ${mediaType} != pinned ${asset.mediaType}`,
    );
  const dimensions = decodeImageDimensions(bytes, asset.mediaType);
  if (dimensions.width !== asset.width || dimensions.height !== asset.height) {
    fail(
      "dimension-mismatch",
      `${asset.file}: decoded ${dimensions.width}x${dimensions.height} != pinned ${asset.width}x${asset.height}`,
    );
  }
  return { ...asset, bytes, sha256 };
}

async function assertDestinationIsNotSymlink(destination) {
  try {
    const stat = await lstat(destination);
    if (stat.isSymbolicLink())
      fail(
        "output-path-invalid",
        `${destination} is a symlink and cannot be replaced`,
      );
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

/** Write a fully verified receipt atomically, using a temporary file inside HERE. */
async function writeVerifiedAsset(asset) {
  await assertDestinationIsNotSymlink(asset.destination);
  const temporary = path.join(
    HERE,
    `.${path.basename(asset.destination)}.${process.pid}.${randomUUID()}.tmp`,
  );
  try {
    await writeFile(temporary, asset.bytes, { flag: "wx", mode: 0o600 });
    await rename(temporary, asset.destination);
  } catch (error) {
    await unlink(temporary).catch(() => {});
    if (error instanceof FixtureAssetError) throw error;
    fail(
      "output-write-failed",
      `${asset.file}: cannot write verified fixture asset: ${error.message}`,
    );
  }
}

export async function main() {
  const [campaign, manifest] = await Promise.all([
    readJson(CAMPAIGN_PATH, "current visual campaign"),
    readJson(MANIFEST_PATH, "fixture manifest"),
  ]);
  const configuredManifestPath = resolveRepositoryPath(
    campaign.assetsManifest,
    "campaign.assetsManifest",
  );
  if (configuredManifestPath !== MANIFEST_PATH) {
    fail(
      "manifest-path-mismatch",
      `current campaign assetsManifest must resolve to ${MANIFEST_PATH}`,
    );
  }
  const selectedAssets = selectCampaignAssets(campaign, manifest).map(
    validateAssetReceipt,
  );
  const token = process.env.FIGMA_TOKEN;
  if (!token)
    fail(
      "figma-token-missing",
      "FIGMA_TOKEN is required (load the gitignored .env.local first)",
    );

  const index = await fetchImageIndex(campaign.reference.fileKey, token);
  // Download and validate every receipt before creating or replacing any asset file.
  const verified = [];
  for (const asset of selectedAssets)
    verified.push(await materializeReceipt(asset, index));
  for (const asset of verified) {
    await writeVerifiedAsset(asset);
    console.log(
      `${asset.file}: ${asset.bytes.length} bytes · ${asset.width}x${asset.height} · sha256 ${asset.sha256}`,
    );
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
