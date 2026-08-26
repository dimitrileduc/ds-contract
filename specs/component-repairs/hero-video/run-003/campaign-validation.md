# Validation initiale de campagne — run-003

**Exécuté à :** `2026-08-25T20:39:58Z`  
**Campaign sha256 :** `2bfb1da7e6550abf7b159028292bf0e0bd15ca4320051dd6b1f4e7d12a85a943`  
**Mode :** validation JSON/TypeScript pure; aucun accès Figma REST, aucun Bridge,
aucun writer canvas, aucune mutation live

## Résultat global

`PASS — enveloppe initiale valide, volontairement non exécutable.`

La campagne est suffisamment bien formée pour ouvrir l'audit futur, mais elle
reste `draft`, son pin est historique, les captures before sont incomplètes,
H1/H2/H3 sont pending et le mécanisme responsive n'existe pas encore. Toute
préparation d'application ou émission Bridge doit donc rester refusée.

## Contrôles positifs

| Contrôle | Résultat |
|---|---|
| Parsing JSON avec `jq` | PASS |
| `validateRepairCampaign(campaign)` | `ok: true`, `issues: []` |
| Exactement une cible `hero-video` | PASS |
| Toutes les `authorityRefs` existent | PASS |
| Destinations audit/captures/receipts/verify bornées sous `run-003`; dossiers de phases présents | PASS |
| `freshCampaign.copiedExecutionEvidence` | `[]` |
| État initial / autorisation | `draft` / `mutationAllowed=false` |
| Politique Page | `forbid-direct`; listes de writes attendues vides |

Commande de validation pure :

```bash
npx tsx -e "import {readFileSync} from 'node:fs'; import {validateRepairCampaign} from './extract/figma/projection-repair/campaign.ts'; const value=JSON.parse(readFileSync('specs/component-repairs/hero-video/run-003/campaign.json','utf8')); console.log(JSON.stringify(validateRepairCampaign(value), null, 2));"
```

## Refus observés et attendus

| Probe non mutante | Résultat observé | Attendu |
|---|---|---|
| Dry-run sur campagne `draft` avec before incomplet | `dry-run requires a complete before capture and ready-to-apply state` | REFUS PASS |
| Émission du mécanisme planifié `responsive-component-set` | `unsupported mechanism responsive-component-set` | REFUS PASS jusqu'à T026–T035 |
| Copie mémoire de la campagne avec opération ciblant Home `2170:6351` | `operation-allowlist` / `direct operations on Page instances are forbidden` | REFUS PASS |
| Pin `historical-027-context` | gate 028 exige un repin frais à T009 | REFUS attendu avant audit/proposition live |
| H1/H2/runner/spike/H3 non approuvés | `mutationAllowed=false` et préconditions non satisfaites | REFUS attendu avant toute écriture |

Les probes ont modifié uniquement des copies mémoire du JSON. Le fichier
`campaign.json` n'a pas été altéré par leur exécution.

## Lacunes volontairement exposées

Le validateur v2 actuel accepte l'enveloppe responsive comme champs additionnels
sans encore les valider. Deux gaps sont donc enregistrés comme preuves de T005 :

1. une copie mémoire remplaçant l'opération par un `set-properties` sur l'enfant
   existant `2563:5966` obtient encore `ok: true`; la future validation doit
   refuser avec `shared-child-write-forbidden`;
2. le mécanisme et les listes de créations attendues ne sont pas compris par le
   modèle actuel; la validation de campagne ne compare donc encore ni rôle/count
   des créations, ni bindings, ni scénarios, ni exceptions typographiques.

Ces lacunes ne sont pas contournées. Elles sont les échecs que T021–T024 doivent
figer par fixtures rouges avant l'implémentation runner. Le Bridge actuel refuse
déjà le mécanisme, ce qui empêche une application accidentelle.

## Frontière confirmée

- `figmaWrites=[]` par absence d'appel live;
- `pageWrites=[]` et aucun nœud Page ciblé;
- aucun child write, aucune création Figma et aucun reçu d'application produit;
- `run-002` reste intact et aucune de ses preuves n'a été copiée;
- aucune étape de Phase 3 ou ultérieure n'a été exécutée.
