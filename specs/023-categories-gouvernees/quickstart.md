# Quickstart — 023 Catégories gouvernées

Parcours d'exécution, dans l'ordre imposé par les gates. Détail des décisions :
[research.md](./research.md) · modèle : [data-model.md](./data-model.md) · gates :
[contracts/gates.interface.md](./contracts/gates.interface.md).

## 0. Worktree autosuffisant (F1) + état des lieux

```bash
npm install && npx playwright install chromium     # DANS le worktree (constitution F1)
# base verte AVANT de toucher quoi que ce soit — sweep COMPLET (T002), pas un raccourci :
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

Relever (sans re-diagnostiquer — mémoire projet) l'état des deux portes Odoo rouges
pré-existantes : `npm run odoo:qualification` et l'instrument `editability-boundary`.
Consigner dans `proofs/etat-initial.md`.

## 1. Audit lecture seule (§VIII — par POSITION, jamais par nom)

Pont figma-console (ports 9223-9232, jamais forcer `FIGMA_WS_PORT` dans
`.claude/settings.json` — règles CLAUDE.md) ; page `Pages` = `210:325`, seule route
`figma_execute` + `loadAllPagesAsync`.

- Recenser les **usages réels** du bloc (attendu : 7 — 6×2 colonnes, 1×3 ; le décompte
  live fait foi) et **toutes les copies locales** de carte (attendu : 3+), par position.
- Relever le master `CategoriesPrincipales` (`2115:4277`, 4 variantes de « Disposition »)
  et le set `Carte` (`2063:1622`) ; recenser les usages de `Carte/Categorie` par position
  (décide le sort de `ds.carte`, research D3).
- Produire `audits/` + le projet de `gates/gate-a-modele-cible.json` (une décision par
  copie dérivée).

## 2. ⛔ GATE A — l'owner valide le modèle cible

Aucune mutation canvas avant `gate-a-modele-cible.json` en `status: validated` +
`proofs/gate-a.md` daté.

## 3. Avant-capture (§X) puis mutations Figma

- Capturer **TOUTES** les cibles avant la première mutation (7 usages + les 2 masters,
  image + structure), vérifier chaque capture non vide et bien dimensionnée
  (`extract/figma/page-parity/` réutilisé tel quel, receiver port 9227).
- Puis, conformément au Gate A : nettoyer le master section (axes Style × Colonnes,
  suppression de l'axe « Disposition »), officialiser le style superposé en variante de
  la molécule, rebrancher chaque copie locale en instance, re-pointer les 7 usages en
  préservant colonnage et contenu, remodeler « Rdv » en instance renseignée.
- Capture d'après + comparaison pixel par usage (pixelmatch) ; version native Figma
  (`saveVersionHistoryAsync`) avant/après.

## 4. ⛔ GATE B — l'owner valide la comparaison pixel

7 deltas chiffrés, causes nommées, conformité aux décisions par copie. Sans validation :
pas de déclaration « repair neutre », pas d'extraction.

## 5. Extraction + build + portes du dépôt

- Étendre le schéma (E1 : `VariantLayoutSchema.columns`, additive) + émetteurs + eval de
  refus AVANT toute phrase de capacité ; bump `docs/02-contract-spec.md`.
- Acquérir l'entrée d'extraction : relevé frais **post-Gate B** de la source nettoyée
  (jamais le cliché périmé), puis extraire les deux contrats (mints from-dump pour la
  géométrie, zéro littéral invisible).
- Rafraîchir (lecture seule) `parity/snapshots/figma-components.json` AVANT le sweep —
  sinon l'axe canvas compare au cliché périmé du 2026-08-07 (la limite 017 se solde ici).
  Puis :

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
npm run geometry:gate && npm run catalog        # catalog : PAS régénéré par build (leçon 018)
```

- Re-pins attendus : `evals/golden.json`, `figma-sync/plugin/engine.receipt.json`,
  `examples/polaris/figma/*.figma.js` (émetteur édité) — jamais à l'aveugle, toujours revus.

## 6. ⛔ GATE C — l'owner valide le diff des deux contrats

Le diff est la revue (Principe VI). Sans validation : ni câblage US3, ni Odoo.

## 7. Câblage du différentiel (US3)

- Vérifier le cliché `figma-components.json` rafraîchi à l'étape 5 (état post-mutation,
  committé comme entrée capturée) ; re-refresh lecture seule seulement si le canvas a bougé.
- +2 sujets dans `extract/figma/visual-parity/subjects.ts` + baseline.
- Protocole de preuve : dérive injectée (structure, apparence) → signalée par nom →
  retirée → retour au vert ; archivé dans `proofs/us3/`.

## 8. ⛔ GATE D — l'owner valide la table d'éditabilité

`contracts/categories.editable-scope.json` : 100 % props+parts des deux contrats, 4
verdicts, geste rédacteur par entrée éditable. **Rien d'Odoo avant.**

## 9. Couche Odoo (US2)

- Transcription 1:1 → `integrations/odoo/config/categories.authoring.json` ;
  `npm run odoo:authoring:check` (exhaustivité) + `odoo:inputs:check` + `odoo:module:check`
  + `odoo:derivation:check`.
- Snippet/panneau : collection `ordered-repeat`, textes, image `computed-display`,
  sélecteur `enum` colonnes {2,3}, lien par carte via `BuilderUrlPicker`/`pqrSetCtaHref`.
- Instance QA jetable (compose 022, `odoo:19.0-20260803` + `postgres:15`) ; scénario
  rédacteur d'US2 (pose, add/remove/reorder, éditions, bascule 2↔3 + 4ᵉ carte, gestes
  bloqués, isolation inter-pages) ; 3 points de contrôle (sauvegarde, réouverture, page
  publique) ; preuves dans `proofs/us2/`.

## 10. Clôture

Sweep complet des portes (worktree, F1) + rapport de clôture + entrée MILESTONES datée
(sur le trou de journal existant, nommé — jamais comblé en silence).
