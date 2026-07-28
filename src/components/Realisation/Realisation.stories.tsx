/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/realisation.contract.json (ds.realisation v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Realisation } from './Realisation';

const meta = {
  title: 'Molecules/Realisation',
  component: Realisation,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray Realisation. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. IMAGE fills are instance overrides in Figma; src/alt are explicit code semantics.',
      },
    },
  },
  render: (args) => <Realisation key={JSON.stringify(args)} {...args} />,
  argTypes: {
    taille: { control: 'select', options: ['grand', 'petit'] },
    imageUrl: { control: 'text' },
    imageAlt: { control: 'text' },
  },
  args: {
    taille: 'grand',
    imageUrl: '',
    imageAlt: '',
  },
} satisfies Meta<typeof Realisation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Grand: Story = {
  args: { taille: 'grand' },
};

export const Petit: Story = {
  args: { taille: 'petit' },
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
      <Realisation taille="grand" />
      <Realisation taille="petit" />
    </div>
  ),
};
