/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/product-card.contract.json (ds.product-card v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProductCard } from './ProductCard';

const meta = {
  title: 'Molecules/ProductCard',
  component: ProductCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray ProductCard. Extracted from the Figma COMPONENT on DS · Molécules, reviewed and adopted — not authored. Product image URL/alt are code semantics because Figma supplies IMAGE fills through instance overrides.',
      },
    },
  },
  render: (args) => <ProductCard key={JSON.stringify(args)} {...args} />,
  argTypes: {
    titre: { control: 'text' },
    prix: { control: 'text' },
    imageUrl: { control: 'text' },
    imageAlt: { control: 'text' },
    bouton: { control: 'boolean' },
  },
  args: {
    titre: 'Télécommande Hörmann HSE4-868BS',
    prix: '74,99€',
    imageUrl: '',
    imageAlt: '',
    bouton: false,
  },
} satisfies Meta<typeof ProductCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
