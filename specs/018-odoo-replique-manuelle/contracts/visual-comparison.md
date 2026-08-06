# Contrat d'interface — le protocole de comparaison d'image *(SC-006, US3)*

**3 lignes, une par composant. Exactement une cause dominante par ligne. Zéro verdict rendu à
l'œil.** Et l'instrument de parité visuelle gated n'est **ni étendu ni modifié**.

---

## 1. La contrainte qui décide de tout le montage

Deux exigences se croisent :

- l'instrument de parité visuelle du dépôt compare **Figma ⟷ notre surface HTML** ; l'étendre
  d'un canal Odoo serait un chantier de dépôt plus gros que la spec ;
- les Assumptions interdisent qu'une instance Odoo se retrouve sur le chemin d'une porte
  permanente.

⇒ **Montage autonome, hermétique par construction**, qui réutilise ce qui a de la valeur (le
vocabulaire de causes de 014) sans toucher à ce qui est sous porte.

## 2. Ce qui est réutilisé, et pourquoi c'est légitime

| Pièce réutilisée | Ce que c'est | Pourquoi la réutiliser plutôt que la réécrire |
|---|---|---|
| `extract/image-parity/` (`npm run images:compare`) | CLI **générique et renderer-agnostique** de comparaison PNG stricte, avec self-test hors ligne | Elle est écrite pour ça : « it does not know about Figma, manifests, pages, or React. Consumers decide how their images were made ». Elle **refuse** une différence de dimensions au lieu de redimensionner — une refus honnête plutôt qu'un écart masqué |
| `embeddedFontFaces()` de `extract/figma/visual-parity/render.ts` | Montserrat embarqué en base64 | Exporté explicitement **pour être réutilisé, jamais ré-implémenté**. Un second harnais qui refait son chargement de police retomberait dans le bug daté du 2026-07-23 : Chromium substituait silencieusement une police système pendant que `document.fonts.check` répondait « disponible » — toutes les mesures comparaient alors code-en-repli contre référence-en-vraie-police |
| `chromiumExecutable()` de la même source | découverte du Chromium épinglé | même raison : plomberie déjà résolue, aucune valeur à la refaire |
| Le vocabulaire de causes de 014 | 6 causes fermées, bijectives avec leurs libellés publiés | SC-006 l'exige : « au vocabulaire de causes **déjà gouverné** » |

**Prior art décisif** : `extract/figma/aplat-parity/render.ts` (spec 006) est **exactement** ce
patron — un deuxième harnais qui importe `chromiumExecutable` + `embeddedFontFaces` sans modifier
`visual-parity`, rend du HTML arbitraire à viewport épinglé et capture un `clip` de taille fixe.
Le harnais de 018 est le troisième du même patron, pas une invention.

## 3. Le protocole

### 3.1 La contrainte de dimensions, et comment elle est satisfaite

`images:compare` **refuse** deux images de tailles différentes (`dimension-mismatch`, code de
sortie 2) — délibérément, « because it would otherwise hide a visual change ». Capturer chaque
composant à sa boîte naturelle donnerait donc deux tailles différentes et **aucun pourcentage**.

⇒ **Les deux côtés sont capturés dans un `clip` de taille identique, épinglée**, le composant
posé à la même origine, sur le même fond. Les tailles sont alors égales **par construction**, la
comparaison stricte s'applique sans être modifiée, et une différence de géométrie apparaît comme
des pixels de diff — jamais comme un refus qui aurait dissimulé la mesure.

### 3.2 Ce qui est épinglé des deux côtés

| Paramètre | Règle |
|---|---|
| viewport | même largeur/hauteur CSS des deux côtés |
| `deviceScaleFactor` | identique des deux côtés |
| `clip` | même `{x, y, width, height}` des deux côtés |
| fond | identique et opaque des deux côtés |
| police | **les mêmes faces Montserrat** — embarquées côté HTML par `embeddedFontFaces()`, **servies par le module** côté Odoo. Si le module ne sert pas la police, la mesure compare un repli système à la vraie police, et elle est fausse |
| animations/transitions | neutralisées des deux côtés |
| props | les valeurs par défaut de la chaîne, identiques des deux côtés |

### 3.3 Le côté Odoo

Les trois composants doivent être capturables **séparément**, alors qu'un seul est posable
(FR-003). Le module embarque donc **trois pages de mesure** qui appellent chacune un modèle —
des pages, **pas** des blocs : elles n'ajoutent aucune entrée au panneau et ne touchent pas à
FR-003.

Elles sont capturées sur la **page publique**, jamais dans l'éditeur : l'éditeur ajoute son
propre habillage, et ce n'est pas ce que voit un visiteur.

### 3.4 Le côté surface HTML

`emitHtml` du barrel `core/` rend le contrat, avec les valeurs de props de la chaîne. La feuille
de jetons **sans préfixe** (`src/styles/tokens.css`) est incluse dans la page rendue — c'est la
condition documentée de cet émetteur : « Token VALUES arrive via CSS custom properties — the page
must include the token stylesheet or the custom properties resolve to nothing ».

## 4. La ligne de comparaison

```jsonc
{
  "schemaVersion": 1,
  "plancherDeTolerance": null,     // DÉCLARÉ à la première mesure, avec sa raison — jamais deviné au plan
  "lignes": [
    {
      "composant": "ds.button",
      "statut": "mesurée",          // mesurée | impossible
      "avant": "proofs/…/button.html.png",
      "apres": "proofs/…/button.odoo.png",
      "score": 0.0,                 // l'écart mesuré, jamais estimé
      "cause": "rendering",         // ∈ vocabulaire 014, exactement UNE — null si sous le plancher
      "justification": "…",         // une ligne, avec son reçu
      "raisonImpossible": null      // OBLIGATOIRE si statut = impossible
    }
  ]
}
```

### Le vocabulaire de causes — fermé, celui de 014

| Slug | Libellé publié |
|---|---|
| `contract-geometry` | géométrie du contrat |
| `image-boundary` | frontière image (limite A5) |
| `rendering` | rendu/rastérisation |
| `engine` | défaut moteur |
| `instrument` | défaut d'instrument |
| `figma-source` | défaut de source Figma |

**Aucune cause nouvelle n'est inventée pour Odoo.** Si aucune des six ne convient, c'est un
résultat à consigner et à discuter — pas une septième à ajouter en passant. (Un écart dû au
cadre CSS d'Odoo qui traverse notre portée se lit comme `engine` ou `rendering` selon qu'il vient
de notre CSS ou de la rastérisation ; le choix se justifie sur la ligne, il ne se devine pas.)

## 5. Invariants

| # | Invariant | Ce qui le rend faux |
|---|---|---|
| C1 | **3 lignes, maille composant** | une ligne manquante, ou une maille plus fine « pour être sûr » — elle coûterait plus cher sans rien apporter au rapport de décision |
| C2 | **Exactement une cause dominante** au-dessus du plancher | zéro cause, ou deux |
| C3 | **Plancher déclaré**, avec sa raison | un plancher implicite, ou choisi après avoir vu les scores |
| C4 | **0 verdict à l'œil** | une ligne dont le score vient d'une appréciation |
| C5 | **Une mesure sautée est dite** | `statut: impossible` sans `raisonImpossible`, ou pire : une ligne impossible comptée comme réussie (acceptation US3-3) |
| C6 | **Hermétisme** | l'instrument gated modifié ou étendu, ou une instance Odoo entrée sur le chemin de la suite de contrôles standard |
| C7 | **Symétrie des polices** | un côté en Montserrat réelle, l'autre en repli — la mesure est alors fausse et doit être refaite, pas triée |

## 6. Ce que cette comparaison **ne** dit **pas**

Elle dit **si nos jetons traversent Odoo**. Elle ne dit **rien** de la conformité à la maquette :
la mesure de fidélité contre Figma est explicitement hors périmètre. C'est le contrôle le moins
cher qui existe, et il teste le risque le plus concret — le cadre CSS d'Odoo qui déborde sur des
contrats extraits d'un contexte propre. Rien de plus, et c'est écrit pour qu'on ne lui fasse pas
dire davantage.
