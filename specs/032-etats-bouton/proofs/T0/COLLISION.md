# T004 — la ligne de base n'est PAS une ligne de base. Pourquoi, et ce qui a été décidé.

**Date** : 2026-09-04, ~18h50
**Constat** : le balayage de T004 a tourné entièrement, mais sur un arbre qui
n'était pas au repos. Il est conservé tel quel dans `gates.txt` comme *relevé
daté*, et il est **disqualifié comme ligne de base** de la vague 032.

## Ce qui a été mesuré

| Porte | Sortie |
|---|---|
| build, parity, plugin:check, roundtrip, core-browser-check, tsc ×2 | exit 0 |
| les six portes Odoo | exit 0 |
| **eval** | **exit 1 — 243/244** |
| `parity/baseline.json` | **40 entrées** ✅ (la valeur attendue) |
| `git status --short` | **~90 fichiers modifiés**, dont 10 contrats |

L'évaluation en échec est `golden-generated-output` :
« Generated output diverges from golden manifest (46 file[s]) ».

## La cause — ce n'est pas la vague 032

Une **autre session Claude, `oceanic-oak-f2`, travaille dans le MÊME worktree**
au même moment (confirmée vive : `npm run eval` en cours, PID 61853, démarré à
18h48 ; fichiers écrits à 18h37 et 18h41). Elle implémente le tinyspec
`specs/tiny/accessibilite-home-odoo.md` — pose des niveaux de titre
(`element: "h4"`) dans dix contrats.

Ce qu'elle a déjà écrit dans l'arbre, non committé :

- **10 contrats bumpés** : `carte` 3.0.0 → 3.1.0, `carte-categorie`, `devis`,
  `footer`, `google-reviews`, `hero-video`, `presentation`,
  `produits-ecommerce`, `reassurances`, `sav` ;
- **le `graphDigest` a déjà bougé** : `fa08d58…` → `cde58d9…` ;
- **les quatre miroirs Odoo manuels sont déjà réécrits** :
  `integrations/odoo/config/inputs.lock.json`,
  `scripts/odoo/scan-saved-versions.ts`,
  `…/static/src/js/version_guard.js`,
  `evals/fixtures/odoo-production/version-drift/cases.json` ;
- `catalog/`, `figma-sync/*.js`, `src/components/*` régénérés ;
- **`docs/03-token-pipeline.md` modifié** ;
- leur `golden:update` n'est pas encore passé — d'où le 243/244.

## Pourquoi c'était un arrêt, et pas un contournement

Ces fichiers sont **exactement** ceux de la vague 032 :

- T023–T028 (la cascade Odoo) écrivent les six mêmes miroirs et le même
  `graphDigest` ;
- T022 (`golden:update`) **figerait leur généré inachevé dans le manifeste
  d'or** sous couvert de la vague 032 — un mensonge silencieux du type le plus
  grave que ce dépôt reconnaisse ;
- T012 vise `docs/03-token-pipeline.md`, qu'elles viennent de toucher ;
- et la vague 032 enchaîne ensuite **trois écritures irréversibles** sur le
  fichier Figma partagé (version nommée, marqueurs, 42 variables, et la
  reconstruction du master `Bouton` 6:122 de 7 à 28 variantes, ~354 instances
  en jeu). §XI exige des zones disjointes tenues par un orchestrateur ; il n'y
  en avait aucun.

## Décisions de l'owner, 2026-09-04

1. **Attendre le commit de `oceanic-oak-f2`.** La cascade Odoo et `golden.json`
   n'ont droit qu'à un seul écrivain. Une fois leur travail committé, T004 est
   **rejoué intégralement** et c'est CE relevé-là qui sera la ligne de base
   (`gates.txt` sera réécrit, celui-ci est archivé sous `gates-disqualifie.txt`).
2. **Aucune mutation du canevas Figma sans feu vert explicite.** Le travail
   dépôt et les histoires US1/US2 vont jusqu'au bout ; chaque geste canevas
   (T009, T011, T046, T047) s'arrête devant l'owner.

`oceanic-oak-f2` a été prévenue par message inter-sessions.

## Ce qui reste VALIDE de ce qui a été fait avant l'arrêt

- **T006 — l'avant du repos** (`proofs/T0/repos/`, 7 PNG + manifest). Il rend
  `ds.button` **2.1.0** à partir de `tokens/primitives.tokens.json` — deux
  fichiers que `oceanic-oak-f2` ne touche pas. La fenêtre irrattrapable de
  SC-006 est donc bien capturée, et elle reste juste.
- **T003 — les trois accès** (`acces.txt`).
- **T005 — l'outil de rendu** (`tools/render-repos.mts`).

## Ce qui devra être REFAIT

- **T004** en entier, après leur commit.
- **T007** — la photographie §X du canevas. Une première capture `032-avant`
  a bien été prise (10 planches, version de fichier v2395405567646626714), mais
  §X demande la photographie **immédiatement avant le premier geste**. Elle sera
  rejouée avec `--refresh` à ce moment-là. La capture d'aujourd'hui est
  conservée : elle ne coûte rien et elle documente l'état du 2026-09-04.
