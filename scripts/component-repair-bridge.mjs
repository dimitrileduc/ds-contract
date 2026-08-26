#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const args = process.argv.slice(2);
const take = (name) => {
  const index = args.indexOf(name);
  if (index < 0) return null;
  const value = args[index + 1];
  args.splice(index, 2);
  return value;
};
const scriptPath = take('--script');
const outputPath = take('--output');
const fileKey = take('--file-key');
const waitMs = Number(take('--wait-ms') ?? '30000');
if (!scriptPath || !outputPath || !fileKey || args.length !== 0) {
  throw new Error('Usage: component-repair-bridge --script <bridge.js> --output <raw.json> --file-key <key> [--wait-ms <milliseconds>]');
}
if (!Number.isFinite(waitMs) || waitMs < 0 || waitMs > 120000) throw new Error('--wait-ms must be between 0 and 120000');

const child = spawn('npx', ['--yes', 'figma-console-mcp@latest'], {
  cwd: process.cwd(),
  env: process.env,
  stdio: ['pipe', 'pipe', 'inherit'],
});
const lines = readline.createInterface({ input: child.stdout });
let nextId = 1;
const waiting = new Map();
lines.on('line', (line) => {
  let message;
  try { message = JSON.parse(line); } catch { return; }
  if (message.id === undefined) return;
  const pending = waiting.get(message.id);
  if (!pending) return;
  waiting.delete(message.id);
  if (message.error) pending.reject(new Error(JSON.stringify(message.error)));
  else pending.resolve(message.result);
});
const request = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  waiting.set(id, { resolve, reject });
  child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`);
});
const notify = (method, params = {}) => child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method, params })}\n`);

try {
  await request('initialize', {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'component-repair-bridge', version: '1.0.0' },
  });
  notify('notifications/initialized');
  const deadline = Date.now() + waitMs;
  let connection = null;
  let lastStatusText = '';
  do {
    const status = await request('tools/call', { name: 'figma_get_status', arguments: { probe: true } });
    lastStatusText = status?.content?.find((entry) => entry.type === 'text')?.text ?? '';
    try {
      const parsed = JSON.parse(lastStatusText);
      const files = parsed?.transport?.websocket?.connectedFiles ?? [];
      const target = files.find((entry) => entry.fileKey === fileKey);
      if (parsed?.setup?.valid === true && parsed?.setup?.probeResult?.success === true && target) connection = target;
    } catch { /* Keep polling; final error includes the raw status. */ }
    if (!connection && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 1000));
  } while (!connection && Date.now() < deadline);
  if (!connection) {
    throw new Error(`Desktop Bridge has no live connection to ${fileKey}: ${lastStatusText.slice(0, 800)}`);
  }
  const code = readFileSync(path.resolve(scriptPath), 'utf8');
  const result = await request('tools/call', {
    name: 'figma_execute',
    arguments: { code, timeout: 30000, fileKey },
  });
  if (result?.isError) throw new Error(JSON.stringify(result));
  const text = result?.content?.find((entry) => entry.type === 'text')?.text;
  if (typeof text !== 'string') throw new Error('figma_execute returned no text envelope');
  const outer = JSON.parse(text);
  if (outer.success !== true || outer.error) throw new Error(outer.error || 'figma_execute failed');
  const envelope = outer.result;
  if (!envelope || typeof envelope !== 'object') throw new Error('figma_execute returned no bridge envelope');
  const outputRoot = process.cwd();
  const responsiveImages = Array.isArray(envelope.responsiveImages) ? envelope.responsiveImages : [];
  const scenarioChecks = Array.isArray(envelope.inspection?.scenarioChecks) ? envelope.inspection.scenarioChecks : [];
  const imagePaths = new Set(responsiveImages.map((image) => image?.path).filter((value) => typeof value === 'string'));
  for (const scenario of scenarioChecks) {
    if (!scenario || typeof scenario.scenarioId !== 'string' || typeof scenario.selectedPresentation !== 'string' ||
      typeof scenario.captureRef !== 'string' || !imagePaths.has(scenario.captureRef)) {
      throw new Error('responsive scenario envelope lost its explicit presentation or capture payload');
    }
  }
  for (const field of ['bindingFacts', 'typographyFacts', 'memberFacts', 'childWrites']) {
    if (envelope.inspection?.[field] !== undefined && !Array.isArray(envelope.inspection[field])) {
      throw new Error(`responsive bridge inspection field is not lossless: ${field}`);
    }
  }
  for (const image of responsiveImages) {
    if (!image || typeof image.path !== 'string' || typeof image.base64 !== 'string') throw new Error('invalid responsive image payload');
    const absoluteImagePath = path.resolve(outputRoot, image.path);
    const relativeImagePath = path.relative(outputRoot, absoluteImagePath);
    if (relativeImagePath.startsWith('..') || path.isAbsolute(relativeImagePath)) throw new Error(`responsive image escapes workspace: ${image.path}`);
    mkdirSync(path.dirname(absoluteImagePath), { recursive: true });
    writeFileSync(absoluteImagePath, Buffer.from(image.base64, 'base64'));
  }
  delete envelope.responsiveImages;
  mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
  writeFileSync(path.resolve(outputPath), `${JSON.stringify(envelope, null, 2)}\n`);
  console.log(`component repair Bridge executed — ${envelope.run}, ${envelope.scriptResults?.length ?? 0} result(s), ${responsiveImages.length} responsive capture(s), ${outputPath}`);
} finally {
  child.stdin.end();
  child.kill('SIGTERM');
}
