/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/google-reviews.contract.json (ds.google-reviews v2.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { GoogleReviews } from './GoogleReviews';

const meta = {
  title: 'Sections/GoogleReviews',
  component: GoogleReviews,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Le bloc « Avis Google » historique. Le nouveau parent public `ds.google-reviews-section` le compose avec `ds.section-header`, sans modifier sa surface Odoo authorée existante. La grille garde cinq colonnes égales et les flèches restent des overlays absolus.',
      },
    },
  },
  render: (args) => <GoogleReviews key={JSON.stringify(args)} {...args} />,
  argTypes: {
    noteGlobale: {
      control: 'text',
      description:
        'Note globale telle qu affichee par le widget — POINT decimal (4.8), pas une virgule : mesure directe sur l aplat (T040, corrige une transcription initiale fautive).',
    },
    qualificatif: {
      control: 'text',
      description:
        "Libellé qualitatif du widget (« Excellent » mesuré sur l'aplat, T012) — texte de chrome du widget, pas un avis individuel, mais porté par propriété comme le reste du contenu réel.",
    },
    volume: { control: 'text' },
    montrerControles: {
      control: 'boolean',
      description: "Flèches de carrousel — mesurées présentes aux deux bords de l'aplat (T012).",
    },
    avis: {
      control: false,
      description:
        "La collection de cartes — code-only par construction (figma.kind:'NONE' obligatoire pour un arrayOf, R8). React mappe le tableau vivant ; html/react-inline/canevas rendent le `sample` du repeat (générique, jamais le contenu réel — FR-010).",
    },
  },
  args: {
    noteGlobale: '4.8',
    qualificatif: 'Excellent',
    volume: '93 avis',
    montrerControles: true,
    avis: [
      {
        auteur: 'Prénom N.',
        initiale: 'P',
        date: 'il y a 2 mois',
        texte: 'Un témoignage neutre, exemple générique de contenu.',
        avatar: 'Initiale',
        note: '5',
        photoUrl: '',
        photoAlt: '',
      },
      {
        auteur: 'Prénom N.',
        initiale: 'P',
        date: 'il y a 3 mois',
        texte: 'Un témoignage neutre, exemple générique de contenu.',
        avatar: 'Initiale',
        note: '5',
        photoUrl: '',
        photoAlt: '',
      },
      {
        auteur: 'Prénom N.',
        initiale: 'P',
        date: 'il y a 4 mois',
        texte: 'Un témoignage neutre, exemple générique de contenu.',
        avatar: 'Initiale',
        note: '5',
        photoUrl: '',
        photoAlt: '',
      },
      {
        auteur: 'Prénom N.',
        initiale: 'P',
        date: 'il y a 5 mois',
        texte: 'Un témoignage neutre, exemple générique de contenu.',
        avatar: 'Initiale',
        note: '5',
        photoUrl: '',
        photoAlt: '',
      },
      {
        auteur: 'Prénom N.',
        initiale: 'P',
        date: 'il y a 6 mois',
        texte: 'Un témoignage neutre, exemple générique de contenu.',
        avatar: 'Initiale',
        note: '5',
        photoUrl: '',
        photoAlt: '',
      },
    ],
  },
} satisfies Meta<typeof GoogleReviews>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
