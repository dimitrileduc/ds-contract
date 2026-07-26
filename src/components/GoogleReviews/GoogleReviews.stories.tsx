/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/google-reviews.contract.json (ds.google-reviews v1.0.0)
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
          "Le bloc « Avis Google » — dernier aplat tiers du fichier Piqueray (widget Trustindex/Google, spec 006). Périmètre = le RECTANGLE de l'aplat seul (1552 × ~328 dessiné), PAS le GROUP entier : l'instance de Section-header voisine reste un frère intact (FR-008), jamais absorbée dans ce contrat. Hauteur du root contrainte à la hauteur mesurée de l'aplat (neutralité de hauteur, R20) — une adoption qui changerait cette hauteur est un STOP, jamais une donnée.\n\nContrat d'abord, master généré (R1) : le master naît générique (`repeat.sample` porte 5 enregistrements neutres) ; le contenu réel des 8 occurrences vit en overrides de propriétés sur les instances de carte imbriquées (FR-010, via le mécanisme documenté R8 — aucune prop de section ne porte la collection côté canevas, `avis` est figma.kind:'NONE' par construction).\n\nInterdit dur : AUCUN `component`-ref vers `ds.button` dans ce contrat (R5) — la résolution des dépendances imbriquées se fait par NOM (`findComponentByName`), le contrat dirait `Button`, le master vivant s'appelle « Bouton » : le script poussé échouerait. Les flèches de carrousel et le CTA « Écrire un avis » sont donc dessinés en parts (frame + icon.asset / texte), jamais des instances de composant. Réemploi perdu, nommé (FR-007).\n\nSimplification nommée : les flèches sont modélisées comme des enfants flex adjacents à la rangée de cartes (pas un overlay/positionnement absolu) — l'aplat les montre en léger chevauchement des bords de carte 1/5 ; à raffiner pendant la convergence (T040) si l'écart mesuré le justifie.",
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
        initialeVisible: true,
        photo: false,
        photoUrl: '',
        photoAlt: '',
        verifie: true,
        tronque: false,
      },
      {
        auteur: 'Prénom N.',
        initiale: 'P',
        date: 'il y a 3 mois',
        texte: 'Un témoignage neutre, exemple générique de contenu.',
        initialeVisible: true,
        photo: false,
        photoUrl: '',
        photoAlt: '',
        verifie: true,
        tronque: false,
      },
      {
        auteur: 'Prénom N.',
        initiale: 'P',
        date: 'il y a 4 mois',
        texte: 'Un témoignage neutre, exemple générique de contenu.',
        initialeVisible: true,
        photo: false,
        photoUrl: '',
        photoAlt: '',
        verifie: true,
        tronque: false,
      },
      {
        auteur: 'Prénom N.',
        initiale: 'P',
        date: 'il y a 5 mois',
        texte: 'Un témoignage neutre, exemple générique de contenu.',
        initialeVisible: true,
        photo: false,
        photoUrl: '',
        photoAlt: '',
        verifie: true,
        tronque: false,
      },
      {
        auteur: 'Prénom N.',
        initiale: 'P',
        date: 'il y a 6 mois',
        texte: 'Un témoignage neutre, exemple générique de contenu.',
        initialeVisible: true,
        photo: false,
        photoUrl: '',
        photoAlt: '',
        verifie: true,
        tronque: false,
      },
    ],
  },
} satisfies Meta<typeof GoogleReviews>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
