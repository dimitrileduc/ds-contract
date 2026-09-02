# Data model — 031 (niveau vague uniquement)

Ce document ne décrit **que** ce que la vague ajoute. Les entités du runner
(manifeste de campagne, rapport de verrous, journal du driver, reçus, captures)
sont celles de 030 et ne sont **pas** re-décrites ici : `specs/030-…/data-model.md`
et `docs/internal/component-repair-workflow.md` font autorité. Les re-copier
serait la « volume mort » que la rétro 029 a mesurée (250 lignes, une seule
apparition à l'exécution, comme porteur d'un node id périmé).

Quatre entités, toutes JSON ou Markdown sur disque, toutes de niveau vague.

---

## 1. Campagne (entité de suivi, pas de fichier propre)

Une campagne = une cible + son run + son verdict. Il n'existe **aucun fichier
`campagne.json`** : la campagne se lit dans son manifeste (que le runner écrit)
et dans sa ligne de registre. Les 13 campagnes :

| # | `campaignId` | Cible Figma | Nœud | Classe (R1) | Membres créés |
|---|---|---|---|---|---|
| 1 | `031-reassurances` | Reassurances | `2114:3721` | `existing` | 6 |
| 2 | `031-presentation` **← pilote additive** | Presentation | `2103:2824` | `additive` | 2 |
| 3 | `031-devis` | Devis | `2096:2524` | `additive` | 2 |
| 4 | `031-formulaire` | Formulaire | `2096:2564` | `additive` | 2 |
| 5 | `031-coordonnees` | Coordonnees | `2104:2904` | `additive` | 2 |
| 6 | `031-faq` | FAQ | `2104:2914` | `additive` | 2 |
| 7 | `031-sav` | SAV | `2108:3105` | `additive` | 2 |
| 8 | `031-texte-seo` | TexteSEO | `2108:3123` | `additive` | 2 |
| 9 | `031-hero` | Hero | `2111:3382` | `additive` | 2 |
| 10 | `031-equipe` | Equipe | `2115:3947` | `additive` | 2 |
| 11 | `031-produits-ecommerce` | ProduitsECommerce | `2116:4475` | `additive` | 2 |
| 12 | `031-google-reviews-section` | Section Avis Google | `2545:5685` | `additive` | 2 |
| 13 | `031-hero-video-renommage` | HeroVideo | `2580:7392` | **renommage** | 0 |

**Douze sections (1–12) + un renommage (13) = treize campagnes**, exactement le
périmètre de FR-002. Le total est bien 6 + 11 × 2 = **28 membres créés**.

« Pilote additive » est un **attribut** de la campagne 2, pas une campagne de plus.
`presentation` le porte par défaut (T014) ; si la partition de zones la place dans
la même zone que `reassurances`, l'attribut se déplace vers la première additive
d'une zone distincte — le nombre de campagnes ne bouge pas.

L'ordre 1 → 2 est imposé (R2). Les campagnes 3 à 12 sont interchangeables ; leur
affectation aux writers vient de `partition-zones.json`. La 13 est indépendante.

**Attributs de suivi** (portés par la ligne de registre, jamais dupliqués) :
`campaignId`, `cible`, `classe`, `zone`, `writer`, `captureMode`, `verdict`,
`decisionRef`, `runPath`.

`runPath` se **relève** avant d'écrire : huit des treize cibles portent déjà des
runs de specs antérieures, et un `run-NNN` supposé libre écrase un état-avant
archivé (§X). La table des premiers runs libres est dans `tasks.md`
§« Règle des numéros de run ». Deux noms à ne pas confondre : la campagne 12 est
`031-google-reviews-section` (FR-002) mais son dossier de runs est le dossier
existant `specs/component-repairs/google-reviews/`.

---

## 2. Verdict de campagne

Exactement **un** des trois états terminaux. Le verdict commande le dossier de
preuve exigé — la table complète est dans
[`contracts/dossier-campagne.md`](./contracts/dossier-campagne.md).

| Verdict | Sens | Dossier minimal |
|---|---|---|
| `appliquée` | la matrice `Presentation` est posée | manifeste + audit + décision + ligne de registre **+ reçus d'application et de vérification** |
| `sans changement` | la matrice attendue était déjà conforme (FR-019) | manifeste + audit **vert** + preuve de conformité + décision + ligne ; **aucun reçu d'application fabriqué** |
| `reportée` | blocage nommé (FR-018) | manifeste + audit + décision + ligne **+ preuve du blocage + référence au brief suivant** ; si le blocage est apparu **après** la séance : **+ une décision de report owner** recueillie à l'acceptation finale |

Règles d'état :
- une campagne `reportée` compte comme **finalisée**, jamais comme **livrée**
  (SC-001 les compte séparément) ;
- une campagne `sans changement` compte comme **livrée** (FR-019) ;
- zéro campagne sans verdict à la clôture ;
- une décision de report **remplace l'autorisation d'appliquer** sans effacer la
  décision de design déjà enregistrée (FR-018).

---

## 3. Décision owner

Deux natures, un seul dossier partagé
(`specs/031-vague-responsive-sections/decisions/`, `ownerDecisionRoot` des 13 —
possible grâce au correctif E8 de 030).

**Décision de design** — schéma 029 étendu par 030
(`specs/030-…/contracts/decision-design.md`, qui fait autorité). Champs
obligatoires ajoutés :
- `pickerConsequence` : **une phrase française** décrivant l'état du sélecteur
  après application. Refus : `picker-consequence-missing`,
  `picker-consequence-not-in-french`.
- `acceptedFacts[]` en forme longue `{ fact, nature: "visuel"|"structurel",
  witnessRef }`. Un fait `structurel` (topologie, sélecteur, axes, Text Styles)
  exige un **témoin de sélecteur** ; sinon `structural-fact-unwitnessed`. La
  forme courte 029 (`string[]`) est **lue** pour l'histoire, jamais écrite.
- `conversationEvidence` : le mot de l'owner, qui couvre **exactement une**
  décision (FR-012).

**Décision de report** — la disposition d'une campagne bloquée après la séance,
recueillie **au début** de l'acceptation finale. Elle porte : la cause nommée, la
référence de la preuve du blocage, l'entrée au brief du chantier suivant, et le
mot owner. Elle référence la décision de design qu'elle suspend, sans la
supprimer.

---

## 4. Registre d'écarts de vague

`inventory/registre-ecarts.json` (autorité) + `inventory/registre-ecarts.md`
(vue lisible, dérivée). **Une ligne par campagne**, plus une ligne par écart de
vague constaté (défaut de source, verrou dérogé, repli séquentiel…). Schéma :
[`contracts/registre-ecarts.md`](./contracts/registre-ecarts.md).

Discipline reprise de 029 : le registre est **créé au premier écart, jamais après
coup**, et chaque ligne porte sa phase, sa cause datée et sa disposition.

---

## 5. Ce qui n'est PAS une entité de ce document

- Le **manifeste de campagne**, le **rapport de verrous**, le **journal du
  driver**, les **reçus** et les **captures** : entités de 030, écrites par le
  runner, décrites là-bas.
- Le **manifeste de planche** (`zones.json`) et son script de construction :
  sorties du générateur de planche de 030.
- Les **contrats de composant** (`contracts/*.contract.json`) : **inchangés** —
  l'axe `Presentation` n'y descend pas (D1/FR-013).
