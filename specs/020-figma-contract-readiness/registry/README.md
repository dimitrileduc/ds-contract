# Registre de readiness 020

`campaign.json` fixe les onze sections, les pins courants et les documents consultés. Il ne
déclare pas le Figma actuel comme référence saine. Le fichier est une entrée versionnée et ne peut
être réduit, complété ou réconcilié par le nom d'un calque.

Lorsqu'un audit live existe, l'entrée de section ajoute `sourceAuditPath` vers son reçu JSON et
`historicalEvidence` référence chaque preuve avec `pathOrUri`, disponibilité et hash lorsque
disponible. Sans `sourceAuditPath`, le CLI produit uniquement un dossier `blocked-history`; avec un
audit propre, il consomme réellement `historicalEvidence` en excluant le pin Figma courant.

`owner-decisions.json` est un journal append-only. Chaque entrée doit respecter
`contracts/owner-decision.schema.json`; une décision de référence et une décision post-réparation
restent deux reçus distincts. Le registre vide signifie exactement « aucune autorisation ».

Les dossiers vivent dans `../dossiers/<section>/`. Les paquets owner, décisions et comparaisons
restent dans leur sous-répertoire afin qu'une conclusion cite ses preuves plutôt qu'un résumé.
`proofs/` contient les sorties de setup, de métriques et de gates; les captures binaires restent
référencées et hashées, jamais converties en une affirmation de conformité.

Pour initialiser des dossiers non autoritaires après avoir vérifié les pins locaux :

```bash
npm run audit:readiness -- --campaign specs/020-figma-contract-readiness/registry/campaign.json --write-inventory
```

Cette commande écrit seulement des dossiers `blocked-history` déclarant l'absence de capture live.
Elle ne lit ni ne modifie le canvas. Le passage à `awaiting-owner`, `diagnosed` ou `closed` exige
les reçus Figma et owner correspondants.
