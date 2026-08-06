# Reçu vif (FR-002b) — `verdict: "empeche"`

**Date** : 2026-08-06 · **Fichier client** : `d9FYAUcqdcNtsuaMgLefvJ`

```
verdict: "empeche"
```

**Un contrôle empêché n'est jamais un contrôle vert** (FR-015). Ce document existe pour que
l'absence du reçu soit *dite*, pas sautée.

---

## Deux blocages, indépendants, et aucun n'est levé

### 1 · La précondition FR-005 n'est pas levée (T042)

Aucune reconstruction sur le fichier client ne démarre avant que la restauration des **62 photos
effondrées** soit **exécutée et prouvée**. Cette restauration appartient à la spec 016 :

- son plan est commité — `specs/016-canvas-vrai/proofs/repose/photos-instances.json` ;
- son **exécution attend le pont** (`51cab06` : « Exécution en attente du pont figma-console
  (déconnecté) »).

**La réserve à nommer AVANT de s'appuyer dessus**, et elle est réelle : ce plan liste les **97**
photos du relevé **sans drapeau machine** distinguant « déjà bonne » de « à reposer ». La
répartition 62/35 et le « 10 sections de 8 maquettes » ne vivent que dans le **message du commit**
`51cab06` — ils ne sont pas re-dérivables du JSON. Consigné au registre
(`D-017-PLAN-62-SANS-DRAPEAU`). Fonder une porte sur un message de commit n'est pas une porte.

### 2 · Le pont est indisponible pour cette session (T045)

Relevé le 2026-08-06, et **la raison n'est pas celle écrite au dépôt** — le pont **n'est pas
déconnecté** :

- Figma Desktop tourne (pid 34658) et le plugin Desktop Bridge est ouvert : connexions
  `ESTABLISHED` vers 9223, 9224, 9225, 9226, 9228, 9229 et 9232 ;
- mais le serveur MCP de *cette* session n'a **pas pu réserver de port** :
  `EADDRINUSE`, « All ports in range 9223-9232 are in use », `setup.failureLayer: 1`,
  `probeResult: { success: false, error: "Cannot read properties of null (reading 'sendCommand')" }`.

Dix instances concurrentes de `figma-console-mcp` occupent toute la plage. **Le pont est saturé,
pas mort.**

**Ce qui n'a délibérément pas été fait** : tuer les serveurs occupants aurait probablement suffi
(deux au moins sont orphelins — Figma a fermé leur connexion). Ces processus appartiennent à
d'autres sessions vivantes de l'owner, dont une branche ouverte en parallèle sur ce dépôt.
Casser l'outillage d'une autre session pour débloquer la sienne n'est pas une décision d'agent.

**Le geste, quand l'owner voudra le reçu** : libérer un port de la plage 9223-9232 (fermer une
session inutilisée plutôt que `pkill -f figma-console-mcp`, qui les ferme toutes), puis relancer
un appel d'outil — le serveur MCP se rattache automatiquement.

---

## Ce que la Phase 6 aurait produit, et qui reste dû

| # | Geste | Outil | État |
|---|---|---|---|
| 0 | §X — capture d'avant de **chaque** cible touchée, jamais un sous-ensemble pilote | — | **non fait** (T043) |
| 1 | recensement AVANT, par POSITION, masters ET instances | `extract/figma/photo-parity/photos-census.js`, dans le bac à sable via le pont | **non fait** |
| 2 | le lot de régénération — lotissement **obligatoire**, le pont sature sur un parcours global (≈ 5 350 nœuds). C'est lui, et lui seul, qui porterait enfin la clause de légende au canevas (**SC-006-vif**) | `figma-sync/NN-*.js` servis au pont | **non fait** |
| 3 | recensement APRÈS | `photos-census.js` | **non fait** |
| 4 | le verdict par empreinte à l'emplacement, hors ligne | `npm run photos:verify -- <avant.json> <apres.json> --out …` | **non fait** |

---

## Ce que cela ne remet PAS en cause

**Le sans-tête fait foi ; le vif confirme et ne remplace pas.** La porte de 017 pour la classe
photo est le cas d'eval **`photos-instance-overrides-preserved`** (claim `C2-refusal`), adossé au
faux-Figma : il tourne **partout, sans le fichier client**, il rejoue la perte du 2026-08-06 et
il porte les trois cas adverses. Il est vert dans `npm run eval` (**194/194**).

Le comparateur promu, lui, est prouvé sans tête par `npm run photos:verify -- --selftest`
(**5/5** : identique, perdue, intervertie, non-vérifiable, apparue) — il prouve **le comparateur**,
pas les photos du client, et c'est dit à sa place dans `extract/figma/photo-parity/README.md`.

**Ce qui reste donc ouvert au vif, et qu'il ne faut pas croire acquis** :

- **SC-006-vif** — la clause de légende est **émise et épinglée** sans tête, mais **le canevas ne
  l'a pas reçue**. Un designer qui ouvre le fichier client lit encore l'ancienne légende. Et
  **aucune porte automatique ne détecte cet écart** : `parity/diff.ts` ne compare jamais le champ
  `description` (son interface `FigmaSet`, `:89-96`, ne le porte pas).
- **Le reçu vif des photos** — la preuve que le correctif tient sur les 349 photos réelles, pas
  seulement sur la fixture. Elle est **due**, elle n'est pas acquise.
- **La sonde `getInstancesAsync`** — même fenêtre, même blocage
  (`proofs/sonde-getinstances.md`). L'émetteur emprunte pour l'instant la voie éprouvée
  (registre orchestré) et marque la voie API comme **non mesurée sur le fichier client**.
