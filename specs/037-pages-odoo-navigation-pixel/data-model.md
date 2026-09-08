# Data model — 037

Tous les documents sont du JSON sur disque, versionnés. Aucun modèle Odoo neuf, aucun contrat.

## 1. Page (`integrations/odoo/authoring/pages/<nom>.json`)

| Champ | Type | Règle |
|---|---|---|
| `url` | string | `/` ou `/<slug>` ; unique ; c'est l'identité de la page côté site (liste `scripts/odoo/lib/pages.ts`) |
| `name` | string | nom Odoo de la vue |
| `key` | string | clé `ir.ui.view` (`piqueray_ds.<key>`), unique ; absent uniquement pour Home (`view_tname` `website.homepage`) |
| `meta_title` | string | titre du navigateur (FR-002) |
| `meta_description` | string? | optionnel |
| `header_overlay` | boolean | en-tête en superposition (toutes les vues v2 : `true`) |
| `sections` | Section[] | ordre = ordre de la vue Figma wide (FR-001) |
| `_note` | string? | commentaire libre, ignoré |

`pages/` contient des descripteurs qui ne sont **pas** des pages du site : les `*-test.json`, et d'autres qui ne suivent pas ce
motif (relevé 2026-09-08 : `hero-video-mesure.json`). L'identité des 9 pages est donc une **liste blanche explicite** dans
`scripts/odoo/lib/pages.ts`, jamais un motif de nom de fichier. Un descripteur de `pages/` absent de la liste blanche **et** du
motif `*-test.json` est **refusé en étant nommé** par `odoo:pages:check` : un fichier de travail se classe, il ne s'ignore pas.

## 2. Section

Deux formes, exclusives :

**Propre** — `{ "component": "s_pqr_<bloc>", …clés du composeur…, "links"?: Links }`
**Commune** — `{ "commun": "<bloc-commun>", "surcharge"?: Surcharge }`

Clés du composeur (existantes, inchangées) : `set_html`, `set_button`, `images`, `variant`, `disposition`, `cards`, `reviews`,
`rows`, `remove_class`, `add_class`, `set_empty`. Clé **neuve** : `links`.

Refus (FR-006) : `component` et `commun` ensemble ; `component` inconnu du module ; une section **propre** dont le `component`
est celui d'un bloc commun (`s_pqr_devis`, `s_pqr_reassurances`, `s_pqr_google_reviews_section`) → « copie locale interdite »
(SC-004).

## 3. Contenu commun (`integrations/odoo/authoring/commun/<bloc>.json`)

Une Section **propre** complète (avec `component`). Trois documents obligatoires, et **eux seuls** : `devis`, `reassurances`,
`avis-google`. Le nom de fichier est la clé référencée par `commun`.

`commun/destinations-externes.json` vit dans le même dossier mais **n'est pas un bloc commun** : c'est la liste fermée des
adresses externes autorisées (§5). Le résolveur le lit par son nom, jamais par énumération du dossier, et **refuse**
`{"commun": "destinations-externes"}` comme un `commun` inconnu. Corollaire : la liste des blocs communs est écrite en dur
(trois clés), jamais dérivée du contenu de `commun/`.

## 4. Surcharge

Objet dont chaque clé est un **champ** de la section commune :

| Clé de surcharge | Fusion |
|---|---|
| `disposition`, `variant` (scalaires) | remplace |
| `cards`, `reviews`, `rows` (listes) | remplace la liste **entière** |
| `set_html`, `set_button`, `images`, `links` (dictionnaires par part) | fusion **par part** : seule la part nommée est remplacée |
| `remove_class`, `add_class`, `set_empty` (listes de classes/parts) | union |

Refus : clé absente du commun **et** hors des clés du composeur → **orphelin** (page, section, clé) ; part d'un dictionnaire
absente du commun et du gabarit → orphelin (page, section, part).

Invariant (SC-004) : `résoudre(commun', page) == résoudre(commun, page)` sur les champs surchargés, et
`== commun'` sur les champs non surchargés, pour toute correction `commun → commun'`.

## 5. Destination et Links

`Links = { "<part-hôte>": Destination }` ; dans une carte : `"lien": Destination`.

`Destination` (string) — grammaire fermée du résolveur :

| Forme | Acceptée | Condition |
|---|---|---|
| `#…` | oui | ancre |
| `/` ou `/<slug>` | oui | **doit** être l'`url` d'une Page du site |
| `tel:…`, `mailto:…` | oui | — |
| `https://…` | oui | **doit** figurer dans `commun/destinations-externes.json` (liste fermée `{ "<url>": "<raison>" }`) |
| `javascript:`, `data:`, `//…`, `http://`, chemin inconnu, vide | **non** | refus nommé (fichier, section, part, valeur) |

Adressage hôte (identique au panneau d'édition) : `[data-pqr-part="<part>"] a[data-pqr-part="button-root"]`, sinon
`a[data-pqr-part="<part>"]`. Une part sans ancre → refus (part inconnue). Destination **absente** pour un bouton/carte présent
dans la section → `href="#"` conservé + ligne au Registre des restes (jamais inventée).

Parts à destination connues au 2026-09-08 (inventaire `components.xml`) : `hero-cta`, `button-root` (hero vidéo, présentation),
`presentation-cta`, `faq-cta`, `devis-cta`, `sav-cta`, `reassurances-cta`, `root-entete-bouton`, `root-bouton-conteneur`,
`ecrire-avis`, `lire-la-suite` (par avis, via `reviews[].lienAvis`), `carte-root` / `carte-cta-root` (catégories), `produit-card`,
`coordonnees-facebook-link`, `coordonnees-instagram-link`.

## 6. Arbre du menu (`specs/037-…/contracts/menu-tree.json`)

`Entree = { label, url, children?: Entree[] }`, ordre = ordre d'affichage. Arbre validé (owner 2026-09-08) :

```
Portes de garage /portes-de-garage
  ├ Portes résidentielles /portes-residentielles
  ├ Portes industrielles /portes-industrielles
  └ Motorisation /motorisation
Portes d'entrée /portes-entree
Dépannage/SAV /depannage-sav
À propos /a-propos
```
« Contactez-nous » = bouton (en-tête, pied, menu mobile), pas une entrée. Home = logo.

**Entrée active** (par page) : `/` → aucune ; top feuille → elle-même ; enfant → l'enfant **et** son parent ; jamais une autre.
Source de vérité côté Odoo : `website.menu` (semé par `menu_seed.xml`, finalisé par `hooks.py`) ; `menu-tree.json` est la
**donnée de test** (FR-008 scénario 1) et l'éval `odoo-pages-navigation-tree` prouve qu'elle est égale au semis.

## 7. Vue Figma de référence (`extract/odoo-page-parity/views.json`)

```jsonc
{
  "fileKey": "d9FYAUcqdcNtsuaMgLefvJ",
  "seuilPct": 5,                 // owner 2026-09-08 — bruit de rendu du texte
  "toleranceHauteurPx": 10,      // owner 2026-09-08
  "largeurs": [390, 834, 1200, 1728],
  "pages": {
    "portes-de-garage": { "url": "/portes-de-garage", "section": "2770:21610",
      "vues": { "390": { "nodeId": "2770:21611", "hauteurAuReleve": 8147, "releve": "2026-09-08" }, … } },
    …
  }
}
```
Règles : une vue = un `nodeId` par largeur ; largeur exportée ≠ largeur → `impossible — vue de mauvaise largeur` ; nœud absent →
`impossible — vue introuvable` ; la hauteur écrite est informative, la hauteur **vive** fait foi.

## 8. Rapport de mesure de page (`specs/037-…/proofs/mesure/<page>/<largeur>.json`)

| Champ | Type | Règle |
|---|---|---|
| `page`, `url`, `largeur` | string, string, number | identité |
| `instance` | string | nom du projet Docker mesuré (jamais `piqueray-odoo-test`) |
| `date` | ISO | — |
| `statut` | `mesurée` \| `impossible` | `impossible` ⇒ `raisonImpossible` non nul et tous les scores nuls |
| `figma` | `{ nodeId, hauteur, sha256 }` | hauteur vive |
| `odoo` | `{ hauteur, sha256 }` | — |
| `ecartHauteurPx` | number | `odoo.hauteur − figma.hauteur` |
| `regleCadrage` | string constante | « alignées en haut, comparées sur la hauteur commune » |
| `hauteurCommune` | number | `min(figma, odoo)` |
| `diffPixels`, `scorePct` | number | `diffPixels / (largeur × hauteurCommune) × 100` |
| `seuilPct`, `toleranceHauteurPx` | number | recopiés de `views.json` |
| `verdictPixel` | `vert` \| `rouge` | `scorePct ≤ seuilPct` |
| `verdictHauteur` | `bruit` \| `rouge` | `|ecartHauteurPx| ≤ tolerance` |
| `verdictPage` | `vert` \| `rouge` \| `impossible` | vert ⇔ pixel vert **et** hauteur bruit |
| `sections` | Section[] | `{ nom, figma:{y,h}, odoo:{y,h}, ecartH, ecartYCumule }` apparié par position, **Header et Footer retirés du côté Figma** (ni l'un ni l'autre n'est dans le `#wrap` d'Odoo) ; `structure: "égale" \| "<n> vs <m> sections"` |
| `sectionOrigineDecalage` | string \| null | première section dont `ecartYCumule` > tolérance |
| `ecartsContenu` | string[] | écarts de copie **nommés** (FR-018), écrits à la main après lecture |
| `cause`, `justification` | string \| null | à la main, jamais devinés |
| `triptyque` | `{ chemin, sha256 }` | PNG 1:1 hors dépôt (`.page-parity/037/…`), empreinte dans le dépôt |

Déterminisme : deux mesures sans changement ⇒ mêmes `scorePct`, `ecartHauteurPx`, `sha256` (SC-005).

## 9. Registre des restes (`specs/037-…/proofs/registre-restes.md`, généré + complété à la main)

Lignes typées : `destination-non-tranchée (page, section, part)` — sortie de `odoo:pages:check --json` ;
`commun-figé-par-page (mécanisme, commande qui rafraîchit : npm run odoo:page -- <page> <projet> ×9)` ;
`vue-manquante (page, largeur)` ; `écart-au-dessus-du-seuil (page, largeur, score, cause dominante)` ;
**`hauteur-rouge (page, largeur, Δh, section d'origine du décalage, décision attendue)`** — un `verdictHauteur: rouge` n'est
**pas** un « écart au-dessus du seuil » (celui-ci parle du score au pixel) et doit avoir sa propre ligne, sinon il n'a nulle
part où s'écrire ; cas connu au 2026-09-08 : la home aux quatre largeurs (+128 · +118 · +34 · +70 px) ;
`écart-de-source (fait, décision attendue)` — dont ceux de research D9/D13.

## 10. Validation owner (`specs/037-…/proofs/validations-owner.md`)

Une ligne par page : `date · page · verdict (validée | à corriger : <demande>) · lien éditeur pilote`. Une page « à corriger »
repasse par reconstruction **puis** mesure avant un nouveau verdict (FR-020). Zéro « validée » sans ligne (SC-008).

## Transitions d'état d'une page

```
descripteur écrit ─résoudre─▶ résolu (ou REFUS nommé) ─composer─▶ posée (HTML figé, instance nommée)
      ▲                                                          │
      │ correction (contenu, commun, source Figma)               ├─naviguer─▶ liens 200 + actif attendu (ou ROUGE nommé)
      │                                                          └─mesurer──▶ 4 rapports (vert | rouge | impossible)
      └──────────── owner : « à corriger » ◀── validation owner ◀────────────┘
```
