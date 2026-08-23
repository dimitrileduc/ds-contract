/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/produits-ecommerce.contract.json (ds.produits-ecommerce v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProduitsECommerce } from './ProduitsECommerce';

const meta = {
  title: 'Sections/ProduitsECommerce',
  component: ProduitsECommerce,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray ProduitsECommerce. Canonical section promoted from the audited source master 2116:4475. It owns its 32/40 title and CTA; it never delegates a specialised hierarchy to SectionHeader.',
      },
    },
  },
  render: (args) => <ProduitsECommerce key={JSON.stringify(args)} {...args} />,
  argTypes: {
    titre: { control: false },
    produits: {
      control: false,
      description:
        'Product cards shown by the source carousel. IMAGE overrides remain product-card runtime data; title and price are the bounded textual catalogue carried here.',
    },
  },
  args: {
    titre: [{ text: 'Découvrez nos produits disponibles en ligne' }],
    produits: [
      { titre: 'Télécommande Hörmann HSE4-868BS', prix: '74,99€' },
      { titre: 'Clavier à code Hörmann FCT3-1BS', prix: '139,99€' },
      { titre: 'Bouton poussoir Hörmann FIT2-1-868-BS', prix: '89,99€' },
      { titre: 'Passerelle BiSecure Hörmann', prix: '74,99€' },
    ],
  },
} satisfies Meta<typeof ProduitsECommerce>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
