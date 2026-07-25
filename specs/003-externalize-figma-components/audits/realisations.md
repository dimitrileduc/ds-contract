# Audit — Section Réalisations (T095)

**Date** : 2026-07-25
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console, lecture live par position sur les 3 pages concernées.
**Dépendance DAG** : Gallery-item (T066, déjà adopté) — satisfaite, la grille imbriquée réutilise
les instances gouvernées existantes.

## Reprise après interruption d'infrastructure (nommé, pas silencieux)

Cette tâche a été construite en deux passes, toutes deux interrompues par une erreur
d'infrastructure réelle (« API Error: Connection closed / Response stalled mid-stream »),
jamais une erreur de raisonnement de l'agent constructeur :

1. **1re passe** : master partiellement construit — un `COMPONENT` isolé (`2116:4672`, nommé
   comme une variante `En-tête=Accroche`) jamais combiné en `COMPONENT_SET`, aucune adoption.
   Interrompue avant tout geste risqué (before-captures des 3 pages déjà banquées et valides).
2. **2e passe (reprise)** : le composant isolé a été réutilisé (pas reconstruit, règle
   anti-fork), combiné avec un 2e variant construit (`En-tête=Presentation`), les 3 pages
   adoptées. Interrompue à nouveau après l'adoption, avant la doc et le commit.
3. **Revue Fable indépendante** : a trouvé une **régression réelle** sur l'instance
   Portes de garage résidentielles (voir ci-dessous) — pas maquillée, remontée avec diagnostic
   complet et le texte source déjà retranscrit depuis la capture `before`.
4. **Correction** : appliquée directement par l'orchestrateur (`main`), texte restauré,
   revérifiée par capture fraîche + `pages:compare` + inspection visuelle du crop réel.

## Usage — localisation par position (les 3 pages)

**3 occurrences**, toutes déjà `Réalisations` (FRAME, structure cohérente à l'audit) :

| Maquette | nodeId source | Header | Grille |
|---|---|---|---|
| Portes d'entrée | `237:1066` (1728×1534) | instance Section-header gouvernée (`2093:2410`) | 9× Gallery-item (1 Grand + 8 Petit) |
| Portes de garage industrielles | `387:787` (1728×1551) | FRAME brut `Présentation` (1319×100) | idem |
| Portes de garage résidentielles | `230:614` (1728×1551) | FRAME brut `Présentation` (1319×100) | idem |

**Trouvaille clé — les 2 headers bruts « Présentation » industrielles/résidentielles ne sont
PAS identiques entre eux** (enfant `wrapper` vs `text`, textes distincts, gras riche par
plage différente sur chacun) — vraie variation, pas une incohérence à corriger. D'où le
choix de propriété `En-tête` à 2 valeurs (`Accroche` = structure Portes d'entrée,
`Presentation` = structure industrielles/résidentielles) plutôt qu'un contenu uniforme.

## Structure (grille, commune aux 3)

```
Réalisations (FRAME)
 ├ En-tête (Section-header gouverné OU FRAME Présentation selon variante)
 └ grid (FRAME) — 9× instance Réalisation (master Gallery-item, T066)
    ├ 1× Taille=Grand (743×743)
    └ 8× Taille=Petit (340×340)
```

## Construction — le master livré

`DS · Molécules` → section **Réalisations** (`2116:4659`, à `0,16120`, 3700×1850) →
`COMPONENT_SET` **Réalisations** (`2117:4691`), propriété `En-tête` × 2 valeurs :
- `Accroche` (`2116:4672`) — clone verbatim de Portes d'entrée, header = instance
  Section-header gouvernée.
- `Presentation` (`2117:4690`) — clone verbatim d'industrielles, header = contenu natif
  (texte riche par plage, comme Hero/Devis — pas de propriété TEXTE formelle, le gras
  mixte se serait aplati au binding, précédent déjà documenté plusieurs fois cette spec).

**Zéro dépendance tierce** : grille + Section-header + glyphes, tous `remote:false`.

## Adoption (T096) — 3 instances

| Maquette | Instance | Variante | Overrides |
|---|---|---|---|
| Portes d'entrée | `2118:4722` | `Accroche` | 0 (contenu = défaut de la variante, page ancre) |
| Portes de garage industrielles | `2118:4736` | `Presentation` | 9× `fills` (photos de grille) |
| Portes de garage résidentielles | `2118:4751` | `Presentation` | 9× `fills` (photos) + **2× texte** (voir incident) |

Adoption par remplacement du FRAME brut par l'instance, bbox delta `{0,0,0,0}` sur les 3.

## Incident — régression de contenu trouvée par la revue, corrigée (nommé, pas silencieux)

**La 2e passe de construction a overridé les 9 photos de Portes de garage résidentielles
mais a oublié les 2 overrides de texte du header** — l'instance affichait donc les
valeurs par défaut de la variante `Presentation` (= le texte d'industrielles) au lieu du
texte réel de résidentielles. Trouvé par la revue Fable via un diff pixel réel dans la
zone exacte du header (13 860 px, pas un chiffre agrégé — la zone photo était pixel-parfaite,
seule la bande texte différait), confirmé en lisant l'instance en direct (9 overrides
`fills`, 0 override texte) et en comparant au texte de la capture `before`.

**Texte restauré** (transcrit depuis la capture `before`, gras par plage reconstruit à
l'identique du patron industrielles — vérifié par lecture fraîche séparée après la
mutation, piège couleur/texte déjà documenté cette nuit) :
- Titre : « Quelques **réalisations et installations** de qualité »
- Texte : « Personnalisez votre porte grâce à **un choix illimité de teintes RAL**,
  parfaitement harmonisées avec la couleur de vos châssis. Appliquée dans notre cabine de
  peinture, la finition bi-composants garantit une excellente tenue dans le temps, avec
  **10 ans de garantie sur les panneaux**. »

**Limite honnête** : le texte restauré vient d'une image (capture `before`), pas d'une
relecture de nœud Figma live — la copie brute source a été remplacée avant que ce texte
ne soit lu en direct. Le contenu visible est fidèle (vérifié par comparaison pixel avant/
après : diffCount tombé de 13 860 à 70, dans l'enveloppe déjà acceptée ailleurs), mais la
fidélité au caractère invisible près (espace en fin de chaîne, etc.) ne peut pas être
garantie avec la même certitude qu'une lecture `.characters` en direct — nommé ici, comme
la limite déjà documentée sur d'autres cas cette nuit.

**Smell d'architecture noté pour un futur ménage (pas corrigé ce soir)** : le header de la
variante `Presentation` porte du texte natif alors qu'un master **Présentation** gouverné
existe déjà (`2103:2824`, propriétés TEXTE `Titre`/`Texte`, T071) — une adoption par
propriétés officielles aurait rendu cet oubli structurellement impossible (une propriété
manquante se remarque, un override manquant sur du contenu natif ne se remarque pas sans
diff pixel). Piste pour une prochaine passe, pas une action de ce soir.

## Preuve pixel — après correction

| Maquette | diffCount | Lecture |
|---|---|---|
| Portes d'entrée | 0 (`identical`) | page ancre, 0 override |
| Portes de garage industrielles | 31 | AA sous-pixel (re-rasterisation frame→instance d'une ligne de titre), zoom 3× confirmé glyphes identiques |
| Portes de garage résidentielles | 70 | **après correction** — descendu de 13 860 (régression) à 70 (même famille de bruit qu'industrielles) |

Les deux résidus (31, 70 px) sont dans l'enveloppe de bruit déjà acceptée cette spec
(bien en-dessous de 2 %, sur des pages de ~1,7-2,8 millions de pixels chacune).

## Récapitulatif

| Élément | Détail |
|---|---|
| Master | `Réalisations` (`2117:4691`), COMPONENT_SET, propriété `En-tête` (Accroche/Presentation) |
| Section | `Réalisations` (`2116:4659`), `DS · Molécules`, à `0,16120` |
| Dépendances | Gallery-item (T066), Section-header — toutes locales, zéro tierce |
| Incident | Régression de contenu (texte manquant sur résidentielles), trouvée par revue indépendante, corrigée et reverifiée |
