# Gestes L3 — Liaisons de valeurs (T036-T044)

**Cycle** : `007/tokens/L3-liaisons`  
**Diff attendu** : **0 pixel** (lier une variable portant la valeur déjà rendue ne déplace aucun pixel)  
**Périmètre** : 43 cibles (9 maquettes + DS · Atomes 5 + DS · Molécules 13 + DS · Organisms 16)  
**Planification** : `decisions.md` § "Plan de liaison T036-T044" + dry-run complet validé 2026-07-26

---

## Résumé du contenu

| Partie | Action | Compte |
|---|---|---|
| Correctif E | `font/family/montserrat` : `"Montserrat, sans-serif"` → `"Montserrat"` | 1 correction |
| Nouvelles primitives | `font/line-height/32` (val 32) + `space/597` (val 597) | 2 créations |
| Liaisons canaux numériques | itemSpacing / padding (par côté) / strokeWeight / fontSize / fontWeight / lineHeight / cornerRadius / opacity / minHeight | **247** liaisons individuelles |

**Décompte par canal (post-dry-run)** :

| Canal (field Figma) | Liaisons |
|---|---|
| itemSpacing | 55 |
| paddingTop/Right/Bottom/Left | 21 × 4 = 84 |
| fontWeight | 46 |
| lineHeight | 44 |
| strokeWeight | 8 |
| fontSize | 5 |
| cornerRadius | 3 |
| opacity | 1 |
| minHeight | 1 |
| **Total** | **247** |

---

## Écarts vs plan initial (193 → 247 → final 247)

- **259 → 247** : 1 doublon retiré (`form/row 2` = même nœud que `form/row`) + 11 paths invalides post-L1
  (paths renommés ou restructurés en US1, valeur non trouvée sur le nœud live) :
  - `CategoriesPrincipales:item 2/*` — aucun frame `item 2` dans aucun variant
  - `Header:nav-wrapper/nav/Lien actif` et `/Lien` — enfants de `nav` = INSTANCEs `NavItem`, pas calques `Lien`

Ces 12 éléments sont des **notes du relevé E non bindables sur le canvas live post-L1**.  
Ils ne sont pas perdus — le relevé de notes post-tokenisation (T050) les détectera toujours ; c'est
une limite d'accès structurelle (INSTANCE imbriquée), documentée ici et reportée à `RAPPORT-CLOTURE.md`.

---

## Exécution

**Script A (geste 1/2)** : Correctif E + 2 primitives + liaisons entrées 0–122 (123 liaisons)  
**Script B (geste 2/2)** : liaisons entrées 123–246 (124 liaisons)

Exécutés dans le même `figma_execute` asynchrone, en séquence, entre le AVANT×43 et le APRÈS×43.

---

## Dry-run résultats

- **Batch 1** (41 paires) : 41/41 ✓  
- **Batch 2** (40 paires) : 39/40 ✓ (1 échec `item 2/Item2Decor` → dropé)  
- **Batch 3** (41 paires) : 34/41 ✓ (7 failures → `item 2/*` × 5 + `nav/Lien*` × 2 → dropés)  
- **Final** : **247 bindings**, **115 paires (setId, path) uniques**, **0 path invalide restant**
