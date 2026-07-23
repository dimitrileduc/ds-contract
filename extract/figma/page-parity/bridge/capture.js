// capture.js — one maquette frame → one full-resolution PNG on disk (T016).
//
// Runs INSIDE the Figma plugin sandbox via the figma-console desktop bridge
// (figma_execute): plain JS, no import/require, no Node APIs; the `figma`
// global and fetch() are available (manifest allows http://localhost:9223-32).
//
// Transport: (b-fetch), the one RETAINED by the T017 probe — see
// specs/003-externalize-figma-components/proofs/T0-calibration/transport.md.
// exportAsync @1x in the sandbox, then a direct POST of the bytes to the
// page-parity receiver (extract/figma/page-parity/receiver.mjs, port 9227).
// One figma_execute call per maquette: the bytes never transit a tool result.
// The MCP screenshot tools were REJECTED on receipt (silent 1568px downscale
// ceiling); chunked-base64-via-persisted-global is the named fallback.
//
// Invocation (per maquette — 9 frames can exceed the 30s call budget in one go):
//   1. Start the receiver:  node extract/figma/page-parity/receiver.mjs <outDir> 9227
//   2. Prior figma_execute:  globalThis.__dsc003_input = { maquette, nodeId, port? }
//   3. figma_execute this file's text. Returns a SMALL summary (no bytes):
//      { maquette, nodeId, nodeWidth, nodeHeight, byteLength, statut, refus,
//        receiverNonce }
//   4. Node side completes the CaptureManifest (width/height re-read from the
//      PNG itself, sha256, capturedAt, transport) via manifests.mjs — the
//      sandbox has no crypto API, so hashing is deliberately NOT done here.
//
// Read-only guarantee: this script never mutates the document — it only
// exports. Refusals are named, never silent: a failed/empty export returns
// statut "echec"/"vide" (with the cause), and per FR-016 those are never
// counted as a capture.
//
// Hardening (T017 incident): before exporting a single byte we GET /health on
// the receiver and require { instrument: "page-parity" } — the probe's first
// POST landed in a stale receiver from a dead session squatting another port.
// A byte handed to an unknown sink is a byte lost in silence.
(async () => {
  const input = globalThis.__dsc003_input || {};
  const name = input.maquette;
  const nodeId = input.nodeId;
  const port = input.port || 9227;
  if (!name || !nodeId) {
    throw new Error('capture.js: input requis — globalThis.__dsc003_input = { maquette, nodeId, port? }');
  }

  // The Pages page (210:325) is local-only: loadAllPagesAsync is mandatory
  // before any node of it is reachable (R1).
  await figma.loadAllPagesAsync();
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error('capture.js: node introuvable ' + nodeId + ' (' + name + ') — re-scanner, les nodeIds periment');

  // Identity check of the sink BEFORE export (see header).
  let health = null;
  try {
    const hr = await fetch('http://localhost:' + port + '/health');
    health = await hr.json();
  } catch (e) {
    throw new Error('capture.js: receveur injoignable sur :' + port + ' — demarrer receiver.mjs d\'abord (' + String((e && e.message) || e) + ')');
  }
  if (!health || health.instrument !== 'page-parity') {
    throw new Error('capture.js: le process sur :' + port + ' n\'est PAS le receveur page-parity (identite: ' + JSON.stringify(health) + ') — octets NON envoyes');
  }

  let bytes = null;
  let statut = 'ok';
  let refus = null;
  try {
    bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
  } catch (e) {
    statut = 'echec';
    refus = 'exportAsync: ' + String((e && e.message) || e);
  }
  if (statut === 'ok' && (!bytes || bytes.length === 0)) {
    statut = 'vide';
    refus = 'export revenu a 0 octet';
  }

  if (statut === 'ok') {
    const resp = await fetch('http://localhost:' + port + '/png?name=' + encodeURIComponent(name), {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: bytes,
    });
    let ack = null;
    try { ack = await resp.json(); } catch (e) { ack = null; }
    if (!resp.ok || !ack || ack.ok !== true || ack.bytes !== bytes.length) {
      statut = 'echec';
      refus = 'transfert: HTTP ' + resp.status + ' ack=' + JSON.stringify(ack) + ' (attendu bytes=' + bytes.length + ')';
    }
  }

  return {
    maquette: name,
    nodeId: nodeId,
    nodeWidth: node.width,
    nodeHeight: node.height,
    byteLength: bytes ? bytes.length : 0,
    statut: statut,
    refus: refus,
    receiverNonce: health.nonce,
  };
})()
