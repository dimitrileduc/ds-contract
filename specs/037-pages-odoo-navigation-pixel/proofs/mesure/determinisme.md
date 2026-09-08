# T058 — Le déterminisme de la mesure, et ce qu'il couvre EXACTEMENT

Date : 2026-09-08 · page **Motorisation** · deux mesures consécutives, aucun changement entre les deux.

| Largeur | `scorePct` | `ecartHauteurPx` | `diffPixels` | empreinte Odoo | empreinte Figma |
|---|---|---|---|---|---|
| 390 | 3.28 % → **3.28 %** | −1 → **−1** | 62 705 → 62 693 | ≠ | = |
| 834 | 1.95 % → **1.95 %** | −1 → **−1** | — | ≠ | = |
| 1200 | 19.11 % → **19.11 %** | −52 → **−52** | 805 663 → 805 644 | ≠ | = |
| 1728 | 1.38 % → **1.38 %** | 0 → **0** | — | ≠ | = |

## Ce qui est déterministe, et c'est ce que le rapport présente

`scorePct` et `ecartHauteurPx` sont **identiques aux quatre largeurs** — les deux nombres que le rapport montre,
et les deux que SC-005 nomme. La vue Figma est identique à l'empreinte près : le cache du pont est stable.

## Ce qui ne l'est PAS, et ce n'est pas caché

Le **compte exact de pixels différents** bouge de 12 à 19 unités d'une passe à l'autre — sur 1,9 million de pixels à
390, soit **0,0006 %**. La capture Chromium n'est donc pas reproductible au pixel près : un lissage de texte ou un
décodage d'image varie d'un lancement de navigateur à l'autre. Le score à deux décimales absorbe cette variation ;
le compte brut, non.

**Le schéma de rapport (data-model §8) annonçait « mêmes `scorePct`, `ecartHauteurPx`, `sha256` ». La partie
`sha256` est FAUSSE, et c'est mesuré, pas supposé.** Elle est corrigée ici plutôt que reconduite : le rapport
continue de porter l'empreinte — elle sert à retrouver une capture — mais elle n'est pas un critère de déterminisme.

## Un défaut d'instrument trouvé en chemin, et corrigé

L'empreinte de la capture Odoo portait d'abord sur les **octets du PNG**. Deux captures aux pixels
**rigoureusement identiques** (`image-parity` : `identical`, 0 pixel) donnaient des fichiers de **1 123 307** et
**1 124 418** octets : l'encodeur de Chromium ne rend pas le même flux d'un appel à l'autre. L'empreinte porte
désormais sur les **pixels décodés** (largeur, hauteur, octets RGBA) — sur ce que la mesure regarde. Sans ce
correctif, le déterminisme aurait échoué sur une variation qui n'existe pas à l'écran, et une page parfaitement
stable aurait eu l'air instable.
