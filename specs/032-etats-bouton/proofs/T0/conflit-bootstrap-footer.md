# Défaut PRÉDIT avant écriture : le CTA du pied de page devient blanc sur blanc au survol

**Date** : 2026-09-04 · **Trouvé** : par arithmétique de spécificité, avant qu'une
seule ligne de la vague soit écrite · **Origine** : renseignement de
`oceanic-oak-f2` sur le conflit Bootstrap des titres, poussé jusqu'à son
implication pour les états du Bouton.

## Le fait

`oceanic-oak-f2` a rencontré, sur SA vague, une règle Odoo (`.o_footer h4`,
spécificité 0,1,1) qui battait une classe de part (0,1,0) et rendait un titre
invisible (contraste mesuré 1,23). Le même mécanisme frappe la vague 032, **plus
fort**, et sur un autre canal.

## L'arithmétique

Sélecteur d'état émis (`core/emit-html.ts:74`, `STATE_SELECTORS.hover`) :

    .button--variant-outlineBlanc:hover:not(:disabled)
      .button--variant-outlineBlanc  (0,1,0)
      :hover                         (0,1,0)
      :not(:disabled)                (0,1,0)   ← :not() prend la spécificité de son argument
                                     = (0,3,0)

Règle (3) de la zone `ODOO-023-FOOTER-BRIDGE`
(`odoo-bridge.css:350`), qui existe déjà et défend la couleur de REPOS du CTA
contre la couleur de lien de Bootstrap :

    .footer[data-pqr-shell="footer"] a.button
      .footer                        (0,1,0)
      [data-pqr-shell="footer"]      (0,1,0)
      a                              (0,0,1)
      .button                        (0,1,0)
                                     = (0,3,1)

**(0,3,1) bat (0,3,0)** sur le canal `color`. La règle du pont gagne.

## La conséquence, et pourquoi elle est pire que celle de leur vague

Le CTA du pied de page est en style **`outlineBlanc`** — vérifié dans le
contrat, pas supposé : `contracts/footer.contract.json`,
`anatomy.root.parts.Row.parts.col1.parts.Bouton` →
`{"id": "ds.button", "props": {"variant": "outlineBlanc"}}`.

Il est rendu en `<a>` : `views/components.xml:157` bascule sur une ancre dès que
`link_href` est posé — c'est précisément la raison d'être de la règle (3).

La matrice arrêtée de la vague donne pour `outlineBlanc` :

| canal | jeton | valeur |
|---|---|---|
| `fond-survol` | `color.blanc` | `#FFFFFF` |
| `libelle-survol` | `color.noir-bleute` | `#26282C` |

Au survol, ma règle peindra donc le **fond en blanc** — `background-color` n'est
pas revendiqué par la règle (3), elle passe. Mais le **libellé restera blanc**,
épinglé par la règle (3) qui gagne.

> **Blanc sur blanc. Contraste 1,00. Le libellé disparaît au survol.**

Leur titre tombait à 1,23 ; celui-ci tombe à 1,00 — le plancher absolu.

## Ce que ça viole

- **FR-001** : « un changement perceptible sur les 7 styles ». Ici le changement
  est perceptible mais il EFFACE le libellé.
- **FR-019 tel qu'arbitré** : « un état ne doit jamais être moins lisible que le
  repos ». Le repos d'`outlineBlanc` est à 14,76. Tomber à 1,00 est la
  régression exacte que FR-019 interdit.

## Le correctif, et pourquoi il n'invente rien

Le patron existe déjà **deux fois** dans la même zone : la règle (3) pour le
bouton, la règle (5) pour le titre, toutes deux décrites en tête de zone comme
« reprend le canal du contrat avec une spécificité gagnante ». La zone se
déclare elle-même « aucune valeur de design dupliquée, uniquement des
neutralisations de conflits Bootstrap/Odoo ».

Le correctif est donc une règle (6) de la même zone, qui reprend le canal
`libelle-survol` du contrat — **par la variable de jeton, jamais par une valeur
littérale** — avec une spécificité supérieure à (0,3,1).

Ce n'est PAS une règle d'état écrite à la main au sens de FR-011/SC-004 : c'est
une neutralisation de conflit qui **re-porte** le canal gouverné, exactement
comme (3) et (5). La distinction est celle que la zone pose elle-même, et elle
sera écrite au rapport de clôture.

## Ce qui reste à MESURER, pas à déduire

Cette note est une **prédiction par arithmétique**, pas un relevé. Elle sera
confirmée ou infirmée sur la page vive :

- **T032/T036** relèvent déjà la couleur **calculée** par `getComputedStyle`.
  C'est le bon instrument et il est déjà au plan.
- La méthode que `oceanic-oak-f2` recommande — lister les règles qui matchent
  via `el.matches(rule.selectorText)` sur `document.styleSheets` — sera employée
  pour nommer la règle gagnante plutôt que la deviner.

**Si la mesure contredit cette note, c'est la mesure qui gagne** et la note est
corrigée, pas défendue.

## À contrôler en même temps, même mécanisme

1. **`:active`** — même spécificité (0,3,0), même défaite. `libelle-presse`
   d'`outlineBlanc` est aussi `noir-bleute` : même défaut au pressé.
2. **`:focus-visible`** — `.button--variant-X:focus-visible` = (0,2,0), plus
   faible encore, MAIS il ne porte que `outline-color` / `outline-width`, deux
   canaux que la règle (3) ne revendique pas. **Pas de conflit attendu.**
3. **La zone `.o_cc2`** — `oceanic-oak-f2` a mesuré qu'Odoo ne pose de règle de
   couleur de titre que dans `.o_footer` et `.o_cc2`. À vérifier pour les
   boutons : quels styles de bouton se posent dans `.o_cc2`, et une règle de
   lien Bootstrap y bat-elle nos états ?
4. **Les autres CTA en `<a>`** — tout bouton porteur d'un `link_href` prend
   `a.button` ; seul le pied de page a aujourd'hui une règle de pont qui
   revendique `color`, mais le balayage de T032 couvre les 7 styles sur la home.
