/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/piqueray-logo.contract.json (ds.piqueray-logo v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PiquerayLogo } from './PiquerayLogo';

const meta = {
  title: 'Atoms/PiquerayLogo',
  component: PiquerayLogo,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray logo. Two Couleur variants, extracted from the Figma COMPONENT_SET « PiquerayLogo » on DS · Atomes, reviewed and adopted — not authored. The orange marque is constant; only the wordmark ink changes with Couleur — Default is the blue wordmark, Blanc the white wordmark for a dark surface (ds.header composes the Blanc variant on its noir-bleuté nav).',
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
