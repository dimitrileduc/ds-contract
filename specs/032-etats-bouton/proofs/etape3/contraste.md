# T036 — contraste RÉEL du libellé sur son fond, relevé sur la page vive

Valeurs CALCULÉES par le navigateur (getComputedStyle), jamais lues dans le CSS.
Règle FR-019 telle qu'arbitrée : plancher 4,5 pour les six styles conformes ;
pour `orange`, déjà sous AA au repos et délibérément non corrigé, une
progression CROISSANTE suffit. Un style qui EMPIRE est un échec.

  # style          section                  repos  survol  pressé  verdict
----------------------------------------------------------------------------------
  0 blanc          (hors section)           14.76   11.18    9.48  pass
  3 outlineBlanc   ds.hero-video            14.76   14.76   11.18  pass
  4 link           ds.presentation          14.76   21.00   18.43  pass
  5 default        ds.sav                   14.76   10.08    8.50  pass
  6 outlineNoir    ds.produits-ecommerce    14.76   14.76   10.08  pass
  7 iconOnly       ds.produits-ecommerce    14.76   14.76   10.08  pass
  8 iconOnly       ds.produits-ecommerce    14.76   14.76   10.08  pass
 10 outlineBlanc   ds.devis                 21.00   14.76   11.18  pass
 11 outlineNoir    ds.reassurances          14.76   14.76   10.08  pass
 12 outlineNoir    ds.google-reviews        14.76   14.76   10.08  pass
 13 link           ds.google-reviews        14.76   21.00   18.43  pass
 14 link           ds.google-reviews        14.76   21.00   18.43  pass
 15 link           ds.google-reviews        14.76   21.00   18.43  pass
 16 link           ds.google-reviews        14.76   21.00   18.43  pass
 17 link           ds.google-reviews        14.76   21.00   18.43  pass
 18 outlineBlanc   (hors section)           14.76   14.76   11.18  pass

## Confrontation au registre de la matrice (contrastLedger)

style          mesuré repos/survol/pressé       matrice repos/survol/pressé      accord
------------------------------------------------------------------------------------------
blanc          14.76 / 11.18 / 9.48             14.76 / 11.18 / 9.48             oui
default        14.76 / 10.08 / 8.50             14.76 / 10.08 / 8.50             oui
iconOnly       14.76 / 14.76 / 10.08            14.76 / 14.76 / 10.08            oui
link           14.76 / 21.00 / 18.43            14.76 / 21.00 / 18.43            oui
outlineBlanc   14.76 / 14.76 / 11.18            14.76 / 14.76 / 11.18            oui
outlineNoir    14.76 / 14.76 / 10.08            14.76 / 14.76 / 10.08            oui

## Styles du registre ABSENTS de la home
  ['orange'] — non vérifiables sur cette page (aucune instance).

## VERDICT
  Aucun style n'empire. Les six styles présents respectent FR-019.
