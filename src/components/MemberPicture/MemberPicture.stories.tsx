/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/member-picture.contract.json (ds.member-picture v1.4.0)
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
          "Piqueray member picture. A circular member-photo component with two states, extracted from the Figma COMPONENT_SET « MemberPicture » on DS · Atomes, reviewed and adopted — not authored.\n\nThe etat variant stacks two 364×364 circular image planes: normal is opaque in defaut and transparent in survol, with a 300ms opacity transition. The root clips both planes at its 500px radius. The visible normal plane receives its code-only src and alt scalars from its composed parent.\n\n† A5 technical placeholder: the source IMAGE pixels of funIa are unavailable to the contract→canvas transport. That hidden-under-normal layer therefore keeps the engine's generic #D9D9D9 image-placeholder wash. This is not a Piqueray colour extracted from Figma.\n\nVERSION 1.4.0 (2026-09-07, passe 2 du portage « Equipe v2 ») — LE PLAN DE SURVOL RECOIT ENFIN SA ROUTE, ET C'EST FIGMA QUI LE COMMANDE. Jusqu'ici seul le plan normal portait src et alt : le plan funIa, celui que le survol decouvre, n'avait AUCUN canal. Consequence mesurable, nommee par la passe 1 (journal specs/tiny/equipe-v2/member-card.md, section 7 point 3) : survoler une carte faisait DISPARAITRE le portrait pour ne montrer que le lavis technique. Or le master empile bien DEUX photos, sur les deux variantes du set. Les props srcSurvol et altSurvol ouvrent donc le meme canal code-only que src et alt, sur le plan du dessous, avec exactement la meme convention : la ROUTE, jamais les octets (trou A5, matrice ligne 91). Ajout purement additif — aucune prop ne disparait, aucune valeur ne se resserre : MINEUR. Le lavis #D9D9D9 reste la base de previsualisation quand aucune route n'est fournie.",
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
        'Compatibility axis retained for existing consumers. Both values now use the same parent-owned fluid square geometry; the old 363.5px workaround belonged to the former fixed-track approximation.',
    },
    src: {
      control: 'text',
      description:
        "La ROUTE du portrait, jamais ses octets. Figma n'expose aucune propriete de composant pour ces pixels (trou A5, matrice ligne 91, colonne Bindable : image content not bindable) : le contrat porte la route, la photo arrive a l'execution. Defaut vide, et il le reste. Le root de ce composant porte deliberement un lavis technique #D9D9D9 comme base de previsualisation A5 : c'est un fait de CONTRAT, pas une frontiere image. La photo qu'un designer voit sur le canevas est une maquette, hors contrat, preservee a la regeneration par une passe de sauvetage explicite (docs/handoff/08-status-what-doesnt-work.md, §6).",
    },
    alt: { control: 'text' },
    srcSurvol: {
      control: 'text',
      description:
        "La ROUTE du portrait du plan funIa, celui que le survol decouvre quand le plan normal passe en opacite 0. Meme convention que src, et pour la meme raison : Figma n'expose aucune propriete de composant pour des pixels (trou A5, matrice ligne 91, colonne Bindable), donc le contrat porte la route et la photo arrive a l'execution. Canal ouvert en 1.4.0 : avant, ce plan n'avait ni prop ni attribut et le survol montrait le lavis technique a la place d'un visage. Defaut vide, et il le reste.",
    },
    altSurvol: {
      control: 'text',
      description:
        "Alternative textuelle du portrait de survol. Vide par defaut : le plan funIa reste decoratif tant qu'aucune route ne lui est donnee.",
    },
  },
  args: {
    etat: 'defaut',
    taille: 'standard',
    src: '',
    alt: '',
    srcSurvol: '',
    altSurvol: '',
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
