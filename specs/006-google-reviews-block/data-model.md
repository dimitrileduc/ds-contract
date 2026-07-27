# Data Model — 006 « Avis Google »

**Date** : 2026-07-25 · **Spec** : [spec.md](./spec.md) · **Recherche** : [research.md](./research.md)

Deux familles d'entités : les **documents versionnés** que la spec produit (les deux contrats, le
glyphe), et les **entités de processus** que la preuve manipule (occurrence, relevé, ledger,
verdict). Chaque champ non trivial porte sa contrainte et, quand elle existe, la limite nommée.

---

## 1. `ds.review-card` — la brique répétée

**Fichier** : `contracts/review-card.contract.json` · **`name`** : `ReviewCard` (PascalCase imposé —
il devient le nom du composant React *et* le nom du set Figma à la création) · **`category`** :
`molecule` · **`version`** : `1.0.0` · **`semantics`** : `{ element: "article", provenance:
"authored" }`.

**Ancres — obligatoires dès le premier commit** (R18 : le garde-fou « mauvais fichier » est éteint
quand `fileKey` est nul) :

```json
"anchors": {
  "figma": { "fileKey": "d9FYAUcqdcNtsuaMgLefvJ", "componentSetKey": null,
             "nodeId": null, "dumpedAt": "<date d'extraction de l'aplat>" },
  "code":  { "importPath": "src/components/ReviewCard", "export": "ReviewCard" }
}
```

### Props

| Prop | Type | Liaison Figma | Défaut | Rôle / contrainte |
|---|---|---|---|---|
| `auteur` | text | `TEXT` « Auteur » | requis ⇒ défaut chaîne obligatoire | nom affiché |
| `initiale` | text | `TEXT` « Initiale » | `"P"` | lettre de la pastille |
| `date` | text | `TEXT` « Date » | `"il y a 2 mois"` | date relative telle qu'affichée |
| `texte` | text | `TEXT` « Témoignage » | — | verbatim de l'aplat, ellipse comprise |
| `initialeVisible` | boolean | `BOOLEAN` « Avatar initiale » | `true` | affiche la pastille |
| `photo` | boolean | `BOOLEAN` « Avatar photo » | `false` | affiche l'avatar photo |
| `photoUrl` | text | `TEXT` « URL photo » | `""` | `src` côté code ; **inerte sur le canevas** (A5) |
| `photoAlt` | text | `TEXT` « Alt photo » | `""` | `alt` côté code |
| `verifie` | boolean | `BOOLEAN` « Vérifié » | `true` | marqueur de validation |
| `note` *(conditionnel)* | `{enum:["3","4","5"]}` | `VARIANT` « Note » | `"5"` | **n'existe que si la mesure trouve des comptes d'étoiles variables** (R7) |

**Règle de schéma appliquée** : une prop **scalaire** ne peut pas être `figma.kind:"NONE"` — c'est
réservé aux props `arrayOf` (`core/emit-react.ts:812`). Toutes les props ci-dessus ont donc une
manifestation canevas réelle, `photoUrl` comprise (une propriété TEXT qui porte une URL).

### Anatomie (mono-racine — imposé par `single-root-golden-invariant`)

```
root                      article, colonne, auto-layout pur
├─ entete                 rangée
│  ├─ avatarInitiale      visibleWhen initialeVisible ; pastille + `initiale`
│  ├─ avatarPhoto         element:"img", attrs{src:"{photoUrl}", alt:"{photoAlt}"},
│  │                      visibleWhen photo
│  └─ identite            colonne
│     ├─ auteur           content:{prop:"auteur"}
│     └─ date             content:{prop:"date"}
├─ notation               rangée — 5 × icon{asset:"star", size:20}
│                         (parts 4 et 5 gouvernées par visibleWhen si `note` existe)
├─ temoignage             content:{prop:"texte"}
└─ verification           visibleWhen verifie ; icon{asset:"check"} + libellé
```

### Trois endroits où le schéma contrarie le design — workaround et limite

1. **`visibleWhen` n'a pas de négation.** « Pastille *sauf si* photo » est inexprimable : `equals`
   est réservé aux enums, les booléens sont « vrai = visible ». En faire un axe d'enum
   fonctionnerait — mais les champs **enum par item** sont refusés par `repeat`
   (`emit-react.ts:692`), donc les 5 cartes de la section partageraient un seul mode d'avatar, alors
   que le fait mesuré est **4 initiales + 1 photo**.
   → **Workaround** : deux booléens indépendants, mutuellement exclusifs **par convention**.
   → **Limite, à écrire dans les deux `description` de props et à épingler par une éval** : le
   schéma **n'impose pas** l'exclusion — les deux à `true` rendent les deux avatars, les deux à
   `false` rendent une boîte vide. C'est le prix à payer pour garder la variation par item.

2. **L'étoile gouvernée est orange intrinsèque** (`assets/icons/star.svg` cuit `#F98A0B` ; `icon`
   n'a aucun canal de teinte). Une étoile grise ou demie est inexprimable.
   → **Workaround** : la note est un **compte d'étoiles dessinées**, pas un état de remplissage.
   → **Limite** : notes < 3 et demi-étoiles inexprimables ; et `note`, étant un axe de variante, ne
   peut pas varier par item dans le `repeat` de la section. **Si la mesure montre 5/5 partout,
   supprimer `note`** — 5 étoiles fixes, une limite nommée, zéro axe.

3. **`element:"img"` peint un aplat `#D9D9D9` sur le canevas** et pose `imgPlaceholder: true` → une
   note `†` en légende du composant. **Trou A5, non refermé par cette spec** (R6).

### Réemploi (FR-007)

`star` (registre v1.1.0) ; `check.svg` en **glyphe interne non enregistré**, légal par la classe D7
(`parity/diff.ts:809-833`). Net-new : `assets/icons/google.svg`, même classe D7 (R4).

---

## 2. `ds.google-reviews` — le bloc qui assemble

**Fichier** : `contracts/google-reviews.contract.json` · **`name`** : `GoogleReviews` ·
**`category`** : `section` · **`version`** : `1.0.0` · **`semantics`** :
`{ element: "section", provenance: "authored" }` · **mêmes ancres** que ci-dessus
(`importPath: "src/components/GoogleReviews"`).

**Périmètre** : le **rectangle de l'aplat seul** (1552 × ~328), **pas** le `GROUP`. L'instance de
Section-header reste un frère intact (FR-008). La boîte du master égale celle de l'aplat, qui est
aussi la région de mesure (R3) — et sa **hauteur est contrainte à la hauteur mesurée de l'aplat**
(R20, neutralité de hauteur).

### Props

| Prop | Type | Liaison Figma | Rôle |
|---|---|---|---|
| `noteGlobale` | text | `TEXT` « Note globale » | ex. « 4,8 » |
| `volume` | text | `TEXT` « Volume » | ex. « 127 avis » |
| `montrerControles` | boolean | `BOOLEAN` « Contrôles » | **seulement si des flèches sont mesurées** |
| `avis` | `arrayOf` | **`NONE`** (code-only) | la collection de cartes |

```json
{ "name": "avis",
  "type": { "arrayOf": { "auteur":"text","initiale":"text","date":"text","texte":"text",
                         "initialeVisible":"boolean","photo":"boolean",
                         "photoUrl":"text","photoAlt":"text","verifie":"boolean" } },
  "bindings": { "figma": { "kind": "NONE" }, "code": { "prop": "avis" } } }
```

Chaque champ nomme **par nom** une prop scalaire de `ds.review-card` de type identique — c'est le
contrat de `repeat` (`emit-react.ts:674-694`). `kind:"NONE"` est **obligatoire** pour un `arrayOf` et
**refusé** pour un scalaire.

### Anatomie (mono-racine)

```
root                      section, colonne, auto-layout pur, hauteur = hauteur de l'aplat
├─ resume                 rangée, space-between
│  ├─ marque              icon{asset:"google"}              ← glyphe interne D7
│  ├─ notation            5 × icon{asset:"star"} + content noteGlobale
│  └─ volume              content:{prop:"volume"}
├─ cartes                 rangée, gap
│  └─ carte               repeat{itemsProp:"avis", sample:[…5 génériques…]}
│                         + component{id:"ds.review-card"}
└─ controles              visibleWhen montrerControles ; 2 flèches
                          DESSINÉES EN PARTS (frame + icon chevron), JAMAIS ds.button
```

> ⚠️ **Anatomie conditionnelle.** La part `repeat` ci-dessus suppose le verdict « 5/5 partout, axe
> `note` supprimé » (R7). Si la mesure (`tasks.md` T020) trouve des **notes hétérogènes**, le **repli
> R8** s'applique : les cartes deviennent des **instances frères explicites**
> (`component{id:"ds.review-card", props:{note:"…"}}` × N — les valeurs fixes *sont* autorisées dans
> `component.props`) et la part `repeat` **disparaît**, emportant avec elle le tableau vivant `avis`
> côté React. Trancher en T020 **avant** d'écrire le contrat (T033) ; T062 et T065 changent alors
> aussi de sujet.

### Deux points supplémentaires où le schéma contrarie le design

4. **`repeat.sample` est ce que le canevas dessine** — 5 instances réelles de `ReviewCard`
   (`emit-figma-script.ts:1837-1850`) — et FR-010 exige un master générique.
   → **Résolution, pas conflit** : `sample` porte des enregistrements **génériques** (« Prénom N. »,
   « il y a 2 mois », un témoignage neutre). Le master est générique **par construction**. Le
   contenu réel vit sur les 8 occurrences comme overrides de propriétés, et en code comme le tableau
   `avis` du consommateur. React mappe le tableau vivant ; html / react-inline / canevas rendent le
   `sample`.

5. **Aucune prop texte parente n'est transmissible à un enfant.** `mapDepProps`
   (`emit-figma-script.ts:1606-1635`) résout `"{parentProp}"` depuis la **map de substitution des
   variantes** ; une prop texte n'y figure pas et la résolution lève. Conséquence : le libellé du CTA
   éventuel de la barre-résumé **ne peut pas** être une prop de section transmise à un composant
   imbriqué — c'est une autre raison (avec R5) pour laquelle ce CTA est une **part**, dont le texte
   est un `content` de la section.

6. **Interdit dur : aucun `component`-ref vers `ds.button`** (R5). `findComponentByName("Button")`
   ne trouverait pas le master « Bouton » et **ferait échouer le script poussé**.

---

## 3. Entités de processus

### Occurrence
Une instance du bloc sur une maquette. **8 attendues**, à re-vérifier au re-scan post-005 — les node
ids de l'ère 003 sont périmés (R12).

| Champ | Source | Note |
|---|---|---|
| `maquette` | scan | nom de la frame |
| `groupNodeId`, `aplatNodeId` | scan post-005 | **jamais** les ids 003 |
| `bbox` `{x,y,w,h}` | scan | définit la **région** de mesure (R3) |
| `imageHash` | scan | **à lire sur les 8**, pas sur 2 (FR-006 : divergence nommée avant tout geste) |
| `hauteurPageAvant` | `exportAsync` | garde FR-012 |
| `versionIdCheckpoint` | `checkpoint.js` | label `006/adoption/<maquette>` |
| `ecartRegion`, `ecartHorsRegion` | `pages:compare --regions` | hors-région **doit** valoir 0 |

### Relevé de mesure — `measures/mesures-aplat.md`
Une ligne par valeur de design :
`rôle | lecture A | lecture B | valeur retenue | arbitrage | reçu (crop)`.
`arbitrage ∈ {accord 2/2, pas-gouverné, pixel, médiane-3}` (R9).
**Aucune valeur n'entre dans un contrat sans sa ligne.**

### Relevé de transcription — `measures/transcription-<maquette>.md`
**Remplace le ledger sur le côté aplat** (R21 : `customizations.js` renverra honnêtement
`entrees: []`, et un vert y prouverait *rien*).
`crop de la zone source ‖ chaîne saisie ‖ indice de confiance ‖ relecteur`, **revu en seconde passe**.
Tout fragment illisible est listé avec la valeur retenue à la place.

### Ledger — `ledger/google-reviews.json`
Format 003 (`contracts/customization-ledger.md`). **Complété à la main** pour le contenu imbriqué des
cartes (angle mort documenté de `customizations.js`) et pour les 8 fills photo
(`type: "image"`, `portePar: "fill IMAGE de la part avatarPhoto (override d'instance imbriquée, A5)"`).
**C'est la seule sauvegarde rejouable** si un amend devenait inévitable (R19, règle 2).

### Verdict — `proofs/<maquette>/verdict.{json,md}`
Sortie de `pages:compare`, enrichie des champs **optionnels en fin** `region`, `regionDiffCount`,
`regionPct`, `outsideDiffCount` — absents ⇒ verdict **byte-identique** à aujourd'hui.
**Règle dure** : une ligne `dimension-mismatch` ou `capture-failed` est un **STOP**, jamais un point
de donnée — elle vaut `diffCount: 0` sans crop, donc se lit à tort comme « parfait » (R20).

### Point de restauration
`saveVersionHistoryAsync(label)`, label `/^\d{3}\/[^/]+\/[^/]+$/` — la regex élargie **arrive au
merge de 005** (R16). `{label, versionId}` consigné dans `decisions.md`.

---

## 4. Ce qui ne change pas

- **Aucun changement de schéma** : `molecule` / `section` existent, `repeat`, `component`,
  `visibleWhen`, `arrayOf`, `attrs` existent. Le Principe VI n'est pas sollicité.
- **Aucun token nouveau** : rayons et espacements hors échelle passent en `literals` (dessinés) ; la
  séparation carte/fond se fait par couleur gouvernée, pas par ombre (R10).
- **Aucun artefact Bouton touché** : ni le contrat, ni `evals/harness.ts`, ni `subjects.ts` — R5
  dissout la dépendance.
- **`contracts/icons.registry.json` inchangé** : le logo Google est un glyphe interne D7 (R4).
