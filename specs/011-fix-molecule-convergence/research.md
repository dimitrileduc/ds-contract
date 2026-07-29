# Phase 0 — Research: convergence des sept molécules

**Date**: 2026-07-28 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Toutes les décisions techniques nécessaires à la planification sont résolues ici.
Les inventaires de cas et de nodes concrets seront des données validées par le contrat
de campagne : un cas sans référence Figma immuable n'est pas une inconnue à deviner,
mais une erreur `coverage-incomplete`.

## D1 — Trois bases d'attribution, aucune restauration globale

**Decision**: Distinguer systématiquement :

1. le checkpoint historique
   `45e2a7d5a950e3d6ccc2a0dd62982b7c288210c5` ;
2. la baseline WIP partagée
   `29d70187cdb7c7e45ca3bbc4f2d75da64bcd31b5`
   (tree `4ced338fb8ff6cbafc340193e4fd0f17ec277869`) ;
3. le delta d'implémentation attribuable à 011.

Un manifeste d'attribution enregistre HEAD, status, fichiers et hashes au début de
l'implémentation puis à la clôture. Le checkpoint est consulté par `git show`/`git diff`
uniquement ; aucun reset, checkout global, clean ou revert de masse n'est autorisé.

**Rationale**: `45e..29d` contient déjà 232 fichiers et plus de 25 000 lignes ajoutées,
dont les sept contrats, les premières preuves 010, le durcissement visuel et la spec 011.
Attribuer tout ce delta à 011 ou restaurer `45e` écraserait le WIP que la spec exige de
préserver.

**Alternatives considered**: comparer uniquement final↔checkpoint (mauvaise attribution) ;
considérer HEAD comme entièrement possédé par 011 ; restaurer le checkpoint (destructif).

## D2 — Figma est une preuve immuable ; les audits existants satisfont l'étape 0

**Decision**: Tout accès Figma est un GET de lecture ou une lecture de cache validée
contre une version explicitement pinée. Les audits 003/005/007 des sept molécules sont
réutilisés. Une nouvelle saleté de source découverte pendant la campagne bloque le cas :
elle n'autorise ni correction canvas, ni contournement contractuel.

**Rationale**: La Constitution VIII impose une source propre avant contractualisation,
mais FR-002/003 interdisent plus strictement toute mutation dans 011. Les contrats existent
déjà et disposent d'audits historiques ; la réutilisation est donc la seule combinaison
cohérente. X et XI sont N/A parce qu'aucun writer n'existe.

**Alternatives considered**: nettoyage ou writeback (interdit) ; re-audit complet sans
signal nouveau (duplication) ; promotion silencieuse d'une saleté dans le contrat
(violation d'honnêteté).

## D3 — Les corrections passent par le contrat et par des mécanismes génériques prouvés

**Decision**: Les sources autorisées sont :

- `contracts/*.contract.json` ;
- le schéma Zod, par champs optionnels uniquement ;
- les émetteurs/générateurs génériques, après fixture indépendante rouge ;
- la configuration et le moteur de comparaison, uniquement pour rendre la mesure fidèle ;
- les fixtures et évals.

Après correction, les sorties sont régénérées par `build`, `figma:plan`, `catalog`,
`emitters:check` et le golden explicite. Les scripts Figma sont produits localement pour
la preuve de déterminisme, mais jamais exécutés ni poussés.

**Rationale**: `src/components/`, `figma-sync/`, `catalog/`,
`contracts/contract.schema.json` et `core/samples/` sont des sorties. Une ressemblance
obtenue par leur modification directe ne prouve pas contrat→code. La discipline
fixture→eval→claim et le mock ferment les changements génériques.

**Alternatives considered**: patch des TSX/CSS/stories/triptyques ; fix spécifique au
screenshot ; acceptation automatique du golden ; exécution d'un script canvas.

## D4 — Un manifeste de campagne, pas l'énumération implicite des seuls variants

**Decision**: Ajouter un contrat de campagne propre à 011. Il fixe exactement sept
sujets et déclare chaque cas obligatoire avec :

- une référence Figma concrète et sa version ;
- les propriétés observées sur ce node ;
- les valeurs contractuelles/code équivalentes ;
- la surface de contraste ;
- les assets image test-only ;
- les régions utiles et les parts géométriques attendues.

Le runner compare cet inventaire au census des propriétés Figma et au produit des axes
légaux du contrat. `missing` ou `unexpected` fait échouer la campagne.

**Rationale**: Le runner actuel ne produit que 11 lignes pour les sept masters : Carte×2,
Field×2, MemberCard×1, NavItem×1, ProductCard×1, Realisation×2 et Tab×2. L'inventaire
historique révèle une couverture bien plus large : Field a 12 combinaisons légales,
NavItem 4, ProductCard 8 combinaisons image/bouton, MemberCard 16 portraits,
Realisation 27 images et Carte 26 images uniques dans 36 occurrences. Il n'énumère
aujourd'hui ni ces cas, ni les images, ni les états contractuels sans node de variant.

**Alternatives considered**: conserver `subjects.ts` comme seule vérité ; produire un
cartésien aveugle sans référence Figma ; assimiler une absence de node à un skip.

## D5 — Chaque cas non-défaut exige un node Figma immuable réel

**Decision**: Un variant master peut servir de référence pour ses axes VARIANT. Une
propriété BOOLEAN ou INSTANCE_SWAP non-défaut exige une instance existante dont le
nodeId et les propriétés observées sont inscrits dans le manifeste. Si aucune instance
immuable ne matérialise une combinaison obligatoire, la campagne retourne
`coverage-incomplete` et la molécule reste non validée.

**Rationale**: L'API Images rend un node existant ; elle ne permet pas d'appliquer
temporairement des propriétés à un master en lecture seule. Inventer un rendu Figma local
ou créer une instance violerait la vérité de référence.

**Alternatives considered**: mutation temporaire du canvas ; référence générée depuis le
code ; supposition d'une combinaison non observée.

## D6 — Acceptation absolue et non-régression sont deux gates distinctes

**Decision**: Un cas passe seulement si son score probant et chaque région obligatoire
sont ≤2,5 %, indépendamment de toute baseline. Le gate global existant à 2,0 % peut
rester plus strict pour les campagnes historiques ; le manifeste 011 porte explicitement
son plafond de 2,5 % sans modifier silencieusement les autres instruments. Ensuite, une
baseline feature-scoped empêche toute régression au-delà de l'epsilon déterministe.

**Rationale**: Le runner actuel affiche `OVER` sans sortir en erreur en mode normal ;
`--summary` compare seulement à une baseline globale, elle-même obsolète (7 sujets/13
lignes contre 22 sujets live). Une mauvaise baseline ne peut pas accorder une validation.

**Alternatives considered**: baseline-only ; moyenne par composant ; élargissement global
du seuil ; cause de triage traitée comme waiver.

## D7 — Le masque ne décide jamais ; visibilité, régions et géométrie ont leurs propres gates

**Decision**:

- le score non masqué reste l'autorité par défaut ;
- le score masqué et la couverture du masque sont diagnostiques ;
- une région utile est déclarée avant le diff, jamais choisie après observation ;
- une région texte éventuelle conserve toute l'encre du glyphe et doit être protégée par
  une fixture adversariale prouvant qu'un texte absent, différent ou de mauvaise casse
  échoue ;
- chaque côté doit présenter une quantité mesurable de pixels visibles/contrastés ;
- racine et parts nommées sont comparées séparément en coordonnées normalisées ;
- tout écart géométrique non nul doit disparaître ou citer un chemin de contrat qui le
  justifie explicitement.

**Rationale**: Les fixtures WIP confirment déjà trois classes : un masque peut créer un
faux 0 %, une encre blanche peut disparaître sur fond blanc, et le recadrage alpha peut
décaler une bordure pourtant identique. Il manque encore le refus blank/blank et le verdict
géométrique indépendant. Un score pixel global peut aussi diluer une image ou un trait
petit mais essentiel.

**Alternatives considered**: score masqué ; seuil plus large pour le texte ; région choisie
par corrélation au diff ; redimensionnement/ré-échantillonnage ; score pixel unique.

## D8 — Les images Figma deviennent des fixtures de preuve, jamais des défauts runtime

**Decision**: Les octets derrière les paints IMAGE sont téléchargés en GET, versionnés
dans un manifest avec fileVersion, node/paint/image refs, dimensions, bytes et SHA-256,
puis injectés seulement dans les props du cas de comparaison. Le runner vérifie hash,
décodage navigateur (`complete`, `naturalWidth/Height`) et présence de pixels visibles
dans la région image.

Le WIP contient déjà les reçus de deux Carte, MemberCard et ProductCard mais pas les
quatre fichiers eux-mêmes ni leur câblage. Realisation doit recevoir des reçus propres
aux deux tailles/aux images réellement visibles. Un placeholder gris ou une URL vide
ne valide rien.

**Rationale**: Les images sont des overrides Figma réels et participent au rendu. Les
mettre comme défaut dans un composant serait un comportement de production spécifique à
la capture ; ne pas les transporter dans la preuve crée les faux échecs/vides observés
par 010.

**Alternatives considered**: image inventée ; placeholder ; masque image ; asset de preuve
comme défaut runtime ; URL CDN signée persistée.

## D9 — Réparations contractuelles par molécule

**Decision**: Appliquer les corrections contractuelles et les obligations de preuve
suivantes, sans patcher les sorties générées :

| Molécule | Décision contractuelle et de preuve |
|---|---|
| **Carte** | Conserver un seul contrat à deux dispositions et couvrir les 26 images uniques/36 occurrences inventoriées. Porter la géométrie fluide/contextuelle, l'ombre/centrage de Réassurance, la casse et la composition de Catégorie, les contenus/glyphes CTA, et promouvoir `texte` en segments richement typés pour la plage forte. Ce changement de forme de prop est majeur. Les images pinées sont des presets de campagne, pas des defaults. Revalider Reassurances/CategoriesPrincipales. |
| **Field** | Conserver le slot `children` restreint à Input/Select/Textarea et couvrir les 12 combinaisons `etat × optionnel × saisie`. Ajouter un mécanisme additif générique, fixture-first, pour que le contrôle slotté remplisse la largeur et reçoive `aria-invalid`/`aria-describedby` selon `etat`; les 280px actuels sont un conteneur de preuve, pas la largeur contractuelle FILL. Revalider Input/Select/Textarea/Formulaire. |
| **MemberCard** | Préserver la composition `MemberPicture`, ne pas aplatir la photo dans la carte, et couvrir les 16 portraits/contenus observés. Ajouter des props photo code-only explicites et une propagation parent→enfant scalaire générique, fixture-first ; MemberPicture reste la part qui dessine/décode l'image. Vérifier les variants de la dépendance et Equipe, sans faire de MemberPicture une huitième cible de verdict. |
| **NavItem** | Supprimer toute largeur de capture inventée, utiliser la surface sombre commune, couvrir les 4 combinaisons `chevron × actif`, et exprimer `aria-current` depuis l'état actif via un mapping d'attribut additif. Le lien reste un `<a>` avec destination explicite. Revalider Header. |
| **ProductCard** | Couvrir les 4 images et les 2 états `bouton` (8 cas), utiliser chaque image Figma hashée via `imageUrl` de campagne et conserver `bouton=false` comme défaut observé. Aucun node immuable `bouton=true` n'est actuellement connu : sans référence réelle ou route non mutante prouvée, la campagne reste `coverage-incomplete`. Vérifier image/alt et sémantique de carte sans patch de sortie. |
| **Realisation** | Couvrir les 27 instances/images réelles (3 Grand, 24 Petit) avec les octets IMAGE et leurs régions complètes. Les dimensions propres aux tailles restent contractuelles ; le placeholder gris du master ne peut servir de preuve. Revalider Realisations. |
| **Tab** | Conserver les 2 états, casse haute et bordure basse contractuelles. Ajouter `aria-selected`, `tabIndex` et l'identité de panneau par mapping d'attribut, plus un mécanisme de contexte `tablist`/roving focus explicite et borné sans inventer une huitième molécule cible. La preuve texte doit conserver le signal ; le delta brut historique 10,90 % est un gate à résoudre, jamais à diluer. |

**Rationale**: Ces décisions reprennent les faits historiques 003 qui avaient déjà
convergé (Tab 9/9, MemberCard complet, images/overrides réels) et expliquent les pertes
du passage 010. Les mécanismes transverses (texte riche, attributs par prop, propagation
scalaire/slot) sont génériques et doivent être prouvés hors des sept contrats avant usage.

**Alternatives considered**: composants spéciaux codés à la main ; duplication d'une
photo imbriquée ; retrait d'un état ou d'une image ; création d'un TabList hors périmètre ;
CSS de capture.

## D10 — Résultat machine, matrice humaine et preuve complète par cas

**Decision**: La campagne écrit dans un répertoire propre à 011 :

- `result.json` déterministe et validable ;
- `REPORT.md` ;
- référence, rendu généré, diff et triptyque pour chaque cas ;
- hashes de tous les artefacts ;
- matrice Figma fact → contract path → generated fact → evidence → verdict ;
- verdict composant calculé par `all(cases pass)`.

Le runner nettoie uniquement ce répertoire de campagne explicitement résolu avant
d'écrire, jamais le répertoire global ni des preuves étrangères.

**Rationale**: Les preuves complètes vivent actuellement dans `out/` ignoré, tandis que
`report-assets/` ne copie que les pires lignes et accumule des fichiers anciens. Un
reviewer ne peut pas démontrer exhaustivité, provenance ou attribution depuis ce format.

**Alternatives considered**: worst-ten ; report Markdown sans JSON ; artefacts globaux
mutables ; silence sur les lignes refusées.

## D11 — Gates de clôture

**Decision**: La clôture exige :

1. fixtures adversariales et tests d'images ;
2. campagne 011, couverture exacte et 7/7 verdicts positifs ;
3. `build`, `figma:plan` local, `emitters:check`, `catalog`, `verify:catalog` ;
4. parity propre ;
5. eval complet sans échec ;
6. plugin check, round-trip déterministe, browser check et deux typechecks ;
7. comparaison d'attribution checkpoint/WIP/delta et audit des sorties générées.

Les quatre échecs hérités nommés par 010 autour de
`Primitives/border-width/1` doivent être réellement résolus ou la clôture est refusée.

**Rationale**: SC-008/FR-022 exigent toutes les vérifications pertinentes, pas seulement
les pixels des sept cibles. Une baseline ou un acquittement silencieux contredirait la
Constitution.

**Alternatives considered**: fermer avec évals rouges ; exécuter seulement les tests
ciblés ; appeler un échec hérité « hors périmètre » sans le rendre compatible.

## Synthèse

| Décision | Statut |
|---|---|
| Attribution checkpoint / WIP / 011 | Résolue |
| Figma read-only et audits réutilisés | Résolue |
| Sources de correction et fixture-first | Résolue |
| Manifeste de couverture exhaustif | Résolue |
| Référence concrète pour chaque cas | Résolue |
| Acceptation absolue vs non-régression | Résolue |
| Signal, visibilité, régions et géométrie | Résolue |
| Images hashées test-only | Résolue |
| Réparations des sept molécules | Résolues |
| Résultat/matrice/preuves | Résolue |
| Gates de clôture | Résolues |
