# Backlog spec 006 — Figma : styles & structure

Source : sortie de l'audit source Figma mené en clôture de spec `005-figma-source-cleanup` (scan structurel + usage, page par page, fichier live).
Audit du 2026-07-25 — 7 items constatés aujourd'hui, aucun corrigé à ce stade : ce fichier liste, la spec 006 exécute.

1. **Section-header FIXED → FILL + cascade sur 7 titres faits main — effort L**
   - Master : Accroche `2090:2386` + Titre `2090:2387`, actuellement FIXED 1550 → passer en FILL.
   - Puis rejouer l'adoption sur les 7 titres faits main : Coordonnées, Formulaire, Présentation, Texte SEO, Hero, SAV, Réalisations/Bloc en-tête.
   - Cause racine prouvée par exécution en 005/L5 : les enfants FIXED d'une instance ne sont pas redimensionnables via l'API (limite confirmée, pas un bug de script).
   - Attention cascade : le master est instancié ×3 dans Réassurances → mesurer, cycle pixel dédié avant/après sur les 3.

2. **Dé-grouper 11 GROUPs structurels — effort M**
   - SAV ×4 : section / row / wrapper / img-group.
   - Texte SEO ×3 : h2 / p / h3.
   - Produits e-commerce ×1 : Carrousel produits.
   - Footer ×3 : Row / Col 1 / Col 5 (le V6 n'a converti que la racine).
   - Motif : un GROUP n'a aucune sémantique de layout → l'extracteur design-to-code sortira des positions absolues sur ces 11 nœuds tant qu'ils restent en GROUP.

3. **Rich-text — 6 textes à gras par plages — effort L**
   - Carte ×2, Présentation ×2, Hero titre+sous-titre.
   - Un style de texte unique ne peut pas couvrir un gras partiel ; le schéma contrat n'a aujourd'hui aucun modèle rich-text (ranges) — ajout schéma + émetteur + extracteur nécessaire, pas un simple edit Figma (B1, côté repo).

4. **Copie complète de la maquette Accueil posée sur DS · Organisms — effort S**
   - Node `2121:5168`, 1728×5430.
   - Contient du brut non componentisé : Header nav / Footer / Devis en FRAME, Avis Google en GROUP.
   - Décision owner du 2026-07-25 : LAISSER en l'état. Fausse les comptages fichier-entier (+1 écho par élément qu'elle contient).
   - À trancher plus tard : sa suppression exigera une vérification de survie des instances qui en dépendent avant de couper.

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
