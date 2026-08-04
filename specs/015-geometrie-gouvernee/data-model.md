# Data Model — Géométrie gouvernée (015)

**Date**: 2026-08-04 · Références : spec.md § Key Entities, research.md D1–D14.

Aucune entité ne vit en base : tout est JSON commité (contrats, tokens, registres, preuves), conforme à l'architecture du dépôt. Ce document fixe les formes ; les schémas d'interface détaillés sont dans `contracts/`.

---

## 1. Dimension géométrique (entité conceptuelle, pas un fichier)

Toute valeur de mise en page portée par un contrat. Localisée par `(contractId, pointer RFC 6901, channel)`.

**Canaux géométriques** (l'ensemble fermé que la porte D7 surveille — voir `contracts/geometry-gate.interface.md` §2) :
`width, height, min-width, min-height, gap, padding-block, padding-inline, padding-top, padding-right, padding-bottom, padding-left` — plus, au titre des exceptions déclarées uniquement, `background-image` (les dégradés). Les canaux de peinture/typo (`color`, `font-size`, …) et de trait (`border-*`) sont HORS population : la spec vise la géométrie de mise en page.

**États** (machine à 3 états, le 3e disparaît à la clôture) :

| État | Représentation dans le contrat | Visible par |
|---|---|---|
| Référence gouvernée | `tokens`/`tokensByProp` : `"{space.89}"`, `"{size.logo.{taille}.width}"` | axes du différentiel (code : custom properties consommées ; tokens : `tokens/*.json`) + porte géométrie |
| Littéral nommé | `literals`/`literalsByProp` + entrée au registre §3 | porte géométrie (présence + valeur épinglée comparée) |
| **Nombre invisible** (refusé) | `literals` sans entrée de registre | rien — c'est l'état que SC-001 met à zéro |

**Transitions** : invisible → référence (conversion pure, FR-012 : valeur résolue identique) ; invisible → littéral nommé (décision consignée, reçu) ; littéral nommé → référence (si un vocabulaire naît plus tard). Jamais l'inverse sans décision consignée.

## 2. Référence créée from-dump (feuille de `tokens/primitives.tokens.json`)

```
space.<N>                    — espacement générique (idiome 012)   ex. space.89 = "89px"
size.<composant>.<usage|axe> — taille intrinsèque sémantique       ex. size.logo.<valeur>.width
```

Champs DTCG : `$type: "dimension"`, `$value` = valeur observée exacte (jamais arrondie), `$description` = provenance (« Authored from <dump/relevé>, node <id>, <date> — minted from-dump so anatomy references tokens, not literals »). Règle de validation : un mint sans provenance dans `$description` est refusé en revue ; la valeur doit être retrouvable dans le dump cité (SC-007).

## 3. Littéral nommé — `contracts/named-literals.registry.json` (NOUVEAU, SSoT)

```jsonc
{
  "schemaVersion": 1,
  "note": "Liste FERMÉE des canaux géométriques légitimement sans vocabulaire (FR-003). Une entrée = une exception, à l'entrée près. Toute addition est une décision consignée avec reçu — jamais un ajout silencieux.",
  "entries": [
    {
      "contractId": "ds.hero",
      "pointer": "/anatomy/root/literals/background-image",
      "channel": "background-image",
      "value": "linear-gradient(to top, rgba(0,0,0,0) 75%, rgba(0,0,0,0.5) 100%)",
      "reason": "Voile GRADIENT_LINEAR du master (fills[2]) — aucun vocabulaire de token gradient n'existe ni ne doit être fabriqué pour un usage unique.",
      "decidedOn": "2026-08-04",
      "receiptId": "hero-gradients-named-literal"
    }
    // + l'entrée jumelle Titres (fills[0], to bottom … 60%)
  ]
}
```

**Invariants** (refus par nom dans la porte, §5) : `pointer` doit résoudre dans le contrat cité ; `value` doit être byte-identique à la valeur du contrat ; `reason`, `decidedOn`, `receiptId` obligatoires ; une entrée dont le pointeur ne résout plus est `registry-entry-orphaned` (l'exception morte se retire, elle ne s'accumule pas).

## 4. Correctif manuel 013 — `specs/015-geometrie-gouvernee/fixtures/corrections-013.json` (NOUVEAU)

```jsonc
{
  "schemaVersion": 1,
  "provenance": "Reconstruit depuis specs/013-…/proofs/deferred/work.json (DW-004) + git log de la fenêtre 013 sur contracts/ — 013 n'a pas produit proofs/closure/, et ce fichier le dit.",
  "entries": [
    { "contractId": "ds.footer", "pointer": "/anatomy/root/…", "channel": "padding-left", "expectedResolvedPx": "89px", "setBy": "013 vague 2" }
    // … padding-top 128px, gaps 48/32/16 (ds.footer, ds.faq, ds.reassurances), liste close par le relevé T-early
  ]
}
```

**Contrôle associé** (D10) : pour chaque entrée, la valeur EFFECTIVE actuelle du contrat (littéral, ou référence résolue via l'inventaire de tokens) doit égaler `expectedResolvedPx`. Une conversion pure passe ; un écrasement refuse par nom. États d'une entrée : `preserved` (littéral intact) → `converted-preserved` (référence, même valeur résolue) — `clobbered` est l'état refusé.

## 5. Porte géométrie — résultat de `npm run geometry:gate` (NOUVEAU)

```ts
interface GeometryGateResult {
  schemaVersion: 1;
  verdict: 'pass' | 'fail';        // exit 0 | 1 (2 = blocked, artefacts illisibles)
  counts: {
    contracts: number;             // 34, compté en direct
    geometricEntries: number;      // population totale relevée (littéraux géométriques)
    governedRefs: number;          // références de tokens sur canaux géométriques (information)
    namedLiterals: number;         // entrées de registre appariées
    invisible: number;             // SC-001 : doit être 0 à la clôture
    byContract: Record<string, number>;   // invisibles par contrat
    byChannel: Record<string, number>;    // invisibles par canal
  };
  refusals: Array<{ code: 'invisible-literal' | 'unregistered-literal' | 'registry-value-mismatch'
                        | 'registry-entry-orphaned' | 'registry-entry-undocumented';
                    subject: string;      // "ds.hero/anatomy/root/literals/gap" — jamais anonyme
                    message: string }>;
}
```

Entrées lues : `contracts/*.contract.json` (via `inventoryLiterals`, art antérieur 013) + le registre §3. Pur (gate.ts) / CLI (run.ts), fixture d'eval data-only — patron `measure-gate`.

## 6. Comptage v2 de la porte de mesure (extension de types existants — `extract/figma/measure-gate/gate.ts`)

```ts
interface MeasuredLine {            // existant, + 1 champ
  aggregateOf?: string[];           // dwIds — cette ligne est la CONSÉQUENCE de N faits :
}                                   // elle contribue 0 à byCause, ses N faits comptent chacun 1
interface ReclassifiedDwEntry {     // existant, + 1 champ
  resolvedBy?: string | null;       // non nul ⇒ plus un travail à faire ⇒ hors byCause (reste sous C4)
}
```

**Règle de comptage v2** (unité = travail à faire, FR-006) :
`byCause[c] = |lignes divergentes de cause c SANS aggregateOf ET non « expliquées » (une ligne avec aggregateOf compte 0)| + |entrées DW de cause c, resolvedBy nul, non dédupliquées par dedupeKey|`.
Les deux directions de dédoublonnage coexistent, jamais sur la même paire : `dedupeKey` (le FAIT s'efface, la LIGNE compte — 1:1) ; `aggregateOf` (la LIGNE s'efface, les FAITS comptent — 1:N).

**Donnée modifiée** : `causes.json` § `organismLines`, ligne `footer/footer-master-defaults` reçoit `"aggregateOf": ["DW-001", "DW-004", "DW-005"]` ; à la clôture les 3 entrées reçoivent `"resolvedBy": "015"`. Relevé d'ouverture attendu après remodelage : `contract-geometry: 6`, `instrument: 0` — **le compte vif imprimé par `npm run measure:gate` fait foi, jamais ces attendus**.

## 7. Registre avant/après 015 — `specs/015-geometrie-gouvernee/proofs/registre/`

Mêmes formes que 014 (`avant.json`, `apres.json`, `causes.json`, `REGISTRE.md` rendu — outil `build-registre.mts` paramétré en sortie, D11). L'`avant` est une **re-mesure** dans la fenêtre de la feature (même navigateur exigé entre phases — refus `browser-changed-between-phases` existant).

## 8. Attribution de cause (vocabulaire des variations de 015)

Toute variation de chiffre publié entre `avant` et `apres` porte exactement une cause, avec reçu :

| Cause 015 | Attendue sur | FR |
|---|---|---|
| `box-model-unification` | les 9 contrats du rayon DW-014-002, eux seuls | FR-004, SC-003 |
| `pure-conversion` | **aucune variation** (préservation prouvée, pas d'effet) | FR-012 |
| `gradient-carry` | ligne hero (le 28,07 % mesuré des deux voiles) | FR-001/FR-003 |
| `named-repair:<DW-id \| ligne>` | Avec-CTA, texte-seo, footer (DW-004/005), coordonnees, logo (DW-001) | FR-006/007/008 |
| `discovered:<fait>` | toute découverte en cours de chantier — le compte remonte avant de descendre, consigné | edge case spec |

Une variation sans cause = publication suspendue (FR-011). Un chiffre qui bouge hors périmètre attribué = suspension jusqu'à attribution.

## 9. Contrats modifiés (récapitulatif des documents SSoT touchés)

| Document | Changement | Semver |
|---|---|---|
| `contracts/piqueray-logo.contract.json` | + prop `taille` (figma NONE, note → 016) ; literals w/h → `{size.logo.{taille}.*}` | minor 0.1.0 → 0.2.0 |
| `contracts/header.contract.json`, `footer.contract.json` | l'instance logo passe `taille` dans `component.props` | minor |
| `contracts/hero.contract.json` | + 2 littéraux `background-image` (root, Titres) ; conversions des littéraux géométriques | minor |
| 25 autres contrats porteurs de littéraux géométriques | conversions littéral → référence, valeur identique | patch/minor selon le cas, en revue |
| `tokens/primitives.tokens.json` | mints from-dump : `space.N` manquants + `size.<composant>.*` | additif |
| `packages/schema/src/contract-schema.ts` | + `background-image` dans `LITERAL_CHANNELS`, grammaire bornée par canal | additif (VI) ; `docs/02` bumpé |
| `contracts/named-literals.registry.json` | NOUVEAU document gouverné | v1 |
| `specs/014-…/proofs/registre/causes.json` | + `aggregateOf` (ligne footer) ; `resolvedBy: "015"` à la clôture ; destination DW-014-001 → tinyspec nommée | registre vivant de la porte |
