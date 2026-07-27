/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/footer-column.contract.json (ds.footer-column v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FooterColumn } from './FooterColumn';

const meta = {
  title: 'Molecules/FooterColumn',
  component: FooterColumn,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray FooterColumn. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored.',
      },
    },
  },
  render: (args) => <FooterColumn key={JSON.stringify(args)} {...args} />,
  argTypes: {
    titre: { control: 'text' },
    texte: { control: 'text' },
  },
  args: {
    titre: 'Adresse',
    texte: 'Rue Alfred Drèze 7,  4860 Pepinster',
  },
} satisfies Meta<typeof FooterColumn>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
