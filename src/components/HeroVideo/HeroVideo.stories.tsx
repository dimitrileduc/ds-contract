/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/hero-video.contract.json (ds.hero-video v1.0.0)
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
          'Piqueray HeroVideo. Extracted from the historical in-place component 2151:5552 on Accueil, reviewed and adopted — not authored. The root is fluid at a 1728 px canvas reference and keeps the historical 720 px height. Code supports a video URL and poster; Figma deliberately projects the poster as a static IMAGE placeholder because native VideoPaint cannot be reconstructed deterministically. The two governed scrims belong to HeroVideo itself. The single 44/48 title remains direct because no existing SectionHeader emphasis is pixel-equivalent.',
      },
    },
  },
  render: (args) => <HeroVideo key={JSON.stringify(args)} {...args} />,
  argTypes: {
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
      control: 'text',
      description:
        'Historical HeroVideo title, including the non-breaking spaces around HÖRMANN. Bound as one native Figma TEXT property so future instance copy remains governed.',
    },
  },
  args: {
    backgroundUrl: '',
    videoUrl: '',
    backgroundAlt: '',
    accroche: 'Le numéro 1 des portes HÖRMANN en Province de Liège !',
  },
} satisfies Meta<typeof HeroVideo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
