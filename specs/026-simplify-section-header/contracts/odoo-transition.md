# Odoo Transition Contract — SectionHeader simplification

## New compositions

New Odoo snippets must express canonical ownership:

- generic SectionHeader exposes title, eyebrow, `afficherAccroche` and `Centre|Gauche` only;
- Hero, Presentation, Texte SEO and Produits e-commerce own direct title parts and any section CTA;
- Products is added as a real root: contract/input-lock entry, root registration, exhaustive authoring config, QWeb/manual adaptation-registry markers, generated assets, Figma reference and QA coverage;
- each manual QWeb/JS/XML adaptation has one unique marker and matching `adaptation-registry.json` entry; generated CSS/assets are rebuilt rather than patched.

The existing internal `pqr_section_header` helper becomes a narrow generic projection with no `disposition`/`emphase`/CTA branch. Its seven current callers (`hero`, `presentation`, `texte-seo`, `faq`, `sav`, `coordonnees`, `reassurances`) must have their authoring decisions re-addressed; stale nested v2 decisions must be removed instead of being carried as hidden controls.

## Contract graph and metadata

After contract review, repin `integrations/odoo/config/inputs.lock.json` by path, version and SHA. A changed graph digest/version then propagates to every controlled Odoo root metadata record, `version_guard.js`, saved-version scan/fixtures and module checks. `npm run odoo:module:check` is the gate for these transcriptions.

## Persisted pages

An addon update must not write saved section `outerHTML`, text, rich-text marks, media, links or ordering. The version guard may report `structure-stale`; it may not translate `disposition`, `emphase` or `accroche2`, or call a replacement API.

A later persisted-page conversion is separate and needs explicit owner approval of affected records/deltas, before/after capture and serialization, a reviewed migration-ledger destination per title, public/editor/save-reopen proof, and a second no-op receipt.

## Qualification interface

Static validation includes `odoo:inputs:check`, `odoo:authoring:check`, `odoo:assets -- --check`, `odoo:figma-links:check`, `odoo:module:check`, `odoo:derivation:check` and Odoo type checking. Live QA proves current/new snippet controls, rich-text/editability limits, public/save/reopen/two-instance isolation/responsive behavior, and strict emitHtml-to-Odoo visual comparison. A dedicated seeded old-v2 page test must prove `odoo -u` has not written its saved DOM; the existing regenerated harness update test alone is insufficient.
