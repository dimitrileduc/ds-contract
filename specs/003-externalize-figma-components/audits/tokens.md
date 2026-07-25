# Audit — Fondation de tokens (Phase T, T026)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — `figma_get_variables` (format `full`,
`refreshCache: true`) + `figma_get_text_styles`. Lecture seule, aucun geste mutant.
**Périmètre** : la fondation (Variable Collections + Text Styles), pas les 9 maquettes
(scan par bloc = T0/phases 7-8).

## Structure

| Collection | Mode(s) | Variables | Contenu |
|---|---|---|---|
| `Primitives` (`VariableCollectionId:4:26`) | `Value` | 35 | 12 couleurs, `nav/state` (STRING), `opacity/base`, famille/tailles/poids Montserrat, `space/*`, `radius/32`, `border-width/*` |
| `Semantic` (`VariableCollectionId:2027:975`) | `Light` | 24 | `typography/<titre-1..6\|paragraphe\|lead>/{family,size,weight}` — 8 groupes × 3, tous des **alias** vers `Primitives` |

8 **Text Styles** Figma (objets de style, distincts des variables) : Titre 1-6,
Paragraphe, Lead — tous `Montserrat`, tailles 16-48px, `description` vide (les 8
correspondent 1:1 aux 8 groupes `typography/*` de `Semantic`).

**Total fondation mesurée** : 35 variables (Primitives) + 24 variables (Semantic, des
alias) + 8 text styles = cohérent avec « 14 variables + 8 styles » de la spec si on
compte les 14 **primitives visibles/nommées par l'owner** (12 couleurs + nav/state +
opacity) séparément des 21 variables typographiques (family/size/weight × 7 tailles,
etc. — infrastructure, pas des choix de palette) et des 5 `space`/`radius`/`border-width`
(également infrastructure). Aucune divergence de fond, juste un niveau de comptage
différent — noté pour ne pas laisser un chiffre invérifié.

## Les 3 odeurs nommées (research.md R10) — statut vérifié live

### 1. `space` / `radius` nommés par valeur — **ACTIF**

| Nom live | Valeur | Scope |
|---|---|---|
| `space/0` | 0 | WIDTH_HEIGHT, GAP |
| `space/4` | 4 | WIDTH_HEIGHT, GAP |
| `space/10` | 10 | WIDTH_HEIGHT, GAP |
| `space/16` | 16 | WIDTH_HEIGHT, GAP |
| `space/32` | 32 | WIDTH_HEIGHT, GAP |
| `radius/32` | 32 | CORNER_RADIUS |

Le nom **est** la valeur en px — un rename futur qui changerait la valeur casserait
silencieusement tous les noms (`space/16` valant autre chose que 16 serait un mensonge).
Origine confirmée par `tokens/primitives.tokens.json` ($description : « Authored from
the Button canvas geometry (dump v1.5) ») — ces 6 variables portent aujourd'hui
uniquement le Bouton (hors périmètre FR-001), mais **seront reliées par binding** aux
futurs atomes/molécules de cette spec → renommer maintenant, avant que l'usage ne se
multiplie, coûte moins cher qu'après.

### 2. `orange-12` / `orange-42` mintés — **ACTIF**

| Nom live | Couleur | Alpha | Lecture |
|---|---|---|---|
| `color/orange-12` | `#F49400` | 0.1216 (≈12 %) | nom = % d'opacité |
| `color/orange-42` | `#F49400` | 0.4196 (≈42 %) | nom = % d'opacité |

Même défaut que ci-dessus : le nom encode une valeur, pas un rôle. **Usage côté repo** :
`grep` sur `contracts/` et `tokens/semantic.tokens.json` — **aucune référence** ; ces
deux primitives ne sont aliasées par aucun token sémantique et ne sont bindées à aucun
contrat aujourd'hui.

**Usage côté canvas — mesuré 2026-07-24** (scan bindings `boundVariables.color` sur
fills+strokes, 2 pages / 2314 nœuds, `Assets` + `Pages`) :

| Page | Node | Type | Binding |
|---|---|---|---|
| `Assets` | `28:201` « Orange 12 » (dans groupe **Couleurs**) | RECTANGLE, fill | `orange-12` |
| `Assets` | `28:200` « Orange 42 » (dans groupe **Couleurs**) | RECTANGLE, fill | `orange-42` |

**2 usages, zéro ailleurs** — les deux sont de simples **rectangles-échantillon** dans
la section de référence couleurs d'`Assets`, aucun usage fonctionnel sur un composant
ou une des 9 maquettes. Ce ne sont pas des couleurs de rôle UI (overlay, hover, tint) —
juste des swatches de palette. Le rename n'a donc aucun rôle réel à deviner : c'est un
argument **en faveur** du suffixe alpha neutre (`color/orange/a12`/`a42`) plutôt qu'un
nom de rôle qui inventerait un usage inexistant.

### 3. `color/nav-state` en STRING — **DÉJÀ RÉSOLU (avant 003)**

Vérifié live : la variable s'appelle **`nav/state`** (`VariableID:86:403`),
`resolvedType: STRING`, valeur `"Transparent"`. Confirmé côté repo :
`tokens/primitives.tokens.json` porte `nav.state` (`$type: "string"`), avec description
« renamed 2026-07-23 from 'color/nav-state' ».

**Origine** : commit `38aee13` (2026-07-23 16:45:12, *« step(pre-flight): nav-state told
the truth »*), travail T037d de la spec **001** — le renommage a eu lieu **des deux
côtés** (variable Figma + token repo) avant même l'ouverture de 003, avec checkpoint de
version sauvegardé et bindings ré-vérifiés sur les 9 headers. Ce n'est pas un report
pré-arbitré en attente d'exécution : **c'est fait, mesuré ici comme fait**, pas supposé
depuis l'historique git seul.

**Conséquence pour T027** : rien à proposer ni à reporter pour cette odeur — une entrée
`anomalie-tranchee` de constat suffit (documenter que l'odeur listée par R10 est déjà
éteinte, pour que le journal ne laisse pas croire à un report en attente).

## Observations hors périmètre des 3 odeurs (signalées, non bloquantes)

- Les 8 Text Styles ont tous une `description` vide — mineur, pas nommé par R10, pas de
  proposition automatique ici ; à trancher séparément si l'owner le souhaite.
- `font/line-height/22` porte le scope `ALL_SCOPES` alors que les variables voisines ont
  des scopes ciblés (`FONT_SIZE`, `FONT_WEIGHT`…) — noté, aucun symptôme observé.

Aucune anomalie bloquante trouvée. Rien n'a été corrigé silencieusement — les 2 odeurs
actives passent en proposition owner (T027) ; la 3e est actée comme déjà close.
