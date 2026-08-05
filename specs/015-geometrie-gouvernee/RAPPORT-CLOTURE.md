# RAPPORT DE CLÔTURE — 015 · Géométrie gouvernée

**Branche** : `015-geometrie-gouvernee` · **Ouverte** : 2026-08-04 · **Close** : 2026-08-05
**Objet** : faire entrer toute la géométrie des 34 composants dans la boucle de gouvernance — plus aucune dimension ne vit comme un nombre en dur qu'aucun contrôle ne surveille — et réparer les défauts de géométrie que la campagne de mesure (014) avait prouvés.

Tous les chiffres ci-dessous sont **relus en direct** au moment de la clôture. Aucun n'est recopié d'une phase antérieure ; ceux qui ont été périmés par la suite sont signalés comme tels plutôt que corrigés en silence.

---

## 1 · Les compteurs à la clôture

### La porte géométrie (`npm run geometry:gate`) — SC-001

| | ouverture (T027, 2026-08-04) | clôture (2026-08-05) |
|---|---:|---:|
| contrats | 34 | 34 |
| entrées géométriques | 208 | 2 |
| références gouvernées | 5 | **219** |
| littéraux nommés | 0 | **2** |
| **valeurs invisibles** | **208** | **0** |

Verdict `pass`, 0 refus. Les 2 entrées restantes sont les 2 voiles dégradés du hero — **déclarées** dans `contracts/named-literals.registry.json`, donc lues en direct par la porte : nommées, pas invisibles.

**Ce que « 0 » ne dit pas** (SC-001 l'exige explicitement) : la population gouvernée est celle des **canaux de mise en page** (largeur, hauteur, min-*, espacement, marges internes). Le compte vif des littéraux restants dans les 34 contrats, relu à la clôture :

```
91 littéraux dans 22 contrats — dont géométriques : 0
line-height 39 · border-radius 15 · border-width 10 · color 9 · background-color 5
letter-spacing 4 · font-weight 3 · border-color 2 · background-image 2 · font-size 1 · border-bottom-width 1
```

Deux d'entre eux (`background-image`) sont **déclarés au registre**, donc nommés et lus par la porte. Les **89 autres** — trait, peinture, typographie — restent **hors périmètre nommé, donc invisibles au contrôle**. « 0 valeur invisible » ne se lit jamais « 260 → 0 ».

*(Le relevé de cadrage du 2026-08-04 annonçait 77 valeurs hors périmètre ; le compte vif à la clôture en trouve 89. L'écart n'est pas un dérapage de périmètre — aucun littéral géométrique ne subsiste — mais un relevé d'ouverture plus grossier que le comptage final : il ne dénombrait ni `font-weight` (3), ni `border-bottom-width` (1), et sous-comptait `line-height` (33 contre 39) et `background-color` (4 contre 5). Publié tel quel : le compte vif fait foi, y compris quand il contredit la prose de la spec.)*

### La porte de mesure (`measure:gate --apres <apres.json de 015>`) — SC-005

```
verdict PASS (exit 0) · contrats 34 · lignes mesurées 52 · divergentes 42
by cause : contract-geometry=0 · image-boundary=11 · rendering=23 · engine=3 · instrument=1 · figma-source=2
travaux reportés : 4
```

### Le reste

| | |
|---|---|
| Conversions littéral → référence | **196**, toutes pures (valeur résolue identique) |
| Références créées from-dump | **83** feuilles nouvelles : 6 `space.N` (2, 3, 11, 14, 22, 47) + 77 `size.<composant>.*` sur 23 espaces de nom (diff `tokens/primitives.tokens.json` contre `main`) |
| Registre avant/après | 49 lignes, **0 refus**, **4 mouvements, tous attribués** |
| Correctifs 013 préservés | **18/18** (`preserved` ou `converted-preserved`, 0 écrasé) |
| Sweep constitution | verte, `SWEEP_EXIT_0` — **eval `183/183`** (`proofs/sweep-cloture.txt`) |

Les 4 mouvements du registre, avec leur cause :

| Ligne | avant | après | delta | cause |
|---|---:|---:|---:|---|
| `hero/hero-master-defaults` | 27,829047 % | 10,661689 % | **−17,167** | `gradient-carry` |
| `section-header :: Avec CTA` | 8,778484 % | 6,080645 % | −2,698 | `named-repair` (T056) |
| `section-header :: Standard` | 1,910433 % | 0,904003 % | −1,006 | `named-repair` (T056) |
| `reassurances :: 4 cartes` | 14,922785 % | 14,922872 % | +0,000087 | bruit résiduel, DW-006 (attribué en 014) |

Les quatre sont des **améliorations attribuées**. Hors de ces quatre, **aucun chiffre publié n'a varié** (SC-006) : les 196 conversions n'ont produit aucun mouvement de pixel, ce que le registre prouve ligne à ligne plutôt que de l'affirmer.

---

## 2 · Les critères de succès, un par un

| | Critère | État |
|---|---|---|
| SC-001 | 0 valeur géométrique invisible | ✅ 208 → 0, relu en direct (avec la limite de périmètre ci-dessus, nommée) |
| SC-002 | La boucle détecte des deux côtés | ✅ 2 détections sur 2 (T023). **Une prémisse fausse trouvée en route** : `parity/extract-code.ts` extrayait les `cssVars` mais `parity/diff.ts` ne les comparait jamais — une modification `var(--token)` → valeur brute passait `parity` en exit 0. La comparaison manquante a été câblée dans l'axe existant plutôt que contournée |
| SC-003 | Les 9 composants mesurent les mêmes boîtes | ✅ règle border-box sur la surface livrée + les 3 valeurs content-box résiduelles corrigées (§3) |
| SC-004 | Les 4 lignes réparées ou attribuées | ✅ « Avec CTA » sous le seuil ; footer et coordonnees conformes ; texte-seo **reporté avec reçu** (DW-014-003) |
| SC-005 | `contract-geometry` = 0, porte PASS | ✅ 0, exit 0 — voir §4 pour ce que ce 0 recouvre |
| SC-006 | 0 chiffre orphelin, 0 correctif 013 écrasé | ✅ 4 mouvements tous attribués · 18/18 préservés |
| SC-007 | Retrouver origine, provenance et cause en < 5 min | ✅ `proofs/conversions.json` (diff typé, 196 entrées) + `$description` de chaque token minté |

---

## 3 · Ce que la revue de Phase 7 a corrigé

La revue de clôture a relu la spec entière et trouvé quatre choses. Elles sont consignées ici parce qu'elles disent quelque chose sur la méthode, pas seulement sur le résultat.

**a. `ds.faq` portait encore une largeur content-box** (reçu `faq-root-content-box-defect.md`). `size.faq.root` = 1550px alors que `1550 + 89 + 89 = 1728` = exactement l'`absoluteBoundingBox` du master : la signature d'un calcul content-box, devenu faux sous border-box (T013). La surface React rendait **178px trop étroit**. Corrigé à 1728px ; la ligne `faq` retombe **bit à bit** sur son chiffre d'avant (3,672346 %, delta 0), comme `sav` et `footer` avant elle.

C'est le **troisième** cas de la même classe dans cette spec — `sav` (§6 de son reçu), `footer` (T058), `faq` (revue). Les trois mouvements positifs du tableau §2 de `box-model-unification.md` (+20,15 · +10,97 · +1,15) avaient d'abord été lus comme la trace **attendue** du fix : ils étaient des **aggravations**. La leçon, écrite par le reçu `sav` et confirmée deux fois depuis : *la direction du mouvement seule ne suffit pas à conclure* — il faut comparer la valeur portée à la bbox Figma. Le relevé de clôture est cette fois **exhaustif** : les 11 parts du dépôt portant taille + padding sur un même axe, chacune comparée à sa bbox. Aucun autre cas ne subsiste.

**b. T013 n'avait aucune fixture.** La règle border-box — la capacité centrale de US2 — était couverte par deux reçus mais par **zéro eval** ; la seule assertion `box-sizing` de la suite portait sur la feuille *canvas*. `evals/fixtures/react-box-model-border-box.ts` comble le trou (cas `react-box-model-border-box`, C1). Rendement immédiat de la Claims Rule : **son premier passage a échoué**, sur autre chose que la propriété visée — voir (c).

**c. Défaut latent trouvé par cette fixture** : `core/emit-html.ts` accroche sa règle au préfixe BEM partagé `.<name>`, qu'aucun élément ne porte en **multi-root** — la feuille HTML d'un composite multi-root ne déclare donc border-box pour rien. Latent, pas vivant : **0 des 34 contrats n'est multi-root**. Nommé `DW-015-001` au registre avec son reçu, non réparé (une édition d'émetteur en clôture coûte trois re-pins pour un défaut qui n'affecte aucun contrat).

**d. Deux textes périmés, corrigés** : la description du contrat `ds.hero` affirmait encore « TWO NAMED LIMITS REMAIN … `literals` refuses the channel by name » — une limite supprimée par T028, c'est-à-dire une capacité livrée décrite comme absente (l'inverse de la Claims Rule). Et l'ampleur du défaut de pointeurs périmés, que son reçu déclarait « non mesurée », a été **chiffrée : 30 des 69 pointeurs `/literals/` de `audit-campaign.json`** (coordonnees 9 · hero 9 · faq 4 · footer 3 · reassurances 3 · presentation 2).

Enfin, quatre tâches (T028–T031) étaient restées décochées alors que leur travail était livré et prouvé — corrigé, avec le constat de vérification écrit dans chacune.

---

## 4 · Ce que « `contract-geometry` = 0 » recouvre exactement

Le compte d'ouverture était 6 (relevé v2, après modélisation `aggregateOf`). Il atteint 0 par **trois chemins différents**, et l'honnêteté demande de ne pas les confondre :

- **3 réparations réelles** — DW-001 (le logo gouverné), DW-004 et DW-005 (le footer : 10 sites convertis, `size.footer.root` corrigé 1550 → 1728), chacune avec son reçu `named-repair-*` re-testé ;
- **2 re-classements argumentés** — `section-header :: Avec CTA` passe `contract-geometry` → `rendering` (la géométrie juste est un pin de harnais, `renderWidth: 1550`, parce que le master Figma déclare FIXED 1550 et qu'**aucun contrat vivant ne compose cette disposition** ; une largeur portée par le contrat lui-même a été essayée **puis annulée** — elle cassait `align-self: stretch` chez tous les vrais consommateurs). Et `coordonnees` passe `contract-geometry` → `instrument` (son écart est piloté par `row` vs `row-reverse`, un choix déjà documenté et acquitté dans le contrat, que le vérificateur de faits compare comme une chaîne) ;
- **1 report** — `texte-seo` (DW-014-003) garde la cause `contract-geometry` et vit désormais au registre des travaux reportés, d'où il **ne compte plus** (le modèle de 014, §4 ter : `deferredWork` n'est jamais mêlé à `byCause`).

Donc : **0 ne veut pas dire « tout réparé »**. Il veut dire « la porte ne réclame plus aucun travail de géométrie **non attribué** ». Un travail de cette cause reste ouvert, nommé, avec son reçu.

---

## 5 · Dette léguée — tout en un endroit

| Id | Quoi | Où ça va |
|---|---|---|
| DW-014-003 | `texte-seo` : titre rich-text aplati + typographie non liée à travers la composition `ds.texte-seo → ds.section-header` | à ordonnancer (spec dédiée ou reprise) |
| DW-014-001 | `emit-html` émet le texte de select en enfant nu de `<select>` | tinyspec `select-option-emit`, juste après 015 |
| DW-014-002 | La parité visuelle rend via `emit-html`, **jamais** la surface React livrée — l'axe qui devait voir US2 ne la voit toujours pas | **non résolu alors que sa destination disait « 015 »** — voir ci-dessous |
| DW-015-001 | `emit-html` : règle border-box inopérante en multi-root (latent, 0 contrat concerné) | la spec qui rendra Piqueray multi-root, ou une passe moteur |
| — | 30/69 pointeurs `/literals/` périmés dans `audit-campaign.json` (faux négatifs `contract-does-not-carry-figma-fact`) créés par les conversions de Phase 4 | une passe dédiée sur `audit-campaign.json` (fichier de 013) |
| DW-002 · DW-003 | Débordement de 2px des cartes `reassurances` · en-tête figé de la FAQ — défauts de **source** | chantier canvas **016** |
| — | Photos non transportées (frontière image, limite A5) | **017** |
| — | Les 77 littéraux de trait, peinture et typographie | hors périmètre nommé de 015 |

**Sur DW-014-002, à dire franchement** : sa destination au registre était « 015 », et 015 ne l'a pas résolu. Conséquence concrète : SC-003 est prouvé par des mesures directes (T019, Playwright non contraint) et par le nouvel eval `react-box-model-border-box`, **pas** par l'instrument de parité visuelle — qui continue de rendre la surface HTML. Ce n'est pas un chiffre faux, c'est un fait hors de portée de l'instrument, et il le reste après 015.

**Sur l'axe canvas** : les 83 références créées ici n'ont **pas encore de variables Figma** (015 est en lecture seule de bout en bout, FR-010). `parity/baseline.json` passe de 7 à 89 acquittements pour cette raison exacte (reçu `figma-tokens-behind-baseline.md`). Autrement dit : l'angle mort est **fermé côté code**, et l'axe `variables canvas ⟷ tokens` reprendra son travail de surveillance quand 016 créera les variables. La parité est verte, mais elle l'est **avec** ces acquittements — pas sans eux.

---

## 6 · Ce que 015 n'a pas fait, volontairement

- **Aucune mutation Figma**, de bout en bout (FR-010). Toutes les vérifications de source sont des lectures : dumps commités et lectures REST/`figma_get_component_for_development`.
- **Aucun seuil, aucune région de masquage, aucun critère de preuve assoupli.** Le seul changement d'instrument est `renderWidth: 1550` sur le sujet `section-header` — un pin de largeur d'isolement justifié par le fait Figma lui-même (le master déclare FIXED 1550), du même type que celui d'`accordion-row`, porté avec sa cause en commentaire et au registre.
- **Aucune conversion n'a changé un rendu.** Une conversion qui change le rendu n'est pas une conversion, c'est une réparation non attribuée : les 196 sont pures, et les réparations sont nommées séparément.
- **Aucune valeur arrondie « pour rentrer dans l'échelle »** : chaque référence créée porte la valeur observée exacte et cite sa provenance dans sa `$description`.
