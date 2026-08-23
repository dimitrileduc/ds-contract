# Editor qualification — non-qualifying

The real Odoo scenario was executed against Docker 29.5.2 with a fresh
`piqueray_qa` database. Addon installation and editor-account provisioning
completed, but every qualification page rendered an empty
`#wrap.oe_structure.oe_empty`. Consequently none of the 19 generated
root/child/shell selectors could be exercised in the editor.

`editor-qualification.live.json` contains the per-panel failed observations.
This is a blocking QA-environment result, not a product pass: opening behavior,
popup isolation, selected HTML, save/dirty state and native-panel non-regression
still require a run with populated harness pages.
