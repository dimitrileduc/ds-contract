# Lot `U1a-variables` — ANNONCE

**Écrite le 2026-08-05, AVANT toute écriture.** · Point de restauration :
`016/U1a-variables/avant` → `versionId 2384251202054787848`

**Geste** : exécuter `figma-sync/01-tokens.js` **tel quel** via `figma_execute`
(script généré par `npm run build`, upsert idempotent — aucune IA, aucun code nouveau, D1).

---

## Écart visuel attendu : **`identique` sur les 9 maquettes — zéro pixel**

C'est l'annonce la plus forte du chantier : **tout pixel qui bouge est, par construction,
un écart imprévu** et annule le lot en entier (T055).

Trois raisons, chacune vérifiée au vif — pas déduites :

1. **Une variable créée ne peint rien.** Créer une variable n'attache rien à un nœud ;
   les liaisons `setBoundVariable` sont le travail de U1b, avec la régénération US3 (D2).
2. **La seule valeur modifiée n'est liée à aucun nœud.** `font/family/montserrat` passe
   de `"Montserrat"` à `"Montserrat, sans-serif"` — relevé vif : **0 nœud lié** sur
   **1273 TEXT** parcourus (853 portent pourtant une liaison de variable, donc le relevé
   n'est pas un faux négatif).
3. **`scopes` et `codeSyntax` ne rendent rien.** Ils pilotent les sélecteurs de l'UI Figma
   et l'export de code, jamais le rendu.

## Ce que le script va faire, nom par nom (simulation en lecture — `U1a-simulation.json`)

### Collection `Primitives`, mode `Value` — 67 vives → 150

| Effet | Compte | Détail |
|---|---:|---|
| **CRÉATIONS** | **83** | **77 `size/*` + 6 `space/*`** — l'objet du lot |
| Mise à jour de **valeur** | **1** | `font/family/montserrat` : `"Montserrat"` → `"Montserrat, sans-serif"` |
| Mise à jour de **codeSyntax** | 5 | `color/rouge`, `color/gris-clair`, `color/noir-pur`, `font/line-height/32`, `space/597` — toutes à `null` aujourd'hui |
| Mise à jour de **scopes** | 4 | `color/{rouge,gris-clair,noir-pur}` : `ALL_SCOPES` → `[ALL_FILLS, STROKE_COLOR]` ; `font/line-height/32` : `[LINE_HEIGHT]` → `ALL_SCOPES` |
| Variables vives **hors script** | **0** | rien ne devient orphelin, rien n'est supprimé |

Les 6 `space/*` créés : `space/2`, `space/3`, `space/11`, `space/14`, `space/22`, `space/47`.

> **Piège écarté** : une comparaison naïve annonçait « 16 mises à jour de valeur », dont
> 15 couleurs. Faux — le script convertit lui-même le hex en RGBA (`hexToRgb`), et les 15
> couleurs sont **identiques** à 1/255 près. Une annonce fondée sur ce chiffre aurait fait
> juger le lot sur une base fausse. Vérification refaite avec conversion : **1** seule
> vraie mise à jour de valeur.

### Collection `Semantic`, mode `Light` — 72 vives → 72

**0 création.** Les 72 alias, scopes et codeSyntax sont ré-appliqués à l'identique
(c'est le propre d'un upsert). Aucune variable vive hors script.

### Ce que le script ne fera PAS

| | Pourquoi |
|---|---|
| Collection `Brand` | `BRAND = []` — aucun token de marque ; T037c interdit d'inventer une collection vide |
| Mode `Dark` | `SEMANTIC_HAS_DARK = false` — un système mono-thème synchronise un seul mode |
| Styles de texte | `TEXT_STYLES = []` — les **18** styles locaux du fichier portent **0** marqueur `ds_contracts/textStyleToken` : aucun ne sera touché |
| Suppression | Le script n'en fait aucune : un objet vivant hors script est laissé et rapporté, jamais effacé |

## Effet de bord bénéfique — annoncé, pas subi

La mise à jour de `font/family/montserrat` **éteint un fait acquitté** :
`figma-tokens|mismatch|Primitives/font/family/montserrat [Value]`, l'un des 6 résiduels
hors géométrie relevés en T007.

Ni `plan.md`, ni `research.md`, ni `tasks.md` ne l'avaient prévu. Conséquence à traiter :
**T017 retire les 83 entrées de géométrie « et elles seules »** — l'acquittement montserrat
restera donc dans `parity/baseline.json` alors que le fait qu'il couvre aura disparu.
C'est un acquittement devenu sans objet, à retirer en **T072** (re-justification ligne par
ligne), avec cette annonce pour reçu. Il n'est **pas** retiré en T017 : la règle « on retire
un acquittement parce que le fait a disparu » impose de le constater d'abord sur cliché frais.

## Cibles capturées

Les **9 maquettes** de la page `Pages` (`210:325`) — périmètre `proofs/00-perimetre.json`.

Les **58 masters** des pages DS ne sont pas capturés pour ce lot : aucun geste ne les
touche (le script n'écrit que dans les collections de variables, jamais sur un nœud), et
l'annonce « zéro pixel » se vérifie sur les maquettes, qui instancient tout. Réduction
**délibérée et nommée**, conforme à §X qui exige la capture de *toutes les cibles du lot*
— pas de tout le fichier.

**Passe de préchauffage obligatoire** avant la capture AVANT (règle O-3, `decisions.md`) :
le premier jeu d'une session ne fait jamais foi.

## Critère de verdict

| Verdict | Condition |
|---|---|
| `conforme` | `pages:compare` → **9/9 `identical`** ET rapport du script = 83 créations / 1 MAJ de valeur |
| `annulé` | tout autre résultat — restauration manuelle guidée depuis `016/U1a-variables/avant`, cause écrite avant reprise (`PROCEDURE-ANNULATION.md`) |
