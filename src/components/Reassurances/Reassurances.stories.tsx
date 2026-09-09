/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/reassurances.contract.json (ds.reassurances v2.2.1)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Reassurances } from './Reassurances';

const meta = {
  title: 'Sections/Reassurances',
  component: Reassurances,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "2.2.1 (2026-09-09) : correction de SOURCE, contrat inchange dans ses faits. Le « Contactez-nous » du set 031 etait un cadre dessine a la main (« BoutonCinqCartes », texte libre sans style, 18 en dur en Wide) sur les 4 variantes ; remplace par une vraie instance de ds.button (Outline noir, fleche), rendu identique a l'octet sur les 4 exports (28 instances suivent). La marge interieure est celle du style (32) partout : le fait code-only « marge 24 sous 992 » disparait ; reste « pleine largeur sous 992, ajuste au contenu au-dessus ». CSS Odoo par ecran allege d'autant.\n\n2.2.0 (2026-09-08, demande owner) : la grille du BUREAU passe de 3 a 4 colonnes — et d'elle seule ; Mobile, Tablette et Wide sont inchanges, verifie sur le canevas apres le geste. Le declencheur n'est pas esthetique mais arithmetique : sur les six pages qui portent le bloc, QUATRE en rendent quatre cartes (a-propos, portes-entree, portes-industrielles, portes-residentielles) et deux en rendent cinq (home, portes-de-garage). En 3 colonnes, les quatre premieres affichaient donc 3 + 1, une orpheline sur la majorite des pages. En 4 colonnes elles tiennent sur une rangee pleine ; les deux pages a cinq cartes passent de 3 + 2 a 4 + 1, arbitrage owner assume (« si 5 cartes ca reste 4 colonnes, sinon ca rend trop gros »).\n\nLIMITE MESUREE, pas supposee : a 1200 px la carte tombe a 248 et deux libelles passent a deux lignes (« Conseil personnalise », « Service apres-vente »), ce qui porte la carte de 531 a 588 px. A 1440 px la carte fait 308 et les titres tiennent sur une ligne. Aucun debordement a aucune des deux largeurs.\n\n2.1.1 (2026-09-07) : en WIDE, la rangee de cartes cesse d'etre une grille a nombre de colonnes FIXE pour devenir une simple ligne. Le defaut : `columns: 5` etait calcule pour le cas a cinq cartes, donc quatre cartes laissaient une piste vide et le bloc ne remplissait plus la largeur. Le nombre de cartes est du CONTENU — la collection `items`, clonee par item au montage, sans plafond — jamais une variante, et aucun composant du systeme ne compte ses items par un axe. Une ligne resout le probleme SANS rien declarer de neuf : les cartes portent deja `width: 100 %`, donc leur base de flex est egale, donc le retrait se fait au prorata et les colonnes sortent EXACTEMENT egales — 284,4 a cinq cartes, 363,5 a quatre, mesure dans le navigateur le 2026-09-07, au dixieme, identique a ce que rendait la grille. CARRY-BOTH, et c'est ce qui rend ce choix meilleur qu'une regle ecrite a la main : Figma exprime la meme chose nativement avec un auto-layout horizontal dont les enfants sont en Fill, et repartit lui aussi a parts egales. Le canevas reflue donc comme le site quand une carte de moins est posee. PORTEE : le WIDE seulement, decision owner du 2026-09-07. Le Desktop garde sa grille de TROIS colonnes en toutes circonstances — quatre cartes s'y rangent en 3 + 1, exactement comme avant. Mobile et Tablette sont en colonne, inchanges.\n\nPiqueray section « Réassurances », responsive. 2.0.0 (2026-09-02, vague 031) : ré-extraite du set 2700:26297 (page « 031 · Planches de validation »), quatre variantes sur l'axe Presentation. La collection change de mécanique par écran — une carte par ligne sous le seuil bureau, puis une grille de 3 colonnes en Desktop et de 5 en Wide — et les marges suivent 24 / 48 / 56 / 89. Le défaut de `disposition` passe à « 5Cartes », la seule forme que le set dessine ; les deux autres restent en archive. Les vingt cartes de la source étaient des cadres libres : elles ont été remplacées par des instances du composant le 2026-09-02, à zéro pixel de différence sur les quatre vues.\n\nL'en-tête cesse d'être une instance de ds.section-header : le set 031 le dessine à plat, il est donc modélisé dans la section (sur-titre sur typography.overline.*, titre sur le style responsive H2), ce qui lui rend ses tailles par écran — l'ancienne composition figeait le titre à 40 px sur les quatre écrans.\n\nHistorique avant 2.0.0 :\nPiqueray Reassurances. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. v1.3.0 porte les variantes en grille native : 4 colonnes pour « 4 cartes » et « QuatreCartesDeuxCta », 5 pour « 5 cartes » ; les cartes remplissent leur piste. Les 285px observés à 1550px de conteneur étaient une mesure dérivée, jamais une règle de dimension. Le champ items.imageUrl est ajouté pour que les photos des cartes aient une ROUTE de projection (D10 : l'URL n'est jamais un défaut du contrat, elle entre par le consommateur). Plan de document : la partie titre porte la balise h2 (accessibilite-home-odoo, 2026-09-04) ; l'apparence reste pilotee par les jetons typography, axe independant du niveau.",
      },
    },
  },
  render: (args) => <Reassurances key={JSON.stringify(args)} {...args} />,
  argTypes: {
    presentation: {
      control: 'select',
      options: ['mobile', 'tablette', 'desktop', 'wide'],
      description:
        "Présentation par écran, miroir de l'axe Presentation du set 031. Défaut = mobile, première variante du set et base mobile-first du CSS livré ; dans le CSS livré c'est la fenêtre qui choisit, par les jetons de rupture, jamais un consommateur.",
    },
    disposition: {
      control: 'select',
      options: ['4Cartes', 'quatrecartesdeuxcta', '5Cartes'],
      description:
        ' — 2026-09-02 : le set 031 ne dessine QUE la forme à cinq cartes avec un seul bouton ; le défaut passe donc de « 4Cartes » à « 5Cartes ». Les deux autres formes sont conservées en archive (décision owner, comme Empile de ds.carte-categorie), sans axe correspondant sur le canvas : écart de parité acquitté.',
    },
    accroche: {
      control: 'text',
      description:
        'Sur-titre de la section. Le set 031 le dessine sur le nœud, sans propriété TEXT : liaison NONE, écart nommé.',
    },
    titre: {
      control: 'text',
      description: 'Titre de la section. Même remarque : dessiné sur le nœud, liaison NONE.',
    },
    items: {
      control: false,
      description:
        "Les cartes de réassurance, fournies par le consommateur. imageUrl alimente ds.carte.imageUrl : le master pose une peinture IMAGE distincte par carte (imageRef ab6a82d4b83b657d48c90b5e253f82459fd505bf, 8d05df2058fe88fa4b14e4472c9746f03fd100a2, d00de3d48206b57be5125a2d01e8595d3eca56de, 7bd2daf5061e3af6ff4a671f8eca2be1bc10b6fb, relevées sur I2114:3614;2063:1607 … I2114:3617;2063:1607) et Figma n'expose aucune propriété de composant pour ces pixels. Le contrat porte donc la ROUTE, jamais les octets — même convention que ds.hero.backgroundUrl et ds.sav.imageUrl, et le sample laisse imageUrl vide parce qu'un imageRef Figma n'est pas une URL.",
    },
  },
  args: {
    presentation: 'mobile',
    disposition: '5Cartes',
    accroche: 'Plus de 50 ans d’expérience',
    titre: 'Pourquoi choisir nos portes de garage industrielles ?',
    items: [
      {
        texte: 'Respectent les normes des bâtiments publics et les réglementations pompiers.',
        titre: 'Sécurité et conformité',
        imageUrl: '',
      },
      {
        texte:
          'Conçues pour recevoir tout type de bardage (Renson, Trespa, Alubond, Bois ou Eternit).',
        titre: 'Intégration parfaite',
        imageUrl: '',
      },
      {
        texte:
          'Ouverture silencieuse, fluide et ultra-rapide jusqu’à 1 m/s pour un confort optimal.',
        titre: 'Moteur performant',
        imageUrl: '',
      },
      {
        texte:
          'Réactivité maximale garantie grâce à nos techniciens et notre important stock de pièces.',
        titre: 'SAV & maintenance dédiés',
        imageUrl: '',
      },
    ],
  },
} satisfies Meta<typeof Reassurances>;

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
/** Every legal combination the contract defines (presentation × disposition). */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(3, max-content)',
        alignItems: 'center',
        justifyItems: 'start',
      }}
    >
      <Reassurances presentation="mobile" disposition="4Cartes" />
      <Reassurances presentation="mobile" disposition="quatrecartesdeuxcta" />
      <Reassurances presentation="mobile" disposition="5Cartes" />
      <Reassurances presentation="tablette" disposition="4Cartes" />
      <Reassurances presentation="tablette" disposition="quatrecartesdeuxcta" />
      <Reassurances presentation="tablette" disposition="5Cartes" />
      <Reassurances presentation="desktop" disposition="4Cartes" />
      <Reassurances presentation="desktop" disposition="quatrecartesdeuxcta" />
      <Reassurances presentation="desktop" disposition="5Cartes" />
      <Reassurances presentation="wide" disposition="4Cartes" />
      <Reassurances presentation="wide" disposition="quatrecartesdeuxcta" />
      <Reassurances presentation="wide" disposition="5Cartes" />
    </div>
  ),
};
