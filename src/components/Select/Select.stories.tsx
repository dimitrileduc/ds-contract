/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/select.contract.json (ds.select v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './Select';

const meta = {
  title: 'Atoms/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray select. Extracted from the owner-validated Figma master « Select » (DS · Atomes, built in spec 003), reviewed and adopted — not authored.\n\nWrapper pattern (same spirit as Checkbox): the box is presentational, a REAL native <select> inside carries the value and the accessibility, and the Piqueray chevron is a sibling icon — a native <select> cannot hold a custom chevron, so the wrapper gives the exact look AND native semantics. The consumer (Field molecule / form) supplies the real options; the atom shows « Valeur » as the placeholder.\n\nThe chevron is the governed registry icon `chevron-down` (size 24, an instance in the master — reused, never copied). Box styling binds to Piqueray primitives where a token exists; off-scale values (12px padding, 1px border, 24px line-height, square 0 radius) ride the honest `literals` channel. Atom scope only — no label, no state axes (the Field molecule owns them).',
      },
    },
  },
  render: (args) => <Select key={JSON.stringify(args)} {...args} />,
  argTypes: {
    value: { control: 'text' },
  },
  args: {
    value: 'Texte de saisie',
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
