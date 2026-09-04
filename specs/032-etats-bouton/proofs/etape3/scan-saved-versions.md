# T037 — FR-018 / SC-008 : aucun bloc en structure périmée

**Date** : 2026-09-04 · **Instance** : `piqueray-odoo-pilote` (jetable), port 8087

## Résultat

    9 bloc(s) scannés
    { "current": 8, "policy-stale": 1, "structure-stale": 0, "unknown": 0 }

**`structure-stale: 0`** — c'est l'exigence de T037, et elle est tenue. Le bump
`ds.button` 2.1.0 → 2.2.0 et le déplacement du `graphDigest`
(`cde58d95…` → `5f9ed376…`) ont bien été absorbés : la page a été recomposée,
et les huit racines gouvernées portent le digest courant.

## Le bloc `policy-stale`, nommé plutôt que noyé dans un total

`ds.google-reviews`, index 7 — **l'enveloppe de section**
`s_pqr_google_reviews_section`, distincte de la racine du composant (index 8,
qui est `current`).

Sa cause, relevée dans ses attributs : elle ne porte **aucun** des trois
attributs de version de module (`data-vcss`, `data-vxml`, `data-vjs`). Le
classifieur (`scan-saved-versions.ts:34`) range en `policy-stale` tout bloc dont
l'un des trois diffère de `19.0.1.11.0` — et « absent » diffère.

Son contrat (3.1.0), sa version d'édition (3.0.0) et son `graphDigest`
(`5f9ed376…`) sont tous **corrects**.

## Ce n'est PAS la vague 032, et voici la preuve

1. Le seul changement de la vague dans `views/components.xml` est le
   `graphDigest` — vérifié : `git diff` de ce fichier, privé des lignes de
   digest, est **vide**.
2. L'enveloppe n'a **jamais** porté `data-vcss` : contrôlé sur l'état committé
   (`git show HEAD:…components.xml`, lignes 107-112) → 0 occurrence.

C'est donc un écart **pré-existant** du gabarit de cette enveloppe. La vague ne
le crée pas, ne le corrige pas, et ne le dissimule pas : il est écrit ici et
part au registre de travail différé.

## Écart de compte avec le plan, relevé

Le plan annonce « zéro bloc en `structure-stale` **sur les 13** ». Le scan de la
home en trouve **9**. Les 13 sont le nombre de fichiers d'édition
(`*.authoring.json`), pas le nombre de racines gouvernées présentes sur cette
page. Le compte qui fait foi est celui du scan.

## Note de méthode — un incident à ne pas rediscover

`npm run odoo:save` vise **par défaut l'instance de l'owner**
(`piqueray-odoo-test`, port 8071) : c'est écrit en tête de `save-seed.sh`, et la
variable `PQR_PROJECT` **n'a aucun effet** sur ce script — il attend `--project`.

Lancé tel que T037 le formule, il a donc sauvegardé la base de l'owner
(`piqueray_test`) et **écrasé deux fichiers suivis** du dépôt,
`integrations/odoo/qa/seed/{db.dump,filestore.tar.gz}`.

Deux faits, dans l'ordre d'importance :

1. **L'instance de l'owner n'a pas été modifiée.** Le script ne fait que
   `pg_dump` et `tar` — il lit, il n'écrit jamais dans l'instance. Son propre
   en-tête le dit : « save only READS ».
2. **Les deux fichiers écrasés ont été rendus à leur état committé**
   (`git checkout --`), vérifié par `git status` propre sur ce répertoire.

Le semis de l'instance jetable a ensuite été produit **hors du dépôt**
(`--project piqueray-odoo-pilote --out <scratchpad>`), pour ne pas committer un
instantané de travail par-dessus le semis de référence.

**À corriger dans le plan** : T037 doit lire
`bash scripts/odoo/save-seed.sh --project <projet-jetable> --out <hors-dépôt>`,
jamais `npm run odoo:save` nu.
