# TinySpec: odoo-showcase-fidelity-fixes — largeurs fluides + overlay SAV

**Branch**: 021-figma-projection-repair · **Date**: 2026-08-19 · **Status**: done · **Complexity**: small (limite haute — touche 3 contrats + un composant partagé ; direction déjà approuvée par `docs/organisms-responsive-decisions.md`)

## What

Corriger deux défauts de fidélité vus par l'owner sur le showcase Odoo des 8 sections. Le React/Figma est bon ; les correctifs se font **à la source** (contrat), pas en rustine Odoo.

1. **Trois sections ne rétrécissent pas** (largeur desktop / W-auto) alors que les autres oui. Cause confirmée par la CSS générée : leur root est en **largeur fixe** au lieu de `100%`. Le mobile reste hors scope (reporté).
2. **SAV** ne montre pas l'overlay Figma (carte flottant sur une photo plein cadre). L'overlay EST dans la CSS générée → la cause est la structure QWeb ou le thème Odoo, à confirmer avec une image.

## Diagnostic (mesuré, pas supposé)

| Élément | Largeur actuelle | Attendu |
|---|---|---|
| `faq` root | `--size-faq-root` = **1728px** | `100%` (Fill) |
| `devis` root | `--size-devis-root` = **1728px** | `100%` (Fill) |
| `accordion-row` root (**partagé**) | `--size-accordion-row-root` = **1550px** | `100%` (Fill) → règle FAQ **et** texte-seo |

Référence : présentation/hero/équipe sont déjà `width: 100%` → elles rétrécissent. `docs/organisms-responsive-decisions.md` approuve déjà « FAQ root Fill, toutes les lignes Fill » et « Devis root Fill » ; jamais appliqué aux contrats.

## Context

| Fichier | Rôle |
|---|---|
| `contracts/faq.contract.json` | Modifié — root : sizing FIXED → **FILL** |
| `contracts/devis.contract.json` | Modifié — root : sizing FIXED → **FILL** |
| `contracts/accordion-row.contract.json` | Modifié — root FILL (**partagé** : FAQ + texte-seo) |
| `src/components/**`, generated CSS Odoo, `catalog/` | **Générés** — `npm run build` + `npm run odoo:assets`, jamais à la main |
| `integrations/odoo/addons/piqueray_ds/views/components.xml` | SAV : structure QWeb à corriger **seulement si** l'overlay est structurellement cassé (à vérifier avec une image) |
| Re-pins | `evals/golden.json`, `integrations/odoo/config/inputs.lock.json` + transcriptions de version, `derivation-report.json` |

## Requirements

1. `faq`, `devis` et les lignes d'accordéon (`texte-seo` inclus) rétrécissent avec le viewport comme présentation/hero/équipe — root et `accordion-row` en `100%`, plus aucune largeur fixe.
2. `accordion-row` en Fill règle **à la fois** les questions FAQ et l'alignement « Infos pratiques » du texte SEO.
3. SAV : avec une image de fond représentative, le rendu montre l'overlay (carte sur photo plein cadre). Correctif QWeb/CSS appliqué **uniquement** si c'est structurellement cassé, pas si c'est juste l'image manquante.
4. **Aucune régression** visuelle sur les sections déjà OK (présentation, hero, équipe, avis Google) aux largeurs de référence (1728 / 1440).
5. Toutes les surfaces régénérées (jamais éditées à la main) ; portes vertes ; re-pins relus.

## Plan

1. Basculer le sizing du root en FILL dans `faq`, `devis`, `accordion-row` (source du `width` fixe).
2. `npm run build` + `npm run odoo:assets` ; vérifier que React **et** la CSS Odoo émettent `width: 100%` sur ces roots.
3. SAV : poser une image de fond sur l'instance, vérifier l'overlay ; corriger la QWeb/CSS seulement si cassé.
4. Contrôle non-régression sur les sections OK aux deux largeurs.
5. Re-pins (golden, inputs.lock + transcriptions, derivation report) ; sweep des portes vert.
6. **Boucle owner** : rebuild de l'instance → tu revérifies à l'œil (je ne vois ni images ni resize moi-même).

## Tasks

- [x] T1 — `faq` root → FILL
- [x] T2 — `devis` root → FILL
- [x] T3 — `accordion-row` root → FILL (partagé)
- [x] T4 — Régénérer ; confirmer React + CSS Odoo en `width: 100%` sur les 3 roots
- [x] T5 — SAV : structure vérifiée correcte (carte blanche + overlay présents dans la CSS) → **aucun fix**, il paraissait cassé faute d'images dans l'instance de test (owner d'accord)
- [x] T6 — Non-régression : parité `exit 0` sans finding faq/devis/accordion ; owner a confirmé texte-seo (qui consomme accordion-row) OK
- [x] T7 — Re-pins : golden (189 fichiers, figma-sync régénéré), inputs.lock + 3 transcriptions du digest `48a08166`, derivation report ; **portes vertes : eval 219/219, odoo module 18/18, tsc ×3, parité**. Conflit de préservation 013 sur `faq width` superséé (référence portée en `layout.referenceWidth`, documenté dans `corrections-013.json`).
- [x] T8 — Instance rebuild ; owner a validé le responsive au resize (« c ok »)

## Reste avant commit (nommé, pas fait)

- Rejouer les scénarios QA Odoo (le repin du lock invalide leurs reçus) — **non fait pour ne pas détruire l'instance de test de l'owner** (même port 8169). À lancer avant le commit.
- **Bonus livré hors périmètre initial** (demande owner en cours de route) : le contrôle « Lien du CTA » a été étendu à SAV, Devis et FAQ (action générique `pqrSetCtaHref` + `link_href` QWeb + registre CTA-LIEN-BRIDGE), pour cohérence avec Hero/Présentation.

## Dette technique NOMMÉE (revue /simplify du 2026-08-19)

Deux points relevés, tous deux **hors du périmètre de ce tinyspec** (fix > 1 diff / mutation Figma), consignés ici pour ne pas les laisser en drift silencieux :

1. **Le garde de préservation 013 se fait éroder par suppression, pas re-logé — et le responsive est un PROGRAMME.** Ce tinyspec a RETIRÉ l'entrée `ds.faq width` de `corrections-013.json` parce que la porte (`extract/geometry-gate/preservation.ts`) ne lit que `/literals/` + `/tokens/`, jamais `layout.referenceWidth`. Mais `docs/organisms-responsive-decisions.md` met en file la même conversion Fill pour d'autres sections, et **deux largeurs encore gardées** restent dans la fixture (`ds.reassurances 1550`, `ds.footer 1728` + `Row 1385`). À la prochaine conversion Fill d'une de ces deux, le même conflit revient — et « supprimer l'entrée » érode le seul instrument qui attrape une ré-extraction revertant silencieusement une largeur 013.
   **Fix durable (avant la prochaine conversion Fill d'une largeur gardée)** : un nouvel état `superseded` dans `preservation.ts` qui (a) accepte un override responsive documenté sans le compter `clobbered`, et (b) **re-loge le garde sur `layout.referenceWidth`** (toujours ==1728). ⚠ NE PAS réutiliser `converted-preserved` : il affirme un px résolu identique, or la surface code rend `width: 100%`, pas 1728 — ce serait l'inversion de la porte. Coût ~1 session (`preservation.ts` +1 état, `run.ts` plombe `layout.referenceWidth` dans l'inventaire, fixture gagne `supersededBy`, +1 eval).

2. **Trois tokens de largeur orphelins** — `size.faq.root` (1728), `size.devis.root` (1728), `size.accordion-row.root` (1550) : la conversion en `fill` a retiré leur dernière référence de contrat (le nombre vit maintenant en `referenceWidth`), mais leurs définitions restent dans `tokens/primitives.tokens.json` et émettent toujours vers `tokens.css`, `figma-sync/01-tokens.js` (**variable Figma vivante**), le catalog et le snapshot de parité. Le build reste vert (une déf orpheline n'échoue pas ; seule une réf pendante le ferait). **Retenus sciemment**, pas supprimés : le retrait propre exige de retirer aussi les variables du canvas (mutation Figma, GO owner, before-capture) — hors d'un diff de contrat. Précédent déjà dans le dépôt : `size.equipe.root: 1728px` est orphelin de la même façon (équipe est Fill). À nettoyer dans une passe Figma-side, avec les variables canvas.

## Done When

- [ ] faq / devis / texte-seo rétrécissent avec le viewport comme les autres sections
- [ ] SAV montre l'overlay avec une image (ou le correctif structurel est posé)
- [ ] Zéro régression sur les sections déjà OK
- [ ] Portes vertes : `build`, `eval`, `odoo:module/inputs/derivation:check`, `parity`
