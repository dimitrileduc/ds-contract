# Quickstart — Externalisation Piqueray (spec 003)

Comment tourne un incrément, du checkpoint au commit. Prérequis : Figma **desktop**
ouvert sur `Piqueray (Copy)` avec le pont figma-console connecté ; un checkout avec
`node_modules` (`npm install`).

## Mise en place (une fois, phase T0)

```bash
# 1. L'instrument se prouve lui-même (fixtures, sans Figma)
npm run pages:selftest                       # exit 0 obligatoire

# 2. Sonde du transport capture (live) — ordre R3 : outil MCP nodal → base64 par
#    tranches (globale persistée) → bandes par slices. Le transport retenu est
#    consigné dans proofs/T0-calibration/.

# 3. Étalonnage : double capture SANS opération → 9/9 identical exigé
npm run pages:compare -- --before .page-parity/cal-1 --after .page-parity/cal-2 \
  --out specs/003-externalize-figma-components/proofs/T0-calibration
# bruit propre ≠ 0 → STOP programme, retour owner
```

T0 committe aussi : `COMPONENT-INVENTORY.md` (baseline, depuis le checkout principal),
le scaffold `decisions.md`, l'entrée `.gitignore` pour `extract/figma/page-parity/out/`
et `.page-parity/`.

## La boucle d'un incrément (un bloc)

```text
1. RE-MESURE      scan.js via le pont → inventory/scan-<date>.json
                  (le dernier scan fait foi ; bloc introuvable → reporte + journal)
2. AUDIT          structure + usage par position → audits/<bloc>.md
                  (anomalie hors périmètre → proposition owner, jamais de correction silencieuse)
3. CHECKPOINT     saveVersionHistoryAsync("003/<bloc>/master")
4. MASTER         construit propre sur sa page DS · <niveau> : nom vrai, couleurs aux
                  variables, propriétés officielles, description, zéro dépendance tierce
5. VALIDATION     owner — par composant (net-new / inférés) ou lot de niveau (extractions
                  simples) → entrée decisions.md (pas d'entrée, pas de suite)
6. CAPTURE BEFORE 9 maquettes fraîches → .page-parity/<bloc>/before/
7. CHECKPOINT     saveVersionHistoryAsync("003/<bloc>/adoption")
8. ADOPTION       copies → instances sur les 9 maquettes ; personnalisations détectées
                  AVANT remplacement, appliquées en overrides → ledger/<bloc>.json
9. CAPTURE AFTER  9 maquettes fraîches → .page-parity/<bloc>/after/
10. PREUVE        npm run pages:compare -- --before … --after … --out proofs/<bloc>/
                  · exit 0 (9/9 identical)            → incrément prouvé
                  · exit 1 (écart chiffré)            → présenter à l'owner :
                       accepté → entrée ecart-pixel-accepte au journal (chiffres + raison)
                       refusé  → ROLLBACK (voir plus bas), incrément en échec
                  · exit 2 (refus : capture vide/dimensions) → la preuve n'a PAS eu
                       lieu — corriger la capture, jamais compter « identique »
11. COMMIT        verdict + ledger + entrée journal + inventaire à jour, ensemble
```

**Complétude bloquante (FR-012)** : une adoption n'est « faite » que si le ledger est
complet (`npm run pages:ledger:check` vert) **ET** la preuve pixel passée — les deux,
jamais l'un des deux. Le pixel-gate attrape la perte visuelle ; le ledger attrape la
perte d'intention.

Les atomes **net-new** (Input, Textarea, Select, Checkbox, icônes) s'arrêtent à
l'étape 5 : rien à adopter (aucune copie à remplacer) — leurs pixels seront prouvés aux
adoptions de leurs parents (Field, Formulaire, Footer…).

## Rollback (FR-017 — geste manuel, guidé)

1. Figma desktop → menu fichier → **Show version history**.
2. Restaurer le checkpoint nommé (`003/<bloc>/<étape>`) pris avant l'opération.
3. Vérifier : capture fraîche des 9 maquettes vs les `before/` de l'opération annulée →
   `pages:compare` doit rendre 9/9 `identical` (US5.2).
4. Consigner l'échec + le retour arrière au journal.

Il n'existe **aucune API de restore programmatique** — c'est un geste humain, assumé.

## Ordre du programme (rappel)

```text
T0 harnais → T tokens (odeurs : space/radius, imported.orange-* ; nav/state proposé en
report — touche le Button, exclu) → A atomes (2 lots net-new) → M molécules (13 + les
inférés) → S sections (16, triviales d'abord, composites en dernier) → clôture
```

## Clôture (fin de programme)

```bash
# scan final : zéro copie brute restante d'un bloc externalisé (SC-003)
# puis sweep des gates AU STATU QUO sur le checkout principal (eval ne tourne pas en worktree) :
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && node scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && tsc -p tsconfig.build.json
# attendu : 94/97 evals (bloc intentionnel connu), parity 1 finding déclaré, le reste vert
```
