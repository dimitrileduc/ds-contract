/**
 * report.ts — the report writer for the page-parity instrument (spec 003,
 * T013). Turns compareEntry() results into the committed proof artifacts:
 * verdict.json (byte-deterministic, machine-readable), verdict.md (French,
 * owner-readable) and crops/<maquette>.png (triptychs, diff entries only).
 *
 * WHY the statutGlobal/exitCode precedence logic lives HERE, not in cli.ts:
 * the pinned interface's "exit-code precedence" rule groups capture-failed,
 * dimension-mismatch AND zero-entries under ONE outcome ("any of these ->
 * exit 2, refus — never identical"). That rule is naturally computed from
 * the totals this file already assembles while writing verdict.json, so
 * cli.ts can stay a thin argv/fs/exit shell that trusts this single source
 * of truth for the verdict rather than re-deriving the same precedence
 * twice. In particular: an EMPTY entries[] is deliberately NOT treated as
 * "0 diffs found -> identical" — a compare over nothing must never pass
 * (contracts/page-proof.md, R12).
 *
 * WHY crops are built HERE, not in compare.ts: cropping needs the OUT dir,
 * and compare.ts is fs-write-free by contract (it only reads). The 24px
 * pad-and-clamp is itself a REPORTING concern, not a comparison one —
 * compare.ts hands back full-frame PNGs precisely so this file can crop
 * once, at write time, without re-reading anything from disk.
 *
 * Byte-determinism (pinned): verdict.json and verdict.md are PURE functions
 * of `entries` — no Date.now(), no process.hrtime, no absolute paths, no
 * versions. Two writeReport() calls over the same `entries` must produce
 * byte-identical files (selftest case 5 asserts this via Buffer.equals).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { writeTriptych, type Aligned } from '../visual-parity/img.js';
import type { CompareEntryResult, DiffBox, PixelVerdict, Region } from './compare.js';

/** Margin added around a diffBox before cropping, clamped to the frame's own bounds (pinned interface). */
const CROP_PAD = 24;

export interface Totaux {
  identical: number;
  diff: number;
  captureFailed: number;
  dimensionMismatch: number;
}

export type StatutGlobal = 'identical' | 'diff' | 'refus';

/** Exact shape of verdict.json (specs/003-externalize-figma-components/contracts/page-proof.md). Field order = on-disk key order. */
export interface VerdictDocument {
  statutGlobal: StatutGlobal;
  exitCode: 0 | 1 | 2;
  totaux: Totaux;
  maquettes: PixelVerdict[];
}

// ---------------------------------------------------------------------------
// Cropping — raw byte copy, never resampled (a proof artifact must show
// exactly the captured pixels, not a filtered/interpolated approximation).
// ---------------------------------------------------------------------------

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function cropPng(src: PNG, rect: Rect): PNG {
  const dst = new PNG({ width: rect.w, height: rect.h });
  PNG.bitblt(src, dst, rect.x, rect.y, rect.w, rect.h, 0, 0);
  return dst;
}

/**
 * diffBox padded CROP_PAD px on every side, clamped to the frame's own
 * bounds. This is NOT alignment/normalization (forbidden by R2 — see
 * compare.ts's header) — it is bounds-safety for a fixed rectangle whose
 * origin already came from real pixels in this exact coordinate space.
 */
function paddedCrop(box: DiffBox, imgWidth: number, imgHeight: number): Rect {
  const x0 = Math.max(0, box.x - CROP_PAD);
  const y0 = Math.max(0, box.y - CROP_PAD);
  const x1 = Math.min(imgWidth, box.x + box.w + CROP_PAD);
  const y1 = Math.min(imgHeight, box.y + box.h + CROP_PAD);
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/**
 * spec 006 (contracts/region-proof.md §3): "le triptyque cadre région ∪
 * diffBox padded — pour montrer le bloc, pas une lamelle de 24px". Union of
 * the two rectangles, THEN clamped to the frame's own bounds — never a second
 * alignment/normalization (R2), just a wider fixed window on the same pixels.
 */
function unionRect(a: Rect, b: Rect, imgWidth: number, imgHeight: number): Rect {
  const x0 = Math.max(0, Math.min(a.x, b.x));
  const y0 = Math.max(0, Math.min(a.y, b.y));
  const x1 = Math.min(imgWidth, Math.max(a.x + a.w, b.x + b.w));
  const y1 = Math.min(imgHeight, Math.max(a.y + a.h, b.y + b.h));
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/**
 * Writes crops/<maquette>.png for every "diff" entry and stamps
 * verdict.cropTriptyque with the relative path once the file exists.
 * Mutates the verdict objects in place (they still live inside `entries`,
 * which the caller sorts into `maquettes` right after this returns) —
 * matches the pinned interface, which defines cropTriptyque as "the
 * relative path … once written", not a field compare.ts could ever fill in.
 */
function writeCrops(outDir: string, entries: CompareEntryResult[]): void {
  const diffEntries = entries.filter((e) => e.verdict.status === 'diff');
  if (diffEntries.length === 0) return;

  mkdirSync(path.join(outDir, 'crops'), { recursive: true });

  for (const entry of diffEntries) {
    const { verdict, images } = entry;
    if (!images || !verdict.diffBox) {
      // Invariant violation, not a domain refusal: compareEntry() promises
      // images + diffBox together whenever status is "diff" (see its
      // header). Throwing loudly beats silently skipping or writing a
      // bogus crop — silent omission is the worst bug class in this repo.
      throw new Error(
        `page-parity/report: entrée "diff" sans images/diffBox pour "${verdict.maquette}" — invariant de compareEntry violé`,
      );
    }
    let rect = paddedCrop(verdict.diffBox, images.before.width, images.before.height);
    if (verdict.region) {
      rect = unionRect(rect, verdict.region, images.before.width, images.before.height);
    }
    const aligned: Aligned = {
      a: cropPng(images.before, rect),
      b: cropPng(images.after, rect),
      width: rect.w,
      height: rect.h,
      // Hand-built per the pinned interface (R2): these fields exist only
      // to satisfy Aligned's shape. writeTriptych itself only reads
      // {a, b, width, height} — aContent/bContent/aOffset/aTrimOrigin are
      // consumed by alignPair's own mask-transform math, which we never
      // call here (see compare.ts's header for why).
      aContent: { width: rect.w, height: rect.h },
      bContent: { width: rect.w, height: rect.h },
      aOffset: { x: 0, y: 0 },
      aTrimOrigin: { x: 0, y: 0 },
    };
    const relPath = `crops/${verdict.maquette}.png`;
    writeTriptych(path.join(outDir, relPath), aligned, cropPng(images.diff, rect));
    verdict.cropTriptyque = relPath;
  }
}

// ---------------------------------------------------------------------------
// Totals + global precedence.
// ---------------------------------------------------------------------------

function computeTotaux(entries: CompareEntryResult[]): Totaux {
  const totaux: Totaux = { identical: 0, diff: 0, captureFailed: 0, dimensionMismatch: 0 };
  for (const { verdict } of entries) {
    switch (verdict.status) {
      case 'identical':
        totaux.identical++;
        break;
      case 'diff':
        totaux.diff++;
        break;
      case 'capture-failed':
        totaux.captureFailed++;
        break;
      case 'dimension-mismatch':
        totaux.dimensionMismatch++;
        break;
    }
  }
  return totaux;
}

/** Exit-code precedence (pinned interface): refus beats diff beats identical; zero entries is ALWAYS a refus. */
function computeGlobal(totaux: Totaux, entryCount: number): { statutGlobal: StatutGlobal; exitCode: 0 | 1 | 2 } {
  if (entryCount === 0) return { statutGlobal: 'refus', exitCode: 2 };
  if (totaux.captureFailed > 0 || totaux.dimensionMismatch > 0) return { statutGlobal: 'refus', exitCode: 2 };
  if (totaux.diff > 0) return { statutGlobal: 'diff', exitCode: 1 };
  return { statutGlobal: 'identical', exitCode: 0 };
}

/**
 * "maquettes sorted by plain JS .sort() on the maquette string" (pinned
 * interface) — default Array.prototype.sort() coerces to string and
 * compares UTF-16 code units, exactly what `<`/`>` on two strings already
 * do; this comparator is that behavior applied through the `.maquette` key.
 */
function compareMaquette(a: PixelVerdict, b: PixelVerdict): number {
  if (a.maquette < b.maquette) return -1;
  if (a.maquette > b.maquette) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// verdict.md — French, owner-readable, byte-stable (pure function of doc).
// ---------------------------------------------------------------------------

function fmtDiffBox(box: DiffBox | null): string {
  return box ? `x=${box.x}, y=${box.y}, w=${box.w}, h=${box.h}` : '—';
}

function fmtRegion(region: Region | undefined): string {
  return region ? `x=${region.x}, y=${region.y}, w=${region.w}, h=${region.h}` : '—';
}

/** Minimal markdown-table escaping — a maquette name or refus reason with a literal "|" must not break the table. */
function mdCell(s: string): string {
  return s.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function renderMarkdown(doc: VerdictDocument): string {
  const lines: string[] = [];
  lines.push('# Verdict de parité pixel — page-parity');
  lines.push('');
  lines.push(`**Statut global** : ${doc.statutGlobal}`);
  lines.push(`**Code de sortie** : ${doc.exitCode}`);
  lines.push('');

  if (doc.maquettes.length === 0) {
    // Exact reason string from the pinned interface (contracts/page-proof.md
    // §3 / T012-T014 brief) — kept verbatim so it stays grep-able across
    // verdict.md, verdict.json's absence of any "reason" field, and cli.ts's
    // stderr output.
    lines.push('Refus : aucune entree - rien a prouver (0 maquette comparée).');
    lines.push('');
  }

  // spec 006 (contracts/region-proof.md §3): the 4 region columns appear ONLY
  // if at least one entry carries a region — otherwise this table (and the
  // whole file) stays byte-identical to the pre-006 output.
  const anyRegion = doc.maquettes.some((m) => m.region !== undefined);
  if (anyRegion) {
    lines.push('| Maquette | Statut | diffCount | diffBox | region | regionDiffCount | regionPct | outsideDiffCount | Refus |');
    lines.push('|---|---|---|---|---|---|---|---|---|');
    for (const m of doc.maquettes) {
      lines.push(
        `| ${mdCell(m.maquette)} | ${m.status} | ${m.diffCount} | ${fmtDiffBox(m.diffBox)} | ${fmtRegion(m.region)} | ` +
          `${m.regionDiffCount ?? '—'} | ${m.regionPct !== undefined ? m.regionPct.toFixed(3) + '%' : '—'} | ` +
          `${m.outsideDiffCount ?? '—'} | ${mdCell(m.refus ?? '—')} |`,
      );
    }
  } else {
    lines.push('| Maquette | Statut | diffCount | diffBox | Refus |');
    lines.push('|---|---|---|---|---|');
    for (const m of doc.maquettes) {
      lines.push(
        `| ${mdCell(m.maquette)} | ${m.status} | ${m.diffCount} | ${fmtDiffBox(m.diffBox)} | ${mdCell(m.refus ?? '—')} |`,
      );
    }
  }
  lines.push('');

  const diffEntries = doc.maquettes.filter((m) => m.status === 'diff');
  if (diffEntries.length > 0) {
    lines.push('Crops (avant | après | diff), un par écart :');
    lines.push('');
    for (const m of diffEntries) {
      if (m.cropTriptyque) lines.push(`- ${mdCell(m.maquette)} : \`${m.cropTriptyque}\``);
    }
    lines.push('');
  }

  lines.push(
    "Un code de sortie 2 signifie que la preuve n'a **pas eu lieu** (refus) — ce n'est jamais un verdict « identical ».",
  );
  lines.push('');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// The one export cli.ts actually calls.
// ---------------------------------------------------------------------------

export function writeReport(outDir: string, entries: CompareEntryResult[]): VerdictDocument {
  mkdirSync(outDir, { recursive: true });

  // Crops first: this stamps verdict.cropTriptyque on the (still-unsorted)
  // entries' verdict objects, which the sort below then carries along.
  writeCrops(outDir, entries);

  const totaux = computeTotaux(entries);
  const { statutGlobal, exitCode } = computeGlobal(totaux, entries.length);
  const maquettes = entries.map((e) => e.verdict).sort(compareMaquette);
  const doc: VerdictDocument = { statutGlobal, exitCode, totaux, maquettes };

  writeFileSync(path.join(outDir, 'verdict.json'), JSON.stringify(doc, null, 2) + '\n');
  writeFileSync(path.join(outDir, 'verdict.md'), renderMarkdown(doc));

  return doc;
}
