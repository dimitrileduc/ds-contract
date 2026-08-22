# Data Model — 022 Barre de navigation Piqueray dans Odoo (le shell)

**Date**: 2026-08-20 · Dérivé de spec.md (Key Entities) + research.md (D1–D17).

Deux plans de données coexistent et ne doivent jamais se mélanger :
- le **plan gouverné** (contrats, schéma, lock, authoring, CSS générée) — propriété de l'owner,
  versionné, régénérable ;
- le **plan client** (les enregistrements `website.menu`) — semé une fois, puis propriété du
  client, jamais réécrit par une régénération.

---

## 1. Entités du plan gouverné

### 1.1 `ds.header` @ 2.0.0 — la barre (contrat remis à niveau, mono-variante)

| Champ | 1.0.0 (état vérifié) | 2.0.0 (cible) | Règle |
|---|---|---|---|
| `version` | 1.0.0 | **2.0.0** | **MAJOR** — retrait de prop/valeur (constitution VI) |
| `props.fond` | enum `solid\|transparent`, défaut `solid`, binding VARIANT `Fond` | **RETIRÉE** | 0 usage Solid (audit 020) ; le master Figma est supprimé AVANT l'édition (D3, §VIII/§X) |
| `props.items` | `arrayOf {libelle, href, chevron}`, binding figma NONE | inchangé | la donnée vit côté client (Odoo : `website.menu`) ; NONE = limite nommée 013 |
| `anatomy.root.tokens` | font-family, width, paddings — **aucun fond** | inchangé | Transparent = aucun fond, déjà vrai ; le fait Solid meurt avec la variante |
| `anatomy…iconsNav.tokens` | `gap` seul — aucune encre | + `color: {color.blanc}` | fait 013 `icones-couleur-par-variante` (moitié Transparent) ; les SVG sont `currentColor` |
| `anatomy…PiquerayLogo.component` | `props: {couleur: "default"}` | `props: {couleur: "blanc"}` | fait 013 `piqueray-logo-couleur-figee` — rendu : marque orange + wordmark blanc |
| `anatomy…Bouton.component` | `{id: ds.button}` nu | + `props: {variant: "blanc", iconLeft: false, iconRight: true, iconRightGlyph: "arrow-right"}`, `text: "Contactez-nous"` | faits 013 `bouton-*` ; `text` rend le libellé explicite (fin de la coïncidence avec le défaut de `ds.button`) |
| `repeat.sample[2]` | `{libelle: "Dépannage/SAV", href: "/motorisation", chevron: false}` (libellé déjà réparé en 016) | `href: "/depannage-sav"` | fait 013 `nav-item-href` — le contrat redevient une extraction du master |
| Défaut d'`items`, `actif` dans `arrayOf`, sémantique `<header>/<nav>` | absents | **inchangés — différés nommés** | research D2 ; l'ombre portée (Solid-only) est **close** avec la variante |

**Invariants de validation** (build + `validateContract`) : tout jeton référencé existe ; les
props d'enfant figées sont des valeurs légales des contrats enfants (vérifié : `blanc` ∈
`ds.piqueray-logo.couleur`, `blanc` ∈ `ds.button.variant`, `arrow-right` ∈ `iconRightGlyph`) ;
`npm run parity` propre après régénération (snapshot rafraîchi en lecture après le geste canvas).

### 1.2 `ds.piqueray-logo` @ 1.0.0 — le logo (contrat adopté)

| Champ | 0.1.0 draft | 1.0.0 adopté |
|---|---|---|
| `status` | `"draft"` | **retiré** |
| `version` | 0.1.0 | **1.0.0** |
| `description` | « PROPOSED … review before adoption » | patron des contrats adoptés (« reviewed and adopted — not authored ») |
| API / anatomie / ancres | `couleur: default\|blanc` ; Marque + Wordmark (`tokensByProp` sur couleur) ; set `da9ca0f5…` node 4:14 | **inchangés** (l'adoption est une revue, pas une réécriture) |

### 1.3 `ds.nav-item` @ 1.2.0 — le lien (épinglé, non modifié)

Canaux consommés par la projection : `libelle` (texte), `href` (code-only), `chevron`
(booléen → `OcticonChevronDown12` 16px `visibleWhen`), `actif` (booléen → `Soulignement`
`visibleWhen` + `aria-current="page"`), encre `{color.blanc}`, Montserrat 500/16 uppercase.

### 1.4 Canal de schéma : AUCUN (décision owner 2026-08-20)

Le canal `propsByProp` envisagé par la première version de ce plan est **abandonné avec la
variante Solid** : les props d'enfant se figent par le canal `ComponentRef.props` existant.
Schéma, `validateContract` et les trois émetteurs sont **intouchés** ; `docs/02-contract-spec.md`
n'est **pas** bumpé ; aucun nouvel eval n'est exigé (claims rule sans objet — aucune capacité
nouvelle). L'historique du canal envisagé et la décision de retrait vivent en research **D3**.

### 1.5 `inputs.lock.json` — l'épinglage de la projection

Entrées ajoutées/re-épinglées (chemin + version + SHA-256, les deux obligatoires) :
`contracts/header.contract.json@2.0.0`, `contracts/nav-item.contract.json@1.2.0`,
`contracts/piqueray-logo.contract.json@1.0.0` (+ toute entrée dont le SHA bouge par la fermeture).
Transition : toute divergence amont ⇒ `odoo:inputs:check` rouge ⇒ repin explicite ⇒ preuves
affectées invalidées.

### 1.6 Racines de l'intégration — la catégorie « shell »

```text
ROOT_CONTRACT_IDS  (posables)  = [presentation, google-reviews, hero, equipe, sav, devis, faq, texte-seo]
SHELL_CONTRACT_IDS (NOUVEAU)   = [header]        # CSS émise, snippet INTERDIT
fermeture(header) = header → nav-item, piqueray-logo, button   # button déjà émis (dédup)
```

Portes : `check-module` exige snippet(posable) ∧ ¬snippet(shell) ; `check-authoring`,
`check-inputs`, `build-derivation-report` couvrent l'union.

### 1.7 `header.authoring.json` — les verdicts (schéma 019, mécanisme additif `native-menu`)

| Adresse (contrat/prop, occurrences imbriquées comprises) | Verdict | Mécanisme |
|---|---|---|
| `ds.header/items` | `controlled` | **`native-menu`** (dialogue de menu Odoo) — la prop `fond` n'existe plus (2.0.0 mono-variante, aucun verdict à porter) |
| `ds.nav-item/libelle`, `/href` (par occurrence de menu) | `controlled` | `native-menu` |
| `ds.nav-item/chevron`, `/actif` | `controlled` | `computed-display` (donnée/routeur — jamais édités directement) |
| `ds.piqueray-logo/couleur` | `fixed-by-composition` | `none` |
| `ds.button/variant`, `/children`, `/iconLeft`, `/iconRight`, `/iconRightGlyph`, `/iconLeftGlyph` | `not-editable` (CTA fixe cette itération) | `none` |
| Icônes Search/User/Cart (parts) | `fixed-by-composition` — **inertes, limite nommée** | `none` |
| `rootActions` du shell | `forbidden` (move/duplicate/remove/save-as-custom/resize/background) ; les options natives de header d'Odoo restent NON restreintes — déviation acceptée, nommée | — |

### 1.8 Adaptations manuelles (registre `ODOO-022-*`)

| ID (marqueurs BEGIN/END) | Fichier | Rôle |
|---|---|---|
| `ODOO-022-HEADER-QWEB` | `views/header.xml` | gabarit système : branchement zone header + boucle `website.menu` + composition logo/CTA/icônes |
| `ODOO-022-HEADER-ACTIF` | `views/header.xml` (ou JS si S1b l'exige) | mapping actif Odoo → classe `actif` + `aria-current` |
| `ODOO-022-MENU-SEED` | `data/…` (+ migration si S2 l'exige) | semis unique + retrait des entrées par défaut |
| `ODOO-022-FOND-SOMBRE` | `static/src/css/odoo-bridge.css` | `background-color: var(--pqr-color-noir-bleute)` sur le conteneur header (Odoo seulement) |

Chaque bloc : entrée de registre avec `reasonCode` + `mechanism` ; bloc sans entrée ou entrée sans
bloc ⇒ `odoo:derivation:check` rouge.

---

## 2. Entités du plan client

### 2.1 Menu (`website.menu`) — l'arbre ordonné de liens

| Champ (modèle Odoo, DOCUMENTÉ) | Usage 022 |
|---|---|
| `name` | libellé du lien (rendu par `ds.nav-item.libelle`) |
| `url` / `page_id` | cible — page interne ou URL externe (FR-005) |
| `parent_id` | imbrication (enfant de déroulant) |
| `sequence` | ordre |
| `website_id` | site cible du semis |
| `new_window` | respecté tel quel (comportement natif) |

**Cycle de vie** :
`défaut Odoo (Home, Contact us)` → **[semis unique, à la livraison]** →
`arborescence maquette (D8, placement Motorisation marqué inferred)` → **propriété du client**
(toute édition standard : ajouter/renommer/réordonner/imbriquer/page/URL) → jamais re-semé,
jamais écrasé par une régénération (FR-016 ; preuve : scénario install-update + SC-006).

**Dérivés à l'affichage** (jamais stockés) : `chevron` := l'entrée a des enfants ;
`actif` := la sémantique native d'Odoo (page courante, ou parent d'une page courante — S1b).

### 2.2 Arborescence semée (fixture de données produit, une fois)

```text
1. Portes de garage   /portes-de-garage    [chevron dérivé]
   1.1 Portes résidentielles  /portes-residentielles
   1.2 Portes industrielles   /portes-industrielles
2. Portes d'entrée    /portes-entree       [chevron dérivé]
   2.1 Motorisation           /motorisation          # confidence: "inferred" (D8)
3. Dépannage/SAV      /depannage-sav
4. À propos           /a-propos
(CTA « Contactez-nous » → /contactez-nous : HORS menu — attribut fixe du gabarit, D10)
```

Pages cibles : créées par la QA pour les preuves (fixtures de scénario) — jamais embarquées dans
l'addon.

---

## 3. Entités de preuve

| Reçu | Forme | Critère couvert |
|---|---|---|
| `proofs/canvas/{repetition-clone.json, avant/, geste-solid.json}` | répétition sur clone, captures §X (set + 9 usages, non vides/dimensionnées) + version nommée, reçu du retrait + re-vérification des 9 instances par POSITION | préalable FR-013 (retrait Solid — D3, §VIII/§X) |
| `proofs/spike-header.json` / `spike-actif.json` / `spike-seed.json` | patron `*-mechanism-spike.json` 019 (constats machine-readable, DOCUMENTÉ→OBSERVÉ) | préalables D6/D9/D8 |
| Sujet visuel `header.mts` | `Subject` 019 : `contractId: ds.header`, `showcaseLabel` = combo Transparent, `odooPath` page de mesure publique, clip épinglé imprimé par `--measure` | SC-001 |
| `header-menu.spec.mts` (reçu JSON) | gestes : ajouter/renommer/réordonner/imbriquer/page/URL + save/reopen/public ; assertions : contenu 100 % conservé, balisage des liens simples intact, chevron apparu | SC-002, SC-003, FR-005/006/011 |
| `header-nav.spec.mts` (déroulants + actif, reçu JSON) | ouverture/navigation par lien à enfants ; soulignement par page atteignable, cas parent inclus | SC-004, SC-005, FR-007/008/009 |
| `proofs/sc-006-regeneration.json` + captures avant/après | bump réel 1.0.0 → 2.0.0 attesté par les reçus amont (pas d'« avant » en ligne — la projection consomme d'emblée 2.0.0) ; régénération complète sans toucher au menu ; menu client byte-identique avant/après | SC-006, FR-010 |
| Rapport de clôture | limites nommées (icônes inertes, sous-menu Odoo, hover/mobile/Solid/overlay différés, menu long au défaut Odoo, sémantique React différée, rouges pré-existants cités) | constitution V |

---

## 4. Relations (vue d'ensemble)

> *Correction datée — 2026-08-22.* Le diagramme portait `ds.header@2.0.0` : c'est la
> version **planifiée**, pas la version **livrée**. Un bump MINOR post-plan (root en
> `fill`) a suivi la MAJOR ; `inputs.lock.json`, `header.authoring.json` et
> `catalog.json` portent tous **2.1.0**. Motif et re-pins : clôture §« Limites
> nommées » n°4 ; angles morts de ce correctif : n°13, 15, 16.

```text
ds.piqueray-logo@1.0.0 ─┐
ds.nav-item@1.2.0 ──────┼─(composition)→ ds.header@2.1.0 ─(lock+fermeture)→ components.pqr.css ─┐
ds.button@2.0.1 ────────┘                                                                        │
                                                                                                 ▼
website.menu (client) ──(t-foreach)→ views/header.xml (ODOO-022-HEADER-QWEB) ──→ barre en ligne
                                            │                                        ▲
tokens/*.tokens.json ─→ tokens.pqr.css ─────┴─ odoo-bridge.css (FOND-SOMBRE) ────────┘
```

Le sens des flèches est le sens du flux constitutionnel : contrat → surfaces ; la donnée de menu
entre par le côté client et ne traverse jamais un contrat.
