// Minimal MCP stdio client for figma-console-mcp's `figma_execute` tool.
// Spawns the figma-console MCP server as a child process, performs the MCP
// handshake (initialize / notifications/initialized), calls figma_execute,
// prints the tool's text result, and exits.
//
// Why: opencode (this session) does not have the figma-console MCP registered.
// Rather than editing opencode.json + requiring a restart, we talk to the
// stdio MCP server directly from Node.
//
// Usage:  node figma-exec.mjs <timeoutMs> '<code>'
//         echo '<code>' | node figma-exec.mjs <timeoutMs>
//
// Env: FIGMA_BRIDGE_PORT (optional) — if the existing desktop bridge is on a
//      non-default port, set this so the spawned MCP server finds the plugin.
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const TIMEOUT = Number(process.argv[2] || 10000);
const codeArg = process.argv[3];
const stdinCode = await new Promise((res) => {
  if (process.stdin.isTTY) return res(null);
  let buf = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (d) => (buf += d));
  process.stdin.on('end', () => res(buf));
  setTimeout(() => res(buf || null), 200);
});
const code = stdinCode || codeArg;
if (!code) {
  console.error('usage: node figma-exec.mjs <timeoutMs> "<code>"  |  echo "<code>" | node figma-exec.mjs <timeoutMs>');
  process.exit(2);
}

const env = {
  ...process.env,
  // Prefer the already-running desktop bridge ports.
  FIGMA_PORT: process.env.FIGMA_BRIDGE_PORT || '9223',
};

const child = spawn('npx', ['-y', 'figma-console-mcp@latest'], {
  env,
  stdio: ['pipe', 'pipe', 'inherit'],
});

let buffer = '';
const pending = new Map();
const waiters = new Map();

function send(obj) {
  const line = JSON.stringify(obj) + '\n';
  child.stdin.write(line);
}

function call(method, params) {
  const id = randomUUID();
  return new Promise((resolve, reject) => {
    waiters.set(id, { resolve, reject });
    send({ jsonrpc: '2.0', id, method, params });
  });
}

child.stdout.on('data', (chunk) => {
  buffer += chunk.toString();
  let idx;
  while ((idx = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, idx);
    buffer = buffer.slice(idx + 1);
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.id && waiters.has(msg.id)) {
      const w = waiters.get(msg.id);
      waiters.delete(msg.id);
      if (msg.error) w.reject(new Error(JSON.stringify(msg.error)));
      else w.resolve(msg.result);
    }
  }
});

child.on('error', (e) => { console.error('spawn error:', e.message); process.exit(1); });
const spawnTimeout = setTimeout(() => { console.error('figma-exec: timed out'); try { child.kill('SIGKILL'); } catch {} process.exit(1); }, TIMEOUT + 15000);

try {
  await call('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'figma-exec', version: '1.0.0' },
  });
  send({ jsonrpc: '2.0', method: 'notifications/initialized' });
  const result = await call('tools/call', {
    name: 'figma_execute',
    arguments: { code, timeout: Math.min(TIMEOUT, 30000) },
  });
  clearTimeout(spawnTimeout);
  if (result && Array.isArray(result.content)) {
    for (const part of result.content) {
      if (part.type === 'text') console.log(part.text);
      else console.log(JSON.stringify(part));
    }
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
  child.kill('SIGTERM');
  process.exit(0);
} catch (e) {
  clearTimeout(spawnTimeout);
  console.error('figma-exec call failed:', e.message);
  try { child.kill('SIGKILL'); } catch {}
  process.exit(1);
}