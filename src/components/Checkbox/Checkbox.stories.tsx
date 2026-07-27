/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/checkbox.contract.json (ds.checkbox v1.0.1)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Piqueray checkbox. Extracted from the owner-validated Figma COMPONENT_SET « Checkbox » (DS · Atomes, built in spec 003), reviewed and adopted — not authored.\n\nAccessible custom control (the demo-51 pattern, adapted): the visual box is presentational (border/fill follow the « Coche » variant), a REAL native <input type=\"checkbox\"> sits inside for accessibility (« Canvas: not drawn » — semantics don't draw), and the custom check glyph is a sibling shown only when checked. This keeps the exact Piqueray look AND native semantics; the wrapping label is the Field molecule's job.\n\nThe check glyph is check.svg, exported from the master's real Vector node (2053:1255) — an internal glyph consumed by this contract, deliberately OUTSIDE the governed icon registry (which stays at its governed count). Modeled ONLY as the master exposes it: a Non/Oui variant, no label, no size axis, no indeterminate state, no declared event — the Field molecule owns those.",
      },
    },
  },
  render: (args) => <Checkbox key={JSON.stringify(args)} {...args} />,
  argTypes: {
    checked: { control: 'select', options: ['non', 'oui'] },
  },
  args: {
    checked: 'non',
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Non: Story = {
  args: { checked: 'non' },
};

export const Oui: Story = {
  args: { checked: 'oui' },
};
/** Every legal combination the contract defines. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(1, max-content)',
        alignItems: 'center',
        justifyItems: 'start',
      }}
    >
      <Checkbox checked="non" />
      <Checkbox checked="oui" />
    </div>
  ),
};
