/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/header.contract.json (ds.header v3.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from './Header';

const meta = {
  title: 'Sections/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Piqueray Header, responsive (vague 031). 3.0.0 (2026-09-04) : les ancres passent du master DS 84:285 au set 031 `Header` 2732:12096, quatre variantes Presentation construites depuis les 4 vues home de la page 031 sans redessin (journal specs/tiny/vague-031/header.md). Mobile/Tablette : logo + burger 44×44 ; Desktop : logo + nav + icônes Utilisateur/Panier/Mail, sans bouton ; Wide : logo + nav + bouton « Contactez-nous » + icônes Utilisateur/Panier. La présence par écran de navWrapper (Desktop/Wide) et de MenuBurger (Mobile/Tablette) est portée en stylesWhen display:none (le schéma n'admet qu'une valeur par visibleWhen) ; côté canevas les variantes ne dessinent simplement pas la part absente — limite nommée du canal stylesWhen (non représenté sur le canevas). L'icône Recherche, masquée sur le canevas Wide, n'est plus portée (calque caché = défaut de source, §VIII). Largeurs minimales de la nav : Desktop 1113 px, Wide 1487 px — au-dessous, la nav chevauche le logo (fait de design, à trancher).",
      },
    },
  },
  render: (args) => <Header key={JSON.stringify(args)} {...args} />,
  argTypes: {
    presentation: {
      control: 'select',
      options: ['mobile', 'tablette', 'desktop', 'wide'],
      description:
        "L'étage responsive (axe Presentation du set 031). Défaut = première variante du set (mobile), la parité l'exige. Côté Odoo la valeur n'est jamais posée : la feuille responsive/header.pqr.css réécrit les règles par mode en @media sur les breakpoints des jetons.",
    },
    items: {
      control: false,
      description:
        "La collection de navigation — code-only par construction (figma.kind:'NONE' obligatoire pour un arrayOf, R8). React mappe le tableau vivant ; html/react-inline/canevas rendent le `sample` du repeat. À la différence d'un sample générique (FR-010 de ds.google-reviews), celui-ci porte les libellés et routes RÉELS de tête de la maquette (audit 013 clos par le delta 022 : `/depannage-sav`). Côté produit, ces quatre paires existent une seconde fois dans l'arbre `website.menu` semé UNE FOIS à la livraison (spec 022, data-model §2.2, avec ses enfants) ; après le semis, le menu du CLIENT fait foi — jamais re-semé, jamais écrasé (FR-016). Un renommage de route se porte donc à la main aux deux endroits, aucune porte ne les compare — dette nommée. `chevron` est saisi par entrée ici ; côté Odoo il est dérivé (l'entrée a des enfants).",
    },
  },
  args: {
    presentation: 'mobile',
    items: [
      { libelle: 'Portes de garage', href: '/portes-de-garage', chevron: true },
      { libelle: 'Portes d’entrée', href: '/portes-entree', chevron: true },
      { libelle: 'Dépannage/SAV', href: '/depannage-sav', chevron: false },
      { libelle: 'À propos', href: '/a-propos', chevron: false },
    ],
  },
} satisfies Meta<typeof Header>;

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
      <Header presentation="mobile" />
      <Header presentation="tablette" />
      <Header presentation="desktop" />
      <Header presentation="wide" />
    </div>
  ),
};
