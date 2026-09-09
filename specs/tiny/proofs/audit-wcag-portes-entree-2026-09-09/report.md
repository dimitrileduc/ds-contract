# Audit de conformité WCAG 2.2 — page « Portes d'entrée »

## Périmètre

`http://localhost:8109/portes-entree` · WCAG 2.2 **A et AA** (55 critères) · 1440, 640
(zoom 200 %), 390, 320 · 2026-09-09 · `@a11y-skills/audit` + mesures maison au pixel.
Pas de vidéo : batterie directe, **11 vérifications, 0 erreur**.

## Résultat

| Niveau | Conforme | Non conforme | Non testé | Sans objet |
|---|---:|---:|---:|---:|
| A | 21 | 1 | 2 | 8 |
| AA | 10 | 3 | 3 | 7 |
| **Total** | **31 → 32** | **4 → 3** | **5** | **15** |

**31 conformes sur 35 au relevé (89 %), 32 après correction le jour même (91 %).**

## La non-conformité propre à cette page — CORRIGÉE le 2026-09-09

### 2.4.6 En-têtes et étiquettes (AA) — la page parlait des mauvaises portes

Le bloc Réassurances de la page **Portes d'entrée** affiche :

> **« Pourquoi choisir nos portes de garage industrielles ? »**
> Sécurité et conformité · Intégration parfaite · **Moteur performant** · SAV & maintenance dédiés

Le titre et les quatre arguments sont **mot pour mot ceux de la page Portes industrielles**
(comparaison des deux pages vives, faite). « Moteur performant » sur une porte d'entrée n'a
pas de sens.

**Ce n'est pas un accident d'éditeur : c'est dans la source.** Le descripteur de page
`integrations/odoo/authoring/pages/portes-entree.json` porte lui-même
`"reassurances-title": "Pourquoi choisir nos portes de garage industrielles ?"` et les
quatre cartes industrielles. **Les photos, elles, montrent bien des portes d'entrée** — le
texte a été copié, pas les images.

**Pourquoi c'est un critère d'accessibilité et pas seulement une coquille** : 2.4.6 exige
qu'un en-tête décrive le sujet de sa section. Une personne qui navigue de titre en titre —
ce que fait un lecteur d'écran — croit avoir changé de page.

**Exactement la classe de défaut que la campagne 037 a corrigée sur l'accueil** (dont les
Réassurances portaient déjà les arguments industriels). Cette page-là n'avait pas été
regardée.

### Correction posée, validée par l'owner le 2026-09-09

**La source d'abord** (`docs/16` §1) : Figma portait la même erreur. Cinq vues corrigées —
la vue « Portes d'entrée » et les quatre vues de la planche DEMO. Versions nommées avant et
après. **Vérifié que seules ces cinq étaient concernées** : le fichier compte 50 occurrences
de « portes de garage industrielles », les 45 autres vivent légitimement sur les planches
industrielles et n'ont pas été touchées.

**Puis le descripteur**, puis la page recomposée.

| Nouveau titre | « Pourquoi choisir nos portes d'entrée ? » |
|---|---|
| Sécurité renforcée | Serrures multipoints de série, avec équipement anti-effraction RC 2 ou RC 3 en option. |
| Isolation thermique | Des coefficients d'isolation jusqu'à 0,47 W/m²·K, adaptés aux maisons passives. |
| Harmonie de façade | Alignez rainures et finitions avec votre porte de garage : les « duos parfaits » Hörmann. |
| SAV & maintenance dédiés | inchangé |

**Aucun argument inventé** : RC 2/RC 3, 0,47 W/m²·K et les « duos parfaits » étaient déjà
écrits dans le texte SEO de la même page. Le correctif remonte en haut de page ce qui était
en bas.

**Vérifié après** : 4 cartes affichées aux deux largeurs, bons titres ; **les photos et
leurs descriptions n'ont pas bougé** — elles étaient déjà les bonnes, seul le texte avait
été copié ; les trois autres pages porteuses du bloc gardent chacune leur propre titre.

**Reste vrai malgré la correction** : trois pages non encore auditées n'ont pas été
vérifiées sous cet angle.

## Les 3 autres non-conformités — écarts déjà assumés

| Critère | Constat mesuré | Statut |
|---|---|---|
| **1.4.3 Contraste** (AA) | Initiales des avis : **2,51** pour 4,5. Seul échec — hero sur photo **12,28**, Devis **6,14**, bouton **12,72**, texte SEO **11,85**. | VOULU |
| **1.4.12 Espacement du texte** (AA) | Avis Google coupés à 3 lignes. | VOULU |
| **1.3.1 Info et relations** (A) | Un saut (`h2`→`h4`) **et 7 titres visuels non balisés** : 2 cartes de catégorie empilées, 3 questions de FAQ, titre + sous-titre du texte SEO. | Sauts ACCEPTÉS · titres absents **à trancher** |

## Acquis

Langue `fr-BE` · titre de page réel · un seul `h1`, 10 titres · **0 lien mort** ·
**0 défilement horizontal à 320 px** · lien « Plan du site » présent · **0 contrôle sans
nom accessible** · 4 images sans description sur 17, toutes légitimes · **0 ressource en 404**.

## Piège de méthode, payé sur cette page

Une lecture du HTML brut comptait **5 cartes de réassurance** dont une intitulée
« Nouvel argument » — de quoi croire à une carte d'usine oubliée en production. Vérification
au navigateur : **4 cartes rendues, 4 visibles**. La cinquième est le `<template>` inerte
qui sert de gabarit à la collection ; le navigateur ne l'affiche jamais. **Compter des
occurrences dans le HTML n'est pas mesurer ce qui s'affiche** — même leçon que le
`scrollWidth` du carrousel.

## Faux positifs de l'outil

Le lien d'évitement à 1 × 1 px et 8 cibles de menu de 16 px couvertes par l'exception
d'espacement, signalée par l'outil lui-même.

## Limites

Aucun lecteur d'écran réel. 5 critères non testés.
