# Contrat — Le périmètre, et comment il se relève

Toutes les exigences disent « du périmètre ». Sans définition opposable, aucune n'est
vérifiable et SC-001/002/005/006 n'ont pas de dénominateur. Ce document le fixe, à partir du
**relevé live du 2026-07-26** — pas d'un audit recopié.

## 1 · Le fichier, tel qu'il est aujourd'hui

`Piqueray (Copy)` — `d9FYAUcqdcNtsuaMgLefvJ`. **6 pages**, pas 5 :

| Page | nodeId | Enfants | Rôle |
|---|---|---|---|
| `Pages` | `210:325` | 9 | les maquettes — **instrument de mesure**, pas objet de gouvernance |
| `----------------------` | `2171:7347` | **0** | séparateur visuel, rien à mesurer |
| `DS · Tokens` | `2051:951` | 3 | planches de doc — objet du seul cycle FR-031 |
| `DS · Atomes` | `2052:1144` | 5 | 26 masters |
| `DS · Molécules` | `2052:1145` | 13 | 13 masters |
| `DS · Organisms` | `2052:1146` | 16 | 16 masters |

`Pages` est **local-only** : `figma.loadAllPagesAsync()` est obligatoire avant d'atteindre
l'un de ses nœuds, et aucun outil MCP côté serveur ne la voit. Seul le pont desktop y accède.

## 2 · Les 55 masters — le dénominateur

Vérifié live : **14 `COMPONENT_SET` + 41 `COMPONENT` autonomes = 55**. C'est le périmètre du
relevé (les 9 maquettes n'y sont pas : elles mesurent, elles ne sont pas mesurées comme source).

| Page | Masters | Dont |
|---|---|---|
| `DS · Atomes` | **26** | `Checkbox`, `piqueray_logo`, `Bouton`, `member-picture` (sets) ; `Input`, `Textarea`, `Select`, `Facebook`, `Instagram`, `Étoile` ; **16 icônes** dont `octicon:chevron-down-12` hors registre |
| `DS · Molécules` | **13** | `Field`, `Accordion-row`, `Tab`, `Carte`, `Section-header`, `Réalisation` (sets) ; `Product-card`, `Member-card`, `Carousel-controls`, `Footer-column`, `Copyright`, `Avantage`, `Nav-item` |
| `DS · Organisms` | **16** | `Réassurances`, `Catégories principales`, `Réalisations`, `Header` (sets) ; `Devis`, `Formulaire`, `Présentation`, `FAQ`, `Coordonnées`, `SAV`, `Texte SEO`, `Hero`, `Équipe`, `Produits e-commerce`, `Footer`, `Hero vidéo` |

**57 propriétés** réparties sur **29** masters ; 26 masters n'en portent aucune (les icônes,
pour l'essentiel) — cohérent avec le « 24 composants à zéro prop » de la prépa, qui est un
sujet de la spec **suivante**, pas de celle-ci.

## 3 · Hors périmètre, explicitement

- **L'intérieur des instances.** Un calque d'instance porte le nom de son master : il n'est
  pas renommable et ne doit pas l'être. Les échos se corrigent à leur **racine**.
- **Le contenu rédactionnel des 9 maquettes** — on ne touche pas au texte des pages.
- **Les groupes vectoriels** `Tracé composé` et `Texte` (internes aux icônes et à
  `piqueray_logo`, et leurs échos dans les instances). Ce ne sont **pas** des nœuds
  structurels : les dé-grouper détruirait les glyphes. Ils apparaissent dans tout scan de
  GROUP et doivent être **exclus par nature**, jamais comptés dans SC-006.
- **Les cartes « Avis Google »** ×5 — aplat de widget tiers sans un seul vecteur, hors
  périmètre par décision owner du 2026-07-25, et objet de la branche
  `006-google-reviews-block` traitée par une autre session. **Cette itération n'y touche pas.**
- **La copie complète de la maquette Accueil** posée sur `DS · Organisms` (`2121:5168`,
  1728 × 5430) — décision owner : laisser en l'état. Elle fausse les comptages fichier-entier
  (+1 écho par élément) ; sa suppression exigerait de vérifier la survie des instances qui en
  dépendent.
- **Les pages elles-mêmes** : l'assemblage des sections n'est pas un composant.
- **Le responsive / un axe mobile** : aucune maquette mobile n'existe dans le fichier — les
  valeurs seraient inventées, pas extraites.

## 4 · Comment il se relève : par POSITION, jamais par nom

`bridge/scan.js` (lecture seule, réutilisé de la 003) classe par **géométrie + signature
structurelle** (bounds absolus, composition des enfants), en résolvant les instances par
`getMainComponentAsync()`. Les noms sont **rapportés à titre documentaire**, jamais utilisés
comme critère.

**Pourquoi** : chercher un défaut de nommage en filtrant par nom, c'est utiliser l'outil
défectueux pour mesurer le défaut. Receipt du dépôt : en 003, le nom `item` recouvrait **×71**
trois molécules distinctes.

## 5 · Les relevés, et ce que chacun gouverne

| Fichier | Publié avant | Gouverne |
|---|---|---|
| `releves/notes-<date>.json` (ouverture) | P1 | le **dénominateur** de SC-001/002/005 : les classes A–F, master par master. Une note qui survit à sa phase est un **échec**, pas un oubli |
| `releves/residus-<date>.json` | P1 | les 4 résidus acquittés (17/20/99/469 px) relevés **avant** le premier geste (FR-024a) |
| `releves/structure-<cible>.json` | chaque geste géométrique (P6) | détection **avant écriture** du piège de l'enfant qui ne suit pas le resize de son parent |
| `releves/styles-<date>.json` | P5 | l'état des 18 styles (liaisons + marqueur) — le reçu de SC-013, qui **ne passe pas** par le compteur de notes |
| `releves/notes-<date>.json` (clôture) | P8 | les compteurs d'arrivée, seule autorité |

Tous sont **committés**. Un compteur de clôture sans son relevé de départ n'est pas un
compteur, c'est une affirmation.

## 6 · Comptes de départ — mesurés le 2026-07-26, à re-confirmer au relevé d'ouverture

| Grandeur | Départ mesuré | Cible |
|---|---|---|
| Masters | **55** (14 sets + 41 composants) | 55, validité 55/55 non régressée |
| Notes classe A (nom ≠ PascalCase) | **36** | 0 |
| Notes classe B (caractères illégaux) | **10** *(spec : 12 — écart à confirmer)* | 0 |
| Notes classe C (propriétés) | **10** occ. / 6 distinctes | 0 |
| Notes classe D (collisions de part) | **22** | 0 |
| Valeurs sans token (E) | **193**, dont 60 sans token de valeur identique | 0 sur les canaux mesurés |
| Styles non dérivés (F) | **41** | ⚠️ **limite nommée** — non atteignable sur canvas (O2) |
| Valeurs de variant non-ASCII | **10** | à trancher (O3) |
| Variables | **62** (Primitives 38 · Semantic 24) | ~+100 |
| Styles de texte liés / marqués | **0/18** et **0/18** | **18/18** et **18/18** |
| Styles de peinture | **0** | inchangé (les couleurs sont des variables) |
| GROUPs structurels résiduels | **1** (`Header + Hero + Cat`, `237:970`) *(backlog : 11 — **périmé**, cf. R10)* | 0 ou nommé (O4) |
| Section-header | **déjà FILL** *(backlog : FIXED 1550 — **périmé**)* | inchangé |
| Cibles de mesure | **43** | verdict N/N |

**Règle de foi** : le relevé frais gagne toujours sur le document daté. Deux compteurs du
backlog du 2026-07-25 sont déjà tombés — les 11 GROUPs et le FIXED de Section-header ont été
traités par le cycle 14 (`d8b0d27`). Aucun chiffre de ce tableau n'est repris sans avoir été
re-mesuré à l'ouverture.
