# Setup receipt — 025 Odoo Figma Links

Executed from the feature worktree on 2026-08-23:

```text
npm install
added 203 packages; npm audit reported 3 high-severity dependency advisories.

npx playwright install chromium
The command exited successfully but warned that this checkout depends on
playwright-core rather than the Playwright package. It did not provide a
browser-download receipt, so live-editor qualification remains contingent on
the QA launcher finding Chromium in its configured environment.
```

The dependency setup is complete. The advisory and the missing explicit browser
receipt are recorded here rather than treated as a successful live qualification.
