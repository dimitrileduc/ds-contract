# Journal de section — `ds.coordonnees` v2 (vague 031)

Référence du chantier : `docs/16-mode-emploi-composant-vers-odoo.md` (PARTIE A).
Agent d'exécution, 2026-09-07. L'orchestrateur possède Figma, le digest, le verrou, `npm run eval`.

---

## Contrat 3.0.0 + Odoo (agent, 2026-09-07)

### Entrées reçues

| Entrée | Valeur |
|---|---|
| Set candidat | `Coordonnees`, nodeId **2778:34448**, key **82e06103d9170e82bbdc02fff2d6468686f6a0f7**, page « 031 · Planches de validation », section « 031 · 20 · COORDONNEES » |
| Axe | `Presentation` = Mobile \| Tablette \| Desktop \| Wide (seul axe) |
| Planches | `.page-parity/vague-031/planches-coordonnees/coordonnees-{390,834,1200,1728}.png` — **390×785, 834×873, 1200×665, 1728×680** |
| Dump / proposition | **AUCUN** — pas de `figma-proposals.md`, pas de `.proposed.json`. Toutes les valeurs ci-dessous sont donc soit une décision owner du brief, soit un **relevé au pixel sur les planches** (méthode et chiffres ci-dessous). C'est la seule déviation de méthode par rapport au runbook, et elle est nommée. |

**L'étape 1 du runbook (« classer chaque note de `figma-proposals.md` ») n'a pas pu être exécutée** : il n'y a
pas de liste de travail. Elle est remplacée par le relevé ci-dessous, qui joue le même rôle — chaque valeur du
contrat a une provenance écrite.

### Le relevé qui remplace la proposition (méthode, pour qu'il soit refaisable)

Outils écrits pour l'occasion, dans `.page-parity/` (dossier gitignoré) :
`_bandes-coord.mjs` (bandes d'encre par rangée), `_glyphs.mjs` (colonnes d'encre → glyphes et intervalles),
`_xspan.mjs` (empan horizontal d'une bande), `_rowink.mjs` (profil d'encre rangée par rangée),
`_edge-coord.mjs` (première colonne du fond de panneau), `_crop-coord.mjs` (recadrage).

Ce que le relevé donne, et qui a été **vérifié** contre le rendu Odoo final :

| | Mobile 390 | Tablette 834 | Desktop 1200 | Wide 1728 |
|---|---|---|---|---|
| Bloc | 390 × 785 | 834 × 873 | 1200 × 665 | 1728 × 680 |
| Plan | 390 × 219 (16/9) | 834 × 469 (16/9) | **800** × 665 | **1152** × 680 |
| Panneau | 390 × 566, marge 24 | 834 × 404, marge 48 | **400** × 665, marge 48 | **576** × 680, marge 48 |
| Contenu du panneau | 342 | 738 | 304 | 480 |
| Colonnes d'infos | 1 | **2 × 353** (écart 32) | 1 | 1 |

Le fond du panneau commence exactement à `x = 800` sur la planche 1200 et à `x = 1152` sur la 1728 (mesuré à
trois hauteurs : y = 5, 300, 600) — soit **deux tiers / un tiers** aux deux écrans. En Mobile et Tablette il
atteint `x = 0` : la section n'a **aucune gouttière**, le plan est à fond perdu et c'est le panneau qui porte
ses marges.

Rythme vertical, identique sur les quatre écrans (dérivé des bandes d'encre, puis recalculé depuis le bas et
retombant sur la hauteur exacte de chaque planche à 1 px près) :
accroche → titre **8** · en-tête → infos **32** · groupe → groupe **32** · étiquette → valeur **8** ·
étiquette → icônes **8** · icônes 32 × 32, écart **16**.

*Contrôle du rythme, planche 390 :* boîte d'accroche 243..262 (= 219 du plan + 24 de marge), titre 271..300,
Adresse 333..357, valeur 366..413, Horaires 445..469 … icônes 729..760, + 24 de marge = **784**, pour une
planche de 785. Le même calcul retombe sur 665 en Desktop et 680 en Wide, à l'unité.

### Ce que le contrat porte (par mode)

| Canal | Mobile | Tablette | Desktop | Wide |
|---|---|---|---|---|
| Racine | colonne | colonne | **rangée**, align stretch | **rangée**, align stretch |
| Gouttière de section | 0 | 0 | 0 | 0 |
| Plan | `width: fill`, `grow`, `aspect-ratio 16 / 9`, `object-fit: cover` | idem | idem (rapport neutralisé en CSS) | idem |
| Panneau — marges | `space.24` | `space.48` | `space.48` | `space.48` |
| Panneau — largeur | fill | fill | `size.coordonnees.panneau-desktop` **400** | `size.coordonnees.wrapper` **576** |
| Écart interne du panneau | `space.32` | `space.32` | `space.32` | `space.32` |
| En-tête (écart) | `space.8` | `space.8` | `space.8` | `space.8` |
| Accroche | `typography.overline.*` 14/20 Reg | 14/20 Reg | 16/20 Med | 20/25 Med |
| Titre (`h2`) | `typography.h2.*` 24/30 SemiBold | 24/30 | 32/40 | 40/50 |
| Étiquettes | `typography.h4.*` 20/25 Med | 20/25 | 24/30 | 24/30 |
| Valeurs | `typography.body.*` 16/24 Reg | 16/24 Reg | 18/27 Med | 18/27 Med |
| Grille d'infos | `grid` 1 colonne | **2 colonnes** | 1 | 1 |
| Écart de grille | `space.32` | `space.32` | `space.32` | `space.32` |
| Icônes sociales | 32, écart `space.16` | idem | idem | idem |

**Zéro chiffre tapé à la main dans l'anatomie.** Un seul jeton minté : `size.coordonnees.panneau-desktop`
(400 px, provenance écrite dans son `$description`). `size.coordonnees.wrapper` (576) est réutilisé tel quel.
Un seul littéral : `letter-spacing: 0.15em` sur l'accroche — canal typographique, **hors population** du
`geometry:gate` (`contracts/geometry-gate.interface.md` §2), donc sans entrée au registre, exactement comme
le `3px` de `ds.section-header`. `em` plutôt que `px` parce que la même valeur sert les quatre corps (14, 16,
20) et que la matrice de capacité (ligne 125) donne `letter-spacing` en PIXELS **ou en POURCENT** côté Figma,
CARRY-BOTH ; `em` est l'orthographe CSS du POURCENT. Contrôle : l'encre de « CONTACT » mesure 81 px à 14, 93
à 16 et 115 à 20 — soit 5,79 / 5,81 / 5,75 fois le corps, donc un interlettrage **proportionnel**.

### Odoo

- `views/components.xml` : en-tête **aplati** (`coordonnees-header` / `coordonnees-eyebrow` /
  `coordonnees-title`), plus de `t-call pqr_section_header` ; nouvelle grille `coordonnees-infos` autour des
  quatre groupes ; sauts de ligne réels posés dans Adresse et Horaires (`data-pqr-marks` mis à jour).
  `data-ds-contract-version` → 3.0.0. **Digest non touché.**
- `integrations/odoo/config/coordonnees.authoring.json` : ré-écrit sur le nouveau graphe — 5 contrôles,
  21 parts. Les verdicts qui existaient déjà sont **repris à l'identique** (voir « Bloqué / à trancher », n° 3).
- `integrations/odoo/config/figma-panels.json` : version du panneau → 3.0.0.
- `static/src/css/responsive/coordonnees.pqr.css` : **NOUVEAU**, ajouté au bundle dans `__manifest__.py`
  après `equipe.pqr.css`. Vocabulaire `var(--pqr-…)` uniquement. Aucune typographie (elle vit dans
  `tokens.pqr.css`).
- `static/src/css/odoo-bridge.css`, zone `ODOO-022-COORDONNEES-BRIDGE` : commentaire remis à jour (le plan
  n'a plus de largeur fixe) et **soulignement de repos retiré** des liens adresse/contact.
- `integrations/odoo/authoring/pages/coordonnees-test.json` : **NOUVEAU** (`/coordonnees-test`,
  `coordonnees_test`, `header_overlay: false`), contenu identique aux planches.
- `integrations/odoo/authoring/assets/coordonnees_plan.jpg` : **NOUVEAU** (1152 × 680, JPEG q88, 148 Ko).

### Mesure (bloc contre planche, MÊME boîte, `.page-parity/coordonnees-mesure/`)

Sonde de boîtes d'abord (`.page-parity/capture-coordonnees.mts`, qui refuse une boîte < 10 px et imprime
toutes les boîtes) : **les quatre largeurs tombent au pixel exact sur les planches** — bloc 390×785, 834×873,
1200×665, 1728×680 ; plan 390×219, 834×469, 800×665, 1152×680 ; panneau 390×566, 834×404, 400×665, 576×680 ;
colonnes `342px`, `353px 353px`, `304px`, `480px` ; typographie relevée 14/20·400 → 16/20·500 → 20/25·500
(accroche), 24/30·600 → 32/40·600 → 40/50·600 (titre), 20/25·500 → 24/30·500 (étiquettes), 16/24·400 →
18/27·500 (valeurs) ; icône 32 × 32, ancre 44 × 44, écart 16 ; soulignement `none`.

Les **trois panneaux de chaque triptyque ont été ouverts et portent du contenu** (vérification obligatoire,
leçon spec 017) avant l'annonce de tout pourcentage.

**Panneau seul** (`diff-panneau/`) — c'est le chiffre qui juge ce que le contrat gouverne :

| Largeur | Boîte | Écart | Pixels | Cause du résidu |
|---|---|---|---|---|
| 390 | 390 × 566 | **2,23 %** | 4 918 | lissage des glyphes, rien d'autre |
| 834 | 834 × 404 | **1,46 %** | 4 918 | idem |
| 1200 | 400 × 665 | **1,86 %** | 4 956 | idem |
| 1728 | 576 × 680 | **1,25 %** | 4 915 | idem |

Le **nombre de pixels est constant** (4 915 → 4 956, soit ±0,8 %) alors que la surface va de 161 000 à
337 000 px² : c'est la signature exacte du résidu de lissage décrite au runbook, et la preuve qu'aucun
élément n'est déplacé. Au triptyque, chaque bord de glyphe est franged d'orange/rouge et **rien d'autre** ne
diffère : mêmes retours à la ligne, mêmes positions, mêmes couleurs, mêmes icônes, même grille à deux
colonnes en Tablette.

**Bloc entier** (`diff-bloc/`), plan compris :

| Largeur | Écart bloc | Pixels | dont panneau | dont plan | Cause du résidu du plan |
|---|---|---|---|---|---|
| 390 | **5,68 %** | 17 389 | 4 918 | 12 471 (14,6 % de la surface du plan) | cadrage de la photo (voir ci-dessous) |
| 834 | **8,52 %** | 62 028 | 4 918 | 57 110 (14,6 %) | cadrage de la photo |
| 1200 | **1,01 %** | 8 054 | 4 956 | 3 098 (0,58 %) | cadrage de la photo, quasi confondu |
| 1728 | **0,45 %** | 5 243 | 4 915 | **328 (0,04 %)** | ré-encodage JPEG, rien de plus |

**Cause nommée, une seule, et elle n'est pas un défaut de portage.** Le plan Google est une photo dont
l'ORIGINAL n'est pas accessible à l'agent (aucun accès canevas, aucun dump). Pire : le set candidat dessine
un **cadrage différent par variante** — entre la planche 390 et la 1728, le rapport d'échelle des repères
cartographiques vaut **3,45**, alors qu'un même original recouvert donnerait 2,95 (axe horizontal) ou 3,11
(axe vertical). Aucune règle `object-fit` ne reproduit quatre cadrages depuis une source unique. L'actif
livré est donc le **recadrage de la planche Wide** : il rend le Wide au pixel (0,04 %) et le Desktop presque
(0,58 %), et laisse un écart de pur cadrage en Mobile et Tablette. Le triptyque le montre sans ambiguïté :
les routes et les libellés sont décalés/à une autre échelle, tandis que le panneau, lui, se superpose.

### Édition (`.page-parity/edit-coordonnees.mts`, rédacteur `editor@example.test`, pilote 8087)

- Texte simple sur le titre : édité → **save RPC 200** → relu en public → **remis à l'original**, vérifié
  en public. ✔
- Sauts de ligne des valeurs : intacts après **deux** cycles d'enregistrement
  (`"Du lundi au vendredi\nde 8h00 à 12h00 et\nde 13h30 à 17h00"`). ✔
- **Gras sur le titre : IMPOSSIBLE, et c'est une limite d'Odoo, pas du contrat.** Sonde
  `.page-parity/_probe-gras-coord.mts` : la graisse calculée du `h2` est **600** (jeton `typography.h2.weight`),
  l'éditeur la lit comme « déjà en gras », donc le bouton Gras la bascule en `<span style="font-weight:
  normal">` ; un second appui revient à la base. `<strong>` n'est jamais atteignable. La garde de saisie
  (`data-pqr-marks="strong"`) déplie correctement le `span` à l'enregistrement, donc **rien n'est corrompu** —
  mais le rédacteur n'a pas de gras sur ce titre. **Pré-existant** : la 2.2.0 posait le même `h2` à 600 via
  `ds.section-header` avec le même `allowedMarks`. Jamais nommé jusqu'ici.
- Piège d'outil payé au passage : dans un `contenteditable`, `locator.click()` pose le caret **entre deux
  glyphes** et `End` ne quitte pas la ligne visuelle — le premier essai a écrit « Nos coor 2026données ». La
  page a été recomposée pour restaurer, et le script pose désormais le caret par l'**API Range**. À reprendre
  dans le runbook.

### Faits code-only (chacun commenté avec sa raison dans la feuille)

1. **Le rapport 16/9 disparaît au-delà du seuil bureau** (`aspect-ratio: auto; align-self: stretch;
   height: 100%`). Raison : `declared` n'a aucun canal par mode et `aspect-ratio` n'est pas dans la liste
   blanche de `stylesWhen`. `height: 100 %` plutôt que `align-self` seul, parce qu'une hauteur en pourcentage
   ne participe pas au dimensionnement intrinsèque : une photo plus haute que le panneau ne peut donc pas
   tirer la rangée — c'est bien le panneau qui décide, comme le veut la décision owner.
2. **Le partage deux tiers / un tiers** n'est pas écrit en pourcentage : `flex-basis`/`flex-shrink` sont
   **CARRY-CODE-ONLY** (matrice de capacité ligne 50, le modèle natif ne connaît que FIXED/HUG/FILL). Le
   panneau porte sa largeur FIXE par mode, le plan est en REMPLISSAGE — le contrat le dit ainsi, la feuille
   ajoute seulement le `flex: 0 0 <largeur>` qui empêche le panneau de fléchir.
3. **Zone cliquable des icônes sociales portée à 44 × 44** (WCAG 2.2 AAA 2.5.5 ; le dessin de 32 satisfait
   déjà le AA 2.5.8). Le dessin **n'est pas agrandi** : `padding: 6px` porte la boîte de l'ancre à 44, et
   `margin: -6px` ramène sa boîte de marge à 32 — la seule que le flex mesure. Résultat vérifié au pixel : le
   glyphe reste à x = 24 et l'écart visible reste 16, exactement les bandes de la planche (24-55 | 72-103).
   Les deux zones ne se recouvrent pas (18..61 et 66..109, 4 px d'intervalle).
4. **Affordance de lien reportée au survol et au focus** sur l'adresse et le bloc contact (voir « Déviations
   nommées », n° 1). Raison : le canal d'états d'une part NON-RACINE n'accepte que `color`,
   `background-color`, `border-color` (`PART_STATE_CHANNELS`) — un `text-decoration` d'état ne peut pas vivre
   au contrat.

### Déviations nommées (par rapport à la version 2.2.0)

1. **Les soulignements disparaissent.** La 2.2.0 portait `text-decoration-line: underline` sur
   `AdresseValeur` et `underline: true` sur deux plages de la valeur Contact. Le set candidat **ne souligne
   rien** — vérifié au profil d'encre rangée par rangée sur la planche 1728 : aucune rangée dense sous la
   ligne de base, les 4 à 6 pixels résiduels étant les jambages de « info@piqueray.be ». Retirés du contrat
   **et** du pont. Comme l'adresse, le téléphone et l'e-mail restent de vrais liens, l'affordance est
   reportée au survol/focus (fait code-only n° 4).
2. **`semantics.element` passe de `div` à `section`** — le DOM Odoo est déjà un `<section>`, et c'est ce que
   font toutes les sections v2 de la vague (`ds.reassurances`, `ds.sav`).
3. **Trois valeurs sur quatre portent de VRAIS sauts de ligne**, pas seulement le Contact que le brief nomme
   (voir « À corriger à la source », b).

### À corriger à la source (Figma) — les cinq défauts du brief, plus un

a. L'en-tête de l'ancien master était une **instance de SectionHeader large de 1550** posée dans un panneau
   de 480 : elle débordait, et figeait le titre à 40 px sur les quatre écrans. **Corrigé par l'aplatissement**
   côté contrat ; le master v1 reste à nettoyer.
b. **Les quatre étiquettes et les quatre valeurs étaient du texte libre**, sans style du DS : immobiles d'un
   écran à l'autre. **Corrigé** (rôles H4 et body). *Complément trouvé au relevé, hors brief* : les valeurs
   **Adresse (2 lignes) et Horaires (3 lignes)** portent elles aussi de vrais sauts de ligne, sur les quatre
   écrans, alors que rien ne les y force — en Wide le panneau offre 480 px de contenu et la ligne la plus
   longue de toute la section en mesure **220**. Le brief ne nommait que le Contact. Les trois parts
   déclarent `white-space: pre-line`.
c. La valeur **Contact** contient un vrai saut de ligne (téléphone puis e-mail) → `white-space: pre-line`.
d. L'instance SectionHeader portait un **blanc non lié** à aucune variable, sur le fond bleu clair.
e. Les deux **icônes sociales sont en noir pur brut** (#000000), non liées.

### Questions tranchées seule (à relire — chacune est une décision que je n'avais pas dans le brief)

1. **Retirer les soulignements** (contrat + pont) et **reporter l'affordance de lien au survol/focus**.
   Figma est la référence (règle A3.1) et le candidat ne souligne pas ; mais un lien sans aucun signe
   distinctif au repos est une perte d'usage. Le compromis rend le repos identique à la planche et garde
   l'affordance à l'interaction. *Si l'owner préfère le soulignement au repos, une ligne à changer.*
2. **Le partage Desktop/Wide est modélisé « panneau FIXE + plan en REMPLISSAGE », pas 2/3–1/3 en
   pourcentage.** Les deux planches disent exactement un tiers (400/1200 et 576/1728), donc le RATIO est
   défendable — mais le schéma n'a pas de vocabulaire de pourcentage et `flex-basis` est CARRY-CODE-ONLY.
   Conséquence à connaître : entre 1400 et 1728, le panneau reste à 576 et c'est le plan qui absorbe la
   différence (à 1500 : plan 924, panneau 576). Figma ne dessine pas ces largeurs intermédiaires.
3. **`element: section`** au lieu de `div` (voir déviation n° 2).
4. **`letter-spacing: 0.15em` en `literals`** plutôt qu'un jeton minté par corps : une seule valeur pour
   quatre écrans, aucun jeton neuf, et le canal est hors population du `geometry:gate` (précédent :
   `ds.section-header`).
5. **Les verdicts d'édition existants sont repris à l'identique**, y compris ceux que je crois faux (voir
   « Bloqué », n° 3). Je n'ai pas élargi la surface d'édition ; l'accroche reste `fixed-by-composition` et
   `not-editable`, comme en 2.2.0 — alors que `ds.reassurances`, qui a aplati son en-tête dans la même vague,
   a rendu la sienne éditable. **À aligner ou non : décision owner.**
6. **L'actif du plan est le recadrage de la planche Wide**, faute d'original. C'est ce qui explique 14,6 %
   d'écart sur la zone du plan en Mobile et Tablette. Un original livré par l'orchestrateur ferait tomber ces
   deux chiffres — mais **pas à zéro**, puisque le set dessine quatre cadrages différents.
7. **Le titre par défaut du gabarit passe de « Pourquoi choisir Piqueray ? » à « Nos coordonnées »** — le
   texte du gabarit était un reliquat sans rapport avec la section ; les planches et le contrat disent
   « Nos coordonnées ».

### Bloqué / à trancher (orchestrateur / owner)

1. **`npm run parity` est ROUGE, avec exactement deux constats, tous deux hors de ma portée.**
   - `[figma BEHIND] Coordonnees.Presentation` — *« Contract prop "presentation" has no VARIANT property on
     the Figma set »*. **Le cliché est périmé** : `parity/snapshots/figma-components.json` porte encore
     l'ANCIEN master `2104:2904` / clé `1ff0d29f…` avec **zéro propriété de variante**, alors que le contrat
     ancre désormais `2778:34448` / `82e06103…`, qui a l'axe. Rafraîchir le cliché demande le pont
     figma-console → orchestrateur.
   - `[figma-tokens BEHIND] Primitives/size/coordonnees/panneau-desktop` — le jeton minté n'a pas encore de
     variable Figma. Même classe que les 83 références acquittées de la spec 015 (lecture seule de bout en
     bout). Soit une variable créée au canevas, soit un acquittement dans `parity/baseline.json` —
     **je n'ai touché ni l'un ni l'autre, et je n'ai accepté aucun patch proposé.**
2. **Les liaisons TEXT `Accroche` et `Titre` n'ont pas pu être revérifiées** contre le set candidat : pas de
   dump, pas d'accès canevas. Elles sont reprises de la 2.2.0 (où la propriété existait sur l'ancien master
   mais n'avait **aucun effet** — 0 `componentPropertyReferences` mesuré). Si le set 031 ne les expose pas,
   il faut les passer à `NONE` comme `ds.reassurances` l'a fait.
3. **Le panneau d'édition déclare `not-editable` sur trois valeurs que le QWeb rend éditables.** Les parts
   `coordonnees-address-value`, `coordonnees-hours-value` et `coordonnees-contact-block` portent
   `o_pqr_editable` dans `components.xml` depuis la vague 022, alors que `coordonnees.authoring.json` leur
   donne `not-editable` / `structural`. **Incohérence pré-existante, reprise telle quelle** pour ne pas
   changer la gouvernance sans mandat. C'est exactement le trou nommé au runbook (PARTIE B, point 4) :
   `check-authoring.ts` ne lit jamais ce que le DOM propose réellement.
4. **Le gras est inatteignable sur un titre à 600** (voir « Édition »). Trois issues possibles, toutes hors
   de mon mandat : retirer `strong` des marques autorisées du titre, changer le rôle typographique, ou
   corriger le comportement de la barre d'outils. **Pré-existant, jamais nommé.**
5. **`size.coordonnees.google-map-h` (597 px) n'est plus référencé par aucun contrat** depuis que le plan est
   en remplissage. Jeton orphelin laissé en place (je ne supprime pas un jeton partagé).
6. **Digest et verrou** : non touchés, comme prévu. `odoo:module:check` reste rouge sur la seule ligne
   « les transcriptions de versions concordent avec le lock » (`components.xml : ds.coordonnees 3.0.0 ≠
   lock 2.2.0`) — attendu, c'est le re-pin de l'orchestrateur.
7. **Deux sorties restent périmées à 2.2.0, et aucune porte ne le dit** — les deux sont hors de mon mandat :
   - `catalog/components/coordonnees.json` porte encore **2.2.0**. `npm run catalog` n'est PAS dans
     `npm run build` : c'est le trou n° 3 déjà nommé dans `CLAUDE.md` (« the Hub lies quietly »). Vérifié,
     pas corrigé.
   - `figma-sync/11-coordonnees.js` est le script du canevas pour l'ANCIEN master. Il se régénère par
     `figma:plan`, qui appartient à l'orchestrateur et que le brief m'interdit.

### Portes (2026-09-07)

| Porte | État | Détail |
|---|---|---|
| `npm run build` | **VERT** | tokens → schema → generate → odoo:assets → odoo:figma-links → odoo:derivation, tout passe (86 blocs) |
| `npm run geometry:gate` | **VERT** | 42 contrats · 14 entrées géométriques · 431 références gouvernées · **invisible 0** |
| `npm run odoo:authoring:check` | **VERT** | « Toutes les configs couvrent leur graphe » — 5 contrôles / 21 parts pour coordonnees |
| `npm run odoo:module:check` | **22/23** | seul échec : la ligne du verrou (attendu, orchestrateur) |
| `npm run emitters:check` | **VERT** | « all emitter invariants hold (42 contracts × 2 new emitters + registry) » |
| `npx tsc --noEmit` | **VERT** | aucune sortie |
| `npx tsc -p tsconfig.build.json` | **VERT** | aucune sortie |
| `npm run parity` | **ROUGE (2)** | les deux constats du point « Bloqué » n° 1 — **aucun patch accepté** |
| `npm run eval` | **NON LANCÉ** | interdit à l'agent (worktree partagé) |

### Fichiers touchés

**Contrat et jetons**
- `contracts/coordonnees.contract.json` — 2.2.0 → **3.0.0**
- `tokens/primitives.tokens.json` — **+1** : `size.coordonnees.panneau-desktop` = 400px (bloc `coordonnees`)

**Odoo**
- `integrations/odoo/addons/piqueray_ds/views/components.xml` — bloc `s_pqr_coordonnees` (en-tête aplati,
  grille d'infos, sauts de ligne, `data-ds-contract-version` 3.0.0 ; **digest non touché**)
- `integrations/odoo/addons/piqueray_ds/static/src/css/responsive/coordonnees.pqr.css` — **NOUVEAU**
- `integrations/odoo/addons/piqueray_ds/static/src/css/odoo-bridge.css` — zone `ODOO-022-COORDONNEES-BRIDGE`
- `integrations/odoo/addons/piqueray_ds/__manifest__.py` — +1 entrée de bundle
- `integrations/odoo/config/coordonnees.authoring.json` — ré-écrit sur le graphe 3.0.0
- `integrations/odoo/config/figma-panels.json` — version du panneau
- `integrations/odoo/authoring/pages/coordonnees-test.json` — **NOUVEAU**
- `integrations/odoo/authoring/assets/coordonnees_plan.jpg` — **NOUVEAU**

**Généré par les portes (jamais à la main)**
- `src/components/Coordonnees/*`, `core/samples/*`, `catalog/*`,
  `integrations/odoo/addons/piqueray_ds/static/src/css/generated/*`, `figma-sync/*`,
  `integrations/odoo/derivation-report.json`, `parity/report.json`

**Journal**
- `specs/tiny/vague-031/coordonnees.md` (ce fichier)

**Outils de mesure** (dans `.page-parity/`, gitignoré) : `capture-coordonnees.mts`,
`edit-coordonnees.mts`, `_probe-gras-coord.mts`, `_crop-coord.mjs`, `_bandes-coord.mjs`, `_glyphs.mjs`,
`_xspan.mjs`, `_rowink.mjs`, `_edge-coord.mjs`. Sorties : `.page-parity/coordonnees-mesure/`.

**Non touchés, comme prescrit** : `inputs.lock.json`, `version_guard.js`, `scan-saved-versions.ts`,
`evals/fixtures/odoo-production/version-drift/cases.json`, `evals/golden.json`, `core/` (hors régénération
de `core/samples/` par les portes), `packages/schema`, les `data-ds-graph-digest`, tout autre contrat,
Figma, `piqueray-odoo-test`, `npm run odoo:save`.

## Le plan devient interactif, sans clé d'API (2026-09-08)

**Ce que le panneau disait, et qui était faux.** Le commentaire du panneau portait depuis le
2026-08-19 : « Le plan Google n'a AUCUNE action média : placeholder jusqu'à l'API custom ». La
prémisse était erronée — il n'a jamais fallu de clé. La route
`maps.google.com/maps?q=…&output=embed` est **celle qu'Odoo emploie lui-même** dans son bloc natif
`s_map` (`website/views/snippets/s_map.xml`, ligne 12, vérifié dans le conteneur). Le commentaire est
levé, pas contourné.

**Ce qui est posé.** Le plan passe d'une `<img>` statique à un `<iframe>` d'embed. Le visiteur peut
zoomer, se déplacer, passer en satellite et demander un itinéraire.

**Le point qui décide du rendu**, trouvé en testant trois variantes dans le navigateur avant
d'écrire une ligne : il faut interroger sur le **nom de l'établissement**, pas sur la rue seule.
Avec « Piqueray SRL, Rue Alfred Drèze 7, 4860 Pepinster » on obtient la fiche complète avec le nom,
l'adresse et la **note Google vivante** — 4,7 étoiles et 112 avis le 2026-09-08, là où la maquette est
figée à 4,6 et 94. Avec l'adresse seule, un repère anonyme et rien d'autre. Captures des trois essais
dans `.page-parity/essai-map/`.

**Adaptation d'hôte, nommée.** Un `iframe` est HOST-ONLY : aucun contrat ne porte d'embed, exactement
comme `ds.button` reste un `button` côté React et se projette en `a` côté Odoo. Le contrat n'a pas
bougé de version — sa part `googleMap` décrit toujours une image, et les props `mapUrl` / `mapAlt`
gardent leur sens pour la surface React. Entrée `ODOO-035-COORDONNEES-MAP` au registre d'adaptations.

**L'adresse appartient au rédacteur.** Elle vit sur `data-pqr-map-address` et se règle au panneau
(`pqrSetMapAddress`, champ texte). L'action écrit DEUX choses au même moment, l'attribut et la `src`
de l'iframe : une page Odoo est du HTML figé, écrire seulement l'attribut aurait laissé l'ancienne
carte servie. Aucun JavaScript n'est requis côté visiteur. Le panneau porte aussi le conseil sur le
nom de l'établissement, parce que sans lui le rédacteur perd la fiche sans comprendre pourquoi.

**La boîte ne bouge pas d'un pixel**, mesuré après déploiement : bloc 390×785 · 834×873 · 1200×665 ·
1728×680, plan 390×219 · 834×469 · 800×665 · 1152×680, iframe exactement à la taille de son cadre,
bordure 0. Ce sont les mêmes valeurs qu'avec l'image statique.

**Trois faits code-only dans la feuille, chacun avec sa raison** : `overflow: hidden` parce que
l'embed dessine ses commandes jusqu'au bord ; `border: 0` parce qu'un iframe en porte une par défaut ;
`flex: 1 1 auto` parce que la boîte est en `display: flex` et qu'un iframe s'y réduirait sinon à sa
largeur intrinsèque de 300 px.

### Ce que la revue a trouvé, et ce qui a été corrigé (2026-09-08)

**Une porte rouge, reproduite.** `odoo:derivation:check` refusait l'entrée de registre
`ODOO-035-COORDONNEES-MAP` : elle déclarait un chemin sans marqueurs de zone. Poser des marqueurs a
donné une **zone imbriquée**, que le scanner refuse aussi. La bonne forme était la troisième : cette
adaptation ÉTEND la zone `ODOO-022-COORDONNEES-QWEB`, elle n'en crée pas une nouvelle. L'entrée
imbriquée est retirée et la décision rattachée à la zone qui la contient. Rapport propre, 86 blocs.

**Trois défauts réels dans l'action, tous corrigés.**
1. *Atomicité.* L'attribut d'adresse était écrit AVANT que l'iframe soit résolue. Une page composée
   avant aujourd'hui porte encore l'ancienne `<img>` sous le même `data-pqr-part` : l'attribut
   partait, l'iframe n'existait pas, sortie silencieuse — et le panneau affichait la nouvelle adresse
   pendant que l'écran gardait l'ancienne carte. Le cadre est résolu d'abord, et une page restée à
   l'ancienne image est **remise à niveau sur place**. Limite qui reste : une page jamais rouverte ni
   recomposée garde son image fixe.
2. *Une requête Google par frappe.* Le champ texte du panneau appelle l'action en APERÇU à chaque
   touche : réécrire la `src` à chaque fois, c'est une quarantaine de rechargements pour taper une
   adresse, et un embed sans clé exposé au throttling. En aperçu, seul l'attribut bouge.
3. *URL collée.* Coller le lien « Partager » de Google Maps donnait une carte vide sans message. Les
   valeurs commençant par `http` ou `<` sont refusées sans casser l'état, même grammaire que le CTA.

**Deux durcissements.** `referrerpolicy` passe de `no-referrer-when-downgrade` à `no-referrer` — la
première valeur envoyait l'URL complète de la page à Google. Et le `title` du gabarit est aligné sur
l'adresse par défaut, les deux divergeaient à l'état livré.

**Le commentaire mort de `authoring.js`** disait encore « aucune action média, placeholder jusqu'à
l'API custom ». Levé, comme celui du panneau.

**Ce qui reste ouvert, et appartient à l'owner.**
- **RGPD.** L'embed dépose des cookies Google et transmet l'IP avant toute action du visiteur. Odoo 19
  a la parade native, sans une ligne de code : cocher « Cookies bar » et « Block third-party domains »
  dans les réglages du site. `google.com` est déjà dans la liste bloquée par défaut, Odoo réécrit
  alors la `src` en `data-nocookie-src` et affiche un carton « accepter pour voir ». À décider.
- **Molette et tactile.** L'iframe capte le geste : en Mobile le plan est en tête de section, un
  glissé du doigt y panote la carte au lieu de faire défiler la page. Le calque « cliquer pour
  activer » réglerait ça ET le point RGPD d'un coup. Non fait.
- **La matrice de capacité n'a aucune ligne pour un embed tiers.** Le gabarit et le contrat citent
  « `iframe` est HOST-ONLY (matrice de capacité) » pour un verdict que la matrice ne rend pas — elle
  ne porte HOST-ONLY que pour `<a href>`. C'est exactement le trou nommé par le §IX. À combler.
- **`authoringVersion`** de la config Coordonnées reste à 3.0.0 alors que la politique d'authoring de
  la section gagne une commande.
