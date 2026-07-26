# Gestes du lot L1 — Identifiants (US1, T019-T022)

Transcription verbatim du script exécuté via `figma_execute`, avant exécution
(`contracts/proof-cycle.md` §2, étape 5). Toutes les valeurs viennent de
`naming-table.md`, croisées avec une lecture live des nodeIds exacts (structures
`piqueray_logo`, `Accordion-row`, `Formulaire`, `SAV`, `Réassurances`, `Catégories
principales`, `Réalisations` — voir `decisions.md` T018 pour le détail des 9 dernières).

**Correction actée avant exécution (R11)** : `Bouton` (6:122) est déjà PascalCase-clean
— **son NOM ne change pas**. La précaution "renommer Bouton en dernier" de R11
(tasks.md/research.md) supposait un renommage de nom qui ne se produit pas ; seules ses
propriétés (Libellé, Icône gauche, Icône droite) sont touchées, ce qui ne casse pas le
lookup nominal `KNOWN_MASTERS=['Bouton',…]` de `bridge/scan.js`. Noté en `decisions.md`,
pas silencieusement corrigé.

**Formulaire — choix de sur-désambiguïsation délibéré** : plutôt que de tenter de
reproduire exactement quels Field/Bouton l'extracteur a historiquement flaggés (5-6 sur
7 Field + 1 sur 3 Bouton, mécanisme de collision pas entièrement re-dérivable avec
certitude depuis les notes seules), **les 7 instances Field et les 3 instances Bouton
sont toutes renommées distinctement** — un sur-ensemble strictement plus sûr que le
minimum requis, vérifié sans coût supplémentaire par le re-relevé T025.

## 1 · Renommages de set + description accentuée (36) — FR-001/FR-006a

Format : `nodeId : ancien → nouveau` ; description existante préfixée de
`« Anciennement nommé « {ancien} » sur le canvas. »`.

**DS · Atomes (19)**
```
2053:1263  Étoile                    → Etoile
274:2934   piqueray                  → Piqueray
263:2125   mail                      → Mail
263:2120   phone                     → Phone
230:599    download                  → Download
230:585    pdf                       → Pdf
95:252     search                    → Search
95:216     user                      → User
27:86      chevron-right             → ChevronRight
27:83      chevron-left              → ChevronLeft
226:373    chevron-down              → ChevronDown
226:374    chevron-up                → ChevronUp
27:70      cart                      → Cart
6:104      arrow-right               → ArrowRight
6:99       arrow-left                → ArrowLeft
9:185      external-link             → ExternalLink
6:119      octicon:chevron-down-12   → OcticonChevronDown12
4:14       piqueray_logo             → PiquerayLogo
274:2389   member-picture            → MemberPicture
```

**DS · Molécules (8)**
```
2059:1417  Accordion-row             → AccordionRow
2068:1972  Product-card              → ProductCard
2074:2072  Member-card               → MemberCard
2077:2191  Carousel-controls         → CarouselControls
2079:2246  Footer-column             → FooterColumn
2090:2397  Section-header            → SectionHeader
2095:2484  Réalisation               → Realisation
2152:5554  Nav-item                  → NavItem
```

**DS · Organisms (9)**
```
2103:2824  Présentation              → Presentation
2104:2904  Coordonnées               → Coordonnees
2108:3123  Texte SEO                 → TexteSEO
2114:3721  Réassurances              → Reassurances
2115:3947  Équipe                    → Equipe
2115:4277  Catégories principales    → CategoriesPrincipales
2116:4475  Produits e-commerce       → ProduitsECommerce
2117:4691  Réalisations              → Realisations
2151:5552  Hero vidéo                → HeroVideo
```

## 2 · Renommages de propriété (10) — FR-002, classe C

Format : `nodeId(set) : clé exacte → nouveau nom`.

```
6:122(Bouton)           "Icône gauche#2024:0"  → Icone gauche
6:122(Bouton)           "Icône droite#2024:7"  → Icone droite
6:122(Bouton)           "Libellé#2044:28"      → Libelle
2053:1256(Checkbox)     "Coché"                → Coche
274:2389(member-picture)"État"                 → Etat
2061:1588(Tab)          "Libellé#2061:23"      → Libelle
2061:1588(Tab)          "État"                 → Etat
2056:1278(Field)        "État"                 → Etat
2059:1417(Accordion-row)"État"                 → Etat
2117:4691(Réalisations) "En-tête"              → En-tete
```

## 3 · Renommages de valeur de variant, chaîne complète (19 nœuds) — FR-003/FR-003a

```
274:2388   État=Défaut                          → Etat=Defaut
274:2390   État=Survol                           → Etat=Survol
2059:1373  Taille=Grand, État=Fermé              → Taille=Grand, Etat=Ferme
2059:1383  Taille=Petit, État=Fermé              → Taille=Petit, Etat=Ferme
2059:1405  Taille=Grand, État=Ouvert             → Taille=Grand, Etat=Ouvert
2059:1411  Taille=Petit, État=Ouvert             → Taille=Petit, Etat=Ouvert
2061:1584  État=Défaut                           → Etat=Defaut
2061:1586  État=Sélectionné                      → Etat=Selectionne
2056:1265  État=Normal                           → Etat=Normal
2056:1271  État=Erreur                           → Etat=Erreur
2053:1253  Coché=Non                             → Coche=Non
2053:1254  Coché=Oui                             → Coche=Oui
2063:1606  Disposition=Réassurance               → Disposition=Reassurance
2063:1611  Disposition=Catégorie                 → Disposition=Categorie
2114:3653  Disposition=4 cartes · 2 CTA          → Disposition=QuatreCartesDeuxCta
2115:4275  Disposition=Pleine largeur · 3 cartes → Disposition=PleineLargeurTroisCartes
2115:4276  Disposition=Pleine largeur · RDV      → Disposition=PleineLargeurRdv
2116:4672  En-tête=Accroche                      → Etat-tete=Accroche  [SIC — voir correction ci-dessous]
2117:4690  En-tête=Présentation                  → En-tete=Presentation
```

**Correction avant exécution** : la ligne `2116:4672` ci-dessus contient une coquille de
rédaction (« Etat-tete » au lieu de « En-tete ») — corrigée dans le script exécuté à
`En-tete=Accroche`. Signalée ici pour que la transcription reste honnête sur le brouillon
réel, pas récrite a posteriori.

## 4 · Résolution des 22 collisions de part + sur-désambiguïsation Formulaire (classe D)

```
4:3, 4:16                 (piqueray_logo, tracé de marque ×2 variantes) → Marque
2059:1407, 2059:1413      (Accordion-row, Titre dans les 2 variantes Ouvert) → TitreOuvert
2115:4164                 (Catégories principales, item 1 Bloc texte) → Item1BlocTexte
2115:4169                 (Catégories principales, item 2 Décor) → Item2Decor
2115:4170                 (Catégories principales, item 2 wrapper) → Item2Wrapper
2115:4171                 (Catégories principales, item 2 inner) → Item2Inner
2115:4172                 (Catégories principales, item 2 Bloc texte) → Item2BlocTexte
2115:4175                 (Catégories principales, item 2 arrow-right) → Item2ArrowRight
2116:4661                 (Réalisations, instance Section-header réelle) → SectionHeaderAccroche
2104:2884                 (Coordonnées, étiquette Adresse) → AdresseEtiquette
2104:2887                 (Coordonnées, étiquette Horaires) → HorairesEtiquette
2104:2890                 (Coordonnées, étiquette Contact) → ContactEtiquette
2104:2893                 (Coordonnées, étiquette Suivez-nous) → SuivezNousEtiquette
2108:3100                 (SAV, background du wrapper) → WrapperBackground
2108:3097                 (SAV, background du img-group) → ImgGroupBackground
2114:3652                 (Réassurances, 2e CTA) → BoutonSecondaire
2096:2551                 (Formulaire, row1 field A) → FormRow1FieldA
2096:2552                 (Formulaire, row1 field B) → FormRow1FieldB
2096:2554                 (Formulaire, row2 field A) → FormRow2FieldA
2096:2555                 (Formulaire, row2 field B) → FormRow2FieldB
2096:2557                 (Formulaire, row3 field) → FormRow3Field
2096:2559                 (Formulaire, row4 field/Select) → FormRow4Field
2096:2561                 (Formulaire, row5 field/Textarea) → FormRow5Field
2096:2547                 (Formulaire, bouton argumentaire A) → FormArgumentBoutonA
2096:2548                 (Formulaire, bouton argumentaire B) → FormArgumentBoutonB
2096:2563                 (Formulaire, bouton d'envoi) → FormulaireBouton
```

## 5 · Renommages de calque FR-005 (26 restants, 4 déjà couverts en §4)

```
2053:1246  Input     Texte de saisie → Valeur
2053:1248  Textarea  Texte de saisie → Valeur
2053:1250  Select    Texte de saisie → Valeur
6:95       Bouton    Contactez-nous  → Libellé
6:125      Bouton    Contactez-nous  → Libellé
6:131      Bouton    Contactez-nous  → Libellé
6:137      Bouton    Contactez-nous  → Libellé
9:208      Bouton    Contactez-nous  → Libellé
28:116     Bouton    Contactez-nous  → Libellé
2056:1268  Field     (optionnel)     → MentionOptionnelle
2056:1274  Field     (optionnel)     → MentionOptionnelle
2096:2562  Formulaire  En cliquant sur «Envoyer»…            → TexteConsentement
2103:2821  Présentation  Depuis plus de 50 ans…              → Texte
2104:2885  Coordonnées  Rue Alfred Drèze 7…                  → AdresseValeur
2104:2888  Coordonnées  Du lundi au vendredi…                → HorairesValeur
2108:3116  Texte SEO  Rien ne vaut le toucher…                → Paragraphe
2108:3118  Texte SEO  Infos pratiques                        → SousTitre
2115:4165  Catégories principales  Portes de garage résidentielles → Titre
2115:4166  Catégories principales  Sectionnelles, basculantes…     → Texte
2115:4173  Catégories principales  Portes de garage industrielles  → Titre
2115:4174  Catégories principales  Solutions robustes…             → Texte
2115:4249  Catégories principales  Maintenance                     → Titre
2115:4250  Catégories principales  Mieux vaut prévenir…            → Texte
2117:4679  Réalisations  Personnalisez votre porte industrielle…  → Texte
2120:4773  Footer    Suivez-nous     → TitreReseaux
210:333    Hero vidéo  Le numéro 1 des portes HÖRMANN…            → Accroche
```

## Diff annoncé (avant toute écriture)

**0 pixel.** Aucune des 145 opérations ci-dessus ne modifie une valeur de rendu (couleur,
taille, position, police, texte affiché) — uniquement des noms de calque, de propriété,
de valeur de variant, et un préfixe ajouté à des champs `description` (jamais rendus sur
le canvas). Attendu : **43/43 identical** après exécution.
