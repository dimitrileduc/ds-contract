/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/sav.contract.json (ds.sav v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SAV } from './SAV';

const meta = {
  title: 'Sections/SAV',
  component: SAV,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray SAV. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored.',
      },
    },
  },
  render: (args) => <SAV key={JSON.stringify(args)} {...args} />,
  argTypes: {
    titre: {
      control: 'text',
      description: 'Extracted from Figma "Titre" TEXT property (added by sync pass).',
    },
  },
  args: {
    titre: 'Dépannage / SAV',
  },
} satisfies Meta<typeof SAV>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
