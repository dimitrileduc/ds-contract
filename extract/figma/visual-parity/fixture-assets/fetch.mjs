import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(await readFile(path.join(HERE, 'manifest.json'), 'utf8'));
const token = process.env.FIGMA_TOKEN;

if (!token) {
  throw new Error('FIGMA_TOKEN is required (load the gitignored .env.local first)');
}

const response = await fetch(
  `https://api.figma.com/v1/files/${manifest.figma.fileKey}/images`,
  { headers: { 'X-Figma-Token': token } },
);
if (!response.ok) {
  throw new Error(`Figma read-only image-index request failed: HTTP ${response.status}`);
}
const index = await response.json();

for (const asset of manifest.assets) {
  const url = index?.meta?.images?.[asset.imageRef];
  if (typeof url !== 'string') {
    throw new Error(`${asset.file}: imageRef ${asset.imageRef} is absent from the Figma image index`);
  }

  const imageResponse = await fetch(url);
  if (!imageResponse.ok) {
    throw new Error(`${asset.file}: Figma CDN GET failed: HTTP ${imageResponse.status}`);
  }
  const bytes = Buffer.from(await imageResponse.arrayBuffer());
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const mediaType = imageResponse.headers.get('content-type')?.split(';', 1)[0];

  if (bytes.length !== asset.bytes) {
    throw new Error(`${asset.file}: byte length ${bytes.length} != pinned ${asset.bytes}`);
  }
  if (sha256 !== asset.sha256) {
    throw new Error(`${asset.file}: sha256 ${sha256} != pinned ${asset.sha256}`);
  }
  if (mediaType !== asset.mediaType) {
    throw new Error(`${asset.file}: media type ${mediaType} != pinned ${asset.mediaType}`);
  }

  await writeFile(path.join(HERE, asset.file), bytes);
  console.log(`${asset.file}: ${bytes.length} bytes · sha256 ${sha256}`);
}
