/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/hero-video.contract.json (ds.hero-video v2.1.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { HeroVideo } from './HeroVideo';

const meta = {
  title: 'Sections/HeroVideo',
  component: HeroVideo,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Piqueray HeroVideo, responsive. 2.0.0 (2026-09-02, Odoo hero pilot): re-extracted from the spec-031 set 2689:15832 (page « 031 · Planches de validation »), four `presentation` variants Mobile / Tablette / Desktop / Wide validated by the owner. Everything the canvas draws is proposed by `npm run extract:figma` and adopted as-is: layout per mode (column centered on Mobile/Tablette, row bottom-aligned on Desktop/Wide), paddings / gap / height per mode as tokensByProp on the presentation axis, the title riding the responsive text style H1 (typography.h1.* — size and line-height vary by viewport mode through tokens/modes/viewport.*). Added by hand, each named: the host element (section — not drawn), the CTA pinned to the bottom edge on Mobile/Tablette (drawn ABSOLUTE on the canvas; the dump does not carry layoutPositioning), and the CTA's right icon fixed to TRUE (the canvas shows it on Desktop/Wide only; the schema has no per-mode channel for a nested instance's prop — `propsByProp` was abandoned on 2026-08-20 — so the Odoo projection hides the glyph under the desktop breakpoint, an acknowledged deviation). The drawn widths 390/668/1200/1728 are witnesses, not tokens: the root fills its parent. Code supports a video URL and poster; Figma projects the poster as a static IMAGE placeholder. The two governed scrims belong to HeroVideo itself. Breakpoints are not in this contract: they are the token dimension `breakpoint.*` (768 / 992 / 1400), consumed by the CSS build. Plan de document : la partie titre porte la balise h1 (accessibilite-home-odoo, 2026-09-04) ; l'apparence reste pilotee par les jetons typography, axe independant du niveau.",
      },
    },
  },
  render: (args) => <HeroVideo key={JSON.stringify(args)} {...args} />,
  argTypes: {
    presentation: {
      control: 'select',
      options: ['mobile', 'tablette', 'desktop', 'wide'],
      description:
        "Viewport presentation, mirroring the canvas axis Presentation. Default = mobile, the first variant of the 031 set (Figma's default) and the mobile-first base of the delivered CSS; in the delivered CSS the mode is selected by the viewport through the breakpoint tokens, never by a consumer.",
    },
    backgroundUrl: {
      control: 'text',
      description:
        'Code-side poster source. On canvas, this poster is the deterministic static placeholder for the video.',
    },
    videoUrl: {
      control: 'text',
      description:
        "Code-side video source. Figma's native videoHash has no contract-to-code URL transport, so the canvas intentionally uses only the static poster placeholder.",
    },
    backgroundAlt: {
      control: 'text',
      description: 'Alternative text for the decorative poster plane.',
    },
    accroche: {
      control: false,
      description:
        'HeroVideo title. RICH text (owner rule 2026-09-02: a text drawn with a line break is rich, whether or not the set exposes a TEXT property — the 031 set draws its title on the node, no property; binding NONE). The 031 set breaks after « HÖRMANN »: explicitly on Desktop/Wide (U+2028), naturally on Mobile/Tablette. The break is a governed segment fact; WHERE the editor breaks stays content. No bold. Includes the non-breaking spaces around HÖRMANN.',
    },
  },
  args: {
    presentation: 'mobile',
    backgroundUrl: '',
    videoUrl: '',
    backgroundAlt: '',
    accroche: [{ text: 'Le numéro 1 des portes HÖRMANN\nen Province de Liège !' }],
  },
} satisfies Meta<typeof HeroVideo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Mobile: Story = {
  args: { presentation: 'mobile' },
};

export const Tablette: Story = {
  args: { presentation: 'tablette' },
};

export const Desktop: Story = {
  args: { presentation: 'desktop' },
};

export const Wide: Story = {
  args: { presentation: 'wide' },
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
      <HeroVideo presentation="mobile" />
      <HeroVideo presentation="tablette" />
      <HeroVideo presentation="desktop" />
      <HeroVideo presentation="wide" />
    </div>
  ),
};
