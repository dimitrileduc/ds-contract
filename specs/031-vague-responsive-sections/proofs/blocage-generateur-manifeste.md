# Blocage mesuré à G1 — le générateur de manifeste ne couvre aucune des 13 campagnes de la vague

**Date** : 2026-08-27 · **Phase** : G1 (préparation, US2) · **Statut** : bloquant, décision owner requise

Ce document ne conclut rien par lecture de code seule : chaque affirmation
ci-dessous est **exécutée**, et la commande est citée avec sa sortie.

---

## Ce que la vague suppose

`spec.md` FR-014 : chaque campagne « MUST produire exactement **un manifeste
généré**, un audit frais… ». `contracts/dossier-campagne.md`, socle ligne 1 :
« **Manifeste généré** | `…/run-NNN/campaign.json` | `component:repair:manifest` ».
`plan.md` budgète ~25 min par campagne sur cette base.

## Ce que le générateur fait réellement

### Fait 1 — sur un COMPOSANT SEUL (la forme des 12 cibles additives) : refus

Sonde exécutée sur un relevé bien formé décrivant `Presentation` (`2103:2824`,
`type: "COMPONENT"`, aucun axe, aucun membre) :

```
COMPONENT seul  → REFUS releve-unreadable:
  the relevé carries no readable component-set identity
  (id, key, name, bounds, variant axes and members)
```

Ce refus n'est pas un accident : `extract/figma/projection-repair/manifest-generator.ts`
l. 120 exige `value.type === 'COMPONENT_SET'`, et l. 148 exige
`members.length > 0 && Object.keys(axes).length > 0`. Il est **épinglé par un
eval** — `evals/fixtures/figma-projection-repair/manifest-generator-check.ts` l. 155 :

```js
refuses('relevé with no component-set identity anywhere', 'releve-unreadable', { schemaVersion: '1.0.0' }, {}, {});
```

C'est donc un comportement **voulu et prouvé**, pas un défaut à contourner.

### Fait 2 — sur le SEUL set existant du périmètre (`reassurances`) : refus aussi

Commande réelle, sur un relevé read-only du canevas vif (identité complète,
3 membres, 6 usages adressés par position, version `031-avant-vague` épinglée) :

```
npm run component:repair:manifest -- \
  --releve specs/component-repairs/reassurances/run-001/releve-bridge.json \
  --out    specs/component-repairs/reassurances/run-001/campaign.json

projection:repair refused — generated-campaign-invalid:
  target-shape@$.targets[0].responsive.componentSetTopology.variantProperties:
  presentation-not-selected: every multi-axis member and default must declare one exact allowed axis pair
```

Cause : le générateur prend `axisNames[0]` comme axe de présentation
(`manifest-generator.ts` l. 470). Sur `Reassurances`, `axisNames[0]` vaut
**`Disposition`** — l'axe de contenu. Le générateur n'a aucune notion de « l'axe
qu'on s'apprête à ajouter » : il **inverse l'état observé**, il ne décrit pas une
opération.

### Fait 3 — la cause commune, et elle est structurelle

`manifest-generator.ts` n'écrit jamais autre chose que :

| ligne | valeur émise | conséquence |
|---|---|---|
| 472 | `setIdentityPolicy: 'existing' as const` | la branche `additive` n'est **jamais** produite |
| 488 | `createdMembers: []` | **zéro** membre créé, toujours |
| 491 | `expectedCreates: []` | **zéro** création déclarée, toujours |

Or la vague, c'est exactement l'inverse : **28 membres créés** (22 en additive,
6 dans le set existant) et, pour 12 cibles sur 13, la **création du set lui-même**.

Contre-épreuve sur l'artefact de référence : `specs/component-repairs/categories-principales/run-001/campaign.json`
— le manifeste **généré** qui sert de test d'acceptation à 030 — porte
`propertyName: "Style"`, `setIdentityPolicy: "existing"`, `createdMembers: 0`.
C'est l'inversion de l'état **d'avant** 029, pas l'opération de 029.

### Fait 4 — 029 n'a pas non plus posé son axe par le runner

`specs/component-repairs/categories-principales/run-002/` ne contient **qu'un**
fichier : `manual-gesture-receipt.json`. **Aucun `campaign.json`.** L'axe
`Presentation` de `CategoriesPrincipales` a été posé par gestes bridge manuels
— ce que R2 énonçait déjà (« run-002 l'a court-circuitée en gestes manuels »).

**Il n'existe donc, à ce jour, aucun précédent d'ajout d'axe `Presentation`
conduit de bout en bout par le runner.**

---

## Ce qui n'est PAS bloqué — la distinction importe

Le **runner** sait faire l'opération ; c'est le **générateur** qui ne sait pas
l'écrire.

- `extract/figma/projection-repair/campaign.ts` l. 288-317 valide un
  `createdMembers[]` **non vide** dans les deux branches, avec ses règles propres
  (`sourcePresentationValue` obligatoire en branche `existing`).
- `specs/component-repairs/hero-video/run-003/campaign.json` est un manifeste
  **additive** complet, écrit à la main, validé, avec `createdMembers` (2) et
  `expectedCreates` (3, dont le set).
- `bridge-script.ts` porte les deux branches.

Autrement dit : les 13 `campaign.json` sont **écrivables et validables** — à la
main, sur le précédent `hero-video/run-003`. Rien n'est bypassé : la validation
de campagne existante s'applique inchangée.

---

## L'écart de documentation, nommé plutôt que corrigé en silence

`specs/030-outillage-vague-responsive/spec.md` l. 61, Edge Cases :

> « Composant sans set de variantes (COMPONENT seul) ou avec axes inattendus : le
> générateur de manifeste produit **un manifeste réduit** et NOMME ce qu'il ne
> sait pas déduire — jamais de valeur inventée. »

**Mesuré : faux.** Le générateur ne produit pas un manifeste réduit ; il refuse
`releve-unreadable`. Aucun eval ne soutient la phrase de l'Edge Case, et l'eval
qui existe pin le **refus**. C'est exactement la classe que la claims rule (§II)
existe pour empêcher : une capacité écrite dans une spec sans fixture derrière.
Le refus, lui, est honnête ; c'est la phrase qui est en trop.

---

## Conséquence chiffrée sur le plan

`plan.md` budgète 5 h mur, ~25 min par campagne, sur l'hypothèse d'un manifeste
généré. Cette hypothèse est fausse pour **13 campagnes sur 13**. Le coût réel de
la préparation redevient celui de 029 — un manifeste écrit à la main de 25-30 Ko
par campagne — c'est-à-dire précisément « la première source d'heures perdues »
que 030 avait pour objet de supprimer (`specs/030-…/spec.md` l. 15).

Le budget de la vague est donc **caduc**, et il l'est avant qu'une seule mutation
soit posée — ce qui est le bon moment pour le dire.

---

## Ce qui a été produit malgré le blocage

- `specs/component-repairs/reassurances/run-001/releve-bridge.json` — relevé
  read-only **réel** du canevas vif : identité complète du set (3 membres, clés,
  bornes, axe `Disposition` et son défaut), **6 usages adressés par position**
  (chaîne d'ancêtres + index, jamais par nom — §VIII), parent `2114:3722`,
  version `031-avant-vague` épinglée, et l'inventaire pondéré des usages
  (`4 cartes` ×3 dominante · `5 cartes` ×2 · `QuatreCartesDeuxCta` ×1).
  Ce relevé est **réutilisable tel quel** quelle que soit l'issue : c'est l'entrée
  d'un manifeste, généré ou écrit.
- Aucune mutation de canevas. Aucun fichier de dépôt modifié.
