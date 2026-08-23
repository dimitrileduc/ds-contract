# Table de verdicts d'éditabilité — footer shell (gate humaine BLOQUANTE)

**Statut : VALIDÉE (2026-08-22) — owner a harmonisé les verdicts CTA avec le précédent 022
(`fixé par composition` → `non éditable` pour P3–P5, uniform across shells).**

Couverture : **100 % des props et des parts** de `ds.footer` 1.1.0 et `ds.footer-column` 1.1.0,
occurrences imbriquées comprises (`ds.piqueray-logo` 1.0.0, `ds.button` 2.0.1, `ds.copyright`
1.0.0), plus les contrôles Odoo hors contrat (liens). Vocabulaire du spec : `éditable` /
`fixé par composition` / `non éditable` / `hors capacité` — mappé sur le schéma d'authoring 019
(`controlled` / `fixed-by-composition` / `not-editable` / `out-of-capacity`).

Une fois validée, cette table est transcrite en
`integrations/odoo/config/footer.authoring.json` (un verdict par adresse canonique —
`odoo:authoring:check` échoue sur toute adresse sans décision). La table validée **fait foi**.

## 1. Props

| # | Adresse (componentPath → prop) | Verdict | Mécanisme / note |
|---|---|---|---|
| P1 | `ds.footer` → `items` | **fixé par composition** | La STRUCTURE de la collection (3 colonnes, ordre, titres) est figée par le gabarit ; le contenu textuel s'édite à l'adresse P9, jamais en ajoutant/retirant une colonne (Out of Scope). |
| P2 | `ds.footer` › PiquerayLogo → `couleur` | **fixé par composition** | `blanc` (marque orange + wordmark blanc), figé par le contrat. |
| P3 | `ds.footer` › Bouton (`ds.button`) → `variant` | **non éditable** | `outlineBlanc`, figé par le contrat. Harmonisé avec 022 (gate 2026-08-22). |
| P4 | `ds.footer` › Bouton → `children` | **non éditable** | « Contactez-nous » (`ComponentRef.text` du contrat). Harmonisé avec 022. |
| P5 | `ds.footer` › Bouton → `iconRight` | **non éditable** | `false`, figé par le contrat. Harmonisé avec 022. |
| P6 | `ds.footer` › Bouton → `iconLeft` | **non éditable** | Défaut du bouton, aucun canal offert. |
| P7 | `ds.footer` › Bouton → `iconLeftGlyph` | **non éditable** | Idem. |
| P8 | `ds.footer` › Bouton → `iconRightGlyph` | **non éditable** | Idem. |
| P9 | `ds.footer` › FooterColumn (`ds.footer-column`, repeat ×3) → `texte` | **éditable** | LE contenu rédacteur : adresse réelle, horaires réels, coordonnées réelles. Mécanisme : donnée semée + édition (spike S2 — candidat `t-field` inline ; repli : panneau). |
| P10 | `ds.footer` › FooterColumn → `titre` | **fixé par composition** | « Adresse » / « Horaires » / « Contact » — clarification spec : titres figés. |
| P11 | `ds.footer` › Copyright (`ds.copyright`) → `texte` | **éditable** | Année / mentions légales, sans intervention technique. Même mécanisme que P9 (spike S2). |

Note P3–P5 : l'owner a harmonisé avec le précédent 022 (gate 2026-08-22) — toutes les props du CTA
portent `non éditable`, uniform across shells. Aucun mécanisme n'en dépend.

## 2. Parts de `ds.footer`

| # | partPath | Verdict | contentKind / note |
|---|---|---|---|
| F1 | `root` | **non éditable** | structural — le shell lui-même (move/duplicate/remove/save-as-custom : interdits, `rootActions` patron header). |
| F2 | `root.Background` | **non éditable** | structural — plan de fond absolu `{color.noir-bleute}`. |
| F3 | `root.Row` | **non éditable** | structural. |
| F4 | `root.Row.col1` | **non éditable** | structural. |
| F5 | `root.Row.col1.PiquerayLogo` | **fixé par composition** | component — occurrence du logo, détail en §3. |
| F6 | `root.Row.col1.Bouton` | **non éditable** | component — le CTA, détail en §4. |
| F7 | `root.Row.FooterColumn` (collection ×3) | **fixé par composition** | repeat — 3 instances, ni ajout ni retrait ni réordonnancement ; contenu en §5. |
| F8 | `root.Row.col5` | **non éditable** | structural. |
| F9 | `root.Row.col5.TitreReseaux` | **fixé par composition** | plain-text — « Suivez-nous », texte du contrat. |
| F10 | `root.Row.col5.rseauxSociaux` | **non éditable** | structural. |
| F11 | `root.Row.col5.rseauxSociaux.Facebook` | **fixé par composition** | media — icône gouvernée (~31.86px, `{color.noir-bleute}`) ; son LIEN s'édite via O1. |
| F12 | `root.Row.col5.rseauxSociaux.Instagram` | **fixé par composition** | media — idem ; lien via O2. |
| F13 | `root.Spacer` | **non éditable** | structural. |
| F14 | `root.Separator` | **non éditable** | structural — filet blanc 1px, FR-012. |
| F15 | `root.spacer2` | **non éditable** | structural. |
| F16 | `root.Copyright` | **fixé par composition** | component — occurrence de `ds.copyright`, contenu en §6. |

## 3. Parts de l'occurrence `ds.piqueray-logo` (via F5)

| # | partPath | Verdict | note |
|---|---|---|---|
| L1 | `root` | **fixé par composition** | structural. |
| L2 | `root.Marque` | **fixé par composition** | media — SVG gouverné inliné. |
| L3 | `root.Wordmark` | **fixé par composition** | media — idem. |

## 4. Parts de l'occurrence `ds.button` (via F6)

| # | partPath | Verdict | note |
|---|---|---|---|
| B1 | `root` | **non éditable** | structural. |
| B2 | `root.iconLeft` | **non éditable** | media. |
| B3 | `root.iconOnlyIcon` | **non éditable** | media. |
| B4 | `root.label` | **non éditable** | plain-text — le libellé vient du contrat (P4). |
| B5 | `root.iconRight` | **non éditable** | media. |

## 5. Parts de l'occurrence `ds.footer-column` (via F7, repeat ×3)

| # | partPath | Verdict | note |
|---|---|---|---|
| C1 | `root` | **non éditable** | structural. |
| C2 | `root.Titre` | **fixé par composition** | plain-text — porte P10. |
| C3 | `root.Texte` | **éditable** | plain-text — porte P9. LA zone d'édition du rédacteur ; wrap long géré par la colonne (Edge Case du spec). Marques riches : **aucune** (`allowedMarks: []`) — texte brut, retours à la ligne du mécanisme de donnée seulement. |

## 6. Parts de l'occurrence `ds.copyright` (via F16)

| # | partPath | Verdict | note |
|---|---|---|---|
| K1 | `root` | **non éditable** | structural. |
| K2 | `root.Texte` | **éditable** | plain-text — porte P11, `allowedMarks: []`. |

## 7. Contrôles Odoo hors contrat (adaptations, patron `logo-link` du header)

| # | Contrôle | Verdict | Mécanisme |
|---|---|---|---|
| O1 | URL du lien Facebook | **éditable** | réglage natif du site (`website.social_facebook` — spike S3 ; repli `ir.config_parameter`). |
| O2 | URL du lien Instagram | **éditable** | idem (`website.social_instagram`). |
| O3 | Cible du CTA (`/contactez-nous`) | **fixé par composition** | figée dans le gabarit (clarification spec) — non éditable cette itération. |
| O4 | Actions racine (move / duplicate / remove / save-as-custom / resize / background) | **interdites** | `rootActions` verdict `forbidden`, reasonCode `shell-systeme` (patron header). |

## 8. Récapitulatif de la surface éditable proposée

**4 zones éditables, rien d'autre** : les 3 textes de colonnes (P9/C3) + le copyright (P11/K2) ;
**2 réglages** : URLs Facebook/Instagram (O1/O2). Aucune adresse au verdict `hors capacité`.
Tout le reste est structure gouvernée — les panneaux natifs indésirables sont retirés (FR-007).
