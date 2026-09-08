/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/realisations.contract.json (ds.realisations v1.0.1)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Realisations } from './Realisations';

const meta = {
  title: 'Sections/Realisations',
  component: Realisations,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Section Realisations — la mosaïque de photos de chantiers. Contrat NEUF (vague 035, 2026-09-07) : la section n'existait ni en contrat ni en bloc Odoo, seule la tuile ds.realisation était gouvernée. Extrait du set candidat v2 de la page « 031 · Planches de validation », posé le même jour à partir du set v1 2117:4691 après nettoyage de la source (8 défauts relevés, dont l'aplat gris opaque qui cachait les 27 photos vivantes du fichier). Mosaïque : une grande tuile sur 2×2 cellules puis huit petites, 4 colonnes en Desktop et Wide, 2 en Tablette et Mobile — décision owner du 2026-09-07 (option B : deux colonnes en mobile plutôt qu'une, qui donnait 3638 px de défilement pour un seul bloc). Le rythme vertical appartient à la page (padding vertical 0), la gouttière au contrat, comme toutes les sections depuis la vague 031.",
      },
    },
  },
  render: (args) => <Realisations key={JSON.stringify(args)} {...args} />,
  argTypes: {
    presentation: {
      control: 'select',
      options: ['mobile', 'tablette', 'desktop', 'wide'],
      description:
        "Axe de présentation responsive du DS. Pose la gouttière (24 · 48 · 56 · 89), l'écart de l'en-tête, le nombre de colonnes de la mosaïque et l'écart de grille. Fixé par la composition côté Odoo, jamais offert au rédacteur.",
    },
    enTete: {
      control: 'select',
      options: ['accroche', 'presentation'],
      description:
        "Forme de l'en-tête, axe VARIANT Figma `En-tete`. `accroche` : le sur-titre et le titre seuls, centrés (page « Portes d'entrée »). `presentation` : le titre à gauche et un paragraphe à droite au-dessus de 992 (pages « Portes de garage » industrielles et résidentielles).",
    },
    accroche: {
      control: 'text',
      description:
        "Sur-titre en capitales, visible dans la seule forme `accroche` (la forme `presentation` masque l'accroche du SectionHeader sur le canevas). Aucune propriété Figma ne le porte au niveau de la section : la liaison est NONE, le texte vit dans l'instance de SectionHeader.",
    },
    titre: {
      control: false,
      description:
        "Titre de section. TEXTE RICHE : la source porte une plage en gras (« industrielles et installations »), et la règle owner du 2026-09-02 dit qu'un texte avec du gras est riche. Trouvé par le TEST D'ÉDITION du 2026-09-07, pas par lecture : déclaré en texte plat, le gras était déplié au premier « Enregistrer » du rédacteur — la garde de saisie faisait exactement son travail sur un type faux. Aligné au centre en Mobile et Tablette, à gauche en Desktop et Wide dans la forme `presentation` — décision owner du 2026-09-07. La forme `accroche` reste centrée à toutes les largeurs, comme la source.",
    },
    texte: {
      control: false,
      description:
        "Paragraphe de la forme `presentation`, à droite du titre au-dessus de 992. TEXTE RICHE : la source porte deux plages en gras (Montserrat Bold), et la règle owner du 2026-09-02 dit qu'un texte avec du gras est riche. La marque strong est gouvernée par le jeton font.weight.bold. Sans ce type le gras serait déplié au premier enregistrement côté Odoo.",
    },
    photos: {
      control: false,
      description:
        "La collection de photos de la mosaïque, un item par tuile. Neuf items sur les trois usages relevés ; la première occupe 2×2 cellules. Figma stocke les photos comme surcharges de fill d'instance, jamais comme propriété de composant : la liaison est NONE et l'URL vide par défaut ne substitue aucune image (limite déclarée, héritée de ds.realisation).",
    },
  },
  args: {
    presentation: 'mobile',
    enTete: 'accroche',
    accroche: 'Des installations de qualité',
    titre: [
      { text: 'Nos réalisations ' },
      { text: 'industrielles et installations', strong: true },
      { text: ' de qualité' },
    ],
    texte: [
      { text: 'Personnalisez votre porte industrielle grâce à ' },
      { text: 'nos solutions sur mesure', strong: true },
      {
        text: ', parfaitement intégrées à votre façade. Conçues pour recevoir tout type de bardage (Renson, Trespa, Alubond, Bois ou Eternit) ou des sections vitrées, nos portes garantissent ',
      },
      { text: 'une robustesse exceptionnelle et une très longue durée de vie', strong: true },
      { text: '.' },
    ],
    photos: [
      { imageUrl: '', imageAlt: 'Porte de garage sectionnelle bois sur maison à bardage gris' },
      {
        imageUrl: '',
        imageAlt: 'Porte de garage sectionnelle noire sur façade en briques claires',
      },
      { imageUrl: '', imageAlt: 'Porte de garage sectionnelle bois sur longère en pierre' },
      {
        imageUrl: '',
        imageAlt: 'Porte de garage sectionnelle noire à hublots sur mur de briques grises',
      },
      { imageUrl: '', imageAlt: "Portail industriel noir le long d'une allée" },
      { imageUrl: '', imageAlt: 'Porte de garage anthracite sur maison de briques rouges' },
      {
        imageUrl: '',
        imageAlt: 'Porte de garage anthracite sur façade de briques rouges et blanches',
      },
      { imageUrl: '', imageAlt: 'Porte de garage bois sur bâtiment en rénovation' },
      { imageUrl: '', imageAlt: 'Porte de garage verte sur maison de caractère en pierre' },
    ],
  },
} satisfies Meta<typeof Realisations>;

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
/** Every legal combination the contract defines (presentation × enTete). */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(2, max-content)',
        alignItems: 'center',
        justifyItems: 'start',
      }}
    >
      <Realisations presentation="mobile" enTete="accroche" />
      <Realisations presentation="mobile" enTete="presentation" />
      <Realisations presentation="tablette" enTete="accroche" />
      <Realisations presentation="tablette" enTete="presentation" />
      <Realisations presentation="desktop" enTete="accroche" />
      <Realisations presentation="desktop" enTete="presentation" />
      <Realisations presentation="wide" enTete="accroche" />
      <Realisations presentation="wide" enTete="presentation" />
    </div>
  ),
};
