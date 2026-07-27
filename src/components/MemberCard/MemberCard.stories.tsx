/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/member-card.contract.json (ds.member-card v1.0.0)
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
          'Piqueray MemberCard. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored.',
      },
    },
  },
  render: (args) => <MemberCard key={JSON.stringify(args)} {...args} />,
  argTypes: {
    nom: { control: 'text' },
    poste: { control: 'text' },
  },
  args: {
    nom: 'Cécilia Piqueray',
    poste: 'Gérante',
  },
} satisfies Meta<typeof MemberCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
