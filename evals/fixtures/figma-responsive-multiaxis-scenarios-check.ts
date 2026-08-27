import { buildPresentationCaptureRequests } from '../../extract/figma/projection-repair/capture.js';
import { validatePresentationScenarioResults } from '../../extract/figma/projection-repair/verify.js';
import { existingSetCampaign, existingSetScenarios, expectedExistingSetScenarioResults } from './figma-responsive-existing-set-topology-check.js';

const requests = buildPresentationCaptureRequests(existingSetCampaign);
if (requests.length !== existingSetScenarios.length || requests.some((request: any) =>
  request.variantSelection?.Style === undefined || request.variantSelection?.Colonnes === undefined || request.pageWrites.length !== 0)) {
  throw new Error('multi-axis capture queue lost Style×Colonnes or its Page-write boundary');
}

const green = validatePresentationScenarioResults(existingSetScenarios as never, expectedExistingSetScenarioResults);
if (!green.ok) throw new Error(`valid multi-axis matrix refused: ${green.issues.join(', ')}`);

const wrongPair = structuredClone(expectedExistingSetScenarioResults);
wrongPair[0].selectedVariantSelection = { Style: 'Empile', Colonnes: '3' };
const wrong = validatePresentationScenarioResults(existingSetScenarios as never, wrongPair);
if (wrong.ok || !wrong.issues.some((entry) => entry.includes('presentation-not-selected'))) {
  throw new Error('presentation-not-selected was not reported for the wrong Style×Colonnes pair');
}

const matrixKeys = new Set(existingSetScenarios.map((scenario) => `${scenario.width}/${scenario.variantSelection.Colonnes}/${scenario.fixtureId}`));
for (const width of [320, 390, 834, 1200, 1440, 1728]) for (const columns of ['2', '3']) for (const fixture of ['normal', 'long']) {
  if (!matrixKeys.has(`${width}/${columns}/${fixture}`)) throw new Error(`missing multi-axis matrix row ${width}/${columns}/${fixture}`);
}

console.log('✔ responsive scenarios select the exact Style×Colonnes pair and cover the 6×2×2 matrix');
