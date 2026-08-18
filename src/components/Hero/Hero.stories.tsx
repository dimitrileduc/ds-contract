/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/hero.contract.json (ds.hero v1.5.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Hero } from './Hero';

const meta = {
  title: 'Sections/Hero',
  component: Hero,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray Hero. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. The contract owns the complete Hero stack: a photographic Background plane, a mandatory VoileNavigation plane above the photo for header readability, then the content plane. The top veil is intrinsic to every Hero; it is neither a Page override nor a variant. The separate Titres scrim remains attached to the text area. The root is fluid while 1728 px remains its canvas authoring reference. SectionHeader and the rich SousTitre are parent-width Fill; the Button remains Hug.',
      },
    },
  },
  render: (args) => <Hero key={JSON.stringify(args)} {...args} />,
  argTypes: {
    backgroundUrl: {
      control: 'text',
      description:
        "Code-only source of the root's photographic IMAGE fill (fills[0], imageRef b9ae58d2e309c55241eb843c1a36d90d087c1483). The master exposes no component property for it — A5 / §a.7 means the bitmap has no contract→canvas transport, so it rides a code-side scalar and the canvas keeps the engine's placeholder.",
    },
    backgroundAlt: {
      control: 'text',
      description:
        'Alternative text for the background photo plane. Empty by default: the Figma paint is decorative — it carries no information the surrounding copy does not already state.',
    },
    sousTitre: {
      control: false,
      description:
        "The hero paragraph (layer « Sous-titre », node 2111:3380) as a governed rich-text prop — 016/T042, lot B013-4: the 2026-08-05 live diagnosis showed this was the master's ONE unbound text, and lot L-B013-4 (T041) exposes the native TEXT property « SousTitre » it binds to. The two observed 700 ranges (« performance », « la solution idéale ») travel as segments; the Figma projection keeps one native TEXT value and reapplies the governed marks as native character ranges.",
    },
  },
  args: {
    backgroundUrl: '',
    backgroundAlt: '',
    sousTitre: [
      { text: 'La ' },
      { text: 'performance', strong: true },
      {
        text: ' sans compromis, même en usage intensif. Atelier, bâtiment industriel, bâtiment public ou résidence : quelle que soit votre application, nous avons ',
      },
      { text: 'la solution idéale', strong: true },
      { text: '.' },
    ],
  },
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
