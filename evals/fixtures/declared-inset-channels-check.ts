/**
 * Inset channels for an absolutely positioned part.
 *
 * `position: absolute`已 joined the declared grammar for inset overlays, but
 * the insets themselves had no unconditional spelling: they could only ride a
 * `stylesWhen` block gated on a prop (ds.devis' Voile rides `fond`).  A part
 * that is absolute in Figma at (0,0) with no governing prop therefore landed
 * at its STATIC position — the parent's content-box origin — which is offset
 * by the parent's padding.
 *
 * ds.footer is the receipt: its Background plane is ABSOLUTE 1728×459 covering
 * the whole master, while the root carries 89px of horizontal padding.  Given
 * only `position: absolute`, the plane painted from (89, 128) and overflowed
 * the capture viewport by exactly those 89px — the audit harness refused the
 * render rather than crop it.  Without insets the contract had to choose
 * between a faithful RENDER (move the padding somewhere Figma doesn't have it)
 * and a faithful DECLARATION (keep the padding, render the wrong box).  That
 * choice is the defect; carrying the fact removes it.
 *
 * This fixture pins:
 *   - the four inset channels validate and reach the generated CSS verbatim;
 *   - their value grammar is bounded, and anything outside refuses BY NAME;
 *   - an inset on a part that is NOT positioned refuses — CSS would silently
 *     ignore it, and a silently ignored fact is a false receipt.
 */
import { ContractSchema } from '../../scripts/contract-schema.js';
import { generateCss, validateContract } from '../../core/emit-react.js';

const build = (declared: Record<string, string>) =>
  ContractSchema.parse({
    id: 'fixture.declared-inset',
    name: 'DeclaredInset',
    version: '1.0.0',
    status: 'draft',
    description: 'Bounded inset-channel fixture for an absolutely positioned plane.',
    semantics: { element: 'div' },
    props: [],
    states: [],
    anatomy: {
      root: {
        declared: { position: 'relative' },
        literals: { 'padding-left': '89px', 'padding-right': '89px' },
        parts: { plane: { declared, literals: { height: '459px' } } },
      },
    },
    anchors: {
      figma: { fileKey: null, componentSetKey: null },
      code: { importPath: 'src/components/DeclaredInset', export: 'DeclaredInset' },
    },
  });

// ---- the four channels are carried, unconditionally ----------------------
const ok = build({ position: 'absolute', top: '0', right: '0', bottom: '0', left: '0' });
const errors: string[] = [];
validateContract(ok, new Map([[ok.id, ok]]), errors, new Map());
if (errors.length > 0) {
  throw new Error(`a valid inset-0 plane was refused: ${errors.join('; ')}`);
}

const cssErrors: string[] = [];
const css = generateCss(ok, new Set(), cssErrors);
if (cssErrors.length > 0) throw new Error(`CSS generation failed: ${cssErrors.join('; ')}`);
for (const decl of ['top: 0', 'right: 0', 'bottom: 0', 'left: 0']) {
  if (!css.includes(decl)) {
    throw new Error(`generated CSS dropped "${decl}" — the plane would fall back to its static origin:\n${css}`);
  }
}

// ---- the grammar accepts real measurements, not arbitrary text ------------
for (const value of ['0', '0px', '12px', '-8px', '50%', 'auto', '1.5rem']) {
  const contract = build({ position: 'absolute', top: value });
  const errs: string[] = [];
  validateContract(contract, new Map([[contract.id, contract]]), errs, new Map());
  if (errs.length > 0) throw new Error(`inset value "${value}" must be accepted: ${errs.join('; ')}`);
}

for (const value of ['calc(100% - 4px)', 'inherit', 'red', '10', 'top', '0 0', 'var(--x)']) {
  const contract = build({ position: 'absolute', top: value });
  const errs: string[] = [];
  validateContract(contract, new Map([[contract.id, contract]]), errs, new Map());
  if (errs.length === 0) throw new Error(`inset value "${value}" must be refused`);
  if (!errs.some((e) => e.includes('top'))) {
    throw new Error(`the refusal of "${value}" must name the channel; got: ${errs.join('; ')}`);
  }
}

// ---- an inset without positioning is a fact CSS would silently drop -------
for (const position of ['static', undefined]) {
  const declared: Record<string, string> = { top: '0' };
  if (position) declared.position = position;
  const contract = build(declared);
  const errs: string[] = [];
  validateContract(contract, new Map([[contract.id, contract]]), errs, new Map());
  if (errs.length === 0) {
    throw new Error(
      `an inset on a part with position="${String(position)}" must be refused — CSS ignores it, so the contract would carry a fact that never renders`,
    );
  }
}

console.log(
  '✔ declared inset channels (top/right/bottom/left) are carried unconditionally into the generated CSS, bounded by a real length grammar, and refused by name on a part that is not positioned',
);
