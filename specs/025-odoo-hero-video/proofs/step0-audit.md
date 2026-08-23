# Step 0 — Audit source Figma hero-video (§VIII)

**Date** : 2026-08-23 · **Fichier** : Piqueray (Copy) `d9FYAUcqdcNtsuaMgLefvJ` · **Lecture seule** (aucune mutation canvas)

## Nœuds relevés
- **Instance home** : `2170:6351` « HeroVideo » — 1728×720, **pleine largeur** (image bord à bord).
- **Master** : `2151:5552` « HeroVideo » — **COMPONENT autonome, `isVariant: false` (0 variante)**, root **FILL** / 720, parent `Container · HeroVideo`.

## Relevé anatomie (master + instance concordent)

| Élément | Figma | Contrat `ds.hero-video` v1.0.0 | Verdict |
|---|---|---|---|
| Titre `Accroche` | TEXT **direct**, Montserrat **Regular**, **44/48**, poids **unique**, couleur **bound** (variable), largeur **FILL** | `accroche` direct, 44/48 Regular, sans SectionHeader | **CONFORME** |
| SectionHeader | **absent** (texte direct) | absent (titre direct) | **CONFORME** |
| Poster | `Background` fill **IMAGE** `dfaa8d2046343398e067aade577f177137d32cce`, `FILL`, présent | plan poster (`backgroundUrl`), placeholder statique déterministe | **CONFORME** — image non purgée |
| Scrim bas `VoileBas` | GRADIENT_LINEAR stops 0.8→α0, 1→α0.5 | `linear-gradient(to bottom, …0 80%, …0.5 100%)` | **CONFORME** |
| Scrim haut `VoileNavigation` | GRADIENT_LINEAR stops 0.75→α0, 1→α0.5 | `linear-gradient(to top, …0 75%, …0.5 100%)` | **CONFORME** |
| Hauteur root | 720 (master FILL largeur) | 720, fluide à 1728 | **CONFORME** |
| CTA `Bouton` | ds.button « En savoir plus », Medium 16/22 | ds.button imbriqué | **CONFORME** |

## Contrôles §VIII (défauts de source)
- **Largeur fixe vs FILL** : master root **FILL** (fluide) — pas de largeur fixe parasite. ✓
- **Hex brut vs variable** : couleur du titre et du CTA **bound à variable** — pas de littéral. ✓
- **Image purgée** : poster `dfaa8d20…` **présent** (`getImageByHash` non nul attendu). ✓
- **Poids mixte parasite** : titre poids **unique** Regular (contraste avec `ds.hero` qui mélange Light 300 + Bold). ✓
- **Variantes** : master **sans variante** — surface simple. ✓

## Verdict
**SOURCE PROPRE — AUCUN REPAIR NÉCESSAIRE. Contrat `ds.hero-video` prouvé FIDÈLE au master.**
US3 (Step 0) satisfaite. Le plan peut partir sur une source vérifiée : le seul chantier restant est la **projection Odoo** (`s_pqr_hero_video`) + la bascule home.

**Confirmation collatérale** : l'instance home est pleine largeur (1728, image bord à bord) → le choix `s_pqr_bleed` (full-bleed) est fidèle à Figma.
