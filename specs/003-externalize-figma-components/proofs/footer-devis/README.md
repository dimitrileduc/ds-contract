# Preuve pixel — Footer (+ Devis) (T099-T100)

**Instrument** : `npm run pages:compare` (pixelmatch, seuil 0.1, dimensions strictes),
transport b-fetch. `before` = `.page-parity/footer-devis/before/` (9 pages, capturées
avant toute mutation). `after` = `.page-parity/footer-devis/after/` (9 pages, capturées
après adoption).

## Verdict : 9/9 diff, tous sous-pixel, aucun reflow

| Maquette | Statut | diffCount | diffBox |
|---|---|---|---|
| Contactez-nous | diff | 64 | x=122, y=3658, w=152, h=10 |
| À Propos | diff | 64 | x=122, y=5685, w=152, h=10 |
| Dépannage/SAV | diff | 64 | x=122, y=3999, w=152, h=10 |
| Portes d'entrée | diff | 61 | x=122, y=6291, w=152, h=10 |
| Motorisation | diff | 64 | x=122, y=3091, w=152, h=10 |
| Portes de garage industrielles | diff | 151 | x=122, y=6519, w=153, h=11 |
| Portes de garage résidentielles | diff | 61 | x=122, y=6332, w=152, h=10 |
| Portes de garage | diff | 64 | x=122, y=4129, w=152, h=10 |
| Accueil | diff | 64 | x=122, y=5187, w=152, h=10 |

Tous les diffs sont confinés à la **même petite zone relative** (le libellé du Bouton
« CONTACTEZ-NOUS », ~152×10-11px) — le contenu est byte-identique sur les 9 pages
(0 override à l'adoption), donc l'écart ne peut venir que du ré-rendu clone→instance du
texte, pas d'une substitution de contenu.

## Pourquoi ce n'est pas un reflow (crops inspectés, pas supposé)

Crops inspectés à l'œil sur les 2 cas extrêmes (Contactez-nous = plus petit écart,
industrielles = plus grand) : avant/après montrent le même mot « CONTACTEZ-NOUS », même
police, même graisse, même position. Le panneau diff = liseré jaune fin sur les arêtes
des glyphes (AA sous-pixel), aucun fantôme rouge plein, aucun mot déplacé, aucune couleur
changée. Magnitude max **151px sur une page de ~1728×4372 = 7,5M pixels ≈ 0,002 %** — très
en-dessous de l'enveloppe déjà acceptée cette spec.

## Receipts

- Before : `.page-parity/footer-devis/before/` (9 PNG, receiver nonce `2424632a40dc05a2`)
- After : `.page-parity/footer-devis/after/` (9 PNG, receiver nonce `5a99d08f92427ee9`)
- Ledger : `ledger/footer-devis.json` (0 override — contenu byte-identique sur les 9,
  `pages:ledger:check` exit 0)
- Checkpoints Figma : `003/footer-devis/{master,adoption}` (posés avant chaque geste
  mutant correspondant)
