# Deux défauts moteur qui bloquent la régénération du canvas

**Date** : 2026-08-05 · **Trouvés par** : le lot pilote `R-pilote-tab` (un composant, avant
d'en toucher 44) · **Statut : bloquants, correctifs en cours**

Ces deux défauts sont la raison pour laquelle **US3 n'a pas été exécutée**. Ils ne sont pas
dans les contrats ni dans le design : ils sont dans l'émetteur qui écrit le canvas.

---

## Pourquoi un pilote

Le plan prévoyait de régénérer les cibles divergentes par lots. L'audit de liaison (T056a) a
montré que la population réelle était bien plus large que ce que `parity` voit :

```
58 masters · 3 avec au moins une liaison · 55 SANS aucune
1 261 nœuds portent une largeur/hauteur — 1 256 n'ont AUCUNE liaison
```

Régénérer « les 44 masters sans photo » d'un coup était tentant : risque nul côté images,
gros gain de liaisons. **Un seul composant a été fait d'abord.** Il a suffi.

## Défaut 1 — la famille de police est codée en dur à `Inter`

**Constaté** sur le canvas réel après régénération de `Tab` : les nœuds texte portent
`fontName.family = "Inter"`, alors que les tokens du projet prescrivent **Montserrat**
(`font.family.montserrat` = `"Montserrat, sans-serif"`).

**Cause**, `core/emit-figma-script.ts:3378` :

```js
node.fontName = { family: 'Inter', style: spec.fontStyle || 'Medium' };
```

Autres occurrences : lignes 674, 676, 3244, 3289, 3302.

Un rattrapage existe juste après — si le nœud porte un `textStyle` nommé, le script le lui
applique. **Mais il est inopérant** : `TEXT_STYLES` est vide dans le script de tokens généré
(mesuré en US1 : `textStyles: { total: 0, created: 0 }`). Le filet ne rattrape rien.

**Portée** : *tout composant portant du texte*. C'est-à-dire la quasi-totalité du système.
Une régénération complète aurait remplacé la typographie de l'ensemble du design system.

> **C'est l'owner qui l'a vu, à l'œil, en regardant la revue visuelle** — pas l'instrument.
> `pages:compare` avait rendu `exit 2` (dimension-mismatch) et l'analyse en cours concluait
> « le canvas dit ce que dit le contrat ». C'était vrai **pour la géométrie**, et faux pour
> la police. Un verdict pixel qui refuse de se prononcer n'est pas un verdict de conformité.

## Défaut 2 — une couleur de bordure sans largeur devient un cadre plein

**Constaté** : après régénération, les onglets **non sélectionnés** portent un contour complet
(`strokes: 1`, `strokeWeight: 1`). Avant, seul l'onglet actif était souligné.

**Le contrat est juste.** `ds.tab` déclare :

```jsonc
"tokens":         { "border-color": "{color.noir-bleute}" },
"literalsByProp": [{ "prop": "etat", "map": { "selectionne": { "border-bottom-width": "2px" } } }]
```

En CSS, une couleur de bordure **sans largeur ne dessine rien** — comportement normal et
courant. Sur le canvas, la même déclaration a produit un stroke visible sur les quatre côtés.

**Portée mesurée** : **11 parts sur 8 contrats** déclarent une couleur de bordure sans largeur
permanente —

| Contrat | Parts |
|---|---|
| `ds.google-reviews` | 4 (`resume`, `ecrireAvis`, `flecheGauche`, `flecheDroite`) |
| `ds.accordion-row`, `ds.footer`, `ds.input`, `ds.review-card`, `ds.select`, `ds.tab`, `ds.textarea` | 1 chacune |

Ce sont tes champs de formulaire, tes cartes d'avis, ton footer.

## Ce qui a été fait sur le canvas, et ce qui reste

| | |
|---|---|
| Point de restauration | `016/R-pilote-tab/avant` → `2384277698227071279` |
| Geste correctif ciblé | police remise à **Montserrat/SemiBold**, strokes parasites retirés, bordure basse de 2 px **conservée** sur l'état sélectionné |
| **Maquette `Dépannage/SAV`** | **byte-identique à l'état d'avant le pilote** (`c4acfdf1b9512cec`) ✅ |
| Master `Tab` (page DS) | boîte encore régénérée : 106×261 → 163×202 — **transitoire**, sera écrasé à la prochaine régénération |

**Prémisse re-testée plutôt que recopiée** : l'API du plugin n'expose ni `restoreVersionAsync`
ni `revertAsync` ni `getVersionHistoryAsync` (seuls `saveVersionHistoryAsync`, `triggerUndo`,
`commitUndo` existent). La note du dépôt du 2026-07-23 tient toujours : **la restauration
d'une version est un geste humain dans l'interface**.

## Ce que ça dit de la méthode

Le cycle de preuve a fonctionné exactement comme prévu — mais **pas par le canal attendu**.

- L'annonce écrite avant le geste a permis de confronter l'observé à l'attendu.
- Le pilote sur **un** composant a contenu le dégât à un composant au lieu de 44.
- Le verdict pixel a refusé de conclure (`exit 2`) au lieu d'inventer un succès.
- **Et c'est un œil humain sur une image qui a nommé la vraie régression.**

La leçon à porter au rapport de clôture : *un instrument qui refuse de se prononcer n'autorise
pas à conclure ; et une revue visuelle lisible vaut un verdict, parce qu'elle rend le défaut
visible à quelqu'un qui connaît le design.*

## Suite

Trois correctifs moteur sont en cours de préparation (police, bordure, et le volet `slot fill`
de `field`), chacun **fixture rouge d'abord** (§II) puis soumis à un vérificateur adversarial
dont la consigne est de refuser. Aucun ne sera appliqué sans son verdict.

La régénération reprendra **après** — elle est rapide : le pilote a montré qu'un composant
coûte moins d'une minute de cycle complet.
