import { validatePresentationScenarioResults } from '../../extract/figma/projection-repair/verify.js';
import { buildPresentationCaptureRequests } from '../../extract/figma/projection-repair/capture.js';
import { expectedPresentationScenarios, expectedScenarioResults, responsiveCampaign } from './figma-responsive-fixture.js';

const requests = buildPresentationCaptureRequests(responsiveCampaign as never);
if (requests.length !== expectedPresentationScenarios.length || requests.some((request) => !request.presentationValue || request.pageWrites.length !== 0)) {
  throw new Error('capture queue lost explicit presentation selection or its Page-write boundary');
}

const green = validatePresentationScenarioResults(expectedPresentationScenarios, expectedScenarioResults);
if (!green.ok) throw new Error(`valid explicit scenario matrix refused: ${green.issues.join(', ')}`);

const wrongPresentation = structuredClone(expectedScenarioResults);
wrongPresentation[0].selectedPresentation = 'Wide';
const wrong = validatePresentationScenarioResults(expectedPresentationScenarios, wrongPresentation);
if (wrong.ok || !wrong.issues.some((issue) => issue.includes('presentation-not-selected'))) {
  throw new Error('presentation-not-selected was not reported');
}

const missingLongContent = expectedScenarioResults.filter((result) => !(result.width === 390 && result.fixtureId === 'long-title'));
if (validatePresentationScenarioResults(expectedPresentationScenarios, missingLongContent).ok) {
  throw new Error('missing width/fixture scenario was accepted');
}

const clipped = structuredClone(expectedScenarioResults);
clipped[1].clippedBy = ['9:clip'];
clipped[1].contentAccessible = false;
if (validatePresentationScenarioResults(expectedPresentationScenarios, clipped).ok) {
  throw new Error('clipped inaccessible scenario was accepted');
}

const huggedWidth = structuredClone(expectedScenarioResults);
huggedWidth[0].rootBounds.width = huggedWidth[0].width + 300;
if (validatePresentationScenarioResults(expectedPresentationScenarios, huggedWidth).ok) {
  throw new Error('a scenario whose proof frame hugged wider than its requested width was accepted');
}

console.log('✔ responsive scenarios require explicit Compact/Desktop/Wide selection, full width/fixture coverage and accessible unclipped content');
