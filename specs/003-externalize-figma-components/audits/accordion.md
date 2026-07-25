# Audit — Molécule Accordion (T067)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — layer `accordion`, repéré comme sibling
des titres FAQ (Section-header) et dans les sections « Texte SEO ».

## Conclusion — pas de master séparé, décision documentée pas silencieuse

`accordion` est un simple `FRAME` `VERTICAL` (`itemSpacing` 0), **sans identité
visuelle propre** (`fills: []`, `strokes: []`, `effects: []`, aucun padding) —
vérifié sur 4 échantillons couvrant 2 contextes différents (FAQ ×3 pages,
Texte SEO ×1) :

| Contexte | id | Enfants | Tous des instances `Accordion-row` (`setId 2059:1417`) ? |
|---|---|---|---|
| FAQ — Portes d'entrée | `237:1085` | 2 | ✅ |
| FAQ — Portes de garage industrielles | `387:807` | 3 | ✅ |
| FAQ — Portes de garage résidentielles | `234:680` | 2 | ✅ |
| Texte SEO — À Propos | (dans `305:887`) | 3 | ✅ |

**Même décision que le wrapper `tabs` de Tab (T043-T044) et le `row` de Field
(T039-T040)** : un conteneur de pure disposition, sans fill/bordure/effet, ne
justifie pas un master — il est reconstruit tel quel (`VERTICAL`, gap 0) à chaque
usage, et **ses enfants sont déjà le vrai composant gouverné**. Ici, les enfants
(`Accordion-row`) sont **déjà adoptés** depuis T041-T042 (cette session, plus tôt) —
il n'y a donc littéralement rien de nouveau à construire ni à remplacer pour cette
tâche : la dépendance du DAG (« T067 exige T042 Accordion-row adopté-prouvé ») est
satisfaite, et cette satisfaction EST le travail de T067/T068.

## Pourquoi documenter quand même

La constitution du projet (honnêteté, jamais de silence) demande de nommer une
dégradation ou une non-action, pas seulement un changement. Marquer T067/T068 fait
sans laisser de trace expliquant pourquoi aurait été un manque — un lecteur futur
du DAG se serait demandé où est le master `Accordion`. Cette entrée sert cette
fonction : la réponse est « il n'existe pas, par choix, et voici la preuve ».

**Aucun master construit, aucune adoption effectuée, aucun ledger — rien n'a changé
sur le canevas Figma pour cette tâche.** La preuve pixel et le ledger de T041-T042
(`ledger/accordion-row.json`, `proofs/accordion-row/`) couvrent déjà tout le
contenu réellement gouverné ici.
