/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/member-picture.contract.json (ds.member-picture v1.2.0)
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
          "Piqueray member picture. A circular member-photo component with two states, extracted from the Figma COMPONENT_SET « MemberPicture » on DS · Atomes, reviewed and adopted — not authored.\n\nThe etat variant stacks two 364×364 circular image planes: normal is opaque in defaut and transparent in survol, with a 300ms opacity transition. The root clips both planes at its 500px radius. The visible normal plane receives its code-only src and alt scalars from its composed parent.\n\n† A5 technical placeholder: the source IMAGE pixels of funIa are unavailable to the contract→canvas transport. That hidden-under-normal layer therefore keeps the engine's generic #D9D9D9 image-placeholder wash. This is not a Piqueray colour extracted from Figma, and the survol-only funIa plane remains outside the runtime photo API.",
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
    taille: {
      control: 'select',
      options: ['standard', 'member-card'],
      description:
        'Code-side geometry selector for observed composed placements. The MemberCard instance is explicitly resized to 363.5px inside its 364px parent frame; the standalone atom keeps the 364px master geometry by default.',
    },
    src: { control: 'text' },
    alt: { control: 'text' },
  },
  args: {
    etat: 'defaut',
    taille: 'standard',
    src: '',
    alt: '',
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
/** Every legal combination the contract defines (etat × taille). */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(2, max-content)',
        alignItems: 'center',
        justifyItems: 'start',
      }}
    >
      <MemberPicture etat="defaut" taille="standard" />
      <MemberPicture etat="defaut" taille="member-card" />
      <MemberPicture etat="survol" taille="standard" />
      <MemberPicture etat="survol" taille="member-card" />
    </div>
  ),
};
