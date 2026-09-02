/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/categories-principales.contract.json (ds.categories-principales v2.0.0)
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
          "Piqueray section « Catégories principales », responsive. 2.0.0 (2026-09-02, vague 031) : ré-extraite du set 2693:20242 (page « 031 · Planches de validation »), quatre variantes sur le SEUL axe Presentation. Les deux réglages `style` et `colonnes` du contrat 1.0.0 SONT RETIRÉS (rupture majeure, décision owner 2026-09-02) : le set 031 ne les déclare plus, ses huit cartes sont toutes superposées, et le colonnage est décidé par l'écran — colonne en Mobile et Tablette, deux cartes en ligne en Desktop et Wide. La grille tombe juste au pixel : 390−48=342, 834−96=738, 1200−112−64=1024 (512 chacune), 1728−178−64=1486 (743 chacune). Deux hauteurs de carte sont mintées depuis le relevé (418 en Mobile, 288 en Tablette) ; Desktop et Wide découlent du rapport 16/9 de la carte.\n\nHistorique avant 2.0.0 :\nPiqueray section « Catégories principales ». Extracted from the cleaned Figma COMPONENT_SET on DS · Organisms (2115:4277), reviewed at Gate A — not authored. A repeated collection of ds.carte-categorie in a governed grid, with a closed `colonnes` {2,3} enum. Le colonnage est un CHOIX DE DESIGN porté par la section (extension de schéma E1 `layoutByProp.columns`), jamais dérivé du nombre de cartes ; au-delà du compte, les cartes passent à la ligne sur la même grille (wrap natif). Le `style` est transmis à chaque carte répétée (composition), donc verdict Odoo `fixed-by-composition` — pas un choix rédacteur.\n\nNettoyage de source (Gate A/B, 2026-08-20) : l'axe menteur « Disposition » à 4 valeurs (qui mélangeait style de carte, nombre de colonnes et un contenu déguisé « Rdv ») est remplacé par deux axes orthogonaux Style × Colonnes. « Rdv » redevient une instance renseignée, plus jamais une variante.\n\nLimite nommée : la prop `ctaType` de la carte n'est PAS transportée par item (les champs d'un `arrayOf` sont plats par le schéma) — toutes les cartes d'une section rendent le CTA par défaut de la molécule (lien). L'usage à CTA mixte (carte Maintenance à bouton encadré « Prendre rendez-vous ») est porté hors de cette composition (couche Odoo/usage) — nommé, pas contourné en silence.",
      },
    },
  },
  render: (args) => <CategoriesPrincipales key={JSON.stringify(args)} {...args} />,
  argTypes: {
    presentation: {
      control: 'select',
      options: ['mobile', 'tablette', 'desktop', 'wide'],
      description:
        "Présentation par écran, miroir de l'axe Presentation du set 031. Défaut = mobile, première variante du set et base mobile-first du CSS livré ; dans le CSS livré c'est la fenêtre qui choisit, par les jetons de rupture, jamais un consommateur.",
    },
    cartes: {
      control: false,
      description:
        'Collection de cartes-catégories. Champs `titre` et `texte` (plats — un arrayOf ne porte que text/number/boolean par le schéma). Le `sample` est relevé de la source (contenus réels des usages), jamais inventé. LIMITE : pas de champ `ctaType` par carte (voir description du contrat). Le set 031 en dessine deux, en style superposé, dans les quatre présentations.',
    },
  },
  args: {
    presentation: 'mobile',
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
      <CategoriesPrincipales presentation="mobile" />
      <CategoriesPrincipales presentation="tablette" />
      <CategoriesPrincipales presentation="desktop" />
      <CategoriesPrincipales presentation="wide" />
    </div>
  ),
};
