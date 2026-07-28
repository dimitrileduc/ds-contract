/** Deterministic promotion of Figma-exported SVG bytes to governed vector
 * assets. This module is deliberately independent of Figma and the contract
 * proposer: bytes in, normalized source files + hashes out. */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { DumpFile, DumpNode } from './types.js';

const DRAWABLE = /<(path|circle|rect|polygon|ellipse|line|polyline|text)\b/gi;
const PAINT_ATTR = /(\s(?:fill|stroke)=")([^"]*)(")/gi;

function canonicalPaint(value: string): string {
  const v = value.trim().toLowerCase();
  if (v === 'currentcolor') return 'currentcolor';
  if (v === 'white') return '#ffffff';
  if (v === 'black') return '#000000';
  if (/^#[0-9a-f]{3}$/.test(v)) return `#${v.slice(1).split('').map((x) => x + x).join('')}`;
  if (/^#[0-9a-f]{6}$/.test(v)) return v;
  return v;
}

function isSolidPaint(value: string): boolean {
  const v = canonicalPaint(value);
  return v === 'currentcolor' || /^#[0-9a-f]{6}$/.test(v);
}

/** Normalize static monochrome paints to currentColor without touching the
 * exported geometry, viewBox, groups, masks, or dimensions. */
export function normalizeVectorSvg(source: string): { svg: string; drawableCount: number; sha256: string } {
  const input = source.trim();
  if (!input || !/<svg\b/i.test(input)) throw new Error('SVG promotion refused: missing <svg> root');
  const drawableCount = input.match(DRAWABLE)?.length ?? 0;
  if (drawableCount === 0) throw new Error('SVG promotion refused: no drawable vector geometry');

  const paints: string[] = [];
  for (const match of input.matchAll(PAINT_ATTR)) {
    const value = match[2];
    if (canonicalPaint(value) === 'none') continue;
    if (!isSolidPaint(value)) throw new Error(`SVG promotion refused: non-solid paint "${value}"`);
    paints.push(canonicalPaint(value));
  }
  if (paints.length === 0) throw new Error('SVG promotion refused: no explicit solid paint');
  if (new Set(paints).size !== 1) throw new Error('SVG promotion refused: mixed monochrome paints');

  const svg = input.replace(PAINT_ATTR, (_all, prefix: string, value: string, suffix: string) => {
    if (canonicalPaint(value) === 'none') return `${prefix}${value}${suffix}`;
    return `${prefix}currentColor${suffix}`;
  }) + '\n';
  const sha256 = createHash('sha256').update(svg, 'utf8').digest('hex');
  return { svg, drawableCount, sha256 };
}

interface VectorOccurrence {
  asset: string;
  base64?: string;
  path: string;
}

function collectNode(node: DumpNode, nodePath: string, out: VectorOccurrence[]): void {
  if (node.vectorAsset) {
    out.push({ asset: node.vectorAsset.asset, base64: node.vectorAsset.svgBase64, path: nodePath });
  }
  for (const child of node.children ?? []) collectNode(child, `${nodePath}/${child.name}`, out);
}

function collectOccurrences(dump: DumpFile): VectorOccurrence[] {
  const out: VectorOccurrence[] = [];
  for (const [setName, value] of Object.entries(dump)) {
    if (setName === '_provenance' || !value || typeof value !== 'object' || !Array.isArray((value as { variants?: unknown }).variants)) continue;
    for (const variant of (value as { variants: DumpNode[] }).variants) collectNode(variant, `${setName}:${variant.name}`, out);
  }
  return out;
}

export interface PromotedVectorAsset {
  asset: string;
  sha256: string;
  bytes: number;
  drawableCount: number;
  occurrences: string[];
}

/** Promote all captured vector assets atomically by validating every occurrence
 * first, then writing the normalized bytes. Existing differing files refuse;
 * identical files are idempotent. */
export function promoteVectorAssets(dump: DumpFile, assetsDir: string): PromotedVectorAsset[] {
  const occurrences = collectOccurrences(dump);
  const byAsset = new Map<string, VectorOccurrence[]>();
  for (const occurrence of occurrences) {
    const list = byAsset.get(occurrence.asset) ?? [];
    list.push(occurrence);
    byAsset.set(occurrence.asset, list);
  }

  const promoted: PromotedVectorAsset[] = [];
  const pending: Array<{ target: string; svg: string; receipt: PromotedVectorAsset }> = [];
  for (const [asset, records] of byAsset) {
    const normalized = records.map((record) => {
      if (!record.base64) throw new Error(`${record.path}: vector asset "${asset}" has no svgBase64 capture`);
      let source: string;
      try { source = Buffer.from(record.base64, 'base64').toString('utf8'); } catch { throw new Error(`${record.path}: invalid svgBase64 for "${asset}"`); }
      return normalizeVectorSvg(source);
    });
    const first = normalized[0];
    if (normalized.some((value) => value.svg !== first.svg)) {
      throw new Error(`vector asset "${asset}" has different geometry across captured occurrences`);
    }
    const receipt = {
      asset,
      sha256: first.sha256,
      bytes: Buffer.byteLength(first.svg, 'utf8'),
      drawableCount: first.drawableCount,
      occurrences: records.map((record) => record.path).sort(),
    };
    promoted.push(receipt);
    pending.push({ target: path.join(assetsDir, `${asset}.svg`), svg: first.svg, receipt });
  }

  mkdirSync(assetsDir, { recursive: true });
  for (const { target, svg } of pending) {
    if (existsSync(target) && readFileSync(target, 'utf8') !== svg) {
      throw new Error(`refusing to overwrite differing governed vector asset: ${target}`);
    }
  }
  for (const { target, svg } of pending) writeFileSync(target, svg);
  return promoted.sort((a, b) => a.asset.localeCompare(b.asset));
}
