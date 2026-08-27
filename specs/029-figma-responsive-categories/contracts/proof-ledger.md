# Interface Contract — Proof Ledger (029)

Ce contrat interne définit les preuves exigées pour H3/H4 et leur forme. Adapté de
`028/contracts/proof-ledger.md`: 2 masters et 7 usages au lieu d'un master et d'une
instance Home.

## Capture sets

| Set | Surfaces | Rules |
| --- | --- | --- |
| `before` | Set section (chaque variante), carte (chaque variante), 7 usages | AVANT la première écriture du premier run; non vides, dimensions vérifiées; jamais un sous-ensemble pilote (§X, FR-023) |
| `after` | Les mêmes | Après le premier passage des deux runs |
| `idempotence` | Les mêmes | Après le second passage no-op |

Chaque entrée: PNG + structure + propriétés + faits, dimensions et digest.

## Usage pixel contract

Chaque usage rend comme sa capture before, ou présente un écart chiffré, attribué
à une cause nommée (delta propagé attendu, ou changement accepté owner) — jamais un
écart silencieux (FR-027, SC-005).

## Scenario matrix (minimum)

6 largeurs × 2 configurations × 2 contenus, sélection explicite:

| Largeur | Configurations | Fixtures |
| --- | --- | --- |
| 320, 390 | mobile (1 carte/ligne, colonnes 2 ET 3 d'origine) | normal, long |
| 834 | comportement accepté à H2 | normal, long |
| 1200, 1440 | desktop, colonnes 2 et 3 | normal, long |
| 1728 | wide, colonnes 2 et 3 | normal, long |

Chaque ligne: `overflow=false`, `clippedBy=[]`, `contentAccessible=true`; témoins
mobiles: `cardsPerRow=1` et aucun réglage de colonnes exposé; 3 colonnes aux
largeurs intermédiaires: le rendu réel (ligne incomplète comprise) est montré.

## Receipts

| Receipt | Rules |
| --- | --- |
| `apply-first` (×2 campagnes) | 100 % créations/modifications déclarées; `pageWrites=[]`; section: `childWrites=[]` + deltas propagés attribués |
| `apply-second` (×2 campagnes) | Toutes opérations `no-op`; `createdNodeIds=[]`; `changedNodeIds=[]`; faits protégés identiques |
| `verify` / `verify-idempotence` | Faits protégés (data-model §10) comparés avant/après/idempotence |

## Deviation register

`handoff/ecarts-028.md` — une entrée `TemplateDeviation` par écart, consignée au
moment de son apparition avec sa cause (FR-033, SC-013). Le ledger de clôture
référence le registre; un écart découvert à la clôture sans entrée datée est un
défaut du déroulé.

## Closure ledger (H4)

- Statut `figma-ahead/pending-home-responsive-promotion`; dérive nommée vis-à-vis
  de `ds.categories-principales` v1.0.0 et `ds.carte-categorie` v1.1.0.
- `parityPosture`: décision owner H4 sur le rapport de dérive réel (FR-036).
- Garde de régénération active; couche Odoo 023 intacte, non migrée, non déclarée
  convergente.
- Inventaire par comportement: structure, primitives, overrides typographiques,
  limites, enfants différés, décisions owner (SC-012).
- Déclaration explicite: contrats, code, HTML, Odoo et breakpoints automatiques
  non qualifiés par 029 (SC-014).
