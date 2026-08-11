/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/equipe.contract.json (ds.equipe v1.2.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Equipe } from './Equipe';

const meta = {
  title: 'Sections/Equipe',
  component: Equipe,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray Equipe. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored.',
      },
    },
  },
  render: (args) => <Equipe key={JSON.stringify(args)} {...args} />,
  argTypes: {
    items: { control: false },
  },
  args: {
    items: [
      { poste: 'Gérante', nom: 'Cécilia Piqueray' },
      { poste: 'Gérant', nom: 'Florian Piqueray' },
      { poste: 'Collaboratrice admin & comptabilité', nom: 'Sandra Magermans' },
      { poste: 'Collaborateur admin & gestion SAV', nom: 'Arnaud Dahmen' },
      { poste: 'Peintre', nom: 'Ricardo' },
      { poste: 'Préparateur', nom: 'Quentin' },
      { poste: 'Monteur', nom: 'Marc' },
      { poste: 'Monteur', nom: 'André' },
      { poste: 'Monteur', nom: 'Grégory' },
      { poste: 'Monteur', nom: 'Laurent' },
      { poste: 'Monteur', nom: 'Jordan' },
      { poste: 'Monteur', nom: 'Florian' },
      { poste: 'Dépanneur', nom: 'Hervé' },
      { poste: 'Poste', nom: 'Prénom' },
      { poste: 'Poste', nom: 'Prénom' },
      { poste: 'Poste', nom: 'Prénom' },
    ],
  },
} satisfies Meta<typeof Equipe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
