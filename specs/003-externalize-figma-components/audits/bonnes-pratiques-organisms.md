# Vérification bonnes pratiques Figma — page `DS · Organisms` (2052:1146)

**Date** : 2026-07-25 · **Fichier** : Piqueray (Copy) `d9FYAUcqdcNtsuaMgLefvJ` · **Lecture seule** : aucune modification apportée au fichier Figma. Jumeau de [bonnes-pratiques-molecules.md](bonnes-pratiques-molecules.md).

**Outils** : `figma_lint_design` (382 nœuds, **plafonné à 200 findings** — mes scans structure directs couvrent au-delà), `figma_audit_design_system_report` (fichier entier, déjà couru : 67/100), `figma_analyze_component_set` ×3, `figma_audit_component_accessibility` (Formulaire), scans `figma_execute` lecture seule (bindings, propriétés, calques cachés, contenu du frame Accueil).

**Verdict global : nettement mieux construits que les molécules.** 14 masters massivement composés d'instances (le but de la spec 003), calques cachés tous pilotés par des propriétés BOOLEAN officielles, 11/14 décrits. Un seul master construit à l'ancienne : le **Footer**. La plupart des rouges du lint sont des **propagations des masters molécules** (bordure `#000` de l'Accordion → FAQ ; Poste orange → Équipe ; labels bleu-gris → Formulaire).

## Vue d'ensemble — 14 masters + 1 frame d'assemblage

| Master | Node | Type | Desc | Verdict | L'essentiel |
|---|---|---|---|---|---|
| Devis | `2096:2524` | Simple | ✓ | 🟠 | Seul organism à couleurs en dur (fond `#000` sous l'image, Titre `#FFF`) |
| Formulaire | `2096:2564` | Simple | ✓ | ✅ | 7 Field + 4 Avantage + 3 Bouton ; a11y 93/100 ; labels 2,3:1 (token, hérité) |
| Présentation | `2103:2824` | Simple | ✓ | ✅ | Bouton caché **bindé** au BOOLEAN `Bouton` (propre) |
| FAQ | `2104:2914` | Simple | ✓ (1052 c) | ✅ | 3 Accordion-row + Section-header ; `Ligne 3` BOOLEAN bindé ; bordure `#000` = héritage du master molécule |
| Coordonnées | `2104:2904` | Simple | ✓ | 🟠 | Layout GRID ✓, Facebook/Instagram instanciés ✓ ; `Frame 8`, titres orange 2,2:1, google-map sans note alt |
| SAV | `2108:3105` | Simple | ✓ | ✅ | Rien à signaler |
| Texte SEO | `2108:3123` | Simple | ✓ | ✅ | 3 Accordion-row (variants Petit → bordure `#26282C` correcte héritée) |
| Hero | `2111:3382` | Simple | ✓ | 🟡 | Texte blanc sur photo (prévoir voile côté code) ; frame `Text` nom par défaut |
| Réassurances | `2114:3721` | Set 3 variants | ✓ | ✅ | 13 Carte + 3 Section-header + 4 Bouton ; tokens propres |
| Équipe | `2115:3947` | Simple | **0** | 🟠 | 16 Member-card ; description manquante ; Poste orange = héritage molécule |
| Catégories principales | `2115:4277` | Set 4 variants | **0** | 🟠 | 2 Vector décoratifs absolus non nommés, stroke `#FFF` non bindé ; description manquante |
| Produits e-commerce | `2116:4475` | Simple | **0** | 🟠 | 4 Product-card + Carousel-controls + Section-header ; description manquante |
| Réalisations | `2117:4691` | Set 2 variants | ✓ | 🟡 | 18 Réalisation + Section-header ; valeur de variant « Presentation » sans accent |
| Footer | `2120:4785` | Simple | ✓ | 🔴 | Seul master à l'ancienne : voir ci-dessous |
| Accueil | `2121:5168` | FRAME | — | 🟡 | Assemblage : 8 instances + « Hero video » (sans master, décision actée) + « Avis Google » (screenshot aplati connu) |

## Ce qui est bon (vérifié)

- **14/14 sont de vrais COMPONENT / COMPONENT_SET**, un par section nommée pareil, zéro pièce parasite.
- **Composition par instances massive — le but de la spec 003 atteint** : Formulaire (7 Field, 4 Avantage, 3 Bouton), FAQ (3 Accordion-row, Section-header, Bouton), Réassurances (13 Carte, 3 Section-header, 4 Bouton), Équipe (16 Member-card), Catégories (6 Carte, arrow-right ×2, Bouton), Produits e-commerce (4 Product-card, Carousel-controls, Section-header), Réalisations (18 Réalisation, Section-header), Footer (3 Footer-column, Copyright, piqueray_logo, Bouton), Coordonnées (Facebook, Instagram), Texte SEO (3 Accordion-row).
- **Calques cachés : ZÉRO hack.** Présentation/Bouton caché → bindé `Bouton#2103:55` (BOOLEAN) ; FAQ 3e ligne → bindé `Ligne 3#2104:59`. (Contraste avec Product-card côté molécules.)
- **Auto-layout partout sauf Footer** — Coordonnées utilise même le mode GRID.
- **Descriptions : 11/14** remplies (FAQ 1052 caractères, avec les limites nommées — ex. le lien hypertexte du consentement dans Formulaire).
- **Footer bien bindé côté couleurs** : fond `#26282C` bindé, vecteurs sociaux `#FFF` bindés (le problème du Footer est structurel, pas chromatique).
- **A11y Formulaire : 93/100** (20 paires testées ×3 simulations daltonisme, 0 souci ; manque seulement les notes ARIA).

## 🔴 Le vrai problème : Footer (`2120:4785`)

Le seul master construit à l'ancienne, sur tous les axes en même temps :
- **Root sans auto-layout** (layout NONE, positionnement libre) — unique sur les 26 masters des 2 pages.
- Enfants : `Background` RECTANGLE + `Row` **GROUP** (pas de frame auto-layout) + `Separator` LINE + instance Copyright.
- **Icônes sociales recopiées en vecteurs bruts** : `Frame 8` → `Group 6`/`Group 7` (32×32) au lieu d'instancier les atomes **Facebook/Instagram qui existent** (Coordonnées les instancie, lui). Copie détachée de facto = le périmètre même de la spec 003.
- **Noms par défaut** : Frame 8, Group 6, Group 7, Vector ×2.
- `Separator` `#FFFFFF` non bindé (`color/blanc` existe).

## 🟠 À corriger aussi

- **Devis (`2096:2524`)** : seul organism à couleurs en dur — fond `#000000` (sous l'image) et Titre `#FFFFFF`, non bindés (`color/blanc` existe ; le noir pur n'a pas de token — même question que le `#000` de l'Accordion).
- **3 descriptions manquantes** : Équipe, Catégories principales, Produits e-commerce.
- **Catégories principales (`2115:4277`)** : 2 Vector décoratifs 98×128 en **position absolue**, stroke `#FFFFFF` non bindé, nommés « Vector » (variant Standard). Les flèches `arrow-right`, elles, sont bien des instances.
- **Contraste en contexte (cause racine = tokens, voir rapport molécules)** : labels Field `#9BA4B5` sur le fond bleu-clair `#F4F6FA` du Formulaire = **2,3:1** ×14 (pire que sur blanc) ; titres orange de Coordonnées sur bleu-clair = **2,2:1** ×4 ; Poste orange ×5 dans Équipe. Corriger les tokens corrige tout en cascade.

## 🟡 Mineur

- **Réalisations** : valeur de variant « **Presentation** » sans accent (incohérent avec « Présentation » partout ailleurs).
- **Hero** : texte blanc posé directement sur la photo — le contraste dépend de l'image ; prévoir un voile/scrim côté code (le « 1,0:1 » du lint est un artefact : il ne lit pas les images). Frame `Text` nom par défaut ; `text` vs `Text` incohérent entre masters.
- **Coordonnées** : `Frame 8` (2104:2894) nom par défaut ; `google-map` sans annotation alt.
- **0 propriété exposée** sur Réassurances / Catégories principales / Réalisations / Texte SEO / Équipe / Produits e-commerce — le contenu se pilote en forant dans les instances imbriquées. Choix Figma courant ; à trancher plutôt côté contrats.
- **Accueil (`2121:5168`)** : 2 wrappers 1:1 dont un mal nommé — « Footer + Devis » ne contient QUE l'instance Footer ; « Header nav » enveloppe 1:1 l'instance. « Hero video » sans master = décision mesurée déjà actée (T097-T098) ; « Avis Google » GROUP = screenshot aplati d'un widget tiers, connu.

## Propagations depuis les molécules (pas de nouveaux bugs — corriger les masters molécules corrige ici en cascade)

| Symptôme dans les organisms | Cause racine (rapport molécules) |
|---|---|
| FAQ : bordures `#000000` des 3 Accordion-row (0 override — héritage pur) | Bordure du master Accordion-row variants Grand |
| Texte SEO : bordures `#26282C` correctes (variants Petit) | — (la moitié saine du même master) |
| Équipe : Poste orange 2,4:1 ×5 | Token orange + Member-card |
| Formulaire : labels 2,3:1 ×14 | Token bleu-gris (Field) + fond bleu-clair |
| Réassurances : 13 `img` vides sans note | Placeholders du master Carte |
| Noms « Vector »/« Group 2 » ×~29 dans les instances | Hygiène des masters atomes (Assets) |

## Scores des outils, et le bruit écarté

- **Lint page** : 200 findings (26 critiques) **plafonnés** — la tronque cache p.ex. le no-auto-layout du Footer, couvert par mes scans. Bruit écarté : « Réassurances sans auto-layout » (c'est le SET → normal), « blanc sur blanc » du Hero (texte sur photo), no-text-style ×100 (systémique fichier, voir rapport molécules), default-name ×29/31 hérités des atomes.
- **Audit design-system (fichier entier)** : 67/100 — même lecture que côté molécules (0/60 variables documentées, 15/24 paires AA, choix assumés pénalisés).
- **A11y Formulaire : 93/100.**

## Lot de correction proposé (non appliqué)

1. **Footer** : reconstruire en auto-layout + remplacer Group 6/7 par les instances Facebook/Instagram + binder le Separator sur `color/blanc` + renommer (seul chantier structurel).
2. **Devis** : binder Titre sur `color/blanc` ; trancher le `#000` (token noir pur à créer, ou `color/noir-bleute`).
3. **3 descriptions** (Équipe, Catégories principales, Produits e-commerce).
4. **Catégories principales** : nommer les 2 Vector décoratifs + binder leur stroke.
5. Micro : « Presentation » → « Présentation » (Réalisations), renommer `Frame 8`/`Text`, aplatir/renommer les wrappers d'Accueil.
6. Les contrastes (bleu-gris, orange) se corrigent **au niveau des tokens** — un seul geste pour les 2 pages (décision design).
