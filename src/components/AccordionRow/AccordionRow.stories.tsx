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
          'Piqueray AccordionRow. Visual and layout facts were extracted from the live Figma COMPONENT_SET on DS · Molécules after source cleanup; native button semantics, toggle behavior and ARIA association were added in reviewed code-side semantics behind evals. The live source intentionally keeps its documented Fermé/Ouvert structural asymmetry; the semantic trigger wrapper normalizes only the generated DOM while preserving the four measured geometries.',
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
        'Controlled when supplied; otherwise each AccordionRow instance toggles independently between fermé and ouvert.',
    },
    titre: { control: 'text' },
    contenu: { control: 'text' },
    onToggle: {
      control: false,
      description:
        'Fires when the native trigger button is activated; uncontrolled rows flip independently between fermé and ouvert.',
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
