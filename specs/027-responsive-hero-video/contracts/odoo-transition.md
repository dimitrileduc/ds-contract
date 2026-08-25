# Odoo Transition Contract — Responsive HeroVideo

## Stable authoring interface

`s_pqr_hero_video` keeps one editable content state across compact, Desktop and wide:

- poster image and alternative text;
- title, plain text without marks;
- CTA label and href;
- root actions move, duplicate and remove.

`videoUrl`, scrims, structure, Button variant/icons and responsive selection remain fixed/not offered. No composition option, duplicate title, duplicate CTA or duplicate poster enters the editor.

## Preferred compatible DOM

The saved and QWeb anatomy remains:

```text
root
├── hero-video-poster
├── hero-video-voile-bas
├── hero-video-voile-navigation
├── hero-video-content
│   └── hero-video-title
└── button-root
    └── button-label
```

Responsive layout may align, size or hide these existing parts through generated CSS when H2 permits. Reordering is accepted only when DOM reading/focus order remains correct; duplicate content is forbidden. The CSS is derived from the canonical contract by `odoo:assets`; no HeroVideo media rule belongs in `odoo-bridge.css`.

The component policy reuses Odoo/Bootstrap 19 thresholds `lg=992` and `xxl=1400` only as contract values. It does not override `$grid-breakpoints`, `.container`, `.row`, `.col-*`, `.o_pqr_page` or any global bundle. Rules are non-layered and scoped below the HeroVideo root.

If the approved compact or Desktop composition needs a wrapper, duplicate content node or other anatomy absent from saved HTML, implementation stops and records `structure-stale`. It must not claim current saved pages are responsive until a separate owner-approved migration proves their conversion.

## Persistence and update

An existing customized HeroVideo is seeded in disposable QA and its `outerHTML`, content, media, links, order, contract metadata and instance identity are hashed before addon update. Running `odoo -u piqueray_ds` must leave the stored `outerHTML` byte-identical. The refreshed generated CSS may alter layout below 992, from 992 through 1399 and from 1400 upward; that is the intended non-persistent projection.

`npm run odoo:page -- home <database>` is allowed only on a disposable database or for an explicitly authorised reconstruction. It is not an update test and cannot be used to prove persistence because the composer replaces page `arch_db`.

The version guard may report:

- `current` when structure and policy metadata remain compatible;
- `policy-stale` for authoring-policy drift;
- `structure-stale` for an incompatible anatomy/version;
- `unknown` when it cannot classify.

It never rewrites or upgrades saved DOM.

## Contract graph and manual adaptations

After H3 and the canonical contract diff:

1. repin `inputs.lock.json` by version/hash and recalculate the graph digest;
2. propagate reviewed manifest/digest metadata through controlled roots, version guard, scanner and Figma-link output;
3. regenerate `components.pqr.css` and other derived assets;
4. pair every changed QWeb/XML/JS/CSS bridge marker 1↔1 with `adaptation-registry.json`;
5. leave authoring decisions exhaustive for the whole `ds.hero-video → ds.button` closure.

A graph pin or generated asset is never hand-edited to force a green gate.

## Qualification

Static gates:

```text
odoo:inputs:check
odoo:authoring:check
odoo:assets -- --check
odoo:figma-links:check
odoo:module:check
odoo:derivation:check
odoo:typecheck
```

Live qualification uses a disposable Odoo 19 database and proves:

- public responsive matrix at all mandated widths and short landscape;
- exact iframe `window.innerWidth` recorded separately from the outer editor window;
- default/long content and missing-video poster fallback;
- title/CTA/poster/alt/href edit, save, reopen and public rendering;
- isolation between two HeroVideo instances;
- byte-identical saved DOM across `odoo -u`;
- Mobile 390, Tablet 834, Desktop 1200 and wide 1728 HTML-reference↔Odoo visual comparisons under the approved threshold;
- separate Home+Header context captures so a Header defect is never compensated inside HeroVideo.

Skipping a live editor, persistence or visual check yields an incomplete qualification, not success.
