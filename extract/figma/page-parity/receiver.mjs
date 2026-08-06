// Page-parity capture receiver — the Node half of transport (b-fetch), R3.
//
// The Desktop Bridge plugin sandbox HAS fetch() and its manifest allows
// http://localhost:9223-9232, so capture.js can POST each exportAsync PNG
// straight here: one figma_execute call per maquette, bytes never transit a
// tool result (probed 2026-07-23 — see specs/003-externalize-figma-components/
// proofs/T0-calibration/transport.md for the receipts, including why the MCP
// screenshot tools were rejected: silent 1568px downscale ceiling).
//
// Derived from extract/figma/gauntlet/live/capture-receiver.mjs (spec 001)
// with two page-parity-specific hardenings, both lessons from the T0 probe:
//   · /health identifies WHICH receiver listens (instrument + outDir + nonce):
//     the probe's first POST landed in a stale receiver from a dead session
//     squatting the gauntlet port — the capture harness must verify identity
//     before trusting a single byte to the sink.
//   · /png refuses non-PNG bodies by magic check (a refusal is a named
//     receipt, never a silently banked corrupt file).
//
// Usage: node extract/figma/page-parity/receiver.mjs <outDir> [port]
//   POST /png?name=<Maquette>   PNG body → <outDir>/<Maquette>.png (magic-checked)
//   GET  /health                { instrument, outDir, nonce, startedAt }
//   GET  /list                  [{ name, bytes }] of received PNGs
//   GET  /file?name=<rel>       serve a file from the INSTRUMENT dir (read-only,
//                               path-jailed) — the gauntlet's trick: bridge
//                               scripts are fetched+eval'd from here so their
//                               12KB source rides ONE http GET per call instead
//                               of every figma_execute payload
//
// Default port 9227 — deliberately NOT 9226 (the gauntlet receiver's port),
// so the two tools can never squat each other again.
import { createServer } from 'node:http';
import { writeFileSync, readFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';

const outDir = process.argv[2];
const port = Number(process.argv[3] ?? 9227);
if (!outDir) {
  console.error('usage: node extract/figma/page-parity/receiver.mjs <outDir> [port]');
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const identity = {
  instrument: 'page-parity',
  outDir: path.resolve(outDir),
  nonce: randomBytes(8).toString('hex'),
  startedAt: new Date().toISOString(),
};

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${port}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.method === 'GET' && url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(identity));
    return;
  }
  if (req.method === 'POST' && url.pathname === '/json') {
    // Verbatim JSON sink for bridge reports (scan results, capture summaries):
    // the full payload lands on disk, the figma_execute result stays tiny.
    const name = (url.searchParams.get('name') ?? 'unnamed').replace(/[^A-Za-z0-9À-ÿ ._'-]/g, '_');
    const parts = [];
    req.on('data', (d) => parts.push(d));
    req.on('end', () => {
      const body = Buffer.concat(parts);
      try {
        JSON.parse(body.toString('utf8'));
      } catch (e) {
        console.error(`REFUS ${name}: body is not JSON (${body.length} bytes) — nothing written`);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, name, refus: 'not-json', bytes: body.length }));
        return;
      }
      const file = path.join(outDir, `${name}.json`);
      writeFileSync(file, body);
      console.log(`received ${name}.json (${body.length} bytes)`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, name, bytes: body.length }));
    });
    return;
  }
  if (req.method === 'POST' && url.pathname === '/png') {
    const name = (url.searchParams.get('name') ?? 'unnamed').replace(/[^A-Za-z0-9À-ÿ ._'-]/g, '_');
    const parts = [];
    req.on('data', (d) => parts.push(d));
    req.on('end', () => {
      const body = Buffer.concat(parts);
      if (body.length < PNG_MAGIC.length || !body.subarray(0, 8).equals(PNG_MAGIC)) {
        console.error(`REFUS ${name}: body is not a PNG (${body.length} bytes) — nothing written`);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, name, refus: 'not-a-png', bytes: body.length }));
        return;
      }
      const file = path.join(outDir, `${name}.png`);
      writeFileSync(file, body);
      console.log(`received ${name}.png (${body.length} bytes)`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, name, bytes: body.length }));
    });
    return;
  }
  if (req.method === 'GET' && url.pathname === '/file') {
    // Read-only, jailed to the instrument's own directory: the only intended
    // payloads are the bridge/*.js sources.
    const instrumentDir = path.dirname(fileURLToPath(import.meta.url));
    const rel = url.searchParams.get('name') ?? '';
    const resolved = path.resolve(instrumentDir, rel);
    if (!resolved.startsWith(instrumentDir + path.sep)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, refus: 'chemin hors du dossier instrument' }));
      return;
    }
    try {
      const data = readFileSync(resolved);
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(data);
    } catch {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, refus: 'fichier introuvable: ' + rel }));
    }
    return;
  }
  if (req.method === 'GET' && url.pathname === '/list') {
    const files = readdirSync(outDir)
      .filter((f) => f.endsWith('.png'))
      .map((f) => ({ name: f, bytes: statSync(path.join(outDir, f)).size }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(files));
    return;
  }
  res.writeHead(404);
  res.end('not found');
});
// Two SPECIFIC binds, v4 AND v6 (016). The IPv4-only bind lost the port to MCP
// squatters twice: macOS resolves localhost to [::1] first, and a later server
// binding [::1]:<port> SPECIFICALLY wins IPv6 traffic even over a wildcard.
// Holding both specific binds ourselves makes the next squatter EADDRINUSE.
server.listen(port, '127.0.0.1', () =>
  console.log(`page-parity receiver on http://localhost:${port} → ${outDir} (nonce ${identity.nonce})`),
);
const serverV6 = createServer(server.listeners('request')[0]);
serverV6.listen(port, '::1');
