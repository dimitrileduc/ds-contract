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
| `remove_class` | retire une classe du bloc (ex : `pqr-soustitre-on` pour masquer un sous-titre) |
| `add_class` | ajoute une classe de composition au bloc (ex : `s_pqr_bleed` pour la pleine largeur — voir « Layout de page ») |
| `set_empty` | vide un texte |

Le `<part>` est l'étiquette d'un morceau du bloc (`data-pqr-part="…"` dans le template).
Les plus utiles : `hero-title`, `hero-cta`, `hero-background`, `sav-background`,
`sav-photo`, `devis-background`, `presentation-title`, `presentation-text`.

### Les blocs disponibles
`s_pqr_hero`, `s_pqr_categories_principales`, `s_pqr_presentation`, `s_pqr_sav`,
`s_pqr_devis`, `s_pqr_reassurances`, `s_pqr_google_reviews`, `s_pqr_equipe`,
`s_pqr_faq`, `s_pqr_coordonnees`, `s_pqr_texte_seo`, plus `pqr_section_header`
(un en-tête de section à composer, ex. au-dessus des avis).

## Layout de page (gutter, gap, pleine largeur) — À LIRE avant tout html→odoo

Le **padding horizontal** (gutter) et l'**espacement vertical** (gap) entre sections
NE sont PAS dans les blocs. Ils vivent une seule fois sur le **page container** :
le composeur enveloppe toutes les sections dans `<div id="wrap" class="oe_structure o_pqr_page">`,
et `o_pqr_page` (dans `static/src/css/odoo-bridge.css`) est une **content-grid** qui
porte le gutter (`--pqr-space-89`) et le `row-gap` (`--pqr-space-128`).

**Règle non négociable pour un futur émetteur html→odoo :**

- Les **sections restent full-width** côté contrat. Le gutter/gap sont de la
  **composition NON gouvernée** — ni dans `contracts/*.contract.json`, ni surveillés
  par `parity`/image-parity (image-parity mesure le **bloc nu**, plein largeur).
  C'est cohérent avec Figma, où le 89 est porté par un frame `Container` non gouverné
  (nœud `2496:7189`), pas par le master de section.
- **NE JAMAIS cuire le gutter dans un contrat** : ça casserait image-parity (bloc-avec-89
  vs master Figma full-width) et le modèle « on ne gouverne que les sections ».
- Une section **pleine largeur** (bord à bord, ex. `devis`) reçoit `"add_class": ["s_pqr_bleed"]`
  → `grid-column: full` : elle sort du gutter **en gardant son gap vertical** (pas de marge
  négative). `header`/`footer` sont hors de `#wrap` par construction — rien à faire pour eux.

Tracé dans `integrations/odoo/config/adaptation-registry.json` (reason code `odoo-page-layout`).

## Les images
Elles vivent dans **`assets/`** (`assets/hero.png`, `assets/cat_garage.png`…).
Pour en ajouter une : dépose le `.png` dans `assets/`, puis référence-la par son nom
(sans `.png`) dans le fichier de contenu (`"images": { "hero-background": "mon_image" }`).

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
