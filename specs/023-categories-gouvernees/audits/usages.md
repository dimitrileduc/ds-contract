# Audit US1a — Usages du bloc « Catégories principales » (T007)

**Date** : 2026-08-20 · **Source** : page `Pages` `210:325`, fichier « Piqueray (Copy) »
(`d9FYAUcqdcNtsuaMgLefvJ`) · **Méthode** : §VIII — recensement **PAR POSITION**, jamais par nom
(lecture seule via le pont figma-console).

## Résultat : 7 usages, tous INSTANCES du set gouverné `2115:4277`

`totalInstances` sur la page = 96 ; **7** sont des instances de `CategoriesPrincipales`
(`2115:4277`) ; **0** instance `Carte/*` autonome (`carteHits: 0`). Un usage par page-frame, sur
7 des 9 frames de la page.

| # | Page (frame) | node usage | Variante « Disposition » | **Style** | **Colonnes** | Taille |
|---|---|---|---|---|---|---|
| 1 | Accueil (`210:326`) | `2115:4392` | `Standard` | **superposé** | 2 | 1552×418 |
| 2 | Portes de garage (`226:112`) | `2115:4278` | `Standard` | **superposé** | 2 | 1552×418 |
| 3 | Portes de garage résidentielles (`230:376`) | `2115:4438` | `Pleine largeur` | **empilé** | 2 | 1728×622 |
| 4 | Portes de garage industrielles (`387:720`) | `2115:4297` | `Pleine largeur` | **empilé** | 2 | 1728×649 |
| 5 | Portes d'entrée (`237:969`) | `2115:4411` | `Pleine largeur` | **empilé** | 2 | 1728×622 |
| 6 | Motorisation (`237:705`) | `2115:4324` | `PleineLargeurTroisCartes` | **empilé** | **3** | 1728×525 |
| 7 | Dépannage/SAV (`249:1510`) | `2115:4364` | `PleineLargeurRdv` | **empilé** | 2 | 1728×649 |

**Décompte** : **6 usages à 2 colonnes + 1 usage à 3 colonnes** (conforme à l'attendu du plan) ·
**2 superposés + 5 empilés**.

## Contenu de chaque usage (titres + CTA relevés)

| # | Page | Cartes (titre → CTA) |
|---|---|---|
| 1 | Accueil | « Portes de garage » · « Portes d'entrée » — **pas de CTA** (flèche seule) |
| 2 | Portes de garage | « Portes de garage résidentielles » · « Portes de garage industrielles » — **pas de CTA** |
| 3 | Portes de garage résidentielles | « Porte sectionnelle » → Contactez-nous · « Porte basculante » → Contactez-nous |
| 4 | Portes de garage industrielles | « PORTES INDUSTRIELLES SUR MESURE » → Contactez-nous · « PORTES AVEC PORTILLON INTÉGRÉ » → Contactez-nous |
| 5 | Portes d'entrée | « Portes en acier » → Contactez-nous · « Portes en aluminium » → Contactez-nous |
| 6 | Motorisation | « Pour portes de garage » · « Pour portails d'entrée » · « Pilotez à distance » — 3× → Contactez-nous |
| 7 | Dépannage/SAV | « Intervention rapide » → Contactez-nous · « Maintenance » → **« Prendre rendez-vous »** |

**Fait structurant** : le **style superposé** (usages 1-2) porte titre + description + **flèche**,
**sans libellé de CTA** ; le **style empilé** (usages 3-7) porte titre + description + **bouton
lien « Contactez-nous »**. Le seul écart de contenu de l'usage « Rdv » (#7) est le libellé
**« Prendre rendez-vous »** sur la carte « Maintenance » — c'est du **contenu**, pas une structure
(voir [copies-locales.md](./copies-locales.md) et le Gate A).

## Conséquence pour le modèle cible (Gate A)

- L'axe « Disposition » **mélange trois dimensions** : le **style** (Standard=superposé vs Pleine
  largeur=empilé), le **nombre de colonnes** (TroisCartes=3), et un **contenu** (Rdv = libellé CTA).
- Cible : **style** → axe de la molécule `{Superpose, Empile}` ; **colonnes** → prop de la section
  `{2,3}` ; **Rdv** → instance renseignée (CTA « Prendre rendez-vous »), plus une variante.
- Les 7 usages étant déjà des **instances** du master, re-pointer sur le master gouverné préserve
  le colonnage et le contenu de chacun (T016).
