# Research: Readiness Figma–contrat des sections

## R1 — Étendre l'audit existant

**Decision**: étendre `extract/figma/organism-audit/` avec une couche `readiness/` et réutiliser les
instruments REST, state-photo, visual/page parity et photo parity.

**Rationale**: 013 fournit déjà campagne, référence épinglée, dépendances, verdict et rapport. Les
specs 016/017 prouvent les limites complémentaires : une structure versionnée ne rend pas les
anciens pixels, un compte de hashes ne remplace pas une capture, et deux nœuds de même nom peuvent
être différents. Une orchestration commune garantit les mêmes identités et refus.

**Alternatives considered**: scripts spec-locaux (duplication et règles divergentes); étendre
`parity/` (il compare le contrat courant, pas une intention historique choisie par owner).

## R2 — Modèle de preuve historique

**Decision**: conserver chaque état comme faisceau de preuves typées (`visual`, `structure`,
`contract`, `render`, `page`, `decision`) avec disponibilité, provenance et contradiction; ne jamais
fusionner les absences en un score vert.

**Rationale**: l'API historique Figma peut restituer de la structure, pas fabriquer les pixels d'une
version passée. Les documents 016/017 montrent aussi que capture, structure et image hash prouvent
des faits différents. Un candidat sain exige un faisceau cohérent, pas l'ancienneté seule.

**Alternatives considered**: dernière version avant rupture (ancienneté non probante); score unique
(masque les contradictions); capture seule (ne prouve ni structure ni dépendances).

## R3 — Sélection des candidats

**Decision**: classement déterministe et borné à trois; la machine recommande mais seul le gate
owner valide. À défaut de preuve honnête, `blocked-history`.

**Rationale**: satisfait FR-003/006/007 et garde le dossier examinable en moins de dix minutes. La
décision visuelle entre intentions plausibles n'est pas inférable de façon sûre.

**Alternatives considered**: décision automatique (confond évolution et régression); liste exhaustive
(gate illisible); candidat courant implicite (viole le cœur de la feature).

## R4 — Identités et chronologie

**Decision**: identifier composants par contract id + file key + node id/version; usages par chemin
positionnel et node id. Les noms restent des libellés, jamais des clés.

**Rationale**: la constitution VIII impose le scan par position. Les reçus 017 démontrent que nom et
taille identiques peuvent désigner des états opposés. Les ids de version et hashes rendent les pins
auditables.

**Alternatives considered**: nom de calque (ambigu); ordre seul sans hôte (instable); date seule
(insuffisante pour retrouver une version).

## R5 — Cause composée et impact

**Decision**: construire un graphe biparti dépendance↔consommateurs depuis les contrats et compléter
par les usages Figma observés. Une dépendance n'est déclarée fautive que si son cas isolé ou plusieurs
consommateurs concordent; sinon la cause reste locale.

**Rationale**: empêche une correction opportuniste d'une dépendance partagée et permet de rendre
obligatoire la revalidation de chaque consommateur. Les pins de 019 deviennent des nœuds protégés.

**Alternatives considered**: réparer au premier symptôme (risque transversal); graphe contractuel
seul (omet les usages canvas non gouvernés); graphe canvas seul (omet les consommateurs générés).

## R6 — Frontière de réparation

**Decision**: autoriser dans 020 seulement les gestes locaux, réversibles, sans schéma/moteur ou
dépendance partagée; tout le reste devient une sous-spec nommée.

**Rationale**: la valeur de 020 est la décision complète sur onze sections, pas l'absorption de onze
chantiers. Une affectation explicite maintient SC-006/007 même lorsqu'une réparation est différée.

**Alternatives considered**: audit strictement read-only (interdit les petites corrections prévues
par FR-017); tout réparer (périmètre non borné et gates owner multiples).

## R7 — Contrats et stockage

**Decision**: trois schémas JSON spec-locaux versionnés : dossier, décision owner, consolidation.
Les PNG et dumps sont référencés par chemin/hash plutôt qu'imbriqués. Les formats démarrent à 1.0.0.

**Rationale**: validation automatisable, diffs lisibles et séparation claire entre données de
gouvernance et contrats composants SSoT.

**Alternatives considered**: Markdown seul (gates difficiles à automatiser); base externe
(reproductibilité et revue Git perdues); ajout au schéma composant (mauvais domaine).

## R8 — Documentation et outillage

**Decision**: appliquer les décisions de `docs/handoff/`, `docs/FIGMA-CAPABILITY-MATRIX.md` et
`docs/STYLE-FIDELITY.md`, consultés directement dans le worktree faute de MCP auggie disponible.

**Rationale**: respecte docs-first sur le fond et évite de redériver FIXED/HUG/FILL, les limites de
fidélité et la discipline de preuves. L'écart porte seulement sur le canal d'accès.

**Alternatives considered**: suspendre le plan (aucune ambiguïté documentaire); inférer depuis le
code seul (violation docs-first).

## R9 — Gates mesurables et routage total

**Decision**: exécuter un gate de propreté master + usages avant toute normalisation, recevoir les
onze premiers gates owner avec temps actif séparé de l’exploration, classer la significativité selon
des dimensions observables et appliquer une matrice exhaustive verdict/destination. Le taux du gate
final conserve numérateur/dénominateur et vaut `not-applicable` lorsqu’aucune réparation n’est présentée.

**Rationale**: rend exécutables les principes Source Cleanliness et Claims Rule, empêche les tests
d’inventer une politique de routage, et transforme SC-003/SC-008 en critères auditables jusque dans
les cas d’échec ou d’ensemble vide.

**Alternatives considered**: audit implicite dans l’historique (ordre non prouvable); matrice déduite
par les tests (politique cachée); taux vide égal à 100 % (succès trompeur); durée totale incluant la
recherche demandée par l’owner (ne mesure pas la lisibilité du packet).
