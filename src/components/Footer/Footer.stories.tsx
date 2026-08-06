/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/footer.contract.json (ds.footer v1.1.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Footer } from './Footer';

const meta = {
  title: 'Sections/Footer',
  component: Footer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Piqueray Footer. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. v1.1.0 porte la géométrie relevée au census 013 sur le master 2120:4785 (version Figma pinée 2381581871281042338) : l'extraction 010 avait retenu la structure sans aucune de ses mesures, ce qui laissait le rendu généré à 96,91 % d'écart pixel. Aucune propriété publique n'a changé.",
      },
    },
  },
  render: (args) => <Footer key={JSON.stringify(args)} {...args} />,
  argTypes: {
    items: { control: false },
  },
  args: {
    items: [
      { texte: 'Rue Alfred Drèze 7,  4860 Pepinster', titre: 'Adresse' },
      { texte: 'Du lundi au vendredi  de 8h00 à 12h00 et  de 13h30 à 17h00', titre: 'Horaires' },
      { texte: 'Tél : +32 (0)87 46 32 66\r  Email: info@piqueray.be', titre: 'Contact' },
    ],
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
