# Preuve pixel — SAV (T073-T074)

**Date** : 2026-07-24
**Résultat** : `verdict.json` / `verdict.md` — **0/1 identical, 1/1 diff, exit 1**
**diff** : Accueil — `diffCount=3` px, `diffBox={x:474, y:1842, w:56, h:30}`

## Périmètre de capture — Accueil seule (la seule maquette concernée)

SAV n'existe que sur **Accueil** (`210:369`) — confirmé par trois mesures indépendantes
(nom, bande de taille, empreinte image unique ; voir `audits/sav.md`). Les 8 autres
maquettes n'en portent aucune occurrence. Conformément à la règle « toutes les maquettes
**concernées** » (précédent Coordonnées T094, 1/1), la preuve before/after porte sur
Accueil uniquement. Bénéfice collatéral en session multi-agent : l'agent concurrent
`Texte SEO` opère exclusivement sur les 8 maquettes **non-Accueil** + sa propre section
DS à (1692, 8035) — capturer Accueil seule **exclut structurellement** son travail de ma
mesure (aucun risque de collision inter-agent comme celle rencontrée en vague 2 sur
Présentation/Coordonnées).

## Le diff (3 pixels) — bruit d'anti-aliasing sur le titre, zéro perte réelle

**Le plus petit écart de toute la spec** (rappel : Coordonnées 816 px, FAQ ~40 px, ici
**3 px**). Soit **0,000032 %** de la page (1728×5430 = 9 383 040 px). `before`/`after` :
dimensions strictement égales (1728×5430 ×2). Le `diffBox` (56×30) tombe sur la ligne du
titre `Dépannage / SAV`.

**Investigation avant acceptation** (jamais un chiffre pris pour argent comptant, jamais
un « bruit » supposé sans regarder — leçon des faux « bruits » qui cachaient un gras
perdu) :

1. **Triptyque zoomé** (`crops/Accueil.png`, avant | après | diff) : le crop montre le
   fragment « ge / S » du titre. Panneaux avant et après **visuellement identiques** ;
   le panneau diff ne surligne (jaune) que les **bords des glyphes**, pas leur intérieur
   ni leur position — signature exacte d'un ré-hinting sub-pixel, aucun glyphe manquant/
   déplacé, aucune variation de graisse, aucune bascule de couleur (le jaune est la
   couleur de surlignage du diff, pas un contenu).
2. **Audit texte exhaustif post-adoption** sur l'instance (`2108:3135`), comparé champ
   par champ aux valeurs source mesurées avant construction — **correspondance à 100 %** :
   - **Titre** : 1 plage, Montserrat Regular 40, `lineHeight` 50, `letterSpacing` 0%,
     `textCase` ORIGINAL, décoration NONE, couleur bindée `VariableID:5:40`, align
     LEFT/TOP, autoResize HEIGHT — identique.
   - **Corps** : 7 plages, **3 gras aux indices exacts 33-52 / 101-122 / 252-299**, size
     18, `lineHeight` 27, `letterSpacing` 0%, `paragraphSpacing` 8, couleur bindée
     `VariableID:24:52` sur toutes les plages, **`\n` toujours à l'index 225** — identique.
   - **Bouton** : Libellé « Demander de l'aide », Icône gauche `false`, Icône droite
     `true`, `remote:false`, set `6:122` — identique.
   Le corps (gras par plage), le Bouton et l'illustration tombent **hors** du `diffBox`
   (56×30 confiné au titre) : **zéro diff mesuré** sur eux.

Le diff est donc du **bruit de rendu sub-pixel** sur les seuls contours du titre
re-rastérisé, de la même famille déjà nommée et acceptée cette spec (Devis-cta,
Accordion-row, Carte, Formulaire, Présentation, Coordonnées) — mais ici à une magnitude
sans précédent tant elle est faible (3 px). Zéro perte de contenu, de style ou de
position.

## Ce que le résultat prouve

1. **0 copie brute** de SAV restante sur Accueil (scan post-remplacement : `rawSavRemaining
   = 0`).
2. L'instance (`2108:3135`) résout au master `2108:3105` et occupe **exactement** la même
   bounding box que la frame source : delta `{dx:0, dy:0, dw:0, dh:0}` (389, 1672,
   1552×677 avant = après), même index 2 dans l'auto-layout `VERTICAL` d'Accueil, aucune
   coordonnée manuelle (placement par `insertChild(2, instance)`).
3. Ledger **vide explicite** (`ledger/sav.json` : `entrees: []`, `pages:ledger:check` exit
   0) — l'unique instance porte, par construction du master (cloné depuis cette occurrence
   précise), le contenu exact de la source ; rien à reporter (même logique que
   Carousel-controls/Formulaire/Coordonnées). Le diff structurel copie↔master exécuté
   AVANT remplacement retournait déjà 0 entrée / 0 illisible.

## Receipt

- Before : `.page-parity/sav/before/` (transport `b-fetch`, nonce receveur
  `b0792dc88d6d88e8`, 1/1 statut `ok`, sha256 `d1aa11d642ce…`)
- After : `.page-parity/sav/after/` (transport `b-fetch`, nonce receveur
  `df5ad93dcf924578`, 1/1 statut `ok`, sha256 `8ee0bb713f85…`)
- Comparaison : `npm run pages:compare -- --before .page-parity/sav/before --after .page-parity/sav/after --out specs/003-externalize-figma-components/proofs/sav`
- Sortie : `diff — 0/1 identical, 1 diff, 0 capture-failed, 0 dimension-mismatch (exit 1)`
