# Journal des décisions et des lots — 016 · Canvas vrai

Ce document est le journal **chronologique** du chantier. Chaque lot mutant y laisse
une entrée à quatre colonnes — **annonce ⟷ observé ⟷ verdict ⟷ versionId** — écrite
au moment du lot, jamais reconstituée après coup (`contracts/proof-cycle.md`, étape 9).

Les décisions d'exécution (arbitrages owner, écarts constatés avec le plan, faits qui
contredisent une annonce) se consignent ici **datées**, y compris quand elles
contredisent la prose des documents de planning : le compte vif fait foi.

---

## Faits d'ouverture (2026-08-05)

### O-1 · Le pont figma-console n'est pas sur le port annoncé

`plan.md`, `research.md` (D12), `quickstart.md` et `tasks.md` annoncent tous le
port **9223**. Le relevé d'ouverture (`figma_get_status`, probe active) montre le pont
sur le port **9232**, fallback automatique depuis 9223.

**Cause mesurée** : le poste porte 17 sessions Claude Code ouvertes ; chacune lance un
serveur MCP `auggie --mcp` qui démarre à son tour un `figma-console-mcp`. Chaque
instance prend le premier port libre à partir de 9223 — elles occupaient 9223→9229 au
relevé. Le fallback est un comportement normal du serveur, pas une anomalie.

**Conséquence pour le chantier** : le port du pont est un **fait relevé à chaque
fenêtre**, jamais recopié depuis un document. Le pont a été vérifié identifié sur le
bon fichier (`d9FYAUcqdcNtsuaMgLefvJ`, « Piqueray (Copy) »), page `Pages` `210:325`
atteinte après `loadAllPagesAsync()` — 9 enfants.

### O-2 · Le port 9227 du receveur page-parity était squatté — et le garde-fou a tenu

Au relevé d'ouverture, **deux** processus répondaient sur 9227 :

| Processus | Bind | Nature |
|---|---|---|
| `figma-console-mcp` (pid 73884) | `[::1]:9227` (IPv6) | squatteur — répondait à `curl localhost:9227/health` |
| `receiver.mjs .page-parity/capture 9227` (pid 66442) | `127.0.0.1:9227` (IPv4) | receveur page-parity **zombie du 2026-07-27** |

`receiver.mjs:145` fait `server.listen(port, '127.0.0.1')` — IPv4 seulement — tandis que
`capture.js:52,87` appelle `fetch('http://localhost:' + port + …)`, que macOS résout en
IPv6 d'abord. Un serveur étranger sur `[::1]` intercepte donc le trafic destiné au
receveur.

**Ce qui n'a PAS eu lieu, et c'est le point important** : aucune capture n'aurait pu
atterrir en silence chez le mauvais serveur. `capture.js:58-61` refuse si
`health.instrument !== 'page-parity'` et `:68` refuse sur nonce différent — **avant**
d'envoyer le moindre octet. Le durcissement posé par 005/007 (le nonce de session que
T003 demande de pinner) a fonctionné exactement comme prévu. Le risque réel était un
**blocage franc**, pas une corruption silencieuse.

**Geste correctif (hors canvas, poste seulement)** : 7 receveurs page-parity zombies
(du 27/07 au 03/08, dont un lancé depuis un worktree `paseo` supprimé), 1 receveur
gauntlet et une dizaine de serveurs `figma-console-mcp` orphelins ont été arrêtés.
Les serveurs MCP se relancent seuls (leurs sessions Claude Code sont vivantes) et
réoccupent 9223→9229 ; **le port du receveur se choisit donc au relevé, dans la plage
autorisée par le manifest du plugin** (`http://localhost:9223` … `9232`, vérifié dans
`~/.figma-console-mcp/plugin/manifest.json`), et non par recopie du « 9227 » des
documents.

**Collision la plus dangereuse trouvée puis éteinte** : un receveur page-parity zombie
(`button-property-names/after`, pid 78075) écoutait en IPv4 sur **9232**, le port même
du pont actif en IPv6.

### O-3 · La première capture d'une session ne fait pas foi — règle de préchauffage

L'étalonnage T005 a **déclenché son veto** à la première passe : 8/9 `identical`, la
maquette `accueil` montrant `diffCount=75` dans une boîte de 83×128 **sans qu'aucun
geste n'ait eu lieu**. Diagnostic complet et preuves : `proofs/00-etalonnage/RECU.md`.

**Cause** : la zone instable recouvre un rectangle porteur d'un paint `IMAGE`
(`ProduitsECommerce/ProductCard/Image`, 240×240). Quatre passes de la même frame,
aucun geste entre elles :

| Passe | Octets | sha256[:16] |
|---|---:|---|
| A (1ʳᵉ du chantier) | 5 087 927 | `bef70b6bef4d941c` |
| B, C, C-bis | 5 089 303 | `79df421d626b18ff` (les trois) |

La première capture d'une frame dont une image n'est pas encore décodée sort
**incomplète** ; à chaud, `exportAsync` est byte-déterministe.

**Règle adoptée pour tout le chantier** :

> Le premier jeu de capture d'une session ne sert **jamais** de référence. Toute capture
> AVANT au sens de §X est précédée d'une passe de préchauffage sur les mêmes cibles ;
> c'est le second jeu qui fait foi.

Sans elle, une capture AVANT prise à froid documenterait un état antérieur qui n'a
jamais existé — §X reposerait sur une preuve fausse. Étalonnage re-passé à chaud
(`b` ⟷ `d`) : ✅ **9/9 `identical`, exit 0**, veto levé.

**Rien dans le dépôt ne mentionnait ce phénomène** (`contracts/proof-cycle.md`, `docs/`,
les reçus 003/005/007 sont muets) — acquis d'instrument à porter au rapport de clôture.

### O-4 · `measure:gate` ne peut pas rendre son compte dans un worktree neuf

`tasks.md` (Conventions de mesure, T007) annonce `npm run measure:gate` en verdict
**PASS** avec `figma-source=2`. Le vif dans le worktree neuf donne :

```
✗ measure:gate BLOCKED — the entries themselves are unusable:
  · artifact-missing: extract/figma/visual-parity/out/rows.json — run `npm run extract:figma:visual` first
```

Ce n'est **pas** une régression : `out/` n'est pas versionné, et la porte lit un artefact
que seule la campagne de mesure visuelle produit. Conséquence pour le chantier :
`npm run extract:figma:visual` est un **prérequis de toute lecture de `measure:gate`**,
donc de T007, T035 et T051. La sweep de départ archive ce refus tel quel plutôt que de
le masquer — un refus nommé n'est pas un échec silencieux.

---

### D-1 · Décision owner du 2026-08-05 — B013-6 : intention, pas accident

**Question posée** (point de décision T027, bloquant pour le lot L-B013-6) : dans le
master `texte-seo`, la 2ᵉ ligne d'accordéon est dépliée — état de démonstration voulu,
ou accident ?

**Fait décisif apporté par le relevé vif** (que le diagnostic d'origine ne portait pas) :
la **seule** ligne ouverte est aussi la **seule** à porter un contenu réel
(« Pour une simple visite découverte, le showroom est ouvert aux horaires indiqués… ») ;
les deux lignes fermées portent le placeholder `Réponse`.

**Décision** : **INTENTION**. Aucun geste. L'entrée `B013-6` est **close** au registre
avec son reçu (`proofs/recus/B013-6.md`), au titre de FR-003 (« clos sans geste sur
relevé vif / décision owner consignée »).

**Conséquence code** : le champ d'item `etat` (`arrayOf` + `enum`, extension posée par
013) cesse d'être une compensation d'un défaut et redevient la modélisation juste d'un
fait de design voulu. Rien à changer.

---

### O-7 · Disposition des dossiers — corrigée, F1 tenue

**Le défaut** : T001 crée un worktree dédié (règle F1, constitution *Worktree Gates*).
La branche `016-canvas-vrai` étant déjà sortie dans le checkout principal, celui-ci a
été **détaché** pour la libérer — et le travail est parti dans le worktree sans que la
conséquence soit dite assez clairement. Pendant 9 commits, le dossier habituel de
l'owner affichait un `tasks.md` figé à **0/81** quand le worktree était à **32/81**.
Laisser l'owner devant un dossier mort est un défaut de méthode, pas un détail.

**La correction, et pourquoi elle est la bonne** : le détachement n'était pas
nécessaire. La disposition normale — celle qu'avait la spec 015 — est :

| Dossier | Contenu |
|---|---|
| `ds-contract` (principal) | branche **`main`** — un état légitime et lisible, jamais détaché |
| `ds-contract-016` (worktree) | branche **`016-canvas-vrai`** — le chantier, gates en isolation |

**F1 est donc tenue**, et le checkout principal n'est plus dans un état bâtard. Aucun
écart à assumer : il n'y en a plus.

**Précaution à chaque bascule** : `.page-parity/` (268 Mo, **hors git**) suit la spec —
il contient `00-REFERENCE-AVANT-CHANTIER/`, l'état visuel de référence de tout le
chantier. Le déplacer avant toute manipulation de worktree n'est pas optionnel : sans
lui, le comparatif visuel de clôture devient impossible à produire.

**Ménage joint** : le worktree de la spec 015 (close et fusionnée) traînait encore ; il a
été retiré, sa branche conservée.

**Où travailler** : `/Users/dlstudio/.superset/projects/ds-contract-016`.

---

### O-8 · La régénération est bloquée par deux défauts moteur — trouvés par un pilote d'un seul composant

Reçu complet : `proofs/recus/defauts-moteur-regeneration.md`.

1. **La famille de police est codée en dur à `Inter`** (`core/emit-figma-script.ts:3378`). Le
   rattrapage par `textStyle` est inopérant : `TEXT_STYLES` est vide (mesuré en US1). Portée :
   **tout composant textuel**. Une régénération complète aurait remplacé la typographie du
   système entier.
2. **Une couleur de bordure sans largeur produit un stroke plein sur le canvas** alors qu'en CSS
   elle ne dessine rien. Portée mesurée : **11 parts sur 8 contrats** (google-reviews x4,
   accordion-row, footer, input, review-card, select, tab, textarea).

**Ce qui a permis de les trouver** : avoir régénéré **un** composant avant 44. Et, pour le
premier, **l'oeil de l'owner sur la revue visuelle** — l'instrument avait rendu `exit 2`
(dimension-mismatch) et l'analyse concluait « le canvas dit ce que dit le contrat », ce qui
était vrai pour la géométrie et faux pour la police.

> **Règle à porter au rapport** : un verdict pixel qui REFUSE de se prononcer (`exit 2`)
> n'autorise pas à conclure à la conformité. Et une revue visuelle lisible vaut un verdict,
> parce qu'elle rend le défaut visible à qui connaît le design.

**État laissé sur le canvas** : geste correctif ciblé sur `Tab` (Montserrat rétabli, strokes
parasites retirés, bordure basse de 2 px conservée sur l'état sélectionné). La maquette
`Dépannage/SAV` est **byte-identique** à son état d'avant le pilote (`c4acfdf1b9512cec`) ; seul
le master garde une boîte régénérée (163x202), transitoire — la prochaine régénération l'écrase.

**Prémisse re-testée** (jamais recopiée) : l'API du plugin n'expose ni `restoreVersionAsync`
ni `revertAsync`. La restauration d'une version reste un geste humain dans l'interface.

---

### O-9 · Quatre correctifs moteur en une session — et les deux verrous d'un amend

La régénération a révélé, en cascade, quatre défauts du moteur d'émission Figma. Tous
réparés **fixture rouge d'abord** (§II), tous validés en fixture, trois déjà validés sur
le canvas réel :

| # | Défaut | Fixture |
|---|---|---|
| 1 | Police codée en dur à Inter + rattrapage avalé par un catch muet (l'orthographe des styles diffère par famille : « Semi Bold » vs « SemiBold ») | `figma-font-family-from-token-check` |
| 2 | Couleur de bordure sans largeur → cadre plein (CSS : rien) | `figma-border-color-without-width-check` |
| 3 | Part `declared position:absolute` posée DANS le flux (insets en stylesWhen non lus ; motif top/left/right sans bottom non couvert) | `absolute-part-out-of-flow-check` |
| 4 | Taille d'icône par-prop ignorée (icon.size seul lu, jamais tokensByProp) | `icon-size-tokens-by-prop-check` |

**Les deux verrous d'un amend** (workflow 3 agents, reproduit dans le mock RUN par RUN) :

1. **La variable liée fait autorité** sur le px du script → l'ordre d'une régénération
   est *tokens d'abord, composants ensuite*.
2. **Le saut specHash** : écrit à la FIN d'un amend réussi ; un changement consommé par
   une exécution qui n'a rien livré devient invisible pour toujours. Déverrouillage :
   `set.setSharedPluginData('ds_contracts','specHash','')`.

**Leçon d'exécution sur fichier volumineux** : le timeout MCP (30 s) coupe la RÉPONSE,
pas l'exécution — l'amend continue dans le sandbox. Et une lecture de contrôle envoyée
pendant ce temps **préempte l'amend** (sandbox mono-tâche) : d'où des états intermédiaires
si l'on vérifie trop tôt. Protocole : lancer, attendre plusieurs minutes SANS toucher au
pont, lire UNE fois.

Validation canvas d'AccordionRow au moment de cette entrée : Grand fermé 64 ✓,
Grand ouvert 120 ✓, Petit ouvert 80 ✓ (trigger ABSOLUTE partout) ; la petite fermée
attend la fin d'un amend en cours.

---

### O-10 · Clôture de la session du 2026-08-05 — la boucle est prouvée, l'attribution des deltas reste

**Le chiffre central (U1b)** : **562 liaisons de variables sur 31 masters** — contre 10 sur 3
à l'ouverture. Relevés : `proofs/bindings-audit-avant.json` / `proofs/bindings-audit.json`.

**Fidélité de l'aller-retour, prouvée sur trois masters** (contrat → canvas = l'origine
exacte du fichier, mesurée contre les dumps REST en cache) :
AccordionRow **4/4** (64/40/120/80, trigger ABSOLUTE, chevrons 32/24) · Tab 86×41 pad 8/8 ·
Bouton 219×54 / 155×30 / 52×52.

**21 des 22 masters sans photo régénérés et liés**, `fontFallbacks: []` partout. Le 22ᵉ,
`CarouselControls`, échoue sur `Property value is incompatible with component property type`
— défaut NOMMÉ, non traité, et `npm run parity` le montre : ses 2 findings sont les seuls
actifs. Le différentiel dit exactement ce qui reste.

**Cinq correctifs moteur en une session**, tous fixture-rouge-d'abord :
police (orthographe des styles + catch muet) · bordure sans largeur · part absolue hors
flux (insets stylesWhen, mode partialV) · taille d'icône par-prop · **résolution des
dépendances par MARQUEUR** (`findComponentByName` cherchait le nom littéral — le master
s'appelle « Bouton », le contrat dit Button ; §VIII, l'identité n'est jamais un nom de calque).

**CE QUI N'EST PAS RÉGLÉ — dit, pas tu** : les 9 maquettes sont plus hautes que la référence
d'avant-chantier (+300 à +536 px, `proofs/FINAL2/`). Design intact (photos, textes,
couleurs) ; ce sont des espacements verticaux. Cause identifiée : d'autres contrats portent
des valeurs extraites avec le même défaut que `size.accordion-row.trigger` (hauteur TOTALE
de la variante au lieu de la hauteur de l'enfant — double comptage du padding). La méthode
de réparation est établie et prouvée sur l'accordéon : comparer chaque master à son dump
REST en cache, corriger le token, republier les variables, ré-amender (specHash effacé).
**Travail restant : l'attribution composant par composant, avec cette méthode.**

À l'œil (revue visuelle) : une différence de design à ARBITRER par l'owner — l'icône du
bouton « EN SAVOIR PLUS » (chevron sur l'ancien canvas, flèche prescrite par le contrat).

---

### O-11 · Décisions owner du 2026-08-06 et la perte d'overrides INSTANCE_SWAP

**Décisions prises** :
- **Icônes du header : 24 px** (l'origine), le contrat corrigé (3 × `icon.size` 32 → 24).
- Les 3 restaurations d'origine (Separator, U+2028 du footer, slots du formulaire) :
  **« montre-moi d'abord »** — crops envoyés (`DECISION-footer.png`, `DECISION-formulaire.png`),
  décision en attente.

**Le bouton « EN SAVOIR PLUS » — le fait vérifié blanchit le contrat** : le défaut
d'origine du master `Bouton` était **`6:104` = ArrowRight** (dump en cache), le contrat
dit `arrow-right` — ils sont d'accord. Le master `Hero` d'origine portait aussi la
flèche (libellé « Demander un devis gratuit »). Les chevrons `⌄` des heros étaient des
**surcharges posées sur les instances des maquettes** (libellé + glyphe).

**DÉCOUVERTE — la reconstruction des enfants d'un master PERD les overrides
INSTANCE_SWAP des instances** (le glyphe est retombé sur le défaut), alors que les
props TEXT survivent (les libellés « EN SAVOIR PLUS » sont intacts). C'est la même
famille de risque que les photos (D7), étendue aux swaps. Conséquence : l'état
d'origine de ces glyphes n'existe plus que dans les **PNG de référence**
(`00-REFERENCE-AVANT-CHANTIER/`) — la réparation est un recensement visuel puis une
repose ciblée par `setProperties`, à faire éveillé. À porter au registre des risques
de régénération aux côtés des photos.

Recensement d'origine des glyphes surchargés dans les MASTERS (dumps) : 2 seulement —
`CarouselControls.Suivant` (27:86, invisible) et `Reassurances.Bouton` (230:599).
Le reste des surcharges vivait au niveau des maquettes.

---

## Lots

> Une ligne par lot, ajoutée à sa clôture (étape 9 du cycle de preuve).
> `versionId` = le point de restauration `saveVersionHistoryAsync("016/<lot>/<étape>")`.

| Lot | Annonce | Observé | Verdict | versionId |
|---|---|---|---|---|
| **`U1a-variables`** (2026-08-05) | `identique` sur les 9 maquettes — **zéro pixel** ; 83 créations (77 `size` + 6 `space`), 1 MAJ de valeur (`montserrat`), 0 création Semantic, aucune collection `Brand`, 0 style de texte | **9/9 `identical`** ; rapport du script : `created: 83` / semantic `0` / brand `skipped` / textStyles `0` ; 2ᵉ passe `created: 0` (idempotent) | ✅ **conforme** | `2384251202054787848` |
| **`U1a-sentinelle`** (2026-08-05) | la valeur d'une variable de géométrie change côté maquette (`size/carte/root` **364** → 999, valeur de départ **relevée**) ⇒ le différentiel doit la **signaler**, la **classer** et proposer un **remède** ; puis annulation ⇒ retour à l'état exact, et 2 passes stables | finding `figma-tokens\|mismatch\|Primitives/size/carte/root [Value]` — `tokens/ says 364, Figma says 999`, `adoptFigmaValue: 999`, 2 remèdes proposés, **parity exit 1** ; après annulation : exit 0, 2 passes **byte-identiques** (`b5a9ed4b87f96c2e`), cliché identique au sain | ✅ **conforme** | `2384256876219261626` |
| **`L-DW002`** (2026-08-05) | master `Reassurances` **doit** bouger (3 variantes : cartes 364→363,5 et 285→284,4, conteneur 1550 et gaps 32 intacts) ; les maquettes **porteuses** d'une instance bougent de 2–3 px ; les **non porteuses** restent identiques au pixel | **3 identical / 7 diff** sur 10 cibles — les 6 porteuses ont bougé, les 3 non porteuses sont identiques, le master a bougé ; débordement résiduel **0** sur les 3 variantes ; chaque `diffBox` dans la bande de son instance | ✅ **conforme** | `2384258061656145845` |
| **`R-pilote-tab`** (2026-08-05) | régénérer UN composant sans photo pour mesurer le coût d'un cycle avant d'en toucher 44 ; liaisons attendues, écart visuel à constater | liaisons **0 → 8** ✅ ; MAIS **police remplacée par Inter** (défaut moteur, tout composant textuel) et **cadres parasites** sur les onglets inactifs (défaut moteur, 8 contrats) ; `pages:compare` **exit 2** (dimension-mismatch, refus de conclure) | ⚠️ **arrêté — défauts moteur bloquants** | `2384277698227071279` |

### O-5 · Trois obstacles d'outillage avant que le geste passe — aucun n'a touché le fichier

Le lot U1a n'a pas abouti du premier coup. Les trois échecs ont eu lieu **avant toute
écriture** ; ils se reproduiront à chaque lot de US3, qui exécute 35 scripts générés de la
même manière. Détail et code dans `proofs/U1a-variables/gestes.md`.

1. **Les scripts générés ne sont pas servables par le receveur** — `receiver.mjs` est jailé
   sur son propre dossier, et l'instrument est réutilisé *tel quel*. D'où
   `specs/016-canvas-vrai/tools/serve-scripts.mjs` (lecture seule, racine paramétrable,
   taille servie vérifiée contre le disque) : le script s'exécute **verbatim**, jamais
   retranscrit — c'est §I qui l'exige.
2. **Le manifest du plugin est figé au chargement du plugin.** `Failed to fetch` sur 9230,
   pourtant listé dans le manifest : le fichier a été réécrit à **15:54:43** (relance des
   serveurs MCP après le nettoyage O-2) alors que le plugin s'était connecté à **15:46:18**.
   → *Les ports joignables sont ceux du manifest au moment de l'ouverture du plugin ; un
   port se prouve par un `fetch` de test depuis le sandbox, jamais en lisant le fichier.*
3. **CORS.** `Failed to fetch` **aussi sur 9231**, où le receveur fonctionnait — donc ni le
   port ni le bind. `receiver.mjs:56-59` pose `Access-Control-Allow-Origin: *` et répond aux
   `OPTIONS` ; le serveur spec-local ne le faisait pas. Le message d'erreur est **identique
   à celui d'un port fermé**, ce qui rend le diagnostic trompeur.
4. **Un script généré n'est pas une IIFE.** `SyntaxError: expecting ';'` — les scripts
   *bridge* sont des IIFE, les scripts **générés** sont du code plat terminé par un `return`
   top-level (conçus pour être passés en `code` à `figma_execute`, qui les enveloppe).
   Servis puis évalués, il faut reconstituer cette enveloppe : `eval('(async () => {\n' + src + '\n})()')`.

### O-6 · Le cliché de composants était périmé de deux semaines

`parity/snapshots/figma-components.json` datait du **2026-07-26**. Sa ré-extraction (T015)
a fait tomber **deux** acquittements sans le moindre geste : `figma|behind|Avantage.PiquerayLogo`
et `figma|mismatch|Presentation.Texte (default)` — ils n'étaient pas des divergences réelles
mais des **artefacts d'un cliché ancien**. Ce sont deux des **4** acquittements que T056
devait re-juger : il n'en reste que **2** (`Carte.Bouton`, `SectionHeader.Bouton`).

Le cliché frais compte aussi **58 sets** au lieu de 57 — `Style=Icône seule`, déjà présent
au relevé T004, donc antérieur au lot. Son nom (graphie de *variante* sur un composant
autonome) est un signe de source à vérifier, **hors périmètre** des 10 défauts de 016.
