# Trace Gate B — après mutation, 7 usages propres

**Date** : 2026-08-20 · **Validé par** : owner (« c ok go ») · **Artefact** :
[../gates/gate-b-pixel.json](../gates/gate-b-pixel.json) (`status: validated`)

## Résultat

Les **7 usages** du bloc « Catégories principales » ont été vérifiés **un par un en capture live**
après la restructuration : contenu, photos et mise en page corrects sur les 7 pages. **Zéro copie
locale** subsiste (les 3 copies converties en instances de la molécule gouvernée `CarteCategorie`).

## Nature — pas un pixel-identique strict (honnêteté §V)

En cours de route, l'owner a demandé un **changement de mécanisme** : la section doit être **w-fill
pad 0** (comme le composant `Equipe`), le padding de 89px étant porté par un **container de
présentation** (`Container · CategoriesPrincipales`) **non transposé côté Odoo**. Gate B acte donc
un **repair + amélioration de structure assumée**, pas un pixel-neutre. Le rendu visuel est
préservé (cartes 743 / 474, marge 89).

## Incidents traités (et leurs leçons)

1. **Régénération par un autre agent** (3 apps AI connectées au fichier) : tout le travail a été
   annulé une fois → refait. Leçon : la chirurgie live sur un fichier multi-agent est fragile ;
   sauvegarder une version à chaque étape (5 versions natives posées).
2. **Perte de photos au `swapComponent`** : le swap a préservé le TEXTE mais perdu les IMAGES sur
   usage3/5. Hashes originaux récupérés via REST sur la version « AVANT 023 » et re-posés.
   **Leçon : capturer TOUTES les images avant un swap, ne jamais s'y fier pour les fills.**
3. **Largeur incohérente** : la variante superposée était à 1552 (vs 1728 pour les empilées) →
   uniformisée à 1728.

## Effet de blocage (FR-005)

Gate B `validated` **débloque** l'extraction des deux contrats (US1c). L'extraction lira la source
nettoyée (molécule `CarteCategorie` `2495:6770`, section `CategoriesPrincipales` `2115:4277`
w-fill pad 0), **sans le container de présentation** (détail Figma, hors contrat).
