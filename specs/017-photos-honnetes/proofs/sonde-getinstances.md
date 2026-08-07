# T005 — sonde `getInstancesAsync`, en LECTURE SEULE

**Date** : 2026-08-06 · **Fichier client visé** : `d9FYAUcqdcNtsuaMgLefvJ` · **Route** : pont desktop figma-console (`figma_execute`, port 9223)

## Verdict

```
verdict: "empeche"
```

**Un contrôle empêché n'est jamais un contrôle vert** (FR-015). La sonde reste **due**.

## La raison, mesurée et non supposée

La prémisse écrite au dépôt (`51cab06`, 2026-08-06) est « pont figma-console déconnecté ».
**Elle est fausse aujourd'hui, et la vraie raison est différente** — c'est pourquoi elle est
relevée ici plutôt qu'héritée.

`figma_get_status` avec `probe: true` rend :

```
transport.active           : "none"
websocket.serverRunning    : false
websocket.startupError     : { code: "EADDRINUSE", port: 9223,
                               message: "All ports in range 9223-9232 are in use" }
setup.failureLayer         : 1
setup.probeResult          : { success: false, latencyMs: 1,
                               error: "Cannot read properties of null (reading 'sendCommand')" }
```

Et le relevé système (`lsof -nP -i TCP:9223-9232`) montre que **Figma Desktop est bien lancé et
le plugin Desktop Bridge bien ouvert** : le processus Figma (pid 34658) tient des connexions
`ESTABLISHED` vers 9223, 9224, 9225, 9226, 9228, 9229 et 9232, plus deux `CLOSE_WAIT` (9227, 9230,
9231 — des serveurs devenus orphelins).

**Donc : le pont n'est pas mort, il est saturé.** Dix instances concurrentes de
`figma-console-mcp` occupent toute la plage de ports, et le serveur MCP de *cette* session n'a
pas pu s'en réserver un. La sonde est **empêchée par un épuisement de ressource local**, pas
refusée par l'API Figma, pas coupée par un pont absent.

### Ce qui n'a délibérément pas été fait

Tuer les serveurs occupant les ports aurait probablement libéré la voie (deux au moins sont
orphelins : Figma a fermé leur connexion). **Ce geste n'a pas été posé** : ces processus
appartiennent à d'autres sessions vivantes de l'utilisateur — une autre branche est ouverte en
parallèle dans ce dépôt (`018-odoo-replique-manuelle`). Casser l'outillage d'une autre session
pour débloquer la sienne n'est pas une décision d'agent.

**Le geste, si l'owner veut la sonde** : libérer un port de la plage 9223-9232
(`pkill -f figma-console-mcp` ferme *toutes* les instances, y compris celles des autres sessions
— préférer fermer une session inutilisée), puis relancer un appel d'outil, le serveur MCP se
rattache automatiquement.

## Les trois questions, et leur état

| # | Question (research D1) | État |
|---|---|---|
| 1 | `getInstancesAsync` existe et rend les instances de page du maître | **non mesuré** |
| 2 | Elle les rend **après** `loadAllPagesAsync` | **non mesuré** |
| 3 | Le coût de parcours reste sous le seuil de saturation (≈ 5 350 nœuds font tomber le plugin) | **non mesuré** |

Le script était prêt et n'a pas pu partir (`quickstart.md` §1) :

```js
// LECTURE SEULE — aucune mutation
await figma.loadAllPagesAsync();
const comp = await figma.getNodeByIdAsync('<maitre porteur de photos>');
const t0 = Date.now();
const insts = await comp.getInstancesAsync();
return { existe: typeof comp.getInstancesAsync === 'function', n: insts.length, ms: Date.now() - t0 };
```

## Ce que le chantier fait de ce verdict

**Issue 3 de T005, appliquée telle qu'écrite** : US1 démarre, sur le repli nommé — jamais sur un
`getInstancesAsync` non mesuré, jamais en attente non plus. Motif inchangé : *le sans-tête fait
foi*, et suspendre le MVP à une indisponibilité d'outillage transformerait une panne locale en
blocage produit.

Concrètement, l'émetteur est écrit avec **deux voies nommées**, et la frontière entre les deux
est écrite dans le code :

1. **Voie éprouvée (par défaut sans le pont)** — le registre orchestré
   `globalThis.__dsc_photos` : l'orchestrateur relève les photos d'instance avant le lot et les
   passe au script. Forme **déjà éprouvée au dépôt** :
   `specs/016-canvas-vrai/proofs/repose/photos-instances.json` (14 sections, 97 photos).
   Faiblesse à dire : elle exige un relevé frais avant chaque lot, donc elle ne protège pas une
   régénération lancée sans l'orchestrateur.
2. **Voie API (empruntée si et seulement si la méthode est exposée)** —
   `await comp.getInstancesAsync()`, bornée **au maître reconstruit**, jamais au fichier. Cette
   branche est **NON MESURÉE sur le fichier client** au 2026-08-06 : le code le dit en toutes
   lettres à l'endroit où il la prend.

La bascule complète vers `getInstancesAsync` — c'est-à-dire le droit de s'y **fier** — reste
conditionnée à cette sonde. Quand elle passera, ce sera une amélioration additive avec sa propre
preuve, jamais une dette silencieuse.

## Conséquence sur les tâches

- **T010** (le faux-Figma modélise `getInstancesAsync`) : modélisé d'après l'**API publiée**
  (les instances du maître, après `loadAllPagesAsync`) — ce qui est documenté, pas ce qui est
  mesuré au vif. La distinction est écrite dans le commentaire in-situ du mock : ce que le mock
  prouve, c'est que le moteur emprunte correctement la voie ; ce qu'il ne prouve pas, c'est que
  le fichier client la rend.
- **T013** (le harvest descend aux instances) : implémenté sur les deux voies, la voie éprouvée
  d'abord.
- **Phase 6** (le reçu vif) : de toute façon suspendue à la même fenêtre owner et à la
  précondition FR-005. La sonde y repassera naturellement.
