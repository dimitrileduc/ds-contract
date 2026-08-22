# Quickstart — 022 odoo-production-wave-b

## 0. Pré-requis (worktree F1)

```bash
npm install
npx playwright install chromium
```

## 1. Le gate d'abord

Lire les deux tables en tête de `plan.md` (copies machine : `contracts/*.editable-scope.json`).
Tant que le registre du gate n'affiche pas **VALIDÉE** pour une section, aucune tâche
d'authoring de cette section ne démarre (SC-001).

## 2. Instance de qualification (jetable, épinglée)

```bash
cp integrations/odoo/qa/.env.example integrations/odoo/qa/.env
docker compose -f integrations/odoo/qa/compose.yaml --env-file integrations/odoo/qa/.env up -d
# images : odoo:19.0-20260803 (tag daté) + postgres:15 (limite ODOO-LIMIT-PG-TAG, assumée)
```

Le healthcheck prouve que le serveur écoute — l'installation de `piqueray_ds` est un verdict de
scénario, pas du healthcheck.

## 3. Boucle de portage (par section, après validation de SA table)

```bash
# 1) racines + repin (fermeture 15 → 18 contrats, graphDigest recalculé)
#    scripts/odoo/lib/repo-data.ts : ROOT_CONTRACT_IDS += ds.coordonnees, ds.reassurances
npm run odoo:inputs:check          # rouge tant que le lock n'est pas repinné explicitement

# 2) config d'authoring exhaustive (transcription de la table validée)
npm run odoo:authoring:check       # zéro verdict manquant, sélecteurs root-scopés

# 3) spike des mécanismes incertains AVANT le QWeb (022 : bloc Tél/Email)
npx tsx integrations/odoo/qa/scenarios/coordonnees-spike.spec.mts

# 4) QWeb + panneaux + actions + ponts — chaque bloc manuel marqué ODOO-022-* et enregistré
npm run odoo:derivation:check      # bloc↔entrée de registre, 1:1, sans chevauchement

# 5) assets régénérés (jamais à la main) + preuves
npm run odoo:assets
npm run odoo:assets -- --check     # tampered = rouge
```

## 4. QA d'une section (instance propre, pose fraîche)

```bash
npx tsx integrations/odoo/qa/scenarios/coordonnees.spec.mts
npx tsx integrations/odoo/qa/scenarios/reassurances.spec.mts
```

Chaque scénario couvre : pose, rendu par défaut, w-auto à 1728 **et** 1440 (zéro débordement,
racine ET enfants), éditions autorisées, tentatives interdites (geste de texte direct compris),
gestes de collection (Réassurances), isolation (2 pages + 2 instances même page), persistance
save/reopen/public. Reçus → `specs/022-odoo-production-wave-b/proofs/`.

## 5. Delta visuel contre la référence 020

```bash
npx tsx integrations/odoo/qa/visual/render-html.mts --measure --subjects integrations/odoo/qa/visual/subjects/coordonnees.mts
npx tsx integrations/odoo/qa/visual/compare.mts --subjects integrations/odoo/qa/visual/subjects/coordonnees.mts
# idem reassurances.mts — tout écart non nul : chiffré + attribué à une cause nommée (SC-003)
```

## 6. Qualification de la vague (US3)

```bash
# non-régression : rejeu des 8 sections + bancs transversaux
npm run odoo:module:check          # versions/lock/digest ancrés sur les 10 racines
npm run odoo:visual:selftest -- --strict
npm run odoo:qualification

# sweep dépôt complet (constitution — trivialement stable, exécuté quand même)
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
npm run odoo:typecheck             # integrations/ est HORS du tsconfig racine
```

## Rappels qui mordent

- **Jamais** d'édition sous `static/src/css/generated/` — perdue au prochain build ET porte rouge.
- Un bloc posé est une **copie figée** : la QA se fait sur pose fraîche ; une mise à jour
  d'addon ne repropage rien (limite documentée, pas cachée).
- Les sections se posent **sans src** d'images : les photos de production entrent par le
  rédacteur (dialogue média, `/web/image`).
- Le pont figma-console n'est pas utilisé par cette spec (Figma en lecture zéro).
