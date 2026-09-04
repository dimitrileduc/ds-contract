# T036b — le conflit Bootstrap du pied de page : prédit, MESURÉ, corrigé

**Date** : 2026-09-04 · **Instance** : `piqueray-odoo-pilote`, port 8087 (jetable)

## 1. La prédiction

Écrite avant qu'une ligne soit posée (`proofs/T0/conflit-bootstrap-footer.md`),
par arithmétique de spécificité : le CTA du pied de page — style `outlineBlanc`,
rendu en `<a>` — verrait son fond passer au blanc au survol pendant que son
libellé resterait blanc, épinglé par une règle du pont de spécificité supérieure.
**Blanc sur blanc, contraste 1,00.**

## 2. La mesure

Relevé sur la page vive : couleur **calculée** (`getComputedStyle`) et règles
gagnantes nommées par `el.matches()` sur `document.styleSheets`, jamais par
lecture du CSS généré.

    #18  outlineBlanc  <a>  dans .o_footer
      repos   color rgb(255,255,255)  bg rgba(0,0,0,0)      contraste 14,76
      survol  color rgb(255,255,255)  bg rgb(255,255,255)   contraste  1,00   <-- effacé
      pressé  color rgb(255,255,255)  bg rgb(224,224,224)   contraste  1,20

Toutes les règles qui revendiquent `color` sur ce nœud, dans l'ordre de source :

| ordre | spécificité | sélecteur | valeur |
|---|---|---|---|
| 44 | 0,0,1 | `a` | couleur de lien Bootstrap |
| 4962 | 0,2,1 | `.o_footer a:not(.btn)` | `rgb(88,59,81)` |
| 4963 | **0,3,1** | `.o_footer a:not(.btn):hover` | `rgb(67,44,61)` |
| 6195 | 0,1,0 | `.button` | `--pqr-color-blanc` |
| 6215 | **0,3,0** | `.button--variant-outlineBlanc:hover:not(:disabled)` | `--pqr-color-etat-outlineBlanc-libelle-survol` |
| 6998 | **0,3,1** | `.footer[data-pqr-shell="footer"] a.button` | `--pqr-color-blanc` |

**Verdict : la prédiction était juste**, mécanisme et résultat compris. La règle
gagnante est bien la règle (3) du pont, à 0,3,1 contre 0,3,0 pour la règle
d'état.

**Un point que la prédiction n'avait PAS vu**, et il change le correctif : un
SECOND prétendant existe à la même spécificité 0,3,1, `.o_footer a:not(.btn):hover`,
qui vient d'Odoo et pose `#432C3D`. À spécificité égale, c'est la dernière source
qui gagne — donc (3). **Conséquence : neutraliser (3) pendant les états n'aurait
pas suffi** ; Odoo aurait repris la main avec une couleur non gouvernée. Le
correctif devait battre les DEUX.

## 3. Le correctif

Règle (6) de la zone `ODOO-023-FOOTER-BRIDGE`, sur le patron déjà employé par
(2), (3) et (5) — « reprendre le canal du contrat avec une spécificité
gagnante » :

    .footer[data-pqr-shell="footer"] a.button--variant-<style>:hover:not(:disabled)
      { color: var(--pqr-color-etat-<style>-libelle-survol); }
    .footer[data-pqr-shell="footer"] a.button--variant-<style>:active:not(:disabled)
      { color: var(--pqr-color-etat-<style>-libelle-presse); }

Spécificité **0,5,1** : elle bat les deux prétendants à 0,3,1.

Trois choix, et leur raison :

1. **Par la variable de jeton, jamais une valeur littérale.** Aucune couleur
   n'est dupliquée : la règle re-porte le canal gouverné, elle ne le redéfinit
   pas. Si la matrice change, cette règle suit sans être touchée.
2. **Les sept styles sont couverts** alors qu'un seul est aujourd'hui posé dans
   le pied. C'est délibéré : aucune porte ne surveille ce conflit, donc un
   changement de style du CTA ferait revenir le défaut **en silence**. Quatorze
   règles courtes valent mieux qu'une régression invisible.
3. **Ce n'est pas une règle d'état écrite à la main** au sens de l'exigence
   « aucune règle d'état manuelle ». C'est une neutralisation de conflit
   Bootstrap qui re-porte un canal gouverné — exactement ce que (2), (3) et (5)
   font déjà, et ce que l'en-tête de la zone déclare comme sa raison d'être.
   La distinction est portée au rapport de clôture, pas dissimulée.

## 4. Après correctif — mesuré à nouveau

    #18  outlineBlanc
      repos   color rgb(255,255,255)  bg rgba(0,0,0,0)      contraste 14,76
      survol  color rgb( 38, 40, 44)  bg rgb(255,255,255)   contraste 14,76
      pressé  color rgb( 38, 40, 44)  bg rgb(224,224,224)   contraste 11,18

Ce sont **exactement** les trois valeurs que le registre de la matrice prévoit
pour `outlineBlanc` (14,76 / 14,76 / 11,18).

Le compte de boutons « dont le libellé ne bouge pas au survol » passe de **3 à 2**.
Les deux restants sont légitimes et vérifiés comme tels : `blanc` (#0) et
`default` (#5) ont, PAR LA MATRICE, un `libelle-survol` identique à leur couleur
de repos — leur fond change, leur libellé non, c'est le dessin voulu.

## 5. Ce qui reste ouvert, nommé

- **`.o_cc2`** — l'autre zone où Odoo colore, signalée par la session
  `oceanic-oak-f2`. Aucun bouton de la home n'y est posé aujourd'hui : rien à
  mesurer, donc rien de prouvé. Si un bouton y arrive, le même conflit est à
  attendre.
- **Aucune porte ne surveille ce type de conflit.** `parity` compare le contrat
  au code et au canevas ; il ne rend aucune page Odoo et ne connaît pas la
  cascade CSS d'Odoo. La seule défense est une mesure comme celle-ci, faite à la
  main. À verser au registre de travail différé.
- **Le style `orange` n'est sur aucune page de la home** : ses contrastes
  (2,42 → 2,98 → 3,74) restent une prévision de la matrice, non un relevé.
