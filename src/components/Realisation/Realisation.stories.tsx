/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/realisation.contract.json (ds.realisation v2.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Realisation } from './Realisation';

const meta = {
  title: 'Molecules/Realisation',
  component: Realisation,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Piqueray Realisation — la tuile photo de la section Realisations. 2.0.0 (2026-09-07, vague 035) : RUPTURE MAJEURE de geometrie. La 1.1.0 portait sa propre taille (743 ou 339,5 selon l'axe Taille) ; en v2 la tuile prend la taille de sa cellule de grille et reste carree (rapport 1:1). Defaut de source releve a l'etape 0 et corrige a la source le meme jour : le cadre enfant Image portait un aplat gris opaque de la meme taille que la tuile, qui recouvrait entierement la photo — les 27 tuiles vivantes du fichier (3 pages + les 2 masters) n'ont jamais montre leur photo. Le fill IMAGE reste une surcharge d'instance cote Figma ; src et alt sont des semantiques de code.",
      },
    },
  },
  render: (args) => <Realisation key={JSON.stringify(args)} {...args} />,
  argTypes: {
    taille: {
      control: 'select',
      options: ['grand', 'petit'],
      description:
        "Axe VARIANT Figma `Taille` (Grand | Petit), conserve parce qu'il existe sur le set. DEPUIS LA 2.0.0 IL NE PILOTE PLUS AUCUNE GEOMETRIE : la taille vient de la cellule de grille de la section. L'axe est donc inerte cote code — deviation nommee, pas silencieuse. Son retrait touche 99 instances vivantes sur trois pages clientes : decision owner en attente (voir specs/tiny/vague-031/realisations.md).",
    },
    imageUrl: {
      control: 'text',
      description:
        'Code-supplied URL for the visible IMAGE fill at either selected size. Figma stores the 27 observed photos as instance fill overrides (3 Grand and 24 Petit), not as a component property; the empty runtime default is intentional and does not substitute an image.',
    },
    imageAlt: {
      control: 'text',
      description:
        'Code-supplied text alternative paired with imageUrl for either selected size. Figma IMAGE fills expose no corresponding alt component property, so the empty runtime default is intentional.',
    },
  },
  args: {
    taille: 'grand',
    imageUrl: '',
    imageAlt: '',
  },
} satisfies Meta<typeof Realisation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Grand: Story = {
  args: { taille: 'grand' },
};

export const Petit: Story = {
  args: { taille: 'petit' },
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
      <Realisation taille="grand" />
      <Realisation taille="petit" />
    </div>
  ),
};
