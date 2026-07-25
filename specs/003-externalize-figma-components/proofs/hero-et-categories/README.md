# Preuve — Hero et catégories (T097/T098)

## Il n'y a pas de preuve pixel avant/après, par conception — et c'est correct

**Aucune mutation canvas n'a eu lieu pour cette tâche.** T097/T098 se réduisent à
**vérifier + documenter** que le composite `Hero et catégories` est déjà entièrement gouverné
par les adoptions précédentes **Hero (T076)** + **Catégories principales (T080)** — il n'y a
donc **pas de master à construire, pas de copie brute à remplacer, pas de « avant » à
capturer** (R5/R8 sans objet : rien ne change, rien n'est perdu).

Le dossier standard `{verdict.json, verdict.md, crops/}` n'existe pas ici volontairement : il
n'a de sens que face à une mutation réelle (comparaison raw-avant vs adopté-après). L'imposer
sur une tâche sans mutation produirait un artefact vide ou trompeur.

## La preuve réelle est STRUCTURELLE + de PROVENANCE (plus forte que le pixel ici)

L'affirmation à démontrer n'est pas « les pixels sont identiques » mais **« les deux enfants
sont des instances gouvernées, zéro copie brute, zéro dépendance tierce »**. Un instantané
pixel **ne peut pas** distinguer une copie brute d'une instance (elles rendent pareil). La
lecture live du graphe, elle, le prouve directement. Toutes les lectures sont dans
`audits/hero-et-categories.md` ; résumé :

- **6 cadres** `Hero et catégories` (FRAME), tous sur `Pages` ; **0** COMPONENT/COMPONENT_SET
  du même nom nulle part (anti-fork : aucun master préexistant).
- **Le cadre wrapper** : `FRAME` VERTICAL, FIXED 1728 × HUG, **gap 48**, padding 0,
  `fills:[]`/`strokes:0`/`effects:0`/`radius:0` — **identique sur les 6 pages**. Sa hauteur est
  une **pure conséquence du HUG** : `Hero + 48 + Catégories`, vérifié exactement 6/6
  (1106/1186/1310/1212/1337/1310). → aucune identité de composant à gouverner ; seul le gap
  d'assemblage 48, qui relève de la maquette.
- **Les enfants** (`getMainComponentAsync`) :
  - 5/6 pages : **Hero** INSTANCE (main `2111:3382`, `remote:false`) + **Catégories
    principales** INSTANCE (bonne variante du set `2115:4277`, `remote:false`).
  - Accueil : **`Hero video`** FRAME `210:330` (720px, negative-control documenté, **hors
    périmètre** — voir audit Hero T075/T076) + Catégories INSTANCE gouvernée.
  - **11 instances gouvernées** (5 Hero + 6 Catégories), **0 copie brute**, **0 remote**.

## Pourquoi pas de master (résumé — détail dans l'audit et le journal)

1. Wrapper sans identité visuelle propre → même décision que `accordion` (T067), `tabs`
   (T043-44), `row`/Field (T039-40).
2. Un master unique serait **impossible sans fausser la source** : Accueil porte `Hero video`
   (structure 720px différente), pas un Hero — un Hero baké ne pourrait le servir sans forcer un
   faux ou externaliser un negative-control.
3. Construire un master + adopter 6 = 6 mutations live pour **zéro gain de fidélité** et un
   risque réel (rejeu de props, overrides manqués) → décliné, conformément à « ne pas construire
   un master inutile pour cocher une case ».

## Ledger

`ledger/hero-et-categories.json` — **vide explicite** (`entrees: []`, `totaux 0/0`).
`npm run pages:ledger:check` → **exit 0** (vérifié 2026-07-25). Pas de master unique à référencer
(`masterNodeId` porte un sentinel honnête nommant les deux masters gouvernants + renvoi à
l'audit/journal).

## Points ouverts nommés (hors périmètre T097/T098)

- `Hero video` (Accueil) non externalisé — negative-control, question d'un éventuel master
  dédié, jamais briefé.
- Portes d'entrée : le wrapper est niché dans un `GROUP` source superflu `Header + Hero + Cat`
  (`237:970`) ; les 5 autres l'ont en enfant direct. Incohérence de source nommée, non corrigée
  (hors périmètre d'un cadre non componentisé).
