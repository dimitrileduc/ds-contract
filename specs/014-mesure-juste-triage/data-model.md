# Modèle de données — Mesure juste et triage complet (014)

**Date** : 2026-08-03 · **Spec** : [spec.md](./spec.md) · **Recherche** : [research.md](./research.md)

Six entités, tirées de la rubrique *Key Entities* de la spec. Pour chacune :
où elle vit **déjà** dans le dépôt, ce que 014 y ajoute, et ses invariants —
c'est-à-dire ce que le contrôle de clôture refuse.

---

## 1. Ligne de mesure

Le chiffre publié d'un composant/variante, avec sa référence, son cas, ses
régions, son verdict et sa cause si elle diverge.

**Existe déjà**, sous deux formes que 014 unifie **sans les fusionner** :

| | parité visuelle | audit d'organismes |
|---|---|---|
| producteur | `visual-parity/run.ts` (type `Row`, `run.ts:148`) | `organism-audit/pilot.ts` (`CaseAuditResult`) |
| identité | `<subject> :: <variant>` | `<subjectId>` / `<caseId>` |
| score autoritaire | `rawPct` (non masqué, `gate.ts:73-80`) | `pixels.rawPct` |
| seuil | `THRESHOLD_PCT` (2 %) | `acceptance.maxRawDiffPct` (2,5) |
| publication | `visual-parity/REPORT.md` | `specs/013-…/proofs/organisms/<id>/REPORT.md` |

### Champs ajoutés par 014

| champ | type | pourquoi |
|---|---|---|
| `cause` | `CauseSlug \| null` | FR-004 — une cause par ligne divergente |
| `causeReceiptId` | `string \| null` | FR-012 — la cause pointe son reçu re-testé |
| `browserRevision` | `string` | FR-014 — la révision qui a produit le chiffre |
| `referenceProvenance` | `ReferenceProvenance` | FR-001 — les 5 dérivées et leur node |

### Invariants (refusés par le contrôle de clôture)

- **I-1.1** — `rawPct > 0` ⟹ `cause !== null`. Aucune borne d'amplitude
  n'intervient : le seuil de 3 % ne conditionne plus rien (FR-015, décision D8).
  La lecture porte sur le **nombre**, jamais sur la chaîne formatée à deux
  décimales — une ligne affichée `0.00%` peut valoir 0,004 %.
- **I-1.2** — `cause !== null` ⟹ `causeReceiptId` résout un reçu daté (FR-012).
- **I-1.3** — Tout contrat de `contracts/*.contract.json` possède au moins une
  ligne de mesure, mesurée **ou** déclarée non probante avec son reçu. Une
  absence est un refus (FR-006, SC-001).
- **I-1.4** — Une ligne empêchée porte `status ∈ {skipped, refused,
  figma-declined}` **et** un `causeReceiptId`. Le statut seul ne suffit plus :
  c'est ce qui met `button-with-icons` et `piqueray-logo` dans le périmètre de
  re-test (recherche §0.5).

> **Deux chiffres pour un même composant restent deux chiffres.** Un composant
> mesuré par les deux instruments publie deux lignes, chacune citant sa référence
> et son cas. Aucune n'est supprimée « pour simplifier » (edge case de la spec).
> Le relevé montre qu'aucun contrat n'est aujourd'hui dans ce cas — l'invariant
> est défensif, pas décoratif.

---

## 2. Cause de divergence

Une valeur d'un vocabulaire **fermé à six valeurs**, portée par une ligne avec sa
preuve. Le vocabulaire publié et l'énumération de l'instrument se correspondent
valeur pour valeur, dans les deux sens (FR-004).

**Vit à deux endroits, un par instrument** (décision D12) :

- `extract/figma/visual-parity/triage.ts` — le type `CauseClass` (ligne 32) et la
  table `TRIAGE` (lignes 43-226), pour les lignes de parité visuelle ;
- `specs/014-…/proofs/registre/causes.json` § `organismLines`, pour les 9 lignes
  divergentes de l'audit d'organismes — `triage.ts` est un module de
  `visual-parity/` et n'a aucune prise sur elles, et porter la cause dans les
  dossiers de 013 imposerait de les re-rendre, ce que D10 réserve à reassurances.

Un seul vocabulaire, un seul comptage : le gate agrège les deux sources.

### Le vocabulaire

| slug (instrument) | libellé publié | sens | destination |
|---|---|---|---|
| `contract-geometry` | géométrie du contrat | le contrat porte une géométrie fausse, ou n'en porte pas | entrée de **015** |
| `image-boundary` | frontière image (limite A5) | les pixels d'image ne sont pas transportés, par limite déclarée | limite nommée, **017** |
| `rendering` | rendu/rastérisation | Chromium et Figma dessinent le même fait différemment | plancher assumé |
| `engine` | défaut moteur | nos émetteurs rendent le contrat de travers | défaut suivi |
| `instrument` | défaut d'instrument | la mesure elle-même est en cause | corrigé **ici** (DW-006) |
| `figma-source` | défaut de source Figma | la source dessine autre chose que ce qu'elle devrait | entrée de **016** |

Détail de la re-classification des 25 règles existantes, et la note d'une ligne
que porte chaque règle de quarantaine déplacée : voir
[contracts/cause-vocabulary.md](./contracts/cause-vocabulary.md).

### Champs

| champ | type | note |
|---|---|---|
| `subject` | `string` | inchangé |
| `variant` | `RegExp?` | inchangé — absent = toutes les variantes du sujet |
| `class` | `CauseSlug` | **6 valeurs** au lieu de 5 |
| `cause` | `string` | une ligne, preuve nommée — inchangé |
| `receiptId` | `string` | **nouveau** — FR-012 |

### Invariants

- **I-2.1** — `CauseSlug` compte exactement six valeurs et la table de
  publication est une **bijection** slug ↔ libellé. Une valeur publiable que
  l'instrument ignore, ou une classe d'instrument non publiable, est un état
  refusé (FR-004).
- **I-2.2** — Aucune valeur fourre-tout. Une ligne qui n'entre dans aucune des
  six reste `UNTRIAGED` et **bloque la clôture** ; le vocabulaire ne s'étend que
  par décision explicite consignée (US2 scénario 3, Assumptions).
- **I-2.3** — Une cause `rendering` ou `instrument` mettant le navigateur en
  cause **nomme sa révision** (FR-014).
- **I-2.4** — Trier ne répare pas : une ligne triée `contract-geometry`,
  `image-boundary` ou `figma-source` **reste divergente** (FR-005, US2
  scénario 2).

---

## 3. Référence de cas

Le node Figma dont dérive toute la comparaison. **Par exigence : le node du cas
rendu, jamais son set** (FR-001).

**Vit dans** le manifeste `specs/013-…/contracts/audit-campaign.json` —
`subjects[].figmaSetNodeId` (le set) et `subjects[].cases[].figmaNodeId` (le
cas). Le second existe déjà et n'était employé qu'à écrire `metadata.json`
(`pilot.ts:614`).

### Les cinq dérivées, et l'unique node dont elles doivent provenir

| dérivée | site actuel | après correction |
|---|---|---|
| capture photographiée | `pilot.ts:234-241` | node du cas |
| valeurs du node lues (faits) | `pilot.ts:223-232` | node du cas |
| largeur imposée au côté généré | `pilot.ts:291-294` | node du cas |
| cadre d'alignement et de recadrage | `pilot.ts:302-308` | node du cas |
| provenance citée dans les reçus | `pilot.ts:505` | node du cas |

### Ce qui **reste** sur le set — et pourquoi ce n'est pas une exception

| propriété | site | raison |
|---|---|---|
| ancre du contrat | `run.ts:199` | `contract.anchors.figma.nodeId` pointe le set : c'est une propriété du **contrat**, pas de la mesure |
| contrôle de version du fichier | `pilot.ts:211-222` | la version est une propriété du **fichier**, lue via le set |

### Modèle produit

```
ReferenceProvenance {
  caseNodeId:  string           // l'autorité
  setNodeId:   string           // conservé pour la traçabilité
  derivations: {                // une entrée par dérivée de FR-001
    capture:        string      // le node effectivement employé
    nodeValues:     string
    imposedWidth:   string
    alignmentFrame: string
    receiptCitation:string
  }
}
```

### Invariants

- **I-3.1** — `∀ d ∈ derivations : d === caseNodeId`. C'est la classe d'erreur de
  FR-002, et elle couvre **les cinq** dérivées, pas la seule capture.
- **I-3.2** — La vérification échoue de façon reproductible sur l'état antérieur
  (capture = set) et reste en place après la correction (FR-002, §II de la
  constitution : fixture → eval → claim).
- **I-3.3** — Un sujet dont le set et le cas coïncident déjà voit son chiffre et
  ses comptes de faits **inchangés**. Vérifié pour les 8 organismes concernés,
  pas supposé (edge case de la spec ; relevé en recherche §0.2).
- **I-3.4** — La provenance des **neuf** organismes est vérifiable, alors qu'un
  seul dossier de 013 est re-rendu. Elle transite par `apres.json` (§4), dont la
  re-mesure tourne sur le pilote corrigé — les huit dossiers antérieurs ne sont
  pas réécrits (D10) et C3 n'est pas assoupli pour autant.

---

## 4. Registre avant/après

La conservation côte à côte des chiffres initiaux et finaux, avec la cause de
chaque variation.

**N'existe pas** — créé par 014 sous `specs/014-…/proofs/registre/`, produit
par `organism-audit/tools/build-registre.mts --phase avant|apres` (recherche
D11), jamais assemblé à la main.

### Pourquoi l'« avant » est une re-mesure, et non une relecture

Deux relevés l'imposent (recherche §0.6 et §0.7) :

- le navigateur de mesure **n'est pas épinglé** — `chromiumExecutable()` prend la
  révision la plus élevée du cache Playwright (quatre y sont installées) et se
  replie sinon sur le Chrome système, qui s'auto-mets à jour ;
- le baseline commité couvre **7 sujets, 13 lignes dont 4 diffées**, sur une
  version Figma périmée, quand le rapport en publie 36 diffées sur 22 sujets.

Un « avant » relu serait donc un chiffre dont personne ne connaît les conditions
de production. FR-009 exige une re-mesure dans la fenêtre de la fonctionnalité,
sur le **même** navigateur que l'« après ».

### Modèle

```
Registre {
  browser:  { version: string, executablePath: string, revision: string }
  figmaDumps: 'cached'            // le RENDU est re-mesuré, pas le relevé Figma
  visualParityReceiptAt: ISO8601  // le out/rows.json consommé
  capturedAt: ISO8601
  refusals: string[]              // non vide ⟹ écrit, mais ne fait pas foi
  lines: Array<{
    instrument: 'visual-parity' | 'organism-audit'
    key:        string            // "<subject> :: <variant>" ou "<subjectId>/<caseId>"
    before:     Mesure | null     // la re-mesure T0 — relue depuis avant.json en phase apres
    after:      Mesure | null     // null tant que l'après n'est pas pris
    committed:  Mesure | null     // ce que le dépôt publiait déjà
    delta:      { rawPct: number|null, facts: {before,after}|null }   // after − before, 0 si égal
    committedDelta: { rawPct: number|null, comparedAt: string, statusChanged: string|null }
    referenceProvenance: ReferenceProvenance | null   // organismes, phase apres — §3
    attribution: string | null    // obligatoire dès qu'un écart est non nul
  }>
}

Mesure { rawPct: number|null, status: string, facts: FactCounts|null }
FactCounts { proved: number, divergent: number, limited: number, notProven: number }
```

Les scores `before`/`after` viennent des **reçus machine** des deux instruments,
en pleine précision (`visual-parity/out/rows.json`, `organisms/*/result.json`).
Seul `committed`, côté parité visuelle, est lu dans le Markdown commité — donc à
deux décimales, ce que `committedDelta.comparedAt` dit ligne par ligne.
`attribution` vient de `proofs/registre/attributions.json`, le seul document du
registre écrit à la main (décision D13).

### Invariants

- **I-4.1** — `before` et `after` vivent dans le **même** document et sont
  produits par la **même** `browser.version` — vérifié entre les deux
  instruments et entre les deux phases, refus nommé sinon.
- **I-4.0** — `delta.rawPct` vaut **0** quand rien n'a bougé, jamais `null` :
  aucun contrôle ne saurait distinguer `null` de « pas mesuré ».
- **I-4.2** — `before ≠ committed` ⟹ l'écart est publié et attribué **avant tout
  autre travail** (FR-009). Ce n'est pas une condition de clôture mais une
  condition de démarrage.
- **I-4.3** — `delta ≠ 0` ⟹ `attribution !== null` (FR-009, SC-006).
- **I-4.4** — Hors reassurances, `delta === 0` sur tous les chiffres — pixel
  **et** comptes de faits. Toute variation ailleurs **suspend la publication**
  jusqu'à ce que sa cause soit établie (US4 scénario 2, SC-006).
- **I-4.5** — L'écart de reassurances est attribué à `instrument` (« correction
  d'instrument DW-006 »), **jamais** présenté comme un progrès de fidélité
  (FR-003, SC-004).

---

## 5. Reçu de cause

La preuve reproductible et datée qui soutient une cause publiée, une exclusion ou
un blocage — rejouable par un réviseur, et sans laquelle la cause ne survit pas à
la clôture.

**N'existe pas** — créé par 014 sous `specs/014-…/proofs/recus/<id>.json`.

### Modèle

```
Recu {
  id:          string             // stable, référencé par la ligne ou la règle
  claim:       string             // la prémisse affirmée, citée telle qu'elle était écrite
  claimSource: string             // fichier:ligne, ou l'identifiant DW
  method:      string             // comment rejouer — une commande, pas une intention
  observed:    unknown            // ce que le re-test a produit
  verdict:     'confirmed' | 'refuted' | 'not-retestable'
  browser:     { version: string, executablePath: string } | null
  date:        ISO8601
}
```

### Le périmètre du re-test (FR-012), tel que la recherche l'a arrêté

| décision affirmée | où elle vit | reçu attendu |
|---|---|---|
| exclusion de `select` | `subjects.ts:236-247` (un commentaire) | `refuted` — mémoire du dépôt et Assumptions le donnent déjà faux, le reçu le **prouve** |
| `button-with-icons` *skipped* | rapport, « Not diffed » | à mesurer |
| `piqueray-logo` *refused* | idem | à mesurer |
| les 25 règles de `TRIAGE` | `triage.ts:43-226` | une par règle |
| blocage des 3 organismes | `audit-campaign.json` → `dependencyGates` | à rejouer (`--check-dependencies`) |
| DW-001 … DW-006 | `specs/013-…/proofs/deferred/work.json` | re-classement dans le vocabulaire |

### Invariants

- **I-5.1** — Toute cause publiée porte un reçu (FR-012, SC-008).
- **I-5.2** — `verdict: 'refuted'` ⟹ la ligne est **re-classée** sur ce que le
  re-test établit ; l'attribution antérieure reste consultable avec son
  infirmation ; **aucune** correction de contrat, token, sortie générée ou source
  n'est appliquée (FR-013).
- **I-5.3** — `verdict: 'not-retestable'` ⟹ la cause est publiée comme non
  re-testée, nommément, et **bloque la clôture** (FR-012, edge case). Une cause
  héritée ne passe jamais pour une cause vérifiée.
- **I-5.4** — `verdict: 'confirmed'` est un reçu à part entière : une
  confirmation se prouve autant qu'une infirmation (US5 scénario 4).
- **I-5.5** — Un blocage jugé infondé est **consigné comme entrée de 016** et
  reste bloqué ici : le lever demanderait une réparation (FR-013, US5
  scénario 3).

> **Constat déjà acquis, à re-tester et non à recopier.** Les trois
> `dependencyGates` épinglent `expectedFigmaFileVersion: 2381568261081914456`
> quand la campagne tourne sur `2381581871281042338` — d'où la raison
> `figma-file-version-moved` dans les trois verdicts `blocked`. Une part du
> blocage est donc un **épinglage périmé**, pas un défaut de composant. Le
> re-test le tranche ; s'il le confirme, I-5.5 s'applique.

---

## 6. Contrôle de clôture

La vérification fail-closed qui conditionne la fin de la fonctionnalité.

**N'existe pas** — créé sous `extract/figma/measure-gate/` : `gate.ts` pur,
`run.ts` CLI. Interface complète :
[contracts/measure-gate.interface.md](./contracts/measure-gate.interface.md).

### Les quatre conditions de FR-007

| # | condition | refus nommé |
|---|---|---|
| 1 | zéro ligne mesurée sans cause | `untriaged-line` |
| 2 | tout composant généré porte une ligne | `component-without-measurement` |
| 3 | tout chiffre repose sur le node de son cas (5 dérivées) | `reference-not-case-node` |
| 4 | toute cause porte un reçu re-testé | `cause-without-receipt` |

### Invariants

- **I-6.1** — Fail-closed : code de sortie **non nul** dès qu'une condition
  manque. Une absence d'artefact est un refus, jamais un succès par défaut.
- **I-6.2** — Chaque refus **nomme** la ligne, le composant ou la cause fautive.
  Un refus anonyme serait la même faute que le chiffre non mesuré que la
  fonctionnalité existe pour supprimer.
- **I-6.3** — Le contrôle **compte en direct** et publie le compte obtenu. Aucun
  compte n'est figé en prose — la raison pour laquelle SC-002 ne cite plus de
  nombre de lignes (il en citait 63 quand le rapport en portait 39 ; recherche
  §0.9).
- **I-6.4** — `gate.ts` est **pur** : ni réseau, ni navigateur, ni écriture. Une
  fixture d'eval data-only l'exerce, comme `visual-parity/gate.ts` et
  `organism-audit/campaign.ts` avant lui.

---

## Sortie dimensionnante (FR-011)

Le comptage par cause, sur les six valeurs, calculé sur **toute ligne mesurée des
deux instruments** — aucun seuil ne dispense une ligne divergente d'y figurer :

```
{ contract-geometry: N, image-boundary: N, rendering: N,
  engine: N, instrument: N, figma-source: N }
```

Il est publié dans `RAPPORT-CLOTURE.md` et sert d'entrée dimensionnante à **015**
(la part `contract-geometry`) et à **016** (la part `figma-source`). Les entrées
DW de 013 y sont comptées dans le **même** vocabulaire : un comptage unique, une
seule taxonomie (FR-015).
