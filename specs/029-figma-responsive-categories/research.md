# Research — 029 Rendre CategoriesPrincipales responsive dans Figma

Cette recherche borne une campagne Figma-only sur le gabarit de la spec 028.
Elle ne promeut aucun fait dans les contrats `ds.categories-principales` et
`ds.carte-categorie`, ne modifie aucun émetteur et ne qualifie ni le web ni Odoo.

## R1 — Autorité historique réutilisable

**Decision**: reprendre uniquement comme HISTORIQUE les audits 023 du 2026-08-20
(`specs/023-categories-gouvernees/audits/{masters,usages,copies-locales}.md`), les
gates A/B/C de 023 et la réparation visuelle 021. Le baseline attendu — jusqu'à
preuve fraîche contraire — est: set `CategoriesPrincipales` `2115:4277` porteur des
axes redressés `Style {Superpose, Empile} × Colonnes {2, 3}` (4 combinaisons, dont
`Superpose×3` gardée sans usage, décision Gate A 023), carte `Carte/Categorie`
`2063:1611` (2 variantes Style), et 7 usages instances sur la page `Pages` `210:325`:
`2115:4392, 2115:4278, 2115:4438, 2115:4297, 2115:4411, 2115:4324, 2115:4364`
(6 usages 2 colonnes + 1 usage 3 colonnes; 2 superposés + 5 empilés).

**Rationale**: la spec (FR-007, Historical Inputs) impose de traiter ces preuves
comme historique consultable, jamais comme décision. Les node ids de 023 sont
antérieurs au nettoyage §VIII exécuté par 023 elle-même: l'audit frais re-mesure
identités, axes, variantes, usages, textes, médias, variables et overrides, et
toute contradiction retourne à H1.

**Alternatives considered**: reprendre les captures 021/023 comme audit courant;
reprendre les pins 023 comme vérité; rejouer le Gate A comme décision de design 029.

## R2 — Exclusivité de la carte, condition de son périmètre

**Decision**: la carte `Carte/Categorie` n'est mutable QUE si l'audit frais
confirme qu'elle n'a qu'un seul composeur (le set `CategoriesPrincipales`). Le
relevé 023 mesurait `carteHits: 0` sur la page Pages (aucune instance autonome) et
un unique composeur; c'est une entrée historique. Si l'audit frais trouve un second
composeur, la carte sort du périmètre mutable et la décision remonte à l'owner
(FR-002, edge case dédié).

**Rationale**: l'hypothèse d'exclusivité est LA justification du périmètre carte.
Elle se re-prouve par position (§VIII), jamais par nom, sur tout le fichier —
masters, pages de maquettes et page Pages.

**Alternatives considered**: déclarer la carte mutable sur la foi de 023; élargir
aux enfants partagés (Bouton/action, icônes) — exclus par FR-003.

## R3 — Topologie: set existant, adaptation interne d'abord

**Decision**: contrairement à HeroVideo (standalone→component set), le master est
DÉJÀ un component set à 2 axes orthogonaux et 4 variantes. La proposition H2 doit
d'abord démontrer si une adaptation INTERNE (Auto Layout, wrap, Fill/Hug, min/max)
de la grille et de la carte suffit à couvrir mobile/desktop/wide; des états
explicites (nouvel axe ou nouvelles valeurs) ne sont proposés que si cette
démonstration échoue visiblement, et chaque combinaison ajoutée se justifie une par
une (FR-014, FR-015). Aucune variante nommée d'après une largeur. Le rendu desktop
approuvé des 4 combinaisons actuelles est préservé sauf acceptation owner (FR-016).

**Rationale**: 028 a prouvé le mécanisme set+membre pour une transition; 029 teste
le cas complémentaire — mutation à l'intérieur d'un set existant, possiblement à
zéro création. `campaign.ts` porte déjà une branche `existingTopology`
(`expectedCreateCount = existingTopology ? 0 : …`); sa qualification exacte
appartient à la Phase C, fixtures rouges d'abord. C'est un écart structurel au
gabarit 028, à consigner (FR-033).

**Alternatives considered**: forcer un axe `Presentation` par symétrie avec 028
(créerait des combinaisons sans usage, contre FR-015); deux composants séparés
mobile/desktop; variants de largeur.

## R4 — Colonnes: réglage desktop uniquement, énuméré conservé

**Decision**: l'axe `Colonnes {2, 3}` reste un réglage de DESKTOP. En mobile, le
composant retombe à une carte par ligne sans réglage exposé; l'intitulé du choix
rédacteur dit qu'il s'applique au desktop; l'énuméré 2|3 n'est pas remplacé par une
case à cocher (clarification owner 2026-08-26; FR-011, FR-012). La couche Odoo 023
(`SetColonnesAction`, classe `--colonnes-3`) expose déjà ce choix 2|3 et n'est ni
modifiée ni migrée (FR-004) — la forme énumérée s'étend là où un booléen imposerait
une migration.

**Rationale**: clarification enregistrée dans la spec; le mobile à une carte par
ligne est un comportement, pas un axe multiplié.

**Alternatives considered**: axe `Colonnes` multiplié par la présentation; case à
cocher « 3 colonnes »; réglage mobile.

## R5 — Sélection explicite, sans breakpoint automatique

**Decision**: chaque témoin et chaque contrôle sélectionne explicitement sa
combinaison de variantes (paire Style×Colonnes, plus tout état accepté à H2). Le
resize ne démontre que le comportement fluide de l'état actif; aucun breakpoint
automatique Figma Design n'est revendiqué (FR-030), et cette limite reste visible
dans les témoins et la documentation du composant.

**Rationale**: identique à 028 R4 — Figma Design applique Auto Layout, Fill/Hug et
min/max mais ne change ni mode ni variante au redimensionnement
(`docs/responsive-figma.md`). Différence 029: la sélection de scénario porte sur
PLUSIEURS propriétés de variante, pas une seule `Presentation` — extension runner
(voir R10), écart au gabarit à consigner.

**Alternatives considered**: déclarer un breakpoint; variable `viewport`; breakpoints
Figma Sites (autre produit).

## R6 — Choix et preuve des primitives

**Decision**: l'audit frais inventorie les primitives numériques existantes; chaque
gap, padding ou dimension modifiée est ensuite lié DIRECTEMENT à une primitive
existante, enregistré `composition → node/path → propriété → variable id/nom →
valeur résolue` (FR-017, FR-018). Une primitive absente ou incompatible arrête la
proposition devant l'owner; aucune valeur brute, primitive, variable sémantique
responsive ou mode global n'est créé. L'audit after vérifie les `boundVariables`,
pas seulement la valeur résolue.

**Rationale**: identique à 028 R5, prouvé en 028 (6 bindings attachés par membre,
`handoff/primitives-and-typography.md`). La comparaison inter-composants exigée par
FR-018 prépare la campagne transverse.

**Alternatives considered**: valeur brute temporaire; primitive « la plus proche »;
collection responsive dédiée.

## R7 — Grille: ligne orpheline, remplissage et contenus longs

**Decision**: trois comportements de grille sont montrés à l'owner comme décisions
ou cas à valider, jamais résolus silencieusement: (1) la configuration 3 colonnes
aux largeurs intermédiaires — ligne incomplète 2+1 comprise — est une décision
explicite au gate H2 (FR-013, clarification owner); (2) le remplissage quand le
nombre de cartes d'un usage ne correspond pas au réglage de colonnes est montré
comme cas à valider; (3) avec un contenu long, les cartes d'une même ligne restent
cohérentes entre elles, le texte reste entièrement visible et la carte grandit au
lieu de couper. Le style superposé vérifie explicitement la lisibilité du texte sur
la photo en mobile.

**Rationale**: ce sont les edge cases nommés de la spec; le précédent du repo pour
l'égalité de largeur d'enfants répétés (règle prior-art, `ds.avatar-group` /
largeur fixe sur la racine de l'enfant) est un point de départ d'exploration H2,
pas une décision.

**Alternatives considered**: trancher l'orphelin en spécification (refusé par
clarification); masquer/tronquer le contenu long; média inventé pour les cartes
sans image.

## R8 — Mutation non destructive d'un set existant + propagation carte

**Decision**: exiger avant H3 un spike mécanique enregistré prouvant, hors source
autoritative, que la mutation (a) préserve l'identité du set, les node ids/keys de
ses 4 membres, les axes et leurs valeurs, les propriétés, les liens des 7 usages et
leurs overrides; (b) que la mutation du master carte se propage à ses instances
imbriquées dans les variantes du set et dans les usages SANS écriture directe de
ces instances, chaque delta visuel attendu étant déclaré et attribué; (c) qu'un
second passage est strictement no-op. Une reconstruction destructive est interdite
(FR-024); les calques communs aux variantes gardent noms et rôles cohérents (FR-025).

**Rationale**: Figma propage master→instances; c'est le seul canal légitime pour
que les cartes des usages changent. Le verify de la campagne section doit donc
distinguer « delta propagé attendu et attribué » de « écriture d'enfant interdite »
— une capacité à qualifier en Phase C (fixtures rouges d'abord).

**Alternatives considered**: écrire les instances de carte une à une (Page writes ou
child writes interdits); resynchroniser les usages (écriture de Page, interdite);
déclarer la préservation depuis les seuls noms de calques.

## R9 — Forme de campagne: deux runs séquentiels, un seul cycle global de preuve

**Decision**: réutiliser le runner v2 `component:repair` en mode `single-component`
avec DEUX campagnes séquentielles: `specs/component-repairs/carte-categorie/run-001/`
puis `specs/component-repairs/categories-principales/run-001/` (la feuille avant le
composite). Les captures before de TOUTES les surfaces — les deux masters ET les 7
usages — sont prises et vérifiées avant la PREMIÈRE écriture des deux runs (§X,
FR-023), et un seul cycle global de vérification pixel, possédé par l'orchestrateur,
entoure l'ensemble (§XI). Un seul writer, un seul pont; les Pages restent hors zone.

**Rationale**: `campaign.ts` impose `workflow.mode === 'single-component'`; deux
runs respectent le mode existant sans élargir sa sémantique. L'ordre carte→section
fait que le verify de la section observe l'état carte final. C'est le deuxième écart
structurel au gabarit 028 (une campagne, un master) à consigner pour la skill.

**Alternatives considered**: une campagne multi-cibles (élargirait le mode du runner
au-delà du besoin 029); section d'abord (le verify section serait invalidé par la
mutation carte suivante); exclure la carte (contredit la demande owner).

## R10 — Extension bornée du runner dans 029

**Decision**: intégrer à 029 l'évolution générique minimale, chaque capacité
précédée d'une fixture négative et d'un eval enregistré avant tout usage live
(FR-032). Lacunes identifiées vis-à-vis de la capacité 028 livrée:

1. **Topologie set existant** — représenter un set déjà formé, `createdMembers`
   possiblement vide, identités des 4 membres protégées; qualifier la branche
   `existingTopology` (aujourd'hui non couverte par le chemin 028 qui exige
   `createdMembers.length > 0` côté transition).
2. **Sélection multi-axes** — sélectionner un scénario par PAIRE de propriétés de
   variante (Style×Colonnes), pas par une seule valeur `Presentation`.
3. **Cible carte autorisée vs enfants refusés** — la campagne carte écrit son propre
   master; la campagne section continue de refuser tout child write
   (`childWrites=[]`) et classe les deltas propagés attendus comme changements
   attribués, jamais comme écritures.
4. **Surfaces multi-usages** — capturer et comparer 7 usages par position (028 en
   avait un seul), captures vérifiées non vides et correctement dimensionnées.

Refus durables exigés: créations non déclarées, écritures de Page, mutations
d'enfants hors périmètre, second passage non no-op, capacité ad hoc au composant
(aucun id/nom `CategoriesPrincipales` dans le runner).

**Rationale**: même doctrine que 028 R10 — la capacité est petite, directement
nécessaire, générique et réutilisable; la laisser hors feature rendrait H3
infranchissable honnêtement. La liste exacte des lacunes se re-vérifie contre le
code au moment des fixtures (leçon 018: « lu mais non confirmé » a un taux d'erreur
élevé).

**Alternatives considered**: feature outillage séparée; script ad hoc catégories;
application manuelle sans reçu.

## R11 — Frontière contractuelle et état Figma-ahead

**Decision**: qualifier le résultat uniquement comme source Figma en avance non
convergée, `figma-ahead/pending-home-responsive-promotion`, dérive NOMMÉE vis-à-vis
de `ds.categories-principales` v1.0.0 et `ds.carte-categorie` v1.1.0. La clôture
interdit une régénération Figma non coordonnée (`figma:plan`/sync) susceptible
d'écraser les choix locaux. La posture exacte vis-à-vis du différentiel trois-voies
(`npm run parity`) est une décision owner au gate H4, prise sur le rapport de dérive
réel produit après mutation, jamais anticipée (FR-036, clarification owner).

**Rationale**: identique à 028 R11 — tension nommée avec le principe III, acceptable
comme état temporaire, borné, non propagé. Aucune capacité contrat, code, HTML,
Odoo ou breakpoint automatique n'est déclarée validée (SC-014).

**Alternatives considered**: déclarer le canvas source de vérité; modifier les
contrats dans 029; acquitter la parité d'avance dans la spec.

## R12 — Relevé des écarts au gabarit 028

**Decision**: tenir un registre versionné des écarts au gabarit 028
(`specs/029-figma-responsive-categories/handoff/ecarts-028.md`), alimenté AU MOMENT
où chaque écart apparaît, avec sa cause (FR-033, SC-013). Trois écarts structurels
sont déjà connus à la planification et y entrent d'office: set existant vs
transition standalone→set (R3), deux masters/deux runs vs un (R9), sélection
multi-axes vs `Presentation` seule (R5/R10). Le registre est la matière première de
la future skill `component-to-responsive`, qui n'est PAS créée par 029.

**Rationale**: le deuxième composant d'une campagne apprend ce que le premier ne
pouvait pas apprendre (US3); un relevé reconstitué après coup perdrait les causes.

**Alternatives considered**: reconstituer les écarts à la clôture; créer la skill
dans 029 (hors scope).

## Clarifications techniques résolues

- Le nombre de colonnes reste un énuméré desktop `{2, 3}`; le mobile retombe à une
  carte par ligne sans réglage (clarification owner, R4).
- La ligne orpheline 2+1 du 3 colonnes est une décision H2 sur maquettes, pas un
  parti pris de spec (clarification owner, R7).
- L'étendue exacte des changements de la carte (adaptation interne seule ou états
  explicites) est une décision owner H2, sur preuve interne-d'abord (clarification
  owner, R3).
- La posture `npm run parity` en clôture figma-ahead est une décision owner H4 sur
  rapport réel (clarification owner, R11).
- Aucune clarification technique non résolue ne subsiste dans le plan.
