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
