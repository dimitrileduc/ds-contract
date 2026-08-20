# Trace Gate A — modèle cible validé

**Date** : 2026-08-20 · **Décidé par** : owner · **Artefact** :
[../gates/gate-a-modele-cible.json](../gates/gate-a-modele-cible.json) (`status: validated`)

## Objet

Modèle cible du bloc « Catégories principales » (molécule `ds.carte-categorie` + section
`ds.categories-principales`), **avant toute mutation du canvas** (FR-001, §VIII). Audit source
lecture seule par position : [usages](../audits/usages.md), [copies locales](../audits/copies-locales.md),
[masters](../audits/masters.md).

## Décisions de l'owner

1. **Carte morte retirée de `ds.carte`** → `retrait-categorie-v3`. La disposition `categorie`
   pointe sur `2407:4905`, composant **cassé** (743×3310, image 743×3106) et **orphelin**
   (**0 instance**, vérifié `getInstancesAsync`). `ds.carte` → **v3.0.0**. `ds.reassurances`
   (`disposition=reassurance` → `2063:1606`, **44 instances**) reste intact.
2. **Molécule à un axe `Style {Superpose, Empile}`**. Empile = extrait de `2063:1611`
   (**16 instances**, la vraie carte utilisée). Superpose = officialisé depuis les copies locales
   Standard (flèche = icône `arrow-right` du registre).
3. **Le TYPE de CTA est une option gouvernée**, indépendante du libellé (lequel est du contenu).
   Valeurs observées : lien-à-icônes / bouton-encadré / flèche-seule (Superpose). Valeurs exactes
   figées à l'extraction (Gate C).
4. **Section `Style × Colonnes {2,3}`**, axe « Disposition » **supprimé** ; colonnes portées par le
   parent (extension schéma E1). **Superpose × 3 colonnes GARDÉ** (déviation assumée, sans usage).
5. **« Rdv/Maintenance » = carte empilée** (ctaType bouton-encadré, libellé « Prendre rendez-vous »),
   **pas** une variante de section, **pas** un 3e type de carte.

## Correction de méthode consignée (honnêteté §V)

L'agent a d'abord annoncé un « texte gris / option en retrait » sur la carte Maintenance. **Mesure
exhaustive** (couleur de remplissage, opacité, mode de fusion, effets, police, recherche de voile) :
les deux cartes ont un texte **identique `#26282C`, opacité 1, sans aucun voile ni effet**. Le
« gris » était un **artefact de capture**, pas une donnée Figma. Option « en retrait » **annulée**.
La seule vraie différence entre les deux cartes est le **type de CTA** — exactement ce que l'owner
avait signalé. *Conclure sur une mesure, jamais sur une impression de capture (leçon 017).*

## Décisions par copie dérivée (FR-001)

| Copie | node | Décision |
|---|---|---|
| Standard/item[0] | `2115:4160` | `preserver-le-pixel` — devient la variante Superpose de la molécule |
| Standard/item[1] | `2115:4168` | `preserver-le-pixel` — officialisée avec la #1 |
| Rdv/item[1] | `2115:4245` | `recaler-sur-la-molecule` — instance Empile, ctaType bouton, libellé « Prendre rendez-vous » |

## Déviations vs recommandations de l'agent

- **Superpose × 3 colonnes** : agent recommandait le retrait (aucun usage) ; **owner garde** les 4
  combinaisons.
- **Option grise « en retrait »** : proposée par erreur ; **annulée** après mesure.

## Effet de blocage (FR-005)

Gate A `validated` **débloque** : l'avant-capture §X intégrale (T012) puis les mutations canvas
conformes à ce modèle (T013-T018). Toute divergence découverte ensuite = défaut ou retour au gate
(`revisions[]`), jamais un ajustement silencieux.
