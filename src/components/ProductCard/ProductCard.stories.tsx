/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/product-card.contract.json (ds.product-card v2.0.0)
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
          'Piqueray ProductCard. Extracted from the Figma COMPONENT on DS · Molécules, reviewed and adopted — not authored. The fixed 364px frame and full-width text planes are observed geometry; product image URL/alt are code semantics because Figma supplies IMAGE fills through instance overrides.',
      },
    },
  },
  render: (args) => <ProductCard key={JSON.stringify(args)} {...args} />,
  argTypes: {
    titre: { control: 'text' },
    prix: { control: 'text' },
    imageUrl: {
      control: 'text',
      description:
        'Code-supplied product-image URL. Figma exposes the visible value as an IMAGE fill through an instance override, not as a component property; the empty runtime default is intentional and comparison assets are injected only by the campaign.',
    },
    imageAlt: {
      control: 'text',
      description:
        'Code-supplied text alternative paired with imageUrl. Figma has no corresponding component property, so the empty runtime default is intentional.',
    },
  },
  args: {
    titre: 'Télécommande Hörmann HSE4-868BS',
    prix: '74,99€',
    imageUrl: '',
    imageAlt: '',
  },
} satisfies Meta<typeof ProductCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
