/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/google-reviews-section.contract.json (ds.google-reviews-section v1.0.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { GoogleReviewsSection } from './GoogleReviewsSection';

const meta = {
  title: 'Sections/GoogleReviewsSection',
  component: GoogleReviewsSection,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Composition publique Avis Google. Elle réunit le titre de section et le widget ds.google-reviews, auparavant deux frères ad hoc dans les Pages Figma et dans le seed Odoo. Le root est Fill/Hug, sans largeur fixe ni padding local : le Container consommateur possède l'espacement externe.",
      },
    },
  },
  render: (args) => <GoogleReviewsSection key={JSON.stringify(args)} {...args} />,
  argTypes: {
    titre: { control: false },
    accroche: { control: 'text' },
    qualificatif: { control: 'text' },
    noteGlobale: { control: 'text' },
    volume: { control: 'text' },
    montrerControles: { control: 'boolean' },
  },
  args: {
    titre: [{ text: 'Plus de 1500 portes installées par année et autant de clients satisfaits' }],
    accroche: 'Nos avis Google vérifiés',
    qualificatif: 'Excellent',
    noteGlobale: '4.8',
    volume: '93 avis',
    montrerControles: true,
  },
} satisfies Meta<typeof GoogleReviewsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
