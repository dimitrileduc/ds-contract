# Responsive dans Figma Design

Ce document explique comment préparer simplement le responsive dans Figma.
Il ne traite pas du code, d’Odoo ou du contrat.

## Les trois outils à retenir

| Ce qui change | Outil Figma |
|---|---|
| Le composant garde le même design et doit seulement s’adapter à la largeur | Auto Layout |
| Les espacements, dimensions ou tailles de texte changent selon l’écran | Variables avec modes Desktop, Tablet et Mobile |
| Le design ou l’organisation change réellement | Variants Desktop, Tablet et Mobile |

Ces trois outils se complètent. Il ne faut pas choisir une seule méthode pour
tous les cas.

## 1. Auto Layout pour les cas simples

Auto Layout suffit quand le composant reste fondamentalement le même pendant
qu’on réduit sa largeur.

Exemples :

- un texte passe sur deux lignes ;
- une colonne de texte rétrécit à côté d’un bouton ;
- une image suit la largeur de sa carte ;
- des cartes ou des tags passent librement à la ligne ;
- les espacements restent identiques.

Les réglages principaux sont :

- **Fill container** : l’objet utilise l’espace disponible ;
- **Hug contents** : l’objet prend la taille de son contenu ;
- **Fixed** : la dimension reste fixe ;
- **Min/Max width** : l’objet peut varier, mais dans des limites définies ;
- **Wrap** : les objets qui ne tiennent plus passent à la ligne suivante.

### Exemple courant

Dans une ligne contenant un texte et un bouton :

- le parent est en Auto Layout horizontal ;
- le texte est en Fill ;
- le bouton est en Hug ;
- le texte se replie naturellement quand la largeur diminue ;
- le bouton conserve sa taille.

Aucun breakpoint ni variant n’est nécessaire.

### Limite de Wrap

Wrap convient aux collections souples : tags, badges, logos ou cartes dont la
dernière ligne peut être différente.

Wrap ne convient pas à une grille stricte. Des cartes en Fill se partagent
l’espace ligne par ligne : une carte seule sur la dernière ligne peut donc
devenir pleine largeur.

Si toutes les cartes doivent conserver de vraies colonnes identiques, il faut
utiliser une Grid. Si le nombre de colonnes change selon l’écran, il faut une
Grid différente dans chaque variant responsive.

## 2. Variables responsive pour les valeurs

Les variables servent lorsque le composant garde la même structure, mais que
certaines valeurs doivent changer selon le contexte.

On crée une collection appelée par exemple `Responsive` avec trois modes :

- Desktop ;
- Tablet ;
- Mobile.

Une même variable contient alors une valeur par mode.

| Variable | Desktop | Tablet | Mobile |
|---|---:|---:|---:|
| `section-padding` | 64 | 40 | 24 |
| `card-gap` | 32 | 24 | 16 |
| `heading-size` | 48 | 40 | 32 |
| `heading-line-height` | 56 | 48 | 38 |

Les variables responsive peuvent notamment piloter :

- padding ;
- gap ;
- largeur et hauteur ;
- min-width et max-width ;
- font size ;
- line height ;
- letter spacing ;
- visibilité.

### Comment les modes fonctionnent

Le mode est appliqué au frame de la page ou de la maquette.

Les éléments placés à l’intérieur héritent automatiquement du mode de leur
parent tant qu’ils restent en mode `Auto`.

Ainsi :

- le frame Desktop utilise les valeurs Desktop ;
- le frame Tablet utilise les valeurs Tablet ;
- le frame Mobile utilise les valeurs Mobile.

Une modification dans la collection met à jour tous les éléments liés.

## 3. Variants pour les changements de design

Un variant responsive est nécessaire lorsque le composant ne peut plus être
adapté uniquement en réduisant ses dimensions.

Exemples :

- une Grid passe de 4 à 2 puis 1 colonne ;
- une disposition horizontale devient verticale ;
- une navigation complète devient un menu compact ;
- une image change de place ;
- certains éléments sont retirés ou remplacés ;
- l’ordre du contenu change.

Le component set peut porter une propriété dédiée :

```text
Viewport = Desktop
Viewport = Tablet
Viewport = Mobile
```

Chaque variant contient le design adapté à ce contexte.

### Les variants peuvent avoir des éléments différents

Les variants n’ont pas besoin d’avoir exactement la même structure. Un variant
Mobile peut retirer, ajouter, déplacer ou remplacer des éléments par rapport au
Desktop.

Exemple :

```text
Hero / Desktop              Hero / Mobile
├── Titre                   ├── Logo
├── Sous-titre              ├── Titre
├── CTA                     ├── CTA
└── Vidéo                   └── Indicateur de scroll
```

Cela reste propre tant que les variants représentent des versions prévisibles
du même composant métier. Si leur rôle devient différent, il faut créer un autre
composant.

| Besoin | Outil conseillé |
|---|---|
| Composition réellement différente selon l’écran | Variant |
| Un élément simplement affiché ou masqué | Propriété booléenne |
| Un composant imbriqué doit être remplacé | Instance swap |
| Une zone accepte du contenu libre ou répétable | Slot |
| Le rôle métier change complètement | Nouveau composant |

Pour les éléments communs, conserver les mêmes noms de calques, par exemple
`Titre`, `SousTitre`, `CTA` et `Background`. Figma peut ainsi mieux préserver
les textes et autres overrides lorsqu’on change de variant. Un élément absent
d’un variant ne peut naturellement pas conserver ses overrides dans ce variant.

Pour une grille stricte, par exemple :

```text
Desktop → Grid 4 colonnes
Tablet  → Grid 2 colonnes
Mobile  → Grid 1 colonne
```

Les cartes restent en Fill dans leurs cellules. Les colonnes restent donc
cohérentes, y compris sur la dernière ligne.

## 4. Lier les modes aux variants

Le changement de variant peut être piloté par la même collection responsive.

### Mise en place

1. Créer les modes `Desktop`, `Tablet` et `Mobile` dans la collection
   `Responsive`.
2. Créer une variable string appelée par exemple `viewport`.
3. Donner à cette variable la valeur correspondant au mode :
   `Desktop`, `Tablet` ou `Mobile`.
4. Créer les trois variants du composant avec une propriété `Viewport` portant
   exactement les mêmes valeurs.
5. Sur une instance du composant, lier la propriété `Viewport` à la variable
   `Responsive/viewport`.
6. Appliquer le mode souhaité au frame parent.

Lorsque le mode du frame change :

- les espacements et la typographie liés aux variables changent ;
- l’instance sélectionne le variant correspondant ;
- les composants imbriqués héritent également du mode.

On peut ainsi présenter toute une page en Desktop, Tablet ou Mobile sans régler
manuellement chaque composant.

## 5. Responsive du texte

Il existe deux besoins différents.

### Le texte doit seulement se replier

Utiliser Auto Layout :

- largeur du texte en Fill ;
- hauteur en Hug/Auto ;
- parent flexible.

Le texte passe naturellement sur plusieurs lignes. Aucun variant n’est requis.

### La typographie doit changer

Utiliser les variables responsive pour modifier selon le mode :

- font size ;
- line height ;
- letter spacing ;
- espacements autour du texte ;
- largeur maximale éventuelle.

Un variant n’est utile que si le contenu, sa position ou sa hiérarchie change
réellement.

## 6. Ce qui est automatique dans Figma Design

Quand on redimensionne un frame, Figma Design applique automatiquement :

- Auto Layout ;
- Fill, Hug et Fixed ;
- Min/Max ;
- le reflow du texte ;
- Wrap ;
- le redimensionnement des colonnes d’une Grid existante.

En revanche, le redimensionnement du frame ne change pas automatiquement :

- le mode Desktop, Tablet ou Mobile ;
- le variant responsive ;
- le nombre de colonnes d’une Grid.

Dans Figma Design, le designer applique le mode au frame de présentation.
Figma Sites possède de vrais breakpoints automatiques, mais il s’agit d’un
autre produit et d’un autre fonctionnement.

## 7. Comment choisir

### Le design reste identique

Utiliser Auto Layout.

### Seules les valeurs changent

Utiliser Auto Layout et les variables avec modes.

### L’organisation du composant change

Créer des variants responsive et les lier à la variable `viewport`.

### Les cartes doivent former une grille stricte

Utiliser Grid. Si le nombre de colonnes change, créer une Grid par variant.

### Les objets peuvent passer librement à la ligne

Utiliser Wrap, à condition d’accepter une dernière ligne différente.

## 8. Méthode recommandée

Pour chaque composant :

1. construire d’abord le comportement fluide avec Auto Layout ;
2. réduire le frame pour observer le comportement réel ;
3. garder Auto Layout tant que le design reste correct ;
4. utiliser les modes si seules les valeurs doivent changer ;
5. créer un variant uniquement lorsque la structure doit changer ;
6. présenter les états Desktop, Tablet et Mobile dans des frames identifiés.

Les breakpoints doivent être choisis au moment où le contenu ou la composition
ne fonctionne plus, pas uniquement à partir d’un modèle de téléphone ou de
tablette.

## Sources

- [Figma — Responsive website design](https://www.figma.com/resource-library/responsive-website-design/)
- [Figma — Guide to Auto Layout](https://help.figma.com/hc/en-us/articles/360040451373-Explore-auto-layout-properties)
- [Figma — Grid Auto Layout](https://help.figma.com/hc/en-us/articles/31289469907863-Use-the-grid-auto-layout-flow)
- [Figma — Apply variables to designs](https://help.figma.com/hc/en-us/articles/15343107263511-Apply-variables-to-designs)
- [Figma — Variants, slots et instance swaps](https://help.figma.com/hc/en-us/articles/38741465279895-The-difference-between-slots-instance-swaps-and-variants)
- [Figma — Préservation des changements entre variants](https://help.figma.com/hc/en-us/articles/360039150733-Apply-changes-to-instances)
- [Figma — Modes for variables](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables)
- [Figma Sites — Responsive component per breakpoint](https://help.figma.com/hc/en-us/articles/31242826664983-Create-a-responsive-component-that-automatically-adapts-to-each-breakpoint)
- [Devōt — Responsive Design in Figma](https://devot.team/blog/figma-responsive-design)
