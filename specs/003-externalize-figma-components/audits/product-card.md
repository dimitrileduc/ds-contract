# Audit — Molécule Product-card (T047)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — recherche par nom (`product`/`produit`/`thumbnail`),
confirmée structurellement, jamais prise au premier layer trouvé.
**Inspiration structurelle (recherche legacy déléguée à un agent en arrière-plan
pendant l'audit live)** : `card.contract.json` — le footer `slot: {accepts:
["ds.button","ds.badge"]}` modélise déjà la forme "prix + CTA" ; `badge.contract.json`
comme second candidat pour le prix seul. **Constat cross-cutting de l'agent, vérifié
par grep sur les 51 fichiers** : aucun contrat legacy n'a de part image/média/photo —
l'archive est 100% chrome UI, zéro précédent structurel pour la photo produit. Le
mécanisme réel de ce repo pour une collection (8 cartes dans une grille) est le champ
`repeat` du schéma live (`itemsProp`+`sample`), pas le `slot`+`defaultContent` de
l'archive.

## Usage — localisation (2 des 9 maquettes)

**8 occurrences, 2 maquettes** : `Motorisation` (×4, dans « Produits e-commerce » →
« Carrousel produits » → « Produits ») et `Accueil` (×4, même structure). Layer name
`Thumbnail produit`, conteneur `Produits` (4 enfants, `itemSpacing` non pertinent ici
— chaque carte fait 364px fixe, pas de FILL contrairement à Carte).

## Structure

| Partie | Détail |
|---|---|
| Racine | `VERTICAL`, `itemSpacing` 16, pas de padding, **`primaryAxisSizingMode: AUTO`** (hug réel, pas fixé) |
| `Image` | `RECTANGLE` (pas un frame) 240×240, fill IMAGE (`scalingFactor: 0.5`), **centrée** (`counterAxisAlignItems: CENTER` sur la racine — absent par défaut, doit être réglé explicitement) |
| `Titre` | Montserrat SemiBold 16, `lineHeight` PIXELS 20, **centré** (`textAlignHorizontal: CENTER`), couleur `color/noir-bleute` (`VariableID:5:40`) |
| `Prix` | Même police/taille que Titre, **couleur différente** — `VariableID:4:27` (bleu accent) |
| `Bouton` | Instance réelle du master Bouton (`Property 1=Default`), icône panier (`Glyphe gauche` → composant `cart`, clé `27:70`), Libellé `Ajouter au panier` — **voir découverte ci-dessous** |

## Découverte majeure — le CTA n'est jamais rendu

Une première reconstruction (avec bouton visible, aligné, bien positionné) donnait un
diff pixel énorme (37921px sur une seule occurrence). Investigation guidée par
l'owner (« tu peux déjà pixel diff, y'a des soucis ») : après avoir écarté
successivement l'alignement (Image/Bouton collés à gauche au lieu de centrés — bug
réel, corrigé) et l'espacement (26px avant le bouton au lieu de 16px uniforme — réel
aussi, mais la vraie cause était ailleurs), un crop large de la vraie page capturée a
montré : **rien ne s'affiche sous le prix**. Vérification directe de la propriété
`visible` du nœud `Bouton` (jamais checkée jusqu'ici, absente de toute grille d'audit
précédente) : **`false`**, confirmé sur **7 des 8 occurrences vérifiées**. Le bouton
« Ajouter au panier » existe dans l'arbre de layers (propriétés bien formées,
`Libellé`/icône panier corrects) mais n'a **jamais été rendu visible** sur aucune des
maquettes — probablement une infrastructure e-commerce préparée puis désactivée.

**Conséquence pour le master** : `Image`+`Titre`+`Prix` visibles (240+16+20+16+20=312,
correspond exactement, hug naturel) ; `Bouton` présent mais `visible: false` par
défaut — reproduit fidèlement l'état réel de la source, pas de "correction" par
supposition de ce que le CTA "devrait" faire. Résidu final après correction : **11px
sur l'occurrence pilote, 98px sur les 4 occurrences complètes de Motorisation**
(bruit de rasterisation texte habituel, même ordre de grandeur que toutes les
molécules précédentes).

## Récapitulatif du master

| Élément | Détail |
|---|---|
| Nom | `Product-card` |
| Variants | aucun — structure 100% identique sur les 8 occurrences |
| Propriétés | `Titre` (TEXTE), `Prix` (TEXTE) |
| Dépendances | Bouton existant (`Property 1=Default`, instance réelle, **invisible par défaut**) |
| Page | `DS · Molécules` |
| nodeId | `2068:1972` |

**Limite de preuve** : preuve pixel `page-parity` complète sur `Motorisation` (4/4
occurrences, before/after réel). `Accueil` (4/4 occurrences) vérifié structurellement
(dimensions, `visible:false` du bouton, contenu conforme) et visuellement (capture
spot-check), pas par comparaison pixel avant/après — même limite documentée que Carte,
même raison (batch sans before pré-capturé).
