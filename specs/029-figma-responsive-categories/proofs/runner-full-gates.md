# Runner full gates — 029

Date: 2026-08-26  
Scope: final post-H3-hardening rerun, after mechanism spike, campaign capture,
dry-run preparation, and the H3 contract block.

## Commands and results

```bash
npm run eval
# 232/237 passed; exit 1

npx tsc --noEmit
# exit 0

npx tsc -p tsconfig.build.json
# exit 0
```

The three new registered eval IDs pass in the full suite, and the existing
`figma-responsive-bindings-typography-allowlisted` ID remains green. The prior
028 responsive evals also remain green.

## Named pre-existing debt

The five red IDs are byte-for-byte the same set recorded in
`HEAD:evals/results.json` before 029 runner changes:

1. `baseline-parity-clean`
2. `baseline-acknowledges-without-failing`
3. `promotion-converges`
4. `golden-generated-output`
5. `preservation-013-clobber-detected`

The current run increased the suite from `229/234` to `232/237`: exactly three
new green IDs and no new red ID. The debt is therefore named, not relabelled as
green, and no regression is attributable to the 029 runner capability.

This final rerun also covers the Page-as-traversal-only behavior, REST public-key
join, presentation-specific fixtures, wrap/card-count checks, artifact-root
routing, and existing-member identity preservation added while preparing H3.

The baseline failures currently expose six unacknowledged Figma-behind findings
for `GoogleReviewsSection`; the golden failure reports 25 generated files. These
surfaces are outside the Figma-only 029 runner scope and were not changed here.
