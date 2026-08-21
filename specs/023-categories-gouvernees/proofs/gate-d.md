# Gate D — table d'éditabilité (AVANT tout Odoo) — trace

**Fichier machine** : [../contracts/categories.editable-scope.json](../contracts/categories.editable-scope.json)
**Statut** : ✅ **VALIDÉ — owner, 2026-08-21**

## Objet validé

Table d'éditabilité couvrant **100 % des props ET des parts des DEUX contrats** + composés
(`ds.button` ×2 sous `Bouton`, icône `arrow-right`), **zéro verdict par défaut** (FR-004).
6 rootActions · 14 controls · 15 parts. Répartition : 11 not-editable, 9 controlled,
5 fixed-by-composition, 4 directly-editable.

## Frontière d'éditabilité validée

**Éditable rédacteur** : colonnes (enum 2|3), collection (ordered-repeat add/remove/reorder),
titre/description/alt par carte (plain-text), image par carte (computed-display), libellé + lien
du CTA empilé (BuilderUrlPicker/pqrSetCtaHref).
**Fixé par composition / non éditable** : style de carte, ctaType, variantes/glyphes `ds.button`,
structure, plans photo (remplacés via le contrôle image), décor, flèche.
**Edge « section vidée »** : rendu propre attendu, geste réversible (arrêté au Gate, jamais improvisé).

## Décision owner

Réponse (question Gate D) : **« Valide + transcris vers Odoo »** — 35 verdicts validés en l'état,
zéro révision. `categories.editable-scope.json` → `status: validated`.

## Débloque

Transcription **1:1** en `integrations/odoo/config/categories.authoring.json` (schéma 019),
exhaustivité vérifiée par `npm run odoo:authoring:check` ; puis snippet/panneau QWeb et scénario
rédacteur sur instance QA (US2 — **a besoin d'une instance Docker**).
