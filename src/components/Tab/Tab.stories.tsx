/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/tab.contract.json (ds.tab v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tab } from './Tab';

const meta = {
  title: 'Molecules/Tab',
  component: Tab,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray Tab. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored.',
      },
    },
  },
  render: (args) => <Tab key={JSON.stringify(args)} {...args} />,
  argTypes: {
    etat: { control: 'select', options: ['defaut', 'selectionne'] },
    libelle: { control: 'text' },
  },
  args: {
    etat: 'defaut',
    libelle: 'Onglet',
  },
} satisfies Meta<typeof Tab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Defaut: Story = {
  args: { etat: 'defaut' },
};

export const Selectionne: Story = {
  args: { etat: 'selectionne' },
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
      <Tab etat="defaut" />
      <Tab etat="selectionne" />
    </div>
  ),
};
