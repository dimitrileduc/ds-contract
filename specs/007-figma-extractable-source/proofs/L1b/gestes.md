# Gestes du lot L1b — Correctifs résiduels post-relevé T025 (2026-07-26)

Le re-relevé de notes post-L1 (T025) a trouvé **2 collisions de part résiduelles**
(classe D) que le script L1 n'avait pas couvertes — pas une régression du lot L1
(43/43 identical, 0 pixel), mais un **angle mort du script de geste** découvert par la
mesure, exactement le rôle que joue le re-relevé.

## Diagnostic

**1. `Reassurances:root/Bouton`** — le master a **3 variantes de disposition**
(`4 cartes` 2114:3619, `4 cartes · 2 CTA` 2114:3653, `5 cartes` 2114:3693), chacune
avec son propre CTA. Le lot L1 n'a résolu que la collision **interne** à la variante
2-CTA (`Bouton`/`BoutonSecondaire`, 2114:3651/2114:3652) — mais les 2 autres variantes
(2114:3618, 2114:3692) portent CHACUNE un calque `Bouton` distinct qui collisionne
avec les deux premiers. Angle mort : la lecture initiale (T018/decisions.md) n'avait
inspecté que la variante 2-CTA, pas les 3.

```
2114:3618  (Bouton, variante "4 cartes")      → BoutonQuatreCartes
2114:3692  (Bouton, variante "5 cartes")      → BoutonCinqCartes
```

Les deux calques déjà résolus en L1 (2114:3651 `Bouton`, 2114:3652 `BoutonSecondaire`,
tous deux dans la variante 2-CTA) restent inchangés — 4 noms désormais tous distincts
sur les 4 CTA du contrat.

**2. `CategoriesPrincipales`, item 1 et item 2 (variante Standard, 2115:4273)** — le
renommage FR-005 du lot L1 (`Titre`/`Texte` pour les 2 items) a créé une **nouvelle**
collision avec les calques `Titre`/`Texte` déjà présents à l'intérieur des instances
`Carte` utilisées par les 3 autres variantes du même contrat (`text/Titre`,
`text/Texte` à l'intérieur de chaque `Carte`). Angle mort : le script L1 avait résolu
les collisions **au sein de la variante Standard** (Item1BlocTexte, Item2* etc.) sans
revérifier contre les autres variantes du **même contrat** — alors que la classe D est
explicitement "contract-wide" (`core/propose-figma.ts` l.2519).

```
2115:4165  (Titre, item 1, "Portes de garage résidentielles")  → Item1Titre
2115:4166  (Texte, item 1, "Sectionnelles, basculantes…")      → Item1Texte
2115:4173  (Titre, item 2, "Portes de garage industrielles")   → Item2Titre
2115:4174  (Texte, item 2, "Solutions robustes…")              → Item2Texte
```

## Diff annoncé

**0 pixel.** 6 renommages de calque, aucune valeur de rendu touchée. Attendu :
**43/43 identical**.

## Séquence

```
0. version   007/identifiants/L1b → versionId 2380458742714856730
1. AVANT×43  receveur :9230 (nonce ec4d33ed29326905) — 43/43 captées
2. GESTE     6 renommages (ci-dessus)
3. APRÈS×43  à suivre
4. verdict   npm run pages:compare
```
