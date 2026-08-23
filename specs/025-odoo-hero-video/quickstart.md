# Quickstart — valider 025 (HeroVideo Odoo + bascule home)

Guide de validation exécutable, du poste vierge à la preuve. Détails : [data-model.md](data-model.md), [contracts/](contracts/), décisions [research.md](research.md).

## Prérequis

```bash
# Dans le worktree de la feature (F1 — worktree autosuffisant, constitution)
npm install
npx playwright install chromium

# Docker disponible ; instance JETABLE uniquement (défaut piqueray-odoo-qa).
# INTERDIT : piqueray-odoo-test (8071, owner).

# Pour l'export du poster (une fois) : FIGMA_TOKEN dans l'env (lecture seule).
```

## 1. Portes statiques (sans Docker) — doivent être vertes après implémentation

```bash
npm run build                       # inclut odoo:assets + odoo:derivation
npm run odoo:assets -- --check      # clean partout ; .hero-video__* présents, preuve de déterminisme
npm run odoo:inputs:check           # lock repinné : ds.hero-video dans la fermeture, digest cohérent
npm run odoo:authoring:check        # hero-video.authoring.json complet (fermeture ds.hero-video + ds.button)
npm run odoo:module:check           # 12 snippets ≤ 12 racines ; versions/digest cohérents sur les 12 roots
npm run odoo:derivation:check       # marqueurs ODOO-025-HERO-VIDEO-* appariés 1↔1 au registre
npm run odoo:typecheck
# Sweep dépôt complet :
npm run parity && npm run eval && npm run plugin:check
npx tsx scripts/deterministic-roundtrip.mjs
node scripts/core-browser-check.mjs
npx tsc --noEmit && npx tsc -p tsconfig.build.json
```

**Attendu** : tout vert ; `npm run eval` au N/N vivant. Re-pins autorisés et expliqués par le reçu de clôture : `inputs.lock.json` (fermeture Odoo) et l'entrée HeroVideo de `evals/golden.json` (correctif de l'émetteur `video`) — SC-004.

## 2. Parité visuelle chaîne 1 : emit-html ↔ master Figma (SC-001, seuil 2.0 %)

```bash
npm run extract:figma:visual        # le sujet hero-video (nouveau) doit sortir ≤ 2.0 %
```

**Attendu** : ligne `hero-video` sous le seuil ; triptyque dans `extract/figma/visual-parity/report-assets/`.

## 3. Instance jetable + bloc dans l'éditeur (US2)

```bash
# Démarrer/rafraîchir l'instance QA (compose du projet jetable), puis :
#   odoo -u piqueray_ds  (dans le conteneur — l'addon a bumpé en 19.0.1.9.0)
npm run odoo:page -- home piqueray-odoo-qa
```

Vérifications éditeur (`/odoo/website?enable_editor=1&with_loader=1` — toujours ce lien, pas le lien visiteur) :

- [x] Le snippet « Piqueray · Hero vidéo » existe dans la bibliothèque (groupe content) et se dépose.
- [x] Titre et libellé CTA éditables inline ; enregistrer → rouvrir → les valeurs survivent (SC-002).
- [x] Poster remplaçable via le panneau (dialogue média, IMAGES) ; alt et href CTA réglables.
- [x] Aucune autre part éditable/supprimable ; pas de gras offert sur le titre ; actions root = move/duplicate/remove seulement.
- [x] Dupliquer + réordonner + enregistrer → le bloc rend correctement en autonomie (SC-003).

**Reçu owner (2026-08-23)** : recette éditeur Odoo validée par le propriétaire du projet. Cette validation métier ferme US2/SC-002/SC-003.

## 4. Parité visuelle chaîne 2 : emit-html ↔ Odoo (fidélité de projection)

```bash
# Clip d'abord : la boîte réelle fait foi (refus = le bon nombre est imprimé)
npx tsx integrations/odoo/qa/visual/render-html.mts --subject hero-video-default --measure
# Scénario complet (référence + capture harness /piqueray-harness/hero-video-visual + diff)
npx tsx integrations/odoo/qa/scenarios/hero-video-visual.mts
```

**Attendu** : cible `0.0000 %` ; tout résidu est chiffré ET sa raison déclarée (`plancherDeTolerance`/`raisonDuPlancher`) dans le reçu — jamais un seuil silencieux. Note : les outlines DX `ODOO-PAGE-DEBUG` ne touchent pas le harness ; toute capture pleine page en preuve les nomme dans son reçu.

## 5. La home affiche le bon hero (US1 / SC-001)

Sur la home composée de l'instance jetable :

- [x] Hero = HeroVideo : hauteur 720, full-bleed (pas de gutter), poster en fond, 2 scrims (haut + bas), CTA « En savoir plus ».
- [x] Titre « Le numéro 1 des portes HÖRMANN… » en **Regular 44/48**, sur **une ligne** à la largeur de référence (1728).
- [x] Plus aucun `s_pqr_hero` sur la home (le bloc reste dans l'addon, inutilisé — SC-005 : `ds.hero`/`ds.section-header` non modifiés).

## 6. Seed re-semé (dérivé, jamais source)

```bash
npm run odoo:save                   # snapshot d'APRÈS bascule (règle 024)
npm run odoo:restore && npm run odoo:page -- home piqueray-odoo-qa   # contre-preuve : le pair (descriptor+addon) reconstruit tout
```

## 7. Reçus à archiver

`specs/025-odoo-hero-video/proofs/` : sortie des portes (§1), ligne visual-parity hero-video (§2), reçu du scénario visuel Odoo (§4), captures home avant/après (§5, outlines nommées), plus le Step 0 déjà présent (`step0-audit.md`).
