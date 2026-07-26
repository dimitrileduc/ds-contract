> Blocs prêts à recopier dans `RAPPORT-CLOTURE.md`. Lot 0-pixel — triptyque remplacé
> par le verdict 9/9 `identical` final ([proofs/L2-retest4/verdict.md](../L2-retest4/verdict.md)).
> Base des liens : `https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=<id>`

### Phase 4 (L2) · T027 — style Titre Hero (54px)

- **Cible** : `Titre Hero` (nouveau style) appliqué à [Hero titre 2111:3378](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2111-3378)
- **Version enregistrée avant la passe** : `005/variables/lot-l2` — `2380158790790581337`
- **Diff annoncé** : 0 pixel (9/9 identical)
- **Diff observé** : 9/9 `identical` (après correctif — 1ʳᵉ tentative avait cassé le mélange Bold+Light du titre, corrigé avant toute capture)
- **Preuve** : [verdict final](../L2-retest4/verdict.md)
- **Pourquoi** : seule valeur typographique (54px) sans style existant — FR-011. Le titre porte un mélange délibéré Bold ("Portes de garage") + Light (" industrielles") : la simple application du style l'aurait aplati en Bold uniforme ; restauré par `setRangeFontName` avant toute capture.

### Phase 4 (L2) · T028 — 21 liaisons de style texte

- **Cible** : 21 occurrences (7 tailles : 16/14/20/18/24/40/32px) — détail des nœuds dans `decisions.md` §L2
- **Version enregistrée avant la passe** : `005/variables/lot-l2` — `2380158790790581337`
- **Diff annoncé** : 0 pixel
- **Diff observé** : 9/9 `identical` (après 2 correctifs distincts — casse et graisse par instance, voir Dégradations & limites)
- **Preuve** : [verdict final](../L2-retest4/verdict.md)
- **Pourquoi** : gouverne toute valeur typographique ≥3× ayant un style existant correspondant (SC-011). Fait ressortir une limite non documentée de `setTextStyleIdAsync` : casse et graisse d'instance ne sont pas garanties de survivre à une liaison — corrigé nœud par nœud, jamais silencieusement.

### Phase 4 (L2) · T029/T031 — liaisons `color/blanc`

- **Cible** : [Footer-column 2079:2248](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2079-2248), [Copyright 2086:2331](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2086-2331) ; Devis `2096:2526` déjà lié (vérifié, 0 écriture)
- **Version enregistrée avant la passe** : `005/variables/lot-l2` — `2380158790790581337`
- **Diff annoncé** : 0 pixel · **Diff observé** : 9/9 `identical` — conforme
- **Preuve** : [verdict final](../L2-retest4/verdict.md)
- **Pourquoi** : FR-013, match exact à une variable existante, liaison sans condition de seuil.

### Phase 4 (L2) · T030 — liaison `color/noir-bleute` (Accordion-row Petit)

- **Cible** : [Accordion-row 2059:1417](https://www.figma.com/design/d9FYAUcqdcNtsuaMgLefvJ/Piqueray?node-id=2059-1417) (bordure Petit, 2 nœuds master + 26 instances)
- **Version enregistrée avant la passe** : `005/variables/lot-l2` — `2380158790790581337`
- **Diff annoncé** : 0 pixel · **Diff observé** : 9/9 `identical` — conforme (après correctif opacité, voir Dégradations & limites)
- **Preuve** : [verdict final](../L2-retest4/verdict.md)
- **Pourquoi** : FR-013. Cascade à FAQ + Texte SEO par héritage (D3) — mais l'opacité (0x52/255, distincte du canal couleur) ne suit pas la liaison sur les instances portant leur propre override ; corrigée sur 26 instances au total.

### Phase 4 (L2) · T032 — règle 3× couleurs hors palette

- **Cible** : `#000000` (Accordion-row Grand), `#26282C52`, `#E0E0E0` (Réalisation), `#0000004D` (Devis)
- **Diff observé** : sans objet — aucune écriture (les 4 valeurs restent sous le seuil 3× dans les masters, `releves/regle-3x-2026-07-25.json`)
- **Pourquoi** : aucune ne dépasse 3 occurrences dans les masters (R8) → laissées littérales et déclarées (FR-012/SC-011), listées dans `RAPPORT-CLOTURE.md` § Valeurs laissées littérales (T110).
