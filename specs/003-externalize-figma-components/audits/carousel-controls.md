# Audit — Molécule Carousel-controls (T055)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — recherche par nom exact (`Controls`),
repéré en marge de l'audit Product-card (sibling direct dans « Carrousel produits »).
**Inspiration structurelle (recherche legacy déléguée à un agent en arrière-plan)** :
`pagination.contract.json` — flèches prev/next toujours visibles, HORS de tout
switch de variante. Trou a11y réel noté par l'agent dans le legacy (dots sans
`aria-label`) : non applicable ici (pas de dots dans cette molécule), mais gardé en
tête pour Gallery-item/Review-card si un carrousel à indicateurs apparaît.

## Usage — localisation (2 des 9 maquettes)

**2 occurrences seulement** : `Motorisation` et `Accueil` — la navigation du même
carrousel produits déjà gouverné (Product-card, T047-T048). Layer name `Controls`,
`GROUP` de 2 `Bouton`.

## Trouvaille — texte fantôme, cette fois repérée dès l'audit

`.visible` vérifié dès la première passe (leçon Product-card appliquée
immédiatement) : le texte `Contactez-nous` de chaque bouton est **`visible: false`**
— même schéma que Product-card, mais cette fois trouvé AVANT de construire, pas après
un gros diff. Les deux boutons réutilisent le master Bouton existant, variante
**`Property 1=Outilne noir`** (`28:114`) — piège à noter : ne pas confondre avec
`Property 1=Outline blanc` (`6:135`), deux ids proches utilisés par erreur une
première fois puis corrigés avant tout dégât.

| | Bouton gauche (« Précédent ») | Bouton droit (« Suivant ») |
|---|---|---|
| Icône gauche | `true` → `chevron-left` (`27:83`) | `false` |
| Icône droite | `false` | `true` → `chevron-right` (`27:86`) |
| Libellé | `Contactez-nous` (texte fantôme, invisible) | idem |
| Taille | 52×52 fixe (icône seule) | 52×52 fixe |

## Piège Figma majeur — origine de GROUP non stable, positions soeurs déplacées

Le conteneur `Controls` est un enfant du `GROUP` « Carrousel produits », **sibling**
du frame `Produits` (les 4 Product-card). Repositionner l'instance `Controls`
directement (`.x`/`.y`) a fait **glisser les 4 cartes produit voisines de 22px**,
alors qu'elles n'avaient pas été touchées — l'origine interne d'un `GROUP` n'est pas
fixe, elle se recalcule dynamiquement contre le contenu, donc modifier UN enfant peut
déplacer visuellement tous les autres. Plusieurs tentatives de correction itérative
ont oscillé sans converger avant la vraie cause : **`Produits` (le frame contenant
les 4 cartes) est en auto-layout (`HORIZONTAL`, gap 32)** — ses enfants ne se
déplacent jamais individuellement, ils suivent le flux. Fix correct : corriger la
position du frame `Produits` lui-même (un seul nœud), pas ses 4 enfants un par un —
les cartes se replacent automatiquement via leur propre auto-layout.

**Règle généralisable pour la suite** : avant de repositionner un nœud à l'intérieur
d'un `GROUP` (pas un `FRAME`), vérifier tous ses siblings pour un éventuel
recalcul d'origine — ne jamais assumer qu'un `GROUP` a une origine stable comme un
`FRAME`.

## Récapitulatif du master

| Élément | Détail |
|---|---|
| Nom | `Carousel-controls` |
| Variants | aucun — 2 instances du Bouton existant, positions fixes gauche/droite |
| Structure | `HORIZONTAL`, `primaryAxisAlignItems: SPACE_BETWEEN`, largeur FILL (contextuelle, comme Carte) — plus robuste que la position absolue du GROUP source |
| Dépendances | Bouton existant (`Property 1=Outilne noir`, 2 instances réelles) |
| Page | `DS · Molécules` |
| nodeId | `2077:2191` |

**Preuve** : pixel-diff **byte-exact** sur `Motorisation` (`1/1 identical, 0 diff,
sha256 identique à l'avant`, exit 0) — le meilleur résultat de la spec à ce jour,
zéro texte à rasteriser (label caché) donc zéro source de bruit sub-pixel possible.
`Accueil` vérifié visuellement (spot-check), pas par pixel-diff formel — même limite
que Carte/Product-card. Ledger explicitement vide (`entrees: []`) — aucune
personnalisation de contenu à reporter, les deux occurrences sont identiques au
master par défaut.
