/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/sav.contract.json (ds.sav v1.3.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SAV } from './SAV';

const meta = {
  title: 'Sections/SAV',
  component: SAV,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Piqueray SAV. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored.\n\nLimites nommées : les deux plans photo (`background` 2108:3094, `img` 2108:3098) portent chacun un paint IMAGE sur le master Figma. Le vocabulaire de contrat n'a AUCUN canal `background-image` (gap nommé A5, docs/FIGMA-CAPABILITY-MATRIX.md) : les `imageRef` observés sont donc CONSIGNÉS dans la description de chaque part, jamais liés. Ce qui est porté : le porteur `img` avec `src`/`alt` fournis par le code (convention realisation/carte/product-card) et le `object-fit` qui est l'orthographe CSS du `scaleMode` observé.\n\nv1.3.0 (016/T042, lot B013-4) : le paragraphe long cesse d'être cuit en dur — prop rich-text `texte` liée à la propriété TEXT native « Texte » que le lot L-B013-4 (T041) expose sur le master ; c'était le SEUL texte non lié du master au diagnostic vif du 2026-08-05 (le titre avait déjà sa propriété « Titre », les autres textes passent par les instances). Ses trois plages 700 voyagent en segments gouvernés (content.marks.strong) et le saut de ligne dur voyage dans la valeur de la prop.",
      },
    },
  },
  render: (args) => <SAV key={JSON.stringify(args)} {...args} />,
  argTypes: {
    titre: {
      control: 'text',
      description:
        'Extracted from Figma "Titre" TEXT property (added by sync pass). Forwarded live into the SectionHeader instance (`titre: "{titre}"`) so the parent property reaches the rendered surface instead of the child\'s literal.',
    },
    texte: {
      control: false,
      description:
        "Le paragraphe long de la colonne (TEXT Figma 2108:3103) en prop rich-text gouvernée — 016/T042, lot B013-4 : c'était le SEUL texte non lié du master (diagnostic vif 2026-08-05), et le lot L-B013-4 (T041) expose la propriété TEXT native « Texte » qu'elle lie. Les trois plages 700 observées voyagent en segments ; la projection Figma aplatit vers la valeur native de la propriété (concaténation, saut de ligne dur compris).",
    },
    backgroundUrl: {
      control: 'text',
      description:
        'Code-supplied URL for the full-bleed section IMAGE fill. Figma stores those pixels as a paint on the master (not as a component property) and the contract has no background-image channel; the empty runtime default is intentional and does not substitute an image.',
    },
    backgroundAlt: {
      control: 'text',
      description:
        'Code-supplied text alternative paired with backgroundUrl. Figma IMAGE fills expose no corresponding alt component property, so the empty runtime default is intentional (decorative plane).',
    },
    imageUrl: {
      control: 'text',
      description:
        'Code-supplied URL for the img-group photo IMAGE fill. Same provenance as backgroundUrl: a master paint, not a component property; the empty runtime default is intentional and does not substitute an image.',
    },
    imageAlt: {
      control: 'text',
      description:
        'Code-supplied text alternative paired with imageUrl. Figma IMAGE fills expose no corresponding alt component property, so the empty runtime default is intentional.',
    },
  },
  args: {
    titre: 'Dépannage / SAV',
    texte: [
      { text: 'Vous rencontrez un problème avec ' },
      { text: 'votre installation ', strong: true },
      { text: 'Hörmann à Liège ? Il y a une panne de courant et ' },
      { text: 'votre porte de garage', strong: true },
      {
        text: ' ne s’ouvre plus ? La télécommande de ma porte est cassée ? Votre porte ne se ferme plus correctement ?\nPas de panique, Piqueray, ',
      },
      { text: 'votre distributeur Hörmann en province de Liège', strong: true },
      { text: ' est là pour vous aider !' },
    ],
    backgroundUrl: '',
    backgroundAlt: '',
    imageUrl: '',
    imageAlt: '',
  },
} satisfies Meta<typeof SAV>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
