# Prérequis G0 — mesurés, pas supposés

**Date du relevé** : 2026-08-27 · **Fichier** : `Piqueray (Copy)` /
`d9FYAUcqdcNtsuaMgLefvJ` · **Worktree** : `just-euphonium`

Tous les faits ci-dessous sont **mesurés**. Là où la recherche avait posé une
hypothèse (R4, R5), la mesure tranche et le résultat est écrit tel quel, y
compris quand il contredit la tâche qui l'a commandée.

---

## 1. Fiche de décisions D1–D9 — signée (T004)

`specs/030-outillage-vague-responsive/inventory/fiche-decisions-vague.md`, l. 3 :

> **Tranchées par l'owner le 2026-08-27**, en conversation, avant la vague.

Les neuf décisions sont présentes et renseignées (tableau l. 13–23) : D1 axe
`Presentation` sur les 12 sections · D2 `Mobile` · D3 44 → 32 px en override
étiqueté · D4 taille réduite sans coupure de mots · D5 largeur de colonne
conservée · D6 `Colonnes` visible sans effet, phrase écrite sur la planche ·
D7 jamais de fallback silencieux · D8 largeur minimum interdite, dérogation
motivée possible · D9 `320 / 390 / 834 / 1200 / 1440 / 1728` × contenu court et
long.

**Verdict : signée ⇒ pas de STOP.**

---

## 2. Sweep de qualité (T006)

Voir `../proofs/sweep-G0.md`. 7 commandes sur 8 en `EXIT 0` ; `npm run eval`
imprime **242/243**, l'unique rouge étant `golden-generated-output` — la dette
golden 028, prouvée **mot pour mot identique** à la trace de 030.

**Verdict : vert au sens des Quality Gates.**

---

## 3. Version Figma épinglée `031-avant-vague` (T007, §X)

Posée par `saveVersionHistoryAsync` sur le fichier vif, **avant toute mutation** :

| Nom de version | Id retourné | Description posée |
|---|---|---|
| `031-avant-vague` | `2392267626424800780` | « Etat-avant de la vague responsive 031 — 13 cibles, avant toute mutation (constitution §X). » |

C'est l'état-avant **complet** du fichier — plus fort que des PNG échantillonnés.
Le pendant `031-apres-vague` est posé à T072.

---

## 4. Parents des 13 masters et partition §XI (T008, R5)

Relevé read-only : `getNodeByIdAsync` sur les 13 ids de R1, lecture de
`node.parent` et de la chaîne d'ancêtres jusqu'à la `PAGE`. Table complète :
`partition-zones.json`.

| Campagne | Master | Type | Parent relevé | Type parent | Page |
|---|---|---|---|---|---|
| reassurances | `2114:3721` | COMPONENT_SET | `2114:3722` Réassurances | SECTION | DS · Organisms |
| presentation | `2103:2824` | COMPONENT | `2463:4779` Container · Presentation | FRAME | DS · Organisms |
| devis | `2096:2524` | COMPONENT | `2463:4778` Container · Devis | FRAME | DS · Organisms |
| formulaire | `2096:2564` | COMPONENT | `2096:2565` Formulaire | SECTION | DS · Organisms |
| coordonnees | `2104:2904` | COMPONENT | `2104:2905` Coordonnées | SECTION | DS · Organisms |
| faq | `2104:2914` | COMPONENT | `2455:4733` Container · FAQ | FRAME | DS · Organisms |
| sav | `2108:3105` | COMPONENT | `2455:4735` Container · SAV | FRAME | DS · Organisms |
| texte-seo | `2108:3123` | COMPONENT | `2455:4734` Container · TexteSEO | FRAME | DS · Organisms |
| hero | `2111:3382` | COMPONENT | `2416:6979` Container · Demo 1728 | FRAME | DS · Organisms |
| equipe | `2115:3947` | COMPONENT | `2453:4732` Container · Equipe | FRAME | DS · Organisms |
| produits-ecommerce | `2116:4475` | COMPONENT | `2116:4465` Produits e-commerce | SECTION | DS · Organisms |
| google-reviews-section | `2545:5685` | COMPONENT | `2545:5684` Container · Section Avis Google | FRAME | **DS · Molécules** |
| hero-video | `2580:7392` | COMPONENT_SET | `2448:4731` Container · HeroVideo | FRAME | DS · Organisms |

**Verdict R5 : `parents-distincts`.** Les 13 parents portent 13 identifiants
deux à deux distincts. **Le pire cas annoncé par R5 — parent unique, créations de
set sérialisées — NE S'APPLIQUE PAS.** La partition par master est donc légale, et
aucune sérialisation de `bridge-first`/`bridge-second` n'est requise. R5 avait
écrit « compatibles, pas concluants » à propos des ids `2096:…` → `2116:…` ; la
mesure conclut : ils ne partagent pas de parent, chacun vit dans son propre
`Container · …` ou dans sa propre SECTION.

Conséquence sur T014 : `presentation` (zone Z02, parent `2463:4779`, writer W2)
n'est **pas** dans la même zone que `reassurances` (Z01, parent `2114:3722`,
writer W1). Le critère de substitution de T014 n'est pas déclenché —
**`presentation` reste la première section additive pilote.**

Deux observations de source relevées au passage, portées au registre et **non
corrigées par cette vague** :
- `google-reviews-section` est le seul master de **section** qui vit sur la page
  `DS · Molécules` et non `DS · Organisms` (registre `E-031-004`) ;
- le parent de `hero` s'appelle `Container · Demo 1728`, un nommage de démo là où
  les onze autres portent `Container · <Composant>` ou le nom de leur section
  (registre `E-031-006`).

---

## 5. Cliché de parité — comparé, pas rafraîchi par réflexe (T009, R4)

**Méthode** : le digest par composant (`nom · nodeId · key · nombre de variantes ·
définitions de propriétés triées`) a été calculé des deux côtés — sur le canevas
vif via le pont, et sur `parity/snapshots/figma-components.json` — puis les deux
jeux ont été diffés **par `nodeId`**, dans le plugin, sur les données complètes.

| Mesure | Valeur |
|---|---|
| `extractedAt` du cliché commité | `1787771836005` = **2026-08-26T19:17:16.005Z** (attendu par R4 : `2026-08-26T19:17:16Z` ✅) |
| commit du cliché | `7d03a860` (clôture 029) |
| composants dans le cliché commité | **64** |
| composants relevés sur le canevas vif | **64** |
| présents seulement en vif | **0** |
| présents seulement au cliché | **0** |
| présents des deux côtés mais différents | **0** |

**Verdict : FRAIS.** `identical: true`. Aucun rafraîchissement n'est dû avant la
première mutation ⇒ **T010 n'est pas déclenché** (sa condition « si et seulement
si T009 conclut à rafraîchir » n'est pas remplie), et
`parity/snapshots/figma-components.json` n'est pas touché à G0.

R4 est confirmé par la mesure : la limite héritée de 017 (« le cliché n'a pas été
rafraîchi, `npm run parity` compare à un canevas périmé ») **est refermée**, et
elle l'était déjà avant 031. Le refresh de fin de vague (après les 28 créations,
T064) reste obligatoire.

Le relevé confirme aussi, en passant, les deux faits de R1 utilisés par la vague :
`Reassurances` (`2114:3721`) porte `Disposition{4 cartes | QuatreCartesDeuxCta |
5 cartes}` et **3** variantes ; `HeroVideo` (`2580:7392`) porte
`Presentation{Wide | Compact | Desktop}` et **3** variantes ; les onze autres
cibles n'ont **aucun** axe de variante.

---

## 6. Ports du pont figma-console (T005) et writers sains (T012)

Sonde `figma_get_status` avec `probe: true`, 2026-08-27 :

| Fait mesuré | Valeur |
|---|---|
| transport actif | `websocket` |
| port du serveur de cette session | **9230** |
| port préféré | 9223 |
| `portFallbackUsed` | **`true`** |
| dans la plage 9223-9232 ? | **oui** |
| `probeResult` | `success: true`, `latencyMs: 9` |
| fichier connecté | `Piqueray (Copy)` / `d9FYAUcqdcNtsuaMgLefvJ` |
| version du plugin | 1.39.0 |
| autres serveurs figma-console vus dans la plage | 8 (ports 9223, 9224, 9225, 9226, 9227, 9228, 9229, 9231) |
| ports libres dans la plage | 1 (9232) |

**Écart assumé sur le critère littéral de T005.** T005 attend
`portFallbackUsed:false` ; la mesure dit `true`. Le repli est **bénin et non
bloquant** : la règle du dépôt (`CLAUDE.md`, §Pont Figma) dit qu'un serveur
retombé **au-delà de 9232** est hors plage donc sans pont ; 9230 est **dans** la
plage, le plugin y est connecté et la sonde répond en 9 ms sur le bon fichier.
Le prérequis opératoire — un canal d'écriture sain vers `Piqueray (Copy)` — est
donc tenu. Consigné au registre : `E-031-005`.

**Writers sains mesurés : 1** (celui de cette session, port 9230). Les 8 autres
serveurs de la plage sont des processus observés, **pas** des writers : rien ici
ne mesure qu'ils portent une session d'agent capable d'écrire, et aucune autre
session d'agent n'est engagée sur cette vague à ce jour.

**Conséquence T012 — repli séquentiel ANNONCÉ, pas subi.** Moins de 3 writers
sains ⇒ le lot de 10 campagnes de la phase 5 (T052–T061) s'exécute
**séquentiellement**, sur un seul canal, au **coût annoncé de +1 h 45** sur les
5 h mur du plan (soit ≈ 6 h 45). Ce coût est annoncé ici, à G0, avant que la
première campagne démarre — jamais découvert en cours de lot. Consigné au
registre : `E-031-007`.

Deux précisions qui bornent la portée de ce repli :
- il ne concerne **que** les étapes d'**écriture** (phase 5). La phase 3
  (préparation : `audit`, `preflight`, `capture-before`, `dry-run`) est
  **read-only** et n'est pas contrainte par le nombre de writers ;
- si trois canaux sains sont disponibles au moment d'ouvrir le lot, la partition
  de `partition-zones.json` est déjà calculée et prête (W1/W2/W3), sans
  sérialisation nécessaire puisque les 13 parents sont distincts. Le repli est
  réversible à la hausse ; il est annoncé au pire cas mesuré aujourd'hui.

---

## 7. Défaut de source nommé avant d'y toucher (R11, §VIII)

Relevé sur le canevas vif : le set **`TEST/Reassurances Responsive — Controlled`**
(`2563:5844`, `Viewport{Desktop | Tablet | Mobile}`, 3 variantes) existe bien dans
le fichier gouverné. Il vit sur une page dédiée `TEST — Responsive Reassurances`
(`2563:5416`), aux côtés de deux sections d'essai `A — Auto Layout Wrap`
(`2563:5420`) et `B — Variants Viewport` (`2563:5667`) et d'un `README — sandbox`
(`2563:5417`).

Il est **relevé et nommé**, porté au registre (`E-031-001`) et soumis à décision
owner en séance. Il n'est **ni supprimé ni contourné** par un agent : la campagne
`reassurances` le déclare en **lecture seule** tant que la décision n'est pas
prise. Aucun agent ne supprime de nœud.

---

## 8. Récapitulatif des prérequis

| Prérequis | Mesuré | Verdict |
|---|---|---|
| Worktree autosuffisant (F1) | `npm install` OK, Chromium présent (`chromium-1234`) | ✅ |
| Fiche D1–D9 signée | oui, 2026-08-27 | ✅ |
| Sweep complet | 7/8 EXIT 0 ; rouge unique = dette golden 028 identique | ✅ |
| Version `031-avant-vague` épinglée | id `2392267626424800780` | ✅ |
| Parents relevés + partition §XI | 13 parents distincts | ✅ |
| Cliché de parité | identique 64/64 — frais | ✅ |
| Pont | 1 writer sain, port 9230 en plage, probe 9 ms | ⚠️ repli séquentiel annoncé |
| Défaut de source R11 | relevé, nommé, en lecture seule | ✅ |
