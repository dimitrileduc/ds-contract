# SC-006 — la planche de la section 029, générée (T024)

**SC-006** : « La planche générée pour la section 029 rejouée contient les 7 zones et les
mentions négatives ; un fait structurel sans témoin est refusé par nom. »

Date : 2026-08-27. Aucune mutation de canevas : la planche est **calculée** ici, elle
sera **posée** en 031.

## 1. La porte, sur le fichier RÉEL de 029

`specs/029-figma-responsive-categories/decisions/H2-design.json`, tel qu'il est commité,
passé à `validateDesignDecision` :

```
strict.ok = false
  ✖ $.pickerConsequence   — picker-consequence-missing
  ✖ $.acceptedFacts[0..7] — accepted-fact-short-form   (les 8 faits)
lecture historique (allowLegacyShortFacts).ok = false
  ✖ $.pickerConsequence   — picker-consequence-missing
```

**C'est le reçu d'E2.** Même en lisant la forme courte de 029 avec indulgence — ce que
la porte fait exprès, l'histoire se lit et ne se réécrit pas — il manque toujours la
seule chose qui aurait évité la journée perdue : **une phrase française disant ce que le
sélecteur montrera**. Le fait fatal était `acceptedFacts[1]` :

> « The card extent is internal adaptation only; no new responsive card state or variant
> is added. »

Un fait **structurel**, en anglais abstrait, sans témoin, validé par un « go » qui
portait sur autre chose. Aucun rendu ne peut le montrer : un wrap interne et un axe
Presentation ont les mêmes pixels.

## 2. La même décision, rejouée dans le schéma 030

`proofs/board/decisions/H2-design-030.json` — **mêmes faits, mêmes mots owner**, portés
dans `contracts/decision-design.md`. Rien de neuf n'est décidé : 030 ne sollicite pas
l'owner.

```
strict.ok = true
```

Ce qui a changé tient en deux champs : `pickerConsequence` (« Le sélecteur de variantes
de CategoriesPrincipales restera Style × Colonnes : vous n'aurez pas de variantes
Wide/Desktop/Mobile comme HeroVideo. ») et la `nature` + le `witnessRef` de chaque fait
accepté — le fait structurel pointant sur la capture du **sélecteur**, pas sur un rendu.

## 3. La planche générée — 7 zones

```bash
npm run component:repair:board -- \
  --decisions specs/030-outillage-vague-responsive/proofs/board/decisions \
  --witnesses specs/030-outillage-vague-responsive/proofs/board/witnesses.json \
  --usages    specs/029-figma-responsive-categories/inventory/H1-usages.json \
  --out       specs/030-outillage-vague-responsive/proofs/board/out
```

```
component:repair board generated — 030 · CategoriesPrincipales · VALIDATION (rejeu), 7 zones, 1 decision(s)
component:repair board checks — structuralFactsAllWitnessed=true, negativeStatementsInFrench=true,
                                noScaledThumbnails=true, archiveRef=…/H2-option-manifest.json
component:repair board — the script is NOT executed here; the live pass belongs to the wave spec (§X applies there).
```

Le contenu, zone par zone (`out/zones.json`) :

| # | Zone | Contenu généré |
|---|---|---|
| 1 | **Usage réel** | 7 usages ; `Colonnes=2, Style=Empile` 4/7 · `Colonnes=2, Style=Superpose` 2/7 · `Colonnes=3, Style=Empile` **1 usage sur 7 (exception)** — la distribution est lue dans l'inventaire H1 de 029, la configuration dominante d'abord, l'exception **marquée** et non centrée (§XII). |
| 2 | **Ce que vous verrez** | 3 lignes concrètes en français. |
| 3 | **Ce que vous n'aurez pas** | 4 négations explicites, dont *« Vous n'aurez pas de variantes Wide/Desktop/Mobile comme HeroVideo : le sélecteur reste Style × Colonnes. »* — **la ligne qui n'a jamais existé en 029**. |
| 4 | **Sélecteur avant → après** | 2 captures, 320×240 et 320×300. |
| 5 | **Témoins 1:1** | Mobile 390 px et Tablette 834 px, aux dimensions réelles, étiquetés « 1:1 ». Seulement là où la sortie diffère. |
| 6 | **Décisions** | La `pickerConsequence` en une ligne, puis chaque fait accepté préfixé **STRUCTUREL** / **VISUEL** avec son témoin nommé. |
| 7 | **Pied** | « Identiques entre options : 1200 px, 1440 px, 1728 px. » + « Archive technique masquée : 9:900, 28 frames ». |

Deux points §XII que la planche tient **par construction** :
- les largeurs identiques entre options sont **nommées comme identiques**, jamais dupliquées ;
- l'archive technique est **référencée, pas étalée** — zéro image dans le pied. C'est la
  correction a-bis de la rétro : ne pas sur-corriger en remettant les 28 frames sous les
  yeux de l'owner ; le défaut était l'absence de témoin structurel, pas l'existence de l'archive.

## 4. Le script exécuté sur le mock

`out/board.bridge.js`, joué contre un `figma` de test (030 ne touche aucun canevas vif) :

```
board: 030 · CategoriesPrincipales · VALIDATION (rejeu)
zones : usage(4l/0i) youWillSee(3l/0i) youWillNotGet(4l/0i) pickerBeforeAfter(1l/2i)
        witnesses(2l/2i) decisions(4l/0i) footer(2l/0i)
nœuds : 8 FRAME, 27 TEXT, 4 RECTANGLE
témoins posés à leur taille réelle : 320x240  320x300  390x1800  834x1200
```

Les quatre témoins sont posés **à leur dimension déclarée**, pas à une taille de
vignette. `noScaledThumbnails` n'est pas une intention : le générateur **refuse** avant
d'écrire quoi que ce soit si `scale ≠ 1` ou si `imageWidth ≠ width`.

## 5. Les refus, exercés

Pinés par `figma-projection-repair-board-structural-witness` :

| Refus | Déclencheur |
|---|---|
| `structural-fact-unwitnessed` | un fait `structurel` sans `witnessRef`, **ou** dont le témoin est un rendu au lieu d'une capture du sélecteur |
| `witness-missing-for-width` | un fait `visuel` dont le témoin n'est pas posé à taille réelle par la planche |
| `negative-statements-missing` | zone 3 vide, **ou** rédigée hors de la grammaire négative française fermée |
| `scaled-witness-refused` | une vignette redimensionnée offerte comme preuve de breakpoint (§XII, mot pour mot) |
| `picker-consequence-missing` / `picker-consequence-not-in-french` | la parade E2 elle-même, sur la décision |
| `accepted-fact-short-form` | la forme courte 029 écrite par une décision **nouvelle** (lue pour l'histoire, jamais écrite) |

## 6. Limite nommée : « en français » est vérifié par une grammaire fermée

`negativeStatementsInFrench` **n'identifie pas une langue**. Il vérifie que chaque
mention négative ouvre sur un marqueur d'une liste française fermée (« Vous n'aurez
pas », « Aucun/Aucune », « Pas de », « Le sélecteur ne »…) et porte des marqueurs
grammaticaux français. C'est assez pour attraper la panne qui s'est produite — une
conséquence scellée en anglais abstrait — et c'est vérifiable par machine, ce que de la
prose libre n'est pas. L'élargir est un changement d'une ligne, avec sa fixture.

Le même mécanisme est ce qui fait tomber `picker-consequence-not-in-french` sur
« The variant picker will gain a Presentation axis. » — la phrase exacte qu'un agent
pressé écrirait, et exactement celle que 029 a écrite.

## 7. Ce que SC-006 ne prouve PAS

- La planche n'a **pas** été posée sur le canevas : `board.bridge.js` est exécuté sur un
  mock. La pose vive appartient à 031, où §X s'applique.
- Les quatre témoins référencés (`temoin-390.png`, `temoin-834.png`, `picker-avant.png`,
  `picker-apres.png`) sont **des références déclarées, pas des fichiers capturés ici** :
  030 ne lit pas le canevas. Ce que la planche garantit, c'est qu'une référence
  manquante ou une taille fausse **refuse la planche** au lieu de produire une zone
  silencieusement vide.
- La décision rejouée est un **rejeu documentaire**, pas une nouvelle décision owner.
