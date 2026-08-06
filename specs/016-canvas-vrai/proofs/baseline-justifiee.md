# `parity/baseline.json` re-jugée ligne par ligne — T072 (D11)

**Date du jugement** : 2026-08-06 · **Branche** : `016-canvas-vrai` · **Fichier jugé** : `parity/baseline.json` (3 entrées)

**Règle appliquée (D11)** : zéro entrée de couverture. Chaque acquittement porte sa raison
mesurée, son renvoi à un travail nommé, et sa **condition de levée**. Une entrée baselinée qui
n'apparaît plus au vif est morte et doit être supprimée.

**Mesure de vivacité** — `npm run parity`, relancé pour ce document, **exit 0** :

```
✔ No new drift — 3 acknowledged finding(s) remain in parity/baseline.json.
  [figma BEHIND] Carte.Bouton
  [figma BEHIND] SectionHeader.Bouton
  [icons AHEAD] assets/icons/close.svg
```

**Verdict de vivacité : 3/3 vives. Aucune ligne morte, aucune suppression.** Le différentiel
liste exactement ces trois clés, ni plus ni moins.

| Entrée | Vive | Nature réelle | Tombe quand |
|---|---|---|---|
| `figma\|behind\|Carte.Bouton` | oui | **faux positif d'instrument** — la sonde canvas ne lit que la variante par défaut | la sonde relève l'union des instances sur **toutes** les variantes du set |
| `figma\|behind\|SectionHeader.Bouton` | oui | idem, même cause, même réparation | idem (une seule réparation lève les deux) |
| `icons\|ahead\|assets/icons/close.svg` | oui | **orphelin réel** côté code, retenu par une fixture d'eval vive | la fixture `examples/depth-modal` cesse de lire le dossier d'icônes du dépôt |

---

## 1 · `figma|behind|Carte.Bouton`

**Ce que le différentiel dit** :
`Contract composes ds.button but no Bouton instance exists inside the Figma component`
→ remède imprimé : *« Re-run the component sync script »*.

**La raison au vif — mesurée, pas déduite.**

- **Contrat** (`contracts/carte.contract.json`, v2.0.0) : la part `Bouton` compose bien
  `ds.button` (`anatomy/root/parts/Bouton/parts/action/component.id = "ds.button"`, variante
  `link`, libellé `{ctaLabel}`, glyphes `{ctaIconLeftGlyph}` / `{ctaIconRightGlyph}`) — et elle
  est **conditionnelle** : `visibleWhen: { prop: "disposition", equals: "categorie" }`.
  La prop `disposition` vaut `['reassurance', 'categorie']`, **défaut `reassurance`**, liée en
  VARIANT `Disposition` (`Reassurance` / `Categorie`).
- **Canvas** : l'instance **existe**. Relevé versionné `specs/016-canvas-vrai/proofs/bindings-audit.json`
  (`bindings-audit-final`, master `Carte` `2063:1622`), scanné par POSITION :
  `"0" → Disposition=Reassurance (COMPONENT)`, `"1" → Disposition=Categorie (COMPONENT)`,
  **`"1/2" → Bouton (INSTANCE)`**.
- **Instrument** : `parity/extract-figma.plugin.js:45` —
  `const probe = node.type === 'COMPONENT_SET' ? node.defaultVariant : node;`
  La sonde ne relève les instances imbriquées **que dans la variante par défaut** (= la première
  du set, `Disposition=Reassurance`), précisément celle où la part est absente par `visibleWhen`.
  `parity/diff.ts:574-586` compare ensuite `set.nestedInstances` **sans lire le `visibleWhen`** de
  la part composante.
- **Contre-épreuve côté générateur** : `figma-sync/07-carte.js` — l'instance
  `{"type": "instance", "name": "Bouton", "dep": "Button"}` n'est émise que dans la variante
  `Disposition=Categorie` ; la variante `Disposition=Reassurance` n'en porte aucune. **Le remède
  imprimé est donc inopérant** : re-jouer le script de sync ne changera jamais ce constat, ce
  n'est pas une dérive canvas.

**Classement** : limite de l'instrument de parité, pas une dérive de surface. Rien à réparer côté
contrat, rien à faire côté canvas.

**Ne pas confondre avec le défaut de source ouvert du même nœud.**
`specs/016-canvas-vrai/registre/defauts-source.json` → **`D-016-CARTE-BOUTON`** (statut `ouvert`)
dit tout autre chose : le contrat rend le bouton de la variante Categorie comme **une** part
`action`, alors que l'origine (dump versionné `016/U1a-variables/avant`, master `2063:1622`) porte
**trois** enfants `[Pdf, Libellé, Download/ArrowRight]` avec glyphes par page. Réparation nommée :
**re-extraire** la part bouton (glyphes INSTANCE_SWAP + libellé), pas un geste canvas.
Les deux faits sont indépendants : réparer `D-016-CARTE-BOUTON` **ne lèvera pas** cet acquittement
(le contrat continuera de composer `ds.button` dans une variante non-défaut), et lever cet
acquittement ne répare **pas** l'infidélité du bouton.

**Condition de levée** — cet acquittement tombe quand **l'une** de ces deux réparations
d'instrument est faite :

1. `parity/extract-figma.plugin.js` relève l'**union** des instances imbriquées sur **toutes** les
   variantes du set (aujourd'hui : `defaultVariant` seulement) ; ou
2. `parity/diff.ts` n'exige la présence d'une instance imbriquée que dans les variantes où la part
   composante est visible d'après son `visibleWhen`.

Aucun des deux n'est ouvert à ce jour — c'est une limite **découverte par ce jugement** ; elle
n'était nommée nulle part (ni dans `specs/016-canvas-vrai/`, ni dans `docs/`). Elle est hors du
périmètre de 016 (016 ne touche pas l'instrument de parité) et doit être portée par la spec qui
reprendra la sonde canvas.

---

## 2 · `figma|behind|SectionHeader.Bouton`

**Ce que le différentiel dit** : même phrase, même remède imprimé.

**La raison au vif** — **même cause, mesures propres** :

- **Contrat** (`contracts/section-header.contract.json`, v2.1.1) : part `Bouton` =
  `component: ds.button` (texte `"Voir les produits"`, variante `outlineNoir`), conditionnée par
  `visibleWhen: { prop: "disposition", equals: "avecCta" }`. Prop `disposition` =
  `['standard', 'avecCta']`, **défaut `standard`**, VARIANT `Disposition` (`Standard` / `Avec CTA`).
- **Canvas** : `specs/016-canvas-vrai/proofs/bindings-audit.json`, master `SectionHeader`
  `2090:2397` : `"0" → Disposition=Standard`, `"1" → Disposition=Avec CTA`,
  **`"1/2" → Bouton (INSTANCE)`**. L'instance existe.
- **Générateur** : `figma-sync/09-sectionheader.js` — instance `Bouton` uniquement dans
  `Disposition=Avec CTA`.
- **Preuve croisée que la sonde est bien la cause** : dans **le même** cliché
  `parity/snapshots/figma-components.json` (extrait le 2026-08-06 à 16:32),
  `Presentation` relève `nestedInstances: ["SectionHeader", "Bouton"]` (son bouton vit dans la
  variante unique, donc par défaut), tandis que `Carte` et `SectionHeader` relèvent `[]`.
  Ce qui diffère n'est pas le canvas : c'est **la variante sondée**.

**Condition de levée** : identique au §1 — **une seule** réparation d'instrument (union des
variantes, ou lecture du `visibleWhen`) lève **les deux** entrées ensemble.

**Requalification par rapport au rapport de clôture.** `RAPPORT-CLOTURE.md` §5.2 posait ces deux
lignes comme « masters photo-carrying / avecCta, dits *à traiter hors 016* (O-15) », à consigner
en décision owner. Ce jugement la remplace par un fait mesuré : **il n'y a rien à traiter côté
maquette** — l'instance est là, dans les deux masters, à la position relevée. La décision owner
porte donc sur l'instrument (quand réparer la sonde), pas sur la source.

---

## 3 · `icons|ahead|assets/icons/close.svg`

**Ce que le différentiel dit** :
`code has an icon asset with no registry entry (Figma-first: every icon is born in Figma, FR-008)`
→ remède imprimé : *« add to the registry (promotion, requires a Figma master) or delete the
orphaned asset »*.

**La raison au vif.**

- **Registre** : `contracts/icons.registry.json` v1.2.0 gouverne **19** icônes — `arrow-left`,
  `arrow-right`, `cart`, `chevron-down`, `chevron-left`, `chevron-right`, `chevron-up`, `download`,
  `external-link`, `facebook`, `instagram`, `mail`, `octicon-chevron-down12`, `pdf`, `phone`,
  `piqueray`, `search`, `star`, `user`. **Aucune entrée `close`.** Le fichier
  `assets/icons/close.svg` existe bien sur disque. Le constat est donc **exact** : orphelin réel.
- **Pourquoi lui et pas `check` / `google` / `google-wordmark`** (également hors registre) : la
  classe D7 de `parity/diff.ts:902-937` exempte tout asset consommé par un `icon.asset` **fixe**
  d'un contrat gouverné — `check` ← `ds.checkbox` + `ds.review-card`, `google` ← `ds.review-card`,
  `google-wordmark` ← `ds.google-reviews` (doctrine écrite dans `assets/icons/google.NOTICE.md`).
  `close` n'est consommé par **aucun** des contrats de `contracts/` : il tombe donc dans la règle.
- **Origine** : introduit par le commit `1b134e3` (`ds.banner`, ère démo-51) ; le contrat qui le
  consommait a disparu à la reconversion Piqueray, l'asset est resté.
- **Décision owner déjà consignée** : c'est le **premier** acquittement de l'histoire de ce dépôt.
  `specs/002-governed-icons-button/master-update-report.md` (Q5, 2026-07-23) :
  « *a pre-existing, unrelated leftover (no Figma master ever existed for it; needed only by an
  unrelated eval fixture `examples/depth-modal`, confirmed by testing) — owner-directed: baselined
  in `parity/baseline.json` (first use in this repo), visible in every report, never hidden* ».

**Cette raison de 2026-07-23 est-elle encore vraie ? Oui — re-vérifiée au vif :**

- `examples/depth-modal/modal-composite.contract.json` consomme `icon: { asset: "close", size: 20 }` ;
- `examples/depth-modal/emit-modal-receipt.ts:53-56` lit le dossier **`assets/icons/` du dépôt**
  (`readdirSync(path.join(ROOT, 'assets', 'icons'))`), pas un dossier propre à la fixture ;
- ce reçu est l'entrée du cas d'eval **vif** `emitter-multi-root-modal` (claim C8-journey,
  `evals/run.ts:4600-4625`), **`pass: true`** au dernier sweep (`evals/results.json`) ;
- supprimer l'asset ferait **refuser** l'émission par la porte de validation :
  `core/emit-react.ts:1191` — `part "…" needs icon asset "assets/icons/close.svg" which does not exist`.

**Les deux remèdes imprimés, tranchés :**

- **Promotion au registre** — **exclue en l'état.** Figma-first (FR-008) exige un master Figma né
  dans la maquette : aucun n'a jamais existé pour `close`, et le catalogue Piqueray n'a aucun
  composant modale / dialogue qui le justifierait. Promouvoir ferait entrer au menu d'icônes offert
  à **tous** les composants un glyphe qu'aucun n'utilise — exactement ce que refuse la note de
  marque `assets/icons/google.NOTICE.md`.
- **Suppression** — **impossible aujourd'hui** : elle casse un cas d'eval vif (ci-dessus).

**Condition de levée** — cet acquittement tombe quand `examples/depth-modal` cesse de consommer le
dossier d'icônes **du dépôt**. Le précédent existe déjà ici : les fixtures Polaris ont leur propre
dossier (`examples/polaris/assets/icons/`, lu tel quel par `evals/run.ts`). Le geste net est donc
de déplacer `close.svg` vers un dossier d'icônes propre à la fixture
(`examples/depth-modal/assets/icons/`) et de pointer le reçu dessus : le finding disparaît sans
rien perdre, et sans promotion abusive. Voie alternative, seulement si un composant **gouverné**
en a besoin un jour (aucun aujourd'hui) : un master « Close » né dans la maquette, puis promotion
au registre.

**Hors périmètre 016** : le geste touche une fixture d'eval et son reçu (re-pin), et 016 ne touche
ni `evals/` ni `examples/`. À porter par la spec qui reprendra les evals.

---

## 4 · Le fichier `parity/baseline.json` n'est pas modifié — et voici pourquoi

`parity/baseline.json` est un **tableau JSON de chaînes** `"surface|classification|subject"`.
`parity/diff.ts:964-975` fait `JSON.parse` puis `Array.isArray` et, si le contenu n'est pas un
tableau de chaînes, **ignore le fichier entier** avec l'avertissement
`⚠ parity/baseline.json exists but is not an array of "surface|classification|subject" strings — ignored.`

Il n'existe donc **aucun canal de commentaire ni champ de raison** : y écrire une justification
désarmerait la baseline (tous les acquittements redeviendraient des dérives actives et
`npm run parity` passerait en échec). **Le fichier reste tel quel, à l'octet près, avec ses 3
lignes** ; la justification vit dans ce document.

Les trois clés, inchangées :

```json
[
  "icons|ahead|assets/icons/close.svg",
  "figma|behind|Carte.Bouton",
  "figma|behind|SectionHeader.Bouton"
]
```

---

## 5 · Méthode et reproductibilité

Tout ce document est mesuré, jamais rappelé de mémoire (§IX / D5 : un registre daté n'est pas une
preuve). Les gestes, tous en **lecture seule** — aucune mutation canvas, aucun commit, aucun build :

| Fait établi | Comment le rejouer |
|---|---|
| Vivacité des 3 entrées | `npm run parity` (exit 0, verbatim en tête) |
| Composition + `visibleWhen` des deux parts `Bouton` | lire `contracts/carte.contract.json` (part `Bouton`) et `contracts/section-header.contract.json` (part `Bouton`) |
| L'instance `Bouton` existe sur le canvas | `specs/016-canvas-vrai/proofs/bindings-audit.json` → masters `Carte` `2063:1622` et `SectionHeader` `2090:2397`, nœud `"1/2"` de type `INSTANCE` |
| La sonde ne lit que la variante par défaut | `parity/extract-figma.plugin.js:45` |
| La règle ne lit pas le `visibleWhen` | `parity/diff.ts:574-586` |
| L'instance n'est émise que dans la variante conditionnée | `figma-sync/07-carte.js` (Categorie) et `figma-sync/09-sectionheader.js` (Avec CTA) |
| `Presentation` prouve le contraste | `parity/snapshots/figma-components.json` → `nestedInstances` de `Presentation` vs `Carte` / `SectionHeader` |
| `close` absent du registre, exemption D7 | `contracts/icons.registry.json` + `parity/diff.ts:902-937` |
| La fixture retient l'asset | `examples/depth-modal/emit-modal-receipt.ts:53-56`, `evals/run.ts:4600-4625`, `evals/results.json` (`emitter-multi-root-modal: pass`) |

**Ce que ce document ne tranche pas** (et l'assume) : le **calendrier** des deux réparations de
levée. Les deux sont hors périmètre de 016 — la sonde de parité pour §1-§2, la fixture d'eval pour
§3 — et attendent une décision owner d'ordonnancement, pas une décision de fond : le fond est
tranché ci-dessus, avec ses raisons.
