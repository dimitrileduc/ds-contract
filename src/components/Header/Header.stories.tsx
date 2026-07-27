/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/header.contract.json (ds.header v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from './Header';

const meta = {
  title: 'Sections/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray Header. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored.',
      },
    },
  },
  render: (args) => <Header key={JSON.stringify(args)} {...args} />,
  argTypes: {
    fond: { control: 'select', options: ['solid', 'transparent'] },
    items: { control: false },
  },
  args: {
    fond: 'solid',
    items: [{ chevron: true }, { chevron: true }, { chevron: false }, { chevron: false }],
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Solid: Story = {
  args: { fond: 'solid' },
};

export const Transparent: Story = {
  args: { fond: 'transparent' },
};
/** Every legal combination the contract defines. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(1, max-content)',
        alignItems: 'center',
        justifyItems: 'start',
      }}
    >
      <Header fond="solid" />
      <Header fond="transparent" />
    </div>
  ),
};
