/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/formulaire.contract.json (ds.formulaire v3.1.0)
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
          "Section « Formulaire de contact » Piqueray : à gauche l'accroche, le titre et quatre arguments ; à droite, sur un panneau bleu clair, cinq champs, la phrase de consentement et le bouton « Envoyer ». Relevée sur le candidat v2 « Formulaire » de la planche 031·21 (2026-09-08, option A validée par l'owner), revue et adoptée — pas rédigée à la main.\n\nMAJEUR 3.0.0. Ce que la source d'origine (master 2096:2564) avait de cassé et que ce contrat ne porte plus : un SectionHeader de 1550 posé dans une colonne de 759 (titre coupé), des champs HUG à 125 px, deux CTA « Contactez-nous » inutiles, un bouton d'envoi libellé « Contactez-nous » sous une phrase de consentement qui disait « Envoyer », des champs pré-remplis de « Texte de saisie ». Deux champs retirés (Adresse, Sujet — décision owner : ils se demandent au rappel) ; Email et Message obligatoires, les trois autres optionnels et marqués comme tels. L'en-tête est DESSINÉ à plat (accroche = typography.overline, titre = typography.h2), pas instancié : aucune section v2 n'instancie SectionHeader (runbook docs/16).\n\nResponsive : axe presentation ; racine width fill, referenceWidth 1728, gouttière DANS la section (24 · 48 · 56 · 89, règle de page de la vague 031) ; empilé en Mobile et Tablette, deux colonnes 50/50 en Desktop et Wide. Les paires Prénom|Nom et Email|Téléphone sont DÉPAIRÉES en Mobile (294 de contenu — une paire donnerait 139 par champ).\n\nMÉCANIQUE D'ENVOI CÔTÉ HÔTE, PAS DANS LE CONTRAT (décision owner 2026-09-08, sur le précédent des liens du 2026-08-18, matrice de capacité HOST-ONLY) : le contrat gouverne l'apparence et les états ; la balise <form>, la destination, la soumission, l'anti-spam et la validation serveur sont ceux d'Odoo (s_website_form), posés par le gabarit Odoo. Corollaire nommé : le bouton reste ds.button (type=\"button\" en dur, 264 épingles) — Odoo déclenche l'envoi sur son marqueur .s_website_form_send, pas sur un submit natif ; en React la soumission est au consommateur.\n\nÉTATS GOUVERNÉS (props code-only etat et envoye, validés sur les croquis de la planche) : etat=erreur affiche le résumé d'erreurs en tête du panneau (barre rouge, titre, un lien par champ fautif — patron GOV.UK) ET passe les deux champs obligatoires en erreur avec leur message, mot pour mot le même ; envoye=true affiche la ligne de confirmation SOUS le bouton, en color.vert, le formulaire restant en place et vidé (option B validée — pas de redirection, pas de saut de mise en page). Les liens du résumé sont des textes ici ; le gabarit Odoo en fait des ancres vers les champs (destination = contenu, hôte).\n\nDÉVIATIONS NOMMÉES : (1) colonnes 50/50 — grow seul garde une base de contenu (flex 1 1 auto) et rendrait les colonnes inégales ; on suit le motif ds.coordonnees 3.0.0 : le panneau a une largeur FIXE par écran (size.formulaire.panneau), la colonne grandit — exact aux largeurs témoins, fluide entre deux paliers. Le canevas dessine les deux moitiés fixes. (2) La légende « champs suivis d'un astérisque » recommandée par l'audit UX n'est pas portée : elle n'est pas sur la planche validée au repos — différée, nommée. (3) Aucune valeur de champ pré-remplie ; aucun placeholder au repos (décision owner : champs vides).\n\nVERSION 3.1.0 (2026-09-09, vague « arrondis ») — rayon radius.4 sur le panneau de saisie (form) avec rognage. Les champs eux-mêmes reçoivent leur rayon dans ds.input / ds.textarea / ds.select 2.1.0. Posé sur le canevas AVANT le contrat (§VIII), planches 031 · 26 et 031 · 27 validées puis supprimées, versions nommées avant/après. Ajout purement additif : MINEUR.",
      },
    },
  },
  render: (args) => <Formulaire key={JSON.stringify(args)} {...args} />,
  argTypes: {
    presentation: {
      control: 'select',
      options: ['mobile', 'tablette', 'desktop', 'wide'],
      description:
        'Écran de présentation, mobile-first. Les quatre valeurs sont les quatre variantes du candidat ; en CSS elles sont les paliers 768 / 992 / 1600 de tokens/modes/viewport.*.',
    },
    accroche: { control: 'text' },
    titre: {
      control: false,
      description: 'Titre riche (gras gouverné possible), rendu à plat dans la section.',
    },
    items: {
      control: false,
      description:
        "Les arguments (icône + titre + texte), collection code-only ; le canevas dessine l'échantillon de quatre.",
    },
    consentement: {
      control: 'text',
      description:
        "Phrase d'information RGPD (intérêt légitime : répondre à une demande) — pas de case à cocher, juridiquement inutile pour une réponse et coûteuse en conversion ; une case ne devient nécessaire que pour un autre usage (newsletter).",
    },
    etat: {
      control: 'select',
      options: ['normal', 'erreur'],
      description:
        "État du formulaire après une tentative d'envoi refusée. erreur : résumé en tête du panneau et champs obligatoires en erreur (forwardé aux deux Field concernés, même énumération). Code-only : posé par l'hôte (Odoo) au retour serveur ou par la validation client.",
    },
    envoye: {
      control: 'boolean',
      description:
        "Envoi réussi : affiche la ligne de confirmation sous le bouton (le formulaire reste, vidé par l'hôte). Code-only.",
    },
    succes: {
      control: 'text',
      description:
        'Texte de la ligne de confirmation. Un délai chiffré rassure et évite les relances.',
    },
  },
  args: {
    presentation: 'mobile',
    accroche: 'Une demande de devis ? Une réparation ?',
    titre: [{ text: 'Prenez contact avec nous dès maintenant !' }],
    items: [
      {
        titre: 'Conseils personnalisés',
        texte: 'Devis gratuits effectués sur place, nous nous déplaçons chez vous',
      },
      { titre: 'Produits de qualité', texte: 'Marque Hörmann renommée, qualité allemande' },
      {
        titre: 'Dépannage et SAV',
        texte: 'Nous mettons tout en œuvre pour vous dépanner dans les meilleurs délais',
      },
      {
        titre: 'Expérience et savoir-faire',
        texte: 'Nous cumulons plus de 50 ans d’expérience sur trois générations',
      },
    ],
    consentement:
      'En cliquant sur « Envoyer », je confirme avoir lu et accepté la politique de confidentialité.',
    etat: 'normal',
    envoye: false,
    succes: '✓  Merci, votre message est parti. Nous vous répondons sous 24 à 48 heures ouvrées.',
  },
} satisfies Meta<typeof Formulaire>;

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
/** Every legal combination the contract defines (presentation × etat). */
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
      <Formulaire presentation="mobile" etat="normal" />
      <Formulaire presentation="mobile" etat="erreur" />
      <Formulaire presentation="tablette" etat="normal" />
      <Formulaire presentation="tablette" etat="erreur" />
      <Formulaire presentation="desktop" etat="normal" />
      <Formulaire presentation="desktop" etat="erreur" />
      <Formulaire presentation="wide" etat="normal" />
      <Formulaire presentation="wide" etat="erreur" />
    </div>
  ),
};
