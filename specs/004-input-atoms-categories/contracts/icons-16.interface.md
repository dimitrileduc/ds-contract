# Interface — Le jeu d'icônes gouverné 13 → 16

## 1. `contracts/icons.registry.json` v1.0.0 → v1.1.0 (élargissement = minor)

```jsonc
// +3 entrées (clés/nodeIds/componentName RELUS au dump du jour — jamais recopiés d'ici) :
{ "name": "facebook",  "figma": { "componentName": "<verbatim>", "key": "<dump>", "nodeId": "<dump>" }, "asset": "facebook",  "size": 32, "description": "Facebook logo — social links." },
{ "name": "instagram", "figma": { "componentName": "<verbatim>", "key": "<dump>", "nodeId": "<dump>" }, "asset": "instagram", "size": 32, "description": "Instagram logo — social links." },
{ "name": "star",      "figma": { "componentName": "<verbatim ex. Étoile>", "key": "<dump>", "nodeId": "<dump>" }, "asset": "star", "size": "<dump>", "description": "Star — ratings. Intrinsically orange (color/orange): does NOT recolor via currentColor, unlike the other governed icons." }
```

- `name` canonique anglais (`^[a-z][a-z0-9-]*$` — « Étoile » vit dans `componentName`).
- `source.dumpedAt` mis à jour.

## 2. Assets (`assets/icons/`)

- `+ facebook.svg`, `+ instagram.svg` : export REST `format=svg` du fichier réel ; fills
  noir-bleuté → bake `#26282c → currentColor` standard.
- `+ star.svg` : même export ; le bake ne matche pas (orange) → **couleur littérale
  conservée, voulu** (truthful aux deux surfaces, nommé au registre).
- Interdit : tout tracé repris de l'ancien jeu démo (artwork différent).

## 3. `contracts/button.contract.json` v1.4.0 → v1.5.0

- `+ category: "atom"`.
- `iconLeftGlyph`/`iconRightGlyph` : enum 13 → 16 + `values` complétées — FORCÉ par le
  gate build « enum chevauchant le registre = exactement le registre ».
- Master « Bouton » INCHANGÉ : son menu `preferredValues` reste à 13. Si l'axe
  figma⟷contract remonte cette divergence → findings acquittés dans
  `parity/baseline.json` (décision owner enregistrée) + mise à jour du menu léguée
  nommément à la prochaine itération d'écriture (gates 003).

## 4. Vérification (l'axe icônes EXISTANT — aucun nouvel instrument)

- 16 entrées vérifiées registre ↔ `assets/icons/` ↔ snapshot canvas (par CLÉ) — les
  snapshots parity sont rafraîchis en LECTURE (script d'inventaire existant) pour
  inventorier les 3 nouveaux masters.
- Toute divergence = finding nommé `ahead`/`behind`/`mismatch` — jamais silencieuse.
- **Extension nommée (D7, si retenue)** : classe « glyphe interne consommé par un
  contrat » — `check.svg` (Checkbox) est hors registre mais consommé par un `icon.asset`
  fixe → pas un orphelin ; un asset ni registre ni consommé reste un finding. Éval avant
  claim. Repli : finding acquitté en baseline.

## Critères (US4)

- SC-003 : 16 entrées, chacune vérifiée sur les 3 surfaces.
- FR-019 : zéro édition Figma (masters déjà créés par 003).
- SC-008 : compteurs cités (13→16) synchronisés au compte vivant des outils.
