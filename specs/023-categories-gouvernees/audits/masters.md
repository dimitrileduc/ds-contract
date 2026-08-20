# Audit US1a — Masters + sort de `ds.carte` (T009)

**Date** : 2026-08-20 · **Méthode** : §VIII — lecture seule, par position.

## 1. Master section `CategoriesPrincipales` (`2115:4277`)

COMPONENT_SET, bbox 1728×2504, **1 axe « Disposition » à 4 valeurs** — et cet axe **mélange
trois dimensions** (le défaut de source que 023 nettoie) :

| Variante | node | Taille | Style réel | Colonnes | Contenu | Cartes internes |
|---|---|---|---|---|---|---|
| `Standard` | `2115:4273` | 1552×418 | **superposé** | 2 | — | **2 copies locales** (`2115:4160`, `2115:4168`) |
| `Pleine largeur` | `2115:4274` | 1728×649 | **empilé** | 2 | — | 2 instances `Carte/Categorie` (`2063:1611`) |
| `PleineLargeurTroisCartes` | `2115:4275` | 1728×525 | **empilé** | **3** | — | 3 instances `Carte/Categorie` |
| `PleineLargeurRdv` | `2115:4276` | 1728×649 | **empilé** | 2 | **Rdv** | 1 instance + **1 copie locale** (`2115:4245`) |

→ Cible : axes **orthogonaux** `Style {Superpose, Empile} × Colonnes {2, 3}`, l'axe « Disposition »
et ses valeurs mensongères supprimés (FR-009). La combinaison `Superpose × 3 colonnes` **n'a aucun
usage** (candidate au retrait au Gate A).

## 2. Master `Carte` (`2063:1622`) — et la divergence qui décide de `ds.carte` (D3)

COMPONENT_SET, axe « Disposition » {`Reassurance`, `Categorie`} :

| Variante | node | Taille | État |
|---|---|---|---|
| `Reassurance` | `2063:1606` | 363×525 | **vivant** — composé par `ds.reassurances` |
| `Categorie` | `2407:4905` | 743×**3310** | **CASSÉ + ORPHELIN** — `categorieImage` de 743×**3106** (dégénéré) ; composé **nulle part** |

**La carte empilée réellement utilisée n'est PAS `2407:4905`** mais un **composant autonome
distinct** : `Carte/Categorie` **`2063:1611`**, sur la page « DS · Molécules » (`2052:1145`),
743×622 : `categorieImage` (743×418) + `text` (TitreCategorie + TexteCategorie) + `Bouton`
(instance `action` : icône Pdf + label + icône Download). **Aucun contrat ne le référence.**

### Câblage côté contrats (relevé `rg`, chaînes exactes)

| Composant Figma | node | Dans un contrat ? |
|---|---|---|
| set `Carte` | `2063:1622` | **oui** — `contracts/carte.contract.json` (`ds.carte` v2.0.1), `nodeId` l. 407 |
| variante `Categorie` (cassée) | `2407:4905` | **non** nommément (atteinte par la valeur de variante « Categorie ») |
| `Carte/Categorie` (utilisée) | `2063:1611` | **non** — sans contrat |
| set `CategoriesPrincipales` | `2115:4277` | **non** — sans contrat |

`ds.carte` prop 0 = `disposition` enum `{reassurance, categorie}` → VARIANT « Disposition »
`{reassurance→Reassurance, categorie→Categorie}`. Donc **`ds.carte.disposition = categorie` pointe
sur la variante `Categorie` = `2407:4905`** — le composant **cassé et orphelin**.

### Conséquence D3 — recommandation : `retrait-categorie-v3`

- La disposition `categorie` de `ds.carte` est **du poids mort** : elle vise un orphelin cassé
  que **rien ne compose** ; la vraie carte empilée (`2063:1611`) vit ailleurs et deviendra la
  molécule `ds.carte-categorie`.
- `ds.reassurances` (compose `disposition: reassurance` → `2063:1606`) reste **fonctionnellement
  intact**.
- **Recommandé** : `ds.carte` → **v3.0.0** (majeur), retrait de `disposition: categorie` et des
  props CTA associées (`imageUrl`/`imageAlt`/`ctaLabel`/`ctaIconLeftGlyph`/`ctaIconRightGlyph`
  spécifiques à la carte-catégorie — à confirmer prop par prop au Gate C), rafraîchir les
  épinglages Odoo. **Alternative** (coexistence-dette-nommée) : garder un orphelin cassé — peu de
  valeur, à justifier explicitement si retenue.

**Décision réservée à l'owner (Gate A).**

## 3. Master `Carte/Categorie` utilisé (`2063:1611`) — source de la future molécule

Enfants en **Fill** (source saine), structure empilée : image → texte → bouton. C'est la base
d'extraction du **style `Empile`** de `ds.carte-categorie` ; le style `Superpose` sera officialisé
depuis les copies locales `Standard` (voir [copies-locales.md](./copies-locales.md)).
