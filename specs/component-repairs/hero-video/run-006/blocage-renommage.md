# `hero-video` — le renommage `Compact` → `Mobile` n'a aucun chemin runner

**Date** : 2026-08-27 · **Phase** : G1 · **Statut** : bloquant, nommé d'avance (R3), confirmé par mesure
**Cible** : `HeroVideo` `2580:7392` (COMPONENT_SET), parent `2448:4731` (`Container · HeroVideo`)
**Registre** : `E-031-002`

---

## Ce que la campagne 13 demande

`HeroVideo` porte depuis 028 l'axe `Presentation{Wide, Compact, Desktop}`. La
décision **D2** de la fiche de vague impose le nom **`Mobile`** pour l'étage
mobile. Il faut donc renommer le membre `Presentation=Compact` en
`Presentation=Mobile` — et **rien d'autre** : zéro membre créé, zéro membre
supprimé, zéro identité changée.

## Pourquoi aucune branche ne le fait

Le mécanisme `responsive-component-set` a exactement deux branches, et **aucune
ne renomme un membre existant** :

| branche | ce qu'elle fait | ce qu'elle renomme |
|---|---|---|
| `additive` | `bridge-script.ts` l. 570-580 : clone l'historique, nomme les clones, renomme l'historique, puis `combineAsVariants` | l'historique **et** les clones — mais elle exige `!set` (aucun set préexistant). `HeroVideo` **est** un set. |
| `existing` | l. 586-604 : clone un membre source, nomme **le clone** | **le clone seulement** |

Puis, l. 605-608, la porte commune :

```js
const names = set.children.filter((node) => node.type === 'COMPONENT').map((node) => node.name).sort();
const expectedNames = [...topology.expectedMemberNames].sort();
if (!sameValue(names, expectedNames) || set.name !== topology.setName ||
    historical.name !== topology.historicalMember.declaredName) {
  throw new Error('Responsive component-set topology drift');
}
```

Déclarer `Presentation=Mobile` dans `expectedMemberNames` sans qu'aucune
instruction ne renomme le nœud produit **`Responsive component-set topology
drift`**. Déclarer `Presentation=Compact` laisse le nom d'origine et ne tient pas
D2. Les deux issues sont fermées.

Et `docs/internal/component-repair-workflow.md` l. 224 va plus loin : un membre
« ajouté, retiré ou **renommé** » est un motif de **refus du preflight** — une
dérive de source, pas une opération déclarable.

## Le chemin vérifié, puis écarté pour une raison de gouvernance

`docs/FIGMA-CAPABILITY-MATRIX.md`, addendum du 2026-08-06, point 4 :

> **A set can gain a VARIANT axis on amend** (rename+merge, generalizing the
> State-axis rename) […] **No dedicated adversarial fixture backs this yet** —
> receipt level.

Ce chemin existe donc, mais c'est celui de **`core/emit-figma-script.ts`**,
contrat → canevas. L'emprunter signifie **régénérer `HeroVideo` depuis son
contrat**. Or `contracts/hero-video.contract.json` est en v1.0.0 et **ne porte
aucune prop `presentation`** — D1/FR-013 l'interdisent explicitement. La
régénération ne renommerait donc pas l'axe : elle le **retirerait**.

**Le chemin est fermé par gouvernance, pas par capacité.** C'est la formulation
exacte de R3, et elle est confirmée.

## Ce que FR-015 interdit de faire à la place

Étendre le runner pendant la vague. La capacité manquante — « renommer les
membres existants d'un set » — est la **même** que celle qui bloque
`reassurances` (voir `specs/component-repairs/reassurances/run-001/blocage-ajout-axe.md`).
Une seule capacité débloque les deux cibles ; elle appartient à une spec
ultérieure, avec sa fixture rouge et son eval, dans l'ordre du dépôt.

## Les deux issues posées à l'owner (séance G2)

1. **Geste bridge manuel gouverné** — précédent : 029 run-002
   (`specs/component-repairs/categories-principales/run-002/manual-gesture-receipt.json`,
   seul fichier de ce run : il n'y a **jamais eu** de `campaign.json`). Le reçu
   de 029 liste les **6 garanties perdues** par ce chemin. Deux versions Figma
   épinglées servent de filet.
2. **Statut `reportée` (FR-018)** — la campagne est **finalisée**, jamais
   **livrée** ; elle porte sa preuve de blocage (ce document), son entrée au
   brief du chantier suivant, et une décision de report recueillie au début de
   l'acceptation finale.

## État §X pour cette cible

**Aucune mutation n'est proposée sur `HeroVideo` par 031.** L'état-avant est
malgré tout épinglé, et il l'est plus fortement qu'en PNG : la version Figma
nommée **`031-avant-vague`** (id `2392267626424800780`) fige **tout le fichier**
avant la première écriture de la vague. Aucune capture PNG dédiée n'est produite
ici, et c'est écrit plutôt que passé sous silence : §X exige la capture avant
**mutation**, et il n'y en aura aucune sur cette cible tant que l'owner n'a pas
tranché. Si l'issue 1 est retenue, la capture-avant de `HeroVideo` devient
obligatoire **avant le geste**, au même titre que pour les autres.

## Numéro de run

`run-006` est le **premier libre** (relevé sur disque le 2026-08-27 :
`run-001` … `run-005` sont occupés, `run-004` portant notamment `before/`,
`dry-run.json` et ses PNG de scénario). Aucun run occupé n'a été touché.
