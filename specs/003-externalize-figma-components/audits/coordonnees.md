# Audit — Section Coordonnées (T093)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — bloc désigné par id (`274:2869`), audit
structure complète (arbre récursif, styles, `fills`/`boundVariables`, texte par plage
via `getStyledTextSegments` + `charCodeAt` caractère par caractère) et usage par
position (parent direct relu, pas supposé).

## Usage — localisation (1 des 9 maquettes)

**1 seule occurrence** : `Contactez-nous`, nœud `274:2869`, nommé `Coordonnées`
(`FRAME`, 1728×597). Parent direct : `Contactez-nous` (`274:2464`, `FRAME`,
`layoutMode: VERTICAL`) — **pas un `GROUP`**, contrairement à plusieurs blocs
précédents (Carousel-controls, Copyright, Section-header/Avis Google) : l'adoption
n'aura pas le risque d'origine-instable déjà documenté pour les `GROUP`. Position dans
le flux : entre l'instance `Formulaire` (déjà adoptée, T091-T092) et le `GROUP`
`Avis Google` (bloqué, report-bloc Review-card).

## Prémisse de `tasks.md` invalidée (déjà signalée en amont, confirmée ici en direct)

`tasks.md` (T093) indique *« exige Contact-info-row (Avantage) T062 adopté + icônes
sociales »*. La structure réelle relue nœud par nœud **n'utilise pas Avantage** —
c'est une liste simple à 5 blocs sous `wrapper`, aucun ne correspond à l'anatomie
d'Avantage (icône-marque + titre + texte gras). Seule la dépendance aux icônes
sociales (T037) est réelle, confirmée ci-dessous.

## Structure réelle (`FRAME` racine, layout `GRID` 2 colonnes)

```
Coordonnées (FRAME 1728×597, fill color/bleu-clair VariableID:5:63, layoutMode GRID)
├── google-map (RECTANGLE 1152×597, x=0)      — colonne gauche
└── wrapper (FRAME 576×589, x=1152, VERTICAL, padding 48/48/48/48, gap 16)
    ├── Titres (FRAME 480×83, gap 8)
    │   ├── "Contact" (eyebrow, TEXT)
    │   └── "Nos coordonnées" (titre, TEXT)
    ├── Adresse (FRAME 480×92, gap 8) — label "Adresse" + valeur (2 lignes)
    ├── Horaires (FRAME 480×92, gap 8) — label "Horaires" + valeur (2 lignes)
    ├── Contact (FRAME 480×92, gap 8) — label "Contact" + valeur (2 lignes)
    └── Suivez-nous (FRAME 480×70, gap 8) — label + "Frame 8" (2 icônes)
```

Fond de la frame racine (`color/bleu-clair`, `VariableID:5:63`, `#F4F6FA`) — déjà une
variable, zéro couleur brute. Aucun `GROUP` nulle part dans le sous-arbre : le nœud
racine est déjà une `FRAME` propre, contrairement à Formulaire — pas de nettoyage
structurel GROUP→FRAME à faire ici, le clonage direct suffit.

**`layoutMode: GRID` à la racine, précédent déjà posé** : même mécanisme natif Figma
que le `grid` de Réalisations (`decisions.md`, 2026-07-24, « Réalisations utilise un
`GRID` natif non contractable ») — non supporté par `contract-schema.ts` ni
`emit-figma-script.ts`, sans conséquence ici puisque cette spec est un nettoyage
Figma pur (`spec.md` § Out of Scope). **Différence importante avec Réalisations** :
ici la grille a 2 enfants FIXES (jamais de tuile insérée dynamiquement), donc aucun
risque d'auto-flow à l'insertion (le piège trouvé sur Gallery-item ne s'applique pas
— je ne fais qu'un clone verbatim des 2 enfants déjà correctement ancrés, jamais une
insertion dans une grille partagée). Décision : **conserver `GRID` tel quel** via
clonage de la frame entière plutôt que de re-belle-modéliser en `HORIZONTAL` — risque
minimal, fidélité maximale.

## 2 découvertes de caractères invisibles (au-delà de celle déjà signalée)

Le brief transmis signalait un `\r` caché dans le texte Contact. L'audit direct
(`charCodeAt` sur la totalité de chaque texte, pas seulement la zone signalée) trouve
**2 occurrences**, une non anticipée :

1. **Adresse, valeur** (`280:3812`, *« Rue Alfred Drèze 7, 4860 Pepinster »*) —
   **non anticipée**. Entre la virgule et « 4860 », le caractère n'est **pas** une
   espace ASCII (0x20) mais **`U+2028`** (LINE SEPARATOR) seul — aucune espace
   ordinaire à cet endroit (`charCodeAt` : `...44(",") 8232(U+2028) 52("4")...`,
   zéro `32` entre les deux). Force un retour à la ligne manuel : « Rue Alfred Drèze
   7, » / « 4860 Pepinster » sur 2 lignes (hauteur 54px = 2×27px lineHeight,
   confirmée). Le texte est de plus **entièrement souligné** (`textDecoration:
   UNDERLINE` sur tout le segment) **sans hyperlink attaché**
   (`getStyledTextSegments({... 'hyperlink'})` renvoie `hyperlink: null`) — un style
   visuel de lien sans lien réel, reproduit fidèlement tel quel (pas une correction à
   faire, juste une fidélité à préserver).
2. **Contact, valeur** (`280:3806`, *« Tél : +32 (0)87 46 32 66 Email:
   info@piqueray.be »*) — **celle déjà signalée dans le brief, confirmée et
   précisée**. Entre « 66 » et « Email », la séquence exacte est **`\r`
   (U+000D) immédiatement suivi de `U+2028`** — les deux caractères, aucune espace
   ASCII entre eux (`charCodeAt` : `...54("6") 13(\r) 8232(U+2028) 69("E")...`).
   **Signature identique** au piège déjà documenté sur `Col 4 Contact` de
   Footer-column (`decisions.md`, 2026-07-24 : *« le vrai saut est `\r` suivi de
   `U+2028` — les deux ensemble »*) — même contenu (adresse/horaires/contact),
   dupliqué entre le Footer et Coordonnées, même trappe. Texte à 4 plages de style
   (`segments`) : `"Tél : "` (plate) + `"+32 (0)87 46 32 66\r"` (SOULIGNÉ, le `\r`
   inclus dans la plage soulignée) + `"[U+2028]Email: "` (plate) + `"info@piqueray.be"`
   (SOULIGNÉ) — texte **à styles mixtes**, pas uniforme.

**Traitement retenu** : construction par **clonage direct du nœud live**
(`node.clone()` puis `figma.createComponentFromNode()`), jamais de retype manuel —
élimine tout risque de mal-saisir ces caractères invisibles (la même discipline que
Formulaire, motivée justement par cette classe de bug).

## Icônes « Suivez-nous » — la source exacte des masters T037, pas une copie parente

`Frame 8` (`280:3799`) contient `Group 7`/`Group 6`, chacun un unique `VECTOR` —
**`280:3801`** (Facebook) et **`280:3803`** (Instagram). ID pour ID, ce sont
**exactement** les vecteurs source cités dans la décision T037 (*« clonées... depuis
les vecteurs source `280:3801`/`280:3803` »*) : Coordonnées est le lieu d'origine
d'où les masters `Facebook` (`2053:1259`, 32×31.857) et `Instagram` (`2053:1261`,
32×32) ont été clonés — confirmé aussi par tailles identiques au pixel et par le fill
déjà lié à `color/noir-bleute` (`VariableID:5:40`) sur les deux vecteurs (même
variable que les masters, vérifié). C'est l'une des « 10 occurrences sociales brutes »
nommées comme restant à adopter (`decisions.md`, clôture lot 2 : *« seront adoptées
via Footer-column/Coordonnées »*) — Footer-column a explicitement exclu sa propre
colonne « Col 5 réseaux sociaux » de son périmètre, donc Coordonnées est bien un
des points d'adoption réels, pas un doublon.

**Traitement** : remplacer `Group 7`/`Group 6` (vecteurs bruts) par des **instances**
de `Facebook`/`Instagram` dans le master — tailles identiques (32×31.857 / 32×32),
aucun `resize()` requis, aucun risque du piège `INSTANCE_SWAP` déjà documenté (ce
sont des instances directes, pas un enfant imbriqué derrière un slot).

## google-map — déjà vérifié propre, confirmé indépendamment

`RECTANGLE` (`274:2873`, 1152×597), fill unique `type: IMAGE`
(`imageHash efdebf1941d13dbd5a2ab421aaeac49d352a87b2`, `scaleMode FILL`), **zéro
`strokes`, zéro `effects`, zéro `boundVariables` au-delà du fill image lui-même** —
confirme indépendamment la prémisse du brief (FR-019 respecté). Référencé tel quel
dans le master, aucun geste requis dessus au-delà du clonage normal.

## Grille d'audit texte appliquée (héritée des molécules précédentes)

`fontName`/`fontSize`/`lineHeight`/`letterSpacing`/`textCase`/`textAlignHorizontal`/
`paragraphSpacing`/`textDecoration`/`fills`(bindings)/`effects` vérifiés sur les 8
textes du bloc — échelle typographique **cohérente avec toutes les molécules
précédentes de cette spec**, mêmes tokens :

| Texte | Taille | Détail | Couleur |
|---|---|---|---|
| Accroche « Contact » | 20px Regular | UPPER, `letterSpacing` 15%, `lineHeight` 25 | `color/noir-bleute` (`VariableID:5:40`) |
| Titre « Nos coordonnées » | 40px Regular | ORIGINAL, `lineHeight` 50 | `color/noir-bleute` |
| Labels (Adresse/Horaires/Contact/Suivez-nous) | 24px Regular | ORIGINAL, HUG width | **`color/orange`** (`VariableID:4:28`) |
| Valeurs (Adresse/Horaires/Contact) | 18px Regular | `lineHeight` 27, `paragraphSpacing` 8, FILL width 480 | `color/noir-bleute` |

Aucun gras trouvé (`segCount` uniforme sauf Contact-valeur, dont les 4 plages sont
toutes `Regular` — seule la décoration `UNDERLINE` varie, pas la graisse). Aucune
ombre (`effects: []` partout). Alignement `LEFT`/`TOP` partout, pas de `CENTER`
inattendu.

## Décision — propriétés officielles limitées à Accroche/Titre (motivée)

**2 propriétés TEXTE** : `Accroche` (eyebrow « Contact ») et `Titre` (« Nos
coordonnées ») — même paire que Devis/Formulaire/Section-header, texte à style
**uniforme** (1 seule plage chacun), donc **zéro risque** du piège déjà rencontré sur
Formulaire (`componentPropertyReferences` aplatit un style mixte au binding, y
compris sur le master lui-même).

**Adresse/Horaires/Contact (labels + valeurs) et le label Suivez-nous restent du
texte statique, non lié en propriété officielle** — décision délibérée, pas un
oubli :
1. Bloc à **occurrence unique** (1 seule maquette, jamais réutilisé) — aucun besoin
   démontré de paramétrer un contenu qui n'existera jamais qu'une fois, même logique
   que Gallery-item/Carousel-controls (zéro propriété TEXTE, contenu structurellement
   fixe) plutôt que Field/Avantage/Footer-column (contenu réellement répété avec des
   valeurs différentes par occurrence).
2. **2 des 3 valeurs portent des caractères invisibles réels** (`U+2028` sur Adresse,
   `\r`+`U+2028` sur Contact) et **Contact a des styles mixtes par plage**
   (soulignement partiel) — exactement la combinaison qui a coûté 4 cycles
   d'investigation sur le `Consentement` de Formulaire. Le clonage direct (sans
   binding) préserve ces caractères et styles **byte-exact automatiquement**, sans
   passer par le chemin de code qui les a fait sauter une fois déjà cette spec.
3. Cohérent avec la préférence déjà actée cette session : ne pas empiler du
   paramétrage sans un besoin mesuré (même réflexe que les refus space/radius et
   orange-12/42 côté tokens).

## Récapitulatif du master

| Élément | Détail |
|---|---|
| Nom | `Coordonnées` (nom réel du layer source, pas de renommage) |
| Type | `COMPONENT` (converti en place depuis un clone de `274:2869`, `figma.createComponentFromNode()`) |
| Propriétés | `Accroche` (TEXTE, défaut « Contact »), `Titre` (TEXTE, défaut « Nos coordonnées ») |
| Structure | `GRID` 2 colonnes : `google-map` (image, FILL) + `wrapper` (VERTICAL, padding 48, gap 16, 5 blocs) |
| Dépendances | `Facebook` (`2053:1259`) + `Instagram` (`2053:1261`), instances remplaçant les 2 vecteurs bruts — toutes deux locales (`remote: false`) ; fill `google-map` = image déjà présente dans le fichier, zéro nouvel asset |
| Page | `DS · Molécules`, nouvelle section `Coordonnées` |
| Zéro dépendance tierce | confirmé — `google-map` est une image statique (pas d'instance), les 2 icônes deviennent des instances locales |

## Preuve — voir `proofs/coordonnees/` et `decisions.md` pour le verdict pixel chiffré

Construction et adoption exécutées après cet audit ; le verdict et les chiffres
définitifs sont documentés dans `proofs/coordonnees/{verdict.json,verdict.md}` et
l'entrée `decisions.md` correspondante (jamais dupliqués ici pour éviter une source de
vérité divergente).
