// checkpoint.js — the restore point before EVERY mutating gesture (T020, FR-017).
//
// Runs INSIDE the Figma plugin sandbox via the figma-console desktop bridge
// (figma_execute): plain JS, no import/require. This is the ONLY bridge script
// allowed a mutating call, and that call is exactly one:
// figma.saveVersionHistoryAsync(label) — a named entry in the file's native
// version history.
//
// Invocation:
//   1. Prior figma_execute:  globalThis.__dsc003_input = { label: "003/<increment>/<etape>" }
//   2. figma_execute this file's text. Returns { label, versionId } for the
//      decisions journal / proofs.
//
// The label convention "003/<increment>/<etape>" is VALIDATED here (systematic
// naming is the point of FR-017 — an unnamed checkpoint is a checkpoint nobody
// finds under pressure). A malformed label is a named refusal, not a silent
// best-effort save.
//
// Restoration is MANUAL: Figma desktop → Show version history → restore the
// named checkpoint. NO programmatic restore API exists (verified 2026-07-23,
// R5) — the rollback is a guided human gesture, then re-proven by the same
// pixel proof (quickstart §Rollback).
(async () => {
  const input = globalThis.__dsc003_input || {};
  const label = input.label;
  if (!label || !/^\d{3}\/[^/]+\/[^/]+$/.test(label)) {
    throw new Error('checkpoint.js: label requis au format "\\d{3}/<increment>/<etape>" — recu: ' + JSON.stringify(label));
  }
  const result = await figma.saveVersionHistoryAsync(label);
  return { label: label, versionId: (result && result.id) || null };
})()
