# Audit — Molécule Review-card (T053, bloc inféré)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : constat déjà établi en Phase A (T036, `audits/atomes-icones.md` §2),
reconfirmé ici pour la clôture de T053.

## Constat — source non exploitable, pas de master construit

La section « Avis Google » (présente sur 8/9 maquettes) est un `RECTANGLE` fill
`IMAGE` nommé `trustindex-google-reviews-widget` — **même `imageHash` vérifié sur
2 pages** : un screenshot aplati d'un widget tiers (Trustindex), pas du Figma
natif. Il n'existe **aucune version en calques** de la carte d'avis (avatar,
étoiles, texte, badge) nulle part dans le fichier — contrairement aux icônes
sociales (T036, propres et bindées) ou à la Réassurance/Catégorie (T045, extraite
proprement), il n'y a rien à *extraire* ici, seulement un aplat pixel.

Ce constat avait déjà été transmis à T036 comme risque nommé pour T053 :
« toute la carte (avatar/nom/texte/badge) vit dans ce même raster, pas dans des
calques ». Confirmé sans changement au moment de clore Phase 7.

## Décision owner (2026-07-24)

Contrairement à l'icône étoile (T038, même problème de source, mais l'owner a
choisi **net-new** pour un simple glyphe 5 branches), l'owner **décline** de
reconstruire Review-card net-new pour l'instant : « on le fait pas si c'est un
screenshot. En tout cas pas maintenant. »

Raison de la distinction avec l'Étoile : une icône simple se reconstruit à l'oeil
avec une confiance raisonnable (forme géométrique connue). Une carte entière
(mise en page précise d'un avatar + nom + note + texte de témoignage) reconstruite
à l'aveugle depuis un rendu aplati porterait un risque de fidélité bien plus élevé,
sans aucune vérité terrain pour la valider pixel par pixel.

**Type de décision** : `report-bloc` (FR-009/FR-018) — voir entrée `decisions.md`
correspondante pour la condition de reprise.

## Portée

- Aucun master construit, aucune adoption (T054 non tentée, dépendante de T053).
- Les 8 occurrences « Avis Google » restent des screenshots aplatis tels quels sur
  le canevas — rien n'a été touché, rien n'a régressé.
- La section parente Phase 8 **Avis Google (T089-T090)** hérite de la même
  dépendance bloquée (« exige Review-card T054 adopté ») — reportée avec sa
  raison, jamais externalisée à moitié, conformément à la règle déjà posée pour
  Réalisations/Gallery-item dans tasks.md.
