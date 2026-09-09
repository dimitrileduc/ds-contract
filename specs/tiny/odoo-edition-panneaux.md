# TinySpec : vérifier l'édition Odoo de chaque bloc, depuis la config

**Branch** : comet-yogurt
**Date** : 2026-09-09
**Status** : en cours — instrument livré, registre rempli, correctifs à faire
**Complexity** : small (borderline — si le générique dépasse ~600 lignes ou demande un harnais par bloc, passer en spec complète)

## Quoi

Les panneaux d'édition Odoo ont des bugs et personne n'en a la liste : c'est à l'instrument de la produire, pas à l'owner. L'instrument existe (`integrations/odoo/qa/`, ~40 scénarios Playwright sur le vrai éditeur) mais il date du 14–23 août, n'a jamais été relancé en série, et cinq blocs n'ont aucun scénario (formulaire, hero-video, realisations, menu-mobile, sous-menu). On relance tout, puis on écrit UN scénario générique qui lit les 19 `*.authoring.json` et prouve chaque verdict à l'écran. Chaque rouge trouvé (suite, générique, passe exploratoire) devient une fixture avant son correctif (règle des claims).

## Contexte

| Fichier | Rôle |
|---|---|
| `integrations/odoo/qa/run.mts` | Contexte — `withInstance`, sessions rédacteur/publique, `odooShell` ; **modifié** : `--all` lance chaque `scenarios/*.spec.mts` en série et écrit le tableau |
| `integrations/odoo/qa/lib/editor.mts` | Contexte — `enterEditor`, `select`, `frapperAuClicHumain`, `poserHref`, `insertSnippet` (réutilisés, pas modifiés) |
| `integrations/odoo/qa/scenarios/editability-boundary.spec.mts` | Contexte — la forme du test (isContentEditable + frappe réelle + boutons qui fuient), sur 6 nœuds ; le générique la généralise |
| `integrations/odoo/qa/scenarios/equipe.spec.mts` | Contexte — modèle d'un ajout/suppression/déplacement de carte + upload |
| `integrations/odoo/config/*.authoring.json` | Entrée — `controls[]` (`mechanism`, `targetSelector`), `parts[]` (`verdict`, `selector`, `allowedMarks`), `rootActions[]` |
| `integrations/odoo/qa/scenarios/edition-generique.spec.mts` | **Nouveau** — le scénario piloté par la config |
| `integrations/odoo/qa/fixtures/edition-bugs.json` | **Nouveau** — le registre des bugs TROUVÉS par l'instrument et la passe exploratoire, un cas = un attendu rouge |
| `package.json` | **Modifié** — `odoo:qa:all`, `odoo:qa:edition` |
| `docs/16-mode-emploi-composant-vers-odoo.md` | **Modifié** — étape 9 pointe le générique ; un bloc neuf est couvert par sa config, sans scénario dédié |

## Exigences

1. `npm run odoo:qa:all` lance chaque `*.spec.mts` sur une instance JETABLE (jamais 8071), en série, et écrit `specs/tiny/proofs/odoo-edition/suite.json` : un `pass | fail | skipped` par scénario, jamais un vert par absence de mesure.
2. Le générique, pour chaque bloc ayant une config : insère le bloc (`insertSnippet`), puis prouve chaque verdict :
   - part `directly-editable` / contrôle `plain-text` → frappe réelle, save RPC 200, relecture publique (`textContent`, jamais `innerText`), remise de l'original ;
   - `rich-text` → un `<strong>` survit à la garde de saisie ; une marque hors `allowedMarks` est aplatie ;
   - `not-editable` → `isContentEditable === false` ET aucun bouton déplacer/dupliquer/supprimer ; si un fuit, le geste est tenté et le reçu est rouge ;
   - `rootActions` → chaque action `allowed` est offerte, chaque `forbidden` absente ;
   - `ordered-repeat` → ajouter, supprimer, monter/descendre aux extrêmes, vider puis ré-ajouter, annuler/rétablir, save, recompter en public ;
   - `enum` → chaque valeur posée, sauvée, relue.
3. Chaque bloc passe aussi : dupliquer le bloc puis éditer la copie sans toucher l'original ; save → rouvrir l'éditeur → ré-éditer → re-save ; « Annuler » remet l'état d'avant ; édition en FR ne ressuscite pas `en_US` (`arch_db`).
4. Un `mechanism` sans preuve écrite (`native-menu`, `computed-display`, média natif) sort en `skipped` NOMMÉ dans le reçu, pas en vert.
5. Tout sous le rôle rédacteur (`editor@example.test`), jamais admin.
6. Aucune liste n'est demandée à l'owner ; il reçoit le registre et tranche les cas ambigus. Un bug de `edition-bugs.json` est ROUGE avant son correctif, VERT après ; le correctif ne touche pas les fichiers générés.

## Plan

1. `run.mts --all` : découvrir `scenarios/*.spec.mts`, lancer chacun en sous-processus, agréger. Relancer la suite → premier tableau (état des lieux avant tout code).
2. `edition-generique.spec.mts` : charger les 19 configs, un `Recueil` par bloc, dérouler les exigences 2–4 par mécanisme ; les cinq blocs sans scénario sont ainsi couverts.
3. Une passe exploratoire par bloc (agent + navigateur, rôle rédacteur) pour ce que le script ne juge pas : libellé obscur, contrôle absent, comportement bizarre. Tout rouge (suite, générique, passe) entre dans `edition-bugs.json` ; corriger un par un (source Odoo manuelle : `authoring.js`, options, QWeb — jamais `generated/`).
4. Docs/16 étape 9 + journal des pièges rencontrés.

## Tâches

- [x] `--all` dans `run.mts` + script npm — **relance complète NON faite** : 2,5 min par scénario (chacun reconstruit la base), l'owner a tranché « pas 2 h pour savoir si l'édition marche » ; le générique répond en 5 min. La suite tourne à part, plus tard.
- [x] Générique : chargement des configs + insertion du bloc + verdicts texte/rich-text/not-editable/rootActions (+ constat « sélecteurs résolus »)
- [x] Générique : collections, dupliquer, rouvrir/re-save, annuler (raccourci) — enum et traduction restent `skipped` nommés
- [x] Générique : `skipped` nommés ; 4 passages sur les 19 configs, résultats stables (`specs/tiny/proofs/odoo-edition/`)
- [x] `edition-bugs.json` : 18 cas trouvés par l'instrument (passe exploratoire non faite)
- [x] Correctifs rouge → vert du 2026-09-09 : EB-004 (Réassurances accroche/titre), EB-009 (section Avis Google sans réglages natifs), EB-001 (Réalisations : couche entière) ; EB-003 / EB-007 passés en `fixed-by-composition` (décision owner) ; EB-005 / EB-008 = artefacts d'instrument, corrigés dans le générique
- [ ] Reste : EB-002 (panneau avantages, label → Oops), EB-006 (Équipe vidée), EB-010/011/012/013/014 (config à aligner sur décision), EB-015/016 (sélecteurs morts + porte), EB-017, EB-021/022/023
- [ ] Docs/16 étape 9 ; `odoo:derivation:check`, `odoo:authoring:check`, `odoo:module:check` verts

## Fini quand

- [ ] Tableau de la suite existante livré (avant/après)
- [ ] Générique vert ou `skipped` nommé sur les 19 configs, reçus dans `specs/tiny/proofs/odoo-edition/`
- [ ] Chaque bug du registre : reçu rouge daté puis vert
- [ ] `npx tsc -p integrations/odoo/tsconfig.json --noEmit` et les portes Odoo vertes
