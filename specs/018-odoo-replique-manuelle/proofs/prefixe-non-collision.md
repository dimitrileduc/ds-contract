# T006 — le préfixe est `--pqr-` : décision et relevé de non-collision

**Date** : 2026-08-06 · **Décidé par** : T006, dans le chantier — pas hérité d'un document.

`contracts/odoo-tokens-output.md` §3 note que `research.md` §D11/P2 **exclut** deux candidats sans
en nommer un troisième. La décision est donc prise ici, et prouvée ici.

## La décision

**`--pqr-`** (Piqueray). Toutes les déclarations de `tokens.pqr.css` le portent, y compris les
références d'alias, qui deviennent `var(--pqr-…)`.

## Les deux candidats écartés, et pourquoi

| Candidat | Pourquoi il est refusé |
|---|---|
| `--o-` | C'est **la convention d'Odoo lui-même** (`$o-color-1..5`, `o_not_editable`, `o_editable`…). Un tiers qui s'y installe rend son propre CSS indistinguable de celui du produit hôte — pour un lecteur comme pour un `rg`. |
| `--bs-` | C'est le nom que Bootstrap portait **avant** qu'Odoo ne force `$variable-prefix: ''`. Le réintroduire ferait lire nos variables comme « celles de Bootstrap », exactement à l'envers. C'est un piège de lecture, pas une collision technique. |

## Le relevé de non-collision

### 1. Contre la surface qu'Odoo publie — statut : **LU, non confirmé**

`research.md` §D11/P2 établit, par lecture de la source 19.0, qu'Odoo force `$variable-prefix: ''`
dans **trois** fichiers `bootstrap_overridden.scss` indépendants (`website`, `web`, `html_editor`),
chargés avant le `_variables.scss` de Bootstrap — la sémantique `!default` fait gagner la chaîne
vide. Sur une page Odoo 19, les propriétés personnalisées de Bootstrap s'appellent donc
`--primary`, `--body-bg`, `--border-radius`, `--box-shadow`, `--font-sans-serif`… **sans préfixe**.
Odoo publie en outre ses propres noms nus : `--header-font-size`, `--base-white`,
`--base-100`…`--base-900`, `--palette-names`, `--headings-font`.

Aucun de ces noms ne commence par `pqr-`, et aucun ne peut le faire : ils sont produits par des
boucles `@each` sur les palettes de couleurs et de gris, dont les préfixes sont vides ou `base-`.

> **SC-009 — statut honnête.** Ce point est établi **par lecture du code d'Odoo**, jamais confirmé
> sur une instance. Il reste une hypothèse jusqu'à ce que la page publique le confirme. Le contrôle
> est prévu en Phase 3 (T029) : relever `getComputedStyle(document.documentElement)` sur la page
> rendue et vérifier qu'aucune propriété `--pqr-*` ne vient d'ailleurs que de notre feuille, et
> qu'aucun nom d'Odoo n'entre en collision. **Tant que ce relevé n'est pas fait, ce tableau est
> « lu », pas « acquis ».**

### 2. Contre notre propre vocabulaire — statut : **CONFIRMÉ par exécution**

Nos 231 noms de jetons appartiennent aux familles `color-`, `nav-`, `opacity-`, `font-`, `space-`,
`size-`, `radius-`, `border-width-`, `typography-`. **Aucun** ne commence par `pqr-` — donc le
préfixage est une bijection sans écrasement, et l'invariant I4 le vérifie à chaque build.

```
$ rg -a -c '^  --pqr-' …/tokens.pqr.css        # 231
$ rg -a -c '^  --' src/styles/tokens.css        # 231
$ rg -aP -c '^  --(?!pqr-)' …/tokens.pqr.css    # 0   (aucune déclaration nue)
$ rg -aP -o 'var\(--(?!pqr-)' …/tokens.pqr.css  # 0   (aucune référence nue)
```

Relevé complet : [`tokens-additivite.txt`](./tokens-additivite.txt).

## Ce que le préfixe protège, en une phrase

Nos noms actuels sont **génériques** (`--color-…`, `--space-…`, `--font-size-…`). Les publier tels
quels sur une page Odoo, c'est parier qu'aucun tiers ne les emploie — un pari qu'on ne peut pas
gagner, et qu'on n'a aucune raison de prendre. C'est ce qui rend FR-008 **nécessaire**, et non
prudent.
