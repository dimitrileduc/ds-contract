# Phase 1 — Modèle de données : États d'interaction du Bouton

**Spec** : [spec.md](spec.md) · **Recherche** : [research.md](research.md) · **Date** : 2026-09-04

Trois entités, toutes déjà modélisées par le schéma. Cette vague les **remplit**,
elle n'en crée aucune.

---

## E1 — Jeton d'état (`color.etat.<style>.<canal>`)

Une couleur gouvernée, nommée par style et par canal, qui relie le contrat, le
fichier de conception et le site. C'est le **seul** canal par lequel une couleur
d'état peut voyager (FR-007).

### Structure

- **Emplacement** : `tokens/primitives.tokens.json`, groupe `color.etat`.
- **Forme** : DTCG `{"$type": "color", "$value": "{color.<primitive>}"}` — un
  **alias**, jamais une valeur littérale. La valeur vit dans la primitive.
- **Clé de style** : la valeur exacte de l'énuméré `variant` du contrat
  (`default`, `orange`, `blanc`, `outlineBlanc`, `link`, `outlineNoir`,
  `iconOnly`) — la substitution `{variant}` remplace le segment littéralement.
- **Canaux** : `fond-survol`, `libelle-survol`, `fond-presse`, `libelle-presse`,
  `anneau-focus`.

### Règle de complétude (contrainte dure)

> Pour chaque canal déclaré dans `anatomy.root.states`, les **sept** styles
> doivent porter une feuille.

Un jeton manquant est un **refus par nom** au build, pas un saut silencieux
(`core/emit-react.ts:1627`). Un style dont un canal ne change pas alias sa
valeur de repos — c'est explicite, traçable, et cela rend la matrice lisible
d'un coup d'œil.

### La matrice, valeurs arrêtées

| style | `fond-survol` | `libelle-survol` | `fond-presse` | `libelle-presse` | `anneau-focus` |
|---|---|---|---|---|---|
| `default` | `noir-bleute-survol` | `blanc` | `noir-bleute-presse` | `blanc` | `noir-bleute` |
| `orange` | `orange-survol` | `blanc` | `orange-presse` | `blanc` | `noir-bleute` |
| `blanc` | `gris-clair` | `noir-bleute` | `gris-presse` | `noir-bleute` | `blanc` |
| `outlineBlanc` | `blanc` | `noir-bleute` | `gris-clair` | `noir-bleute` | `blanc` |
| `link` | `transparent` | `noir-pur` | `transparent` | `noir-profond` | `noir-bleute` |
| `outlineNoir` | `noir-bleute` | `blanc` | `noir-bleute-survol` | `blanc` | `noir-bleute` |
| `iconOnly` | `noir-bleute` | `blanc` | `noir-bleute-survol` | `blanc` | `noir-bleute` |

**35 alias.** Chaque cellule est un `{color.<nom>}`.

### Primitives à minter — sept, dont deux posées par le plan

| Nom | Valeur | Origine | `$description` (obligatoire) |
|---|---|---|---|
| `color.noir-bleute-survol` | `#404245` | planche `2738:15904` | relevée le 2026-09-04 ; calcul (éclaircissement 12 %) antérieur à la pose — entorse §VIII écrite ici |
| `color.noir-bleute-presse` | `#4A4D51` | planche `2738:15904` | idem |
| `color.orange-survol` | `#E07C0A` | planche `2738:15904` | idem (assombrissement 10 %) |
| `color.orange-presse` | `#C76D09` | planche `2738:15904` | idem (assombrissement 20 %) |
| `color.gris-presse` | `#CFCFCF` | planche `2738:15904` | idem |
| `color.transparent` | `#FFFFFF00` | **posée par la spec 032** | complétude de la matrice : le style Link n'a pas de fond ; alias de sa valeur de repos, pas une couleur nouvelle |
| `color.noir-profond` | `#131416` | **posée par la spec 032** | pressé du style Link, arbitrage owner du 2026-09-04 ; entre `noir-bleute` et `noir-pur` |

`color.gris-clair` `#E0E0E0` **existe déjà** et est réutilisée telle quelle.

**Total de feuilles neuves : 42** — 7 primitives + 35 alias. Chacune devient une
variable dans la collection Figma `Primitives`, sinon la parité la classe
`figma-tokens | behind` (`parity/diff.ts:765`).

### Contraintes de validation

| Règle | Où elle est tenue |
|---|---|
| Une référence vers un jeton inexistant casse le build | `core/emit-react.ts:1627` |
| Une valeur littérale dans `states` est refusée par le schéma | `TokenRefSchema`, `contract-schema.ts:1177` |
| Aucun `{x.y.z}` dans une `$description` de contrat | invariant `emitters:check` |
| Chaque état déclaré doit porter des surcharges racine | `figmaStatePreviews`, `contract-schema.ts:1338` |
| Au plus **un** énuméré substitué sur l'ensemble des états | `statePreviewSubstProps`, `contract-schema.ts:1586` — ici toujours `variant` |

---

## E2 — Contrat du Bouton (`contracts/button.contract.json`)

Le document de référence. Il déclare quels états existent et quelle couleur
chacun porte ; les deux surfaces en découlent.

### Diff, exhaustif

**Version** : `2.1.0` → **`2.2.0`** — ajout de champs optionnels seulement,
aucun prop retiré ni renommé, aucune valeur d'énuméré narrowée. **MINOR** (§VI).

**1. `states` : `[]` → `["hover", "active", "focus-visible"]`**

`disabled` reste hors périmètre : aucun bouton de la home n'est inactif
(Assumptions de la spec).

**2. `figmaStatePreviews: true`** (nouveau)

**3. `anatomy.root.states`** (nouveau) :

```
hover:
  background-color : {color.etat.{variant}.fond-survol}
  color            : {color.etat.{variant}.libelle-survol}
active:
  background-color : {color.etat.{variant}.fond-presse}
  color            : {color.etat.{variant}.libelle-presse}
focus-visible:
  outline-color    : {color.etat.{variant}.anneau-focus}
  outline-width    : {border-width.2}
```

`outline-style: solid` et `outline-offset: 2px` sont émis d'office dès que
`focus-visible` est déclaré (`emit-react.ts:2004`, `emit-html.ts:400`) — rien à
écrire. `outline-width` ne substitue rien : une seule référence pour les sept
styles.

**4. `description`** : une phrase datée nommant la vague, l'arbitrage owner sur
FR-019, et la limite du soulignement par style. **Sans accolades** autour des
chemins de jetons.

### Ce que le contrat NE change PAS (garde FR-010)

`props`, `semantics`, `a11y`, `anchors`, `anatomy.root.tokens`,
`anatomy.root.tokensByProp`, `anatomy.root.declared`, `anatomy.root.parts` — tous
inchangés, octet pour octet. C'est ce qui rend SC-006 tenable : le repos ne peut
pas bouger, parce que rien de ce qui le décrit n'est touché.

### Effet sur `rootBorderPlan` — vérifié, pas supposé

`rootBorderPlan` collecte les canaux des états (`emit-react.ts:134`). Les canaux
ajoutés sont `background-color`, `color`, `outline-color`, `outline-width` :
**aucun `box-shadow`**, **aucun `border-*-width` par côté**, **aucun
`border-style` déclaré**. Donc `inset` reste `true`, la bordure continue d'être
peinte par l'ombre intérieure paramétrée, et la boîte ne grossit pas.

---

## E3 — Axe d'états du master (canevas Figma)

La dimension supplémentaire que le master `Bouton` gagne. Elle appartient au
moteur ; un designer qui modifie une case est signalé comme dérive.

### Forme

- **Propriété** : `State`, type `VARIANT`, défaut `Default`.
- **Options** : `Default`, `Hover`, `Active`, `Focus Visible`
  (`statePreviewLabel`, `contract-schema.ts:1580`).
- **Volume** : 7 → **28** variantes. 7 renommées sur place
  (`Style=X` → `Style=X, State=Default`), **21 créées**.

### Invariant d'identité

> Une variante existante dont le nom correspond au nom attendu **moins** le
> segment `, State=Default` **est** cette variante : elle est renommée en place,
> son identifiant de nœud est préservé.

`emit-figma-script.ts:5180-5215`. C'est ce qui tient FR-009 et SC-003 : les
instances pointent sur des identifiants de nœud, pas sur des noms.

### Ce que les cases d'état dessinent

Les surcharges passent par `translateStateOverrides`
(`emit-figma-script.ts:1722`) :

- `background-color` et `color` → fills, **liés à la variable** correspondante ;
- la paire `outline-color` + `outline-width` → contour **aligné à l'extérieur**
  (`spec.strokeOutside`). La paire doit être **complète**, sinon le canal
  retombe inerte — elle l'est ici.

**Approximation nommée, déjà documentée dans le code** : `outline-offset` n'est
pas porté sur le canevas. La bague dessinée colle au bord ; en CSS elle est à
2 px. Écart connu, borné, écrit.

### Ce qui reste hors du canevas

| Fait | Pourquoi |
|---|---|
| Réaction de prototype (`play mode`) | non généré ; un ajout manuel serait effacé au sync suivant (FR-014) |
| `:focus-visible` vs `:focus` | notion de navigateur, sans équivalent canevas |
| La garde `:not(:disabled)` | idem |

---

## Relations

```
tokens/primitives.tokens.json
   ├─ 7 primitives neuves ──────────────┐
   └─ 35 alias color.etat.<style>.<canal>┤
                                         │  {color.etat.{variant}.…}
contracts/button.contract.json ──────────┘
   ├─ npm run generate  ──► src/components/Button/Button.module.css   (React livré)
   ├─ npm run odoo:assets ─► …/generated/components.pqr.css           (site Odoo)
   └─ npm run figma:plan ─► figma-sync/NN-button.js ──► axe State (28 variantes)

npm run tokens ──► src/styles/tokens.css
              └──► figma-sync/01-tokens.js ──► 42 variables Figma
                        ▲
                        └── bloqué tant que « Entrée menu » et « Sous-entrée menu »
                            n'ont pas leur marqueur ds_contracts/textStyleToken
```

---

## Transitions d'état (surface livrée)

| Déclencheur | Sélecteur émis | Source |
|---|---|---|
| souris sur le bouton | `.variant-X:hover:not(:disabled)` | `emit-react.ts:82` |
| doigt ou bouton enfoncé | `.variant-X:active:not(:disabled)` | `emit-react.ts:83` |
| arrivée au clavier | `.variant-X:focus-visible` | `emit-react.ts:84` |
| clic souris | **aucun** — `:focus-visible` ne s'arme pas au pointeur (FR-006) | comportement navigateur, prouvé par l'eval restaurée |

Spécificité : `.variant-X:hover` vaut `0,2,0` contre `0,1,0` pour `.variant-X`.
Les règles d'état gagnent sans `!important`, et l'ordre d'émission
(états après énumérés, `emit-react.ts:2052`) le confirme.
