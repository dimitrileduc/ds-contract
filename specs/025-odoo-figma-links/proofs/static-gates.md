# Static gates receipt — 025 Odoo Figma Links

Executed on 2026-08-23:

```text
PASS npm run odoo:figma-links
PASS npm run odoo:figma-links:check       19 panels, 0 unavailable
PASS npm run odoo:inputs:check            27 locked contracts
PASS npm run odoo:authoring:check         14 authoring configs fully covered
PASS npm run odoo:module:check            23 passed, 0 skipped, 0 failed
PASS npm run odoo:derivation:check        79 classified manual/generated blocks
PASS npm run odoo:typecheck
PASS npx tsc --noEmit
PASS npx tsc -p tsconfig.build.json
PASS npm run eval                          221/221
```

The live-editor scenario is intentionally not included in this success list:
it ran separately and failed because its fresh QA pages were empty. See
`editor-qualification.live.json`.
