/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/presentation.contract.json (ds.presentation v4.2.1)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Presentation } from './Presentation';

const meta = {
  title: 'Sections/Presentation',
  component: Presentation,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "4.2.1 (2026-09-09) : correction de SOURCE, contrat inchange dans ses faits. Le set 031 ne portait une vraie instance de ds.button qu'en Wide ; Mobile, Tablette et Desktop dessinaient un cadre « Bouton » a la main (54 de haut, marge de bloc 16, texte libre sans style de texte, taille liee au primitif font/size/16 au lieu de la taille responsive du bouton). Remplace par l'instance link + fleche sur les trois variantes (16 instances suivent). Hauteurs : Mobile 544 → 520, Tablette 394 → 370. Le fait code-only « marge de bloc 16 sous 992 » disparait avec le cadre ; reste « pleine largeur sous 992, taille intrinseque au-dessus ». Description de la part Bouton mise a jour ; CSS Odoo par ecran allege d'autant.\n\nPiqueray Presentation responsive, adopted from the 031 component set. Mobile and tablette stack title, copy and CTA; desktop and wide use two equal columns. The wide component is authored at 1287px: this is the intentional reference width for this section, confirmed by the owner on 2026-09-02. Breakpoints remain an Odoo projection concern; the contract records the four Figma presentations and the design tokens only. 4.1.0 (2026-09-04) : « Hörmann » est SOULIGNÉ dans le paragraphe. Fait de source relevé sur les quatre variantes du set 031 (textDecoration UNDERLINE sur la plage [70,77)), que le contrat ne portait pas — le mot s'affichait en gras seul. La marque `underline` existe au schéma depuis la v19 (segment rich-text, rendue <u> par les émetteurs) : il suffisait de la poser. Plan de document : la partie titre porte la balise h2 (accessibilite-home-odoo, 2026-09-04) ; l'apparence reste pilotee par les jetons typography, axe independant du niveau.",
      },
    },
  },
  render: (args) => <Presentation key={JSON.stringify(args)} {...args} />,
  argTypes: {
    presentation: {
      control: 'select',
      options: ['mobile', 'tablette', 'desktop', 'wide'],
      description:
        'Viewport presentation mirrored from the 031 Figma axis. Mobile is the first set variant and the mobile-first CSS base; consumers do not select it at runtime.',
    },
    texte: {
      control: false,
      description:
        'Rich body copy. The 031 source contains paragraph breaks, therefore this content accepts strong and line-break in Odoo. Figma exposes no component property for this drawn text.',
    },
    bouton: {
      control: 'boolean',
      description:
        'CTA presence retained for code consumers. The 031 canvas does not expose it as a component property, so its Figma binding is NONE and Odoo fixes it by composition.',
    },
    titre: {
      control: false,
      description:
        'Presentation-owned rich title. Its responsive H2 typography carries 24/30, 24/30, 32/40 and 40/50 across the 031 variants; Figma exposes no component property for the drawn text.',
    },
  },
  args: {
    presentation: 'mobile',
    texte: [
      { text: 'Depuis plus de 50 ans,', strong: true },
      { text: ' PIQUERAY est dépositaire officiel de la marque ' },
      { text: 'Hörmann', strong: true, underline: true },
      {
        text: ', fabricant connu pour ses produits de qualité et ses innovations.\n\nComposée d’une équipe d’une vingtaine de personnes de la ',
      },
      { text: 'région verviétoise', strong: true },
      {
        text: ' et gérée par Florian et Cécilia Piqueray (frère et sœur), l’entreprise se démarque par son caractère familial et sa proximité.\n\nQue vous soyez particulier ou une entreprise, ',
      },
      { text: 'Piqueray vous accompagne de A à Z', strong: true },
      { text: ' dans votre projet.' },
    ],
    bouton: true,
    titre: [
      { text: 'Piqueray, votre distributeur de portes Hörmann ' },
      { text: 'en Province de Liège', strong: true },
    ],
  },
} satisfies Meta<typeof Presentation>;

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
      <Presentation presentation="mobile" />
      <Presentation presentation="tablette" />
      <Presentation presentation="desktop" />
      <Presentation presentation="wide" />
    </div>
  ),
};
