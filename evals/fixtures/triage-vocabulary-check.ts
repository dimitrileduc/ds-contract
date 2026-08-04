/**
 * Adversarial contract for the six-value cause vocabulary (FR-004, FR-011,
 * FR-015; decision D1).
 *
 * `CauseSlug` and its publication table `CAUSE_LABELS` ARE the FR-004
 * correspondence: "the published vocabulary and the instrument's cause
 * enumeration match, value for value, in both directions." This fixture is
 * data-only — no Chromium, no Figma, no network — but it DOES read three
 * static repo files as text (triage.ts, the committed REPORT.md, how.ts) for
 * property 5, since a retired slug surviving in prose is invisible to the
 * type system: nothing about TypeScript stops stale text from sitting in a
 * Markdown file or a hand-written HTML string.
 *
 * A green run before `CauseSlug`/`CAUSE_LABELS` exist would be a fixture
 * defect, not good news — constitution §II: fixture → eval → claim, in that
 * order.
 *
 * Reference: contracts/cause-vocabulary.md §1 (the six values, the
 * verification list), data-model.md §2 (Cause de divergence, I-2.1/I-2.2).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  TRIAGE,
  RETIRED_RULES,
  CAUSE_LABELS,
  type CauseSlug,
} from "../../extract/figma/visual-parity/triage.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "../..");

// ---------------------------------------------------------------------------
// Property 1 — CAUSE_LABELS has exactly six entries, one per CauseSlug member
// ---------------------------------------------------------------------------

const EXPECTED_SLUGS: CauseSlug[] = [
  "contract-geometry",
  "image-boundary",
  "rendering",
  "engine",
  "instrument",
  "figma-source",
];

const labelKeys = Object.keys(CAUSE_LABELS).sort();
const expectedKeys = [...EXPECTED_SLUGS].sort();
if (labelKeys.length !== 6) {
  throw new Error(
    `CAUSE_LABELS must publish exactly six entries (FR-004: a six-value closed vocabulary), got ${labelKeys.length}: ${labelKeys.join(", ")}`,
  );
}
if (JSON.stringify(labelKeys) !== JSON.stringify(expectedKeys)) {
  throw new Error(
    `CAUSE_LABELS keys must be exactly the six CauseSlug values, got [${labelKeys.join(", ")}] vs expected [${expectedKeys.join(", ")}]`,
  );
}

// ---------------------------------------------------------------------------
// Property 2 — the six labels are pairwise distinct: a BIJECTION, not merely
// a total function. A repeated label would let two slugs collapse into one
// published cause, which is the same defect as a missing one (FR-004: "value
// for value").
// ---------------------------------------------------------------------------

const labelValues = Object.values(CAUSE_LABELS);
const distinctLabels = new Set(labelValues);
if (distinctLabels.size !== labelValues.length) {
  throw new Error(
    `CAUSE_LABELS must be bijective (six distinct labels for six distinct slugs), got duplicates in: ${labelValues.join(", ")}`,
  );
}

// ---------------------------------------------------------------------------
// Property 3 — every TRIAGE rule's `class` is a CauseSlug member.
//
// Checked at runtime, not just by the TypeScript type: a stray string that
// slipped past the compiler (or a rule authored before the type narrowed)
// would still corrupt the published count. RETIRED_RULES is DELIBERATELY not
// checked here — a retired rule keeps its ORIGINAL (possibly pre-014) class
// name for the historical record (cause-vocabulary.md §4.2); it is not a
// TriageRule and does not feed the six-value count.
// ---------------------------------------------------------------------------

const badRuleClasses = TRIAGE.filter((rule) => !(rule.class in CAUSE_LABELS));
if (badRuleClasses.length > 0) {
  throw new Error(
    `Every live TRIAGE rule's class must be a CauseSlug member (FR-004). Offending subject(s): ${badRuleClasses
      .map((r) => `${r.subject}${r.variant ? ` ${r.variant}` : ""} -> "${r.class}"`)
      .join("; ")}`,
  );
}
if (TRIAGE.length === 0) {
  throw new Error("TRIAGE must not be empty — this fixture would vacuously pass property 3 otherwise");
}

// ---------------------------------------------------------------------------
// Property 3b — RETIRED_RULES names the three dead subjects (contracts
// removed at the Piqueray reconversion), each still carrying its subject,
// its ORIGINAL class, and a one-line reason for its death (cause-vocabulary.md
// §4.2: "a cause that can no longer cause anything is a datum, not garbage").
// ---------------------------------------------------------------------------

const RETIRED_SUBJECTS = ["heading", "switch", "badge"] as const;
if (RETIRED_RULES.length !== RETIRED_SUBJECTS.length) {
  throw new Error(
    `RETIRED_RULES must name exactly the three dead subjects (heading, switch, badge), got ${RETIRED_RULES.length}: ${RETIRED_RULES.map((r) => r.subject).join(", ")}`,
  );
}
for (const subject of RETIRED_SUBJECTS) {
  const entry = RETIRED_RULES.find((r) => r.subject === subject);
  if (!entry) throw new Error(`RETIRED_RULES is missing the dead subject "${subject}"`);
  if (!entry.originalClass || !entry.reason) {
    throw new Error(`RETIRED_RULES entry for "${subject}" must carry both its original class and a reason`);
  }
}
// A retired subject must NOT also live on in TRIAGE — that would mean it was
// duplicated rather than moved, contradicting "22 re-classified, 3 moved out".
for (const subject of RETIRED_SUBJECTS) {
  if (TRIAGE.some((rule) => rule.subject === subject)) {
    throw new Error(`"${subject}" is retired (cause-vocabulary.md §4.2) and must not also appear in TRIAGE`);
  }
}

// ---------------------------------------------------------------------------
// Property 4 — every value published in CAUSE_LABELS is well-formed: a
// non-empty, human-legible string distinct from its own slug (otherwise the
// "publication table" is just the slug echoed back, which is not a
// translation FR-004 can call a correspondence).
// ---------------------------------------------------------------------------

for (const slug of EXPECTED_SLUGS) {
  const label = CAUSE_LABELS[slug];
  if (typeof label !== "string" || label.trim().length === 0) {
    throw new Error(`CAUSE_LABELS["${slug}"] must be a non-empty published label`);
  }
  if (label === slug) {
    throw new Error(`CAUSE_LABELS["${slug}"] must be a human-legible label, not the slug echoed back`);
  }
}

// ---------------------------------------------------------------------------
// Property 5 — no RETIRED slug (capture-gap, renderer, harness, design)
// survives in a PUBLISHED surface: triage.ts, the committed REPORT.md,
// site/src/pages/how.ts. A textual assertion on the source, deliberately —
// the bijection only holds where the vocabulary is actually read, and none
// of these three are TypeScript modules the compiler checks for us (REPORT.md
// is Markdown; how.ts's enumeration is a hand-written string literal).
//
// Each pattern is scoped to how the retired slug would ACTUALLY appear if it
// survived, not to the bare word — "design" and "renderer" are ordinary
// English words that appear constantly in this repo's own prose (this very
// file's directory is about a "renderer"; "design system" is everywhere),
// so a bare substring search would manufacture false failures.
// ---------------------------------------------------------------------------

const RETIRED_SLUGS = ["capture-gap", "renderer", "harness", "design"] as const;

const triageSource = readFileSync(
  path.join(REPO_ROOT, "extract/figma/visual-parity/triage.ts"),
  "utf8",
);
for (const slug of RETIRED_SLUGS) {
  // Matches how a rule's own `class` field would still name a retired slug,
  // e.g. `class: 'renderer'` — not the word appearing in a doc comment.
  const pattern = new RegExp(`class:\\s*['"]${slug}['"]`);
  if (pattern.test(triageSource)) {
    throw new Error(
      `triage.ts still assigns the retired slug "${slug}" to a rule's class — re-classify it (cause-vocabulary.md §4)`,
    );
  }
}

const reportPath = path.join(REPO_ROOT, "extract/figma/visual-parity/REPORT.md");
const reportSource = readFileSync(reportPath, "utf8");
for (const slug of RETIRED_SLUGS) {
  // Matches the causeCell() render shape `| <class>: <cause> |` — the exact
  // position a retired slug would occupy if a row still carried it.
  const pattern = new RegExp(`\\|\\s*${slug}:`);
  if (pattern.test(reportSource)) {
    throw new Error(
      `${path.relative(REPO_ROOT, reportPath)} still publishes a row caused "${slug}" — regenerate after re-classifying (npm run extract:figma:visual)`,
    );
  }
}

const howTsPath = path.join(REPO_ROOT, "site/src/pages/how.ts");
const howTsSource = readFileSync(howTsPath, "utf8");
// The exact retired enumeration this file published before T020b (research.md
// §0's own citation) — checked whole, not slug-by-slug, so "design"/"renderer"
// as ordinary English words elsewhere on the page never trip this check.
const RETIRED_ENUMERATION = "engine / capture-gap / renderer / harness / design";
if (howTsSource.includes(RETIRED_ENUMERATION)) {
  throw new Error(
    `${path.relative(REPO_ROOT, howTsPath)} still publishes the retired five-value enumeration "${RETIRED_ENUMERATION}" — update to the six-value vocabulary (T020b)`,
  );
}

// ...and the converse, which the check above does NOT give: "the stale list is
// gone" is satisfied just as well by a page that dropped the list entirely.
// FR-004 is a correspondence in BOTH directions — a published surface that
// names no vocabulary at all publishes one the instrument cannot be matched
// against. So require every one of the six slugs to actually appear.
const missingFromHowTs = EXPECTED_SLUGS.filter((slug) => !howTsSource.includes(slug));
if (missingFromHowTs.length > 0) {
  throw new Error(
    `${path.relative(REPO_ROOT, howTsPath)} must publish the six-value vocabulary, missing: ${missingFromHowTs.join(", ")} — "the old list is gone" is not the same claim as "the new one is published" (FR-004, both directions)`,
  );
}

console.log(
  "✔ the six-value cause vocabulary is a verified bijection: CAUSE_LABELS carries exactly the six CauseSlug " +
    "members with distinct published labels, every live TRIAGE rule's class resolves in it, the three dead " +
    "subjects (heading/switch/badge) are named in RETIRED_RULES rather than silently dropped, none of the " +
    "four retired slugs (capture-gap/renderer/harness/design) survive in triage.ts, REPORT.md, or how.ts, " +
    "and how.ts publishes all six new slugs — both directions of the correspondence, not just the removal.",
);
