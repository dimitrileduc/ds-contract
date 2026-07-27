# Quickstart — 006 « Avis Google »

**Spec** : [spec.md](./spec.md) · **Plan** : [plan.md](./plan.md) · **Recherche** :
[research.md](./research.md)

Comment travailler cette itération, dans l'ordre. Les interfaces épinglées sont dans
[`contracts/`](./contracts/) : [preuve par région](./contracts/region-proof.md),
[relevés de mesure](./contracts/measure-record.md),
[protocole de poussée](./contracts/push-protocol.md).

---

## Prérequis, une fois

```bash
# 1. La branche doit contenir la spec 005 (close le 2026-07-25, non mergée)
git merge 005-figma-source-cleanup        # apporte aussi la regex \d{3}/ de checkpoint.js

# 2. Le worktree n'a pas de node_modules ; npm run eval ne peut pas y tourner
npm install

# 3. Ligne de base des gates, AVANT tout travail 006, sur le CHECKOUT PRINCIPAL
cd /Users/dlstudio/.superset/projects/ds-contracts-poc
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

> **Pourquoi la ligne de base d'abord.** `subjects.ts`, `evals/harness.ts` et
> `parity/snapshots/figma-components.json` portent encore l'orthographe Bouton **pré-005**
> (`Property 1`, `Outilne noir`), que 005 a délibérément laissée. `parity` et
> `extract:figma:visual` peuvent donc être rouges **pour des raisons étrangères à 006**. Consigner
> le résultat dans `decisions.md` : c'est ce qui empêche à la fois d'accuser 006 à tort et de
> masquer une vraie régression 006 dans le bruit.

**Où tourne quoi** — dans le worktree : `pages:selftest`, `pages:compare`, les scripts bridge. Sur
le checkout principal : tout le reste (`npm run eval` symlinke `ROOT/node_modules`).

---

## Le déroulé, phase par phase

> **Correspondance des numéros de phase.** Ce document numérote **0-6** (déroulé opératoire) ;
> `tasks.md` numérote **1-7** (phases d'exécution, porteuses des ids de tâche). Table :
> Prérequis → **Phase 1 (T001-T008)** · Phase 0 → **Phases 2a + 2b** · Phase 1 → **Phase 2c** ·
> Phase 2 → **Phases 3 + 4a** · Phase 3 → **Phase 4b** · Phase 4 → **Phase 4c** ·
> Phase 5 → **Phase 4d** · Phase 6 → **Phases 5, 6 et 7**.
> **En cas de doute, `tasks.md` fait foi** — c'est lui qui porte les ids et les verrous durs.

### Phase 0 — État réel + sonde de plancher *(aucune écriture canevas)*

1. **Re-scan positionnel des 9 maquettes** (`bridge/scan.js`) → `inventory/scan-<date>.json`.
   Les node ids de l'ère 003 sont **périmés** : 005 a supprimé deux pages, déplacé 18 icônes,
   redimensionné Section-header 1552→1550, reconstruit le Footer.
   **Lire l'`imageHash` sur les 8 occurrences**, pas sur 2 — toute divergence est nommée et
   tranchée **avant** de toucher l'occurrence concernée (FR-006).
2. **Extraire les octets natifs de l'aplat** (`getImageByHash().getBytesAsync()`, lecture seule) →
   `measures/aplat-source.png` + son side-car.
3. **Sonde de plancher de fidélité** : rendre une carte d'essai en headless, la comparer au crop de
   l'aplat, **publier le chiffre + le triptyque à l'owner**.
   → **STOP-GATE : décision de seuil écrite dans `decisions.md` avant la Phase 1.**
   Le bloc rend en Montserrat alors que l'aplat est un raster de la police de Trustindex : le
   plancher est estimé **8-12 %** de la région. FR-016 prévoit exactement ce cas — « arrêt et
   décision explicite », pas échec automatique.
4. **Trancher la collision de numéro** (`BACKLOG-SPEC-006-*.md` et `RAPPORT-CLOTURE.md:27-28`
   assignent un **autre** périmètre à « spec 006 ») → entrée `decisions.md`.

### Phase 1 — Mesure et faisabilité *(aucune écriture canevas)*

5. Remplir `measures/mesures-aplat.md` — deux lectures par valeur, règle de tranchage appliquée,
   un crop par fait ([interface](./contracts/measure-record.md)).
6. Remplir la **table de faisabilité des canaux** : chaque valeur classée `token` / `literal` /
   `declared-draw` / `declared-annotate` / `refusé`, calculée depuis le code. Toute impasse est
   redessinée autour ou nommée. `build` + `figma:plan` ne seront plus qu'une confirmation.
7. Transcrire le contenu réel → `measures/transcription-<maquette>.md`, **relu en seconde passe**.

### Phase 2 — Contrats, code, instrument *(aucune écriture canevas)*

8. Écrire les deux contrats + `assets/icons/google.svg`.
   **`anchors.figma.fileKey` renseigné dès ce commit** — sinon le garde-fou « mauvais fichier » est
   éteint à la poussée.
9. Chaîne complète, et **purge des 6 orphelins `figma-sync/`** dans le **même commit relu** :

```bash
npm run build && npm run figma:plan && npm run catalog && npm run verify:catalog
git rm figma-sync/03-input.js figma-sync/04-input.js figma-sync/04-textarea.js \
       figma-sync/05-select.js figma-sync/05-textarea.js figma-sync/06-textarea.js
npm run golden:update && npm run parity
```

10. Ajouter le flag `--regions` (+2 cas de selftest, 5 → 7) et vérifier l'**identité byte** d'une
    exécution sans le flag ([interface](./contracts/region-proof.md)).
11. Valider les scripts générés **à blanc** contre `scripts/plugin-engine-mock-figma.mjs`.

### Phase 3 — Convergence hors ligne *(aucune écriture canevas)*

12. **Jambe A** : rendu code ↔ crop de l'aplat, itérations illimitées, ~30 s chacune.
    Itérer le **contrat**, jamais le rendu. S'arrêter au chiffre décidé en Phase 0.
    → signature dans `decisions.md`.

### Phase 4 — Première poussée *(première écriture canevas)*

13. `checkpoint 006/masters/creation` → captures **avant** ×9.
14. Servir et exécuter **uniquement** `NN-reviewcard.js` puis `NN-googlereviews.js`
    ([protocole](./contracts/push-protocol.md)).
15. Captures **après** ×9 → `pages:compare` → **exiger 9/9 identical**.
16. `npm run anchors:writeback`, puis re-générer (l'ancre entre dans les octets émis) et
    `golden:update`.
17. **Jambe B** : +2 sujets dans `subjects.ts` (avec `renderWidth`, les deux masters étant à largeur
    fixe) → `npm run extract:figma:visual -- --write-baseline`, **une seule fois**, après le dernier
    amend. → signature dans `decisions.md`.
18. `checkpoint 006/masters/rangement` → déplacer les 2 sets vers `DS · Molécules` /
    `DS · Organisms`, supprimer les pages auto-créées → **9/9 identical**.

> **À partir d'ici, plus aucun amend de `ds.google-reviews`** : il détruirait le contenu des avis sur
> toutes les occurrences déjà adoptées.

### Phase 5 — Adoption, **une occurrence à la fois**

Pour chaque occurrence, dans cet ordre :

1. Lire la région depuis le scan → `proofs/<maquette>/region.json` ; **écrire l'écart attendu**
   avant d'exécuter.
2. Détecter les personnalisations **avant** remplacement ; noter que le ledger reviendra vide et que
   ce vide ne prouve rien (le relevé de transcription le remplace).
3. `checkpoint 006/adoption/<maquette>` ; captures **avant** ×9.
4. **Lire-tout / écrire-tout sur les DEUX enfants du `GROUP` ensemble** — lire les bornes du
   Section-header **et** de l'aplat, retirer l'aplat, insérer l'instance, puis **ré-affirmer les
   positions des deux enfants dans la même transaction**. C'est le correctif 003 : ne jamais toucher
   un enfant en supposant l'autre stable.
5. Appliquer le contenu réel **par propriétés** (jamais d'override brut).
6. **Garde FR-012, immédiatement** : relire la hauteur de la frame **et les bornes de tous les
   frères du `GROUP`**. Un écart ⇒ **STOP**, restaurer le checkpoint, ne pas passer à la suivante.
   (005 a montré que le dégât arrive en repositionnement sub-pixel de voisins non touchés, qu'un
   simple contrôle de hauteur ne voit pas.)
7. Captures **après** ×9 → `pages:compare -- --regions …`.
   - `regionPct` = le chiffre de FR-016 ;
   - `outsideDiffCount` **doit valoir 0** partout, `Motorisation` comprise ;
   - toute ligne `dimension-mismatch` / `capture-failed` est un **STOP**, jamais un point de donnée.
8. **Revue à l'œil sur les crops** — obligatoire. 003 a perdu une graisse de police et un espacement
   de paragraphe, tous deux **sous** le seuil, trouvés uniquement en regardant les images.
9. Commit ensemble : verdict + ledger + entrée `decisions.md`.

### Phase 6 — Photos, renommage, clôture

19. Appliquer les **8 fills photo** (après le dernier amend — donnée la plus fragile), consignés au
    ledger.
20. `checkpoint 006/cloture/renommage` → renommer en français → **9/9 identical**. Consigner la
    procédure inverse (renommer en arrière avant tout re-push futur). — **Fait** : checkpoint
    `versionId 2380602413129417606`, `ReviewCard`→`Review-card`, `GoogleReviews`→`Avis Google`,
    sha256 avant=après sur les 9 maquettes, `pages:compare` 9/9 identical. Procédure inverse
    ci-dessous (§Rollback renommage).
21. **Re-pointer `deterministic-roundtrip` sur `ds.google-reviews`** — son en-tête demande
    littéralement ce re-pointage dès que Piqueray gagne un composant qui en compose un autre.
22. Évals : réanimer `detect-figma-missing-nested-instance` (déplacement), vérifier puis réanimer
    `repeated-children-collection`, retirer le saut d'ordonnancement de dépendances dans
    `plugin:check` ; écrire les évals neuves. Resynchroniser le compteur partout (`README.md` en
    porte deux valeurs différentes).
23. **Garde de la maquette témoin** : relecture directe avant/après du master `Étoile` et de l'asset
    `check` — `Motorisation` ne les instancie pas, elle est aveugle à ces pièces.
24. Réconcilier les compteurs de blocs reportés (2 vs 3 selon le document) et publier **2 → 0**.
25. Volée complète des gates sur le checkout principal + rapport de clôture.

---

## Les cinq erreurs à ne pas commettre

1. **Exécuter `01-tokens.js` ou `batch-01.js`** — le premier réécrit les collections de variables, le
   second reconstruit l'intérieur du Bouton et détruit ses slots d'icônes.
2. **Instancier `ds.button`** — la résolution se fait par nom, le contrat dit `Button`, le master dit
   « Bouton » : le script échoue, et le « réparer » créerait un second set Button.
3. **Renommer les masters trop tôt** — la section cherche sa carte **par nom** ; le renommage
   français est le dernier geste de la spec.
4. **Lire un `diffCount: 0` de `dimension-mismatch` comme une réussite** — c'est l'inverse : la
   preuve n'a pas eu lieu, il n'y a ni crop ni chiffre.
5. **Amender un master après le début de l'adoption** — les overrides imbriqués des occurrences déjà
   faites meurent, et seul le ledger permet de les rejouer.

---

## Rollback renommage (R5 — geste manuel, guidé, requis avant tout re-push futur)

À la clôture de la spec (T076), les masters portent les noms **français** :
`Review-card` (`2178:7349`), `Avis Google` (`2178:7381`).

`findComponentByName(spec.dep)` (`core/emit-figma-script.ts:3098-3106`, appelé `:3252`)
résout par `n.name === name`, où `name` vient du contrat (`"ReviewCard"` / `"GoogleReviews"`,
PascalCase — `setName` à `:2441`). **Si un re-push de `NN-reviewcard.js` ou
`NN-googlereviews.js` est un jour nécessaire** (amend de contrat, reconstruction après incident),
la recherche par nom **échouera** contre les masters français — et une « réparation » naïve
créerait un **second set** à côté de l'existant (le même piège que le Bouton, R5).

**Procédure, dans l'ordre** :

1. `checkpoint 006/rollback/renommage-avant-repush` → captures avant ×9.
2. Renommer **en arrière**, un seul champ `.name` par master, aucune autre propriété touchée :
   - `Review-card` → `ReviewCard`
   - `Avis Google` → `GoogleReviews`
3. `pages:compare` → exiger **9/9 identical** (un renommage seul ne doit toucher aucun pixel,
   comme constaté à la clôture — sha256 avant/après identiques sur les 9 maquettes).
4. Exécuter le(s) script(s) `figma-sync/NN-*.js` nécessaire(s) (protocole habituel).
5. **Reproduire le geste T076** pour revenir à la convention française : nouveau checkpoint,
   renommer `ReviewCard`→`Review-card` / `GoogleReviews`→`Avis Google`, captures avant/après,
   `pages:compare` 9/9 identical.
6. Consigner les deux allers-retours dans `decisions.md` (checkpoints + verdicts), comme pour
   tout autre geste canevas.

Aucune API de restauration programmatique n'existe pour un renommage (comme pour les
checkpoints eux-mêmes) — c'est un geste manuel guidé par cette procédure, pas un script.
