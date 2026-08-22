/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/header.contract.json (ds.header v2.1.0)
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
          'Piqueray Header. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored.',
      },
    },
  },
  render: (args) => <Header key={JSON.stringify(args)} {...args} />,
  argTypes: {
    items: {
      control: false,
      description:
        "La collection de navigation — code-only par construction (figma.kind:'NONE' obligatoire pour un arrayOf, R8). React mappe le tableau vivant ; html/react-inline/canevas rendent le `sample` du repeat. À la différence d'un sample générique (FR-010 de ds.google-reviews), celui-ci porte les libellés et routes RÉELS de tête de la maquette (audit 013 clos par le delta 022 : `/depannage-sav`). Côté produit, ces quatre paires existent une seconde fois dans l'arbre `website.menu` semé UNE FOIS à la livraison (spec 022, data-model §2.2, avec ses enfants) ; après le semis, le menu du CLIENT fait foi — jamais re-semé, jamais écrasé (FR-016). Un renommage de route se porte donc à la main aux deux endroits, aucune porte ne les compare — dette nommée. `chevron` est saisi par entrée ici ; côté Odoo il est dérivé (l'entrée a des enfants).",
    },
  },
  args: {
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
