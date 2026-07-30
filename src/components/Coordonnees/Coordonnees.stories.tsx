/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/coordonnees.contract.json (ds.coordonnees v2.2.0)
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
          'Piqueray Coordonnees. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored.',
      },
    },
  },
  render: (args) => <Coordonnees key={JSON.stringify(args)} {...args} />,
  argTypes: {
    mapUrl: {
      control: 'text',
      description:
        "URL fournie par le code pour le paint IMAGE du plan Google (RECTANGLE Figma 2104:2899, imageRef efdebf1941d13dbd5a2ab421aaeac49d352a87b2) — LIMITE NOMMÉE A5 (docs/FIGMA-CAPABILITY-MATRIX.md) : Figma range ces pixels dans un paint du master, jamais dans une propriété de composant, et le contrat n'a aucun canal background-image ; l'imageRef est donc consigné ici et jamais lié. Le défaut vide est intentionnel et ne substitue aucune image.",
    },
    mapAlt: {
      control: 'text',
      description:
        "Équivalent textuel fourni par le code, apparié à mapUrl. Un paint IMAGE Figma n'expose aucune propriété de composant correspondante, donc le défaut vide est intentionnel.",
    },
    accroche: {
      control: 'text',
      description: 'Extracted from Figma "Accroche" TEXT property (added by sync pass).',
    },
    titre: {
      control: false,
      description:
        'Extracted from Figma "Titre" TEXT property (added by sync pass). Type rich-text depuis section-header 2.0.0 : la propriété est transmise VIVANTE à l\'enfant (titre: "{titre}"), et un mapping vers une prop rich-text exige une prop rich-text côté parent — sinon les graisses que l\'enfant sait désormais porter seraient aplaties au passage. Le titre observé (I2169:6216;2090:2387) est UNIFORME : un seul segment.',
    },
  },
  args: {
    mapUrl: '',
    mapAlt: '',
    accroche: 'Contact',
    titre: [{ text: 'Nos coordonnées' }],
  },
} satisfies Meta<typeof Coordonnees>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
