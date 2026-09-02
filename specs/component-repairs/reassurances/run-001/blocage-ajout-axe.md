# `reassurances` — le pilote imposé par FR-009 n'a pas de chemin runner

**Date** : 2026-08-27 · **Phase** : G1 · **Statut** : bloquant, mesuré

Ce document ne conclut rien par lecture de code. La chaîne a été construite,
validée et exécutée ; le refus est cité tel que la machine l'a écrit.

---

## Ce que FR-009 demande

> « La première section traitée MUST exercer en conditions réelles la capacité
> **créations déclarées dans un set existant** […]. Un échec MUST arrêter la
> vague et produire un correctif accompagné de sa vérification automatisée —
> jamais un contournement manuel. »

`reassurances` est le **seul set existant** du périmètre (R1), donc le pilote est
forcé. La vague lui demande de passer de `Disposition{3}` à
`Presentation{Wide, Desktop, Mobile} × Disposition{3}` = 9 membres, 6 créés.

## Ce qui a été fait

1. **Relevé read-only réel** du canevas vif → `releve-bridge.json`
   (identité du set, 3 membres avec clés et bornes, **6 usages adressés par
   position**, parent `2114:3722`, version `031-avant-vague` épinglée).
2. **Manifeste écrit** → `campaign.json` : branche `existing`, `setNodeId`
   `2114:3721`, `historicalMember` + 2 `preservedMembers` (identités réelles
   inchangées) + **6 `createdMembers`** portant chacun son `sourcePresentationValue`,
   `variantProperties: {Presentation, Disposition}`, 9 `expectedMemberNames`,
   frontière d'écriture fermée, `pageWrites: []`, `childWrites: []`.
3. **`validateRepairCampaign` → OK.** Le manifeste est **légal**. Rien n'est
   contourné : c'est la validation de campagne existante, invoquée telle quelle.
4. **`dryRunCampaign` → OK**, et il expose bien les **6** créations déclarées :
   `presentation-desktop-4-cartes`, `presentation-desktop-quatrecartesdeuxcta`,
   `presentation-desktop-5-cartes`, `presentation-mobile-4-cartes`,
   `presentation-mobile-quatrecartesdeuxcta`, `presentation-mobile-5-cartes`.
5. **`emitBridgeApplyScript` → 80 059 octets** (`bridge-first.probe.js`).
6. **Exécution du script sur un mock reproduisant l'état réel** du set
   (SECTION `Réassurances` ⊃ COMPONENT_SET `Reassurances` ⊃ 3 COMPONENT nommés
   `Disposition=…`, plus les 6 instances d'usage) :

```
=== PONT : REFUSÉ ===
Responsive member cardinality drift: Presentation=Wide, Disposition=4 cartes/0
--- membres du set au moment du refus ---
Disposition=4 cartes
Disposition=QuatreCartesDeuxCta
Disposition=5 cartes
```


## Confirmation par le RUNNER LUI-MÊME, sur le canevas vif (2026-08-27)

La sonde ci-dessus tournait sur un mock écrit pour l'occasion. La chaîne réelle a
ensuite été lancée sur le fichier vif, et elle refuse **au preflight**, plus tôt
encore que le pont :

```
✔  1 audit — green
✔  2 snapshot-source — green
✖  3 preflight — refused
projection:repair refused — preflight: existing responsive component-set topology drift for reassurances
```

C'est le **runner**, pas un mock, qui nomme la dérive de topologie, en lisant le
canevas réel. La chaîne s'arrête **avant `capture-before`** et donc très loin de
toute mutation. La limite de fidélité nommée plus haut ne porte plus sur la
conclusion : elle est confirmée par l'instrument de production.

**Conséquence §X assumée et écrite** : cette cible n'a **pas** de PNG de
capture-avant, parce que la chaîne refuse avant l'étape qui les produit. Ce n'est
pas une capture manquante au sens de FR-007 — aucune mutation n'est ni possible
ni proposée sur cette cible — et l'état-avant reste épinglé par la version
`031-avant-vague`, qui fige le fichier entier. Si l'owner retient un geste manuel
gouverné, la capture-avant devient obligatoire **avant le geste**.

## Pourquoi, exactement

`extract/figma/projection-repair/bridge-script.ts` l. 410-416 :

```js
const memberByPresentation = (set, responsive, presentation) => {
  const declaration = topologyMembers(topology).find((m) => m.presentationValue === presentation);
  const expectedName = declaration && declaration.declaredName;
  const members = set.children.filter((node) => node.type === 'COMPONENT' && node.name === expectedName);
  if (members.length !== 1) throw new Error('Responsive member cardinality drift: ' + expectedName + '/' + members.length);
```

La résolution d'un membre se fait **par son nom déclaré**. Ajouter un axe
`Presentation` à un set qui n'en a pas **renomme mécaniquement les trois membres
existants** — Figma nomme une variante par tous ses axes :
`Disposition=4 cartes` doit devenir `Presentation=Wide, Disposition=4 cartes`.

Or la branche `existing` (l. 586-604) **ne renomme que les clones** :

```js
for (const declaration of topology.createdMembers) {
  const source = memberByPresentation(set, responsive, declaration.sourcePresentationValue);
  const clone = source.clone();
  clone.name = declaration.declaredName;   // ← seul le CLONE est nommé
}
```

Aucune instruction ne renomme `historicalMember` ni les `preservedMembers`. Le
refus tombe donc au **tout premier** `memberByPresentation` : le membre source
`Presentation=Wide, Disposition=4 cartes` n'existe pas encore, et n'existera
jamais.

Le refus est **fail-closed** : il arrive **avant le premier `clone()`**. Zéro
nœud touché.

Et si l'on déclarait les membres sous leur nom actuel, l. 605-620 lèverait
`Responsive presentation property drift: Presentation` — la définition d'axe
`Presentation` n'existe pas sur le set.

## Ce que disent les documents, lus avant de conclure

- **`docs/internal/component-repair-workflow.md` §Adaptation responsive dans un
  set existant** : « Le même mécanisme accepte aussi une topologie **déjà
  formée** » et le manifeste déclare « le vocabulaire fermé de **chaque axe de
  variante** ». La branche adapte des axes existants ; elle n'en ajoute pas.
- L. 224 du même document : un membre « ajouté, retiré ou **renommé** » est un
  motif de **refus** du preflight (dérive de source).
- **`docs/FIGMA-CAPABILITY-MATRIX.md`**, addendum 2026-08-06, point 4 :
  « **A set can gain a VARIANT axis on amend** (rename+merge…) » — mais c'est le
  chemin **`core/emit-figma-script.ts`, contrat → canevas**, et il est au niveau
  **reçu**, sans fixture adverse. L'emprunter exigerait de promouvoir
  `Presentation` dans le contrat — ce que **D1/FR-013 interdisent**. Chemin fermé
  par gouvernance, pas par capacité : **exactement la conclusion de R3 pour
  `HeroVideo`, qui vaut aussi pour `reassurances`.**

## Portée : quelles campagnes sont touchées

| Classe | Cibles | Chemin runner |
|---|---|---|
| **additive** (composant seul → set créé) | les 11 sections sans axe | **OUI** — la branche additive clone l'historique, nomme **tous** les membres et appelle `combineAsVariants` (précédent vif : HeroVideo/028) |
| **existing** (ajout d'axe à un set formé) | `reassurances` | **NON** — refus mesuré ci-dessus |
| **renommage** | `hero-video` | **NON** — R3, déjà nommé d'avance |

**Le blocage ne porte donc pas sur la vague entière** : 11 sections sur 12
restent faisables par le runner. Il porte sur le **pilote imposé par FR-009** et
sur la 13ᵉ campagne.

## Limite de cette preuve, nommée

Le mock utilisé est **écrit pour cette sonde**, pas
`scripts/plugin-engine-mock-figma.mjs` ni le mock des fixtures. Il reproduit
fidèlement ce dont dépend le refus — le **nom des enfants du set**, relevé sur le
canevas vif — et le refus vient de la logique du script de pont, pas d'une
subtilité de mock. La conclusion est solide sur ce point précis ; elle ne
prétend pas valider le reste du script.

## Artefacts

| Fichier | Ce qu'il est |
|---|---|
| `releve-bridge.json` | relevé read-only réel, réutilisable tel quel |
| `campaign.json` | manifeste **validé** (`state: draft`) — légal, mais non applicable |
| `bridge-first.probe.js` | le script émis, celui qui a refusé |
| ce document | la preuve du blocage |

**Aucune mutation de canevas. Aucun fichier de dépôt modifié.**
