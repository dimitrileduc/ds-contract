# Contrat — décision de design (schéma 029 étendu, consommé par 031)

Base : les champs communs du `decisions/README.md` de 029 (`schemaVersion`, `featureId`, `gateId`, `decisionId`, `status`, `decisionMaker`, `decidedAt`, `evidenceRefs`, `acceptedFacts`, `rejectedOptions`, `deferredTopics`, `authorizes`, `forbids`, `supersedes`, `conversationEvidence`). Rien n'est retiré ni repurposé.

## Extensions 030 (obligatoires pour toute décision design 031+)

```jsonc
{
  "pickerConsequence": "Le sélecteur de variantes montrera Presentation{Wide,Desktop,Mobile} × Style × Colonnes ; en Mobile, Colonnes reste affiché mais sans effet.",
  "acceptedFacts": [
    {
      "fact": "Aucun nouveau Text Style n'est créé ; la typo mobile reste locale.",
      "nature": "structurel",
      "witnessRef": "proofs/<...>/picker-avant-apres.png"
    },
    {
      "fact": "À 834 px en 3 colonnes, la carte orpheline garde une largeur de piste.",
      "nature": "visuel",
      "witnessRef": "proofs/<...>/temoin-834-3col.png"
    }
  ]
}
```

## Règles de porte

1. `pickerConsequence` : obligatoire, non vide, en français — une phrase qu'un designer lit sans contexte technique.
2. Chaque `acceptedFact` porte `nature` et `witnessRef` :
   - `visuel` → témoin de rendu 1:1 (jamais de miniature) ;
   - `structurel` → témoin de SÉLECTEUR (capture du panneau avant→après) — un rendu ne prouve rien pour un fait structurel (leçon E2 : wrap interne et axe Presentation ont les mêmes pixels).
3. Fait `structurel` sans témoin ⇒ refus nommé `structural-fact-unwitnessed` — la décision n'est pas présentable à l'owner.
4. Forme courte 029 (`acceptedFacts: string[]`) : LUE pour l'histoire, jamais ÉCRITE par 030+.
5. La planche générée (zones.json) doit référencer chaque `witnessRef` — `structuralFactsAllWitnessed` est un check machine, pas une intention.
