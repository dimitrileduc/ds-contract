/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/section-header.contract.json (ds.section-header v2.1.0)
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
        'Une seule propriété TEXT Figma ("Titre"), à graisses MIXTES chez trois consommateurs : presentation dessine « Piqueray, » en Bold puis le reste en Regular (I2169:6246;2090:2387), texte-seo met « showroom à Pepinster » en Bold au milieu de la phrase (I2170:6361;2090:2387), hero met « Portes de garage » en Bold et « industrielles » en Light (I2169:6264;2090:2387). Les cinq autres consommateurs passent un segment unique. La projection canvas reste UNE valeur TEXT native : la concaténation à plat.',
    },
    accroche2: {
      control: 'boolean',
      description: 'Extracted from Figma "Accroche2" BOOLEAN property (added by sync pass).',
    },
    emphase: {
      control: 'select',
      options: ['standard', 'hero', 'moyen', 'compact'],
      description:
        "LIMITE NOMMÉE — abstraction code-side sur des surcharges d'instance Figma ad hoc. Le master 2090:2385 porte 40px/50px ; les usages surchargent la typographie du Titre par instance (hero 2169:6264 : 54/68/blanc, poids 300 sur la plage NON marquée — voir ci-dessous ; presentation 2169:6246 : 32/40 ; texte-seo 2170:6361 : 24/30 ; coordonnees, faq, sav et reassurances restent à 40/50 = defaut) au lieu de la porter en variantes gouvernées. Le poids du hero : le nœud Figma a un style de BASE Bold 700 avec une surcharge Light 300 sur « industrielles » ; le modèle du contrat porte l'inverse strictement équivalent en pixels — la plage non marquée prend le poids de base (300, littéral : aucun token Light dans la fondation) et la plage marquée prend content.marks.strong (token font.weight.bold). `component.props` ne transporte que des valeurs de props, jamais une surcharge typographique de l'enfant — cet axe est donc le seul moyen de porter le fait sans retoucher la sortie générée. Le correctif de fond appartient à Figma : promouvoir ces surcharges en variantes réelles, après quoi cet axe redevient un VARIANT lié.",
    },
    alignement: {
      control: 'select',
      options: ['centre', 'gauche'],
      description:
        'LIMITE NOMMÉE — le master 2090:2385 centre (textAlign CENTER) mais 5 usages sur 7 le surchargent en LEFT par instance (coordonnees, presentation, sav, texte-seo, hero) quand faq et reassurances suivent le master. Cet axe code-side porte ce fait d’usage ; le correctif de fond appartient à Figma (promouvoir l’alignement en variante gouvernée du master).',
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
