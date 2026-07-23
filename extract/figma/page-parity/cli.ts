/**
 * CLI wrapper for the page-parity comparator — the only node-bound layer of
 * the instrument (compare.ts and report.ts stay pure/fs-read-only and
 * write-only respectively; this file owns argv, directory listing, manifest
 * -sidecar discovery, process exit codes). Patterned on
 * extract/figma/rest/cli.ts: same readFlag/splice argv idiom, same
 * "console.error + process.exit" shape for refusals.
 *
 *   node_modules/.bin/tsx extract/figma/page-parity/cli.ts \
 *     --before <dir> --after <dir> --out <dir>
 *   (npm run pages:compare -- --before <dir> --after <dir> --out <dir>)
 *
 * All three flags are required; a missing flag or any leftover/unknown
 * argument is a usage error (usage on stderr, exit 2) — never a silent
 * default.
 *
 * Pair discovery (pinned interface): entries = union of *.png basenames
 * (non-recursive) found in --before and --after. An optional
 * "<name>.manifest.json" sidecar next to a PNG is parsed and handed to
 * compareEntry() — cli.ts does not interpret it beyond "did it parse", the
 * "statut" semantics live in compare.ts. Zero entries is handed through to
 * report.ts (which is where the exit-code precedence, including the
 * zero-entries -> refus rule, is computed — see report.ts's header) rather
 * than special-cased here, so there is exactly ONE place that decides
 * statutGlobal/exitCode.
 */
import { mkdirSync, readdirSync, readFileSync, statSync, type Dirent } from 'node:fs';
import path from 'node:path';
import { compareEntry, type CompareEntryResult, type ManifestSidecar, type PixelVerdict } from './compare.js';
import { writeReport } from './report.js';

const USAGE =
  'Usage: node_modules/.bin/tsx extract/figma/page-parity/cli.ts --before <dir> --after <dir> --out <dir>\n' +
  '  (npm run pages:compare -- --before <dir> --after <dir> --out <dir>)\n' +
  '  --before, --after and --out are all required.';

function fail(reason: string): never {
  console.error(reason);
  console.error(USAGE);
  process.exit(2);
}

/** *.png basenames (without ".png"), non-recursive, direct children only. */
function listPngBasenames(label: 'before' | 'after', dir: string): Set<string> {
  let dirents: Dirent[];
  try {
    dirents = readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return fail(`Erreur : --${label} "${dir}" illisible (${msg}).`);
  }
  const names = new Set<string>();
  for (const d of dirents) {
    if (d.isFile() && d.name.endsWith('.png')) names.add(d.name.slice(0, -'.png'.length));
  }
  return names;
}

/**
 * Reads "<pngPath minus .png>.manifest.json" if it exists. Returns null when
 * there is genuinely no sidecar (optional per the pinned interface — not a
 * problem). A sidecar that exists but fails to read/parse is NOT silently
 * treated as absent: it comes back as a manifest whose "statut" names the
 * problem, so compare.ts's existing "statut !== ok -> capture-failed" path
 * naturally catches it with an honest reason instead of us guessing "ok".
 */
function readManifestSidecar(pngPath: string): ManifestSidecar | null {
  const manifestPath = pngPath.slice(0, -'.png'.length) + '.manifest.json';
  let raw: string;
  try {
    raw = readFileSync(manifestPath, 'utf8');
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err && err.code === 'ENOENT') return null;
    return { statut: `manifeste illisible (${err instanceof Error ? err.message : String(err)})` };
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as ManifestSidecar;
    return { statut: 'manifeste invalide (JSON racine non-objet)' };
  } catch (e) {
    return { statut: `manifeste JSON invalide (${e instanceof Error ? e.message : String(e)})` };
  }
}

function formatMaquetteLine(m: PixelVerdict): string {
  if (m.status === 'diff') {
    const box = m.diffBox ? `x=${m.diffBox.x},y=${m.diffBox.y},w=${m.diffBox.w},h=${m.diffBox.h}` : '—';
    return `  diff               ${m.maquette} — diffCount=${m.diffCount} diffBox=${box}`;
  }
  return `  ${m.status.padEnd(18)} ${m.maquette} — ${m.refus ?? '(raison non précisée)'}`;
}

function main(): void {
  const args = process.argv.slice(2);
  const readFlag = (flag: string): string | undefined => {
    const i = args.indexOf(flag);
    return i >= 0 ? args.splice(i, 2)[1] : undefined;
  };
  const beforeDir = readFlag('--before');
  const afterDir = readFlag('--after');
  const outDir = readFlag('--out');

  if (!beforeDir || !afterDir || !outDir) {
    fail('Erreur : --before, --after et --out sont tous les trois obligatoires.');
  }
  if (args.length > 0) {
    fail(`Erreur : argument(s) inconnu(s) : ${args.join(' ')}`);
  }

  const beforeAbs = path.resolve(process.cwd(), beforeDir);
  const afterAbs = path.resolve(process.cwd(), afterDir);
  const outAbs = path.resolve(process.cwd(), outDir);

  // Fail fast and by name if a supplied directory isn't one — better than a
  // raw ENOTDIR crash three calls later.
  for (const [label, dir] of [
    ['before', beforeAbs],
    ['after', afterAbs],
  ] as const) {
    try {
      if (!statSync(dir).isDirectory()) fail(`Erreur : --${label} "${dir}" n'est pas un répertoire.`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      fail(`Erreur : --${label} "${dir}" illisible (${msg}).`);
    }
  }

  const beforeNames = listPngBasenames('before', beforeAbs);
  const afterNames = listPngBasenames('after', afterAbs);
  const maquetteNames = [...new Set([...beforeNames, ...afterNames])];

  // Pair discovery only — every actual verdict decision (including "zero
  // entries") happens in compareEntry()/writeReport(), never here.
  const results: CompareEntryResult[] = maquetteNames.map((maquette) => {
    const beforePath = beforeNames.has(maquette) ? path.join(beforeAbs, `${maquette}.png`) : null;
    const afterPath = afterNames.has(maquette) ? path.join(afterAbs, `${maquette}.png`) : null;
    return compareEntry({
      maquette,
      beforePath,
      afterPath,
      beforeManifest: beforePath ? readManifestSidecar(beforePath) : null,
      afterManifest: afterPath ? readManifestSidecar(afterPath) : null,
    });
  });

  mkdirSync(outAbs, { recursive: true });
  const doc = writeReport(outAbs, results);

  const total = doc.maquettes.length;
  console.log(
    `page-parity: ${doc.statutGlobal} — ${doc.totaux.identical}/${total} identical, ${doc.totaux.diff} diff, ` +
      `${doc.totaux.captureFailed} capture-failed, ${doc.totaux.dimensionMismatch} dimension-mismatch ` +
      `(exit ${doc.exitCode}) → ${outAbs}`,
  );

  if (total === 0) {
    // Exact reason string from the pinned interface — a compare over
    // nothing must never pass, and the reason must be findable verbatim.
    console.error('Refus : aucune entree - rien a prouver (0 PNG apparié entre --before et --after).');
  }
  for (const m of doc.maquettes) {
    if (m.status !== 'identical') console.error(formatMaquetteLine(m));
  }

  process.exit(doc.exitCode);
}

main();
