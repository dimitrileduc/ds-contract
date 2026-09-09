# Audit de conformité WCAG 2.2 — page « À propos »

## Périmètre

`http://localhost:8109/a-propos` · WCAG 2.2 **A et AA** (55 critères) · 1440, 640
(zoom 200 %), 390, 320 · 2026-09-09 · `@a11y-skills/audit` + mesures maison au pixel.
Pas de vidéo : batterie directe, **11 vérifications, 0 erreur**.

## Résultat

| Niveau | Conforme | Non conforme | Non testé | Sans objet |
|---|---:|---:|---:|---:|
| A | 21 | 1 | 2 | 8 |
| AA | 11 | 2 | 3 | 7 |
| **Total** | **32** | **3** | **5** | **15** |

**32 conformes sur 35 critères testés — 91 %.**
Le compte est le même que les autres pages, mais **une des trois non-conformités est neuve
et sérieuse** : c'est la première violation confirmée par `axe-core` de tout l'audit.

## LA découverte — 1.4.3 Contraste (AA), 16 occurrences

**Les fonctions des 16 membres de l'équipe sont illisibles.**

| | |
|---|---|
| Couleur du texte | `#f98a0b` — l'orange de la marque |
| Fond | `#ffffff` |
| Taille / graisse | 16 px / 600 |
| Contraste mesuré | **2,42** |
| Exigé | **4,5** |

Ce n'est pas une incertitude à trancher : `axe-core` la classe **violation**, gravité
« serious », fond uni et texte réel — aucune ambiguïté possible. Toutes les autres pages
n'avaient sur ce critère que des *incomplete* (texte sur photo), que la mesure au pixel a
tranchés en conforme.

**Ce n'est pas un des écarts que l'owner a assumés** — c'est un défaut neuf, non décidé.

**Ce n'est pas la faute de l'orange en soi** : le même orange est utilisé pour trois titres
de colonne du pied de page et pour « Suivez-nous », **sur fond sombre**, où il passe très
bien. Le problème est l'orange **sur blanc**, en petit.

**Pourquoi passer en gras ou plus gros ne suffirait pas** : le seuil assoupli pour les
grands textes est 3, et on est à **2,42**. Il faut assombrir la couleur pour cet usage.

## Les 2 autres non-conformités

| Critère | Constat | Statut |
|---|---|---|
| **1.4.12 Espacement du texte** (AA) | Avis Google coupés à 3 lignes. | VOULU |
| **1.3.1 Info et relations** (A) | Un saut (`h2`→`h4`) + **18 titres visuels non balisés**. | Sauts ACCEPTÉS · titres absents à trancher |

**Sur les 18, une nuance honnête** : 2 sont le titre et le sous-titre du texte SEO, défaut
identique aux autres pages. Les **16 autres sont les noms des membres de l'équipe**, et
c'est un jugement, pas un fait : sur une page d'équipe, le nom d'une personne joue
conventionnellement le rôle de titre de sa carte, mais un auditeur peut le lire autrement.
À trancher avec le reste.

## Deux constats de CONTENU, hors critères — signalés, non corrigés

1. **Trois membres sur seize sont des fiches d'usine** : nom « Prénom », fonction « Poste ».
   Elles sont en ligne, visibles.
2. **34 images sur 38 sans description.** Le chiffre est gros et sa lecture est simple :
   32 = les 16 membres × leurs 2 plans photo (repos + survol), plus les 2 fonds décoratifs
   du hero et du devis. **C'est exactement la décision restée ouverte** depuis la revue de
   ce matin : décrire les 16 portraits, ou écrire qu'on ne les décrit pas. Le nom et la
   fonction étant à côté, laisser vide est défendable — mais ce n'est pas encore écrit.

## Acquis

Langue `fr-BE` · titre de page réel · un seul `h1` · **0 lien mort** · **0 défilement
horizontal à 320 px** · lien « Plan du site » présent · **0 contrôle sans nom accessible** ·
**0 ressource en 404** · le bloc Réassurances parle du bon sujet (« Pourquoi choisir
Piqueray ? »), contrairement à Portes d'entrée.

## Faux positifs

Le lien d'évitement à 1 × 1 px et 8 cibles de menu de 16 px couvertes par l'exception
d'espacement, signalée par l'outil lui-même.

## Limites

Aucun lecteur d'écran réel. 5 critères non testés.
