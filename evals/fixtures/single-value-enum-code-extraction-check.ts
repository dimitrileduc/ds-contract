import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { extractCode } from '../../parity/extract-code.js';

const root = mkdtempSync(path.join(os.tmpdir(), 'ds-contracts-single-enum-'));
try {
  const componentDir = path.join(root, 'src', 'components', 'SingleEnum');
  mkdirSync(componentDir, { recursive: true });
  writeFileSync(
    path.join(componentDir, 'SingleEnum.tsx'),
    `
      export interface SingleEnumProps {
        glyph?: 'pdf';
      }
      export function SingleEnum({ glyph = 'pdf' }: SingleEnumProps) {
        return <span>{glyph}</span>;
      }
    `,
  );

  const glyph = extractCode(root)
    .find((component) => component.component === 'SingleEnum')
    ?.props.find((prop) => prop.name === 'glyph');
  if (glyph?.kind !== 'enum' || JSON.stringify(glyph.values) !== '["pdf"]') {
    throw new Error(
      `single string-literal prop was not extracted as a one-value enum: ${JSON.stringify(glyph)}`,
    );
  }
} finally {
  rmSync(root, { recursive: true, force: true });
}

console.log('✔ code parity extracts a single string-literal prop as a one-value enum');
