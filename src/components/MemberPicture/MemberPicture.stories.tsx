/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/member-picture.contract.json (ds.member-picture v1.0.0)
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
          'Piqueray member picture. A circular avatar placeholder with two states: default (visible) and hover (overlay shown). Extracted from the Figma COMPONENT_SET « MemberPicture » on DS · Atomes, reviewed and adopted — not authored.\n\nThe etat variant drives a visual overlay (opacity 1→0 between defaut/survol). Corner radius 500px via literals (circular crop — no token carries unitless border-radius values at this scale). Opacity transition is a Figma-internal layering technique; the contract models both states as drawn.',
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
