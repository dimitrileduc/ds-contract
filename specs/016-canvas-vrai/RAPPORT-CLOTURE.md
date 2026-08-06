# Rapport de clôture — 016 · Canvas vrai

**Rédigé le** : 2026-08-06 (comptes vifs rafraîchis à 15 h 23) · **Branche** : `016-canvas-vrai` (HEAD `0ed9981`)
**État des tâches au moment de la rédaction** : **56/81** (25 restantes — listées au §5.1)

> **Statut honnête** : ce rapport est rédigé alors que le chantier n'est **pas** terminé —
> le workflow en cours (phase Canvas, diagnostics Field/NavItem) peut encore réduire les
> restes nommés ici. Chaque compte ci-dessous est soit une commande **relancée ce jour**,
> soit une sortie **archivée et datée**. Aucun chiffre n'est recopié de la prose des
> documents de planning : quand la prose et le vif divergent, le vif fait foi et l'écart
> est nommé.

---

## 1. L'état du chantier

Ce que 016 a livré, chiffres sourcés au journal (`decisions.md`) et aux preuves (`proofs/`) :

- **La surveillance géométrie est rebranchée** : 83 variables créées dans la maquette
  (77 `size/*` + 6 `space/*`, lot `U1a-variables`, 9/9 `identical` au pixel, idempotence
  prouvée — 2ᵉ passe `created: 0`) ; **562 liaisons de variables sur 31 masters** contre
  10 sur 3 à l'ouverture (`proofs/bindings-audit-avant.json` / `bindings-audit.json`, O-10).
- **La sentinelle a fonctionné** : une valeur modifiée côté maquette (364 → 999) a produit
  le finding exact `figma-tokens|mismatch|Primitives/size/carte/root [Value]`, classé,
  avec deux remèdes proposés ; annulation exacte, deux passes de vérification
  byte-identiques (`b5a9ed4b87f96c2e`) — lot `U1a-sentinelle`, 2026-08-05.
- **DW-002 corrigé à la source** (cartes à 363,5, décision owner du 2026-08-05) : lot
  `L-DW002` conforme à son annonce — 3 `identical` / 7 `diff` tous dans les bandes
  annoncées, débordement résiduel **0** sur les 3 variantes ; côté React livré, captures
  avant/après **byte-identiques** (sha256, delta 0) : la prémisse de la décision owner
  vérifiée sur la surface dont elle parlait (`proofs/L-DW002/`, `proofs/recus/DW-002.md`).
- **Douze classes de défauts moteur/schéma closes**, chacune fixture-rouge-d'abord
  (journal O-9, O-10, O-12) — dont la police codée en dur à Inter, la bordure sans
  largeur, la perte des `componentPropertyReferences`, `component.slots` (schéma v20),
  la résolution des dépendances par marqueur (§VIII : l'identité n'est jamais un nom de
  calque).
- **Élévations de contrat** : `section-header` 2.1.0 (emphase + alignement passent en
  VARIANT, 16 variantes), `button` **2.0.0 MAJEUR** (`outilneNoir` → `outlineNoir`,
  migration des 7 sources internes), `faq` 1.3.0, `accordion-row` 1.2.0,
  `presentation` 2.2.0.
- **Le canvas a été régénéré et re-convergé sous mesure** : 22 masters sans photo
  régénérés et liés (O-10 : 21/22, puis CarouselControls réparé en O-12) ; l'attribution
  des écarts est passée par le dump REST versionné (`2384251202054787848`) — arithmétique
  par section, jamais au flair ; ~90 % du diff pixel résorbé entre FINAL4 et FINAL18
  (~1,4 M px de diff au départ, 128 k–219 k par page en FINAL17 ; O-14, O-15). En FINAL17,
  4 maquettes sur 9 sont **exactes en hauteur** vs la référence pré-chantier, et chaque
  delta restant a un nom, une cause et un statut (assumé ou résiduel fin — O-15).
  FINAL18 vs référence : rien de dégradé, a-propos amélioré (O-16).

Le journal des lots formels (`decisions.md`, § Lots) : `U1a-variables` ✅ conforme ·
`U1a-sentinelle` ✅ conforme · `L-DW002` ✅ conforme · `R-pilote-tab` ⚠️ **arrêté** —
l'écart imprévu du pilote (police Inter, cadres parasites) n'a **jamais été accepté** :
lot arrêté, maquette restaurée byte-identique (`c4acfdf1b9512cec`), les deux défauts
moteur corrigés fixture-d'abord avant toute reprise.

## 2. Les comptes qui fondent ce rapport

**Relancés ce jour (2026-08-06, 15 h 23), pour ce rapport** :

- `npm run parity` — **exit 0** :
  `✔ No new drift — 3 acknowledged finding(s) remain in parity/baseline.json.`
  Les 3 acquittements : `icons|ahead|assets/icons/close.svg`,
  `figma|behind|Carte.Bouton`, `figma|behind|SectionHeader.Bouton`.
  **Zéro** entrée `figma-tokens` (couverture géométrie).
- `npm run geometry:gate` — **exit 0** :
  `contracts 34 · geometric entries 2 · governed refs 241 · named literals 2 · invisible 0`
  `✓ zero invisible literal, zero registry refusal`

**Archivés, datés, non relancés ici** (trop longs — la consigne de mesure du jour) :

- `evals/results.json` (sweep du 2026-08-06, 13:59) : **184/184 pass**, 48 quarantined,
  0 échec.
- `specs/016-canvas-vrai/proofs/measure-gate-post-dw.txt` (2026-08-06, note T035) :
  verdict **PASS (exit 0)** —
  `contract-geometry=0 · image-boundary=11 · rendering=24 · engine=2 · instrument=1 · figma-source=2`,
  **avec l'écart consigné** : `rows.json` du même run compte **0 ligne `figma-source`**
  (le résumé compte les règles de triage, pas les lignes — décalage d'instrument,
  consigné, pas maquillé).
- Registre des défauts de source : `registre/defauts-source.json` (2026-08-06) — détail au §3, SC-005.

## 3. Les six critères de succès

### SC-001 — Les acquittements de couverture géométrie tombent à zéro : **ATTEINT**

Compte vif du 2026-08-06 : `parity/baseline.json` porte **3** entrées, **aucune**
`figma-tokens|behind|Primitives/(space|size)/…`. Trajectoire sourcée : **89** à
l'ouverture (relevé du 2026-08-05, ventilé 83 géométrie + 6 résiduel — l'écart avec le
« ≈7 » de la spec avait été nommé dès l'ouverture, D11) → **6** après U1a (T017) → **3**
aujourd'hui (deux acquittements sont tombés d'eux-mêmes à la ré-extraction du cliché,
qui datait de deux semaines — O-6 ; `montserrat` résolu en cours de chantier). Zéro
acquittement « variable manquante » : le critère est tenu, et mieux que l'annonce.

### SC-002 — Sentinelle détectée + stabilité ×2 : **PARTIELLEMENT**

Prouvé le **2026-08-05** sur l'état post-U1a (reçus `proofs/recus/sentinelle-*.txt`,
lot `U1a-sentinelle`) : écart introduit → signalé, classé, remédiable (`adoptFigmaValue:
999`, 2 remèdes, parity exit 1) ; annulation → exit 0, deux passes **byte-identiques**.
**Le reste a un nom** : T073 — rejouer la sentinelle sur l'**état final** du chantier
(la spec dit « introduit après clôture » ; `contracts/sentinelle-variables.md` exige la
répétition en clôture). Non rejoué au moment de la rédaction.

### SC-003 — 100 % des gestes conformes à leur annonce, zéro écart imprévu accepté : **PARTIELLEMENT**

Ce qui a tenu, partout : **zéro écart imprévu accepté** — le pilote Tab a été arrêté et
restauré byte-identique plutôt qu'accepté ; les écarts des vagues de régénération
(+300 à +536 px par maquette, O-10) ont été **attribués un à un** au dump versionné puis
réparés (FINAL4 → FINAL18) ; aucun écart n'a été requalifié après coup en « bruit
acceptable » ; les deltas finaux restants sont **assumés nommément** (industrielles −3,5
≈ DW-002 assumé ; accueil +8 / dépannage −8, wrap AUTO ±1 interligne ; portes-entrée
+24,5 / résidentielles +20,5, header FAQ réformé + nettoyage §VIII — différence de
doctrine assumée, O-15).
Ce qui n'est **pas** tenu au sens strict de la spec : « 100 % des gestes **prouvés
conformes à leur annonce** ». Les 4 lots formels du journal le sont (3 conformes,
1 arrêté proprement) ; les vagues de régénération d'US3 sont sorties du cadre
annonce-par-lot (T058/T059 non déroulés) — leurs écarts ont été attribués et résorbés
**après coup**, pas annoncés d'avance. **Le reste a un nom** : T058, T059, T063, T071.

### SC-004 — Zéro photo perdue ou intervertie, identité vérifiée à 100 % : **REPORTÉ** (aucune perte connue, verdict non rendu)

Fait : le census AVANT est complet et antérieur à toute écriture (2026-08-05,
`proofs/photos/RECONCILIATION.md`) — **349 photos** (136 masters + 213 maquettes),
86 images distinctes, **0 invérifiable**, et **14 composants porteurs relevés contre 9
annoncés** (la réconciliation a mis 76 photos non annoncées sous protection — Equipe,
Reassurances, CategoriesPrincipales). Mieux : une photo perdue **avant** la spec (le fond
du CTA Devis, hash `7825ba2d…`) a été retrouvée dans le fichier et reposée sur le master
et ses 8 instances (O-13).
Non fait : le **verdict d'identité photo par photo** (census APRÈS + `photos-verify.mts`
→ `photos-report.json`, T060/T061) n'est **pas rendu** au moment de la rédaction —
`proofs/photos/` ne contient que la réconciliation. La passe de régénération/vérification
des **13 masters porteurs** restants (14 relevés moins MemberCard, bloqué à la frontière
image A5) **serait donc encore à faire** ; la phase Canvas du workflow en cours peut la
clore, et ce rapport devra être amendé de son verdict. Limite déjà nommée du census :
identité par `imageHash` (qui adresse le contenu), **sans** sha256 des octets — la
lecture des 86 images fait tomber le plugin (constaté) ; la contre-preuve hors Figma
reste à prendre par lots ou à léguer.

### SC-005 — 10/10 défauts de source clos avec reçus : **PARTIELLEMENT** (9/10 traités, reçus T049 en cours)

Registre vif (`registre/defauts-source.json`, relevé le 2026-08-06 à 15 h 23) :

| État au registre | Entrées | Détail |
|---|---|---|
| `clos` | 4 | DW-003 (rebuild FAQ : l'en-tête HUG 83 par construction, reçu `DW-003.md`) · B013-2, B013-3 (élévation VARIANT, section-header 2.1.0 — le reçu `B013-2.md` posé ce jour à 15 h 15) · B013-6 (**sans geste**, décision owner « intention » du 2026-08-05, reçu `B013-6.md`) |
| `corrige` | 1 | DW-002 (lot conforme, token 363,5, React delta 0 — reçu `DW-002.md` ; le passage à `clos` reste un geste de registre) |
| `annonce`, geste **fait** au canvas (journal O-16) | 4 | B013-1 (4 props orphelines supprimées, orphelinage re-prouvé atomiquement — **son reçu `B013-1.md` existe depuis 15 h 15**, la bascule de statut reste à faire) · B013-5 (réordonné, écart 0 px — le mécanisme réel était un GRID MANUAL, consigné) · B013-7 (fills[1] mort supprimé) · B013-8 (constat : la régénération avait purgé « outilne » ; button 2.0.0 + migration) — **les reçus de B013-5/7/8 n'existent pas encore** (T049) |
| `annonce`, geste **non fait** | 1 | **B013-4** (props TEXT hero/sav — diagnostic vif du 2026-08-05 : le geste est plus petit qu'annoncé, un seul texte non lié par master ; T041/T042) |

Les clôtures croisées sont posées (vérifié ce jour) : `resolvedBy: "016-canvas-vrai"`
sur DW-002 et DW-003 dans `specs/013-…/proofs/deferred/work.json` **et**
`specs/014-…/proofs/registre/causes.json`. `measure:gate` : PASS, `figma-source=2` au
résumé / **0 ligne** dans rows.json — l'écart d'instrument consigné (§2). Compte
honnête : **9/10 traités au canvas ou clos sur décision**, 1 non traité (B013-4) ;
T049 est **en cours au moment de la rédaction** (2 reçus posés à 15 h 15, restent
B013-5/7/8 + les bascules de statut DW-002, B013-1).

### SC-006 — Field et NavItem mesurés sans blocage : **REPORTÉ**

Aucune des tâches T064–T070 n'est faite : la condition de déblocage n'a pas été
re-dérivée au vif, la fixture Field (rouge d'abord) n'est pas écrite, l'émetteur n'est
pas corrigé, NavItem n'est pas re-mesuré — les reçus `blocked`/`fail` d'époque
(`pv-field`, `pv-nav-item` dans `extract/figma/visual-parity/triage.ts`) restent le
dernier mot. Au moment de la rédaction, des **diagnostics Field et NavItem sont en cours
dans le workflow** ; s'ils aboutissent, ce critère devra être re-jugé sur pièces
(`sc-006.txt`, T070), pas déclaré. À noter : la campagne composant du 2026-08-06 a
re-tourné en SUMMARY GATE, toutes lignes à ±0,1 pp du baseline (O-14) — aucune
régression ailleurs, mais ce n'est pas le déblocage demandé.

## 4. Limites et acquis que le chantier lègue expressément

**La limite de la surveillance rebranchée** — reprise **verbatim** du reçu sentinelle
(T023), à l'endroit exact où la capacité « la maquette est surveillée » est revendiquée :

> **Ce que cette capacité NE couvre pas.** L'axe `variables canvas ⟷ tokens` surveille
> l'**existence** et la **valeur** des variables. Il ne surveille **pas** les *liaisons* :
> si un designer **détache** une dimension au niveau du nœud (`detach`, puis saisie d'une
> valeur brute), la variable reste intacte et conforme — **le différentiel ne signale
> rien**. `parity/diff.ts` ne lit jamais `boundVariables` (0 occurrence, vérifié).
>
> Ce trou est rattrapé, mais **en différé et non en continu** : par l'audit de liaison
> (`bridge/bindings-audit.js`, T062) et par toute régénération, qui repose les liaisons.
>
> Une surveillance continue du détachement n'est **pas livrée par 016** — c'est une
> limite assumée, léguée telle quelle au rapport de clôture.

**Acquis d'instrument et de méthode** (chacun demandait à être porté ici) :

- **Le préchauffage des captures** (O-3) : la première capture d'une session d'une frame
  à paint `IMAGE` sort incomplète (mesuré : deux sha256 différents sans aucun geste) ;
  à chaud, `exportAsync` est byte-déterministe. Règle : le premier jeu de capture ne sert
  jamais de référence — rien dans le dépôt ne le documentait avant 016.
- **`exit 2` n'est pas un verdict** (O-8) : un refus de se prononcer (dimension-mismatch)
  n'autorise jamais à conclure à la conformité — et une revue visuelle lisible vaut un
  verdict, parce qu'elle rend le défaut visible à qui connaît le design.
- **« TEXT survit » ne vaut que pour l'amend-in-place** (O-12) : un rebuild de variantes
  recrée les nodes internes et rend orphelins **tous** les overrides d'instance en aval —
  TEXT compris ; et la reconstruction des enfants d'un master **perd les overrides
  INSTANCE_SWAP** (O-11) — même famille de risque que les photos, étendue aux swaps.
- **L'attribution ne se fait jamais au pixel de page** (O-14) : ~40 % du diff de page
  n'était que du report en cascade — l'attribution passe par les dumps REST par section
  (le dump versionné `2384251202054787848` a rendu chaque delta arithmétique).

## 5. Ce que 016 laisse derrière

### 5.1 Les 25 tâches restantes (`tasks.md`, 56/81 au 2026-08-06)

- **US2 (4)** : T041/T042 (B013-4 — lier les deux textes hero/sav + promotion contrats),
  T049 (les reçus individuels des 10 + passage des statuts du registre à `clos` — **en
  cours** : `B013-1.md` et `B013-2.md` posés ce jour à 15 h 15, restent B013-5/7/8 et
  les bascules de statut), T051 (checkpoint sweep US2).
- **US3 (14)** : T056 (`cibles.json` dérivé d'un cliché frais), T058/T059 (les lots de
  régénération formels sous cycle annonce → preuve), T060/T061 (census photos APRÈS +
  verdict d'identité — voir SC-004), T063 (`parity-post-us3.txt`), T064–T070 (Field et
  NavItem — voir SC-006), T071 (checkpoint sweep US3).
- **Phase 6 (7)** : T072 (re-justifier `parity/baseline.json` ligne par ligne),
  T073 (sentinelle rejouée sur l'état final), T074 (mémoires projet devenues fausses),
  T075 (**ce document** — le seul que cette rédaction clôt), T076 (docs : `MILESTONES.md`,
  `docs/handoff/10-history.md`, `CHANGELOG.md`, `ROADMAP.md`, `CLAUDE.md`),
  T077 (rejouer le quickstart), T078 (sweep de clôture).

### 5.2 Les acquittements parity restants (3)

- `figma|behind|Carte.Bouton` et `figma|behind|SectionHeader.Bouton` — le contrat
  compose `ds.button`, aucune instance `Bouton` dans le master Figma ; masters
  photo-carrying/avecCta, dits « à traiter hors 016 » (O-15) — mais ce sort doit être
  **consigné comme décision owner** au re-jugement de T072, pas rester une note.
- `icons|ahead|assets/icons/close.svg` — asset code sans entrée au registre d'icônes :
  promotion (exige un master Figma) ou suppression ; à trancher, T072.

### 5.3 La passe photos des 13 masters porteurs — au conditionnel

Si elle n'est pas faite au moment où ce rapport est lu (elle ne l'était pas au moment de
sa rédaction — aucun `census-apres`/`photos-report.json` dans `proofs/photos/`), la
régénération des 13 masters porteurs de photos (14 relevés au census moins MemberCard,
frontière A5) reste le dernier chantier canvas d'US3, sous verdict d'identité photo par
photo. **La phase Canvas du workflow en cours peut la clore** — ce rapport devra alors
être amendé de son verdict (SC-004). S'y rattachent : la repose des chevrons de maquette
(overrides INSTANCE_SWAP perdus — les ids d'origine sont relevés, O-11/O-12) si elle
n'est pas déjà faite, et la contre-preuve sha256 des octets d'images (limite du census,
§ SC-004).

### 5.4 La gouvernance des pages — non tranchée

Les 9 maquettes de la page `Pages` ne sont gouvernées par **aucun** document : leurs
surcharges d'instance (textes, états, swaps, photos, plages rich-text) n'ont pas de
source de vérité contractuelle. 016 l'a éprouvé : pour les restaurer, il a fallu générer
198 gestes depuis le dump REST versionné (`proofs/repose/gestes.json`, O-12/O-14) — la
preuve que la question existe, pas sa réponse. Qui gouverne l'assemblage de page
(un contrat de page, un snapshot gouverné, ou le statu quo « le fichier client fait
foi ») reste une décision à prendre, hors 016.

### 5.5 Les limites léguées, déjà nommées ailleurs et reprises ici

- **Le détachement de liaison** n'est pas surveillé en continu (§4, verbatim).
- **MemberCard / la frontière image A5** — chantier 017 ; jusqu'à lui, MemberCard reste
  bloqué honnêtement, sa divergence est une limite nommée, pas un échec.
- **DW-014-002** — l'instrument de parité visuelle rend `emit-html`, jamais la surface
  React livrée (la mesure T030 a dû construire son propre rig React pour cette raison).
- **DW-014-003** — rich-text à travers la composition, hors périmètre.
- **Les 89 littéraux** de trait, peinture et typographie — population suivante du patron
  015, une autre spec.
- **Les 30/69 pointeurs périmés** du dossier d'audit de 013 — chantier séparé.
- **Le 58ᵉ set** `Style=Icône seule` (graphie de variante sur un composant autonome,
  O-6) — signe de source à vérifier, hors périmètre des 10 défauts de 016.

### 5.6 Les trous de journal — nommés, pas masqués

`MILESTONES.md` s'arrête à la spec 010 (011 à 015 sans entrée datée, et 016 n'y est pas
encore) ; `docs/handoff/10-history.md` s'arrête à la spec 002. La règle du dépôt est de
nommer ce trou plutôt que d'écrire par-dessus : T076 est la tâche qui le comble.
