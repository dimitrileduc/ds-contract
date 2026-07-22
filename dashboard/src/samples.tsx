/**
 * Live rendering of the REAL generated design-system components.
 * The dashboard dogfoods the library it documents: every sample below is the
 * actual component from src/components, driven by contract-legal props only.
 *
 * HAND-AUTHORED, NOT GENERATED — and a HARDCODED component list. This file is
 * the dashboard's live-render registry: it must be extended by hand whenever a
 * component is added to `contracts/`. The rest of the dashboard IS glob-driven
 * over `contracts/*.contract.json`; this registry is the one place that is not,
 * because a live render needs a real import and real prop shapes, which a glob
 * cannot supply. A component with no case here still lists and documents
 * normally — it simply renders "No sample available" instead of a preview.
 *
 * Piqueray reconversion: the 51 demo samples were removed with the demo
 * contracts (they imported components that no longer exist, which crashed the
 * dashboard at load). Only the Button remains.
 */
import type { ReactNode } from 'react';
import { Button } from '../../src/components';
import type { ButtonProps } from '../../src/components';

/** Default text children per component, used when no override is supplied. */
export const SAMPLE_TEXT: Record<string, string> = {
  Button: 'Contactez-nous',
};

export function renderSample(
  name: string,
  props: Record<string, unknown> = {},
  childText?: string,
): ReactNode {
  const text = (fallback: string) =>
    childText !== undefined && childText !== '' ? childText : fallback;

  switch (name) {
    case 'Button':
      return <Button {...(props as ButtonProps)}>{text('Contactez-nous')}</Button>;

    default:
      return <span className="muted">No sample available.</span>;
  }
}
