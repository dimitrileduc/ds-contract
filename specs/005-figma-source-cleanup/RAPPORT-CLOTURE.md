# Rapport de clôture — Spec 005 (source Figma propre avant extraction)

**Statut : CLOS — 2026-07-25.** 9 user stories traitées, 13 cycles de preuve, fichier
final à **5 pages** (Pages, DS · Tokens, DS · Atomes, DS · Molécules, DS · Organisms),
16 styles de texte, 15 variables couleur, zéro page de chantier. Gates repo : 8/8
verts, suite eval **108/108** (vérifiés le jour de la clôture, voir § Gates).

## Quadruplets (un par geste)

Catalogue complet compilé dans [RAPPORT-CLOTURE-quadruplets.md](./RAPPORT-CLOTURE-quadruplets.md)
(sommaire par cycle + les blocs §2 de `contracts/gesture-record.md` + contrôle SC-015).
Le cycle **ménage-final** (13ᵉ, post-compilation) a son quadruplet dans
[decisions.md § Phase 10 — Ménage final](./decisions.md) et son verdict dans
[proofs/menage-final/](./proofs/menage-final/verdict.md).

## Divergences ouvertes

1. **Bouton — mismatch contrat ↔ source** (FR-039)
   - Source (Figma) : axe `Property 1` → **`Style`** ; valeur fautive « Outilne noir » → « Outline noir » (L1).
   - Contrat `ds.button` : **non modifié** par cette itération (FR-033) — `bindings.figma` porte toujours `"Property 1"` et `"Outilne noir"`.
   - **Réparation attendue** : bump **majeur** du contrat en Spec B (valeur de variant renommée = major).
2. **Glyphe hors registre conservé — `octicon:chevron-down-12`** (FR-038)
   - Trouvaille Phase 8 : composant **orphelin sans emplacement de page** (`parent: null`), maintenu en vie par ses 36 instances. Logé sur `DS · Atomes` (première localisation, pas un déplacement), description marquant le hors-registre, **non re-swappé** vers le `chevron-down` du registre.
   - **Réparation attendue** : décision adopter-ou-remplacer léguée à la Spec B.
3. **Checkbox — 0 usage réel** (constaté dès la spec 004, re-confirmé par l'audit fichier-entier du 2026-07-25) — seul contrat sans aucun consommateur. Décision Spec B : garder gouverné sans usage, ou parquer.
4. **Étoile / mail / external-link — 0 usage réel** (gouvernance registre 002 ; mail et external-link confirmés par `releves/instances-l4-verification.json`, Étoile par l'audit fichier-entier). Décision Spec B.
5. **Section-header — enfants FIXED 1550, cause racine de l'adoption 0/6** (US7) : limite d'API confirmée par exécution (un enfant FIXED hérité du maître n'est pas redimensionnable au niveau instance). **Réparation attendue** : passer `Accroche`/`Titre` en FILL sur le **maître** puis rejouer l'adoption ×7 — Spec 006, cycle pixel dédié (cascade Réassurances ×3 à mesurer).
6. **Hero vidéo — strate** : master né en place sur la maquette Accueil (componentisation T085). **Réparation attendue** : déplacement vers `DS · Organisms` + instance laissée sur Accueil — Spec 006, cycle visuel dédié.

Voir aussi `BACKLOG-SPEC-006-figma-styles-structure.md` (racine du dépôt) : GROUPs
structurels ×11, rich-text B1, styles sous seuil, Nav-item/contrat Header.

## Valeurs laissées littérales

**Chromatiques — plus aucune** : le relevé T009 listait 4 valeurs `<3×` (laissées par
la règle ≥3× de la spec) ; la règle owner **≥2×** décidée à la clôture les a toutes
gouvernées au cycle ménage-final — `#000000` → `color/noir-pur` (le T032 de L2 était
coché mais jamais réellement exécuté, omission détectée et rattrapée), `#E0E0E0` →
`color/gris-clair`, `#26282C52`/`#0000004D` étaient déjà liés en RGB (l'alpha est
l'opacité du paint, préservée). Seule exclusion : `#9747FF` ×4 = le stroke pointillé
par défaut des COMPONENT_SET (chrome d'éditeur Figma, jamais rendu dans les
instances) — pas une couleur de design.

**Typographiques — 5 nœuds + 6 rich-text, tous déclarés** :

| Valeur | Master | Occ. | Pourquoi laissée |
|---|---|---|---|
| Regular 44 / lh 48 | Hero vidéo (titre) | ×1 | Sous le seuil ≥2 (recette unique) |
| Medium 16 / lh 16 | Nav-item (libellé) | ×1 | Sous le seuil ≥2 — les libellés Bouton sont en lh 22 (`Libellé bouton`), recette différente |
| Regular 14 / lh AUTO | Field ×3 (`(optionnel)` ×2, message d'erreur) | ×3 | Le style `Paragraphe` existe (14/24) mais lh AUTO ≠ 24 — lier serait un geste **visuel** |
| Gras par plages | Carte ×2, Présentation ×2, Hero titre+sous-titre | ×6 | Un style Figma s'applique au nœud entier — chantier **B1** (rich-text, côté repo) |

**Cas 54px (Titre Hero)** : gouverné dès L2/T027 (style créé, exception FR-011) — jamais resté littéral.

## Dégradations & limites

**Déviations de processus (3, badgées « ⚠️ » dans le journal, aucune cachée)** :
1. **V3/SAV** — les 3 écritures du geste ont précédé le checkpoint et la capture-avant dédiés (ordre proof-cycle §1 violé). Rattrapage honnête : `V2/after` réutilisé comme avant-référence (vérifié inchangé), checkpoint posé après coup. Résultat pixel conforme.
2. **L4** — T090 (annonce + capture avant) sauté ; `L5/after` réutilisé comme avant-référence.
3. **L1/T019-21 (multi-agent)** — 6 agents de rédaction ont appelé le pont en lecture seule malgré la consigne (zéro mutation vérifiée ligne à ligne ; « à ne pas refaire sciemment »).

**Incident majeur de clôture — diagnostic hérité erroné, cassé puis réparé le même
soir (ménage-final)** : la « copie Accueil » (`2121:5168`) supprimée sur la foi d'un
audit externe la décrivant comme débris ; en réalité la casse observée (photo du
bandeau Devis disparue, 479 735 px) venait d'un **nouveau piège d'API découvert** :
lier un paint à une variable couleur dont l'**alpha vaut 1** fait dominer cet alpha
sur l'opacité du paint (30% → opaque). Réparé au pixel près (master + 8 instances,
opacité 77/255 du relevé T009) ; 2 régressions d'échos sœurs corrigées (soulignement
**par plages** de la colonne Contact — pattern récupéré depuis l'écho intact du
master Footer —, letterSpacing 1% du bouton SAV). Leçon : même classe que L2 — le
style/la variable pure écrase les transformations par plages des overrides d'instance.
**Triptyque de l'incident** (avant | cassé | diff — la photo masquée par l'overlay
opaque) : [proofs/menage-final/incident-devis-accueil-triptyque.png](./proofs/menage-final/incident-devis-accueil-triptyque.png).
La preuve de réparation est le verdict final lui-même (Accueil `identical`).

**Échecs de prédiction pixel (3/5 cycles de Phase 6, même cause structurelle)** :
V2 Devis (2px annoncé, 0 mesuré), V4 Réassurances (idem), V5 Section-header (mécanisme
composé, net Titre +1px/Bouton −1px) — **cascade de centrage** : dans une hiérarchie
où chaque niveau centre son enfant, un rétrécissement symétrique se recompose
exactement à travers les étages. Les corrections de source restent justes ; seule
leur empreinte pixel était surestimée.

**3 régressions réelles L4 trouvées par le diff, corrigées** (couleur du libellé
Nav-item, soulignement d'état actif par page, chevron par page — customisations
par-instance invisibles au pré-diff structurel) + **résidu accepté** : 1px
d'anti-aliasing sur 3 pages (chevron item 1, delta <0x20/255, imperceptible à ×8).

**Découverte d'API (ménage-final, explique un mystère de L2)** : `setRangeTextCase`
sur un nœud lié **détache le style** (la casse fait partie de la définition du
style) — les 7 nœuds « liés » de L2 s'étaient silencieusement détachés. Réponse :
3 styles UPPER dédiés (règle ≥2 respectée).

**Limite d'API confirmée** : enfants FIXED d'instance non redimensionnables
(`resize` et `resizeWithoutConstraints` no-op silencieux) → US7 livrée **0/6**,
repli fait-main vérifié byte-exact.

**3 effets de bord d'API découverts en L2** (casse / graisse par override
d'instance / opacité par override — 7+15+26 occurrences corrigées, méthode
octet-exacte `pngjs` retenue pour tout diagnostic fin).

**V7 — prémisse FR-015a fausse** : l'axe `État` de Tab variait déjà le rendu
(vérifié live + archive pré-005). Zéro geste — le « fix design assumé » de
l'itération n'a pas eu lieu : il n'y en a **zéro**, pas un.

**Résidu final du ménage** : libellé du bouton outline de Dépannage/SAV translaté
d'**exactement 1px** (171 px de diffCount ; motif de glyphes identique mesuré
colonne par colonne, propriétés live toutes identiques à l'avant) — round-trip
sub-pixel du letterSpacing, même classe que le 1px chevron L4. Nommé, pas caché.

**7 masters à noms tirés du contenu laissés hors périmètre** (décision T008 :
Field, Formulaire, Présentation, Coordonnées, SAV, Texte SEO, Catégories
principales, Réalisations, Footer — copie statique, non nommés par la spec).

**Outillage** : IIFE sans `return` → `result` non capturé par le pont (corrigé) ;
version-history REST indisponible le jour J (token expiré, 401, sans impact).

## Cadence

**13 cycles consommés vs budget 12 (SC-009) — dépassement de 1, nommé au moment où
l'owner a ajouté le lot ménage-final à la clôture** (styles ≥2, couleurs ≥2,
suppressions, rangement Organisms). V7 = 0 cycle (investigation sans geste).

| # | Cycle | versionId |
|---|---|---|
| 1 | É — étalonnage | `2380086734107230162` |
| 2 | L1 — noms & descriptions | `2380151587589170820` |
| 3 | L2 — variables & styles | `2380158790790581337` |
| 4 | L3 — affordances | `2380204337834005784` |
| 5 | V1 — Header nav 88→89 | `2380206623813672482` |
| 6 | V2 — Devis | `2380183199065576591` |
| 7 | V3 — SAV | `2380204794170636895` (posé tardivement — déviation nommée) |
| 8 | V4 — Réassurances | `2380208178616052777` |
| 9 | V5 — Section-header | `2380194880854725208` |
| 10 | V6 — Footer | `2380193965475233153` |
| 11 | L5 — adoption + Hero vidéo | `2380192818739582323` |
| 12 | L4 — strates & rangement | `2380237448279043287` |
| 13 | ménage-final (owner, clôture) | `2380243255616009478` (+ `2380244710516711183`, `2380214328453044585`) |

## Gates (T108 — exécutés le 2026-07-25 à la clôture, par 2 agents, logs conservés)

| Gate | Résultat |
|---|---|
| `npm run build` + `git status` | ✅ régénération byte-identique, git propre |
| `npm run parity` | ✅ 0 finding actif (2 baselinés connus) |
| `npx tsc --noEmit` / `tsc -p tsconfig.build.json` | ✅ / ✅ |
| `npm run plugin:check` | ✅ hash moteur conforme au reçu |
| `deterministic-roundtrip` | ✅ byte-identique ×2, boucle zéro-IA fermée |
| `core-browser-check` | ✅ 4/4 émetteurs en VM sans node |
| `npm run eval` (checkout main) | ✅ **108/108** |

## Compteurs de clôture

| Compteur | Valeur | Source |
|---|---|---|
| Noms par défaut | **0** | relevé T008 (63 échos) → L1 : 65 renommages + 3 axes, 0 erreur |
| Masters sans description | **0** | 15 écrites (T019-21) + 3 à la naissance (Nav-item, Hero vidéo, glyphe hors registre) |
| Calques masqués non pilotés | **0** | L3 : Product-card propriété `Bouton` ; variant fantôme Tab archivé puis supprimé |
| Instances cassées | **0** | `releves/instances-l4-verification.json` — 157 instances re-résolues par clé |
| Icônes réunies | **18** (15 registre + 3 sociales) + 1 hors registre à côté | Phase 8 (FR-036/FR-038) |
| Textes de masters sans style | **11**, tous déclarés (5 nommés + 6 rich-text B1) | ménage-final (46 scannés, 33 liés, 6 styles créés, 1 fantôme supprimé) |
| Couleurs de design non gouvernées | **0** (hors chrome éditeur #9747FF) | ménage-final, règle ≥2 |
| Page `Assets` | **supprimée** (7→6 pages) | Phase 8 |
| Page `Archive · Spec A` | **supprimée** (6→5 pages) | ménage-final (contenait les clones Tab + Footer) |
| Copie Accueil (`2121:5168`) | **supprimée** (0 master dedans, décision owner) | ménage-final |
| DS · Organisms | **15 sections** en colonne, ordre de lecture, byte-prouvé 0 pixel | ménage-final (demande owner) |
| Verdict pixel final | **8/9 identical** + 1 résidu d'1px nommé (SAV, libellé bouton) | [proofs/menage-final](./proofs/menage-final/verdict.md) |
