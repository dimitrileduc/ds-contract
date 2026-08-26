# Handoff — compositions HeroVideo

Ce document décrit la source Figma finale observée. Il ne définit ni breakpoint
automatique, ni contrat produit, ni règle responsive globale.

## Topologie canonique

Le Container local 2448:4731 contient directement le Component Set HeroVideo
2580:7392. Le set est un catalogue libre avec layoutMode NONE et remplit son
Container. Sa propriété est Presentation et sa valeur par défaut reste Wide.

Les membres utilisent une largeur FIXED uniquement comme aperçu d'authoring dans
le catalogue. Les instances de preuve ou de consommation sont mises en FILL dans
leur parent et la présentation est toujours sélectionnée explicitement.

| Composition | Node ID | Aperçu | Structure | Sélection vérifiée |
| --- | --- | ---: | --- | --- |
| Compact | 2580:7378 | 390 px FIXED | Colonne, groupe titre–CTA centré horizontalement et verticalement, titre centré, min-height 597 + croissance | 320, 390, 834 et paysage court 844×390 |
| Desktop | 2580:7385 | 1200 px FIXED | Colonne, groupe titre–CTA centré horizontalement et verticalement, titre centré, min-height 597 + croissance | 1200 |
| Wide | 2151:5552 | 1728 px FIXED | Composition historique horizontale basse, hauteur 720, titre aligné à gauche | 1440 et 1728 |

Le membre Wide conserve la key historique
36011e51b8bc0b221a1ba6f9108709b5bd1c4490. Le set 2580:7392 est une
identité additive ; il ne remplace pas rétroactivement celle du membre Wide.

## Fixtures et contrôle responsive

Le passage canonique run-005 rejoue 19 scénarios : les fixtures default,
long-title et long-cta aux largeurs 320, 390, 834, 1200, 1440 et 1728, plus le
cas short-landscape 844×390. Chaque scénario sélectionne Compact, Desktop ou
Wide avant la mesure.

Les 19 scénarios ont les mêmes résultats après le premier passage et après le
second passage : largeur racine égale à la largeur demandée, overflow=false,
clippedBy vide, contenu accessible et poster en couverture. Le paysage court
utilise Compact et laisse la racine grandir à 597 px au lieu de couper le
contenu.

Les preuves autoritatives sont les scenarioChecks des deux reçus run-005 et les
38 PNG associés. Le ledger enregistre l'identité et le hash de chaque paire.

## Limites d'usage

- Figma Design ne choisit pas une composition au redimensionnement. Les points
  effectivement vérifiés sélectionnent Compact à 320/390/834, Desktop à 1200 et
  Wide à 1440/1728. Les intervalles historiques sous 992, 992–1399 et dès 1400
  orientent la sélection, mais 028 ne prétend pas avoir testé chaque largeur de
  ces plages en continu.
- Les largeurs 390, 1200 et 1728 décrivent le catalogue d'authoring, pas des
  largeurs fixes de contrat ou de code.
- Les anciennes frames H2 ont été retirées du canvas après installation. Leurs
  identités restent des preuves historiques, pas des surfaces actuelles.
- La campagne Home devra décider comment sélectionner ou promouvoir ces états ;
  028 ne qualifie aucun comportement automatique de production.

## Reprendre la vérification

Commencer par le [ledger](../proofs/ledger.json), puis lire les résumés run-005
verify/first-pass.json, verify/protected-facts.json et
verify/second-pass-noop.json. La lignée run-003 → run-004 → run-005 est expliquée
dans la [preuve de correction](../proofs/phase-4-authoring-layout-correction.md).
