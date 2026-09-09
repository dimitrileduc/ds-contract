/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/select.contract.json (ds.select v2.1.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './Select';

const meta = {
  title: 'Atoms/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Liste déroulante Piqueray. Relevée sur le candidat v2 « Select · candidat v2 » de la planche 031·21 (2026-09-08 ; composant simple, sans axe State — l'anneau de focus étant code-only, un axe dessiné à la main serait un aperçu creux que la parité refuse), revue et adoptée — pas rédigée à la main.\n\nMotif enveloppe conservé de 1.0.0 : la boîte est présentationnelle, un VRAI <select> natif à l'intérieur porte la valeur et l'accessibilité, le chevron gouverné (registre `chevron-down`, 24) est un frère — un <select> natif ne peut pas héberger un chevron dessiné. Le consommateur fournit les options.\n\nMAJEUR 2.0.0, même passe qu'Input : ancres sur le candidat, bordure color.noir (3:1 exigés), texte 16 px, valeur par défaut vide, anneau de focus déclaré. LIMITE NOMMÉE : le focus se pose sur le <select> intérieur, pas sur la boîte ; le canal d'états d'une part non-racine n'accepte pas outline (color/background-color/border-color seulement), et :focus-within n'est pas un état du schéma. L'anneau du Select est donc un fait CODE-ONLY, à porter dans la feuille Odoo (`.select:focus-within`) et nommé ici. Les props name, id, required, describedBy sont code-only et se posent sur la part `valeur` (le contrôle réel).\n\nVERSION 2.1.0 (2026-09-09, vague « arrondis ») — le littéral border-radius 0px, invisible au différentiel, devient le token radius.4 : le champ est un contrôle comme le bouton, même rayon. Canevas : le candidat v2 de la planche 031 · 21 porte radius/4 ; l'atome DS suivra avec la vague Formulaire v2. Posé sur le canevas AVANT le contrat (§VIII), planches 031 · 26 et 031 · 27 validées puis supprimées, versions nommées avant/après. Ajout purement additif : MINEUR.",
      },
    },
  },
  render: (args) => <Select key={JSON.stringify(args)} {...args} />,
  argTypes: {
    value: {
      control: 'text',
      description: 'Valeur affichée (option sélectionnée). Vide au repos depuis 2.0.0.',
    },
    name: {
      control: 'text',
      description: 'Nom du champ envoyé au serveur, posé sur le <select> réel. Code-only.',
    },
    id: {
      control: 'text',
      description:
        'Identifiant DOM du <select> réel, cible du htmlFor du libellé porté par Field. Code-only.',
    },
    required: {
      control: 'boolean',
      description: 'Attribut natif required sur le <select> réel. Code-only.',
    },
    describedBy: {
      control: 'text',
      description:
        "aria-describedby du <select> réel : identifiant du message d'erreur, unique par champ. Code-only.",
    },
  },
  args: {
    value: '',
    name: '',
    id: '',
    required: false,
    describedBy: '',
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
