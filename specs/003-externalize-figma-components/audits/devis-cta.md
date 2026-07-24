# Audit — Section Devis / CTA (T069)

**Date** : 2026-07-24
**Fichier** : `Piqueray (Copy)` (fileKey `d9FYAUcqdcNtsuaMgLefvJ`)
**Méthode** : pont desktop figma-console — 8 occurrences déjà repérées en direct
(IDs transmis en amont), **re-vérifiées live avant construction** (structure, tailles,
fills, texte) — les IDs transmis restaient valides, mais la mesure live fait foi,
jamais la note transmise.

## Usage — localisation (8 des 9 maquettes)

**8 occurrences, structure identique sur les 8** : frame `Devis` (1728×378) → `Container`
(1552×186, auto-layout VERTICAL, `itemSpacing` 32) → 2 enfants (texte titre + instance
`Bouton`). Seule `Contactez-nous` n'a pas de bloc `Devis` standalone (elle a
`Footer + Devis`, composite, hors périmètre de ce bloc — Phase 8 y reviendra
séparément).

| Maquette | nodeId `Devis` (avant) | nodeId maquette (top-level, pour capture) |
|---|---|---|
| À Propos | `258:1933` | `258:1887` |
| Dépannage/SAV | `249:1553` | `249:1510` |
| Portes d'entrée | `237:1012` | `237:969` |
| Motorisation | `237:742` | `237:705` |
| Portes de garage industrielles | `387:757` | `387:720` |
| Portes de garage résidentielles | `230:421` | `230:376` |
| Portes de garage | `226:197` | `226:112` |
| Accueil | `210:411` | `210:326` |

Géométrie interne mesurée identique sur les 8 (titre `x=326,w=900,h=100` ; bouton
`x=624,w=304,h=54` ; container `1552×186` ; devis `1728×378`) — **aucune variante de
taille/disposition nécessaire**, confirmé par mesure sur les 8, pas supposé sur le
gabarit de tâche.

## Deux vraies variations trouvées (une seule était anticipée)

1. **Texte titre** (anticipée) : `Portes de garage industrielles` a
   « *nous nous déplaçons dans vos locaux* » au lieu de « *chez vous* » partout
   ailleurs (logique : clientèle pro vs particulier). → propriété **TEXTE**
   officielle `Titre` sur le master (pas de titre figé en dur).
2. **Fond photo** (**non anticipée, trouvée à l'audit**) : la même maquette
   `Portes de garage industrielles` a aussi un `imageHash` de fond différent
   (`44ddfc3bc4878f0eb33572f27abc6fb8db21222b`) des 7 autres pages
   (`7825ba2d393a21ddc6d94a7bfd05c1f3bde128aa`, identique bit à bit sur les 7 —
   vérifié). Cohérent avec la variation de texte (page pro = visuel pro). Traité
   comme un override d'instance (fill IMAGE direct), même mécanisme que
   `gallery-item` — pas de propriété formelle : Figma n'a pas de type de propriété
   « image » nativement, seul un `INSTANCE_SWAP`/`TEXT`/`BOOLEAN`/`VARIANT` existe.

Bouton : `Property 1=Outline blanc` (`6:135`), props identiques sur les 8
(`Glyphe gauche` `6:99` inactif, `Glyphe droite` `6:104` actif, `Libellé` masqué
« Prendre rendez-vous », taille 304×54) — **déjà gouverné**, baked tel quel dans le
master, aucune propriété exposée côté Devis (le Bouton n'a pas besoin d'être
reconfigurable à ce niveau, aucune des 8 occurrences ne le personnalise).

## Anomalie de métadonnée trouvée et documentée (pas un piège de construction, mais à savoir)

Le texte titre source rapporte `layoutSizingHorizontal: "FILL"` en lecture, alors que
sa largeur réelle mesurée est fixe à 900px (centrée, marges 326px égales de chaque
côté dans un `Container` de 1552px) — **incohérent** : un test isolé (frame scratch
1552px de large, texte neuf avec `layoutSizingHorizontal='FILL'`, supprimé aussitôt)
a confirmé qu'un vrai `FILL` produit bien 1552px, pas 900px. Conclusion pragmatique :
la métadonnée `FILL` de la source ne correspond pas à son rendu réel (900px fixe,
confirmé par capture) — le master est construit avec `layoutSizingHorizontal:'FIXED'`
+ largeur 900 explicite, qui reproduit fidèlement le pixel observé (vérifié par
capture, voir Preuve). Non élucidé plus loin (pas nécessaire pour la fidélité du
résultat) ; noté ici pour ne pas être re-découvert à zéro.

## Récapitulatif du master

| Élément | Détail |
|---|---|
| Nom | `Devis` (nom réel du layer source, pas de renommage) |
| Type | `COMPONENT` (pas de `COMPONENT_SET` — aucune variante nécessaire, confirmé à l'audit) |
| Propriétés | `Titre` (TEXTE, défaut = version « chez vous ») |
| Structure | `Devis` (1728×378, auto-layout VERTICAL, padding 96/96/0/0, fond IMAGE+SOLID 30% noir) → `Container` (1552×186, VERTICAL, `itemSpacing` 32, centré) → `Titre` (texte, 900×100 fixe, Montserrat Regular 40/50, blanc, centré) + instance `Bouton` (304×54, baked) |
| Dépendances | `Bouton` (`6:135`, existant, gouverné) ; fill IMAGE référence l'`imageHash` déjà présent dans le fichier (pas de nouvel asset) |
| Page | `DS · Molécules`, nouvelle section blanche `Devis` (0, 4669), marge interne 40/60/40/40 (gauche/haut/droite/bas — mesurée sur 3 sections existantes, pas supposée) |
| nodeId | `COMPONENT` `2096:2524` ; section `2096:2535` ; propriété `Titre#2096:49` |

## Preuve — 8/8 `diff`, écart accepté (bruit de rendu texte, précédent déjà établi cette spec)

Structure : **0 copie brute restante** (scan post-remplacement), **8/8 instances**
résolvent au nouveau master (`mainId 2096:2524`), **8/8 bbox strictement identiques**
avant/après remplacement (position + taille, vérifié programmatiquement avant toute
capture "after" — même discipline que gallery-item).

Pixel : **0/8 `identical`, 8/8 `diff`**, mesurés en % de la page (jamais accepté sur
un compte brut seul) :

| Maquette | diffCount | % de la page |
|---|---|---|
| Portes de garage industrielles | 76 | 0.00065% |
| Portes de garage résidentielles | 1244 | 0.01095% |
| Portes d'entrée | 1244 | 0.01102% |
| À Propos | 1244 | 0.01214% |
| Accueil | 1244 | 0.01326% |
| Dépannage/SAV | 1244 | 0.01697% |
| Portes de garage | 1304 | 0.01726% |
| Motorisation | 1244 | 0.02160% |

Moyenne **0.013%** (~1 pixel sur 7700), max 0.0216% — **sous la moyenne ET le max déjà
acceptés pour Accordion-row** (0.032% moyenne / 0.050% max, `decisions.md`
2026-07-24). 6 des 7 maquettes au texte par défaut montrent le **même diffCount exact
(1244)** malgré des pages totalement différentes autour — signature d'un écart
déterministe et intrinsèque au contenu (texte+bouton), pas dépendant du contexte de
page. `Portes de garage industrielles` (texte+image différents) montre un diff bien
plus petit (76) et localisé ailleurs.

**Grille d'audit texte appliquée avant d'accepter** (leçon Tab/Accordion-row,
`decisions.md`) : police/taille ✓ identiques (Montserrat Regular 40), couleur ✓
(blanc pur), `lineHeight` ✓ (50px), `letterSpacing` ✓ (0%), `textCase` ✓ (ORIGINAL),
`paragraphSpacing`/`paragraphIndent` ✓ (0, non pertinent — paragraphe unique), gras
par plage ✓ (aucun span, `segCount:1` vérifié sur les 2 variantes de texte),
bordures — non applicable (aucune bordure sur le texte ou le container). **Triptyques
inspectés visuellement au zoom ×5** sur 3/8 maquettes (Accueil, Portes de garage,
Portes de garage industrielles — la plus petite, la plus grande, et le cas
texte+image différents) : aucune différence perceptible à l'œil (même graisse, même
position, même détail de fond). Cause retenue : bruit de rendu sub-pixel inhérent à
la reconstruction d'un nœud texte neuf face à l'original — même cause nommée pour
Accordion-row le même jour, magnitude ici strictement inférieure.

**Preuve** : `proofs/devis-cta/{verdict.json,verdict.md,crops/}` (8 triptyques
avant|après|diff) ; `ledger/devis-cta.json` (2 entrées : 1 texte + 1 image, toutes
`reportee`, `pages:ledger:check` exit 0).
