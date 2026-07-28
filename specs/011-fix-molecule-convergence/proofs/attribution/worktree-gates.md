# Worktree gate environment

- Captured: 2026-07-28 (Europe/Brussels)
- Git HEAD / WIP baseline: `29d70187cdb7c7e45ca3bbc4f2d75da64bcd31b5`
- Historical checkpoint: `45e2a7d5a950e3d6ccc2a0dd62982b7c288210c5`
- Node.js: `v24.14.0`
- npm: `11.9.0`
- Playwright Core: `1.61.1`

## Provisioning receipts

| Command | Exit | Receipt |
|---|---:|---|
| `npm install` | 0 | dependencies resolved and 212 packages audited |
| `npx playwright-core install chromium` | 0 | Chromium browser installation completed |

`npm install` reported two upstream high-severity audit advisories. No audit remediation
was applied because it would be an unrelated dependency mutation.
