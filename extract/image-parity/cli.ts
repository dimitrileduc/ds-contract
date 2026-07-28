/**
 * Strict, renderer-agnostic PNG comparison CLI.
 *
 * npm run images:compare -- --before a.png --after b.png --out .image-parity/run
 */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { compareImageFiles } from './compare.js';
import { writeImageParityReport } from './report.js';

const USAGE =
  'Usage: npm run images:compare -- --before <image.png> --after <image.png> --out <directory>\n' +
  '  Strict comparison only: images must have identical dimensions; no resize or alignment is performed.';

function fail(message: string): never {
  console.error(message);
  console.error(USAGE);
  process.exit(2);
}

function main(): void {
  const args = process.argv.slice(2);
  const readFlag = (flag: string): string | undefined => {
    const index = args.indexOf(flag);
    return index < 0 ? undefined : args.splice(index, 2)[1];
  };
  const before = readFlag('--before');
  const after = readFlag('--after');
  const out = readFlag('--out');
  if (!before || !after || !out || args.length > 0) {
    fail(args.length > 0 ? `Argument(s) inconnu(s) : ${args.join(' ')}` : '--before, --after et --out sont obligatoires.');
  }

  const outDir = path.resolve(process.cwd(), out);
  mkdirSync(outDir, { recursive: true });
  const result = compareImageFiles(path.resolve(process.cwd(), before), path.resolve(process.cwd(), after));
  const report = writeImageParityReport(outDir, result);
  console.log(JSON.stringify({ ...report, report: path.join(outDir, 'result.json') }));
  process.exit(report.exitCode);
}

main();
