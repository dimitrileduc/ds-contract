# Schéma — `contracts/named-literals.registry.json` (le registre des littéraux nommés, FR-003)

**Statut** : nouveau document gouverné, SSoT, versionné comme `contracts/icons.registry.json` (le précédent du répertoire — les chargeurs de contrats filtrent sur `.contract.json`, aucune collision). **Une seule source, lue en direct par le contrôle** (geometry-gate §1) — jamais dupliquée, jamais mise en cache.

## Forme

```jsonc
{
  "schemaVersion": 1,
  "note": "Liste FERMÉE des canaux géométriques légitimement sans vocabulaire de token (FR-003). La doctrine vise zéro valeur INVISIBLE, pas zéro littéral. Toute addition est une décision consignée avec reçu — jamais un ajout silencieux.",
  "entries": [
    {
      "contractId": "ds.hero",                       // contrat porteur — doit exister
      "pointer": "/anatomy/root/literals/background-image",   // JSON Pointer RFC 6901 — doit résoudre
      "channel": "background-image",                 // ∈ canaux géométriques (geometry-gate §2)
      "value": "linear-gradient(to top, rgba(0,0,0,0) 75%, rgba(0,0,0,0.5) 100%)",
      "reason": "Voile GRADIENT_LINEAR du master hero (fills[2]) — un token gradient à usage unique fabriquerait un faux vocabulaire.",
      "decidedOn": "2026-08-04",                     // date de la décision consignée
      "receiptId": "hero-gradients-named-literal"    // reçu publié sous specs/015-…/proofs/recus/
    }
  ]
}
```

## Invariants (chacun refusé PAR NOM par geometry-gate)

1. **À l'entrée près** : la granularité est `(contractId, pointer, channel)` — jamais « tout le canal X » ni « tout le contrat Y ».
2. **Valeur épinglée** : `value` est comparée byte-à-byte à la valeur du contrat — un littéral nommé est *surveillé* : s'il change d'un côté, la porte le signale (`registry-value-mismatch`). Nommé ≠ invisible, ET nommé = comparé.
3. **Rien d'implicite** : `reason`, `decidedOn`, `receiptId` obligatoires (`registry-entry-undocumented` sinon).
4. **Pas d'exception morte** : un pointeur qui ne résout plus refuse (`registry-entry-orphaned`) — l'entrée se retire avec sa raison, elle ne s'accumule pas.
5. **Amorce** : exactement les 2 dégradés du hero à la création (root fills[2] « to top … 75 %/100 % » ; Titres fills[0] « to bottom … 0 %/60 % » — valeurs relevées de la description datée du contrat hero v1.3.0, re-vérifiées sur le dump avant écriture).

## Gouvernance

Une addition découverte pendant l'inventaire = une décision d'owner consignée dans `specs/015-…/decisions` + un reçu sous `proofs/recus/`, PUIS l'entrée. Le diff de PR de ce fichier est la revue de la décision (même modèle que le diff d'un contrat, constitution VI).
