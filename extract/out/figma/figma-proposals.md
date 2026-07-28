# Proposed contracts — design-side extraction report

1 component set(s) extracted from the canvas dump. Every proposal parses against the contract schema. A proposal is a STARTING POINT: unbound values are NAMED below (never silently tokenized), and each note is a review line item.

## PiquerayLogo

- proposed: 1 props
- semantics.element defaulted to "div" — element/role/ARIA are not drawn on the canvas and the name/axis inference table matched nothing; set the real host element
- PiquerayLogo:root/Wordmark background-color: bindings are a function of variant axis "couleur" by VALUE (default default={color.bleu}; blanc={color.blanc}) — carried as tokensByProp overrides (v10; the token names do not spell the axis values, so the substituted-ref shape cannot carry them)
- PiquerayLogo:root: static root bbox 180×34px proposed as literal dimensions (no auto-layout sizing mode is present)
- prop `couleur`: two-value axis [Default, Blanc] kept as an ENUM (both states render truthfully on both surfaces); a code boolean is a compatible code-side binding — see extract/reconcile.ts bool⇄axis treatment

