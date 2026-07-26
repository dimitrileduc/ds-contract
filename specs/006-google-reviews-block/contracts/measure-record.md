# Interface — relevé de mesure et relevé de transcription

**Statut** : épinglée par la spec 006. Toute évolution passe par une entrée `decisions.md`.

Il n'existe **aucune source en calques** pour ce bloc : ni valeur de design, ni nœud texte. Tout ce
qui entre dans les contrats est **mesuré sur un raster**. Ces deux relevés sont ce qui rend cette
mesure vérifiable par un tiers — et ce qui empêche une valeur mesurée d'être un jour présentée comme
extraite (FR-009).

---

## 1. La source de mesure

**Les octets d'origine, pas une re-capture.** Recadrer une capture de page donnerait une copie lossy
d'une copie lossy. Le fill image porte le bitmap original :

```js
const rect  = await figma.getNodeByIdAsync(APLAT_NODE_ID);
const paint = rect.fills.find(f => f.type === 'IMAGE');
const bytes = await figma.getImageByHash(paint.imageHash).getBytesAsync();
// POST vers receiver.mjs /png — même transport b-fetch que capture.js
```

**Lecture seule.** Sortie : `measures/aplat-source.png`, accompagnée d'un side-car
`aplat-source.json` : `{ imageHash, sha256, largeurNative, hauteurNative, scaleFactor, nodeId,
maquette, capturedAt }` avec `scaleFactor = largeurNative / 1552`.

`img.ts` **ne rééchantillonne jamais** : le côté code est rendu à la largeur honnête correspondante,
et tout résidu d'échelle est **publié**, jamais absorbé en redimensionnant la référence.

---

## 2. Relevé de mesure — `measures/mesures-aplat.md`

Une ligne **par valeur de design**. Aucune valeur n'entre dans un contrat sans sa ligne.

| Colonne | Contenu |
|---|---|
| `rôle` | à quoi sert la valeur (« fond de carte », « gap entre cartes », « taille du nom ») |
| `lecture A` | première mesure, avec sa méthode |
| `lecture B` | seconde mesure, **par un moyen différent** |
| `valeur retenue` | ce qui entre dans le contrat |
| `arbitrage` | `accord 2/2` \| `pas-gouverné` \| `pixel` \| `médiane-3` |
| `canal` | `token` \| `literal` \| `declared-draw` \| `declared-annotate` \| `refusé` |
| `reçu` | chemin du crop qui montre la mesure |

**Méthodes admises** — couleurs : RVB modal sur patch 5×5, à **deux emplacements** de la même
surface. Tailles de texte : hauteur de capitale ÷ ratio de la fonte, recoupée par l'interligne.
Distances : profils d'encre en X et en Y, mesurés sur **deux occurrences différentes** du même écart.
Rayons : extension de l'arc de coin. Comptes et booléens : lecture à ≥ 4× avec un crop committé par
fait.

### Règle de tranchage

> Chaque valeur est mesurée **deux fois par deux moyens différents**.
> **Accord** — Δ ≤ 1 px (distance), ≤ 1/255 par canal (couleur), ≤ 0,5 px (taille) → valeur retenue,
> `accord: 2/2`.
> **Désaccord**, dans cet ordre :
> 1. **Le pas gouverné tranche** — si exactement UNE lecture tombe sur une valeur déjà gouvernée,
>    c'est elle. `arbitrage: pas-gouverné`.
> 2. **La plus conservatrice** — les deux candidates sont rendues et mesurées ; la plus basse gagne.
>    `arbitrage: pixel`.
> 3. **Troisième lecture** — sa médiane tranche, et **les trois chiffres sont publiés**. Jamais de
>    moyenne silencieuse.

**Provenance, obligatoire et attachée à la valeur** : la `description` de la part qui la porte
nomme sa ligne de relevé. `semantics.provenance` vaut `"authored"` — véridique, ce n'est pas extrait
du canevas. `anchors.figma.dumpedAt` porte la date d'extraction de l'aplat. Une valeur mesurée
n'est **jamais** décrite comme extraite d'une source.

**Alignement sur un token = décision, pas mesure.** Quand une couleur mesurée est rapprochée d'une
couleur gouvernée, **les deux chiffres sont publiés** avec leur Δ. Le rapprochement est un choix de
gouvernance et se lit comme tel.

---

## 3. Relevé de transcription — `measures/transcription-<maquette>.md`

**Pourquoi il existe.** Le ledger de 003 est **structurellement inapplicable** ici : l'état « avant »
est un unique `RECTANGLE`, donc `customizations.js` renverra honnêtement `entrees: []` et
`pages:ledger:check` sortira **vert**. Ce vert n'attesterait **rien** — le contenu est *transcrit*,
pas *préservé*. Un reçu vert au-dessus d'un contenu inventé serait exactement l'omission silencieuse
que la constitution désigne comme la faute la plus grave.

Une ligne **par chaîne** saisie sur le canevas :

| Colonne | Contenu |
|---|---|
| `champ` | `carte3.auteur`, `resume.volume`, … |
| `crop` | image de la zone source, ≥ 4× |
| `valeur saisie` | la chaîne, **verbatim**, ellipse finale comprise |
| `confiance` | `sûre` \| `douteuse` \| `illisible` |
| `relecteur` | qui a validé en **seconde passe** |

**Règles.** Un fragment `illisible` ou tronqué à la source est **listé avec la valeur retenue à sa
place** — jamais comblé en silence. Les espaces de fin, apostrophes typographiques et accents
dégradés par la compression sont **explicitement déclarés non garantis** (FR-010 : fidèle au visible,
non garanti au caractère près). Toute ligne `douteuse` ou `illisible` remonte dans le rapport final.

---

## 4. Ce que le ledger garde à faire

`ledger/google-reviews.json` reste au format 003, mais son contenu est **saisi à la main** :

- le contenu imbriqué des cartes — angle mort documenté de `customizations.js`
  (« ne compare jamais le texte/contenu interne d'une instance nichée ») ;
- les 8 fills photo : `type: "image"`,
  `portePar: "fill IMAGE de la part avatarPhoto (override d'instance imbriquée, A5)"`.

**C'est la seule sauvegarde rejouable** : un amend du master de section détruit tous les overrides
imbriqués des 8 occurrences. Le ledger doit donc être complet et rejouable, pas décoratif.
