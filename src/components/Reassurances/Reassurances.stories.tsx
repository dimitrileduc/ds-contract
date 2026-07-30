/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/reassurances.contract.json (ds.reassurances v1.2.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Reassurances } from './Reassurances';

const meta = {
  title: 'Sections/Reassurances',
  component: Reassurances,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Piqueray Reassurances. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. v1.2.0 porte la géométrie relevée au census 013 sur la variante « Disposition=4 cartes » (node 2114:3619, version Figma pinée 2381581871281042338) : l'extraction 010 avait retenu la structure sans aucune de ses mesures — ni les deux gaps de 48px du root, ni le gap de 32px des items, ni la largeur 1550px — et le bouton du master (Outline noir, flèche droite) était rendu par le seul défaut de ds.button, donc juste par coïncidence. Le champ items.imageUrl est ajouté pour que les photos des cartes aient une ROUTE de projection (D10 : l'URL n'est jamais un défaut du contrat, elle entre par le consommateur).",
      },
    },
  },
  render: (args) => <Reassurances key={JSON.stringify(args)} {...args} />,
  argTypes: {
    disposition: { control: 'select', options: ['4Cartes', 'quatrecartesdeuxcta', '5Cartes'] },
    items: {
      control: false,
      description:
        "Les cartes de réassurance, fournies par le consommateur. imageUrl alimente ds.carte.imageUrl : le master pose une peinture IMAGE distincte par carte (imageRef ab6a82d4b83b657d48c90b5e253f82459fd505bf, 8d05df2058fe88fa4b14e4472c9746f03fd100a2, d00de3d48206b57be5125a2d01e8595d3eca56de, 7bd2daf5061e3af6ff4a671f8eca2be1bc10b6fb, relevées sur I2114:3614;2063:1607 … I2114:3617;2063:1607) et Figma n'expose aucune propriété de composant pour ces pixels. Le contrat porte donc la ROUTE, jamais les octets — même convention que ds.hero.backgroundUrl et ds.sav.imageUrl, et le sample laisse imageUrl vide parce qu'un imageRef Figma n'est pas une URL.",
    },
  },
  args: {
    disposition: '4Cartes',
    items: [
      {
        texte: 'Respectent les normes des bâtiments publics et les réglementations pompiers.',
        titre: 'Sécurité et conformité',
        imageUrl: '',
      },
      {
        texte:
          'Conçues pour recevoir tout type de bardage (Renson, Trespa, Alubond, Bois ou Eternit).',
        titre: 'Intégration parfaite',
        imageUrl: '',
      },
      {
        texte:
          'Ouverture silencieuse, fluide et ultra-rapide jusqu’à 1 m/s pour un confort optimal.',
        titre: 'Moteur performant',
        imageUrl: '',
      },
      {
        texte:
          'Réactivité maximale garantie grâce à nos techniciens et notre important stock de pièces.',
        titre: 'SAV & maintenance dédiés',
        imageUrl: '',
      },
    ],
  },
} satisfies Meta<typeof Reassurances>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Disposition4Cartes: Story = {
  args: { disposition: '4Cartes' },
};

export const Quatrecartesdeuxcta: Story = {
  args: { disposition: 'quatrecartesdeuxcta' },
};

export const Disposition5Cartes: Story = {
  args: { disposition: '5Cartes' },
};
/** Every legal combination the contract defines. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(1, max-content)',
        alignItems: 'center',
        justifyItems: 'start',
      }}
    >
      <Reassurances disposition="4Cartes" />
      <Reassurances disposition="quatrecartesdeuxcta" />
      <Reassurances disposition="5Cartes" />
    </div>
  ),
};
