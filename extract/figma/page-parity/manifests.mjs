// manifests.mjs — the Node half of a capture: complete the CaptureManifests.
//
// capture.js (sandbox) exports each maquette @1x and POSTs the bytes to
// receiver.mjs; the sandbox has NO crypto API, so per the T017 decision the
// manifest fields that need the actual bytes — width/height re-read from the
// PNG itself (the source of truth, not the node's fractional geometry),
// sha256, capturedAt, transport — are completed HERE, next to the files.
//
// Usage:
//   node extract/figma/page-parity/manifests.mjs <captureDir> <summary.json>
//
// <summary.json> = JSON array of the per-maquette summaries returned by
// capture.js calls: [{ maquette, nodeId, nodeWidth, nodeHeight, byteLength,
// statut, refus, receiverNonce }, ...] — written by the operator driving the
// capture session.
//
// For each entry, writes <captureDir>/<maquette>.manifest.json in the exact
// sidecar shape cli.ts consumes (contracts/page-proof.md §1): statut "ok" only
// when the sandbox said ok AND the file is a decodable PNG of the right size;
// anything else keeps/downgrades to "vide"/"echec" with the reason — a failed
// capture must surface as capture-failed in the verdict, never as a silently
// missing sidecar. Exit 0 only when every manifest is statut "ok" (a capture
// session with refusals is a session to redo, not to compare).
//
// Manifests are deliberately timestamped (freshness receipt, R4) — the
// byte-determinism guarantee applies to verdict.json, never to manifests.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { PNG } from 'pngjs';

const [captureDir, summaryPath] = process.argv.slice(2);
if (!captureDir || !summaryPath) {
  console.error('usage: node extract/figma/page-parity/manifests.mjs <captureDir> <summary.json>');
  process.exit(2);
}

const summaries = JSON.parse(readFileSync(summaryPath, 'utf8'));
if (!Array.isArray(summaries) || summaries.length === 0) {
  console.error('manifests: summary.json vide ou non-tableau — rien a completer');
  process.exit(2);
}

let refusals = 0;
for (const s of summaries) {
  const pngPath = path.join(captureDir, `${s.maquette}.png`);
  const manifest = {
    maquette: s.maquette,
    nodeId: s.nodeId,
    width: 0,
    height: 0,
    scale: 1,
    sha256: null,
    capturedAt: new Date().toISOString(),
    transport: 'b-fetch',
    statut: s.statut,
  };
  if (s.refus) manifest.refus = s.refus;

  if (s.statut === 'ok') {
    if (!existsSync(pngPath)) {
      manifest.statut = 'echec';
      manifest.refus = `sandbox dit ok mais ${s.maquette}.png absent du receveur — transfert perdu`;
    } else {
      const bytes = readFileSync(pngPath);
      if (bytes.length !== s.byteLength) {
        manifest.statut = 'echec';
        manifest.refus = `taille fichier ${bytes.length} != byteLength sandbox ${s.byteLength}`;
      } else {
        try {
          const png = PNG.sync.read(bytes);
          manifest.width = png.width;
          manifest.height = png.height;
          manifest.sha256 = createHash('sha256').update(bytes).digest('hex');
        } catch (e) {
          manifest.statut = 'echec';
          manifest.refus = `PNG indecodable: ${e instanceof Error ? e.message : String(e)}`;
        }
      }
    }
  }

  writeFileSync(path.join(captureDir, `${s.maquette}.manifest.json`), JSON.stringify(manifest, null, 2) + '\n');
  if (manifest.statut !== 'ok') {
    refusals++;
    console.error(`✖ ${s.maquette}: ${manifest.statut} — ${manifest.refus ?? 'sans raison (bug)'}`);
  } else {
    console.log(`✔ ${s.maquette}: ${manifest.width}x${manifest.height}, ${s.byteLength} octets, sha256 ${manifest.sha256.slice(0, 12)}…`);
  }
}

if (refusals > 0) {
  console.error(`manifests: ${refusals}/${summaries.length} capture(s) refusee(s) — session a refaire, jamais comparee telle quelle`);
  process.exit(1);
}
console.log(`manifests: ${summaries.length}/${summaries.length} ok`);
