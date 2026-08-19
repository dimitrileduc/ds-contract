# T001 — Worktree autonome (Constitution, Worktree Gates F1)

**Date** : 2026-08-19 · **Worktree** :
`/Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/2-others`

Versions et commandes consignées **sans claim de résultat** (le sweep complet, dont
`npm run eval`, tourne dans ce worktree à chaque checkpoint et à la clôture — T033).

## Outillage relevé

| Outil | Version |
|---|---|
| node | v24.14.0 |
| npm | 11.9.0 |
| playwright (CLI) | 1.62.1 |
| docker | 29.2.1 |
| docker compose | 5.0.2 |

## Commandes exécutées

```bash
npm install                      # node_modules absent en worktree neuf → installé
npx playwright install chromium  # 8 builds chromium déjà en cache global, vérifiés
```

- `tsx` présent après `npm install` (`node_modules/.bin/tsx`) — le runner `npm run eval`
  symlinke le `node_modules` du checkout ; il refuse sans cette étape.
- Chromium épinglé disponible dans le cache Playwright global
  (`~/Library/Caches/ms-playwright/`) — deux contrôles pilotent un vrai Chromium.

## Écart nommé (honnêteté §V) — `.env.example` gitignoré

`integrations/odoo/qa/.env.example` **n'est pas suivi par git** : le `.gitignore` du
dépôt porte un motif `.env*` trop large qui l'attrape. Dans un worktree neuf, le fichier
est donc absent, et `npm run odoo:module:check` échoue (« compose.yaml ou .env.example
absent »). Reconstruit localement depuis `compose.yaml` (aucun secret ; images épinglées
identiques au lock). Constat pré-existant à 022, indépendant de la vague ; nommé ici plutôt
que découvert comme une surprise.
