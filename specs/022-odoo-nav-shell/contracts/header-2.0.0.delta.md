# Contrat d'interface — delta `ds.header` 1.0.0 → 2.0.0 (MAJOR : retrait de la variante Solid)

Ce document est normatif pour la phase amont (FR-013). Le diff de PR du contrat DOIT se lire
comme la revue de design-system qu'il est (constitution VI) ; chaque ligne du delta cite le reçu
qu'elle solde. Décision fondatrice : **owner, 2026-08-20 — la variante `Fond=Solid` (0 usage,
audit 020 : 9/9 Transparent) est retirée du contrat ET du set Figma.** Aucun canal de schéma
nouveau ; schéma et émetteurs intouchés.

## 0. Préalable canvas (§VIII : nettoyer la source AVANT de contracter — §X actif)

Ordre imposé, chaque étape avec reçu sous `proofs/canvas/` :

1. **Répétition sur CLONE** : cloner le set header, y supprimer la variante Solid, observer le
   devenir du set et de la propriété `Fond` (set mono-variante ? propriété retirée ? composant
   détaché ?) et la survie d'une instance test ; supprimer le clone. Mécanisme **À OBSERVER** —
   aucun retrait de variante n'a jamais été exécuté dans ce dépôt.
2. **Capture §X** : le set complet + les **9 usages** (captures + dump JSON), chacune vérifiée
   **non vide et correctement dimensionnée** (référence : la bbox du nœud dans le dump JSON du
   même relevé) ; `saveVersionHistoryAsync("022 — avant retrait Fond=Solid")`.
3. **Geste réel** : suppression du master `Fond=Solid` (+ résolution de la propriété de variante
   comme répété en 1) ; re-vérification des 9 instances **par POSITION** (intactes, toujours
   Transparent) ; captures après.
4. **Refresh LECTURE** de `parity/snapshots/figma-components.json` (notre geste a changé le
   fichier) — avant tout sweep parity.

## 1. Delta du contrat (exhaustif — rien d'autre ne change)

| # | Édition | Reçu soldé |
|---|---|---|
| 1 | `version`: `1.0.0` → `2.0.0` | — |
| 2 | **RETRAIT** de la prop `fond` (enum `solid\|transparent`, défaut `solid`, binding VARIANT `Fond`) — les 2 seules occurrences de `fond` dans le fichier (vérifié) | audit 020 (0 usage Solid) ; décision owner 2026-08-20 |
| 3 | `anatomy…iconsNav.tokens` += `"color": "{color.blanc}"` — état 1.0.0 vérifié : `gap` seul, aucune encre ; les SVG sont `currentColor` | `header.visual.icones-couleur-par-variante` (moitié Transparent ; la moitié Solid meurt avec la variante) |
| 4 | `anatomy…PiquerayLogo.component.props.couleur`: `"default"` → `"blanc"` — rendu : **marque orange + wordmark blanc** (`blanc` est le nom de la variante, pas un logo tout blanc) | `header.composition.piqueray-logo-couleur-figee` |
| 5 | `anatomy…Bouton.component` (ref **nu** en 1.0.0, vérifié) += `props: {"variant": "blanc", "iconLeft": false, "iconRight": true, "iconRightGlyph": "arrow-right"}` | `bouton-style-par-variante`, `bouton-icone-gauche`, `bouton-icone-droite`, `bouton-glyphe-droite` |
| 6 | `anatomy…Bouton.component` += `text: "Contactez-nous"` | `header.content.bouton-libelle` (fin de la concordance par coïncidence avec le défaut de `ds.button`) |
| 7 | `repeat.sample[2].href`: `"/motorisation"` → `"/depannage-sav"` — le **libellé « Dépannage/SAV » est déjà porté depuis 016** (`e8568440`) ; baseline corrigée ici | `header.content.nav-item-href` (`nav-item-3-libelle` soldé en 016) |
| 8 | `props.items` += `description` — **ajoutée en revue post-phase (2026-08-20)**, documentaire, aucun effet API : autorité du menu (sample design-time à routes réelles ; semis unique `website.menu` puis le menu CLIENT fait foi, FR-016), dette de double-portage nommée (aucune porte ne compare sample et semis), chevron dérivé côté Odoo | revue /simplify — les 4 paires (libellé, href) vivent en deux endroits sans comparateur |

Toutes les valeurs figées sont **légales chez les enfants** (vérifié en dépôt) : `blanc` ∈
`ds.piqueray-logo.props.couleur`, `blanc` ∈ `ds.button.props.variant`, `arrow-right` ∈
`ds.button.props.iconRightGlyph`.

**AUCUNE édition sur `root`** : l'état 1.0.0 vérifié ne porte aucun fond (font-family, width,
paddings) — « Transparent = aucun fond » est déjà vrai ; le fait 013 `fond-solid-remplissage`
est **clos par le retrait de la variante**, pas porté. Idem `header.visual.ombre-portee`
(Solid-only) : clos, plus un différé.

**NE CHANGENT PAS** (différés, nommés en research D2) : défaut d'`items`, `actif` dans
`arrayOf items`, `semantics.element` / landmark `<nav>` / sémantique des icônes,
tout canal de `ds.nav-item` (v1.2.0 épinglé) et de `ds.button` (2.0.1).

## 2. Canal de schéma : AUCUN

Le canal `propsByProp` envisagé par la première version de ce document est **abandonné avec la
variante Solid** (research D3) : les props d'enfant se figent par `ComponentRef.props` existant.
`validateContract`, les trois émetteurs et `docs/02-contract-spec.md` sont **intouchés** ; la
claims rule est sans objet (aucune capacité nouvelle → aucun nouvel eval exigé).

## 3. Conséquences de build (toutes par script)

`npm run build` (régénère `src/components/Header|PiquerayLogo`, `figma-sync/*.js`) ·
re-pin `evals/golden.json` (`scripts/update-golden.mjs`) · re-pin
`figma-sync/plugin/engine.receipt.json` (`plugin:check`) · `npm run catalog` (hors build) ·
`npm run parity` propre (snapshot rafraîchi en lecture après le geste §0) · sweep constitutionnel
complet dans le worktree (F1). **PAS de re-pin `examples/polaris`** — aucune édition d'émetteur.

## 4. Critère de sortie de la phase amont

Toutes les portes vertes + la vitrine `emit-html` (unique variante) montre : logo **marque orange
+ wordmark blanc**, 4 libellés exacts (« Dépannage/SAV » inclus), CTA « Contactez-nous » variante
blanc avec flèche droite, icônes 24px en encre blanche, aucun fond. C'est la référence que SC-001
comparera à Odoo.
