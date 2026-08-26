# Handoff — primitives et typographie

Toutes les valeurs ci-dessous sont des observations candidates du pilote
HeroVideo. Elles ne sont ni des tokens responsive sémantiques ni des Text Styles
globaux validés.

## Compact

Le membre 2580:7378 possède six bindings attachés :

| Propriété | Primitive existante | Variable ID | Valeur observée |
| --- | --- | --- | ---: |
| minHeight | space/597 | VariableID:2188:9590 | 597 |
| paddingTop | space/24 | VariableID:2183:7969 | 24 |
| paddingRight | space/24 | VariableID:2183:7969 | 24 |
| paddingBottom | space/24 | VariableID:2183:7969 | 24 |
| paddingLeft | space/24 | VariableID:2183:7969 | 24 |
| itemSpacing | space/24 | VariableID:2183:7969 | 24 |

Le titre garde le rôle Titre Hero vidéo, la famille Montserrat, le poids 400 et
le contenu. L'override local autorisé applique fontSize 32, lineHeight 40 et
textAlignHorizontal CENTER sur le chemin 3/0. Son statut est
pending-responsive-text-style.

## Desktop

Le membre 2580:7385 possède six bindings attachés :

| Propriété | Primitive existante | Variable ID | Valeur observée |
| --- | --- | --- | ---: |
| minHeight | space/597 | VariableID:2188:9590 | 597 |
| paddingTop | space/48 | VariableID:2183:7970 | 48 |
| paddingRight | space/48 | VariableID:2183:7970 | 48 |
| paddingBottom | space/48 | VariableID:2183:7970 | 48 |
| paddingLeft | space/48 | VariableID:2183:7970 | 48 |
| itemSpacing | space/24 | VariableID:2183:7969 | 24 |

Le titre garde le même rôle, la famille Montserrat, le poids 400 et le contenu.
L'override local autorisé applique fontSize 40, lineHeight 48 et
textAlignHorizontal CENTER sur le chemin 3/0. Son statut est
pending-responsive-text-style.

## Wide

Le membre historique 2151:5552 conserve le binding height vers
size/hero-video/root, VariableID:2434:5919, résolu à 720. Son titre conserve le
Text Style historique Titre Hero vidéo et ses métriques 44/48, sans override
responsive local.

## Règles de promotion future

- Les 13 bindings observés sont tous attachés après application et au second
  passage ; aucune variable n'a été créée par 028.
- Les deux overrides typographiques sont locaux aux nouveaux membres et reliés
  à la décision owner H2-design-v1.
- Une répétition sur plusieurs composants de la Home est nécessaire avant de
  nommer une variable responsive, un mode ou un Text Style partagé.
- La future campagne doit soit promouvoir ces observations par le contrat et
  les fondations gouvernées, soit les superséder explicitement. Elle ne doit pas
  les généraliser à partir du seul HeroVideo.

Sources : [bindings H2](../inventory/H2-bindings.json),
[typographie H2](../inventory/H2-typography.json) et les
bindingFacts/typographyFacts des reçus run-005.
