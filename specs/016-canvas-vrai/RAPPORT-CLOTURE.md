# Rapport de clôture — 016 · Canvas vrai

**Rédigé le** : 2026-08-06 (comptes vifs rafraîchis à 15 h 23, HEAD `0ed9981`)
**Révisé le** : 2026-08-06 (fin de journée) — porté à l'**état final**, HEAD `08f7d22` · **Branche** : `016-canvas-vrai`
**État des tâches** : **56 cases cochées / 81** (`rg -c "^- \[X\]"` = 56, `^- \[ \]` = 25) — mais
`tasks.md` **n'a pas été re-coché depuis `0ed9981`** : plusieurs des 25 « restantes » sont
faites en fait. L'écart est détaillé au §5.1 plutôt que corrigé en silence : le compte de
cases n'est pas le compte de travail.

> **Statut honnête** : la première rédaction datait d'un chantier en cours ; cette révision
> le porte à son état final (commit `08f7d22` — passe photos, règle CSS text-flow, revue
> adversariale, trois défauts profonds nommés). Le chantier n'est pas *fini* pour autant :
> ce qui reste est nommé au §5, avec sa cause et son destinataire. Chaque compte ci-dessous
> est soit une commande **relancée**, soit une sortie **archivée et datée**, soit un
> **fichier du dépôt vérifié à HEAD**. Aucun chiffre n'est recopié de la prose des documents
> de planning : quand la prose et le vif divergent, le vif fait foi et l'écart est nommé.

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
- **La passe finale (O-17)** a clos les porteurs de photos (11 masters amendés, census par
  master, **57/57 photos, 0 perdue**), reformé `Equipe` (wrap + mints `size.equipe.root`
  1728 et gaps exacts en tiers), posé la **règle moteur CSS text-flow** (fixture
  `text-fills-constrained-parent`) et traité une **revue adversariale du moteur** —
  d'où le passage de la suite à **193/193**. Elle a aussi nommé **trois défauts profonds**
  que seul le premier vrai rebuild pouvait révéler (§5.2). Mesure FINAL21 au §5.3.

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

Ces deux comptes tiennent à l'état final : `parity/baseline.json` à HEAD `08f7d22` porte
exactement ces **3** lignes et aucune autre (fichier vérifié), et le sweep du commit final
rapporte `parity` exit 0 avec les mêmes 3 acquittés (O-17, message de `08f7d22`).

**Archivés, datés, non relancés ici** (trop longs — la consigne de mesure du jour) :

- `evals/results.json` **à HEAD `08f7d22`** : **193/193 pass**, 48 quarantined, 0 échec.
  C'est **+9 portes** sur le 184/184 de la première rédaction : les neuf fixtures écrites
  dans la journée n'étaient branchées sur **aucune** porte, la revue adversariale les a
  câblées dans `evals/run.ts` (§5.6). Leurs ids : `figma-font-family-from-token`,
  `figma-border-color-without-width`, `absolute-part-out-of-flow`, `icon-size-tokens-by-prop`,
  `dep-resolved-by-marker`, `composed-child-slot-content`, `zero-height-line-part`,
  `text-prop-and-visible-refs-coexist`, `text-fills-constrained-parent`.
- Census photos **par master** de la passe finale (O-17) : 11 masters porteurs amendés,
  **57/57 photos, 0 perdue** — relevé au journal, **sans artefact machine** dans
  `proofs/photos/` (voir SC-004 et §5.1).
- Mesure **FINAL21** vs référence pré-chantier (O-17) : les 9 hauteurs, leurs écarts et
  leurs causes — table au §5.3.
- `specs/016-canvas-vrai/proofs/measure-gate-post-dw.txt` (2026-08-06, note T035) :
  verdict **PASS (exit 0)** —
  `contract-geometry=0 · image-boundary=11 · rendering=24 · engine=2 · instrument=1 · figma-source=2`,
  **avec l'écart consigné** : `rows.json` du même run compte **0 ligne `figma-source`**
  (le résumé compte les règles de triage, pas les lignes — décalage d'instrument,
  consigné, pas maquillé).
- Registre des défauts de source : `registre/defauts-source.json` — **13 entrées** à l'état
  final (les 10 héritées de 013, dont **9 `clos`**, plus **3 défauts nommés par 016**, tous
  `ouvert`) — détail au §3 SC-005 et au §5.2.

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
répétition en clôture). **Pas rejoué dans ce qui est commité à `08f7d22`** : aucun reçu
sentinelle postérieur au 2026-08-05 n'y figure. Un reçu déposé après ce commit clôt le
critère — il se lit dans `proofs/recus/`, pas ici.

### SC-003 — 100 % des gestes conformes à leur annonce, zéro écart imprévu accepté : **PARTIELLEMENT**

Ce qui a tenu, partout : **zéro écart imprévu accepté** — le pilote Tab a été arrêté et
restauré byte-identique plutôt qu'accepté ; les écarts des vagues de régénération
(+300 à +536 px par maquette, O-10) ont été **attribués un à un** au dump versionné puis
réparés (FINAL4 → FINAL18) ; aucun écart n'a été requalifié après coup en « bruit
acceptable » ; les deltas finaux restants sont **assumés nommément** (industrielles −3,5
≈ DW-002 assumé ; accueil +8 / dépannage −8, wrap AUTO ±1 interligne ; portes-entrée
+24,5 / résidentielles +20,5, header FAQ réformé + nettoyage §VIII — différence de
doctrine assumée, O-15). *Ces deltas sont ceux de FINAL17 ; l'état final (FINAL21) les
a réduits et re-attribués — la table qui fait foi est au **§5.3**.*
Ce qui n'est **pas** tenu au sens strict de la spec : « 100 % des gestes **prouvés
conformes à leur annonce** ». Les 4 lots formels du journal le sont (3 conformes,
1 arrêté proprement) ; les vagues de régénération d'US3 sont sorties du cadre
annonce-par-lot (T058/T059 non déroulés) — leurs écarts ont été attribués et résorbés
**après coup**, pas annoncés d'avance. **Le reste a un nom** : T058, T059, T063, T071.

### SC-004 — Zéro photo perdue ou intervertie, identité vérifiée à 100 % : **ATTEINT AU RELEVÉ**, sans l'artefact de verdict

Fait : le census AVANT est complet et antérieur à toute écriture (2026-08-05,
`proofs/photos/RECONCILIATION.md`) — **349 photos** (136 masters + 213 maquettes),
86 images distinctes, **0 invérifiable**, et **14 composants porteurs relevés contre 9
annoncés** (la réconciliation a mis 76 photos non annoncées sous protection — Equipe,
Reassurances, CategoriesPrincipales). Mieux : une photo perdue **avant** la spec (le fond
du CTA Devis, hash `7825ba2d…`) a été retrouvée dans le fichier et reposée sur le master
et ses 8 instances (O-13).
Fait depuis (passe finale, O-17) : les masters porteurs ont été amendés sous **census par
master** — **57/57 photos, 0 perdue définitivement**, avec deux incidents traités en cours
de passe (la 5e carte de `reassurances`, reperdue à chaque rebuild — devenue la limite
`D-016-REPEAT-SAMPLE-PAR-VARIANTE` ; `Equipe` effondrée, reformée par wrap + mints). Aucune
perte, aucune interversion connue à l'état final.

Non fait, et c'est la réserve du verdict : **l'artefact machine n'existe pas**. `proofs/photos/`
ne contient toujours que `RECONCILIATION.md` — ni census APRÈS ni `photos-report.json`
(T060/T061), alors que `tools/photos-verify.mts` et `bridge/photos-census.js` sont au dépôt.
Le verdict d'identité photo par photo sur la **population complète** du census d'ouverture
(349 photos, dont **255 surcharges d'instance**) reste donc un relevé de journal, pas une
sortie re-testable. À noter aussi : **11 masters amendés** contre 13 attendus (14 relevés
moins MemberCard, frontière A5) — l'écart n'est pas explicité au journal ; deux des porteurs
recensés (`CategoriesPrincipales`, `ProduitsECommerce`) sont des sections **client non
gouvernées**, donc hors de portée d'un amend piloté par contrat, ce qui l'explique
probablement — à confirmer, jamais à décréter. Limite déjà nommée du census : identité par
`imageHash` (qui adresse le contenu), **sans** sha256 des octets — la lecture des 86 images
fait tomber le plugin (constaté) ; la contre-preuve hors Figma reste à prendre par lots ou
à léguer.

### SC-005 — 10/10 défauts de source clos avec reçus : **PARTIELLEMENT** (10/10 traités, **9/10 clos avec reçu**)

**État final (`registre/defauts-source.json` à HEAD `08f7d22`)** : **9 entrées sur 10 sont
`clos`, chacune avec son reçu** — DW-002, DW-003, B013-1, B013-2, B013-3, B013-5, B013-6,
B013-7, B013-8. **B013-4 fait exception** : sa promotion côté code est bien au dépôt
(`hero` 1.4.0 — prop rich-text `sousTitre` liée à la propriété TEXT native « SousTitre » —
et `sav` 1.3.0), mais son entrée au registre est restée à `annonce` et son reçu
`proofs/recus/B013-4.md`, **déclaré au registre, n'existe pas sur le disque**. Le geste
canvas T041 n'est affirmé que par la description du contrat : ni entrée au journal, ni reçu.
C'est un geste de registre qui manque, pas un défaut de source — mais tant qu'il manque,
le critère se compte 9/10.

Le registre porte par ailleurs **3 entrées de plus** (13 au total) : les défauts que 016 a
lui-même découverts, tous `ouvert` — §5.2.

*Ci-dessous, l'état intermédiaire relevé le 2026-08-06 à 15 h 23, conservé parce qu'il
montre la trajectoire :*

| État au registre | Entrées | Détail |
|---|---|---|
| `clos` | 4 | DW-003 (rebuild FAQ : l'en-tête HUG 83 par construction, reçu `DW-003.md`) · B013-2, B013-3 (élévation VARIANT, section-header 2.1.0 — le reçu `B013-2.md` posé ce jour à 15 h 15) · B013-6 (**sans geste**, décision owner « intention » du 2026-08-05, reçu `B013-6.md`) |
| `corrige` | 1 | DW-002 (lot conforme, token 363,5, React delta 0 — reçu `DW-002.md` ; le passage à `clos` reste un geste de registre) |
| `annonce`, geste **fait** au canvas (journal O-16) | 4 | B013-1 (4 props orphelines supprimées, orphelinage re-prouvé atomiquement — **son reçu `B013-1.md` existe depuis 15 h 15**, la bascule de statut reste à faire) · B013-5 (réordonné, écart 0 px — le mécanisme réel était un GRID MANUAL, consigné) · B013-7 (fills[1] mort supprimé) · B013-8 (constat : la régénération avait purgé « outilne » ; button 2.0.0 + migration) — **les reçus de B013-5/7/8 n'existent pas encore** (T049) |
| `annonce`, geste **non fait** | 1 | **B013-4** (props TEXT hero/sav — diagnostic vif du 2026-08-05 : le geste est plus petit qu'annoncé, un seul texte non lié par master ; T041/T042) |

Les clôtures croisées sont posées (vérifié ce jour) : `resolvedBy: "016-canvas-vrai"`
sur DW-002 et DW-003 dans `specs/013-…/proofs/deferred/work.json` **et**
`specs/014-…/proofs/registre/causes.json`. `measure:gate` : PASS, `figma-source=2` au
résumé / **0 ligne** dans rows.json — l'écart d'instrument consigné (§2).

*(Fin de l'état intermédiaire. À l'état final, les bascules de statut et les reçus
B013-5/7/8 ont été posés : voir le compte de tête, 9/10 `clos` avec reçu, B013-4 excepté.)*

### SC-006 — Field et NavItem mesurés sans blocage : **REPORTÉ**

Une seule pièce a bougé, et elle est datée : le **rouge Field est archivé** —
`proofs/recus/field-rouge.txt` (2026-08-06, `slot-control-fill-reaches-wrapper-check.ts`,
exit 1) montre le défaut sur les trois surfaces (HTML, React livré, spec Figma). Le reste de
T064–T070 n'est pas fait : la condition de déblocage n'est pas écrite
(`deblocage-condition.md` absent), l'émetteur n'est pas corrigé, NavItem n'est pas
re-mesuré — les reçus `blocked`/`fail` d'époque (`pv-field`, `pv-nav-item` dans
`extract/figma/visual-parity/triage.ts`) restent le dernier mot. Et le même reçu porte un
fait nouveau qui interdit de conclure vite : la régénération du jour a **exporté le défaut
moteur vers le canvas** (master Field 2056:1278 passé de 280 à 125 CSS, sizing HUG), si bien
qu'« une mesure pixel proche de Δ0 sur ce sujet serait un FAUX VERT » — §5.7. À noter : la
campagne composant du 2026-08-06 a
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

*Section révisée à l'**état final** (HEAD `08f7d22`). Sources : `decisions.md` O-16 et O-17,
`registre/defauts-source.json` (13 entrées), l'arbre `proofs/` et les fichiers du dépôt
vérifiés à HEAD. Ce qui suit n'est pas une liste de regrets : c'est l'inventaire de ce
qu'une autre spec, ou l'owner, doit reprendre — chaque ligne avec sa cause et son
destinataire.*

### 5.1 Les tâches — 56/81 cochées, un compte en retard sur les faits

`tasks.md` n'a pas été re-coché depuis `0ed9981` : le compte vif donne toujours 56 cases
cochées et 25 vides, alors que le commit final en a réglé plusieurs. L'écart est nommé ici
plutôt que corrigé en silence, et re-cocher `tasks.md` fait partie de ce qui reste.

**Faites en fait, case non cochée** :

- **T041 / T042 (B013-4)** — la promotion est au dépôt : `hero` **1.4.0** (le paragraphe
  Sous-titre cesse d'être cuit en dur, il devient la prop rich-text `sousTitre` liée à la
  propriété TEXT native « SousTitre ») et `sav` **1.3.0**. Le geste canvas T041 n'est
  affirmé que par la description du contrat : **ni entrée au journal, ni reçu**.
- **T049** — 9 reçus sur 10 existent (`proofs/recus/B013-1|2|3|5|6|7|8.md`, `DW-002.md`,
  `DW-003.md`) et 9 entrées du registre sont passées à `clos`. **B013-4 reste `annonce`**,
  et son reçu `proofs/recus/B013-4.md`, déclaré au registre, n'existe pas sur le disque.
- **T060 / T061 (photos)** — la passe a eu lieu : 11 masters porteurs amendés, census **par
  master**, **57/57 photos, 0 perdue** (O-17). Mais `proofs/photos/` ne contient toujours que
  `RECONCILIATION.md` : **ni census APRÈS, ni `photos-report.json`**, alors que
  `tools/photos-verify.mts` et `bridge/photos-census.js` sont au dépôt. Le verdict d'identité
  existe comme relevé de journal, pas comme sortie re-testable (SC-004).
- **T065 (Field)** — le rouge est archivé et daté : `proofs/recus/field-rouge.txt` (exit 1),
  et il porte en prime un relevé canvas du même jour (§5.7). **T064** en revanche — la
  condition de déblocage re-dérivée au vif — n'est pas écrite : `deblocage-condition.md`
  est absent.
- **T075** — ce document ; cette révision le clôt.
- **T076** — partiellement : `docs/handoff/10-history.md` porte une section 016 et **nomme**
  le trou 003–015 sans le combler ; le reste (§5.11) non.

**Restant vraiment — arrêté à HEAD `08f7d22`** (tout artefact déposé après ce commit peut
déjà en avoir clos : c'est le fichier de `proofs/` qui fait foi, pas cette liste) :
T051 (sweep US2), T056 (`cibles.json`), T058 / T059 (les lots de
régénération sous cycle annonce → preuve, non déroulés — cf. SC-003), T063
(`parity-post-us3.txt`), T064 et T066–T070 (Field/NavItem : condition de déblocage,
correctif d'émetteur, les 3 re-pins, régénération, re-mesure NavItem, preuve SC-006),
T071 (sweep US3), T072 (re-justifier
`parity/baseline.json` ligne par ligne), T073 (sentinelle rejouée sur l'état final), T074
(mémoires projet devenues fausses), T077 (quickstart rejoué), T078 (sweep de clôture).

### 5.2 Trois défauts profonds, nommés et ouverts

Le registre compte **13 entrées** : les 10 héritées de 013 (9 `clos`, B013-4 à consigner) et
**3 que 016 a découvertes lui-même**, toutes `ouvert`. Ce ne sont pas des restes de ménage :
ce sont des faits que **seul le premier vrai rebuild pouvait révéler**. Cités du registre,
dans leurs termes :

- **`D-016-CARTE-BOUTON`** — « Le contrat ds.carte rend le bouton de la variante Categorie
  comme UNE part 'action' ; l'origine (dump versionné 016/U1a-variables/avant, master
  2063:1622) porte TROIS enfants [Pdf, Libellé, Download/ArrowRight] avec glyphes par page.
  Révélé par le PREMIER rebuild du master (passe photos du 2026-08-06) — jamais reconstruit
  avant. Diff pixel des pages à cartes (portes-de-garage ~1,05M px). Réparation : re-extraire
  la part bouton de carte (glyphes INSTANCE_SWAP + libellé), pas un geste canvas. »
- **`D-016-SECTIONS-LOCALES-CARTES`** — « Les sections locales des maquettes
  (CategoriesPrincipales, ProduitsECommerce, Hero et catégories…) sont des masters CLIENT non
  gouvernés dont les cartes nested (ds.carte) avaient des largeurs PAR PAGE (474 sur
  motorisation ×3, 743 ailleurs) ; le rebuild de ds.carte a re-layouté ces masters et les
  resize nested ne tiennent pas en auto-layout (reposés 27/27 sans effet mesuré). Écarts
  résiduels : motorisation +124, dépannage −32, accueil +10, a-propos +4. Réparation propre :
  gouverner ces sections OU re-poser les layouts des masters locaux — arbitrage owner. »
- **`D-016-REPEAT-SAMPLE-PAR-VARIANTE`** — « Un repeat n'a qu'UN sample pour toutes les
  variantes : la variante '5 cartes' de ds.reassurances reperd sa 5e carte (photo
  d62d8bf3…) à CHAQUE rebuild — reposée deux fois ce jour (census 13/13). Limite de schéma
  nommée : repeat.sampleByProp à concevoir ; d'ici là tout amend de reassurances DOIT
  re-poser la 5e carte. »

Le troisième n'est pas qu'un constat, c'est une **consigne opératoire** : tant que
`repeat.sampleByProp` n'existe pas, quiconque amende `reassurances` repose la 5e carte à la
main, sous peine de la perdre. Le premier est le gros du diff pixel restant des pages à
cartes — et il se répare **côté contrat** (ré-extraction), pas au canvas.

### 5.3 La mesure finale (FINAL21) — ce qui reste, page par page

Hauteurs de l'état final contre la référence pré-chantier :

| Maquette | FINAL21 | Écart | Cause |
|---|---:|---:|---|
| contactez-nous | 3901 | **exacte** | — |
| portes-de-garage | 4372 | **exacte** | — |
| portes-entrée | 6534,5 | +0,5 (réf. 6534) | demi-pixel ; comptée « exacte à ±0,5 » au journal O-17 |
| industrielles | 6758,5 | −3,5 | DW-002 **assumé** (cartes à 363,5, décision owner) |
| résidentielles | 6571,5 | −3,5 | idem |
| a-propos | 5932 | +4 | arrondi des cartes après reformation d'`Equipe` (O-17) |
| accueil | 5440 | +10 | listé aux écarts résiduels de `D-016-SECTIONS-LOCALES-CARTES` |
| dépannage | 4210 | −32 | `D-016-SECTIONS-LOCALES-CARTES` |
| motorisation | 3458 | +124 | `D-016-SECTIONS-LOCALES-CARTES` |

Aucun écart n'est orphelin : deux pages exactes, une à un demi-pixel, deux au −3,5 assumé,
quatre attribuées au registre. Une nuance de source à connaître : O-17 attribue nommément
`dépannage` et `motorisation` à `D-016-SECTIONS-LOCALES-CARTES` et pose `a-propos +4` sur
l'arrondi des cartes, tandis que le registre liste **les quatre** (dont `accueil +10`) parmi
les écarts résiduels de ce même défaut. Les deux lectures sont consignées ; aucune n'est
lissée.

Et le rappel qui vaut pour la suite : **une hauteur exacte n'est pas une page conforme**.
Le diff pixel restant des pages à cartes n'est pas une affaire de hauteur mais d'anatomie —
`D-016-CARTE-BOUTON`.

### 5.4 L'arbitrage owner sur les sections Catégories — **ouvert**, parqué au registre

`D-016-SECTIONS-LOCALES-CARTES` pose la question sans la trancher, et 016 la laisse ouverte
telle quelle : **« Réparation propre : gouverner ces sections OU re-poser les layouts des
masters locaux — arbitrage owner. »**

Gouverner (CategoriesPrincipales, ProduitsECommerce, Hero et catégories… entrent dans le
périmètre contractuel) et reposer une fois (elles restent des masters client, on répare le
layout et on n'y revient plus) n'ont ni le même coût ni les mêmes suites. Le choix appartient
à l'owner du système, pas au chantier : il est **parqué au registre**, pas décidé ici.

### 5.5 Les acquittements parity restants (3)

- `figma|behind|Carte.Bouton` et `figma|behind|SectionHeader.Bouton` — le contrat compose
  `ds.button`, aucune instance `Bouton` dans le master Figma ; masters photo-carrying/avecCta,
  dits « à traiter hors 016 » (O-15) — ce sort doit être **consigné comme décision owner** au
  re-jugement de T072, pas rester une note. Le premier se re-juge désormais avec
  `D-016-CARTE-BOUTON` sous les yeux : c'est le même bouton de carte qui est en cause des
  deux côtés, et le fait nouveau est que le contrat n'est pas seulement en avance sur le
  master — il est **infidèle à l'origine**.
- `icons|ahead|assets/icons/close.svg` — asset code sans entrée au registre d'icônes :
  promotion (exige un master Figma) ou suppression ; à trancher, T072.

### 5.6 La revue adversariale du moteur — 6 confirmés, 2 traités, 4 au travail nommé

Le moteur a été passé en revue de façon adversariale en fin de chantier : **6 défauts
CONFIRMÉS**. Deux traités séance tenante :

1. la garde `twin.remove` du gain d'axe devenait **destructive** sous le nouvel ordre —
   remplacée par un **rename non destructif** assorti d'un signalement ;
2. **neuf fixtures écrites dans la journée n'étaient branchées sur aucune porte** — câblées
   dans `evals/run.ts` (familles C1/C3), ce qui porte la suite de 184/184 à **193/193**.
   Une fixture non branchée ne protège rien : c'est exactement la classe de défaut que la
   règle des claims existe pour empêcher, et elle est passée à un cheveu.

Quatre consignés comme **travail nommé**, non traités (O-17) :

- la règle **ligne-0** sur les canaux uniforme/token — le correctif ne couvre que
  `li.strokeSides` ;
- **`depSlots` trop large** sur les homonymes profonds ;
- **`repeat` + `component.slots`** silencieux ;
- les **validations de slots**, plus faibles que celles de `defaultContent`.

### 5.7 Field et NavItem — le rouge est archivé, et le canvas a hérité du défaut

Le volet Field a produit son rouge daté (`proofs/recus/field-rouge.txt`, 2026-08-06,
`slot-control-fill-reaches-wrapper-check.ts`, exit 1) : un contrôle slotté qui déclare
`control.fill` **ne remplit pas** son parent — mesuré 169 pour 280 attendus — et le défaut
sort identique sur les trois surfaces (HTML, React livré, spec Figma).

Le même reçu porte un fait qui n'était pas prévu et qui commande la suite : la régénération
du jour a **exporté le défaut moteur vers le canvas**. Le master Field (2056:1278) est passé
de 280 à **125 CSS** de large, en sizing HUG — les deux surfaces huggent désormais à
l'identique, si bien qu'« une mesure pixel proche de Δ0 sur ce sujet serait un **FAUX
VERT** ». L'ordre des gestes est donc contraint : corriger l'émetteur (T066), re-piner les
**trois** reçus (T067), **puis** régénérer le master (T068) — jamais l'inverse.

### 5.8 Les pages atelier — nettoyées, et la leçon qui reste

38 fragments d'amends interrompus ont été supprimés des pages atelier, et **722
chevauchements ramenés à 0** (commit `08f7d22`). Le fait est petit, sa leçon ne l'est pas :
**un amend interrompu laisse des fragments sur le canvas et rien dans l'outillage ne les
ramasse**. Le ménage est resté manuel de bout en bout ; personne ne surveille cette
population.

### 5.9 La gouvernance des pages — non tranchée

Les 9 maquettes de la page `Pages` ne sont gouvernées par **aucun** document : leurs
surcharges d'instance (textes, états, swaps, photos, plages rich-text) n'ont pas de
source de vérité contractuelle. 016 l'a éprouvé : pour les restaurer, il a fallu générer
198 gestes depuis le dump REST versionné (`proofs/repose/gestes.json`, O-12/O-14) — la
preuve que la question existe, pas sa réponse. Qui gouverne l'assemblage de page
(un contrat de page, un snapshot gouverné, ou le statu quo « le fichier client fait
foi ») reste une décision à prendre, hors 016. `D-016-SECTIONS-LOCALES-CARTES` (§5.4) en
est la forme concrète et urgente.

### 5.10 Les limites léguées, déjà nommées ailleurs et reprises ici

- **Le détachement de liaison** n'est pas surveillé en continu (§4, verbatim).
- **MemberCard / la frontière image A5** — chantier 017 ; jusqu'à lui, MemberCard reste
  bloqué honnêtement, sa divergence est une limite nommée, pas un échec.
- **DW-014-002** — l'instrument de parité visuelle rend `emit-html`, jamais la surface
  React livrée (la mesure T030 a dû construire son propre rig React pour cette raison ;
  `field-rouge.txt` le re-nomme sur pièces : « DW-014-002 shape: the instrument never
  renders it »).
- **DW-014-003** — rich-text à travers la composition, hors périmètre.
- **`repeat.sampleByProp`** — limite de schéma nommée par `D-016-REPEAT-SAMPLE-PAR-VARIANTE`
  (§5.2), à concevoir dans une autre spec.
- **Les 89 littéraux** de trait, peinture et typographie — population suivante du patron
  015, une autre spec.
- **Les 30/69 pointeurs périmés** du dossier d'audit de 013 — chantier séparé.
- **Le 58ᵉ set** `Style=Icône seule` (graphie de variante sur un composant autonome,
  O-6) — signe de source à vérifier, hors périmètre des 10 défauts de 016.

### 5.11 Les trous de journal — nommés, pas masqués

`docs/handoff/10-history.md` a rattrapé 016 (section « The canvas made true ») **et nomme
explicitement** le trou 003–015 au lieu de l'effacer. Restaient, à HEAD `08f7d22` :
`MILESTONES.md`, arrêté à la spec 010 et sans entrée 016 ; `CHANGELOG.md` ; `ROADMAP.md` ;
`CLAUDE.md` § Recent Changes. T076 est la tâche qui les comble.

Deux phrases sont déjà en retard sur le **commit même qui les a écrites**, et se corrigent
avec T076 : `docs/handoff/10-history.md` parle de « 56/81 tasks » et d'un rapport rédigé
chantier inachevé (cette révision le périme), et `docs/handoff/07-status-what-works.md`
avertit que les six fixtures sont « **not yet registered in `evals/run.ts`'s sweep** » —
elles le sont depuis le même commit, et c'est précisément ce qui fait le 193/193.
