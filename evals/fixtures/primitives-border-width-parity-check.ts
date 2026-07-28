import { readFileSync } from 'node:fs';
import path from 'node:path';

type Variable = { name: string; values?: Record<string, unknown> };
type Collection = { name: string; modes?: string[]; variables?: Variable[] };

const snapshotPath = path.resolve('parity/snapshots/figma-tokens.json');
const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8')) as { collections?: Collection[] };

function borderWidthOne(input: { collections?: Collection[] }): Variable | undefined {
  return input.collections
    ?.find((collection) => collection.name === 'Primitives')
    ?.variables
    ?.find((variable) => variable.name === 'border-width/1');
}

const token = borderWidthOne(snapshot);
if (!token || token.values?.Value !== 1) {
  throw new Error('Immutable Figma token reference is missing Primitives/border-width/1 = 1.');
}

const omitted = structuredClone(snapshot);
const primitives = omitted.collections?.find((collection) => collection.name === 'Primitives');
if (primitives) primitives.variables = primitives.variables?.filter((variable) => variable.name !== 'border-width/1');
if (borderWidthOne(omitted)) {
  throw new Error('Fixture setup did not model the missing Figma border-width reference.');
}

console.log('✔ immutable Figma Primitives/border-width/1 reference is present and omission is detectable');
