/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/footer.contract.json (ds.footer v2.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Footer } from './Footer';

const meta = {
  title: 'Sections/Footer',
  component: Footer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Piqueray Footer, responsive. v2.0.0 (spec 031) reprend les ancres sur le set 031 `Footer` 2735:12509 (axe Presentation : Mobile · Tablette · Desktop · Wide) et remplace le master DS 2120:4785, qui ne portait qu'une seule largeur. MAJOR : nouvelle prop publique `presentation`, nouvelles parts (LigneBas et sa paire d'icônes, propres au mode desktop), ancres Figma changées. Les 4 variantes ont été nettoyées à la source avant extraction (instanciation des composants gouvernés, liaison de toutes les valeurs d'espacement, fond en STRETCH) : relevé et mesures dans specs/tiny/vague-031/footer.md.",
      },
    },
  },
  render: (args) => <Footer key={JSON.stringify(args)} {...args} />,
  argTypes: {
    presentation: { control: 'select', options: ['mobile', 'tablette', 'desktop', 'wide'] },
    items: { control: false },
  },
  args: {
    presentation: 'mobile',
    items: [
      { texte: 'Rue Alfred Drèze 7,\n4860 Pepinster', titre: 'Adresse' },
      { texte: 'Du lundi au vendredi\nde 8h00 à 12h00 et\nde 13h30 à 17h00', titre: 'Horaires' },
      { texte: 'Tél : +32 (0)87 46 32 66\nEmail: info@piqueray.be', titre: 'Contact' },
    ],
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Mobile: Story = {
  args: { presentation: 'mobile' },
};

export const Tablette: Story = {
  args: { presentation: 'tablette' },
};

export const Desktop: Story = {
  args: { presentation: 'desktop' },
};

export const Wide: Story = {
  args: { presentation: 'wide' },
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
      <Footer presentation="mobile" />
      <Footer presentation="tablette" />
      <Footer presentation="desktop" />
      <Footer presentation="wide" />
    </div>
  ),
};
