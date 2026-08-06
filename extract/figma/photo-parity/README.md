# `extract/figma/photo-parity/` — le contrôle d'identité des photos client

**Promotion (spec 017, T006), pas une réécriture.** Ces deux fichiers viennent tels quels de
`specs/016-canvas-vrai/{bridge,tools}/` — décision explicitement parquée pour 017 par
`specs/016-canvas-vrai/plan.md:101`. Ils ont changé de dossier, **pas de comportement, pas de
CLI**. Motif : une porte qui vit dans le dossier d'une spec close rouille, et le dépôt n'avait
aucun script `photos:*`.

## Deux outils, deux rôles — et ils ne s'appellent pas de la même façon

| Fichier | Où il tourne | Ce qu'il fait |
|---|---|---|
| `photos-census.js` | **dans le bac à sable Figma, via le pont** (receiver local requis) | recense les photos **par POSITION**, masters **et** instances, et rapporte les octets par hash |
| `photos-verify.mts` | **hors ligne**, en Node | compare deux recensements et rend le verdict d'identité |

Le premier a besoin du fichier client ouvert. Le second n'en a pas besoin — c'est lui, et lui
seul, que `npm run photos:verify` lance.

## La CLI réelle de `photos-verify` — relevée, pas supposée

```bash
npm run photos:verify -- <census-avant.json> <census-apres.json> [--out <chemin>]
npm run photos:verify -- --selftest
```

- Les deux recensements sont des arguments **positionnels**. **Il n'y a ni `--avant` ni
  `--apres`.**
- Appelé **nu**, il sort en `exit(2)` sur un défaut d'argument — ce n'est pas une panne.
- `--selftest` est son **seul mode réellement sans tête** : il prouve **le comparateur** (les cinq
  cas : identique, perdue, intervertie, non-vérifiable, apparue), **pas les photos du client**.
- Le `--out` **par défaut** pointe encore vers `specs/016-canvas-vrai/proofs/photos/photos-report.json`.
  C'est un reste de sa maison d'origine, laissé **volontairement intact** : le changer serait une
  modification de CLI, donc une réécriture, donc une tâche à part et non un effet de bord de la
  promotion. **Passer `--out` explicitement** (ce que fait `quickstart.md` §5 de 017).

**Toute CLI plus riche que celle-ci serait une réécriture.** Si elle devient souhaitable, c'est
une tâche à part, avec sa propre preuve.

## La porte qui fait foi n'est pas ici

`--selftest` prouve le comparateur. **La porte photos sans tête, celle qui fait foi (SC-008), est
le cas d'eval `photos-instance-overrides-preserved` de `npm run eval`** — il tourne partout, sans
le fichier client, adossé au faux-Figma. Le reçu vif produit par ces deux outils **confirme** ; il
ne remplace pas.

## Le coût nommé de la promotion

`extract/` est dans `tsconfig.json` § include : le `.mts` promu est désormais **type-checké par
`npx tsc --noEmit`**, ce qu'il n'était pas sous `specs/` (exclu, comme `evals/fixtures/`). C'est
le prix de la promotion, et il est payé sciemment — l'en-tête du fichier dit encore qu'il se
prouve en l'exécutant, ce qui reste vrai et devient simplement moins seul.
