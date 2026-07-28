/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/member-picture.contract.json (ds.member-picture v1.0.1)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemberPicture } from './MemberPicture';

const meta = {
  title: 'Atoms/MemberPicture',
  component: MemberPicture,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Piqueray member picture. A circular member-photo component with two states, extracted from the Figma COMPONENT_SET « MemberPicture » on DS · Atomes, reviewed and adopted — not authored.\n\nThe etat variant stacks two 364×364 circular image planes: normal is opaque in defaut and transparent in survol, with a 300ms opacity transition. The root clips both planes at its 500px radius.\n\n† A5 technical placeholder: the source IMAGE pixels of funIa and normal are unavailable to the contract→canvas transport. Both layers therefore use the engine's generic #D9D9D9 image-placeholder wash. This is not a Piqueray colour extracted from Figma, and this contract makes no full inner-photo pixel-parity claim.",
      },
    },
  },
  render: (args) => <MemberPicture key={JSON.stringify(args)} {...args} />,
  argTypes: {
    etat: {
      control: 'select',
      options: ['defaut', 'survol'],
      description:
        'Visual state: default (no overlay) or hover (overlay visible). Extracted from the VARIANT property « Etat » on the Figma master.',
    },
  },
  args: {
    etat: 'defaut',
  },
} satisfies Meta<typeof MemberPicture>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Defaut: Story = {
  args: { etat: 'defaut' },
};

export const Survol: Story = {
  args: { etat: 'survol' },
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
      <MemberPicture etat="defaut" />
      <MemberPicture etat="survol" />
    </div>
  ),
};
