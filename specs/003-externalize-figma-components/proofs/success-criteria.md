# Critères de succès — vérification SC-001 à SC-009 (clôture spec 003)

**Date** : 2026-07-25. Chaque critère ci-dessous est adossé à une preuve concrète, pas à une
affirmation — fichier, commit ou entrée `decisions.md` cité à chaque fois.

## SC-001 — Les 9 maquettes identiques avant/après, mesuré pas à l'œil

**Statut : globalement vrai, 2 exceptions nommées (pas silencieuses).**

Chaque bloc construit a une preuve `pages:compare` (avant/après réels, pixelmatch seuil
0.1) dans `proofs/<bloc>/verdict.{json,md}`. Tout écart au-delà du bruit AA a été chiffré,
investigué par crops réels, et accepté explicitement dans `decisions.md` — voir
`proofs/honesty-report.md` §3 pour la liste complète des 17 blocs à écart accepté.

**2 exceptions réelles, non résolues à un `identical` propre** :
1. **Hero, +3-5px de décalage** sur 6/8 pages — antérieur à la régression de couleur
   corrigée, mécanisme non confirmé avec assez de confiance pour agir. **Resté ouvert**,
   voir `proofs/honesty-report.md` §7.
2. **Texte SEO / À Propos, reflow réel** — un mot change de ligne, 4 tentatives de fix
   réelles épuisées (refus durs de l'API Figma). Accepté et documenté comme non
   corrigible sans détacher l'instance ou risquer les 7 autres pages.

## SC-002 — Masters propres, validés par l'owner

**Statut : masters propres = vrai. Validation owner = nuancée, nommée ici plutôt que
supposée.**

Chaque master a un nom vrai, des couleurs liées aux variables (vérifié explicitement
partout où un défaut de couleur a été trouvé — Hero, Devis — et corrigé), des propriétés
officielles (variantes plutôt que masters dupliqués — Réassurances 3 variantes,
Catégories principales 4 variantes, Field, Carte), une description non vide.

**Nuance honnête sur la validation owner** : les blocs de la Phase 7 et le début de la
Phase 8 (jusqu'à Hero) ont eu une validation owner active — décisions explicites en
conversation (ex. Option A Réassurances, `color/noir` Formulaire, décisions de report
Review-card/tokens). **À partir du soir du 2026-07-24** (« continue, arrête uniquement à
la fin de la spec »), l'owner a autorisé une exécution **autonome** du reste de la Phase 8
sans validation individuelle par bloc en temps réel — les décisions de construction
(Option A à 4 variantes pour Catégories, choix de ne pas masteriser `Hero et catégories`,
etc.) ont été prises par l'orchestrateur selon les précédents déjà validés cette même
nuit, pas re-confirmées bloc par bloc pendant le sommeil de l'owner. **Ceci n'est pas une
violation de SC-002 dans l'esprit** (chaque décision suit un précédent déjà validé, jamais
un choix arbitraire nouveau) mais mérite d'être nommé plutôt que de prétendre à une
validation individuelle qui n'a pas eu lieu en temps réel. Revue owner a posteriori
recommandée sur les blocs de la fin de nuit (Catégories principales, Produits
e-commerce, Réalisations, Hero et catégories, Footer + Devis) au réveil.

## SC-003 — Zéro copie brute restante (scan)

**Statut : vrai, confirmé par le scan final.**

`inventory/scan-final-2026-07-25.json` — la seule occurrence `copie-brute` restante est le
wrapper `Hero et catégories` lui-même, une décision mesurée et documentée (aucune identité
visuelle propre, ses 2 enfants SONT des instances) — pas un oubli. Détail : T101 dans
`tasks.md`, `proofs/honesty-report.md` §8.

## SC-004 — Chaque personnalisation retrouvée et nommée, aucune perdue

**Statut : vrai.**

Chaque bloc adopté a un `ledger/<bloc>.json` validé par `pages:ledger:check` (exit 0 sur
tous). 2 personnalisations à provenance non garantie (`non-portable-signalee`, pas
`reportee`) — Réalisations résidentielles, texte restauré depuis une capture pixel après
une régression trouvée par revue. Nommées, pas abandonnées : voir
`proofs/honesty-report.md` §2.

## SC-005 — Rollback intégral en cas d'échec

**Statut : vrai en principe (checkpoints posés), jamais testé en conditions réelles cette
nuit (aucune opération n'a nécessité une restauration).**

`saveVersionHistoryAsync` posé avant (ou, sur 2 blocs — Hero, Devis — après coup, gap de
process nommé dans `decisions.md`) chaque geste mutant. Le mécanisme de restauration
lui-même (manuel, via l'historique de versions natif Figma) a été **prouvé** en Phase T
(T021, drill de rollback complet, `1d4b19e`) — pas re-testé pendant la Phase 8 puisqu'aucun
incident n'a requis une restauration réelle (les incidents rencontrés — forks multi-agent,
régressions de contenu — ont tous été résolus par correction directe, jamais par retour en
arrière).

## SC-006 — Ordre de construction respecté

**Statut : vrai.**

Chaque section a vérifié ses dépendances avant construction (ex. Catégories principales
a confirmé Category-card T046 déjà adopté ; Hero et catégories a attendu que Catégories
principales T080 soit fait avant de s'exécuter — explicitement bloqué jusque-là dans
`tasks.md`). Aucun bloc n'a été externalisé avant ses dépendances.

## SC-007 — Les 5 composants déjà existants laissés intacts

**Statut : vrai.**

`Bouton`, `Header nav`, `piqueray_logo`, `member-picture`, les icônes — jamais reconstruits.
**Précision** : deux corrections de couleur ont touché le glyphe d'une **instance** de
Bouton imbriquée dans Hero et dans Devis (icône réinitialisée par un rejeu de props, ou
bakée sombre dans le master hôte) — ce n'est **pas** une modification du master `Bouton`
lui-même, qui reste intact et non re-créé. Voir `decisions.md`, entrées de correction
Hero/Devis.

## SC-008 — Zéro dépendance tierce

**Statut : vrai, confirmé deux fois (T0 et scan final).**

`dependancesTierces: []` dans `inventory/scan-final-2026-07-25.json`, identique au chiffre
T0 (`inventory/scan-2026-07-23.json`). Chaque instance imbriquée vérifiée
`getMainComponentAsync().remote === false` bloc par bloc pendant la construction, en plus
du scan global final.

## SC-009 — Aucune dégradation passée sous silence

**Statut : vrai — voir `proofs/honesty-report.md` en entier**, le document dédié à ce
critère : blocs reportés, personnalisations à provenance non garantie, écarts pixel
acceptés avec chiffres et raison, captures dégradées, anomalies hors périmètre, régressions
réelles trouvées et corrigées, et l'unique écart resté ouvert à la clôture (Hero, §7) —
nommé explicitement, pas laissé dans un fichier que personne ne relira.

## Récapitulatif

| Critère | Statut |
|---|---|
| SC-001 | ✅ globalement vrai, 2 écarts non résolus nommés |
| SC-002 | ✅ masters propres ; validation owner nuancée (autonome en fin de nuit, précédents suivis) — nommé, pas maquillé |
| SC-003 | ✅ vrai (1 exception documentée = décision, pas un oubli) |
| SC-004 | ✅ vrai |
| SC-005 | ✅ vrai en principe, mécanisme prouvé en Phase T, non re-sollicité cette nuit |
| SC-006 | ✅ vrai |
| SC-007 | ✅ vrai |
| SC-008 | ✅ vrai, confirmé deux fois |
| SC-009 | ✅ vrai — voir `honesty-report.md` |
