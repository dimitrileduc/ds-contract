# Audit de conformité WCAG 2.2 — page « Portes de garage résidentielles »

## Périmètre

`http://localhost:8109/portes-residentielles` · WCAG 2.2 niveaux **A et AA** (55 critères) ·
1440, 640 (zoom 200 %), 390, 320 · 2026-09-09 · `@a11y-skills/audit` (axe-core +
10 vérifications dédiées) + mesures maison au pixel. Pas de vidéo sur cette page : la
batterie a tourné directement sur le site, **11 vérifications, 0 erreur**.

## Résultat

| Niveau | Conforme | Non conforme | Non testé | Sans objet |
|---|---:|---:|---:|---:|
| A | 21 | 1 | 2 | 8 |
| AA | 11 | 2 | 3 | 7 |
| **Total** | **32** | **3** | **5** | **15** |

**32 conformes sur 35 critères testés — 91 %.** Même score que la home et que Portes de garage.

## Acquis

| Mesure | Résultat |
|---|---|
| Langue | `fr-BE` |
| Titre de page | « Portes de garage résidentielles Hörmann en Province de Liège » — réel |
| Un seul `h1` | oui, 10 titres |
| Liens qui ne mènent nulle part | **0** |
| Défilement horizontal réel à 320 px | **0 px** |
| Lien « Plan du site » | présent |
| Contrôles sans nom accessible | **0** |
| Images sans description | 4 sur 17 — toutes légitimes (fond de hero, fond de devis, cartes dans un lien déjà nommé) |
| Ressources en 404 | **0** |

## Les 3 non-conformités — toutes des écarts déjà assumés

Aucune nouveauté sur cette page. Les trois sont les décisions de l'owner du 2026-09-09,
reconduites parce que ce sont les mêmes composants.

| Critère | Constat mesuré | Décision |
|---|---|---|
| **1.4.3 Contraste** (AA) | Initiales des avis : blanc sur `rgb(155,164,181)`, ratio **2,51** pour 4,5. Seul échec de contraste — le titre du hero sur photo est à 11,36, le Devis à 6,14, le texte SEO à 11,85. | VOULU |
| **1.4.12 Espacement du texte** (AA) | Deux avis Google coupés à 3 lignes : 60 px affichés pour 100 réels. « LIRE LA SUITE » mène à l'avis complet. | VOULU |
| **1.3.1 Info et relations** (A) | **UN seul saut de niveau ici** (`h2`→`h4`), contre deux sur la home et sur Portes de garage. Le second saut (`h1`→`h3`) vient des cartes de catégorie en style superposé, absentes de cette page. | ACCEPTÉ (04-09) |

## Faux positifs, tranchés à la mesure

Identiques aux deux pages précédentes : le lien d'évitement réduit à 1 × 1 px tant qu'il n'a
pas le focus (remonte dans trois vérifications), et 8 cibles de menu de 16 px pour lesquelles
l'outil note lui-même que l'exception d'espacement s'applique.

## Limites

Aucun lecteur d'écran réel. Les 5 critères non testés le restent (utilisation de la couleur,
trois flashs, contraste des éléments non textuels, langue des passages).


---

## CORRECTION du rapport — même jour, après l'audit de « Motorisation »

**Ce rapport a sous-évalué le critère 1.3.1.** Il ne retenait que les sauts de niveau de
titre, écart accepté par l'owner. Une sonde dédiée, écrite en auditant Motorisation, montre
qu'il manque aussi des titres : **6 (2 cartes de catégorie empilées, 2 questions de FAQ, titre + sous-titre du texte SEO)** — des textes de 24 à 32 px qui
fonctionnent comme des titres sans en être.

**Pourquoi ça avait échappé** : aucun outil automatique ne peut deviner qu'un texte AURAIT
DÛ être un titre ; il ne voit que les balises présentes. `axe-core` ne signale rien. C'est
exactement l'avertissement du rapport de la passe 1 (2026-09-04) : *« l'absence totale de
titres ne produit qu'UNE alerte automatique — la casse structurelle est invisible à
l'automatisme »*.

**Le verdict de 1.3.1 ne change pas** (déjà non conforme, donc le score reste 32/35), mais
sa CAUSE est double : les sauts acceptés **et** ces titres absents, qui n'ont eux fait
l'objet d'aucune décision. Détail complet et portée sur les 5 pages :
`specs/tiny/proofs/audit-wcag-motorisation-2026-09-09/report.md`.
