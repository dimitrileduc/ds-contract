/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/notation.contract.json (ds.notation v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Notation } from './Notation';

const meta = {
  title: 'Atoms/Notation',
  component: Notation,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Bandeau de cinq étoiles portant une note entière de 1 à 5. Créé le 2026-08-18 sur demande owner : la note d'un avis était le seul fait important non éditable (ni en code, ni dans Odoo), parce que la spec 006 avait supprimé l'axe `note` (R7) sur deux prémisses — tous les avis mesurés étaient à 5/5, et l'icône gouvernée `star` est orange intrinsèque. La première prémisse tombe (décision owner) ; la seconde tient, d'où le glyphe interne `star-empty` (même géométrie, gris) qui rend la paire pleine/vide possible.\n\nPourquoi CINQ bandes plutôt qu'une bande paramétrée — les trois mécanismes plus économiques ont été testés et refusés par le moteur, pas par goût : (1) `visibleWhen` ne teste qu'UNE valeur d'enum (pas de « parmi »), donc « étoile 3 visible si note ≥ 3 » est inexprimable ; (2) `meter` rend un `<div>` de largeur fractionnaire SANS enfants (core/emit-react.ts:3087), donc pas de bandeau d'étoiles à l'intérieur ; (3) `star.svg` porte `fill=\"#F98A0B\"` en dur et ne se recolore pas par `currentColor`. Cinq bandes exclusives projettent en revanche exactement les cinq variantes du master Figma `Notation` (2480:4725).\n\nLa demi-étoile est ÉCARTÉE, pas oubliée : décision owner du 2026-08-18, la note d'un avis est un entier de 1 à 5. La barre-résumé d'`Avis Google` continue d'afficher sa moyenne « 4.8 » en texte à côté de cinq étoiles pleines — c'est un affichage de moyenne, pas une note d'avis, et il ne demande donc rien à cet atome. Rouvrir la question coûterait soit un pas de 0,5 (dix variantes), soit un remplissage partiel.",
      },
    },
  },
  render: (args) => <Notation key={JSON.stringify(args)} {...args} />,
  argTypes: {
    note: {
      control: 'select',
      options: ['1', '2', '3', '4', '5'],
      description:
        "Nombre d'étoiles pleines. Entier : un avis Google porte une note entière, la moyenne fractionnaire n'existe qu'au niveau du résumé.",
    },
  },
  args: {
    note: '5',
  },
} satisfies Meta<typeof Notation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Note1: Story = {
  args: { note: '1' },
};

export const Note2: Story = {
  args: { note: '2' },
};

export const Note3: Story = {
  args: { note: '3' },
};

export const Note4: Story = {
  args: { note: '4' },
};

export const Note5: Story = {
  args: { note: '5' },
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
      <Notation note="1" />
      <Notation note="2" />
      <Notation note="3" />
      <Notation note="4" />
      <Notation note="5" />
    </div>
  ),
};
