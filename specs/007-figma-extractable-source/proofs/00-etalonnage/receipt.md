# T006 — Étalonnage de l'instrument (STOP-GATE) : **PASSÉ, 43/43 identical**

**Date** : 2026-07-26 · double capture des **43 cibles** (9 maquettes + 5 DS·Atomes +
13 DS·Molécules + 16 DS·Organisms) **sans aucune opération entre les deux jeux** ·
verdict rendu par `npm run pages:compare` (exit **0**) —
[verdict.json](./verdict.json) · [verdict.md](./verdict.md).

À la différence de la 005 (9 cibles, plancher déjà connu nul), **34 de ces 43 cibles
n'avaient jamais été mesurées par cet instrument** — leur plancher de bruit était
inconnu (aucune `SECTION` jamais exportée). Ce cycle l'établit.

## Résultat

| Mesure | Constat |
|---|---|
| Verdict | **43/43 `identical`**, 0 diff, 0 capture-failed, 0 dimension-mismatch, exit 0 |
| Bruit propre de l'instrument — 9 maquettes | **0**, conforme au plancher déjà connu (003/005) |
| Bruit propre de l'instrument — 34 cibles DS | **0** — aucune cible bruitée à exclure nommément du verdict ; le plancher inconnu s'établit à zéro |
| Au-delà de l'exigence | les **sha256 des deux jeux sont identiques cible par cible** (43/43) — le rendu `exportAsync` @1x est **byte-reproductible**, pas seulement zéro-pixel |

## Incident de port traité en cours de route

Le port conventionnel du receveur (**9227**) était occupé par un receveur
**légitime d'une session concurrente** (`figma_get_status`/`lsof` :
`instrument:"page-parity"`, `outDir` sous
`.../worktrees/ds-contracts-poc/006/specs/006-google-reviews-block/measures`,
démarré 07:30 le même jour) — cohérent avec la règle multi-écrivains du bridge
(CLAUDE.md) et la branche `006-google-reviews-block` traitée ailleurs. **Ce
receveur n'a pas été touché.** Cette session a utilisé les ports **9228** (run1)
et **9229** (run2) à la place — zones disjointes, aucun octet n'a transité par
le mauvais receveur (identité + nonce vérifiés avant chaque écriture, comme
prescrit par `capture.js`).

## sha256 des deux jeux (identiques deux à deux, 43/43)

| Cible | Dimensions (PNG) | Octets | sha256 (préfixe, a = b) |
|---|---|---|---|
| Accueil | 1728×5430 | 5 168 367 | `daa0cb18bc90…` |
| Contactez-nous | 1728×3901 | 2 206 328 | `cd5a8bfdd5c3…` |
| Dépannage/SAV | 1728×4242 | 3 715 544 | `e6cd553311b4…` |
| Portes d'entrée | 1728×6534 | 6 692 521 | `78605a371d1e…` |
| Motorisation | 1728×3334 | 3 250 267 | `195f6fcdc1b6…` |
| Portes de garage industrielles | 1728×6762 | 6 160 209 | `548868d128a5…` |
| Portes de garage résidentielles | 1728×6575 | 6 983 476 | `b6e56dc5ea48…` |
| Portes de garage | 1728×4372 | 4 900 860 | `a21f4ed21820…` |
| À Propos | 1728×5928 | 6 612 041 | `3ac7df2cfb90…` |
| DS-Atomes__Formulaire | 980×580 | 7 932 | `891c59e6947f…` |
| DS-Atomes__Icônes | 980×500 | 10 716 | `dca473408ff8…` |
| DS-Atomes__piqueray_logo | 220×128 | 4 925 | `5fd0d4cf0a88…` |
| DS-Atomes__Bouton | 260×418 | 14 076 | `96a98feec557…` |
| DS-Atomes__member-picture | 404×787 | 388 520 | `974ac823e2bd…` |
| DS-Molécules__Field | 440×485 | 7 545 | `fb466358285c…` |
| DS-Molécules__Accordion-row | 1710×810 | 15 317 | `b736d2de38a9…` |
| DS-Molécules__Tab | 266×441 | 3 430 | `05e97749f9e2…` |
| DS-Molécules__Carte | 1353×802 | 812 021 | `faece173c04a…` |
| DS-Molécules__Product-card | 524×492 | 45 677 | `60f34458e8dd…` |
| DS-Molécules__Member-card | 524×628 | 193 129 | `2723d78f2e5a…` |
| DS-Molécules__Carousel-controls | 1764×232 | 2 455 | `049339420d0e…` |
| DS-Molécules__Footer-column | 470×280 | 6 485 | `b53cfdcb701f…` |
| DS-Molécules__Copyright | 778×204 | 6 224 | `15ed9e387d43…` |
| DS-Molécules__Avantage | 919×255 | 12 807 | `daa9f59faa40…` |
| DS-Molécules__Section-header | 1712×434 | 20 826 | `dbf72ad4b8ad…` |
| DS-Molécules__Réalisation | 1283×923 | 6 975 | `83eb54be3370…` |
| DS-Molécules__Nav-item | 380×230 | 918 | `edb7bb77fe59…` |
| DS-Organisms__Devis | 1888×558 | 864 307 | `582cd003f141…` |
| DS-Organisms__Formulaire | 1710×903 | 98 668 | `956e5d5517bd…` |
| DS-Organisms__Présentation | 1447×276 | 26 449 | `a6315a97a0ef…` |
| DS-Organisms__FAQ | 1888×628 | 43 210 | `567c776ce51c…` |
| DS-Organisms__Coordonnées | 1888×777 | 379 644 | `3a5af63b4485…` |
| DS-Organisms__SAV | 1712×857 | 794 727 | `a0378aa45285…` |
| DS-Organisms__Texte SEO | 1888×583 | 55 851 | `70ac9cefdcf0…` |
| DS-Organisms__Hero | 1888×840 | 1 301 984 | `4562417a7aee…` |
| DS-Organisms__Réassurances | 1712×2651 | 2 637 956 | `b0464bb039bc…` |
| DS-Organisms__Équipe | 1888×2086 | 2 585 658 | `2934da2665ba…` |
| DS-Organisms__Catégories principales | 1888×2664 | 3 686 706 | `067b28ad1ed0…` |
| DS-Organisms__Produits e-commerce | 1888×700 | 173 233 | `b3e563f9248c…` |
| DS-Organisms__Réalisations | 3780×1930 | 4 370 234 | `bb908424ce76…` |
| DS-Organisms__Footer | 1888×787 | 37 821 | `ac095d7b7f51…` |
| DS-Organisms__Header | 1928×392 | 24 803 | `824149cd04c3…` |
| DS-Organisms__Hero vidéo | 1888×880 | 1 322 462 | `97375f4d967f…` |

Nonces de session distincts entre les deux jeux (`446a8494b1346d13` puis
`08532aa0137f8d13`) — l'identité du receveur (`instrument` + `outDir` + nonce) a
été vérifiée avant chaque écriture, jamais supposée.

## Note de cadence (limite nommée, sans impact sur le verdict)

Chaque jeu de 43 captures a été exécuté en 2 appels `figma_execute` (39 cibles
puis les 4 dernières `DS-Organisms` restantes) plutôt qu'en 43 appels un-par-un :
le budget de 30 s par appel du pont a été atteint autour de la 39ᵉ cible sur les
deux jeux, de façon reproductible. La sémantique par cible reste strictement
celle de `bridge/capture.js` (health-check de l'identité du receveur, export,
POST, vérification de longueur d'octets) — seule la boucle qui les enchaîne a
changé de forme. Aucune cible n'a été sautée ; les deux jeux se sont arrêtés au
même point, ce qui confirme la reproductibilité du comportement plutôt qu'un
aléa.

## Conséquence

Le harnais de preuve est opérationnel pour les **43** cibles de cette itération,
plancher **zéro** confirmé y compris sur les 34 cibles jamais mesurées jusqu'ici.
Le programme peut passer à la production de la table de nommage (Phase 2, suite).
