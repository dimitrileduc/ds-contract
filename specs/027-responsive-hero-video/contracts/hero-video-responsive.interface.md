# Interface Contract — Responsive HeroVideo

## Public content interface

The responsive change does not add a consumer-controlled viewport. `ds.hero-video` keeps its existing content API:

```text
HeroVideo {
  backgroundUrl?: string
  videoUrl?: string
  backgroundAlt?: string
  accroche?: string
}
```

The nested `ds.button` remains composition-owned. Odoo continues to expose the poster/alt, title, CTA label and CTA href through its authoring decisions; it does not expose `videoUrl`, a responsive mode or a breakpoint control.

## Responsive contract capability

An optional top-level `responsive` block is presentation behavior, not a component prop:

```text
responsive {
  basis: "viewport-width"
  sourceProfile { id, source, breakpointsPx }
  compositions [
    { id: "compact", minWidthPx: 0, partOverrides, figmaStrategy, figmaAnchor? },
    { id: "desktop", minWidthPx: 992, partOverrides, figmaStrategy, figmaAnchor? },
    { id: "wide", minWidthPx: 1400, partOverrides, figmaStrategy, figmaAnchor }
  ]
  designWitnesses [
    { id: "mobile-390", widthPx: 390, compositionId: "compact" },
    { id: "tablet-834", widthPx: 834, compositionId: "compact" },
    { id: "desktop-1200", widthPx: 1200, compositionId: "desktop" },
    { id: "wide-1728", widthPx: 1728, compositionId: "wide" }
  ]
}
```

The implemented schema must remain generic: it cannot contain a HeroVideo id, hard-coded part name or device name. `partOverrides` address existing anatomy paths and reuse validated layout/token/literal/declared/visibility/order channels. A new channel is additive, narrowly validated and documented with its canvas verdict.

Validation refuses:

- a `viewport`, `device`, `desktop`, `mobile` or `wide` public content prop created only to select the composition;
- a missing base `minWidthPx: 0`, duplicate threshold, unordered/ambiguous range or adjacent state without effective delta;
- an unknown part path, ungoverned token/Text Style reference or unsupported raw style;
- a Tablet composition in this feature; the 834 witness must reference `compact`;
- a code-only fact with no named Design projection/annotation;
- responsive behavior emitted by only one visitor surface.

## Projection rules

| Surface                | Selection | Required representation                                                                                                                       |
| ---------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| React CSS Module       | automatic | Base compact, puis règles root-scopées `min-width: 992px` et `min-width: 1400px`; aucun listener ou prop.                                     |
| HTML reference         | automatic | Même lowering, même ordre et mêmes déclarations que React.                                                                                    |
| React inline reference | automatic | Responsive channels leave inline objects for a deterministic scoped `<style>`; otherwise the emitter refuses.                                 |
| Web Components         | automatic | Même lowering dans le stylesheet Shadow DOM, ou refus explicite tant que non supporté.                                                        |
| Odoo public/editor     | automatic | Même CSS générée sur le QWeb/DOM sauvegardé ; aucune règle HeroVideo dans le bridge ni override Bootstrap global.                             |
| Figma Design           | explicit  | Auto Layout for fluid facts, modes for value-only deltas, variant for real composition changes. Resize alone is never advertised as a switch. |

Compact est actif sous 992 px, Desktop de 992 à 1399 px et wide à partir de 1400 px. Une seule composition s’applique à 991/992/993 et 1399/1400/1401. Le CSS est mobile-first et l’état au seuil exact est celui du `min-width` correspondant.

## XL/wide invariants

- Historical component node `2151:5552` and key `36011e51b8bc0b221a1ba6f9108709b5bd1c4490` remain the wide composition identities if the live preflight confirms them.
- Reference geometry remains 1728×720; the wide root fills its parent and is overflow-free at 1440. Desktop receives a distinct 1200 witness.
- Poster façade, crop, both scrims, title content/style, Button instance, component properties, Home instance link and overrides remain protected.
- Header overlay is captured as context only; no Header node or contract is writable.

If a component set is required, it receives a new additive set identity. The old component is reparented as wide/XL, never deleted/recreated, and the contract records both set and member anchors.

## Mobile/Desktop decision payload

The final compact and Desktop values are populated only from an approved H2 document conforming to [responsive-decision.schema.json](responsive-decision.schema.json). H2 must resolve for both:

- present/absent parts and their order;
- composition axis, alignment and title alignment;
- visible-viewport minimum height and short-height behavior;
- governed padding, gap, maximum width and `textStyleTokenPath`;
- Button reuse or approved delta;
- poster cover/crop/focal point/asset policy;
- the fit at 390/834/1200 and the two fixed boundary groups around 992/1400.

The default low-height contract is minimum visible viewport height plus content growth. Hidden overflow, internal scroll, compact typography or a second mobile asset require an explicit H2 value. Tablet 834 uses compact; failure blocks and returns to the owner instead of creating a hidden fourth composition.

## Figma transition contract

Before any standalone→set or responsive write:

1. A fixture and isolated spike prove historic component identity, properties, image paints, nested Button and instance overrides survive.
2. All master/Home/context captures and protected-fact digests are valid.
3. H1 and H2 are accepted and the live file version still matches the pin.

Application is allowlisted and must report `pageWrites: []`. The current Home instance may update through its master relationship, but no Page node is addressed for mutation. After H3, contract-generated reconciliation must match the accepted source and then produce a strict second-run no-op.

Any identity loss, unplaceable image, instance relink, override drift, extra variant, duplicate Container or unapproved wide pixel delta refuses the campaign.

## Visual and geometric interface

The validation matrix includes 320, 390, 834, 991/992/993, 1024, 1200, 1399/1400/1401, 1440 and 1728 px plus a short landscape viewport. Default and long title/CTA cases and unavailable video are exercised.

For every row:

- active composition equals expected composition;
- root and visible descendants remain inside the intended surface;
- horizontal overflow, unapproved crop and overlap are zero;
- media and both scrims cover the HeroVideo;
- title and CTA are complete and accessible;
- when content fits, the approved content-group centre is within 2 px.

The four witnesses 390/834/1200/1728 are each compared Figma↔reference and reference↔Odoo below the project’s 2 % threshold. Every capture uses its exact browser viewport and records `witnessId`, `compositionId`, `fixtureId`, poster/font digests and freshness. A root width inside a fixed large viewport or a viewport derived from clip padding is invalid. Boundary probes are geometric and do not claim an automatic Figma switch.

## Versioning

The generic schema extension is additive/optional and updates `docs/02-contract-spec.md`. HeroVideo receives a minor contract version while its public content fields remain intact. Removing/renaming content props or narrowing Button composition would require a major version and is outside this feature.
