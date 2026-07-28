# Figma IMAGE-paint fixtures

These are the original bytes behind the relevant Figma `IMAGE` paints, fetched
read-only from `GET /v1/files/:fileKey/images`. They are visual-parity evidence:
the code renderer may pass them through the existing code-only image URL props,
but generated components must not use them as runtime defaults.

Provenance is pinned in `manifest.json` to Figma file version
`2381229993207753432`, with component, variant and paint node IDs, image refs,
dimensions, byte lengths and SHA-256 hashes. Signed CDN URLs and the Figma token
are deliberately never persisted.

Regenerate/verify from the repository root:

```sh
set -a
source .env.local
set +a
node extract/figma/visual-parity/fixture-assets/fetch.mjs
```

The script performs only HTTP `GET` requests and refuses to write a file whose
bytes do not match the pinned receipt.
