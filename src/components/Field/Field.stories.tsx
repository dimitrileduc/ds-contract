/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/field.contract.json (ds.field v3.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '../Input';
import { Field } from './Field';

const meta = {
  title: 'Molecules/Field',
  component: Field,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Champ de formulaire Piqueray : un libellé, un contrôle de saisie slotté, un message d'erreur. Relevé sur le candidat v2 « Field · candidat v2 » de la planche 031·21 (2026-09-08), revu et adopté — pas rédigé à la main.\n\nMAJEUR 3.0.0 — la molécule tient enfin ce que les atomes de la spec 004 promettaient quatre fois (« Field s'en occupe ») : le libellé devient un VRAI <label for> relié au contrôle (prop inputID, motif inputID + htmlFor de l'archive demo-51, seul précédent du dépôt) ; le message d'erreur reçoit un identifiant UNIQUE par champ (prop erreurID — 2.0.0 partageait `field-error-message` en dur entre tous les champs, ce qui cassait l'association pour les lecteurs d'écran dès le deuxième champ) ; le libellé passe de bleu-gris 20 SemiBold (2,32:1, illisible) à noir-bleuté sur le rôle typography.body (16/24 puis 18/27 par écran, Medium) ; une marque d'obligation « * » apparaît (prop obligatoire, motif requiredMark de l'archive) ; la bordure de repos du contrôle passe à color.noir (3:1 exigés).\n\nUne molécule n'a pas d'axe présentation : la taille du libellé varie par écran par les jetons typography.body.* (variables Responsive au canevas). L'état Erreur du contrôle est une SURCHARGE de couleur de bordure forwardée au contrôle slotté (control.styles), pas un swap de variante : mesuré le 2026-09-08, des instances imbriquées liées à la même propriété de swap bougent ENSEMBLE. Le canevas ne porte pas aria-invalid : forwardé au contrôle par control.attributes (code-only). L'attribut aria-describedby n'est plus forwardé ici — il est posé par l'atome (prop describedBy) avec l'identifiant fourni par le composant qui compose, pour rester unique.",
      },
    },
  },
  render: (args) => (
    <Field key={JSON.stringify(args)} {...args}>
      <Input value="" />
    </Field>
  ),
  argTypes: {
    etat: { control: 'select', options: ['normal', 'erreur'] },
    label: { control: 'text' },
    optionnel: {
      control: 'boolean',
      description:
        'Affiche la mention « (optionnel) » après le libellé. Marquer les DEUX catégories (obligatoire et optionnel) est la recommandation Baymard.',
    },
    obligatoire: {
      control: 'boolean',
      description:
        "Affiche la marque « * » après le libellé (aria-hidden : l'obligation réelle est l'attribut required du contrôle, annoncé nativement).",
    },
    inputID: {
      control: 'text',
      description:
        "Identifiant du contrôle slotté : cible du htmlFor du libellé. Code-only ; le composant qui compose fournit la même valeur à l'atome (prop id) et ici.",
    },
    erreurID: {
      control: 'text',
      description:
        "Identifiant du message d'erreur, unique par champ ; le composant qui compose fournit la même valeur à l'atome (prop describedBy). Code-only.",
    },
    messageErreur: {
      control: 'text',
      description:
        "Texte du message d'erreur, affiché sous le contrôle en état erreur. Dit ce qui manque et comment corriger — jamais « invalide ». Code-only (le canevas dessine le texte témoin).",
    },
    children: { control: false },
  },
  args: {
    etat: 'normal',
    label: 'Libellé',
    optionnel: false,
    obligatoire: false,
    inputID: '',
    erreurID: '',
    messageErreur: 'Message d’erreur',
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Normal: Story = {
  args: { etat: 'normal' },
};

export const Erreur: Story = {
  args: { etat: 'erreur' },
};
