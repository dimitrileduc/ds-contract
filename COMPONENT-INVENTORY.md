# Inventaire des composants — maquettes Piqueray

**But** : la liste complète des composants à externaliser depuis les maquettes, atome → molécule → section, **avec leurs dépendances**, pour cadrer les prochaines specs. Environ **5 composants existent, ~34 sont à faire.**

> **⚠️ Re-mesure T0 (2026-07-23, scan par position — le dernier scan fait foi)** :
> voir `specs/003-externalize-figma-components/inventory/scan-2026-07-23.json` et le
> tableau des divergences dans [`inventory/dag.md`](specs/003-externalize-figma-components/inventory/dag.md).
> Corrections principales : **category-card 41** (pas ~15 — 3 formes de layout, une seule cle),
> **footer-column 27** (3 colonnes × 9 pages, pas 9), **gallery-item CONFIRMÉ** (27 tuiles
> mosaïque sur 3 pages), Hero solo ×2 seulement (le reste vit dans des composites, dont
> « Hero et FAQ » sur Dépannage/SAV et un GROUP « Header + Hero + Cat » sur Portes d'entrée),
> jeu d'icônes réel plus riche (cart, search, user, arrow-left, chevron-left/right,
> octicon:chevron-down-12). **dependancesTierces = 0 sur les 9 maquettes.**

## Source & méthode (à re-mesurer avant contractualisation)

- **Fichier** : `Piqueray (Copy)` — fileKey `d9FYAUcqdcNtsuaMgLefvJ`.
- **Périmètre scanné** : page **`Pages`** (`210:325`) — 9 maquettes pleine largeur 1728px : Accueil, Portes de garage (+ résidentielles / industrielles), Motorisation, Portes d'entrée, Dépannage/SAV, À Propos, Contactez-nous.
- **Méthode** : scan via le **pont desktop** (`figma_execute` + `figma.loadAllPagesAsync()`), instances résolues avec `getMainComponentAsync()`, graphe de dépendances reconstruit par containment. ⚠️ Les outils MCP **serveur** ne voient QUE la page `Assets` (la page `Pages` est locale, non synchro serveur).
- **Statut des chiffres** : mesures de session **2026-07-23**. Comme la règle projet (étape 0 / source-cleanliness), ils sont **re-mesurés avant toute extraction** — le fichier peut bouger, les chiffres re-mesurés font foi.
- **Légende** : ✓ = existe déjà comme composant · **gras** = à faire · *(inféré)* = déduit, bloc non nommé dans la maquette, à confirmer sur passe visuelle.

---

## Déjà des composants → NE PAS refaire

`Bouton` (×68) · `Header nav` (×9) · `piqueray_logo` (×9) · `member-picture` (×16) · les icônes (`chevron-up/down`, `arrow-right`, `piqueray`…). Total : **145 instances locales**, toutes bien instanciées dans les maquettes.

---

## ATOMES à faire (dépendent seulement des tokens)

| Atome | Preuve (état brut) | Dépend de |
|---|---|---|
| **Input** (texte) | `input` brut ×6 | tokens |
| **Textarea** | 1 champ 161px (Message) | tokens |
| **Select** (liste déroulante) | 1 `input` contient un `chevron-down` | chevron-down ✓ |
| **Checkbox** | **inexistant** (le consentement RGPD est un simple texte) | tokens |
| **Icônes sociales** | groupes bruts dans `Suivez-nous` | — *(à ajouter au jeu d'icônes)* |
| **Icône étoile** (note avis) | Avis Google *(inféré)* | — |

## MOLÉCULES à faire (composent des atomes)

| Molécule | Preuve | Dépend de |
|---|---|---|
| **Field** (label + saisie + erreur) | `field` brut ×7 | **Input / Select / Textarea** |
| **Accordion-row** (ligne FAQ, ouvert/fermé) | `item` / `item open` ~34 | chevron-up/down ✓ |
| **Accordion** (groupe de lignes) | `accordion` brut ×12 | **Accordion-row** |
| **Category-card** (image + titre + CTA) | `item` ~15 | Bouton ✓ |
| **Product-card** (`Thumbnail produit`) | brut ×8 | Bouton ✓ |
| **Member-card** (photo + nom + rôle) | `member` brut ×16 | member-picture ✓ |
| **Reassurance-item** (icône + texte) | `item` ~26 | icônes |
| **Review-card** (avatar + étoiles + texte) | Avis Google *(inféré)* | **Icône étoile** |
| **Tabs / Tab** | `tab` brut ×4 | tokens |
| **Carousel-controls** (prev / next) | `Controls` brut ×2 | Bouton ✓ |
| **Footer-column** + **Copyright** | brut ×9 | liens |
| **Contact-info-row** (adresse / horaires / …) | brut ×4 | icônes sociales |
| **Section-header** (surtitre + titre + CTA) | `Titres` brut ×9 | Bouton ✓ |

## SECTIONS à faire (composent des molécules)

| Section | Pages | Dépend de |
|---|---|---|
| **Footer (+ Devis)** | 9 | logo ✓ + **Footer-column** + **Copyright** + Bouton ✓ |
| **Devis / CTA** | 8 | Bouton ✓ |
| **Hero** | 8 | **Section-header** |
| **Avis Google** | 8 | **Review-card** |
| **Texte SEO** | 8 | **Accordion** |
| **Réassurances** | 6 | **Reassurance-item** + Bouton ✓ |
| **Catégories principales** (+ alt) | 7 | **Category-card** |
| **Hero et catégories** (composite) | 6 | Hero + Catégories |
| **Présentation** | 5 | Bouton ✓ |
| **FAQ** | 4 | **Tabs** + **Accordion** + Bouton ✓ |
| **Réalisations** | 3 | *(gallery-item, à confirmer)* |
| **Produits e-commerce** | 2 | **Product-card** + **Carousel-controls** |
| **Formulaire** | 1 | **Field** + **Checkbox** + Bouton ✓ |
| **Coordonnées** | 1 | **Contact-info-row** + icônes sociales + carte |
| **Équipe** | 1 | **Member-card** |
| **SAV** | 1 | Bouton ✓ (+ image) |

---

## Ordre de construction (imposé par les dépendances)

Le modèle de contrats impose le bottom-up : un contrat d'organisme référence les contrats de ses atomes. On ne peut donc pas contractualiser une section avant ses molécules, ni une molécule avant ses atomes.

1. **Tokens** — nettoyage (odeurs connues : `nav/state` en STRING, `orange-12/42` mintés, `space`/`radius` nommés par valeur).
2. **Atomes** — `Input` d'abord, puis `Textarea` / `Select` / `Checkbox` ; + icônes sociales & étoile.
3. **Molécules** — `Field`, `Accordion-row` → `Accordion`, les 4 cartes (category / product / member / review), `Reassurance-item`, `Tabs`, `Carousel-controls`, `Footer-column`, `Contact-row`, `Section-header`.
4. **Sections** — d'abord les triviales (`Devis`, `Présentation`, `SAV` = juste Bouton), puis `Hero`, `Réassurances`, `Catégories`, `Texte SEO`, `FAQ`, `Produits`, `Équipe`, `Avis Google`, `Formulaire`, `Coordonnées` → enfin les **composites** (`Hero et catégories`, `Footer + Devis`).

---

## Précisions honnêtes

- **`item` (×71) = 3 molécules distinctes** sous un même nom Figma : Accordion-row (~34) + Category-card (~15) + Reassurance-item (~26). À séparer au nommage.
- **Review-card, gallery-item (Réalisations), icône étoile = inférés** — leurs blocs ne sont pas nommés dans la maquette. À confirmer sur une passe visuelle avant de les acter.
- **`Header nav` et `Footer`** apparaissent aussi comme frames brutes : ce sont des conteneurs de positionnement autour de l'instance / des atomes — le Header est bien un composant, le Footer non.
