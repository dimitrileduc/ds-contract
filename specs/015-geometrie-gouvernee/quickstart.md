# Quickstart — Géométrie gouvernée (015)

## 0. Worktree autosuffisant (constitution, Worktree Gates F1)

```bash
git worktree add ../ds-contract-015 015-geometrie-gouvernee
cd ../ds-contract-015
npm install
npx playwright install chromium          # 2 contrôles pilotent un vrai Chromium
```

Toute la sweep — y compris `npm run eval` — tourne DANS le worktree, à chaque checkpoint et à la clôture.

## 1. L'« avant » — re-mesure dans la fenêtre (FR-011), AVANT tout changement

```bash
npm run extract:figma:visual                                    # rows.json frais (relevé pleine précision) — à enchaîner sous 120 min
npx tsx extract/figma/organism-audit/tools/build-registre.mts \
  --phase avant --out-dir specs/015-geometrie-gouvernee/proofs/registre   # SANS --out-dir, il écrase l'avant.json de 014 (D11, T003)
npm run measure:gate                                            # état v1 archivé (7 contract-geometry)
npx tsx extract/geometry-gate/run.ts --json > proofs/ouverture-geometrie.json  # une fois la porte écrite : le relevé T0 (~260 attendu, le vif fait foi)
```

## 2. La boîte d'abord (FR-004) — puis re-mesure des 9

```bash
# core/emit-react.ts : règle box-sizing (D1) → régénérer + re-pins
npm run build
node scripts/update-golden.mjs                                  # 1er reçu : evals/golden.json
node scripts/build-plugin-zip.mjs --update-engine-receipt       # 2e reçu : engine.receipt.json (`plugin:build` n'existe pas)
npx tsx examples/polaris/generate.ts && npx tsx examples/polaris/generate.ts --check   # 3e reçu : vitrine Polaris
npm run extract:figma:visual                                    # re-mesure : SEULS les 9 bougent, attribués box-model-unification
```

## 3. Le comptage v2 + les fixtures de garde (Claims Rule : rouge d'abord)

```bash
npm run eval                                # measure-gate-policy-check étendue (aggregateOf, resolvedBy)
npm run measure:gate                        # relevé d'ouverture re-lu (attendu 6 — le vif fait foi)
# corrections-013.json + contrôle de préservation : le cas d'écrasement reproduit en ROUGE, puis le contrôle refuse
# 2 cas C3 (FR-005) : côté code (var → brut ⇒ parity exit 1) ; côté canvas (copie de dump mutée ⇒ divergence rapportée)
```

## 4. Conversions et réparations (mint from-dump, jamais à la main)

```bash
# space.N manquants + size.<composant>.* (provenance en $description) → tokens/primitives.tokens.json
# littéral → référence, valeur résolue IDENTIQUE (FR-012) ; hero : 2 littéraux nommés (registre amorcé)
# logo : prop taille + {size.logo.{taille}.*} + lift vecteurs-en-% (fixture d'abord)
# réparations : Avec-CTA, texte-seo, footer (DW-004/005), coordonnees — depuis les dumps
npm run build && npm run parity && npm run eval
npx tsx extract/geometry-gate/run.ts        # invisible: doit décroître vers 0
```

## 5. Clôture

```bash
npm run extract:figma:visual                                    # re-mesure finale (même navigateur qu'en §1, sous 120 min)
npx tsx extract/figma/organism-audit/tools/build-registre.mts \
  --phase apres --out-dir specs/015-geometrie-gouvernee/proofs/registre      # puis --render pour REGISTRE.md
npm run measure:gate -- --apres specs/015-geometrie-gouvernee/proofs/registre/apres.json
                                            # contract-geometry: 0, PASS exit 0 (SC-005) — relu, jamais recopié.
                                            # SANS --apres, la porte relit l'apres.json figé de 014 (T003b).
npm run geometry:gate                       # invisible: 0 (SC-001)
# registre avant/après rendu ; toute variation attribuée (D8 data-model §8) ; causes.json : resolvedBy 015 + destination DW-014-001
```

## La sweep complète (verte à chaque checkpoint, constitution § Quality Gates)

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

## Pièges (research.md D13)

`grep -a` toujours (octet NUL dans emit-html/run.ts) · `evals/fixtures` hors tsconfig (tsc vert ≠ eval vert — lancer eval) · scratch d'eval : copie ciblée, jamais un répertoire · re-pins en revue, jamais en réflexe — **quatre lots, un par phase qui touche émetteurs/contrats/tokens** · `build-registre.mts` refuse un reçu de parité visuelle de plus de **120 min** (`--max-receipt-age-min`), donc mesure et registre dans la même fenêtre · `--out-dir` déplace aussi `attributions.json` et le `causes.json` lu par `--render` : les semer dans le dossier 015 · Figma en LECTURE SEULE de bout en bout (FR-010).
