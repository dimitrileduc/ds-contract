/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/piqueray-logo.contract.json (ds.piqueray-logo v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PiquerayLogo } from './PiquerayLogo';

const meta = {
  title: 'Atoms/PiquerayLogo',
  component: PiquerayLogo,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray brand logo. Two color variants: default (orange brand mark, blue text) and white (all white) — the couleur prop switches both the mark fill and the text traces simultaneously. Extracted from the Figma COMPONENT_SET « PiquerayLogo » on DS · Atomes, reviewed and adopted — not authored.\n\nThe logo is a purely decorative brand element — no text content, no interaction, no a11y label beyond the img role. Anatomy carries the drawn structure: Marque (orange fill, bound to {color.orange}) and Texte (8 vector traces, blue fill switching to white on couleur=blanc via tokensByProp).',
      },
    },
  },
  render: (args) => <PiquerayLogo key={JSON.stringify(args)} {...args} />,
  argTypes: {
    couleur: {
      control: 'select',
      options: ['default', 'blanc'],
      description:
        'Color variant: default (orange mark + blue text) or white (all white for dark backgrounds). Extracted from the VARIANT property « Couleur » on the Figma master.',
    },
  },
  args: {
    couleur: 'default',
  },
} satisfies Meta<typeof PiquerayLogo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Default: Story = {
  args: { couleur: 'default' },
};

export const Blanc: Story = {
  args: { couleur: 'blanc' },
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
      <PiquerayLogo couleur="default" />
      <PiquerayLogo couleur="blanc" />
    </div>
  ),
};
