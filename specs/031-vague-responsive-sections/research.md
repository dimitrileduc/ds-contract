# Research — Vague responsive des sections (031)

**Date** : 2026-08-27 · **Worktree** : `just-euphonium` · **Fichier Figma** :
`Piqueray (Copy)` / `d9FYAUcqdcNtsuaMgLefvJ`

Reçu docs-first (§IX) : lus AVANT toute dérivation —
`.specify/memory/constitution.md` (I–XII, Quality Gates, F1) ·
`docs/internal/component-repair-workflow.md` (§Ordre obligatoire l. 26-59,
§Transition additive l. 291-352, §Adaptation dans un set existant l. 353-398,
§Outillage de vague l. 418-612, §Frontière actuelle l. 613-627) ·
`docs/FIGMA-CAPABILITY-MATRIX.md` (l. 420-444, ligne `@media`/`@container`
CARRY-CODE-ONLY) · `specs/029-…/RETRO-PROCESS.md` (intégral) ·
`specs/030-…/{spec,quickstart,data-model,contracts/*}` ·
`specs/030-…/inventory/fiche-decisions-vague.md` (D1–D9, signée).
Aucune phrase « ce n'est pas possible » n'est écrite ci-dessous sans sa lecture
de doc **et** sa vérification dans le code.

---

## R1 — La topologie réelle des 13 cibles : 11 composants seuls, 1 set, 1 renommage

**Décision** : la vague n'est pas homogène. Elle se décompose en **trois classes
d'opération**, et cette classification commande l'ordre d'exécution.

Relevé sur `parity/snapshots/figma-components.json` (cliché du 2026-08-26 19:17 UTC,
posé à la clôture de 029) :

| Cible | Nœud | Axes actuels | Classe |
|---|---|---|---|
| Devis | `2096:2524` | aucun | **additive** |
| Formulaire | `2096:2564` | aucun | **additive** |
| Presentation | `2103:2824` | aucun | **additive** |
| Coordonnees | `2104:2904` | aucun | **additive** |
| FAQ | `2104:2914` | aucun | **additive** |
| SAV | `2108:3105` | aucun | **additive** |
| TexteSEO | `2108:3123` | aucun | **additive** |
| Hero | `2111:3382` | aucun | **additive** |
| Equipe | `2115:3947` | aucun | **additive** |
| ProduitsECommerce | `2116:4475` | aucun | **additive** |
| Section Avis Google | `2545:5685` | aucun | **additive** |
| **Reassurances** | `2114:3721` | `Disposition{4 cartes, QuatreCartesDeuxCta, 5 cartes}` | **existing** |
| **HeroVideo** | `2580:7392` | `Presentation{Wide, Compact, Desktop}` | **renommage** |

**Conséquence chiffrée** : 11 × 2 membres créés (Desktop, Mobile ; l'historique
devient `Presentation=Wide`, défaut) = 22, plus Reassurances qui passe de 3 à
**9 membres** (matrice `Presentation{3} × Disposition{3}`, 6 créés) = **28
membres créés** sur la vague, zéro membre supprimé, zéro identité changée.

**Rationale** : le manifeste déclare `setIdentityPolicy: "additive" | "existing"`
et les deux branches ont des évals distinctes
(`figma-responsive-component-set-declared-creates` vs
`figma-responsive-existing-set-topology`). Les confondre produirait un manifeste
refusé — ou pire, accepté sur la mauvaise branche.

**Alternatives écartées** : traiter les 12 comme une classe unique (faux, refus
de validation garanti sur Reassurances) ; découvrir la classe à l'audit section
par section (le fait est déjà relevé, le re-dériver 12 fois est exactement le
gaspillage que §IX interdit).

---

## R2 — Le pilote est **Reassurances**, et il l'est par contrainte, pas par choix

**Décision** : la section pilote de FR-009 est **Reassurances**. Un second
pilote — la première section de classe `additive` — précède l'ouverture du lot
des 10 restantes.

**Rationale** : FR-009 exige que la première section traitée exerce en conditions
réelles « créations déclarées dans un set existant ». R1 montre que
**Reassurances est le seul set existant du périmètre**. Le choix est donc forcé.
Cette branche a été construite par 029 (`ec311497`) et **jamais exécutée en vif**
(run-002 l'a court-circuitée en gestes manuels, `RAPPORT-CLOTURE` §4.2) : c'est
la capacité la moins éprouvée de la chaîne et elle doit tomber en premier si elle
doit tomber.

Le second pilote n'est pas dans FR-009 mais le mérite : 11 des 12 sections
roulent sur la branche `additive`, dont le seul précédent vif est HeroVideo/028
— **avant** le mode `light`, le driver et le preflight verrous de 030. Ouvrir un
lot de 10 écritures parallèles sur une chaîne dont la combinaison
`additive + light + driver` n'a jamais tourné en vif, c'est reproduire le pari
que la rétro reproche à 029. Coût : ~20 min ; couverture : 10 sections.

**Alternatives écartées** : pilote = une section additive (viole FR-009 à la
lettre) ; pilote unique (laisse 10 sections derrière une combinaison non
éprouvée) ; les deux pilotes en parallèle (un pilote qui doit pouvoir ARRÊTER la
vague ne se parallélise pas avec ce qu'il protège).

---

## R3 — Le renommage `Compact` → `Mobile` n'a **aucun chemin runner**

**Décision** : la campagne 13 entre dans la vague avec un **blocage nommé
d'avance** et une décision owner à prendre en séance : geste bridge manuel
gouverné (précédent run-002) **ou** statut « reportée » FR-018.

**Preuve, en trois sources** :

1. **Doc** — `docs/internal/component-repair-workflow.md` décrit deux branches du
   mécanisme `responsive-component-set` : créer un set (`additive`) et créer des
   membres dans un set formé (`existing`). Aucune ne renomme un membre existant.
   L. 224, un membre « ajouté, retiré ou **renommé** » est un motif de **refus**
   du preflight (dérive de source), pas une opération déclarable.
2. **Code** — `extract/figma/projection-repair/bridge-script.ts` : la branche
   `additive` renomme l'historique (l. 576) ; la branche `existing` ne nomme que
   les **clones** (l. 593) ; puis l. 608 compare l'ensemble des noms observés à
   `expectedMemberNames` et lève `Responsive component-set topology drift` sur
   toute divergence. Un renommage déclaré de `Compact` en `Mobile` ne peut donc
   ni être exécuté, ni passer la porte.
3. **Art antérieur** — 029 run-002 a fait ses renommages **par gestes bridge
   manuels**, avec deux versions Figma épinglées comme filet, et
   `manual-gesture-receipt.json` liste les 6 garanties perdues.

**Piste vérifiée puis écartée** :
`docs/FIGMA-CAPABILITY-MATRIX.md` l. 444 documente qu'**un set PEUT gagner un axe
par rename+merge à l'amend** — mais c'est le chemin `core/emit-figma-script.ts`
(contrat → canevas), pas le runner de réparation. L'emprunter signifierait
régénérer HeroVideo depuis son contrat ; or D1/FR-013 interdisent d'y promouvoir
`Presentation`, donc la régénération **retirerait** l'axe. Chemin fermé pour une
raison de gouvernance, pas de capacité.

**Conséquence de plan** : FR-015 (runner inchangé) rend l'extension impossible
pendant la vague. La décision appartient à l'owner ; la vague se clôture dans les
deux cas (FR-018). Le refus de trancher d'avance est délibéré : c'est un arbitrage
gouvernance, pas une inconnue technique.

---

## R4 — Le cliché de parité est **frais**, contrairement à l'hypothèse de la spec

**Décision** : le prérequis « rafraîchir `parity/snapshots/figma-components.json` »
est **vérifié au kick-off par comparaison**, pas exécuté par réflexe.

**Rationale** : la spec (Assumptions) et `CLAUDE.md` portent une limite ouverte
depuis 017 : « le cliché n'a pas été rafraîchi, `npm run parity` compare à un
canevas périmé ». Mesure : `extractedAt` = **2026-08-26T19:17:16Z**, commit
`7d03a860` (clôture 029), et le cliché **contient déjà**
`CategoriesPrincipales.Presentation{Wide, Mobile, Desktop}` — l'état posé par
run-002 le soir même. 030 n'a muté aucun canevas depuis. Le cliché est donc
frais jusqu'à preuve du contraire, et la limite héritée de 017 a été refermée
par 029 sans que la prose le dise.

**Ce que fait le plan** : G0 relève le cliché vif et le compare à l'existant ;
identiques ⇒ prérequis coché avec sa preuve ; divergents ⇒ refresh commité avant
la première mutation. Dans les deux cas la vague repart d'un fait mesuré. Le
refresh de fin de vague (après les 28 créations) reste obligatoire.

**Alternative écartée** : rafraîchir sans mesurer — on aurait « corrigé » un
non-problème et perdu la trace du fait que 029 avait déjà refermé la limite.

---

## R5 — Le partage de parent est le **vrai** critère de zone §XI, pas le master

**Décision** : la zone d'écriture d'un writer est le **nœud parent qui héberge
les masters**, pas le master lui-même. La partition est calculée à G0, sur relevé,
avant d'attribuer les writers.

**Rationale** : dans la branche `additive`, `figma.combineAsVariants(members, host)`
**modifie le parent** — et le runner l'exige explicitement : l'id du parent doit
être dans `writeBoundary.allowedExistingNodeIds` **et** dans `changedNodeIds`,
sinon `responsive-operation-not-allowlisted` (workflow doc l. 318-322 ; vérifié
sur `hero-video/run-003/campaign.json` : `allowedExistingNodeIds` =
`["2151:5552" (membre historique), "2448:4731" (parent)]`).

Si les 11 masters additifs partagent une frame de catalogue, **onze campagnes
déclarent le même nœud comme modifié** : deux writers concurrents violeraient
§XI (« no two agents ever touch the same node ») en toute conformité de
manifeste. Les node ids observés (`2096:…` → `2116:…`) sont compatibles avec un
catalogue commun — **compatibles, pas concluants** : aucun artefact committé ne
porte le parent des sections.

**Ce que fait le plan** : G0 relève le parent de chacun des 13 masters
(read-only) et en dérive la partition. Trois cas, tous prévus :
- parents distincts ⇒ 3 writers, partition par master ;
- parent unique ⇒ les **créations de set** se sérialisent (un writer à la fois
  sur ce parent) ; le reste de la chaîne de chaque campagne (captures, dry-run,
  scénarios, verify) reste parallèle ;
- cas mixte ⇒ un writer par groupe de parent.

Le coût du pire cas est annoncé, pas découvert : la sérialisation des seules
étapes `bridge-first`/`bridge-second` sur un parent partagé, pas de la vague.

**Alternative écartée** : partitionner par master sans relever les parents —
c'est le pari qui produit une corruption silencieuse, la classe de panne que §XI
existe pour interdire.

---

## R6 — Où s'arrête la préparation : `--until dry-run`, avant la séance owner

**Décision** : la phase de préparation exécute, pour les 13 campagnes,
`audit → preflight → capture-before → dry-run` **avant** la séance owner ; la
suite de la chaîne s'exécute après, par `--resume`.

**Rationale** : trois textes se croisent ici, et il fallait les lire pour ne pas
choisir au hasard.
- L'ordre obligatoire du workflow (l. 26-45) place « GO owner » **avant**
  `source snapshot` et `preflight`.
- La constitution §X impose la capture-avant de **toutes** les cibles avant
  **toute** mutation — et FR-007 le redit : « pour toutes les cibles concernées
  et non pour un sous-ensemble pilote ». Le pilote appliquant immédiatement après
  la séance, les 13 captures doivent être acquises **avant** la séance.
- 030 tranche déjà le conflit en nommant l'usage : `--until dry-run` est
  documenté « pour la préparation de vague »
  (`contracts/cli-commands.md` §3).

Le GO owner garde son sens : il garde les **écritures**. `audit`, `preflight` et
`capture-before` sont read-only (le CLI n'a aucune autorité d'écriture Figma,
workflow doc l. 4-5) ; `dry-run` n'écrit pas. Aucune garantie n'est levée, et
l'ordre relatif capture-avant → mutation est préservé.

**Bénéfice de plan, tiré de la rétro** : le preflight verrous tourne **avant** la
séance, donc tout verrou hérité (classe 744 px, 33 min perdues en 029) est sur la
planche comme dérogation à trancher, au lieu d'être découvert à la pose.

**Alternative écartée** : suivre l'ordre littéral (GO puis preflight) — la
séance owner porterait alors sur des planches dont les verrous ne sont pas
connus, et §X/FR-007 serait violé au premier apply du pilote.

---

## R7 — Zéro code de dépôt : la vague consomme, elle n'outille pas

**Décision** : **aucun fichier de `core/`, `extract/`, `scripts/`, `contracts/`,
`tokens/`, `src/`, `evals/` n'est modifié par 031.** Surface de re-pin attendue :
zéro (SC-008).

**Rationale** : FR-015 gèle le runner ; les Assumptions consomment 030 « tel
quel » et n'attendent « aucune vérification automatisée nouvelle par section ».
Le corollaire n'est pas neutre : **FR-011 (chaque gate re-cite les exigences) et
FR-014 (dossier minimal conditionnel) ne peuvent pas être des portes machine**,
puisque les écrire serait ajouter une capacité — donc une fixture, donc un eval
(§II), donc du runner pendant la vague.

Ils deviennent des **portes documentaires tenues au niveau vague** :
`contracts/gates-de-vague.md` (le texte que chaque gate recopie et coche) et
`contracts/dossier-campagne.md` (la table de complétude des trois verdicts). Une
capacité non revendiquée n'a pas besoin d'eval — et rien dans README/docs ne
prétendra qu'un contrôle automatique existe.

**Alternative écartée** : écrire un `wave:check` qui vérifie les dossiers.
Séduisant, et interdit deux fois : FR-015, et §II qui exigerait fixture+eval —
c'est-à-dire du runner modifié pendant la vague, exactement ce que FR-015 refuse.

---

## R8 — Les gates sont ceux de la **vague**, pas des campagnes

**Décision** : six gates G0–G5, chacun re-citant les exigences de `spec.md`
(FR-011). Une campagne n'a pas de gate : elle a un **verdict** (FR-014) et une
**décision owner** (FR-012).

**Rationale** : FR-012 plafonne les sollicitations owner à deux ; multiplier les
gates par 13 les ferait exploser. La rétro le prouve à l'envers : les 4 gates de
029 se compressent « sans perte à 2 touches owner par lot quand le runner tient
les frontières ». Et la formulation de la spec vise bien la vague : « Given un
gate **de la vague**, When il est franchi… ».

| Gate | Moment | Sortie |
|---|---|---|
| **G0** | Kick-off | prérequis mesurés (R4, R5, ports), version `031-avant-vague` épinglée |
| **G1** | Fin de préparation | 13 manifestes + audits + preflights + captures-avant + planches |
| **G2** | Séance owner | 13 décisions individuelles (FR-012) |
| **G3** | Pilotes | Reassurances puis 1ʳᵉ additive, chaîne complète verte, second passage no-op |
| **G4** | Lot + vérification globale | 10 restantes appliquées, un seul cycle de vérif (§XI) |
| **G5** | Acceptation finale | reports d'abord, puis clôture globale (FR-012, FR-018) |

**Alternative écartée** : un gate par campagne (13 × 6 = 78 gates, incompatible
avec FR-012 et avec toute exécution en une journée).

---

## R9 — Mode de capture : `full` pour les pilotes, `light` pour le lot

**Décision** : `--capture-mode full` sur les deux pilotes — `reassurances` et la
première additive — de bout en bout de leur run ; `--capture-mode light` sur les
**10 campagnes restantes**. Le mode est fixé au premier usage d'un run et ne
change plus (`capture-mode-mismatch`) : un pilote commencé en `full` **finit** en
`full`, il ne bascule pas en `light` après sa validation.

**Rationale** : 030 garantit des **verdicts identiques** entre `full` et `light`
(FR-005, mesuré −81,3 % de volume sur 19 surfaces). Cette garantie est prouvée
sur fixtures et mock, jamais en vif. Les pilotes existent pour éprouver le vif :
ils paient le mode complet une fois. Le lot roule allégé sur une équivalence
alors observée, pas seulement démontrée.

**Alternative écartée** : `light` partout dès le pilote (on n'aurait pas de point
de comparaison vif entre les deux modes) ; `full` partout (≈ 300 fichiers et
104 MB par section, mesurés en 029 — incompatible avec la journée).

---

## R10 — Décisions et registre : un seul dossier partagé, un seul registre

**Décision** : `specs/031-vague-responsive-sections/decisions/` est le
`ownerDecisionRoot` **des 13 campagnes**. Le registre d'écarts est unique :
`specs/031-vague-responsive-sections/inventory/registre-ecarts.json` (+ sa vue
lisible `.md`), une ligne par campagne.

**Rationale** : c'est le scénario que le correctif E8 de 030 a rendu possible
(FR-001 de 030 : une décision visant une autre cible est **ignorée**, le doublon
interne et la décision manquante restent refusés). 029 contournait le bug en
déplaçant des fichiers à la main — intenable ×13. Le rejeu de ce scénario est
un eval enregistré (`figma-projection-repair-shared-decision-root`).

Chaque décision de design porte les champs 030 obligatoires : `pickerConsequence`
(français), et par fait accepté `nature` + `witnessRef` ; un fait `structurel`
sans témoin de sélecteur est refusé `structural-fact-unwitnessed` (FR-006).

**Alternative écartée** : un dossier de décisions par campagne — 13 dossiers, le
registre éclaté, et le correctif E8 payé pour rien.

---

## R11 — Un défaut de source à nommer avant d'y toucher (§VIII)

**Constat** : le cliché des composants contient un set
**`TEST/Reassurances Responsive — Controlled`** (`2563:5844`,
`Viewport{Desktop, Tablet, Mobile}`, 3 variantes) — un artefact d'essai vivant
dans le fichier gouverné, **sur la cible même du pilote**.

**Décision** : il est **relevé et nommé à G0**, porté au registre d'écarts et
soumis à décision owner en séance (le supprimer, l'archiver, le laisser). Il
n'est **ni supprimé ni contourné** par un agent : §VIII exige de corriger la
source, et une suppression de nœud est une mutation destructrice qui appartient à
l'owner. La campagne `reassurances` déclare ce nœud en lecture seule tant que la
décision n'est pas prise.

**Rationale** : §VIII, « pour TOUTE discordance, décider d'abord : est-ce que ça
vient de Figma ? ». C'en est une, et elle est adjacente à la cible pilote : un
`Viewport` d'essai à côté d'un `Presentation` gouverné est exactement le genre de
nommage divergent que D2 existe pour empêcher.

---

## R12 — Typographie mobile : override local étiqueté, inventaire par construction

**Décision** : D3/D4 s'appliquent en `typographyOverrides` bornés
(taille, interligne, alignement uniquement), chacun étiqueté
`pending-responsive-text-style` avec sa référence de décision owner. Aucun Text
Style n'est créé. L'inventaire de clôture (FR-016) se **lit** dans les manifestes
et les reçus — il n'est pas re-saisi à la main.

**Rationale** : le runner refuse tout champ typographique hors allowlist
(`typography-field-not-allowlisted`) et exige l'étiquette. La dette est donc
tenue par la machine, pas par l'intention — c'est la formulation exacte de la
fiche D3+D4. Même règle pour les variables : le runner n'accepte qu'une variable
**existante** (id, nom et valeur exigés), il ne peut pas en créer.

**Alternative écartée** : créer un style « Titre section / Mobile » gouverné
maintenant — la fiche le réserve explicitement à la décision d'unification
ultérieure, entrée = l'inventaire de clôture.

---

## R13 — Ce que la vague ne fait pas, dit ici plutôt que découvert plus tard

- **Aucune promotion de contrat.** `npm run parity` proposera de promouvoir
  `Presentation` en prop : ce patch est refusé par D1/FR-013. La forme gouvernée
  est l'acquittement `figma|ahead|<Set>.Presentation` dans `parity/baseline.json`.
  Compte mesuré le 2026-08-27 : le fichier porte **12 entrées au total**, dont
  **2 seulement** en `.Presentation` (`CategoriesPrincipales`, `HeroVideo`). La
  vague en ajoute **+12** (11 additives + Reassurances) ⇒ **24 entrées au total,
  14 en `.Presentation`**. Ne pas confondre les deux chiffres.
  **La 13ᵉ campagne n'ajoute rien** : `HeroVideo.Presentation` est déjà acquitté.
  Si le renommage est appliqué, cet acquittement est **re-qualifié** (son contenu
  change) ; s'il est reporté, il reste tel quel. C'est ainsi que FR-013 est tenu
  « y compris pour le renommage » sans 13ᵉ ligne.
- **Aucune écriture sur une Page.** Les usages restent read-only par position
  (`pageWrites: []`, `childWrites: []`), gardés par
  `page-write-forbidden` / `shared-child-write-forbidden`.
- **Aucun comportement responsive en code.** L'axe est un outil de conception et
  de validation côté Figma ; `docs/FIGMA-CAPABILITY-MATRIX.md` classe
  `@media`/`@container` **CARRY-CODE-ONLY**.
- **Aucun traitement de `header` ni `footer`** (décision owner du 2026-08-26).
- **Aucun traitement des enfants restés à traiter** : ils forment le brief du
  chantier suivant (Assumptions).
- **Le verdict « sans changement » (FR-019) ne devrait être atteint par aucune
  campagne, et c'est une mesure, pas une opinion.** Le relevé R1 montre que les
  onze sections additives n'ont **aucun axe** et que `Reassurances` n'a que
  `Disposition` : aucune ne porte déjà la matrice `Presentation` attendue. FR-019
  reste au contrat parce que le verdict est une **porte de sûreté** — si un audit
  frais conclut « sans changement » à G1, c'est que **R1 était faux**, et cela
  s'inscrit au registre comme écart de vague avant d'être finalisé comme verdict.
  Aucune tâche ne « produit » ce verdict : le chemin est l'audit, pas une
  intention.
- **Limite connue et conservée** : le preflight verrous s'arrête au premier
  ancêtre non-COMPONENT ; un plancher posé sur la frame de catalogue n'est pas
  rapporté par cette porte, et les verrous de descendants sont **visibles** dans
  `facts.sizeLocks` sans être **bloquants**. La vague hérite de cette limite
  telle qu'elle est documentée ; elle ne la corrige pas et ne la cache pas.
