# Interface — registre des défauts de source et clôture aux portes

## `specs/016-canvas-vrai/registre/defauts-source.json`

Le registre gouverné des **10** défauts (FR-003/FR-008). Une entrée :

```jsonc
{
  "schemaVersion": 1,
  "items": [{
    "id": "DW-002" | "DW-003" | "B013-1"…"B013-8",
    "provenance": "specs/013-…/proofs/deferred/work.json" /* DW */ 
                | "mémoire projet figma-cleanup-backlog-013 (2026-07-30)" /* B013 */,
    "diagnosticVif": {           // re-relevé AVANT geste — la mémoire/le registre d'origine n'est jamais la preuve
      "figmaVersion": "…", "nodes": [{ "nodeId": "…", "position": {...}, "observe": "…" }]
    },
    "correction": "…",           // le geste choisi ; DW-002 : cartes à 363,5 (décision owner 2026-08-05)
    "decisionOwnerRequise": false, // true : B013-6 (texte-seo — intention ou accident, consignée avant geste)
    "lotId": "L-DW002",
    "promotionCodeSide": { "fichiers": ["tokens/primitives.tokens.json"], "semver": "…" } | null,
    "limitesLevees": [{ "quoi": "…", "preuveNonRegression": "proofs/recus/…" }],   // FR-009
    "recu": "proofs/recus/<id>.md|json",   // re-testable : méthode + relevé + commande de re-vérification
    "statut": "ouvert" | "annonce" | "corrige" | "clos"
  }]
}
```

## Clôture aux portes (les comptes imprimés font foi — FR-008)

- **DW-002 / DW-003** : dans `specs/014-mesure-juste-triage/proofs/registre/causes.json`, l'entrée correspondante reçoit `resolvedBy: "016-canvas-vrai"` — sémantique v2 de la porte (`specs/015-geometrie-gouvernee/contracts/measure-gate-counting-v2.md`) : l'entrée **reste** au registre et sous C4 (reçu re-testé exigé), elle sort seulement du « travail à faire ». Attendu : `npm run measure:gate` imprime `figma-source: 0` (aujourd'hui 2) et `contract-geometry: 0` inchangé — **le compte vif imprimé fait foi si l'attendu est contredit**.
- **`specs/013-…/proofs/deferred/work.json`** : DW-002/DW-003 passent `status: "deferred"` → clos par référence croisée (champ additif, jamais de réécriture d'historique).
- **B013-1…8** : clôture dans CE registre + rapport ; la mémoire projet `figma-cleanup-backlog-013` est mise à jour pour pointer ici (une mémoire périmée ressortirait les défauts comme vivants).
- **Semver des promotions** (§VI) : B013-8 (`outilneNoir` → renommage d'une valeur d'enum) = bump **MAJEUR** de `ds.button` + migration des consommateurs du dépôt dans le même mouvement ; B013-2/3 (alignement/emphase : axe code-side → binding VARIANT) = mineur ; suppressions de props orphelines côté master sans contrepartie contrat = pas de bump (le contrat ne les portait pas).
- **Re-pins dérivés** : tout contrat/token touché ⇒ `evals/golden.json` + `figma-sync/plugin/engine.receipt.json` ; toute édition d'émetteur (volet Field, si elle a lieu) ⇒ + `examples/polaris/figma/*.figma.js` (3e reçu).
