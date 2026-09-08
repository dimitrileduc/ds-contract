# Scripter le contenu des pages Odoo (ta « demo data »)

Ici tu écris **le contenu des pages** du site Odoo, sous forme de fichiers texte
versionnables. Tu édites un fichier, tu lances une commande, la page est refaite.
**C'est ça, scripter ta demo data.**

## Les 3 mots (en clair, une fois pour toutes)

- **Bloc** = un morceau réutilisable de page (Hero, Catégories, SAV, Devis,
  Réassurances, Avis Google…). C'est du **design gouverné**, fabriqué par l'équipe
  design dans le module `piqueray_ds`. **Tu n'y touches pas.**
- **Fichier de contenu** = `pages/<nom>.json`. Tu y mets **ce qui va DANS les blocs**
  pour une page : titres, textes, images, nombre de cartes, variante. **C'est ton
  seul truc à écrire.** Une page = un fichier.
- **Seed** = une **photo de la base remplie** (`npm run odoo:save`), pour la remettre
  vite ailleurs (`npm run odoo:restore`) sans tout reconstruire.

## Les 3 choses que tu veux faire

### 1) Modifier une page existante
Édite `pages/home.json`, puis :
```bash
npm run odoo:page -- home <projet-docker>
# ex : npm run odoo:page -- home piqueray-odoo-home
```
→ la page est reconstruite dans l'instance.

### 2) Ajouter une nouvelle page
```bash
cp pages/home.json pages/portes-garage.json      # copie
# édite pages/portes-garage.json (change url, sections, textes…)
npm run odoo:page -- portes-garage <projet-docker>
```
Mets `"url": "/portes-de-garage"` dans le fichier → la page est créée à cette adresse.

### 3) Sauvegarder / restaurer la base
```bash
npm run odoo:save                 # écrit le seed (base + images)
npm run odoo:restore -- --project <projet>   # le remet dans une autre instance
```

## Le format d'un fichier de contenu

Un fichier = une liste de **sections**, dans l'ordre d'affichage. Chaque section
nomme un **bloc** (`component`) et son **contenu**. Extraits réels de `pages/home.json` :

```jsonc
{
  "url": "/",                 // adresse de la page
  "name": "Home",
  "sections": [

    { "component": "s_pqr_hero",
      "set_html": { "hero-title": "<span>Le numéro 1 des portes HÖRMANN…</span>" },
      "remove_class": ["pqr-soustitre-on"],   // masque le sous-titre (comme la maquette)
      "set_button": { "hero-cta": "En savoir plus" },
      "images": { "hero-background": "hero" }  // "hero" = assets/hero.png
    },

    { "component": "s_pqr_categories_principales",
      "variant": "superpose",                  // 2 cartes superposées (sinon 4 empilées)
      "cards": [
        { "titre": "Portes de garage", "texte": "…", "image": "cat_garage" },
        { "titre": "Portes d’entrée",  "texte": "…", "image": "cat_entree" }
      ]
    },

    { "component": "s_pqr_reassurances",
      "cards": [
        { "titre": "Sécurité et conformité", "body": "…", "image": "rea1" },
        { "titre": "Intégration parfaite",   "body": "…", "image": "rea2" }
      ]
    },

    { "component": "s_pqr_google_reviews",
      "reviews": [
        { "auteur": "pho syster", "initiale": "P", "date": "il y a 2 mois", "texte": "…" }
      ]
    }
  ]
}
```

### Les clés disponibles dans une section
| Clé | Effet |
|-----|-------|
| `component` | le bloc à poser (voir la liste ci-dessous) — **obligatoire** |
| `set_html` | `{ "<part>": "<html>" }` — remplace un texte (le gras `<strong>` est gardé) |
| `set_button` | `{ "<part-cta>": "libellé" }` — change le libellé d'un bouton |
| `images` | `{ "<part>": "nomfichier" }` — met une image (`nomfichier` = `assets/nomfichier.png`) |
| `variant` | `"superpose"` pour les catégories (2 cartes superposées) |
| `cards` | liste de cartes (`titre` / `texte` ou `body` / `image`) — réassurances, catégories |
| `reviews` | liste d'avis (`auteur` / `initiale` / `date` / `texte`) — Avis Google |
| `rows` | liste de rangées d'accordéon (`titre` / `contenu` / `etat` = `ferme` ou `ouvert`) — Texte SEO, FAQ |
| `remove_class` | retire une classe du bloc (ex : `pqr-soustitre-on` pour masquer un sous-titre) |
| `add_class` | ajoute une classe de composition au bloc (ex : `s_pqr_bleed` pour la pleine largeur — voir « Layout de page ») |
| `set_empty` | vide un texte |
| `links` | `{ "<part>": "<destination>" }` — **l'adresse d'un bouton** (spec 037, voir plus bas) |

Une carte peut porter `lien` (catégories, produits) et un avis `lienAvis` — même
grammaire de destination que `links`.

Le `<part>` est l'étiquette d'un morceau du bloc (`data-pqr-part="…"` dans le template).
Les plus utiles : `hero-title`, `hero-cta`, `hero-background`, `sav-background`,
`sav-photo`, `devis-background`, `presentation-title`, `presentation-text`.

### Les blocs disponibles
`s_pqr_hero`, `s_pqr_categories_principales`, `s_pqr_presentation`, `s_pqr_sav`,
`s_pqr_devis`, `s_pqr_reassurances`, `s_pqr_google_reviews`, `s_pqr_equipe`,
`s_pqr_faq`, `s_pqr_coordonnees`, `s_pqr_texte_seo`, `s_pqr_realisations`, `s_pqr_formulaire`.
(`pqr_section_header` a disparu le 2026-09-08 : chaque section porte son en-tête.)

## Le contenu COMMUN — écrit une fois, repris par référence (spec 037)

Trois blocs sont **les mêmes sur toutes les pages** : le Devis, les Réassurances et
les Avis Google. Ils ne se recopient plus dans chaque fichier de page — ils vivent
dans `commun/` :

```text
commun/devis.json  ·  commun/reassurances.json  ·  commun/avis-google.json
```

Dans une page, ça s'écrit en une ligne :

```jsonc
{ "commun": "devis" }
```

**Corriger le commun corrige toutes les pages qui le reprennent.** (Reconstruire
chaque page : Odoo ne propage rien — voir « Et si un bloc change ? ».)

### La surcharge — champ par champ, jamais le bloc entier

Une page qui a besoin d'une variante ne recopie pas le bloc : elle **surcharge** les
champs qui changent, et suit le commun pour tout le reste.

```jsonc
{ "commun": "reassurances",
  "surcharge": {
    "disposition": "4Cartes",
    "set_html": { "reassurances-title": "Pourquoi choisir nos portes résidentielles ?" },
    "cards": [ … les 4 cartes … ]
  } }
```

Les règles de fusion, une fois pour toutes :

| Ce que tu surcharges | Ce qui se passe |
|---|---|
| un scalaire (`variant`, `disposition`) | il remplace celui du commun |
| une **liste** (`cards`, `reviews`, `rows`) | elle remplace la liste **entière** |
| un **dictionnaire par part** (`set_html`, `set_button`, `images`, `links`) | fusion **par part** : seule la part nommée change, les autres suivent le commun |
| une liste de classes (`remove_class`, `add_class`, `set_empty`) | union avec celle du commun |

Une liste se surcharge entière parce qu'une fusion par index inventerait une identité
de carte que le DOM n'a pas : cinq cartes du commun plus quatre de la page rendraient
cinq cartes, en silence.

**Écrire un bloc commun en clair dans une page est REFUSÉ** (`component: "s_pqr_devis"`) :
le refus nomme le fichier, la section et le remplacement à écrire.

## Les destinations — grammaire fermée, refus nommé

`links` pose l'adresse d'un bouton, exactement là où le panneau d'édition l'écrirait.
La grammaire est **fermée**, et plus stricte que celle du panneau :

| Forme | Acceptée si |
|---|---|
| `#…` | toujours (ancre) |
| `/` ou `/<slug>` | c'est l'URL d'une **page du site** (`scripts/odoo/lib/pages.ts`) |
| `tel:` · `mailto:` | toujours |
| `https://…` | l'adresse figure dans `commun/destinations-externes.json` (liste fermée) |
| `javascript:` · `data:` · `//hôte` · `http://` · chemin inconnu · vide | **refusé, par son nom** |

Une destination **absente** n'est pas une faute : le bouton garde `href="#"` et part au
**registre des restes**. On n'invente jamais une adresse.

```bash
npm run odoo:pages:check            # résout les 9 pages, refuse, imprime le registre
npm run odoo:pages:check -- --json  # le même, en JSON
```

## Layout de page (gutter, gap, pleine largeur) — À LIRE avant tout html→odoo

Le **padding horizontal** (gutter) et l'**espacement vertical** (gap) entre sections
NE sont PAS dans les blocs. Ils vivent une seule fois sur le **page container** :
le composeur enveloppe toutes les sections dans `<div id="wrap" class="oe_structure o_pqr_page">`,
et `o_pqr_page` (dans `static/src/css/odoo-bridge.css`) est une **content-grid** qui
porte le gutter (`--pqr-space-89`), le `row-gap` (`--pqr-space-128`) et le
**padding bas de page** (`padding-bottom` : `--pqr-space-128`) — au container,
jamais par section. Pas de padding top (la 1re section touche la nav).

**Règle en vigueur (RENVERSÉE le 2026-09-04, vague 031) :**

- Le conteneur de page ne porte **QUE l'écart vertical**, par écran : **80 · 80 · 128 · 192**
  (jetons `space.80`, `space.128`, `space.192`), plus un padding bas de même valeur. Aucune
  gouttière : chaque section prend toute la largeur.
- La **gouttière vit dans le contrat de chaque section** (`padding-inline` 24 · 48 · 56 · 89),
  posée par la vague 031. Deux sections sont bord à bord par contrat (`produits-ecommerce`,
  `devis` : padding-inline 0) ; `presentation` est bornée à 1287 et centrée en wide, par la
  zone `ODOO-PRESENTATION-MAXWIDTH` d'`odoo-bridge.css`.
- `header` et `footer` sont hors de `#wrap` par construction — rien à faire pour eux.

<details>
<summary>Ce que disait cette section jusqu'au 2026-09-03, et pourquoi c'est faux depuis</summary>

La version du 2026-08-23 (tinyspec `odoo-page-gutter-gap.md`) posait la gouttière **sur le
conteneur** (deux colonnes de 89 px, content-grid) et interdisait de « cuire le gutter dans un
contrat », en s'appuyant sur le cadre `Container` non gouverné de Figma (nœud `2496:7189`). Une
section bord à bord recevait alors `"add_class": ["s_pqr_bleed"]` pour sortir de la gouttière.

C'était juste tant que les sections étaient pleine largeur sans padding. La vague 031 a inversé
le modèle : les quatre vues home de la page `031 · Planches de validation` montrent un conteneur
à **padding 0** dont toutes les sections partent de x = 0, et chaque contrat porte sa propre
gouttière par écran. Les deux se cumulaient : mesuré le 2026-09-04 sur le pilote, la colonne de
contenu ne faisait plus que **212 px** à 390 px de large. `s_pqr_bleed` a été retiré des huit
descripteurs : sans gouttière de page, la pleine largeur est le défaut.
</details>

Tracé dans `integrations/odoo/config/adaptation-registry.json` (reason code `odoo-page-layout`).

## Les images
Elles vivent dans **`assets/`** (`assets/hero.png`, `assets/cat_garage.png`…), en `.jpg` ou `.png`
(le type est déduit de l'extension — une photo va en JPEG à la taille du cadre, un PNG de
5 Mo servi tel quel a coûté 4 s de chargement le 2026-09-07).
Pour en ajouter une : dépose le fichier dans `assets/`, puis référence-la par son nom
(sans extension) dans le fichier de contenu (`"images": { "hero-background": "mon_image" }`).

## « Et si un bloc change ? »
Tu **relances la commande** `npm run odoo:page -- <nom> <projet>`. Elle reconstruit la
page avec le bloc à jour. Ton fichier de contenu ne bouge pas.
⚠️ Un **seed** fait avec l'**ancien** bloc ne « suit » pas un bloc modifié (une page
Odoo posée est un HTML **figé** — Odoo ne propage rien). Après une modif de bloc :
mets l'addon à jour dans l'instance (`odoo -u piqueray_ds`), **re-lance `odoo:page`**,
puis re-`save` le seed si besoin.

## Instances (rappel important)
- **`piqueray-odoo-test` (port 8071) = l'instance de l'owner. NE PAS la cibler.**
- Les agents travaillent sur une instance **jetable** (QA ou un projet Docker à eux).
  Passe son nom en 2ᵉ argument : `npm run odoo:page -- home <mon-projet>`.

## Les fichiers ici
- `pages/*.json` — **tes fichiers de contenu** (une page chacun).
- `assets/*.png` — les images.
- `compose_page.py` — le moteur (rend les blocs gouvernés + injecte ton contenu). Ne pas éditer pour un usage normal.
- `page.sh` / `run-compose.sh` — les scripts appelés par `npm run odoo:page`.
