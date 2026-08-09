import { compareSurfaces } from '../../../extract/figma/organism-audit/readiness/compare.js';
import { classifyFinding, findingsFromComparisons, FINDING_CAUSES } from '../../../extract/figma/organism-audit/readiness/findings.js';

const differences = compareSurfaces({ reference: { figma: { v: 1 }, contract: { v: 1 }, render: { v: 1 } }, current: { figma: { v: 2 }, contract: { v: 1 }, render: { v: 3 } } });
if (findingsFromComparisons(differences, 'renderer-fault').length !== 2) throw new Error('three-surface comparison hid a difference');
for (const cause of FINDING_CAUSES) if (classifyFinding({ findingId: cause, surface: 'figma', significance: 'significant', description: 'observed', cause }).length !== 0) throw new Error(`allowed cause rejected: ${cause}`);
if (classifyFinding({ findingId: 'informational', surface: 'render', significance: 'informational', description: 'cosmetic note', cause: 'accepted-defect' }).length === 0) throw new Error('informational finding without justification was accepted');
console.log('✔ findings compare Figma, contract and render separately and enforce significance/cause rules');
