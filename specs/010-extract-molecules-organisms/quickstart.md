# Quickstart — scénarios d'intégration (spec 010)

**Préconditions** : worktree auto-suffisant (`npm install` + `npx playwright install chromium`
dedans), `FIGMA_TOKEN` exporté (lecture + export SVG), pont figma-console disponible (lecture).

## Scénario 0 — baseline verte (F1)

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
# Attendu : 8/8 vert sur les 7 composants existants avant toute adoption.
```

## Scénario 1 — L0 : registre d'icônes 16 → 19

```bash
# 1. Re-vérifier les identités live des 3 icônes (snapshot peut être stale)
# 2. Acquérir les SVG (manifest nodeIds → assets/icons/)
npm run extract:figma:rest:svg
# 3. contracts/icons.registry.json : +3 entrées, version 1.1.0 → 1.2.0, dumpedAt rafraîchi
npm run build        # si le gate d'exactitude refuse sur Button → élargir iconLeftGlyph/iconRightGlyph (minor), même commit
npm run parity       # axe icons vert
npm run eval         # C5 re-pointée sur le compte vivant (19)
```

## Scénario 2 — adopter UNE molécule (le geste répété 27 fois)

Exemple : **Field** (`extract/out/figma/field.contract.proposed.json`).

```bash
# 1. Lire la proposition + sa section dans figma-proposals.md (notes, UNBOUND)
# 2. Re-confirmer le master live (re-mesure ; audit 003/005 réutilisé — research D4)
# 3. Review : sémantique confirmée ; prop principale → children/value ;
#    DÉCISION SLOT `Saisie` tranchée et nommée (contracts/eval-revival.md §C) ;
#    chaque unbound → token existant ou canal `literals`
# 4. Adoption : contracts/field.contract.json
#    version 1.0.0 · category "molecule" · semantics.provenance "extracted" · anchors.figma.dumpedAt
npm run build                                        # génère src/components/Field/* + barrel
npm run figma:plan && npm run catalog && npm run verify:catalog
git rm <orphelins figma-sync> && npm run golden:update   # même commit revu (006 T037)
npm run parity                                       # zéro écart actif
# +1 entrée dans extract/figma/visual-parity/subjects.ts puis :
npm run extract:figma:visual && npm run extract:figma:visual -- --write-baseline
```

**Vérification développeur (US2)** :

```tsx
import { Field, Input } from '@ds-contracts/...';   // barrel src/components/index.ts (généré)
<Field etat="normal" label="Libellé"><Input /></Field>
// Storybook : story auto-découverte sous "Molecules/Field" ; Contract Hub : groupe Molecules.
```

## Scénario 3 — fin de lot : sweep complet (L1…L5)

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
# Tout vert → lot suivant. Rouge → STOP (contracts/extraction-workflow.md §5).
```

## Scénario 4 — clôture : réactivation d'évals + périmètre

```bash
# 1. Pour chaque cas de contracts/eval-revival.md §A (+ C si slot Field adopté) :
#    déplacer le bloc evals/legacy-cases.ts → evals/run.ts ; retirer la ligne REMOVED-CASES ;
#    re-pointer les chaînes de fixture sur le sujet Piqueray si besoin.
npm run eval     # compte vivant monte ; quarantaine descend — chaque retrait nommé
# 2. Table de périmètre figée : 34 contractualisés (ou écart nommé) + 4 exclus grid/embed
#    + 19 icônes (registre) + 1 doublon (Bouton) = total du fichier, aucun orphelin.
# 3. Rapport de clôture : compte vivant final, dette adjacente triée (§D), compteurs re-sync.
```

## Scénario 5 — cas de secours (STOP conditions)

| Situation | Geste |
|---|---|
| Proposition obsolète (master renommé/déplacé) | re-dump ciblé : `npm run extract:figma:rest -- "<url>" --target "<Master>"` puis `npm run extract:figma -- extract/out/figma/rest-dump.json` — nommé au journal |
| Défaut de source révélé (§VIII) | capture avant de TOUTES les cibles (§X) → correction source → proposition régénérée → reprise scénario 2 |
| Capacité non couverte (grid/embed/repeat-variante) | reclassement exclu avec motif par organisme (`perimeter-table.md` §C) — jamais de contournement |
| Bug live-only du canvas | fix en deux parties : émetteur + mock (`scripts/plugin-engine-mock-figma.mjs`) — Constitution VII |
