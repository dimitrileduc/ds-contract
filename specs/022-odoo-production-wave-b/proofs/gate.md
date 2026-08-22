# T002 — ⛔ Gate humain confirmé (FR-001/002/003, SC-001)

**Date de confirmation** : 2026-08-19

Les deux tables de verdicts d'éditabilité **font foi** pour tout le comportement livré.
Toute divergence aval entre le comportement et une table est un **défaut ou un retour au
gate**, jamais un ajustement silencieux (FR-003, SC-007).

## Vérification des artefacts machine du gate

| Table | Fichier | `status` | Bloc `gate` |
|---|---|---|---|
| Coordonnées | `contracts/coordonnees.editable-scope.json` | `validated` | `decidedBy: owner`, `decidedAt: 2026-08-19`, 2 écarts nommés (C1/C2 placeholder + « texte et liens réseaux sociaux ») |
| Réassurances | `contracts/reassurances.editable-scope.json` | `validated` | `decidedBy: owner`, `decidedAt: 2026-08-19`, `deviations: []` |

**Questions résolues au gate** :

- Coordonnées — **Q-C1 = Option A** (tél/email en liens `tel:`/`mailto:`, marques
  `link`+`line-break` ; spike D9 maintenu avant intégration) · **Q-C2 = Option A** (icônes
  sociales cliquables, URL au panneau, grammaire CTA-href).
- Réassurances — **Q-R1 = figée « grille de 4 colonnes »** (pas de réglage de variante) ·
  **Q-R2 = libellé éditable + lien au panneau** · **Q-R3 = les 4 gestes** {ajouter,
  supprimer, monter, descendre}, bornes 0..n.

## Couverture 100 % props/parts (aucun verdict par défaut)

- Coordonnées : 10 contrôles (C1–C10) + 21 parts (P1–P21).
- Réassurances : R1–R8 (occurrences `ds.carte`/`ds.section-header`/`ds.button` comprises)
  + S1–S12.

Transcription 1:1 vers `integrations/odoo/config/<section>.authoring.json` par T009 (US1)
et T019 (US2), vérifiée exhaustive par `npm run odoo:authoring:check` (zéro verdict
manquant, 100 % des props/parts). Aucune tâche d'authoring d'une section ne démarre avant la
validation de SA table.
