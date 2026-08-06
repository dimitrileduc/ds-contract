# Contrat d'interface — le tableau des zones *(FR-009, FR-010, FR-011)*

Un tableau **par composant**, écrit **avant** le montage de ce composant. Trois fichiers au
total, sous `specs/018-odoo-replique-manuelle/zones/`.

C'est le document de gouvernance de la spec : il dit, réglage par réglage, ce qu'un rédacteur
peut faire — et **pourquoi**. Le montage ne le suit pas : il l'exécute.

---

## 1. Forme

```jsonc
{
  "schemaVersion": 1,
  "contractId": "ds.section-header",
  "contractVersion": "2.1.1",        // la version exacte lue au moment d'écrire — pas « la dernière »
  "decidedOn": "2026-08-…",
  "zones": [
    {
      "reglage": "accroche",          // le nom porté par le contrat (prop, texte, glyphe)
      "origine": "prop",              // prop | contenu-texte | glyphe | structure
      "etat": "modifiable",           // modifiable | figé
      "raison": "Chaque site a sa propre accroche : c'est du contenu, pas du design.",
      "mecanisme": null               // rempli APRÈS le montage — par quoi c'est tenu côté Odoo
    },
    {
      "reglage": "emphase",
      "origine": "prop",
      "etat": "figé",
      "raison": "Axe de typographie du design system. Le rédacteur n'a aucune raison métier de changer la taille d'un titre ; le laisser ouvert rouvrirait la dérive que le contrat existe pour fermer.",
      "mecanisme": null
    }
  ]
}
```

## 2. La règle de décision — écrite une fois, appliquée partout

> **Un réglage est offert au rédacteur s'il a une raison métier de le changer sur son site.**
> Tout le reste est figé.

Elle vient de FR-009 telle quelle. Elle est courte exprès : une règle longue se négocie ligne à
ligne, une règle courte se vérifie.

Corollaire utile au moment d'écrire : **le contenu se modifie, le design se fige.** Un texte, une
étiquette de bouton, le choix d'un glyphe dans un registre gouverné — ce sont des décisions de
site. Une taille de titre, une couleur, un espacement, une disposition — ce sont des décisions de
design system, déjà prises dans le contrat.

## 3. Invariants — chacun refusable par relecture, et par le geste sur l'instance

| # | Invariant | Ce qui le rend faux |
|---|---|---|
| Z1 | **Couverture totale** | un réglage porté par le contrat qui n'a **aucune** ligne. Un blanc n'est pas un « figé » implicite : c'est un défaut (FR-009) |
| Z2 | **Raison des deux côtés** | `raison` vide ou absente, y compris sur un `figé`. « Figé » sans raison est aussi faux que « modifiable » sans raison |
| Z3 | **Version épinglée** | `contractVersion` absente ou ne correspondant pas au contrat lu |
| Z4 | **Ordre respecté** | `mecanisme` rempli avant le montage — le tableau décide, le montage câble ; l'inverse serait justifier après coup ce qu'Odoo a bien voulu donner |
| Z5 | **Fidélité de l'écran** | le panneau, sur l'instance, montre un réglage que le tableau ne déclare pas (FR-011, SC-004), ou en cache un déclaré `modifiable` |
| Z6 | **Structure verrouillée** | un élément intérieur se supprime, se déplace ou se duplique **hors** de ce que le tableau autorise (FR-010, SC-004) |
| Z7 | **Survie à l'enregistrement** | une zone `modifiable` qui ne l'est plus après enregistrement **puis réouverture** (FR-012, SC-005 : 100 %) |

## 4. Ce que `mecanisme` doit contenir

Pas « c'est géré », mais **le levier nommé** — parce que c'est précisément ce que le rapport de
décision doit chiffrer. Une valeur de `mecanisme` désigne le moyen Odoo réellement employé, et
elle est reliée à un des quatre leviers (`L1`…`L4`, voir
[`governance-verdicts.schema.md`](./governance-verdicts.schema.md)) quand elle en emploie un.

Si le mécanisme prévu **lâche** et qu'un autre le remplace, `mecanisme` porte le remplaçant et le
levier concerné reçoit son verdict `lâché` — jamais une correction en silence (FR-016).

## 5. Ce que le tableau ne fait pas

- Il **ne décide pas** de la fidélité visuelle. Un réglage figé peut très bien rendre faux : c'est
  l'affaire de la US3, pas de la US2.
- Il **ne remplace pas** la déclaration de non-porté nommé (FR-014). **Figé ≠ non porté** : un
  réglage figé est exprimé par le montage et fermé au rédacteur ; un non-porté n'est pas exprimé
  du tout. Les deux se déclarent, et pas au même endroit.
- Il **ne se décide pas au plan**. Son contenu s'écrit une section réelle sous les yeux
  (Assumptions) : le plan fixe sa forme et ses invariants, le chantier écrit ses lignes.
