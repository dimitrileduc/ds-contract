# Contrat d'interface — la 4ᵉ sortie du pipeline de jetons *(FR-005b, FR-008)*

**Statut** : la **seule** chose que 018 génère, et le **seul** code de dépôt qu'elle modifie.
Producteur : `scripts/build-tokens.mjs`. Commande : `npm run tokens` (donc aussi `npm run build`).

Ce document est l'interface, pas l'implémentation. Il dit ce que la sortie **doit** être et ce qui
la rend **fausse**. Les invariants numérotés sont ceux que l'eval de la Principe II vérifie.

---

## 1. Pourquoi une 4ᵉ sortie, et pas autre chose

Trancé en clarification (spec.md § Clarifications, Q3). Deux exigences se croisent :

- **FR-005** — aucune valeur de style **invisible**. Recopier à la main les quelque 230 propriétés
  du vocabulaire dans le module en ferait autant de valeurs que rien ne compare : exactement la
  dérive que 015 a fermée côté code.
- **FR-008** — nos noms de variables doivent être préfixés pour ne pouvoir entrer en collision
  avec ceux qu'Odoo publie. Les sorties existantes sont **sans préfixe**.

Une seule voie satisfait les deux **en même temps**, et l'idiome est déjà en place : le pipeline
a trois cibles, on en ajoute une. Le caractère **additif** est la garantie que rien ne bouge
ailleurs.

**Écartées** : consommer `src/styles/tokens.css` tel quel (demandait d'assouplir FR-008) ;
préfixer à la source (faisait onduler le changement sur 34 modules CSS générés et le fichier de
pinning) ; transcrire à la main (enfreignait FR-005).

## 2. Entrées

Exactement les mêmes que les trois sorties existantes — aucune source nouvelle, aucune lecture de
contrat :

| Source | Rôle |
|---|---|
| `tokens/primitives.tokens.json` | valeurs brutes |
| `tokens/modes/brand.default.tokens.json` | décisions de marque par défaut |
| `tokens/semantic.tokens.json` | alias sémantiques indépendants du mode |
| `tokens/modes/semantic.light.tokens.json` | sémantiques variant avec le mode (Piqueray est mono-mode) |

La carte compilée est **celle qui alimente déjà `:root`** dans `src/styles/tokens.css` — le
vocabulaire **en entier** (Assumptions), pas seulement ce que les trois composants consomment.
C'est ce qui rendra un quatrième composant possible sans retoucher la sortie.

## 3. Sortie

| Aspect | Décision |
|---|---|
| Chemin | dans le module, sous `static/src/css/` — écrit **directement par le pipeline** (FR-015b) |
| Format | propriétés personnalisées CSS sur `:root`, un fichier |
| Nom de propriété | `--<préfixe>-` + chemin du token joint par `-` — la **même** règle que `cssName()` applique déjà, préfixe en plus |
| Alias | préservés en `var(--<préfixe>-…)`, comme les sorties existantes préservent `var(--…)` |
| Modes | aucun. Piqueray est mono-marque, mono-mode : le fichier `dark` existant est vide de tokens et le fichier `brands` n'a aucune marque non-défaut. Ajouter des blocs vides fabriquerait une capacité qui n'existe pas |
| En-tête | `GENERATED FILE — DO NOT EDIT.` + la source de vérité + la commande qui le refait (Principe IV) |

### Le préfixe

Un préfixe court, sans ambiguïté, qui n'existe ni chez Odoo ni chez son cadre CSS. `research.md`
§D11/P2 **exclut** `o-` (convention d'Odoo) et `bs-` (nom que Bootstrap portait avant qu'Odoo ne
force `$variable-prefix: ''` — le réintroduire serait un piège de lecture) **sans nommer le
retenu** : le choix définitif est tranché dans le chantier par **T006**, qui consigne son relevé de
non-collision dans `proofs/prefixe-non-collision.md`. `plan.md` et `quickstart.md` emploient tous
deux le nom de fichier `tokens.pqr.css`, donc le candidat est `--pqr-` — mais c'est T006 qui le
décide et qui le prouve, pas ce document.

**Ce que le préfixe protège** : nos noms actuels sont génériques (`--color-…`, `--space-…`,
`--font-size-…`). Publier ces noms-là sur une page Odoo, c'est parier qu'aucun tiers ne les
utilise — un pari qu'on ne peut pas gagner et qu'on n'a pas besoin de prendre.

## 4. Invariants — chacun refusé PAR NOM par l'eval

| # | Invariant | Ce qui le rend faux |
|---|---|---|
| I1 | **Additivité stricte** | `src/styles/tokens.css`, `tokens.dark.css`, `tokens.brands.css` diffèrent d'un seul octet après le changement |
| I2 | **Déterminisme** (Principe I) | deux exécutions consécutives ne donnent pas le même fichier au byte près |
| I3 | **Préfixe total** | une seule déclaration sans le préfixe |
| I4 | **Couverture** | une propriété de `:root` de `tokens.css` sans sa contrepartie préfixée, ou l'inverse |
| I5 | **Dérivation, pas transcription** | modifier une valeur dans `tokens/*.tokens.json` ne change **pas** la sortie Odoo en conséquence — c'est le contrôle adversarial : il distingue « généré » de « recopié une fois » |
| I6 | **En-tête présent** | pas de marque `GENERATED — DO NOT EDIT` ni de commande de régénération |
| I7 | **Alias non résolvable refusé** | le build passe alors qu'un alias pointe dans le vide (le pipeline refuse déjà ; la 4ᵉ sortie ne doit pas ouvrir une porte de sortie) |

## 5. Ce que cette sortie **ne** fait **pas**

- Elle **n'alimente pas** les variables de thème d'Odoo. Aucun FR ne le demande, la chaîne des
  trois composants n'en a pas besoin, et l'ajouter fabriquerait une sortie de plus que personne
  n'a spécifiée. C'est un **non-porté nommé** de cette spec, pas un oubli : le squelette du site
  (en-tête, menu, pied de page) reste habillé par Odoo, comme FR-007 l'exige.
- Elle **ne lit aucun contrat**. Elle ne connaît que `tokens/`. Les valeurs qu'un contrat porte en
  **littéral** ne passent donc pas par elle — c'est le sujet du §6.
- Elle **n'entre pas** dans `evals/golden.json` : `scripts/update-golden.mjs` ne parcourt que
  `src/` et `figma-sync/*.js`. Son déterminisme est prouvé par son eval dédiée, pas par le
  manifeste golden.

## 6. Le point de friction connu — les littéraux typographiques

Mesuré le 2026-08-06 **avant la fusion de `main`** (research.md §D1) et donc **à re-relever en
T004** : sur l'état d'alors, la chaîne portait **4 valeurs littérales actives**, toutes
typographiques. Vérifié sur `main` : `font.letter-spacing` n'y contient toujours que `15`, donc la
décision ci-dessous survit à la fusion — mais le **compte** se re-relève, il ne se recopie pas.

| Littéral | Contrat / part | Token de même valeur |
|---|---|---|
| `line-height: 24px` | `ds.presentation` / `wrapper.Texte` | `font.line-height.24` ✅ |
| `line-height: 25px` | `ds.section-header` / `Accroche` | `font.line-height.25` ✅ |
| `line-height: 40px` | `ds.section-header` / `Titre` (emphase `moyen`) | `font.line-height.40` ✅ |
| `letter-spacing: 3px` | `ds.section-header` / `Accroche` | **aucun** — `font.letter-spacing` ne contient que `15` ❌ |

Ces littéraux sont **légitimes** et documentés comme tels : la porte de 015
(`geometry-gate.interface.md` §2) gouverne un ensemble **fermé** de canaux de **mise en page**
(`width`, `height`, `min-*`, `gap`, `padding-*`, + `background-image` en exception), et la
typographie n'y est pas. Le `RAPPORT-CLOTURE.md` de 015 le dit (« ce que « 0 » ne dit pas ») et
`ROADMAP.md` le range dans le travail non assigné (« 89 littéraux de trait, peinture et
typographie restent hors périmètre gouverné »).

**Conséquence pour cette sortie** : trois des quatre littéraux se rendent en référence de token
sans rien inventer. Le quatrième — `letter-spacing: 3px` — est le seul endroit de toute la spec
où FR-005 et SC-003 se touchent réellement. `research.md` **§D4** tranche ce point, avec ses
alternatives et leur coût, et `spec.md` en porte désormais la conséquence : FR-005 et SC-003 sont
écrits en « **0 valeur invisible** », le littéral étant nommé au registre local du module, épinglé
byte-à-byte contre son contrat et **compté à part**. Ce contrat d'interface n'a pas à le trancher,
il a à ne pas le cacher.
