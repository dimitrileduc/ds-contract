# Data Model — Photos honnêtes (017)

**Date**: 2026-08-06 · Références : [spec.md](spec.md) § Key Entities, [research.md](research.md) D1–D17.

Aucune entité ne vit en base : tout est JSON commité (registres, preuves) ou structure en mémoire d'un instrument. Ce document fixe les **formes** et les **invariants** — ce que chaque porte refuse **par le nom**. Les schémas d'interface détaillés sont dans [`contracts/`](contracts/).

**Fait de cadrage, valable partout ci-dessous : aucun contrat ne gagne un champ image.** Une part image reste `element: "img"` + une prop scalaire d'URL de type texte, défaut vide (FR-012, research D13). Les entités ci-dessous vivent dans les **instruments** et les **registres**, jamais dans `contracts/*.contract.json`.

---

## 1 · CadrePhoto (entité conceptuelle — aucun fichier)

L'emplacement qu'une part image représente. Il porte une **route** fournie à l'exécution, jamais des octets. Il n'est pas la photo.

| Face | Représentation | Visible par |
|---|---|---|
| Contrat | `anatomy.<part>.element === "img"` + prop d'URL (`type: "text"`, `default: ""`) | le schéma Zod, `npm run build` |
| Code | `<img src="{...}">` dans la surface générée | `npm run parity` axe code ⟷ contrat |
| Canvas | frame + `imgPlaceholder: true` → lavis `#D9D9D9`, **plus la clause de légende** (§6) | `npm run parity` axe figma ⟷ contrat |
| Variables Figma | **rien, pour toujours** — `docs/FIGMA-CAPABILITY-MATRIX.md:91`, colonne Bindable : `— (image content not bindable)` | aucun axe : c'est la lacune A5, ouverte et nommée |

**Population : 12 parts sur 9 contrats** — `ds.product-card` (Image), `ds.carte` (reassuranceImage, categorieImage), `ds.realisation` (Image), `ds.hero` (Background), `ds.review-card` (avatarPhoto), `ds.coordonnees` (googleMap), `ds.devis` (Background), `ds.member-picture` (funIa, normal), `ds.sav` (background, img).

**Invariants.** La prop d'URL a **toujours** `default: ""` — un défaut non vide substituerait une image et entrerait au contrat par la porte de derrière. `bindings.figma.kind` vaut `NONE` sur 11 des 12 ; la douzième (`ds.review-card.photoUrl`, `kind: "TEXT"`) se déclare elle-même *« inerte sur le canevas »* et cette description ne se retire pas. Le canal `background-image` du schéma n'accepte que `linear-gradient(...)` (`GRADIENT_LITERAL_RE`) : une `url()` **refuse à la validation du schéma**, pas à l'émission.

---

## 2 · PhotoDeMaquette (une empreinte relevée à un emplacement)

L'image posée par le designer, sur un composant maître **ou sur une instance de page**. Contenu, jamais donnée de contrat. C'est l'unité que le contrôle suit.

```jsonc
{
  "hostId": "2115:4044",              // id du nœud racine porteur : maître OU instance de page
  "hostNom": "Equipe",                // documentaire — jamais une clé
  "maquette": "À Propos",             // page d'appartenance, documentaire
  "cheminPosition": "3/1/0",          // indices depuis l'hôte — LA clé, jamais le nom de calque
  "nomCalque": "fun-ia",              // documentaire uniquement (§VIII : un renommage n'est pas une perte)
  "porteur": "instance-override",     // "master" | "instance-override" — déduit par remontée d'ancêtres
  "imageHash": "508388d6…",           // identité PRIMAIRE : Figma adresse le contenu (même hash ⇔ mêmes octets)
  "sha256": "a91f…",                  // contre-preuve re-testable HORS Figma (le bac à sable n'a pas `crypto`)
  "scaleMode": "FILL",
  "boundsAbsolus": { "x": 0, "y": 0, "w": 364, "h": 364 }
}
```

**Un seul nom par chose — glossaire, parce que quatre circulaient.** `cheminPosition` est **le** nom de la clé positionnelle (indices depuis l'hôte, `"3/1/0"`) : c'est lui qui s'écrit dans le code, les registres et les messages d'erreur. « **rang** » est son mot français en prose, dans la spec et les rapports lus par l'owner — même chose, jamais une autre. « **chemin d'indices** » est une périphrase, admise en prose seulement. **`ordre`** ne désigne PAS cela : c'est la clé du **repli** de D1 (rang d'apparition dans un relevé orchestré, quand la position n'est pas disponible) — ne jamais l'employer pour le chemin nominal.

**Invariants.** `(hostId, cheminPosition)` est la clé d'emplacement, et elle est **positionnelle par construction** — `nomCalque` ne participe à aucune comparaison. `imageHash` absent ⇒ la photo est **non vérifiable**, jamais « identique » : un contrôle empêché n'est pas un contrôle vert (FR-015). `sha256` est calculé côté Node à partir des octets rendus par `figma.getImageByHash(h).getBytesAsync()` ; son absence dégrade le verdict à « identité primaire seule », et cette dégradation est **imprimée**.

**Population de référence (relevé du 2026-08-05, `specs/016-canvas-vrai/proofs/photos/RECONCILIATION.md`)** : 349 photos vivantes, 86 images distinctes, dont **255 `instance-override`** contre 94 `master`. Les trois quarts de la population sont exactement ce que le sauvetage actuel ne voit pas.

---

## 3 · RapportDePhotos — la sortie du contrôle (par composant, par hôte)

Produit avant/après reconstruction. **Il peut échouer ; c'est sa raison d'être.**

```jsonc
{
  "schemaVersion": 1,
  "contractId": "ds.reassurances",
  "executeLe": "2026-08-07T09:12:03Z",
  "surface": "headless",              // "headless" (faux-Figma, fait foi) | "vif" (fichier client, le reçu)
  "hotes": [
    {
      "hostId": "2115:3892",
      "hostNom": "Reassurances",
      "maquette": "Accueil",
      "attendues": 5,                 // empreintes relevées AVANT
      "retrouvees": 5,                // même empreinte, même emplacement
      "distinctesAvant": 5,           // dit l'effondrement en clair (17 → 2 se lit ici)
      "distinctesApres": 5,
      "deplacees": [],                // { de: "3/1/0", vers: "3/1/2", imageHash } — l'interversion
      "nonReplacees": [],             // { cheminPosition, imageHash, nomCalque } — la perte
      "nonVerifiables": [],           // imageHash absent, octets illisibles — dit, jamais compté comme succès
      "acquittees": []                // { imageHash, motif, decidePar } — levées owner, visibles ici
    }
  ],
  "verdict": "vert",                  // "vert" | "rouge" | "empeche"
  "refusAvantMutation": null          // { imageHash, hostId, cheminPosition, raison } quand D2 a refusé
}
```

**Invariants — ce que la porte refuse par le nom.**

1. `verdict: "vert"` est **interdit** si `nonReplacees`, `deplacees` ou `nonVerifiables` est non vide sur un hôte quelconque. Un rapport vert en présence d'une perte est la classe de bug la plus grave d'ici.
2. `distinctesApres < distinctesAvant` ⇒ **rouge**, avec l'hôte nommé. C'est le canal qui dit l'effondrement (« 17 portraits distincts à l'origine, 2 au vif ») quand le compte total de photos, lui, n'a pas bougé.
3. `deplacees` non vide ⇒ **rouge**, avec les **deux** emplacements nommés (FR-004, SC-002). L'interversion est fermée, pas reconduite.
4. `acquittees` n'entre **jamais** dans le calcul du vert sans être imprimée dans sa propre section (FR-003b) — même discipline que `parity/baseline.json`, qui compte et imprime ses acquittements sans jamais rougir.
5. `verdict: "empeche"` existe et n'est pas un échec de mesure honteux : source inaccessible, relevé impossible, pont absent. Un contrôle empêché n'est **jamais** vert (FR-015).
6. Deux exécutions successives sans geste rendent un rapport **identique** hors `executeLe` (SC-009).

---

## 4 · AcquittementPhoto — `specs/017-photos-honnetes/registre/acquittements-photos.json` (NOUVEAU, gouverné)

Liste **fermée**. Une entrée = une photo levée nommément, pour le cas légitime d'une part retirée du contrat.

```jsonc
{
  "schemaVersion": 1,
  "note": "Levées owner du refus FR-003a. Une entrée = une photo, à la photo près. Toute addition est une décision consignée avec reçu — jamais un ajout silencieux. Une entrée dont l'hôte ou le rang ne résout plus est ORPHELINE et se retire : l'exception morte ne s'accumule pas.",
  "entries": [
    {
      "hostId": "2115:4044",
      "cheminPosition": "3/1/0",
      "imageHash": "508388d6…",
      "motif": "La part `ancienNom` a été retirée de ds.equipe v2.0.0 — la photo n'a plus d'emplacement d'accueil par décision de contrat, pas par accident.",
      "decidePar": "owner",
      "decideLe": "2026-08-07",
      "receiptId": "acq-equipe-part-retiree"
    }
  ]
}
```

**Invariants.** Les **sept** champs sont **obligatoires**, et les voici nommés pour qu'une porte puisse les refuser sans interprétation : `hostId`, `cheminPosition`, `imageHash`, `motif`, `decidePar`, `decideLe`, `receiptId`. Une entrée incomplète refuse au chargement. *(Le compte disait « six » pour sept champs listés — corrigé le 2026-08-06 ; une porte fail-closed ne peut pas s'écrire sur un compte approximatif.)* `imageHash` doit correspondre à l'empreinte réellement relevée à `(hostId, cheminPosition)` — un acquittement ne lève **que** la photo qu'il nomme, jamais un emplacement en général. Une entrée orpheline (hôte disparu, rang hors bornes) est signalée `acquittement-orphelin` et retirée. Le registre est lu par le refus de D2 **et** imprimé au rapport (§3, `acquittees`).

---

## 5 · EchantillonDeMesure — la photo de maquette exportée, prêtée à notre surface

Elle appartient à l'instrument, **jamais** au contrat, et n'est pas une donnée d'exécution.

**Le reçu existe déjà** : `extract/figma/visual-parity/fixture-assets/manifest.json`, 80 assets épinglés (`id`, `file`, `mediaType`, `bytes`, `width`, `height`, `sha256`, `imageRef`, `paintNodeId`, `setNodeId`, `variantNodeId`, `subject`, `variant`, `scaleMode`, **`runtimeDefault: false`**). 017 y ajoute les assets manquants de `member-picture` (research D8) ; la forme ne change pas.

**Ce que 017 ajoute, additivement, sur le SUJET de mesure** (`extract/figma/visual-parity/subjects.ts`, `DumpSubject` et `ContractSubject`) :

```jsonc
{
  "id": "realisation",
  "kind": "contract",
  "contractId": "ds.realisation",
  "fileKey": "d9FYAUcqdcNtsuaMgLefvJ",
  "setNodeId": "2095:2484",

  // NOUVEAU (017) — mêmes noms et mêmes sémantiques que CampaignCase, jamais une invention
  "comparisonProps": { "imageUrl": { "$asset": "realisation-grand-01" } },
  "fixtureAssetIds": ["realisation-grand-01"]
}
```

**Invariants.** Tout `$asset` doit être déclaré dans `fixtureAssetIds` de la même entrée, et présent au manifeste — sinon **refus nommé** (`render.ts:386`, `:413`). Les octets sont revérifiés par **taille, extension et SHA-256 au moment du rendu** ; le data URL résultant n'existe que dans le document de comparaison. L'injection **clone** le contrat (`structuredClone`) : `contracts/*.contract.json` n'est jamais touché — FR-006b tenu par construction, pas par discipline. Aucun `$asset` n'a le droit de porter `runtimeDefault: true`.

**Piège de sujet, épinglé ici** : `ds.member-picture` nomme sa prop **`src`**, pas `imageUrl` — un `comparisonProps` calqué sur les autres sujets ne prendrait pas.

---

## 6 · LigneDeMesure — une comparaison entre notre surface et la maquette

Soit **comparable et notée**, soit **déclarée non comparable avec sa raison**. Jamais un score qui mesure l'absence de données.

```jsonc
{
  "subject": "realisation",
  "variant": "Taille=Grand",

  // AVANT 017 : union fermée à 4 — "diffed" | "skipped" | "refused" | "figma-declined"
  // APRÈS 017 : un cinquième membre, additif
  "status": "incomparable",
  "incomparableReason": "Aucune photo de maquette n'a pu être exportée pour ce nœud (images API null ×3).",

  "unmaskedPct": 0.42,
  "cause": { "slug": "rendering", "…": "règle de triage re-mesurée, jamais héritée" }
}
```

**Invariants.**

1. `status: "incomparable"` **exige** `incomparableReason` non vide. Sans raison écrite, la ligne refuse.
2. Une ligne incomparable est **visible et comptée** au rapport, dans la section « Not diffed (named, never dropped) » et dans la ligne de comptage — jamais masquée, jamais affichée à 0 %, jamais absorbée dans une tolérance (FR-007).
3. Une ligne incomparable **ne porte pas de score de porte**. `unmaskedPct` peut être relevé pour information ; il n'entre pas dans le verdict.
4. **Le vocabulaire de causes reste fermé à six** (`contract-geometry`, `image-boundary`, `rendering`, `engine`, `instrument`, `figma-source`). « Non comparable » est un **statut**, pas une septième cause : les deux axes sont orthogonaux (research D9).
5. Toute ligne à score brut **strictement positif** doit matcher une règle de triage, sinon le rapport imprime `UNTRIAGED` et la classe première (règle D8, déjà en vigueur). C'est ce qui rend FR-008 exécutoire sans discipline.
6. La non-régression est déjà fermée par `baseline.json` : une ligne **disparue** échoue, un **changement de statut** échoue. Une ligne discrètement retirée de la liste est impossible.
7. **Trois issues, et aucune autre** (SC-003) : sous la porte · incomparable avec sa raison · **re-classée à une cause réelle re-mesurée et acquittée avec son motif écrit**. La troisième passe par `baseline.json`, dont c'est exactement l'office : l'acquittement ne fait jamais rougir, mais il est compté et imprimé. Un résiduel réel au-dessus de 2 % est une **réussite** d'US2, pas un échec — ce que SC-003 interdit est un score qui ne mesure rien, jamais un score élevé.

**Population à re-mesurer — les huit lignes « frontière image » du 2026-08-06** (ligne de porte : 2 %) :

| Sujet | Variante | Brut | Asset disponible ? |
|---|---|---:|---|
| `realisation` | `Taille=Grand` | 99,97 % | oui (27 assets) |
| `realisation` | `Taille=Petit` | 99,86 % | oui |
| `member-picture` | `Etat=Defaut` | 64,48 % | **non — à épingler (D8)** |
| `carte` | `Disposition=Reassurance` | 64,14 % | oui (28 assets) |
| `member-picture` | `Etat=Survol` | 58,33 % | **non — à épingler (D8)** |
| `carte` | `Disposition=Categorie` | 56,56 % | oui |
| `member-card` | `MemberCard` | 52,52 % | oui (17 assets) |
| `product-card` | `ProductCard` | 15,64 % | oui (4 assets) |

Toutes portent `diagnosis: "overall ink differs"` avec une géométrie exacte à ±1-2 px près : l'écart est de l'encre, donc de la donnée.

---

## 7 · AvertissementDeCanvas — la ligne de légende du composant Figma

Une ligne, marquée d'un `†` en fin. Le mécanisme existe et **la dague est déjà là sur les 9 composants porteurs d'image** (vérifié au cliché `parity/snapshots/figma-components.json`) — ce qui manquait est la phrase.

| État | Forme |
|---|---|
| Avant 017, composant à cadre photo | `Realisation — generated from contract ds.realisation v1.1.0 †` |
| **Après 017**, composant à cadre photo | `Realisation — generated from contract ds.realisation v1.1.0 · image frame: runtime slot, photo shown is a mockup sample †` |
| Composant sans cadre photo | **inchangé, au caractère près** |

**Invariants.** La description reste **une seule ligne** — la directive owner du 2026-07-19 tient, aucun retour aux paragraphes de copie (FR-010). La clause n'apparaît que si le composant porte au moins une part `img` : elle est portée par un drapeau dédié, distinct de `hasPreviewOnlyFacts` qui, lui, agrège aussi `blockRoot`. La dague reste en **fin** de ligne, à sa place actuelle. Ce qui arrive à la photo à la reconstruction n'est **pas** dit ici : c'est la documentation qui le dit (FR-010a, §8).

---

## 8 · LigneDeDocumentation — la copie d'avertissement de la matrice

`docs/FIGMA-CAPABILITY-MATRIX.md` § (b) « The inexpressible set — on-canvas annotation copy », 15 lignes aujourd'hui, format `| channel | annotation copy |`.

**017 en ajoute une, au format exact des autres**, plus un addendum daté qui porte ce que FR-013 exige : la lacune A5 reste **ouverte et nommée**, c'est une lacune de **transport** (ligne 91, colonne Bindable : `— (image content not bindable)`), **et non un défaut de fidélité mesuré** — les 99,97 % du 2026-08-06 étaient un artefact d'instrument.

**Invariant de structure, à ne pas re-découvrir** : §(b) est réservée aux canaux `CARRY-CODE-ONLY`, or la ligne 91 verdicte l'image `CARRY-BOTH (add — § a.7)`. L'absence de ligne image n'était pas un oubli de saisie : c'est structurel. **L'addendum est ce qui rend la ligne cohérente**, et non l'inverse.

**Et le paquet d'accueil** (`docs/handoff/`, FR-011) reçoit la réponse à « que devient une image à la régénération ? » — vérifié muet : deux occurrences de « photo » sur 12 fichiers, toutes narratives. La matrice, elle, répond déjà depuis le 2026-08-04 (`:360-372`, commit `504dd0a`) : c'est le **CLAUDE.md qui est périmé** en affirmant le contraire, et il sera daté, pas effacé.

---

## 9 · Récapitulatif — ce qui est créé, édité, régénéré

| Nature | Fichiers |
|---|---|
| **NOUVEAU (commité)** | `specs/017-photos-honnetes/registre/acquittements-photos.json` · `specs/017-photos-honnetes/registre/defauts-decouverts.json` (**l'atterrissage de FR-009 / SC-005 — jamais une note en prose seule**, forme de `specs/016-canvas-vrai/registre/defauts-source.json` : `{schemaVersion, note, creeLe, fichierCible, items[]}`) · `evals/fixtures/photos-instance-overrides-preserved-check.ts` · `extract/figma/photo-parity/*` (promotion de `specs/016-canvas-vrai/{bridge,tools}/`, **un déplacement, pas une réécriture**) · `specs/017-photos-honnetes/proofs/*` |
| **ÉDITÉ (source, jamais du généré)** | `core/emit-figma-script.ts` (harvest/restore + refus + clause de légende) · `scripts/plugin-engine-mock-figma.mjs` (instances miroir, ImagePaint, `getInstancesAsync`) · `extract/figma/visual-parity/{subjects.ts,run.ts,triage.ts}` · `extract/figma/visual-parity/fixture-assets/manifest.json` (assets member-picture) · `evals/run.ts` (cas branchés) · `docs/FIGMA-CAPABILITY-MATRIX.md` · `docs/handoff/08-status-what-doesnt-work.md` · `CLAUDE.md` et `ROADMAP.md` (datations, jamais effacements) · `package.json` (script `photos:verify`) · `contracts/{carte,member-picture,member-card}.contract.json` (**descriptions seules, patch** — trois trous, pas deux : compte re-mesuré le 2026-08-06) |
| **RÉGÉNÉRÉ, JAMAIS À LA MAIN** | `figma-sync/*.js` (37 des 72 portent le harvest) · `src/components/` · `catalog/catalog.json` |
| **RE-PINS (trois reçus, research D14)** | `evals/golden.json` · `figma-sync/plugin/engine.receipt.json` · `examples/polaris/figma/*.figma.js` |
| **DÉPLACÉ, PAS RÉÉCRIT** | `parity/baseline.json` et `extract/figma/visual-parity/baseline.json` — seulement si la mesure d'après le justifie, avec le motif écrit |

**Ce qui n'est PAS touché** : `packages/schema/src/contract-schema.ts` (le schéma tient FR-012 par construction), `tokens/*.tokens.json`, l'anatomie ou les props des 34 contrats.
