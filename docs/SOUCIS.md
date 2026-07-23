# Diff pixel du Button — variante par variante

Comparaison ton code ↔ Figma, pour chacune des 6 variantes. Seuil de réussite : 2 %.
État au 23 juillet 2026. Image de diff : `extract/figma/visual-parity/report-assets/button--property-1-*.triptych.png`.

---

## Default — 1,31 % ✅ passe

- **Taille** : 436×108 vs Figma 440×108 → ton bouton fait **2px de moins en largeur**.
- **Le diff** : seulement le contour des lettres.
- **Le souci** : le **kerning**. Chromium resserre certaines paires de lettres, Figma
  non. Ton « CONTACTEZ-NOUS » est donc 2px plus étroit, et le bouton suit.
- **Verdict** : ce n'est pas un défaut de ton bouton, c'est une différence de rendu du
  texte entre deux moteurs. Sous le seuil. **Rien à corriger** (couper le kerning
  dégraderait ta typo pour rien).

## Orange — 1,31 % ✅ passe

- **Identique à Default.** Même bouton, autre couleur de fond. Même kerning, même 2px.
  Rien à corriger.

## Blanc — 0,00 % masqué ✅ passe

- **Taille** : 436×108 vs 440×108 (mêmes 2px de kerning).
- **Le diff** : uniquement au centre, sur le texte (le rapport le dit : « diff au
  milieu, 307×25px »).
- **Le souci** : rien de particulier. Fond blanc, texte foncé, pas de bordure. Le seul
  écart est le texte (kerning). **Rien à corriger.**
- **Attention** : le 0,00 % est en partie trompeur — le comparateur sous-compte le
  contenu clair. Mais ici il n'y a pas de bordure, donc pas de piège caché.

## Outline blanc — 0,00 % ✅ passe (mais FAUX)

- **Taille** : 444×116 vs 440×108 → ton bouton fait **2px de plus en largeur ET 4px de
  plus en hauteur**.
- **Le souci** : **la bordure est dessinée à l'extérieur** au lieu de l'intérieur (comme
  Figma). C'est ce qui grossit le bouton de 2px/4px. **C'est un vrai défaut.**
- **Pourquoi ça affiche 0 % quand même** : la bordure est **blanche** sur fond
  transparent → le comparateur ne la voit quasiment pas. Donc il dit « parfait » alors
  que la bordure est décalée. **Le 0,00 % ment ici.**
- **À corriger** : dessiner la bordure à l'intérieur (voir Outilne noir, même défaut).

## Link — 2,73 % masqué ✗ échoue

- **Taille** : 308×60 vs 370×24 → ton bouton est **62px plus étroit** et **surtout 36px
  plus HAUT** (60 vs 24). Gros écart de forme.
- **Le diff** : la **flèche →** que Figma a et pas toi, un fond gris, et le texte
  décalé.
- **Les soucis, dans l'ordre** :
  1. **La flèche manquante.** Sur Link, Figma affiche une flèche droite (c'est la seule
     variante où elle est visible). Ton contrat ne l'a pas reprise → Figma est plus
     large que toi de ce côté.
  2. **Ton bouton est beaucoup trop haut** (30px vs 12px de Figma). Probablement la zone
     de clic de 44px (le `::before` d'accessibilité) qui gonfle un simple lien fin.
  3. **Un fond gris** que ton code ajoute et que Figma n'a pas.
- **À corriger** : ajouter un réglage pour la flèche (booléen), vérifier la hauteur du
  Link, et d'où sort le fond gris.

## Outilne noir — 21,32 % masqué ✗ échoue (le plus gros)

- **Taille** : 444×116 vs 440×108 → **2px trop large, 4px trop haut**, comme Outline
  blanc.
- **Le diff** : un **cadre rouge tout autour** du bouton.
- **Le souci** : **la bordure est dessinée à l'extérieur au lieu de l'intérieur.** Figma
  la met au bord (dedans), ton code la met par-dessus (dehors), ce qui pousse tout de
  2px. Résultat : ta bordure et celle de Figma ne se recouvrent pas → tout le pourtour
  est en désaccord → 21 %.
- **Preuve que c'est bien la bordure** : le score *monte* quand on masque le texte
  (21 % masqué vs 17 % non-masqué). Donc le désaccord est dans la bordure, pas le texte.
- **Pourquoi 21 % ici et 0 % sur Outline blanc** : c'est **le même défaut**, mais ici la
  bordure est **foncée** → pleinement comptée. Outilne noir dit la vérité, Outline blanc
  la cache.
- **À corriger** : dessiner la bordure à l'intérieur (`box-shadow: inset` ou pseudo-
  élément). Le fix a été écrit et vérifié bon dans un vrai navigateur, mais l'outil de
  test le rend mal — il faut d'abord régler ça pour pouvoir vérifier au pixel.

---

## Résumé

| Variante | Score | État | Souci |
|---|---|---|---|
| Default | 1,31 % | ✅ | kerning (rendu texte, rien à corriger) |
| Orange | 1,31 % | ✅ | idem Default |
| Blanc | 0,00 % | ✅ | rien (texte seul) |
| Outline blanc | 0,00 % | ✅ faux | bordure dehors — cachée car blanche |
| Link | 2,73 % | ✗ | flèche manquante + trop haut + fond gris |
| Outilne noir | 21,32 % | ✗ | bordure dehors au lieu de dedans |

**Deux vrais défauts à corriger** : la **bordure dessinée dehors** (touche Outline blanc
+ Outilne noir) et le **Link** (flèche + hauteur + fond). Le reste est du kerning,
c'est-à-dire la limite normale de comparer du texte entre deux moteurs.
