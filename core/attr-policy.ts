/**
 * The DOM-attribute policy of the code surfaces, in ONE place.
 *
 * Contracts spell attributes the React way (`htmlFor`, `autoComplete`,
 * `readOnly` — the demo-51 archive precedent). Three emitters turn them into
 * markup: `emit-react` and `emit-react-inline` into JSX, `emit-html` into
 * HTML. The three facts they share — which attributes are DOM booleans, which
 * ones mean "absent" when their bound value is empty, and how each React name
 * is spelled in HTML — are declared here and derived everywhere else.
 *
 * Receipt (031·21, 2026-09-08): the boolean / empty-means-absent policy was
 * first written as two literal Sets inside `emit-react` and two more, in HTML
 * spelling, inside `emit-html`. The third emitter never received it, so
 * `Input.inline.tsx` kept emitting `{"required": "required"}` and
 * `id={String(id)}` while `Input.tsx` emitted `required: true` and
 * `id={String(id) || undefined}` — one rule, two surfaces, one fixed. Same
 * shape as the `css-layout` receipt (spec 023, E1): a fact copied by hand into
 * N emitters is missed in one of them. This module removes that shape.
 */

/** React spelling → HTML spelling, for the attributes whose names differ. An
 *  attribute absent from this map is spelled the same way on both surfaces. */
export const HTML_ATTR_NAME: Record<string, string> = {
  htmlFor: 'for',
  autoComplete: 'autocomplete',
  tabIndex: 'tabindex',
  className: 'class',
  readOnly: 'readonly',
  maxLength: 'maxlength',
  autoFocus: 'autofocus',
  // Media (ds.hero-video 2.2.0): without the map `autoPlay="true"` would reach
  // the HTML surface as written, and the browser would ignore it.
  autoPlay: 'autoplay',
  playsInline: 'playsinline',
};

export const htmlAttrName = (reactName: string): string => HTML_ATTR_NAME[reactName] ?? reactName;

/** DOM boolean attributes (React spelling). They reach JSX as booleans —
 *  `required="required"` is a TS error, React's Booleanish value is `true` —
 *  and reach HTML bare (`required`, never `required="required"`). Media
 *  booleans are here too: ds.hero-video declares `muted`/`loop` as attrs. */
export const BOOLEAN_ATTRS: ReadonlySet<string> = new Set([
  'required', 'disabled', 'readOnly', 'checked', 'multiple', 'autoFocus', 'hidden',
  'muted', 'loop', 'autoPlay', 'playsInline', 'controls',
]);

/** Attributes for which an EMPTY bound value means "absent", never "empty"
 *  (React spelling): an id, a name, a label target or an ARIA reference to
 *  nothing — `aria-describedby=""` points a screen reader at nothing.
 *  Deliberately a closed list: `alt=""` is a meaningful value (decorative
 *  image) and must keep reaching the DOM as written. */
export const EMPTY_MEANS_ABSENT_ATTRS: ReadonlySet<string> = new Set([
  'id', 'name', 'htmlFor', 'placeholder', 'autoComplete',
  'aria-describedby', 'aria-labelledby', 'aria-controls',
]);

/** React numeric DOM attributes: they must remain numbers rather than their
 *  serialized HTML representation. */
export const NUMERIC_ATTRS: ReadonlySet<string> = new Set(['rows', 'cols', 'tabIndex', 'colSpan', 'rowSpan']);

/** The same two closed lists in HTML spelling, for `emit-html`. */
export const BOOLEAN_ATTRS_HTML: ReadonlySet<string> = new Set([...BOOLEAN_ATTRS].map(htmlAttrName));
export const EMPTY_MEANS_ABSENT_ATTRS_HTML: ReadonlySet<string> = new Set([...EMPTY_MEANS_ABSENT_ATTRS].map(htmlAttrName));

/** A `{prop}` reference — the only value shape an attribute can bind to. */
export const BOUND_ATTR_VALUE = /^\{([a-z][\w-]*)\}$/;
const NUMERIC_ATTR_VALUE = /^-?\d+(?:\.\d+)?$/;

export const isNumericAttrValue = (attr: string, value: string): boolean =>
  NUMERIC_ATTRS.has(attr) && NUMERIC_ATTR_VALUE.test(value);

/** True when the JSX attribute must be written `attr={expr}` rather than
 *  `attr="literal"`. */
export const isJsxAttrExpression = (attr: string, value: string): boolean =>
  BOUND_ATTR_VALUE.test(value) || isNumericAttrValue(attr, value) || BOOLEAN_ATTRS.has(attr);

/** The JSX expression (or string literal) for one contract attribute value,
 *  shared byte-for-byte by the two React emitters. `codePropOf` maps a bound
 *  prop name to the identifier the generated component reads it from. */
export const jsxAttrValueExpression = (
  attr: string,
  value: string,
  codePropOf: (prop: string) => string,
): string => {
  const ref = value.match(BOUND_ATTR_VALUE);
  if (ref) {
    const code = codePropOf(ref[1]);
    if (BOOLEAN_ATTRS.has(attr)) return `Boolean(${code})`;
    if (NUMERIC_ATTRS.has(attr)) return `Number(${code})`;
    // React drops `undefined`, so the attribute vanishes when the prop is empty.
    return EMPTY_MEANS_ABSENT_ATTRS.has(attr) ? `(String(${code}) || undefined)` : `String(${code})`;
  }
  if (BOOLEAN_ATTRS.has(attr)) return value === '' || value === 'false' ? 'false' : 'true';
  return isNumericAttrValue(attr, value) ? value : JSON.stringify(value);
};
