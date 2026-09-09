/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/produits-ecommerce.contract.json (ds.produits-ecommerce v2.2.1)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProduitsECommerce } from './ProduitsECommerce';

const meta = {
  title: 'Sections/ProduitsECommerce',
  component: ProduitsECommerce,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "2.2.1 (2026-09-09, decision owner, option A « lien en place ») : « Voir les produits » passe du style outlineNoir au style link avec fleche (iconRight), sur les trois parts Bouton / BoutonWide / BoutonPied — c'est de la NAVIGATION, pas de la conversion, et il pesait autant que le « Contactez-nous » de Reassurances. Source Figma posee d'abord (8 boutons du set, visibilites inchangees, 60 instances suivent). Un lien fait 30 de haut au lieu de 54 : la section raccourcit (Wide 522 → 518, Mobile 454 → 430). Le bouton de pied garde sa pleine largeur sous 992 (FILL), le libelle se centre dedans — c'est la boite du master.\n\nPiqueray ProduitsECommerce, responsive (vague 031). 2.0.0 (2026-09-04) : les ancres passent de l'ancien master DS 2116:4475 (une variante) au set 031 `ProduitsECommerce` 2694:21337, quatre variantes Presentation — la seule section de la home restée hors de la vague, ce qui figeait ses cartes à 364 px à toutes les largeurs et faisait déborder la page horizontalement. La source a été nettoyée avant extraction (journal specs/tiny/vague-031/produits-ecommerce.md) : structure unifiée sur UN arbre pour les quatre variantes, Bouton et CarouselControls re-liés en instances, écart des contrôles rétabli (SPACE_BETWEEN annulait le gap — dixième occurrence). Deux formes selon l'écran, portées par présence et par layoutByProp : Mobile et Tablette montrent le titre seul puis le bouton pleine largeur en pied, contrôles masqués ; Desktop et Wide mettent le titre et le bouton sur une ligne et affichent les contrôles sous la piste. La piste est bornée par le cadre sous 992 et libre au-delà : elle déborde volontairement du cadre rognant, c'est le carrousel. Wide dessine cinq cartes, les autres quatre. Le mécanisme du carrousel est DIFFÉRÉ (décision owner 2026-09-04) : les contrôles sont inertes, le glissement au doigt viendra plus tard. Le 2026-09-04, la propriété TEXT « Titre » a été ajoutée au set et référencée par les quatre variantes : le titre est désormais une donnée liée, pas un texte dessiné. Plan de document : la partie titre porte la balise h2 (accessibilite-home-odoo, 2026-09-04) ; l'apparence reste pilotee par les jetons typography, axe independant du niveau. 2.2.0 (2026-09-07, vague 034) : le carrousel DÉFILE. Le cadre carrouselProduits porte overflow-x auto en canal declared — CARRY-CODE-ONLY : le canvas garde clipsContent, le code devient un conteneur de défilement horizontal (overflow-y reste hidden). La piste Produits perd son width fill Mobile/Tablette, corrigé À LA SOURCE (§VIII) le 2026-09-07 : les pistes 2694:21090 et 2694:21149 passent de FILL à HUG comme Desktop et Wide (versions Figma 2396423436246074729 avant, 2396428224592792964 puis 2396429110435865682 après ; 8 instances avant, 8 après ; cadres inchangés). Second défaut de source trouvé PAR LA MESURE : les cadres Mobile 2694:21089 et Tablette 2694:21148 alignaient leur contre-axe à la FIN (MAX), invisible tant que la piste était fill ; en HUG la piste de 1088 se calait à droite et l'instance montrait la fin de la piste (29,7 % de pixels en Mobile, 38,8 % en Tablette). Alignés au début comme Desktop, Wide et le contrat (align start) : 0 pixel d'écart entre l'avant et l'après final sur les quatre instances visibles. En Mobile les quatre cartes de 260 faisaient déjà 1088 px dans une piste de 366 : elles débordaient, rognées par le cadre — la phrase « les cartes rétrécissent » de la 2.0.0 était fausse. Le scroll-snap, le pas des boutons (largeur de carte + écart, lus dans le DOM) et l'ARIA de carrousel (région, diapositives « n sur N », piste focalisable) sont des faits code-only hors schéma (matrice l. 178), portés par la zone Odoo manuelle responsive/produits-ecommerce.pqr.css et l'Interaction produits_ecommerce_carrousel_interaction.js ; la bibliothèque React reste inerte (DW-034-001). Le bouton en bout de piste reçoit aria-disabled mais ne se grise pas : ds.button n'a pas d'état disabled (DW-034-002).",
      },
    },
  },
  render: (args) => <ProduitsECommerce key={JSON.stringify(args)} {...args} />,
  argTypes: {
    presentation: {
      control: 'select',
      options: ['mobile', 'tablette', 'desktop', 'wide'],
      description:
        "L'étage responsive (axe Presentation du set 031). Défaut = première variante du set (mobile), la parité l'exige. Côté Odoo la valeur n'est jamais posée : responsive/produits-ecommerce.pqr.css réécrit les règles par mode en @media.",
    },
    titre: {
      control: false,
      description:
        "Titre de section, lié à la propriété TEXT « Titre » du set. La liaison a été POSÉE À LA SOURCE le 2026-09-04 (§VIII) : le set 031 n'exposait aucune propriété TEXT, le titre n'était qu'un texte dessiné et le contrat le portait en NONE. La propriété est maintenant définie sur le set et les quatre variantes y réfèrent leur nœud Titre.",
    },
    produits: {
      control: false,
      description:
        "La collection de produits — code-only par construction (arrayOf ⇔ figma NONE). Le canevas rend le `sample` du repeat : cinq entrées, l'union des cartes dessinées (Wide en montre cinq, les autres quatre). Côté Odoo la liste vient du descripteur de page.",
    },
  },
  args: {
    presentation: 'mobile',
    titre: [{ text: 'Découvrez nos produits disponibles en ligne' }],
    produits: [
      { titre: 'Télécommande Hörmann HSE4-868BS', prix: '74,99€' },
      { titre: 'Clavier à code Hörmann FCT3-1BS', prix: '139,99€' },
      { titre: 'Bouton poussoir Hörmann FIT2-1-868-BS', prix: '89,99€' },
      { titre: 'Passerelle BiSecure Hörmann', prix: '74,99€' },
      { titre: 'Télécommande Hörmann HSE4-868BS', prix: '74,99€' },
    ],
  },
} satisfies Meta<typeof ProduitsECommerce>;

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
      <ProduitsECommerce presentation="mobile" />
      <ProduitsECommerce presentation="tablette" />
      <ProduitsECommerce presentation="desktop" />
      <ProduitsECommerce presentation="wide" />
    </div>
  ),
};
