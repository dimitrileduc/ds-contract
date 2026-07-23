# Diff pixel du Button — variante par variante

Comparaison ton code ↔ Figma, pour chacune des 6 variantes. Seuil de réussite : 2 %.
État au **23 juillet 2026 (soir), après contrat v1.2.0** — les interrupteurs
« Icône gauche / Icône droite » sont nés dans Figma et extraits dans le contrat.
Image de diff : `extract/figma/visual-parity/report-assets/button--property-1-*.triptych.png`.

> **Corrigé depuis la première version de ce document :**
> 1. **Bordure dessinée à l'intérieur** (comme Figma) — Outilne noir : 21,32 % → 2,53 %.
> 2. **Fond natif du `<button>` neutralisé** (le « fond gris » a disparu).
> 3. **Hauteur du Link exacte** (24 device px = Figma).
> 4. **Les icônes sont des réglages officiels** : propriétés booléennes dans Figma
>    (défaut : éteintes), props `iconLeft`/`iconRight` dans le code (contrat v1.2.0).
>    Les 9 pages ont conservé leurs 80 icônes visibles (78 préservées par Figma,
>    2 rallumées via la propriété — vérifié 158/158 états identiques).

---

## Default — 1,31 % masqué ✅ passe

- Seul écart : le **kerning** (Chromium resserre certaines paires de lettres de
  Montserrat, Figma non → « CONTACTEZ-NOUS » ~4 device px plus étroit).
- Limite de rendu entre deux moteurs, pas un défaut. **Rien à corriger.**

## Orange — 1,31 % masqué ✅ passe

- Identique à Default. Rien à corriger.

## Blanc — 0,00 % masqué ✅ passe

- Fond blanc, texte foncé, pas de bordure : l'écart texte est absorbé par le
  masque. **Rien à corriger.**

## Outline blanc — 0,00 % ✅ passe (chiffre à lire avec prudence)

- Bordure dedans, taille exacte — le défaut d'avant est corrigé.
- Prudence : l'encre blanche sur fond transparent reste sous-comptée par le
  comparateur ; la preuve de la correction est la taille exacte + Outilne noir
  (même bordure, encre foncée) à 2,53 %.

## Link — 4,83 % non masqué ✗ échoue (ligne 100 % texte, score masqué indéfini)

- **Nouvelle nature depuis les interrupteurs** : par défaut, ni Figma ni le code
  n'affichent d'icône → la ligne ne contient QUE du texte. Le masque de texte
  couvre alors tout le canevas → **le score masqué est nul par construction**
  (comme documenté pour les sujets tout-texte), et la ligne se classe sur son
  score **non masqué** : 4,83 %.
- **D'où vient ce 4,83 %** : la même rasterisation de glyphes que Default/Orange
  (3,03 % non masqués)… sur un canevas beaucoup plus petit (~370×24) où chaque
  pixel de liseré pèse proportionnellement plus lourd. Géométrie : exacte
  (hauteur 24 = Figma ; largeur : l'écart de kerning connu).
- **⚠️ Trou de couverture, nommé** : le gate n'exerce **plus** le rendu des
  icônes (les deux côtés sont éteints par défaut). Pour le remettre sous preuve
  pixel, il faudra un « préréglage » de sujet (rendre `iconRight=true` face à un
  rendu Figma propriété activée). Inscrit dans le triage.

## Outilne noir — 2,53 % masqué ✗ échoue (résidu kerning)

- La bordure ne déborde plus (21,32 % → 2,53 %). Le résidu est l'écart de
  kerning de Default/Orange, amplifié parce que l'anneau de bordure foncé longe
  les bords décalés.

---

## Résumé

| Variante | Score | État | Nature |
|---|---|---|---|
| Default | 1,31 % masqué | ✅ | kerning |
| Orange | 1,31 % masqué | ✅ | kerning |
| Blanc | 0,00 % masqué | ✅ | rien |
| Outline blanc | 0,00 % | ✅ | corrigé — chiffre aidé par l'encre blanche |
| Link | 4,83 % non masqué (masqué : indéfini) | ✗ | tout-texte : raster de glyphes sur petit canevas |
| Outilne noir | 2,53 % masqué | ✗ | kerning + anneau de bordure |

**Tous les défauts de rendu sont corrigés.** Les deux lignes au-dessus du seuil
se réduisent à **une seule cause** : le rendu du texte diffère entre Chromium et
Figma (kerning/raster), et ces deux variantes y sont géométriquement plus
sensibles. C'est la limite « deux moteurs, un texte » — réelle, mesurée, nommée
dans `REPORT.md`. **Deux décisions restent à acter explicitement** (jamais en
relâchant le seuil en douce) : (1) accepter ces deux lignes comme deltas
documentés ; (2) remettre le rendu des icônes sous preuve pixel via un
préréglage de sujet (trou de couverture nommé au triage).
