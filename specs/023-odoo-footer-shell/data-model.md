# Data Model — 023 Pied de page Piqueray dans Odoo (footer shell)

**Date**: 2026-08-22 · **Spec**: [spec.md](./spec.md) · **Recherche**: [research.md](./research.md)

Aucune entité gouvernée n'est créée ni modifiée : la feature CONSOMME des contrats épinglés et
crée des entités d'**intégration** (config, gabarits, donnée client) et de **preuve**.

## 1. Entités du plan gouverné (consommées épinglées)

### 1.1 `ds.footer` @ 1.1.0 — la composition complète
- 1 prop : `items` (arrayOf {titre, texte}) — structure figée par le gabarit (verdict P1).
- Anatomie : `root` (1728px, padding 128/89/32/89, border-box) › `Background` (absolu,
  1728×459, `{color.noir-bleute}`) · `Row` (1385px, space-between ; ordre visuel = ordre des
  parts : col5, FooterColumn ×3, col1 — LIMITE NOMMÉE du contrat : reconstruction flexbox d'une
  frame sans auto-layout) · `Spacer` · `Separator` (filet blanc 1px) · `spacer2` · `Copyright`.
- Compositions : `ds.piqueray-logo` (`couleur: "blanc"`), `ds.button` (`variant: "outlineBlanc"`,
  `iconRight: false`, text « Contactez-nous »), `ds.footer-column` (repeat ×3, sample = les
  contenus réels à semer), `ds.copyright`.
- Travail reporté PORTÉ PAR LE CONTRAT, non rouvert ici : largeur du logo (180.1px relevée,
  non portée car contrat partagé avec le header).

### 1.2 `ds.footer-column` @ 1.1.0 — une colonne
Props `titre` (défaut « Adresse ») + `texte` ; parts `Titre` (orange 24px) / `Texte` (blanc
18px) ; largeur `{size.footer-column.root}` (310px) sur son PROPRE root (le parent ne restyle
pas une instance).

### 1.3 `ds.copyright` @ 1.0.0 — la mention
Prop `texte` ; part `Texte` (blanc 14px).

### 1.4 `ds.piqueray-logo` @ 1.0.0 et `ds.button` @ 2.0.1
Déjà au lock (header 022, sections 019+). Aucun changement.

### 1.5 `inputs.lock.json` — l'épinglage
+3 entrées (footer, footer-column, copyright : chemin + version + SHA-256). Modification amont
⇒ `odoo:inputs:check` rouge jusqu'au repin explicite.

### 1.6 Racines — la catégorie shell
`SHELL_CONTRACT_IDS` : `['ds.header', 'ds.footer']`. Non posable, non inscrit snippet, hors
`structure-stale`, entre dans la fermeture CSS.

### 1.7 `footer.authoring.json` — les verdicts
Transcription de la table validée à la gate ([contracts/verdicts-editabilite.md](./contracts/verdicts-editabilite.md)) :
11 props (P1–P11), 16 parts footer (F1–F16), 3 parts logo, 5 parts button, 3 parts
footer-column, 2 parts copyright, 4 contrôles hors contrat (O1–O4), `rootActions` interdits.
Zéro adresse sans verdict (`odoo:authoring:check`).

### 1.8 Adaptations manuelles — registre `ODOO-023-*`
`FOOTER-QWEB`, `CONTENUS-SEED`, `LIENS-SOCIAUX`, (`FOND-LARGEUR` seulement si la mesure
l'exige). Chaque bloc borné BEGIN/END + entrée registre (`odoo:derivation:check`).

## 2. Entités du plan client (données Odoo — jamais du balisage)

### 2.1 Contenus textuels du footer (mécanisme : spike S2)
4 valeurs texte (3 colonnes + copyright), hébergées en donnée (candidat : champs rendus par
`t-field` ; repli : `ir.config_parameter` + panneau). Propriété du CLIENT après semis :
- semées UNE fois depuis les `sample`/défauts des contrats (garde d'idempotence) ;
- éditées par le rédacteur (FR-005/FR-015) ; conservées save/reopen/public (FR-006) ;
- survivent à `-u piqueray_ds` (FR-014) — c'est la donnée, pas la vue, qui les porte.

### 2.2 URLs sociales (mécanisme : spike S3)
2 valeurs URL (Facebook, Instagram), candidat champs natifs `website.social_*`, éditées via les
Réglages du site. Une URL vide ne retire pas l'icône (limite nommée D12).

### 2.3 État d'activation des gabarits
Notre `template_footer_piqueray` actif / footer par défaut d'Odoo inactif — basculé par la
finalisation (hook/migration), idempotent.

## 3. Entités de preuve

| Artefact | Contenu |
|---|---|
| `proofs/spike-{footer,persistance,social}.json` | relevés mécanisme sur l'instance épinglée, sources Odoo citées fichier:ligne |
| `proofs/footer-visual{/,.json}` | mesure image référence emitHtml vs capture Odoo (SC-001) |
| `proofs/footer-edit.json` | edit→save→reopen→public (SC-002/003) |
| `proofs/footer-update.json` | édition puis update module → contenu intact (SC-004) |
| `proofs/footer-pages.json` | footer partout, header + 10 sections intacts (SC-005) |
| `proofs/footer-regen.json` | variation token → visible requête suivante, textes intacts (SC-006) |
| `proofs/RAPPORT-CLOTURE.md` | ce qui tient, ce qui reste ouvert, nommé |

## 4. Relations (vue d'ensemble)

```text
contrats épinglés (lock +3)
   └─ npm run odoo:assets ──▶ components.pqr.css (fermeture + footer/column/copyright)
        └─ footer_bar (QWeb manuel compté) ── lit ──▶ donnée contenus (S2) + URLs sociales (S3)
             ├─ hôte 1 : website.layout (template_footer_piqueray, xpath S1) → chaque page
             └─ hôte 2 : banc QA (piqueray_ds_qa) → sujet visuel footer.mts
verdicts (gate humaine) ──▶ footer.authoring.json ──▶ authoring.js (panneaux retirés, FR-007)
```
