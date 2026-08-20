# Acquittement parity — `figma|ahead|Header.Fond` (022, 2026-08-20)

`parity/baseline.json` ne porte pas de raison ; celle-ci vit ici (record durable).

## Le finding

Après le retrait du master `Fond=Solid` (T005), le set Figma `Header` (84:285) **reste
un COMPONENT_SET** avec une **propriété de variante `Fond` mono-valeur `[Transparent]`** —
Figma ne retire PAS la propriété de variante quand il ne reste qu'une variante (mécanisme
**observé** sur clone en T003, reproduit sur le set réel en T005). Le contrat `ds.header@2.0.0`
retire la prop `fond` (MAJOR). D'où `npm run parity` : **`[figma AHEAD] Header.Fond`** — le
canvas déclare une propriété que le contrat ne modélise plus.

## La décision (owner, 2026-08-20 — AskUserQuestion)

**Acquitter** : entrée `figma|ahead|Header.Fond` ajoutée à `parity/baseline.json` (rejoint les
7 divergences pré-existantes déjà acquittées). Rendu de parity : vert (le finding ne fait plus
échouer la porte).

## La prémisse D3 renversée par la mesure (nommé, non silencieux)

research **D3** affirmait : « la suppression du master maintient l'alignement contrat↔canvas
**sans acquittement permanent** ». **Faux à la mesure** : Figma conserve la propriété de variante
mono-valeur, donc un résiduel subsiste. C'est un cas « une décision n'est pas un fait » (cf. les
6 prémisses 018 fausses à la mesure). L'acquittement est la résolution **sûre et réversible** ;
l'alternative (dissoudre le set → composant simple pour zéro résiduel) a été **rejetée par
l'owner ce jour** comme trop risquée hors mandat : elle toucherait la clé du set, l'ancre du
contrat (`componentSetKey`/`nodeId` 84:285) et les 10 usages, sans API Figma propre.

## Réversibilité / dette portée

- Le résiduel est **inoffensif** (une seule variante, aucun effet visuel — les 10 usages restent
  Transparent, re-vérifiés par POSITION en T005).
- **Conséquence sync nommée (revue 2026-08-20)** : le figma-sync régénéré (`28-header.js`,
  `batch-03.js`) calcule désormais `isSet: false` (une seule variante — `core/emit-figma-script.ts`,
  `isSet: variants.length + stateVariants.length > 1`), alors que le nœud vivant 84:285 reste un
  COMPONENT_SET. La réconciliation prendra la branche `skipped: 'set/standalone shape mismatch … a
  human retires the old node'` : **la régénération canvas de ds.header est morte jusqu'à la
  dissolution du set**, et aucun instrument ne le signale avant l'exécution dans Figma (parity ne
  compare pas la forme set/standalone). Troisième résiduel du même geste (revue Fable
  2026-08-20) : la légende du master vivant dit encore « generated from contract ds.header
  v1.0.0 » (snapshot rafraîchi) — elle ne serait réécrite que par le sync, qui skippe, et aucun
  gate ne surveille les légendes (trou nommé par 017 : `parity/diff.ts` ne compare jamais les
  descriptions). La spec future qui dissout le set résout donc les TROIS dettes d'un même geste
  (résiduel `Fond` + chemin de sync + légende périmée).
- Une **spec future** peut dissoudre le set pour zéro résiduel (répétition sur clone d'abord,
  §X, ancre du contrat à re-pointer). Dette nommée, pas cachée.
- À citer au rapport de clôture (T032, constitution V).
