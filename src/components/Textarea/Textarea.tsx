/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/textarea.contract.json (ds.textarea v1.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import styles from './Textarea.module.css';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  value?: string;
}

/** Piqueray multi-line text input. Extracted from the owner-validated Figma master « Textarea » (DS · Atomes, built in spec 003), reviewed and adopted — not authored.

Same native-control bridge as Input: the « Valeur » TEXT property drives the shown text, drawn on the canvas as a text child and carried in code through defaultValue on the native <textarea>. Differs from Input only in shape: a fixed 128px height and top-aligned text (the canvas frame's counter axis is MIN, not CENTER).

Box styling binds to Piqueray primitives where a token exists; the values the token scale does not carry (12px padding, 1px border, 24px line-height, square 0 radius, 128px height) ride the honest `literals` channel, named. Atom scope only: no label, no state axes — the Field molecule owns them. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { value = 'Texte de saisie', className, children, ...rest },
  ref,
) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return <textarea ref={ref} className={classes} defaultValue={String(value)} {...rest} />;
});
