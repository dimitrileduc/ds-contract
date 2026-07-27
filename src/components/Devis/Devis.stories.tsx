/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/devis.contract.json (ds.devis v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Devis } from './Devis';

const meta = {
  title: 'Sections/Devis',
  component: Devis,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray Devis. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored.',
      },
    },
  },
  render: (args) => <Devis key={JSON.stringify(args)} {...args} />,
  argTypes: {
    titre: { control: 'text' },
  },
  args: {
    titre: 'Prenez rendez-vous pour un devis gratuit, nous nous déplaçons chez vous',
  },
} satisfies Meta<typeof Devis>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
