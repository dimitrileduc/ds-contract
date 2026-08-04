# Reçu — box-model-unification (T018, US2, DW-014-002)

**Date** : 2026-08-04 · **Cause** : `box-model-unification` · **Rayon** (D1, reçu `react-box-sizing-absent`) : `ds.accordion-row`, `ds.carte`, `ds.coordonnees`, `ds.faq`, `ds.footer`, `ds.google-reviews`, `ds.review-card`, `ds.sav`, `ds.textarea` (9 contrats).

## 1. Ce qui a été fait

`core/emit-react.ts` (`generateCss`) émet désormais, en tête de chaque `.module.css` généré, une règle par racine de premier niveau (`topRoots(contract)`) :
`.<nom>, .<nom> *, .<nom> *::before, .<nom> *::after { box-sizing: border-box; }` — calque exact de `core/emit-html.ts:131-143`. Les 34 contrats étant tous single-root aujourd'hui (vérifié : aucun `anatomy` à plus d'une clé), la règle générée est partout `.root, .root *, …`. `npm run build` a régénéré les 34 `.module.css` (+7 lignes chacun, confirmé par `git diff --stat`) ; les 3 re-pins (`evals/golden.json`, `figma-sync/plugin/engine.receipt.json`, `examples/polaris/figma/*.figma.js`) sont faits et vérifiés verts (T015-T017).

## 2. Re-mesure — deux instruments, deux couvertures disjointes

**Fait établi d'abord (docs-first, `causes.json` § DW-014-002, `whyTheInstrumentCannotSeeIt`)** : le harnais de parité visuelle (`extract:figma:visual`) rend exclusivement via `emitHtml` (`extract/figma/visual-parity/render.ts:31,767` — jamais `emitReact`). Il ne peut structurellement PAS voir un changement qui ne touche que `emit-react.ts` : `emitHtml` avait déjà la règle. C'est le fait documenté qui a motivé cette réparation en premier lieu, pas une découverte de cette re-mesure.

### 2a. `npm run extract:figma:visual` (40 lignes de parité visuelle)

Comparé en pleine précision aux `avant` rows de T005 (`specs/015-…/proofs/registre/avant.json`) : **0/40 lignes bougent**, y compris les 5 contrats du rayon que cet instrument couvre (accordion-row, carte, google-reviews, review-card, textarea). Conforme à la note ci-dessus — attendu, pas un signal d'échec.

### 2b. Audit d'organismes (rend le VRAI composant React livré — `render-react.ts` : « a real file under `src/components/**` »)

Seuls 4 des 9 contrats du rayon sont des sujets d'audit d'organismes (coordonnees, faq, footer, sav — les 5 autres n'existent que côté parité visuelle). Re-mesuré dans un dossier scratch jetable (`--out-dir` pointé hors de `specs/`, jamais écrit dans un registre officiel) pour ne pas perturber l'« avant » verrouillé de T005 :

| Sujet | avant (T005) | après (post-fix) | delta | dans le rayon ? |
|---|---:|---:|---:|---|
| `sav/sav-master-defaults` | 0.6652 % | 20.8109 % | **+20.146** | oui |
| `footer/footer-master-defaults` | 1.0440 % | 12.0141 % | **+10.970** | oui |
| `faq/faq-master-defaults` | 3.6723 % | 4.8193 % | **+1.147** | oui |
| `coordonnees/coordonnees-master-defaults` | 0.5223 % | 0.5223 % | 0 (bit-à-bit identique) | oui — voir §3 |
| `devis`, `hero`, `presentation`, `texte-seo` | — | — | 0 chacun | non — inchangés, comme attendu |
| `reassurances/reassurances-disposition-4-cartes` | 14.9228 % | 14.9229 % | +0.0000870 | non (hors rayon ; bruit de rendu résiduel, sans rapport avec box-sizing — DW-006 déjà attribué) |

**Aucun chiffre ne bouge hors des 9** : les 4 contrats d'organisme hors rayon (devis, hero, presentation, texte-seo) sont strictement inchangés ; le micro-bruit de reassurances (0.00009 pt, 5 ordres de grandeur sous le seuil) est un résidu de rendu, pas un mouvement attribuable.

## 3. `coordonnees` — le zéro expliqué, pas supposé

Le contrat porte le défaut (`root.parts.wrapper` : `width: 576px` + `padding-block/inline: 48px` — 672 px rendus en content-box, 576 px en border-box, delta réel de 96 px) et la CSS générée le confirme (`box-sizing: border-box` présent, `.wrapper { width: 576px; padding-block: 48px; padding-inline: 48px; }` inchangés par ailleurs). Pourtant `pixels.rawPct` ne bouge pas d'un bit. Cause identifiée, pas supposée :

`extract/figma/organism-audit/pilot.ts:329-337` **épingle délibérément** la largeur du rendu à la largeur de la boîte Figma (`rootWidthCss` = `document.absoluteBoundingBox.width`) — « sans quoi un organisme sans largeur intrinsèque remplit le viewport et le delta résultant mesure le harnais, pas le composant ». Le `#root` du harnais (le point de montage React, PARENT du `.root` généré par CSS Modules) reçoit donc `width: <largeur Figma>px` en dur. `.root` (`display:flex`, largeur `auto`) hérite cette contrainte externe (une boîte de bloc à largeur `auto` remplit son conteneur). `wrapper` est un enfant flex SANS `min-width` ni `flex-shrink:0` : avec `googleMap` fixé à 1152 px, l'espace qui LUI reste est `<largeur forcée de root> − 1152`. En content-box, `wrapper` VEUT 672 px mais le flex-shrink par défaut le comprime à l'espace disponible ; en border-box, `wrapper` VEUT exactement cet espace disponible et ne se comprime pas. **Les deux convergent vers le même rendu final sous une largeur de conteneur épinglée** — c'est une propriété du calcul flexbox, pas un artefact de mesure ou un correctif qui n'aurait pas pris.

Conséquence : le fix est réel et vérifié (CSS générée + arithmétique), mais **invisible à un harnais qui épingle la largeur** pour cette part précise (flex-shrinkable, sans largeur minimale). `footer` (racine à largeur littérale propre, pas `auto`/flex-fill) et `faq`/`sav` ne bénéficient pas de la même absorption — d'où leur mouvement mesuré. T019 (comparaison directe, non contrainte) est l'instrument qui prouve `coordonnees` et les 5 contrats non couverts par l'audit d'organismes.

## 4. Verdict

Cause `box-model-unification` attribuée aux 9 contrats du rayon. Aucun résiduel silencieux : chaque zéro mesuré est expliqué par le mécanisme de l'instrument qui le produit, jamais affirmé sans preuve. `attributions.json` (registre 015) n'a pas besoin d'entrée ici — aucune des lignes ci-dessus n'a été écrite dans un `avant.json`/`apres.json` OFFICIEL de 015 (la comparaison est un contrôle intermédiaire en scratch ; l'« après » officiel de clôture, Phase 7, re-mesurera dans le registre réel et portera ses propres attributions).
