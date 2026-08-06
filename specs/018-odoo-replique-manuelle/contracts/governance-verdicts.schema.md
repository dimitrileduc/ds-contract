# Contrat d'interface — les verdicts de levier *(FR-016, SC-007)*

Quatre leviers de gouvernance, **quatre verdicts écrits**, aucun silence. Un fichier :
`specs/018-odoo-replique-manuelle/proofs/verdicts-leviers.json`.

C'est le document qui répond à la question la moins certaine de tout le dossier : **la
combinaison des leviers n'est attestée nulle part.** Chacun existe seul dans le code d'Odoo ;
leur emploi ensemble est une construction de cette spec. Ces quatre verdicts sont la seule chose
qui puisse le confirmer ou l'infirmer.

---

## 1. Les quatre leviers

| Id | Ce qu'il ferme | Exercé par la chaîne ? |
|---|---|---|
| `L1` | verrouiller la structure — plus rien d'intérieur ne se supprime, se déplace ou se duplique | oui |
| `L2` | empêcher un réglage natif d'apparaître, **sans le neutraliser** | oui |
| `L3` | tronquer ce qui remonte du parent — l'héritage de réglages depuis le conteneur | oui |
| `L4` | rouvrir une image dans un cadre figé | **non** — aucun des trois contrats ne porte d'image |

## 2. Forme

```jsonc
{
  "schemaVersion": 1,
  "instance": { "odooVersion": "19.0", "montéeLe": "2026-08-…", "détruiteLe": "2026-08-…" },
  "verdicts": [
    {
      "levier": "L1",
      "verdict": "tenu",              // tenu | lâché | non exercé
      "mecanisme": "…",               // le moyen Odoo réellement employé
      "preuve": "Geste fait sur l'instance : … ; résultat observé : …",
      "remplacant": null,             // OBLIGATOIRE si verdict = lâché
      "raison": null                  // OBLIGATOIRE si verdict = non exercé
    },
    {
      "levier": "L4",
      "verdict": "non exercé",
      "mecanisme": null,
      "preuve": null,
      "remplacant": null,
      "raison": "Aucun des trois contrats de la chaîne ne porte d'image. L'exercer aurait demandé soit un bloc d'essai hors chaîne — qui mesure un montage qui n'est pas le montage —, soit faire entrer une image dans la chaîne, ce qui contredit la raison écrite de son choix."
    }
  ]
}
```

## 3. Invariants — chacun refusé PAR NOM

| # | Invariant | Ce qui le rend faux |
|---|---|---|
| V1 | **4 sur 4** | un levier sans entrée. Un verdict négatif n'est pas un défaut ; **une absence de verdict en est un** (SC-007) |
| V2 | **`lâché` ⇒ `remplacant`** | un levier lâché sans ce qui l'a remplacé — c'est-à-dire une correction en silence (FR-016) |
| V3 | **`non exercé` ⇒ `raison`** | un levier non exercé sans sa raison |
| V4 | **`tenu`/`lâché` ⇒ `preuve` en fonctionnement** | un verdict établi **par lecture de code**. Ce qui a été établi en lisant Odoo est une **hypothèse** jusqu'à ce qu'une instance le confirme (FR-013, SC-009) |
| V5 | **Pas de 4/4 par élargissement** | `L4` marqué `tenu` grâce à un bloc d'essai hors chaîne. Le compte reste 4, dont un négatif assumé |
| V6 | **`preuve` = un geste, pas une impression** | une preuve rédigée en « ça a l'air de marcher ». Elle nomme le geste tenté et le résultat observé |

## 4. Ce que `L4` coûte au rapport, et pourquoi c'est écrit ici

`L4` reste une **hypothèse lue dans le code d'Odoo, jamais confirmée en fonctionnement**. Trois
conséquences, toutes portées explicitement :

1. Le rapport de décision **ne peut rien conclure** sur son coût.
2. C'est **la première chose** qu'une chaîne à photo aurait à instruire.
3. Ce trou est un des **angles morts obligatoires** de FR-018b — sans seuil de décision
   préétabli, nommer ce que les chiffres ne couvrent pas est la seule chose qui empêche une
   décision à l'humeur de se déguiser en décision informée.

## 5. Rapport avec le tableau des zones

Les deux documents se croisent mais ne se recouvrent pas :

- le **tableau des zones** dit *ce qui doit être ouvert ou fermé*, et **pourquoi** (une décision) ;
- les **verdicts de levier** disent *si le moyen employé a tenu*, et **par quelle preuve** (un
  fait).

Un tableau des zones parfait avec un levier lâché est un résultat parfaitement lisible : la
décision était bonne, le moyen n'a pas suivi. C'est exactement le genre de fait que cette spec
existe pour produire.
