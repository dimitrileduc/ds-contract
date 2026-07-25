# Audit — Molécule Contact-info-row (T061)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — localisé via `dag.md` (« contact-info-row
| ×4 | 4 ✓ | exact (`features` Contactez-nous) »), scope déjà tranché avant cette
session.
**Inspiration structurelle (recherche legacy déléguée à un agent en arrière-plan)** :
`metadata-list-item.contract.json` (icône+label+valeur) ou `list-item`/
`side-nav-item` selon la vraie structure — non tranché par l'agent, laissé à
l'audit live. Résultat : ni l'un ni l'autre exactement — icône + **titre + texte**
(2 lignes de texte, pas 1 valeur simple), plus proche d'un `side-nav-item` étendu.

## Découverte — malgré le nom, ce n'est pas des coordonnées de contact

Le contenu réel (« Conseils personnalisés / Devis gratuits... », « Produits de
qualité / Marque Hormann... », « Dépannage et SAV / ... », « Expérience et
savoir-faire / ... ») est un bloc **argument de vente** (même famille que
Réassurance-item), pas des coordonnées (adresse/téléphone/horaires — ça, c'est
Footer-column). Le nom de tâche « Contact-info-row » vient probablement d'une
supposition de l'inventaire jamais vérifiée contre le contenu réel — le **compte**
(4, sur la page Contactez-nous, bloc `features`) est exact et fait foi, le nom
métier est trompeur. Master nommé **`Avantage`** (fidèle au contenu réel) plutôt
que de forcer une sémantique « contact » qui ne correspond pas.

## Usage — localisation (1 des 9 maquettes)

**4 occurrences, 1 seule maquette** : `Contactez-nous`, bloc `features` (`VERTICAL`,
gap 32), 4 enfants `Frame 6/7/8/9` (noms génériques non nettoyés côté source — pas
un signal, juste jamais renommés).

## Structure

| Partie | Détail |
|---|---|
| Racine | `HORIZONTAL`, gap 8, `counterAxisAlignItems: MIN` (icône alignée en haut) |
| Icône | instance existante du set **`Icones`**, composant `piqueray` (marque, même icône répétée ×4 — pas de swap) — **piège** : taille native du composant 32×32, toutes les occurrences l'utilisent à **64×64** (resize manuel), jamais assumer la taille par défaut d'une instance fraîche |
| `text` | `VERTICAL`, gap 8, largeur FIXED 687 |
| `Titre` | Montserrat Regular 32, `lineHeight` PIXELS 40 |
| `Texte` | Montserrat Regular 18, `lineHeight` PIXELS 27, `paragraphSpacing` 8 — **gras multi-segments** (voir ci-dessous) |

## Texte riche — gras multi-segments, pas juste une phrase d'intro

Contrairement à Carte (1 segment gras en tête de phrase), chaque occurrence a
**2 à 3 segments gras dispersés**, un pattern différent par occurrence :

| Occurrence | Segments gras |
|---|---|
| Conseils personnalisés | « Devis gratuits », « sur place », « chez vous » (3 segments) |
| Produits de qualité | « Hormann » (1 mot) |
| Dépannage et SAV | « dans les meilleur délais » (fin de phrase) |
| Expérience et savoir-faire | « plus de 50 ans d'expérience » (milieu de phrase) |

Capturé précisément par occurrence (`getRangeFontName` par plage), pas de règle
générale applicable — chaque occurrence a sa propre liste de segments à
re-souligner en gras après l'override de contenu (même trap `setProperties`
aplatit-tout que Carte/Footer-column).

## Récapitulatif du master

| Élément | Détail |
|---|---|
| Nom | `Avantage` |
| Variants | aucun |
| Propriétés | `Titre` (TEXTE), `Texte` (TEXTE) |
| Dépendances | icône `piqueray` existante (set `Icones`), toujours à 64×64 |
| Page | `DS · Molécules` |
| nodeId | `2088:2350` |

**Preuve** : pixel-diff complet sur les 4/4 occurrences (seule maquette concernée) —
résidu 4014px/(1728×3901)=0,059%, bruit habituel (texte + gras multi-segments
visuellement identiques sur les 4, vérifié au crop).
