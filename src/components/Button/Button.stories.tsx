/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/button.contract.json (ds.button v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray button. Six variants extracted from the Figma « Bouton » set (Default, Orange, Blanc, Outline blanc, Link, Outilne noir), bound to Piqueray primitives. The label is a reusable prop.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'orange', 'blanc', 'outlineBlanc', 'link', 'outilneNoir'],
      description: 'Visual style of the button.',
    },
    children: {
      control: 'text',
      description:
        'Button label. Authored: promoted to a reusable prop — in the Figma source the text « Contactez-nous » is static (not a component property), so contract↔Figma parity will list this as authored drift.',
    },
  },
  args: {
    variant: 'default',
    children: 'Contactez-nous',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Default: Story = {
  args: { variant: 'default' },
};

export const Orange: Story = {
  args: { variant: 'orange' },
};

export const Blanc: Story = {
  args: { variant: 'blanc' },
};

export const OutlineBlanc: Story = {
  args: { variant: 'outlineBlanc' },
};

export const Link: Story = {
  args: { variant: 'link' },
};

export const OutilneNoir: Story = {
  args: { variant: 'outilneNoir' },
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
      <Button variant="default">Contactez-nous</Button>
      <Button variant="orange">Contactez-nous</Button>
      <Button variant="blanc">Contactez-nous</Button>
      <Button variant="outlineBlanc">Contactez-nous</Button>
      <Button variant="link">Contactez-nous</Button>
      <Button variant="outilneNoir">Contactez-nous</Button>
    </div>
  ),
};
