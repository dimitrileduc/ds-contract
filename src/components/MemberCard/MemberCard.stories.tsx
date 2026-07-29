/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/member-card.contract.json (ds.member-card v1.2.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemberCard } from './MemberCard';

const meta = {
  title: 'Molecules/MemberCard',
  component: MemberCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray MemberCard. Extracted from the Figma COMPONENT on DS · Molécules, reviewed and adopted — not authored. Portrait IMAGE overrides are explicit code-only photo data, propagated to the composed MemberPicture without flattening its image anatomy.',
      },
    },
  },
  render: (args) => <MemberCard key={JSON.stringify(args)} {...args} />,
  argTypes: {
    nom: { control: 'text' },
    poste: { control: 'text' },
    imageUrl: { control: 'text' },
    imageAlt: { control: 'text' },
  },
  args: {
    nom: 'Cécilia Piqueray',
    poste: 'Gérante',
    imageUrl: '',
    imageAlt: '',
  },
} satisfies Meta<typeof MemberCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
