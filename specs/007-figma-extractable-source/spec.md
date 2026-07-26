# Feature Specification: Spec 1 — Canvas : rendre la source Figma extractible

**Feature Branch**: `007-figma-extractable-source`
**Created**: 2026-07-26
**Status**: Draft
**Input**: `PREPA-2-SPECS-SUIVANTES.md` (racine, 2026-07-26), section **« SPEC 1 — Canvas : rendre la source extractible »**, augmentée de `BACKLOG-SPEC-006-figma-styles-structure.md` (racine, audit de clôture 005 du 2026-07-25) qu'elle désigne explicitement comme le contenu de son chantier 1.3. Le document de prépa pose le périmètre et les décisions à trancher, **pas les gestes** : l'ordre exact des opérations appartient à `/speckit.plan`.

**Numérotation** : le script a proposé `006`, déjà porté par la branche `006-google-reviews-block` (worktree actif, 16 commits en retard, traite un tout autre sujet — point 5 de la liste « à régler » de la prépa). La feature est renumérotée **007** ; `006` reste attribuée à sa branche.

---

## Contexte mesuré

Relevé du **2026-07-26**, en lecture seule : les 55 masters du fichier live passés à la chaîne d'extraction. Résultat brut : **55 contrats proposés, 55/55 valides pour le schéma, 704 notes réparties en 196 classes.**

Ce que ce relevé prouve : la machinerie d'extraction n'est pas le facteur limitant — elle avale les organisms, détecte 75 références de composition et 9 collections répétées sans être guidée. **Ce qui bloque est entièrement du côté de la source.**

Le fichier est propre *pour un humain* depuis la spec 005. Il ne l'est pas encore *pour un extracteur* : **les noms ne sont pas des identifiants et les valeurs ne sont pas des tokens.** Cette itération ferme cet écart, et rien d'autre. Elle ne génère aucun code et ne modifie pas le dépôt hors ses propres artefacts de spec.

### La règle qui fixe l'ordre (pourquoi ce chantier passe avant le design-to-code)

Le coût d'inversion décide de l'ordre, pas une préférence :

| Chantier | Fait **après** l'adoption d'un contrat | Verdict |
|---|---|---|
| Renommer un master, une prop, une valeur de variant | **bump majeur** par composant touché (un nom devient un identifiant généré) | doit passer **avant** |
| Valeur non tokenisée | le code généré ne porte pas la valeur → **le diff pixel ne peut pas être vert** | doit passer **avant** |
| Exposer une prop sur un master | **bump mineur** (prop ajoutée) | peut glisser → spec suivante |

Précédent qui chiffre la règle : le Bouton. **Une seule** valeur mal orthographiée (« Outilne noir ») coûte déjà un bump majeur à elle seule.

### Ce que fait l'extracteur face à un nom illégal

Il **ne refuse jamais** : il translittère au moment de la proposition et écrit une **note nommée**. C'est exactement pourquoi la dette est silencieuse aujourd'hui et mesurable demain — les notes *sont* l'instrument de mesure de cette spec.

| Nom porté par la source | Identifiant proposé | Classe de note émise |
|---|---|---|
| `Étoile` | `toile` / `Toile` | identifiant de contrat : caractères non transportables |
| `Équipe` | `quipe` | idem |
| `Hero vidéo` | `HeroVidO` | nom de contrat : pas un nom de composant |
| `État` (propriété) | `tat` | propriété : caractères hors identifiant légal |
| `Libellé` (propriété) | `libell` | idem |

---

## Clarifications

Trois décisions gouvernaient le périmètre chiffré de cette itération. **Les trois sont tranchées** — session du 2026-07-26. S'y ajoutent les clarifications de la passe `/speckit.clarify` (même session, Q4 et suivantes).

### Session 2026-07-26

- **Q1 — politique d'accents** (48 des 80 cas identifiants). → **Nom de calque sans accent, accent porté par la description du composant.** Le master s'appelle `Etoile`, sa description porte « Étoile ». Décidé après vérification que la variante inverse (nom accentué + nom technique déclaré ailleurs) est **matériellement impossible sans toucher au dépôt** : le dump ne capture pas les descriptions (`ROUNDTRIP.md` : « Ignored as proposal metadata: version, status, **descriptions**, anchors »), l'extracteur n'offre aucun mécanisme de déclaration d'id depuis le canvas, et **une propriété de composant Figma n'a qu'un seul champ nom** — il n'existe donc aucun second endroit où loger un nom technique pour les 10 props. La décision s'appuie sur du travail déjà fait : la spec 005 a doté **tous** les masters d'une description, le porteur existe déjà.
- **Q2 — tokens d'espacement et de rayon** (193 valeurs sans token). → **Réouverture confirmée, limitée aux canaux qui bloquent l'extraction, avec la valeur exacte observée — plus un engagement écrit à harmoniser dans une itération dédiée.** Le fait nouveau qui rouvre la décision déclinée en spec 003 est mesuré : 58 `itemSpacing` + 22 `padding` non tokenisés bloquent l'extraction. Aucune valeur n'est rapprochée d'un token voisin ici : 0 pixel dans cette itération, les pixels bougeront dans l'itération d'harmonisation, en connaissance de cause.
- **Q3 — les 4 résidus sub-pixel hérités du cycle 14 de la spec 005** (PdE 17 px, PdG 20 px, AP 99 px, CN 469 px). → **Acquittés tels quels comme ligne de base.** Ils sont diagnostiqués, pas inexpliqués : les leviers Figma sont des crans discrets (Light/Regular/Medium/Bold/SemiBold/ExtraBold, letterSpacing idem) et le rendu d'origine du gras partiel tombe entre deux crans ; chaque cran voisin a été **testé et mesuré pire** (Contactez-nous : SemiBold 4401 px, ExtraBold 2399 px, Bold 1596 px → 469 px après ajustement du letterSpacing). Ils représentent 0,0003 à 0,007 % de leur page, en anti-aliasing.
  - **Honnêteté sur les conditions de l'acquittement** : les images de crop de la spec 005 **n'existent plus sur disque** — l'owner a tranché sur la foi du diagnostic écrit, pas d'un ré-examen visuel. Nommé ici, pas présenté comme une validation sur pièces.
  - **Conséquence portée en FR-024** : la spec 007 va lier `fontWeight` (48), `lineHeight` (46) et `fontSize` (5) — **exactement les leviers qui ont produit ces 4 écarts**. Tout mouvement de ces 4 chiffres pendant l'itération doit être signalé, jamais absorbé dans la ligne de base acquittée.
- **Q4 — portée de la preuve pixel** (passe `/speckit.clarify`). Q : les gestes s'exécutant sur les masters (pages DS), l'instrument mesure-t-il ces pages ou seulement les 9 maquettes ? → A : **l'instrument est étendu aux pages DS portant des masters** (`DS · Atomes`, `DS · Molécules`, `DS · Organisms`) : chaque cycle mesure les 9 maquettes **plus** ces pages, verdict N/N. L'« absence de preuve déclarée » ne subsiste que pour l'invisible réel (ex. une variable créée mais non consommée). Les pages DS n'ayant jamais été suivies au pixel, leur ligne de base s'établit au premier relevé de l'itération.
- **Q5 — gouvernance des noms** (passe `/speckit.clarify`). Q : qui arrête chaque nom concret (80 renommages + rôles et primitives neufs) avant exécution ? → A : **une table de nommage complète, validée par l'owner avant toute mutation** — ancien → nouveau pour chaque cas, plus le nom de chaque rôle et primitive à créer — produite comme artefact de la spec et relue en un seul bloc ; l'exécution suit ensuite sans re-validation cas par cas (FR-030, SC-015).
- **Q6 — terminologie « Spec 2 »** (remarque owner, même session). Les renvois « Spec 2 » étaient éparpillés dans tout le corps alors que « Spec 2 » n'est pas un objet de ce dépôt — c'est l'intitulé du document de prépa (« SPEC 2 — Repo : design-to-code »), dont le numéro réel sera attribué à l'ouverture ; `002` est déjà pris par governed-icons. → Corrigé : le corps dit « la spec suivante », et tout ce qui est légué est regroupé dans la section finale **« Prochaines étapes »** — un seul endroit, plus de renvois dispersés.
- **Q7 — page `DS · Tokens`** (passe `/speckit.clarify`). Q : les ~100 variables créées rendront périmée la page de doc canvas `DS · Tokens` (créée en 003) — mise à jour ou dette nommée ? → A : **mise à jour en fin de chantier tokenisation**, comme un cycle à diff annoncé dédié, compté d'avance parmi les cycles annoncés de SC-008 (FR-031, SC-016).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Les noms deviennent des identifiants (Priority: P1)

En tant qu'owner du design system, et au nom de la chaîne d'extraction qui suivra, je veux que **chaque nom de set, de propriété et de calque puisse devenir tel quel un identifiant de code** — sans que l'extracteur ait à le réécrire — afin qu'aucun contrat versionné ne naisse d'un nom inventé par un algorithme de translittération.

**Why this priority**: c'est la classe la plus chère à inverser. Un nom entré dans un contrat adopté *est* un identifiant généré ; le changer ensuite coûte un **bump majeur** par composant touché. Le relevé compte **~78-80 cas** (le dénominateur exact sort du relevé d'ouverture, cf. FR-002), dont 48 sont de purs accidents de translittération que personne n'a choisis — plus les **10 valeurs de variant** que FR-003a rattrape.

**Independent Test**: un nouveau relevé, produit par la même procédure que celui du 2026-07-26, renvoie **0** note des quatre classes « identifiant » (A/B/C/D), sur le dénominateur établi à l'ouverture. Testable seul, sans qu'aucune autre histoire ne soit livrée.

**Acceptance Scenarios**:

1. **Given** les 36 sets dont le nom n'est pas un nom de composant, **When** ils sont renommés, **Then** le relevé n'émet plus aucune note de cette classe, **et** le périmètre de mesure (9 maquettes + pages DS) est identique au pixel.
2. **Given** les sets dont le nom porte des caractères qu'un identifiant ne peut pas transporter (`Étoile`, `Équipe`, `Hero vidéo`, … — 12 selon cette spec, **10** selon le recompte Phase 0, tranché par le relevé d'ouverture), **When** ils sont renommés en ASCII, **Then** l'identifiant proposé par l'extracteur est **exactement** celui que la source annonce (`Etoile` → `etoile`, plus jamais `toile`) — aucune translittération résiduelle — **et** la description du composant porte l'orthographe accentuée.

   2bis. **Given** les 10 **valeurs de variant** non-ASCII (`Défaut`, `Sélectionné`, `Fermé`, … et les 3 valeurs à point médian `·`), **When** elles sont renommées, **Then** chacune est un identifiant légal — vérifié par relevé live, aucune classe du recensement ne les captant (FR-003a).
3. **Given** les 10 propriétés hors identifiant légal (`État`, `Libellé`, …), **When** elles sont renommées en ASCII, **Then** aucune note de cette classe ne subsiste, **et** la limite « une propriété Figma n'a pas de description, l'ASCII est son seul porteur » est nommée au rapport.
4. **Given** les 22 collisions de nom de part au sein d'un même contrat proposé, **When** elles sont résolues, **Then** chaque part d'un contrat porte un nom unique — la contrainte d'unicité est satisfaite **avant** extraction, pas pendant.
5. **Given** les calques nommés d'après leur contenu rédactionnel (des phrases entières qui deviennent des clés d'anatomie), **When** ils sont renommés, **Then** le nom décrit le rôle du calque et un changement de contenu ne le rend plus faux.
6. **Given** un renommage quelconque, **When** la mesure de preuve est prise, **Then** le diff attendu est **0 pixel** ; tout écart non nul déclenche un STOP et l'annulation du geste, jamais une validation au jugé.

---

### User Story 2 - Les valeurs deviennent des tokens (Priority: P1)

En tant qu'owner, je veux que **toute valeur qu'un composant porte sur un canal tokenisable soit portée par une variable**, afin que le contrat extrait porte la valeur et que le code généré la rende — condition sans laquelle aucun diff pixel ne peut être vert.

**Why this priority**: c'est le plus gros poste du relevé (**234 cas**) et il n'était pas anticipé. La chaîne est honnête par construction — l'extracteur **n'invente jamais** une valeur : il la note et propose les tokens les plus proches. Conséquence mécanique : ces valeurs **n'entrent pas dans le contrat**, donc le code généré ne les porte pas, donc le composant est visuellement faux, donc **le compteur pixel de la spec suivante ne peut pas passer**.

**Independent Test**: un nouveau relevé renvoie **0** note « valeur sans token » sur les canaux numériques mesurés (départ : 193), et un relevé live donne **18/18** styles de texte liés **et** marqués (départ : 0/18). La classe « style non dérivé » (41) reste comptée à part : elle est gouvernée par une regex du dépôt, pas par le canvas — voir le re-cadrage de SC-002.

**Acceptance Scenarios**:

1. **Given** la répartition mesurée ci-dessous, **When** la tokenisation est appliquée, **Then** chaque canal retombe à zéro cas sans token :

   | Canal | Cas sans token | Portable par une variable |
   |---|---|---|
   | `itemSpacing` (espacement auto-layout) | **58** | oui |
   | `fontWeight` | **48** | oui |
   | `lineHeight` | **46** | oui |
   | `padding` | **22** | oui, par côté |
   | `strokeWeight` | 9 | oui |
   | `fontSize` | 5 | oui |
   | `cornerRadius` | 3 | oui |
   | `opacity`, `minHeight` | 2 | oui, **mais `opacity` porte une limite reçue** (FR-014) |
   | **Total « valeur sans token »** | **193** | dont **60** sans même un token proche |
   | Style de texte non dérivé d'un token | **41** | propriétés liables individuellement |

2. **Given** les 133 valeurs pour lesquelles un token proche existe, **When** elles sont tokenisées, **Then** la variable porte **exactement** la valeur observée — jamais celle du token voisin — et le diff est de **0 pixel** ; la valeur voisine et l'économie qu'elle représenterait partent au backlog d'harmonisation (FR-013a) au lieu d'être appliquées ici.
3. **Given** les 60 valeurs sans aucun token proche, **When** elles sont traitées, **Then** chacune est portée par une variable créée pour elle, et la création est écrite (quelle valeur, quel usage, combien d'occurrences).
4. **Given** les 18 styles de texte du fichier — complets et bien faits, mais dont **0 sur 18** porte une liaison de variable ou le marqueur d'identité (constat live 2026-07-26) — **When** ils sont traités, **Then** chaque propriété dérive d'une variable, chaque style porte son marqueur, et **aucun style n'est fusionné avec un autre** : deux styles qui diffèrent aujourd'hui restent deux styles, la fusion appartient au backlog d'harmonisation.
5. **Given** que les 8 rôles `typography.*` existent déjà et correspondent par valeur aux 8 premiers styles, **When** les rôles sont posés, **Then** ces 8-là sont **réutilisés tels quels** et seuls les 10 styles restants reçoivent un rôle neuf, nommé d'après leur usage observé.
6. **Given** le canal `opacity` et sa limite reçue (un token 0–1 lié rend sur l'échelle pourcent : 0,5 → 0,5 %, quasi invisible), **When** ce canal est traité, **Then** soit la limite est infirmée par une vérification explicite et la liaison est faite, soit **la limite est nommée au rapport et la valeur littérale conservée** — jamais une liaison posée sans vérifier.
7. **Given** l'ensemble du lot tokenisation, **When** la preuve est prise, **Then** le périmètre de mesure complet (9 maquettes + pages DS de masters) est identique : lier une variable qui porte la valeur déjà rendue ne déplace aucun pixel — y compris sur les masters sans instance dans les maquettes (Checkbox, Étoile, mail, external-link), désormais couverts par la mesure.

---

### User Story 3 - La structure porte une sémantique de layout (Priority: P2)

En tant que futur consommateur du contrat, je veux qu'**aucun nœud structurel ne soit un GROUP** et que **les gabarits partagés se dimensionnent comme la maquette les utilise**, afin que l'extraction sorte des règles de layout et non des positions absolues.

**Why this priority**: sans dépendance sur US1/US2, et le contenu est **déjà écrit** — `BACKLOG-SPEC-006-figma-styles-structure.md` est le cahier de ce chantier. Un GROUP n'a aucune sémantique de layout : l'extracteur sortira des positions absolues sur ces nœuds tant qu'ils restent en GROUP. La cause racine du cas Section-header est prouvée par exécution en 005/L5 : **les enfants FIXED d'une instance ne sont pas redimensionnables via l'API** (limite confirmée, pas un bug de script).

**Independent Test**: le périmètre ne contient plus aucun GROUP structurel et Section-header se dimensionne en FILL avec ses 7 adoptions ; chaque geste mesuré au pixel. **Départ re-relevé, pas recopié** : le cycle 14 (`d8b0d27`) a déjà livré l'essentiel — cette histoire est donc majoritairement une **vérification du fait accompli**, plus 1 GROUP résiduel réel et 2 décisions écrites.

**Acceptance Scenarios**:

1. **Given** le master Section-header (Accroche `2090:2386` + Titre `2090:2387`), **When** son dimensionnement est vérifié en direct, **Then** il est en FILL et l'adoption est en place sur les 7 titres faits main (Coordonnées, Formulaire, Présentation, Texte SEO, Hero, SAV, Réalisations/Bloc en-tête) — **le cycle 14 l'a déjà livré**, le « FIXED 1550 » du backlog est périmé. Si la vérification infirme le constat, la bascule redevient un geste à exécuter, mesuré au pixel.
2. **Given** que ce master est instancié **×3 dans Réassurances**, **When** la bascule est faite, **Then** la cascade est mesurée par un cycle pixel dédié avant/après sur les 3 instances — pas un contrôle global qui la noierait.
3. **Given** les GROUPs structurels du périmètre — les 11 du backlog (SAV ×4, Texte SEO ×3, Produits e-commerce ×1, Footer ×3) **déjà dé-groupés au cycle 14**, plus le résiduel réel `Header + Hero + Cat` (`237:970`) —, **When** le relevé d'ouverture les recompte et le résiduel est traité, **Then** aucun ne subsiste et les maquettes qui les portent sont identiques au pixel.
4. **Given** les styles restants sous le seuil d'externalisation (Hero vidéo Regular 44 ×1, Nav-item Medium 16/lh16 ×1), **When** la règle owner en vigueur (≥2 occurrences, 2026-07-25) leur est appliquée, **Then** la décision est **écrite** pour chacun — externaliser, laisser, ou fusionner — et non laissée implicite.
5. **Given** les 3 textes Field Regular 14 / interligne AUTO, candidats au lien vers le style Paragraphe lh24, **When** le cas est tranché, **Then** le choix est écrit ; **et si le choix déplace des pixels, il est traité comme un geste visuel assumé** — annoncé avant, isolé dans son cycle, montré sur crop.
6. **Given** un dé-groupage quelconque, **When** il est exécuté, **Then** la capture avant existe pour **chaque** cible concernée — pas un sous-ensemble pilote (règle before-capture, leçon Gallery-item).

---

### User Story 4 - Le relevé de sortie fait foi, et la dette restante est nommée (Priority: P3)

En tant qu'owner qui devra décider d'ouvrir la spec suivante, je veux que **la clôture porte un relevé mesuré et reproductible**, et que **toute dette qui survit soit nommée une par une**, afin qu'aucune dette ne soit héritée en silence par la spec suivante.

**Why this priority**: la valeur n'est pas dans le geste mais dans la preuve — c'est la condition de sortie de l'itération, et le seul endroit où une exception assumée survit à la session qui l'a assumée. Précédent direct : la spec 005 a légué **4 divergences** (Bouton, `octicon:chevron-down-12`, Checkbox sans usage, Étoile/mail/external-link sans usage) qui ne figurent dans le document d'aucune spec suivante — exactement la fuite que cette histoire ferme.

**Independent Test**: la procédure du relevé, rejouée par un tiers à partir du seul rapport de clôture, reproduit les compteurs annoncés.

**Acceptance Scenarios**:

1. **Given** la procédure de relevé documentée, **When** elle est rejouée en clôture, **Then** les compteurs annoncés sont reproduits, et la procédure elle-même est écrite au rapport — reproductible sans la session qui l'a produite.
2. **Given** les 55 masters, **When** le relevé de clôture est pris, **Then** ils proposent toujours **55 contrats valides pour le schéma** — aucun geste de cette itération n'a fait régresser la validité.
3. **Given** une exception ouverte par cette itération (limite technique nommée, geste visuel assumé, cas volontairement non traité), **When** la clôture est écrite, **Then** elle figure nommément avec sa raison et son destinataire — jamais un compteur arrondi ni un silence.
4. **Given** les 4 divergences léguées par la spec 005, **When** la clôture est écrite, **Then** elles figurent nommément dans la dette léguée (→ Prochaines étapes) — la spec suivante ne peut plus les découvrir par accident.
5. **Given** l'ensemble de l'itération, **When** le diff de la branche est examiné, **Then** il ne contient que des artefacts sous `specs/007-figma-extractable-source/` — aucune modification de code, de contrat ou de token.

---

### Edge Cases

- **Un renommage casse une référence.** Un master renommé est référencé ailleurs par son nom (script, contrat adopté, ancrage d'instance) → l'ancrage doit être vérifié **avant** le geste. Précédent 005 : aucun script du dépôt ne cible une page par son nom, et l'ancre du Bouton est `componentSetKey` + `nodeId`, deux identifiants qui survivent au renommage. Ce contrôle est **refait**, pas supposé.
- **Un renommage rend faux un contrat déjà adopté.** 5 contrats sont adoptés (Bouton, Checkbox, Input, Select, Textarea). Renommer leur source crée une divergence contrat ↔ canvas. Précédent 005, reconduit : **la source est corrigée, le contrat reste en l'état, la divergence est nommée au rapport et réparée par la spec suivante** (bump majeur assumé là-bas — → Prochaines étapes). Le dépôt n'est pas modifié ici.
- **Éditer un master efface les overrides de ses instances.** Piège vérifié en 005/cycle 14 : contenu, taille et alignement d'instance peuvent être écrasés par une liaison posée sur le master. Toute passe sur un master instancié exige la vérification des **instances** après coup, pas seulement du master.
- **Une valeur observée n'a aucun token proche** (60 cas) → une variable est créée pour elle. Ce qu'on ne fait **jamais**, c'est la rapprocher d'un token voisin pour économiser une variable : ce serait un changement de design déguisé.
- **Un canal se révèle non liable en pratique** malgré la capacité annoncée (cas `opacity`) → la limite est nommée et la valeur littérale conservée ; le compteur de sortie porte l'exception au lieu de la masquer.
- **Un geste ne peut pas être prouvé à 0 pixel** parce que sa cible n'a aucun rendu visible — ni sur les 9 maquettes, ni sur les pages DS désormais mesurées (ex. une variable créée non consommée, une description de composant) → l'absence de preuve est déclarée comme telle, jamais convertie en « identique ».
- **Deux écritures simultanées sur le canvas** : plusieurs écrivains sont autorisés sur des zones **disjointes**, avec un seul cycle global de vérification pixel autour du lot, tenu par l'orchestrateur.

---

## Requirements *(mandatory)*

### Chantier 1.1 — Les identifiants (80 cas)

- **FR-001**: Chaque set de composants du périmètre MUST porter un nom que la chaîne d'extraction accepte tel quel comme nom de composant, sans réécriture (36 cas au départ).
- **FR-002**: Un nom de set MUST NOT porter un caractère qu'un identifiant de contrat ne peut pas transporter. **Le compte de départ est celui du relevé d'ouverture, pas celui écrit ici** : cette spec avait posé 12, la Phase 0 a recompté **10** (`plan.md` Scale/Scope, `contracts/note-census.md` §8). L'écart est à instruire au relevé (second site d'émission possible, `core/propose-figma.ts` l. 2214) et à consigner ; il ne change pas le critère, qui est **zéro à l'arrivée**.
- **FR-003**: Chaque nom de propriété de composant MUST être un identifiant légal, sans caractère strippé à la proposition (10 cas au départ).
- **FR-003a**: Chaque **valeur de variant** MUST être un identifiant légal, sans caractère hors ASCII ni séparateur typographique (10 cas au départ : `Défaut` ×2, `Sélectionné`, `Fermé`, `Présentation`, `Réassurance`, `Catégorie`, plus 3 valeurs à point médian `·`). Cette classe n'était couverte par aucune exigence — FR-002/FR-003/FR-006 couvrent sets, propriétés et calques — alors que le document de prépa la chiffre au **même bump majeur** que les autres (précédent « Outilne noir »). Elle est traitée dans la table de nommage au même titre. **Aucune classe du recensement ne la capte** (`contracts/note-census.md` §4) : son reçu est un **relevé live**, pas le compteur de notes.
- **FR-004**: Deux parts d'un même contrat proposé MUST NOT porter le même nom (22 collisions au départ).
- **FR-005**: Un calque du périmètre MUST NOT être nommé d'après son contenu rédactionnel ; son nom MUST décrire le rôle du calque. **Cette classe n'a pas de compte de départ et aucune classe du recensement ne la capte** : le relevé d'ouverture MUST donc produire son propre dénominateur — le nombre de calques dont le nom est égal (ou inclus) au contenu texte du calque — sans quoi « traité » n'est pas définissable (SC-017).
- **FR-006**: Un nom de calque, de set ou de propriété MUST NOT porter d'accent ni de caractère hors ASCII. Le nom porté par le canvas devient l'identifiant tel quel : `Étoile` → `Etoile`, `Équipe` → `Equipe`, `Hero vidéo` → `Hero video`, `État` → `Etat`, `Libellé` → `Libelle`.
- **FR-006a**: La description du composant MUST porter l'orthographe française accentuée du nom. Le français reste lisible dans le fichier (la description s'affiche dans le panneau Assets) sans passer par un identifiant que le code ne peut pas transporter. Le porteur existe déjà : la spec 005 a doté tous les masters d'une description.
- **FR-006b**: Pour les **10 propriétés de composant**, l'orthographe sans accent est le **seul** porteur — une propriété Figma n'a pas de champ description. L'orthographe française, quand elle porte du sens, MUST être consignée dans la description du composant qui porte la propriété. Cette limite MUST être nommée au rapport de clôture plutôt que découverte plus tard.
- **FR-007**: Toute correction de nom MUST vérifier au préalable qu'aucune référence externe (script, contrat adopté, ancrage d'instance) ne dépend du nom remplacé.
- **FR-008**: Un renommage qui rend faux un contrat déjà adopté MUST être exécuté quand même côté source, la divergence résultante étant nommée au rapport de clôture et portée à la dette léguée (→ Prochaines étapes) — le dépôt n'est pas modifié pour la suivre.

### Chantier 1.2 — Les valeurs sans token (234 cas)

- **FR-009**: Chaque valeur observée sur les canaux `itemSpacing`, `padding`, `strokeWeight`, `cornerRadius`, `fontSize`, `fontWeight`, `lineHeight`, `minHeight` MUST être portée par une variable, de sorte que le relevé n'émette plus de note « valeur sans token » sur ces canaux (193 cas au départ).
- **FR-009a**: Toute variable créée MUST suivre la convention de nommage déjà en place dans `tokens/` — **primitives** (`font.size.*`, `font.weight.*`, `font.line-height.*`, `space.*`) et **rôles sémantiques** (`typography.<rôle>.{family,size,weight,line-height}`) aliasant les primitives. Objectif : que la promotion ultérieure de ces valeurs vers le dépôt (→ Prochaines étapes) soit une **copie**, pas une traduction — et que l'upsert du générateur mette à jour les variables au lieu d'en créer des doublons.
- **FR-010**: Les **18 styles de texte du fichier** MUST voir leurs propriétés (famille, taille, graisse, interligne, interlettrage) **liées à des variables**. Constat live du 2026-07-26 : les 18 styles existent, sont complets et bien faits, mais **0 sur 18 porte la moindre liaison** — tout est en valeur littérale. C'est la classe « style de texte non dérivé d'un token » du relevé.
- **FR-010a**: Les rôles sémantiques MUST **étendre les 8 rôles `typography.*` existants** (`titre-1` … `titre-6`, `paragraphe`, `lead`), jamais repartir d'une taxonomie neuve. Ces 8 rôles existent déjà dans `tokens/semantic.tokens.json` et correspondent par valeur aux 8 premiers styles du fichier. Les 10 styles restants (Titre Hero, Libellé bouton, Paragraphe gras, Accroche, Onglet, Titre 2/3 majuscules, Titre Hero vidéo, Libellé nav, Note de champ) reçoivent un rôle nommé d'après **leur usage observé**, jamais d'après une hiérarchie idéale.
- **FR-010b**: Les gammes de primitives manquantes MUST être complétées avec les valeurs réellement observées : `font.line-height.*` (une seule primitive aujourd'hui — 22px — pour 46 cas sans token) et `font.weight.*` (regular/medium/semibold aujourd'hui ; le fichier utilise aussi Bold). L'essentiel du chantier typo est **deux gammes de primitives à compléter**, pas des rôles à inventer.
- **FR-010c**: Chaque style de texte MUST recevoir le marqueur d'identité `ds_contracts/textStyleToken` portant son chemin de token. Sans lui, le générateur ne reconnaît pas les styles faits main et en **créerait 18 doublons** à côté lors de la première génération — vérifié live : 0 sur 18 porte ce marqueur aujourd'hui.
- **FR-012**: Les tokens d'espacement et de rayon, **déclinés en spec 003**, sont **rouverts** sur la base du fait nouveau mesuré (58 `itemSpacing` + 22 `padding` non tokenisés bloquent l'extraction). La réouverture MUST rester **limitée aux canaux qui bloquent** — elle n'autorise pas la construction d'une famille space/radius complète au passage.
- **FR-013**: **La règle de la valeur exacte — énoncée ici et nulle part ailleurs.** Chaque variable créée, et chaque liaison posée, MUST porter **exactement la valeur observée**. Une valeur MUST NOT être alignée sur une échelle, arrondie, ni rapprochée d'un token voisin dans cette itération, quel qu'en soit le motif — y compris « économiser la création d'une variable ». Tout écart MUST être annoncé **avant** exécution et validé : un écart non annoncé est un changement de design, interdit par le périmètre. Le verdict attendu reste 0 pixel sur tout le chantier tokenisation.
- **FR-013a**: Le rapport de clôture MUST produire le **backlog d'harmonisation** — la liste des valeurs qui se regrouperaient sur une échelle, le nombre de variables que cela économiserait, et le coût pixel estimé par maquette. Sans ce livrable, l'engagement « harmoniser plus tard » n'a pas de porteur et disparaît.
- **FR-014**: Le canal `opacity` MUST être vérifié avant liaison — une limite reçue du dépôt indique qu'un token 0–1 lié rend sur l'échelle pourcent. Si la limite tient, la valeur littérale MUST être conservée et la limite nommée au rapport.
- **FR-015**: *Consolidé dans FR-013* — conservé comme ancre pour les renvois existants (`data-model.md`, `tasks.md`). Complément non normatif utile à l'exécution : `contracts/note-census.md` §5 établit qu'il n'existe **aucun mécanisme d'arrondi dans l'outil** (`suggestFor` = lookup de valeur strictement identique, ni distance ni seuil). Un rapprochement ne peut donc pas arriver par accident — ce serait un geste manuel délibéré, invisible au compteur et visible au pixel.
- **FR-031**: La page `DS · Tokens` (créée en 003 pour documenter les variables sur le canvas) MUST être mise à jour **en fin de chantier tokenisation** pour refléter l'état final des variables (gammes complétées, rôles posés, variables créées). Le geste est un **cycle à diff annoncé dédié** — compté d'avance parmi les cycles annoncés de SC-008, capture avant/après de la page à l'appui (FR-022) — jamais fondu dans un cycle 0 pixel.

### Chantier 1.3 — La structure (backlog déjà écrit)

- **FR-016**: Le master Section-header MUST se dimensionner en FILL, l'adoption étant faite sur les 7 titres faits main listés au backlog. **Re-cadré après vérification live (Phase 0, O4)** : le cycle 14 post-clôture 005 (`d8b0d27`) a **déjà livré** la bascule FILL et les 7 adoptions ; le « FIXED 1550 » du backlog est **périmé d'un cycle**. Cette exigence est donc tenue en **vérification-seulement** — le relevé d'ouverture MUST la confirmer par lecture directe des nœuds `2090:2386` / `2090:2387`, et consigner le fait accompli. Si la vérification infirme le constat, l'exigence redevient un geste à exécuter.
- **FR-017**: La cascade sur les 3 instances de Section-header dans Réassurances MUST être mesurée par un cycle pixel dédié avant/après.
- **FR-018**: Aucun GROUP structurel MUST NOT subsister dans le périmètre. **Re-cadré après vérification live (Phase 0, O4)** : les 11 GROUPs listés au backlog du 2026-07-25 (SAV ×4, Texte SEO ×3, Produits e-commerce ×1, Footer ×3) ont **déjà été dé-groupés** au cycle 14 (`d8b0d27`) — le compte « 11 » est **périmé**. Reste **1** GROUP structurel réel, `Header + Hero + Cat` (`237:970`, page Portes d'entrée). Hors périmètre par nature et à ne pas compter : les groupes vectoriels (`Tracé composé`, `Texte`, internes aux icônes et à `piqueray_logo`) et les 5 `Avis Google` (branche `006-google-reviews-block`). Le relevé d'ouverture fait autorité sur ce compte, jamais le backlog.
- **FR-019**: Le sort des styles restants sous le seuil d'externalisation MUST être écrit pour chacun, y compris le cas des 3 textes Field à interligne AUTO — dont la résolution peut être un geste visuel assumé plutôt qu'un 0 pixel.

### Preuve, cadence et honnêteté (transverse)

- **FR-020**: Chaque geste MUST être mesuré par l'instrument de parité de page sur **l'intégralité du périmètre de mesure : les 9 maquettes plus les pages DS portant des masters** (`DS · Atomes`, `DS · Molécules`, `DS · Organisms`) ; le verdict attendu par défaut est **N/N identiques** sur ce périmètre. Les pages DS, jamais suivies au pixel jusqu'ici, établissent leur ligne de base au premier relevé de l'itération.
- **FR-021**: Tout diff pixel non nul MUST être annoncé **avant** exécution, isolé dans son propre cycle, montré sur crop et validé par l'owner — jamais présenté comme du bruit de rendu ni validé au jugé.
- **FR-022**: Avant toute mutation, la capture de l'état antérieur MUST exister pour **chaque** cible qui sera touchée — pas un sous-ensemble pilote — et chaque capture MUST être vérifiée non vide et correctement dimensionnée.
- **FR-023**: Une version Figma nommée MUST être sauvegardée avant chaque passe importante ; aucun retour arrière rétroactif sur le fichier live n'est autorisé pour combler une preuve manquante après coup.
- **FR-024**: La ligne de base pixel est **acquittée en l'état** : les 4 résidus hérités du cycle 14 de la spec 005 (Portes d'entrée 17 px, Portes de garage 20 px, À Propos 99 px, Contactez-nous 469 px, tous sur le titre de section) sont acceptés comme état de départ. Aucun cycle d'investigation préalable n'est ouvert.
- **FR-024a**: Ces 4 valeurs MUST être relevées avant le premier geste et suivies pendant l'itération. La spec 007 lie `fontWeight`, `lineHeight` et `fontSize` — **les leviers mêmes qui ont produit ces écarts** : tout mouvement de ces 4 chiffres MUST être signalé et expliqué, jamais absorbé dans la ligne de base acquittée. Une amélioration comme une aggravation est un fait à rapporter.
- **FR-025**: L'itération MUST NOT modifier le dépôt hors ses propres artefacts sous `specs/007-figma-extractable-source/`. La production d'un relevé de mesure est autorisée ; sa sortie n'est pas committée.
- **FR-026**: Le rapport de clôture MUST porter, par geste, l'avant/après et une explication courte, et MUST nommer une par une toutes les exceptions survivantes.
- **FR-027**: Le rapport de clôture MUST reporter explicitement à la dette léguée (→ Prochaines étapes) les 4 divergences héritées de la spec 005 (Bouton, `octicon:chevron-down-12`, Checkbox sans usage, Étoile/mail/external-link sans usage) et toute divergence contrat ↔ canvas ouverte par cette itération.
- **FR-027a**: Le rapport de clôture MUST porter à la dette léguée (→ Prochaines étapes) les **5 trous d'émetteur** constatés pendant la rédaction de cette spec et sa Phase 0 — chacun est du travail dépôt, donc hors périmètre ici, et chacun se re-découvrirait au pire moment :
  1. `deriveTextStyles()` cherche `font.<groupe>.size` alors que la convention Piqueray est `typography.<rôle>.size` → la regex ne matche jamais, **`TEXT_STYLES = []`** : le générateur ne produit aucun style de texte pour ce jeu de tokens.
  2. Le style de texte généré ne porte **pas l'interligne** (`name`, `fontName`, `fontSize` seulement) — alors que les 18 styles du fichier en portent un.
  3. Le générateur écrit `s.fontSize = <littéral>` au lieu d'une liaison de variable → **un mode de variable ne traverserait pas le style**. C'est le blocage direct de tout futur axe mobile.
  4. Une collection Figma n'a qu'un seul axe de modes : un axe viewport exigerait sa **propre collection**, que le générateur ne sait pas créer. Sans objet aujourd'hui (mono-marque, mono-thème), nommé avant de mordre.
  5. *(trouvé en Phase 0, R9)* `core/emit-figma-script.ts` l. 664 appelle `loadFontAsync('Inter')` **en dur** — la famille du fichier Piqueray est Montserrat. Toute génération de style de texte chargerait la mauvaise fonte. Corollaire du trou n° 1, et plus profond qu'une regex : même corrigée, les noms dérivés seraient `titre-1` / `paragraphe` / `lead`, qui ne correspondent pas aux noms des styles Figma (`Titre 1`, `Paragraphe`, `Lead`).
- **FR-027b**: Le rapport de clôture MUST porter à la dette léguée (→ Prochaines étapes) le fait que **les 5 contrats adoptés lient des primitives directement** (`{font.size.14}`, `{font.weight.regular}`, `{font.family.montserrat}`, `{font.line-height.22}`) et **aucun rôle sémantique** — alors que les 8 rôles `typography.*` existent et n'ont aucun consommateur. Le re-pointage est un changement de contrat, donc du travail dépôt pour la spec suivante.
- **FR-028**: La procédure du relevé MUST être écrite au rapport de manière reproductible par un tiers.
- **FR-029**: Si plusieurs écrivains opèrent sur le canvas en parallèle, leurs zones MUST être disjointes, et un seul cycle global de vérification pixel MUST encadrer le lot.
- **FR-030**: Un renommage (chantier 1.1) comme une création de variable ou de rôle (chantier 1.2) MUST NOT être exécuté avant validation owner d'une **table de nommage complète** : ancien nom → nouveau nom pour chaque cas du relevé, plus le nom de chaque rôle et primitive à créer. La table est produite comme artefact sous `specs/007-figma-extractable-source/` et relue en un seul bloc ; une fois validée, l'exécution suit sans re-validation cas par cas.

### Key Entities

- **Le relevé** — la mesure de référence : les 55 masters passés à la chaîne d'extraction, dont la sortie est un jeu de contrats proposés plus des notes classées. Les **classes de notes** sont l'unité de compte de cette spec (identifiant, valeur sans token, style non dérivé).
- **Le master** — un set de composants du fichier live. Porte un nom (futur identifiant), des propriétés (futurs props), des parts nommées (future anatomie) et des valeurs sur des canaux tokenisables.
- **La variable / le token** — le porteur d'une valeur. Une valeur liée entre dans le contrat ; une valeur en dur n'y entre pas.
- **Le cycle de preuve** — un geste ou un lot cohérent, encadré par une capture avant sur **toutes** ses cibles et une mesure après sur le périmètre de mesure complet (9 maquettes + pages DS de masters), avec un verdict N/N.
- **L'exception nommée** — une limite technique, un geste visuel assumé ou un cas non traité, qui survit à la clôture avec sa raison et son destinataire.
- **La dette léguée** — une divergence connue transmise nommément à la spec suivante.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un relevé de clôture, produit par la procédure documentée, renvoie **0** note des quatre classes « identifiant » (A/B/C/D). Le dénominateur de départ est celui du **relevé d'ouverture**, pas un chiffre figé ici : la Phase 0 recompte 36 + **10** + 10 + 22 = **78** là où cette spec avait écrit 80 (classe B, cf. FR-002). Le critère est le zéro d'arrivée ; l'écart de dénominateur est instruit et consigné, jamais lissé.
- **SC-002**: Le même relevé renvoie **0** note « valeur sans token » sur les canaux **numériques** mesurés — départ : **193**. Toute exception restante est nommée et comptée à part, jamais fondue dans le zéro.
  - **Re-cadrage acté (Phase 0, O2 / R9 / `contracts/note-census.md` §6)** : le volet « 0 style de texte non dérivé d'un token — départ 41 » **sort de ce critère**. Ce compteur est gouverné par la regex `/^font\.(.+?)\.size/` de `core/token-corpus.ts` face à une convention `typography.<rôle>.size` : il se déclenche pour tout texte portant un style nommé **quel que soit l'état du canvas**, et aucune action canvas ne le déplace d'une unité. L'atteindre exigerait une édition dépôt que FR-025 interdit. Les **41** sont donc une **limite nommée**, comptée à part et léguée avec le trou d'émetteur n° 1 (FR-027a, SC-014). Le reçu réel du lot typographique est **SC-013**.
- **SC-003**: Aucun identifiant proposé par l'extraction ne diffère du nom porté par la source : le nombre de translittérations est **0** — départ : 48 noms réécrits sans que personne ne l'ait choisi.
- **SC-004**: Les 55 masters proposent toujours **55 contrats valides pour le schéma** — la validité ne régresse pas (départ : 55/55).
- **SC-005**: **0** collision de nom de part au sein d'un même contrat proposé — départ : 22.
- **SC-006**: **0** GROUP structurel dans le périmètre, et Section-header se dimensionne en FILL avec ses 7 adoptions en place. **Départ re-relevé, pas recopié** (O4) : le backlog du 2026-07-25 disait 11 GROUPs et « FIXED 1550 » ; le cycle 14 (`d8b0d27`) les a déjà traités. Le compte de départ opposable est celui du relevé d'ouverture — attendu **1** GROUP structurel résiduel (`Header + Hero + Cat`, `237:970`), hors groupes vectoriels et hors `Avis Google`.
- **SC-007**: Chaque geste dispose d'une capture avant pour **100 %** de ses cibles, vérifiée non vide et correctement dimensionnée, avant que la mutation ne commence.
- **SC-008**: Le verdict pixel de chaque cycle couvre les **43 cibles** (9 maquettes + pages DS de masters) et vaut **43/43 identiques — relativement à la capture avant de ce même cycle**, qui est la seule chose que l'instrument mesure (il ne garde aucune baseline, `contracts/proof-cycle.md` §7). Deux retraits nommés, jamais silencieux : les cibles DS dont l'étalonnage d'ouverture révèle un plancher de bruit non nul, et les **cycles à diff annoncé**, dont le nombre est fixé d'avance à **1** (la page `DS · Tokens`, FR-031), plus **au plus 1** conditionnel si la décision FR-019 sur les 3 textes Field déplace des pixels — auquel cas il est déclaré avant exécution, isolé, montré sur crop et validé.
- **SC-008a**: Les 4 résidus acquittés (17 / 20 / 99 / 469 px) sont **figés en ligne de base à l'ouverture depuis leur source d'origine** — le verdict avant/après du cycle 14, `specs/005-figma-source-cleanup/proofs/fix-post-cloture/verdict.json` — et **non re-mesurés** : un étalonnage (double capture d'un fichier inchangé) rend 0 partout, et l'état pré-cycle-14 n'existe plus en capture. Ce qui est suivi : **tout diff non nul** apparaissant sur ces 4 pages dans un cycle de l'itération, signalé et expliqué — **0** absorbé en silence dans la ligne de base.
- **SC-009**: Le diff de la branche ne touche **aucun** fichier hors `specs/007-figma-extractable-source/`, à **une exception nommée d'avance** : les deux lignes « Active Technologies » que `/speckit.plan` ajoute automatiquement à `CLAUDE.md` (comportement standard du workflow, précédents 003 et 005 committés). SC-009 gouverne les **gestes de l'itération** — canvas, contrats, tokens, code généré — pas les artefacts du workflow de spécification. Toute autre modification est une régression.
- **SC-010**: **100 %** des exceptions survivantes et des dettes léguées sont nommées au rapport de clôture, y compris les 4 divergences héritées de la spec 005 — aucune n'est découverte par accident par la spec suivante.
- **SC-011**: La procédure du relevé, rejouée à partir du seul rapport de clôture, reproduit les compteurs annoncés.
- **SC-012**: Le backlog d'harmonisation existe au rapport de clôture et il est **chiffré** : combien de valeurs se regrouperaient, combien de variables cela économiserait, quel coût pixel par maquette.
- **SC-013**: **18/18 styles de texte** portent une liaison de variable sur chacune de leurs propriétés **et** le marqueur d'identité `ds_contracts/textStyleToken` — départ mesuré en direct le 2026-07-26 : **0/18** sur les deux compteurs. Aucun style n'a été fusionné avec un autre en cours de route. Vérifié par relevé live (`getLocalTextStylesAsync`), pas par le compteur de notes.
- **SC-014**: Les **5 trous d'émetteur** et le re-pointage des 5 contrats vers les rôles sémantiques figurent nommément dans la dette léguée (→ Prochaines étapes).
- **SC-015**: La table de nommage validée par l'owner existe comme artefact de la spec **avant le premier geste**, et **100 %** des noms appliqués sur le canvas correspondent à leur ligne — **0** nom appliqué hors table.
- **SC-016**: À la clôture, la page `DS · Tokens` reflète l'état final des variables — **0** variable créée par l'itération absente de la page — et sa mise à jour figure comme cycle à diff annoncé, montré sur crop et validé.
- **SC-017**: **0** calque du périmètre nommé d'après son contenu rédactionnel, sur un dénominateur **établi par le relevé d'ouverture** (FR-005). Aucune classe du recensement ne captant ce défaut, le reçu est un relevé live comparant nom de calque et contenu texte, pris à l'ouverture et à la clôture.
- **SC-018**: **N/N masters** portent la description accentuée prévue par la table de nommage (FR-006a), et les propriétés dont l'orthographe française porte du sens sont consignées dans la description du composant qui les porte (FR-006b). Vérifié par relevé live — le dump **ignore les descriptions** (`ROUNDTRIP.md`), donc le compteur de notes ne peut structurellement pas le prouver ; la limite propre aux propriétés est nommée au rapport.

---

## Hors périmètre

Écarté explicitement — chaque ligne porte sa raison :

- **Exposer les props sur les masters.** Ajouter une prop est un bump **mineur** : l'adoption d'un contrat n'a pas à l'attendre. Un composant peut être adopté figé puis gagner ses props en vague suivante. → dette léguée (→ Prochaines étapes), choix de rythme.
- **Tout changement de design** (contrastes, tailles, espacements harmonisés) — règle de la spec 005 reconduite. Seules exceptions : les gestes visuels annoncés avant exécution et validés sur crop.
- **Toute écriture dans le dépôt** hors les artefacts de cette spec : aucun contrat, aucun token, aucun code.
- **Le rich-text** (gras au milieu d'une phrase, 6 textes) — item 3 du backlog. Le schéma n'a aujourd'hui aucun modèle de plages ; c'est un ajout schéma + émetteur + extracteur, donc un chantier dépôt. → dette léguée (→ Prochaines étapes, item B1).
- **La copie complète de la maquette Accueil posée sur `DS · Organisms`** (`2121:5168`) — décision owner du 2026-07-25 : **laisser en l'état**. Elle fausse les comptages fichier-entier ; sa suppression exigerait de vérifier la survie des instances qui en dépendent.
- **Les zéro-usage à trancher** (Checkbox, Étoile, mail, external-link) — question de gouvernance héritée de la clôture 005. Cette itération les **nomme** (FR-027) mais ne les tranche pas (→ Prochaines étapes).
- **Nav-item — soulignement actif et lien de couleur dans le contrat** — item 7 du backlog, explicitement reporté à l'extraction du futur contrat Header. → dette léguée (→ Prochaines étapes).
- **Les pages.** L'assemblage des sections n'est pas un composant : ni le differ ni le pixel ne le couvrent, avant comme après.
- **Le responsive / un axe mobile.** Trois raisons, pas une : (1) **il n'y a aucune maquette mobile dans le fichier** — les valeurs seraient inventées, pas extraites ; (2) le schéma n'a aucun vocabulaire responsive, `@media` / `@container` sont classés « code seulement » ; (3) le générateur écrit les tailles de style en **littéral** et non en liaison de variable — un mode ne les traverserait pas (FR-027a, trou n° 3). Ce que cette itération fait quand même : lier les styles à des variables sémantiques, c'est-à-dire poser **exactement** la structure qu'un axe mobile exigera le jour où il arrivera. La porte est préparée, elle n'est pas ouverte.
- **Le bloc Google reviews** (branche `006-google-reviews-block`) — ne relève ni de cette spec ni de la spec suivante ; son worktree est 16 commits en retard.

---

## Assumptions

- **Périmètre du relevé = les 55 masters**, pas les 9 maquettes d'assemblage. Le relevé du 2026-07-26 a été pris sur les masters ; les chiffres de cette spec s'entendent donc au niveau des masters. Les maquettes n'interviennent que comme **instrument de mesure**, aux côtés des pages DS depuis Q4 (le verdict N/N).
- **Les canaux mesurés sont tous portables par une variable**, vérifié dans `docs/FIGMA-CAPABILITY-MATRIX.md`. Seule réserve : `opacity`, qui porte une limite reçue du dépôt — traitée par FR-014 plutôt que supposée résolue.
- **Le paquet typographique est un STYLE DE TEXTE, pas une variable.** Une variable Figma est scalaire (nombre, couleur, chaîne, booléen — aucun type composite) ; le style de texte est l'objet qui assemble famille + taille + graisse + interligne + interlettrage + casse, et c'est lui qu'on applique à un calque. Les 18 styles du fichier sont donc **le bon objet, déjà en place** : il leur manque uniquement les liaisons et le marqueur. L'espacement de mise en page (gap, padding auto-layout) ne fait pas partie d'un style de texte et reste porté par le cadre parent — deux chantiers distincts, jamais fusionnables.
- **La conduite est celle de la spec 005**, reconduite sans la réécrire : 0 pixel par défaut, tout diff annoncé avant / isolé / montré sur crop, capture avant exhaustive, version Figma sauvegardée par passe, aucun rollback rétroactif. **Deux choses distinctes, à ne pas confondre** : (a) le **plancher de bruit de l'instrument**, mesuré par double capture d'un fichier inchangé, est **connu nul** sur les 9 maquettes depuis l'étalonnage 003 (9/9) — tout plancher non nul y est une régression et un STOP programme ; (b) les **4 résidus acquittés** (FR-024) sont un écart avant/après du cycle 14 de la spec 005, figé depuis son verdict d'origine, **ni re-mesurable ni attendu dans un étalonnage**. Côté pages DS, nouvellement entrées dans le périmètre de mesure (Q4), le plancher est inconnu et s'établit au premier relevé de l'itération ; une cible DS bruitée sort du verdict nommément.
- **Le nommage français ne disparaît pas, il change de porteur.** La décision owner de la spec 003 (nommage français, cohérence Checkbox) tenait sur le nom de calque ; elle tient désormais sur la **description** du composant. Ce n'est pas une régression vers l'anglais : c'est le même français, déplacé vers le seul champ que l'extraction ignore et qu'un humain lit. À ne pas re-dériver comme un abandon.
- **Le chantier tokenisation est intégralement 0 pixel sur les composants.** Conséquence directe de la valeur exacte (FR-013) : aucun cycle à diff annoncé n'est attendu sur les masters ni les maquettes en US2 — un diff non nul y est un signal, pas un arbitrage. **Unique exception, connue d'avance** : la mise à jour de la page `DS · Tokens` (FR-031), un cycle à diff annoncé qui touche la documentation canvas, pas les composants.
- **L'accès au fichier live passe par le pont desktop.** Le jeton d'API en lecture est absent de l'environnement (point 4 de la liste « à régler ») ; cette spec suppose que la voie pont suffit, comme en 003 et 005.
- **La condition de sortie est un zéro mesuré, pas jugé.** Une exception ne réduit pas le compteur : elle est comptée à part et nommée. C'est la convention d'honnêteté du dépôt — la dégradation est nommée, jamais silencieuse.
- **Aucun compteur n'est figé en prose** — y compris ceux de cette spec. Les chiffres de départ (193, 41, 55) datent du relevé du 2026-07-26 ; **trois ont déjà été démentis par la Phase 0** et sont remplacés par le relevé d'ouverture : la classe B (12 → **10**), le total identifiants (80 → **78**), et les GROUPs structurels (11 → **1** résiduel, les autres traités au cycle 14). Le relevé d'ouverture fait autorité sur les chiffres de départ, le relevé de clôture sur ceux d'arrivée.
- **Le `RAPPORT-CLOTURE.md` de la spec 005 est périmé d'un cycle** (annonce 13 cycles au lieu de 14, donne pour ouvertes des divergences closes au cycle 14). Cette spec ne s'appuie pas dessus pour ses faits : elle s'appuie sur le backlog et sur le relevé. Sa remise à jour est un chantier de documentation distinct.
- **La numérotation 007 est délibérée** : `006` reste attribuée à `006-google-reviews-block`.

---

## Prochaines étapes — tout ce que cette spec lègue, en un seul endroit

La spec d'après est celle que le document de prépa (`PREPA-2-SPECS-SUIVANTES.md`) appelle « SPEC 2 — Repo : design-to-code » : les 55 masters transformés en contrats adoptés et en code généré, chaque composant prouvé par le differ et par le pixel. **Elle n'existe pas encore dans le dépôt et recevra son numéro réel à l'ouverture** (`002` est déjà pris par governed-icons). Le corps de la présente spec dit donc « la spec suivante », et tous les legs sont regroupés ici — nulle part ailleurs.

Le rapport de clôture reprend cette liste item par item (FR-026/FR-027) ; rien ne se lègue en dehors d'elle :

1. **Les divergences contrat ↔ canvas ouvertes par les renommages** des 5 masters adoptés (Bouton, Checkbox, Input, Select, Textarea) — la source est corrigée ici, le contrat suit là-bas, bump majeur assumé (FR-008).
2. **Les 4 divergences héritées de la clôture 005** : Bouton, `octicon:chevron-down-12`, Checkbox sans usage, Étoile/mail/external-link sans usage (FR-027).
3. **Les 5 trous d'émetteur** constatés pendant la rédaction de cette spec et sa Phase 0 (FR-027a) : la regex de `deriveTextStyles()` qui ne matche jamais la convention Piqueray, l'interligne absent du style généré, les tailles écrites en littéral au lieu d'une liaison de variable, une collection unique par axe de modes, et `loadFontAsync('Inter')` en dur dans `core/emit-figma-script.ts` l. 664 alors que le fichier est en Montserrat.
4. **Le re-pointage des 5 contrats adoptés vers les rôles sémantiques `typography.*`** — ils lient aujourd'hui des primitives directement et les 8 rôles n'ont aucun consommateur (FR-027b).
5. **La promotion des variables créées ici vers `tokens/`** — préparée pour être une copie, pas une traduction (FR-009a).
6. **L'exposition des props sur les masters** — bump mineur, choix de rythme : un composant peut être adopté figé puis gagner ses props en vague suivante (hors périmètre ici).
7. **Le rich-text** (item B1 du document B) — le gras au milieu d'une phrase, 6 textes ; un ajout schéma + émetteur + extracteur.
8. **Nav-item** — soulignement actif et lien de couleur, reportés à l'extraction du futur contrat Header.
9. **Les zéro-usage à trancher** (Checkbox, Étoile, mail, external-link) — gouvernance : nommés ici, tranchés là-bas.
10. **La limite `opacity`, si elle tient** (FR-014) — valeur littérale conservée ici, la limite nommée au rapport pour que la spec suivante la trouve documentée.

Deux legs ne vont **pas** à la spec suivante :

- **Le backlog d'harmonisation chiffré** (FR-013a) — destinataire : une itération d'harmonisation dédiée, où les pixels bougeront en connaissance de cause.
- **La remise à jour du `RAPPORT-CLOTURE.md` de 005** (périmé d'un cycle) — chantier de documentation distinct, déjà nommé en Assumptions.
