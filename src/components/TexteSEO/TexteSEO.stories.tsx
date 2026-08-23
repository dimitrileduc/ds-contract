/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/texte-seo.contract.json (ds.texte-seo v3.0.0)
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
    titre: {
      control: false,
      description:
        'Texte SEO-owned rich title. The prior compact SectionHeader variant is replaced by direct 24/30 anatomy.',
    },
    items: {
      control: false,
      description:
        "Les lignes d'accordéon. `etat` est observé par entrée sur le master Figma (la 2e ligne est ouverte, les deux autres fermées) : le renseigner rend chaque ligne CONTRÔLÉE côté React — la géométrie est fidèle, mais une ligne ne se replie plus d'elle-même tant que le consommateur ne possède pas l'état (le canal `repeat` ne porte pas d'événement par entrée). Limite nommée, pas un oubli.",
    },
  },
  args: {
    titre: [
      { text: 'Visitez notre ' },
      { text: 'showroom à Pepinster', strong: true },
      { text: ' ou contactez-nous' },
    ],
    items: [
      { contenu: 'Réponse', etat: 'ferme', titre: 'Accès et parking' },
      {
        contenu:
          'Pour une simple visite découverte, le showroom est ouvert aux horaires indiqués. Pour une étude approfondie de projet avec un conseiller, la prise de rendez-vous est conseillée.',
        etat: 'ouvert',
        titre: 'Faut-il prendre rendez-vous ?',
      },
      { contenu: 'Réponse', etat: 'ferme', titre: 'Zones de déplacement pour devis' },
    ],
  },
} satisfies Meta<typeof TexteSEO>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
