# Preuves — hero-titres-deux-colonnes

Ce dossier porte les **verdicts**, pas les pixels bruts : 43 Mo de rendus pleine
résolution ont été retirés au profit des mesures et de quatre recadrages. La
convention est celle de `.gitignore:48` — « verdicts + recadrages ».

| fichier | ce qu'il prouve |
|---|---|
| `avant/releve.json` | géométrie et textes des 8 instances + master AVANT mutation (§X) |
| `apres/releve.json` | les mêmes APRÈS — c'est la comparaison qui porte le résultat |
| `comparaison-odoo.json` | parité visuelle Odoo ↔ contrat du sujet `hero` |
| `crops/` | le défaut, sa réparation, la démo sous-titre masqué, la carte de diff |
| `diff.mjs` | le diff pixel, **re-jouable** |

Regénérer les rendus pleine résolution (REST, lecture seule) puis le diff :

```bash
# exporter les 8 heros + le master depuis Figma vers avant/ ou apres/
# (ids dans avant/releve.json), puis :
npx tsx specs/tiny/proofs/hero-titres-deux-colonnes/diff.mjs
```

Mesures clés, pour ne pas dépendre des images :

- `Portes de garage` : chevauchement **55 px → 0**, `bas(Titre)` 583 → 512
- 7 autres pages : **−3 px** (sous-titre 2 lignes) ou **+19 px** (1 ligne)
- aucun titre n'a gagné de ligne malgré la colonne réduite à 1164 px
- diff pixel : 0,48 % à 1,83 % sur les 7, **8,99 %** sur la page réparée
- Odoo, sous-titre masqué : `bas(Titre) == bas(CTA)`, **écart 0 px**, public ET éditeur
