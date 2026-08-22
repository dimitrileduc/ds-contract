# 023 — Catégories gouvernées : rapport de clôture

**Date** : 2026-08-21 · **Branche** : `023-categories-gouvernees`

Ce rapport clôt la spec **avec deux dettes nommées** (Principe V) — il ne prétend pas
que tout est fait, il dit exactement ce qui l'est et ce qui ne l'est pas.

## 1. État par user story

| US | Portée | État |
|---|---|---|
| **US1 (P1)** — molécule + section extraites de la source nettoyée | Gates A/B/C validés owner ; 2 contrats gouvernés ; régénération ×2 octet-identique | **FAIT** (sauf T029, dette nommée) |
| **US3 (P3)** — différentiel trois-voies + parité visuelle | `parity` 3-axes garde les 2 contrats ; dérive structure/binding prouvée détectée ; sujets visuels rendent | **FAIT à 90 %** — pin de baseline visuelle différée (décision transverse) |
| **US2 (P2)** — couche d'authoring Odoo | Gate D validé ; section gouvernée posable, éditable, gardée ; QA live 18/18 | **FAIT** (2 nuances nommées §4) |

**Deux dettes nommées, portées, pas tues :**
- **T029 — `ds.carte` → v3.0.0** (retrait de `disposition: categorie`). Confirmé par l'owner au
  Gate C, mais la cascade réelle (`reassurances.authoring.json`, config Odoo LIVRÉE ~105 entrées,
  fortement couplée à l'anatomie de `ds.carte`) déborde largement la proposition. `ds.carte` reverté
  à v2.0.1 (base verte). **À reprendre en travail ISOLÉ** — sans rapport avec les catégories.
  Coexistence `ds.carte 2.x` = dette nommée, pas un no-op silencieux. US2/US3 n'en dépendent pas.
- **Pin de baseline parité visuelle (T035/T036)** — l'axe apparence est démontré détecteur, mais
  `--write-baseline` écrase EN BLOC et épinglerait la dérive d'AUTRES specs sous 023. Rafraîchissement
  transverse revu = décision owner.

## 2. US2 — ce qui est livré

`ds.categories-principales` devient la **11ᵉ racine posable** Odoo. La section est gouvernée de bout
en bout :

- **Contrat → surfaces** : 6 blocs marqués `ODOO-023-CATEGORIES-{QWEB,SNIPPET,REPEAT,MEDIA,PANEL,
  BRIDGE}` (registrés dans `adaptation-registry.json`, 57 → 63), CSS contractuelle générée
  (`components.pqr.css`), config d'authoring `categories.authoring.json` (schéma 019) transcrivant
  **les 35 verdicts du Gate D** en **22 controls + 28 parts** — couverture mécanique 100 %.
- **Surface rédacteur** : collection ordonnée (add/remove/reorder, bornes 0..n), édition en ligne
  titre/texte, image + alt au panneau (mécanisme média réutilisé), **libellé + lien de CTA par carte**
  (grammaire `pqrSetCtaHref`, `javascript:` refusé), et un **enum rédacteur de mise en page** :
  sélecteur **2|3 colonnes** (`SetColonnesAction` bascule la classe `--colonnes-3`).
  *(Correction post-revue : l'affirmation initiale « premier enum rédacteur de la couche Odoo »
  était FAUSSE — les avis Google portent déjà un enum rédacteur, la note 1-5 étoiles
  `pqrSetReviewNote`. C'est le premier qui pilote le colonnage, rien de plus.)*
- **Gouvernance** : style FIXÉ par composition, colonnage enum FERMÉ {2,3} (aucune autre valeur
  offrable, wrap natif au-delà du compte), racine fermée + îlots rouverts nommément, actions Odoo
  interdites absentes du chrome.

## 3. Preuves (gates verts + QA live)

- **Portes du dépôt** (T047, sweep complet) : `build`, `parity` (exit 0), `eval` **220/220**,
  `plugin:check`, `deterministic-roundtrip` ×2 octet-identique, `core-browser-check`, `tsc` ×2,
  `geometry:gate` (0 invisible) — verts.
- **Portes Odoo** : `odoo:inputs:check` (20 contrats, digest `55fee8f1…` après le correctif géométrie — cf. §10), `odoo:module:check`
  **18/18**, `odoo:derivation:check` (63 blocs clean), `odoo:authoring:check` (22/22 · 28/28).
- **QA live** (`categories.spec.mts`, instance jetable isolée `pqr023cat`:8079) : **18 constats,
  0 échec, reçu « pass »** — pose ×2 instances, inventaire de panneau strict, rendu par défaut,
  édition titre/texte, **bascule colonnes 2↔3 + 4ᵉ carte à la ligne (3+1, 0 débordement)**, collection
  add/remove/move, CTA gouverné, **section vidée réversible**, isolation, **persistance aux 3 points
  de contrôle** (save 200 · public · réouverture). Reçu : `proofs/us2/categories-functional.json`.

## 4. Défauts trouvés (et corrigés) pendant l'implémentation

1. **`emit-html` ignorait `columns`** — l'override E1 `colonnes:3` n'émettait AUCUNE règle
   (`--colonnes-3` absent de `components.pqr.css` ET de la parité visuelle, l'axe que rend toute
   surface non-React). US1/T021 n'avait patché qu'`emit-react`. Corrigé (`layoutOverrideDecls`,
   miroir d'`emit-react` l.449) ; rayon contenu (seul `ds.categories-principales` porte un override
   `columns`). Sans ce correctif, la bascule de colonnes serait **sans effet visuel**.
2. **Grille vidée inatteignable** — une section sans carte s'effondrait à 0 px et devenait
   insélectionnable au clic → état vide NON réversible, contre le Gate D. Parade éditeur
   `min-height:96px` (`:not(:has([data-pqr-carte]))`, bornée à `.odoo-editor-editable`). **Trouvé par
   la QA live** — exactement ce à quoi elle sert.
3. **`.env.example` happé par `.gitignore`** — la règle large `.env*` excluait le MODÈLE d'env (sans
   secret), absent des worktrees frais → `odoo:module:check` rouge. Recréé + réinclus.

## 5. Limites nommées (là où la capacité est revendiquée)

- ~~**Style superposé non exposé en snippet Odoo**~~ — **LIMITE LEVÉE le 2026-08-22.** Énoncé
  d'origine (exact à sa date) : *« le snippet livre le style EMPILÉ (dominant 5/7 usages, surface
  d'édition complète) ; le superposé reste une variante de CONTRAT ; un snippet superposé serait une
  itération ultérieure. »* L'owner a demandé le style au panneau en session. Livré **sans second
  snippet** — donc sans toucher au plafond `check-module` : **un seul bloc**, un **réglage « Type de
  carte »** sur la section, qui reconstruit chaque carte depuis le blueprint du style visé. Levée
  conditionnée à trois défauts trouvés et corrigés au passage (axe `grow` ambigu, photo non
  proportionnelle, carte superposée sans hauteur — elle rendait 743×149 au lieu de 744×418, donc le
  style était **inutilisable en l'état** au moment où cette limite a été écrite).
  Reçu : [proofs/amendement-2026-08-22.md](proofs/amendement-2026-08-22.md).
- **Dialogue média non piloté** dans le scénario headless — le contrôle image est offert + repose sur
  le mécanisme média réutilisé (patron équipe/réassurances), le dialogue natif n'est pas *cliqué*
  (même choix que Réassurances).
- **Instrument `editability-boundary` non porté aux catégories** — la frontière rédacteur est couverte
  par le scénario fonctionnel ; le banc dédié `pqr-mesure`/`pqr-actions-interdites` (708 l.) reste
  spécifique à la présentation.
- **Contenu long non exercé** par un cas dédié (absorbé par `minmax(0,1fr)` + FILL, non prouvé).
- **Remplacement d'OCTETS d'image via le dialogue média natif non piloté** (renforcé post-revue) —
  le panneau carte offre « Remplacer » (ouvre le dialogue média) + le champ alt ; la QA prouve
  désormais (20/20) la PRÉSENCE des 9 contrôles gouvernés (inventaire strict) ET l'édition RÉELLE de
  l'alt (posé sur l'image). Seul le dialogue média natif lui-même (choix des octets) n'est pas cliqué
  headless — même choix que Réassurances, limite nommée.
- **Comparaison pixel de la pose Odoo jamais chiffrée** (ajouté post-revue) — le scénario US2-1 de la
  spec demandait « rendu comparé à la référence approuvée, delta chiffré et attribué » ; le test livre
  des constats de structure (nb cartes, pistes de grille, 0 débordement), pas un delta pixel. La
  page-banc visuelle `harness_categories_principales_visual` existe mais n'a pas été exploitée.
- **Cas « moins de cartes que de colonnes » non testé** (ajouté post-revue) — l'edge case « 2 cartes en
  3 colonnes, largeur de cellule inchangée » (spec) est coché en tâche mais AUCUN des 18 constats ne le
  couvre. La grille CSS le garantit par construction (`repeat(3, minmax(0,1fr))`), mais ce n'est pas
  prouvé par un cas dédié.

## 6. Portes rouges PRÉ-EXISTANTES — non aggravées (mesuré)

- `odoo:qualification` : **rc=1, 1 échec** (`google-reviews-performance`, reçu 019) — **inchangé**.
- `editability-boundary` : **43/44, 1 échec** (champ stale présentation, `cc6cd0d4`) — **inchangé** ;
  mes changements `authoring.js` sont ADDITIFS, aucune part de présentation touchée.

## 7. Vérification SC-001 → SC-007

| SC | Verdict |
|---|---|
| **SC-001** zéro copie locale, 100 % gouverné | ✔ US1 (Gate B) |
| **SC-002** 7 usages au pixel | ✗ **NON prouvé comme exigé** (corrigé post-revue) — réparation validée À L'ŒIL par l'owner sur canvas live + déviation de structure assumée, mais le chiffrage pixel réclamé (FR-002/012) n'a jamais été produit et les captures archivées sont dégénérées (usages 4/6 sans vraie « après », 3/5 en état défectueux). Mesure réelle : `proofs/revue-sc-002-pixel-reel.md`. Dette de preuve héritée US1. |
| **SC-003** rédacteur bascule 2→3 + 4ᵉ carte, design approuvé | ✔ **US2 QA live** (colonnes 2↔3, wrap 3+1, {2,3} fermé) |
| **SC-004** add/remove/reorder + édition + 3 points de contrôle | ✔ **US2 QA live** (20/20, renforcé post-revue) — add/remove/reorder, édition titre/texte/lien, **image : le panneau carte offre « Remplacer » + le champ alt, et l'alt s'édite réellement et se pose sur l'image**, isolation, persistance aux 3 points. Seul le remplacement d'OCTETS via le dialogue média natif reste non piloté headless (limite nommée §5). |
| **SC-005** différentiel 3-voies + parité visuelle, dérive signalée | ◑ US3 — structure/binding prouvée ; pin baseline visuelle différée |
| **SC-006** portes vertes + régénération octet-identique ×2 | ✔ sweep vert + roundtrip ×2 ; 2 portes pré-existantes rouges inchangées (§6, nommé) |
| **SC-007** 4 gates validés owner, dans l'ordre, tracés | ✔ Gates A/B/C = `gates/gate-{a,b,c}.json` ; Gate D = `contracts/categories.editable-scope.json` (il n'y a PAS de `gate-d.json` — chemin corrigé post-revue) — tous `status: validated`, traces datées `proofs/gate-{a,b,c,d}.md` |

## 8. Re-pins effectués (nommés d'avance, D11)

`evals/golden.json` (US1), `figma-sync/plugin/engine.receipt.json` (édition core `emit-html`),
`inputs.lock.json` (repin, +2 contrats, nouveau digest), `derivation-report.json`,
`adaptation-registry.schema.json` (enum racines +1), `evals/fixtures/.../version-drift/cases.json`
(digest de la fixture « current »). **Pas de 3ᵉ re-pin polaris** (émetteur Figma non touché).

## 9. Trou de journal (nommé, pas comblé en silence)

`MILESTONES.md` saute les specs **011-016** (015 et 017 ont filé leur entrée par-dessus le trou).
L'entrée 023 fait de même — elle documente 023, elle ne comble pas le trou antérieur.

## 10. Revue adversariale (2026-08-21, deux relecteurs indépendants) — trouvailles et corrections

Deux relectures (une « honnêteté/complétude », une « conformité/correction »), chacune ayant
RE-EXÉCUTÉ des portes et RE-MESURÉ les pixels. Verdict croisé : le code Odoo est correct (aucun
bug trouvé), les chiffres exacts, la couverture 22+28 réellement à 100 % — mais **trois surclames
et deux vrais défauts** que ce rapport avait laissés passer. Corrigés :

- **Surclame « premier enum rédacteur » → FAUX.** Les avis Google portent déjà un enum rédacteur
  (`pqrSetReviewNote`). Corrigé au §2, dans MILESTONES et tasks.md.
- **Surclame « SC-002 7 usages au pixel ✔ » → maquillage.** Le Gate B dit lui-même « PAS pixel
  strict, contrôlé à l'œil » ; aucun écart chiffré. Les deux relecteurs (et moi) avons mesuré :
  2 usages sans vraie capture « après » (copie octet-identique), 2 en état défectueux (49 %/47 %),
  3 avec écarts réels jamais chiffrés (0,5 %/0,8 %/14,6 %). SC-002 reclassé ✗ (§7). Mesure honnête :
  `proofs/revue-sc-002-pixel-reel.md`. **Dette de preuve héritée US1.**
- **Surclame « édition d'image ✔ » sans preuve.** SC-004 reclassé ◑ (§7) + limite §5, PUIS
  renforcé : le test exerce désormais l'inventaire du panneau carte (image/alt/lien offerts) et
  l'édition réelle du texte alternatif (le dialogue média natif reste non piloté, limite nommée).
- **Défaut réel corrigé — 2 valeurs de géométrie invisibles.** `carte-categorie` portait
  `top: "32px"`/`right: "32px"` en `declared` (invisibles au différentiel) alors que `{space.32}`
  existe — la classe exacte du défaut « footer 89px » (013). Converties en jeton (`tokens`), rendu
  identique (`var(--space-32)` = 32px), geometry:gate PASS (0 invisible), re-pins golden +
  engine.receipt. La claim du Gate C « un seul littéral géométrique nommé » redevient EXACTE.
  CONSÉQUENCE assumée : le contenu du contrat change → l'empreinte de graphe passe de `ed359775…` à
  **`55fee8f1…`**, re-propagée au lock + `version_guard.js` + `scan-saved-versions.ts` +
  `components.xml` (×11) + fixture eval (même cascade que l'ajout de racine ; toutes les portes
  re-vérifiées vertes).
- **Erreur de chemin** dans ce rapport (`gate-d.json` n'existe pas) → corrigée au §7.

**Défauts SURFACÉS par la revue et NON soldés ici (à ton arbitrage) :** (1) les captures §X du
Gate B sont dégénérées (US1) — un chiffrage propre demande une recapture canvas ; (2) le report de
`ds.carte` v3 est bien tracé mais l'owner n'a pas explicitement acté LE REPORT (seulement le
principe) ; (3) `extract/figma/visual-parity/REPORT.md` (US3, non committé) est resté contaminé par
la dérive injectée — à NE PAS committer en l'état ; (4) l'épinglage global `FIGMA_WS_PORT` promis
« à remettre en clôture » ne l'est pas.

## 11. Passe /simplify (2026-08-22, 4 relecteurs qualité) — nettoyage + un 3ᵉ émetteur réparé

Le code catégories suit de près les patrons établis (Réassurances) — donc peu de dette NEUVE. Deux
actions retenues :

- **Doublon supprimé** (`repeat_action.js`) : 3 fonctions de la collection catégories
  (`cartesCategorieOf`/`normalizeCartesCategorie`/`nextCarteCategorieMarker`) étaient byte-identiques
  aux génériques `cartesOf`/`normalizeCartes`/`nextCarteMarker` (que le bloc couplait déjà via
  CARTE/CARTE_LIST) → réutilisées directement, −15 lignes.
- **3ᵉ émetteur réparé (sur demande owner « corrige »)** : la revue a trouvé que `emit-react-inline`
  laissait tomber `columns` dans son override de layout — MÊME trou que `emit-html` (corrigé plus
  haut), latent (react-inline n'est dans aucune surface livrée). Ajouté `grid-template-columns`
  (miroir de la base l.190/239 et des émetteurs react/html). Re-pin `engine.receipt`. **Et surtout**,
  l'eval E1 `columns-override-grid-only` — qui ne testait QUE `emit-react` alors qu'elle revendique
  CARRY-BOTH — teste désormais **les 3 émetteurs CSS** (react/html/react-inline) : la porte qui aurait
  attrapé les deux ratés est en place.

**Différé (patron établi ou redesign, hors nettoyage)** : la généralisation de `SetColonnesAction`
en `pqrSetVariant` paramétré ; la parade `min-height` généralisée en `data-pqr-collection-root` (le
défaut « grille vidée » est de classe : Équipe/Réassurances ont la même faiblesse latente) ; la
promotion de `insertSnippet`/`_categories-up.mts` (doublons mais patron du dépôt) ; la fabrique
`creerCollection` (les 6 copies de bloc REPEAT). Un shared `layoutDecls` unifiant les 3 émetteurs CSS
reste le correctif d'altitude « profond » qui rendrait impossible le prochain oubli de champ.
