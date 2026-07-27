/**
 * QUARANTINED eval cases — the freezer, not the bin.
 *
 * Every case here ran green before the Piqueray reconversion (2026-07-22) and
 * is preserved VERBATIM: same `id`, same `claim`, same `run()` body, the same
 * assertions byte-for-byte. None of them can run against what Piqueray ships
 * today — one component (Button), one theme, one brand, no slots, no nested
 * instances, no repeat collections, no multi-root anatomy.
 *
 * They are imported by evals/run.ts but NEVER executed, and the runner prints
 * their count on every run so the quarantine can never go quiet. The live
 * `N/N` counts executed cases only.
 *
 * To re-enable one: move its block back into the `cases` array in
 * evals/run.ts and delete it here. Nothing else should need editing — that is
 * the whole point of keeping the assertions untouched.
 *
 * Per-case restore conditions are the `RE-ENABLE WHEN` comments below, and the
 * full table (what each one proved, why it cannot run, what Piqueray would
 * need) is evals/REMOVED-CASES.md.
 */

import { readFileSync, writeFileSync, cpSync, rmSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import {
  ROOT, SCRATCH, TSX, resetScratch, run, generate, buildTokens, parity, readReport,
  parseSyncComponent, replaceInFile, editJson, hashTree, expectFinding,
  BTN_TSX, CONTRACT, FIGMA_COMPONENTS, FIGMA_TOKENS, MINIMAL_CONTRACT,
  ContractSchema, schemaResolveTokens, type SchemaContract, type SchemaPart,
  coreValidateContract, createFigmaEngine, coreEmitHtml, tokenInventoryFromJson,
  type Case,
} from './harness.js';

/** The demo Card's generated source — the slot-prop cases mutate it. */
const CARD_TSX = 'src/components/Card/Card.tsx';

export const legacyCases: Case[] = [
  // RE-ENABLE WHEN: a second token mode (a real dark theme in tokens/modes/).
  {
    id: 'refuse-incomplete-mode-set',
    claim: 'C2-refusal',
    run: () => {
      editJson('tokens/modes/semantic.dark.tokens.json', (t) => delete t.color.border);
      const r = buildTokens();
      if (r.status === 0) throw new Error('Token build accepted a light/dark mode gap');
      if (!r.out.includes('light mode but not dark')) throw new Error('Mode gap not named');
    },
  },
  // RE-ENABLE WHEN: a Piqueray component with a slot (INSTANCE_SWAP) drawn on its Figma set.
  {
    id: 'detect-figma-missing-slot-property',
    claim: 'C3-detection',
    run: () => {
      editJson(FIGMA_COMPONENTS, (s) => {
        const card = s.sets.find((x: any) => x.name === 'Card');
        delete card.properties['Actions#2:15'];
      });
      if (parity().status === 0) throw new Error('Drift not detected');
      expectFinding(readReport(), 'figma', 'behind', 'Card.Actions');
    },
  },
  // RE-ENABLE WHEN: a Piqueray component with a slot carrying `accepts`.
  {
    id: 'detect-figma-accepts-drift',
    claim: 'C3-detection',
    run: () => {
      editJson(FIGMA_COMPONENTS, (s) => {
        const card = s.sets.find((x: any) => x.name === 'Card');
        card.properties['Actions#2:15'].preferredValues = [
          { type: 'COMPONENT_SET', key: '1b5d2a573f3f39404af396bdbe944a30ca0eaec3' },
        ]; // Badge dropped from preferredValues in Figma
      });
      if (parity().status === 0) throw new Error('Drift not detected');
      expectFinding(readReport(), 'figma', 'mismatch', 'Card.Actions (accepts)');
    },
  },
  // RE-ENABLE WHEN: a Piqueray component with a slot.
  {
    id: 'detect-code-removed-slot-prop',
    claim: 'C3-detection',
    run: () => {
      replaceInFile(CARD_TSX, /\s*actions\?: ReactNode;/, '');
      if (parity().status === 0) throw new Error('Drift not detected');
      expectFinding(readReport(), 'code', 'behind', 'Card.actions');
    },
  },
  // RE-ENABLE WHEN: a second brand file in tokens/modes/ (brand.<name>.tokens.json) with real brand-layer tokens.
  {
    // The multi-brand claim, mechanized: adding a brand is a TOKEN-LAYER-ONLY
    // operation. A new brand file must (a) leave every generated component
    // byte-identical, (b) emit a [data-brand] CSS block, (c) add a mode to
    // the design-tool Brand collection — and an incomplete brand file must
    // be refused by name.
    id: 'brand-added-token-layer-only',
    claim: 'C6-theming',
    run: () => {
      let r = buildTokens();
      if (r.status !== 0) throw new Error(`Baseline token build failed:\n${r.out}`);
      r = generate();
      if (r.status !== 0) throw new Error(`Baseline generate failed:\n${r.out}`);
      const before = hashTree('src/components');
      const nocturne = {
        brand: {
          accent: Object.fromEntries(
            ['100', '300', '400', '500', '600', '700', '900'].map((s) => [
              s,
              { $type: 'color', $value: `{color.red.${s}}` },
            ]),
          ),
          radius: { control: { $type: 'dimension', $value: '{radius.100}' } },
          font: {
            'control-family': { $type: 'fontFamily', $value: '{font.family.sans}' },
            'control-weight': { $type: 'fontWeight', $value: '{font.weight.medium}' },
          },
        },
      };
      const nocturnePath = path.join(SCRATCH, 'tokens', 'modes', 'brand.nocturne.tokens.json');
      writeFileSync(nocturnePath, JSON.stringify(nocturne, null, 2));
      r = buildTokens();
      if (r.status !== 0) throw new Error(`Token build failed with new brand:\n${r.out}`);
      r = generate();
      if (r.status !== 0) throw new Error(`Generate failed with new brand:\n${r.out}`);
      if (hashTree('src/components') !== before) {
        throw new Error('Adding a brand CHANGED generated component output — theming leaked out of the token layer');
      }
      const css = readFileSync(path.join(SCRATCH, 'src', 'styles', 'tokens.brands.css'), 'utf8');
      if (!css.includes('[data-brand="nocturne"]')) throw new Error('No [data-brand="nocturne"] CSS block emitted');
      r = run(TSX, ['scripts/generate-figma.ts']);
      if (r.status !== 0) throw new Error(`figma:plan failed with new brand:\n${r.out}`);
      const tokScript = readFileSync(path.join(SCRATCH, 'figma-sync', '01-tokens.js'), 'utf8');
      if (!tokScript.includes('"Nocturne"')) throw new Error('Brand mode "Nocturne" missing from the design-tool sync script');
      // incomplete brand file → refused by name
      const broken = JSON.parse(JSON.stringify(nocturne));
      delete broken.brand.radius;
      writeFileSync(nocturnePath, JSON.stringify(broken, null, 2));
      r = buildTokens();
      rmSync(nocturnePath);
      if (r.status === 0) throw new Error('Incomplete brand file was ACCEPTED');
      if (!r.out.includes('brand "nocturne"')) throw new Error(`Refusal did not name the brand:\n${r.out.slice(0, 300)}`);
    },
  },
  // RE-ENABLE WHEN: a Piqueray component with two or more enum axes (and the fixture re-authored against Piqueray tokens).
  {
    // N-axis variant support (2026-07-08): every enum prop is a variant axis.
    id: 'naxis-full-cartesian-product',
    claim: 'C1-determinism',
    run: () => {
      cpSync(path.join(ROOT, 'evals', 'fixtures', 'four-axis.contract.json'),
        path.join(SCRATCH, 'contracts', 'four-axis.contract.json'));
      let r = generate();
      if (r.status !== 0) throw new Error(`4-axis contract refused:\n${r.out.slice(0, 600)}`);
      r = run(TSX, ['scripts/generate-figma.ts']);
      if (r.status !== 0) throw new Error(`figma:plan failed with 4-axis contract:\n${r.out.slice(0, 600)}`);
      const syncDir = path.join(SCRATCH, 'figma-sync');
      const parseVariants = (file: string) =>
        parseSyncComponent(readFileSync(path.join(syncDir, file), 'utf8')).variants;
      const v = parseVariants(readdirSync(syncDir).find((f) => /^\d+-fouraxis\.js$/.test(f))!);
      if (v.length !== 36) throw new Error(`Expected 36 variants (3×3×2×2), got ${v.length}`);
      if (v[0].name !== 'Variant=Primary, Size=Medium, Emphasis=Medium, Icon Position=Start')
        throw new Error(`All-defaults combo must be FIRST: "${v[0].name}"`);
      if (v.some((x: any) => x.name.split(', ').length !== 4))
        throw new Error('A variant name is missing an axis segment');
      const rowsN = Math.max(...v.map((x: any) => x.row)) + 1;
      const colsN = Math.max(...v.map((x: any) => x.col)) + 1;
      if (rowsN !== 3 || colsN !== 12) throw new Error(`Grid must be 3×12; got ${rowsN}×${colsN}`);
      const nd = v.find((x: any) => x.name === 'Variant=Danger, Size=Large, Emphasis=Semibold, Icon Position=End');
      if (nd.spec.fill !== 'color/action/danger/background' || nd.spec.bindings.paddingLeft !== 'space/inset-x/lg')
        throw new Error('Per-axis {prop} token substitution did not resolve');
      const bv = parseVariants(readdirSync(syncDir).find((f) => /^\d+-button\.js$/.test(f))!);
      if (bv[0].name !== 'Variant=Primary, Size=Medium' || bv.length !== 12)
        throw new Error(`2-axis names changed ("${bv[0].name}") — amend reconciles BY NAME`);
      rmSync(path.join(SCRATCH, 'contracts', 'four-axis.contract.json'));
    },
  },
  // RE-ENABLE WHEN: a Piqueray contract with a declared event (contract.events).
  {
    // v6 events: a contract-declared event callback is API surface — an
    // engineer deleting onToggle from the code must surface as code BEHIND.
    id: 'detect-code-removed-event',
    claim: 'C3-detection',
    run: () => {
      replaceInFile(
        'src/components/AccordionItem/AccordionItem.tsx',
        /\s*\/\*\* Fires when the trigger is activated[^*]*\*\/\n\s*onToggle\?: \(\) => void;/,
        '',
      );
      if (parity().status === 0) throw new Error('Drift not detected');
      expectFinding(readReport(), 'code', 'behind', 'AccordionItem.onToggle');
    },
  },
  // RE-ENABLE WHEN: a Piqueray component with a slot carrying accepts + defaultContent.
  {
    id: 'refuse-defaultContent-outside-accepts',
    claim: 'C2-refusal',
    run: () => {
      replaceInFile(
        'contracts/table.contract.json',
        '"defaultContent": [\n              {\n                "id": "ds.table-row"\n              },',
        '"defaultContent": [\n              {\n                "id": "ds.badge"\n              },',
      );
      const r = generate();
      if (r.status === 0) throw new Error('Generator accepted defaultContent outside accepts');
      if (!r.out.includes('not in accepts')) throw new Error('Violation not named');
    },
  },
  // RE-ENABLE WHEN: a Piqueray component with more than one slot and declared defaultContent.
  {
    id: 'detect-figma-missing-multislot-content',
    claim: 'C3-detection',
    run: () => {
      editJson(FIGMA_COMPONENTS, (s) => {
        const table = s.sets.find((x: any) => x.name === 'Table');
        table.nestedInstances = table.nestedInstances.filter((n: string) => n !== 'TableRow');
      });
      if (parity().status === 0) throw new Error('Drift not detected');
      expectFinding(readReport(), 'figma', 'behind', 'Table.TableRow');
    },
  },
  // RE-ENABLE WHEN: a Piqueray screen fixture built from the shipping catalogue.
  {
    id: 'judge-passes-canonical-screen',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['parity/judge.ts', 'evals/fixtures/good-screen.tsx']);
      if (r.status !== 0) throw new Error(`Judge failed the canonical screen:\n${r.out}`);
    },
  },
  // RE-ENABLE WHEN: a Piqueray screen fixture (and enough shipping components to express each violation class).
  {
    id: 'judge-catches-all-violation-classes',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['parity/judge.ts', 'evals/fixtures/bad-screen.tsx', '--json', 'judge-out.json']);
      if (r.status === 0) throw new Error('Judge passed a screen seeded with violations');
      const report = JSON.parse(readFileSync(path.join(SCRATCH, 'judge-out.json'), 'utf8')).reports[0];
      const rules = new Set(report.violations.map((v: { rule: string }) => v.rule));
      for (const expected of [
        'components-from-catalog',
        'no-raw-equivalents',
        'no-style-overrides',
        'tokens-only',
        'one-primary-action',
      ]) {
        if (!rules.has(expected)) throw new Error(`Judge missed violation class: ${expected}`);
      }
    },
  },
  // RE-ENABLE WHEN: a Piqueray contract whose host element varies by prop (elementByProp).
  {
    // v7 elementByProp: partial maps and unknown elements must be refused by name.
    id: 'refuse-elementByProp-gaps',
    claim: 'C2-refusal',
    run: () => {
      editJson('contracts/heading.contract.json', (c) => { delete c.semantics.elementByProp.map['6']; });
      let r = generate();
      if (r.status === 0 || !r.out.includes('elementByProp map is missing enum value "6"')) throw new Error('Partial map not refused by name');
      editJson('contracts/heading.contract.json', (c) => { c.semantics.elementByProp.map['6'] = 'marquee'; });
      r = generate();
      if (r.status === 0 || !r.out.includes('unknown element "marquee"')) throw new Error('Unknown element not refused by name');
    },
  },
  // RE-ENABLE WHEN: a Piqueray contract using layoutByProp.
  {
    // v7 layoutByProp: the ChatMessage sender flip must land on BOTH surfaces —
    // reversed CSS in code, reversed compiled child order on the canvas.
    id: 'layoutByProp-flip-both-surfaces',
    claim: 'C1-determinism',
    run: () => {
      generate();
      const css = readFileSync(path.join(SCRATCH, 'src/components/ChatMessage/ChatMessage.module.css'), 'utf8');
      if (!/\.sender-user \{\n  flex-direction: row-reverse;/.test(css)) throw new Error('root flip rule missing');
      if (!/\.sender-user \.body \{\n  align-items: flex-end;/.test(css)) throw new Error('body override rule missing');
      run(TSX, ['scripts/generate-figma.ts']);
      const f = readdirSync(path.join(SCRATCH, 'figma-sync')).find((n) => /-chatmessage\.js$/.test(n))!;
      const variants = parseSyncComponent(readFileSync(path.join(SCRATCH, 'figma-sync', f), 'utf8')).variants;
      const user = variants.find((v: any) => v.name.includes('Sender=User'));
      if (user.spec.children.map((c: any) => c.name).join(',') !== 'body,avatarSlot') throw new Error('canvas child order not reversed per variant');
    },
  },
  // RE-ENABLE WHEN: a Piqueray contract using stylesWhen.
  {
    // v7 stylesWhen: non-whitelisted properties and token-shaped values refused by name.
    id: 'refuse-stylesWhen-outside-whitelist',
    claim: 'C2-refusal',
    run: () => {
      editJson('contracts/text-field.contract.json', (c) => { c.anatomy.root.stylesWhen[0].styles['background-color'] = 'red'; });
      let r = generate();
      if (r.status === 0 || !r.out.includes('not in the literal whitelist')) throw new Error('Non-whitelisted property not refused by name');
      editJson('contracts/text-field.contract.json', (c) => {
        delete c.anatomy.root.stylesWhen[0].styles['background-color'];
        c.anatomy.root.stylesWhen[0].styles.opacity = '{opacity.disabled}';
      });
      r = generate();
      if (r.status === 0 || !r.out.includes('looks like a token reference')) throw new Error('Token-shaped value not refused by name');
    },
  },
  // RE-ENABLE WHEN: a Piqueray contract with an overlay part.
  {
    // v7 overlay: an out-of-flow part claiming in-flow growth is a contradiction.
    id: 'refuse-overlay-inflow-conflicts',
    claim: 'C2-refusal',
    run: () => {
      editJson('contracts/banner.contract.json', (c) => { c.anatomy.root.parts.endArea.overlay = { placement: 'bottom' }; c.anatomy.root.parts.endArea.layout = { grow: true }; });
      const r = generate();
      if (r.status === 0 || !r.out.includes('cannot also grow')) throw new Error('overlay+grow not refused by name');
    },
  },
  // RE-ENABLE WHEN: a Piqueray component with an arrayOf prop (or the fixture re-authored against Piqueray tokens).
  {
    // v7 arrayOf/kind NONE: code-only structured props must be skipped by every
    // design-side consumer and never reported as drift; scalar NONE refused.
    id: 'array-prop-code-only-skipped-everywhere',
    claim: 'C3-detection',
    run: () => {
      cpSync(path.join(ROOT, 'evals', 'fixtures', 'array-prop.contract.json'), path.join(SCRATCH, 'contracts', 'array-prop.contract.json'));
      editJson('contracts/array-prop.contract.json', (c) => { c.$schema = './contract.schema.json'; });
      if (generate().status !== 0) throw new Error('arrayOf fixture failed to generate');
      const tsx = readFileSync(path.join(SCRATCH, 'src/components/CrumbTrail/CrumbTrail.tsx'), 'utf8');
      if (!tsx.includes('items?: Array<{ label: string; href: string; isCurrent: boolean }>')) throw new Error('array TS type not emitted');
      if (/\bitems =/.test(tsx)) throw new Error('array prop must have no default destructure');
      run(TSX, ['scripts/generate-figma.ts']);
      const f = readdirSync(path.join(SCRATCH, 'figma-sync')).find((n) => n.includes('crumbtrail'))!;
      const script = readFileSync(path.join(SCRATCH, 'figma-sync', f), 'utf8');
      if ((parseSyncComponent(script).textProps ?? []).length !== 0) throw new Error('NONE prop leaked onto the canvas');
      parity();
      const report = JSON.parse(readFileSync(path.join(SCRATCH, 'parity', 'report.json'), 'utf8'));
      if (report.findings.some((x: any) => x.subject.startsWith('CrumbTrail.'))) throw new Error('NONE prop reported as drift');
      editJson('contracts/array-prop.contract.json', (c) => { c.props[1].type = 'text'; });
      const r = generate();
      if (r.status === 0 || !r.out.includes('but is not an arrayOf prop')) throw new Error('scalar NONE not refused by name');
      rmSync(path.join(SCRATCH, 'contracts', 'array-prop.contract.json'));
    },
  },
  // RE-ENABLE WHEN: a second Piqueray component + a clean parity baseline.
  {
    // Pending-first-sync: null anchors are workflow state, not drift; anchored
    // but missing stays a hard BEHIND.
    id: 'pending-first-sync-not-drift',
    claim: 'C3-detection',
    run: () => {
      // Induce the never-synced state: null anchors + no set in the snapshot.
      editJson('contracts/heading.contract.json', (c) => { c.anchors.figma.componentSetKey = null; c.anchors.figma.nodeId = null; });
      editJson(FIGMA_COMPONENTS, (s2) => { s2.sets = s2.sets.filter((x: any) => x.name !== 'Heading'); });
      if (parity().status !== 0) throw new Error('never-synced contract failed parity');
      const report = JSON.parse(readFileSync(path.join(SCRATCH, 'parity', 'report.json'), 'utf8'));
      if (!report.pending?.some((p: any) => p.subject === 'Heading')) throw new Error('Heading not routed to pending');
      editJson('contracts/heading.contract.json', (c) => { c.anchors.figma.componentSetKey = 'deadbeef'; });
      if (parity().status === 0) throw new Error('ANCHORED missing set must stay a hard BEHIND');
      expectFinding(readReport(), 'figma', 'behind', 'Heading');
    },
  },
  // RE-ENABLE WHEN: a Piqueray component with interaction states (hover/active/focus-visible/disabled) and figmaStatePreviews.
  {
    // figmaStatePreviews (v8): the opt-in must be refused by name when hollow.
    id: 'refuse-hollow-state-previews',
    claim: 'C2-refusal',
    run: () => {
      const pristine = readFileSync(path.join(SCRATCH, CONTRACT), 'utf8');
      editJson(CONTRACT, (c) => { c.states = []; delete c.anatomy.root.states; });
      let r = generate();
      writeFileSync(path.join(SCRATCH, CONTRACT), pristine);
      if (r.status === 0 || !r.out.includes('declares no interaction states'))
        throw new Error('previews without states not refused by name');
      editJson(CONTRACT, (c) => { c.anatomy.root.states = { hover: c.anatomy.root.states.hover }; });
      r = generate();
      writeFileSync(path.join(SCRATCH, CONTRACT), pristine);
      if (r.status === 0 || !r.out.includes('state "focus-visible" declares no token overrides'))
        throw new Error('override-less state not refused by name');
    },
  },
  // RE-ENABLE WHEN: a Piqueray component with interaction states + figmaStatePreviews.
  {
    // State previews multiply ONLY the primary enum axis; overrides land on
    // the compiled specs; the base cartesian stays the pure enum API.
    id: 'state-previews-bounded-canvas-only',
    claim: 'C1-determinism',
    run: () => {
      if (buildTokens().status !== 0 || generate().status !== 0) throw new Error('Build failed');
      if (run(TSX, ['scripts/generate-figma.ts']).status !== 0) throw new Error('figma:plan failed');
      const f = readdirSync(path.join(SCRATCH, 'figma-sync')).find((n) => /^\d+-button\.js$/.test(n))!;
      const script = readFileSync(path.join(SCRATCH, 'figma-sync', f), 'utf8');
      const base = parseSyncComponent(script).variants;
      if (base.length !== 12 || base[0].name !== 'Variant=Primary, Size=Medium')
        throw new Error('Base cartesian must stay the pure enum API (previews ride a separate overlay)');
      const sv = parseSyncComponent(script).stateVariants ?? [];
      if (sv.length !== 12) throw new Error(`Expected 12 previews (4 variants × 3 states, Size at default), got ${sv.length}`);
      const hover = sv.find((v: any) => v.name === 'Variant=Danger, Size=Medium, State=Hover');
      if (hover?.spec.fill !== 'color/action/danger/background-hover')
        throw new Error(`Hover preview must bind the state override token, got ${hover?.spec.fill}`);
      const disabled = sv.find((v: any) => v.name === 'Variant=Primary, Size=Medium, State=Disabled');
      // LITERAL node opacity, never a bound variable: Figma's opacity field is
      // percent-scaled (0-100), so binding the 0-1 token (opacity.disabled=0.5)
      // rendered the synced Disabled preview at 0.5% — near-invisible white
      // (visual-parity receipt, Button State=Disabled 93.91% masked).
      if (disabled?.spec.opacity !== 0.5)
        throw new Error(`Disabled preview must carry literal node opacity 0.5 (the token's resolved value), got ${disabled?.spec.opacity}`);
      if (disabled?.spec.bindings?.opacity !== undefined)
        throw new Error('Disabled preview must NOT bind a 0-1 opacity variable (Figma reads the field as percent — renders ~0%)');
      if (!script.includes('node.opacity = spec.opacity'))
        throw new Error('node-opacity runtime line missing — the literal never reaches the node');
      if (sv.some((v: any) => v.name.includes('Size=Small') || v.name.includes('Size=Large')))
        throw new Error('Explosion not bounded — a preview multiplied a non-primary axis');
      if (!script.includes('withStateAxis')) throw new Error('runtime merge helper missing');
    },
  },
  // RE-ENABLE WHEN: a Piqueray component with interaction states.
  {
    // The State axis is declared surface when opted in, kit-rot drift when not.
    id: 'state-axis-drift-both-directions',
    claim: 'C3-detection',
    run: () => {
      // Induce the missing axis: strip State from the snapshot's Button set.
      editJson(FIGMA_COMPONENTS, (s2) => {
        const b = s2.sets.find((x: any) => x.name === 'Button');
        delete b.properties.State;
        b.variantCount = 12;
      });
      if (parity().status === 0) throw new Error('Opted-in contract without a canvas State axis passed parity');
      expectFinding(readReport(), 'figma', 'behind', 'Button.State');
      editJson(FIGMA_COMPONENTS, (s2) => {
        const b = s2.sets.find((x: any) => x.name === 'Button');
        b.properties.State = { type: 'VARIANT', defaultValue: 'Default', variantOptions: ['Default', 'Hover', 'Focus Visible', 'Disabled'], preferredValues: null };
        b.variantCount = 24;
      });
      editJson(CONTRACT, (c) => { delete c.figmaStatePreviews; });
      editJson(FIGMA_COMPONENTS, (s) => {
        s.sets.find((x: any) => x.name === 'Button').properties.State = {
          type: 'VARIANT', defaultValue: 'Default', variantOptions: ['Default', 'Hover'], preferredValues: null,
        };
      });
      if (parity().status === 0) throw new Error('Hand-built State axis passed parity');
      const fnd = expectFinding(readReport(), 'figma', 'ahead', 'Button.State');
      if ((fnd.proposedPatch as any)?.figmaStatePreviews !== true)
        throw new Error('Kit-rot State axis must propose adoption via figmaStatePreviews');
    },
  },
  // RE-ENABLE WHEN: either the typography token paths reshaped to font.<role>.size, or core/token-corpus.ts taught to derive styles from typography.<role>.size (Piqueray's 8 Montserrat styles are real and currently reach no surface).
  {
    // Text styles: minted from semantic typography tokens, upserted by marker,
    // and ridden by exactly-matching text nodes.
    id: 'text-styles-from-typography-tokens',
    claim: 'C1-determinism',
    run: () => {
      if (run(TSX, ['scripts/generate-figma.ts']).status !== 0) throw new Error('figma:plan failed');
      const tok = readFileSync(path.join(SCRATCH, 'figma-sync', '01-tokens.js'), 'utf8');
      const styles = JSON.parse(tok.match(/const TEXT_STYLES = (\[.*?\]);/)![1]);
      const ctrl = styles.find((s: any) => s.name === 'control/md');
      if (!ctrl || ctrl.fontSize !== 16 || ctrl.fontStyle !== 'Medium' || ctrl.tokenPath !== 'font.control.size.md')
        throw new Error(`control/md style wrong: ${JSON.stringify(ctrl)}`);
      if (!styles.some((s: any) => s.name === 'title' && s.fontStyle === 'Semi Bold'))
        throw new Error('Group weight token must drive the style weight (title → Semi Bold)');
      if (!tok.includes("getSharedPluginData('ds_contracts', 'textStyleToken')"))
        throw new Error('Text style upsert must reconcile by identity marker, never name');
      const f = readdirSync(path.join(SCRATCH, 'figma-sync')).find((n) => /^\d+-button\.js$/.test(n))!;
      const script = readFileSync(path.join(SCRATCH, 'figma-sync', f), 'utf8');
      const variants = parseSyncComponent(script).variants;
      const lg = variants.find((v: any) => v.name === 'Variant=Primary, Size=Large');
      if (lg.spec.children[1].textStyle !== 'control/lg')
        throw new Error('Large Button label must ride the control/lg text style');
      if (!script.includes('setTextStyleIdAsync')) throw new Error('runtime style application missing');
    },
  },
  // RE-ENABLE WHEN: a Piqueray component whose contract was GENERATED to the canvas (not authored away from it), so the round trip is an identity.
  {
    // DESIGN→CONTRACT round-trip identity: live node-tree dumps of three
    // contract-generated sets must re-propose contracts with ZERO MISMATCH.
    id: 'design-roundtrip-anatomy-zero-mismatch',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/roundtrip.ts']);
      if (r.status !== 0) throw new Error(`Round-trip receipt failed:\n${r.out}`);
      for (const name of ['Badge', 'Switch', 'Card']) {
        const line = r.out.split('\n').find((l) => l.startsWith(`${name}:`));
        if (!line || !/MISMATCH 0$/.test(line.trim()))
          throw new Error(`${name}: expected zero MISMATCH — got: ${line ?? '(no summary line)'}`);
        if (!/MATCHED [1-9]/.test(line)) throw new Error(`${name}: vacuous receipt (no matched facts)`);
      }
    },
  },
  // RE-ENABLE WHEN: the design roundtrip receipt runnable again.
  {
    // Uncorrelated cross-variant binding is drift, never a guess.
    id: 'design-roundtrip-uncorrelated-binding-is-mismatch-not-guess',
    claim: 'C5-extraction',
    run: () => {
      editJson('extract/figma/fixtures/main-file-dumps.json', (d) => {
        d.Badge.variants[2].fill.var = 'color/feedback/success/background';
      });
      const r = run(TSX, ['extract/figma/roundtrip.ts']);
      if (r.status === 0) throw new Error('Receipt passed despite an uncorrelated cross-variant binding');
      if (!r.out.includes('part root background-color')) throw new Error('Mismatch not named');
    },
  },
  // RE-ENABLE WHEN: a Piqueray component captured through the REST path.
  {
    // REST-mapped dump round-trips to the shipping contract (no plugin).
    id: 'design-rest-roundtrip-zero-mismatch',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/rest/roundtrip-rest.ts']);
      if (r.status !== 0) throw new Error(`REST roundtrip failed:\n${r.out}`);
      const receipt = readFileSync(path.join(SCRATCH, 'extract/figma/rest/ROUNDTRIP-REST.md'), 'utf8');
      for (const c of ['Badge', 'Card'])
        if (!new RegExp(`\\| ${c} \\| \\d+ \\| \\d+ \\| 0 \\| 0 \\| ✅`).test(receipt))
          throw new Error(`${c} row is not zero-mismatch/zero-degradation`);
    },
  },
  // RE-ENABLE WHEN: a Piqueray component captured through the REST path (fixtures under extract/figma/rest/fixtures/).
  {
    // Variables endpoint absent (Enterprise 403): named degradations, zero fabrication.
    id: 'design-rest-degraded-variables-never-fabricates',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/rest/roundtrip-rest.ts']);
      if (r.status !== 0) throw new Error(r.out);
      const receipt = readFileSync(path.join(SCRATCH, 'extract/figma/rest/ROUNDTRIP-REST.md'), 'utf8');
      if (!receipt.includes('unresolvable — variables endpoint unavailable (Enterprise)'))
        throw new Error('degradations not named');
      if (!receipt.includes('zero fabrication: no color token ref anywhere in the degraded proposal'))
        throw new Error('fabrication check missing/failed');
    },
  },
  // RE-ENABLE WHEN: a Piqueray REST fixture (see above).
  {
    // Degraded Figma imports mint provisional tokens and keep their styles —
    // and minted names never leave the imported. namespace.
    id: 'design-rest-degraded-minting-binds-styles',
    claim: 'C5-extraction',
    run: () => {
      const roundtrip = run(TSX, ['extract/figma/rest/roundtrip-rest.ts']);
      if (roundtrip.status !== 0) throw new Error(`REST roundtrip failed:\n${roundtrip.out}`);
      if (!/Badge \(degraded \+ minted\): 8\/8 checks/.test(roundtrip.out)) {
        throw new Error('degraded+minted pass did not report 8/8 checks');
      }
      const receipt = readFileSync(path.join(SCRATCH, 'extract/figma/rest/ROUNDTRIP-REST.md'), 'utf8');
      const refs = [...receipt.matchAll(/- `\{([a-z0-9.{}-]+)\}` = `/gi)].map((m) => m[1]);
      if (refs.length === 0) throw new Error('receipt lists no minted refs');
      const semantic = refs.filter((r) => !r.startsWith('imported.'));
      if (semantic.length > 0) throw new Error(`minted refs outside imported.: ${semantic.join(', ')}`);
      const mint = run(TSX, ['core/mint-check.ts']);
      if (mint.status !== 0) throw new Error(`mint invariants failed:\n${mint.out}`);
    },
  },
  // RE-ENABLE WHEN: a Piqueray component recorded through the desktop-MCP path with its own shipping contract.
  {
    // Desktop-MCP import: recorded live fixtures replay to plugin-dump name
    // fidelity — Badge zero-mismatch, Eventz foreign names + the U+2024 refusal.
    id: 'design-mcp-roundtrip-fixture-replay',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/mcp/receipt.ts']);
      if (r.status !== 0) throw new Error(`desktop-MCP receipt failed:\n${r.out}`);
      const receipt = readFileSync(path.join(SCRATCH, 'extract/figma/mcp/RECEIPT.md'), 'utf8');
      if (!/\| Badge \| \d+ \| \d+ \| 0 \| ✅/.test(receipt)) throw new Error('Badge row is not zero-mismatch');
      if (!receipt.includes('REFUSED by the token-ref grammar')) throw new Error('U+2024 refusal receipt missing');
    },
  },
  // RE-ENABLE WHEN: a Piqueray component that nests another, plus a second contract to collide names against.
  {
    // COMPOSITE CHILDREN, mechanism 1 (dump v1.5): nested instances resolve
    // by componentSetKey FIRST — RENAME-SAFE (same key, different name,
    // LINKS) — and a NAME match whose keys contradict is refused by name
    // (field failure: Shoelace "Button" name-collided with repo ds.button
    // and rendered the wrong design system's button on all 36 variants).
    id: 'key-based-linking',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/composite-check.ts']);
      if (r.status !== 0) throw new Error(`composite receipt failed:\n${r.out}`);
      for (const line of [
        '✔ same key + DIFFERENT name LINKS (rename-safe): component ref → sl.totally-renamed-button',
        '✔ name-coincidence link REFUSED by key contradiction (no component ref to ds.button)',
        '✔ the stub id is suffixed PAST the contradicting in-scope contract (ds.button-2, never ds.button)',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },
  // RE-ENABLE WHEN: a Piqueray component with a nested instance.
  {
    // COMPOSITE CHILDREN, mechanism 2 (dump v1.5): a child with no contract
    // in scope renders its OBSERVED bounding box + primary paint as minted
    // imported.stub-* tokens (per-variant via the stub's own axes; parent
    // props threaded "{size}"/"{type}") instead of a hollow nothing — and
    // never invents anatomy, borders, or its contract name as content.
    id: 'stub-geometry-render',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/composite-check.ts']);
      if (r.status !== 0) throw new Error(`composite receipt failed:\n${r.out}`);
      for (const line of [
        "✔ stub root binds minted geometry per the STUB'S OWN axes (width/height substitute {size})",
        '✔ minted leaves carry the OBSERVED values (small width 44px, large 82px, default fill #ffffff)',
        '✔ the parent\'s applied props THREAD the axes ("{size}"/"{type}" per variant, ComponentRefSchema)',
        '✔ emit-html: the stub box renders per size (.button--size-small { width: var(--imported-stub-button-2-root-width-small) })',
        '✔ emit-html: the stub renders its OBSERVED label text, and never its contract name',
        '✔ inconsistent stroke is NAMED, never faked (border not carried on the stub geometry)',
        '✔ eventz: slot design-time content proposed as defaultContent (startIcon → ds.play stub)',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },
  // RE-ENABLE WHEN: a Piqueray component with an INSTANCE_SWAP slot.
  {
    // COMPOSITE CHILDREN, mechanism 3 (dump v1.5): INSTANCE_SWAP
    // preferredValues (component keys) resolve through the session key index
    // into slot `accepts` (acceptsMode 'prefer' — Figma's own tier);
    // unresolvable keys stay a NAMED note carrying the keys verbatim.
    id: 'preferred-values-accepts',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/composite-check.ts']);
      if (r.status !== 0) throw new Error(`composite receipt failed:\n${r.out}`);
      for (const line of [
        '✔ unresolvable keys stay a NAMED note carrying the keys verbatim (no accepts invented)',
        '✔ with the key in scope, accepts resolves: slot accepts ["ev.icon"], acceptsMode "prefer"',
        '✔ the resolution is NAMED (preferredValues → accepts note)',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },
  // RE-ENABLE WHEN: a Piqueray component with a nested instance whose child contract ships here.
  {
    // Census class fix 1/3 (component-ref-unknown-child-prop, was 12 sets):
    // an applied Figma prop on a nested instance that does not map through
    // the in-scope child contract's bindings.figma is DROPPED with a named
    // note — never emitted under a guessed spelling the referee refuses.
    // Fixture replay of the live Avatar group set.
    id: 'design-census-unmappable-child-props-dropped',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/gauntlet/class-fix-check.ts']);
      if (r.status !== 0) throw new Error(`class-fix receipt failed:\n${r.out}`);
      for (const line of [
        '✔ the unmappable applied prop is DROPPED with the named note (isVisible on nested Avatar → ds.avatar)',
        '✔ "isVisible" appears NOWHERE in the emitted anatomy (dropped, not guessed)',
        '✔ referee CLEAN (validateContract + generateCss report zero violations; got 0)',
        '✔ no "sets unknown … prop" violation anywhere',
        '✔ ALL FOUR surfaces emit (react, html, react-inline, figma-script)',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },
  // RE-ENABLE WHEN: the class-fix receipt runnable again (see design-census-unmappable-child-props-dropped).
  {
    // Census class fix 2/3 (visiblewhen-value-outside-prop-enum, was 11
    // sets): presence riding a true/false axis spells the truthy form
    // visibleWhen { prop } (the axis promotes to a BOOLEAN prop; equals:
    // "true" is enum vocabulary). The inexpressible false side is a NAMED
    // note, kept unconditional — never a wrong condition. Fixture replay of
    // the live Alert set + a synthesized false-side set.
    id: 'design-census-boolean-visiblewhen-truthy-form',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/gauntlet/class-fix-check.ts']);
      if (r.status !== 0) throw new Error(`class-fix receipt failed:\n${r.out}`);
      for (const line of [
        '✔ presence on the true/false axis is spelled as the TRUTHY form with the named note (visibleWhen { prop: inlineAction })',
        '✔ no visibleWhen carries equals:"true"/"false" (boolean spelling, not enum vocabulary)',
        '✔ the axis promoted to a BOOLEAN prop `inlineAction`',
        '✔ no "visibleWhen.equals … is not a value of prop" violation anywhere',
        '✔ false side: the inexpressible condition is a NAMED note (visibleWhen has no negated form; kept unconditional)',
        '✔ false side: NO visibleWhen is invented on the part (never wrong)',
        '✔ false side: referee CLEAN (got 0)',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },
  // RE-ENABLE WHEN: the class-fix receipt runnable again.
  {
    // Census class fix 3/3 (prop-binding-not-camelcase, was 1 set): a
    // digit-led property spelling gets the componentIdSlug digit-led
    // discipline on prop code bindings ("2nd paragraph" → `p2ndParagraph`,
    // deterministic "p" prefix) with a named note; the figma binding keeps
    // the original spelling. Fixture replay of the live Note set.
    id: 'design-census-digit-led-prop-binding-prefixed',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/gauntlet/class-fix-check.ts']);
      if (r.status !== 0) throw new Error(`class-fix receipt failed:\n${r.out}`);
      for (const line of [
        '✔ the digit-led rename is a NAMED note (`p2ndParagraph` ← "2nd paragraph", componentIdSlug discipline)',
        '✔ prop name and code binding are `p2ndParagraph` (legal camelCase)',
        '✔ the figma binding keeps the ORIGINAL spelling "2nd paragraph"',
        '✔ no "is not a legal camelCase identifier" violation anywhere',
        '✔ ALL FOUR surfaces emit (react, html, react-inline, figma-script)',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },
  // RE-ENABLE WHEN: a Piqueray checkbox and switch.
  {
    // Owner finding (2026-07): ds.checkbox v1.1.0 emitted <button
    // role="checkbox"> — an ARIA re-creation of a control the platform
    // ships. The fixed shape is pinned on BOTH code surfaces: a real
    // focusable <input type="checkbox"> is the control, checked rides the
    // DOM (not aria-checked), and indeterminate is the DOM PROPERTY set via
    // a ref — never a fake attribute. Switch pins the modern pattern:
    // input[type=checkbox][role=switch].
    id: 'checkbox-native-input',
    claim: 'C4-convergence',
    run: () => {
      if (generate().status !== 0) throw new Error('generate failed');
      const cb = readFileSync(path.join(SCRATCH, 'src/components/Checkbox/Checkbox.tsx'), 'utf8');
      const sw = readFileSync(path.join(SCRATCH, 'src/components/Switch/Switch.tsx'), 'utf8');
      const cbCss = readFileSync(path.join(SCRATCH, 'src/components/Checkbox/Checkbox.module.css'), 'utf8');
      for (const [what, ok] of [
        ['Checkbox renders a native input[type=checkbox]', cb.includes('type="checkbox"') && cb.includes('<input')],
        ["Checkbox checked is DOM state (checked={value === 'checked'})", cb.includes("checked={value === 'checked'}")],
        ['Checkbox indeterminate is the DOM PROPERTY via ref, not an attribute', cb.includes('el.indeterminate =') && !cb.includes('indeterminate=')],
        ['Checkbox carries NO role="checkbox" and NO aria-checked (native semantics)', !cb.includes('role="checkbox"') && !cb.includes('aria-checked')],
        ['Checkbox input toggles via onChange', cb.includes('onChange={handleToggle}')],
        ['Checkbox input is focusable (visually managed, never display:none)', cbCss.includes('opacity: 0') && !cbCss.match(/\.input\s*\{[^}]*display:\s*none/)],
        ['Switch is input[type=checkbox][role=switch] (modern switch pattern)', sw.includes('type="checkbox"') && sw.includes('role="switch"') && !sw.includes('aria-checked')],
      ] as Array<[string, boolean]>) {
        if (!ok) throw new Error(`pin failed: ${what}`);
      }
      // Same shape on the no-build-step surface: emitHtml renders a real
      // void <input type="checkbox">, `checked` as the attribute on the on
      // value, and NAMES indeterminate as a DOM property in a comment.
      const probe = run(TSX, ['-e', `
        import { emitHtml } from './core/emit-html.ts';
        import { ContractSchema } from './scripts/contract-schema.ts';
        import { tokenInventoryFromJson } from './core/tokens.ts';
        import fs from 'node:fs';
        const c = ContractSchema.parse(JSON.parse(fs.readFileSync('contracts/checkbox.contract.json','utf8')));
        const trees = ['tokens/primitives.tokens.json','tokens/semantic.tokens.json','tokens/modes/semantic.light.tokens.json','tokens/modes/semantic.dark.tokens.json'].map(p=>JSON.parse(fs.readFileSync(p,'utf8')));
        const icons = new Map(fs.readdirSync('assets/icons').filter(f=>f.endsWith('.svg')).map(f=>[f.replace('.svg',''),fs.readFileSync('assets/icons/'+f,'utf8').trim()]));
        const { html } = emitHtml(c, { tokens: tokenInventoryFromJson(trees), icons, contracts: new Map([[c.id,c]]) });
        if (!html.includes('<input class="checkbox__input" type="checkbox">')) throw new Error('html surface lost the native input');
        if (!html.includes('type="checkbox" checked>')) throw new Error('html surface lost the checked attribute');
        if (!html.includes('el.indeterminate = true')) throw new Error('html surface does not name indeterminate as a DOM property');
        if (html.includes('indeterminate>') || html.includes('indeterminate=')) throw new Error('html surface fakes indeterminate as an attribute');
        console.log('html surface converges on the native input');
      `]);
      if (probe.status !== 0 || !probe.out.includes('html surface converges on the native input')) {
        throw new Error(`emitHtml probe failed:\n${probe.out}`);
      }
    },
  },
  // RE-ENABLE WHEN: a Piqueray component whose role claim could shadow a native control, plus one with a declared roleException.
  {
    // The STANDING SEMANTIC LINT — this class of error must be impossible,
    // not just fixed. Reintroducing the exact owner-found shape (<button
    // role="checkbox"> where a native input exists) refuses BY NAME at
    // generation, on every surface that calls validateContract (react/html/
    // react-inline/figma-script, the census, the playground referee). A
    // DECLARED exception passes (ds.progress-bar ships one; the whole-catalog
    // generate above is the positive case), and a dangling exception refuses
    // too — it never rides along silently.
    id: 'refuse-role-recreating-native-control',
    claim: 'C2-refusal',
    run: () => {
      // Reintroduce the owner's finding on the checkbox contract.
      editJson('contracts/checkbox.contract.json', (c) => {
        const box = c.anatomy.root.parts.box;
        delete box.parts.input;
        box.element = 'button';
        box.attrs = { role: 'checkbox' };
        c.events[0].trigger = 'box';
      });
      const r = generate();
      if (r.status === 0) throw new Error('Generator accepted <button role="checkbox"> — the owner-found shape must refuse');
      if (!r.out.includes('claims role "checkbox" on element "button"') || !r.out.includes('native <input type="checkbox"> exists')) {
        throw new Error(`Refusal not named (expected the native-equivalent violation):\n${r.out}`);
      }
      if (!r.out.includes('declare the exception')) throw new Error('Refusal does not point at the exception field');
      // The exception mechanism must never ride along silently: removing the
      // claim ds.progress-bar's declared exception covers refuses by name.
      resetScratch();
      editJson('contracts/progress-bar.contract.json', (c) => {
        delete c.anatomy.root.attrs.role;
      });
      const r2 = generate();
      if (r2.status === 0) throw new Error('Generator accepted a dangling roleException');
      if (!r2.out.includes('roleException is declared but no root-level role claim needs it')) {
        throw new Error(`Dangling exception not named:\n${r2.out}`);
      }
    },
  },
  // RE-ENABLE WHEN: the playground examples re-authored against the Piqueray catalogue.
  {
    // The Examples gallery captions state FACTS about their contracts, and
    // one shipped wrong (the Badge card said "four variant classes" over a
    // five-variant contract). Countable claims are DERIVED in
    // playground/src/engine/examples.ts; this receipt pins every derivation
    // site against the real contracts and refuses reintroduced hardcoded
    // counts (playground/scripts/caption-check.ts — reads source as text,
    // same discipline as design-canvas-box-parity).
    id: 'playground-caption-consistency',
    claim: 'C3-detection',
    run: () => {
      const r = run(TSX, ['playground/scripts/caption-check.ts']);
      if (r.status !== 0) throw new Error(`caption-consistency check failed:\n${r.out}`);
      for (const line of [
        'contractId references all resolve to shipping contracts',
        'enum-derivation sites resolve to non-empty enums',
        'caption-consistency: all claims hold',
      ]) {
        if (!r.out.includes(line)) throw new Error(`caption check receipt missing "${line}":\n${r.out}`);
      }
    },
  },
  // RE-ENABLE WHEN: a Piqueray component with a styled static-text part carrying box channels.
  {
    // Field failure (Split view): the Switch thumb — a text:"" part carrying
    // width/height/fill tokens — compiled correctly (the sync script wraps
    // styled static text in a frame that carries the box) but the canvas
    // preview's text branch dropped every box channel: a height-0 transparent
    // span, no thumb on screen. Pins BOTH halves: the compiled spec carries
    // the channels, and the canvas renderer's text branch renders them.
    id: 'switch-canvas-thumb',
    claim: 'C1-determinism',
    run: () => {
      const probe = run(TSX, ['-e', `
        import fs from 'node:fs';
        import { createFigmaEngine } from './core/emit-figma-script.ts';
        import { ContractSchema } from './scripts/contract-schema.ts';
        const j = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
        const tokens = { primitives: j('tokens/primitives.tokens.json'), semantic: j('tokens/semantic.tokens.json'), light: j('tokens/modes/semantic.light.tokens.json'), dark: j('tokens/modes/semantic.dark.tokens.json'), brands: { default: j('tokens/modes/brand.default.tokens.json') } };
        const icons = new Map(fs.readdirSync('assets/icons').filter(f=>f.endsWith('.svg')).map(f=>[f.replace('.svg',''),fs.readFileSync('assets/icons/'+f,'utf8')]));
        const byId = new Map(fs.readdirSync('contracts').filter(f=>f.endsWith('.contract.json')).map(f=>ContractSchema.parse(j('contracts/'+f))).map(c=>[c.id,c]));
        const data = createFigmaEngine({ tokens, icons }).compileComponentData(byId.get('ds.switch'), byId);
        const find = (s, name) => s.name === name ? s : (s.children ?? []).map(c => find(c, name)).find(Boolean);
        const thumb = find(data.variants[0].spec, 'thumb');
        if (!thumb) throw new Error('no thumb spec compiled');
        if (thumb.type !== 'text') throw new Error('thumb is expected to compile as a styled static TEXT spec, got ' + thumb.type);
        if (thumb.fill !== 'color/switch/thumb') throw new Error('thumb spec lost its fill: ' + thumb.fill);
        if (thumb.fixedWidth?.px !== 16 || thumb.fixedHeight?.px !== 16) throw new Error('thumb spec lost its 16px box');
        if (thumb.bindings?.topLeftRadius !== 'radius/pill') throw new Error('thumb spec lost its radius binding');
        console.log('thumb spec carries fill+16px box+radius');
      `]);
      if (probe.status !== 0 || !probe.out.includes('thumb spec carries fill+16px box+radius')) {
        throw new Error(`thumb spec probe failed:\n${probe.out}`);
      }
      // The canvas renderer's text branch renders those channels (the same
      // source-pin style as design-canvas-box-parity).
      const canvasSrc = readFileSync(
        path.join(SCRATCH, 'playground', 'src', 'engine', 'canvas-preview.ts'),
        'utf8',
      );
      const textBranch = canvasSrc.slice(canvasSrc.indexOf("spec.type === 'text'"), canvasSrc.indexOf("spec.type === 'instance'"));
      if (!/if \(spec\.fill \|\| spec\.fixedWidth \|\| spec\.fixedHeight \|\| spec\.bindings\)/.test(textBranch)) {
        throw new Error('canvas text branch no longer renders the styled-static-text box wrap (the height-0 thumb class)');
      }
      if (!textBranch.includes('nodeStyle(spec, ctx)')) {
        throw new Error('canvas text-box wrap no longer carries the box styles via nodeStyle');
      }
    },
  },
  // RE-ENABLE WHEN: a Piqueray component with interaction states.
  {
    // BROWSER PROBE — real keyboard focus must NOT render the pressed/hover
    // fill. Field failure (visual-parity): every CBDS/Eventz focus row
    // screenshotted the hover fill under the ring (68-70% masked) — the
    // harness's stale mouse, not the emitters; this pins the emitter truth in
    // a real browser so the class can never be a silent emitter regression.
    id: 'focus-not-pressed-browser-probe',
    claim: 'C1-determinism',
    run: () => {
      const probe = run(TSX, ['-e', `
        import fs from 'node:fs';
        import { chromium } from 'playwright-core';
        import { chromiumExecutable } from './extract/figma/visual-parity/render.ts';
        import { emitHtml } from './core/emit-html.ts';
        import { ContractSchema } from './scripts/contract-schema.ts';
        import { tokenInventoryFromJson } from './core/tokens.ts';
        const j = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
        const c = ContractSchema.parse(j('contracts/button.contract.json'));
        const inv = tokenInventoryFromJson(['tokens/primitives.tokens.json','tokens/semantic.tokens.json','tokens/modes/semantic.light.tokens.json','tokens/modes/semantic.dark.tokens.json'].map(j));
        const icons = new Map(fs.readdirSync('assets/icons').filter(f=>f.endsWith('.svg')).map(f=>[f.replace('.svg',''),fs.readFileSync('assets/icons/'+f,'utf8').trim()]));
        const emitted = emitHtml(c, { tokens: inv, icons, contracts: new Map([[c.id, c]]) });
        const doc = '<!doctype html><html><head><meta charset="utf-8"><style>' + fs.readFileSync('src/styles/tokens.css','utf8') + '</style><style>body{margin:0;padding:32px}</style><style>' + emitted.css + '</style></head><body>' + emitted.html + '</body></html>';
        (async () => {
          const browser = await chromium.launch({ executablePath: chromiumExecutable(), headless: true });
          try {
            const page = await browser.newPage();
            await page.setContent(doc, { waitUntil: 'load' });
            await page.mouse.move(0, 0); // pointer parked OFF the component
            await page.keyboard.press('Tab');
            const r = await page.evaluate("(() => { const el = document.querySelector('.showcase .button'); const cs = getComputedStyle(el); const v = (n) => { const probe = document.createElement('div'); probe.style.backgroundColor = 'var(' + n + ')'; document.body.appendChild(probe); const out = getComputedStyle(probe).backgroundColor; probe.remove(); return out; }; return { focused: document.activeElement === el, fv: el.matches(':focus-visible'), bg: cs.backgroundColor, outlineStyle: cs.outlineStyle, def: v('--color-action-primary-background'), hover: v('--color-action-primary-background-hover') }; })()");
            if (!r.focused || !r.fv) throw new Error('Tab did not keyboard-focus the button: ' + JSON.stringify(r));
            if (r.outlineStyle !== 'solid') throw new Error('focus ring missing: ' + JSON.stringify(r));
            if (r.bg !== r.def) throw new Error('real keyboard focus changed the fill: got ' + r.bg + ', default is ' + r.def + ' (hover is ' + r.hover + ')');
            if (r.bg === r.hover) throw new Error('focus renders the hover fill');
            console.log('keyboard focus keeps the default fill under the ring');
          } finally { await browser.close(); }
        })().catch((e) => { console.error(e); process.exit(1); });
      `]);
      if (probe.status !== 0 || !probe.out.includes('keyboard focus keeps the default fill under the ring')) {
        throw new Error(`focus browser probe failed:\n${probe.out}`);
      }
    },
  },
  // RE-ENABLE WHEN: a Piqueray component with a slot, and one with slot defaultContent.
  {
    // Empty slot = ABSENT content — never painted placeholder text (field
    // failure: Eventz '[startIcon slot]' placeholders inflated every
    // visual-parity row 55-97%). Declared defaultContent still renders.
    id: 'slot-empty-not-placeholder',
    claim: 'C1-determinism',
    run: () => {
      const probe = run(TSX, ['-e', `
        import fs from 'node:fs';
        import { emitHtml } from './core/emit-html.ts';
        import { ContractSchema } from './scripts/contract-schema.ts';
        import { tokenInventoryFromJson } from './core/tokens.ts';
        const j = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
        const inv = tokenInventoryFromJson(['tokens/primitives.tokens.json','tokens/semantic.tokens.json','tokens/modes/semantic.light.tokens.json','tokens/modes/semantic.dark.tokens.json'].map(j));
        const icons = new Map(fs.readdirSync('assets/icons').filter(f=>f.endsWith('.svg')).map(f=>[f.replace('.svg',''),fs.readFileSync('assets/icons/'+f,'utf8').trim()]));
        const byId = new Map(fs.readdirSync('contracts').filter(f=>f.endsWith('.contract.json')).map(f=>ContractSchema.parse(j('contracts/'+f))).map(c=>[c.id,c]));
        // ds.token: two slots (icon, endContent), neither has defaultContent.
        const token = emitHtml(byId.get('ds.token'), { tokens: inv, icons, contracts: byId }).html;
        if (/\\[[a-zA-Z]+ slot\\]/.test(token)) throw new Error('empty slot painted bracket placeholder text');
        if (token.includes('slot-placeholder')) throw new Error('slot placeholder class still emitted');
        if (!token.includes('<!-- icon slot: no content -->')) throw new Error('empty slot absence not NAMED (comment missing)');
        // ds.breadcrumbs: its items slot DECLARES defaultContent — it must
        // still render composed children, never the absence comment.
        const bc = emitHtml(byId.get('ds.breadcrumbs'), { tokens: inv, icons, contracts: byId }).html;
        if (!bc.includes('breadcrumb-item')) throw new Error('declared defaultContent no longer renders: ' + bc.slice(0, 400));
        if (bc.includes('slot: no content')) throw new Error('a slot WITH defaultContent was marked absent');
        console.log('empty slots are absent-and-named; defaultContent renders');
      `]);
      if (probe.status !== 0 || !probe.out.includes('empty slots are absent-and-named; defaultContent renders')) {
        throw new Error(`slot probe failed:\n${probe.out}`);
      }
    },
  },
  // RE-ENABLE WHEN: a Piqueray component whose root is a UA-margined element (h1-h6, p, blockquote, ul, hr).
  {
    // UA-margin neutralization: a root that can render as a UA-margined
    // element carries margin: 0 in the emitted CSS on BOTH css surfaces; a
    // root that cannot (Badge: span) carries none.
    id: 'heading-margin-reset',
    claim: 'C1-determinism',
    run: () => {
      if (generate().status !== 0) throw new Error('generate failed');
      const rootBlock = (css: string) => css.slice(css.indexOf('.root {'), css.indexOf('}', css.indexOf('.root {')));
      for (const name of ['Heading', 'Blockquote', 'Divider', 'List']) {
        const css = readFileSync(path.join(SCRATCH, `src/components/${name}/${name}.module.css`), 'utf8');
        if (!rootBlock(css).includes('margin: 0;')) throw new Error(`${name} root lost the UA-margin reset`);
      }
      const badge = readFileSync(path.join(SCRATCH, 'src/components/Badge/Badge.module.css'), 'utf8');
      if (rootBlock(badge).includes('margin: 0;')) throw new Error('Badge (span root — no UA margin) gained a gratuitous reset');
      const probe = run(TSX, ['-e', `
        import fs from 'node:fs';
        import { emitHtml } from './core/emit-html.ts';
        import { ContractSchema } from './scripts/contract-schema.ts';
        import { tokenInventoryFromJson } from './core/tokens.ts';
        const j = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
        const c = ContractSchema.parse(j('contracts/heading.contract.json'));
        const inv = tokenInventoryFromJson(['tokens/primitives.tokens.json','tokens/semantic.tokens.json','tokens/modes/semantic.light.tokens.json','tokens/modes/semantic.dark.tokens.json'].map(j));
        const { css } = emitHtml(c, { tokens: inv, icons: new Map(), contracts: new Map([[c.id, c]]) });
        const root = css.slice(css.indexOf('.heading {'), css.indexOf('}', css.indexOf('.heading {')));
        if (!root.includes('margin: 0;')) throw new Error('html surface lost the UA-margin reset');
        console.log('html surface resets UA margins on the heading root');
      `]);
      if (probe.status !== 0 || !probe.out.includes('html surface resets UA margins')) {
        throw new Error(`heading html probe failed:\n${probe.out}`);
      }
    },
  },
  // RE-ENABLE WHEN: a Piqueray component with a size (or other secondary) enum axis.
  {
    // ds.token's size scale is LIVE: each non-default size emits a distinct,
    // non-empty override rule (the dead-prop class: an enum axis that binds
    // nothing renders every value identically).
    id: 'token-size-live',
    claim: 'C1-determinism',
    run: () => {
      if (generate().status !== 0) throw new Error('generate failed');
      const css = readFileSync(path.join(SCRATCH, 'src/components/Token/Token.module.css'), 'utf8');
      const block = (cls: string) => {
        const i = css.indexOf(`.${cls} {`);
        if (i < 0) return null;
        return css.slice(i, css.indexOf('}', i));
      };
      const sm = block('size-sm');
      const lg = block('size-lg');
      if (!sm || !sm.includes('padding-inline: var(--space-inset-y-sm);')) {
        throw new Error('size-sm override missing — the size prop is dead again');
      }
      if (!lg || !lg.includes('font-size: var(--font-control-size-sm);') || !lg.includes('padding-inline: var(--space-inset-x-sm);')) {
        throw new Error('size-lg override missing — the size prop is dead again');
      }
      if (sm === lg) throw new Error('size overrides do not differ');
      // The tsx composes the class (it did even when the prop was dead —
      // the CSS is what makes it live).
      const tsx = readFileSync(path.join(SCRATCH, 'src/components/Token/Token.tsx'), 'utf8');
      if (!tsx.includes('styles[`size-${size}`]')) throw new Error('Token.tsx no longer composes the size class');
    },
  },
  // RE-ENABLE WHEN: a Piqueray component that repeats a child (repeat + component in its anatomy).
  {
    // P9 (repeated-children collections, schema v12 `repeat`): ≥3 adjacent
    // sibling instances of the same child with a carriable per-item field
    // propose as ONE item-template part + arrayOf prop — React maps the live
    // array, the canvas/static surfaces render the OBSERVED sample (the
    // meter discipline). Per-item enum/state differences (P10) and pre-v1.5
    // TEXT/VARIANT-ambiguous keys stay NAMED receipts; "Show item N" count
    // booleans never promote. Receipt runs the REAL owner's-kit
    // Navigation-Header fixture + a v1.5-shaped synthetic run.
    id: 'repeated-children-collection',
    claim: 'C5-extraction',
    run: () => {
      const r = run(TSX, ['extract/figma/repeat-collection-check.ts']);
      if (r.status !== 0) throw new Error(`repeat receipt failed:\n${r.out}`);
      for (const line of [
        '✔ exactly ONE repeat part proposes for the 5 drawn menu items (got 1)',
        '✔ the sample carries the 5 OBSERVED siblings (got 5)',
        '✔ the arrayOf prop `items` ships code-only (bindings.figma.kind NONE)',
        '✔ the collection carry is the NAMED flagship note (P9, meter discipline spelled out)',
        '✔ the per-item TEXT stays a NAMED ambiguity receipt (pre-v1.5 dump — never guessed)',
        '✔ the "Show item N" count booleans are receipted, never promoted (rename story named)',
        '✔ React maps the LIVE array ({items?.map((item, index) => …iconRight={item.iconRight}…)})',
        '✔ the canvas constructs the OBSERVED instances (5 LinkNeutral sample instances in the sync script)',
        '✔ per-item TEXT carries as a field — the "#id" suffix is TEXT certainty (fields: { children: text })',
        '✔ the sample carries the drawn labels VERBATIM (One/Two/Three/Four)',
        '✔ the varying enum is the P10 receipt (selected-item stays note-gated, never carried)',
        '✔ the static surface renders the OBSERVED sample per item (One…Four appear in the html)',
        '✔ the pattern is DETECTED and the fallback is a NAMED note (no field invented)',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing check: ${line}`);
      }
    },
  },
  // RE-ENABLE WHEN: a Piqueray composite (a contract that nests others) so the dependency-ordering flow has a subject; the bundle/receipt half only needs the check re-pointed at the shipping contract.
  {
    // PLUGIN ENGINE (Phase 2, plugin v2) — the Figma plugin's engine bundle:
    // (a) a fresh esbuild of figma-sync/plugin/engine/entry.ts matches the
    // committed drift-guard receipt and the headless harness EXECUTES the
    // bundle's generate flow (tokens + Badge + version marker) against a
    // mocked figma global — the stored ds_contracts/specHash must equal the
    // engine's mirror, so the update report's "unchanged" detection can
    // never silently drift from the emitted runtime; (b) mutating core makes
    // the NEXT zip build refuse BY NAME (stale receipt) — the same
    // discipline as the embedded-dump-script guard.
    id: 'plugin-engine-bundle',
    claim: 'C1-determinism',
    run: () => {
      const check = run(process.execPath, ['scripts/plugin-engine-check.mjs']);
      if (check.status !== 0) throw new Error(`plugin-engine-check failed:\n${check.out}`);
      for (const want of [
        '✔ engine bundle fresh vs committed receipt',
        '✔ headless generate: Badge v',
        'stored specHash equals the engine mirror',
        '✔ bundle order: ds.card plans 4 component scripts, dependencies first (ds.avatar → ds.button → ds.badge → ds.card)',
        'plugin-engine-check: all flows green',
      ]) {
        if (!check.out.includes(want)) throw new Error(`missing "${want}" in:\n${check.out}`);
      }
      // Drift guard: a real core change (a string literal the minifier keeps)
      // must make the zip build refuse by name until the receipt is
      // re-recorded deliberately.
      replaceInFile('core/emit-figma-script.ts', "'WRONG FILE: expected '", "'WRONG FILE!! expected '");
      const stale = run(process.execPath, ['scripts/build-plugin-zip.mjs']);
      if (stale.status === 0) throw new Error('zip build did NOT refuse after a core mutation — the engine drift guard is dead');
      if (!stale.out.includes('STALE vs core') || !stale.out.includes('--update-engine-receipt')) {
        throw new Error(`stale-engine refusal is not named:\n${stale.out}`);
      }
      console.log('plugin-engine-bundle: fresh bundle matches the receipt, headless generate green, core mutation → named STALE refusal');
    },
  },
  // RE-ENABLE WHEN: a second Piqueray component (the report needs one contract to update and one to create).
  {
    // PLUGIN UPDATE REPORT (Phase 2, plugin v2) — the Update-library tab's
    // mandatory report+confirm: the EXACT plain-words change report renders
    // BEFORE anything applies (version → version with +prop, new-with-
    // variant-count, unchanged-skip, counts, nothing-applied tail), a
    // duplicate contract id refuses by name, and Apply then amends IN PLACE
    // (same node id, props added, markers updated).
    id: 'plugin-update-report',
    claim: 'C3-detection',
    run: () => {
      const check = run(process.execPath, ['scripts/plugin-engine-check.mjs']);
      if (check.status !== 0) throw new Error(`plugin-engine-check failed:\n${check.out}`);
      for (const want of [
        '✔ update report (before anything applies):',
        '• Badge 1.1.0 → 9.9.9: +prop Experimental.',
        '• Switch 2.0.0: new — will be created (2 variants).',
        '1 to update · 1 new · 0 unchanged.',
        'Nothing has been applied — review the list, then Apply.',
        '• Badge 1.1.0: unchanged — will be skipped.',
        '✔ apply: Badge amended in place (same node ',
        '+prop Experimental, markers updated to v9.9.9',
      ]) {
        if (!check.out.includes(want)) throw new Error(`missing "${want}" in:\n${check.out}`);
      }
      console.log('plugin-update-report: exact plain-words report before apply, amend-in-place after');
    },
  },
  // RE-ENABLE WHEN: the plugin-engine-check runnable again.
  {
    // PLUGIN PROPOSE DRY-RUN (Phase 2, plugin v2) — the Propose tab: the
    // ui.html-embedded dump script (drift-guarded verbatim copy) reads the
    // mock-generated set back, proposeDiff yields a proposal + bounded
    // API-level diff (a base missing a drawn prop surfaces "+prop <name>" by
    // name), and the GitHub PR flow's DRY RUN prints its exact 4-step REST
    // plan with the session-only token note — zero network.
    id: 'plugin-propose-dry-run',
    claim: 'C4-convergence',
    run: () => {
      const check = run(process.execPath, ['scripts/plugin-engine-check.mjs']);
      if (check.status !== 0) throw new Error(`plugin-engine-check failed:\n${check.out}`);
      for (const want of [
        '✔ propose: mock canvas dumped through the embedded dump script → proposal + bounded diff; a base missing "variant" surfaces "+prop variant" by name',
        '✔ PR dry-run plan: 4 named REST steps, deterministic branch, session-only token note — zero network',
      ]) {
        if (!check.out.includes(want)) throw new Error(`missing "${want}" in:\n${check.out}`);
      }
      console.log('plugin-propose-dry-run: dump→proposal→bounded diff round-trip + exact PR dry-run plan');
    },
  },
  // RE-ENABLE WHEN: a Piqueray catalogue large enough to exercise the round trip (or the receipt re-pointed at the shipping contract alone).
  {
    // PHASE 6 CLOSURE RECEIPT — @ds-contracts/emitter-web-components proves
    // the emitter plugin interface PRESERVES TRUTH: emit Web Components for
    // five contracts (repo Badge/Button/Switch/Card + the Polaris badge
    // pilot), generate custom-elements.json FROM the contracts, run the
    // REPO'S OWN CEM extraction adapter over the emitted package, and diff
    // the round-tripped proposal against each source contract — props/
    // enums/defaults/events must survive; every non-survivor is NAMED with
    // its mechanism (anatomy doesn't ride CEM — expected, named). Plus the
    // registry/CLI integration: the package's default export registers as
    // "web-components" (live array + getEmitters + byName, collision
    // refused by name) and the BUILT dist bundle loads through
    // `generate --target web-components --emitter <dist>`.
    id: 'wc-emitter-roundtrip',
    claim: 'C7-cli',
    run: () => {
      // 1) The closure receipt itself (examples/ is not copied into scratch —
      //    the Polaris pilot rides in read-only from the repo root).
      const receipt = run(TSX, [
        'packages/emitter-web-components/scripts/roundtrip-check.ts',
        '--examples-root', path.join(ROOT, 'examples'),
        '--out', 'wc-samples',
      ]);
      if (receipt.status !== 0) throw new Error(`roundtrip receipt failed:\n${receipt.out}`);
      for (const line of [
        'cem: every emitted component extracted (no silent drops)',
        'cem: zero skips (the emitted manifest is fully legible)',
        '✔ prop variant: enum values survive [primary, secondary, danger, ghost]',
        '✔ prop variant: default "primary" survives',
        '✔ prop disabled: boolean kind survives',
        '✔ event toggle: survives as event prop onToggle',
        "✔ proposal: event 'toggle' back with bindings.code.prop onToggle",
        "✔ proposal: variant back as enum with the full value set + default 'primary'",
        '✔ prop toneAndProgressLabelOverride: attribute "tone-and-progress-label-override" maps back to canonical "toneAndProgressLabelOverride"',
        '✔ prop tone: enum values survive [info, success, warning, critical, attention, new, magic, info-strong, success-strong, warning-strong, critical-strong, attention-strong, read-only, enabled]',
        '✔ NAMED non-survivor — anatomy (parts/tokens/layout/…): CEM describes an API, never an implementation — the proposal returns a stub anatomy',
        '✔ NAMED non-survivor — slot constraints (accepts/min/max/required): CEM slots carry name + description only — the constraint set does not ride',
        '✔ wc-emitter-roundtrip: 5 contracts emitted, CEM-extracted, and diffed — props/enums/defaults/events survive; every non-survivor named',
      ]) {
        if (!receipt.out.includes(line)) throw new Error(`missing receipt line: ${line}\n${receipt.out}`);
      }

      // 2) Registry integration: the package default export IS an Emitter;
      //    registration lands in the live array, getEmitters, and byName;
      //    a name collision refuses by name.
      const probe = run(TSX, ['-e', `
        import { emitters, emitterByName, getEmitters, registerEmitter } from './core/emitter.ts';
        import wc from './packages/emitter-web-components/src/index.ts';
        registerEmitter(wc);
        if (!getEmitters().some((e) => e.name === 'web-components')) throw new Error('not in getEmitters()');
        if (!emitters.some((e) => e.name === 'web-components')) throw new Error('registry array is not live');
        if (emitterByName.get('web-components') !== wc) throw new Error('not in emitterByName');
        let threw = '';
        try { registerEmitter({ name: 'web-components', label: 'x', emit: () => [] }); } catch (e) { threw = String(e); }
        if (!threw.includes('already registered')) throw new Error('collision not refused by name: ' + (threw || '(registered!)'));
        console.log('wc registry probe ok: ' + getEmitters().map((e) => e.name).join(','));
      `]);
      if (probe.status !== 0 || !probe.out.includes('wc registry probe ok: react,html,react-inline,figma-script,web-components')) {
        throw new Error(`wc registry probe failed:\n${probe.out}`);
      }

      // 3) CLI integration with the BUILT artifact (the publishable shape):
      //    build the plugin bundle + the CLI in scratch, then generate.
      const builtWc = run(process.execPath, ['packages/emitter-web-components/build.mjs']);
      if (builtWc.status !== 0) throw new Error(`plugin build failed:\n${builtWc.out}`);
      const builtCli = run(process.execPath, ['packages/cli/build.mjs']);
      if (builtCli.status !== 0) throw new Error(`CLI build failed:\n${builtCli.out}`);
      const cli = path.join(SCRATCH, 'packages', 'cli', 'dist', 'cli.js');
      const r = spawnSync(
        process.execPath,
        [cli, 'generate', 'contracts/badge.contract.json', 'contracts/button.contract.json',
          '--out', 'wc-out', '--target', 'web-components',
          '--emitter', 'packages/emitter-web-components/dist/index.js',
          '--tokens', 'tokens/primitives.tokens.json', '--icons', 'assets/icons'],
        { cwd: SCRATCH, encoding: 'utf8' },
      );
      const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
      if (r.status !== 0 || !out.includes('Registered emitter "web-components"')) {
        throw new Error(`CLI --emitter web-components failed:\n${out}`);
      }
      for (const f of ['ds-badge.ts', 'ds-badge.css.ts', 'ds-badge.demo.html', 'ds-badge.custom-elements.json', 'ds-button.ts']) {
        if (!existsSync(path.join(SCRATCH, 'wc-out', f))) throw new Error(`CLI did not write wc-out/${f}`);
      }
      const badgeTs = readFileSync(path.join(SCRATCH, 'wc-out', 'ds-badge.ts'), 'utf8');
      if (!badgeTs.includes("customElements.define('ds-badge', BadgeElement)") ||
          !badgeTs.includes('static observedAttributes = ["variant"]')) {
        throw new Error(`emitted ds-badge.ts missing definition/observedAttributes:\n${badgeTs.slice(0, 400)}`);
      }
      console.log('wc-emitter-roundtrip: 5-contract CEM round trip survived (props/enums/defaults/events; non-survivors named), registry + CLI --target web-components proven on the built dist bundle');
    },
  },
  // RE-ENABLE WHEN: Piqueray components with boolean props and interaction states.
  {
    // PHASE 6 CROSS-EMITTER CONSISTENCY RECEIPT — the emitted Web Component
    // demo renders in REAL Chromium next to core/emit-html.ts's render of
    // the SAME contracts, and the component root computed-compares across
    // every showcase item: 9 computed channels + bounding width/height per
    // item, 165 comparisons over Badge/Button/Switch (enum × boolean ×
    // state chrome included — disabled opacity, loading spinner geometry,
    // switch checked layout). The shadow-scoped selector translation must
    // resolve the cascade EXACTLY like emit-html's class rules: one
    // contract, one computed truth across emitters.
    id: 'wc-emitter-css-parity',
    claim: 'C1-determinism',
    run: () => {
      const r = run(TSX, ['packages/emitter-web-components/scripts/css-parity-check.ts']);
      if (r.status !== 0) throw new Error(`css-parity receipt failed:\n${r.out}`);
      for (const line of [
        '✔ [disabled=true] 11/11 channels match (9 computed + width/height)',
        '✔ [loading=true] 11/11 channels match (9 computed + width/height)',
        '✔ [value=on] 11/11 channels match (9 computed + width/height)',
        '✔ wc-emitter-css-parity: 3 subjects, 15 showcase items, 165 channel comparisons, 0 mismatches — one contract, one computed truth across emitters',
      ]) {
        if (!r.out.includes(line)) throw new Error(`missing parity line: ${line}\n${r.out}`);
      }
      console.log('wc-emitter-css-parity: 165/165 computed channels equal across emitters (real Chromium)');
    },
  },
  // RE-ENABLE WHEN: a Piqueray multi-root composite with nested instances and a repeat collection.
  {
    // DEPTH STAGE C — the DYNAMIC CHILD-COLLECTION composite. The advanced-
    // composition frontier on top of the multi-root path: a multi-root Modal
    // (ds.composite-modal = {dialog, backdrop}) whose BODY holds composed
    // children rather than only static leaf parts — a single composed ds.card
    // instance AND a ds.badge template REPEATED over the arrayOf `items` prop.
    // KEY FINDING this pin locks in: Stage C required ZERO core/emit-*.ts
    // changes — the `component` + `repeat` channels already lived in every
    // emitter, so composition was latent in the multi-root gate. This runs the
    // committed receipt (examples/depth-composite/emit-composite-receipt.ts),
    // proving each of the four surfaces by EXECUTION: emit-react +
    // emit-react-inline esbuild-bundle and render (role="dialog" body holds
    // <Card> + the live items array mapped to N <Badge> children, sibling
    // backdrop); emit-html the same static markup; emit-figma-script referees
    // to one variant frame (body = composed summary instance + N repeated tag
    // instances) AND headless-executes in a VM — seeding token variables
    // (buildTokensScript) then syncing the transitive deps in order
    // (Avatar→Button→Badge→Card, incl. slot.accepts INSTANCE_SWAP targets)
    // before the composite builds its nested instance composition. THE NORTH
    // STAR is the 6th check: the built canvas COMPONENT node tree is walked and
    // asserted to line up with the CONTRACT anatomy PART-FOR-PART (every part at
    // its declared nesting path; body.summary a nested ds.card INSTANCE;
    // body.tags N repeated ds.badge INSTANCEs; dialog+backdrop sibling roots) —
    // "the anatomy of a coded component lines up with the anatomy of a canvas-
    // based Figma component." examples/ is not copied into scratch (see
    // astryx-dev-journey) — stage it in first.
    id: 'depth-composite-child-collection',
    claim: 'C8-journey',
    run: () => {
      cpSync(
        path.join(ROOT, 'examples', 'depth-composite'),
        path.join(SCRATCH, 'examples', 'depth-composite'),
        { recursive: true },
      );
      const r = run(TSX, ['examples/depth-composite/emit-composite-receipt.ts']);
      if (r.status !== 0 || !r.out.includes('5 surfaces emitted + EXECUTED, canvas anatomy ≡ code anatomy')) {
        throw new Error(`Stage C composite receipt failed:\n${r.out.slice(0, 1600)}`);
      }
      for (const surface of [
        'emit-react —',
        'emit-react-inline —',
        'emit-html —',
        'emit-figma-script (referee)',
        'emit-figma-script (headless)',
        'anatomy-parity (code ≡ canvas)',
      ]) {
        if (!r.out.includes(`✔ ${surface}`)) {
          throw new Error(`Stage C composite: check "${surface}" did not pass:\n${r.out.slice(0, 1600)}`);
        }
      }
      console.log('depth-composite-child-collection: multi-root Modal body holds a composed ds.card + a ds.badge collection REPEATED over items — renders on React/inline/HTML and headless-executes as figma-script; NORTH STAR: the built canvas COMPONENT anatomy lines up with the contract PART-FOR-PART (body.summary a nested ds.card INSTANCE, body.tags 3 repeated ds.badge INSTANCEs, dialog+backdrop sibling roots); ZERO core/emit-*.ts changes — composition was latent in the multi-root channels');
    },
  },
];
