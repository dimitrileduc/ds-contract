/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/carte.contract.json (ds.carte v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Carte } from './Carte';

const meta = {
  title: 'Molecules/Carte',
  component: Carte,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray Carte. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored.',
      },
    },
  },
  render: (args) => <Carte key={JSON.stringify(args)} {...args} />,
  argTypes: {
    disposition: { control: 'select', options: ['reassurance', 'categorie'] },
    titre: { control: 'text' },
    imageUrl: { control: 'text' },
    imageAlt: { control: 'text' },
    texte: { control: 'text' },
  },
  args: {
    disposition: 'reassurance',
    titre: 'Pour portes de garage',
    imageUrl: '',
    imageAlt: '',
    texte:
      'SupraMatic & ProMatic. Ouverture ultra-rapide et verrouillage mécanique anti-intrusion breveté.',
  },
} satisfies Meta<typeof Carte>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Reassurance: Story = {
  args: { disposition: 'reassurance' },
};

export const Categorie: Story = {
  args: { disposition: 'categorie' },
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
      <Carte disposition="reassurance" />
      <Carte disposition="categorie" />
    </div>
  ),
};
