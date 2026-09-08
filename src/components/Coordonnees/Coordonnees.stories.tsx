/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/coordonnees.contract.json (ds.coordonnees v3.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Coordonnees } from './Coordonnees';

const meta = {
  title: 'Sections/Coordonnees',
  component: Coordonnees,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Piqueray section « Nos coordonnées », responsive. 3.0.0 (2026-09-07, vague 031) : MAJEUR parce que les ancres changent de set — le contrat quittait l'ancien master 2104:2904 (page DS · Organisms) pour le set candidat 2778:34448 (page « 031 · Planches de validation », section « 031 · 20 · COORDONNEES »), quatre variantes sur le seul axe Presentation = Mobile | Tablette | Desktop | Wide.\n\nCe que la version 3 change, dans l'ordre où cela se voit. (1) L'en-tête cesse d'être une instance de ds.section-header : il est DESSINÉ À PLAT dans la section, exactement comme ds.reassurances 2.0.0 l'a fait dans la même vague. L'ancienne composition figeait le titre à 40 px sur les quatre écrans ; à plat, l'accroche monte le rôle overline (14/20 Regular · 14/20 Regular · 16/20 Medium · 20/25 Medium) et le titre le rôle H2 (24/30 · 24/30 · 32/40 · 40/50 SemiBold). (2) La mise en page devient responsive : EMPILÉE en Mobile et Tablette — le plan pleine largeur au rapport 16/9, le panneau dessous — et CÔTE À CÔTE en Desktop et Wide, le panneau à largeur fixe d'un tiers (400 puis 576) et le plan en remplissage sur les deux tiers restants, étiré sur la hauteur de la rangée que le panneau décide. (3) Les quatre étiquettes montent le rôle H4 (20/25 · 20/25 · 24/30 · 24/30 Medium) et les quatre valeurs le rôle body (16/24 Regular · 16/24 Regular · 18/27 Medium · 18/27 Medium) : elles étaient du texte libre sans style du DS et ne suivaient aucun écran. (4) Les informations passent à DEUX colonnes en Tablette et là seulement, parce que c'est le seul écran où le panneau est pleine largeur (738 de contenu) alors qu'il n'occupe qu'un tiers ailleurs (342 · 738 · 304 · 480 ; règle : deux colonnes au-delà de 600).\n\nCe que le set candidat NE dessine PLUS et que la version 2 portait : les valeurs Adresse et Contact étaient soulignées (declared text-decoration-line et textSegments underline). Le candidat ne souligne rien — vérifié au pixel sur la planche Wide (profil d'encre par ligne, aucune rangée dense sous la ligne de base, les 4 à 6 pixels résiduels étant les jambages de « info@piqueray.be »). Les soulignements sont retirés ici ; côté Odoo l'affordance de lien est reportée au survol et au focus, fait code-only nommé dans la description de la part Contact.\n\nCINQ DÉFAUTS DE SOURCE relevés à l'étape 0 et NON contournés en silence — chacun est écrit ici et dans le journal de section (specs/tiny/vague-031/coordonnees.md, « À corriger à la source ») : (a) l'en-tête de l'ancien master était une instance de SectionHeader large de 1550 px posée dans un panneau de 480 — elle débordait ; l'aplatissement la corrige ; (b) les quatre étiquettes et les quatre valeurs étaient du texte libre, sans style du design system, donc immobiles d'un écran à l'autre ; (c) la valeur Contact porte un vrai saut de ligne (téléphone puis e-mail) — et le relevé de la planche montre que les valeurs Adresse (deux lignes) et Horaires (trois lignes) en portent aussi, sur les quatre écrans, alors que rien ne les y forcerait : la plus longue ligne mesure 220 px pour 480 px de contenu disponible en Wide ; les trois parts déclarent donc white-space pre-line ; (d) l'instance SectionHeader portait un blanc non lié à aucune variable, posé sur le fond bleu clair de la section ; (e) les deux icônes sociales sont en noir pur brut (#000000), non liées — le contrat les porte par le registre d'icônes, la couleur reste celle du glyphe.\n\nHistorique avant 3.0.0 :\nPiqueray Coordonnees. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored.",
      },
    },
  },
  render: (args) => <Coordonnees key={JSON.stringify(args)} {...args} />,
  argTypes: {
    presentation: {
      control: 'select',
      options: ['mobile', 'tablette', 'desktop', 'wide'],
      description:
        "Présentation par écran, miroir de l'axe Presentation du set candidat 2778:34448. Défaut = mobile, première variante du set et base mobile-first du CSS livré ; dans le CSS livré c'est la fenêtre qui choisit, par les jetons de rupture, jamais un consommateur.",
    },
    mapUrl: {
      control: 'text',
      description:
        "URL fournie par le code pour le paint IMAGE du plan Google — LIMITE NOMMÉE A5 (docs/FIGMA-CAPABILITY-MATRIX.md) : Figma range ces pixels dans un paint du master, jamais dans une propriété de composant, et le contrat n'a aucun canal background-image ici. Le défaut vide est intentionnel et ne substitue aucune image. Le paint de l'ancien master (2104:2899, imageRef efdebf1941d13dbd5a2ab421aaeac49d352a87b2) n'est plus l'ancre ; le set candidat dessine un cadrage DIFFÉRENT par variante (relevé : entre la planche 390 et la planche 1728 le rapport d'échelle des repères vaut 3,45 alors qu'un même original recouvert donnerait 2,95 ou 3,11 selon l'axe), ce qu'aucune règle CSS d'object-fit ne reproduit depuis une source unique : écart nommé, jamais contourné.",
    },
    mapAlt: {
      control: 'text',
      description:
        "Équivalent textuel fourni par le code, apparié à mapUrl. Un paint IMAGE Figma n'expose aucune propriété de composant correspondante, donc le défaut vide est intentionnel.",
    },
    accroche: {
      control: 'text',
      description:
        "Sur-titre de la section, dessiné à plat depuis 3.0.0. La liaison TEXT « Accroche » est celle que portait la version 2 ; elle n'a PAS pu être revérifiée contre le set candidat 2778:34448 (aucun dump n'a été fourni à l'agent et le canevas ne lui est pas ouvert) — la question est ouverte au journal de section sous « Bloqué / à trancher ». Sur l'ancien master la propriété existait mais n'avait AUCUN effet (0 componentPropertyReferences mesuré), l'instance SectionHeader routant la valeur.",
    },
    titre: {
      control: false,
      description:
        "Titre de la section, dessiné à plat depuis 3.0.0 (il passait auparavant par l'instance ds.section-header). Reste rich-text : le titre observé est UNIFORME (un seul segment) mais le type ouvre la voie aux graisses par plage sans nouveau MAJEUR. Même réserve que l'accroche sur la liaison TEXT « Titre », non revérifiée contre le set candidat.",
    },
  },
  args: {
    presentation: 'mobile',
    mapUrl: '',
    mapAlt: '',
    accroche: 'Contact',
    titre: [{ text: 'Nos coordonnées' }],
  },
} satisfies Meta<typeof Coordonnees>;

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
      <Coordonnees presentation="mobile" />
      <Coordonnees presentation="tablette" />
      <Coordonnees presentation="desktop" />
      <Coordonnees presentation="wide" />
    </div>
  ),
};
