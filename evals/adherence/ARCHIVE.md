# Adherence A/B — archived 2026-07-22

**Nothing here describes Piqueray.** This experiment was run against the
**retired 51-component demo design system**. It was removed from the Contract
Hub during the Piqueray reconversion because it was rendering next to live
Piqueray numbers, where a demo result reads as a Piqueray capability.

Nothing was deleted. The protocol, the judge, the generated screens and the
recorded reports are all still here — see *Re-running it* below.

## What the experiment measured

One question: **does giving an AI the governed catalog change what it
produces?**

Same model, same five tasks, two arms differing by exactly one thing:

| Arm | What the model was given |
|---|---|
| `arm-a` | the compiled catalog — components, their APIs, tokens, org rules |
| `arm-b` | only the package name and a list of component names, no APIs |

Then `parity/judge.ts` — a **deterministic program, not a model** — walks every
element of every generated file and checks it against the org rules
(`context/rules.json`). The measurement is therefore not an opinion, and the
two arms are comparable because they differ in one variable.

A screen counts as **adherent** only at *zero* violations, not "few".

## The recorded result (demo catalog, not Piqueray)

|  | Mean score | Adherent screens | Violations |
|---|---|---|---|
| With the governed catalog | 100 | 5 / 5 | 0 of 253 checks |
| Without | 69 | 0 / 5 | 90 of 283 checks |

Ungoverned violations by rule: `components-from-catalog` **65**, `tokens-only`
**22**, `no-style-overrides` **3**.

The shape of the failure is the interesting part, more than the scores: without
the catalog the model did not build *slightly worse* screens — it **rebuilt a
parallel design system of its own**, 65 times out of 90. The check counts differ
(253 vs 283) because the ungoverned arm emitted more elements, so there was more
to check.

The five screens — `account-overview`, `notification-center`, `pricing-section`,
`team-settings`, `user-directory` — are B2B product pages matching the demo
system's brief. They were never Figma designs; they are generated `.tsx` files
kept as evidence.

## Also archived with it

The Contract Hub's **"Show the gaps, never fake it"** section quoted this same
experiment: the governed generator wanted a table header cell, found no legal
parent slot (`Table` accepted only `TableRow`, `TableRow` only `TableCell`), and
**reported the gap in its own output instead of faking a lookalike** — after
which the contract's `accepts` list was widened through the normal promotion
loop. It is a good demonstration of the product's central claim, and it is about
`ds.table`/`ds.table-row`, both retired. It goes in the freezer with the rest.

## What is still live

The **judge is not archived**. `parity/judge.ts` runs against the current
catalog, and the Contract Hub's Governance page still offers the judge
playground: paste any screen, get a deterministic verdict. Only the *recorded
A/B result* is historical.

## Re-running it for Piqueray — and why not yet

Re-running is mechanically easy and mostly automated:

```bash
# 1. (manual) generate 5 screens twice — arm-a with the catalog in context,
#    arm-b with only the component names. Write them to evals/adherence/arm-{a,b}/.
# 2. (deterministic, one command)
npm run adherence:aggregate      # tsx evals/adherence/aggregate.ts
```

`aggregate.ts` runs the judge over both arms and rewrites `results.json`. Only
step 1 needs a human to drive a model.

**Two things must come first, or the number will measure the wrong thing.**

1. **The org rules must describe Piqueray.** Four of the six in
   `context/rules.json` still name things that do not exist here:
   `layout-via-primitives` ("compose with Stack and Inline"), `avatars-are-people`,
   `one-primary-action` (Piqueray's Button has no `primary` variant — its values
   are default/orange/blanc/outlineBlanc/link/outlineNoir), and
   `no-raw-equivalents` (forbids `table`, `input`, `select`, for which no
   component is offered). `context/memory.md` likewise still describes
   "data-dense B2B product surfaces". A judge enforcing rules about absent
   components measures nothing.

2. **The catalog must be big enough to build a screen from.** Piqueray ships
   **one** component. The heaviest rule, `components-from-catalog`, requires every
   UI element to come from the catalog — so the *governed* arm would fail too, for
   lack of a nav, a card, a heading, an input. The experiment would then be
   measuring "Piqueray is incomplete", which is true, already known, and not the
   question. Roughly 8–15 components makes it meaningful again.

Until then this is history, and the Contract Hub says so rather than showing it.
