# Feature Specification: Canvas vrai

**Feature Branch**: `016-canvas-vrai`
**Created**: 2026-08-05
**Status**: Draft
**Input**: User description: "Canvas vrai — rebrancher la surveillance géométrie de la maquette (83 variables Figma), corriger les défauts de source (DW-002, DW-003, backlog 013) dans Figma même, puis régénérer le canvas divergent avec preuve pixel, photos client préservées et vérifiées à leur identité."

## Clarifications

### Session 2026-08-05

- Q: DW-002 — laquelle des trois corrections possibles du débordement de 2 px (cartes à 363,5 · conteneur à 1552 · espacement à 31,33) ? → A: **Cartes à 363,5** — conteneur (1550) et espacements (32) intacts. Raison retenue : c'est déjà ce que le code livré rend (les cartes rétrécissent d'elles-mêmes) ; la source rejoint le rendu réel, aucun changement visible d'aucun côté, la divergence mesurée disparaît.
- Périmètre verrouillé en amont (brief du 2026-08-05) : les trois chantiers dans une seule spec (variables + corrections de source + régénération), et le volet source couvre le registre (DW-002, DW-003) **plus** le backlog 013 complet.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - La maquette redevient surveillée (Priority: P1)

La spec 015 a porté la géométrie des 34 contrats en références de tokens, côté code seulement : les 83 variables correspondantes n'existent pas dans la maquette, et la parité n'est verte qu'avec 89 acquittements « variable manquante ». Concrètement : si un designer bouge une largeur ou un espacement dans Figma aujourd'hui, **rien ne le signale**. En tant qu'owner du système, je veux que chaque valeur de géométrie gouvernée côté code existe aussi comme variable dans la maquette et y soit liée, afin que le différentiel reprenne son travail de surveillance sur l'axe canvas et qu'un changement de design ne passe plus inaperçu.

**Why this priority**: c'est la moitié manquante de 015 — l'angle mort est fermé côté code, ouvert côté maquette. Tant que cette moitié manque, la promesse centrale du produit (« les surfaces ne peuvent pas dériver sans qu'on le voie ») est fausse sur un axe entier. C'est aussi le chantier le plus mécanique : le faire d'abord rebranche la surveillance pour tout le reste de la spec.

**Independent Test**: créer et lier les variables, puis (1) vérifier que la parité est verte sans les acquittements de couverture géométrie, et (2) modifier une valeur de géométrie dans la maquette à titre de sentinelle : le différentiel doit la signaler et la classer. Livrable seul, ce lot a déjà de la valeur.

**Acceptance Scenarios**:

1. **Given** les 83 références de géométrie sans variable dans la maquette, **When** les variables sont créées et liées aux usages correspondants, **Then** la parité trois axes est verte **sans** acquittement « variable manquante » — les 83 acquittements de couverture géométrie tombent (le résiduel hors géométrie reste, voir SC-001).
2. **Given** la surveillance rebranchée, **When** une valeur de géométrie est modifiée dans la maquette (test de sentinelle, annulé ensuite), **Then** le différentiel signale l'écart, le classe et propose un remède — le changement n'est plus invisible.
3. **Given** l'état final, **When** la vérification tourne deux fois de suite sans qu'on touche à rien, **Then** le verdict est identique les deux fois (zéro faux signal).

---

### User Story 2 - La source cesse de porter ses défauts connus (Priority: P2)

Le registre et le backlog de 013 nomment des défauts de la source Figma elle-même — dont DW-002 (les 4 cartes réassurances débordent de 2 px de leur conteneur : la source dessine 1552 dans 1550) et DW-003 (l'en-tête de la FAQ figé à une hauteur fixe). La règle du projet est stricte : un défaut de source se corrige DANS Figma, jamais contourné en code. En tant qu'owner, je veux ces défauts corrigés à la source, afin que les contrats cessent de porter fidèlement des erreurs et que les limites nommées côté code qui n'existaient que pour les tolérer puissent tomber.

**Why this priority**: corriger la source avant de régénérer évite de régénérer deux fois — et une source fausse sous surveillance produit des signalements « légitimes » qui sont en réalité des défauts à réparer.

**Independent Test**: chaque défaut se corrige et se prouve un par un : annonce écrite de l'écart attendu, correction dans Figma, preuve visuelle avant/après conforme à l'annonce, entrée close à son registre avec reçu.

**Acceptance Scenarios**:

1. **Given** le débordement de 2 px (DW-002) et la correction choisie par l'owner, **When** elle est appliquée dans Figma, **Then** la section ne déborde plus d'elle-même et l'écart visuel observé correspond exactement à l'écart annoncé.
2. **Given** l'en-tête FAQ figé (DW-003), **When** il est remis au comportement attendu, **Then** l'usage suit le master et la preuve avant/après est conforme à l'annonce.
3. **Given** un défaut du backlog 013 corrigé, **When** la source est re-relevée, **Then** le relevé confirme la correction, l'entrée est close à son registre avec un reçu re-testable, et le compte imprimé de la porte concernée reflète la clôture.
4. **Given** une limite nommée côté code qui ne servait qu'à tolérer un défaut corrigé, **When** le défaut est clos, **Then** la limite est levée et l'absence de régression est prouvée.

---

### User Story 3 - Le canvas divergent est régénéré sans perte (Priority: P3)

Une fois la source propre et surveillée, le canvas encore divergent des contrats est régénéré. Le fichier est un fichier client vivant : 9 composants portent de vraies photos, et une régénération reconstruit les intérieurs. En tant qu'utilisateur du fichier client, je veux le canvas régénéré conforme aux contrats **sans perdre ni intervertir aucune photo**, afin que la maquette reste livrable au client à tout moment.

**Why this priority**: c'est le lot le plus risqué (mutations larges, photos réelles) — il vient en dernier, après que la surveillance (US1) et la source propre (US2) ont réduit le terrain d'erreur.

**Independent Test**: sur la liste des cibles divergentes, un cycle complet : capture de l'état antérieur de TOUTES les cibles, régénération, preuve avant/après conforme aux écarts annoncés, rapport photos vérifié composant par composant.

**Acceptance Scenarios**:

1. **Given** la liste des cibles à régénérer, **When** le chantier démarre, **Then** l'état antérieur de **toutes** les cibles est capturé et vérifié (non vide, bonnes dimensions) **avant la première écriture** — jamais un sous-ensemble pilote — et un point de restauration nommé est posé.
2. **Given** un composant porteur de photos, **When** il est régénéré, **Then** chacune de ses photos est présente **et identique à l'originale** — l'identité est vérifiée photo par photo, pas seulement la présence — et toute photo non replaçable est rapportée nommément, jamais en silence.
3. **Given** un lot de régénération terminé, **When** l'avant et l'après sont comparés, **Then** seuls les écarts annoncés d'avance apparaissent ; tout écart imprévu annule le lot **en entier**, l'état antérieur est restauré et re-prouvé avant toute reprise.
4. **Given** Field et NavItem (aujourd'hui bloqués par des défauts nommés), **When** la régénération et les corrections sont faites, **Then** les deux redeviennent mesurés sans blocage.

---

### Edge Cases

- Une capture d'état antérieur revient vide ou aux mauvaises dimensions → **aucune écriture ne démarre** ; la capture est corrigée d'abord.
- Deux captures successives diffèrent sans qu'aucun geste n'ait eu lieu (l'instrument bruite) → tout s'arrête avant la première écriture ; le chantier ne commence pas sur un instrument non fiable.
- Un écart imprévu apparaît dans la preuve d'un lot → le lot est annulé **en entier**, la cause identifiée avant toute reprise ; on ne requalifie jamais après coup un écart imprévu en « bruit acceptable ».
- Une photo ne peut pas être replacée à la régénération → rapportée nommément ; le composant n'est **pas** déclaré régénéré tant que le sort de la photo n'est pas réglé.
- Deux photos de même taille sur un même composant → le risque d'interversion silencieuse est réel : l'identité de **chaque** photo est vérifiée, pas leur simple présence.
- Le retour arrière est nécessaire → c'est un geste **manuel** (aucune restauration automatique n'existe côté Figma) ; il est guidé, puis re-prouvé par comparaison avec les captures d'avant.
- La maquette bouge entre deux lots (fichier client vivant) → chaque lot re-relève l'état juste avant d'écrire ; aucun lot ne s'appuie sur un relevé périmé.
- MemberCard → reste bloqué honnêtement (sa photo relève de la frontière image A5) ; sa divergence demeure une limite nommée, pas un échec du chantier.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Chaque référence de géométrie gouvernée côté code (les 83 créées par 015) DOIT exister comme variable dans la maquette et être liée aux usages correspondants.
- **FR-002**: Le différentiel DOIT redevenir capable de signaler un écart de géométrie entre la maquette et les tokens **sans acquittement de couverture** : les acquittements « variable manquante » tombent, et un écart introduit côté maquette est signalé et classé.
- **FR-003**: Les défauts de source du registre (DW-002, DW-003) **et** les 8 défauts du backlog 013 DOIVENT être corrigés dans Figma même — jamais contournés ou absorbés côté code. Un défaut dont le relevé vif montre qu'il ne se reproduit plus, ou que l'owner déclare intentionnel, se clôt **sans geste**, avec un reçu qui dit ce qui a été relevé et quand — jamais par une correction de complaisance.
- **FR-004**: DW-002 DOIT être corrigé par la mise des 4 cartes à 363,5 (décision owner du 2026-08-05, voir Clarifications) — conteneur (1550) et espacements (32) intacts ; l'écart attendu de ce geste est nul côté rendu (la source rejoint ce que le code livré rend déjà) et la divergence mesurée de la section disparaît.
- **FR-005**: Avant la première écriture de chaque lot mutant : l'état antérieur de TOUTES les cibles touchées DOIT être capturé et vérifié (non vide, dimensions attendues), et un point de restauration nommé DOIT être posé.
- **FR-006**: Chaque geste mutant DOIT annoncer d'avance son écart attendu ; la preuve avant/après DOIT être conforme à l'annonce ; un écart imprévu DOIT annuler le lot en entier (retour à l'état antérieur, re-preuve, cause identifiée avant reprise).
- **FR-007**: La régénération DOIT préserver toutes les vraies photos du fichier client à l'identique ; la vérification DOIT porter sur l'**identité** de chaque photo, composant par composant, sur les 9 composants porteurs ; toute photo non replacée DOIT être rapportée nommément.
- **FR-008**: Chaque défaut corrigé DOIT être clos à son registre avec un reçu re-testable ; les comptes imprimés des portes DOIVENT refléter la clôture — jamais une note en prose seule.
- **FR-009**: Les limites nommées côté code qui n'existaient que pour tolérer un défaut de source corrigé DOIVENT être levées, avec preuve d'absence de régression.
- **FR-010**: Field et NavItem DOIVENT redevenir mesurés sans blocage à la clôture.
- **FR-011**: Toute vérification empêchée ou incomplète (capture refusée, pont indisponible, photo non vérifiable) DOIT être dite et consignée — jamais comptée comme un succès silencieux.

### Key Entities

- **La variable de maquette** : la contrepartie côté Figma d'une référence de token de géométrie ; existe, porte la bonne valeur, et est liée aux usages qui la consomment.
- **Le défaut de source** : une erreur de la maquette elle-même, identifiée à un registre (identifiant, diagnostic, correction choisie, reçu, statut de clôture).
- **Le lot de mutation** : l'unité de travail canvas — son annonce d'écart attendu, ses captures avant/après de toutes les cibles, son point de restauration, son verdict (conforme / annulé).
- **Le rapport de photos** : par composant porteur — photos attendues, replacées, non replacées ; et pour chacune, le verdict d'identité (la bonne photo au bon endroit).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Les acquittements de couverture géométrie tombent de ~89 au niveau résiduel d'avant 015 (≈7) : **zéro** acquittement « variable manquante » restant à la clôture.
- **SC-002**: Un écart de géométrie introduit dans la maquette après clôture est signalé par le différentiel (test de sentinelle) — et deux vérifications successives sans geste rendent le même verdict.
- **SC-003**: 100 % des gestes canvas de la spec sont prouvés conformes à leur annonce ; **zéro** écart imprévu accepté sur toute la durée du chantier.
- **SC-004**: **Zéro** photo client perdue et **zéro** photo intervertie sur les 9 composants porteurs — identité vérifiée pour 100 % des photos.
- **SC-005**: 10/10 défauts de source (2 du registre + 8 du backlog 013) clos avec reçus re-testables — corrigés dans Figma, ou clos sans geste sur relevé vif / décision owner consignée (FR-003) ; les comptes imprimés des portes reflètent la clôture.
- **SC-006**: Field et NavItem mesurés sans blocage à la clôture.

## Assumptions

- La liste des cibles à régénérer est celle que le différentiel classe divergentes à l'ouverture du chantier ; laisser une cible volontairement divergente exige une décision owner consignée, jamais un oubli.
- Le niveau résiduel d'acquittements accepté à la clôture est celui d'avant 015 (≈7, aucun ne concernant la géométrie) — la spec ne vise pas « zéro acquittement absolu », elle vise zéro acquittement de couverture géométrie.
- Le déblocage de Field et NavItem est un critère de sortie (c'est ainsi que la feuille de route le porte), pas un bonus.
- Le fichier client reste vivant pendant le chantier : chaque lot re-relève l'état juste avant d'écrire, aucun lot ne s'appuie sur un relevé périmé.
- Le choix de correction DW-002 est tranché (cartes à 363,5 — Clarifications du 2026-08-05) ; il reste re-confirmable tant que la section concernée n'a pas été mutée.
- Le travail canvas exige le fichier ouvert dans l'application de bureau avec le pont branché — il ne tourne ni sans surveillance ni en intégration continue ; les fenêtres de travail se planifient avec l'owner.

## Out of Scope

- **Les images A5** — le chantier 017 ; jusqu'à lui, la frontière image reste une limite nommée des deux côtés, et MemberCard reste bloqué honnêtement.
- **DW-014-002** (l'instrument de parité visuelle rend la mauvaise surface) — spec dédiée, hors canvas.
- **DW-014-003** (rich-text à travers la composition) — hors périmètre.
- **Les 89 littéraux** de trait, peinture et typographie — la population suivante du patron 015, une autre spec.
- **Les 30/69 pointeurs périmés** du dossier d'audit de 013 — chantier séparé sur un fichier appartenant à 013.
- **Tout nouveau code moteur** au-delà du strict besoin du chantier canvas.

## Dependencies

- La clôture de 015 (les 83 références existent et sont gouvernées côté code) — fait.
- Le pont vers l'application Figma de bureau, branché et identifié, pendant chaque fenêtre de mutation.
- La décision owner sur DW-002 — prise (cartes à 363,5, voir Clarifications) ; encore réversible tant que la section n'a pas été mutée.
- L'historique de versions natif du fichier client (points de restauration nommés) disponible.
