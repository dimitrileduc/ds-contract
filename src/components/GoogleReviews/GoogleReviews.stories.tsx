/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/google-reviews.contract.json (ds.google-reviews v3.1.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { GoogleReviews } from './GoogleReviews';

const meta = {
  title: 'Components/GoogleReviews',
  component: GoogleReviews,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "PROPOSED contract extracted from the design canvas (extract/figma dump v1) — API, anatomy, and token bindings inverted from the drawn structure. Semantics beyond the name/axis inference table, a11y, events, and slot accepts are not canvas-recoverable; review before adoption. Correction 2026-09-04 : les cinq entrées de `sample` omettaient trois clés du type de l'élément (avatar, note, lienAvis) — le typage de l'histoire générée refusait de compiler. Complétées avec la valeur dessinée : avatar Initiale, note 5, lien vide. Plan de document : la partie titre porte la balise h2 (accessibilite-home-odoo, 2026-09-04) ; l'apparence reste pilotee par les jetons typography, axe independant du niveau.",
      },
    },
  },
  render: (args) => <GoogleReviews key={JSON.stringify(args)} {...args} />,
  argTypes: {
    presentation: { control: 'select', options: ['mobile', 'tablette', 'desktop', 'wide'] },
    accroche: { control: 'text' },
    titre: { control: 'text' },
    qualificatif: {
      control: 'text',
      description:
        "Libellé qualitatif du widget (« Excellent » mesuré sur l'aplat, T012) — texte de chrome du widget, pas un avis individuel, mais porté par propriété comme le reste du contenu réel.",
    },
    noteGlobale: {
      control: 'text',
      description:
        'Note globale telle qu affichee par le widget — POINT decimal (4.8), pas une virgule : mesure directe sur l aplat (T040, corrige une transcription initiale fautive).',
    },
    volume: { control: 'text' },
    avis: {
      control: false,
      description:
        "La collection de cartes — code-only par construction (figma.kind:'NONE' obligatoire pour un arrayOf, R8). React mappe le tableau vivant ; html/react-inline/canevas rendent le `sample` du repeat (générique, jamais le contenu réel — FR-010). Chaque avis porte son propre `lienAvis` : l'adresse de l'avis Google d'origine, ouverte par le bouton « Lire la suite » de sa carte.",
    },
    note: {
      control: 'select',
      options: ['1', '2', '3', '4', '5'],
      description:
        "Nombre d'étoiles pleines du bloc résumé. Pilote la variante du composant gouverné ds.notation. Le composant ne connaît que des notes ENTIÈRES : une note affichée « 4.8 » se dessine avec cinq étoiles pleines, ce que fait la maquette. Réglable depuis le panneau Odoo, pas en édition directe (décision owner 2026-09-03).",
    },
    lienAvis: {
      control: 'text',
      description:
        "Adresse du bouton « Voir tous les avis » — la fiche Google de l'établissement. Réglable depuis le panneau Odoo. Vide, le bouton ne navigue pas.",
    },
  },
  args: {
    presentation: 'mobile',
    accroche: 'Nos avis Google vérifiés',
    titre: 'Plus de 1500 portes installées par année et autant de clients satisfaits',
    qualificatif: 'Excellent',
    noteGlobale: '4.8',
    volume: '93 avis',
    avis: [
      {
        photoAlt: '',
        texte: 'super très pro et service après vente présent',
        photoUrl: '',
        date: 'il y a 2 mois',
        initiale: 'P',
        auteur: 'pho syster',
        avatar: 'Initiale',
        note: '5',
        lienAvis: '',
      },
      {
        photoAlt: '',
        texte:
          'Je vous envoie mon message un peu tardivement car problème de boite mail. Super ravie du travail réalisé…',
        photoUrl: '',
        date: 'il y a 3 mois',
        initiale: 'P',
        auteur: 'Petit Nicole',
        avatar: 'Initiale',
        note: '5',
        lienAvis: '',
      },
      {
        photoAlt: '',
        texte:
          'Travail propre, soigné, ouvrier expert dans son métier, super suivi par Wael (technicien installation) qui est à fait le suivi…',
        photoUrl: '',
        date: 'il y a 4 mois',
        initiale: 'A',
        auteur: 'Aun Bukhari',
        avatar: 'Initiale',
        note: '5',
        lienAvis: '',
      },
      {
        photoAlt: '',
        texte: 'Dépannage ultra rapide et professionnel',
        photoUrl: '',
        date: 'il y a 5 mois',
        initiale: 'T',
        auteur: 'Thierry Picard',
        avatar: 'Initiale',
        note: '5',
        lienAvis: '',
      },
      {
        photoAlt: '',
        texte: 'Je ne mais pas 5 étoiles mais 10 les 2 placeurs de mes 2 portes de garage il…',
        photoUrl: '',
        date: 'il y a 6 mois',
        initiale: 'm',
        auteur: 'miguel martinez',
        avatar: 'Initiale',
        note: '5',
        lienAvis: '',
      },
    ],
    note: '5',
    lienAvis: '',
  },
} satisfies Meta<typeof GoogleReviews>;

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
/** Every legal combination the contract defines (presentation × note). */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(5, max-content)',
        alignItems: 'center',
        justifyItems: 'start',
      }}
    >
      <GoogleReviews presentation="mobile" note="1" />
      <GoogleReviews presentation="mobile" note="2" />
      <GoogleReviews presentation="mobile" note="3" />
      <GoogleReviews presentation="mobile" note="4" />
      <GoogleReviews presentation="mobile" note="5" />
      <GoogleReviews presentation="tablette" note="1" />
      <GoogleReviews presentation="tablette" note="2" />
      <GoogleReviews presentation="tablette" note="3" />
      <GoogleReviews presentation="tablette" note="4" />
      <GoogleReviews presentation="tablette" note="5" />
      <GoogleReviews presentation="desktop" note="1" />
      <GoogleReviews presentation="desktop" note="2" />
      <GoogleReviews presentation="desktop" note="3" />
      <GoogleReviews presentation="desktop" note="4" />
      <GoogleReviews presentation="desktop" note="5" />
      <GoogleReviews presentation="wide" note="1" />
      <GoogleReviews presentation="wide" note="2" />
      <GoogleReviews presentation="wide" note="3" />
      <GoogleReviews presentation="wide" note="4" />
      <GoogleReviews presentation="wide" note="5" />
    </div>
  ),
};
