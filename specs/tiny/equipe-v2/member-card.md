# Équipe v2 — passe 1 : l'atome et la molécule

**Agent de la passe 1, 2026-09-07.** Périmètre : `ds.member-picture` (atome) et `ds.member-card`
(molécule). `contracts/equipe.contract.json` n'a PAS été touché — c'est la passe 2.
Référence suivie : `docs/16-mode-emploi-composant-vers-odoo.md`, partie A.

Entrées reçues : `.page-parity/equipe-v2/{dumps/equipe-v2.dump.json, proposals/, planches/, photos/}`.

---

## 1. Sort de CHAQUE note de `figma-proposals.md`

### MemberPicture — **le contrat n'a PAS été modifié**, et c'est une décision

Le dump v1.8 du 2026-09-07 confirme l'atome à l'identique de ce que `contracts/member-picture.contract.json`
1.3.0 décrit déjà : set `274:2389`, clé `70fdd040214e23fd7b5709b1009638a711b4080f` (inchangés), deux plans
empilés de 364, rayon 500, fond `#d9d9d9`, `normal` en opacité 1 au repos et 0 au survol. **Aucun fait neuf.**
Toucher le fichier (ne serait-ce que pour rafraîchir `dumpedAt`) aurait imposé un bump de version et sa
propagation dans tous les miroirs Odoo, pour zéro fait. Le contrat reste donc **1.3.0, octet pour octet**.
Décision tranchée seule, listée au rapport.

| Note de la proposition | Sort |
|---|---|
| `semantics.element` par défaut `div` | déjà `div` au contrat, avec `provenance: extracted` — **rien à faire** |
| `root/funIa` et `root/normal` largeur/hauteur FIXES à 364 | **témoins, pas des jetons** (règle A3-2). Le contrat porte déjà `layout.width: fill` + `aspectRatio: 1` sur la racine et des plans en `position: absolute` calés sur `top/right/bottom/left: 0px` — la boîte appartient au parent. Proposition **écartée** |
| `root` hauteur dessinée FIXE 364 → jeton de racine minté | **témoin** (`referenceWidth` 364), **écarté**, même raison |
| prop `etat`, axe à deux valeurs gardé en ENUM | **déjà au contrat** depuis 1.3.0, liaison VARIANT `Etat` identique — **adopté tel quel** |
| MINTÉ `imported.member-picture.root.background-color` = `#d9d9d9` | **forme actuelle conservée** : le contrat porte `literals.background-color: "#D9D9D9"` avec sa raison écrite (lavis technique A5, pas une couleur Piqueray). Un jeton en ferait une couleur de marque, ce qu'elle n'est pas. `geometry:gate` reste vert (la couleur n'est pas un canal géométrique) |
| MINTÉ `imported.shared.size-500` = 500px | **forme actuelle conservée** : `literals.border-radius: "500px"` sur la racine et sur les deux plans. `border-radius` est **hors population** du `geometry:gate` (canal de trait, `extract/geometry-gate/gate.ts` l. 20-21) : aucune entrée de registre n'est requise, et il n'y en avait déjà aucune |
| MINTÉ `imported.shared.size-364` = 364px | **témoin**, écarté (voir ci-dessus) |
| MINTÉ `imported.member-picture.normal.opacity.{defaut,survol}` = 1 / 0 | **forme actuelle conservée** : portées en `stylesWhen` par valeur d'`etat`. Deux nombres sans unité, sans vocabulaire de jeton, déjà visibles à l'axe des props |

### MemberCard — contrat **1.4.0 → 2.0.0**

| Note de la proposition | Sort |
|---|---|
| `semantics.element` par défaut `div` | conservé du contrat actuel (`div`, `provenance: extracted`) |
| instance imbriquée `MemberPicture` LIÉE à `ds.member-picture` par clé de set | **adopté** — la part `MemberPicture` reste une part `component` sur `ds.member-picture` |
| props fixées de l'instance canonicalisées par les liaisons de l'enfant | **adopté** |
| prop `etat` de l'enfant suit l'axe `etat` du parent sur les 2 occurrences → `"{etat}"` | **adopté tel quel** — c'est le fait neuf de la vague ; l'instance recevait `"defaut"` figé jusqu'ici |
| `text/Nom` monte le style « Nom membre », non dérivé d'un jeton → typographie non proposée | **renommé à la main vers le rôle du DS** : `{typography.h3.size}` + `{typography.h3.line-height}` + `{font.weight.regular}` (décision owner du 2026-09-07). Vérifié dans `tokens/` avant d'être cité : h3 = 20/25 · 24/30 · 24/30 · 32/40 — **exactement** les 20·24·24·32 et 25·30·30·40 du brief |
| `text/Poste` monte le style « Poste membre », idem | **renommé vers** `{typography.overline.size}` + `{typography.overline.line-height}` + `{font.weight.semibold}`. Vérifié : overline = 14/20 · 14/20 · 16/20 · 20/25 — **exactement** les 14·14·16·20 et 20·20·20·25 du brief |
| prop `etat`, axe à deux valeurs gardé en ENUM | **adopté** (voir §3 pour le choix axe-de-prop contre canal `states`) |
| MINTÉ `imported.member-card.text-nom.line-height` = 25px | **renommé vers** `{typography.h3.line-height}` (25 EST la valeur mobile du rôle) |
| MINTÉ `imported.member-card.text-poste.font-size` = 14px | **renommé vers** `{typography.overline.size}` |
| MINTÉ `imported.member-card.text-poste.line-height` = 20px | **renommé vers** `{typography.overline.line-height}` |
| MINTÉ `imported.member-card.text-poste.font-weight` = 600 | **renommé vers** `{font.weight.semibold}` (jeton existant, valeur 600) — **déviation nommée**, voir §2 |
| MINTÉ `imported.member-card.text-nom.letter-spacing` = 0px · `text-poste.letter-spacing` = 0px | **non portés** : 0 est la valeur par défaut, et le contrat 1.4.0 ne les portait pas non plus. Aucun changement de rendu, aucune valeur invisible ajoutée |
| `max-width: {size.member-card.root}` proposé sur la racine | **écarté** : la largeur de racine dessinée (variable `size/member-card/root` = 364) est un **TÉMOIN** (règle A3-2). La racine garde `layout.width: fill` + `referenceWidth: 364`. Poser un plafond de 364 aurait figé la carte alors que la grille de la section lui donne 155 · 224,67 · 341,33 · 363,5 |
| `{typography.accroche.*}` proposé pour le Nom | **écarté** : c'est un rapprochement par valeur de l'extraction, pas le rôle décidé. Le rôle est **h3** (décision owner) |

**Faits repris du contrat 1.4.0 et non re-dérivés** : `semantics`, les props de contenu `nom` / `poste` et
leurs liaisons TEXT, les props photo `imageUrl` / `imageAlt` avec leur description de route A5, les ancres
`code`, `declared.text-align: center`, `category: molecule`.

---

## 2. Ce que le contrat porte, par écran

`ds.member-card` **2.0.0** — anatomie inchangée en structure (racine colonne centrée → `MemberPicture`, `text`
→ `Nom`, `Poste`). Ce qui change :

| Canal | 1.4.0 (les quatre écrans) | 2.0.0 Mobile | Tablette | Desktop | Wide |
|---|---|---|---|---|---|
| Nom — taille / interligne | 32 / 40 figés | 20 / 25 | 24 / 30 | 24 / 30 | 32 / 40 |
| Nom — graisse | Regular | Regular (FIXE) | Regular | Regular | Regular |
| Poste — taille / interligne | 16 / 20 figés | 14 / 20 | 14 / 20 | 16 / 20 | 20 / 25 |
| Poste — graisse | SemiBold | SemiBold (FIXE) | SemiBold | SemiBold | SemiBold |
| `text`, `Nom`, `Poste` — largeur | HUG | **remplie** | remplie | remplie | remplie |
| écart racine / écart texte | `space.16` / `space.8` | inchangés (liés aux variables `space/16` et `space/8` au dump) |
| `MemberPicture.etat` | `"defaut"` figé | **`"{etat}"`** — threadé |

**Version : MAJEURE (2.0.0).** Règle A3-9 : les ancres changent de set. La source passe du COMPONENT
`2074:2072` (set `0b23b8d87dfa08866cc767b34c18fedddf39a4d8`) au COMPONENT_SET `2777:31008`
(clé `758a8b0182f344cbb005b184713fb2dc0785b728`, `dumpedAt` 2026-09-07). C'est le **seul** motif de rupture :
aucune prop ne disparaît, aucune valeur d'enum ne se resserre, l'ajout d'`etat` serait un mineur à lui seul.

### Déviations nommées (deux, et ce sont les seules)

1. **La graisse du Nom ne suit pas le rôle h3.** Le rôle fait varier sa graisse (SemiBold en Mobile, Medium
   au-dessus) ; le nom est dessiné Montserrat **Regular** sur les deux variantes du set. La part porte donc
   `{font.weight.regular}`, FIXE. Taille et interligne suivent le rôle, la graisse non.
2. **La graisse du Poste ne suit pas le rôle overline.** Le rôle varie (Regular en Mobile/Tablette, Medium
   au-dessus) ; le poste est dessiné **SemiBold** partout. La part porte `{font.weight.semibold}`, FIXE.

Les deux sont écrites dans la `description` du contrat et dans celle de chaque part.

---

## 3. Pourquoi un axe de PROP et non le canal `states` — raisonnement, pas préférence

Les trois molécules voisines qui portent un état (`ds.product-card`, `ds.review-card`, `ds.carte-categorie`)
déclarent toutes `states: ["hover"]`. Elles le peuvent parce que leur survol est une **ombre** ou une
**couleur**. Ici le survol est un changement d'**opacité**, sur une part **non-racine** d'un composant
**imbriqué**. Deux refus, chacun lu dans le code plutôt que supposé :

- `core/emit-react.ts` l. 92 — `PART_STATE_CHANNELS = { color, background-color, border-color }`, et
  l. 957 refuse par nom tout autre canal sur une part non-racine. L'opacité en est exclue.
- une part `component` ne porte ni états ni faits déclarés (refus du référé : « component instance —
  declared facts cannot restyle it »). La part `MemberPicture` de la carte ne peut donc rien restyler.

L'axe VARIANT du canevas est la seule traduction fidèle — et la seule qui rende les deux états visibles sur
les **deux** surfaces (React et canevas), ce que `states` ne fait pas pour le canevas.

---

## 4. Faits code-only

**Un seul, et c'est le DÉCLENCHEUR du survol.** Le contrat sait dire CE QUI CHANGE (il porte les deux états,
et `components.pqr.css` émet déjà `.member-picture--etat-survol .member-picture__normal { opacity: 0 }`).
Ce qu'aucun canal du schéma ne sait dire, c'est QUAND : sur une page, le pointeur est sur la **carte**, pas
sur la photo, et rien ne dit « quand mon ancêtre est survolé, applique telle valeur de prop à mon instance
enfant ». Posé dans `static/src/css/responsive/member-card.pqr.css`, zone `ODOO-EQUIPE-V2-MEMBER-SURVOL` :

```css
.s_pqr_equipe [data-pqr-member-card]:hover .member-picture__normal { opacity: 0; }
```

Une seule déclaration, et c'est celle que le contrat dessine pour l'état survol. La transition de 300 ms vient
du contrat (`declared.transition` de la part `normal`) et n'est **ni recopiée ni modifiée**. Précédent exact :
règle (6) de la zone `ODOO-023-FOOTER-BRIDGE` (vague 032). Nommé dans la `description` du contrat et dans
celle de la part `MemberPicture`.

**Aucune règle par écran dans cette feuille, et c'est voulu** : la seule chose qui varie par écran sur cette
molécule est la typographie, et `tokens.pqr.css` porte déjà ses `@media` pour `--pqr-typography-h3-*` et
`--pqr-typography-overline-*` (vérifié : lignes 359-374, 423-435, 475-487, 527-539). Recopier une taille ici
serait une seconde source. Une molécule n'a pas d'axe présentation — cas AccordionRow.

---

## 5. Mesure

### 5a. Sonde des boîtes et de la typographie — FAITE, aux quatre largeurs

`.page-parity/equipe-v2/tools/probe-member-card.mts` monte le **DOM exact du gabarit QWeb**
`piqueray_ds.member_card` et les **feuilles Odoo servies** (`fonts` + `tokens` + `components` + la feuille
neuve), polices Montserrat embarquées en `data:` URI — sans elles les largeurs seraient celles d'une police
de repli et tout repli de ligne serait faux (piège vérifié : la première passe donnait des lignes uniques
partout, `document.fonts.check` à `false`).

Largeurs de carte : **forcées** par trois faits relevés, aucun supposé — (a) largeur de la grille au dump du
set Equipe : 342 · 738 · 1088 · 1550 ; (b) écart de grille 32 (variables `size/equipe/gap-colonnes` et
`gap-rangees`) ; (c) nombre de colonnes **compté sur les planches** : **2 · 3 · 3 · 4**. Le nombre de colonnes
appartient à `ds.equipe` (passe 2) : entrée de mesure ici, jamais une décision de cette passe.

| Écran | viewport | carte | photo | Nom | Poste |
|---|---|---|---|---|---|
| Mobile | 390 | 155 × 269 | 155 × 155 | 20/25, poids 400, centré — 2 lignes (50) | 14/20, poids 600 — 2 lignes (40) |
| Tablette | 834 | 224,66 × 318,66 | 224,66 × 224,66 | 24/30, poids 400 — 1 ligne (30) | 14/20, poids 600 — 2 lignes (40) |
| Desktop | 1200 | 341,33 × 415,33 | 341,33 × 341,33 | 24/30, poids 400 — 1 ligne (30) | 16/20, poids 600 — 1 ligne (20) |
| Wide | 1728 | 363,50 × 477,50 | 363,50 × 363,50 | 32/40, poids 400 — 2 lignes (50) | 20/25, poids 600 — 2 lignes (50) |

(Nom = « Cécilia Piqueray », Poste = « Collaboratrice admin & comptabilité », les deux plus longs de la page.)

**Les quatre tailles et les quatre interlignes sont exactement ceux de la décision owner.** Le texte est en
largeur remplie aux quatre écrans (largeur du texte = largeur de la carte, à la décimale). **Et le repli de
ligne concorde avec les planches** : « Cécilia Piqueray » sur deux lignes en Mobile et sur une ailleurs,
« Collaboratrice admin & comptabilité » sur deux lignes en Mobile, Tablette et Wide, sur une en Desktop —
c'est ce que montrent `Equipe-{390,834,1200,1728}.png`.

**Survol** : la règle code-only fait passer l'opacité du plan `normal` de **1 à 0**. Vérifié dans la sonde.

### 5b. Mesure au pixel bloc contre planche — **PAS FAITE, et voici pourquoi**

Écrit plutôt que laissé silencieux. Trois raisons, chacune vérifiée :

1. **Il n'y a rien à mesurer seul.** `member_card` et `member_picture` sont des gabarits **internes**
   (`check-module` : « 12 composants restent internes ») : aucun snippet posable, aucune page de test
   possible sans la section. La section `s_pqr_equipe` est `ds.equipe`, **passe 2**.
2. **Les planches sont des SECTIONS**, pas des cartes, et leur grille (2·3·3·4 colonnes, gouttière,
   écarts) est ce que la passe 2 va poser. Mesurer aujourd'hui mesurerait la grille v1, pas ma molécule.
3. **Le % serait dominé par des photos absentes.** La photo occupe 155/269 à 363,5/477,5 de la carte, soit
   **57 à 76 % de sa surface**. Le gabarit Odoo rend `imageUrl` vide et le plan `funIa` **sans `src` du
   tout** : la carte servie aujourd'hui montre deux cercles gris `#D9D9D9` là où la planche montre un
   portrait. Un chiffre annoncé dans ces conditions mesurerait l'absence de données — le défaut nommé de la
   spec 017.

La mesure au pixel de la carte **attend la passe 2** (section, page de test, photos). La sonde 5a couvre
entre-temps exactement ce que cette passe a changé, et elle en est indépendante.

---

## 6. À corriger à la source (Figma)

1. **La photo de survol est UNE SEULE ET MÊME IMAGE sur les 16 cartes.** Vérifié par empreinte MD5 des 32
   fichiers de `.page-parity/equipe-v2/photos/` : les **16 photos de repos sont toutes distinctes**
   (16 empreintes différentes), les **16 photos de survol partagent une seule et même empreinte**
   `9682a58a…` — celle de Cécilia. Quinze membres sur seize ont donc, au survol, le portrait de quelqu'un
   d'autre. C'est un défaut de source, pas un défaut de modèle : le contrat porte fidèlement deux plans, et
   c'est le contenu du plan du dessous qui est faux.
2. **Le style de texte « Nom membre » impose une graisse que le rôle h3 fait varier** (Regular fixe contre
   SemiBold→Medium), et « Poste membre » de même (SemiBold fixe contre Regular→Medium). Le contrat porte
   l'écart en déviation nommée ; si l'owner veut que la graisse suive le rôle, c'est une décision de source,
   sur les deux styles.

---

## 7. Bloqué / à trancher (demande l'orchestrateur ou l'owner)

1. **Le cliché de parité est périmé pour MemberCard, et `npm run parity` sort donc rouge sur 1 constat.**
   `[figma BEHIND] MemberCard.Etat — Contract prop "etat" has no VARIANT property on the Figma set`.
   Vérifié : `parity/snapshots/figma-components.json` date du **2026-09-07 18:29**, le set v2 a été relevé à
   **21:08** ; le cliché ne contient ni la clé `758a8b…` ni le nœud `2777:31008`, il ne connaît que l'ancien
   set `0b23b8…` avec ses deux seules propriétés `Nom` et `Poste`. La parité apparie par clé **puis par nom** :
   elle a apparié mon contrat à l'ancien set homonyme — le piège connu du mode d'emploi. **Aucun patch n'a été
   accepté, `parity/baseline.json` n'a pas été touché.** Rafraîchir le cliché demande le pont Figma :
   orchestrateur.
2. **Le verrou / digest.** `npm run odoo:inputs:check` est rouge sur `contracts/member-card.contract.json`
   (verrou 1.4.0, dépôt 2.0.0) — attendu, c'est l'orchestrateur qui re-pinne. Il l'est aussi sur
   `contracts/reassurances.contract.json` (dérive de **contenu** préexistante, pas de moi : je n'ai pas
   touché ce fichier).
3. **Le plan `funIa` n'a AUCUN canal d'autorité côté Odoo.** `ds.member-picture` porte `src` / `alt` pour le
   seul plan `normal` ; le plan du dessous — celui que le survol découvre — n'a ni prop ni attribut, et le
   gabarit QWeb rend `<img class="member-picture__funIa" alt=""/>` **sans `src`**. Conséquence mesurable : sur
   la page, survoler une carte fera disparaître le portrait pour ne montrer que le gris `#D9D9D9`. Ouvrir un
   canal demande une prop neuve sur `ds.member-picture` **et** sur `ds.member-card`, plus le QWeb et les
   verdicts d'édition de `ds.equipe` — qui est la passe 2. Non fait, non contourné : **à trancher**.
4. **Aucune clause `prefers-reduced-motion`.** La transition de 300 ms est déclarée dans le contrat de
   l'atome, donc servie aux deux surfaces. La neutraliser dans la seule feuille Odoo créerait une divergence
   qu'aucune porte ne surveille. Si la clause est voulue, sa place est le contrat (`declared`), pour toutes
   les surfaces à la fois. Non fait, nommé.
5. **La feuille `responsive/member-card.pqr.css` échappe à deux instruments**, comme les seize autres :
   `build-derivation-report.ts` ne lit pas `responsive/`, et `adaptation-registry.json` n'a aucune entrée pour
   ces zones (vérifié : la zone `ODOO-033-CARTE-EMPILE-SURVOL` de la vague 033 n'y est pas non plus). J'ai
   suivi le précédent plutôt que d'inventer une convention. Constat déjà inscrit au mode d'emploi, partie B.
6. **`components.xml` : rien à mettre à jour de mon côté.** Les gabarits `member_picture` et `member_card`
   sont internes et ne portent **aucun** `data-ds-contract-version` ; le seul attribut de version de la zone
   est celui de `ds.equipe` sur `s_pqr_equipe`, qui appartient à la passe 2. Aucun `data-ds-graph-digest`
   touché.

---

## 8. Fichiers touchés

| Fichier | Ce qui change |
|---|---|
| `contracts/member-card.contract.json` | 1.4.0 → **2.0.0** : prop `etat`, threadage `"{etat}"`, rôles h3 / overline, largeurs remplies, ancres du set v2, descriptions |
| `integrations/odoo/config/equipe.authoring.json` | 16 épingles `ds.member-card` 1.4.0 → 2.0.0 + **1 contrôle neuf** `member-card-state` (`fixed-by-composition`, `mechanism: none`) |
| `integrations/odoo/config/figma-panels.json` | épingle du panneau `member-card` 1.4.0 → 2.0.0 |
| `integrations/odoo/addons/piqueray_ds/static/src/css/responsive/member-card.pqr.css` | **NOUVEAU** — zone `ODOO-EQUIPE-V2-MEMBER-SURVOL`, une déclaration |
| `integrations/odoo/addons/piqueray_ds/__manifest__.py` | la feuille au bundle, après `realisations.pqr.css` |
| `.page-parity/equipe-v2/tools/probe-member-card.mts` | **NOUVEAU** — la sonde du §5a (hors git) |
| `specs/tiny/equipe-v2/member-card.md` | ce journal |
| *(généré par `npm run build`)* | `src/components/MemberCard*`, `core/samples/*`, `catalog/*`, `figma-sync/*`, `static/src/css/generated/components.pqr.css`, `derivation-report.json`, `figma_links.js` |

**Non touchés, volontairement** : `contracts/member-picture.contract.json` (§1), `contracts/equipe.contract.json`
(passe 2), `tokens/` (aucun mint : tout s'est renommé vers des jetons existants),
`contracts/named-literals.registry.json` (aucune entrée requise ni retirée), `inputs.lock.json`,
`version_guard.js`, `scan-saved-versions.ts`, `evals/`, `parity/baseline.json`, `views/components.xml`.

---

## 9. État des portes (toutes lancées)

| Porte | État |
|---|---|
| `npm run build` | **VERTE** — 42 composants générés, `derivation-report` compris (86 blocs) |
| `npm run geometry:gate` | **VERTE** — 42 contrats · 416 références gouvernées · **0 valeur invisible** |
| `npm run odoo:authoring:check` | **VERTE** — « Toutes les configs couvrent leur graphe. » |
| `npm run odoo:module:check` | **VERTE** — **23 passés, 0 échoué** |
| `npm run emitters:check` | **VERTE** — 42 contrats × 2 émetteurs + registre |
| `npx tsc --noEmit` | **VERTE** — 0 erreur |
| `npm run parity` | **ROUGE, 1 constat**, cliché périmé — voir §7.1. Aucun patch accepté, `baseline.json` intact |
| `npm run odoo:inputs:check` | **ROUGE** — attendu, verrou de l'orchestrateur (§7.2) |
| `npm run eval` | **non lancée** — interdit à l'agent (A0) |
