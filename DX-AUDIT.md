# Audit DX Claude — CLAUDE.md / speckit / skills / MCP / hooks / mémoire

Date : 2026-07-24 · Méthode : 3 agents (① doc officielle Claude Code, ② audit config locale, ③ audit speckit) puis synthèse critique.
Statut : **LOT IMPLÉMENTÉ 2026-07-24** (plan approuvé) — zone machine appliquée ; zone repo appliquée et **en attente de relecture owner avant commit**. Gates re-vérifiés après édition : 8/8 verts, eval 102/102.
Légende décision : ✅ décidé · ⏸️ reporté · ❌ écarté.

## Exécution (2026-07-24)

- **Zone repo (non committé, relecture attendue)** : perms rm purgées + allowlist gates migrée vers `.claude/settings.json` versionné (carve-out `.gitignore`) ; CLAUDE.md réécrit (96 lignes, zéro compte, headers gérés préservés) ; constitution **1.1.0** (Principe VIII + Worktree Gates F1 + gates corrigés) ; plan-template (8ᵉ checkbox, v1.1.0, bloc gates) + tasks-template (T001 F1) ; prose durable déplacée vers `docs/handoff/10-history.md` (2 sections specs 001/002) ; collatéraux README + handoff 07/09 + repointage demo-archive.
- **Zone machine (actif à la prochaine session)** : 3 skills déplacés (branch-review + code-review → iot-platform ; branch-review-workflows → kuzzle) ; plugins claude-seo/rust-analyzer/subframe → off, vercel on ; marketplace superpowers retirée (CLI) ; allowlist purgée (Grep, Glob, 7× notebooklm) ; `effortLevel: low` supprimé (→ défaut) ; ralph masqué (`disable-model-invocation`) ; `disabledMcpServers` ×10 posé sur ce projet dans `~/.claude.json` (5 serveurs MCP + 5 connecteurs claude.ai). Backups horodatés `~/.claude/backups/*.dx-20260724-182058`.
- **Vigilance** : `~/.claude.json` peut être réécrit par une session active à sa fermeture — re-vérifier `disabledMcpServers` à la prochaine session (commande jq dans le plan) ; réappliquer depuis le backup si écrasé.

## Tableau de décision

| #  | Sujet                                                      | Prio | Effort estimé | Décision |
|----|------------------------------------------------------------|------|---------------|----------|
| 1  | Permissions `rm` destructives figées (spec 001)            | 🔴   | 5 min         | ✅ Supprimer les 3 entrées |
| 2  | CLAUDE.md projet périmé (« 51 contracts », 102/102 ×3)     | 🔴   | ~1h           | ✅ **Réécriture complète** (< 200 lignes, inclut #10) |
| 3  | Constitution périmée (146 vs 102, gates faux, principe absent) | 🔴 | 30 min      | ✅ Amendement 1.1.0 complet (+ principe VIII, + plan-template) |
| 4  | Bug numérotation `create-new-feature.sh` + ménage branches | 🔴   | 15–25 min     | ⏸️ Plus tard (acté, hors lot) |
| 5  | Skills globaux d'autres repos (212K / 356K)                | 🟠   | 20 min        | ✅ Virer branch-review + branch-review-workflows + code-review (→ leurs repos) ; garder les 2 skills Vue en global |
| 6  | MCP : 9 serveurs user-scope + connecteurs claude.ai partout | 🟠  | 15 min        | ✅ Désactivation ciblée pour CE projet (jasper/magic/obsidian/linear/trigger off) ; user scope conservé |
| 7  | Plugins hors sujet (claude-seo, rust-analyzer, marketplace vide) | 🟠 | 10 min    | ✅ claude-seo + rust-analyzer + subframe off par défaut ; vercel reste ; marketplace superpowers retirée |
| 8  | Hooks : git-ai ×2/tool call, notebooklm orphelin, Grep/Glob contradictoire | 🟠 | 10 min | ✅ Purger notebooklm + retirer Grep/Glob de l'allowlist ; git-ai ×2 : conservé tel quel |
| 9  | Mémoire : 1 fichier = 51KB = 60 % du dossier               | 🟠   | —             | ❌ Garder tel quel (choix owner) |
| 10 | `## Recent Changes` = zone tronquée (prose périssable)     | 🟡   | inclus dans #2 | ⏳ |
| 11 | Doctrine gates-en-worktree non standardisée (003 vs 004)   | 🟡   | inclus dans #3 | ✅ Constitution (amendement 1.1.0) + T001 standard dans tasks-template |
| 12 | Verbes speckit morts ici (sync.*, verify.run, taskstoissues) | 🟡 | —             | ✅ Acté sans action (ne pas les invoquer ici) |
| 13 | Leviers officiels non utilisés (settings projet, rules/, effortLevel…) | 🟡 | 25 min | ✅ 3 retenus : settings.json projet, disable-model-invocation, effortLevel → défaut ; `.claude/rules/` non retenu |

## Ce qui est bien (on ne touche pas)

- CLAUDE.md global minuscule (963 octets, un seul sujet : routage auggie) — conforme à l'esprit doc officielle.
- Hook auggie à dégradation propre : pas de `jq` ou pas d'`auggie` → exit 0, jamais de blocage dur.
- Chaîne speckit complète avec `handoffs:` entre verbes et pins de modèles délibérés (opus-4-8 : specify/analyze/implement · sonnet-5 : tasks · fable-5 : plan) — routage coût/qualité, retouché le 23/07.
- Constitution avec gates exécutables + « Constitution Check » obligatoire dans `plan-template.md`.
- Mémoire auto par projet réellement utilisée (14 projets avec dossier memory sur la machine).
- Les specs archivent leurs preuves (003 : 9,6M de proofs PNG/JSON) — lourd mais c'est le produit.

---

## Détail par point

### 1. 🔴 Permissions destructives figées

**Constat** — `.claude/settings.local.json` (projet, 14 entrées allow) contient encore les 3 one-shots de spec 001 :
`rm -f tokens/modes/brand.aurora.tokens.json…`, `rm -f contracts/*.contract.json`, `rm -rf src/components/*`.
N'importe quelle session peut effacer le contrat Button **sans prompt**.
**Reco** — supprimer les 3 entrées ; option : ajouter un `deny` explicite sur les chemins critiques.
**Décision** — ✅ 2026-07-24 : supprimer les 3 entrées (sans deny supplémentaire).

### 2. 🔴 CLAUDE.md projet décrit un repo disparu

**Constat** — `CLAUDE.md` projet : 14 442 octets (~3,5–4k tokens chargés à chaque session).
- « 51 contracts » ×3 (intro, commentaire `npm run build`, Architecture) et « 282 DTCG tokens » ×2, « brand modes → light/dark » — réel sur disque : **1 contrat** (`button.contract.json`) + `icons.registry.json`, 3 fichiers tokens single-mode. Le fichier se contredit lui-même (Recent Changes 001 documente la suppression).
- « 102/102 » répété 3× (+1× en mémoire) alors que le fichier prescrit lui-même le grep-sync.
- Doublons internes : faits demo-archive ×2, leçon Button ×2.
**Reco** — corriger les faits, ne garder le compte d'evals qu'à UN endroit (les autres → « `npm run eval` imprime le N/N vivant »), dédupliquer. Option : réécriture complète visant < 200 lignes (guidance officielle).
**Décision** — ✅ 2026-07-24 : **réécriture complète** — état Piqueray actuel, viser < 200 lignes, compte d'evals à un seul endroit, prose durable sortie de Recent Changes (#10 traité ici). Relecture owner avant commit.

### 3. 🔴 Constitution périmée mais autoritaire

**Constat** — `.specify/memory/constitution.md` v1.0.0 (207 lignes, 11 636 octets), ratifiée 2026-07-22, **jamais amendée**, et se déclare « en cas de conflit, ce document fait foi ». Trois divergences :
1. « currently 146 checks » — réel : 102.
2. Gates faux : `node scripts/deterministic-roundtrip.mjs` (casse — il faut `npx tsx`) et `tsc -p` nu (il faut `npx tsc -p`).
3. **Le principe source-cleanliness** (règle owner 2026-07-23, la leçon Button) est absent — il n'existe que dans CLAUDE.md.
`plan-template.md` répète les mêmes commandes fausses + exemples « 51 contracts, 282 tokens » → chaque nouveau plan hérite du périmé.
**Reco** — amendement 1.1.0 : sync gates + comptage, + principe VIII source-cleanliness, + répercussion `plan-template.md`. (Le point 11 — doctrine worktree — peut entrer dans le même amendement.)
**Décision** — ✅ 2026-07-24 : amendement 1.1.0 complet (gates + comptage + principe VIII + plan-template). Sort du #11 à confirmer au round 3.

### 4. 🔴 Bug numérotation speckit — localisé à la ligne

**Constat** — `.specify/scripts/bash/create-new-feature.sh:118` : `sed 's/^[* ]*//'` ne strippe pas le préfixe `+ ` des branches en worktree → le regex ancré `^[0-9]{3,}-` (ligne 127) les ignore. Vérifié : depuis main, le script proposerait **003** alors que 003 et 004 existent. Contributeurs secondaires : le scan `specs/` ne voit que le checkout courant ; branches parasites `03` (→ `3f60f5b`) et `004` (→ `de82b19` = tip de main) échappent aussi au regex ; worktree fantôme `…/worktrees/ds-contracts-poc/003` (branche `003` = merge PR #1, **aucun spec 003 dedans**).
**Reco** — fix une ligne : `s/^[*+ ]*//` ; + ménage : supprimer branches `03` et `004`, retirer le worktree fantôme `003`. Option robustesse : scanner aussi les `specs/` des worktrees (`git worktree list`).
**Décision** — ⏸️ 2026-07-24 : plus tard, hors lot. Contournement en vigueur : vérifier/corriger le numéro à la main après chaque `/speckit.specify` (gotcha déjà en mémoire).

### 5. 🟠 Skills globaux appartenant à d'autres repos

**Constat** — 212K sur 356K (60 %) du poids skills user-scope cible d'autres stacks :
`branch-review` 76K (iot-platform, target `4-dev`) · `branch-review-workflows` 84K (kuzzle-plugin-workflows, target `1-dev`) · `code-review` 36K (iot-platform) · `figma-svg-to-vue` + `uipro-to-code` 16K (stack Vue/UIPro).
Les descriptions de 13 skills sur 14 sont offertes au matcher dans **chaque** session de **chaque** projet (seul `deep-review` est masqué via `disable-model-invocation`).
**Reco** — déplacer chaque skill dans le `.claude/skills/` de son repo (les deux repos cibles existent sur la machine et ont déjà leur dossier memory).
**Décision** — ✅ 2026-07-24 (confirmé) : **virer du global `branch-review`, `branch-review-workflows` ET `code-review`** — déplacés dans le `.claude/skills/` de leurs repos (iot-platform ×2, kuzzle ×1), pas supprimés. **Restent en global** : `figma-svg-to-vue` et `uipro-to-code` (Vue = stack transverse, souvent utile même hors de ce projet).

### 6. 🟠 MCP : tout en scope user, rien en scope projet

**Constat** — 9 serveurs user-scope chargés partout : auggie, context7, figma, figma-console, jasper, linear, magic, obsidian, trigger. + connecteurs claude.ai (Ahrefs ≈100 outils, Gmail, Spotify, Google Drive, Calendar…) visibles dans ce repo design-system. Scope projet : `.mcp.json` absent, `mcpServers` projet = `{}`, listes d'activation vides.
Pertinents ici : figma-console, figma, auggie, context7.
**Reco** — scoper par projet (`.mcp.json` versionné ou config par projet) ; sortir jasper/magic/obsidian/linear/trigger du user scope ; débrancher les connecteurs claude.ai non-dev des sessions Code (se gère côté claude.ai). Mesure du coût réel : `/context` et `/mcp`.
**Décision** — ✅ 2026-07-24 : **désactivation ciblée** — le user scope reste tel quel, mais jasper/magic/obsidian/linear/trigger sont désactivés pour CE projet. Connecteurs claude.ai : non tranché (côté claude.ai, hors CLI).

### 7. 🟠 Plugins hors sujet injectés partout

**Constat** — 4 plugins user-scope tous actifs : claude-seo 1.9.6 (**24 skills + 18 types d'agents** dans chaque session), rust-analyzer-lsp (aucun Rust ici), vercel, subframe (4 skills + 2 serveurs MCP). Marketplace `superpowers` enregistrée avec **0 plugin installé**.
**Reco** — désactiver claude-seo + rust-analyzer hors de leurs contextes (réactivation à la demande) ; retirer la marketplace vide.
**Décision** — ✅ 2026-07-24 (complété) : claude-seo + rust-analyzer + **subframe** désactivés par défaut (réactivation à la demande dans les projets concernés) ; **vercel reste actif** ; marketplace superpowers retirée.

### 8. 🟠 Hooks et permissions : trois nettoyages

**Constat** — dans `~/.claude/settings.json` :
1. `git-ai checkpoint` tourne **2× par tool call** (matcher `*` en PreToolUse ET PostToolUse) — latence sur chaque outil si non voulu.
2. **7 entrées `mcp__notebooklm__*`** dans l'allowlist pour un serveur configuré nulle part.
3. `Grep`/`Glob` figurent dans `allowedTools` alors que le hook auggie les deny quand auggie résout — contradiction. (Doc officielle : préférer `permissions` aux hooks pour bloquer un outil ; ici la logique conditionnelle — fallback si auggie absent — justifie de garder le hook.)
Aussi : `notify.sh` sur 7 événements (guardé `|| true` — OK, on garde).
**Reco** — purger notebooklm ; vérifier/dédoublonner git-ai ; retirer Grep/Glob de l'allowlist (le hook reste seul juge).
**Décision** — ✅ 2026-07-24 : purger les 7 entrées notebooklm + retirer Grep/Glob de l'allowlist. git-ai ×2 par tool call : **conservé tel quel** (non retenu par l'owner).

### 9. 🟠 Mémoire : un fichier-journal de 51KB

**Constat** — dossier mémoire projet : 12 fichiers, 85 225 octets. `piqueray-reconversion-state.md` = **50 952 octets (60 %)** — un journal multi-specs, contraire au modèle « un fait par fichier ». Son entrée d'index dans MEMORY.md ≈ 3,3KB (censée être une ligne). Doublons mémoire ↔ CLAUDE.md : closures 001/002, hashes demo-51 (`0e37de2`), nav-state, commit ids.
**Reco** — splitter par spec (001/002/003/004 + règles standing), une ligne par entrée d'index, purger les doublons avec CLAUDE.md.
**Décision** — ❌ 2026-07-24 : **garder tel quel** (choix owner). Point de vigilance restant : MEMORY.md est chargé à hauteur de ses 200 premières lignes / 25KB — surveiller la croissance de l'index.

### 10. 🟡 Recent Changes est une zone tronquée

**Constat** — `update-agent-context.sh` (838 lignes, invoqué par `/speckit.plan`) réécrit exactement 2 sections de CLAUDE.md : `## Active Technologies` (append dédupliqué) et `## Recent Changes` — **tronquée à 3 puces à chaque run** (nouvelle + 2 anciennes conservées). La longue puce 002 actuelle sera éjectée au 2e plan. Détail : la création de nouveaux fichiers agent est cassée ici (`agent-file-template.md` absent) — seul le mode update fonctionne.
**Reco** — ne plus investir de prose durable dans Recent Changes ; les faits durables → `docs/handoff/` ou mémoire. Se traite avec le point 2.
**Décision** — ⏳ (couplée au #2)

### 11. 🟡 Doctrine gates-en-worktree non standardisée

**Constat** — 003 : « eval sur le checkout principal + dérogation écrite au PR » (`plan.md:33`, `tasks.md:256`). 004 : doctrine inversée F1 — `npm install` + Chromium **dans le worktree**, sweep final dedans (`tasks.md:30`, `tasks.md:150`). La doctrine résolue (004) n'est écrite dans aucun document standard — chaque spec la redécouvre.
**Reco** — inscrire la doctrine F1 dans l'amendement constitution (#3) et/ou le `tasks-template.md` pour que le T001 des futures specs soit standard d'office.
**Décision** — ✅ 2026-07-24 : **les deux** — principe dans l'amendement 1.1.0 (avec le #3) + T001 standard (install + Chromium dans le worktree, sweep final dedans) dans `tasks-template.md`.

### 12. 🟡 Verbes speckit morts dans ce repo

**Constat** — `speckit.sync.*` (5 fichiers) et `speckit.verify.run` référencent `.specify/extensions/` et des variantes PowerShell absentes du repo ; `speckit.taskstoissues` référence un MCP `github/github-mcp-server` configuré nulle part. Ils misfireront si invoqués ici. (Commands user-scope : 22 fichiers, 4 255 lignes.)
**Reco** — soit acter sans action (ne pas les invoquer ici), soit purger/scaffolder.
**Décision** — ✅ 2026-07-24 : **acté sans action** — on ne les invoque pas dans ce repo ; ils restent disponibles pour les repos équipés des extensions.

### 13. 🟡 Leviers officiels non utilisés

**Constat / Reco** — quatre leviers de la doc officielle absents du setup :
- **`.claude/settings.json` projet versionné** : partager l'allowlist des gates (`npm run *`, `npx tsx *`, `npx tsc *`…) au lieu du `.local` perso.
- **`disable-model-invocation: true`** sur les skills à déclenchement manuel (seul deep-review l'a) — coût contexte zéro tant que non invoqué.
- **`.claude/rules/`** (règles chargées par chemin) pour dégraisser la section Architecture de CLAUDE.md si besoin.
- **`effortLevel: "low"`** dans les settings globaux — étonnant pour un repo à preuves ; vérifier que c'est un choix.
**Décision** — ✅ 2026-07-24 : **3 leviers retenus** — (a) `.claude/settings.json` projet versionné avec l'allowlist des gates ; (b) `disable-model-invocation: true` sur les skills à déclenchement manuel (liste exacte à valider à l'implé : ralph, speckit-brief, image-diff, getCommitMsg, capture-page…) ; (c) `effortLevel` low → valeur par défaut. **`.claude/rules/` : non retenu.**

---

## Lot d'implémentation (scopé, PAS exécuté)

### Zone repo ds-contracts-poc (~2h, relectures owner incluses)
1. **(#1)** `.claude/settings.local.json` : supprimer les 3 permissions `rm` de spec 001 — 5 min.
2. **(#2 + #10)** Réécriture complète du CLAUDE.md projet : état Piqueray actuel, < 200 lignes, compte d'evals à UN endroit, prose durable sortie de Recent Changes → `docs/handoff/` — ~1h. **Relecture owner avant commit.**
3. **(#3 + #11)** Constitution → 1.1.0 : gates + comptage synchronisés, principe VIII source-cleanliness, doctrine worktree F1 ; répercussion `plan-template.md` (commandes + exemples) ; T001 standard (install + Chromium en worktree, sweep dedans) dans `tasks-template.md` — ~45 min. **Relecture owner.**
4. **(#13a)** Créer `.claude/settings.json` projet versionné avec l'allowlist des gates (`npm run *`, `npx tsx *`, `npx tsc *`, `node scripts/core-browser-check.mjs`…) — 10 min.

### Zone machine ~/.claude (~1h)
5. **(#5)** Déplacer `branch-review` + `code-review` → repo iot-platform, `branch-review-workflows` → repo kuzzle-plugin-workflows (`.claude/skills/` de chacun) — 20 min.
6. **(#7)** Désactiver par défaut claude-seo, rust-analyzer-lsp, subframe (réactivation à la demande) ; retirer la marketplace superpowers vide ; vercel reste — 10 min.
7. **(#6)** Désactiver jasper, magic, obsidian, linear, trigger pour CE projet (user scope inchangé) — 10 min.
8. **(#8)** Purger les 7 entrées `mcp__notebooklm__*` ; retirer `Grep`/`Glob` de `allowedTools` — 5 min.
9. **(#13b)** `disable-model-invocation: true` sur les skills à déclenchement manuel (liste à valider au moment de l'implé) — 10 min.
10. **(#13c)** `effortLevel: "low"` → valeur par défaut dans les settings globaux — 1 min.

### Reportés / écartés / actés sans action
- **#4** numérotation `create-new-feature.sh` : ⏸️ plus tard — contournement : vérifier le numéro à la main après chaque `/speckit.specify`.
- **#9** mémoire : ❌ garder tel quel (choix owner).
- **#12** verbes speckit morts : ✅ actés, on ne les invoque pas ici.
- Non retenus : deny `rm` supplémentaire (#1), `.claude/rules/` (#13), dédoublonnage git-ai ×2 (#8), connecteurs claude.ai (hors CLI, non tranché).

---

## Références (doc officielle vérifiée le 2026-07-24)

- Memory / CLAUDE.md : code.claude.com/docs/en/memory — cible < 200 lignes, hiérarchie managed>user>projet>local, imports `@path` (4 sauts max), auto-memory (MEMORY.md : 200 premières lignes / 25KB chargés).
- Skills : /docs/en/skills — descriptions chargées à chaque session, corps au déclenchement ; `disable-model-invocation` = coût zéro.
- Subagents : /docs/en/sub-agents — isolation de contexte, `tools`/`model`/`skills` en frontmatter.
- Hooks : /docs/en/hooks — pour effets de bord déterministes ; bloquer un outil = plutôt `permissions`.
- MCP : /docs/en/mcp — précédence local > projet > user ; scoper par projet ; `/mcp` pour le coût.
- Settings : /docs/en/settings — précédence managed > CLI > local > projet > user.
- Version installée : Claude Code 2.1.217.
