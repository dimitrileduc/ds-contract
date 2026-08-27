# Registre d'écarts — 030

Discipline reprise de `runner-capability-plan.md` (029) : toute différence nouvellement
observée est **ajoutée immédiatement**, avec sa phase, sa cause datée et sa disposition.
Créé au premier écart, jamais reconstitué après coup.

---

## W1 — la branche « créations déclarées en set existant » refusait tout reçu honnête

- **Phase** : US2 / T014 (répétition FR-011 sur mock).
- **Date** : 2026-08-27.
- **Constat.** Les deux portes d'identité de membre de `apply-receipt.ts` —
  `master-drift` (via `memberIdentityInvalid`) et `responsive-member-identity-drift` —
  appariaient **chaque** membre du manifeste par son `nodeId` épinglé. Pour un membre
  déclaré comme **créé**, ce `nodeId` est `undefined` par construction : Figma attribue
  l'id à la création, ce que `ResponsiveComponentMember.nodeId` dit déjà en étant
  optionnel. Un reçu véridique — le membre existe, voici son id et sa key — était donc
  refusé, et un reçu qui aurait passé aurait dû mentir sur l'identité du nœud créé.
- **Preuve.** Fixture `figma-projection-repair-driver-chain-resume`, exécution du
  2026-08-27 avant correctif :
  `FR-011: a truthful declared create in an existing set was refused — master-drift:responsive-component, responsive-member-identity-drift:responsive-component`
- **Cause.** La capacité a été construite par 029 (`ec311497`) et **jamais exercée** :
  run-002 l'a court-circuitée par gestes bridge manuels (RAPPORT-CLOTURE 029 §4.2). Aucun
  reçu n'est donc jamais passé par ce chemin, et le défaut est resté invisible.
- **Disposition : CORRIGÉ dans 030.** Un membre que le manifeste **épingle** reste apparié
  par son id et sa key. Un membre **déclaré créé** est apparié par sa paire d'axes exacte
  et tenu à une règle plus stricte là où elle est vérifiable : porter un id et une key
  réels, ne jamais réutiliser l'identité d'un membre préservé, et — au premier passage —
  porter un id que le run a effectivement déclaré créer. Pinné par la fixture, qui
  vérifie aussi qu'une création **non déclarée** et une création **manquante** restent
  toutes deux refusées `unexpected-created-node`.
- **Pour la vague.** Cette branche est celle par laquelle **chaque** section passera si
  la décision D1 est « axe Presentation visible par défaut ». Sans cette répétition, le
  défaut sortait en vif sur la section 1, après la pose.

---

## W2 — le manifeste écrit main de 029 protégeait une dépendance de moins que son relevé

- **Phase** : US1 / T011 (preuve SC-001, diff sémantique généré ↔ écrit-main).
- **Date** : 2026-08-27.
- **Constat.** `writeBoundary.protectedDependencyNodeIds` de
  `specs/component-repairs/categories-principales/run-001/campaign.json` liste 7 nœuds.
  Le relevé (`audit.json` → `protectedDependencySets`) en nomme 8 : il manque **`6:122`**,
  le component set `Bouton` qui possède `9:206` (`Style=Link`). Le membre est protégé,
  son set ne l'est pas.
- **Preuve.** Diff `SC-001-manifest-replay.md` §« deux défauts », après correction du
  générateur : l'ensemble généré est un **sur-ensemble strict** de l'écrit-main.
- **Cause.** Saisie manuelle depuis un relevé de 8 entrées. C'est exactement la classe
  d'erreur que le générateur supprime.
- **Disposition : NON corrigé dans 030, et délibérément.** 030 ne touche à aucun
  `campaign.json` de 029 : ces artefacts sont l'**histoire** d'un run clos et accepté par
  l'owner ; les réécrire falsifierait une preuve. L'écart est nommé ici. Le manifeste
  **généré** de la même section, lui, protège les 8. Pour la vague : tous les manifestes
  de 031 sont générés, donc l'écart ne se reproduit pas.
- **Écart accompagnant, sans conséquence.** Le générateur avait d'abord le défaut
  symétrique — il repliait chaque dépendance sur son *set* (`componentSetId ?? componentId`),
  perdant les membres. Corrigé avant clôture : les **deux** adresses sont protégées. Une
  frontière de protection qui rétrécit en silence est le mauvais sens de l'erreur.

---

## W3 — un dump de pont read-only n'épingle aucune version de fichier

- **Phase** : US1 / T005.
- **Date** : 2026-08-27.
- **Constat.** `contracts/cli-commands.md` §1 annonce `--releve <audit.json|dump.json>`.
  Or `specs/029-figma-responsive-categories/proofs/H1-bridge-read-only.json` porte bien un
  `fileKey`, des identités et des usages, mais **aucun `fileVersionId`**. Seul, il ne
  peut donc pas être le relevé d'une campagne.
- **Preuve.** Fixture `figma-projection-repair-manifest-generator` : le dump seul est
  refusé `releve-unreadable` en **nommant** la version manquante ; associé à un document
  qui en épingle une, il produit le même set et les mêmes membres que l'audit.
- **Disposition : LIMITE NOMMÉE, non corrigée.** Inventer un pin serait précisément
  l'invention que le générateur refuse. Le contrat reste tenable — un dump *est* un
  relevé recevable — à condition d'être accompagné. Documenté en T025 là où la capacité
  est revendiquée (FR-013).

---

## W4 — le preflight verrous ne scanne ni les ancêtres hors composant, ni les descendants

- **Phase** : US1 / T010.
- **Date** : 2026-08-27.
- **Constat.** `observeSurfaceLocks` remonte depuis chaque surface master/variant et
  **s'arrête au premier ancêtre qui n'est ni COMPONENT ni COMPONENT_SET**. Un plancher
  posé sur la frame de canevas qui héberge le catalogue DS n'est donc pas rapporté. Les
  descendants ne sont pas non plus scannés par la porte.
- **Cause.** Choix, pas oubli. FR-007 et research R5 portent sur « les surfaces cibles et
  leurs ancêtres porteurs » ; élargir aux meubles de page ferait déroger chaque campagne
  à son propre décor, et un refus fail-closed que personne ne lit ne protège plus rien.
- **Disposition : LIMITE NOMMÉE.** Les verrous de descendants **sont** capturés — dans
  `facts.sizeLocks`, sur toute la sous-arborescence, en preuve — mais ils ne bloquent pas
  le dry-run. La classe « cartes re-fixées par héritage » vue sur la section 029 est donc
  **visible** mais pas **bloquante**. À réévaluer avec la vague : si elle se reproduit,
  l'élargissement se fait avec sa fixture.

---

## W5 — la branche livrée porte le nom du worktree Superset, pas celui du plan

- **Phase** : Setup / T001.
- **Date** : 2026-08-27.
- **Constat.** `plan.md` nomme la branche `030-outillage-vague-responsive` ; le worktree
  Superset actif est sur `just-euphonium`.
- **Disposition : ÉCART DE FORME, assumé.** La règle d'espace de travail Superset
  interdit de créer un worktree frère ; toute la feature est livrée dans le worktree
  actif. Consigné dans `inventory/worktree-pin.json`.
