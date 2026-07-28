/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/piqueray-logo.contract.json (ds.piqueray-logo v0.1.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PiquerayLogo } from './PiquerayLogo';

const meta = {
  title: 'Components/PiquerayLogo',
  component: PiquerayLogo,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'PROPOSED contract extracted from the design canvas (extract/figma dump v1) — API, anatomy, and token bindings inverted from the drawn structure. Semantics beyond the name/axis inference table, a11y, events, and slot accepts are not canvas-recoverable; review before adoption.',
      },
    },
  },
  render: (args) => <PiquerayLogo key={JSON.stringify(args)} {...args} />,
  argTypes: {
    couleur: { control: 'select', options: ['default', 'blanc'] },
  },
  args: {
    couleur: 'default',
  },
} satisfies Meta<typeof PiquerayLogo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Default: Story = {
  args: { couleur: 'default' },
};

export const Blanc: Story = {
  args: { couleur: 'blanc' },
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
      <PiquerayLogo couleur="default" />
      <PiquerayLogo couleur="blanc" />
    </div>
  ),
};
