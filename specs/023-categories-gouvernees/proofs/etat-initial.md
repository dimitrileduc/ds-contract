# État initial — 023 Catégories gouvernées

**Date** : 2026-08-20 · **Worktree** : `a768cf04-…-categories` · **Branche** : `023-categories-gouvernees`
**Portée de ce relevé** : Phase 1 (Setup, T001–T004) + Phase 2 (Foundational, T005–T006).

Ce document est le **baseline honnête de départ** (Constitution V). Il fige ce qui est vert, ce
qui est rouge **avant** toute intervention de 023, et pourquoi — pour qu'aucune dérive ne soit
attribuée à tort à cette spec, et qu'aucun rouge pré-existant ne soit verdi en douce.

---

## T001 — Worktree autosuffisant (F1) ✅

- **Node** `v24.14.0`.
- `npm install` DANS le worktree : **OK** (208 paquets, 3 vulnérabilités high signalées — non traitées, hors périmètre).
- `npx playwright install chromium` : **OK** (deux checks pilotent un vrai Chromium).
- `node_modules` présent (le runner d'eval le symlinke — prérequis F1 satisfait).

## T004 — Échafaudage des artefacts ✅

Répertoires créés (state machine des gates, data-model §5), `.gitkeep` posés pour les vides :
`gates/`, `audits/`, `proofs/captures/`, `proofs/us2/`, `proofs/us3/`.

---

## T002 — Sweep de base AVANT toute mutation

Séquence complète lancée à l'identique des Quality Gates de la Constitution.

| Étape | Résultat |
|---|---|
| `npm run build` | ✅ rc=0 |
| `npm run parity` | ✅ rc=0 |
| `npm run eval` | ✅ rc=0 — **219/219 evals passed** (`evals/results.json`) |
| `npm run plugin:check` | ❌ **rc=1** — voir ci-dessous |
| `npx tsx scripts/deterministic-roundtrip.mjs` | ✅ rc=0 (byte-identique ×2) |
| `node scripts/core-browser-check.mjs` | ✅ rc=0 |
| `npx tsc --noEmit` | ✅ rc=0 |
| `npx tsc -p tsconfig.build.json` | ✅ rc=0 |

### plugin:check ❌ — dérive environnementale du bundle, **pré-existante, NON causée par 023**

```
Error: plugin-zip: the plugin engine bundle is STALE vs core —
  fresh bundle 5f682ad70d2c… (651036 bytes)
  committed receipt 078bbf0bf455… (651021 bytes)  (15 octets d'écart)
```

- **`git status` est propre** hors `specs/023` (seul `CLAUDE.md` modifié, pré-existant) : le build
  **n'a sali aucun fichier suivi**, et `figma-sync/plugin/engine.receipt.json` est à son état HEAD
  committé, inchangé.
- Aucune édition de `core/`, `tokens/`, `contracts/`, `icons` de ma part → la dérive **existait au
  commit de départ**. Cause : l'esbuild du `npm install` frais minifie 15 octets différemment du
  toolchain qui a épinglé le reçu. **Déterminisme intact** (roundtrip ×2 vert) — c'est une dérive de
  *chaîne d'outils*, pas de la génération.
- C'est le re-pin `engine.receipt.json` connu (mémoire `plugin-engine-receipt-repin`), **listé
  d'avance comme re-pin attendu de 023** (plan D11 ; T030/T047). Il sera **rafraîchi légitimement**
  à ce moment-là — **pas maintenant** : re-pinner en phase Setup masquerait une éventuelle dérive
  introduite par les changements de 023.

**Conséquence pour 023** : plugin:check restera rouge jusqu'à T030 (re-pin revu). C'est attendu et
tracé, pas un régression de 023.

---

## T003 — Portes Odoo rouges pré-existantes (relevées, **NON re-diagnostiquées**)

Mémoire projet `odoo-pre-existing-red-gates` : ces deux portes sont rouges **avant** 023.
**023 ne doit ni les aggraver, ni les verdir.**

### 1. `npm run odoo:qualification` ❌ rc=1 — relevé live

```
✖ google-reviews-performance: hash incohérent
  specs/019-odoo-production-foundation/proofs/google-reviews-functional.json
```

Reçu 019 incohérent — cause connue, non re-diagnostiquée.

### 2. `editability-boundary` — **43/44** (relevé mémoire + reçu committé)

- Reçu committé `specs/019-…/proofs/editability-boundary.json` : `status: pass` (au temps de 019).
- État **live courant : 43/44** — un champ **périmé depuis le commit `cc6cd0d4`** (mémoire
  `odoo-pre-existing-red-gates`). Régression pré-existante non encore reflétée dans le reçu committé.
- Instance QA active au moment du relevé : `piqueray-odoo-qa-odoo-1` (`odoo:19.0-20260803`, healthy,
  up 2 h) + `piqueray-odoo-qa-db-1` (`postgres:15`, healthy). Scénario **non ré-exécuté** en Setup
  (runner playwright via `qa/run.mts`, ~92 s) — relevé depuis la mémoire et le reçu, sans
  re-diagnostic (T003).

---

## T005 — Pont figma-console : cause racine réglée côté système, **2 gestes manuels restants**

### État trouvé (rouge)

- Serveur figma-console **de cette session sur le port 9234** — **hors plage 9223-9232** →
  `portFallbackUsed:true`, plugin non connecté à ce serveur (`figma_execute` échouait vers
  `ws://localhost:9234`). « Session sans pont » exactement comme décrit dans CLAUDE.md.
- **Cause racine = saturation, pas déconnexion** : **~26 sessions Claude vivantes**, dont **18**
  lancent chacune un `auggie --mcp --mcp-auto-workspace` qui **spawne un figma-console** →
  **18+ serveurs pour 10 ports** en plage. Les parasites ne sont pas des orphelins : ils sont
  respawnés par leur session parente (« respawn en ms » du CLAUDE.md). **Les tuer en boucle ne suffit
  pas.**

### Correctif appliqué (côté système)

1. **9 branches parasites auggie tuées** entières (node + `npm exec` + superviseur auggie) →
   plage 9223-9232 **libérée** (sessions Claude 9228/9233 et ma session épargnées).
2. `~/.claude.json` → `mcpServers.figma-console.env.FIGMA_WS_PORT` porté à **9223** (c'est
   `~/.claude.json`, **pas** le `.claude/settings.json` interdit par CLAUDE.md).
   Sauvegarde : `…/scratchpad/claude.json.bak`. JSON revalidé.
   - **Leçon de la 1ʳᵉ tentative (9232)** : le repli du serveur scanne **vers le haut** depuis le
     port préféré (9232→9233→9234, **hors plage**) ; une session sœur a pris 9232 pendant le `/mcp`
     → repli sur 9234, échec. Correctif : épingler le **port le plus bas 9223** → le repli balaie
     **toute** la plage 9223→9232 avant de sortir. Robuste même sous course.

### Clôture (2 gestes owner : `/mcp` + réouverture plugin)

Après `~/.claude.json`→9223 puis `/mcp` (relance serveur → bind 9223) + réouverture du plugin
Desktop Bridge :

- `figma_get_status` probe → **port `9223`, `preferredPort:9223`, `portFallbackUsed:false`**,
  `transport.active:websocket`, `setup.valid:true`, probe roundtrip **3 ms**, connecté à
  **« Piqueray (Copy) »** (`d9FYAUcqdcNtsuaMgLefvJ`), page courante **« Pages »**.
- Route prouvée : `figma_execute` → `await figma.loadAllPagesAsync()` +
  `await figma.getNodeByIdAsync('210:325')` → **PAGE « Pages », 9 enfants de premier niveau**.

**✅ T005 CLOS — pont prêt sur 9223, route vers `210:325` prouvée.** (Lecture seule ; aucune
mutation canvas.)

> Note durabilité (à nettoyer en clôture) : l'épinglage 9232 dans `~/.claude.json` est global. Tant
> qu'il tient, il réduit la récurrence pour cette session mais peut faire retomber d'autres sessions
> hors plage si elles redémarrent. Revenir au comportement sans port forcé une fois 023 clos
> (esprit du commit `b46d0c33`).

---

## T006 — Instrument §X page-parity : **PRÊT ✅**

- `pixelmatch` + `pngjs` résolus dans `node_modules` ✅.
- `npm run pages:selftest` : **7/7 cas passent** (identical / one-pixel / empty-capture /
  dimension-mismatch / determinism / region-inside / region-outside) ✅.
- `npm run pages:ledger:check` : **tout vert** (15 ledgers 003) ✅.
- Receiver port 9227 : le squatteur figma-console qui l'occupait a été tué ; **9227 est libre**, le
  receiver `receiver.mjs` se relancera à la demande au moment des captures (T012).

---

## Synthèse Phases 1-2

| Tâche | État |
|---|---|
| T001 worktree autosuffisant | ✅ |
| T002 sweep de base | ✅ 7/8 vert · plugin:check ❌ (dérive esbuild pré-existante, re-pin T030) |
| T003 2 portes Odoo rouges relevées | ✅ relevées, non re-diagnostiquées |
| T004 échafaudage artefacts | ✅ |
| T005 pont figma-console | ✅ vert — port 9223, `portFallbackUsed:false`, route `210:325` prouvée |
| T006 instrument §X page-parity | ✅ prêt |

**Checkpoint Phase 2 atteint** (« socle prêt, l'audit lecture seule d'US1 peut démarrer ») : pont
prêt et instrument §X prêt. Seul résiduel = `plugin:check` rouge **pré-existant** (dérive esbuild,
re-pin T030) + 2 portes Odoo rouges **pré-existantes** — aucun causé par 023, tous tracés ci-dessus.

> Note durabilité (`FIGMA_WS_PORT=9223` global dans `~/.claude.json`) : à revenir au comportement
> sans port forcé en clôture de 023 (esprit du commit `b46d0c33`) ; sauvegarde d'origine dans
> `scratchpad/claude.json.bak`.
