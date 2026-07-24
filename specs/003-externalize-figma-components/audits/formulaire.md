# Audit — Section Formulaire (T091)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — bloc désigné par id (`274:2670`), audit
structure complète (arbre récursif, styles, `componentProperties`, texte par plage) et
usage par position (scan des 9 maquettes pour tout nœud nommé `formulaire`/`form`,
jamais par confiance dans le nom seul).

## Usage — localisation (1 des 9 maquettes)

**1 seule occurrence** : `Contactez-nous`, nœud `274:2670`, nommé `Formulaire`
(`GROUP`, `childCount: 1`, enfant unique `row` `274:2874`). Scan défensif des 9
maquettes pour tout nœud `formulaire`/`form` : **zéro autre correspondance** que
`274:2670` lui-même et son propre descendant `274:3682` (`form`, la colonne droite du
même bloc) — confirmé structurellement, pas seulement par le compte d'inventaire.
Recoupement indépendant : les 7 instances du master **Field** (T039-T040) sont
**toutes** consommées par ce seul bloc (Prénom/Nom/Email/Téléphone/Adresse/Sujet/
Message) — Field n'a aucun autre consommateur dans le fichier, ce qui confirme
l'unicité de l'occurrence par une deuxième voie.

## Structure réelle (2 colonnes, `GROUP > row > {column, form}`)

Le `GROUP` porte un unique enfant `row` (`FRAME`, `HORIZONTAL`, `itemSpacing: 32`,
1550×723, `fills: []`) — **c'est cette frame, pas le GROUP, qui porte toute la
disposition réelle**. Ses deux enfants ont chacun un rôle propre :

| Colonne | Contenu | Largeur |
|---|---|---|
| `column` (gauche) | `titles` (2 textes) + `features` (4× **Avantage**, déjà gouverné T061-T062) + `buttons` (2× **Bouton** existant) | FILL (759px) |
| `form` (droite) | 6× `row` (7× **Field**, déjà gouverné T039-T040) + texte de consentement + 1× **Bouton** existant | FILL (759px) |

Toutes les frames intermédiaires (`row`, `column`, `titles`, `features`, `buttons`,
les `row` internes au formulaire) sont des **wrappers de pure disposition** —
`fills: []`, `strokes: []`, `effects: []` sur toutes sauf une exception notable
ci-dessous. Même traitement que `tabs`/`row`(Field)/`accordion` : aucun master séparé
ne leur correspond, ils sont reconstruits tels quels dans le master Formulaire.

**Exception** : `form` (la colonne droite) a une identité visuelle réelle — fond
`color/bleu-clair` (`VariableID:5:63`, `#F4F6FA`, déjà une variable, zéro couleur
brute) et padding 32px sur les 4 côtés. Reproduit fidèlement sur le master.

## Trouvaille — la tâche source suppose une Checkbox qui n'existe pas

`tasks.md` (T091) indique *« exige Field T040 adopté + Checkbox T035 validé + Bouton »*.
L'arbre complet de `form` (274:3682), relu nœud par nœud jusqu'à sa feuille, ne
contient **aucune trace de Checkbox** — après le dernier `Field` (Message), les deux
seuls enfants restants sont un `TEXT` («&nbsp;En cliquant sur «Envoyer», je confirme
avoir lu et accepté la politique de confidentialité.&nbsp;») et le `Bouton` Envoyer.
Aucun calque cousin caché, aucune instance de Checkbox nulle part dans le sous-arbre.

Ce constat **corrobore** l'audit T031 (`audits/atomes-formulaire.md`), qui notait déjà
*« consentement RGPD en simple texte »* comme fait mesuré — ce n'est pas une découverte
nouvelle, c'est la confirmation, au moment de construire Formulaire, que l'hypothèse de
`tasks.md` (écrite avant l'audit détaillé) ne correspond pas à la source réelle. Le
texte est d'ailleurs rédigé comme un consentement **implicite par action**
(« *En cliquant sur* Envoyer, je confirme... ») — un choix UX cohérent et volontaire,
pas une case à cocher qui aurait été mal capturée : rien à « réparer ».

**Décision (même famille que la correction Contact-info-row/Avantage, T061)** :
construire le master **fidèle à la source, sans Checkbox**. Introduire une Checkbox
ici serait un changement de comportement (consentement implicite → explicite), pas un
nettoyage structurel — hors périmètre de cette spec (« nettoyage Figma pur »,
`spec.md`). Le master **Checkbox** (T035) reste construit et validé comme atome ; il
n'a simplement aucun consommateur dans ce fichier à ce jour.

## Trouvaille majeure — lien hypertexte vers un domaine tiers (probable résidu de template)

Le texte de consentement porte un **vrai hyperlink Figma** sur le segment souligné
« la politique de confidentialité » :

```
https://www.jonckers-clabots.be/politique-de-confidentialite/
```

« Jonckers-Clabots » n'est pas Piqueray — tout porte à croire qu'il s'agit d'un
résidu d'un template ou d'un projet antérieur (un autre poseur de portes de garage,
au vu du nom) recopié puis rebrandé en Piqueray sans que ce lien précis soit repris.
Vérifié directement via `getRangeHyperlink` sur la plage exacte du segment souligné —
pas une supposition depuis le rendu visuel.

**Traitement** : reproduit **fidèlement** sur le master (le périmètre de cette spec
est un nettoyage structurel, pas une correction de contenu métier — mêmes limites déjà
posées pour le `GRID` de Réalisations) — jamais corrigé silencieusement (FR-010).
Signalé à trois endroits pour qu'il ne se perde pas : la description du composant
Figma lui-même, cette note d'audit, et une entrée `decisions.md` dédiée. Recommandé
comme point de vigilance content/legal pour l'owner — hors du pouvoir de décision de
cet agent de deviner la bonne URL de remplacement.

## Grille d'audit texte appliquée (héritée des molécules précédentes)

`fontName`/`fontSize`/`lineHeight`/`letterSpacing`/`textCase`/`textAlignHorizontal`/
`paragraphSpacing`/`textDecoration` par plage/`fills` (bindings)/`effects`/`.visible`
— tout vérifié avant construction, pas après un diff :

- **Accroche** (« Une demande de devis ? Une réparation ? ») : 20px Regular,
  `letterSpacing` 15%, `textCase: UPPER`, `lineHeight` 25px, **`color/noir-bleute`**
  (`VariableID:5:40` — correction : cette note appelait initialement cette variable
  `color/noir` par erreur, jamais vérifiée par nom à ce moment-là ; son vrai nom
  résolu programmatiquement en T092, voir § Bugs trouvés à l'adoption), aligné
  **GAUCHE**. Cohérent avec l'usage déjà établi de `color/noir-bleute` pour le
  gabarit 18-40px (`decisions.md`, anomalie « texte de saisie formulaire »).
- **Titre** (« Prenez contact avec nous dès maintenant ! ») : 40px Regular,
  `lineHeight` 50px, `color/noir-bleute` (même correction), aligné **GAUCHE**.
- **Consentement** : 14px Regular, `lineHeight` 24px, aligné gauche, **couleur
  mixte réelle, jamais uniforme** — vérifiée par plage complète, pas au seul
  caractère 0 (l'erreur commise initialement, voir § Bugs trouvés à l'adoption) :
  texte courant en **`#000000` brut, non bindé** (fidèle à la source, laissé tel
  quel — ne PAS le lier à `color/noir`, une correction tentée puis annulée en T092
  car elle introduisait un vrai écart pixel non justifié par la mesure) ; span
  « la politique de confidentialité » **souligné** + hyperlink (ci-dessus) **ET
  bindé à `color/orange`** (`VariableID:4:28`, #F98A0B — le même token que le CTA
  du Bouton) — confirmé par échantillonnage direct des pixels de la capture source
  (23 pixels exactement `rgb(249,138,11)`), pas supposé depuis le rendu visuel.
- **3 Boutons** — tous des instances réelles du master **Bouton** existant
  (`componentSetId 6:122`), rien de neuf à construire :
  - « Appeler pour une urgence » : variant **`Default`** (`6:107`, plein), icône
    gauche `phone` visible, icône droite masquée.
  - « Voir la FAQ » : variant `Outilne noir` (`28:114`), icône gauche masquée, icône
    droite `arrow-right` visible.
  - « Envoyer » : variant `Outilne noir` (`28:114`, **pas** `Default`, vérifié
    programmatiquement — un bouton de soumission en style contour, pas plein), icône
    gauche `arrow-left` masquée, icône droite `arrow-right` visible.
- **`.visible`** vérifié sur toutes les icônes des 3 Boutons dès l'audit (leçon
  Product-card/Carousel-controls appliquée d'emblée) : cohérent avec les
  `componentProperties` mesurées (booléens `Icône gauche`/`Icône droite`).
- **7 Field** : `componentProperties` mesurées une à une — `Label`, `Optionnel`
  (`true` uniquement sur Téléphone), `Saisie` (instance-swap : Input `2053:1245`
  ×5, Select `2053:1249` ×1, Textarea `2053:1247` ×1), `État` **`Normal`** sur les 7
  (aucun état Erreur dans cette maquette statique — cohérent avec l'absence de preuve
  source déjà notée pour l'état Erreur de Field lui-même).

## « titles » ressemble à Section-header, mais n'en est pas une instance

Même échelle typographique que **Section-header** (déjà adopté, T063-T064) — Accroche
20px/15%/UPPER, Titre 40px, `itemSpacing` 8 — mais **alignement différent** :
Section-header « Standard » est **centré** (`counterAxisAlignItems: CENTER`,
disposition pleine-largeur de section) ; `titles` ici est **aligné à gauche**
(`counterAxisAlignItems: MIN`), imbriqué dans une colonne de 759px aux côtés
d'Avantage×4 et de 2 Boutons — un contenu de vente compact, pas un en-tête de section
pleine largeur. Contexte et alignement différents : traité comme contenu **propre** au
master Formulaire (2 propriétés TEXTE dédiées), pas comme une instance de
Section-header réutilisée pour un autre usage. Décision documentée ici plutôt que
silencieuse ; réversible plus tard si un besoin de fusion apparaît (aucune perte : rien
n'empêche une extraction future d'un composant `Heading` partagé).

## Récapitulatif du master

| Élément | Détail |
|---|---|
| Nom | `Formulaire` |
| Type | `COMPONENT` (cloné directement depuis la frame `row` `274:2874`, PAS depuis le `GROUP` parent — élimine l'origine instable du `GROUP` par construction, sans geste de nettoyage séparé) |
| Propriétés | `Accroche` (TEXTE), `Titre` (TEXTE), `Consentement` (TEXTE) |
| Structure | 2 colonnes `HORIZONTAL` (gap 32) : gauche = titres + 4× Avantage + 2× Bouton ; droite = fond `color/bleu-clair` + padding 32 + 7× Field + consentement + 1× Bouton |
| Dépendances | Avantage (T061-T062, ×4), Field (T039-T040, ×7), Bouton existant (×3) — toutes locales, `remote: false` vérifié programmatiquement sur chaque instance |
| Page | `DS · Molécules`, section `Formulaire` |
| nodeId | `COMPONENT` `2096:2564` ; section `2096:2565` |
| Zéro dépendance tierce | confirmé — 32 instances descendantes vérifiées une à une, `remote: false` partout |

**Construction** : clone de la frame `row` (274:2874, pas le GROUP) → reparenté sur
`DS · Molécules` → `figma.createComponentFromNode()` → 3 `componentProperty` TEXTE
ajoutées et liées aux calques texte correspondants → description non vide (inclut le
signalement du lien tiers) → capture de validation (écran conforme à la source, cf.
session).

**Anomalies à trancher par l'owner (nommées, pas corrigées silencieusement)** :
1. Lien hypertexte du consentement pointant vers `jonckers-clabots.be` (contenu/legal,
   hors périmètre de cette spec) — reproduit fidèlement en attendant. **Owner a
   répondu** (relayé par l'agent principal) : corriger plus tard, pas dans cette
   adoption.
2. Écart de prémisse `tasks.md` : pas de Checkbox dans la source — corrigé en
   construction, documenté ici et au journal.

## Post-scriptum (T092) — 2 vrais bugs trouvés en 2 passes, corrigés avant verdict final

Le tout premier `pages:compare` de l'adoption (`diffCount=1810`) a mené, après
inspection zoomée du triptyque (jamais accepté sur un chiffre agrégé seul), à un
**premier vrai bug** : lier `Consentement` comme propriété TEXTE officielle
(`component.addComponentProperty` + `componentPropertyReferences`) a **aplati le
style mixte** du texte — le segment « la politique de confidentialité » a perdu son
soulignement ET son hyperlink, rendu en un style uniforme.

**Nouvelle famille de piège, nommée pour la suite** : `componentPropertyReferences`
sur le champ `characters` d'un calque texte aplatit ses styles mixtes — même famille
que `instance.setProperties()` sur une prop TEXT (déjà connu, Carte/Footer-column),
mais déclenché ici par le **binding de propriété sur le master lui-même**, pas par un
override d'instance — et il touche le master, pas seulement l'instance qui en hérite.
`Accroche` et `Titre` ont subi le même binding sans dégât visible car ils n'avaient
aucun style mixte à perdre — seul `Consentement` en avait un (le lien).
**Règle généralisable** : avant de lier une propriété TEXTE officielle sur un calque,
vérifier s'il porte un style mixte par plage (couleur/gras/soulignement/hyperlink) ;
si oui, réappliquer les plages non-défaut APRÈS le binding — ne jamais supposer que le
binding préserve le style comme `clone()` le fait.

Soulignement + hyperlink réappliqués (`setRangeTextDecoration`/`setRangeHyperlink`) →
`pages:compare` repasse (`diffCount=1726`, à peine meilleur) → triptyque **encore**
zoomé plutôt qu'accepté sur la baisse marginale : **second vrai bug**, plus subtil —
la couleur du segment « la politique de confidentialité » elle-même était fausse
(noir plat au lieu d'orange). Crop serré + échantillonnage direct des pixels du PNG
source (avant toute mutation) : **23 pixels exactement `rgb(249,138,11)`** dans ce
segment — la valeur exacte de `color/orange` (`VariableID:4:28`), le même token que le
CTA du Bouton. Lié → `diffCount=1793` (**remonté**, pas baissé : la véritable couleur
du texte courant venait aussi d'être mal identifiée dans le même geste, voir
ci-dessous) → triptyque zoomé une 3e fois → texte courant rebindé par erreur à
`color/noir-bleute` (`VariableID:5:40` — confondu avec `color/noir` par manque de
vérification du nom réel de la variable à l'audit initial, voir correction ci-dessus
§ Grille d'audit texte) → échantillonnage pixel du PNG source sur le texte courant
(hors lien) : le noir le plus saturé mesuré (`rgb(30,31,31)`) est **plus sombre que
les deux tokens candidats** (`color/noir` ≈ 55,55,59 ; `color/noir-bleute` ≈ 38,40,44)
— cohérent avec un **noir brut `#000000` non bindé**, exactement la toute première
mesure faite sur la source pristine avant toute construction. Reverti au brut →
`diffCount=1581` (baisse franche, cohérente) → triptyque zoomé une 4e fois : plus
aucun défaut visible, résidu homogène (léger contour anti-aliasing sur tous les
caractères, même signature que le bruit déjà accepté sur Accordion-row/Carte/
Footer-column/Copyright/Contact-info-row/Section-header).

**Leçon cumulée** : une baisse de `diffCount` après un correctif ne prouve pas que le
correctif est le bon — deux des trois tentatives ci-dessus (color/orange lié = bon ;
color/noir-bleute puis color/noir sur le texte courant = mauvais, `diffCount` a
d'ailleurs augmenté une fois) ont dû être zoomées individuellement pour être jugées.
**Vérifier une couleur par échantillonnage pixel direct du PNG source AVANT de
proposer un token**, pas seulement par analogie avec un cas typographique voisin —
l'analogie « même profil que les placeholders Input/Textarea/Select, donc même
correction » était plausible mais fausse pour ce texte précis.

Corrigé sur le master (`2096:2564`/`2096:2562`) — état final : `color/orange`
(`VariableID:4:28`) + `UNDERLINE` + hyperlink sur la plage exacte du lien ; `#000000`
brut non bindé sur le reste (fidèle à la source, PAS de token — anomalie de couleur
brute laissée nommée, pas corrigée, cohérent avec le principe FR-010 de ne rien
changer sans validation owner explicite pour CE texte précis). L'instance posée
(`2096:2714`) porte la même correction (appliquée directement, pas seulement héritée
du master, par prudence après l'incident de binding). Verdict final : `1/1 diff,
diffCount=1581, diffBox={x:289,y:811,w:1231,h:574}`, soit **0,023 % de la page**
(1728×3901) — voir `decisions.md` « ecart-pixel-accepte — Formulaire (adoption,
T092) » pour les chiffres complets et l'acceptation.
