# Evidence gates

The evidence sequence is strict:

1. Pin the clean worktree and source Figma version.
2. Audit masters and scan all 45 uses by position/structure.
3. Calibrate page parity and capture every use and all nine source frames.
4. Validate the complete ledger and produce the Figma change proposal.
5. Obtain explicit owner GO in `owner-go.json`.
6. Only then may the single designated writer apply the Figma reconciliation.
7. Capture, compare, verify and run the identical second no-op pass.

No task may treat a missing, empty or dimension-mismatched capture as evidence.
Page instances and page frames are proof targets only: direct page writes are
forbidden. An Odoo addon update likewise reports saved v2 structures as stale;
it never rewrites saved page markup.

`before/`, `after/`, and `page-after/` contain immutable run evidence. Each
receipt names the contract and ledger hashes, the Figma version and the command
that produced it. A skipped live check remains a named non-qualification.
