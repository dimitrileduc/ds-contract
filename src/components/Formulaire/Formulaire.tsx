/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/formulaire.contract.json (ds.formulaire v3.0.0)
 * Regenerate with: npm run generate
 */
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Avantage } from '../Avantage';
import { Field } from '../Field';
import { Input } from '../Input';
import { Textarea } from '../Textarea';
import { Button } from '../Button';
import styles from './Formulaire.module.css';

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

DÉVIATIONS NOMMÉES : (1) colonnes 50/50 — grow seul garde une base de contenu (flex 1 1 auto) et rendrait les colonnes inégales ; on suit le motif ds.coordonnees 3.0.0 : le panneau a une largeur FIXE par écran (size.formulaire.panneau), la colonne grandit — exact aux largeurs témoins, fluide entre deux paliers. Le canevas dessine les deux moitiés fixes. (2) La légende « champs suivis d'un astérisque » recommandée par l'audit UX n'est pas portée : elle n'est pas sur la planche validée au repos — différée, nommée. (3) Aucune valeur de champ pré-remplie ; aucun placeholder au repos (décision owner : champs vides). */
export const Formulaire = forwardRef<HTMLDivElement, FormulaireProps>(function Formulaire(
  {
    presentation = 'mobile',
    etat = 'normal',
    envoye = false,
    accroche = 'Une demande de devis ? Une réparation ?',
    consentement = 'En cliquant sur « Envoyer », je confirme avoir lu et accepté la politique de confidentialité.',
    succes = '✓  Merci, votre message est parti. Nous vous répondons sous 24 à 48 heures ouvrées.',
    titre = [{ text: 'Prenez contact avec nous dès maintenant !' }],
    items,
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = [
    styles.root,
    styles[`presentation-${presentation}`],
    styles[`etat-${etat}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div ref={ref} className={classes} data-envoye={envoye || undefined} {...rest}>
      <div className={styles.column}>
        <div className={styles.enTete}>
          <span className={styles.Accroche}>{accroche}</span>
          <h2 className={styles.Titre}>
            {titre.map((segment, index) => {
              const inner = segment.underline ? <u>{segment.text}</u> : segment.text;
              return segment.strong ? (
                <strong key={index}>{inner}</strong>
              ) : (
                <span key={index}>{inner}</span>
              );
            })}
          </h2>
        </div>
        <div className={styles.features}>
          {items?.map((item, index) => (
            <Avantage key={index} titre={item.titre} texte={item.texte} />
          ))}
        </div>
      </div>
      <div className={styles.form}>
        {etat === 'erreur' ? (
          <div className={styles.ResumeErreurs} role="alert" tabIndex={-1}>
            <div className={styles.barre}></div>
            <div className={styles.texte}>
              <span className={styles.TitreResume}>Votre message n’a pas pu être envoyé</span>
              <span className={styles.LienEmail}>
                → Saisissez votre adresse e-mail pour que nous puissions vous répondre.
              </span>
              <span className={styles.LienMessage}>
                → Écrivez votre message : décrivez en quelques mots votre projet ou votre question.
              </span>
            </div>
          </div>
        ) : null}
        <div className={styles.rangIdentite}>
          <Field
            label="Prénom"
            optionnel
            inputID="formulaire-prenom"
            erreurID="formulaire-prenom-erreur"
          >
            <Input id="formulaire-prenom" name="prenom" type="text" autocomplete="given-name" />
          </Field>
          <Field label="Nom" optionnel inputID="formulaire-nom" erreurID="formulaire-nom-erreur">
            <Input id="formulaire-nom" name="nom" type="text" autocomplete="family-name" />
          </Field>
        </div>
        <div className={styles.rangContact}>
          <Field
            label="Email"
            obligatoire
            etat={etat}
            inputID="formulaire-email"
            erreurID="formulaire-email-erreur"
            messageErreur="Saisissez votre adresse e-mail pour que nous puissions vous répondre."
          >
            <Input
              id="formulaire-email"
              name="email"
              type="email"
              autocomplete="email"
              required
              describedBy="formulaire-email-erreur"
            />
          </Field>
          <Field
            label="Téléphone"
            optionnel
            inputID="formulaire-telephone"
            erreurID="formulaire-telephone-erreur"
          >
            <Input id="formulaire-telephone" name="telephone" type="tel" autocomplete="tel" />
          </Field>
        </div>
        <Field
          label="Message"
          obligatoire
          etat={etat}
          inputID="formulaire-message"
          erreurID="formulaire-message-erreur"
          messageErreur="Écrivez votre message : décrivez en quelques mots votre projet ou votre question."
        >
          <Textarea
            id="formulaire-message"
            name="message"
            required
            describedBy="formulaire-message-erreur"
          />
        </Field>
        <span className={styles.Consentement}>{consentement}</span>
        <Button>Envoyer</Button>
        {envoye ? (
          <p className={styles.Succes} role="status">
            {succes}
          </p>
        ) : null}
      </div>
    </div>
  );
});
