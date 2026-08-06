/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/faq.contract.json (ds.faq v1.3.0)
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
        'Extracted from Figma "Ligne 3" BOOLEAN property (added by sync pass). Côté Figma cette propriété pilote la visibilité de la SEULE 3e instance, et la géométrie recalcule 448 ↔ 384px. LIMITE LEVÉE en 1.3.0 (016, journal decisions.md O-15) : un item de `repeat` ne peut toujours pas porter de visibleWhen individuel (le vocabulaire n\'a pas de visibilité par index — poser `visibleWhen` sur la part répétée ferait disparaître les trois lignes là où Figma en garde deux), mais la 3e rangée est sortie du repeat en part composée séparée `AccordionRow3`, qui porte `visibleWhen: { prop: "ligne3" }` : le fait est désormais PROJETÉ (mesuré au canvas, O-15 : portes-entrée 481→409, la prop agit).',
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
    ],
    ligne3: true,
  },
} satisfies Meta<typeof FAQ>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
