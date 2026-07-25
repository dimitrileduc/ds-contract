# Audit — Section Hero (T075)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — `findAll` par nom `Hero` sur la page `Pages`
(`210:325`), puis inspection récursive **par position** de chaque occurrence, de ses
sous-calques texte (contenu + plages de style + `charCodeAt` pour les caractères
invisibles) et de son Bouton imbriqué. Lecture seule.
**Dépendance DAG** : Section-header (T064) — satisfaite : la rangée titre/sous-titre du
Hero est structurellement une accroche+titre, mais **le Hero n'imbrique pas d'instance
Section-header** (structure propre, mesurée) ; la dépendance est de séquencement, pas de
composition. Le Bouton, lui, est bien une instance gouvernée (voir ci-dessous).

## Usage — localisation par position (les 9 maquettes)

**8 occurrences** trouvées (exactement — `findAll` name==='Hero' && type==='FRAME' → 8),
une par maquette **sauf Accueil**. Toutes en `copie-brute`, top-level = `FRAME` déjà
propre (jamais un `GROUP`), 1728×640, **hauteur externe FIXE** (`layoutSizingVertical:
FIXED`) sur les 8.

| Maquette | nodeId source | wrapper (h) | titre | sous-titre (largeur) | Bouton (glyphe) | gap |
|---|---|---|---|---|---|---|
| Contactez-nous | `274:2468` | 292 | 1 ligne | 2 lignes (1284) | Contactez-nous (chevron) | 16 |
| À Propos | `258:1891` | 292 | 1 ligne | 2 lignes (1302) | En savoir plus (chevron) | 16 |
| Dépannage/SAV | `249:1514` | 280 | 1 ligne | 1 ligne (1239) | Demander de l’aide (flèche) | 32 |
| Portes d'entrée | `237:973` | 280 | 1 ligne | 1 ligne (1164) | Demander un devis gratuit (flèche) | 32 |
| Motorisation | `237:709` | 280 | 1 ligne | 1 ligne (1164) | Demander un devis gratuit (flèche) | 32 |
| **Portes de garage industrielles** (ancre) | `387:724` | 292 | 1 ligne | 2 lignes (1164) | Demander un devis gratuit (flèche) | 32 |
| Portes de garage résidentielles | `230:380` | 292 | 1 ligne | 2 lignes (1164) | Demander un devis gratuit (flèche) | 32 |
| Portes de garage | `226:116` | **360** | **2 lignes** (U+2028) | 2 lignes (1302) | En savoir plus (chevron) | 16 |

**Hors périmètre — `Hero video` (`210:330`, Accueil, dans `Hero et catégories`)** :
`FRAME` 1728×**720** (pas 640), structure **différente** (enfants directs `Text` +
`Bouton`, sans le nesting `wrapper/Titres` des 8 autres). Ce **n'est pas** une 9e
occurrence de Hero — confirmé par `findAll` (8 `Hero`, 1 `Hero video` distinct). Non
touché, vérifié intact après adoption (FRAME 1728×720, negative-control composant).

## Structure (identique sur les 8)

```
Hero (FRAME 1728×640, HORIZONTAL, counterAlign=MAX → wrapper collé en bas ;
      fills = 1 image de fond + 2 GRADIENT_LINEAR de lisibilité)
 └ wrapper / Text (FRAME, VERTICAL, HUG vertical, FILL horizontal, gap 16, pad 0)
    └ Titres (FRAME, VERTICAL, HUG, FILL, pad 89/96/89/48, fill dégradé)
       ├ titre (TEXT, largeur 1550 FILL, textAutoResize HEIGHT, 54px/lh68,
       │        gras riche par plage Bold/Light/Regular, fill color/blanc)
       └ wrapper (FRAME rangée, HORIZONTAL, FILL, gap 16 ou 32, primAlign CENTER,
                  counterAlign MAX)
          ├ sous-titre (TEXT, **FILL**, textAutoResize HEIGHT, 24px/lh32, gras riche)
          └ Bouton (INSTANCE de 6:135 « Outline blanc », HUG, gouvernée)
```

Nomenclature **incohérente à la source** (constatée, non corrigée) : le wrapper interne
s'appelle `wrapper` sur Contactez-nous, `Text` sur les 7 autres. Sans conséquence (le
master unifie).

## Le point critique — pourquoi **aucun reflow**, contrairement à Texte SEO

La leçon Texte SEO (un master cloné d'UNE occurrence hérite une largeur qui ne
correspond à aucune autre → un mot change de ligne) a été traitée **par mesure de
TOUTES les occurrences avant construction** :

1. **Le titre** est à **largeur 1550 sur les 8** (structurellement invariant : Titres
   fait 1728 avec 89px de padding de chaque côté → 1550, identique partout). Aucun
   risque de reflow sur le titre.
2. **Le sous-titre** est en `FILL` : sa largeur = `1550 − gap − largeurBouton`. Elle
   **se recalcule par instance** (contrairement au `p` de Texte SEO, à largeur
   effectivement figée). Donc si `gap` et le libellé du Bouton (⇒ sa largeur au HUG)
   sont posés correctement par page, le sous-titre reprend **exactement** sa largeur
   source, sans largeur bakée.

**Variations réelles mesurées, par page** (ce que l'adoption doit porter) :
- **image de fond** : 8 hash distincts (vraies photos par page).
- **titre** + **sous-titre** : contenu propre à chaque page, gras riche par plage.
- **libellé du Bouton** : 5 libellés distincts.
- **glyphe droit du Bouton** : `chevron-down` (`226:373`, 3 pages) / `arrow-right`
  (`6:104`, 5 pages).
- **gap de la rangée sous-titre** : 16 (3 pages) / 32 (5 pages) — **corrélé
  parfaitement au glyphe** (chevron⇒16, flèche⇒32).
- **caractères invisibles** : `U+2028` dans le titre de Portes de garage (force la 2e
  ligne, h136), `U+00A0` en tête du sous-titre Motorisation, `U+00A0` en fin du
  sous-titre résidentielles. Préservés par lecture `.characters` **en direct** de chaque
  copie (jamais re-tapés).

La **hauteur externe du Hero est fixe (640) sur les 8** → le parent auto-layout voit un
enfant à hauteur constante, **les voisins ne bougent jamais** à l'adoption. La hauteur
du bloc texte (280–360) est portée par le HUG interne (titre 1 ou 2 lignes + rangée
sous-titre), jamais bakée.

## Correction d'une prémisse du brief (nommée, pas silencieuse)

Le brief annonçait « un Bouton visible que les 8 autres n'ont pas » pour `Hero video`.
**Mesure live : les 8 Hero ont bien, chacun, un Bouton CTA visible** (`6:135` « Outline
blanc »). La différence réelle de `Hero video` est structurelle (720px, enfants directs
`Text`+`Bouton`, pas de nesting `Titres`), pas l'absence de bouton. Le master modélise
donc le Bouton comme part à part entière.

## Zéro dépendance tierce

Toutes les instances imbriquées vérifiées `getMainComponentAsync().remote === false` :
Bouton (`6:135`), arrow-left (`6:99`), arrow-right (`6:104`), chevron-down (`226:373`).
Aucune bibliothèque externe.

## Construction — le master livré

`DS · Molécules` → section **Hero** (`2111:3374`, à `0,8872`) → `COMPONENT` **Hero**
(`2111:3382`, à `40,8932`, 1728×640), construit par `clone()` de l'occurrence **Portes
de garage industrielles** (`387:724`) puis `figma.createComponentFromNode()` :
conversion en place, **zéro reconstruction manuelle** → l'image, les 2 dégradés, le
Bouton gouverné imbriqué, le gras riche du titre/sous-titre survivent par construction.

**Pourquoi industrielles comme ancre** : gap 32 (majorité 5/8), sous-titre 2 lignes riche
(exerce toute l'anatomie), **aucun caractère invisible dans son propre contenu** (défaut
propre), et son adoption = swap sans override (0 entrée de ledger).

**Décision — aucune propriété TEXTE formelle sur le titre/sous-titre.** Les deux portent
du gras riche par plage (jusqu'à 6 segments) ; lier une propriété TEXTE
(`componentPropertyReferences`) **aplatit** le style mixte sur le master lui-même (trappe
documentée Formulaire T092 / Présentation T072 / Texte SEO T082). Contenu porté par
**override direct de sous-calque** (`setCharacters` + `setRangeFontName` par plage,
persistant, re-vérifié par plage après écriture). Le Bouton garde ses propriétés
gouvernées (Libellé / Glyphe droite / Icônes), overridées par instance. Description de
master non vide posée.

## Pièges Figma — vérifiés sur scratch AVANT tout geste réel

1. **`itemSpacing` overridable sur un sous-cadre d'instance — OUI** (scratch : gap
   32→16 tenu, l'enfant FILL a grandi de +16 exactement). C'est le mécanisme qui
   reproduit la largeur du sous-titre par page. **Nouvelle sortie positive** (cousine
   inverse du piège « `resize()` sur enfant d'instance ignoré ») : le mode de layout
   d'un sous-cadre EST modifiable en override, la géométrie directe non.
2. **Le Bouton re-hugge sur `setProperties(Libellé)` — OUI**, mais il faut rejouer
   **tous** les props (dont `Icône droite=true`) sinon la largeur est fausse d'~30px (le
   glyphe droit + son gap). Les props source complets sont rejoués par instance.
   **Correction (trouvé après coup par revue Fable, pas anticipé ici)** : ce même rejeu
   **réinitialise aussi une couleur héritée** sur le vecteur du glyphe swappé (blanc →
   couleur native sombre du glyphe) — régression réelle sur les 8 instances, corrigée en
   re-lianant `color/blanc` sur le vecteur **APRÈS** le rejeu de props, jamais avant (voir
   `decisions.md`, entrée de correction 2026-07-24). À vérifier systématiquement pour
   tout futur composant qui rejoue des props sur un enfant swappé porteur d'un override
   de couleur.
3. **Parents = tous des FRAMEs en auto-layout VERTICAL** → adoption par
   `insertChild(0, instance)`, **zéro coordonnée manuelle, zéro `resize()`, zéro
   restructuration** — les trappes « resize silencieux » et « déplacement dans une
   instance refusé » sont contournées d'emblée.
4. **`customizations.js` a 2 angles morts** (précédent FAQ T084) : il ne descend pas
   dans le Bouton imbriqué (rate libellé + glyphe) et ne suit pas `itemSpacing` (rate le
   gap). Le ledger a donc été **relevé par lecture directe en direct** des 8 copies
   AVANT remplacement (superset de `customizations.js`), pas depuis la sortie de l'outil.

## Récapitulatif

| Élément | Détail |
|---|---|
| Master | `Hero` (`2111:3382`), COMPONENT, 1728×640 hauteur externe fixe (défaut = industrielles) |
| Section | `Hero` (`2111:3374`), `DS · Molécules`, à `0,8872` (contenu `40,8932`) |
| Propriétés formelles | aucune sur le wrapper (contenu par override) ; le Bouton expose Libellé/Glyphe droite/Icônes (gouverné) |
| Dépendances | Bouton `6:135`, glyphes `6:99`/`6:104`/`226:373` — tous locaux, **zéro tierce** |
| Checkpoint | `003/hero/master` (versionId `2379887695720285832`) |
