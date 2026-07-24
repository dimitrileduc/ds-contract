# Audit — Icônes sociales + icône étoile inférée (T036)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — `findAll`/`findOne` par position et par
signature, capture visuelle. Lecture seule, aucun geste mutant.

## 1. Icônes sociales — usage par position (les 9 maquettes)

**10 occurrences brutes**, toutes le même groupe `Frame 8` (2 icônes, `itemSpacing`
16, aucun fill sur le conteneur) :

| Contexte | Maquette(s) | nodeId `Frame 8` |
|---|---|---|
| Sidebar « Coordonnées » (widget `Suivez-nous`) | Contactez-nous (1×) | `280:3799` |
| Colonne 5 du Footer (`Col 5`) | les 9 maquettes (1× chacune) | `274:2684` (Contactez-nous), `258:1977` (À Propos), `249:1637` (Dépannage/SAV), `237:1109` (Portes d'entrée), `237:810` (Motorisation), `387:851` (Portes de garage industrielles), `230:465` (Portes de garage résidentielles), `226:241` (Portes de garage), `210:455` (Accueil) |

⚠️ Un piège de nommage rencontré pendant le scan : un **autre** nœud nommé aussi
`Frame 8` existe sur `Contactez-nous` (`274:3666`, logo + nav du header) — sans
rapport, exclu par sa structure (`piqueray` + `Frame 13`, pas 2 icônes). Confirme
la règle projet : jamais classer par nom seul.

**Structure** (échantillon `280:3799`, `Frame 8` de la sidebar) : 2 groupes, chacun
1 `VECTOR` — **Facebook** (`Group 7` → `280:3801`, 32×32) et **Instagram**
(`Group 6` → `280:3803`, 32×32), `itemSpacing` 16. Les deux vecteurs sont déjà
**bindés proprement** : fill → `color/noir-bleute` (`VariableID:5:40`, `#262A2C`,
le même token que les titres — cohérent). **Aucune odeur trouvée ici** — noms
Figma génériques (« Group 6/7 ») à corriger en noms vrais, c'est tout.

## 2. Icône étoile (Avis Google) — **introuvable comme vecteur, trouvaille majeure**

**Constat** : la section « Avis Google » (8 pages, confirmé — absente sur
`Motorisation`, cohérent avec `dag.md`) n'est **pas construite en calques Figma**.
Son contenu (logo Google, note 4.8, étoiles, cartes d'avis avec avatars/texte) est
une **unique image aplatie** :

- Nœud `trustindex-google-reviews-widget`, type `RECTANGLE`, fill `IMAGE`
- **Même `imageHash`** (`ea17d86d938c8ea316f6e9a2f2e12ae3cb90cff2`) vérifié sur 2
  pages distinctes (`Accueil`, `Contactez-nous`) — un **unique screenshot statique
  copié-collé** sur les 8 pages, pas 8 rendus indépendants
- Nom du fichier (`trustindex-*`) = un widget tiers (agrégateur d'avis Google,
  service SaaS) — cohérent avec une **capture d'un embed live**, pas un design
  Figma natif

**Conséquence pour l'étoile** : il n'existe **aucun vecteur à cloner** (contrairement
aux icônes sociales, §1) — l'icône étoile ne peut pas être « extraite », seulement
redessinée de zéro si on la construit (même statut pratique que Checkbox, mais pour
une raison différente : Checkbox n'a **jamais existé** ; l'étoile **existe
visuellement** mais est **piégée dans un raster**, `introuvable` au sens du contrat
FR-009/FR-018).

**Couleur observée** (lecture visuelle de la capture, pas de binding possible sur un
pixel d'image) : doré/orange, visuellement proche de `color/orange` (`#F98A0B`,
déjà utilisé ailleurs pour des accents/icônes — cf. décision Checkbox).

## Anomalie / décision requise — portée plus large que l'icône seule

Le fait que **toute la section Avis Google soit un screenshot d'embed tiers**
dépasse le périmètre de l'icône étoile : ça met en question la construction du
master **Review-card** lui-même (T053, Phase 7) — son contenu source n'est pas
« une carte à nettoyer », c'est une image plate sans structure de carte du tout.
Nommé ici, à la découverte, plutôt que de laisser la Phase 7 buter dessus sans
préavis (principe d'honnêteté).

**Décision requise avant de construire (T038)** — deux axes séparés, proposés à
l'owner :

1. **Icône étoile** : la construire **net-new** (comme Checkbox — un pictogramme
   étoile générique, sans ambiguïté de design), couleur `color/orange`
   (cohérente avec le reste du fichier) — OU la **reporter** (`report-bloc`,
   FR-009/FR-018) faute de source à extraire.
2. **Constat Review-card (pour mémoire, tranché plus tard à T053)** : la section
   entière semble être un embed tiers capturé, pas un design Figma — à confirmer/
   trancher quand la Phase 7 y arrivera, pas une action requise maintenant.

## Récapitulatif des masters à construire (T037-T038)

| Master | Origine | Source | Notes |
|---|---|---|---|
| **Facebook** | extraction (clone, pas copie à main levée) | `280:3801` | vecteur cloné à l'identique, fill déjà bindé `color/noir-bleute` |
| **Instagram** | extraction (clone) | `280:3803` | idem |
| **Icône étoile** | infere → **net-new si accepté** | aucune (raster) | en attente décision owner |
