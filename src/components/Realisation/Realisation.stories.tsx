/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/realisation.contract.json (ds.realisation v1.1.0)
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
          'Piqueray Realisation. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. Figma IMAGE FILL maps to object-fit: cover; IMAGE fills are instance overrides in Figma and src/alt are explicit code semantics.',
      },
    },
  },
  render: (args) => <Realisation key={JSON.stringify(args)} {...args} />,
  argTypes: {
    taille: {
      control: 'select',
      options: ['grand', 'petit'],
      description:
        'Observed Figma VARIANT `Taille`: Grand has a 743×743 image plane and Petit has a 339.5×339.5 image plane. This axis selects image geometry only; the visible IMAGE fill remains an instance override.',
    },
    imageUrl: {
      control: 'text',
      description:
        'Code-supplied URL for the visible IMAGE fill at either selected size. Figma stores the 27 observed photos as instance fill overrides (3 Grand and 24 Petit), not as a component property; the empty runtime default is intentional and does not substitute an image.',
    },
    imageAlt: {
      control: 'text',
      description:
        'Code-supplied text alternative paired with imageUrl for either selected size. Figma IMAGE fills expose no corresponding alt component property, so the empty runtime default is intentional.',
    },
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
