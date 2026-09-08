/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/input.contract.json (ds.input v2.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';

const meta = {
  title: 'Atoms/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Champ de saisie Piqueray sur une ligne. Relevé sur le candidat v2 « Input · candidat v2 » de la planche 031·21 (2026-09-08), revu et adopté — pas rédigé à la main.\n\nMAJEUR 2.0.0 : les ancres passent au set candidat ; la bordure passe de bleu-gris (2,51:1 sur blanc, sous le seuil de 3:1) à color.noir ; le texte saisi passe de 14 à 16 px (sous 16, Safari iOS zoome à chaque entrée) ; la valeur par défaut devient vide (1.0.0 livrait un champ PRÉ-REMPLI de « Texte de saisie », que le visiteur devait effacer) ; l'anneau de focus est dessiné (jeton color.etat.champ.anneau-focus, même recette que les boutons de la vague 032 : trait 2 px, à 2 px du bord).\n\nLes props placeholder, type, name, id, autocomplete, required et describedBy sont CODE-ONLY (liaison figma NONE) : le canevas ne dessine pas un attribut HTML. Ils passent par le canal attrs/attrsByProp existant, sans évolution de schéma. L'association libellé↔champ est portée par le parent Field (htmlFor = inputID) et par l'id posé ici : le composant qui compose fournit les deux, explicitement. Pas de règle de validation ici : elle appartient au formulaire et au serveur.\n\nLimite nommée : Figma ne porte pas de trait décalé — le candidat approxime l'anneau par un trait EXTÉRIEUR de 2 px, le CSS le rend en outline avec un décalage de 2 px. Le trait de repos 1 px (bordure) et l'anneau (outline) coexistent en CSS, pas au canevas.",
      },
    },
  },
  render: (args) => <Input key={JSON.stringify(args)} {...args} />,
  argTypes: {
    value: {
      control: 'text',
      description:
        'Valeur saisie. Vide au repos depuis 2.0.0 — un texte par défaut est une VALEUR, pas une aide à la saisie (voir placeholder).',
    },
    placeholder: {
      control: 'text',
      description:
        "Aide à la saisie, affichée seulement quand le champ est vide. Code-only : le canevas n'a pas de notion de placeholder.",
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'tel'],
      description:
        'Type natif du contrôle : décide du clavier mobile (@ pour email, pavé numérique pour tel) et de la validation native. Code-only.',
    },
    name: {
      control: 'text',
      description:
        "Nom du champ envoyé au serveur. Code-only. Un nom absent ou mal orthographié n'échoue pas côté Odoo : la valeur est rangée en silence en texte libre — c'est au formulaire de le poser explicitement.",
    },
    id: {
      control: 'text',
      description:
        'Identifiant DOM, cible du htmlFor du libellé porté par Field. Code-only. Unique par champ dans une page : fourni par le composant qui compose.',
    },
    autocomplete: {
      control: 'text',
      description:
        'Jeton autocomplete HTML (given-name, family-name, email, tel…) — critère WCAG 1.3.5, pas un confort. Code-only.',
    },
    required: {
      control: 'boolean',
      description:
        "Champ obligatoire : attribut natif required (annoncé « obligatoire » par les lecteurs d'écran). Code-only ; la marque visible « * » est dessinée par Field (prop obligatoire).",
    },
    describedBy: {
      control: 'text',
      description:
        "aria-describedby : l'identifiant du message d'erreur de ce champ (unique par champ — 1.0.0 partageait un seul identifiant en dur entre tous les champs, ce qui cassait l'association pour les lecteurs d'écran). Code-only ; fourni par le composant qui compose, vide sinon.",
    },
  },
  args: {
    value: '',
    placeholder: '',
    type: 'text',
    name: '',
    id: '',
    autocomplete: 'off',
    required: false,
    describedBy: '',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Text: Story = {
  args: { type: 'text' },
};

export const Email: Story = {
  args: { type: 'email' },
};

export const Tel: Story = {
  args: { type: 'tel' },
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
      <Input type="text" />
      <Input type="email" />
      <Input type="tel" />
    </div>
  ),
};
