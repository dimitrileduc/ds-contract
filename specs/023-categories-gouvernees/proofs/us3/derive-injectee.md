# US3 — Protocole de dérive injectée (T036)

**Date** : 2026-08-21 · **But** : prouver que le filet trois-voies **signale par nom** une
dérive future des deux contrats gouvernés (SC-005 : « gardés, pas seulement réparés »).
**Méthode** : injecter une dérive contrôlée → `npm run parity` → vérifier qu'elle est
nommée avec remède → **retirer** → vérifier le retour au vert. Preuve, pas eval permanente
(research D7).

## Portée honnête (Principe V)

- **Axe structure/binding (`npm run parity`)** : EXÉCUTÉ ci-dessous, les deux contrats.
- **Axe apparence (parité visuelle)** : **BLOQUÉ sur `FIGMA_TOKEN`** (non défini dans ce
  worktree — l'instrument récupère l'image de référence master par GET REST). Même blocage
  que **T035**. Non prouvé ici ; à dérouler quand le token est fourni. Le filet parity
  3-axes garde déjà structure + bindings + tokens des deux contrats.

## Dérive 1 — binding (section) : repointage de token

- **Injection** : `contracts/categories-principales.contract.json`, `anatomy.root.tokens.gap`
  `{space.64}` → `{space.32}` (le code livré garde `var(--space-64)`, non régénéré).
- **`npm run parity` → EXIT 1 (rouge)**, nommé :

  ```
  [code BEHIND] CategoriesPrincipales.root#gap
    Contract binds "gap" to token {space.32} (expects var(--space-32)) but the shipped
    CSS Module does not consume that custom property
  ```

- **Retrait** : restauration du contrat committé → parity **EXIT 0**.

## Dérive 2 — structure (molécule) : prop fantôme

- **Injection** : `contracts/carte-categorie.contract.json`, ajout d'une prop `driftProbe`
  (type `text`, binding NONE) — absente du code livré.
- **`npm run parity` → EXIT 1 (rouge)**, nommé :

  ```
  [code BEHIND] CarteCategorie.driftProbe
    Contract text prop "driftProbe" missing from CarteCategorieProps
  ```

- **Retrait** : restauration du contrat committé → parity **EXIT 0**.

## Retour au vert (les deux dérives retirées)

```
✔ No new drift — 9 acknowledged finding(s) remain in parity/baseline.json.
PARITY EXIT: 0
```

Les 9 findings acquittés (dont `CarteCategorie.Bouton` baselisé — le `ds.button` composé
pas encore instancié sur le set, patron `Carte.Bouton`) ne font PAS échouer la porte ; seule
une **nouvelle** dérive la fait passer à l'exit 1. La découverte des deux contrats est
automatique (`parity/diff.ts` — `readdir contracts/*.contract.json`), donc l'exclusion
silencieuse est structurellement impossible (T034, FR-020).

## Conclusion

Le filet **structure + binding + tokens** garde les deux nouveaux contrats : toute dérive
future est **signalée par nom avec remède proposé**, exit non nul, avant qu'elle n'atteigne
une surface. La moitié **apparence** (parité visuelle) reste à dérouler quand `FIGMA_TOKEN`
est disponible (limite nommée, partagée avec T035).
