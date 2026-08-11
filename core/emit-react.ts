/**
 * Contract → React code emission — the PURE core of scripts/generate-components.ts.
 *
 * Everything here is string-in/string-out: contract + token inventory +
 * icon assets in, TSX / CSS Module / stories text out. No node:* imports —
 * this module runs unchanged in a browser (see core/index.ts and
 * npm run core:browser-check). The CLI shell (scripts/generate-components.ts)
 * owns file discovery, prettier formatting, and writes; its output is
 * byte-guarded by evals/golden.json.
 *
 * Composition semantics (see docs/02 + docs/08):
 *   - anatomy is a nested tree; each part becomes a class-named element
 *   - `component` parts render fixed instances of other contracts (imported)
 *   - `slot` parts render {children} (name "children") or a ReactNode prop
 *   - `content` parts render a bound text prop
 *   - optional parts render conditionally on their slot prop
 */
import {
  DECLARED_CHANNELS,
  LITERAL_CHANNELS,
  STATE_PREVIEW_PROPERTY,
  STYLES_WHEN_ALLOWED,
  isNativeCheckablePart,
  pascal,
  shapeCssDecls,
  slotsOf,
  statePreviewSubstProps,
  tokensByPropEntries,
  walkAnatomy,
  CATEGORY_LABELS,
  type ComponentPropValue,
  type Contract,
  type Part,
  type Prop,
  type RichTextSegment,
  SLOT_CONTROL_STYLE_CHANNELS,
} from '../scripts/contract-schema.js';

/** Inset channels — meaningless (and silently dropped by CSS) on a part
 *  that is not absolutely positioned. */
const INSET_CHANNELS = ['top', 'right', 'bottom', 'left'] as const;

/** v11 SEMANTIC LINT — roles that RE-CREATE a control the platform already
 *  ships. A contract claiming one of these roles (semantics.role, a
 *  roleByProp value, or a part's attrs.role) on an element outside the
 *  allowed native hosts REFUSES at validation time, on every surface, unless
 *  it declares the exception (semantics.roleException for root-level claims,
 *  part.roleException for part-level ones) — a one-sentence reason that
 *  renders on the spec sheet so it is reviewable, never silent. Bounded by
 *  design: exactly the roles with a native equivalent; APG composites
 *  (tablist, option, toolbar, …) are not in the table. */
export const NATIVE_ROLE_HOSTS: Record<string, { hosts: string[]; native: string }> = {
  checkbox: { hosts: ['input'], native: '<input type="checkbox">' },
  radio: { hosts: ['input'], native: '<input type="radio">' },
  switch: { hosts: ['input'], native: '<input type="checkbox"> (role="switch" on it is the modern switch pattern)' },
  button: { hosts: ['button'], native: '<button>' },
  link: { hosts: ['a'], native: '<a href>' },
  textbox: { hosts: ['input', 'textarea'], native: '<input> / <textarea>' },
  slider: { hosts: ['input'], native: '<input type="range">' },
  progressbar: { hosts: ['progress'], native: '<progress>' },
  spinbutton: { hosts: ['input'], native: '<input type="number">' },
};

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const stripBraces = (ref: string) => ref.slice(1, -1);
const cssVar = (tokenPath: string) => `var(--${tokenPath.split('.').join('-')})`;

function placeholdersIn(refPath: string): string[] {
  return [...refPath.matchAll(/\{([a-z][\w-]*)\}/g)].map((m) => m[1]);
}

const STATE_SELECTORS: Record<string, string> = {
  hover: ':hover:not(:disabled)',
  active: ':active:not(:disabled)',
  'focus-visible': ':focus-visible',
  disabled: ':disabled',
};

/** v13 (P18 second half): the channels a NON-root part's `states` may carry —
 *  color-kind only, bounded by the field evidence (the CBDS disabled label
 *  drew #556275 on the #dfe3eb root; extend only when fixtures demand more).
 *  The root keeps its full state vocabulary (outline-*, opacity, radius, …). */
export const PART_STATE_CHANNELS = new Set(['color', 'background-color', 'border-color']);

/** Elements the UA stylesheet gives default MARGINS. A component's box is
 *  contract-governed — spacing between components belongs to the composing
 *  layout, never to a UA default leaking through (field failure: Heading's
 *  h1-h6 carried the UA's 0.67em block margins into every composition). The
 *  emitters neutralize margin on the root class when the root can render as
 *  one of these (semantics.element or any elementByProp value). */
export const UA_MARGIN_ELEMENTS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'blockquote', 'figure', 'hr', 'ul', 'ol', 'dl', 'dd', 'pre', 'fieldset',
]);

/** A CSS `border` always grows an auto-sized box outward; Figma strokes draw
 *  INSIDE the frame (its own bbox never changes). `--dsc-*` custom properties
 *  let a `box-shadow: inset` stand in for the border without growing the box
 *  — same paint, matching geometry. Root-only: a nested part's own border
 *  never grows the ROOT's box, so it keeps the plain `border-style` path. */
export const DSC_BORDER_VARS: Record<string, string> = {
  'border-width': '--dsc-border-width',
  'border-bottom-width': '--dsc-border-bottom-width',
  'border-color': '--dsc-border-color',
};
export interface RootBorderPlan {
  hasBorder: boolean;
  /** False disengages the inset rewrite (kept on the legacy `border-style`
   *  path) whenever the uniform inset spread cannot express what the root
   *  is doing: per-side widths, a root box-shadow of its own (which would
   *  overwrite the inset — box-shadow is not additive across declarations),
   *  or a declared non-solid border-style (dashed/dotted). Named limit: the
   *  inset box-shadow disappears under `forced-colors` — no fallback yet. */
  inset: boolean;
  side: 'uniform' | 'bottom' | null;
}
export function rootBorderPlan(root: Part): RootBorderPlan {
  const chans = new Set<string>();
  const collect = (o?: Record<string, unknown>) => {
    for (const k of Object.keys(o ?? {})) chans.add(k);
  };
  collect(root.tokens);
  collect(root.literals);
  for (const e of tokensByPropEntries(root)) for (const m of Object.values(e.map)) collect(m);
  for (const e of root.literalsByProp ?? []) for (const m of Object.values(e.map)) collect(m);
  for (const s of Object.values(root.states ?? {})) collect(s);
  const sides = [...chans].filter((c) => /^border-(top|right|bottom|left)-width$/.test(c));
  const bottomOnly = sides.length === 1 && sides[0] === 'border-bottom-width' && !chans.has('border-width');
  const hasBorder =
    'border-width' in (root.tokens ?? {}) ||
    'border-color' in (root.tokens ?? {}) ||
    'border-width' in (root.literals ?? {}) ||
    sides.length > 0;
  const declaredStyle =
    Boolean(root.declared?.['border-style']) ||
    Object.values(root.declaredStates ?? {}).some((o) => 'border-style' in o);
  const canInset = hasBorder && !chans.has('box-shadow') && !declaredStyle;
  return {
    hasBorder,
    inset: canInset && (sides.length === 0 || bottomOnly),
    side: canInset && bottomOnly ? 'bottom' : canInset && sides.length === 0 ? 'uniform' : null,
  };
}
export const INSET_BORDER_SHADOW =
  'box-shadow: inset 0 0 0 var(--dsc-border-width, 0) var(--dsc-border-color, transparent)';
export const BOTTOM_INSET_BORDER_SHADOW =
  'box-shadow: inset 0 calc(-1 * var(--dsc-border-bottom-width, 0)) 0 var(--dsc-border-color, transparent)';

/** Every element the contract's root can render as. */
export function rootElementsOf(contract: Contract): string[] {
  const ebp = contract.semantics.elementByProp;
  return [contract.semantics.element, ...(ebp ? Object.values(ebp.map) : [])];
}

// ---------------------------------------------------------------------------
// Multi-root anatomy (advanced composition). The schema has ALWAYS modeled
// anatomy as Record<string, Part> (a map of top-level roots); the single-root
// case — one entry named "root" — is the N=1 special case, not a different
// shape. A captured composite (a Modal = {dialog, backdrop}) carries >1
// top-level entry. These helpers name the general case so the emitters and
// validator stop hardcoding `contract.anatomy.root`.
//
// INVARIANT: for every single-root contract these are byte-for-byte the old
// behavior — `topRoots` yields exactly [["root", root]] and `isMultiRoot`
// is false, so the untouched single-root code paths run verbatim.
// ---------------------------------------------------------------------------

/** Every top-level anatomy entry (root), in declaration order. */
export const topRoots = (contract: Contract): Array<[string, Part]> =>
  Object.entries(contract.anatomy);

/** The names of the top-level roots — the set a single-root contract reduces
 *  to `{ "root" }`. */
export const topRootNames = (contract: Contract): Set<string> =>
  new Set(topRoots(contract).map(([n]) => n));

/** True when the contract declares MORE THAN ONE top-level root (a captured
 *  composite). A single-root contract is false. */
export const isMultiRoot = (contract: Contract): boolean => topRoots(contract).length > 1;

/** v7 overlay: placement → inset declarations. The overlay part is
 *  position:absolute against the root (which becomes position:relative). */
const OVERLAY_CSS: Record<string, string[]> = {
  top: ['bottom: 100%', 'left: 0'],
  bottom: ['top: 100%', 'left: 0'],
  start: ['right: 100%', 'top: 0'],
  end: ['left: 100%', 'top: 0'],
};

const ALIGN_CSS: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
};
const JUSTIFY_CSS: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  'space-between': 'space-between',
};

export const isEnum = (p: Prop): p is Prop & { type: { enum: string[] } } =>
  typeof p.type === 'object' && 'enum' in p.type;

/** v7: structured/array prop — code-only (bindings.figma.kind 'NONE').
 *  v16: a field may be a scalar kind OR an enum (`{ enum: [...] }`). */
export type ArrayFieldType = 'text' | 'number' | 'boolean' | { enum: string[] };

export const isArrayType = (
  p: Prop,
): p is Prop & { type: { arrayOf: Record<string, ArrayFieldType> } } =>
  typeof p.type === 'object' && 'arrayOf' in p.type;

/** The TS type an arrayOf field renders as inside `Array<{ … }>`. An enum
 *  field spells a LITERAL UNION — the whole point of carrying it as an enum
 *  rather than as free text (a `string` would type any value as valid). */
export const arrayFieldTsType = (t: ArrayFieldType): string =>
  typeof t === 'object' ? t.enum.map((v) => `'${v}'`).join(' | ') : t === 'text' ? 'string' : t;

/** A field's name for messages and comparisons: 'text' | 'number' | 'boolean'
 *  | 'enum' (the enum's own values are spelled where they matter). */
export const arrayFieldKind = (t: ArrayFieldType): string =>
  typeof t === 'object' ? `enum ${t.enum.join('|')}` : t;

/** Structured mixed-style text: native TEXT on the canvas, bounded segment
 * data in code. Raw HTML is deliberately not part of the contract surface. */
export const isRichText = (
  p: Prop,
): p is Prop & {
  type: 'rich-text';
  default?: Array<{ text: string; strong?: boolean }>;
} => p.type === 'rich-text';

export function richTextPlain(
  value: Array<{ text: string; strong?: boolean }> | undefined,
): string {
  return value?.map((segment) => segment.text).join('') ?? '';
}

/** v19: a LITERAL part text split into its observed strong ranges, as JSX.
 * Every range is a string EXPRESSION — the one spelling JSX cannot reflow, so
 * a "\n" inside a range reaches the DOM (see literal-text-newline-preservation).
 * `<strong>` stays a DIRECT child of the part so the governed
 * `.part > strong` weight rule applies. `strongAttrs` carries the inline
 * surface's resolved style; the CSS-module surface passes nothing. */
/** Figma spells line breaks THREE ways in the same file (all observed in the
 * Piqueray source): "\n", "\r" (contact 2104:2891) and U+2028 LINE SEPARATOR
 * (adresse 2104:2885 — invisible in every printout). Contracts keep the source
 * bytes; EMISSION normalizes to "\n", the only separator `white-space:
 * pre-line` breaks on.
 *
 * A RUN of adjacent separators is ONE break — MEASURED, not assumed. Node
 * 2104:2891 puts "\r" and U+2028 back to back, and Figma draws that node
 * 54 px tall: exactly 2 × its 27 px line height — one break, with its
 * paragraphSpacing 8 not applied. Normalizing each separator independently
 * emits "\n\n" and invents a blank third line. Named consequence: a
 * deliberately blank line spelled "\n\n" collapses the same way — no
 * contract carries one (the whole catalog holds exactly ONE separator run,
 * this node's).
 */
export const normalizeLineSeparators = (text: string): string =>
  text.replace(/[\n\r\u2028\u2029]+/g, '\n');
export const HAS_LINE_SEPARATOR = /[\n\r\u2028\u2029]/;

/** True when a literal part carries at least one underlined range. */
export const hasUnderlinedSegment = (part: Part): boolean =>
  (part.textSegments ?? []).some((segment) => segment.underline);

/** The declared decoration for `<u>` ranges. `text-decoration-line` has no
 * token vocabulary — it is a keyword channel — so the rule is emitted
 * EXPLICITLY rather than left to `<u>`'s UA default, the same discipline the
 * governed `> strong` weight follows. A DESCENDANT selector, because a range
 * that is both bold and underlined nests `<u>` inside `<strong>`. */
export const underlineRule = (selector: string): string =>
  `${selector} u {\n  text-decoration-line: underline;\n}`;

/** Marked-range boundaries and line-break runs are INDEPENDENT in the source,
 * so a run can straddle them: node 2104:2891 ends its underlined phone range
 * with "\r" and opens the next range with U+2028. Two things follow, and both
 * are handled here rather than per segment.
 *
 * 1. The run must still collapse to ONE break ACROSS the boundary — normalizing
 *    each segment on its own would emit "\n" + "\n" and invent the blank line
 *    the collapse rule exists to prevent.
 * 2. A break carries no glyph, so it is not a range of TEXT to decorate: the
 *    breaks are hoisted OUT of the marks and only the visible core stays
 *    wrapped. NAMED RESIDUAL — Figma does underline the "\r"'s advance, so its
 *    rule runs about one character past the phone number; the hoisted spelling
 *    stops at the last digit. The alternative (a break left inside `<u>` under
 *    `pre-line`) makes the decoration's extent depend on how the engine sizes a
 *    forced break, which is a bigger and less predictable error than the tail
 *    it would recover. coordonnees measures 0.52 % with the hoisted spelling. */
/** One piece of a literal, after break RUNS are collapsed and the breaks are
 *  hoisted out of the marks. A break carries no glyph, so it is never a range
 *  of TEXT and never wears a mark. */
export type LiteralRange =
  | { break: true }
  | { break?: false; text: string; strong?: boolean; underline?: boolean };

/** Reduce a literal's segments to those pieces.
 *
 *  This is surface-INDEPENDENT: which breaks survive and where the marks stop
 *  are facts about the Figma source, not about JSX or HTML. Both emitters read
 *  it, so they can no longer tell different stories about one paragraph — and
 *  they did: the HTML surface used to normalize each segment on its own, which
 *  spelled the "\r"+U+2028 straddle as TWO breaks where the source draws one,
 *  and left the break inside `<u>`. Only the React copy had an eval. */
export function literalSegmentRanges(segments: Array<RichTextSegment>): LiteralRange[] {
  const out: LiteralRange[] = [];
  let pendingBreak = false; // a break owed at this point
  let emittedAnything = false;

  for (const segment of segments) {
    const normalized = normalizeLineSeparators(segment.text);
    const leading = /^\n+/.exec(normalized)?.[0] ?? '';
    const trailing = normalized.length > leading.length ? (/\n+$/.exec(normalized)?.[0] ?? '') : '';
    const core = normalized.slice(leading.length, normalized.length - trailing.length);

    if (leading) pendingBreak = true;
    if (core) {
      // A leading break before any visible text would push the whole paragraph
      // down a line — the source never opens with one, and swallowing it here
      // keeps that honest rather than inventing leading whitespace.
      if (pendingBreak && emittedAnything) out.push({ break: true });
      pendingBreak = false;
      out.push({ text: core, strong: segment.strong, underline: segment.underline });
      emittedAnything = true;
    }
    if (trailing) pendingBreak = true;
  }
  // A break left owed at the very END stays unemitted: under `pre-line` it
  // would add an empty final line to the box, which the source does not draw
  // (2104:2891 measures 54 px — two lines, not three). A break in the MIDDLE of
  // a segment is untouched: it belongs to that range's own text.
  return out;
}

export function literalSegmentsJsx(
  segments: Array<RichTextSegment>,
  strongAttrs = '',
  /** The inline surface has no stylesheet, so it carries the declared
   *  decoration on the element; the CSS-module surface passes nothing and
   *  relies on its `.part u` rule. */
  underlineAttrs = '',
): string {
  const expr = (text: string) => `{${JSON.stringify(text)}}`;
  let out = '';
  for (const range of literalSegmentRanges(segments)) {
    if (range.break) {
      out += expr('\n');
      continue;
    }
    let inner = expr(range.text);
    // <u> renders the observed underline ranges (coordonnees: the phone and
    // the email are underlined, their labels are not); marks compose.
    if (range.underline) inner = `<u${underlineAttrs}>${inner}</u>`;
    if (range.strong) inner = `<strong${strongAttrs}>${inner}</strong>`;
    out += inner;
  }
  return out;
}

/** Resolve the backward-compatible scalar strong mark and the richer Figma
 * mixed-style spelling into CSS/inline-style names.  The weight stays a token
 * reference; optional size and line-height are already bounded literals in
 * the contract schema. */
export function richTextStrongStyle(
  mark: string | { 'font-weight': string; 'font-size'?: string; 'line-height'?: string } | undefined,
): { fontWeight?: string; fontSize?: string; lineHeight?: string } {
  if (!mark) return {};
  const source = typeof mark === 'string' ? { 'font-weight': mark } : mark;
  return {
    fontWeight: source['font-weight'],
    fontSize: source['font-size'],
    lineHeight: source['line-height'],
  };
}

export function enumProps(contract: Contract) {
  return contract.props.filter(isEnum);
}
export function boolProps(contract: Contract) {
  return contract.props.filter((p) => p.type === 'boolean');
}
export function numberProps(contract: Contract) {
  return contract.props.filter((p) => p.type === 'number');
}
export function arrayProps(contract: Contract) {
  return contract.props.filter(isArrayType);
}
export function textProps(contract: Contract) {
  return contract.props.filter((p) => p.type === 'text');
}
export function richTextProps(contract: Contract) {
  return contract.props.filter(isRichText);
}
export function namedTextProps(contract: Contract) {
  return textProps(contract).filter((p) => p.bindings.code.prop !== 'children');
}
export function namedRichTextProps(contract: Contract) {
  return richTextProps(contract).filter((p) => p.bindings.code.prop !== 'children');
}
export function namedSlots(contract: Contract) {
  return slotsOf(contract).filter((s) => s.slot.name !== 'children');
}
export function textDefault(contract: Contract): string {
  const text = textProps(contract).find((p) => p.bindings.code.prop === 'children');
  return typeof text?.default === 'string' ? text.default : contract.name;
}

/** A part that lays out BOXES. A part that hosts TEXT does not: `display: flex`
 *  there turns every inline run into a flex item, so the whitespace between
 *  them collapses to nothing — `La ` + <strong>performance</strong> renders
 *  "Laperformance". `content` parts were already excluded for this reason;
 *  v19 marked literals made the same defect reachable through `text`
 *  (ds.hero's sub-title declares `layout.grow` on a literal paragraph). The
 *  part stays a flex ITEM of its parent — `grow` is emitted either way.
 *
 *  Classifying a PART is a fact about the contract, not about any one output
 *  format, so every emitter shares this one definition — `emit-html.ts` and
 *  `emit-react-inline.ts` import it here. Three private copies drifted apart
 *  once already: the `text` clause had to be added to each by hand. */
export const isStructural = (part: Part) =>
  Boolean(part.parts || part.slot || part.layout || part.layoutByProp) &&
  !part.content &&
  part.text === undefined &&
  !part.component;

/** CSS declarations for a layoutByProp override (v7). Reversed directions
 *  are plain CSS here; the canvas resolves them by reversing child order. */
function layoutOverrideDecls(o: {
  display?: string;
  direction?: string;
  align?: string;
  justify?: string;
}): string[] {
  const d: string[] = [];
  if (o.display) d.push(`display: ${o.display}`);
  if (o.direction) d.push(`flex-direction: ${o.direction}`);
  if (o.align) d.push(`align-items: ${ALIGN_CSS[o.align]}`);
  if (o.justify) d.push(`justify-content: ${JUSTIFY_CSS[o.justify]}`);
  return d;
}

// ---------------------------------------------------------------------------
// Contract-level validation (beyond the Zod schema)
// ---------------------------------------------------------------------------

/** Component refs must form a DAG — the emitters render composition by
 *  recursion, so a contract that composes itself (directly or through a
 *  chain of dependencies) is infinite anatomy. The field failure mode is a
 *  'Maximum call stack size exceeded' crash instead of a named refusal
 *  (live repro: a hand-edited ds.button whose anatomy kept a ds.button
 *  instance). Walks the ref graph (component refs + slot defaultContent)
 *  from `startId`, treating `fromId` as already on the path; returns the
 *  cycle spelled out (e.g. [ds.button, ds.button]) or null. Contracts
 *  missing from `byId` end the walk — their absence is its own refusal. */
function findComponentCycle(
  fromId: string,
  startId: string,
  byId: Map<string, Contract>,
): string[] | null {
  const acyclic = new Set<string>(); // fully explored, no cycle reachable
  const visit = (id: string, path: string[]): string[] | null => {
    const at = path.indexOf(id);
    if (at >= 0) return [...path.slice(at), id];
    if (acyclic.has(id)) return null;
    const dep = byId.get(id);
    if (!dep) return null;
    const next = [...path, id];
    for (const w of walkAnatomy(dep)) {
      const targets = [
        ...(w.part.component ? [w.part.component.id] : []),
        ...Object.values(w.part.component?.slots ?? {}).map((item) => item.id),
        ...(w.part.slot?.defaultContent ?? []).map((item) => item.id),
      ];
      for (const t of targets) {
        const cycle = visit(t, next);
        if (cycle) return cycle;
      }
    }
    acyclic.add(id);
    return null;
  };
  return visit(startId, [fromId]);
}

export function validateContract(
  contract: Contract,
  byId: Map<string, Contract>,
  errors: string[],
  iconAssets: Map<string, string>,
) {
  const hasChildrenText = (dep: Contract) =>
    dep.props.some((p) => p.type === 'text' && p.bindings.code.prop === 'children');
  const scalarKind = (prop: Prop): 'boolean' | 'number' | 'text' | 'enum' | null => {
    if (prop.type === 'boolean' || prop.type === 'number' || prop.type === 'text') return prop.type;
    return isEnum(prop) ? 'enum' : null;
  };
  /** How a prop's shape reads in a refusal message. */
  const kindLabel = (prop: Prop): string =>
    isRichText(prop) ? 'rich-text' : (scalarKind(prop) ?? 'structured');
  const compatibleScalarProps = (parent: Prop, child: Prop): boolean => {
    // v19: a live mapping into a rich-text child prop requires a rich-text
    // PARENT prop. Threading a flat string in would strip the marks the child
    // is now able to carry, and threading segments into a flat prop would
    // stringify them — both directions refuse.
    if (isRichText(parent) || isRichText(child)) return isRichText(parent) && isRichText(child);
    const parentKind = scalarKind(parent);
    const childKind = scalarKind(child);
    if (!parentKind || !childKind || parentKind !== childKind) return false;
    return !isEnum(parent) || !isEnum(child) || parent.type.enum.every((value) => child.type.enum.includes(value));
  };
  const seen = new Set<string>();
  for (const { name, path: p, part } of walkAnatomy(contract)) {
    if (seen.has(name)) errors.push(`${contract.id}: duplicate anatomy part name "${name}"`);
    seen.add(name);
    if (part.component) {
      const dep = byId.get(part.component.id);
      if (!dep) {
        errors.push(`${contract.id}: part "${name}" references component "${part.component.id}" which has no contract in scope`);
      }
      const cycle = findComponentCycle(contract.id, part.component.id, byId);
      if (cycle) {
        errors.push(
          `${contract.id}: part "${name}" component ref creates a cycle (${cycle.join(' → ')}) — a contract cannot compose itself`,
        );
      }
      for (const [propName, value] of Object.entries(part.component.props ?? {})) {
        if (dep && !dep.props.some((dp) => dp.name === propName)) {
          errors.push(`${contract.id}: part "${name}" sets unknown ${dep.id} prop "${propName}"`);
        }
        const depProp = dep?.props.find((dp) => dp.name === propName);
        // v19: a segment array is the ONE non-scalar value a parent may fix,
        // and only against a rich-text child prop. Anywhere else the array
        // would be stringified into the child's flat text — the fact silently
        // destroyed — so it refuses by name.
        if (Array.isArray(value)) {
          if (depProp && !isRichText(depProp)) {
            errors.push(
              `${contract.id}: part "${name}" sets ${dep!.id} prop "${propName}" to rich-text segments, but that prop is "${kindLabel(depProp)}" — segment arrays are reserved for rich-text child props`,
            );
          }
          continue;
        }
        const parentRef = typeof value === 'string' ? value.match(/^\{([a-z][\w-]*)\}$/) : null;
        if (depProp && isRichText(depProp) && !parentRef) {
          // One spelling per fact: a rich-text child prop is fixed by its
          // segments, never by a bare string that would hide the marks.
          errors.push(
            `${contract.id}: part "${name}" sets rich-text ${dep!.id} prop "${propName}" to a plain value — spell it as segments ([{ "text": "…" }], one segment when the range is uniform)`,
          );
          continue;
        }
        if (depProp && !scalarKind(depProp) && !isRichText(depProp)) {
          errors.push(`${contract.id}: part "${name}" sets non-scalar ${dep!.id} prop "${propName}" — composed-child props must be text, number, boolean, or enum scalars`);
        }
        if (parentRef) {
          const parentProp = contract.props.find((pr) => pr.name === parentRef[1]);
          if (!parentProp) {
            errors.push(`${contract.id}: part "${name}" maps "{${parentRef[1]}}" but no parent prop "${parentRef[1]}" exists`);
          } else if (depProp && !compatibleScalarProps(parentProp, depProp)) {
            errors.push(`${contract.id}: part "${name}" maps parent prop "${parentRef[1]}" (${kindLabel(parentProp)}) to incompatible ${dep!.id} prop "${propName}" (${kindLabel(depProp)})`);
          }
        } else if (depProp) {
          const kind = scalarKind(depProp);
          const valid =
            (kind === 'boolean' && typeof value === 'boolean') ||
            (kind === 'number' && typeof value === 'number') ||
            ((kind === 'text' || kind === 'enum') && typeof value === 'string' && (!isEnum(depProp) || depProp.type.enum.includes(value)));
          if (!valid) {
            errors.push(`${contract.id}: part "${name}" sets ${dep!.id} prop "${propName}" to an incompatible scalar value`);
          }
        }
      }
      if (part.component.text !== undefined && dep && !hasChildrenText(dep)) {
        errors.push(`${contract.id}: part "${name}" sets text but ${dep.id} has no children text prop`);
      }
      // v20 (016): component.slots — content for the child's named slots. Each
      // key must name a real slot on the child, each item must be in scope and
      // satisfy the slot's accepts; only the `children` slot is renderable as
      // JSX children on the code side (named limit, refused here, not at
      // render time).
      for (const [slotName, item] of Object.entries(part.component.slots ?? {})) {
        const childSlot = dep
          ? [...walkAnatomy(dep)].map((w) => w.part.slot).find((s) => s?.name === slotName)
          : undefined;
        if (dep && !childSlot) {
          errors.push(`${contract.id}: part "${name}" fills slot "${slotName}" but ${dep.id} declares no such slot`);
          continue;
        }
        if (!byId.get(item.id)) {
          errors.push(`${contract.id}: part "${name}" slot "${slotName}" references "${item.id}" which has no contract in scope`);
        }
        if (childSlot?.accepts && !childSlot.accepts.includes(item.id)) {
          errors.push(`${contract.id}: part "${name}" slot "${slotName}" content "${item.id}" is not in ${dep!.id}'s accepts (${childSlot.accepts.join(', ')})`);
        }
        if (slotName !== 'children') {
          errors.push(`${contract.id}: part "${name}" fills slot "${slotName}" — only the "children" slot is expressible as JSX children today (named limit)`);
        }
        const slotDep = byId.get(item.id);
        for (const [pn] of Object.entries(item.props ?? {})) {
          if (slotDep && !slotDep.props.some((dp) => dp.name === pn)) {
            errors.push(`${contract.id}: part "${name}" slot "${slotName}" sets unknown ${slotDep.id} prop "${pn}"`);
          }
        }
      }
    }
    for (const item of part.slot?.defaultContent ?? []) {
      const dep = byId.get(item.id);
      if (!dep) {
        errors.push(`${contract.id}: slot "${part.slot!.name}" defaultContent references "${item.id}" which has no contract in scope`);
      }
      const cycle = findComponentCycle(contract.id, item.id, byId);
      if (cycle) {
        errors.push(
          `${contract.id}: slot "${part.slot!.name}" defaultContent "${item.id}" creates a cycle (${cycle.join(' → ')}) — a contract cannot compose itself`,
        );
      }
      if (item.text !== undefined && dep && !hasChildrenText(dep)) {
        errors.push(
          `${contract.id}: slot "${part.slot!.name}" defaultContent sets text but ${dep.id} has no children text prop`,
        );
      }
    }
    if (part.slot?.control) {
      if ((part.slot.accepts?.length ?? 0) === 0) {
        errors.push(`${contract.id}: slot "${part.slot.name}" declares control semantics but accepts no constrained control contract`);
      }
      for (const [kind, declarations] of [
        ['attribute', part.slot.control.attributes ?? {}],
        ['style', part.slot.control.styles ?? {}],
      ] as const) {
        for (const [attr, declaration] of Object.entries(declarations)) {
          if (kind === 'style' && !SLOT_CONTROL_STYLE_CHANNELS.has(attr)) {
            errors.push(`${contract.id}: slot "${part.slot.name}" control style "${attr}" is outside the bounded child-paint vocabulary (${[...SLOT_CONTROL_STYLE_CHANNELS].join(', ')})`);
          }
        const selector = contract.props.find((pr) => pr.name === declaration.prop);
        if (!selector) {
          errors.push(`${contract.id}: slot "${part.slot.name}" control ${kind} "${attr}" references unknown prop "${declaration.prop}"`);
          continue;
        }
        const values = isEnum(selector) ? selector.type.enum : selector.type === 'boolean' ? ['true', 'false'] : null;
        if (!values) {
          errors.push(`${contract.id}: slot "${part.slot.name}" control ${kind} "${attr}" selector "${declaration.prop}" must be a boolean or enum prop`);
          continue;
        }
        for (const value of values) {
          if (!(value in declaration.values)) {
            errors.push(`${contract.id}: slot "${part.slot.name}" control ${kind} "${attr}" is missing selector value "${value}"`);
          }
        }
        for (const value of Object.keys(declaration.values)) {
          if (!values.includes(value)) {
            errors.push(`${contract.id}: slot "${part.slot.name}" control ${kind} "${attr}" has invalid selector value "${value}" for prop "${declaration.prop}"`);
          }
        }
        }
      }
    }
    if (p.length > 1) {
      // Nested parts (path.length > 1 — NOT a top-level root, single- or
      // multi-root) support single-placeholder substitutions (v4) — emitted
      // as descendant rules under the root's enum class. Two placeholders on
      // one nested token stays unsupported.
      for (const ref of Object.values(part.tokens ?? {})) {
        const phs = placeholdersIn(stripBraces(ref));
        if (phs.length > 1) {
          errors.push(
            `${contract.id}: part "${name}" token "${ref}" uses ${phs.length} substitutions — nested parts support at most one`,
          );
        } else if (phs.length === 1 && !enumProps(contract).some((pr) => pr.name === phs[0])) {
          errors.push(
            `${contract.id}: part "${name}" token "${ref}" substitutes unknown enum prop "${phs[0]}"`,
          );
        }
      }
    }
    if (part.content) {
      const prop = contract.props.find(
        (pr) =>
          (pr.type === 'text' || pr.type === 'rich-text') &&
          pr.bindings.code.prop === part.content!.prop,
      );
      if (!prop) {
        errors.push(
          `${contract.id}: part "${name}" binds content to unknown text/rich-text prop "${part.content.prop}"`,
        );
      } else if (prop.type === 'rich-text' && !part.content.marks?.strong) {
        errors.push(
          `${contract.id}: rich-text part "${name}" must declare content.marks.strong — marked weight is governed, never UA-default`,
        );
      } else if (prop.type === 'text' && part.content.marks) {
        errors.push(
          `${contract.id}: flat text part "${name}" declares rich-text marks — change the prop to type "rich-text" or remove marks`,
        );
      }
    }
    // v19 literal rich text: `text` stays the canonical flat string every
    // existing reader (canvas, parity, catalog, spec sheet) consumes, and
    // `textSegments` is the SAME string split into marked ranges. Holding the
    // concatenation identical is what makes the second spelling safe — the two
    // can never tell different stories about the same paragraph.
    if (part.textSegments) {
      if (part.text === undefined) {
        errors.push(
          `${contract.id}: part "${name}" declares textSegments with no "text" — the flat string stays canonical (the canvas draws it); segments only split it`,
        );
      } else {
        const joined = part.textSegments.map((segment) => segment.text).join('');
        if (joined !== part.text) {
          errors.push(
            `${contract.id}: part "${name}" textSegments spell ${JSON.stringify(joined)} but "text" is ${JSON.stringify(part.text)} — the concatenation must be identical`,
          );
        }
      }
      if (part.textSegments.some((segment) => segment.strong) && !part.textMarks?.strong) {
        errors.push(
          `${contract.id}: part "${name}" has strong textSegments but no textMarks.strong — marked weight is governed, never UA-default`,
        );
      }
    } else if (part.textMarks) {
      errors.push(
        `${contract.id}: part "${name}" declares textMarks with no textSegments — nothing is marked`,
      );
    }
    // v7 layoutByProp: the driving prop must be a declared enum and every
    // map key one of its values; component parts lay themselves out via
    // their own contract, so an override there would be silently dead.
    if (part.layoutByProp) {
      const lbp = part.layoutByProp;
      const lbpProp = contract.props.find((pr) => pr.name === lbp.prop);
      if (!lbpProp) {
        errors.push(`${contract.id}: part "${name}" layoutByProp references unknown prop "${lbp.prop}"`);
      } else if (!isEnum(lbpProp)) {
        errors.push(`${contract.id}: part "${name}" layoutByProp prop "${lbp.prop}" must be an enum prop`);
      } else {
        for (const k of Object.keys(lbp.map)) {
          if (!lbpProp.type.enum.includes(k)) {
            errors.push(`${contract.id}: part "${name}" layoutByProp map key "${k}" is not a value of prop "${lbp.prop}"`);
          }
        }
      }
      if (part.component) {
        errors.push(`${contract.id}: part "${name}" is a component instance — layoutByProp cannot restyle it (the child contract owns its layout)`);
      }
    }
    // v10 tokensByProp: the driving prop must be a declared enum, every map
    // key one of its values, and every mapped ref plain (per-value maps ARE
    // the substitution — a placeholder inside one is double substitution);
    // component parts style themselves via their own contract.
    // v14: MULTIPLE entries (ordered). Refusal rules: two entries may not
    // share BOTH a prop and a channel (a conflicting channel+prop pair is
    // ambiguous — refused by name); entries on DIFFERENT props may overlap
    // channels (later entry wins — the documented cascade order).
    const tbpEntries = tokensByPropEntries(part);
    for (const tbp of tbpEntries) {
      const tbpProp = contract.props.find((pr) => pr.name === tbp.prop);
      if (!tbpProp) {
        errors.push(`${contract.id}: part "${name}" tokensByProp references unknown prop "${tbp.prop}"`);
      } else if (!isEnum(tbpProp)) {
        errors.push(`${contract.id}: part "${name}" tokensByProp prop "${tbp.prop}" must be an enum prop`);
      } else {
        for (const [k, overrides] of Object.entries(tbp.map)) {
          if (!tbpProp.type.enum.includes(k)) {
            errors.push(`${contract.id}: part "${name}" tokensByProp map key "${k}" is not a value of prop "${tbp.prop}"`);
          }
          for (const ref of Object.values(overrides)) {
            // S2 capability lift (computed-capture floor): a per-value map
            // ref may carry AT MOST ONE placeholder naming a DIFFERENT
            // declared enum prop — the CSS emitters expand it as a compound
            // enum-class rule (.variant-primary.tone-critical). Field case:
            // a pair binding whose second axis is a defaultless enum (Button
            // tone) — the unset plane rides the base/other-axis map, the set
            // planes need the remaining axis substituted per value. More
            // than one placeholder, an unknown prop, or the entry's own prop
            // (double substitution) refuse by name, as before.
            const phs = placeholdersIn(stripBraces(ref));
            if (phs.length > 1) {
              errors.push(
                `${contract.id}: part "${name}" tokensByProp ref "${ref}" carries ${phs.length} placeholders — per-value maps hold at most one`,
              );
            } else if (phs.length === 1 && phs[0] === tbp.prop) {
              errors.push(
                `${contract.id}: part "${name}" tokensByProp ref "${ref}" substitutes the entry's own prop "${tbp.prop}" — the per-value map IS that substitution`,
              );
            } else if (phs.length === 1 && !enumProps(contract).some((pr) => pr.name === phs[0])) {
              errors.push(
                `${contract.id}: part "${name}" tokensByProp ref "${ref}" substitutes unknown enum prop "${phs[0]}"`,
              );
            }
          }
        }
      }
      if (part.component) {
        errors.push(`${contract.id}: part "${name}" is a component instance — tokensByProp cannot restyle it (the child contract owns its styling)`);
      }
    }
    // v14 conflict rule across tokensByProp entries AND literalsByProp
    // entries: the same (prop, channel) pair claimed twice is refused by
    // name — within one field or across the token/literal fields.
    {
      const claimed = new Map<string, string>(); // "prop|channel" → field label
      const claim = (prop: string, channel: string, label: string) => {
        const key = `${prop}|${channel}`;
        const prior = claimed.get(key);
        if (prior) {
          errors.push(
            `${contract.id}: part "${name}" carries channel "${channel}" for prop "${prop}" in two entries (${prior} and ${label}) — a conflicting channel+prop pair is refused by name`,
          );
        } else {
          claimed.set(key, label);
        }
      };
      tbpEntries.forEach((entry, i) => {
        const channels = new Set(Object.values(entry.map).flatMap((o) => Object.keys(o)));
        for (const ch of channels) claim(entry.prop, ch, `tokensByProp[${i}]`);
      });
      (part.literalsByProp ?? []).forEach((entry, i) => {
        const channels = new Set(Object.values(entry.map).flatMap((o) => Object.keys(o)));
        for (const ch of channels) claim(entry.prop, ch, `literalsByProp[${i}]`);
      });
    }
    // v14 literals: bounded channels only; literalsByProp props must be
    // declared enums with valid value keys; a channel carried by BOTH
    // base `tokens` and base `literals` is ambiguous — refused by name.
    for (const [cssProp] of Object.entries(part.literals ?? {})) {
      if (!LITERAL_CHANNELS.has(cssProp)) {
        errors.push(
          `${contract.id}: part "${name}" literals sets "${cssProp}" which is not a literal channel (${[...LITERAL_CHANNELS].join(', ')})`,
        );
      }
      if (part.tokens && cssProp in part.tokens) {
        errors.push(
          `${contract.id}: part "${name}" carries channel "${cssProp}" as BOTH a token binding and a literal — ambiguous, refused by name`,
        );
      }
    }
    for (const entry of part.literalsByProp ?? []) {
      const lbpProp = contract.props.find((pr) => pr.name === entry.prop);
      if (!lbpProp) {
        errors.push(`${contract.id}: part "${name}" literalsByProp references unknown prop "${entry.prop}"`);
      } else if (!isEnum(lbpProp)) {
        errors.push(`${contract.id}: part "${name}" literalsByProp prop "${entry.prop}" must be an enum prop`);
      } else {
        for (const [k, overrides] of Object.entries(entry.map)) {
          if (!lbpProp.type.enum.includes(k)) {
            errors.push(`${contract.id}: part "${name}" literalsByProp map key "${k}" is not a value of prop "${entry.prop}"`);
          }
          for (const ch of Object.keys(overrides)) {
            if (!LITERAL_CHANNELS.has(ch)) {
              errors.push(
                `${contract.id}: part "${name}" literalsByProp sets "${ch}" which is not a literal channel (${[...LITERAL_CHANNELS].join(', ')})`,
              );
            }
          }
        }
      }
      if (part.component) {
        errors.push(`${contract.id}: part "${name}" is a component instance — literalsByProp cannot restyle it (the child contract owns its styling)`);
      }
    }
    if (part.literals && part.component) {
      errors.push(`${contract.id}: part "${name}" is a component instance — literals cannot restyle it (the child contract owns its styling)`);
    }
    // v15 declared facts (S4): registry channels only, each value inside the
    // channel's bounded grammar; a channel carried by BOTH declared and
    // tokens/literals is ambiguous — refused by name; component/slot parts
    // refuse (the child contract / consumer owns styling). declaredStates:
    // known state names, declared in the contract's `states`, same registry.
    const checkDeclaredEntry = (cssProp: string, value: string, where: string) => {
      const spec = DECLARED_CHANNELS[cssProp];
      if (!spec) {
        errors.push(
          `${contract.id}: part "${name}" ${where} sets "${cssProp}" which is not a declared channel (DECLARED_CHANNELS registry — token/literal vocabulary channels belong in tokens/literals)`,
        );
        return;
      }
      if (!spec.value.test(value)) {
        errors.push(
          `${contract.id}: part "${name}" ${where} "${cssProp}" value ${JSON.stringify(value)} is outside the channel's bounded grammar (${spec.value})`,
        );
      }
    };
    if ((part.declared || part.declaredStates) && (part.component || part.slot)) {
      errors.push(
        `${contract.id}: part "${name}" is a ${part.component ? 'component instance' : 'slot'} — declared facts cannot restyle it (the child contract / consumer owns its styling)`,
      );
    }
    for (const [cssProp, value] of Object.entries(part.declared ?? {})) {
      checkDeclaredEntry(cssProp, value, 'declared');
      if (part.tokens && cssProp in part.tokens) {
        errors.push(
          `${contract.id}: part "${name}" carries channel "${cssProp}" as BOTH a token binding and a declared fact — ambiguous, refused by name`,
        );
      }
      if (part.literals && cssProp in part.literals) {
        errors.push(
          `${contract.id}: part "${name}" carries channel "${cssProp}" as BOTH a literal and a declared fact — ambiguous, refused by name`,
        );
      }
    }
    // An inset on a part CSS never positions is a fact that renders nowhere —
    // the browser drops it silently, so the contract would carry a receipt for
    // something the surface does not do. Refuse by name instead.
    const insets = INSET_CHANNELS.filter((side) => (part.declared ?? {})[side] !== undefined);
    if (insets.length > 0 && (part.declared ?? {}).position !== 'absolute') {
      errors.push(
        `${contract.id}: part "${name}" declares inset ${insets.map((s) => `"${s}"`).join(', ')} without \`position: "absolute"\` — CSS ignores insets on a static part, so the fact would never render`,
      );
    }
    for (const [state, overrides] of Object.entries(part.declaredStates ?? {})) {
      if (!(state in STATE_SELECTORS)) {
        errors.push(
          `${contract.id}: part "${name}" declaredStates declares unknown state "${state}" — must be one of ${Object.keys(STATE_SELECTORS).join(', ')}`,
        );
        continue;
      }
      if (!contract.states.includes(state as Contract['states'][number])) {
        errors.push(
          `${contract.id}: part "${name}" declaredStates declares "${state}" but the contract's \`states\` does not — declare it or drop the override`,
        );
      }
      for (const [cssProp, value] of Object.entries(overrides)) {
        checkDeclaredEntry(cssProp, value, `declaredStates.${state}`);
      }
    }
    // v13 part-level states (P18 second half): per-state token overrides on
    // a NON-ref part — refusal-ruled, never silent: unknown state names
    // refuse (the STATE_SELECTORS vocabulary AND the contract's declared
    // states), ref/slot parts refuse (the child contract owns its styling;
    // slot content is the consumer's), and channels outside the color-kind
    // whitelist refuse by name. The ROOT's states keep their own path (full
    // vocabulary, validated in generateCss).
    if (part.states && p.length > 1) {
      if (part.component) {
        errors.push(`${contract.id}: part "${name}" is a component instance — states cannot restyle it (the child contract owns its styling)`);
      }
      if (part.slot) {
        errors.push(`${contract.id}: part "${name}" is a slot — states cannot restyle its content (the consumer owns it)`);
      }
      for (const [state, overrides] of Object.entries(part.states)) {
        if (!(state in STATE_SELECTORS)) {
          errors.push(`${contract.id}: part "${name}" states declares unknown state "${state}" — must be one of ${Object.keys(STATE_SELECTORS).join(', ')}`);
          continue;
        }
        if (!contract.states.includes(state as Contract['states'][number])) {
          errors.push(`${contract.id}: part "${name}" states declares "${state}" but the contract's \`states\` does not — declare it or drop the override`);
        }
        for (const cssProp of Object.keys(overrides)) {
          if (!PART_STATE_CHANNELS.has(cssProp)) {
            errors.push(
              `${contract.id}: part "${name}" states.${state} sets "${cssProp}" which is not a part-state channel (${[...PART_STATE_CHANNELS].join(', ')} — color-kind only, v13)`,
            );
          }
        }
      }
    }
    // v7 overlay: out-of-flow parts must stay out of the flow arithmetic —
    // grow/overlap are in-flow sizing semantics, and the root cannot attach
    // to its own edge. Minimal, named refusals.
    if (part.overlay) {
      if (p.length === 1) {
        errors.push(`${contract.id}: the root part cannot be an overlay — overlays attach to the root`);
      }
      if (part.layout?.grow) {
        errors.push(`${contract.id}: part "${name}" is an overlay — it cannot also grow (grow is in-flow sizing)`);
      }
      if (part.layout?.overlap) {
        errors.push(`${contract.id}: part "${name}" is an overlay — it cannot also overlap children (in-flow semantics)`);
      }
    }
    // v7 stylesWhen: conditions must be checkable (boolean or enum+equals),
    // and the styles must stay inside the literal whitelist — colors and
    // dimensions belong in `tokens`, and a token ref here is refused by name.
    if (part.stylesWhen && part.component) {
      errors.push(`${contract.id}: part "${name}" is a component instance — stylesWhen cannot restyle it (the child contract owns its styling)`);
    }
    for (const sw of part.stylesWhen ?? []) {
      const swProp = contract.props.find((pr) => pr.name === sw.prop);
      if (!swProp) {
        errors.push(`${contract.id}: part "${name}" stylesWhen references unknown prop "${sw.prop}"`);
      } else if (isEnum(swProp)) {
        if (sw.equals === undefined) {
          errors.push(`${contract.id}: part "${name}" stylesWhen on enum prop "${sw.prop}" requires "equals"`);
        } else if (!swProp.type.enum.includes(sw.equals)) {
          errors.push(`${contract.id}: part "${name}" stylesWhen.equals "${sw.equals}" is not a value of prop "${sw.prop}"`);
        }
      } else if (swProp.type === 'boolean') {
        if (sw.equals !== undefined) {
          errors.push(`${contract.id}: part "${name}" stylesWhen on boolean prop "${sw.prop}" must omit "equals"`);
        }
      } else {
        errors.push(`${contract.id}: part "${name}" stylesWhen prop "${sw.prop}" must be a boolean or enum prop`);
      }
      for (const [cssProp, value] of Object.entries(sw.styles)) {
        if (!STYLES_WHEN_ALLOWED.has(cssProp)) {
          errors.push(`${contract.id}: part "${name}" stylesWhen sets "${cssProp}" which is not in the literal whitelist (${[...STYLES_WHEN_ALLOWED].join(', ')})`);
        }
        if (value.includes('{')) {
          errors.push(`${contract.id}: part "${name}" stylesWhen "${cssProp}" value ${JSON.stringify(value)} looks like a token reference — stylesWhen is literal CSS; token-driven styling belongs in "tokens"`);
        }
      }
    }
    // Icon/vector wrappers are the measured anatomy boxes. A visual optical
    // adjustment therefore belongs to their SVG glyph, never to wrapper CSS.
    if (part.glyphStylesWhen && !part.icon && !part.vectorAsset) {
      errors.push(`${contract.id}: part "${name}" glyphStylesWhen requires an icon or vectorAsset SVG target`);
    }
    for (const sw of part.glyphStylesWhen ?? []) {
      const swProp = contract.props.find((pr) => pr.name === sw.prop);
      if (!swProp) {
        errors.push(`${contract.id}: part "${name}" glyphStylesWhen references unknown prop "${sw.prop}"`);
      } else if (isEnum(swProp)) {
        if (sw.equals === undefined) {
          errors.push(`${contract.id}: part "${name}" glyphStylesWhen on enum prop "${sw.prop}" requires "equals"`);
        } else if (!swProp.type.enum.includes(sw.equals)) {
          errors.push(`${contract.id}: part "${name}" glyphStylesWhen.equals "${sw.equals}" is not a value of prop "${sw.prop}"`);
        }
      } else if (swProp.type === 'boolean') {
        if (sw.equals !== undefined) {
          errors.push(`${contract.id}: part "${name}" glyphStylesWhen on boolean prop "${sw.prop}" must omit "equals"`);
        }
      } else {
        errors.push(`${contract.id}: part "${name}" glyphStylesWhen prop "${sw.prop}" must be a boolean or enum prop`);
      }
      for (const [cssProp, value] of Object.entries(sw.styles)) {
        if (cssProp !== 'transform' || !/^translate[XY]\(-?(?:0|[1-9]\d*)(?:\.\d+)?px\)$/.test(value)) {
          errors.push(`${contract.id}: part "${name}" glyphStylesWhen permits only pixel translateX/translateY transforms on its SVG`);
        }
      }
    }
    if ((part.icon || part.vectorAsset) && (part.stylesWhen ?? []).some((sw) => 'transform' in sw.styles)) {
      errors.push(`${contract.id}: part "${name}" stylesWhen must not transform an icon/vector wrapper — use glyphStylesWhen so the measured wrapper box stays stable`);
    }
    // v9 shape: a parametric leaf decor — anything that would give it
    // children or content contradicts the leaf-ness and is refused by name.
    if (part.shape) {
      for (const [field, present] of Object.entries({
        parts: part.parts, slot: part.slot, component: part.component,
        content: part.content, text: part.text, icon: part.icon, vectorAsset: part.vectorAsset, meter: part.meter,
      })) {
        if (present !== undefined) {
          errors.push(`${contract.id}: part "${name}" is a shape (leaf decor) — it cannot also carry "${field}"`);
        }
      }
      if (part.shape.sides !== undefined && part.shape.kind !== 'polygon') {
        errors.push(`${contract.id}: part "${name}" shape kind "${part.shape.kind}" cannot declare sides — side count is polygon vocabulary`);
      }
    }
    // v18 vector assets are leaf geometry. Their source SVG is governed on
    // disk; no nested boxes or a second geometry carrier may shadow it.
    if (part.vectorAsset) {
      for (const [field, present] of Object.entries({
        parts: part.parts, slot: part.slot, component: part.component, content: part.content,
        text: part.text, icon: part.icon, shape: part.shape, meter: part.meter,
      })) {
        if (present !== undefined) errors.push(`${contract.id}: part "${name}" is a vectorAsset (leaf geometry) — it cannot also carry "${field}"`);
      }
      if (part.vectorAsset.position && p.length === 1) {
        errors.push(`${contract.id}: root part "${name}" cannot position itself — vectorAsset.position belongs to a child of a structural root`);
      }
    }
    // v12 repeat (P9): the item template must be mechanically renderable on
    // every surface — a component-ref template, an arrayOf prop to map, and
    // fields that map BY NAME onto the child contract's props with matching
    // scalar types. A record's flat text field may also supply a rich-text
    // child prop: each record value becomes one unmarked segment, while the
    // child remains free to use structured segments when called directly.
    // Everything else refuses by name.
    if (part.repeat) {
      if (!part.component) {
        errors.push(`${contract.id}: part "${name}" declares repeat but no component — the item template is a component ref (v12; text/frame templates have no vocabulary)`);
      }
      for (const [field, present] of Object.entries({
        slot: part.slot, content: part.content, text: part.text,
        meter: part.meter, icon: part.icon, vectorAsset: part.vectorAsset, shape: part.shape, parts: part.parts,
      })) {
        if (present !== undefined) {
          errors.push(`${contract.id}: part "${name}" is a repeat template — it cannot also carry "${field}"`);
        }
      }
      const rp = contract.props.find((pr) => pr.name === part.repeat!.itemsProp);
      if (!rp) {
        errors.push(`${contract.id}: part "${name}" repeat references unknown prop "${part.repeat.itemsProp}"`);
      } else if (!isArrayType(rp)) {
        errors.push(`${contract.id}: part "${name}" repeat prop "${part.repeat.itemsProp}" must be an arrayOf prop`);
      } else {
        const dep = part.component ? byId.get(part.component.id) : undefined;
        const FIELD_TO_PROP: Record<string, string> = { text: 'text', boolean: 'boolean', number: 'number' };
        for (const [field, ftype] of Object.entries(rp.type.arrayOf)) {
          if (part.component?.props && field in part.component.props) {
            errors.push(`${contract.id}: part "${name}" repeat field "${field}" collides with a fixed component prop — a field is per-item, a fixed prop is constant`);
          }
          if (!dep) continue; // missing child contract already refused above
          const depProp = dep.props.find((dp) => dp.name === field);
          if (!depProp) {
            errors.push(`${contract.id}: part "${name}" repeat field "${field}" names no ${dep.id} prop`);
          } else if (typeof ftype === 'object') {
            // v16: a per-item ENUM field. The child must own the same enum
            // vocabulary — a field value the child cannot spell would reach
            // neither the child's code prop nor its Figma variant values.
            if (!isEnum(depProp)) {
              errors.push(
                `${contract.id}: part "${name}" repeat field "${field}" (${arrayFieldKind(ftype)}) does not match ${dep.id} prop "${field}" (${typeof depProp.type === 'object' ? JSON.stringify(depProp.type) : depProp.type}) — a per-item enum field needs an enum prop on the child`,
              );
            } else {
              const foreign = ftype.enum.filter((v) => !depProp.type.enum.includes(v));
              if (foreign.length > 0) {
                errors.push(
                  `${contract.id}: part "${name}" repeat field "${field}" declares value(s) ${foreign.map((v) => `"${v}"`).join(', ')} that ${dep.id} prop "${field}" does not — a field's enum must be a subset of the child's`,
                );
              }
            }
          } else if (
            (ftype === 'text'
              ? depProp.type !== 'text' && depProp.type !== 'rich-text'
              : depProp.type !== FIELD_TO_PROP[ftype])
          ) {
            errors.push(
              `${contract.id}: part "${name}" repeat field "${field}" (${ftype}) does not match ${dep.id} prop "${field}" (${typeof depProp.type === 'object' ? JSON.stringify(depProp.type) : depProp.type}) — per-item enum differences ride an enum FIELD (v16), never a mismatched scalar`,
            );
          }
        }
        for (const [i, rec] of part.repeat.sample.entries()) {
          for (const [key, value] of Object.entries(rec)) {
            const ftype = rp.type.arrayOf[key];
            if (ftype === undefined) {
              errors.push(`${contract.id}: part "${name}" repeat sample[${i}] key "${key}" is not a field of "${part.repeat.itemsProp}"`);
            } else if (typeof ftype === 'object') {
              // The enum is enforced on the OBSERVED sample too: it is what the
              // static surfaces and the canvas actually render.
              if (typeof value !== 'string' || !ftype.enum.includes(value)) {
                errors.push(
                  `${contract.id}: part "${name}" repeat sample[${i}].${key} is ${JSON.stringify(value)} but the field allows ${ftype.enum.join('|')}`,
                );
              }
            } else if ((ftype === 'boolean') !== (typeof value === 'boolean') || (ftype === 'number') !== (typeof value === 'number')) {
              errors.push(`${contract.id}: part "${name}" repeat sample[${i}].${key} is a ${typeof value} but the field is ${ftype}`);
            }
          }
        }
      }
    }
    if (part.visibleWhen && part.hiddenWhen) {
      errors.push(`${contract.id}: part "${name}" declares both visibleWhen and hiddenWhen — choose one presence condition`);
    }
    if (part.visibleWhen) {
      const vwProp = contract.props.find((pr) => pr.name === part.visibleWhen!.prop);
      if (!vwProp) {
        errors.push(`${contract.id}: part "${name}" visibleWhen references unknown prop "${part.visibleWhen.prop}"`);
      } else if (part.visibleWhen.equals !== undefined && !(typeof vwProp.type === 'object' && 'enum' in vwProp.type && vwProp.type.enum.includes(part.visibleWhen.equals))) {
        errors.push(`${contract.id}: part "${name}" visibleWhen.equals "${part.visibleWhen.equals}" is not a value of prop "${part.visibleWhen.prop}"`);
      }
    }
    if (part.hiddenWhen) {
      const hwProp = contract.props.find((pr) => pr.name === part.hiddenWhen!.prop);
      if (!hwProp) {
        errors.push(`${contract.id}: part "${name}" hiddenWhen references unknown prop "${part.hiddenWhen.prop}"`);
      } else if (!(typeof hwProp.type === 'object' && 'enum' in hwProp.type && hwProp.type.enum.includes(part.hiddenWhen.equals))) {
        errors.push(`${contract.id}: part "${name}" hiddenWhen.equals "${part.hiddenWhen.equals}" is not a value of enum prop "${part.hiddenWhen.prop}"`);
      }
    }
    if (part.vectorAsset) {
      const svg = iconAssets.get(part.vectorAsset.asset);
      if (!svg) {
        errors.push(`${contract.id}: part "${name}" needs vector asset "assets/vectors/${part.vectorAsset.asset}.svg" which does not exist`);
      } else {
        const drawable = /<(path|circle|rect|polygon|ellipse|line|polyline|text)\b/i.test(svg);
        if (!drawable) errors.push(`${contract.id}: vector asset "${part.vectorAsset.asset}" has no drawable SVG geometry`);
        const colorBound = part.tokens?.color !== undefined || JSON.stringify(part.tokensByProp ?? {}).includes('"color"');
        if (colorBound && !/currentColor/i.test(svg)) {
          errors.push(`${contract.id}: vector asset "${part.vectorAsset.asset}" is color-bound but has no currentColor paint — normalize the Figma export before promotion`);
        }
      }
    }
    if (part.icon) {
      const ref = part.icon.asset.match(/^\{([a-z][\w-]*)\}$/);
      const assets = ref
        ? (() => {
            const p = contract.props.find((pr) => pr.name === ref[1]);
            return p && typeof p.type === 'object' && 'enum' in p.type ? p.type.enum : [];
          })()
        : [part.icon.asset];
      for (const asset of assets) {
        if (!iconAssets.has(asset)) {
          errors.push(`${contract.id}: part "${name}" needs icon asset "assets/icons/${asset}.svg" which does not exist`);
        }
      }
    }
    for (const value of Object.values(part.attrs ?? {})) {
      const ref = value.match(/^\{([a-z][\w-]*)\}$/);
      if (ref && !contract.props.some((pr) => pr.name === ref[1])) {
        errors.push(`${contract.id}: part "${name}" attrs references unknown prop "${ref[1]}"`);
      }
    }
    const attrsByProp = part.attrsByProp
      ? (Array.isArray(part.attrsByProp) ? part.attrsByProp : [part.attrsByProp])
      : [];
    for (const entry of attrsByProp) {
      const selector = contract.props.find((pr) => pr.name === entry.prop);
      if (!selector) {
        errors.push(`${contract.id}: part "${name}" attrsByProp references unknown prop "${entry.prop}"`);
        continue;
      }
      const values = isEnum(selector) ? selector.type.enum : selector.type === 'boolean' ? ['true', 'false'] : null;
      if (!values) {
        errors.push(`${contract.id}: part "${name}" attrsByProp prop "${entry.prop}" must be a boolean or enum prop`);
      } else {
        for (const value of Object.keys(entry.map)) {
          if (!values.includes(value)) {
            errors.push(`${contract.id}: part "${name}" attrsByProp map key "${value}" is not a value of prop "${entry.prop}"`);
          }
        }
      }
      for (const attrs of Object.values(entry.map)) {
        for (const value of Object.values(attrs)) {
          const ref = value.match(/^\{([a-z][\w-]*)\}$/);
          if (ref && !contract.props.some((pr) => pr.name === ref[1])) {
            errors.push(`${contract.id}: part "${name}" attrsByProp references unknown prop "${ref[1]}"`);
          }
        }
      }
    }
    if (part.tabContext) {
      if (p.length !== 1) {
        errors.push(`${contract.id}: part "${name}" declares tabContext below the component root — an external tablist can govern only the Tab root`);
      }
      if (contract.semantics.role !== 'tab') {
        errors.push(`${contract.id}: part "${name}" declares tabContext but the component semantics must be role "tab"`);
      }
      const idProp = contract.props.find((prop) => prop.name === part.tabContext!.idProp);
      if (!idProp || idProp.type !== 'text') {
        errors.push(`${contract.id}: part "${name}" tabContext.idProp "${part.tabContext.idProp}" must name a text prop`);
      }
      if (part.attrs?.['data-tablist-id'] !== `{${part.tabContext.idProp}}`) {
        errors.push(`${contract.id}: part "${name}" tabContext must bind data-tablist-id to "{${part.tabContext.idProp}}"`);
      }
    }
    if (part.geometryJustification && p.length !== 1) {
      errors.push(`${contract.id}: part "${name}" declares geometryJustification below the component root — receipt exceptions must name the root composition boundary`);
    }
  }
  // Multi-root: an anatomy is ≥1 top-level root. A single-root contract's one
  // entry is named "root"; a captured composite (Modal = {dialog, backdrop})
  // carries several. Each root's subtree is validated by the SAME rules above
  // (this walk already visits every root via walkAnatomy). Only an EMPTY
  // anatomy is refused. (A single-root `{root}` still validates exactly as
  // before: it has one top-level entry, so this passes identically.)
  if (topRoots(contract).length === 0) {
    errors.push(`${contract.id}: anatomy must have at least one top-level (root) part`);
  }

  // Identity + consistency gates (added after an adversarial refusal sweep
  // found these invalid states passing silently — C2 means NAMED refusal).
  if (!/^[A-Z][A-Za-z0-9]*$/.test(contract.name)) {
    errors.push(`${contract.id}: contract name "${contract.name}" must be PascalCase — it becomes the exported component and its file names`);
  }
  const seenPropNames = new Set<string>();
  const seenFigmaProps = new Set<string>();
  // Duplicate CODE bindings are the classic git-auto-merge artifact: two
  // branches each add a prop, the JSON merges cleanly, Zod accepts it, and
  // the generator would emit a duplicate interface member + duplicate
  // destructuring binding — syntactically broken output with exit 0
  // (red-team finding). Slot names and event props share the same code
  // namespace, so the uniqueness gate covers all three.
  const seenCodeNames = new Set<string>(
    walkAnatomy(contract).filter((w) => w.part.slot).map((w) => w.part.slot!.name),
  );
  for (const p of contract.props) {
    if (seenPropNames.has(p.name)) {
      errors.push(`${contract.id}: duplicate prop name "${p.name}"`);
    }
    seenPropNames.add(p.name);
    const codeName = p.bindings.code.prop;
    if (codeName !== 'children' && seenCodeNames.has(codeName)) {
      errors.push(`${contract.id}: duplicate code binding "${codeName}" — two props/slots/events share one code name (check for a bad merge)`);
    }
    seenCodeNames.add(codeName);
    if (!/^[a-z][A-Za-z0-9]*$/.test(p.bindings.code.prop)) {
      errors.push(`${contract.id}: prop "${p.name}" code binding "${p.bindings.code.prop}" is not a legal camelCase identifier`);
    }
    const figProp = p.bindings.figma.property;
    if (figProp !== undefined) {
      if (seenFigmaProps.has(figProp)) {
        errors.push(`${contract.id}: two props bind the same design property "${figProp}" — the canvas cannot host both`);
      }
      seenFigmaProps.add(figProp);
    }
    // type/default consistency
    if (p.default !== undefined) {
      if (isEnum(p) && (typeof p.default !== 'string' || !p.type.enum.includes(p.default))) {
        errors.push(`${contract.id}: prop "${p.name}" default ${JSON.stringify(p.default)} is not one of its enum values [${p.type.enum.join(', ')}]`);
      }
      if (p.type === 'boolean' && typeof p.default !== 'boolean') {
        errors.push(`${contract.id}: boolean prop "${p.name}" default must be a boolean (got ${JSON.stringify(p.default)})`);
      }
      if (p.type === 'number' && typeof p.default !== 'number') {
        errors.push(`${contract.id}: number prop "${p.name}" default must be a number (got ${JSON.stringify(p.default)})`);
      }
      if (p.type === 'text' && typeof p.default !== 'string') {
        errors.push(`${contract.id}: text prop "${p.name}" default must be a string (got ${JSON.stringify(p.default)})`);
      }
      if (p.type === 'rich-text' && !Array.isArray(p.default)) {
        errors.push(`${contract.id}: rich-text prop "${p.name}" default must be a segment array (got ${JSON.stringify(p.default)})`);
      }
    }
    // v7 arrayOf: structured props are code-only — the pairing with figma
    // kind "NONE" is enforced BOTH ways so a scalar prop can never silently
    // vanish from the canvas and a structured prop can never pretend to
    // manifest there.
    if (isArrayType(p)) {
      if (p.bindings.figma.kind !== 'NONE') {
        errors.push(`${contract.id}: arrayOf prop "${p.name}" must bind figma kind "NONE" — structured props are code-only by declared fidelity limit`);
      }
      if (p.default !== undefined) {
        errors.push(`${contract.id}: arrayOf prop "${p.name}" cannot declare a default — it renders as an optional array in code`);
      }
      if (Object.keys(p.type.arrayOf).length === 0) {
        errors.push(`${contract.id}: arrayOf prop "${p.name}" must declare at least one field`);
      }
    }
    // Required text props need a default: it is the canvas TEXT property's
    // default value AND the sample every generated story/matrix cell uses.
    if (
      (p.type === 'text' || p.type === 'rich-text') &&
      p.required &&
      p.bindings.figma.kind !== 'NONE' &&
      (p.type === 'text' ? typeof p.default !== 'string' : !Array.isArray(p.default))
    ) {
      errors.push(`${contract.id}: required ${p.type} prop "${p.name}" must declare a default (canvas default + story sample)`);
    }
    // The figma values map, when present, must cover the enum exactly.
    if (isEnum(p) && p.bindings.figma.values) {
      const mapKeys = Object.keys(p.bindings.figma.values);
      for (const v of p.type.enum) {
        if (!mapKeys.includes(v)) {
          errors.push(`${contract.id}: prop "${p.name}" figma values map is missing enum value "${v}"`);
        }
      }
      for (const k of mapKeys) {
        if (!p.type.enum.includes(k)) {
          errors.push(`${contract.id}: prop "${p.name}" figma values map has key "${k}" which is not an enum value`);
        }
      }
    }
  }
  // Token refs must be well-formed {path} or {path.{prop}.path} shapes —
  // a malformed ref must be refused by NAME, not crash downstream.
  const TOKEN_REF = /^\{[^{}]*(\{[a-z][\w-]*\}[^{}]*)*\}$/;
  for (const { name, part } of walkAnatomy(contract)) {
    for (const [cssProp, ref] of Object.entries(part.tokens ?? {})) {
      if (!TOKEN_REF.test(ref) || ref === '{}') {
        errors.push(`${contract.id}: part "${name}" token "${cssProp}" ref ${JSON.stringify(ref)} is malformed — expected "{token.path}" with optional "{prop}" placeholders`);
      }
    }
  }

  // v6 events: the declared interaction surface must be mechanically checkable.
  const partByName = new Map(walkAnatomy(contract).map((w) => [w.name, w.part]));
  const seenEventProps = new Set<string>();
  for (const ev of contract.events ?? []) {
    const codeProp = ev.bindings.code.prop;
    if (seenEventProps.has(codeProp)) {
      errors.push(`${contract.id}: duplicate event code prop "${codeProp}"`);
    }
    seenEventProps.add(codeProp);
    if (contract.props.some((p) => p.bindings.code.prop === codeProp) || walkAnatomy(contract).some((w) => w.part.slot?.name === codeProp)) {
      errors.push(`${contract.id}: event "${ev.name}" code prop "${codeProp}" collides with a data prop or slot`);
    }
    const trigger = partByName.get(ev.trigger);
    if (!trigger) {
      errors.push(`${contract.id}: event "${ev.name}" trigger references unknown part "${ev.trigger}"`);
    } else if (!topRootNames(contract).has(ev.trigger) && trigger.element !== 'button' && !isNativeCheckablePart(trigger)) {
      // Interactivity must be honest: a clickable part is a <button> — or a
      // native checkable input (input[type=checkbox|radio]) — so keyboard
      // activation comes from the platform, not a bolted-on handler.
      errors.push(
        `${contract.id}: event "${ev.name}" trigger part "${ev.trigger}" must have element "button" or be a native checkable input (input[type=checkbox|radio]) (got "${trigger.element ?? 'div'}")`,
      );
    }
    if (ev.toggles) {
      const prop = contract.props.find((p) => p.name === ev.toggles!.prop);
      if (!prop) {
        errors.push(`${contract.id}: event "${ev.name}" toggles unknown prop "${ev.toggles.prop}"`);
      } else if (!(typeof prop.type === 'object' && 'enum' in prop.type)) {
        errors.push(`${contract.id}: event "${ev.name}" toggles non-enum prop "${ev.toggles.prop}"`);
      } else {
        for (const v of ev.toggles.between) {
          if (!prop.type.enum.includes(v)) {
            errors.push(
              `${contract.id}: event "${ev.name}" toggles between "${v}" which is not a value of "${ev.toggles.prop}"`,
            );
          }
        }
      }
      if (ev.toggles.controls) {
        const controlled = partByName.get(ev.toggles.controls);
        if (!controlled) {
          errors.push(`${contract.id}: event "${ev.name}" controls unknown part "${ev.toggles.controls}"`);
        } else {
          const on = ev.toggles.between[1];
          if (controlled.visibleWhen?.prop !== ev.toggles.prop || controlled.visibleWhen.equals !== on) {
            errors.push(
              `${contract.id}: event "${ev.name}" controls part "${ev.toggles.controls}" but that part must declare visibleWhen { prop: "${ev.toggles.prop}", equals: "${on}" }`,
            );
          }
        }
      }
    }
  }

  // figmaStatePreviews (v8): canvas-only state previews must be honest —
  // a preview variant that renders identically to Default is kit noise, so
  // the opt-in is refused by name unless every declared state carries root
  // token overrides; and the multiplied axis must be unambiguous.
  if (contract.figmaStatePreviews) {
    if (contract.figmaRepresentation === 'native') {
      errors.push(
        `${contract.id}: figmaStatePreviews requires a generated Figma component — figmaRepresentation "native" declares there is none`,
      );
    }
    if (contract.states.length === 0) {
      errors.push(
        `${contract.id}: figmaStatePreviews is set but the contract declares no interaction states — nothing to preview`,
      );
    }
    for (const state of contract.states) {
      // A state override may sit on ANY top-level root (single-root: the sole
      // "root"; multi-root: e.g. dialog/backdrop) …
      const rootCarries = topRoots(contract).some(
        ([, rp]) => Object.keys(rp.states?.[state] ?? {}).length > 0,
      );
      // v13: … or a state carried ONLY by part-level overrides (path.length >
      // 1) still previews — the compile applies part states inside the
      // State-axis variants.
      const partCarries = walkAnatomy(contract).some(
        (w) => w.path.length > 1 && Object.keys(w.part.states?.[state] ?? {}).length > 0,
      );
      if (!rootCarries && !partCarries) {
        errors.push(
          `${contract.id}: figmaStatePreviews — state "${state}" declares no token overrides on anatomy.root.states (or any part's states), so its preview variant would render identically to Default`,
        );
      }
    }
    const substProps = statePreviewSubstProps(contract);
    if (substProps.length > 1) {
      errors.push(
        `${contract.id}: figmaStatePreviews — state overrides substitute ${substProps.length} enum props (${substProps.join(', ')}); previews multiply exactly ONE primary axis`,
      );
    }
    if (contract.props.some((p) => p.bindings.figma.property === STATE_PREVIEW_PROPERTY)) {
      errors.push(
        `${contract.id}: figmaStatePreviews reserves the design property "${STATE_PREVIEW_PROPERTY}" for the preview axis, but a prop already binds it`,
      );
    }
  }

  // v7 elementByProp: the dynamic-tag lookup must be total and honest —
  // the prop must be a declared enum, the map must cover every value, and
  // every mapped element must be in the generator's element vocabulary
  // (an unknown element would emit JSX that silently isn't HTML).
  const ebp = contract.semantics.elementByProp;
  if (ebp) {
    const prop = contract.props.find((p) => p.name === ebp.prop);
    if (!prop) {
      errors.push(`${contract.id}: semantics.elementByProp references unknown prop "${ebp.prop}"`);
    } else if (!isEnum(prop)) {
      errors.push(`${contract.id}: semantics.elementByProp prop "${ebp.prop}" must be an enum prop`);
    } else {
      for (const v of prop.type.enum) {
        if (!(v in ebp.map)) {
          errors.push(`${contract.id}: semantics.elementByProp map is missing enum value "${v}"`);
        }
      }
      for (const [k, el] of Object.entries(ebp.map)) {
        if (!prop.type.enum.includes(k)) {
          errors.push(`${contract.id}: semantics.elementByProp map key "${k}" is not a value of prop "${ebp.prop}"`);
        }
        if (!(el in ELEMENT_META)) {
          errors.push(`${contract.id}: semantics.elementByProp maps "${k}" to unknown element "${el}" — must be one of the element vocabulary`);
        }
      }
    }
  }

  // v11 SEMANTIC LINT: a role claim that RE-CREATES a native control (see
  // NATIVE_ROLE_HOSTS) refuses BY NAME on a non-native element — unless the
  // contract declares the exception, whose one-sentence reason renders on
  // the spec sheet. This gate exists because a shipped catalog contract
  // (ds.checkbox v1.1.0) emitted <button role="checkbox"> where a native
  // <input type="checkbox"> belongs; the mistake must be impossible to
  // reintroduce silently. Every surface enforces it: react/html/react-inline
  // /figma-script all call validateContract, as do the census and the
  // playground referee.
  {
    /** True when the claim is a violation the exception would cover. */
    const violates = (role: string | undefined, element: string): boolean => {
      if (!role) return false;
      const entry = NATIVE_ROLE_HOSTS[role];
      return Boolean(entry && !entry.hosts.includes(element));
    };
    const declared = (exception: string | undefined) =>
      typeof exception === 'string' && exception.trim().length > 0;
    const refuse = (role: string, element: string, site: string, field: string) => {
      const entry = NATIVE_ROLE_HOSTS[role]!;
      errors.push(
        `${contract.id}: ${site} claims role "${role}" on element "${element}" — native ${entry.native} exists; use it or declare the exception (${field}: "<one-sentence reason>")`,
      );
    };

    // Root-level claims: semantics.role, roleByProp values, and the root
    // part's attrs.role — all covered by semantics.roleException.
    const rootEl = contract.semantics.element;
    const rootClaims: Array<{ role: string; site: string }> = [];
    if (violates(contract.semantics.role, rootEl)) {
      rootClaims.push({ role: contract.semantics.role!, site: 'semantics.role' });
    }
    for (const [k, role] of Object.entries(contract.semantics.roleByProp?.map ?? {})) {
      if (violates(role, rootEl)) rootClaims.push({ role, site: `semantics.roleByProp["${k}"]` });
    }
    // attrs.role on EACH top-level root (single-root: the sole "root", site
    // "anatomy.root attrs.role" — byte-identical; multi-root: one claim per
    // root, site "anatomy.<name> attrs.role").
    for (const [rname, rpart] of topRoots(contract)) {
      const rAttrsRole = rpart.attrs?.role;
      if (violates(rAttrsRole, rootEl)) {
        rootClaims.push({ role: rAttrsRole!, site: `anatomy.${rname} attrs.role` });
      }
    }
    if (!declared(contract.semantics.roleException)) {
      for (const c of rootClaims) refuse(c.role, rootEl, c.site, 'semantics.roleException');
    } else if (rootClaims.length === 0) {
      errors.push(
        `${contract.id}: semantics.roleException is declared but no root-level role claim needs it — exceptions never ride along silently`,
      );
    }

    // Part-level claims: attrs.role on non-root parts, covered by the
    // part's own roleException. Element default mirrors the emitters:
    // span for content/text leaves, div otherwise.
    for (const { name, part, path: p } of walkAnatomy(contract)) {
      if (p.length === 1) continue; // top-level roots handled above
      const el = part.element ?? (part.content || part.text !== undefined ? 'span' : 'div');
      const partRole = part.attrs?.role;
      const isViolation = violates(partRole, el);
      if (isViolation && !declared(part.roleException)) {
        refuse(partRole!, el, `part "${name}"`, `roleException`);
      } else if (!isViolation && declared(part.roleException)) {
        errors.push(
          `${contract.id}: part "${name}" declares roleException but claims no role that needs it — exceptions never ride along silently`,
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// CSS generation
// ---------------------------------------------------------------------------

/** v7 stylesWhen rules for one part. Boolean conditions select on the
 *  root's existing per-boolean data attribute (native disabled uses
 *  :disabled); enum conditions select on the root's enum class. */
function stylesWhenRules(
  contract: Contract,
  partName: string,
  part: Part,
  isRootPart: boolean,
  target = '',
): string[] {
  const rules: string[] = [];
  for (const sw of part.stylesWhen ?? []) {
    const prop = contract.props.find((pr) => pr.name === sw.prop);
    if (!prop) continue; // refused by validateContract
    let base: string;
    if (isEnum(prop)) {
      base = `.${sw.prop}-${sw.equals}`;
    } else {
      const nativeDisabled =
        prop.name === 'disabled' && ELEMENT_META[contract.semantics.element]?.supportsDisabled;
      const dataName = prop.name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      base = nativeDisabled ? '.root:disabled' : `.root[data-${dataName}]`;
    }
    const selector = `${isRootPart ? base : `${base} .${partName}`}${target}`;
    const decls = Object.entries(sw.styles)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join('\n');
    rules.push(`\n${selector} {\n${decls}\n}`);
  }
  return rules;
}

export function generateCss(contract: Contract, tokenInventory: Set<string>, errors: string[]): string {
  const enums = new Map(enumProps(contract).map((p) => [p.name, p.type.enum]));
  const lines: string[] = [
    `/* GENERATED FILE — DO NOT EDIT.`,
    ` * Source of truth: contracts/${contract.id.replace(/^[^.]+\./, '')}.contract.json (${contract.id} v${contract.version})`,
    ` * Regenerate with: npm run generate`,
    ` */`,
  ];

  // D1 (015, DW-014-002): Figma boxes are border-box (a bound width/height
  // IS the outer box, padding drawn inside — the canvas emitter forces
  // strokeAlign: INSIDE). core/emit-html.ts, the playground
  // (playground/src/styles.css) and the canvas preview
  // (playground/src/engine/canvas-preview.ts) already declare this; the
  // shipped React surface was the one surface out of four that didn't, so a
  // part binding width/height + padding rendered wider for consumers than in
  // Figma, than in emit-html, and than our own measurement surfaces (receipt:
  // react-box-sizing-absent). One rule per top-level root class — ".root" for
  // the single-root case, each composite root's own class under
  // isMultiRoot — mirrors core/emit-html.ts:131-143, adapted to CSS
  // Modules' unprefixed class names (no shared BEM component prefix exists
  // here to hook one rule onto). Emitted at the head of the file, same
  // position as emit-html.
  for (const [name] of topRoots(contract)) {
    lines.push('', `.${name}, .${name} *, .${name} *::before, .${name} *::after {`, '  box-sizing: border-box;', '}');
  }

  const checkToken = (tokenPath: string, context: string): boolean => {
    if (!tokenInventory.has(tokenPath)) {
      errors.push(
        `${contract.id}: ${context} references token "{${tokenPath}}" which does not exist in tokens/`,
      );
      return false;
    }
    return true;
  };

  // MULTI-ROOT composite: there is no single ".root" — each top-level root
  // and every descendant part compiles to its OWN class (.dialog, .backdrop,
  // .header …), rendered as siblings by the JSX. Layout is contract-governed
  // (`layout`); token refs become var(--…); literals/declared facts verbatim.
  // (Single-root falls through to the untouched N=1 path below.)
  if (isMultiRoot(contract)) {
    for (const { name, part } of walkAnatomy(contract)) {
      if (part.component) continue; // instances style themselves via their own contract
      const decls: string[] = [];
      if (isStructural(part)) {
        decls.push(`display: ${part.layout?.display ?? 'flex'}`);
        if (part.layout?.direction) decls.push(`flex-direction: ${part.layout.direction}`);
        if (part.layout?.wrap) decls.push('flex-wrap: wrap');
        if (part.layout?.align) decls.push(`align-items: ${ALIGN_CSS[part.layout.align]}`);
        if (part.layout?.justify) decls.push(`justify-content: ${JUSTIFY_CSS[part.layout.justify]}`);
      }
      if (part.layout?.grow) decls.push('flex: 1 1 auto', 'min-width: 0');
      if (part.layout?.width === 'fill') {
        decls.push('width: 100%');
        if (!part.layout.grow) decls.push('min-width: 0');
      }
      if (part.layout?.clip) decls.push('overflow: hidden');
      if (part.element && UA_MARGIN_ELEMENTS.has(part.element)) decls.push('margin: 0');
      if (part.overlay) decls.push('position: absolute', ...OVERLAY_CSS[part.overlay.placement]);
      if (part.shape) decls.push(...shapeCssDecls(part.shape));
      if (part.element === 'button') {
        decls.push('appearance: none', 'background: none', 'border: none', 'font: inherit',
          'color: inherit', 'cursor: pointer');
      }
      if (part.icon || part.vectorAsset) {
        decls.push('display: inline-flex', 'flex-shrink: 0');
        if (part.vectorAsset?.position) {
          decls.push('position: absolute', `left: ${part.vectorAsset.position.x}px`, `top: ${part.vectorAsset.position.y}px`);
        }
        const width = part.vectorAsset?.width ?? part.icon?.size;
        const height = part.vectorAsset?.height ?? part.icon?.size;
        if (width && height) lines.push('', `.${name} svg {`, `  width: ${width}px;`, `  height: ${height}px;`, '}');
      }
      // Non-substituted token refs → var(--…); single-placeholder refs are a
      // per-enum descendant idiom that only exists under a single root and do
      // not occur in captured composites (documented scope).
      for (const [cssProp, ref] of Object.entries(part.tokens ?? {})) {
        const refPath = stripBraces(ref);
        if (placeholdersIn(refPath).length > 0) continue;
        if (checkToken(refPath, `anatomy.${name}.tokens.${cssProp}`)) {
          decls.push(`${cssProp}: ${cssVar(refPath)}`);
        }
      }
      for (const [cssProp, lit] of Object.entries(part.literals ?? {})) decls.push(`${cssProp}: ${lit}`);
      for (const [cssProp, value] of Object.entries(part.declared ?? {})) decls.push(`${cssProp}: ${value}`);
      if (decls.length > 0) {
        lines.push('', `.${name} {`, ...decls.map((d) => `  ${d};`), '}');
      }
      const strong = richTextStrongStyle(part.content?.marks?.strong ?? part.textMarks?.strong);
      if (strong.fontWeight) {
        const tokenPath = strong.fontWeight.startsWith('{') ? stripBraces(strong.fontWeight) : null;
        if (!tokenPath || checkToken(tokenPath, `anatomy.${name}.${part.content ? 'content.marks' : 'textMarks'}.strong`)) {
          const weight = tokenPath ? cssVar(tokenPath) : strong.fontWeight;
          const declarations = [`  font-weight: ${weight};`];
          if (strong.fontSize) declarations.push(`  font-size: ${strong.fontSize};`);
          if (strong.lineHeight) declarations.push(`  line-height: ${strong.lineHeight};`);
          lines.push('', `.${name} > strong {`, ...declarations, '}');
        }
      }
      if (hasUnderlinedSegment(part)) lines.push(underlineRule(`.${name}`));
    }
    return lines.join('\n') + '\n';
  }

  // Root: static/layout base + non-substituted tokens, then enum classes,
  // then state rules — same model as v1, layout now contract-governed.
  const root = contract.anatomy.root;
  const rootDecls: string[] = [];
  if (root.layout) {
    rootDecls.push(`display: ${root.layout.display ?? 'flex'}`);
    if (root.layout.direction) rootDecls.push(`flex-direction: ${root.layout.direction}`);
    if (root.layout.wrap) rootDecls.push('flex-wrap: wrap');
    if (root.layout.align) rootDecls.push(`align-items: ${ALIGN_CSS[root.layout.align]}`);
    if (root.layout.justify) rootDecls.push(`justify-content: ${JUSTIFY_CSS[root.layout.justify]}`);
    if (root.layout.width === 'fill') rootDecls.push('width: 100%', 'min-width: 0');
    if (root.layout.clip) rootDecls.push('overflow: hidden');
  } else {
    rootDecls.push('display: inline-flex', 'align-items: center', 'justify-content: center');
  }
  const rootTokens = root.tokens ?? {};
  // UA-margin neutralization: see UA_MARGIN_ELEMENTS.
  if (rootElementsOf(contract).some((el) => UA_MARGIN_ELEMENTS.has(el))) {
    rootDecls.push('margin: 0');
  }
  const borderPlan = rootBorderPlan(root);
  rootDecls.push('border: 0'); // always: kills the UA <button> 2px outset border
  if (borderPlan.inset) {
    rootDecls.push(
      borderPlan.side === 'bottom' ? BOTTOM_INSET_BORDER_SHADOW : INSET_BORDER_SHADOW,
    ); // drawn INSIDE — Figma parity
  }
  else if (borderPlan.hasBorder) rootDecls.push('border-style: solid'); // legacy path (non-uniform / shadowed root)
  if (contract.semantics.element === 'button') rootDecls.push('background-color: transparent'); // UA ButtonFace reset — before any token/literal push below
  const route = (cssProp: string): string => (borderPlan.inset && DSC_BORDER_VARS[cssProp]) || cssProp;
  // Fluid components: a max-width binding means "fill available space up to
  // the token" — components are never rigid (fixed `width` is reserved for
  // genuinely fixed shapes like Avatar). min-width: fit-content keeps the
  // component from collapsing below its content's floor (e.g. table cells'
  // min-widths); containers narrower than that should scroll.
  // Live-gauntlet class ⑤ (linked-icon-wrapper-collapses): a SLOT-ONLY root
  // carrying BOTH height and max-width is a drawn FIXED wrapper (CBDS Icon).
  // Its content floor is the DRAWN box — every max-width declaration mirrors
  // onto min-width (the stub discipline's observed-geometry floor) instead of
  // fit-content, which is 0 for an empty slot. Fluid slot containers (no
  // height binding) keep the fit-content floor. Mirrors core/emit-html.ts.
  const slotWrapperFloor =
    'max-width' in rootTokens &&
    'height' in rootTokens &&
    Object.keys(root.parts ?? {}).length > 0 &&
    Object.values(root.parts ?? {}).every((p) => p.slot !== undefined);
  if ('max-width' in rootTokens) {
    rootDecls.push('width: 100%');
    if (!slotWrapperFloor) rootDecls.push('min-width: fit-content');
  }
  // v15: a declared cursor fact is authoritative — the emitter's own button
  // chrome (cursor: pointer, and the :disabled not-allowed rule below) yields
  // to it. The declared fact is captured truth; the chrome was a convention.
  const rootDeclaresCursor =
    Boolean(root.declared?.['cursor']) || Boolean(root.declaredStates?.['disabled']?.['cursor']);
  if (contract.semantics.element === 'button' && !rootDeclaresCursor) rootDecls.push('cursor: pointer');
  // v7 overlay / v9 shape placement: any out-of-flow part positions against the
  // root, so the root must be the positioned containing block — an overlay part,
  // a part whose stylesWhen carries position: absolute (the shape-placement
  // spelling), OR a native checkable <input> which the emitter overlays
  // absolutely to cover its presentational box (isNativeCheckablePart, ~L1512).
  // Without the last case the invisible <input> escaped to the nearest
  // positioned ancestor (often <body>) and covered the whole page, eating every
  // click — the Checkbox "freeze" (an invisible full-page overlay, not a JS loop).
  if (
    walkAnatomy(contract).some(
      (w) =>
        w.part.overlay ||
        w.part.vectorAsset?.position ||
        (w.part.stylesWhen ?? []).some((sw) => sw.styles['position'] === 'absolute') ||
        isNativeCheckablePart(w.part),
    )
  ) {
    rootDecls.push('position: relative');
  }

  const enumRules = new Map<string, Map<string, string>>(); // class → decls
  const stateRules: string[] = [];
  const rootSubRules: string[] = [];

  for (const [cssProp, ref] of Object.entries(rootTokens)) {
    const refPath = stripBraces(ref);
    // slot-wrapper floor (class ⑤): root max-width mirrors onto min-width.
    const floorMirror = slotWrapperFloor && cssProp === 'max-width';
    // overlap on the ROOT (P21, proposed avatar-group shape): the gap token
    // becomes a negative child margin (CSS gap cannot be negative); the
    // canvas side uses negative itemSpacing — same projection as nested
    // parts below, single-placeholder refs expand per enum class.
    if (cssProp === 'gap' && root.layout?.overlap) {
      const phs = placeholdersIn(refPath);
      if (phs.length === 1) {
        for (const value of enums.get(phs[0]) ?? []) {
          const resolved = refPath.replaceAll(`{${phs[0]}}`, value);
          if (!checkToken(resolved, 'anatomy.root.tokens.gap')) continue;
          rootSubRules.push(`\n.${phs[0]}-${value} > * + * {\n  margin-left: ${cssVar(resolved)};\n}`);
        }
      } else if (checkToken(refPath, 'anatomy.root.tokens.gap')) {
        rootSubRules.push(`\n.root > * + * {\n  margin-left: ${cssVar(refPath)};\n}`);
      }
      continue;
    }
    const phs = placeholdersIn(refPath);
    if (phs.length === 0) {
      if (checkToken(refPath, `anatomy.root.tokens.${cssProp}`)) {
        rootDecls.push(`${route(cssProp)}: ${cssVar(refPath)}`);
        if (floorMirror) rootDecls.push(`min-width: ${cssVar(refPath)}`);
      }
    } else if (phs.length === 1) {
      const values = enums.get(phs[0]);
      if (!values) {
        errors.push(`${contract.id}: root token "${cssProp}" substitutes unknown enum prop "${phs[0]}"`);
        continue;
      }
      for (const value of values) {
        const resolved = refPath.replaceAll(`{${phs[0]}}`, value);
        if (!checkToken(resolved, `anatomy.root.tokens.${cssProp}`)) continue;
        const cls = `${phs[0]}-${value}`;
        if (!enumRules.has(cls)) enumRules.set(cls, new Map());
        enumRules.get(cls)!.set(route(cssProp), cssVar(resolved));
        if (floorMirror) enumRules.get(cls)!.set('min-width', cssVar(resolved));
      }
    } else if (phs.length === 2) {
      // Two-axis root token (e.g. a minted background = f(variant, state)):
      // one compound-class rule per value combination. The compound selector
      // (.variant-primary.state-hover) outranks the single enum classes, so
      // a pair binding wins over any single-axis binding of the same
      // property — deterministic, and both classes always ride the root.
      const [pa, pb] = phs;
      const va = enums.get(pa);
      const vb = enums.get(pb);
      if (!va || !vb) {
        errors.push(
          `${contract.id}: root token "${cssProp}" substitutes unknown enum prop "${!va ? pa : pb}"`,
        );
        continue;
      }
      for (const a of va) {
        for (const b of vb) {
          const resolved = refPath.replaceAll(`{${pa}}`, a).replaceAll(`{${pb}}`, b);
          if (!checkToken(resolved, `anatomy.root.tokens.${cssProp}`)) continue;
          // Both single classes must EXIST in the module (the TSX composes
          // styles[`prop-value`]; an unemitted class is undefined and the
          // compound selector would never match) — claim them, empty is fine.
          for (const single of [`${pa}-${a}`, `${pb}-${b}`]) {
            if (!enumRules.has(single)) enumRules.set(single, new Map());
          }
          const cls = `${pa}-${a}.${pb}-${b}`;
          if (!enumRules.has(cls)) enumRules.set(cls, new Map());
          enumRules.get(cls)!.set(route(cssProp), cssVar(resolved));
        }
      }
    } else if (phs.length === 3) {
      // Three-axis root token (live-gauntlet class ①: a minted background =
      // f(type, style, state) — CBDS Chip's root fill): one compound-class
      // rule per value combination, the two-axis projection extended one
      // axis. The triple compound (.type-brand.style-fill.state-hover)
      // outranks pair and single classes — deterministic; all three classes
      // always ride the root.
      const [pa, pb, pc] = phs;
      const vsets = phs.map((p) => enums.get(p));
      if (vsets.some((v) => !v)) {
        const missing = phs[vsets.findIndex((v) => !v)];
        errors.push(`${contract.id}: root token "${cssProp}" substitutes unknown enum prop "${missing}"`);
        continue;
      }
      for (const a of vsets[0]!) {
        for (const b of vsets[1]!) {
          for (const c of vsets[2]!) {
            const resolved = refPath
              .replaceAll(`{${pa}}`, a)
              .replaceAll(`{${pb}}`, b)
              .replaceAll(`{${pc}}`, c);
            if (!checkToken(resolved, `anatomy.root.tokens.${cssProp}`)) continue;
            for (const single of [`${pa}-${a}`, `${pb}-${b}`, `${pc}-${c}`]) {
              if (!enumRules.has(single)) enumRules.set(single, new Map());
            }
            const cls = `${pa}-${a}.${pb}-${b}.${pc}-${c}`;
            if (!enumRules.has(cls)) enumRules.set(cls, new Map());
            enumRules.get(cls)!.set(route(cssProp), cssVar(resolved));
          }
        }
      }
    } else {
      errors.push(`${contract.id}: root token "${cssProp}" uses ${phs.length} substitutions (max 3)`);
    }
  }

  // v10 tokensByProp on the root: per-enum-value overrides land in the SAME
  // enum-class rules substituted refs use — emitted after .root, so the
  // override wins at equal specificity (the layoutByProp discipline).
  // v14: MULTIPLE entries emit in declaration order — a later entry's class
  // rule lands later in the sheet, so at equal specificity the later entry
  // wins per channel (the CSS source-order cascade the values came from).
  for (const { prop: tbpProp, map } of tokensByPropEntries(root)) {
    for (const [value, overrides] of Object.entries(map)) {
      for (const [cssProp, ref] of Object.entries(overrides)) {
        const refPath = stripBraces(ref);
        const floorMirror = slotWrapperFloor && cssProp === 'max-width';
        // S2 capability lift: a map ref carrying ONE placeholder (validated
        // as a different declared enum prop) expands as compound enum-class
        // rules — the two-placeholder root-token projection with one axis
        // pinned by the map. Both single classes are claimed so the compound
        // selector can match (the pair-binding discipline above).
        const phs = placeholdersIn(refPath);
        if (phs.length === 1) {
          for (const phValue of enums.get(phs[0]) ?? []) {
            const resolved = refPath.replaceAll(`{${phs[0]}}`, phValue);
            if (!checkToken(resolved, `anatomy.root.tokensByProp.${value}.${cssProp}`)) continue;
            for (const single of [`${tbpProp}-${value}`, `${phs[0]}-${phValue}`]) {
              if (!enumRules.has(single)) enumRules.set(single, new Map());
            }
            const cls = `${tbpProp}-${value}.${phs[0]}-${phValue}`;
            if (!enumRules.has(cls)) enumRules.set(cls, new Map());
            enumRules.get(cls)!.set(route(cssProp), cssVar(resolved));
            if (floorMirror) enumRules.get(cls)!.set('min-width', cssVar(resolved));
          }
          continue;
        }
        if (!checkToken(refPath, `anatomy.root.tokensByProp.${value}.${cssProp}`)) continue;
        const cls = `${tbpProp}-${value}`;
        if (!enumRules.has(cls)) enumRules.set(cls, new Map());
        enumRules.get(cls)!.set(route(cssProp), cssVar(refPath));
        if (floorMirror) enumRules.get(cls)!.set('min-width', cssVar(refPath));
      }
    }
  }

  // v14 literals: bounded literal channels ride the same rule shapes as
  // token bindings — base decls on .root, per-value overrides as enum-class
  // rules (validated in validateContract; refused channels never reach here).
  for (const [cssProp, lit] of Object.entries(root.literals ?? {})) {
    rootDecls.push(`${route(cssProp)}: ${lit}`);
  }
  for (const { prop: lbpProp, map } of root.literalsByProp ?? []) {
    for (const [value, overrides] of Object.entries(map)) {
      for (const [cssProp, lit] of Object.entries(overrides)) {
        const cls = `${lbpProp}-${value}`;
        if (!enumRules.has(cls)) enumRules.set(cls, new Map());
        enumRules.get(cls)!.set(route(cssProp), lit);
      }
    }
  }

  // v15 declared facts on the root: verbatim base decls (registry-validated
  // in validateContract; refused channels never reach here). A declared
  // `position` supersedes the emitter's own overlay-driven push.
  for (const [cssProp, value] of Object.entries(root.declared ?? {})) {
    if (cssProp === 'position' && rootDecls.includes('position: relative')) {
      if (value === 'relative') continue; // already emitted by overlay chrome
      rootDecls.splice(rootDecls.indexOf('position: relative'), 1);
    }
    rootDecls.push(`${cssProp}: ${value}`);
  }

  // a11y.minHitArea: the declared floor is ENFORCED, not aspirational — the
  // standard non-visual hit-target extension (an absolutely centered ::before
  // at max(100%, floor) per axis; it paints nothing and never affects layout,
  // but pointer events on it hit the component). Field failure: Button
  // declared 44 while the small size rendered a 36px-tall target and nothing
  // enforced the difference.
  const minHitArea = contract.a11y?.minHitArea;
  if (typeof minHitArea === 'number' && !rootDecls.includes('position: relative')) {
    rootDecls.push('position: relative');
  }

  lines.push('', '.root {');
  for (const d of rootDecls) lines.push(`  ${d};`);
  lines.push('}');
  lines.push(...rootSubRules);

  if (typeof minHitArea === 'number') {
    lines.push(
      '',
      '/* a11y.minHitArea: non-visual hit-target floor — see contract */',
      '.root::before {',
      "  content: '';",
      '  position: absolute;',
      '  left: 50%;',
      '  top: 50%;',
      `  width: max(100%, ${minHitArea}px);`,
      `  height: max(100%, ${minHitArea}px);`,
      '  transform: translate(-50%, -50%);',
      '}',
    );
  }

  if (contract.states.includes('focus-visible')) {
    lines.push('', '.root:focus-visible {', '  outline-style: solid;', '  outline-offset: 2px;', '}');
  }
  if (contract.states.includes('disabled') && contract.semantics.element === 'button' && !rootDeclaresCursor) {
    lines.push('', '.root:disabled {', '  cursor: not-allowed;', '}');
  }

  for (const [cls, decls] of enumRules) {
    lines.push('', `.${cls} {`);
    for (const [prop, value] of decls) lines.push(`  ${prop}: ${value};`);
    lines.push('}');
  }

  // v7 layoutByProp on the root: the enum class sits on the root element
  // itself, so the override rule targets it directly (emitted after .root
  // so the override wins at equal specificity).
  if (root.layoutByProp) {
    for (const [value, override] of Object.entries(root.layoutByProp.map)) {
      const decls = layoutOverrideDecls(override);
      if (decls.length === 0) continue;
      lines.push('', `.${root.layoutByProp.prop}-${value} {`);
      for (const d of decls) lines.push(`  ${d};`);
      lines.push('}');
    }
  }

  for (const [state, decls] of Object.entries(root.states ?? {})) {
    const sel = STATE_SELECTORS[state];
    if (!sel) {
      errors.push(`${contract.id}: unknown state "${state}"`);
      continue;
    }
    for (const [cssProp, ref] of Object.entries(decls)) {
      const refPath = stripBraces(ref);
      const phs = placeholdersIn(refPath);
      if (phs.length === 0) {
        if (checkToken(refPath, `anatomy.root.states.${state}.${cssProp}`)) {
          stateRules.push(`\n.root${sel} {\n  ${route(cssProp)}: ${cssVar(refPath)};\n}`);
        }
      } else if (phs.length === 1) {
        const values = enums.get(phs[0]) ?? [];
        for (const value of values) {
          const resolved = refPath.replaceAll(`{${phs[0]}}`, value);
          if (!checkToken(resolved, `anatomy.root.states.${state}.${cssProp}`)) continue;
          stateRules.push(`\n.${phs[0]}-${value}${sel} {\n  ${route(cssProp)}: ${cssVar(resolved)};\n}`);
        }
      }
    }
  }
  lines.push(...stateRules);
  // v15 declaredStates on the root: verbatim state-selector rules, emitted
  // after the token state rules (a declared fact never shadows a binding —
  // they carry disjoint channels by the validateContract ambiguity rule).
  for (const [state, overrides] of Object.entries(root.declaredStates ?? {})) {
    const sel = STATE_SELECTORS[state];
    if (!sel) continue; // refused by validateContract
    const decls = Object.entries(overrides).map(([cssProp, value]) => `  ${cssProp}: ${value};`);
    if (decls.length > 0) lines.push('', `.root${sel} {`, ...decls, '}');
  }
  // v7 stylesWhen on the root part (emitted last so the condition wins).
  lines.push(...stylesWhenRules(contract, 'root', root, true));

  const usedAnimations = new Set<string>();
  // Nested parts (no substitutions; validated above).
  for (const { name, part, path: p } of walkAnatomy(contract)) {
    if (p[0] === 'root' && p.length === 1) continue;
    if (part.component) continue; // instances style themselves via their own contract
    const decls: string[] = [];
    if (isStructural(part)) {
      decls.push(`display: ${part.layout?.display ?? 'flex'}`);
      if (part.layout?.direction) decls.push(`flex-direction: ${part.layout.direction}`);
      if (part.layout?.wrap) decls.push('flex-wrap: wrap');
      if (part.layout?.align) decls.push(`align-items: ${ALIGN_CSS[part.layout.align]}`);
      if (part.layout?.justify) decls.push(`justify-content: ${JUSTIFY_CSS[part.layout.justify]}`);
    }
    if (part.layout?.grow) decls.push('flex: 1 1 auto', 'min-width: 0');
    if (part.layout?.width === 'fill') {
      decls.push('width: 100%');
      if (!part.layout.grow) decls.push('min-width: 0');
    }
    if (part.layout?.clip) decls.push('overflow: hidden');
    // UA-margin neutralization on NESTED parts (round 4): a promoted h2/p/ul
    // part would leak UA margins the real component resets — same discipline
    // as the root rule; captured nonzero margins arrive as minted overrides.
    if (part.element && UA_MARGIN_ELEMENTS.has(part.element)) decls.push('margin: 0');
    // v7 overlay: out of flow, attached to the root's edge.
    if (part.overlay) decls.push('position: absolute', ...OVERLAY_CSS[part.overlay.placement]);
    // v9 shape: parametric leaf decor — the ONE shared projection
    // (scripts/contract-schema.ts shapeCssDecls); placement/rotation-per-
    // variant ride stylesWhen rules below.
    if (part.shape) decls.push(...shapeCssDecls(part.shape));
    // Event-trigger buttons: neutralize UA button styles BEFORE token decls
    // so the contract's tokens (padding, background, font) win.
    if (part.element === 'button' && (contract.events ?? []).some((e) => e.trigger === name)) {
      decls.push(
        'appearance: none',
        'background: none',
        'border: none',
        'margin: 0',
        'padding: 0',
        'font: inherit',
        'color: inherit',
        'text-align: inherit',
        'cursor: pointer',
      );
    }
    // Round 4: a promoted TEXT-entry control (input/textarea/select part
    // that is not the checkable pattern) neutralizes UA chrome — mirrors
    // core/emit-html.ts.
    if (!isNativeCheckablePart(part) && (part.element === 'input' || part.element === 'textarea' || part.element === 'select')) {
      decls.push('appearance: none', 'border: none', 'background: transparent',
        'font: inherit', 'color: inherit', 'letter-spacing: inherit', 'margin: 0', 'padding: 0', 'outline: none');
    }
    // Native checkable inputs (input[type=checkbox|radio]): the REAL control
    // covers its presentational box invisibly — it stays the focusable,
    // checkable element while the box and glyphs draw the visual.
    if (isNativeCheckablePart(part)) {
      decls.push(
        'position: absolute',
        'inset: 0',
        'width: 100%',
        'height: 100%',
        'margin: 0',
        'padding: 0',
        'opacity: 0',
        'cursor: pointer',
      );
    }
    if (part.icon || part.vectorAsset) {
      decls.push('display: inline-flex', 'flex-shrink: 0');
      if (part.vectorAsset?.position) {
        decls.push('position: absolute', `left: ${part.vectorAsset.position.x}px`, `top: ${part.vectorAsset.position.y}px`);
      }
      const width = part.vectorAsset?.width ?? part.icon?.size;
      const height = part.vectorAsset?.height ?? part.icon?.size;
      if (width && height) lines.push('', `.${name} svg {`, `  width: ${width}px;`, `  height: ${height}px;`, '}');
      if (part.element === 'button') {
        decls.push(
          'align-items: center',
          'justify-content: center',
          'background: none',
          'border: none',
          'padding: 0',
          'color: inherit',
          'cursor: pointer',
        );
      }
    }
    const nestedSubRules: string[] = [];
    const strong = richTextStrongStyle(part.content?.marks?.strong ?? part.textMarks?.strong);
    if (strong.fontWeight) {
      const tokenPath = strong.fontWeight.startsWith('{') ? stripBraces(strong.fontWeight) : null;
      if (!tokenPath || checkToken(tokenPath, `anatomy.${name}.${part.content ? 'content.marks' : 'textMarks'}.strong`)) {
        const weight = tokenPath ? cssVar(tokenPath) : strong.fontWeight;
        const declarations = [`  font-weight: ${weight};`];
        if (strong.fontSize) declarations.push(`  font-size: ${strong.fontSize};`);
        if (strong.lineHeight) declarations.push(`  line-height: ${strong.lineHeight};`);
        nestedSubRules.push(
          `\n.${name} > strong {\n${declarations.join('\n')}\n}`,
        );
      }
    }
    if (hasUnderlinedSegment(part)) {
      nestedSubRules.push('\n' + underlineRule(`.${name}`));
    }
    if (part.animation) {
      decls.push(
        part.animation === 'spin'
          ? 'animation: ds-spin 0.8s linear infinite'
          : 'animation: ds-pulse 1.6s ease-in-out infinite',
      );
      usedAnimations.add(part.animation);
    }
    for (const [cssProp, ref] of Object.entries(part.tokens ?? {})) {
      const refPath = stripBraces(ref);
      // overlap: the gap token becomes a negative child margin (CSS gap
      // cannot be negative); the canvas side uses negative itemSpacing.
      // Single-placeholder refs expand per enum class (P21 minted per-axis
      // magnitudes), the nested-token-substitution rule shape.
      if (cssProp === 'gap' && part.layout?.overlap) {
        const overlapPhs = placeholdersIn(refPath);
        if (overlapPhs.length === 1) {
          for (const value of enums.get(overlapPhs[0]) ?? []) {
            const resolved = refPath.replaceAll(`{${overlapPhs[0]}}`, value);
            if (!checkToken(resolved, `anatomy.${name}.tokens.gap`)) continue;
            nestedSubRules.push(`\n.${overlapPhs[0]}-${value} .${name} > * + * {\n  margin-left: ${cssVar(resolved)};\n}`);
          }
        } else if (checkToken(refPath, `anatomy.${name}.tokens.gap`)) {
          nestedSubRules.push(`\n.${name} > * + * {\n  margin-left: ${cssVar(refPath)};\n}`);
        }
        continue;
      }
      const phs = placeholdersIn(refPath);
      if (phs.length === 1) {
        // Per-enum-value descendant rule under the root's variant class.
        for (const value of enums.get(phs[0]) ?? []) {
          const resolved = refPath.replaceAll(`{${phs[0]}}`, value);
          if (!checkToken(resolved, `anatomy.${name}.tokens.${cssProp}`)) continue;
          nestedSubRules.push(`\n.${phs[0]}-${value} .${name} {\n  ${cssProp}: ${cssVar(resolved)};\n}`);
        }
        continue;
      }
      if (checkToken(refPath, `anatomy.${name}.tokens.${cssProp}`)) {
        decls.push(`${cssProp}: ${cssVar(refPath)}`);
      }
    }
    if (
      (part.tokens && ('border-width' in part.tokens || 'border-color' in part.tokens)) ||
      (part.literals && 'border-width' in part.literals)
    ) {
      decls.push('border-style: solid');
    }
    // v10 tokensByProp on a nested part: descendant rule under the root's
    // enum class — exactly the nested-token-substitution rule shape.
    // v14: multiple entries emit in order (later entries win per channel).
    for (const entry of tokensByPropEntries(part)) {
      for (const [value, overrides] of Object.entries(entry.map)) {
        for (const [cssProp, ref] of Object.entries(overrides)) {
          const refPath = stripBraces(ref);
          // S2 capability lift: one-placeholder map refs expand as compound
          // enum-class descendant rules (both classes ride the root).
          const phs = placeholdersIn(refPath);
          if (phs.length === 1) {
            for (const phValue of enums.get(phs[0]) ?? []) {
              const resolved = refPath.replaceAll(`{${phs[0]}}`, phValue);
              if (!checkToken(resolved, `anatomy.${name}.tokensByProp.${value}.${cssProp}`)) continue;
              for (const single of [`${entry.prop}-${value}`, `${phs[0]}-${phValue}`]) {
                if (!enumRules.has(single)) enumRules.set(single, new Map());
              }
              nestedSubRules.push(
                `\n.${entry.prop}-${value}.${phs[0]}-${phValue} .${name} {\n  ${cssProp}: ${cssVar(resolved)};\n}`,
              );
              // 015: mirrors the literalsByProp branch below — an icon part's
              // width/height must also reach the injected <svg>, or the
              // per-variant override sizes only the wrapper and the glyph
              // itself falls back to the base icon.size.
              if (part.icon && (cssProp === 'width' || cssProp === 'height')) {
                nestedSubRules.push(
                  `\n.${entry.prop}-${value}.${phs[0]}-${phValue} .${name} svg {\n  ${cssProp}: ${cssVar(resolved)};\n}`,
                );
              }
            }
            continue;
          }
          if (!checkToken(refPath, `anatomy.${name}.tokensByProp.${value}.${cssProp}`)) continue;
          nestedSubRules.push(
            `\n.${entry.prop}-${value} .${name} {\n  ${cssProp}: ${cssVar(refPath)};\n}`,
          );
          // 015: same mirror as above, for the non-placeholder (single-enum) case.
          if (part.icon && (cssProp === 'width' || cssProp === 'height')) {
            nestedSubRules.push(
              `\n.${entry.prop}-${value} .${name} svg {\n  ${cssProp}: ${cssVar(refPath)};\n}`,
            );
          }
        }
      }
    }
    // v14 literals on a nested part: base decls + per-value descendant rules.
    for (const [cssProp, lit] of Object.entries(part.literals ?? {})) {
      decls.push(`${cssProp}: ${lit}`);
    }
    for (const entry of part.literalsByProp ?? []) {
      for (const [value, overrides] of Object.entries(entry.map)) {
        const lDecls = Object.entries(overrides).map(([cssProp, lit]) => `  ${cssProp}: ${lit};`);
        if (lDecls.length === 0) continue;
        nestedSubRules.push(`\n.${entry.prop}-${value} .${name} {\n${lDecls.join('\n')}\n}`);
        if (part.icon) {
          const svgSizeDecls = Object.entries(overrides)
            .filter(([cssProp]) => cssProp === 'width' || cssProp === 'height')
            .map(([cssProp, lit]) => `  ${cssProp}: ${lit};`);
          if (svgSizeDecls.length > 0) {
            nestedSubRules.push(
              `\n.${entry.prop}-${value} .${name} svg {\n${svgSizeDecls.join('\n')}\n}`,
            );
          }
        }
      }
    }
    // v15 declared facts on a nested part: verbatim base decls + per-state
    // descendant rules under the root's state selector.
    for (const [cssProp, value] of Object.entries(part.declared ?? {})) {
      decls.push(`${cssProp}: ${value}`);
    }
    // Round 4: an absolutely-positioned REPLACED part (promoted Thumbnail
    // img) fills its inset box — for replaced elements, auto width under
    // inset-0 resolves to the intrinsic size, so the fill is emitter chrome.
    if (part.element === 'img' && part.declared?.['position'] === 'absolute') {
      decls.push('width: 100%', 'height: 100%');
    }
    for (const [state, overrides] of Object.entries(part.declaredStates ?? {})) {
      const sel = STATE_SELECTORS[state];
      if (!sel) continue; // refused by validateContract
      const dDecls = Object.entries(overrides).map(([cssProp, value]) => `  ${cssProp}: ${value};`);
      if (dDecls.length > 0) nestedSubRules.push(`\n.root${sel} .${name} {\n${dDecls.join('\n')}\n}`);
    }
    // v13 part-level states (P18 second half): descendant rules under the
    // root's STATE selector — .root:disabled .label { color: … } — the same
    // STATE_SELECTORS the root states ride (native :disabled; hover/active
    // gated :not(:disabled)). Single-placeholder refs expand per enum value
    // on the root's enum class, exactly like the root's own state rules.
    for (const [state, overrides] of Object.entries(part.states ?? {})) {
      const sel = STATE_SELECTORS[state];
      if (!sel) continue; // refused by validateContract
      for (const [cssProp, ref] of Object.entries(overrides)) {
        const refPath = stripBraces(ref);
        const phs = placeholdersIn(refPath);
        if (phs.length === 0) {
          if (checkToken(refPath, `anatomy.${name}.states.${state}.${cssProp}`)) {
            nestedSubRules.push(`\n.root${sel} .${name} {\n  ${cssProp}: ${cssVar(refPath)};\n}`);
          }
        } else if (phs.length === 1) {
          for (const value of enums.get(phs[0]) ?? []) {
            const resolved = refPath.replaceAll(`{${phs[0]}}`, value);
            if (!checkToken(resolved, `anatomy.${name}.states.${state}.${cssProp}`)) continue;
            nestedSubRules.push(`\n.${phs[0]}-${value}${sel} .${name} {\n  ${cssProp}: ${cssVar(resolved)};\n}`);
          }
        }
      }
    }
    // v7 layoutByProp on a nested part: descendant rule under the root's
    // enum class — exactly the nested-token-substitution rule shape.
    if (part.layoutByProp) {
      for (const [value, override] of Object.entries(part.layoutByProp.map)) {
        const lDecls = layoutOverrideDecls(override);
        if (lDecls.length === 0) continue;
        nestedSubRules.push(
          `\n.${part.layoutByProp.prop}-${value} .${name} {\n${lDecls.map((d) => `  ${d};`).join('\n')}\n}`,
        );
      }
    }
    // A box holding a visually-managed native input anchors it and carries
    // the focus ring (the input is opacity:0, so its own outline is
    // invisible; :has lifts :focus-visible onto the visible box — the same
    // outline idiom as .root:focus-visible).
    for (const [childName, child] of Object.entries(part.parts ?? {})) {
      if (!isNativeCheckablePart(child)) continue;
      decls.push('position: relative');
      nestedSubRules.push(
        `\n.${name}:has(> .${childName}:focus-visible) {\n  outline-style: solid;\n  outline-offset: 2px;\n}`,
      );
    }
    // v7 stylesWhen on a nested part.
    nestedSubRules.push(...stylesWhenRules(contract, name, part, false));
    nestedSubRules.push(...stylesWhenRules(contract, name, { ...part, stylesWhen: part.glyphStylesWhen }, false, ' svg'));
    if (decls.length === 0 && nestedSubRules.length === 0) continue;
    if (decls.length > 0) {
      lines.push('', `.${name} {`);
      for (const d of decls) lines.push(`  ${d};`);
      lines.push('}');
    }
    lines.push(...nestedSubRules);
    if (part.icon && part.element) {
      lines.push('', `.${name}Glyph {`, '  display: inline-flex;', '}');
    }
  }

  if (usedAnimations.has('spin')) {
    lines.push('', '@keyframes ds-spin {', '  to { transform: rotate(360deg); }', '}');
  }
  if (usedAnimations.has('pulse')) {
    lines.push('', '@keyframes ds-pulse {', '  0%, 100% { opacity: 1; }', '  50% { opacity: 0.45; }', '}');
  }

  return lines.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// Component (.tsx) generation
// ---------------------------------------------------------------------------

export const ELEMENT_META: Record<string, { attrs: string; el: string; supportsDisabled: boolean }> = {
  button: { attrs: 'ButtonHTMLAttributes', el: 'HTMLButtonElement', supportsDisabled: true },
  span: { attrs: 'HTMLAttributes', el: 'HTMLSpanElement', supportsDisabled: false },
  div: { attrs: 'HTMLAttributes', el: 'HTMLDivElement', supportsDisabled: false },
  a: { attrs: 'AnchorHTMLAttributes', el: 'HTMLAnchorElement', supportsDisabled: false },
  input: { attrs: 'InputHTMLAttributes', el: 'HTMLInputElement', supportsDisabled: true },
  article: { attrs: 'HTMLAttributes', el: 'HTMLElement', supportsDisabled: false },
  section: { attrs: 'HTMLAttributes', el: 'HTMLElement', supportsDisabled: false },
  header: { attrs: 'HTMLAttributes', el: 'HTMLElement', supportsDisabled: false },
  footer: { attrs: 'HTMLAttributes', el: 'HTMLElement', supportsDisabled: false },
  label: { attrs: 'LabelHTMLAttributes', el: 'HTMLLabelElement', supportsDisabled: false },
  nav: { attrs: 'HTMLAttributes', el: 'HTMLElement', supportsDisabled: false },
  hr: { attrs: 'HTMLAttributes', el: 'HTMLHRElement', supportsDisabled: false },
  ul: { attrs: 'HTMLAttributes', el: 'HTMLUListElement', supportsDisabled: false },
  li: { attrs: 'LiHTMLAttributes', el: 'HTMLLIElement', supportsDisabled: false },
  p: { attrs: 'HTMLAttributes', el: 'HTMLParagraphElement', supportsDisabled: false },
  textarea: { attrs: 'TextareaHTMLAttributes', el: 'HTMLTextAreaElement', supportsDisabled: true },
  select: { attrs: 'SelectHTMLAttributes', el: 'HTMLSelectElement', supportsDisabled: true },
  fieldset: { attrs: 'FieldsetHTMLAttributes', el: 'HTMLFieldSetElement', supportsDisabled: true },
  // Plain HTMLAttributes: BlockquoteHTMLAttributes declares `cite: string`,
  // which collides with slot props named cite (Astryx Blockquote API).
  blockquote: { attrs: 'HTMLAttributes', el: 'HTMLQuoteElement', supportsDisabled: false },
  code: { attrs: 'HTMLAttributes', el: 'HTMLElement', supportsDisabled: false },
  kbd: { attrs: 'HTMLAttributes', el: 'HTMLElement', supportsDisabled: false },
  h1: { attrs: 'HTMLAttributes', el: 'HTMLHeadingElement', supportsDisabled: false },
  h2: { attrs: 'HTMLAttributes', el: 'HTMLHeadingElement', supportsDisabled: false },
  h3: { attrs: 'HTMLAttributes', el: 'HTMLHeadingElement', supportsDisabled: false },
  h4: { attrs: 'HTMLAttributes', el: 'HTMLHeadingElement', supportsDisabled: false },
  h5: { attrs: 'HTMLAttributes', el: 'HTMLHeadingElement', supportsDisabled: false },
  h6: { attrs: 'HTMLAttributes', el: 'HTMLHeadingElement', supportsDisabled: false },
};

/** HTML void elements in the schema's element vocabulary: they take NO children
 *  and render self-closing. A root of one of these (e.g. a native `<input>`
 *  atom) carries its shown value through `defaultValue`, never a text child —
 *  putting `{children}` inside a void element is invalid React. Nested void
 *  parts already render correctly (partAttrString); this set extends the same
 *  rule to the root. */
export const VOID_ELEMENTS = new Set(['input', 'hr']);

/** Native text form controls: the shown text rides `defaultValue` and the
 *  element renders self-closing (a child text node is invalid for `<input>`
 *  and a controlled/children anti-pattern for `<textarea>` in React). The
 *  canvas draws that value as a text child bound to the same property — exactly
 *  as the Button's label binds to « Libellé » — and code collapses it onto the
 *  native control. `<select>` is deliberately absent: its value is one of its
 *  `<option>` children, a different shape. */
export const NATIVE_TEXT_CONTROLS = new Set(['input', 'textarea']);

const PARENT_PROP_REF = /^\{([a-z][\w-]*)\}$/;

/** Story/sample-only value for a required identity that deliberately has no
 * contract default because it exists solely in consuming code. This never
 * reaches the component's runtime defaults; it only makes generated examples
 * concrete and type-correct. */
function codeOnlyRequiredTextSample(prop: Prop): string {
  return `${prop.bindings.code.prop}-sample`;
}

function depAttrString(
  dep: Contract,
  fixedProps: Record<string, ComponentPropValue>,
  parent?: Contract,
  omitChildren = false,
): string {
  const parts: string[] = [];
  for (const [propName, value] of Object.entries(fixedProps)) {
    const depProp = dep.props.find((p) => p.name === propName);
    if (omitChildren && depProp?.bindings.code.prop === 'children') continue;
    const codeName = depProp?.bindings.code.prop ?? propName;
    // v19: a rich-text child prop receives its segments as prop DATA. The
    // referee has already refused a segment array anywhere else.
    if (Array.isArray(value)) {
      parts.push(` ${codeName}={${JSON.stringify(value)}}`);
      continue;
    }
    if (typeof value === 'boolean') {
      // `false` MUST be passed explicitly. Omitting it lets the child fall back
      // to its OWN default, so a child defaulting to `true` would render true
      // where the contract declared false — the fact inverted, silently.
      parts.push(value ? ` ${codeName}` : ` ${codeName}={false}`);
      continue;
    }
    if (typeof value === 'number') {
      parts.push(` ${codeName}={${value}}`);
      continue;
    }
    const parentRef = value.match(PARENT_PROP_REF);
    if (parentRef && parent) {
      // Parent→child prop mapping: `density: "{density}"` → density={density}
      const parentProp = parent.props.find((p) => p.name === parentRef[1]);
      parts.push(` ${codeName}={${parentProp?.bindings.code.prop ?? parentRef[1]}}`);
    } else {
      parts.push(` ${codeName}="${value}"`);
    }
  }
  return parts.join('');
}

/** A composed child exposes its text API as JSX children, not an attribute.
 * Keep that representation when a parent threads a value into the child's
 * children-bound prop so the mapping does not collide with the child's
 * declared default text. */
function componentChildrenJsx(
  dep: Contract,
  fixedProps: Record<string, ComponentPropValue>,
  parent?: Contract,
): string | undefined {
  for (const [propName, value] of Object.entries(fixedProps)) {
    const depProp = dep.props.find((p) => p.name === propName);
    if (depProp?.bindings.code.prop !== 'children') continue;
    // Segments stay DATA through the children position: `String(value)` here
    // would render "[object Object]" — the fact destroyed without a word.
    if (Array.isArray(value)) return `{${JSON.stringify(value)}}`;
    if (typeof value === 'string') {
      const parentRef = value.match(PARENT_PROP_REF);
      if (parentRef && parent) {
        const parentProp = parent.props.find((p) => p.name === parentRef[1]);
        return `{${parentProp?.bindings.code.prop ?? parentRef[1]}}`;
      }
    }
    return String(value);
  }
  return undefined;
}

/** Sample JSX for slot defaultContent — recursive: an item whose contract has
 *  its own default-slot defaultContent renders that too (Table → Row → Cell). */
export function sampleJSX(
  items: Array<{ id: string; props?: Record<string, string | boolean>; text?: string }>,
  byId: Map<string, Contract>,
  depth = 0,
): string {
  if (depth > 3) return '';
  return items
    .map((item) => {
      const dep = byId.get(item.id)!;
      const sampleProps = { ...(item.props ?? {}) };
      for (const prop of dep.props) {
        if (
          prop.type === 'text' &&
          prop.required &&
          prop.bindings.figma.kind === 'NONE' &&
          sampleProps[prop.name] === undefined
        ) {
          sampleProps[prop.name] = codeOnlyRequiredTextSample(prop);
        }
      }
      const attrs = depAttrString(dep, sampleProps);
      const childrenText = textProps(dep).find((p) => p.bindings.code.prop === 'children');
      const nestedDefault = slotsOf(dep).find(
        (s) => s.slot.name === 'children' && (s.slot.defaultContent?.length ?? 0) > 0,
      );
      if (item.text !== undefined) return `<${dep.name}${attrs}>${item.text}</${dep.name}>`;
      if (nestedDefault) {
        return `<${dep.name}${attrs}>\n${sampleJSX(nestedDefault.slot.defaultContent!, byId, depth + 1)}\n</${dep.name}>`;
      }
      if (typeof childrenText?.default === 'string') {
        return `<${dep.name}${attrs}>${childrenText.default}</${dep.name}>`;
      }
      return `<${dep.name}${attrs} />`;
    })
    .join('\n');
}

/** All contracts referenced by a slot-sample tree (for story imports). */
function sampleDeps(
  items: Array<{ id: string }>,
  byId: Map<string, Contract>,
  out = new Set<string>(),
  depth = 0,
): Set<string> {
  if (depth > 3) return out;
  for (const item of items) {
    const dep = byId.get(item.id)!;
    out.add(dep.name);
    const nested = slotsOf(dep).find(
      (s) => s.slot.name === 'children' && (s.slot.defaultContent?.length ?? 0) > 0,
    );
    if (nested) sampleDeps(nested.slot.defaultContent!, byId, out, depth + 1);
  }
  return out;
}

export function generateTsx(
  contract: Contract,
  byId: Map<string, Contract>,
  iconAssets: Map<string, string>,
): string {
  // elementByProp renders a dynamic tag — the ref/attrs generalize to the
  // shared HTMLElement surface (the concrete element varies per prop value).
  const elementByProp = contract.semantics.elementByProp;
  const meta = elementByProp
    ? { attrs: 'HTMLAttributes', el: 'HTMLElement', supportsDisabled: false }
    : ELEMENT_META[contract.semantics.element];
  const name = contract.name;
  const enums = enumProps(contract);
  const bools = boolProps(contract);
  const texts = namedTextProps(contract);
  const richTexts = namedRichTextProps(contract);
  const slots = namedSlots(contract);
  const codePropOf = (propName: string) =>
    contract.props.find((p) => p.name === propName)?.bindings.code.prop ?? propName;
  const deps = [
    ...new Set(
      walkAnatomy(contract)
        .filter((w) => w.part.component)
        .flatMap((w) => [
          byId.get(w.part.component!.id)!.name,
          // v20 (016): slotted content renders as JSX children — import it too.
          ...Object.values(w.part.component!.slots ?? {}).map((item) => byId.get(item.id)!.name),
        ]),
    ),
  ];

  const events = contract.events ?? [];
  const controlIdByPart = new Map<string, string>();
  for (const ev of events) {
    if (ev.toggles?.controls && !controlIdByPart.has(ev.toggles.controls)) {
      controlIdByPart.set(ev.toggles.controls, `${ev.name}ControlsId`);
    }
  }
  const toggledCodeProps = new Set(
    events.filter((e) => e.toggles).map((e) => codePropOf(e.toggles!.prop)),
  );

  const propLines: string[] = [];
  for (const p of contract.props) {
    const doc = p.description ? `  /** ${p.description} */\n` : '';
    if (isEnum(p)) {
      const union = p.type.enum.map((v) => `'${v}'`).join(' | ');
      propLines.push(`${doc}  ${p.bindings.code.prop}?: ${union};`);
    } else if (isArrayType(p)) {
      const fields = Object.entries(p.type.arrayOf)
        .map(([f, t]) => `${f}: ${arrayFieldTsType(t)}`)
        .join('; ');
      propLines.push(`${doc}  ${p.bindings.code.prop}?: Array<{ ${fields} }>;`);
    } else if (isRichText(p)) {
      propLines.push(
        `${doc}  ${p.bindings.code.prop}${p.required ? '' : '?'}: Array<{ text: string; strong?: boolean }>;`,
      );
    } else if (p.type === 'boolean') {
      propLines.push(`${doc}  ${p.bindings.code.prop}?: boolean;`);
    } else if (p.type === 'number') {
      propLines.push(`${doc}  ${p.bindings.code.prop}?: number;`);
    } else if (p.bindings.code.prop !== 'children') {
      propLines.push(`${doc}  ${p.bindings.code.prop}${p.required ? '' : '?'}: string;`);
    }
  }
  for (const { slot, part } of slots) {
    const doc = part.description ? `  /** ${part.description} */\n` : '';
    propLines.push(`${doc}  ${slot.name}?: ReactNode;`);
  }
  for (const ev of events) {
    const doc = ev.description ?? `Fires when the ${ev.trigger} is activated.`;
    propLines.push(`  /** ${doc} */\n  ${ev.bindings.code.prop}?: () => void;`);
  }

  const destructured: string[] = [];
  // A toggled enum prop follows the controlled/uncontrolled pattern: no
  // destructure default — undefined means "uncontrolled", backed by useState.
  for (const p of enums) {
    destructured.push(
      toggledCodeProps.has(p.bindings.code.prop)
        ? `${p.bindings.code.prop}: ${p.bindings.code.prop}Prop`
        : `${p.bindings.code.prop} = '${p.default}'`,
    );
  }
  for (const p of bools) destructured.push(`${p.bindings.code.prop} = ${p.default === true}`);
  for (const p of numberProps(contract)) {
    destructured.push(`${p.bindings.code.prop} = ${typeof p.default === 'number' ? p.default : 0}`);
  }
  for (const p of texts) {
    destructured.push(
      p.required || p.default === undefined
        ? p.bindings.code.prop
        : `${p.bindings.code.prop} = '${p.default}'`,
    );
  }
  for (const p of richTexts) {
    destructured.push(
      p.required || p.default === undefined
        ? p.bindings.code.prop
        : `${p.bindings.code.prop} = ${JSON.stringify(p.default)}`,
    );
  }
  // v7 arrayOf props: no default destructure — undefined means "not
  // provided" (never a silent []). Pulled out so {...rest} cannot leak a
  // structured prop onto the DOM element.
  for (const p of arrayProps(contract)) destructured.push(p.bindings.code.prop);
  for (const { slot } of slots) destructured.push(slot.name);
  for (const ev of events) destructured.push(ev.bindings.code.prop);
  destructured.push('className', 'children', '...rest');

  // Body prelude: per-instance ARIA associations, uncontrolled state and
  // handlers for declared events. useId avoids duplicate ids when FAQ renders
  // several independently toggled rows.
  const prelude: string[] = [];
  for (const idVar of controlIdByPart.values()) prelude.push(`  const ${idVar} = useId();`);
  for (const ev of events) {
    if (!ev.toggles) continue;
    const prop = contract.props.find((p) => p.name === ev.toggles!.prop)!;
    const code = prop.bindings.code.prop;
    const union = (prop.type as { enum: string[] }).enum.map((v) => `'${v}'`).join(' | ');
    prelude.push(
      `  const [${code}Uncontrolled, set${pascal(code)}Uncontrolled] = useState<${union}>('${prop.default}');`,
      `  const ${code} = ${code}Prop ?? ${code}Uncontrolled;`,
    );
  }
  for (const ev of events) {
    const body: string[] = [];
    if (ev.toggles) {
      const prop = contract.props.find((p) => p.name === ev.toggles!.prop)!;
      const code = prop.bindings.code.prop;
      const [off, on] = ev.toggles.between;
      body.push(`set${pascal(code)}Uncontrolled(${code} === '${on}' ? '${off}' : '${on}');`);
    }
    body.push(`${ev.bindings.code.prop}?.();`);
    prelude.push(`  const handle${pascal(ev.name)} = () => { ${body.join(' ')} };`);
  }

  /** onClick + ARIA state for a part that is an event trigger. A NATIVE
   *  checkable trigger (input[type=checkbox|radio]) gets the platform's own
   *  channels instead: checked + onChange, and any out-of-pair toggle value
   *  (Checkbox "indeterminate") sets the DOM PROPERTY via a callback ref —
   *  never a fake attribute, never aria-checked on a native input. */
  const eventAttrsFor = (partName: string, part: Part | undefined, partEl: string): string => {
    const ev = events.find((e) => e.trigger === partName);
    if (!ev) return '';
    if (part && isNativeCheckablePart(part)) {
      let s = '';
      if (ev.toggles) {
        const prop = contract.props.find((p) => p.name === ev.toggles!.prop)!;
        const code = prop.bindings.code.prop;
        const [off, on] = ev.toggles.between;
        const others = (prop.type as { enum: string[] }).enum.filter((v) => v !== off && v !== on);
        s += ` checked={${code} === '${on}'}`;
        if (others.length > 0) {
          const cond = others.map((v) => `${code} === '${v}'`).join(' || ');
          s += ` ref={(el) => { if (el) el.indeterminate = ${cond}; }}`;
        }
      }
      s += ` onChange={handle${pascal(ev.name)}}`;
      return s;
    }
    let s = partEl === 'button' ? ' type="button"' : '';
    s += ` onClick={handle${pascal(ev.name)}}`;
    if (ev.toggles?.aria) {
      const prop = contract.props.find((p) => p.name === ev.toggles!.prop)!;
      const code = prop.bindings.code.prop;
      const [off, on] = ev.toggles.between;
      const others = (prop.type as { enum: string[] }).enum.filter((v) => v !== off && v !== on);
      s += others.length
        ? ` aria-${ev.toggles.aria}={${code} === '${on}' ? true : ${code} === '${off}' ? false : 'mixed'}`
        : ` aria-${ev.toggles.aria}={${code} === '${on}'}`;
    }
    if (ev.toggles?.controls) {
      s += ` aria-controls={${controlIdByPart.get(ev.toggles.controls)}}`;
    }
    return s;
  };

  /** A native checkable input (checkbox/radio) that no event drives still
   *  reflects its contract state: wire `defaultChecked` from the binary enum
   *  prop bound to the control's VARIANT (the default value is unchecked, the
   *  other is checked). Uncontrolled (defaultChecked, no onChange required) so
   *  the real DOM checked state matches the drawn box — never a visual-only
   *  fake. Event-driven checkables keep the controlled `checked` path
   *  (eventAttrsFor); this only fills the no-event case (Piqueray declares no
   *  events). */
  const nativeCheckedAttr = (partName: string, part: Part): string => {
    if (!isNativeCheckablePart(part)) return '';
    if (events.some((e) => e.trigger === partName)) return '';
    const enumProp = contract.props.find(
      (p) => isEnum(p) && p.bindings.figma.kind === 'VARIANT' && (p.type as { enum: string[] }).enum.length === 2,
    );
    if (!enumProp) return '';
    const values = (enumProp.type as { enum: string[] }).enum;
    const onValue = values.find((v) => v !== enumProp.default) ?? values[1];
    return ` defaultChecked={${enumProp.bindings.code.prop} === '${onValue}'}`;
  };

  const classParts = [
    'styles.root',
    ...enums.map((p) => `styles[\`${p.name}-\${${p.bindings.code.prop}}\`]`),
    'className',
  ];

  const nativeDisabled = meta.supportsDisabled && bools.some((p) => p.name === 'disabled');
  const elementAttrs: string[] = ['ref={ref}', 'className={classes}'];
  if (
    !elementByProp &&
    contract.semantics.element === 'button' &&
    contract.anatomy.root?.attrs?.type === undefined
  ) {
    elementAttrs.push('type="button"');
  }
  if (nativeDisabled) elementAttrs.push('disabled={disabled}');
  for (const p of bools) {
    if (p.name === 'disabled' && nativeDisabled) continue;
    // data-* attributes must be lowercase — kebab-case the prop name
    // (camelCase data attrs trigger React DOM warnings).
    const dataName = p.name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    elementAttrs.push(`data-${dataName}={${p.bindings.code.prop} || undefined}`);
  }
  const roleByProp = contract.semantics.roleByProp;
  let roleMapConst = '';
  if (roleByProp) {
    roleMapConst = `const ROLE_MAP: Record<string, string> = ${JSON.stringify(roleByProp.map)};\n\n`;
    elementAttrs.push(`role={ROLE_MAP[${codePropOf(roleByProp.prop)}]}`);
  } else if (contract.semantics.role && contract.semantics.role !== contract.semantics.element) {
    elementAttrs.push(`role="${contract.semantics.role}"`);
  }
  // v7 elementByProp: mirror of ROLE_MAP — the rendered element follows the
  // enum prop, falling back to semantics.element (validated: the map covers
  // every enum value, so the fallback only guards unexpected runtime input).
  let elementMapConst = '';
  if (elementByProp) {
    elementMapConst = `const ELEMENT_MAP: Record<string, ElementType> = ${JSON.stringify(elementByProp.map)};\n\n`;
  }
  const rootEvent = events.find((e) => e.trigger === 'root');
  if (rootEvent) {
    elementAttrs.push(`onClick={handle${pascal(rootEvent.name)}}`);
  }
  elementAttrs.push('{...rest}');

  // SVG assets this contract needs (icons plus arbitrary governed vectors).
  const neededIcons = new Map<string, string>();
  for (const { part } of walkAnatomy(contract)) {
    if (part.vectorAsset) neededIcons.set(part.vectorAsset.asset, iconAssets.get(part.vectorAsset.asset) ?? '');
    if (!part.icon) continue;
    const m = part.icon.asset.match(/^\{([a-z][\w-]*)\}$/);
    if (m) {
      const enumProp = contract.props.find((p) => p.name === m[1]);
      if (enumProp && isEnum(enumProp)) {
        for (const v of enumProp.type.enum) neededIcons.set(v, iconAssets.get(v) ?? '');
      }
    } else {
      neededIcons.set(part.icon.asset, iconAssets.get(part.icon.asset) ?? '');
    }
  }
  const iconsConst =
    neededIcons.size > 0
      ? `const ICONS: Record<string, string> = {\n${[...neededIcons.entries()]
          .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
          .join('\n')}\n};\n\n`
      : '';

  // CSS-module class access for a part name. Promoted anatomies carry
  // hyphenated part names (round 4: "label-2", "icon-3-incomplete") — dot
  // access on those parses as SUBTRACTION (styles.label-2 → styles.label - 2,
  // NaN class names / ReferenceErrors at runtime; found by the CI journey
  // validation, examples/ci/VALIDATION.md). Non-identifier names use bracket
  // access; identifier names keep the dot spelling byte-for-byte.
  const JS_IDENT_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
  const stylesRef = (cls: string): string =>
    JS_IDENT_RE.test(cls) ? `styles.${cls}` : `styles[${JSON.stringify(cls)}]`;

  const NUMERIC_ATTRS = new Set(['rows', 'cols', 'tabIndex', 'colSpan', 'rowSpan']);
  const NUMERIC_ATTR_VALUE = /^-?\d+(?:\.\d+)?$/;
  const isNumericAttrValue = (attr: string, value: string): boolean =>
    NUMERIC_ATTRS.has(attr) && NUMERIC_ATTR_VALUE.test(value);
  const attrValueExpression = (attr: string, value: string): string => {
    const ref = value.match(/^\{([a-z][\w-]*)\}$/);
    if (ref) {
      const code = codePropOf(ref[1]);
      // React numeric DOM attributes must remain numbers rather than their
      // serialized HTML representation. This also keeps {prop} mappings
      // assignable when the referenced prop is textual.
      return NUMERIC_ATTRS.has(attr) ? `Number(${code})` : `String(${code})`;
    }
    return isNumericAttrValue(attr, value) ? value : JSON.stringify(value);
  };
  const controlIdAttrFor = (partName: string): string => {
    const idVar = controlIdByPart.get(partName);
    return idVar ? ` id={${idVar}}` : '';
  };

  const partAttrString = (part: Part): string =>
    Object.entries(part.attrs ?? {})
      .map(([attr, value]) => {
        const isExpression = /^\{([a-z][\w-]*)\}$/.test(value) || isNumericAttrValue(attr, value);
        const expression = attrValueExpression(attr, value);
        return isExpression ? ` ${attr}={${expression}}` : ` ${attr}=${expression}`;
      })
      .join('');

  const attrsByPropString = (part: Part): string => {
    const entries = part.attrsByProp
      ? (Array.isArray(part.attrsByProp) ? part.attrsByProp : [part.attrsByProp])
      : [];
    return entries
      .map((entry) => {
        const map = Object.entries(entry.map)
          .map(([selector, attrs]) => {
            const values = Object.entries(attrs)
              .map(([attr, value]) => {
                return `${JSON.stringify(attr)}: ${attrValueExpression(attr, value)}`;
              })
              .join(', ');
            return `${JSON.stringify(selector)}: { ${values} }`;
          })
          .join(', ');
        const selector = codePropOf(entry.prop);
        const selectorProp = contract.props.find((p) => p.name === entry.prop);
        // Keep map values literal (`"false"` is React's Booleanish value,
        // `-1` is a numeric tabIndex) instead of widening them to string.
        // The runtime fallback deliberately permits a sparse selector map.
        const keyType = Object.keys(entry.map).map((value) => JSON.stringify(value)).join(' | ') || 'never';
        const key = selectorProp?.type === 'boolean'
          ? `String(${selector}) as ${keyType}`
          : `${selector} as ${keyType}`;
        return ` {...(({ ${map} } as const)[${key}] ?? {})}`;
      })
      .join('');
  };
  const renderedPartAttrs = (part: Part): string => partAttrString(part) + attrsByPropString(part);

  const slotControlValueByPart = new Map<string, string>();
  const controlledSlots = walkAnatomy(contract).filter((w) => w.part.slot?.control);
  const cssStyleKey = (property: string): string => property.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
  const cssStyleValue = (value: string): string => {
    const token = value.match(/^\{([^}]+)\}$/);
    return token ? JSON.stringify(cssVar(token[1])) : JSON.stringify(value);
  };
  for (const [index, { name: partName, part }] of controlledSlots.entries()) {
    const slot = part.slot!;
    const source = slot.name === 'children' ? 'children' : slot.name;
    const forwarded = `slotControl${index}`;
    const attrs = Object.entries(slot.control!.attributes ?? {})
      .map(([attr, declaration]) => {
        const code = codePropOf(declaration.prop);
        const selected = Object.entries(declaration.values).reduceRight(
          (fallback, [value, resolved]) =>
            `${code} === ${JSON.stringify(value)} ? ${resolved === null ? 'undefined' : JSON.stringify(resolved)} : ${fallback}`,
          'undefined',
        );
        return `${JSON.stringify(attr)}: ${selected}`;
      });
    const styles = [`...((${source}.props.style as Record<string, unknown> | undefined) ?? {})`];
    if (slot.control!.fill === 'width') styles.push(`width: '100%'`);
    for (const [property, declaration] of Object.entries(slot.control!.styles ?? {})) {
      const code = codePropOf(declaration.prop);
      const selected = Object.entries(declaration.values).reduceRight(
        (fallback, [value, resolved]) =>
          `${code} === ${JSON.stringify(value)} ? ${resolved === null ? 'undefined' : cssStyleValue(resolved)} : ${fallback}`,
        'undefined',
      );
      styles.push(`${JSON.stringify(cssStyleKey(property))}: ${selected}`);
      // Governed borders render through the non-layout-affecting inset
      // border plan. Mirror a forwarded border color onto its custom
      // property so a Field can color the *actual* slotted Input border
      // without knowing or restyling the Input's anatomy.
      if (property === 'border-color') styles.push(`"--dsc-border-color": ${selected}`);
    }
    if (styles.length > 1) attrs.push(`style: { ${styles.join(', ')} }`);
    prelude.push(
      `  const ${forwarded} = isValidElement<Record<string, unknown>>(${source}) ? cloneElement(${source}, { ${attrs.join(', ')} }) : ${source};`,
    );
    slotControlValueByPart.set(partName, forwarded);
  }
  const restIndex = elementAttrs.indexOf('{...rest}');
  // A multi-root composite deliberately has no synthetic `root` entry.
  // Its top-level parts carry their own attrs when rendered below; only the
  // single-root wrapper receives root attrs in `elementAttrs`.
  if (contract.anatomy.root) {
    elementAttrs.splice(restIndex, 0, renderedPartAttrs(contract.anatomy.root));
  }

  const wrapPresence = (part: Part, jsx: string): string => {
    if (part.visibleWhen) {
      const codeName = codePropOf(part.visibleWhen.prop);
      const cond = part.visibleWhen.equals !== undefined ? `${codeName} === '${part.visibleWhen.equals}'` : codeName;
      return `{${cond} ? (${jsx}) : null}`;
    }
    if (part.hiddenWhen) {
      const codeName = codePropOf(part.hiddenWhen.prop);
      return `{${codeName} !== '${part.hiddenWhen.equals}' ? (${jsx}) : null}`;
    }
    return jsx;
  };

  // Recursive JSX for the anatomy tree.
  const renderPart = (partName: string, part: Part): string => {
    if (part.vectorAsset) {
      const glyph = `dangerouslySetInnerHTML={{ __html: ICONS[${JSON.stringify(part.vectorAsset.asset)}] }}`;
      return wrapPresence(part, `<span className={${stylesRef(partName)}} aria-hidden="true" ${glyph} />`);
    }
    if (part.icon) {
      const ref = part.icon.asset.match(/^\{([a-z][\w-]*)\}$/);
      const keyExpr = ref ? codePropOf(ref[1]) : JSON.stringify(part.icon.asset);
      const glyph = `dangerouslySetInnerHTML={{ __html: ICONS[${keyExpr}] }}`;
      // A bare icon is decorative (aria-hidden). Authored attrs on that same
      // wrapper (for example aria-label on an icon-only control) make it the
      // semantic carrier without inventing a second DOM/Figma anatomy node.
      // An explicit element keeps the existing nested-glyph form so its own
      // semantics/events remain isolated from the decorative SVG.
      const hasAttrs = Object.keys(part.attrs ?? {}).length > 0 || part.attrsByProp !== undefined;
      const node = part.element
        ? `<${part.element} className={${stylesRef(partName)}}${renderedPartAttrs(part)}${eventAttrsFor(partName, part, part.element)}><span aria-hidden="true" className={${stylesRef(`${partName}Glyph`)}} ${glyph} /></${part.element}>`
        : hasAttrs
          ? `<span className={${stylesRef(partName)}}${renderedPartAttrs(part)} ${glyph} />`
          : `<span className={${stylesRef(partName)}} aria-hidden="true" ${glyph} />`;
      return wrapPresence(part, node);
    }
    if (part.repeat && part.component) {
      // v12 repeat (P9): the item template maps the live arrayOf prop — one
      // child instance per record, fields bound by name through the child's
      // code bindings (a text field whose child code prop is `children`
      // renders as JSX children). `undefined` renders nothing — the arrayOf
      // discipline (never a silent []); the static surfaces render the
      // contract's observed `sample` instead.
      const dep = byId.get(part.component.id)!;
      const rp = contract.props.find((p) => p.name === part.repeat!.itemsProp)!;
      const codeName = rp.bindings.code.prop;
      const fixedAttrs = depAttrString(dep, part.component.props ?? {}, contract);
      let childrenField: string | null = null;
      let childrenExpr: string | null = null;
      const fieldAttrs = (isArrayType(rp) ? Object.keys(rp.type.arrayOf) : [])
        .map((field) => {
          const depProp = dep.props.find((p) => p.name === field)!;
          if (depProp.bindings.code.prop === 'children') {
            childrenField = field;
            childrenExpr = isRichText(depProp)
              ? `[{ text: item.${field} }]`
              : `item.${field}`;
            return '';
          }
          if (isRichText(depProp)) {
            return ` ${depProp.bindings.code.prop}={[{ text: item.${field} }]}`;
          }
          return ` ${depProp.bindings.code.prop}={item.${field}}`;
        })
        .join('');
      const node = childrenField && childrenExpr
        ? `<${dep.name} key={index}${fixedAttrs}${fieldAttrs}>{${childrenExpr}}</${dep.name}>`
        : `<${dep.name} key={index}${fixedAttrs}${fieldAttrs} />`;
      return wrapPresence(part, `{${codeName}?.map((item, index) => (${node}))}`);
    }
    if (part.component) {
      const dep = byId.get(part.component.id)!;
      const fixedProps = part.component.props ?? {};
      const mappedChildren = componentChildrenJsx(dep, fixedProps, contract);
      // v20 (016): component.slots.children — the contract says what the
      // child's slot holds, so BOTH surfaces regenerate it (Figma: the
      // INSTANCE_SWAP; here: the JSX children). Validation already restricted
      // slots to `children` (named limit).
      const slotItem = part.component.slots?.['children'];
      const slotJsx = slotItem
        ? (() => {
            const slotDep = byId.get(slotItem.id)!;
            const slotAttrs = depAttrString(slotDep, slotItem.props ?? {}, contract);
            return slotItem.text !== undefined
              ? `<${slotDep.name}${slotAttrs}>${slotItem.text}</${slotDep.name}>`
              : `<${slotDep.name}${slotAttrs} />`;
          })()
        : undefined;
      const attrs = depAttrString(dep, fixedProps, contract, mappedChildren !== undefined || slotJsx !== undefined);
      const depChildren = textProps(dep).find((p) => p.bindings.code.prop === 'children');
      const text = slotJsx ?? mappedChildren ?? part.component.text ?? (typeof depChildren?.default === 'string' ? depChildren.default : undefined);
      const node = text !== undefined
        ? `<${dep.name}${attrs}>${text}</${dep.name}>`
        : `<${dep.name}${attrs} />`;
      return wrapPresence(part, node);
    }
    if (part.slot) {
      const el = part.element ?? 'div';
      const expr = part.slot.name === 'children' ? 'children' : part.slot.name;
      const value = slotControlValueByPart.get(partName) ?? expr;
      const node = `<${el} className={${stylesRef(partName)}}${controlIdAttrFor(partName)}${renderedPartAttrs(part)}>{${value}}</${el}>`;
      return part.optional ? `{${expr} != null ? ${node} : null}` : wrapPresence(part, node);
    }
    if (part.content) {
      const el = part.element ?? 'span';
      const prop = contract.props.find(
        (p) =>
          (p.type === 'text' || p.type === 'rich-text') &&
          p.bindings.code.prop === part.content!.prop,
      )!;
      // A native <select> shows one of its <option> children, never a raw text
      // node — the shown value is the (placeholder) selected option. The
      // consumer/Field molecule supplies the real options.
      const inner =
        prop.type === 'rich-text'
          ? `{${prop.bindings.code.prop}.map((segment, index) => segment.strong ? <strong key={index}>{segment.text}</strong> : <span key={index}>{segment.text}</span>)}`
          : el === 'select'
          ? `<option>{${prop.bindings.code.prop}}</option>`
          : `{${prop.bindings.code.prop}}`;
      return wrapPresence(
        part,
        `<${el} className={${stylesRef(partName)}}${controlIdAttrFor(partName)}${renderedPartAttrs(part)}${eventAttrsFor(partName, part, el)}>${inner}</${el}>`,
      );
    }
    if (part.text !== undefined) {
      const el = part.element ?? 'span';
      // A "\n" in the literal must reach the DOM: raw JSX children collapse
      // newlines at COMPILE time, so multi-paragraph text is emitted as a
      // string EXPRESSION — the one spelling JSX cannot reflow. v19 segments
      // ride the same spelling per range, so a "\n" INSIDE one survives too.
      const literal = part.textSegments
        ? literalSegmentsJsx(part.textSegments)
        : HAS_LINE_SEPARATOR.test(part.text)
          ? `{${JSON.stringify(normalizeLineSeparators(part.text))}}`
          : part.text;
      return wrapPresence(
        part,
        `<${el} className={${stylesRef(partName)}}${controlIdAttrFor(partName)}${renderedPartAttrs(part)}>${literal}</${el}>`,
      );
    }
    if (part.meter) {
      const v = codePropOf(part.meter.valueProp);
      const m = codePropOf(part.meter.maxProp);
      return wrapPresence(
        part,
        `<div className={${stylesRef(partName)}} style={{ width: \`\${Math.min(100, Math.max(0, (${v} / ${m}) * 100))}%\` }} />`,
      );
    }
    const el = part.element ?? 'div';
    const inner = Object.entries(part.parts ?? {})
      .map(([childName, child]) => renderPart(childName, child))
      .join('\n');
    return wrapPresence(
      part,
      `<${el} className={${stylesRef(partName)}}${controlIdAttrFor(partName)}${renderedPartAttrs(part)}${nativeCheckedAttr(partName, part)}${eventAttrsFor(partName, part, el)}>\n${inner}\n</${el}>`,
    );
  };

  // MULTI-ROOT composite (advanced composition). A captured composite (Modal =
  // {dialog, backdrop}) has >1 top-level root. Per-surface decision (see the
  // module header of generate-components): the roots render as SIBLINGS inside
  // a Fragment — NO synthetic wrapper (a Modal's backdrop and dialog are
  // position-driven siblings, exactly as the real component portals them). The
  // single-root path below is the N=1 case and is left byte-for-byte untouched.
  if (isMultiRoot(contract)) {
    const rootsJsx = topRoots(contract)
      .map(([n, p]) => renderPart(n, p))
      .join('\n      ');
    const mrTypeImports = [meta.attrs, ...(slots.length > 0 ? ['ReactNode'] : [])].join(', ');
    const mrDepImports = deps.map((depName) => `import { ${depName} } from '../${depName}';`).join('\n');
    return `/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/${contract.id.replace(/^[^.]+\./, '')}.contract.json (${contract.id} v${contract.version})
 * Regenerate with: npm run generate
 *
 * MULTI-ROOT composite — the anatomy declares ${topRoots(contract).length} top-level roots
 * (${topRoots(contract).map(([n]) => n).join(', ')}). They render as SIBLINGS in a
 * Fragment; there is no single wrapping element (a Modal's backdrop + dialog
 * are position-driven siblings). Each root's class is styles.<rootName>.
 */
import type { ${mrTypeImports} } from 'react';
${mrDepImports}${mrDepImports ? '\n' : ''}import styles from './${name}.module.css';

${iconsConst}export interface ${name}Props extends ${meta.attrs}<${meta.el}> {
${propLines.join('\n')}
}

/** ${contract.description} */
export function ${name}({ ${destructured.join(', ')} }: ${name}Props) {
  return (
    <>
      ${rootsJsx}
    </>
  );
}
`;
  }

  const root = contract.anatomy.root;
  const rootElement = contract.semantics.element;
  // A native text control (`<input>`, `<textarea>`) cannot host its value as a
  // child text node: the canvas draws that text child, but code renders the
  // value through the native `defaultValue` attribute on a self-closing element.
  // Wire the single text prop through — the same prop the canvas text child
  // binds to (Bouton ↔ Button: the label is `children`; a bare input's is its
  // own `value`). No text prop (e.g. a checkbox) → nothing to wire.
  const isNativeTextControl = NATIVE_TEXT_CONTROLS.has(rootElement);
  const isSelfClosingRoot = VOID_ELEMENTS.has(rootElement) || isNativeTextControl;
  if (isNativeTextControl) {
    const valueProp = textProps(contract)[0];
    if (valueProp) {
      const dv = `defaultValue={String(${valueProp.bindings.code.prop})}`;
      const restIdx = elementAttrs.indexOf('{...rest}');
      if (restIdx >= 0) elementAttrs.splice(restIdx, 0, dv);
      else elementAttrs.push(dv);
    }
  }
  const rootInner = root.parts
    ? Object.entries(root.parts)
        .map(([childName, child]) => renderPart(childName, child))
        .join('\n')
    : '{children}';

  const el = elementByProp ? 'Tag' : contract.semantics.element;
  if (elementByProp) {
    prelude.push(
      `  const Tag = ELEMENT_MAP[${codePropOf(elementByProp.prop)}] ?? '${contract.semantics.element}';`,
    );
  }
  const typeImports = [
    meta.attrs,
    ...(slots.length > 0 ? ['ReactNode'] : []),
    ...(elementByProp ? ['ElementType'] : []),
  ].join(', ');
  const depImports = deps
    .map((depName) => `import { ${depName} } from '../${depName}';`)
    .join('\n');

  return `/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/${contract.id.replace(/^[^.]+\./, '')}.contract.json (${contract.id} v${contract.version})
 * Regenerate with: npm run generate
 */
import { forwardRef${events.some((e) => e.toggles) ? ', useState' : ''}${controlIdByPart.size > 0 ? ', useId' : ''}${controlledSlots.length > 0 ? ', cloneElement, isValidElement' : ''} } from 'react';
import type { ${typeImports} } from 'react';
${depImports}${depImports ? '\n' : ''}import styles from './${name}.module.css';

${iconsConst}${roleMapConst}${elementMapConst}export interface ${name}Props extends ${meta.attrs}<${meta.el}> {
${propLines.join('\n')}
}

/** ${contract.description} */
export const ${name} = forwardRef<${meta.el}, ${name}Props>(function ${name}(
  { ${destructured.join(', ')} },
  ref,
) {
${prelude.length > 0 ? prelude.join('\n') + '\n' : ''}  const classes = [${classParts.join(', ')}].filter(Boolean).join(' ');
  return (
    ${isSelfClosingRoot ? `<${el} ${elementAttrs.join(' ')} />` : `<${el} ${elementAttrs.join(' ')}>\n      ${rootInner}\n    </${el}>`}
  );
});
`;
}

// ---------------------------------------------------------------------------
// Stories (.stories.tsx) generation
// ---------------------------------------------------------------------------

export function generateStories(contract: Contract, byId: Map<string, Contract>): string {
  const name = contract.name;
  // v17 (spec 004): the Storybook group mirrors the contract's category via the
  // single label source; a contract without one keeps the pre-004 'Components/'
  // group (tolerant fallback, FR-013).
  const group = contract.category ? CATEGORY_LABELS[contract.category] : 'Components';
  const enums = enumProps(contract);
  const bools = boolProps(contract);
  const slots = namedSlots(contract);
  const hasDefaultSlot = slotsOf(contract).some((s) => s.slot.name === 'children');
  const label = textDefault(contract);

  const storyEvents = contract.events ?? [];
  const toggledPropNames = new Set(storyEvents.filter((e) => e.toggles).map((e) => e.toggles!.prop));

  const argTypes: string[] = [];
  const args: string[] = [];
  for (const p of contract.props) {
    const codeName = p.bindings.code.prop;
    const desc = p.description ? `, description: '${p.description.replace(/'/g, "\\'")}'` : '';
    if (isEnum(p)) {
      argTypes.push(
        `    ${codeName}: { control: 'select', options: [${p.type.enum.map((v) => `'${v}'`).join(', ')}]${desc} },`,
      );
      // Toggled props get NO default arg: undefined = uncontrolled, so the
      // component is actually interactive in the Playground. Setting the
      // control switches it to controlled — the standard React pattern.
      if (p.default !== undefined && !toggledPropNames.has(p.name)) {
        args.push(`    ${codeName}: '${p.default}',`);
      }
    } else if (isArrayType(p)) {
      argTypes.push(`    ${codeName}: { control: false${desc} },`);
      // v12 repeat (P9): a collection's story renders the contract's OBSERVED
      // sample as the array arg — the same honest static state the canvas
      // and static surfaces render.
      const repeatPart = walkAnatomy(contract).find((w) => w.part.repeat?.itemsProp === p.name);
      if (repeatPart) {
        args.push(`    ${codeName}: ${JSON.stringify(repeatPart.part.repeat!.sample)},`);
      }
    } else if (isRichText(p)) {
      argTypes.push(`    ${codeName}: { control: false${desc} },`);
      if (Array.isArray(p.default)) {
        args.push(`    ${codeName}: ${JSON.stringify(p.default)},`);
      }
    } else if (p.type === 'boolean') {
      argTypes.push(`    ${codeName}: { control: 'boolean'${desc} },`);
      args.push(`    ${codeName}: ${p.default === true},`);
    } else if (p.type === 'number') {
      argTypes.push(`    ${codeName}: { control: { type: 'number' }${desc} },`);
      if (typeof p.default === 'number') args.push(`    ${codeName}: ${p.default},`);
    } else {
      argTypes.push(`    ${codeName}: { control: 'text'${desc} },`);
      if (typeof p.default === 'string') args.push(`    ${codeName}: '${p.default}',`);
      else if (p.required && p.bindings.figma.kind === 'NONE') {
        // Code-only required scalars have no canvas default by definition.
        // Give Storybook a concrete sample without manufacturing a runtime
        // default in the component.
        args.push(`    ${codeName}: ${JSON.stringify(codeOnlyRequiredTextSample(p))},`);
      }
    }
  }
  for (const { slot } of slots) {
    argTypes.push(`    ${slot.name}: { control: false },`);
  }
  for (const ev of storyEvents) {
    const evDesc = (ev.description ?? `Fires when the ${ev.trigger} is activated.`).replace(/'/g, "\\'");
    argTypes.push(`    ${ev.bindings.code.prop}: { control: false, description: '${evDesc}' },`);
  }
  const defaultSlot = slotsOf(contract).find((s) => s.slot.name === 'children');
  const defaultSample =
    defaultSlot && (defaultSlot.slot.defaultContent?.length ?? 0) > 0
      ? sampleJSX(defaultSlot.slot.defaultContent!, byId)
      : null;
  if (hasDefaultSlot && !defaultSample) {
    argTypes.push(`    children: { control: 'text' },`);
    args.push(`    children: 'The quick brown fox jumps over the lazy dog.',`);
  }
  if (defaultSample) {
    argTypes.push(`    children: { control: false },`);
  }

  const variantStories =
    enums.length > 0
      ? enums[0].type.enum
          .map((v) => {
            // A story named after the component itself collides with its import.
            const safe = v.replace(/[^a-zA-Z0-9]+([a-zA-Z0-9])/g, (_, c: string) => c.toUpperCase()).replace(/[^a-zA-Z0-9]/g, '');
            let storyName = pascal(safe) === name ? `${pascal(safe)}Variant` : pascal(safe);
            // Values that don't start with a letter (Heading level "1") are
            // not legal identifiers — prefix the axis name (Level1).
            if (!/^[A-Za-z_]/.test(storyName)) storyName = `${pascal(enums[0].name)}${storyName}`;
            return `
export const ${storyName}: Story = {
  args: { ${enums[0].bindings.code.prop}: '${v}' },
};`;
          })
          .join('\n')
      : '';

  // One story per constrained named slot, filled with the slot's
  // defaultContent when declared, else a sample of the first accepted contract.
  const slotSampleImports = new Set<string>();
  if (defaultSample) {
    for (const n of sampleDeps(defaultSlot!.slot.defaultContent!, byId)) slotSampleImports.add(n);
  }
  let slotStories = '';
  for (const { slot } of slots) {
    let sample: string;
    if ((slot.defaultContent?.length ?? 0) > 0) {
      sample = `<>${sampleJSX(slot.defaultContent!, byId)}</>`;
      for (const n of sampleDeps(slot.defaultContent!, byId)) slotSampleImports.add(n);
    } else {
      const acceptedId = slot.accepts?.[0];
      if (!acceptedId) continue;
      const dep = byId.get(acceptedId)!;
      slotSampleImports.add(dep.name);
      const requiredAttrs = dep.props
        .filter((p) => p.type === 'text' && p.required && p.bindings.code.prop !== 'children')
        .map((p) => {
          const value = typeof p.default === 'string' ? p.default : codeOnlyRequiredTextSample(p);
          return ` ${p.bindings.code.prop}=${JSON.stringify(value)}`;
        })
        .join('');
      const hasChildren = dep.props.some((p) => p.type === 'text' && p.bindings.code.prop === 'children');
      sample = hasChildren
        ? `<${dep.name}${requiredAttrs}>${textDefault(dep)}</${dep.name}>`
        : `<${dep.name}${requiredAttrs} />`;
    }
    slotStories += `
/** The "${slot.name}" slot accepts: ${(slot.accepts ?? []).join(', ') || 'anything'}. */
export const With${pascal(slot.name)}: Story = {
  render: (args) => (
    <${name} {...args} ${slot.name}={${sample}} />
  ),
};`;
  }

  // A shared render fills the default slot with its declared sample content
  // for every args-only story (Playground, per-variant, Disabled), and is keyed
  // on args so the Playground REMOUNTS on any control change. Native-form-control
  // atoms are uncontrolled (native defaultValue/defaultChecked — their masters
  // declare no event), so without a remount a changed value/checked control would
  // re-render but never update the mounted DOM (defaultValue is read once at
  // mount). Keying forces a fresh mount, so the controls actually drive the
  // canvas — matching the Contract Hub playground. Harmless for controlled props
  // (Button's label re-renders either way); functions in args (action spies) are
  // dropped by JSON.stringify, so only real value changes re-key.
  const metaRender = defaultSample
    ? `
  render: (args) => (
    <${name} key={JSON.stringify(args)} {...args}>
      ${defaultSample.split('\n').join('\n      ')}
    </${name}>
  ),`
    : `
  render: (args) => <${name} key={JSON.stringify(args)} {...args} />,`;

  let matrixStory = '';
  if (enums.length > 0 && !defaultSample) {
    // N-axis matrix: rows = the first enum axis; columns = the ordered
    // cartesian product of every remaining axis (matches the canvas grid).
    const rowProp = enums[0];
    const colAxes = enums.slice(1);
    let colCombos: string[][] = [[]];
    for (const axis of colAxes) {
      const next: string[][] = [];
      for (const combo of colCombos) {
        for (const v of axis.type.enum) next.push([...combo, v]);
      }
      colCombos = next;
    }
    // Required text props must appear in every cell or the story won't
    // typecheck. Children-bound text props are excluded — they arrive as JSX
    // children below (a `children` attribute would duplicate them). Required
    // code-only identities get an example value here, never a contract default.
    const requiredTextAttrs = contract.props
      .filter((p) => p.type === 'text' && p.required && p.bindings.code.prop !== 'children')
      .map((p) => {
        const value = typeof p.default === 'string' ? p.default : codeOnlyRequiredTextSample(p);
        return `${p.bindings.code.prop}=${JSON.stringify(value)}`;
      });
    const cells: string[] = [];
    for (const row of rowProp.type.enum) {
      const rowCells = colCombos
        .map((combo) => {
          const attrs = [
            `${rowProp.bindings.code.prop}="${row}"`,
            ...colAxes.map((axis, i) => `${axis.bindings.code.prop}="${combo[i]}"`),
            ...requiredTextAttrs,
          ].join(' ');
          // Children arrive via a slot OR a children-bound text prop
          // (Button's label) — either way the matrix cell needs content,
          // or every cell renders as an empty pill.
          return hasDefaultSlot || textProps(contract).some((p) => p.bindings.code.prop === 'children')
            ? `        <${name} ${attrs}>${label}</${name}>`
            : `        <${name} ${attrs} />`;
        })
        .join('\n');
      cells.push(rowCells);
    }
    const columns = colCombos.length;
    matrixStory = `
/** Every legal combination the contract defines${colAxes.length > 0 ? ` (${enums.map((e) => e.name).join(' × ')})` : ''}. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(${columns}, max-content)',
        alignItems: 'center',
        justifyItems: 'start',
      }}
    >
${cells.join('\n')}
    </div>
  ),
};`;
  }

  const disabledStory = bools.some((p) => p.name === 'disabled')
    ? `
export const Disabled: Story = {
  args: { disabled: true },
};`
    : '';

  // One story revealing every templated-icon part at once (icon.asset
  // "{prop}" gated by visibleWhen) — the Matrix story only varies WHICH
  // glyph an enum picks, never the guarding boolean, so a governed-icon
  // component's Matrix renders icons hidden in every cell (002-governed-
  // icons-button finding). Generic: keys off the anatomy shape, not any
  // component-specific name — booleans forced true, enums render their own
  // defaults (FR-020: an example with icons visible, no hand-authored fixture).
  const gatedIconBools = new Set<string>();
  for (const { part } of walkAnatomy(contract)) {
    if (!part.icon || !part.visibleWhen || !/^\{[a-z][\w-]*\}$/.test(part.icon.asset)) continue;
    const gate = contract.props.find((p) => p.name === part.visibleWhen!.prop);
    if (gate?.type === 'boolean') gatedIconBools.add(part.visibleWhen.prop);
  }
  const withIconsStory =
    gatedIconBools.size > 0
      ? `
export const WithIcons: Story = {
  args: { ${[...gatedIconBools].map((p) => `${p}: true`).join(', ')} },
};`
      : '';

  const sampleImports = [...slotSampleImports]
    .map((depName) => `import { ${depName} } from '../${depName}';`)
    .join('\n');

  return `/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/${contract.id.replace(/^[^.]+\./, '')}.contract.json (${contract.id} v${contract.version})
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
${sampleImports}${sampleImports ? '\n' : ''}import { ${name} } from './${name}';

const meta = {
  title: '${group}/${name}',
  component: ${name},
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: ${JSON.stringify(contract.description)} } },
  },${metaRender}
  argTypes: {
${argTypes.join('\n')}
  },
  args: {
${args.join('\n')}
  },
} satisfies Meta<typeof ${name}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
${variantStories}${disabledStory}${withIconsStory}${slotStories}${matrixStory}
`;
}

// ---------------------------------------------------------------------------
// emitReact — the one-call surface a playground uses
// ---------------------------------------------------------------------------

/** Everything emission needs beyond the contract itself — data only, no
 *  paths: the token inventory, the icon assets, and the resolved contract
 *  set (for composition refs and slot samples). */
export interface EmitCtx {
  /** Token inventory paths (core/tokens.ts tokenInventoryFromJson). */
  tokens: Set<string>;
  /** Icon asset name → SVG markup (the repo's assets/icons/*.svg). */
  icons: Map<string, string>;
  /** Every known contract by id — composition refs resolve through it. */
  contracts: Map<string, Contract>;
}

export interface EmitReactResult {
  tsx: string;
  css: string;
  stories: string;
}

/** Contract → { tsx, css, stories }, UNFORMATTED (the CLI shell and the
 *  playground both run the same prettier/standalone pass — core/format.ts —
 *  so bytes match the shipped files). Throws with every named violation if
 *  the contract fails validation — invalid states are refused, not rendered. */
export function emitReact(contract: Contract, ctx: EmitCtx): EmitReactResult {
  const errors: string[] = [];
  validateContract(contract, ctx.contracts, errors, ctx.icons);
  const css = generateCss(contract, ctx.tokens, errors);
  if (errors.length > 0) {
    throw new Error(`Refused — ${errors.length} contract violation(s):\n${errors.map((e) => `  - ${e}`).join('\n')}`);
  }
  return {
    tsx: generateTsx(contract, ctx.contracts, ctx.icons),
    css,
    stories: generateStories(contract, ctx.contracts),
  };
}
