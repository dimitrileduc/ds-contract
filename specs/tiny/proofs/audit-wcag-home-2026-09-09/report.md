# Audit de conformité WCAG 2.2 — page d'accueil Piqueray

## Périmètre

| | |
|---|---|
| **Page auditée** | La page d'accueil, `http://localhost:8109/` (instance `piqueray-odoo-037`, montant le worktree `comet-yogurt`) |
| **Référentiel** | WCAG 2.2, niveaux **A et AA** — 55 critères |
| **Largeurs** | 1440, 640 (équivalent zoom 200 %), 390 et 320 |
| **Date** | 2026-09-09 |
| **Outils** | `@a11y-skills/audit` (axe-core + 10 vérifications dédiées), Chromium épinglé du dépôt, mesures maison au pixel |
| **Exclusions** | Les 8 autres pages du site ; aucun lecteur d'écran réel ; aucune analyse image par image de la vidéo |

## Résultat

| Niveau | Conforme | Non conforme | Non testé | Sans objet |
|---|---:|---:|---:|---:|
| A | 20 | 1 | 2 | 9 |
| AA | 10 | 4 | 3 | 6 |
| **Total** | **30** | **5** | **5** | **15** |

**Taux de conformité sur les critères effectivement applicables et testés : 30 sur 35, soit 86 %.**
Cinq critères restent non testés : ils ne comptent ni pour ni contre.

## Les 5 non-conformités

### 1.4.10 Redistribution (AA) — la page défile horizontalement sur un petit écran

À une largeur de 320 px, la page mesure **344 px de large** : il faut défiler latéralement pour lire.
La cause est mesurée : les cartes de catégories font 320 px de large alors que la page leur en laisse 296 (24 px de marge). Elles ne se réduisent pas avec la marge.

*Preuve* : `reflow-result.json`, 49 nœuds débordants ; `document.scrollWidth` 344 contre `clientWidth` 320.
*Correction* : rendre la largeur de la carte relative à son conteneur au lieu d'une largeur fixe.

### 1.4.12 Espacement du texte (AA) — les noms de produits sont tronqués

Les 8 titres du carrousel de produits sont coupés par une ellipse **avant même toute modification** : « Bouton poussoir Hörmann FIT2-1-868-BS » a besoin de 335 px et n'en reçoit que 238. Quand un lecteur applique l'espacement de texte prévu par la règle, la perte s'aggrave.

*Nuance importante* : le texte complet reste dans le code, donc un lecteur d'écran l'entend en entier. **C'est l'utilisateur voyant qui perd l'information.**
*Preuve* : `text-spacing-result.json`, 1 violation confirmée, 8 titres mesurés.
*Correction* : laisser le titre passer à la ligne plutôt que le couper.

### 1.4.3 Contraste minimum (AA) — les initiales des avis Google

Dans les cartes d'avis, la lettre initiale est **blanche sur un rond gris-bleu** `rgb(155,164,181)` : contraste mesuré **2,51** alors que 4,5 est requis. 5 occurrences.

*Preuve* : `contraste-mesure.json`. Méthode : chaque zone de texte capturée deux fois, la seconde avec les lettres rendues transparentes, pour isoler le fond réellement peint sous les glyphes.
*Tout le reste est conforme* — y compris le titre du hero sur la vidéo (17,66) et le titre de la section Devis sur photo (6,13).
*Correction* : assombrir le rond, ou passer l'initiale en foncé.

### 1.3.1 Information et relations (A) — deux sauts de niveau de titre

`h1` → `h3` dans le hero, `h2` → `h4` dans les cartes de réassurance. La navigation par titres saute des niveaux.

*À savoir* : **c'est un écart accepté par le propriétaire le 2026-09-04**, consigné dans `specs/tiny/accessibilite-home-odoo.md`. Un audit doit le compter comme non conforme même accepté — c'est la différence entre une décision et une conformité.

### 2.4.5 Plusieurs moyens (AA) — un seul chemin vers les pages

Ni recherche, ni plan du site. Le menu principal est le seul moyen d'atteindre une page.

*Contre-argument recevable* : les cartes de catégories et les liens du pied de page mènent aussi aux autres pages, ce qu'un auditeur peut compter comme second moyen. Sur un site de 9 pages, la lecture est défendable dans les deux sens.
*Correction la moins chère* : activer la page « plan du site » d'Odoo.

## Les 5 critères non testés

| Critère | Pourquoi |
|---|---|
| 1.4.1 Utilisation de la couleur (A) | Demande de vérifier que rien n'est signalé par la couleur seule, sur tout le contenu. Non fait systématiquement. |
| 2.3.1 Trois flashs (A) | Demande une analyse image par image de la vidéo du hero. Non faite. |
| 1.4.11 Contraste des éléments non textuels (AA) | Aucun outil automatique ne couvre les bordures de champs, icônes et états. Mesure manuelle à faire. |
| 3.1.2 Langue des passages (AA) | Les termes techniques allemands (Woodgrain, Silkgrain) n'ont pas été passés en revue. |
| 2.5.5 / assimilés | Hors niveau AA. |

## Deux verdicts « conforme » que je signale comme contestables

**2.2.2 Pause, arrêt, masquage (A)** — la vidéo du hero tourne en boucle, 42 secondes, **sans aucun bouton de pause**. Elle respecte en revanche le réglage système « réduire les animations » : mesuré, elle ne démarre pas du tout dans ce cas. La plupart des auditeurs acceptent ce réglage comme le mécanisme exigé. Un auditeur strict exigera un contrôle dans la page. **Risque réel, correction peu chère.**

**1.2.1 Contenu vidéo seul (A)** — la vidéo n'a aucune piste audio (vérifié dans le fichier) et ne transporte aucune information : son image d'affiche montre la même façade. Elle porte un nom accessible vide. Pour être inattaquable, elle devrait porter `aria-hidden="true"`.

## Ce qui est conforme, et solidement

- **1.1.1** : 26 photos décrites, les décoratives explicitement vides, **zéro contrôle sans nom** dans l'arbre d'accessibilité.
- **2.1.1 / 2.1.2** : 44 éléments atteignables au clavier, sous-menu et menu mobile pilotables, aucun piège au clavier.
- **2.4.7** : les 44 éléments ont un indicateur de focus visible. Aucune exception.
- **2.4.11** : aucun élément collant ou fixe sur la page — rien ne peut recouvrir le focus.
- **2.4.3** : l'ordre de tabulation suit l'ordre visuel, de haut en bas.
- **3.1.1** : `fr-BE` (corrigé le jour même — la page se déclarait en anglais).
- **2.4.1** : lien d'évitement présent et fonctionnel.
- **1.3.4, 2.2.1, 4.1.2** : orientation libre, aucune limite de temps, rôles et états corrects.

## Limites de méthode, nommées

1. **Aucun lecteur d'écran réel n'a été utilisé.** Les outils lisent l'arbre d'accessibilité calculé par le navigateur, ce qui n'est pas la même chose que ce que NVDA ou VoiceOver annonce.
2. **La batterie automatique a dû passer par un relais local.** La vidéo de fond du hero boucle, donc sa requête réseau ne se termine jamais et 11 des 15 vérifications échouaient en délai dépassé. Un relais coupe la vidéo pour cette batterie-là. **Conséquence assumée : les vérifications automatiques ont vu l'image d'affiche, pas la vidéo.** Toutes les mesures de contraste, elles, ont été refaites sur le site réel, vidéo comprise.
3. **Une seule page.** Les 8 autres pages partagent l'en-tête, le pied et la plupart des blocs, donc la majorité de ces verdicts s'y transpose — mais ce n'est pas mesuré.
4. **La détection automatique ne couvre que 30 à 40 % des problèmes d'accessibilité.** Ce rapport combine automatique, clavier et mesure manuelle, mais il ne remplace pas un test avec de vrais utilisateurs.

---

# Re-mesure après correctifs — 2026-09-09, même jour

Batterie complète rejouée (11 vérifications, 0 erreur) après les deux corrections décidées
par l'owner. Preuves : `apres/`.

## Résultat

| Niveau | Conforme | Non conforme | Non testé | Sans objet |
|---|---:|---:|---:|---:|
| A | 21 | 1 | 2 | 8 |
| AA | 11 | 2 | 3 | 7 |
| **Total** | **32** | **3** | **5** | **15** |

**32 conformes sur 35 critères testés — 91 %** (86 % avant).

## Ce qui a changé

| Critère | Avant | Après | Preuve |
|---|---|---|---|
| **1.4.10 Redistribution** (AA) | Fail | **Pass** | Défilement horizontal réellement atteignable : **0 px sur les 9 pages** (`window.scrollTo(9999,0)` laisse `scrollX` à 0). Avant : 7 pages sur 9 défilaient, document de 344 px pour une fenêtre de 320. |
| **2.4.5 Plusieurs moyens** (AA) | Fail | **Pass** | Lien « Plan du site » → `/pages` présent sur **9 pages sur 9**, blanc et souligné. `/pages` porte AUSSI un champ de recherche : les deux moyens sont fournis. |

## Les 3 non-conformités restantes sont TOUTES des écarts assumés par l'owner

Elles ressortiront à chaque audit futur. C'est attendu, et c'est la différence entre un
défaut et une décision.

| Critère | Constat | Décision |
|---|---|---|
| **1.4.12 Espacement du texte** (AA) | Les 8 titres du carrousel produit sont tronqués par une ellipse. Le texte complet reste dans le code : un lecteur d'écran l'entend en entier, c'est l'utilisateur voyant qui perd l'information. | **VOULU**, 2026-09-09 |
| **1.4.3 Contraste minimum** (AA) | Initiales des avis Google : blanc sur `rgb(155,164,181)`, ratio mesuré **2,51** pour 4,5 requis. 5 occurrences. Seul échec de contraste de la page. | **VOULU**, 2026-09-09 |
| **1.3.1 Information et relations** (A) | Deux sauts de niveau de titre : `h1`→`h3` dans le hero, `h2`→`h4` dans les cartes de réassurance. | **ACCEPTÉ**, 2026-09-04 (confirmé le 09-09) |

## Deux faux positifs de l'outil, tranchés à la mesure

1. **`reflow-overflow`, 43 nœuds** — ce sont les fiches du carrousel produit, dont la piste
   fait 1896 px. Elle est **enfermée** dans une boîte de 320 px en `overflow-x: auto` qui
   défile pour elle seule : la page, elle, ne bouge pas. L'outil signale le débordement sans
   vérifier le confinement. **La mesure qui tranche est le défilement réellement atteignable,
   jamais `scrollWidth`** — le compteur reste à 45 nœuds signalés alors que le critère passe.
2. **`reflow-clipped-text` et `text-spacing`, 1 nœud chacun** — le lien d'évitement, réduit
   à 1 × 1 px tant qu'il n'a pas le focus. C'est le motif standard d'un lien d'évitement,
   pas un défaut.

## Ce qui n'a pas bougé

Les 5 critères non testés le restent (utilisation de la couleur, trois flashs, contraste des
éléments non textuels, langue des passages). Les deux verdicts signalés comme contestables
au premier rapport le restent aussi : la vidéo du hero n'a toujours aucun bouton de pause
(elle respecte le réglage système « réduire les animations », mesuré), et elle gagnerait un
`aria-hidden="true"` pour être inattaquable.
