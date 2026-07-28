/**
 * Live rendering of the REAL generated design-system components.
 * The dashboard dogfoods the library it documents: every sample below is the
 * actual component from src/components, driven by contract-legal props only.
 *
 * HAND-AUTHORED, NOT GENERATED — and a HARDCODED component list. This file is
 * the dashboard's live-render registry: it must be extended by hand whenever a
 * component is added to `contracts/`. The rest of the dashboard IS glob-driven
 * over `contracts/*.contract.json`; this registry is the one place that is not,
 * because a live render needs a real import and real prop shapes, which a glob
 * cannot supply. A component with no case here still lists and documents
 * normally — it simply renders "No sample available" instead of a preview.
 *
 * Piqueray reconversion: the 51 demo samples were removed with the demo
 * contracts. Button + the four spec-004 input atoms (Input/Textarea/Select/
 * Checkbox) are the current governed set.
 */
import type { ReactNode } from 'react';
import {
  Button, Input, Textarea, Select, Checkbox,
  MemberPicture, PiquerayLogo,
  AccordionRow, Avantage, CarouselControls, Carte, Copyright,
  Field, FooterColumn, MemberCard, NavItem, ProductCard,
  Realisation, SectionHeader, Tab,
  Coordonnees, Devis, Equipe, FAQ, Footer, Formulaire,
  Header, Hero, Presentation, Reassurances, SAV, TexteSEO,
  GoogleReviews, ReviewCard,
} from '../../src/components';
import type {
  AccordionRowProps, ButtonProps, InputProps, TextareaProps, SelectProps, CheckboxProps,
} from '../../src/components';

/** Default text children/value per component, used when no override is supplied. */
export const SAMPLE_TEXT: Record<string, string> = {
  Button: 'Contactez-nous',
  Input: 'Texte de saisie',
  Textarea: 'Texte de saisie',
  Select: 'Texte de saisie',
  AccordionRow: 'Contenu de l\'accordéon',
  Carte: 'Description de la carte',
  Copyright: '© Piqueray 2026',
  NavItem: 'Accueil',
  Tab: 'Onglet 1',
  Coordonnees: 'Nos coordonnées',
  TexteSEO: 'Texte optimisé pour le référencement',
};

const SAMPLE_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22743%22 height=%22743%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23d9d9d9%22/%3E%3C/svg%3E';

export function renderSample(
  name: string,
  props: Record<string, unknown> = {},
  childText?: string,
): ReactNode {
  const text = (fallback: string) =>
    childText !== undefined && childText !== '' ? childText : fallback;

  switch (name) {
    case 'Button':
      return <Button {...(props as ButtonProps)}>{text('Contactez-nous')}</Button>;

    // The atoms carry their text as the `value` PROP (not children), so the
    // playground's `value` control drives them through {...props} — NOT the
    // childText path (which is for text-children components like Button). No
    // hardcoded value/checked override: that would shadow the control, and a
    // fixed default would disagree with what the control shows. The component's
    // own contract-default renders when props is empty (the list previews); the
    // detail playground drives it live through props.
    case 'Input':
      return <Input {...(props as InputProps)} />;

    case 'Textarea':
      return <Textarea {...(props as TextareaProps)} />;

    case 'Select':
      return <Select {...(props as SelectProps)} />;

    case 'Checkbox':
      return <Checkbox {...(props as CheckboxProps)} />;

    // -- US1: missing atoms --
    case 'MemberPicture':
      return <MemberPicture etat="defaut" {...props} />;
    case 'PiquerayLogo':
      return <PiquerayLogo couleur="default" {...props} />;

    // -- US2: molecules --
    case 'AccordionRow':
      return (
        <AccordionRow
          taille="grand"
          titre="Question fréquente"
          contenu={text('Réponse')}
          {...(props as AccordionRowProps)}
        />
      );
    case 'Avantage':
      return <Avantage titre="Qualité garantie" {...props} />;
    case 'CarouselControls':
      return <CarouselControls {...props} />;
    case 'Carte':
      return <Carte disposition="reassurance" titre="Titre" imageUrl={SAMPLE_IMAGE} imageAlt="" {...props} />;
    case 'Copyright':
      return <Copyright {...props}>{text('© Piqueray 2026')}</Copyright>;
    case 'Field':
      return <Field label="Nom" etat="normal" {...props}><Input /></Field>;
    case 'FooterColumn':
      return <FooterColumn {...props} />;
    case 'MemberCard':
      return <MemberCard {...props} />;
    case 'NavItem':
      return <NavItem actif={false} libelle={text('Accueil')} href="/" {...props} />;
    case 'ProductCard':
      return <ProductCard imageUrl={SAMPLE_IMAGE} imageAlt="Produit" {...props} />;
    case 'Realisation':
      return <Realisation imageUrl={SAMPLE_IMAGE} imageAlt="Réalisation" {...props} />;
    case 'SectionHeader':
      return <SectionHeader disposition="standard" {...props} />;
    case 'Tab':
      return <Tab actif={false} {...props}>{text('Onglet 1')}</Tab>;

    // -- US3: organisms --
    case 'Coordonnees':
      return <Coordonnees {...props} />;
    case 'Devis':
      return <Devis {...props} />;
    case 'Equipe':
      return <Equipe {...props} />;
    case 'FAQ':
      return <FAQ {...props} />;
    case 'Footer':
      return <Footer {...props} />;
    case 'Formulaire':
      return <Formulaire {...props} />;
    case 'Header':
      return <Header {...props} />;
    case 'Hero':
      return <Hero {...props} />;
    case 'Presentation':
      return <Presentation {...props} />;
    case 'Reassurances':
      return <Reassurances {...props} />;
    case 'SAV':
      return <SAV {...props} />;
    case 'TexteSEO':
      return <TexteSEO {...props} />;

    // -- existing composites --
    case 'GoogleReviews':
      return <GoogleReviews {...props} />;
    case 'ReviewCard':
      return <ReviewCard {...props} />;

    default:
      return <span className="muted">No sample available.</span>;
  }
}
