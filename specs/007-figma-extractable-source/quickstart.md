# Quickstart — Spec 007 : la boucle d'un cycle, de bout en bout

Pour quelqu'un qui reprend l'itération sans l'avoir commencée. Rien ici n'est nouveau : c'est
la conduite de la 005, avec un périmètre de mesure porté de 9 à **43** cibles.

## 0 · Pré-requis (une fois par session)

```bash
node --version                 # ≥ 20
npm run pages:selftest         # 5 fixtures, sans Figma — doit sortir exit 0
```

Côté Figma : **desktop ouvert** sur `Piqueray (Copy)` (`d9FYAUcqdcNtsuaMgLefvJ`) avec le
plugin figma-console connecté. Vérifier :

```
mcp__figma-console__figma_get_status { probe: true }
→ setup.valid: true · probeResult.success: true · connectedFile.fileName: "Piqueray (Copy)"
```

Côté jeton REST : la variable shell est absente, une clé existe dans `.env.local` (validité
non vérifiée). Sans importance ici — tout passe par le pont, qui n'a jamais besoin de REST
(comme en 003 et 005).

**Ne jamais dupliquer le fichier** : une nouvelle `fileKey` invaliderait ancres, snapshots et
tout l'historique de versions.

## 1 · Démarrer le receveur (une fois par jeu de capture)

```bash
node extract/figma/page-parity/receiver.mjs .page-parity/<cycle>/before 9227
```

Il imprime un **nonce** au démarrage. **Le noter** : `capture.js` exige `expectNonce` et
refuse d'envoyer un seul octet si le nonce ne correspond pas. Ce garde-fou existe parce qu'un
receveur encore vivant d'une session précédente a silencieusement avalé 3 captures du mauvais
jeu (incident 003/T018). Un jeu = un receveur = un nonce.

## 2 · La séquence d'un cycle

```text
0. version      figma_execute → bridge/checkpoint.js, label "007/<passe>/<étape>"  → versionId
1. relevé       bridge/scan.js (lecture seule, par POSITION)                       → releves/
2. annonce      le diff attendu, écrit dans decisions.md AVANT toute écriture
3. AVANT × 43   bridge/capture.js, une cible à la fois, nom PRÉFIXÉ par la page
4. contrôle     43 PNG non vides, dimensions plausibles  → sinon STOP, aucune écriture
5. geste(s)     figma_execute — script transcrit verbatim dans proofs/<cycle>/gestes.md
6. APRÈS × 43   même receveur, même nonce
7. verdict      npm run pages:compare -- --before … --after … --out proofs/<cycle>
8. artefacts    proofs/<cycle>/{verdict.json,verdict.md,crops/,gestes.md}
```

**Les étapes 0 à 4 précèdent toute écriture. Sans exception.**

### Capturer une cible

```js
// 1er figma_execute
globalThis.__dsc003_input = {
  maquette: 'DS-Organisms__Formulaire',   // ⚠ PRÉFIXE DE PAGE OBLIGATOIRE
  nodeId:   '2096:2565',
  port:     9227,
  expectNonce: '<le nonce imprimé par receiver.mjs>'
};
// 2e figma_execute : le texte de extract/figma/page-parity/bridge/capture.js
```

**Le préfixe n'est pas cosmétique** : 12 noms de section se répètent entre pages
(`Formulaire`, `Header`, `Footer`, `Hero`, `Présentation`, `Coordonnées`, `SAV`, `Texte SEO`,
`Réassurances`, `Catégories principales`, `Produits e-commerce`, `Réalisations`). Sans lui,
une capture en écrase une autre **en silence** et le verdict reste vert sur une cible non
mesurée.

Pour les 9 maquettes, reprendre les libellés exacts des cycles 005 (`Dépannage_SAV`,
`Portes d_entrée`, …) : le suivi des 4 résidus (FR-024a) se lit par nom de cible d'un cycle
à l'autre, et un libellé qui change casse la série.

### Les 43 cibles

| Page | nodeId de page | Cibles |
|---|---|---|
| `Pages` | `210:325` | les 9 maquettes (enfants FRAME) |
| `DS · Atomes` | `2052:1144` | 5 enfants |
| `DS · Molécules` | `2052:1145` | 13 enfants |
| `DS · Organisms` | `2052:1146` | 16 enfants |

Les nodeIds se re-sondent en début de session (`page.children`) — **ils périment**, on ne les
recopie pas d'un cycle à l'autre sans les revérifier.

## 3 · Lire le verdict

```bash
npm run pages:compare -- --before .page-parity/<cycle>/before \
                         --after  .page-parity/<cycle>/after  \
                         --out    specs/007-figma-extractable-source/proofs/<cycle>
```

| Exit | Sens | Que faire |
|---|---|---|
| `0` | 43/43 `identical` | ✅ le lot 0-pixel est acquis |
| `1` | ≥1 `diff` | si le lot annonçait 0 pixel → **STOP**, lot annulé **en entier** ; si un diff était annoncé → comparer à l'annoncé, joindre le crop |
| `2` | `capture-failed` / `dimension-mismatch` / entrée manquante | **la preuve n'a pas eu lieu** — refus, jamais une dégradation vers « identique » |

**Regarder le crop, toujours.** Un écart n'est jamais requalifié en « bruit de rendu » sans
avoir été ouvert dans l'image. Receipt du dépôt : deux bugs réels (un gras perdu, un
espacement de paragraphe) ont été trouvés par l'owner **en regardant l'image**, après qu'un
diff eut été classé bruit.

## 4 · Ce que le pixel ne prouve pas — et comment on le prouve quand même

Une variable créée non consommée, une description, un marqueur de style : **aucun rendu**,
donc aucun pixel. L'absence de preuve est **déclarée telle quelle**, jamais convertie en
« identique ». Ces états se vérifient par relevé live :

```js
// contrôle SC-013 après le lot typographique
const styles = await figma.getLocalTextStylesAsync();
return styles.map(s => ({
  name: s.name,
  bound: Object.keys(s.boundVariables || {}).length,
  marker: s.getPluginData('ds_contracts/textStyleToken') || null
}));
// attendu : 18 lignes, bound > 0 et marker non nul sur les 18
```

## 5 · Le relevé de notes (ouverture et clôture)

Procédure complète : `contracts/note-census.md`. Les deux pièges à ne pas redécouvrir :

1. `extract/figma/dump.plugin.js` l. 66 est committé `TARGET_SETS = ['Badge','Switch','Card']`.
   **L'éditer localement en `[]`** avant de banker — sinon le relevé porte **3 sets, pas 55**.
   Cette édition **n'est jamais committée** (FR-025).
2. **Aucun compteur n'existe** dans le dépôt : `tools/note-census.mjs` est le livrable qui le
   fournit, en appelant `proposeBatchFromDump` et en classant par préfixe.

## 6 · Valider un nom AVANT de le poser

```bash
node specs/007-figma-extractable-source/tools/name-oracle.mjs "SectionHeader" --kind set
# → CLEAN   (pascal stable, aucune note d'id)
node specs/007-figma-extractable-source/tools/name-oracle.mjs "Hero video" --kind set
# → NOTED (A)  — le PascalCase strict est exigé : "HeroVideo"
```

Retirer les accents **ne suffit pas** pour un nom de set. Aucune ligne de la table de nommage
n'est exécutable tant que l'oracle ne rend pas `CLEAN`.

## 7 · Rollback

**Aucune API de restauration programmatique n'existe.** La restauration est un geste humain
guidé : Figma desktop → *Show version history* → restaurer le point nommé
(`007/<passe>/<étape>`), puis **re-prouver** par l'instrument (capture fraîche vs le `before/`
du cycle annulé → doit rendre 43/43 `identical`). Consigner l'échec et le retour dans
`decisions.md`.

**Interdit** : un retour arrière rétroactif pour combler une preuve manquante après coup —
règle owner, « encore plus dangereux ».

## 8 · Les gates du dépôt

Attendu en clôture : **statu quo strict**, aucun fichier hors
`specs/007-figma-extractable-source/` modifié.

```bash
npm run build && npm run parity && npm run eval && npm run plugin:check \
  && npx tsx scripts/deterministic-roundtrip.mjs && node scripts/core-browser-check.mjs \
  && npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

`parity` lit des **snapshots committés**, jamais le fichier live : les renommages canvas ne le
rougissent pas. Une réserve, à connaître avant de s'en inquiéter : il refuse les snapshots de
plus de **14 jours** (`MAX_SNAPSHOT_AGE_DAYS`, défaut 14), et les snapshots datent du
**2026-07-25**. Si l'itération dépasse cette fenêtre, le rouge est une **péremption**, sans
rapport avec le travail : le lever par la variable d'environnement, **jamais** par un
rafraîchissement de snapshot (qui, lui, ferait entrer les renommages dans le différentiel).
