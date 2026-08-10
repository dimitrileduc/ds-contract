/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/formulaire.contract.json (ds.formulaire v2.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Formulaire } from './Formulaire';

const meta = {
  title: 'Sections/Formulaire',
  component: Formulaire,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Piqueray Formulaire. Extracted from the Figma COMPONENT_SET on DS · Organisms, reviewed and adopted — not authored. v2.0.0 makes the existing Titre/Accroche controls live on the composed SectionHeader. Titre changes from flat text to rich-text so its governed marks survive parent→child forwarding; the prop name and visible default stay unchanged, while the type change is correctly major-versioned.',
      },
    },
  },
  render: (args) => <Formulaire key={JSON.stringify(args)} {...args} />,
  argTypes: {
    consentement: { control: 'text' },
    items: { control: false },
    accroche: {
      control: 'text',
      description: 'Extracted from Figma "Accroche" TEXT property (added by sync pass).',
    },
    titre: {
      control: false,
      description:
        'Extracted from Figma "Titre" TEXT property (added by sync pass). Type rich-text since 2.0.0 because the exact parent→SectionHeader mapping must preserve the child contract\'s governed marks instead of flattening them.',
    },
  },
  args: {
    consentement:
      'En cliquant sur «Envoyer», je confirme avoir lu et accepté la politique de confidentialité.',
    items: [
      {
        texte: 'Devis gratuits effectués sur place, nous nous déplaçons chez vous',
        titre: 'Conseils personnalisés',
      },
      { texte: 'Marque Hormann renommée, qualité allemande', titre: 'Produits de qualité' },
      {
        texte: 'Nous mettons tout en œuvre pour vous dépanner dans les meilleur délais',
        titre: 'Dépannage et SAV',
      },
      {
        texte: 'Nous cumulons plus de 50 ans d’expérience sur trois générations',
        titre: 'Expérience et savoir-faire',
      },
    ],
    accroche: 'Une demande de devis ? Une réparation ?',
    titre: [{ text: 'Prenez contact avec nous dès maintenant !' }],
  },
} satisfies Meta<typeof Formulaire>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
