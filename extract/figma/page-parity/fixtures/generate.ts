/**
 * Deterministic PNG fixture generator for the page-parity selftest —
 * `npx tsx extract/figma/page-parity/fixtures/generate.ts`.
 *
 * WHY a generator instead of committing hand-made PNGs: these fixtures ARE
 * the "fixture" half of this repo's fixture→eval→claim rule (R12, spec 003
 * research.md) — they must be reproducible from source, not opaque binaries
 * nobody can regenerate or audit. Every pixel below is a pure function of
 * (x, y) and the case name: no Math.random, no Date, no process.env. Two
 * runs produce byte-identical PNGs — verified: pngjs's synchronous writer
 * embeds no timestamp chunk, and PNG.sync.write() on two independently
 * computed but identical pixel buffers is byte-for-byte equal — so writing
 * over the previous files is a true idempotent overwrite, never a diff.
 *
 * Content model (a few flat rectangles + a horizontal gradient — "non-trivial
 * but readable", per the pinned interface):
 *   - a light-gray gradient background (left→right, deterministic formula)
 *   - a solid BLACK rectangle placed so pixel (FLIP_X, FLIP_Y) = (10, 7)
 *     sits at least 5px inside its interior on every side. That margin is
 *     load-bearing, not decorative: pixelmatch's anti-aliasing detector is
 *     ON by default (see cli.ts / extract/figma/visual-parity/img.ts — the
 *     pinned interface explicitly forbids passing includeAA), and it
 *     excludes a differing pixel from the diff count whenever its 8
 *     neighbours look like a smooth edge (pixelmatch's own `hasManySiblings`
 *     check short-circuits to "not anti-aliasing" once 3+ neighbours share a
 *     color). Surrounding (10,7) with flat black on every side, in BOTH the
 *     before and after image, guarantees that fast exit fires — the
 *     one-pixel fixture always counts as a REAL diff, never AA noise.
 *     Verified empirically (round-tripped through PNG encode/decode +
 *     pixelmatch with default options): diffCount === 1, diffBox exactly
 *     {x:10, y:7, w:1, h:1}.
 *   - a solid BLUE rectangle elsewhere, purely so the image isn't a single
 *     flat field (closer to a real capture than a blank canvas).
 *
 * Fixture cases (paths match the pinned page-parity interface exactly — see
 * specs/003-externalize-figma-components/contracts/page-proof.md §3):
 *   identical/{before,after}/maquette-a.png          — same pixels, both sides
 *   one-pixel/{before,after}/maquette-a.png           — after flips (10,7)
 *                                                        opaque black -> opaque red
 *   empty-capture/{before,after}/maquette-a.png       — after is same size,
 *                                                        every pixel alpha 0
 *   dimension-mismatch/{before,after}/maquette-a.png  — before 96×64, after 100×64
 *
 * All images are 96×64 except dimension-mismatch's "after" (100×64), per spec.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const HERE = path.resolve(new URL('.', import.meta.url).pathname);

const WIDTH = 96;
const HEIGHT = 64;
/** dimension-mismatch "after": same height, wider — a real resize, not a crop. */
const WIDE_WIDTH = 100;

/** The exact pixel the one-pixel fixture flips (pinned interface, R2). */
const FLIP_X = 10;
const FLIP_Y = 7;

/** Solid black block; (FLIP_X, FLIP_Y) sits well inside it (margin ≥5px on
 *  every side) so its 8 neighbours are flat black in both variants — see
 *  the file header for why that margin matters to pixelmatch's AA detector. */
const BLACK_RECT = { x: 4, y: 2, w: 36, h: 18 };
/** A second flat rectangle so the fixture isn't a single flat field. */
const BLUE_RECT = { x: 50, y: 26, w: 32, h: 24 };

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function inRect(x: number, y: number, r: Rect): boolean {
  return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}

/** Deterministic "captured maquette" content: gradient background + two
 *  flat rectangles. Pure function of (x, y, width, height) — no randomness,
 *  no timestamps, so re-running this generator overwrites idempotently. */
function paint(width: number, height: number): PNG {
  const png = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      // Background: a light-gray horizontal gradient (200 -> 140).
      const g = 200 - Math.round((x / Math.max(1, width - 1)) * 60);
      png.data[i] = g;
      png.data[i + 1] = g;
      png.data[i + 2] = g;
      png.data[i + 3] = 255;

      if (inRect(x, y, BLACK_RECT)) {
        png.data[i] = 0;
        png.data[i + 1] = 0;
        png.data[i + 2] = 0;
        png.data[i + 3] = 255;
      } else if (inRect(x, y, BLUE_RECT)) {
        png.data[i] = 30;
        png.data[i + 1] = 64;
        png.data[i + 2] = 200;
        png.data[i + 3] = 255;
      }
    }
  }
  return png;
}

/** Fully transparent canvas — the "capture-failed" fixture's failed side
 *  (every pixel alpha === 0, the exact predicate the CLI refuses on). */
function transparent(width: number, height: number): PNG {
  const png = new PNG({ width, height });
  png.data.fill(0); // r=g=b=a=0 everywhere
  return png;
}

function write(png: PNG, ...segments: string[]): void {
  const dest = path.join(HERE, ...segments);
  mkdirSync(path.dirname(dest), { recursive: true });
  writeFileSync(dest, PNG.sync.write(png));
  console.log(`  wrote ${path.relative(HERE, dest)} (${png.width}×${png.height})`);
}

console.log('page-parity fixtures — deterministic generation');

// 1. identical — independently generated, same pixels both sides (models a
//    clean double-capture with zero drift between captures).
{
  write(paint(WIDTH, HEIGHT), 'identical', 'before', 'maquette-a.png');
  write(paint(WIDTH, HEIGHT), 'identical', 'after', 'maquette-a.png');
}

// 2. one-pixel — after flips exactly (FLIP_X, FLIP_Y): opaque black -> opaque red.
{
  const before = paint(WIDTH, HEIGHT);
  const flipIndex = (FLIP_Y * WIDTH + FLIP_X) * 4;
  // Self-check: if a future edit to paint()/BLACK_RECT ever moves this pixel
  // off solid black, fail loudly here rather than silently ship a fixture
  // whose "opaque black -> opaque red" premise (pinned interface) no longer
  // holds — never a silent drift in what the fixture actually proves.
  const [r, g, b, a] = [before.data[flipIndex], before.data[flipIndex + 1], before.data[flipIndex + 2], before.data[flipIndex + 3]];
  if (r !== 0 || g !== 0 || b !== 0 || a !== 255) {
    throw new Error(
      `fixture design error: (${FLIP_X}, ${FLIP_Y}) must be opaque black before the flip — got rgba(${r}, ${g}, ${b}, ${a}). ` +
        'Adjust BLACK_RECT so it still covers this pixel with margin.',
    );
  }
  const after = paint(WIDTH, HEIGHT);
  after.data[flipIndex] = 255;
  after.data[flipIndex + 1] = 0;
  after.data[flipIndex + 2] = 0;
  after.data[flipIndex + 3] = 255;
  write(before, 'one-pixel', 'before', 'maquette-a.png');
  write(after, 'one-pixel', 'after', 'maquette-a.png');
}

// 3. empty-capture — after is same dims, fully transparent (a failed export).
{
  write(paint(WIDTH, HEIGHT), 'empty-capture', 'before', 'maquette-a.png');
  write(transparent(WIDTH, HEIGHT), 'empty-capture', 'after', 'maquette-a.png');
}

// 4. dimension-mismatch — before 96x64, after 100x64 (a real resize).
{
  write(paint(WIDTH, HEIGHT), 'dimension-mismatch', 'before', 'maquette-a.png');
  write(paint(WIDE_WIDTH, HEIGHT), 'dimension-mismatch', 'after', 'maquette-a.png');
}

console.log('done.');
