/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/nav-item.contract.json (ds.nav-item v1.2.0)
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
          'Piqueray NavItem. Extracted from the Figma COMPONENT on DS · Molécules, reviewed and adopted — not authored. Link destination and runtime label are explicit code semantics; chevron and active are Figma BOOLEAN facts, and the transparent white-ink composition is intended for a dark Header/photo surface.',
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
    href: 'href-sample',
    chevron: true,
    actif: false,
  },
} satisfies Meta<typeof NavItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
