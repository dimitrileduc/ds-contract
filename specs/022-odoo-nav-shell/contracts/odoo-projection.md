# Contrat d'interface — projection Odoo du shell (header système + menu natif)

Normatif pour la phase cible. Préalable absolu : la phase amont est close (versions **2.0.0** /
1.2.0 / 1.0.0 re-épinglées, portes vertes — geste canvas §0 du delta compris) ET les trois
spikes S1/S1b/S2 ont leur reçu OBSERVÉ.

## 1. Interface d'intégration (`scripts/odoo/` + `config/`)

| Surface | Contrat |
|---|---|
| `lib/repo-data.ts` | `SHELL_CONTRACT_IDS = ['ds.header']` (NOUVEAU, à côté des posables) ; `closureOf` inchangé |
| `build-assets.ts` | émet la CSS des fermetures posables ∪ shell (dédup existante) — `components.pqr.css` gagne les blocs `header/nav-item/piqueray-logo` (button déjà présent) ; `--check` reste le tribunal |
| `check-module.ts` | racine posable ⇒ snippet inscrit ; racine shell ⇒ snippet **INTERDIT** (FR-001) |
| `check-inputs.ts` / lock | + `header@2.0.0`, `nav-item@1.2.0`, `piqueray-logo@1.0.0` (chemin+version+SHA-256) |
| `check-authoring.ts` | exige `header.authoring.json` exhaustif (un verdict par prop/part, occurrences imbriquées comprises) ; enum `mechanism` du schéma 019 étendu **additivement** : `native-menu` |
| `build-derivation-report.ts` | compte les nouveaux blocs manuels `ODOO-022-*` (fichiers/blocs/lignes/octets — jamais un avis) |

## 2. Gabarit header (`views/header.xml`, zone manuelle `ODOO-022-HEADER-QWEB`)

- **Branchement** : zone header système d'Odoo, par la route validée en S1 — jamais une
  inscription `website.snippets`. Le template est rendu à CHAQUE requête (c'est le mécanisme qui
  rend SC-006 possible) ; aucune copie gelée.
- **Balisage** : classes de la CSS générée (`header__…`, `nav-item__…`, `piqueray-logo__…`,
  `button…`) + `data-pqr-part` par part — même adressage que les sections 019. Rendu :
  **l'unique variante du contrat 2.0.0** (Transparent) — classes plain, aucun conditionnement
  (la prop `fond` n'existe plus).
- **Menu** : `t-foreach` sur les enfants du menu du site (`website.menu`) — libellé `menu.name`,
  cible URL/page, `new_window` respecté ; **chevron** rendu ssi l'entrée a des enfants ;
  sous-menu = balisage déroulant Odoo/Bootstrap PAR DÉFAUT (aucune CSS Piqueray de panneau —
  FR-009, différé nommé). Interdits : libellé/cible/ordre en dur (FR-004) ; toute
  profondeur ≥ 3 suit le comportement par défaut sans casser la barre (edge case).
- **Actif** (`ODOO-022-HEADER-ACTIF`) : l'état actif calculé par Odoo (page courante OU parent
  d'une page courante — S1b) pose la classe `actif` attendue par la CSS de `ds.nav-item` +
  `aria-current="page"` ; l'entrée de sous-menu active garde le style Odoo par défaut.
- **Logo** : composition `ds.piqueray-logo` variante `blanc` (figée au contrat 2.0.0 — marque
  orange + wordmark blanc), lien vers l'accueil avec nom accessible — la seule sémantique
  ajoutée par la zone manuelle.
- **CTA** : `t-call` du `pqr_button` existant, `link_href="/contactez-nous"`, variante `blanc`,
  `iconRight` `arrow-right`, libellé « Contactez-nous » — non éditable (verdict `not-editable`).
- **Icônes** : search/user/cart 24px, spans `aria-hidden="true"`, `currentColor` (encre par la
  CSS du combo) — **inertes, limite nommée**.
- **Menu vide** : la barre (logo, CTA, icônes) se rend sans zone cassée — le `t-foreach` vide est
  un cas légal, pas une erreur.

## 3. Semis (`ODOO-022-MENU-SEED`) — une fois, jamais re-joué

- Données `noupdate="1"` créant l'arborescence D8 (avec `confidence: "inferred"` porté en
  commentaire sur le placement « Motorisation ») + retrait des entrées par défaut du site —
  via le mécanisme « une fois » validé en S2 (install frais ET update d'un site déjà installé).
- Après semis : AUCUN chemin de code ne réécrit `website.menu` — ni update de module, ni
  régénération d'assets, ni resync. La preuve install-update l'atteste (menu client
  byte-identique).

## 4. Fond sombre (`ODOO-022-FOND-SOMBRE`, `odoo-bridge.css`)

`background-color: var(--pqr-color-noir-bleute)` sur le conteneur header du site — Odoo
SEULEMENT (ni contrat ni Figma) ; la valeur roule en variable générée, jamais en littéral.
L'overlay hero est hors périmètre (nommé).

## 5. Manifeste addon

`version` bump (`19.0.1.5.0`), `data` += vues header + semis, description : le header rejoint la
liste comme **shell** (jamais « posable ») ; bundles inchangés sauf besoin S1b (JS actif → bundle
frontend, compté au registre).

## 6. Preuves exigées (reçus sous `specs/022-odoo-nav-shell/proofs/`)

| Reçu | Contrat de contenu |
|---|---|
| `spike-header.json` / `spike-actif.json` / `spike-seed.json` | constats OBSERVÉS datés sur l'image épinglée ; toute assertion DOCUMENTÉ→OBSERVÉ tracée ; un constat qui contredit la spec la fait corriger AVANT le QWeb |
| Sujet visuel `header.mts` + rapport | clip épinglé (`--measure`), Transparent sur fond `--pqr-color-noir-bleute`, verdict sous la tolérance du harnais (`compare.mts`) — SC-001 |
| `header-menu.spec.mts` | ajouter + renommer + réordonner + imbriquer + cible page + cible URL externe → save → reopen (éditeur ET public) : contenu 100 % conservé (SC-003), balisage des liens simples inchangé (SC-002), chevron apparu sur le nouveau parent (FR-008) |
| `header-nav.spec.mts` (déroulants + actif) | ouverture/navigation par lien à enfants (SC-004) ; soulignement exact par page atteignable du menu semé, cas « parent d'enfant actif » inclus (SC-005) — pages cibles créées par la QA |
| `sc-006-regeneration.json` | bump réel attesté par les reçus amont — pas d'« avant » en ligne, la projection consomme d'emblée 2.0.0 ; régénération complète `contrat → build → odoo:assets → update module` sans toucher au menu : l'apparence en ligne provient du contrat re-épinglé et est reproduite SANS réédition manuelle ; `website.menu` byte-identique avant/après (SC-006, FR-010, FR-016) |
| clôture | limites nommées : icônes inertes, sous-menu Odoo par défaut, hover/mobile/Solid/overlay différés, menu très long au comportement Odoo par défaut, sémantique React différée, options natives de header non restreintes (déviation acceptée), rouges pré-existants (`odoo:qualification`, `editability-boundary` 43/44) cités sans re-diagnostic |

## 7. Ce que cette projection ne fait PAS

Aucun émetteur `odoo` dans `core/` (spec 025) · aucune migration du HTML des sections posées ·
aucune mutation Figma **dans la phase cible** (le seul geste canvas de la feature — retrait du
master Solid — appartient à la phase amont, delta §0) · aucune restriction de l'édition de menu
ni des options natives de header · aucun re-semis.
