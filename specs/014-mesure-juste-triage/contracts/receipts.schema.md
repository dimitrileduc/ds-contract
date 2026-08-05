# Contrat — Les reçus publiés par 014

**Spec** : FR-001/002, FR-009, FR-012, FR-014 · **Entités** :
[data-model.md](../data-model.md) §3, §4, §5

Trois documents JSON, chacun avec son autorité. Le Markdown qui les accompagne
en est **rendu**, jamais écrit à la main — la règle que 013 tient déjà
(« `result.json` est l'AUTORITÉ ; `REPORT.md` en est rendu »).

---

## 1. Provenance de référence — `ReferenceProvenance`

Émis par le pilote d'audit dans le `metadata.json` de chaque cas, et repris dans
le dossier de l'organisme. C'est la propriété que FR-002 rend vérifiable.

```jsonc
{
  "referenceProvenance": {
    "caseNodeId": "2114:3619",        // l'autorité — le node du cas rendu
    "setNodeId":  "2114:3721",        // conservé pour la traçabilité, jamais employé comme référence
    "derivations": {
      "capture":         "2114:3619", // le PNG photographié
      "nodeValues":      "2114:3619", // le node lu pour les valeurs de faits
      "imposedWidth":    "2114:3619", // la largeur imposée au côté généré
      "alignmentFrame":  "2114:3619", // le cadre d'alignement et de recadrage
      "receiptCitation": "2114:3619"  // la provenance citée par les jambes Figma
    }
  }
}
```

**Invariant** — `∀ d ∈ derivations : d === caseNodeId`. Les cinq, pas la seule
capture. Une dérivée manquante est un refus (`reference-provenance-incomplete`),
pas un « non applicable ».

**Ce qui reste légitimement sur le set** et n'apparaît donc pas ici : l'ancre du
contrat (`contract.anchors.figma.nodeId`, propriété du contrat) et le contrôle de
version du fichier (propriété du fichier). Voir data-model §3.

---

## 2. Registre avant/après — `proofs/registre/{avant,apres}.json`

Produit par `extract/figma/organism-audit/tools/build-registre.mts --phase
avant|apres` (recherche D11) — jamais assemblé à la main (constitution I). Le
tool re-mesure lui-même les 9 sujets à cas de l'audit d'organismes dans un
dossier de travail gitignoré (`out/registre-scratch/`, jamais dans
`specs/013-…/proofs/`) et lit `visual-parity/out/rows.json`, déjà produit par
`npm run extract:figma:visual`.

```jsonc
{
  "schemaVersion": 2,
  "phase": "apres",
  "browser": {
    "version": "151.0.7922.34",                   // playwright-core browser.version()
    "executablePath": "/Users/…/ms-playwright/chromium-1234/…",
    "revision": "1234"                            // extraite du chemin, jamais devinée
  },
  "figmaDumps": "cached",                         // le RENDU est re-mesuré, pas le relevé Figma
  "visualParityReceiptAt": "2026-08-03T…Z",       // date du out/rows.json consommé
  "committedComparison": {
    "source": "git show HEAD:…/REPORT.md (parité) + specs/013-…/proofs/organisms/*/result.json",
    "note": "La colonne `committed` de la parité visuelle vient du Markdown, donc à 2 décimales."
  },
  "capturedAt": "2026-08-03T…Z",
  "refusals": [],                                 // vide = le registre fait foi
  "lines": [
    {
      "instrument": "organism-audit",
      "key": "reassurances/reassurances-disposition-4-cartes",
      "before":    { "rawPct": 39.78437291157622, "status": "diffed",
                     "facts": { "proved": 30, "divergent": 10, "limited": 4, "notProven": 0 } },
      "after":     { "rawPct": 3.31, "status": "diffed", "facts": { "…": 0 } },
      "committed": { "rawPct": 39.78437291157622, "status": "diffed", "facts": { "…": 0 } },
      "delta":     { "rawPct": -36.47, "facts": { "before": {}, "after": {} } },
      "committedDelta": { "rawPct": -36.47, "comparedAt": "pleine précision", "statusChanged": null },
      "referenceProvenance": { "caseNodeId": "2114:3619", "…": "§1" },
      "attribution": "correction d'instrument DW-006"
    }
  ]
}
```

### Invariants

- **`before` et `after` vivent dans le MÊME document et partagent la même
  `browser.version`** (FR-009). En phase `apres`, l'outil relit `avant.json`
  pour porter les deux côtés ; sans ça, le registre ne comparerait qu'au dépôt,
  c'est-à-dire à la mesure que FR-009 a jugée non fiable.
- **`delta.rawPct` vaut `0` quand rien n'a bougé**, jamais `null` — un contrôle
  ne saurait distinguer `null` de « pas mesuré ».
- **`delta ≠ 0` ⟹ `attribution` est renseignée**, et l'outil sort en code non nul
  tant que ce n'est pas le cas (`delta-without-attribution`). Vaut aussi pour
  `committedDelta` et pour tout changement de statut.
- **Toute absence est un refus** : artefact manquant, organisme en échec,
  couverture incomplète, navigateurs différents entre les deux instruments ou
  entre les deux phases. Un registre incomplet se lirait comme « rien à
  attribuer » ; `refusals` non vide signifie « écrit, mais ne fait pas foi ».
- **En phase `apres`, chaque ligne d'organisme porte sa `referenceProvenance`**
  (§1) et ses cinq dérivées citent le node du cas — l'outil applique C3 à la
  source (`reference-provenance-missing`, `reference-not-case-node`). C'est ce
  qui permet au contrôle de clôture de vérifier les **neuf** organismes alors
  qu'un seul dossier de 013 est re-rendu : les huit autres sont antérieurs à la
  correction et D10 interdit de les réécrire.
  En phase `avant` le champ vaut `null` : le T0 mesure l'état antérieur à la
  correction, où le pilote n'émettait pas de provenance. Cette absence est le
  reçu de l'état défectueux, pas un trou.
- **L'attribution de reassurances est `instrument`** — « correction d'instrument
  DW-006 » — et jamais présentée comme un progrès de fidélité (SC-004).

### Pourquoi `committed` est un champ, et non la source de `before`

Le baseline commité couvre 7 sujets et 13 lignes dont **4 réellement diffées**,
sur une version Figma périmée, quand le rapport en publie 36 sur 22 sujets
(recherche §0.7). `committed` sert donc à **détecter** un écart avec ce que le
dépôt publiait, pas à fonder l'état « avant ». Celui-ci est une re-mesure.

C'est aussi la seule valeur du registre lue dans du Markdown, donc à deux
décimales : `committedDelta.comparedAt` le dit ligne par ligne. Les scores
`before`/`after` viennent des reçus machine, en **pleine précision** — une ligne
affichée `0.00%` peut valoir 0,0048 % (c'est le cas d'`accordion-row ::
Taille=Petit, Etat=Ferme`), et la lire dans le rapport l'effacerait.

---

## 2 bis. Attributions — `proofs/registre/attributions.json`

Le **seul** document du registre écrit à la main (décision D13).

```jsonc
{
  "schemaVersion": 1,
  "byKey": {
    "reassurances/reassurances-disposition-4-cartes": "correction d'instrument DW-006"
  }
}
```

Une attribution est un jugement : aucun outil ne la calcule. Ce qui se calcule,
c'est le **refus** de clore tant qu'un écart n'en porte pas. Séparer le jugement
de son rendu tient les deux règles à la fois — l'attribution est relisible et
versionnée, et `avant.json`/`apres.json` restent générés de bout en bout.

---

## 4 bis. `sameDefectAs` — deux entrées, un seul travail

Une entrée DW et une ligne d'organisme peuvent décrire **le même défaut** vu de
deux endroits : DW-002 est un *fait épinglé* (`ds.carte`
`/anatomy/root/literals/min-width`), la ligne `reassurances/…` est la *mesure*
qui en résulte. Les deux méritent d'exister — mais pour 015 c'est **un seul
travail**.

Chaque côté porte donc un `sameDefectAs` pointant l'autre. **Le comptage par
cause DOIT les dédupliquer** : sans ça, la sortie dimensionnante de FR-011
annonce 2 là où il y a 1, et 015 se planifie sur un chiffre gonflé. Ajouté à la
revue du 2026-08-03 : T032 avait ajouté les entrées DW sans les réconcilier.

---

## 4 ter. `deferredWork` — ce que 014 découvre et ne répare pas

014 est une spec de mesure : elle a le droit de **trouver** un défaut et le
devoir de ne pas le réparer (FR-005, constitution §VII). Ce qu'elle n'a pas le
droit de faire, c'est de le laisser mourir dans un reçu.

```jsonc
{
  "id": "DW-014-001",
  "discoveredBy": "014",
  "cause": "engine",
  "receiptId": "select-exclusion",
  "surface": "core/emit-html.ts",
  "shippedSurfaceAffected": false,
  "whyNotFixedHere": "FR-005 + constitution §VII",
  "destination": "à ordonnancer",
  "status": "deferred"
}
```

**La leçon qui a créé cette section** : DW-006 n'était suivi que parce que 013
l'avait porté à un registre. Le défaut de `core/emit-html.ts` trouvé par le
re-test de `select` n'existait, lui, que dans un reçu — et il avait d'abord été
classé `instrument`, dont le libellé publié dit « corrigé **ici** ». Un défaut
vivant se serait ainsi retiré tout seul, par le seul effet d'un mot. Il est
maintenant classé `engine` (défaut suivi, ouvert) **et** porté ici.

Règle générale : **une cause dont le libellé promet une réparation
(`instrument`) n'est légitime que si la réparation a lieu dans la spec.** Sinon
la classe est `engine` ou `figma-source`, et l'entrée va au registre.

---

## 3. Reçu de cause — `proofs/recus/<id>.json`

```jsonc
{
  "schemaVersion": 1,
  "id": "select-exclusion",
  "claim": "a native <select> does NOT render its selected-option TEXT in headless Chromium",
  "claimSource": "extract/figma/visual-parity/subjects.ts:236-247",
  "method": "npm run extract:figma:visual -- select",   // filtre de sujet POSITIONNEL (run.ts:339-345)
  "observed": { "optionTextRendered": true, "textPixels": 0 },
  "verdict": "refuted",                 // 'confirmed' | 'refuted' | 'not-retestable'
  "browser": { "version": "…", "executablePath": "…" },
  "date": "2026-08-03"
}
```

### Invariants

| verdict | conséquence obligatoire |
|---|---|
| `confirmed` | la cause est inchangée et porte désormais son reçu — une confirmation se prouve autant qu'une infirmation (US5 sc. 4) |
| `refuted` | la ligne est **re-classée** sur ce que le re-test établit ; l'attribution antérieure reste consultable avec son infirmation ; **aucune** correction de contrat, token, sortie générée ou source (FR-013) |
| `not-retestable` | la cause est publiée comme non re-testée, nommément, et **bloque la clôture** (FR-012) |

`method` doit être une **commande**, pas une intention : le critère de US5 est
qu'un réviseur rejoue le reçu et obtienne le même verdict.

### Un blocage infirmé ne se lève pas ici

Si le re-test d'un blocage d'organisme montre qu'il n'est pas fondé, le constat
est consigné comme **entrée de 016** et l'organisme reste bloqué : le débloquer
demanderait une réparation (FR-013, US5 sc. 3).

> Piste ouverte par la lecture, à trancher par le re-test : les trois
> `dependencyGates` épinglent `expectedFigmaFileVersion: 2381568261081914456`
> quand la campagne tourne sur `2381581871281042338`, d'où la raison
> `figma-file-version-moved` dans les trois verdicts `blocked`. Une part du
> blocage pourrait n'être qu'un épinglage périmé.

---

## 4. Registre des causes hors `TRIAGE` — `proofs/registre/causes.json`

Un seul document porte les causes qui ne sont pas des règles de `TRIAGE` : les
six entrées DW re-classées **et** les neuf lignes divergentes de l'audit
d'organismes (décision D12).

```jsonc
{
  "schemaVersion": 2,
  "note": "Registre des causes hors règles TRIAGE : entrées DW de 013 re-classées + lignes divergentes de l'audit d'organismes. Ce document RÉFÉRENCE specs/013-… ; aucun de ses fichiers n'est modifié.",
  "entries": [
    { "dwId": "DW-006", "subjectId": "reassurances",
      "cause": "instrument", "receiptId": "dw-006-instrument",
      "resolvedBy": "014" }
  ],
  "organismLines": [
    { "key": "hero/hero-master-defaults", "rawPct": 27.8290,
      "cause": "contract-geometry", "receiptId": "org-hero-geometry" }
  ]
}
```

### Invariants

- **Toute ligne d'organisme dont `rawPct > 0` figure dans `organismLines`** — les
  neuf relevées en recherche D12, reassurances comprise. Une absence émet
  `untriaged-line` (gate C1).
- **`cause` est l'un des six slugs**, et `receiptId` résout un reçu de §3 : la
  même exigence que pour une règle de `TRIAGE`, sur la même taxonomie.
- **La cause de `reassurances` est celle du résidu re-mesuré**, pas « défaut
  d'instrument » : DW-006 expliquait les 39,78 %, il n'explique pas ce qui reste
  après la correction.

**Pourquoi un document séparé, et pas un champ dans les dossiers de 013.** 013 est
une campagne close, dont les reçus sont signés par des hashes d'arbre. Y injecter
une taxonomie postérieure les rendrait irreproductibles, et porter la cause dans
les dossiers imposerait de re-rendre les neuf — alors que FR-003 n'exige le
re-rendu que de reassurances. Seul ce dossier-là est re-rendu, et son ancien
chiffre survit ici, plus dans l'historique git (décisions D10 et D12).
