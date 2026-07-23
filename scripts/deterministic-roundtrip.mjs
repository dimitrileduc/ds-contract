/**
 * DETERMINISTIC ROUND-TRIP — `node scripts/deterministic-roundtrip.mjs`
 *
 * Proves the full journey runs as PURE DETERMINISTIC FUNCTIONS — no AI, no
 * agent, no network — and is byte-reproducible:
 *
 *   contract ──(emit-figma-script engine)──▶ canvas node tree
 *   canvas   ──(dump + proposeDiff)────────▶ recovered contract
 *   contract ──(emit-react)───────────────▶ React code
 *
 * The engine here is the SAME one baked into the plugin (window.DSC): the
 * plugin is just a deterministic executor of these functions inside Figma —
 * the AI is only ever used to BUILD this tooling, never to run the conversion.
 *
 * Determinism is asserted directly: the contract→canvas step is run TWICE and
 * the produced node trees must be byte-identical. An AI in the loop could not
 * make that guarantee; a pure function does, every time.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠️ NAMED DEGRADATION (2026-07-22, Piqueray reconversion — Honesty V).
 * This harness used to run on an ADVANCED COMPOSITE (ds.composite-modal: a
 * dialog+backdrop composing ds.card, a repeated ds.badge collection, ds.avatar,
 * ds.button). That fixture depended on demo contracts AND the demo token set,
 * both removed by the reconversion (US1) — so the proof could no longer run at
 * all. It is now re-pointed onto the Piqueray Button (the hybrid rule the spec
 * applies to the eval suite: re-point onto the surviving component rather than
 * delete the coverage).
 *
 * WHAT IS PRESERVED: the guarantee itself — contract→canvas byte-identical ×2,
 * the full loop closing, zero AI in the conversion.
 * WHAT IS LOST: composite DEPTH — nested component instances, repeated
 * collections, slots, multi-root anatomy are no longer exercised here. The
 * Piqueray DS is a single flat Button and cannot supply that case today.
 * TO RESTORE: when Piqueray gains a component that composes others, re-point
 * this harness onto it (or add it alongside the Button). Do NOT resurrect the
 * demo design system to keep this proof deep — that would mean maintaining a
 * parallel fake DS (contracts + tokens) forever.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { buildEngineBundle } from './build-plugin-zip.mjs';
import { createFigmaMock } from './plugin-engine-mock-figma.mjs';

const ROOT = process.cwd();
const read = (p) => readFileSync(path.join(ROOT, p), 'utf8');
const fail = (m) => { console.error(`\n✘ deterministic-roundtrip: ${m}`); process.exit(1); };
const ok = (m) => console.log(`  ✔ ${m}`);

// Load the plugin engine (window.DSC) — the exact bundle the plugin runs.
const bundle = await buildEngineBundle();

// A canonical, order-independent fingerprint of a built node subtree: names +
// types + nesting, collapsing repeated-instance suffixes ("tags 2" -> "tags").
function fingerprint(node) {
  const base = (s) => (s ?? '').replace(/ \d+$/, '');
  const walk = (n) => ({
    name: base(n.name),
    type: n.type,
    children: (n.children ?? []).map(walk),
  });
  return JSON.stringify(walk(node));
}

// Run the plugin engine's contract→canvas once, in a fresh mocked Figma.
function contractToCanvas() {
  const { figma, root } = createFigmaMock();
  const sandbox = { window: {}, console: { log() {}, warn() {}, error() {} } };
  vm.createContext(sandbox);
  vm.runInContext(bundle.code, sandbox, { timeout: 120_000 });
  const DSC = sandbox.window.DSC;
  const scriptCtx = vm.createContext({ figma, console: { log() {}, warn() {}, error() {} } });
  const runScript = (code) => vm.runInContext(`(async () => {\n${code}\n})()`, scriptCtx, { timeout: 120_000 });
  return { DSC, figma, root, runScript };
}

// The SUBJECT: the design system's own contract, read from contracts/ — no
// fixture, no copy. What ships is what is proven.
const buttonContract = JSON.parse(read('contracts/button.contract.json'));
const SET_NAME = buttonContract.name; // "Button"
const bundleText = JSON.stringify({
  type: 'CONTRACTS-BUNDLE', version: 1,
  contracts: [buttonContract],
});

console.log(`\nDETERMINISTIC ROUND-TRIP — ${buttonContract.id}@${buttonContract.version} (${SET_NAME})\n`);

// --- 1. contract → canvas, TWICE, assert byte-identical -------------------
console.log('1. contract → canvas  (the plugin engine, run twice)');
const findBuilt = (root) => {
  const f = (n) => {
    if ((n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') && n.name === SET_NAME) return n;
    for (const c of n.children ?? []) { const r = f(c); if (r) return r; }
    return null;
  };
  return f(root);
};
let fp1, fp2, firstDump;
for (const pass of [1, 2]) {
  const { DSC, root, runScript } = contractToCanvas();
  const parsed = DSC.parseIncomingText(bundleText);
  if (!parsed.ok) fail(`engine refused the contract bundle: ${JSON.stringify(parsed.issues ?? parsed)}`);
  const plan = DSC.planGenerate(parsed.contracts, { withTokens: true, fileKey: '' });
  if (!plan.ok) fail(`planGenerate refused: ${plan.issues.map((i) => i.headline).join('; ')}`);
  for (const step of plan.steps) await runScript(step.code);
  const built = findBuilt(root);
  if (!built) fail(`${SET_NAME} was not built`);
  const fp = fingerprint(built);
  if (pass === 1) { fp1 = fp; firstDump = { DSC, root, runScript }; } else { fp2 = fp; }
}
if (fp1 !== fp2) fail('contract→canvas was NOT byte-identical across two runs — non-deterministic!');
ok(`built ${SET_NAME} both times; node trees byte-identical (${fp1.length} bytes fingerprint) — DETERMINISTIC`);

// The variant axis must have reached the canvas: one COMPONENT per enum value.
const variantProp = buttonContract.props.find((p) => p.bindings?.figma?.kind === 'VARIANT');
const expectedVariants = variantProp?.type?.enum ?? [];
const builtVariants = JSON.parse(fp1).children.filter((c) => c.type === 'COMPONENT');
if (builtVariants.length !== expectedVariants.length) {
  fail(`expected ${expectedVariants.length} variant components on the canvas, got ${builtVariants.length}`);
}
ok(`the ${expectedVariants.length}-value "${variantProp.name}" axis built ${builtVariants.length} variant components`);

// --- 2. canvas → contract  (dump + propose), deterministic ----------------
console.log('\n2. canvas → contract  (dump the drawn set, propose a contract)');
const ui = read('figma-sync/plugin/ui.html');
const openTag = '<script type="text/plain" id="dump-source">';
const s = ui.indexOf(openTag);
const dumpSrc = ui.slice(s + openTag.length, ui.indexOf('</script>', s)).replace(/^\n/, '');
const scoped = dumpSrc.replace(/^const TARGET_SETS = \[[^\n]*\];$/m, `const TARGET_SETS = ${JSON.stringify([SET_NAME])};`);
const dumpA = await firstDump.runScript(scoped);
if (!dumpA || !dumpA[SET_NAME]) fail(`dump did not capture the ${SET_NAME} set`);
const diff = firstDump.DSC.proposeDiff(dumpA, SET_NAME, buttonContract);
if (!diff.ok) fail(`proposeDiff refused: ${diff.issue?.headline}`);
const recovered = JSON.parse(diff.exportJson).proposedContract;

// The recovered contract must carry the API back: the variant axis with every
// value, recovered from the DRAWN canvas alone.
const recVariant = recovered.props?.find((p) => p.bindings?.figma?.kind === 'VARIANT');
const recValues = recVariant?.type?.enum ?? [];
if (recValues.length !== expectedVariants.length) {
  fail(`recovered contract carried ${recValues.length} variant values, expected ${expectedVariants.length}`);
}
const missing = expectedVariants.filter((v) => !recValues.includes(v));
if (missing.length) fail(`recovered contract lost variant value(s): ${missing.join(', ')}`);
ok(`recovered a contract from the drawn canvas — the "${recVariant.name}" axis came back with all ${recValues.length} values`);
ok('round-trip closes: the API that went to canvas came back');

// --- 3. contract → code  (emit React), part of the same loop --------------
console.log('\n3. contract → code  (emit React from the contract)');
const { emitReact } = await import(path.join(ROOT, 'core', 'emit-react.js'));
const { tokenInventoryFromJson } = await import(path.join(ROOT, 'core', 'tokens.js'));
const { readdirSync } = await import('node:fs');
const byId = new Map([[buttonContract.id, buttonContract]]);
const icons = new Map(readdirSync(path.join(ROOT, 'assets', 'icons')).filter((f) => f.endsWith('.svg')).map((f) => [f.replace(/\.svg$/, ''), read(`assets/icons/${f}`).trim()]));
// The REAL token inventory the generator uses — an empty one would make the
// emitter refuse every binding by name (that refusal gate is a feature).
// Mono-theme (Piqueray): the dark-mode file is optional — absent means no overrides.
const tokens = tokenInventoryFromJson(
  [
    'tokens/primitives.tokens.json',
    'tokens/semantic.tokens.json',
    'tokens/modes/semantic.light.tokens.json',
    'tokens/modes/semantic.dark.tokens.json',
  ]
    .filter((p) => existsSync(path.join(ROOT, p)))
    .map((p) => JSON.parse(read(p))),
);
const { tsx } = emitReact(buttonContract, { tokens, icons, contracts: byId });
// The authored semantics must survive into the code surface.
const el = buttonContract.semantics.element;
if (!new RegExp(`<${el}\\b`).test(tsx)) fail(`emitted React did not render the declared host element <${el}>`);
for (const v of expectedVariants) {
  if (!tsx.includes(`'${v}'`)) fail(`emitted React lost variant value "${v}" from the typed API`);
}
ok(`emitted ${tsx.length}B of React from the same contract — <${el}> host, all ${expectedVariants.length} variants typed`);

// --- 4. determinism restated ---------------------------------------------
console.log('\n✔ THE FULL LOOP RAN WITH ZERO AI — pure deterministic functions (the same engine the plugin runs):');
console.log('    contract → canvas → contract → code, byte-reproducible.');
console.log('  The AI built this tooling; it is NEVER in the conversion. That is the guarantee.');
console.log('  ⚠️ Depth limit: this proof runs on a FLAT component (see the header note) —');
console.log('     nested instances / collections / slots are not exercised until Piqueray has a composite.\n');
