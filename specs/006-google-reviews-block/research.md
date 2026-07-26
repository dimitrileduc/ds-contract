# Research — 006 « Avis Google »

**Date** : 2026-07-25 · **Branche** : `006-google-reviews-block` · **Spec** : [spec.md](./spec.md)

Résout les inconnues du Technical Context de [plan.md](./plan.md). Format : **Décision → Raison →
Alternatives écartées**. Tous les faits sont vérifiés dans le dépôt à la date ci-dessus, chemins et
lignes donnés. Deux revues indépendantes (conception + adversariale) ont corrigé plusieurs prémisses
de départ ; les corrections portent la marque **⚠ correction**.

---

## R1 — Route de création des masters : **contrat d'abord, master généré**

**Décision (owner).** Les deux masters sont **créés par le générateur** : contrat écrit depuis les
mesures de l'aplat → `npm run figma:plan` → `figma-sync/NN-*.js` **exécutés contre le fichier
Piqueray vivant**. Aucun master dessiné à la main.

**Raison.** C'est la démonstration directe de la thèse (un contrat, deux surfaces) et une
**première** sur Piqueray : les 5 contrats existants ont tous été *extraits* de masters dessinés à
la main, et `figma-sync/02-button.js` n'a jamais été exécuté.

**Ce qui rend la route tenable** (vérifié) :
- L'identité d'un master est le marqueur `ds_contracts/contractId`, **pas son nom**
  (`core/emit-figma-script.ts:3604-3620`) — un re-run retrouve le set même renommé ou déplacé.
- Un re-run **amende en place** (`amendSet`) : préserve le node du set, sa `key`, l'id de chaque
  variante et **la clé de chaque propriété de composant** — donc les instances posées et **les
  valeurs de leurs propriétés** survivent.
- « Une page par composant » (`:3656`) n'a lieu qu'à la **première** création.

**Ce qu'elle coûte** : cinq contraintes dures, traitées en R5, R18 et R19.

**Alternative écartée.** Master à la main puis contrat extrait (précédent 003/004) — plus sûr, mais
l'owner a choisi la démonstration contrat-d'abord. Reste le repli si R5 devenait insoluble.

---

## R2 — Découpage : **deux contrats**

**Décision (owner).** `ds.review-card` (`name: "ReviewCard"`, `category: "molecule"`) et
`ds.google-reviews` (`name: "GoogleReviews"`, `category: "section"`). La barre-résumé est un groupe
de parts **dans** la section.

**Raison.** La barre-résumé n'apparaît qu'une fois par bloc. Les deux contrats correspondent
exactement aux **deux lignes reportées** de `COMPONENT-INVENTORY.md`, ce qui rend SC-008 atteignable.
`molecule` et `section` existent déjà dans l'énum `category` (`contract-schema.ts:833`) : **aucun
changement de schéma**.

**Contrainte.** Les deux contrats doivent être **mono-racine** — `single-root-golden-invariant`
(`evals/run.ts:3938`) asserte `multiRootCount === 0` sur **tous** les contrats du dépôt.

**Périmètre du master section** : **le rectangle de l'aplat seul** (1552 × ~328), pas le `GROUP`
entier. L'instance de Section-header reste un frère intact dans le `GROUP` (FR-008). La boîte du
master égale ainsi celle de l'aplat — qui est aussi la région de mesure (R3).

---

## R3 — ⚠ correction majeure — le seuil : mesurer le **plancher** avant de construire

Deux erreurs **symétriques** ont été trouvées dans la lecture initiale de FR-016.

### (a) Le dénominateur « page entière » rendrait le seuil creux

`pages:compare` ne publie qu'un `diffCount` absolu ; les 2 % du dépôt
(`extract/figma/visual-parity/tolerance.ts`) appartiennent à l'**autre** instrument. 003 fabriquait
son pourcentage à la main : `diffCount / aire de page`. Appliqué ici (aplat = 1552 × 328 =
**509 056 px**) :

| Maquette | Aire de page | 2 % de la page | = part de l'aplat autorisée fausse |
|---|---|---|---|
| Contactez-nous | 6 740 928 | 134 819 | **26,5 %** |
| Accueil | 9 383 040 | 187 661 | 36,9 % |
| Portes d'entrée | 11 290 752 | 225 815 | 44,4 % |
| PdG industrielles | 11 684 736 | 233 695 | **45,9 %** |

Une reconstruction **presque à moitié fausse** passerait SC-004 sur quatre pages sur huit. Les
écarts réellement acceptés par 003 valaient **0,015 % à 0,099 %**.

### (b) Mais 2 % sur la **région** est probablement **inatteignable**

Le bloc reconstruit rend en **Montserrat** — la seule famille gouvernée — alors que l'aplat est un
raster de la police de Trustindex. Ordre de grandeur : ~650 glyphes (5 cartes × nom + date + ~3
lignes, plus la barre-résumé) ; un changement de police fait diverger l'encre de **quasiment tous**
les glyphes, avant même tout déplacement. Plancher estimé : **8-12 % de la région**. Étalon : le
bloc le plus dense de 003 (Texte SEO) atteignait 0,123 % d'une **page** en re-rendant **les mêmes**
nœuds texte — soit ≈ 2,4 % ramené à un dénominateur de région.

### Décision

1. **Dénominateur = la bbox de l'aplat** (509 056 px), publiée **à côté** de celle du `GROUP`
   (1552 × 459), pour qu'on ne puisse pas accuser le rapport d'avoir choisi le dénominateur flatteur.
2. **Sonde de plancher de fidélité avant toute écriture de contrat** (`tasks.md` T015-T016, Phase 2) : rendre une carte
   d'essai en headless, la comparer au recadrage de l'aplat, **publier le chiffre à l'owner avec le
   triptyque**, et obtenir une décision de seuil **écrite dans `decisions.md`**. FR-016 prévoit
   exactement cela : au-delà du seuil, « arrêt et décision explicite », pas échec automatique.
3. **Séparer deux fidélités au rapport** : la **fidélité structurelle** (boîtes, positions, comptes,
   couleurs — mesurable et verrouillable) et la **fidélité raster** (rastérisation des glyphes,
   dominée par la substitution de police, qui est une *conséquence de la gouvernance*, pas un
   défaut).
4. **Doubler le seuil de la discipline qui marche vraiment** (005,
   `contracts/proof-cycle.md` §3) : **écrire l'écart attendu AVANT d'exécuter, puis STOP à toute
   déviation, dans les deux sens.** Un écart plus petit que prévu est aussi suspect qu'un plus grand.

---

## R4 — Le logo Google : **glyphe interne (classe D7)**

**Décision (owner).** `assets/icons/google.svg`, consommé par un `icon.asset` **fixe** — hors
registre. C'est la classe **D7** (`parity/diff.ts:809-833`) : un asset consommé par un `icon.asset`
non templaté n'est pas orphelin sans entrée au registre. Précédents : `check.svg`, `close.svg`.
Conséquence voulue : la marque d'un tiers **n'entre pas** dans le menu d'icônes offert à tous les
composants. Une note de marque déposée accompagne le fichier.

---

## R5 — ⚠ correction — les dépendances se résolvent **par nom** : ne pas instancier le Bouton

**Fait.** `findComponentByName(spec.dep)` (`core/emit-figma-script.ts:3098-3106`, appelé `:3252`)
cherche `n.name === name`, où `name` est le champ `name` du **contrat enfant**, et **lève** si
introuvable.

**Conséquence 1 — le Bouton est inaccessible.** `ds.button` a `"name": "Button"` ; le master vivant
s'appelle **« Bouton »**. Un `component: { id: "ds.button" }` ferait **échouer** le script poussé —
ou, si quelqu'un « réparait » en lançant le script du Bouton, **créerait un second set Button** à
côté de Bouton. C'est littéralement la leçon « joindre par CLÉ, jamais par nom » de la spec 002.

**Conséquence 2 — renommer casse la résolution.** `setName` vaut `contract.name` (`:2441`), gaté en
PascalCase : les masters naissent `ReviewCard` / `GoogleReviews`. Les renommer vers la convention du
fichier ferait échouer un re-push ultérieur de la section.

**Décision — deux règles, zéro changement moteur.**
- **Aucun `component`-ref vers `ds.button`** dans les deux contrats. Les flèches de carrousel et le
  CTA éventuel de la barre-résumé sont **dessinés en parts** (frame + `icon.asset` + texte).
- **Le renommage français (`Review-card`, `Avis Google`) est le DERNIER geste canevas de la spec**,
  après adoption complète, avec la procédure inverse consignée (renommer en arrière avant tout
  re-push).

**Effet de bord heureux : cela dissout entièrement le problème FR-023.** L'orthographe périmée du
Bouton (`Property 1` / `Outilne noir`, que 005 a léguée à une « Spec B ») **n'entre jamais** dans un
contrat 006. **006 n'a donc à faire ni le bump majeur du Bouton, ni aucune retouche d'artefact
Bouton.** ⚠ Cela corrige la recommandation inverse de la première passe de recherche.

**Coût, nommé honnêtement.** FR-007 demande de réutiliser les pièces gouvernées, « bouton » compris.
On ne le fait pas **parce que le code l'interdit aujourd'hui**, pas par confort. La limite est
déclarée au rapport, et le correctif moteur (résoudre par `contractId` d'abord, nom en repli,
~15 lignes) part au **backlog** : il change les octets émis ⇒ churn de golden + éval (Principe II),
et « ranger au passage » est hors périmètre déclaré de cette spec.

---

## R6 — Avatar photo : porté par propriété, **trou A5 non refermé**

**Fait.** `figma.createImage` / `ImagePaint` / `imageHash` n'existent **nulle part** dans les
émetteurs. Une part `element:"img"` peint `#D9D9D9` et pose `imgPlaceholder: true`
(`emit-figma-script.ts:2026-2034`), qui ne sert qu'à ajouter une note `†` à la description (`:2426`).
`docs/FIGMA-CAPABILITY-MATRIX.md:91,226,352` le classe **trou ouvert A5**.

**Décision — quatre couches, chacune nommée.**

| Couche | Porteur | Fidélité |
|---|---|---|
| Contrat | `photo` (bool) + `photoUrl`/`photoAlt` (texte) ; part `element:"img"`, `attrs {src:"{photoUrl}", alt:"{photoAlt}"}` | pleine |
| React / HTML | `<img src={String(photoUrl)} alt={…}>` — précédent `examples/polaris/…/Thumbnail.tsx:27` | pleine |
| Master canevas | aplat gris + `†` | **trou A5** |
| Instance de maquette | **override de fill IMAGE** sur la part, consigné au ledger — précédent exact Member-card 003 (`"valeur": "imageHash c60f37ab…"`) | vrais pixels |

Le bitmap est recadré depuis `aplat-source.png` (résolution native, R9).

**⚠ Précision d'honnêteté.** FR-004 assimile cet avatar aux « photos de contenu ailleurs dans le
fichier » — or celles-là sont posées à la main dans des cadres non gouvernés. Une image **portée par
le contrat** serait une **capacité à construire** (champ de schéma additif + chemin émetteur Figma +
chemin React + mock + éval). **006 ne la construit pas** : A5 reste ouvert et le rapport le dit. Le
contrat porte l'**aiguillage** et l'**URL** ; le **pixel** est un override hors contrat, dont la
contribution à l'écart est **isolée et nommée** (FR-015 l'exige déjà).

**Contrainte.** Une prop scalaire ne peut pas être `figma.kind:'NONE'` (réservé aux `arrayOf`,
`emit-react.ts:812`) ⇒ `photoUrl` est une prop texte liée **TEXT**, inerte sur le canevas.

---

## R7 — La note en étoiles

**Fait.** `assets/icons/star.svg` cuit `fill="#F98A0B"` et **ne se recolore pas** (registre v1.1.0,
D6). `Part.icon` vaut `{asset, size}` — aucun canal de teinte. **Une étoile vide ou demie n'est pas
exprimable.**

**Décision.** La note est un **compte d'étoiles dessinées**, pas un état de remplissage : 5 parts
`icon`, les parts 4-5 gouvernées par `visibleWhen {prop:"note", equals:"…"}` sur un enum lié
**VARIANT** — les parts à `visibleWhen` enum sont filtrées hors des variantes non concernées à la
compilation (`emit-figma-script.ts:1638-1646`), donc chaque variante porte son vrai compte.

**Mais d'abord : mesurer.** Si les 5 avis affichent tous 5/5 — de loin le cas le plus probable pour
un widget Trustindex — **l'axe `note` est supprimé** : 5 étoiles fixes, une limite nommée, zéro axe
de variante, zéro produit cartésien. C'est la conclusion à privilégier.

**Si la mesure montre des étoiles partielles** : sous-livrable nommé (glyphe `star-outline` /
`star-half` en **glyphe interne D7**, cohérent avec R4), jamais une improvisation au dessin.

**Alternative écartée.** `repeat` sur une part étoile : impossible (exigerait un contrat `ds.star`
séparé, et refuse les enums par item).

---

## R8 — Les cartes dans la section : `repeat`, et **où vit le contenu réel**

**Décision.** Part `repeat { itemsProp: "avis", sample: […5 enregistrements GÉNÉRIQUES…] }` +
`component { id: "ds.review-card" }`. Champs `arrayOf` : `auteur`, `initiale`, `date`, `texte`,
`initialeVisible` (bool), `photo` (bool), `photoUrl`, `photoAlt`, `verifie` (bool) — chacun nommant
**par nom** une prop scalaire correspondante de `ds.review-card`.

**Limite 1 — pas d'enum par item.** `arrayOf` n'accepte que `text|number|boolean` ; les enums par
item sont **refusés par nom** (`emit-react.ts:662-707`). `propose-figma.ts:863` restreint encore
(`text|boolean`, pas `number`), et `repeat-collection-check.ts:6-12` exige une série **≥ 3 au
gabarit homogène**. Donc `note` ne peut pas varier d'une carte à l'autre — voir R7.

**Limite 2 — aucune prop texte parente n'est transmissible.** Vérifié : `mapDepProps`
(`emit-figma-script.ts:1606-1635`) résout `"{parentProp}"` depuis `subst`, la **map de substitution
des variantes**. Une prop **texte** parente n'y figure pas → `Cannot resolve parent prop mapping`.
Une section **ne peut pas** déclarer `carte1Auteur` et l'injecter dans la carte imbriquée.

**Où vit donc le contenu réel — à écrire au rapport, pas à glisser sous le tapis.** La prop tableau
est `figma.kind:'NONE'`, donc **code-only** : `parity/diff.ts:326` la saute *par conception*, et le
canevas rend le `sample`. Il n'existe **aucune propriété de la section, côté canevas, qui porte la
collection**. Le contenu réel des 8 occurrences est porté par des **overrides de propriétés TEXT sur
les instances de carte imbriquées** — ce qui est bien « par propriétés » au sens de Figma, et c'est
exactement le motif de ledger de **toutes** les adoptions de 003
(`"chemin": "Member-card/member-picture/normal"`). FR-010 est satisfaite **par ce mécanisme-là**, et
le rapport le formule ainsi.

**Le `sample` reste générique** (« Prénom N. », « il y a 2 mois », un témoignage neutre) : le master
est générique **par construction**, FR-010 tenue.

**Repli décidé à l'avance.** Si la mesure montre des notes hétérogènes : cartes en **instances
frères explicites** — `component { id:"ds.review-card", props:{ note:"5" } }` × N, chacune fixant sa
valeur d'enum (les valeurs fixes **sont** autorisées dans `component.props`). Plus verbeux, perte du
tableau vivant côté React, mais exact. Consigné au journal, jamais absorbé dans un cas moyen
(FR-006).

---

## R9 — Mesurer depuis l'aplat, avec provenance

**Source de mesure — la meilleure qui existe, obtenue en lecture seule.** Ne **pas** recadrer une
capture de page (ce serait une copie lossy d'une copie lossy). Prendre les **octets d'origine** via
un script bridge en lecture seule :

```js
const rect  = await figma.getNodeByIdAsync(APLAT_NODE_ID);
const paint = rect.fills.find(f => f.type === 'IMAGE');
const bytes = await figma.getImageByHash(paint.imageHash).getBytesAsync();
// POST vers receiver.mjs /png — même transport que capture.js
```

→ `measures/aplat-source.png` + sha256 + `imageHash` en side-car, pour qu'un tiers puisse
re-vérifier chaque mesure. Enregistrer `scaleFactor = largeurNative / 1552`. `img.ts` ne
rééchantillonne **jamais** : le côté code est rendu à la largeur honnête correspondante et tout
résidu est publié — **jamais** la référence rééchantillonnée.

**Ce qui est mesuré, et comment** : couleurs (RVB modal sur patch 5×5, à deux emplacements) ; taille
de texte (hauteur de capitale ÷ ratio de la fonte, recoupée par l'interligne) ; espacements (profils
d'encre X et Y, mesurés sur **deux occurrences différentes** du même écart) ; rayons (extension de
l'arc de coin) ; comptes et booléens (lecture à ≥ 4×, un crop committé par fait) ; textes
(transcription à ≥ 4×, ellipse finale comprise si le widget l'a rendue).

Chaque ligne va dans `measures/mesures-aplat.md` :
`rôle | lecture A | lecture B | valeur retenue | arbitrage | reçu (crop)`.
**Aucune valeur n'entre dans un contrat sans sa ligne.**

### Règle de tranchage — mesure depuis un aplat *(à citer telle quelle)*

> Chaque valeur est mesurée **deux fois par deux moyens différents**.
> **Accord** (Δ ≤ 1 px pour une distance, ≤ 1/255 par canal pour une couleur, ≤ 0,5 px pour une
> taille) → valeur retenue, marquée `accord: 2/2`.
> **Désaccord**, dans cet ordre :
> 1. **Le pas gouverné tranche** — si exactement UNE lecture tombe sur une valeur déjà gouvernée
>    (`tokens/primitives.tokens.json` ou une variable Figma post-005), c'est elle.
>    Motif : `arbitrage: pas-gouverné`.
> 2. **La lecture la plus conservatrice** — les deux candidates sont rendues et mesurées ; la plus
>    basse gagne. Motif : `arbitrage: pixel`.
> 3. **Troisième lecture** — sa médiane tranche, et **les trois chiffres sont publiés**. Jamais de
>    moyenne silencieuse.
>
> Dans tous les cas la valeur porte la provenance **« mesurée depuis l'aplat »** — dans la
> `description` de la part qui la porte et dans la ligne du tableau. **Jamais** présentée comme
> extraite d'une source en calques.

**Où vit la provenance sans changer le schéma** : `description` de part (nomme la ligne de mesure) ;
`semantics.provenance: "authored"` (véridique — ce n'est pas extrait du canevas) ;
`anchors.figma.dumpedAt` = date d'extraction de l'aplat ; le répertoire `measures/` committé fait
foi.

**Honnêteté du contenu** (FR-010) : transcription fidèle au visible mais **non garantie au caractère
près**. Tout fragment illisible ou tronqué est **signalé nommément avec la valeur retenue**, jamais
comblé en silence.

---

## R10 — Audit des canaux : méthode, puis replis déjà tranchés

**Méthode — table de faisabilité mécanique, AVANT d'écrire le contrat.** Pour chaque
`(part, canal, valeur mesurée)`, classer contre une table à 5 verdicts calculée **depuis le code**
(importer `LITERAL_CHANNELS`, `LITERAL_VALUE_RE`, `DECLARED_CHANNELS` de
`packages/schema/src/contract-schema.ts`) :

| Verdict | Test | Résultat canevas |
|---|---|---|
| **token** | valeur ∈ inventaire de tokens | liée à une variable Figma |
| **literal** | canal ∈ `LITERAL_CHANNELS` **et** valeur ∈ `LITERAL_VALUE_RE` | dessinée |
| **declared-draw** | canal ∈ `DECLARED_CHANNELS` `canvas:'draw'` — **les 6** : `aspect-ratio`, `text-overflow`, `text-transform`, `text-decoration-line`, `text-align`, `font-family` | dessinée nativement |
| **declared-annotate** | canal ∈ `DECLARED_CHANNELS` `canvas:'annotate'` — **36** : `position`, `display`, `overflow-*`, `white-space`, `max-width/height`, `border-style`, `transition-*`… | code-only, note `†` |
| **refusé** | rien de ce qui précède | à redessiner autour, avec reçu nommé |

La table committée devient un livrable ; `build` + `figma:plan` ne sont plus qu'une **confirmation**.

**Replis déjà tranchés depuis le code :**

- **`box-shadow` = token uniquement** (`emit-figma-script.ts:1157` parse une valeur de token
  *résolue* ; absent de `LITERAL_CHANNELS`). Piqueray n'a aucun token d'ombre, et l'owner a décliné
  les nouveaux tokens en 003. → **Séparer la carte du fond par la couleur, pas par l'ombre** : carte
  `{color.blanc}` sur fond de section `{color.bleu-clair}` (#F4F6FA). Gouverné, dessinable, zéro
  vocabulaire nouveau. Le coût est mesuré et publié.
- **Rayon court** (~8 px ; seul `radius/32` existe) → `literals: { "border-radius": "8px" }` :
  `border-radius` **est** dans `LITERAL_CHANNELS` et `8px` matche la grammaire ⇒ **dessiné**. Aucun
  token à re-proposer.
- **Gris neutres** (texte, filets), absents des 14 couleurs → mesurer puis choisir par valeur :
  aligner sur `{color.noir}` ou `{color.bleu-gris}` quand le Δ est imperceptible (**publier le Δ**),
  sinon `literals: { color: "#5F6368" }` (légal, dessiné). **Publier les deux chiffres dans tous les
  cas** : l'alignement est une décision de gouvernance, pas une mesure.
- **Espacements hors échelle** (12/20/24 vs {0,4,10,16,32}) → `literals` (`gap` et `padding-*` sont
  tous dans `LITERAL_CHANNELS`).
- **Troncature multi-lignes (`-webkit-line-clamp`) = refusée** (absente des deux registres). La
  troncature **une ligne** (`text-overflow: ellipsis`) est dessinable (`textTruncation:'ENDING'`).
  → **Transcrire exactement ce que le widget a déjà tronqué**, ellipse comprise. Aucune capacité
  revendiquée, aucun contournement.
- **`position` / `display` / `overflow-*`** = annotés → anatomie en **auto-layout pur**, zéro
  positionnement absolu.
- **`font-family`** : dessinable, mais Piqueray n'a qu'une fonte. La substitution de police est le
  terme dominant de l'écart (R3) — **nommée, pas corrigée**.

---

## R11 — Trois jambes de mesure, à ne jamais confondre

| Jambe | Compare | Instrument | Quand | Coût |
|---|---|---|---|---|
| **A — convergence** | rendu **code** ↔ **crop de l'aplat** | nouveau frère `extract/figma/aplat-parity/` (rendu de `visual-parity/render.ts`, diff de `img.ts`) | hors ligne, itérations illimitées | ~30 s, **zéro écriture canevas** |
| **B — portage** | rendu **code** ↔ **master canevas** | `npm run extract:figma:visual` + 2 sujets | une fois, après la poussée | un rendu REST |
| **C — occurrence** | page **avant** ↔ **après**, sur la région | `npm run pages:compare -- --regions …` | une fois par adoption | une paire de captures |

**A** est le bouton qu'on tourne. **B** prouve que le canevas porte fidèlement ce que le contrat dit
— c'est *la* revendication de la route contrat-d'abord. **C** est la preuve par occurrence
(FR-014/016). Précédent de forme : `extract/figma/state-photo/run.ts` réutilise déjà `visual-parity`
et **importe** `THRESHOLD_PCT` au lieu d'inventer un seuil — suivre exactement cette forme, avec un
selftest à 2 fixtures.

**C'est ce qui rend R1 acceptable** : **une seule** poussée générative sur le fichier vivant au lieu
d'une par itération de fidélité.

---

## R12 — ⚠ correction — la spec 005 est **CLOSE**, mais **non mergée**

**Fait vérifié 2026-07-25.** HEAD 005 = `3938c68`, précédé de `cc048a4 step(005/cloture): … spec 005
CLOSE` ; **T107 à T116 tous `[X]`** ; T108 a passé la volée complète sur le checkout principal
(8/8 verts, suite **108/108**, `parity` zéro constat actif). ⚠ La première passe de recherche la
croyait ouverte : corrigé.

**Mais la branche 006 part de `8f3137d` (main) et ne contient aucun commit de 005.**

**Décisions.**
1. **FR-021 est levée** — plus de gel canevas. Le verrou restant est le **merge**.
2. **Première action de la spec : merger 005 dans la branche 006.** Sinon 006 travaille sur un dépôt
   qui décrit un fichier Figma qui n'existe plus (005 a supprimé les pages `Assets` et `Archive` et
   la copie de la maquette Accueil, déplacé 18 icônes, redimensionné Section-header 1552→1550,
   reconstruit le Footer en auto-layout, découpé le Header). **Les node ids de l'ère 003 sont
   périmés jusqu'au re-scan** (FR-022).
3. **Le merge apporte gratuitement la réparation de `checkpoint.js`** — voir R16.
4. **Établir la ligne de base des gates AVANT de commencer.** `subjects.ts:252`
   (`variantName: 'Property 1=Outilne noir'`), `evals/harness.ts:179,182` et
   `parity/snapshots/figma-components.json` portent l'orthographe pré-005 que 005 a
   **délibérément** laissée (réparation léguée). `extract:figma:visual` et `parity` peuvent donc être
   rouges **pour des raisons étrangères à 006**. Passer la volée sur le checkout principal
   **d'abord** et consigner le résultat dans `decisions.md` — pour que 006 ne soit ni accusée à
   tort, ni couverte par le bruit.
5. **006 ne fait PAS le bump majeur du Bouton** — R5 le rend inutile en n'instanciant jamais
   `ds.button`.

---

## R13 — Les orphelins de `figma-sync/`

**Fait.** `scripts/generate-figma.ts:80-86` nomme `NN-<name>.js` par index positionnel et **ne
nettoie jamais**. Aujourd'hui : **3 orphelins** (`03-input.js`, `04-textarea.js`, `05-textarea.js`),
tous épinglés dans `evals/golden.json`. Avec 7 contrats, `sortByDependencies` donne
`02-button, 03-checkbox, 04-reviewcard, 05-googlereviews, 06-input, 07-select, 08-textarea` — ce qui
**échoue `04-input.js`, `05-select.js`, `06-textarea.js` en nouveaux orphelins**, portant le total à
**6**. Pire : `golden-generated-output` itère **les clés de golden**, donc un fichier renuméroté
laisse l'ancien sur disque, **toujours conforme à golden**, pendant que le fichier réellement généré
n'est plus épinglé — une régression de générateur y deviendrait invisible.

**Décision.** `git rm` les 6 orphelins **dans le même commit relu** que l'ajout des contrats, puis
`golden:update`. Le diff de golden est la surface de risque relue. La purge est **dite au journal**.

**Écarté.** Rendre `figma:plan` auto-nettoyant : change le comportement émis ⇒ éval requise
(Principe II), et « ranger au passage » est hors périmètre. → backlog, avec ce reçu attaché.

---

## R14 — ⚠ correction — évals : réanimer **ce qui l'est vraiment**

Les corps des cas en quarantaine ont été lus. Le tri honnête :

| Cas | Verdict |
|---|---|
| `detect-figma-missing-nested-instance` | **Réanimer — vrai déplacement.** Le corps édite `figma-components.json` (`nestedInstances`) et attend un constat `figma/behind` ; il suffit de re-pointer `Card`/`Avatar` → `GoogleReviews`/`ReviewCard`. Sa condition de réactivation est désormais littéralement remplie. |
| `repeated-children-collection` | **Probablement réanimable** — son blocage était « pas de composant composé chez Piqueray ». Vérifier via `npm run extract:figma:repeat:check` une fois `ds.review-card` créé, **puis** déplacer. |
| Ordonnancement des dépendances dans `plugin:check` | **Débloqué** — `scripts/plugin-engine-check.mjs` saute aujourd'hui l'ordonnancement **par nom**, faute de composite. Retirer le saut est un vrai déverrouillage, avec son reçu. |
| `pending-first-sync-not-drift` | **Ne pas promettre.** Son corps édite `contracts/heading.contract.json`, un contrat démo **supprimé** → réanimer serait une **réécriture**, pas un déplacement. |
| `naxis-full-cartesian-product` | **Ne pas promettre.** Fixture liée à des tokens démo supprimés ; ne qualifierait que si la carte finissait avec ≥ 2 axes d'enum — improbable (R7). |
| famille **slot** | **Reste en quarantaine** — 006 utilise `repeat` + `component`, pas de slot. Prétendre l'inverse serait une fausse revendication. |

**Évals neuves à écrire** (fixture → éval → affirmation, avant toute phrase de doc) :
1. `review-card-avatar-exclusivity-is-convention-not-schema` — épingle que l'exclusion
   pastille/photo est **nommée, non imposée**, pour qu'elle ne devienne jamais une revendication
   silencieuse.
2. `google-reviews-repeat-renders-sample-on-static-surfaces` — React mappe le tableau ; html /
   react-inline / canevas rendent le `sample` ; `undefined` ne rend rien.
3. `img-part-canvas-placeholder-named` — la part photo compile en `imgPlaceholder: true` et la
   légende porte le `†` ; **A5 reste un trou ouvert**.
4. `pages-compare-regions-additive` — les 2 cas de selftest de `--regions` + une assertion
   d'**identité byte** d'un run sans le flag.
5. Un cas de **fidélité de mock** pour ce que le canevas vivant apprendra du piège `GROUP`
   (Principe VII : le correctif a deux moitiés).

**Compteur.** Suite vivante à **108/108**. Toute addition/réanimation resynchronise le chiffre
partout où il est cité — et `README.md` en porte déjà **deux valeurs différentes** (102 et 108), à
réconcilier.

---

## R15 — Où tournent les gates

`npm run eval` symlinke `ROOT/node_modules` (`evals/harness.ts`) : **il ne tourne pas dans un
worktree**, et celui-ci n'a pas de `node_modules`. La volée complète tourne sur le **checkout
principal** `/Users/dlstudio/.superset/projects/ds-contracts-poc`, exactement comme 005 (T108).
Tournent **dans** le worktree : `pages:selftest`, `pages:compare`, les scripts bridge.

Rappels : `npx tsx scripts/deterministic-roundtrip.mjs` (**`tsx`, pas `node`**) ; deux vérifications
pilotent un vrai Chromium ; **aucun filtre mono-éval** n'existe.

---

## R16 — Le préfixe de label des points de restauration : **déjà réparé, arrive au merge**

`checkpoint.js:26` sur la branche 006 lit encore `/^003\/[^/]+\/[^/]+$/`. **Sur la branche 005 il
lit déjà `/^\d{3}\/[^/]+\/[^/]+$/`** — vérifié. Il arrive donc **gratuitement au merge** (R12) et
admet `006/…` sans invalider les labels 003.

**Conséquence de séquencement** : sans le merge, **aucun** point de restauration n'est posable — et
FR-003 en exige un **avant la première mutation**. Le merge est un prérequis dur du premier geste.
Ne **jamais** contourner en préfixant `003/006-…` : cela empoisonnerait l'historique du fichier
d'une fausse attribution de spec.

**Schéma de labels** : `006/masters/creation`, `006/masters/iteration-N`, `006/masters/rangement`,
`006/adoption/<maquette>` ×8, `006/demo/us4` (démonstration de réutilisabilité, T070-T072 — c'est une
mutation canevas comme une autre), `006/cloture/renommage`.

---

## R17 — Transport des scripts générés

Les scripts font 40-50 Ko. Deux routes existent ; **retenue : `npm run figma:serve` + le plugin Sync
Runner packagé** — c'est la **seule** qui produit `figma-sync/.runner-result.json`, que
`npm run anchors:writeback` consomme (sinon l'écriture des ancres est manuelle). Repli : la route
`GET /file?name=` de `receiver.mjs`, construite en 003 pour qu'une grosse source tienne en un GET.

**Garde-fou.** Servir **uniquement** les deux scripts de composant. **Jamais `01-tokens.js`** (il
ré-upserterait les collections de variables du fichier), **jamais `batch-01.js`** (il embarque le
Bouton, dont le script **reconstruirait l'intérieur** des variantes et détruirait les slots
d'icônes — danger identifié et refusé en 001).

---

## R18 — ⚠ nouveau — le garde-fou « mauvais fichier » est **désactivé** sur une ancre nulle

**Fait.** `core/emit-figma-script.ts:2965` passe `contract.anchors.figma.fileKey` comme
`EXPECTED_FILE_KEY`, et `:3025-3027` :

```js
const EXPECTED_FILE_KEY = null;
if (EXPECTED_FILE_KEY && figma.fileKey && …) throw new Error('WRONG FILE: …');
```

Un contrat **neuf** a `fileKey: null` ⇒ le garde-fou court-circuite ⇒ **le script construit dans le
fichier où le pont est pointé, quel qu'il soit**. C'est exactement le mode de défaillance que ce
garde-fou existe pour empêcher, et il est éteint sur la seule poussée où il compte.

**Décision — obligatoire.** Écrire `anchors.figma.fileKey: "d9FYAUcqdcNtsuaMgLefvJ"` dans les deux
contrats **dès le premier commit** (`componentSetKey` / `nodeId` restent `null` jusqu'à l'écriture
des ancres). Le garde-fou est alors armé, et les octets gardés sont épinglés par golden. **Vérifier
la présence de la chaîne dans le script émis avant de l'exécuter.**

---

## R19 — ⚠ nouveau — un amend **détruit** les overrides imbriqués : trois règles

**Fait.** `amendSet` (`emit-figma-script.ts:3401`) fait `for (const child of [...comp.children])
child.remove();` puis reconstruit. **Préservés** : id du set, `key`, ids de variantes, **clés de
propriétés de composant** (une propriété TEXT/BOOLEAN de même nom garde son id, donc les instances
gardent leurs valeurs). **Non préservés** : tout ce qui est adressé par un **id de nœud imbriqué** —
overrides de propriétés d'instances imbriquées, overrides de texte bruts, **overrides de fill image**.

**Règle 1 — toute donnée par occurrence doit chevaucher une propriété de composant.** Aucun override
brut pour du contenu.

**Règle 2 — après la première adoption, `ds.google-reviews` ne doit plus être amendé.** Un amend de
la section détruirait le contenu des avis sur les **8** occurrences. Si un amend devient inévitable,
les 8 occurrences se **rejouent depuis `ledger/google-reviews.json`** — le ledger est la seule
sauvegarde, donc il doit être complet et rejouable.

**Règle 3 — les 8 fills photo s'appliquent APRÈS le dernier amend** (R6) : c'est la donnée la plus
fragile.

**Conséquence de séquencement** : **l'adoption ne commence que lorsque les jambes A et B sont
signées dans `decisions.md`.** C'est ce qui rend la boucle hors-ligne (R11) structurante et non
décorative.

---

## R20 — ⚠ nouveau — un `dimension-mismatch` fait **disparaître** la preuve, en affichant 0

**Fait.** `compare.ts:236-247` : quand les dimensions avant/après diffèrent, le verdict est
`dimension-mismatch` avec **`diffCount: 0`, `diffBox: null`, aucune image** — donc
`report.ts:95-132` **n'écrit aucun crop**, et `report.ts:160-165` promeut en
`statutGlobal: 'refus'`, **exit 2**.

**Pourquoi c'est probable ici** : remplacer un raster de 328 px par une pile auto-layout reconstruite
change la hauteur de page à ≥ 1 px près avec quasi-certitude — 005 a documenté **trois** prédictions
de hauteur successivement fausses par cascade de centrage (`005/decisions.md:254,265`).

**Le danger** : l'occurrence se retrouve **sans image, sans chiffre, sans crop** — les quatre champs
exigés par FR-014 tous absents — et son chiffre dans `verdict.json` vaut littéralement **`0`**.
Quiconque somme ou moyenne les `diffCount` lit un résultat **plus propre** que la réalité.

**Décisions.**
1. **Cible de neutralité de hauteur** par occurrence : mesurer la hauteur exacte de l'aplat (~328) et
   **contraindre le master de section à cette hauteur** avant la première adoption.
2. **Règle dure** : toute ligne `dimension-mismatch` ou `capture-failed` dans un `verdict.json` est
   un **STOP avec décision owner**, **jamais** un point de donnée.
3. **Preuve de sous-cadre** : recadrer la bbox du `GROUP` (ses `x,y,w,h` sont déjà dans le scan) sur
   les deux PNG pleine page et diffuser séparément, pour que le bloc ait son propre
   numérateur/dénominateur **qui survive à un changement de hauteur de page**.

---

## R21 — ⚠ nouveau — le ledger sera **légitimement vide**, et un vert n'y prouverait rien

**Fait.** `bridge/customizations.js` compare une copie à un master **par position**, et 003 nomme son
angle mort mot pour mot : il *« ne compare jamais le texte/contenu interne d'une instance nichée »*,
et prévient que *« le ledger de ces blocs devra être complété à la main »*
(`003/decisions.md:1600-1612`).

L'état « avant » de 006 est un **unique `RECTANGLE`** : zéro nœud texte, zéro propriété, zéro
personnalisation. `customizations.js` renverra honnêtement `entrees: []`, et `ledger-check.ts`
acceptera ce vide explicite. **Exit 0.**

**C'est l'artefact le plus creux que 006 puisse produire** : un reçu vert affirmant « aucune
personnalisation perdue » au-dessus d'un contenu **inventé par transcription**, sans aucune source
lisible par machine.

**Décision.** Déclarer le ledger **structurellement inapplicable au côté aplat**, et le remplacer par
un **relevé de transcription** par occurrence : `crop de la zone source ‖ chaîne saisie ‖ indice de
confiance ‖ relecteur`, revu en **seconde passe**. Le contenu imbriqué des cartes est **ajouté à la
main** au ledger, conformément à l'avertissement 003 — et parce que R19 en fait la seule sauvegarde.

---

## R22 — ⚠ nouveau — la maquette témoin est **aveugle** aux pièces que 006 introduit

**Fait vérifié.** `Motorisation` instancie `accordion`, `accordion-row`, `category-card`,
`devis-cta`, `footer-column`, `footer-devis`, `hero-et-categories`, `product-card`,
`produits-ecommerce`, `texte-seo` — donc bien `Bouton` et les glyphes flèches. Mais **aucune
instance d'`Étoile` ni de `check`**, et 005 le confirme : *« Étoile / mail / external-link — 0 usage
réel »*. **Le master Étoile n'a jamais été instancié nulle part dans ce fichier.**

SC-003 affirme que la témoin est *« le seul endroit où une retouche accidentelle d'un master partagé
se lit sans ambiguïté »* — **vrai pour `Bouton` et les flèches seulement**.

**Décision.** Garder `Motorisation` comme témoin Bouton/flèches, **nommer son angle mort dans la
spec**, et ajouter une garde qui observe vraiment les pièces neuves : une **relecture directe
avant/après du master `Étoile`** (fills, taille, nom, jeu de variantes) et de l'asset `check`,
puisque aucune page ne peut les observer.

---

## R23 — ⚠ nouveau — `deterministic-roundtrip` doit être **re-pointé** sur le composite

**Fait.** `scripts/deterministic-roundtrip.mjs:19-37` porte une dégradation nommée : le harnais a été
re-pointé d'un composite vers le Bouton plat, avec écrit noir sur blanc *« WHAT IS LOST: composite
DEPTH — nested component instances, repeated collections… TO RESTORE: when Piqueray gains a component
that composes others, re-point this harness onto it. »*

**006 livre exactement ça.** Laisser le harnais sur le Bouton et rapporter le gate vert serait une
omission silencieuse — la classe de bug que la constitution désigne comme la plus grave.

**Décision.** Re-pointer (ou étendre) `deterministic-roundtrip` sur `ds.google-reviews` : c'est un
**livrable** de la spec, et le reçu qui rend crédible la revendication « la boucle se ferme sur un
composite ».

---

## R24 — ⚠ nouveau — collision de périmètre : deux « spec 006 » différentes

**Fait.** Sur la branche 005 : `BACKLOG-SPEC-006-figma-styles-structure.md` (racine du dépôt) assigne
7 items à « spec 006 », et `specs/005-figma-source-cleanup/RAPPORT-CLOTURE.md:27-28` nomme **Spec
006** propriétaire de :
- *Section-header — enfants FIXED 1550 → passer en FILL sur le maître puis rejouer l'adoption ×7* ;
- *Hero vidéo → déplacement vers `DS · Organisms`*.

Or **cette** spec 006 est « Avis Google », son Out of Scope dit « toute autre zone du fichier », et
l'item Section-header **contredit frontalement FR-008** (Section-header conservé tel quel). 005
nommait le *prochain numéro libre*, que la spec Avis Google a pris entre-temps.

**Décision.** Trancher avec l'owner **avant la Phase 2** (`tasks.md` T006, en Phase 1 de Setup) et consigner dans `decisions.md`.
**Recommandation : (a)** 006 reste « Avis Google » seule ; les deux réparations partent vers un
**nouveau numéro** ; `BACKLOG-SPEC-006-*.md` est renuméroté et `RAPPORT-CLOTURE.md:27-28` amendé —
pour que son pointeur ne devienne pas orphelin en silence. L'option (b), absorber, contredirait le
Out of Scope **et** FR-008.

---

## R25 — ⚠ nouveau — réconcilier les compteurs avant de revendiquer SC-008

**Fait — trois documents, trois comptes.** `proofs/honesty-report.md:137` dit **2** blocs reportés.
`COMPONENT-INVENTORY.md:66,79,94,126` liste **trois** lignes reportées — Review-card, **Icône
étoile**, Avis Google — et sa ligne 126 dit *« Review-card, icône étoile = restés inférés, jamais
confirmés »*. Or l'étoile **a été livrée** au registre par la spec 004.

**Décision.** Réconcilier explicitement les trois compteurs et **dire lequel SC-008 fait bouger** (le
compteur du rapport d'honnêteté : **2 → 0**), en corrigeant au passage la ligne « Icône étoile » de
l'inventaire, périmée depuis 004. Sans ça, « le compteur passe de 2 à 0 » est vrai dans un document
et faux dans un autre.

**Portée de SC-001.** À écrire noir sur blanc : le relevé « 0 occurrence » porte sur la page `Pages`
(`210:325`). La copie de la maquette Accueil qui vivait sur `DS · Organisms` a été **supprimée à la
clôture 005** (compteur T113 : « Accueil-copy deleted ») — **à re-vérifier au re-scan** avant de
revendiquer quoi que ce soit de portée « fichier entier ».

---

## Récapitulatif

| Réf | Sujet | Statut |
|---|---|---|
| R1 | Route contrat-d'abord | Tranché — owner |
| R2 | Deux contrats | Tranché — owner |
| R3 | Seuil : dénominateur + **sonde de plancher** | Tranché — **décision owner après la sonde** |
| R4 | Logo Google en glyphe D7 | Tranché — owner |
| R5 | Pas de `component`-ref vers `ds.button` ; renommage en dernier | Tranché — dissout FR-023 |
| R6 | Avatar photo, A5 non refermé | Tranché |
| R7 | Étoiles : compte, pas remplissage | Tranché — la mesure décide de l'axe |
| R8 | `repeat` + où vit le contenu | Tranché — repli écrit |
| R9 | Mesure sur octets natifs + règle de tranchage | Tranché |
| R10 | Table de faisabilité des canaux | Tranché — livrable Phase 2 |
| R11 | Trois jambes A/B/C | Tranché |
| R12 | 005 close mais non mergée → merger d'abord | Tranché |
| R13 | 6 orphelins `figma-sync` purgés | Tranché |
| R14 | Évals : liste vérifiée | Tranché |
| R15 | Gates sur le checkout principal | Tranché |
| R16 | Checkpoint : réparé, arrive au merge | Tranché |
| R17 | `figma:serve`, jamais tokens ni batch | Tranché |
| R18 | Garde « mauvais fichier » : ancrer `fileKey` | Tranché |
| R19 | Amend détruit les overrides → 3 règles | Tranché |
| R20 | `dimension-mismatch` = preuve absente notée 0 | Tranché |
| R21 | Ledger inapplicable → relevé de transcription | Tranché |
| R22 | Témoin aveugle → garde directe sur l'Étoile | Tranché |
| R23 | Re-pointer `deterministic-roundtrip` | Tranché — livrable |
| R24 | Collision de numéro de spec | **Décision owner requise** |
| R25 | Compteurs SC-008 / portée SC-001 | Tranché |

**Aucun `NEEDS CLARIFICATION` ne subsiste.** Deux points attendent une décision owner et sont
**explicitement séquencés avant les phases qu'ils gouvernent** : le seuil de fidélité (R3, après la
sonde de Phase 0) et la collision de numéro (R24, avant la Phase 1).
