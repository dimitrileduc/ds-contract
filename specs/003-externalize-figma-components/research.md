# Research — Externalisation des maquettes Piqueray (spec 003)

**Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Toutes les inconnues du Technical Context et les 3 décisions différées par la spec sont
tranchées ici. Format : Décision / Rationale / Alternatives. Les receipts de session
(mesures du 2026-07-23) sont cités là où ils portent la décision.

---

## R1 — Lecture du canevas live (mécanisme laissé ouvert par la spec)

**Décision** : pont desktop **figma-console** (`figma_execute`), avec
`figma.loadAllPagesAsync()` puis opérations sur la page `Pages` (`210:325`) du fichier
`Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`).

**Rationale** : c'est la **seule route qui voit les 9 maquettes**. Receipt session
2026-07-23 : les outils MCP serveur / vues REST ne voient QUE la page `Assets` — la page
`Pages` est locale, non synchronisée côté serveur. L'inventaire lui-même
(`COMPONENT-INVENTORY.md`) a été mesuré par cette route.

**Alternatives considérées** :
- *REST / MCP serveur* — rejeté : aveugle à la page `Pages` (receipt ci-dessus).
- *Plugin Sync Runner du repo* — rejeté pour cette spec : conçu comme exécuteur des
  scripts générés du pipeline contrats ; le pont couvre déjà l'exécution arbitraire +
  logs console sans rien modifier au plugin.

## R2 — Instrument de preuve zéro-pixel (nouvel outillage, le cœur du risque)

**Décision** : nouvel instrument **`extract/figma/page-parity/`** :

- **Capture** : `exportAsync` PNG **@1x** de chacune des 9 frames maquettes (le node
  frame, clippé à ses bounds = la vérité visuelle), + **manifeste** par capture
  (maquette, nodeId, dimensions, sha256, scale, horodatage, transport utilisé).
- **Comparaison** : Node déterministe, `pixelmatch { threshold: 0.1, détecteur
  anti-aliasing actif }` — exactement la sémantique clarifiée en spec : le compte de
  pixels différents **hors bruit AA doit être 0**.
- **Dimensions strictes, aucune normalisation** : before/after doivent avoir des
  dimensions identiques, sinon verdict `dimension-mismatch` (un resize de frame est un
  écart réel). On réutilise `readPng` / `writeTriptych` de
  `extract/figma/visual-parity/img.ts`, mais **PAS `alignPair`** : son recadrage
  content-box + centrage existe pour comparer deux renderers différents (code ↔ Figma) ;
  ici les deux côtés sortent du même renderer dans le même repère — normaliser
  masquerait des décalages réels.
- **Verdict par maquette** : `identical | diff | capture-failed | dimension-mismatch` ;
  pour un écart, crop-triptyque du `diffBox` (avant | après | diff) — pas le triptyque
  pleine page (une maquette fait 1728×~8000 px).

**Rationale** : le gate visuel existant (`extract:figma:visual`) est **REST + code ↔
master** — il ne voit pas la page `Pages` et ne prouve rien sur les 9 maquettes (receipt
session 2026-07-23). La configuration pixelmatch retenue est celle déjà éprouvée dans
`img.ts` (threshold 0.1, détecteur AA = classifieur par pixel, pas un fudge factor).

**Alternatives considérées** :
- *Étendre `visual-parity/run.ts`* — rejeté : pipeline REST, baselines par version de
  fichier, normalisation content-box — trois propriétés inadaptées à la preuve de page.
- *Hash seul (sha256 des PNG)* — rejeté comme verdict : détecte mais ne **chiffre** pas
  l'écart, ne le localise pas, et ne neutralise pas le bruit AA. Conservé au manifeste
  comme receipt d'intégrité des octets.

## R3 — Transport des octets (du sandbox plugin au disque)

**Décision** : **sonde en T0**, ordre de préférence :

1. **(a) Outil MCP de capture nodale** (`figma_capture_screenshot` /
   `figma_take_screenshot`) — SI la sonde prouve : export au niveau node (pas viewport),
   échelle déterministe @1x, écriture fichier pleine résolution. Le zoom viewport n'est
   pas acceptable.
2. **(b) `exportAsync` + transfert base64 par tranches** via une variable globale
   persistée entre appels `figma_execute` (export une fois, retour en tranches ~1 Mo).
   Dépend de la persistance du contexte console entre appels — probable, non garanti →
   sondé explicitement, jamais supposé en silence.
3. **(c) `exportAsync` par bandes** via `SliceNode`s temporaires (bandes 1728×2000
   posées au-dessus des bounds de la frame, exportées, retirées). Seule option mutante —
   les slices ne rendent pas dans les exports des autres nodes et sont posées/retirées
   hors du contenu des maquettes ; couverte par checkpoint comme toute opération.

**Invariant quel que soit le transport** : l'octet comparé est une sortie de rendu Figma
@1x ; sha256 au manifeste ; verdict rendu par le comparateur Node uniquement.

**Étalonnage T0 obligatoire (bruit propre)** : **double capture sans aucune opération**
entre les deux → doit donner `identical` sur 9/9. Si le bruit propre n'est pas 0,
**STOP** : le modèle de seuil est faux, retour owner avant toute opération.

**Rationale** : une maquette 1728×~8000 px @1x fait plusieurs Mo → dépasse la taille
d'un résultat d'outil unique ; il faut un chemin par morceaux, choisi sur preuve (sonde)
et non sur hypothèse (honnêteté, principe V).

## R4 — Fraîcheur des captures (la leçon du cache)

**Décision** : **jamais de cache inter-versions**. Chaque preuve = capture fraîche
before ET after, dans la même session que l'opération. Le manifeste porte horodatage +
identifiant de version quand disponible.

**Rationale** : le harnais visuel existant cache par version de fichier ; un `--refresh`
oublié après un edit Figma = preuve périmée (leçon de session, spec 001). L'instrument
de preuve de page ne doit pas pouvoir reproduire ce piège : pas de baseline persistante,
pas de flag à oublier.

## R5 — Points de restauration & retour arrière (FR-017)

**Décision** :
- **Checkpoint** : `figma.saveVersionHistoryAsync("003/<increment>/<étape>")` via le
  pont, **avant chaque opération mutante** — nommage systématique, listé dans
  l'historique natif du fichier.
- **Retour arrière** : restauration **manuelle** via l'historique de versions natif
  (UI Figma), guidée par le quickstart. **Aucune API de restore programmatique
  n'existe** (vérifié en session 2026-07-23) — le rollback est un geste humain guidé,
  pas un bouton script ; c'est nommé, pas caché.
- **Vérification post-restore** : la même preuve pixel (capture fraîche vs les captures
  `before` de l'opération annulée) — c'est le scénario d'acceptation US5.2.

**Alternatives considérées** : snapshot programmatique par clonage des 9 frames dans une
page de sauvegarde — rejeté : double le poids du fichier client, pollue le document, et
l'historique natif fait déjà le travail.

## R6 — Scan d'inventaire par position (FR-002, FR-006)

**Décision** : script bridge `scan.js` (read-only) : parcours des 9 frames de `Pages`,
classification des blocs par **géométrie + signature structurelle** (bounds absolus,
composition des enfants) — **jamais par nom** (les noms sont rapportés à titre
documentaire) ; instances résolues par `getMainComponentAsync()` ; sortie JSON versionnée
`specs/003-externalize-figma-components/inventory/scan-<date>.json`. Re-mesure
obligatoire avant chaque extraction ; **le dernier scan fait foi**.

`COMPONENT-INVENTORY.md` (aujourd'hui présent uniquement sur le checkout principal, non
commité) est **commité sur cette branche en T0** comme baseline lisible, et tenu à jour
depuis les scans (divergence = mise à jour + note, jamais silencieuse).

**Rationale** : les noms mentent — `item` ×71 recouvre 3 molécules distinctes (receipt
inventaire) ; le scan par position est la règle projet (source-cleanliness, la leçon du
Button).

## R7 — Décision différée #1 : une spec programme vs une spec par niveau

**Décision** : **UNE spec de programme** (celle-ci), exécutée en 5 phases d'exécution :
**T0** (harnais + fondations repo) → **T** (tokens) → **A** (atomes) → **M** (molécules)
→ **S** (sections) → clôture.

**Rationale** : le harnais de preuve, le journal de décisions et l'inventaire sont
partagés par tous les niveaux ; le graphe de dépendances est un seul programme connexe
(une section attend ses molécules qui attendent leurs atomes) ; 4 specs = 4× l'overhead
spec-kit sans changer ni les livrables ni les tests d'acceptation.

**Alternative rejetée** : une spec par niveau — frontières artificielles au milieu de
chaînes de dépendances (Field attend Input ; FAQ attend Tabs + Accordion), harnais et
journal dupliqués ou partagés hors-spec.

## R8 — Décision différée #2 : granularité des incréments

**Décision** :
- **1 bloc = 1 incrément d'adoption** pour tout bloc qui remplace des copies (13
  molécules + 16 sections + gallery-item si localisé).
- **2 lots de CRÉATION** pour les net-new qui ne remplacent aucune copie : lot *atomes
  de formulaire* (Input, Textarea, Select, Checkbox) et lot *icônes* (sociales, étoile).
  À l'intérieur d'un lot, la validation owner reste **bloquante PAR composant**
  (FR-013 inchangé).

**Rationale** : les net-new n'ont pas d'étape d'adoption propre (rien à remplacer) →
les grouper ne coûte aucun risque pixel ; leurs pixels seront prouvés lors des adoptions
de leurs parents (Field, Formulaire, Footer…). Les adoptions, elles, restent unitaires :
un incrément = un checkpoint = une preuve = un rollback possible, ciblé.

## R9 — Décision différée #3 : réorganisation Figma des masters existants

**Décision** : **HORS périmètre**. Les 5 masters existants (Bouton, Header nav,
piqueray_logo, member-picture, icônes — 145 instances) ne bougent pas. Les nouveaux
masters sont rangés sur **3 nouvelles pages de niveau** : `DS · Atomes`,
`DS · Molécules`, `DS · Sections` (noms proposés ; l'owner peut amender — consigné au
journal).

**Rationale** : déplacer les masters existants = zéro valeur pour le livrable de cette
spec ; sur un vrai fichier client, le périmètre minimal gagne. Housekeeping possible
post-034, avec l'owner.

**Limite nommée (honnêteté)** : ces nouvelles pages seront vraisemblablement invisibles
côté serveur, comme `Pages` (constat R1). Sans impact ici — le figma→code est hors
périmètre ; la phase contrats ultérieure passe déjà par le pont.

## R10 — Traitement des odeurs de tokens (FR-005, phase T)

**Décision** : chaque odeur = **proposition owner** (FR-010) puis exécution
**source-side d'abord** quand l'odeur existe côté repo (`tokens/*.tokens.json` → push
par le mécanisme éprouvé en 001), geste variables via le pont quand l'odeur est
purement Figma. Deux règles dures après chaque geste :
1. `npm run parity` au **statu quo** (1 finding déclaré — aucun nouveau) ;
2. preuve pixel **0-diff** sur les 9 maquettes (un rename / re-alias ne change aucun rendu).

Cas nommés (fondation actuelle : 14 variables + 8 styles Montserrat) :
- `space` / `radius` nommés par valeur → **rename pur** (0 pixel par construction) ;
- `imported.orange-12` / `imported.orange-42` mintés → proposition de re-alias vers un
  nom sémantique (0 pixel : même valeur, autre nom) ;
- `color/nav-state` en STRING → **lié au mécanisme du Button, EXCLU du périmètre
  (FR-001)** → proposer le **report**, acceptation owner au journal, sauf décision
  contraire de l'owner.

**Rationale** : principe III (le flux sort de la source, jamais de side-sync) ; le
Button est explicitement hors périmètre ; les renames de variables Figma ne changent
aucun pixel rendu.

## R11 — Relevé des personnalisations (FR-012, ledger)

**Décision** : avant chaque remplacement copie→instance : **diff structurel copie ↔
master par position** via le pont (textes, fills d'image, icônes swappées, visibilités) ;
application comme **overrides d'instance** ; écriture du ledger JSON par incrément
(`specs/003-externalize-figma-components/ledger/<bloc>.json`) — chaque perso :
`{ maquette, position, type, valeur, statut: reportée | non-portable-signalée }`.
Une perso qu'aucune propriété du master ne porte → statut signalé + entrée journal —
l'adoption n'est « faite » que si le ledger est complet ET la preuve pixel passée.

**Rationale** : le pixel-gate attrape la perte **visuelle** ; le ledger attrape la perte
d'**intention** (une perso écrasée par une valeur identique par accident ne se voit pas
au pixel). Convention d'honnêteté : l'omission silencieuse est la classe de bug la plus
grave du projet.

## R12 — Rapport aux evals & claims (principe II)

**Décision** :
- **Aucune claim de capacité** dans README/docs pendant cette spec.
- L'instrument embarque un **selftest à fixtures** (`npm run pages:selftest`,
  exécutable sans Figma) : paire identique → 0 ; paire à 1 px → écart chiffré ; capture
  vide/transparente → refus ; dimensions ≠ → refus. C'est la partie « fixture » de
  fixture→eval→claim.
- **Pas de câblage dans `evals/run.ts`** pour cette spec : la suite ne tourne pas en
  worktree, et la capture exige le canevas live (non-déterministe à évaluer headless).
  Si la capacité « preuve page-parity » est un jour revendiquée en docs → fixture →
  eval → claim, dans cet ordre, d'abord.
- Les limites de l'instrument sont documentées **dans son README**
  (`extract/figma/page-parity/README.md`), pas dans une note ailleurs (principe V).

**Rationale** : respecter la claims rule sans étendre la suite depuis un worktree ni
prétendre évaluer headless une capture qui exige un canevas live.

---

## Statu quo des gates (référence pour la clôture)

Cette spec ne touche ni contrats, ni schéma, ni générateurs, ni `core/`. Les gates
doivent finir **au statu quo mesuré** : evals **94/97** (les 3 rouges sont le bloc
intentionnel connu), parity **1 finding déclaré**, build/typecheck verts. `npm run eval`
ne tourne pas dans un worktree → sweep final sur le checkout principal.
