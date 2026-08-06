/**
 * Token build — DTCG token files → CSS custom properties. Zero dependencies.
 *
 * The token dialect in this repo is deliberately tiny (hex-string colors,
 * unit-string dimensions, single-level `{path.to.token}` aliases — see
 * docs/03-token-pipeline.md), so no token-build framework is needed.
 *
 * Four outputs, the first three mirroring the DTCG Resolver Module mental model:
 *   src/styles/tokens.css         :root                 (primitives + semantic + light)
 *   src/styles/tokens.dark.css    [data-theme="dark"]   (mode-varying tokens only)
 *   src/styles/tokens.brands.css  [data-brand="<name>"] (every non-default brand)
 *   specs/018-…/module/…/tokens.pqr.css   :root, PREFIXED (see "Fourth output")
 *
 * Aliases are preserved as var() references so the CSS reads like the token
 * architecture. Unresolvable aliases fail the build.
 *
 * ── Fourth output (spec 018) ───────────────────────────────────────────────
 * The same compiled map as :root, emitted with a `--pqr-` prefix into a
 * hand-written Odoo 19 module that lives under specs/. It exists because two
 * requirements cross: the module must carry NO invisible style value (so the
 * ~230 properties cannot be retyped by hand), and its variable names must not
 * be able to collide with the ones Odoo publishes (so the unprefixed sheet
 * cannot be reused as-is). Strictly additive: the three outputs above do not
 * move one byte. Proven by evals/run.ts `odoo-tokens-output` (C1), which
 * refuses seven invariants by name — including the adversarial one, that
 * moving a source value MUST move this output.
 *
 * Consequence, named so it is not rediscovered later: this pipeline now writes
 * into a spec folder. If specs/018-odoo-replique-manuelle/ is ever archived or
 * moved, `npm run tokens` does NOT fail — the recursive mkdirSync below simply
 * recreates the path and leaves an orphan directory behind. Whoever retires
 * that spec must delete this block too.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(p, 'utf8'));

/** Flatten a DTCG tree to Map<"dot.path", $value>. */
function flatten(tree, prefix = [], out = new Map()) {
  for (const [key, value] of Object.entries(tree)) {
    if (key.startsWith('$')) continue;
    if (value && typeof value === 'object') {
      if ('$value' in value) out.set([...prefix, key].join('.'), value.$value);
      else flatten(value, [...prefix, key], out);
    }
  }
  return out;
}

/** `prefix` is '' for the three repo outputs; the Odoo output passes 'pqr-'.
 *  Defaulting it empty is what keeps those three byte-identical. */
const cssName = (path, prefix = '') => `--${prefix}${path.split('.').join('-')}`;
const ALIAS = /^\{([^}]+)\}$/;

function cssValue(tokenPath, value, resolvable, prefix = '') {
  if (typeof value === 'string') {
    const alias = value.match(ALIAS);
    if (alias) {
      if (!resolvable.has(alias[1])) {
        throw new Error(`Token "${tokenPath}" references "{${alias[1]}}" which does not exist`);
      }
      return `var(${cssName(alias[1], prefix)})`;
    }
    return value;
  }
  return String(value);
}

function emit(selector, tokens, resolvable, prefix = '', note = null) {
  const lines = [
    '/**',
    ' * GENERATED FILE — DO NOT EDIT.',
    ' * Source of truth: tokens/*.tokens.json — regenerate with: npm run tokens',
    ...(note ? note.map((l) => (l ? ` * ${l}` : ' *')) : []),
    ' */',
    '',
    `${selector} {`,
  ];
  for (const [path, value] of tokens) {
    lines.push(`  ${cssName(path, prefix)}: ${cssValue(path, value, resolvable, prefix)};`);
  }
  lines.push('}', '');
  return lines.join('\n');
}

const primitives = flatten(read('tokens/primitives.tokens.json'));
const semantic = flatten(read('tokens/semantic.tokens.json'));
const light = flatten(read('tokens/modes/semantic.light.tokens.json'));
// Mono-theme (Piqueray): the dark-mode file is intentionally absent. A missing
// dark file is treated as an EMPTY mode, so the light/dark parity check below
// no-ops (dark.size === 0) and a single :root block is emitted.
const darkPath = 'tokens/modes/semantic.dark.tokens.json';
const dark = existsSync(darkPath) ? flatten(read(darkPath)) : new Map();

// Brand dimension — tokens/modes/brand.<name>.tokens.json, discovered
// dynamically so ADDING A BRAND IS A TOKEN-LAYER-ONLY OPERATION: no import
// sites, contracts, or components change. "default" is required and lands
// in :root; every other brand becomes a [data-brand="<name>"] override.
const brandFiles = readdirSync('tokens/modes')
  .filter((f) => /^brand\.[a-z][a-z0-9-]*\.tokens\.json$/.test(f))
  .sort();
const brands = new Map(
  brandFiles.map((f) => [f.replace(/^brand\.|\.tokens\.json$/g, ''), flatten(read(`tokens/modes/${f}`))]),
);
if (!brands.has('default')) throw new Error('tokens/modes/brand.default.tokens.json is required');
const brandDefault = brands.get('default');

// Mode-set completeness is drift inside the source of truth itself: light and
// dark must define the same tokens, and so must every brand file. Skipped under
// mono-theme (no dark file ⇒ dark.size === 0): there is nothing to match.
if (dark.size > 0) {
  for (const path of light.keys()) {
    if (!dark.has(path)) throw new Error(`Token "${path}" exists in light mode but not dark`);
  }
  for (const path of dark.keys()) {
    if (!light.has(path)) throw new Error(`Token "${path}" exists in dark mode but not light`);
  }
}
for (const [name, tokens] of brands) {
  for (const path of brandDefault.keys()) {
    if (!tokens.has(path)) throw new Error(`Token "${path}" exists in brand "default" but not brand "${name}"`);
  }
  for (const path of tokens.keys()) {
    if (!brandDefault.has(path)) throw new Error(`Token "${path}" exists in brand "${name}" but not brand "default"`);
  }
  // Brand tokens are decisions, expressed only as aliases into primitives.
  for (const [path, value] of tokens) {
    const alias = typeof value === 'string' && value.match(ALIAS);
    if (!alias) throw new Error(`Brand token "${path}" (brand "${name}") must be an alias into primitives`);
    if (!primitives.has(alias[1])) {
      throw new Error(`Brand token "${path}" (brand "${name}") references "{${alias[1]}}" which is not a primitive`);
    }
  }
}

const base = new Map([...primitives, ...brandDefault, ...semantic, ...light]);

mkdirSync('src/styles', { recursive: true });
writeFileSync('src/styles/tokens.css', emit(':root', base, base));
writeFileSync(
  'src/styles/tokens.dark.css',
  emit('[data-theme="dark"]', dark, new Map([...base, ...dark])),
);

// All non-default brands in ONE file so import sites never change.
const brandBlocks = [...brands]
  .filter(([name]) => name !== 'default')
  .map(([name, tokens]) => emit(`[data-brand="${name}"]`, tokens, new Map([...base, ...tokens])))
  .join('\n');
writeFileSync(
  'src/styles/tokens.brands.css',
  brandBlocks ||
    '/* GENERATED FILE — no non-default brands declared in tokens/modes/brand.*.tokens.json */\n',
);

// ---------------------------------------------------------------------------
// Fourth output — spec 018, the hand-written Odoo 19 module. See the header.
// ---------------------------------------------------------------------------
// The prefix is `pqr-` (Piqueray). NOT `o-`, which is Odoo's own convention,
// and NOT `bs-`: Odoo 19 forces `$variable-prefix: ''` in three independent
// bootstrap_overridden.scss files, so on an Odoo page Bootstrap's custom
// properties are named `--primary`, `--body-bg`, `--border-radius` — bare.
// Reintroducing `bs-` would read as "this is Bootstrap's", which is exactly
// backwards. Non-collision survey:
// specs/018-odoo-replique-manuelle/proofs/prefixe-non-collision.md
//
// NO mode blocks. Piqueray is mono-brand, mono-mode: the dark file is absent
// and no non-default brand exists. Emitting empty [data-theme] / [data-brand]
// blocks would manufacture a capability that does not exist.
const ODOO_DIR = 'specs/018-odoo-replique-manuelle/module/piqueray_ds/static/src/css';
mkdirSync(ODOO_DIR, { recursive: true });
writeFileSync(
  `${ODOO_DIR}/tokens.pqr.css`,
  emit(':root', base, base, 'pqr-', [
    '',
    'The SAME compiled vocabulary as src/styles/tokens.css, prefixed `--pqr-`.',
    'Prefixed so these names cannot collide with the ones Odoo publishes bare',
    '(--primary, --body-bg, --base-100…900, --header-font-size, …).',
    'Carries the vocabulary IN FULL — not only what the three replicated',
    'components consume — so a fourth component needs no pipeline change.',
  ]),
);

console.log(
  `✔ Tokens built: ${base.size} custom properties (:root), ${dark.size} dark-mode overrides, ` +
    `${brands.size} brand mode(s): ${[...brands.keys()].join(', ')}; ` +
    `+ ${base.size} prefixed (--pqr-) for the spec-018 Odoo module`,
);
