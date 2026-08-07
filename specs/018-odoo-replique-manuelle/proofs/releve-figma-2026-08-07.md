# Relevé Figma du 2026-08-07 — le CTA de la Présentation

**Lecture seule de bout en bout.** Aucun nœud, aucune propriété, aucune description
n'a été écrite dans le fichier. Tous les scripts exécutés renvoient des données et ne
mutent rien ; ils sont reproduits ci-dessous.

Fichier : `d9FYAUcqdcNtsuaMgLefvJ` · master `Presentation` = `2103:2824` (type `COMPONENT`).

---

## 1. Pourquoi ce relevé

`npm run parity` signalait, après le passage du contrat `ds.presentation` en v2.3.0 :

```
[figma MISMATCH] Presentation.Bouton (default)
  Default differs — contract: true, figma: false
```

Le différentiel ne lit **jamais** Figma en direct : il lit un cliché commité,
`parity/snapshots/figma-components.json`, capturé le **2026-08-06 à 14:32 UTC** (spec 016).
Or le master a été corrigé **après** cette capture. Le désaccord pouvait donc venir
du contrat *ou* du cliché — et rien dans le dépôt ne permettait de trancher.

D'où la règle appliquée ici : **on ne corrige pas un désaccord avant d'avoir relu la
source**.

---

## 2. Ce que le master dit AUJOURD'HUI

`componentPropertyDefinitions` de `2103:2824` :

| Propriété | Type | `defaultValue` vivant |
|---|---|---|
| `Texte#2103:54` | TEXT | « Depuis plus de 50 ans, … » |
| **`Bouton#2103:55`** | **BOOLEAN** | **`true`** |
| `Titre#2351:54` | TEXT | « Piqueray, une histoire de famille » |

Instance imbriquée `Bouton` (`2351:37050`, `visible: true`, master `Bouton / Style=Link`) :

| Propriété | Valeur vivante |
|---|---|
| `Style` | **`Link`** |
| `Icone droite#2024:7` | **`true`** |
| `Icone gauche#2024:0` | `false` |
| `Libelle#2044:28` | `Contactez-nous` |
| `Glyphe droite#2028:21` | `6:104` (= `ArrowRight`) |

Instance imbriquée `SectionHeader` (`2351:37031`) : `Disposition=Standard`,
`Emphase=Moyen`, `Alignement=Gauche`, `Accroche2=false`, `Titre` = « Piqueray, une
histoire de famille ».

### Verdict, champ par champ

| Champ | Figma vivant | Contrat v2.3.0 | |
|---|---|---|---|
| défaut de `bouton` | `true` | `true` | ✓ |
| style du CTA | `Link` | `variant: "link"` | ✓ |
| icône droite | `true` | `iconRight: true` | ✓ |
| libellé du CTA | `Contactez-nous` | *(non porté)* → défaut de `ds.button` = `Contactez-nous` | ✓ |
| composition SectionHeader | Standard / Moyen / Gauche / sans accroche2 | idem | ✓ |

**Le contrat est aligné sur le master sur chacun de ces champs. C'est le cliché qui
était périmé.**

Erreur commise et corrigée en cours de route, notée parce qu'elle est instructive :
le contrat avait d'abord reçu `text: "En savoir plus"`, valeur relevée sur les
**usages de page**. Le master, lui, porte « Contactez-nous » — qui se trouve être
exactement le défaut de `ds.button`. Écrire un libellé aurait donc ajouté au contrat
un fait que Figma ne porte pas. Le champ a été retiré : la bonne écriture est le
silence.

---

## 3. Ce qui a été changé dans le cliché — et la preuve que rien d'autre ne bouge

Un cliché est une **capture**, pas un document qu'on édite. Le modifier à la main
demande donc une justification mesurée, pas une conviction. Voici la mesure.

Chaque composant a été ré-empreinté **en vif**, avec exactement la forme que produit
`parity/extract-figma.plugin.js` (`name, nodeId, key, description, variantCount,
properties, nestedInstances`), puis comparé à l'empreinte du même objet dans le cliché.

* **58 sets** relevés en vif, **58** dans le cliché, **aucun** en trop ni en moins.
* **22** empreintes diffèrent.
* En retirant le seul champ `description` de l'empreinte : **1 seule** diffère —
  `Presentation`.

Autrement dit : sur tout ce que le différentiel regarde, **un seul composant a bougé**,
et à l'intérieur, un seul champ. C'est ce champ, et lui seul, qui a été mis à jour :

```
sets[Presentation].properties["Bouton#2103:55"].defaultValue :  false → true
```

Le script d'application refuse de s'exécuter si `nodeId`, `key`, `variantCount`,
`nestedInstances` ou la liste des propriétés ne correspondent pas au relevé vif —
il ne peut donc pas patcher un cliché qui aurait dérivé ailleurs entre-temps.

Après quoi : `npm run parity` → **`✔ No new drift`**.

### Pourquoi une re-capture intégrale n'a PAS été faite

Deux raisons, toutes deux vérifiées :

1. **Le pont utilisé ici rend un `fileName` faux.** `figma.root.name` renvoie
   `"Document"` par cette voie, alors que le cliché porte `"Piqueray (Copy)"`. Une
   re-capture intégrale aurait donc corrompu ce champ. (Sans conséquence sur la porte —
   `parity/diff.ts` vérifie le `fileKey`, pas le nom — mais on ne dégrade pas un
   artefact pour en réparer un autre.)
2. Le pont figma-console du dépôt, qui est la voie normale de rafraîchissement,
   n'était pas joignable dans cette session.

---

## 4. Ce que le relevé a trouvé EN PLUS, et qui n'est pas réparé ici

Nommé plutôt que tu : ces faits sont réels, vivants, et hors du périmètre de 018.

### 4.1 — 21 descriptions de master portent des entités HTML

Les descriptions de 21 composants contiennent `&#39;` au lieu d'une apostrophe.
Ce n'est **pas** un artefact de transport : vérifié en lisant les points de code
depuis l'intérieur de Figma —

```
Facebook.description, les 6 caractères avant « identique » : [108, 38, 35, 51, 57, 59]
                                                              l    &   #   3   9   ;
```

Donc l'entité est **stockée dans le fichier**. Quelque chose les y a écrites en
échappant du texte destiné à être lu par un humain. Composants touchés : `Facebook`,
`Instagram`, `Etoile`, `ArrowRight`, `ArrowLeft`, `OcticonChevronDown12`,
`MemberPicture`, `Carte`, `ProductCard`, `MemberCard`, `Realisation`, `Review-card`,
`Devis`, `Coordonnees`, `SAV`, `Hero`, `CategoriesPrincipales`, `ProduitsECommerce`,
`Realisations`, `HeroVideo` (+ `Bouton`, voir 4.2).

Aucun axe du différentiel ne regarde `description` — le défaut est donc **invisible à
toutes les portes**, ce qui est exactement le profil des dérives que ce dépôt traque.

### 4.2 — Deux descriptions de master citent une version de contrat périmée

* `Bouton` : « generated from contract ds.button **v1.6.0** » — le contrat est en **v2.0.0**.
* `Presentation` : « … ds.presentation **v2.2.0** » — le contrat est en **v2.3.0** depuis ce jour.

Même remarque : `description` n'est sur aucun axe, donc rien ne l'a signalé.

### 4.3 — La prop orpheline `Titre` est confirmée vivante

`Titre#2351:54` existe bien sur le master avec pour défaut « Piqueray, une histoire de
famille », et n'est consommée par **aucun** nœud : l'instance `SectionHeader` porte sa
propre `Titre#2090:47`, posée explicitement. C'est le défaut de source **B013-1**, et il
est toujours là. Déjà nommé dans `NON-PORTES.md` et
`specs/016-canvas-vrai/registre/defauts-source.json`.

### 4.4 — Ce que le différentiel ne peut PAS voir sur une instance imbriquée

`parity/extract-figma.plugin.js` ne relève, pour les instances imbriquées, que leur
**nom** (`nestedInstances: ["SectionHeader", "Bouton"]`) — jamais leur configuration.
Conséquence concrète, et elle est mesurée ici : le passage du CTA de `Default` à `Link`
+ flèche dans Figma **n'aurait allumé aucune porte**. Seul le booléen a été vu, parce
qu'il est une propriété du composant lui-même.

Ce n'est pas une découverte : `docs/08-composition-and-spec.md` l'écrit noir sur blanc
sous « Known gaps (deliberate, next rounds) » — le contrôle de parité d'un `component`
imbriqué est une vérification de **présence**, pas de configuration. Le relevé du jour
en donne le premier reçu chiffré.

À noter dans l'autre sens : le générateur, lui, **écrit** cette configuration. Depuis
la v2.3.0, `figma-sync/29-presentation.js` porte

```json
"depProps": { "Style": "Link", "Icone droite": true }
```

là où il portait `{}`. La direction contrat → canvas gouverne donc ce champ ; c'est la
direction canvas → contrat qui ne le surveille pas.

---

## 5. Les scripts exécutés

Tous en lecture. Reproduits pour qu'un relecteur puisse les rejouer.

### 5.1 — Le relevé du master

```js
const node = await figma.getNodeByIdAsync("2103:2824");
const defs = node.componentPropertyDefinitions;
const instances = node.findAllWithCriteria({ types: ["INSTANCE"] });
// pour chaque instance : name, id, visible, mainComponent, componentProperties
```

### 5.2 — L'empreinte par page (×3 pages porteuses de composants)

Même corps que `parity/extract-figma.plugin.js`, à deux détails près :
`loadAllPagesAsync` est interdit par ce pont et remplacé par
`setCurrentPageAsync(page)` — **un appel par page**, jamais de boucle multi-pages dans
un même script ; et le résultat est réduit à une empreinte FNV-1a 32 bits par set,
pour que la comparaison tienne dans un relevé au lieu de 28 Ko de JSON.

Pages balayées, toutes les 8 : `Pages` (0 composant), `----------------------` (0),
`DS · Tokens` (0), `DS · Atomes` (27), `DS · Molécules` (14), `DS · Organisms` (17),
`Référence — Avis Google` (0), `Utilities` (1, `Slot`, écarté par le filtre de
l'extracteur comme il se doit). Total retenu : **58**.
