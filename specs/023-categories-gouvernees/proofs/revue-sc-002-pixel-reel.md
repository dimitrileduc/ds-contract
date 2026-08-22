# SC-002 « 7 usages au pixel » — mesure réelle (revue du 2026-08-21)

Produit APRÈS coup, en réponse à la revue (deux relecteurs indépendants), pour
remplacer une affirmation par une mesure. Les captures avant/après vivent (locales,
gitignorées) sous `proofs/captures/{before,after}/` ; ce document consigne les
chiffres et leur honnêteté.

## Mesure (pixelmatch, seuil 0.1, avant vs après par usage)

| Usage | Écart | Dimensions | Verdict |
|---|---|---|---|
| usage1 accueil | **0,50 %** | 3104×836 | petit — cohérent avec la déviation de structure (padding→Container, décidée owner) |
| usage2 portes garage | **0,83 %** | 3104×836 | petit |
| usage3 résidentielles | **49,39 %** | 3456×1244 | ⚠ la capture « après » montre l'état DÉFECTUEUX (mauvaises photos), pas le rendu final validé |
| usage4 industrielles | **0,00 %** | 3456×1298 | ⚠ « après » BYTE-IDENTIQUE à « avant » (mêmes octets) — pas de vraie recapture |
| usage5 portes d'entrée | **46,88 %** | 3456×1244 | ⚠ même défaut que usage3 |
| usage6 motorisation | **0,00 %** | 3456×1050 | ⚠ « après » BYTE-IDENTIQUE à « avant » — pas de vraie recapture |
| usage7 dépannage SAV | **14,58 %** | 3456×1298 | moyen — jamais chiffré ni attribué |

## Conclusion honnête

**La preuve pixel exigée par la spec (FR-002, FR-012, SC-002 : « chaque delta non nul
chiffré ET attribué à une cause nommée ») n'a JAMAIS été produite valablement.** Les
captures archivées sont dégénérées :
- 2 usages (4, 6) n'ont pas de vraie capture « après » (copie octet-identique de « avant ») ;
- 2 usages (3, 5) montrent un état intermédiaire DÉFECTUEUX (photos perdues/inversées au
  remplacement de composant), pas le rendu final validé — leurs 49 %/47 % ne mesurent donc
  PAS l'écart réel du livrable ;
- 3 usages (1, 2, 7) portent des écarts réels (0,50 %, 0,83 %, 14,58 %) jamais chiffrés ni
  attribués jusqu'ici.

**Ce qui est vrai et tracé** : l'owner a validé la réparation **à l'œil, sur le canvas
live** (« c ok go », `proofs/gate-b.md`), et la déviation de structure
(padding porté par un Container de présentation) est une décision owner tracée
(`gates/gate-b-pixel.json:5`). Le gate B lui-même dit `"nature": "PAS un pixel-identique
strict"`.

**Correction apportée** : `RAPPORT-CLOTURE.md` §7 ne marque plus SC-002 « ✔ au pixel ».
SC-002 est reclassé : réparation validée VISUELLEMENT par l'owner, déviation de structure
assumée ; **le chiffrage pixel exigé n'a pas été produit et les captures archivées ne le
soutiennent pas** — dette de preuve nommée, à solder par une recapture propre des 7 usages
(canvas live) si l'owner veut le chiffrage formel. Défaut hérité d'US1 (Gate B, avant cette
session), surfacé par la revue.
