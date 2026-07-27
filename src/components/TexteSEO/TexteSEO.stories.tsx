/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/texte-seo.contract.json (ds.texte-seo v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TexteSEO } from './TexteSEO';

const meta = {
  title: 'Sections/TexteSEO',
  component: TexteSEO,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray TexteSEO. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored.',
      },
    },
  },
  render: (args) => <TexteSEO key={JSON.stringify(args)} {...args} />,
  argTypes: {
    items: { control: false },
  },
  args: {
    items: [
      { contenu: 'Réponse', titre: 'Accès et parking' },
      {
        contenu:
          'Pour une simple visite découverte, le showroom est ouvert aux horaires indiqués. Pour une étude approfondie de projet avec un conseiller, la prise de rendez-vous est conseillée.',
        titre: 'Faut-il prendre rendez-vous ?',
      },
      { contenu: 'Réponse', titre: 'Zones de déplacement pour devis' },
    ],
  },
} satisfies Meta<typeof TexteSEO>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
