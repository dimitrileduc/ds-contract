# Contrat d'interface — les volumes et leur classement *(FR-017, FR-017b, FR-018, SC-008)*

Un fichier : `specs/018-odoo-replique-manuelle/proofs/volumes.json`.

C'est le **chiffre porteur de toute la spec**. Tout le reste — les leviers, l'écart d'image — est
du contexte pour lui. La question qu'il répond est : *une ligne écrite à la main, un émetteur
l'aurait-il produite sans jugement ?*

**La règle est écrite ici, avant le montage** (FR-017b). Posée après avoir vu le code, elle
classerait ce qu'on a envie de classer, et la mesure ne serait plus falsifiable — ce qui est
d'autant plus grave qu'**aucun seuil de décision n'est préétabli** (spec.md § Clarifications, Q1) :
rien d'autre ne retient ce chiffre.

---

## 1. La règle de classement — une phrase, appliquée partout

> **Une ligne est MÉCANIQUE si un émetteur déterministe aurait pu la produire à partir du contrat,
> du registre d'icônes, du tableau des zones et des jetons — sans qu'un humain ait à trancher quoi
> que ce soit. Sinon elle est CAS PARTICULIER.**

Elle est courte exprès : une règle longue se négocie ligne à ligne, une règle courte se vérifie.

**Le test à appliquer, dans cet ordre** — le premier qui répond tranche :

| # | Question | Réponse | Verdict |
|---|---|---|---|
| 1 | L'entrée qui produit cette ligne est-elle **nommable** ? (un champ du contrat, une entrée du registre d'icônes, une ligne du tableau des zones, une référence de token) | non | `cas-particulier` |
| 2 | La transformation entrée → ligne est-elle **écrivable comme règle**, sans exception ? | non | `cas-particulier` |
| 3 | La même règle, appliquée à un **autre** composant du catalogue, donnerait-elle un résultat juste ? | non | `cas-particulier` |
| 4 | — | oui aux trois | `mecanique` |

**Corollaire utile** : *répétitif ≠ mécanique, et court ≠ cas particulier.* 19 entrées de sélecteur
de glyphe dérivées d'un registre sont mécaniques bien qu'elles fassent 19 lignes. Une seule ligne
choisie parce qu'Odoo se comportait autrement que lu est un cas particulier bien qu'elle fasse une
ligne. **Le volume ne décide de rien ; l'origine décide de tout.**

## 2. Les trois postes mécaniques connus d'avance

Identifiés en Phase 0, comptés **séparément** parce que ce sont eux qui portent l'argument en
faveur d'un émetteur :

| Poste | Origine | Dénominateur mesuré |
|---|---|---|
| Balisage de verrouillage `oe_unremovable oe_unmovable` par élément (T030) | le tableau des zones | à relever au montage |
| Les 19 entrées du sélecteur de glyphe (T033) | `contracts/icons.registry.json` | 19 |
| Renommage `var(--…)` → `var(--pqr-…)` de la CSS (T020) | `core/samples/` | 231 + 197 + 118 lignes |

Les nommer d'avance n'exempte pas le reste : **chaque** ligne écrite reçoit un verdict.

## 3. Forme

```jsonc
{
  "schemaVersion": 1,
  "regleVersion": "1",              // la règle du §1 ; si elle change en cours de route, tout est reclassé
  "releveLe": "2026-08-…",
  "composants": [
    {
      "contractId": "ds.button",
      "fichiers": [
        {
          "chemin": "module/piqueray_ds/views/templates.xml#t_button",
          "type": "xml-qweb",       // xml-qweb | js-owl | xml-owl | css | asset
          "lignes": 0,
          "mecanique": 0,           // mecanique + casParticulier == lignes  (invariant M2)
          "casParticulier": 0,
          "postes": [
            {
              "libelle": "verrouillage par élément",
              "classe": "mecanique",    // mecanique | cas-particulier
              "lignes": 0,
              "origine": "zones/ds-button.json",   // OBLIGATOIRE si classe = mecanique
              "justification": null                // OBLIGATOIRE si classe = cas-particulier
            }
          ]
        }
      ]
    }
  ],
  "nonClassees": []                 // DOIT rester vide (invariant M1)
}
```

`type` couvre les **trois** types de fichiers qu'Odoo demande (`research.md` §D15) — c'est la
différence structurante avec le précédent interne du dépôt, qui n'en produit qu'un, et le rapport
doit pouvoir la lire directement dans ces chiffres.

## 4. Invariants — chacun refusé PAR NOM

| # | Invariant | Ce qui le rend faux |
|---|---|---|
| M1 | **0 ligne non classée** | `nonClassees` non vide, ou une ligne écrite qui n'apparaît dans aucun poste (SC-008) |
| M2 | **Le compte ferme** | `mecanique + casParticulier ≠ lignes`, sur n'importe quel fichier |
| M3 | **`mecanique` ⇒ `origine` nommée** | un poste mécanique sans l'entrée d'où un émetteur l'aurait tiré. « C'est évident » n'est pas une origine |
| M4 | **`cas-particulier` ⇒ `justification`** | un poste classé cas particulier sans **le jugement qui a été rendu**. Pas « c'était compliqué » : ce qui a été décidé, et pourquoi le contrat ne le disait pas |
| M5 | **Classé en écrivant** | un classement reconstitué après coup, en relisant le fichier fini (FR-017b). Le poste se déclare quand la ligne s'écrit |
| M6 | **Compté par relevé** | un chiffre donné de mémoire ou arrondi. Les lignes se comptent par exécution, et la commande est consignée |
| M7 | **Règle stable** | la règle du §1 modifiée en cours de chantier sans que **tout** soit reclassé et `regleVersion` bumpée |

## 5. Ce que ce document ne fait pas

- Il **ne fixe aucun seuil**. Aucun ratio ne déclenche « construire l'émetteur » : la décision
  appartient à l'owner au vu du rapport (FR-018). Ce contrat garantit que le chiffre est
  *honnête*, jamais qu'il est *suffisant*.
- Il **ne mesure pas le coût d'un émetteur**. Il mesure le coût du montage à la main. Le chiffrage
  de l'émetteur s'adosse au précédent interne du dépôt, avec sa réserve écrite (un seul type de
  fichier contre trois).
- Il **ne couvre pas** ce que la chaîne n'a pas exercé — la répétition d'un élément, le levier L4.
  Ces trous sont des **angles morts obligatoires** du rapport (FR-018b), pas des lignes de ce
  fichier.
