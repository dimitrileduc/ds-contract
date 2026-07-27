/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/coordonnees.contract.json (ds.coordonnees v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Coordonnees } from './Coordonnees';

const meta = {
  title: 'Sections/Coordonnees',
  component: Coordonnees,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray Coordonnees. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored.',
      },
    },
  },
  render: (args) => <Coordonnees key={JSON.stringify(args)} {...args} />,
  argTypes: {},
  args: {},
} satisfies Meta<typeof Coordonnees>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
