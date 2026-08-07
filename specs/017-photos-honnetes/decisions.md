# Décisions prises PENDANT l'exécution de 017

Ce que le plan ne disait pas, ou disait autrement, et qu'il a fallu trancher en
chemin. Chaque entrée porte le fait, la décision, et ce qu'elle coûte.

---

### O-1 · Le repli « premier paint non réclamé » est NARROWÉ, pas supprimé — et c'est une lecture de T012, pas son application littérale

**Ce que T012 demandait** : « supprimer le repli *premier paint non réclamé*
(`:3849-3850`), qui est exactement ce qui rendait l'interversion invisible ».
Le contrat d'interface le redit : « Le repli **disparaît**. »

**Ce que le relevé a montré** : le supprimer sèchement aurait **perdu la photo du
Hero à chaque régénération**. Le cas est mesuré, pas hypothétique — c'est le
**cas B de l'eval existante `img-paint-preserved-on-amend`** : sur le Hero, la
photo du client est un fill de **RACINE** alors que le contrat modélise un enfant
`Background`. Aucun chemin exact ne les apparie. Un repli supprimé aurait donc
créé exactement la classe de dégât que 017 existe pour empêcher, et fait rougir
une porte verte depuis 2026-07-26.

**La décision** : le repli **arbitraire** disparaît ; ce qui le remplace est une
**bijection d'ordre**.

| Avant | Après |
|---|---|
| nom d'abord, puis *n'importe quel* paint non réclamé | chemin **exact** d'abord, puis **l'ordre du document**, un pour un |
| choix arbitraire ⇒ interversion invisible | ordre préservé ⇒ **interversion structurellement impossible** |
| le déplacement n'est pas distingué | `rehebergees` (mouvement nommé, licite) vs `deplacees` (interversion ⇒ **rouge**) |

Un rehébergement est **déterministe**, **rapporté nommément**, et il ne peut pas
produire d'interversion puisqu'il préserve l'ordre. Un mouvement vers un accueil
dont l'occupant d'origine est ailleurs, lui, est une interversion : il part dans
`deplacees` et rend le rapport rouge.

**Ce que cela coûte, et qu'il faut savoir** : la lettre de T012 n'est pas tenue
au mot près. Le fond l'est — le nom de calque du canvas ne participe plus à
**aucune** comparaison (§VIII), et le choix arbitraire a disparu. Le commentaire
in-situ de `core/emit-figma-script.ts` le dit en toutes lettres, à l'endroit où
la règle s'applique. Si l'owner préfère la suppression sèche, c'est un drapeau et
une ligne — mais le Hero perdra sa photo, et il faut le vouloir.

**Vérifié après coup** : `img-paint-preserved-on-amend` (cas B, le Hero) reste
vert avec la nouvelle règle.

---

### O-2 · Le chantier quitte le worktree, à la demande de l'owner — écart à F1 nommé

**Le fait** : T001 avait créé le worktree `../ds-contract-017` conformément à la
règle F1 (constitution, *Worktree Gates*) et remis le checkout principal sur
`main` — la disposition que 016 avait elle-même établie comme la bonne (commit
`de1ed2c`, décision O-7 de 016). Conséquence immédiate et non anticipée : le
dossier habituel de l'owner affichait `main`, donc un `tasks.md` figé à 0/50
pendant que le travail avançait ailleurs. **C'est exactement le défaut que 016
avait diagnostiqué** — « laisser l'owner devant un dossier mort est un défaut de
méthode, pas un détail » — et il a été refait.

**La demande** : l'owner a demandé que le dossier principal soit sur la branche
de travail.

**La décision** : worktree supprimé (après commit du travail en cours, `9076b19`),
branche `017-photos-honnetes` sortie dans `/Users/dlstudio/.superset/projects/ds-contract`.

**L'écart assumé** : les portes ne tournent plus **en isolation** (F1). Le risque
pratique est faible ici — aucun autre chantier ne tourne sur ce dépôt, et
`evals/.scratch` reste un chemin unique dont l'usage concurrent est déjà
surveillé. Mais c'est un écart à une règle constitutionnelle, il est **nommé
plutôt que tu**, et le rapport de clôture le reprendra.

**Ce qui a été vérifié à la bascule** : `node_modules` présent dans le checkout
principal, cache Playwright résolu au niveau utilisateur
(`~/Library/Caches/ms-playwright`, peuplé), `npx tsc --noEmit` vert, la fixture
et l'instrument promu intacts. Rien n'a été perdu au déménagement.

**Note sur T001** : `npx playwright install chromium` **refuse** dans ce dépôt —
il dépend de `playwright-core`, pas de `@playwright/test`. Ce n'est pas un
manque : l'instrument découvre Chromium dans le cache utilisateur partagé
(`extract/figma/visual-parity/render.ts:456-461`), déjà peuplé. Dit ici plutôt
que compté comme un succès silencieux.

---

### O-3 · Deux prémisses des tâches, corrigées par le relevé de la Phase 1

1. **`npm run build` ne régénère PAS `figma-sync/*.js`.** Le build est
   `tokens → schema → generate-components`. Ce sont `npm run figma:plan` et
   `npm run golden:update` (qui l'appelle) qui écrivent ces scripts. T021 et T037
   s'appuyaient sur l'inverse.
2. **`figma-sync/` porte 34 fichiers orphelins** (16 légendes périmées) laissés
   par les renumérotations successives — le nom est `NN-<nom>.js` où `NN` suit
   l'ordre de dépendance, donc ajouter un contrat décale les suivants. Rien ne
   les réécrit : `figma:plan` en produit **38** (01-tokens + 34 composants + 3
   batchs) sur les 72 présents. Differ les 71 fichiers porteurs de légende
   diluerait la preuve de T037 ; la référence est les **34 légendes vives**, une
   par contrat, archivées en `proofs/depart-legendes.txt`.

---

### O-4 · La sonde `getInstancesAsync` est empêchée — pour une autre raison que celle écrite au dépôt

Détail complet : [`proofs/sonde-getinstances.md`](proofs/sonde-getinstances.md).

En bref : le pont **n'est pas déconnecté** (Figma Desktop tourne, le Desktop
Bridge est ouvert, connexions `ESTABLISHED` sur 9223-9232). C'est le serveur MCP
de cette session qui n'a **pas pu prendre de port** — `EADDRINUSE` sur toute la
plage, dix instances concurrentes. Libérer un port aurait probablement suffi,
mais les processus occupants appartiennent à d'autres sessions vivantes de
l'owner : les tuer n'est pas une décision d'agent, et ce **non-geste** est écrit.

Issue 3 de T005 appliquée : US1 démarre sur le repli nommé. L'émetteur porte
**deux voies**, la frontière entre elles est écrite dans le code, et la voie API
est marquée **non mesurée sur le fichier client**. La sonde reste **due**.
