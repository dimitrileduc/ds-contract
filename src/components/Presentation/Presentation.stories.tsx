/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/presentation.contract.json (ds.presentation v2.5.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Presentation } from './Presentation';

const meta = {
  title: 'Sections/Presentation',
  component: Presentation,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray Presentation. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored.',
      },
    },
  },
  render: (args) => <Presentation key={JSON.stringify(args)} {...args} />,
  argTypes: {
    texte: { control: false },
    bouton: { control: 'boolean' },
    titre: {
      control: 'text',
      description: 'Extracted from Figma "Titre" TEXT property (added by sync pass).',
    },
  },
  args: {
    texte: [
      { text: 'Depuis plus de 50 ans,', strong: true },
      {
        text: " la société Piqueray est une référence en Province de Liège. Aujourd'hui dirigée par Florian et Cécilia Piqueray, l'entreprise perpétue les valeurs de ",
      },
      { text: "proximité et d'excellence technique", strong: true },
      { text: '. Dépositaire officiel ' },
      { text: 'Hörmann', strong: true },
      { text: ", nous allions la force d'un leader mondial à " },
      { text: "la souplesse d'une PME locale", strong: true },
      { text: '.' },
    ],
    bouton: true,
    titre: 'Piqueray, une histoire de famille ',
  },
} satisfies Meta<typeof Presentation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
