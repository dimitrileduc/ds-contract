/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/presentation.contract.json (ds.presentation v3.0.0)
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
          'Piqueray Presentation. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. v2.6.0 makes the two-column composition fluid: the root, both columns and the nested SectionHeader are Fill at a 1287px authoring reference, with no max-width and no local padding. Page and site Containers own external spacing.',
      },
    },
  },
  render: (args) => <Presentation key={JSON.stringify(args)} {...args} />,
  argTypes: {
    texte: { control: false },
    bouton: { control: 'boolean' },
    titre: {
      control: false,
      description:
        'Presentation-owned rich title. The prior medium SectionHeader variant is replaced by direct 32/40 anatomy.',
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
    titre: [{ text: 'Piqueray, ', strong: true }, { text: 'une histoire de famille ' }],
  },
} satisfies Meta<typeof Presentation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
