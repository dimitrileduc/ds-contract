# Contrat d'interface — Rafraîchissement du cliché de variables (FR-004/004a)

Le geste d'entrée du chantier. Lecture seule, pont figma-console, zéro nouveau code.

## Entrées

- Fichier Figma vivant `d9FYAUcqdcNtsuaMgLefvJ` (« Piqueray (Copy) »), ouvert dans le
  desktop avec le pont connecté.
- Script exécuté **tel quel** : `parity/extract-figma.plugin.js` (via `figma_execute`).

## Invariants (violation = arrêt nommé, jamais de contournement)

1. **Lecture seule** (FR-010) : le script n'écrit rien dans Figma — aucun autre script
   n'est exécuté sur le fichier pendant le chantier. **Reçu obligatoire** : le rapport
   (rubrique 7) note qu'exactement UN `figma_execute` a été exécuté, en lecture. FR-010
   est la seule exigence dont la preuve est structurelle plutôt qu'instrumentée : elle
   doit donc être **écrite**, jamais sous-entendue (§V — une vérification qui repose sur
   l'absence de geste doit dire quel geste unique a eu lieu).
2. **Provenance** : le retour porte `fileKey === "d9FYAUcqdcNtsuaMgLefvJ"` et un
   `extractedAt` du jour. Autre `fileKey` → mauvais fichier → arrêt.
3. **Forme** : collections attendues `Primitives` (mode `Value`) et `Semantic` (mode
   `Light`), et elles seules. Collection surnuméraire/renommée → arrêt + arbitrage
   côté source (§VIII) consigné au rapport.
4. **Non-vide et dimensionné** : chaque collection porte ses variables ; le total est
   confronté aux comptes de l'audit (139 attendues). Dérive → recalcul de la liste des
   manquants depuis CE cliché (FR-004) ; 77 absents du vivant → prémisse invalide,
   arrêt.
5. **Conservation des 62** : la différence d'ensembles se fait dans les **deux** sens.
   `cliché \ dépôt` = les manquants à adopter ; **`dépôt \ cliché` doit être VIDE**. Des
   totaux qui tombent juste ne prouvent rien — un échange (une feuille perdue, une
   gagnée) passerait un contrôle de cardinal. Non vide → une feuille gouvernée a disparu
   ou été renommée côté Figma → arrêt + arbitrage §VIII côté source. Jamais de
   suppression côté dépôt pour faire coller les comptes (FR-003 : les 62 sont
   intouchables).
6. **Ancrages d'evals** (décision D13) : ce cliché est aussi une **entrée de la suite
   d'evals**, pas seulement du differ. Le relevé frais doit encore porter
   `Primitives/border-width/1` avec `values.Value === 1` (sinon l'eval
   `primitives-border-width-parity` **lève**) et `Primitives/color/orange` (utilisé par
   `detect-token-alias-drift` et `detect-token-missing-variable`). Absent ou changé →
   **ne pas écrire le cliché**, arrêt, arbitrage §VIII consigné rubrique 3. Réécrire
   l'eval pour absorber l'écart est refusé : ce serait suspendre une porte au lieu d'en
   traiter la cause (§Governance, et Principe IV par analogie).

## Sortie

`parity/snapshots/figma-tokens.json` ← `{fileName, fileKey, extractedAt, collections}`
(la partie `sets` du retour est **ignorée** — `figma-components.json` n'est pas re-sauvé,
décision D2). Sérialisation : JSON indenté 2 espaces, LF, newline final — le style du
fichier commité qu'il remplace.

**Statut de l'artefact** : entrée capturée, commitée (FR-004a). Son diff (62 → relevé)
ne déclenche JAMAIS l'alarme de la liste blanche — l'alarme ne porte que sur les
sorties générées.

## Post-conditions vérifiables

- `npm run parity` (avant adoption) : l'axe tokens émet exactement la liste des
  manquants en `figma-tokens / ahead` — le dénombrement de l'angle mort, consigné au
  rapport (reçu, pas porte : `exit 1` attendu à ce stade).
- Les comptes re-relevés (par la même méthode des deux côtés — flatten `/` côté dépôt,
  somme des `variables[]` côté cliché) deviennent la référence unique du rapport.

## Modes d'échec nommés

| Échec | Conduite |
|---|---|
| Pont indisponible / fichier inaccessible | Arrêt nommé AVANT toute adoption (edge case de la spec) — jamais d'adoption sur le cliché périmé |
| `fileKey` inattendu | Arrêt — le cliché décrirait un autre fichier |
| Collections inattendues | Arrêt + arbitrage côté source consigné |
| Comptes ≠ audit | Pas un échec : recalcul de la liste depuis le cliché frais, spec suivie sur les comptes re-relevés |
| `dépôt \ cliché` non vide (invariant 5) | Arrêt — une des 62 a disparu/été renommée côté Figma ; arbitrage §VIII, jamais de suppression côté dépôt |
| Ancrage d'eval manquant (invariant 6) | Arrêt **avant écriture** du cliché ; arbitrage §VIII rubrique 3 ; jamais l'eval réécrit pour absorber l'écart |
