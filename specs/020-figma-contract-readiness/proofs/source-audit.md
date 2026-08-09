# Bilan simple — étape 1, audit de la source Figma

Audit en lecture seule réalisé le 9 août 2026 sur `Piqueray (Copy)`, version
`2385391614633344086` (dernière modification Figma : `2026-08-08T18:26:51Z`).

## Ce qui a été vérifié

- les 11 masters attendus existent sur `DS · Organisms` ;
- leurs 55 utilisations réelles ont été retrouvées sur `Pages` ;
- les identités sont enregistrées par node id, jamais seulement par nom ;
- structure, contraintes, propriétés, présence des bindings, tailles et descriptions ont été lus ;
- aucune modification n’a été faite dans Figma.

## Résultat par section

| Section | Usages | Résultat actuel | Point principal |
|---|---:|---|---|
| Coordonnées | 1 | Défaut certain | `Accroche` et `Titre` sont déclarées mais non reliées. |
| Devis | 8 | Aucun défaut observé, contrôle incomplet | `Titre` est bien relié. |
| Équipe | 1 | Aucun défaut observé, contrôle incomplet | Aucune propriété déclarée, conforme au contrat actuel. |
| FAQ | 3 | Aucun défaut observé, contrôle incomplet | `Ligne3` est bien reliée. |
| Formulaire | 1 | Défaut certain | `Accroche` et `Titre` sont déclarées mais non reliées ; `Consentement` est reliée. |
| Header | 9 | Aucun défaut observé, contrôle incomplet | Les usages observés sélectionnent la variante attendue. |
| Hero | 8 | Défaut certain | Master réduit à 1072 px, fond à 100 px et contenu croppé. `SousTitre` reste correctement reliée. |
| Footer | 9 | Aucun défaut observé, contrôle incomplet | Aucune propriété déclarée, conforme au contrat actuel. |
| Réassurances | 6 | Aucun défaut observé, contrôle incomplet | Les trois variantes ont des usages observés. |
| SAV | 1 | Défaut certain | Layout coupé et colonnes décalées ; `Titre` n’est pas reliée, `Texte` est reliée. |
| Texte SEO | 8 | Aucun défaut observé, contrôle incomplet | Aucune propriété déclarée, conforme au contrat actuel. |

Total dans le périmètre initial : **4 sections sales**, **7 sans défaut observé mais encore
incomplètes**, **0 déclarée propre**.

## Défauts visuels ajoutés au lot de réparation

Ces trois organismes n’étaient pas dans les onze sections de la campagne 020, mais le contrôle
owner les a montrés cassés et ils sont donc enregistrés explicitement :

| Section | Défaut confirmé | Référence historique proposée |
|---|---|---|
| Catégories principales | Trois cartes de 743 px débordent du frame de 1728 px. | Trois cartes de 474 px, version `2384611619054562083`. |
| Produits e-commerce | Les deux flèches visibles pointent à gauche. | Contrôle gauche/droite, version `2384251202054787848`. |
| Réalisations | Bloc d’en-tête large de 2241 px et décalé à x=-256,5 px. | En-tête aligné et large de 1319 px, version `2384302837232801871`. |

## Pourquoi les 7 autres ne sont pas encore déclarées propres

Figma expose la présence des bindings dans les données du fichier, mais l’accès qui donne le nom
et la cible exacte de chaque variable répond `HTTP 403`. Les bindings ont donc été comptés, mais
leurs cibles ne sont pas certifiées. Ce manque est enregistré comme un blocage, pas comme une
réussite.

## Suite logique

1. Faire valider les cinq références historiques proposées dans
   `visual-reference-review-2026-08-09.json`.
2. Après validation seulement, préparer un lot de réparation séparé et réversible.
3. Corriger dans l’ordre Hero, SAV, Catégories principales, Réalisations, puis CarouselControls.
4. Refaire l’audit des usages et le contrôle visuel avant/après.

Le reçu machine complet est `live-source-audit-2026-08-09.json`. Chaque dossier de section pointe
maintenant vers son reçu de source et vers la version Figma actuelle.
