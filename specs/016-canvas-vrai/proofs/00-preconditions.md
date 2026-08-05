# T003 — Préconditions matérielles de la première fenêtre

**Date du relevé** : 2026-08-05 · **Worktree** : `/Users/dlstudio/.superset/projects/ds-contract-016`

Tous les chiffres ci-dessous sont **relevés**, jamais recopiés depuis `plan.md`,
`research.md` ou `tasks.md`. Deux d'entre eux contredisent l'annonce des documents de
planning : ils sont consignés tels quels (§V — le compte vif fait foi), et détaillés
dans `decisions.md` § Faits d'ouverture.

---

## 1 · Le pont figma-console

```
figma_get_status { probe: true }
```

| Fait | Valeur relevée |
|---|---|
| Transport | WebSocket Bridge, `setup.valid: true` |
| Sonde active | `probeResult { success: true, latencyMs: 2 }` |
| **Port** | **9232** ⚠️ — *les documents annoncent 9223* |
| Fichier connecté | `Piqueray (Copy)` |
| **fileKey** | **`d9FYAUcqdcNtsuaMgLefvJ`** ✅ conforme |
| Version du plugin | 1.39.0 |
| Page active à la connexion | `DS · Organisms` |

**Écart nommé (O-1)** : le port **9232** au lieu de 9223. Cause mesurée : 17 sessions
Claude Code ouvertes sur le poste, chacune démarrant un `figma-console-mcp` qui prend
le premier port libre à partir de 9223 (9223→9229 occupés au relevé). Le fallback est
un comportement normal du serveur. **Le port se relève à chaque fenêtre, il ne se
recopie pas.**

Confirmation croisée que le bon fichier répond, lue depuis le sandbox du plugin :

```js
figma.fileKey   // → "d9FYAUcqdcNtsuaMgLefvJ"
figma.root.name // → "Piqueray (Copy)"
```

## 2 · Accès à la page `Pages` (210:325)

`figma.loadAllPagesAsync()` exécuté **avant** tout accès (seule route vers cette page) :

| Page | id | enfants |
|---|---|---|
| **Pages** | **`210:325`** | **9** ← les 9 maquettes du périmètre |
| `----------------------` | `2171:7347` | 1 |
| DS · Tokens | `2051:951` | 1 |
| DS · Atomes | `2052:1144` | 8 |
| DS · Molécules | `2052:1145` | 15 |
| DS · Organisms | `2052:1146` | 17 |
| Référence — Avis Google (aplat, conservé) | `2178:7380` | 1 |

7 pages au total. Les 9 enfants de `Pages` concordent avec le périmètre annoncé par le
plan ; l'inventaire complet par POSITION est l'objet de **T004**, pas de cette tâche.

## 3 · Le receveur de captures

```bash
node extract/figma/page-parity/receiver.mjs .page-parity/00-etalonnage/a 9231
```

| Fait | Valeur relevée |
|---|---|
| `instrument` | `page-parity` ✅ |
| **`nonce` de session** | **`949076dc2fa22410`** — *pinné pour tout le jeu de capture d'étalonnage* |
| `outDir` | `/Users/dlstudio/.superset/projects/ds-contract-016/.page-parity/00-etalonnage/a` |
| `startedAt` | `2026-08-05T14:11:30.366Z` |
| **Port** | **9231** ⚠️ — *les documents annoncent 9227* |

**Écart nommé (O-2)** : le port **9231** au lieu de 9227. Le port 9227 était occupé par
un `figma-console-mcp` sur `[::1]` (IPv6) **et** par un receveur page-parity zombie du
2026-07-27 sur `127.0.0.1` (IPv4). Le manifest du plugin autorise toute la plage
`http://localhost:9223` … `9232` (vérifié dans `~/.figma-console-mcp/plugin/manifest.json`),
donc 9231 est un port légitime ; `receiver.mjs` et `capture.js` prennent tous deux le
port en paramètre — **aucune ligne de code n'a été modifiée** (le plan exige
`page-parity` réutilisé *tel quel*).

### Pourquoi ce détail n'est pas cosmétique

`receiver.mjs:145` écoute en **IPv4 seulement** (`server.listen(port, '127.0.0.1')`)
tandis que `capture.js:52,87` appelle `fetch('http://localhost:' + port + …)`, que macOS
résout en **IPv6 d'abord**. Un serveur étranger sur `[::1]:<même port>` intercepte donc
le trafic destiné au receveur.

**Le garde-fou a tenu, et c'est le fait à retenir** : `capture.js:58-61` refuse si
`health.instrument !== 'page-parity'`, `:68` refuse sur nonce différent — **avant**
l'envoi du moindre octet. Le durcissement posé par 005/007 fonctionne. Le risque était
un blocage franc, jamais une capture silencieusement détournée.

## 4 · La chaîne complète, prouvée de bout en bout

Le maillon qui compte n'est pas que le receveur réponde à `curl`, mais que **le sandbox
du plugin** le joigne. Vérifié en lecture seule via `figma_execute` :

```js
const r = await fetch('http://localhost:9231/health');
// → { instrument: "page-parity", nonce: "949076dc2fa22410", outDir: "…/00-etalonnage/a" }
// erreurFetch: null
```

| Maillon | Verdict |
|---|---|
| MCP → pont → Figma desktop | ✅ probe 2 ms |
| Pont → bon fichier client | ✅ `d9FYAUcqdcNtsuaMgLefvJ` |
| Plugin → page `Pages` 210:325 | ✅ 9 maquettes |
| **Plugin → receveur (9231)** | ✅ `instrument`+`nonce` conformes, `erreurFetch: null` |
| Receveur → disque | ✅ `outDir` dans le worktree, gitignoré |

## 5 · Ce que cette tâche ne prouve pas

- **Le plancher de bruit** : c'est **T005** (étalonnage ×2, veto). Rien n'autorise une
  écriture tant que ce N/N `identical` n'est pas obtenu.
- **Le périmètre de capture** : c'est **T004** (relevé par POSITION).
- **La stabilité du port dans le temps** : une nouvelle session Claude Code démarrée
  pendant un cycle prendrait 9230 puis 9231 en IPv6 et ferait **refuser** le cycle
  (refus franc, pas corruption). Limite nommée : *le port se re-vérifie à l'ouverture
  de chaque fenêtre*, et le nonce se re-pinne à chaque jeu de capture.
