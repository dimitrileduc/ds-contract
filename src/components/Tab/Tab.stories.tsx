/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/tab.contract.json (ds.tab v2.0.0)
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
          'Piqueray Tab. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored. Panel and tablist identities are code-only semantics: every Tab belongs to an existing tablist, whose controller owns the bounded roving-focus behavior and keeps exactly one Tab selected/focusable; this contract does not invent a TabList molecule or a panel. Version 2.0.0 is breaking because panelId and tablistId are now required for an accessible Tab relationship.',
      },
    },
  },
  render: (args) => <Tab key={JSON.stringify(args)} {...args} />,
  argTypes: {
    etat: { control: 'select', options: ['defaut', 'selectionne'] },
    libelle: { control: 'text' },
    panelId: { control: 'text', description: 'Code-only id of the panel controlled by this Tab.' },
    tablistId: {
      control: 'text',
      description:
        'Code-only id of the owning tablist. Its controller supplies the bounded arrow-key roving-focus behavior; exactly one sibling Tab is selected and has tabIndex 0.',
    },
  },
  args: {
    etat: 'defaut',
    libelle: 'Onglet',
    panelId: 'panelId-sample',
    tablistId: 'tablistId-sample',
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
      <Tab etat="defaut" panelId="panelId-sample" tablistId="tablistId-sample" />
      <Tab etat="selectionne" panelId="panelId-sample" tablistId="tablistId-sample" />
    </div>
  ),
};
