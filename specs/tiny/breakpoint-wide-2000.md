# TinySpec: `breakpoint.wide` 1600 → 2000, DS puis patch Piqueray

**Branch**: `main` (un commit direct, comme le 1400 → 1600 du 2026-09-08, `244deea2`)
**Date**: 2026-09-16
**Status**: done — DS `59fd394d`, client `b322e9f` déployé en prod le 2026-09-16 à 12:15 (agent Superset, vérifié au pixel)
**Complexity**: small

## What

Le mode Wide (maquette 1728) commence à 2000 px au lieu de 1600. Décision owner du 2026-09-16.
Conséquence mesurable, assumée : **plus aucun portable ne reçoit la maquette 1728** (MacBook Pro 16 = 1728 CSS,
donc Desktop 1200 désormais) ; Wide ne sert que sur écran externe (27" QHD, 4K à 150 %, ≥ 2000 CSS).
Motif owner : non formulé au-delà de la décision ; la description du jeton porte la décision datée et la conséquence.

La valeur vit **ici** (ds-contract = source) ; le dépôt client `psbe-piqueray_srl` n'en tient qu'une copie déployée
et reçoit le commit en **patch**, jamais en copie de fichiers (mémoire `module-odoo-deux-depots-patch-jamais-copie`).

## Context

| File | Role |
|------|------|
| `tokens/primitives.tokens.json` | Modifié — `breakpoint.wide.$value` 1600px → 2000px + `$description` (datée, avec le motif et la conséquence portables) |
| `src/styles/tokens.css` | Généré par `npm run build` — bloc `@media (min-width: 2000px)` |
| `integrations/odoo/addons/piqueray_ds/static/src/css/generated/tokens.pqr.css` | Généré par `npm run build` (idem `specs/018-…/module/…/tokens.pqr.css`, 4ᵉ sortie) |
| `integrations/odoo/addons/piqueray_ds/static/src/css/{odoo-bridge,responsive}.pqr.css` + `responsive/*.pqr.css` | Modifiés à la main — **18 fichiers**, `@media (min-width: 1600px)` → 2000 ; une media query ne lit pas `var()`, aucune garde ne vérifie l'alignement |
| `docs/03-token-pipeline.md` | Modifié — le paragraphe qui justifie 1600 (l. 85) reçoit le nouveau seuil, daté, sans effacer l'historique 1400 → 1600 |
| `docs/16-mode-emploi-composant-vers-odoo.md` | Modifié — les 2 gabarits `@media (min-width: 1600px)` (l. 129, 432) |
| `evals/golden.json` | Re-pin — épingle `src/styles/tokens.css` |
| `~/Documents/psbe-piqueray_srl/src/piqueray_ds` | Copie client — reçoit le patch du commit DS (`git am -p4 --directory=src`) |

Hors périmètre, explicitement : `extract/figma/organism-audit/harness.ts` et `integrations/odoo/qa/run.mts` (viewports
de mesure à 1600, pas des breakpoints) ; Figma (les breakpoints ne sont pas des variables, `parity` exclut `breakpoint/*`,
les témoins restent 390 / 834 / 1200 / 1728).

## Requirements

1. `breakpoint.wide` = `2000px` dans les primitives ; `tablette` 768 et `desktop` 992 inchangés.
2. Après `npm run build`, **zéro** `1600px` dans `src/styles/tokens.css` et dans `tokens.pqr.css` généré.
3. **Zéro** `1600px` dans les CSS écrites à la main du module ; les commentaires `← {breakpoint.wide}` suivent.
4. `docs/03` et `docs/16` disent 2000 ; la description du jeton et `docs/03` gardent la trace datée des deux seuils précédents.
5. Portes vertes : `build`, `parity`, `eval` (N/N live après re-pin golden), `emitters:check`, `tsc`.
6. Le dépôt client est aligné par patch : `diff -rq` des deux `static/src/css` vide après `git am`.

## Plan

1. Éditer le jeton + sa description (motif owner, date, conséquence portables). `npm run build`.
2. `sed -i '' 's/min-width: 1600px/min-width: 2000px/g'` sur les 18 CSS manuelles ; `grep -rn 1600 static/src/css` doit rendre vide.
3. Docs 03 et 16. `npm run golden:update` APRÈS le dernier build, puis la suite des portes.
4. Contrôle visuel : instance jetable, page d'accueil à 1728 (doit rendre la composition 1200 : H1 40, gap 128, gutter 56)
   et à 2100 (composition 1728 : H1 54, gap 192, gutter 89). Deux captures, pas une lecture.
5. Commit `main` (message : la décision, la conséquence, le fait que 2000 n'est ni Bootstrap ni Ant/Material).
6. `git format-patch -1 <sha> -- integrations/odoo/addons/piqueray_ds` → `git am -p4 --directory=src` côté client ;
   `diff -rq` vide ; push `main` client = déploiement Odoo.sh (hors heures, mémoire `deploiement-prod-client-fenetre-et-mesure`).

## Tasks

- [x] Jeton + description ; `npm run build`
- [x] 18 CSS manuelles → 2000 ; grep 1600 vide sur `static/src/css`
- [x] `docs/03-token-pipeline.md` l. 85 et `docs/16` l. 129 / 432
- [x] `golden:update` puis `build · parity · emitters:check · tsc` verts ; eval **249/252**, les 3 rouges (`figma-text-styles-piqueray`, `computed-floor-gate`, `preservation-013-clobber-detected`) sont **identiques dans le `results.json` committé sur `main` avant ce changement** — préexistantes, hors périmètre
- [x] Captures 1728 et 2100 sur instance jetable (composition 1200 / 1728 respectivement)
- [x] Commit `main` DS
- [x] Patch appliqué côté client, `diff -rq` vide
- [x] Push `main` client (décision owner, en journée) : `b322e9f` à 12:15:01 après rebase sur 6 commits amont, prod servant le CSS neuf à 12:15:48 (**47 s**) ; mesuré en prod 1728 → 56 / 128, 2100 → 89 / 192

## Done When

- [x] Tâches DS cochées, portes vertes, 249/252 noté dans le commit
- [x] `grep -rn "1600px" tokens src/styles integrations/odoo/addons docs/16*` ne rend rien (docs/03 garde 1600 dans l'historique daté, voulu)
- [x] Les deux modules (DS et client) sont identiques au `diff -rq`

## Relevé (2026-09-16)

Mesuré sur instance jetable `piqueray-odoo-bp2000` (8111, montant CE checkout, vérifié `docker inspect`) : à **1728** gap 128 /
gutter 56 (composition Desktop) ; à **2100** gap 192 / gutter 89 (composition Wide). Deux captures, arrêtée après.
Pièges : (1) `restore-seed.sh` sur un volume VIERGE pose le filestore À CÔTÉ du dossier `<db>/` (docker cp crée la
destination absente avec le contenu) → `chown` échoue, page 500 ; déplacer à la main. (2) `docker exec … odoo -u` court-circuite
l'entrypoint : passer `--db_host db --db_user odoo --db_password odoo`, sinon `fe_sendauth`. (3) Le seed date du 23/08 et l'addon
a un champ `website` de plus (`x_pqr_footer_tel`) : `-u piqueray_ds` obligatoire avant toute mesure.
