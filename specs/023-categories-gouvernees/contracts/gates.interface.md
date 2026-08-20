# Interface des quatre gates humains — 023

Contrat d'interface entre l'exécution et l'owner (FR-001 → FR-005, SC-007). Patrons
éprouvés : 021 (`campaign/owner-decisions/*.json`) et 022 (`contracts/*.editable-scope.json`
+ `proofs/gate.md`).

## Règle commune (FR-005)

- Un gate est **un arrêt réel** : aucune tâche aval ne démarre tant que l'artefact du gate
  n'existe pas avec `"status": "validated"` ET une trace datée dans `proofs/`.
- Chaque artefact porte : `decidedBy: "owner"`, `decidedAt` (date ISO), `deviations[]`
  (écarts demandés par l'owner, même vides), `evidenceRefs[]` (chemins des preuves).
- Toute divergence découverte APRÈS un gate = défaut à corriger ou **retour au gate**
  (nouvel enregistrement `revisions[]`, patron 022) — jamais un ajustement silencieux.

## Gate A — modèle cible (AVANT toute mutation Figma) — FR-001

**Fichier** : `specs/023-categories-gouvernees/gates/gate-a-modele-cible.json`
**Trace** : `proofs/gate-a.md`
**Contenu minimal** :

```jsonc
{
  "gate": "A",
  "status": "proposed | validated",
  "modeleCible": {
    "molecule": { "axes": { "Style": ["Superpose", "Empile"] }, "renommage": "…" },
    "section":  { "axes": { "Style": ["…"], "Colonnes": ["2", "3"] }, "axeSupprime": "Disposition" },
    "rdv": "instance renseignée (contenu préservé)",
    "sortDeDsCarte": "retrait-categorie-v3 | coexistence-dette-nommee"
  },
  "copiesDerivees": [
    { "copieId": "<position>", "nodeId": "…", "ecartObserve": "…",
      "decision": "preserver-le-pixel | recaler-sur-la-molecule" }
  ],
  "decidedBy": "owner", "decidedAt": "…", "deviations": [], "evidenceRefs": ["audits/…"]
}
```

**Une décision PAR copie dérivée** est obligatoire (FR-001). Bloque : toute mutation canvas.

## Gate B — comparaison pixel (APRÈS mutation) — FR-002

**Fichier** : `gates/gate-b-pixel.json` · **Trace** : `proofs/gate-b.md`
**Contenu** : pour CHACUN des 7 usages — delta pixel chiffré, cause nommée pour tout delta
non nul, conformité aux décisions par copie du Gate A. Bloque : la déclaration « repair
neutre » et l'extraction des contrats.

## Gate C — contrats (AVANT câblage & Odoo) — FR-003

**Fichier** : `gates/gate-c-contrats.json` · **Trace** : `proofs/gate-c.md`
**Objet validé** : le **diff révisable** des deux contrats (le diff EST la revue design
system, Principe VI) — référence de commit/PR + versions. Bloque : câblage différentiel
(US3) et tout travail Odoo (US2).

## Gate D — table d'éditabilité (AVANT tout Odoo) — FR-004

**Fichier** : `contracts/categories.editable-scope.json` (format 022, granularité
décision) · **Trace** : `proofs/gate-d.md`
**Exigences** :

- **100 % des props ET des parts des DEUX contrats** (y compris les occurrences des
  contrats composés : `ds.button`, icône flèche) — zéro verdict par défaut.
- Verdicts : `directly-editable`/`controlled` (avec le **geste rédacteur** et le
  mécanisme), `fixed-by-composition`, `not-editable`, `hors-capacite` (avec justification).
- Transcription 1:1 vers `integrations/odoo/config/categories.authoring.json` (schéma
  019), exhaustivité vérifiée par `npm run odoo:authoring:check`.

Bloque : **tout** Odoo — code de module, provisionnement d'instance pour l'authoring,
tâches de couche d'authoring.
