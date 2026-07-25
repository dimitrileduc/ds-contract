# Research — 004-input-atoms-categories

**Date** : 2026-07-24 · **Spec** : [spec.md](./spec.md) · **Constitution** : v1.0.0

Toutes les inconnues du Technical Context sont résolues ici. Chaque décision cite la
preuve dans le dépôt (fichier:ligne) ou dans les artefacts 003 (branche
`003-externalize-figma-components`, lus via git — jamais recopiés).

---

## D1 — Chaîne d'extraction : la chaîne 002 réutilisée telle quelle, zéro outillage jetable

**Decision.** Chaque atome suit exactement la chaîne prouvée pour le Button :
`npm run extract:figma:rest -- <url node> --target <Nom>` (dump REST v1 →
`extract/out/figma/rest-dump.json`, lecture seule, `FIGMA_TOKEN`) → `npm run
extract:figma -- <dump>` (`extract/figma/propose.ts` → `proposeFromDump`, le pass de
lowering D5 icônes inclus, `iconRegistry` chargé automatiquement) → **review humaine →
adoption** dans `contracts/<atome>.contract.json` (renommages de review autorisés — l'IA
et l'humain assistent l'AUTORAT, jamais la génération). Puis `npm run build` (validation +
génération), `npm run parity`, contrôle visuel.

**Rationale.** La chaîne existe, est éval-couverte, et le contrat Button en est le reçu
(`contracts/button.contract.json:7` — « Extracted by propose-figma's D5 lowering pass …
reviewed and adopted — not authored »). Les nodeIds source sont connus et owner-validés
(003 `tasks.md` T032-T035) : Input `2053:1245`, Textarea `2053:1247`, Select `2053:1249`,
Checkbox `2053:1256` (COMPONENT_SET), sur la page `DS · Atomes`.

**Alternatives rejetées.** Écrire les contrats à la main (violerait la règle owner « zéro
contrat écrit à la main » et l'Assumption spec) ; le pont MCP desktop comme source de dump
(`extract:figma:mcp` existe mais le précédent Button est REST ; REST = reçu
`_provenance` + `dumpedAt`, et le contexte payant est mesuré sain — mémoire
« rate-limits diagnostic clos »).

## D2 — Identité : rapprochement par clé de composant, jamais par nom

**Decision.** Chaque contrat ancre `anchors.figma = { fileKey: d9FYAUcqdcNtsuaMgLefvJ,
componentSetKey: <clé du master>, nodeId, dumpedAt }` (shape v16 déjà dans le schéma,
`contract-schema.ts:889-903`). Les noms d'affichage Figma (français, relus au dump) ne
servent JAMAIS de jointure. Les noms de code sont anglais : `Input`, `Textarea`,
`Select`, `Checkbox` (précédent Bouton ↔ Button).

**Rationale.** FR-011 + leçon 002 (« Button » vs « Bouton » avait cassé la binding map du
Contract Hub, réparée par `componentSetKey`). `parity/diff.ts` joint déjà par clé
(`canvasByKey`, ligne 762). Une exception héritée subsiste : l'univers du swap-menu se
trouve par nom `'Bouton'` (`parity/diff.ts:768`) — hors périmètre, non touché.

## D3 — La catégorie : un champ optionnel `category` sur le contrat + une map de libellés unique

**Decision.**
- Schéma : `category: z.enum(['atom', 'molecule', 'section']).optional()` ajouté à
  `ContractSchema` (`packages/schema/src/contract-schema.ts:805`, à côté de `status`) —
  **additif-optionnel** (Principe VI), valeur inconnue **refusée par nom** (Zod enum =
  refus C2 gratuit). Export voisin `CATEGORY_LABELS = { atom: 'Atoms', molecule:
  'Molecules', section: 'Sections' }` — la SEULE définition des libellés anglais,
  consommée par les trois surfaces. `docs/02-contract-spec.md` bumpé.
- Storybook : `core/emit-react.ts:2480` passe de `title: 'Components/${name}'` à
  `title: '${CATEGORY_LABELS[category] ?? 'Components'}/${name}'` — fallback tolérant
  (contrat sans catégorie = groupe `Components`, comportement actuel préservé).
- Catalog : `scripts/generate-catalog.ts:165` ajoute `category` à chaque entrée
  (monolithe + shards + `index.json`) ; `npm run verify:catalog` régénéré.
- Contract Hub : `dashboard/src/views/ComponentsList.tsx` groupe par catégorie (sections
  « Atoms / Molecules / Sections », composant sans catégorie sous un groupe résiduel
  visible — vide dans cette itération car l'usage est exhaustif) ; `dashboard/src/data.ts`
  type `RawContract.category`.

**Rationale.** FR-012/013/014 : miroir STRUCTUREL des pages Figma (DS · Atomes /
Molécules / Sections), langue anglaise côté code (clarification session 2026-07-24).
Un seul point de vérité pour les libellés = pas de dérive entre surfaces.

**Alternatives rejetées.** Catégorie déduite de la page Figma du master (couplage
extraction↔rangement ; la vérification « catégorie ↔ page » est un bonus nommé hors
périmètre) ; un fichier de mapping séparé (2e source de vérité — la catégorie est un fait
du composant, sa place est dans le contrat).

## D4 — Button : catégorisation + élargissement d'enum forcé → v1.5.0 (minor)

**Decision.** `contracts/button.contract.json` reçoit `category: "atom"` ET
l'élargissement 13→16 des enums `iconLeftGlyph`/`iconRightGlyph` (+ leurs
`bindings.figma.values` : `facebook`, `instagram`, `star`) → **v1.4.0 → v1.5.0** (un seul
bump minor pour les deux ajouts additifs). Zéro modification de son master Figma.

**Rationale.** L'élargissement n'est PAS un choix : le gate de build
(`scripts/generate-components.ts:115-133`, « ni plus ni moins ») refuse par nom tout enum
INSTANCE_SWAP chevauchant le registre sans lui être exactement égal. Registre à 16 ⇒
enums Button à 16, sinon `npm run build` est rouge. Semver : élargissement d'enum =
minor (constitution VI, « widening = minor »).

## D5 — Conséquence nommée : le menu Figma du Bouton reste à 13 (divergence acquittée, jamais silencieuse)

**Decision.** Le master « Bouton » garde ses `preferredValues` à 13 (l'étendre = édition
de master, interdite par FR-001). L'axe icônes de parity ne vérifie QUE la direction
menu→registre (`parity/diff.ts:821-832`) : 13 ⊂ 16 = aucun finding icônes. **Risque
vérifié tôt** : si l'axe composant figma⟷contract (section 2 de `diff.ts`) compare la map
`values` du contrat (16) aux `preferredValues` du canvas (13), les findings sont
**acquittés dans `parity/baseline.json`** (mécanisme prévu pour les décisions owner
enregistrées — précédent : icônes mail/external-link exclues en 002), avec l'accord owner
explicite. La mise à jour du menu (13→16) est **léguée nommément à la prochaine itération
autorisée à écrire** (sous gates 003), comme le rangement de la page « Assets » déjà
noté dans la spec.

**Garde-fou éval.** `baseline-parity-clean` exige zéro finding ACTIF ;
`baseline-acknowledges-without-failing` prouve que l'acquitté ne fait pas échouer —
les deux restent verts si et seulement si les éventuels findings sont acquittés, pas
actifs. Vérification immédiate après l'élargissement (tâche dédiée).

## D6 — Les 3 icônes : registre v1.1.0 (16 entrées), noms canoniques `facebook` / `instagram` / `star`

**Decision.**
- `contracts/icons.registry.json` → **v1.1.0** (élargissement = minor, interface 002 §7),
  +3 entrées : `facebook` (master `2053:1259`), `instagram` (`2053:1261`), `star`
  (`Étoile`, `2053:1263`). `figma.componentName` = nom du master VERBATIM au dump
  (« Étoile » : le nom canonique doit matcher `^[a-z][a-z0-9-]*$` —
  `contract-schema.ts:933` — donc `star`, règle anglais côté code ; le français vit dans
  `componentName`). Clés/nodeIds relus au dump (le fichier a bougé depuis — les chiffres
  re-mesurés font foi).
- SVG : `npm run extract:figma:rest:svg` (manifest 3 entrées) → `assets/icons/{facebook,
  instagram,star}.svg` — extraits du fichier réel UNIQUEMENT (FR-018) ; l'ancien jeu démo
  n'a de toute façon aucun de ces trois dessins.
- `source.dumpedAt` du registre mis à jour à la date du nouveau dump.

**Star, couleur fixe — dégradation nommée.** Le master Étoile binde `color/orange`
(003 T038), pas `color/noir-bleute`. Le bake `#26282c → currentColor`
(`extract/figma/rest/svg-export.ts:31-34`) ne touchera pas son SVG → l'asset garde son
orange littéral. **C'est voulu et truthful** : l'étoile est intrinsèquement orange sur
les deux surfaces (le master Figma la rend orange aussi) ; elle ne se recolore PAS via
`currentColor` contrairement aux 15 autres. Nommé dans la `description` de son entrée
registre + le rapport de l'itération — jamais silencieux (Principe V). Alternative
rejetée : étendre le bake à `#F98A0B → currentColor` — un star glyphe dans un Button
hériterait la couleur du texte et **divergerait du rendu Figma** (le master resterait
orange) : on créerait l'écart visuel qu'on prétend éviter.

**Facebook/Instagram** : fills déjà bindés `color/noir-bleute` (audit 003
`atomes-icones.md` §1) → bake standard, comportement identique aux 13.

## D7 — Checkbox : modélisation par l'archive, coche = glyphe interne au composant (pas une 17e icône)

**Decision (arbre, tranché à l'extraction — la vérité du dump fait foi).**
- **Volé à l'archive `demo-51`** (`docs/reference/demo-archive/checkbox.contract.json`) :
  l'état coché en **enum bound VARIANT** (le master expose le variant « Coché » Non/Oui →
  prop `checked`, enum `['non','oui']`, values `{non: 'Non', oui: 'Oui'}` — précédent
  Button : clés canoniques translittérées des valeurs Figma, ex. `outilneNoir`) ; la coche
  en **icon part + `visibleWhen: { prop, equals }`** ; le pattern **input natif
  non-dessiné** (`element: 'input'`, `attrs: {type: 'checkbox'}`, « Canvas: not drawn »)
  si la validation actuelle l'accepte encore (spike dédié en début d'implémentation).
- **Rejeté de l'archive, motifs nommés** : `label`/`description` props (le master
  Piqueray n'a PAS de label — il vit dans la molécule Field, close par 003) ; l'axe
  `size` (inexistant sur le master) ; l'état `indeterminate` (le master expose Non/Oui,
  ni plus ni moins — FR-008) ; l'event `toggle` déclaré (le Button Piqueray ne déclare
  aucun event ; le natif passe par le rest-passthrough généré).
- **La coche blanche** : `propose-figma` ne lit pas les VECTOR bruts (zéro gestion,
  vérifié) → dégradation nommée au propose, modélisée à l'adoption. L'asset
  `assets/icons/check.svg` est acquis du master réel (export SVG REST du nœud de la
  coche — lecture seule), **sans entrée registre** : le registre reste à 16 (SC-003 ;
  l'extension au-delà des 3 est hors périmètre). Conséquence sur l'axe icônes de parity :
  `check.svg` serait flaggé `ahead` « asset sans entrée registre »
  (`parity/diff.ts:808-819`). **Résolution retenue** : enseigner à l'axe la classe
  « glyphe interne consommé par un contrat » — un asset non-registre référencé par un
  `icon.asset` FIXE (non templaté) d'un contrat du catalog n'est pas orphelin ; un asset
  ni registre ni consommé le reste (finding inchangé). Capacité ajoutée dans l'outillage
  commun + éval AVANT claim (fixture → eval → claim). Repli si l'owner préfère zéro
  changement d'outillage : finding acquitté dans `baseline.json` (décision enregistrée).
- **Si le dump révèle une coche TEXT** (« ✓ » en nœud texte) : part texte statique
  (`text:`, `contract-schema.ts:753`) — plus simple, zéro asset. Tranché par le dump.

## D8 — Input / Textarea / Select : modélisation attendue (consultation d'archive faite)

**Decision.** Sémantique native : `semantics.element` = `input` / `textarea` / `select`
— tous DÉJÀ dans l'enum du schéma (`contract-schema.ts:818-822`), zéro changement de
schéma. Attendu par atome (le dump fait foi, propriétés officielles posées par 003) :
- **Input** : prop texte `value` bound TEXT « Valeur » (003-T032) ; boîte HORIZONTAL,
  padding 12, gap 8, radius 0, fond `{color.blanc}`, bordure `{color.bleu-gris}`,
  texte 14 Regular (binding couleur du master relu au dump — l'audit proposait
  `color/noir`, la construction owner-validée fait foi).
- **Textarea** : idem, hauteur portée proprement par le container (003-T033).
- **Select** : idem + `SPACE_BETWEEN` + **chevron en icon part FIXE**
  `{ icon: { asset: 'chevron-down', size: 24 } }` — l'asset est déjà gouverné (registre
  13). Volé à l'archive : le pattern « chevrons en assets fixes » de `ds.pagination`.
  Si propose stubbe l'instance imbriquée (instance FIXE ≠ INSTANCE_SWAP du lowering D5),
  la review d'adoption la convertit en icon part — décision de review, nommée.
- **Archive** (`ds.text-field` 1.1.0, `ds.text-area` 1.0.0, INDEX) : volé — prop texte
  bound TEXT, éléments natifs ; rejeté avec motifs — parts label/help/`asterisk` (Field
  les possède), booléens `disabled`/`required` et axes d'état (le master n'expose rien de
  tel — FR-008 « ni plus ni moins »). **Select n'a AUCUN équivalent démo** (aucune rangée
  INDEX) — modélisation par les deux cousins ci-dessus, nommé ici.

## D9 — Contrôle visuel : 4 nouveaux subjects dans l'instrument existant, baseline re-pinnée

**Decision.** `extract/figma/visual-parity/subjects.ts` (« Adding a subject = adding one
entry here ») reçoit 4 `ContractSubject` (kind `contract`, fileKey Piqueray, setNodeId =
ancre du contrat). Tolérance et seuils INCHANGÉS (`tolerance.ts`, triage 3 %). Après
adoption : run complet revu + `--write-baseline` (re-pin explicite, précédent 002).
**Risque nommé** : Input/Textarea/Select sont des COMPONENT simples (pas des SET — seul
Checkbox est un SET) ; si `fetchSetInfos`/l'énumération de variantes suppose un SET, la
capacité « subject mono-COMPONENT » est ajoutée à l'instrument commun (+ éval) — jamais
un script à côté. Vérifié au spike Input (premier atome).

## D10 — Preuve lecture seule : relevé d'historique de versions AVANT/APRÈS, par l'instrument 002

**Decision.** T0 de l'itération : appel REST direct authentifié
`GET /v1/files/d9FYAUcqdcNtsuaMgLefvJ/versions` (précédent exact : 002
`master-update-report.md` P5) → `specs/004-input-atoms-categories/proofs/read-only/
versions.before.json`. À la clôture : re-relevé → `versions.after.json` + table
d'attribution (chaque entrée nouvelle = imputable à 003, attendu ; toute entrée imputable
à 004 = échec du garde-fou, traité comme tel). Les opérations 004 sont toutes
non-versionnantes : dumps REST, exports SVG/PNG (images API), lectures par le pont —
l'historique Figma n'enregistre que les éditions. Le rafraîchissement des snapshots
parity (`parity/extract-figma.plugin.js`) est une LECTURE (le script inventorie, n'édite
pas) exécutée via le pont desktop `figma_execute` ou un run plugin owner — vérifiée par
le relevé après coup, comme le reste.

## D11 — Évals : ce qui s'ajoute, ce qui se réactive, ce qui se re-pinne

**Decision.**
- **Nouvelles évals AVANT claims** (fixture → eval → claim) : (1) C6-famille — un contrat
  catégorisé produit `title: 'Atoms/X'` + `category` au catalog ; (2) C2 — `category`
  inconnue refusée par nom ; (3) tolérance — contrat sans catégorie : build OK, fallback
  `Components/` ; (4) si D7 retient la règle « glyphe interne » : C3 — asset non-registre
  consommé par un contrat = pas de finding, asset orphelin = finding inchangé.
- **Golden** : `npm run golden:update` re-pinne après (4 contrats + Button v1.5 + titres
  stories + catalog category) — re-pin explicite, revu, jamais automatique.
- **Quarantaine (règle hybride, retraits/ajouts nommés par id au commit)** — candidats
  identifiés dans `evals/legacy-cases.ts` : L349 (« a second Piqueray component + a clean
  parity baseline » — satisfait), L1084 (« a second Piqueray component — one to update,
  one to create » — satisfait), L509/523/538 (« a Piqueray component captured through the
  REST path », fixtures sous `extract/figma/rest/fixtures/` — satisfaisable en committant
  un dump d'atome comme fixture). **Reste en quarantaine, nommé** : L711 (« a Piqueray
  checkbox AND switch » — pas de Switch), états d'interaction (aucun atome n'expose de
  variant d'état), slots/nested/repeat (aucun atome n'en a). Chaque candidat est relu
  (assertions vs réalité Piqueray) avant réactivation ; compteurs re-synchronisés au
  compte vivant (`npm run eval` fait foi).
- **Contrainte opérationnelle** : `npm run eval` ne tourne PAS dans un worktree sans
  `node_modules` (le worktree 004 n'en a pas) → `npm install` dans le worktree ou run sur
  le checkout principal ; Chromium requis pour 2 checks (`npx playwright install
  chromium`).

## D12 — Gel 003 & re-mesure : les comptes du moment de l'extraction font foi

**Decision.** Les masters des 4 atomes sont gelés par accord (FR-004) ; le fichier reste
vivant ailleurs (003 construit les molécules — Field/Accordion-row déjà en cours). Chaque
dump relit et re-confirme clés/nodeIds/propriétés AU MOMENT de l'extraction ; tout écart
vs les chiffres 003 cités ici est re-mesuré, jamais supposé. Si 003 doit toucher un
master gelé : ses gates, puis ré-extraction nommée de l'atome AVANT clôture (chemin
FR-004) ; la parité de clôture se mesure sur le fichier vivant.
