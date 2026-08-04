# Reçu — défaut découvert : `ds.sav` `wrapper`/`imgGroup` portent des valeurs content-box, plus correctes sous border-box

**Date** : 2026-08-04 · **Découvert pendant** : conversion littéraux→tokens de Lot A (T040, agent délégué) — signalé en transparence par l'agent (deux descriptions de `sav.contract.json` restées fausses après le passage border-box de Phase 3).
**Statut** : **différé, non réparé ici** (décision owner, hors périmètre FR-012 de Phase 4 — une conversion pure ne change aucune valeur).

## Le fait, vérifié contre le dump Figma commité

`extract/figma/visual-parity/out/_cache/nodes-d9FYAUcqdcNtsuaMgLefvJ-2108_3105.json` (nœuds réels, `absoluteBoundingBox`) :

| Part | Nœud Figma | bbox réelle | Littéral/token porté par le contrat | Écart |
|---|---|---:|---:|---:|
| `wrapper` | `2169:6188` (`layoutMode: undefined`, pas d'auto-layout) | **641×561** | **546×513** (`size.sav.wrapper-w/-h`) | −95px largeur, −48px hauteur |
| `imgGroup` | `2169:5846` (`layoutMode: undefined`) | **647**×561 (largeur) | **644** (`size.sav.img-group-w`) | −3px largeur |

Les deux descriptions du contrat (non modifiées, `literals`/`literalsByProp` non concerné ici — ce sont des champs `description` narratifs) le disent elles-mêmes : `wrapper` "546 + 48 + 47 = les 641px observés" et `imgGroup` "644 + 3 = les 647px observés" — la valeur portée (546, 644) est délibérément le TOTAL observé MOINS le padding, un calcul valide seulement si le CSS généré est `content-box` (padding qui S'AJOUTE à `width`).

## Pourquoi c'est un défaut vivant, pas juste une description obsolète

Phase 3 (US2, T013, ce spec) a déclaré `box-sizing: border-box` globalement sur la surface `react` livrée. Sous `border-box`, `width` INCLUT le padding — donc `width: 546px` rend désormais une boîte totale de 546px, pas 641px. **Le rendu a rétréci de 95×48px pour `wrapper` et 3px pour `imgGroup`**, sans qu'aucun chiffre de contrat n'ait changé : c'est le changement de RÈGLE CSS (Phase 3) qui a révélé un littéral déjà faux, jamais visible avant parce que `content-box` compensait accidentellement l'erreur.

**Comparaison qui isole la cause** : `ds.coordonnees` porte le même motif apparent (`width` + padding sur une part nommée `wrapper`), mais son nœud Figma (`2104:2879`) est un **vrai frame auto-layout** (`layoutMode: VERTICAL`, `padding: 48/48/48/48` natif Figma) — Figma calcule déjà `absoluteBoundingBox.width` (576px) INCLUANT le padding, comme `border-box`. `coordonnees.wrapper` porte donc la bonne valeur sans le savoir ; `sav.wrapper`/`imgGroup` ne sont PAS des frames auto-layout Figma (`layoutMode: undefined` — un frame libre, padding déduit a posteriori des positions absolues des enfants par l'auteur du contrat) et leurs littéraux ont été calculés à la main sous l'hypothèse `content-box`, qui ne tient plus.

## Pourquoi ce n'est pas réparé dans ce passage

FR-012 (Phase 4, ce spec) : une conversion littéral→token est PURE — aucune variation de valeur, sinon elle devient une réparation attribuée qui doit être nommée et mesurée séparément (patron déjà établi : `DW-001/004/005`). Changer 546→641 ici mélangerait un déplacement mécanique (T040) et une correction géométrique (hors T040), cassant la garantie « 0 variation attendue » du registre avant/après.

## Recommandation (décision owner déjà prise : différer)

**Réparation proposée pour plus tard** (Phase 6/US3 de ce spec est le foyer naturel — « réparations mesurées à 0 » — mais **T056–T063 ne nomment PAS ce défaut aujourd'hui** ; ce reçu sert de signalement, pas d'ajout silencieux à `tasks.md`) :
- `ds.sav` `wrapper` : `size.sav.wrapper-w` 546px → **641px**, `size.sav.wrapper-h` 513px → **561px**.
- `ds.sav` `imgGroup` : `size.sav.img-group-w` 644px → **647px**.
- Les deux descriptions narratives (actuellement fausses : elles affirment encore un calcul content-box et « la feuille générée ne déclare pas box-sizing: border-box », faux depuis T013) sont à réécrire dans la même passe.
- `specs/015-geometrie-gouvernee/proofs/recus/box-model-unification.md` §2 (tableau `ds.sav`) et son verdict SC-003 méritent une note de correction : la ligne `sav` y est actuellement lue comme confirmant le fix (mouvement mesuré dans le sens attendu), alors que ce mouvement s'avère être une AGGRAVATION pour `wrapper`/`imgGroup` spécifiquement (éloignement de Figma, pas rapprochement) — **la direction du mouvement seule ne suffisait pas à conclure**, il fallait aussi vérifier la valeur cible contre le bbox Figma réel, ce que ce reçu fait a posteriori.

## Ce qui N'est PAS affecté

- Les 72 conversions littéral→token de Lot A (dont ces 2 sites) sont correctes AU SENS DE T040 : elles déplacent la valeur EXISTANTE (fausse ou pas) sans la modifier — c'est le contrat, exactement, de FR-012.
- Les 7 autres contrats du rayon Phase 3 (`accordion-row`, `carte`, `coordonnees`, `faq`, `footer`, `google-reviews`, `review-card`, `textarea`) ne sont PAS automatiquement suspects par ce reçu — `coordonnees` est vérifié sain ci-dessus (vrai auto-layout Figma) ; `faq`/`footer` n'ont pas été re-vérifiés contre leur bbox Figma réel ici (hors périmètre de cette investigation ponctuelle, déclenchée par le signalement de l'agent Lot A sur `sav` spécifiquement) et restent à l'état où `box-model-unification.md` les a laissés.
