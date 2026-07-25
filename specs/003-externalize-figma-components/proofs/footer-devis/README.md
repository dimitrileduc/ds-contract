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

## Vérification indépendante (2026-07-25, post-commit) — le delta BRUT, au-delà du panneau pixelmatch

Ré-exécution indépendante de l'instrument sur les mêmes captures : verdict reproduit au
byte près (mêmes 9 diffCounts, mêmes diffBoxes). En complément, une passe de delta **brut**
(tout canal, sans classification anti-aliasing) élargit honnêtement le périmètre décrit
plus haut :

- **Empreinte brute réelle** : 861-1251 px/page dans une bande x=89..1472, h≤114 — pas
  seulement le libellé. Trois zones touchées : bordures du Bouton, libellé du Bouton,
  titre « Suivez-nous ». Logo, 3 Footer-columns, icônes sociales, Copyright, Separator :
  **zéro delta brut** (byte-identiques).
- **Couverture 9/9 prouvée, pas échantillonnée** : les motifs de delta (coordonnées +
  valeurs, sha256) sont identiques en 3 groupes — {Accueil, Contactez-nous, Dépannage/SAV,
  Motorisation, Portes de garage, À Propos}, {Portes d'entrée, résidentielles},
  {industrielles}. Une anomalie propre à une seule page (piège Réalisations) est donc
  exclue par construction, pas par sondage.
- **Les « lignes rouges pleines » aux bordures du Bouton, mesurées** : en delta brut, les
  bordures gauche ET droite montrent chacune 2 colonnes changées pleine hauteur — le motif
  qui signale d'ordinaire un décalage. Mesure au pixel (canal R, fond 38, blanc 255) :
  avant = trait net 2px (`255,255`), après = `146,255,146` (AA) ; centroïdes déplacés de
  **0,5px vers la gauche des deux côtés, largeur du cadre constante (220px)** — un
  repositionnement sous-pixel uniforme du Bouton, PAS un déplacement ≥1px ni un
  redimensionnement. Étendue du libellé identique (x=122..273) ; populations de pixels
  clairs et RGB moyens identiques avant/après (pas de changement de couleur ni de graisse
  — piège Hero re-écarté au niveau pixel).
- **« Suivez-nous »** : étendues orange strictement identiques à chaque rangée sondée
  avant/après (aucun letter-spacing, aucune position ≥1px) ; deltas = arêtes AA seules,
  intérieurs des glyphes intacts.
- **Lecture** : la phrase « aucun fantôme rouge plein » plus haut décrit le panneau
  pixelmatch (où ces pixels de bordure sont classés AA, jaunes, hors diffBox et hors
  crops). Au sens brut, ces lignes existent — quantifiées ici à 0,5px sous-pixel,
  invisibles à 100 %. Même classe d'écart que le « 1px CTA re-measure » nommé sur
  Réassurances. **Verdict inchangé : adoption propre sur les 9 pages.**
- **Anti-fork re-vérifié live après commit** : 1 seul master `Footer` (`2120:4785`),
  9/9 wrappers = exactement 1 instance `remote:false` du master, 0 GROUP `Footer` brut
  restant sur `Pages`.
