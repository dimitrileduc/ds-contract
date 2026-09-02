# Contrat — le dossier minimal d'une campagne (FR-014)

Contrat **documentaire** (recherche R7 : FR-015 gèle le runner, §II interdit de
revendiquer un contrôle non prouvé par eval). Il se vérifie à la lecture, à G5,
campagne par campagne.

FR-014 dit deux choses, et la seconde est aussi contraignante que la première :
un dossier doit porter **l'ensemble minimal** de son verdict, **et rien d'autre**
(SC-003). Un artefact en trop est un défaut au même titre qu'un artefact manquant
— c'est la leçon des ~116 Ko de prose morte par section mesurés sur 029.

---

## Le socle : quatre pièces, pour les trois verdicts

| # | Pièce | Où | Produite par |
|---|---|---|---|
| 1 | **Manifeste généré** | `specs/component-repairs/<cible>/run-NNN/campaign.json` | `component:repair:manifest`, relu par la validation existante |
| 2 | **Audit frais** | `…/run-NNN/audit.json` | `component:repair -- --audit` |
| 3 | **Une décision de validation owner** | `specs/031-…/decisions/<campagne>.json` | séance G2 |
| 4 | **Une ligne au registre d'écarts** | `specs/031-…/inventory/registre-ecarts.json` | orchestrateur |

« Une » est un compte exact : une décision de validation, une ligne. Pas deux.

---

## Le supplément, commandé par le verdict

### `appliquée`

**+ les reçus machine de l'application et de la vérification** :

```
…/run-NNN/receipts/dry-run.json
…/run-NNN/receipts/apply-first.json
…/run-NNN/receipts/apply-second.json      ← second passage : no-op prouvé
…/run-NNN/captures/{before,after,idempotence}/
…/run-NNN/verify/comparison.json
…/run-NNN/preflight-locks.json
…/run-NNN/drive-journal.jsonl
```

Le reçu du second passage n'est accepté que si **toutes** les opérations sont
`no-op` : `createdNodeIds: []`, `createdNodes: []`, `changedNodeIds: []`,
`pageWrites: []`, `childWrites: []` (SC-005).

### `sans changement` (FR-019)

**+ un audit vert et la preuve de conformité existante.**
**Aucun reçu d'application n'est fabriqué** — ni `apply-*.json`, ni capture
`after`, ni `idempotence`. Un dossier « sans changement » qui porte un reçu
d'application est un dossier faux.

La preuve de conformité : le relevé montrant que la matrice `Presentation`
attendue est **déjà entièrement** en place (membres, valeurs, défaut, matrice
complète avec les axes existants). Elle compte comme **section livrée**.

### `reportée` (FR-018)

**+ la preuve du blocage + la référence de son entrée au brief du chantier
suivant.**

Si le blocage est apparu **après** la séance de validation :
**+ exactement une décision de report owner**, recueillie au **début** de
l'acceptation finale, avant l'acceptation de la clôture globale. Elle remplace
l'autorisation d'appliquer **sans effacer** la décision de validation déjà
enregistrée.

Une campagne reportée compte comme **finalisée**, jamais comme **livrée**.

---

## Ce qu'aucun dossier ne porte

Interdits par FR-014, dernière phrase :

- pas de `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`
  par campagne ;
- pas de `checklists/` par campagne ;
- pas de `contracts/` local par campagne ;
- pas de dossier `handoff/` (planifié quatre fois en 029, jamais créé, jamais
  manqué).

Tout ce qui est de niveau vague vit **une fois** sous `specs/031-…/`.

---

## Table de contrôle de clôture (G5)

À remplir une fois, treize lignes :

| Campagne | Verdict | 1 manifeste | 2 audit | 3 décision | 4 registre | Supplément conforme | En trop |
|---|---|---|---|---|---|---|---|
| … | appliquée / sans changement / reportée | ✓ | ✓ | ✓ | ✓ | ✓ | néant |

Une case vide ou une colonne « en trop » non vide ⇒ le dossier n'est pas complet,
et G5 n'est pas franchi.
