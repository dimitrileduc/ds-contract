/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/section-header.contract.json (ds.section-header v2.2.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SectionHeader } from './SectionHeader';

const meta = {
  title: 'Molecules/SectionHeader',
  component: SectionHeader,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray SectionHeader. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored.',
      },
    },
  },
  render: (args) => <SectionHeader key={JSON.stringify(args)} {...args} />,
  argTypes: {
    disposition: { control: 'select', options: ['standard', 'avecCta'] },
    accroche: { control: 'text' },
    titre: {
      control: false,
      description:
        'Une seule propriété TEXT Figma ("Titre"), à graisses MIXTES chez trois consommateurs : presentation dessine « Piqueray, » en Bold puis le reste en Regular (I2169:6246;2090:2387), texte-seo met « showroom à Pepinster » en Bold au milieu de la phrase (I2170:6361;2090:2387), hero met « Portes de garage » en Bold et « industrielles » en Light (I2169:6264;2090:2387). Les cinq autres consommateurs passent un segment unique. La projection canvas garde UNE valeur TEXT native et applique les marques gouvernées par plages de caractères natives.',
    },
    accroche2: {
      control: 'boolean',
      description: 'Extracted from Figma "Accroche2" BOOLEAN property (added by sync pass).',
    },
    emphase: {
      control: 'select',
      options: ['standard', 'hero', 'moyen', 'compact'],
      description:
        "Axe gouverné : binding VARIANT « Emphase » depuis 2.1.0 (016, journal decisions.md O-12 — le SET 2090:2397 a gagné les dimensions Emphase et Alignement, 16 variantes). LIMITE LEVÉE : jusqu'en 2.0.x cet axe était code-only (bindings.figma.kind: NONE), une abstraction au-dessus de surcharges d'instance ad hoc (hero 2169:6264 : 54/68/blanc ; presentation 2169:6246 : 32/40 ; texte-seo 2170:6361 : 24/30 ; les autres usages au défaut 40/50 du master 2090:2385) — le correctif de fond annoncé par l'ancienne limite (promouvoir ces surcharges en variantes réelles) a eu lieu côté Figma. Le modèle du poids hero est inchangé : le nœud d'origine porte un style de BASE Bold 700 avec une surcharge Light 300 sur « industrielles » ; le contrat porte l'inverse strictement équivalent en pixels — la plage non marquée prend le poids de base (300, littéral : aucun token Light dans la fondation) et la plage marquée prend content.marks.strong (token font.weight.bold).",
    },
    alignement: {
      control: 'select',
      options: ['centre', 'gauche'],
      description:
        "Axe gouverné : binding VARIANT « Alignement » depuis 2.1.0 (016, journal decisions.md O-12). LIMITE LEVÉE : jusqu'en 2.0.x cet axe était code-only (bindings.figma.kind: NONE) — le master 2090:2385 centrait (textAlign CENTER) et les usages le surchargeaient en LEFT par instance (census 013 : 5 usages sur 7 ; relevé vif 016 : 34 instances sur 59, specs/016-canvas-vrai/registre/defauts-source.json B013-2). Le correctif de fond annoncé par l'ancienne limite a eu lieu : l'alignement est une variante gouvernée du master.",
    },
  },
  args: {
    disposition: 'standard',
    accroche: 'Plus de 50 ans d’expérience',
    titre: [{ text: 'Pourquoi choisir Piqueray ?' }],
    accroche2: true,
    emphase: 'standard',
    alignement: 'centre',
  },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Standard: Story = {
  args: { disposition: 'standard' },
};

export const AvecCta: Story = {
  args: { disposition: 'avecCta' },
};
/** Every legal combination the contract defines (disposition × emphase × alignement). */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(8, max-content)',
        alignItems: 'center',
        justifyItems: 'start',
      }}
    >
      <SectionHeader disposition="standard" emphase="standard" alignement="centre" />
      <SectionHeader disposition="standard" emphase="standard" alignement="gauche" />
      <SectionHeader disposition="standard" emphase="hero" alignement="centre" />
      <SectionHeader disposition="standard" emphase="hero" alignement="gauche" />
      <SectionHeader disposition="standard" emphase="moyen" alignement="centre" />
      <SectionHeader disposition="standard" emphase="moyen" alignement="gauche" />
      <SectionHeader disposition="standard" emphase="compact" alignement="centre" />
      <SectionHeader disposition="standard" emphase="compact" alignement="gauche" />
      <SectionHeader disposition="avecCta" emphase="standard" alignement="centre" />
      <SectionHeader disposition="avecCta" emphase="standard" alignement="gauche" />
      <SectionHeader disposition="avecCta" emphase="hero" alignement="centre" />
      <SectionHeader disposition="avecCta" emphase="hero" alignement="gauche" />
      <SectionHeader disposition="avecCta" emphase="moyen" alignement="centre" />
      <SectionHeader disposition="avecCta" emphase="moyen" alignement="gauche" />
      <SectionHeader disposition="avecCta" emphase="compact" alignement="centre" />
      <SectionHeader disposition="avecCta" emphase="compact" alignement="gauche" />
    </div>
  ),
};
