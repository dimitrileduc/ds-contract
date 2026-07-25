/**
 * The visual-parity instrument's tolerance line, in its own side-effect-free
 * module. `run.ts` is a CLI entry point (its top-level `main().catch(...)`
 * runs on import) — reused verbatim by extract/figma/state-photo/run.ts for
 * page-over-time comparisons (schema-additions.interface.md §6: no new
 * threshold), which must import the constant WITHOUT also triggering
 * visual-parity's own CLI against its caller's process.argv.
 */
export const THRESHOLD_PCT = 2.0;
