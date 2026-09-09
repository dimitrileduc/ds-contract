/**
 * GENERATED FILE (inline-styles emitter) — DO NOT EDIT.
 * Source of truth: contracts/formulaire.contract.json (ds.formulaire v3.1.0)
 * Emitted by core/emit-react-inline.ts — the zero-infrastructure output:
 * every token reference was RESOLVED to its literal value from the design
 * tokens at emit time. Resolution mode: light (brand: default). To retheme,
 * re-emit against different tokens — do not edit literals by hand.
 * Fidelity: :hover/:focus-visible state tokens are not expressible as inline
 * styles and are omitted; ROOT disabled-state tokens apply via the disabled
 * prop; PART-level state overrides (Part.states, v13) are omitted — the same
 * declared limit as the hover states (state-selected descendant styling).
 * Fidelity: repeat collections render the contract's OBSERVED sample as fixed
 * instances (the array prop is declared but not mapped on this surface) — the
 * full React surface maps the live array.
 */
import { forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import { Avantage } from './Avantage';
import { Field } from './Field';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Button } from './Button';

const S: Record<string, CSSProperties> = {
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "justifyContent": "flex-start",
    "width": "100%",
    "minWidth": 0,
    "border": 0,
    "fontFamily": "Montserrat, sans-serif",
    "paddingInline": "24px",
    "paddingBlock": "0px",
    "gap": "48px"
  },
  "column": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "flex": "1 1 auto",
    "minWidth": 0,
    "width": "100%",
    "gap": "48px"
  },
  "enTete": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "width": "100%",
    "minWidth": 0,
    "gap": "8px"
  },
  "Accroche": {
    "width": "100%",
    "minWidth": 0,
    "color": "#26282C",
    "fontSize": "14px",
    "fontWeight": 400,
    "lineHeight": "20px",
    "letterSpacing": "0.15em",
    "textTransform": "uppercase"
  },
  "Titre": {
    "width": "100%",
    "minWidth": 0,
    "color": "#26282C",
    "fontSize": "24px",
    "fontWeight": 600,
    "lineHeight": "30px"
  },
  "features": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "width": "100%",
    "minWidth": 0,
    "gap": "32px"
  },
  "form": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "width": "100%",
    "minWidth": 0,
    "backgroundColor": "#F4F6FA",
    "paddingInline": "24px",
    "paddingBlock": "32px",
    "gap": "32px",
    "borderRadius": "4px",
    "overflowX": "hidden",
    "overflowY": "hidden"
  },
  "ResumeErreurs": {
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "stretch",
    "width": "100%",
    "minWidth": 0,
    "gap": "16px"
  },
  "barre": {
    "width": "4px",
    "backgroundColor": "#D32F2F"
  },
  "texte": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "flex": "1 1 auto",
    "minWidth": 0,
    "width": "100%",
    "gap": "8px"
  },
  "TitreResume": {
    "color": "#26282C",
    "fontSize": "20px",
    "fontWeight": 600,
    "lineHeight": "25px"
  },
  "LienEmail": {
    "color": "#D32F2F",
    "fontSize": "16px",
    "fontWeight": 400,
    "lineHeight": "24px",
    "textDecorationLine": "underline"
  },
  "LienMessage": {
    "color": "#D32F2F",
    "fontSize": "16px",
    "fontWeight": 400,
    "lineHeight": "24px",
    "textDecorationLine": "underline"
  },
  "rangIdentite": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "width": "100%",
    "minWidth": 0,
    "gap": "32px"
  },
  "rangContact": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "stretch",
    "width": "100%",
    "minWidth": 0,
    "gap": "32px"
  },
  "Consentement": {
    "width": "100%",
    "minWidth": 0,
    "color": "#26282C",
    "fontSize": "14px",
    "fontWeight": 400,
    "lineHeight": "24px"
  },
  "Succes": {
    "width": "100%",
    "minWidth": 0,
    "color": "#237A3C",
    "fontSize": "16px",
    "fontWeight": 500,
    "lineHeight": "24px"
  }
};

/** Per-variant overrides, resolved per enum value: "prop-value:part" → styles. */
const V: Record<string, CSSProperties> = {
  "presentation-tablette:root": {
    "paddingInline": "48px"
  },
  "presentation-tablette:form": {
    "paddingInline": "48px",
    "paddingBlock": "64px"
  },
  "presentation-tablette:rangIdentite": {
    "gap": "16px",
    "flexDirection": "row",
    "alignItems": "stretch",
    "width": "100%",
    "minWidth": "0"
  },
  "presentation-tablette:rangContact": {
    "gap": "16px",
    "flexDirection": "row",
    "alignItems": "stretch",
    "width": "100%",
    "minWidth": "0"
  },
  "presentation-desktop:root": {
    "paddingInline": "56px",
    "gap": "32px",
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "flex-start",
    "width": "100%",
    "minWidth": "0"
  },
  "presentation-desktop:form": {
    "paddingInline": "48px",
    "paddingBlock": "64px",
    "width": "528px"
  },
  "presentation-desktop:rangIdentite": {
    "gap": "16px",
    "flexDirection": "row",
    "alignItems": "stretch",
    "width": "100%",
    "minWidth": "0"
  },
  "presentation-desktop:rangContact": {
    "gap": "16px",
    "flexDirection": "row",
    "alignItems": "stretch",
    "width": "100%",
    "minWidth": "0"
  },
  "presentation-wide:root": {
    "paddingInline": "89px",
    "gap": "32px",
    "display": "flex",
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "flex-start",
    "width": "100%",
    "minWidth": "0"
  },
  "presentation-wide:form": {
    "paddingInline": "48px",
    "paddingBlock": "64px",
    "width": "759px"
  },
  "presentation-wide:rangIdentite": {
    "gap": "16px",
    "flexDirection": "row",
    "alignItems": "stretch",
    "width": "100%",
    "minWidth": "0"
  },
  "presentation-wide:rangContact": {
    "gap": "16px",
    "flexDirection": "row",
    "alignItems": "stretch",
    "width": "100%",
    "minWidth": "0"
  }
};

export interface FormulaireProps extends HTMLAttributes<HTMLDivElement> {
  /** Écran de présentation, mobile-first. Les quatre valeurs sont les quatre variantes du candidat ; en CSS elles sont les paliers 768 / 992 / 1600 de tokens/modes/viewport.*. */
  presentation?: 'mobile' | 'tablette' | 'desktop' | 'wide';
  accroche?: string;
  /** Titre riche (gras gouverné possible), rendu à plat dans la section. */
  titre?: Array<{ text: string; strong?: boolean; underline?: boolean }>;
  /** Les arguments (icône + titre + texte), collection code-only ; le canevas dessine l'échantillon de quatre. */
  items?: Array<{ titre: string; texte: string }>;
  /** Phrase d'information RGPD (intérêt légitime : répondre à une demande) — pas de case à cocher, juridiquement inutile pour une réponse et coûteuse en conversion ; une case ne devient nécessaire que pour un autre usage (newsletter). */
  consentement?: string;
  /** État du formulaire après une tentative d'envoi refusée. erreur : résumé en tête du panneau et champs obligatoires en erreur (forwardé aux deux Field concernés, même énumération). Code-only : posé par l'hôte (Odoo) au retour serveur ou par la validation client. */
  etat?: 'normal' | 'erreur';
  /** Envoi réussi : affiche la ligne de confirmation sous le bouton (le formulaire reste, vidé par l'hôte). Code-only. */
  envoye?: boolean;
  /** Texte de la ligne de confirmation. Un délai chiffré rassure et évite les relances. */
  succes?: string;
}

/** Section « Formulaire de contact » Piqueray : à gauche l'accroche, le titre et quatre arguments ; à droite, sur un panneau bleu clair, cinq champs, la phrase de consentement et le bouton « Envoyer ». Relevée sur le candidat v2 « Formulaire » de la planche 031·21 (2026-09-08, option A validée par l'owner), revue et adoptée — pas rédigée à la main.

MAJEUR 3.0.0. Ce que la source d'origine (master 2096:2564) avait de cassé et que ce contrat ne porte plus : un SectionHeader de 1550 posé dans une colonne de 759 (titre coupé), des champs HUG à 125 px, deux CTA « Contactez-nous » inutiles, un bouton d'envoi libellé « Contactez-nous » sous une phrase de consentement qui disait « Envoyer », des champs pré-remplis de « Texte de saisie ». Deux champs retirés (Adresse, Sujet — décision owner : ils se demandent au rappel) ; Email et Message obligatoires, les trois autres optionnels et marqués comme tels. L'en-tête est DESSINÉ à plat (accroche = typography.overline, titre = typography.h2), pas instancié : aucune section v2 n'instancie SectionHeader (runbook docs/16).

Responsive : axe presentation ; racine width fill, referenceWidth 1728, gouttière DANS la section (24 · 48 · 56 · 89, règle de page de la vague 031) ; empilé en Mobile et Tablette, deux colonnes 50/50 en Desktop et Wide. Les paires Prénom|Nom et Email|Téléphone sont DÉPAIRÉES en Mobile (294 de contenu — une paire donnerait 139 par champ).

MÉCANIQUE D'ENVOI CÔTÉ HÔTE, PAS DANS LE CONTRAT (décision owner 2026-09-08, sur le précédent des liens du 2026-08-18, matrice de capacité HOST-ONLY) : le contrat gouverne l'apparence et les états ; la balise <form>, la destination, la soumission, l'anti-spam et la validation serveur sont ceux d'Odoo (s_website_form), posés par le gabarit Odoo. Corollaire nommé : le bouton reste ds.button (type="button" en dur, 264 épingles) — Odoo déclenche l'envoi sur son marqueur .s_website_form_send, pas sur un submit natif ; en React la soumission est au consommateur.

ÉTATS GOUVERNÉS (props code-only etat et envoye, validés sur les croquis de la planche) : etat=erreur affiche le résumé d'erreurs en tête du panneau (barre rouge, titre, un lien par champ fautif — patron GOV.UK) ET passe les deux champs obligatoires en erreur avec leur message, mot pour mot le même ; envoye=true affiche la ligne de confirmation SOUS le bouton, en color.vert, le formulaire restant en place et vidé (option B validée — pas de redirection, pas de saut de mise en page). Les liens du résumé sont des textes ici ; le gabarit Odoo en fait des ancres vers les champs (destination = contenu, hôte).

DÉVIATIONS NOMMÉES : (1) colonnes 50/50 — grow seul garde une base de contenu (flex 1 1 auto) et rendrait les colonnes inégales ; on suit le motif ds.coordonnees 3.0.0 : le panneau a une largeur FIXE par écran (size.formulaire.panneau), la colonne grandit — exact aux largeurs témoins, fluide entre deux paliers. Le canevas dessine les deux moitiés fixes. (2) La légende « champs suivis d'un astérisque » recommandée par l'audit UX n'est pas portée : elle n'est pas sur la planche validée au repos — différée, nommée. (3) Aucune valeur de champ pré-remplie ; aucun placeholder au repos (décision owner : champs vides).

VERSION 3.1.0 (2026-09-09, vague « arrondis ») — rayon radius.4 sur le panneau de saisie (form) avec rognage. Les champs eux-mêmes reçoivent leur rayon dans ds.input / ds.textarea / ds.select 2.1.0. Posé sur le canevas AVANT le contrat (§VIII), planches 031 · 26 et 031 · 27 validées puis supprimées, versions nommées avant/après. Ajout purement additif : MINEUR. */
export const Formulaire = forwardRef<HTMLDivElement, FormulaireProps>(function Formulaire(
  { presentation = 'mobile', etat = 'normal', envoye = false, accroche = 'Une demande de devis ? Une réparation ?', consentement = 'En cliquant sur « Envoyer », je confirme avoir lu et accepté la politique de confidentialité.', succes = '✓  Merci, votre message est parti. Nous vous répondons sous 24 à 48 heures ouvrées.', titre = [{"text":"Prenez contact avec nous dès maintenant !"}], items, style, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} style={{ ...S.root, ...(V[`presentation-${presentation}:root`] ?? {}), ...style }} data-envoye={envoye || undefined}  {...rest}>
      <div style={{ ...S.column }}>
<div style={{ ...S.enTete }}>
<span style={{ ...S.Accroche }}>{accroche}</span>
<h2 style={{ ...S.Titre }}>{titre.map(({ text, strong, underline }, index) => { const inner = underline ? <u>{text}</u> : text; return strong ? <strong key={index} style={{ fontWeight: 700 }}>{inner}</strong> : <span key={index}>{inner}</span>; })}</h2>
</div>
<div style={{ ...S.features }}>
<Avantage titre="Conseils personnalisés" texte="Devis gratuits effectués sur place, nous nous déplaçons chez vous" />
<Avantage titre="Produits de qualité" texte="Marque Hörmann renommée, qualité allemande" />
<Avantage titre="Dépannage et SAV" texte="Nous mettons tout en œuvre pour vous dépanner dans les meilleurs délais" />
<Avantage titre="Expérience et savoir-faire" texte="Nous cumulons plus de 50 ans d’expérience sur trois générations" />
</div>
</div>
<div style={{ ...S.form, ...(V[`presentation-${presentation}:form`] ?? {}) }}>
{etat === 'erreur' ? (<div style={{ ...S.ResumeErreurs }} role="alert" tabIndex={-1}>
<div style={{ ...S.barre }}>

</div>
<div style={{ ...S.texte }}>
<span style={{ ...S.TitreResume }}>Votre message n’a pas pu être envoyé</span>
<span style={{ ...S.LienEmail }}>→ Saisissez votre adresse e-mail pour que nous puissions vous répondre.</span>
<span style={{ ...S.LienMessage }}>→ Écrivez votre message : décrivez en quelques mots votre projet ou votre question.</span>
</div>
</div>) : null}
<div style={{ ...S.rangIdentite, ...(V[`presentation-${presentation}:rangIdentite`] ?? {}) }}>
<Field label="Prénom" optionnel inputID="formulaire-prenom" erreurID="formulaire-prenom-erreur"><Input id="formulaire-prenom" name="prenom" type="text" autocomplete="given-name" /></Field>
<Field label="Nom" optionnel inputID="formulaire-nom" erreurID="formulaire-nom-erreur"><Input id="formulaire-nom" name="nom" type="text" autocomplete="family-name" /></Field>
</div>
<div style={{ ...S.rangContact, ...(V[`presentation-${presentation}:rangContact`] ?? {}) }}>
<Field label="Email" obligatoire etat={etat} inputID="formulaire-email" erreurID="formulaire-email-erreur" messageErreur="Saisissez votre adresse e-mail pour que nous puissions vous répondre."><Input id="formulaire-email" name="email" type="email" autocomplete="email" required describedBy="formulaire-email-erreur" /></Field>
<Field label="Téléphone" optionnel inputID="formulaire-telephone" erreurID="formulaire-telephone-erreur"><Input id="formulaire-telephone" name="telephone" type="tel" autocomplete="tel" /></Field>
</div>
<Field label="Message" obligatoire etat={etat} inputID="formulaire-message" erreurID="formulaire-message-erreur" messageErreur="Écrivez votre message : décrivez en quelques mots votre projet ou votre question."><Textarea id="formulaire-message" name="message" required describedBy="formulaire-message-erreur" /></Field>
<span style={{ ...S.Consentement }}>{consentement}</span>
<Button>Envoyer</Button>
{envoye ? (<p style={{ ...S.Succes }} role="status">{succes}</p>) : null}
</div>
    </div>
  );
});
