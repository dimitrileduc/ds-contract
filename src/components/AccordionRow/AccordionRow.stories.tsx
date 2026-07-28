/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/accordion-row.contract.json (ds.accordion-row v1.1.0)
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
          'Piqueray AccordionRow. Visual anatomy, layout, dimensions, typography, colors and visibility are adopted from the validated read-only Figma extraction. Native button, toggle and ARIA semantics are intentionally deferred to a separately proven semantic-wrapper capability.',
      },
    },
  },
  render: (args) => <AccordionRow key={JSON.stringify(args)} {...args} />,
  argTypes: {
    taille: { control: 'select', options: ['grand', 'petit'] },
    etat: {
      control: 'select',
      options: ['ferme', 'ouvert'],
      description:
        'Controlled when supplied; otherwise toggles independently between fermé and ouvert.',
    },
    titre: { control: 'text' },
    contenu: { control: 'text' },
    onToggle: {
      control: false,
      description: 'Activates the transparent native trigger projected over the Figma title row.',
    },
  },
  args: {
    taille: 'grand',
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
      <AccordionRow taille="grand" etat="ferme" titre="Question" contenu="Réponse" />
      <AccordionRow taille="grand" etat="ouvert" titre="Question" contenu="Réponse" />
      <AccordionRow taille="petit" etat="ferme" titre="Question" contenu="Réponse" />
      <AccordionRow taille="petit" etat="ouvert" titre="Question" contenu="Réponse" />
    </div>
  ),
};
