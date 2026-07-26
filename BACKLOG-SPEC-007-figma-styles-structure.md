# Backlog spec 007 — Figma : styles & structure

Source : sortie de l'audit source Figma mené en clôture de spec `005-figma-source-cleanup` (scan structurel + usage, page par page, fichier live).
Audit du 2026-07-25 — 7 items constatés à cette date.

**Renuméroté 006 → 007 le 2026-07-26** : ce fichier assignait son périmètre à « spec 006 », qui
avait entre-temps été pris par la spec « Avis Google » (`specs/006-google-reviews-block/`, dont
l'item 1 ci-dessous contredit frontalement le FR-008 — Section-header conservé intact). Décision
owner (`specs/006-google-reviews-block/decisions.md`) : « Avis Google » reste 006 seule, ce backlog
part sur le prochain numéro libre (007). `specs/005-figma-source-cleanup/RAPPORT-CLOTURE.md` a été
amendé en conséquence.

**Statut re-vérifié le 2026-07-26** (pendant le merge 005→006, avant renumérotation) — le cycle 14
« fix-post-cloture » (`d8b0d27`, postérieur à la clôture officielle `cc048a4`, jamais répercuté dans
ce fichier ni dans `RAPPORT-CLOTURE.md`) a en fait déjà traité une partie de cette liste :

1. ✅ **FAIT — Section-header FIXED → FILL + cascade sur 7 titres faits main — effort L**
   - **Vérifié en direct le 2026-07-26** (lecture seule, `figma_execute`) : `Accroche` (`2090:2386`) et
     `Titre` (`2090:2387`) portent tous deux `layoutSizingHorizontal: "FILL"` — le master n'est plus
     FIXED. Le commit `d8b0d27` (« cycle 14 fix-post-cloture », 005) confirme l'adoption des 7 titres,
     avec un verdict **5/9 identical + 4 résidus sub-pixel nommés** (PdE 17 / PdG 20 / AP 99 / CN 469 px,
     classe sub-pixel/AA, triptyques dans `specs/005-figma-source-cleanup/proofs/fix-post-cloture/`).
   - ~~Master : Accroche `2090:2386` + Titre `2090:2387`, actuellement FIXED 1550 → passer en FILL.~~
   - ~~Puis rejouer l'adoption sur les 7 titres faits main : Coordonnées, Formulaire, Présentation, Texte SEO, Hero, SAV, Réalisations/Bloc en-tête.~~
   - Cause racine prouvée par exécution en 005/L5 : les enfants FIXED d'une instance ne sont pas redimensionnables via l'API (limite confirmée, pas un bug de script).
   - Reste potentiellement à trancher (non revérifié ici) : les 4 résidus sub-pixel/AA nommés par le
     cycle 14 sont-ils clos ou à surveiller ? Voir le verdict cité ci-dessus.

2. ⚠️ **PROBABLEMENT FAIT, NON VÉRIFIÉ EN DIRECT — Dé-grouper 11 GROUPs structurels — effort M**
   - Le message du commit `d8b0d27` affirme « dé-GROUP ×11 » fait dans le même cycle 14 que l'item 1
     (vérifié, ci-dessus). Je n'ai relu qu'un seul des deux items en direct sur le fichier vivant
     (l'item 1) ; celui-ci n'a **pas** été spot-vérifié nœud par nœud faute d'ids committés ici — à
     confirmer par qui reprend ce backlog avant de le cocher.
   - SAV ×4 : section / row / wrapper / img-group.
   - Texte SEO ×3 : h2 / p / h3.
   - Produits e-commerce ×1 : Carrousel produits.
   - Footer ×3 : Row / Col 1 / Col 5 (le V6 n'a converti que la racine).
   - Motif : un GROUP n'a aucune sémantique de layout → l'extracteur design-to-code sortira des positions absolues sur ces 11 nœuds tant qu'ils restent en GROUP.

3. **Rich-text — 6 textes à gras par plages — effort L**
   - Carte ×2, Présentation ×2, Hero titre+sous-titre.
   - Un style de texte unique ne peut pas couvrir un gras partiel ; le schéma contrat n'a aujourd'hui aucun modèle rich-text (ranges) — ajout schéma + émetteur + extracteur nécessaire, pas un simple edit Figma (B1, côté repo).

4. ✅ **FAIT (décision inversée après cet audit) — Copie complète de la maquette Accueil posée sur DS · Organisms — effort S**
   - **Vérifié en direct le 2026-07-26** : le node `2121:5168` n'existe plus sur le fichier vivant.
   - ~~Décision owner du 2026-07-25 : LAISSER en l'état.~~ Renversée avant ce constat : le commit de
     clôture `cc048a4` (« ménage-final ») dit explicitement « Archive+copie supprimées » — cette copie
     est partie avec elle. Cohérent avec `specs/006-google-reviews-block/research.md` R25 et le
     compteur T113 (« Accueil-copy deleted ») que ce même audit ignorait encore.
   - Node `2121:5168`, 1728×5430 (état avant suppression). Contenait du brut non componentisé :
     Header nav / Footer / Devis en FRAME, Avis Google en GROUP.

5. **Zéro-usage à trancher (gouvernance) — effort M**
   - Checkbox : contrat v1.0.0, aucun consommateur (constaté dès spec 004).
   - Étoile, mail, external-link : registre icônes 002, zéro usage.
   - Hero vidéo : master componentisé en 005/L5 mais posé SUR la maquette Accueil (pas sur DS · Organisms) → à déplacer en laissant une instance en place, cycle pixel dédié à la bascule.

6. **Styles restants sous seuil (règle owner ≥2 occurrences, 2026-07-25) — effort S**
   - Hero vidéo Regular 44 : ×1 usage.
   - Nav-item Medium 16/lh16 : ×1 usage.
   - 3 textes Field Regular 14/lh AUTO : candidats au lien vers le style Paragraphe lh24 — mais c'est un geste visuel (change le rendu) → à trancher : changer le style, changer les nœuds, ou laisser tel quel.

7. **Nav-item — reporter à l'extraction Spec B — effort S**
   - Propriété Actif ajoutée en 005/L4 (soulignement actif).
   - À la prochaine extraction (Spec B, futur contrat Header) : décider si le soulignement actif et le lien de couleur passent dans le contrat, ou restent Figma-only.
