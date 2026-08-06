# Limites levées — reçu 016 (T050)

**Date** : 2026-08-06

Recensement des **limites nommées côté code qui n'existaient que pour tolérer un défaut
corrigé par 016** — et toilettage, dans les contrats eux-mêmes, des descriptions que ces
corrections ont rendues fausses. Règle de rédaction (claims rule) : chaque phrase de
capacité **nouvelle** nomme la fixture qui la couvre ; quand rien ne la couvre, la phrase
reste au conditionnel — jamais l'inverse.

**État des quatre fixtures citées** : `evals/fixtures/{composed-child-slot-content-check,
text-prop-and-visible-refs-coexist-check, zero-height-line-part-check,
dep-resolved-by-marker-check}.ts` — toutes **vertes** au relevé du 2026-08-06 en exécution
autonome (`npx tsx evals/fixtures/<nom>.ts`, exit 0). Elles ne sont **pas encore
enregistrées** comme cas dans `evals/run.ts` : le `N/N` de `npm run eval` ne les compte
pas — dit ici pour ne pas surdéclarer (conventions d'honnêteté).

---

## 1 · Limites de contrat levées — descriptions corrigées ce jour

### 1.1 `ds.section-header` — `emphase` : code-only (kind: NONE) → VARIANT « Emphase » (2.1.0)

- **L'ancienne limite** (texte du contrat jusqu'à ce toilettage) : « LIMITE NOMMÉE —
  abstraction code-side sur des surcharges d'instance Figma ad hoc […] Le correctif de
  fond appartient à Figma : promouvoir ces surcharges en variantes réelles, après quoi
  cet axe redevient un VARIANT lié. » Elle n'existait que pour tolérer le défaut B013-3
  (typo du Titre surchargée par instance : hero 54/68/blanc, presentation 32/40,
  texte-seo 24/30).
- **La levée** : `decisions.md` O-12 — le SET 2090:2397 a gagné la dimension Emphase
  (élévation du contrat en v2.1.0, « 16 variantes générées mécaniquement », SET
  18→16 variantes sain ; « C'était LA typo signalée par l'owner » — TexteSEO
  403→383 = origine, titre 24px). Le binding du contrat est un fait du fichier :
  `kind: VARIANT`, `property: "Emphase"`.
- **Description corrigée** dans `contracts/section-header.contract.json` : l'axe est dit
  gouverné depuis 2.1.0, l'ancienne limite est conservée comme histoire (« LIMITE
  LEVÉE : jusqu'en 2.0.x… »), et le modèle du poids hero (base 300 littérale, plage
  marquée `content.marks.strong`) — toujours vrai — est gardé tel quel.
- **Couverture** : la levée est un fait de contrat + un relevé canvas journalisé (O-12).
  Aucune des quatre fixtures du jour n'épingle le **gain d'axe VARIANT d'un SET
  existant** (renommage des variantes aux défauts + fusion avec la jumelle) : cette
  mécanique d'amend resterait donc, en docs, une phrase au **conditionnel** tant qu'une
  fixture ne l'épingle pas — voir §3.

### 1.2 `ds.section-header` — `alignement` : code-only (kind: NONE) → VARIANT « Alignement » (2.1.0)

- **L'ancienne limite** : « LIMITE NOMMÉE — le master centre […] Cet axe code-side porte
  ce fait d'usage ; le correctif de fond appartient à Figma. » Tolérait B013-2 (master
  CENTER, surcharges LEFT par instance — census 013 : 5/7 ; relevé vif 016 : 34/59,
  `registre/defauts-source.json`).
- **La levée** : même geste O-12 (dimension Alignement gagnée par le SET, binding
  VARIANT au contrat v2.1.0). Description corrigée sur le même modèle que 1.1.
- **Couverture** : identique à 1.1 — fait de contrat + journal ; pas de fixture dédiée
  au gain d'axe → conditionnel en §3.

### 1.3 `ds.nav-item` — `libelle` : code-only (kind: NONE) → TEXT « Libellé » (1.2.0)

- **L'ancienne limite** : la description de tête du contrat disait « Link destination
  **and runtime label** are explicit code semantics » — vrai en 1.1.0 (`libelle` était
  `kind: NONE`), faux depuis 1.2.0 (commit `e856844`, vague de liaison US1b : 562
  liaisons sur 31 masters, journal O-10) où `libelle` lie la propriété TEXT Figma
  « Libellé ».
- **Description corrigée** : `href` reste seul en sémantique code explicite ; le libellé
  est nommé comme limite levée en 1.2.0. **Non levé, et à ne pas surdéclarer** : `href`
  garde `kind: NONE` — c'est une sémantique de code réelle (destination de lien), pas
  une tolérance de défaut ; rien à lever.
- **Couverture de la phrase de capacité associée** (« un override TEXT d'instance
  atteint le rendu même quand la part est aussi à visibilité pilotée ») :
  `text-prop-and-visible-refs-coexist-check.ts` — une part à la fois content-prop (TEXT)
  et visible-toggled (BOOLEAN) porte **les deux** `componentPropertyReferences`
  (`characters` ET `visible`) ; le runtime les posait en deux passes qui s'écrasaient,
  et « l'override texte de CHAQUE instance en aval n'atteignait plus rien »
  (défaut mesuré sur SectionHeader.Accroche 2094:2468, 2026-08-06). Verte.

### 1.4 `ds.faq` — `ligne3` : « EXPOSÉ mais non PROJETÉ » → projeté (1.3.0)

- **L'ancienne limite** : « Le fait est donc EXPOSÉ mais non PROJETÉ » — la prop BOOLEAN
  « Ligne 3 » était déclarée mais reliée à aucune part (un item de `repeat` ne peut pas
  porter de `visibleWhen` individuel ; mesuré : refs `[]` sur les rangées du master,
  `Ligne 3=false` sans effet, pages +64 — journal O-15).
- **La levée** (O-15, FAQ 1.3.0) : la 3e rangée **sort du repeat** en part composée
  séparée `AccordionRow3` + `visibleWhen: { prop: "ligne3" }`. Mesuré au canvas :
  « Portes-entrée 481→409, la prop agit ». Description de la prop corrigée dans le
  contrat.
- **Ce que la levée ne change PAS** : la limite du `repeat` lui-même (pas de visibilité
  par index) demeure — la levée la **contourne par sortie du repeat**, elle ne la lève
  pas. La description corrigée le dit explicitement.
- **Couverture** : le canal de référence `visible` posé sans écraser les autres refs est
  couvert par `text-prop-and-visible-refs-coexist-check.ts` (part TEXT+BOOLEAN). Le
  toggle BOOLEAN d'une **part composée** précisément n'a pas de fixture dédiée parmi les
  quatre : la généralisation reste au conditionnel (§3) ; le cas FAQ, lui, est un relevé
  journalisé (O-15).

---

## 2 · Limites moteur levées ce jour — chacune épinglée par sa fixture

Phrases de capacité autorisées, au niveau exact de ce que chaque fixture prouve
(en-têtes des fixtures, relevés verts du 2026-08-06) :

| Capacité (nouvelle) | Fixture qui la couvre |
|---|---|
| Une part `component` peut déclarer le contenu du **slot** de l'enfant composé (`component.slots`, schéma v20 additif) ; l'émetteur figma le pose par la prop INSTANCE_SWAP de l'enfant, **résolue par marqueur, jamais par override manuel** — le témoin sans `slots` ne pose aucune prop de swap. Lève la limite « aucun canal de contrat ne porte le contenu du slot d'un enfant composé » (famille D7 : l'override manuel était reperdu à chaque amend — Formulaire row5, h 643→723 = origine). | `composed-child-slot-content-check.ts` |
| Une part à la fois content-prop (TEXT) et visible-toggled (BOOLEAN) garde **ses deux** `componentPropertyReferences` (`characters` + `visible`) — les overrides TEXT d'instance atteignent le rendu. | `text-prop-and-visible-refs-coexist-check.ts` |
| Une part à hauteur **nulle** portant un trait per-side est une **ligne**, pas une boîte : émise `strokeAlign: CENTER`, géométrie ~0 (le clamp INSIDE de Figma, mesuré 0→2, est évité) ; le témoin à hauteur non nulle garde INSIDE (doctrine border-box de 015) et sa hauteur. Footer.Separator 461→459 = origine ; le mock a appris le clamp INSIDE (resize ET pose de poids). | `zero-height-line-part-check.ts` |
| Une **dépendance de composition** se résout par son marqueur d'identité `ds_contracts/contractId`, **jamais par son nom de calque** — un renommage de calque ne casse pas la composition (§VIII ; défaut mesuré : les 7 composants composant ds.button échouaient sur « Dependency component not found: Button », le master s'appelant « Bouton »). | `dep-resolved-by-marker-check.ts` |

---

## 3 · Ce qui reste au conditionnel — aucune fixture ne le couvre

- **Gain d'axe VARIANT sur un SET existant** (O-12, classe 6) : un SET qui gagne une
  dimension **devrait** compléter les noms de ses variantes existantes aux défauts du
  spec et fusionner avec la jumelle fraîche, le bloc tournant avant la première lecture
  de `componentPropertyDefinitions`. Journalisé et observé (SET 18→16, sain), **non
  épinglé** par une fixture : à épingler avant toute phrase de capacité en docs/README.
- **`visibleWhen` sur une part composée, en général** : le cas FAQ est mesuré (O-15),
  la généralisation à toute part `component` **devrait** tenir mais n'a pas de fixture
  dédiée.
- **Non-limites, à ne pas « lever » par erreur** : `ds.nav-item.href` (kind NONE —
  sémantique code réelle), `ds.faq.items` (kind NONE — Figma n'a pas de propriété de
  type tableau, limite structurelle inchangée), et la visibilité par index dans un
  `repeat` (le vocabulaire ne l'a toujours pas ; la FAQ la contourne).

---

## Fichiers touchés par ce reçu

| Fichier | Geste |
|---|---|
| `contracts/section-header.contract.json` | descriptions `emphase` + `alignement` : « LIMITE NOMMÉE code-side » → « Axe gouverné VARIANT depuis 2.1.0, LIMITE LEVÉE » (aucun canal fonctionnel touché) |
| `contracts/nav-item.contract.json` | description de tête : « runtime label are explicit code semantics » → libellé TEXT « Libellé » depuis 1.2.0, `href` seul reste code-only |
| `contracts/faq.contract.json` | description `ligne3` : « EXPOSÉ mais non PROJETÉ » → « LIMITE LEVÉE en 1.3.0 », mécanisme `AccordionRow3` + `visibleWhen` cité |

Aucun bump de version : seuls des champs `description` changent (aucune prop, aucun
binding, aucun canal d'anatomie). Les gates (`npm run build`, re-pins) n'ont **pas** été
relancés dans cette fenêtre — interdits à la mission ; à passer par l'orchestrateur du
chantier avec le lot suivant.
