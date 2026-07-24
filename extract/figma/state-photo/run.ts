/**
 * PAGE-STATE PHOTOGRAPHY — canvas-vs-itself-over-time proof for the 9
 * mockup pages (E6, research D7). Composed entirely of existing primitives:
 * `fetchNodePngs` (visual-parity/figma-api.ts — any node, cache keyed by
 * node + FILE VERSION) and `img.ts`'s `alignPair`/`diffPair`/`writeTriptych`.
 * No new tolerance: reuses visual-parity's THRESHOLD_PCT verbatim.
 *
 *   npx tsx extract/figma/state-photo/run.ts capture <label> [--refresh]
 *   npx tsx extract/figma/state-photo/run.ts compare <labelA> <labelB>
 *
 * `capture` discovers the 9 page frames FRESH each time (never a hardcoded
 * list — the frame set is measured, not assumed) via one REST call
 * (`GET /v1/files/:key?depth=2`), then fetches a scale-2 PNG per frame,
 * and writes a labeled manifest under out/snapshots/ (gitignored — a
 * manifest is only a pointer into the version-keyed PNG cache, both
 * regenerable from Figma at any time).
 *
 * `compare` diffs two labeled manifests frame-by-frame (matched by node id,
 * the stable identity — a frame missing from either side is a NAMED finding,
 * never a silent drop) and writes a committed score report; any page over
 * THRESHOLD_PCT keeps its triptych under report-assets/ as evidence.
 *
 * Honesty (spec assumption, D7): a manifest captured WITHOUT --refresh
 * reuses the last-seen file version — correct for "nothing changed since
 * last capture", wrong for "prove state after a Figma edit". Every
 * meaningful checkpoint (quickstart.md Steps 0 and 3) MUST pass --refresh.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fetchNodePngs } from '../visual-parity/figma-api.js';
import { alignPair, diffPair, readPng, writeTriptych } from '../visual-parity/img.js';
import { THRESHOLD_PCT } from '../visual-parity/tolerance.js';
import { figmaToken } from '../../fidelity-matrix/scripts/env.js';

const HERE = path.resolve(new URL('.', import.meta.url).pathname);
const OUT = path.join(HERE, 'out'); // gitignored
const CACHE = path.join(OUT, '_cache');
const SNAPSHOTS = path.join(OUT, 'snapshots');
const ASSETS = path.join(HERE, 'report-assets'); // committed
const REPORTS = path.join(HERE, 'reports'); // committed

const FILE_KEY = 'd9FYAUcqdcNtsuaMgLefvJ'; // Piqueray (Copy)
const PAGE_NAME = 'Pages'; // the canvas page holding the 9 mockup frames
/** Namespaces the PNG cache filenames — not a real Figma set id, just a
 *  stable key so fetchNodePngs' cache path stays unambiguous. */
const CACHE_NS = 'pages';

interface FrameInfo {
  nodeId: string;
  name: string;
}

interface FileFramesResult {
  version: string;
  frames: FrameInfo[];
}

/** One REST call (files?depth=2): version + every canvas page's direct FRAME
 *  children. Cached by fileKey (NOT by version — refresh to pick up a new
 *  one), mirroring figma-api.ts's fetchSetInfos convention exactly. */
async function fetchPagesFrames(refresh: boolean): Promise<FileFramesResult> {
  mkdirSync(CACHE, { recursive: true });
  const cachePath = path.join(CACHE, `file-depth2-${FILE_KEY}.json`);
  if (refresh || !existsSync(cachePath)) {
    const url = `https://api.figma.com/v1/files/${FILE_KEY}?depth=2`;
    const res = await fetch(url, { headers: { 'X-Figma-Token': figmaToken() } });
    if (!res.ok) throw new Error(`files API ${res.status} for file ${FILE_KEY}`);
    const body = await res.text();
    writeFileSync(cachePath, body);
  }
  const body = JSON.parse(readFileSync(cachePath, 'utf8')) as {
    version: string;
    document: { children: Array<{ id: string; name: string; type: string; children?: Array<{ id: string; name: string; type: string }> }> };
  };
  const page = body.document.children.find((p) => p.name === PAGE_NAME);
  if (!page) throw new Error(`canvas page "${PAGE_NAME}" not found in file ${FILE_KEY} — renamed? re-run with --refresh`);
  const frames = (page.children ?? [])
    .filter((c) => c.type === 'FRAME')
    .map((c) => ({ nodeId: c.id, name: c.name }));
  if (frames.length === 0) throw new Error(`canvas page "${PAGE_NAME}" has zero FRAME children — nothing to photograph`);
  return { version: body.version, frames };
}

interface Manifest {
  label: string;
  capturedAt: string;
  fileVersion: string;
  frames: Array<{ nodeId: string; name: string; png: string | null }>;
}

async function capture(label: string, refresh: boolean): Promise<void> {
  mkdirSync(SNAPSHOTS, { recursive: true });
  if (!refresh) {
    console.log('  (no --refresh: reusing the last-seen file version — pass --refresh to prove a POST-EDIT state)');
  }
  const { version, frames } = await fetchPagesFrames(refresh);
  console.log(`file v${version}: ${frames.length} page frame(s)`);
  // ONE node per images-API call, not fetchNodePngs' usual 30-per-call batch:
  // these mockup frames are full pages (up to ~6700px tall) — requesting
  // several at once makes Figma's render backend hang past 2 minutes with
  // no response at all (measured live); one at a time renders in ~0.5-1.5s
  // each. Same disk cache, same version-keyed filenames — just called once
  // per frame instead of once for the whole set.
  const pngs = new Map<string, string | null>();
  for (const f of frames) {
    const got = await fetchNodePngs(CACHE, FILE_KEY, CACHE_NS, version, [f.nodeId]);
    pngs.set(f.nodeId, got.get(f.nodeId) ?? null);
  }
  const manifest: Manifest = {
    label,
    capturedAt: new Date().toISOString(),
    fileVersion: version,
    frames: frames.map((f) => ({ nodeId: f.nodeId, name: f.name, png: pngs.get(f.nodeId) ?? null })),
  };
  for (const f of manifest.frames) {
    console.log(`  ${f.png ? '✔' : '✗ DECLINED'} ${f.name} (${f.nodeId})`);
  }
  const declined = manifest.frames.filter((f) => !f.png);
  if (declined.length > 0) {
    console.log(`  ${declined.length} frame(s) declined by the images API — named above, not silently dropped`);
  }
  writeFileSync(path.join(SNAPSHOTS, `${label}.json`), JSON.stringify(manifest, null, 1));
  console.log(`captured "${label}" → ${path.relative(process.cwd(), path.join(SNAPSHOTS, `${label}.json`))}`);
}

interface CompareRow {
  name: string;
  nodeId: string;
  status: 'diffed' | 'missing-before' | 'missing-after' | 'declined-before' | 'declined-after';
  scorePct?: number;
  sizeA?: string;
  sizeB?: string;
  triptych?: string;
}

function loadManifest(label: string): Manifest {
  const p = path.join(SNAPSHOTS, `${label}.json`);
  if (!existsSync(p)) throw new Error(`no snapshot for label "${label}" — run: capture ${label} --refresh`);
  return JSON.parse(readFileSync(p, 'utf8')) as Manifest;
}

async function compare(labelA: string, labelB: string): Promise<void> {
  const a = loadManifest(labelA);
  const b = loadManifest(labelB);
  const byIdA = new Map(a.frames.map((f) => [f.nodeId, f]));
  const byIdB = new Map(b.frames.map((f) => [f.nodeId, f]));
  const allIds = new Set([...byIdA.keys(), ...byIdB.keys()]);

  mkdirSync(ASSETS, { recursive: true });
  mkdirSync(REPORTS, { recursive: true });
  const rows: CompareRow[] = [];

  for (const nodeId of allIds) {
    const fa = byIdA.get(nodeId);
    const fb = byIdB.get(nodeId);
    if (!fa) {
      rows.push({ name: fb!.name, nodeId, status: 'missing-before' });
      continue;
    }
    if (!fb) {
      rows.push({ name: fa.name, nodeId, status: 'missing-after' });
      continue;
    }
    if (!fa.png) {
      rows.push({ name: fa.name, nodeId, status: 'declined-before' });
      continue;
    }
    if (!fb.png) {
      rows.push({ name: fb.name, nodeId, status: 'declined-after' });
      continue;
    }
    const aligned = alignPair(readPng(fa.png), readPng(fb.png));
    // Both sides are Figma's OWN renderer at two points in time — no
    // cross-renderer text-rasterization delta to mask (unlike visual-parity's
    // code-vs-Figma comparison), so an empty text-rect list makes the
    // "masked" and "unmasked" scores identical; we report the one score.
    const diff = diffPair(aligned, []);
    const row: CompareRow = {
      name: fa.name,
      nodeId,
      status: 'diffed',
      scorePct: diff.unmaskedPct,
      sizeA: `${aligned.aContent.width}×${aligned.aContent.height}`,
      sizeB: `${aligned.bContent.width}×${aligned.bContent.height}`,
    };
    if (diff.unmaskedPct > THRESHOLD_PCT) {
      const triptychPath = path.join(ASSETS, `${labelA}-vs-${labelB}--${nodeId.replace(/[:;]/g, '_')}.triptych.png`);
      writeTriptych(triptychPath, aligned, diff.diff);
      row.triptych = path.relative(HERE, triptychPath);
    }
    rows.push(row);
  }

  const diffed = rows.filter((r) => r.status === 'diffed');
  const problem = rows.filter((r) => r.status !== 'diffed');
  const over = diffed.filter((r) => (r.scorePct ?? 0) > THRESHOLD_PCT);
  const worstFirst = [...diffed].sort((x, y) => (y.scorePct ?? 0) - (x.scorePct ?? 0));

  const md = `# Page-state photography — ${labelA} vs ${labelB}

Generated by \`extract/figma/state-photo/run.ts compare\`. Threshold (reused from
visual-parity, no new tolerance): **${THRESHOLD_PCT}%**. Pages matched by node id
(stable identity) — a page missing from either side is a named row, never a
silent drop.

## Pages (worst-first)

| page | score | size before vs after | verdict | triptych |
|---|---|---|---|---|
${worstFirst.map((r) => `| ${r.name} (${r.nodeId}) | ${r.scorePct!.toFixed(3)}% | ${r.sizeA} vs ${r.sizeB} | ${(r.scorePct ?? 0) <= THRESHOLD_PCT ? 'within' : '**OVER**'} | ${r.triptych ?? '—'} |`).join('\n')}

## Not diffed (named, never dropped)

${problem.length === 0 ? '_none_' : `| page | node id | status |\n|---|---|---|\n${problem.map((r) => `| ${r.name} | ${r.nodeId} | ${r.status} |`).join('\n')}`}

## Verdict

- diffed: ${diffed.length} · not diffed: ${problem.length}
- over ${THRESHOLD_PCT}%: **${over.length}**${over.length > 0 ? ` — ${over.map((r) => r.name).join(', ')}` : ' — none'}
- ${over.length === 0 && problem.length === 0 ? 'ALL PAGES IDENTICAL WITHIN TOLERANCE' : 'residue present — review triptychs above; any accepted delta must be named explicitly by the owner, per SC-003'}
`;
  const reportPath = path.join(REPORTS, `${labelA}-vs-${labelB}.md`);
  writeFileSync(reportPath, md);
  console.log(`\n${diffed.length} diffed, ${problem.length} not-diffed, ${over.length} over ${THRESHOLD_PCT}%`);
  console.log(`report → ${path.relative(process.cwd(), reportPath)}`);
  if (over.length > 0 || problem.length > 0) process.exitCode = 1;
}

async function main(): Promise<void> {
  const [cmd, ...rest] = process.argv.slice(2);
  const refresh = rest.includes('--refresh');
  const positional = rest.filter((a) => !a.startsWith('--'));
  if (cmd === 'capture') {
    const [label] = positional;
    if (!label) throw new Error('usage: capture <label> [--refresh]');
    await capture(label, refresh);
  } else if (cmd === 'compare') {
    const [labelA, labelB] = positional;
    if (!labelA || !labelB) throw new Error('usage: compare <labelA> <labelB>');
    await compare(labelA, labelB);
  } else {
    throw new Error(`usage: capture <label> [--refresh] | compare <labelA> <labelB> (got "${cmd ?? ''}")`);
  }
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
