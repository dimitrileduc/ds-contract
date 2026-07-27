# Contrat — La table de nommage et son oracle

**Pourquoi c'est un contrat et pas une préférence** : les noms portés par le canvas
**deviennent** les identifiants du code généré à la spec suivante. Un nom entré dans un
contrat adopté coûte un **bump majeur** par composant touché pour en sortir. La table est
donc l'artefact bloquant de FR-030 / SC-015 : **aucun renommage, aucune création de variable
ou de rôle ne commence avant sa validation owner, en un seul bloc.**

## 1 · L'oracle — le test d'acceptation, hors ligne, avant tout geste

L'extracteur **ne refuse jamais** un nom illégal : il translittère à la proposition et écrit
une note. La dette est donc silencieuse aujourd'hui. L'oracle inverse cela : il prédit, pour
un nom candidat, **si la note se déclenchera encore**.

`tools/name-oracle.mjs` transcrit **verbatim** les quatre fonctions du dépôt —
`kebab` (`extract/types.ts` l. 183), `camel`, `componentIdSlug`, `pascalComponentName`,
`canonicalPropName` (`core/propose-figma.ts` l. 35, 63, 95, 113).

**Critère d'acceptation d'une ligne, les trois à la fois :**

```text
set          : pascalComponentName(n) === n   ET   idSlugSanitized(n) === false
propriété    : propNameSanitized(p) === false ET   propNameDigitLed(p) === false
valeur/part  : même règle que le set (elles deviennent des identifiants générés)
```

Une ligne dont l'oracle ne rend pas `CLEAN` **ne peut pas être exécutée** : elle rouvrirait la
note qu'elle prétend fermer. SC-003 (0 translittération) devient ainsi une propriété **prouvée
avant exécution**, pas constatée après.

## 2 · Le mécanisme qu'il faut connaître pour proposer un nom

Les fonctions du dépôt n'ont **aucune table de repli ASCII**. `[a-z]` et `[A-Za-z0-9]` sont
ASCII-only : tout caractère accentué est traité comme **séparateur** et **supprimé** — jamais
replié sur sa lettre de base. D'où :

| Porté par la source | Devient | Parce que |
|---|---|---|
| `Étoile` | `toile` | `É` supprimé, tiret de tête strippé |
| `Équipe` | `quipe` | idem |
| `Hero vidéo` | `HeroVidO` | `é` sépare `vid` et `o`, chacun capitalisé |
| `État` | `tat` | `É` supprimé |
| `Libellé` | `libell` | `é` final supprimé |

**Conséquence contre-intuitive, mesurée** : retirer les accents **ne suffit pas** pour la
classe A, qui exige le **PascalCase strict**. `Hero video` reste noté ; `HeroVideo` passe.
`Section-header` reste noté ; `SectionHeader` passe. Les propriétés sont plus permissives —
espaces, `_` et `-` sont légaux — donc `Etat`, `Libelle`, `Icone gauche` suffisent.

## 3 · Le format d'une ligne

```markdown
| kind | nodeId | ancien | nouveau | descriptionFr | classes | oracle |
|------|--------|--------|---------|---------------|---------|--------|
| set  | 2053:1263 | Étoile | Etoile | Étoile | A, B | CLEAN |
| prop | 2056:1278 | État | Etat | — | C | CLEAN |
```

- `nodeId` est **obligatoire** : la table s'ancre sur l'identifiant, jamais sur le nom qu'elle
  remplace.
- `descriptionFr` porte l'orthographe accentuée déplacée vers la **description du composant**
  (FR-006a). Le français ne disparaît pas, il change de porteur — vers le seul champ que
  l'extraction ignore et qu'un humain lit.
- `kind: 'prop'` n'a **jamais** de `descriptionFr` : une propriété Figma n'a pas de champ
  description (FR-006b). Si l'orthographe française porte du sens, elle est consignée dans la
  description du **composant** qui porte la propriété — et la limite est nommée au rapport.

## 4 · Les classes que la table doit couvrir

| Classe | Cas mesurés | Contenu |
|---|---|---|
| **A** | 36 | tout set dont le nom n'est pas déjà PascalCase — dont les **15 icônes en kebab** du registre 002 et 7 molécules (`Section-header`, `Accordion-row`, `Product-card`, `Member-card`, `Carousel-controls`, `Footer-column`, `Nav-item`) |
| **B** | 10 (spec : 12) | `Étoile`, `Équipe`, `Réassurances`, `Réalisations`, `Réalisation`, `Présentation`, `Coordonnées`, `Catégories principales`, `Hero vidéo`, `octicon:chevron-down-12` |
| **C** | 10 occ. / 6 distinctes | `État` ×4, `Libellé` ×2, `Icône gauche`, `Icône droite`, `Coché`, `En-tête` |
| **D** | 22 | collisions de nom de part au sein d'un même contrat proposé |
| **+** | 10 | **valeurs de variant** non-ASCII — classe non couverte par les FR, cf. décision O3 |
| **+** | n | calques nommés d'après leur contenu rédactionnel (FR-005) |

L'écart de 2 sur la classe B vient probablement du second site d'émission
(`core/propose-figma.ts` l. 2214, sur les **références d'instance imbriquée**) : à **confirmer
au relevé d'ouverture**, jamais à supposer.

## 5 · Ce qui remplace un nom faux

- **Un nom décrit un rôle**, jamais un contenu. Un changement de texte ne doit plus rendre un
  nom faux (« Titre », pas « Portes de garage industrielles »).
- **Un axe nomme la dimension qu'il fait varier**, pas une valeur ni un rang.
- **Casse et accentuation stables** : pas de `Text` à côté de `text`.
- **Le français reste**, porté par la description. Ce n'est **pas** une régression vers
  l'anglais et ne doit pas être re-dérivé comme un abandon : c'est le même français, déplacé.

## 6 · Vérifications obligatoires autour d'un renommage

- **Aucune référence externe ne dépend du nom remplacé** (FR-007) — script, contrat adopté,
  ancrage d'instance. Ce contrôle est **refait**, jamais supposé, même si la 005 l'a déjà passé.
  Acquis connus : les ancres de contrat sont `componentSetKey` + `nodeId`, deux identifiants
  qui **survivent** au renommage ; `parity` lit des **snapshots committés**, donc reste inerte.
- **Une instance survit-elle au renommage de son master / de son axe ?** Vérifié, jamais
  supposé — les overrides sont référencés par identifiant de propriété, mais c'est la
  vérification qui le prouve, pas la doctrine.
- **Éditer un master efface les overrides de ses instances** (piège vérifié en 005/cycle 14 :
  contenu, taille, alignement). Toute passe sur un master instancié exige la vérification des
  **instances** après coup, pas seulement du master.

## 7 · Les divergences que la table ouvre, et qui sont un livrable

Renommer la source d'un contrat adopté le rend faux. **C'est le résultat attendu, pas un
accident** : la source est corrigée, le contrat reste en l'état, la divergence est **écrite**
au rapport et réparée par la spec suivante (bump majeur assumé). Ce qui serait un échec,
c'est qu'elle ne soit pas écrite.

| Divergence ouverte | Portée |
|---|---|
| 5 contrats adoptés (`Bouton`, `Checkbox`, `Input`, `Select`, `Textarea`) | FR-008 → Prochaines étapes n° 1 |
| **`contracts/icons.registry.json` ↔ canvas**, si O1 est retenu | 15 icônes renommées ; l'axe icônes de `parity` compare le nom (`parity/diff.ts` l. 803) — inerte tant que le snapshot n'est pas rafraîchi, **à léguer explicitement** |
| **Accroches par nom dans l'outillage** | `parity/diff.ts` l. 769 (`'Bouton'`) et l. 773 (préfixe `'Glyphe'`) : la couverture de l'axe icônes s'éteint **en silence** au premier rafraîchissement de snapshot post-renommage ; `bridge/scan.js` l. 69 (`KNOWN_MASTERS`) : relevés de structure à prendre **avant** le renommage de `Bouton`, par nodeId ensuite — léguées + contrainte d'ordre (R11) |
