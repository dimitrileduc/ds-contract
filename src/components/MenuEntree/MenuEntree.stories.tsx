/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/menu-entree.contract.json (ds.menu-entree v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MenuEntree } from './MenuEntree';

const meta = {
  title: 'Molecules/MenuEntree',
  component: MenuEntree,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Une entrée du menu mobile ouvert (vague 031, décision owner 2026-09-04) : libellé en capitales, chevron sur une boîte tactile 44, et en état ouvert les sous-entrées le long d'un rail orange. Extrait du set 031 `MenuEntree` 2738:13482 (journal specs/tiny/vague-031/menu-mobile.md). L'état ouvert/fermé est une VARIANTE et une prop `etat`, sur le modèle d'AccordionRow : c'est un fait dessiné (chevron, couleur, sous-entrées visibles) ; le clic qui bascule l'état est la couche comportement (script Odoo, jamais le contrat). Typographie par typography.menu-entree et typography.menu-sous-entree (responsive : 24/30 en Mobile, 16/16 dès Tablette ; 18/27 puis 16/24). Filet bas color.blanc-14. Le lien de chaque entrée (`href`) est du contenu code-only, comme sur ds.nav-item.",
      },
    },
  },
  render: (args) => <MenuEntree key={JSON.stringify(args)} {...args} />,
  argTypes: {
    etat: {
      control: 'select',
      options: ['ferme', 'ouvert'],
      description:
        "Fermé (défaut) ou ouvert. Sur le canevas la première entrée du set MenuMobile est dessinée ouverte pour montrer les sous-entrées ; côté code toutes les entrées naissent fermées, l'ouverture est une interaction.",
    },
    libelle: { control: 'text' },
    href: {
      control: 'text',
      description:
        'Cible du lien — contenu, jamais dessiné (même règle que ds.nav-item). Côté Odoo la donnée vient de website.menu.',
    },
    chevron: {
      control: 'boolean',
      description:
        "L'entrée a des sous-entrées : chevron visible. Côté Odoo dérivé (l'entrée a des enfants).",
    },
    sousEntree1: { control: 'text' },
    sousEntree2: { control: 'text' },
    deuxSousEntrees: {
      control: 'boolean',
      description:
        'Deux sous-entrées dessinées (défaut) ou une seule. Limite nommée : le set dessine au plus deux sous-entrées ; côté Odoo la liste réelle vient de website.menu.',
    },
  },
  args: {
    etat: 'ferme',
    libelle: 'Portes de garage',
    href: '/portes-de-garage',
    chevron: true,
    sousEntree1: 'Portes résidentielles',
    sousEntree2: 'Portes industrielles',
    deuxSousEntrees: true,
  },
} satisfies Meta<typeof MenuEntree>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Ferme: Story = {
  args: { etat: 'ferme' },
};

export const Ouvert: Story = {
  args: { etat: 'ouvert' },
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
      <MenuEntree etat="ferme" />
      <MenuEntree etat="ouvert" />
    </div>
  ),
};
