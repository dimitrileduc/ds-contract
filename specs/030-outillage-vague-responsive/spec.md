# Feature Specification: Outillage de la vague responsive

**Feature Branch**: `030-outillage-vague-responsive`

**Created**: 2026-08-27

**Status**: Draft

**Input**: User description: "Outiller la vague responsive des 12 sections (spec suivante) pour que chaque section coûte ~25 minutes au lieu d'une journée : fix E8, générateur de manifeste de campagne, mode capture allégée, driver enchaînant la chaîne complète du runner, preflight des verrous hérités, générateur de planche owner 7 zones, champ pickerConsequence. Source : la rétro multi-agents de 029 (`specs/029-figma-responsive-categories/RETRO-PROCESS.md`, prérequis P1–P7). Aucune mutation du canvas Figma vif dans cette spec — tout se prouve en fixtures, mocks et relecture des runs 029."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Préparer une section en minutes, pas en heures (Priority: P1)

Un opérateur de vague (agent ou humain) prépare la campagne d'une section : le manifeste est généré depuis l'état réel du composant au lieu d'être écrit à la main (25–30 Ko en 029, la première source d'heures perdues), et les verrous hérités (min/max/largeur figée) sont détectés AVANT toute tentative d'application — en 029, un verrou 744px découvert à l'apply a coûté 33 minutes et un revert manuel.

**Why this priority**: C'est le poste de coût n°1 mesuré par la rétro. Sans lui, la vague à 12 sections reste à ~2–4 h par section.

**Independent Test**: Rejouer la génération sur `categories-principales` (dont le manifeste écrit main de 029 existe comme référence) et vérifier qu'un manifeste généré, validé par la validation de campagne existante, est produit sans édition manuelle sur le cas nominal.

**Acceptance Scenarios**:

1. **Given** un composant set existant avec ses usages inventoriés, **When** l'opérateur lance la génération de manifeste, **Then** un `campaign.json` complet (cibles, topologie avec identités et axes, usages par position, frontières d'écriture) est produit et accepté par la validation existante, et tout champ non déductible de l'état réel est marqué explicitement au lieu d'être inventé.
2. **Given** une surface cible portant un verrou hérité (largeur minimale ou figée), **When** le preflight s'exécute, **Then** le verrou est nommé (nœud, propriété, valeur) dans un rapport AVANT le dry-run, et l'application est refusée tant qu'il n'est ni corrigé ni porté en dérogation déclarée.

---

### User Story 2 - Appliquer une section en une commande, refus compris (Priority: P1)

Un opérateur applique une campagne de bout en bout (audit → preflight → captures → dry-run → application → second passage → vérification → clôture) par UNE invocation qui s'arrête au premier refus en le citant — au lieu des 13 invocations manuelles de 029. Les campagnes d'une même vague partagent un dossier de décisions owner sans que la clôture ne les refuse mutuellement (bug E8 de 029, contourné en déplaçant des fichiers à la main).

**Why this priority**: Sans le driver, 12 sections = 156 invocations manuelles ; sans le fix E8, AUCUNE vague multi-campagnes ne peut se clôturer proprement.

**Independent Test**: Rejouer la clôture des deux campagnes 029 (carte + section, même dossier de décisions) sans déplacement de fichiers ; dérouler la chaîne complète du driver sur le mock du runner.

**Acceptance Scenarios**:

1. **Given** deux campagnes déclarant le même dossier de décisions owner, chacune avec sa décision finale, **When** chacune se clôture, **Then** les décisions des autres cibles sont ignorées (ni erreur ni sélection), les doublons internes et l'absence de décision restent refusés par nom.
2. **Given** une campagne valide, **When** le driver s'exécute, **Then** chaque étape de la chaîne est journalisée avec son verdict, la chaîne s'arrête au premier refus en citant le refus nommé de l'étape, et une reprise n'exécute pas à nouveau les étapes déjà vertes.
3. **Given** une campagne en mode capture allégée, **When** le cycle complet s'exécute, **Then** les faits et structures sont capturés partout, les images seulement sur les surfaces déclarées (avant) et changées (après), aucune image au passage d'idempotence — et les portes existantes (preflight, dry-run, second passage no-op, faits protégés, clôture) rendent exactement les mêmes verdicts qu'en mode complet.

---

### User Story 3 - Donner à l'owner une surface de décision fidèle, générée (Priority: P2)

L'owner reçoit, pour chaque section, une planche de validation au gabarit fixe — en français, à taille réelle, delta seulement — qui dit explicitement « ce que vous verrez » ET « ce que vous n'aurez pas », montre le sélecteur de variantes avant→après, et référence l'archive technique sans l'étaler. Chaque décision de design porte sa conséquence sur le sélecteur en une phrase (`pickerConsequence`) et sa nature (VISUEL, prouvée par témoin ; STRUCTUREL, prouvée par capture du sélecteur) — le malentendu de 029 est né d'un fait structurel invisible dans un rendu.

**Why this priority**: C'est la parade directe à E2 (le coût d'une journée) ; P2 seulement parce que les planches peuvent, au pire, être composées à la main pour une section.

**Independent Test**: Générer la planche de la section 029 (rejouée depuis ses artefacts) et vérifier les 7 zones, les mentions négatives, et le refus d'un fait structurel sans témoin.

**Acceptance Scenarios**:

1. **Given** les décisions et témoins d'une section, **When** la planche est générée, **Then** elle contient les 7 zones (usage, « vous verrez », « vous n'aurez pas », sélecteur avant→après, témoins 1:1 delta-only, décisions une-ligne, pied avec archive référencée), en français, sans miniature redimensionnée.
2. **Given** une décision de design dont un fait accepté est de nature STRUCTURELLE, **When** la validation de la décision s'exécute, **Then** elle est refusée par nom si le fait n'a ni phrase `pickerConsequence` ni témoin de sélecteur associé.

---

### Edge Cases

- Composant sans set de variantes (COMPONENT seul) ou avec axes inattendus : le générateur de manifeste produit un manifeste réduit et NOMME ce qu'il ne sait pas déduire — jamais de valeur inventée (convention d'honnêteté du dépôt).
- Driver interrompu à mi-chaîne (crash, pont Figma tombé) : l'état de campagne persisté permet la reprise ; les étapes déjà vertes ne sont pas rejouées ; aucune étape d'écriture n'est rejouée sans son dry-run.
- Dossier de décisions contenant des fichiers sans cible (H1/H2 historiques) : ignorés comme aujourd'hui ; seuls les doublons internes à la campagne restent des erreurs.
- Surface déclarée mais vide à la capture allégée : refus nommé (la règle §X « capture non vide et bien dimensionnée » ne s'affaiblit pas en mode light).
- Génération de planche sans témoin pour une largeur annoncée : refus nommé, jamais de zone silencieusement vide.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001 (E8)**: La clôture d'une campagne MUST accepter un dossier de décisions partagé entre plusieurs campagnes : une décision finale visant une autre cible est ignorée ; le doublon interne et la décision manquante restent refusés par nom.
- **FR-002**: Le générateur de manifeste MUST produire, depuis l'état réel du composant (relevé existant, sans écriture canvas), un manifeste de campagne accepté par la validation existante : cibles, topologie du set (membres, identités, axes), usages par position, squelette des frontières d'écriture. Tout champ non déductible MUST être marqué explicitement.
- **FR-003**: Le manifeste généré MUST être relu par la validation de campagne existante avant tout usage — la génération ne contourne aucun refus existant.
- **FR-004**: Un mode de capture allégée MUST exister en OPT-IN : faits et structures toujours capturés ; images seulement sur surfaces déclarées (avant) et changées (après) ; aucune image au passage d'idempotence. Le mode par défaut reste inchangé.
- **FR-005**: En mode allégé, les portes existantes (preflight, dry-run, second passage no-op, faits protégés, refus nommés, clôture) MUST rendre les mêmes verdicts qu'en mode complet — l'allègement porte sur le volume de preuve, jamais sur les garanties.
- **FR-006**: Un driver MUST enchaîner la chaîne complète du workflow pour UNE campagne en une invocation : chaque étape journalisée avec verdict, arrêt au premier refus en citant le refus nommé, reprise sans rejouer les étapes vertes.
- **FR-007**: Le preflight MUST détecter les verrous hérités (dimensions minimales/maximales/figées) sur TOUTES les surfaces cibles et les nommer (nœud, propriété, valeur) avant le dry-run ; un verrou non déclaré en dérogation MUST refuser l'application.
- **FR-008**: Un générateur de planche owner MUST produire la surface de décision au gabarit 7 zones (usage pondéré ; « ce que vous verrez » ; « ce que vous n'aurez pas » ; sélecteur avant→après ; témoins 1:1 delta-only ; décisions une-ligne ; pied avec archive référencée), en français, à taille réelle, conforme au principe constitutionnel XII.
- **FR-009**: Chaque décision de design MUST porter un champ `pickerConsequence` (une phrase en langage designer décrivant l'état du sélecteur de variantes après application) et une nature par fait accepté (VISUEL ou STRUCTUREL) ; un fait STRUCTUREL sans témoin de sélecteur MUST être refusé par nom.
- **FR-010**: Chaque capacité de cette spec MUST suivre l'ordre constitutionnel fixture rouge → eval enregistré → capacité ; la preuve adverse (retirer la capacité fait tomber la suite) MUST exister avant toute utilisation.
- **FR-011**: La capacité « créations déclarées dans un set existant » (construite par 029, jamais exercée) MUST être exercée de bout en bout par le driver sur le mock du runner — préparant le pilote live qui appartient à la spec de vague, pas à celle-ci.
- **FR-012**: Aucune sortie générée existante ne MUST changer : surface de re-pin attendue ZÉRO (la dette golden 028 reste inchangée, ni résorbée ni aggravée ici).
- **FR-013**: Le document du workflow de réparation MUST décrire le mode allégé, le driver, les deux générateurs et le champ `pickerConsequence` — les limites documentées là où la capacité est revendiquée.

### Key Entities

- **Manifeste de campagne** : la déclaration complète d'un run (cibles, topologie, usages, frontières, opérations autorisées) — aujourd'hui écrit main, demain généré puis relu.
- **Planche de validation** : la surface de décision owner d'une section — 7 zones, français, delta-only, conséquence sélecteur incluse.
- **Décision de design** : un choix owner enregistré — désormais avec `pickerConsequence` et la nature de chaque fait accepté.
- **Verrou hérité** : une contrainte dimensionnelle portée par une surface cible qui contredirait le comportement responsive voulu — détectée au preflight, jamais découverte à l'application.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Le manifeste d'une section est généré en moins de 2 minutes machine, sans édition manuelle sur le cas nominal — mesuré en rejouant `categories-principales` et comparé au manifeste écrit main de 029.
- **SC-002**: La chaîne complète d'une campagne (audit → clôture, hors décision owner) s'exécute en UNE invocation sur le mock, journal complet, en moins de 25 minutes.
- **SC-003**: Le scénario de clôture 029 rejoué (deux campagnes, un dossier de décisions partagé) se clôture sans déplacement de fichiers.
- **SC-004**: Le volume de preuve produit par une campagne en mode allégé est réduit d'au moins 80 % par rapport au mode complet de 029, à verdicts identiques.
- **SC-005**: La suite d'evals est verte avec les nouveaux cas enregistrés, et chaque nouvelle capacité tombe adversarialement (capacité retirée → suite rouge) ; l'unique rouge préexistant (dette golden 028) reste identique.
- **SC-006**: La planche générée pour la section 029 rejouée contient les 7 zones et les mentions négatives ; un fait structurel sans témoin est refusé par nom.
- **SC-007**: Zéro sortie générée modifiée : le diff des surfaces générées est vide à la clôture de la spec.

## Assumptions

- **Aucune mutation du canvas Figma vif** dans cette spec : tout se prouve en fixtures, sur le mock du runner, et en relecture des artefacts 029 committés. Le pilote live de la chaîne (section 1) appartient à la spec de vague qui suit.
- Le runner reste mono-composant (un manifeste = une campagne) : la vague est une orchestration de N invocations du driver, pas un mode multi-composants du runner.
- Les relevés existants (audits 029, snapshots parité, dumps) suffisent comme entrée du générateur de manifeste — aucune nouvelle route de lecture Figma n'est requise pour prouver la capacité.
- Les décisions de vague D1–D9 (nommage Compact/Mobile, typographie mobile, etc.) ne sont PAS dans cette spec : elles se prennent en ouverture de la spec de vague, sur la fiche prévue par la rétro.
- La numérotation : cette spec prend `030` ; la vague elle-même sera `031-vague-responsive-sections`.
