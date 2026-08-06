# TinySpec : `ds.carte` — le CTA du master retrouve les glyphes d'origine

**Branche** : `tiny/carte-bouton-glyphes` (à créer depuis `main`)
**Date** : 2026-08-06
**Statut** : draft
**Complexité** : small
**Registre** : `D-016-CARTE-BOUTON` — **avec correction de son diagnostic, voir « Ce que la mesure a corrigé »**

## Quoi

Le master `ds.carte` (variante Categorie) rend son CTA avec les glyphes **pdf + download**,
là où l'origine porte **arrow-left + arrow-right** — les défauts du bouton lui-même. Le contrat
ne peut pas exprimer l'origine : son enum `ctaIconLeftGlyph` ne contient **que** `pdf`.
On élargit les deux enums et on remet les défauts d'origine ; les choix par page restent
des surcharges d'instance, reposées par le mécanisme existant.

## Ce que la mesure a corrigé dans le diagnostic du registre

L'entrée disait « le contrat rend UNE part `action` là où l'origine porte TROIS enfants » et
lui attribuait « portes-de-garage ~1,05 M px ». **Les deux points sont faux, relevés le
2026-08-06 (dump REST versionné vs dump REST vif)** :

1. **La structure est bonne.** Le contrat compose bien `ds.button` (`iconLeft`/`iconRight` à
   `true`, glyphes et libellé en props) et le canvas rend `action` = INSTANCE 215×30 **HUG** —
   la même taille qu'à l'origine. Les « trois enfants » sont les internes du bouton, pas des
   parts manquantes. Seule divergence structurelle : un cadre `Bouton` 743×30 FILL enveloppe
   l'instance (il porte le `align-self: flex-start` qu'une part `component` ne peut pas
   recevoir — refus de `validateContract`). Il est **transparent, de la hauteur du bouton,
   aligné au début : pixel-neutre**. Rien à changer.
2. **Les 1,05 M px ne sont pas le bouton.** Ce sont les **photos par carte effondrées** sur
   `Reassurances` / `CategoriesPrincipales` / `ProduitsECommerce` (5 hashes distincts → 1,
   sur 6 maquettes). Défaut distinct, plus gros, hors périmètre de cette tinyspec.

**Le défaut réel qui reste** : `Glyphe gauche` = `230:585` (pdf) et `Glyphe droite` = `230:599`
(download) au master vif, contre `6:99` (arrow-left) et `6:104` (arrow-right) au master d'origine.

## Contexte

| Fichier | Rôle |
|---|---|
| `contracts/carte.contract.json` | **modifié** — enums `ctaIconLeftGlyph`/`ctaIconRightGlyph` élargis, défauts remis à l'origine, bump mineur (2.0.0 → 2.1.0) |
| `contracts/button.contract.json` | contexte seul — porte les valeurs d'enum et le mapping INSTANCE_SWAP (`arrow-left` = `6:99`, `arrow-right` = `6:104`) |
| `figma-sync/06-carte.js`, `src/components/Carte/*` | **générés** — régénérés par `npm run build && npm run figma:plan`, jamais édités |
| `evals/golden.json`, `figma-sync/plugin/engine.receipt.json` | **re-pins** dérivés |
| `specs/016-canvas-vrai/registre/defauts-source.json` | **modifié** — `D-016-CARTE-BOUTON` clos avec son diagnostic corrigé |
| `specs/016-canvas-vrai/proofs/repose/gestes-executes.json` | contexte — porte déjà les glyphes **par page** (surcharges d'instance) |

## Exigences

1. `ctaIconLeftGlyph` accepte `arrow-left` **et** `pdf` ; son défaut est `arrow-left`.
2. `ctaIconRightGlyph` accepte `arrow-right` **et** `download` ; son défaut est `arrow-right`.
3. Après amend, le master vif porte `Glyphe gauche = 6:99` et `Glyphe droite = 6:104` — **égalité
   avec le dump d'origine**, vérifiée par relevé, pas par inspection visuelle.
4. Les glyphes **par page** (pdf+download sur certaines, pdf+arrow-right sur d'autres) sont
   inchangés après repose des gestes — ils vivent en surcharges d'instance.
5. Aucune régression pixel : `pages:compare` contre `00-REFERENCE-AVANT-CHANTIER` ne dégrade
   aucune des 9 maquettes par rapport au relevé FINAL21.

## Plan

1. Élargir les deux enums et remettre les défauts d'origine dans `contracts/carte.contract.json` ;
   bump **mineur** (élargir un enum est mineur ; le changement de défaut ne casse aucun appelant —
   ambiguïté nommée, §VI ne tranche pas explicitement le cas « défaut »).
2. `npm run build && npm run figma:plan`.
3. Amend du master via le pont (`figma-sync/06-carte.js`, `specHash` effacé), **census photos
   avant/après** — `ds.carte` porte 2 photos.
4. Rejouer les 256 gestes (`proofs/repose/gestes-executes.json`) — ils reposent les glyphes par page.
5. Capture des 9 maquettes + `pages:compare` vs `00-REFERENCE-AVANT-CHANTIER`.
6. Re-pins (golden + engine.receipt), `npm run eval`, `npm run parity`.
7. Clore l'entrée au registre **avec le diagnostic corrigé** et ouvrir l'entrée du défaut photos.

## Tâches

- [ ] Élargir `ctaIconLeftGlyph` (`arrow-left`, `pdf`) et `ctaIconRightGlyph` (`arrow-right`, `download`), défauts `arrow-left` / `arrow-right`, version 2.1.0
- [ ] `npm run build && npm run figma:plan` — vérifier que `06-carte.js` émet bien `6:99` / `6:104`
- [ ] Amend du master via le pont, census photos avant/après (2/2 attendu)
- [ ] Rejouer les 256 gestes, relever les glyphes de 2 pages témoins (une pdf+download, une pdf+arrow-right)
- [ ] Capture + `pages:compare` : aucune maquette dégradée vs FINAL21
- [ ] Re-pins, `npm run eval`, `npm run parity`
- [ ] Registre : `D-016-CARTE-BOUTON` clos avec diagnostic corrigé + reçu

## Terminé quand

- [ ] Toutes les tâches cochées
- [ ] `npm run eval` vert (compte vif), `npm run parity` exit 0
- [ ] Le relevé du master vif est **égal au dump d'origine** sur les deux glyphes
- [ ] `pages:compare` ne dégrade aucune des 9 maquettes

## Précondition

Le pont **figma-console est déconnecté** à l'écriture de cette spec (étapes 3-5 bloquées).
Le rebrancher (plugin *Figma Desktop Bridge* → Run) avant d'implémenter.
