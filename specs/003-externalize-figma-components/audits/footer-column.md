# Audit — Molécule Footer-column (T057)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — recherche par nom (`Col`), scope confirmé
par le scan T0 déjà figé dans `dag.md` : « footer-column : 3 colonnes (Col 2/3/4) ×
9 pages = 27 ». Col 1 (logo + bouton « Contactez-nous ») et Col 5 (« Suivez-nous » +
icônes sociales) sont **hors périmètre** — déjà tranché avant cette session, aucune
ambiguïté à re-décider.
**Inspiration structurelle (recherche legacy déléguée à un agent en arrière-plan)** :
`list.contract.json`/`list-item.contract.json` pour la collection, mais chaque lien
individuel suit plutôt `side-nav-item`/`top-nav-item` (élément `<a>`, a un `href` —
`list-item` n'en a pas). Non directement applicable ici : Col 2/3/4 ne sont pas des
listes de liens, plutôt titre+texte (Contact a 2 liens INLINE dans le texte, pas une
liste).

## Usage — localisation (9 des 9 maquettes)

**27 occurrences, les 9 maquettes** : chaque page a le même footer, 3 colonnes
`Col 2` (Adresse), `Col 3` (Horaires), `Col 4` (Contact) — contenu **strictement
identique sur les 9 pages** (vérifié, pas supposé).

## Structure

| Partie | Détail |
|---|---|
| Racine `Col N` (source) | `GROUP` (pas de layoutMode) — reconstruit en `FRAME` `VERTICAL` pour le master |
| `Titre` | Montserrat Regular 24, `lineHeight` PIXELS 30, couleur orange (`VariableID:4:28`, même orange que Member-card/Poste) |
| `Texte` | Montserrat Regular 18, `lineHeight` PIXELS 27, `paragraphSpacing` 8, couleur **blanc littéral non lié** (`{r:1,g:1,b:1}`, pas de variable) |
| Gap titre↔texte | 16px |
| Largeur | **FIXED 310** (pas FILL — piège trouvé, voir ci-dessous) |

## Piège trouvé — `FILL` vs `FIXED` change le point de retour à la ligne

Premier réflexe : `layoutSizingHorizontal: FILL` sur le texte (cohérent avec Carte).
Largeur finale identique (310px) dans les deux cas, mais **le point de wrap
diffère** — un texte `FILL` et un texte `FIXED` à la même largeur ne cassent pas au
même endroit chez Figma. Trouvé en comparant les hauteurs réelles (Horaires : 54px
chez moi contre 127px source, soit 2 lignes contre 3). Fix : `FIXED` + `resize(310,
h)` explicite, comme la source.

## Piège trouvé — sauts de ligne manuels invisibles au `JSON.stringify`

Deux colonnes ont des **sauts de ligne manuels explicites**, pas du wrap naturel :
- `Adresse` : `"Rue Alfred Drèze 7, " + U+2028 + "4860 Pepinster"`
- `Horaires` : `"Du lundi au vendredi " + U+2028 + "de 8h00 à 12h00 et " + U+2028 + "de 13h30 à 17h00"`
- `Contact` : `"Tél : +32 (0)87 46 32 66" + \r + U+2028 + " Email: info@piqueray.be"`

`JSON.stringify` affiche `U+2028` comme un espace visuellement indiscernable d'un
vrai espace — la chaîne "vendredi␣␣de" ressemble à un double-espace alors que c'est
"vendredi" + espace + **U+2028** + "de". Repéré uniquement en lisant les
`charCodeAt()` un par un. Pour `Contact`, le saut réel est **`\r` suivi de `U+2028`**
— les deux caractères ensemble, pas l'un ou l'autre seul (une première correction
avec `\r` seul a laissé le mauvais point de wrap).

## Piège trouvé (récurrent) — `GROUP` sans origine stable

Comme Carousel-controls : `Col N` vit dans un `GROUP` « Row » avec `Col 1` et `Col 5`
en siblings. Remplacer Col 2/3/4 sans précaution aurait fait glisser Col 1/Col 5.
Fix appliqué **dès la construction du pilote** (pas découvert après coup cette
fois) : lecture des positions cibles des 5 colonnes AVANT toute suppression, puis
correction en un seul passage lecture-tout/écriture-tout après le remplacement —
`maxErr: 0` en 1 seule passe sur les 9 pages, aucune oscillation.

## Texte riche — soulignement partiel

`Adresse` : soulignement complet. `Horaires` : aucun. `Contact` : seuls le numéro de
téléphone et l'email sont soulignés (pas les labels « Tél : » / « Email: »),
reproduit avec `setRangeTextDecoration` par plage précise — même discipline que le
gras de Carte (`setProperties` sur une prop TEXT aplatit tout, réappliquer après).

## Récapitulatif du master

| Élément | Détail |
|---|---|
| Nom | `Footer-column` |
| Variants | aucun — même structure pour les 3 contenus, différenciés par le contenu texte |
| Propriétés | `Titre` (TEXTE), `Texte` (TEXTE, largeur FIXED 310) |
| Page | `DS · Molécules` |
| nodeId | `2079:2246` |

**Preuve** : pixel-diff sur la maquette pilote (`Contactez-nous`) — résidu final
1524px/(1728×3901)=0,023% après les 3 corrections (soulignement, sauts de ligne,
FILL→FIXED), bruit habituel. 8 pages restantes : positions vérifiées `maxErr: 0`
(convergence exacte, pas juste proche), contenu vérifié identique aux 3 recettes
avant remplacement, spot-check visuel sur `Motorisation` (capture du groupe `Footer`
complet, tous les soulignements/sauts de ligne visuellement corrects) — pas de
preuve pixel avant/après formelle sur ces 8, même limite documentée que Carte/
Product-card.
