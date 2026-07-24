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
 * contracts. Button + the four spec-004 input atoms (Input/Textarea/Select/
 * Checkbox) are the current governed set.
 */
import type { ReactNode } from 'react';
import { Button, Input, Textarea, Select, Checkbox } from '../../src/components';
import type { ButtonProps, InputProps, TextareaProps, SelectProps, CheckboxProps } from '../../src/components';

/** Default text children/value per component, used when no override is supplied. */
export const SAMPLE_TEXT: Record<string, string> = {
  Button: 'Contactez-nous',
  Input: 'Texte de saisie',
  Textarea: 'Texte de saisie',
  Select: 'Texte de saisie',
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

    // The atoms carry their text as the `value` PROP (not children), so the
    // playground's `value` control drives them through {...props} — NOT the
    // childText path (which is for text-children components like Button). No
    // hardcoded value/checked override: that would shadow the control, and a
    // fixed default would disagree with what the control shows. The component's
    // own contract-default renders when props is empty (the list previews); the
    // detail playground drives it live through props.
    case 'Input':
      return <Input {...(props as InputProps)} />;

    case 'Textarea':
      return <Textarea {...(props as TextareaProps)} />;

    case 'Select':
      return <Select {...(props as SelectProps)} />;

    case 'Checkbox':
      return <Checkbox {...(props as CheckboxProps)} />;

    default:
      return <span className="muted">No sample available.</span>;
  }
}
