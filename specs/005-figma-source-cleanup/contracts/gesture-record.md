# Contrat — L'enregistrement de geste (le quadruplet)

Format imposé par l'owner (FR-027) et mesuré par SC-015 : **100 % des gestes du rapport de
clôture portent leur quadruplet. Un geste sans son quadruplet est un geste non prouvé.**

## 1 · Les quatre champs, tous obligatoires

| # | Champ | Contenu | Pourquoi |
|---|---|---|---|
| 1 | **Triptyque** | `avant.png` \| `après.png` \| `diff.png` — crops du `diffBox`, jamais la page entière (1728 × ~8000 px) | Porte les **pixels**. C'est la seule forme sous laquelle l'état antérieur survit |
| 2 | **Lien de l'élément** | lien vers le node **avant** *et* vers le node **après** | Permet d'ouvrir la cible, pas d'en lire une description |
| 3 | **Identifiant de version** | le `versionId` du point enregistré **avant la passe** | Porte la **structure restaurable**. Aucun outil ne rend l'image d'une version passée — la version est le seul « avant » atteignable une fois la mutation faite |
| 4 | **Explication courte** | ce qui a été fait, et pourquoi | Ce qui survit au départ de celui qui l'a fait |

Un lot zéro-pixel n'a pas de `diffBox` : son triptyque est remplacé par le **verdict 9/9
`identical`** (`verdict.md` du cycle), qui est la preuve exacte de ce qu'il annonçait.

## 2 · Forme dans `RAPPORT-CLOTURE.md`

```markdown
### <Phase> · <geste>

- **Cible** : `<nom>` — avant `<lien node>` → après `<lien node>`
- **Version enregistrée avant la passe** : `005/<passe>/<étape>` — `<versionId>`
- **Diff annoncé** : <la prédiction écrite avant l'exécution>
- **Diff observé** : <le mesuré> — <conforme | STOP>
- **Preuve** : [verdict](./proofs/<cycle>/verdict.md) · triptyque `<chemin>` (ou « 9/9 identical »)
- **Pourquoi** : <2-3 phrases>
```

## 3 · Les sections que le rapport porte en plus (bloquantes)

| Section | Exigence | Bloque la clôture si absente |
|---|---|---|
| **Divergences ouvertes** | chacune avec sa réparation attendue en Spec B | **Oui** — SC-017 |
| **Valeurs laissées littérales** | toute valeur sous le seuil 3×, avec son compte | **Oui** — SC-011 |
| **Dégradations & limites** | tout écart, limite ou dégradation constaté | **Oui** — SC-010, principe V |
| **Cadence** | cycles consommés vs budget 12, et le dépassement s'il a lieu | **Oui** — SC-009 |
| **Compteurs de clôture** | 0 nom par défaut · 0 master sans description · 0 calque masqué non piloté · 0 instance cassée · 18 icônes sur 1 page · `Assets` supprimée · archive supprimée | **Oui** — SC-002/003/004/012/014 |

## 4 · Ce qui n'est pas acceptable

- Un geste dont la preuve est « ça a l'air bon » ou une capture d'écran de l'UI.
- Un triptyque pleine page (illisible) au lieu du crop `diffBox`.
- Un « lien vers l'état d'avant » sans identifiant de version : **il n'existe pas**.
  L'archive vectorielle ne le remplace pas — elle est réservée aux gestes destructifs et
  supprimée à la clôture.
- Un écart requalifié après coup en « bruit de rendu » sans avoir été regardé **dans le
  crop**. Receipt du dépôt : deux bugs réels (un gras perdu, un espacement de paragraphe)
  ont été trouvés par l'owner en regardant l'image, après qu'un diff eut été classé bruit.
