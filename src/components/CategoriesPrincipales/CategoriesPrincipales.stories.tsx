/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/categories-principales.contract.json (ds.categories-principales v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CategoriesPrincipales } from './CategoriesPrincipales';

const meta = {
  title: 'Sections/CategoriesPrincipales',
  component: CategoriesPrincipales,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Piqueray section « Catégories principales ». Extracted from the cleaned Figma COMPONENT_SET on DS · Organisms (2115:4277), reviewed at Gate A — not authored. A repeated collection of ds.carte-categorie in a governed grid, with a closed `colonnes` {2,3} enum. Le colonnage est un CHOIX DE DESIGN porté par la section (extension de schéma E1 `layoutByProp.columns`), jamais dérivé du nombre de cartes ; au-delà du compte, les cartes passent à la ligne sur la même grille (wrap natif). Le `style` est transmis à chaque carte répétée (composition), donc verdict Odoo `fixed-by-composition` — pas un choix rédacteur.\n\nNettoyage de source (Gate A/B, 2026-08-20) : l'axe menteur « Disposition » à 4 valeurs (qui mélangeait style de carte, nombre de colonnes et un contenu déguisé « Rdv ») est remplacé par deux axes orthogonaux Style × Colonnes. « Rdv » redevient une instance renseignée, plus jamais une variante.\n\nLimite nommée : la prop `ctaType` de la carte n'est PAS transportée par item (les champs d'un `arrayOf` sont plats par le schéma) — toutes les cartes d'une section rendent le CTA par défaut de la molécule (lien). L'usage à CTA mixte (carte Maintenance à bouton encadré « Prendre rendez-vous ») est porté hors de cette composition (couche Odoo/usage) — nommé, pas contourné en silence.",
      },
    },
  },
  render: (args) => <CategoriesPrincipales key={JSON.stringify(args)} {...args} />,
  argTypes: {
    style: {
      control: 'select',
      options: ['superpose', 'empile'],
      description:
        'Style des cartes, transmis à chaque carte répétée (component.props {style}). Verdict Odoo attendu : fixed-by-composition (pas un choix rédacteur cette itération).',
    },
    colonnes: {
      control: 'select',
      options: ['2', '3'],
      description:
        'Nombre de colonnes de la grille — enum FERMÉ {2,3}, aucune autre valeur offrable. Porté par la section (extension E1 layoutByProp.columns sur la part grid) ; au-delà du compte de cartes, wrap natif sur la même grille.',
    },
    cartes: {
      control: false,
      description:
        'Collection de cartes-catégories. Champs `titre` et `texte` (plats — un arrayOf ne porte que text/number/boolean par le schéma). Le `sample` est relevé de la source (contenus réels des usages), jamais inventé. LIMITE : pas de champ `ctaType` par carte (voir description du contrat).',
    },
  },
  args: {
    style: 'superpose',
    colonnes: '2',
    cartes: [
      {
        titre: 'Pour portes de garage',
        texte:
          'SupraMatic & ProMatic. Ouverture ultra-rapide et verrouillage mécanique anti-intrusion breveté.',
      },
      {
        titre: "Pour portails d'entrée",
        texte:
          "RotaMatic (Battant) & LineaMatic (Coulissant). Fiabilité absolue et détection d'obstacles pour la sécurité de votre famille.",
      },
    ],
  },
} satisfies Meta<typeof CategoriesPrincipales>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Superpose: Story = {
  args: { style: 'superpose' },
};

export const Empile: Story = {
  args: { style: 'empile' },
};
/** Every legal combination the contract defines (style × colonnes). */
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
      <CategoriesPrincipales style="superpose" colonnes="2" />
      <CategoriesPrincipales style="superpose" colonnes="3" />
      <CategoriesPrincipales style="empile" colonnes="2" />
      <CategoriesPrincipales style="empile" colonnes="3" />
    </div>
  ),
};
