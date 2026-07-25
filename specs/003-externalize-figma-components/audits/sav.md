# Audit — Section SAV (T073)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — bloc désigné par id (`210:369`), audit
structure complète (arbre récursif, `fills`/`boundVariables`, texte par plage via
`getStyledTextSegments` + `charCodeAt` caractère par caractère) et usage par position
sur les 9 maquettes (jamais par confiance dans le nom seul).

## Usage — 1 occurrence, confirmée par TROIS mesures indépendantes (pas seulement le nom)

**1 seule occurrence** : `Accueil`, nœud `210:369`, nommé `SAV` (`FRAME`, 1552×677,
absX 389 / absY 1672). Le brief l'annonçait ; l'audit le confirme **par structure et
par position, pas par le nom** — précaution d'autant plus nécessaire que le fichier
contient une maquette entière dédiée nommée `Dépannage/SAV` :

1. **Nom** : un seul nœud de type `FRAME` nommé exactement `SAV` sur les 9 maquettes.
2. **Bande de taille** : recherche de tout `FRAME`/`GROUP` dans `[1500-1600] × [600-760]`
   sur les 9 maquettes → 8 résultats, dont **6 sont des sections `Réassurances`** (bloc
   distinct déjà gouverné, y≈1944-3525) et les 2 restants sont `210:369` (`SAV`) +
   son enfant `210:370` (`section`) sur Accueil. **Zéro bloc SAV-like ailleurs.**
3. **Empreinte image** : l'illustration du bloc (`img` `210:375`, `imageHash
   429c615cb090b3aa0800188acda4bc59cc6445b0`) est utilisée **nulle part ailleurs dans
   tout le fichier** — un seul hit, `210:375` lui-même.

**Faux positifs écartés nommément** (recherche par sous-chaîne « sav »/« dépannage ») :
le lien de navigation `Dépannage/SAV` (`I…;84:295`, un `TEXT` 145×16 présent sur
**chaque** maquette — enfant du `Header nav` déjà composant, hors périmètre) ; des nœuds
texte dont le contenu contient « dépannage » (corps de `Contactez-nous`, `Portes de
garage`) ou « savoir » (`Tout savoir sur votre installation`) ; et le titre interne
`Dépannage / SAV` du bloc lui-même (`210:379`). La **maquette** `Dépannage/SAV`
(`249:1510`) porte un hero **différent** (« Besoin d'un dépannage ? », `249:1518`), pas
cette carte — vérifié, pas supposé.

## Structure réelle — le cas le plus profond de la spec (3 niveaux de GROUP imbriqués)

```
SAV (FRAME 1552×677, HORIZONTAL, largeur FIXE 1552 / hauteur HUG, itemSpacing 10, counterAxisAlign CENTER)
└── section (GROUP 1552×677)
    ├── background (RECTANGLE 1552×475) — fond IMAGE (imageHash 3e173874…, bandeau toiture/maisons)
    └── row (GROUP 1288×561)
        ├── img-group (GROUP 647×561)
        │   ├── background (RECTANGLE 647×478) — SOLID, bindé color/bleu-clair (VariableID:5:63)
        │   └── img (RECTANGLE 563×504) — fond IMAGE (imageHash 429c615c…, technicien), scaleMode FIT
        └── wrapper (GROUP 641×561)
            ├── background (RECTANGLE 641×561) — SOLID, bindé color/blanc (VariableID:4:29)
            └── inner (FRAME 546×365, VERTICAL auto-layout)
                ├── [Titre] "Dépannage / SAV" (TEXT)
                ├── [Texte] corps (TEXT, 324 car.)
                └── Bouton (INSTANCE — Bouton déjà gouverné)
```

Le brief annonçait « trivial : Bouton + image ». La structure réelle est plus riche
(3 GROUP imbriqués sous une FRAME racine), mais reste **composable proprement** : le
seul enfant réellement variable est `inner` (titre + texte + Bouton), le reste est de la
mise en page. Les 2 fonds SOLID sont **déjà bindés à des variables** (zéro couleur
brute) ; les 2 fonds IMAGE sont des `imageHash` déjà présents dans le fichier (aucun
nouvel asset, zéro dépendance tierce au sens FR-019 — ce sont des remplissages image, pas
des instances de bibliothèque externe).

### Décision de nettoyage structurel — clonage VERBATIM, groupes internes conservés

La règle `CLAUDE.md` (« si l'élément source brut est un GROUP, la version adoptée doit
être une FRAME ») a pour **condition** que l'élément source soit un GROUP. Ici l'élément
source (`210:369 SAV`) est **déjà une FRAME** — la version adoptée (un `COMPONENT`, donc
frame-like) satisfait la règle au niveau du bloc. Les `section`/`row`/`img-group`/
`wrapper` internes sont des GROUP de mise en page.

**Retenu : clonage verbatim (`node.clone()` puis `figma.createComponentFromNode()`),
groupes internes conservés tels quels** — même arbitrage que Coordonnées (« conserver
tel quel, risque minimal, fidélité maximale »), pour trois raisons :
1. Re-modéliser des GROUP imbriqués en FRAME imposerait de **repositionner des enfants**
   — exactement le geste qui déclenche le piège d'origine-instable des GROUP
   (recalcul dynamique de l'origine depuis le contenu, sur 3 niveaux ici) et risque la
   dérive pixel que cette spec interdit.
2. Le clonage verbatim déplace **uniquement le nœud top-level** ; aucune position
   d'enfant interne n'est touchée → le piège GROUP ne se déclenche jamais.
3. Le corps de texte porte des styles mixtes + un saut de ligne manuel (voir plus bas) —
   le clonage direct les préserve byte-exact, contrairement à toute reconstruction.

Validation **par revue de structure** (pas par pixel, conforme à la règle) : le
top-level adopté est un `COMPONENT` (frame-like), pas un GROUP ; les 12 nœuds descendants
ont été re-vérifiés valeur par valeur contre la source après clonage (§ Fidélité).

## Texte — titre uniforme (liable), corps riche (gardé statique)

- **Titre** `Dépannage / SAV` (`210:379`) : **1 seule plage** de style — Montserrat
  Regular 40, `lineHeight` 50px, `letterSpacing` 0%, `textCase` ORIGINAL, couleur bindée
  `color/noir-bleute` (`VariableID:5:40`), align LEFT/TOP, `textAutoResize` HEIGHT. Style
  **uniforme** → liable en propriété TEXTE **sans risque** du piège d'aplatissement
  (vérifié avant/après liaison : `flattened: false`).
- **Corps** (`210:380`, 324 car.) : **7 plages**, dont **3 en gras** (Montserrat Bold)
  aux positions `33-52` (« votre installation »), `101-122` (« votre porte de garage »),
  `252-299` (« votre distributeur Hörmann en province de Liège »). Size 18, `lineHeight`
  27, `paragraphSpacing` 8, couleur bindée `color/noir` (`VariableID:24:52`) sur toutes
  les plages. **Saut de ligne manuel** (`\n`, U+000A) à l'index 225 — vérifié par
  `charCodeAt`. Les autres caractères non-ASCII sont des accents/`'`/**NBSP** (U+00A0)
  normaux, pas de trappe type `U+2028`/`\r` (contrairement à Coordonnées/Footer-column).

**Décision — corps gardé STATIQUE, non lié en propriété** (même arbitrage que
Coordonnées pour ses valeurs riches) : (1) bloc à **occurrence unique**, aucun besoin de
paramétrer un corps qui n'existera qu'une fois ; (2) styles mixtes (3 plages gras) — les
lier aplatirait le gras (piège documenté Présentation T072/Formulaire T092), coût
inutile ici ; (3) cohérent avec la préférence owner « pas de paramétrage sans besoin
mesuré ». Seul le **Titre** (uniforme) devient une propriété officielle — le master reste
genuinement gouverné (une affordance officielle) sans exposer le chemin de code qui a
déjà fait sauter du gras cette spec.

## Bouton — instance déjà gouvernée, locale, reproduite verbatim

`Bouton` (`210:381`) est une `INSTANCE` du set local `Bouton` (`6:122`,
`getMainComponentAsync().remote === false` — zéro dépendance tierce). État de l'instance
(préservé automatiquement par le clonage, revérifié) : `Libellé` = « Demander de l'aide »,
`Icône gauche` = `false` (flèche gauche masquée), `Icône droite` = `true` (flèche droite
visible), `Property 1` = Default. Aucun geste requis dessus au-delà du clonage.

## Récapitulatif du master

| Élément | Détail |
|---|---|
| Nom | `SAV` (nom réel du layer source, pas de renommage) |
| Type | `COMPONENT` (converti en place depuis un clone de `210:369`, `figma.createComponentFromNode()`) |
| nodeId | `COMPONENT` `2108:3105` ; section `2108:3091` ; propriété `Titre#2108:60` |
| Propriétés | `Titre` (TEXTE, défaut « Dépannage / SAV ») — corps + Bouton restent portés par la structure |
| Structure | verbatim : `section` GROUP → `background` (image) + `row` → [`img-group`, `wrapper` → `inner`] |
| Dépendances | Bouton `6:122` (instance locale, `remote:false`) ; 2 fonds image bakés (illustration + bandeau) ; 2 fonds SOLID bindés (5:63, 4:29) |
| Page | `DS · Molécules`, nouvelle section `SAV` à (0, 8035), contenu à (40, 8095) — marge 40/60, position précalculée |
| Zéro dépendance tierce | confirmé — `remote:false` sur le Bouton, aucun asset nouveau |

## Fidélité — clone vérifié byte-exact contre la source (12 points)

Après clonage, chaque nœud clé a été relu et comparé à la valeur source enregistrée :
`img` hash `429c615c` ✓, `background` section hash `3e173874` ✓, `img-group` bg bindé
`5:63` ✓, `wrapper` bg bindé `4:29` ✓, corps 324 car. / 3 plages gras aux mêmes indices /
bindé `24:52` / `\n` à 225 ✓, Bouton instance `6:122` `remote:false` / Libellé / icônes ✓.
Revue visuelle du master (capture du COMPONENT, pas de la SECTION) : les 3 plages gras
rendent, le saut de paragraphe rend, la flèche droite seule, l'illustration et le bandeau
fidèles.

## Preuve — voir `proofs/sav/` et `decisions.md` pour le verdict pixel chiffré

Construction et adoption (T074) exécutées après cet audit ; le verdict et les chiffres
définitifs sont dans `proofs/sav/{verdict.json,verdict.md,README.md}` et l'entrée
`decisions.md` correspondante (jamais dupliqués ici pour éviter une source de vérité
divergente).
