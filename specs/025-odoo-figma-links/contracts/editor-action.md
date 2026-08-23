# Editor action contract

Available panels show exactly `Ouvrir dans Figma` with an external-navigation affordance. Unavailable panels show non-actionable `Référence Figma indisponible`, without URL or fallback. The option appears only when the selection matches exactly one generated Piqueray selector.

Activation MUST build an HTTPS URL under `www.figma.com/design/{fileKey}`, set `node-id` from the governed `nodeId`, and call `window.open` with target `_blank` and features `noopener,noreferrer` during the click. Selection, DOM, undo stack and save state remain unchanged. A blocked popup never navigates the editor tab. The opened context has no usable `window.opener`.

Qualification MUST refuse by name an unknown/duplicate panel, unknown contract, version mismatch, missing/malformed `fileKey` or precise `nodeId`, unmatched registered Piqueray option, or mapping to a native/third-party selector.
