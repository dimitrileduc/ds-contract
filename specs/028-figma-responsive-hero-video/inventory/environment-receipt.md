# Reçu environnement — Phase 1

**Feature :** `028-figma-responsive-hero-video`  
**Worktree :** `/Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/emerald-jodhpur`  
**Enregistré à :** `2026-08-25T20:32:01Z`

## Versions vérifiées

| Outil | Version / révision | Statut |
|---|---|---|
| Node.js | `v24.19.0` (exigence dépôt `>=20`) | PASS |
| npm | `11.17.0` | PASS |
| `playwright-core` local | `1.61.1` | PASS |
| Chromium Playwright | révision `1228`, Chrome for Testing `149.0.7827.55` | PASS |
| Dépendances directes npm résolues | `32` | PASS |

## Commandes exécutées

### Dépendances du dépôt

```bash
npm install
```

Résultat : exit code `0`; une dépendance locale a été ajustée, 207 packages ont
été audités. npm signale 3 vulnérabilités de sévérité haute et deux scripts
d'installation non encore allowlistés (`esbuild@0.28.1`, `fsevents@2.3.3`). Ces
alertes préexistantes sont consignées sans exécuter `npm audit fix` ni élargir le
périmètre de 028. Aucun changement de `package-lock.json` n'a été produit; la
modification de `package.json` était déjà présente dans le worktree avant T002.

### Chromium

```bash
npx playwright install chromium
node node_modules/playwright-core/cli.js install chromium
```

La première commande a terminé avec exit code `0`, mais le binaire `npx`
résolvait Playwright `1.62.1` hors des dépendances directes et a émis un
avertissement. La seconde commande utilise explicitement le CLI
`playwright-core@1.61.1` installé dans ce worktree et a téléchargé la révision
attendue `chromium-1228` ainsi que `chromium_headless_shell-1228`.

Vérification binaire :

```text
Google Chrome for Testing 149.0.7827.55
```

## Conclusion

Le worktree actif est autosuffisant pour les gates Node/TypeScript et les futures
captures Chromium. Les alertes npm sont visibles mais ne bloquent pas les tâches
de setup/fondation et aucune correction automatique de dépendance n'a été tentée.
