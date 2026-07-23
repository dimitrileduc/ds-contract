# Data Model — Externalisation des maquettes Piqueray (spec 003)

**Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

Les données de cette spec sont des **artefacts fichiers** : JSON versionnés dans
`specs/003-externalize-figma-components/` (committés) + PNG de travail gitignorés.
Aucune base, aucun service. Les schémas JSON précis sont dans [contracts/](./contracts/).

## Vue d'ensemble

```text
InventoryScan ──identifie──▶ Bloc ──audité par──▶ SourceAudit ──anomalies──▶ Anomalie
                              │                        │
                              │ (dépendances DAG)      └─▶ validation owner ─▶ JournalEntry
                              ▼
                            Master ──adopté via──▶ AdoptionRun ──preuve──▶ PixelVerdict ×9
                                                       │    │
                                                       │    ├─▶ CaptureManifest ×18 (before/after ×9)
                                                       │    ├─▶ LedgerEntry (personnalisations)
                                                       │    └─▶ RestorePoint (checkpoint préalable)
```

## Entités

### Bloc (l'unité de travail — ~35 inventoriés)

| Champ | Type | Règles |
|---|---|---|
| `cle` | string | identifiant stable kebab-case (ex. `accordion-row`) — indépendant du nom Figma (les noms mentent : `item` ×71 = 3 blocs) |
| `niveau` | `atome \| molecule \| section` | détermine la phase d'exécution |
| `nomVrai` | string | le nom que portera le master (FR-007/FR-008) |
| `origine` | `extraction \| net-new \| infere` | net-new : Input, Textarea, Select, Checkbox, icônes ; inférés : Review-card, gallery-item, icône étoile (confirmés in-scope par l'owner) |
| `dependsOn` | cle[] | DAG strict — un bloc n'est externalisable que si toutes ses dépendances sont `adopte-prouve` (FR-004) |
| `cadenceValidation` | `par-composant \| lot-de-niveau` | hybride (FR-013) : `par-composant` si origine ∈ {net-new, infere}, sinon `lot-de-niveau` |
| `occurrences` | BlockOccurrence[] | re-mesurées par scan avant extraction (FR-002) |
| `statut` | voir cycle de vie | |

**Validation** : `dependsOn` acyclique ; niveau cohérent avec les dépendances (une
molécule ne dépend jamais d'une section) ; les 5 composants existants (Bouton, Header
nav, piqueray_logo, member-picture, icônes chevron/arrow/piqueray) ne sont **jamais**
des Blocs — ils sont exclus (FR-001) et n'apparaissent que comme `dependsOn` déjà
satisfaites.

**Cycle de vie (transitions strictes)** :

```text
inventorie → audite → master-construit → valide-owner → adopte-prouve
     │          │            │                                │
     │          └─▶ anomalie-en-attente (FR-010, owner tranche puis reprend)
     │
     └─▶ reporte (introuvable au moment de l'externalisation — FR-009/FR-018,
          jamais silencieux, entrée journal obligatoire)

adopte-prouve n'est atteignable QUE si : verdicts 9/9 = identical OU écarts
explicitement acceptés au journal (FR-015) ; ET ledger complet (FR-012).
Échec → rollback (RestorePoint) → retour à l'état précédent l'opération.
```

### BlockOccurrence (une copie brute sur une maquette)

| Champ | Type | Règles |
|---|---|---|
| `maquette` | string | une des 9 pages (Accueil, …) |
| `nodeId` | string | id du node au moment du scan (peut périmer — la position fait foi) |
| `bounds` | {x, y, w, h} | **absolus — la clé d'identification** (jamais le nom) |
| `signature` | string | empreinte structurelle (types + comptes des enfants) pour la classification |
| `nomFigma` | string | documentaire uniquement — jamais utilisé pour identifier |

### InventoryScan (re-mesure, FR-002)

Fichier `inventory/scan-<date>.json`. Champs : `date`, `fileKey`, `pageId` (`210:325`),
`blocs[]` (avec occurrences), `totaux` (par niveau + copies restantes par bloc),
`introuvables[]` (blocs attendus non localisés — nommés, jamais omis).
**Règle de foi** : le dernier scan > `COMPONENT-INVENTORY.md` ; toute divergence met à
jour le MD avec une note datée.

### SourceAudit (étape 0, la règle du Button — FR-006)

Fichier `audits/<bloc>.md` (+ données brutes JSON si utile). Deux volets obligatoires :

| Volet | Contenu |
|---|---|
| **Structure** | arbre des calques, contraintes/auto-layout, bindings de variables existants, tailles, description actuelle |
| **Usage** | chaque occurrence (par position, les 9 maquettes), personnalisations détectées par occurrence, écarts structurels entre copies |

+ `anomalies[]` : chaque découverte hors périmètre → entité Anomalie (proposée à
l'owner, **jamais corrigée en silence** — FR-010).
**Validation** : un Master ne peut être construit sans SourceAudit complet (transition
`inventorie → audite` bloquante).

### Master (le composant gouverné livré)

| Champ | Type | Règles |
|---|---|---|
| `blocCle` | cle | 1 bloc = 1 master (sauf `item` → 3 masters, FR-008) |
| `nom` | string | nom vrai (FR-007) |
| `page` | string | `DS · Atomes` / `DS · Molécules` / `DS · Sections` (R9) |
| `nodeId` | string | id du COMPONENT/COMPONENT_SET créé |
| `proprietes[]` | — | affordances **officielles** (variants, boolean, text, instance-swap) — zéro hack par calque caché (FR-007) |
| `bindings` | — | couleurs → variables, **aucune valeur brute** (FR-007) |
| `description` | string | obligatoire, non vide |
| `dependances[]` | nodeId[] | masters **locaux uniquement** — zéro dépendance tierce (FR-019) |
| `valideLe` | date + réf JournalEntry | la validation owner qui l'a approuvé (FR-013) |

### RestorePoint (FR-017)

| Champ | Type | Règles |
|---|---|---|
| `label` | string | convention `003/<increment>/<étape>` — nommage systématique |
| `createdAt` | date | **avant** chaque opération mutante, sans exception |
| `methode` | const | `saveVersionHistoryAsync` (historique natif) |
| `restauration` | const | **manuelle** (UI Figma, guidée par quickstart) — aucune API programmatique n'existe (R5) ; vérifiée par la même preuve pixel |

### CaptureManifest (une capture d'une maquette)

| Champ | Type | Règles |
|---|---|---|
| `maquette`, `nodeId` | — | la frame capturée |
| `width`, `height` | int | > 0 obligatoire ; comparés strictement before/after |
| `scale` | const `1` | @1x, jamais autre chose |
| `sha256` | string | receipt d'intégrité des octets |
| `capturedAt`, `transport` | — | fraîcheur (R4 — jamais de cache) + chemin utilisé (R3) |
| `statut` | `ok \| vide \| echec` | vide/échec → **jamais** compté `identical` (FR-016) |

### PixelVerdict (le verdict par maquette — FR-014/015/016)

| Champ | Type | Règles |
|---|---|---|
| `maquette` | string | |
| `status` | `identical \| diff \| capture-failed \| dimension-mismatch` | `identical` ⇔ `diffCount === 0` ∧ dimensions égales ∧ deux captures `ok`. `capture-failed` et `dimension-mismatch` ne sont JAMAIS `identical` |
| `diffCount` | int | pixels différents hors bruit AA (pixelmatch threshold 0.1, détecteur AA actif) |
| `diffBox` | {x,y,w,h} \| null | localisation de l'écart |
| `cropTriptyque` | path \| null | avant \| après \| diff sur le diffBox (committé si écart accepté) |
| `refus` | string \| null | raison explicite pour capture-failed / dimension-mismatch |

### AdoptionRun (un incrément d'adoption complet)

| Champ | Type | Règles |
|---|---|---|
| `blocCle`, `date` | — | |
| `checkpoint` | RestorePoint | obligatoire avant l'opération |
| `before[9]`, `after[9]` | CaptureManifest | fraîches, même session (R4) |
| `verdicts[9]` | PixelVerdict | un par maquette |
| `ledger` | réf `ledger/<bloc>.json` | complet (FR-012) |
| `statut` | `prouve \| ecart-accepte \| echec-rollback` | `ecart-accepte` exige la réf JournalEntry (FR-015) ; `echec-rollback` documente le retour arrière |

Fichier : `proofs/<bloc>/verdict.json` + résumé `verdict.md`.

### LedgerEntry (une personnalisation — FR-012)

| Champ | Type | Règles |
|---|---|---|
| `maquette` | string | |
| `position` | bounds | l'occurrence concernée (par position, pas par nom) |
| `type` | `texte \| image \| icone \| visibilite \| autre` | |
| `valeur` | — | le contenu retrouvé (texte, réf image, nom d'icône) |
| `statut` | `reportee \| non-portable-signalee` | non-portable → signalement + entrée journal, **jamais** abandonnée en silence |

### Anomalie (découverte hors périmètre — FR-010)

`{ decouverteLe, bloc, description, proposition, decisionOwner: en-attente | corriger |
differer | ignorer, refJournal }` — une anomalie `en-attente` ne bloque que son bloc,
pas le programme ; la décision est consignée au journal.

### JournalEntry (la trace auditable — FR-020)

Fichier unique **append-only** : `decisions.md`. Types d'entrées :
`validation-master` (unitaire ou lot de niveau) · `ecart-pixel-accepte` (chiffres +
raison obligatoires) · `anomalie-tranchee` · `report-bloc` · `amendement-orga`.
Format détaillé : [contracts/decisions-journal.md](./contracts/decisions-journal.md).
**Validation** : toute transition `valide-owner`, tout `ecart-accepte`, tout `reporte`
exige son entrée — pas d'entrée, pas de transition.

## Invariants transverses

1. **DAG d'abord** : aucune transition `master-construit` si une dépendance n'est pas
   `adopte-prouve` (atomes net-new : `valide-owner` suffit, ils n'ont pas d'adoption).
2. **Preuve avant statut** : `adopte-prouve` sans AdoptionRun complet = impossible ;
   une capture `vide` invalide le run entier (refus, pas verdict).
3. **Owner dans la boucle** : `valide-owner` (cadence hybride) et `ecart-accepte`
   sont des décisions humaines consignées — l'automate ne les prend jamais seul.
4. **Rien ne disparaît en silence** : bloc introuvable → `reporte` + journal ; perso
   non portable → `non-portable-signalee` + journal ; capture vide → refus nommé.
