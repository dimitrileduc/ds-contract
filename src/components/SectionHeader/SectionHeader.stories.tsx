/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/section-header.contract.json (ds.section-header v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SectionHeader } from './SectionHeader';

const meta = {
  title: 'Molecules/SectionHeader',
  component: SectionHeader,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray SectionHeader. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored.',
      },
    },
  },
  render: (args) => <SectionHeader key={JSON.stringify(args)} {...args} />,
  argTypes: {
    disposition: { control: 'select', options: ['standard', 'avecCta'] },
    accroche: { control: 'text' },
    titre: { control: 'text' },
    accroche2: {
      control: 'boolean',
      description: 'Extracted from Figma "Accroche2" BOOLEAN property (added by sync pass).',
    },
  },
  args: {
    disposition: 'standard',
    accroche: 'Plus de 50 ans d’expérience',
    titre: 'Pourquoi choisir Piqueray ?',
    accroche2: true,
  },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Standard: Story = {
  args: { disposition: 'standard' },
};

export const AvecCta: Story = {
  args: { disposition: 'avecCta' },
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
      <SectionHeader disposition="standard" />
      <SectionHeader disposition="avecCta" />
    </div>
  ),
};
