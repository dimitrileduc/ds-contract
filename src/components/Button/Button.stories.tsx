/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/button.contract.json (ds.button v1.2.0)
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
          "Piqueray button. Six variants extracted from the Figma « Bouton » set (Default, Orange, Blanc, Outline blanc, Link, Outilne noir), bound to Piqueray primitives. The label is a reusable prop. The two nested icons are leading/trailing SLOTS: since 2026-07-23 the Figma masters bind their visibility to the BOOLEAN properties « Icône gauche »/« Icône droite » (promotion from observed usage — 21/79 page instances show a left icon, 59/79 a right one), modeled here as the iconLeft/iconRight boolean props with the file's own cil:arrow-* glyphs as default content. Page-level INSTANCE SWAPS of those glyphs (pdf, download, cart, …) stay designer-side instance overrides — an INSTANCE_SWAP slot model is deliberately deferred until the icon masters get contracts. Known extraction gap, named: propose-figma does not yet lower the dump's boolDefaults/propRefs into props, so this promotion is authored and reviewed against the 2026-07-23 dump.",
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
    iconLeft: {
      control: 'boolean',
      description:
        "Shows the leading icon slot (default glyph: the file's cil:arrow-left). Extracted from the BOOLEAN property « Icône gauche » added to the Figma masters on 2026-07-23; on pages the glyph is often instance-swapped (pdf, cart, phone, …) — swaps stay designer-side overrides.",
    },
    iconRight: {
      control: 'boolean',
      description:
        "Shows the trailing icon slot (default glyph: the file's cil:arrow-right — the « → » of Link buttons). Extracted from the BOOLEAN property « Icône droite » added to the Figma masters on 2026-07-23; on pages the glyph is sometimes instance-swapped (download, chevron, …).",
    },
  },
  args: {
    variant: 'default',
    children: 'Contactez-nous',
    iconLeft: false,
    iconRight: false,
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
