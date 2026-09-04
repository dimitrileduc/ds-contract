# Défaut du générateur trouvé AVANT d'écrire : un alias dans la couche `primitives` devient une couleur NaN

**Date** : 2026-09-04 · **Trouvé en lisant `figma-sync/01-tokens.js` avant de l'exécuter.**

## Ce qui aurait été écrit sur le canevas

La vague plaçait les 35 alias `color.etat.<style>.<canal>` dans
`tokens/primitives.tokens.json`, comme le modèle de données de la spec le
demandait. Le script de sync généré traite la couche primitive ainsi
(`01-tokens.js`, boucle `for (const t of PRIMITIVES)`) :

    v.setValueForMode(primModeId, t.type === 'COLOR' ? hexToRgb(t.value) : t.value);

**Il n'y a aucun test d'alias dans cette boucle.** `hexToRgb` reçoit donc
`"{color.noir-bleute-survol}"`, retire un `#` qui n'existe pas, et fait
`parseInt("{c", 16)`.

Vérifié par exécution dans le bac à sable Figma, sans aucune mutation :

    hexToRgb('#404245')                     -> { r: 0.2509…, g: 0.2588…, b: 0.2705… }
    hexToRgb('{color.noir-bleute-survol}')  -> { r: NaN, g: NaN, b: NaN }

Lancer le script tel quel aurait posé **35 variables de couleur invalides** sur
le fichier de l'owner. Silencieusement : aucune exception, `setValueForMode`
accepte l'objet.

## La cause

Le générateur ne gère les alias que dans **deux** boucles, `BRAND` et
`SEMANTIC`, où il les résout en `{ type: 'VARIABLE_ALIAS', id: cible.id }`.
La couche `primitives` est traitée comme purement littérale — ce qui est
cohérent avec sa définition (les primitives sont les valeurs de base) mais
n'est **écrit nulle part** et n'est **refusé nulle part**.

## Le correctif retenu, et pourquoi celui-là

Les 35 alias ont été **déplacés vers `tokens/semantic.tokens.json`**. Les 7
primitives littérales (`noir-bleute-survol`, etc.) restent dans
`primitives.tokens.json`.

C'est la bonne couche par la doctrine du dépôt elle-même : primitives →
alias sémantiques → modes. Un « fond de survol du style Blanc » est un RÔLE qui
pointe vers une valeur, pas une valeur.

Deux propriétés vérifiées après le déplacement, et c'est ce qui rend le
correctif sûr :

1. **Le nom de la variable CSS est inchangé** — `--color-etat-<style>-<canal>`,
   parce qu'il dérive du chemin et que le chemin n'a pas bougé.
   Conséquence : `src/components/Button/Button.module.css` est **identique**
   avant et après le déplacement (150 insertions, 1 suppression, les mêmes).
2. **Le repos n'a toujours pas bougé** — les 7 styles re-rendus et comparés au
   PNG d'origine : `identical`, `diffCount 0`, sur les 7.

Le générateur émet maintenant, pour chaque alias :

    { "name": "color/etat/default/fond-survol", "type": "COLOR",
      "light": "color/noir-bleute-survol", … }

que la boucle `SEMANTIC` résout en un vrai `VARIABLE_ALIAS`.

## Contrôle sur le canevas après écriture

    7 primitives  : valeurs exactes, aucune NaN
                    #404245 #4A4D51 #E07C0A #C76D09 #CFCFCF #FFFFFF00 #131416
    35 alias      : 35 en VARIABLE_ALIAS, 0 peinte en dur
                    ex. color/etat/default/fond-survol -> color/noir-bleute-survol

Collections après : Primitives 193 → **200** (+7), Semantic 83 → **118** (+35).

## Ce que ça laisse ouvert

**Rien ne refuse un alias dans la couche primitive.** Ni le build de jetons (il
résout l'alias correctement pour le CSS), ni `emitters:check`, ni la parité.
Seule la lecture du code l'a attrapé. Un futur contributeur qui écrit un alias
dans `primitives.tokens.json` peindra des variables NaN sur le canevas sans
qu'aucune porte ne le prévienne.

À verser au registre de travail différé : soit le générateur résout les alias
dans la couche primitive, soit il **refuse par nom** — mais le silence actuel
est le pire des trois.
