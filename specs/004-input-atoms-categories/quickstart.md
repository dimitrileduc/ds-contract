# Quickstart — 004-input-atoms-categories

Pré-requis : `FIGMA_TOKEN` (lecture seule suffit), Node ≥ 20, `npm install` **dans ce
worktree** (il n'a pas de `node_modules` ; sinon `npm run eval` refuse), Chromium
Playwright pour les 2 checks visuels (`npx playwright install chromium`).

## Ordre de marche

```bash
# 0 · T0 — preuve lecture seule + audits réutilisés
#    Relevé /versions → proofs/read-only/versions.before.json
#    proofs/audits-003.md : pointeurs vers les audits 003 validés (jamais refaits)

# 1 · La catégorie (débloque tout le reste, testable sur le Button seul)
#    schéma (+category, +CATEGORY_LABELS, docs/02 bump) → emit-react title →
#    generate-catalog → dashboard ; évals category (C6/C2/tolérance) ; Button +category
npm run build && npm run golden:update   # re-pin revu : titres stories + catalog

# 2 · Spike Input (de-risque la chaîne entière sur 1 atome)
npm run extract:figma:rest -- "<url DS·Atomes node Input>" --target "<nom master>"
npm run extract:figma -- extract/out/figma/rest-dump.json
#    review → adopt contracts/input.contract.json (v1.0.0, category atom)
npm run build && npm run parity
#    + subject visuel Input (vérifie le support mono-COMPONENT de l'instrument)

# 3 · Textarea, Select (même chaîne) ; spike Checkbox (coche : dump fait foi — D7)

# 4 · Icônes 13→16
npm run extract:figma:rest:svg <fileKey> <manifest.json> assets/icons   # facebook/instagram/star
#    registre v1.1.0 (+3, componentName verbatim) ; Button v1.5.0 (enum 16 forcé par le
#    gate) ; refresh snapshots parity (LECTURE) ; divergence menu-13 acquittée si remontée

# 5 · Clôture
npm run build && npm run parity          # zéro finding actif
npm run eval                             # compte vivant ; quarantaine : réactivations nommées
npm run plugin:check
npx tsx scripts/deterministic-roundtrip.mjs
node scripts/core-browser-check.mjs
npx tsc --noEmit && npx tsc -p tsconfig.build.json
npm run extract:figma:visual -- --write-baseline   # re-pin revu (4 subjects ajoutés)
#    re-relevé /versions → versions.after.json + attribution.md (SC-004)
```

## Vérifier le résultat (les Independent Tests de la spec)

- `npm run storybook` → 5 composants sous **Atoms** (aucun groupe à plat résiduel).
- `npm run dashboard` → Contract Hub groupé par catégorie.
- `import { Input, Textarea, Select, Checkbox } from …` → même niveau de preuve que
  Button (gates ci-dessus tous verts).
- `contracts/icons.registry.json` → 16 entrées ; `npm run parity` propre sur l'axe icônes.
- Historique de versions Figma : aucune entrée imputable à 004.

## Pièges connus (ne pas re-découvrir)

- `npm run eval` symlinke `ROOT/node_modules` → installer dans le worktree ou runner sur
  le checkout principal.
- Jointure par CLÉ jamais par nom (« Bouton » ≠ « Button » — leçon 002).
- Le fichier est VIVANT (003 y travaille) : re-mesurer au dump, les chiffres du jour font
  foi ; masters des 4 atomes gelés par accord (FR-004).
- Anciens SVG démo : artwork différent sous des noms parfois identiques — jamais réutiliser.
- Harnais visuel : cache par version de fichier → `--refresh` après toute édition Figma
  (de 003) si des rendus semblent périmés.
