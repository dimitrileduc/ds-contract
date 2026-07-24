# Proposed contracts — design-side extraction report

1 component set(s) extracted from the canvas dump. Every proposal parses against the contract schema. A proposal is a STARTING POINT: unbound values are NAMED below (never silently tokenized), and each note is a review line item.

## Checkbox

- proposed: 1 props
- semantics: element "input" ("checkbox"; the type="checkbox" attribute is not canvas-recoverable — author it) inferred from the set name "Checkbox" — inference is mechanical (name/axis table), review
- prop `coch`: two-value axis [Non, Oui] kept as an ENUM (both states render truthfully on both surfaces); a code boolean is a compatible code-side binding — see extract/reconcile.ts bool⇄axis treatment
- prop `coch`: Figma property "Coché" contains characters outside a legal identifier — name sanitized at proposal; the original spelling stays the design binding (bindings.figma.property)
- UNBOUND Checkbox:root fill = #ffffff — no token invented; nearest tokens by value: {color.blanc}
- UNBOUND Checkbox:root stroke = #9ba4b5 — no token invented; nearest tokens by value: {color.bleu-gris}
- UNBOUND Checkbox:root strokeWeight = 2 — no token invented; nearest tokens by value: {border-width.2}
- UNBOUND Checkbox:root/Vector (Stroke) stroke = #ffffff — no token invented; nearest tokens by value: {color.blanc}
- UNBOUND Checkbox:root/Vector (Stroke) strokeWeight = 2 — no token invented; nearest tokens by value: {border-width.2}

