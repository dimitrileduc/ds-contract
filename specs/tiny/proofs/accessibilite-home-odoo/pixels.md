# Preuve pixel — la balise change, l'apparence non

**Méthode.** Chaque contrat est émis DEUX fois par `core/emit-html.ts` dans le même
processus : une fois tel quel, une fois avec la seule clé `element` retirée de la partie
titre. Les deux sorties sont rendues dans Chromium et comparées par `pixelmatch`.
Cette méthode isole EXACTEMENT la modification de cette vague — une comparaison contre
`HEAD` aurait mélangé les autres travaux non committés du worktree (mesuré : jusqu'à
82 645 pixels d'écart, tous étrangers à cette vague).

**Écart CSS observé.** Exactement UNE ligne ajoutée par composant, `margin: 0`, sauf
`reassurances` et `google-reviews` qui la portaient déjà (0 ligne). Aucune autre règle
ne change. La remise à zéro annule la marge que le navigateur applique d'office à un
titre et que le `<span>` n'avait pas : le résultat visuel est donc identique par
construction, et la mesure le confirme.

| Composant | 390 | 768 | 1280 | 1920 |
|---|---|---|---|---|
| hero-video | 0 | 0 | 0 | 0 |
| presentation | 0 | 0 | 0 | 0 |
| sav | 0 | 0 | 0 | 0 |
| devis | 0 | 0 | 0 | 0 |
| produits-ecommerce | 0 | 0 | 0 | 0 |
| reassurances | 0 | 0 | 0 | 0 |
| google-reviews | 0 | 0 | 0 | 0 |
| carte-categorie | 0 | 0 | 0 | 0 |
| carte | 0 | 0 | 0 | 0 |
| footer | 0 | 0 | 0 | 0 |

**Pire écart : 0 pixel.**
