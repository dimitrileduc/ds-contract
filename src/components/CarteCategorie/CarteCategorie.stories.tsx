/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/carte-categorie.contract.json (ds.carte-categorie v1.0.0)
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
          "Piqueray CarteCategorie. Extracted from the cleaned Figma COMPONENT_SET on DS · Molécules (2495:6770), reviewed at Gate A — not authored. One category card with a single Style axis: `superpose` (photo plane + gradient scrim + white overlaid title/text + arrow affordance, ds.hero pattern) and `empile` (stacked photo + title/text + a governed ds.button CTA). Shared semantics: titre, texte, image, CTA label. Image URLs stay consumer/campaign inputs (route A5), never capture defaults.\n\nGouvernance (Gate A, 2026-08-20): le TYPE de CTA de la carte empilée est une option gouvernée `ctaType` {lien, bouton} — `lien` = bouton Link « Contactez-nous » à icônes pdf/download (reprise de ds.carte), `bouton` = bouton encadré outlineNoir « Prendre rendez-vous » à flèche (usage Maintenance/Rdv). Le libellé reste du contenu libre (`ctaLabel`).\n\nLimites nommées : (1) `ctaType` n'a PAS d'axe VARIANT sur le master (binding NONE, code-gouverné) — l'axe Figma est un nettoyage de source différé ; (2) le texte du style empilé perd la plage forte rich-text de ds.carte : la composition `repeat`+`arrayOf` de la section ne transporte que du texte plat (limite de composition, pas un choix esthétique) ; (3) le plan photo du style superposé est porté comme part d'anatomie absolue (A5, convention sav/devis), le master range ces pixels dans un paint IMAGE du root.",
      },
    },
  },
  render: (args) => <CarteCategorie key={JSON.stringify(args)} {...args} />,
  argTypes: {
    style: { control: 'select', options: ['superpose', 'empile'] },
    ctaType: {
      control: 'select',
      options: ['lien', 'bouton'],
      description:
        "Type de CTA gouverné de la carte empilée (Gate A, 2026-08-20). `lien` = ds.button Link à icônes pdf/download ; `bouton` = ds.button outlineNoir encadré à flèche. LIMITE NOMMÉE : le master CarteCategorie n'expose AUCUN axe VARIANT pour ce type (binding NONE, code-gouverné) — l'axe Figma est un nettoyage de source différé (autorat assumé au Gate A au-dessus d'une source incomplète). N'a d'effet que sur le style empilé.",
    },
    titre: { control: 'text' },
    texte: {
      control: 'text',
      description:
        "Corps de la carte. Type `text` (plat, non rich-text) DÉLIBÉRÉMENT : la section ds.categories-principales compose cette molécule via `repeat` sur une prop `arrayOf`, dont les champs sont plat par le schéma — un `texte` rich-text ne se transporterait pas par item. La plage forte « SupraMatic & ProMatic. » que porte ds.carte n'est donc pas reprise (limite de composition nommée, pas un choix esthétique).",
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
    ctaType: 'lien',
    titre: 'Pour portes de garage',
    texte:
      'SupraMatic & ProMatic. Ouverture ultra-rapide et verrouillage mécanique anti-intrusion breveté.',
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
