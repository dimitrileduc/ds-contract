// aplat-source.js — extract the ORIGINAL bytes of the "Avis Google" flattened
// widget image (spec 006, T012), never a re-capture of a page render.
//
// Runs INSIDE the Figma plugin sandbox via the figma-console desktop bridge
// (figma_execute): plain JS, no import/require, no Node APIs; the `figma`
// global and fetch() are available (manifest allows http://localhost:9223-32).
//
// Why native bytes, not a screenshot crop (contracts/measure-record.md §1):
// cropping a page capture would be a lossy copy of a lossy copy. The fill
// paint on the RECTANGLE carries the original upload — figma.getImageByHash
// returns those exact bytes, unresampled, regardless of what scale the layer
// is drawn at on canvas.
//
// Read-only guarantee: this script never mutates the document. It only reads
// a node, reads its fill, and reads the image bytes behind that fill's hash.
//
// Transport: same b-fetch pattern as bridge/capture.js — nonce-pinned health
// check before a single byte moves (T017/T018 lessons: a byte handed to an
// unverified sink is a byte lost in silence).
//
// Invocation:
//   1. Start the receiver:  node extract/figma/page-parity/receiver.mjs <outDir> 9227
//   2. Prior figma_execute:  globalThis.__dsc003_input =
//        { nodeId, maquette, expectNonce, port? }
//      (nodeId = the aplat RECTANGLE's id — any one of the 8 occurrences: all
//      8 share the same imageHash per inventory/occurrences.json, T010).
//   3. figma_execute this file's text. Returns a SMALL summary (no bytes):
//      { nodeId, maquette, imageHash, renderedWidth, renderedHeight,
//        byteLength, statut, refus, receiverNonce }
//      POSTed PNG lands at <outDir>/aplat-source.png; the Node side computes
//      largeurNative/hauteurNative/scaleFactor by reading the PNG's own IHDR
//      chunk (NOT rect.width/height, which is only the DRAWN size — 1552 —
//      and can differ from the uploaded image's real resolution) plus sha256
//      (the sandbox has no crypto API — same division of labor as capture.js)
//      and writes the aplat-source.json side-car.
(async () => {
  const input = globalThis.__dsc003_input || {};
  const nodeId = input.nodeId;
  const maquette = input.maquette;
  const port = input.port || 9227;
  if (!nodeId) {
    throw new Error('aplat-source.js: input requis — globalThis.__dsc003_input = { nodeId, maquette, expectNonce, port? }');
  }

  await figma.loadAllPagesAsync();
  const rect = await figma.getNodeByIdAsync(nodeId);
  if (!rect) throw new Error('aplat-source.js: node introuvable ' + nodeId + ' — re-scanner, les nodeIds perimenent');
  if (rect.type !== 'RECTANGLE') {
    throw new Error('aplat-source.js: node ' + nodeId + ' est un ' + rect.type + ', pas un RECTANGLE — mauvais id');
  }
  const fills = Array.isArray(rect.fills) ? rect.fills : [];
  const paint = fills.find((f) => f.type === 'IMAGE');
  if (!paint) throw new Error('aplat-source.js: aucun fill IMAGE sur ' + nodeId + ' (' + rect.name + ')');

  // Identity check of the sink BEFORE export (capture.js's hardening, same lesson).
  let health = null;
  try {
    const hr = await fetch('http://localhost:' + port + '/health');
    health = await hr.json();
  } catch (e) {
    throw new Error('aplat-source.js: receveur injoignable sur :' + port + ' — demarrer receiver.mjs d\'abord (' + String((e && e.message) || e) + ')');
  }
  if (!health || health.instrument !== 'page-parity') {
    throw new Error('aplat-source.js: le process sur :' + port + ' n\'est PAS le receveur page-parity (identite: ' + JSON.stringify(health) + ') — octets NON envoyes');
  }
  if (!input.expectNonce) {
    throw new Error('aplat-source.js: input.expectNonce requis — lire le nonce imprime par receiver.mjs au demarrage');
  }
  if (health.nonce !== input.expectNonce) {
    throw new Error('aplat-source.js: nonce du receveur ' + health.nonce + ' != attendu ' + input.expectNonce + ' — mauvaise session, octets NON envoyes');
  }

  let bytes = null;
  let statut = 'ok';
  let refus = null;
  try {
    const image = figma.getImageByHash(paint.imageHash);
    if (!image) throw new Error('getImageByHash a renvoye null pour ' + paint.imageHash);
    bytes = await image.getBytesAsync();
  } catch (e) {
    statut = 'echec';
    refus = 'getImageByHash/getBytesAsync: ' + String((e && e.message) || e);
  }
  if (statut === 'ok' && (!bytes || bytes.length === 0)) {
    statut = 'vide';
    refus = 'octets image revenus a 0';
  }

  if (statut === 'ok') {
    const resp = await fetch('http://localhost:' + port + '/png?name=' + encodeURIComponent('aplat-source'), {
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
    nodeId: nodeId,
    maquette: maquette || null,
    imageHash: paint.imageHash,
    scaleMode: paint.scaleMode || null,
    renderedWidth: rect.width,   // drawn size on canvas (1552) — NOT the native resolution
    renderedHeight: rect.height, // idem — native dims are read Node-side from the PNG's IHDR
    byteLength: bytes ? bytes.length : 0,
    statut: statut,
    refus: refus,
    receiverNonce: health.nonce,
  };
})()
