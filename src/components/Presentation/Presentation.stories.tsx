/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/presentation.contract.json (ds.presentation v1.0.0)
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
    texte: { control: 'text' },
    bouton: { control: 'boolean' },
  },
  args: {
    texte:
      'Depuis plus de 50 ans, la société Piqueray est une référence en Province de Liège. Aujourd hui dirigée par Florian et Cécilia Piqueray, l entreprise perpétue les valeurs de proximité et d excellence technique. Dépositaire officiel Hörmann, nous allions la force d un leader mondial à la souplesse d une PME locale.',
    bouton: false,
  },
} satisfies Meta<typeof Presentation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
