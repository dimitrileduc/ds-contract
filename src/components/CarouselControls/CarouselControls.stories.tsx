/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/carousel-controls.contract.json (ds.carousel-controls v1.0.2)
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
          'Piqueray CarouselControls. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored.',
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
