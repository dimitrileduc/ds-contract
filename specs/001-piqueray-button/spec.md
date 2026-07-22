# Feature Specification: Reconversion Piqueray — preuve Figma → code sur le Button

**Feature Branch**: `001-piqueray-button`  
**Created**: 2026-07-22  
**Status**: Draft  
**Input**: User description: "Obtenir la design system Piqueray en code, générée depuis sa source Figma, avec la garantie que le code correspond fidèlement au design — via un contrat comme source de vérité et une conversion déterministe. Cette itération prouve la chaîne de bout en bout sur un seul composant : le Button."

## Clarifications

### Session 2026-07-22

- Q: Règle de résolution des cas d'éval propres aux 51 composants démo (re-pointer vs retirer) → A: Hybride, documenté — re-pointer un cas vers Piqueray/Button quand un équivalent existe ; retirer (en le nommant) ceux sans équivalent ; laisser intacts les cas agnostiques au contenu. Le compte de la suite change mais reste vert ; aucune référence démo silencieuse.
- Q: Modèle des tokens Piqueray (miroir plat du Figma vs paliers sémantiques) → A: Paliers sémantiques — les 14 variables Figma sont mappées dans l'architecture à paliers existante (primitives → alias sémantiques) ; le Button se branche sur des alias sémantiques. Les valeurs restent exactement celles du Figma (rien d'inventé) ; seule la couche d'alias sémantiques est structurée par-dessus les variables extraites.
- Q: Portée de l'accessibilité (a11y/semantics) du contrat Button → A: Socle a11y authoré — le contrat porte un socle d'accessibilité (rôle bouton, nom accessible, clavier) en plus de ce qui est extrait du dump, explicitement marqué comme authoré (non extrait du Figma, qui ne l'encode pas). Le Button généré est accessible sur cette base.
- Q: Forme de la trace auditable des approbations humaines (FR-016) → A: Un commit git par étape — sur la branche de feature, un commit par étape approuvée (étape nommée dans le message) ; l'historique git EST la trace auditable, relisible via `git log`. Aucun outillage nouveau.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Le dépôt devient Piqueray : les tokens remplacent la démo (Priority: P1)

L'owner de Piqueray veut que son projet remplace la démo de 51 composants, en place, pour que sa design system devienne la source de vérité du dépôt. La fondation de tokens Piqueray (14 variables + 8 styles de typo) est mise en place **avant** tout composant, car c'est la fondation à laquelle le Button se branchera.

**Why this priority**: Rien ne peut se brancher tant que la fondation n'existe pas (un binding vers un token inexistant fait échouer le build). Retirer la démo et poser les tokens Piqueray est le socle de toute la suite ; c'est aussi le premier livrable visible et démontrable (« le dépôt est désormais le mien »).

**Independent Test**: Après cette étape, un inventaire du dépôt ne montre que des artefacts Piqueray (aucun des 51 composants démo, ni leurs surfaces générées). La fondation de tokens est complète (14 variables : 12 couleurs + NavState + Opacity ; 8 styles Montserrat ; 1 seul mode) et le pipeline de tokens la compile sans erreur — sans qu'aucun composant n'existe encore.

**Acceptance Scenarios**:

1. **Given** le dépôt contient la démo de 51 composants, **When** la reconversion en place retire la démo, **Then** aucun contrat, aucune surface générée, aucune entrée de catalogue ni référence golden propre aux 51 composants démo ne subsiste dans le dépôt.
2. **Given** la fondation Piqueray est définie, **When** le pipeline de tokens s'exécute, **Then** les 14 variables et 8 styles de typo sont présents et compilés en un seul mode (mono-thème), et ce sont les seuls tokens du dépôt.
3. **Given** la fondation Piqueray est en place, **When** l'owner relit l'inventaire des tokens, **Then** il retrouve exactement 12 couleurs + NavState + Opacity + 8 styles typographiques Montserrat, sans token orphelin ni inventé.

---

### User Story 2 - Le Button est généré en code depuis un contrat extrait de Figma (Priority: P1)

L'owner veut que le Button soit **généré** (pas codé à la main) à partir d'un contrat, lui-même dérivé d'une photo (dump) de sa source Figma. Le contrat est relu et validé, puis génère le code du Button (composant + story), branché uniquement sur la fondation de tokens Piqueray.

**Why this priority**: C'est le cœur de la promesse « Figma → code » : obtenir le composant sans le coder à la main, avec le contrat au milieu comme source de vérité. Sans lui, il n'y a pas de composant à prouver.

**Independent Test**: À partir de la fondation de tokens, le contrat Button (relu et validé par l'owner) génère un composant et une story qui se construisent (build vert), en ne se branchant qu'à des tokens Piqueray existants, et le contrat porte le fileKey Figma + les anchors + l'horodatage du dump.

**Acceptance Scenarios**:

1. **Given** une photo (dump) de la source Figma Piqueray, **When** le Button en est extrait, **Then** un contrat Button existe, capturant les 6 variantes (Default, Orange, Blanc, Outline blanc, Link, Outline noir), et enregistrant le fileKey Figma, les anchors de nœuds et l'horodatage du dump.
2. **Given** un contrat Button relu et validé par l'owner, **When** la génération s'exécute, **Then** le code du Button (composant + story) est produit, sans édition manuelle de la sortie générée.
3. **Given** le contrat Button se branche sur les tokens Piqueray, **When** la génération s'exécute, **Then** tous les bindings pointent vers des tokens existants de la fondation et le build est vert.
4. **Given** un binding du contrat pointe vers un token absent de la fondation, **When** le build s'exécute, **Then** le build échoue explicitement en nommant le token manquant (tokens d'abord).

---

### User Story 3 - Les gates prouvent que le Button en code correspond au Figma (Priority: P1)

L'owner veut la confiance sans vérifier à l'œil : l'arsenal complet du dépôt (déterminisme, parity, comparaison visuelle) doit passer au vert sur le Button, et tout écart (drift) entre le contrat et le Figma doit être listé en clair.

**Why this priority**: C'est la valeur différenciante — non pas « Figma → code » one-shot vérifié à l'œil, mais **prouvé**. Sans les gates au vert, le composant existe mais la fidélité n'est pas démontrée.

**Independent Test**: En lançant l'arsenal sur le Button, les quatre vérifications passent : (a) deux générations octet-identiques, (b) code fidèle au contrat, (c) contrat fidèle au Button Figma (drift éventuel listé en clair), (d) rendu du code visuellement conforme au Button Figma.

**Acceptance Scenarios**:

1. **Given** le contrat Button, **When** la génération est exécutée deux fois, **Then** les deux sorties sont octet-identiques (aucune IA dans la conversion).
2. **Given** le code généré et son contrat, **When** le différentiel code↔contrat s'exécute, **Then** il est propre (le code est fidèle au contrat).
3. **Given** le contrat et le dump du Button Figma, **When** le différentiel contrat↔Figma s'exécute, **Then** soit ils concordent, soit tout écart est listé en langage clair (jamais omis en silence).
4. **Given** le rendu du code et le Button Figma, **When** la comparaison visuelle s'exécute, **Then** le rendu est conforme au Button Figma dans la tolérance de la comparaison visuelle du dépôt (aucune différence visuelle inexpliquée).

---

### User Story 4 - Validation humaine à chaque étape (Priority: P2)

L'owner veut valider chaque étape avant la suivante, afin de garder le contrôle sur la reconversion (retrait de la démo → tokens → contrat → génération → gates).

**Why this priority**: La reconversion est irréversible en place (pas de fallback conservé). Un point de contrôle humain entre chaque étape protège l'owner d'aller trop loin sans avoir validé l'étape précédente. C'est un besoin de contrôle du processus, secondaire à la production du résultat mais important pour la confiance.

**Independent Test**: Le processus s'arrête après chaque étape et ne démarre la suivante qu'après une approbation humaine explicite ; il existe une trace auditable des approbations, étape par étape.

**Acceptance Scenarios**:

1. **Given** une étape vient de se terminer, **When** l'owner n'a pas encore validé, **Then** l'étape suivante ne démarre pas.
2. **Given** l'owner rejette la sortie d'une étape, **When** il demande une reprise, **Then** le processus reste à cette étape jusqu'à re-validation, sans avancer.
3. **Given** la reconversion complète, **When** on relit l'historique, **Then** chaque étape porte une approbation humaine explicite avant l'étape suivante.

---

### User Story 5 - Voir le Button dans le dashboard et Storybook (Priority: P3)

L'owner veut voir son Button généré dans le dashboard (Contract Hub) et dans Storybook, pour le regarder et le partager.

**Why this priority**: Confort et lisibilité du résultat plutôt que preuve de fidélité ; utile pour l'owner mais non bloquant pour la garantie « code fidèle au design ».

**Independent Test**: Une fois le Button généré, l'owner l'ouvre dans le dashboard et dans Storybook et y voit ses 6 variantes.

**Acceptance Scenarios**:

1. **Given** le Button généré, **When** l'owner ouvre le dashboard, **Then** le Button Piqueray y apparaît (et aucun des 51 composants démo).
2. **Given** le Button généré, **When** l'owner ouvre Storybook, **Then** la story du Button s'affiche avec ses 6 variantes.

---

### Edge Cases

- **Binding vers un token inexistant** : le build échoue explicitement en nommant le token manquant — le Button n'est pas générable tant que ses tokens n'existent pas (tokens d'abord).
- **Le Figma a changé après le dump** : le lien est une photo à l'instant T ; l'écart est détecté contre le dump enregistré et listé en clair. Il n'est **pas** re-synchronisé automatiquement (le sync retour contrat→Figma est hors périmètre).
- **Deux générations non octet-identiques** : la gate de déterminisme échoue ; le Button n'est pas considéré comme « fait ».
- **Rendu visuel différent du Button Figma** : la comparaison visuelle signale la différence ; elle doit être expliquée et résolue en amont (contrat/tokens) avant le vert.
- **Rejet humain à une gate** : le processus s'arrête à cette étape ; l'étape suivante ne démarre pas tant qu'il n'y a pas re-validation.
- **Cas d'éval propres aux 51 composants démo** : au retrait des 51, aucune référence démo ne doit subsister silencieusement ; la suite d'évals (qui teste le moteur) est mise à jour pour ne refléter que le moteur et le contenu Piqueray, et reste verte.
- **Édition manuelle de la sortie générée pour « corriger » un écart visuel** : c'est du drift ; le différentiel le signale ; le remède est en amont (contrat ou tokens), jamais dans les fichiers générés.

## Requirements *(mandatory)*

### Functional Requirements

**Reconversion en place**

- **FR-001**: Le dépôt MUST ne contenir que la design system Piqueray à l'issue de l'itération — les 51 contrats de démonstration et toutes leurs surfaces générées, entrées de catalogue et références golden propres MUST être retirés, en place (pas de dépôt séparé, pas de fallback conservé).
- **FR-002**: La suite d'évals du moteur MUST rester présente dans le dépôt et MUST rester verte ; elle valide le **moteur** et n'est **pas** le mécanisme qui prouve la fidélité du Button au Figma (celle-ci est prouvée par les gates déterminisme, parity et comparaison visuelle). Aucune référence propre aux 51 composants démo ne MUST subsister silencieusement. La résolution des cas d'éval propres aux 51 démo MUST suivre une règle hybride documentée : un cas MUST être re-pointé vers le contenu Piqueray/Button lorsqu'un équivalent existe ; MUST être retiré (et nommé explicitement) lorsqu'aucun équivalent n'existe ; les cas agnostiques au contenu MUST rester intacts. Le nombre total de checks PEUT changer en conséquence.

**Fondation de tokens (tokens d'abord)**

- **FR-003**: La fondation de tokens Piqueray MUST exister comme les tokens du dépôt **avant** qu'un composant ne s'y branche : 14 variables (12 couleurs + NavState + Opacity) et 8 styles de typographie Montserrat, en un seul mode (mono-thème). Ces variables MUST être modélisées selon l'architecture à paliers existante du dépôt (primitives → alias sémantiques) : les valeurs extraites du Figma sont préservées telles quelles (aucune valeur inventée) et une couche d'**alias sémantiques** est structurée par-dessus, à laquelle les composants se branchent.
- **FR-004**: Un binding vers un token inexistant MUST faire échouer le build en nommant le token manquant — le Button MUST ne pas être générable tant que ses tokens n'existent pas.
- **FR-005**: Le code généré du Button MUST ne se brancher qu'à des tokens de la fondation Piqueray — via ses **alias sémantiques** (aucun token inventé, aucun token orphelin).

**Contrat Button comme source de vérité**

- **FR-006**: Le Button MUST exister comme un contrat versionné, source de vérité unique de son code comme de sa représentation design.
- **FR-007**: Le contrat Button MUST être dérivé d'une photo (dump) à l'instant T de la source Figma Piqueray, et MUST enregistrer le fileKey Figma, les anchors de nœuds et l'horodatage du dump (photo, pas de synchro live).
- **FR-008**: Le contrat Button MUST capturer les 6 variantes du component set Figma : Default, Orange, Blanc, Outline blanc, Link, Outline noir.
- **FR-009**: Le contrat Button MUST être relu et validé par un humain avant d'être utilisé pour générer du code.

**Génération**

- **FR-010**: À partir du contrat Button, le système MUST générer les artefacts de code du Button (un composant + une story), sans édition manuelle de la sortie générée.
- **FR-011**: La conversion contrat→surface MUST être déterministe : deux générations depuis le même contrat MUST produire une sortie octet-identique, sans aucune IA dans le chemin de conversion.

**Gates de fidélité**

- **FR-012**: Les gates MUST prouver que le code est fidèle au contrat (différentiel code↔contrat propre).
- **FR-013**: Les gates MUST prouver que le contrat est fidèle au Button Figma ; tout écart (drift) MUST être listé en langage clair et jamais omis en silence.
- **FR-014**: Les gates MUST prouver que le rendu du code est visuellement conforme au Button Figma, dans la tolérance de la comparaison visuelle du dépôt.

**Restitution & contrôle**

- **FR-015**: Le Button MUST être visible dans le dashboard (Contract Hub) et dans Storybook, avec ses 6 variantes.
- **FR-016**: La reconversion MUST se dérouler comme une séquence d'étapes, chacune validée explicitement par un humain avant que la suivante ne commence, avec une trace auditable des approbations. Cette trace MUST prendre la forme d'**un commit git par étape approuvée** sur la branche de feature (l'étape nommée dans le message de commit) ; l'historique git constitue la trace auditable, relisible via `git log`.

**Accessibilité (socle authoré)**

- **FR-017**: Le contrat Button MUST porter un socle d'accessibilité **authoré** (rôle bouton, nom accessible, comportement clavier) en plus de ce qui est extrait du dump Figma. Ces champs a11y/semantics MUST être explicitement marqués comme authorés (et non extraits du Figma, qui ne les encode pas), afin de préserver la convention d'honnêteté (aucune valeur inventée en silence). Concrètement, le **nom accessible** provient du binding TEXT (`children`/label) et le **comportement clavier** de la sémantique native `element:"button"` ; le socle PEUT aussi durcir l'accessibilité (focus visible, aire de clic ≥ 44 px, contraste AA), ces valeurs étant elles aussi **authorées et marquées** (non extraites). Le Button généré MUST être accessible sur cette base, et cette accessibilité MUST être **vérifiée par une éval** (rôle + nom accessible sur la sortie générée).

### Key Entities *(include if feature involves data)*

- **Fondation de tokens Piqueray** : l'ensemble des tokens du dépôt — 14 variables (12 couleurs + NavState + Opacity) et 8 styles de typographie Montserrat, en un seul mode, modélisés selon l'architecture à paliers du dépôt (primitives → alias sémantiques). La fondation à laquelle tout composant se branche (via les alias sémantiques).
- **Contrat Button** : la source de vérité versionnée du Button. Capture les 6 variantes, se branche aux tokens Piqueray (via alias sémantiques), porte un **socle d'accessibilité authoré** (rôle, nom accessible, clavier — marqué comme non extrait du Figma), et enregistre le lien Figma (fileKey + anchors) ainsi que l'horodatage du dump.
- **Dump Figma** : la photo à l'instant T de la source Figma Piqueray, de laquelle le contrat Button est dérivé. Non synchronisée en continu.
- **Surfaces générées du Button** : les artefacts de code produits depuis le contrat (composant + story) ; jamais édités à la main.
- **Rapport de fidélité (résultat des gates)** : le verdict vert/rouge + la liste de drift issue de l'arsenal (déterminisme octet-identique, parity code↔contrat, écart contrat↔Figma listé en clair, conformité visuelle).
- **Journal des étapes de reconversion** : la trace auditable des approbations humaines, étape par étape (retrait de la démo → tokens → contrat → génération → gates), matérialisée par l'historique git (un commit par étape approuvée, l'étape nommée dans le message).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Le dépôt ne contient plus aucun des 51 composants démo — un inventaire complet ne montre que des artefacts Piqueray (tokens + Button).
- **SC-002**: La fondation Piqueray est complète et exacte : les 14 variables et 8 styles de typographie sont présents, en un seul mode, et sont les seuls tokens auxquels le Button se branche.
- **SC-003**: Le contrat Button est relu et approuvé par l'owner, et produit un composant et une story.
- **SC-004**: L'arsenal complet passe au vert sur le Button, sur les quatre vérifications : (a) deux générations octet-identiques, (b) code fidèle au contrat, (c) contrat fidèle au Button Figma avec tout écart listé en langage clair, (d) rendu du code visuellement conforme au Button Figma.
- **SC-005**: Chaque étape de la reconversion a été approuvée par un humain avant le démarrage de la suivante — une séquence d'approbations auditable existe.
- **SC-006**: L'owner peut voir le Button et ses 6 variantes dans le dashboard et dans Storybook.
- **SC-007**: Aucun écart (drift) détecté n'est passé sous silence : chaque écart entre contrat, code et Figma est soit résolu, soit listé en langage clair dans le rapport de fidélité.

## Assumptions

- **Disposition de la suite d'évals** : la suite d'évals du moteur (actuellement 146 checks) reste dans le dépôt et **reste verte** ; ses cas propres aux 51 composants démo sont traités selon une **règle hybride documentée** (voir FR-002 et Clarifications) — re-pointés vers Piqueray/Button quand un équivalent existe, retirés (et nommés) sinon, les cas agnostiques au contenu restant intacts — de sorte qu'elle ne teste plus que le moteur et le contenu Piqueray. Le nombre de checks peut donc changer. Elle n'est pas le mécanisme de preuve de fidélité du Button (ce sont les gates déterminisme/parity/visuel).
- **Production du dump** : la photo (dump) de la source Figma Piqueray est capturée depuis le Figma comme première sous-étape de l'extraction du Button ; elle n'est pas fournie séparément.
- **États d'interaction du Button** : le périmètre est celui des 6 variantes telles qu'elles existent dans la source Figma. Les états d'interaction (hover/focus/actif/désactivé) sont capturés uniquement tels que présents dans le dump Figma ; aucun état nouveau n'est inventé dans cette itération. **Exception — accessibilité** : Figma n'encodant pas la sémantique a11y, un socle d'accessibilité (rôle, nom accessible, clavier) est **authoré** explicitement et marqué comme tel (non extrait) — voir FR-017.
- **Tolérance de conformité visuelle** : la conformité visuelle est jugée selon la tolérance de l'instrument de comparaison visuelle déjà présent dans le dépôt ; aucun nouveau seuil n'est défini dans cette itération.
- **Retrait complet des artefacts démo** : « retirer les 51 » inclut leurs contrats **et** toutes leurs sorties dérivées (code généré, stories, entrées de catalogue, références golden propres), afin que seul Piqueray subsiste.
- **Mono-thème** : Piqueray n'a qu'un seul mode dans cette itération ; multi-thème (light/dark) et brands multiples sont explicitement hors périmètre.

### Out of Scope (this iteration)

- Les autres composants Piqueray (au-delà du Button).
- Le sync retour contrat→Figma (la boucle inverse).
- La publication, le multi-thème (light/dark) et les brands multiples.

### Dependencies

- Accès à la source Figma Piqueray (pour produire le dump : fileKey + anchors).
- L'outillage du dépôt existant réutilisé en place : génération, vérification (déterminisme, parity, comparaison visuelle), dashboard et Storybook.
- La fondation de tokens Piqueray doit exister avant l'extraction/génération du Button (contrainte tokens d'abord).
