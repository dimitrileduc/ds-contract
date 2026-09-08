/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/avantage.contract.json (ds.avantage v2.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avantage } from './Avantage';

const meta = {
  title: 'Molecules/Avantage',
  component: Avantage,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Argument Piqueray : l'icône hexagonale et un titre suivi d'un texte. Relevé sur le candidat v2 « Avantage · candidat v2 » de la planche 031·21 (2026-09-08), revu et adopté — pas rédigé à la main.\n\nMAJEUR 2.0.0 : les ancres passent au candidat ; la racine perd ses tailles figées (1.0.0 : 759×75 — un texte sur trois lignes DÉBORDAIT sur l'argument suivant, mesuré) au profit de width fill et d'une hauteur au contenu ; la typographie prend les rôles responsive du DS (titre = typography.h4, texte = typography.body, les valeurs par écran vivent dans tokens/modes/viewport.*) ; l'icône suit l'écran par le jeton spacing.avantage.icone (40 en Mobile et Tablette, 64 en Desktop et Wide — 64 était disproportionné sur un écran de 342, décision owner). Une molécule n'a pas d'axe présentation : tout ce qui change par écran passe par un jeton qui varie par écran, comme spacing.product-card.width.\n\nL'icône est l'asset gouverné `piqueray` ; sa taille intrinsèque reste 64 (icon.size) et les jetons width/height de la part la redimensionnent — l'émetteur reporte ces jetons sur le <svg> injecté, sinon seul le cadre changerait de taille.",
      },
    },
  },
  render: (args) => <Avantage key={JSON.stringify(args)} {...args} />,
  argTypes: {
    titre: { control: 'text' },
    texte: { control: 'text' },
  },
  args: {
    titre: 'Conseils personnalisés',
    texte: 'Devis gratuits effectués sur place, nous nous déplaçons chez vous',
  },
} satisfies Meta<typeof Avantage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
