# Contrat d'interface — Rapport d'adoption (FR-011, SC-008)

Gabarit de `specs/012-adopt-figma-tokens/adoption-report.md`. Reçu écrit commité,
jamais un contrôle (aucun conflit avec FR-008). Chaque rubrique est OBLIGATOIRE ;
une rubrique vide doit le dire explicitement — l'absence de mention n'est jamais une
preuve d'absence.

## Rubriques

1. **Comptes re-relevés** (depuis le cliché rafraîchi, jamais depuis l'audit) :
   - avant : N Figma / 62 dépôt / N manquants (attendus : 139 / 62 / 77 = 29 + 48) ;
   - après : N ↔ N, zéro manquant ;
   - méthode de dénombrement identique des deux côtés (flatten `/` vs somme des
     `variables[]`) + horodatage `extractedAt` du cliché ;
   - **différence d'ensembles dans les deux sens** : `cliché \ dépôt` (les manquants) et
     `dépôt \ cliché` (**attendu vide** — sinon une des 62 a disparu côté Figma, voir
     rubrique 3). Des totaux égaux ne suffisent pas : un échange passerait ;
   - **ancrages d'evals vérifiés survivants** au refresh (`Primitives/border-width/1 = 1`,
     `Primitives/color/orange`) — le cliché est une entrée de la suite d'evals, pas
     seulement du differ (D13).

2. **Liste nommée des feuilles adoptées** (les 77 au relevé actuel) : chemin complet,
   groupe, valeur (ou cible d'alias), séparées primitives / sémantiques. C'est le seul
   endroit où la liste survit — le diff des tokens la porte aussi, mais le rapport la
   rend lisible d'un bloc.

3. **Limites nommées** : token non représentable dans la fondation (type/unité),
   conflit de nom arbitré (et la décision §VIII « défaut Figma ou pas »), toute
   dégradation rencontrée. **Si aucune : écrire « Aucune limite rencontrée » en toutes
   lettres.**

4. **Reçu du contrat d'essai temporaire** (FR-009a) : sortie console du build scratch
   acceptant la liaison d'un token adopté + sortie du refus nommé d'un token
   inexistant ; mention que le scratch est détruit et `contracts/` intact
   (`git status` à l'appui).

5. **Diff attendu vs observé des deux surfaces de la liste blanche** : le tableau de
   `contracts/liste-blanche.md` confronté au réel — compteur build 62 → 139, tailles
   des constantes de `01-tokens.js`, les 2 lignes du diff golden. Tout écart résiduel
   y est expliqué (ou la mention « aucun écart »).

6. **Reçu de l'angle mort** (US1) : findings `figma-tokens / ahead` avant adoption
   (dénombrés, échantillon nommé) → axe tokens propre après ; verdict final
   `npm run parity` exit 0.

7. **Portes à la clôture** (SC-005) : la sortie des 7 commandes du sweep F1, dans le
   worktree, avec le `N/N` vivant de `npm run eval` (jamais un compte codé en dur
   ailleurs que dans ce reçu daté). **Plus le reçu lecture seule (FR-010)** : exactement
   un `figma_execute` en lecture (le contenu de `parity/extract-figma.plugin.js`),
   aucune écriture Figma de bout en bout du chantier. C'est la seule preuve de FR-010 —
   structurelle, donc écrite plutôt que sous-entendue (§V).

## Reçus bruts

Sous `specs/012-adopt-figma-tokens/proofs/` : sorties console datées (refresh, parity
avant/après, build, golden diff, essai scratch, sweep). Le rapport les cite, il ne les
remplace pas.
