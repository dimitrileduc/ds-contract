/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/accordion-row.contract.json (ds.accordion-row v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AccordionRow } from './AccordionRow';

const meta = {
  title: 'Molecules/AccordionRow',
  component: AccordionRow,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray AccordionRow. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored.',
      },
    },
  },
  render: (args) => <AccordionRow key={JSON.stringify(args)} {...args} />,
  argTypes: {
    taille: { control: 'select', options: ['grand', 'petit'] },
    etat: { control: 'select', options: ['ferme', 'ouvert'] },
    titre: { control: 'text' },
    contenu: { control: 'text' },
  },
  args: {
    taille: 'grand',
    etat: 'ferme',
    titre: 'Question',
    contenu: 'Réponse',
  },
} satisfies Meta<typeof AccordionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Grand: Story = {
  args: { taille: 'grand' },
};

export const Petit: Story = {
  args: { taille: 'petit' },
};
/** Every legal combination the contract defines (taille × etat). */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(2, max-content)',
        alignItems: 'center',
        justifyItems: 'start',
      }}
    >
      <AccordionRow taille="grand" etat="ferme" />
      <AccordionRow taille="grand" etat="ouvert" />
      <AccordionRow taille="petit" etat="ferme" />
      <AccordionRow taille="petit" etat="ouvert" />
    </div>
  ),
};
