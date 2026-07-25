# Vérification bonnes pratiques Figma — page `DS · Molécules` (2052:1145)

**Date** : 2026-07-25 · **Fichier** : Piqueray (Copy) `d9FYAUcqdcNtsuaMgLefvJ` · **Lecture seule** : aucune modification apportée au fichier Figma.

**Outils** : `figma_lint_design` (WCAG + design-system + layout, 129 nœuds), `figma_audit_design_system_report` (santé DS fichier entier), `figma_analyze_component_set` ×6, `figma_audit_component_accessibility` ×3 (Field / Tab / Accordion-row), scans structure `figma_execute` lecture seule (bindings, propriétés, calques cachés, bordures par côté).

**Verdict global : base saine, 3 vrais problèmes.** 12 masters propres dans leur structure (vrais composants, auto-layout, composition par instances, props typées), mais Tab a un axe d'état qui ne fait rien, Product-card cache un bouton sans propriété, et l'Accordion a une bordure incohérente hors palette.

## Vue d'ensemble — 12 masters

| Master | Node | Type | Verdict | L'essentiel |
|---|---|---|---|---|
| Field | `2056:1278` | Set 2 variants | ✅ | Exemplaire (a11y 100/100) — seul bémol : contraste du label (token) |
| Accordion-row | `2059:1417` | Set 4 variants | 🔴 | Bordure `#000` hors palette sur Grand, `#26282C` sur Petit, non bindée |
| Tab | `2061:1588` | Set 3 variants | 🔴 | Les 3 variants sont identiques ; `État3` fantôme |
| Carte | `2063:1622` | Set 2 variants | 🟠 | Pas de description ; images placeholder sans note |
| Product-card | `2068:1972` | Simple | 🔴 | Bouton caché sans propriété ; pas de description |
| Member-card | `2074:2072` | Simple | 🟠 | Pas de description ; « Poste » orange 2,4:1 |
| Carousel-controls | `2077:2191` | Simple | 🟠 | Pas de description ; 0 propriété exposée |
| Footer-column | `2079:2246` | Simple | 🟠 | Pas de description ; texte `#FFF` non bindé |
| Copyright | `2086:2330` | Simple | 🟠 | Pas de description ; texte `#FFF` non bindé |
| Avantage | `2088:2350` | Simple | ✅ | Propre — juste la description manquante |
| Section-header | `2090:2397` | Set 2 variants | 🟠 | Pas de description ; largeurs 1550 vs 1552 entre variants |
| Réalisation | `2095:2484` | Set 2 variants | ✅ | Propre (45 instances) ; placeholder `#E0E0E0` sans token |

## Ce qui est bon (vérifié)

- **12/12 sont de vrais COMPONENT / COMPONENT_SET**, un par section nommée pareil, zéro pièce parasite dans les sections.
- **Auto-layout : 100 %** des frames internes à plusieurs enfants. (Les « 6 frames sans auto-layout » du lint = les COMPONENT_SET eux-mêmes → faux positif, un set n'a pas d'auto-layout.)
- **Zéro nom par défaut dans les molécules.** Les 8 « Vector »/« Group 2 » flaggés sont *à l'intérieur* des instances d'atomes → hygiène des masters Assets, pas des molécules.
- **Composition par instances, zéro copie détachée** : Input ×2 (Field), chevron-up/down (Accordion), Bouton ×5 (Carte, Product-card, Carousel ×2, Section-header), member-picture (Member-card), piqueray (Avantage).
- **Propriétés bien typées** : TEXT pour les contenus, `Optionnel` BOOLEAN avec visibilité officiellement liée à la propriété, `Saisie` INSTANCE_SWAP avec 3 valeurs préférées. Aucune erreur de cohérence de variants sur les 6 sets.
- **Couleurs bindées aux variables presque partout** — Field parfait (blanc / bleu-gris / rouge / noir tous bindés).
- **Member-card instancie bien `member-picture`** — plus orphelin (note du 24/07 périmée, mémoire corrigée).

## 🔴 Les 3 vrais problèmes

1. **Tab (`2061:1588`) — l'axe « État » ne fait rien.** Mesuré : 3 variants strictement identiques (souligné bas 2 px `#26282C`, padding 8/0/8/0, hauteur 41, SemiBold). La description du composant dit « l'état sélectionné affiche un soulignement 2px » → le variant **Défaut devrait être sans souligné**. `État3` (nom auto-généré, absent de la description) = variant fantôme à supprimer. Focus absent = porté par le code (doctrine repo), mais le contrat devra le prévoir.
2. **Product-card (`2068:1972`) — calque caché sans propriété.** L'instance `Bouton` est masquée et aucune propriété ne la pilote (`componentPropertyReferences` vide ; le composant n'expose que Titre/Prix). C'est l'affordance officieuse de la leçon Button : soit une propriété BOOLEAN officielle, soit retrait du calque.
3. **Accordion-row (`2059:1417`) — bordure incohérente et hors palette.** Bordure basse 1 px : variants **Grand = `#000000`** (ne correspond à aucune des 13 variables couleur) ; variants **Petit = `#26282C`** (la bonne valeur `color/noir-bleute`). Non bindée sur les 4 variants alors que le token existe.

## 🟠 À corriger aussi

- **8 masters sur 12 sans description** : Carte, Product-card, Member-card, Carousel-controls, Footer-column, Copyright, Avantage, Section-header. (Field 252 c, Accordion 368 c, Tab 298 c, Réalisation 259 c en ont une.)
- **4 couleurs posées en dur** : Footer-column/Texte et Copyright/Texte en `#FFFFFF` alors que `color/blanc` existe (fix trivial) ; les 2 placeholders `#E0E0E0` de Réalisation n'ont pas de token (à trancher : minter ou laisser littéral).
- **Contraste — problème de tokens, pas de construction** : `color/bleu-gris` #9BA4B5 sur blanc = **2,5:1** (labels Field ×4 ; AA exige 4,5:1) ; `color/orange` #F98A0B sur blanc = **2,4:1** (Poste Member-card, Titre Footer-column). Audit fichier : **15/24 paires de tokens passent AA**. Décision design. Nota : les « blanc sur blanc 1,0:1 » du lint (Footer-column, Copyright) = artefact — ces masters vivent sur fond noir dans le site mais n'ont pas de fond de référence sur le canvas.
- **Section-header : 2 px d'écart entre variants** (Standard = 1550, Avec CTA = 1552, modes de redimensionnement différents). La grille du site est à 1550 (l'Accordion aussi).
- **Aucun des 8 text styles appliqué — nulle part** (37 textes en littéraux). Valeurs *conformes* aux styles (Field/Label = SemiBold 20 = « Titre 5 », Carte/Titre = Regular 24 = « Titre 4 »…) mais rien n'est relié : si un style change, rien ne suit. Convention de tout le fichier (l'atome Bouton pareil — son Medium 16 ne correspond même à aucun style). Chantier transverse, pas spécifique molécules.

## 🟡 Mineur

- **Carousel-controls : 0 propriété exposée** — libellés des 2 Bouton non pilotables depuis la molécule.
- **Annotations handoff** : images placeholder sans marque « décoratif » (Carte ×2, Product-card/Image) ; pas de notes clavier/ARIA sur Tab et Accordion.

## Scores des outils, et le bruit écarté

- **Lint page** : 74 findings bruts (9 critiques, 63 warnings, 2 info) → ~2/3 = bruit contextuel trié : « sets sans auto-layout » (normal), « hiérarchie de titres » (sans objet sur des masters isolés), « blanc sur blanc » (fond de canvas), noms par défaut hérités des atomes.
- **Audit design-system (fichier entier)** : **67/100** (needs-work) — pénalise des choix assumés (noms français à plat sans « / », mono-mode, icônes en minuscules). Signal réellement utile : **0/60 variables documentées**, 37/52 composants décrits, paires de contraste ci-dessus.
- **Accessibilité par composant** : Field **100/100**, Accordion-row **93/100**, Tab **55/100** (axe État mort + focus).

## Hors page, vu au passage (contexte, pas d'action ici)

- Les 4 sets à axe nommé `Property 1` (nom par défaut) sont tous sur **Assets** : piqueray_logo `4:14`, **Bouton `6:122`**, Header nav `84:285`, member-picture `274:2389` — le « Property 1=Orange » de l'audit vient de là. Backlog atomes.
- Les noms « Vector »/« Group 2 » dans les masters atomes (Bouton, member-picture, logo) — même backlog.
- Le rangement Molécules/Sections (Footer-column, Copyright, Section-header, Réalisation… posés en « Molécules ») = chantier futur déjà acté par l'owner, volontairement non traité.

## Lot de correction proposé (non appliqué)

~15 min de corrections Figma mécaniques : Tab (Défaut sans souligné + suppression `État3`), Product-card (propriété BOOLEAN ou retrait du bouton caché), bordure Accordion bindée `color/noir-bleute` ×4, 2 textes → `color/blanc`, Section-header 1552→1550, 8 descriptions. Décisions à trancher avant : contrastes bleu-gris/orange, application des text styles, token pour `#E0E0E0`.
