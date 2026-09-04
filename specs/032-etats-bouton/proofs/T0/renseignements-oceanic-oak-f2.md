# Renseignements de `oceanic-oak-f2` — vérifiés un par un

**Reçus le** 2026-09-04, pendant l'attente de leur commit.
**Règle appliquée** : un renseignement d'un autre agent est une piste, pas un
fait. Chacun a été confronté au disque avant d'être porté au plan.

Leur wave (tinyspec `accessibilite-home-odoo`) bumpe **dix contrats de section**.
La vague 032 en bumpe **un seul, `ds.button`**. C'est ce qui explique que deux de
leurs trois avertissements soient exacts chez eux et sans objet chez nous.

---

## ① « Il y a un cinquième miroir manuel : `integrations/odoo/config/figma-panels.json` »

**Exact chez eux. SANS OBJET pour la vague 032.**

Le fichier épingle bien `{id, version}` de contrat, dans
`panels[].componentPath[].contract` — **20 panneaux**, et
`odoo:figma-links:check` les compare en `version-mismatch`. C'est un miroir
manuel réel, qu'aucune note de mémoire ne listait. Le renseignement est bon.

Mais les 20 panneaux sont des **racines de section**, et la chaîne
`componentPath` ne descend jamais jusqu'à l'atome. Contrôle exécuté :

    ds.* cités : accordion-row, carte, carte-categorie, categories-principales,
                 coordonnees, devis, equipe, faq, footer, google-reviews, hero,
                 hero-video, member-card, presentation, produits-ecommerce,
                 reassurances, review-card, sav, texte-seo
    occurrences de « button » (insensible à la casse) : 0

**`ds.button` n'y figure pas.** Dix des dix-neuf identifiants cités sont
précisément ceux que `oceanic-oak-f2` bumpe — d'où leur `version-mismatch`.
Le bump 2.1.0 → 2.2.0 du Bouton n'y touche rien.

**Conséquence pour la vague** : aucune tâche à ajouter. À re-contrôler
malgré tout au moment de T029 par `npm run odoo:figma-links:check`, qui est
déjà dans la liste des six portes Odoo — si le compte de panneaux ou la
profondeur des `componentPath` change d'ici là, la porte le dira.

---

## ② « `odoo:derivation:check` doit être régénéré EN DERNIER »

**Exact comme mécanisme. Déjà tenu par `npm run build` ; le piège ne mord que
sur une relance isolée.**

Vérifié dans le code :

- `scripts/odoo/build-derivation-report.ts:136` — le rapport refuse dès qu'un
  `generatedArtifacts[].status !== 'clean'`, et `:134` compare les octets du
  fichier de sortie. Toute écriture postérieure dans le module le fait rougir.
- `scripts/odoo/build-figma-links.ts:193` — `odoo:figma-links` écrit bien un JS
  **du module** (`…/static/src/js/generated/figma_links.js`). C'est le coupable
  qu'ils décrivent.
- `package.json` → `build` =
  `tokens && schema && generate && odoo:assets && odoo:figma-links && odoo:derivation`
  — **`figma-links` passe AVANT `derivation` à l'intérieur du build.** L'ordre
  est donc déjà correct par construction.

L'ordre de T021–T022 (`build` → `figma:plan` → `emitters:check` → `catalog` →
`golden:update`) reste bon : ni `figma:plan` (qui écrit `figma-sync/`) ni
`catalog` (qui écrit `catalog/`) n'écrivent dans le module.

**Règle à ne pas oublier à l'exécution** : ne JAMAIS relancer `odoo:figma-links`
seul après le build. Si on doit le faire, relancer `odoo:derivation` derrière.

---

## ③ « Trois fixtures d'eval portent des versions de contrat »

**Une sur deux nous concerne.**

- `evals/fixtures/odoo-production/version-drift/cases.json` — **CONCERNE la
  vague 032**, c'est déjà la tâche T027. Leur précision est utile et est
  reprise : seuls les cas `current` et `policy-stale` bougent ;
  **`structure-stale` doit rester faux exprès**, c'est le cas négatif qui prouve
  que la détection ne dit pas oui à tout.
- `evals/fixtures/odoo-production/invalid-path/presentation.authoring.json` —
  **SANS OBJET.** Contrôle exécuté : elle épingle `ds.presentation`,
  `ds.review-card` et `ds.section-header` (versions 4.0.0, 4.2.0, 9.9.9), et
  **zéro** `ds.button`. C'est leur vague qu'elle casse, pas la nôtre.

---

## ④ Conséquence chiffrée sur SC-005, à ne pas rater

Ils annoncent **245/245** après leur lot 1. La ligne de base disqualifiée du
2026-09-04 était à **243/244**.

Le compte d'évaluations de la vague 032 se lira donc contre **leur** total, pas
contre le nôtre :

- T004 rejoué relèvera le `N/N` vif — attendu 245/245, **à lire de la sortie,
  jamais recopié d'ici** ;
- SC-005 exige au moins **ce nombre + 1** après la sortie de quarantaine de
  `focus-not-pressed-browser-probe` (T042/T043) — soit **246** si leur chiffre
  se confirme, davantage si T053 est également tenue.
