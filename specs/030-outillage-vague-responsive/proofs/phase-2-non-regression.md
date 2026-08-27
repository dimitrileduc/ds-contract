# Phase 2 — les types existent, aucun verdict existant ne change (T003 / T004)

Date : 2026-08-27. Worktree `just-euphonium` @ `448244fa` + les éditions T003/T004.

## Ce qui a été ajouté (additif seulement)

`extract/figma/projection-repair/types.ts`
- `CaptureMode` (`'full' | 'light'`), `InheritedLockProperty`, `InheritedSizeLock`,
  `InheritedLockWaiver`, `PreflightLockReport`, `GeneratedCampaignProvenance` ;
- trois champs **optionnels** sur `RepairCampaign` : `captureMode?`, `lockWaivers?`, `generated?` ;
- le bloc 030 en fin de fichier : `DesignFactNature`, `DesignAcceptedFact`,
  `DesignDecisionDocument`, `BOARD_ZONE_IDS`, `BoardZone`, `BoardZonesManifest`.

  *(Nettoyage 2026-08-27 : `DriveStepVerdict` et `DriveJournalEntry`, d'abord ajoutés
  ici, ont été retirés — le driver est `scripts/component-repair-drive.mjs`, du JS
  simple, qui ne peut pas les importer. Les garder aurait été une seconde écriture du
  vocabulaire du journal que rien ne vérifie. `DesignDecisionDocument` est en revanche
  bien consommé : `BoardDecisionInput` l'étend.)*

`extract/figma/projection-repair/campaign.ts`
- `CAPTURE_MODES`, `INHERITED_LOCK_PROPERTIES` (deux ensembles fermés) ;
- `validate030AdditiveFields(candidate, issues)`, appelée depuis `validateRepairCampaign`
  juste après `validateComponentWorkflow`.

**Aucun champ existant n'a changé de sens ; aucune valeur par défaut n'a changé.**
Un manifeste qui ne déclare aucun des trois nouveaux champs traverse exactement le même
chemin qu'avant : les trois branches sont gardées par `!== undefined`.

## Ce que la validation refuse désormais (et n'a jamais accepté avant, puisque le champ n'existait pas)

| Champ | Refus |
|---|---|
| `captureMode` hors `{full, light}` | `campaign-shape@$.captureMode` |
| `lockWaivers[i]` sans nodeId/propriété/valeur/raison valides | `campaign-shape@$.lockWaivers[i]` |
| `lockWaivers[i].decisionRef` absent ou non borné | `campaign-shape@$.lockWaivers[i].decisionRef` |
| `generated` sans `by`/`sourceReleve`/`nonDeductible` conformes | `campaign-shape@$.generated` |

La règle load-bearing : **`decisionRef` est obligatoire sur une dérogation.** Une dérogation
sans décision owner derrière elle serait le runner qui s'auto-autorise — ce qu'il ne fait
jamais.

## Preuve de non-régression

```
npx tsc --noEmit                → exit 0
npm run eval                    → 236/237 evals passed
```

Le **seul** rouge est `golden-generated-output` (C1-determinism), la dette golden 028
préexistante, mot pour mot :

> Generated output diverges from golden manifest (25 file[s]):
> src/components/Carte/Carte.module.css, src/components/Carte/Carte.stories.tsx,
> src/components/Carte/Carte.tsx, src/components/GoogleReviews/GoogleReviews.stories.tsx,
> src/components/GoogleReviews/GoogleReviews.tsx — if intentional, npm run golden:update
> in a reviewed change

C'est la **baseline** de la feature : 236/237 avec ce rouge-là et pas un autre. FR-012 /
SC-005 exigent qu'elle soit **strictement inchangée** à la clôture — ni résorbée, ni
aggravée. Elle est citée ici datée, comme le veut la règle des comptes (constitution
§Quality Gates : un compte non daté dans un document vivant est un défaut).

Toutes les campagnes committées du dépôt (24 `campaign.json` sous
`specs/component-repairs/`) traversent `validateRepairCampaign` dans les fixtures
existantes du runner sans qu'un seul verdict ne bouge — c'est ce que le 236/237 identique
mesure.
