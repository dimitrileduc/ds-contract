# Interface — protocole de poussée générative (contrat → canevas)

**Statut** : épinglée par la spec 006. Toute évolution passe par une entrée `decisions.md`.

La spec 006 est la **première** du dépôt à exécuter un script `figma-sync/` généré contre le fichier
Piqueray vivant. Les 5 contrats existants ont tous été *extraits* de masters dessinés à la main, et
`figma-sync/02-button.js` n'a **jamais** été exécuté — délibérément. Ce document est le garde-corps
de cette première.

---

## 1. Les quatre interdits

1. **Jamais `01-tokens.js`.** Il ré-upserte les collections de variables du fichier. Elles ont déjà
   été poussées en 001 ; les rejouer est un risque sans contrepartie.
2. **Jamais `batch-01.js`.** Il embarque tous les composants, dont le Bouton — dont le script
   **reconstruit l'intérieur** de chaque variante et détruirait les slots d'icônes, orphelinant les
   glyphes échangés et les libellés surchargés des instances de maquette. Danger identifié et refusé
   dès la spec 001.
3. **Jamais un `component`-ref vers `ds.button`** dans un contrat 006. Les dépendances imbriquées se
   résolvent **par nom** (`findComponentByName`) : le contrat s'appelle `Button`, le master vivant
   « Bouton » → le script **échouerait**, et une « réparation » naïve créerait un **second set
   Button** à côté du vrai.
4. **Jamais de contrat sans `fileKey`.** Le garde-fou « mauvais fichier » se lit
   `if (EXPECTED_FILE_KEY && …)` où `EXPECTED_FILE_KEY` vaut `contract.anchors.figma.fileKey` : un
   contrat neuf a `null` ⇒ **le garde-fou est éteint** et le script construit dans le fichier où le
   pont est pointé, quel qu'il soit. `anchors.figma.fileKey` est donc renseigné **dès le premier
   commit**, et **sa présence est vérifiée dans le script émis avant exécution**.

---

## 2. Transport

**Route retenue** : `npm run figma:serve` + le plugin Sync Runner packagé — la **seule** qui produit
`figma-sync/.runner-result.json`, que `npm run anchors:writeback` consomme (sinon l'écriture des
ancres est manuelle et se fait par appariement de noms, la fragilité même dénoncée en 002).
Restreindre l'ensemble servi aux **deux** scripts de composant.

**Repli** : la route `GET /file?name=` de `extract/figma/page-parity/receiver.mjs`, construite en 003
pour qu'une grosse source tienne en un seul GET (les scripts font 40-50 Ko). Dans ce cas, les ancres
se lisent dans la valeur de retour du script (`{name, nodeId, key}`) et s'écrivent explicitement.

**Ordre imposé** : `NN-reviewcard.js` **puis** `NN-googlereviews.js`. La section instancie la carte
et la cherche par nom : elle doit exister d'abord.

---

## 3. Identité, renommage, rangement

- **L'identité d'un master est le marqueur `ds_contracts/contractId`**, pas son nom. Un re-run
  retrouve le set même renommé ou déplacé de page.
- **Mais la résolution de dépendance passe par le nom.** Donc, tant qu'un re-push de la section
  reste possible, **le master de carte doit porter le nom du contrat** (`ReviewCard`).
- **Le renommage français** (`ReviewCard` → `Review-card`, `GoogleReviews` → `Avis Google`) est le
  **dernier geste canevas de la spec**, après adoption complète. La procédure inverse — renommer en
  arrière avant tout re-push futur — est consignée dans `decisions.md` et dans `quickstart.md`.
- La création pose **une page par composant**, nommée d'après le composant, et **seulement à la
  première création**. Les deux sets sont ensuite déplacés vers `DS · Molécules` et `DS · Organisms`,
  et les pages auto-créées supprimées — un geste canevas à part, avec sa propre preuve 9/9.

---

## 4. Amend : ce qui survit, ce qui meurt

Un re-run sur un set déjà marqué appelle `amendSet`, qui **supprime et reconstruit l'intérieur de
chaque variante**.

| Survit | Meurt |
|---|---|
| l'id du set, sa `key` | les overrides de propriétés d'instances **imbriquées** |
| l'id de chaque variante | les overrides de texte bruts |
| la **clé** de chaque propriété de composant — donc les **valeurs** portées par les instances | les **overrides de fill image** |

**Trois règles qui en découlent :**

1. **Toute donnée par occurrence doit chevaucher une propriété de composant.** Aucun override brut
   pour du contenu.
2. **Après la première adoption, `ds.google-reviews` ne doit plus être amendé** — un amend
   détruirait le contenu des avis sur les 8 occurrences. Si un amend devient inévitable, les 8
   occurrences se **rejouent depuis `ledger/google-reviews.json`**, seule sauvegarde.
3. **Les 8 fills photo s'appliquent APRÈS le dernier amend** : c'est la donnée la plus fragile.

**Conséquence de séquencement, structurante** : l'adoption ne commence **que** lorsque la
convergence (jambe A, code ↔ aplat) **et** le portage (jambe B, code ↔ master) sont signés dans
`decisions.md`. C'est ce qui rend la boucle hors-ligne obligatoire et non décorative.

---

## 5. Points de restauration

`saveVersionHistoryAsync(label)`, label validé par `/^\d{3}\/[^/]+\/[^/]+$/` — la regex élargie
**arrive au merge de 005** ; sans ce merge, **aucun label 006 n'est posable** et FR-003 est
inatteignable. Ne **jamais** contourner en préfixant `003/006-…` : cela empoisonnerait l'historique
du fichier d'une fausse attribution de spec.

Schéma : `006/masters/creation` · `006/masters/iteration-N` · `006/masters/rangement` ·
`006/adoption/<maquette>` ×8 · `006/demo/us4` · `006/cloture/renommage`.
Chaque `{label, versionId}` est consigné dans `decisions.md`.

---

## 6. Preuve exigée après chaque geste canevas

| Geste | Preuve attendue |
|---|---|
| Création des masters | `pages:compare` **9/9 identical** — créer des pages et des masters ne doit toucher **aucun** pixel de maquette. C'est aussi le détecteur si `01-tokens.js` ou `batch-01.js` a été exécuté par erreur. |
| Rangement (déplacement + suppression de pages) | **9/9 identical** |
| Adoption d'une occurrence | **exit 1** : 8 `diff` attendus au fil des adoptions, `Motorisation` `identical`, et `outsideDiffCount === 0` partout |
| Démonstration US4 (page de travail + instance d'essai, créées puis supprimées) | **9/9 identical** à la suppression (T072) — une démonstration ne laisse aucune trace sur les maquettes |
| Renommage final | **9/9 identical** |

**Une seule occurrence à la fois.** Preuve complète 9 pages + relecture des bornes des frères du
`GROUP` + revue à l'œil sur crops + accord owner **avant** l'occurrence suivante. Jamais de lot.
