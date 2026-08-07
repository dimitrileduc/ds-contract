# Reposer une image PURGÉE du fichier — les quatre voies fermées et celle qui reste

**Cas rencontré (017, 2026-08-07)** : trois images du master `CategoriesPrincipales`
(`2115:4277`) ont été purgées du fichier. `figma.getImageByHash` rend `null` : les octets
n'existent plus côté Figma. Ils ont été récupérés par REST à une version antérieure, mais
les **réinjecter** s'est heurté à la politique réseau du plugin.

## Ce qui NE marche PAS — mesuré, pas supposé

| voie | résultat |
|---|---|
| `figma.createImageAsync(<URL S3 signée de l'API Figma>)` | refusé — `does not satisfy the allowedDomains` |
| `figma.createImageAsync('http://127.0.0.1:<port>/x.png')` | refusé — `127.0.0.1` n'est pas `localhost` pour la politique |
| `figma.createImageAsync('http://localhost:9231/x.png')` | refusé **bien que `http://localhost:9231` soit dans `allowedDomains`** du manifest — `createImageAsync` applique une politique plus stricte que `fetch` |
| `await fetch('http://localhost:.../x.png')` puis `figma.createImage(bytes)` | `Failed to fetch` — **le thread principal du plugin n'a aucun accès réseau** ; seul l'`<iframe>` de l'UI en a, et le Desktop Bridge ne l'expose pas |

## ⚠️ MISE À JOUR 2026-08-07 — LA VOIE EST OUVERTE, et ce n'était pas celle-là

**`figma_set_image_fill` accepte le base64 SANS LE TRONQUER.** Mesuré : 55 496 caractères
envoyés en un appel, acceptés. L'appel n'a été refusé que par le **hook before-capture du
dépôt** (§X) — une erreur de POLITIQUE, pas de transport.

Donc : **une image = un appel**, pas quinze.

```
figma_set_image_fill({ nodeIds: ['<id>'], imageData: '<base64 complet>', scaleMode: 'FILL' })
```

**Ce qu'il faut faire AVANT**, sans quoi le hook refuse (et il a raison) :
1. relancer le receiver — `node extract/figma/page-parity/receiver.mjs .page-parity/<jeu> 9227`
2. capturer **TOUTE** cible concernée — `bridge/capture.js`, jamais un sous-ensemble pilote
3. `bridge/checkpoint.js`
4. puis la mutation, puis capture APRÈS et `npm run pages:compare`

**Attention à `figma_execute`, lui, qui TRONQUE** : mesuré à ~3 770 caractères utiles sur 25 496
envoyés. La route par `globalThis` + `figma.base64Decode` décrite plus bas reste donc valable
en secours, mais elle n'est plus nécessaire.

**Les octets à poser** : `~/Desktop/photos-a-reposer-017/o-*.jpg` — versions passées à
`jpegtran -optimize -progressive -copy none`, **sans perte** (réencodage des tables de Huffman
et retrait des métadonnées Photoshop ; aucun coefficient DCT touché). 92 777, 143 480 et
41 621 octets.

| fichier | nodeId cible |
|---|---|
| `o-CategoriesPrincipales_pos-1-0-0.jpg` | `I2115:4177;2351:37100` |
| `o-CategoriesPrincipales_pos-2-1-0.jpg` | `I2115:4205;2351:37100` |
| `o-CategoriesPrincipales_pos-2-2-0.jpg` | `I2115:4206;2351:37100` |

---

## La voie de secours : les octets en base64, par morceaux

`figma.base64Decode` **existe** dans le sandbox (vérifié). Le transport passe donc par
`figma_execute`, en accumulant sur `globalThis` :

```js
// appel 1..N — un morceau de ~35 000 caractères par appel (le pont plafonne vers 50 k)
globalThis.__img = (globalThis.__img || '') + '<morceau base64>';

// appel final — décoder, créer, poser
const bytes = figma.base64Decode(globalThis.__img);
const img = figma.createImage(bytes);
const node = /* résolu par cheminPosition depuis le master */;
const fills = node.fills.map(f => ({ ...f }));
const i = fills.findIndex(f => f && f.type === 'IMAGE');
fills[i] = { ...fills[i], type: 'IMAGE', imageHash: img.hash, scaleMode: 'FILL' };
node.fills = fills;                       // RÉAFFECTATION, jamais mutation en place
delete globalThis.__img;
```

**Le coût, dit franchement** : 422 Ko d'octets → ~563 000 caractères de base64 → une
quinzaine d'appels. C'est mécanique mais lourd en contexte pour un agent ; à faire dans une
session dédiée, pas en fin de chantier.

## Les trois images en attente (spec 017)

Fichiers : `~/Desktop/photos-a-reposer-017/`, nommés par emplacement dans le master `2115:4277`.

| fichier | emplacement | octets | hash d'origine |
|---|---|---:|---|
| `CategoriesPrincipales_pos-1-0-0.png` | `1/0/0` | 98 909 | `031815a6a17c…` |
| `CategoriesPrincipales_pos-2-1-0.png` | `2/1/0` | 147 922 | `86d495b87402…` |
| `CategoriesPrincipales_pos-2-2-0.png` | `2/2/0` | 69 968 | `715170bb427e…` |

Source : REST `/v1/files/:key/images?version=2384251202054787848` (l'état d'avant-016).
Les nouveaux `imageHash` DIFFÉRERONT des originaux — Figma ré-adresse au contenu à
l'upload. Le contrôle d'identité doit donc porter sur les **octets** (sha256), pas sur le hash.

**Un raccourci honnête existe** : glisser les trois fichiers sur les trois cadres dans Figma.
Dix secondes, et c'est exactement ce que le transport ci-dessus fait en quinze appels.
