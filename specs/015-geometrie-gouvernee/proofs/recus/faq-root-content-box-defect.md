# Reçu — réparation : `ds.faq` portait une largeur content-box, fausse depuis la Phase 3

**Date** : 2026-08-05 · **Découvert pendant** : revue de la Phase 7 (relecture de la spec avant clôture) · **Cause** : `box-model-unification` · **Statut** : **réparé et re-mesuré** (§4).

## 1. Le fait, vérifié contre le dump Figma commité

`extract/figma/visual-parity/out/_cache/nodes-d9FYAUcqdcNtsuaMgLefvJ-2104_2914.json` (version Figma pinée `2381581871281042338`, lecture seule, FR-010) :

| Nœud | Type | `absoluteBoundingBox` | `layoutMode` | padding L/R/T/B |
|---|---|---:|---|---|
| `2104:2914` (`FAQ`) | COMPONENT | **1728 × 448** | VERTICAL (auto-layout natif) | 89 / 89 / 0 / 0 |

Le contrat portait `size.faq.root` = **1550px** avec `padding-left`/`padding-right` = `{space.89}` :

```
1550 + 89 + 89 = 1728   ← la signature exacte d'un calcul content-box
```

La description du root du contrat l'écrivait elle-même, noir sur blanc :

> « La largeur portée ici est la boîte de CONTENU : 1550 + 89 + 89 = les 1728px relevés ; **la feuille générée ne déclare pas box-sizing: border-box** et ce canal n'est pas dans DECLARED_CHANNELS, donc l'arithmétique est explicitée plutôt que contournée (même convention que ds.sav et ds.footer). »

## 2. Pourquoi c'était un défaut vivant

Cette phrase était vraie au census 013. Elle est devenue fausse en **T013 (Phase 3, 015)**, qui déclare `box-sizing: border-box` sur toutes les racines générées. Sous `border-box`, `width` INCLUT le padding : `width: 1550px` rend une boîte totale de 1550px, pas 1728px. **La surface React livrée rendait donc 178px trop étroit**, sans qu'aucun chiffre de contrat n'ait changé — c'est le changement de règle CSS qui a révélé un littéral devenu faux.

Figma, lui, calcule déjà `absoluteBoundingBox.width` en INCLUANT le padding pour un frame auto-layout : la sémantique native de Figma est celle de `border-box`. `ds.faq` (VERTICAL) et `ds.footer` (VERTICAL) sont dans ce cas ; `ds.sav` ne l'est pas (frame libre, padding déduit a posteriori) — d'où trois corrections de même cause mais trois relevés distincts.

## 3. Comment il a survécu à deux passes

La classe de défaut a été trouvée deux fois pendant 015, et réparée deux fois — sans que `faq` soit inclus :

- **`ds.sav`** (T040, reçu `sav-wrapper-imggroup-content-box-defect.md`) : `wrapper` 546×513 → 641×561, `imgGroup` 644 → 647. Réparé au §6, en Phase 6.
- **`ds.footer`** (T058, reçu `named-repair-DW-005.md`) : `size.footer.root` 1550 → 1728. Réparé en Phase 6.

Le reçu `sav` avait nommé le trou explicitement, dans sa section « Ce qui N'est PAS affecté » :

> « `faq`/`footer` n'ont pas été re-vérifiés contre leur bbox Figma réel ici (hors périmètre de cette investigation ponctuelle) et restent à l'état où `box-model-unification.md` les a laissés. »

`footer` a fini par l'être (par le chemin DW-005, pas par celui-là). `faq` ne l'a pas été. **L'honnêteté du reçu d'origine est ce qui a permis de le retrouver** : la revue n'a eu qu'à suivre la phrase qui nommait la dette.

Le signal qui l'a confirmé mécaniquement : sur les 11 parts du dépôt portant à la fois une taille et un padding sur le même axe, `ds.faq` était **la seule** dont `taille + padding` retombait exactement sur la bbox du master — toutes les autres portent déjà le total.

## 4. La correction et sa mesure

- `tokens/primitives.tokens.json` : `size.faq.root` **1550px → 1728px** (`$description` re-écrite, provenance citée : node `2104:2914`, version pinée).
- `contracts/faq.contract.json` : description du root re-écrite — la valeur portée est désormais la boîte TOTALE, et le texte périmé (« la feuille générée ne déclare pas box-sizing: border-box ») est corrigé plutôt que laissé en place.
- `specs/015-geometrie-gouvernee/fixtures/corrections-013.json` : l'entrée `ds.faq /anatomy/root/literals/width` passe de `1550px` à `1728px`, **avec sa raison écrite dans le champ `setBy`** — même précédent et même forme que la correction de l'entrée `ds.footer` par T058. La valeur protégée par `checkPreservation` est le fait Figma, pas la valeur que 013 avait écrite.

**Diff de régénération, revu en main** : `src/styles/tokens.css` (`--size-faq-root: 1550px → 1728px`) et `figma-sync/15-faq.js`. `FAQ.module.css` est **inchangé** — il référence `var(--size-faq-root)`. C'est la démonstration directe de la doctrine « la géométrie se porte en tokens » : la correction se propage par le token, sans toucher une seule surface générée à la main.

**Mesure** (`build-registre --phase apres`, 2026-08-05T06:17:34Z, même navigateur que l'« avant » : chromium-1234/151.0.7922.34) :

| | avant (T005) | Phase 3 seule | après correction |
|---|---:|---:|---:|
| `faq/faq-master-defaults` | 3,672346 % | 4,819331 % (+1,146985) | **3,672346 % (delta 0)** |

La ligne retombe **bit à bit** sur son chiffre d'avant, exactement comme `sav` et `footer`. C'est la preuve que la correction est juste : border-box + 1728 rend la même géométrie totale que content-box + 1550 rendait avant la Phase 3 — la boîte de Figma, dans les deux cas.

## 5. Ce que cela corrige dans le dossier de la spec

L'attribution de `faq` au registre (`attributions.json`) affirmait un mouvement `+1,146985` attribué à `box-model-unification`, présenté comme un mouvement **attendu** du fix. Le reçu `box-model-unification.md` §2 le publiait de même. C'était vrai comme constat, faux comme verdict : ce mouvement était une **aggravation**, pas la trace du fix — la même erreur de lecture que le reçu `sav` avait déjà relevée pour lui-même (« la direction du mouvement seule ne suffisait pas à conclure »). Les deux textes sont corrigés ; le tableau §2 de `box-model-unification.md` porte désormais une note de correction datée.

## 6. Ce qui N'est PAS affecté

- Les 7 autres contrats du rayon Phase 3 sont vérifiés sains, cette fois **exhaustivement et non par sondage** : le relevé du 2026-08-05 énumère les 11 parts du dépôt portant taille + padding sur un même axe et compare chacune à la bbox de son master. `coordonnees` (576), `google-reviews` (1552 / 328), `review-card` (299), `textarea` (128), `accordion-row` (trigger, padding 0), `sav` (641 / 561 / 647 après §6), `footer` (1728 après T058) portent tous le total. Aucun autre cas ne subsiste.
- Les 12 faits `divergent` restants de `faq` à l'audit d'organismes ne sont pas touchés par cette correction : 4 d'entre eux portent le défaut de pointeur périmé documenté par `audit-campaign-stale-literal-pointers.md` (chiffré à 30/69 le 2026-08-05).
