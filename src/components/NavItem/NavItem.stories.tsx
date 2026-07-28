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
          'Piqueray NavItem. Extracted from the Figma COMPONENT on DS · Molécules, reviewed and adopted — not authored. Link destination and runtime label are explicit code semantics; the active underline remains a Figma visual fact.',
      },
    },
  },
  render: (args) => <NavItem key={JSON.stringify(args)} {...args} />,
  argTypes: {
    libelle: { control: 'text' },
    href: { control: 'text' },
    chevron: { control: 'boolean' },
    actif: { control: 'boolean' },
  },
  args: {
    libelle: 'Portes de garage',
    href: '',
    chevron: true,
    actif: false,
  },
} satisfies Meta<typeof NavItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
