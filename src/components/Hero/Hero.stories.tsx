/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/hero.contract.json (ds.hero v1.4.1)
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
          "Piqueray Hero. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored.\n\nv1.2.0 carries the root's photographic IMAGE fill (fills[0], imageRef b9ae58d2e309c55241eb843c1a36d90d087c1483, scaleMode FILL) as an absolutely-positioned `img` plane painted UNDER the content block — the same superposed-planes vocabulary ds.member-picture already uses, with DOM order alone deciding the stacking (no z-index channel exists, and none is needed: two positioned siblings paint in tree order). The bitmap reaches the coded surface through code-only `backgroundUrl` / `backgroundAlt` scalars (bindings.figma NONE) because `background-image: url()` is still the OPEN A5 / §a.7 gap of docs/FIGMA-CAPABILITY-MATRIX.md: the canvas side keeps the engine's generic image placeholder while the React surface renders the real pixels — the same split spec 006 documented for ds.review-card's avatarPhoto.\n\nTHOSE TWO GRADIENT_LINEAR PAINTS ARE NO LONGER LIMITS — carried since 015 (T028–T032, 2026-08-04): the root's darkening overlay (fills[2] — `linear-gradient(to top, rgba(0,0,0,0) 75%, rgba(0,0,0,0.5) 100%)`) and the Titres scrim (fills[0] — `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 60%)`). The blocker was real and is now lifted at its root: `background-image` joined LITERAL_CHANNELS with its OWN bounded grammar (`linear-gradient(...)` only — radial/conic still refuse BY NAME, eval `gradient-literal-channel`), so the channel no longer resolves through a DTCG token reference alone. Both values are declared in `contracts/named-literals.registry.json` (receipt `hero-gradients-named-literal`) — named literals the geometry gate reads live, never invisible values: a single-use gradient token would have manufactured a fake vocabulary. The weight was measured, not guessed: the two veils darken 452 of the root's 640 px rows and accounted for 28.07 % of the master's pixels; carrying them measured 27.83 % → 10.66 % residual (receipt `hero-gradient-carry.md`, attributed cause `gradient-carry`). The remaining residual is the photo plane (A5 / §a.7), already named above. A single flat rgba() veil over the same two bands was measured too and bottomed out near 12 %, so approximating them would have both invented a Figma fact and still failed.\n\nThe instance restyle of the SectionHeader child's Titre (blanc / 54 px / 68 px / 700) is no longer a limit here: it is carried by that child contract's own `emphase: \"hero\"` axis since section-header v1.1.0.\n\nv1.4.0 (016/T042, lot B013-4): the Sous-titre paragraph stops being baked in — it rides the rich-text prop `sousTitre`, bound to the master's native TEXT property « SousTitre » (exposed by lot L-B013-4/T041; the 2026-08-05 live diagnosis showed this was the master's ONE unbound text — the title needed nothing, it was already governed through the SectionHeader instance's inherited TEXT property). Its two observed 700 ranges travel as governed segments (content.marks.strong).\n\nv1.4.1 restores the measured 1728px root width explicitly so the absolutely positioned photo plane cannot collapse the auto-layout width to its content during regeneration.",
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
        "The hero paragraph (layer « Sous-titre », node 2111:3380) as a governed rich-text prop — 016/T042, lot B013-4: the 2026-08-05 live diagnosis showed this was the master's ONE unbound text, and lot L-B013-4 (T041) exposes the native TEXT property « SousTitre » it binds to. The two observed 700 ranges (« performance », « la solution idéale ») travel as segments; the Figma projection flattens to the property's native string value.",
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
