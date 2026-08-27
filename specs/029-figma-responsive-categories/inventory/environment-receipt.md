# Environment receipt — Worktree gate F1

- Captured: 2026-08-26
- Workspace: `/Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/just-euphonium`
- Branch: `just-euphonium`
- Node.js: `v24.19.0` (repository minimum: Node.js 20)
- npm: `11.17.0`
- Playwright CLI resolved by `npx`: `1.62.1`
- Installed project browser dependency: `playwright-core@1.61.1`

## Commands and results

### `npm install`

Exit code: `0`.

```text
added 203 packages, and audited 207 packages in 2s
53 packages are looking for funding
3 high severity vulnerabilities
npm warn allow-scripts: esbuild@0.28.1 and fsevents@2.3.3 have install scripts not yet covered by allowScripts
```

The audit warning is recorded as an environment finding. No automatic dependency
upgrade or `npm audit fix` was authorized by this Figma-only feature.

### `npx playwright install chromium`

Exit code: `0`.

The command completed and reconciled the local Playwright browser cache. It emitted
Playwright's generic warning that the project does not depend on the full
`playwright`/`@playwright/test` package; this repository intentionally resolves the
browser client through `playwright-core@1.61.1`. The warning is retained here and is
not renamed as an installation failure.

### Version verification

```text
node --version                         v24.19.0
npm --version                          11.17.0
npx playwright --version               Version 1.62.1
npm ls playwright-core --depth=0       playwright-core@1.61.1
```

## Verdict

`pass-with-named-warnings` — the worktree is self-sufficient for the planned gate
sweep. Dependency audit and allow-scripts warnings remain named; neither changes the
authorized Figma-only scope.
