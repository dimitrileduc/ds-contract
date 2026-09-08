/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/accordion-row.contract.json (ds.accordion-row v2.1.0)
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
          "Piqueray AccordionRow, v2 (2026-09-07) : anchored on the candidate set 2767:20198 (page 031, cloned from the DS set 2059:1417 and reworked with the owner). MAJOR: the anchors leave the v1 set. What changes against 1.2.0: the title WRAPS (no fixed height on title / Titre / TitreOuvert any more), the Grand title is the DS H4 role and the Petit title / the content ride the body role — both vary per viewport through tokens, never through a variant; the chevrons are the governed icons painted noir-bleute; the Grand rule is bound to noir-bleute (was raw #000000). Native button, toggle and ARIA semantics stay deferred to the separately proven semantic-wrapper capability. Named deviations against the dump are carried on each part's description.",
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
