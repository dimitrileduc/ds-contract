# Research — 027 Rendre HeroVideo responsive

**Date**: 2026-08-25

## R1 — Autorité de départ et gates humains

**Decision**: traiter H1, H2, H3 et H4 comme des états d’exécution versionnés, jamais comme des `NEEDS CLARIFICATION` techniques. Le plan fixe le profil 992/1400, les quatre témoins, les champs, preuves et conditions d’arrêt. H2 enregistre uniquement la direction structurelle choisie par l’owner et une dépendance transverse `pending`; les valeurs de spacing, typographie et enfants seront fournies par une décision séparée avant H3.

**Rationale**: l’owner a fixé Mobile, Desktop et XL comme compositions, conservé 1728 comme XL actuel, retenu 992/1400 et placé Tablet en contrôle secondaire. Les preuves 2026-08-11/23 confirment un master wide propre mais ne remplacent ni une lecture live fraîche ni la future décision transverse de valeurs.

**Alternatives considered**: choisir les valeurs pendant le plan (usurpation de H1/H2) ; laisser le contexte technique indéterminé (confond un gate métier prévu avec un blocage d’architecture).

## R2 — Baseline XL/wide protégé

**Decision**: reprendre `ds.hero-video@1.0.0` comme baseline XL/wide candidate et la réauditer avant H1 : root Fill à référence 1728×720, composition horizontale basse, titre Montserrat Regular 44/48, poster façade, deux voiles, Button imbriqué, master `2151:5552`, key `36011e51b8bc0b221a1ba6f9108709b5bd1c4490`, usage Home `2170:6351` et Container local.

**Rationale**: `contracts/hero-video.contract.json`, `specs/component-repairs/hero-video/run-001/` et `specs/tiny/hero-video-facade.md` prouvent ces faits et un contrôle 1440 sans overflow. Le média actuel de la TinySpec façade supersède les anciens hashes de poster tout en laissant les anciennes preuves structurelles utiles.

**Alternatives considered**: réutiliser les reçus historiques comme capture fraîche ; prendre l’ancien poster de 025 comme autorité ; normaliser d’autres défauts pendant le responsive.

## R3 — Méthode de co-conception responsive

**Decision**: préserver wide et faire porter H2 uniquement sur la structure Mobile/Desktop : présence, ordre, axe, alignements, stratégie de hauteur, relations entre enfants directs et contraintes de placement. Le titre garde le rôle `Titre Hero vidéo` et le Button actuel garde son identité et sa largeur intrinsèque ; H2 ne décide aucune valeur de padding, gap, typographie ou enfant. Le harness local peut faire varier ces valeurs pour éprouver la robustesse de la direction, à condition de les marquer comme previews non autoritatives, absentes de H2 et de Figma source. Une spec transverse ultérieure décidera le spacing, les styles responsive et les atoms à partir des patterns observés sur plusieurs composants. Le témoin Tablet 834 réutilise compact et ne crée aucun quatrième état.

**Rationale**: l’audit live montre que Piqueray dispose d’une échelle statique et de primitives de spacing, mais d’aucune politique responsive transverse ; `Titre2` et `Titre3` sont des niveaux partagés, pas des aliases de viewport. Choisir les valeurs pendant HeroVideo créerait le précédent local que l’approche multi-composants cherche précisément à éviter. Les previews restent utiles pour tester si le même layout supporte une plage plausible, sans transformer leur valeur en décision.

**Sources**: [Figma — The difference between variables and styles](https://help.figma.com/hc/en-us/articles/15871097384471-The-difference-between-variables-and-styles) ; [Figma — Modes for variables](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables) ; [Carbon — Spacing](https://carbondesignsystem.com/elements/spacing/overview/) ; [Carbon — Typography](https://carbondesignsystem.com/elements/typography/code/).

**Alternatives considered**: valider spacing et typographie dans HeroVideo ; toujours Auto Layout ; toujours un component set ; créer un état Tablet ; utiliser le design 1728 comme Desktop à toutes les largeurs ; substituer `Titre3` en compact et `Titre2` en Desktop ; corriger localement la largeur ou le wrapping du Button.

## R4 — Modèle responsive contractuel générique

**Decision**: ajouter au schéma strict un bloc racine `responsive` optionnel, générique et sans effet sur l’API de contenu. Il porte :

- une base `minWidthPx: 0` et une liste de seuils `min-width` uniques, ordonnés et non chevauchants ;
- des ids de composition stables séparés des témoins Design ;
- des overrides bornés par chemin de part, réutilisant les vocabulaires layout, tokens, literals, declared, visibilité et ordre déjà gouvernés ;
- la stratégie de projection Figma (`auto-layout`, `modes` ou `variant`) déduite de la décision H2 ;
- les canaux runtime sans équivalent canvas, dont la hauteur de viewport visible, avec annotation honnête.

Ce bloc n’est jamais converti en prop React, propriété éditoriale Odoo ou enum métier `viewport`.

**Rationale**: le schéma actuel ne connaît que le layout statique et les overrides pilotés par des props publiques. La matrice classe `@media`/`@container` comme absent côté canvas ; une extension additive est donc nécessaire pour que le contrat reste la source commune tout en distinguant sélection runtime automatique et présentation Figma explicite.

**Alternatives considered**: `layoutByProp` piloté par `viewport` (fausse responsabilité consommateur) ; CSS HeroVideo dans React/Odoo (deuxième vérité) ; détourner `modes` de thème ; deux contrats Desktop/Mobile.

## R5 — Compilation par surface

**Decision**: compiler les mêmes états contractuels par un lowering partagé en règles de largeur automatiques pour HTML, CSS Modules React, référence inline, Web Components et CSS Odoo dérivée. Figma dessine explicitement les compositions approuvées et indique que le resize ne change ni mode ni variant automatiquement. `emit-react-inline` doit sortir les canaux responsive des objets inline et les transporter dans un bloc de style déterministe et scoppé, ou refuser explicitement le contrat.

**Rationale**: les visiteurs ne doivent fournir aucun état de viewport, alors que Figma Design n’a pas de media query. Couvrir aussi le renderer inline empêche une sortie générée apparemment correcte mais fausse dans les fixtures et outils internes.

**Alternatives considered**: JavaScript `resize`/`matchMedia` ; réglage manuel dans Odoo ; exclure silencieusement le renderer inline ; prétendre que les variants Figma basculent au resize.

## R6 — Profil de breakpoints et faible hauteur

**Decision**: employer Mobile/compact `<992`, Desktop `992–1399` et XL/wide `>=1400`. Ce profil Piqueray réutilise les seuils Odoo/Bootstrap `lg=992` et `xxl=1400`, sans prétendre reprendre la grille complète qui contient aussi 576 et 1200. Les frontières sont prouvées à 991/992/993 et 1399/1400/1401. La composition compact remplit au minimum la hauteur visible tout en pouvant grandir lorsque titre et CTA ne tiennent plus ; aucun scroll interne ou crop de contenu n’est introduit par défaut.

**Rationale**: une hauteur rigide de viewport coupe le contenu en paysage court. Une `min-height` liée au viewport avec croissance par contenu concilie le témoin pleine hauteur et l’accessibilité ; le canal exact est gouverné et annoté comme code-only si le canvas ne peut porter que sa taille de référence.

**Sources**: [variables Bootstrap embarquées par Odoo 19](https://github.com/odoo/odoo/blob/19.0/addons/web/static/lib/bootstrap/scss/_variables.scss) ; [layout responsive des thèmes Odoo 19](https://www.odoo.com/documentation/19.0/developer/howtos/website_themes/layout.html) ; [règles d’override des variables Odoo 19](https://www.odoo.com/documentation/19.0/developer/howtos/website_themes/theming.html).

**Alternatives considered**: seuil arbitraire 1280 ou 1728 ; reprise globale de `$grid-breakpoints` ; état Tablet à 768 ; `height: 100vh` rigide ; overflow caché ; scroll interne implicite.

## R7 — Migration Figma et identité historique

**Decision**: si H2 exige un variant, étendre le runner par fixture puis spike isolé pour envelopper le composant historique comme membre wide/XL sans le recréer. Son node id, sa key historique, ses propriétés, son poster, ses descendants et les liens/overrides Home doivent survivre ; le nouveau component set reçoit une identité additive distincte enregistrée comme ancre de set. Le contrat garde aussi l’ancre du membre wide. Toute perte refuse avant le premier write live.

**Rationale**: l’émetteur actuel refuse explicitement le passage standalone→set ; ses chemins sûrs couvrent seulement l’amend à forme constante. FR-020 exige une preuve spécifique, et le reçu `run-001` donne le précédent pour images, instances, overrides et no-op.

**Alternatives considered**: supprimer/recréer le master ; remplacer directement l’instance Page ; considérer la nouvelle key de set comme remplacement de la key historique ; accepter le skip actuel.

## R8 — Média et dépendance Button

**Decision**: conserver un seul poster owner dans les trois compositions, le même plan de couverture et les deux voiles. `videoUrl` reste un canal code distinct ; Figma et Odoo utilisent le poster statique nommé. Le Button actuel est réutilisé sans changement de variante, taille, typographie, padding, icône, wrapping ou largeur intrinsèque ; la section ne possède que son placement. Aucun second asset, point focal ou changement de Button n’est ajouté dans cette feature.

**Rationale**: ces faits sont protégés et déjà couverts par les mécanismes de récolte/restauration d’IMAGE. L’instance Home porte des overrides CTA historiques ; une reconstruction ou un changement Button non borné menacerait le contenu et d’autres consommateurs. Un CTA full-width serait une nouvelle décision de l’atom, pas une conséquence du layout HeroVideo. Si H2 exige un repositionnement, un marqueur de placement parent générique peut être ajouté et testé sur chaque sortie, sans dupliquer le Button ni employer un ordre CSS divergent du DOM.

**Alternatives considered**: inventer un crop mobile ; dupliquer le média ; tenter de transporter une vidéo native Figma ; modifier `ds.button` pour résoudre localement le CTA.

## R9 — DOM Odoo unique et persistance COW

**Decision**: garder l’anatomie QWeb existante — poster, voiles, Text/Accroche, Button frère — et appliquer la CSS responsive générée et root-scopée aux occurrences sauvegardées. Les contrôles actuels poster/alt/titre/libellé/href restent identiques ; aucun contrôle de composition n’est ajouté. Ni `$grid-breakpoints`, ni `.container/.row/.col-*`, ni `.o_pqr_page`, ni `odoo-bridge.css` ne portent la décision HeroVideo. Si H2 demande une parenté impossible avec ce DOM, le passage devient `structure-stale` et une migration de page séparée est requise.

**Rationale**: Odoo sauvegarde le snippet comme `outerHTML` figé dans `ir.ui.view`; un update QWeb ne transforme pas les occurrences, tandis qu’une CSS globale compatible s’applique sans réécriture. `npm run odoo:page` remplace le contenu et reste réservé à une instance jetable ou une reconstruction autorisée.

**Alternatives considered**: dupliquer les DOM Desktop/Mobile et les contenus éditoriaux ; écrire un `@media` dans `odoo-bridge.css` ; migrer silencieusement `arch_db` ; exposer un choix de composition au rédacteur.

## R10 — Contrat et semver

**Decision**: faire évoluer le schéma uniquement par champs optionnels, documenter `docs/02-contract-spec.md`, et publier `ds.hero-video` en version mineure si ses props de contenu restent inchangées. Les ancres de composition et de set sont additives ; aucun champ existant n’est repurposé. La cascade Odoo lock/digest/manifest/version-guard/figma-links a lieu seulement après H3.

**Rationale**: le responsive ajoute un comportement et une surface Design sans retirer ni renommer `backgroundUrl`, `videoUrl`, `backgroundAlt` ou `accroche`. La constitution interdit le repurpose de schéma et impose que le diff de contrat soit la revue commune.

**Alternatives considered**: patch sans bump ; major injustifié ; mise à jour Odoo avant acceptation de la source ; overwrite de l’ancre historique.

## R11 — Matrice de preuve et parité

**Decision**: étendre l’instrument visuel avec quatre témoins 390/834/1200/1728 et ajouter une matrice Playwright géométrique pour 320, 390, 834, 991/992/993, 1024, 1200, 1399/1400/1401, 1440, 1728 et un paysage court. Les cas couvrent titre/CTA par défaut et longs, poster réel présent et vidéo indisponible. Chaque ligne enregistre viewport exact, largeur root, témoin éventuel, composition attendue/active, bounds de l’union des descendants, overflow, couverture, centrage, contenu accessible et preuve fraîche liée.

**Rationale**: les sujets HeroVideo actuels sont limités au témoin 1728 et le scénario Odoo ne qualifie ni mobile, ni média réel, ni édition. Un pourcentage de pixels seul ne prouve pas le breakpoint, l’overflow ou la persistance.

**Alternatives considered**: une capture mobile représentative ; inspection manuelle seule ; seuil global sans géométrie ; réutiliser les fixtures `ds.hero` non enregistrées comme preuve HeroVideo.

## R12 — Qualification Odoo

**Decision**: créer un scénario HeroVideo fonctionnel avec deux instances et un scénario update dédié. Ils prouvent édition poster/alt/titre/CTA/href, sauvegarde-réouverture, isolation, rendu public, matrice responsive, puis égalité du DOM sauvegardé avant/après `odoo -u` pendant que la nouvelle CSS agit. Les comparaisons HTML↔Odoo ont les quatre témoins appariés et sont exécutées séparément en public et dans l’iframe éditeur quand la qualification le demande.

**Rationale**: 025 a obtenu une recette owner mais pas un scénario automatisé complet. La nouvelle capacité affecte à la fois visiteurs, éditeur et pages persistées ; ces trois surfaces doivent être fermées mécaniquement avant H4.

**Alternatives considered**: rejouer seulement `hero-video-visual.mts` à 1728 ; tester uniquement une nouvelle page composée ; considérer `structure-stale` comme migration réussie.

## R13 — Idempotence et dossier pilote

**Decision**: la clôture exige un deuxième build/réconciliation/capture avec les mêmes pins et la même décision : zéro fichier dérivant, zéro node créé/modifié, zéro doublon, `pageWrites: []`, mêmes ancres, médias, instances et overrides. Le dossier de capitalisation conserve inputs, H1–H4, contrôles, arrêts, refus, limites et reçus sans déclarer une skill généralisée.

**Rationale**: un build vert ne prouve ni le canvas no-op ni la stabilité des preuves. Le pilote doit rester un cas vérifiable, pas une généralisation tirée d’un seul composant.

**Alternatives considered**: déduire le no-op d’un diff Git ; ne rejouer que la génération ; créer directement `component-to-responsive`.

## R14 — Viewport, témoins et comparaison

**Decision**: séparer `compositionId` (`compact`, `desktop`, `wide`) de `witnessId` (`mobile-390`, `tablet-834`, `desktop-1200`, `wide-1728`). Chaque comparaison ouvre un viewport navigateur exact et partage un manifeste de fixture — contenu, poster SHA-256, police, locale et état — entre Figma↔référence puis référence↔Odoo. Les frontières sont des probes géométriques, pas des comparaisons Figma artificielles.

**Rationale**: les runners actuels peuvent rendre une root étroite dans une page large ou dériver le viewport du clip ; la media query active est alors fausse malgré un pixel diff vert. Quatre témoins n’impliquent pas quatre compositions : Tablet 834 pointe vers compact.

**Alternatives considered**: ne changer que `renderWidth` ; calculer le viewport avec `clip + 80` ; comparer Figma à chaque pixel frontière ; valider uniquement le pourcentage global de la photo.

## R15 — Basis viewport et portée Odoo

**Decision**: déclarer `basis: viewport-width` pour cette feature. L’usage Home actuel est full-bleed et compatible avec ce choix. Un futur usage contenu n’hérite pas automatiquement de cette garantie : il doit prouver l’équivalence de largeur ou ouvrir une décision séparée vers des container queries. La page Home+Header et le Hero isolé gardent des preuves distinctes.

**Rationale**: une media query lit `window.innerWidth`, pas la largeur disponible du composant. Confondre les deux sélectionnerait potentiellement Desktop pour un Hero contenu plus étroit ; compenser ce problème en modifiant le container global casserait d’autres sections.

**Alternatives considered**: supposer tout Hero full-bleed pour toujours ; modifier le container Odoo ; introduire immédiatement des container queries sans usage contenu prouvé.

## Clarifications techniques résolues

- H1 est accepté et H2 retient l’option 3 pour le layout uniquement ; les valeurs esthétiques/métier restent différées à une spec transverse avant toute mutation source. Le profil 992/1400, les trois compositions et les quatre témoins sont décidés.
- Une nouvelle key de component set est acceptable uniquement comme identité additive ; la key/node du composant wide/XL historique reste protégée et exploitable.
- La faible hauteur utilise une hauteur minimale de viewport avec croissance de contenu par défaut ; toute compaction différente revient à H2.
- Le renderer React inline appartient au périmètre de fidélité générée et doit recevoir une règle responsive déterministe ou refuser explicitement la génération ; il n’est pas laissé Desktop silencieusement.
- Aucune `NEEDS CLARIFICATION` technique ne subsiste avant la génération des tâches.
