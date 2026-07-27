/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/avantage.contract.json (ds.avantage v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avantage } from './Avantage';

const meta = {
  title: 'Molecules/Avantage',
  component: Avantage,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray Avantage. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored.',
      },
    },
  },
  render: (args) => <Avantage key={JSON.stringify(args)} {...args} />,
  argTypes: {
    titre: { control: 'text' },
    texte: { control: 'text' },
  },
  args: {
    titre: 'Conseils personnalisés',
    texte: 'Devis gratuits effectués sur place, nous nous déplaçons chez vous',
  },
} satisfies Meta<typeof Avantage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
