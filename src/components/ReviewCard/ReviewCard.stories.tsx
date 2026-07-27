/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/review-card.contract.json (ds.review-card v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReviewCard } from './ReviewCard';

const meta = {
  title: 'Molecules/ReviewCard',
  component: ReviewCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Une carte d'avis Google, mesurée sur les octets natifs de l'aplat « Avis Google » (widget tiers Trustindex/Google, dernière zone hors gouvernance du fichier Piqueray — spec 006). Contrat d'abord, master généré : aucun master dessiné à la main (première du dépôt, R1). Le master reste GÉNÉRIQUE par construction (contenu d'exemple neutre) ; le contenu réel des avis vit sur les 8 occurrences adoptées, porté par propriétés (jamais par override brut).\n\nLimites nommées (measures/mesures-aplat.md, measures/faisabilite-canaux.md) : (1) l'exclusion pastille/photo est une CONVENTION de deux booléens indépendants, pas une contrainte de schéma — `visibleWhen` n'a pas de négation et un axe d'enum romprait la variation par item du `repeat` ; (2) la couleur de fond de la pastille-initiale est FIXE et gouvernée — les 5 avis réels portent 5 teintes différentes, non modélisables (aucun canal ne lie une couleur CSS à une valeur de texte libre par item) ; écart assumé, arbitré par l'owner (« la couleur, rien à faire ») ; (3) l'avatar photo reste un aplat gris + † sur le canevas — trou A5, non refermé (R6) ; le pixel réel est un override de fill IMAGE hors contrat, appliqué après le dernier amend ; (4) la séparation carte/fond du widget réel est une ombre douce (mesurée par balayage de bord : dégradé lisse sur ~15px) — `box-shadow` étant hors des deux registres de canaux, le repli est une bordure fine 1px, seul canal disponible.",
      },
    },
  },
  render: (args) => <ReviewCard key={JSON.stringify(args)} {...args} />,
  argTypes: {
    auteur: { control: 'text' },
    initiale: { control: 'text' },
    date: { control: 'text' },
    texte: { control: 'text' },
    tronque: {
      control: 'boolean',
      description:
        "Trouvaille de la convergence T040 : le widget affiche un lien « Lire la suite » sous les avis qu'il a lui-même tronqués (ellipse déjà présente dans `texte`), absent sur les avis complets (mesuré : Thierry Picard, carte 4). La troncature multi-lignes elle-même reste refusée (R10, `-webkit-line-clamp` hors registre) — ce booléen ne gouverne QUE la visibilité du lien.",
    },
    initialeVisible: { control: 'boolean' },
    photo: { control: 'boolean' },
    photoUrl: {
      control: 'text',
      description:
        "src côté code ; inerte sur le canevas (trou A5, R6) — une prop scalaire ne peut pas être figma.kind:'NONE'.",
    },
    photoAlt: { control: 'text' },
    verifie: { control: 'boolean' },
  },
  args: {
    auteur: 'Prénom N.',
    initiale: 'P',
    date: 'il y a 2 mois',
    texte: 'Un témoignage neutre, exemple générique de contenu.',
    tronque: false,
    initialeVisible: true,
    photo: false,
    photoUrl: '',
    photoAlt: '',
    verifie: true,
  },
} satisfies Meta<typeof ReviewCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
