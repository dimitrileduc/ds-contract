# Interface Contract — Extension du registre d'icônes 16 → 19 (FR-014a)

**Type** : extension de données, semver **minor** — `contracts/icons.registry.json` `1.1.0 → 1.2.0`.
Widening = minor (règle interface 002 §icon-registry). Les 16 entrées existantes ne sont PAS
touchées. `source.dumpedAt` rafraîchi à la date d'exécution.

## 1. Les 3 entrées ajoutées

| `name` (kebab, `^[a-z][a-z0-9-]*$`) | `figma.componentName` (verbatim, relu au dump) | `figma.key` / `nodeId` (re-vérifiés live — clés stables, noms non) | `asset` | `size` |
|---|---|---|---|---|
| `external-link` | `ExternalLink` | `a3820c3581b97b107cf1b3f34af63bb7d284978c` / `9:185` | `external-link` | mesurée (20/32) |
| `mail` | `Mail` | `a31ac0893475dd12f3dd806b54c1cd86acf2776e` / `263:2125` | `mail` | mesurée |
| `octicon-chevron-down12` | `OcticonChevronDown12` | `effda951d950a7ab05d4745ab1ab90cca8da3176` / `6:119` | `octicon-chevron-down12` | mesurée |

`description` : reprise du master Figma (champ obligatoire du schéma `IconEntrySchema`).

## 2. Acquisition des SVG (pipeline 002 existante, zéro outillage nouveau)

```bash
# manifest : [{ "id": "9:185", "name": "external-link" }, { "id": "263:2125", "name": "mail" },
#             { "id": "6:119", "name": "octicon-chevron-down12" }]
npm run extract:figma:rest:svg    # Figma images API format=svg, déterministe ; FIGMA_TOKEN requis
# → assets/icons/{external-link,mail,octicon-chevron-down12}.svg
```

**Vigilance nommée** : `bakeCurrentColor()` ne remplace que `#26282C` (= `color/noir-bleute`).
Si l'une des 3 icônes porte une autre peinture : review nommée — soit la peinture se lie à la
même variable, soit l'icône est déclarée couleur fixe avec description (précédent `star` orange).
Un rendu refusé par l'API est nommé `[svg-unavailable]` et bloque (exit 1), jamais silencieux.

## 3. Couplages obligatoires (traités dans L0, research D6)

1. **Gate d'exactitude des enums** (`scripts/generate-components.ts:139-148`) : tout enum de prop
   INSTANCE_SWAP recouvrant le registre doit l'égaler EXACTEMENT (« ni plus ni moins »). Après
   l'ajout, `npm run build` peut refuser par nom sur `iconLeftGlyph`/`iconRightGlyph` du Button →
   élargir les enums du Button aux 19 entrées (**minor bump** du contrat `ds.button`) — même
   commit revu.
2. **Éval C5** `lower-icon-swap-and-visibility-into-props` : l'assertion « enum == registre (13) »
   est re-pointée sur le compte vivant (19) — jamais de count codé en dur laissé en place (II).
3. **Éval C3** `detect-icon-registry-divergence` : vérifie que le retrait d'une entrée produit
   les deux findings attendus — rien à éditer (générique), à garder verte.

## 4. Vérifications (toutes existantes — pas de script à côté, 002 D4)

| Vérification | Commande |
|---|---|
| Registry shape + assets existent + exactitude enums | `npm run build` |
| Registry ↔ assets ↔ canvas (axe icons) | `npm run parity` |
| Évals C2/C3/C5 | `npm run eval` |
| Round-trip déterministe (lit `assets/icons/` dynamiquement) | `npx tsx scripts/deterministic-roundtrip.mjs` |
| Couverture visuelle icônes | sujet existant `button-with-icons` (pas de sujet par icône — décision 002 D10) |

## 5. Hors périmètre (rappel)

Aucune icône **nouvelle** (non présente sur le canvas) ; aucune autre entrée au-delà des 19 ;
pas de sujet visuel par icône.
