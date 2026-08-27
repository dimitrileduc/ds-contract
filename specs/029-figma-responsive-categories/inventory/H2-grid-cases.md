# H2 — Décisions finales de grille et médias

## Ligne orpheline 3 colonnes à 834 px

Décision owner : **Option 1 / A — preserve-track**. La troisième carte conserve la largeur d'une piste et reste alignée à gauche. L'option B, qui étirait cette carte, est rejetée et archivée.

Le seul usage actuel 3 colonnes est Empilé. Les 6 autres usages sont en 2 colonnes et ne changent pas entre A et B.

## Étendue de la carte

Décision owner : **adaptation interne uniquement**. Les 90 lignes démontrent que Fill/Hug, wrap et croissance verticale suffisent : hauteurs de ligne égales, texte entièrement contenu, aucun nouvel état ni variant responsive.

## Nombre de cartes et médias

- Nombre de cartes différent des colonnes : la dernière carte conserve une largeur de piste, cohérente avec l'option A.
- Empilé sans image : l'image est masquée; contenu et CTA restent accessibles.
- Rapport média atypique : crop `IMAGE/FILL` conservé.
- Superposé : un média est requis; sans média, l'auteur choisit Empilé. Aucun fallback silencieux n'est inventé.

Preuves : `proofs/H2-options/odd-count-preserve.png`, `proofs/H2-options/media-edges.png`, `proofs/H2-normalize-content-rows.bridge.json`.
