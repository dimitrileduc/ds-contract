/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/input.contract.json (ds.input v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';

const meta = {
  title: 'Atoms/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Piqueray single-line text input. Extracted from the owner-validated Figma master « Input » (DS · Atomes, built in spec 003), reviewed and adopted — not authored.\n\nThe shown text binds to the « Valeur » TEXT property EXACTLY as the Button's label binds to « Libellé » — one bound text prop, drawn on the canvas, carried in code. Because the code element is a native <input> (a void element), that same value renders through defaultValue on a self-closing tag rather than as a child.\n\nBox styling (white fill, blue-grey 1px border, square corners, 12px padding, 14px Regular Montserrat, text color noir) binds to Piqueray primitives where a token exists; the values the token scale does not carry (12px padding, 1px border, 24px line-height, square 0 radius) ride the honest `literals` channel, named rather than force-fit.\n\nAtom scope only: no label, no help text, no required/disabled/state axes — the master exposes none (the Field molecule owns them).",
      },
    },
  },
  argTypes: {
    value: { control: 'text' },
  },
  args: {
    value: 'Texte de saisie',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
