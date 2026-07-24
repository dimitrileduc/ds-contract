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

## 2026-07-24 — amendement-orga — convention de nommage des propriétés Figma

- **Type** : amendement-orga
- **Composant(s)** : programme (applicable à Field et toutes les molécules/
  sections à venir, Phases 7-8)
- **Verdict owner** : **français partout**, cohérent avec l'existant —
  propriétés et valeurs de variant restent en français (comme Checkbox,
  Phase A : `Coché` / `Non` / `Oui`), jamais retouché rétroactivement.
- **Chiffres** : n/a — décision de convention, pas une mesure.
- **Raison** : sur suggestion owner, consultation de l'archive des contrats
  legacy pré-reconversion (tag git `demo-51`, historique seul — pas
  matérialisée sur ce worktree, lue via `git show demo-51:contracts/…`) comme
  inspiration pour faciliter un futur design-to-code. Constat : la
  palette legacy est en anglais (`field.contract.json` : `Label`/`Required`/
  `Description` ; `checkbox.contract.json` : `Value` Unchecked/Checked/
  Indeterminate) — alors que le Checkbox déjà livré ici est en français
  (`Coché`). Owner a tranché : rester cohérent avec ce qui est déjà validé et
  committé plutôt que fracturer le nommage au milieu du programme ; les
  contrats legacy restent une inspiration de **structure/anatomie**
  uniquement (ex. Field = wrapper générique via slot, confirmé par
  `field.contract.json`), jamais de nommage. Pas une vérité absolue, nommé
  comme tel par l'owner.
- **Preuve** : `audits/field.md` § Décision owner — état erreur
- **Checkpoint** : n/a (décision de convention seule)

## 2026-07-24 — anomalie-tranchee — état erreur de Field, nouveau token color/rouge

- **Type** : anomalie-tranchee
- **Composant(s)** : field
- **Verdict owner** : **construire maintenant** l'état erreur complet (pas
  différé, pas de placeholder sans couleur).
- **Chiffres** : palette de 12 couleurs vérifiée live avant proposition
  (`figma.variables.getLocalVariableCollectionsAsync()`) — aucune couleur
  rouge/danger existante ; recherche exhaustive `error|erreur|invalid|warning`
  sur les 2 pages du fichier → 0 résultat. Nouveau token miné :
  `color/rouge` = `#D32F2F` (Primitives, mode Value,
  `VariableID:2056:1264`) — contraste ~4.8:1 sur blanc (AA), nettement
  distinct de `color/orange` (#F98A0B, le CTA) pour éviter toute confusion
  de sens.
- **Raison** : aucune preuve source pour l'état erreur nulle part dans le
  fichier (ni couleur, ni forme, ni texte-type) — situation nommée avant
  construction (`audits/field.md` § Anomalie), corroborée par un second
  point de données indépendant : les contrats legacy `field`/`text-field`
  (tag `demo-51`) ne modélisent eux non plus aucun état erreur
  (`"states": []`). Owner a tranché de construire quand même — decision
  humaine consignée, pas une correction silencieuse (FR-010).
- **Preuve** : `audits/field.md` § Anomalie + § Décision owner + § Construction
- **Checkpoint** : `003/field/master` (versionId `2379728271305056286`)

## 2026-07-24 — validation-master — Field (molécule)

- **Type** : validation-master
- **Composant(s)** : field
- **Verdict owner** : validé sur capture (2 variants côte à côte, `État=Normal` /
  `État=Erreur`) — go adoption.
- **Chiffres** : `DS · Molécules` → `COMPONENT_SET` **Field** (`2056:1278`), 2
  variants, 4 propriétés officielles (`État` variant Normal/Erreur ; `Label`
  texte ; `Optionnel` booléen ; `Saisie` instance-swap Input/Select/Textarea).
  Testé bout en bout avec les 4 propriétés poussées simultanément à leur
  valeur non-défaut avant validation (instance de test supprimée après
  vérif). Zéro dépendance tierce.
- **Raison** : n/a (validation directe)
- **Preuve** : `audits/field.md` § Construction ; capture de session (2
  variants)
- **Checkpoint** : `003/field/master` (versionId `2379728271305056286`)

## 2026-07-24 — ecart-pixel-accepte — Field (adoption, T040)

- **Type** : ecart-pixel-accepte
- **Composant(s)** : field
- **Verdict owner** : accepté sur triptyque (avant | après | diff) — écart
  confirmé comme le changement de couleur de texte déjà décidé en Phase A,
  rien d'autre.
- **Chiffres** : **8/9 `identical`, 1 `diff`** (Contactez-nous — seule
  maquette porteuse de `field`), `diffCount=3902`, `diffBox={x:925, y:833,
  w:682, h:420}` (repère local à l'export de la maquette). Diff localisé
  exclusivement sur les caractères de texte des 7 champs (`#000000` →
  `color/noir` `#37373B`, décision `anomalie-tranchee` du 2026-07-24, Phase
  A) — aucun décalage, aucune dimension changée, aucun contenu manquant.
  8 autres maquettes : sha256 strictement identiques avant/après (0 pixel,
  0 octet de différence). Note collatérale : une divergence de hauteur de
  label (24px construit vs 25px source, style texte `Titre 5` Montserrat
  SemiBold 20/25 non répliqué initialement) a été détectée ET corrigée
  **avant** cette mesure (cf. `audits/field.md` § Construction) — la mesure
  ci-dessus est donc post-correction, dimensions before/after strictement
  égales (1728×3901 les deux fois).
- **Raison** : écart pré-annoncé et déjà accepté en principe lors de la
  construction d'Input/Select/Textarea (Phase A) ; se matérialise seulement
  maintenant, à la première adoption qui utilise réellement ces atomes.
- **Preuve** : `proofs/field/{verdict.json,verdict.md,crops/Contactez-nous.png}` ;
  `ledger/field.json` (17 entrées, 17 `reportee`, 0 `non-portable`,
  `pages:ledger:check` exit 0)
- **Checkpoint** : `003/field/adoption` (versionId `2379725866106096972`)

**Field (T039-T040) close.** `field` brut ×7 (Contactez-nous) → 0 copie
restante, 7 instances du master `Field`. Zéro copie brute, ledger complet,
preuve pixel acceptée. **Découverte de session, nommée pour les molécules
suivantes** : `resize()` sur une instance **imbriquée** liée par une
propriété `INSTANCE_SWAP` ne fait jamais rien (silencieux, testé ~6
approches) — contournement qui marche : redimensionner l'instance
**top-level** (celle posée directement sur une frame, pas nichée dans une
autre instance) puis donner à l'enfant swappé `layoutSizingVertical: FILL`
pour qu'il s'étire dans la nouvelle taille. Pertinent pour toute future
molécule avec un slot instance-swap dont les options ont des tailles
différentes (aucune connue à ce stade dans les 14 molécules restantes, mais
nommé au cas où). **Prochain : T041 (Master Accordion-row).**

## 2026-07-24 — validation-master — Accordion-row (molécule)

- **Type** : validation-master
- **Composant(s)** : accordion-row
- **Verdict owner** : validé sur capture (4 variants) — go adoption. Décision
  associée : un seul master (pas deux), variant `Taille`.
- **Chiffres** : `DS · Molécules` → `COMPONENT_SET` **Accordion-row**
  (`2059:1417`), 4 variants (`Taille` Grand/Petit × `État` Fermé/Ouvert), 4
  propriétés (`Titre`, `Contenu`, + les 2 variants). Dimensions vérifiées
  exactes vs 4 échantillons source : 1550×64 / 1550×120 / 1550×40 / 1550×80.
  Chevrons = instances `chevron-down`/`chevron-up` (`226:373`/`226:374`),
  locaux, zéro tierce. `figma_analyze_component_set` : zéro erreur.
- **Raison** : trouvaille d'audit — l'inventaire ne nommait qu'un style
  (« ligne FAQ ») mais la mesure par position a trouvé 2 tailles réelles
  (Grand=FAQ 20px, Petit=Texte SEO 14px), 34 lignes au total (10 Grand + 24
  Petit) — compte reconcilié exactement avec l'inventaire initial.
- **Preuve** : `audits/accordion-row.md` ; capture de session (4 variants)
- **Checkpoint** : `003/accordion-row/master` (versionId `2379739404409995287`)

**Accordion-row (T041) fait.** Prochain : T042 (adoption, 34 occurrences/8
pages), puis passage en exécution multi-agent (owner directive, contrainte
de timing) pour le reste de la Phase 7 — voir entrée suivante.

## 2026-07-24 — amendement-orga — tentative multi-agent abandonnée pour T042+

- **Type** : amendement-orga
- **Composant(s)** : programme
- **Verdict owner** : workflow multi-agent (Sonnet 5 séquentiel + vérif Fable 5)
  lancé pour T042 et les molécules suivantes, puis **arrêté par l'owner**
  après constat que la contrainte « un seul opérateur sur le canevas »
  (déjà actée dans tasks.md) élimine le gain de parallélisme réel — le
  premier agent (T042) avait déjà exécuté le remplacement des 34 occurrences
  sur le canevas avant l'arrêt ; repris et terminé en direct plutôt que
  redémarré, après vérification que son travail Figma était structurellement
  correct (34/34 bonnes propriétés, zéro copie restante).
- **Raison** : séquentiel + réexpliquer tout le contexte à chaque agent frais
  coûte plus cher que ça ne rapporte, vu la contrainte. Le reste de la Phase 7
  continue en direct.
- **Preuve** : n/a (décision de processus)
- **Checkpoint** : n/a

## 2026-07-24 — ecart-pixel-accepte — Accordion-row (adoption, T042)

- **Type** : ecart-pixel-accepte
- **Composant(s)** : accordion-row
- **Verdict owner** : accepté après investigation conjointe (owner a
  identifié 2 des 4 causes par inspection visuelle directe des triptyques —
  voir Raison) et validation de l'image finale.
- **Chiffres** : **8/9 `identical`... non — 1/9 `identical` (Accueil, sans
  accordéon), 8/9 `diff`**, mesurés en % de la page (jamais accepté sur un
  compte brut seul) :

  | Page | diffCount | % |
  |---|---|---|
  | Motorisation | 870 | 0.015% |
  | À Propos | 1856 | 0.018% |
  | Portes de garage résidentielles | 3070 | 0.027% |
  | Portes d'entrée | 3218 | 0.029% |
  | Contactez-nous | 2371 | 0.035% |
  | Portes de garage | 2818 | 0.037% |
  | Dépannage/SAV | 3687 | 0.050% |
  | Portes de garage industrielles | 5128 | 0.044% |

  Moyenne globale **0.032%** (~1 pixel sur 3000). Triptyques complets :
  `proofs/accordion-row/crops/`.
- **Raison — 4 causes réelles trouvées et corrigées avant acceptation** (pas
  un écart accepté à l'aveugle) :
  1. **Bordure basse 1px manquante** sur chaque ligne — trouvée par
     comparaison pixel directe avant/après (absente de l'audit initial,
     jamais vérifiée). Noir pur (Grand) / noir-bleuté ~19% opacité (Petit).
     A fait chuter le diff de ~65% à elle seule.
  2. **Hauteur de `Contenu` figée par construction** ne réagissant pas à un
     texte plus long — corrigée sur l'occurrence à réponse longue
     (Portes de garage industrielles).
  3. **Texte riche (gras dans du texte normal) perdu** — les 8 réponses
     Texte SEO ont des mots-clés en gras dans le texte source (probablement
     voulu pour le référencement), ma reconstruction avait tout mis en
     `Regular` uniforme. **Trouvé par l'owner** en inspectant les triptyques
     lui-même (« ça ressemble à du texte gras dans du texte normal »),
     confirmé par lecture directe des pixels puis corrigé (8 occurrences,
     `setRangeFontName` sur les plages exactes).
  4. **Espacement de paragraphe manquant** — la seule réponse à 2
     paragraphes (Portes de garage industrielles) avait un saut de ligne
     entre paragraphes mesuré à 32px contre 23px entre deux lignes d'un même
     paragraphe (soit ~8px d'espacement propre au paragraphe), laissé à 0
     par défaut. **Trouvé par l'owner** (« souci d'espacement texte »),
     vérifié par mesure de pixels précise puis corrigé
     (`paragraphSpacing: 8`) — a fait chuter le diff de cette page de 12403
     à 5128 (-59%), la sortant de son statut de point noir isolé.
  Le résiduel final (0.015%-0.050%, homogène sur les 8 pages) n'a pas de
  cause supplémentaire identifiée malgré investigation — hypothèse la plus
  probable : bruit de rendu sub-pixel inhérent à la reconstruction d'un
  nœud texte neuf face à l'original, concentré exclusivement sur les lignes
  `État=Ouvert` (jamais sur les lignes fermées).
- **Preuve** : `proofs/accordion-row/{verdict.json,verdict.md,crops/}` ;
  `ledger/accordion-row.json` (46 entrées : 34 `Titre` + 12 `Contenu`, 46
  `reportee`, 0 `non-portable`, `pages:ledger:check` exit 0)
- **Checkpoint** : `003/accordion-row/adoption` (pris par l'agent avant
  l'arrêt du workflow — le remplacement des 34 occurrences avait déjà eu
  lieu à ce moment)

**Accordion-row (T041-T042) fait.** `accordion-row`/`item`/`item open` brut
×34 (8 pages) → 0 copie restante, 34 instances du master (10 Grand + 24
Petit). Leçon méthodologique pour la suite : **toujours zoomer sur les
triptyques avant d'accepter un écart** — 2 des 4 vraies causes de cette
adoption n'ont été trouvées qu'en regardant l'image de près, pas en faisant
confiance à un chiffre agrégé ou à une explication plausible non vérifiée.
**Prochain : T043 (Master Tabs/Tab).**

## 2026-07-24 — validation-master + ecart-pixel-accepte — Tab (T043-T044)

- **Type** : validation-master (T043) puis mesure automatique (T044, rien à
  trancher — résultat 9/9 identical)
- **Composant(s)** : tab
- **Verdict owner** : validé après investigation conjointe d'une fausse piste
  (voir Raison) — construit et adopté en une seule session.
- **Chiffres** : `DS · Molécules` → `COMPONENT_SET` **Tab** (`2061:1588`),
  variant `État` (Défaut/Sélectionné — soulignement 2px `color/noir-bleute`
  visible seulement si sélectionné), propriété `Libellé` (texte). 4
  occurrences adoptées (page `Dépannage/SAV`, conteneur `tabs` non gouverné
  — zéro identité visuelle propre, reconstruit tel quel à l'adoption).
  **Preuve pixel : 9/9 `identical`, 0 diff, exit 0** — le premier score
  parfait de la Phase 7 (Field et Accordion-row avaient tous deux un écart
  résiduel accepté).
- **Raison — fausse piste puis vraie cause** : l'audit initial (post-Field/
  Accordion-row, donc déjà attentif aux bordures/gras/espacement) donnait
  des largeurs d'onglet ~10-24% plus étroites que la source (ex. "Porte de
  garage" 166px reconstruit contre 201px source). Hypothèse initiale
  (fausse) : version de police différente. **L'owner a fait remarquer
  que ça n'avait pas de sens vu qu'on est sur la même session Figma** —
  correct : en comparant l'avant/après capturé (pas une image isolée), la
  vraie cause était visible à l'œil nu — l'original est en **MAJUSCULES**
  (`textCase: UPPER`, une transformation d'affichage, pas le texte réel
  saisi en capitales) et ma reconstruction ne l'appliquait pas. Propriété
  texte de plus jamais vérifiée avant cette spec (`textCase` n'était pas
  dans ma grille d'audit). Une fois appliqué : les 4 largeurs collent
  **exactement** (201/181/103/236px, zéro écart) et la preuve pixel passe à
  9/9 identical.
- **Preuve** : `proofs/tabs/{verdict.json,verdict.md}` ; `ledger/tabs.json`
  (5 entrées : 4 `Libellé` + 1 `autre` pour l'état sélectionné, 5
  `reportee`, `pages:ledger:check` exit 0)
- **Checkpoint** : `003/tab/master` (versionId `2379770585322586023`),
  `003/tab/adoption` (versionId `2379761866005362687`)

**Tab (T043-T044) fait — 9/9 identical.** Grille d'audit texte élargie pour
la suite (leçon cumulée cette spec) : toujours vérifier — police/taille,
couleur, `lineHeight`, `letterSpacing`, `paragraphSpacing`, **`textCase`**,
bordures (`strokes`/`strokeXWeight` par côté), avant de construire un
master, jamais après coup. **Prochain : T045 (Master Category-card).**

## 2026-07-24 — amendement-single-master + validation-master + ecart-pixel-accepte — Carte (T045/T046/T051/T052)

- **Type** : amendement d'architecture (fusion de 2 blocs planifiés en 1 master)
  + validation-master + adoption complète (36 occurrences)
- **Composant(s)** : `item` (Category-card ET Reassurance-item — même layer name,
  distingués uniquement par la présence d'un CTA)
- **Verdict owner** : validé, avec 2 corrections d'architecture demandées en cours de
  route (voir Raison) avant construction finale.

### Découverte qui a déclenché l'amendement

Le scan T0 comptait Category-card à ~41 occurrences en "3 formes". Un audit live plus
précis (mesure structurelle complète, pas juste w×h) a montré : (a) le compte réel est
**36**, pas 41 — **26 sans CTA** (correspond exactement au compte attendu de
Reassurance-item, jamais isolé au scan T0) et **10 avec CTA** (vraie Category-card) ;
(b) les deux vivent sous le **même layer name `item`**, avec la **même anatomie de
base**. Présenté à l'owner via `AskUserQuestion` ; l'owner a demandé de réfléchir à un
master unique plutôt que deux, **en pensant à l'intégration future dans le système de
contrats du repo**, et d'aller chercher les contrats legacy comme inspiration — "c'est
une question importante".

### Recherche de précédent — une fausse piste corrigée par l'owner

Premier réflexe : citer `button.contract.json` (**live**, pas legacy) comme preuve que
le mécanisme `tokensByProp` du schéma valide ce pattern. **L'owner a rejeté cette
analyse** ("j'en ai rien à foutre de button contract vu que c'est pas du legacy, ton
analyse est pas bonne") — à raison : Button ne change jamais d'anatomie (mêmes parts,
juste des tokens différents par valeur), ça ne prouve rien pour un master où une part
entière (le Bouton CTA) doit apparaître/disparaître. Recherche élargie sur les 51
contrats legacy (`git show demo-51:contracts/*.contract.json` + grep `visibleWhen`
avec `equals`) : **`pagination.contract.json`** (`variant: pages|compact|dots`, 3
anatomies distinctes sous un seul prop, chacune `visibleWhen` sur une **part entière**
avec ses propres sous-parts) et **`citation.contract.json`** (2 anatomies, même
mécanique) sont le vrai précédent — pas Button. Le pattern retenu :
`disposition: enum[reassurance, categorie]` (VARIANT Figma), Bouton en
`visibleWhen: {prop:"disposition", equals:"categorie"}` + `component: {id:"ds.bouton"}`
(instance réelle, cf. `card.contract.json` → `avatar`), `tokensByProp` pour les
gaps/padding qui diffèrent par valeur.

### "3 variantes" — l'owner avait raison, mais pas pour la raison qu'on pensait

Une fois le master construit (2 variantes propres, `Disposition`: Réassurance/
Catégorie), l'adoption pilote a buté sur un **vrai blocage Figma** : `resize()` (et
`resizeWithoutConstraints()`) sur l'enfant `img` d'une **instance** refuse de
s'appliquer — testé sur 5 configurations, y compris une instance neuve jamais
touchée hors de tout contexte FILL. Première réaction (mauvaise) : contourner en
baquant l'image Catégorie en 2 sous-variantes figées (`Catégorie 2 colonnes` /
`Catégorie 3 colonnes`). **L'owner a immédiatement rejeté cette rustine** ("on fait
pas une variante diff si 2 ou 3 col, ça c'est le soluce dégueu... faut que ce soit
w-auto... réfléchis et reviens") — et avait raison : cette tentative a d'ailleurs
laissé le component set dans un état d'erreur réel côté Figma UI ("The properties and
values of this variant are conflicting"), que mon propre outil d'analyse ne détectait
pas encore à ce moment-là (leçon : ne jamais faire confiance qu'à son propre outil,
vérifier comme l'humain le ferait).
**Vraie solution, trouvée après avoir nettoyé et réfléchi** : `img.layoutSizingVertical
= 'FILL'` (l'image absorbe l'espace restant dans la carte, calculé automatiquement)
combiné à un `resize()` sur **l'instance de haut niveau** (ça, contrairement au geste
sur un enfant imbriqué, fonctionne — confirmé sur 2 largeurs réelles, 474→266 et
743→418, calculées automatiquement sans aucun override manuel sur l'image). Résultat :
**2 variantes seulement**, aucune rustine, s'adapte à n'importe quelle hauteur de texte
réelle par occurrence — la bonne architecture, pas un compromis.

### 4 vrais bugs trouvés en comparant le pilote avant/après (pas en survolant)

Après avoir corrigé les dimensions, le diff pixel du pilote (2 maquettes : Accueil,
Motorisation) restait substantiel. Comparaison stricte crop avant/après/diff (jamais
une image isolée, leçon Tab) plus deux questions directes de l'owner ("un souci de
texte centré aussi ?", "et le gras ? check s'il y a des parties pas correctes") ont
trouvé, dans l'ordre :
1. **Ombre portée manquante** (`DROP_SHADOW radius:10, rgba(0,0,0,.2), offset (0,5)`)
   — jamais vérifié `effects`, seulement `fills`/`strokes` (grille d'audit incomplète,
   corrigée).
2. **Icônes du bouton par défaut au lieu des vraies** — `Icône gauche/droite`
   (booléen de visibilité) réglé correctement, mais `Glyphe gauche/droite`
   (INSTANCE_SWAP, quel glyphe afficher) jamais réappliqué → flèches génériques
   affichées au lieu de pdf/download mesurés dès le début de l'investigation puis
   oubliés à la construction.
3. **Gras aplati par l'override de texte** — `instance.setProperties()` sur une
   propriété TEXT remplace tout le texte par un style **uniforme** (a pris le style du
   1er caractère), perdant le span Bold sur la 1re phrase. Trouvé par l'owner
   ("check le gras"), confirmé par lecture directe des `fontName` par plage, corrigé
   (`setRangeFontName` réappliqué après chaque override de texte contenant un gras).
4. **Alignement centré manquant sur Réassurance** — jamais réglé, resté au défaut
   Figma `LEFT` alors que la source centre le titre et le texte. Trouvé par l'owner
   ("un souci de texte centré aussi ?"), confirmé par lecture directe de
   `textAlignHorizontal` (source `CENTER`, le mien `LEFT`), corrigé sur le master et
   l'instance pilote.
Après les 4 corrections, checklist texte complète re-vérifiée (fontName, size,
lineHeight, letterSpacing, paragraphSpacing, textCase, textDecoration, align H/V,
hangingPunctuation/List, fills) — **zéro écart restant trouvé**, visuellement
identique au zoom. Résidu final : Accueil 0,055% (5199/9 383 040px), Motorisation
0,088% (5046/5 761 506px) — même ordre de grandeur que le résidu accepté sur
Accordion-row (0,015-0,050%), même cause probable (bruit de rasterisation d'un texte
neuf face à l'original). **Owner a validé après inspection directe des crops
(Finder) : "top".**

### Limite de preuve — 7 maquettes sans "before" (documentée, pas cachée)

Après validation du pilote, l'adoption des 34 occurrences restantes a été faite en
lots (batch) sans capturer d'abord un "before" complet des 9 maquettes — seulement
Accueil et Motorisation (le pilote) ont une preuve pixel avant/après complète.
**Aucun rollback programmatique n'existe** (documenté dans `page-parity/README.md`) —
restaurer pour recapturer aurait jeté le travail déjà fait. Présenté explicitement à
l'owner via `AskUserQuestion` ; **option retenue : vérification structurelle +
visuelle sur les 7 maquettes restantes** (`analyze_component_set` 0 erreur,
dimensions/contenu conformes au ledger pour les 36 occurrences, captures spot-check
sur 3 maquettes représentatives — À Propos, Dépannage/SAV incluant le cas particulier
`glyphDroite` non-standard, Portes de garage résidentielles avec les 2 dispositions
sur la même page — toutes visuellement correctes), **documentée comme limite plutôt
que cachée**. Pas de preuve pixel formelle `page-parity` sur ces 7 pages — à refaire
si un doute apparaît plus tard.

- **Chiffres** : `DS · Molécules` → `COMPONENT_SET` **Carte** (`2063:1622`), variant
  `Disposition` (Réassurance/Catégorie), propriétés `Titre`/`Texte` (TEXTE). 36
  occurrences adoptées (26 Réassurance + 10 Catégorie), 0 copie brute restante,
  0 erreur `analyze_component_set`.
- **Preuve** : `proofs/carte/{verdict.json,verdict.md,crops/}` (2 maquettes pilotes
  complètes) ; `ledger/carte.json` (138 entrées : 36×Titre + 36×Texte + 36×image +
  10×3 champs Bouton, 138 `reportee`, 0 `non-portable`, `pages:ledger:check` exit 0)
- **Checkpoint** : `003/carte/master`, `003/carte/adoption-pilot`,
  `003/carte/adoption-categorie-batch`, `003/carte/adoption-reassurance-batch1`,
  `003/carte/adoption-reassurance-batch2`

**Carte (T045/T046/T051/T052) fait.** `item` brut ×36 (26 Réassurance + 10 Catégorie,
8 maquettes) → 0 copie restante. Leçons cumulées pour la suite : (1) ne jamais citer
un contrat live comme précédent pour un pattern structurel — chercher le vrai
précédent dans le legacy, quitte à élargir la recherche (grep sur les 51, pas juste 1
fichier) ; (2) `resize()` sur un enfant imbriqué d'instance peut être bloqué même hors
tout contexte FILL — `layoutSizingVertical/Horizontal = FILL` + resize de l'instance
de haut niveau est le contournement robuste ; (3) `setProperties()` sur une prop TEXT
aplatit les styles mixtes (gras) — toujours réappliquer après ; (4) grille d'audit
texte élargie encore une fois : `effects` (ombres) n'y était pas, `textAlignHorizontal`
non plus, malgré 3 molécules précédentes de leçons accumulées — la grille n'est
probablement toujours pas complète.

## 2026-07-24 — validation-master + adoption complète — Product-card (T047-T048)

- **Type** : validation-master puis adoption (8 occurrences, 2 maquettes)
- **Composant(s)** : `Thumbnail produit`
- **Verdict owner** : owner a directement orienté vers le pixel-diff avant même de
  voir le résultat ("tu peux déjà pixel diff pck y'a des soucis") — investigation
  guidée par cette alerte, pas par ma propre relecture.
- **Chiffres** : `DS · Molécules` → `COMPONENT` **Product-card** (`2068:1972`, pas de
  variante — structure 100% identique sur les 8 occurrences). Propriétés `Titre`,
  `Prix` (TEXTE). 8 occurrences adoptées (4 `Motorisation` + 4 `Accueil`).

### Découverte — le vrai bug était bien plus gros que ce que je chassais

Première reconstruction (bouton "Ajouter au panier" visible, aligné, bien positionné) :
diff pixel énorme (37921px sur une seule occurrence). Deux vrais bugs trouvés et
corrigés en creusant (dans l'ordre) :
1. **Image et Bouton collés à gauche au lieu de centrés** — `layoutAlign = 'CENTER'`
   posé sur les enfants individuellement ne prenait pas (repassait à `INHERIT`) ; la
   vraie propriété à régler est `counterAxisAlignItems: 'CENTER'` sur le **parent**.
2. **26px d'écart avant le bouton au lieu de 16px uniforme** — corrigé via 3
   espaceurs explicites (`itemSpacing: 0` + cadres vides 16/16/26px), après avoir
   d'abord mal calculé un espaceur unique (qui ajoute SES DEUX gaps `itemSpacing`
   autour de lui : 16+10+16=42, pas les 26 voulus).

Diff toujours élevé après ces deux corrections (13538px, inchangé). Un crop **large**
(pas juste autour du bouton) de la vraie page capturée a montré : **rien ne s'affiche
sous le prix, aucune trace du bouton**. Vérification directe de la propriété
`.visible` du nœud `Bouton` (jamais checkée jusqu'ici, absente de toute grille
d'audit des 4 molécules précédentes) : **`false`**, confirmé sur **7 des 8
occurrences**. Le CTA e-commerce existe dans l'arbre (propriétés bien formées) mais
n'a **jamais été rendu visible** sur aucune maquette — probablement une
infrastructure préparée puis désactivée. Les deux corrections d'alignement/espacement
étaient réelles mais **hors-sujet** : elles amélioraient la position d'un élément qui
ne devait pas être visible du tout. Une fois `Bouton.visible = false` réglé sur le
master (et les espaceurs devenus inutiles retirés — `240+16+20+16+20=312` correspond
exactement au hug naturel sans le bouton) : diff tombé à **11px** (pilote) puis
**98px** sur les 4 occurrences complètes de `Motorisation` — bruit de rasterisation
texte habituel, rien de structurel.

- **Preuve** : `proofs/product-card/{verdict.json,verdict.md,crops/}` (preuve
  complète sur `Motorisation`, 4/4 occurrences, before/after réel — 98px résiduel,
  98/(1728×3334)=0,0017%) ; `Accueil` (4/4) vérifié structurellement (dimensions,
  `visible:false` conforme) + visuellement (spot-check), même limite de preuve que
  Carte (batch sans before pré-capturé), documentée pas cachée.
- **Ledger** : `ledger/product-card.json` (24 entrées : 8×Titre + 8×Prix + 8×image,
  24 `reportee`, 0 `non-portable`, `pages:ledger:check` exit 0)
- **Checkpoint** : `003/product-card/master`, `003/product-card/adoption-pilot`,
  `003/product-card/adoption-batch`

**Product-card (T047-T048) fait.** `Thumbnail produit` brut ×8 → 0 copie restante.
Leçon ajoutée à la grille d'audit (5e fois qu'elle s'élargit cette spec) : **`.visible`
sur les parts optionnelles/CTA, jamais supposé depuis la présence dans l'arbre de
layers** — un nœud bien formé structurellement peut être totalement invisible dans le
rendu réel, et seul un crop **large** de la vraie page (pas un crop serré autour de
ce qu'on pense être le problème) le révèle. Recherche legacy déléguée à un agent en
arrière-plan pendant cet audit (7 molécules à venir : Product-card confirmé card+badge
comme précédent partiel, zéro précédent legacy pour l'image produit elle-même — gap
nommé, pas comblé).

## 2026-07-24 — validation-master + adoption complète — Member-card (T049-T050)

- **Type** : validation-master puis adoption (16 occurrences, 1 seule maquette)
- **Composant(s)** : `member`
- **Verdict owner** : "Go" direct sur l'audit livré (photo déjà gouvernée, contenu
  cohérent) — pas d'itération de correction cette fois.
- **Chiffres** : `DS · Molécules` → `COMPONENT` **Member-card** (`2074:2072`, pas de
  variante). Propriétés `Nom`, `Poste` (TEXTE). 16 occurrences adoptées (grille
  « Équipe », page `À Propos`, seule maquette concernée).
- **Trouvaille** : `member-picture` est un **composant déjà gouverné** dans le fichier
  (2 variantes Default/hover) — réutilisé tel quel comme instance imbriquée, comme le
  Bouton pour Carte/Product-card. Calque `fun-ia` (essai IA abandonné, empilé sous la
  vraie photo, invisible au rendu) repéré et laissé tel quel — hérité automatiquement
  en instanciant le composant existant, aucune action requise. 3 occurrences sur 16
  sont des placeholders `Prénom`/`Poste` (vrai trou de contenu source), reproduits
  fidèlement.
- **Premier master sans écart réel à corriger après le pilote** — grille d'audit
  (centrage `counterAxisAlignItems` posé d'emblée sur le parent, pas par enfant ;
  `.visible` vérifié dès l'audit initial) appliquée dès la construction, pas découverte
  après coup. Résidu pilote 299px, résidu final 4163px sur 16/16 occurrences
  (0,041% de la page) — bruit habituel, homogène, aucune occurrence anormale
  (vérifié visuellement sur la grille complète).
- **Preuve** : `proofs/member-card/{verdict.json,verdict.md,crops/}` — **preuve pixel
  complète, pas de limite à documenter** (une seule maquette concernée, toutes ses
  occurrences dans le même before/after).
- **Ledger** : `ledger/member-card.json` (48 entrées : 16×Nom + 16×Poste + 16×image,
  48 `reportee`, 0 `non-portable`, `pages:ledger:check` exit 0)
- **Checkpoint** : `003/member-card/master`, `003/member-card/adoption-pilot`,
  `003/member-card/adoption-batch`

**Member-card (T049-T050) fait.** `member` brut ×16 → 0 copie restante.

## 2026-07-24 — validation-master + adoption complète — Carousel-controls (T055-T056)

- **Type** : validation-master puis adoption (2 occurrences, 2 maquettes)
- **Composant(s)** : `Controls`
- **Verdict owner** : "Go" direct.
- **Chiffres** : `DS · Molécules` → `COMPONENT` **Carousel-controls** (`2077:2191`,
  `HORIZONTAL`, `primaryAxisAlignItems: SPACE_BETWEEN`, largeur FILL). 2 instances
  réelles du master Bouton existant (`Property 1=Outilne noir`, `28:114` — piège
  d'id noté : confondu une fois avec `Outline blanc` `6:135`, corrigé avant tout
  dégât). 2 occurrences adoptées (`Motorisation`, `Accueil`).
- **`.visible` trouvé dès l'audit, pas après un gros diff** — leçon Product-card
  appliquée immédiatement : le texte `Contactez-nous` de chaque bouton est
  `visible: false` dans la source, repéré avant construction.

### Piège Figma majeur — l'origine d'un GROUP n'est pas stable

Repositionner l'instance `Controls` (enfant du `GROUP` « Carrousel produits ») a fait
**glisser les 4 cartes Product-card voisines de 22px**, sans qu'elles soient
touchées — l'origine interne d'un `GROUP` se recalcule dynamiquement contre son
contenu, donc modifier un enfant peut déplacer visuellement tous les autres.
Plusieurs cycles de correction itérative (mesurer l'erreur, corriger, remesurer) ont
**oscillé sans converger** — signe qu'il ne s'agissait pas d'un simple problème de
cible mouvante mais d'une contrainte plus profonde. Cause réelle trouvée en
vérifiant `layoutMode` du frame parent des cartes (`Produits`) : **auto-layout
HORIZONTAL, gap 32** — ses enfants ne se positionnent jamais individuellement, un
`.x`/`.y` direct dessus est silencieusement ignoré (même famille que le piège
`resize()` sur enfant d'instance, mais pour la position d'un enfant d'auto-layout).
Fix correct : corriger la position du frame `Produits` **lui-même** (un seul nœud),
les 4 cartes se replacent automatiquement via leur propre flux — pas de correction
par carte.

**Règle généralisable ajoutée** : avant de repositionner un nœud dans un `GROUP`,
vérifier (a) tous ses siblings pour un effet de bord sur l'origine du groupe, et (b)
le `layoutMode` de tout parent avant d'assumer qu'un `.x`/`.y` direct fonctionnera.

- **Preuve** : `proofs/carousel-controls/verdict.{json,md}` — **byte-exact sur
  Motorisation** (`1/1 identical, 0 diff`, sha256 identique à l'avant, exit 0) — le
  meilleur résultat de la spec à ce jour, zéro texte rendu (libellé caché) donc zéro
  source de bruit sub-pixel possible. `Accueil` vérifié visuellement, même limite
  documentée que Carte/Product-card.
- **Ledger** : `ledger/carousel-controls.json` — **vide explicite** (`entrees: []`,
  `pages:ledger:check` exit 0) : les 2 occurrences sont identiques au master par
  défaut, aucune personnalisation à reporter.
- **Checkpoint** : `003/carousel-controls/master`, `003/carousel-controls/adoption`

**Carousel-controls (T055-T056) fait.** `Controls` brut ×2 → 0 copie restante,
premier résultat byte-exact de la spec.

## 2026-07-24 — validation-master + adoption complète (autonome) — Footer-column (T057-T058)

- **Type** : validation-master puis adoption (27 occurrences, les 9 maquettes) —
  exécuté en autonomie ("Go tu peux finir les molécules et me prévenir après"),
  Review-card et Gallery-item restant explicitement exclus de cette autonomie.
- **Composant(s)** : `Col N` (Col 2 Adresse / Col 3 Horaires / Col 4 Contact — Col 1
  logo/bouton et Col 5 réseaux sociaux hors périmètre, tranché au scan T0)
- **Chiffres** : `DS · Molécules` → `COMPONENT` **Footer-column** (`2079:2246`, pas
  de variante). Propriétés `Titre`, `Texte` (TEXTE, largeur FIXED 310 — pas FILL,
  voir piège ci-dessous). 27 occurrences adoptées (3 par page × 9 pages), contenu
  identique sur les 9 pages (vérifié avant remplacement, pas supposé).

### 3 pièges trouvés en comparant le pilote (`Contactez-nous`) avant/après

1. **`FILL` vs `FIXED` change le point de wrap à largeur égale** — un texte réglé en
   `layoutSizingHorizontal: FILL` et un texte en `FIXED`, tous deux mesurés à
   exactement 310px de large, **ne cassent pas au même endroit**. Trouvé en
   comparant les hauteurs réelles (Horaires : 54px reconstruit contre 127px source,
   soit 2 lignes contre 3 attendues). Fix : toujours `FIXED` + `resize()` explicite
   pour du texte à largeur contrainte, jamais `FILL` même quand la largeur finale
   semble identique.
2. **Sauts de ligne manuels invisibles à `JSON.stringify`** — deux colonnes/trois
   ont un caractère **`U+2028`** (line separator) entre des mots, que
   `JSON.stringify` affiche comme un espace ordinaire (ex. "vendredi␣␣de" ressemble
   à un double-espace, c'est en réalité "vendredi" + espace + `U+2028` + "de").
   Repéré uniquement en lisant `charCodeAt()` caractère par caractère. Pour
   `Contact`, le vrai saut est **`\r` suivi de `U+2028`** — les deux ensemble, une
   première correction avec `\r` seul n'a pas suffi (le wrap restait faux).
3. **Soulignement partiel perdu par `setProperties()`** — même trap que le gras de
   Carte : `Adresse` = souligné en entier, `Horaires` = pas de soulignement,
   `Contact` = seuls le téléphone et l'email soulignés (pas les labels). Réappliqué
   par plage exacte (`setRangeTextDecoration`) après chaque override de contenu.

**Piège récurrent (Carousel-controls) anticipé, pas re-découvert** : `Col N` vit
dans un `GROUP` « Row » avec Col 1/Col 5 en siblings — la technique lecture-tout/
écriture-tout-en-une-passe a été appliquée **dès la construction du pilote**, avec
succès immédiat (`maxErr: 0`, 1 passe, sur les 9 pages) — la leçon de la molécule
précédente a évité de perdre du temps à re-découvrir le même problème.

- **Preuve** : `proofs/footer-column/{verdict.json,verdict.md,crops/}` — pilote
  `Contactez-nous` : résidu final 1524px/(1728×3901)=0,023% après les 3 corrections
  (bruit habituel). 8 pages restantes : positions vérifiées convergées exactement
  (`maxErr: 0`, pas juste proche), contenu vérifié identique aux 3 recettes avant
  remplacement, spot-check visuel sur `Motorisation` (groupe `Footer` complet) —
  pas de preuve pixel avant/après formelle sur ces 8, même limite documentée que
  Carte/Product-card.
- **Ledger** : `ledger/footer-column.json` (54 entrées : 27×Titre + 27×Texte, 54
  `reportee`, 0 `non-portable`, `pages:ledger:check` exit 0)
- **Checkpoint** : `003/footer-column/master`, `003/footer-column/adoption-pilot`,
  `003/footer-column/adoption-batch`

**Footer-column (T057-T058) fait.** `Col N` brut ×27 → 0 copie restante.

## 2026-07-24 — validation-master + adoption complète (autonome) — Copyright (T059-T060)

- **Type** : validation-master puis adoption (9 occurrences, les 9 maquettes)
- **Composant(s)** : `Copyright` (sibling de `Row`/Footer-column dans `Footer`)
- **Chiffres** : `DS · Molécules` → `COMPONENT` **Copyright** (`2086:2330`, pas de
  variante). Propriété `Texte` (TEXTE). 9 occurrences adoptées, contenu identique
  sur les 9 pages.
- **Recherche legacy** : aucun bon précédent dans les 51 contrats — l'agent l'a dit
  franchement plutôt que d'étirer une analogie (`breadcrumb-item` le plus proche,
  non pertinent). Confirmé à l'audit : molécule plus simple que prévu, une seule
  chaîne plate, pas de liens réellement interactifs.
- **Détail trouvé par lecture caractère par caractère** (leçon Footer-column
  appliquée immédiatement) : espace **insécable `U+00A0`** entre « © » et « 2025 »,
  pas un espace ordinaire.
- **Piège GROUP anticipé, pas re-découvert** : `Copyright` est sibling de
  `Background`/`Separator`/`Row` dans le `GROUP` « Footer » — technique
  lecture-tout/écriture-tout appliquée dès le pilote, `maxErr: 0` en 1 passe sur
  les 9 pages.
- **Preuve** : `proofs/copyright/{verdict.json,verdict.md,crops/}` — pilote
  `Motorisation` : résidu 1680px/(1728×3334)=0,029%, bruit habituel. 8 pages
  restantes : positions convergées exactement, contenu vérifié identique — pas de
  preuve pixel avant/après formelle sur ces 8, même limite documentée.
- **Ledger** : `ledger/copyright.json` (9 entrées, `pages:ledger:check` exit 0)
- **Checkpoint** : `003/copyright/master`, `003/copyright/adoption-pilot`,
  `003/copyright/adoption-batch`

**Copyright (T059-T060) fait.** `Copyright` brut ×9 → 0 copie restante.

## 2026-07-24 — validation-master + adoption complète (autonome) — Contact-info-row (T061-T062)

- **Type** : validation-master puis adoption (4 occurrences, 1 maquette)
- **Composant(s)** : `features` (bloc `Contactez-nous`, `Frame 6/7/8/9`)
- **Découverte — le nom de tâche est trompeur** : malgré « Contact-info-row »,
  le contenu réel n'est pas des coordonnées (ça, c'est Footer-column) mais un
  **argument de vente** (icône marque + titre + texte), même famille que
  Réassurance-item : « Conseils personnalisés / Devis gratuits... », « Produits de
  qualité / Marque Hormann... », etc. Le **compte** de l'inventaire (×4, bloc
  `features` sur Contactez-nous) restait exact — seule la nature du contenu supposée
  était fausse. Master nommé **`Avantage`** en conséquence. La dépendance supposée
  aux icônes sociales (T037) était également fausse : l'icône utilisée est la marque
  `piqueray` (set `Icones`), répétée à l'identique sur les 4 — zéro dépendance
  réelle, `tasks.md` corrigé en conséquence.
- **Chiffres** : `DS · Molécules` → `COMPONENT` **Avantage** (`2088:2350`, pas de
  variante). Propriétés `Titre`, `Texte` (TEXTE). 4 occurrences adoptées.
- **Piège trouvé** : l'icône `piqueray` a une taille native **32×32** — toutes les
  occurrences source l'utilisent à **64×64** (resize manuel côté design). Une
  instance fraîche (`createInstance()`) reprend la taille native par défaut, jamais
  la taille d'usage réel — toujours vérifier/mesurer la taille effective d'une
  instance existante avant de considérer une instance neuve "prête à l'emploi".
- **Texte riche — gras multi-segments, pattern différent par occurrence** (pas une
  règle générale comme "1re phrase en gras") : 3 segments dispersés sur la 1re
  occurrence, 1 seul mot sur la 2e, fin de phrase sur la 3e, milieu de phrase sur
  la 4e. Capturé et réappliqué par plage exacte, occurrence par occurrence.
- **Preuve** : `proofs/contact-info-row/{verdict.json,verdict.md,crops/}` — preuve
  pixel **complète sur les 4/4** (seule maquette concernée) : résidu
  4014px/(1728×3901)=0,059%, bruit habituel, vérifié au crop (icônes, titres, gras
  multi-segments tous visuellement identiques).
- **Ledger** : `ledger/contact-info-row.json` (8 entrées, `pages:ledger:check` exit 0)
- **Checkpoint** : `003/contact-info-row/master`, `003/contact-info-row/adoption`

**Contact-info-row (T061-T062) fait** (master réel : `Avantage`). `Frame 6-9` brut
×4 → 0 copie restante. **Prochain : T063 (Master Section-header)** — Review-card
(T053-54) et Gallery-item (T065-66) restent différés pour implication directe de
l'owner (blocs inférés/incertains).
