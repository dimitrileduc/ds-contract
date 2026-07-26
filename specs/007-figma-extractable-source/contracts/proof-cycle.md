# Contrat — Le cycle de preuve (007)

**Amende le contrat homonyme de la spec 005** sur un seul point, mais un point structurant :
le **périmètre du juge**. La 005 disait « les 9 frames maquettes — rien d'autre ; les masters
sont prouvés par leur effet ». La clarification owner Q4 de la 007 étend le juge aux pages DS
porteuses de masters. Tout le reste — séquence, verdicts, refus, fraîcheur, retour arrière —
est **repris sans changement** et fait foi.

Instrument : `extract/figma/page-parity/`, **réutilisé tel quel**, sans une ligne modifiée.

## 1 · Le périmètre de mesure — 43 cibles

| Page | Cibles | Nature |
|---|---|---|
| `Pages` (`210:325`) | **9** | les maquettes, 1728 × 3334-6762 px |
| `DS · Atomes` (`2052:1144`) | **5** | `Formulaire`, `Icônes` (SECTION) + `piqueray_logo`, `Bouton`, `member-picture` (COMPONENT_SET) |
| `DS · Molécules` (`2052:1145`) | **13** | SECTION, `Field` … `Nav-item` |
| `DS · Organisms` (`2052:1146`) | **16** | SECTION, `Devis` … `Hero vidéo` |
| **Total** | **43** | verdict **N/N** |
| `DS · Tokens` (`2051:951`) | 3 | **hors verdict courant** ; entre au seul cycle FR-031 |

**Pourquoi les enfants et non la page** : un `PageNode` a bien `exportAsync` mais **pas** de
`width` — et sa bounding-box dépend du placement, donc un simple déplacement de master
produirait un faux positif. Les enfants de premier niveau sont tous exportables et bornés.

**Règle de nommage des cibles — obligatoire.** Le PNG est écrit sous `<cible>.png` et la
liste comparée est déduite des fichiers présents. Douze noms de section se répètent entre
pages (`Formulaire`, `Header`, `Footer`, `Hero`, `Présentation`, `Coordonnées`, `SAV`,
`Texte SEO`, `Réassurances`, `Catégories principales`, `Produits e-commerce`,
`Réalisations`). **Le nom passé à `capture.js` DOIT porter le préfixe de sa page** —
`DS-Organisms__Formulaire` — sans quoi une capture en écrase une autre **en silence** et le
verdict reste vert sur une cible non mesurée.

**Hors périmètre du juge, nommément** : la page séparatrice `----------------------`
(`2171:7347`, 0 enfant) ; la copie de la maquette Accueil posée sur `DS · Organisms`
(`2121:5168`, décision owner du 2026-07-25 : laisser en l'état) ; les cartes **Avis Google**
(widget tiers, branche `006-google-reviews-block`, autre session).

## 2 · La séquence, dans cet ordre exact

```text
0. version enregistrée      figma.saveVersionHistoryAsync("007/<passe>/<étape>")   → versionId
1. relevé de structure      bridge/scan.js (lecture seule, par POSITION)           → releves/*.json
2. diff attendu ANNONCÉ     écrit dans decisions.md AVANT toute écriture
3. capture AVANT × 43       receiver.mjs :9227 + bridge/capture.js (noms préfixés) → .page-parity/<cycle>/before/
4. vérification des 43 PNG  non vides, dimensions plausibles                       → sinon STOP, aucune écriture
5. LE(S) GESTE(S)           figma_execute — script transcrit dans proofs/<cycle>/gestes.md
6. capture APRÈS × 43       même receveur, même nonce, même transport
7. verdict                  npm run pages:compare -- --before … --after … --out …
8. artefacts                proofs/<cycle>/{verdict.json,verdict.md,crops/,gestes.md}
```

**Les étapes 0 à 4 précèdent toute écriture. Sans exception.** Une passe qui démarre sans
`versionId` est arrêtée : sans lui, le rapport ne peut pas produire le lien d'état antérieur
qu'il doit porter, et **aucun outil ne rend l'image d'une version passée**.

Le libellé `007/<passe>/<étape>` passe la validation de `bridge/checkpoint.js` sans
modification : la regex y est `^\d{3}\/[^/]+\/[^/]+$` depuis la 005 (`689637e`).

## 3 · Le verdict — mécanique, jamais une appréciation

`pixelmatch` seuil **0.1**, détecteur anti-aliasing **actif**, dimensions **strictes** (aucune
normalisation, aucun recadrage, jamais `alignPair`). Le before/after sort du **même renderer**
(`exportAsync`, même node) : un écart de taille ou de position **est** le signal.

| Statut par cible | Signification | Exit |
|---|---|---|
| `identical` | 0 pixel différent hors bruit AA | `0` si N/N |
| `diff` | écart mesuré, localisé par `diffBox`, crop triptyque émis | `1` |
| `capture-failed` | capture vide / transparente | `2` |
| `dimension-mismatch` | before ≠ after en dimensions | `2` |

**Exit 2 = la preuve n'a pas eu lieu.** C'est un refus, jamais une dégradation vers
« identique » : une capture vide n'est pas la preuve que rien n'a bougé.

## 4 · Les deux verdicts de lot

| Le lot annonçait | Observé | Verdict |
|---|---|---|
| **0 pixel** | 43/43 `identical` | ✅ acquis |
| **0 pixel** | ≥1 `diff` | ❌ **STOP** — lot annulé **en entier**, cause identifiée **avant** toute reprise |
| **un diff nommé** | conforme à l'annoncé | ✅ acquis, crop joint |
| **un diff nommé** | plus grand que l'annoncé | ❌ **STOP** — dépassement |
| **un diff nommé** | plus petit / ailleurs | ❌ **échec de prédiction** — le geste n'a pas fait ce qu'on croyait |

## 5 · Étalonnage d'ouverture (bloquant, une fois) — **élargi**

Double capture des **43 cibles** sans rien faire entre les deux.

- Sur les **9 maquettes** : le plancher est **connu nul** depuis l'étalonnage 003 (9/9).
  Un plancher non nul ici = régression = **STOP programme**, retour owner.
- Sur les **34 cibles DS** : le plancher est **inconnu** — elles n'ont jamais été mesurées, et
  aucune SECTION n'a jamais été exportée par cet instrument. Q4 l'assume (« leur ligne de base
  s'établit au premier relevé »). Une cible DS bruitée **ne bloque pas le programme** : elle
  **sort du verdict, nommément**, et le rapport la porte avec sa raison. Ce qui est interdit,
  c'est de l'y laisser en la comptant comme identique.

Receipt committé dans `proofs/00-etalonnage/`.

## 6 · Ce que le pixel ne voit pas

Le gate pixel attrape la perte **visuelle**. Il est aveugle par construction à :

- la perte d'**intention** (une valeur écrasée par une autre au rendu identique) ;
- tout ce qui **n'a aucun rendu** — une variable créée non consommée, une description de
  composant, un marqueur de style. Pour ceux-là, **l'absence de preuve est déclarée comme
  telle**, jamais convertie en « identique ». Leur vérification est un **relevé live**
  (lecture de l'état après geste), pas un pixel.

## 7 · Fraîcheur et retour arrière

Aucun cache, aucune baseline, aucun `--refresh` — par conception. Chaque preuve re-capture ses
86 PNG dans la même session que le geste.

**Aucune API de restauration programmatique n'existe.** La restauration est un geste humain
guidé (Figma desktop → Show version history → restaurer le point nommé), puis **re-prouvée**
par l'instrument. **Aucun retour arrière rétroactif** n'est autorisé pour combler une preuve
manquante après coup (règle owner : « encore plus dangereux »).

## 8 · Cadence et écrivains parallèles

Un cycle = **86** appels de capture. Le groupement n'est pas une optimisation, c'est la
condition de faisabilité : tout ce qui ne peut pas déplacer un pixel **par construction**
(renommer, décrire, créer une variable, lier une variable qui porte la valeur déjà rendue)
part en lot partageant un seul cycle.

Plusieurs écrivains sont autorisés (FR-029) à deux conditions strictes : leurs zones sont
**disjointes** (une page DS, une famille de canal — jamais deux écrivains sur un même nœud),
et **un seul** cycle global de vérification encadre le lot, tenu par l'orchestrateur, jamais
par les agents.

## 9 · Limites nommées

- **La capture est live-only** : pont desktop figma-console contre une app Figma ouverte. Non
  headless, non CI, non câblée dans `evals/run.ts`.
- **Le transport (port 9227) exige le receveur démarré et identifié** : `/health` doit répondre
  `instrument: "page-parity"` **et** le nonce de session (`expectNonce` est obligatoire). Un
  octet confié à un puits inconnu est un octet perdu en silence — incident réel en 003/T018.
- **Divergence documentaire assumée** : le README de l'instrument (§10) déclare encore
  « périmètre = les 9 frames maquettes, rien d'autre ». Le code n'a jamais porté cette limite ;
  le README si. Sa correction est une écriture dépôt interdite ici (FR-025) → **portée à la
  dette léguée**, jamais laissée implicite.
