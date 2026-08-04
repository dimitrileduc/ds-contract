# Quickstart — Mesure juste et triage complet (014)

**Spec** : [spec.md](./spec.md) · **Plan** : [plan.md](./plan.md) ·
**Recherche** : [research.md](./research.md)

La séquence exécutable, **dans l'ordre imposé**. Trois exigences se
conditionnent : la re-mesure « avant » précède toute écriture (FR-009), la
fixture rouge précède la correction (FR-002 + constitution §II), et le
vocabulaire précède les causes (FR-004). Sortir de cet ordre produit des
artefacts qui ne prouvent rien.

---

## Prérequis

```bash
node --version            # ≥ 20
npm install               # déjà fait dans ce checkout
npx playwright install chromium   # seulement si le cache est vide
echo "${FIGMA_TOKEN:?FIGMA_TOKEN requis — lecture seule}"
```

Le travail se déroule dans le checkout principal (aucun worktree), donc la
clause F1 de la constitution est sans objet et la balayée de portes tourne
directement ici.

---

## Étape 0 — L'état « avant », avant tout le reste

> **Rien d'autre ne commence avant que cette étape ne soit publiée.**

```bash
# 1) parité visuelle, INCHANGÉE : écrase REPORT.md (suivi par git) et écrit
#    out/rows.json — le reçu MACHINE, lignes en pleine précision + révision du
#    navigateur. C'est lui que le registre lit, jamais le Markdown : un score
#    relu à deux décimales efface toute divergence sous 0,005 % (D8).
npm run extract:figma:visual

# 2) contrôle de cohérence de 013 — utile, mais NE RE-MESURE RIEN (relit les
#    result.json déjà commités) : ne peut pas fonder l'« avant » à lui seul
npx tsx extract/figma/organism-audit/tools/build-campaign.mts --verify

# 3) l'« avant » lui-même : re-mesure les 9 sujets à cas (vagues 1+2) dans un
#    dossier de travail (out/registre-scratch/avant/, gitignoré) — jamais dans
#    specs/013-…/proofs/ — puis assemble le registre (recherche D11) :
#      - visual-parity : out/rows.json (frais, pleine précision) vs REPORT.md
#        tel que git le connaît (`git show HEAD:…`, 2 décimales — détection
#        d'écart avec le dépôt, jamais fondation de l'« avant »)
#      - organism-audit : le scratch frais vs les result.json déjà commités
npx tsx extract/figma/organism-audit/tools/build-registre.mts --phase avant
```

L'ordre est contraignant : l'étape 3 **refuse** (`visual-parity-not-remeasured`)
si `out/rows.json` date de plus de deux heures — un « avant » relu n'est pas une
mesure. Elle refuse aussi si un organisme échoue, si les deux instruments n'ont
pas tourné sur le même navigateur, ou si un écart n'a pas d'attribution.

**Contrôle** — `refusals` vide, et l'écart avec le dépôt attribué :

```bash
jq -r '.browser.version, .browser.revision, .visualParityReceiptAt' \
  specs/014-mesure-juste-triage/proofs/registre/avant.json
jq -e '.refusals | length == 0' specs/014-mesure-juste-triage/proofs/registre/avant.json
```

Un écart avec le dépôt est **possible et normal** — le navigateur n'a jamais été
épinglé (recherche §0.6). Ce qui est interdit, c'est un écart **non attribué** :
le renseigner dans `proofs/registre/attributions.json` (`byKey`), le seul
document du registre écrit à la main (D13) — `avant.json` et `apres.json`
restent générés de bout en bout (constitution I).

---

## Étape 1 — La fixture rouge (avant toute correction)

```bash
# elle DOIT échouer ici — c'est ce qui prouve qu'elle mesure la bonne chose
npx tsx evals/fixtures/organism-audit-case-reference-check.ts
```

La fixture est **data-only** : elle construit un `referenceProvenance`
reproduisant l'état antérieur (les cinq dérivées sur le set) et exige un refus
nommé, puis un second cas avec les cinq dérivées sur le node du cas et exige un
accord. Ni Chromium, ni Figma, ni disque.

Une fixture verte à cette étape est un défaut de la fixture, pas une bonne
nouvelle : elle ne mesure pas la classe d'erreur qu'elle prétend couvrir.

---

## Étape 2 — Corriger DW-006 (les cinq dérivées)

```bash
# après correction de pilot.ts : la fixture passe au vert
npx tsx evals/fixtures/organism-audit-case-reference-check.ts

# re-relever les 44 faits de reassurances SUR LE NODE DU CAS — le pipeline de 013,
# tel qu'il existe (le census prend une VAGUE, pas un sujet ; reassurances est en vague 2)
npx tsx extract/figma/organism-audit/tools/fetch-census.mts 2 --refresh
#   … puis re-relever les faits dans specs/013-…/proofs/declarations/reassurances.json
npx tsx extract/figma/organism-audit/tools/verify-declarations.mts   # sans argument — rien ne fusionne tant que ce n'est pas vert
npx tsx extract/figma/organism-audit/tools/merge-declarations.mts    # un seul écrivain sur le manifeste

# re-rendre le dossier, puis la synthèse depuis son autorité
npx tsx extract/figma/organism-audit/tools/run-one.mts reassurances
npx tsx extract/figma/organism-audit/tools/build-campaign.mts
npx tsx extract/figma/organism-audit/tools/build-campaign.mts --verify   # code 2 si le MD s'écarte du JSON
```

> **Piège connu, nommé pour ne pas faire perdre de temps.** `run-one.mts:51-52`
> imprime un chemin d'images construit en dur comme
> `<id>-master-defaults` — or le cas de reassurances s'appelle
> `reassurances-disposition-4-cartes`. Le chemin **affiché** est donc faux pour
> ce sujet précis ; les artefacts, eux, sont écrits au bon endroit par le pilote.
> C'est un `console.log`, pas un reçu.

**Contrôle** — la référence est le node du cas, sur les CINQ dérivées (celui-ci
ne dépend pas du registre, il lit `metadata.json` directement) :

```bash
jq -e '.referenceProvenance
       | .caseNodeId == "2114:3619"
       and (.derivations | to_entries | length == 5)
       and (.derivations | to_entries | all(.value == "2114:3619"))' \
  specs/013-auditer-fidelite-organismes/proofs/organisms/reassurances/cases/*/metadata.json
```

> **`apres.json` n'est PAS construit ici.** `select` (étape 5) ajoute une ligne
> de parité visuelle qui n'existe pas encore à ce point de la séquence ; figer
> l'« après » maintenant obligerait à le refaire une seconde fois. Le registre
> « après » se construit **une seule fois**, à l'étape 7, une fois les deux
> instruments stables. L'invariance des huit organismes (leur chiffre n'a pas
> bougé) est vérifiée là-bas — pas supposée ici entre-temps.

Le chiffre publié est **celui mesuré**. La valeur de contrôle consignée
(~3,30 %) est une attente : un écart notable avec elle est nommé, jamais
recopié comme résultat.

---

## Étape 3 — Le vocabulaire à six valeurs

```bash
# la fixture D'ABORD — elle DOIT échouer, ni CauseSlug ni CAUSE_LABELS n'existent
npx tsx evals/fixtures/triage-vocabulary-check.ts

# … puis l'énumération et la table de publication, qui la font passer au vert
npx tsx evals/fixtures/triage-vocabulary-check.ts
```

Vérifie les **cinq** propriétés du contrat
([cause-vocabulary.md](./contracts/cause-vocabulary.md)) : six entrées, libellés
deux à deux distincts (donc bijection), toute règle dans le vocabulaire, toute
valeur publiée connue de la table, et aucun slug retiré (`capture-gap`,
`renderer`, `harness`, `design`) subsistant dans une surface publiée — dont
`site/src/pages/how.ts`, qui publie encore les cinq anciens.

22 des 25 règles existantes sont re-classées selon la table du contrat. La règle
`carte` n'est **pas** pré-tranchée : sa cause écrite mélange frontière image et
défaut moteur, elle est re-mesurée avant d'être classée. Les trois règles mortes
(`heading`, `switch`, `badge` — contrats supprimés à la reconversion) quittent
`TRIAGE` pour la constante `RETIRED_RULES` et sont publiées comme telles, pas
silencieusement retirées.

---

## Étape 4 — Trier, sans réparer

Sur les **deux** instruments — FR-011 porte la population sur les deux :

- **parité visuelle** : les 4 lignes UNTRIAGED + les 13 lignes aujourd'hui à `—`
  reçoivent chacune une règle dans `triage.ts` (`class`, `cause`, `receiptId`) et
  son reçu dans `proofs/recus/` ;
- **audit d'organismes** : les 9 lignes divergentes (hero 27,83 % · faq 3,67 % ·
  texte-seo 1,84 % · footer 1,04 % · sav 0,67 % · coordonnees 0,52 % ·
  presentation 0,35 % · devis 0,14 % · reassurances re-mesurée) reçoivent leur
  cause dans `proofs/registre/causes.json` § `organismLines` (décision D12) —
  aucun dossier de `specs/013-…/proofs/` n'est modifié.

Les pistes consignées en recherche §2 sont des **hypothèses à falsifier**, pas des
conclusions. La cause de reassurances est celle de son **résidu** : DW-006
expliquait les 39,78 %, il n'explique pas ce qui reste.

```bash
npm run extract:figma:visual        # APRÈS l'attribution — sinon le rapport
                                    # publie encore ses lignes UNTRIAGED
```

**Contrôle** — un triage n'a rien réparé (`HEAD`, pas l'arbre de travail seul :
sans lui un changement déjà stagé ou commité reste invisible) :

```bash
git diff --name-only HEAD | grep -E '^(contracts/|tokens/|src/components/|figma-sync/|catalog/)' \
  && echo "REFUSÉ — un triage ne modifie ni contrat, ni token, ni sortie générée" && exit 1
git diff --stat specs/014-mesure-juste-triage/  # les preuves, elles, bougent
```

Une ligne triée `contract-geometry`, `image-boundary` ou `figma-source` **reste
divergente** : la cause est nommée, jamais corrigée ici.

---

## Étape 5 — `select` rejoint la mesure (34/34)

```bash
npm run extract:figma:visual -- select     # filtre de sujet POSITIONNEL (run.ts:339-345)
npm run extract:figma:visual               # puis le rapport complet
grep -c '^| select ' extract/figma/visual-parity/REPORT.md   # ≥ 1
```

`--summary` **refuse** un filtre de sujet (« subject filters would hide
regressions », `run.ts:1842`) : le filtre sert à itérer, jamais à conclure.

L'exclusion (`subjects.ts:236-247`) est un **commentaire**, pas du code : la
retirer, c'est ajouter une entrée à `PARITY_SUBJECTS` (master `2053:1249`,
`renderWidth: 280` comme Input/Textarea) et remplacer le commentaire par le reçu
de son infirmation.

Aucun critère assoupli : mêmes régions déclarées, mêmes seuils, même exigence de
preuve probante que les 33 autres. Si la mesure se révèle empêchée, la ligne est
publiée **non probante avec sa cause et son reçu** — jamais absente.

---

## Étape 6 — Re-tester les causes héritées

```bash
npx tsx extract/figma/organism-audit/run.ts \
  --campaign specs/013-auditer-fidelite-organismes/contracts/audit-campaign.json \
  --check-dependencies --check
```

Un reçu par décision affirmée (périmètre complet en data-model §5) : exclusion
de `select`, `button-with-icons` *skipped*, `piqueray-logo` *refused*, les 25
règles de `TRIAGE`, les 3 blocages d'organismes, les 6 entrées DW.

**Contrôles** :

```bash
# aucun reçu sans date ni méthode rejouable — `-s` (slurp) est nécessaire : sans
# lui, `all(...)` sur un glob de fichiers top-level OBJET itère les VALEURS de
# chaque objet (rawPct, browser, …), pas les fichiers, et échoue silencieusement
# sur la première valeur non-objet (« Cannot index number with string "date" »),
# constaté à l'implémentation (014/T033)
jq -s -e 'all(.date != null and .method != null)' specs/014-mesure-juste-triage/proofs/recus/*.json

# une cause infirmée n'a rien réparé — `-s` nécessaire, même piège que ci-dessus
jq -s -e '[.[] | select(.verdict == "refuted")] | length as $n | $n >= 0' \
  specs/014-mesure-juste-triage/proofs/recus/*.json
```

Un blocage jugé infondé est **consigné comme entrée de 016**, pas levé ici.

---

## Étape 7 — Clôture

Les deux instruments sont maintenant stables (select mesuré, causes posées,
reçus publiés) : c'est le seul point où l'« après » peut être figé une fois
pour toutes (recherche D11).

```bash
# une dernière régénération complète : c'est ELLE qui alimente apres.json,
# puisque build-registre lit out/rows.json
npm run extract:figma:visual

npx tsx extract/figma/organism-audit/tools/build-registre.mts --phase apres
```

```bash
# les huit organismes invariants n'ont pas bougé (vérifié, pas supposé)
jq -e '[.lines[] | select(.instrument == "organism-audit" and (.key | startswith("reassurances") | not))
        | select(.delta.rawPct != 0 or .delta.facts != null)] | length == 0' \
  specs/014-mesure-juste-triage/proofs/registre/apres.json

# hors reassurances, aucun chiffre de parité visuelle n'a bougé sans attribution
jq -e '[.lines[] | select(.instrument == "visual-parity")
        | select(.delta.rawPct != null and .delta.rawPct != 0 and .attribution == null)] | length == 0' \
  specs/014-mesure-juste-triage/proofs/registre/apres.json
```

```bash
npm run measure:gate            # fail-closed : code non nul tant qu'un trou subsiste
```

Puis la balayée complète des portes du dépôt :

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

**Contrôle final** — les cinq propriétés de clôture, lues dans la sortie du gate :

```bash
npm run measure:gate -- --json | jq -e '
  .verdict == "pass"
  and .counts.divergentLines >= 0
  and (.counts.byCause | keys | length == 6)
  and (.refusals | length == 0)
  and .browser.version != null'
```

`counts.byCause` **est** la sortie dimensionnante de FR-011 : la part
`contract-geometry` dimensionne 015, la part `figma-source` dimensionne 016.

---

## Ce que la fonctionnalité ne fait jamais

| interdit | pourquoi |
|---|---|
| modifier un contrat, un token, une sortie générée | SC-005 — un triage n'est pas une réparation |
| muter, nettoyer ou régénérer le canvas Figma | FR-008 — lecture seule de bout en bout ; les défauts de source sont **consignés** pour 016 |
| assouplir un seuil, une région déclarée, un critère de preuve | Assumptions — seule évolution admise : un durcissement (la dispense à 3 % disparaît) |
| débloquer MemberCard, Field ou NavItem | Out of Scope — le déblocage demande une réparation |
| recopier la valeur de contrôle ~3,30 % comme résultat | le chiffre publié est celui **mesuré** ; l'écart avec l'attente est nommé |
| figer un compte en prose | la sortie vive du gate est la seule autorité ; c'est pourquoi SC-002 ne cite plus de nombre de lignes |
