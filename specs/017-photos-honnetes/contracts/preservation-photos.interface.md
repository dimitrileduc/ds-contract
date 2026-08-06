# Interface — Préservation des photos jusqu'aux instances de page

**Spec**: 017 · US1 (P1) · FR-001, FR-002, FR-002a, FR-003, FR-003a, FR-003b, FR-004 · SC-001, SC-002
**Surfaces**: `core/emit-figma-script.ts` (émetteur) · `scripts/plugin-engine-mock-figma.mjs` (faux-Figma) · `evals/fixtures/` + `evals/run.ts` (la porte) · `extract/figma/photo-parity/` (le reçu vif)

**Pourquoi un contrat d'interface.** Le sauvetage des photos existe déjà, il est écrit, il est documenté, il a une eval — **et il a laissé perdre 62 photos derrière un rapport vert**. Ce document fixe ce que le geste réparé doit garantir, dans des termes qu'une porte peut refuser, pour que la prochaine régression échoue au lieu de se raconter.

---

## 1 · Le geste, dans l'ordre imposé

L'ordre est le fond du correctif : aujourd'hui la démolition précède le calcul, donc le refus arrive trop tard.

```
1. RELEVER      harvest(comp) ∪ harvest(chaque instance de comp)     → empreintes par (hôte, chemin de position)
2. CALCULER     collectImgSpecTargets(spec de chaque variante)       → emplacements d'accueil
3. DÉCIDER      toute empreinte sans accueil et non acquittée        → REFUS, zéro nœud touché
4. MUTER        remove() des enfants, reconstruction depuis la spec  ← rien avant cette ligne n'a muté
5. REPOSER      par (hôte, chemin de position), maître ET instances
6. RAPPORTER    empreintes retrouvées / déplacées / non replacées / non vérifiables / acquittées
```

**État actuel, pour mémoire** (`core/emit-figma-script.ts`) : 1 → 4 → 5 → 6, sans 2 ni 3, avec un harvest borné à `comp` (`:3965`, `:4108`) et un appariement par **nom** puis « premier paint non réclamé » (`:3849-3850`).

---

## 2 · Les règles, refusables par le nom

1. **La clé d'emplacement est positionnelle.** `(hostId, cheminPosition)`. Le nom de calque est documentaire et ne participe à aucune comparaison (§VIII ; un renommage n'est pas une perte, deux homonymes ne se confondent pas). Le repli « premier paint non réclamé » **disparaît** — c'est lui qui rendait l'interversion invisible.
2. **Le périmètre descend aux instances du maître reconstruit**, et pas plus loin. Borné à `comp`, jamais au fichier : un parcours global sature le bac à sable et fait tomber le plugin (mesuré à ≈ 5 350 nœuds).
3. **Une empreinte sans emplacement d'accueil refuse la reconstruction**, avant toute mutation, en nommant `imageHash`, `hostId`, `cheminPosition`. Seul un acquittement écrit lève, à la photo près.
4. **Deux empreintes qui échangent leur place font échouer le contrôle**, avec les **deux** emplacements nommés. L'interversion est fermée, pas reconduite en limite.
5. **`distinctesApres < distinctesAvant` fait échouer**, avec l'hôte nommé. C'est le canal qui dit l'effondrement quand le compte total n'a pas bougé (« 17 portraits à l'origine, 2 au vif »).
6. **Une empreinte illisible est « non vérifiable », jamais « identique ».** Un contrôle empêché n'est pas un contrôle vert.
7. **Le rapport ne peut pas être vert** si `nonReplacees`, `deplacees` ou `nonVerifiables` est non vide. Les acquittements sont imprimés dans leur propre section.
8. **Deux exécutions sans geste rendent le même verdict.**

---

## 3 · Ce que le faux-Figma doit savoir faire (FR-002a)

Sans ces trois apprentissages, la perte du 2026-08-06 reste **structurellement inatteignable** sans tête : une instance du mock a `children = []`, donc rien à surcharger, donc rien à perdre.

| # | Apprentissage | État aujourd'hui |
|---|---|---|
| 1 | Une INSTANCE **miroite** le sous-arbre de son maître, et ses nœuds miroirs acceptent une surcharge de `fills` | `createInstance()` pose `inst.children = []` (`:247`) |
| 2 | `ImagePaint` existe : `imageHash`, `scaleMode` ; `figma.createImage` et `figma.getImageByHash` répondent | 0 occurrence de chacun |
| 3 | `ComponentNode.getInstancesAsync()` rend les instances du maître, après `loadAllPagesAsync` | non modélisé ; **et non utilisé nulle part dans le dépôt** — prémisse à sonder en lecture avant que le moteur en dépende (research D1) |

**Forme de l'extension — imposée par les trois précédents** (`981e446`, `ddac778`, `e856844`) : le mock passe d'un no-op permissif à **une contrainte qui lève** ; un commentaire in-situ nomme le défaut réel mesuré ; une fixture dédiée est ajoutée sous `evals/fixtures/` ; **elle est branchée comme cas dans `evals/run.ts`** — une fixture que rien ne lance ne protège rien.

---

## 4 · Les trois cas adverses que la porte DOIT faire échouer (SC-002)

Écrits **avant** toute revendication (FR-014, §II).

| Cas | Montage | Attendu |
|---|---|---|
| **A — perte** | maître + N instances portant des empreintes distinctes ; on supprime l'accueil d'une d'elles | le contrôle **échoue** et nomme photo, hôte, rang |
| **B — interversion** | deux plans de même taille sur un même hôte, empreintes échangées à la repose | le contrôle **échoue** et nomme les **deux** emplacements |
| **C — sans accueil** | une empreinte relevée dont aucune part `img` ne peut accueillir | la reconstruction **refuse sans avoir touché un seul nœud** ; avec acquittement au registre, elle passe **et l'acquittement est imprimé** |

Un quatrième cas, non adverse mais obligatoire : **rejouer deux fois sans geste rend le même verdict** (SC-009).

---

## 5 · Le reçu vif (FR-002b) — ce qu'il confirme et ce qu'il ne remplace pas

Le sans-tête **fait foi**. Le fichier client **donne le reçu**, daté, et il confirme ; il ne se substitue pas à la porte.

- Instrument : promotion de `specs/016-canvas-vrai/bridge/photos-census.js` et `tools/photos-verify.mts` vers `extract/figma/photo-parity/`, avec `npm run photos:verify`. **Un déplacement, pas une réécriture** — donc **leur CLI reste la leur**, relevée et non supposée : `photos-census.js` tourne dans le bac à sable via le pont (receiver local requis) ; `photos-verify.mts` est un comparateur **hors ligne** prenant deux recensements en arguments **positionnels** (+ `--out`, `--selftest`). Il n'a **ni `--avant` ni `--apres`**, et appelé nu il sort en `exit(2)`. Toute CLI plus riche serait une réécriture — donc une tâche à part, jamais un effet de bord de la promotion.
- Sans tête, `--selftest` est le seul mode de cet outil : il prouve **le comparateur**, pas les photos du client. **La porte qui fait foi (SC-008) reste le cas d'eval adossé au faux-Figma**, dans `npm run eval`.
- Contraintes vives : fichier ouvert, pont branché, `loadAllPagesAsync`, lotissement obligatoire (le parcours global sature). Ne tourne **ni sans surveillance ni en intégration continue** ; sa fenêtre se planifie avec l'owner.
- **Précondition bloquante (FR-005)** : aucune reconstruction sur le fichier client des composants touchés par l'effondrement des 62 photos avant que leur restauration soit exécutée et prouvée. Le plan de restauration appartient à 016 (`specs/016-canvas-vrai/proofs/repose/photos-instances.json`) et attend le pont. **Le travail sans tête n'est pas bloqué par cette précondition.**
- Réserve à porter : ce plan liste les **97** photos du relevé sans drapeau distinguant « déjà bonne » de « à reposer » ; la répartition 62/35 ne vit que dans le message du commit `51cab06`. À nommer avant de s'en servir comme preuve de précondition.
