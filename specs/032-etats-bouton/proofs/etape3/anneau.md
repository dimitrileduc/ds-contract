# T038–T041 — l'anneau de focus clavier, relevé sur la page vive

Instance : piqueray-odoo-pilote, port 8087 (jetable). Valeurs CALCULÉES.

## FR-004 / FR-005 — forme de l'anneau

Exigence : trait PLEIN d'au moins 2 px, distinguable sur fond clair comme sombre.

  boutons visibles mesurés : 16
  outline-style: solid     : 16 / 16
  outline-width: 2px       : 16 / 16
  outline-offset: 2px      : 16 / 16
  anomalies                : aucune

Couleur de l'anneau, par style — elle suit bien le canal `anneau-focus` :
  blanc          rgb(255, 255, 255)     attendu color.blanc
  default        rgb(38, 40, 44)        attendu color.noir-bleute
  iconOnly       rgb(38, 40, 44)        attendu color.noir-bleute
  link           rgb(38, 40, 44)        attendu color.noir-bleute
  outlineBlanc   rgb(255, 255, 255)     attendu color.blanc
  outlineNoir    rgb(38, 40, 44)        attendu color.noir-bleute

## SC-002 — contraste de l'anneau sur les cinq fonds réellement employés

Confronté au registre `focusRingLedger` de la matrice. Seuil FR-005 : 3 pour 1.

  fond               valeur     anneau               mesuré  registre  verdict
  ----------------------------------------------------------------------------
  color.blanc        #FFFFFF    color.noir-bleute     14.76     14.76  pass
  color.bleu-clair   #F4F6FA    color.noir-bleute     13.65     13.65  pass
  color.beige-clair  #FFF3E2    color.noir-bleute     13.48     13.48  pass
  color.noir-bleute  #26282C    color.blanc           14.76     14.76  pass
  color.noir-pur     #000000    color.blanc           21.00     21.00  pass

  Le plus faible est à 13,48 — plus de quatre fois le seuil de 3.

## FR-006 — le clic souris n'arme PAS l'anneau

Relevé pendant `mouse.down()`, souris réellement enfoncée sur le bouton :
  outline-style: none pendant le clic : 16 / 16
  boutons montrant un anneau au clic  : aucun

  `:focus-visible` ne s'arme donc pas au pointeur — c'est le comportement
  navigateur attendu, et il est ici CONSTATÉ, pas supposé.

## Limite nommée, reprise du registre de la matrice

  L'anneau est choisi PAR STYLE. Il suppose que le style reste posé sur le fond pour lequel il est dessiné (blanc et outlineBlanc sur fond sombre, les cinq autres sur fond clair). Aucun instrument ne détecte aujourd'hui un style posé sur le mauvais fond.

## Note d'instrument — un piège qui aurait donné un faux négatif

  Chromium n'arme `:focus-visible` que si la dernière interaction était au
  CLAVIER. Un `.focus()` posé juste après un geste souris hérite de la
  modalité pointeur et ne peint AUCUN anneau. La première version de
  l'instrument faisait exactement cela et aurait conclu à tort que le focus
  ne marchait pas. La mesure repasse donc en modalité clavier par une frappe
  réelle (`Tab`) avant chaque relevé de focus.
