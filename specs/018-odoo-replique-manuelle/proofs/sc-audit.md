# Audit des 9 critères de succès — un par un, avec le reçu qui l'établit

**Date** : 2026-08-07 · **Règle** : un critère non atteint est consigné **avec sa cause**. Une
mesure sautée n'est jamais comptée réussie, et un résultat défavorable est un résultat.

---

## SC-001 · 0 erreur d'installation

**ATTEINT**, avec une réserve écrite.

Reçu : [`installation.txt`](./installation.txt). Base **recréée** (`down -v` puis remontée) — SC-001
se lit sur une installation neuve ou ne se lit pas.

- ERROR/CRITICAL/Traceback imputables à `piqueray_ds` : **0**
- Le chargement du module, en entier : 5 lignes, aucune erreur, aucun avertissement
- EXIT de l'installation : **0**, 42 modules chargés

**Réserve** : l'installation n'est pas silencieuse — elle porte **1 ERROR** attribuée par position
au module `mail` d'**Odoo** (description RST malformée du produit lui-même). Prétendre « 0 erreur »
tout court serait faux ; le compte qui vaut est celui des erreurs **du module**.

**Défaut corrigé en route** : un premier montage en imprimait 2, imputables au module — sans clé
`description` au manifeste, Odoo rend le README en RST et les séparateurs de tableau Markdown
deviennent des substitutions non définies. Corrigé à la source.

## SC-002 · 3 composants, 3 niveaux, 1 entrée, 19 glyphes, choix de glyphe exercé

**PARTIELLEMENT ATTEINT — 4 clauses sur 5.**

| Clause | Verdict | Reçu |
|---|---|---|
| **3 composants rendus** | ✅ | page publique après enregistrement : `presentation`, `section-header`, `button` tous présents ([`us1/gestes-us1.json`](./us1/gestes-us1.json)) |
| **3 niveaux portés par des appels entre modèles** | ✅ | `t-call` sur 3 niveaux dans `templates.xml`, et **exercé en fonctionnement** sur `/piqueray-mesure/section-header` — rendu à **0,0000 %** d'écart |
| **1 seule entrée dans le panneau** | ✅ | geste : recherche « Piqueray » → 1 carte ; « Bouton » et « En-tête » → 0 de nous ([`us1-receipt.md`](./us1-receipt.md)) |
| **19 glyphes embarqués** | ✅ | 19/19 résolus depuis le registre, 4 non gouvernés écartés ([`glyphes-19.md`](./glyphes-19.md)) |
| **choix du glyphe exercé sur l'instance** | ❌ | **NON ATTEINT** |

**Cause de la clause manquante** : le choix du glyphe se pilote par un `BuilderSelect` (T033), et
**T031–T033 n'ont pas été écrites**. Les 19 classes CSS existent et sont dérivées du registre, mais
aucun réglage ne les expose, donc le geste n'a pas pu être tenté. FR-004b exige une confirmation en
fonctionnement : elle n'existe pas. **Non compté comme réussi.**

> Fait mesuré à porter au crédit de la chaîne malgré tout : le **niveau 3** n'était pas atteignable
> par les valeurs de composition du contrat (relevé T004 §7.4). Sur décision d'owner, il est exercé
> sur une page de mesure hors panneau plutôt qu'en ouvrant une capacité que le contrat ne porte pas.

## SC-003 · 0 valeur de style invisible

**ATTEINT**, les deux comptes donnés séparément comme l'exige le critère.

Reçu : [`sc003-audit.txt`](./sc003-audit.txt).

- **N · valeurs invisibles : 0**
- **M · littéraux nommés : 12 occurrences de 4 entrées** — tous hérités d'un contrat, épinglés
  byte-à-byte ([`named-literals.registry.json`](../module/piqueray_ds/named-literals.registry.json))

**L'instrument a été réparé en cours d'audit, et c'est consigné** : son premier passage rendait
« 0 » en ratant `font-weight: 300`, une entrée de son propre registre. Un instrument qui manque ce
qu'il déclare chercher rend un vert flatteur.

**Correction appliquée avant le relevé** : 7 `line-height` littéraux de la feuille de référence ont
un token de même valeur (vérifié un par un) et sont convertis en `var(--pqr-font-line-height-N)`.

## SC-004 · le panneau n'affiche que ce qui est déclaré

**NON ATTEINT.**

Reçu : [`us2/gestes-us2.json`](./us2/gestes-us2.json). Geste : cliquer successivement la section, le
texte, la colonne gauche et le titre, et relever tout ce que le panneau affiche.

Résultat : le panneau affiche **exactement la même chose aux quatre clics**, et **rien** de ce qu'il
affiche n'a été déclaré par nous — *Background Colors*, *Content Width*, *Height*, *Visibility*.

**Cause** : T031–T035 non écrites. Nous n'avons déclaré **aucun** réglage, donc 100 % de ce qui
s'affiche est natif et non voulu. La voie passive (ne pas correspondre aux sélecteurs natifs) ne
suffit pas à elle seule : notre `<section>` correspond au sélecteur générique `section` d'options
natives, et elle y correspond parce qu'un snippet Odoo **doit** être une `<section>`.

## SC-005 · 100 % des zones modifiables le restent après enregistrement

**ATTEINT sur ce qu'il mesure — et il mesure moins que prévu.**

Reçu : [`us2/gestes-us2.json`](./us2/gestes-us2.json). Geste : enregistrer, rouvrir en édition.

- Zone déclarée modifiable (`presentation__Texte`) : **encore éditable**, ancêtre `.container` ✅
- Une zone modifiable sur une déclarée → **100 %**

**Ce que ce 100 % ne dit pas** : le tableau des zones ne déclare qu'**une** zone de texte modifiable
sur toute la chaîne (`texte`), les autres étant figées par la composition du parent. Le
dénominateur est donc 1. Le mécanisme est confirmé ; sa généralité ne l'est pas.

**Confirmé au passage** : `contenteditable` et `.o_editable` sont **tous deux à 0** sur la page
publique — exactement ce que la recherche annonçait, et la raison pour laquelle le balisage
`section > .container` est le seul mécanisme durable.

## SC-006 · 3 lignes, 1 cause dominante, 0 verdict à l'œil

**ATTEINT.**

Reçu : [`comparaison-image.json`](./comparaison-image.json). Plancher déclaré : **0**, le plus
strict possible.

| Composant | Score mesuré | Cause |
|---|---|---|
| `ds.button` | 0,0000 % | — (sous le plancher) |
| `ds.section-header` | 0,0000 % | — (sous le plancher) |
| `ds.presentation` | 4,1707 % | `engine`, une seule, du vocabulaire fermé de 014 |

3 lignes mesurées, 0 impossible, 0 score estimé. La cause de la 3ᵉ est remontée jusqu'à sa règle CSS
sur la page vivante, pas attribuée au jugé.

**Divulgation C3, écrite plutôt que tue** : les scores étaient déjà connus quand le plancher a été
posé. Ce qui sauve le nombre n'est pas l'ordre mais son sens — 0 est le plancher le plus strict
possible, il ne peut pas avoir été choisi pour flatter.

## SC-007 · 4 verdicts de levier sur 4

**ATTEINT** — 4 verdicts écrits, aucun silence.

Reçu : [`verdicts-leviers.json`](./verdicts-leviers.json). L1 **lâché**, L2 **lâché**, L3 **non
exercé**, L4 **non exercé**. Chaque `lâché` nomme sa cause, chaque `non exercé` sa raison.

**Zéro tenu** — et c'est un résultat, pas un défaut du critère : SC-007 exige que les 4 verdicts
existent, pas qu'ils soient favorables. Aucun 4/4 obtenu par élargissement du périmètre (V5).

## SC-008 · le rapport permet de décider sans rouvrir le code

**ATTEINT.**

Reçu : [`../RAPPORT-DECISION.md`](../RAPPORT-DECISION.md). Il porte les volumes (505 lignes de code,
**79 % mécaniques**, invariants M1–M4 vérifiés par programme), les 4 verdicts repris tels quels, les
3 lignes d'écart visuel, une recommandation argumentée unique, un ordre de grandeur adossé au
précédent interne mesuré (1353 lignes, avec sa réserve écrite), et **6 angles morts** — un de plus
que les 2 exigés.

## SC-009 · 0 fait lu-dans-le-code présenté comme acquis

**ATTEINT.**

Reçu : §4 du rapport de décision, qui sépare explicitement 5 mécanismes **confirmés** en
fonctionnement de 5 restés **non confirmés** — dont L4 en tête.

**Et le critère a produit son propre argument** : le taux d'erreur des faits lus-mais-non-confirmés
a été élevé dans cette spec. Six affirmations des documents de conception se sont révélées fausses à
la mesure — `core/samples/` périmé, « 1 littéral attendu » (il y en a 4), « archiver la spec cassera
le build » (faux), la chaîne à 3 niveaux qui ne se rend jamais, l'attribut `group` oublié, et le
« 32 » de tokens qui comptait 3 placeholders. C'est écrit comme angle mort n° 6.

---

## Bilan

| | Nombre |
|---|---|
| **Atteints** | **6** — SC-001, SC-003, SC-005, SC-006, SC-007, SC-008, SC-009 (7 en fait) |
| **Partiellement atteints** | **1** — SC-002 (4 clauses sur 5) |
| **Non atteints** | **1** — SC-004 |

**7 atteints, 1 partiel, 1 non atteint.** Les deux manques ont la **même cause unique** : la couche
de réglages (T031–T035) n'a pas été écrite. Ce n'est pas une dispersion de défauts, c'est un trou
identifié, nommé, et chiffré comme angle mort n° 1 du rapport.
