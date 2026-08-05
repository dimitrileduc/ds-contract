/**
 * The diagnostic loop — three-way parity check.
 *
 * Diffs each live surface against the CONTRACT (never side-to-side):
 *   code   ⟷ contract   (React source parsed by parity/extract-code.ts)
 *   figma  ⟷ contract   (snapshots in parity/snapshots/, refreshed by running
 *                        parity/extract-figma.plugin.js in the Figma file)
 *   figma variables ⟷ tokens/ (the token half of the contract)
 *
 * Classification:
 *   *-ahead   — the surface has something the contract doesn't → PROPOSE a
 *               contract/token patch (the promotion flow; a human reviews it)
 *   *-behind  — the contract has something the surface doesn't → REGENERATE
 *               that surface (npm run generate / figma-sync scripts)
 *   mismatch  — both define it, values disagree → contract is canonical;
 *               adopt (patch contract) or enforce (regenerate surface)
 *
 * Exit code 1 when drift exists (CI-able). Full report at parity/report.json.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  ContractSchema,
  STATE_PREVIEW_DEFAULT,
  STATE_PREVIEW_PROPERTY,
  componentRefsOf,
  slotFigmaProperty,
  slotVisibilityProperty,
  slotsOf,
  statePreviewLabel,
  walkAnatomy,
  type Contract,
  type Prop,
} from '../scripts/contract-schema.js';
import { extractCode, type CodeExtract } from './extract-code.js';
import { richTextDefaultText, richTextDefaultsEqual } from './defaults.js';

const ROOT = process.cwd();

interface Finding {
  surface: 'code' | 'figma' | 'figma-tokens' | 'icons';
  classification: 'ahead' | 'behind' | 'mismatch';
  subject: string;
  detail: string;
  proposedPatch?: unknown;
  remedy: string;
}

const findings: Finding[] = [];
const add = (f: Finding) => findings.push(f);

/** Pending first sync (v7): a contract whose design anchors are still null
 *  has never been generated on the canvas — the missing set is EXPECTED
 *  mid-workflow state (add contract → run figma-sync → anchors written back
 *  → re-extract snapshots), not drift between surfaces that were once in
 *  sync. Reported in its own section, excluded from the exit code — the
 *  moment anchors exist, a missing set is a hard BEHIND again. */
const pending: Array<{ subject: string; detail: string; remedy: string }> = [];

const isEnum = (p: Prop): p is Prop & { type: { enum: string[] } } =>
  typeof p.type === 'object' && 'enum' in p.type;
const pascal = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const sameCodeDefault = (p: Prop, codeDefault: unknown): boolean =>
  p.type === 'rich-text'
    ? richTextDefaultsEqual(p.default, codeDefault)
    : String(p.default ?? '') === String(codeDefault ?? '');
const figmaDefault = (p: Prop): string | boolean | undefined => {
  if (p.type === 'boolean') return Boolean(p.default);
  if (p.type === 'rich-text') return richTextDefaultText(p.default);
  return p.default === undefined ? undefined : String(p.default);
};

// ---------------------------------------------------------------------------
// Load inputs
// ---------------------------------------------------------------------------

const contracts: Contract[] = readdirSync(path.join(ROOT, 'contracts'))
  .filter((f) => f.endsWith('.contract.json'))
  .map((f) => ContractSchema.parse(JSON.parse(readFileSync(path.join(ROOT, 'contracts', f), 'utf8'))));

const code: CodeExtract[] = extractCode(ROOT);

interface FigmaPropertyDef {
  type: string;
  defaultValue: unknown;
  variantOptions: string[] | null;
  preferredValues?: Array<{ type: string; key: string }> | null;
}
interface FigmaSet {
  name: string;
  nodeId: string;
  key: string;
  variantCount: number;
  properties: Record<string, FigmaPropertyDef>;
  nestedInstances?: string[];
}
const figmaComponents: { sets: FigmaSet[]; fileKey?: string; extractedAt?: number } = JSON.parse(
  readFileSync(path.join(ROOT, 'parity', 'snapshots', 'figma-components.json'), 'utf8'),
);
interface FigmaVariable {
  name: string;
  type: string;
  values: Record<string, unknown>;
}
const figmaTokens: {
  // `modes` is written by parity/extract-figma.plugin.js (v2+). Optional so
  // pre-v2 snapshots still parse — the naming bridge below simply won't fire.
  collections: Array<{ name: string; variables: FigmaVariable[]; modes?: string[] }>;
  fileKey?: string;
  extractedAt?: number;
} = JSON.parse(readFileSync(path.join(ROOT, 'parity', 'snapshots', 'figma-tokens.json'), 'utf8'));

// ---------------------------------------------------------------------------
// 0 · snapshot provenance — are these snapshots from the right file, recently?
// ---------------------------------------------------------------------------
// Snapshots that carry `fileKey` are verified against the contracts' anchor
// file key; snapshots that carry `extractedAt` (epoch ms, stamped by
// parity/extract-figma.plugin.js) are checked for staleness. Snapshots
// WITHOUT these fields get a console warning, not a finding — older
// snapshots stay usable (backward compatible).

const MAX_SNAPSHOT_AGE_DAYS = Number(process.env.MAX_SNAPSHOT_AGE_DAYS ?? 14);
const anchorFileKey = contracts[0]?.anchors.figma.fileKey ?? null;
const provenanceWarnings: string[] = [];

for (const [label, snap] of [
  ['figma-components.json', figmaComponents],
  ['figma-tokens.json', figmaTokens],
] as const) {
  if (typeof snap.fileKey === 'string' && snap.fileKey) {
    if (anchorFileKey && snap.fileKey !== anchorFileKey) {
      add({
        surface: 'figma',
        classification: 'mismatch',
        subject: 'snapshot-provenance',
        detail: `${label} was extracted from file ${snap.fileKey} but the contracts anchor file ${anchorFileKey} — the snapshot describes a different Figma file`,
        remedy: 'Re-run parity/extract-figma.plugin.js in the anchored file and save fresh snapshots',
      });
    }
  } else {
    provenanceWarnings.push(`${label} lacks fileKey`);
  }
  if (typeof snap.extractedAt === 'number' && Number.isFinite(snap.extractedAt)) {
    const ageDays = (Date.now() - snap.extractedAt) / 86_400_000;
    if (ageDays > MAX_SNAPSHOT_AGE_DAYS) {
      add({
        surface: 'figma',
        classification: 'mismatch',
        subject: 'snapshot-stale',
        detail: `${label} is ${ageDays.toFixed(1)} days old (max ${MAX_SNAPSHOT_AGE_DAYS}, override via MAX_SNAPSHOT_AGE_DAYS) — the Figma file has likely moved on`,
        remedy: 'Re-run parity/extract-figma.plugin.js and save fresh snapshots',
      });
    }
  } else {
    provenanceWarnings.push(`${label} lacks extractedAt`);
  }
}
if (provenanceWarnings.length > 0) {
  console.warn(`⚠ snapshot provenance unverifiable: ${provenanceWarnings.join('; ')} — re-extract with the current parity/extract-figma.plugin.js to enable identity + staleness checks.`);
}

// ---------------------------------------------------------------------------
// 1 · code ⟷ contract
// ---------------------------------------------------------------------------

for (const contract of contracts) {
  const extracted = code.find((c) => c.component === contract.name);
  if (!extracted) {
    add({
      surface: 'code',
      classification: 'behind',
      subject: contract.name,
      detail: 'Component missing from src/components',
      remedy: 'npm run generate',
    });
    continue;
  }

  const contractCodeProps = contract.props.filter((p) => p.type !== 'text');

  // Named text props (title) and named slots (actions) must exist in code —
  // presence-only checks (their TS types are string / ReactNode).
  for (const expected of [
    ...contract.props
      .filter((p) => p.type === 'text' && p.bindings.code.prop !== 'children')
      .map((p) => ({ name: p.bindings.code.prop, kind: 'text prop' })),
    ...slotsOf(contract)
      .filter((s) => s.slot.name !== 'children')
      .map((s) => ({ name: s.slot.name, kind: 'slot prop' })),
    // v6: declared events are contract API — a missing callback is code BEHIND.
    ...(contract.events ?? []).map((e) => ({ name: e.bindings.code.prop, kind: 'event callback' })),
  ]) {
    if (!extracted.props.some((cp) => cp.name === expected.name)) {
      add({
        surface: 'code',
        classification: 'behind',
        subject: `${contract.name}.${expected.name}`,
        detail: `Contract ${expected.kind} "${expected.name}" missing from ${contract.name}Props`,
        remedy: 'npm run generate',
      });
    }
  }

  for (const p of contractCodeProps) {
    const codeName = p.bindings.code.prop;
    const found = extracted.props.find((cp) => cp.name === codeName);
    if (!found) {
      add({
        surface: 'code',
        classification: 'behind',
        subject: `${contract.name}.${codeName}`,
        detail: `Contract prop "${p.name}" missing from ${contract.name}Props`,
        remedy: 'npm run generate',
      });
      continue;
    }
    if (isEnum(p)) {
      const want = p.type.enum.join('|');
      const got = (found.values ?? []).join('|');
      if (want !== got) {
        add({
          surface: 'code',
          classification: 'mismatch',
          subject: `${contract.name}.${codeName}`,
          detail: `Enum values differ — contract: [${want}], code: [${got}]`,
          remedy: 'Adopt into contract (promotion) or npm run generate to enforce',
        });
      }
    }
    // Kind drift: a prop whose TYPE changed in code (enum→string,
    // boolean→enum) previously passed as long as the name existed.
    const expectedKind = isEnum(p) ? 'enum' : p.type === 'boolean' ? 'boolean' : null;
    if (expectedKind && found.kind !== expectedKind && found.kind !== 'other') {
      add({
        surface: 'code',
        classification: 'mismatch',
        subject: `${contract.name}.${codeName} (type)`,
        detail: `Prop type differs — contract: ${expectedKind}, code: ${found.kind}`,
        remedy: 'Adopt into contract (promotion) or npm run generate to enforce',
      });
    }
    // Default drift including ONE-SIDED deletion: a default removed from
    // code is drift (the generated classname silently loses its styling),
    // not a pass. Event-toggled props are exempt — their default lives in
    // the uncontrolled useState, which extraction cannot see.
    const isToggled = (contract.events ?? []).some((e) => e.toggles?.prop === p.name);
    if (!isToggled && !sameCodeDefault(p, found.default)) {
      add({
        surface: 'code',
        classification: 'mismatch',
        subject: `${contract.name}.${codeName} (default)`,
        detail: `Default differs — contract: ${JSON.stringify(p.default)}, code: ${JSON.stringify(found.default)}`,
        remedy: 'Adopt into contract (promotion) or npm run generate to enforce',
      });
    }
  }

  const contractPropNames = new Set([
    ...contractCodeProps.map((p) => p.bindings.code.prop),
    ...contract.props.filter((p) => p.type === 'text').map((p) => p.bindings.code.prop),
    ...slotsOf(contract).map((s) => s.slot.name),
    ...(contract.events ?? []).map((e) => e.bindings.code.prop),
  ]);
  for (const cp of extracted.props) {
    if (contractPropNames.has(cp.name)) continue;
    // Code declares a prop the contract doesn't know — code is AHEAD.
    const patch: Record<string, unknown> = {
      name: cp.name,
      type: cp.kind === 'enum' ? { enum: cp.values } : cp.kind,
      ...(cp.default !== undefined ? { default: cp.default } : {}),
      bindings: {
        figma: {
          kind: cp.kind === 'enum' ? 'VARIANT' : cp.kind === 'boolean' ? 'BOOLEAN' : 'TEXT',
          property: pascal(cp.name),
          ...(cp.kind === 'enum'
            ? { values: Object.fromEntries((cp.values ?? []).map((v) => [v, pascal(v)])) }
            : {}),
        },
        code: { prop: cp.name },
      },
    };
    add({
      surface: 'code',
      classification: 'ahead',
      subject: `${contract.name}.${cp.name}`,
      detail: `Code declares prop "${cp.name}" (${cp.kind}) that the contract does not define`,
      proposedPatch: patch,
      remedy: `Review + append to contracts/${contract.id.replace(/^[^.]+\./, '')}.contract.json props[], bump version, then npm run build && npm run figma:plan`,
    });
  }

  // 015/D9 (FR-005): a part's `tokens[cssProp]` binding implies the shipped
  // CSS Module consumes `var(--<token-path>)` (core/emit-react.ts's own
  // cssVar() naming: dots -> hyphens). A generated file hand-edited back to
  // a raw literal still has the right PROPS — nothing above this point would
  // catch it. `extracted.cssVars` (parity/extract-code.ts) already reads the
  // CSS Module's actual var() usage; this is what compares it against what
  // the contract's own token bindings require.
  for (const { part, path: partPath } of walkAnatomy(contract)) {
    if (part.component) continue; // instances style themselves via their own contract
    for (const [cssProp, ref] of Object.entries(part.tokens ?? {})) {
      if (typeof ref !== 'string' || !/^\{[^{}]+\}$/.test(ref)) continue; // per-variant placeholder ({...}), not a plain reference
      const tokenPath = ref.slice(1, -1);
      const expectedVar = tokenPath.split('.').join('-');
      if (!extracted.cssVars.includes(expectedVar)) {
        add({
          surface: 'code',
          classification: 'behind',
          subject: `${contract.name}.${partPath.join('.')}#${cssProp}`,
          detail: `Contract binds "${cssProp}" to token {${tokenPath}} (expects var(--${expectedVar})) but the shipped CSS Module does not consume that custom property`,
          remedy: 'npm run generate',
        });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 2 · figma ⟷ contract
// ---------------------------------------------------------------------------

const normalizeFigmaProps = (set: FigmaSet) => {
  const map = new Map<string, FigmaPropertyDef>();
  for (const [key, def] of Object.entries(set.properties)) {
    map.set(key.split('#')[0], def);
  }
  return map;
};

// nestedInstances (parity/extract-figma.plugin.js) records each nested
// instance's LIVE canvas name (main.parent.name for a variant, main.name for
// a standalone component) — it cannot record a stable key because Figma's
// Plugin API exposes no "which variant/component does this INSTANCE point
// to" identifier other than the resolved node's own name. So this join is
// name-based by construction. To keep it working after a canvas-only rename
// (T076 — masters renamed to their French convention, same failure mode as
// core/emit-figma-script.ts's findComponentByName, B5 backlog), resolve the
// dependency's CURRENT canvas name via its own componentSetKey anchor first
// (matching how the direct set lookup above already prefers key over name),
// falling back to the contract's `name` field for components with no anchor
// yet (pending first sync) or no key (figmaRepresentation: 'native').
const nestedInstanceName = (dep: Contract): string => {
  const depKey = dep.anchors.figma.componentSetKey;
  const depSet = depKey ? figmaComponents.sets.find((s) => s.key === depKey) : undefined;
  return depSet?.name ?? dep.name;
};

for (const contract of contracts) {
  if (contract.figmaRepresentation === 'native') continue; // no Figma component expected
  const anchorKey = contract.anchors.figma.componentSetKey;
  const set =
    figmaComponents.sets.find((s) => anchorKey && s.key === anchorKey) ??
    figmaComponents.sets.find((s) => s.name === contract.name);
  if (!set) {
    if (!anchorKey && !contract.anchors.figma.nodeId) {
      pending.push({
        subject: contract.name,
        detail: 'No design anchor yet — the contract has never been synced to Figma (pending first generation, not drift)',
        remedy: 'Run its figma-sync script, write back anchors (npm run anchors:writeback), re-extract snapshots',
      });
      continue;
    }
    add({
      surface: 'figma',
      classification: 'behind',
      subject: contract.name,
      detail: 'Component set missing from Figma file',
      remedy: 'Run figma-sync scripts (npm run figma:plan, execute in Figma)',
    });
    continue;
  }

  const figmaProps = normalizeFigmaProps(set);
  const expectedNames = new Set<string>();

  for (const p of contract.props) {
    // kind NONE (v7 arrayOf): code-only by declared fidelity limit — the
    // canvas is not expected to host the prop, so it is skipped, not BEHIND.
    if (p.bindings.figma.kind === 'NONE') continue;
    const propertyName = p.bindings.figma.property!;
    expectedNames.add(propertyName);
    const def = figmaProps.get(propertyName);
    if (!def) {
      add({
        surface: 'figma',
        classification: 'behind',
        subject: `${contract.name}.${propertyName}`,
        detail: `Contract prop "${p.name}" has no ${p.bindings.figma.kind} property on the Figma set`,
        remedy: 'Add the property to the existing set via a scripted edit — sync scripts are currently CREATE-only and skip existing components (see docs/internal/figma-sync.md)',
      });
      continue;
    }
    // Property KIND must match the binding (a designer converting a
    // boolean to a variant axis previously passed as "present").
    if (def.type !== p.bindings.figma.kind) {
      add({
        surface: 'figma',
        classification: 'mismatch',
        subject: `${contract.name}.${propertyName} (kind)`,
        detail: `Property kind differs — contract: ${p.bindings.figma.kind}, figma: ${def.type}`,
        remedy: 'Adopt into contract (promotion) or rebuild the property',
      });
    }
    // BOOLEAN/TEXT defaults were presence-only (red-team finding): flipping
    // every boolean default on the canvas passed "parity clean".
    if (!isEnum(p) && p.default !== undefined && def.defaultValue !== undefined) {
      const want = figmaDefault(p);
      if (want === undefined) continue;
      const got = p.type === 'boolean' ? Boolean(def.defaultValue) : String(def.defaultValue);
      if (want !== got) {
        add({
          surface: 'figma',
          classification: 'mismatch',
          subject: `${contract.name}.${propertyName} (default)`,
          detail: `Default differs — contract: ${JSON.stringify(want)}, figma: ${JSON.stringify(got)}`,
          remedy: 'Adopt into contract (promotion) or reset the property default',
        });
      }
    }
    // variantOptions/defaultValue below describe a VARIANT property's axis
    // values and canvas-positional default — they simply don't exist for an
    // INSTANCE_SWAP property (whose canvas menu is `preferredValues`, keyed
    // by component id, and whose "default" is a node id, not an option
    // name). An icon-registry-governed swap (002-governed-icons-button, D5)
    // already gets the CORRECT, purpose-built three-way comparison from the
    // icons axis (registry ↔ code ↔ canvas by key) — this generic check
    // would just compare the wrong fields and false-positive.
    if (isEnum(p) && p.bindings.figma.kind !== 'INSTANCE_SWAP') {
      const want = p.type.enum.map((v) => p.bindings.figma.values?.[v] ?? v);
      const got = def.variantOptions ?? [];
      // Order-insensitive: the canvas presents the default variant first;
      // option ORDER is presentation, not contract API.
      if ([...want].sort().join('|') !== [...got].sort().join('|')) {
        add({
          surface: 'figma',
          classification: 'mismatch',
          subject: `${contract.name}.${propertyName}`,
          detail: `Variant options differ — contract: [${want.join(', ')}], figma: [${got.join(', ')}]`,
          remedy: 'Adopt into contract (promotion) or re-sync the set',
        });
      }
      const wantDefault =
        p.default !== undefined
          ? (p.bindings.figma.values?.[String(p.default)] ?? String(p.default))
          : undefined;
      if (wantDefault !== undefined && def.defaultValue !== wantDefault) {
        add({
          surface: 'figma',
          classification: 'mismatch',
          subject: `${contract.name}.${propertyName} (default)`,
          detail: `Default variant differs — contract: ${wantDefault}, figma: ${String(def.defaultValue)} (Figma's default = first variant in the set)`,
          remedy: 'Reorder the set so the contract-default variant is first',
        });
      }
    }
  }

  // State previews (figmaStatePreviews): a DECLARED canvas-only surface.
  // When the contract opts in, the set must carry the State variant axis
  // with exactly Default + the declared states — the axis is contract API,
  // not drift. (The converse — a State axis with NO opt-in — is handled in
  // the ahead sweep below: that's the kit-rot detection story.)
  if (contract.figmaStatePreviews && contract.states.length > 0) {
    expectedNames.add(STATE_PREVIEW_PROPERTY);
    const def = figmaProps.get(STATE_PREVIEW_PROPERTY);
    const want = [STATE_PREVIEW_DEFAULT, ...contract.states.map(statePreviewLabel)];
    if (!def) {
      add({
        surface: 'figma',
        classification: 'behind',
        subject: `${contract.name}.${STATE_PREVIEW_PROPERTY}`,
        detail: `Contract opts into state previews (figmaStatePreviews) but the Figma set has no ${STATE_PREVIEW_PROPERTY} variant axis`,
        remedy: 'Re-run the component sync script (amend adds the State preview axis and renames base variants with State=Default)',
      });
    } else {
      if (def.type !== 'VARIANT') {
        add({
          surface: 'figma',
          classification: 'mismatch',
          subject: `${contract.name}.${STATE_PREVIEW_PROPERTY} (kind)`,
          detail: `State preview axis must be a VARIANT property, figma has ${def.type}`,
          remedy: 'Re-run the component sync script',
        });
      }
      const got = def.variantOptions ?? [];
      if ([...want].sort().join('|') !== [...got].sort().join('|')) {
        add({
          surface: 'figma',
          classification: 'mismatch',
          subject: `${contract.name}.${STATE_PREVIEW_PROPERTY}`,
          detail: `State preview values differ — contract: [${want.join(', ')}], figma: [${got.join(', ')}]`,
          remedy: 'Adopt into the contract states (promotion) or re-sync the set',
        });
      }
      if (def.defaultValue !== undefined && def.defaultValue !== STATE_PREVIEW_DEFAULT) {
        add({
          surface: 'figma',
          classification: 'mismatch',
          subject: `${contract.name}.${STATE_PREVIEW_PROPERTY} (default)`,
          detail: `Default state variant must be ${STATE_PREVIEW_DEFAULT}, figma: ${String(def.defaultValue)} (Figma's default = first variant in the set)`,
          remedy: 'Reorder the set so the all-defaults State=Default variant is first',
        });
      }
    }
  }

  // Slots: INSTANCE_SWAP property per slot; optional slots additionally get a
  // "Show X" BOOLEAN. `accepts` must round-trip as preferredValues whose keys
  // are the accepted contracts' componentSetKey anchors.
  const byIdAll = new Map(contracts.map((c) => [c.id, c]));
  for (const { slot, part } of slotsOf(contract)) {
    const propertyName = slotFigmaProperty(slot);
    // Multi-child slot (defaultContent > 1): inexpressible as INSTANCE_SWAP —
    // no property expected; instead the content components must exist as
    // nested instances. (Native SLOT property is the migration target.)
    if ((slot.defaultContent?.length ?? 0) > 1) {
      for (const id of new Set(slot.defaultContent!.map((i) => i.id))) {
        const dep = byIdAll.get(id)!;
        const depName = nestedInstanceName(dep);
        if (!(set.nestedInstances ?? []).includes(depName)) {
          add({
            surface: 'figma',
            classification: 'behind',
            subject: `${contract.name}.${depName}`,
            detail: `Multi-child slot "${slot.name}" declares ${id} default content but no ${depName} instance exists inside the Figma component`,
            remedy: 'Re-run the component sync script',
          });
        }
      }
      continue;
    }
    expectedNames.add(propertyName);
    const def = figmaProps.get(propertyName);
    if (!def) {
      add({
        surface: 'figma',
        classification: 'behind',
        subject: `${contract.name}.${propertyName}`,
        detail: `Contract slot "${slot.name}" has no INSTANCE_SWAP property on the Figma component`,
        remedy: 'Re-run the component sync script',
      });
    } else if (slot.accepts && slot.accepts.length > 0) {
      const expectedKeys = slot.accepts
        .map((id) => byIdAll.get(id)?.anchors.figma.componentSetKey)
        .filter((k): k is string => Boolean(k))
        .sort();
      const gotKeys = (def.preferredValues ?? []).map((p) => p.key).sort();
      if (expectedKeys.length > 0 && expectedKeys.join('|') !== gotKeys.join('|')) {
        add({
          surface: 'figma',
          classification: 'mismatch',
          subject: `${contract.name}.${propertyName} (accepts)`,
          detail: `Slot accepts [${slot.accepts.join(', ')}] but Figma preferredValues keys differ`,
          remedy: 'Adopt into contract (promotion) or re-sync preferredValues',
        });
      }
    }
    if (part.optional) {
      const visibilityName = slotVisibilityProperty(slot);
      expectedNames.add(visibilityName);
      if (!figmaProps.get(visibilityName)) {
        add({
          surface: 'figma',
          classification: 'behind',
          subject: `${contract.name}.${visibilityName}`,
          detail: `Optional slot "${slot.name}" has no visibility BOOLEAN on the Figma component`,
          remedy: 'Re-run the component sync script',
        });
      }
    }
  }

  // Nested component refs: the composing instance must exist in Figma.
  for (const { ref } of componentRefsOf(contract)) {
    const dep = byIdAll.get(ref.id)!;
    const depName = nestedInstanceName(dep);
    if (!(set.nestedInstances ?? []).includes(depName)) {
      add({
        surface: 'figma',
        classification: 'behind',
        subject: `${contract.name}.${depName}`,
        detail: `Contract composes ${ref.id} but no ${depName} instance exists inside the Figma component`,
        remedy: 'Re-run the component sync script',
      });
    }
  }

  for (const [name, def] of figmaProps) {
    if (expectedNames.has(name)) continue;
    // A hand-built State variant axis WITHOUT the contract opt-in is the
    // kit-rot pattern state previews exist to replace: someone manually
    // built "State=Hover" variants because Figma can't run pseudo-classes,
    // and those rot. Propose adoption (the one-field opt-in regenerates
    // them from the contract's state token overrides), never a bogus prop.
    if (name === STATE_PREVIEW_PROPERTY && def.type === 'VARIANT' && !contract.figmaStatePreviews) {
      add({
        surface: 'figma',
        classification: 'ahead',
        subject: `${contract.name}.${STATE_PREVIEW_PROPERTY}`,
        detail: `Figma set carries a hand-built ${STATE_PREVIEW_PROPERTY} variant axis [${(def.variantOptions ?? []).join(', ')}] the contract does not declare — hand-maintained state previews rot; the contract can own them`,
        ...(contract.states.length > 0 ? { proposedPatch: { figmaStatePreviews: true } } : {}),
        remedy:
          contract.states.length > 0
            ? `Adopt: set "figmaStatePreviews": true in contracts/${contract.id.replace(/^[^.]+\./, '')}.contract.json (bump minor), npm run figma:plan, re-sync — or retire the hand-built axis`
            : 'Declare interaction states + root token overrides in the contract (then opt into figmaStatePreviews), or retire the hand-built axis',
      });
      continue;
    }
    add({
      surface: 'figma',
      classification: 'ahead',
      subject: `${contract.name}.${name}`,
      detail: `Figma set declares ${def.type} property "${name}" the contract does not define`,
      proposedPatch: {
        name: name.toLowerCase(),
        type: def.type === 'BOOLEAN' ? 'boolean' : def.type === 'TEXT' ? 'text' : { enum: def.variantOptions },
        bindings: { figma: { kind: def.type, property: name }, code: { prop: name.toLowerCase() } },
      },
      remedy: `Review + append to the contract props[], bump version, then npm run build`,
    });
  }
}

// ---------------------------------------------------------------------------
// 3 · figma variables ⟷ tokens/
// ---------------------------------------------------------------------------

type TokenLeaf = { value: unknown };
function flatten(tree: Record<string, unknown>, prefix: string[] = [], out = new Map<string, unknown>()) {
  for (const [key, value] of Object.entries(tree)) {
    if (key.startsWith('$')) continue;
    if (value && typeof value === 'object') {
      if ('$value' in value) out.set([...prefix, key].join('/'), (value as TokenLeaf & { $value: unknown }).$value);
      else flatten(value as Record<string, unknown>, [...prefix, key], out);
    }
  }
  return out;
}
const readTokens = (p: string) => flatten(JSON.parse(readFileSync(path.join(ROOT, p), 'utf8')));

const primitives = readTokens('tokens/primitives.tokens.json');
const semantic = readTokens('tokens/semantic.tokens.json');
const light = readTokens('tokens/modes/semantic.light.tokens.json');
// Mono-theme (Piqueray): the dark-mode file is optional — absent means no overrides.
const dark = existsSync(path.join(ROOT, 'tokens/modes/semantic.dark.tokens.json'))
  ? readTokens('tokens/modes/semantic.dark.tokens.json')
  : new Map<string, unknown>();

/** Normalize a token value for comparison against the Figma snapshot. */
function norm(v: unknown): string {
  if (typeof v === 'string') {
    const alias = v.match(/^\{([^}]+)\}$/);
    if (alias) return `{${alias[1].split('.').join('/')}}`; // dot → slash paths
    if (/^#[0-9a-f]{6}$/i.test(v)) return v.toUpperCase();
    const px = v.match(/^(-?[\d.]+)px$/);
    if (px) return px[1];
    return v;
  }
  return String(v);
}

/**
 * Same token value on both sides?
 *
 * Numbers get a SINGLE-PRECISION comparison, and that is not a tolerance — it is
 * the exact arithmetic of the storage. Figma keeps FLOAT variables in float32:
 * write 284.4 and the file gives back 284.3999938964844. Comparing the two as
 * STRINGS ("284.4" vs "284.3999938964844") reports a mismatch that does not
 * exist, and no re-run can ever clear it — the differ would demand a correction
 * for a value that is already correct.
 *
 * `Math.fround` maps a double onto the float32 it becomes once stored, so this
 * compares what tokens/ MEANS against what Figma CAN HOLD. It stays strict:
 * fround(284.4) !== fround(284.5), and fround(364) !== fround(363.5).
 *
 * Found by 016 (lot L-DW002) when minting `size.reassurances.carte-cinq-cartes`
 * = 284.4px — the first token in the foundation whose decimal is not a negative
 * power of two (every earlier one was a .5, which float32 holds exactly, which
 * is why the defect had lain dormant). Same class as the v4 alpha fix in
 * `parity/extract-figma.plugin.js`: the instrument inventing drift that does not
 * exist. The rule there applies here — the instrument is what gets fixed.
 */
function memeValeur(want: unknown, got: unknown): boolean {
  const nombre = (x: unknown): number | null => {
    if (typeof x === 'number') return x;
    if (typeof x === 'string') {
      const m = x.match(/^(-?[\d.]+)px$/) ?? x.match(/^(-?\d+(?:\.\d+)?)$/);
      if (m) return Number(m[1]);
    }
    return null;
  };
  const a = nombre(want), b = nombre(got);
  if (a !== null && b !== null && Number.isFinite(a) && Number.isFinite(b)) {
    return Math.fround(a) === Math.fround(b);
  }
  return norm(want) === norm(got);
}

const figmaVarsByCollection = new Map<string, Map<string, FigmaVariable>>();
for (const col of figmaTokens.collections) {
  figmaVarsByCollection.set(col.name, new Map(col.variables.map((v) => [v.name, v])));
}

// ---------------------------------------------------------------------------
// Brownfield naming — the file may not use OUR collection/mode names.
//
// figma-sync/01-tokens.js CREATES `Primitives` (mode "Value"), `Brand`, and
// `Semantic` (modes "Light"/"Dark"). A file the repo did NOT generate — a
// brownfield adoption — names things its own way: Piqueray ships ONE
// collection literally called "Variable collection" with a single mode
// "Mode 1". A name-keyed join then reports every variable as absent while it
// sits right there in the file, which is a false verdict, not a gap.
//
// So a SINGLE-collection file is treated as the flat primitives tier it is,
// and a single-mode collection answers for whichever mode is asked. Both
// substitutions are RECORDED and printed — a silent rename would be a worse
// bug than the one it fixes, and the owner must be able to see that the join
// only worked because we bridged two vocabularies.
// ---------------------------------------------------------------------------

const namingBridges: string[] = [];
/** Collections already answering for a tier — by exact name OR by bridge. */
const claimedCollections = new Set<string>();

function resolveCollection(expected: string): string | null {
  if (figmaVarsByCollection.has(expected)) {
    claimedCollections.add(expected);
    return expected;
  }
  if (figmaTokens.collections.length !== 1) return null;
  const only = figmaTokens.collections[0].name;
  // Answer for ONE tier only. Letting the same collection stand in for
  // `Primitives` *and* `Brand`/`Semantic` would report every one of its
  // variables as `ahead` of the tier that legitimately has no counterpart —
  // which is exactly what happened the first time this ran against a file
  // whose collection WAS named `Primitives`: the bridge then fired for
  // `Brand` and invented 14 phantom `ahead` findings.
  if (claimedCollections.has(only)) return null;
  claimedCollections.add(only);
  namingBridges.push(
    `collection "${expected}" does not exist in the file — matched against its only collection, "${only}"`,
  );
  return only;
}

function checkTokens(
  collection: string,
  expected: Array<{ path: string; perMode: Record<string, unknown> }>,
) {
  const actualName = resolveCollection(collection);
  const figmaVars = (actualName ? figmaVarsByCollection.get(actualName) : undefined) ?? new Map<string, FigmaVariable>();
  const actualModes = actualName ? (figmaTokens.collections.find((c) => c.name === actualName)?.modes ?? []) : [];
  const expectedPaths = new Set<string>();
  for (const { path: tokenPath, perMode } of expected) {
    expectedPaths.add(tokenPath);
    const v = figmaVars.get(tokenPath);
    if (!v) {
      add({
        surface: 'figma-tokens',
        classification: 'behind',
        subject: `${collection}/${tokenPath}`,
        detail: 'Token exists in tokens/ but has no Figma variable',
        remedy: 'Re-run figma-sync token script (or figma_import_tokens ≥1.34 with creation support)',
      });
      continue;
    }
    for (const [mode, want] of Object.entries(perMode)) {
      // Same bridge, one tier down: a single-mode collection answers for
      // whichever mode name we asked for. Recorded, never silent.
      let readMode = mode;
      if (!(mode in v.values) && actualModes.length === 1) {
        readMode = actualModes[0];
        const note = `mode "${mode}" does not exist in collection "${actualName}" — read from its only mode, "${readMode}"`;
        if (!namingBridges.includes(note)) namingBridges.push(note);
      }
      const got = v.values[readMode];
      if (!memeValeur(want, got)) {
        add({
          surface: 'figma-tokens',
          classification: 'mismatch',
          subject: `${collection}/${tokenPath} [${mode}]`,
          detail: `tokens/ says ${norm(want)}, Figma says ${norm(got)}`,
          proposedPatch: { tokenPath: tokenPath.split('/').join('.'), mode, adoptFigmaValue: got },
          remedy: 'Adopt into tokens/ (promotion) then npm run tokens — or push tokens/ to Figma via figma_import_tokens',
        });
      }
    }
  }
  for (const name of figmaVars.keys()) {
    if (!expectedPaths.has(name)) {
      add({
        surface: 'figma-tokens',
        classification: 'ahead',
        subject: `${collection}/${name}`,
        detail: 'Figma variable has no counterpart in tokens/',
        remedy: 'Review + add to tokens/ (promotion) or delete the variable',
      });
    }
  }
}

checkTokens(
  'Primitives',
  [...primitives].map(([p, v]) => ({ path: p, perMode: { Value: v } })),
);
// Brand collection: one mode per tokens/modes/brand.*.tokens.json file.
const brandFiles = readdirSync(path.join(ROOT, 'tokens', 'modes'))
  .filter((f) => /^brand\.[a-z][a-z0-9-]*\.tokens\.json$/.test(f))
  .sort();
const brandModeMaps = brandFiles.map((f) => ({
  mode: f.replace(/^brand\.|\.tokens\.json$/g, '').replace(/^./, (c) => c.toUpperCase()),
  tokens: readTokens(`tokens/modes/${f}`),
}));
if (brandModeMaps.length > 0) {
  const first = brandModeMaps[0].tokens;
  checkTokens(
    'Brand',
    [...first.keys()].map((p) => ({
      path: p,
      perMode: Object.fromEntries(brandModeMaps.map(({ mode, tokens }) => [mode, tokens.get(p)])),
    })),
  );
}
checkTokens('Semantic', [
  ...[...semantic].map(([p, v]) => ({ path: p, perMode: { Light: v, Dark: v } })),
  ...[...light].map(([p, v]) => ({ path: p, perMode: { Light: v, Dark: dark.get(p) } })),
]);

// ---------------------------------------------------------------------------
// 4 · icon registry ⟷ code assets ⟷ canvas masters (002-governed-icons-button)
//
// The registry pivots the three-way check (D4): every registry entry needs
// a code asset AND a canvas master (by KEY — stable across renames); an
// asset with no registry entry, or a canvas master the Button's swap menu
// offers with no registry entry, is a named `ahead` finding (Figma-first,
// FR-008) — acknowledgeable via parity/baseline.json exactly like any other
// axis when the divergence is a recorded owner decision (e.g. the excluded
// zero-usage mail/external-link icons). The MENU axis itself (registry ↔
// Button's actual chosen enum values) lands at Step 3 — Button v1.2 has no
// icon-choice enum prop yet, so that comparison naturally finds nothing to
// check today, not because it is special-cased out.
// ---------------------------------------------------------------------------

const iconRegistryPath = path.join(ROOT, 'contracts', 'icons.registry.json');
if (existsSync(iconRegistryPath)) {
  const registry: {
    id: string;
    version: string;
    icons: Array<{ name: string; figma: { componentName: string; key: string; nodeId: string }; asset: string; size: number; description: string }>;
  } = JSON.parse(readFileSync(iconRegistryPath, 'utf8'));

  const assetsDir = path.join(ROOT, 'assets', 'icons');
  const codeAssets = new Set(
    existsSync(assetsDir) ? readdirSync(assetsDir).filter((f) => f.endsWith('.svg')).map((f) => f.replace(/\.svg$/, '')) : [],
  );
  const canvasByKey = new Map(figmaComponents.sets.map((s) => [s.key, s]));

  // The Button's swap-menu universe: any key its INSTANCE_SWAP properties
  // offer (Glyphe gauche/droite carry the identical 15) — derived from the
  // live snapshot, not a hardcoded id list, so a future 16th icon added to
  // the menu is picked up automatically.
  const bouton = figmaComponents.sets.find((s) => s.name === 'Bouton');
  const swapCandidateKeys = new Set<string>();
  if (bouton) {
    for (const [propKey, def] of Object.entries(bouton.properties)) {
      if (propKey.startsWith('Glyphe') && def.preferredValues) {
        for (const pv of def.preferredValues) swapCandidateKeys.add(pv.key);
      }
    }
  }

  for (const icon of registry.icons) {
    if (!codeAssets.has(icon.asset)) {
      add({
        surface: 'icons',
        classification: 'behind',
        subject: `ds.icons/${icon.name}`,
        detail: `registry entry has no code asset assets/icons/${icon.asset}.svg`,
        remedy: 'Re-run npm run extract:figma:rest:svg to acquire the asset',
      });
    }
    const canvasSet = canvasByKey.get(icon.figma.key);
    if (!canvasSet) {
      add({
        surface: 'icons',
        classification: 'behind',
        subject: `ds.icons/${icon.name}`,
        detail: `registry entry (key ${icon.figma.key}) has no matching master in the committed canvas snapshot`,
        remedy: 'Re-run the parity Figma extraction (parity/extract-figma.plugin.js) and re-check',
      });
    } else if (canvasSet.name !== icon.figma.componentName) {
      add({
        surface: 'icons',
        classification: 'mismatch',
        subject: `ds.icons/${icon.name}`,
        detail: `registry says the master is named "${icon.figma.componentName}", canvas snapshot says "${canvasSet.name}"`,
        remedy: 'Adopt the canvas name into the registry (promotion) or rename the Figma master back',
      });
    }
  }

  const registryAssetNames = new Set(registry.icons.map((i) => i.asset));
  // v17 (spec 004, D7): an asset a catalog contract consumes through a FIXED
  // (non-templated) icon.asset — a component-private glyph like the Checkbox's
  // « check » — is not an orphan even without a registry entry. It is still
  // Figma-born (exported read-only from the master's own Vector) and is
  // deliberately outside the governed icon registry. Enum-templated icon
  // assets ({glyph}) stay registry-governed and are NOT swept in here. An
  // asset that is NEITHER registry-listed NOR consumed remains a finding.
  const consumedAssets = new Set<string>();
  const governedDynamicAssets = new Set<string>();
  for (const c of contracts) {
    for (const { part } of walkAnatomy(c)) {
      const asset = part.icon?.asset;
      if (!asset) continue;
      const dynamic = asset.match(/^\{([^}]+)\}$/);
      if (!dynamic) {
        consumedAssets.add(asset);
        continue;
      }
      const prop = c.props.find((candidate) => candidate.name === dynamic[1]);
      if (prop && isEnum(prop)) {
        for (const value of prop.type.enum) governedDynamicAssets.add(value);
      }
    }
  }
  for (const asset of codeAssets) {
    if (!registryAssetNames.has(asset) && (!consumedAssets.has(asset) || governedDynamicAssets.has(asset))) {
      add({
        surface: 'icons',
        classification: 'ahead',
        subject: `assets/icons/${asset}.svg`,
        detail: 'code has an icon asset with no registry entry (Figma-first: every icon is born in Figma, FR-008)',
        remedy: 'Review: add to the registry (promotion, requires a Figma master) or delete the orphaned asset',
      });
    }
  }

  const registryKeys = new Set(registry.icons.map((i) => i.figma.key));
  for (const key of swapCandidateKeys) {
    if (registryKeys.has(key)) continue;
    const set = canvasByKey.get(key);
    add({
      surface: 'icons',
      classification: 'ahead',
      subject: `figma/${set?.name ?? key}`,
      detail: "canvas offers this icon in the Button's swap menu but ds.icons has no entry for it",
      remedy: 'Review: add to the registry (promotion) or leave excluded — acknowledge in parity/baseline.json if intentional',
    });
  }
}

// ---------------------------------------------------------------------------
// Report — triage before firehose.
//
// Baseline: parity/baseline.json (optional) is an array of finding keys
// ("surface|classification|subject"). Baselined findings are ACKNOWLEDGED —
// reported in their own section, excluded from the exit code — so a team can
// ratchet down known drift without the check going permanently red.
// ---------------------------------------------------------------------------

const findingKey = (f: Finding) => `${f.surface}|${f.classification}|${f.subject}`;

let baseline = new Set<string>();
const baselinePath = path.join(ROOT, 'parity', 'baseline.json');
try {
  const parsed = JSON.parse(readFileSync(baselinePath, 'utf8'));
  if (Array.isArray(parsed) && parsed.every((k) => typeof k === 'string')) {
    baseline = new Set(parsed);
  } else {
    console.warn('⚠ parity/baseline.json exists but is not an array of "surface|classification|subject" strings — ignored.');
  }
} catch {
  /* no baseline — every finding counts */
}

const acknowledged = findings.filter((f) => baseline.has(findingKey(f)));
const active = findings.filter((f) => !baseline.has(findingKey(f)));

// Summary: counts by surface × classification (active findings only —
// acknowledged drift is counted separately).
const bySurface: Record<string, Record<string, number>> = {};
for (const f of active) {
  bySurface[f.surface] ??= {};
  bySurface[f.surface][f.classification] = (bySurface[f.surface][f.classification] ?? 0) + 1;
}
const summary = { total: active.length, acknowledged: acknowledged.length, pending: pending.length, bySurface };

writeFileSync(
  path.join(ROOT, 'parity', 'report.json'),
  JSON.stringify(
    {
      summary,
      findings: active,
      acknowledged,
      pending,
      checkedContracts: contracts.map((c) => `${c.id}@${c.version}`),
      // Vocabulary bridges the join had to make (brownfield collection/mode
      // names). Empty means the file uses this repo's own naming. Carried in
      // the report so surfaces that render it can show the reader that the
      // comparison only lined up because two vocabularies were bridged.
      namingBridges,
    },
    null,
    2,
  ) + '\n',
);

if (namingBridges.length > 0) {
  console.log('⚠ Figma naming bridged (the file does not use this repo\'s collection/mode names):');
  for (const b of namingBridges) console.log(`    · ${b}`);
  console.log('');
}

const printFinding = (f: Finding) => {
  console.log(`  [${f.surface} ${f.classification.toUpperCase()}] ${f.subject}`);
  console.log(`    ${f.detail}`);
  if (f.proposedPatch) console.log(`    proposed patch: ${JSON.stringify(f.proposedPatch)}`);
  console.log(`    → ${f.remedy}\n`);
};

const printPending = () => {
  if (pending.length === 0) return;
  console.log(`  — pending first sync (no design anchor yet; does not fail the check) —\n`);
  for (const p of pending) {
    console.log(`  [figma PENDING] ${p.subject}`);
    console.log(`    ${p.detail}`);
    console.log(`    → ${p.remedy}\n`);
  }
};

if (active.length === 0 && acknowledged.length === 0) {
  console.log(`✔ Parity clean — code, Figma, and tokens all match the contract.${pending.length > 0 ? ` (${pending.length} contract(s) pending first sync.)` : ''}`);
  printPending();
  process.exit(0);
}

// Summary header first: surface × classification counts.
if (active.length > 0) {
  console.log(`✖ ${active.length} drift finding(s)${acknowledged.length > 0 ? ` (+${acknowledged.length} acknowledged in parity/baseline.json)` : ''}:`);
} else {
  console.log(`✔ No new drift — ${acknowledged.length} acknowledged finding(s) remain in parity/baseline.json.`);
}
for (const [surface, byClass] of Object.entries(bySurface)) {
  const parts = Object.entries(byClass).map(([c, n]) => `${c}: ${n}`);
  console.log(`    ${surface} — ${parts.join(', ')}`);
}
console.log('');

const MAX_CONSOLE_FINDINGS = 50;
for (const f of active.slice(0, MAX_CONSOLE_FINDINGS)) printFinding(f);
if (active.length > MAX_CONSOLE_FINDINGS) {
  console.log(`  …and ${active.length - MAX_CONSOLE_FINDINGS} more (see parity/report.json)\n`);
}

if (acknowledged.length > 0) {
  console.log(`  — acknowledged (baselined, does not fail the check) —\n`);
  for (const f of acknowledged.slice(0, MAX_CONSOLE_FINDINGS)) printFinding(f);
  if (acknowledged.length > MAX_CONSOLE_FINDINGS) {
    console.log(`  …and ${acknowledged.length - MAX_CONSOLE_FINDINGS} more acknowledged (see parity/report.json)\n`);
  }
}
printPending();

process.exit(active.length > 0 ? 1 : 0);
