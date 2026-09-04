/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/carousel-controls.contract.json (ds.carousel-controls v1.1.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CarouselControls } from './CarouselControls';

const meta = {
  title: 'Molecules/CarouselControls',
  component: CarouselControls,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Piqueray CarouselControls. Extracted from the Figma COMPONENT on DS · Molécules, reviewed and adopted — not authored. Navigation semantics are a code decision; click callbacks remain a documented consumer boundary. 1.1.0 (2026-09-04, vague 031) : le master DS 2077:2191 était en SPACE_BETWEEN avec un itemSpacing de 0 — la dixième occurrence du défaut de source E-031-023, où l'alignement réparti annule silencieusement l'écart. Corrigé À LA SOURCE (§VIII) : alignement au début, écart 8, largeur 104 → 112 ; les quinze instances du fichier sont désormais uniformes, version nommée dans l'historique Figma. Le contrat suit la source réparée : sans cet écart les deux boutons de navigation étaient collés partout où le composant est rendu hors Figma.",
      },
    },
  },
  render: (args) => <CarouselControls key={JSON.stringify(args)} {...args} />,
  argTypes: {},
  args: {},
} satisfies Meta<typeof CarouselControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
