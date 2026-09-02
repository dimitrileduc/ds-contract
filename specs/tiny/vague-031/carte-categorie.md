# CarteCategorie — molécule 031 portée vers Odoo (2026-09-02)

**Contrat** : `contracts/carte-categorie.contract.json` 1.1.0 → **2.0.0** (ancres = set 031 `2692:19667`, clé `eb623f48…`).
**Bloc Odoo** : gabarits `carte_categorie_superpose` / `carte_categorie` dans `s_pqr_categories_principales`.
**Page de mesure** : `/categories-test` sur `piqueray-odoo-pilote` (8087).

## Deux sets existaient — le contrat pointait le mauvais

| | ancien `2495:6770` (DS · Molécules) | nouveau `2692:19667` (031) |
|---|---|---|
| variantes | Superpose, **Style3**, Empile | Superpose |
| propriétés | Titre, Texte, Style | Style (au départ) |
| utilisé par la section 031 | non | **oui** |

## Trois écritures Figma, chacune décrite puis validée par l'owner

1. **Style3 supprimée** (ancien set) : doublon exact de Superpose — même arbre, mêmes textes, mêmes tailles —
   sans aucune instance. C'était la cause de l'écart de parité `CarteCategorie.Style` ouvert depuis le matin.
   Version nommée avant, garde-fou « refus si instance vivante ».
2. **Propriétés TEXT `Titre` et `Texte` posées** sur le set 031 : sans elles, personne ne peut changer le titre
   d'une carte depuis le panneau Figma, et le contrat ne peut pas lier ses textes. Mots et boîte inchangés
   (743×418, vérifié avant/après).
3. Aucune autre. Le décor masqué (voir plus bas) a été traité **par le contrat**, pas par la source.

## Ce que le contrat 2.0.0 porte

- **Photo** : le set range les pixels dans le paint IMAGE de la racine ; le contrat la porte en part `img`
  (route A5) désormais **en absolu** couvrant la carte — la hauteur appartient à la section (418 / 288 / 288 / 418).
  Rapport 16/9 gardé en défaut sur la racine, largeur minimale 320 mintée (`size.carte-categorie.min-w`).
- **Voile** : sur le set 031 le dégradé est le cadre `wrapper` et couvre **toute** la carte, plus seulement le bas.
  Seize arrêts relevés verbatim (transparent jusqu'à 36 %, jusqu'à 0,82 en bas) → registre des littéraux nommés,
  reçu `carte-categorie-031-voile`. Padding horizontal = `{spacing.card-categorie.pad-h}` (24 mobile, 32 au-dessus).
- **Titre** : style responsive « Titre carte » → `typography.h3.*` (20/25 SemiBold → 32/40 Medium), capitales.
- **Description** : style « Description carte » → `typography.card-desc.*` (16/24 → 18/27), Regular.
  *Le style Figma porte déjà ces variables mais **pas son marqueur de token** : l'extraction ne peut pas le proposer,
  la liaison est faite à la main vers le token existant. À corriger à la source.*
- **Décor** : dessiné sur la carte, **masqué sur les deux instances de la section** (surcharge d'instance brute).
  Porté en option gouvernée `afficherDecor` (défaut vrai, liaison NONE — le set n'expose pas de propriété booléenne),
  la section passe faux. Le décor a dû descendre **sous le voile** : le schéma refuse deux conditions de présence
  sur une même part, et le voile porte déjà celle du style. Boîte inchangée (haut 32, droite 32).
- **Empile** : conservé tel quel sur décision owner (d'autres pages l'utiliseront), bien que le set 031 ne le dessine
  plus. L'axe VARIANT ne déclare donc qu'une valeur côté canvas : écart de parité **acquitté** dans `parity/baseline.json`.
- **Défauts de texte** adoptés depuis le set 031 (« Portes de garage », « Une porte de garage pour… »).

## Mesure

Carte 1 découpée dans la planche `CategoriesPrincipales-1728` et dans la capture Odoo, même boîte 743×418 :
**1,13 %**. Sondes de position identiques au canvas — titre à 32/311 sur 40 de haut, description à 32/359 sur 27,
flèche 35×35, décor 100×131. Résidu mesuré : la description est **1 px plus bas** que Figma (arrondi de boîte de
ligne, confirmé par balayage ±3 px : l'écart minimal est à −1) et le lissage du texte.

Aux trois autres largeurs la carte prend la boîte que lui donne la section, **pas encore responsive** :
320×180 à 390 et 834 (au lieu de 342×418 et 738×288), 479×269 à 1200 (au lieu de 512×288). À 834 le contenu
déborde même par le haut. **Rien de tout cela n'appartient à la carte** : c'est le travail de la section, à faire ensuite.

## À corriger à la source (Figma)
- Style « Description carte » : poser son marqueur de token (`typography.card-desc.size`), comme « Titre carte ».
- Décor masqué par surcharge d'instance : à remplacer par une propriété booléenne du set, ou à retirer du master.
- Le set 031 ne dessine plus `Empile` : décider s'il revient dans le set ou reste une forme d'archive.

## Fichiers touchés
`contracts/carte-categorie.contract.json` · `contracts/named-literals.registry.json` · `tokens/primitives.tokens.json`
(+`size.carte-categorie.min-w`) · `integrations/odoo/config/{categories.authoring.json, figma-panels.json, inputs.lock.json}` ·
`addons/piqueray_ds/views/components.xml` (décor conditionnel + déplacé, cartes de la section à `afficherDecor` faux) ·
`parity/{baseline.json, snapshots/figma-components.json}` · `integrations/odoo/authoring/pages/categories-test.json` ·
outils `.page-parity/{capture-categories.mts, probe-carte.mts, decoupe.mjs}` · re-pins golden / verrou / reçu du plugin.

---

# CategoriesPrincipales — section 031 (même soirée)

**Contrat** : `contracts/categories-principales.contract.json` 1.0.0 → **2.0.0** (ancres = set 031 `2693:20242`).

**Rupture majeure assumée** : les réglages `style` et `colonnes` sont **retirés**. Le set 031 ne déclare que
l'axe Presentation, ses huit cartes sont toutes superposées, et le colonnage est décidé par l'écran. Conséquences
propagées : le réglage « Colonnes » disparaît du panneau Odoo (gabarit d'options + action JS), le rendu serveur
pose désormais le gabarit **superposé**, et l'attribut `data-pqr-colonnes` disparaît du bloc.

**Ce que le set dessine, et que le contrat porte** :

| | Mobile | Tablette | Desktop | Wide |
|---|---|---|---|---|
| disposition | colonne | colonne | ligne | ligne |
| écart | 16 | 64 | 64 | 64 |
| marges | 24 | 48 | 56 | 89 |
| carte | 342×418 | 738×288 | 512×288 | 743×418 |

La grille tombe juste au pixel : 390−48=342 · 834−96=738 · 1200−112−64=1024 (512 chacune) ·
1728−178−64=1486 (743 chacune).

**Code-only, nommé** (une part instance ne porte ni base de flex ni canal par mode) : le partage égal de la ligne
(`flex: 1 1 0`) et les deux hauteurs imposées par la section, mintées from-dump
(`size.categories-principales.carte-h.{mobile,tablette}` = 418 / 288). En Desktop et Wide la hauteur découle du
rapport 16/9 de la carte elle-même : rien à écrire.

**Composition** : `s_pqr_bleed` sur la section (elle porte ses propres marges 24/48/56/89 ; sans le bleed la
gouttière de page s'ajoutait et la section tombait à 212 px de large à 390).

## Mesure bloc contre planche (`.page-parity/categories-mesure/`)

| largeur | hauteur | diff | cause du résidu |
|---|---|---|---|
| 390 | 852 = 852 | **2,33 %** | cadrage des deux photos (transformation Figma) + lissage du texte |
| 834 | 640 = 640 | **1,64 %** | idem |
| 1200 | 288 = 288 | **2,94 %** | idem |
| 1728 | 418 = 418 | **0,93 %** | idem |

Boîtes sondées identiques au canvas aux quatre largeurs : carte 342×418, 738×288, 512×288, 743×418.

## À corriger à la source (Figma) — s'ajoute à la liste de la carte
- Rien pour la section : le set 031 est propre (un seul axe, quatre variantes, huit cartes cohérentes).

## Fichiers touchés (section)
`contracts/categories-principales.contract.json` · `tokens/primitives.tokens.json` (+2) ·
`integrations/odoo/config/{categories.authoring.json, figma-panels.json, inputs.lock.json}` ·
`addons/piqueray_ds/{__manifest__.py, views/components.xml, static/src/css/responsive/categories-principales.pqr.css,
static/src/xml/authoring.xml, static/src/js/{authoring.js, version_guard.js}}` · `scripts/odoo/scan-saved-versions.ts` ·
`evals/fixtures/odoo-production/version-drift/cases.json` · `authoring/pages/{home.json, categories-test.json}`.

---

## Addenda du 2026-09-02 (fin de soirée)

- **Outil image natif ouvert** sur les photos de carte (catégorie et réassurance), comme sur SAV :
  attribut `data-pqr-native-image` sur l'`img`, verdict `directly-editable` média. Le rédacteur reprend
  recadrage, position et filtres — la voie par laquelle les cadrages Figma non exprimables en CSS se
  rattrapent à la main.
