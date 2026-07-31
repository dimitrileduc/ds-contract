/**
 * Télécharge les fills IMAGE de la vague 1 dans fixture-assets (GET seulement)
 * et les ajoute au manifeste hashé — même mécanique que pin-census-011.mjs.
 * Idempotent : un imageRef déjà présent dans le manifeste n'est pas retéléchargé.
 *
 *   npx tsx extract/figma/organism-audit/tools/fetch-image-fills.mts
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { figmaToken } from '../../../fidelity-matrix/scripts/env.js';

// Le dépôt est déduit de l'emplacement de CE fichier : lancés depuis un
// worktree (Worktree Gates F1), ces outils doivent auditer l'arbre courant,
// jamais le checkout principal.
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const DIR = path.join(REPO, 'extract/figma/visual-parity/fixture-assets');
const MANIFEST = path.join(DIR, 'manifest.json');
const FILE_KEY = 'd9FYAUcqdcNtsuaMgLefvJ';

/** Les fills relevés au census piné (nodeId réel, jamais deviné). */
const WANTED = [
  { subject: 'hero', role: 'background', imageRef: 'b9ae58d2e309c55241eb843c1a36d90d087c1483', paintNodeId: '2111:3382' },
  { subject: 'sav', role: 'background', imageRef: '3e173874828861c294938a12deea5a5a7a1799dd', paintNodeId: '2108:3094' },
  { subject: 'sav', role: 'img', imageRef: '429c615cb090b3aa0800188acda4bc59cc6445b0', paintNodeId: '2108:3098' },
  { subject: 'coordonnees', role: 'google-map', imageRef: 'efdebf1941d13dbd5a2ab421aaeac49d352a87b2', paintNodeId: '2104:2899' },
];

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')) as { assets: Array<Record<string, unknown>> };
const have = new Set(manifest.assets.map((a) => a.imageRef as string));
const missing = WANTED.filter((w) => !have.has(w.imageRef));
if (missing.length === 0) {
  console.log('tous les fills sont déjà dans le manifeste — rien à faire');
  process.exit(0);
}

const index = await fetch(`https://api.figma.com/v1/files/${FILE_KEY}/images`, {
  method: 'GET', headers: { 'X-Figma-Token': figmaToken() },
});
if (!index.ok) throw new Error(`images API ${index.status}`);
const urls = ((await index.json()) as { meta: { images: Record<string, string> } }).meta.images;

const sniff = (bytes: Buffer): { mediaType: string; ext: string } => {
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return { mediaType: 'image/png', ext: 'png' };
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return { mediaType: 'image/jpeg', ext: 'jpg' };
  throw new Error('format d’image inconnu — ni PNG ni JPEG');
};
/** Dimensions PNG (IHDR) / JPEG (SOFn) — mêmes lectures que fetch.mjs. */
const dims = (b: Buffer, mediaType: string): { width: number; height: number } => {
  if (mediaType === 'image/png') return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  let i = 2;
  while (i < b.length - 9) {
    if (b[i] !== 0xff) { i += 1; continue; }
    const marker = b[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  throw new Error('dimensions JPEG introuvables');
};

for (const w of missing) {
  const url = urls[w.imageRef];
  if (!url) { console.error(`✗ ${w.subject}/${w.role} : imageRef ${w.imageRef.slice(0, 12)}… absent de l'API images`); process.exit(2); }
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`download ${res.status} pour ${w.imageRef.slice(0, 12)}…`);
  const bytes = Buffer.from(await res.arrayBuffer());
  const { mediaType, ext } = sniff(bytes);
  const { width, height } = dims(bytes, mediaType);
  const file = `${w.subject}--${w.role}--${w.imageRef.slice(0, 12)}.${ext}`;
  writeFileSync(path.join(DIR, file), bytes);
  const sha = createHash('sha256').update(bytes).digest('hex');
  manifest.assets.push({
    bytes: bytes.length, file, height,
    id: `${w.subject}-${w.role}-${w.imageRef.slice(0, 12)}`,
    imageRef: w.imageRef, mediaType,
    paintName: w.role, paintNodeId: w.paintNodeId,
    runtimeDefault: false, scaleMode: 'FILL',
    // LIMITE NOMMÉE : chaque `paintNodeId` de WANTED est un id de set en deux
    // parties, donc set == paint ici. Un paint niché (`I2115:4297;2063:1622`,
    // la forme qu'ont les entrées préexistantes du manifeste) N'EST PAS géré —
    // il faudrait lire le vrai id de set, pas le dériver de la chaîne.
    setNodeId: w.paintNodeId,
    sha256: sha,
    subject: w.subject, width,
  });
  console.log(`✓ ${file} — ${width}×${height}, ${(bytes.length / 1024).toFixed(0)} Ko, sha ${sha.slice(0, 12)}…`);
}

manifest.assets.sort((a, b) =>
  String(a.subject).localeCompare(String(b.subject)) || String(a.imageRef).localeCompare(String(b.imageRef)));
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`manifeste mis à jour : ${manifest.assets.length} assets`);
