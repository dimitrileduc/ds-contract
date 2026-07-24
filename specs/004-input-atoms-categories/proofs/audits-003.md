# Audits 003 réutilisés — pointeurs (jamais recopiés ni refaits)

**But** (FR-005/006, SC-006) : un atome n'est contractualisé QUE s'il pointe vers un
audit 003 validé owner. Ce fichier **référence** ces audits sur la branche
`003-externalize-figma-components` — il ne les recopie pas et ne les refait pas. La
vérité vit dans la branche 003 ; on la lit via git (`git show 003-…:<chemin>`).

fileKey Piqueray : `d9FYAUcqdcNtsuaMgLefvJ`. Fichier **vivant** (003 y construit les
molécules) → clés/nodeIds/propriétés **re-mesurés au dump** de chaque atome (D12) ; tout
écart vs les repères ci-dessous est nommé à l'adoption, jamais supposé.

## Audit source — atomes de formulaire

- **Fichier** : `specs/003-externalize-figma-components/audits/atomes-formulaire.md` (003 **T031**)
  — structure + usage par position sur les 9 maquettes, lecture seule.
- **Constat d'usage** : 7 occurrences, toutes sur la maquette `Contactez-nous`
  (frame `form` `274:3682`), zéro ailleurs ; Checkbox = net-new intégral (zéro occurrence).
- **Anomalie relevée puis résolue** : texte de saisie `#000000` brut non bindé à la source
  (T031, FR-010) → le master reconstruit par l'owner (T032) binde fond/bordure/texte.
  **Le binding réel du texte est celui du master owner-validé, relu au dump** (D8).

| Atome | Master validé owner (repère 003) | Preuve (tâche 003) | Notes clés |
|---|---|---|---|
| Input | `2053:1245` (280×48) | **T032** | fond/bordure/texte bindés, propriété TEXTE « Valeur » |
| Textarea | `2053:1247` (280×128) | **T033** | même style qu'Input, hauteur portée par le container (pas de hack texte surdimensionné) |
| Select | `2053:1249` (280×48) | **T034** | chevron = **instance** de `226:373` (local `chevron-down`, redimensionnée 24×24), `SPACE_BETWEEN` |
| Checkbox | `2053:1256` **COMPONENT_SET** | **T035** | variant officiel `Coché` (Non/Oui) ; décoché = blanc + bordure bleu-gris ; coché = bleu plein + **coche blanche** (forme à trancher au dump — D7) |

## Audit source — icônes sociales + étoile

- **Fichier** : `specs/003-externalize-figma-components/audits/atomes-icones.md` (003 **T036**)
  — usage par position, lecture seule.
- **Constat** : Facebook + Instagram = 10 occurrences (groupe `Frame 8`), fills déjà bindés
  proprement ; **étoile introuvable comme vecteur** (la section « Avis Google » est un
  screenshot aplati d'un widget tiers Trustindex, même `imageHash` sur 2 pages) → l'owner a
  tranché **net-new** plutôt que report-bloc.

| Icône | Master validé owner (repère 003) | Preuve (tâche 003) | Notes clés |
|---|---|---|---|
| Facebook | `2053:1259` | **T037** | cloné du source, fill bindé `color/noir-bleute` → bake `currentColor` standard |
| Instagram | `2053:1261` | **T037** | idem |
| Étoile | `2053:1263` | **T038** | `createStar()` 5 branches, **`color/orange`** (couleur fixe — ne se recolore pas, D6) |

## Discipline de réutilisation

- Jointure par **CLÉ** (`componentSetKey`), jamais par nom d'affichage (« Bouton » ≠
  « Button », leçon 002 ; côté Figma le nom est français, côté code il est anglais).
- Masters des 4 atomes **gelés par accord** (FR-004) ; si 003 doit en toucher un → ses
  gates, puis **ré-extraction nommée** de l'atome avant clôture 004 (chemin
  `read-only-proof.interface.md`).
- Les node ids ci-dessus sont des **repères 003** : le dump du jour re-confirme
  clé/nodeId/propriétés (fichier vivant, D12).
