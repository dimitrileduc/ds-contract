/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/nav-item.contract.json (ds.nav-item v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavItem } from './NavItem';

const meta = {
  title: 'Molecules/NavItem',
  component: NavItem,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray NavItem. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored.',
      },
    },
  },
  render: (args) => <NavItem key={JSON.stringify(args)} {...args} />,
  argTypes: {
    chevron: { control: 'boolean' },
    actif: { control: 'boolean' },
  },
  args: {
    chevron: true,
    actif: false,
  },
} satisfies Meta<typeof NavItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
