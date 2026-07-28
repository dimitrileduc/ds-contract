/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/copyright.contract.json (ds.copyright v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Copyright } from './Copyright';

const meta = {
  title: 'Molecules/Copyright',
  component: Copyright,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray Copyright. Extracted from the Figma COMPONENT on DS · Molécules, reviewed and adopted — not authored.',
      },
    },
  },
  render: (args) => <Copyright key={JSON.stringify(args)} {...args} />,
  argTypes: {
    texte: { control: 'text' },
  },
  args: {
    texte:
      '© 2025 Piqueray - CGV - Politique de confidentialité | Création de site internet ProduWeb',
  },
} satisfies Meta<typeof Copyright>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
