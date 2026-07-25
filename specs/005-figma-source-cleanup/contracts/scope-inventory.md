# Contrat — Le périmètre, et comment il se relève

Toutes les exigences de cette itération disent « du périmètre » (FR-001, FR-003, FR-004,
FR-007, FR-011, FR-012). Sans définition opposable, aucune n'est vérifiable et SC-002 /
SC-004 / SC-011 n'ont pas de dénominateur.

## 1 · Définition

**Dans le périmètre** :

| Zone | Contenu |
|---|---|
| `DS · Atomes` | 7 masters (4 saisie + 3 sociales) **+ ce qui y sera rapatrié** |
| `DS · Molécules` | 12 masters **+ `Nav-item`** (créé en P6) |
| `DS · Organisms` | 14 masters **+ `Header`** (créé en P6) **+ `Hero vidéo`** (créé en P5) |
| `DS · Tokens` | planche de référence **+ les 2 planches rapatriées** (Typo, Couleurs) |
| `Assets` | 4 sets (`Bouton`, `piqueray_logo`, `Header nav`, `member-picture`), 15 icônes du registre, le master hors registre `octicon:chevron-down-12` (`6:119`), 2 planches — **jusqu'à sa suppression** |
| `Pages` (9 maquettes) | **uniquement** les cadres d'assemblage nommés par les audits (les wrappers 1:1 d'Accueil) et les 2 zones que P5 touche |

**Hors périmètre, explicitement** :

- **L'intérieur des instances.** Un calque d'instance porte le nom de son master : il n'est
  pas renommable et ne doit pas l'être. Les ~29 échos vus dans les organisms se corrigent à
  leur racine (18 masters d'icônes), pas un par un.
- **Le contenu rédactionnel des 9 maquettes** — on ne touche pas au texte des pages.
- **La carte d'avis « Avis Google »** — sortie du périmètre par décision owner du
  2026-07-25 : aplat de widget tiers sans un seul vecteur, traitée à part.
- **Le glyphe hors registre lui-même** — déplacé et marqué, jamais re-swappé (FR-038).
- **Tout gabarit de section ou de page** — on corrige l'existant, on ne construit aucune
  nouvelle structure de gabarit (FR-034).

## 2 · Comment il se relève : par POSITION, jamais par nom

`bridge/scan.js` (lecture seule, réutilisé de la 003) parcourt les pages du périmètre et
classe par **géométrie + signature structurelle** (bounds absolus, composition des enfants),
en résolvant les instances par `getMainComponentAsync()`. Les noms sont **rapportés à titre
documentaire**, jamais utilisés comme critère.

**Pourquoi** : chercher un défaut de nommage en filtrant par nom, c'est utiliser l'outil
défectueux pour mesurer le défaut. Receipt du dépôt : en 003, le nom `item` recouvrait
**×71** trois molécules distinctes. Et un master du périmètre peut être utilisé hors des 9
maquettes — seul un relevé par position le voit.

## 3 · Les relevés, et ce que chacun gouverne

| Fichier | Publié avant | Gouverne |
|---|---|---|
| `releves/perimetre-<date>.json` | L1 (P1) | le dénominateur de **SC-002** : la liste exacte des noms à corriger, master par master. Un nom du relevé qui survit à L1 est un **échec**, pas un oubli |
| `releves/regle-3x-<date>.json` | L2 (P2) | le verdict mécanique **≥3 → gouverner / <3 → laisser et déclarer** (SC-011). Comptage **dans les masters seulement**, jamais dans les instances |
| `releves/structure-<cible>.json` | chaque geste géométrique (P4, P5) | détection **avant écriture** du piège de l'enfant GROUP qui ne suit pas le resize de son parent — déjà responsable d'un arrêt avant écriture en 003 |
| `releves/instances-<master>.json` | chaque déplacement (P6) | la vérification **master par master** que zéro instance est cassée (FR-041, SC-014) — vérifié, jamais supposé |
| pré-diff `bridge/customizations.js` | L5 (P5) | décide si une adoption reste dans le lot 0-px ou **sort en cycle propre** ; pré-remplit `ledger/section-header.json` |

Tous les relevés sont **committés** sous `specs/005-figma-source-cleanup/releves/` : ils
sont l'état de départ mesuré contre lequel les compteurs de clôture se lisent. Un compteur
de clôture sans son relevé de départ n'est pas un compteur, c'est une affirmation.

## 4 · Comptes de départ (audits du 2026-07-25) — à confirmer par le relevé, pas à recopier

| Grandeur | Départ | Cible |
|---|---|---|
| Masters | 52 (37 décrits / **15 vides**) | **55**, **0 sans description** |
| Échos de noms par défaut | ≈69 (racine : 18 masters d'icônes + logo) | **0** dans le périmètre |
| Axes `Property 1` | 4 | **0** |
| Affordances officieuses | 3 (Product-card, Tab `État3`, member-picture) | **0** |
| Styles de texte appliqués | **0 sur 8** (37 textes littéraux côté molécules, ~100 échos côté organisms) | toute valeur ≥3× gouvernée |
| Masters à coquille 88 px | 5 | **0** |
| Masters à racine sans auto-layout | 1 (Footer) | **0** |
| Copies détachées d'atomes existants | 2 (vecteurs sociaux du Footer) | **0** |
| En-têtes de section faits main | 6 (+1 master) = gouverné depuis 7 endroits | **1** |
| Icônes physiques | 18 réparties sur **2 pages** | 18 sur **1 page** |
| Pages du fichier | `Assets` + 4 pages DS + `Pages` | **`Assets` supprimée** |
