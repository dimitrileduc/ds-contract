import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { withFileMutationQueue, type ExtensionAPI } from '@earendil-works/pi-coding-agent';
import { Type } from 'typebox';

type Report = {
  status: 'identical' | 'diff' | 'input-invalid' | 'dimension-mismatch';
  exitCode: 0 | 1 | 2;
  diffCount: number;
  diffPct: number | null;
  diffBox: { x: number; y: number; w: number; h: number } | null;
  reason: string | null;
  triptych: string | null;
};

const withoutAt = (value: string) => value.startsWith('@') ? value.slice(1) : value;

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: 'image_parity',
    label: 'Image Parity',
    description: 'Strictly compare two local PNG files, write local diagnostic artifacts, and return only compact pixel-diff metrics.',
    promptSnippet: 'Compare two local PNGs without putting image bytes in context',
    promptGuidelines: [
      'Use image_parity when two existing local PNG paths need a visual-equivalence proof.',
      'Do not use image_parity without a before and after PNG path; do not load its triptych unless a reported diff needs inspection.',
    ],
    parameters: Type.Object({
      before: Type.String({ description: 'Path to the baseline PNG, relative to the project or absolute.' }),
      after: Type.String({ description: 'Path to the candidate PNG, relative to the project or absolute.' }),
      out: Type.Optional(Type.String({ description: 'Optional artifact directory. Defaults under .image-parity/.' })),
    }),
    async execute(_toolCallId, params, signal, _onUpdate, ctx) {
      const before = resolve(ctx.cwd, withoutAt(params.before));
      const after = resolve(ctx.cwd, withoutAt(params.after));
      const digest = createHash('sha256').update(`${before}\0${after}`).digest('hex').slice(0, 12);
      const out = resolve(ctx.cwd, params.out ? withoutAt(params.out) : `.image-parity/${digest}`);
      const cli = resolve(ctx.cwd, 'extract/image-parity/cli.ts');
      const tsx = resolve(ctx.cwd, 'node_modules/.bin/tsx');

      return withFileMutationQueue(out, async () => {
        const processResult = await pi.exec(tsx, [cli, '--before', before, '--after', after, '--out', out], { signal });
        if (![0, 1, 2].includes(processResult.code ?? -1)) {
          throw new Error(`image_parity failed unexpectedly (exit ${processResult.code}): ${processResult.stderr || processResult.stdout}`);
        }

        let report: Report;
        try {
          report = JSON.parse(await readFile(resolve(out, 'result.json'), 'utf8')) as Report;
        } catch (error) {
          throw new Error(`image_parity did not write a readable result.json: ${error instanceof Error ? error.message : String(error)}`);
        }

        const result = {
          status: report.status,
          diffCount: report.diffCount,
          diffPct: report.diffPct,
          diffBox: report.diffBox,
          reason: report.reason,
          report: relative(ctx.cwd, resolve(out, 'result.json')),
          triptych: report.triptych ? relative(ctx.cwd, resolve(out, report.triptych)) : null,
        };
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
          details: result,
        };
      });
    },
  });
}
