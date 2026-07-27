# RAPPORT DE CLÔTURE — 007 · Source Figma extractible

**Itération** : `007-figma-extractable-source`
**Fichier live** : `Piqueray (Copy)` (`d9FYAUcqdcNtsuaMgLefvJ`)
**Date de clôture** : 2026-07-27
**État final du canvas** : **40/43 identical** (les 3 résidus sont des masters du DS, nommés §4)
**Verdict d'itération** : clôturée par décision owner **STOP L3** — le lot NOMS (US1) est livré et
prouvé ; le lot VALEURS/typographie/structure (US2 liaisons + US3) est **clos sans exécution**,
sa cause écrite et sa dette léguée nommée intégralement.

Ce rapport est écrit pour SC-011 : un tiers doit pouvoir, à partir de lui seul, reproduire les
compteurs. La procédure du relevé est donc renvoyée à son contrat (§2) et les chiffres d'arrivée
proviennent tous des relevés committés sous `releves/`, jamais de la prose.

---

## 1 · Ce que l'itération a réellement fait, geste par geste

L'ordre de la spec est strictement séquentiel (Setup → Foundational → US1 → US2 → US3 → Clôture).
Chaque lot est encadré par un cycle de preuve `contracts/proof-cycle.md` (capture AVANT ×43 →
geste → capture APRÈS ×43 → `npm run pages:compare`).

| Lot | Contenu | Avant | Après | Diff | Preuve |
|---|---|---|---|---:|---|
| **Étalonnage** (T006) | Double capture, aucun geste entre les deux | 43 cibles | 43 cibles | **43/43 identical** (+ sha256 byte-identiques) | `proofs/00-etalonnage/` |
| **L1** (US1, T019-T024) | Renommages d'identifiants (masters + parts), descriptions accentuées (FR-006a) | baseline ouverture | post-L1 | **43/43 identical** | `proofs/L1/verdict.json` |
| **L1b** (US1, T025) | 6 renommages résiduels classe D trouvés au re-relevé post-L1 + 3 runs gras restaurés | post-L1 | post-L1b | **43/43 identical** | `proofs/L1b/verdict.json` |
| **L2** (US2, T026-T034) | Création pure de **74 variables** (primitives + rôles `typography.*`), aucun consommateur | post-L1b | post-L2 | **43/43 identical** | `proofs/L2/verdict.json` |
| **L3** (US2, T036-T045) | Liaisons de valeurs numériques | — | — | **NON EXÉCUTÉ — STOP L3** | §3 + `proofs/L3/gestes.md` |
| **L4** (US2, T046-T049) | Liaison des 18 styles de texte + marqueurs | — | — | **NON EXÉCUTÉ** (dépendait de L3) | §3 |
| **V1-V3** (US3, T051-T058) | Structure (dé-groupage) + DS·Tokens | — | — | **NON EXÉCUTÉ** (STOP L3) | §3 |

**Résumé chiffré des gestes exécutés** (commit `66bf3f7`, puis `dc6a2af`/`7bf58f6`/`b1c70a5`) :
**125 renommages** + **74 tokens créés**, **4 cycles de preuve 0-pixel** (Étalonnage/L1/L1b/L2),
tous à **43/43 identical**. Aucune liaison de variable posée sur le canvas final.

---

## 2 · La procédure du relevé, reproductible (FR-028 / SC-011)

La procédure vit dans son contrat : [`contracts/note-census.md`](./contracts/note-census.md) — elle
n'est pas recopiée ici pour ne pas en créer deux versions divergentes. Les deux trous qu'un tiers
rencontrerait y sont comblés : **Trou A** (`TARGET_SETS=[]` à éditer localement, jamais committé,
restauré par `git checkout` — pas 6), **Trou B** (le compteur `tools/note-census.mjs` est un
livrable de cette spec, car rien dans le dépôt ne compte les notes).

**Reproductibilité vérifiée (T061)** : le compteur re-passé sur le dump banké identique produit un
rapport **byte-identique** hors le seul champ « chemin absolu du dump »
(`releves/reproductibilite-cloture-2026-07-27.json`). Le compteur est une fonction pure du dump
(constitution §I) ; le dump (~173 Ko) n'est jamais committé, seul le relevé JSON l'est.

---

## 3 · La décision STOP L3 — pourquoi le lot valeurs est clos sans exécution

**Constat mesuré, pas supposé** (`decisions.md` § STOP L3 / STOP L3b / STOP L3c-L3d) : lier une
variable numérique en Figma **déplace des pixels de façon non déterministe**, même lorsque la
variable porte exactement la valeur déjà rendue littéralement. Trois exécutions successives l'ont
confirmé :

- **STOP L3** : 30/43 cibles modifiées après liaison → revert.
- **STOP L3b** : payload re-validé, valeurs live confirmées → 32/43 identical, **11 diff** — le
  revert des 2 masters suspects laisse les diffs **inchangés** : la cause n'est pas ces masters
  mais l'interaction variable-bound vs littéral dans le moteur de layout Figma (pixel-rounding).
- **STOP L3c/L3d** : test isolé — tout canal numérique lié produit un diff ; le canal `opacity`
  divise en plus la valeur par 100 (FR-014, T043, limite **CONFIRMÉE**).

**Décision owner** : ne poser **aucune** liaison, reverter le canvas à son meilleur état, clôturer
à **40/43 identical**. La reprise du revert (baseline fraîche `l3-resume-before`) n'a touché ni les
cibles Google Reviews ni les pages de la session concurrente 006.

Conséquence directe sur les compteurs : la classe E (« valeur sans token ») **n'atteint pas 0** sur
les canaux mesurés — c'est le fait rapporté, pas un objectif tenu. Le volet NOMS de SC-002 est,
lui, **tenu à 0** (§5).

---

## 4 · Les 3 résidus du canvas final (40/43)

Trois masters du DS restent non byte-identiques après la reprise du revert. Aucun n'est une page
de maquette ; tous sont des limites Figma déjà consignées (`decisions.md` § « Clôture reprise L3 »).

| Cible | Résidu | Cause (nommée, jamais absorbée) |
|---|---:|---|
| `DS-Molecules__Carte` | 3 488 px | Propriété `TEXT` partagée entre variantes — la séparer aplatirait des styles mixtes (dégrade). Limite structurelle, pas un défaut à réparer en L3. |
| `DS-Organisms__TexteSEO` | 3 351 px | Métadonnée mixed-style non sérialisée par le dump ; 4 emphases restaurées par plages, base Regular confirmée. Le résidu est le bruit de re-rendu du texte riche restauré. |
| `DS-Organisms__Coordonnees` | 88 px | Bruit de rastérisation sous-pixel, sous le plancher connu (003/005). |

---

## 5 · Les compteurs à la clôture (relevés committés, jamais la prose)

Source unique : [`releves/notes-cloture-2026-07-27.json`](./releves/notes-cloture-2026-07-27.json)
(généré par `note-census.mjs`, laissé verbatim) + la lecture de périmètre
[`releves/notes-cloture-perimetre-2026-07-27.json`](./releves/notes-cloture-perimetre-2026-07-27.json).

**Périmètre 007 = 55 masters** (le compteur en trouve 57 : les 2 sets `Review-card` / `Avis Google`
appartiennent à la session concurrente 006 et sont soustraits par nom, jamais fondus).

| Classe | Ouverture (T008, 55 masters) | Clôture (55 masters) | Verdict |
|---|---:|---:|---|
| **A** identifiants non-slug | 36 | **0** | ✅ soldée (US1) |
| **B** parts non-slug | 10 | **0** | ✅ soldée (US1) |
| **C** collisions de nom | 10 | **0** | ✅ soldée (US1) |
| **D** descriptions vides | 22 | **0** | ✅ soldée (US1, 55/55 descriptions remplies) |
| **G** collisions de slug | 0 | **0** | ✅ 0 sur 36 renommages |
| **E** valeur sans token | 193 | **184** | ⏸ STOP L3 — non réduite (aucune liaison posée) |
| **F** rôle typo non résolu | 41→20¹ | **20** | trou d'émetteur nº1, légué |

¹ Le recadrage O2 citait 41 (traitement hors dépôt) ; le compteur du dépôt — seule autorité
(`note-census.md §8`) — en trouve **20** sur les 55 masters. Le chiffre d'arrivée est **20**.

**Volet NOMS de SC-002 : TENU à 0** (A/B/C/D/G tous à 0). **Volet VALEURS de SC-002 : abandonné par
décision owner** (E=184, cause §3). L'écart E 193→184 vient de la restructuration L1 (12 éléments
non-bindables post-L1, `proofs/L3/gestes.md`) et de recomptages par canal — **aucune liaison n'a
réduit E**, car aucune n'a été posée.

**Relevé hors-compteur (live)** : 0 calque nommé par le contenu, **55/55 descriptions remplies**
([`releves/hors-compteur-cloture-2026-07-27.json`](./releves/hors-compteur-cloture-2026-07-27.json)).

---

## 6 · Les 4 pages acquittées de la spec 005 — suivi SC-008a

Ligne de base T007 (recopiée depuis `005/proofs/fix-post-cloture/verdict.json`, non re-mesurable) :
**Contactez-nous 469 px · Portes d'entrée 17 px · Portes de garage 20 px · À Propos 99 px**
(`identical:5, diff:4`). Synthèse des verdicts L1/L1b/L2 restreinte à ces 4 pages
([`releves/residus-cloture-2026-07-27.json`](./releves/residus-cloture-2026-07-27.json)) : **aucun
cycle 007 n'a bougé ces pixels** — elles n'étaient pas dans le périmètre des gestes (renommages de
masters DS + création de variables). Le diff hérité reste tel quel, reporté à la dette léguée (§7,
item 2), jamais absorbé.

---

## 7 · Dette léguée — tout ce que 007 lègue, en un seul endroit (FR-026/FR-027)

Reprise item par item de `spec.md` § « Prochaines étapes » (source autoritaire). La spec suivante
(« SPEC 2 — Repo : design-to-code », numéro attribué à l'ouverture) ne peut plus en découvrir aucun
par accident. Rien ne se lègue en dehors de cette liste.

**Vont à la spec suivante :**

1. **Divergences contrat ↔ canvas** ouvertes par les renommages des 5 masters adoptés (Bouton,
   Checkbox, Input, Select, Textarea) — source corrigée ici, contrat suit là-bas, **bump majeur
   assumé** (FR-008). Le dépôt n'est pas modifié ici pour suivre.
2. **Les 4 divergences héritées de la clôture 005** : Bouton, `octicon:chevron-down-12`, Checkbox
   sans usage, Étoile/mail/external-link sans usage (FR-027). Cf. §6 pour les 4 pages acquittées.
3. **Les 5 trous d'émetteur** (FR-027a) : (a) la regex de `deriveTextStyles()` qui ne matche jamais
   la convention Piqueray `typography.<rôle>.size` (= classe F, §5) ; (b) l'interligne absent du
   style généré ; (c) les tailles écrites en littéral au lieu d'une liaison de variable ; (d) une
   collection unique par axe de modes ; (e) `loadFontAsync('Inter')` en dur dans
   `core/emit-figma-script.ts` l. 664 alors que le fichier est en Montserrat.
4. **Re-pointage des 5 contrats adoptés vers les rôles sémantiques `typography.*`** (FR-027b) — ils
   lient aujourd'hui des primitives directement ; les 8 rôles n'ont aucun consommateur.
5. **Promotion des 74 variables créées ici vers `tokens/`** (FR-009a) — préparée pour être une
   **copie**, pas une traduction (convention `primitives` + rôles `typography.*` déjà respectée).
6. **Exposition des props sur les masters** — bump **mineur**, choix de rythme (hors périmètre ici).
7. **Le rich-text** (item B1) — gras au milieu d'une phrase, 6 textes ; ajout schéma + émetteur +
   extracteur. C'est aussi la cause du résidu `TexteSEO` (§4).
8. **Nav-item** — soulignement actif + lien de couleur, reportés à l'extraction du futur contrat
   Header.
9. **Les zéro-usage à trancher** (Checkbox, Étoile, mail, external-link) — gouvernance : nommés
   ici, tranchés là-bas.
10. **La limite `opacity`** (FR-014) — **CONFIRMÉE** en L3c/L3d (le canal divise la valeur par 100
    à la liaison). Valeur littérale conservée ; la limite est nommée ici pour que la spec suivante
    la trouve documentée.

**Ne vont PAS à la spec suivante :**

- **Le backlog d'harmonisation chiffré** (FR-013a) — destinataire : une **itération d'harmonisation
   dédiée**, où les pixels bougeront en connaissance de cause. **Non produit ici** : il supposait la
   tokenisation des valeurs (L3/L4), close sans exécution par STOP L3. Le relevé de clôture (§5)
   fournit l'inventaire brut (E=184 par canal dans `notes-cloture-perimetre-2026-07-27.json`) qui
   servira de point de départ à cette itération.
- **La remise à jour du `RAPPORT-CLOTURE.md` de 005** (périmé d'un cycle) — chantier de
   documentation distinct, déjà nommé en Assumptions.

---

## 8 · Exceptions et limites acceptées (SC-010)

- **STOP L3** — aucune liaison de valeur numérique posée : limite Figma non déterministe, décision
  owner (§3). Volet VALEURS de SC-002 explicitement abandonné.
- **40/43 identical** — 3 résidus masters nommés (§4), tous limites Figma déjà consignées.
- **4 pages 005** — diff hérité `identical:5, diff:4` inchangé (§6), reporté (dette item 2).
- **Classe F = 20** — trou d'émetteur nº1, légué (dette item 3a).
- **`opacity`** — limite confirmée, valeur littérale conservée (dette item 10).

Toutes les exceptions et dettes sont nommées ci-dessus ; aucune n'est silencieuse (SC-010).
