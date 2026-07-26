# Contrat — Le relevé et son compteur

**SC-011 exige qu'un tiers, à partir du seul rapport de clôture, reproduise les compteurs
annoncés.** Ce contrat est donc la procédure elle-même : si elle n'est pas ici, elle n'existe
pas. Deux trous mesurés dans l'état actuel du dépôt sont comblés explicitement — sans quoi le
tiers échoue.

## 1 · Trou A — `TARGET_SETS` n'est pas `[]` dans le dépôt

`extract/figma/dump.plugin.js` l. 66 est **committé** :

```js
const TARGET_SETS = ['Badge', 'Switch', 'Card'];
```

et le filtre (l. 447) est `if (TARGET_SETS.length > 0 && !TARGET_SETS.includes(node.name)) continue;`.

Un tiers qui suit la recette « banker avec `TARGET_SETS = []` » **sans avoir lu ce paragraphe
capture 3 sets, pas 55**. Le pas est donc :

> **Éditer localement** `extract/figma/dump.plugin.js` l. 66 en `const TARGET_SETS = [];`
> — « tout set/composant local sauf l'utilitaire `Slot` », selon le commentaire l. 65.
> **Cette édition n'est jamais committée** (FR-025) : elle est locale, le temps du relevé,
> et **restaurée dès le relevé pris** (`git checkout extract/figma/dump.plugin.js`, pas 6
> de §3). « Non committée » ne suffit pas : le contrôle de clôture (SC-009) lit
> `git status`, qui voit une modification du répertoire de travail.

## 2 · Trou B — aucun compteur n'existe dans le dépôt

`figmaProposalsReport` (`core/propose-figma.ts` l. 4669-4685) concatène `proposal.notes` en
puces markdown sous des titres `## <setName>` : **ni classe, ni compte**. Les « 704 notes /
196 classes » viennent d'un traitement hors dépôt. `extract/figma/gauntlet/census.ts` classe
des **violations de referee** — un autre objet — et tourne sur la fixture CBDS.

Le compteur est donc un **livrable de cette spec**, et il vit sous
`specs/007-figma-extractable-source/tools/note-census.mjs` parce que FR-025 gèle le dépôt
applicatif.

**Forme imposée** : appeler `proposeBatchFromDump` (`core/propose-figma.ts`, exporté, **pur**,
déterministe, sans `node:*`) sur le dump banké, puis classer les `notes[]` par **préfixe
stable**. **Jamais** une regex sur le markdown : le markdown est une sortie de présentation,
son format n'est pas un contrat.

## 3 · La procédure, de bout en bout

```text
1. Éditer localement dump.plugin.js : TARGET_SETS = []          (§1, non committé)
2. Démarrer le receveur :
     node extract/figma/gauntlet/live/capture-receiver.mjs <outDir> 9226
3. Servir le script au sandbox et POSTer le dump :
     figma_execute → loadAllPagesAsync() → dump → POST /chunk?name=<stem>
     (le dump ~300 KB tient en un envoi ; pas de découpage nécessaire à 55 sets)
4. Proposer :
     npm run extract:figma -- <outDir>/<stem>.json
     → 55 fichiers extract/out/figma/<id>.contract.proposed.json + figma-proposals.md
5. Compter — **`npx tsx`, PAS `node`** (vérifié : `node` échoue en
   `ERR_MODULE_NOT_FOUND` ; le compteur importe `core/propose-figma.ts` et
   `extract/figma/*.ts` via des spécificateurs `.js`, que node nu ne résout pas) :
     npx tsx specs/007-figma-extractable-source/tools/note-census.mjs <outDir>/<stem>.json \
       --json specs/007-figma-extractable-source/releves/notes-<date>.json
     → comptes par classe + un résumé lisible
6. **Restaurer le fichier édité au pas 1** — `git checkout extract/figma/dump.plugin.js` —
   puis vérifier `git status` : rien de modifié hors `specs/007-…/**`. Ce pas n'est pas
   facultatif : sans lui l'édition locale survit jusqu'au contrôle de clôture et fait
   échouer SC-009.
7. Committer le RELEVÉ (releves/*.json). Ne JAMAIS committer le dump (~300 KB, reproductible).
```

## 4 · Les six classes, par préfixe stable

Chaînes citées du code — ce sont les clés de classement, et elles sont déterministes.

| Clé | Motif de reconnaissance | Site |
|---|---|---|
| **A** | `^contract name: drawn set name ` | `core/propose-figma.ts` l. 4430-4434 |
| **B** | `^contract id: drawn set name ` | l. 4436-4443 |
| **C** | `contains characters outside a legal identifier` | l. 4445-4451 (+ slots l. 4302-4305) |
| **D** | `already names another part of this contract` | l. 2510-2521 (`partKey`) |
| **E** | `^UNBOUND ` | l. 4649-4655 (via `reportUnbound`) |
| **F** | `is not a token-derived style` | l. 1808-1811 |

**Classe E — décomposition par canal.** Le canal est le 3ᵉ champ de la chaîne
(`UNBOUND <nodePath> <property> = <valeur> — no token invented; nearest tokens by value: …`) :
`itemSpacing` (l. 1235), `padding` (1263), `cornerRadius` (1267), `strokeWeight` (1276),
`minWidth`/`minHeight`/`maxWidth`/`maxHeight` (1287-1304), `fontWeight` (1740), `lineHeight`
(1763), `fontSize` (1799), `opacity` (1375), `effects` (1413), peintures (1056, 3739, 3773,
3852, 3860, 3947).

**Sous-compte « aucun token proche »** (60 des 193) = les entrées rendues `(none found)`,
c'est-à-dire `suggestions.length === 0`.

**Classe `G`, trouvée en écrivant le compteur** : `proposeBatchFromDump` émet
`contract id "…" is claimed by two sets in this dump` quand deux noms de set se réduisent au
**même id**. Elle vaut 0 aujourd'hui, mais elle **devient un risque réel** dès que la table
de nommage renomme 36 masters — deux renommages peuvent converger. Le compteur la porte, et
l'oracle doit être passé sur la table **entière** (unicité des `componentIdSlug`), pas ligne
à ligne.

**La classe `Z` (non classées) n'est pas censée valoir 0.** Vérifié à l'exécution : son
occupant principal est `semantics.element defaulted to "div" — element/role/ARIA are not
drawn on the canvas…`, c'est-à-dire les **55 décisions balise/ARIA** que la prépa affecte au
chantier 2.2 de la spec **suivante**. Elles n'entrent pas dans les compteurs de la 007. Le
compteur les affiche quand même : une note qu'on ne classe pas doit être **vue**, jamais
absorbée. Ce que `Z` interdit, c'est qu'une note de classe A–G échappe au comptage par un
changement de libellé côté dépôt — si `Z` gonfle d'un coup, les motifs du §4 ont dérivé.

## 5 · Ce que « token proche » veut dire — et ce que ça implique

`core/token-corpus.ts` l. 94-127 indexe `valeur normalisée → chemins de tokens` et
`suggestFor` fait un **lookup exact** sur cette clé. Il n'y a **ni distance, ni seuil, ni
plus-proche-voisin**. « Token proche » signifie donc *token de valeur strictement identique*.

Conséquence directe : **il n'existe aucun mécanisme d'arrondi à contourner**. FR-013 (valeur
exacte) n'est pas une discipline qu'on s'impose contre l'outil — c'est la seule chose que
l'outil sache faire. Une valeur rapprochée d'un voisin serait un **changement de design
déguisé**, invisible au compteur et visible au pixel.

## 6 · ⚠️ La classe F ne peut pas atteindre zéro par une action canvas

Chaîne mesurée, à connaître avant d'ouvrir le lot typographique :

1. `core/token-corpus.ts` l. 71-89 construit les styles dérivés en filtrant les tokens
   **sémantiques** sur `/^font\.(.+?)\.size(?:\.([^.]+))?$/`.
2. `tokens/semantic.tokens.json` contient **24 chemins, tous `typography.*`, zéro `font.*.size`**.
3. Donc `textStyles = []`, `corpus.textStyleByName` est **vide**.
4. Donc la note F se déclenche pour **tout** texte portant un style nommé, quel que soit
   l'état du canvas.

Lier les 18 styles et poser leur marqueur **ne fera pas bouger ce compteur d'une unité**. Il
est gouverné par une regex du dépôt — c'est exactement le **trou d'émetteur n° 1** que la spec
classe elle-même en dette léguée.

**Ce que le relevé fait donc** : il compte F **à part**, avec sa cause écrite et son
destinataire, et ne le fond jamais dans le zéro de la classe E. Le reçu réel du lot
typographique est **SC-013** — 18/18 liés **et** 18/18 marqués — qui se vérifie par un relevé
live (`getLocalTextStylesAsync`), pas par le compteur de notes.

Note complémentaire à léguer : même la regex corrigée, les noms dérivés seraient `titre-1`,
`paragraphe`, `lead` — qui ne correspondent pas aux noms des styles Figma (`Titre 1`,
`Paragraphe`, `Lead`). Le trou n° 1 est plus profond qu'une regex.

## 7 · La validité 55/55 n'est pas un compteur imprimé

`ContractSchema.parse()` (et non `safeParse`) est appelé **inconditionnellement** dans
`proposeFromDump` (l. 4642-4643), et la CLI n'a **pas** de `try/catch` (`extract/figma/propose.ts`
l. 223-240). « 55/55 valides » est donc la **conséquence** du process qui va au bout, pas un
nombre qu'il calcule.

Pour un chiffre explicite et opposable (SC-004), deux voies, à écrire au rapport :
- compter les fichiers produits — `ls extract/out/figma/*.contract.proposed.json | wc -l` ;
- ou passer par `proposeBatchFromDump`, qui attrape par set et renvoie `{proposals, skipped}`.

Le compteur de `tools/note-census.mjs` emprunte la seconde voie : il obtient la validité **et**
les classes en un seul passage.

## 8 · Invariants du relevé

- Le relevé se prend **par position et signature structurelle**, jamais par nom — chercher un
  défaut de nommage en filtrant par nom, c'est mesurer le défaut avec l'outil défectueux.
- **Aucun compteur n'est figé en prose.** Les chiffres de départ (36/10/10/22/193/41/55) datent
  du 2026-07-26 ; le relevé de clôture est la seule autorité sur les chiffres d'arrivée, et les
  compteurs hérités du backlog du 2026-07-25 sont **périmés** et re-relevés (cf. R10).
- **Une exception ne réduit jamais un compteur** : elle est comptée à part et nommée.
