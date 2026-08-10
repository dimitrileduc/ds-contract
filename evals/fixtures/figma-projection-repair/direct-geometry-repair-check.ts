/** 021 / US1 — direct repairs are closed over the approved pin, node and fields. */
import { validateDirectRepair } from '../../../extract/figma/projection-repair/apply.js';

const baseline = {
  pin: '2385747041460798575', targetId: 'categories-principales', nodeId: '2115:4275', structuralPath: '0',
  allowedFields: ['width', 'x'], protectedDigests: { content: 'content-ok', grid: 'grid-ok' },
  changes: [{ field: 'width', value: 474 }, { field: 'x', value: 89 }],
};
const refuses = (label: string, input: object) => {
  const result = validateDirectRepair(input);
  if (result.ok) throw new Error(`${label} was accepted`);
};

if (!validateDirectRepair(baseline).ok) throw new Error('the bounded categories repair was refused');
refuses('wrong pin', { ...baseline, pin: 'wrong' });
refuses('wrong node', { ...baseline, nodeId: '2115:9999' });
refuses('wrong path', { ...baseline, structuralPath: '0/other' });
refuses('content mutation', { ...baseline, changes: [{ field: 'content', value: 'changed' }] });
refuses('grid mutation', { ...baseline, changes: [{ field: 'grid', value: 'changed' }] });
refuses('out-of-allowlist field', { ...baseline, changes: [{ field: 'height', value: 1 }] });

console.log('✔ direct geometry repair refuses stale pin, wrong node/path, protected content/grid and fields outside the allowlist');
