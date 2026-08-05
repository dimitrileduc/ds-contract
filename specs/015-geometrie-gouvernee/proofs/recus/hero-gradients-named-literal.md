# Reçu — hero-gradients-named-literal (T031/T032, US1, D5/D6)

**Date** : 2026-08-04 · **Décision** : les 2 voiles `GRADIENT_LINEAR` du master hero sont des **littéraux nommés** (`contracts/named-literals.registry.json`), pas des références de token.

## 1. Constat docs-first qui a motivé la décision

La description du contrat `ds.hero` v1.3.0 (datée, la plus précise — citée intégralement dans research.md D5) déclare canal par canal : « Gradients are expressible in principle (§a.3: `tokens['background-image']` is parsed into a native GRADIENT_LINEAR paint) but that channel resolves ONLY through a DTCG token reference, and the Piqueray foundation defines no gradient token; `literals` refuses the channel by name … ». Ce document corrige la note parquée du brief (« zéro code moteur ») — le moteur SAIT déjà produire un `GRADIENT_LINEAR`, seul le canal `literals` refusait par nom.

## 2. Valeurs re-vérifiées sur le dump avant écriture

Lecture Figma **EN LECTURE SEULE** (`figma_get_component_for_development`, REST, `d9FYAUcqdcNtsuaMgLefvJ` nœud `2111:3382`, 2026-08-04) :

| Part | Fill | `gradientHandlePositions` (début→fin) | Stops | CSS dérivé |
|---|---|---|---|---|
| root | `fills[2]` (3ᵉ fill — `fills[1]` existe aussi mais porte `visible: false`, jamais rendu, jamais carried) | (0.5,1)→(0.5,0) = **to top** | a0@75% → a0.5@100% | `linear-gradient(to top, rgba(0,0,0,0) 75%, rgba(0,0,0,0.5) 100%)` |
| Titres | `fills[0]` (fill unique) | (0.5,0)→(0.5,1) = **to bottom** | a0@0% → a0.5@60% | `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 60%)` |

**Byte-identiques** à ce que la description v1.3.0 affirmait déjà — le dump confirme, ne contredit pas. Le fill invisible du root (`fills[1]`) n'est PAS carried : `visible: false` signifie qu'il ne rend jamais côté Figma, donc rien à représenter côté contrat.

## 3. Pourquoi littéral nommé, pas token (décision de clarification, non re-discutée ici)

Un token `gradient.hero.*` à usage unique fabriquerait un faux vocabulaire — exactement ce que la liste fermée de `contracts/named-literals.registry.json` existe pour éviter. Alternative rejetée en clarification (research.md D5, alternatives).

## 4. Ce qui a été livré

- **Schéma** (T028) : `background-image` ajouté à `LITERAL_CHANNELS`, grammaire bornée propre au canal (`GRADIENT_LITERAL_RE`, `linear-gradient(...)` uniquement) — `LITERAL_VALUE_RE` intact pour tout le reste (Principe VI). Radial/conic refusent par nom à la validation du schéma (pas seulement à l'émission).
- **Émetteurs code** (T029) : react/html/react-inline émettent déjà `part.literals` génériquement, verbatim, quel que soit le canal — aucun changement de code requis, vérifié par la fixture T022.
- **Émetteur canvas** (T030) : `core/emit-figma-script.ts`, chemin `literals` → `case 'background-image'` → `parseCssGradient` → `GRADIENT_LINEAR`, réutilisant la fonction déjà écrite pour la branche `tokens` (aucune seconde implémentation).
- **Contrat** (T031) : `contracts/hero.contract.json` — `root.literals['background-image']` et `root.parts.blocTexte.parts.Titres.literals['background-image']`.
- **Registre** (T032) : `contracts/named-literals.registry.json` amorcé aux 2 entrées ci-dessus.

## 5. Vérification

`npm run build` régénère sans erreur ; `Hero.module.css` porte les deux règles `background-image: linear-gradient(...)` verbatim ; `npm run geometry:gate` confirme `namedLiterals: 2`, ces deux pointeurs absents de `refusals[]` (ni `invisible-literal`, ni `registry-value-mismatch`, ni `registry-entry-orphaned`, ni `registry-entry-undocumented`).

La conséquence mesurée (la ligne hero bouge fortement en pixel — les deux voiles pèsent 28,07 % du master) est traitée séparément comme une **réparation attribuée** `gradient-carry`, reçu dédié `hero-gradient-carry.md` (T035) — ce reçu-ci couvre uniquement la décision de nommage, pas la re-mesure.
