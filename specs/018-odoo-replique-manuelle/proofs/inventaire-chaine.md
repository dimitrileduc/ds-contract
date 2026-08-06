# T004 — inventaire de la chaîne, relevé sur l’état FUSIONNÉ

**Date du relevé** : 2026-08-06  
**Commit** : `fff7d69`  
**Méthode** : lecture programmatique des trois `contracts/*.contract.json`, aucune valeur recopiée d’un document de conception.

> Tout chiffre cité dans `plan.md`, `research.md` ou `contracts/` porte la date du **2026-08-06 AVANT fusion**.
> Ce relevé les remplace. Là où il **infirme** un fait de conception, il le dit explicitement.

---

## 1. Les trois contrats — version exacte

| Contrat | Version lue | Attendue par `plan.md` §D1 | Verdict |
|---|---|---|---|
| `ds.presentation` | **2.2.0** | 2.2.0 | ✅ conforme |
| `ds.section-header` | **2.1.1** | 2.1.1 | ✅ conforme |
| `ds.button` | **2.0.0** | 2.0.0 | ✅ conforme |

## 2. Props, valeurs et liaisons

### `ds.presentation` v2.2.0 — 3 props

| Prop | Type | Défaut | Valeurs | Liaison Figma |
|---|---|---|---|---|
| `texte` | rich-text | _(rich-text)_ | — | TEXT « Texte » |
| `bouton` | boolean | `false` | — | BOOLEAN « Bouton » |
| `titre` | text | `Piqueray, une histoire de famille ` | — | TEXT « Titre » |

### `ds.section-header` v2.1.1 — 6 props

| Prop | Type | Défaut | Valeurs | Liaison Figma |
|---|---|---|---|---|
| `disposition` | {"enum":["standard","avecCta"]} | `standard` | — | VARIANT « Disposition » |
| `accroche` | text | `Plus de 50 ans d’expérience` | — | TEXT « Accroche » |
| `titre` | rich-text | _(rich-text)_ | — | TEXT « Titre » |
| `accroche2` | boolean | `true` | — | BOOLEAN « Accroche2 » |
| `emphase` | {"enum":["standard","hero","moyen","compact"]} | `standard` | — | VARIANT « Emphase » |
| `alignement` | {"enum":["centre","gauche"]} | `centre` | — | VARIANT « Alignement » |

### `ds.button` v2.0.0 — 6 props

| Prop | Type | Défaut | Valeurs | Liaison Figma |
|---|---|---|---|---|
| `variant` | {"enum":["default","orange","blanc","outlineBlanc","link","outlineNoir","iconOnly"]} | `default` | — | VARIANT « Style » |
| `children` | text | `Contactez-nous` | — | TEXT « Libelle » |
| `iconLeft` | boolean | `false` | — | BOOLEAN « Icone gauche » |
| `iconRight` | boolean | `false` | — | BOOLEAN « Icone droite » |
| `iconLeftGlyph` | {"enum":["piqueray","phone","download","pdf","search","user","chevron-right","chevron-left","chevron-down","chevron-up","cart","arrow-right","arrow-left","facebook","instagram","star","external-link","mail","octicon-chevron-down12"]} | `arrow-left` | — | INSTANCE_SWAP « Glyphe gauche » |
| `iconRightGlyph` | {"enum":["piqueray","phone","download","pdf","search","user","chevron-right","chevron-left","chevron-down","chevron-up","cart","arrow-right","arrow-left","facebook","instagram","star","external-link","mail","octicon-chevron-down12"]} | `arrow-right` | — | INSTANCE_SWAP « Glyphe droite » |

## 3. Parts d’anatomie

### `ds.presentation` — 6 parts

| Pointeur | Nature | `visibleWhen` |
|---|---|---|
| `root` | conteneur | — |
| `root/colGauche` | conteneur | — |
| `root/colGauche/SectionHeader` | composant `ds.section-header` | — |
| `root/wrapper` | conteneur | — |
| `root/wrapper/Texte` | texte (prop `texte`) | — |
| `root/wrapper/Bouton` | composant `ds.button` | `{"prop":"bouton"}` |

### `ds.section-header` — 4 parts

| Pointeur | Nature | `visibleWhen` |
|---|---|---|
| `root` | conteneur | — |
| `root/Accroche` | texte (prop `accroche`) | `{"prop":"accroche2"}` |
| `root/Titre` | texte (prop `titre`) | — |
| `root/Bouton` | composant `ds.button` | `{"prop":"disposition","equals":"avecCta"}` |

### `ds.button` — 5 parts

| Pointeur | Nature | `visibleWhen` |
|---|---|---|
| `root` | conteneur | — |
| `root/iconLeft` | feuille | `{"prop":"iconLeft"}` |
| `root/iconOnlyIcon` | feuille | `{"prop":"variant","equals":"iconOnly"}` |
| `root/label` | texte (prop `children`) | — |
| `root/iconRight` | feuille | `{"prop":"iconRight"}` |

## 4. Références de tokens consommées

| Contrat | Nombre | Références |
|---|---|---|
| `ds.presentation` | 8 | `{color.noir}` · `{font.family.montserrat}` · `{font.size.14}` · `{font.weight.bold}` · `{size.presentation.col-gauche}` · `{size.presentation.wrapper}` · `{space.16}` · `{space.32}` |
| `ds.section-header` | 12 | `{color.blanc}` · `{color.noir-bleute}` · `{font.family.montserrat}` · `{font.size.20}` · `{font.size.24}` · `{font.size.32}` · `{font.size.40}` · `{font.size.54}` · `{font.weight.bold}` · `{font.weight.regular}` · `{size.section-header.root}` · `{space.8}` |
| `ds.button` | 16 | `{border-width.0}` · `{border-width.2}` · `{color.blanc}` · `{color.noir-bleute}` · `{color.orange}` · `{font.family.montserrat}` · `{font.line-height.22}` · `{font.size.16}` · `{font.weight.medium}` · `{radius.32}` · `{size.button.icon-only}` · `{space.0}` · `{space.10}` · `{space.16}` · `{space.32}` · `{space.4}` |

**Union sur la chaîne : 29 références distinctes.**

## 5. Littéraux portés — canal, valeur, pointeur

**9 littéraux au total sur les trois contrats.**

| Contrat | Pointeur | Canal | Valeur | Actif seulement si |
|---|---|---|---|---|
| `ds.presentation` | `root/wrapper/Texte` | `line-height` | `24px` | _(toujours)_ |
| `ds.section-header` | `root/Accroche` | `letter-spacing` | `3px` | _(toujours)_ |
| `ds.section-header` | `root/Accroche` | `line-height` | `25px` | _(toujours)_ |
| `ds.section-header` | `root/Titre` | `line-height` | `50px` | _(toujours)_ |
| `ds.section-header` | `root/Titre` | `line-height` | `40px` | `disposition=avecCta` |
| `ds.section-header` | `root/Titre` | `line-height` | `68px` | `emphase=hero` |
| `ds.section-header` | `root/Titre` | `font-weight` | `300` | `emphase=hero` |
| `ds.section-header` | `root/Titre` | `line-height` | `40px` | `emphase=moyen` |
| `ds.section-header` | `root/Titre` | `line-height` | `30px` | `emphase=compact` |

## 6. Le chemin d’imbrication réellement emprunté

Départ : `ds.presentation` avec **ses propres défauts** —

```json
{
  "texte": "(rich-text)",
  "bouton": false,
  "titre": "Piqueray, une histoire de famille "
}
```

| Niveau | Pointeur | Nature | Rendu avec les défauts ? | Condition |
|---|---|---|---|---|
| 1 | `root/colGauche/SectionHeader` | **ds.section-header** | ✅ oui | — |
| 2 | `root/colGauche/SectionHeader » root/Accroche` | prop « accroche » | ❌ **non** | `{"prop":"accroche2"}` |
| 2 | `root/colGauche/SectionHeader » root/Titre` | prop « titre » | ✅ oui | — |
| 2 | `root/colGauche/SectionHeader » root/Bouton` | **ds.button** | ❌ **non** | `{"prop":"disposition","equals":"avecCta"}` |
| 3 | `root/colGauche/SectionHeader » root/Bouton » root/label` | prop « children » | ✅ oui | — |
| 1 | `root/wrapper/Texte` | prop « texte » | ✅ oui | — |
| 1 | `root/wrapper/Bouton` | **ds.button** | ❌ **non** | `{"prop":"bouton"}` |
| 2 | `root/wrapper/Bouton » root/label` | prop « children » | ✅ oui | — |

---

## 7. Ce que ce relevé CONFIRME et ce qu'il INFIRME

### 7.1 Confirmé — les trois versions et le variant (D1)

`ds.presentation` **2.2.0**, `ds.section-header` **2.1.1**, `ds.button` **2.0.0**, variant
`outlineNoir` (et non `outilneNoir`). La fusion `main` a bien produit l'état que `research.md` §D1
décrivait. Reçu : `proofs/merge-main.txt`.

### 7.2 INFIRMÉ — « 4 littéraux actifs sur le chemin emprunté » (research.md §D4)

`research.md` §D4 et `contracts/odoo-tokens-output.md` §6 annoncent **4 littéraux actifs** sur le
chemin emprunté, dont `letter-spacing: 3px` et `line-height: 25px` sur `ds.section-header/Accroche`.
Le relevé §6 ci-dessus montre que **`ds.presentation` compose `ds.section-header` avec
`accroche2: false`** — la part `Accroche` n'est donc **jamais rendue** sur le chemin emprunté.

Le total est aussi différent : **9 littéraux** portés au total (§5), et non « 9 dont 4 actifs » au
sens où §D4 l'entendait. Décompte exact sur le chemin réellement emprunté, par pointeur :

| Littéral | Pointeur | Rendu sur le chemin emprunté ? | Règle CSS émise ? |
|---|---|---|---|
| `line-height: 24px` | `ds.presentation` `root/wrapper/Texte` | ✅ oui | ✅ oui |
| `line-height: 50px` | `ds.section-header` `root/Titre` (base) | ✅ oui, mais **écrasée** par la règle `emphase=moyen` | ✅ oui |
| `line-height: 40px` | `ds.section-header` `root/Titre` (`emphase=moyen`) | ✅ oui — c'est la valeur qui gagne | ✅ oui |
| `letter-spacing: 3px` | `ds.section-header` `root/Accroche` | ❌ **non** (`accroche2: false`) | ✅ oui |
| `line-height: 25px` | `ds.section-header` `root/Accroche` | ❌ **non** (`accroche2: false`) | ✅ oui |
| `line-height: 40px` | `ds.section-header` `root/Titre` (`disposition=avecCta`) | ❌ non | ✅ oui |
| `line-height: 68px` + `font-weight: 300` | `ds.section-header` `root/Titre` (`emphase=hero`) | ❌ non | ✅ oui |
| `line-height: 30px` | `ds.section-header` `root/Titre` (`emphase=compact`) | ❌ non | ✅ oui |

**La distinction qui compte pour T019** : `emit-html` émet la règle CSS de **toutes** les parts, y
compris celles que `visibleWhen` cache. Vérifié par exécution — `.section-header__Accroche { …
letter-spacing: 3px }` existe bien dans la CSS rendue alors que la part n'apparaît dans aucun
rendu de `ds.presentation`. Donc :

- **rendu** : 3 littéraux comptent (24px, 50px écrasé par 40px) ;
- **émis en CSS** : les 9 comptent, et le module doit les porter pour être fidèle.

⇒ **La décision de D4 tient, mais pour une raison plus précise que celle qui était écrite** :
`letter-spacing: 3px` entre bien au registre des littéraux nommés (T019) — non pas parce qu'il est
*visible*, mais parce que la **règle CSS** est émise par la surface de référence et que le module
doit l'écrire pour rester comparable. Son effet visuel est nul sur le chemin emprunté ; l'argument
de §D4 « il change visiblement la largeur de la ligne » est donc **faux sur ce chemin**. Le littéral
reste nommé et épinglé ; sa raison change.

### 7.3 INFIRMÉ — `core/samples/` n'est PAS régénéré par `npm run build`

`tasks.md` T016–T018 prescrit d'écrire les tableaux des zones « avec la référence rendue sous les
yeux (`core/samples/presentation.html`) », et `contracts/volumes.schema.md` §2 prend
`core/samples/` comme dénominateur mesuré (231 + 197 + 118 lignes).

Vérifié par exécution : `npm run build` laisse ces fichiers **inchangés**. Leur en-tête porte
`ds.presentation v2.1.0` et `ds.section-header v2.0.0` — deux versions de retard. `git log` les
date de la spec **013**. Ce sont des artefacts commités, pas une sortie de build.

Compteurs re-relevés (`wc -l`), rendu frais par `emitHtml` sur l'état fusionné :

| Composant | `core/samples/` (périmé) | Rendu frais (état fusionné) | Écart |
|---|---|---|---|
| `presentation.css` | 231 | **238** | +7 |
| `section-header.css` | 197 | **198** | +1 |
| `button.css` | 118 | **118** | 0 |
| **total** | **546** | **554** | **+8** |

⇒ **Conséquence pour le chantier** : le dénominateur de `volumes.schema.md` §2 est **554**, pas 546,
et les tableaux des zones s'écrivent contre un rendu frais — jamais contre `core/samples/`. Le
harnais de la US3 (T041) rend déjà à frais par construction : il n'est pas concerné.

### 7.4 TROUVÉ — la chaîne à 3 niveaux ne se rend avec AUCUNE valeur de prop

C'est le fait le plus lourd du relevé, et il touche **SC-002**.

`ds.button` est atteignable depuis `ds.presentation` par exactement **deux** chemins, et les deux
sont fermés sur le chemin emprunté :

| Chemin | Niveau | Condition | Avec les défauts |
|---|---|---|---|
| `root/colGauche/SectionHeader » root/Bouton` | **3** | `disposition = "avecCta"` | ❌ fermé — `ds.presentation` **fixe `disposition: "standard"` en dur** dans sa composition |
| `root/wrapper/Bouton` | **2** | prop `bouton` du parent | ❌ fermé — défaut `false` |

Le schéma **permet** de faire suivre une prop du parent vers l'enfant composé (`ComponentRefSchema`,
`packages/schema/src/contract-schema.ts:897` : *« A string value of the form `"{parentProp}"` maps a
PARENT scalar prop live into the child »*) — mais **`ds.presentation` ne l'emploie pas** : la valeur
`"standard"` est écrite littéralement.

⇒ **Aucune valeur de prop de `ds.presentation` ne fait rendre le troisième niveau.** Avec
`bouton: true`, on obtient **3 composants à l'écran sur 2 niveaux** (le bouton est un frère du
sous-arbre de l'en-tête, pas son descendant). Avec les défauts, **2 composants**.

Ce constat est mesuré, pas déduit : rendu frais de `ds.presentation` v2.2.0 par `emitHtml`, les deux
vignettes du showcase (`default` et `bouton=true`) inspectées.

**Ce que ça ouvre** : SC-002 demande « **3 composants** rendus, **3 niveaux** d'imbrication portés
par des appels entre modèles ». La structure d'appels à 3 niveaux est écrivable sans rien dévier
(`presentation` → `t-call section-header` → `t-call button`) ; ce qui ne l'est pas, c'est **rendre**
les 3 niveaux sans introduire une valeur que le contrat ne porte pas. La décision appartient à
l'owner — elle est posée dans le journal de chantier, pas tranchée ici.

---

## 8. Ce que ce relevé fixe pour la suite

| Chiffre | Valeur re-relevée | Remplace |
|---|---|---|
| Références de tokens de la chaîne | **29** distinctes (8 + 12 + 16) | précise « 32 » (`plan.md`) — voir ci-dessous |
| Littéraux portés | **9** au total, **1** sans token de même valeur | « 9 dont 4 actifs » (§D4) |
| Dénominateur CSS (FR-017) | **554** lignes (238 + 198 + 118) | « 546 » (`volumes.schema.md` §2) |
| Versions | 2.2.0 / 2.1.1 / 2.0.0 | conforme à D1 |

**Sur le « 32 » de `plan.md`** — ce n'est pas une erreur, c'est un autre décompte, et la nuance
compte pour la 4ᵉ sortie de jetons. Les trois fichiers de contrat contiennent **32** motifs
`{…}` distincts, dont **3 ne sont pas des tokens** mais des placeholders de prop résolus par le
moteur — `{children}`, `{iconLeftGlyph}`, `{iconRightGlyph}`, tous dans `ds.button`. Les
**références de tokens** sont donc **29**. Le chiffre qui gouverne quoi que ce soit ici est 29 ;
32 reste vrai pour « motifs accolés », et c'est la seule lecture sous laquelle `plan.md` se relit
juste.

Relevé par exécution :

```
rg -a -o -I -N '\{[a-z][a-zA-Z0-9._-]*\}' contracts/{presentation,section-header,button}.contract.json \
  | sort -u | wc -l                                   # 32
  # moins {children}, {iconLeftGlyph}, {iconRightGlyph}  → 29
```

Rappel de portée : la 4ᵉ sortie de jetons ne dépend d'**aucun** de ces deux nombres — elle porte le
**vocabulaire en entier** (invariant I4, bijection avec `:root`), pas ce que la chaîne consomme.
