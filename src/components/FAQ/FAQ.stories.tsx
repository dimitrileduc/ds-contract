/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/faq.contract.json (ds.faq v1.2.0)
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
          "Piqueray FAQ. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. v1.2.0 porte la géométrie relevée au census 013 sur le master 2104:2914 (version Figma pinée 2381581871281042338) : l'extraction 010 avait retenu la structure sans aucune de ses mesures (ni gap, ni padding, ni largeur) et sans aucune des valeurs d'instance du Bouton, ce qui laissait le rendu généré à 4,37 % d'écart pixel. Aucune propriété publique n'a changé.",
      },
    },
  },
  render: (args) => <FAQ key={JSON.stringify(args)} {...args} />,
  argTypes: {
    items: {
      control: false,
      description:
        "Les lignes de la FAQ. LIMITE NOMMÉE (inchangée depuis 010) : Figma n'a pas de propriété de composant de type tableau — la répétition n'existe sur le canevas que comme N instances sœurs compilées, d'où bindings.figma.kind NONE. Le schéma refuse aussi un default sur un prop arrayOf (« an optional array — undefined means \"not provided\", never a silent [] ») : le master rend trois lignes par défaut, le composant généré n'en rend aucune sans données. C'est pourquoi le cas d'audit alimente items par un override, comme ds.footer.",
    },
    ligne3: {
      control: 'boolean',
      description:
        'Extracted from Figma "Ligne 3" BOOLEAN property (added by sync pass). LIMITE NOMMÉE : côté Figma cette propriété pilote la visibilité de la SEULE 3e instance (2104:2911), et la géométrie recalcule 448 ↔ 384px. Côté contrat les trois lignes naissent d\'un `repeat` : `visibleWhen` s\'applique à la part, donc à TOUTES les lignes répétées, jamais à la dernière seule. Le vocabulaire n\'a pas de visibilité par index dans un repeat ; poser `visibleWhen: { prop: "ligne3" }` ferait disparaître les trois lignes là où Figma en garde deux. Le fait est donc EXPOSÉ mais non PROJETÉ, et nommé plutôt que contourné par un modèle faux.',
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
