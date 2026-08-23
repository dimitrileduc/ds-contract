/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/section-header.contract.json (ds.section-header v3.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SectionHeader } from './SectionHeader';

const meta = {
  title: 'Molecules/SectionHeader',
  component: SectionHeader,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray SectionHeader v3. Generic section title only: a rich title, optional eyebrow and explicit alignment. CTA and specialised hierarchy belong to their owning sections: ds.hero@2.0.0, ds.presentation@3.0.0, ds.texte-seo@3.0.0 and ds.produits-ecommerce@1.0.0.',
      },
    },
  },
  render: (args) => <SectionHeader key={JSON.stringify(args)} {...args} />,
  argTypes: {
    titre: { control: false },
    accroche: { control: 'text' },
    afficherAccroche: {
      control: 'boolean',
      description:
        'Explicit eyebrow visibility. False removes its text node from layout rather than leaving an empty line box.',
    },
    alignement: { control: 'select', options: ['centre', 'gauche'] },
  },
  args: {
    titre: [{ text: 'Pourquoi choisir Piqueray ?' }],
    accroche: 'Plus de 50 ans d’expérience',
    afficherAccroche: true,
    alignement: 'centre',
  },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Centre: Story = {
  args: { alignement: 'centre' },
};

export const Gauche: Story = {
  args: { alignement: 'gauche' },
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
      <SectionHeader alignement="centre" />
      <SectionHeader alignement="gauche" />
    </div>
  ),
};
