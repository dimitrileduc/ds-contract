# HeroVideo responsive proofs

This directory contains only reproducible evidence for `027-responsive-hero-video`; it is not a place for hand-written success claims.

## Artifact naming

Use `<gate-or-phase>-<surface>-<witness-or-probe>-<fixture>-<run>.<ext>` in lowercase kebab case. Examples:

- `H1-master-wide-1728-default-before.png`
- `US4-reference-web-desktop-1200-long-title-first.json`
- `H4-figma-reference-wide-1440-default-second.png`

Every manifest item names a stable `artifactId`, its role (`structure`, `properties`, `facts`, `png`, `measurement`, or `comparison`), the source surface, and the producing command.

## Exact viewport and conditions

Each screenshot and measurement records the actual browser/Figma viewport width and height, root width, composition, witness or boundary id, fixture digest, content case, media case, font/locale state, source pin, capture timestamp, byte length, and SHA-256. A CSS render width, clipped canvas, or outer editor window is never substituted for the measured viewport.

Standalone manifests must contain non-optional `freshness`, `conditions`, `comparisons`, and `artifacts` blocks. Every artifact links to one comparison through `comparisonId`; its `fixtureId`, `conditionsDigest`, `sourcePin`, declared dimensions, and raster dimensions must match that comparison and the manifest. Missing context is invalid evidence, not a permissive default.

## Integrity and freshness

Artifacts are valid only when their path resolves, bytes are non-empty, their byte length and SHA-256 match, the PNG/JPEG is readable, raster dimensions equal both their declared dimensions and the comparison viewport, and their fixture/source conditions match the comparison. A capture becomes stale when its source pin, decision digest, fixture digest, or target viewport differs from the record under review. A timestamp older than the declared floor/window or later than the validation clock is rejected.

## Surface pairs

Each accepted witness has exactly two matched-condition comparisons: `figma → reference-web` and `reference-web → odoo`. Required witnesses are `mobile-390`, `tablet-834`, `desktop-1200`, and `wide-1728`; this produces eight distinct pairs. `wide-1440` is a separate continuity check, not a fifth witness. Duplicate source/destination/witness/fixture/viewport pairs are invalid.

For a given witness, both comparison legs must use the same `fixtureId`, `conditionsDigest`, and exact viewport height. In the accepted ledger every nested artifact is reopened by the artifact validator; paths and digests are never trusted because the ledger says `status: valid`.

## Capture lifecycle

The campaign requires `before`, `after`, and `idempotence` captures for each target. `before` capture files are completed and checked before a Figma write. The `second` run must report no created, changed, duplicated, or Page node IDs. Missing or invalid evidence is reported as a failed or blocked claim, never filled from an older capture.
