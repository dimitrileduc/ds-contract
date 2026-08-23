# Interface de la projection — footer shell (023)

Ce document fige l'interface entre le dépôt gouverné et l'addon Odoo pour le footer. Il complète
[verdicts-editabilite.md](./verdicts-editabilite.md) (la gate humaine) et suit le format
`specs/022-odoo-nav-shell/contracts/odoo-projection.md`.

## 1. Entrées épinglées (lecture seule, jamais copiées)

| Contrat | Version | Rôle | Au lock avant 023 ? |
|---|---|---|---|
| `ds.footer` | 1.1.0 | racine **shell** n° 2 | non — **+1 entrée** |
| `ds.footer-column` | 1.1.0 | fermeture (repeat ×3) | non — **+1 entrée** |
| `ds.copyright` | 1.0.0 | fermeture | non — **+1 entrée** |
| `ds.piqueray-logo` | 1.0.0 | fermeture (déjà via header) | oui |
| `ds.button` | 2.0.1 | fermeture (déjà via sections) | oui |

Icônes : `facebook`, `instagram` (registre `contracts/icons.registry.json`, assets
`assets/icons/{facebook,instagram}.svg`) — inlinées dans la zone manuelle (emit-html n'émet pas
les icônes ; limite héritée de 022).

Repin : `integrations/odoo/config/inputs.lock.json` (+3 entrées, chemin + version + SHA-256).
Aucun contrat modifié ⇒ aucun autre re-pin dans le dépôt.

## 2. Racine shell

`scripts/odoo/lib/repo-data.ts` : `SHELL_CONTRACT_IDS = ['ds.header', 'ds.footer']`.
Un shell n'est PAS inscriptible comme snippet ; il n'entre pas dans la surveillance
`structure-stale` (rien n'est sauvegardé en HTML). Vérification d'implémentation : aucun script
ne suppose un shell unique.

## 3. Gabarits QWeb (zone manuelle comptée `ODOO-023-FOOTER-QWEB`)

- `piqueray_ds.footer_bar` — gabarit **standalone** : la composition complète de `ds.footer`
  (classes de `components.pqr.css` + `data-pqr-part`), une seule composition, deux hôtes (le
  layout ET le banc de mesure QA). `data-ds-contract="ds.footer"` = hook de présence du capteur,
  pas une métadonnée de version (le footer n'est jamais sauvegardé).
- `piqueray_ds.template_footer_piqueray` — hérite `website.layout`, remplace la zone footer
  native (xpath exact : **spike S1**), naît `active="False"` ; la finalisation l'active et
  désactive le footer par défaut d'Odoo (patron `template_header_piqueray`).

Composition rendue (ordre du contrat) : Background (plan absolu) · Row [ col5 ← FooterColumn ×3 ←
col1 : ordre VISUEL du contrat = ordre des parts, le gabarit rend l'ordre visuel ] · Spacer ·
Separator · spacer2 · Copyright. Le CTA passe par `t-call="piqueray_ds.pqr_button"`
(`link_href='/contactez-nous'`, `variant='outlineBlanc'`, `label='Contactez-nous'`,
`icon_right=False`).

## 4. Donnée de contenu (mécanisme décidé au spike S2, semée une fois)

| Donnée | Valeur semée (source : contrat) | Éditable par |
|---|---|---|
| texte colonne 1 | « Rue Alfred Drèze 7,  4860 Pepinster » (`repeat.sample[0].texte`) | rédacteur (P9) |
| texte colonne 2 | horaires (`repeat.sample[1].texte`) | rédacteur (P9) |
| texte colonne 3 | contact (`repeat.sample[2].texte`) | rédacteur (P9) |
| texte copyright | défaut de `ds.copyright.texte` | rédacteur (P11) |
| URL Facebook | profil Piqueray (fourni à la livraison) | rédacteur (O1, réglage) |
| URL Instagram | profil Piqueray (fourni à la livraison) | rédacteur (O2, réglage) |

Garde d'idempotence `ir.config_parameter` (patron `hooks.py`) — semis UNE fois, jamais re-semé,
jamais écrasé par update ou régénération. Les titres (« Adresse », « Horaires », « Contact ») et
« Suivez-nous » sont dans le gabarit, pas dans la donnée (P10/F9 : figés).

## 5. Sorties générées (jamais à la main)

`static/src/css/generated/{tokens,components,fonts}.pqr.css` via `npm run odoo:assets`
(fermeture élargie : + footer, footer-column, copyright). `derivation-report.json` via
`odoo:derivation:check`. Toute retouche = `tampered`.

## 6. Configuration de décision (après validation de la gate)

- `integrations/odoo/config/footer.authoring.json` — la table validée, transcrite (schéma 019 ;
  si un `mechanism` nouveau est requis — `native-settings`, `inline-field` — l'enum du schéma
  019 est étendue **additivement**, geste 022/`native-menu`).
- `integrations/odoo/config/adaptation-registry.json` — +`ODOO-023-*` (§D8 de la recherche).

## 7. Preuves attendues

`specs/023-odoo-footer-shell/proofs/` : `spike-footer.json`, `spike-persistance.json`,
`spike-social.json` (AVANT le QWeb) ; puis `footer-visual/` + `footer-visual.json` (SC-001),
`footer-edit.json` (SC-002/003), `footer-update.json` (SC-004), `footer-pages.json` (SC-005,
header + 10 sections intacts), `footer-regen.json` (SC-006), et `RAPPORT-CLOTURE.md`.
