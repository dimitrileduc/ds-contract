import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { extractCode } from '../../parity/extract-code.js';
import { richTextDefaultText, richTextDefaultsEqual } from '../../parity/defaults.js';

const root = mkdtempSync(path.join(os.tmpdir(), 'ds-contracts-rich-text-parity-'));
try {
  const componentDir = path.join(root, 'src', 'components', 'RichText');
  mkdirSync(componentDir, { recursive: true });
  writeFileSync(path.join(componentDir, 'RichText.tsx'), `
    interface RichTextProps {
      body?: Array<{ text: string; strong?: boolean }>;
    }
    export function RichText({
      body = [
        { text: 'Measured ', strong: true },
        { text: 'native text.' },
      ],
    }: RichTextProps) {
      return <div>{body.map((segment) => segment.text)}</div>;
    }
  `);

  const extracted = extractCode(root).find((component) => component.component === 'RichText');
  const contractDefault = [
    { text: 'Measured ', strong: true },
    { text: 'native text.' },
  ];
  if (!extracted?.props.find((prop) => prop.name === 'body')?.default) {
    throw new Error('extractCode did not retain the structured rich-text default');
  }
  const codeDefault = extracted.props.find((prop) => prop.name === 'body')!.default;
  if (!richTextDefaultsEqual(contractDefault, codeDefault)) {
    throw new Error('structured rich-text default no longer compares faithfully against code');
  }
  if (richTextDefaultsEqual(contractDefault, [
    { text: 'Measured ' },
    { text: 'native text.' },
  ])) {
    throw new Error('rich-text comparison ignored a code-side strong mark drift');
  }
  if (richTextDefaultText(contractDefault) !== 'Measured native text.') {
    throw new Error('structured rich-text did not project to one native Figma TEXT value');
  }
} finally {
  rmSync(root, { recursive: true, force: true });
}

console.log('✔ rich-text parity preserves code marks and projects native Figma text');
