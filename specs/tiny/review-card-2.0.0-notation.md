# TinySpec: review-card-2.0.0-notation — gouverner la note d'avis, simplifier l'avatar

**Branch**: 021-figma-projection-repair · **Date**: 2026-08-18 · **Status**: done · **Complexity**: small (documentation rétroactive d'un changement déjà livré et prouvé ; décision owner du 2026-08-18) · **Commit**: `1d33bce`

> Rétroactive. Le travail a été fait pendant la branche 021 sur décision owner, hors du périmètre déclaré de 021 (réparation Figma) et de 019 (clos). Cette tinyspec est le récit manquant, pas un plan à exécuter. Sa jumelle côté Odoo : [[odoo-cta-link-review-note]].

## What

Promouvoir `ds.review-card` en **2.0.0** (majeur) et créer l'atome gouverné **`ds.notation`**, sur demande owner du 2026-08-18. Deux problèmes réels de la carte d'avis :

1. **La note d'un avis était le seul fait important non éditable** — ni en code, ni dans Odoo. La spec 006 avait supprimé l'axe `note` (R7) sur deux prémisses : tous les avis mesurés étaient à 5/5, et l'icône gouvernée `star` est orange intrinsèque. La **première prémisse tombe** (décision owner) ; la seconde tient, d'où le glyphe interne **`star-empty`** (même géométrie, gris) qui rend la paire pleine/vide possible.
2. **L'exclusivité photo/initiale était une CONVENTION fragile** — deux booléens indépendants (`initialeVisible`, `photo`) qui autorisaient deux états absurdes (aucun avatar, ou les deux à la fois). Remplacés par **une variante `avatar` à deux valeurs** (`Initiale` | `Photo`), exclusive par construction. Les props mortes `tronque` (« Lire la suite » désormais inconditionnel) et `verifie` (badge inconditionnel) disparaissent aussi.

`ds.google-reviews` passe en **2.0.0** pour consommer le nouveau `ds.review-card`.

## Pourquoi CINQ bandes plutôt qu'une bande paramétrée

Les trois mécanismes plus économiques ont été **testés et refusés par le moteur**, pas écartés par goût (voir `contracts/notation.contract.json`, description) :

1. `visibleWhen` ne teste qu'UNE valeur d'enum (pas de « parmi ») → « étoile 3 visible si note ≥ 3 » inexprimable ;
2. `meter` rend un `<div>` de largeur fractionnaire **sans enfants** (`core/emit-react.ts`) → pas de bandeau d'étoiles à l'intérieur ;
3. `star.svg` porte `fill="#F98A0B"` en dur et ne se recolore pas par `currentColor`.

Cinq bandes exclusives projettent exactement les cinq variantes du master Figma `Notation` (`2480:4725`). La demi-étoile est **écartée**, pas oubliée (décision owner : note entière 1–5).

## Context

| Fichier | Rôle |
|---|---|
| `contracts/notation.contract.json` | **NOUVEAU** — atome `ds.notation` 1.0.0 : cinq bandes exclusives portant une note entière 1–5 ; glyphe interne `star-empty` |
| `contracts/review-card.contract.json` | **2.0.0** (majeur) — 3 props retirées (`tronque`, `initialeVisible`, `photo`, `verifie`) → une variante `avatar` (`Initiale`\|`Photo`) + `note` (imbriqué via `ds.notation`, binding Figma `NONE` à dessein pour éviter un produit Avatar × Note = 10 variantes) |
| `contracts/google-reviews.contract.json` | **2.0.0** — consomme le review-card 2.0.0 |
| `contracts/member-card.contract.json` | 1.4.0 — retouche mineure |
| `assets/icons/star-empty.svg` | **NOUVEAU** — glyphe interne gris (même `d` que `star`, `fill=#E0E0E0`) ; hors registre d'icônes à dessein, exempté par `parity/diff.ts` comme glyphe consommé par un contrat |
| `src/components/{Notation,ReviewCard,GoogleReviews,MemberCard}/**` | **Générés** — `npm run build`, jamais édités à la main |
| `catalog/**`, `figma-sync/**` (renumérotés 24→37) | **Générés** — l'insertion de `notation` décale la numérotation figma-sync (13 renommages) |
| `evals/run.ts` | Cas T064 **réécrit** : `review-card-avatar-exclusivity-is-convention-not-schema` → `-is-schema-enforced` (prouve que l'état « deux avatars » n'a plus de représentation) ; cas A5 `avatarPhoto` lu **par variante** au lieu de `variants[0]` en dur |
| `evals/fixtures/figma-text-styles-piqueray-check.ts` | Compte custom **11 → 15** : review-card devenu un set de 2 variantes, 4 de ses textes comptés par variante + `initialeTexte` dans la seule variante Initiale. Défauts nommés, pas absous |
| `evals/golden.json` | Re-pin des surfaces générées |

## Requirements

1. `ds.notation` existe, gouverné, cinq bandes exclusives 1–5, avec `star-empty` comme paire grise de `star`.
2. `ds.review-card` 2.0.0 : les booléens `initialeVisible`/`photo`/`tronque`/`verifie` ont **disparu** ; `avatar` est un enum `Initiale`\|`Photo` ; `note` est porté par `ds.notation`.
3. L'exclusivité de l'avatar est **structurelle**, plus une convention : l'état « deux avatars » n'a aucune représentation possible (prouvé côté eval sur la surface React générée).
4. `ds.google-reviews` 2.0.0 consomme le review-card 2.0.0 ; les 45 instances Figma survivent (la variante `Avatar=Initiale` garde l'id et la clé historiques).
5. Toutes les surfaces sont **régénérées** (React, catalog, figma-sync, star-empty), jamais éditées à la main ; golden re-pinné.
6. `npm run eval` vert ; le cas T064 réécrit refuse le retour des deux booléens.

## Plan

1. Créer `contracts/notation.contract.json` (cinq bandes, star-empty).
2. Promouvoir `review-card` 2.0.0 (retrait des 4 props, `avatar` variant, `note` imbriqué) et `google-reviews` 2.0.0.
3. Minter `assets/icons/star-empty.svg` (même géométrie que star, gris).
4. `npm run build` → régénérer React/catalog/figma-sync ; re-pin golden.
5. Réécrire le cas eval T064 (exclusivité désormais schema-enforced) et durcir le compte custom 11 → 15.
6. `npm run eval` vert.

## Tasks

- [x] T1 — `ds.notation` créé (cinq bandes exclusives, `star-empty`)
- [x] T2 — `review-card` 2.0.0 (4 props retirées → `avatar` enum + `note` imbriqué)
- [x] T3 — `google-reviews` 2.0.0 (consomme review-card 2.0.0)
- [x] T4 — `star-empty.svg` minté ; surfaces régénérées (React/catalog/figma-sync renumérotés) ; golden re-pinné
- [x] T5 — cas eval T064 réécrit (`-is-schema-enforced`) + compte custom 11 → 15 + lecture A5 par variante
- [x] T6 — `npm run eval` vert

## Done When

- [x] `npm run eval` **219/219**
- [x] Zéro booléen d'avatar ne subsiste dans `ds.review-card` ; `avatar` est un enum à 2 valeurs
- [x] Les surfaces générées sont fraîches (aucune édition manuelle) ; golden relu
- [x] Les 45 instances Figma de review-card survivent à la promotion (id/clé historiques préservés)

## Limites nommées, portées telles quelles depuis la description du contrat

- **Frontière image A5** — l'avatar photo reste un aplat gris + † sur le canevas (trou A5, non refermé) ; le pixel réel est un override de fill IMAGE hors contrat.
- **Couleur de la pastille-initiale FIXE** — les 5 avis réels portent 5 teintes ; aucun canal ne lie une couleur CSS à un texte libre par item. Écart assumé, arbitré owner.
- **Typographie sans Text Style** — les cinq textes de la carte (initialeTexte, auteur, date, temoignage, lireLaSuite) n'ont pas de Text Style gouverné, comme 172 des 332 textes du fichier. La réparation utile est une **passe de typographie globale**, pas locale à ce composant — à décider par l'owner, hors périmètre ici.
