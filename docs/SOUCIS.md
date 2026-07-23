# Diff pixel du Button — variante par variante

Comparaison ton code ↔ Figma, pour chacune des 6 variantes. Seuil de réussite : 2 %.
État au **23 juillet 2026, après les fixes** (bordure dedans, fond natif neutralisé,
hauteur du Link, flèche portée au contrat). Image de diff :
`extract/figma/visual-parity/report-assets/button--property-1-*.triptych.png`.

> **Ce qui a été corrigé depuis la version précédente de ce document :**
> 1. **La bordure est maintenant dessinée à l'intérieur** (comme Figma) — via une
>    ombre interne pilotée par variables, le CSS ne grossit plus la boîte.
>    Outilne noir : 21,32 % → 2,53 %. Outline blanc : taille exacte retrouvée.
> 2. **Le fond gris parasite a disparu** — c'était le fond natif des `<button>`
>    du navigateur, jamais neutralisé ; le générateur le reset désormais.
> 3. **Le Link a la bonne hauteur** — 24 device px, identique à Figma (avant : 60).
> 4. **La flèche du Link est rendue** — portée au contrat (v1.1.0, asset exporté
>    du fichier). Étape provisoire : visible sur Link seulement ; le passage à
>    l'interrupteur « Flèche » (booléen, toutes variantes — l'usage réel constaté :
>    53 boutons sur 79 dans les maquettes) se fera côté Figma puis ré-extraction.

---

## Default — 1,31 % ✅ passe

- **Taille** : 436×108 vs Figma 440×108 → **2px CSS de moins en largeur**.
- **Le souci** : le **kerning**. Chromium resserre certaines paires de lettres de
  Montserrat, Figma non. « CONTACTEZ-NOUS » est donc plus étroit, le bouton suit.
- **Verdict** : différence de rendu de texte entre deux moteurs, pas un défaut.
  Sous le seuil. **Rien à corriger** (couper le kerning dégraderait la typo pour rien).

## Orange — 1,31 % ✅ passe

- **Identique à Default.** Même bouton, autre fond. Rien à corriger.

## Blanc — 0,00 % masqué ✅ passe

- Fond blanc, texte foncé, pas de bordure : le seul écart est le texte (kerning),
  et le masque de texte l'absorbe. **Rien à corriger.**

## Outline blanc — 0,00 % ✅ passe (chiffre à lire avec prudence)

- **La bordure est maintenant dedans et la taille est exacte** (436×108 vs 440×108,
  reste le kerning). Le vrai défaut d'avant est corrigé.
- **Prudence** : le comparateur sous-compte toujours l'encre blanche sur fond
  transparent — le 0,00 % est aidé par ça. La preuve de la correction est ailleurs :
  la taille exacte, et Outilne noir (même bordure, encre foncée) tombé à 2,53 %.

## Link — 8,25 % masqué ✗ échoue (cause unique : le kerning déplace la flèche)

- **Taille** : 366×24 vs 370×24 → hauteur **exacte**, largeur -4 device px (kerning).
- **Ce que montre le diff** : les lettres n'ont qu'un liseré d'anti-aliasing
  (bruit normal) ; la **flèche a un cœur rouge plein** — les deux flèches ne se
  recouvrent presque pas.
- **Le mécanisme** : le texte est ~4px plus étroit chez Chromium, et la flèche est
  posée **après** le texte → elle encaisse tout l'écart. Un trait fin en diagonale
  ne se recouvre presque plus sous un décalage de 4px, donc le score explose alors
  que la géométrie ciblée (marges verticales 4/5px) est exacte.
- **Verdict** : le positionnement du code est correct ; c'est la **même cause
  racine** que les 1,31 % de Default/Orange (kerning), amplifiée par la finesse du
  chevron. Delta inter-moteurs documenté dans le rapport (cause nommée). **La
  décision reste à acter : l'accepter comme delta nommé (comme Default/Orange),
  jamais en relâchant le seuil en silence.**

## Outilne noir — 2,53 % masqué ✗ échoue (résidu du même kerning)

- **Taille** : 436×108 vs 440×108 — la bordure ne déborde plus, **le défaut
  d'avant (21,32 %) est corrigé**.
- **Le résidu** : le même écart de kerning que Default/Orange (1,31 %), amplifié
  parce que l'anneau de bordure foncé longe les bords décalés — chaque bord en
  désaccord compte double (bordure + fond).
- **Verdict** : même famille que le Link — delta inter-moteurs, cause nommée dans
  le rapport, décision à acter.

---

## Résumé

| Variante | Score masqué | État | Souci |
|---|---|---|---|
| Default | 1,31 % | ✅ | kerning (rendu texte, rien à corriger) |
| Orange | 1,31 % | ✅ | idem Default |
| Blanc | 0,00 % | ✅ | rien |
| Outline blanc | 0,00 % | ✅ | corrigé (bordure dedans) — chiffre aidé par l'encre blanche |
| Link | 8,25 % | ✗ | kerning → flèche décalée de ~4px (position du code exacte) |
| Outilne noir | 2,53 % | ✗ | kerning → anneau de bordure sur bords décalés |

**Les deux vrais défauts d'avant (bordure dehors, Link difforme + fond) sont
corrigés.** Ce qui reste au-dessus du seuil se réduit à **une seule cause** : le
rendu du texte diffère entre Chromium et Figma (kerning), et le Link/Outilne noir
y sont plus sensibles que les autres. C'est la limite « deux moteurs, un texte »
— réelle, mesurée, nommée dans `REPORT.md` — pas un défaut du bouton. La façon de
la solder (delta accepté et documenté, ou autre traitement) est une décision à
prendre explicitement, pas un réglage à glisser sous le tapis.
