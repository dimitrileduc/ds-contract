# AccordionRow — reçu du pilote Figma → contrat → code

Date : 2026-07-28  
Checkpoint : `45e2a7d5a950e3d6ccc2a0dd62982b7c288210c5`

## Verdict

Le `COMPONENT_SET` Figma est l'oracle immuable. L'extraction automatique est fidèle et son eval passe. Le contrat présent dans le checkpoint avait ensuite remplacé manuellement l'anatomie extraite par un wrapper `trigger`; cette normalisation provenait du commit WIP `45e2a7d`, pas de Figma. Le pilote adopte désormais l'anatomie visuelle proposée. Les mints provisoires ont été revus vers les tokens sémantiques ou littéraux déjà établis, sans promotion globale.

Les décisions code absentes de Figma sont conservées explicitement : bouton natif transparent et positionné sans contribution au layout, toggle local, `aria-expanded` et `aria-controls`. Elles ont été vérifiées au clavier et à la souris sans réécrire l'anatomie Figma.

## Identité et variantes

- id contrat : `ds.accordion-row`
- fichier Figma : `d9FYAUcqdcNtsuaMgLefvJ`
- componentSetKey : `6b15207fffd75082f1f8c423eab771aa6709179d`
- nodeId : `2059:1417`
- version Figma validée : `2381229993207753432`
- Grand/Fermé : `1550 × 64`
- Grand/Ouvert : `1550 × 120`
- Petit/Fermé : `1550 × 40`
- Petit/Ouvert : `1550 × 80`

## Captures Figma validées

Toutes les captures viennent de l'API Figma Images en lecture seule, échelle 2, et sont indexées par la version du fichier.

| Variante | Dimensions PNG | SHA-256 |
|---|---:|---|
| Grand/Fermé | 3100 × 128 | `725eed686df21942a3844754c01a7c306df9de7102be4950401a1c4dd0adc861` |
| Petit/Fermé | 3100 × 80 | `167dcb17e90fe20352238029354f7a49d954f167f994cd29a6a5c3ff3bd327ae` |
| Grand/Ouvert | 3100 × 240 | `8e13af7eb78ef61c197a1d56a1634d2466e300afd7696ca2e238b251d1dda315` |
| Petit/Ouvert | 3100 × 160 | `d62c40dd0531cea9fa1fc81b0d664083f3c934afd489b2fd9e07ca245e20bf9c` |

## Classification des changements du WIP

| Changement | Classe | Décision |
|---|---|---|
| dump live, bbox, auto-layout, padding, gap, traits, typographie, visibilité | fait extrait de Figma | conservé |
| bouton natif, état non contrôlé, toggle, `aria-expanded`, `aria-controls` | décision sémantique code | conservée via un overlay sans contribution au layout |
| capture des boîtes texte fixes et tokens mintés | évolution générique du moteur | conservée ; eval d'extraction vert |
| React, CSS, Storybook, catalogue, scripts Figma | sortie générée | jamais éditée directement |
| `.pi/accordion-*`, caches PNG et triptyques de travail | artefact temporaire | non-source ; seules les preuves utiles sont conservées |

## Parité après adoption visuelle

| Variante | Diff masqué | Lecture |
|---|---:|---|
| Grand/Fermé | 0,00 % (`0,13 %` brut) | conforme ; résidu limité au texte |
| Petit/Fermé | 0,00 % | conforme |
| Grand/Ouvert | 0,00 % (`0,08 %` brut) | conforme ; résidu limité au texte |
| Petit/Ouvert | 0,00 % | conforme |

Les quatre boîtes DOM mesurent exactement `1550 × 64/120/40/80`. Le comparateur ancre désormais les images sur cette géométrie commune lorsque la boîte DOM et l'export Figma ont exactement les mêmes dimensions. Cela retire le faux déplacement de bordure autrefois créé par le recentrage de boîtes d'encre typographique différentes.

## Commandes et résultats

- `npx tsx extract/figma/accordion-row-source-cleanup-check.ts` : succès.
- `npm run tokens` : succès, 61 propriétés CSS ; aucun token provisional `imported.*` promu vers la couche globale.
- `npm run generate` : succès, 34 composants générés.
- `npm run typecheck` : succès.
- `npm run extract:figma:visual -- accordion-row` : quatre comparaisons exécutées ; scores ci-dessus.
- `npx tsx evals/fixtures/icon-variant-svg-size-check.ts` : rouge avant correction, vert après ; les dimensions variantées atteignent désormais le SVG peint sur React et HTML.
- `npx tsx evals/fixtures/bottom-inset-border-check.ts` : vert ; la bordure basse Figma est peinte en inset sur React et HTML sans ajouter un pixel à la boîte.
- `npx tsx evals/fixtures/visual-root-alignment-check.ts` : vert ; une variation de boîte d'encre ne déplace plus une bordure identique lorsque les cadres DOM/Figma coïncident.
- navigateur isolé, port 5201 : dimensions exactes ; trois instances FAQ indépendantes ; clic, Entrée et Espace basculent l'état ; chaque `aria-controls` cible un contenu existant.
- `npm run parity` : un seul drift global préexistant et hors périmètre, `Primitives/border-width/1` absent du snapshot de variables Figma. Aucun writeback n'a été lancé.
- `npm run eval` : `116/122` verts. Les trois nouvelles fixtures AccordionRow/comparateur, l'extraction, la génération déterministe, les goldens et le showcase Polaris sont verts. Six échecs sont indépendants du pilote : quatre evals contaminés par le drift global `Primitives/border-width/1`, un ancien eval d'extraction de fill non lié et un ancien eval MemberPicture. Aucun de ces échecs ne justifie une mutation Figma ou une modification d'AccordionRow.

Erreur humaine observée puis annulée : des hauteurs avaient été ajoutées manuellement au contrat pour réduire le diff. Elles ont été supprimées avant cette adoption. Aucun push, update, writeback, script de génération Figma ou mutation du canvas n'a été exécuté.

## Répétabilité

- calcul déterministe : extraction, hashes, génération et comparaison par scripts ;
- orchestration captures/comparaisons : outil PI `image_parity` ou runner visual-parity ;
- permissions et ordre de diagnostic : futur skill, seulement après validation complète ;
- adoption des tokens, sémantique native et appréciation visuelle : validation humaine.
