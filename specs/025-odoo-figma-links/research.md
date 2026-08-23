# Research — 025 Odoo Figma Links

**Date**: 2026-08-23

## R1. Source de la destination

**Decision**: lire `anchors.figma.fileKey` et `anchors.figma.nodeId` dans le contrat visé.

**Rationale**: ces champs identifient déjà le fichier et le master précis sans ajouter d’URL aux configs/templates Odoo.

**Alternatives considered**: URLs complètes dans XML (duplication interdite) ; fichier seul (imprécis) ; recherche Figma runtime (réseau et non-déterminisme).

## R2. Adresse panneau–contrat

**Decision**: ajouter `integrations/odoo/config/figma-panels.json`, chaque entrée portant un sélecteur et un `componentPath` au format des configs d’authoring.

**Rationale**: les racines se résolvent depuis `rootContract`, mais les enfants exigent le choix explicite de l’occurrence imbriquée. Le chemin exprime ce choix sans recopier l’ancre.

**Alternatives considered**: inférer depuis les noms JS (fragile) ; annoter chaque template d’une URL (duplication) ; polluer les verdicts d’authoring avec un champ sans rapport.

## R3. Surface Odoo

**Decision**: une seule `BaseOptionComponent` et une seule `BuilderAction` génériques ciblent l’union générée des sélecteurs.

**Rationale**: cela évite 19 copies de markup et garantit le même libellé/comportement.

**Alternatives considered**: ligne dans chaque template (répétitif) ; liens directs (diagnostic et désactivation moins contrôlables).

## R4. Ouverture sûre

**Decision**: construire une URL HTTPS avec `URL`, puis `window.open(..., "_blank", "noopener,noreferrer")` pendant le clic, sans navigation de repli.

**Rationale**: préserve l’éditeur, maximise l’ouverture autorisée et coupe `window.opener`.

**Alternatives considered**: `location.href` (quitte l’éditeur) ; ouverture asynchrone (souvent bloquée) ; `_blank` seul (isolation insuffisante).

## R5. Couverture exhaustive

**Decision**: comparer au build le manifeste aux classes `Piqueray*Option` enregistrées, avec fixture de census revue.

**Rationale**: le contrôle bidirectionnel détecte futur panneau oublié et entrée orpheline.

**Alternatives considered**: tester seulement les enfants V1 ; inspection manuelle.

## R6. Références invalides

**Decision**: la qualification échoue, mais le build de développement peut émettre `unavailable` afin d’afficher l’indisponibilité sans destination.

**Rationale**: le runtime ne plante ni ne ment, tandis que la livraison reste bloquée.

**Alternatives considered**: omettre silencieusement ; repli fichier ; erreur runtime bloquant tout l’éditeur.

## R7. Dépendances

**Decision**: réutiliser TypeScript/Node, checks Odoo et Playwright existants, sans dépendance ni SDK Figma.

**Rationale**: tous les mécanismes requis existent localement ; aucun appel Figma n’est nécessaire.

**Alternatives considered**: SDK/REST Figma ; test DOM synthétique seul.
