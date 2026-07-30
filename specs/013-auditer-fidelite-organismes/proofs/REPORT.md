# Campagne 013 — Auditer la fidélité des organismes

> Rendu depuis `result.json` — le Markdown n'est jamais l'autorité du verdict.

## 1. Provenance

- campagne : `013-auditer-fidelite-organismes` · hash `00e6586d568eedf9…`
- Figma : fileKey `d9FYAUcqdcNtsuaMgLefvJ`, version `2381581871281042338`, **readOnly true**
- contrats : `02daa8877204b688…` · tokens : `f65dad29b6d42dad…`
- surface prouvée : react-storybook sous `src/components` · arbre `9c579495c814172f…`
- **zéro commande Figma write/push/update** — la seule route vers Figma est un GET (reçu : `baseline/no-write-path.json`)

## 2. Index des douze verdicts

| vague | organisme | faits | prouvés | divergents | limités | non prouvés | pixels | dépendance | verdict | dossier |
|---:|---|---:|---:|---:|---:|---:|---:|---|---|---|
| 1 | coordonnees | 46 | 44 | 1 | 1 | 0 | 0.52 % | Aucune | **divergent** | [dossier](organisms/coordonnees/REPORT.md) |
| 1 | devis | 21 | 14 | 7 | 0 | 0 | 0.14 % | Aucune | **divergent** | [dossier](organisms/devis/REPORT.md) |
| 1 | hero | 37 | 27 | 10 | 0 | 0 | 27.83 % | Aucune | **divergent** | [dossier](organisms/hero/REPORT.md) |
| 1 | presentation | 13 | 9 | 3 | 0 | 1 | 0.35 % | Aucune | **divergent** | [dossier](organisms/presentation/REPORT.md) |
| 1 | sav | 18 | 12 | 6 | 0 | 0 | 0.67 % | Aucune | **divergent** | [dossier](organisms/sav/REPORT.md) |
| 1 | texte-seo | 39 | 30 | 7 | 2 | 0 | 1.84 % | Aucune | **divergent** | [dossier](organisms/texte-seo/REPORT.md) |
| 2 | faq | 34 | 24 | 9 | 1 | 0 | 3.67 % | Aucune | **divergent** | [dossier](organisms/faq/REPORT.md) |
| 2 | footer | 57 | 39 | 18 | 0 | 0 | 1.04 % | Aucune | **divergent** | [dossier](organisms/footer/REPORT.md) |
| 2 | reassurances | 44 | 30 | 10 | 4 | 0 | 38.61 % | Aucune | **divergent** | [dossier](organisms/reassurances/REPORT.md) |
| 3 | equipe | 59 | 0 | 0 | 0 | 59 | N/A — aucun cas | ds.member-card (blocked→blocked, fermée) | **blocked** | [dossier](organisms/equipe/REPORT.md) |
| 3 | formulaire | 77 | 0 | 0 | 0 | 77 | N/A — aucun cas | ds.field (blocked→blocked, fermée) | **blocked** | [dossier](organisms/formulaire/REPORT.md) |
| 3 | header | 52 | 0 | 0 | 0 | 52 | N/A — aucun cas | ds.nav-item (fail→divergent, fermée) | **blocked** | [dossier](organisms/header/REPORT.md) |

## 3. Exécution des vagues

| vague | démarre après | sujets | classifiée | indépendance dépendances gatées | verdicts positifs sous porte fermée |
|---:|---|---|---|---|---:|
| 1 | rien | coordonnees, devis, hero, presentation, sav, texte-seo | oui | true | 0 |
| 2 | 1 | faq, footer, reassurances | oui | true | 0 |
| 3 | 2 | equipe, formulaire, header | oui | true | 0 |

## 4. Synthèse de couverture

- organismes : **12** attendus 12
- faits obligatoires : **497** — 229 prouvés · 71 divergents · 8 limités · 189 non prouvés
- couverture exacte (missing == [] et unexpected == []) : 9/12

## 5. Matrice de traçabilité

La trace fait par fait vit dans chaque dossier (`organisms/<id>/REPORT.md`, rubrique 5) : une ligne par fait obligatoire avec sa référence Figma, son JSON Pointer contractuel, sa référence générée et son verdict. Elle n'est pas recopiée ici — la recopier créerait une seconde autorité.

## 6. Verdicts par organisme

- **coordonnees** (ds.coordonnees@2.2.0, node `2104:2904`) → `divergent` — divergent-facts:1
- **devis** (ds.devis@1.2.0, node `2096:2524`) → `divergent` — divergent-facts:7
- **hero** (ds.hero@1.3.0, node `2111:3382`) → `divergent` — divergent-facts:10 · failed-cases:1
- **presentation** (ds.presentation@2.1.0, node `2103:2824`) → `divergent` — divergent-facts:3
- **sav** (ds.sav@1.2.0, node `2108:3105`) → `divergent` — divergent-facts:6
- **texte-seo** (ds.texte-seo@2.1.0, node `2108:3123`) → `divergent` — divergent-facts:7
- **faq** (ds.faq@1.2.0, node `2104:2914`) → `divergent` — divergent-facts:9 · failed-cases:1
- **footer** (ds.footer@1.1.0, node `2120:4785`) → `divergent` — divergent-facts:18
- **reassurances** (ds.reassurances@1.2.0, node `2114:3721`) → `divergent` — divergent-facts:10 · failed-cases:1
- **equipe** (ds.equipe@1.0.0, node `2115:3947`) → `blocked` — dependency:ds.member-card:blocked · receipt-verdict-blocked · dependency-not-proved:ds.member-card · figma-file-version-moved:2381568261081914456->2381581871281042338
- **formulaire** (ds.formulaire@1.1.0, node `2096:2564`) → `blocked` — dependency:ds.field:blocked · receipt-verdict-blocked · dependency-not-proved:ds.field · figma-file-version-moved:2381568261081914456->2381581871281042338
- **header** (ds.header@1.0.0, node `84:285`) → `blocked` — dependency:ds.nav-item:divergent · receipt-verdict-fail · dependency-not-proved:ds.nav-item · figma-file-version-moved:2381568261081914456->2381581871281042338

## 7. Divergences et limites nommées

- **coordonnees** — 1 divergent(s), 1 limité(s), 0 non prouvé(s). Détail et cause racine : `organisms/coordonnees/REPORT.md`.
- **devis** — 7 divergent(s), 0 limité(s), 0 non prouvé(s). Détail et cause racine : `organisms/devis/REPORT.md`.
- **hero** — 10 divergent(s), 0 limité(s), 0 non prouvé(s). Détail et cause racine : `organisms/hero/REPORT.md`.
- **presentation** — 3 divergent(s), 0 limité(s), 1 non prouvé(s). Détail et cause racine : `organisms/presentation/REPORT.md`.
- **sav** — 6 divergent(s), 0 limité(s), 0 non prouvé(s). Détail et cause racine : `organisms/sav/REPORT.md`.
- **texte-seo** — 7 divergent(s), 2 limité(s), 0 non prouvé(s). Détail et cause racine : `organisms/texte-seo/REPORT.md`.
- **faq** — 9 divergent(s), 1 limité(s), 0 non prouvé(s). Détail et cause racine : `organisms/faq/REPORT.md`.
- **footer** — 18 divergent(s), 0 limité(s), 0 non prouvé(s). Détail et cause racine : `organisms/footer/REPORT.md`.
- **reassurances** — 10 divergent(s), 4 limité(s), 0 non prouvé(s). Détail et cause racine : `organisms/reassurances/REPORT.md`.
- **equipe** — 0 divergent(s), 0 limité(s), 59 non prouvé(s). Détail et cause racine : `organisms/equipe/REPORT.md`.
- **formulaire** — 0 divergent(s), 0 limité(s), 77 non prouvé(s). Détail et cause racine : `organisms/formulaire/REPORT.md`.
- **header** — 0 divergent(s), 0 limité(s), 52 non prouvé(s). Détail et cause racine : `organisms/header/REPORT.md`.

## 8. Travaux reportés (valeurs en dur / tokens)

| id | organisme | fait | catégorie | contrat porteur | pointeur | cause observée | impact verdict | statut |
|---|---|---|---|---|---|---|---|---|
| DW-001 | footer | footer.structure.piqueray-logo-size | hardcoded-value-conversion | ds.piqueray-logo | `/anatomy/root/literals/width` | Le master porte PiquerayLogo à 180.0985565185547px. Un parent ne peut pas restyler une instance de composant ; la largeur devrait vivre sur le root de ds.piqueray-logo, qui est partagé avec ds.header et y prend une autre taille. | divergent | deferred |
| DW-002 | reassurances | reassurances.structure.carte-largeur | hardcoded-value-conversion | ds.carte | `/anatomy/root/literals/min-width` | 4×364 + 3×32 = 1552 > 1550px du frame items. Figma laisse déborder, le CSS flex rétrécit les cartes de 0,5px et décale le contenu de 1px. MESURÉ, pas supposé : le patch appliqué temporairement fait REFUSER le harnais (débordement horizontal de 4 device px), donc la correction n'est pas locale. | divergent | deferred |
| DW-003 | faq | faq.structure.section-header-height | hardcoded-value-conversion | ds.section-header | `/anatomy/root/literals/height` | L'instance SectionHeader 2104:2907 est figée par le master à 50px alors que son contenu en demande 83 (clipsContent=false). Tout ce qui suit est décalé de 32px. Le fait appartient à l'INSTANCE : sur les 8 instances du census, seule celle de FAQ est FIXED à 50, les autres sont HUG — la valeur ne peut donc pas descendre sur l'enfant. DÉFAUT DE SOURCE FIGMA, à verser au backlog de nettoyage. | divergent | deferred |
| DW-004 | footer | footer.structure.padding-root-left | hardcoded-value-conversion | ds.footer | `/anatomy/root/literals` | GÉOMÉTRIE PORTÉE EN LITTÉRAUX AU LIEU DE TOKENS — la dette la plus structurante du lot. La remédiation de la vague 2 a écrit padding-left/right 89px, padding-top 128px, gap 48px, gap 32px, gap 16px dans ds.footer, ds.faq et ds.reassurances, alors que {space.89}, {space.128}, {space.48}, {space.32} et {space.16} existent déjà (mintés par 012). Or le différentiel surveille la géométrie PAR l'axe des tokens (canvas variables ⟷ tokens/) : un littéral brut ne siège sur aucun axe, donc npm run parity reste vert pendant que les surfaces divergent. Les 52 contrats archivés demo-51 portent zéro literals. Convertir exige de déplacer la valeur ET le pointeur déclaré du fait ensemble (/literals/ → /tokens/), ce qui dépasse le périmètre de 013. | limited | deferred |
| DW-005 | footer | footer.structure.root-width | global-token-correction | ds.footer | `/anatomy/root/literals/width` | Les largeurs de cadre relevées (1550px, 1728px, 459px, 310px) n'ont AUCUN token dans la fondation. La doctrine écrite dans tokens/primitives.tokens.json est de minter depuis le dump (« minted from-dump so anatomy references tokens, not literals »), comme l'espacement du Button l'a été. Minter est une correction de fondation de tokens, que SC-005 interdit explicitement à 013. | limited | deferred |
| DW-006 | reassurances | reassurances.visual.root | hardcoded-value-conversion | ds.reassurances | `/anatomy/root` | DÉFAUT D'INSTRUMENT, pas de contrat : le pilote photographie subject.figmaSetNodeId, or reassurances est le seul sujet dont le set (2114:3721, trois variantes empilées, 1552×2451) diffère du node du cas (une variante, 1550×731). Le dossier compare donc une variante rendue à trois variantes photographiées et publie 38,61 %. Mesuré sur la référence correcte : 3,30 %, dont ~1,74 % de plancher de rééchantillonnage des photos. Le chiffre publié n'est PAS une mesure de fidélité et ne doit pas être lu comme telle. | not-proven | deferred |

## 9. Portes dépôt et campagne

Les portes techniques du dépôt sont consignées dans `closure/gates.json`. La campagne elle-même sort **1** (`complete-with-blocks`).

> **Un code 1 est une campagne honnêtement terminée, PAS une déclaration de fidélité globale.** Les organismes non positifs sont réels et leurs causes sont nommées ci-dessus.

## 10. Reçu de revue

`closure/review.json` — douze IDs dans l'ordre des vagues, au moins un chemin concret ouvert par organisme, verdicts égaux à `result.json`.
