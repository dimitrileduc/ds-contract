# Research — 016 · Canvas vrai

**Date** : 2026-08-05 · **Entrée** : `spec.md` (clarifications closes) · **Méthode** : docs-first (§IX) — auggie MCP sur `docs/`, `parity/`, `core/`, `figma-sync/`, les registres de 013/014/015, puis vérification en direct des fichiers cités. Chaque décision porte sa provenance.

## D1 — Création des 83 variables : exécuter `figma-sync/01-tokens.js` tel quel, via le pont

**Decision** : les 83 variables (6 `space/N` + 77 `size/<composant>/*`) sont créées en exécutant le script **déjà généré** `figma-sync/01-tokens.js` dans le fichier client via le pont figma-console (`figma_execute`). Aucun code nouveau.

**Rationale** : vérifié en direct — `figma-sync/01-tokens.js` (régénéré par `npm run build` à la clôture de 015) porte **déjà** les 83 primitives avec leur valeur, leur type FLOAT, leurs scopes (`WIDTH_HEIGHT`, `GAP`+`WIDTH_HEIGHT` pour les space) et leur `codeSyntax` (`var(--size-carte-root)`…). Le script est un **upsert idempotent** : `createVariable` pour les manquantes, `setValueForMode` + scopes + codeSyntax ré-appliqués pour toutes — deux exécutions convergent. C'est la voie déterministe (constitution §I) : le générateur a produit le script, le pont ne fait que l'exécuter.

**Alternatives considered** : `figma_import_tokens` (outil MCP) — rejeté : il ne pose ni les scopes ni le codeSyntax que le générateur calcule, et il sort du chemin gouverné contract→surface. Création manuelle dans l'UI — rejetée : non rejouable, non auditable.

## D2 — « Liée aux usages » : la liaison s'installe par la régénération (US3), pas par un geste séparé

**Decision** : FR-001 se livre en deux temps. **U1a** (lot variables) : création des 83 variables → l'axe `variables canvas ⟷ tokens` reprend, les 83 acquittements tombent. **U1b** (avec la régénération US3) : les liaisons `setBoundVariable` s'installent quand les scripts de composants ré-appliquent leurs specs ; un **audit de liaison** post-régénération (lecture bridge des `boundVariables` par master, comptés contre l'attendu) prouve la seconde moitié de FR-001.

**Rationale** : deux faits vérifiés. (1) `parity/diff.ts` (`checkTokens`) compare **existence et valeurs** des variables contre `tokens/` — il ne vérifie pas les liaisons ; la chute des acquittements ne dépend que de la création. (2) Les scripts générés portent déjà les liaisons : `core/emit-figma-script.ts` émet `fixedWidth: { px, varName }` (cases `width`/`height`/`min-*`, lignes ~1124–1150) et le runtime exécute `node.setBoundVariable('width', need(spec.fixedWidth.varName))` (ligne ~3339) ; idem `itemSpacing`/`padding*` via `spec.bindings` (vérifié dans `figma-sync/06-carte.js`). Lier « à part » exigerait un script ad hoc dont le travail serait **défait à la régénération suivante** (le chemin amend reconstruit les enfants depuis la spec) — la seule liaison durable est celle que la régénération elle-même pose. Et régénérer avant US2 serait régénérer deux fois — exactement ce que la priorité de US2 interdit.

**Alternatives considered** : script de liaison one-shot avant US2 — rejeté (défait au prochain amend, double régénération) ; étendre le moteur — inutile (déjà capable).

## D3 — Le test de sentinelle : une édition de **valeur de variable**, classée `figma-tokens|mismatch`

**Decision** : la sentinelle de US1 est l'édition d'une valeur de variable de géométrie dans la maquette (ex. `size/carte/root` 364 → 999), suivie d'une ré-extraction du cliché et de `npm run parity` : attendu un finding `figma-tokens|mismatch|Primitives/size/carte/root [Value]` avec `proposedPatch.adoptFigmaValue` — signalé **et** classé, remède proposé. Puis annulation, ré-extraction, et **deux** passes `parity` sans geste rendant le même verdict (SC-002).

**Rationale** : c'est le canal gouverné — une dimension liée à une variable se modifie par la variable ; `parity/diff.ts` produit exactement cette classification avec remède (`Adopt into tokens/ … or push tokens/ to Figma`). **Limite nommée (honnêteté §V)** : un détachement de liaison au niveau du nœud (le designer « detach » puis tape une valeur brute) n'est pas surveillé en continu par l'axe tokens ; il est rattrapé à la régénération/au prochain audit de liaison. Cette limite est documentée dans le rapport de clôture, là où la capacité est revendiquée.

**Alternatives considered** : sentinelle par redimensionnement brut d'un nœud — rejetée comme preuve de US1 (elle testerait la limite ci-dessus, pas l'axe rebranché) ; étendre `extract-figma.plugin.js` pour surveiller les liaisons en continu — hors « strict besoin » (FR-002 est satisfait par l'axe existant), légué explicitement.

## D4 — DW-002 : geste canvas explicite (cartes à 363,5) + le token suit dans le même lot

**Decision** : la correction DW-002 est un **geste canvas annoncé** (les cartes de reassurances passent FIXED 364 → 363,5 ; conteneur 1550 et gaps 32 intacts) **plus**, dans le même lot, la promotion du token `size.carte.root` 364 → 363,5 dans `tokens/primitives.tokens.json` (+ `npm run build`, re-pins golden/engine.receipt), pour que tokens, code et canvas disent le même nombre. Le sort du plan image intérieur (`size.carte.reassurance-image`, 364) est tranché **à l'annonce du lot**, depuis le relevé vif de la structure (FILL → rien à faire ; FIXED → 363,5 aussi) — jamais supposé.

**Rationale** : décision owner du 2026-08-05 (Clarifications) : la source rejoint ce que le code livré rend déjà (le CSS flex rétrécit à 363,5) — écart rendu attendu **nul** côté code, débordement de 2 px éteint côté source. L'ordre interne du lot importe : tant que la largeur du master n'est pas liée à la variable (la liaison arrive en US3, D2), l'édition du token seul ne bougerait pas le canvas — d'où le geste canvas explicite. La valeur 363,5 est déjà licite dans la fondation (`size/member-picture/root-member-card` = 363.5). La preuve : mesure Playwright du rendu code avant/après (delta attendu 0) + preuve pixel canvas conforme à l'annonce (l'écart canvas est le geste lui-même).

**Alternatives considered** : conteneur à 1552 ou gaps à 31,33 — écartées par l'owner (Clarifications) ; corriger « par le token d'abord » — inopérant avant liaison (ci-dessus).

## D5 — Registre des défauts de source : un document commité, et les 2 entrées DW closes par `resolvedBy`

**Decision** : créer `specs/016-canvas-vrai/registre/defauts-source.json` — le registre gouverné des **10** défauts (DW-002, DW-003 + les 8 du backlog 013), chaque entrée portant : id, provenance (registre 013 / mémoire projet `figma-cleanup-backlog-013`), diagnostic **re-relevé en vif** (la mémoire date du 2026-07-30 — une décision du dépôt n'est pas un fait), correction choisie, annonce d'écart, reçu re-testable, statut. À la clôture de chaque DW : `specs/014-mesure-juste-triage/proofs/registre/causes.json` reçoit `resolvedBy: "016-canvas-vrai"` sur l'entrée correspondante — la sémantique v2 de la porte (`measure-gate-counting-v2.md` : `resolvedBy` non nul ⇒ hors `byCause`, l'entrée **reste** au registre et sous C4). Le compte imprimé `npm run measure:gate` passe `figma-source: 2 → 0` — relu en direct, jamais recopié.

**Rationale** : FR-008 exige que les comptes imprimés des portes reflètent la clôture — le mécanisme existe déjà (posé par 015 pour DW-014-001) et il est éprouvé par la fixture `measure-gate-policy-check.ts`. Les 8 défauts du backlog ne vivent aujourd'hui que dans une mémoire projet : les matérialiser en registre commité est la condition de reçus re-testables (et la mémoire sera mise à jour pour pointer le registre).

**Alternatives considered** : clore en prose dans le rapport — interdit par FR-008 (« jamais une note en prose seule ») ; éditer le statut dans `work.json` de 013 — complémentaire mais insuffisant (la porte lit `causes.json`).

## D6 — Le cycle de preuve : `extract/figma/page-parity/` réutilisé tel quel, périmètre de capture = maquettes **et** pages DS

**Decision** : chaque lot mutant suit le cycle éprouvé par 005/007, avec l'instrument existant sans modification : (0) `bridge/checkpoint.js` — `saveVersionHistoryAsync("016/<lot>/<étape>")` (la regex de libellé accepte `\d{3}/` depuis 005) ; (1) relevé de structure par POSITION (`bridge/scan.js`) ; (2) **annonce écrite** de l'écart attendu, par cible, AVANT toute écriture ; (3) capture AVANT de **toutes** les cibles du lot (`receiver.mjs` port 9227 — santé + nonce vérifiés — puis `bridge/capture.js`) ; (4) vérification des PNG (non vides, dimensions attendues) — sinon STOP ; (5) le(s) geste(s) `figma_execute`, transcrits dans `proofs/<lot>/gestes.md` ; (6) capture APRÈS, même receveur/nonce ; (7) `npm run pages:compare` → verdict. Un écart hors annonce = lot annulé en entier, restauration **manuelle guidée** par l'historique de versions (aucune API de restauration programmatique — vérifié en 003), re-preuve, cause identifiée avant reprise. En ouverture de chantier : étalonnage ×2 sans geste (le plancher de bruit doit être zéro, comme 005/T007), et chaque lot **re-relève l'état juste avant d'écrire** (fichier vivant).

Le **périmètre de capture** d'un lot = les frames des 9 maquettes de la page `Pages` **plus** les frames des masters touchés sur les pages DS : une édition de master se propage aux instances, donc les maquettes changent aussi — l'annonce du lot doit chiffrer les deux (ex. DW-003 : l'en-tête FAQ passe 50 → ~83 et tout ce qui suit descend de 32 px sur la maquette).

**Rationale** : constitution §X (avant-capture, toutes les cibles, jamais un pilote) ; instrument déjà durci par les incidents réels (receveur étranger, nonce de session) ; 007 a déjà capturé 43 frames par cycle — le périmètre élargi est éprouvé.

**Alternatives considered** : captures MCP screenshot — rejetées sur reçu (plafond 1568 px silencieux, 003) ; restauration automatique — n'existe pas.

## D7 — Photos : harvest/restore moteur pour les masters + **instrument d'identité** dédié, par position et par `imageHash`

**Decision** : trois couches. (1) Le mécanisme **existant** des scripts générés (`harvestImagePaints`/`restoreImagePaints` — moissonne les paints IMAGE du master avant teardown, les repose sur les parts `imgPlaceholder`, rapporte `preservedImages`/`unplacedImages`) travaille pendant l'amend. (2) **Avant** tout lot de régénération : un recensement bridge commité (`specs/016-canvas-vrai/bridge/photos-census.js`) inventorie par POSITION chaque nœud porteur d'un paint IMAGE — masters **et instances des maquettes** (les overrides d'instance, ex. les ~27 photos de `realisation`, ne survivent pas forcément à la reconstruction des enfants du master) — avec `imageHash`, octets via `figma.getImageByHash(h).getBytesAsync()` hachés côté Node (sha256), dimensions. Le compte est confronté aux **9 composants porteurs** annoncés par la spec ; un écart = STOP et réconciliation avant d'écrire. (3) **Après** chaque lot : re-relevé, **verdict d'identité par photo** (`imageHash` identique au même endroit — l'imageHash Figma est un condensé de contenu : même hash ⇔ mêmes octets), replacement guidé de tout override perdu, et rapport par composant (`photos-report.json`) : attendues / replacées / non replacées **nommément** / verdict d'identité. MemberCard reste bloqué honnêtement (frontière A5, matrice ligne 91 — le pixel réel est un override hors contrat jusqu'à 017).

**Rationale** : FR-007 exige l'**identité**, pas la présence — et le restore moteur a un fallback « premier paint non réclamé » (`pool.find((e) => !e.claimed)`) qui peut intervertir deux photos de même taille : c'est précisément le risque nommé par l'edge case de la spec, donc la vérification doit être indépendante du mécanisme qu'elle vérifie. Candidats au recensement (à confirmer par le relevé, jamais par cette liste) : hero, presentation, realisation, sav, coordonnees, member-picture, member-card, product-card, carte.

**Alternatives considered** : faire confiance au rapport `preservedImages` du script — rejeté (c'est le sujet du contrôle, pas le contrôle) ; comparaison pixel des rendus — plus faible que l'égalité d'`imageHash` (rééchantillonnage) et plus coûteuse.

## D8 — Field : défaut **moteur** nommé (largeur intrinsèque de l'Input slotté) ; NavItem : défaut de **mesure** ; re-dériver la condition de déblocage avant d'agir

**Decision** : la première tâche du volet déblocage re-dérive la condition exacte depuis les artefacts vivants — `extract/figma/visual-parity/triage.ts` (field : classe `engine`, « the SLOTTED Input still keeps its intrinsic width inside that identically-sized box » ; nav-item : classe `rendering`, antialiasing sur fond sombre, Δ2 px de HUG), `REPORT.md`, et les portes de dépendance de 013 (formulaire fermé par `ds.field:blocked`, header par `ds.nav-item:divergent` — reçus d'époque, antérieurs à la re-mesure de 014). Chemin prévu : **field** — correction moteur fixture-d'abord (l'enfant slotté doit remplir la largeur de son conteneur comme le canvas le fait via `layoutSizingHorizontal: FILL`) : fixture/eval AVANT l'édition d'émetteur (§II), puis régénération et les re-pins qu'une édition d'émetteur dérive (golden + engine.receipt + `examples/polaris/figma/*.figma.js` — mémoire `emetteur-repin-polaris-showcase`) ; **nav-item** — re-mesure post-chantier avec cause re-confirmée et reçu frais (son écart est un artefact de rastérisation cross-renderer, pas un fait de contrat). SC-006 se prouve par : les deux sujets mesurent, leurs lignes sont attribuées à une cause vivante, et aucun reçu `blocked`/`fail` d'époque ne subsiste comme dernier mot. La campagne d'audit 013 n'est **pas** re-déroulée (elle est close ; ses dossiers restent datés).

**Rationale** : ROADMAP (« défauts moteur/mesure nommés ») + triage vivant relu. Le détail du geste moteur dépend d'un diagnostic qu'il faut refaire au vif (une décision du dépôt n'est pas un fait) — le plan fixe le chemin et la preuve, pas la ligne de code.

**Alternatives considered** : forcer une largeur dans le contrat de Field — c'est le contournement d'un défaut moteur, interdit ; rouvrir la campagne 013 — hors périmètre (dossiers datés, close).

## D9 — Corrections du backlog 013 : chaque fix canvas déclenche sa **promotion** code-side, au bon semver

**Decision** : les 8 défauts se corrigent dans Figma (§VIII), puis leur contrepartie code suit le chemin des promotions — jamais l'inverse, jamais un contournement : (a) **4 props orphelines** supprimées des masters (presentation, sav, coordonnees ×2) — vérifiable par `componentPropertyReferences` vs `componentPropertyDefinitions` ; (b) **SectionHeader alignement** : variante gouvernée sur le master, les 5 surcharges d'instance (`textAlignHorizontal=LEFT`, scannées par POSITION) remplacées par la variante ; le prop `alignement` du contrat passe de l'axe code-side à un binding VARIANT (mineur) ; (c) **SectionHeader emphase** : typos d'instance (hero, presentation, texte-seo) promues en variantes — même mécanique ; (d) **masters sans propriétés TEXT** (hero, sav) : propriétés Texte exposées et liées ; (e) **coordonnees row-reverse** : calques remis dans l'ordre normal, le contrat ré-ordonné en promotion (et la re-classification `instrument` de 015 sur ce sujet retombe) ; (f) **texte-seo, 2e ligne dépliée** : décision owner à consigner (intention ou accident) AVANT geste — un point de décision d'exécution, pas un bloqueur de plan ; (g) **hero fills[1] mort** (`visible:false`) supprimé ; (h) **`ds.button` `outilneNoir`** : renommage canvas de la valeur de variante, puis bump **MAJEUR** du contrat (valeur d'enum renommée, §VI) et migration des consommateurs internes du dépôt dans le même mouvement. Chaque fix qui rend une limite nommée sans objet la fait tomber, avec preuve d'absence de régression (FR-009) ; chaque contrat touché est re-généré et les re-pins suivent (golden, engine.receipt — mémoire `plugin-engine-receipt-repin`).

**Rationale** : constitution §III (les surfaces ne se synchronisent jamais de côté ; le contrat est le point de passage) + §VIII (le défaut se corrige à la source) + §VI (semver strict). Le backlog vient d'une mémoire de 5 jours : chaque diagnostic est re-relevé au vif avant le geste (D5).

**Alternatives considered** : tout absorber côté code — c'est la définition du contournement que FR-003 interdit ; corriger sans re-relevé — refusé (mémoire ≠ fait).

## D10 — La liste des cibles de régénération : ce que le différentiel classe divergent **après** US2, cliché frais à l'appui

**Decision** : après les corrections de source, ré-extraire les clichés (`parity/extract-figma.plugin.js` via le pont → `parity/snapshots/figma-components.json` + `figma-tokens.json`) et prendre pour liste de cibles **exactement** les findings canvas actifs de `npm run parity` (plus les 4 acquittements figma d'avant 015 — `Avantage.PiquerayLogo`, `Carte.Bouton`, `SectionHeader.Bouton`, `Presentation.Texte (default)` — re-jugés à cette occasion : régénérables maintenant que les scripts sont amend-capable, ou re-acquittés sur décision owner consignée). La régénération exécute les scripts `figma-sync/NN-*.js` concernés (chemin amend : réconciliation en place, même node id/key, harvest/restore photos), en **écrivain unique**, lots séquentiels partitionnés par zones disjointes — §XI est respecté par construction (pas de parallélisme sur un fichier client vivant), et s'il fallait paralléliser, un seul cycle global de vérification pixel appartiendrait à l'orchestrateur.

**Rationale** : hypothèse de la spec (« la liste = ce que le différentiel classe divergentes à l'ouverture ») ; l'amend est le chemin conçu pour ça ; l'écriture unique minimise le terrain d'erreur sur un fichier client.

**Alternatives considered** : régénérer les 34 d'office — refusé (mutations sans nécessité sur fichier vivant) ; multi-writer — permis par §XI mais non nécessaire ici.

## D11 — Clôture de l'axe acquittements : les 83 tombent, le résidu est re-justifié un par un

**Decision** : à la clôture, `parity/baseline.json` ne contient plus **aucune** entrée `figma-tokens|behind|Primitives/(space|size)/…` (les 83) ; chaque entrée restante est re-justifiée ou supprimée si le chantier l'a rendue obsolète (les 4 figma|* d'avant 015, l'icône close.svg, le mismatch montserrat). Le niveau résiduel attendu ≈ celui d'avant 015 (la spec dit ≈7 ; le fichier vif en montre 6 hors géométrie aujourd'hui — **le compte vif fait foi**, l'écart est nommé au rapport, jamais lissé).

**Rationale** : SC-001 + la règle des comptes vifs (constitution, Quality Gates) ; le reçu 015 `figma-tokens-behind-baseline.md` documente l'aller (7 → 89), 016 documente le retour.

**Alternatives considered** : viser zéro acquittement absolu — explicitement hors spec (Assumptions).

## D12 — Fenêtres de travail et préconditions matérielles

**Decision** : tout geste canvas exige le fichier client (`d9FYAUcqdcNtsuaMgLefvJ`) ouvert dans Figma desktop avec le pont figma-console branché et identifié (`figma_get_status`/`figma_reconnect`, port 9223 ; `loadAllPagesAsync` avant tout accès à la page `Pages` 210:325) ; les fenêtres de mutation se planifient avec l'owner (Dependencies de la spec) ; rien ne tourne en CI ni sans surveillance. Les sweeps de gates (build/parity/eval/plugin:check/roundtrip/browser-check/tsc ×2) tournent à chaque point de contrôle repo-side — worktree F1 si le travail s'exécute en worktree (`npm install` + `npx playwright install chromium` dedans d'abord) ; deux sweeps jamais en parallèle (`evals/.scratch` unique — mémoire `eval-scratch-partage-collision`).

**Rationale** : constitution (Worktree Gates F1) + contraintes matérielles du pont, éprouvées par 003/005/007.
