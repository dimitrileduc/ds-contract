/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/devis.contract.json (ds.devis v1.2.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Devis } from './Devis';

const meta = {
  title: 'Sections/Devis',
  component: Devis,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray Devis. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored.',
      },
    },
  },
  render: (args) => <Devis key={JSON.stringify(args)} {...args} />,
  argTypes: {
    titre: { control: 'text' },
    backgroundUrl: {
      control: 'text',
      description:
        'URL fournie par le code pour la peinture IMAGE pleine largeur du root (fills[0], scaleMode FILL, imageRef 7825ba2d393a21ddc6d94a7bfd05c1f3bde128aa). Figma range ces pixels dans une PEINTURE du master, jamais dans une propriété de composant : la liaison figma est donc NONE et le défaut vide est intentionnel — il ne substitue aucune image. Même provenance et même orthographe que sav.backgroundUrl.',
    },
    backgroundAlt: {
      control: 'text',
      description:
        "Alternative textuelle appariée à backgroundUrl. Une peinture IMAGE Figma n'expose aucune propriété d'alternative textuelle : le défaut vide est intentionnel (plan décoratif).",
    },
    fond: {
      control: 'boolean',
      description:
        "Affiche les deux plans de fond du root (photo puis voile). Aucune propriété de composant Figma n'y correspond — les deux peintures vivent sur le root du master, pas sur une propriété : liaison NONE, défaut true (l'état du master). Ce booléen est AUSSI le seul porteur possible des insets des deux plans : la grammaire n'expose `top/right/bottom/left` que dans `stylesWhen` (STYLES_WHEN_ALLOWED), qui exige une prop conditionnante — précédents dans le dépôt : nav-item `Soulignement` conditionné par `actif`, member-picture (deux plans photo) conditionnés par `etat`. À false, les deux plans disparaissent et seul le `background-color` du root subsiste.",
    },
  },
  args: {
    titre: 'Prenez rendez-vous pour un devis gratuit, nous nous déplaçons chez vous',
    backgroundUrl: '',
    backgroundAlt: '',
    fond: true,
  },
} satisfies Meta<typeof Devis>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
