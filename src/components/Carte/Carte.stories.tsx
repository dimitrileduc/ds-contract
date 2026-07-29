/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/carte.contract.json (ds.carte v2.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Carte } from './Carte';

const meta = {
  title: 'Molecules/Carte',
  component: Carte,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Piqueray Carte. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. It is one context-width card with two Figma dispositions: Reassurance (fixed-height image, centred content) and Categorie (remaining-space image and a Link Button CTA). Image URLs remain consumer/campaign inputs, never capture defaults.\n\nVersion 2.0.0 is a breaking change: `texte` is now typed rich text so the source's leading strong range is preserved without raw HTML.",
      },
    },
  },
  render: (args) => <Carte key={JSON.stringify(args)} {...args} />,
  argTypes: {
    disposition: { control: 'select', options: ['reassurance', 'categorie'] },
    titre: { control: 'text' },
    imageUrl: { control: 'text' },
    imageAlt: { control: 'text' },
    texte: {
      control: false,
      description:
        'The first sentence is the strong range observed in both immutable master variants (Figma Bold/700); concatenate segments for the native Figma TEXT value. The inventory has no 700-weight token, so this bounded mark carries the observed 700 literal rather than inventing a token.',
    },
    ctaLabel: {
      control: 'text',
      description:
        'Nested Categorie Link Button label. The source Carte component does not expose it as a top-level Figma property, so immutable occurrence values come from the nested Button TEXT property retained by the campaign census.',
    },
    ctaIconLeftGlyph: {
      control: 'select',
      options: ['pdf'],
      description:
        'Nested Categorie Link Button leading glyph retained from the concrete nested Figma instance.',
    },
    ctaIconRightGlyph: {
      control: 'select',
      options: ['arrow-right', 'download'],
      description:
        'Nested Categorie Link Button trailing glyph retained from the concrete nested Figma instance.',
    },
  },
  args: {
    disposition: 'reassurance',
    titre: 'Pour portes de garage',
    imageUrl: '',
    imageAlt: '',
    texte: [
      { text: 'SupraMatic & ProMatic.', strong: true },
      { text: ' Ouverture ultra-rapide et verrouillage mécanique anti-intrusion breveté.' },
    ],
    ctaLabel: 'Contactez-nous',
    ctaIconLeftGlyph: 'pdf',
    ctaIconRightGlyph: 'download',
  },
} satisfies Meta<typeof Carte>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Reassurance: Story = {
  args: { disposition: 'reassurance' },
};

export const Categorie: Story = {
  args: { disposition: 'categorie' },
};
/** Every legal combination the contract defines (disposition × ctaIconLeftGlyph × ctaIconRightGlyph). */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(2, max-content)',
        alignItems: 'center',
        justifyItems: 'start',
      }}
    >
      <Carte disposition="reassurance" ctaIconLeftGlyph="pdf" ctaIconRightGlyph="arrow-right" />
      <Carte disposition="reassurance" ctaIconLeftGlyph="pdf" ctaIconRightGlyph="download" />
      <Carte disposition="categorie" ctaIconLeftGlyph="pdf" ctaIconRightGlyph="arrow-right" />
      <Carte disposition="categorie" ctaIconLeftGlyph="pdf" ctaIconRightGlyph="download" />
    </div>
  ),
};
