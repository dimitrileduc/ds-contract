/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/member-card.contract.json (ds.member-card v1.2.1)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemberCard } from './MemberCard';

const meta = {
  title: 'Molecules/MemberCard',
  component: MemberCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray MemberCard. Extracted from the Figma COMPONENT on DS · Molécules, reviewed and adopted — not authored. Portrait IMAGE overrides are explicit code-only photo data, propagated to the composed MemberPicture without flattening its image anatomy.',
      },
    },
  },
  render: (args) => <MemberCard key={JSON.stringify(args)} {...args} />,
  argTypes: {
    nom: { control: 'text' },
    poste: { control: 'text' },
    imageUrl: {
      control: 'text',
      description:
        "La ROUTE du portrait, jamais ses octets. Figma n'expose aucune propriete de composant pour ces pixels (trou A5, matrice ligne 91) : le contrat porte la route, la photo arrive a l'execution. Defaut vide, et il le reste. Ce contrat n'a pas de part `img` a lui — son plan photo vient de l'instance ds.member-picture qu'il compose — mais il porte bien sa propre prop d'URL, et elle obeit a la meme convention.",
    },
    imageAlt: { control: 'text' },
  },
  args: {
    nom: 'Cécilia Piqueray',
    poste: 'Gérante',
    imageUrl: '',
    imageAlt: '',
  },
} satisfies Meta<typeof MemberCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
