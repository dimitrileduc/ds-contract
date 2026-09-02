/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/devis.contract.json (ds.devis v2.0.0)
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
          "Piqueray Devis responsive, adopté depuis le set 031 (2694:21604) — bandeau CTA pleine largeur : photo de fond, voile dégradé, titre H2 et un bouton Outline blanc, centrés. MAJEUR : les ancres Figma quittent l'ancien master 2096:2524 pour le set 031, et la prop presentation apparaît. Le set expose quatre variantes dessinées 390x496, 834x466, 1200x358 et 1728x506 ; le contrat porte ces hauteurs, le CSS Odoo en fait des min-height (Odoo force height:auto sur les sections sous 768). Les points de rupture restent une affaire de projection Odoo.",
      },
    },
  },
  render: (args) => <Devis key={JSON.stringify(args)} {...args} />,
  argTypes: {
    presentation: {
      control: 'select',
      options: ['mobile', 'tablette', 'desktop', 'wide'],
      description:
        "Axe de présentation du set 031. Le défaut est la première variante dessinée (Mobile) — la parité l'exige.",
    },
    titre: {
      control: false,
      description:
        "Titre du bandeau, texte riche. Le set 031 n'expose AUCUNE propriété TEXT (l'ancien master 2096:2524 exposait Titre) : la liaison figma est NONE — régression de source, nommée. Riche parce que le titre porte un SAUT DE LIGNE après « gratuit, » (règle owner 2026-09-02 : un saut de ligne est du texte riche, et un saut vaut pour tous les modes). Sur le canvas il n'est explicite que sur la variante Desktop (séparateur U+2028, relevé sur 2694:21563) ; Mobile et Tablette coupent naturellement ailleurs — écart de source à corriger dans Figma, comme la planche Tablette du hero l'a été. Le saut vit dans le contenu des pages ; la part déclare white-space pre-line.",
    },
    backgroundUrl: {
      control: 'text',
      description:
        'URL fournie par le code pour le plan photo. Le set 031 range ces pixels dans une PEINTURE IMAGE du cadre Background (imageHash 7825ba2d393a21ddc6d94a7bfd05c1f3bde128aa, scaleMode FILL, sans imageTransform, identique dans les quatre variantes), jamais dans une propriété de composant : liaison NONE et défaut vide intentionnel — il ne substitue aucune image. Même provenance et même orthographe que sav.backgroundUrl.',
    },
    backgroundAlt: {
      control: 'text',
      description:
        "Alternative textuelle appariée à backgroundUrl. Une peinture IMAGE Figma n'expose aucune propriété d'alternative textuelle : le défaut vide est intentionnel (plan décoratif).",
    },
    fond: {
      control: 'boolean',
      description:
        "Affiche les deux plans de fond du root (photo puis voile). Aucune propriété de composant Figma n'y correspond — les deux plans sont des CADRES ABSOLUS du master (contraintes STRETCH/STRETCH), pas une propriété : liaison NONE, défaut true (l'état du master). À false, les deux plans disparaissent et seul le background-color du root subsiste.",
    },
  },
  args: {
    presentation: 'mobile',
    titre: [{ text: 'Prenez rendez-vous pour un devis gratuit,\nnous nous déplaçons chez vous' }],
    backgroundUrl: '',
    backgroundAlt: '',
    fond: true,
  },
} satisfies Meta<typeof Devis>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Mobile: Story = {
  args: { presentation: 'mobile' },
};

export const Tablette: Story = {
  args: { presentation: 'tablette' },
};

export const Desktop: Story = {
  args: { presentation: 'desktop' },
};

export const Wide: Story = {
  args: { presentation: 'wide' },
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
      <Devis presentation="mobile" />
      <Devis presentation="tablette" />
      <Devis presentation="desktop" />
      <Devis presentation="wide" />
    </div>
  ),
};
