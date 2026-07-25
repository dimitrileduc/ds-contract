# Contrat — Journal de décisions (`decisions.md`, FR-020)

La trace auditable, versionnée dans git, des décisions de l'owner. Les gestes Figma ne
sont pas dans git — ce journal EST le support relisible en revue ; les points de
restauration Figma (FR-017) couvrent le versant checkpoint.

## Fichier

`specs/003-externalize-figma-components/decisions.md` — **append-only** : on ajoute en
fin de fichier, on ne réécrit jamais une entrée passée (une erreur se corrige par une
nouvelle entrée qui référence l'ancienne).

## Format d'entrée

```markdown
## <AAAA-MM-JJ> — <type> — <composant(s)>

- **Type** : validation-master | ecart-pixel-accepte | anomalie-tranchee | report-bloc | amendement-orga
- **Composant(s)** : <cle(s) de bloc, ou « programme »>
- **Verdict owner** : <la décision, en une phrase — ex. « master Footer validé », « écart accepté »>
- **Chiffres** : <obligatoire pour ecart-pixel-accepte : diffCount par maquette + diffBox ;
  pour validation-lot : liste des masters couverts>
- **Raison** : <obligatoire pour ecart-pixel-accepte, anomalie-tranchee, report-bloc>
- **Preuve** : <réf. proofs/<bloc>/verdict.json, ledger/<bloc>.json, audits/<bloc>.md — quand applicable>
- **Checkpoint** : <label du point de restauration couvrant l'opération, quand applicable>
```

## Règles par type

| Type | Exigences minimales |
|---|---|
| `validation-master` | cadence respectée (FR-013) : **par composant** pour net-new (Input, Textarea, Select, Checkbox, icônes) et inférés (Review-card, gallery-item, icône étoile) ; **par lot de niveau** possible pour les extractions simples — l'entrée liste alors chaque master couvert nommément |
| `ecart-pixel-accepte` | chiffres (diffCount/maquette) + raison + réf verdict — un écart sans les trois n'est PAS accepté, l'étape est un échec (FR-015) |
| `anomalie-tranchee` | l'anomalie décrite + la proposition + la décision (corriger / différer / ignorer) — FR-010 |
| `report-bloc` | pourquoi introuvable/reporté + condition de reprise — FR-009/FR-018 ; admis au niveau `programme` (Composant(s) : « programme », ex. STOP d'étalonnage T018) |
| `amendement-orga` | changements d'organisation (noms des pages DS, granularité…) — pas de changement de périmètre par cette voie |

## Couplage aux transitions (data-model)

Pas d'entrée → pas de transition : `valide-owner`, `ecart-accepte` et `reporte` sont
**inatteignables** sans l'entrée correspondante committée. Le commit git qui clôt un
incrément embarque : le verdict, le ledger, et l'entrée de journal — relisibles ensemble
en revue.
