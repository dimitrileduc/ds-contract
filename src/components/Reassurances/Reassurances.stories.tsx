/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/reassurances.contract.json (ds.reassurances v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Reassurances } from './Reassurances';

const meta = {
  title: 'Sections/Reassurances',
  component: Reassurances,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray Reassurances. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored.',
      },
    },
  },
  render: (args) => <Reassurances key={JSON.stringify(args)} {...args} />,
  argTypes: {
    disposition: { control: 'select', options: ['4Cartes', 'quatrecartesdeuxcta', '5Cartes'] },
    items: { control: false },
  },
  args: {
    disposition: '4Cartes',
    items: [
      {
        texte: 'Respectent les normes des bâtiments publics et les réglementations pompiers.',
        titre: 'Sécurité et conformité',
      },
      {
        texte:
          'Conçues pour recevoir tout type de bardage (Renson, Trespa, Alubond, Bois ou Eternit).',
        titre: 'Intégration parfaite',
      },
      {
        texte:
          'Ouverture silencieuse, fluide et ultra-rapide jusqu’à 1 m/s pour un confort optimal.',
        titre: 'Moteur performant',
      },
      {
        texte:
          'Réactivité maximale garantie grâce à nos techniciens et notre important stock de pièces.',
        titre: 'SAV & maintenance dédiés',
      },
      {
        texte: 'Savoir-faire familial transmis depuis plus de 50 ans sur trois générations.',
        titre: 'Expérience',
      },
    ],
  },
} satisfies Meta<typeof Reassurances>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Disposition4Cartes: Story = {
  args: { disposition: '4Cartes' },
};

export const Quatrecartesdeuxcta: Story = {
  args: { disposition: 'quatrecartesdeuxcta' },
};

export const Disposition5Cartes: Story = {
  args: { disposition: '5Cartes' },
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
      <Reassurances disposition="4Cartes" />
      <Reassurances disposition="quatrecartesdeuxcta" />
      <Reassurances disposition="5Cartes" />
    </div>
  ),
};
