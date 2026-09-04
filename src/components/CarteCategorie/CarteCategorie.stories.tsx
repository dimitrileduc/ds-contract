/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/carte-categorie.contract.json (ds.carte-categorie v2.1.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CarteCategorie } from './CarteCategorie';

const meta = {
  title: 'Molecules/CarteCategorie',
  component: CarteCategorie,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Piqueray CarteCategorie, responsive. 2.0.0 (2026-09-02, vague 031) : le style superposé est ré-extrait du set 2692:19667 (page « 031 · Planches de validation »), qui remplace le master 2495:6770. Ce qui change : le voile occupe toute la carte au lieu du seul bas, son padding horizontal suit le token responsive spacing.card-categorie.pad-h (24 / 32), le titre monte le style responsive « Titre carte » (typography.h3.*, 20/25 SemiBold → 32/40 Medium) et la description « Description carte » (typography.card-desc.*, 16/24 → 18/27), le plan photo passe en absolu parce que la hauteur de la carte appartient à la section (quatre hauteurs par mode), et la largeur minimale dessinée 320 est mintée. Deux propriétés TEXT (Titre, Texte) ont été posées sur le set le 2026-09-02 : titre et texte sont de nouveau liés. Le style empilé est conservé tel quel (décision owner) bien que le set 031 ne le dessine plus.\n\nHistorique avant 2.0.0 :\nPiqueray CarteCategorie. Extracted from the cleaned Figma COMPONENT_SET on DS · Molécules (2495:6770), reviewed at Gate A — not authored. One category card with a single Style axis: `superpose` (photo plane + gradient scrim + white overlaid title/text + arrow affordance, ds.hero pattern) and `empile` (stacked photo + title/text + a governed ds.button CTA). Shared semantics: titre, texte, image, CTA label. Image URLs stay consumer/campaign inputs (route A5), never capture defaults.\n\nGouvernance (Gate A, 2026-08-20): le TYPE de CTA de la carte empilée est une option gouvernée `ctaType` {lien, bouton} — `lien` = bouton Link « Contactez-nous » à icônes pdf/download (reprise de ds.carte), `bouton` = bouton encadré outlineNoir « Prendre rendez-vous » à flèche (usage Maintenance/Rdv). Le libellé reste du contenu libre (`ctaLabel`).\n\nLimites nommées : (1) `ctaType` n'a PAS d'axe VARIANT sur le master (binding NONE, code-gouverné) — l'axe Figma est un nettoyage de source différé ; (2) le texte du style empilé perd la plage forte rich-text de ds.carte : la composition `repeat`+`arrayOf` de la section ne transporte que du texte plat (limite de composition, pas un choix esthétique) ; (3) le plan photo du style superposé est porté comme part d'anatomie absolue (A5, convention sav/devis), le master range ces pixels dans un paint IMAGE du root. Plan de document : la partie titre porte la balise h3 (accessibilite-home-odoo, 2026-09-04) ; l'apparence reste pilotee par les jetons typography, axe independant du niveau.",
      },
    },
  },
  render: (args) => <CarteCategorie key={JSON.stringify(args)} {...args} />,
  argTypes: {
    style: {
      control: 'select',
      options: ['superpose', 'empile'],
      description:
        " — 2026-09-02 : le set 031 (2692:19667) ne dessine QUE `superpose` ; `empile` est conservé au contrat sur décision owner (d'autres pages l'utiliseront), sans correction de la source. L'axe VARIANT du set ne déclare donc qu'une valeur : écart de parité acquitté, pas une dérive.",
    },
    afficherDecor: {
      control: 'boolean',
      description:
        'Affiche le filet décoratif du coin haut-droit. Le set 031 le DESSINE sur la carte mais les deux instances de la section le masquent (visible=false, surcharge d’instance brute, 2026-09-02) : la visibilité devient une option gouvernée que le parent passe, plutôt qu’un calque caché — §VIII. Le set n’expose aucune propriété BOOLEAN : liaison NONE, écart nommé, à corriger à la source.',
    },
    ctaType: {
      control: 'select',
      options: ['lien', 'bouton'],
      description:
        "Type de CTA gouverné de la carte empilée (Gate A, 2026-08-20). `lien` = ds.button Link à icônes pdf/download ; `bouton` = ds.button outlineNoir encadré à flèche. LIMITE NOMMÉE : le master CarteCategorie n'expose AUCUN axe VARIANT pour ce type (binding NONE, code-gouverné) — l'axe Figma est un nettoyage de source différé (autorat assumé au Gate A au-dessus d'une source incomplète). N'a d'effet que sur le style empilé.",
    },
    titre: { control: 'text', description: ' Défaut relevé sur le set 031 le 2026-09-02.' },
    texte: {
      control: 'text',
      description:
        "Corps de la carte. Type `text` (plat, non rich-text) DÉLIBÉRÉMENT : la section ds.categories-principales compose cette molécule via `repeat` sur une prop `arrayOf`, dont les champs sont plat par le schéma — un `texte` rich-text ne se transporterait pas par item. La plage forte « SupraMatic & ProMatic. » que porte ds.carte n'est donc pas reprise (limite de composition nommée, pas un choix esthétique). Défaut relevé sur le set 031 le 2026-09-02.",
    },
    imageUrl: {
      control: 'text',
      description:
        "La ROUTE de l'image, jamais ses octets (gap A5, docs/FIGMA-CAPABILITY-MATRIX.md l.91 ; reprise verbatim de ds.carte.imageUrl). Défaut vide et il le reste ; le canevas dessine le lavis technique #D9D9D9, la photo maquette est hors contrat et préservée à la régénération par la passe de sauvetage.",
    },
    imageAlt: { control: 'text' },
    ctaLabel: {
      control: 'text',
      description:
        "Libellé du CTA du style empilé — contenu libre (Gate A : le texte du CTA n'est jamais l'option). Binding NONE (précédent ds.carte.ctaLabel : la propriété TEXT vit sur le Button imbriqué, pas au niveau du set).",
    },
  },
  args: {
    style: 'superpose',
    afficherDecor: true,
    ctaType: 'lien',
    titre: 'Portes de garage',
    texte: 'Une porte de garage pour chaque goût et chaque style de maison.',
    imageUrl: '',
    imageAlt: '',
    ctaLabel: 'Contactez-nous',
  },
} satisfies Meta<typeof CarteCategorie>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Superpose: Story = {
  args: { style: 'superpose' },
};

export const Empile: Story = {
  args: { style: 'empile' },
};
/** Every legal combination the contract defines (style × ctaType). */
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
      <CarteCategorie style="superpose" ctaType="lien" />
      <CarteCategorie style="superpose" ctaType="bouton" />
      <CarteCategorie style="empile" ctaType="lien" />
      <CarteCategorie style="empile" ctaType="bouton" />
    </div>
  ),
};
