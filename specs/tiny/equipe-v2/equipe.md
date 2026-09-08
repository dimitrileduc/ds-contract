# Équipe v2 — passe 2 : la section

**Agent de la passe 2, 2026-09-07.** Périmètre : `ds.equipe` (la section), plus l'ouverture du canal
de la photo de survol dans `ds.member-picture` et `ds.member-card`. La passe 1 (atome + molécule) est
terminée et n'a pas été refaite — son journal est `specs/tiny/equipe-v2/member-card.md`.
Référence suivie : `docs/16-mode-emploi-composant-vers-odoo.md`, partie A.

Entrées : `.page-parity/equipe-v2/{dumps/equipe-v2.dump.json, proposals/, planches/, photos/}`.
Source Figma : set `Equipe` **`2777:30992`**, clé **`e5563df1e3d6a5e6d023174576ec6d16f54f997b`**, dump v1.8
du 2026-09-07. **Deux sets portent le nom « Equipe »** : tout, ici, est appuyé sur la CLÉ.

---

## 1. Sort de CHAQUE note de la section « Equipe » de `figma-proposals.md`

| Note de la proposition | Sort |
|---|---|
| `semantics.element` par défaut `div` | **conservé du contrat 1.2.0** (`div`, `provenance: extracted`). La note dit elle-même que l'élément hôte n'est pas dessinable sur le canevas ; le bloc Odoo est un `<section>` mais rien dans la source ne le commande. Changer aurait été inventer. **Question tranchée seule**, listée au rapport |
| `root padding-inline` fonction de l'axe `presentation` par VALEUR (24 · 48 · 56 · 89) en `tokensByProp` | **adopté tel quel** — c'est exactement la forme proposée, et les quatre valeurs sont LIÉES au canevas (`space/24`, `space/48`, `space/56`, `space/89` au champ `bound` de chaque racine de variante) |
| `root/grid` : variable liée sur `gridRowGap` — pas de vocabulaire de contrat, binding NOMMÉ non proposé | **résolu, et pas comme l'extraction le proposait.** Le canal `row-gap` EXISTE au contrat (1.2.0 le portait déjà) ; ce que l'extracteur n'a pas su faire, c'est y remonter la variable. Elle est `size/equipe/gap-rangees` au dump : le contrat garde `{size.equipe.gap-rangees}` |
| `root/grid` : idem sur `gridColumnGap` | **idem** : `{size.equipe.gap-colonnes}` |
| `root/grid` : hauteur d'auto-layout FIXE — 2086 / 2022 / 2652 / 1931 portés | **écarté — TÉMOINS** (règle A3-2). Une grille dont les cartes se replient n'a pas de hauteur fixe ; la lui donner figerait la section à la longueur des textes du jour du relevé. *Contrôle a posteriori : le bloc Odoo mesure **exactement** 2086 · 2022 · 2652 · 1931 aux quatre largeurs — la hauteur se retrouve, elle n'a pas besoin d'être écrite* |
| `root/grid/MemberCard` : instance imbriquée LIÉE à `ds.member-card` par clé de set | **adopté** |
| prop `items` : tableau structuré, `bindings.figma.kind: NONE`, limite de fidélité déclarée | **adopté**, et **élargi** : les champs passent de 2 (nom, poste) à **6** — voir §2 |
| `root/grid/MemberCard` : prop appliquée « Etat » ne traverse pas les liaisons de `ds.member-card` — « vérifier que le contrat enfant est à jour » | **résolu par la passe 1** : `ds.member-card` porte l'axe `etat` depuis 2.0.0. Il n'est **pas** remonté en champ de `items` : une différence d'enum par item est du P10, jamais portée (le schéma le dit dans `RepeatSchema`). L'état est fixé par la composition (verdict `fixed-by-composition` au miroir Odoo) |
| `root/grid/MemberCard` : 1 prop fixe abandonnée comme non mappable | **conséquence de la ligne au-dessus**, rien à porter |
| 16 instances sœurs homogènes → UNE part gabarit + `repeat` sur `items` | **adopté** — la forme du contrat 1.2.0, inchangée |
| `root` : largeur de racine DESSINÉE FIXE par variante → jeton de racine minté | **écarté — TÉMOINS** (règle A3-2). `layout.width: "fill"` + `referenceWidth: 1728` |
| MINTÉ `imported.equipe.grid.gap` = 32px | **NON minté. Renommé vers les jetons EXISTANTS `{size.equipe.gap-colonnes}` et `{size.equipe.gap-rangees}`** (32 px tous les deux), et non vers `{space.32}` — voir la déviation nommée §4.1 |
| MINTÉ `imported.equipe.grid.height.{mobile,tablette,desktop,wide}` | **supprimés — TÉMOINS** |
| MINTÉ `imported.equipe.root.width.{mobile,tablette,desktop,wide}` | **supprimés — TÉMOINS** |

**Aucun jeton n'a été minté par cette passe.** `tokens/` n'est pas touché.

---

## 2. Ce que le contrat porte, par écran — `ds.equipe` **1.2.0 → 2.0.0**

| Canal | 1.2.0 (les quatre écrans) | 2.0.0 Mobile | Tablette | Desktop | Wide |
|---|---|---|---|---|---|
| axe `presentation` | **absent** | mobile | tablette | desktop | wide |
| gouttière `padding-inline` (racine) | **aucune** | `{space.24}` | `{space.48}` | `{space.56}` | `{space.89}` |
| `padding-block` · `gap` racine | absents | `{space.0}` · `{space.0}` | idem | idem | idem |
| colonnes de la grille | **4, figées** | **2** | **3** | **3** | **4** |
| écart de colonnes · de rangées | `{size.equipe.gap-colonnes}` · `{size.equipe.gap-rangees}` | inchangés aux quatre écrans (32 · 32, liés au canevas) |
| champs de `items` | `nom`, `poste` | + `imageUrl`, `imageAlt`, `imageSurvolUrl`, `imageSurvolAlt` |
| largeur de racine · hauteur de grille | — | témoins, non portés (`width: fill`, `referenceWidth: 1728`) |

**Version : MAJEURE (2.0.0).** Règle A3-9 : les ancres changent de set — `786b6f66…` / `2115:3947`
devient `e5563df1…` / `2777:30992`. **C'est le seul motif de rupture** : aucune prop ne disparaît,
aucune valeur d'enum ne se resserre ; l'axe `presentation` et les quatre champs photo seraient chacun
un mineur à eux seuls.

**Le nombre de colonnes n'a pas été compté à l'œil.** Il se déduit du dump, largeur de grille et largeur
de carte à l'appui — et les quatre comptes retombent à la décimale sur les largeurs relevées :

| Écran | grille | colonnes | (grille − écarts) / colonnes | largeur de carte au dump |
|---|---|---|---|---|
| Mobile | 342 | 2 | (342 − 32) / 2 = **155,00** | 155 |
| Tablette | 738 | 3 | (738 − 64) / 3 = **224,67** | 224,67 |
| Desktop | 1088 | 3 | (1088 − 64) / 3 = **341,33** | 341,33 |
| Wide | 1550 | 4 | (1550 − 96) / 4 = **363,50** | 363,50 |

Le vocabulaire existait : `VariantLayoutSchema.columns` (spec 023), précédent exact `ds.reassurances`
2.1.1 dont la part `items` passe de 1 à 3 colonnes par `layoutByProp`. **Vérifié dans le schéma avant
d'écrire**, pas supposé — et donc **aucun** fait code-only n'a été nécessaire pour les colonnes.

### Les deux bumps de la chaîne, et la décision qui les commande

L'orchestrateur a tranché : **ouvrir le canal de la photo de survol**. Fait, en additif :

- **`ds.member-picture` 1.3.0 → 1.4.0** (MINEUR) : props `srcSurvol` / `altSurvol`, posées en `attrs`
  sur la part `funIa`, qui était rendue **sans `src` du tout**.
- **`ds.member-card` 2.0.0 → 2.1.0** (MINEUR) : props `imageSurvolUrl` / `imageSurvolAlt`, threadées
  vers `srcSurvol` / `altSurvol` de l'instance composée.
- **`ds.equipe` 2.0.0** : les quatre champs photo dans `items`, donc la collection les passe par nom.
- **QWeb** : `member_picture` rend désormais `t-att-src="member.get('imageSurvolUrl') or None"`.

C'est Figma qui commande : le master empile bien DEUX photos sur les deux variantes du set. Sans ce
canal, survoler une carte faisait **disparaître** le portrait pour ne laisser que le lavis `#D9D9D9`.
**Vérifié sur l'instance** (`.page-parity/equipe-v2/tools/survol-equipe.mts`) : au repos
`normal` opacité 1, au survol opacité 0, et le plan découvert porte une image **réellement chargée**
(364 × 364, `naturalWidth > 0`) — pas un `<img>` vide.

### Un défaut trouvé par une porte, pas par la chance

`npx tsc --noEmit` a refusé la première version : l'émetteur React déclare **tous** les champs d'un
`arrayOf` **requis**, et l'histoire Storybook est bâtie sur `repeat.sample`, qui ne portait que
`nom` et `poste` — 16 erreurs `TS2739`. La prior-art donne la réponse sans inventer : `ds.google-reviews`
et `ds.reassurances` portent, dans **chaque** enregistrement de leur échantillon, **tous** les champs,
avec `""` pour les routes photo (`photoUrl: ""`, `imageUrl: ""`). L'échantillon d'`Equipe` fait pareil :
seize enregistrements à six champs, les quatre routes **vides parce que le canevas n'en porte aucune**
(trou A5 : les pixels d'une IMAGE ne sont pas une propriété de composant). Un champ présent et vide,
jamais une route inventée.

---

## 3. Faits code-only (deux, et ce sont les seuls de cette section)

Tous deux dans `static/src/css/responsive/equipe.pqr.css`, chacun commenté avec sa raison, et nommés
dans la `description` de la part concernée.

**(1) `ODOO-EQUIPE-V2-GRILLE` — la traduction de l'axe en `@media`.** Le contrat DIT tout ce qui change
par écran, et `components.pqr.css` émet correctement `.equipe--presentation-tablette`, `-desktop`,
`-wide`. Mais **aucun gabarit QWeb ne pose ces classes** : un bloc Odoo déposé est une copie HTML figée,
il n'a pas de « mode » à écrire. Les mêmes valeurs sont donc RECOPIÉES sous `@media`, aux seuils des
jetons de rupture (768 · 992 · 1400), à l'identique du contrat. Précédent et forme reprise :
`responsive/reassurances.pqr.css` (vague 031). La règle Desktop répète `repeat(3, …)` bien qu'identique
à Tablette : le contrat porte bien `desktop: { columns: 3 }`, et la feuille doit se lire sans avoir à
savoir laquelle des requêtes précédentes est encore active.

**(2) `ODOO-EQUIPE-V2-CELLULE-CENTREE` — Figma CENTRE une carte dans sa cellule, CSS l'ÉTIRE.**
Le dump donne, sur la part `grid`, `layout.counter = "CENTER"` : une carte plus courte que sa rangée est
posée au MILIEU. La valeur initiale d'`align-items` en grille CSS est `stretch` — la carte est tirée sur
toute la hauteur et son contenu, colonne flex sans justification, retombe **en haut**.
**Pourquoi ce n'est pas au contrat, et ce n'est pas un oubli** : le schéma REFUSE `align` sur une part
`display: "grid"`, **par nom** — « display:"grid" does not support align in the bounded fixed-track
subset » (`packages/schema/src/contract-schema.ts`, `superRefine` de `LayoutSchema`). Lu dans le code,
pas supposé. Une seule déclaration posée : `align-items: center` sur `.equipe__grid`.

**Ce qui n'est PAS dans cette feuille, et c'est voulu** : la typographie par écran (`tokens.pqr.css`
porte déjà ses `@media` pour `--pqr-typography-h3-*` et `--pqr-typography-overline-*`, la carte les
monte par ses jetons — la recopier serait une seconde source) ; et le déclencheur du survol, qui vit
dans `responsive/member-card.pqr.css`, zone `ODOO-EQUIPE-V2-MEMBER-SURVOL` (passe 1).

---

## 4. Déviations nommées

**4.1. L'écart de grille garde `{size.equipe.gap-*}` et non `{space.32}`.** Le brief demandait de
renommer `imported.equipe.grid.gap` vers `{space.32}`. La règle derrière ce brief est « renomme vers le
jeton EXISTANT de valeur identique, ne minte pas » — et le dump désigne lequel : le canevas lie
`gridColumnGap` à **`size/equipe/gap-colonnes`** et `gridRowGap` à **`size/equipe/gap-rangees`**
(champ `bound` du nœud `grid`, sur les quatre variantes). Les deux jetons existent, valent 32 px, et sont
déjà ceux du contrat 1.2.0. `space.32` vaut la même chose mais **ne porte pas le nom que le canevas lie**,
et le troisième axe du différeur est précisément « variables du canevas ⟷ `tokens/` ». Renommer vers
`space.32` aurait rendu la géométrie muette sur cet axe. **Déviation au brief, assumée et motivée par la
source.** `npm run parity` est vert.

**4.2. `semantics.element` reste `div`.** Le bloc Odoo est un `<section>` ; le contrat dit `div` depuis
1.2.0 et l'extraction dit elle-même que l'élément hôte n'est pas récupérable du canevas. Aligner aurait
changé les deux surfaces générées sur une décision qu'aucune source ne porte. Non fait, nommé.

---

## 5. Mesure — bloc Odoo contre planche, aux 4 largeurs, à contenu ÉGAL

Page de mesure `/equipe-test` (bloc seul, en-tête masqué), contenu **identique aux planches** : les 16
noms et postes du set, les 16 portraits exportés du canevas.

Outil de capture : `.page-parity/equipe-v2/tools/capture-equipe.mts` — il **imprime** les boîtes relevées
et **REFUSE** une boîte de moins de 10 px par une erreur nommée (mesurer l'absence de données est le
défaut nommé de la spec 017). Comparaison : `.page-parity/mesure-bloc.mjs` (aplatit l'alpha de la planche
sur blanc, rapporte l'écart de hauteur, triptyque pleine taille).
**Les quatre triptyques ont été REGARDÉS avant d'annoncer un chiffre** : trois panneaux pleins à chaque
largeur, aucun panneau uni.

| Écran | planche | bloc Odoo | Δ hauteur | écart | cause |
|---|---|---|---|---|---|
| Mobile 390 | 390 × 2086 | 390 × 2086 | **0** | **0,52 %** (4 266 px) | résidu : lissage du texte + bord des cercles |
| Tablette 834 | 834 × 2022 | 834 × 2022 | **0** | **0,55 %** (9 308 px) | idem |
| Desktop 1200 | 1200 × 2652 | 1200 × 2652 | **0** | **0,45 %** (14 178 px) | idem |
| Wide 1728 | 1728 × 1931 | 1728 × 1931 | **0** | **0,34 %** (11 250 px) | idem |

Triptyques : `.page-parity/equipe-v2/triptyques/equipe-{390,834,1200,1728}-figma-odoo-diff.png`.

**Les quatre hauteurs de bloc tombent au pixel sur celles des planches** (2086 · 2022 · 2652 · 1931),
et ce sont exactement les hauteurs de grille que la règle A3-2 a fait ÉCARTER du contrat comme témoins.
La hauteur se retrouve parce que la boîte est juste ; elle n'avait pas besoin d'être écrite.

### La cause qui a été trouvée par la mesure, et corrigée

Première passe de mesure : **390 → 0,52 % · 834 → 4,74 % · 1200 → 0,45 % · 1728 → 2,93 %.**
Le triptyque 1728 montrait, sur la PREMIÈRE rangée seulement, des anneaux rouges pleins et un nom
dédoublé d'une dizaine de pixels — un décalage VERTICAL, pas un défaut de contenu. Cause : le fait
code-only §3(2). Les deux largeurs saines étaient précisément les deux où toutes les cartes d'une rangée
ont la même hauteur (1200 : 415,33 partout ; 390 : les deux cartes de chaque rangée se replient pareil)
— ce qui **est la preuve de la cause, pas une coïncidence**. Après correction : 4,74 → **0,55 %** et
2,93 → **0,34 %**, et les hauteurs de carte du DOM retombent sur celles du dump (298,66 en Tablette,
452,50 en Wide).

### Sonde des boîtes — relevée, contre les valeurs attendues

| Écran | gouttière | largeur de contenu | colonnes | pistes | écarts | carte | Nom | Poste |
|---|---|---|---|---|---|---|---|---|
| 390 | 24 / 24 | **342** | **2** | 155 · 155 | 32 / 32 | 155 × 249 | 20/25 p400 | 14/20 p600 |
| 834 | 48 / 48 | **738** | **3** | 224,66 · 224,67 · 224,67 | 32 / 32 | 224,66 × 298,66 | 24/30 p400 | 14/20 p600 |
| 1200 | 56 / 56 | **1088** | **3** | 341,33 · 341,33 · 341,34 | 32 / 32 | 341,33 × 415,33 | 24/30 p400 | 16/20 p600 |
| 1728 | 89 / 89 | **1550** | **4** | 363,5 × 4 | 32 / 32 | 363,5 × 452,5 | 32/40 p400 | 20/25 p600 |

16 cartes, 32 images, **32 images chargées** aux quatre largeurs — la sonde compte les images
effectivement décodées, pas les balises. Gouttières, largeurs de contenu, comptes de colonnes, pistes,
écarts, largeurs et hauteurs de carte : **tous conformes au tableau de la source**. Typographie conforme
aux quatre rôles décidés en passe 1.

---

## 6. Test d'édition (étape 9) — FAIT

`.page-parity/equipe-v2/tools/edit-equipe.mts`, `PQR_ODOO_PORT=8087 PQR_DB_NAME=piqueray_pilote`,
rédacteur `editor@example.test`. **Un nom ET un poste** modifiés sur la première carte → enregistrement
**RPC 200** → relecture en PUBLIC → **originaux remis** (RPC 200), puis page recomposée pour garantir
qu'elle est exactement le descripteur, et **mesure refaite à l'identique** après remise.

- édition : `Cécilia Piqueray` → `Cécilia Piqueray (édité)`, `Gérante` → `Gérante (éditée)` — **les deux
  conservées** après enregistrement, relues en public ;
- remise : les deux valeurs d'origine, relues en public.

**Piège rencontré et corrigé, à ne pas redécouvrir** : un simple clic pose le curseur là où il tombe et
`End` ne sort pas du nœud texte d'un `<span>` en colonne flex — la première version du test a écrit
« Cécilia P (édité)iqueray » **au milieu du mot**, puis n'a pas su remettre l'original. Le geste juste est
un **triple-clic** (sélection du texte de la part) suivi de la frappe. C'est écrit dans l'outil.

---

## 7. À corriger à la source (Figma)

1. **Les 16 photos de survol sont UNE SEULE ET MÊME IMAGE — reproduite fidèlement, non corrigée.**
   Ré-vérifié par empreinte MD5 des 32 fichiers de `.page-parity/equipe-v2/photos/` : les 16 photos de
   repos donnent **16 empreintes distinctes**, les 16 photos de survol donnent **une seule**,
   `9682a58a77731eb8619463be352c675c`. C'est un portrait noir et blanc « fun » d'une seule personne
   (d'où le nom du plan, `funIa`). Quinze membres sur seize montrent donc, au survol, quelqu'un d'autre.
   **C'est un défaut de source, pas de modèle** : le contrat porte fidèlement deux plans, c'est le contenu
   du plan du dessous qui est faux. Le descripteur de page le dit en clair et ne référence **qu'un seul**
   asset `equipe_survol`, seize fois — ce qui produit **une seule** pièce jointe côté Odoo et rend le
   défaut lisible plutôt que dissimulé derrière seize copies. Les vrais portraits de survol sont à
   fournir par l'owner.
2. **Le plan `funIa` du master ne porte aucune propriété de composant pour ses pixels** (trou A5 connu,
   matrice ligne 91) — c'est pour cela que la route arrive à l'exécution et non par le contrat. Rien à
   corriger, mais c'est la raison pour laquelle les quatre routes de l'échantillon sont vides.

---

## 8. Bloqué / à trancher (demande l'orchestrateur ou l'owner)

1. **Le verrou / digest — orchestrateur.** `npm run odoo:module:check` sort **22 passés / 1 échoué**, la
   seule ligne rouge étant « les transcriptions de versions concordent avec le lock :
   `components.xml : ds.equipe 2.0.0 ≠ lock 1.2.0` ». Attendu : `inputs.lock.json` est interdit à l'agent.
   Le `data-ds-graph-digest` du bloc **n'a pas été touché** alors que le graphe a changé (six props
   neuves) — il appartient à l'orchestrateur, comme `version_guard.js`, `scan-saved-versions.ts` et la
   fixture `version-drift/cases.json`. **Relevé et non supposé** : `version_guard.js` porte encore
   `"ds.equipe": "1.2.0"` et `inputs.lock.json` ne connaît ni `ds.member-card@2.1.0` ni
   `ds.member-picture@1.4.0` — les deux fichiers sont intacts de ma part (leur diff de travail vient des
   vagues précédentes, il ne mentionne aucun des trois contrats de la chaîne Équipe). **Trois re-pins
   restent donc à faire côté orchestrateur** : le verrou, le garde de versions et le digest du bloc.
2. **`compose_page.py` a été étendu — à relire.** La collection de membres n'était couverte par AUCUNE
   branche du composeur : `fill_list` ne connaissait que `data-pqr-carte-list` et `data-pqr-review-list`,
   et la clé `images` d'une section ne vise que la PREMIÈRE part correspondante — donc une seule des seize
   cartes. Trois ajouts, tous génériques et sans nom de composant en dur, dans l'esprit de la docstring du
   fichier : (a) `data-pqr-member-list` / `data-pqr-member-blueprint` rejoignent la liste d'attributs ;
   (b) `KEY_TO_PARTS` reçoit `nom → member-name` et `poste → member-role` ; (c) une carte peut porter une
   clé `images` (part → asset), parce qu'une carte membre empile **deux** plans photo. La clé `image`
   existante est inchangée. Aucun autre descripteur de page n'est affecté.
3. **Aucune clause `prefers-reduced-motion`** — constat repris de la passe 1, inchangé : sa place est le
   contrat de l'atome, pas la feuille Odoo, sous peine de divergence qu'aucune porte ne surveille.
4. **La feuille `responsive/equipe.pqr.css` échappe à deux instruments**, comme les dix-sept autres :
   `build-derivation-report.ts` ne lit pas `responsive/`, et `adaptation-registry.json` n'a aucune entrée
   pour ces zones. Précédent suivi plutôt que convention inventée. Constat déjà au mode d'emploi, partie B.
5. **`npm run eval` n'a pas été lancée** — interdite à l'agent (A0).

---

## 9. Fichiers touchés

| Fichier | Ce qui change |
|---|---|
| `contracts/equipe.contract.json` | 1.2.0 → **2.0.0** : axe `presentation`, gouttière par écran, colonnes 2·3·3·4, 4 champs photo dans `items`, échantillon à six champs, ancres du set v2, descriptions |
| `contracts/member-card.contract.json` | 2.0.0 → **2.1.0** : props `imageSurvolUrl` / `imageSurvolAlt`, threadées à l'instance |
| `contracts/member-picture.contract.json` | 1.3.0 → **1.4.0** : props `srcSurvol` / `altSurvol`, posées en `attrs` sur la part `funIa` ; `dumpedAt` rafraîchi au 2026-09-07 (clé et nœud confirmés inchangés par le dump v1.8) |
| `integrations/odoo/config/equipe.authoring.json` | toutes les épingles aux trois nouvelles versions + **5 décisions neuves** : `equipe-presentation` (`fixed-by-composition`), `member-image-survol-url` / `-alt` (`controlled`), `member-picture-src-survol` / `-alt-survol` (`fixed-by-composition`) |
| `integrations/odoo/config/figma-panels.json` | panneaux `equipe` 2.0.0 et `member-card` 2.1.0 |
| `integrations/odoo/addons/piqueray_ds/views/components.xml` | `data-ds-contract-version` du bloc → 2.0.0 ; `member_picture` rend le plan `funIa` avec `src` et `alt`. **`data-ds-graph-digest` NON touché** |
| `integrations/odoo/addons/piqueray_ds/static/src/css/responsive/equipe.pqr.css` | **NOUVEAU** — zones `ODOO-EQUIPE-V2-GRILLE` et `ODOO-EQUIPE-V2-CELLULE-CENTREE` |
| `integrations/odoo/addons/piqueray_ds/__manifest__.py` | la feuille au bundle, après `member-card.pqr.css` |
| `integrations/odoo/authoring/compose_page.py` | la collection de membres rejoint `fill_list` ; clé `images` par carte (voir §8.2) |
| `integrations/odoo/authoring/pages/equipe-test.json` | **NOUVEAU** — la page de mesure, 16 membres, 17 assets |
| `integrations/odoo/authoring/assets/equipe_{01..16}.jpg`, `equipe_survol.jpg` | **NOUVEAUX** — JPEG qualité 82 à 364 px de large (largeur du cadre), 22–37 ko pièce |
| `.page-parity/equipe-v2/tools/{capture-equipe,survol-equipe,edit-equipe}.mts` | **NOUVEAUX** — capture avec refus de boîte dégénérée + sonde, vérification du survol, test d'édition (hors git) |
| `.page-parity/equipe-v2/{captures,triptyques}/` | **NOUVEAUX** — 4 captures, 4 triptyques (hors git) |
| `specs/tiny/equipe-v2/equipe.md` | ce journal |
| *(généré par `npm run build`)* | `src/components/{Equipe,MemberCard,MemberPicture}*`, `core/samples/*`, `catalog/*`, `figma-sync/*`, `static/src/css/generated/components.pqr.css`, `derivation-report.json`, `figma_links.js` |

**Non touchés, volontairement** : `tokens/` (aucun mint), `contracts/named-literals.registry.json`,
tout autre contrat, `inputs.lock.json`, `version_guard.js`, `scan-saved-versions.ts`, `evals/`,
`figma-sync/` (sources), `core/`, `packages/schema`, `parity/baseline.json`, Figma.

---

## 10. État des portes (toutes lancées, dans l'ordre)

| Porte | État |
|---|---|
| `npm run build` | **VERTE** (exit 0) — 42 composants, `derivation-report` compris (86 blocs) |
| `npm run geometry:gate` | **VERTE** (exit 0) — 42 contrats · 422 références gouvernées · **0 valeur invisible** |
| `npm run odoo:authoring:check` | **VERTE** (exit 0) — « Toutes les configs couvrent leur graphe. » |
| `npm run odoo:module:check` | **ROUGE sur 1 ligne, la seule attendue** — 22 passés, 1 échoué : `components.xml : ds.equipe 2.0.0 ≠ lock 1.2.0`. Le verrou appartient à l'orchestrateur (§8.1) |
| `npm run emitters:check` | **VERTE** (exit 0) — 42 contrats × 2 émetteurs + registre |
| `npx tsc --noEmit` | **VERTE** (exit 0) — 0 erreur (elle a d'abord été rouge : voir §2) |
| `npx tsc -p tsconfig.build.json` | **VERTE** (exit 0) |
| `npm run parity` | **VERTE** (exit 0) — « No new drift », 19 constats acquittés. **Aucun patch accepté, `baseline.json` intact**, aucun constat sur Equipe / MemberCard / MemberPicture |
| `npm run eval` | **non lancée** — interdite à l'agent (A0) |

## 2026-09-08 — le set Équipe n'était instanciable par rien, et la cause est dans `ds.member-picture`

**Découvert en montant les 4 vues « À Propos »** (première utilisation du set : il avait **0 instance** depuis sa
création — c'est exactement pour ça que personne ne l'avait vu).

### Le défaut, prouvé quatre fois plutôt qu'argumenté

Les deux plans photo de `MemberPicture` (`funIa`, `normal`) étaient tous deux `layoutPositioning: ABSOLUTE` avec
contraintes STRETCH — l'orthographe que le dépôt déclare lui-même pour `position:absolute; inset:0`
(`docs/FIGMA-CAPABILITY-MATRIX.md`, et `applyInsetOverlay` dans `core/emit-figma-script.ts`, qui **redimensionne**
ces plans au moment du dessin). Or ce redimensionnement n'existe qu'au dessin :

| geste | résultat |
|---|---|
| instance fraîche d'une variante (cartes 155) | plans à **364** |
| `resize()` de l'instance | parent 155, plans **toujours 364** |
| `resize()` / `resizeWithoutConstraints()` des plans | **sans effet, en silence** |
| reposer leur x/y | **refusé** : `This property cannot be overridden in an instance: relative-transform` |
| **cloner** une instance correcte | plans à 364 |

Conclusion : **une instance n'hérite pas la taille solvée de ses enfants absolus.** Toutes les autres sections de la
vague passent parce que leurs enfants sont EN FLUX ; `MemberPicture` est le seul composant du DS instancié à une
taille ≠ celle de son master (155 / 225 / 341 / 364 selon l'écran). Redessiner le master par le générateur ne
réparerait rien : `figma-sync/13-memberpicture.js` repose exactement les deux `insetOverlay`.
Voie « grille Figma » (deux plans dans une même cellule) : **refusée par Figma**, cellule occupée.

### La réparation (canevas, version nommée « 031 — avant réparation MemberPicture (plan visible en flux) »)

Dans les DEUX variantes du set `MemberPicture` `274:2389` : **le plan VISIBLE de l'état passe en flux, FILL/FILL**
(`normal` en Defaut, `funIa` en Survol), l'autre reste absolu derrière, et la racine **clippe** —
`clipsContent: false` → `true`, ce que le contrat demandait déjà (`overflow: hidden` dans ses deux `stylesWhen`).
Vérifié : le plan visible suit son parent à 155, 225, 341 et 364. **115 instances avant, 115 après.**

### Un défaut de plus, trouvé par la mesure et réparé au passage

Sur la page légataire « À Propos », `MemberPicture` fait **408** et son plan photo faisait **364** : un croissant gris
de 44 px (le lavis technique `#D9D9D9`) était visible à droite et en bas de chaque portrait, sur la v1, depuis
toujours. Le plan en flux remplit désormais le disque. Capture avant/après dans la session.

### Ce qui reste ouvert (à trancher, pas fait)

- **Le générateur défera cette réparation** au prochain redessin du master (`applyInsetOverlay` repose les deux plans
  en absolu). Le correctif durable est côté émetteur : le plan visible d'un état doit rester en flux quand il est le
  seul contenu. C'est un travail de code (avec re-épinglage golden), pas de page. → à ouvrir en DW.
- Le contrat `ds.member-picture` 1.4.0 décrit les deux plans en `position: absolute` : le canevas s'en écarte
  maintenant pour le plan visible. Écart ASSUMÉ et nommé ici ; à porter dans la `description` de la part au prochain
  passage sur le contrat.
- L'axe Équipe en **Desktop (1200) : 3 colonnes, 2652 px de haut, soit plus haut que le Wide** (1891, 4 colonnes).
  Dessin du candidat, jamais validé à l'écran.
