# Reposer une photo sur le canevas — la voie qui marche, et les fausses pistes qui l'ont retardée

**Éprouvée le 2026-08-07** sur le fichier client (`d9FYAUcqdcNtsuaMgLefvJ`) : 8 photos
reposées en trois gestes, dont 3 dont les octets avaient été **purgés du fichier**
(`figma.getImageByHash` rendait `null`). Reçu complet :
`specs/017-photos-honnetes/proofs/vif/recu-repose-complete.json`.

> **Ce fichier s'appelait `REPOSE-MANUELLE.md`.** Il décrivait quatre voies fermées et
> renvoyait l'owner à un glisser-déposer manuel. **Deux de ses affirmations étaient fausses**,
> et elles sont corrigées plus bas plutôt qu'effacées : le bac à sable *a* accès au réseau, et
> les hashes reposés *sont* identiques aux originaux. La leçon vaut plus que le tableau :
> une conclusion du dépôt n'est pas un fait, elle se re-teste.

---

## La voie : les octets bruts par le receveur page-parity

Le receveur (`extract/figma/page-parity/receiver.mjs`) sert déjà n'importe quel fichier de
son propre dossier via `GET /file?name=<relatif>`, chemin verrouillé au dossier de
l'instrument. Le bac à sable du plugin sait faire `fetch` vers `localhost:9223-9232` (le
manifeste l'autorise). Donc :

```js
const octets = new Uint8Array(
  await (await fetch('http://localhost:9229/file?name=_travail/photo.jpg')).arrayBuffer()
);
if (octets.length !== ATTENDU) throw new Error('octets ' + octets.length + ' — AUCUNE mutation');
const image = figma.createImage(octets);

const fills = JSON.parse(JSON.stringify(noeud.fills));   // copie, jamais mutation en place
const i = fills.findIndex((f) => f.type === 'IMAGE');
fills[i].imageHash = image.hash;
noeud.fills = fills;                                      // RÉAFFECTATION
```

**Une image = un appel.** Ni base64, ni découpage, ni plafond de taille : les octets ne
transitent par aucun résultat d'outil. Testé jusqu'à 350 690 octets d'un coup.

**Si le hash existe encore dans le fichier**, il n'y a même pas d'octets à transporter —
`fills[i].imageHash = '<hash de 40 caractères>'` suffit. Vérifier d'abord avec
`figma.getImageByHash(h)` : non-`null` ⇒ la voie courte s'applique.

### Récupérer les octets d'une image purgée

`GET /v1/files/:key/images` (REST, lecture) rend une carte `imageRef → URL S3`, et **elle
sert encore les refs purgées du document** : les objets S3 survivent à la purge. C'est par là
que les 3 images perdues ont été retrouvées, sans passer par une version antérieure.

---

## Ce qui NE marche PAS — et ce qui a été mal noté

| voie | verdict |
|---|---|
| `figma_execute` avec le base64 en ligne | **la SORTIE est tronquée** (~3 770 caractères utiles sur 25 496). L'entrée, elle, passe. |
| `figma.createImageAsync(<URL S3 signée>)` | refusé — `does not satisfy the allowedDomains` |
| `figma.createImageAsync('http://127.0.0.1:<port>/x.png')` | refusé — `127.0.0.1` n'est pas `localhost` pour cette politique |
| `figma.createImageAsync('http://localhost:9231/x.png')` | refusé **bien que le domaine soit au manifeste** — `createImageAsync` est plus strict que `fetch` |
| ~~`fetch` puis `figma.createImage`~~ | ❌ **NOTÉ À TORT COMME FERMÉ.** Voir ci-dessous. |

### Correction 1 — le bac à sable A un accès réseau

L'ancienne version affirmait : « le thread principal du plugin n'a aucun accès réseau ; seul
l'`<iframe>` de l'UI en a ». **Faux.** C'est la voie employée pour la totalité du chantier du
2026-08-07 : toutes les captures, tous les recensements, tous les octets d'image. Le
`Failed to fetch` d'origine venait presque sûrement d'un **receveur non démarré** ou d'un
**port hors de la plage 9223-9232**, pas d'une interdiction.

### Correction 2 — les hashes reposés sont IDENTIQUES aux originaux

L'ancienne version affirmait : « Les nouveaux `imageHash` DIFFÉRERONT des originaux — Figma
ré-adresse au contenu à l'upload », et en tirait qu'il fallait contrôler l'identité sur les
octets. **Faux, et c'est une bonne nouvelle** : `imageHash` **est** un hash de contenu. Pour
les mêmes octets, Figma recalcule exactement le même hash. Mesuré trois fois :

| octets reposés | hash recalculé par Figma | hash au relevé d'avant-016 |
|---|---|---|
| 98 909 | `031815a6a17c` | `031815a6a17c` ✅ |
| 350 690 | `dc3a406f3ce6` | `dc3a406f3ce6` ✅ |
| 244 879 | `a578caed28b1` | `a578caed28b1` ✅ |

**C'est le contrôle d'intégrité le plus fort disponible** : un hash identique prouve des
octets identiques, sans rien recalculer soi-même. À préférer à toute somme maison — la
première tentative de FNV-1a côté bac à sable était d'ailleurs fausse (la multiplication
32 bits dépasse la précision de `float64` en JS ; il faut `Math.imul`).

---

## Le cycle obligatoire autour du geste (constitution §X)

Le hook `.claude/hooks/figma-visual-proof.sh` refuse toute mutation `figma-console` sans
capture récente sous `.page-parity/`. Il a raison, et il ne se contourne pas :

1. `node extract/figma/page-parity/receiver.mjs .page-parity/<jeu>/before 9229`
   — noter le **nonce** imprimé, `capture.js` le vérifie.
2. `bridge/capture.js` sur **TOUTE** cible affectée. *Toute* : pour une photo de master,
   cela inclut chaque maquette qui l'instancie. Jamais un sous-ensemble pilote.
3. `bridge/checkpoint.js` — libellé `\d{3}/<incrément>/<étape>`.
4. la mutation.
5. capture APRÈS (receveur sur `.../after`) puis
   `npm run pages:compare -- --before … --after … --out …`.

Les scripts de pont se chargent en un `GET /file?name=bridge/capture.js` puis `eval` — leur
source ne pèse alors sur aucun `figma_execute`.

---

## Conclure sur l'image, jamais sur un compte de hashes

Leçon payée deux fois le 2026-08-06 (l'owner a dû le dire deux fois) : un rapport a annoncé
« 2 images distinctes → 17 » alors que les portraits reposés étaient sur un plan **masqué**,
puis « c'est réparé » alors que l'owner regardait **un autre nœud**.

Toute vérification photo doit donc :

- résoudre **l'ordre z et l'opacité** — un `children[0]` est au fond dans une pile, mais c'est
  le premier bloc d'un auto-layout vertical, ce qui n'a rien à voir ;
- identifier **le nœud que l'owner regarde** (master ? instance de page ? quelle variante ?) ;
- conclure sur une **capture** — le triptyque avant/après/diff de `pages:compare`, ou
  `figma_capture_screenshot`.

Et vérifier l'**appariement**, pas seulement la distinction : trois photos distinctes mais
mal réparties restent un défaut. Le contrôle utile est photo ↔ titre de la carte.
