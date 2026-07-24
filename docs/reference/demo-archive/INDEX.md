# Demo archive — inventory of the 51 pre-reconversion contracts

Mechanically generated (deterministic walk of each contract in this directory — no AI, no editorial).
Snapshot of tree `0e37de2` (tag `demo-51`), the parent of removal commit `8f462af`. See README.md for provenance, rules, and the map of every other demo-era piece (emitters, evals, parity, generated code).

**Totals**: 51 contracts — 42 slot parts in 28 contracts · 14 icon parts in 11 contracts (3 with templated `{prop}` assets) · repeat collections in 0 · nested component refs in 2 · multi-root anatomy in 0 · state-preview opt-in in 1.

**How to use this at spec time** (the 002 precedent — specs/002-governed-icons-button/research.md D2):
1. Did the demo have this component (or a cousin)? Open its row's file here.
2. Which machinery did it exercise? Every mechanism below still exists in the live schema/engine — most is dormant under Piqueray (evals quarantined by name, see evals/REMOVED-CASES.md).
3. Model the REAL Piqueray Figma source, never the demo (source-cleanliness rule in CLAUDE.md). The demo is inspiration and cautionary tale, not a template.
4. Record the steal/reject decision with reasons in the spec's research.md — 002 reused the demo's templated icon part (`icon.asset` + `{prop}`) and rejected its open slot, both with named reasons.

Columns — **Props**: count (V=VARIANT, B=BOOLEAN, T=TEXT, S=INSTANCE_SWAP, —=unbound). **Roots**: anatomy roots (★ = figmaStatePreviews opt-in). **Slots**: acceptsMode per slot part (`*` = implicit default). **Icons**: `icon.asset` values (`{prop}` = templated by a prop enum). **Repeat**: repeat-collection part. **Nested**: `component` refs (ds. prefix dropped).

| Contract | v | Props | Roots | Slots | Icons | Repeat | Nested |
|---|---|---|---|---|---|---|---|
| `ds.accordion-item` | 1.1.0 | 2 (1V 1T) | 1 | open | `{state}` | — | — |
| `ds.avatar-group` | 1.0.0 | 1 (1T) | 1 | prefer | — | — | — |
| `ds.avatar` | 1.0.0 | 2 (1V 1T) | 1 | — | — | — | — |
| `ds.badge` | 1.1.0 | 2 (1V 1T) | 1 | — | — | — | — |
| `ds.banner` | 1.0.0 | 5 (2V 1B 2T) | 1 | prefer | `{status}`, `close` | — | — |
| `ds.blockquote` | 1.0.0 | 0 | 1 | open, open | — | — | — |
| `ds.breadcrumb-item` | 1.0.0 | 3 (1B 2T) | 1 | — | `chevron-right` | — | — |
| `ds.breadcrumbs` | 1.0.0 | 1 (1T) | 1 | prefer | — | — | — |
| `ds.button` | 1.5.0 | 5 (2V 2B 1T) | 1 ★ | — | `spinner` | — | — |
| `ds.card` | 1.1.0 | 1 (1T) | 1 | open*, prefer* | — | — | [object Object] |
| `ds.chat-message-metadata` | 1.0.0 | 2 (1V 1T) | 1 | open | `{status}` | — | — |
| `ds.chat-message` | 1.1.0 | 2 (1V 1T) | 1 | prefer, open, prefer | — | — | — |
| `ds.chat-system-message` | 1.0.0 | 2 (1V 1T) | 1 | open | — | — | — |
| `ds.checkbox` | 2.0.0 | 4 (2V 2T) | 1 | — | `check`, `dash` | — | — |
| `ds.citation` | 1.0.0 | 4 (1V 3T) | 1 | — | — | — | — |
| `ds.code` | 1.0.0 | 1 (1T) | 1 | — | — | — | — |
| `ds.divider` | 1.0.0 | 1 (1V) | 1 | — | — | — | — |
| `ds.empty-state` | 1.0.0 | 2 (2T) | 1 | open, prefer | — | — | — |
| `ds.field` | 1.0.0 | 4 (1B 3T) | 1 | open | `asterisk` | — | — |
| `ds.heading` | 1.0.0 | 3 (2V 1T) | 1 | — | — | — | — |
| `ds.icon-button` | 1.0.0 | 4 (2V 1B 1T) | 1 | open | — | — | — |
| `ds.inline` | 1.0.0 | 1 (1V) | 1 | — | — | — | — |
| `ds.kbd` | 1.0.0 | 1 (1T) | 1 | — | — | — | — |
| `ds.list-item` | 1.0.0 | 2 (2T) | 1 | open, prefer | — | — | — |
| `ds.list` | 1.0.0 | 1 (1V) | 1 | prefer | — | — | — |
| `ds.metadata-list-item` | 1.0.0 | 2 (2T) | 1 | open | — | — | — |
| `ds.metadata-list` | 1.0.0 | 1 (1T) | 1 | prefer | — | — | — |
| `ds.pagination` | 1.0.0 | 3 (1V 2T) | 1 | — | `chevron-left`, `chevron-right` | — | — |
| `ds.progress-bar` | 1.0.1 | 4 (1V 3T) | 1 | — | — | — | — |
| `ds.section` | 1.0.0 | 1 (1V) | 1 | open | — | — | — |
| `ds.side-nav-item` | 1.0.0 | 3 (1V 2T) | 1 | open, prefer | — | — | — |
| `ds.skeleton` | 1.0.0 | 1 (1V) | 1 | — | — | — | — |
| `ds.slider` | 1.0.0 | 3 (3T) | 1 | — | — | — | — |
| `ds.spinner` | 1.0.0 | 1 (1T) | 1 | — | `spinner` | — | — |
| `ds.stack` | 1.0.0 | 1 (1V) | 1 | — | — | — | — |
| `ds.status-dot` | 1.0.0 | 2 (1V 1T) | 1 | — | — | — | — |
| `ds.switch` | 2.0.0 | 3 (1V 2T) | 1 | — | — | — | — |
| `ds.tab-list` | 1.0.0 | 0 | 1 | prefer | — | — | — |
| `ds.tab` | 1.0.0 | 2 (1V 1T) | 1 | open, prefer | — | — | — |
| `ds.table-cell` | 1.1.0 | 2 (1V 1T) | 1 | — | — | — | — |
| `ds.table-header-cell` | 1.1.0 | 2 (1V 1T) | 1 | — | — | — | — |
| `ds.table-row` | 1.1.0 | 1 (1V) | 1 | prefer* | — | — | — |
| `ds.table` | 1.1.0 | 1 (1V) | 1 | prefer* | — | — | [object Object] |
| `ds.text-area` | 1.0.0 | 5 (1V 1B 3T) | 1 | — | `asterisk` | — | — |
| `ds.text-field` | 1.1.0 | 6 (1V 2B 3T) | 1 | — | `asterisk` | — | — |
| `ds.toast` | 1.0.0 | 1 (1V) | 1 | open, prefer | — | — | — |
| `ds.token` | 1.1.0 | 4 (2V 1B 1T) | 1 | open, prefer | — | — | — |
| `ds.toolbar` | 1.0.0 | 2 (1V 1T) | 1 | open, open, open | — | — | — |
| `ds.top-nav-item` | 1.0.0 | 3 (1V 2T) | 1 | open | — | — | — |
| `ds.top-nav` | 1.0.0 | 1 (1T) | 1 | open, prefer, open | — | — | — |
| `ds.typeahead-item` | 1.0.0 | 2 (2T) | 1 | open | — | — | — |
