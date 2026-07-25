# Preuve pixel — Réalisations (T095-T096)

**Instrument** : `npm run pages:compare` (pixelmatch, seuil 0.1, dimensions strictes),
transport b-fetch. `before` = `.page-parity/realisations/before/` (capturé avant toute
mutation, 3 pages, valide et réutilisé tel quel — jamais recapturé). `after` =
`.page-parity/realisations/after-fixed/` (capturé après la correction du texte, voir
Incident ci-dessous).

## Historique — une régression trouvée entre construction et preuve finale

La construction (2 passes, chacune interrompue par une erreur d'infrastructure réelle) a
overridé les 9 photos de la grille sur Portes de garage résidentielles mais oublié les 2
overrides de texte du header — l'instance montrait le texte par défaut de la variante
(= le contenu d'industrielles) au lieu du vrai texte de résidentielles. **Trouvé par une
revue indépendante avant tout commit**, via un diff pixel réel de 13 860 px localisé
exactement dans la bande texte (zone photo pixel-parfaite). Corrigé directement (texte
restauré depuis la capture `before`, transcrit à l'œil + recherche de sous-chaîne pour les
plages de gras — jamais de comptage manuel), reverifié par lecture fraîche séparée, puis
recapturé et recomparé. Détail complet : `decisions.md` et `audits/realisations.md`
§Incident.

## Verdict final (après correction)

| Maquette | Statut | diffCount | Lecture |
|---|---|---|---|
| Portes d'entrée | **identical** | 0 | page ancre, 0 override |
| Portes de garage industrielles | diff | 31 | AA sous-pixel (re-rasterisation frame→instance, zoom 3× confirmé glyphes identiques) |
| Portes de garage résidentielles | diff | 70 | **après correction** — descendu de 13 860 (régression) à 70, même famille de bruit qu'industrielles |

Les 2 résidus (31, 70 px) sont largement sous l'enveloppe de bruit déjà acceptée cette
spec (< 0,001 % chacun, sur des pages de ~1,7-2,8 millions de pixels).

## Limite honnête sur le texte restauré

Le texte de résidentielles vient d'une image (capture `before`), pas d'une relecture
`.characters` live — la copie brute source avait déjà été remplacée avant que ce texte ne
soit lu en direct par un agent. La fidélité **visible** est prouvée par le diff pixel
(13 860→70) et l'inspection du crop réel (texte identique avant/après, aucun fantôme).
La fidélité au caractère invisible près (espace de fin, etc.) n'est pas garantissable avec
la même certitude qu'ailleurs — nommé dans le ledger (`non-portable-signalee`, pas
`reportee`), pas glissé sous le tapis.

## Receipts

- Before : `.page-parity/realisations/before/` (3 PNG + manifests, capturés avant toute
  mutation — jamais recapturés)
- After (post-correction) : `.page-parity/realisations/after-fixed/` (3 PNG, receiver nonce
  `5a297bf662716453`)
- Ledger : `ledger/realisations.json` (2 `reportee` + 2 `non-portable-signalee`,
  `pages:ledger:check` exit 0)
- Checkpoints Figma : `003/realisations/{master,adoption}` (posés lors des 2 passes de
  construction, avant les gestes mutants correspondants)
