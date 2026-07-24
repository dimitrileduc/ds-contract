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

## 2026-07-24 — validation-master — programme (T021 · filet de rollback, US5)

- **Type** : validation-master *(écart de type nommé : le contrat n'a pas de type dédié aux drills de mécanisme — l'objet validé ici est le filet de rollback du programme, pas un master ; nommé plutôt qu'omis)*
- **Composant(s)** : programme
- **Verdict owner** : restore manuel exécuté par l'owner via l'historique de versions natif (« done restaure ») ; drill de rollback validé de bout en bout
- **Chiffres** : preuve positive — page témoin `2049:1002` et rectangle `TEMOIN-T021` `2049:1003` DISPARUS après restore (relecture par id et par nom, fichier revenu à 2 pages) ; contrôle collatéral — 9/9 `identical`, exit 0
- **Raison** : n/a (succès — aucun écart accepté)
- **Preuve** : `proofs/T0-rollback-drill/{drill.md, verdict.json, verdict.md}`
- **Checkpoint** : `003/rollback-drill/avant` (versionId `2379687215163752024`)

*Anomalie en attente (sera tranchée par une entrée dédiée)* : dérive nocturne
23→24 sur les titres hero de `Portes de garage` (2 039 px) et `Portes de garage
résidentielles` (4 080 px), hors bruit AA — receipts dans
`proofs/T0-rollback-drill/derive-nocturne/` ; aucune police manquante ; cause à
identifier avec l'owner (édition des titres ? mise à jour Figma ?).

## 2026-07-24 — amendement-orga — programme (structure des pages, Phase T)

- **Type** : amendement-orga
- **Composant(s)** : programme
- **Verdict owner** : (1) une 4e page de rangement `DS · Tokens` est ajoutée au
  plan — référence visuelle des 14 variables + 8 styles Montserrat, peuplée en
  Phase T avec les noms **finaux** (après les renames de T028), aux côtés des 3
  pages déjà prévues par R9 (`DS · Atomes`, `DS · Molécules`, `DS · Sections`) ;
  (2) la page `Assets` (5 masters existants, ~145 instances) **reste telle
  quelle** — confirme R9 sans changement, aucun déplacement dans cette spec.
- **Raison** : demande explicite owner (session 2026-07-24) — « ça doit être
  propre » ; une page de référence tokens rend la fondation vérifiable
  visuellement, pas seulement dans le panneau Variables ; ne pas toucher
  `Assets` maintenue conforme à R9 (zéro risque sur les 145 instances actives).
- **Preuve** : n/a (décision d'organisation — la preuve pixel arrive aux
  tâches T029a/T029b qui l'exécutent)
- **Checkpoint** : n/a (aucun geste canvas pour cette décision elle-même)

## 2026-07-24 — anomalie-tranchee — space, radius

- **Type** : anomalie-tranchee
- **Composant(s)** : space, radius
- **Verdict owner** : **différer** — ne rien renommer maintenant. Proposition
  présentée (échelle nommée `none/xs/sm/md/lg` + `radius/pill`, justifiée par la
  géométrie du Bouton — radius 32 > moitié de sa hauteur ~54px) déclinée pour
  l'instant.
- **Raison** : décision owner (session 2026-07-24), aucune raison négative
  donnée sur la proposition elle-même — juste pas maintenant.
- **Preuve** : `audits/tokens.md` §1 (odeur mesurée, confirmée active)
- **Checkpoint** : n/a (aucun geste — rien exécuté)

*Condition de reprise* : rouvrir sur demande owner, ou naturellement à mesure
que `space/*`/`radius/32` se bindent à de nouveaux atomes/molécules des phases
7-8 (le coût du rename grandit avec l'usage — à garder en tête).

## 2026-07-24 — anomalie-tranchee — orange-12, orange-42

- **Type** : anomalie-tranchee
- **Composant(s)** : orange-12, orange-42
- **Verdict owner** : **différer** — scanner l'usage canvas réel avant de
  proposer un nom de rôle sémantique, plutôt que d'adopter le suffixe alpha
  neutre proposé (`color/orange/a12` / `a42`) ou d'inventer un rôle non mesuré.
- **Raison** : décision owner (session 2026-07-24) — ne pas nommer un usage
  qu'on n'a pas vérifié.
- **Preuve** : `audits/tokens.md` §2 (usage repo confirmé absent ; usage canvas
  non mesuré à l'audit)
- **Checkpoint** : n/a (aucun geste — rien exécuté)

*Condition de reprise* : scan d'usage canvas (fills/strokes liés à
`VariableID:28:202`/`28:203` sur les 9 maquettes + `Assets`) — en cours,
receipt à suivre dans ce même journal.

## 2026-07-24 — anomalie-tranchee — orange-12, orange-42 (suivi post-scan)

- **Type** : anomalie-tranchee
- **Composant(s)** : orange-12, orange-42
- **Verdict owner** : scan d'usage exécuté (receipt ci-dessous) — **toujours
  différer**, malgré un usage confirmé nul (2 rectangles-échantillon dans le
  groupe « Couleurs » d'`Assets`, zéro usage fonctionnel). La proposition de
  suffixe alpha neutre (`color/orange/a12`/`a42`), désormais étayée par la
  mesure, reste déclinée pour l'instant.
- **Chiffres** : scan `boundVariables.color` sur fills+strokes, 2 pages
  (`Assets`, `Pages`), 2314 nœuds visités, 2 correspondances — `28:201`
  « Orange 12 » et `28:200` « Orange 42 », toutes deux dans `Assets > Couleurs`
  (fill), aucune sur les 9 maquettes ni sur un master.
- **Raison** : décision owner (session 2026-07-24), après mesure — pas de
  raison négative donnée sur la proposition, confirmée déclinée quand même.
- **Preuve** : `audits/tokens.md` §2 (table d'usage mise à jour)
- **Checkpoint** : n/a (lecture seule — aucun geste)

**Conséquence Phase T** : les 2 odeurs actives (space/radius, orange-12/42)
sont désormais **auditées, proposées et explicitement déclinées par l'owner**
— T028 n'a aucun geste accepté à exécuter ; T029 n'a aucun geste à prouver.
Phase T se clôt sur ce statut nommé, pas sur un rename.

## 2026-07-24 — validation-master — page DS · Tokens (lot)

- **Type** : validation-master *(lot : une page de référence, pas un composant
  gouverné — nommé plutôt que forcé dans un type inadapté)*
- **Composant(s)** : DS · Tokens (page)
- **Verdict owner** : validée telle quelle après revue de la capture — 12
  couleurs (swatches **bindés** aux variables, pas des copies figées),
  nav/state + opacity documentées, échelle `space`/`radius`/`border-width`
  (bindings live sur largeur/rayon/épaisseur de trait), 8 styles Montserrat
  appliqués via `setTextStyleIdAsync` avec légende correcte (taille · poids ·
  line-height).
- **Chiffres** : page `2051:951`, section `2051:1048`, 4 groupes de contenu
  (Couleurs 12, Autres primitives 2, Espacement & rayon 7, Typographie 8) — 1
  bug trouvé et corrigé en cours de construction (légende typo affichait
  `undefined` — mauvais champ API `fontStyle` au lieu de `fontName.style`,
  corrigé avant validation, receipt : 2 captures dans ce tour, la 2e conforme)
- **Raison** : n/a (validation directe)
- **Preuve** : `proofs/tokens-page/page-creation.md` ; captures de session
  (avant/après correctif) ; preuve pixel des 9 maquettes en T029c
- **Checkpoint** : `003/tokens/page-ds-tokens` (versionId `2379706504047594643`)

## 2026-07-24 — ecart-accepte — page DS · Tokens (preuve pixel, limite de méthode)

- **Type** : ecart-accepte *(pas un écart de PIXEL — 9/9 identical — mais un
  écart de MÉTHODE face à R4 : le `before` n'est pas une capture immédiatement
  pré-geste. Nommé sous ce type car c'est la case du contrat prévue pour
  documenter chiffres + raison d'une déviation de preuve.)*
- **Composant(s)** : DS · Tokens (page)
- **Verdict owner** : n/a — écart de méthode auto-détecté et documenté, pas un
  écart pixel nécessitant un arbitrage owner (résultat = 9/9 identical, aucun
  pixel en jeu)
- **Chiffres** : 9/9 `identical`, 0 diff, exit 0 ; sha256 par maquette
  identiques entre `.page-parity/drill-after/` (before réutilisé) et
  `.page-parity/tokens-page-after/` (after frais 2026-07-24)
- **Raison** : aucune capture before dédiée n'a été prise immédiatement avant
  le checkpoint T029a (gap de process) ; le before réutilisé est la capture la
  plus récente disponible (même jour, T021), avec argument de séparation
  structurelle (nouvelle page sans référence croisée vers `Pages`) — détail
  complet et limite nommée dans `proofs/tokens-page/README.md`
- **Preuve** : `proofs/tokens-page/{verdict.json,verdict.md,README.md}`
- **Checkpoint** : `003/tokens/page-ds-tokens` (couvre le geste ; aucun
  nouveau geste depuis)

## 2026-07-24 — anomalie-tranchee — nav-state (constat)

- **Type** : anomalie-tranchee
- **Composant(s)** : nav-state
- **Verdict owner** : **constat seulement** — l'odeur `color/nav-state` en
  STRING listée par R10 est **déjà résolue**, hors 003 : renommée `nav/state`
  côté Figma ET côté repo le 2026-07-23 16:45 (commit `38aee13`, pré-flight
  spec 001, T037d), vérifiée live le 2026-07-24 (`VariableID:86:403`,
  `resolvedType STRING`, valeur `"Transparent"`). Rien à corriger ni à
  reporter dans cette spec.
- **Raison** : exactitude du journal — éviter qu'une future lecture de R10
  croie cette odeur encore ouverte.
- **Preuve** : `audits/tokens.md` §3 ; `tokens/primitives.tokens.json`
  (`nav.state`) ; commit `38aee13`
- **Checkpoint** : n/a (rien exécuté par cette spec)
