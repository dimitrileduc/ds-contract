/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/field.contract.json (ds.field v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '../Input';
import { Field } from './Field';

const meta = {
  title: 'Molecules/Field',
  component: Field,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray Field. Extracted from the Figma COMPONENT_SET on DS · Molécules, reviewed and adopted — not authored.',
      },
    },
  },
  render: (args) => (
    <Field key={JSON.stringify(args)} {...args}>
      <Input value="Texte de saisie" />
    </Field>
  ),
  argTypes: {
    etat: { control: 'select', options: ['normal', 'erreur'] },
    label: { control: 'text' },
    optionnel: {
      control: 'boolean',
      description: 'Extracted from Figma "Optionnel" BOOLEAN property (added by sync pass).',
    },
    children: { control: false },
  },
  args: {
    etat: 'normal',
    label: 'Libellé',
    optionnel: false,
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Normal: Story = {
  args: { etat: 'normal' },
};

export const Erreur: Story = {
  args: { etat: 'erreur' },
};
