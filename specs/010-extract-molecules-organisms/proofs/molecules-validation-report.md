# Molécules — rapport de validation Figma → contrat → code

Date : 2026-07-28  
Checkpoint de départ : `45e2a7d5a950e3d6ccc2a0dd62982b7c288210c5`

## Protocole

- Figma est resté en lecture seule.
- Les nodes et PNG ont été récupérés par les API REST de lecture, groupés sur la
  version `2381229993207753432`.
- Les contrats et sources génériques ont été générés une fois, puis les sujets
  modifiés ont été comparés en un batch.
- Aucun script Figma produit par `figma:plan` n'a été exécuté.
- React, CSS, Storybook, catalogue et scripts Figma sont des sorties générées ;
  ils n'ont pas été corrigés directement.

## Résultats visuels

| Composant | Variantes | Résultat |
|---|---:|---|
| AccordionRow | 4 | `0,00 %` masqué sur les quatre variantes |
| Avantage | 1 | `0,00 %` masqué |
| CarouselControls | 1 | `0,41 %` masqué |
| Copyright | 1 | `0,00 %` masqué |
| FooterColumn | 1 | `0,09 %` masqué |
| ReviewCard | 1 | `0,00 %` masqué |
| SectionHeader | 2 | Standard `0,00 %`, Avec CTA `0,67 %` masqué |
| Tab | 2 | `3,15 %` masqué ; géométrie exacte, résidu texte nommé |
| Carte | 2 | `36,16 %` / `48,66 %` ; défaut moteur ouvert |
| Field | 2 | `2,20 %` / `5,87 %` ; défaut de composition ouvert |
| MemberCard | 1 | `57,24 %` ; portrait Figma non transporté |
| ProductCard | 1 | `19,12 %` ; image Figma non transportée |
| Realisation | 2 | `99,97 %` / `99,86 %` ; placeholder IMAGE non transporté |
| NavItem | 1 | score nul non concluant ; blanc sur transparent aplati blanc |

Le rapport visuel généré conserve les triptyques et une cause classée pour chaque
ligne au-dessus de 3 %. La file `UNTRIAGED` est vide.

## Défauts et frontières restant ouverts

- `Carte` : les deux variantes demandent des règles d'image distinctes ; l'ombre
  et certains alignements/casse/rich-text ne sont pas encore représentés.
- `Field` : le contrôle slotté ne remplit pas encore la largeur et l'état erreur
  ne propage pas la bordure rouge ni `aria-invalid` au contrôle composé.
- `MemberCard`, `ProductCard`, `Realisation` : les pixels IMAGE sont des overrides
  Figma hors contrat. Ils ne doivent être ni inventés dans le code ni masqués
  silencieusement.
- `NavItem` : le sujet doit être rendu sur une surface sombre et sans largeur
  forcée avant que son score soit probant.
- `Tab` : `role=tab` est présent, mais le contrat de groupe (`tablist`, navigation
  clavier, `aria-selected`, `aria-controls`) reste à définir.

## Validation technique

- `npm run generate` : succès, 34 composants.
- `npm run emitters:check` : succès.
- `npm run catalog` puis `npm run verify:catalog` : succès.
- `npm run figma:plan` : succès local ; scripts produits mais jamais exécutés.
- `npm run typecheck` : succès.
- `npm run build:dashboard` : succès.
- `npm run eval` : `120/125` avant actualisation du golden Field.
- `npm run golden:update` : manifeste recalculé sur les sorties revues ; le contrôle
  golden déterministe redevient vert, soit `121/125`.

Les quatre échecs restants proviennent tous du drift global
`Primitives/border-width/1`, présent dans les tokens du dépôt mais absent des
variables Figma. Ils contaminent `baseline-parity-clean`,
`baseline-acknowledges-without-failing`, `promotion-converges` et
`detect-icon-registry-divergence`. Aucune mutation Figma n'a été utilisée pour
les faire disparaître.

## Répartition du travail

- calcul déterministe : scripts de génération, hashes et comparateur ;
- orchestration : runner visual-parity groupé ;
- diagnostic : audits agents puis revue du pilote ;
- décisions sémantiques, images et limites de fidélité : validation humaine.

