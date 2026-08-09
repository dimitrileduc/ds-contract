# Correction — la prémisse de 019 sur 018 était fausse

**Date** : 2026-08-08 · **Origine** : revue externe, vérifiée par lecture des artefacts de 018.

019 a été conçue sur la phrase « 018 a mesuré **zéro levier de gouvernance tenu** ». Cette phrase
est **sourçable mais périmée**, et deux de ses corollaires sont **faux**. Ce document remplace la
prémisse ; les passages concernés des documents de 019 y renvoient.

## La cause : 018 a deux états, et son rapport ne décrit que le premier

```
d617f604   2026-08-07 07:52   « clôture partielle — 7 critères sur 9 »
           → écrit RAPPORT-DECISION.md et proofs/verdicts-leviers.json
           → SEULS commits qui aient jamais touché ces deux fichiers

5cd48b71   2026-08-07 17:57   « la Présentation gouvernée jusqu'au bout »
           → AJOUTE static/src/js/piqueray_option.js  (186 lignes, la couche de réglages)
           → AJOUTE proofs/us2/gestes-us2-gouverne.json
           → RÉÉCRIT proofs/comparaison-image.json
           → ne touche NI le rapport, NI les verdicts
```

Le rapport est l'ancêtre de la couche de réglages, à dix heures d'écart le même jour. **018 n'a
jamais réémis ses verdicts après avoir livré ce qui les invalidait.** 019 a cité le rapport de
07 h 52 comme s'il décrivait l'état final.

Le rapport lui-même **borne** sa portée, explicitement et avant ses verdicts
(`verdicts-leviers.json:9`) : *« Le module posé sur l'instance porte donc son balisage de
verrouillage (L1) mais AUCUNE couche de réglages. »* 019 a repris le verdict sans sa borne.

## Ce qui est FAUX dans les documents de 019, et doit être retiré

| Affirmation de 019 | Réalité, avec son reçu |
|---|---|
| « la contribution restrictive depuis un `Plugin` n'a pas été tentée » | `piqueray_option.js:156-168` est un `Plugin` qui contribue `content_not_editable_selectors: [ROOT]` et `content_editable_selectors: TEXTES_MODIFIABLES`, enregistré `:186`, chargé par `__manifest__.py:51` |
| « 018 ne l'a pas exercée » (la fermeture sélective) | `gestes-us2-gouverne.json:7-17` — **7 attentes sur 7 tenues** : 3 textes ouverts, 4 conteneurs fermés (`FERME_racine`, `FERME_container`, `FERME_colGauche`, `FERME_wrapper` tous à `false`) |
| « Non prouvé : la fermeture des conteneurs » | même reçu — c'est précisément ce qui est prouvé |
| « les réglages natifs remontent malgré tout » | `gestes-us2-gouverne.json:19-21` — le panneau ne lit plus que `Piqueray · Présentation` + `Appel à l'action`. Les 4 options natives ont disparu (8 classes exclues, `piqueray_option.js:93-113`) |
| « `Presentation` mesure 4,1707 % » | `proofs/comparaison-image.json` final : **0** sur les trois composants. Le 4,1707 % est la mesure du **2026-08-06**, corrigée le lendemain |

## Ce qui RESTE vrai, et qu'il ne faut pas jeter avec le reste

1. **`o_not_editable` ne ferme pas l'édition de texte dans un snippet.** Confirmé deux fois — par
   018 (`piqueray_option.js:118-124`) et par ma propre lecture du noyau
   (`builder_content_editable_plugin.js`, `isValidContentEditable` n'honore un `.o_not_editable`
   que hors d'un `[data-snippet]`). 018 va plus loin que 019 ne l'écrivait : il ne ferme pas non
   plus les réglages natifs à lui seul.
2. **Le verrou STRUCTUREL n'a jamais tenu.** `gestes-us2-gouverne.json:23-29` : après la couche de
   réglages, l'éditeur propose toujours `Drag and move`, `Duplicate`, `Remove` sur les éléments
   intérieurs. C'est le trou réel, et c'est celui que 019 doit fermer.
3. **L3 (troncature de ce qui remonte du parent) et L4 (image) restent non exercés.**

## Une erreur de 018 sur elle-même, trouvée au passage

018 comptait **trois** zones figées ouvertes à tort ; il y en avait **deux**. Le « libellé du
bouton » n'était pas une zone figée : `zones/ds-button.json` déclare `children` → `modifiable`
(seule la *part* est figée, pas son contenu). `gestes-us2.json` a confondu les deux, et le rapport
a hérité de l'erreur. 018 a donc **surestimé son propre échec d'une zone sur trois**.

## Conséquence pour le périmètre de 019

Le second spike change de nature. Il n'est plus « qualifier un mécanisme candidat jamais testé »,
mais :

> **reproduire un mécanisme prouvé une fois sur un bloc, puis fermer le trou structurel que 018 a
> laissé ouvert** (déplacement, duplication, suppression des éléments intérieurs).

Risque différent, coût différent. T017b et T020b l'ont désormais fermé sur le banc de fondation :
44/44 constats tenus, zéro saut/échec. Les sections réelles restent à qualifier séparément.

## Une réserve sur le 0,0000 % dont il faut se méfier

Le `comparaison-image.json` réécrit porte `plancherDeTolerance: null` et `raisonDuPlancher: null`,
et a perdu les `justification` que portait la version précédente. Or son propre contrat
(`018/contracts/visual-comparison.md:119`, invariant **C3**) exige un *plancher déclaré, avec sa
raison*. **L'artefact à 0 % viole l'invariant C3 de son contrat**, là où la version à 4,17 % le
respectait. Les chiffres sont vraisemblablement justes ; l'artefact est plus faible que celui qu'il
remplace, et 019 ne doit pas s'appuyer dessus sans le dire.

Il faut aussi savoir **comment** le 0 % a été obtenu, parce que c'est instructif
(`018/views/templates.xml:151-157`) : retirer le `.container` de Bootstrap a fait passer la mesure
de 4,17 % à 0,0000 % **et a cassé la vraie page**. *« L'instrument a récompensé la suppression de ce
qui faisait marcher la page. »* La solution retenue fut une borne maison sans gouttière. C'est
exactement le piège que SC-006 doit continuer de surveiller.

## Fichiers à corriger

`019/research.md` §6 et §13 · `019/plan.md` Summary et §5 · `019/spec.md` SC-006 et §211 ·
`019/checklists/requirements.md` · `ROADMAP.md:163` ·
`.agents/skills/odoo-component-production/SKILL.md` ·
`integrations/odoo/addons/piqueray_ds/static/src/js/{odoo19_compat,authoring}.js`
