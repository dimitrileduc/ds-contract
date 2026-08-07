# Research — Photos honnêtes (017)

**Date**: 2026-08-06 · **Spec**: [spec.md](spec.md) · Références : spec.md § Clarifications, `docs/FIGMA-CAPABILITY-MATRIX.md` (lignes 91 et 360-372), `specs/016-canvas-vrai/registre/defauts-source.json` (`D-016-PHOTOS-INSTANCE-EFFONDREES`).

Une section par décision. Chaque décision porte son motif et ce qui a été écarté. **Aucune prémisse n'est héritée sans relevé** — c'est la règle qui a produit cette spec, et elle a déjà renversé deux affirmations du dépôt ci-dessous (D1 et D12).

---

## D1 — La préservation descend aux instances par `getInstancesAsync()` du maître, clé par POSITION — et cette prémisse se sonde en LECTURE avant que le moteur s'y adosse

**Décision.** `harvestImagePaints` / `restoreImagePaints` (`core/emit-figma-script.ts:3824-3862`) cessent de ne voir que `comp`. Le harvest parcourt `comp` **puis chaque instance rendue par `await comp.getInstancesAsync()`**, et la clé d'emplacement devient `(hôte, chemin d'indices)` — jamais le nom de calque. Le restore repose sur la même clé après reconstruction.

**Motif.** Le dégât mesuré est exactement là. `specs/016-canvas-vrai/proofs/photos/RECONCILIATION.md:26` : sur 349 photos vivantes, **255 sont des surcharges d'instance** et 94 seulement sont au maître — le sauvetage protège le quart minoritaire. Les deux chemins d'amend démolissent les enfants (`emit-figma-script.ts:3966` et `:4109` : `for (const child of [...comp.children]) child.remove()`), Figma propage la démolition aux instances, et leurs surcharges de peinture meurent avec les nœuds qui les portaient. Le périmètre `getInstancesAsync()` est **borné au maître qu'on reconstruit** : il évite le parcours de fichier entier qui sature le bac à sable (`specs/016-canvas-vrai/bridge/photos-census.js:44-48` : « 58 masters + 9 maquettes ≈ 5 350 nœuds SATURE le sandbox et fait tomber le plugin »).

La clé par position est imposée par §VIII et par le précédent : `photos-census.js:24-26` — « IDENTIFICATION PAR POSITION, JAMAIS PAR NOM : un renommage de calque ne doit pas faire croire à une photo perdue, ni deux calques homonymes se confondre ». L'appariement actuel est l'inverse : nom d'abord (`:3849`), puis **« le premier paint non réclamé »** (`:3850`) — le repli qui rend l'interversion invisible.

**⚠️ Prémisse à sonder, pas à hériter.** `getInstancesAsync` n'a **aucun usage dans ce dépôt** (relevé du 2026-08-06 : les 24 occurrences de `.instances` sont toutes des données JSON de recensement, jamais l'API Plugin) et le faux-Figma ne le modélise pas. La méthode exige `figma.loadAllPagesAsync()` au préalable (chargement dynamique des pages) — appel que les scripts générés font déjà (`figma-sync/12-memberpicture.js`, `figma-sync/33-sav.js`, …). **Une sonde en LECTURE SEULE sur le fichier client, via le pont, doit confirmer trois choses avant que le moteur en dépende** : (1) la méthode existe et rend les instances de page du maître ; (2) elle les rend après `loadAllPagesAsync` ; (3) le coût de parcours reste sous le seuil de saturation. Tant que la sonde n'a pas rendu, l'engagement n'est pas pris.

**Et si la sonde ne peut pas tourner du tout ?** Troisième issue, tranchée plutôt que laissée ouverte : elle est consignée `empeche` avec sa raison, **et US1 démarre sur le repli** — jamais sur un `getInstancesAsync` non mesuré, jamais en attente non plus. Motif : le sans-tête fait foi, et le pont est précisément la ressource dont l'indisponibilité est documentée (`51cab06`). Faire dépendre le MVP d'un outil absent transformerait une panne d'outillage en blocage produit. La sonde reste due ; sa bascule ultérieure est une amélioration additive avec sa propre preuve.

**Repli nommé, si la sonde refuse.** Le registre orchestré : l'orchestrateur relève les photos d'instance avant le lot (recensement existant), passe le relevé au script via `globalThis.__dsc_photos` et le script repose par `(hostId, ordre)`. Cette forme est **déjà éprouvée** — c'est exactement `specs/016-canvas-vrai/proofs/repose/photos-instances.json` (14 sections, 97 photos, « pour chaque hôte, parcourir les nœuds porteurs d'image dans l'ordre et reposer le hash d'origine »). Le repli est plus faible sur un point qu'il faut dire : il exige un relevé frais avant chaque lot, donc il ne protège pas une régénération lancée sans l'orchestrateur.

**Alternatives écartées.** (a) *Faire parcourir tout le fichier au script généré* — saturation mesurée, refusée. (b) *Ne rien changer au moteur et compter sur le contrôle pour détecter après coup* — un contrôle qui constate la perte après qu'elle a eu lieu ne satisfait ni FR-001 ni FR-003a ; ce que le canevas écrase ne revient pas (§X). (c) *Faire porter l'image au contrat* — écarté par l'owner le 2026-08-06, motif au § Clarifications de la spec.

---

## D2 — Le refus de FR-003a est une PRÉ-PASSE du chemin amend, exécutée avant le premier `remove()`

**Décision.** Avant toute mutation, le chemin amend calcule le harvest complet (maître + instances), calcule les emplacements d'accueil (`collectImgSpecTargets` sur la spec de chaque variante, `emit-figma-script.ts:3830-3833`), et **si une photo relevée n'a aucun emplacement d'accueil, il jette avec le nom de la photo, son hôte et son rang — aucun nœud touché**. La levée se fait par acquittement (D4), jamais par tolérance.

**Motif.** L'ordre actuel du code rend le refus impossible : la démolition (`:3966`) précède le calcul des cibles (`restoreImagePaints`, `:3993`), donc au moment où l'on découvre qu'une photo n'a nulle part où aller (`unplacedImages`, `:3858`), le mal est fait. La matrice le dit sans détour (`docs/FIGMA-CAPABILITY-MATRIX.md:371`) : *« reported, but **not restored**. It is lost, loudly. »* Loudly, mais perdue. §X (before-capture) et la doctrine du dépôt — refuser par le nom plutôt que générer à moitié — imposent l'inversion : décider d'abord, muter ensuite.

**Alternative écartée.** *Sauver dans `unplacedImages` et laisser l'humain reposer* — c'est l'état actuel ; il a produit 62 photos perdues derrière un rapport vert.

---

## D3 — L'identité d'une photo : `imageHash` en identité primaire, sha256 des octets en contre-preuve hors Figma

**Décision.** L'empreinte relevée à chaque emplacement est l'`imageHash` du paint. La contre-preuve re-testable est le sha256 des octets, calculé **hors** du bac à sable. La clé d'emplacement est `(hôte, chemin de position)`, l'hôte étant l'id du nœud racine porteur (maître ou instance de page).

**Motif.** C'est déjà écrit, mesuré et employé : `specs/016-canvas-vrai/bridge/photos-census.js:28-31` — *« L'imageHash de Figma adresse déjà le contenu (même hash ⇔ mêmes octets) et sert d'identité primaire ; le sha256 est la contre-preuve re-testable HORS Figma »* — et le hachage est fait côté Node parce que le bac à sable n'expose pas `crypto`. `figma.getImageByHash(h).getBytesAsync()` est la seule route vers les octets (`photos-census.js:161-171`), et c'est aussi le seul usage de cette API dans le dépôt.

**Ce que l'empreinte à l'emplacement ferme.** L'interversion (FR-004, SC-002). Le comptage par multiset de hashes **au maître** ne peut structurellement pas la voir — c'est la limite que `CENSUS-APRES.md:33-38` nommait d'avance et que `D-016-PHOTOS-INSTANCE-EFFONDREES` a démontrée. Le comptage d'images **distinctes par hôte** reste, en second : c'est lui qui dit l'effondrement en clair (« 17 portraits à l'origine, 2 au vif »).

---

## D4 — L'acquittement owner est un document gouverné, lu par le refus, et il reste visible au rapport

**Décision.** `specs/017-photos-honnetes/registre/acquittements-photos.json` — liste FERMÉE, une entrée = une photo levée nommément — **sept champs, tous obligatoires** : `hostId`, `cheminPosition`, `imageHash`, `motif`, `decidePar`, `decideLe`, `receiptId`. *(Cette décision nommait le 2ᵉ champ `ordre` : c'est la clé du **repli**, pas celle du chemin nominal — corrigé le 2026-08-06, glossaire au data-model §2.)* Le refus de D2 consulte ce registre ; une photo acquittée ne bloque plus, **et elle est imprimée dans sa propre section du rapport, jamais fondue dans le vert**.

**Motif.** FR-003b. La forme est celle qui marche déjà deux fois ici : `contracts/named-literals.registry.json` (015 — « une entrée = une exception, à l'entrée près ; toute addition est une décision consignée avec reçu, jamais un ajout silencieux ») et `parity/baseline.json` (l'acquittement ne fait jamais rougir, mais il est compté et imprimé dans sa propre section, `parity/diff.ts:1056-1062`). Le cas légitime que cela couvre est nommé par la spec : une part retirée du contrat, dont la photo n'a plus d'accueil.

**Invariant de non-accumulation.** Une entrée dont l'hôte ou le rang ne résout plus est **orpheline** et se retire — même règle que `registry-entry-orphaned` de 015. L'exception morte ne s'accumule pas.

---

## D5 — Ce que le faux-Figma doit apprendre : trois choses, dans la forme d'extension déjà éprouvée trois fois

**Décision.** `scripts/plugin-engine-mock-figma.mjs` (506 lignes) apprend :

1. **Une instance MIROITE le sous-arbre de son maître.** Aujourd'hui `createInstance()` pose `inst.children = []` (`:247`) — il n'y a rien à surcharger, donc rien à perdre, donc **la perte du 2026-08-06 est structurellement inatteignable sans tête**. C'est le trou central.
2. **L'`ImagePaint` existe** : `imageHash`, `scaleMode`, et le couple `figma.createImage` / `figma.getImageByHash` (0 occurrence de chacun aujourd'hui). Le mock transporte des paints IMAGE écrits à la main par la fixture 013 sans jamais les connaître.
3. **`ComponentNode.getInstancesAsync()`** rend les instances du maître, après `loadAllPagesAsync`.

**Motif.** FR-002a, et §VII : *« un défaut qui n'apparaît que sur le canevas vivant se répare en deux temps — l'émetteur, puis le mock qui doit désormais l'attraper headless pour toujours »*. La forme de l'extension n'est pas à inventer, elle est constante sur les trois précédents (`git log` sur le mock) : le mock passe d'un **no-op permissif à une contrainte qui lève**, un commentaire in-situ nomme le défaut réel mesuré, une **fixture dédiée** est ajoutée sous `evals/fixtures/`, et elle est **branchée comme cas** dans `evals/run.ts`.

- `981e446` (2026-07-21) — `createNodeFromSvg` valide et rejette les attributs dupliqués : *« GAP CLOSED: … so this class fails headlessly forever »*, alors que 146 portes headless étaient vertes.
- `ddac778` (016) — `loadFontAsync` REFUSE une paire (famille, style) inconnue ; c'est là qu'est écrit le commentaire §VII en français (`:363-374`).
- `e856844` (016) — `_clampInsideStrokes()` : *« Without this, the zero-height-line defect class is invisible headless. »*

**Piège nommé, hors périmètre mais à consigner.** Le mock accepte la **mutation en place** de `node.fills` là où le vrai Figma l'ignore silencieusement (le tableau y est readonly). C'est une classe de défaut orthogonale, non couverte, découverte en instruisant celle-ci — elle part au registre (FR-009), elle n'est pas réparée ici.

---

## D6 — La porte rejouable est un cas d'eval adossé au mock ; l'instrument photo de 016 est promu pour porter le reçu vif

**Décision, deux étages.**

- **Porte sans tête (FR-002a)** : une fixture `evals/fixtures/photos-instance-overrides-preserved-check.ts` + son cas dans `evals/run.ts`, claim **`C2-refusal`** (comme `img-paint-preserved-on-amend`, `run.ts:436-443`). Elle rejoue la perte du 2026-08-06 : un maître, N instances de page portant des surcharges distinctes, reconstruction, vérification d'empreinte à l'emplacement. Trois cas adverses obligatoires (SC-002) : **une photo perdue → échec nommé**, **deux photos interverties → échec nommant les deux emplacements**, **une photo sans accueil → refus avant toute mutation**.
- **Reçu vif (FR-002b)** : l'outillage photo de 016 est **promu** de `specs/016-canvas-vrai/{bridge,tools}/` vers `extract/figma/photo-parity/`, avec un script npm (`photos:verify`). Il n'est pas réécrit : c'est un déplacement.

**Motif.** `npm run plugin:check` **n'est lancé par aucun cas actif** de `npm run eval` — ses trois cas sont en quarantaine (`evals/legacy-cases.ts:1045`, `:1078`, `:1108`). Une porte qui ne tourne pas ne protège rien ; le commentaire du dépôt le dit déjà (`run.ts:66-67`, revue adversariale de 016 : *« une fixture que rien ne lance ne protège rien »*). Donc la porte de 017 est un cas d'eval, pas une extension de `plugin:check`.

Et la promotion n'est pas une initiative : `specs/016-canvas-vrai/plan.md:101` l'a explicitement parquée comme **« la décision de 017 »**. Elle est justifiée par le même raisonnement — un instrument de porte qui vit dans le dossier d'une spec close rouille, et `npm run` n'a aujourd'hui **aucun script `photos:*`**.

**Alternative écartée.** *Réactiver un cas legacy de `plugin:check`* — la quarantaine est préservée verbatim pour que « re-enabling one is a move, never a rewrite » (`evals/harness.ts:1-8`) ; aucun des trois ne porte la classe photo, les réactiver ne dirait rien sur les instances.

---

## D7 — US2 : le levier existe entièrement ; il manque deux champs sur le sujet et un argument passé

**Décision.** `ParitySubject` reçoit deux champs **additifs** — `comparisonProps?: Record<string, unknown>` et `fixtureAssetIds?: string[]` — et la boucle du live gate résout puis passe ces props en **7ᵉ argument** de `renderVariant`.

**Motif.** La chaîne complète est déjà écrite, éprouvée et vérifiée par sha256 ; seul le chemin *live gate* ne l'emprunte pas.

- `renderVariant` **a déjà** le paramètre : `comparisonProps: Record<string, unknown> = {}` (`extract/figma/visual-parity/render.ts:816`).
- La boucle du live gate ne passe que **6 arguments** (`run.ts:2002-2009`) — le 7ᵉ reste au défaut vide. C'est là, et seulement là, que naît le 99,97 %.
- Le chemin campagne, lui, fait tout : `renderCampaignVariant` résout (`render.ts:1341`) et passe `resolved.value.props` en 7ᵉ (`:1351`).
- La résolution `{ "$asset": "<id>" }` → data URL revérifie **taille, extension, octets et SHA-256** au moment du rendu (`render.ts:294-347`), refuse tout chemin hors `fixture-assets/` (`:274-289`), et l'injection clone le contrat (`withOverridesAsDefaults`, `render.ts:552-567`, `structuredClone` à `:558`) — **le fichier `.contract.json` n'est jamais touché**. C'est FR-006b tenu par construction, pas par discipline.
- Le stock existe : **80 assets épinglés** dans `fixture-assets/manifest.json`, dont carte ×28, member-card ×17, product-card ×4, realisation ×27. Leur README dit déjà la règle de 017 mot pour mot : *« the code renderer may pass them through the existing code-only image URL props, but generated components must not use them as runtime defaults »*.

**Le raisonnement de 017 est déjà écrit dans le dépôt**, dans le `fixtureNote` de `specs/013-…/contracts/audit-campaign.json` (sujet `reassurances`) : *« Sans cet override la comparaison mesure quatre `<img src="">` contre quatre photos de 364×364 — soit 47 % de la surface du master — c'est-à-dire une absence de DONNÉES, pas une infidélité du composant. »*

**Alternative écartée.** *Basculer les 8 lignes sur le chemin campagne* — le chemin campagne porte tout un appareil (régions requises, reçus Evidence, échelle de capture propre) et sa dernière exécution est `"verdict": "blocked"` (`specs/011-…/proofs/visual/result.json`). Déplacer la porte vivante dessus, c'est changer deux choses à la fois.

---

## D8 — `member-picture` n'a aucun asset épinglé : ses deux lignes exigent un relevé, et « non comparable » n'est que le recours

**Décision.** Épingler les assets manquants pour `member-picture` (set `274:2389`) par le chemin existant (`fixture-assets/fetch.mjs` + reçu au manifeste : `sha256`, `imageRef`, `paintNodeId`, `runtimeDefault: false`). Ce n'est qu'en cas d'échec du relevé qu'une ligne devient non comparable.

**Motif.** FR-006a : la remise à armes égales se fait en donnant la photo à notre surface ; la déclaration « non comparable » est **le recours, jamais la réponse de première intention**. Or les 17 portraits présents au manifeste sont classés `subject: "member-card"` — aucun asset ne porte `subject: "member-picture"`. Deux des huit lignes en dépendent (64,48 % et 58,33 %).

**Deux pièges de ce sujet, relevés.** (1) Sa prop d'URL s'appelle **`src`**, pas `imageUrl` (`contracts/member-picture.contract.json:57`) — un `comparisonProps` calqué sur les autres sujets ne prendrait pas. (2) Son root porte `"background-color": "#D9D9D9"` en littéral, décrit comme « generic technical A5 preview base » : c'est l'encre `#d9d9d9` mesurée aux deux lignes. Une fois la photo donnée, si le lavis reste visible, **c'est un fait de contrat, pas une frontière image** — à re-classer (D10), pas à hériter.

---

## D9 — « Non comparable » est un STATUT additif, pas une septième cause

**Décision.** L'union de statuts de la ligne de mesure (`run.ts:148`, fermée à `"diffed" | "skipped" | "refused" | "figma-declined"`) accueille **`"incomparable"`**, assorti d'une **raison écrite obligatoire**. Le vocabulaire de causes reste **fermé à six** (`triage.ts:55-61`).

**Motif.** Ce sont deux axes orthogonaux : la *cause* explique un écart mesuré, le *statut* dit si la mesure a un sens. Une septième cause dirait « l'écart vient de l'incomparabilité », ce qui est un score déguisé — précisément ce que FR-007 interdit. Le vocabulaire à six valeurs est par ailleurs gardé par `contracts/cause-vocabulary.md` et l'eval `triage-vocabulary-check` : l'élargir coûterait cher pour dire moins.

**Ce que le statut hérite gratuitement.** La visibilité et le comptage exigés par FR-007 existent déjà : le rapport a sa section **« Not diffed (named, never dropped) »** (`run.ts:2397-2404`, `REPORT.md:102-107`) et sa ligne de comptage (`run.ts:2411`). Et la non-régression est déjà fermée : `baseline.json` **échoue sur un changement de statut** (`run.ts:2196-2199`) comme sur une ligne disparue (`:2189-2194`) — une ligne discrètement retirée de la liste est **déjà impossible**, ce que l'edge case de la spec demandait de garantir.

---

## D10 — Après la remise à armes égales, les six règles de triage des cinq sujets sont RÉÉCRITES à leur cause re-mesurée

**Décision.** Les règles `image-boundary` de `triage.ts` couvrant les huit lignes (`:143-149` member-card, `:150-157` product-card, `:158-163` realisation, `:164-170` carte, `:337-344` et `:345-352` member-picture) sont réécrites d'après la **mesure d'après**, jamais reconduites. Un écart résiduel reçoit la cause que le nouveau relevé démontre ; un écart qui n'a plus de cause connue est un défaut à consigner (FR-009).

**Motif.** FR-008 interdit l'héritage de cause. La règle D8 de l'instrument le rend exécutoire sans discipline : **toute ligne à score brut strictement positif doit matcher une règle, sinon le rapport imprime UNTRIAGED et la classe première** (`run.ts:2070-2076` — le littéral `UNTRIAGED` est à `:2076` —, `triage.ts:5-9`). On ne peut donc pas « oublier » de re-classer.

**Ce qu'on sait déjà de deux résiduels.** (a) Les huit lignes portent toutes `diagnosis: "overall ink differs"` avec une géométrie exacte à ±1-2 px près — l'écart est bien de l'encre, donc de la donnée. (b) La variante `Etat=Survol` de `member-picture` photographie un portrait assombri alors que **les 34 contrats Piqueray ont `states: []`** : une fois la photo donnée, cette ligne change de cause et devient un fait d'état non modélisé. Elle est re-mesurée, puis nommée — pas requalifiée en bruit.

---

## D11 — US3 : la clause de légende est portée par un drapeau `hasImgPart` distinct, et son texte est arrêté ici

**Décision.** `core/emit-figma-script.ts:2764-2771` émet, pour un composant portant au moins une part `img` :

```
<Nom> — generated from contract <id> v<version> · image frame: runtime slot, photo shown is a mockup sample †
```

Une ligne. La dague reste en fin de ligne, à sa place actuelle. Un composant sans part image garde sa légende actuelle, au caractère près.

**Motif.** Le mécanisme est déjà là et il est déjà armé pour l'image : `hasCodeOnlyFacts` (`:2749-2758`) inclut `hasPreviewOnlyFacts`, qui est vrai dès qu'une part porte `imgPlaceholder` (`:2741-2748`), lui-même posé pour **toute** part `element === 'img'` (`:2311-2317`). Vérifié au cliché : les 9 composants porteurs d'image portent bien le `†` (`parity/snapshots/figma-components.json`, MemberPicture, Carte, ProductCard, Realisation, ReviewCard, Devis, Coordonnees, SAV, Hero). **Ce qui manque n'est pas la marque, c'est la phrase** — `imgPlaceholder` court-circuite `hasCodeOnlyFacts` sans passer par `DECLARED_CHANNELS`, le seul registre qui porte des phrases. D'où un drapeau dédié plutôt qu'un détour par un registre qui n'a pas de ligne image (D12).

**Langue : anglais, comme la légende existante.** Les 34 composants portent aujourd'hui une légende anglaise (`generated from contract`). Passer 9 d'entre eux au français ferait une ligne bilingue et un jeu incohérent. Le français va à la documentation, où la spec l'envoie de toute façon (FR-010a, FR-011).

**Directive owner du 2026-07-19 : tenue, et sa trace est mince — à savoir.** Elle n'existe verbatim nulle part. Ses seules traces sont le commit `d7fed02`, `CHANGELOG.md:38` et trois commentaires de code (`:2699-2701`, `:2749-2751`, `:2764-2770`). Ce qui a été retiré ce jour-là est vérifiable au diff : les événements, `declaredNoteLines`, `gradientMissLines` et la phrase meter, tous multi-lignes, remplacés par ` †`. **Une clause d'une proposition sur la même ligne ne rouvre pas ce choix** ; un retour aux paragraphes le rouvrirait.

---

## D12 — La doc : la matrice répond déjà depuis le 2026-08-04 ; c'est le paquet d'accueil qui est muet, et le CLAUDE.md qui est périmé

**Décision.** Trois gestes, aucun redondant :

1. **`docs/FIGMA-CAPABILITY-MATRIX.md` § (b)** (`:239-261`) reçoit sa ligne image, au format exact des 15 autres (`| channel | annotation copy |`), avec la copie de D11.
2. **Un addendum daté** y consigne ce que FR-013 exige : la lacune A5 reste **ouverte et nommée**, c'est une lacune de **transport** (colonne « Bindable » de la ligne 91 : `— (image content not bindable)`) et **non un défaut de fidélité mesuré** — les 99,97 % du 2026-08-06 étaient un artefact d'instrument.
3. **`docs/handoff/`** reçoit la réponse à « que devient une image à la régénération ? » (FR-011), dans `08-status-what-doesnt-work.md`, avec pointeur vers la matrice.

**Motif, et une affirmation du dépôt renversée.** Le CLAUDE.md affirme (`:19`) que la réponse *« lived only in code comments and one eval header »*. **C'est faux depuis le 2026-08-04** : le commit `504dd0a` a ajouté `docs/FIGMA-CAPABILITY-MATRIX.md:360-372`, qui répond en clair, sans lire le code, avec sa table à deux lignes (fait que le contrat peut porter → *overwritten, deliberately* ; fait qu'il ne peut pas porter → *preserved, by an explicit rescue pass — never by luck*) et les **deux limites nommées** du sauvetage. Le CLAUDE.md est exact comme récit du 2026-08-03 et trompeur comme état courant : il sera daté, pas effacé.

En revanche `docs/handoff/` **est** muet, vérifié : deux occurrences seulement de « photo » sur les 12 fichiers, toutes deux narratives dans `10-history.md` ; rien dans 07 (what works), 08 (what doesn't work) ni 12 (reference), pas un mot sur `harvestImagePaints`, A5 ou le lavis `#D9D9D9`. Le paquet d'accueil est bien muet sur le sujet qui porte le pire écart mesuré du système (SC-007).

**Note de structure, pour ne pas la re-découvrir.** §(b) est réservée aux canaux `CARRY-CODE-ONLY`, or la ligne 91 verdicte l'image `CARRY-BOTH (add — § a.7)`. L'absence de ligne image n'était donc **pas un oubli de saisie** : c'est structurel. L'addendum du geste 2 est ce qui rend le geste 1 cohérent, et non l'inverse.

---

## D13 — Le contrat ne bouge pas, sauf deux descriptions manquantes ; le schéma ne bouge pas du tout

**Décision.** Aucune image n'entre au contrat (FR-012). **Trois** ajouts de description seulement : `ds.carte.imageUrl`, `ds.member-picture.src` et `ds.member-card.imageUrl` — **les trois seules des onze props d'URL à ne pas porter la convention par écrit**. Le schéma n'est pas touché. *(Cette décision disait « deux sur dix » : compte re-mesuré le 2026-08-06 — il valait sous une restriction jamais écrite, « les 9 contrats à part `img` ». `ds.member-card` n'a pas de part `img` — sa photo vient de `ds.member-picture` — mais porte sa propre prop d'URL nue, et c'est l'un des 5 sujets de mesure d'US2.)*

**Motif.** FR-012 demande que la convention soit réaffirmée et non contredite. Elle l'est déjà, huit fois, et dans les mots mêmes que la spec cite : `contracts/reassurances.contract.json:39` — *« Figma n'expose aucune propriété de composant pour ces pixels. Le contrat porte donc la ROUTE, jamais les octets »* — et `contracts/review-card.contract.json:119`, la seule URL réellement liée à une propriété Figma, qui se déclare *« inerte sur le canevas (trou A5, R6) »*. Combler les deux trous est le geste le moins cher pour que la donnée dise ce que la prose affirme.

**Le schéma tient déjà FR-012 par construction — vérifié, pas supposé.** Le canal `background-image` ouvert par 015 vit dans `literals` avec sa propre grammaire `GRADIENT_LITERAL_RE = /^linear-gradient\(.*\)$/s` (`packages/schema/src/contract-schema.ts:231-236`, refinement `:1064-1090`). **Une `url()` d'image y est refusée par nom à la validation du schéma**, pas seulement à l'émission. Il n'y a rien à durcir.

**Semver.** Ajouter une description ne touche ni prop, ni valeur, ni `accepts` : **patch**. Aucun `major`, aucun `minor` dans cette spec.

---

## D14 — Les re-pins que ce chantier déclenche : trois reçus, pas un

**Décision.** Toute édition de `core/emit-figma-script.ts` déclenche, dans cet ordre : `npm run build` → `npm run golden:update` (les **37 scripts générés sur 72** qui portent le harvest changent) → `node scripts/build-plugin-zip.mjs --update-engine-receipt` → régénération de `examples/polaris/figma/*.figma.js`.

**Motif.** Trois reçus indépendants, et deux sont des pièges connus du dépôt :

- `evals/golden.json` — le byte-pin des sorties générées ; autorité unique : le cas `golden-generated-output` (`evals/run.ts:1822-1846`).
- `figma-sync/plugin/engine.receipt.json` — **dérive dès qu'on touche `core/`**, `tokens/`, `contracts/` ou `assets/icons/`, et fait échouer `plugin:check` au flux 1 avec un refus nommé (`scripts/build-plugin-zip.mjs:247-250`). Re-enregistrement **délibéré** uniquement.
- `examples/polaris/figma/*.figma.js` — le troisième reçu, celui qu'on oublie : golden et engine.receipt ne couvrent que les contrats.

---

## D15 — Ce que 017 rend visible sans le réparer (frontière avec la suite)

Consigné ici pour que FR-009 ait où atterrir, et pour ne pas embarquer silencieusement.

- **`D-016-REPEAT-SAMPLE-PAR-VARIANTE`** — un `repeat` n'a qu'un `sample` pour toutes ses variantes : la 5ᵉ carte de `ds.reassurances` **et sa photo** se reperdent à chaque rebuild. Perte *structurelle*, hors périmètre (spec § Out of Scope) ; la consigne de reposer la carte à la main reste valable tant qu'il vit.
- **`DW-014-002`** — la parité visuelle rend `emit-html`, jamais la surface React livrée. 017 **répare la donnée mesurée, pas la surface mesurée** : les huit lignes deviennent honnêtes sur `emit-html`. L'angle mort demeure entier, et la roadmap le tient pour « le plus gênant ». À ne pas laisser croire fermé par la remise à armes égales.
- **`D-016-CARTE-BOUTON`** — `ds.carte` (Categorie) rend une part unique `action` là où le master porte trois enfants. C'est le principal reste du diff pixel des maquettes à cartes, et il se cache aujourd'hui **sous** les 56,56 % de la ligne `carte / Disposition=Categorie`. La remise à armes égales va le découvrir : il est déjà nommé, une tinyspec existe (`specs/tiny/carte-bouton-glyphes.md`).
- **`D-016-SECTIONS-LOCALES-CARTES`** — arbitrage owner ouvert, non traité.
- **Le mock accepte la mutation en place de `fills`** (D5) — classe de défaut orthogonale, découverte ici, non réparée ici.
- **Le plan des 62 photos n'a pas de drapeau machine.** `specs/016-canvas-vrai/proofs/repose/photos-instances.json` porte les **97** photos du relevé sans distinguer « déjà bonne » de « à reposer » ; la répartition 62/35 et « 10 sections de 8 maquettes » ne vit que dans le message du commit `51cab06`, non re-dérivable du JSON. À nommer avant de s'appuyer dessus pour la précondition FR-005.

---

## D16 — Ordre d'exécution : tout le sans-tête d'abord ; le vif attend la restauration des 62

**Décision.** US1 sans tête (moteur + mock + fixture + eval), US2 (instrument, sans canevas), US3 (émetteur + docs) s'exécutent sans le fichier client. **Aucune reconstruction sur le fichier client** — donc aucun reçu vif FR-002b — ne démarre avant que la restauration des 62 photos soit exécutée et prouvée.

**Motif.** FR-005, précisé par la checklist : la précondition ne bloque **que** le travail sur le fichier client. La restauration appartient à 016, son plan est commité, son exécution attend le pont (`51cab06` : « Exécution en attente du pont figma-console (déconnecté) »). 017 en dépend, empêche la récidive et la rend détectable ; il ne la refait pas.

**Conséquence de planification.** Le reçu vif exige le fichier ouvert avec le pont branché : il ne tourne ni sans surveillance ni en intégration continue, et **sa fenêtre se planifie avec l'owner** (spec § Assumptions). La sonde `getInstancesAsync` de D1 est en revanche en lecture seule : elle peut passer bien plus tôt, et elle doit, puisque D1 en dépend.

---

## D17 — Pièges d'outillage portés au plan pour ne pas être re-découverts

- **`extract/figma/visual-parity/run.ts` contient 2 octets NUL légitimes** : `grep`/`rg` BSD le croit binaire et rend **0 résultat sans erreur**. Utiliser `grep -a` / `rg -a` ou Python. Même piège dans `core/emit-html.ts`.
- **`evals/fixtures/` est hors `tsconfig`** : changer une signature partagée laisse `tsc` vert et casse `npm run eval` au runtime.
- **`evals/.scratch` est un chemin unique** : jamais deux sweeps en parallèle, sous peine de faux rouges.
- **Worktree F1** : `npm install` **et** `npx playwright install chromium` dans le worktree ; le runner d'eval symlinke le `node_modules` du checkout. Créer le worktree **après** avoir commité les documents de planning, sinon il les manque (leçon 015/T001, intégrée en amont par 016).
- **Le compte vif fait foi** : `npm run eval` imprime son `N/N` ; aucun compte n'est recopié depuis la prose. Idem pour les scores de parité.
