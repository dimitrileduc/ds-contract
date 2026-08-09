# Reçu T001 — autonomie du worktree

**Tâche**: T001 (Phase 1 — Setup)
**Date d'exécution**: 2026-08-08
**Worktree**: `/Users/dlstudio/.superset/worktrees/a768cf04-a778-45a9-88b5-46c1b736a486/soapy-duckling`
**Branche**: `019-odoo-production-foundation`
**HEAD**: `cf19196c820ba289e582b0ee641c9937d73d1f20`

Ce fichier consigne **les commandes exécutées et les versions observées**. Conformément à T001, il
ne porte **aucun claim de résultat** : il n'affirme pas que le worktree est qualifié, ni que le
sweep constitutionnel passerait. Ces verdicts appartiennent à T074.

## 1. Commandes exécutées

Exécutées depuis la racine du worktree, dans cet ordre, en une seule session :

```bash
npm install
npx playwright install chromium
```

Code de sortie de la séquence : `0`.

### Sortie `npm install`

```text
changed 1 package, and audited 212 packages in 1s

53 packages are looking for funding
  run `npm fund` for details

3 high severity vulnerabilities

To address all issues, run:
  npm audit fix

Run `npm audit` for details.
```

**Non résolu, consigné tel quel** : `npm install` signale *3 high severity vulnerabilities*. Aucun
`npm audit fix` n'a été exécuté — le corriger modifierait l'arbre de dépendances hors périmètre de
019 et invaliderait le lock d'entrées avant même qu'il existe (T010).

### Sortie `npx playwright install chromium`

La commande a émis un avertissement puis s'est terminée sans erreur :

```text
WARNING: It looks like you are running 'npx playwright install' without first
installing your project's dependencies.
[…]
If your project does not yet depend on Playwright, first install the
applicable npm package (most commonly @playwright/test) […]
```

## 2. Versions observées

| Élément | Version observée |
|---|---|
| Node.js | `v24.14.0` |
| npm | `11.9.0` |
| TypeScript (`node_modules`) | `6.0.3` |
| tsx | `4.23.0` |
| Zod | `4.4.3` |
| `playwright-core` (pin dépôt) | `1.61.1` |
| `pixelmatch` | `7.2.0` |
| `pngjs` | `7.0.0` |
| Docker (client / serveur) | `29.2.1` / `29.2.1` |
| Plateforme Docker | `linux/x86_64` |

## 3. Deux écarts observés, ni corrigés ni masqués

### 3.1 `npx playwright` n'est pas le Playwright du dépôt

`npx playwright --version` répond **`1.62.1`**, alors que le dépôt épingle **`playwright-core@1.61.1`**.
La commande prescrite par T001 a donc piloté un Playwright résolu par npx, distinct de celui que les
instruments du dépôt consomment. Le dépôt ne dépend pas de `playwright`/`@playwright/test` — d'où
l'avertissement ci-dessus, qui est exact.

### 3.2 La révision Chromium réellement consommée était déjà présente

`playwright-core@1.61.1` déclare (`node_modules/playwright-core/browsers.json`) attendre la révision
Chromium **`1228`** (`installByDefault=true`). Le cache `~/Library/Caches/ms-playwright/` contenait
**avant** l'exécution :

```text
chromium-1217  chromium-1223  chromium-1228  chromium-1234
chromium_headless_shell-1217  …-1223  …-1228  …-1234
```

La révision `1228` — celle que les instruments du dépôt utiliseront — y figurait déjà. Ce reçu ne
peut donc pas attribuer à `npx playwright install chromium` la disponibilité de Chromium ; il
constate que la révision requise était présente avant et après.

**Conséquence à retenir pour T020 et les scénarios QA** : la convention du dépôt
(`README.md:95`, `CLAUDE.md:61`) offre `PLAYWRIGHT_CHROMIUM_PATH` comme voie explicite. Si un
instrument de 019 échoue à trouver un navigateur, la cause à écarter en premier est ce décalage
`1.62.1` / `1.61.1`, pas une absence de Chromium.

## 4. Ce que ce reçu ne dit pas

- Il ne dit pas que `npm run eval`, `npm run build` ou le sweep constitutionnel passent : aucun n'a
  été exécuté par T001.
- Il ne dit pas que l'image Odoo du snapshot est disponible localement : Docker répond, l'image
  épinglée n'a pas été tirée à cette étape (elle l'est par T003 / T020).
- Il ne dit pas que les 3 vulnérabilités signalées sont sans effet sur 019.
