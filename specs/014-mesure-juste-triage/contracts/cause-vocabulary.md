# Contrat — Le vocabulaire de causes à six valeurs

**Spec** : FR-004, FR-011, FR-015 · **Décision** : [research.md](../research.md) D1

Ce document est l'autorité de la correspondance que FR-004 rend vérifiable :
**le vocabulaire publié et l'énumération de l'instrument se correspondent
valeur pour valeur, dans les deux sens.** Une valeur publiable que l'instrument
ignore, ou une classe d'instrument non publiable, est un état refusé.

---

## 1. Les six valeurs

| slug (instrument) | libellé publié | ce que la valeur affirme | où la ligne part ensuite |
|---|---|---|---|
| `contract-geometry` | géométrie du contrat | le contrat porte une géométrie fausse, ou ne la porte pas du tout | **015** — géométrie gouvernée |
| `image-boundary` | frontière image (limite A5) | les pixels d'image ne sont pas transportés, par limite déclarée | **017** — limite nommée jusque-là |
| `rendering` | rendu/rastérisation | Chromium et Figma dessinent le même fait différemment | plancher assumé, jamais toléré au score |
| `engine` | défaut moteur | nos émetteurs rendent le contrat de travers | défaut suivi, ouvert |
| `instrument` | défaut d'instrument | la mesure elle-même est en cause | corrigé **ici** (DW-006) |
| `figma-source` | défaut de source Figma | la source dessine autre chose qu'elle ne devrait | **016** — canvas vrai |

**Type**, dans `extract/figma/visual-parity/triage.ts` :

```ts
export type CauseSlug =
  | 'contract-geometry'
  | 'image-boundary'
  | 'rendering'
  | 'engine'
  | 'instrument'
  | 'figma-source';

/** La table de publication EST le contrat FR-004 : bijection slug ↔ libellé. */
export const CAUSE_LABELS: Record<CauseSlug, string> = { … };
```

### Vérification (fixture `triage-vocabulary-check.ts`)

1. `CAUSE_LABELS` a exactement six entrées, une par membre de `CauseSlug`.
2. Les six libellés sont deux à deux distincts — donc la table est **bijective**,
   et pas seulement totale.
3. Toute règle de `TRIAGE` porte un `class` membre de `CauseSlug`.
4. Toute valeur publiée dans le rapport se retrouve dans `CAUSE_LABELS`.
5. **Aucun slug retiré** (`capture-gap`, `renderer`, `harness`, `design`) ne
   subsiste dans une surface publiée — `triage.ts`, `visual-parity/REPORT.md`,
   `site/src/pages/how.ts`. Une assertion textuelle sur la source, sans réseau ni
   navigateur : la bijection ne vaut que là où le vocabulaire se lit.

---

## 2. D'où viennent les six valeurs

Cinq existaient sous d'autres noms (`triage.ts:32` :
`engine | capture-gap | renderer | harness | design`). Une est nouvelle.

| slug | origine | note |
|---|---|---|
| `engine` | `engine` | inchangé, même sens |
| `rendering` | `renderer` | renommage seul |
| `instrument` | `harness` **+** la part « limites de canal » de `capture-gap` | voir §3 |
| `image-boundary` | la part « frontière image A5 » de `capture-gap` | voir §3 |
| `figma-source` | `design` | **déclaré depuis toujours, jamais employé** — c'est la valeur que la clarification de la spec désignait |
| `contract-geometry` | **nouveau** | aucune classe existante ne disait « le contrat porte la mauvaise géométrie » |

> `design` était documenté dans `triage.ts` (« the FIGMA side draws something
> else ») et présent dans l'union de types, mais **aucune des 25 règles ne
> l'employait**. Le relevé est en recherche §D1.

---

## 3. La coupe de `capture-gap`, argumentée

`capture-gap` recouvrait deux choses distinctes que le vocabulaire à six valeurs
sépare :

- **La frontière image A5** — Figma peint une photo que le contrat ne transporte
  pas (member-card, product-card, realisation). C'est une limite **déclarée**
  du modèle, dont la levée est le chantier 017 → `image-boundary`.
- **Les limites du canal de capture** — un dump qui ne porte pas la géométrie
  VECTOR, ni le `lineHeight`, ni les internes d'un enfant réduit à un stub.
  Ce n'est ni la géométrie du contrat, ni le moteur, ni la source Figma : c'est
  l'instrument de mesure qui ne peut pas voir le fait → `instrument`.

Les règles concernées par la seconde branche portent **toutes** sur des sujets
de `LEGACY_SUBJECTS` (kits externes mis en quarantaine, jamais exécutés par le
gate vivant). Chacune reçoit, à la re-classification, une note d'une ligne
disant d'où elle vient. **Aucune n'est supprimée** — la règle d'honnêteté du
dépôt vaut aussi pour les règles en quarantaine.

---

## 4. Re-classification des 25 règles existantes

Statut : `live` = le sujet est dans `PARITY_SUBJECTS` · `legacy` = quarantaine
(`LEGACY_SUBJECTS`) · `morte` = le sujet n'existe plus nulle part.

**22 règles sont re-classées dans `TRIAGE` ; les 3 mortes en sortent** vers
`RETIRED_RULES` (§4.2) — c'est ce que signifie le `—` de la colonne « → slug ».

| # | sujet | variante | classe actuelle | → slug | statut |
|---:|---|---|---|---|---|
| 1 | member-card | (toutes) | capture-gap | `image-boundary` | live |
| 2 | product-card | (toutes) | capture-gap | `image-boundary` | live |
| 3 | realisation | (toutes) | capture-gap | `image-boundary` | live |
| 4 | carte | (toutes) | engine | **à trancher par le re-test** | live |
| 5 | field | (toutes) | engine | `engine` | live |
| 6 | tab | (toutes) | renderer | `rendering` | live |
| 7 | button | `/Property 1=Link/` | renderer | `rendering` | live |
| 8 | button | (toutes) | renderer | `rendering` | live |
| 9 | heading | (toutes) | renderer | — | **morte** |
| 10 | checkbox | (toutes) | renderer | `rendering` | live |
| 11 | switch | (toutes) | renderer | — | **morte** |
| 12 | shoelace-button-group | `/type=default/` | capture-gap | `instrument` | legacy |
| 13 | shoelace-button-group | `/type=primary/` | capture-gap | `instrument` | legacy |
| 14 | shoelace-tooltip | (toutes) | capture-gap | `instrument` | legacy |
| 15 | eventz-button | `/variant=bare…/` | capture-gap | `instrument` | legacy |
| 16 | eventz-button | `/state=focus/` | renderer | `rendering` | legacy |
| 17 | eventz-button | `/variant=secondary…/` | harness | `instrument` | legacy |
| 18 | eventz-button | (toutes) | capture-gap | `instrument` | legacy |
| 19 | cbds-tooltip | `/pointer=true/` | capture-gap | `instrument` | legacy |
| 20 | cbds-tooltip | (toutes) | renderer | `rendering` | legacy |
| 21 | cbds-dialog | `/size=small-vertical/` | capture-gap | `instrument` | legacy |
| 22 | cbds-dialog | (toutes) | renderer | `rendering` | legacy |
| 23 | cbds-button-brand-primary | `/state=focus/` | renderer | `rendering` | legacy |
| 24 | cbds-button-brand-primary | (toutes) | renderer | `rendering` | legacy |
| 25 | badge | (toutes) | renderer | — | **morte** |

### 4.1 La règle n° 4 (`carte`) n'est pas pré-tranchée

Sa cause écrite mélange deux choses : « IMAGE pixels are outside the contract
transport » (frontière image) **et** « the two layouts still need distinct image
sizing; Reassurance also lacks its measured shadow/alignment » (défaut moteur ou
géométrie de contrat). Sous un vocabulaire où une ligne porte **exactement une**
cause, elle doit être re-mesurée avant d'être re-classée. C'est précisément ce
que FR-012 impose à toute cause héritée, et l'inscrire ici comme `engine` par
reconduction serait la faute que 014 existe pour supprimer.

### 4.2 Trois règles mortes — un constat, pas un ménage

`heading`, `switch` et `badge` visent des contrats **supprimés à la reconversion
Piqueray** : aucun n'existe dans `contracts/`, aucun n'est sujet de parité (ni
live, ni quarantaine). Ces trois règles ne peuvent donc **jamais** s'appliquer.

Elles quittent `TRIAGE` pour une constante exportée `RETIRED_RULES` de
`triage.ts`, conservant leur sujet, leur classe d'origine et le motif de leur
mort, et sont publiées comme telles dans le rapport de clôture — une cause qui ne
peut plus rien causer est une donnée, pas un déchet.

**Pourquoi une constante et non un `—` dans la table.** Les laisser dans `TRIAGE`
sans slug contredirait la propriété 3 de la fixture (toute règle porte un `class`
membre de `CauseSlug`) ; leur inventer un slug les ferait compter dans la sortie
dimensionnante de FR-011, où elles n'ont rien à faire ; les supprimer
contredirait la règle d'honnêteté du dépôt. La constante tient les trois. Leur
retrait définitif reste une décision explicite, pas un effet de bord du
re-classement.

---

## 5. Extension du vocabulaire

Le vocabulaire est **fermé**. Il ne s'étend que par décision explicite consignée,
jamais par une catégorie « divers » ni par une valeur fourre-tout.

Une ligne qui n'entre dans aucune des six valeurs **reste `UNTRIAGED` et la
clôture est refusée** (FR-004, US2 scénario 3). C'est la seule issue : il n'y a
pas de septième case, et l'attente d'une décision n'est pas une cause.
