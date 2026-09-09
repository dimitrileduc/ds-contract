/**
 * GENERATED FILE — DO NOT EDIT.
 * Source of truth: contracts/review-card.contract.json (ds.review-card v4.3.0)
 * Regenerate with: npm run generate
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReviewCard } from './ReviewCard';

const meta = {
  title: 'Molecules/ReviewCard',
  component: ReviewCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "4.2.0 (2026-09-08, demande owner) : LA CARTE ENTIERE EST CLIQUABLE, pas seulement « Lire la suite ». Deux canaux declares sur la racine — `cursor: pointer`, parce que la surface cliquable est la carte et que le pointeur doit le dire partout, et `position: relative`, qui n'est pas de la mise en forme mais le SOCLE du mecanisme. Le mecanisme lui-meme est code-only et vit dans la zone Odoo `responsive/review-card.pqr.css` : le lien « Lire la suite » etend un `::after` en `inset: 0` par-dessus la carte. C'est le patron de la carte-lien, et c'est le seul correct ici — envelopper la carte dans une ancre serait du HTML invalide (la carte CONTIENT deja une ancre), et un gestionnaire de clic en JavaScript donnerait une zone cliquable sans lien, donc sans clic milieu, sans « ouvrir dans un nouvel onglet » et sans destination visible dans la barre d'etat. Un seul lien, une seule destination, toute la carte.\n\n4.1.0 (2026-09-05, vague 033) : elevation au survol. La carte ne porte aucune ombre au repos, donc le repos ne bouge pas d'un octet ; le survol pose `0 12px 32px rgba(0,0,0,0.20)`.\n\nCe qui merite d'etre retenu ici est une hypothese REFUTEE PAR LA MESURE, gardee parce qu'elle se represente. En lisant le CSS genere avant d'ecrire, on a vu la bordure de cette carte dessinee en `box-shadow: inset 0 0 0 <w> <c>` et conclu qu'une ombre de survol la remplacerait — la carte perdrait son contour. Le jeton a d'abord porte une couche inset pour le re-declarer. La mesure sur la page rendue a montre l'inverse : des que le canal `box-shadow` est utilise par un etat, l'emetteur bascule la bordure en `border` reel (border-style/-color/-width), et les deux canaux cessent de se disputer. Au repos, page Odoo du 2026-09-05 : `border: 1px solid rgb(244,246,250)`, `box-shadow: none`. La couche inset a donc ete retiree — elle repeignait un 1px par-dessus une bordure deja presente et figeait un hexadecimal qu'un jeton portait deja.\n\nEFFET DE BORD MESURE, ET IL TOUCHE LE REPOS. Ce basculement n'est pas neutre : avec `border: 0` + ombre inset, le 1px etait peint SANS consommer de place ; avec un `border` reel et `box-sizing: border-box`, il en consomme. Mesure sur la page Odoo rendue le 2026-09-05 : la boite exterieure de la carte est inchangee (elle est posee par la grille, `width: 100%`), donc AUCUN deplacement dans la page ; mais la boite de contenu passe de 198 a 196 px — 1 px de chaque cote. C'est le seul changement au repos apporte par cette version, il est borne a l'interieur de la carte, et il est le prix du canal d'ombre. Ecrit ici parce que la version se presente comme « le repos ne bouge pas » sur les deux autres cartes, et que l'exception doit se lire au meme endroit que la regle.\n\nLimites nommées (measures/mesures-aplat.md, measures/faisabilite-canaux.md) : (1) l'exclusion pastille/photo est une CONVENTION de deux booléens indépendants, pas une contrainte de schéma — `visibleWhen` n'a pas de négation et un axe d'enum romprait la variation par item du `repeat` ; (2) la couleur de fond de la pastille-initiale est FIXE et gouvernée — les 5 avis réels portent 5 teintes différentes, non modélisables (aucun canal ne lie une couleur CSS à une valeur de texte libre par item) ; écart assumé, arbitré par l'owner (« la couleur, rien à faire ») ; (3) l'avatar photo reste un aplat gris + † sur le canevas — trou A5, non refermé (R6) ; le pixel réel est un override de fill IMAGE hors contrat, appliqué après le dernier amend ; (4) la séparation carte/fond du widget réel est une ombre douce (mesurée par balayage de bord : dégradé lisse sur ~15px) — `box-shadow` étant hors des deux registres de canaux, le repli est une bordure fine 1px, seul canal disponible.\n\nPromotion 2.0.0 (2026-08-18, demande owner). MAJEUR : trois props retirées. (1) `tronque` disparaît — « Lire la suite » était caché sur les instances alors que le master l'affichait toujours ; l'owner le veut visible partout, la prop n'avait donc plus d'objet. (2) `initialeVisible` et `photo` étaient DEUX booléens indépendants, ce que la limite (1) ci-dessus nommait déjà comme une convention fragile : ils autorisaient les deux états absurdes (aucun avatar, ou les deux à la fois) et exposaient au rédacteur Odoo deux bascules là où la règle métier est « photo s'il y a une photo, sinon initiale ». Ils sont remplacés par UNE variante `avatar`, exclusive par construction. Le master Figma est devenu un set de deux variantes le même jour ; la variante `Avatar=Initiale` conserve l'id et la clé historiques, donc les 45 instances survivent (vérifié : 45/45, textes intacts). (3) `note` apparaît — la note d'un avis était le seul fait important non éditable. Elle est portée par le composant imbriqué `ds.notation` (cinq bandes exclusives ; voir son contrat pour les trois mécanismes moins coûteux testés et refusés par le moteur). Son binding Figma est `NONE` À DESSEIN : le porter en VARIANT sur la carte forcerait un produit Avatar × Note = dix variantes du master. La contrepartie est nommée — le canevas montre toujours la note par défaut, et les cinq états se lisent sur l'atome `Notation`, pas sur la carte. (Au passage : la limite (1) d'origine affirmait qu'« une prop scalaire ne peut pas être figma.kind NONE » ; re-testé sur le schéma le 2026-08-18, c'est faux — seul l'inverse est imposé, les props `arrayOf` DOIVENT être NONE.) La prop `verifie` disparaît elle aussi (même geste, même raison que `tronque`) : le badge est inconditionnel.\n\nTEXTES — sans Text Style, comme 172 des 332 textes du fichier (compté le 2026-08-18). Les cinq textes de la carte (initialeTexte, auteur, date, temoignage, lireLaSuite) ne portent aucun Text Style. Ce n'est PAS une singularité de ce composant : sur les 332 nœuds texte des masters, 160 portent un style, 0 lient une variable de typographie, 172 n'ont ni l'un ni l'autre. Les variables `font/size/*`, `font/weight/*` et `typography/*` existent mais alimentent les Text Styles ; sur un nœud texte, seule la couleur est liée — aucun nœud du fichier ne lie sa taille ou sa graisse. Aucun des 18 styles ne correspond exactement à ces cinq recettes : initialeTexte est SemiBold 18/18 quand le seul style à 18 (« Lead ») est Regular 18/27 ; auteur est SemiBold 16/19,2 quand « Titre 6 » est SemiBold 16/20 ; date, temoignage et lireLaSuite sont Medium 14 quand les trois styles à 14 sont Regular ou Bold. Ces valeurs (19,2 = 16×1,2 ; 16,8 = 14×1,2 ; 19,6 = 14×1,4) sont des interlignes de navigateur héritées du widget tiers dont la carte a été extraite en 006, pas des valeurs dessinées. Les rapprocher d'un style voisin changerait le rendu d'un contenu client adopté, et le workflow interdit le rapprochement « au plus proche ». La réparation utile n'est donc pas locale à ce composant : c'est une passe de typographie sur les 172, à décider par l'owner. Écart de 6 px nommé, et volontairement NON corrigé (2026-09-04, revu avec l'owner). Sur la planche 031 en Wide, la carte la plus haute mesure 258 px alors que son contenu se termine à 240 : la marge basse effective y vaut 18 px au lieu des 24 que la carte déclare. RIEN N'EST TRONQUÉ — aucun texte coupé, aucun élément masqué, l'écart ne se voit pas à l'œil. Notre rendu applique les 24 px et fait donc 264 px, d'où +6 px sur la section Avis en Wide, seul écart de hauteur restant de la home. Le rendu est conforme au contrat ; c'est le dessin qui est légèrement plus serré. Rien à réparer tant que le développement du carrousel n'a pas rouvert cette carte.\n\nVERSION 4.3.0 (2026-09-09, vague « arrondis ») — la racine passe de radius.8 à radius.4 (un seul rayon dans le DS) ; le badge de vérification garde radius.8 (cercle de 16 px), les avatars radius.20. Canevas : 20 instances du master Avis Google portaient une surcharge radius/8 à l'instance, re-liées à radius/4. Posé sur le canevas AVANT le contrat (§VIII), planches 031 · 26 et 031 · 27 validées puis supprimées, versions nommées avant/après. Ajout purement additif : MINEUR.",
      },
    },
  },
  render: (args) => <ReviewCard key={JSON.stringify(args)} {...args} />,
  argTypes: {
    auteur: { control: 'text' },
    initiale: { control: 'text' },
    date: { control: 'text' },
    texte: { control: 'text' },
    avatar: {
      control: 'select',
      options: ['Initiale', 'Photo'],
      description:
        "Forme de l'avatar. Exclusive par construction — remplace les deux booléens indépendants de la 1.0.0. Côté produit la règle est dérivée : photo s'il y a une photo publiée, sinon initiale.",
    },
    note: {
      control: 'select',
      options: ['1', '2', '3', '4', '5'],
      description:
        "Note de l'avis, transmise telle quelle à ds.notation. Binding canevas NONE : voir la promotion 2.0.0 dans la description du contrat.",
    },
    photoUrl: {
      control: 'text',
      description:
        "src côté code ; inerte sur le canevas (trou A5, R6) — une prop scalaire ne peut pas être figma.kind:'NONE'.",
    },
    photoAlt: { control: 'text' },
    verifie: {
      control: 'boolean',
      description:
        "Pastille noire de vérification, à droite des étoiles. Relevé du 2026-09-03 sur le set 031 : le calque `verification` est MASQUÉ sur le maître (2700:26539) ET sur les cinq instances des quatre vues. Il n'est donc jamais dessiné aujourd'hui — la présence devient une option gouvernée par défaut à faux plutôt qu'un calque caché (§VIII : jamais un calque masqué en dur).",
    },
    lienAvis: {
      control: 'text',
      description:
        "Adresse de l'avis Google d'origine, ouverte par le bouton « Lire la suite ». PAR AVIS : elle entre par la collection de la section, jamais par un réglage global. Vide, le bouton ne navigue pas.",
    },
  },
  args: {
    auteur: 'Prénom N.',
    initiale: 'P',
    date: 'il y a 2 mois',
    texte: 'Un témoignage neutre, exemple générique de contenu.',
    avatar: 'Initiale',
    note: '5',
    photoUrl: '',
    photoAlt: '',
    verifie: false,
    lienAvis: '',
  },
} satisfies Meta<typeof ReviewCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Initiale: Story = {
  args: { avatar: 'Initiale' },
};

export const Photo: Story = {
  args: { avatar: 'Photo' },
};
/** Every legal combination the contract defines (avatar × note). */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(5, max-content)',
        alignItems: 'center',
        justifyItems: 'start',
      }}
    >
      <ReviewCard
        avatar="Initiale"
        note="1"
        auteur="Prénom N."
        texte="Un témoignage neutre, exemple générique de contenu."
      />
      <ReviewCard
        avatar="Initiale"
        note="2"
        auteur="Prénom N."
        texte="Un témoignage neutre, exemple générique de contenu."
      />
      <ReviewCard
        avatar="Initiale"
        note="3"
        auteur="Prénom N."
        texte="Un témoignage neutre, exemple générique de contenu."
      />
      <ReviewCard
        avatar="Initiale"
        note="4"
        auteur="Prénom N."
        texte="Un témoignage neutre, exemple générique de contenu."
      />
      <ReviewCard
        avatar="Initiale"
        note="5"
        auteur="Prénom N."
        texte="Un témoignage neutre, exemple générique de contenu."
      />
      <ReviewCard
        avatar="Photo"
        note="1"
        auteur="Prénom N."
        texte="Un témoignage neutre, exemple générique de contenu."
      />
      <ReviewCard
        avatar="Photo"
        note="2"
        auteur="Prénom N."
        texte="Un témoignage neutre, exemple générique de contenu."
      />
      <ReviewCard
        avatar="Photo"
        note="3"
        auteur="Prénom N."
        texte="Un témoignage neutre, exemple générique de contenu."
      />
      <ReviewCard
        avatar="Photo"
        note="4"
        auteur="Prénom N."
        texte="Un témoignage neutre, exemple générique de contenu."
      />
      <ReviewCard
        avatar="Photo"
        note="5"
        auteur="Prénom N."
        texte="Un témoignage neutre, exemple générique de contenu."
      />
    </div>
  ),
};
