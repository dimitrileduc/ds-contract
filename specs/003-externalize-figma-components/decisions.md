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

## 2026-07-24 — anomalie-tranchee — texte de saisie formulaire (couleur brute)

- **Type** : anomalie-tranchee
- **Composant(s)** : input, textarea, select (atomes Phase A)
- **Verdict owner** : **lier à `color/noir`** (`VariableID:24:52`, `#37373B`) —
  le texte de contenu des 7 occurrences (`input`/`select`/`textarea` bruts,
  `Contactez-nous`) était en noir pur `#000000`, non bindé à aucun token.
- **Chiffres** : usage mesuré avant proposition — `color/noir` : 40 usages
  existants, profil texte de paragraphe 14px Regular (même gabarit que ces
  placeholders) ; `color/noir-bleute` (alternative écartée) : 426 usages,
  profil titres 18-40px — pas le bon gabarit. `#000000` → `#37373B` est un
  changement de pixel réel (contrairement aux renames space/radius,
  0-pixel par construction), mais sans conséquence immédiate : Input est
  net-new, aucune adoption ne remplace de copie aujourd'hui.
- **Raison** : cohérence avec l'usage déjà établi du fichier pour ce gabarit
  typographique (14px Regular) ; zéro nouveau token miné (le même réflexe
  que les refus space/radius et orange-12/42 — ne pas empiler des tokens
  quasi-doublons).
- **Preuve** : `audits/atomes-formulaire.md` § Anomalie
- **Checkpoint** : n/a (décision seule — le geste s'exécute à la construction
  des masters T032/T033/T034, checkpoints dédiés)

*Conséquence prospective, nommée à l'avance* : quand Field (T039/T040) puis
Formulaire (T091/T092) adopteront ces 7 occurrences, le verdict pixel portera
un écart chiffré et localisé sur ce changement de couleur — à présenter comme
`ecart-pixel-accepte` à ce moment, pas une surprise.

## 2026-07-24 — validation-master — Input (atome)

- **Type** : validation-master
- **Composant(s)** : input
- **Verdict owner** : validé sur capture (« oui tu vas tt verif ap tte facon »
  — confirmation explicite, owner note que la preuve pixel formelle viendra
  aux adoptions futures, pas maintenant).
- **Chiffres** : `DS · Atomes` → section « Formulaire » → composant `Input`
  (`2053:1245`, après reconstruction — un premier build `2053:1148` a été
  perdu par un undo pendant la revue, receipt ci-dessous). 280×48, fond
  `color/blanc`, bordure 1px `color/bleu-gris` (INSIDE), coins droits (0),
  texte `Montserrat Regular 14px` lié à `color/noir` (décision ci-dessus),
  `lineHeight` 24px fixe (matché à la source). Propriété **TEXTE** officielle
  « Valeur » liée au calque texte. Zéro dépendance tierce.
- **Raison** : n/a (validation directe)
- **Preuve** : `audits/atomes-formulaire.md` ; captures de session (avant/après
  reconstruction)
- **Checkpoint** : `003/input/master` (versionId `2379706504518730709` —
  reconstruction ; premier essai `2379710889588020661` avant l'undo)

*Incident mineur consigné* : le premier build (`2053:1148` dans une section
`2053:1147`) a disparu de `DS · Atomes` entre la construction et la revue —
page retrouvée à 0 enfant sur les 6 pages du fichier (rien d'orphelin
ailleurs), cohérent avec un undo pendant que l'owner cherchait où le
composant était affiché. Aucun impact sur les 9 maquettes (page neuve et
vide, aucune référence croisée). Reconstruit à l'identique ; vue + sélection
pointées sur le nouveau composant pour éviter la récidive.

## 2026-07-24 — validation-master — Textarea (atome)

- **Type** : validation-master
- **Composant(s)** : textarea
- **Verdict owner** : validation par lot (cadence confirmée à l'entrée
  précédente — l'owner s'appuie sur la preuve pixel des adoptions futures
  plutôt qu'une revue owner à chaque atome individuel de ce lot).
- **Chiffres** : `DS · Atomes` → section « Formulaire » → composant
  `Textarea` (`2053:1247`), 280×128, même style qu'Input (fond `color/blanc`,
  bordure 1px `color/bleu-gris`, coins droits 0), texte aligné en haut
  (`counterAxisAlignItems: MIN`), hauteur **portée par le container**
  (`counterAxisSizingMode: FIXED`, 128px) — pas par un texte surdimensionné
  comme dans la source (`audits/atomes-formulaire.md` § construction à ne pas
  reproduire). Texte lié à `color/noir`. Propriété TEXTE « Valeur ». Zéro
  dépendance tierce.
- **Raison** : n/a
- **Preuve** : `audits/atomes-formulaire.md` ; capture de session (Input +
  Textarea empilés dans la section Formulaire)
- **Checkpoint** : `003/textarea/master` (versionId `2379719371578197819`)

## 2026-07-24 — validation-master — Select (atome)

- **Type** : validation-master
- **Composant(s)** : select
- **Verdict owner** : validation par lot (cadence inchangée — cf. entrée
  Textarea)
- **Chiffres** : `DS · Atomes` → section « Formulaire » → composant `Select`
  (`2053:1249`), 280×48, même boîte qu'Input, `primaryAxisAlignItems:
  SPACE_BETWEEN` pour pousser le chevron à droite. Chevron = **instance** du
  composant local `chevron-down` (`226:373`, `remote: false`, redimensionnée
  24×24 pour matcher l'usage source — le main component par défaut fait
  32×32), jamais une copie. Texte lié à `color/noir`. Propriété TEXTE
  « Valeur ». Zéro dépendance tierce (confirmé programmatiquement :
  `chevron.getMainComponentAsync().remote === false`).
- **Raison** : n/a
- **Preuve** : `audits/atomes-formulaire.md` ; capture de session (3 atomes
  empilés, Select en bas avec chevron visible à droite)
- **Checkpoint** : `003/select/master` (versionId `2379709356261804859`)

## 2026-07-24 — validation-master — Checkbox (atome, net-new intégral)

- **Type** : validation-master
- **Composant(s)** : checkbox
- **Verdict owner** : validation par lot (cadence inchangée)
- **Chiffres** : `DS · Atomes` → section « Formulaire » → `COMPONENT_SET`
  `Checkbox` (`2053:1256`), **propriété variant officielle** `Coché` (valeurs
  `Non`/`Oui` — deux composants distincts combinés via
  `figma.combineAsVariants`, pas un booléen de visibilité sur calque caché).
  Décoché : 20×20, fond `color/blanc`, bordure 2px `color/bleu-gris`, coins
  droits (0). Coché : fond `color/bleu` plein (couleur mesurée comme le rôle
  « primaire/actif » du fichier — 59 usages, essentiellement le variant
  rempli du Bouton — préférée à `color/orange`, 84 usages mais rôle
  décoratif/accent sur icônes et libellés, pas un signal de sélection),
  coche vectorielle blanche (`strokeWeight` 2, `strokeCap`/`strokeJoin`
  `ROUND`). Aucune référence source (RGPD = texte seul) — net-new intégral,
  zéro dépendance tierce.
- **Raison** : n/a
- **Preuve** : `audits/atomes-formulaire.md` ; captures de session (variant
  seul + les 4 atomes ensemble dans la section Formulaire)
- **Checkpoint** : `003/checkbox/master` (versionId `2379715545325265698`)

**Clôture lot 1 (atomes de formulaire)** : Input, Textarea, Select, Checkbox
— les 4 masters de `audits/atomes-formulaire.md` sont construits et validés.
Aucune adoption à cette phase (rien à remplacer pour Checkbox ; les 7 copies
brutes d'Input/Textarea/Select seront adoptées via Field, T039-T040).

## 2026-07-24 — anomalie-tranchee — icône étoile (Avis Google = embed tiers aplati)

- **Type** : anomalie-tranchee
- **Composant(s)** : icone-etoile, (constat transverse : review-card)
- **Verdict owner** : **construire net-new** (comme Checkbox) — pictogramme
  étoile générique, `color/orange`.
- **Chiffres** : la section « Avis Google » (8/9 pages — absente sur
  `Motorisation`, cohérent avec `dag.md`) est un `RECTANGLE` à fill `IMAGE`
  nommé `trustindex-google-reviews-widget`, **même `imageHash`
  `ea17d86d938c8ea316f6e9a2f2e12ae3cb90cff2`** vérifié identique sur 2 pages
  (`Accueil`, `Contactez-nous`) — un unique screenshot d'un widget tiers
  (agrégateur d'avis Google), recopié, pas 8 rendus indépendants. Zéro
  vecteur étoile extractible nulle part dans le fichier.
- **Raison** : une étoile de notation est un glyphe standard sans ambiguïté
  de design — construire à neuf ne « invente » rien qui puisse trahir
  l'intention visuelle observée (couleur dorée/orange confirmée à l'œil sur
  la capture).
- **Preuve** : `audits/atomes-icones.md` §2
- **Checkpoint** : n/a (décision seule — geste à T038)

*Conséquence prospective, nommée à l'avance* : **Review-card (T053, Phase 7)**
fera face au même problème à plus grande échelle — toute la carte (avatar,
nom, texte, badge Google) vit dans ce même raster, pas dans des calques
composables. Le master Review-card ne pourra pas être « nettoyé depuis la
source » comme les autres molécules ; il devra être conçu net-new à partir
du rendu visuel observé, décision à formaliser explicitement à T053 — pas
une surprise si nommé maintenant.

## 2026-07-24 — validation-master — Facebook, Instagram (icônes sociales)

- **Type** : validation-master *(lot — 2 masters de `audits/atomes-icones.md`)*
- **Composant(s)** : Facebook, Instagram
- **Verdict owner** : validation par lot (cadence inchangée depuis le lot 1)
- **Chiffres** : `DS · Atomes` → section « Icônes » → `Facebook` (`2053:1259`,
  32×31.86) et `Instagram` (`2053:1261`, 32×32) — **clonées** (pas
  recréées à main levée) depuis les vecteurs source `280:3801`/`280:3803`
  via `node.clone()` + `figma.createComponentFromNode()`, géométrie
  identique à l'octet. Fill déjà lié à `color/noir-bleute`
  (`VariableID:5:40`) — hérité du clone, vérifié. Noms vrais (au lieu de
  « Group 6/7 »). Zéro dépendance tierce.
- **Raison** : n/a
- **Preuve** : `audits/atomes-icones.md` §1 ; capture de session
- **Checkpoint** : `003/icones-sociales/master` (versionId
  `2379716549790402627`)

## 2026-07-24 — validation-master — Étoile (icône, net-new)

- **Type** : validation-master
- **Composant(s)** : icone-etoile
- **Verdict owner** : validation par lot (cadence inchangée)
- **Chiffres** : `DS · Atomes` → section « Icônes » → `Étoile` (`2053:1263`),
  20×20, `figma.createStar()` (5 branches, `innerRadius` 0.45 — proportion
  standard), fill lié à `color/orange` (décision ci-dessus). Zéro dépendance
  tierce.
- **Raison** : n/a
- **Preuve** : `audits/atomes-icones.md` §2 ; capture de session (3 icônes
  côte à côte : Facebook, Instagram, Étoile)
- **Checkpoint** : `003/icone-etoile/master` (versionId
  `2379715506669168790`)

**Clôture lot 2 (icônes)** : Facebook, Instagram, Étoile — les 3 masters de
`audits/atomes-icones.md` sont construits et validés. Aucune adoption à cette
phase (les 10 occurrences sociales brutes seront adoptées via Footer-column/
Coordonnées ; l'étoile sera consommée par Review-card, T053, dont la
construction net-new est déjà anticipée ci-dessus).

## 2026-07-24 — validation-master — clôture Phase A (preuve pixel collatérale)

- **Type** : validation-master *(clôture de phase, pas un composant — même
  nomenclature élargie que la clôture Phase T)*
- **Composant(s)** : programme (Phase A entière — T030, T032–T035, T037–T038)
- **Verdict owner** : n/a — mesure automatique, pas un arbitrage (résultat
  9/9 identical, rien à trancher)
- **Chiffres** : **9/9 `identical`, 0 diff, exit 0** — `before`
  `.page-parity/tokens-page-after` (fin Phase T) vs `after`
  `.page-parity/phase-a-after` (frais, transport b-fetch, nonce
  `e0f7485edd46f003`). sha256 `Accueil` (`55a9c4085d2d…`) identique à la
  mesure T029c — troisième point de données consécutif sans dérive.
- **Raison** : preuve collatérale unique pour toute la phase plutôt que 9
  micro-preuves — décision nommée à l'avance (`proofs/pages-ds/page-creation.md`,
  T030), pas une omission après coup : les 9 gestes de Phase A vivent sur des
  pages neuves sans référence croisée vers `Pages`.
- **Preuve** : `proofs/phase-a-close/{verdict.json,verdict.md,README.md}`
- **Checkpoint** : n/a (couvre les 9 checkpoints déjà pris individuellement
  par chaque tâche T030-T038)

**Phase A (T030-T038) close.** 7 masters + 3 pages livrés (Input, Textarea,
Select, Checkbox, Facebook, Instagram, Étoile), tous validés owner, zéro
copie brute remplacée (rien à adopter à ce stade), zéro pixel perdu sur les
9 maquettes (mesuré, pas supposé). **Prochain : Phase M (Molécules,
T039+, en commençant par Field qui dépend d'Input/Select/Textarea).**
