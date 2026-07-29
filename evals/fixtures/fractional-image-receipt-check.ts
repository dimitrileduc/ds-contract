/**
 * FR-008 regression vector for image receipts.
 *
 * Browser layout dimensions are CSS pixels, not decoded bitmap dimensions:
 * Figma-derived component geometry can therefore be fractional.  This oracle
 * stays independent of the runner/evidence implementation and asserts the
 * admission rule directly: decoded source dimensions are positive integers;
 * the rendered CSS box is any finite positive number and is never rounded.
 */

type ImageObservation = {
  naturalWidth: unknown;
  naturalHeight: unknown;
  renderedWidth: unknown;
  renderedHeight: unknown;
};

const positiveInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value > 0;

const positiveCssDimension = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

function decodedImage(observation: ImageObservation): boolean {
  return (
    positiveInteger(observation.naturalWidth) &&
    positiveInteger(observation.naturalHeight) &&
    positiveCssDimension(observation.renderedWidth) &&
    positiveCssDimension(observation.renderedHeight)
  );
}

const petit = {
  naturalWidth: 626,
  naturalHeight: 836,
  renderedWidth: 339.5,
  renderedHeight: 339.5,
};
if (!decodedImage(petit))
  throw new Error("339.5px rendered Realisation image must remain decoded");
if (petit.renderedWidth !== 339.5 || petit.renderedHeight !== 339.5)
  throw new Error("fractional CSS dimensions must be preserved without rounding");

const memberPortrait = {
  naturalWidth: 2048,
  naturalHeight: 2048,
  renderedWidth: 363.5,
  renderedHeight: 363.5,
};
if (!decodedImage(memberPortrait))
  throw new Error("363.5px rendered MemberCard portrait must remain decoded");

for (const [name, observation] of [
  ["zero", { ...petit, renderedWidth: 0 }],
  ["infinite", { ...petit, renderedHeight: Infinity }],
  ["non-numeric", { ...petit, renderedWidth: "339.5" }],
] as const) {
  if (decodedImage(observation))
    throw new Error(`${name} rendered CSS dimension must be refused`);
}

console.log("✔ fractional positive CSS image dimensions stay decoded without rounding");
