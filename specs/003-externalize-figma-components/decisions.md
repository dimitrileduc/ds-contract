# Journal de décisions — spec 003 · Externalisation des maquettes Piqueray

**Contrat de format** : [contracts/decisions-journal.md](./contracts/decisions-journal.md).
**Append-only** : on ajoute en fin de fichier, on ne réécrit jamais une entrée passée —
une erreur se corrige par une nouvelle entrée qui référence l'ancienne. Pas d'entrée,
pas de transition : `valide-owner`, `ecart-accepte` et `reporte` sont inatteignables
sans l'entrée correspondante committée (FR-020).

**Types d'entrées** : `validation-master` · `ecart-pixel-accepte` · `anomalie-tranchee`
· `report-bloc` · `amendement-orga`.

**Gabarit** :

```markdown
## <AAAA-MM-JJ> — <type> — <composant(s)>

- **Type** : validation-master | ecart-pixel-accepte | anomalie-tranchee | report-bloc | amendement-orga
- **Composant(s)** : <cle(s) de bloc, ou « programme »>
- **Verdict owner** : <la décision, en une phrase>
- **Chiffres** : <obligatoire pour ecart-pixel-accepte : diffCount par maquette + diffBox ;
  pour validation-lot : liste des masters couverts>
- **Raison** : <obligatoire pour ecart-pixel-accepte, anomalie-tranchee, report-bloc>
- **Preuve** : <réf. proofs/<bloc>/verdict.json, ledger/<bloc>.json, audits/<bloc>.md — quand applicable>
- **Checkpoint** : <label du point de restauration couvrant l'opération, quand applicable>
```

---

<!-- Les entrées commencent sous cette ligne, en ordre chronologique. -->

## 2026-07-24 — validation-master — programme (T021 · filet de rollback, US5)

- **Type** : validation-master *(écart de type nommé : le contrat n'a pas de type dédié aux drills de mécanisme — l'objet validé ici est le filet de rollback du programme, pas un master ; nommé plutôt qu'omis)*
- **Composant(s)** : programme
- **Verdict owner** : restore manuel exécuté par l'owner via l'historique de versions natif (« done restaure ») ; drill de rollback validé de bout en bout
- **Chiffres** : preuve positive — page témoin `2049:1002` et rectangle `TEMOIN-T021` `2049:1003` DISPARUS après restore (relecture par id et par nom, fichier revenu à 2 pages) ; contrôle collatéral — 9/9 `identical`, exit 0
- **Raison** : n/a (succès — aucun écart accepté)
- **Preuve** : `proofs/T0-rollback-drill/{drill.md, verdict.json, verdict.md}`
- **Checkpoint** : `003/rollback-drill/avant` (versionId `2379687215163752024`)

*Anomalie en attente (sera tranchée par une entrée dédiée)* : dérive nocturne
23→24 sur les titres hero de `Portes de garage` (2 039 px) et `Portes de garage
résidentielles` (4 080 px), hors bruit AA — receipts dans
`proofs/T0-rollback-drill/derive-nocturne/` ; aucune police manquante ; cause à
identifier avec l'owner (édition des titres ? mise à jour Figma ?).
