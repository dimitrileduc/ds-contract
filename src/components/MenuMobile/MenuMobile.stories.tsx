/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/menu-mobile.contract.json (ds.menu-mobile v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MenuMobile } from './MenuMobile';

const meta = {
  title: 'Sections/MenuMobile',
  component: MenuMobile,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Le menu ouvert du header en Mobile et Tablette (vague 031, décision owner 2026-09-04 : piste A plein écran en Mobile, piste B tiroir en Tablette). Extrait du set 031 `MenuMobile` 2738:13621 (journal specs/tiny/vague-031/menu-mobile.md). Composant SÉPARÉ du header : « ouvert » n'est pas une prop de ds.header — l'ouverture est une interaction (prototype Figma, offcanvas natif côté Odoo), doctrine de la matrice §9 et des contrats de nav de l'archive. Anatomie commune aux deux variantes : root (l'écran) > voile (Tablette seule, color.noir-bleute-72) + tiroir (Mobile : toute la largeur ; Tablette : size.menu-mobile.tiroir = 420 ancré à droite) > barre (logo en Mobile, icônes compte et panier, croix 44) · nav (répétition de ds.menu-entree) · pied (téléphone + Contactez-nous, zone du pouce). La hauteur de l'écran (844 / 1194 sur le set) n'est pas portée : côté Odoo le panneau prend la hauteur de la fenêtre (fait code-only nommé). Motion, code-only : ouverture en fondu 280 ms ease-out avec montée des entrées décalées de 40 ms en Mobile, glissement depuis la droite 300 ms + fondu du voile en Tablette ; fermeture 180 / 200 ms ease-in ; opacité et transform seulement.",
      },
    },
  },
  render: (args) => <MenuMobile key={JSON.stringify(args)} {...args} />,
  argTypes: {
    presentation: {
      control: 'select',
      options: ['mobile', 'tablette'],
      description:
        "Deux étages seulement : le menu n'existe pas en Desktop ni en Wide (la nav est dans la barre). Côté Odoo la valeur n'est jamais posée : responsive/menu-mobile.pqr.css réécrit les règles par mode en @media.",
    },
    items: {
      control: false,
      description:
        'Les entrées du menu — code-only par construction (arrayOf ⇔ figma NONE). Même donnée que ds.header.items, côté Odoo la boucle sur website.menu. Limite nommée : une liste dans une liste ne se porte pas (au plus deux sous-entrées par entrée dans le dessin ; la liste réelle vient du menu du client).',
    },
  },
  args: {
    presentation: 'mobile',
    items: [
      {
        libelle: 'Portes de garage',
        href: '/portes-de-garage',
        chevron: true,
        sousEntree1: 'Portes résidentielles',
        sousEntree2: 'Portes industrielles',
        deuxSousEntrees: true,
      },
      {
        libelle: 'Portes d’entrée',
        href: '/portes-entree',
        chevron: true,
        sousEntree1: 'Motorisation',
        sousEntree2: '',
        deuxSousEntrees: false,
      },
      {
        libelle: 'Dépannage/SAV',
        href: '/depannage-sav',
        chevron: false,
        sousEntree1: '',
        sousEntree2: '',
        deuxSousEntrees: false,
      },
      {
        libelle: 'À propos',
        href: '/a-propos',
        chevron: false,
        sousEntree1: '',
        sousEntree2: '',
        deuxSousEntrees: false,
      },
    ],
  },
} satisfies Meta<typeof MenuMobile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Mobile: Story = {
  args: { presentation: 'mobile' },
};

export const Tablette: Story = {
  args: { presentation: 'tablette' },
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
      <MenuMobile presentation="mobile" />
      <MenuMobile presentation="tablette" />
    </div>
  ),
};
