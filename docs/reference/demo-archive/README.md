# Demo archive (read-only)

The 51 demo contracts + the demo-era generated JSON Schema (`contract.schema.json`), byte-identical to tree `0e37de2` (tag **`demo-51`**) — the parent of `8f462af` *"repo is Piqueray — 51 demo removed"*, which deleted them on 2026-07-22. Materialized from git history on 2026-07-24 so every future component spec can consult them without git archaeology. `INDEX.md` is the mechanical inventory: which machinery each contract exercised (slots, icons, repeat, nested refs).

**Why this exists.** Before modeling a new Piqueray component, look at how the demo modeled it — then steal or reject *with named reasons* in the spec's research.md. Precedent: 002 reused the demo's templated icon part (`icon.asset` + `{prop}` interpolation) and rejected its open slot (research.md D2).

## What `8f462af` deleted vs what is still alive

Only the **sources and outputs** were deleted. The **machine** survived and is the code running today.

| Demo-era piece | Fate | Where to look now |
|---|---|---|
| 51 contracts (the source of truth) | deleted | **this directory** (byte-identical), or `git show demo-51:contracts/<x>.contract.json` |
| Generated React (52 dirs: tsx, module.css, stories) | deleted | `git show demo-51:src/components/<X>/<X>.tsx` |
| Demo tokens (multi-brand, dark) | deleted | `git show demo-51:tokens/semantic.tokens.json` (etc.) |
| Demo icon SVGs (21 files) | deleted | `git ls-tree demo-51 assets/icons/` — **not Piqueray artwork**: same-named files drew different glyphs (see `docs/handoff/10-history.md`, spec 002) |
| catalog/, figma-sync scripts, demo screens | deleted | `git ls-tree -r demo-51 catalog/ figma-sync/ src/screens/` |
| **Emitters** (`core/emit-*.ts`: slots→INSTANCE_SWAP, `icon.asset` inlining, repeat, multi-root) | **alive, unchanged in kind** | current `core/` — dormant under Piqueray; drift since demo-51 is small and named (`git diff --stat demo-51 HEAD -- core/` ≈ 11 files: mono-theme, v15/v16, 002 swapEnums) |
| **Parity** (diff/judge/diagnose) | **alive** | current `parity/` — demo-era snapshots+verdicts: `git show demo-51:parity/snapshots/figma-components.json`, `…:parity/report.json` |
| **Schema machinery** (slot/acceptsMode/icon/repeat/meter…) | **alive** | `packages/schema/src/contract-schema.ts` — fields kept, most unexercised by Piqueray |
| **Evals** | transformed, not lost | demo suite (~146 cases): `git show demo-51:evals/run.ts`; removed cases named in `evals/REMOVED-CASES.md` (at HEAD); ~51 quarantined pending Piqueray features; `golden.json` is a sha256 manifest, never content |

Note from the inventory: in the final 51, collections were modeled as **slots**, not `repeat` — the repeat machinery was exercised only by eval fixtures.

## Rules

- **Reference only — never build input.** All contract discovery is `readdirSync` on `contracts/` (non-recursive, verified 2026-07-24); nothing scans this directory. Never copy a file into `contracts/` as-is.
- **Frozen history — do not edit.** To change what the archive shows, re-extract: `git show demo-51:contracts/<f> > docs/reference/demo-archive/<f>`.
- They target the demo-era schema and demo tokens (`{color.action.*}`, `{space.*}`…) that no longer exist; several would fail current validation by design.
- Model the **real Piqueray Figma source**, never the demo (source-cleanliness rule). The demo is inspiration and cautionary tale, not a template.
