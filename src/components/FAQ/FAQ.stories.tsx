/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/faq.contract.json (ds.faq v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FAQ } from './FAQ';

const meta = {
  title: 'Sections/FAQ',
  component: FAQ,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray FAQ. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored.',
      },
    },
  },
  render: (args) => <FAQ key={JSON.stringify(args)} {...args} />,
  argTypes: {
    items: { control: false },
    ligne3: {
      control: 'boolean',
      description: 'Extracted from Figma "Ligne 3" BOOLEAN property (added by sync pass).',
    },
  },
  args: {
    items: [
      {
        contenu: 'Réponse',
        titre: 'Nos portes répondent-elles aux normes des bâtiments publics ?',
      },
      {
        contenu:
          'Nos portes sont conçues pour recevoir tout type de bardage, garantissant une intégration parfaite à votre façade. Nous travaillons notamment avec les bardages Renson, Trespa, Alubond, Bois ou Eternit.',
        titre: 'Quels types de bardages peuvent être intégrés sur les portes ?',
      },
      { contenu: 'Réponse', titre: "Assurez-vous la maintenance après l'installation ?" },
    ],
    ligne3: true,
  },
} satisfies Meta<typeof FAQ>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
