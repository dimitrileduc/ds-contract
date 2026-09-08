/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/textarea.contract.json (ds.textarea v2.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './Textarea';

const meta = {
  title: 'Atoms/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Zone de texte Piqueray sur plusieurs lignes. Relevée sur le candidat v2 « Textarea · candidat v2 » de la planche 031·21 (2026-09-08), revue et adoptée — pas rédigée à la main.\n\nMAJEUR 2.0.0, même passe que Input : ancres sur le candidat, bordure color.noir (3:1 exigés, 11,85:1 obtenus), texte 16 px (zoom iOS), valeur par défaut vide (1.0.0 livrait « Texte de saisie » pré-rempli), anneau de focus dessiné (color.etat.champ.anneau-focus). Ne diffère d'Input que par la forme : hauteur fixe size.textarea.root (128) et texte calé en haut (axe transversal MIN au canevas).\n\nLes props placeholder, name, id, autocomplete, required et describedBy sont CODE-ONLY (liaison figma NONE), portés par attrs/attrsByProp sans évolution de schéma. Le redimensionnement vertical par l'utilisateur reste possible (aucune règle resize ici : ne pas bloquer une zone où l'on écrit 500 caractères). Limite nommée : trait extérieur 2 px au canevas ≈ outline décalé de 2 px en CSS.",
      },
    },
  },
  render: (args) => <Textarea key={JSON.stringify(args)} {...args} />,
  argTypes: {
    value: { control: 'text', description: 'Valeur saisie. Vide au repos depuis 2.0.0.' },
    placeholder: {
      control: 'text',
      description: 'Aide à la saisie, visible seulement quand la zone est vide. Code-only.',
    },
    name: {
      control: 'text',
      description:
        'Nom du champ envoyé au serveur. Code-only ; posé explicitement par le formulaire.',
    },
    id: {
      control: 'text',
      description:
        'Identifiant DOM, cible du htmlFor du libellé porté par Field. Code-only, unique par champ.',
    },
    autocomplete: { control: 'text', description: 'Jeton autocomplete HTML. Code-only.' },
    required: {
      control: 'boolean',
      description: 'Attribut natif required. Code-only ; la marque visible est dessinée par Field.',
    },
    describedBy: {
      control: 'text',
      description:
        "aria-describedby : identifiant du message d'erreur de ce champ, unique par champ. Code-only.",
    },
  },
  args: {
    value: '',
    placeholder: '',
    name: '',
    id: '',
    autocomplete: 'off',
    required: false,
    describedBy: '',
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
