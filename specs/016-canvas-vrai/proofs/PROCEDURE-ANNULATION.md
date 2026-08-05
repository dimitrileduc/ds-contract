# Procédure d'annulation d'un lot — 016

**Écrite le 2026-08-05, AVANT d'en avoir besoin** (T055). C'est ce qui la rend
applicable : sous pression, on n'invente pas une procédure, on l'exécute.

---

## Quand elle s'applique

**Dès qu'un écart hors annonce est constaté** — c'est-à-dire dès que `pages:compare`
rend un `diff` que `proofs/<lot>/annonce.md` ne couvrait pas, ou que le rapport d'un
script contredit ses comptes annoncés.

> **Le lot est annulé EN ENTIER.** Jamais partiellement, jamais « on garde ce qui
> marche ». Un lot est l'unité de preuve : à moitié prouvé, il n'est pas prouvé.

### Ce qui n'est PAS une annulation

| Situation | Traitement |
|---|---|
| Diff **couvert** par l'annonce (y compris chiffré) | verdict `conforme`, on continue |
| Échec **avant** toute écriture (fetch, syntaxe, garde de fichier) | pas de mutation ⇒ pas d'annulation ; on corrige l'outillage et on rejoue (cas O-5) |
| Capture vide ou mal dimensionnée **avant** le geste | STOP §X, zéro écriture — on ne va pas jusqu'au geste |

### L'interdit central

**Un écart imprévu ne se requalifie JAMAIS après coup en « bruit acceptable ».**
Si l'écart n'était pas dans l'annonce écrite avant le geste, il est imprévu — quelle que
soit son innocence apparente une fois qu'on le regarde. Le veto T005 est l'exemple à
suivre : 75 pixels ont arrêté le chantier jusqu'à ce que leur cause soit établie et
qu'une règle en sorte.

---

## La procédure, dans l'ordre

### 1. Arrêter — ne rien tenter de réparer sur le canvas

Aucun geste correctif, aucune retouche « pendant qu'on y est ». Le fichier reste dans
l'état où l'écart a été constaté. Toute écriture supplémentaire détruirait la preuve.

### 2. Consigner l'écart, tel qu'observé

Dans `specs/016-canvas-vrai/decisions.md`, ligne du lot :

- l'annonce (ce qui était attendu, verbatim),
- l'observé (verdict `pages:compare`, `diffCount`, `diffBox`, rapport du script),
- le `versionId` du point de restauration du lot.

### 3. Restaurer — **geste MANUEL guidé**

**Il n'existe aucune API de restauration programmatique** (vérifié en 003, 2026-07-23) :
`saveVersionHistoryAsync` écrit un point nommé, rien ne le rejoue. La restauration est
donc humaine :

1. Figma desktop → fichier `d9FYAUcqdcNtsuaMgLefvJ` (« Piqueray (Copy) »)
2. Menu → **Fichier › Afficher l'historique des versions**
3. Retrouver l'entrée nommée **`016/<lot>/avant`** (le `versionId` est au journal)
4. **Restaurer cette version**

> C'est le seul moment du chantier qui exige une action de l'owner dans l'interface.
> L'agent ne peut pas la faire à sa place — il guide, il vérifie ensuite.

### 4. Re-prouver la restauration contre les captures d'AVANT

La restauration n'est pas acquise parce qu'on a cliqué : elle se prouve.

```bash
node extract/figma/page-parity/receiver.mjs .page-parity/<lot>/restaure 9231
# relever le nonce, puis (règle O-3) PRÉCHAUFFAGE puis capture des mêmes cibles
npm run pages:compare -- --before .page-parity/<lot>/before \
                         --after  .page-parity/<lot>/restaure \
                         --out    specs/016-canvas-vrai/proofs/<lot>/restauration
```

**Attendu : N/N `identical`** contre les captures d'AVANT du lot annulé. Tant que ce
verdict n'est pas obtenu, le fichier n'est **pas** revenu à son état antérieur et rien
ne reprend.

⚠️ **Ne pas confondre les deux comparaisons.** Le verdict qui compte oppose
`before` ⟷ `restaure`, pas `after` ⟷ `restaure`.

### 5. Écrire la CAUSE avant toute reprise

Dans `proofs/<lot>/annulation.md` :

- ce qui a été observé, chiffré ;
- **pourquoi** l'annonce ne le prévoyait pas — c'est le vrai livrable : une annonce
  fausse est un défaut de méthode, pas de chance ;
- ce que le prochain essai fera différemment (annonce corrigée, relevé vif refait,
  périmètre de capture élargi…).

**Aucune reprise du lot sans cette page.** Rejouer un lot dont on ne sait pas pourquoi
il a dérivé, c'est refaire le même geste en espérant un autre résultat.

### 6. Rejouer le cycle complet

Le lot repart à l'étape 1 de `contracts/proof-cycle.md` : nouveau point de restauration,
**nouveau relevé vif** (le fichier a bougé : il a été restauré), nouvelle annonce,
nouvelles captures. Jamais de reprise à mi-cycle.

---

## Cas particulier : plusieurs lots déjà passés

Si un lot `Rn` doit être annulé alors que `R1…Rn-1` sont clos et prouvés, restaurer
`016/Rn/avant` **ne défait que `Rn`** — c'est le point de l'historique nommé juste avant
son geste.

En revanche, si l'écart révèle qu'un lot **antérieur** était faux, la restauration
remonte à son point à lui et **tous les lots suivants sont annulés avec** : ils ont été
prouvés contre un état qui n'était pas celui qu'on croyait.

C'est exactement pourquoi T060 exige le verdict photos **lot par lot** et non à la fin —
une interversion détectée tard coûte la restauration de tous les lots qui ont suivi.

---

## Pré-vol : ce qui doit être vrai avant d'ouvrir un lot

Une annulation coûte cher ; la plupart s'évitent au départ.

- [ ] Pont identifié, **port re-vérifié au vif** (jamais recopié — O-1)
- [ ] Receveur démarré, `instrument: "page-parity"` et **nonce relevé et pinné**
- [ ] Joignabilité du receveur **prouvée depuis le sandbox** (`fetch` de test — O-5 : le
      manifest sur disque ne dit pas ce que le plugin accepte)
- [ ] Point de restauration posé, `versionId` au journal
- [ ] **Relevé vif** de la structure, juste avant d'écrire (fichier vivant)
- [ ] **Annonce écrite** — chiffrée depuis le relevé, jamais « identique » présumé
- [ ] **Préchauffage** puis capture AVANT de **toutes** les cibles (O-3, §X)
- [ ] Captures vérifiées : non vides, dimensions attendues
